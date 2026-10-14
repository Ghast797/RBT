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

export interface PlayerChoiceRecord {
  num: number;
  question: string;
  answer: string;
  isCorrect: boolean;
  details: string;
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

// Full Mission Definition
export interface MissionDefinition {
  mission: MissionMeta;
  intro: MissionIntro;
  desktopApps: DesktopAppConfig[];
  steps?: MissionStep[];
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6: DebriefData;
  [key: string]: any;
}
