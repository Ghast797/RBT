import type { BeatCondition, ChoiceOption } from '../../../engine/types/mission';

export interface PhishingCampaignConfig {
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
  /**
   * Warianty treści kluczowane etykietą wybranej opcji (jak w `PlayerChoiceRecord.answer`).
   * `deadline` (opcjonalny) to zdanie o terminie/presji; tylko temat, którego feedback tej presji wymaga, je ma.
   */
  topics: Array<{ label: string; body: string; slug: string; deadline?: string }>;
  templates: Array<{ label: string; serviceName: string; domainHost: string }>;
  /** Podpis w mailu zależny od wybranego nadawcy (klucz: id opcji nadawcy). */
  signoffs: Record<string, string>;
}

/**
 * Konsekwencja wcześniejszego wyboru widoczna na monitorze (bez zmiany punktów — punkty naliczył już wybór).
 * `when` to zwykły warunek decyzji (jak `when` beatu); wszystkie pasujące konsekwencje się sumują.
 */
export interface BotnetConsequence {
  when: BeatCondition;
  /** Zmiana penetracji sieci w punktach procentowych (ujemna = mniej zainfekowanych stacji). */
  penetrationDelta?: number;
  /** Liczba alarmów IDS dopisanych przez ten wybór. */
  alarms?: number;
  /** Tekst pokazany pod licznikiem alarmów (np. „FILTR POCZTY OZNACZYŁ NADAWCĘ JAKO PODEJRZANEGO”). */
  alarmText?: string;
  /** Wyjaśnienie spadku penetracji pod licznikiem (np. „CZĘŚĆ PRACOWNIKÓW NIE KLIKNĘŁA…”); pokazywane tylko, gdy konsekwencja pasuje. */
  note?: string;
}

export interface BotnetMonitorConfig {
  targetCompany: string;
  targetPercentage: number;
  totalWorkstations: number;
  consequences: BotnetConsequence[];
}
