// @vitest-environment jsdom
// M1: podpowiedzi raportu zależne od D1/D3, pochwała w kreatorze strony, zdanie zamykające maila
// zależne od przynęty, reakcja ofiary na maila od prezesa.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { DebriefApp } from '../src/engine/apps/DebriefApp';
import '../src/scenarios/mission_01_petrolog';
import {
  phishingBuilderConfig,
  victimMonitorConfig,
  payloadTexts
} from '../src/scenarios/mission_01_petrolog/stages';
import { PhishingBuilderApp } from '../src/scenarios/mission_01_petrolog/minigames/PhishingBuilderApp';
import { VictimMonitorApp } from '../src/scenarios/mission_01_petrolog/minigames/VictimMonitorApp';
import { MailBody } from '../src/scenarios/mission_01_petrolog/minigames/MailBody';
import type { PlayerChoiceRecord } from '../src/engine/types/mission';

const st = () => useMissionStore.getState();
const MUFFIN_IDEAL = 'PORADNIK KULINARNY - 10 SPRAWDZONYCH PRZEPISÓW NA DOMOWE MUFFINKI';
const RUNNING_GUIDE = 'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK';

const rec = (num: number, answer: string, outcome: PlayerChoiceRecord['outcome']): PlayerChoiceRecord => ({
  num,
  question: `q${num}`,
  answer,
  isCorrect: outcome === 'ideal',
  details: 'd',
  outcome
});

/** Ustawia zgłoszone decyzje (D1 domena, D2 plik, D3 nadawca, D4 adres) i otwiera raport na wybranym kroku. */
const showReport = (ids: { 1: string; 2: string; 3: string; 4: string }, openIdx: number) => {
  const decisionChoices: Record<number, { answer: string; tier: 'suboptimal'; optionId: string }> = {};
  ([1, 2, 3, 4] as const).forEach((n) => {
    decisionChoices[n] = { answer: `a${n}`, tier: 'suboptimal', optionId: ids[n] };
  });
  useMissionStore.setState({
    playerChoices: [1, 2, 3, 4].map((n) => rec(n, `a${n}`, 'suboptimal')),
    decisionChoices,
    expandedChoiceIndex: openIdx
  } as any);
  return render(<DebriefApp />);
};

describe('M1: podpowiedź D2 w raporcie zależy od domeny z D1', () => {
  beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));
  afterEach(cleanup);

  it('domena MUFINA.ORG.PL: „CO ZADZIAŁAŁOBY LEPIEJ” wskazuje poradnik kulinarny', () => {
    showReport({ 1: 'mufina_org_pl', 2: 'wallpapers_muffins', 3: 'jakub_kwiatkowski', 4: 'kwiatkowski_petrolog' }, 1);
    expect(screen.getByText(new RegExp(MUFFIN_IDEAL))).toBeTruthy();
    expect(screen.queryByText(new RegExp(RUNNING_GUIDE))).toBeNull();
  });

  it('domena DALEKBIEG.INFO: zostaje poradnik biegowy', () => {
    showReport({ 1: 'dalekbieg_info', 2: 'wallpapers_running', 3: 'jakub_kwiatkowski', 4: 'kwiatkowski_petrolog' }, 1);
    expect(screen.getByText(new RegExp(RUNNING_GUIDE))).toBeTruthy();
    expect(screen.queryByText(new RegExp(MUFFIN_IDEAL))).toBeNull();
  });
});

describe('M1: podpowiedź D4 w raporcie zależy od nadawcy z D3', () => {
  beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));
  afterEach(cleanup);

  it('nadawca PREZES BUCZEK: adres P.BUCZEK@PETR0LOG.COM', () => {
    showReport({ 1: 'dalekbieg_info', 2: 'guide_running', 3: 'prezes_buczek', 4: 'buczek_petrolog' }, 3);
    expect(screen.getByText(/P\.BUCZEK@PETR0LOG\.COM/)).toBeTruthy();
    expect(screen.queryByText(/K\.KWIATKOWSKI@PETR0LOG\.COM/)).toBeNull();
  });

  it('nadawca JAKUB KWIATKOWSKI: adres K.KWIATKOWSKI@PETR0LOG.COM', () => {
    showReport({ 1: 'dalekbieg_info', 2: 'guide_running', 3: 'jakub_kwiatkowski', 4: 'kwiatkowski_petrolog' }, 3);
    expect(screen.getByText(/K\.KWIATKOWSKI@PETR0LOG\.COM/)).toBeTruthy();
    expect(screen.queryByText(/P\.BUCZEK@PETR0LOG\.COM/)).toBeNull();
  });
});

describe('M1: pochwała w kreatorze strony', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    st().loadMission(getMission('mission-1-petrolog')!);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it.each([
    ['dalekbieg_info', 'guide_running'],
    ['mufina_org_pl', 'wallpapers_muffins']
  ])('bez „DOSKONALE!” dla ścieżki %s / %s', (domainId, payloadId) => {
    render(<PhishingBuilderApp config={phishingBuilderConfig} onDecision={() => {}} onComplete={() => {}} />);
    const domain = phishingBuilderConfig.domain.options.find((o) => o.id === domainId)!;
    fireEvent.click(screen.getByText(domain.label));
    fireEvent.click(screen.getByText('ZATWIERDŹ DOMENĘ'));
    act(() => { vi.advanceTimersByTime(5000); });
    const payload = phishingBuilderConfig.payloadByDomain![domain.id].options.find((o) => o.id === payloadId)!;
    fireEvent.click(screen.getByText(payload.label));
    fireEvent.click(screen.getByText('ZATWIERDŹ PLIK PRZYNĘTĘ'));
    act(() => { vi.advanceTimersByTime(5000); });
    const tile = screen.getByTestId('malware-tile');
    fireEvent.pointerDown(tile, { pointerId: 1, clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.click(screen.getByText('ZAPISZ STRONĘ I PRZEJDŹ DALEJ'));

    const heading = screen.getByText('STRONA-PUŁAPKA ZOSTAŁA SKONFIGUROWANA I ZAINFEKOWANA');
    expect(heading.textContent).toBe('STRONA-PUŁAPKA ZOSTAŁA SKONFIGUROWANA I ZAINFEKOWANA');
    expect(document.body.textContent).not.toMatch(/DOSKONALE/);
  });
});

describe('M1: zdanie zamykające maila zależy od przynęty', () => {
  afterEach(cleanup);

  it.each([
    ['guide_running', 'Coś, czego szukałaś!'],
    ['wallpapers_running', 'Coś dla Ciebie przed treningiem!'],
    ['guide_muffins', 'Pomyślałem o Tobie, jak to zobaczyłem!'],
    ['wallpapers_muffins', 'Pomyślałem o Tobie, jak to zobaczyłem!']
  ] as const)('przynęta %s: zamknięcie „%s”', (id, closing) => {
    expect(payloadTexts[id].closing).toBe(closing);
    const { container } = render(
      <MailBody mailText={payloadTexts[id].mailText} closing={payloadTexts[id].closing} senderName="X" link={<a>l</a>} />
    );
    const body = container.querySelector('[data-testid="mail-body"]')!;
    expect(body.textContent).toContain(closing);
  });

  it('bez zamknięcia nie ma dodatkowego zdania', () => {
    const { container } = render(<MailBody mailText="M" senderName="X" link={<a>l</a>} />);
    expect(container.querySelector('[data-testid="mail-body"]')!.textContent).not.toContain('Coś');
  });
});

describe('M1: reakcja ofiary na maila od prezesa', () => {
  beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));
  afterEach(cleanup);

  it('tekst bez mowy o bieganiu', () => {
    expect(victimMonitorConfig.bySender.prezes_buczek.reaction).toBe(
      'Anita właśnie otrzymała maila od prezesa i dziwi się, że zarząd pisze do niej o takich sprawach. Ciekawość jednak wygrywa.'
    );
  });

  it('w monitorze ofiary po wyborze prezesa', () => {
    useMissionStore.setState({
      decisionChoices: {
        1: { answer: 'a1', tier: 'ideal', optionId: 'mufina_org_pl' },
        2: { answer: 'a2', tier: 'suboptimal', optionId: 'wallpapers_muffins' },
        3: { answer: 'PREZES BUCZEK', tier: 'suboptimal', optionId: 'prezes_buczek' },
        4: { answer: 'a4', tier: 'suboptimal', optionId: 'buczek_hack' }
      }
    } as any);
    render(<VictimMonitorApp config={victimMonitorConfig} onDecision={() => {}} onComplete={() => {}} />);
    expect(screen.getByText(/zarząd pisze do niej o takich sprawach/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/o bieganiu/);
  });
});
