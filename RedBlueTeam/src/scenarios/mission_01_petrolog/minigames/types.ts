import type { ChoiceOption } from '../../../engine/types/mission';

export interface BriefingFact {
  id: string;
  title: string;
  explanation: string;
}

export type AssessmentType = 'vulnerable' | 'protected';

export interface InvestigationPlace {
  id: string;
  name: string;
  iconName?: 'building' | 'server' | 'users' | 'calculator' | string;
  observations: string;
  correctAssessment: AssessmentType;
  clue: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface AttackVectorDecision {
  id: string;
  iconName?: 'server' | 'building' | 'mail' | string;
  title: string;
  description: string;
  isCorrect: boolean;
  relatedClueId?: string;
  feedback: string;
}

export interface TargetPetrologConfig {
  companyName?: string;
  targetObjective?: string;
  briefing?: {
    title?: string;
    instruction?: string;
    facts: BriefingFact[];
  };
  investigation?: {
    title?: string;
    instruction?: string;
    places: InvestigationPlace[];
  };
  decision?: {
    title?: string;
    instruction?: string;
    question: string;
    options: AttackVectorDecision[];
  };
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarText: string;
  isPublic: boolean;
  privacyNotice?: string;
  /** Komunikat po zatwierdzeniu trafnego wyboru (profil publiczny). */
  selectionNotice?: string;
  tags: string[];
}

export interface OsintSearchConfig {
  suggestedQuery: string;
  searchPlaceholder: string;
  profiles: EmployeeProfile[];
}

export interface SocialFact {
  id: string;
  text: string;
  category: string;
}

export interface DeductionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

export interface SocialPost {
  id: string;
  platform: 'kneenook' | 'quickgram' | 'joinin';
  author: string;
  handle: string;
  timestamp: string;
  content: string;
  tags?: string[];
  fact?: SocialFact;
  distractorNotice?: string;
  deductionOptions?: DeductionOption[];
}

export interface SocialPlatformInfo {
  id: 'kneenook' | 'quickgram' | 'joinin';
  name: string;
  handlePrefix: string;
  accentColor: string;
  tagline: string;
}

export interface SocialIntelConfig {
  target: {
    name: string;
    role: string;
    company: string;
    requiredFacts: number;
    requiredPrecision?: number;
  };
  platforms: SocialPlatformInfo[];
  posts: SocialPost[];
}

export interface PhishingStepChoice {
  decisionNum: number;
  question: string;
  subtitle?: string;
  options: ChoiceOption[];
}

export interface PhishingBuilderConfig {
  domain: PhishingStepChoice;
  payload: PhishingStepChoice;
  payloadByDomain?: Record<string, PhishingStepChoice>;
  injection: {
    instruction: string;
    targetDomain: string;
    payloadModuleLabel: string;
    downloadButtonText: string;
  };
  senderName?: PhishingStepChoice;
  /** Adresy D4 domyślne (zestaw nadawcy z D3 = ideał). */
  senderEmail?: PhishingStepChoice;
  /** Adresy D4 zależne od nadawcy wybranego w D3 (klucz = id opcji D3). */
  senderEmailBySender?: Record<string, PhishingStepChoice>;
}

/** Teksty maila i strony-pułapki zależne od pliku-przynęty wybranego w D2 (klucz = id opcji D2). */
export interface PayloadTexts {
  /** Zdanie o przynęcie w mailu, np. „Mają super poradnik…!”. */
  mailText: string;
  /** Plakietka nad nagłówkiem strony ofiary. */
  pageBadge: string;
  /** Kolor odznaki strony: portal biegowy zielony, serwis kulinarny fioletowy. */
  pageBadgeTone?: 'emerald' | 'violet';
  /** Opis pod nagłówkiem (nagłówkiem jest nazwa pliku z D2). */
  pageDescription: string;
  /** Napis na przycisku pobierania. */
  downloadButton: string;
  /** Stopka kroku „strona”: co Anita pobiera. */
  footer: string;
}

export interface EmailSenderConfig {
  senderName: PhishingStepChoice;
  senderEmail: PhishingStepChoice;
  /** Adresy D4 zależne od nadawcy z D3 (klucz = id opcji D3); brak klucza = `senderEmail`. */
  senderEmailBySender?: Record<string, PhishingStepChoice>;
  /** Teksty maila wg pliku-przynęty z D2 (klucz = id opcji D2). */
  byPayload?: Record<string, PayloadTexts>;
  defaultDomain?: string;
  defaultPayload?: string;
}

export interface VictimMonitorConfig {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  emailSubject: string;
  targetDomain: string;
  payloadFileName: string;
  /** Id opcji D2 używane, gdy decyzja nie została zgłoszona (podgląd/test). */
  defaultPayloadId: string;
  /** Teksty maila i strony wg pliku-przynęty z D2 (klucz = id opcji D2). */
  byPayload: Record<string, PayloadTexts>;
  /** Reakcja Anity wg nadawcy z D3 (klucz = id opcji D3). */
  bySender: Record<string, { reaction: string }>;
  networkNodes: Array<{
    id: string;
    label: string;
    ip: string;
    role: string;
  }>;
}
