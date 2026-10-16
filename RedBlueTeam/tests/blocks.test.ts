import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { mission4Definition } from '../src/scenarios/mission_04_energy_rock';
import {
  decisionShare,
  pointsForTier,
  penaltyForTier,
  btcForScore,
  resolveDecisionCount
} from '../src/engine/core/scoring';

describe('Scoring (poziomy decyzji)', () => {
  it('dzieli maxScore równo na decyzje', () => {
    expect(decisionShare(100, 9)).toBeCloseTo(11.111, 2);
    expect(decisionShare(100, 4)).toBe(25);
  });

  it('punkty i kary zależą tylko od poziomu', () => {
    expect(pointsForTier('ideal', 100, 4)).toBe(25);
    expect(pointsForTier('suboptimal', 100, 4)).toBe(12.5);
    expect(pointsForTier('critical', 100, 4)).toBe(0);

    expect(penaltyForTier('ideal', 100, 4)).toBe(0);
    expect(penaltyForTier('suboptimal', 100, 4)).toBe(12.5);
    expect(penaltyForTier('critical', 100, 4)).toBe(25);
  });

  it('nagroda BTC skaluje się liniowo wynikiem', () => {
    expect(btcForScore(100, 3.79)).toBe(3.79);
    expect(btcForScore(0, 3.79)).toBe(0);
    expect(btcForScore(50, 4)).toBe(2);
  });

  it('liczy decyzje z definicji M4', () => {
    expect(resolveDecisionCount(mission4Definition)).toBe(10);
  });
});

describe('Mission 4: nowy model (etapy + klocki)', () => {
  beforeEach(() => {
    useMissionStore.getState().resetGame();
    useMissionStore.getState().loadMission('mission-4-energy-rock');
  });

  it('definicja ma etapy i dane klocków', () => {
    expect(mission4Definition.stages?.length).toBeGreaterThan(0);
    expect(mission4Definition.blocks).toBeDefined();
    const negotiationTile = mission4Definition.desktopApps.find((t) => t.id === 'negotiation');
    expect(negotiationTile?.componentId).toBe('dialogue_tree');
  });

  it('reportDecision zapisuje decyzję i nie karze wyboru idealnego', () => {
    const store = useMissionStore.getState();
    const scoreBefore = useMissionStore.getState().score;

    store.reportDecision({
      num: 10,
      question: 'Negocjacje z ofiarą:',
      answer: 'MACIE 3 H...',
      tier: 'ideal',
      feedback: 'Twardy limit czasu.'
    });

    const state = useMissionStore.getState();
    expect(state.score).toBe(scoreBefore);
    const choice = state.playerChoices.find((c) => c.num === 10);
    expect(choice?.outcome).toBe('ideal');
  });

  it('błąd krytyczny obniża wynik i otwiera ekran wykrycia', () => {
    const store = useMissionStore.getState();
    store.reportDecision({
      num: 10,
      question: 'Negocjacje z ofiarą:',
      answer: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM',
      tier: 'critical',
      feedback: 'Kapitulacja.'
    });

    const state = useMissionStore.getState();
    expect(state.isDetectedModalOpen).toBe(true);
    expect(state.criticalErrorsCount).toBe(1);
    expect(state.score).toBeLessThan(100);
  });

  it('completeStage(negotiation) odblokowuje raport końcowy po rozmowie meldunkowej', () => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    try {
      const store = useMissionStore.getState();
      store.completeStage('negotiation');
      // Odblokowanie następuje dopiero po przegraniu rozmowy mostkującej (meldunek).
      for (let i = 0; i < 40; i++) {
        vi.runAllTimers();
        const st = useMissionStore.getState();
        if (!st.pendingBridge) break;
        const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
        if (beat) useMissionStore.getState().chooseChatOption(beat.id);
        else break;
      }
      const state = useMissionStore.getState();
      expect(state.unlockedIcons).toContain('debrief_app');
      expect(state.unlockedIcons).toContain('mission_completed');
    } finally {
      vi.useRealTimers();
      __setBridgeDelayForTests(2000);
    }
  });
});
