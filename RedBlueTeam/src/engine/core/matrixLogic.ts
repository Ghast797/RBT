// Logika zdrapki (klocek ScratchMatrix: M3 i M4, scena „matryca kompilacji”) — czysta, bez UI, żeby dało się ją przetestować.
//
// Pole zdrapki to siatka komórek (domyślnie 64×36, kwadratowe komórki przy proporcjach 16:9).
// Pociągnięcie kursorem zaznacza komórki w kole wokół punktu jako odsłonięte. Postęp to odsłonięta część
// pola podzielona przez `revealThreshold` (z configu): przy progu 0,92 pasek dochodzi do 100% już po
// odsłonięciu 92% pola, więc gracz nie musi szukać ostatnich pikseli. Współrzędne punktów są
// znormalizowane do pola: x i y w zakresie 0..1.

/** Siatka odsłaniania: `cells[i] = 1` oznacza odsłoniętą komórkę. */
export interface RevealGrid {
  cols: number;
  rows: number;
  cells: Uint8Array;
}

export interface NormPoint {
  x: number;
  y: number;
}

/** Domyślna siatka (16:9, kwadratowe komórki). */
export const GRID_COLS = 64;
export const GRID_ROWS = 36;

export function createGrid(cols: number = GRID_COLS, rows: number = GRID_ROWS): RevealGrid {
  return { cols, rows, cells: new Uint8Array(cols * rows) };
}

/** Liczba odsłoniętych komórek. */
export function revealedCount(grid: RevealGrid): number {
  let n = 0;
  for (let i = 0; i < grid.cells.length; i++) n += grid.cells[i];
  return n;
}

/** Odsłonięta część pola, 0..1. */
export function revealedFraction(grid: RevealGrid): number {
  return grid.cells.length === 0 ? 0 : revealedCount(grid) / grid.cells.length;
}

/**
 * Odsłania komórki, których środki leżą w kole o środku `center` i promieniu `radius`.
 * Promień jest ułamkiem SZEROKOŚCI pola (pole ma proporcje `cols : rows`, więc koło na ekranie jest kołem).
 * Zwraca liczbę nowo odsłoniętych komórek.
 */
export function revealDisc(grid: RevealGrid, center: NormPoint, radius: number): number {
  const { cols, rows, cells } = grid;
  // Przeliczenie na jednostki komórek (komórka jest kwadratem).
  const cx = center.x * cols;
  const cy = center.y * rows;
  const r = radius * cols;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(cols - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(rows - 1, Math.ceil(cy + r));
  const r2 = r * r;
  let added = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r2) {
        const i = y * cols + x;
        if (cells[i] === 0) {
          cells[i] = 1;
          added++;
        }
      }
    }
  }
  return added;
}

/**
 * Odsłania pas wzdłuż odcinka `from` → `to` (koła co najwyżej co ćwierć promienia, żeby pociągnięcie
 * nie zostawiało dziur nawet przy szybkim ruchu myszy). Zwraca liczbę nowo odsłoniętych komórek.
 */
export function revealStroke(grid: RevealGrid, from: NormPoint, to: NormPoint, radius: number): number {
  // Długość odcinka w jednostkach komórek (komórka = kwadrat).
  const lenCells = Math.hypot((to.x - from.x) * grid.cols, (to.y - from.y) * grid.rows);
  const step = Math.max(0.5, (radius * grid.cols) / 4);
  const n = Math.max(1, Math.ceil(lenCells / step));
  let added = 0;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    added += revealDisc(
      grid,
      { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t },
      radius
    );
  }
  return added;
}

/** Postęp matrycy 0..1: odsłonięta część pola względem progu (`revealThreshold`). */
export function matrixProgress(fraction: number, revealThreshold: number): number {
  if (!(revealThreshold > 0)) return fraction > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, fraction / revealThreshold));
}

/** Czy matryca jest gotowa (pasek na 100%). */
export function isMatrixComplete(fraction: number, revealThreshold: number): boolean {
  return matrixProgress(fraction, revealThreshold) >= 1;
}

/** Ile segmentów paska jest zapalonych przy danym postępie (0..segments). Segment zapala się, gdy postęp go w całości wypełni. */
export function litSegments(progress: number, segments: number): number {
  if (segments <= 0) return 0;
  if (progress >= 1) return segments;
  // Mała poprawka na błędy zmiennoprzecinkowe (0,3 * 10 = 2,9999…).
  return Math.max(0, Math.min(segments, Math.floor(progress * segments + 1e-9)));
}

/** Widok zdrapki wyprowadzony z jednego źródła (odsłonięta część pola + próg): pasek, podpisy i „gotowe” zawsze zgodne. */
export interface MatrixView {
  /** Postęp 0..1 względem progu. */
  progress: number;
  /** Zdrapka zakończona: pasek 100%, wszystkie podpisy zapalone, komunikat „gotowy”. */
  complete: boolean;
  segmentsLit: number;
  partsLit: number;
  /** Procent na pasku (99 maks. przed końcem, żeby nie pokazać „100%” przedwcześnie). */
  percent: number;
}

/**
 * Jedno miejsce, z którego liczą się pasek, cztery podpisy i komunikat końcowy. Po przekroczeniu progu
 * zdrapka jest domknięta (wszystko zapalone naraz), więc „WIRUS GOTOWY!” nigdy nie pojawia się przy niezapalonym podpisie.
 */
export function matrixView(fraction: number, revealThreshold: number, segments: number, partCount: number): MatrixView {
  const progress = matrixProgress(fraction, revealThreshold);
  const complete = isMatrixComplete(fraction, revealThreshold);
  return {
    progress,
    complete,
    segmentsLit: complete ? segments : litSegments(progress, segments),
    partsLit: complete ? partCount : Math.min(partCount - 1, litParts(progress, partCount)),
    percent: complete ? 100 : Math.min(99, Math.floor(progress * 100))
  };
}

/** Ile z `partCount` podpisanych części jest zapalonych: część k (od 1) zapala się przy postępie k/partCount, ostatnia przy 100%. */
export function litParts(progress: number, partCount: number): number {
  return litSegments(progress, partCount);
}
