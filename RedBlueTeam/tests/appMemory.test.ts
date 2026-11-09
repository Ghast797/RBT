import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { mission1Definition } from '../src/scenarios/mission_01_petrolog';

/** Zasada silnika: aplikacja pamięta stan po wyjściu na pulpit i ponownym otwarciu. */
describe('Silnik: pamięć stanu aplikacji pulpitu', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(mission1Definition);
    useMissionStore.getState().finishBiosBoot();
  });

  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  it('otwarta aplikacja zostaje zapamiętana po wyjściu na pulpit', () => {
    const store = useMissionStore.getState();
    store.openApp('app_social_intel');
    store.closeApp();

    const st = useMissionStore.getState();
    expect(st.activeApp).toBeNull();
    expect(st.openedApps).toEqual(['app_social_intel']);

    store.openApp('app_social_intel');
    expect(useMissionStore.getState().openedApps).toEqual(['app_social_intel']);
  });

  it('powtórka misji czyści zapamiętane aplikacje i zmienia appRunId', () => {
    const store = useMissionStore.getState();
    store.openApp('app_social_intel');
    const runId = useMissionStore.getState().appRunId;

    store.retryFromChoices();
    const st = useMissionStore.getState();
    expect(st.openedApps).toEqual([]);
    expect(st.completedStages).toEqual([]);
    expect(st.appRunId).not.toBe(runId);
  });

  it('ponowne ukończenie zaliczonego etapu tylko zamyka okno, bez powtórki mostka', () => {
    const store = useMissionStore.getState();
    store.openApp('app_target_petrolog');
    store.completeStage('app_target_petrolog');
    vi.runAllTimers();
    expect(useMissionStore.getState().completedStages).toEqual(['app_target_petrolog']);

    // Gracz wraca do zapamiętanej aplikacji i znów klika „dalej".
    store.openApp('app_target_petrolog');
    const before = useMissionStore.getState();
    store.completeStage('app_target_petrolog');

    const after = useMissionStore.getState();
    expect(after.activeApp).toBeNull();
    expect(after.chatMessages).toBe(before.chatMessages);
    expect(after.chatAvailableChoices).toBe(before.chatAvailableChoices);
    expect(after.pendingBridge).toBe(before.pendingBridge);
    expect(after.completedStages).toEqual(['app_target_petrolog']);
  });
  it('zaliczenie etapu zamkniętej już aplikacji nie zamyka innej, otwartej w międzyczasie', () => {
    const store = useMissionStore.getState();
    store.openApp('app_target_petrolog');
    // Gracz wychodzi krzyżykiem, otwiera inną aplikację; minigra kończy się sama po komunikacie.
    store.closeApp();
    store.openApp('app_osint_search');
    store.completeStage('app_target_petrolog');
    expect(useMissionStore.getState().completedStages).toEqual(['app_target_petrolog']);
    expect(useMissionStore.getState().activeApp).toBe('app_osint_search');

    // Powtórne zaliczenie (etap już zaliczony) też nie rusza cudzej aplikacji.
    store.completeStage('app_target_petrolog');
    expect(useMissionStore.getState().activeApp).toBe('app_osint_search');
  });

  it('zaliczenie etapu własnej, otwartej aplikacji nadal wraca na pulpit', () => {
    const store = useMissionStore.getState();
    store.openApp('app_target_petrolog');
    store.completeStage('app_target_petrolog');
    expect(useMissionStore.getState().activeApp).toBeNull();
  });
});
