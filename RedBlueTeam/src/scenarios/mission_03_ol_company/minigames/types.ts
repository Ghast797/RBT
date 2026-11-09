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

// ---------------------------------------------------------------------------
// Etap 1: //BAZA_WIRUSÓW (D1 + matryca kompilacji jako flavor bez oceny)
// ---------------------------------------------------------------------------

/** Jedna część wirusa podpisana pod matrycą (zapala się w miarę odsłaniania). */
export interface MatrixPart {
  id: string;
  /** Krótka nazwa, np. `PODGLĄD EKRANU`. */
  label: string;
  /** Jedno zdanie bez żargonu, np. „widzisz pulpit ofiary”. */
  desc: string;
}

export interface VirusMatrixConfig {
  /** Nagłówek ekranu: „WYSZUKAJ CZĘŚCI WIRUSA:”. */
  heading: string;
  /** Napis na ekranie ładowania przed matrycą. */
  loaderText: string;
  /** Odsłonięta część pola (0..1), od której pasek liczy się jako 100% (z dokumentu: 100%, w danych 0,92). */
  revealThreshold: number;
  /** Liczba segmentów paska postępu. */
  segments: number;
  /** Grafika pod maską: `{ group: 'virus', name: 'rat' }`. */
  image: AssetRef;
  /** Cztery podpisane części wirusa. */
  parts: MatrixPart[];
  /** Komunikat po 100%: „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”. */
  doneMessage: string;
  /** Przycisk po komunikacie: „KONTYNUUJ” (→ `onComplete`). */
  continueLabel: string;
}

export interface VirusLabConfig {
  /** D1: wybór wirusa (RAT ideal, ransomware suboptimal, keylogger critical). */
  virus: GradedDecision;
  /** Teksty ekranu wyboru wirusa (ZADANIE, etykieta strefy wyboru, przycisk). */
  virusTexts: { task: string; choiceLabel: string; confirmLabel: string };
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
  employees: OsintEmployee[];
  events: OsintEvent[];
}

export interface OsintBrowserConfig {
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
  /** Teksty D2: etykieta strefy („KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?”), ZADANIE, przycisk. */
  targetTexts: { task: string; choiceLabel: string; confirmLabel: string };
  /** D3: wektor socjotechniczny (3 wiersze, rozmowa = wiersze). */
  vector: GradedDecision;
  /** Teksty D3: etykieta strefy („JAK GO OSZUKASZ?”), ZADANIE, przycisk. */
  vectorTexts: { task: string; choiceLabel: string; confirmLabel: string };
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
 * Reguła „plik pasuje do planu D3”: dla odpowiedzi gracza w D3 (`reportAnswer ?? label` wybranej opcji
 * z `OsintBrowserConfig.vector`) wskazuje pliki, które wolno wgrać na pendrive'a. Błędny plik wraca
 * na listę z komunikatem `wrongFileMessage` (bez kary, aktywność nieoceniana).
 */
export interface UsbPlanRule {
  /** Id opcji D3 (np. `vector_party_zip`). */
  vectorOptionId: string;
  /** Odpowiedź zapisana w `playerChoices` dla tej opcji D3 (do dopasowania w czasie gry). */
  answer: string;
  /** Id plików z `attachments`, które pasują do planu. */
  fileIds: string[];
}

export interface PendriveConfig {
  /** Numer decyzji D3, której odpowiedź (z `playerChoices`) wybiera regułę z `plan`. */
  planDecisionNum: number;
  /** Reguły dopasowania pliku do planu D3, po jednej na opcję D3. */
  plan: UsbPlanRule[];
  /** Gdy brak zapisanego D3 (np. wejście wprost w trybie deweloperskim): id opcji D3, której reguła obowiązuje. */
  planFallbackVectorOptionId: string;
  /** Pliki w panelu ZAŁĄCZNIKI (trzy z dokumentu). */
  attachments: UsbAttachment[];
  /** Teksty ekranu „POBIERZ ZAŁĄCZNIKI” i panelu załączników. */
  startTexts: { task: string; button: string; loader: string; panelTitle: string };
  /** Teksty kroku uzbrajania: dwa polecenia ZADANIE (plik na pendrive'a, potem RAT na plik), pakowanie, błąd. */
  armTexts: {
    taskFile: string;
    taskPayload: string;
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
  /**
   * Krok „WYBIERZ NAZWĘ PENDRIVE'A:” (4 karty). Poziomy nazw wchodzą do agregacji D4
   * (poziom D4 = najgorszy z dwóch kroków: nazwa, podpis). To NIE jest osobna decyzja SCORM.
   * `KEYLOGGER` (critical) zgłasza D4 od razu z `answer`: „NAZWA DYSKU: KEYLOGGER”.
   */
  volume: GradedStep & { choiceLabel: string; confirmLabel: string; loader: string; task: string };
  /** D4: podpis na kopercie (4 wiersze). `confirmLabel` = „WYSUŃ PAMIĘĆ USB” zatwierdza D4 i wysuwa nośnik. */
  signature: GradedDecision & { choiceLabel: string; confirmLabel: string; task: string };
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
    shutdownLabel: string;
    payloadCaption: string;
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
  /** Siatka drona w trakcie: grafiki `drone/city_map`, `drone/parking` (opcjonalne, domyślnie SVG). */
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
