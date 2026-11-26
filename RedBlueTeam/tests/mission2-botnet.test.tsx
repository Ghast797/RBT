// @vitest-environment jsdom
// M2 (CarbonFlow): konsekwencje wcześniejszych wyborów na monitorze botnetu i wariant zamknięcia rozmowy.
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import type { DecisionChoice, DecisionReport, MissionDefinition } from '../src/engine/types/mission';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import { botnetMonitorConfig } from '../src/scenarios/mission_02_carbon_flow/stages';
import { resolveBotnetOutcome, summarizeBotnet } from '../src/scenarios/mission_02_carbon_flow/minigames/botnet';
import { BotnetMonitorApp } from '../src/scenarios/mission_02_carbon_flow/minigames/BotnetMonitorApp';

const st = () => useMissionStore.getState();

const IDEAL: Record<number, DecisionChoice> = {
  1: { optionId: 'poodle_forms', answer: 'POODLE FORMS', tier: 'ideal' },
  2: { optionId: 'mandatory_integration', answer: 'INTEGRACJA', tier: 'ideal' },
  3: { optionId: 'worm', answer: 'ROBAK', tier: 'ideal' },
  4: { optionId: 'typosquatting_kadry', answer: 'KADRY', tier: 'ideal' }
};
const withChoice = (num: number, optionId: string, tier: DecisionChoice['tier']): Record<number, DecisionChoice> => ({
  ...IDEAL,
  [num]: { optionId, answer: optionId, tier }
});

const SCENARIOS: Array<{ name: string; choices: Record<number, DecisionChoice>; percent: number; alarms: number; alarmTexts: string[] }> = [
  { name: 'wszystkie ideały', choices: IDEAL, percent: 82, alarms: 0, alarmTexts: [] },
  { name: 'tylko quickgram', choices: withChoice(1, 'quickgram', 'suboptimal'), percent: 70, alarms: 0, alarmTexts: [] },
  { name: 'tylko fire_drill', choices: withChoice(2, 'fire_drill', 'suboptimal'), percent: 72, alarms: 0, alarmTexts: [] },
  {
    name: 'quickgram i fire_drill',
    choices: { ...withChoice(1, 'quickgram', 'suboptimal'), 2: { optionId: 'fire_drill', answer: 'x', tier: 'suboptimal' } },
    percent: 60,
    alarms: 0,
    alarmTexts: []
  },
  {
    name: 'marketing',
    choices: withChoice(4, 'marketing_carbon', 'suboptimal'),
    percent: 82,
    alarms: 1,
    alarmTexts: ['FILTR POCZTY OZNACZYŁ NADAWCĘ JAKO PODEJRZANEGO']
  }
];

describe('M2 monitor botnetu: resolveBotnetOutcome', () => {
  for (const s of SCENARIOS) {
    it(`${s.name}: ${s.percent}%, ${s.alarms} alarmów`, () => {
      const out = resolveBotnetOutcome(botnetMonitorConfig, s.choices);
      expect(out.targetPercentage).toBe(s.percent);
      expect(out.alarms).toBe(s.alarms);
      expect(out.alarmTexts).toEqual(s.alarmTexts);
    });
  }

  it('brak zgłoszonych wyborów = bazowe 82% bez alarmów', () => {
    expect(resolveBotnetOutcome(botnetMonitorConfig, {})).toMatchObject({ targetPercentage: 82, alarms: 0 });
  });

  it('liczba zainfekowanych stacji zgadza się z procentem (12 stacji)', () => {
    const infected = (choices: Record<number, DecisionChoice>) => {
      const { targetPercentage } = resolveBotnetOutcome(botnetMonitorConfig, choices);
      return summarizeBotnet({ targetPercentage, totalWorkstations: botnetMonitorConfig.totalWorkstations }).infectedCount;
    };
    expect(infected(IDEAL)).toBe(10);
    expect(infected(SCENARIOS[1].choices)).toBe(8);
    expect(infected(SCENARIOS[2].choices)).toBe(9);
    expect(infected(SCENARIOS[3].choices)).toBe(7);
  });
});

const report = (num: number, optionId: string, tier: DecisionChoice['tier']): DecisionReport => ({
  num,
  question: `q${num}`,
  answer: optionId,
  optionId,
  tier,
  feedback: 'fb'
});

const CLOSING_IDEAL = 'NIEŹLE CI POSZŁO';
const CLOSING_WEAKER = 'MOGŁO PÓJŚĆ LEPIEJ';

describe('M2 zamknięcie rozmowy przy monitorze: dokładnie jedna kwestia', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(100);
    st().loadMission(mission2Definition as MissionDefinition);
  });
  afterEach(() => {
    __setBridgeDelayForTests(2000);
    vi.useRealTimers();
  });

  const closingTexts = () =>
    st()
      .chatMessages.map((m) => `${m.sender}:${m.text}`)
      .filter((t) => t.includes(CLOSING_IDEAL) || t.includes(CLOSING_WEAKER));

  const runClosing = (reports: DecisionReport[]) => {
    reports.forEach((r) => st().reportDecision(r));
    useMissionStore.setState({ chatMessages: [] });
    st().completeStage('botnet_monitor');
    vi.runAllTimers();
    return closingTexts();
  };

  it('ścieżka idealna: gra wariant idealny, nie gra wariantu słabszego', () => {
    const texts = runClosing([
      report(1, 'poodle_forms', 'ideal'),
      report(2, 'mandatory_integration', 'ideal'),
      report(3, 'worm', 'ideal'),
      report(4, 'typosquatting_kadry', 'ideal')
    ]);
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain(CLOSING_IDEAL);
  });

  it('ścieżka słabsza (quickgram): gra wariant słabszy', () => {
    const texts = runClosing([
      report(1, 'quickgram', 'suboptimal'),
      report(2, 'mandatory_integration', 'ideal'),
      report(3, 'worm', 'ideal'),
      report(4, 'typosquatting_kadry', 'ideal')
    ]);
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain(CLOSING_WEAKER);
  });

  it('ścieżka słabsza (marketing na D4): gra wariant słabszy', () => {
    const texts = runClosing([
      report(1, 'poodle_forms', 'ideal'),
      report(2, 'mandatory_integration', 'ideal'),
      report(3, 'worm', 'ideal'),
      report(4, 'marketing_carbon', 'suboptimal')
    ]);
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain(CLOSING_WEAKER);
  });
});

describe('M2 monitor botnetu: wyświetlanie', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    st().loadMission(mission2Definition as MissionDefinition);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  for (const s of SCENARIOS) {
    it(`${s.name}: ${s.percent}%, alarmy ${s.alarms}`, () => {
      useMissionStore.setState({ decisionChoices: s.choices });
      render(<BotnetMonitorApp config={botnetMonitorConfig} onComplete={() => {}} onDecision={() => {}} />);
      fireEvent.click(screen.getByText('PODGLĄD'));
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByText(`${s.percent}%`)).toBeTruthy();
      expect(screen.getByText(s.alarms === 0 ? '0 ALARMÓW' : '1 ALARM')).toBeTruthy();
      for (const t of s.alarmTexts) expect(screen.getByText(t)).toBeTruthy();
      expect(screen.getByText('ŁADUNEK 0-DAY NIEWYKRYTY')).toBeTruthy();
    });
  }
});
