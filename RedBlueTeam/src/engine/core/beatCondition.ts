// Warunek `when` beatu rozmowy: czysta logika (bez UI), żeby mostek i testy używały jednej reguły.

import type { BeatCondition, DecisionChoice, DecisionCondition } from '../types/mission';

const asList = <T,>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

function decisionMatches(when: DecisionCondition, choices: Record<number, DecisionChoice>): boolean {
  const choice = choices[when.decision];
  if (!choice) return false;
  if (when.optionId !== undefined && (choice.optionId === undefined || !asList(when.optionId).includes(choice.optionId))) {
    return false;
  }
  if (when.tier !== undefined && !asList(when.tier).includes(choice.tier)) return false;
  return true;
}

/**
 * Czy warunek `when` jest spełniony. Brak warunku = pasuje zawsze; decyzja jeszcze niezgłoszona = nie pasuje.
 * `optionId` wymaga znanego `id` wybranej opcji. `{ allOf }` = wszystkie, `{ anyOf }` = którykolwiek.
 */
export function beatMatches(when: BeatCondition | undefined, choices: Record<number, DecisionChoice>): boolean {
  if (!when) return true;
  if ('allOf' in when) return when.allOf.every((c) => decisionMatches(c, choices));
  if ('anyOf' in when) return when.anyOf.some((c) => decisionMatches(c, choices));
  return decisionMatches(when, choices);
}

/** To samo co `beatMatches`, pod nazwą dla minigier (`matchesChoices(warunek, useMissionStore.getState().decisionChoices)`). */
export const matchesChoices = beatMatches;
