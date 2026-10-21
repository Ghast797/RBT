// Punktacja misji — jedno miejsce dla wszystkich scenariuszy.
//
// Klocki i minigry NIE liczą punktów. Zgłaszają tylko poziom decyzji
// ('ideal' | 'suboptimal' | 'critical'), a resztę wylicza ten moduł.
// Zob. docs/scenario-engine.md, sekcja 4.

import type { ChoiceOutcome } from '../types/mission';

/** Udział punktowy decyzji nieoptymalnej (część pełnej puli za decyzję). */
export const SUBOPTIMAL_RATIO = 0.5;

/** Ile punktów warta jest jedna decyzja w misji o `maxScore` i `decisionCount` decyzjach. */
export function decisionShare(maxScore: number, decisionCount: number): number {
  if (decisionCount <= 0) return 0;
  return maxScore / decisionCount;
}

/** Ile punktów gracz zdobywa za decyzję na danym poziomie. */
export function pointsForTier(
  tier: ChoiceOutcome,
  maxScore: number,
  decisionCount: number,
  suboptimalRatio: number = SUBOPTIMAL_RATIO
): number {
  const share = decisionShare(maxScore, decisionCount);
  switch (tier) {
    case 'ideal':
      return share;
    case 'suboptimal':
      return share * suboptimalRatio;
    case 'critical':
      return 0;
  }
}

/** Ile punktów gracz traci za decyzję na danym poziomie (dopełnienie do pełnej puli). */
export function penaltyForTier(
  tier: ChoiceOutcome,
  maxScore: number,
  decisionCount: number,
  suboptimalRatio: number = SUBOPTIMAL_RATIO
): number {
  const share = decisionShare(maxScore, decisionCount);
  return share - pointsForTier(tier, maxScore, decisionCount, suboptimalRatio);
}

/** Nagroda BTC skalowana liniowo wynikiem procentowym. */
export function btcForScore(scorePercent: number, rewardBtc: number): number {
  const ratio = Math.max(0, Math.min(1, scorePercent / 100));
  return +(rewardBtc * ratio).toFixed(2);
}

/** Status SCORM na podstawie wyniku i progu zaliczenia. */
export function scormStatus(scorePercent: number, passingScore: number): 'passed' | 'failed' {
  return scorePercent >= passingScore ? 'passed' : 'failed';
}

/**
 * Liczba ocenianych decyzji w misji — podstawa podziału punktów.
 *
 * Kolejność: jawne `decisionCount`, potem liczba pozycji debriefu (autorytatywna
 * suma dla całej misji), a liczba decyzji w etapach dopiero na końcu — w trakcie
 * częściowej migracji etapy pokrywają tylko część decyzji.
 */
export function resolveDecisionCount(mission: any): number {
  const explicit = mission?.mission?.decisionCount;
  if (typeof explicit === 'number' && explicit > 0) return explicit;

  const fromDebrief = mission?.step6?.choices?.length;
  if (typeof fromDebrief === 'number' && fromDebrief > 0) return fromDebrief;

  const fromStages = (mission?.stages || []).reduce(
    (sum: number, stage: any) => sum + (stage?.decisions?.length || 0),
    0
  );
  return fromStages > 0 ? fromStages : 1;
}
