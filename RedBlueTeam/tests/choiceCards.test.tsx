// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FileText, Phone, Terminal } from 'lucide-react';
import { ChoiceCards } from '../src/engine/blocks/ChoiceCards';
import { renderAppIcon } from '../src/engine/registry/appRegistry';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import type { ChoiceCardsConfig, LucideIconName } from '../src/engine/types/mission';

const baseConfig: ChoiceCardsConfig = {
  decisionNum: 1,
  title: '//PRZYGOTOWANIE_DOMENY',
  subtitle: 'REJESTRACJA PODSTAWIONEJ DOMENY',
  question: 'WYBIERZ DOMENĘ, KTÓRĄ WYKUPISZ DLA PODSTAWIONEJ STRONY:',
  options: [
    {
      id: 'archiwum',
      label: 'ARCHIWUMBCORP.BIZ',
      tier: 'ideal',
      feedback: 'Spójna domena i końcówka .biz.'
    },
    {
      id: 'bcorp_pl',
      label: 'BCORP.PL',
      tier: 'suboptimal',
      feedback: 'Inna końcówka (.pl).'
    },
    {
      id: 'backup',
      label: 'BACKUP-BANK.COM',
      tier: 'suboptimal',
      feedback: 'Brak nazwy banku.',
      reject: { mentorLine: 'W TEJ DOMENIE NIE MA NAWET NAZWY BANKU BCORP. WYBIERZ INACZEJ.' }
    }
  ]
};

describe('ChoiceCards: pole info i obsługa wyborów', () => {
  beforeEach(() => {
    useMissionStore.getState().loadMission(mission2Definition);
  });

  afterEach(cleanup);

  it('bez config.info nie renderuje karty informacyjnej (pełna kompatybilność wsteczna)', () => {
    const onDecision = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <ChoiceCards config={baseConfig} onDecision={onDecision} onComplete={onComplete} />
    );

    expect(container.querySelector('[data-choice-info]')).toBeNull();

    fireEvent.click(screen.getByText('ARCHIWUMBCORP.BIZ'));
    fireEvent.click(screen.getByText('ZATWIERDŹ WYBÓR'));

    expect(onDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        num: 1,
        optionId: 'archiwum',
        answer: 'ARCHIWUMBCORP.BIZ',
        tier: 'ideal'
      })
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('renderuje statyczną kartę info między AppHeader a ChoiceZone (przypadek domeny z adresem URL)', () => {
    const configWithUrl: ChoiceCardsConfig = {
      ...baseConfig,
      info: {
        title: 'ORYGINALNY ADRES POCZTY Z BIAŁEGO WYWIADU',
        text: 'HTTPS://MAIL.BCORP.BIZ'
      }
    };

    const { container } = render(
      <ChoiceCards config={configWithUrl} onDecision={() => {}} onComplete={() => {}} />
    );

    const infoCard = container.querySelector('[data-choice-info="true"]') as HTMLElement | null;
    expect(infoCard).toBeTruthy();
    expect(screen.getByText('ORYGINALNY ADRES POCZTY Z BIAŁEGO WYWIADU')).toBeTruthy();
    expect(screen.getByText('HTTPS://MAIL.BCORP.BIZ')).toBeTruthy();

    // Karta informacyjna jest statyczna: bez przerywanej ramki, bez hovera i bez klikalnych przycisków.
    expect(infoCard!.className).not.toContain('border-dashed');
    expect(infoCard!.className).not.toContain('hover:');
    expect(infoCard!.className).not.toContain('cursor-pointer');
    expect(infoCard!.querySelectorAll('button').length).toBe(0);

    // Kolejność w DOM: AppHeader (ZADANIE) -> karta info -> ChoiceZone (▼ WYBIERZ JEDNO).
    const taskNode = screen.getByText('ZADANIE');
    const choiceLabelNode = screen.getByText('▼ WYBIERZ JEDNO');
    expect(
      Boolean(taskNode.compareDocumentPosition(infoCard!) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
    expect(
      Boolean(infoCard!.compareDocumentPosition(choiceLabelNode) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
  });

  it('renderuje info z opisem i listą pozycji (szablon numeracji i 4 działy)', () => {
    const phoneConfig: ChoiceCardsConfig = {
      decisionNum: 2,
      title: '//PRZYGOTOWANIE_NUMERU',
      question: 'WYBIERZ NUMER TELEFONU, POD KTÓRY SIĘ PODSZYJESZ:',
      info: {
        title: 'CALLER ID SPOOFING — SZABLON NUMERACJI',
        text: 'Podszyj się pod wewnętrzny numer działu IT według firmowego schematu: 891 [NR DZIAŁU] [NR PRACOWNIKA]',
        items: [
          { label: 'SPRZEDAŻ', value: '001' },
          { label: 'DZIAŁ IT', value: '002' },
          { label: 'LOGISTYKA', value: '003' },
          { label: 'SUPPORT', value: '004' }
        ]
      },
      options: [
        { id: 'n_it', label: '891 002 162', tier: 'ideal', feedback: 'Poprawny prefiks IT.' },
        { id: 'n_log', label: '891 003 427', tier: 'suboptimal', feedback: 'Logistyka.' },
        { id: 'n_ext', label: '867 452 026', tier: 'critical', feedback: 'Spoza firmy.' }
      ]
    };

    const { container } = render(
      <ChoiceCards config={phoneConfig} onDecision={() => {}} onComplete={() => {}} />
    );

    const infoCard = container.querySelector('[data-choice-info="true"]')!;
    expect(infoCard.textContent).toContain('891 [NR DZIAŁU] [NR PRACOWNIKA]');
    expect(screen.getByText('SPRZEDAŻ')).toBeTruthy();
    expect(screen.getByText('001')).toBeTruthy();
    expect(screen.getByText('DZIAŁ IT')).toBeTruthy();
    expect(screen.getByText('002')).toBeTruthy();
    expect(screen.getByText('LOGISTYKA')).toBeTruthy();
    expect(screen.getByText('003')).toBeTruthy();
    expect(screen.getByText('SUPPORT')).toBeTruthy();
    expect(screen.getByText('004')).toBeTruthy();
    expect(infoCard.querySelector('.lg\\:grid-cols-4')).toBeTruthy();
  });

  it('obsługuje items bez pola value oraz ignoruje pusty obiekt info', () => {
    const emptyInfo: ChoiceCardsConfig = { ...baseConfig, info: {} };
    const { container, rerender } = render(
      <ChoiceCards config={emptyInfo} onDecision={() => {}} onComplete={() => {}} />
    );
    expect(container.querySelector('[data-choice-info]')).toBeNull();

    const itemNoValue: ChoiceCardsConfig = {
      ...baseConfig,
      info: { items: [{ label: 'TYLKO ETYKIETA KONTEKSTU' }] }
    };
    rerender(<ChoiceCards config={itemNoValue} onDecision={() => {}} onComplete={() => {}} />);
    expect(container.querySelector('[data-choice-info="true"]')).toBeTruthy();
    expect(screen.getByText('TYLKO ETYKIETA KONTEKSTU')).toBeTruthy();
  });

  it('zachowuje czytelne rozmiary czcionek (skala M1), wstawia <wbr> przy długich domenach bez zmiany tekstu i obsługuje B2', () => {
    const detailedConfig: ChoiceCardsConfig = {
      ...baseConfig,
      info: { title: 'KONTEKST', text: 'HTTPS://MAIL.BCORP.BIZ' },
      options: [
        {
          id: 'opt_a',
          label: 'ARCHIWUMBCORP.BIZ',
          desc: 'Domena zawiera nazwę banku oraz identyczną końcówkę.',
          tags: ['COMBOSQUATTING', '.BIZ'],
          tier: 'ideal',
          feedback: 'ok'
        },
        {
          id: 'opt_rej',
          label: 'BACKUP-BANK.COM',
          desc: 'Obca domena bez nazwy banku.',
          tier: 'suboptimal',
          feedback: 'zła',
          reject: { mentorLine: 'WYBIERZ INACZEJ.' }
        }
      ]
    };

    const onDecision = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <ChoiceCards config={detailedConfig} onDecision={onDecision} onComplete={onComplete} />
    );

    const heading = screen.getByText('ARCHIWUMBCORP.BIZ');
    expect(heading.querySelectorAll('wbr').length).toBeGreaterThan(0);
    expect(heading.className).toContain('text-base');

    const desc = screen.getByText('Domena zawiera nazwę banku oraz identyczną końcówkę.');
    expect(desc.className).toContain('text-sm');

    const tag = screen.getByText('.BIZ');
    expect(tag.className).toContain('text-xs');

    // Odrzucenie B2 działa przy obecnej karcie info i blokuje opcję.
    fireEvent.click(screen.getByText('BACKUP-BANK.COM'));
    fireEvent.click(screen.getByText('ZATWIERDŹ WYBÓR'));
    expect(onDecision).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(container.querySelector('[data-mentor-reject="true"]')).toBeTruthy();
    expect(useMissionStore.getState().rejectedAttempts[1]?.[0].optionId).toBe('opt_rej');
  });
});

describe('appRegistry: ikony FileText i Phone', () => {
  it('renderAppIcon zwraca FileText i Phone zamiast domyślnego Terminal', () => {
    const fileIconName: LucideIconName = 'FileText';
    const phoneIconName: LucideIconName = 'Phone';

    const fileEl = renderAppIcon(fileIconName, 24) as ReactElement;
    const phoneEl = renderAppIcon(phoneIconName, 24) as ReactElement;

    expect(fileEl.type).toBe(FileText);
    expect(fileEl.type).not.toBe(Terminal);
    expect(phoneEl.type).toBe(Phone);
    expect(phoneEl.type).not.toBe(Terminal);
  });
});
