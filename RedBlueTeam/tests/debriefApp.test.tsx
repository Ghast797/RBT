// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DebriefApp } from '../src/engine/apps/DebriefApp';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { MissionDefinition, PlayerChoiceRecord } from '../src/engine/types/mission';

const def = {
  ...mission2Definition,
  step6: {
    ...mission2Definition.step6,
    choices: [
      { num: 1, question: 'Pytanie 1', answer: 'IDEALNA ODPOWIEDŹ', correct: true, details: 'd', outcome: 'ideal', attack: 'Dlaczego to działa.', defense: 'Jak się bronić.' }
    ]
  }
} as MissionDefinition;

const choice = (extra: Partial<PlayerChoiceRecord>): PlayerChoiceRecord => ({
  num: 1,
  question: 'Pytanie 1',
  answer: 'MOJA ODPOWIEDŹ',
  isCorrect: false,
  details: 'szczegóły',
  outcome: 'suboptimal',
  ...extra
});

describe('DebriefApp (komponent)', () => {
  beforeEach(() => useMissionStore.getState().loadMission(def));
  afterEach(cleanup);

  const show = (c: PlayerChoiceRecord) => {
    useMissionStore.setState({ playerChoices: [c], expandedChoiceIndex: 0 });
    return render(<DebriefApp />);
  };

  it('ENG-16: przy wyborze innym niż idealny nagłówek lekcji to „CO ZADZIAŁAŁOBY LEPIEJ” z idealną odpowiedzią', () => {
    show(choice({}));
    expect(screen.getByText('CO ZADZIAŁAŁOBY LEPIEJ')).toBeTruthy();
    expect(screen.getByText(/IDEALNA ODPOWIEDŹ/)).toBeTruthy();
    expect(screen.queryByText(/dlaczego to zadziałało/)).toBeNull();
    expect(screen.getByText('Dlaczego to działa.')).toBeTruthy();
  });

  it('ENG-16: przy idealnym wyborze lekcja ma dotychczasowe nagłówki', () => {
    show(choice({ outcome: 'ideal', isCorrect: true, answer: 'IDEALNA ODPOWIEDŹ' }));
    expect(screen.queryByText('CO ZADZIAŁAŁOBY LEPIEJ')).toBeNull();
    expect(screen.getByText(/Atak — dlaczego to zadziałało:/)).toBeTruthy();
  });

  it('NEW-07: feedback odrzuconej opcji pod linią „odrzucone przez BYTE_MASTERA”', () => {
    show(choice({ rejectedAttempts: [{ optionId: 'o', answer: 'ZŁA', tier: 'suboptimal', mentorLine: 'Nie.', feedback: 'Bo to ryzykowne.' }] }));
    expect(screen.getByText(/Najpierw: ZŁA — odrzucone przez BYTE_MASTERA/)).toBeTruthy();
    expect(screen.getByText('Bo to ryzykowne.')).toBeTruthy();
  });

  it('NEW-07: bez feedbacku nie ma dodatkowej linii', () => {
    const { container } = show(choice({ rejectedAttempts: [{ optionId: 'o', answer: 'ZŁA', tier: 'suboptimal', mentorLine: 'Nie.' }] }));
    expect(container.querySelector('[data-rejected-feedback]')).toBeNull();
  });

  it('NEW-06: ciąg dalszy rozmowy widać pod odpowiedzią jako „→ odpowiedź”', () => {
    show(choice({ followUps: ['CHWILA, NIE TAK SZYBKO…'] }));
    expect(screen.getByText(/→ CHWILA, NIE TAK SZYBKO…/)).toBeTruthy();
  });
});

describe('DebriefApp: blokada powtórki po wysłaniu wyniku (NEW-01)', () => {
  beforeEach(() => {
    useMissionStore.setState({ isScormTerminated: false });
    useMissionStore.getState().loadMission(def);
  });
  afterEach(() => {
    cleanup();
    useMissionStore.setState({ isScormTerminated: false });
  });

  it('po Terminate zamiast „POWTÓRZ ZADANIE” jest komunikat o zamknięciu okna', () => {
    useMissionStore.setState({ playerChoices: [choice({})], expandedChoiceIndex: 0, isScormTerminated: true });
    render(<DebriefApp />);
    expect(screen.getByTestId('scorm-sent-notice').textContent).toBe(
      'WYNIK ZOSTAŁ WYSŁANY DO MOODLE. ABY ZAGRAĆ PONOWNIE, ZAMKNIJ TO OKNO I URUCHOM AKTYWNOŚĆ W MOODLE JESZCZE RAZ.'
    );
    expect(screen.queryByText('POWTÓRZ ZADANIE')).toBeNull();
  });

  it('bez wysłanego wyniku przycisk „POWTÓRZ ZADANIE” jest dostępny', () => {
    useMissionStore.setState({ playerChoices: [choice({})], expandedChoiceIndex: 0 });
    render(<DebriefApp />);
    expect(screen.queryByTestId('scorm-sent-notice')).toBeNull();
    expect(screen.getAllByText('POWTÓRZ ZADANIE').length).toBeGreaterThan(0);
  });
});
