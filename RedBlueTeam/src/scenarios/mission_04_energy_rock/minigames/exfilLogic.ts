// Czysta logika D8 (eksfiltracja): poziom z liczby celów (t) i pozostałych plików (f), odpowiedź do raportu.
// Reguły: docs/rebuild-plan.md, sekcja 3.5 (P5). Interfejs nie ocenia wyboru, ocenia tylko ta funkcja.

import type { ChoiceOutcome, DecisionReport } from '../../../engine/types/mission';
import type { C2Config, ExfilFile } from './types';

export interface ExfilCounts {
  /** Liczba wybranych plików `target`. */
  t: number;
  /** Liczba pozostałych wybranych plików. */
  f: number;
}

export const MAX_LISTED_NAMES = 3;

export function countSelection(files: readonly ExfilFile[], selected: readonly string[]): ExfilCounts {
  const chosen = new Set(selected);
  let t = 0;
  let f = 0;
  for (const file of files) {
    if (!chosen.has(file.id)) continue;
    if (file.role === 'target') t++;
    else f++;
  }
  return { t, f };
}

export function exfilTier({ t, f }: ExfilCounts, requiredTargets: number): ChoiceOutcome {
  if (t === 0) return 'critical';
  if (t >= requiredTargets && f === 0) return 'ideal';
  return 'suboptimal';
}

/** Lista nazw wybranych plików (maks. 3, dalej „…”), w kolejności configu. */
export function listNames(files: readonly ExfilFile[], selected: readonly string[]): string {
  const chosen = new Set(selected);
  const names = files.filter((x) => chosen.has(x.id)).map((x) => x.name);
  const head = names.slice(0, MAX_LISTED_NAMES).join(', ');
  return names.length > MAX_LISTED_NAMES ? `${head}, …` : head;
}

export function buildExfilReport(exfil: C2Config['exfil'], selected: readonly string[]): DecisionReport {
  const tier = exfilTier(countSelection(exfil.files, selected), exfil.requiredTargets);
  return {
    num: exfil.decisionNum,
    question: exfil.question,
    answer: tier === 'ideal' ? exfil.answers.ideal : listNames(exfil.files, selected),
    tier,
    feedback: exfil.feedback[tier]
  };
}
