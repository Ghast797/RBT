import { describe, it, expect, beforeEach } from 'vitest';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { MockLRS } from '../src/engine/scorm/xapi';
import { scorm2004 } from '../src/engine/scorm/scorm2004';

// Ogólne zachowanie store'u silnika (boot, pulpit, xAPI) na misji wzorca B.
// Zastępuje dawne testy maszyny stanów Misji 3 (`chatStage`), usuniętej z silnika.
const MISSION_ID = 'mission-1-petrolog';

describe('Store silnika: boot, otwarcie czatu i xAPI', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().loadMission(MISSION_ID);
    MockLRS.clear();
  });

  it('startuje od połączenia przychodzącego, bez otwartej aplikacji i z pełnym wynikiem', () => {
    const state = useMissionStore.getState();
    expect(state.activeMission.mission.id).toBe(MISSION_ID);
    expect(state.bootStage).toBe('incoming_call');
    expect(state.activeApp).toBeNull();
    expect(state.score).toBe(state.activeMission.mission.maxScore);
    // Bez domyślnych badge'y innej misji: przed startem pulpitu nic nie świeci.
    expect(state.notificationBadges).toEqual({});
  });

  it('misja bez intro.firstChoice/firstUnlock startuje pulpit z samą historią intro', () => {
    const base = useMissionStore.getState().activeMission;
    const { firstChoice: _fc, firstUnlock: _fu, startBadges: _sb, ...intro } = base.intro as Record<string, unknown>;
    useMissionStore.getState().loadMission({ ...base, intro } as typeof base);
    useMissionStore.getState().finishBiosBoot();

    const state = useMissionStore.getState();
    expect(state.bootStage).toBe('desktop');
    expect(state.chatAvailableChoices).toEqual([]);
    expect(state.pendingBridge).toBeNull();
    expect(state.notificationBadges).toEqual({});
    expect(state.chatMessages.every((m) => m.id.startsWith('intro_'))).toBe(true);
  });

  it('nie zawiera starego przebiegu Misji 3', () => {
    const state = useMissionStore.getState() as unknown as Record<string, unknown>;
    for (const legacy of ['chatStage', 'selectedVirus', 'droneFlightState', 'runScenarioTransition', 'selectVirusCard', 'hasUsbInserted']) {
      expect(state).not.toHaveProperty(legacy);
    }
  });

  it('przechodzi sekwencję startu do pulpitu i otwiera rozmowę kwestią gracza z intro', () => {
    const store = useMissionStore.getState();
    store.acceptIncomingCall();
    expect(useMissionStore.getState().bootStage).toBe('intro_chat');

    store.startBiosBoot();
    expect(useMissionStore.getState().bootStage).toBe('bios_boot');

    store.finishBiosBoot();
    const state = useMissionStore.getState();
    const firstChoice = state.activeMission.intro.firstChoice;
    expect(state.bootStage).toBe('desktop');
    expect(state.chatAvailableChoices).toEqual([
      { id: firstChoice.id, label: firstChoice.label, bridgeBeat: true }
    ]);
  });

  it('openDebrief otwiera raport i wysyła zdanie xAPI dla aktywnej misji', () => {
    useMissionStore.getState().openDebrief();
    expect(useMissionStore.getState().activeApp).toBe('debrief_app');
    expect(useMissionStore.getState().xapiSent).toBe(true);

    const statements = MockLRS.getStatements();
    expect(statements.length).toBe(1);
    const statement = statements[0];
    expect(statement.object.id).toContain(MISSION_ID);
    expect(statement.verb.id).toContain('passed');
    expect(statement.result.score.raw).toBe(100);
    expect(statement.result.success).toBe(true);
    expect(statement.result.extensions?.['https://cybersec-training.internal/extensions/status']).toBe('terminated');
  });

  it('zdanie xAPI z openDebrief bierze opis z metadanych misji, bez zaszytych tekstów konkretnego scenariusza', () => {
    useMissionStore.getState().openDebrief();
    const statement = MockLRS.getStatements()[0];
    const json = JSON.stringify(statement);
    expect(json).not.toMatch(/social engineering|Infiltrator/i);
    const { title } = useMissionStore.getState().activeMission.mission;
    expect(json).toContain(title);
  });
});
