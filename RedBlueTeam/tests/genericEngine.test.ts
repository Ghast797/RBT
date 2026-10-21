import { describe, it, expect, beforeEach } from 'vitest';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { registerMission, getMission, resolveInitialMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry, registerApp, renderAppIcon } from '../src/engine/registry/appRegistry';
import { createMissionCompletionStatement, MockLRS } from '../src/engine/scorm/xapi';
import { scorm2004, MockSCORM2004 } from '../src/engine/scorm/scorm2004';
import type { MissionDefinition } from '../src/engine/types/mission';

const mockMission99: MissionDefinition = {
  mission: {
    id: 'mission-99-bank-heist',
    title: 'MISJA 99 – CYBER BANK HEIST',
    subTitle: 'Zaawansowany atak na bankomat i sieć SWIFT',
    systemOs: '//HACKERS.OS-CUSTOM',
    date: '01.01.2030',
    accentColor: '#ff0055',
    rewardBtc: 12.5,
    maxScore: 100,
    passingScore: 75,
    targetCompany: 'Global Bank Corp',
    description: 'Zaawansowana symulacja infiltracji banku'
  },
  intro: {
    callerName: 'CIPHER_GHOST',
    callStatus: 'POŁĄCZENIE SZYFROWANE SWIFT',
    dialogue: [
      {
        id: 'intro_mock_1',
        sender: 'CIPHER_GHOST',
        text: 'Mamy cel: serwery banku.',
        playerResponse: 'Wchodzę w to.'
      }
    ],
    biosLines: ['BANKOS KERNEL v99', 'BOOT OK']
  },
  desktopApps: [
    {
      id: 'vpn_tool',
      label: '//VPN_TUNNEL',
      color: '#3b82f6',
      icon: 'Lock',
      componentId: 'vpn_tool'
    },
    {
      id: 'chat_shortcut',
      label: '//CHAT: CIPHER_GHOST',
      color: '#ff0055',
      icon: 'MessageSquareCode',
      componentId: 'chat',
      isChatFocus: true
    }
  ],
  transitions: {
    step1_complete: {
      id: 'step1_complete',
      closeActiveApp: true,
      unlockIcons: ['custom_tool_unlocked'],
      badges: { chat: 1 },
      timeJump: '04:15',
      byteMasterMessages: [
        { text: 'Dobra robota, tunel VPN postawiony. Przejdź do exploita.' }
      ],
      nextChatChoices: [
        { id: 'start_exploit', label: 'OTWIERAM EXPLOIT', openAppId: 'vpn_tool' }
      ]
    }
  },
  step6: {
    summary: {
      title: 'SUKCES',
      subtitle: 'UKOŃCZONO MISJĘ 99',
      company: 'Global Bank Corp',
      scorePercent: 100,
      perfectChoices: 2,
      goodChoices: 0,
      criticalErrors: 0,
      btcReward: 12.5
    },
    choices: [
      {
        num: 1,
        question: 'Wybierz wektor ataku na sieć banku:',
        answer: 'Zatrucie ARP w podsieci bankomatu',
        correct: true,
        details: 'Optymalny wektor MITM.'
      },
      {
        num: 2,
        question: 'Wskaż metodę eksfiltracji:',
        answer: 'Ukryty tunel DNS',
        correct: true,
        details: 'Omija reguły firewalla.'
      }
    ],
    educationalSlides: [
      {
        title: 'SEGMENTACJA SIECI',
        desc: 'Bankomaty muszą znajdować się w odizolowanym VLAN.'
      }
    ]
  }
};

describe('Generic SCORM Scenario Engine', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    MockLRS.clear();
  });

  it('resolves and loads default mission correctly', () => {
    const mission = resolveInitialMission();
    expect(mission.mission.id).toBe('mission-3-ol-company');
    expect(mission.desktopApps.length).toBeGreaterThan(0);
  });

  it('dynamically registers and loads a new mission from MissionDefinition', () => {
    registerMission('mission-99', mockMission99);
    const retrieved = getMission('mission-99');
    expect(retrieved).toBeDefined();
    expect(retrieved?.mission.title).toBe('MISJA 99 – CYBER BANK HEIST');

    const store = useMissionStore.getState();
    store.loadMission('mission-99');

    const currentState = useMissionStore.getState();
    expect(currentState.activeMission.mission.id).toBe('mission-99-bank-heist');
    expect(currentState.activeMission.mission.rewardBtc).toBe(12.5);
    expect(currentState.systemDate).toBe('01.01.2030');
    expect(currentState.playerChoices.length).toBe(2);
    expect(currentState.playerChoices[0].question).toContain('sieć banku');
  });

  it('supports custom state bag for mission-specific mini-games', () => {
    const store = useMissionStore.getState();
    expect(store.customState).toEqual({});

    store.setCustomState('vpnConnected', true);
    expect(useMissionStore.getState().customState.vpnConnected).toBe(true);

    store.updateCustomState({ tunnelIp: '10.8.0.1', handshakeComplete: true });
    expect(useMissionStore.getState().customState.tunnelIp).toBe('10.8.0.1');
    expect(useMissionStore.getState().customState.handshakeComplete).toBe(true);
    expect(useMissionStore.getState().customState.vpnConnected).toBe(true);
  });

  it('supports dynamic app registration and Lucide icon resolution in AppRegistry', () => {
    const DummyComponent = () => null;
    registerApp('custom_exploit_tool', DummyComponent);
    expect(appComponentRegistry['custom_exploit_tool']).toBe(DummyComponent);

    // Verify icons render without crashing
    expect(renderAppIcon('Terminal')).toBeDefined();
    expect(renderAppIcon('Lock')).toBeDefined();
    expect(renderAppIcon('Server')).toBeDefined();
    expect(renderAppIcon('UnknownIcon')).toBeDefined();
  });

  it('records choices and adjusts scoring dynamically', () => {
    const store = useMissionStore.getState();
    store.loadMission(mockMission99);

    expect(useMissionStore.getState().score).toBe(100);
    expect(useMissionStore.getState().criticalErrorsCount).toBe(0);

    // Record an incorrect player choice
    store.recordChoice({
      num: 1,
      question: 'Wybierz wektor ataku na sieć banku:',
      answer: 'Atak DDoS na stronę główną',
      isCorrect: false,
      details: 'DDoS zaalarmuje SOC banku!'
    }, 20);

    const stateAfterChoice = useMissionStore.getState();
    expect(stateAfterChoice.score).toBe(80);
    expect(stateAfterChoice.criticalErrorsCount).toBe(1);
    expect(stateAfterChoice.playerChoices[0].answer).toBe('Atak DDoS na stronę główną');
    expect(stateAfterChoice.playerChoices[0].isCorrect).toBe(false);
  });

  it('submits SCORM data with dynamic mission id and location', () => {
    const store = useMissionStore.getState();
    store.loadMission(mockMission99);
    store.finishBiosBoot();

    const submitResult = store.submitScormAndExit();
    expect(submitResult.success).toBe(true);

    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.location')).toBe('mission-99-bank-heist_debriefing_completed');
    expect(api.GetValue('cmi.completion_status')).toBe('completed');
    expect(api.GetValue('cmi.score.raw')).toBe('100');
  });

  it('generates dynamic xAPI statement reflecting the active mission', () => {
    const statement = createMissionCompletionStatement(
      { name: 'Agent 99', mbox: 'mailto:agent99@darknet.os' },
      95,
      'Bank infiltration simulation completed',
      mockMission99.mission
    );

    expect(statement.object.id).toBe('https://cybersec-training.internal/activities/mission-99-bank-heist');
    expect(statement.object.definition.name['en-US']).toBe('MISJA 99 – CYBER BANK HEIST');
    expect(statement.result.score.raw).toBe(95);
    expect(statement.result.success).toBe(true);
  });

  it('supports 3-tier choice outcomes (ideal, suboptimal, critical) and btcPenalty', () => {
    const store = useMissionStore.getState();
    store.loadMission(mockMission99);

    const initialScore = store.score;
    const initialBtc = store.btcReward;

    // Suboptimal choice
    store.recordChoice({
      num: 1,
      question: 'Wybór etykiety nośnika:',
      answer: 'Dysk USB B&D',
      isCorrect: false,
      outcome: 'suboptimal',
      btcPenalty: -0.89,
      details: 'Podejrzana nazwa'
    }, 10);

    const afterSuboptimal = useMissionStore.getState();
    expect(afterSuboptimal.goodChoicesCount).toBe(1);
    expect(afterSuboptimal.criticalErrorsCount).toBe(0);
    expect(afterSuboptimal.score).toBe(initialScore - 10);
    expect(afterSuboptimal.btcReward).toBeCloseTo(initialBtc - 0.89, 2);
    expect(afterSuboptimal.playerChoices[0].outcome).toBe('suboptimal');
  });

  it('triggers critical detection modal and supports retry workflows', () => {
    const store = useMissionStore.getState();
    store.loadMission(mockMission99);

    expect(store.isDetectedModalOpen).toBe(false);
    expect(store.isRetryModalOpen).toBe(false);

    // Trigger detection
    store.triggerDetection('ALARM DETEKCJI', 'Dron został wykryty', 7);
    const detectedState = useMissionStore.getState();
    expect(detectedState.isDetectedModalOpen).toBe(true);
    expect(detectedState.criticalErrorsCount).toBe(1);
    expect(detectedState.detectionReason?.title).toBe('ALARM DETEKCJI');

    // Retry from choices
    store.retryFromChoices();
    const afterChoicesRetry = useMissionStore.getState();
    expect(afterChoicesRetry.isDetectedModalOpen).toBe(false);
    expect(afterChoicesRetry.bootStage).toBe('desktop');
    // Czat nie jest launcherem: retry wraca na pulpit, nie otwiera aplikacji automatycznie.
    expect(afterChoicesRetry.activeApp).toBeNull();

    // Retry from scratch
    store.openRetryModal();
    expect(useMissionStore.getState().isRetryModalOpen).toBe(true);
    store.retryFromScratch();
    const afterScratch = useMissionStore.getState();
    expect(afterScratch.bootStage).toBe('incoming_call');
    expect(afterScratch.isRetryModalOpen).toBe(false);
  });

  it('declaratively runs scenario transitions and generic chat choices from definition', async () => {
    const store = useMissionStore.getState();
    store.loadMission(mockMission99);
    store.openApp('vpn_tool');
    expect(useMissionStore.getState().activeApp).toBe('vpn_tool');

    // Run declarative transition
    store.runScenarioTransition('step1_complete');
    expect(useMissionStore.getState().activeApp).toBeNull();
    expect(useMissionStore.getState().unlockedIcons).toContain('custom_tool_unlocked');
    expect(useMissionStore.getState().notificationBadges['chat']).toBe(1);
    expect(useMissionStore.getState().systemTime).toBe('04:15');

    // Fast-forward simulated typing
    await new Promise((r) => setTimeout(r, 1300));
    const stateAfterMsg = useMissionStore.getState();
    expect(stateAfterMsg.chatMessages.some((m) => m.text.includes('tunel VPN'))).toBe(true);
    expect(stateAfterMsg.chatAvailableChoices.some((c) => c.id === 'start_exploit')).toBe(true);

    // Player picks generic choice with openAppId
    store.chooseChatOption('start_exploit');
    expect(useMissionStore.getState().activeApp).toBe('vpn_tool');
  });
});
