import type { ChoiceOption } from '../../../engine/types/mission';

export interface PhishingCampaignConfig {
  action: {
    decisionNum: number;
    question: string;
    options: ChoiceOption[];
  };
  template: {
    decisionNum: number;
    question: string;
    options: ChoiceOption[];
  };
  topic: {
    decisionNum: number;
    question: string;
    options: ChoiceOption[];
  };
  mailingList: {
    targetDomain: string;
    whitelistedIps: string[];
    /** Cała lista mailingowa (długość = liczba adresatów). */
    recipients: Array<{ name: string; email: string; role: string }>;
  };
}

export interface VpnConfig {
  initialIp: string;
  targetIp: string;
  allowedIps: string[];
  feedback: {
    ideal: string;
    critical: string;
  };
}

export interface WormBuilderConfig {
  virus: {
    decisionNum: number;
    question: string;
    options: ChoiceOption[];
  };
  instructions: Array<{
    id: string;
    code: string;
    desc: string;
  }>;
}

/** Wariant treści maila zależny od wcześniejszych wyborów gracza (temat, szablon, nadawca). */
export interface PhishingDispatchConfig {
  sender: {
    decisionNum: number;
    question: string;
    options: ChoiceOption[];
  };
  /** Domena firmy-celu i adresy e-mail odbiorców z listy mailingowej (liczba = długość listy). */
  targetDomain: string;
  recipients: string[];
  /** Numery decyzji z poprzedniego etapu, z których czytamy wybór (temat, szablon). */
  topicDecisionNum: number;
  templateDecisionNum: number;
  /** Warianty treści kluczowane etykietą wybranej opcji (jak w `PlayerChoiceRecord.answer`). */
  topics: Array<{ label: string; body: string; slug: string }>;
  templates: Array<{ label: string; serviceName: string; domainHost: string }>;
  /** Podpis w mailu zależny od wybranego nadawcy (klucz: id opcji nadawcy). */
  signoffs: Record<string, string>;
}

export interface BotnetMonitorConfig {
  targetCompany: string;
  targetPercentage: number;
  totalWorkstations: number;
}
