// Walidacja buildera ładunku RAT w //BAZA_WIRUSÓW — czysta funkcja, bez UI i bez store'a,
// żeby reguły (zły zestaw blokuje kompilację, poprawny przepuszcza) dało się testować.
// Builder jest aktywnością NIEOCENIANĄ: wynik nie zgłasza decyzji ani wykrycia.
// Spec: docs/migration-spec.md, sekcja 1.

import type { VirusLabConfig } from './types';

export type GroupKey = 'modules' | 'masking' | 'package';

/** Kolejność grup w builderze (i kolejność sprawdzania). */
export const GROUP_KEYS: GroupKey[] = ['modules', 'masking', 'package'];

/** Wybrane opcje (id) per grupa; `null` = nic nie wybrano. */
export type BuilderPick = Record<GroupKey, string | null>;

export const BUILDER_INCOMPLETE_MESSAGE = 'WYBIERZ 3 PARAMETRY PRZED KOMPILACJĄ.';

export type BuilderResult =
  /** Nie wybrano wszystkich trzech parametrów: kompilacja się nie zaczyna. */
  | { kind: 'incomplete'; message: string }
  /** Któryś parametr jest zły (pierwszy w kolejności grup): kompilacja kończy się błędem z feedbackiem opcji. */
  | { kind: 'wrong'; group: GroupKey; message: string }
  /** Poprawny zestaw: ładunek skompilowany. */
  | { kind: 'ok' };

/** Rozstrzyga kompilację ładunku dla wybranych parametrów. */
export function validateBuilder(builder: VirusLabConfig['builder'], picked: BuilderPick): BuilderResult {
  if (!GROUP_KEYS.every((k) => picked[k])) return { kind: 'incomplete', message: BUILDER_INCOMPLETE_MESSAGE };
  for (const group of GROUP_KEYS) {
    const option = builder[group].options.find((o) => o.id === picked[group]);
    if (!option?.correct) {
      return { kind: 'wrong', group, message: `BŁĄD KOMPILACJI: ${option?.feedback ?? 'nieznany parametr.'}` };
    }
  }
  return { kind: 'ok' };
}
