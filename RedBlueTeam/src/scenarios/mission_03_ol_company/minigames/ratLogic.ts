// Czysta logika kopiowania plików FREEVOLT na pulpit hakera (porcja G, bez Reacta; test: tests/m3-rat.test.ts).

/** Postęp kopiowania plików: id pliku -> procent 0..100. Brak klucza = plik jeszcze nie przeciągnięty. */
export type CopyProgress = Record<string, number>;

/** Krok postępu na tyknięcie zegara (przy tyknięciu 90 ms kopiowanie trwa ok. 0,9 s). */
export const COPY_STEP = 10;
export const COPY_TICK_MS = 90;

/** Rozpoczyna kopiowanie pliku; plik już kopiowany lub skopiowany zostaje bez zmian. */
export function startCopy(progress: CopyProgress, id: string): CopyProgress {
  return id in progress ? progress : { ...progress, [id]: 0 };
}

/** Przesuwa wszystkie trwające kopiowania o jeden krok (maks. 100). Zwraca ten sam obiekt, gdy nic się nie dzieje. */
export function tickCopies(progress: CopyProgress, step: number = COPY_STEP): CopyProgress {
  let changed = false;
  const next: CopyProgress = {};
  for (const [id, p] of Object.entries(progress)) {
    if (p < 100) {
      next[id] = Math.min(100, p + step);
      changed = true;
    } else {
      next[id] = p;
    }
  }
  return changed ? next : progress;
}

export const isCopied = (progress: CopyProgress, id: string): boolean => progress[id] >= 100;
export const isCopying = (progress: CopyProgress, id: string): boolean => id in progress && progress[id] < 100;
export const hasActiveCopies = (progress: CopyProgress): boolean => Object.values(progress).some((p) => p < 100);

/** Czy wszystkie podane pliki są w całości skopiowane. */
export function allCopied(progress: CopyProgress, ids: readonly string[]): boolean {
  return ids.length > 0 && ids.every((id) => isCopied(progress, id));
}
