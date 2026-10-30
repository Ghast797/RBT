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
    // Ogólna baza wiedzy jest w Moodle; debrief niesie lekcje atak/obrona przy każdej decyzji.
    expect(mission?.step6.educationalSlides).toBeUndefined();
    for (const choice of mission!.step6.choices) {
      expect(choice.attack?.length).toBeGreaterThan(40);
      expect(choice.defense?.length).toBeGreaterThan(40);
    }
  });

  it('resolves mission by alternative keys: "1", "petrolog", "mission1"', () => {
    expect(getMission('1')?.mission.id).toBe('mission-1-petrolog');
    expect(getMission('petrolog')?.mission.id).toBe('mission-1-petrolog');
    expect(getMission('mission1')?.mission.id).toBe('mission-1-petrolog');
  });

  it('registers all 6 custom minigames in appRegistry', () => {
    expect(appComponentRegistry['target_petrolog']).toBeDefined();
    expect(appComponentRegistry['osint_search']).toBeDefined();
    expect(appComponentRegistry['social_intel']).toBeDefined();
    expect(appComponentRegistry['phishing_builder']).toBeDefined();
    expect(appComponentRegistry['email_sender']).toBeDefined();
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

      // ETAP 4: Kreator strony (D1, D2)
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
      store.completeStage('app_phishing_builder');

      // Mostek: strona gotowa -> odblokowanie Wysyłania Maila
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('email_sender_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_email_sender');

      // ETAP 5: Wysyłanie maila (D3, D4)
      store.reportDecision({
        num: 3,
        question: 'Wybór nadawcy wiadomości',
        answer: 'JAKUB KWIATKOWSKI',
        tier: 'ideal',
        feedback: 'Zaufany współpracownik z tego samego pokoju.'
      });
      expect(useMissionStore.getState().isScormSubmitted).toBe(false);
      store.reportDecision({
        num: 4,
        question: 'Wybór adresu e-mail nadawcy',
        answer: 'K.KWIATKOWSKI@PETROLOG.COM',
        tier: 'ideal',
        feedback: 'Domena firmowa PetroLog – pełne uwiarygodnienie.'
      });

      // Ostatnia decyzja = wynik ostateczny: zapis do Moodle przed finałem, sesja dalej otwarta
      const api = scorm2004.getApi() as MockSCORM2004;
      expect(useMissionStore.getState().isScormSubmitted).toBe(true);
      expect(api.GetValue('cmi.completion_status')).toBe('completed');
      expect(api.GetValue('cmi.score.raw')).toBe('100');
      expect(api.GetValue('cmi.interactions.3.learner_response')).toBe('K.KWIATKOWSKI@PETROLOG.COM');
      expect(api.isTerminated).toBe(false);

      store.completeStage('app_email_sender');

      // Mostek: mail wysłany -> odblokowanie Monitora Ofiary
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('victim_monitor_unlocked');
      expect(useMissionStore.getState().highlightedTileId).toBe('app_victim_monitor');

      // ETAP 6: Monitor ofiary (Infekcja i eksfiltracja)
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

      // Wyjście z raportu kończy sesję SCORM
      store.submitScormAndExit();
      expect(api.isTerminated).toBe(true);
      expect(useMissionStore.getState().isExitModalOpen).toBe(true);
    });

    it('nie zapisuje wyniku, gdy ostatnia decyzja jest krytyczna; zapisuje po powtórce', () => {
      const store = useMissionStore.getState();
      driveBridge();
      const decide = (num: number, tier: 'ideal' | 'suboptimal' | 'critical') =>
        useMissionStore.getState().reportDecision({ num, question: `D${num}`, answer: `A${num}`, tier, feedback: '-' });

      decide(1, 'suboptimal');
      decide(2, 'ideal');
      decide(3, 'ideal');
      decide(4, 'critical');
      expect(useMissionStore.getState().isScormSubmitted).toBe(false);

      store.retryFromChoices();
      expect(useMissionStore.getState().reportedDecisions).toEqual([]);
      decide(1, 'suboptimal');
      decide(2, 'ideal');
      decide(3, 'ideal');
      decide(4, 'ideal');

      const api = scorm2004.getApi() as MockSCORM2004;
      expect(useMissionStore.getState().isScormSubmitted).toBe(true);
      expect(api.GetValue('cmi.score.raw')).toBe('87.5');
      expect(api.GetValue('cmi.success_status')).toBe('passed');
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

    it('posiada konfigurację rozpoznania celu w 3 krokach: briefing, badanie firmy i decyzję', async () => {
      const { targetPetrologConfig } = await import('../src/scenarios/mission_01_petrolog/stages');
      expect(targetPetrologConfig.briefing?.facts.length).toBe(3);
      expect(targetPetrologConfig.investigation?.places.length).toBe(4);
      expect(targetPetrologConfig.decision?.options.length).toBe(3);

      const correctOption = targetPetrologConfig.decision?.options.find((o) => o.isCorrect);
      expect(correctOption).toBeDefined();
      expect(correctOption?.title).toContain('mail');
      expect(correctOption?.feedback).toContain('spear-phishing');

      const wrongOptions = targetPetrologConfig.decision?.options.filter((o) => !o.isCorrect);
      expect(wrongOptions?.length).toBe(2);
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

    it('renderuje TargetPetrologApp i weryfikuje pasek kroków oraz 3 zaszyfrowane karty na starcie', async () => {
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

      // Pasek kroków i nagłówek
      expect(html).toContain('//BAZA_CELU: PETROLOG');
      expect(html).toContain('1 POZNAJ');
      expect(html).toContain('2 ZBADAJ');
      expect(html).toContain('3 ZDECYDUJ');
      expect(html).toContain('Kliknij zaszyfrowane karty');

      // 3 zaszyfrowane karty na starcie
      const encryptedMatches = html.match(/ZASZYFROWANE/g);
      expect(encryptedMatches).toBeDefined();
      expect(encryptedMatches?.length).toBe(3);
      expect(html).toContain('Odszyfrowano 0/3');
    });

    it('renderuje SocialIntelApp: ekran profili z 3 platformami, z których tylko pierwsza jest odblokowana', async () => {
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

      expect(html).toContain('//SOCIAL_MEDIA');
      expect(html).toContain('PRECYZJA WYWIADU');
      expect(html).toContain('100%');
      expect(html).toContain('MIN 70%');
      expect(html).toContain('0/8');
      expect(html).toContain('ANITA KLIMEK');
      expect(html).toContain('Kneenook');
      expect(html).toContain('Quickgram');
      expect(html).toContain('Joinin');
      expect(html).toContain('OTWÓRZ');
      expect(html.match(/ZABLOKOWANE/g)?.length).toBe(2);
      expect(html).toContain('NOTATNIK');
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
      expect(htmlTarget).toContain('//BAZA_CELU: PETROLOG');
      expect(htmlTarget).toContain('1 POZNAJ');
      expect(htmlTarget).toContain('2 ZBADAJ');
      expect(htmlTarget).toContain('3 ZDECYDUJ');

      // SocialIntelApp z pustym configiem
      const htmlSocial = renderToString(
        React.createElement(SocialIntelApp, {
          config: {} as any,
          onComplete: vi.fn()
        })
      );
      expect(htmlSocial).toContain('//SOCIAL_MEDIA');
      expect(htmlSocial).toContain('PRECYZJA WYWIADU');
    });

    it('posiada drzewo decyzyjne w PhishingBuilder: mufina.org.pl oferuje opcje wypieku muffinek a dalekbieg.info opcje biegowe', async () => {
      const { phishingBuilderConfig } = await import('../src/scenarios/mission_01_petrolog/stages');
      expect(phishingBuilderConfig.payloadByDomain).toBeDefined();

      const runningPayload = phishingBuilderConfig.payloadByDomain?.['dalekbieg_info'];
      expect(runningPayload).toBeDefined();
      expect(runningPayload?.options.some((o) => o.id === 'guide_running')).toBe(true);
      expect(runningPayload?.options.some((o) => o.id === 'wallpapers_running')).toBe(true);

      const muffinPayload = phishingBuilderConfig.payloadByDomain?.['mufina_org_pl'];
      expect(muffinPayload).toBeDefined();
      expect(muffinPayload?.options.some((o) => o.id === 'guide_muffins')).toBe(true);
      expect(muffinPayload?.options.some((o) => o.id === 'wallpapers_muffins')).toBe(true);
      expect(muffinPayload?.options.some((o) => o.id === 'source_code_muffins')).toBe(true);

      const idealMuffin = muffinPayload?.options.find((o) => o.id === 'guide_muffins');
      expect(idealMuffin?.tier).toBe('ideal');
      expect(idealMuffin?.label).toContain('MUFFINKI');
      expect(idealMuffin?.tags).toContain('PRZEPISY');

      const subMuffin = muffinPayload?.options.find((o) => o.id === 'wallpapers_muffins');
      expect(subMuffin?.tier).toBe('suboptimal');
      expect(subMuffin?.label).toContain('TAPETY');

      const critMuffin = muffinPayload?.options.find((o) => o.id === 'source_code_muffins');
      expect(critMuffin?.tier).toBe('critical');
      expect(critMuffin?.label).toContain('KOD ŹRÓDŁOWY');
    });

    it('renderuje WebsitePreview z podglądem muffinek dla mufina_org_pl', async () => {
      const React = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { WebsitePreview } = await import('../src/scenarios/mission_01_petrolog/minigames/WebsitePreview');

      const htmlMuffin = renderToString(
        React.createElement(WebsitePreview, {
          domainId: 'mufina_org_pl',
          domainLabel: 'MUFINA.ORG.PL',
          payloadId: 'guide_muffins',
          payloadLabel: 'PORADNIK KULINARNY - 10 SPRAWDZONYCH PRZEPISÓW NA DOMOWE MUFFINKI'
        })
      );

      expect(htmlMuffin).toContain('MUFINA.ORG.PL');
      expect(htmlMuffin).toContain('BLOG KULINARNY');
      expect(htmlMuffin).toContain('PORADNIK KULINARNY');
      expect(htmlMuffin).toContain('POBIERZ DARMOWY PRZEPIS');
    });

    it('nie wyświetla adresu e-mail w podglądzie poczty w Kroku 1 (wybór osoby), dopóki gracz nie przejdzie do Kroku 2 (wybór maila)', async () => {
      const React = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { EmailPreview } = await import('../src/scenarios/mission_01_petrolog/minigames/EmailPreview');

      // Krok 1 (step === 'sender'): gracz wybiera tożsamość nadawcy - adres mailowy NIE może być widoczny
      const htmlStep1 = renderToString(
        React.createElement(EmailPreview, {
          senderName: 'Jakub Kwiatkowski',
          senderEmail: null,
          targetDomain: 'dalekbieg.info',
          payloadName: 'Poradnik biegowy',
          step: 'sender'
        })
      );

      expect(htmlStep1).toContain('Jakub Kwiatkowski');
      expect(htmlStep1).not.toContain('k.kwiatkowski@petrolog.com');
      expect(htmlStep1).not.toContain('wybierz_adres');

      // Krok 2 (step === 'email'): gracz przechodzi do wyboru adresu, przed wyborem jest placeholder
      const htmlStep2Empty = renderToString(
        React.createElement(EmailPreview, {
          senderName: 'Jakub Kwiatkowski',
          senderEmail: null,
          targetDomain: 'dalekbieg.info',
          payloadName: 'Poradnik biegowy',
          step: 'email'
        })
      );
      expect(htmlStep2Empty).toContain('Jakub Kwiatkowski');
      expect(htmlStep2Empty).toContain('wybierz adres e-mail powyżej');
      expect(htmlStep2Empty).not.toContain('k.kwiatkowski@petrolog.com');

      // Krok 2 po zaznaczeniu opcji maila: wybrany adres pojawia się w mailu
      const htmlStep2Selected = renderToString(
        React.createElement(EmailPreview, {
          senderName: 'Jakub Kwiatkowski',
          senderEmail: 'K.KWIATKOWSKI@PETROLOG.COM',
          targetDomain: 'dalekbieg.info',
          payloadName: 'Poradnik biegowy',
          step: 'email'
        })
      );
      expect(htmlStep2Selected).toContain('Jakub Kwiatkowski');
      expect(htmlStep2Selected).toContain('k.kwiatkowski@petrolog.com');
    });

    it('posiada w emailSenderConfig opcje zgodne z VR: same adresy email bez podpowiedzi, tagów i opisów', async () => {
      const { emailSenderConfig } = await import('../src/scenarios/mission_01_petrolog/stages');
      expect(emailSenderConfig.senderEmail.options.some((o) => o.label === 'K.KWIATKOWSKI@HACK.COM')).toBe(true);
      expect(emailSenderConfig.senderEmail.options.some((o) => o.label === 'K.KWIATKOWSKI@PETROLOG.COM')).toBe(true);
      expect(emailSenderConfig.senderEmail.options.some((o) => o.label === 'DARKSUN.JAKUB@GMAIL.COM')).toBe(true);
      for (const opt of emailSenderConfig.senderEmail.options) {
        expect(opt.tags || []).toHaveLength(0);
        expect(opt.desc || '').toBe('');
      }
    });
  });
});
