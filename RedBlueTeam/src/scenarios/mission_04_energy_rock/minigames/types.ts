// Typy konfiguracji minigier Misji 4 (Energy Rock).
//
// Dane (opcje, poziomy, feedback) mieszkają w stages.ts, nie w kodzie minigry.
// Minigra czyta config przez kontrakt silnika (BlockProps) i zgłasza decyzje
// przez onDecision — poziom decyzji wylicza minigra z reguł w configu,
// a punkty liczy silnik (core/scoring.ts). Zob. docs/scenario-engine.md.

import type { ChoiceOutcome } from '../../../engine/types/mission';

/** Opcja wyboru z oceną (1 z N). */
export interface GradedOption {
  id: string;
  label: string;
  desc?: string;
  tags?: string[];
  tier: ChoiceOutcome;
  feedback: string;
}

// --- D1: wybór wirusa (karty + skaner sygnatury) ---------------------------
export interface VirusConfig {
  decisionNum: number;
  question: string;
  /** Liczba komórek matrycy skanera do odkrycia (100% wymagane). */
  scannerCells: number;
  options: GradedOption[];
}

// --- D2/D3/D4: builder ransomware (3 pod-ekrany, 3 decyzje) ----------------
export interface PasswordConfig {
  decisionNum: number;
  question: string;
  /** Docelowa długość dla oceny idealnej. */
  targetLength: number;
  /** Minimalna długość poniżej której wynik jest krytyczny. */
  minSafeLength: number;
  /** Etykiety przełączników (kolejność = kolejność w UI). */
  safeTags: string[];
  forbiddenTags: string[];
  feedback: {
    ideal: string;
    suboptimal: string;
    critical: string;
  };
}

export interface RansomComponentsConfig {
  decisionNum: number;
  question: string;
  titleOptions: GradedOption[];
  countdownOptions: GradedOption[];
  /** Statyczne elementy makiety (kwota, portfel, kontakt). */
  staticParts: {
    amount: string;
    wallet: string;
    contact: string;
  };
}

export interface ColorConfig {
  decisionNum: number;
  question: string;
  options: GradedOption[];
}

export interface BuilderConfig {
  password: PasswordConfig;
  components: RansomComponentsConfig;
  color: ColorConfig;
}

// --- D5/D6: mail phishingowy -----------------------------------------------
export interface MailBodyOption extends GradedOption {
  /** Pełny tekst treści pokazywany na karcie. */
  text: string;
}

export interface MailConfig {
  recipient: string;
  position: string;
  attachment: string;
  subject: {
    decisionNum: number;
    question: string;
    options: GradedOption[];
  };
  body: {
    decisionNum: number;
    question: string;
    options: MailBodyOption[];
  };
}

// --- D7/D8: VPN (IP) + nadawca ---------------------------------------------
export interface VpnConfig {
  vpn: {
    decisionNum: number;
    question: string;
    targetIp: string;
    initialIp: string;
    feedback: {
      ideal: string;
      critical: string;
    };
  };
  sender: {
    decisionNum: number;
    question: string;
    options: GradedOption[];
  };
}

// --- D9: eksfiltracja plików Freevolt --------------------------------------
export interface ExfiltrationFile {
  name: string;
  type: 'freevolt' | 'decoy' | 'honeypot';
  size: string;
}

export interface ExfiltrationConfig {
  decisionNum: number;
  question: string;
  targetHost: string;
  targetIp: string;
  requiredFreevolt: number;
  files: ExfiltrationFile[];
  feedback: {
    ideal: string;
    suboptimal: string;
    criticalHoneypot: string;
    criticalIncomplete: string;
  };
}
