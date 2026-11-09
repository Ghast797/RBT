// Typy konfiguracji minigier Misji 3 (O&L Company) — wzorzec B.
//
// Dane (opcje, poziomy, feedback) mieszkają w stages.ts, nie w kodzie minigry.
// Minigra czyta config przez kontrakt silnika (BlockProps) i zgłasza decyzje
// przez onDecision — poziom decyzji wynika z danych, a punkty liczy silnik
// (core/scoring.ts). Zob. docs/scenario-engine.md i docs/migration-spec.md.

import type { ChoiceOption, ChoiceOutcome } from '../../../engine/types/mission';

/** Oceniana decyzja 1 z N (wspólny kształt dla wszystkich minigier M3). */
export interface GradedDecision<O extends ChoiceOption = ChoiceOption> {
  decisionNum: number;
  question: string;
  options: O[];
}

// --- Etap 1: //BAZA_WIRUSÓW (D1 + builder RAT jako flavor bez oceny) --------
/** Grupa przełączników buildera RAT (dokładnie jedna opcja poprawna). */
export interface BuilderGroup {
  title: string;
  options: Array<{ id: string; label: string; desc: string; correct: boolean; feedback: string }>;
}

export interface VirusLabConfig {
  /** D1: wybór wirusa (RAT / keylogger / ransomware). */
  virus: GradedDecision;
  /**
   * Builder RAT — aktywność NIEOCENIANA (flavor). Zły zestaw blokuje kompilację
   * komunikatem błędu; dopiero poprawny zestaw wywołuje onComplete. Nie nalicza
   * decyzji SCORM (świadome odejście od starego „detekcja bez numeru”).
   */
  builder: {
    title: string;
    subtitle: string;
    modules: BuilderGroup;
    masking: BuilderGroup;
    package: BuilderGroup;
    successMessage: string;
  };
}

// --- Etap 2: //TOR: PRZEGLĄDARKA (D2 cel + D3 wektor, OSINT) ----------------
/** Pracownik na stronie O&L (materiał OSINT). `optionId` łączy go z kartą celu D2. */
export interface OsintEmployee {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  bio: string;
  optionId?: string;
}

/** Wpis w zakładce WYDARZENIA strony O&L. */
export interface OsintNewsItem {
  id: string;
  title: string;
  date: string;
  boxText: string;
  content: string;
  hashtags: string;
  galleryText: string;
}

/** Pełne dane strony O&L Company — jedyne źródło dla minigry (hero, pracownicy, wydarzenia). */
export interface OsintSite {
  url: string;
  title: string;
  heroHeadline: string;
  heroSubheadline: string;
  contact: { phone: string; email: string };
  employees: OsintEmployee[];
  news: OsintNewsItem[];
}

export interface OsintBrowserConfig {
  /** Dane strony O&L (hero, pracownicy z bio, wydarzenia) — materiał OSINT. */
  site: OsintSite;
  /**
   * Notatka od mentora na prawym monitorze (zastępuje czat, który przejmuje SideMonitor).
   * Cytaty z intro i z mostka poprzedniego etapu, potrzebne do D2 i D3.
   */
  mentorNote: { target: string[]; vector: string[] };
  /**
   * D2: wybór celu. Małe rozgałęzienie (bez gałęzi w store): opcje `suboptimal`
   * (CEO, Logistyka) cofają do ponownego wyboru, `critical` (CISO) natychmiast
   * wykrywa, `ideal` (junior) przechodzi dalej. Poziom końcowy D2 = najgorszy
   * wybór na ścieżce (jak w trybie agregującym DialogueTree).
   */
  target: GradedDecision;
  /** D3: wektor socjotechniczny (pendrive ze zdjęciami z imprezy vs faktura .exe). */
  vector: GradedDecision;
}

// --- Etap 3: //DYSK E: PENDRIVE (D4 załącznik, D5 wolumin, D6 koperta) ------
/** Opcja D4 (plik na pendrive'ie): `archive` to nazwa archiwum ZIP z RAT, widoczna w pendrive i w sesji RAT. */
export interface AttachmentOption extends ChoiceOption {
  archive: string;
}

export interface PendriveConfig {
  attachments: GradedDecision<AttachmentOption>; // D4
  volume: GradedDecision;      // D5
  envelope: GradedDecision;    // D6
  /** Flavor: podpięcie RAT do archiwum ZIP (warunek konieczny, bez oceny). */
  bindPrompt: string;
  successMessage: string;
}

// --- Etap 4: //DRON: CONDOR MIT63 (D7 adres, D8 pojazd) --------------------
/**
 * Adres na mapie. Jedno źródło dla pinów mapy i opcji D7: `address`/`district` to etykieta i opis opcji,
 * `tier` poziom decyzji (opcje `config.address.options` są z tej listy generowane w stages.ts).
 */
export interface DroneMapLocation {
  id: string;
  number: number;
  address: string;
  district: string;
  x: number;
  y: number;
  tier: ChoiceOutcome;
}

/**
 * Samochód na parkingu. Jedno źródło dla slotów kamery, zdjęcia od mentora (pojazd `ideal`) i opcji D8:
 * `id` jest identyfikatorem opcji, `desc` jej etykietą, `tier` poziomem decyzji.
 */
export interface DroneCar {
  id: string;
  desc: string;
  body: string;
  roof: string;
  tier: ChoiceOutcome;
}

export interface DroneConfig {
  droneStats: { model: string; video: string; speed: string; connection: string };
  /**
   * Notatka od mentora na prawym monitorze (zastępuje czat, który przejmuje SideMonitor):
   * kwestie z mostka, potrzebne do D7 (adres) i D8 (pojazd). Te same teksty trafiają do czatu.
   */
  mentorNote: string[];
  address: GradedDecision;        // D7 (options generowane z mapLocations, id = loc_x)
  car: GradedDecision;            // D8 (options generowane z parkingCars, id = car_x)
  mapLocations: DroneMapLocation[];
  parkingCars: DroneCar[];
  successDrop: string;
}

// --- Etap 5: //WIRUS: RAT — sesja (finał bez oceny) ------------------------
/**
 * Sesja RAT pokazuje to, co gracz wybrał wcześniej: archiwum z D4 i wolumin (nazwę pendrive'a) z D5.
 * Odczyt z `playerChoices` po numerze decyzji i etykiecie opcji (jak `PhishingDispatchApp` w M2).
 */
export interface RatSessionConfig {
  host: { name: string; ip: string };
  takeoverLabel: string;
  networkLabel: string;
  /** D4: numer decyzji i opcje (z nazwą archiwum) — to samo źródło co karty w //DYSK E. */
  archiveDecisionNum: number;
  archiveOptions: AttachmentOption[];
  /** D5: numer decyzji; odpowiedź gracza to dosłownie nazwa woluminu. */
  volumeDecisionNum: number;
  /** Neutralne wartości, gdy brak zapisanego wyboru (np. tryb deweloperski). */
  fallback: { archive: string; volume: string };
  texts: {
    alert: { title: string; status: string; hostLabel: string; ipLabel: string };
    desktop: {
      banner: string;
      watermark: string;
      networkIcon: string;
      networkIconTitle: string;
      extractedStatus: string;
      extractedNote: string;
      hint: string;
    };
    network: {
      headline: string;
      subtitle: string;
      victimNode: string;
      victimStatus: string;
      otherNodes: [string, string];
      endLabel: string;
    };
    loaders: { desktop: string; network: string };
    tasks: { alert: string; loading_desktop: string; desktop: string; loading_network: string; network: string };
  };
}
