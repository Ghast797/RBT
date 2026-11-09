// Zgłaszanie decyzji przez minigry misji: wspólna, czysta logika (bez UI), żeby każda minigra budowała raport
// tak samo (M3, M4). Poziom i feedback pochodzą z danych opcji, punkty liczy silnik (core/scoring.ts).

import type { ChoiceOption, DecisionReport } from '../types/mission';

/**
 * Opcja z odpowiedzią do raportu pooperacyjnego. `onDecision.answer` = `reportAnswer ?? label`
 * (kolumna „Wybór gracza” tabeli debriefu z dokumentu bywa krótsza niż etykieta na ekranie).
 */
export interface ReportableOption extends ChoiceOption {
  reportAnswer?: string;
}

/** To, czego raport potrzebuje od ocenianej decyzji: numer i pytanie (jedno źródło: ekran = raport). */
export interface ReportableDecision {
  decisionNum: number;
  question: string;
}

/** Odpowiedź w raporcie: `reportAnswer` opcji albo jej etykieta. */
export const reportAnswerOf = (option: ReportableOption): string => option.reportAnswer ?? option.label;

/**
 * Raport decyzji dla `onDecision`. Poziom i feedback pochodzą z opcji, pytanie i numer z decyzji;
 * `tier` można nadpisać (np. poziom = najgorszy z dwóch kroków) razem z `feedback` i `answer`.
 */
export function buildReport(
  decision: ReportableDecision,
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
