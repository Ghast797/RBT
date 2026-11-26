// Warunek `when` beatu rozmowy: czysta logika (bez UI), żeby mostek i testy używały jednej reguły.

import type { BeatCondition, DecisionChoice } from '../types/mission';

const asList = <T,>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

/**
 * Czy beat z warunkiem `when` ma zagrać. Brak warunku = gra zawsze; decyzja jeszcze niezgłoszona = nie gra.
 * `optionId` wymaga znanego `id` wybranej opcji (decyzja zgłoszona bez `optionId` nie pasuje).
 */
export function beatMatches(when: BeatCondition | undefined, choices: Record<number, DecisionChoice>): boolean {
  if (!when) return true;
  const choice = choices[when.decision];
  if (!choice) return false;
  if (when.optionId !== undefined && (choice.optionId === undefined || !asList(when.optionId).includes(choice.optionId))) {
    return false;
  }
  if (when.tier !== undefined && !asList(when.tier).includes(choice.tier)) return false;
  return true;
}
