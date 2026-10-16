import { create } from 'zustand';
import type { MissionDefinition, PlayerChoiceRecord, DecisionReport } from '../types/mission';
import { penaltyForTier, btcForScore, resolveDecisionCount } from '../core/scoring';
import { resolveInitialMission, getMission } from '../registry/missionRegistry';
import { sounds } from '../audio/soundEffects';
import { createMissionCompletionStatement, MockLRS } from '../scorm/xapi';
import { scorm2004, type ScormInteraction } from '../scorm/scorm2004';

export type WindowId = 
  | 'virus_database' 
  | 'browser' 
  | 'pendrive_app' 
  | 'drone_app' 
  | 'rat_session' 
  | 'debrief_app'
  | string;

export interface ChatMessage {
  id: string;
  sender: 'BYTE_MASTER' | 'PLAYER' | 'SYSTEM';
  text: string;
  timestamp?: string;
  actionButton?: {
    type: 'link_browser' | 'download_attachments' | 'view_car_photo' | 'open_app';
    label: string;
    payload?: string;
  };
  imageSrc?: string;
}

export type { PlayerChoiceRecord };

import type { ChoiceOutcome } from '../types/mission';

export interface ChatChoiceOption {
  id: string;
  label: string;
  isCorrect?: boolean;
  /** Kwestia gracza (dialog z VR): klik wysyła echo, NIE otwiera aplikacji. */
  reply?: boolean;
  openAppId?: string;
  nextTransitionId?: string;
  outcome?: ChoiceOutcome;
  choiceRecord?: {
    num: number;
    question: string;
    answer: string;
    details: string;
    btcPenalty?: number;
    scorePenalty?: number;
  };
}

export type BootStage = 'incoming_call' | 'intro_chat' | 'bios_boot' | 'desktop';

export type ChatStage = 
  | 'pre_virus' 
  | 'virus_ready' 
  | 'browsing_site' 
  | 'choose_target' 
  | 'awaiting_events'
  | 'choose_vector' 
  | 'awaiting_usb' 
  | 'usb_ready' 
  | 'morning_call' 
  | 'drone_flight' 
  | 'victim_infected' 
  | 'mission_complete';

export type DroneFlightState = 'waiting_payload' | 'waiting_coords' | 'flying' | 'camera_active' | 'dropped';

export interface MissionState {
  // Active Mission Definition
  activeMission: MissionDefinition;
  loadMission: (missionOrId: MissionDefinition | string | number) => void;

  // Custom State Bag for Mission-Specific Minigames
  customState: Record<string, any>;
  setCustomState: (key: string, value: any) => void;
  updateCustomState: (partial: Record<string, any>) => void;

  // Boot Sequence
  bootStage: BootStage;
  introDialogIndex: number;

  // Desktop Focus & System
  activeApp: WindowId | null;
  unlockedIcons: string[];
  unlockIcon: (id: string) => void;
  notificationBadges: Record<string, number>;
  setNotificationBadge: (id: string, count: number) => void;
  clearNotificationBadge: (id: string) => void;
  systemDate: string;
  systemTime: string;

  // Step 1: Virus & Builder (Mission 3 compatibility)
  selectedVirus: string | null;
  builderModule: string | null;
  builderMasking: string | null;
  builderPackage: string | null;
  builderError: string | null;
  isRatCompiling: boolean;
  isRatCompiled: boolean;

  // Step 2: OSINT & Chat
  chatMessages: ChatMessage[];
  chatAvailableChoices: ChatChoiceOption[];
  isByteMasterTyping: boolean;
  chatStage: ChatStage;
  selectedEmployeeId: string | null;
  selectedTargetId: string | null;
  selectedVectorId: string | null;
  isChatAttentionActive: boolean;
  hasViewedEvents: boolean;
  /** Kafelek pulpitu do podświetlenia (świeżo odblokowany następny krok). */
  highlightedTileId: string | null;

  // Step 3: Pendrive USB (Mission 3 compatibility)
  hasUsbInserted: boolean;
  usbFiles: string[];
  isRatBoundToZip: boolean;
  selectedVolumeName: string | null;
  selectedEnvelopeName: string | null;
  isUsbEjected: boolean;

  // Step 4: Drone Delivery (Mission 3 compatibility)
  isEnvelopeAttachedToDrone: boolean;
  droneFlightState: DroneFlightState;
  selectedCoordId: string | null;
  selectedCarId: number | null;
  droneDropSuccess: boolean;

  // Step 5: Takeover (Mission 3 compatibility)
  isAlarmActive: boolean;
  isDesktopTakeoverActive: boolean;
  isNetworkGraphActive: boolean;

  // Step 6: Debrief & Scoring
  score: number;
  btcReward: number;
  perfectChoicesCount: number;
  goodChoicesCount: number;
  criticalErrorsCount: number;
  xapiSent: boolean;
  expandedChoiceIndex: number | null;
  isKnowledgeBaseOpen: boolean;
  playerChoices: PlayerChoiceRecord[];
  recordChoice: (choice: PlayerChoiceRecord, penalty?: number) => void;
  /**
   * Kontrakt klocka/minigry: zgłoszenie ocenianej decyzji.
   * Silnik liczy punkty i karę BTC z `tier` oraz odpala wykrycie przy 'critical'.
   */
  reportDecision: (report: DecisionReport) => void;
  /** Kontrakt klocka/minigry: ukończenie etapu (odblokowania, badge, wiadomość mentora). */
  completeStage: (stageId: string) => void;

  // Detection & Retry Modals
  isDetectedModalOpen: boolean;
  detectionReason: { title: string; details: string; choiceNum?: number } | null;
  isRetryModalOpen: boolean;
  triggerDetection: (title: string, details: string, choiceNum?: number) => void;
  openRetryModal: () => void;
  closeRetryModal: () => void;
  retryFromScratch: () => void;
  retryFromChoices: () => void;

  // SCORM 2004 Integration
  isScormSubmitted: boolean;
  scormSubmitMessage: string | null;
  isExitModalOpen: boolean;

  // Boot Actions
  acceptIncomingCall: () => void;
  nextIntroDialog: () => void;
  startBiosBoot: () => void;
  finishBiosBoot: () => void;

  openApp: (app: WindowId) => void;
  closeApp: () => void;

  // Step 1 Actions
  selectVirusCard: (id: string) => void;
  setBuilderModule: (id: string) => void;
  setBuilderMasking: (id: string) => void;
  setBuilderPackage: (id: string) => void;
  compileRatPayload: () => Promise<void>;
  finishRatStep: () => void;

  // Step 2 Actions
  chooseChatOption: (optionId: string) => void;
  inspectEmployee: (id: string) => void;
  triggerChatAttention: () => void;
  viewEventsTab: () => void;

  // Step 3 Actions
  addAttachmentToUsb: (id: string) => void;
  bindRatToArchive: () => void;
  setUsbVolumeName: (id: string) => void;
  setUsbEnvelopeName: (id: string) => void;
  ejectUsbDrive: () => void;

  // Step 4 Actions
  attachEnvelopeToDrone: () => void;
  selectDroneCoord: (id: string) => void;
  confirmDroneCoords: () => void;
  activateDroneCamera: () => void;
  selectCarTarget: (carId: number) => void;
  dropPayloadOnCar: () => Promise<void>;
  closeDroneApp: () => void;

  // Step 5 Actions
  triggerMalwareAlarm: () => void;
  launchDesktopTakeover: () => void;
  openNetworkGraph: () => void;
  openDebrief: () => void;

  // Step 6 Actions
  toggleChoiceDetails: (index: number) => void;
  toggleKnowledgeBase: () => void;
  resetGame: () => void;

  // Generic Scenario Transitions
  runScenarioTransition: (transitionId: string) => void;

  // SCORM Actions
  submitScormAndExit: () => { success: boolean; message: string };
  closeExitModal: () => void;
  openExitModal: () => void;
}

/**
 * Początkowy stan czatu po starcie systemu — sterowany danymi misji.
 * Misja może podać `intro.desktopGreeting`, `intro.firstChoice` (z `openAppId`)
 * i `intro.startBadges`; przy braku danych używamy fallbacku zgodnego z Misją 3.
 */
function resolveOpeningChat(mission: MissionDefinition): {
  messages: ChatMessage[];
  choices: ChatChoiceOption[];
  startBadges: Record<string, number>;
  highlightTile: string | null;
} {
  const intro = (mission?.intro || {}) as any;
  const greeting: string = intro.desktopGreeting || 'Połączenie TOR P2P aktywne. Czekam na stworzenie wirusa.';
  const rawFirst = intro.firstChoice || { id: 'start_virus', label: 'NAJPIERW STWORZĘ WIRUSA' };
  // Kafelek do podświetlenia bierzemy z firstChoice.openAppId, ale samego wyboru NIE
  // robimy launcherem — czat nie otwiera aplikacji, gracz klika kafelek sam.
  const highlightTile: string | null = rawFirst.openAppId || intro.firstHighlight || null;
  // Misja data-driven (ma intro.firstChoice) → kwestia gracza z VR (reply). Fallback M3 trafia do własnej gałęzi.
  const firstChoice: ChatChoiceOption = intro.firstChoice
    ? { id: rawFirst.id, label: rawFirst.label, reply: true }
    : { id: rawFirst.id, label: rawFirst.label };

  // Rozmowa intro „przenosi się" do logu czatu jako historia (naprzemiennie BYTE_MASTER / gracz).
  const history: ChatMessage[] = [];
  (intro.dialogue || []).forEach((d: any, i: number) => {
    if (d.text) history.push({ id: `intro_bm_${i}`, sender: 'BYTE_MASTER', text: d.text });
    if (d.playerResponse) history.push({ id: `intro_pl_${i}`, sender: 'PLAYER', text: d.playerResponse });
  });
  const messages: ChatMessage[] = [
    ...history,
    { id: 'chat_init', sender: 'BYTE_MASTER', text: greeting }
  ];

  return {
    messages,
    choices: [firstChoice],
    startBadges: intro.startBadges || { virus_database: 1, chat: 1 },
    highlightTile
  };
}

const getInitialMissionState = (mission: MissionDefinition) => {
  const choices: PlayerChoiceRecord[] = (mission.step6?.choices || []).map((c: any) => ({
    num: c.num,
    question: c.question,
    answer: c.answer,
    isCorrect: c.correct,
    details: c.details
  }));

  const initialUnlocked = (mission.desktopApps || [])
    .filter(app => !app.unlockedOnly)
    .map(app => app.id);

  return {
    activeMission: mission,
    bootStage: 'incoming_call' as BootStage,
    introDialogIndex: 0,

    activeApp: null as WindowId | null,
    unlockedIcons: initialUnlocked.length > 0 ? initialUnlocked : ['virus_database', 'chat', 'mail', 'browser'],
    notificationBadges: { virus_database: 1 } as Record<string, number>,
    systemDate: mission.mission?.date || '19.05.2026',
    systemTime: '00:00',
    customState: {} as Record<string, any>,

    // Step 1
    selectedVirus: null as string | null,
    builderModule: null as string | null,
    builderMasking: null as string | null,
    builderPackage: null as string | null,
    builderError: null as string | null,
    isRatCompiling: false,
    isRatCompiled: false,

    // Step 2 & Chat
    chatMessages: [] as ChatMessage[],
    chatAvailableChoices: [] as ChatChoiceOption[],
    isByteMasterTyping: false,
    chatStage: 'pre_virus' as ChatStage,
    selectedEmployeeId: null as string | null,
    selectedTargetId: null as string | null,
    selectedVectorId: null as string | null,
    isChatAttentionActive: false,
    hasViewedEvents: false,
    highlightedTileId: null as string | null,

    // Step 3
    hasUsbInserted: false,
    usbFiles: [] as string[],
    isRatBoundToZip: false,
    selectedVolumeName: null as string | null,
    selectedEnvelopeName: null as string | null,
    isUsbEjected: false,

    // Step 4
    isEnvelopeAttachedToDrone: false,
    droneFlightState: 'waiting_payload' as DroneFlightState,
    selectedCoordId: null as string | null,
    selectedCarId: null as number | null,
    droneDropSuccess: false,

    // Step 5
    isAlarmActive: false,
    isDesktopTakeoverActive: false,
    isNetworkGraphActive: false,

    // Step 6 & Scoring
    score: mission.mission?.maxScore ?? 100,
    btcReward: mission.mission?.rewardBtc ?? 4.02,
    perfectChoicesCount: mission.step6?.summary?.perfectChoices ?? choices.length,
    goodChoicesCount: mission.step6?.summary?.goodChoices ?? 0,
    criticalErrorsCount: 0,
    xapiSent: false,
    expandedChoiceIndex: null as number | null,
    isKnowledgeBaseOpen: false,
    playerChoices: choices,

    // Detection & Retry Modals
    isDetectedModalOpen: false,
    detectionReason: null as { title: string; details: string; choiceNum?: number } | null,
    isRetryModalOpen: false,

    // SCORM 2004 Integration State
    isScormSubmitted: false,
    scormSubmitMessage: null as string | null,
    isExitModalOpen: false,
  };
};

const initialMission = resolveInitialMission();

export const useMissionStore = create<MissionState>((set, get) => ({
  ...getInitialMissionState(initialMission),

  loadMission: (missionOrId) => {
    let targetMission: MissionDefinition | undefined;
    if (typeof missionOrId === 'string' || typeof missionOrId === 'number') {
      targetMission = getMission(missionOrId);
    } else {
      targetMission = missionOrId;
    }

    if (!targetMission) {
      console.error('[MissionStore] Could not load mission:', missionOrId);
      return;
    }

    set(getInitialMissionState(targetMission));
  },

  setCustomState: (key, value) => {
    set((s) => ({ customState: { ...s.customState, [key]: value } }));
  },

  updateCustomState: (partial) => {
    set((s) => ({ customState: { ...s.customState, ...partial } }));
  },

  triggerDetection: (title: string, details: string, choiceNum?: number) => {
    sounds.playAlarm();
    set((s) => ({
      criticalErrorsCount: s.criticalErrorsCount + 1,
      isDetectedModalOpen: true,
      detectionReason: { title, details, choiceNum }
    }));
  },

  openRetryModal: () => {
    sounds.playClick();
    set({ isRetryModalOpen: true });
  },

  closeRetryModal: () => {
    sounds.playClick();
    set({ isRetryModalOpen: false });
  },

  retryFromScratch: () => {
    sounds.playClick();
    const currentMission = get().activeMission;
    set({
      ...getInitialMissionState(currentMission),
      bootStage: 'incoming_call',
      isDetectedModalOpen: false,
      detectionReason: null,
      isRetryModalOpen: false
    });
  },

  retryFromChoices: () => {
    sounds.playSuccess();
    const currentMission = get().activeMission;
    const baseInitial = getInitialMissionState(currentMission);
    const opening = resolveOpeningChat(currentMission);

    set({
      ...baseInitial,
      bootStage: 'desktop',
      activeApp: null,
      isDetectedModalOpen: false,
      detectionReason: null,
      isRetryModalOpen: false,
      notificationBadges: opening.startBadges,
      highlightedTileId: opening.highlightTile,
      chatMessages: opening.messages,
      chatAvailableChoices: opening.choices
    });
  },

  recordChoice: (choice, penalty = 0) => {
    const choices = [...get().playerChoices];
    const existingIndex = choices.findIndex((c) => c.num === choice.num);
    
    // Determine outcome if not explicitly set
    let outcome = choice.outcome;
    if (!outcome) {
      outcome = choice.isCorrect ? 'ideal' : 'critical';
    }
    const finalChoice: PlayerChoiceRecord = {
      ...choice,
      outcome
    };

    if (existingIndex >= 0) {
      choices[existingIndex] = finalChoice;
    } else {
      choices.push(finalChoice);
    }

    const btcLoss = choice.btcPenalty ? Math.abs(choice.btcPenalty) : 0;

    if (outcome === 'ideal') {
      set((s) => ({
        playerChoices: choices,
        score: penalty > 0 ? Math.max(0, s.score - penalty) : s.score,
      }));
    } else if (outcome === 'suboptimal') {
      set((s) => ({
        playerChoices: choices,
        score: penalty > 0 ? Math.max(0, s.score - penalty) : s.score,
        goodChoicesCount: s.goodChoicesCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: btcLoss > 0 ? +(Math.max(0, s.btcReward - btcLoss)).toFixed(2) : s.btcReward
      }));
    } else {
      // outcome === 'critical'
      set((s) => ({
        playerChoices: choices,
        score: penalty > 0 ? Math.max(0, s.score - penalty) : s.score,
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: btcLoss > 0 ? +(Math.max(0, s.btcReward - btcLoss)).toFixed(2) : s.btcReward
      }));
    }
  },

  // ----------------- KONTRAKT KLOCKA: DECYZJA -----------------
  reportDecision: (report: DecisionReport) => {
    const { activeMission } = get();
    const maxScore = activeMission.mission?.maxScore ?? 100;
    const rewardBtc = activeMission.mission?.rewardBtc ?? 0;
    const decisionCount = resolveDecisionCount(activeMission);

    const penalty = penaltyForTier(report.tier, maxScore, decisionCount);

    get().recordChoice(
      {
        num: report.num,
        question: report.question,
        answer: report.answer,
        details: report.feedback,
        isCorrect: report.tier === 'ideal',
        outcome: report.tier
      },
      penalty
    );

    // Nagroda BTC wynika liniowo z wyniku — nie z osobnych kar w widgetach.
    set((s) => ({ btcReward: btcForScore(s.score, rewardBtc) }));

    // Błąd krytyczny przerywa operację. recordChoice policzył już licznik wpadek,
    // więc otwieramy modal bez ponownego inkrementowania.
    if (report.tier === 'critical') {
      sounds.playAlarm();
      set({
        isDetectedModalOpen: true,
        detectionReason: {
          title: 'ZOSTAŁEŚ WYKRYTY!',
          details: report.feedback,
          choiceNum: report.num
        }
      });
    }
  },

  // ----------------- KONTRAKT KLOCKA: UKOŃCZENIE ETAPU -----------------
  completeStage: (stageId: string) => {
    const { activeMission } = get();
    const stage = (activeMission.stages || []).find((s) => s.id === stageId);
    if (!stage) {
      console.warn(`[MissionStore] Nie znaleziono etapu "${stageId}" w definicji misji.`);
      return;
    }

    const { completion } = stage;

    // Wiadomości mentora: preferuj tablicę, przyjmij też pojedynczą (zgodność wstecz).
    const messages: string[] =
      completion.byteMasterMessages && completion.byteMasterMessages.length > 0
        ? completion.byteMasterMessages
        : completion.byteMasterMessage
        ? [completion.byteMasterMessage]
        : [];

    // Końcowe opcje czatu: kwestia gracza z VR (bez otwierania aplikacji) lub legacy nextChoice.
    const endChoices: ChatChoiceOption[] = completion.playerReply
      ? [{ id: completion.playerReply.id, label: completion.playerReply.label, reply: true }]
      : completion.nextChoice
      ? [completion.nextChoice]
      : [];

    // Krok 1: odblokowania, badge, podświetlenie kafelka, zamknięcie okna (powrót na pulpit).
    set((s) => {
      const unlocked = [...s.unlockedIcons];
      (completion.unlockIcons || []).forEach((icon) => {
        if (!unlocked.includes(icon)) unlocked.push(icon);
      });
      return {
        activeApp: completion.closeActiveApp === false ? s.activeApp : null,
        unlockedIcons: unlocked,
        notificationBadges: { ...s.notificationBadges, ...(completion.badges || {}) },
        highlightedTileId: completion.highlightTile ?? s.highlightedTileId,
        isByteMasterTyping: messages.length > 0,
        chatAvailableChoices: []
      };
    });

    if (messages.length === 0) {
      set({ chatAvailableChoices: endChoices });
      return;
    }

    // Krok 2: wiadomości mentora po kolei, z animacją „pisze" i delayem (jak w M3).
    const TYPING_DELAY = 1500;
    const deliver = (index: number) => {
      setTimeout(() => {
        const isLast = index === messages.length - 1;
        if (isLast && completion.sound === 'alarm') sounds.playAlarm();
        else if (isLast && completion.sound === 'success') sounds.playSuccess();
        else sounds.playNotification();

        set((s) => {
          const msg: ChatMessage = {
            id: `msg_${Date.now()}_${index}`,
            sender: 'BYTE_MASTER',
            text: messages[index]
          };
          // Link do otwarcia kafelka dołączamy do ostatniej wiadomości (klik gracza, nie auto-open).
          if (isLast && completion.openLink) {
            msg.actionButton = { type: 'open_app', label: completion.openLink.label, payload: completion.openLink.appId };
          }
          return {
            isByteMasterTyping: !isLast,
            chatMessages: [...s.chatMessages, msg],
            chatAvailableChoices: isLast ? endChoices : []
          };
        });

        if (index < messages.length - 1) deliver(index + 1);
      }, TYPING_DELAY);
    };
    deliver(0);
  },

  unlockIcon: (id: string) => {
    set((s) => ({
      unlockedIcons: s.unlockedIcons.includes(id) ? s.unlockedIcons : [...s.unlockedIcons, id]
    }));
  },

  setNotificationBadge: (id: string, count: number) => {
    set((s) => ({
      notificationBadges: { ...s.notificationBadges, [id]: count }
    }));
  },

  clearNotificationBadge: (id: string) => {
    const badges = { ...get().notificationBadges };
    delete badges[id];
    set({ notificationBadges: badges });
  },

  // ----------------- BOOT ACTIONS -----------------
  acceptIncomingCall: () => {
    sounds.playClick();
    set({ bootStage: 'intro_chat' });
  },

  nextIntroDialog: () => {
    sounds.playClick();
    const { introDialogIndex, activeMission } = get();
    const maxIndex = (activeMission.intro?.dialogue?.length || 1) - 1;
    if (introDialogIndex < maxIndex) {
      set({ introDialogIndex: introDialogIndex + 1 });
    }
  },

  startBiosBoot: () => {
    sounds.playClick();
    set({ bootStage: 'bios_boot' });
  },

  finishBiosBoot: () => {
    sounds.playSuccess();
    scorm2004.initialize(true);
    const { activeMission } = get();
    const opening = resolveOpeningChat(activeMission);

    set({
      bootStage: 'desktop',
      notificationBadges: opening.startBadges,
      highlightedTileId: opening.highlightTile,
      chatMessages: opening.messages,
      chatAvailableChoices: opening.choices
    });
  },

  // ----------------- APP NAVIGATION -----------------
  openApp: (app) => {
    sounds.playClick(900, 0.03);
    const badges = { ...get().notificationBadges };
    delete badges[app];

    // Otwarcie podświetlonego kafelka gasi poświatę uwagi.
    const highlightedTileId = get().highlightedTileId === app ? null : get().highlightedTileId;

    const { activeMission } = get();

    if (app === 'browser' && (get().chatStage === 'browsing_site' || get().chatStage === 'virus_ready')) {
      const targetChoices = (activeMission.step2?.targetOptions || []).map((t: any) => ({
        id: t.id,
        label: t.label,
        isCorrect: t.isCorrect
      }));
      set({
        activeApp: app,
        notificationBadges: badges,
        highlightedTileId,
        chatStage: 'choose_target',
        chatAvailableChoices: targetChoices
      });
      return;
    }

    set({ activeApp: app, notificationBadges: badges, highlightedTileId });
  },

  closeApp: () => {
    sounds.playClick(600, 0.03);
    set({ activeApp: null });
  },

  // ----------------- STEP 1: VIRUS -----------------
  selectVirusCard: (id) => {
    sounds.playClick();
    const prevVirus = get().selectedVirus;
    const { activeMission } = get();
    const viruses = activeMission.step1?.viruses || [];

    if (id === 'rat') {
      sounds.playSuccess();
      const updatedChoices = [...get().playerChoices];
      updatedChoices[0] = {
        num: 1,
        question: "WYBÓR OPROGRAMOWANIA MALWARE:",
        answer: "RAT (REMOTE ACCESS TROJAN)",
        isCorrect: true,
        outcome: 'ideal',
        details: "Pozwala na pełny, cichy dostęp do stacji roboczej pracownika i zdalny podgląd pulpitu."
      };
      set({ selectedVirus: id, playerChoices: updatedChoices });
    } else if (id === 'ransomware') {
      sounds.playAlarm();
      const isNewError = prevVirus !== id;
      const v = viruses.find((item: any) => item.id === id);
      const updatedChoices = [...get().playerChoices];
      updatedChoices[0] = {
        num: 1,
        question: "WYBÓR OPROGRAMOWANIA MALWARE:",
        answer: v?.name || "RANSOMWARE",
        isCorrect: false,
        outcome: 'critical',
        btcPenalty: -0.89,
        details: v?.feedback || "Zaalarmuje firmę natychmiast, a celem jest cicha kradzież danych."
      };
      set((s) => ({
        selectedVirus: id,
        playerChoices: updatedChoices,
        score: isNewError ? Math.max(70, s.score - 15) : s.score,
        criticalErrorsCount: isNewError ? s.criticalErrorsCount + 1 : s.criticalErrorsCount,
        perfectChoicesCount: isNewError ? Math.max(0, s.perfectChoicesCount - 1) : s.perfectChoicesCount,
        btcReward: isNewError ? +(Math.max(0, s.btcReward - 0.89)).toFixed(2) : s.btcReward
      }));
      get().triggerDetection(
        "BŁĘDNY TYP SZKODLIWEGO OPROGRAMOWANIA – ALARM SOC!",
        "Ransomware natychmiast zaalarmuje SOC i zablokuje cichy dostęp do sieci O&L Company!",
        1
      );
    } else {
      // e.g. keylogger: suboptimal
      sounds.playError();
      const isNewError = prevVirus !== id;
      const v = viruses.find((item: any) => item.id === id);
      const updatedChoices = [...get().playerChoices];
      updatedChoices[0] = {
        num: 1,
        question: "WYBÓR OPROGRAMOWANIA MALWARE:",
        answer: v?.name || id.toUpperCase(),
        isCorrect: false,
        outcome: 'suboptimal',
        btcPenalty: -0.50,
        details: v?.feedback || "Opcja częściowa – rejestruje klawisze, ale nie daje dostępu do pulpitu."
      };
      set((s) => ({
        selectedVirus: id,
        playerChoices: updatedChoices,
        score: isNewError ? Math.max(70, s.score - 10) : s.score,
        goodChoicesCount: isNewError ? s.goodChoicesCount + 1 : s.goodChoicesCount,
        perfectChoicesCount: isNewError ? Math.max(0, s.perfectChoicesCount - 1) : s.perfectChoicesCount,
        btcReward: isNewError ? +(Math.max(0, s.btcReward - 0.50)).toFixed(2) : s.btcReward
      }));
    }
  },

  setBuilderModule: (id) => {
    sounds.playClick();
    set({ builderModule: id, builderError: null });
  },

  setBuilderMasking: (id) => {
    sounds.playClick();
    set({ builderMasking: id, builderError: null });
  },

  setBuilderPackage: (id) => {
    sounds.playClick();
    set({ builderPackage: id, builderError: null });
  },

  compileRatPayload: async () => {
    const { builderModule, builderMasking, builderPackage } = get();
    if (!builderModule || !builderMasking || !builderPackage) {
      sounds.playError();
      set({ builderError: "WYBIERZ WSZYSTKIE 3 PARAMETRY PRZED ROZPOCZĘCIEM KOMPILACJI!" });
      return;
    }

    const isModuleCorrect = builderModule === 'reverse_tcp';
    const isMaskingCorrect = builderMasking === 'bg_service';
    const isPackageCorrect = builderPackage === 'dll_archive';

    if (!isModuleCorrect || !isMaskingCorrect || !isPackageCorrect) {
      sounds.playAlarm();
      let errMsg = "BŁĄD KOMPILACJI ŁADUNKU: ";
      if (!isModuleCorrect) {
        errMsg += "Moduł Port Scan zostanie natychmiast wykryty przez firmowy IDS/IPS! Wybierz cichy kanał zwrotny Reverse TCP.";
      } else if (!isMaskingCorrect) {
        errMsg += "Wymuszenie okna UAC wywoła natychmiastowy alarm pracownika i reakcję działu IT! Wybierz cichy proces w tle.";
      } else if (!isPackageCorrect) {
        errMsg += "Skrypt .bat zostanie zablokowany przez mechanizmy Windows Defender AMSI! Wybierz moduł DLL w archiwum.";
      }

      set((s) => ({
        builderError: errMsg,
        score: Math.max(70, s.score - 5),
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1)
      }));
      get().triggerDetection("WYKRYTO PRZEZ SYSTEMY OBRONNE (EDR / IDS)", errMsg);
      return;
    }

    sounds.playClick();
    set({ isRatCompiling: true, builderError: null });
    await new Promise((res) => setTimeout(res, 1800));
    sounds.playSuccess();
    set({ isRatCompiling: false, isRatCompiled: true, builderError: null });
  },

  finishRatStep: () => {
    sounds.playSuccess();
    const unlocked = [...get().unlockedIcons];
    if (!unlocked.includes('rat_virus')) unlocked.push('rat_virus');

    set((state) => ({
      activeApp: null, // Return to desktop
      unlockedIcons: unlocked,
      chatStage: 'virus_ready',
      chatAvailableChoices: [
        { id: 'virus_ready_reply', label: 'GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?' }
      ],
      notificationBadges: { ...state.notificationBadges, chat: 1 }
    }));
  },

  // ----------------- STEP 2: OSINT & CHAT -----------------
  chooseChatOption: (optionId) => {
    sounds.playClick();
    const state = get();
    const { activeMission } = state;

    const genericChoice = state.chatAvailableChoices.find((c) => c.id === optionId);

    // Kwestia gracza z VR (wzorzec B): wysyła echo i nic nie otwiera. Czat nie jest launcherem.
    if (genericChoice?.reply) {
      set({
        chatMessages: [
          ...state.chatMessages,
          { id: `msg_${Date.now()}`, sender: 'PLAYER', text: genericChoice.label }
        ],
        chatAvailableChoices: []
      });
      return;
    }

    // Generic scenario transition and action handling from chatAvailableChoices
    if (genericChoice && (genericChoice.openAppId || genericChoice.nextTransitionId || genericChoice.choiceRecord)) {
      set({
        chatMessages: [
          ...state.chatMessages,
          { id: `msg_${Date.now()}`, sender: 'PLAYER', text: genericChoice.label }
        ],
        chatAvailableChoices: []
      });

      if (genericChoice.choiceRecord) {
        const cr = genericChoice.choiceRecord;
        get().recordChoice(
          {
            num: cr.num,
            question: cr.question,
            answer: cr.answer,
            details: cr.details,
            isCorrect: genericChoice.outcome === 'ideal',
            outcome: genericChoice.outcome,
            btcPenalty: cr.btcPenalty
          },
          cr.scorePenalty || 0
        );
      }

      if (genericChoice.openAppId) {
        get().openApp(genericChoice.openAppId);
      }

      if (genericChoice.nextTransitionId) {
        get().runScenarioTransition(genericChoice.nextTransitionId);
      }

      return;
    }

    if (optionId === 'start_virus') {
      // Misja 3 (legacy). M4 używa intro.firstChoice z openAppId (ścieżka generyczna wyżej).
      set({
        chatMessages: [
          ...state.chatMessages,
          { id: `msg_${Date.now()}`, sender: 'PLAYER', text: 'NAJPIERW STWORZĘ WIRUSA' }
        ],
        chatAvailableChoices: []
      });
      get().openApp('virus_database');
      return;
    }

    if (optionId === 'virus_ready_reply') {
      set({
        chatMessages: [
          ...state.chatMessages,
          { id: `msg_${Date.now()}`, sender: 'PLAYER', text: 'GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?' }
        ],
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playRadarBlip();
        const browserUrl = activeMission.step2?.browser?.url?.toUpperCase() || 'HTTPS://OLCOMPANY.CLOUD';
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { 
              id: `msg_${Date.now()}`, 
              sender: 'BYTE_MASTER', 
              text: 'ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ:', 
              actionButton: {
                type: 'link_browser',
                label: browserUrl,
                payload: 'browser'
              }
            }
          ],
          isByteMasterTyping: false,
          chatStage: 'browsing_site',
          chatAvailableChoices: []
        }));
      }, 2000);
      return;
    }

    // Target Options
    const targetOptions = activeMission.step2?.targetOptions || [];
    const wrongTarget = targetOptions.find((t: any) => t.id === optionId && !t.isCorrect);
    if (wrongTarget) {
      sounds.playClick();
      const isCritical = optionId === 'choose_slawomir' || optionId === 'choose_ciso' || wrongTarget.id === 'choose_ciso' || wrongTarget.id === 'choose_slawomir';
      const outcome: ChoiceOutcome = isCritical ? 'critical' : 'suboptimal';
      const btcLoss = isCritical ? 0.89 : 0.50;

      const updatedChoices = [...get().playerChoices];
      updatedChoices[1] = {
        num: 2,
        question: "KOGO WYBIERASZ ZA CEL?",
        answer: wrongTarget.name,
        isCorrect: false,
        outcome,
        btcPenalty: -btcLoss,
        details: wrongTarget.details
      };

      set({
        chatMessages: [
          ...state.chatMessages,
          { id: `msg_${Date.now()}`, sender: 'PLAYER', text: wrongTarget.label }
        ],
        playerChoices: updatedChoices,
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        if (isCritical) {
          sounds.playAlarm();
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              { id: `msg_${Date.now()}`, sender: 'BYTE_MASTER', text: wrongTarget.feedback }
            ],
            isByteMasterTyping: false,
            score: Math.max(70, s.score - 15),
            criticalErrorsCount: s.criticalErrorsCount + 1,
            perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
            btcReward: +(Math.max(0, s.btcReward - btcLoss)).toFixed(2)
          }));
          get().triggerDetection(
            "WYKRYTO: PREZES/SOC ZGŁOSIŁ INCYDENT!",
            "Sławomir Białek (CISO) natychmiast zidentyfikował próbę ataku i zgłosił incydent do ABW/SOC!",
            2
          );
        } else {
          sounds.playError();
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              { id: `msg_${Date.now()}`, sender: 'BYTE_MASTER', text: wrongTarget.feedback }
            ],
            isByteMasterTyping: false,
            score: Math.max(70, s.score - 10),
            goodChoicesCount: s.goodChoicesCount + 1,
            perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
            btcReward: +(Math.max(0, s.btcReward - btcLoss)).toFixed(2),
            chatAvailableChoices: targetOptions.map((t: any) => ({
              id: t.id,
              label: t.label,
              isCorrect: t.isCorrect
            }))
          }));
        }
      }, 2000);
      return;
    }

    if (optionId === 'choose_mateusz') {
      sounds.playClick();
      const mateuszOpt = targetOptions.find((t: any) => t.id === 'choose_mateusz')!;
      const updatedChoices = [...get().playerChoices];
      updatedChoices[1] = {
        num: 2,
        question: "KOGO WYBIERASZ ZA CEL?",
        answer: mateuszOpt.name,
        isCorrect: true,
        outcome: 'ideal',
        details: mateuszOpt.details
      };

      set({
        selectedTargetId: 'mateusz_klimowicz',
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: mateuszOpt.label
          }
        ],
        playerChoices: updatedChoices,
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playSuccess();
        const badges = { ...get().notificationBadges };
        if (get().activeApp !== 'browser') {
          badges['browser'] = 1;
        }

        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `msg_${Date.now()}`,
              sender: 'BYTE_MASTER',
              text: mateuszOpt.feedback
            }
          ],
          isByteMasterTyping: false,
          chatStage: 'awaiting_events',
          chatAvailableChoices: [],
          notificationBadges: badges
        }));
      }, 2000);
      return;
    }

    // Vector Options
    const vectorOptions = activeMission.step2?.vectorOptions || [];
    if (optionId === 'vector_fake_invoice') {
      sounds.playClick();
      const invoiceOpt = vectorOptions.find((v: any) => v.id === 'vector_fake_invoice')!;
      const updatedChoices = [...get().playerChoices];
      updatedChoices[2] = {
        num: 3,
        question: "JAK CHCESZ GO ZHAKOWAĆ (WEKTOR ATAKU)?",
        answer: "FAŁSZYWA FAKTURA VAT W .EXE",
        isCorrect: false,
        outcome: 'critical',
        btcPenalty: -0.89,
        details: invoiceOpt.details
      };

      set({
        chatMessages: [
          ...state.chatMessages,
          { id: `msg_${Date.now()}`, sender: 'PLAYER', text: invoiceOpt.label }
        ],
        playerChoices: updatedChoices,
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playAlarm();
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { id: `msg_${Date.now()}`, sender: 'BYTE_MASTER', text: invoiceOpt.feedback }
          ],
          isByteMasterTyping: false,
          score: Math.max(70, s.score - 10),
          criticalErrorsCount: s.criticalErrorsCount + 1,
          perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
          btcReward: +(Math.max(0, s.btcReward - 0.89)).toFixed(2),
          chatAvailableChoices: [
            {
              id: 'vector_party_zip',
              label: vectorOptions[0]?.label || '',
              isCorrect: true
            }
          ]
        }));
        get().triggerDetection(
          "WYKRYTO: DZIAŁ FINANSOWY ZABLOKOWAŁ OPERACJĘ!",
          "Dział księgowości i SOC natychmiast zidentyfikowały fałszywą fakturę .exe i wszczęły procedurę alarmową!",
          3
        );
      }, 2000);
      return;
    }

    if (optionId === 'vector_party_zip') {
      sounds.playClick();
      const partyOpt = vectorOptions.find((v: any) => v.id === 'vector_party_zip')!;
      const updatedChoices = [...get().playerChoices];
      updatedChoices[2] = {
        num: 3,
        question: "JAK CHCESZ GO ZHAKOWAĆ (WEKTOR ATAKU)?",
        answer: "ZDJĘCIA Z IMPREZY (ARCHIWUM ZIP)",
        isCorrect: true,
        outcome: 'ideal',
        details: partyOpt.details
      };

      set({
        selectedVectorId: 'party_usb_zip',
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: partyOpt.label
          }
        ],
        playerChoices: updatedChoices,
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playSuccess();
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `msg_${Date.now()}`,
              sender: 'BYTE_MASTER',
              text: partyOpt.feedback
            },
            {
              id: `msg_${Date.now() + 1}`,
              sender: 'BYTE_MASTER',
              text: 'WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ:',
              actionButton: {
                type: 'download_attachments',
                label: 'POBIERZ ZAŁĄCZNIKI'
              }
            }
          ],
          isByteMasterTyping: false,
          chatStage: 'awaiting_usb',
          chatAvailableChoices: []
        }));
      }, 2000);
      return;
    }

    if (optionId === 'drone_report_ready') {
      sounds.playClick();
      set({
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: 'GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIE PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM PODBIJE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI.'
          },
          {
            id: `msg_${Date.now() + 1}`,
            sender: 'PLAYER',
            text: 'MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?'
          }
        ],
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playRadarBlip();
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `msg_${Date.now()}`,
              sender: 'BYTE_MASTER',
              text: 'JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-234 WROCŁAW, POLSKA (PL).'
            },
            {
              id: `msg_${Date.now() + 1}`,
              sender: 'BYTE_MASTER',
              text: 'DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA. WTEDY W PRACY NA PEWNO SPRAWDZI ZAWARTOŚĆ.'
            }
          ],
          isByteMasterTyping: false,
          chatAvailableChoices: [
            { id: 'drone_timejump_confirm', label: 'JASNE. SŁYSZYMY SIĘ ZA KILKA GODZIN' }
          ]
        }));
      }, 2000);
      return;
    }

    if (optionId === 'drone_timejump_confirm') {
      sounds.playClick();
      set({
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: 'JASNE. SŁYSZYMY SIĘ ZA KILKA GODZIN.'
          }
        ],
        chatAvailableChoices: []
      });

      // Time Jump to 06:02 AM!
      setTimeout(() => {
        sounds.playRadarBlip();
        set({
          systemTime: '06:02',
          chatMessages: [
            ...get().chatMessages,
            {
              id: `msg_${Date.now()}`,
              sender: 'SYSTEM',
              text: '--- 06:02 AM : NASTĄPIŁ PRZESKOK CZASU ---'
            }
          ],
          isByteMasterTyping: true
        });

        setTimeout(() => {
          sounds.playRadarBlip();
          set((s) => ({
            chatMessages: [
              ...s.chatMessages,
              {
                id: `msg_${Date.now()}`,
                sender: 'BYTE_MASTER',
                text: 'JUŻ CZAS. DRON GOTOWY DO WYLOTU?'
              }
            ],
            isByteMasterTyping: false,
            chatAvailableChoices: [
              {
                id: 'drone_ready_to_launch',
                label: 'JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE\'A'
              }
            ]
          }));
        }, 2000);
      }, 1200);
      return;
    }

    if (optionId === 'drone_ready_to_launch') {
      sounds.playClick();
      set({
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: 'JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE\'A'
          }
        ],
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playRadarBlip();
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `msg_${Date.now()}`,
              sender: 'BYTE_MASTER',
              text: 'WSKAŻ DOM MATEUSZA NA MAPIE. ADRES WYSŁAŁEM CI WCZEŚNIEJ. PRZEWIŃ CZAT, JEŚLI GO NIE PAMIĘTASZ.'
            },
            {
              id: `msg_${Date.now() + 1}`,
              sender: 'BYTE_MASTER',
              text: 'GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM. PRZESYŁAM CI ZDJĘCIE:',
              imageSrc: 'car_ref'
            }
          ],
          isByteMasterTyping: false
        }));
        get().openApp('drone_app');
      }, 2000);
      return;
    }

    if (optionId === 'post_drone_wait') {
      sounds.playClick();
      set({
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: 'OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA.'
          }
        ],
        chatAvailableChoices: []
      });

      setTimeout(() => {
        get().triggerMalwareAlarm();
      }, 1500);
      return;
    }

    if (optionId === 'claim_btc') {
      sounds.playClick();
      set({
        chatMessages: [
          ...state.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'PLAYER',
            text: 'MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?'
          }
        ],
        isByteMasterTyping: true,
        chatAvailableChoices: []
      });

      setTimeout(() => {
        sounds.playSuccess();
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: `msg_${Date.now()}`,
              sender: 'BYTE_MASTER',
              text: 'WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI. JESTEŚMY W KONTAKCIE!'
            }
          ],
          isByteMasterTyping: false
        }));
        get().openNetworkGraph();
      }, 2000);
      return;
    }
  },

  inspectEmployee: (id) => {
    sounds.playClick();
    const { activeMission } = get();
    set({ selectedEmployeeId: id });
    const targetChoices = (activeMission.step2?.targetOptions || []).map((t: any) => ({
      id: t.id,
      label: t.label,
      isCorrect: t.isCorrect
    }));
    set({
      chatStage: 'choose_target',
      chatAvailableChoices: targetChoices
    });
  },

  triggerChatAttention: () => {
    sounds.playNotification();
    set({ isChatAttentionActive: true });
    setTimeout(() => {
      set({ isChatAttentionActive: false });
    }, 4000);
  },

  viewEventsTab: () => {
    sounds.playClick();
    const state = get();
    const { activeMission } = state;
    if (state.chatStage === 'awaiting_events' && !state.hasViewedEvents) {
      sounds.playNotification();
      set({
        hasViewedEvents: true,
        chatStage: 'choose_vector',
        chatAvailableChoices: (activeMission.step2?.vectorOptions || []).map((v: any) => ({
          id: v.id,
          label: v.label,
          isCorrect: v.isCorrect
        }))
      });
      get().triggerChatAttention();
    }
  },

  // ----------------- STEP 3: USB PENDRIVE -----------------
  addAttachmentToUsb: (id) => {
    sounds.playClick();
    const current = [...get().usbFiles];
    if (!current.includes(id)) current.push(id);

    const { activeMission } = get();
    const attachments = activeMission.step3?.attachments || [];
    const att = attachments.find((a: any) => a.id === id);
    const updatedChoices = [...get().playerChoices];

    if (id === 'party_photos') {
      sounds.playSuccess();
      updatedChoices[3] = {
        num: 4,
        question: "WYBÓR ZAŁĄCZNIKÓW DO ZAINFEKOWANIA:",
        answer: att?.name || "IMG_00034521.JPG X3 (ZDJĘCIA Z IMPREZY)",
        isCorrect: true,
        outcome: 'ideal',
        details: "Paczka zdjęć z imprezy doskonale pasuje do profilu ofiary i usypia jej czujność."
      };
      set({ usbFiles: current, playerChoices: updatedChoices });
    } else if (id === 'hr_docs') {
      sounds.playError();
      updatedChoices[3] = {
        num: 4,
        question: "WYBÓR ZAŁĄCZNIKÓW DO ZAINFEKOWANIA:",
        answer: att?.name || "DOKUMENTY_HR.DOCX",
        isCorrect: false,
        outcome: 'suboptimal',
        btcPenalty: -0.89,
        details: "Dokumenty kadrowe wzbudzają pewne podejrzenia, lecz pracownik może je otworzyć."
      };
      set((s) => ({
        usbFiles: current,
        playerChoices: updatedChoices,
        score: Math.max(70, s.score - 10),
        goodChoicesCount: s.goodChoicesCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: +(Math.max(0, s.btcReward - 0.89)).toFixed(2)
      }));
    } else if (id === 'termination') {
      sounds.playAlarm();
      updatedChoices[3] = {
        num: 4,
        question: "WYBÓR ZAŁĄCZNIKÓW DO ZAINFEKOWANIA:",
        answer: att?.name || "WYPOWIEDZENIE_UMOWY_O_PRACE.PDF",
        isCorrect: false,
        outcome: 'critical',
        btcPenalty: -0.89,
        details: "Pismo o zwolnieniu wywołuje natychmiastową panikę i telefon do kadr/przełożonego!"
      };
      set((s) => ({
        usbFiles: current,
        playerChoices: updatedChoices,
        score: Math.max(60, s.score - 15),
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: +(Math.max(0, s.btcReward - 0.89)).toFixed(2)
      }));
      get().triggerDetection(
        "WYKRYTO: DOKUMENT WYWOŁAŁ PANIKĘ I REAKCJĘ DZIAŁU HR!",
        "Pracownik po znalezieniu pliku 'WYPOWIEDZENIE UMOWY' natychmiast zadzwonił do działu kadr i zgłosił incydent bezpieczeństwa!",
        4
      );
    } else {
      set({ usbFiles: current });
    }
  },

  bindRatToArchive: () => {
    sounds.playSuccess();
    set({ isRatBoundToZip: true });
  },

  setUsbVolumeName: (id) => {
    sounds.playClick();
    const { activeMission } = get();
    const volumeOptions = activeMission.step3?.volumeOptions || [];
    const opt = volumeOptions.find((o: any) => o.id === id);
    const updatedChoices = [...get().playerChoices];
    const isCorrect = !!opt?.isCorrect;
    const isCritical = id === 'vol_keylogger';
    const outcome: ChoiceOutcome = isCorrect ? 'ideal' : isCritical ? 'critical' : 'suboptimal';
    const btcLoss = 0.89;

    updatedChoices[4] = {
      num: 5,
      question: "WYBIERZ NAZWĘ PENDRIVE'A:",
      answer: opt?.label || id,
      isCorrect,
      outcome,
      btcPenalty: isCorrect ? undefined : -btcLoss,
      details: isCorrect
        ? "Naturalna, wiarygodna etykieta woluminu spójna z przygotowaną przynętą."
        : isCritical
        ? "Nazwa 'KEYLOGGER' to natychmiastowa kompromitacja nośnika."
        : "Podejrzana nazwa pendrive'a może zaalarmować użytkownika lub analityka."
    };

    if (isCritical) {
      sounds.playAlarm();
      set((s) => ({
        selectedVolumeName: id,
        playerChoices: updatedChoices,
        score: Math.max(60, s.score - 15),
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: +(Math.max(0, s.btcReward - btcLoss)).toFixed(2)
      }));
      get().triggerDetection(
        "WYKRYTO: PODEJRZANA NAZWA WOLUMINU!",
        "Nazwa woluminu 'KEYLOGGER' została natychmiast zablokowana przez reguły Defender/EDR!",
        5
      );
    } else if (!isCorrect) {
      sounds.playError();
      set((s) => ({
        selectedVolumeName: id,
        playerChoices: updatedChoices,
        score: Math.max(70, s.score - 10),
        goodChoicesCount: s.goodChoicesCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: +(Math.max(0, s.btcReward - btcLoss)).toFixed(2)
      }));
    } else {
      sounds.playSuccess();
      set({ selectedVolumeName: id, playerChoices: updatedChoices });
    }
  },

  setUsbEnvelopeName: (id) => {
    sounds.playClick();
    const { activeMission } = get();
    const envelopeOptions = activeMission.step3?.envelopeOptions || [];
    const opt = envelopeOptions.find((o: any) => o.id === id);
    const updatedChoices = [...get().playerChoices];
    const isCorrect = !!opt?.isCorrect;
    const isCritical = id === 'env_termination';
    const outcome: ChoiceOutcome = isCorrect ? 'ideal' : isCritical ? 'critical' : 'suboptimal';
    const btcLoss = 0.89;

    updatedChoices[5] = {
      num: 6,
      question: "WYBIERZ PODPIS NA KOPERCIE:",
      answer: opt?.label || id,
      isCorrect,
      outcome,
      btcPenalty: isCorrect ? undefined : -btcLoss,
      details: isCorrect
        ? "Dedykowana etykieta fizyczna maksymalizuje szansę podłączenia nośnika przez pracownika."
        : isCritical
        ? "Napis o zwolnieniu z pracy wzbudził czujność ochrony i personelu."
        : "Zbyt oczywisty lub agresywny podpis budzi natychmiastowe podejrzenia."
    };

    if (isCritical) {
      sounds.playAlarm();
      set((s) => ({
        selectedEnvelopeName: id,
        playerChoices: updatedChoices,
        score: Math.max(60, s.score - 15),
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: +(Math.max(0, s.btcReward - btcLoss)).toFixed(2)
      }));
      get().triggerDetection(
        "WYKRYTO: KOPERTA ZE ZWOLNIENIEM PRZEKAZANA DO KADR!",
        "Koperta z napisem 'WYPOWIEDZENIE UMOWY' trafiła natychmiast do działu HR i ochrony!",
        6
      );
    } else if (!isCorrect) {
      sounds.playError();
      set((s) => ({
        selectedEnvelopeName: id,
        playerChoices: updatedChoices,
        score: Math.max(70, s.score - 10),
        goodChoicesCount: s.goodChoicesCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        btcReward: +(Math.max(0, s.btcReward - btcLoss)).toFixed(2)
      }));
    } else {
      sounds.playSuccess();
      set({ selectedEnvelopeName: id, playerChoices: updatedChoices });
    }
  },

  ejectUsbDrive: () => {
    sounds.playSuccess();
    set({
      isUsbEjected: true,
      hasUsbInserted: false,
      activeApp: null, // Return to desktop
      chatStage: 'usb_ready',
      chatAvailableChoices: [
        { id: 'drone_report_ready', label: 'GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA...' }
      ]
    });
  },

  // ----------------- STEP 4: DRONE -----------------
  attachEnvelopeToDrone: () => {
    sounds.playSuccess();
    set({
      isEnvelopeAttachedToDrone: true,
      droneFlightState: 'waiting_coords'
    });
  },

  selectDroneCoord: (id) => {
    sounds.playRadarBlip();
    set({ selectedCoordId: id });
  },

  confirmDroneCoords: () => {
    sounds.playClick();
    const { selectedCoordId, activeMission } = get();
    const mapLocations = activeMission.step4?.mapLocations || [];
    const loc = mapLocations.find((l: any) => l.id === selectedCoordId);
    const updatedChoices = [...get().playerChoices];
    const isCorrect = !!loc?.isCorrect;

    updatedChoices[6] = {
      num: 7,
      question: "WSKAŻ DRONOWI ADRES DOMU OFIARY:",
      answer: loc?.address || "NIEZNANY ADRES",
      isCorrect,
      outcome: isCorrect ? 'ideal' : 'critical',
      details: isCorrect
        ? "Właściwa lokalizacja uzyskana podczas fazy rekonesansu adresu Mateusza."
        : "Błędne współrzędne – dron wylądował pod niewłaściwym adresem!"
    };

    if (!isCorrect) {
      set((s) => ({
        score: Math.max(60, s.score - 15),
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        playerChoices: updatedChoices,
        droneFlightState: 'flying'
      }));
      get().triggerDetection(
        "BŁĘDNY ADRES – DRON WYKRYTY PRZEZ OSOBY POSTRONNE!",
        `Dron zrzucił przesyłkę pod adresem: ${loc?.address || 'Nieznany'}. Właściciel posesji zauważył drona i zaalarmował służby!`,
        7
      );
    } else {
      sounds.playSuccess();
      set({ playerChoices: updatedChoices, droneFlightState: 'flying' });
    }
  },

  activateDroneCamera: () => {
    sounds.playSuccess();
    set({ droneFlightState: 'camera_active' });
  },

  selectCarTarget: (carId) => {
    sounds.playRadarBlip();
    set({ selectedCarId: carId });
  },

  dropPayloadOnCar: async () => {
    const { selectedCarId, activeMission } = get();
    const parkingCars = activeMission.step4?.parkingCars || [];
    const car = parkingCars.find((c: any) => c.id === selectedCarId);
    const updatedChoices = [...get().playerChoices];
    const isTarget = !!car?.isTarget;

    updatedChoices[7] = {
      num: 8,
      question: "WYBIERZ MIEJSCE NA PARKINGU (POJAZD OFIARY):",
      answer: car?.desc || `POJAZD #${selectedCarId}`,
      isCorrect: isTarget,
      outcome: isTarget ? 'ideal' : 'critical',
      details: isTarget
        ? "Precyzyjna identyfikacja pojazdu na podstawie zdjęcia przesłanego przez Byte_Mastera."
        : "Błędny pojazd – koperta trafiła na samochód osoby postronnej!"
    };

    if (!isTarget) {
      set((s) => ({
        score: Math.max(60, s.score - 20),
        criticalErrorsCount: s.criticalErrorsCount + 1,
        perfectChoicesCount: Math.max(0, s.perfectChoicesCount - 1),
        playerChoices: updatedChoices,
        droneDropSuccess: true,
        droneFlightState: 'dropped'
      }));
      get().triggerDetection(
        "BŁĘDNY POJAZD – KOPERTA TRAFIŁA NA NIEWŁAŚCIWY SAMOCHÓD!",
        `Zostawiłeś kopertę na pojeździe: "${car?.desc || 'Nieznany pojazd'}". Kierowca natychmiast zgłosił podejrzaną paczkę ochronie osiedla!`,
        8
      );
    } else {
      sounds.playSuccess();
      set({
        playerChoices: updatedChoices,
        droneDropSuccess: true,
        droneFlightState: 'dropped'
      });
    }
  },

  closeDroneApp: () => {
    sounds.playClick();
    set({
      activeApp: null,
      chatAvailableChoices: [
        { id: 'post_drone_wait', label: 'OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA' }
      ]
    });
  },

  // ----------------- STEP 5: TAKEOVER -----------------
  triggerMalwareAlarm: () => {
    sounds.playAlarm();
    set({
      systemTime: '08:12',
      isAlarmActive: true,
      notificationBadges: { rat_session: 1 }
    });
    get().openApp('rat_session');
  },

  launchDesktopTakeover: () => {
    sounds.playSuccess();
    set({
      isDesktopTakeoverActive: true,
      chatAvailableChoices: [
        { id: 'claim_btc', label: 'MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE MOGĘ LICZYĆ NA KILKA BITCOINÓW?' }
      ]
    });
  },

  openNetworkGraph: () => {
    sounds.playSuccess();
    set({ isNetworkGraphActive: true });
  },

  openDebrief: () => {
    sounds.playSuccess();
    const { score, activeMission } = get();
    MockLRS.sendStatement(
      createMissionCompletionStatement(
        { name: "Infiltrator Agent", mbox: "mailto:agent@hackers.os" },
        score,
        `Completed ${activeMission.mission.title} social engineering penetration simulation`,
        activeMission.mission
      )
    );
    set({
      xapiSent: true,
      activeApp: 'debrief_app'
    });
  },

  // ----------------- STEP 6: DEBRIEF -----------------
  toggleChoiceDetails: (index) => {
    sounds.playClick();
    set((s) => ({
      expandedChoiceIndex: s.expandedChoiceIndex === index ? null : index
    }));
  },

  toggleKnowledgeBase: () => {
    sounds.playClick();
    set((s) => ({ isKnowledgeBaseOpen: !s.isKnowledgeBaseOpen }));
  },

  resetGame: () => {
    sounds.playClick();
    const currentMission = get().activeMission;
    set(getInitialMissionState(currentMission));
  },


  // ----------------- GENERIC SCENARIO TRANSITIONS -----------------
  // LEGACY (wzorzec A): przejścia fabularne z obiektu `transitions` w JSON.
  // Zastępuje je stages[].completion + completeStage (wzorzec B). Nie używać w nowych misjach.
  runScenarioTransition: (transitionId) => {
    const { activeMission } = get();
    const transition = activeMission.transitions?.[transitionId];
    if (!transition) return;

    if (transition.closeActiveApp) {
      set({ activeApp: null });
    }

    if (transition.unlockIcons && transition.unlockIcons.length > 0) {
      const currentUnlocked = [...get().unlockedIcons];
      transition.unlockIcons.forEach((icon) => {
        if (!currentUnlocked.includes(icon)) currentUnlocked.push(icon);
      });
      set({ unlockedIcons: currentUnlocked });
    }

    if (transition.badges) {
      set((s) => ({
        notificationBadges: { ...s.notificationBadges, ...transition.badges }
      }));
    }

    if (transition.timeJump) {
      sounds.playRadarBlip();
      set((s) => ({
        systemTime: transition.timeJump!,
        chatMessages: [
          ...s.chatMessages,
          {
            id: `msg_${Date.now()}`,
            sender: 'SYSTEM',
            text: `--- ${transition.timeJump} : NASTĄPIŁ PRZESKOK CZASU ---`
          }
        ]
      }));
    }

    const messages = transition.byteMasterMessages || [];
    const nextChoices = transition.nextChatChoices || [];

    if (messages.length > 0) {
      set({ isByteMasterTyping: true, chatAvailableChoices: [] });
      setTimeout(() => {
        sounds.playRadarBlip();
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            ...messages.map((m, idx) => ({
              id: `msg_${Date.now()}_${idx}`,
              sender: 'BYTE_MASTER' as const,
              text: m.text,
              actionButton: m.actionButton,
              imageSrc: m.imageSrc
            }))
          ],
          isByteMasterTyping: false,
          chatAvailableChoices: nextChoices
        }));
      }, 1200);
    } else if (nextChoices.length > 0) {
      set({ chatAvailableChoices: nextChoices });
    }
  },

  // ----------------- SCORM 2004 ACTIONS -----------------
  submitScormAndExit: () => {
    sounds.playSuccess();
    const { score, playerChoices, criticalErrorsCount, btcReward, activeMission } = get();
    const sessionSeconds = scorm2004.getElapsedTimeSeconds();

    const interactions: ScormInteraction[] = playerChoices.map((pc) => ({
      id: `step_${pc.num}_choice`,
      type: 'choice',
      description: pc.question,
      learnerResponse: pc.answer,
      result: pc.isCorrect ? 'correct' : 'incorrect'
    }));

    const suspendData = JSON.stringify({
      score,
      criticalErrors: criticalErrorsCount,
      btcReward,
      completedAt: new Date().toISOString()
    });

    const result = scorm2004.submitFinalScore({
      missionId: activeMission.mission.id,
      scoreRaw: score,
      passingScore: activeMission.mission.passingScore ?? 70,
      sessionSeconds,
      interactions,
      suspendData
    });

    set({
      isScormSubmitted: true,
      scormSubmitMessage: result.message,
      isExitModalOpen: true
    });

    return result;
  },

  closeExitModal: () => {
    sounds.playClick();
    set({ isExitModalOpen: false });
  },

  openExitModal: () => {
    sounds.playClick();
    set({ isExitModalOpen: true });
  }
}));
