import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { mission1Definition, mission1Apps } from '../src/scenarios/mission_01_petrolog';
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

describe('Mission 1: PetroLog Scenario & SCORM Engine', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    MockLRS.clear();
  });

  it('correctly loads Mission 1 definition from registry with proper metadata', () => {
    const mission = getMission('mission-1-petrolog');
    expect(mission).toBeDefined();
    expect(mission?.mission.id).toBe('mission-1-petrolog');
    expect(mission?.mission.title).toBe('MISJA 1 – PETROLOG');
    expect(mission?.mission.targetCompany).toBe('PetroLog');
    expect(mission?.mission.rewardBtc).toBe(2.52);
    expect(mission?.mission.decisionCount).toBe(4);
    expect(mission?.mission.passingScore).toBe(75);
    expect(mission?.step6.choices.length).toBe(4);
    expect(mission?.step6.educationalSlides.length).toBe(4);
  });

  it('resolves mission by alternative keys: "1", "petrolog", "mission1"', () => {
    expect(getMission('1')?.mission.id).toBe('mission-1-petrolog');
    expect(getMission('petrolog')?.mission.id).toBe('mission-1-petrolog');
    expect(getMission('mission1')?.mission.id).toBe('mission-1-petrolog');
  });

  it('registers all 5 custom minigames in appRegistry', () => {
    expect(appComponentRegistry['target_petrolog']).toBeDefined();
    expect(appComponentRegistry['osint_search']).toBeDefined();
    expect(appComponentRegistry['social_intel']).toBeDefined();
    expect(appComponentRegistry['phishing_builder']).toBeDefined();
    expect(appComponentRegistry['victim_monitor']).toBeDefined();
  });

  it('loads Mission 1 into useMissionStore and resets state properly', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-1-petrolog');
    const state = useMissionStore.getState();
    expect(state.activeMission.mission.id).toBe('mission-1-petrolog');
    expect(state.score).toBe(100);
    expect(state.playerChoices.length).toBe(4);
    expect(state.systemDate).toBe('14.01.2025');
  });

  it('posiada rozgałęzienie opcji gracza (Wariant A i B) w intro dialogu węzła 7', () => {
    const mission = getMission('mission-1-petrolog');
    const node7 = mission?.intro.dialogue.find((d) => d.id === 'node_7');
    expect(node7).toBeDefined();
    expect(node7?.playerOptions?.length).toBe(2);
    expect(node7?.playerOptions?.[0].id).toBe('opt_a');
    expect(node7?.playerOptions?.[1].id).toBe('opt_b');
    expect(node7?.playerOptions?.[0].mentorReaction).toContain('NAJSŁABSZE OGNIWO');
    expect(node7?.playerOptions?.[1].mentorReaction).toContain('BIAŁY WYWIAD');
  });

  describe('przepływ z rozmowami mostkującymi (wzorzec B)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      __setBridgeDelayForTests(0);
      scorm2004.reset();
      scorm2004.initialize();
      useMissionStore.getState().loadMission('mission-1-petrolog');
      useMissionStore.getState().finishBiosBoot();
    });

    afterEach(() => {
      vi.useRealTimers();
      __setBridgeDelayForTests(null);
    });

    it('przechodzi wzorcem B przez 4 decyzje, odblokowuje etapy i kończy operację na 100%', () => {
      const store = useMissionStore.getState();

      // Start: po BIOSie w czacie czeka opcja firstChoice gracza
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('target_petrolog_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_target_petrolog');

      // ETAP 1: Baza celu PetroLog (Briefing operacyjny)
      store.completeStage('app_target_petrolog');

      // Mostek: rozmowa o pracownikach -> odblokowanie Wyszukiwarki OSINT
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('osint_search_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_osint_search');

      // ETAP 2: Wyszukiwarka OSINT (Selekcja celu)
      store.completeStage('app_osint_search');

      // Mostek: rozmowa o profilu Anity Klimek -> odblokowanie Social Intel
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('social_intel_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_social_intel');

      // ETAP 3: Profilowanie ofiary (Social Intel)
      store.completeStage('app_social_intel');

      // Mostek: rozmowa o bieganiu długodystansowym -> odblokowanie Kreatora Phishingu
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('phishing_builder_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_phishing_builder');

      // ETAP 4: Kreator phishingu (D1, D2, D3, D4)
      store.reportDecision({
        num: 1,
        question: 'Wybór strony WWW',
        answer: 'DALEKBIEG.INFO',
        tier: 'ideal',
        feedback: 'Bezpośrednie odwołanie do pasji do biegów długodystansowych.'
      });
      store.reportDecision({
        num: 2,
        question: 'Wybór pliku do pobrania',
        answer: 'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK',
        tier: 'ideal',
        feedback: 'Precyzyjna odpowiedź na publiczne zapytanie Anity.'
      });
      store.reportDecision({
        num: 3,
        question: 'Wybór nadawcy wiadomości',
        answer: 'JAKUB KWIATKOWSKI',
        tier: 'ideal',
        feedback: 'Zaufany współpracownik z tego samego pokoju.'
      });
      store.reportDecision({
        num: 4,
        question: 'Wybór adresu e-mail nadawcy',
        answer: 'K.KWIATKOWSKI@PETROLOG.COM',
        tier: 'ideal',
        feedback: 'Domena firmowa PetroLog – pełne uwiarygodnienie.'
      });
      store.completeStage('app_phishing_builder');

      // Mostek: mail wysłany -> odblokowanie Monitora Ofiary
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('victim_monitor_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_victim_monitor');

      // ETAP 5: Monitor ofiary (Infekcja i eksfiltracja)
      store.completeStage('app_victim_monitor');

      // Mostek końcowy: gratulacje BYTE_MASTERA -> odblokowanie podsumowania
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('mission_completed');
      expect(useMissionStore.getState().unlockedIcons).toContain('debrief_app');
      expect(useMissionStore.getState().highlightedTileId).toBe('debrief_app');

      // Weryfikacja końcowa
      const finalState = useMissionStore.getState();
      expect(finalState.score).toBe(100);
      expect(finalState.btcReward).toBe(2.52);
      expect(finalState.perfectChoicesCount).toBe(4);
      expect(finalState.criticalErrorsCount).toBe(0);
    });

    it('reaguje na błąd krytyczny wyzwalając modal dekonspiracji', () => {
      const store = useMissionStore.getState();
      driveBridge();

      store.reportDecision({
        num: 1,
        question: 'Wybór strony WWW',
        answer: 'MEDIKARZ.IQ',
        tier: 'critical',
        feedback: 'Tematyka medyczna wzbudzi natychmiastową nieufność.'
      });

      const st = useMissionStore.getState();
      expect(st.isDetectedModalOpen).toBe(true);
      expect(st.detectionReason?.title).toContain('ZOSTAŁEŚ WYKRYTY');
    });

    it('poprawnie nalicza karę punktową i BTC przy wyborze suboptimal', () => {
      const store = useMissionStore.getState();
      driveBridge();

      // Wybór suboptimal dla D1: 50% punktów za decyzję (12.5 pkt straty ze 100)
      store.reportDecision({
        num: 1,
        question: 'Wybór strony WWW',
        answer: 'MUFINA.ORG.PL',
        tier: 'suboptimal',
        feedback: 'Nawiązuje do pieczenia ciast, ale domena org.pl nie budzi zaufania.'
      });

      const st = useMissionStore.getState();
      expect(st.score).toBe(87.5);
      expect(st.btcReward).toBe(2.21); // 2.52 * 0.875
      expect(st.goodChoicesCount).toBe(1);
    });

    it('posiada interaktywne Dossier z 4 zakładkami i 3 wektorami (tylko wariant B poprawny)', async () => {
      const { targetPetrologConfig } = await import('../src/scenarios/mission_01_petrolog/stages');
      expect(targetPetrologConfig.tabs).toBeDefined();
      expect(targetPetrologConfig.tabs?.length).toBe(4);
      expect(targetPetrologConfig.tabs?.map((t) => t.id)).toEqual([
        'tab_org',
        'tab_sales',
        'tab_finance',
        'tab_it'
      ]);

      const prompt = targetPetrologConfig.vectorPrompt;
      expect(prompt).toBeDefined();
      expect(prompt?.options.length).toBe(3);
      expect(prompt?.options.find((o) => o.letter === 'A')?.isCorrect).toBe(false);
      expect(prompt?.options.find((o) => o.letter === 'B')?.isCorrect).toBe(true);
      expect(prompt?.options.find((o) => o.letter === 'C')?.isCorrect).toBe(false);
      expect(prompt?.options.find((o) => o.letter === 'B')?.label).toContain('spear-phishing');
    });

    it('posiada aktywną dedukcję faktów ze wskaźnikiem precyzji w SocialIntel', async () => {
      const { socialIntelConfig } = await import('../src/scenarios/mission_01_petrolog/stages');
      expect(socialIntelConfig.target.requiredFacts).toBe(8);
      expect(socialIntelConfig.target.requiredPrecision).toBe(70);
      expect(socialIntelConfig.posts.length).toBe(11);

      // Wszystkie posty muszą mieć po 3 opcje dedukcji z dokładnie 1 poprawną
      for (const post of socialIntelConfig.posts) {
        expect(post.deductionOptions).toBeDefined();
        expect(post.deductionOptions?.length).toBe(3);
        const correctCount = post.deductionOptions?.filter((o) => o.isCorrect).length;
        expect(correctCount).toBe(1);
      }
    });

    it('renderuje TargetPetrologApp i weryfikuje 4 zakładki oraz 3 opcje wektora', async () => {
      const React = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { TargetPetrologApp } = await import('../src/scenarios/mission_01_petrolog/minigames/TargetPetrologApp');
      const { targetPetrologConfig } = await import('../src/scenarios/mission_01_petrolog/stages');

      const html = renderToString(
        React.createElement(TargetPetrologApp, {
          config: targetPetrologConfig,
          onComplete: vi.fn()
        })
      );

      expect(html).toContain('01. STRUKTURA I ZARZĄD');
      expect(html).toContain('02. SPRZEDAŻ I B2B');
      expect(html).toContain('03. FINANSE I KSIĘGOWOŚĆ');
      expect(html).toContain('04. BEZPIECZEŃSTWO IT');
      expect(html).toContain('PANEL_ANALITYCZNY');
      expect(html).toContain('OPCJA A');
      expect(html).toContain('OPCJA B');
      expect(html).toContain('OPCJA C');
      expect(html).toContain('Bezpośredni atak DDoS na bramę sieciową firmy');
      expect(html).toContain('Celowany atak socjotechniczny (spear-phishing)');
      expect(html).toContain('Fizyczne włamanie do serwerowni w centrali');
    });

    it('renderuje SocialIntelApp i weryfikuje profil Anity Klimek, wskaźnik precyzji 100% i 8 faktów', async () => {
      const React = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { SocialIntelApp } = await import('../src/scenarios/mission_01_petrolog/minigames/SocialIntelApp');
      const { socialIntelConfig } = await import('../src/scenarios/mission_01_petrolog/stages');

      const html = renderToString(
        React.createElement(SocialIntelApp, {
          config: socialIntelConfig,
          onComplete: vi.fn()
        })
      );

      expect(html).toContain('//INTEL_SOCIAL_MEDIA');
      expect(html).toContain('PRECYZJA WYWIADU');
      expect(html).toContain('100%');
      expect(html).toContain('MIN 70%');
      expect(html).toContain('0/8');
      expect(html).toContain('ANITA KLIMEK');
      expect(html).toContain('Kneenook');
      expect(html).toContain('Quickgram');
      expect(html).toContain('Joinin');
      expect(html).toContain('JAKI FAKT WYWIADOWCZY WYNIKA Z TEGO WPISU?');
    });

    it('renderuje TargetPetrologApp i SocialIntelApp bezpiecznie z pustym configiem (brak crasha)', async () => {
      const React = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { TargetPetrologApp } = await import('../src/scenarios/mission_01_petrolog/minigames/TargetPetrologApp');
      const { SocialIntelApp } = await import('../src/scenarios/mission_01_petrolog/minigames/SocialIntelApp');

      // TargetPetrologApp z pustym configiem
      const htmlTarget = renderToString(
        React.createElement(TargetPetrologApp, {
          config: {} as any,
          onComplete: vi.fn()
        })
      );
      expect(htmlTarget).toContain('//DOSSIER_WYWIADOWCZE: PETROLOG');
      expect(htmlTarget).toContain('PANEL_ANALITYCZNY');

      // SocialIntelApp z pustym configiem
      const htmlSocial = renderToString(
        React.createElement(SocialIntelApp, {
          config: {} as any,
          onComplete: vi.fn()
        })
      );
      expect(htmlSocial).toContain('//INTEL_SOCIAL_MEDIA');
      expect(htmlSocial).toContain('PRECYZJA WYWIADU');
    });
  });
});
