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
});
