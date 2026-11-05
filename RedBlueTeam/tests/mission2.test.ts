import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { mission2Definition, mission2Apps } from '../src/scenarios/mission_02_carbon_flow';
import { scorm2004, MockSCORM2004 } from '../src/engine/scorm/scorm2004';
import { createMissionCompletionStatement, MockLRS } from '../src/engine/scorm/xapi';
import {
  phishingCampaignConfig,
  vpnConfig,
  wormBuilderConfig,
  phishingDispatchConfig
} from '../src/scenarios/mission_02_carbon_flow/stages';

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

  describe('spójność danych', () => {
    const def = mission2Definition;
    const stages = def.stages ?? [];
    const tileIds = def.desktopApps.map((t) => t.id);

    it('każdy appId etapu istnieje w desktopApps, a komponent kafelka jest zarejestrowany', () => {
      stages.forEach((st) => expect(tileIds).toContain(st.appId));
      def.desktopApps.forEach((t) =>
        expect(appComponentRegistry[t.componentId] ?? mission2Apps[t.componentId]).toBeDefined()
      );
    });

    it('kolejność etapów to VR: phishing -> VPN -> wirus -> wysyłka -> botnet', () => {
      expect(stages.map((s) => s.appId)).toEqual([
        'phishing_app',
        'vpn_app',
        'virus_database',
        'phishing_dispatch',
        'botnet_monitor'
      ]);
      expect(stages.map((s) => s.decisions)).toEqual([[1, 2, 3], [], [4], [5], []]);
    });

    it('każda decyzja 1..N jest w dokładnie jednym etapie i w step6.choices', () => {
      const n = def.mission.decisionCount;
      expect(n).toBe(5);
      for (let k = 1; k <= n; k++) {
        expect(stages.filter((s) => s.decisions.includes(k)).length).toBe(1);
        expect(def.step6.choices.filter((c) => c.num === k).length).toBe(1);
      }
      expect(def.step6.choices.length).toBe(n);
      expect(def.step6.summary.perfectChoices).toBe(n);
    });

    it('raport: pytania identyczne z ekranem, każda decyzja ma lekcje atak/obrona', () => {
      const questions: Record<number, string> = {
        1: phishingCampaignConfig.action.question,
        2: phishingCampaignConfig.template.question,
        3: phishingCampaignConfig.topic.question,
        4: wormBuilderConfig.virus.question,
        5: phishingDispatchConfig.sender.question
      };
      def.step6.choices.forEach((c) => {
        expect(c.question).toBe(questions[c.num]);
        expect((c.attack ?? '').length).toBeGreaterThan(40);
        expect((c.defense ?? '').length).toBeGreaterThan(40);
      });
    });

    it('numery decyzji w danych klocków zgadzają się z etapami, jedna opcja ideal/suboptimal/critical', () => {
      const decisions = [
        phishingCampaignConfig.action,
        phishingCampaignConfig.template,
        phishingCampaignConfig.topic,
        wormBuilderConfig.virus,
        phishingDispatchConfig.sender
      ];
      expect(decisions.map((d) => d.decisionNum)).toEqual([1, 2, 3, 4, 5]);
      decisions.forEach((d) => {
        expect(d.options.map((o) => o.tier).sort()).toEqual(['critical', 'ideal', 'suboptimal']);
        const ideal = d.options.find((o) => o.tier === 'ideal')!;
        expect(def.step6.choices.find((c) => c.num === d.decisionNum)!.answer).toBe(ideal.label);
      });
      expect(vpnConfig.allowedIps).toContain(vpnConfig.targetIp);
    });

    it('opcje nie mają opisów ani tagów spoza VR (poza podtytułami szablonów)', () => {
      const all = [
        ...phishingCampaignConfig.action.options,
        ...phishingCampaignConfig.topic.options,
        ...wormBuilderConfig.virus.options,
        ...phishingDispatchConfig.sender.options
      ];
      all.forEach((o) => {
        expect(o.desc).toBeUndefined();
        expect(o.tags).toBeUndefined();
      });
      phishingCampaignConfig.template.options.forEach((o) => expect(o.desc).toContain('|'));
    });

    it('podgląd maila ma wariant dla każdej opcji tematu, szablonu i nadawcy', () => {
      const cfg = phishingDispatchConfig;
      phishingCampaignConfig.topic.options.forEach((o) =>
        expect(cfg.topics.some((t) => t.label === o.label)).toBe(true)
      );
      phishingCampaignConfig.template.options.forEach((o) =>
        expect(cfg.templates.some((t) => t.label === o.label)).toBe(true)
      );
      cfg.sender.options.forEach((o) => expect(cfg.signoffs[o.id]).toBeTruthy());
    });

    it('intro jest 1:1 z VR (węzły, kwestie gracza, mostek po wysyłce bez BM)', () => {
      const intro = def.intro;
      expect(intro.dialogue.length).toBe(8);
      expect(intro.dialogue[0].text).toBe('MAM DLA CIEBIE KOLEJNE ZADANIE');
      expect(intro.dialogue[6].text).toContain('LISTĘ MAILINGOWĄ PRACOWNIKÓW CARBONFLOW');
      expect(intro.dialogue[6].playerResponse).toBe(
        'CZYLI OD POCZĄTKU WIEDZIAŁEŚ, ŻE BĘDĘ PLANOWAĆ ATAK PHISHINGOWY?'
      );
      expect(intro.dialogue[7].playerResponse).toBeUndefined();
      const bridge = stages.find((s) => s.id === 'phishing_dispatch')!.completion.conversation!;
      expect(bridge.map((b) => b.from)).toEqual(['player']);
    });
  });

  it('registers custom minigames in appRegistry', () => {
    expect(appComponentRegistry['phishing_campaign']).toBeDefined();
    expect(appComponentRegistry['vpn_app']).toBeDefined();
    expect(appComponentRegistry['worm_builder']).toBeDefined();
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

  describe('przepływ z rozmowami mostkującymi (wzorzec B, Cyber Kill Chain)', () => {
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

    it('przechodzi wzorcem B przez 5 decyzji w kolejności z VR, odblokowuje etapy i składa paczkę SCORM', () => {
      const store = useMissionStore.getState();

      // Start: po BIOSie kwestia gracza (spójnik) w czacie odblokowuje //PHISHING
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('phishing_app');
      expect(useMissionStore.getState().chatAvailableChoices.length).toBe(0);

      // ETAP 1: //PHISHING (D1 akcja, D2 szablon, D3 temat)
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

      // Mostek: czarna lista antyspamowa -> odblokowanie VPN
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('vpn_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('vpn_app');

      // ETAP 2: VPN (Flavor / techniczne)
      store.completeStage('vpn_app');

      // Mostek: „stwórz wirusa 0-day” -> odblokowanie Bazy Wirusów
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

      // Mostek: adres nadawcy -> odblokowanie //PHISHING (WYSYŁKA)
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_dispatch_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('phishing_dispatch');

      // ETAP 4: //PHISHING (WYSYŁKA) (D5)
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

    it('reaguje na błąd krytyczny (np. D4 ransomware) wyzwalając modal dekonspiracji', () => {
      const store = useMissionStore.getState();

      store.reportDecision({
        num: 4,
        question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
        answer: 'RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ',
        tier: 'critical',
        feedback: 'Szyfrowanie przedwcześnie alarmuje administratorów i pali operację.'
      });

      const state = useMissionStore.getState();
      expect(state.isDetectedModalOpen).toBe(true);
      expect(state.criticalErrorsCount).toBe(1);
      expect(state.score).toBeLessThan(100);
      expect(state.detectionReason?.title).toContain('ZOSTAŁEŚ WYKRYTY');
    });

    it('poprawnie nalicza karę punktową i BTC przy wyborze suboptimal w M2', () => {
      const store = useMissionStore.getState();

      // Wybór suboptimal dla D4: 50% punktów za decyzję (10 pkt straty ze 100)
      store.reportDecision({
        num: 4,
        question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
        answer: 'KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
        tier: 'suboptimal',
        feedback: 'Przechwytuje dane na jednej stacji, nie tworzy botnetu.'
      });

      const state = useMissionStore.getState();
      expect(state.score).toBe(90);
      expect(state.btcReward).toBeCloseTo(2.96 * 0.9, 2);
      expect(state.goodChoicesCount).toBe(1);
    });

    it('suboptimal w D2 i D5 odejmuje po 10 pkt, a BTC liczy silnik', () => {
      const store = useMissionStore.getState();
      store.reportDecision({
        num: 2,
        question: 'WYBIERZ SZABLON FORMULARZA:',
        answer: 'Quickgram',
        tier: 'suboptimal',
        feedback: 'Szablon sieci społecznościowej wzbudza podejrzenia.'
      });
      store.reportDecision({
        num: 5,
        question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
        answer: 'MARKETING@CARBON.COM',
        tier: 'suboptimal',
        feedback: 'Skrócona domena jest podejrzana.'
      });
      const state = useMissionStore.getState();
      expect(state.score).toBe(80);
      expect(state.btcReward).toBeCloseTo(2.96 * 0.8, 2);
      expect(state.goodChoicesCount).toBe(2);
      expect(state.isDetectedModalOpen).toBe(false);
      expect(state.playerChoices.find((c) => c.num === 5)?.outcome).toBe('suboptimal');
    });

    it('critical w D3 (temat) i D5 (nadawca) uruchamia wykrycie z numerem decyzji', () => {
      const store = useMissionStore.getState();
      store.reportDecision({
        num: 3,
        question: 'WYBIERZ TEMAT I PRZYNĘTĘ ANKIETY:',
        answer: 'ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU',
        tier: 'critical',
        feedback: 'Błahy temat zostanie zignorowany.'
      });
      let state = useMissionStore.getState();
      expect(state.isDetectedModalOpen).toBe(true);
      expect(state.detectionReason?.choiceNum).toBe(3);
      expect(state.score).toBe(80);
      expect(state.criticalErrorsCount).toBe(1);

      store.reportDecision({
        num: 5,
        question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
        answer: 'KATERING@OILFLOW.COM',
        tier: 'critical',
        feedback: 'Obca domena zostanie zablokowana.'
      });
      state = useMissionStore.getState();
      expect(state.detectionReason?.choiceNum).toBe(5);
      expect(state.criticalErrorsCount).toBe(2);
      expect(state.score).toBe(60);
    });

    it('mostki odblokowują kafelki dopiero po kwestii gracza', () => {
      const store = useMissionStore.getState();
      driveBridge();
      store.completeStage('phishing_app');
      vi.runAllTimers();
      expect(useMissionStore.getState().unlockedIcons).not.toContain('vpn_unlocked');
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('vpn_unlocked');
      store.completeStage('vpn_app');
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('virus_database_unlocked');
      expect(useMissionStore.getState().unlockedIcons).not.toContain('phishing_dispatch_unlocked');
      store.completeStage('virus_database');
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_dispatch_unlocked');
      store.completeStage('phishing_dispatch');
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('botnet_monitor_unlocked');
    });
  });
});
