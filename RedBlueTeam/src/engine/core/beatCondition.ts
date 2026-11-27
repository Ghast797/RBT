// Warunek `when` (beaty rozmów, konsekwencje, raport): czysta logika (bez UI), jedna reguła dla mostka, minigier i testów.

import type {
  BeatCondition,
  DecisionChoice,
  DecisionCondition,
  LeafCondition,
  RejectedAttempt,
  ScoreCondition
} from '../types/mission';
import { DEFAULT_PASSING_SCORE, scormStatus, roundScore } from './scoring';

const asList = <T,>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

/** Kontekst oceny warunku: wybory, odrzucone próby, wynik i próg zaliczenia. Pola opcjonalne mają bezpieczne domyślne. */
export interface BeatContext {
  choices: Record<number, DecisionChoice>;
  /** Próby odrzucone przez mentora wg numeru decyzji (`rejectedAttempts` ze store). */
  rejected?: Record<number, readonly unknown[]>;
  /** Bieżący wynik misji (%). Bez niego warunek `belowPassing` nie pasuje. */
  score?: number;
  passingScore?: number;
}

/** Zbiera kontekst z gotowego stanu store (`useMissionStore.getState()`) — dla minigier i mostka. */
export function beatContextFrom(state: {
  decisionChoices: Record<number, DecisionChoice>;
  rejectedAttempts?: Record<number, RejectedAttempt[]>;
  score?: number;
  activeMission?: { mission?: { passingScore?: number } };
}): BeatContext {
  return {
    choices: state.decisionChoices,
    rejected: state.rejectedAttempts,
    score: state.score,
    passingScore: state.activeMission?.mission?.passingScore
  };
}

function decisionMatches(when: DecisionCondition, ctx: BeatContext): boolean {
  const choice = ctx.choices[when.decision];
  if (!choice) return false;
  if (when.optionId !== undefined && (choice.optionId === undefined || !asList(when.optionId).includes(choice.optionId))) {
    return false;
  }
  if (when.tier !== undefined && !asList(when.tier).includes(choice.tier)) return false;
  if (when.rejected !== undefined && ((ctx.rejected?.[when.decision]?.length ?? 0) > 0) !== when.rejected) return false;
  return true;
}

function scoreMatches(when: ScoreCondition, ctx: BeatContext): boolean {
  if (ctx.score === undefined) return false;
  const below = scormStatus(roundScore(ctx.score), ctx.passingScore ?? DEFAULT_PASSING_SCORE) === 'failed';
  return below === when.belowPassing;
}

function leafMatches(when: LeafCondition, ctx: BeatContext): boolean {
  return 'belowPassing' in when ? scoreMatches(when, ctx) : decisionMatches(when, ctx);
}

/**
 * Czy warunek `when` jest spełniony. Brak warunku = pasuje zawsze; decyzja jeszcze niezgłoszona = nie pasuje.
 * `optionId` wymaga znanego `id` wybranej opcji; `rejected` porównuje z odrzuconymi próbami decyzji;
 * `{ belowPassing }` porównuje wynik z progiem. `{ allOf }` = wszystkie, `{ anyOf }` = którykolwiek.
 * Elementy grup mogą być dowolnymi warunkami, w tym kolejnymi grupami (zagnieżdżanie rekurencyjne).
 */
export function beatMatches(when: BeatCondition | undefined, ctx: BeatContext): boolean {
  if (!when) return true;
  if ('allOf' in when) return when.allOf.every((c) => beatMatches(c, ctx));
  if ('anyOf' in when) return when.anyOf.some((c) => beatMatches(c, ctx));
  return leafMatches(when, ctx);
}

/** To samo co `beatMatches`, pod nazwą dla minigier (`matchesChoices(warunek, beatContextFrom(useMissionStore.getState()))`). */
export const matchesChoices = beatMatches;
