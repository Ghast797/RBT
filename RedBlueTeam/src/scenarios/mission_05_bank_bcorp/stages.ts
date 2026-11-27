// Etapy i dane klocków Misji 5 (Bank Bcorp) — wzorzec B.
// Treść (teksty, poziomy, feedback, dialogi) mieszka tutaj, nie w kodzie minigry.
// Źródło prawdy: scenario.md (1:1). Kontrakt silnika: docs/scenario-engine.md.

import type { BeatCondition, ChoiceCardsConfig, StageDefinition } from '../../engine/types/mission';
import type { VpnRouterConfig } from '../../engine/blocks/VpnRouter';
import type { IntelPdfConfig, PageClonerConfig, VishingCallConfig } from './minigames/types';

// ---------------------------------------------------------------------------
// WSPÓLNE STAŁE (jedno źródło prawdy dla danych powtarzanych w kilku etapach)
// ---------------------------------------------------------------------------

const OSINT_POINTS: string[] = [
  'FILIP PRACUJE W BANKU BCORP JAKO DYREKTOR SPRZEDAŻY',
  'JEGO PRZEŁOŻONYM JEST DAWID MAJEWSKI. OBECNIE PRZEBYWA NA URLOPIE',
  'MICHAŁ MITNIK TO ŚWIEŻY PRACOWNIK DZIAŁU IT. JEGO SZEFOWĄ JEST SANDRA JASIŃSKA',
  'WYKUP PODOBNĄ DOMENĘ. ADRES POCZTY FIRMOWEJ TO: HTTPS://MAIL.BCORP.BIZ'
];

const ORIGINAL_LOGIN_URL = '//MAIL.BCORP.BIZ/LOGIN';
const FAKE_LOGIN_URL_IDEAL = '//MAIL.ARCHIWUMBCORP.BIZ/LOGIN';
const FAKE_LOGIN_URL_SUBOPTIMAL = '//MAIL.BCORP.PL/LOGIN';
const BANK_FOOTER_TEXT = 'BCORP BANK © 2024';
const BANK_BRAND_TITLE = 'BCORP SYSTEM POCZTY';
const BANK_LOGO_ASSET = { group: 'site', name: 'bcorp_logo' } as const;

// ---------------------------------------------------------------------------
// ETAP 1: intel_pdf (bc_intel_pdf) — lektura dokumentu OSINT (nieoceniana)
// ---------------------------------------------------------------------------

export const intelPdfConfig: IntelPdfConfig = {
  title: '//FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  subtitle: 'DOKUMENT OSINT // MATERIAŁY WYWIADOWCZE',
  task: 'ZAPOZNAJ SIĘ Z MATERIAŁAMI Z BIAŁEGO WYWIADU I ZAPAMIĘTAJ JE PRZED ROZMOWĄ.',
  fileName: 'FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  notice: 'WAŻNE INFORMACJE — BĘDZIESZ WYKORZYSTYWAŁ TE INFORMACJE PODCZAS ROZMOWY. DOBRZE JE ZAPAMIĘTAJ!',
  points: OSINT_POINTS,
  portraitAsset: { group: 'intel', name: 'filip_wojcik' },
  portraitLabel: 'FILIP WÓJCIK — PORTRET CELU',
  confirmLabel: 'POTWIERDZAM PRZECZYTANIE'
};

// ---------------------------------------------------------------------------
// ETAP 2: vpn_app (vpn_router) — bramka IP bez oceny
// ---------------------------------------------------------------------------

export const vpnConfig: VpnRouterConfig = {
  title: '//VPN',
  task: 'DOPASUJ SWOJE IP, ABY UNIKNĄĆ WYKRYCIA.',
  initialIp: '90.55.202.120',
  targetIp: '82.45.195.130',
  allowedIps: ['82.45.195.130'],
  allowAiSync: true,
  feedback: {
    ideal: 'POMYŚLNIE DOPASOWANO IP',
    critical: 'ADRES IP NIE ZGADZA SIĘ Z POŻĄDANYM. POPRAW OKTETY.'
  }
};

// ---------------------------------------------------------------------------
// ETAP 3: domain_prep (choice_cards) — D1 wybór domeny
// ---------------------------------------------------------------------------

export const domainPrepConfig: ChoiceCardsConfig = {
  decisionNum: 1,
  title: '//PRZYGOTOWANIE_DOMENY',
  subtitle: 'REJESTRACJA PODSTAWIONEJ DOMENY',
  question: 'WYBIERZ DOMENĘ, KTÓRĄ WYKUPISZ DLA PODSTAWIONEJ STRONY SYSTEMU ARCHIWIZACJI:',
  task: 'PODSTAWIONA STRONA ARCHIWIZACJI POTRZEBUJE WŁASNEJ DOMENY.',
  info: {
    title: 'ORYGINALNY ADRES Z BIAŁEGO WYWIADU',
    text: 'HTTPS://MAIL.BCORP.BIZ'
  },
  options: [
    {
      id: 'archiwumbcorp_biz',
      label: 'ARCHIWUMBCORP.BIZ',
      desc: 'Domena w strefie .biz łącząca nazwę banku z określeniem archiwum.',
      tier: 'ideal',
      feedback:
        'Domena zawiera nazwę firmy, końcówkę .biz identyczną z oryginalną pocztą oraz słowo „archiwum” pasujące do pretekstu testów.'
    },
    {
      id: 'bcorp_pl',
      label: 'BCORP.PL',
      desc: 'Krótka domena z nazwą banku zarejestrowana w polskiej strefie .pl.',
      tier: 'suboptimal',
      feedback:
        'Zawiera nazwę firmy, ale inna końcówka (.pl zamiast .biz) i brak słowa „archiwum” mogą wzbudzić czujność rozmówcy.'
    },
    {
      id: 'backup_bank_com',
      label: 'BACKUP-BANK.COM',
      desc: 'Domena w strefie .com nawiązująca do kopii zapasowej banku.',
      tier: 'suboptimal',
      feedback:
        'Brak nazwy banku i obca końcówka .com sprawiają, że adres nie wygląda na wewnętrzny system Banku Bcorp.',
      reject: {
        mentorLine:
          'W TEJ DOMENIE NIE MA NAWET NAZWY BANKU BCORP. NIKT NIE UWIERZY, ŻE TO FIRMOWA STRONA. WYBIERZ INACZEJ.'
      }
    }
  ]
};

// ---------------------------------------------------------------------------
// ETAP 4: page_cloner (bc_page_cloner) — klonowanie strony logowania (nieoceniane)
// ---------------------------------------------------------------------------

export const pageClonerConfig: PageClonerConfig = {
  title: '//PRZYGOTOWANIE_STRONY',
  subtitle: 'KLONOWANIE PANELU LOGOWANIA BANKU BCORP',
  task: 'ZAPROJEKTUJ STRONĘ, ABY BYŁA PODOBNA DO ORYGINALNEGO SERWISU.',
  originalUrl: ORIGINAL_LOGIN_URL,
  fakeUrlIdeal: FAKE_LOGIN_URL_IDEAL,
  fakeUrlSuboptimal: FAKE_LOGIN_URL_SUBOPTIMAL,
  footerText: BANK_FOOTER_TEXT,
  brandTitle: BANK_BRAND_TITLE,
  logoAsset: { ...BANK_LOGO_ASSET },
  elements: [
    { id: 'logo', label: 'BCORP SYSTEM POCZTY', slotLabel: 'NAGŁÓWEK Z LOGO' },
    { id: 'login', label: 'LOGIN', slotLabel: 'POLE LOGIN' },
    { id: 'password', label: 'HASŁO', slotLabel: 'POLE HASŁO' },
    { id: 'submit', label: 'ZALOGUJ', slotLabel: 'PRZYCISK ZALOGUJ' }
  ]
};

// ---------------------------------------------------------------------------
// ETAP 5: number_prep (choice_cards) — D2 spoofing numeru telefonu
// ---------------------------------------------------------------------------

export const numberPrepConfig: ChoiceCardsConfig = {
  decisionNum: 2,
  title: '//PRZYGOTOWANIE_NUMERU',
  subtitle: 'CALLER ID SPOOFING — NUMER WYJŚCIOWY',
  question: 'WYBIERZ NUMER TELEFONU, POD KTÓRY SIĘ PODSZYJESZ:',
  task: 'KORZYSTAJĄC ZE SPOOFINGU PODSZYJESZ SIĘ POD FIRMOWY NUMER TELEFONU.',
  info: {
    title: 'SZABLON NUMERACJI WEWNĘTRZNEJ',
    text: 'NUMERY TELEFONÓW W FIRMIE TWORZONE SĄ WEDŁUG SZABLONU: 891 [NR DZIAŁU] [NR PRACOWNIKA]',
    items: [
      { label: 'SPRZEDAŻ', value: '001' },
      { label: 'DZIAŁ IT', value: '002' },
      { label: 'LOGISTYKA', value: '003' },
      { label: 'SUPPORT', value: '004' }
    ]
  },
  options: [
    {
      id: '891_002_162',
      label: '891 002 162',
      desc: 'Numer z puli 891 i kodem wewnętrznym 002.',
      tier: 'ideal',
      feedback:
        'Numer zgadza się z firmowym szablonem (891) i prefiksem działu IT (002), uwiarygadniając połączenie od pracownika IT.'
    },
    {
      id: '891_003_427',
      label: '891 003 427',
      desc: 'Numer z puli 891 i kodem wewnętrznym 003.',
      tier: 'suboptimal',
      feedback: 'Numer należy do działu logistyki (003) zamiast IT (002), co przeczy przygotowanej legendzie.',
      reject: {
        mentorLine:
          'TEN NUMER NALEŻY DO LOGISTYKI, A MASZ DZWONIĆ JAKO PRACOWNIK IT. SPRAWDŹ SZABLON I WYBIERZ INACZEJ.'
      }
    },
    {
      id: '867_452_026',
      label: '867 452 026',
      desc: 'Numer z prefiksem 867 i kodem 452.',
      tier: 'critical',
      feedback:
        'Numer spoza firmowej puli (867 zamiast 891) od razu budzi podejrzenia dyrektora — Filip nie ufa połączeniu i zgłasza próbę podszycia się pod IT.',
      failTitle: 'ZOSTAŁEŚ WYKRYTY!',
      failText:
        'Numer spoza firmowej puli (867 zamiast 891) od razu budzi podejrzenia dyrektora — Filip nie ufa połączeniu i zgłasza próbę podszycia się pod IT.'
    }
  ]
};

// ---------------------------------------------------------------------------
// ETAP 6: vishing_call (bc_vishing_call) — D3–D10 vishing + faza 2 AiTM
// ---------------------------------------------------------------------------

export const vishingCallConfig: VishingCallConfig = {
  title: '//ROZMOWA',
  subtitle: 'VISHING I PRZECHWYTYWANIE DANYCH AITM NA ŻYWO',
  taskPhase1: 'PROWADŹ ROZMOWĘ Z FILIPEM WÓJCIKIEM I NAKŁOŃ GO DO ZALOGOWANIA SIĘ NA PODSTAWIONĄ STRONĘ.',
  taskPhase2: 'PRZENIEŚ PRZECHWYCONE DANE LOGOWANIA ORAZ KOD 2FA DO ORYGINALNEGO PANELU I POBIERZ RAPORTY.',
  taskExfiltrateCall: 'ZAKOŃCZ ROZMOWĘ Z FILIPEM NA PRAWYM MONITORZE.',
  taskExfiltrateDownload: 'POBIERZ OBA RAPORTY FINANSOWE ZE SKRZYNKI POCZTOWEJ.',
  readyScreen: {
    title: '//ROZMOWA',
    message: 'MOGĘ JUŻ ZADZWONIĆ DO PRACOWNIKA. MUSZĘ UWAŻAĆ, ABY NIE POWIEDZIEĆ CZEGOŚ PODEJRZANEGO',
    buttonLabel: 'ZADZWOŃ DO FILIPA WÓJCIKA'
  },
  osintNotesTitle: 'FILIP_WOJCIK_BIALY_WYWIAD.PDF',
  osintNotes: OSINT_POINTS,
  calleeName: 'FILIP WÓJCIK',
  openingLine: 'DZIEŃ DOBRY, FILIP WÓJCIK, BANK BCORP. W CZYM MOGĘ POMÓC?',
  turns: [
    {
      id: 'turn_d3',
      decisionNum: 3,
      question: 'DZIEŃ DOBRY, FILIP WÓJCIK, BANK BCORP. W CZYM MOGĘ POMÓC?',
      prompt: 'DZIEŃ DOBRY, FILIP WÓJCIK, BANK BCORP. W CZYM MOGĘ POMÓC?',
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
          feedback:
            'Pomylenie imienia rozmówcy z imieniem jego przełożonego od razu zdradza brak przygotowania i obniża wiarygodność.',
          reaction: 'CHYBA POMYŁKA — TU FILIP WÓJCIK, DAWID JEST NA URLOPIE. Z KIM ROZMAWIAM?'
        },
        {
          id: 'd3_czesc',
          label: 'CZEŚĆ FILIP!',
          tier: 'suboptimal',
          feedback:
            'Poufałe „cześć” od nieznajomego, który jeszcze się nie przedstawił, brzmi nienaturalnie i budzi czujność dyrektora.',
          reaction: 'SŁUCHAM? CHYBA SIĘ NIE ZNAMY. Z KIM ROZMAWIAM?'
        },
        {
          id: 'd3_hej',
          label: 'HEJ STARY!',
          tier: 'critical',
          feedback:
            'Tak nieprofesjonalny zwrot do dyrektora banku natychmiast spalił przykrywkę — Filip rozłączył się i zgłosił podejrzany telefon do działu bezpieczeństwa.',
          failTitle: 'ZOSTAŁEŚ WYKRYTY!',
          failText:
            'Tak nieprofesjonalny zwrot do dyrektora banku natychmiast spalił przykrywkę — Filip rozłączył się i zgłosił podejrzany telefon do działu bezpieczeństwa.'
        }
      ]
    },
    {
      id: 'turn_d4',
      decisionNum: 4,
      question: 'PRZEDSTAW SIĘ ROZMÓWCY:',
      prompt: 'PRZEDSTAW SIĘ ROZMÓWCY:',
      options: [
        {
          id: 'd4_ideal',
          label: 'TU MICHAŁ, MICHAŁ MITNIK',
          tier: 'ideal',
          feedback:
            'Poprawne imię i nazwisko nowego pracownika IT zgadzają się z białym wywiadem i wytrzymują ewentualną weryfikację.',
          reaction: 'O CO CHODZI?'
        },
        {
          id: 'd4_witnik',
          label: 'NAZYWAM SIĘ MICHAŁ WITNIK',
          tier: 'suboptimal',
          feedback:
            'Przekręcenie nazwiska pracownika, pod którego się podszywasz, osłabia wiarygodność przy ewentualnym sprawdzeniu w firmowej książce adresowej.',
          reaction: 'WITNIK? NIE KOJARZĘ, ALE OK — O CO CHODZI?'
        },
        {
          id: 'd4_marcin',
          label: 'TU MARCIN, MARCIN MITNIK',
          tier: 'suboptimal',
          feedback:
            'Błędne imię pracownika IT nie zgadza się z białym wywiadem i zwiększa ryzyko weryfikacji tożsamości.',
          reaction: 'MARCIN MITNIK? NIE KOJARZĘ... O CO CHODZI?'
        },
        {
          id: 'd4_rybnik',
          label: 'MARCIN RYBNIK Z TWOJEJ FIRMY',
          tier: 'critical',
          feedback:
            'Zmyślone nazwisko i nienaturalny zwrot „z twojej firmy” od razu zdradzają osobę spoza organizacji — Filip rozłącza się i zgłasza incydent.',
          failTitle: 'ZOSTAŁEŚ WYKRYTY!',
          failText:
            'Zmyślone nazwisko i nienaturalny zwrot „z twojej firmy” od razu zdradzają osobę spoza organizacji — Filip rozłącza się i zgłasza incydent.'
        }
      ]
    },
    {
      id: 'turn_d5',
      decisionNum: 5,
      question: 'O CO CHODZI?',
      options: [
        {
          id: 'd5_ideal',
          label: 'PRACUJĘ W DZIALE IT',
          tier: 'ideal',
          feedback:
            'Dział IT zgadza się z wybranym numerem telefonu (002), białym wywiadem i pretekstem testów systemu archiwizacji poczty.'
        },
        {
          id: 'd5_sprzedaz',
          label: 'PRACUJĘ W DZIALE SPRZEDAŻY',
          tier: 'critical',
          feedback:
            'Filip sam kieruje działem sprzedaży, więc podanie się za pracownika tego działu natychmiast zdemaskowało fałszywego rozmówcę.',
          failTitle: 'ZOSTAŁEŚ WYKRYTY!',
          failText:
            'Filip sam kieruje działem sprzedaży, więc podanie się za pracownika tego działu natychmiast zdemaskowało fałszywego rozmówcę.'
        },
        {
          id: 'd5_logistyka',
          label: 'PRACUJĘ W DZIALE LOGISTYKI',
          tier: 'suboptimal',
          feedback:
            'Dział logistyki nie pasuje ani do sfałszowanego numeru telefonu, ani do pretekstu testów systemu archiwizacji poczty.',
          reject: {
            mentorLine:
              'LOGISTYKA NIE TESTUJE SYSTEMU POCZTOWEGO I NIE PASUJE DO NUMERU, Z KTÓREGO DZWONISZ. WYBIERZ INACZEJ.'
          }
        },
        {
          id: 'd5_wsparcie',
          label: 'PRACUJĘ W DZIALE WSPARCIA KLIENTA',
          tier: 'suboptimal',
          feedback:
            'Dział wsparcia klienta nie zajmuje się testowaniem systemów pocztowych i jest sprzeczny z wybranym numerem telefonu.',
          reject: {
            mentorLine:
              'WSPARCIE KLIENTA NIE WDRAŻA ARCHIWIZACJI POCZTY I NIE PASUJE DO WYBRANEGO NUMERU. WYBIERZ INACZEJ.'
          }
        }
      ],
      afterPlayerLine: 'TESTUJEMY WŁAŚNIE NOWY SYSTEM ARCHIWIZACJI POCZTY. MASZ MOŻE 5 MINUT?',
      afterCalleeLine: 'ZA CHWILĘ MAM SPOTKANIE. MOŻE PÓŹNIEJ?'
    },
    {
      id: 'turn_d6',
      decisionNum: 6,
      question: 'ZA CHWILĘ MAM SPOTKANIE. MOŻE PÓŹNIEJ?',
      options: [
        {
          id: 'd6_ideal',
          label: 'PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA',
          tier: 'ideal',
          feedback:
            'Uprzejma presja czasu („pilne, do końca dnia”) skłania ofiarę do szybkiego działania bez dokładnego sprawdzania szczegółów.',
          reaction: 'MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...'
        },
        {
          id: 'd6_nudzi',
          label: 'NUDZI MI SIĘ, NIE BĄDŹ TAKI...',
          tier: 'critical',
          feedback:
            'Niepoważny ton wobec zabieganego dyrektora natychmiast spala przykrywkę — Filip rozłącza się i zgłasza incydent.',
          failTitle: 'ZOSTAŁEŚ WYKRYTY!',
          failText:
            'Niepoważny ton wobec zabieganego dyrektora natychmiast spala przykrywkę — Filip rozłącza się i zgłasza incydent.'
        },
        {
          id: 'd6_klient',
          label: 'TO PILNE. MAM PROBLEM Z TRUDNYM KLIENTEM, MUSISZ MI POMÓC',
          tier: 'suboptimal',
          feedback:
            'Zmiana pretekstu na „trudnego klienta” przeczy wcześniejszej informacji o testach poczty i osłabia spójność historii.',
          reaction:
            'KLIENTEM? MYŚLAŁEM, ŻE CHODZI O TESTY POCZTY... ZRESZTĄ MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...'
        },
        {
          id: 'd6_raporty',
          label: 'PRZEPRASZAM, ALE TO PILNE. POTRZEBUJĘ RAPORTÓW FINANSOWYCH KTÓRE MASZ NA POCZCIE',
          tier: 'critical',
          feedback:
            'Prośba pracownika IT o poufne raporty finansowe ze skrzynki dyrektora natychmiast zdradza prawdziwy cel ataku — Filip rozłącza się i zgłasza incydent.',
          failTitle: 'ZOSTAŁEŚ WYKRYTY!',
          failText:
            'Prośba pracownika IT o poufne raporty finansowe ze skrzynki dyrektora natychmiast zdradza prawdziwy cel ataku — Filip rozłącza się i zgłasza incydent.'
        }
      ]
    },
    {
      id: 'turn_d7',
      decisionNum: 7,
      question: 'MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...',
      options: [
        {
          id: 'd7_ideal',
          label: 'Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRĘ, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE',
          tier: 'ideal',
          feedback:
            'Połączenie faktu o urlopie Dawida z powołaniem się na autorytet Sandry (szefowej IT) skutecznie rozbraja wątpliwości ofiary.'
        },
        {
          id: 'd7_dawid',
          label: 'PAN DAWID WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ',
          tier: 'suboptimal',
          feedback:
            'Powołanie się na przełożonego przebywającego na urlopie utrudnia weryfikację, ale słabiej uwiarygadnia prośbę niż wskazanie obecnej w firmie szefowej IT (Sandry).',
          reaction: 'DAWID JEST TERAZ NA URLOPIE, NIE MAM JAK GO ZAPYTAĆ... DZIWNE, ŻE NIC MI WCZEŚNIEJ NIE MÓWIŁ.'
        },
        {
          id: 'd7_wolne',
          label: 'TWÓJ PRZEŁOŻONY MA PRZECIEŻ WOLNE, DLATEGO NIC NIE WIESZ',
          tier: 'suboptimal',
          feedback:
            'Informacja o urlopie przełożonego jest trafna, ale lekceważący ton i brak powołania się na osobę decyzyjną (Sandrę) obniżają zaufanie rozmówcy.',
          reaction: 'WIEM, ŻE JEST NA URLOPIE, ALE TO NIE ZNACZY, ŻE MOGĘ WIERZYĆ NA SŁOWO...'
        },
        {
          id: 'd7_darek',
          label: 'DAREK WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ',
          tier: 'suboptimal',
          feedback:
            'Błędne imię przełożonego i powołanie się na rozmowę z nim w czasie urlopu mocno podważają wiarygodność.',
          reaction: 'DAREK? CHYBA DAWID — I ON JEST NA URLOPIE. NIE BRZMI TO PRZEKONUJĄCO...'
        }
      ]
    },
    {
      id: 'turn_d8',
      decisionNum: 8,
      question: 'DOMKNIJ PERSWAZJĘ:',
      prompt: 'DOMKNIJ PERSWAZJĘ:',
      options: [
        {
          id: 'd8_ideal',
          label: 'SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY',
          tier: 'ideal',
          feedback:
            'Połączenie społecznego dowodu słuszności („zostałeś mi tylko ty”) z troską o bezpieczeństwo firmy skutecznie przełamuje opór ofiary.',
          reaction: 'OK, JEŚLI TAK TO WYGLĄDA, CO MAM ROBIĆ?'
        },
        {
          id: 'd8_dlugo',
          label: 'TO NIE ZAJMIE DŁUGO, WIĘC NIE MUSISZ SIĘ ZASTANAWIAĆ',
          tier: 'suboptimal',
          feedback:
            'Otwarte zniechęcanie rozmówcy do zastanowienia się brzmi natrętnie i może wzbudzić podejrzenia u ostrożniejszej ofiary.',
          reaction: 'NIE LUBIĘ TAKIEGO POŚPIECHU, ALE DOBRA — JEŚLI TO CHWILA, CO MAM ROBIĆ?'
        },
        {
          id: 'd8_czlowiek',
          label: 'ZRESZTĄ CZEMU MIAŁBYŚ MI NIE POMÓC? BĄDŹ CZŁOWIEKIEM...',
          tier: 'suboptimal',
          feedback:
            'Emocjonalny, nieprofesjonalny ton zamiast argumentu o bezpieczeństwie firmy obniża wiarygodność pracownika IT.',
          reaction: 'ECH, NIE MAM CZASU NA DYSKUSJE. MÓW SZYBKO, CO MAM ROBIĆ?'
        }
      ]
    },
    {
      id: 'turn_d9',
      decisionNum: 9,
      question: 'POWIEDZ FILIPOWI, CO MA ZROBIĆ:',
      prompt: 'POWIEDZ FILIPOWI, CO MA ZROBIĆ:',
      options: [
        {
          id: 'd9_ideal',
          label: 'ZALOGUJ SIĘ NA NASZĄ NOWĄ STRONĘ ARCHIWIZACJI POCZTY',
          tier: 'ideal',
          feedback: 'Jasne, służbowe polecenie spójne z całym pretekstem testów systemu archiwizacji.'
        },
        {
          id: 'd9_mojego',
          label: 'PODAM CI LINK DO MOJEGO SYSTEMU POCZTY',
          tier: 'suboptimal',
          feedback: 'Określenie systemu jako „mojego” zamiast firmowego budzi wątpliwości co do oficjalnego charakteru testów.',
          reaction: 'TWOJEGO? CHYBA FIRMOWEGO... NO DOBRA, WYŚLIJ TEN LINK.'
        },
        {
          id: 'd9_ekstra',
          label: 'PODAJĘ CI NOWĄ EKSTRA WERSJĘ POCZTY',
          tier: 'suboptimal',
          feedback: 'Potoczne, reklamowe określenie „nowa ekstra wersja” nie pasuje do komunikacji działu IT i obniża wiarygodność.',
          reaction: '„EKSTRA WERSJĘ”? BRZMI TROCHĘ NIEPOWAŻNIE, ALE WYŚLIJ LINK — ZOBACZĘ.'
        },
        {
          id: 'd9_podstawiona',
          label: 'WYSYŁAM CI TĘ PODSTAWIONĄ STRONĘ',
          tier: 'critical',
          feedback:
            'Nazwanie strony wprost „podstawioną” natychmiast zdradza próbę phishingu — Filip rozłącza się i zgłasza incydent do działu bezpieczeństwa.',
          failTitle: 'ZOSTAŁEŚ WYKRYTY!',
          failText:
            'Nazwanie strony wprost „podstawioną” natychmiast zdradza próbę phishingu — Filip rozłącza się i zgłasza incydent do działu bezpieczeństwa.'
        }
      ],
      linkStep: {
        buttonLabel: 'LINK',
        calleeReactionIdeal: 'OK, MAM. JAK MAM SIĘ ZALOGOWAĆ?',
        calleeReactionSuboptimal: 'BCORP.PL? MYŚLAŁEM, ŻE MAMY .BIZ... NO DOBRA, JAK MAM SIĘ ZALOGOWAĆ?'
      }
    },
    {
      id: 'turn_d10',
      decisionNum: 10,
      question: 'WYJAŚNIJ FILIPOWI, JAK MA SIĘ ZALOGOWAĆ:',
      prompt: 'WYJAŚNIJ FILIPOWI, JAK MA SIĘ ZALOGOWAĆ:',
      options: [
        {
          id: 'd10_ideal',
          label: 'SPRAWDZAMY CZY NOWY SYSTEM JEST SPÓJNY Z POPRZEDNIM. UŻYJ DANYCH ZE SWOJEJ POCZTY FIRMOWEJ',
          tier: 'ideal',
          feedback:
            'Wiarygodne, techniczne uzasadnienie („test spójności”) skłania ofiarę do wpisania prawdziwych danych logowania na fałszywej stronie.',
          reaction: 'OK, DAJ MI CHWILĘ'
        },
        {
          id: 'd10_tylko_ty',
          label: 'TYLKO TY ZNASZ DANE DO LOGOWANIA DO SWOJEJ POCZTY. DO NOWEGO ARCHIWUM UŻYWAJ TYCH SAMYCH DANYCH',
          tier: 'suboptimal',
          feedback:
            'Brak technicznego uzasadnienia, dlaczego trzeba podać dane z poczty firmowej, jest mniej przekonujący niż powołanie się na test spójności systemów.',
          reaction: 'ROZUMIEM, ALE WOLAŁBYM WIEDZIEĆ, CZEMU MAM PODAWAĆ FIRMOWE HASŁO... DOBRA, DAJ MI CHWILĘ.'
        },
        {
          id: 'd10_byle_szybko',
          label: 'ZALOGUJ SIĘ JAK DO MAILA, BYLE SZYBKO',
          tier: 'suboptimal',
          feedback:
            'Agresywne poganianie ofiary w momencie wpisywania hasła to wyraźna czerwona flaga socjotechniczna, która obniża zaufanie.',
          reaction: 'NIE POGANIAJ MNIE, TO MOJE HASŁO FIRMOWE... NO DOBRA, DAJ MI CHWILĘ.'
        }
      ]
    }
  ],
  phase2: {
    originalUrl: ORIGINAL_LOGIN_URL,
    fakeUrlIdeal: FAKE_LOGIN_URL_IDEAL,
    fakeUrlSuboptimal: FAKE_LOGIN_URL_SUBOPTIMAL,
    footerText: BANK_FOOTER_TEXT,
    brandTitle: BANK_BRAND_TITLE,
    logoAsset: { ...BANK_LOGO_ASSET },
    capturedLogin: 'FWOJCIK67',
    capturedPasswordMasked: '••••••••••••••',
    capturedSmsCode: '48212',
    twoFaPrompt: 'PODAJ KOD SMS:',
    dialogueSteps: [
      {
        id: 'p2_step_1',
        calleeLine: 'W SYSTEMIE NIC NIE MA. CZY TAK POWINNO BYĆ?',
        playerLine:
          'TO NOWA WERSJA, DANE BĘDZIEMY PRZENOSIĆ W PRZYSZŁYM TYGODNIU. NA RAZIE CHCEMY PRZETESTOWAĆ, CZY WSZYSTKO DZIAŁA'
      },
      {
        id: 'p2_step_2',
        calleeLine: 'ROZUMIEM, COŚ JESZCZE? NAPRAWDĘ MUSZĘ JUŻ KOŃCZYĆ',
        playerLine: 'MUSIMY JESZCZE PRZETESTOWAĆ UWIERZYTELNIANIE DWUSKŁADNIKOWE'
      },
      {
        id: 'p2_step_3',
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
      { id: 'report_2024', title: 'RAPORT FINANSOWY 2024', year: '2024' },
      { id: 'report_2025', title: 'RAPORT FINANSOWY 2025', year: '2025' }
    ],
    completionMessage: 'POBRAŁEŚ RAPORTY FINANSOWE BANKU BCORP'
  }
};

// ---------------------------------------------------------------------------
// DANE KLOCKÓW M5 (kluczowane identyfikatorem kafelka pulpitu)
// ---------------------------------------------------------------------------

export const mission5Blocks: Record<string, unknown> = {
  intel_pdf: intelPdfConfig,
  vpn_app: vpnConfig,
  domain_prep: domainPrepConfig,
  page_cloner: pageClonerConfig,
  number_prep: numberPrepConfig,
  vishing_call: vishingCallConfig
};

// ---------------------------------------------------------------------------
// WARUNKI MOSTKA KOŃCOWEGO (3 rozłączne warianty ze scenario.md)
// ---------------------------------------------------------------------------

const ALL_DECISIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const END_BRIDGE_PERFECT: BeatCondition = {
  allOf: ALL_DECISIONS.map((decision) => ({
    decision,
    tier: 'ideal',
    rejected: false
  }))
};

const END_BRIDGE_PASSING_WITH_FLAWS: BeatCondition = {
  allOf: [
    {
      anyOf: ALL_DECISIONS.flatMap((decision) => [
        { decision, tier: ['suboptimal', 'critical'] },
        { decision, rejected: true }
      ])
    },
    { belowPassing: false }
  ]
};

const END_BRIDGE_BELOW_PASSING: BeatCondition = { belowPassing: true };

// ---------------------------------------------------------------------------
// ETAPY MISJI — przebieg przez completeStage (wzorzec B)
// ---------------------------------------------------------------------------

export const mission5Stages: StageDefinition[] = [
  {
    id: 'intel_pdf',
    appId: 'intel_pdf',
    decisions: [],
    completion: {
      // [SPÓJNIK] VR milczy na tej granicy (QA R1-04, decyzja właściciela 27.11.2026).
      conversation: [{ from: 'player', id: 'm5_reply_after_intel', label: 'MAM WSZYSTKO, CZEGO POTRZEBUJĘ DO ROZMOWY. NAJPIERW UKRYJĘ SWOJE IP.' }],
      unlockIcons: ['vpn_unlocked'],
      badges: { vpn_app: 1, chat: 1 },
      highlightTile: 'vpn_app',
      sound: 'notification'
    }
  },
  {
    id: 'vpn_app',
    appId: 'vpn_app',
    decisions: [],
    completion: {
      // [SPÓJNIK] VR milczy na tej granicy (QA R1-04, decyzja właściciela 27.11.2026).
      conversation: [{ from: 'player', id: 'm5_reply_after_vpn', label: 'IP ZAMASKOWANE. CZAS NA DOMENĘ DLA PODSTAWIONEJ STRONY.' }],
      unlockIcons: ['domain_prep_unlocked'],
      badges: { domain_prep: 1, chat: 1 },
      highlightTile: 'domain_prep',
      sound: 'notification'
    }
  },
  {
    id: 'domain_prep',
    appId: 'domain_prep',
    decisions: [1],
    completion: {
      // [SPÓJNIK] VR milczy na tej granicy (QA R1-04, decyzja właściciela 27.11.2026).
      conversation: [{ from: 'player', id: 'm5_reply_after_domain', label: 'DOMENA WYKUPIONA. TERAZ SKOPIUJĘ WYGLĄD ICH STRONY LOGOWANIA.' }],
      unlockIcons: ['page_cloner_unlocked'],
      badges: { page_cloner: 1, chat: 1 },
      highlightTile: 'page_cloner',
      sound: 'notification'
    }
  },
  {
    id: 'page_cloner',
    appId: 'page_cloner',
    decisions: [],
    completion: {
      // [SPÓJNIK] VR milczy na tej granicy (QA R1-04, decyzja właściciela 27.11.2026).
      conversation: [{ from: 'player', id: 'm5_reply_after_cloner', label: 'STRONA GOTOWA. ZOSTAŁ NUMER, Z KTÓREGO ZADZWONIĘ.' }],
      unlockIcons: ['number_prep_unlocked'],
      badges: { number_prep: 1, chat: 1 },
      highlightTile: 'number_prep',
      sound: 'notification'
    }
  },
  {
    id: 'number_prep',
    appId: 'number_prep',
    decisions: [2],
    completion: {
      // [SPÓJNIK] VR milczy na tej granicy (QA R1-04, decyzja właściciela 27.11.2026).
      conversation: [{ from: 'player', id: 'm5_reply_after_number', label: 'NUMER USTAWIONY. MOGĘ DZWONIĆ DO FILIPA.' }],
      unlockIcons: ['vishing_call_unlocked'],
      badges: { vishing_call: 1, chat: 1 },
      highlightTile: 'vishing_call',
      sound: 'notification'
    }
  },
  {
    id: 'vishing_call',
    appId: 'vishing_call',
    decisions: [3, 4, 5, 6, 7, 8, 9, 10],
    completion: {
      conversation: [
        // Wariant 1 (wszystko idealnie, 100%, bez odrzuceń)
        {
          from: 'player',
          id: 'm5_reply_end_perfect',
          label:
            'MAM RAPORTY FINANSOWE BANKU BCORP Z 2024 I 2025 ROKU. FILIP NAWET NIE ZORIENTOWAŁ SIĘ, ŻE JEGO HASŁO I KOD SMS TRAFIŁY DO NAS.',
          when: END_BRIDGE_PERFECT
        },
        {
          from: 'byte_master',
          text: 'CZYSTA ROBOTA. ZERO WPADEK, ZERO WĄTPLIWOŚCI. Z TAKIMI RAPORTAMI W KOŃCU ZOBACZYMY, KTO FINANSUJE TĘ RAFINERIĘ. BĘDĄ Z CIEBIE LUDZIE.',
          when: END_BRIDGE_PERFECT
        },
        // Wariant 2 (słabiej, ale wynik >= 70%)
        {
          from: 'player',
          id: 'm5_reply_end_passing',
          label:
            'MAM RAPORTY FINANSOWE BANKU BCORP Z 2024 I 2025 ROKU, CHOĆ PO DRODZE BYŁO NERWOWO.',
          when: END_BRIDGE_PASSING_WITH_FLAWS
        },
        {
          from: 'byte_master',
          text: 'WAŻNE, ŻE RAPORTY SĄ U NAS, ALE NIE OBYŁO SIĘ BEZ WPADEK. NASTĘPNYM RAZEM PILNUJ SZCZEGÓŁÓW.',
          when: END_BRIDGE_PASSING_WITH_FLAWS
        },
        // Wariant 3 (wynik < 70%)
        {
          from: 'player',
          id: 'm5_reply_end_below',
          label: 'RAPORTY POBRANE, ALE PO DRODZE BYŁO SPORO WPADEK.',
          when: END_BRIDGE_BELOW_PASSING
        },
        {
          from: 'byte_master',
          text: 'TYM RAZEM SIĘ UDAŁO TYLKO DLATEGO, ŻE FILIP MIAŁ SPOTKANIE. ZA DUŻO BŁĘDÓW JAK NA JEDNĄ ROZMOWĘ — PRZEJRZYJ RAPORT I POPRAW TO.',
          when: END_BRIDGE_BELOW_PASSING
        }
      ],
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success'
    }
  }
];
