// Zgłaszanie decyzji M3: wspólna, czysta logika (bez UI), żeby każda minigra budowała raport tak samo.

import type { DecisionReport } from '../../../engine/types/mission';
import type { GradedDecision, ReportableOption } from './types';

/** Odpowiedź w raporcie: `reportAnswer` opcji albo jej etykieta. */
export const reportAnswerOf = (option: ReportableOption): string => option.reportAnswer ?? option.label;

/**
 * Raport decyzji dla `onDecision`. Poziom i feedback pochodzą z opcji, pytanie i numer z decyzji;
 * `tier` można nadpisać (np. D4: poziom = najgorszy z dwóch kroków) razem z `feedback` i `answer`.
 */
export function buildReport(
  decision: Pick<GradedDecision, 'decisionNum' | 'question'>,
  option: ReportableOption,
  overrides: Partial<Pick<DecisionReport, 'tier' | 'feedback' | 'answer'>> = {}
): DecisionReport {
  return {
    num: decision.decisionNum,
    question: decision.question,
    answer: overrides.answer ?? reportAnswerOf(option),
    tier: overrides.tier ?? option.tier,
    feedback: overrides.feedback ?? option.feedback
  };
}
