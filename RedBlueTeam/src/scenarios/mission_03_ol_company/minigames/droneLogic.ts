// //DRON: CONDOR MIT63 — czysta logika (bez UI): geometria parkingu, dopasowanie kliknięcia do opcji D6,
// lot drona na planie miasta i statusy. Rysuje to DroneCamera/DroneMap, a hit-test liczy się tu na tych
// samych wymiarach, więc to, co gracz widzi, jest tym, w co trafia (testy: tests/m3-drone.test.ts).

import type { CarShape, DroneCar, DroneMapLocation } from './types';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Parking widziany z drona (układ współrzędnych sceny SVG)
// ---------------------------------------------------------------------------

/** Wymiary sceny kamery (viewBox SVG). */
export const PARKING_SCENE = { width: 800, height: 390 } as const;

/** Parking ma 2 rzędy po 4 miejsca (dane: `parkingCars`, kolejność = miejsca). */
export const PARKING_COLUMNS = 4;

const SLOT_W = 180;
const SLOT_H = 150;
const SLOT_GAP_X = 20;
const ROW_TOP = 20;
/** Pas jezdni między rzędami (pusty asfalt, opcja `asphalt`). */
const LANE_H = 50;

/** Wymiary auta z góry (nosem do góry) w jednostkach sceny; różne kształty = różne sylwetki. */
export const CAR_DIMS: Record<CarShape, { w: number; h: number; cabinStart: number; cabinLen: number }> = {
  // cabinStart/cabinLen: początek i długość kabiny (dachu) liczone od przodu auta, w ułamkach długości.
  suv: { w: 86, h: 124, cabinStart: 0.3, cabinLen: 0.58 },
  sedan: { w: 74, h: 132, cabinStart: 0.32, cabinLen: 0.36 },
  hatchback: { w: 72, h: 110, cabinStart: 0.3, cabinLen: 0.5 },
  van: { w: 82, h: 138, cabinStart: 0.22, cabinLen: 0.72 },
  wagon: { w: 74, h: 134, cabinStart: 0.3, cabinLen: 0.58 }
};

/** Oś jezdni między rzędami (y sceny). */
export const LANE_Y = ROW_TOP + SLOT_H + LANE_H / 2;

/** Prostokąty miejsc parkingowych (rząd po rzędzie, od lewej). */
export function parkingSlots(count: number, columns: number = PARKING_COLUMNS): Rect[] {
  const rowWidth = columns * SLOT_W + (columns - 1) * SLOT_GAP_X;
  const left = (PARKING_SCENE.width - rowWidth) / 2;
  return Array.from({ length: count }, (_, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    return {
      x: left + col * (SLOT_W + SLOT_GAP_X),
      y: ROW_TOP + row * (SLOT_H + LANE_H),
      w: SLOT_W,
      h: SLOT_H
    };
  });
}

/** Prostokąt auta wyśrodkowany w miejscu parkingowym. */
export function carRectInSlot(slot: Rect, shape: CarShape): Rect {
  const { w, h } = CAR_DIMS[shape];
  return { x: slot.x + (slot.w - w) / 2, y: slot.y + (slot.h - h) / 2, w, h };
}

export interface PlacedCar {
  car: DroneCar;
  slot: Rect;
  rect: Rect;
}

/** Auta (w kolejności miejsc, np. po `useShuffled`) rozstawione na miejscach parkingowych. */
export function placeCars(cars: readonly DroneCar[], columns: number = PARKING_COLUMNS): PlacedCar[] {
  const slots = parkingSlots(cars.length, columns);
  return cars.map((car, i) => ({ car, slot: slots[i], rect: carRectInSlot(slots[i], car.shape) }));
}

/** Tolerancja trafienia w auto (jednostki sceny): klik tuż obok karoserii wciąż liczy się jako auto. */
export const CAR_HIT_MARGIN = 5;

const inside = (p: Point, r: Rect, margin = 0): boolean =>
  p.x >= r.x - margin && p.x <= r.x + r.w + margin && p.y >= r.y - margin && p.y <= r.y + r.h + margin;

/** Id auta pod punktem albo `null` (asfalt, linie miejsc, jezdnia, poza sceną). */
export function carAt(point: Point, placed: readonly PlacedCar[]): string | null {
  const hits = placed.filter((p) => inside(point, p.rect, CAR_HIT_MARGIN));
  if (hits.length === 0) return null;
  if (hits.length === 1) return hits[0].car.id;
  // Auta się nie nakładają, ale przy zbieżnych marginesach wygrywa to z bliższym środkiem.
  const dist = (p: PlacedCar) => Math.hypot(point.x - (p.rect.x + p.rect.w / 2), point.y - (p.rect.y + p.rect.h / 2));
  return hits.reduce((best, p) => (dist(p) < dist(best) ? p : best)).car.id;
}

/**
 * Opcja D6 dla klikniętego punktu: id auta pod celownikiem, a gdy nic tam nie stoi, id opcji pustego asfaltu.
 * Jedyny punkt, w którym kliknięcie zamienia się w odpowiedź (reszta to rysowanie).
 */
export function resolveDropOptionId(point: Point, placed: readonly PlacedCar[], asphaltId: string): string {
  return carAt(point, placed) ?? asphaltId;
}

/** Punkt zrzutu: środek dachu auta (kabiny), żeby koperta lądowała tam, gdzie widać auto. */
export function carRoofCenter(rect: Rect, shape: CarShape): Point {
  const { h, cabinStart, cabinLen } = CAR_DIMS[shape];
  return { x: rect.x + rect.w / 2, y: rect.y + h * (cabinStart + cabinLen / 2) };
}

/** Zamienia punkt ekranu na współrzędne sceny SVG (viewBox z `preserveAspectRatio="xMidYMid meet"`). */
export function clientToScene(
  client: Point,
  box: { left: number; top: number; width: number; height: number },
  scene: { width: number; height: number } = PARKING_SCENE
): Point {
  const scale = Math.min(box.width / scene.width, box.height / scene.height);
  const offsetX = (box.width - scene.width * scale) / 2;
  const offsetY = (box.height - scene.height * scale) / 2;
  return { x: (client.x - box.left - offsetX) / scale, y: (client.y - box.top - offsetY) / scale };
}

// ---------------------------------------------------------------------------
// Plan miasta i lot
// ---------------------------------------------------------------------------

/** Punkt startu drona na planie (pokój hakera), w procentach planu. */
export const DRONE_ORIGIN: Point = { x: 7, y: 90 };

/** Czas lotu do celu (ms). */
export const FLIGHT_MS = 2500;

/** Pozycja pinu adresu na planie (procenty). */
export const locationPoint = (loc: Pick<DroneMapLocation, 'x' | 'y'>): Point => ({ x: loc.x, y: loc.y });

/** Pozycja drona w locie: interpolacja od pokoju hakera do celu; `pct` 0..100 (wartości spoza przycinane). */
export function flightPosition(from: Point, to: Point, pct: number): Point {
  const t = Math.min(1, Math.max(0, pct / 100));
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

/** Postęp lotu 0..100 po `elapsedMs` od startu. */
export const flightProgress = (elapsedMs: number, totalMs: number = FLIGHT_MS): number =>
  Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

/** Zegar transmisji `MM:SS` z sekund. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ---------------------------------------------------------------------------
// Statusy drona
// ---------------------------------------------------------------------------

/** Ekrany aplikacji (kolejność przebiegu). */
export type DronePhase =
  | 'activate'
  | 'activating'
  | 'payload'
  | 'attaching'
  | 'map'
  | 'flying'
  | 'cameraOff'
  | 'cameraLoading'
  | 'camera'
  | 'dropping'
  | 'done';

/**
 * Napis statusu drona dla ekranu. Cztery statusy z dokumentu; od lądowania nad parkingiem
 * (kamera) dokument nie podaje statusu, więc zwracamy `null` (nagłówek pokazuje wtedy łącze wideo).
 */
export function droneStatusFor(
  phase: DronePhase,
  prepared: boolean,
  statuses: { idle: string; awaitingPayload: string; awaitingCoordinates: string; flying: string }
): string | null {
  switch (phase) {
    case 'activate':
    case 'activating':
      return statuses.idle;
    case 'payload':
      return prepared ? statuses.awaitingPayload : statuses.idle;
    case 'attaching':
      return statuses.awaitingPayload;
    case 'map':
      return statuses.awaitingCoordinates;
    case 'flying':
      return statuses.flying;
    default:
      return null;
  }
}
