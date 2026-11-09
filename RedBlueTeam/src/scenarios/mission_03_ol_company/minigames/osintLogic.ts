// Czysta logika //TOR: PRZEGLĄDARKA (M3): bramka „najpierw rekonesans, potem odpowiedź” i przebieg po decyzji.
// Bez Reacta i DOM-u, żeby dało się ją testować (tests/m3-osint.test.ts). Komponenty: OsintBrowserApp, SiteView.

import type { ChoiceOutcome } from '../../../engine/types/mission';

/** Zakładki strony O&L, które gracz musi przewinąć do końca przed wyborem celu. */
export type SiteTab = 'home' | 'events';

export const SITE_TABS: readonly SiteTab[] = ['home', 'events'];

/** Które zakładki zostały przeczytane (przewinięte do końca). */
export type ReadState = Record<SiteTab, boolean>;

export const INITIAL_READ_STATE: ReadState = { home: false, events: false };

/** Ile pikseli przed samym dołem wciąż liczy się jako „koniec strony” (ułamki pikseli, bezwładność kółka). */
export const END_TOLERANCE_PX = 16;

/** Pomiar przewijanego obszaru (te same pola co w elemencie DOM). */
export interface ScrollMetrics {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
}

/**
 * Czy obszar jest przewinięty do końca. Obszar o zerowej wysokości (ukryty, jeszcze niezmierzony)
 * nie liczy się nigdy. Treść, która mieści się w oknie bez przewijania, jest „na końcu” od razu.
 */
export function isScrolledToEnd(metrics: ScrollMetrics, tolerance: number = END_TOLERANCE_PX): boolean {
  const { scrollTop, clientHeight, scrollHeight } = metrics;
  if (!(clientHeight > 0)) return false;
  return scrollHeight - (scrollTop + clientHeight) <= tolerance;
}

/**
 * Stan „przeczytano” po pomiarze zakładki. Raz przeczytana zakładka zostaje przeczytana
 * (cofnięcie przewijania jej nie odznacza). Gdy nic się nie zmienia, zwraca ten sam obiekt
 * (React nie renderuje ponownie).
 */
export function markTabRead(state: ReadState, tab: SiteTab, atEnd: boolean): ReadState {
  if (!atEnd || state[tab]) return state;
  return { ...state, [tab]: true };
}

/** Czy obie zakładki zostały przewinięte do końca. */
export function allTabsRead(state: ReadState): boolean {
  return SITE_TABS.every((tab) => state[tab]);
}

/** Przejście do wyboru celu: odblokowane dopiero po przeczytaniu obu zakładek. */
export function canProceedToTarget(state: ReadState): boolean {
  return allTabsRead(state);
}

/**
 * Co dalej po zgłoszeniu decyzji: `critical` kończy podejście (silnik pokazuje ekran wykrycia,
 * minigra niczego nie przesuwa), pozostałe poziomy prowadzą do następnego ekranu.
 */
export function afterDecision(tier: ChoiceOutcome): 'continue' | 'stop' {
  return tier === 'critical' ? 'stop' : 'continue';
}
