import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { beatMatches, matchesChoices } from '../src/engine/core/beatCondition';
import { buildReport, buildRejection } from '../src/engine/core/report';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { ConversationBeat, DecisionReport, MissionDefinition } from '../src/engine/types/mission';

const st = () => useMissionStore.getState();

const report = (num: number, extra: Partial<DecisionReport> = {}): DecisionReport => ({
  num,
  question: `q${num}`,
  answer: `a${num}`,
  tier: 'ideal',
  feedback: 'fb',
  ...extra
});

const missionWith = (conversation: ConversationBeat[], openingConversation?: ConversationBeat[]): MissionDefinition =>
  ({
    ...mission2Definition,
    stages: [
      { id: 'stage_a', appId: 'app_a', completion: { conversation, unlockIcons: ['app_b'] } },
      { id: 'stage_b', appId: 'app_b', openingConversation, completion: {} }
    ]
  }) as MissionDefinition;

describe('ENG-04: decisionChoices w store', () => {
  beforeEach(() => st().loadMission(mission2Definition));

  it('na starcie puste (nie wypełnione domyślnymi ideałami)', () => {
    expect(st().decisionChoices).toEqual({});
  });

  it('reportDecision zapisuje optionId, odpowiedź i poziom; pierwsze zgłoszenie wygrywa', () => {
    st().reportDecision(report(1, { optionId: 'x', tier: 'suboptimal' }));
    st().reportDecision(report(1, { optionId: 'y', tier: 'ideal' }));
    expect(st().decisionChoices[1]).toEqual({ optionId: 'x', answer: 'a1', tier: 'suboptimal' });
  });

  it('decyzja bez optionId zapisuje się bez tego pola', () => {
    st().reportDecision(report(2));
    expect(st().decisionChoices[2]).toEqual({ answer: 'a2', tier: 'ideal' });
  });

  it('odrzucenie przez mentora nie zapisuje wyboru', () => {
    st().rejectDecision({ num: 3, question: 'q', optionId: 'o', answer: 'a', tier: 'suboptimal', mentorLine: 'Nie.' });
    expect(st().decisionChoices[3]).toBeUndefined();
  });

  it('powtórka misji czyści wybory', () => {
    st().reportDecision(report(1, { optionId: 'x' }));
    st().loadMission(mission2Definition);
    expect(st().decisionChoices).toEqual({});
  });

  it('buildReport przekazuje id opcji', () => {
    const opt = { id: 'opt1', label: 'L', tier: 'ideal' as const, feedback: 'f' };
    expect(buildReport({ decisionNum: 1, question: 'q' }, opt).optionId).toBe('opt1');
  });

  it('NEW-07: odrzucenie niesie feedback opcji', () => {
    const opt = { id: 'o', label: 'L', tier: 'suboptimal' as const, feedback: 'Bo tak.', reject: { mentorLine: 'Nie.' } };
    expect(buildRejection({ decisionNum: 1, question: 'q' }, opt)?.feedback).toBe('Bo tak.');
    st().rejectDecision(buildRejection({ decisionNum: 1, question: 'q' }, opt)!);
    expect(st().rejectedAttempts[1][0].feedback).toBe('Bo tak.');
  });
});

describe('ENG-04: beatMatches', () => {
  const choices = { 1: { optionId: 'a', answer: 'A', tier: 'suboptimal' as const } };

  it('bez warunku zawsze pasuje', () => expect(beatMatches(undefined, { choices: {} })).toBe(true));
  it('brak decyzji = brak dopasowania', () => expect(beatMatches({ decision: 2 }, { choices: choices })).toBe(false));
  it('sama decyzja pasuje, gdy zgłoszona', () => expect(beatMatches({ decision: 1 }, { choices: choices })).toBe(true));
  it('optionId: pojedyncze i lista', () => {
    expect(beatMatches({ decision: 1, optionId: 'a' }, { choices: choices })).toBe(true);
    expect(beatMatches({ decision: 1, optionId: ['b', 'a'] }, { choices: choices })).toBe(true);
    expect(beatMatches({ decision: 1, optionId: 'b' }, { choices: choices })).toBe(false);
  });
  it('tier: pojedynczy i lista, razem z optionId', () => {
    expect(beatMatches({ decision: 1, tier: 'suboptimal' }, { choices: choices })).toBe(true);
    expect(beatMatches({ decision: 1, tier: ['ideal', 'critical'] }, { choices: choices })).toBe(false);
    expect(beatMatches({ decision: 1, optionId: 'a', tier: 'ideal' }, { choices: choices })).toBe(false);
  });
  it('optionId wymaga znanego id wyboru', () => {
    expect(beatMatches({ decision: 2, optionId: 'a' }, { choices: { 2: { answer: 'x', tier: 'ideal' } } })).toBe(false);
  });
});

describe('ENG-04: mostek pomija beaty z niespełnionym when', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(100);
  });
  afterEach(() => {
    __setBridgeDelayForTests(2000);
    vi.useRealTimers();
  });

  const texts = () => st().chatMessages.map((m) => `${m.sender}:${m.text}`);

  it('gra pasujące beaty, pomija resztę, a pominięta kwestia gracza nie blokuje mostka', () => {
    st().loadMission(
      missionWith([
        { from: 'byte_master', text: 'ZAWSZE' },
        { from: 'byte_master', text: 'TYLKO A', when: { decision: 1, optionId: 'a' } },
        { from: 'player', id: 'p_b', label: 'GRACZ B', when: { decision: 1, optionId: 'b' } },
        { from: 'byte_master', text: 'KONIEC' }
      ])
    );
    st().reportDecision(report(1, { optionId: 'b' }));
    useMissionStore.setState({ chatMessages: [] });
    st().completeStage('stage_a');
    vi.advanceTimersByTime(100);
    expect(texts()).toEqual(['BYTE_MASTER:ZAWSZE']);
    vi.advanceTimersByTime(100);
    // beat „TYLKO A” pominięty, teraz czeka kwestia gracza B
    expect(st().chatAvailableChoices.map((c) => c.id)).toEqual(['p_b']);
    st().chooseChatOption('p_b');
    vi.advanceTimersByTime(100);
    expect(texts()).toEqual(['BYTE_MASTER:ZAWSZE', 'PLAYER:GRACZ B', 'BYTE_MASTER:KONIEC']);
    expect(st().pendingBridge).toBeNull();
  });

  it('pominięta kwestia gracza nie zostawia przycisku i mostek dochodzi do końca (odblokowanie)', () => {
    st().loadMission(
      missionWith([
        { from: 'player', id: 'p_a', label: 'GRACZ A', when: { decision: 1, optionId: 'a' } },
        { from: 'byte_master', text: 'KONIEC' }
      ])
    );
    st().reportDecision(report(1, { optionId: 'b' }));
    useMissionStore.setState({ chatMessages: [], unlockedIcons: [] });
    st().completeStage('stage_a');
    expect(st().chatAvailableChoices).toEqual([]);
    vi.advanceTimersByTime(100);
    expect(texts()).toEqual(['BYTE_MASTER:KONIEC']);
    expect(st().unlockedIcons).toContain('app_b');
  });

  it('brak zgłoszonej decyzji = beat pominięty', () => {
    st().loadMission(missionWith([{ from: 'byte_master', text: 'WARUNKOWY', when: { decision: 9 } }]));
    useMissionStore.setState({ chatMessages: [] });
    st().completeStage('stage_a');
    vi.runAllTimers();
    expect(texts()).toEqual([]);
    expect(st().pendingBridge).toBeNull();
  });

  it('when działa też w openingConversation', () => {
    st().loadMission(
      missionWith([], [
        { from: 'byte_master', text: 'DLA A', when: { decision: 1, optionId: 'a' } },
        { from: 'byte_master', text: 'DLA B', when: { decision: 1, optionId: 'b' } }
      ])
    );
    useMissionStore.setState({ bootStage: 'desktop', unlockedIcons: ['app_a', 'app_b'], chatMessages: [] });
    st().reportDecision(report(1, { optionId: 'b' }));
    st().openApp('app_b');
    vi.runAllTimers();
    expect(texts()).toEqual(['BYTE_MASTER:DLA B']);
  });
});

describe('NEW-06: appendFollowUp', () => {
  beforeEach(() => st().loadMission(mission2Definition));

  it('dopisuje ciąg dalszy do zgłoszonej decyzji; bez decyzji nic nie robi', () => {
    st().appendFollowUp(5, 'x');
    expect(st().playerChoices.find((c) => c.num === 5)?.followUps).toBeUndefined();
    st().reportDecision(report(5));
    st().appendFollowUp(5, 'pierwsza');
    st().appendFollowUp(5, 'druga');
    expect(st().playerChoices.find((c) => c.num === 5)?.followUps).toEqual(['pierwsza', 'druga']);
  });
});

describe('P4: warunki złożone', () => {
  const c = { 1: { optionId: 'a', answer: 'x', tier: 'ideal' as const }, 2: { answer: 'y', tier: 'suboptimal' as const } };
  it('allOf: wszystkie muszą pasować', () => {
    expect(beatMatches({ allOf: [{ decision: 1, tier: 'ideal' }, { decision: 2 }] }, { choices: c })).toBe(true);
    expect(beatMatches({ allOf: [{ decision: 1, tier: 'ideal' }, { decision: 2, tier: 'ideal' }] }, { choices: c })).toBe(false);
    expect(beatMatches({ allOf: [{ decision: 1 }, { decision: 3 }] }, { choices: c })).toBe(false);
  });
  it('anyOf: wystarczy jeden', () => {
    expect(beatMatches({ anyOf: [{ decision: 1, tier: 'critical' }, { decision: 2, tier: 'suboptimal' }] }, { choices: c })).toBe(true);
    expect(beatMatches({ anyOf: [{ decision: 1, tier: 'critical' }, { decision: 3 }] }, { choices: c })).toBe(false);
    expect(beatMatches({ anyOf: [] }, { choices: c })).toBe(false);
  });
  it('matchesChoices to ta sama funkcja', () => expect(matchesChoices({ decision: 1 }, { choices: c })).toBe(true));
});
