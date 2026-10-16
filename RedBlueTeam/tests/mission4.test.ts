import { describe, it, expect, beforeEach } from 'vitest';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { mission4Definition, mission4Apps } from '../src/scenarios/mission_04_energy_rock';
import type { ChoiceOutcome } from '../src/engine/types/mission';
import { scorm2004, MockSCORM2004 } from '../src/engine/scorm/scorm2004';
import { createMissionCompletionStatement, MockLRS } from '../src/engine/scorm/xapi';

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
    expect(mission?.mission.accentColor).toBe('#a855f7');
    expect(mission?.mission.rewardBtc).toBe(3.79);
    expect(mission?.mission.maxScore).toBe(100);
    expect(mission?.mission.passingScore).toBe(70);
    expect(mission?.mission.decisionCount).toBe(10);
    expect(mission?.step6.choices.length).toBe(10);
    expect(mission?.step6.educationalSlides.length).toBe(3);
  });

  it('loads Mission 4 into useMissionStore and resets state properly', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');

    const state = useMissionStore.getState();
    expect(state.activeMission.mission.id).toBe('mission-4-energy-rock');
    expect(state.activeMission.mission.rewardBtc).toBe(3.79);
    expect(state.score).toBe(100);
    expect(state.playerChoices.length).toBe(10);
    expect(state.systemDate).toBe('19.05.2026');
  });

  it('progresses through boot sequence and uses data-driven opening chat', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');

    expect(store.bootStage).toBe('incoming_call');
    store.acceptIncomingCall();
    expect(useMissionStore.getState().bootStage).toBe('intro_chat');

    store.startBiosBoot();
    expect(useMissionStore.getState().bootStage).toBe('bios_boot');

    store.finishBiosBoot();
    const activeState = useMissionStore.getState();
    expect(activeState.bootStage).toBe('desktop');
    // Rozmowa intro „przenosi się" do logu czatu + greeting na pulpicie.
    expect(activeState.chatMessages.some(m => m.text.includes('FREEVOLT'))).toBe(true);
    expect(activeState.chatMessages.some(m => m.text.includes('ENERGY ROCK'))).toBe(true);
    // Pierwszy wybór to kwestia gracza z VR (reply) — NIE otwiera aplikacji; kafelek jest podświetlony.
    const first = activeState.chatAvailableChoices[0];
    expect(first?.reply).toBe(true);
    expect(first?.openAppId).toBeUndefined();
    expect(activeState.highlightedTileId).toBe('virus_database');
  });

  it('rejestruje minigry M4 w silniku i mapuje negocjacje na klocek katalogu', () => {
    // Minigry misji rejestrują się przez registerApp przy załadowaniu scenariusza.
    expect(mission4Apps['ransomware_virus_scanner']).toBeDefined();
    expect(mission4Apps['ransomware_builder']).toBeDefined();
    expect(mission4Apps['mail']).toBeDefined();
    expect(mission4Apps['vpn_app']).toBeDefined();
    expect(mission4Apps['victim_workstation']).toBeDefined();
    expect(appComponentRegistry['ransomware_virus_scanner']).toBeDefined();
    expect(appComponentRegistry['victim_workstation']).toBeDefined();
    // Negocjacje idą przez katalogowy DialogueTree, nie przez dedykowaną minigrę.
    const negotiationTile = mission4Definition.desktopApps.find(t => t.id === 'negotiation');
    expect(negotiationTile?.componentId).toBe('dialogue_tree');
  });

  it('przechodzi wzorcem B przez 10 decyzji i składa paczkę SCORM', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    store.finishBiosBoot();

    const ideal = (num: number, question: string, answer: string) =>
      store.reportDecision({ num, question, answer, tier: 'ideal' as ChoiceOutcome, feedback: '' });

    // Etap 1: wybór wirusa
    ideal(1, 'Wybierz odpowiedniego wirusa:', 'RANSOMWARE');
    store.completeStage('virus_database');
    expect(useMissionStore.getState().unlockedIcons).toContain('ransomware_builder');

    // Etap 2: builder (hasło, komunikat, kolor)
    ideal(2, 'Siła wygenerowanego hasła:', '5/5');
    ideal(3, 'Skomponuj komunikat żądania okupu:', 'Tytuł + realny zegar');
    ideal(4, 'Wybierz kolor okna i elementów:', 'CZERWONY');
    store.completeStage('ransomware_builder');
    expect(useMissionStore.getState().unlockedIcons).toContain('mail');

    // Etap 3: mail (temat, treść)
    ideal(5, 'Wybierz temat maila:', 'CV MICHAŁ WILK');
    ideal(6, 'Wybierz treść maila:', 'WARIANT B');
    store.completeStage('mail');
    expect(useMissionStore.getState().unlockedIcons).toContain('vpn_app');

    // Etap 4: VPN + nadawca
    ideal(7, 'Ukrycie tożsamości / dopasowanie IP (VPN):', '109.43.200.124');
    ideal(8, 'Wybór adresu nadawcy:', 'm.wilk@priv.com');
    store.completeStage('vpn_app');
    expect(useMissionStore.getState().unlockedIcons).toContain('victim_workstation');

    // Etap 5: eksfiltracja
    ideal(9, 'Wybór plików do kradzieży:', '3 pliki Freevolt');
    store.completeStage('victim_workstation');
    expect(useMissionStore.getState().unlockedIcons).toContain('negotiation');

    // Etap 6: negocjacje
    ideal(10, 'Negocjacje z ofiarą:', 'Limit 3h + BTC');
    store.completeStage('negotiation');
    const finalState = useMissionStore.getState();
    expect(finalState.unlockedIcons).toContain('mission_completed');
    expect(finalState.unlockedIcons).toContain('debrief_app');

    // Wszystkie decyzje idealne → pełny wynik.
    expect(finalState.score).toBe(100);
    expect(finalState.playerChoices.filter(c => c.outcome === 'ideal').length).toBe(10);

    const submitResult = store.submitScormAndExit();
    expect(submitResult.success).toBe(true);

    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.completion_status')).toBe('completed');
    expect(api.GetValue('cmi.success_status')).toBe('passed');
    expect(api.GetValue('cmi.score.raw')).toBe('100');
    expect(api.GetValue('cmi.location')).toBe('mission-4-energy-rock_debriefing_completed');

    const statement = createMissionCompletionStatement(
      { name: 'Agent Wilk', mbox: 'mailto:m.wilk@priv.com' },
      100,
      'Mission 4: Energy Rock completed',
      mission4Definition.mission
    );
    expect(statement.object.id).toContain('mission-4-energy-rock');
    expect(statement.result.success).toBe(true);
    expect(statement.result.score.raw).toBe(100);
  });

  it('czat nie jest launcherem: completeStage odblokowuje i podświetla, ale nie otwiera aplikacji', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    store.finishBiosBoot();
    store.openApp('virus_database');
    expect(useMissionStore.getState().activeApp).toBe('virus_database');

    store.completeStage('virus_database');
    const s = useMissionStore.getState();
    expect(s.activeApp).toBeNull(); // powrót na pulpit, bez auto-otwierania
    expect(s.unlockedIcons).toContain('ransomware_builder');
    expect(s.highlightedTileId).toBe('ransomware_builder'); // kolejny kafelek podświetlony
  });

  it('kwestia gracza (reply) wysyła echo i nie otwiera aplikacji', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    store.finishBiosBoot();
    const first = useMissionStore.getState().chatAvailableChoices[0];
    expect(first.reply).toBe(true);

    store.chooseChatOption(first.id);
    const after = useMissionStore.getState();
    expect(after.activeApp).toBeNull();
    expect(after.chatMessages.some(m => m.sender === 'PLAYER' && m.text === first.label)).toBe(true);
    expect(after.chatAvailableChoices.length).toBe(0);
  });

  it('błąd krytyczny w eksfiltracji (honeypot) otwiera ekran wykrycia', () => {
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
});
