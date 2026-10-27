import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { mission4Definition, mission4Apps } from '../src/scenarios/mission_04_energy_rock';
import type { ChoiceOutcome } from '../src/engine/types/mission';
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

describe('Mission 4: Energy Rock Scenario & SCORM Engine', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    MockLRS.clear();
  });

  it('correctly loads Mission 4 definition from registry with proper metadata', () => {
    const mission = getMission('mission-4-energy-rock');
    expect(mission).toBeDefined();
    expect(mission?.mission.id).toBe('mission-4-energy-rock');
    expect(mission?.mission.title).toBe('MISJA 4 – ENERGY ROCK');
    expect(mission?.mission.targetCompany).toBe('Energy Rock');
    expect(mission?.mission.rewardBtc).toBe(3.79);
    expect(mission?.mission.decisionCount).toBe(10);
    expect(mission?.step6.choices.length).toBe(10);
    expect(mission?.step6.educationalSlides.length).toBe(3);
  });

  it('loads Mission 4 into useMissionStore and resets state properly', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    const state = useMissionStore.getState();
    expect(state.activeMission.mission.id).toBe('mission-4-energy-rock');
    expect(state.score).toBe(100);
    expect(state.playerChoices.length).toBe(10);
    expect(state.systemDate).toBe('19.05.2026');
  });

  it('intro przenosi się do logu czatu, a aplikacje są zablokowane do pierwszej kwestii gracza', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    store.finishBiosBoot();

    const s = useMissionStore.getState();
    expect(s.bootStage).toBe('desktop');
    // Rozmowa intro w logu czatu (bez wymyślonego greetingu).
    expect(s.chatMessages.some(m => m.text.includes('FREEVOLT'))).toBe(true);
    expect(s.chatMessages.some(m => m.text.includes('ENERGY ROCK'))).toBe(true);
    // Pierwszy wybór to kwestia gracza z VR w rozmowie mostkującej; baza wirusów jeszcze zablokowana.
    const first = s.chatAvailableChoices[0];
    expect(first?.bridgeBeat).toBe(true);
    expect(first?.openAppId).toBeUndefined();
    expect(s.highlightedTileId).toBeNull();
    expect(s.unlockedIcons).not.toContain('virus_database_unlocked');
  });

  it('rejestruje minigry M4 i mapuje negocjacje na klocek katalogu', () => {
    expect(mission4Apps['ransomware_virus_scanner']).toBeDefined();
    expect(mission4Apps['ransomware_builder']).toBeDefined();
    expect(mission4Apps['mail']).toBeDefined();
    expect(mission4Apps['vpn_app']).toBeDefined();
    expect(mission4Apps['victim_workstation']).toBeDefined();
    expect(appComponentRegistry['ransomware_virus_scanner']).toBeDefined();
    expect(appComponentRegistry['victim_workstation']).toBeDefined();
    const negotiationTile = mission4Definition.desktopApps.find(t => t.id === 'negotiation');
    expect(negotiationTile?.componentId).toBe('dialogue_tree');
  });

  describe('przepływ z rozmowami mostkującymi', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      __setBridgeDelayForTests(0);
    });
    afterEach(() => {
      vi.useRealTimers();
      __setBridgeDelayForTests(2000);
    });

    it('kwestia gracza w czacie odblokowuje aplikację (apps locked) i nie otwiera okna', () => {
      const store = useMissionStore.getState();
      store.loadMission('mission-4-energy-rock');
      store.finishBiosBoot();

      const first = useMissionStore.getState().chatAvailableChoices[0];
      expect(first.bridgeBeat).toBe(true);

      store.chooseChatOption(first.id);
      driveBridge();

      const after = useMissionStore.getState();
      expect(after.activeApp).toBeNull(); // czat nie otwiera aplikacji
      expect(after.chatMessages.some(m => m.sender === 'PLAYER' && m.text === first.label)).toBe(true);
      expect(after.unlockedIcons).toContain('virus_database_unlocked'); // dopiero teraz odblokowane
      expect(after.highlightedTileId).toBe('virus_database');
    });

    it('completeStage uruchamia rozmowę; odblokowanie następuje PO kwestii gracza', () => {
      const store = useMissionStore.getState();
      store.loadMission('mission-4-energy-rock');
      store.finishBiosBoot();
      store.openApp('virus_database');

      store.completeStage('virus_database');
      const mid = useMissionStore.getState();
      expect(mid.activeApp).toBeNull(); // powrót na pulpit
      expect(mid.unlockedIcons).not.toContain('ransomware_builder'); // jeszcze nie — rozmowa trwa

      driveBridge();
      const done = useMissionStore.getState();
      expect(done.unlockedIcons).toContain('ransomware_builder');
      expect(done.highlightedTileId).toBe('ransomware_builder');
    });

    it('przechodzi wzorcem B przez 10 decyzji i składa paczkę SCORM', () => {
      const store = useMissionStore.getState();
      store.loadMission('mission-4-energy-rock');
      store.finishBiosBoot();
      driveBridge(); // intro → odblokowanie bazy wirusów

      const ideal = (num: number, question: string, answer: string) =>
        store.reportDecision({ num, question, answer, tier: 'ideal' as ChoiceOutcome, feedback: '' });

      ideal(1, 'Wybierz odpowiedniego wirusa:', 'RANSOMWARE');
      store.completeStage('virus_database'); driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('ransomware_builder');

      ideal(2, 'Siła hasła:', '5/5'); ideal(3, 'Komunikat okupu:', 'OK'); ideal(4, 'Kolor:', 'CZERWONY');
      store.completeStage('ransomware_builder'); driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('mail');

      ideal(5, 'Temat maila:', 'CV MICHAŁ WILK'); ideal(6, 'Treść maila:', 'WARIANT B');
      store.completeStage('mail'); driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('vpn_app');

      ideal(7, 'VPN:', '109.43.200.124'); ideal(8, 'Nadawca:', 'm.wilk@priv.com');
      store.completeStage('vpn_app'); driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('victim_workstation');

      ideal(9, 'Pliki:', '3 Freevolt');
      store.completeStage('victim_workstation'); driveBridge();
      expect(useMissionStore.getState().unlockedIcons).toContain('negotiation');

      ideal(10, 'Negocjacje:', 'Limit 3h + BTC');
      store.completeStage('negotiation'); driveBridge();
      const finalState = useMissionStore.getState();
      expect(finalState.unlockedIcons).toContain('mission_completed');
      expect(finalState.unlockedIcons).toContain('debrief_app');
      expect(finalState.score).toBe(100);
      expect(finalState.playerChoices.filter(c => c.outcome === 'ideal').length).toBe(10);
      expect(finalState.playerChoices.find(c => c.num === 10)?.negotiationTranscript?.length).toBe(3);

      const submitResult = store.submitScormAndExit();
      expect(submitResult.success).toBe(true);
      const api = scorm2004.getApi() as MockSCORM2004;
      expect(api.GetValue('cmi.success_status')).toBe('passed');
      expect(api.GetValue('cmi.score.raw')).toBe('100');

      const statement = createMissionCompletionStatement(
        { name: 'Agent Wilk', mbox: 'mailto:m.wilk@priv.com' },
        100, 'Mission 4: Energy Rock completed', mission4Definition.mission
      );
      expect(statement.result.success).toBe(true);
    });
  });

  it('błąd krytyczny w eksfiltracji otwiera ekran wykrycia', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    store.reportDecision({
      num: 9,
      question: 'Wybór plików do kradzieży:',
      answer: 'Pobrano plik-pułapkę',
      tier: 'critical',
      feedback: 'Honeypot uruchomił odcięcie transferu.'
    });
    const state = useMissionStore.getState();
    expect(state.isDetectedModalOpen).toBe(true);
    expect(state.criticalErrorsCount).toBe(1);
    expect(state.score).toBeLessThan(100);
  });

  it('decyzja D10 w debriefie zawiera mini-transkrypt negocjacji z 3 turami i analizą psychologiczną', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    const state = useMissionStore.getState();

    const d10 = state.playerChoices.find((c) => c.num === 10);
    expect(d10).toBeDefined();
    expect(d10?.negotiationTranscript).toBeDefined();
    expect(d10?.negotiationTranscript?.length).toBe(3);

    const [turn1, turn2, turn3] = d10!.negotiationTranscript!;
    expect(turn1.title).toContain('Tura 1');
    expect(turn1.opponent).toContain('SŁUŻBY');
    expect(turn1.player).toContain('NIE ODSZYFRUJĄ');
    expect(turn1.psychology.length).toBeGreaterThan(15);

    expect(turn2.title).toContain('Tura 2');
    expect(turn2.player).toContain('BITCOINY');
    expect(turn2.psychology.length).toBeGreaterThan(15);

    expect(turn3.title).toContain('Tura 3');
    expect(turn3.player).toContain('3 H');
    expect(turn3.psychology.length).toBeGreaterThan(15);
  });
});
