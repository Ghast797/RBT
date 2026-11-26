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

/** Liczy się tylko, czy wszystkie cele są w zestawie; nadmiarowe pliki nie obniżają poziomu. */
export function exfilTier({ t }: ExfilCounts, requiredTargets: number): ChoiceOutcome {
  if (t === 0) return 'critical';
  if (t >= requiredTargets) return 'ideal';
  return 'suboptimal';
}

/** Dopisek o nadmiarowych plikach w odpowiedzi raportu: „+ 1 INNY”, „+ 2 INNE”, „+ 5 INNYCH”. */
export function extrasPhrase(f: number): string {
  if (f === 1) return '+ 1 INNY';
  if (f >= 2 && f <= 4) return `+ ${f} INNE`;
  return `+ ${f} INNYCH`;
}

/** Lista nazw wybranych plików (maks. 3, dalej „…”), w kolejności configu. */
export function listNames(files: readonly ExfilFile[], selected: readonly string[]): string {
  const chosen = new Set(selected);
  const names = files.filter((x) => chosen.has(x.id)).map((x) => x.name);
  const head = names.slice(0, MAX_LISTED_NAMES).join(', ');
  return names.length > MAX_LISTED_NAMES ? `${head}, …` : head;
}

export function buildExfilReport(exfil: C2Config['exfil'], selected: readonly string[]): DecisionReport {
  const counts = countSelection(exfil.files, selected);
  const tier = exfilTier(counts, exfil.requiredTargets);
  const answer =
    tier === 'ideal'
      ? counts.f > 0
        ? `${exfil.answers.ideal} ${extrasPhrase(counts.f)}`
        : exfil.answers.ideal
      : listNames(exfil.files, selected);
  return {
    num: exfil.decisionNum,
    question: exfil.question,
    answer,
    tier,
    feedback: exfil.feedback[tier],
    ...(tier === 'critical' && exfil.failTitle ? { failTitle: exfil.failTitle } : {}),
    ...(tier === 'critical' && exfil.failText ? { failText: exfil.failText } : {})
  };
}

/** Zaznaczenie pliku: przeciągnięcie do pola dodaje, wyciągnięcie usuwa. Bez limitu liczby plików. */
export function applySelection(selected: readonly string[], id: string, inField: boolean): string[] {
  if (!inField) return selected.filter((x) => x !== id);
  if (selected.includes(id)) return [...selected];
  return [...selected, id];
}

/** Zatwierdzić można, gdy w polu jest co najmniej jeden plik. */
export const canConfirmExfil = (selected: readonly string[]): boolean => selected.length >= 1;

/** Ekran startowy C2: status i dopiski o słabszych wyborach D5–D7 (z pamięci wyborów); ideał = status bez dopisków. */
export function c2StartInfo(
  start: C2Config['start'],
  choices: Record<number, DecisionChoice>
): { status: string; notes: string[] } {
  const notes = (start.delayNotes ?? []).filter((n) => matchesChoices(n.when, choices)).map((n) => n.text);
  return { status: notes.length > 0 && start.statusDelayed ? start.statusDelayed : start.status, notes };
}
