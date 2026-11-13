// Czysta logika //DYSK E: PENDRIVE (bez UI): dopasowanie pliku do planu D3 i agregacja poziomu D4.
// D4 jest jedną pozycją raportu, ale składa się z dwóch kroków (nazwa dysku, podpis na kopercie):
// jej poziom to GORSZY z dwóch. Zob. docs/rebuild-plan.md, sekcja 3.3.

import type { ChoiceOutcome, DecisionReport } from '../../../engine/types/mission';
import { buildReport, reportAnswerOf } from '../../../engine/core/report';
import type { GradedDecision, PendriveConfig, PlanOption, ReportableOption, UsbAttachment, UsbPlanRule, UsbState } from './types';

/** Waga poziomu: im wyższa, tym gorszy. */
export const TIER_RANK: Record<ChoiceOutcome, number> = { ideal: 0, suboptimal: 1, critical: 2 };

/** Gorszy z dwóch poziomów. */
export function worseTier(a: ChoiceOutcome, b: ChoiceOutcome): ChoiceOutcome {
  return TIER_RANK[b] > TIER_RANK[a] ? b : a;
}

/**
 * Reguła planu dla opcji D3 wybranej przez gracza (`customState.m3_plan` = id opcji). Gdy id brak
 * (np. tryb deweloperski) albo nie pasuje do żadnej reguły, obowiązuje reguła opcji zapasowej.
 */
export function resolvePlanRule(
  plan: readonly UsbPlanRule[],
  fallbackVectorOptionId: string,
  vectorOptionId: string | undefined
): UsbPlanRule | undefined {
  return (
    (vectorOptionId !== undefined ? plan.find((r) => r.vectorOptionId === vectorOptionId) : undefined) ??
    plan.find((r) => r.vectorOptionId === fallbackVectorOptionId)
  );
}

/** Czy plik wolno wgrać na pendrive'a przy tej regule planu. */
export function fileMatchesPlan(rule: UsbPlanRule | undefined, fileId: string): boolean {
  return !!rule && rule.fileIds.includes(fileId);
}

/**
 * Opcje kroku D4 dla planu z D3 (`vectorOptionId` reguły planu): odfiltrowane przez `forPlans` i z poziomem
 * oraz feedbackiem z `byPlan[plan]`, gdy istnieje. Bez `byPlan`/`forPlans` opcja przechodzi bez zmian.
 * Jedyne miejsce, w którym ocena D4 zależy od planu (poziom musi pasować do tego, co faktycznie jest na pendrive'ie).
 */
export function resolveOptionsForPlan<O extends PlanOption>(options: readonly O[], planId: string | undefined): O[] {
  return options
    .filter((o) => !o.forPlans || (planId !== undefined && o.forPlans.includes(planId)))
    .map((o) => {
      const variant = planId !== undefined ? o.byPlan?.[planId] : undefined;
      return variant ? { ...o, tier: variant.tier, feedback: variant.feedback } : o;
    });
}

/** Przedrostki odpowiedzi D4 w raporcie (teksty z configu: `pendriveConfig.reportLabels`). */
export type D4ReportLabels = PendriveConfig['reportLabels'];

/** Wynik agregacji D4: poziom, feedback gorszego kroku (przy remisie: podpisu) i odpowiedź do raportu. */
export interface D4Outcome {
  tier: ChoiceOutcome;
  feedback: string;
  answer: string;
  /** Który krok wyznaczył poziom. */
  source: 'volume' | 'signature';
}

/**
 * Agregacja D4: poziom = gorszy z kroków nazwy i podpisu. Odpowiedź w raporcie to podpis, a gdy ocenę
 * obniżyła nazwa dysku (gorsza od podpisu), raport pokazuje obie: `NAZWA DYSKU: X / PODPIS: Y`,
 * żeby gracz widział, co obniżyło ocenę.
 */
export function aggregateD4(
  volume: ReportableOption,
  signature: ReportableOption,
  labels: D4ReportLabels
): D4Outcome {
  const volumeWorse = TIER_RANK[volume.tier] > TIER_RANK[signature.tier];
  const source = volumeWorse ? volume : signature;
  const answer = volumeWorse
    ? `${labels.volume}: ${volume.label} / ${labels.signature}: ${reportAnswerOf(signature)}`
    : reportAnswerOf(signature);
  return {
    tier: source.tier,
    feedback: source.feedback,
    answer,
    source: volumeWorse ? 'volume' : 'signature'
  };
}

/** Raport D4 zgłaszany przy „WYSUŃ PAMIĘĆ USB” (po wyborze nazwy i podpisu). */
export function buildD4Report(
  decision: Pick<GradedDecision, 'decisionNum' | 'question'>,
  volume: ReportableOption,
  signature: ReportableOption,
  labels: D4ReportLabels
): DecisionReport {
  const outcome = aggregateD4(volume, signature, labels);
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
