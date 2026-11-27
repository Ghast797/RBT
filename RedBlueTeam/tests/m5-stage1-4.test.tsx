// @vitest-environment jsdom
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { sounds } from '../src/engine/audio/soundEffects';
import { IntelPdfApp } from '../src/scenarios/mission_05_bank_bcorp/minigames/IntelPdfApp';
import { PageClonerApp } from '../src/scenarios/mission_05_bank_bcorp/minigames/PageClonerApp';
import type { IntelPdfConfig, PageClonerConfig } from '../src/scenarios/mission_05_bank_bcorp/minigames/types';

const intelConfig: IntelPdfConfig = {
  title: '//FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  task: 'PRZECZYTAJ DOKUMENT Z BIAŁEGO WYWIADU I ZAPAMIĘTAJ DANE PRZED ROZMOWĄ.',
  fileName: 'FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  notice: 'WAŻNE INFORMACJE — BĘDZIESZ WYKORZYSTYWAŁ TE INFORMACJE PODCZAS ROZMOWY. DOBRZE JE ZAPAMIĘTAJ!',
  points: [
    'FILIP PRACUJE W BANKU BCORP JAKO DYREKTOR SPRZEDAŻY',
    'JEGO PRZEŁOŻONYM JEST DAWID MAJEWSKI. OBECNIE PRZEBYWA NA URLOPIE',
    'MICHAŁ MITNIK TO ŚWIEŻY PRACOWNIK DZIAŁU IT. JEGO SZEFOWĄ JEST SANDRA JASIŃSKA',
    'WYKUP PODOBNĄ DOMENĘ. ADRES POCZTY FIRMOWEJ TO: HTTPS://MAIL.BCORP.BIZ'
  ],
  portraitAsset: { group: 'intel', name: 'filip_wojcik' },
  confirmLabel: 'ZAMKNIJ DOKUMENT'
};

const clonerConfig: PageClonerConfig = {
  title: '//PRZYGOTOWANIE_STRONY',
  task: 'ZAPROJEKTUJ FAŁSZYWĄ STRONĘ LOGOWANIA NA WZÓR ORYGINALNEGO SERWISU.',
  originalUrl: '//MAIL.BCORP.BIZ/LOGIN',
  fakeUrlIdeal: '//MAIL.ARCHIWUMBCORP.BIZ/LOGIN',
  fakeUrlSuboptimal: '//MAIL.BCORP.PL/LOGIN',
  footerText: 'BCORP BANK © 2024',
  brandTitle: 'BCORP SYSTEM POCZTY',
  logoAsset: { group: 'site', name: 'bcorp_logo' },
  elements: [
    { id: 'logo', label: 'BCORP SYSTEM POCZTY', slotLabel: 'MIEJSCE NA NAGŁÓWEK Z LOGO' },
    { id: 'login', label: 'LOGIN', slotLabel: 'MIEJSCE NA POLE LOGIN' },
    { id: 'password', label: 'HASŁO', slotLabel: 'MIEJSCE NA POLE HASŁO' },
    { id: 'submit', label: 'ZALOGUJ', slotLabel: 'MIEJSCE NA PRZYCISK ZALOGUJ' }
  ]
};

describe('Misja 5 Etap 1 — IntelPdfApp (//FILIP_WOJCIK_BIALY_WYWIAD.PDF)', () => {
  afterEach(cleanup);

  it('renderuje nazwę pliku, wyróżnione WAŻNE INFORMACJE, 4 punkty OSINT i zastępnik ImageSlot', () => {
    const onDecision = vi.fn();
    const onComplete = vi.fn();
    render(<IntelPdfApp config={intelConfig} onDecision={onDecision} onComplete={onComplete} />);

    expect(screen.getByText('FILIP_WOJCIK_BIALY_WYWIAD.PDF')).toBeTruthy();
    expect(screen.getByText(intelConfig.notice)).toBeTruthy();
    for (const point of intelConfig.points) {
      expect(screen.getByText(point)).toBeTruthy();
    }
    expect(screen.getByText('assets/intel/filip_wojcik.png')).toBeTruthy();
  });

  it('kliknięcie ZAMKNIJ DOKUMENT wywołuje onComplete() i nie zgłasza decyzji', () => {
    const onDecision = vi.fn();
    const onComplete = vi.fn();
    render(<IntelPdfApp config={intelConfig} onDecision={onDecision} onComplete={onComplete} />);

    fireEvent.click(screen.getByText('ZAMKNIJ DOKUMENT'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onDecision).not.toHaveBeenCalled();
  });
});

describe('Misja 5 Etap 4 — PageClonerApp (//PRZYGOTOWANIE_STRONY)', () => {
  beforeEach(() => {
    useMissionStore.getState().resetGame();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const tapElement = (testId: string) => {
    const el = screen.getByTestId(testId);
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 10 });
  };

  it('skutek odroczony D1: domyślnie //MAIL.ARCHIWUMBCORP.BIZ/LOGIN, przy bcorp_pl pokazuje //MAIL.BCORP.PL/LOGIN oraz spójną stopkę', () => {
    const onDecision = vi.fn();
    const onComplete = vi.fn();

    const { rerender } = render(<PageClonerApp config={clonerConfig} onDecision={onDecision} onComplete={onComplete} />);
    expect(screen.getByTestId('fake-url-bar').textContent).toBe('//MAIL.ARCHIWUMBCORP.BIZ/LOGIN');
    expect(screen.getByTestId('original-url-bar').textContent).toBe('//MAIL.BCORP.BIZ/LOGIN');
    expect(screen.getAllByText('BCORP BANK © 2024')).toHaveLength(2);
    expect(screen.getByText('assets/site/bcorp_logo.png')).toBeTruthy();

    act(() => {
      useMissionStore.setState({
        decisionChoices: {
          1: { optionId: 'bcorp_pl', answer: 'BCORP.PL', tier: 'suboptimal' }
        }
      });
    });
    rerender(<PageClonerApp config={clonerConfig} onDecision={onDecision} onComplete={onComplete} />);
    expect(screen.getByTestId('fake-url-bar').textContent).toBe('//MAIL.BCORP.PL/LOGIN');
  });

  it('przebieg 3 kroków: ZAPROJEKTUJ -> kopiowanie 4 elementów (klik-klik + drag, odrzucenie złego slotu bez kary) -> USTAW TRYB PRZECHWYTYWANIA DANYCH -> ŚWIETNIE! -> onComplete', () => {
    const errorSpy = vi.spyOn(sounds, 'playError');
    const onDecision = vi.fn();
    const onComplete = vi.fn();

    render(<PageClonerApp config={clonerConfig} onDecision={onDecision} onComplete={onComplete} />);

    // Krok 1: ZAPROJEKTUJ
    fireEvent.click(screen.getByText('ZAPROJEKTUJ'));
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    // Szkielet 4 pustych slotów widoczny, przycisk trybu przechwytywania nieaktywny
    const captureBtn = screen.getByRole('button', { name: /USTAW TRYB PRZECHWYTYWANIA DANYCH/i }) as HTMLButtonElement;
    expect(captureBtn.disabled).toBe(true);
    expect(screen.getByTestId('fake-slot-logo').textContent).toContain('MIEJSCE NA NAGŁÓWEK Z LOGO');

    // QA-S4-11: elementy oryginalnej strony (role="button") mają nazwę dostępną z configu
    for (const el of clonerConfig.elements) {
      expect(screen.getByRole('button', { name: `Skopiuj: ${el.slotLabel}` })).toBe(
        screen.getByTestId(`orig-element-${el.id}`)
      );
    }

    // Klik-klik: zaznaczenie i odznaczenie elementu
    tapElement('orig-element-logo');
    tapElement('orig-element-logo');
    // Klik w slot bez zaznaczenia nie zgłasza decyzji ani kary
    fireEvent.click(screen.getByTestId('fake-slot-login'));
    expect(onDecision).not.toHaveBeenCalled();

    // Zaznaczenie logo i kliknięcie złego slotu (login) -> błąd dźwięku + ostrzeżenie, bez reportDecision
    tapElement('orig-element-logo');
    fireEvent.click(screen.getByTestId('fake-slot-login'));
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(onDecision).not.toHaveBeenCalled();
    expect(screen.getByText(/NIE PASUJE DO TEGO SLOTU/i)).toBeTruthy();

    // Kliknięcie właściwego slotu logo -> wstawia element
    fireEvent.click(screen.getByTestId('fake-slot-logo'));
    expect(screen.getByTestId('fake-slot-logo').textContent).toContain('BCORP SYSTEM POCZTY');

    // Przeniesienie login i password przez klik-klik
    tapElement('orig-element-login');
    fireEvent.click(screen.getByTestId('fake-slot-login'));
    tapElement('orig-element-password');
    fireEvent.click(screen.getByTestId('fake-slot-password'));
    expect(captureBtn.disabled).toBe(true);

    // Przeniesienie submit przez przeciąganie wskaźnikiem (pointerDown -> pointerMove -> pointerUp)
    const submitSlot = screen.getByTestId('fake-slot-submit');
    submitSlot.getBoundingClientRect = () =>
      ({ left: 100, top: 200, right: 260, bottom: 250, width: 160, height: 50, x: 100, y: 200, toJSON: () => ({}) }) as DOMRect;
    const submitOrig = screen.getByTestId('orig-element-submit');
    fireEvent.pointerDown(submitOrig, { pointerId: 2, clientX: 400, clientY: 220, button: 0 });
    fireEvent.pointerMove(window, { pointerId: 2, clientX: 150, clientY: 220 });
    fireEvent.pointerUp(window, { pointerId: 2, clientX: 150, clientY: 220 });

    // Wszystkie 4 elementy skopiowane -> przycisk aktywny
    expect(captureBtn.disabled).toBe(false);

    // Krok 3: USTAW TRYB PRZECHWYTYWANIA DANYCH -> loader -> ŚWIETNIE! -> automatyczne onComplete()
    fireEvent.click(captureBtn);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('ŚWIETNIE!')).toBeTruthy();
    expect(screen.getByTestId('capture-arrows')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onDecision).not.toHaveBeenCalled();
  });
});

describe('Misja 5 Etap 1 i 4 — zgodność statyczna z zasadami M3/M4', () => {
  it('brak literałów label="..." w <ImageSlot> oraz brak czcionek mniejszych niż 0.75rem poza ui.tsx', () => {
    const dir = path.resolve(process.cwd(), 'src/scenarios/mission_05_bank_bcorp/minigames');
    for (const file of ['IntelPdfApp.tsx', 'PageClonerApp.tsx']) {
      const src = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(src, `${file}: ImageSlot z literałem label`).not.toMatch(/<ImageSlot[^>]*\slabel="/);
      const small = [...src.matchAll(/text-\[(\d*\.?\d+)rem\]/g)]
        .filter((m) => parseFloat(m[1]) < 0.75)
        .map((m) => m[0]);
      expect(small, `${file}: zbyt małe czcionki`).toEqual([]);
    }
  });
});
