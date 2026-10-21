import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { mission2Definition, mission2Apps } from '../src/scenarios/mission_02_carbon_flow';
import { scorm2004, MockSCORM2004 } from '../src/engine/scorm/scorm2004';
import { createMissionCompletionStatement, MockLRS } from '../src/engine/scorm/xapi';

/** Przegrywa rozmowę mostkującą do końca: flushuje kwestie BYTE_MASTERA i klika kwestie gracza. */
function driveBridge() {
  for (let i = 0; i < 40; i++) {
    vi.runAllTimers();
    const st = useMissionStore.getState();
    if (!st.pendingBridge) return;
    const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
    if (beat) useMissionStore.getState().chooseChatOption(beat.id);
    else return;
  }
}

describe('Mission 2: CarbonFlow Scenario & SCORM Engine', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    MockLRS.clear();
  });

  it('correctly loads Mission 2 definition from registry with proper metadata', () => {
    const mission = getMission('mission-2-carbonflow');
    expect(mission).toBeDefined();
    expect(mission?.mission.id).toBe('mission-2-carbonflow');
    expect(mission?.mission.title).toBe('MISJA 2 – CARBONFLOW');
    expect(mission?.mission.targetCompany).toBe('CarbonFlow Inc.');
    expect(mission?.mission.rewardBtc).toBe(2.96);
    expect(mission?.mission.decisionCount).toBe(5);
    expect(mission?.mission.passingScore).toBe(80);
    expect(mission?.step6.choices.length).toBe(5);
    expect(mission?.step6.educationalSlides.length).toBe(5);
  });

  it('resolves mission by alternative keys: "2", "carbonflow", "mission2"', () => {
    expect(getMission('2')?.mission.id).toBe('mission-2-carbonflow');
    expect(getMission('carbonflow')?.mission.id).toBe('mission-2-carbonflow');
    expect(getMission('mission2')?.mission.id).toBe('mission-2-carbonflow');
  });

  it('registers all 5 custom minigames in appRegistry', () => {
    expect(appComponentRegistry['phishing_campaign']).toBeDefined();
    expect(appComponentRegistry['vpn_app']).toBeDefined();
    expect(appComponentRegistry['worm_builder']).toBeDefined();
    expect(appComponentRegistry['phishing_dispatch']).toBeDefined();
    expect(appComponentRegistry['botnet_monitor']).toBeDefined();
  });

  it('loads Mission 2 into useMissionStore and resets state properly', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-2-carbonflow');
    const state = useMissionStore.getState();
    expect(state.activeMission.mission.id).toBe('mission-2-carbonflow');
    expect(state.score).toBe(100);
    expect(state.playerChoices.length).toBe(5);
    expect(state.systemDate).toBe('19.05.2026');
  });

  describe('przepływ z rozmowami mostkującymi (wzorzec B)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      __setBridgeDelayForTests(0);
      scorm2004.reset();
      scorm2004.initialize();
      useMissionStore.getState().loadMission('mission-2-carbonflow');
      useMissionStore.getState().finishBiosBoot();
    });

    afterEach(() => {
      vi.useRealTimers();
      __setBridgeDelayForTests(null);
    });

    it('przechodzi wzorcem B przez 5 decyzji, odblokowuje etapy i składa paczkę SCORM', () => {
      const store = useMissionStore.getState();

      // Start: po BIOSie kafelek phishingu odblokowuje się od razu bez opcji w czacie
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('phishing_app');
      expect(useMissionStore.getState().chatAvailableChoices.length).toBe(0);

      // ETAP 1: Phishing (D1, D2, D3)
      store.reportDecision({
        num: 1,
        question: 'WYBIERZ RODZAJ AKCJI:',
        answer: 'WIRUS 0-DAY',
        tier: 'ideal',
        feedback: 'Wirus 0-day bezbłędnie realizuje cel zlecenia.'
      });
      store.reportDecision({
        num: 2,
        question: 'WYBIERZ SZABLON FORMULARZA:',
        answer: 'POODLE FORMS',
        tier: 'ideal',
        feedback: 'Profesjonalny szablon formularza ankietowego.'
      });
      store.reportDecision({
        num: 3,
        question: 'WYBIERZ TEMAT I PRZYNĘTĘ ANKIETY:',
        answer: 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO',
        tier: 'ideal',
        feedback: 'Przymus w połączeniu z tematem integracji tworzy idealną presję.'
      });
      store.completeStage('phishing_app');

      // Mostek: rozmowa o czarnej liście IP -> odblokowanie VPN
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('vpn_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');

      // ETAP 2: VPN (Flavor / techniczne)
      store.completeStage('vpn_app');

      // Mostek: rozmowa o wirusie 0-day -> odblokowanie Bazy Wirusów
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('virus_database_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('virus_database');

      // ETAP 3: Baza Wirusów (D4)
      store.reportDecision({
        num: 4,
        question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
        answer: 'ROBAK',
        tier: 'ideal',
        feedback: 'Robak samodzielnie powiela się w sieci i formuje botnet.'
      });
      store.completeStage('virus_database');

      // Mostek: rozmowa o domenie firmowej -> odblokowanie Wysyłki Phishingu
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_dispatch_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('phishing_dispatch');

      // ETAP 4: Wysyłka Phishingu (D5)
      store.reportDecision({
        num: 5,
        question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
        answer: 'KADRY@CARDONFLOW.COM',
        tier: 'ideal',
        feedback: "Typosquatting (podmiana 'b' na 'd' w nazwie domeny)."
      });
      store.completeStage('phishing_dispatch');

      // Mostek: oczekiwanie na aktywację -> odblokowanie Monitora Botnetu
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('botnet_monitor_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('botnet_monitor');

      // ETAP 5: Monitor Botnetu
      store.completeStage('botnet_monitor');

      // Mostek końcowy: pochwała Byte_Mastera -> odblokowanie Debriefu
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('mission_completed');
      expect(useMissionStore.getState().highlightedTileId).toBe('debrief_app');

      // Stan końcowy
      const finalState = useMissionStore.getState();
      expect(finalState.score).toBe(100);
      expect(finalState.btcReward).toBe(2.96);
      expect(finalState.criticalErrorsCount).toBe(0);
      expect(finalState.playerChoices.every((c) => c.isCorrect)).toBe(true);

      // Zapis do SCORM 2004
      const result = store.submitScormAndExit();
      expect(result.success).toBe(true);
      const api = scorm2004.getApi() as MockSCORM2004;
      expect(api.GetValue('cmi.success_status')).toBe('passed');
      expect(api.GetValue('cmi.completion_status')).toBe('completed');
      expect(api.GetValue('cmi.score.raw')).toBe('100');
    });
  });
});
