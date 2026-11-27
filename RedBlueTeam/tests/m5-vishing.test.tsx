// @vitest-environment jsdom
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { sounds } from '../src/engine/audio/soundEffects';
import type { DecisionReport } from '../src/engine/types/mission';
import { VishingApp } from '../src/scenarios/mission_05_bank_bcorp/minigames/VishingApp';
import type { VishingCallConfig } from '../src/scenarios/mission_05_bank_bcorp/minigames/types';

const vishingConfig: VishingCallConfig = {
  title: '//ROZMOWA',
  subtitle: 'FILIP WÓJCIK — BCORP BANK',
  taskPhase1: 'PRZEPROWADŹ ROZMOWĘ VISHINGOWĄ I NAKŁOŃ ROZMÓWCĘ DO ZALOGOWANIA SIĘ NA FAŁSZYWEJ STRONIE.',
  taskPhase2: 'PRZECHWYĆ DANE LOGOWANIA Z FAŁSZYWEJ STRONY I ZALOGUJ SIĘ NA ORYGINALNEJ STRONIE BANKU.',
  readyScreen: {
    title: 'POŁĄCZENIE WYCHODZĄCE',
    message: 'MOGĘ JUŻ ZADZWONIĆ DO PRACOWNIKA. MUSZĘ UWAŻAĆ, ABY NIE POWIEDZIEĆ CZEGOŚ PODEJRZANEGO',
    buttonLabel: 'ZADZWOŃ DO FILIPA WÓJCIKA'
  },
  osintNotesTitle: 'NOTATKI Z BIAŁEGO WYWIADU',
  osintNotes: [
    'FILIP PRACUJE W BANKU BCORP JAKO DYREKTOR SPRZEDAŻY',
    'JEGO PRZEŁOŻONYM JEST DAWID MAJEWSKI. OBECNIE PRZEBYWA NA URLOPIE',
    'MICHAŁ MITNIK TO ŚWIEŻY PRACOWNIK DZIAŁU IT. JEGO SZEFOWĄ JEST SANDRA JASIŃSKA',
    'WYKUP PODOBNĄ DOMENĘ. ADRES POCZTY FIRMOWEJ TO: HTTPS://MAIL.BCORP.BIZ'
  ],
  calleeName: 'FILIP WÓJCIK',
  openingLine: 'DZIEŃ DOBRY, FILIP WÓJCIK, BCORP BANK. W CZYM MOGĘ POMÓC?',
  turns: [
    {
      decisionNum: 3,
      question: 'DZIEŃ DOBRY, FILIP WÓJCIK, BCORP BANK. W CZYM MOGĘ POMÓC?',
      options: [
        {
          id: 'd3_ideal',
          label: 'DZIEŃ DOBRY PANIE FILIPIE.',
          tier: 'ideal',
          feedback: 'Uprzejme, formalne powitanie z użyciem właściwego imienia buduje profesjonalne pierwsze wrażenie.'
        },
        {
          id: 'd3_dawid',
          label: 'DZIEŃ DOBRY PANIE DAWIDZIE.',
          tier: 'suboptimal',
          feedback: 'Pomylenie imienia rozmówcy z imieniem jego przełożonego od razu zdradza brak przygotowania.',
          reaction: 'CHYBA POMYŁKA — TU FILIP WÓJCIK, DAWID JEST NA URLOPIE. Z KIM ROZMAWIAM?'
        },
        {
          id: 'd3_casual',
          label: 'CZEŚĆ FILIP!',
          tier: 'suboptimal',
          feedback: 'Zbyt poufałe powitanie dyrektora przez nowego pracownika IT brzmi nienaturalnie.',
          reaction: 'SŁUCHAM? CHYBA SIĘ NIE ZNAMY. Z KIM ROZMAWIAM?'
        },
        {
          id: 'd3_critical',
          label: 'HEJ STARY!',
          tier: 'critical',
          feedback: 'Nieprofesjonalny zwrot do dyrektora banku natychmiast spalił przykrywkę.'
        }
      ]
    },
    {
      decisionNum: 4,
      question: 'PRZEDSTAW SIĘ ROZMÓWCY:',
      options: [
        {
          id: 'd4_ideal',
          label: 'TU MICHAŁ, MICHAŁ MITNIK',
          tier: 'ideal',
          feedback: 'Poprawne imię i nazwisko nowego pracownika IT zgadzają się z białym wywiadem.',
          reaction: 'O CO CHODZI?'
        },
        {
          id: 'd4_witnik',
          label: 'NAZYWAM SIĘ MICHAŁ WITNIK',
          tier: 'suboptimal',
          feedback: 'Przekręcenie nazwiska pracownika osłabia wiarygodność.',
          reaction: 'WITNIK? NIE KOJARZĘ, ALE OK — O CO CHODZI?'
        },
        {
          id: 'd4_marcin',
          label: 'TU MARCIN, MARCIN MITNIK',
          tier: 'suboptimal',
          feedback: 'Błędne imię pracownika IT nie zgadza się z białym wywiadem.',
          reaction: 'MARCIN MITNIK? NIE KOJARZĘ... O CO CHODZI?'
        },
        {
          id: 'd4_critical',
          label: 'MARCIN RYBNIK Z TWOJEJ FIRMY',
          tier: 'critical',
          feedback: 'Zmyślone nazwisko i nienaturalny zwrot zdradzają osobę spoza organizacji.'
        }
      ]
    },
    {
      decisionNum: 5,
      question: 'O CO CHODZI?',
      options: [
        {
          id: 'd5_ideal',
          label: 'PRACUJĘ W DZIALE IT',
          tier: 'ideal',
          feedback: 'Dział IT zgadza się z wybranym numerem telefonu i pretekstem testów.'
        },
        {
          id: 'd5_sales',
          label: 'PRACUJĘ W DZIALE SPRZEDAŻY',
          tier: 'critical',
          feedback: 'Filip sam kieruje działem sprzedaży, więc podanie się za jego pracownika natychmiast zdemaskowało rozmówcę.'
        },
        {
          id: 'd5_logistics',
          label: 'PRACUJĘ W DZIALE LOGISTYKI',
          tier: 'suboptimal',
          feedback: 'Dział logistyki nie pasuje do sfałszowanego numeru ani testów poczty.',
          reject: {
            mentorLine:
              'LOGISTYKA NIE TESTUJE SYSTEMU POCZTOWEGO I NIE PASUJE DO NUMERU, Z KTÓREGO DZWONISZ. WYBIERZ INACZEJ.'
          }
        },
        {
          id: 'd5_support',
          label: 'PRACUJĘ W DZIALE WSPARCIA KLIENTA',
          tier: 'suboptimal',
          feedback: 'Dział wsparcia klienta nie zajmuje się testowaniem systemów pocztowych.',
          reject: {
            mentorLine: 'WSPARCIE KLIENTA NIE WDRAŻA ARCHIWIZACJI POCZTY I NIE PASUJE DO WYBRANEGO NUMERU. WYBIERZ INACZEJ.'
          }
        }
      ],
      afterPlayerLine: 'TESTUJEMY WŁAŚNIE NOWY SYSTEM ARCHIWIZACJI POCZTY. MASZ MOŻE 5 MINUT?',
      afterCalleeLine: 'ZA CHWILĘ MAM SPOTKANIE. MOŻE PÓŹNIEJ?'
    },
    {
      decisionNum: 6,
      question: 'ZA CHWILĘ MAM SPOTKANIE. MOŻE PÓŹNIEJ?',
      options: [
        {
          id: 'd6_ideal',
          label: 'PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA',
          tier: 'ideal',
          feedback: 'Uprzejma presja czasu skłania ofiarę do szybkiego działania.',
          reaction: 'MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...'
        },
        {
          id: 'd6_bored',
          label: 'NUDZI MI SIĘ, NIE BĄDŹ TAKI...',
          tier: 'critical',
          feedback: 'Niepoważny ton wobec zabieganego dyrektora natychmiast spala przykrywkę.'
        },
        {
          id: 'd6_client',
          label: 'TO PILNE. MAM PROBLEM Z TRUDNYM KLIENTEM, MUSISZ MI POMÓC',
          tier: 'suboptimal',
          feedback: 'Zmiana pretekstu na trudnego klienta przeczy wcześniejszej informacji o testach poczty.',
          reaction:
            'KLIENTEM? MYŚLAŁEM, ŻE CHODZI O TESTY POCZTY... ZRESZTĄ MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...'
        },
        {
          id: 'd6_reports',
          label: 'PRZEPRASZAM, ALE TO PILNE. POTRZEBUJĘ RAPORTÓW FINANSOWYCH KTÓRE MASZ NA POCZCIE',
          tier: 'critical',
          feedback: 'Prośba o poufne raporty finansowe natychmiast zdradza prawdziwy cel ataku.'
        }
      ]
    },
    {
      decisionNum: 7,
      question: 'MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...',
      options: [
        {
          id: 'd7_ideal',
          label: 'Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRY, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE',
          tier: 'ideal',
          feedback: 'Połączenie faktu o urlopie Dawida z autorytetem Sandry rozbraja wątpliwości.'
        },
        {
          id: 'd7_dawid',
          label: 'PAN DAWID WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ',
          tier: 'suboptimal',
          feedback: 'Powołanie się na przełożonego na urlopie słabiej uwiarygadnia prośbę.',
          reaction: 'DAWID JEST TERAZ NA URLOPIE, NIE MAM JAK GO ZAPYTAĆ... DZIWNE, ŻE NIC MI WCZEŚNIEJ NIE MÓWIŁ.'
        },
        {
          id: 'd7_free',
          label: 'TWÓJ PRZEŁOŻONY MA PRZECIEŻ WOLNE, DLATEGO NIC NIE WIESZ',
          tier: 'suboptimal',
          feedback: 'Lekceważący ton bez powołania się na osobę decyzyjną obniża zaufanie.',
          reaction: 'WIEM, ŻE JEST NA URLOPIE, ALE TO NIE ZNACZY, ŻE MOGĘ WIERZYĆ NA SŁOWO...'
        },
        {
          id: 'd7_darek',
          label: 'DAREK WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ',
          tier: 'suboptimal',
          feedback: 'Błędne imię przełożonego i zbyt poufały zwrot podważają wiarygodność.',
          reaction: 'DAREK? CHYBA DAWID — I ON JEST NA URLOPIE. NIE BRZMI TO PRZEKONUJĄCO...'
        }
      ]
    },
    {
      decisionNum: 8,
      question: 'DOMKNIJ PERSWAZJĘ:',
      options: [
        {
          id: 'd8_ideal',
          label: 'SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY',
          tier: 'ideal',
          feedback: 'Społeczny dowód słuszności i troska o bezpieczeństwo firmy przełamują opór.',
          reaction: 'OK, JEŚLI TAK TO WYGLĄDA, CO MAM ROBIĆ?'
        },
        {
          id: 'd8_rush',
          label: 'TO NIE ZAJMIE DŁUGO, WIĘC NIE MUSISZ SIĘ ZASTANAWIAĆ',
          tier: 'suboptimal',
          feedback: 'Zniechęcanie do zastanowienia brzmi natrętnie.',
          reaction: 'NIE LUBIĘ TAKIEGO POŚPIECHU, ALE DOBRA — JEŚLI TO CHWILA, CO MAM ROBIĆ?'
        },
        {
          id: 'd8_human',
          label: 'ZRESZTĄ CZEMU MIAŁBYŚ MI NIE POMÓC? BĄDŹ CZŁOWIEKIEM...',
          tier: 'suboptimal',
          feedback: 'Emocjonalny, nieprofesjonalny ton obniża wiarygodność.',
          reaction: 'ECH, NIE MAM CZASU NA DYSKUSJE. MÓW SZYBKO, CO MAM ROBIĆ?'
        }
      ]
    },
    {
      decisionNum: 9,
      question: 'OK, JEŚLI TAK TO WYGLĄDA, CO MAM ROBIĆ?',
      options: [
        {
          id: 'd9_ideal',
          label: 'ZALOGUJ SIĘ NA NASZĄ NOWĄ STRONĘ ARCHIWIZACJI POCZTY',
          tier: 'ideal',
          feedback: 'Jasne, służbowe polecenie spójne z pretekstem testów.'
        },
        {
          id: 'd9_mine',
          label: 'PODAM CI LINK DO MOJEGO SYSTEMU POCZTY',
          tier: 'suboptimal',
          feedback: 'Określenie systemu jako „mojego” budzi wątpliwości.',
          reaction: 'TWOJEGO? CHYBA FIRMOWEGO... NO DOBRA, WYŚLIJ TEN LINK.'
        },
        {
          id: 'd9_extra',
          label: 'PODAJĘ CI NOWĄ EKSTRA WERSJĘ POCZTY',
          tier: 'suboptimal',
          feedback: 'Potoczne określenie nie pasuje do komunikacji działu IT.',
          reaction: '„EKSTRA WERSJĘ”? BRZMI TROCHĘ NIEPOWAŻNIE, ALE WYŚLIJ LINK — ZOBACZĘ.'
        },
        {
          id: 'd9_critical',
          label: 'WYSYŁAM CI TĘ PODSTAWIONĄ STRONĘ',
          tier: 'critical',
          feedback: 'Nazwanie strony wprost „podstawioną” natychmiast zdradza próbę phishingu.'
        }
      ],
      linkStep: {
        buttonLabel: 'LINK',
        calleeReactionIdeal: 'OK, MAM. JAK MAM SIĘ ZALOGOWAĆ?',
        calleeReactionSuboptimal: 'BCORP.PL? MYŚLAŁEM, ŻE MAMY .BIZ... NO DOBRA, JAK MAM SIĘ ZALOGOWAĆ?'
      }
    },
    {
      decisionNum: 10,
      question: 'OK, MAM. JAK MAM SIĘ ZALOGOWAĆ?',
      options: [
        {
          id: 'd10_ideal',
          label: 'SPRAWDZAMY CZY NOWY SYSTEM JEST SPÓJNY Z POPRZEDNIM. UŻYJ DANYCH ZE SWOJEJ POCZTY FIRMOWEJ',
          tier: 'ideal',
          feedback: 'Wiarygodne uzasadnienie skłania ofiarę do podania prawdziwych danych na fałszywej stronie.',
          reaction: 'OK, DAJ MI CHWILĘ'
        },
        {
          id: 'd10_only',
          label: 'TYLKO TY ZNASZ DANE DO LOGOWANIA DO SWOJEJ POCZTY. DO NOWEGO ARCHIWUM UŻYWAJ TYCH SAMYCH DANYCH',
          tier: 'suboptimal',
          feedback: 'Brak technicznego uzasadnienia jest mniej przekonujący.',
          reaction: 'ROZUMIEM, ALE WOLAŁBYM WIEDZIEĆ, CZEMU MAM PODAWAĆ FIRMOWE HASŁO... DOBRA, DAJ MI CHWILĘ.'
        },
        {
          id: 'd10_fast',
          label: 'ZALOGUJ SIĘ JAK DO MAILA, BYLE SZYBKO',
          tier: 'suboptimal',
          feedback: 'Agresywne poganianie przy wpisywaniu hasła obniża zaufanie.',
          reaction: 'NIE POGANIAJ MNIE, TO MOJE HASŁO FIRMOWE... NO DOBRA, DAJ MI CHWILĘ.'
        }
      ]
    }
  ],
  phase2: {
    originalUrl: '//MAIL.BCORP.BIZ/LOGIN',
    fakeUrlIdeal: '//MAIL.ARCHIWUMBCORP.BIZ/LOGIN',
    fakeUrlSuboptimal: '//MAIL.BCORP.PL/LOGIN',
    footerText: 'BCORP BANK © 2024',
    brandTitle: 'BCORP SYSTEM POCZTY',
    logoAsset: { group: 'site', name: 'bcorp_logo' },
    capturedLogin: 'FWOJCIK67',
    capturedPasswordMasked: '••••••••••••••',
    capturedSmsCode: '48212',
    twoFaPrompt: 'PODAJ KOD SMS:',
    dialogueSteps: [
      {
        id: 'p2_1',
        calleeLine: 'W SYSTEMIE NIC NIE MA. CZY TAK POWINNO BYĆ?',
        playerLine:
          'TO NOWA WERSJA, DANE BĘDZIEMY PRZENOSIĆ W PRZYSZŁYM TYGODNIU. NA RAZIE CHCEMY PRZETESTOWAĆ, CZY WSZYSTKO DZIAŁA'
      },
      {
        id: 'p2_2',
        calleeLine: 'ROZUMIEM, COŚ JESZCZE? NAPRAWDĘ MUSZĘ JUŻ KOŃCZYĆ',
        playerLine: 'MUSIMY JESZCZE PRZETESTOWAĆ UWIERZYTELNIANIE DWUSKŁADNIKOWE'
      },
      {
        id: 'p2_3',
        calleeLine: 'CZYLI?',
        playerLine: 'ZA MOMENT DOSTANIESZ KOD 2FA, WPISZ GO W POLE NA EKRANIE LOGOWANIA',
        calleeAfter: 'COŚ PRZYSZŁO, JUŻ WPISUJĘ'
      }
    ],
    closingDialogue: [
      { speaker: 'callee', text: 'CZY TO WSZYSTKO?' },
      { speaker: 'player', text: 'TAK, DZIĘKI WIELKIE! URATOWAŁEŚ MI SKÓRĘ, MIŁEGO DNIA!' },
      { speaker: 'callee', text: 'DOBRA, NA RAZIE' }
    ],
    reports: [
      { id: 'r2021', title: 'RAPORT FINANSOWY 2021', year: '2021' },
      { id: 'r2022', title: 'RAPORT FINANSOWY 2022', year: '2022' }
    ],
    completionMessage: 'POBRAŁEŚ RAPORTY FINANSOWE BANKU BCORP'
  }
};

describe('Misja 5 Etap 6 — VishingApp (//ROZMOWA)', () => {
  beforeEach(() => {
    useMissionStore.getState().resetGame();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const advance = (ms = 2000) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  const chooseOption = (label: string) => {
    fireEvent.click(screen.getByText(label));
    fireEvent.click(screen.getByRole('button', { name: /WYŚLIJ ODPOWIEDŹ/i }));
  };

  const tapToken = (testId: string) => {
    const el = screen.getByTestId(testId);
    fireEvent.pointerDown(el, { pointerId: 1, clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 10 });
  };

  const playToD5 = () => {
    fireEvent.click(screen.getByTestId('start-call-btn'));
    chooseOption('DZIEŃ DOBRY PANIE FILIPIE.');
    chooseOption('TU MICHAŁ, MICHAŁ MITNIK');
    advance(2000);
  };

  const playIdealToPhase2 = () => {
    fireEvent.click(screen.getByTestId('start-call-btn'));
    chooseOption('DZIEŃ DOBRY PANIE FILIPIE.'); // D3 ideal -> od razu D4
    chooseOption('TU MICHAŁ, MICHAŁ MITNIK'); // D4 ideal -> "O CO CHODZI?"
    advance(2000);
    chooseOption('PRACUJĘ W DZIALE IT'); // D5 ideal -> wymiana gracza + Filipa
    advance(3000);
    chooseOption('PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA'); // D6 ideal
    advance(2000);
    chooseOption('Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRY, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE'); // D7 ideal -> od razu D8
    chooseOption('SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY'); // D8 ideal
    advance(2000);
    chooseOption('ZALOGUJ SIĘ NA NASZĄ NOWĄ STRONĘ ARCHIWIZACJI POCZTY'); // D9 ideal -> przycisk LINK
    fireEvent.click(screen.getByRole('button', { name: /^LINK$/i }));
    advance(2000);
    chooseOption('SPRAWDZAMY CZY NOWY SYSTEM JEST SPÓJNY Z POPRZEDNIM. UŻYJ DANYCH ZE SWOJEJ POCZTY FIRMOWEJ'); // D10 ideal
    advance(4000);
  };

  it('ekran gotowości wyświetla komunikat, przycisk połączenia, notatki OSINT na SideMonitor i brak licznika zaufania', () => {
    const onDecision = vi.fn();
    const onComplete = vi.fn();
    render(<VishingApp config={vishingConfig} onDecision={onDecision} onComplete={onComplete} />);

    expect(screen.getByText(vishingConfig.readyScreen.message)).toBeTruthy();
    expect(screen.getByRole('button', { name: /ZADZWOŃ DO FILIPA WÓJCIKA/i })).toBeTruthy();
    expect(screen.getByText(vishingConfig.osintNotesTitle)).toBeTruthy();
    for (const note of vishingConfig.osintNotes) {
      expect(screen.getByText(note)).toBeTruthy();
    }
    expect(screen.queryByText(/ZAUFANIE PRACOWNIKA/i)).toBeNull();

    // Po rozpoczęciu połączenia notatki nadal są widoczne, a Filip wita się kwestią otwierającą
    fireEvent.click(screen.getByTestId('start-call-btn'));
    expect(screen.getByText(vishingConfig.openingLine)).toBeTruthy();
    expect(screen.getByTestId('osint-notes-list')).toBeTruthy();
  });

  it('B2 w D5: odrzucenie przez mentora blokuje opcję, wyświetla MentorRejectNotice, nie zgłasza decyzji ani dymka Filipa', () => {
    const decisions: DecisionReport[] = [];
    const onDecision = vi.fn((r: DecisionReport) => {
      decisions.push(r);
      useMissionStore.getState().reportDecision(r);
    });
    render(<VishingApp config={vishingConfig} onDecision={onDecision} onComplete={vi.fn()} />);

    playToD5();
    expect(decisions.map((d) => d.num)).toEqual([3, 4]);

    // Wybór logistyki -> B2
    chooseOption('PRACUJĘ W DZIALE LOGISTYKI');
    expect(decisions.map((d) => d.num)).toEqual([3, 4]);
    expect(useMissionStore.getState().rejectedAttempts[5]?.map((r) => r.optionId)).toEqual(['d5_logistics']);
    expect(screen.getByText(/LOGISTYKA NIE TESTUJE SYSTEMU POCZTOWEGO/i)).toBeTruthy();
    const logBtn = screen.getByText('PRACUJĘ W DZIALE LOGISTYKI').closest('button')!;
    expect(logBtn.disabled).toBe(true);
    // Dymek z odrzuconą opcją nie trafił do historii rozmowy z Filipem
    expect(screen.getAllByText('PRACUJĘ W DZIALE LOGISTYKI')).toHaveLength(1);

    // Wybór wsparcia klienta -> drugie B2
    chooseOption('PRACUJĘ W DZIALE WSPARCIA KLIENTA');
    expect(decisions.map((d) => d.num)).toEqual([3, 4]);
    expect(useMissionStore.getState().rejectedAttempts[5]?.map((r) => r.optionId)).toEqual([
      'd5_logistics',
      'd5_support'
    ]);
    expect(screen.getByText(/WSPARCIE KLIENTA NIE WDRAŻA ARCHIWIZACJI POCZTY/i)).toBeTruthy();

    // Poprawny wybór (DZIAŁ IT) zamyka D5 i wywołuje wymianę ze scenario.md:150-151
    chooseOption('PRACUJĘ W DZIALE IT');
    expect(decisions.map((d) => d.num)).toEqual([3, 4, 5]);
    advance(3000);
    expect(screen.getByText(vishingConfig.turns[2].afterPlayerLine!)).toBeTruthy();
    expect(screen.getByText(vishingConfig.turns[2].afterCalleeLine!)).toBeTruthy();
  });

  it('critical w D3, D6 i D9 zgłasza tier=critical i blokuje dalsze wybory', () => {
    // D3 critical
    const onDecision3 = vi.fn();
    render(<VishingApp config={vishingConfig} onDecision={onDecision3} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByTestId('start-call-btn'));
    chooseOption('HEJ STARY!');
    expect(onDecision3).toHaveBeenCalledWith(expect.objectContaining({ num: 3, optionId: 'd3_critical', tier: 'critical' }));
    expect(screen.queryByRole('button', { name: /WYŚLIJ ODPOWIEDŹ/i })).toBeNull();
    cleanup();

    // D6 critical (raporty finansowe)
    useMissionStore.getState().resetGame();
    const onDecision6 = vi.fn();
    render(<VishingApp config={vishingConfig} onDecision={onDecision6} onComplete={vi.fn()} />);
    playToD5();
    chooseOption('PRACUJĘ W DZIALE IT');
    advance(3000);
    chooseOption('PRZEPRASZAM, ALE TO PILNE. POTRZEBUJĘ RAPORTÓW FINANSOWYCH KTÓRE MASZ NA POCZCIE');
    expect(onDecision6).toHaveBeenLastCalledWith(
      expect.objectContaining({ num: 6, optionId: 'd6_reports', tier: 'critical' })
    );
    expect(screen.queryByRole('button', { name: /WYŚLIJ ODPOWIEDŹ/i })).toBeNull();
    cleanup();

    // D9 critical (podstawiona strona)
    useMissionStore.getState().resetGame();
    const onDecision9 = vi.fn();
    render(<VishingApp config={vishingConfig} onDecision={onDecision9} onComplete={vi.fn()} />);
    playToD5();
    chooseOption('PRACUJĘ W DZIALE IT');
    advance(3000);
    chooseOption('PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA');
    advance(2000);
    chooseOption('Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRY, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE');
    chooseOption('SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY');
    advance(2000);
    chooseOption('WYSYŁAM CI TĘ PODSTAWIONĄ STRONĘ');
    expect(onDecision9).toHaveBeenLastCalledWith(
      expect.objectContaining({ num: 9, optionId: 'd9_critical', tier: 'critical' })
    );
    expect(screen.queryByRole('button', { name: /^LINK$/i })).toBeNull();
  });

  it('skutek odroczony D1 = bcorp_pl: wysyła //MAIL.BCORP.PL/LOGIN, wywołuje reakcję Filipa i zmienia pasek w Fazie 2', () => {
    act(() => {
      useMissionStore.setState({
        decisionChoices: {
          1: { optionId: 'bcorp_pl', answer: 'BCORP.PL', tier: 'suboptimal' }
        }
      });
    });

    render(<VishingApp config={vishingConfig} onDecision={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByTestId('start-call-btn'));
    chooseOption('DZIEŃ DOBRY PANIE FILIPIE.');
    chooseOption('TU MICHAŁ, MICHAŁ MITNIK');
    advance(2000);
    chooseOption('PRACUJĘ W DZIALE IT');
    advance(3000);
    chooseOption('PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA');
    advance(2000);
    chooseOption('Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRY, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE');
    chooseOption('SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY');
    advance(2000);
    chooseOption('ZALOGUJ SIĘ NA NASZĄ NOWĄ STRONĘ ARCHIWIZACJI POCZTY');

    fireEvent.click(screen.getByRole('button', { name: /^LINK$/i }));
    expect(screen.getByText('//MAIL.BCORP.PL/LOGIN')).toBeTruthy();
    advance(2000);
    expect(screen.getByText('BCORP.PL? MYŚLAŁEM, ŻE MAMY .BIZ... NO DOBRA, JAK MAM SIĘ ZALOGOWAĆ?')).toBeTruthy();

    chooseOption('SPRAWDZAMY CZY NOWY SYSTEM JEST SPÓJNY Z POPRZEDNIM. UŻYJ DANYCH ZE SWOJEJ POCZTY FIRMOWEJ');
    advance(4000);

    expect(screen.getByTestId('phase2-fake-url').textContent).toBe('//MAIL.BCORP.PL/LOGIN');
    expect(screen.getByTestId('phase2-original-url').textContent).toBe('//MAIL.BCORP.BIZ/LOGIN');
  });

  it('pełna ścieżka idealna D3–D10 -> Faza 2 (klik-klik login/hasło, rozmowa 2FA, kod 48212, pobranie raportów -> onComplete)', () => {
    const errorSpy = vi.spyOn(sounds, 'playError');
    const decisions: DecisionReport[] = [];
    const onDecision = vi.fn((r: DecisionReport) => {
      decisions.push(r);
      useMissionStore.getState().reportDecision(r);
    });
    const onComplete = vi.fn();

    render(<VishingApp config={vishingConfig} onDecision={onDecision} onComplete={onComplete} />);
    playIdealToPhase2();

    expect(decisions.map((d) => d.num)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
    expect(decisions.every((d) => d.tier === 'ideal')).toBe(true);

    // Faza 2: dwie strony obok siebie + ciągłość historii rozmowy na prawym monitorze
    expect(screen.getByTestId('phase2-fake-url').textContent).toBe('//MAIL.ARCHIWUMBCORP.BIZ/LOGIN');
    expect(screen.getByTestId('phase2-original-url').textContent).toBe('//MAIL.BCORP.BIZ/LOGIN');
    expect(screen.getAllByText('BCORP BANK © 2024')).toHaveLength(2);
    expect(screen.getAllByText('assets/site/bcorp_logo.png')).toHaveLength(2);
    expect(screen.getByText('OK, DAJ MI CHWILĘ')).toBeTruthy();

    const loginBtn = screen.getByRole('button', { name: /^ZALOGUJ$/i }) as HTMLButtonElement;
    expect(loginBtn.disabled).toBe(true);

    // QA-S4-11: przechwycone wartości (role="button") mają nazwę dostępną
    expect(screen.getByRole('button', { name: 'Przenieś: LOGIN' })).toBe(screen.getByTestId('fake-token-login'));
    expect(screen.getByRole('button', { name: 'Przenieś: HASŁO' })).toBe(screen.getByTestId('fake-token-password'));

    // Błędny slot (login na pole hasła) -> playError() bez kary
    tapToken('fake-token-login');
    fireEvent.click(screen.getByTestId('orig-slot-password'));
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(decisions).toHaveLength(8);

    // Poprawne przeniesienie loginu i hasła klik-klik
    fireEvent.click(screen.getByTestId('orig-slot-login'));
    expect(screen.getByTestId('orig-slot-login').textContent).toContain('FWOJCIK67');
    tapToken('fake-token-password');
    fireEvent.click(screen.getByTestId('orig-slot-password'));
    expect(screen.getByTestId('orig-slot-password').textContent).toContain('••••••••••••••');

    expect(loginBtn.disabled).toBe(false);
    fireEvent.click(loginBtn);

    // QA-S4-07: weryfikacja logowania to ModuleLoader z paskiem i licznikiem (ok. 1,5–2,5 s)
    expect(screen.getByTestId('login-loader').textContent).toContain('WERYFIKACJA DANYCH LOGOWANIA');
    advance(800);
    expect(screen.getByTestId('login-loader').textContent).toMatch(/\d+%/);
    advance(2700);
    expect(screen.queryByTestId('login-loader')).toBeNull();

    // Ekran 2FA + rozmowa na prawym monitorze (3 kroki)
    expect(screen.getByText('PODAJ KOD SMS:')).toBeTruthy();
    expect(screen.getByText('W SYSTEMIE NIC NIE MA. CZY TAK POWINNO BYĆ?')).toBeTruthy();

    fireEvent.click(screen.getByTestId('phase2-reply-btn'));
    advance(2000);
    expect(screen.getByText('ROZUMIEM, COŚ JESZCZE? NAPRAWDĘ MUSZĘ JUŻ KOŃCZYĆ')).toBeTruthy();

    fireEvent.click(screen.getByTestId('phase2-reply-btn'));
    advance(2000);
    expect(screen.getByText('CZYLI?')).toBeTruthy();

    fireEvent.click(screen.getByTestId('phase2-reply-btn'));
    advance(2000);
    expect(screen.getByText('COŚ PRZYSZŁO, JUŻ WPISUJĘ')).toBeTruthy();

    // Kod 48212 pojawia się na fałszywej stronie -> przeniesienie klik-klik do pola KOD
    expect(screen.getByTestId('fake-token-sms').textContent).toContain('48212');
    const login2faBtn = screen.getByRole('button', { name: /^ZALOGUJ$/i }) as HTMLButtonElement;
    expect(login2faBtn.disabled).toBe(true);

    expect(screen.getByRole('button', { name: 'Przenieś: KOD SMS' })).toBe(screen.getByTestId('fake-token-sms'));
    tapToken('fake-token-sms');
    fireEvent.click(screen.getByTestId('orig-slot-sms'));
    expect(screen.getByTestId('orig-slot-sms').textContent).toContain('48212');
    expect(login2faBtn.disabled).toBe(false);

    fireEvent.click(login2faBtn);
    const enterBtn = screen.getByRole('button', { name: /WEJDŹ DO SYSTEMU/i });
    fireEvent.click(enterBtn);

    // QA-S4-07: otwieranie skrzynki to ModuleLoader z paskiem i licznikiem
    expect(screen.getByTestId('mailbox-loader').textContent).toContain('OTWIERANIE SKRZYNKI POCZTOWEJ');
    expect(screen.getByTestId('mailbox-loader').textContent).toMatch(/\d+%/);
    advance(3500);
    expect(screen.queryByTestId('mailbox-loader')).toBeNull();

    // Skrzynka pocztowa + końcowa wymiana rozmowy
    expect(screen.getByText('RAPORT FINANSOWY 2021')).toBeTruthy();
    expect(screen.getByText('RAPORT FINANSOWY 2022')).toBeTruthy();
    expect(screen.getByText('CZY TO WSZYSTKO?')).toBeTruthy();

    // QA-S4-03: przed ROZŁĄCZONO przyciski POBIERZ są widoczne, ale nieaktywne; ZADANIE mówi tylko o rozmowie
    const dl2021 = screen.getByTestId('download-btn-r2021') as HTMLButtonElement;
    const dl2022 = screen.getByTestId('download-btn-r2022') as HTMLButtonElement;
    expect(dl2021.disabled).toBe(true);
    expect(dl2022.disabled).toBe(true);
    expect(screen.getByTestId('download-locked-hint')).toBeTruthy();
    expect(screen.getByText('ZAKOŃCZ ROZMOWĘ Z FILIPEM NA PRAWYM MONITORZE.')).toBeTruthy();
    fireEvent.click(dl2021);
    advance(2000);
    expect(screen.getByTestId('download-btn-r2021')).toBeTruthy();
    expect(screen.queryByText('POBIERANIE…')).toBeNull();

    fireEvent.click(screen.getByTestId('phase2-reply-btn'));
    advance(2000);
    expect(screen.getByText('DOBRA, NA RAZIE')).toBeTruthy();
    expect(screen.getByTestId('call-status').textContent).toContain('ROZŁĄCZONO');

    // Po ROZŁĄCZONO: POBIERZ aktywne, podpowiedź znika, ZADANIE = pobranie raportów
    expect((screen.getByTestId('download-btn-r2021') as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByTestId('download-btn-r2022') as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByTestId('download-locked-hint')).toBeNull();
    expect(screen.getByText('POBIERZ OBA RAPORTY FINANSOWE ZE SKRZYNKI POCZTOWEJ.')).toBeTruthy();

    // Pobieranie obu raportów
    fireEvent.click(screen.getByTestId('download-btn-r2021'));
    fireEvent.click(screen.getByTestId('download-btn-r2022'));
    advance(2000);

    expect(screen.getByTestId('vishing-completion-banner').textContent).toContain(
      'POBRAŁEŚ RAPORTY FINANSOWE BANKU BCORP'
    );
    expect(onComplete).not.toHaveBeenCalled();

    advance(1500);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(decisions).toHaveLength(8);
  });

  it('przeciąganie wskaźnikiem (drag-drop) w Fazie 2 oraz reakcje suboptymalne w D3/D9/D10', () => {
    const errorSpy = vi.spyOn(sounds, 'playError');
    const decisions: DecisionReport[] = [];
    const onDecision = vi.fn((r: DecisionReport) => {
      decisions.push(r);
      useMissionStore.getState().reportDecision(r);
    });
    render(<VishingApp config={vishingConfig} onDecision={onDecision} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByTestId('start-call-btn'));
    // D3 suboptimal -> reakcja Filipa
    chooseOption('DZIEŃ DOBRY PANIE DAWIDZIE.');
    advance(2000);
    expect(screen.getByText('CHYBA POMYŁKA — TU FILIP WÓJCIK, DAWID JEST NA URLOPIE. Z KIM ROZMAWIAM?')).toBeTruthy();

    chooseOption('TU MICHAŁ, MICHAŁ MITNIK');
    advance(2000);
    chooseOption('PRACUJĘ W DZIALE IT');
    advance(3000);
    chooseOption('PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA');
    advance(2000);
    chooseOption('Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRY, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE');
    chooseOption('SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY');
    advance(2000);

    // D9 suboptimal -> najpierw reakcja przed linkiem, potem przycisk LINK
    chooseOption('PODAM CI LINK DO MOJEGO SYSTEMU POCZTY');
    expect(screen.queryByRole('button', { name: /^LINK$/i })).toBeNull();
    advance(2000);
    expect(screen.getByText('TWOJEGO? CHYBA FIRMOWEGO... NO DOBRA, WYŚLIJ TEN LINK.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^LINK$/i }));
    advance(2000);

    // D10 suboptimal -> reakcja i przejście do Fazy 2
    chooseOption('ZALOGUJ SIĘ JAK DO MAILA, BYLE SZYBKO');
    advance(2000);
    expect(screen.getByText('NIE POGANIAJ MNIE, TO MOJE HASŁO FIRMOWE... NO DOBRA, DAJ MI CHWILĘ.')).toBeTruthy();
    advance(2000);

    // Drag-drop loginu na zły slot (password) -> playError()
    const loginSlot = screen.getByTestId('orig-slot-login');
    const passSlot = screen.getByTestId('orig-slot-password');
    loginSlot.getBoundingClientRect = () =>
      ({ left: 400, top: 100, right: 600, bottom: 150, width: 200, height: 50, x: 400, y: 100, toJSON: () => ({}) }) as DOMRect;
    passSlot.getBoundingClientRect = () =>
      ({ left: 400, top: 180, right: 600, bottom: 230, width: 200, height: 50, x: 400, y: 180, toJSON: () => ({}) }) as DOMRect;

    const loginToken = screen.getByTestId('fake-token-login');
    fireEvent.pointerDown(loginToken, { pointerId: 3, clientX: 100, clientY: 120, button: 0 });
    fireEvent.pointerMove(window, { pointerId: 3, clientX: 450, clientY: 200 });
    fireEvent.pointerUp(window, { pointerId: 3, clientX: 450, clientY: 200 });
    expect(errorSpy).toHaveBeenCalledTimes(1);

    // Drag-drop loginu i hasła na właściwe sloty
    fireEvent.pointerDown(loginToken, { pointerId: 4, clientX: 100, clientY: 120, button: 0 });
    fireEvent.pointerMove(window, { pointerId: 4, clientX: 450, clientY: 120 });
    fireEvent.pointerUp(window, { pointerId: 4, clientX: 450, clientY: 120 });
    expect(screen.getByTestId('orig-slot-login').textContent).toContain('FWOJCIK67');

    const passToken = screen.getByTestId('fake-token-password');
    fireEvent.pointerDown(passToken, { pointerId: 5, clientX: 100, clientY: 200, button: 0 });
    fireEvent.pointerMove(window, { pointerId: 5, clientX: 450, clientY: 200 });
    fireEvent.pointerUp(window, { pointerId: 5, clientX: 450, clientY: 200 });
    expect(screen.getByTestId('orig-slot-password').textContent).toContain('••••••••••••••');
  });

  it('zgodność statyczna: brak literałów label="..." w <ImageSlot>, brak czcionek < 0.75rem i brak licznika zaufania', () => {
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'src/scenarios/mission_05_bank_bcorp/minigames/VishingApp.tsx'),
      'utf8'
    );
    expect(src).not.toMatch(/<ImageSlot[^>]*\slabel="/);
    const small = [...src.matchAll(/text-\[(\d*\.?\d+)rem\]/g)]
      .filter((m) => parseFloat(m[1]) < 0.75)
      .map((m) => m[0]);
    expect(small).toEqual([]);
    expect(src).not.toMatch(/ZAUFANIE PRACOWNIKA/i);
  });
});
