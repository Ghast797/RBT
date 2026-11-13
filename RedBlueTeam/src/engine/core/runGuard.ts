/**
 * Zabezpieczenia przed „duchami” poprzedniego podejścia do misji: opóźnione
 * callbacki klocka nie mogą zmieniać stanu nowego podejścia po powtórce.
 */

/** Opakowuje callback tak, by był ignorowany, gdy bieżący run różni się od zapamiętanego. */
export function guardByRun<A extends unknown[]>(
  getCurrentRunId: () => number,
  capturedRunId: number,
  fn: (...args: A) => void
): (...args: A) => void {
  return (...args: A) => {
    if (getCurrentRunId() !== capturedRunId) return;
    fn(...args);
  };
}

/** Zbiór timerów do jednorazowego sprzątnięcia (cleanup `useEffect` przy odmontowaniu). */
export function createTimerBag() {
  let ids: ReturnType<typeof setTimeout>[] = [];
  return {
    later(fn: () => void, ms: number) {
      ids.push(setTimeout(fn, ms));
    },
    clear() {
      ids.forEach(clearTimeout);
      ids = [];
    }
  };
}
