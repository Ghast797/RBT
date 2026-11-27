// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { DebriefApp } from '../src/engine/apps/DebriefApp';
import { DialogueTree } from '../src/engine/blocks/DialogueTree';
import { ChoiceCardGrid } from '../src/engine/components/ChoiceZone';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { DialogueTreeConfig } from '../src/engine/types/mission';

afterEach(cleanup);

describe('ChoiceZone: łamanie adresów', () => {
  it('softBreaks wstawia niewidoczne miejsca łamania po @, _ i .', async () => {
    const { softBreaks } = await import('../src/engine/components/ChoiceZone');
    const z = String.fromCharCode(0x200b);
    expect(softBreaks('A@B.BIZ')).toBe(`A@${z}B.${z}BIZ`);
    expect(softBreaks('plik_a.exe').split(z).join('')).toBe('plik_a.exe');
  });
});

describe('modal wyjścia z raportu po polsku', () => {
  beforeEach(() => useMissionStore.getState().loadMission(mission2Definition));

  it('bez angielskich statusów, z informacją o najlepszym wyniku', () => {
    useMissionStore.setState({ isExitModalOpen: true, isScormSubmitted: true });
    const { container } = render(<DebriefApp />);
    expect(screen.getByText('SESJA ZAKOŃCZONA, WYNIK ZAPISANY')).toBeTruthy();
    expect(screen.getByText('W MOODLE ZOSTAJE TWÓJ NAJLEPSZY WYNIK.')).toBeTruthy();
    expect(container.textContent).not.toMatch(/TERMINATED|COMMITTED|\(FAILED\)|\(PASSED\)/);
  });

  it('nieudany zapis ma polski komunikat', () => {
    useMissionStore.setState({ isExitModalOpen: true, isScormSubmitted: false });
    render(<DebriefApp />);
    expect(screen.getByText('ZAPIS NIEUDANY')).toBeTruthy();
  });
});

describe('DialogueTree: autoprzewijanie', () => {
  const config: DialogueTreeConfig = {
    respondent: 'OFIARA',
    nodes: [
      { id: 'a', incoming: 'Pierwsza', options: [{ id: 'x', label: 'ODP', tier: 'ideal', feedback: 'f', nextNode: 'b' }] },
      { id: 'b', incoming: 'Druga', options: [{ id: 'y', label: 'ODP2', tier: 'ideal', feedback: 'f' }] }
    ]
  };

  it('po nowej wiadomości przewija listę na dół', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    (Element.prototype as unknown as { scrollIntoView: unknown }).scrollIntoView = spy;
    useMissionStore.getState().loadMission(mission2Definition);
    render(<DialogueTree config={config} onDecision={() => {}} onComplete={() => {}} />);
    spy.mockClear();
    fireEvent.click(screen.getByText('ODP'));
    expect(spy).toHaveBeenCalled();
    spy.mockClear();
    act(() => void vi.advanceTimersByTime(2000));
    expect(screen.getByText('Druga')).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    vi.useRealTimers();
  });
});

describe('baner odrzucenia przez mentora', () => {
  const options = [
    { id: 'a', label: 'OPCJA A' },
    { id: 'b', label: 'OPCJA B' }
  ];
  beforeEach(() => {
    useMissionStore.getState().loadMission(mission2Definition);
    useMissionStore.setState({
      rejectedAttempts: { 5: [{ optionId: 'a', answer: 'OPCJA A', tier: 'suboptimal', mentorLine: 'Nie tak.' }] }
    });
  });

  it('widoczny po odrzuceniu, znika gdy gracz zmieni wybór', () => {
    const { container, rerender } = render(
      <ChoiceCardGrid accent="#0f0" options={options} selectedId={null} onSelect={() => {}} decisionNum={5} />
    );
    expect(container.querySelector('[data-mentor-reject]')).toBeTruthy();
    rerender(<ChoiceCardGrid accent="#0f0" options={options} selectedId="b" onSelect={() => {}} decisionNum={5} />);
    expect(container.querySelector('[data-mentor-reject]')).toBeNull();
  });
});
