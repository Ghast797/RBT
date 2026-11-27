// Silnik: warunki `when` z zagnieżdżonymi grupami allOf/anyOf (rekurencyjnie) i zachowanie dotychczasowych kształtów.
import { describe, it, expect } from 'vitest';
import { beatMatches, type BeatContext } from '../src/engine/core/beatCondition';
import type { BeatCondition, DecisionChoice } from '../src/engine/types/mission';

const choice = (optionId: string, tier: DecisionChoice['tier']): DecisionChoice => ({ optionId, answer: optionId, tier });
const ctx = (over: Partial<BeatContext> = {}): BeatContext => ({
  choices: { 1: choice('a', 'ideal'), 2: choice('b', 'suboptimal'), 3: choice('c', 'ideal') },
  rejected: {},
  score: 100,
  passingScore: 70,
  ...over
});

describe('beatMatches: kształty dotychczasowe', () => {
  it('brak warunku pasuje zawsze; liść decyzji i grupy płaskie działają bez zmian', () => {
    expect(beatMatches(undefined, ctx())).toBe(true);
    expect(beatMatches({ decision: 1, tier: 'ideal' }, ctx())).toBe(true);
    expect(beatMatches({ decision: 9 }, ctx())).toBe(false);
    expect(beatMatches({ allOf: [{ decision: 1, tier: 'ideal' }, { decision: 3, tier: 'ideal' }] }, ctx())).toBe(true);
    expect(beatMatches({ allOf: [{ decision: 1, tier: 'ideal' }, { decision: 2, tier: 'ideal' }] }, ctx())).toBe(false);
    expect(beatMatches({ anyOf: [{ decision: 2, tier: 'suboptimal' }, { decision: 9 }] }, ctx())).toBe(true);
  });

  it('warunki wyniku w grupach płaskich', () => {
    expect(beatMatches({ belowPassing: true }, ctx({ score: 62.5 }))).toBe(true);
    expect(beatMatches({ belowPassing: false }, ctx({ score: 62.5 }))).toBe(false);
    expect(beatMatches({ belowPassing: true }, ctx())).toBe(false);
  });
});

describe('beatMatches: zagnieżdżanie', () => {
  it('anyOf wewnątrz allOf: (grupa OR) AND warunek wyniku', () => {
    const when: BeatCondition = {
      allOf: [{ anyOf: [{ decision: 2, tier: 'suboptimal' }, { decision: 1, rejected: true }] }, { belowPassing: false }]
    };
    expect(beatMatches(when, ctx({ score: 75 }))).toBe(true);
    expect(beatMatches(when, ctx({ score: 62.5 }))).toBe(false);
    const noSuboptimal = ctx({ score: 100, choices: { 1: choice('a', 'ideal'), 2: choice('b', 'ideal') } });
    expect(beatMatches(when, noSuboptimal)).toBe(false);
  });

  it('allOf wewnątrz anyOf i kolejny poziom zagnieżdżenia', () => {
    const when: BeatCondition = {
      anyOf: [
        { allOf: [{ decision: 1, tier: 'ideal' }, { decision: 3, tier: 'ideal' }] },
        { allOf: [{ anyOf: [{ decision: 9 }, { belowPassing: true }] }, { decision: 2 }] }
      ]
    };
    expect(beatMatches(when, ctx())).toBe(true);
    const weak = { 1: choice('a', 'suboptimal'), 2: choice('b', 'ideal') };
    expect(beatMatches(when, ctx({ choices: weak, score: 50 }))).toBe(true);
    expect(beatMatches(when, ctx({ choices: weak, score: 90 }))).toBe(false);
  });
});
