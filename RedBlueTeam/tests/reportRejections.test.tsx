// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { DebriefApp } from '../src/engine/apps/DebriefApp';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import { beatMatches } from '../src/engine/core/beatCondition';
import type { MissionDefinition, PlayerChoiceRecord, DecisionChoice } from '../src/engine/types/mission';

const turn = (n: number, extra: object = {}) => ({
  turn: n, title: `Tura ${n}`, opponent: `Rozmówca ${n}`, player: `Gracz ${n}`, psychology: `Psycho ${n}`, ...extra
});

const mk = (lessonExtra: object = {}, count = 4): MissionDefinition =>
  ({
    ...mission2Definition,
    mission: { ...mission2Definition.mission, decisionCount: count, maxScore: 100 },
    step6: {
      ...mission2Definition.step6,
      choices: [
        { num: 1, question: 'P1', answer: 'STATYCZNA', correct: true, details: 'd', outcome: 'ideal', attack: 'A.', defense: 'O.', ...lessonExtra }
      ]
    }
  }) as MissionDefinition;

const rec = (extra: Partial<PlayerChoiceRecord>): PlayerChoiceRecord => ({
  num: 1, question: 'P1', answer: 'MOJA', isCorrect: false, details: 'x', outcome: 'suboptimal', ...extra
});
const rej = (id: string) => ({ optionId: id, answer: `ZŁA_${id}`, tier: 'suboptimal' as const, mentorLine: 'Nie.' });

const show = (def: MissionDefinition, c: PlayerChoiceRecord, state: object = {}) => {
  useMissionStore.getState().loadMission(def);
  useMissionStore.setState({ playerChoices: [c], expandedChoiceIndex: 0, ...state });
  return render(<DebriefApp />);
};

describe('raport: odrzucone próby', () => {
  afterEach(cleanup);

  it('ideał po poprawce: plakietka, koszt próby i zdanie pod licznikami', () => {
    show(mk(), rec({ outcome: 'ideal', isCorrect: true, rejectedAttempts: [rej('a')] }));
    expect(screen.getByText(/IDEALNY PO POPRAWCE/)).toBeTruthy();
    expect(screen.getByText(/\(−12,5 PKT\)/)).toBeTruthy();
    expect(screen.getByText('Odrzucona próba kosztuje połowę punktów za decyzję.')).toBeTruthy();
  });

  it('bez odrzuceń: zwykły IDEALNY WYBÓR i brak zdania', () => {
    show(mk(), rec({ outcome: 'ideal', isCorrect: true }));
    expect(screen.getByText('[IDEALNY WYBÓR]')).toBeTruthy();
    expect(screen.queryByText(/połowę punktów/)).toBeNull();
  });

  it('dwie odrzucone próby: każda po pół udziału (udział 50 przy 2 decyzjach → 25 + 25 z limitem 50)', () => {
    show(mk({}, 2), rec({ outcome: 'ideal', isCorrect: true, rejectedAttempts: [rej('a'), rej('b')] }));
    expect(screen.getAllByText(/\(−25 PKT\)/)).toHaveLength(2);
  });

  it('limit na decyzję: kara za poziom i próby nie przekracza udziału', () => {
    // udział 25, poziom suboptimal = 12,5 → pierwsza próba 12,5, druga 0 (limit)
    show(mk(), rec({ outcome: 'suboptimal', rejectedAttempts: [rej('a'), rej('b')] }));
    expect(screen.getAllByText(/\(−12,5 PKT\)/)).toHaveLength(1);
    expect(screen.getByText(/Najpierw: ZŁA_b — odrzucone przez BYTE_MASTERA/).textContent).not.toMatch(/PKT/);
  });

  it('etykiety lekcji: wariant idealny przy słabszym wyborze, długie przy idealnym', () => {
    show(mk(), rec({}));
    expect(screen.getByText('Atak (wariant idealny):')).toBeTruthy();
    expect(screen.getByText('Obrona (przy wariancie idealnym):')).toBeTruthy();
    cleanup();
    show(mk(), rec({ outcome: 'ideal', isCorrect: true }));
    expect(screen.getByText('Atak — dlaczego to zadziałało:')).toBeTruthy();
    expect(screen.getByText('Obrona — jak to rozpoznać i co zrobić:')).toBeTruthy();
  });
});

describe('raport: warianty zależne od wyborów', () => {
  afterEach(cleanup);
  const variants = {
    answerVariants: [
      { when: { decision: 2, tier: 'critical' }, answer: 'WARIANT KRYTYCZNY' },
      { when: { decision: 2 }, answer: 'WARIANT INNY' }
    ]
  };
  const ch = (tier: DecisionChoice['tier']) => ({ decisionChoices: { 2: { answer: 'x', tier } } });

  it('bierze pierwszy pasujący wariant', () => {
    show(mk(variants), rec({}), ch('critical'));
    expect(screen.getByText(/WARIANT KRYTYCZNY/)).toBeTruthy();
  });
  it('drugi wariant, gdy pierwszy nie pasuje', () => {
    show(mk(variants), rec({}), ch('ideal'));
    expect(screen.getByText(/WARIANT INNY/)).toBeTruthy();
  });
  it('statyczna odpowiedź, gdy żaden nie pasuje', () => {
    show(mk(variants), rec({}), { decisionChoices: {} });
    expect(screen.getByText(/STATYCZNA/)).toBeTruthy();
  });

  it('transkrypt pomija tury z niespełnionym when i liczy tylko widoczne', () => {
    const t = [turn(1), turn(2, { when: { decision: 2, tier: 'ideal' } }), turn(3, { when: { decision: 2, tier: 'critical' } })];
    show(mk({ negotiationTranscript: t }), rec({}), ch('critical'));
    fireEvent.click(screen.getByText('POKAŻ PRZEBIEG NEGOCJACJI'));
    expect(screen.getByText(/TURY: 2\)/)).toBeTruthy();
    expect(screen.getByText(/Rozmówca 1/)).toBeTruthy();
    expect(screen.queryByText(/Rozmówca 2/)).toBeNull();
    expect(screen.getByText(/Rozmówca 3/)).toBeTruthy();
  });
});

describe('beatMatches: rejected i belowPassing', () => {
  const choices: Record<number, DecisionChoice> = { 1: { answer: 'a', tier: 'ideal' }, 2: { answer: 'b', tier: 'ideal' } };
  const base = { choices, rejected: { 1: [{}] } as Record<number, unknown[]>, score: 60, passingScore: 70 };

  it('rejected true/false', () => {
    expect(beatMatches({ decision: 1, rejected: true }, base)).toBe(true);
    expect(beatMatches({ decision: 1, rejected: false }, base)).toBe(false);
    expect(beatMatches({ decision: 2, rejected: false }, base)).toBe(true);
    expect(beatMatches({ decision: 2, rejected: true }, base)).toBe(false);
    expect(beatMatches({ decision: 2, rejected: false }, { choices })).toBe(true);
  });
  it('belowPassing samodzielnie, na progu i przy braku wyniku', () => {
    expect(beatMatches({ belowPassing: true }, base)).toBe(true);
    expect(beatMatches({ belowPassing: false }, base)).toBe(false);
    expect(beatMatches({ belowPassing: true }, { ...base, score: 70 })).toBe(false);
    expect(beatMatches({ belowPassing: false }, { ...base, score: 70 })).toBe(true);
    expect(beatMatches({ belowPassing: true }, { ...base, score: 69.6 })).toBe(false);
    expect(beatMatches({ belowPassing: true }, { choices })).toBe(false);
    expect(beatMatches({ belowPassing: true }, { ...base, score: 60, passingScore: undefined })).toBe(true);
  });
  it('w allOf i anyOf', () => {
    expect(beatMatches({ allOf: [{ decision: 1, rejected: true }, { belowPassing: true }] }, base)).toBe(true);
    expect(beatMatches({ allOf: [{ decision: 1, rejected: true }, { belowPassing: false }] }, base)).toBe(false);
    expect(beatMatches({ anyOf: [{ decision: 2, rejected: true }, { belowPassing: true }] }, base)).toBe(true);
    expect(beatMatches({ anyOf: [{ decision: 2, rejected: true }, { belowPassing: false }] }, base)).toBe(false);
  });
});
