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
    employeesCount: number;
    whitelistedIps: string[];
    sampleRecipients: Array<{ name: string; email: string; role: string }>;
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

export interface PhishingDispatchConfig {
  sender: {
    decisionNum: number;
    question: string;
    options: ChoiceOption[];
  };
  targetDomain: string;
  surveyTitle: string;
}

export interface BotnetMonitorConfig {
  targetCompany: string;
  targetPercentage: number;
  totalWorkstations: number;
}
