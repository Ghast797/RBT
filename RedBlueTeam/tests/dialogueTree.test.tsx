// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { DialogueTree } from '../src/engine/blocks/DialogueTree';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { DialogueTreeConfig } from '../src/engine/types/mission';

const config: DialogueTreeConfig = {
  respondent: 'SZEF IT',
  nodes: [
    {
      id: 'n1',
      incoming: 'Pierwsze pytanie',
      decisionNum: 9,
      question: 'Jak odpowiesz?',
      options: [
        { id: 'retreat', label: 'ODPUSZCZAM', tier: 'suboptimal', feedback: 'fb9', nextNode: 'n2' }
      ]
    },
    {
      id: 'n2',
      incoming: 'Drugie pytanie',
      options: [{ id: 'push', label: 'CHWILA, NIE TAK SZYBKO', tier: 'ideal', feedback: 'fb', nextNode: 'n3' }]
    },
    {
      id: 'n3',
      incoming: 'Trzecie',
      decisionNum: 10,
      question: 'Czego chcesz?',
      options: [{ id: 'money', label: 'PIENIĄDZE', tier: 'ideal', feedback: 'fb10' }]
    }
  ]
};

describe('DialogueTree (komponent)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useMissionStore.getState().loadMission(mission2Definition);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const st = () => useMissionStore.getState();
  const choose = (label: string) => fireEvent.click(screen.getByText(label));
  const wait = () => act(() => void vi.advanceTimersByTime(2000));

  const renderTree = (onDecision = (d: unknown) => st().reportDecision(d as never)) =>
    render(<DialogueTree config={config} onDecision={onDecision} onComplete={() => {}} />);

  it('zgłasza decyzję węzła z optionId', () => {
    const onDecision = vi.fn();
    renderTree(onDecision);
    choose('ODPUSZCZAM');
    expect(onDecision).toHaveBeenCalledWith(expect.objectContaining({ num: 9, optionId: 'retreat', answer: 'ODPUSZCZAM', tier: 'suboptimal' }));
  });

  it('odpowiedź w węźle bez oceny trafia jako ciąg dalszy ostatniej ocenianej decyzji', () => {
    renderTree();
    choose('ODPUSZCZAM');
    wait();
    choose('CHWILA, NIE TAK SZYBKO');
    expect(st().playerChoices.find((c) => c.num === 9)?.followUps).toEqual(['CHWILA, NIE TAK SZYBKO']);
    wait();
    choose('PIENIĄDZE');
    // Następna oceniana decyzja nie dziedziczy ciągu dalszego decyzji 9.
    expect(st().playerChoices.find((c) => c.num === 10)?.followUps).toBeUndefined();
    expect(st().decisionChoices[9]?.optionId).toBe('retreat');
    expect(st().decisionChoices[10]?.optionId).toBe('money');
  });

  it('nie ma trybu agregującego: config.decisionNum jest ignorowany, ocenia się per węzeł', () => {
    const onDecision = vi.fn();
    render(<DialogueTree config={{ ...config, decisionNum: 99 } as DialogueTreeConfig} onDecision={onDecision} onComplete={() => {}} />);
    choose('ODPUSZCZAM');
    expect(onDecision).toHaveBeenCalledTimes(1);
    expect(onDecision.mock.calls[0][0].num).toBe(9);
  });
});
