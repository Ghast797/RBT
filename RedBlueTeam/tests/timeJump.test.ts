import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { MissionDefinition, StageCompletion } from '../src/engine/types/mission';

/** Misja testowa: jeden etap z zadanym zamknięciem (mostkiem). */
function missionWith(completion: StageCompletion): MissionDefinition {
  return {
    ...mission2Definition,
    stages: [{ id: 'stage_x', appId: 'phishing_app', completion }]
  } as MissionDefinition;
}

const jumpBridge: StageCompletion = {
  conversation: [
    { from: 'byte_master', text: 'CZEKAMY' },
    { from: 'time_jump', label: 'MIJA CZAS…', sublabel: 'CZEKAMY', durationMs: 1000 }
  ],
  unlockIcons: ['vpn_unlocked'],
  badges: { vpn_app: 1 },
  highlightTile: 'vpn_app'
};

describe('Mostek etapu: beat time_jump i unlockDelayMs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Skala czasu testowego: 2000 = realny tempo (opóźnienie odblokowań 1:1).
    __setBridgeDelayForTests(2000);
  });
  afterEach(() => {
    __setBridgeDelayForTests(2000);
    vi.useRealTimers();
  });

  const load = (c: StageCompletion) => {
    useMissionStore.getState().loadMission(missionWith(c));
    useMissionStore.setState({ bootStage: 'desktop', unlockedIcons: [], highlightedTileId: null, notificationBadges: {} });
  };

  it('beat time_jump ustawia przeskok, czeka na endTimeJump, potem odblokowuje z opóźnieniem 3 s i podświetla', () => {
    load(jumpBridge);
    useMissionStore.getState().completeStage('stage_x');
    // kwestia BM (2 s „pisze”), potem przeskok
    vi.advanceTimersByTime(2000);
    let st = useMissionStore.getState();
    expect(st.timeJump).toEqual({ label: 'MIJA CZAS…', sublabel: 'CZEKAMY', durationMs: 1000 });
    expect(st.unlockedIcons).not.toContain('vpn_unlocked');
    // bez endTimeJump nic się nie dzieje, nawet po długim czasie
    vi.advanceTimersByTime(60000);
    expect(useMissionStore.getState().timeJump).not.toBeNull();
    expect(useMissionStore.getState().unlockedIcons).not.toContain('vpn_unlocked');

    useMissionStore.getState().endTimeJump();
    st = useMissionStore.getState();
    expect(st.timeJump).toBeNull();
    expect(st.pendingBridge).toBeNull();
    // opóźnienie 3 s: jeszcze nic
    vi.advanceTimersByTime(2999);
    expect(useMissionStore.getState().unlockedIcons).not.toContain('vpn_unlocked');
    expect(useMissionStore.getState().highlightedTileId).toBeNull();
    vi.advanceTimersByTime(1);
    st = useMissionStore.getState();
    expect(st.unlockedIcons).toContain('vpn_unlocked');
    expect(st.notificationBadges.vpn_app).toBe(1);
    expect(st.highlightedTileId).toBe('vpn_app');
  });

  it('unlockDelayMs nadpisuje domyślne 3 s', () => {
    load({ ...jumpBridge, unlockDelayMs: 500 });
    useMissionStore.getState().completeStage('stage_x');
    vi.advanceTimersByTime(2000);
    useMissionStore.getState().endTimeJump();
    vi.advanceTimersByTime(499);
    expect(useMissionStore.getState().highlightedTileId).toBeNull();
    vi.advanceTimersByTime(1);
    expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');
  });

  it('mostek bez przeskoku odblokowuje od razu (domyślnie 0)', () => {
    load({
      conversation: [{ from: 'byte_master', text: 'DALEJ' }],
      unlockIcons: ['vpn_unlocked'],
      highlightTile: 'vpn_app'
    });
    useMissionStore.getState().completeStage('stage_x');
    vi.advanceTimersByTime(2000);
    const st = useMissionStore.getState();
    expect(st.unlockedIcons).toContain('vpn_unlocked');
    expect(st.highlightedTileId).toBe('vpn_app');
  });

  it('respektuje skalę testową: przy __setBridgeDelayForTests(0) opóźnienie znika', () => {
    __setBridgeDelayForTests(0);
    load(jumpBridge);
    useMissionStore.getState().completeStage('stage_x');
    vi.runAllTimers();
    expect(useMissionStore.getState().timeJump).not.toBeNull();
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');
  });

  it('opóźnienie liczy się od końca przeskoku, nie od końca mostka (kwestie mentora po przeskoku skracają czekanie)', () => {
    load({
      conversation: [
        { from: 'time_jump', label: 'MIJA CZAS…', durationMs: 1000 },
        { from: 'byte_master', text: 'JUŻ CZAS' }
      ],
      unlockIcons: ['vpn_unlocked'],
      badges: { vpn_app: 1 },
      highlightTile: 'vpn_app'
    });
    useMissionStore.getState().completeStage('stage_x');
    expect(useMissionStore.getState().timeJump).not.toBeNull();
    useMissionStore.getState().endTimeJump();
    // kwestia BM „pisze” 2 s po zniknięciu nakładki — kafelek jeszcze nie świeci
    vi.advanceTimersByTime(2000);
    expect(useMissionStore.getState().chatMessages.at(-1)?.text).toBe('JUŻ CZAS');
    expect(useMissionStore.getState().highlightedTileId).toBeNull();
    // do 3 s od końca przeskoku brakuje jeszcze 1 s (a nie kolejnych 3 s)
    vi.advanceTimersByTime(999);
    expect(useMissionStore.getState().highlightedTileId).toBeNull();
    vi.advanceTimersByTime(1);
    expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');
    expect(useMissionStore.getState().unlockedIcons).toContain('vpn_unlocked');
  });

  it('gdy po przeskoku minęło już więcej niż opóźnienie (kwestia gracza), odblokowanie następuje od razu', () => {
    load({
      conversation: [
        { from: 'time_jump', label: 'MIJA CZAS…', durationMs: 1000 },
        { from: 'player', id: 'p1', label: 'DALEJ' }
      ],
      unlockIcons: ['vpn_unlocked'],
      highlightTile: 'vpn_app'
    });
    useMissionStore.getState().completeStage('stage_x');
    useMissionStore.getState().endTimeJump();
    vi.advanceTimersByTime(10000); // gracz długo nie klika
    expect(useMissionStore.getState().highlightedTileId).toBeNull();
    useMissionStore.getState().chooseChatOption('p1');
    expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');
  });

  it('unlockDelayMs też liczy się od końca przeskoku', () => {
    load({
      conversation: [
        { from: 'time_jump', label: 'MIJA CZAS…', durationMs: 1000 },
        { from: 'byte_master', text: 'JUŻ CZAS' }
      ],
      unlockDelayMs: 2500,
      highlightTile: 'vpn_app'
    });
    useMissionStore.getState().completeStage('stage_x');
    useMissionStore.getState().endTimeJump();
    vi.advanceTimersByTime(2499);
    expect(useMissionStore.getState().highlightedTileId).toBeNull();
    vi.advanceTimersByTime(1);
    expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');
  });

  it('beat time_jump z polem clock ustawia zegar systemowy po przeskoku (nie w jego trakcie)', () => {
    load({
      conversation: [{ from: 'time_jump', label: '06:02 — MIJA CZAS…', durationMs: 1000, clock: '06:02' }],
      highlightTile: 'vpn_app'
    });
    expect(useMissionStore.getState().systemTime).toBe('');
    useMissionStore.getState().completeStage('stage_x');
    expect(useMissionStore.getState().timeJump?.clock).toBe('06:02');
    expect(useMissionStore.getState().systemTime).toBe('');
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().systemTime).toBe('06:02');
  });

  it('przeskok bez clock nie zmienia zegara; kolejny przeskok z clock go nadpisuje', () => {
    load({
      conversation: [
        { from: 'time_jump', label: 'MIJA CZAS…', durationMs: 1000 },
        { from: 'time_jump', label: 'I JESZCZE…', durationMs: 1000, clock: '08:12' }
      ]
    });
    useMissionStore.setState({ systemTime: '05:00' });
    useMissionStore.getState().completeStage('stage_x');
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().systemTime).toBe('05:00');
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().systemTime).toBe('08:12');
  });

  it('clockFrom z beatu trafia do przeskoku razem z clock', () => {
    load({
      conversation: [{ from: 'time_jump', durationMs: 1000, clockFrom: '22:15', clock: '06:02' }]
    });
    useMissionStore.getState().completeStage('stage_x');
    expect(useMissionStore.getState().timeJump).toEqual({
      durationMs: 1000,
      clockFrom: '22:15',
      clock: '06:02'
    });
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().systemTime).toBe('06:02');
  });

  it('bez clockFrom start przeskoku to bieżący systemTime; kolejny przeskok startuje od poprzedniego celu', () => {
    load({
      conversation: [
        { from: 'time_jump', durationMs: 1000, clock: '06:02' },
        { from: 'time_jump', durationMs: 1000, clock: '08:12' }
      ]
    });
    useMissionStore.setState({ systemTime: '22:15' });
    useMissionStore.getState().completeStage('stage_x');
    expect(useMissionStore.getState().timeJump?.clockFrom).toBe('22:15');
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().timeJump?.clockFrom).toBe('06:02');
    expect(useMissionStore.getState().timeJump?.clock).toBe('08:12');
  });

  it('bez clockFrom i bez systemTime clockFrom jest puste (komponent bierze wtedy cel minus 3 h)', () => {
    load({ conversation: [{ from: 'time_jump', durationMs: 1000, clock: '08:12' }] });
    useMissionStore.getState().completeStage('stage_x');
    expect(useMissionStore.getState().timeJump?.clockFrom).toBeUndefined();
  });

  it('przeskok bez clock nie przenosi clockFrom (wariant bez cyfr) i nie wymaga etykiet', () => {
    load({ conversation: [{ from: 'time_jump', clockFrom: '22:15' }] });
    useMissionStore.setState({ systemTime: '05:00' });
    useMissionStore.getState().completeStage('stage_x');
    const jump = useMissionStore.getState().timeJump;
    expect(jump).not.toBeNull();
    expect(jump?.clock).toBeUndefined();
    expect(jump?.clockFrom).toBeUndefined();
    expect(jump?.label).toBeUndefined();
  });

  it('powtórka resetuje zegar systemowy', () => {
    for (const reset of ['retryFromChoices', 'retryFromScratch', 'resetGame'] as const) {
      useMissionStore.getState().loadMission(missionWith(jumpBridge));
      useMissionStore.setState({ systemTime: '06:02' });
      useMissionStore.getState()[reset]();
      expect(useMissionStore.getState().systemTime).toBe('');
    }
  });

  it('powtórka czyści trwający przeskok i oczekujące odblokowanie', () => {
    for (const reset of ['retryFromChoices', 'retryFromScratch', 'loadMission', 'resetGame'] as const) {
      load(jumpBridge);
      useMissionStore.getState().completeStage('stage_x');
      vi.advanceTimersByTime(2000);
      expect(useMissionStore.getState().timeJump).not.toBeNull();
      // przeskok trwa
      if (reset === 'loadMission') useMissionStore.getState().loadMission(missionWith(jumpBridge));
      else useMissionStore.getState()[reset]();
      expect(useMissionStore.getState().timeJump).toBeNull();

      // oczekujące odblokowanie (po endTimeJump)
      load(jumpBridge);
      useMissionStore.getState().completeStage('stage_x');
      vi.advanceTimersByTime(2000);
      useMissionStore.getState().endTimeJump();
      if (reset === 'loadMission') useMissionStore.getState().loadMission(missionWith(jumpBridge));
      else useMissionStore.getState()[reset]();
      useMissionStore.setState({ unlockedIcons: [], highlightedTileId: null });
      vi.advanceTimersByTime(10000);
      expect(useMissionStore.getState().highlightedTileId).toBeNull();
      expect(useMissionStore.getState().unlockedIcons).not.toContain('vpn_unlocked');
    }
  });
  it('dwa beaty time_jump pod rząd: licznik rośnie (key nakładki), a mostek kończy się po obu', () => {
    load({
      conversation: [
        { from: 'time_jump', label: 'PIERWSZY', durationMs: 1000 },
        { from: 'time_jump', label: 'DRUGI', durationMs: 1000 }
      ],
      unlockIcons: ['vpn_unlocked']
    });
    const s0 = useMissionStore.getState().timeJumpCount;
    useMissionStore.getState().completeStage('stage_x');
    expect(useMissionStore.getState().timeJump?.label).toBe('PIERWSZY');
    const c1 = useMissionStore.getState().timeJumpCount;
    expect(c1).toBe(s0 + 1);

    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().timeJump?.label).toBe('DRUGI');
    const c2 = useMissionStore.getState().timeJumpCount;
    expect(c2).toBe(c1 + 1);

    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().timeJump).toBeNull();
    expect(useMissionStore.getState().pendingBridge).toBeNull();
  });
});
