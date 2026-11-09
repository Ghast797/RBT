// Logika wyboru celu D2 w //TOR: PRZEGLĄDARKA — czysta funkcja, bez UI i bez store'a,
// żeby małe rozgałęzienie (zły cel → pushback mentora → ponowny wybór) dało się testować.
// Spec: docs/migration-spec.md, sekcja 2.

import type { ChoiceOption, ChoiceOutcome } from '../../../engine/types/mission';

export type TargetPickResult =
  /** CISO: wykrycie od razu, bez ponownego wyboru. */
  | { kind: 'critical' }
  /** CEO / Logistyka: decyzji jeszcze nie zgłaszamy, mentor odsyła do ponownego wyboru. */
  | { kind: 'retry'; pushback: string }
  /** Poprawny cel: zgłaszamy D2 z poziomem zagregowanym po wcześniejszych próbach. */
  | { kind: 'proceed'; tier: Exclude<ChoiceOutcome, 'critical'> };

/**
 * Rozstrzyga potwierdzenie celu. `attempted` = gracz wcześniej wybrał zły (suboptimal) cel.
 * Końcowy poziom D2 to najgorszy wybór na ścieżce (agregacja jak w `DialogueTree`):
 * poprawny cel po złej próbie liczy się jako `suboptimal`.
 */
export function resolveTargetPick(option: ChoiceOption, attempted: boolean): TargetPickResult {
  if (option.tier === 'critical') return { kind: 'critical' };
  if (option.tier === 'suboptimal') return { kind: 'retry', pushback: option.feedback };
  return { kind: 'proceed', tier: attempted ? 'suboptimal' : 'ideal' };
}

/** Treść karty celu D2: nazwisko z rolą (etykieta opcji) i neutralny opis opcji. */
export interface TargetCardContent {
  title: string;
  desc?: string;
}

/**
 * Co faktycznie trafia na kartę celu. Bio z OSINT nie jest częścią karty: gracz czyta je
 * w panelu prawego monitora po zaznaczeniu karty (jak PRZECZYTAJ na stronie) i sam decyduje.
 */
export function targetCardContent(option: ChoiceOption): TargetCardContent {
  return { title: option.label, desc: option.desc };
}
