// Typy konfiguracji minigier Misji 3 (O&L Company) — wzorzec B.
//
// Dane (opcje, poziomy, feedback) mieszkają w stages.ts, nie w kodzie minigry.
// Minigra czyta config przez kontrakt silnika (BlockProps) i zgłasza decyzje
// przez onDecision — poziom decyzji wynika z danych, a punkty liczy silnik
// (core/scoring.ts). Zob. docs/scenario-engine.md i docs/migration-spec.md.

import type { ChoiceOption } from '../../../engine/types/mission';

/** Oceniana decyzja 1 z N (wspólny kształt dla wszystkich minigier M3). */
export interface GradedDecision {
  decisionNum: number;
  question: string;
  options: ChoiceOption[];
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
export interface OsintBrowserConfig {
  /** Dane strony O&L (hero, pracownicy z bio, wydarzenia) — materiał OSINT. */
  site: Record<string, unknown>;
  /**
   * D2: wybór celu. Małe rozgałęzienie (bez gałęzi w store): opcje `suboptimal`
   * (CEO, Logistyka) cofają do ponownego wyboru, `critical` (CISO) natychmiast
   * wykrywa, `ideal` (junior) przechodzi dalej. Poziom końcowy D2 = najgorszy
   * wybór na ścieżce (jak w trybie agregującym DialogueTree).
   */
  target: GradedDecision;
  /** D3: wektor socjotechniczny (pendrive ze zdjęciami z imprezy vs faktura .exe). */
  vector: GradedDecision;
  /** Zdarzenie firmowe, które gracz musi odczytać z OSINT przed wyborem wektora. */
  eventsHint?: string;
}

// --- Etap 3: //DYSK E: PENDRIVE (D4 załącznik, D5 wolumin, D6 koperta) ------
export interface PendriveConfig {
  attachments: GradedDecision; // D4
  volume: GradedDecision;      // D5
  envelope: GradedDecision;    // D6
  /** Flavor: podpięcie RAT do archiwum ZIP (warunek konieczny, bez oceny). */
  bindPrompt: string;
  successMessage: string;
}

// --- Etap 4: //DRON: CONDOR MIT63 (D7 adres, D8 pojazd) --------------------
export interface DroneMapLocation {
  id: string;
  number: number;
  address: string;
  district: string;
  x: number;
  y: number;
}

export interface DroneCar {
  id: number;
  desc: string;
  body: string;
  roof: string;
  isTarget: boolean;
}

export interface DroneConfig {
  droneStats: { model: string; video: string; speed: string; connection: string };
  address: GradedDecision;        // D7 (options.id = loc_x)
  car: GradedDecision;            // D8 (options.id = car_x)
  mapLocations: DroneMapLocation[];
  parkingCars: DroneCar[];
  successDrop: string;
}

// --- Etap 5: //WIRUS: RAT — sesja (finał bez oceny) ------------------------
export interface RatSessionConfig {
  host: { name: string; ip: string };
  takeoverLabel: string;
  networkLabel: string;
}
