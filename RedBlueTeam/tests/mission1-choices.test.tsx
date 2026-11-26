// @vitest-environment jsdom
// M1: treści maila i monitora ofiary podążają za faktycznymi wyborami D2 (plik) i D3 (nadawca); D4 zależy od D3.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import '../src/scenarios/mission_01_petrolog';
import {
  phishingBuilderConfig,
  emailSenderConfig,
  victimMonitorConfig,
  payloadTexts
} from '../src/scenarios/mission_01_petrolog/stages';
import { VictimMonitorApp } from '../src/scenarios/mission_01_petrolog/minigames/VictimMonitorApp';
import { EmailPreview } from '../src/scenarios/mission_01_petrolog/minigames/EmailPreview';
import { EmailSenderApp } from '../src/scenarios/mission_01_petrolog/minigames/EmailSenderApp';

const st = () => useMissionStore.getState();

const report = (num: number, optionId: string, answer: string) =>
  st().reportDecision({ num, question: `q${num}`, answer, tier: 'ideal', feedback: 'fb', optionId });

const allD2Options = () =>
  Object.values(phishingBuilderConfig.payloadByDomain ?? {}).flatMap((p) => p.options);

describe('M1: D4 zależne od nadawcy z D3', () => {
  it('Kwiatkowski ma swoje trzy adresy, Buczek analogiczne, a poziomy są równoległe', () => {
    const by = phishingBuilderConfig.senderEmailBySender!;
    const k = by.jakub_kwiatkowski.options;
    const b = by.prezes_buczek.options;
    expect(k.map((o) => o.label)).toEqual([
      'DARKSUN.JAKUB@GMAIL.COM',
      'K.KWIATKOWSKI@HACK.COM',
      'K.KWIATKOWSKI@PETR0LOG.COM'
    ]);
    expect(b.map((o) => o.label)).toEqual(['DARKSUN.BUCZEK@GMAIL.COM', 'P.BUCZEK@HACK.COM', 'P.BUCZEK@PETR0LOG.COM']);
    expect(b.map((o) => o.tier)).toEqual(k.map((o) => o.tier));
    expect(b.map((o) => !!o.reject)).toEqual(k.map((o) => !!o.reject));
    expect(by.prezes_buczek.decisionNum).toBe(4);
    const ids = [...k, ...b].map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(emailSenderConfig.senderEmailBySender).toBe(by);
  });

  describe('EmailSenderApp', () => {
    beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));
    afterEach(cleanup);

    it.each([
      ['PREZES BUCZEK', 'P.BUCZEK@PETR0LOG.COM', 'K.KWIATKOWSKI@PETR0LOG.COM'],
      ['JAKUB KWIATKOWSKI', 'K.KWIATKOWSKI@PETR0LOG.COM', 'P.BUCZEK@PETR0LOG.COM']
    ])('po nadawcy %s oferuje tylko jego adresy', async (sender, expected, notExpected) => {
      render(
        <EmailSenderApp
          config={emailSenderConfig}
          onDecision={(r) => st().reportDecision(r)}
          onComplete={() => {}}
        />
      );
      fireEvent.click(screen.getByText(sender));
      fireEvent.click(screen.getByText('ZATWIERDŹ TOŻSAMOŚĆ NADAWCY'));
      expect(await screen.findByText(expected, {}, { timeout: 8000 })).toBeTruthy();
      expect(screen.queryByText(notExpected)).toBeNull();
    }, 15000);
  });
});

describe('M1: mapa byPayload', () => {
  it('ma wpis dla każdej opcji D2, po której gra się toczy (obie domeny), z kompletem tekstów', () => {
    const continuing = allD2Options().filter((o) => !o.reject);
    expect(continuing.map((o) => o.id).sort()).toEqual([
      'guide_muffins',
      'guide_running',
      'wallpapers_muffins',
      'wallpapers_running'
    ]);
    for (const o of continuing) {
      const t = payloadTexts[o.id];
      expect(t, o.id).toBeDefined();
      for (const v of Object.values(t)) expect(v.length).toBeGreaterThan(10);
    }
    expect(victimMonitorConfig.byPayload).toBe(payloadTexts);
    expect(emailSenderConfig.byPayload).toBe(payloadTexts);
  });
});

describe('M1: monitor ofiary i mail podążają za wyborami', () => {
  beforeEach(() => st().loadMission(getMission('mission-1-petrolog')!));
  afterEach(cleanup);

  const renderMonitor = () =>
    render(<VictimMonitorApp config={victimMonitorConfig} onDecision={() => {}} onComplete={() => {}} />);

  it('Prezes Buczek: nadawca, adres i zdziwienie Anity zamiast „zaufanego współpracownika”', () => {
    report(3, 'prezes_buczek', 'PREZES BUCZEK');
    report(4, 'buczek_petrolog', 'P.BUCZEK@PETR0LOG.COM');
    renderMonitor();
    expect(screen.getByText(/<P\.BUCZEK@PETR0LOG\.COM>/)).toBeTruthy();
    expect(screen.getAllByText(/PREZES BUCZEK/).length).toBeGreaterThan(0);
    expect(screen.getByText(/zarząd pisze do niej o bieganiu/)).toBeTruthy();
    expect(screen.queryByText(/zaufanego współpracownika/)).toBeNull();
  });

  it('Kwiatkowski: rekomendacja zaufanego współpracownika', () => {
    report(3, 'jakub_kwiatkowski', 'JAKUB KWIATKOWSKI');
    report(4, 'kwiatkowski_petrolog', 'K.KWIATKOWSKI@PETR0LOG.COM');
    renderMonitor();
    expect(screen.getByText(/rekomendację od zaufanego współpracownika/)).toBeTruthy();
    expect(screen.getByText(/<K\.KWIATKOWSKI@PETR0LOG\.COM>/)).toBeTruthy();
  });

  it.each([
    ['dalekbieg_info', 'guide_running', 'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK'],
    ['dalekbieg_info', 'wallpapers_running', 'TAPETY DLA BIEGACZY NA TELEFON'],
    ['mufina_org_pl', 'guide_muffins', 'PORADNIK KULINARNY - 10 SPRAWDZONYCH PRZEPISÓW NA DOMOWE MUFFINKI'],
    ['mufina_org_pl', 'wallpapers_muffins', 'TAPETY ZE SŁODKIMI MUFFINKAMI NA TELEFON']
  ])('%s / %s: mail, strona, przycisk i stopka z mapy byPayload', (domainId, payloadId, label) => {
    const domainLabel = phishingBuilderConfig.domain.options.find((o) => o.id === domainId)!.label;
    report(1, domainId, domainLabel);
    report(2, payloadId, label);
    report(3, 'jakub_kwiatkowski', 'JAKUB KWIATKOWSKI');
    report(4, 'kwiatkowski_petrolog', 'K.KWIATKOWSKI@PETR0LOG.COM');
    const t = payloadTexts[payloadId];
    renderMonitor();
    expect(screen.getByText(t.mailText)).toBeTruthy();
    for (const [id, other] of Object.entries(payloadTexts)) {
      if (id !== payloadId) expect(screen.queryByText(other.mailText)).toBeNull();
    }
    fireEvent.click(screen.getByText('OFIARA KLIKA LINK W MAILU'));
    expect(screen.getByText(t.pageBadge)).toBeTruthy();
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText(t.pageDescription)).toBeTruthy();
    expect(screen.getByText(t.downloadButton)).toBeTruthy();
    expect(screen.getByText(t.footer)).toBeTruthy();
  });

  it('EmailPreview pokazuje zdanie o przynęcie przekazane z konfiguracji', () => {
    render(
      <EmailPreview
        senderName="PREZES BUCZEK"
        senderEmail="P.BUCZEK@PETR0LOG.COM"
        targetDomain="dalekbieg.info"
        mailText={payloadTexts.wallpapers_running.mailText}
      />
    );
    expect(screen.getByText(/Mają super tapety dla biegaczy na telefon!/)).toBeTruthy();
    expect(screen.getByText('p.buczek@petr0log.com')).toBeTruthy();
    expect(screen.getAllByText(/PREZES BUCZEK/).length).toBeGreaterThan(0);
  });
});
