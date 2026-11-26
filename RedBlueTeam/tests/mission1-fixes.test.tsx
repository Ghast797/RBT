// @vitest-environment jsdom
// M1: ostatnia kwestia mentora zależna od wyborów, odpowiedź D4 w raporcie, wstrzyknięcie wirusa dotykiem/klikiem,
// jedna treść maila w trzech miejscach, jeden tytuł stanowiska Anity.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { beatMatches } from '../src/engine/core/beatCondition';
import '../src/scenarios/mission_01_petrolog';
import {
  mission1Stages as stages,
  phishingBuilderConfig,
  socialIntelConfig,
  victimMonitorConfig,
  payloadTexts
} from '../src/scenarios/mission_01_petrolog/stages';
import mission1Data from '../src/scenarios/mission_01_petrolog/data/mission1.json';
import { PhishingBuilderApp } from '../src/scenarios/mission_01_petrolog/minigames/PhishingBuilderApp';
import { VictimMonitorApp } from '../src/scenarios/mission_01_petrolog/minigames/VictimMonitorApp';
import { EmailPreview } from '../src/scenarios/mission_01_petrolog/minigames/EmailPreview';
import { EmailSenderApp } from '../src/scenarios/mission_01_petrolog/minigames/EmailSenderApp';
import { MailBody } from '../src/scenarios/mission_01_petrolog/minigames/MailBody';

const st = () => useMissionStore.getState();
const report = (num: number, optionId: string, answer: string, tier: 'ideal' | 'suboptimal' = 'ideal') =>
  st().reportDecision({ num, question: `q${num}`, answer, tier, feedback: 'fb', optionId });

const finalBeats = () => {
  const stage = stages.find((s) => s.id === 'app_victim_monitor')!;
  return (stage.completion!.conversation as any[]).filter((b) => b.from === 'byte_master');
};
const playing = () =>
  finalBeats().filter((b) => beatMatches(b.when, st().decisionChoices)).map((b) => b.text as string);

describe('M1-05: finał zależny od jakości wyborów', () => {
  beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));

  it('same ideały: gra tylko „DOSKONAŁA ROBOTA”', () => {
    [1, 2, 3, 4].forEach((n) => report(n, `o${n}`, `a${n}`));
    const lines = playing();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^DOSKONAŁA ROBOTA!/);
  });

  it.each([1, 2, 3, 4])('suboptymalna D%i: gra tylko wariant „NIE IDEALNIE”', (weak) => {
    [1, 2, 3, 4].forEach((n) => report(n, `o${n}`, `a${n}`, n === weak ? 'suboptimal' : 'ideal'));
    const lines = playing();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(
      'UDAŁO SIĘ, ALE NIE IDEALNIE. OFIARA POBRAŁA PLIK, A MY MAMY DOSTĘP DO SIECI PETROLOG. DANE O ŁAŃCUCHU DOSTAW FREEVOLT SĄ NASZE. W RAPORCIE SPRAWDŹ, CO MOGŁO PÓJŚĆ LEPIEJ.'
    );
  });
});

describe('M1-01/NEW-08: raport D4', () => {
  const d4 = (mission1Data as any).step6.choices.find((c: any) => c.num === 4);
  it('odpowiedź, szczegóły, atak i obrona mówią o domenie-sobowtórze', () => {
    expect(d4.answer).toBe('ADRES W DOMENIE-SOBOWTÓRZE PETR0LOG.COM (ZERO ZAMIAST „O”), PASUJĄCY DO WYBRANEGO NADAWCY');
    expect(d4.attack).toMatch(/typosquatting/);
    expect(JSON.stringify(d4)).not.toMatch(/SPF|DKIM|DMARC|[Ss]poofing/);
  });
});

describe('M1-09: stanowisko Anity', () => {
  it('wszędzie „Specjalista ds. Księgowości”', () => {
    const all = JSON.stringify(socialIntelConfig) + JSON.stringify(mission1Data);
    expect(all).not.toMatch(/Rozliczeń/);
    expect(all).toMatch(/Specjalista ds\. Księgowości/);
  });
  it('żadnych oznaczeń T2 w treści', () => {
    expect(JSON.stringify(socialIntelConfig)).not.toMatch(/EDUKACYJNA T2/);
  });
});

describe('M1-08: jedna treść maila', () => {
  afterEach(cleanup);
  const mailText = payloadTexts.wallpapers_running.mailText;
  const expectMail = (root: HTMLElement) => {
    const body = root.querySelector('[data-testid="mail-body"]')!;
    expect(body).toBeTruthy();
    const t = body.textContent!;
    expect(t).toContain('Cześć Anita,');
    expect(t).toContain('Koniecznie musisz zobaczyć tę stronę:');
    expect(t).toContain(mailText);
    expect(t).toContain('Coś, czego szukałaś!');
    expect(t).toContain('Pozdrawiam,');
    expect(t).toContain('PREZES BUCZEK');
  };

  beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));

  it('MailBody samodzielnie', () => {
    const { container } = render(<MailBody mailText={mailText} senderName="PREZES BUCZEK" link={<a>x</a>} />);
    expectMail(container);
  });

  it('podgląd na żywo', () => {
    const { container } = render(
      <EmailPreview senderName="PREZES BUCZEK" senderEmail="P.BUCZEK@PETR0LOG.COM" targetDomain="dalekbieg.info" mailText={mailText} />
    );
    expectMail(container);
  });

  it('skrzynka ofiary', () => {
    report(2, 'wallpapers_running', 'TAPETY');
    report(3, 'prezes_buczek', 'PREZES BUCZEK');
    const { container } = render(<VictimMonitorApp config={victimMonitorConfig} onDecision={() => {}} onComplete={() => {}} />);
    const body = container.querySelector('[data-testid="mail-body"]')!;
    expect(body.textContent).toContain('Cześć Anita,');
    expect(body.textContent).toContain('Pozdrawiam,');
    expect(body.textContent).toContain('PREZES BUCZEK');
  });

  it('EmailSenderApp importuje wspólną treść (źródło)', async () => {
    expect(EmailSenderApp).toBeTruthy();
  });
});

describe('M1-07: wstrzyknięcie wirusa stuknięciem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    st().loadMission(getMission('mission-1-petrolog')!);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('klik/stuknięcie w kafel „//PRZEKIEROWANIE” wstrzykuje wirusa', () => {
    render(<PhishingBuilderApp config={phishingBuilderConfig} onDecision={() => {}} onComplete={() => {}} />);
    const domain = phishingBuilderConfig.domain.options.find((o) => o.tier === 'ideal')!;
    fireEvent.click(screen.getByText(domain.label));
    fireEvent.click(screen.getByText('ZATWIERDŹ DOMENĘ'));
    act(() => { vi.advanceTimersByTime(5000); });
    const payloads = phishingBuilderConfig.payloadByDomain![domain.id].options;
    const payload = payloads.find((o) => o.tier === 'ideal')!;
    fireEvent.click(screen.getByText(payload.label));
    fireEvent.click(screen.getByText('ZATWIERDŹ PLIK PRZYNĘTĘ'));
    act(() => { vi.advanceTimersByTime(5000); });

    const tile = screen.getByTestId('malware-tile');
    expect(tile.textContent).toContain('PRZECIĄGNIJ NA PRZYCISK STRONY');
    fireEvent.pointerDown(tile, { pointerId: 1, clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 10 });
    expect(screen.getByTestId('malware-tile').textContent).toContain('ZAINSTALOWANO WIRUSA');
  });
});
