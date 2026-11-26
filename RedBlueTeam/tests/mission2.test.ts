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
  phishingDispatchConfig,
  botnetMonitorConfig
} from '../src/scenarios/mission_02_carbon_flow/stages';
import type { ChoiceOption } from '../src/engine/types/mission';
import { summarizeBotnet } from '../src/scenarios/mission_02_carbon_flow/minigames/botnet';

/** Przegrywa rozmowę mostkującą do końca: flushuje kwestie BYTE_MASTERA i klika kwestie gracza. */
function driveBridge() {
  for (let i = 0; i < 40; i++) {
    vi.runAllTimers();
    const st = useMissionStore.getState();
    if (st.timeJump) {
      st.endTimeJump();
      continue;
    }
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
    expect(mission?.mission.decisionCount).toBe(4);
    expect(mission?.mission.passingScore).toBe(70);
    expect(mission?.step6.choices.length).toBe(4);
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
      expect(stages.map((s) => s.decisions)).toEqual([[1, 2], [], [3], [4], []]);
    });

    it('każda decyzja 1..N jest w dokładnie jednym etapie i w step6.choices', () => {
      const n = def.mission.decisionCount;
      expect(n).toBe(4);
      for (let k = 1; k <= n; k++) {
        expect(stages.filter((s) => s.decisions.includes(k)).length).toBe(1);
        expect(def.step6.choices.filter((c) => c.num === k).length).toBe(1);
      }
      expect(def.step6.choices.length).toBe(n);
      expect(def.step6.summary.perfectChoices).toBe(n);
    });

    it('raport: pytania identyczne z ekranem, każda decyzja ma lekcje atak/obrona', () => {
      const questions: Record<number, string> = {
        1: phishingCampaignConfig.template.question,
        2: phishingCampaignConfig.topic.question,
        3: wormBuilderConfig.virus.question,
        4: phishingDispatchConfig.sender.question
      };
      def.step6.choices.forEach((c) => {
        expect(c.question).toBe(questions[c.num]);
        expect((c.attack ?? '').length).toBeGreaterThan(40);
        expect((c.defense ?? '').length).toBeGreaterThan(40);
      });
    });

    it('numery decyzji w danych klocków zgadzają się z etapami, jedna opcja ideal, reszta suboptimal (critical tylko RANSOMWARE)', () => {
      const decisions = [
        phishingCampaignConfig.template,
        phishingCampaignConfig.topic,
        wormBuilderConfig.virus,
        phishingDispatchConfig.sender
      ];
      expect(decisions.map((d) => d.decisionNum)).toEqual([1, 2, 3, 4]);
      decisions.forEach((d) => {
        const tiers = d.options.map((o) => o.tier).sort();
        expect(tiers.filter((x) => x === 'ideal')).toHaveLength(1);
        expect(tiers.filter((x) => x !== 'ideal').length).toBe(2);
        const ideal = d.options.find((o) => o.tier === 'ideal')!;
        expect(def.step6.choices.find((c) => c.num === d.decisionNum)!.answer).toBe(ideal.label);
      });
      expect(vpnConfig.allowedIps).toContain(vpnConfig.targetIp);
    });

    it('D1 (rodzaj akcji) usunięta: kreator nie ma opcji akcji, a typ ataku wybiera się w D3', () => {
      expect('action' in phishingCampaignConfig).toBe(false);
      const all = JSON.stringify([phishingCampaignConfig, wormBuilderConfig, phishingDispatchConfig, def.step6]);
      expect(all).not.toMatch(/SZKOLENIE Z BEZPIECZEŃSTWA|ZBIERANIE WRAŻLIWYCH|security_training|data_harvesting/);
    });

    it('poziomy wg D-06: jedyny critical to RANSOMWARE (wykrycie), złe opcje bez wykrycia to suboptimal z reject', () => {
      const all = [
        phishingCampaignConfig.template,
        phishingCampaignConfig.topic,
        wormBuilderConfig.virus,
        phishingDispatchConfig.sender
      ].flatMap((d) => d.options);
      const critical = all.filter((o) => o.tier === 'critical');
      expect(critical.map((o) => o.id)).toEqual(['ransomware']);
      expect(critical[0].reject).toBeUndefined();
      expect(critical[0].feedback).toMatch(/alarmuje|wykryt/i);
    });

    it('opcje odrzucane przez mentora (B2): KNEENOOK, owoce, KEYLOGGER, KATERING, z kwestią mentora wielkimi literami', () => {
      const find = (opts: { id: string }[], id: string) => opts.find((o) => o.id === id) as ChoiceOption;
      const rejected = [
        find(phishingCampaignConfig.template.options, 'kneenook'),
        find(phishingCampaignConfig.topic.options, 'fruit_thursday'),
        find(wormBuilderConfig.virus.options, 'keylogger'),
        find(phishingDispatchConfig.sender.options, 'catering_oilflow')
      ];
      rejected.forEach((o) => {
        expect(o.tier).toBe('suboptimal');
        expect(o.reject?.mentorLine).toBeTruthy();
        expect(o.reject!.mentorLine).toBe(o.reject!.mentorLine.toUpperCase());
        expect(o.reject!.mentorLine).toMatch(/WYBIERZ INACZEJ\.$/);
      });
      expect(find(wormBuilderConfig.virus.options, 'keylogger').reject!.mentorLine).toMatch(/BOTNET/);
      // pozostałe suboptimal działają i nie są odrzucane
      ['quickgram'].forEach((id) => expect(find(phishingCampaignConfig.template.options, id).reject).toBeUndefined());
      expect(find(phishingCampaignConfig.topic.options, 'fire_drill').reject).toBeUndefined();
      expect(find(phishingDispatchConfig.sender.options, 'marketing_carbon').reject).toBeUndefined();
      expect(find(phishingDispatchConfig.sender.options, 'typosquatting_kadry').reject).toBeUndefined();
    });

    it('feedback opcji suboptimal nie mówi, że opcja nie działa, ani nie chwali ("dobry wybór")', () => {
      const subs = [
        phishingCampaignConfig.template,
        phishingCampaignConfig.topic,
        phishingDispatchConfig.sender
      ]
        .flatMap((d) => d.options)
        .filter((o) => o.tier === 'suboptimal' && !o.reject);
      expect(subs.length).toBe(3);
      subs.forEach((o) => {
        expect(o.feedback).toMatch(/zadziała|działa/);
        expect(o.feedback).not.toMatch(/dobry wybór|nie realizuje|nie tworzy/i);
      });
    });

    it('opcje nie mają opisów ani tagów spoza VR (poza podtytułami szablonów)', () => {
      const all = [
        ...phishingCampaignConfig.topic.options,
        ...phishingDispatchConfig.sender.options
      ];
      all.forEach((o) => {
        expect(o.desc).toBeUndefined();
        expect(o.tags).toBeUndefined();
      });
      // Typy wirusów mają neutralną definicję (dodatek spoza VR, zob. scenario.md), która nie ocenia dopasowania do celu.
      wormBuilderConfig.virus.options.forEach((o) => {
        expect(o.desc).toBeTruthy();
        expect(o.tags).toBeUndefined();
        expect(o.desc!.toLowerCase()).not.toMatch(/botnet|zombie|cel|misj/);
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

    it('termin 16:00 jest tylko w temacie obowiązkowym (ideal), nie w ankiecie o ćwiczeniach przeciwpożarowych', () => {
      const cfg = phishingDispatchConfig;
      const ideal = phishingCampaignConfig.topic.options.find((o) => o.tier === 'ideal')!;
      const fire = phishingCampaignConfig.topic.options.find((o) => o.id === 'fire_drill')!;
      const idealTopic = cfg.topics.find((t) => t.label === ideal.label)!;
      const fireTopic = cfg.topics.find((t) => t.label === fire.label)!;
      expect(idealTopic.deadline).toContain('16:00');
      expect(fireTopic.body).not.toContain('16:00');
      expect(fireTopic.deadline).toBeUndefined();
      expect(fireTopic.body.toLowerCase()).not.toContain('pilne');
      cfg.topics
        .filter((t) => t !== idealTopic)
        .forEach((t) => expect(t.deadline).toBeUndefined());
    });

    it('intro jest 1:1 z VR (węzły, kwestie gracza, mostek po wysyłce: kwestia gracza i przeskok czasu)', () => {
      const intro = def.intro;
      expect(intro.dialogue.length).toBe(8);
      expect(intro.dialogue[0].text).toBe('MAM DLA CIEBIE KOLEJNE ZADANIE');
      expect(intro.dialogue[6].text).toContain('LISTĘ MAILINGOWĄ PRACOWNIKÓW CARBONFLOW');
      expect(intro.dialogue[6].playerResponse).toBe(
        'CZYLI OD POCZĄTKU WIEDZIAŁEŚ, ŻE BĘDĘ PLANOWAĆ ATAK PHISHINGOWY?'
      );
      expect(intro.dialogue[7].playerResponse).toBeUndefined();
      const bridge = stages.find((s) => s.id === 'phishing_dispatch')!.completion.conversation!;
      expect(bridge.map((b) => b.from)).toEqual(['player', 'time_jump']);
    });
  });

  describe('dane współdzielone i monitor botnetu', () => {
    it('lista mailingowa i podgląd wysyłki oraz VPN i allowlista mają jedno źródło danych', () => {
      expect(phishingDispatchConfig.targetDomain).toBe(phishingCampaignConfig.mailingList.targetDomain);
      expect(phishingDispatchConfig.recipients).toEqual(
        phishingCampaignConfig.mailingList.recipients.map((r) => r.email)
      );
      expect(botnetMonitorConfig.totalWorkstations).toBe(phishingDispatchConfig.recipients.length);
      expect(vpnConfig.allowedIps).toEqual(phishingCampaignConfig.mailingList.whitelistedIps);
      expect(phishingDispatchConfig.topicDecisionNum).toBe(phishingCampaignConfig.topic.decisionNum);
      expect(phishingDispatchConfig.templateDecisionNum).toBe(phishingCampaignConfig.template.decisionNum);
    });

    it('lista mailingowa: 12 unikalnych adresów w domenie celu (nie w domenie nadawcy z D5)', () => {
      const { recipients, targetDomain } = phishingCampaignConfig.mailingList;
      const emails = recipients.map((r) => r.email);
      expect(emails).toHaveLength(12);
      expect(new Set(emails).size).toBe(12);
      for (const e of emails) expect(e).toMatch(new RegExp(`^[a-z]+\.[a-z]+@${targetDomain.replace('.', '\.')}$`));
      expect(targetDomain).toBe('carbonflow.com');
      expect(phishingDispatchConfig.recipients.length).toBe(emails.length);
    });

    it('summarizeBotnet liczy infekcje z konfiguracji (82% z 12 stacji = 10 + 2)', () => {
      const r = summarizeBotnet(botnetMonitorConfig);
      expect(r.infectedCount).toBe(10);
      expect(r.secureCount).toBe(2);
      expect(r.nodes.length).toBe(12);
      expect(r.nodes.filter((n) => n.infected).length).toBe(10);
      expect(r.nodes.slice(10).every((n) => !n.infected)).toBe(true);
      // każdy zainfekowany węzeł zapala się przed końcem animacji, rosnąco
      const lit = r.nodes.filter((n) => n.infected).map((n) => n.litAt);
      expect(lit[lit.length - 1]).toBeLessThanOrEqual(botnetMonitorConfig.targetPercentage);
      expect([...lit].sort((a, b) => a - b)).toEqual(lit);
    });

    it('summarizeBotnet reaguje na zmianę konfiguracji i generuje węzły z totalWorkstations', () => {
      const r = summarizeBotnet({ targetPercentage: 50, totalWorkstations: 20 });
      expect(r.nodes.length).toBe(20);
      expect(r.infectedCount).toBe(10);
      expect(r.secureCount).toBe(10);
      expect(new Set(r.nodes.map((n) => n.name)).size).toBe(20);
      const all = summarizeBotnet({ targetPercentage: 100, totalWorkstations: 5 });
      expect(all.infectedCount).toBe(5);
      expect(all.secureCount).toBe(0);
    });
  });

  it('registers custom minigames in appRegistry', () => {
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
    expect(state.playerChoices.length).toBe(4);
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

    it('przechodzi wzorcem B przez 4 decyzje w kolejności z VR, odblokowuje etapy i składa paczkę SCORM', () => {
      const store = useMissionStore.getState();

      // Start: po BIOSie kwestia gracza (spójnik) w czacie odblokowuje //PHISHING
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('phishing_app');
      expect(useMissionStore.getState().chatAvailableChoices.length).toBe(0);

      // ETAP 1: //PHISHING (D1 szablon, D2 temat)
      store.reportDecision({
        num: 1,
        question: 'WYBIERZ SZABLON FORMULARZA:',
        answer: 'POODLE FORMS',
        tier: 'ideal',
        feedback: 'Profesjonalny szablon formularza ankietowego.'
      });
      store.reportDecision({
        num: 2,
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

      // ETAP 3: Baza Wirusów (D3)
      store.reportDecision({
        num: 3,
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

      // ETAP 4: //PHISHING (WYSYŁKA) (D4)
      store.reportDecision({
        num: 4,
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

    it('reaguje na błąd krytyczny (D3 ransomware: wykrycie) wyzwalając modal dekonspiracji', () => {
      const store = useMissionStore.getState();

      store.reportDecision({
        num: 3,
        question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
        answer: 'RANSOMWARE',
        tier: 'critical',
        feedback: wormBuilderConfig.virus.options.find((o) => o.id === 'ransomware')!.feedback
      });

      const state = useMissionStore.getState();
      expect(state.isDetectedModalOpen).toBe(true);
      expect(state.criticalErrorsCount).toBe(1);
      expect(state.score).toBe(75);
      expect(state.detectionReason?.title).toContain('ZOSTAŁEŚ WYKRYTY');
    });

    it('poprawnie nalicza karę punktową i BTC przy wyborze suboptimal w M2 (D3 przez odrzucony KEYLOGGER)', () => {
      const store = useMissionStore.getState();
      const keylogger = wormBuilderConfig.virus.options.find((o) => o.id === 'keylogger')!;

      // B2: mentor odrzuca KEYLOGGER, kara = pół udziału decyzji (25 pkt / 2), decyzja zostaje otwarta
      store.rejectDecision({
        num: 3,
        question: wormBuilderConfig.virus.question,
        optionId: keylogger.id,
        answer: keylogger.label,
        tier: keylogger.tier,
        mentorLine: keylogger.reject!.mentorLine
      });
      let state = useMissionStore.getState();
      expect(state.decisionTiers[3]).toBeUndefined();
      expect(state.isDetectedModalOpen).toBe(false);
      expect(state.score).toBe(87.5);
      expect(state.chatMessages.at(-1)).toMatchObject({ sender: 'BYTE_MASTER', text: keylogger.reject!.mentorLine });

      // Ponowny wybór ROBAKA nie dokłada kary: pół udziału zapłacone za próbę
      store.reportDecision({
        num: 3,
        question: wormBuilderConfig.virus.question,
        answer: 'ROBAK',
        tier: 'ideal',
        feedback: 'Robak samodzielnie powiela się w sieci i formuje botnet.'
      });
      state = useMissionStore.getState();
      expect(state.score).toBe(87.5);
      expect(state.btcReward).toBeCloseTo(2.96 * 0.875, 2);
      expect(state.criticalErrorsCount).toBe(0);
    });

    it('suboptimal (Quickgram w D1, MARKETING w D4) odejmuje po połowie udziału (12,5 pkt), a BTC liczy silnik', () => {
      const store = useMissionStore.getState();
      store.reportDecision({
        num: 1,
        question: 'WYBIERZ SZABLON FORMULARZA:',
        answer: 'Quickgram',
        tier: 'suboptimal',
        feedback: 'Szablon sieci społecznościowej działa, ale wzbudza podejrzenia.'
      });
      store.reportDecision({
        num: 4,
        question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
        answer: 'MARKETING@CARBON.COM',
        tier: 'suboptimal',
        feedback: 'Adres zadziała, ale marketing rzadko pisze w sprawach kadrowych.'
      });
      const state = useMissionStore.getState();
      expect(state.score).toBe(75);
      expect(state.btcReward).toBeCloseTo(2.96 * 0.75, 2);
      expect(state.goodChoicesCount).toBe(2);
      expect(state.isDetectedModalOpen).toBe(false);
      expect(state.playerChoices.find((c) => c.num === 4)?.outcome).toBe('suboptimal');
    });

    it('B2 w D1, D2 i D4: odrzucone próby nie otwierają modala, nie zamykają decyzji i blokują opcję', () => {
      const store = useMissionStore.getState();
      const cases: Array<[number, string, ChoiceOption, string]> = [
        [1, phishingCampaignConfig.template.question, phishingCampaignConfig.template.options.find((o) => o.id === 'kneenook')!, 'kneenook'],
        [2, phishingCampaignConfig.topic.question, phishingCampaignConfig.topic.options.find((o) => o.id === 'fruit_thursday')!, 'fruit_thursday'],
        [4, phishingDispatchConfig.sender.question, phishingDispatchConfig.sender.options.find((o) => o.id === 'catering_oilflow')!, 'catering_oilflow']
      ];
      let expected = 100;
      for (const [num, question, o, id] of cases) {
        store.rejectDecision({
          num,
          question,
          optionId: o.id,
          answer: o.label,
          tier: o.tier,
          mentorLine: o.reject!.mentorLine
        });
        expected -= 12.5;
        const state = useMissionStore.getState();
        expect(state.isDetectedModalOpen).toBe(false);
        expect(state.decisionTiers[num]).toBeUndefined();
        expect(state.rejectedAttempts[num]?.[0].optionId).toBe(id);
        expect(state.score).toBe(expected);
        expect(state.criticalErrorsCount).toBe(0);
      }
    });

    it('critical w D3 (RANSOMWARE) uruchamia wykrycie z numerem decyzji i domyślnym tytułem', () => {
      const store = useMissionStore.getState();
      store.reportDecision({
        num: 3,
        question: wormBuilderConfig.virus.question,
        answer: 'RANSOMWARE',
        tier: 'critical',
        feedback: wormBuilderConfig.virus.options.find((o) => o.id === 'ransomware')!.feedback
      });
      const state = useMissionStore.getState();
      expect(state.isDetectedModalOpen).toBe(true);
      expect(state.detectionReason?.choiceNum).toBe(3);
      expect(state.detectionReason?.title).toBe('ZOSTAŁEŚ WYKRYTY!');
      expect(state.score).toBe(75);
      expect(state.criticalErrorsCount).toBe(1);
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
