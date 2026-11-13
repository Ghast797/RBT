// Czysta logika //KREATOR: RANSOMWARE (bez UI): siła hasła, poziom D3, kompletność slotów, odpowiedź do raportu.
// Progi i tabela: docs/rebuild-plan.md, 3.2. Punkty liczy silnik z poziomu decyzji.

import type { ChoiceOutcome, DecisionReport, DecisionRejection } from '../../../engine/types/mission';
import type { NoteConfig, NoteSlotId, NoteTile, PasswordConfig, PasswordTile } from './types';

const TIER_RANK: Record<ChoiceOutcome, number> = { ideal: 0, suboptimal: 1, critical: 2 };

/** Gorszy z dwóch poziomów. */
export const worseTier = (a: ChoiceOutcome, b: ChoiceOutcome): ChoiceOutcome =>
  TIER_RANK[a] >= TIER_RANK[b] ? a : b;

export interface PasswordEvaluation {
  /** Siła 1..5. */
  score: number;
  tier: ChoiceOutcome;
  /** Liczba dozwolonych zestawów znaków w ramce. */
  sets: number;
  length: number;
  hasForbidden: boolean;
}

/** Siła hasła i poziom wg tabeli z planu (3.2) dla wybranych kafelków i długości. */
export function evaluatePassword(config: PasswordConfig, selectedIds: readonly string[], length: number): PasswordEvaluation {
  const chosen = config.tiles.filter((t) => selectedIds.includes(t.id));
  const hasForbidden = chosen.some((t) => t.forbidden);
  const sets = chosen.filter((t) => !t.forbidden).length;
  let score: number;
  if (hasForbidden) score = 1;
  else if (length <= config.criticalLength) score = 2;
  else if (length >= config.idealLength && sets >= config.idealSets) score = 5;
  else if ((length >= config.idealLength - 5 && sets >= config.idealSets) || (length >= config.idealLength && sets === config.idealSets - 1)) score = 4;
  else score = 3;
  const tier: ChoiceOutcome = score <= 2 ? 'critical' : score === 5 ? 'ideal' : 'suboptimal';
  return { score, tier, sets, length, hasForbidden };
}

/** Raport D2: odpowiedź z szablonu `{score}/{length}/{sets}` (dla ideal gotowy tekst), feedback wg poziomu. */
export function buildPasswordReport(config: PasswordConfig, ev: PasswordEvaluation): DecisionReport {
  const answer =
    ev.tier === 'ideal'
      ? config.answers.ideal
      : config.answers.other
          .replace('{score}', String(ev.score))
          .replace('{length}', String(ev.length))
          .replace('{sets}', String(ev.sets));
  return { num: config.decisionNum, question: config.question, answer, tier: ev.tier, feedback: config.feedback[ev.tier] };
}

/** Losowy podgląd hasła o danej długości ze znaków wybranych kafelków (każdy zestaw użyty, gdy długość pozwala). */
export function randomPreview(
  tiles: readonly PasswordTile[],
  selectedIds: readonly string[],
  length: number,
  random: () => number = Math.random
): string {
  const sets = tiles.filter((t) => selectedIds.includes(t.id) && t.charset.length > 0).map((t) => t.charset);
  if (sets.length === 0) return '';
  const pool = [...sets.join('')];
  const pick = (chars: ArrayLike<string>) => chars[Math.floor(random() * chars.length)];
  const out: string[] = sets.slice(0, length).map((s) => pick([...s]));
  while (out.length < length) out.push(pick(pool));
  // tasowanie, by znaki z kolejnych zestawów nie stały na początku
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

/** Wypełnienie slotów: id slotu -> id kafelka. */
export type NoteFill = Partial<Record<NoteSlotId, string>>;

export const isNoteComplete = (config: NoteConfig, fill: NoteFill): boolean =>
  config.slots.every((s) => !!fill[s.id]);

/** Czy kafelek może wejść do slotu (tylko swojego typu). */
export const tileFitsSlot = (tile: NoteTile, slotId: string): boolean => tile.slot === slotId;

/** Raport D3: poziom = gorszy z tytułu i czasu; odpowiedź = części kafelków; feedback = najgorszego(ych). */
export function buildNoteReport(config: NoteConfig, fill: NoteFill): DecisionReport {
  const variable = (['title', 'time'] as const)
    .map((slot) => config.tiles.find((t) => t.id === fill[slot]))
    .filter((t): t is NoteTile => !!t && !!t.tier);
  const tier = variable.reduce<ChoiceOutcome>((acc, t) => worseTier(acc, t.tier!), 'ideal');
  const feedback =
    tier === 'ideal'
      ? config.idealFeedback
      : variable
          .filter((t) => t.tier === tier)
          .map((t) => t.feedback ?? '')
          .filter(Boolean)
          .join(' ');
  const answer = variable.map((t) => t.reportPart ?? t.label).join(config.answerJoiner);
  return { num: config.decisionNum, question: config.question, answer, tier, feedback };
}

/** Identyfikator odrzuconej konfiguracji hasła (długość + zestawy): ta sama konfiguracja odrzucona drugi raz nie liczy kary. */
export const passwordOptionId = (selectedIds: readonly string[], length: number): string =>
  `password:${length}:${[...selectedIds].sort().join('+')}`;

/** B2 dla D2: mentor odrzuca hasło, gdy `config.rejectLine` zwraca kwestię; inaczej `null` (zwykła ocena). */
export function buildPasswordRejection(
  config: PasswordConfig,
  ev: PasswordEvaluation,
  selectedIds: readonly string[]
): DecisionRejection | null {
  const mentorLine = config.rejectLine?.(ev);
  if (!mentorLine) return null;
  return {
    num: config.decisionNum,
    question: config.question,
    optionId: passwordOptionId(selectedIds, ev.length),
    answer: buildPasswordReport(config, ev).answer,
    tier: ev.tier,
    mentorLine
  };
}

/**
 * B2 dla D3: mentor odrzuca kafelek tytułu/czasu z `reject`. Przy dwóch takich kafelkach odrzuca najpierw
 * gorszy (wyższy poziom), potem - po poprawce - drugi. Zwraca też slot do opróżnienia.
 */
export function buildNoteRejection(
  config: NoteConfig,
  fill: NoteFill
): { rejection: DecisionRejection; slot: NoteSlotId } | null {
  const candidates = (['title', 'time'] as const)
    .map((slot) => ({ slot, tile: config.tiles.find((t) => t.id === fill[slot]) }))
    .filter((c): c is { slot: 'title' | 'time'; tile: NoteTile } => !!c.tile && !!c.tile.reject && !!c.tile.tier);
  if (candidates.length === 0) return null;
  const worst = candidates.reduce((a, b) => (TIER_RANK[b.tile.tier!] > TIER_RANK[a.tile.tier!] ? b : a));
  return {
    slot: worst.slot,
    rejection: {
      num: config.decisionNum,
      question: config.question,
      optionId: worst.tile.id,
      answer: worst.tile.reportPart ?? worst.tile.label,
      tier: worst.tile.tier!,
      mentorLine: worst.tile.reject!.mentorLine
    }
  };
}
