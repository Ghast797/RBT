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

export interface IntroDialogueOption {
  id: string;
  label: string;
  mentorReaction?: string;
}

export interface IntroDialogueItem {
  id: string;
  sender: string;
  text: string;
  playerResponse?: string;
  playerOptions?: IntroDialogueOption[];
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
  | 'Key'
  | 'FolderOpen'
  | 'Search'
  | 'Users'
  | 'Monitor';

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

export interface NegotiationTurn {
  turn: number;
  title: string;
  /** Podpis kwestii rozmówcy w transkrypcie debriefu, np. `SZEF IT` (domyślnie `ROZMÓWCA`). */
  opponentLabel?: string;
  opponent: string;
  player: string;
  psychology: string;
}

/** Próba decyzji odrzucona przez mentora (B2): kara naliczona, decyzja nadal otwarta. */
export interface RejectedAttempt {
  /** `id` odrzuconej opcji — po nim blokujemy karty i wykrywamy powtórne odrzucenie. */
  optionId: string;
  /** Odpowiedź (etykieta opcji), którą mentor odrzucił. */
  answer: string;
  /** Poziom odrzuconej opcji — z niego silnik liczy karę za próbę. */
  tier: ChoiceOutcome;
  /** Kwestia BYTE_MASTERA pokazana graczowi (i zapisana w czacie). */
  mentorLine: string;
  /** Feedback odrzuconej opcji — raport pokazuje go pod linią „odrzucone przez BYTE_MASTERA”. */
  feedback?: string;
}

/** Co silnik pamięta o wyborze gracza w decyzji (pierwsze zgłoszenie wygrywa). */
export interface DecisionChoice {
  optionId?: string;
  answer: string;
  tier: ChoiceOutcome;
}

/**
 * Warunek wyświetlenia beatu rozmowy: beat gra tylko, gdy decyzja `decision` została zgłoszona
 * i pasuje `optionId` (jeśli podano) oraz `tier` (jeśli podano). Brak decyzji = beat pominięty.
 */
export interface BeatCondition {
  decision: number;
  optionId?: string | string[];
  tier?: ChoiceOutcome | ChoiceOutcome[];
}

export interface PlayerChoiceRecord {
  num: number;
  question: string;
  answer: string;
  isCorrect: boolean;
  details: string;
  outcome?: ChoiceOutcome;
  btcPenalty?: number;
  negotiationTranscript?: NegotiationTurn[];
  /** Próby tej decyzji odrzucone przez mentora (B2) przed ostatecznym wyborem — do raportu. */
  rejectedAttempts?: RejectedAttempt[];
  /** Odpowiedzi wybrane w nieocenianych węzłach rozmowy po tej decyzji (np. „CHWILA, NIE TAK SZYBKO…”) — do raportu. */
  followUps?: string[];
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
  negotiationTranscript?: NegotiationTurn[];
  /** Lekcja (red team): jaka to technika i dlaczego zadziałała na ofiarę. */
  attack?: string;
  /** Lekcja (blue team): po czym ofiara mogła rozpoznać atak i co powinna zrobić. */
  defense?: string;
}

export interface EducationalSlide {
  title: string;
  desc: string;
}

export interface DebriefData {
  summary: DebriefSummaryConfig;
  choices: DebriefChoiceItem[];
  /**
   * @deprecated Ogólna baza wiedzy przeszła do kursu Moodle (`docs/moodle-baza-wiedzy.md`
   * w folderze misji). Debrief w grze pokazuje lekcje przy decyzjach (`attack` / `defense`).
   */
  educationalSlides?: EducationalSlide[];
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
  /** `id` wybranej opcji, gdy klocek je zna — silnik zapamiętuje je w `decisionChoices` (treść może za nim podążać). */
  optionId?: string;
  /** Poziom decyzji — jedyne, co decyduje o punktacji. */
  tier: ChoiceOutcome;
  /** Zdanie wyjaśnienia do raportu pooperacyjnego. */
  feedback: string;
  /** Tytuł modala porażki (tylko `critical`); domyślnie „ZOSTAŁEŚ WYKRYTY!”. */
  failTitle?: string;
  /** Wyjaśnienie w modalu porażki (tylko `critical`); domyślnie `feedback`. */
  failText?: string;
}

/**
 * Odrzucenie wyboru przez mentora (B2): wybór jest zły, ale nikt nas nie wykrył.
 * Silnik nalicza karę wg `tier`, NIE zamyka decyzji i dopisuje `mentorLine` do czatu.
 */
export interface DecisionRejection {
  num: number;
  question: string;
  /** `id` odrzuconej opcji. */
  optionId: string;
  /** Odpowiedź (etykieta albo `reportAnswer`) odrzucona przez mentora — do raportu. */
  answer: string;
  tier: ChoiceOutcome;
  mentorLine: string;
  /** Feedback odrzuconej opcji (do raportu). */
  feedback?: string;
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
  /**
   * Tytuł modala porażki dla `tier: 'critical'` (np. „TRANSAKCJA ODRZUCONA”).
   * Domyślnie „ZOSTAŁEŚ WYKRYTY!”. Używaj, gdy gracz nie został wykryty, a operacja po prostu się nie udała.
   */
  failTitle?: string;
  /** Wyjaśnienie w modalu porażki zamiast `feedback` (gdy `feedback` jest za długi lub pisany do raportu). */
  failText?: string;
  /**
   * B2: mentor odrzuca ten wybór. Kara za próbę zostaje (wg `tier`), ale decyzja nie jest zamknięta —
   * gracz widzi `mentorLine`, opcja się blokuje i wybiera ponownie. Dla złych wyborów, po których nikt nas
   * nie wykrył (reguła D-06); `critical` zostaje dla wykrycia i nieodwracalnej porażki.
   */
  reject?: { mentorLine: string };
}

/** Wybór 1 z N kart. */
export interface ChoiceCardsConfig {
  /** Numer decyzji w misji. */
  decisionNum: number;
  /** Pytanie na ekranie. */
  question: string;
  /** Nazwa aplikacji w nagłówku, np. "//BAZA_WIRUSÓW" (domyślnie "//WYBÓR"). */
  title?: string;
  /** Krótki tekst pod nagłówkiem aplikacji. */
  subtitle?: string;
  /** Polecenie w pasku ZADANIE (domyślnie `question`). */
  task?: string;
  /** Plakietka po prawej w nagłówku, np. "KROK 1/2". */
  step?: string;
  /** Etykieta ramki wyboru (domyślnie "WYBIERZ JEDNO"). */
  choiceLabel?: string;
  /** Opcje; klocek wyświetla je w losowej kolejności. */
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
  /** Nazwa aplikacji w nagłówku (domyślnie "//ROZMOWA"). */
  title?: string;
  /** Polecenie w pasku ZADANIE (domyślnie ogólne „przeczytaj i odpowiedz”). */
  task?: string;
  /** Węzły rozmowy; opcje każdego węzła klocek wyświetla w losowej kolejności. */
  nodes: DialogueNode[];
  /** Wiadomość zamykająca rozmowę po ostatnim węźle. */
  closingMessage?: string;
}

/** Jedna podpisana część programu pod zdrapką `ScratchMatrix` (zapala się w miarę odsłaniania). */
export interface MatrixPart {
  id: string;
  /** Krótka nazwa, np. `PODGLĄD EKRANU`. */
  label: string;
  /** Jedno zdanie bez żargonu, np. „widzisz pulpit ofiary”. */
  desc: string;
}

/**
 * Wariant ekranu zdrapki (zwykle wg opcji wybranej w poprzedniej decyzji): nazwa programu, grafika pod maską
 * i podpisane części. `image` jest dowolnym odwołaniem misji (np. `AssetRef`): silnik go nie interpretuje,
 * rysuje go `renderImage` podane przez misję.
 */
export interface MatrixVariant<TImage = unknown> {
  /** Nazwa składanego programu, np. `RAT`. */
  programName: string;
  /** Grafika pod maską (format zna tylko misja). */
  image: TImage;
  /** Tekst alternatywny grafiki. */
  imageAlt: string;
  /** Podpisane części programu (zwykle cztery). */
  parts: MatrixPart[];
  /** Kolor paska postępu dla tego wariantu (nadpisuje `ScratchMatrixConfig.barColor`). */
  barColor?: string;
}

/** Zdrapka: gracz odsłania kursorem grafikę pod maską, pasek segmentowy rośnie, podpisy części się zapalają. */
export interface ScratchMatrixConfig<TImage = unknown> {
  /** Nagłówek nad polem, np. „WYSZUKAJ CZĘŚCI WIRUSA:”. */
  heading: string;
  /** Odsłonięta część pola (0..1), od której pasek liczy się jako 100%. */
  revealThreshold: number;
  /** Liczba segmentów paska postępu. */
  segments: number;
  /** Warianty ekranu wg id (np. id opcji poprzedniej decyzji). */
  variants: Record<string, MatrixVariant<TImage>>;
  /** Komunikat po 100% (zastępuje nagłówek). */
  doneMessage: string;
  /** Podpis wskazówki po chwili bez zdrapywania („PRZECIĄGAJ TUTAJ”). */
  hint: string;
  /** Kolor zapalonych segmentów paska (domyślnie akcent aplikacji). Po 100% pasek jest zielony. */
  barColor?: string;
  /** Kolor siatki i „?” na masce (domyślnie akcent aplikacji). */
  maskColor?: string;
}

// ---------------------------------------------------------------------------
// ETAPY MISJI (docs/scenario-engine.md, sekcja 1)
// ---------------------------------------------------------------------------

/**
 * Jeden „beat" rozmowy mostkującej etapy: albo kwestia BYTE_MASTERA (pojawia się
 * z animacją „pisze" i delayem), albo kwestia gracza z VR (przycisk w czacie; klik
 * wysyła echo i przesuwa rozmowę — NIE otwiera aplikacji).
 */
export type ConversationBeat = (
  | { from: 'byte_master'; text: string }
  | { from: 'player'; id: string; label: string }
  /**
   * Przeskok czasu (pełnoekranowy `TimeJump`) — pokazuje „czekanie” z VR, np. aż ofiary
   * otworzą maila. Mostek czeka na koniec animacji, potem gra dalej.
   * Z `clock` (godzina docelowa, np. `'06:02'`) nakładka pokazuje lecący zegar, który
   * przewija się od `clockFrom` do `clock`; po przeskoku `clock` ustawia też zegar
   * systemowy pulpitu (`systemTime`). Bez `clockFrom` start to bieżący `systemTime`.
   * Bez `clock` jest sama wirująca tarcza (bez cyfr), a zegar pulpitu się nie zmienia.
   * `label` i `sublabel` to opcjonalny, mały podpis pod zegarem — silnik nie dopisuje
   * własnych tekstów.
   */
  | {
      from: 'time_jump';
      label?: string;
      sublabel?: string;
      durationMs?: number;
      /** Godzina startowa przeskoku („HH:MM”); działa tylko razem z `clock`. */
      clockFrom?: string;
      /** Godzina docelowa („HH:MM”). */
      clock?: string;
    }
) & {
  /** Beat gra tylko, gdy wcześniejsza decyzja gracza pasuje (zob. `BeatCondition`). Bez `when` gra zawsze. */
  when?: BeatCondition;
};

/** Co dzieje się po ukończeniu etapu: rozmowa z mentorem, a na jej końcu odblokowania. */
export interface StageCompletion {
  /**
   * Skrypt rozmowy mostkującej do kolejnego etapu (naprzemiennie BYTE_MASTER / gracz),
   * 1:1 z VR. Silnik gra go po kolei; dopiero po ostatnim beacie stosuje odblokowania.
   * Kafelek odblokowuje się więc PO tym, jak gracz napisze do mentora.
   */
  conversation?: ConversationBeat[];
  /** Identyfikatory do dopisania do `unlockedIcons` (po zakończeniu rozmowy). */
  unlockIcons?: string[];
  /** Powiadomienia `[1]` na kafelkach (po zakończeniu rozmowy). */
  badges?: Record<string, number>;
  /** Kafelek pulpitu do podświetlenia jako następny krok (po zakończeniu rozmowy). */
  highlightTile?: string;
  /**
   * Baner „POŁĄCZENIE PRZYCHODZĄCE: <label>” na pulpicie (po zakończeniu rozmowy).
   * Klik otwiera aplikację `appId`; baner znika, gdy etap tej aplikacji zostanie zaliczony.
   */
  incomingCall?: { appId: string; label: string };
  /**
   * Opóźnienie (ms) odblokowań, badge i `highlightTile` liczone od końca mostka.
   * Domyślnie 3000, jeśli mostek zawierał beat `time_jump` (gracz ma chwilę zauważyć,
   * że „coś się wydarzyło”), inaczej 0.
   */
  unlockDelayMs?: number;
  /** Czy zamknąć otwarte okno i wrócić na pulpit (domyślnie tak). */
  closeActiveApp?: boolean;
  /** Dźwięk na koniec mostka. */
  sound?: 'notification' | 'alarm' | 'success';
}

export interface StageDefinition {
  id: string;
  /** Kafelek pulpitu, w którym rozgrywa się etap. */
  appId: string;
  /** Numery decyzji ocenianych w tym etapie. */
  decisions?: number[];
  /**
   * Rozmowa grana w czacie na prawym monitorze, gdy gracz PIERWSZY raz otwiera aplikację
   * etapu (ten sam mechanizm co mostek: animacja „pisze”, opóźnienie, przyciski kwestii gracza).
   * Służy do rzeczy, o których mentor mówi „w trakcie” pracy w aplikacji (np. opis auta
   * do wypatrzenia). Gra się raz na rozgrywkę; powtórka misji ją resetuje.
   * Gdy trwa mostek, rozmowa czeka na jego koniec; gdy gracz zaliczy etap w trakcie rozmowy,
   * jej reszta gra się przed mostkiem etapu. Nie odblokowuje niczego.
   */
  openingConversation?: ConversationBeat[];
  completion: StageCompletion;
}

// Full Mission Definition
export interface MissionDefinition {
  mission: MissionMeta;
  intro: MissionIntro;
  desktopApps: DesktopAppConfig[];
  /** Przebieg misji jako lista etapów (wzorzec B — standard). */
  stages?: StageDefinition[];
  /** Dane klocków i minigier, kluczowane identyfikatorem kafelka (wzorzec B). */
  blocks?: Record<string, unknown>;
  step6: DebriefData;
  [key: string]: any;
}

