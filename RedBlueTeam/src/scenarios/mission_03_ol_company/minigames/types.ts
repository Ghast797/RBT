// Typy konfiguracji minigier Misji 3 (O&L Company) — wzorzec B.
//
// Dane (opcje, poziomy, feedback, teksty ekranów) mieszkają w stages.ts, nie w kodzie minigry.
// Minigra czyta config przez kontrakt silnika (BlockProps) i zgłasza decyzje przez onDecision —
// poziom decyzji wynika z danych, a punkty liczy silnik (core/scoring.ts).
// Plan przebudowy i kontrakt dla agentów minigier: docs/rebuild-plan.md. Źródło prawdy: docs/Scenariusz…md.

import type { ChoiceOption, ChoiceOutcome } from '../../../engine/types/mission';

// ---------------------------------------------------------------------------
// WSPÓLNE
// ---------------------------------------------------------------------------

/**
 * Opcja z odpowiedzią do raportu pooperacyjnego. `onDecision.answer` = `reportAnswer ?? label`
 * (kolumna „Wybór gracza” tabeli debriefu z dokumentu bywa krótsza niż etykieta na ekranie).
 */
export interface ReportableOption extends ChoiceOption {
  reportAnswer?: string;
}

/** Krok wyboru bez numeru decyzji (nie jest osobno oceniany, np. nazwa pendrive'a wchodząca do D4). */
export interface GradedStep<O extends ChoiceOption = ReportableOption> {
  question: string;
  options: O[];
}

/** Oceniana decyzja 1 z N (wspólny kształt dla wszystkich minigier M3). */
export interface GradedDecision<O extends ChoiceOption = ReportableOption> extends GradedStep<O> {
  decisionNum: number;
}

/** Grupy grafik misji (`src/scenarios/mission_03_ol_company/assets/<grupa>/`). */
export type AssetGroup = 'virus' | 'employees' | 'events' | 'usb' | 'drone' | 'rat';

/**
 * Odwołanie do grafiki: `name` to nazwa pliku bez rozszerzenia w `assets/<group>/`.
 * Brak pliku = zastępnik (`ImageSlot` w `ui.tsx`).
 */
export interface AssetRef {
  group: AssetGroup;
  name: string;
}

/**
 * Wybór poprzedniego etapu, który następne etapy czytają z `customState`
 * (klucz `USB_STATE_KEY`, zapisuje go //DYSK E po zatwierdzeniu D4).
 */
export interface UsbState {
  /** Nazwa dysku wybrana w kroku „WYBIERZ NAZWĘ PENDRIVE'A” (np. `IMPREZA`). */
  volume: string;
  /** Nazwa archiwum z RAT na pendrive'ie (np. `FOTKI_AFTERPARTY.ZIP`). */
  archive: string;
  /** Podpis na kopercie wybrany w D4. */
  signature: string;
}

/** Klucz w `customState` (`useMissionStore.setCustomState`) dla `UsbState`. */
export const USB_STATE_KEY = 'm3_usb';

/**
 * Klucz w `customState` dla planu z D3: id wybranej opcji wektora (np. `vector_party_zip`).
 * Zapisuje go //TOR po zatwierdzeniu D3, czyta //DYSK E (wybór reguły „plik pasuje do planu”).
 */
export const PLAN_STATE_KEY = 'm3_plan';

// ---------------------------------------------------------------------------
// Etap 1: //BAZA_WIRUSÓW (D1 + matryca kompilacji jako flavor bez oceny)
// ---------------------------------------------------------------------------

/** Jedna część programu podpisana pod zdrapką (zapala się w miarę odsłaniania). */
export interface MatrixPart {
  id: string;
  /** Krótka nazwa, np. `PODGLĄD EKRANU`. */
  label: string;
  /** Jedno zdanie bez żargonu, np. „widzisz pulpit ofiary”. */
  desc: string;
}

/**
 * Wariant ekranu zdrapki dla wybranego w D1 programu: nazwa programu, grafika pod maską (z tekstem
 * alternatywnym) i cztery podpisy części. Dzięki temu po wyborze Ransomware (suboptimal, gra idzie dalej)
 * ekran nie sugeruje, że powstaje RAT.
 */
export interface MatrixVariant {
  /** Nazwa składanego programu, np. `RAT`. */
  programName: string;
  /** Grafika pod maską: `{ group: 'virus', name: 'rat' }`. */
  image: AssetRef;
  /** Tekst alternatywny grafiki. */
  imageAlt: string;
  /** Cztery podpisane części programu. */
  parts: MatrixPart[];
}

export interface VirusMatrixConfig {
  /** Nagłówek ekranu: „WYSZUKAJ CZĘŚCI WIRUSA:”. */
  heading: string;
  /** Przedrostek podtytułu z nazwą składanego programu: „SKŁADASZ PROGRAM:” (+ `variant.programName`). */
  programPrefix: string;
  /** Napis na ekranie ładowania przed zdrapką (bez żargonu). */
  loaderText: string;
  /** Odsłonięta część pola (0..1), od której pasek liczy się jako 100% (z dokumentu: 100%, w danych 0,92). */
  revealThreshold: number;
  /** Liczba segmentów paska postępu. */
  segments: number;
  /** Warianty ekranu wg id opcji D1 (każda opcja prowadząca do zdrapki, czyli niekrytyczna, ma wariant). */
  variants: Record<string, MatrixVariant>;
  /** Komunikat po 100%: „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”. */
  doneMessage: string;
  /** Polecenie ZADANIE ekranu zdrapki. */
  task: string;
  /** Podpis wskazówki, która pojawia się po chwili bez zdrapywania („PRZECIĄGAJ TUTAJ”). */
  hint: string;
}

export interface VirusLabConfig {
  /** Tytuł aplikacji w nagłówku (`//BAZA_WIRUSÓW`). */
  title: string;
  /** Podtytuł nagłówka (kontekst aplikacji, nie polecenie); na ekranie zdrapki zastępuje go „SKŁADASZ PROGRAM: X”. */
  subtitle: string;
  /** Plakietki kroków: [wybór wirusa, zdrapka] (`KROK 1/2`, `KROK 2/2`). */
  steps: [string, string];
  /** D1: wybór wirusa (RAT ideal, ransomware suboptimal, keylogger critical). */
  virus: GradedDecision;
  /** Teksty ekranu wyboru wirusa (ZADANIE, przycisk). Etykieta strefy wyboru to `virus.question` (jedno źródło: ekran = raport). */
  virusTexts: { task: string; confirmLabel: string };
  /** Matryca kompilacji (nieoceniana): zdrapka + pasek postępu. */
  matrix: VirusMatrixConfig;
}

// ---------------------------------------------------------------------------
// Etap 2: //TOR: PRZEGLĄDARKA (D2 cel + D3 wektor, OSINT)
// ---------------------------------------------------------------------------

/**
 * Pracownik na stronie O&L (materiał OSINT). `optionId` łączy go z kartą celu D2.
 * Opis (`bio`) i `tenure` mówią tylko o stażu i zakresie pracy: żadnego słowa o szkoleniach
 * ani poziomie wiedzy z bezpieczeństwa (uwaga właściciela). Brak pól oceniających.
 */
export interface OsintEmployee {
  id: string;
  /** Imię i nazwisko (WERSALIKAMI, tak jak karta celu D2). */
  name: string;
  /** Stanowisko z dokumentu. */
  role: string;
  /** Staż, np. `W O&L OD: 2 TYGODNIE`. */
  tenure: string;
  /** Dwa zdania o zakresie pracy. */
  bio: string;
  /** Zdjęcie: `{ group: 'employees', name: <id pracownika> }`. */
  photo: AssetRef;
  /** Opcja D2 odpowiadająca tej osobie. */
  optionId: string;
}

/** Wpis w zakładce WYDARZENIA: nagłówek, treść, hashtagi, zdjęcia jedno pod drugim. */
export interface OsintEvent {
  id: string;
  /** Pierwsze zdanie wpisu z dokumentu (np. „15 WRZEŚNIA ODBYŁA SIĘ IMPREZA…!”). */
  headline: string;
  /** Reszta wpisu z dokumentu (bywa pusta). */
  body?: string;
  hashtags?: string;
  /** Zdjęcia: `{ group: 'events', name: 'party_sales_1' }` itd. */
  photos: AssetRef[];
}

/** Pełne dane strony O&L Company: jedyne źródło dla minigry (hero, pracownicy, wydarzenia). */
export interface OsintSite {
  url: string;
  title: string;
  /** Nazwy zakładek. */
  tabs: { home: string; events: string };
  heroHeadline: string;
  heroSubheadline: string;
  contact: { phone: string; email: string };
  /** Nagłówek sekcji pracowników: „NASI EKSPERCI:”. */
  employeesHeading: string;
  /** Opis dostępności strzałki „przewiń w dół” u dołu okna strony. */
  scrollDownLabel: string;
  employees: OsintEmployee[];
  events: OsintEvent[];
}

export interface OsintBrowserConfig {
  /** Tytuł aplikacji w nagłówku (`//TOR: PRZEGLĄDARKA`). */
  title: string;
  /** Podtytuł nagłówka (kontekst aplikacji, nie polecenie). */
  subtitle: string;
  /** Plakietki kroków: [strona, wybór celu, wybór wektora] (`KROK 1/3` …). */
  steps: [string, string, string];
  /** Dane strony (hero, pracownicy, wydarzenia) — materiał OSINT, ekran 1. */
  site: OsintSite;
  /** Teksty ekranu strony: ZADANIE, przycisk przejścia i wskaźniki „PRZECZYTANO”. */
  siteTexts: {
    task: string;
    /** „PRZEJDŹ DO WYBORU CELU” — nieaktywny, dopóki obie zakładki nie zostały przewinięte do końca. */
    continueLabel: string;
    /** Wskaźnik „PRZECZYTANO:”. */
    readLabel: string;
  };
  /** Napisy ekranów ładowania. */
  loaders: { target: string; targetSave: string; vectorSave: string };
  /** D2: wybór celu. 5 kart tylko z imieniem i nazwiskiem (label = imię i nazwisko, bez `desc`). */
  target: GradedDecision;
  /** Teksty D2: ZADANIE, przycisk. Etykieta strefy to `target.question` („KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?”). */
  targetTexts: { task: string; confirmLabel: string };
  /** D3: wektor socjotechniczny (3 wiersze, rozmowa = wiersze). */
  vector: GradedDecision;
  /** Teksty D3: ZADANIE, przycisk. Etykieta strefy to `vector.question` („JAK GO OSZUKASZ?”). */
  vectorTexts: { task: string; confirmLabel: string };
}

// ---------------------------------------------------------------------------
// Etap 3: //DYSK E: PENDRIVE (załączniki -> archiwum -> nazwa dysku -> podpis, D4)
// ---------------------------------------------------------------------------

/** Plik z panelu ZAŁĄCZNIKI (pobierany od BYTE_MASTERA). */
export interface UsbAttachment {
  id: string;
  /** Nazwa pliku jak z dokumentu, np. `IMG_00034521.JPG X3`. */
  name: string;
  /** Nazwa archiwum ZIP, które powstaje z tego pliku i RAT (np. `FOTKI_AFTERPARTY.ZIP`). */
  archive: string;
  /** Grafika miniatury (tylko zdjęcia): `{ group: 'usb', name: 'party_photos' }`. */
  thumb?: AssetRef;
}

/**
 * Reguła „plik pasuje do planu D3”: dla opcji D3 wybranej przez gracza (id z `customState[PLAN_STATE_KEY]`)
 * wskazuje pliki, które wolno wgrać na pendrive'a. Błędny plik wraca na listę z komunikatem
 * `wrongFileMessage` (bez kary, aktywność nieoceniana).
 */
export interface UsbPlanRule {
  /** Id opcji D3 (np. `vector_party_zip`). */
  vectorOptionId: string;
  /** Opis planu pokazywany graczowi w przypomnieniu (odpowiedź D3 z raportu: `reportAnswer ?? label` opcji). */
  planLabel: string;
  /** Id plików z `attachments`, które pasują do planu. */
  fileIds: string[];
}

export interface PendriveConfig {
  /** Tytuł aplikacji w nagłówku (`//DYSK E: PENDRIVE`). */
  title: string;
  /** Podtytuł nagłówka (kontekst aplikacji, nie polecenie). */
  subtitle: string;
  /** Plakietki kroków: [uzbrajanie, nazwa dysku, podpis] (`KROK 1/3` …). */
  steps: [string, string, string];
  /** Reguły dopasowania pliku do planu D3, po jednej na opcję D3. */
  plan: UsbPlanRule[];
  /** Gdy brak zapisanego planu (np. wejście wprost w trybie deweloperskim): id opcji D3, której reguła obowiązuje. */
  planFallbackVectorOptionId: string;
  /** Pliki w panelu ZAŁĄCZNIKI (trzy z dokumentu). */
  attachments: UsbAttachment[];
  /** Teksty ekranu „POBIERZ ZAŁĄCZNIKI” i panelu załączników. */
  startTexts: { task: string; button: string; loader: string; panelTitle: string };
  /** Teksty kroku uzbrajania: dwa polecenia ZADANIE (plik na pendrive'a, potem RAT na plik), pakowanie, błąd. */
  armTexts: {
    taskFile: string;
    taskPayload: string;
    /** Przedrostek przypomnienia planu z D3 nad panelami: „PLAN:” (+ `planLabel` reguły). */
    planPrefix: string;
    /** Podpis przeciąganego elementu „//WIRUS: RAT”. */
    payloadLabel: string;
    /** Podpis slotu pendrive'a: „//E: USB”. */
    slotLabel: string;
    packing: string;
    wrongFileMessage: string;
    loader: string;
  };
  /** Grafika koperty: `{ group: 'usb', name: 'envelope' }`. */
  envelopeImage: AssetRef;
  /** Tekst alternatywny grafiki koperty. */
  envelopeImageAlt: string;
  /**
   * Krok „WYBIERZ NAZWĘ PENDRIVE'A:” (4 karty). Poziomy nazw wchodzą do agregacji D4
   * (poziom D4 = najgorszy z dwóch kroków: nazwa, podpis). To NIE jest osobna decyzja SCORM.
   * `KEYLOGGER` (critical) zgłasza D4 od razu z `answer`: „NAZWA DYSKU: KEYLOGGER”.
   */
  volume: GradedStep & { confirmLabel: string; loader: string; task: string };
  /** D4: podpis na kopercie (4 wiersze). `confirmLabel` = „WYSUŃ PAMIĘĆ USB” zatwierdza D4 i wysuwa nośnik. */
  signature: GradedDecision & { confirmLabel: string; task: string };
  /** Przedrostki odpowiedzi D4 w raporcie, gdy ocenę obniżyła nazwa dysku: `NAZWA DYSKU: X / PODPIS: Y`. */
  reportLabels: { volume: string; signature: string };
  /** Komunikat po wysunięciu nośnika (→ `onComplete`). */
  successMessage: string;
}

// ---------------------------------------------------------------------------
// Etap 4: //DRON: CONDOR MIT63 (D5 adres, D6 pojazd)
// ---------------------------------------------------------------------------

/**
 * Adres na mapie. Jedno źródło dla pinów mapy i opcji D5: `address`/`district` to etykieta i opis opcji,
 * `tier` poziom decyzji (opcje `config.address.options` są z tej listy generowane w stages.ts).
 */
export interface DroneMapLocation {
  id: string;
  number: number;
  address: string;
  district: string;
  /** Pozycja pinu na planie miasta w procentach (0..100). */
  x: number;
  y: number;
  tier: ChoiceOutcome;
}

/** Kształt nadwozia samochodu na parkingu (rysuje go minigra). */
export type CarShape = 'suv' | 'sedan' | 'hatchback' | 'van' | 'wagon';

/**
 * Samochód na parkingu. Jedno źródło dla miejsc w kamerze i opcji D6: `id` jest identyfikatorem opcji,
 * `desc` etykietą, `tier` poziomem. Kolejność w `parkingCars` = miejsca parkingowe (2 rzędy po 4).
 */
export interface DroneCar {
  id: string;
  desc: string;
  shape: CarShape;
  body: string;
  roof: string;
  tier: ChoiceOutcome;
}

export interface DroneConfig {
  /** Tytuł aplikacji w nagłówku (`//DRON: CONDOR MIT63`). */
  title: string;
  /** Podtytuł nagłówka (kontekst aplikacji, nie polecenie). */
  subtitle: string;
  /** Ekran 1: specyfikacja z dokumentu. */
  droneStats: { model: string; video: string; speed: string; connection: string };
  /** Napisy statusów drona (kolejne ekrany). */
  statuses: { idle: string; awaitingPayload: string; awaitingCoordinates: string; flying: string };
  /** Przyciski i polecenia ZADANIE kolejnych ekranów. */
  texts: {
    activateLabel: string;
    prepareLabel: string;
    confirmLabel: string;
    cameraLabel: string;
    dropLabel: string;
    payloadCaption: string;
    /** Napisy ekranów ładowania: aktywacja drona, uruchomienie kamery, zrzut ładunku. */
    loaders: { activate: string; camera: string; drop: string };
    payloadAttaching: string;
    flightCaption: string;
    tasks: { activate: string; payload: string; map: string; camera: string; aim: string; done: string };
  };
  /** HUD kamery: bateria w procentach, podpis zegara transmisji. */
  hud: { batteryPercent: number; transmissionLabel: string };
  /** D5: adres domu ofiary (opcje generowane z `mapLocations`, id = `loc_*`). */
  address: GradedDecision;
  /** D6: pojazd (opcje generowane z `parkingCars` + `asphalt`, id = `car_*` / `asphalt`). */
  car: GradedDecision;
  mapLocations: DroneMapLocation[];
  parkingCars: DroneCar[];
  /** Pusty asfalt między miejscami parkingowymi (opcja D6 critical, kliknięcie w tło sceny). */
  asphalt: { id: string; label: string; tier: ChoiceOutcome };
  /** Grafiki drona (opcjonalne; brak pliku = SVG): plan miasta w `DroneMap`, parking w `DroneCamera`. */
  images: { cityMap: AssetRef; parking: AssetRef };
  /** Komunikat po zrzucie: „POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'M. DRON WRACA DO POKOJU HAKERA”. */
  successDrop: string;
  /** Wartości koperty, gdy brak `m3_usb` (tryb deweloperski). */
  usbFallback: UsbState;
}

// ---------------------------------------------------------------------------
// Etap 5: //WIRUS: RAT (C2) — sesja (finał bez oceny)
// ---------------------------------------------------------------------------

/** Ikona na pulpicie ofiary (`warning` = pomarańczowy trójkąt ostrzegawczy, ikona otwiera folder FREEVOLT). */
export interface RatDesktopIcon {
  id: string;
  label: string;
  warning?: boolean;
}

/** Plik w folderze FREEVOLT (do przeciągnięcia na pulpit hakera; wszystkie 4 trzeba przenieść). */
export interface FreevoltFile {
  id: string;
  name: string;
  kind: 'pdf' | 'xlsx';
}

/** Węzeł schematu sieci. */
export interface NetworkNode {
  id: string;
  label: string;
  kind: 'hacker' | 'relay' | 'infected';
}

export interface RatSessionConfig {
  /** Podtytuł nagłówka (kontekst aplikacji, nie polecenie). Tytuł to `alert.label`. */
  subtitle: string;
  /** Stacja ofiary (ekran 1). */
  host: { name: string; ip: string };
  usbFallback: UsbState;
  /** Ekran 1: etykieta, status, etykiety metadanych, przycisk przejęcia. */
  alert: {
    label: string;
    status: string;
    hostLabel: string;
    ipLabel: string;
    archiveLabel: string;
    volumeLabel: string;
    takeoverLabel: string;
  };
  /** Ekran 2: pulpit ofiary. */
  desktop: {
    banner: string;
    icons: RatDesktopIcon[];
    /** Tapeta: `{ group: 'rat', name: 'victim_wallpaper' }` (brak pliku = tło wektorowe). */
    wallpaper: AssetRef;
    /** Tekst alternatywny tapety. */
    wallpaperAlt: string;
  };
  /** Ekran 3 (dodatek): folder FREEVOLT i pulpit hakera. */
  files: {
    folderTitle: string;
    hackerDesktopLabel: string;
    items: FreevoltFile[];
    copyingLabel: string;
  };
  /** Ekran 4: schemat sieci. */
  network: {
    nodes: NetworkNode[];
    headline: string;
    endLabel: string;
  };
  loaders: { desktop: string; network: string };
  /** Polecenia ZADANIE kolejnych ekranów. */
  tasks: { alert: string; desktop: string; files: string; network: string };
}
