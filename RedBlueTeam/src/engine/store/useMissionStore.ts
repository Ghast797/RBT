import { create } from 'zustand';
import type { MissionDefinition, PlayerChoiceRecord, DecisionReport, ConversationBeat, ChoiceOutcome } from '../types/mission';
import { penaltyForTier, btcForScore, resolveDecisionCount, DEFAULT_PASSING_SCORE, roundScore } from '../core/scoring';
import { resolveInitialMission, getMission } from '../registry/missionRegistry';
import { sounds } from '../audio/soundEffects';
import { createMissionCompletionStatement, MockLRS } from '../scorm/xapi';
import { scorm2004, type ScormInteraction } from '../scorm/scorm2004';

/** Identyfikator kafelka pulpitu (`desktopApps[].id`) albo aplikacji silnika, np. `debrief_app`. */
export type WindowId = string;

export interface ChatMessage {
  id: string;
  sender: 'BYTE_MASTER' | 'PLAYER' | 'SYSTEM';
  text: string;
  timestamp?: string;
}

export type { PlayerChoiceRecord };

export interface ChatChoiceOption {
  id: string;
  label: string;
  /** Kwestia gracza w rozmowie mostkującej (dialog z VR): klik wysyła echo i przesuwa rozmowę, NIE otwiera aplikacji. */
  bridgeBeat?: boolean;
}

export type BootStage = 'incoming_call' | 'intro_chat' | 'bios_boot' | 'desktop';

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
  /** Odpowiedzi gracza wysłane w intrze (id kwestii → treść), by trafiły do historii czatu w HACKERS.OS. */
  introReplies: Record<string, string>;

  // Desktop Focus & System
  activeApp: WindowId | null;
  /**
   * Aplikacje uruchomione w tym podejściu. Silnik trzyma je zamontowane (ukryte),
   * więc po wyjściu na pulpit i ponownym otwarciu gracz wraca tam, gdzie był.
   * Zerowane przy wczytaniu misji i każdej powtórce.
   */
  openedApps: WindowId[];
  /** Identyfikator podejścia — zmiana odmontowuje wszystkie zapamiętane aplikacje. */
  appRunId: number;
  /** Etapy już ukończone — ponowne ukończenie tylko zamyka okno, bez powtórki mostka. */
  completedStages: string[];
  /** Etapy, których `openingConversation` już zagrała albo czeka w kolejce — rozmowa gra raz na rozgrywkę. */
  playedOpenings: string[];
  /** Rozmowy przy otwarciu aplikacji odłożone, bo akurat trwał mostek (grają po jego końcu, po kolei). */
  queuedOpenings: string[];
  unlockedIcons: string[];
  unlockIcon: (id: string) => void;
  notificationBadges: Record<string, number>;
  setNotificationBadge: (id: string, count: number) => void;
  clearNotificationBadge: (id: string) => void;
  systemDate: string;
  /** Zegar systemowy pulpitu („HH:MM”); pusty, dopóki żaden przeskok czasu (`clock`) go nie ustawił. */
  systemTime: string;

  // Czat z mentorem
  chatMessages: ChatMessage[];
  chatAvailableChoices: ChatChoiceOption[];
  isByteMasterTyping: boolean;
  isChatAttentionActive: boolean;
  /** Kafelek pulpitu do podświetlenia (świeżo odblokowany następny krok). */
  highlightedTileId: string | null;
  /** Baner połączenia przychodzącego na pulpicie (`StageCompletion.incomingCall`). */
  incomingCall: { appId: string; label: string } | null;
  /** Trwająca rozmowa mostkująca etapy (skrypt + pozycja + odblokowania na końcu). */
  pendingBridge: {
    beats: ConversationBeat[];
    index: number;
    unlock: {
      unlockIcons?: string[];
      badges?: Record<string, number>;
      highlightTile?: string;
      incomingCall?: { appId: string; label: string };
    };
    sound?: 'notification' | 'alarm' | 'success';
    /** Opóźnienie odblokowań po końcu mostka (`StageCompletion.unlockDelayMs`). */
    unlockDelayMs?: number;
    /** Czy w mostku był beat `time_jump` (domyślne opóźnienie 3 s). */
    hadTimeJump?: boolean;
    /** Kiedy (ms, `Date.now()`) skończył się ostatni przeskok czasu — od tej chwili liczy się opóźnienie odblokowań. */
    timeJumpEndedAt?: number;
    /** To `openingConversation` etapu (rozmowa przy otwarciu aplikacji), nie mostek po ukończeniu etapu: bez odblokowań i dźwięku. */
    opening?: boolean;
  } | null;
  /** Trwający przeskok czasu (nakładka na pulpicie); `null`, gdy nic nie trwa. */
  timeJump: { label?: string; sublabel?: string; durationMs?: number; clockFrom?: string; clock?: string } | null;
  /** Licznik rozpoczętych przeskoków czasu — `key` nakładki, by kolejny przeskok pod rząd przemontował zegar. */
  timeJumpCount: number;
  /** Wywoływane przez nakładkę po zakończeniu animacji — mostek gra dalej. */
  endTimeJump: () => void;

  // Raport i punktacja
  score: number;
  btcReward: number;
  perfectChoicesCount: number;
  goodChoicesCount: number;
  criticalErrorsCount: number;
  xapiSent: boolean;
  expandedChoiceIndex: number | null;
  playerChoices: PlayerChoiceRecord[];
  /** Numery decyzji zgłoszonych w tym podejściu (bez `critical`) — podstawa autozapisu SCORM. */
  reportedDecisions: number[];
  decisionTiers: Record<number, ChoiceOutcome>;
  recordChoice: (choice: PlayerChoiceRecord, penalty?: number) => void;
  /**
   * Kontrakt klocka/minigry: zgłoszenie ocenianej decyzji.
   * Silnik liczy punkty i karę BTC z `tier` oraz odpala wykrycie przy 'critical'.
   */
  reportDecision: (report: DecisionReport) => void;
  /** Kontrakt klocka/minigry: ukończenie etapu (odblokowania, badge, wiadomość mentora). */
  completeStage: (stageId: string) => void;
  advanceBridge: () => void;

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
  nextIntroDialog: (reply?: { dialogId: string; text: string }) => void;
  /** Zapamiętuje odpowiedź gracza w intrze bez przechodzenia dalej (gdy najpierw pokazujemy mentorReaction). */
  recordIntroReply: (reply: { dialogId: string; text: string }) => void;
  startBiosBoot: () => void;
  finishBiosBoot: () => void;

  openApp: (app: WindowId) => void;
  /** Dopisuje aplikację do zapamiętanych (gdy ustawiono `activeApp` z pominięciem `openApp`). */
  rememberApp: (app: WindowId) => void;
  closeApp: () => void;

  // Czat
  /** Klik w kwestię gracza w czacie (beat `player` rozmowy mostkującej). */
  chooseChatOption: (optionId: string) => void;
  triggerChatAttention: () => void;

  // Raport
  /** Otwiera raport pooperacyjny i wysyła zdanie xAPI o ukończeniu misji. */
  openDebrief: () => void;
  toggleChoiceDetails: (index: number) => void;
  resetGame: () => void;

  // SCORM Actions
  /**
   * Zapis wyniku do Moodle bez kończenia sesji. Silnik woła go sam po ostatniej
   * ocenianej decyzji misji; ponowne wywołanie nadpisuje wynik.
   */
  saveMissionResult: () => { success: boolean; message: string };
  /** Zapis wyniku i zakończenie sesji SCORM (przycisk wyjścia w raporcie). */
  submitScormAndExit: () => { success: boolean; message: string };
  closeExitModal: () => void;
  openExitModal: () => void;
}

/**
 * Początkowy stan czatu po starcie systemu — sterowany danymi misji.
 * Misja data-driven (wzorzec B) podaje `intro.dialogue` (trafia do logu czatu jako
 * historia), `intro.firstChoice` (kwestia gracza z VR) i `intro.firstUnlock`
 * (co odblokować po tej kwestii) — to pierwsza rozmowa mostkująca. Bez obu pól
 * pulpit startuje z samą historią intro.
 */
function resolveOpeningChat(mission: MissionDefinition, introReplies: Record<string, string> = {}): {
  messages: ChatMessage[];
  startBadges: Record<string, number>;
  bridge: MissionState['pendingBridge'] | null;
  choices: ChatChoiceOption[];
} {
  const intro = (mission?.intro || {}) as any;

  // Rozmowa intro „przenosi się" do logu czatu jako historia (naprzemiennie BYTE_MASTER / gracz).
  const history: ChatMessage[] = [];
  (intro.dialogue || []).forEach((d: any, i: number) => {
    if (d.text) history.push({ id: `intro_bm_${i}`, sender: 'BYTE_MASTER', text: d.text });
    const reply = introReplies[d.id] ?? d.playerResponse ?? d.playerOptions?.[0]?.label;
    if (reply) history.push({ id: `intro_pl_${i}`, sender: 'PLAYER', text: reply });
    // Reakcja mentora na faktycznie wybraną odpowiedź (jeśli dane ją przewidują).
    const reaction = (d.playerOptions || []).find((o: any) => o.label === introReplies[d.id])?.mentorReaction;
    if (reaction) history.push({ id: `intro_mr_${i}`, sender: 'BYTE_MASTER', text: reaction });
  });

  // Wzorzec B: intro kończy się kwestią gracza (firstChoice), która odblokowuje pierwszą aplikację.
  if (intro.firstChoice) {
    const bridge: MissionState['pendingBridge'] = {
      beats: [{ from: 'player', id: intro.firstChoice.id, label: intro.firstChoice.label }],
      index: 0,
      unlock: intro.firstUnlock || {},
      sound: 'notification'
    };
    return {
      messages: history,
      startBadges: intro.startBadges || { chat: 1 },
      bridge,
      choices: []
    };
  }

  // Wzorzec B (bez kwestii w czacie): aplikacja odblokowana od razu po starcie pulpitu
  if (intro.firstUnlock) {
    const bridge: MissionState['pendingBridge'] = {
      beats: [],
      index: 0,
      unlock: intro.firstUnlock,
      sound: 'notification'
    };
    return {
      messages: history,
      startBadges: intro.startBadges || intro.firstUnlock.badges || {},
      bridge,
      choices: []
    };
  }

  return {
    messages: history,
    startBadges: intro.startBadges || {},
    bridge: null,
    choices: []
  };
}

let appRunCounter = 0;

const withOpenedApp = (opened: WindowId[], app: WindowId): WindowId[] =>
  opened.includes(app) ? opened : [...opened, app];

const getInitialMissionState = (mission: MissionDefinition) => {
  const choices: PlayerChoiceRecord[] = (mission.step6?.choices || []).map((c: any) => ({
    num: c.num,
    question: c.question,
    answer: c.answer,
    isCorrect: c.correct,
    details: c.details,
    outcome: c.outcome,
    btcPenalty: c.btcPenalty,
    negotiationTranscript: c.negotiationTranscript
  }));

  const initialUnlocked = (mission.desktopApps || [])
    .filter(app => !app.unlockedOnly)
    .map(app => app.id);

  return {
    activeMission: mission,
    bootStage: 'incoming_call' as BootStage,
    introDialogIndex: 0,
    introReplies: {} as Record<string, string>,

    activeApp: null as WindowId | null,
    openedApps: [] as WindowId[],
    appRunId: ++appRunCounter,
    completedStages: [] as string[],
    playedOpenings: [] as string[],
    queuedOpenings: [] as string[],
    unlockedIcons: initialUnlocked,
    notificationBadges: {} as Record<string, number>,
    systemDate: mission.mission?.date || '',
    systemTime: '',
    customState: {} as Record<string, any>,

    // Czat
    chatMessages: [] as ChatMessage[],
    chatAvailableChoices: [] as ChatChoiceOption[],
    isByteMasterTyping: false,
    isChatAttentionActive: false,
    highlightedTileId: null as string | null,
    incomingCall: null as { appId: string; label: string } | null,
    pendingBridge: null as MissionState['pendingBridge'],
    timeJump: null as MissionState['timeJump'],
    timeJumpCount: 0,

    // Raport i punktacja
    score: mission.mission?.maxScore ?? 100,
    btcReward: mission.mission?.rewardBtc ?? 0,
    perfectChoicesCount: mission.step6?.summary?.perfectChoices ?? choices.length,
    goodChoicesCount: mission.step6?.summary?.goodChoices ?? 0,
    criticalErrorsCount: 0,
    xapiSent: false,
    expandedChoiceIndex: null as number | null,
    playerChoices: choices,
    reportedDecisions: [] as number[],
    decisionTiers: {} as Record<number, ChoiceOutcome>,

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

// Tempo rozmowy mostkującej: pauza „pisze" przed każdą kwestią BYTE_MASTERA (2 s).
let BRIDGE_DELAY = 2000;
/** Tylko do testów: skraca delay rozmowy, by nie czekać sekund. */
export function __setBridgeDelayForTests(ms: number) { BRIDGE_DELAY = ms; }

// Odblokowania po przeskoku czasu: domyślne opóźnienie i oczekujący timer.
const DEFAULT_UNLOCK_DELAY_AFTER_TIME_JUMP = 3000;
let unlockTimer: ReturnType<typeof setTimeout> | null = null;
function clearUnlockTimer() {
  if (unlockTimer !== null) {
    clearTimeout(unlockTimer);
    unlockTimer = null;
  }
}

// Znacznik „pisania” mentora: każde wejście w `advanceBridge` unieważnia opóźnioną kwestię
// z poprzedniego wejścia, więc zastąpiony lub przerwany mostek nie dopisze starej kwestii.
let typingToken = 0;
/** Przerywa wszystko, co mostek ma w locie (timer odblokowań i opóźnioną kwestię mentora). */
function cancelBridgeTimers() {
  clearUnlockTimer();
  typingToken++;
}

let messageCounter = 0;
/** Unikalny id wiadomości (sam `Date.now()` powtarza się przy dwóch kwestiach w tej samej milisekundzie). */
const nextMessageId = (prefix: string) => `${prefix}_${Date.now()}_${++messageCounter}`;
/** Opóźnienie skaluje się z `__setBridgeDelayForTests` (0 w testach = bez czekania). */
function scaledUnlockDelay(ms: number) {
  return Math.round(ms * (BRIDGE_DELAY / 2000));
}

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

    cancelBridgeTimers();
    set({ ...getInitialMissionState(targetMission), timeJump: null });
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
    cancelBridgeTimers();
    const currentMission = get().activeMission;
    set({
      ...getInitialMissionState(currentMission),
      timeJump: null,
      bootStage: 'incoming_call',
      isDetectedModalOpen: false,
      detectionReason: null,
      isRetryModalOpen: false
    });
  },

  retryFromChoices: () => {
    sounds.playSuccess();
    cancelBridgeTimers();
    const currentMission = get().activeMission;
    const baseInitial = getInitialMissionState(currentMission);
    const introReplies = get().introReplies;
    const opening = resolveOpeningChat(currentMission, introReplies);

    set({
      ...baseInitial,
      introReplies, // „BEZ INTRO” zachowuje odpowiedzi gracza z intra
      timeJump: null,
      bootStage: 'desktop',
      activeApp: null,
      isDetectedModalOpen: false,
      detectionReason: null,
      isRetryModalOpen: false,
      notificationBadges: opening.startBadges,
      highlightedTileId: null,
      chatMessages: opening.messages,
      chatAvailableChoices: opening.choices,
      pendingBridge: opening.bridge
    });
    if (opening.bridge) get().advanceBridge();
  },

  recordChoice: (choice, penalty = 0) => {
    const choices = [...get().playerChoices];
    const existingIndex = choices.findIndex((c) => c.num === choice.num);

    // Determine outcome if not explicitly set
    let outcome = choice.outcome;
    if (!outcome) {
      outcome = choice.isCorrect ? 'ideal' : 'critical';
    }
    const existing = existingIndex >= 0 ? choices[existingIndex] : undefined;
    const finalChoice: PlayerChoiceRecord = {
      ...existing,
      ...choice,
      outcome,
      negotiationTranscript: choice.negotiationTranscript || existing?.negotiationTranscript
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
    // Liczy się pierwsze zgłoszenie decyzji o danym numerze w podejściu (powtórka czyści rekordy).
    if (get().decisionTiers[report.num] !== undefined) return;
    const { activeMission } = get();
    const maxScore = activeMission.mission?.maxScore ?? 100;
    const rewardBtc = activeMission.mission?.rewardBtc ?? 0;
    const decisionCount = resolveDecisionCount(activeMission);

    get().recordChoice(
      {
        num: report.num,
        question: report.question,
        answer: report.answer,
        details: report.feedback,
        isCorrect: report.tier === 'ideal',
        outcome: report.tier
      },
      0
    );

    // Wynik, liczniki i BTC są funkcją rekordów decyzji (nie sumą przyrostową).
    const tiers = { ...get().decisionTiers, [report.num]: report.tier };
    const base = getInitialMissionState(activeMission);
    const all = Object.values(tiers);
    const totalPenalty = all.reduce((sum, t) => sum + penaltyForTier(t, maxScore, decisionCount), 0);
    const nonIdeal = all.filter((t) => t !== 'ideal').length;
    const score = Math.max(0, maxScore - totalPenalty);
    set({
      decisionTiers: tiers,
      score,
      goodChoicesCount: base.goodChoicesCount + all.filter((t) => t === 'suboptimal').length,
      criticalErrorsCount: all.filter((t) => t === 'critical').length,
      perfectChoicesCount: Math.max(0, base.perfectChoicesCount - nonIdeal),
      // Nagroda BTC wynika liniowo z wyniku — nie z osobnych kar w widgetach.
      btcReward: btcForScore(score, rewardBtc)
    });

    // Ostatnia decyzja misji = wynik ostateczny. Zapisujemy go od razu, zanim gracz
    // zobaczy finał i raport — zamknięcie karty w tym miejscu nie gubi oceny.
    if (report.tier !== 'critical') {
      const reported = get().reportedDecisions.includes(report.num)
        ? get().reportedDecisions
        : [...get().reportedDecisions, report.num];
      set({ reportedDecisions: reported });
      if (reported.length >= decisionCount) get().saveMissionResult();
    }

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

    // Etap już zaliczony (gracz wrócił do zapamiętanej aplikacji) — tylko powrót na pulpit.
    if (get().completedStages.includes(stageId)) {
      if (stage.completion.closeActiveApp !== false && get().activeApp === stage.appId) set({ activeApp: null });
      return;
    }

    const { completion } = stage;

    // Gracz zaliczył etap w trakcie rozmowy przy otwarciu aplikacji: jej niezagrana reszta
    // gra przed mostkiem etapu (nic nie ginie), a unieważniony timer starej kwestii nie wraca.
    const running = get().pendingBridge;
    const carriedBeats = running?.opening ? running.beats.slice(running.index) : [];

    // Powrót na pulpit; start rozmowy mostkującej (odblokowania DOPIERO po jej zakończeniu).
    set((s) => ({
      // Zamykamy tylko aplikację tego etapu: minigra kończy się sama po komunikacie sukcesu,
      // więc gracz mógł już wyjść na pulpit i otworzyć inną aplikację.
      activeApp: completion.closeActiveApp === false || s.activeApp !== stage.appId ? s.activeApp : null,
      completedStages: [...s.completedStages, stageId],
      // Zaliczony etap aplikacji, do której prowadził baner połączenia, gasi baner.
      incomingCall: s.incomingCall && s.incomingCall.appId === stage.appId ? null : s.incomingCall,
      chatAvailableChoices: [],
      isByteMasterTyping: false,
      pendingBridge: {
        beats: [...carriedBeats, ...(completion.conversation || [])],
        index: 0,
        unlock: {
          unlockIcons: completion.unlockIcons,
          badges: completion.badges,
          highlightTile: completion.highlightTile,
          incomingCall: completion.incomingCall
        },
        sound: completion.sound,
        unlockDelayMs: completion.unlockDelayMs,
        hadTimeJump: false
      }
    }));
    get().advanceBridge();
  },

  // ----------------- ROZMOWA MOSTKUJĄCA (wzorzec B) -----------------
  // Gra skrypt `conversation` po kolei: kwestie BYTE_MASTERA z animacją „pisze" i
  // delayem, kwestie gracza jako przyciski w czacie. Po ostatnim beacie stosuje
  // odblokowania — więc kafelek odblokowuje się dopiero, gdy gracz napisze do mentora.
  advanceBridge: () => {
    const pb = get().pendingBridge;
    if (!pb) return;
    const i = pb.index;
    const token = ++typingToken;

    // Rozmowa przy otwarciu aplikacji kończy się bez odblokowań i dźwięku; potem gra następna z kolejki.
    if (i >= pb.beats.length && pb.opening) {
      set({ isByteMasterTyping: false, pendingBridge: null });
      playQueuedOpening();
      return;
    }

    // Koniec rozmowy → odblokowania, badge, podświetlenie (z opóźnieniem po przeskoku czasu).
    if (i >= pb.beats.length) {
      const applyUnlock = () => {
        unlockTimer = null;
        set((s) => {
          const unlocked = [...s.unlockedIcons];
          (pb.unlock.unlockIcons || []).forEach((ic) => {
            if (!unlocked.includes(ic)) unlocked.push(ic);
          });
          return {
            unlockedIcons: unlocked,
            notificationBadges: { ...s.notificationBadges, ...(pb.unlock.badges || {}) },
            highlightedTileId: pb.unlock.highlightTile ?? s.highlightedTileId,
            incomingCall: pb.unlock.incomingCall ?? s.incomingCall
          };
        });
        if (pb.sound === 'alarm') sounds.playAlarm();
        else if (pb.sound === 'success') sounds.playSuccess();
        else sounds.playNotification();
      };
      set({ isByteMasterTyping: false, pendingBridge: null });
      // Opóźnienie liczy się od zniknięcia nakładki przeskoku (jeśli był), a nie od końca mostka:
      // czas, który minął na kolejnych kwestiach mentora, jest już odjęty od odstępu.
      const sinceJump = pb.timeJumpEndedAt !== undefined ? Date.now() - pb.timeJumpEndedAt : 0;
      const delay = Math.max(
        0,
        scaledUnlockDelay(pb.unlockDelayMs ?? (pb.hadTimeJump ? DEFAULT_UNLOCK_DELAY_AFTER_TIME_JUMP : 0)) - sinceJump
      );
      clearUnlockTimer();
      if (delay > 0) unlockTimer = setTimeout(applyUnlock, delay);
      else applyUnlock();
      playQueuedOpening();
      return;
    }

    const beat = pb.beats[i];

    // Przeskok czasu → nakładka na pulpicie; mostek czeka na `endTimeJump`.
    if (beat.from === 'time_jump') {
      set((s) => ({
        isByteMasterTyping: false,
        chatAvailableChoices: [],
        timeJumpCount: s.timeJumpCount + 1,
        timeJump: {
          label: beat.label,
          sublabel: beat.sublabel,
          durationMs: beat.durationMs,
          // Start zegara: z beatu, a gdy go brak — bieżąca godzina pulpitu (sprzed skoku).
          clockFrom: beat.clock ? beat.clockFrom ?? (s.systemTime || undefined) : undefined,
          clock: beat.clock
        },
        pendingBridge: s.pendingBridge ? { ...s.pendingBridge, hadTimeJump: true } : null
      }));
      return;
    }

    // Kwestia gracza → przycisk w czacie (klik przesunie rozmowę).
    if (beat.from === 'player') {
      set({ isByteMasterTyping: false, chatAvailableChoices: [{ id: beat.id, label: beat.label, bridgeBeat: true }] });
      return;
    }

    // Kwestia BYTE_MASTERA → animacja „pisze" + delay, potem wiadomość, potem następny beat.
    set({ isByteMasterTyping: true, chatAvailableChoices: [] });
    setTimeout(() => {
      // Mostek mógł zostać przerwany lub zastąpiony (powtórka misji, zaliczenie etapu w trakcie
      // rozmowy przy otwarciu) — nie dopisuj kwestii ze starego przebiegu.
      if (token !== typingToken || !get().pendingBridge) return;
      sounds.playNotification();
      set((s) => ({
        isByteMasterTyping: false,
        chatMessages: [...s.chatMessages, { id: nextMessageId('bm'), sender: 'BYTE_MASTER' as const, text: beat.text }],
        pendingBridge: s.pendingBridge ? { ...s.pendingBridge, index: i + 1 } : null
      }));
      get().advanceBridge();
    }, BRIDGE_DELAY);
  },

  endTimeJump: () => {
    const { timeJump, pendingBridge } = get();
    if (!timeJump) return;
    set((s) => ({
      timeJump: null,
      // Po przeskoku zegar pulpitu pokazuje godzinę z beatu (jeśli ją podano).
      systemTime: timeJump.clock ?? s.systemTime,
      pendingBridge: pendingBridge
        ? { ...pendingBridge, index: pendingBridge.index + 1, timeJumpEndedAt: Date.now() }
        : null
    }));
    get().advanceBridge();
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

  nextIntroDialog: (reply) => {
    sounds.playClick();
    const { introDialogIndex, activeMission, introReplies } = get();
    const maxIndex = (activeMission.intro?.dialogue?.length || 1) - 1;
    if (reply) set({ introReplies: { ...introReplies, [reply.dialogId]: reply.text } });
    if (introDialogIndex < maxIndex) {
      set({ introDialogIndex: introDialogIndex + 1 });
    }
  },

  recordIntroReply: (reply) => {
    set({ introReplies: { ...get().introReplies, [reply.dialogId]: reply.text } });
  },

  startBiosBoot: () => {
    sounds.playClick();
    set({ bootStage: 'bios_boot' });
  },

  finishBiosBoot: () => {
    sounds.playSuccess();
    scorm2004.initialize(true);
    const { activeMission } = get();
    const opening = resolveOpeningChat(activeMission, get().introReplies);

    set({
      bootStage: 'desktop',
      notificationBadges: opening.startBadges,
      highlightedTileId: null,
      chatMessages: opening.messages,
      chatAvailableChoices: opening.choices,
      pendingBridge: opening.bridge
    });
    if (opening.bridge) get().advanceBridge();
  },

  // ----------------- APP NAVIGATION -----------------
  openApp: (app) => {
    sounds.playClick(900, 0.03);
    const badges = { ...get().notificationBadges };
    delete badges[app];

    // Otwarcie podświetlonego kafelka gasi poświatę uwagi.
    const highlightedTileId = get().highlightedTileId === app ? null : get().highlightedTileId;

    set({ activeApp: app, openedApps: withOpenedApp(get().openedApps, app), notificationBadges: badges, highlightedTileId });
    requestOpeningConversation(app);
  },

  rememberApp: (app) => {
    const openedApps = get().openedApps;
    if (!openedApps.includes(app)) set({ openedApps: [...openedApps, app] });
  },

  closeApp: () => {
    sounds.playClick(600, 0.03);
    set({ activeApp: null });
  },

  // ----------------- CZAT -----------------
  chooseChatOption: (optionId) => {
    sounds.playClick();
    const choice = get().chatAvailableChoices.find((c) => c.id === optionId);

    // Kwestia gracza w rozmowie mostkującej (wzorzec B): echo + przesunięcie rozmowy; nic nie otwiera.
    if (choice?.bridgeBeat) {
      set((s) => ({
        chatMessages: [
          ...s.chatMessages,
          { id: nextMessageId('msg'), sender: 'PLAYER', text: choice.label }
        ],
        chatAvailableChoices: [],
        pendingBridge: s.pendingBridge ? { ...s.pendingBridge, index: s.pendingBridge.index + 1 } : null
      }));
      get().advanceBridge();
    }
  },

  triggerChatAttention: () => {
    sounds.playNotification();
    set({ isChatAttentionActive: true });
    setTimeout(() => {
      set({ isChatAttentionActive: false });
    }, 4000);
  },

  openDebrief: () => {
    sounds.playSuccess();
    const { score, activeMission } = get();
    const { title, subTitle } = activeMission.mission;
    MockLRS.sendStatement(
      createMissionCompletionStatement(
        undefined, // domyślny aktor xAPI (neutralny); tożsamość ucznia nadaje LMS
        roundScore(score),
        `Ukończono ${title}${subTitle ? ` — ${subTitle}` : ''}`,
        activeMission.mission,
        activeMission.mission.passingScore ?? DEFAULT_PASSING_SCORE
      )
    );
    set({
      xapiSent: true,
      activeApp: 'debrief_app'
    });
  },

  // ----------------- RAPORT -----------------
  toggleChoiceDetails: (index) => {
    sounds.playClick();
    set((s) => ({
      expandedChoiceIndex: s.expandedChoiceIndex === index ? null : index
    }));
  },

  resetGame: () => {
    sounds.playClick();
    const currentMission = get().activeMission;
    cancelBridgeTimers();
    set(getInitialMissionState(currentMission));
  },


  // ----------------- SCORM 2004 ACTIONS -----------------
  saveMissionResult: () => {
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

    const result = scorm2004.saveResult({
      missionId: activeMission.mission.id,
      scoreRaw: score,
      passingScore: activeMission.mission.passingScore ?? DEFAULT_PASSING_SCORE,
      sessionSeconds,
      interactions,
      suspendData
    });

    set({
      isScormSubmitted: result.success,
      scormSubmitMessage: result.message
    });

    return result;
  },

  submitScormAndExit: () => {
    sounds.playSuccess();
    // Zapis jeszcze raz: misja bez ocenianych decyzji nie ma autozapisu, a wynik
    // mógł się zmienić po powtórce zadania.
    const result = get().saveMissionResult();
    if (result.success) scorm2004.terminate();
    set({ isExitModalOpen: true });
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

// ----------------- ROZMOWA PRZY OTWARCIU APLIKACJI -----------------
// `StageDefinition.openingConversation`: gra raz na rozgrywkę, przy pierwszym otwarciu
// aplikacji etapu, tym samym mechanizmem co mostek (`pendingBridge` z flagą `opening`).
// Gdy akurat trwa mostek albo przeskok czasu, rozmowa trafia do kolejki i gra po jego końcu.

function startOpeningConversation(stageId: string) {
  const stage = (useMissionStore.getState().activeMission.stages || []).find((st) => st.id === stageId);
  if (!stage?.openingConversation) return;
  useMissionStore.setState({
    chatAvailableChoices: [],
    pendingBridge: { beats: stage.openingConversation, index: 0, unlock: {}, opening: true }
  });
  useMissionStore.getState().advanceBridge();
}

/** Woływane po otwarciu aplikacji: pierwsza rozmowa etapu startuje od razu albo staje w kolejce. */
function requestOpeningConversation(appId: string) {
  const state = useMissionStore.getState();
  const stage = (state.activeMission.stages || []).find(
    (st) => st.appId === appId && st.openingConversation && st.openingConversation.length > 0
  );
  if (!stage) return;
  if (state.playedOpenings.includes(stage.id) || state.completedStages.includes(stage.id)) return;
  useMissionStore.setState({ playedOpenings: [...state.playedOpenings, stage.id] });
  if (state.pendingBridge || state.timeJump) {
    useMissionStore.setState((s) => ({ queuedOpenings: [...s.queuedOpenings, stage.id] }));
    return;
  }
  startOpeningConversation(stage.id);
}

/** Woływane na końcu każdej rozmowy: gra rozmowę przy otwarciu, która czekała w kolejce. */
function playQueuedOpening() {
  const { queuedOpenings, pendingBridge, completedStages } = useMissionStore.getState();
  if (pendingBridge || queuedOpenings.length === 0) return;
  const [next, ...rest] = queuedOpenings;
  useMissionStore.setState({ queuedOpenings: rest });
  // Etap zaliczony w międzyczasie — rozmowa straciła sens.
  if (completedStages.includes(next)) {
    playQueuedOpening();
    return;
  }
  startOpeningConversation(next);
}
