// Czysta logika //DYSK E: PENDRIVE (bez UI): dopasowanie pliku do planu D3 i agregacja poziomu D4.
// D4 jest jedną pozycją raportu, ale składa się z dwóch kroków (nazwa dysku, podpis na kopercie):
// jej poziom to GORSZY z dwóch. Zob. docs/rebuild-plan.md, sekcja 3.3.

import type { ChoiceOutcome, DecisionReport } from '../../../engine/types/mission';
import { buildReport, reportAnswerOf } from './report';
import type { GradedDecision, ReportableOption, UsbAttachment, UsbPlanRule, UsbState } from './types';

/** Waga poziomu: im wyższa, tym gorszy. */
export const TIER_RANK: Record<ChoiceOutcome, number> = { ideal: 0, suboptimal: 1, critical: 2 };

/** Gorszy z dwóch poziomów. */
export function worseTier(a: ChoiceOutcome, b: ChoiceOutcome): ChoiceOutcome {
  return TIER_RANK[b] > TIER_RANK[a] ? b : a;
}

/** Odpowiedź gracza w decyzji o danym numerze (z `playerChoices`) albo `undefined`. */
export function planAnswerFromChoices(
  choices: ReadonlyArray<{ num: number; answer: string }>,
  decisionNum: number
): string | undefined {
  return choices.find((c) => c.num === decisionNum)?.answer;
}

/**
 * Reguła planu dla odpowiedzi D3. Gdy odpowiedzi brak (np. tryb deweloperski) albo nie pasuje do żadnej reguły,
 * obowiązuje reguła opcji zapasowej.
 */
export function resolvePlanRule(
  plan: readonly UsbPlanRule[],
  fallbackVectorOptionId: string,
  answer: string | undefined
): UsbPlanRule | undefined {
  return (
    (answer !== undefined ? plan.find((r) => r.answer === answer) : undefined) ??
    plan.find((r) => r.vectorOptionId === fallbackVectorOptionId)
  );
}

/** Czy plik wolno wgrać na pendrive'a przy tej regule planu. */
export function fileMatchesPlan(rule: UsbPlanRule | undefined, fileId: string): boolean {
  return !!rule && rule.fileIds.includes(fileId);
}

/** Wynik agregacji D4: poziom, feedback gorszego kroku (przy remisie: podpisu) i odpowiedź do raportu. */
export interface D4Outcome {
  tier: ChoiceOutcome;
  feedback: string;
  answer: string;
  /** Który krok wyznaczył poziom. */
  source: 'volume' | 'signature';
}

/** Agregacja D4: poziom = gorszy z kroków nazwy i podpisu; odpowiedź w raporcie to podpis. */
export function aggregateD4(volume: ReportableOption, signature: ReportableOption): D4Outcome {
  const volumeWorse = TIER_RANK[volume.tier] > TIER_RANK[signature.tier];
  const source = volumeWorse ? volume : signature;
  return {
    tier: source.tier,
    feedback: source.feedback,
    answer: reportAnswerOf(signature),
    source: volumeWorse ? 'volume' : 'signature'
  };
}

/** Raport D4 zgłaszany przy „WYSUŃ PAMIĘĆ USB” (po wyborze nazwy i podpisu). */
export function buildD4Report(
  decision: Pick<GradedDecision, 'decisionNum' | 'question'>,
  volume: ReportableOption,
  signature: ReportableOption
): DecisionReport {
  const outcome = aggregateD4(volume, signature);
  return buildReport(decision, signature, {
    tier: outcome.tier,
    feedback: outcome.feedback,
    answer: outcome.answer
  });
}

/**
 * Raport D4 zgłaszany od razu po zatwierdzeniu nazwy, gdy ta jest `critical` (np. `KEYLOGGER`):
 * `answer` to `reportAnswer` nazwy („NAZWA DYSKU: KEYLOGGER”). Dla nazwy niekrytycznej zwraca `null`
 * (D4 poczeka na podpis).
 */
export function buildVolumeCriticalReport(
  decision: Pick<GradedDecision, 'decisionNum' | 'question'>,
  volume: ReportableOption
): DecisionReport | null {
  return volume.tier === 'critical' ? buildReport(decision, volume) : null;
}

/** Stan nośnika zapisywany do `customState.m3_usb` (czytają //DRON i //WIRUS: RAT). */
export function buildUsbState(
  volume: ReportableOption,
  attachment: Pick<UsbAttachment, 'archive'>,
  signature: ReportableOption
): UsbState {
  return { volume: volume.label, archive: attachment.archive, signature: signature.label };
}
