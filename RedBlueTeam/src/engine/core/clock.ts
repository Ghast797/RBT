// Czysta logika zegara przeskoku czasu (`TimeJump`): parsowanie godzin „HH:MM”,
// przewijanie w przód przez północ i położenie wskazówek. Bez Reacta i bez DOM —
// testowane w tests/clock.test.ts. Zob. docs/scenario-engine.md, sekcja 5.

export const MINUTES_PER_DAY = 24 * 60;

/** Ile godzin wstecz od godziny docelowej zaczyna się przeskok, gdy nie znamy godziny startowej. */
export const DEFAULT_JUMP_HOURS = 3;

/** „HH:MM” albo „H:MM” → minuty od północy (0–1439). Zły format lub zakres → `null`. */
export function parseClock(value: string | undefined | null): number | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Minuty od północy (także ułamkowe i spoza doby) → „HH:MM”; minuty zaokrąglane w dół, doba zawija się. */
export function formatClock(minutes: number): string {
  const wrapped = ((Math.floor(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Ile minut płynie czas od `from` do `to` — zawsze w przód, przez północ, jeśli trzeba
 * (`22:15 → 06:02` = 467 min). Ta sama godzina = 0 (zegar stoi).
 */
export function forwardSpanMinutes(from: number, to: number): number {
  return (((to - from) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Krzywa przyspieszenia i zwalniania (ease-in-out, sześcienna); `t` obcinane do 0–1. */
export function easeInOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Godzina w chwili `t` (0–1) przeskoku od `from` do `to`, w minutach od północy
 * (ułamkowych, 0 ≤ wynik < 1440). Czas biegnie krzywą `easeInOut`; w `t = 1` wynik to dokładnie `to`.
 */
export function clockAt(from: number, to: number, t: number): number {
  const span = forwardSpanMinutes(from, to);
  const x = (from + span * easeInOut(t)) % MINUTES_PER_DAY;
  return x;
}

/** Ile pełnych godzin zegarowych minęło od startu do `t` (do cichego „tyku” co godzinę). */
export function hoursElapsed(from: number, to: number, t: number): number {
  const span = forwardSpanMinutes(from, to);
  const now = from + span * easeInOut(t);
  return Math.floor(now / 60) - Math.floor(from / 60);
}

/** Kąty wskazówek tarczy (stopnie, 0 = godzina 12) dla minut od północy. */
export function handAngles(minutes: number): { hour: number; minute: number } {
  return {
    hour: ((minutes / 60) % 12) * 30,
    minute: (minutes % 60) * 6
  };
}

export interface ResolvedJumpClock {
  /** Minuty od północy, od których startuje zegar. */
  from: number;
  /** Minuty od północy, na których zegar się zatrzymuje. */
  to: number;
}

/**
 * Zamienia godziny z danych na parę liczb. `to` zły lub brak → `null` (wariant bez cyfr).
 * `from` zły lub brak → `to` minus `DEFAULT_JUMP_HOURS` (silnik podstawia zwykle `systemTime`
 * jeszcze w store, więc to tylko siatka bezpieczeństwa).
 */
export function resolveJumpClock(
  clockFrom: string | undefined | null,
  clockTo: string | undefined | null
): ResolvedJumpClock | null {
  const to = parseClock(clockTo);
  if (to === null) return null;
  const from = parseClock(clockFrom);
  return {
    to,
    from: from ?? (((to - DEFAULT_JUMP_HOURS * 60) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  };
}
