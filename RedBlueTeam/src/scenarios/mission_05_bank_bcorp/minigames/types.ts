// Typy konfiguracji minigier Misji 5 (Bank Bcorp) — wzorzec B.
//
// Dane (opcje, poziomy, feedback, teksty ekranów) mieszkają w stages.ts, nie w kodzie minigry.
// Minigra czyta config przez kontrakt silnika (BlockProps) i zgłasza decyzje przez onDecision
// (buildReport / submitDecision z engine/core/report); punkty liczy silnik.

import type { ChoiceOption } from '../../../engine/types/mission';
import type { ReportableOption } from '../../../engine/core/report';

export type { ReportableOption };

// ---------------------------------------------------------------------------
// WSPÓLNE
// ---------------------------------------------------------------------------

/** Grupy grafik misji (`src/scenarios/mission_05_bank_bcorp/assets/<grupa>/`). */
export type AssetGroup = 'intel' | 'site';

/**
 * Odwołanie do grafiki: `name` to nazwa pliku bez rozszerzenia w `assets/<group>/`.
 * Brak pliku = zastępnik (`ImageSlot` w `ui.tsx`).
 */
export interface AssetRef {
  group: AssetGroup;
  name: string;
}

// ---------------------------------------------------------------------------
// Etap 1: bc_intel_pdf (//FILIP_WOJCIK_BIALY_WYWIAD.PDF)
// ---------------------------------------------------------------------------

export interface IntelPdfConfig {
  /** Tytuł aplikacji w nagłówku (`//FILIP_WOJCIK_BIALY_WYWIAD.PDF`). */
  title: string;
  /** Polecenie ZADANIE w pasku nagłówka. */
  task: string;
  /** Podtytuł nagłówka (opcjonalny kontekst aplikacji). */
  subtitle?: string;
  /** Nazwa wyświetlanego pliku PDF. */
  fileName: string;
  /** Wyróżniony komunikat nad punktami OSINT (`WAŻNE INFORMACJE — ...`). */
  notice: string;
  /** Cztery punkty z białego wywiadu. */
  points: string[];
  /** Opcjonalny portret celu (`{ group: 'intel', name: 'filip_wojcik' }`). */
  portraitAsset?: AssetRef;
  /** Opis dostępności / podpis zastępnika dla portretu. */
  portraitLabel?: string;
  /** Etykieta przycisku zamykającego dokument (`ZAMKNIJ DOKUMENT`). */
  confirmLabel: string;
}

// ---------------------------------------------------------------------------
// Etap 4: bc_page_cloner (//PRZYGOTOWANIE_STRONY)
// ---------------------------------------------------------------------------

export type PageClonerElementId = 'logo' | 'login' | 'password' | 'submit';

export interface PageClonerElement {
  id: PageClonerElementId;
  label: string;
  slotLabel: string;
}

export interface PageClonerConfig {
  /** Tytuł aplikacji w nagłówku (`//PRZYGOTOWANIE_STRONY`). */
  title: string;
  /** Polecenie ZADANIE na starcie. */
  task: string;
  /** Podtytuł nagłówka (opcjonalny kontekst aplikacji). */
  subtitle?: string;
  /** Pasek adresu oryginalnej strony (`//MAIL.BCORP.BIZ/LOGIN`). */
  originalUrl: string;
  /** Pasek adresu fałszywej strony przy idealnym D1 (`//MAIL.ARCHIWUMBCORP.BIZ/LOGIN`). */
  fakeUrlIdeal: string;
  /** Pasek adresu fałszywej strony przy suboptymalnym D1 (`BCORP.PL` -> `//MAIL.BCORP.PL/LOGIN`). */
  fakeUrlSuboptimal: string;
  /** Spójna stopka obu paneli (`BCORP BANK © 2024`). */
  footerText: string;
  /** Nazwa systemu w nagłówku strony (`BCORP SYSTEM POCZTY`). */
  brandTitle: string;
  /** Logo Banku Bcorp (`{ group: 'site', name: 'bcorp_logo' }`). */
  logoAsset: AssetRef;
  /** Cztery elementy UI przenoszone z oryginalnej strony na szkielet fałszywej strony. */
  elements: PageClonerElement[];
}

// ---------------------------------------------------------------------------
// Etap 6: bc_vishing_call (//ROZMOWA — faza 1 vishing D3–D10 + faza 2 AiTM)
// ---------------------------------------------------------------------------

export interface VishingTurnOption extends ChoiceOption {
  /** Opcjonalna odpowiedź w raporcie (jeśli inna niż `label`). */
  reportAnswer?: string;
  /** Reakcja Filipa Wójcika po wybraniu tej opcji. */
  reaction?: string;
}

export interface VishingLinkStep {
  /** Etykieta przycisku wysłania linku (`LINK`). */
  buttonLabel: string;
  /** Reakcja Filipa, gdy D1 = `ARCHIWUMBCORP.BIZ` (ideał). */
  calleeReactionIdeal: string;
  /** Reakcja Filipa, gdy D1 = `BCORP.PL` (skutek odroczony). */
  calleeReactionSuboptimal: string;
}

export interface VishingTurn {
  id?: string;
  decisionNum: number;
  question: string;
  /** Prompt rozmówcy (jeśli nie wynika bezpośrednio z poprzedniej tury). */
  prompt?: string;
  options: VishingTurnOption[];
  /** Kwestia gracza wstawiana po tej decyzji (np. po D5). */
  afterPlayerLine?: string;
  /** Odpowiedź Filipa po kwestii gracza (np. po D5). */
  afterCalleeLine?: string;
  /** Wysłanie linku do fałszywej strony (po D9). */
  linkStep?: VishingLinkStep;
}

export interface VishingPhase2DialogueStep {
  id: string;
  calleeLine: string;
  playerLine: string;
  calleeAfter?: string;
}

export interface VishingClosingDialogueItem {
  speaker: 'callee' | 'player';
  text: string;
}

export interface VishingReportItem {
  id: string;
  title: string;
  year?: string;
}

export interface VishingPhase2Config {
  originalUrl: string;
  fakeUrlIdeal: string;
  fakeUrlSuboptimal: string;
  footerText: string;
  brandTitle: string;
  logoAsset: AssetRef;
  capturedLogin: string;
  capturedPasswordMasked: string;
  capturedSmsCode: string;
  twoFaPrompt: string;
  dialogueSteps: VishingPhase2DialogueStep[];
  closingDialogue: VishingClosingDialogueItem[];
  reports: VishingReportItem[];
  completionMessage: string;
}

export interface VishingCallConfig {
  title: string;
  subtitle?: string;
  taskPhase1: string;
  taskPhase2: string;
  readyScreen: {
    title?: string;
    message: string;
    buttonLabel: string;
  };
  osintNotesTitle: string;
  osintNotes: string[];
  calleeName: string;
  openingLine: string;
  turns: VishingTurn[];
  phase2: VishingPhase2Config;
}
