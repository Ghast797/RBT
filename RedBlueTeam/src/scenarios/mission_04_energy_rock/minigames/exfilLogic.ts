// Czysta logika D8 (eksfiltracja): poziom z liczby celów (t) i pozostałych plików (f), odpowiedź do raportu.
// Reguły: docs/rebuild-plan.md, sekcja 3.5 (P5). Interfejs nie ocenia wyboru, ocenia tylko ta funkcja.

import { matchesChoices } from '../../../engine/core/beatCondition';
import type { ChoiceOutcome, DecisionChoice, DecisionReport } from '../../../engine/types/mission';
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
    feedback: exfil.feedback[tier],
    ...(tier === 'critical' && exfil.failTitle ? { failTitle: exfil.failTitle } : {}),
    ...(tier === 'critical' && exfil.failText ? { failText: exfil.failText } : {})
  };
}

/** Zaznaczenie pliku: dodanie ponad limit (`max`) jest ignorowane, usunięcie zawsze działa. */
export function applySelection(selected: readonly string[], id: string, inField: boolean, max: number): string[] {
  if (!inField) return selected.filter((x) => x !== id);
  if (selected.includes(id) || selected.length >= max) return [...selected];
  return [...selected, id];
}

/** Zatwierdzić można dopiero przy dokładnie `required` plikach. */
export const canConfirmExfil = (selected: readonly string[], required: number): boolean => selected.length === required;

export const exfilCounterText = (label: string, selected: readonly string[], required: number): string =>
  `${label} ${selected.length}/${required}`;

/** Ekran startowy C2: status i dopiski o słabszych wyborach D5–D7 (z pamięci wyborów); ideał = status bez dopisków. */
export function c2StartInfo(
  start: C2Config['start'],
  choices: Record<number, DecisionChoice>
): { status: string; notes: string[] } {
  const notes = (start.delayNotes ?? []).filter((n) => matchesChoices(n.when, choices)).map((n) => n.text);
  return { status: notes.length > 0 && start.statusDelayed ? start.statusDelayed : start.status, notes };
}
