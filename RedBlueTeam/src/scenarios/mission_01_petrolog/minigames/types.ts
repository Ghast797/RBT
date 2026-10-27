import type { ChoiceOption } from '../../../engine/types/mission';

export interface IntelSlide {
  id: string;
  badge: string;
  title: string;
  content: string;
  bullets?: string[];
  buttonLabel: string;
}

export interface DossierTab {
  id: string;
  badge: string;
  tabLabel: string;
  title: string;
  lead: string;
  bulletHeader?: string;
  bullets: string[];
  intelNotes?: string;
}

export interface AttackVectorOption {
  id: string;
  letter: 'A' | 'B' | 'C';
  label: string;
  description: string;
  isCorrect: boolean;
  feedback: string;
}

export interface TargetPetrologConfig {
  companyName: string;
  targetObjective: string;
  classificationNotice?: string;
  tabs?: DossierTab[];
  vectorPrompt?: {
    title: string;
    description: string;
    options: AttackVectorOption[];
  };
  slides?: IntelSlide[];
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarText: string;
  isPublic: boolean;
  privacyNotice?: string;
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
  injection: {
    instruction: string;
    targetDomain: string;
    payloadModuleLabel: string;
    downloadButtonText: string;
  };
  senderName: PhishingStepChoice;
  senderEmail: PhishingStepChoice;
}

export interface VictimMonitorConfig {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  emailSubject: string;
  emailBody: string[];
  targetDomain: string;
  payloadFileName: string;
  networkNodes: Array<{
    id: string;
    label: string;
    ip: string;
    role: string;
  }>;
}
