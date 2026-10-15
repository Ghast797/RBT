// Universal SCORM Scenario Engine Types (HACKERS.OS)

export interface MissionMeta {
  id: string; // e.g. "mission-3-ol-company"
  title: string; // e.g. "MISJA 3 – O&L COMPANY"
  subTitle: string; // e.g. "Infiltracja socjotechniczna"
  systemOs?: string; // e.g. "//HACKERS.OS"
  date?: string; // e.g. "19.05.2026"
  accentColor?: string; // e.g. "#00ff66"
  rewardBtc: number; // e.g. 4.02
  maxScore: number; // e.g. 100
  passingScore?: number; // default 70
  /** Liczba ocenianych decyzji; dzieli maxScore na równe części. */
  decisionCount?: number;
  targetCompany: string; // e.g. "O&L Company"
  description?: string;
}

export interface IntroDialogueItem {
  id: string;
  sender: string;
  text: string;
  playerResponse: string;
}

export interface MissionIntro {
  callerName: string; // e.g. "BYTE_MASTER"
  callStatus: string; // e.g. "POŁĄCZENIE PRZYCHODZĄCE"
  dialogue: IntroDialogueItem[];
  biosLines: string[];
}

export type LucideIconName = 
  | 'Terminal'
  | 'MessageSquareCode'
  | 'Globe'
  | 'HardDrive'
  | 'Crosshair'
  | 'Radio'
  | 'Award'
  | 'Mail'
  | 'ShieldAlert'
  | 'Bug'
  | 'Lock'
  | 'Cpu'
  | 'FileArchive'
  | 'Send'
  | 'Wifi'
  | 'Server'
  | 'Key';

export interface DesktopAppConfig {
  id: string; // Window ID, e.g. "virus_database", "pendrive_app"
  label: string; // e.g. "//BAZA_WIRUSÓW"
  color: string; // hex color e.g. "#ec4899"
  icon: LucideIconName;
  componentId: string; // mapped in appRegistry, e.g. "virus_database", "drone_app"
  badge?: number;
  unlockedOnly?: boolean;
  requiredUnlockId?: string; // unlocked when this ID is present in unlockedIcons
  isChatFocus?: boolean;
  minStep?: number;
}

export type ChoiceOutcome = 'ideal' | 'suboptimal' | 'critical';

export interface PlayerChoiceRecord {
  num: number;
  question: string;
  answer: string;
  isCorrect: boolean;
  details: string;
  outcome?: ChoiceOutcome;
  btcPenalty?: number;
}

export interface DebriefSummaryConfig {
  title: string;
  subtitle: string;
  company: string;
  scorePercent: number;
  perfectChoices: number;
  goodChoices: number;
  criticalErrors: number;
  btcReward: number;
}

export interface DebriefChoiceItem {
  num: number;
  question: string;
  answer: string;
  correct: boolean;
  details: string;
  outcome?: ChoiceOutcome;
  btcPenalty?: number;
}

export interface EducationalSlide {
  title: string;
  desc: string;
}

export interface DebriefData {
  summary: DebriefSummaryConfig;
  choices: DebriefChoiceItem[];
  educationalSlides: EducationalSlide[];
}

// Step / Phase abstractions
export type StepType = 
  | 'dialogue'
  | 'virus_builder'
  | 'osint_browser'
  | 'payload_config'
  | 'delivery_interaction'
  | 'takeover_session'
  | 'debriefing'
  | 'custom';

export interface MissionStep {
  id: string;
  stepNumber: number;
  type: StepType;
  title: string;
  description?: string;
  [key: string]: any;
}

export interface ScenarioTransitionMessage {
  text: string;
  actionButton?: {
    type: 'link_browser' | 'download_attachments' | 'view_car_photo';
    label: string;
    payload?: string;
  };
  imageSrc?: string;
}

export interface ScenarioTransitionChoice {
  id: string;
  label: string;
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

export interface ScenarioTransition {
  id: string;
  unlockIcons?: string[];
  badges?: Record<string, number>;
  closeActiveApp?: boolean;
  timeJump?: string;
  byteMasterMessages?: ScenarioTransitionMessage[];
  nextChatChoices?: ScenarioTransitionChoice[];
}

// ---------------------------------------------------------------------------
// KONTRAKT KLOCKA / MINIGRY (docs/scenario-engine.md, sekcja 5)
// ---------------------------------------------------------------------------

/**
 * Co klocek lub minigra zgłasza silnikowi po ocenianej decyzji.
 * Element NIE podaje punktów ani kary BTC — wylicza je silnik z `tier`.
 */
export interface DecisionReport {
  /** Numer decyzji w misji (1..N), zgodny z tabelą debriefu. */
  num: number;
  /** Pytanie pokazane graczowi na ekranie. */
  question: string;
  /** Odpowiedź wybrana przez gracza (etykieta opcji). */
  answer: string;
  /** Poziom decyzji — jedyne, co decyduje o punktacji. */
  tier: ChoiceOutcome;
  /** Zdanie wyjaśnienia do raportu pooperacyjnego. */
  feedback: string;
}

/** Props, które silnik podaje każdemu klockowi i każdej minigrze. */
export interface BlockProps<TConfig = unknown> {
  /** Dane z definicji misji (opcje, teksty, parametry). */
  config: TConfig;
  /** Zgłoszenie ocenianej decyzji. */
  onDecision: (report: DecisionReport) => void;
  /** Zgłoszenie ukończenia etapu (również po ostatniej decyzji). */
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// KONFIGURACJE KLOCKÓW Z KATALOGU (docs/scenario-engine.md, sekcja 6)
// ---------------------------------------------------------------------------

export interface ChoiceOption {
  id: string;
  /** Etykieta opcji — dosłownie tak, jak widzi ją gracz. */
  label: string;
  /** Opis pod etykietą (opcjonalny). */
  desc?: string;
  tier: ChoiceOutcome;
  feedback: string;
  /** Dodatkowe znaczniki wyświetlane na karcie. */
  tags?: string[];
}

/** Wybór 1 z N kart. */
export interface ChoiceCardsConfig {
  /** Numer decyzji w misji. */
  decisionNum: number;
  /** Pytanie na ekranie. */
  question: string;
  /** Krótki tekst pod nagłówkiem aplikacji. */
  subtitle?: string;
  options: ChoiceOption[];
}

export interface DialogueNode {
  id: string;
  /** Wiadomość rozmówcy otwierająca węzeł. */
  incoming: string;
  /** Opcje odpowiedzi gracza. Pusty = węzeł tylko narracyjny. */
  options: Array<ChoiceOption & { nextNode?: string }>;
  /** Numer decyzji, gdy węzeł jest oceniany. */
  decisionNum?: number;
  /** Pytanie do debriefu dla tego węzła. */
  question?: string;
}

/** Rozmowa z rozmówcą innym niż BYTE_MASTER (np. przedstawiciel firmy). */
export interface DialogueTreeConfig {
  /** Nazwa rozmówcy w nagłówku okna. */
  respondent: string;
  nodes: DialogueNode[];
  /** Wiadomość zamykająca rozmowę po ostatnim węźle. */
  closingMessage?: string;
  /**
   * Tryb agregujący: cała rozmowa to JEDNA oceniana decyzja o tym numerze.
   * Poziom = najgorszy wybór na ścieżce (critical > suboptimal > ideal).
   * Błąd krytyczny w dowolnej turze przerywa rozmowę natychmiast.
   * Gdy pominięty, każdy węzeł z własnym `decisionNum` jest oceniany osobno.
   */
  decisionNum?: number;
  /** Pytanie do debriefu w trybie agregującym. */
  question?: string;
}

// ---------------------------------------------------------------------------
// ETAPY MISJI (docs/scenario-engine.md, sekcja 1)
// ---------------------------------------------------------------------------

/** Co dzieje się po ukończeniu etapu: odblokowania, powiadomienia, wiadomość mentora. */
export interface StageCompletion {
  /** Identyfikatory do dopisania do `unlockedIcons`. */
  unlockIcons?: string[];
  /** Powiadomienia `[1]` na kafelkach. */
  badges?: Record<string, number>;
  /** Czy zamknąć otwarte okno i wrócić na pulpit. */
  closeActiveApp?: boolean;
  /** Wiadomość BYTE_MASTERA mostkująca do kolejnego etapu. */
  byteMasterMessage?: string;
  /** Opcja odpowiedzi gracza otwierająca kolejny etap. */
  nextChoice?: {
    id: string;
    label: string;
    openAppId?: string;
  };
  /** Dźwięk towarzyszący wiadomości. */
  sound?: 'notification' | 'alarm' | 'success';
}

export interface StageDefinition {
  id: string;
  /** Kafelek pulpitu, w którym rozgrywa się etap. */
  appId: string;
  /** Numery decyzji ocenianych w tym etapie. */
  decisions?: number[];
  completion: StageCompletion;
}

// Full Mission Definition
export interface MissionDefinition {
  mission: MissionMeta;
  intro: MissionIntro;
  desktopApps: DesktopAppConfig[];
  /** Przebieg misji jako lista etapów (zastępuje zaszytą w kodzie fabułę). */
  stages?: StageDefinition[];
  /** Dane klocków i minigier, kluczowane identyfikatorem kafelka. */
  blocks?: Record<string, unknown>;
  transitions?: Record<string, ScenarioTransition>;
  steps?: MissionStep[];
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6: DebriefData;
  [key: string]: any;
}

