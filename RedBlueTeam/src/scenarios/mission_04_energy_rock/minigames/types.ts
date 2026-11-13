// Typy konfiguracji minigier Misji 4 (Energy Rock) — wzorzec B.
//
// Dane (opcje, poziomy, feedback, teksty ekranów) mieszkają w stages.ts, nie w kodzie minigry.
// Minigra czyta config przez kontrakt silnika (BlockProps) i zgłasza decyzje przez onDecision
// (buildReport z engine/core/report); punkty liczy silnik. Kontrakt dla agentów C–G: docs/rebuild-plan.md, sekcja 9.

import type {
  ChoiceOutcome,
  DialogueTreeConfig,
  MatrixVariant as EngineMatrixVariant,
  ScratchMatrixConfig
} from '../../../engine/types/mission';
import type { ReportableOption } from '../../../engine/core/report';

export type { ReportableOption };
export type { MatrixPart } from '../../../engine/types/mission';

// ---------------------------------------------------------------------------
// WSPÓLNE
// ---------------------------------------------------------------------------

/** Oceniana decyzja 1 z N (numer + pytanie to jedno źródło dla ekranu i raportu). */
export interface GradedDecision<O extends ReportableOption = ReportableOption> {
  decisionNum: number;
  question: string;
  options: O[];
}

/** Grupy grafik misji (`src/scenarios/mission_04_energy_rock/assets/<grupa>/`). */
export type AssetGroup = 'virus';

/** Odwołanie do grafiki: `name` to nazwa pliku bez rozszerzenia w `assets/<group>/`. Brak pliku = zastępnik (`ImageSlot`). */
export interface AssetRef {
  group: AssetGroup;
  name: string;
}

/** Klucz `customState` ze stanem komunikatu okupu (zapisuje //KREATOR po D3 i D4, czyta //CZAT_Z_OFIARĄ). */
export const M4_NOTE_KEY = 'm4_note';
/** Klucz `customState` z wyborem tematu i treści maila (zapisuje //MAIL po D6). */
export const M4_MAIL_KEY = 'm4_mail';

/** Wartość w `customState[M4_NOTE_KEY]`: id wybranych opcji (tytuł, czas, kolor). */
export interface M4NoteState {
  titleId: string;
  timeId: string;
  colorId: string;
}

/** Wartość w `customState[M4_MAIL_KEY]`: id wybranych opcji (temat, treść). */
export interface M4MailState {
  subjectId: string;
  bodyId: string;
}

// ---------------------------------------------------------------------------
// Etap 1: er_virus_lab (D1 + zdrapka)
// ---------------------------------------------------------------------------

export interface VirusOption extends ReportableOption {
  /** Grafika karty. */
  image: AssetRef;
  imageAlt: string;
}

export type MatrixVariant = EngineMatrixVariant<AssetRef>;

export interface VirusMatrixConfig extends ScratchMatrixConfig<AssetRef> {
  /** Przedrostek podtytułu z nazwą składanego programu. */
  programPrefix: string;
  /** Napis na ekranie ładowania przed zdrapką. */
  loaderText: string;
  /** Polecenie ZADANIE na ekranie zdrapki. */
  task: string;
}

export interface VirusLabConfig {
  title: string;
  subtitle: string;
  steps: string[];
  /** Nagłówek ekranu wyboru (np. „BAZA WIRUSÓW - WYBIERZ ODPOWIEDNIEGO WIRUSA”). */
  heading: string;
  virus: GradedDecision<VirusOption>;
  virusTexts: { task: string; confirmLabel: string };
  matrix: VirusMatrixConfig;
}

// ---------------------------------------------------------------------------
// Etap 2: er_ransom_builder (D2 hasło, D3 komunikat, D4 kolor)
// ---------------------------------------------------------------------------

export interface PasswordTile {
  id: string;
  label: string;
  /** Zestaw znaków do podglądu hasła (puste dla kafelków zakazanych: używa się ich tylko do oceny). */
  charset: string;
  /** Kafelek niedozwolony (spacje, znaki narodowe): w ramce => critical. */
  forbidden: boolean;
}

export interface PasswordConfig {
  decisionNum: number;
  question: string;
  task: string;
  heading: string;
  lengthLabel: string;
  frameLabel: string;
  previewLabel: string;
  confirmLabel: string;
  resultLabel: string;
  minLength: number;
  maxLength: number;
  defaultLength: number;
  /** Długość uznawana za critical (słaba) i długość/zestawy dla ideal. */
  criticalLength: number;
  idealLength: number;
  idealSets: number;
  tiles: PasswordTile[];
  /** Komunikat pod wynikiem „SIŁA HASŁA: x/5”, wg siły 1..5. */
  strengthMessages: Record<number, string>;
  /** Odpowiedź w raporcie: ideal oraz szablon dla pozostałych (`{score}`, `{length}`, `{sets}`). */
  answers: { ideal: string; other: string };
  feedback: Record<ChoiceOutcome, string>;
  /**
   * B2 dla wyliczanej oceny hasła: zwraca kwestię mentora, gdy tak skonfigurowane hasło ma zostać odrzucone
   * (zamiast `critical`), albo `undefined`, gdy ocena idzie normalną drogą. Mentor odrzuca konfigurację
   * (długość + zestawy), kara za próbę wg `ev.tier`; decyzja zostaje otwarta.
   */
  rejectLine?: (ev: { score: number; tier: ChoiceOutcome; sets: number; length: number; hasForbidden: boolean }) => string | undefined;
}

export type NoteSlotId = 'icon' | 'title' | 'time' | 'amount' | 'address' | 'contact';

export interface NoteTile {
  id: string;
  slot: NoteSlotId;
  label: string;
  /** Tylko kafelki zmienne (tytuł, czas) mają poziom, feedback i część odpowiedzi do raportu. */
  tier?: ChoiceOutcome;
  feedback?: string;
  /** Fragment odpowiedzi w raporcie (np. `OSTRZEŻENIE`, `LIMIT 30 H`). */
  reportPart?: string;
  /** B2: mentor odrzuca ten kafelek (tytuł/czas) zamiast palić operację: kara za próbę, kafelek się blokuje. */
  reject?: { mentorLine: string };
}

export interface NoteConfig {
  decisionNum: number;
  question: string;
  task: string;
  confirmLabel: string;
  slots: Array<{ id: NoteSlotId; label: string }>;
  tiles: NoteTile[];
  /** Łącznik części odpowiedzi w raporcie (`OSTRZEŻENIE + LIMIT 30 H`). */
  answerJoiner: string;
  /** Feedback, gdy oba sloty zmienne są ideal. */
  idealFeedback: string;
}

export interface ColorOption extends ReportableOption {
  /** Kolor podglądu okna (hex). */
  swatch: string;
}

export interface ColorConfig extends GradedDecision<ColorOption> {
  task: string;
  confirmLabel: string;
}

export interface BuilderConfig {
  title: string;
  subtitle: string;
  steps: string[];
  password: PasswordConfig;
  note: NoteConfig;
  color: ColorConfig;
  loaders: { note: string; color: string; compile: string };
  doneMessage: string;
}

// ---------------------------------------------------------------------------
// Etap 3: er_phishing_mail (D5 temat, D6 treść, uzbrojenie załącznika)
// ---------------------------------------------------------------------------

export interface MailConfig {
  title: string;
  subtitle: string;
  steps: string[];
  recipient: string;
  positionLabel: string;
  position: string;
  attachment: string;
  /** Element do przeciągnięcia na załącznik. */
  payloadLabel: string;
  subject: GradedDecision & { fieldLabel: string; task: string };
  body: GradedDecision & { fieldLabel: string; task: string };
  confirmLabel: string;
  loaders: { body: string; arm: string };
  arm: { task: string; arming: string; armed: string; nextLabel: string };
}

// ---------------------------------------------------------------------------
// Etap 5: er_ransom_c2 (start, szyfrowanie sieci, D8 eksfiltracja)
// ---------------------------------------------------------------------------

export interface ExfilFile {
  id: string;
  name: string;
  /** `target` = plik Freevolt (3 sztuki), `other` = zmyłka. */
  role: 'target' | 'other';
}

export type NetworkNodeKind = 'vector' | 'workstation' | 'database' | 'main';

export interface NetworkNode {
  id: string;
  label: string;
  kind: NetworkNodeKind;
  /** Pozycja w układzie SVG 0–100. */
  x: number;
  y: number;
}

export interface C2Config {
  title: string;
  subtitle: string;
  steps: string[];
  start: {
    /** ZADANIE ekranu startowego. */
    task: string;
    status: string;
    hostLabel: string;
    host: string;
    ipLabel: string;
    ip: string;
    button: string;
    loader: string;
  };
  encrypt: { task: string; nodes: NetworkNode[]; doneMessage: string; nextLabel: string };
  exfil: {
    decisionNum: number;
    question: string;
    task: string;
    fieldLabel: string;
    confirmLabel: string;
    loader: string;
    requiredTargets: number;
    files: ExfilFile[];
    answers: { ideal: string };
    feedback: Record<ChoiceOutcome, string>;
  };
}

// ---------------------------------------------------------------------------
// Etap 6: er_victim_chat (D9, D10 przez DialogueTree per-węzeł)
// ---------------------------------------------------------------------------

export interface RansomPreviewConfig {
  heading: string;
  amountLabel: string;
  amount: string;
  address: string;
  contact: string;
  /** Teksty tytułu i czasu wg id kafelków (z `BuilderConfig.note`) oraz kolory wg id opcji (z `BuilderConfig.color`). */
  titles: Record<string, string>;
  times: Record<string, string>;
  colors: Record<string, string>;
  /** Stan zapasowy, gdy brak `customState[M4_NOTE_KEY]` (tryb deweloperski). */
  fallback: M4NoteState;
}

export interface VictimChatConfig {
  title: string;
  subtitle: string;
  /** Rozmowa (węzły z `decisionNum` D9 i D10, węzeł 3 bez oceny). */
  dialogue: DialogueTreeConfig;
  /** id opcji -> odpowiedź w raporcie (gdy inna niż etykieta); `VictimChatApp` podmienia `answer` w `onDecision`. */
  reportAnswers: Record<string, string>;
  preview: RansomPreviewConfig;
}
