// Zgłaszanie decyzji przez minigry misji: wspólna, czysta logika (bez UI), żeby każda minigra budowała raport
// tak samo (M3, M4). Poziom i feedback pochodzą z danych opcji, punkty liczy silnik (core/scoring.ts).

import type { ChoiceOption, ChoiceOutcome, DecisionReport, DecisionRejection } from '../types/mission';

/**
 * Opcja z odpowiedzią do raportu pooperacyjnego. `onDecision.answer` = `reportAnswer ?? label`
 * (kolumna „Wybór gracza” tabeli debriefu z dokumentu bywa krótsza niż etykieta na ekranie).
 */
export interface ReportableOption extends ChoiceOption {
  reportAnswer?: string;
}

/** Pola porażki opcji (`failTitle`/`failText`) do raportu — tylko ustawione, tylko dla `critical`. */
export function failFieldsOf(option: Pick<ChoiceOption, 'failTitle' | 'failText'>, tier: ChoiceOutcome): Pick<DecisionReport, 'failTitle' | 'failText'> {
  if (tier !== 'critical') return {};
  return {
    ...(option.failTitle ? { failTitle: option.failTitle } : {}),
    ...(option.failText ? { failText: option.failText } : {})
  };
}

/**
 * Zatwierdzenie opcji przez minigrę: opcja z `reject` idzie do `rejectDecision` (B2: kara, decyzja otwarta),
 * pozostałe do `onDecision`. Zwraca `'rejected'`, gdy minigra ma zostać na ekranie wyboru i odblokować wybór.
 */
export function submitDecision(
  decision: ReportableDecision,
  option: ReportableOption,
  handlers: { onDecision: (r: DecisionReport) => void; rejectDecision: (r: DecisionRejection) => void },
  overrides: Partial<Pick<DecisionReport, 'tier' | 'feedback' | 'answer'>> = {}
): 'rejected' | 'reported' {
  const rejection = buildRejection(decision, option);
  if (rejection) {
    handlers.rejectDecision(rejection);
    return 'rejected';
  }
  handlers.onDecision(buildReport(decision, option, overrides));
  return 'reported';
}

/** Odrzucenie opcji przez mentora (B2) do `rejectDecision`; `null`, gdy opcja nie ma `reject`. */
export function buildRejection(decision: ReportableDecision, option: ReportableOption): DecisionRejection | null {
  if (!option.reject) return null;
  return {
    num: decision.decisionNum,
    question: decision.question,
    optionId: option.id,
    answer: reportAnswerOf(option),
    tier: option.tier,
    mentorLine: option.reject.mentorLine
  };
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
    feedback: overrides.feedback ?? option.feedback,
    ...failFieldsOf(option, overrides.tier ?? option.tier)
  };
}
