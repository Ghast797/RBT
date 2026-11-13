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

/** Domyślny próg zaliczenia (%), gdy misja nie ustawia `passingScore`. */
export const DEFAULT_PASSING_SCORE = 70;

/** Wynik do zapisu i porównań z progiem: 2 miejsca po przecinku (bez ułamków float). */
export function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}

/** Wynik do wyświetlania graczowi: liczba całkowita. */
export function displayScore(score: number): number {
  return Math.round(score);
}

/**
 * Status SCORM na podstawie wyniku i progu zaliczenia. Porównuje wynik wyświetlany
 * graczowi (`displayScore`), więc „70%” na ekranie zawsze znaczy zaliczenie przy progu 70.
 */
export function scormStatus(scorePercent: number, passingScore: number): 'passed' | 'failed' {
  return displayScore(scorePercent) >= passingScore ? 'passed' : 'failed';
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

/**
 * Łączna kara za jedną decyzję: kara za ostateczny poziom (jeśli decyzja zamknięta) plus kary za próby
 * odrzucone przez mentora (B2), z limitem równym udziałowi decyzji (tyle co `critical`).
 *
 * Każda odrzucona próba kosztuje pół udziału (jak `suboptimal`), niezależnie od poziomu opcji — mentor
 * wyłapał błąd, zanim zaszkodził operacji (decyzja właściciela, P2).
 */
export function decisionPenalty(
  finalTier: ChoiceOutcome | undefined,
  rejectedTiers: readonly ChoiceOutcome[],
  maxScore: number,
  decisionCount: number
): number {
  const share = decisionShare(maxScore, decisionCount);
  const final = finalTier ? penaltyForTier(finalTier, maxScore, decisionCount) : 0;
  const rejected = rejectedTiers.length * penaltyForTier('suboptimal', maxScore, decisionCount);
  return Math.min(share, final + rejected);
}

/** Wynik misji: max − Σ kar za decyzje (zamknięte i odrzucone próby), nie mniej niż 0. */
export function scoreFromDecisions(
  tiers: Record<number, ChoiceOutcome>,
  rejected: Record<number, readonly { tier: ChoiceOutcome }[]>,
  maxScore: number,
  decisionCount: number
): number {
  const nums = new Set<number>([...Object.keys(tiers), ...Object.keys(rejected)].map(Number));
  let total = 0;
  nums.forEach((n) => {
    total += decisionPenalty(tiers[n], (rejected[n] || []).map((r) => r.tier), maxScore, decisionCount);
  });
  return Math.max(0, maxScore - total);
}

/**
 * Poziom decyzji do liczników raportu (IDEALNE / DOBRE / WPADKI): decyzja z odrzuconą próbą (B2) i ostatecznie
 * idealnym wyborem liczy się jak `suboptimal`, bo kara za próbę obniżyła wynik. Sam wynik liczy `scoreFromDecisions`.
 */
export function countedTier(finalTier: ChoiceOutcome, hadRejectedAttempts: boolean): ChoiceOutcome {
  return finalTier === 'ideal' && hadRejectedAttempts ? 'suboptimal' : finalTier;
}
