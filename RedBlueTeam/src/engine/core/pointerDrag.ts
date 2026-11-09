// Czysta logika przeciągania wskaźnikiem (mysz i dotyk) dla haka `usePointerDrag`.
// Bez Reacta i bez DOM — testowane w tests/pointerDrag.test.ts.
// Zob. docs/scenario-engine.md, sekcja 3 („Przeciąganie wskaźnikiem”).

export interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface DropZoneRect {
  id: string;
  rect: RectLike;
}

/** Ile pikseli trzeba przesunąć wskaźnik, żeby ruch uznać za przeciąganie (mniej = zwykłe stuknięcie). */
export const DEFAULT_DRAG_THRESHOLD = 5;

export interface PointerDragState<T extends string = string> {
  itemId: T;
  startX: number;
  startY: number;
  x: number;
  y: number;
  /** Czy ruch przekroczył próg: dopiero wtedy pokazujemy ducha i strefy upuszczania. */
  moved: boolean;
  /** Strefa pod kursorem (tylko przyjmująca ten element) albo `null`. */
  overZone: string | null;
}

export type DragOutcome<T extends string = string> =
  | { kind: 'drop'; itemId: T; zoneId: string; x: number; y: number }
  /** Ruch przekroczył próg, ale puszczono poza strefą przyjmującą element. */
  | { kind: 'miss'; itemId: T; x: number; y: number }
  /** Wskaźnik prawie się nie ruszył: zwykłe stuknięcie / klik. */
  | { kind: 'tap'; itemId: T; x: number; y: number };

const area = (r: RectLike) => Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);

/**
 * Strefa upuszczania pod punktem (x, y) w współrzędnych okna przeglądarki. Strefy o zerowym polu
 * (np. ukryte aplikacje) są pomijane; przy nakładających się wygrywa najmniejsza (najgłębsza).
 * `accepts` pozwala odrzucić strefy, które nie przyjmują przeciąganego elementu.
 */
export function pickDropZone(
  zones: readonly DropZoneRect[],
  x: number,
  y: number,
  accepts: (zoneId: string) => boolean = () => true
): string | null {
  let best: DropZoneRect | null = null;
  for (const z of zones) {
    const a = area(z.rect);
    if (a === 0) continue;
    if (x < z.rect.left || x > z.rect.right || y < z.rect.top || y > z.rect.bottom) continue;
    if (!accepts(z.id)) continue;
    if (!best || a < area(best.rect)) best = z;
  }
  return best ? best.id : null;
}

/** Początek przeciągania: wskaźnik wciśnięty na elemencie. */
export function pressDrag<T extends string>(itemId: T, x: number, y: number): PointerDragState<T> {
  return { itemId, startX: x, startY: y, x, y, moved: false, overZone: null };
}

/** Ruch wskaźnika: aktualizuje pozycję, próg „to już przeciąganie” i strefę pod kursorem. */
export function moveDrag<T extends string>(
  state: PointerDragState<T>,
  x: number,
  y: number,
  zones: readonly DropZoneRect[],
  accepts: (itemId: T, zoneId: string) => boolean = () => true,
  threshold: number = DEFAULT_DRAG_THRESHOLD
): PointerDragState<T> {
  const moved = state.moved || Math.hypot(x - state.startX, y - state.startY) >= threshold;
  const overZone = moved ? pickDropZone(zones, x, y, (zoneId) => accepts(state.itemId, zoneId)) : null;
  return { ...state, x, y, moved, overZone };
}

/** Puszczenie wskaźnika: co z tego wynika (upuszczenie w strefie, pudło albo stuknięcie). */
export function releaseDrag<T extends string>(
  state: PointerDragState<T>,
  x: number,
  y: number,
  zones: readonly DropZoneRect[],
  accepts: (itemId: T, zoneId: string) => boolean = () => true,
  threshold: number = DEFAULT_DRAG_THRESHOLD
): DragOutcome<T> {
  const last = moveDrag(state, x, y, zones, accepts, threshold);
  if (!last.moved) return { kind: 'tap', itemId: state.itemId, x, y };
  if (last.overZone) return { kind: 'drop', itemId: state.itemId, zoneId: last.overZone, x, y };
  return { kind: 'miss', itemId: state.itemId, x, y };
}
