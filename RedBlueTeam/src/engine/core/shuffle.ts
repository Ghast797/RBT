// Losowa kolejność opcji — wspólna dla klocków i minigier wszystkich misji.
//
// Opcje w danych misji często stoją w stałej kolejności (np. ideal zawsze pierwszy).
// Gracz nie może zgadywać odpowiedzi po pozycji, więc każde wyświetlenie wyboru tasuje opcje.
// Po powtórce misji (`retryFromChoices`) aplikacje montują się od nowa, więc kolejność
// losuje się ponownie i przy powtórce znów trzeba czytać.
// Zob. docs/scenario-engine.md, sekcja 3 („Losowa kolejność opcji”).

import { useState } from 'react';

/** Nowa tablica z elementami w losowej kolejności (Fisher–Yates). Nie zmienia wejścia. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Opcje w kolejności wylosowanej raz przy zamontowaniu komponentu.
 * Kolejność nie zmienia się przy kolejnych renderach ani po zamknięciu i ponownym otwarciu
 * aplikacji (stan zachowuje `AppHost`), a losuje się na nowo dopiero przy powtórce misji.
 */
export function useShuffled<T>(items: readonly T[]): T[] {
  const [state, setState] = useState(() => ({ source: [...items], order: shuffled(items) }));
  // Inny zestaw opcji (np. wariant zależny od wcześniejszego wyboru) → losujemy raz na nowo.
  // Porównanie po elementach, nie po referencji tablicy, żeby tablica tworzona w renderze
  // (np. wynik `filter`) nie losowała się przy każdym renderze.
  const same =
    state.source.length === items.length && state.source.every((item, i) => item === items[i]);
  if (same) return state.order;
  const next = { source: [...items], order: shuffled(items) };
  setState(next);
  return next.order;
}
