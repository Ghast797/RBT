import { describe, it, expect, beforeEach } from 'vitest';
import { useMissionStore } from '../src/store/useMissionStore';
import { MockLRS } from '../src/utils/xapi';

describe('Mission 3: O&L Company VR State Machine & xAPI', () => {
  beforeEach(() => {
    useMissionStore.getState().resetGame();
    MockLRS.clear();
  });

  it('initializes with incoming call boot stage', () => {
    const state = useMissionStore.getState();
    expect(state.bootStage).toBe('incoming_call');
    expect(state.activeApp).toBeNull();
    expect(state.score).toBe(100);
  });

  it('progresses through boot sequence to desktop', () => {
    const store = useMissionStore.getState();
    store.acceptIncomingCall();
    expect(useMissionStore.getState().bootStage).toBe('intro_chat');

    store.startBiosBoot();
    expect(useMissionStore.getState().bootStage).toBe('bios_boot');

    store.finishBiosBoot();
    expect(useMissionStore.getState().bootStage).toBe('desktop');
    expect(useMissionStore.getState().chatAvailableChoices.length).toBeGreaterThan(0);
  });

  it('handles RAT selection, builder configuration and compilation', async () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    
    // Select RAT
    store.selectVirusCard('rat');
    expect(useMissionStore.getState().selectedVirus).toBe('rat');

    // Configure builder parameters
    store.setBuilderModule('reverse_tcp');
    store.setBuilderMasking('bg_service');
    store.setBuilderPackage('dll_archive');

    // Compile payload
    const compilePromise = store.compileRatPayload();
    expect(useMissionStore.getState().isRatCompiling).toBe(true);

    await compilePromise;
    expect(useMissionStore.getState().isRatCompiled).toBe(true);

    // Finish step and verify rat_virus unlocked on desktop
    store.finishRatStep();
    expect(useMissionStore.getState().unlockedIcons).toContain('rat_virus');
    expect(useMissionStore.getState().activeApp).toBeNull();
  });

  it('completes drone drop, desktop takeover and sends xAPI statement', async () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();

    // Attach envelope to drone
    store.attachEnvelopeToDrone();
    expect(useMissionStore.getState().droneFlightState).toBe('waiting_coords');

    // Select Ołtaszyńska 92C
    store.selectDroneCoord('loc_4');
    store.confirmDroneCoords();
    expect(useMissionStore.getState().droneFlightState).toBe('flying');

    // Target car (white hatchback with red roof, car id 4)
    store.activateDroneCamera();
    store.selectCarTarget(4);
    await store.dropPayloadOnCar();
    expect(useMissionStore.getState().droneDropSuccess).toBe(true);

    // Trigger infection & takeover
    store.triggerMalwareAlarm();
    expect(useMissionStore.getState().isAlarmActive).toBe(true);

    store.launchDesktopTakeover();
    expect(useMissionStore.getState().isDesktopTakeoverActive).toBe(true);

    // Open network graph & debrief
    store.openNetworkGraph();
    store.openDebrief();
    expect(useMissionStore.getState().activeApp).toBe('debrief_app');

    // Verify MockLRS received statement
    const statements = MockLRS.getStatements();
    expect(statements.length).toBeGreaterThan(0);
    const lastStatement = statements[statements.length - 1];
    expect(lastStatement.verb.id).toContain('passed');
    expect(lastStatement.result.score.raw).toBe(100);
    expect(lastStatement.result.success).toBe(true);
    expect(lastStatement.result.extensions?.['https://cybersec-training.internal/extensions/status']).toBe('terminated');
  });

  it('handles target selection branching and records errors for wrong targets', async () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    store.finishRatStep();

    // Open browser to trigger target options
    store.openApp('browser');
    expect(useMissionStore.getState().chatStage).toBe('choose_target');
    expect(useMissionStore.getState().chatAvailableChoices.length).toBe(4);

    // Player wrongly picks CEO (Jan Łukasiewicz)
    store.chooseChatOption('choose_ceo');
    expect(useMissionStore.getState().isByteMasterTyping).toBe(true);
    expect(useMissionStore.getState().playerChoices[1].isCorrect).toBe(false);
    expect(useMissionStore.getState().playerChoices[1].answer).toContain('JAN ŁUKASIEWICZ');

    // Fast forward typing timer
    await new Promise((r) => setTimeout(r, 2100));
    expect(useMissionStore.getState().isByteMasterTyping).toBe(false);
    expect(useMissionStore.getState().score).toBe(90);
    expect(useMissionStore.getState().criticalErrorsCount).toBe(1);

    // Now player picks Mateusz
    store.chooseChatOption('choose_mateusz');
    expect(useMissionStore.getState().isByteMasterTyping).toBe(true);
    expect(useMissionStore.getState().playerChoices[1].isCorrect).toBe(true);

    await new Promise((r) => setTimeout(r, 2100));
    expect(useMissionStore.getState().isByteMasterTyping).toBe(false);
    expect(useMissionStore.getState().chatStage).toBe('awaiting_events');
    expect(useMissionStore.getState().chatAvailableChoices.length).toBe(0);

    // Player checks the Wydarzenia tab to discover context about the company party
    store.viewEventsTab();
    expect(useMissionStore.getState().hasViewedEvents).toBe(true);
    expect(useMissionStore.getState().chatStage).toBe('choose_vector');
    expect(useMissionStore.getState().chatAvailableChoices.length).toBe(2);
  });

  it('validates RAT builder parameter selection and error handling', async () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    store.selectVirusCard('rat');

    // Initially none of the 3 builder parameters are selected
    expect(useMissionStore.getState().builderModule).toBeNull();
    expect(useMissionStore.getState().builderMasking).toBeNull();
    expect(useMissionStore.getState().builderPackage).toBeNull();

    // Trying to compile without selection fails with error
    await store.compileRatPayload();
    expect(useMissionStore.getState().builderError).toContain('WYBIERZ WSZYSTKIE 3 PARAMETRY');
    expect(useMissionStore.getState().isRatCompiled).toBe(false);

    // Pick wrong module
    store.setBuilderModule('port_scan');
    store.setBuilderMasking('bg_service');
    store.setBuilderPackage('dll_archive');
    await store.compileRatPayload();
    expect(useMissionStore.getState().builderError).toContain('Port Scan');
    expect(useMissionStore.getState().score).toBeLessThan(100);

    // Correct the module
    store.setBuilderModule('reverse_tcp');
    const compilePromise = store.compileRatPayload();
    expect(useMissionStore.getState().isRatCompiling).toBe(true);
    await compilePromise;
    expect(useMissionStore.getState().isRatCompiled).toBe(true);
    expect(useMissionStore.getState().builderError).toBeNull();
  });
});

