import { describe, it, expect, beforeEach } from 'vitest';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { mission4Definition, mission4Apps } from '../src/scenarios/mission_04_energy_rock';
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
    expect(mission?.step6.choices.length).toBe(9);
    expect(mission?.step6.educationalSlides.length).toBe(3);
  });

  it('loads Mission 4 into useMissionStore and resets state properly', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');

    const state = useMissionStore.getState();
    expect(state.activeMission.mission.id).toBe('mission-4-energy-rock');
    expect(state.activeMission.mission.rewardBtc).toBe(3.79);
    expect(state.score).toBe(100);
    expect(state.playerChoices.length).toBe(9);
    expect(state.systemDate).toBe('19.05.2026');
  });

  it('progresses through boot sequence for Mission 4 and verifies chat greeting', () => {
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
    expect(activeState.chatMessages.some(m => m.text.includes('Energy Rock'))).toBe(true);
    expect(activeState.chatAvailableChoices.some(c => c.id === 'start_virus_m4')).toBe(true);
  });

  it('verifies all Mission 4 application components are exported and registered', () => {
    expect(mission4Apps['virus_database']).toBeDefined();
    expect(mission4Apps['ransomware_builder']).toBeDefined();
    expect(mission4Apps['mail']).toBeDefined();
    expect(mission4Apps['vpn_app']).toBeDefined();
    expect(mission4Apps['victim_workstation']).toBeDefined();
    expect(mission4Apps['negotiation']).toBeDefined();
  });

  it('records decisions, manages unlocks and submits SCORM 2004 completion for Mission 4', () => {
    const store = useMissionStore.getState();
    store.loadMission('mission-4-energy-rock');
    store.finishBiosBoot();

    // Step 1: Ransomware selected
    store.recordChoice({
      num: 1,
      question: 'Wybierz odpowiedniego wirusa:',
      answer: 'RANSOMWARE',
      isCorrect: true,
      details: 'Paraliżuje serwery ofiary pod przykrywką szantażu.'
    });
    store.unlockIcon('ransomware_compiled');
    store.unlockIcon('ransomware_builder');

    expect(useMissionStore.getState().unlockedIcons).toContain('ransomware_compiled');

    // Step 2: Password Generator (5/5)
    store.recordChoice({
      num: 2,
      question: 'Siła wygenerowanego hasła:',
      answer: '5/5 (24 znaki, pełny charset)',
      isCorrect: true,
      details: 'Maksymalna entropia klucza.'
    });

    // Step 3: Extortion (TAK)
    store.recordChoice({
      num: 3,
      question: 'Czy warto wyłudzić okup?',
      answer: 'TAK (Double Extortion)',
      isCorrect: true,
      details: 'Zasłona dymna.'
    });

    // Step 4: Red Ransom Note
    store.recordChoice({
      num: 4,
      question: 'Wybierz kolor okna i elementów:',
      answer: 'CZERWONY',
      isCorrect: true,
      details: 'Kolor alarmowy.'
    });
    store.unlockIcon('mail_unlocked');
    store.unlockIcon('vpn_unlocked');

    // Step 5: Subject
    store.recordChoice({
      num: 5,
      question: 'Wybierz temat maila:',
      answer: 'CV MICHAŁ WILK',
      isCorrect: true,
      details: 'Zgodny z wymogami HR.'
    });

    // Step 6: Body
    store.recordChoice({
      num: 6,
      question: 'Wybierz treść maila:',
      answer: 'Formalna treść + hasło MWILK',
      isCorrect: true,
      details: 'Omija skaner poczty.'
    });

    // Step 7: VPN
    store.recordChoice({
      num: 7,
      question: 'Ukrycie tożsamości / VPN nadawcy:',
      answer: 'm.wilk@priv.com (IP: 109.43.200.124)',
      isCorrect: true,
      details: 'Zgodny subnet i nadawca.'
    });
    store.unlockIcon('victim_workstation_unlocked');

    // Step 8: File exfiltration
    store.recordChoice({
      num: 8,
      question: 'Wybór plików do kradzieży:',
      answer: 'Kompletny zestaw dokumentacji technologii Freevolt (3 pliki)',
      isCorrect: true,
      details: '3 pliki Freevolt bez honeypotów.'
    });
    store.unlockIcon('negotiation_unlocked');

    // Step 9: Negotiations
    store.recordChoice({
      num: 9,
      question: 'Negocjacje z ofiarą:',
      answer: 'Twardy termin 3h i żądanie BTC',
      isCorrect: true,
      details: 'Presja czasowa uniemożliwia przywrócenie backupu.'
    });
    store.unlockIcon('mission_completed');
    store.unlockIcon('debrief_app');

    // Submit SCORM
    const submitResult = store.submitScormAndExit();
    expect(submitResult.success).toBe(true);

    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.completion_status')).toBe('completed');
    expect(api.GetValue('cmi.success_status')).toBe('passed');
    expect(api.GetValue('cmi.score.raw')).toBe('100');
    expect(api.GetValue('cmi.location')).toBe('mission-4-energy-rock_debriefing_completed');

    // Create xAPI statement
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
});
