// Etapy i dane klocków Misji 4 (Energy Rock) — wzorzec B, po przebudowie (porcja B).
// Źródło prawdy: docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md; plan: docs/rebuild-plan.md (sekcje 2, 3, 5, 9).
// Treść (teksty, feedback) mieszka tutaj, nie w kodzie minigry. Struktura i poziomy (`tier`) są wg planu.
// Teksty opcji, feedback i dialogi 1:1 z dokumentu (WERSALIKI w opcjach i dialogach); teksty interfejsu
// spoza dokumentu (ZADANIE, loadery, podpisy) wg planu. Odchylenia: plan, sekcja 7.

import type { BeatCondition, ChoiceOutcome, DialogueTreeConfig, StageDefinition } from '../../engine/types/mission';
import type { VpnRouterConfig } from '../../engine/blocks/VpnRouter';
import type {
  BuilderConfig,
  C2Config,
  ColorOption,
  ExfilFile,
  MailConfig,
  NetworkNode,
  NoteTile,
  PasswordTile,
  VictimChatConfig,
  VirusLabConfig
} from './minigames/types';

// Skutki słabszych wyborów w mailu (D5 temat, D6 treść, D7 nadawca): późniejsze otwarcie CV i dopiski w panelu C2.
// Punkty zdjęto przy decyzji; to tylko fabuła. Dokładnie jeden z dwóch warunków pasuje, gdy D5–D7 są zgłoszone.
const WEAKER_TIERS: ChoiceOutcome[] = ['suboptimal', 'critical'];
const MAIL_IDEAL: BeatCondition = {
  allOf: [
    { decision: 5, tier: 'ideal' },
    { decision: 6, tier: 'ideal' },
    { decision: 7, tier: 'ideal' }
  ]
};
const MAIL_WEAKER: BeatCondition = {
  anyOf: [
    { decision: 5, tier: WEAKER_TIERS },
    { decision: 6, tier: WEAKER_TIERS },
    { decision: 7, tier: WEAKER_TIERS }
  ]
};

// ---------------------------------------------------------------------------
// ETAP 1: er_virus_lab — D1 + zdrapka (flavor bez oceny)
// ---------------------------------------------------------------------------

export const virusLabConfig: VirusLabConfig = {
  title: '//BAZA_WIRUSÓW',
  subtitle: 'WYBÓR I SKŁADANIE ZŁOŚLIWEGO OPROGRAMOWANIA',
  steps: ['KROK 1/2', 'KROK 2/2'],
  heading: 'BAZA WIRUSÓW - WYBIERZ ODPOWIEDNIEGO WIRUSA',
  virus: {
    decisionNum: 1,
    question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA',
    options: [
      {
        id: 'ransomware',
        label: 'RANSOMWARE',
        desc: 'MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ',
        image: { group: 'virus', name: 'ransomware' },
        imageAlt: 'monitor skuty łańcuchem z kłódką (ransomware)',
        tier: 'ideal',
        feedback:
          'Blokuje infrastrukturę firmy, paraliżuje operacje i stwarza idealną przykrywkę finansową pod szantaż.'
      },
      {
        id: 'rat',
        label: 'RAT: REMOTE ACCESS TROJAN',
        desc: 'POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY',
        image: { group: 'virus', name: 'rat' },
        imageAlt: 'zdalnie sterowany pulpit (RAT)',
        tier: 'suboptimal',
        feedback:
          'Pozwala na cichą infiltrację pulpitu, lecz nie paraliżuje całej organizacji i nie wywiera presji na zarząd, a ta misja opiera się na szantażu.',
        reject: { mentorLine: 'RAT NIE DA NAM SZANTAŻU, A CAŁA TA MISJA NA NIM STOI. WYBIERZ INACZEJ.' }
      },
      {
        id: 'keylogger',
        label: 'KEYLOGGER',
        desc: 'POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
        image: { group: 'virus', name: 'keylogger' },
        imageAlt: 'klawiatura pod lupą (keylogger)',
        tier: 'suboptimal',
        feedback:
          'Zbiera wpisywane znaki, lecz nie daje dostępu do serwerów ani nie uniemożliwia pracy firmie, więc nie ma czym szantażować zarządu.',
        reject: { mentorLine: 'KEYLOGGER NIE ZROBI NA ZARZĄDZIE ŻADNEGO WRAŻENIA, A MY POTRZEBUJEMY SZANTAŻU. WYBIERZ INACZEJ.' }
      }
    ]
  },
  virusTexts: {
    task: 'WYBIERZ WIRUSA I ZATWIERDŹ WYBÓR.',
    confirmLabel: 'ZATWIERDŹ WIRUSA'
  },
  matrix: {
    heading: 'WYSZUKAJ CZĘŚCI WIRUSA:',
    programPrefix: 'SKŁADASZ PROGRAM:',
    loaderText: 'PRZYGOTOWANIE MATRYCY KOMPILACJI…',
    revealThreshold: 0.92,
    segments: 10,
    // RAT i keylogger odrzuca mentor (B2) przed zdrapką, więc zdrapka ma tylko wariant ransomware.
    variants: {
      ransomware: {
        programName: 'RANSOMWARE',
        image: { group: 'virus', name: 'matrix_ransomware' },
        imageAlt: 'monitor skuty łańcuchami z kłódką',
        parts: [
          { id: 'encrypt', label: 'SZYFROWANIE', desc: 'zamienia pliki w nieczytelne dane' },
          { id: 'key', label: 'KLUCZ', desc: 'klucz do odszyfrowania zostaje u Ciebie' },
          { id: 'spread', label: 'ROZPRZESTRZENIANIE', desc: 'sięga do innych komputerów w sieci' },
          { id: 'ransom', label: 'ŻĄDANIE OKUPU', desc: 'wyświetla ofierze komunikat z żądaniem zapłaty' }
        ],
        barColor: '#8A2BE2'
      }
    },
    doneMessage: 'ODNALEZIONO WSZYSTKIE CZĘŚCI WIRUSA',
    task: 'PRZECIĄGAJ KURSOREM Z WCIŚNIĘTYM PRZYCISKIEM MYSZY PO CZARNYM POLU, ŻEBY ODSŁONIĆ WIRUSA.',
    hint: 'PRZECIĄGAJ TUTAJ',
    maskColor: '#3b82f6'
  }
};

// ---------------------------------------------------------------------------
// ETAP 2: er_ransom_builder — D2 hasło, D3 komunikat, D4 kolor
// ---------------------------------------------------------------------------

const passwordTiles: PasswordTile[] = [
  { id: 'pw_upper', label: 'DUŻE LITERY A-Z', charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', forbidden: false },
  { id: 'pw_lower', label: 'MAŁE LITERY A-Z', charset: 'abcdefghijklmnopqrstuvwxyz', forbidden: false },
  { id: 'pw_digits', label: 'CYFRY 0-9', charset: '0123456789', forbidden: false },
  { id: 'pw_special', label: 'ZNAKI SPECJALNE !@#$%^&*()_+', charset: '!@#$%^&*()_+', forbidden: false },
  { id: 'pw_space', label: 'BIAŁE ZNAKI NP. SPACJA', charset: ' ', forbidden: true },
  { id: 'pw_national', label: 'ZNAKI NARODOWE ĘĆŹĄŚ', charset: 'ĘĆŹĄŚ', forbidden: true }
];

const noteTiles: NoteTile[] = [
  { id: 'note_icon', slot: 'icon', label: 'KŁÓDKA' }, // grafika: kłódka na niebieskim tle
  { id: 'note_amount', slot: 'amount', label: 'KWOTA: $ 200 000' },
  { id: 'note_address', slot: 'address', label: 'ADRES: XKAJ1023KJDf93' },
  { id: 'note_contact', slot: 'contact', label: 'NAPISZ DO NAS' },
  {
    id: 'title_encrypted',
    slot: 'title',
    label: 'TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!',
    tier: 'ideal',
    reportPart: 'OSTRZEŻENIE',
    feedback: 'Formalny, alarmujący ton nagłówka.'
  },
  {
    id: 'title_casual',
    slot: 'title',
    label: 'CZEKAM NA BITCOINY!',
    tier: 'suboptimal',
    reportPart: 'TYTUŁ: CZEKAM NA BITCOINY!',
    feedback: 'Niepoważny nagłówek obniża autorytet i wiarygodność żądania.'
  },
  {
    id: 'time_30h',
    slot: 'time',
    label: 'POZOSTAŁY CZAS: 30 GODZIN',
    tier: 'ideal',
    reportPart: 'LIMIT 30 H',
    feedback: 'Realny limit czasu: 30 godzin na zebranie okupu.'
  },
  {
    id: 'time_30s',
    slot: 'time',
    label: 'POZOSTAŁY CZAS: 30 MINUT',
    tier: 'suboptimal',
    reportPart: 'LIMIT 30 MIN',
    feedback: 'Czas 30 minut uniemożliwia ofierze podjęcie negocjacji i zakup kryptowalut.',
    reject: { mentorLine: '30 MINUT TO NIE LIMIT, TYLKO ŻART. W TAKIM CZASIE NIKT NIE ZDĄŻY SIĘ Z NAMI SKONTAKTOWAĆ. WYBIERZ INACZEJ.' }
  }
];

const colorOptions: ColorOption[] = [
  {
    id: 'green',
    label: 'ZIELONY',
    swatch: '#22c55e',
    tier: 'suboptimal', // plan P4: zielony = suboptimal
    feedback: 'Kolor zielony podświadomie kojarzy się ze statusem bezpiecznym i poprawnym.'
  },
  {
    id: 'red',
    label: 'CZERWONY',
    swatch: '#ef4444',
    tier: 'ideal',
    feedback: 'Uniwersalny kolor alarmowy wywołujący silny stan zagrożenia i presję.'
  },
  {
    id: 'white',
    label: 'BIAŁY / SZARY',
    swatch: '#e5e7eb',
    tier: 'suboptimal',
    feedback: 'Neutralna barwa przypominająca standardowy błąd systemowy.'
  }
];

export const builderConfig: BuilderConfig = {
  title: '//KREATOR: RANSOMWARE',
  subtitle: 'KLUCZ SZYFRUJĄCY I KOMUNIKAT DLA OFIARY',
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  password: {
    decisionNum: 2,
    question: 'SIŁA WYGENEROWANEGO HASŁA (SKALA DO 5)',
    task: 'SKONFIGURUJ GENERATOR HASŁA W MENEDŻERZE HASEŁ.',
    heading: 'USTAW ZŁOŻONOŚĆ HASŁA:',
    lengthLabel: 'DŁUGOŚĆ HASŁA',
    frameLabel: 'CECHY HASŁA:',
    previewLabel: 'HASŁO:',
    confirmLabel: 'ZAPISZ W BAZIE I KONTYNUUJ',
    resultLabel: 'SIŁA HASŁA:',
    minLength: 8,
    maxLength: 24,
    defaultLength: 8,
    criticalLength: 8,
    idealLength: 24,
    idealSets: 4,
    tiles: passwordTiles,
    strengthMessages: {
      // 1–2 to poziom critical: zamiast wyniku silnik pokazuje ekran wykrycia.
      1: 'HASŁO ZAWIERA ZNAKI NIEDOZWOLONE W KLUCZACH TECHNICZNYCH',
      2: 'HASŁO MA MINIMALNĄ DŁUGOŚĆ',
      3: 'HASŁO ŚREDNIEJ SIŁY',
      4: 'SILNE HASŁO',
      5: 'UŻYTO MAKSYMALNEJ ILOŚCI ZNAKÓW ORAZ ZNAKÓW SPECJALNYCH, JEDNOCZEŚNIE UNIKAJĄC TYCH NIEDOZWOLONYCH. STWORZONO NAPRAWDĘ BARDZO SILNE HASŁO'
    },
    answers: {
      ideal: '5 (DŁUGOŚĆ 24, ZESTAWY ZNAKÓW: 4)',
      other: '{score} (DŁUGOŚĆ {length}, ZESTAWY ZNAKÓW: {sets})'
    },
    feedback: {
      ideal:
        'Maksymalna długość i 4 dozwolone zestawy znaków, bez znaków niedozwolonych: klucza nie da się złamać w rozsądnym czasie.',
      suboptimal:
        'Krótsze hasło lub mniej zestawów znaków: klucz jest podatny na atak słownikowy i brute force.',
      // Nieużywane w grze: słabe hasło i znaki niedozwolone odrzuca mentor (rejectLine), zanim ransomware powstanie.
      critical:
        'Zbyt słaby klucz (8 znaków) albo znaki niedozwolone (spacja, znaki narodowe), które powodują błąd parsera i uniemożliwiają odszyfrowanie.'
    },
    // B2: mentor wyłapuje te konfiguracje w kreatorze, zanim ransomware zostanie wysłany.
    rejectLine: (ev) => {
      if (ev.hasForbidden) {
        return 'SPACJE I ZNAKI NARODOWE ZEPSUJĄ PARSER KLUCZA I SAMI NIE ODSZYFRUJEMY PLIKÓW. USTAW HASŁO INACZEJ.';
      }
      if (ev.score <= 2) {
        return 'TAKIE HASŁO ICH SPECJALIŚCI ZŁAMIĄ W KILKA CHWIL. USTAW HASŁO INACZEJ.';
      }
      return undefined;
    }
  },
  note: {
    decisionNum: 3,
    question: 'KOMPONENTY WIADOMOŚCI',
    task: 'KROK 1: PRZECIĄGNIJ INFORMACJE I KOMPONENTY NA GŁÓWNYM EKRANIE',
    confirmLabel: 'ZATWIERDŹ KOMUNIKAT',
    slots: [
      { id: 'icon', label: '[IKONA]' },
      { id: 'title', label: '[TYTUŁ WIADOMOŚCI]' },
      { id: 'time', label: '[CZAS]' },
      { id: 'amount', label: '[KWOTA]' },
      { id: 'address', label: '[ADRES]' },
      { id: 'contact', label: '[KONTAKT]' }
    ],
    tiles: noteTiles,
    answerJoiner: ' + ',
    idealFeedback: 'Formalny, alarmujący ton i realny limit czasu (30 godzin na zebranie okupu).'
  },
  color: {
    decisionNum: 4,
    question: 'WYBIERZ KOLOR OKNA / ELEMENTÓW',
    task: 'KROK 2: WYBIERZ KOLOR OKNA I ELEMENTÓW',
    confirmLabel: 'ZATWIERDŹ KOLOR',
    options: colorOptions
  },
  loaders: { note: 'ŁADOWANIE KOMPONENTÓW KOMUNIKATU…', color: 'PRZYGOTOWANIE PALETY KOLORÓW…', compile: 'KOMPILACJA WIRUSA…' },
  doneMessage: 'WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY'
};

// ---------------------------------------------------------------------------
// ETAP 3: er_phishing_mail — D5 temat, D6 treść, uzbrojenie załącznika
// ---------------------------------------------------------------------------

export const mailConfig: MailConfig = {
  title: '//MAIL',
  subtitle: 'WIADOMOŚĆ DO DZIAŁU REKRUTACJI ENERGY ROCK',
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  recipient: 'rekrutacja@energyrock.com',
  positionLabel: 'STANOWISKO:',
  position: 'ANALITYK RYNKÓW ENERGETYCZNYCH',
  attachment: 'CV_WILK.PDF',
  payloadLabel: '//WIRUS: RANSOMWARE',
  subject: {
    decisionNum: 5,
    question: 'WYBIERZ TEMAT MAILA',
    fieldLabel: 'TEMAT:',
    task: 'WYBIERZ TEMAT WIADOMOŚCI I PRZECIĄGNIJ GO DO POLA TEMAT.',
    options: [
      {
        id: 'subj_cv_wilk',
        label: 'CV MICHAŁ WILK',
        tier: 'ideal',
        feedback: 'Ściśle spełnia wytyczne rekrutacyjne: dopisek CV oraz imię i nazwisko.'
      },
      {
        id: 'subj_wilk_cv',
        label: 'WILK CV',
        tier: 'suboptimal',
        feedback: 'Brak imienia, nieprofesjonalny styl.'
      },
      {
        id: 'subj_analyst',
        label: 'ANALITYK MICHAŁ WILK',
        tier: 'suboptimal', // B2 (D-06): mentor odrzuca, nikt nas nie wykrył
        feedback: 'Brak słowa kluczowego „CV” w temacie sprawia, że filtry działu HR pomijają takie wiadomości.',
        reject: { mentorLine: 'FILTRY HR POMINĄ MAIL Z TAKIM TEMATEM, REKRUTER GO NIE OTWORZY. WYBIERZ INACZEJ.' }
      }
    ]
  },
  body: {
    decisionNum: 6,
    question: 'WYBIERZ TREŚĆ MAILA',
    fieldLabel: 'TREŚĆ:',
    task: 'WYBIERZ TREŚĆ WIADOMOŚCI I PRZECIĄGNIJ JĄ DO POLA TREŚĆ.',
    options: [
      {
        id: 'body_formal',
        label:
          'DZIEŃ DOBRY, PRZESYŁAM CV W ZWIĄZKU Z REKRUTACJĄ NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH. HASŁO DO PLIKU: WILK. POZDRAWIAM, MICHAŁ WILK',
        reportAnswer: 'TREŚĆ Z HASŁEM WILK NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH',
        tier: 'ideal',
        feedback: 'Profesjonalny ton, właściwe stanowisko i podane hasło do pliku: zaszyfrowanego załącznika nie sprawdzą piaskownice ani skanery antywirusowe.'
      },
      {
        id: 'body_casual',
        label: 'HEJ, W ZAŁĄCZNIKU PRZESYŁAM CV. POZDRAWIAM, MICHAŁ WILK',
        reportAnswer: 'LUŹNA TREŚĆ BEZ STANOWISKA I HASŁA',
        tier: 'suboptimal', // plan: „HEJ…” suboptimal (dawniej critical)
        feedback: 'Zbyt nieformalny zwrot, brak nazwy stanowiska i hasła.'
      },
      {
        id: 'body_no_pwd',
        label: 'CZEŚĆ, PRZESYŁAM CV NA STANOWISKO ANALITYK USŁUG ENERGETYCZNYCH. POZDRAWIAM, MICHAŁ WILK',
        reportAnswer: 'TREŚĆ NA STANOWISKO ANALITYK USŁUG ENERGETYCZNYCH, BEZ HASŁA',
        tier: 'suboptimal', // B2 (D-06): mentor odrzuca, nikt nas nie wykrył
        feedback: 'Błędna nazwa stanowiska („usług” zamiast „rynków”) i brak hasła do pliku.',
        reject: { mentorLine: 'REKRUTER ZIGNORUJE MAILA, KTÓRY APLIKUJE NA STANOWISKO, KTÓREGO NIE OGŁASZALI. WYBIERZ INACZEJ.' }
      }
    ]
  },
  confirmLabel: 'ZATWIERDŹ',
  loaders: { body: 'ŁADOWANIE TREŚCI WIADOMOŚCI…', arm: 'DODAWANIE ZAŁĄCZNIKA…' },
  arm: {
    task: 'PRZECIĄGNIJ //WIRUS: RANSOMWARE NA ZAŁĄCZNIK CV_WILK.PDF.',
    arming: 'UZBRAJANIE ZAŁĄCZNIKA…',
    armed: 'ZAŁĄCZNIK ZAINFEKOWANY',
    nextLabel: 'WŁĄCZ VPN'
  }
};

// ---------------------------------------------------------------------------
// ETAP 4: vpn_router (klocek katalogu) — D7: IP (bramka) + nadawca (jedna decyzja)
// ---------------------------------------------------------------------------

export const vpnConfig: VpnRouterConfig = {
  title: '//VPN',
  vpn: {
    // bez decisionNum: IP jest bramką bez oceny (zły adres blokuje, nie karze)
    question: 'USTAW ADRES IP TUNELU VPN',
    targetIp: '109.43.200.124',
    initialIp: '106.55.202.120',
    feedback: {
      ideal: 'POMYŚLNIE DOPASOWANO IP',
      critical: 'ADRES IP NIE ZGADZA SIĘ Z POŻĄDANYM. POPRAW OKTETY'
    }
  },
  sender: {
    decisionNum: 7,
    question: 'ZABEZPIECZENIE TOŻSAMOŚCI (VPN / NADAWCA)',
    confirmLabel: 'WYŚLIJ MAILA',
    includeIpInAnswer: true,
    options: [
      {
        id: 'sender_wilk',
        label: 'M.WILK@PRIV.COM',
        tier: 'ideal',
        feedback: 'Pełna spójność adresu z podpisem Michał Wilk.'
      },
      {
        id: 'sender_alex',
        label: 'ALEX@PRIV.COM',
        tier: 'suboptimal',
        feedback: 'Rozbieżność imienia (Alex vs Michał Wilk) wzbudza podejrzenia.'
      },
      {
        id: 'sender_spam',
        label: 'NEWRAWGOODS@COMMERCIAL.BIZ',
        tier: 'suboptimal', // B2 (D-06): mentor odrzuca, nikt nas nie wykrył
        feedback: 'Domena komercyjna B2B całkowicie niezwiązana z kandydatem.',
        reject: { mentorLine: 'CV Z ADRESU SKLEPU Z TOWARAMI TO OD RAZU SPAM. NIKT NIE OTWORZY TAKIEGO ZAŁĄCZNIKA. WYBIERZ INNEGO NADAWCĘ.' }
      }
    ]
  }
  // bez timeJump: przeskok czasu gra mostek etapu 4
};

// ---------------------------------------------------------------------------
// ETAP 5: er_ransom_c2 — start, szyfrowanie sieci, D8 eksfiltracja
// ---------------------------------------------------------------------------

const exfilFiles: ExfilFile[] = [
  { id: 'f_wypowiedzenie', name: 'WYPOWIEDZENIE.PDF', role: 'other' },
  { id: 'f_marek', name: 'MAREK.JPG', role: 'other' },
  { id: 'f_fvolt_tech', name: 'FVOLT_TECH.DOCX', role: 'target' },
  { id: 'f_kontrakty', name: 'KONTRAKTY.XCF', role: 'other' },
  { id: 'f_tech_opis', name: 'TECHNOLOGIA_OPIS.PDF', role: 'other' },
  { id: 'f_freevolt_schemat', name: 'FREEVOLT_SCHEMAT.PDF', role: 'target' },
  { id: 'f_tech_schematy', name: 'TECHNOLOGIA_SCHEMATY.PDF', role: 'other' },
  { id: 'f_materialy', name: 'MATERIALY.TXT', role: 'other' },
  { id: 'f_wazne_dane', name: 'WAZNE_DANE.DOCX', role: 'other' },
  { id: 'f_sekret', name: 'SEKRET.TXT', role: 'other' },
  { id: 'f_umowa', name: 'UMOWA2022.PDF', role: 'other' },
  { id: 'f_energia_fvolt', name: 'ENERGIA_FVOLT.XCF', role: 'target' }
];

// 8 węzłów: wektor (pendrive), 2 stacje, 4 serwery baz danych, serwer główny.
const networkNodes: NetworkNode[] = [
  { id: 'n_vector', label: 'PUNKT WEJŚCIA', kind: 'vector', x: 50, y: 50 },
  { id: 'n_ws1', label: 'STACJA ROBOCZA 01', kind: 'workstation', x: 20, y: 22 },
  { id: 'n_ws2', label: 'STACJA ROBOCZA 02', kind: 'workstation', x: 80, y: 22 },
  { id: 'n_db1', label: 'BAZA DANYCH 01', kind: 'database', x: 12, y: 60 },
  { id: 'n_db2', label: 'BAZA DANYCH 02', kind: 'database', x: 30, y: 82 },
  { id: 'n_db3', label: 'BAZA DANYCH 03', kind: 'database', x: 70, y: 82 },
  { id: 'n_db4', label: 'BAZA DANYCH 04', kind: 'database', x: 88, y: 60 },
  { id: 'n_main', label: 'SERWER GŁÓWNY', kind: 'main', x: 50, y: 18 }
];

export const c2Config: C2Config = {
  title: '//MODUŁ_RANSOMWARE',
  subtitle: 'ZDALNY PANEL ZAINFEKOWANEJ STACJI',
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  start: {
    task: 'URUCHOM SZYFROWANIE ZASOBÓW FIRMY.',
    status: 'CV ZOSTAŁO OTWARTE – MALWARE ZOSTAŁ AKTYWOWANY',
    // Odroczone skutki słabszych wyborów D5–D7 (punkty zdjęto przy decyzji; tu tylko fabuła).
    statusDelayed: 'CV ZOSTAŁO OTWARTE Z OPÓŹNIENIEM – MALWARE ZOSTAŁ AKTYWOWANY',
    delayNotes: [
      {
        when: { decision: 5, tier: WEAKER_TIERS },
        text: 'TEMAT MAILA WZBUDZIŁ WĄTPLIWOŚCI REKRUTERA – OTWORZYŁ GO Z OPÓŹNIENIEM'
      },
      {
        when: { decision: 6, tier: WEAKER_TIERS },
        text: 'SKANER POCZTY ZATRZYMAŁ ZAŁĄCZNIK BEZ HASŁA – REKRUTER ZWOLNIŁ GO RĘCZNIE DOPIERO PO POŁUDNIU'
      },
      {
        when: { decision: 7, tier: WEAKER_TIERS },
        text: 'REKRUTER ZGŁOSIŁ DO IT NIETYPOWY ADRES NADAWCY'
      }
    ],
    hostLabel: 'NAZWA KOMPUTERA:',
    host: 'ENERGY_ROCK_01_PC',
    ipLabel: 'AKTYWOWANE NA IP:',
    ip: '151.89.159.52',
    button: 'SZYFRUJ ZASOBY FIRMY',
    loader: 'SKANOWANIE SIECI…'
  },
  encrypt: {
    task: 'KLIKAJ ZIELONE WĘZŁY, ŻEBY JE ZASZYFROWAĆ.',
    nodes: networkNodes,
    doneMessage: 'ZASOBY FIRMY ENERGY ROCK ZOSTAŁY POMYŚLNIE ZASZYFROWANE. UZYSKANO DOSTĘP DO SERWERÓW',
    nextLabel: 'POBIERZ PLIKI'
  },
  exfil: {
    decisionNum: 8,
    question: 'EKSFILTRACJA PLIKÓW',
    // Brak `options`: poziom D8 wylicza minigra z reguł (cele/pozostałe), `answer` z `answers`, feedback z `feedback`.
    task: 'PRZECIĄGNIJ DO POLA PLIKI, PO KTÓRE PRZYSZEDŁEŚ.',
    fieldLabel: 'POBRANE PLIKI:',
    confirmLabel: 'POBIERZ ZAZNACZONE',
    loader: 'POBIERANIE PLIKÓW…',
    requiredTargets: 3,
    files: exfilFiles,
    // Ideał z dopiskiem o nadmiarowych plikach dokłada silnik (`extrasPhrase`), tekst tutaj to same 3 cele.
    answers: { ideal: '3 PLIKI FREEVOLT (DOCX, PDF, XCF)' },
    feedback: {
      ideal: 'Pozyskano kompletną dokumentację technologii Freevolt.',
      suboptimal: 'Niekompletny zestaw: części dokumentacji Freevolt brakuje, więc cel operacji został osiągnięty tylko częściowo.',
      critical: 'Żaden pobrany plik nie dotyczy Freevolt: całkowita porażka głównego celu operacji.'
    },
    // Nikt nas nie wykrył, ale cel przepadł: modal „OPERACJA NIEUDANA”, nie „ZOSTAŁEŚ WYKRYTY!”.
    failTitle: 'OPERACJA NIEUDANA',
    failText:
      'Żaden z pobranych plików nie dotyczy technologii Freevolt. Dostęp do serwerów Energy Rock został zmarnowany, a cel operacji przepadł.'
  }
};

// ---------------------------------------------------------------------------
// ETAP 6: er_victim_chat — D9, D10 (DialogueTree per-węzeł) + węzeł 3 bez oceny
// ---------------------------------------------------------------------------

const negotiationDialogue: DialogueTreeConfig = {
  respondent: 'SZEF IT ENERGY ROCK',
  title: '//CZAT_Z_OFIARĄ',
  nodes: [
    {
      id: 'neg_1',
      decisionNum: 9,
      question: 'JAK ODPOWIESZ SZEFOWI IT NA INFORMACJĘ O SŁUŻBACH?',
      incoming: 'ROZWIĄZUJEMY PROBLEM RANSOMWARE I ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE',
      options: [
        {
          id: 'firm_stance',
          label: 'ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ',
          tier: 'ideal',
          feedback: 'Wskazanie na matematyczną nieodwracalność silnego szyfrowania łamie wiarę ofiary w pomoc z zewnątrz.',
          nextNode: 'neg_2'
        },
        {
          id: 'aggression',
          label: 'NIE BOJĘ SIĘ POLICJI',
          tier: 'suboptimal',
          feedback: 'Emocjonalna reakcja bez technicznego argumentu o bezradności służb wobec silnego klucza; szef IT grozi zerwaniem rozmów.',
          nextNode: 'neg_1_threat'
        },
        {
          id: 'surrender',
          label: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM.',
          tier: 'suboptimal',
          feedback: 'Kapitulacja pod wpływem blefu ofiary: osłabia pozycję negocjacyjną i trzeba wracać do rozmowy.',
          nextNode: 'neg_1_retreat'
        }
      ]
    },
    {
      // Po kapitulacji (D9): ofiara czuje ulgę, gracz wraca do stołu (kwestia bez oceny).
      id: 'neg_1_retreat',
      incoming: 'NO WRESZCIE ROZSĄDEK. W TAKIM RAZIE KOŃCZYMY TĘ ROZMOWĘ, A MY ZAJMIEMY SIĘ ODZYSKIWANIEM DANYCH',
      options: [
        {
          id: 'retreat_return',
          label: 'CHWILA, NIE TAK SZYBKO. SAMI SIĘ NIE ODZYSKACIE, TYLKO JA MAM KLUCZ. WRÓĆMY DO ROZMOWY',
          tier: 'ideal',
          feedback: 'Powrót do negocjacji (kwestia bez oceny).',
          nextNode: 'neg_2'
        }
      ]
    },
    {
      // Po agresywnej odpowiedzi (D9, M4-03): szef IT grozi zerwaniem rozmów (kwestia bez oceny).
      id: 'neg_1_threat',
      incoming: 'NIE BĘDĘ SIĘ Z TOBĄ PRZERZUCAŁ GROŹBAMI. JEŚLI NIE ZACZNIESZ ROZMAWIAĆ PO LUDZKU, ZRYWAM ROZMOWY I ZOSTAWIAM SPRAWĘ SŁUŻBOM',
      options: [
        {
          id: 'threat_calm',
          label: 'SPOKOJNIE, NIE ZRYWAJ. WRÓĆMY DO SPRAWY',
          tier: 'ideal',
          feedback: 'Powrót do negocjacji (kwestia bez oceny).',
          nextNode: 'neg_2'
        }
      ]
    },
    {
      id: 'neg_2',
      decisionNum: 10,
      question: 'CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?',
      incoming: 'CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?',
      options: [
        {
          id: 'btc_demand',
          label: 'TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY',
          tier: 'ideal',
          feedback: 'Konsekwentne utrzymanie przykrywki ataku czysto finansowego ukrywa kradzież plików Freevolt.',
          nextNode: 'neg_3'
        },
        {
          id: 'troll',
          label: 'NICZEGO NIE ODSZYFRUJĘ, ROBIĘ TO DLA ZABAWY :D',
          tier: 'critical',
          feedback: 'Niszczy szansę na okup i podważa wiarygodność grupy jako profesjonalnych szantażystów.',
          failTitle: 'OKUP PRZEPADŁ',
          failText:
            'Szef IT usłyszał, że to tylko zabawa, i zerwał rozmowę. Nikt nie zapłaci okupu, a bez niego atak traci przykrywkę dla kradzieży plików Freevolt.'
        },
        {
          id: 'reveal_motive',
          label: 'CHCĘ DOSTĘPU DO PLIKÓW FREEVOLT',
          tier: 'critical',
          feedback: 'Błąd dekonspiracyjny: zdradza szpiegowski charakter ataku i prawdziwy cel napastników.',
          failTitle: 'DEKONSPIRACJA',
          failText:
            'Szef IT wie już, że chodzi o technologię Freevolt. Przykrywka ataku finansowego runęła, a operacja przestała być tajna.'
        }
      ]
    },
    {
      id: 'neg_3',
      incoming: 'POTRZEBUJEMY CZASU NA ICH ZDOBYCIE',
      // Jedyna opcja bez oceny (węzeł bez decisionNum): kończy rozmowę.
      options: [
        {
          id: 'deadline_3h',
          label: 'MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA DO ODSZYFROWANIA',
          tier: 'ideal',
          feedback: 'Ultimatum (kwestia bez oceny).'
        }
      ]
    }
  ]
};

export const victimChatConfig: VictimChatConfig = {
  title: '//CZAT_Z_OFIARĄ',
  subtitle: 'KOMUNIKATOR: SZEF IT ENERGY ROCK',
  dialogue: negotiationDialogue,
  reportAnswers: {
    firm_stance: 'ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW…',
    btc_demand: 'INTERESUJĄ MNIE TYLKO BITCOINY (OKUP WYŁUDZONY: TAK)'
  },
  preview: {
    heading: 'OKNO WYŚWIETLONE OFIERZE',
    amountLabel: 'PŁATNOŚĆ W BTC',
    amount: noteTiles.find((t) => t.id === 'note_amount')!.label,
    address: noteTiles.find((t) => t.id === 'note_address')!.label,
    contact: noteTiles.find((t) => t.id === 'note_contact')!.label,
    titles: Object.fromEntries(noteTiles.filter((t) => t.slot === 'title').map((t) => [t.id, t.label])),
    times: Object.fromEntries(noteTiles.filter((t) => t.slot === 'time').map((t) => [t.id, t.label])),
    colors: Object.fromEntries(colorOptions.map((c) => [c.id, c.swatch])),
    fallback: { titleId: 'title_encrypted', timeId: 'time_30h', colorId: 'red' }
  }
};

/** Dane klocków M4, kluczowane identyfikatorem kafelka pulpitu. */
export const mission4Blocks: Record<string, unknown> = {
  virus_database: virusLabConfig,
  ransomware_builder: builderConfig,
  mail: mailConfig,
  vpn_app: vpnConfig,
  victim_workstation: c2Config,
  negotiation: victimChatConfig
};

// ---------------------------------------------------------------------------
// ETAPY MISJI — przebieg przez completeStage (wzorzec B).
// Kolejność Kill Chain: uzbrojenie -> dostarczenie -> egzekucja -> działania na celach.
// Kafelek następnego etapu odblokowuje się dopiero po kwestii gracza (i po przeskoku czasu).
// ---------------------------------------------------------------------------

export const mission4Stages: StageDefinition[] = [
  {
    id: 'virus_database',
    appId: 'virus_database',
    decisions: [1],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm4_reply_virus',
          label: 'STWORZĘ TAKIE HASŁO, ŻE NIE MA SZANS, ŻEBY ICH SPECJALIŚCI ZŁAMALI JE PRZEZ NAJBLIŻSZE TYGODNIE. WYKORZYSTAM GENERATOR W MOIM MENEDŻERZE HASEŁ'
        }
      ],
      unlockIcons: ['ransomware_compiled', 'ransomware_builder'],
      badges: { ransomware_builder: 1, chat: 1 },
      highlightTile: 'ransomware_builder',
      sound: 'notification'
    }
  },
  {
    id: 'ransomware_builder',
    appId: 'ransomware_builder',
    decisions: [2, 3, 4],
    completion: {
      // Mostek S04->S05; BM po S03 („GDYBY LUDZIE…”) pominięte (plan O3), dopisane zdanie o haśle usunięte.
      conversation: [
        {
          from: 'byte_master',
          text: "ZNALAZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA"
        },
        { from: 'player', id: 'm4_reply_builder', label: 'MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU MAILA Z CV?' },
        { from: 'byte_master', text: 'TEMAT MAILA POWINIEN ZAWIERAĆ DOPISEK CV ORAZ IMIĘ I NAZWISKO KANDYDATA' }
      ],
      unlockIcons: ['mail_unlocked', 'mail'],
      badges: { mail: 1, chat: 1 },
      highlightTile: 'mail',
      sound: 'notification'
    }
  },
  {
    id: 'mail',
    appId: 'mail',
    decisions: [5, 6],
    completion: {
      // Spójnik (dokument milczy na tej granicy), plan, mostek 3.
      conversation: [{ from: 'player', id: 'm4_reply_mail', label: 'ZAŁĄCZNIK GOTOWY. CZAS ZAMASKOWAĆ ADRES IP PRZED WYSŁANIEM' }],
      unlockIcons: ['vpn_unlocked', 'vpn_app'],
      badges: { vpn_app: 1, chat: 1 },
      highlightTile: 'vpn_app',
      sound: 'notification'
    }
  },
  {
    id: 'vpn_app',
    appId: 'vpn_app',
    decisions: [7],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm4_reply_vpn',
          label: 'WSZYSTKO ZROBIONE. CZEKAMY AŻ OTWORZĄ CV I AKTYWUJĄ RANSOMWARE. JAK NIE PRZYJMIECIE MNIE DO DARKSUN, TO MOŻE DOSTANĘ PRACĘ W ENERGY ROCK'
        },
        { from: 'byte_master', text: 'KTO WIE?' },
        // Wysłanie późnym popołudniem, otwarcie CV rano (plan P7). Słabszy wybór w D5–D7: otwarcie dopiero po południu.
        { from: 'time_jump', clockFrom: '16:40', clock: '09:10', label: 'DO GODZIN PRACY REKRUTERA…', when: MAIL_IDEAL },
        { from: 'time_jump', clockFrom: '16:40', clock: '12:25', label: 'DO GODZIN PRACY REKRUTERA…', when: MAIL_WEAKER }
      ],
      unlockIcons: ['victim_workstation_unlocked', 'victim_workstation'],
      badges: { victim_workstation: 1, chat: 1 },
      highlightTile: 'victim_workstation',
      incomingCall: { appId: 'victim_workstation', label: 'MALWARE ZOSTAŁ AKTYWOWANY' },
      sound: 'alarm'
    }
  },
  {
    id: 'victim_workstation',
    appId: 'victim_workstation',
    decisions: [8],
    // Ostrzeżenie pada zaraz po otwarciu panelu CV, przed kliknięciem „SZYFRUJ ZASOBY FIRMY” (tylko słabszy mail D5–D7).
    openingConversation: [{ from: 'byte_master', text: 'IT JUŻ COŚ PODEJRZEWA. DZIAŁAJ SZYBKO.', when: MAIL_WEAKER }],
    completion: {
      conversation: [
        { from: 'player', id: 'm4_reply_workstation', label: 'AKTYWOWALI RANSOMWARE I STRACILI DOSTĘP DO PLIKÓW. TERAZ CZEKAMY AŻ SIĘ ZE MNĄ SKONTAKTUJĄ' },
        { from: 'byte_master', text: 'PAMIĘTAJ TYLKO, ŻE POTRZEBUJEMY I PLIKÓW, I OKUPU' },
        { from: 'time_jump', clockFrom: '09:10', clock: '11:35', label: 'DO REAKCJI SZEFA IT…', when: MAIL_IDEAL },
        { from: 'time_jump', clockFrom: '12:25', clock: '14:50', label: 'DO REAKCJI SZEFA IT…', when: MAIL_WEAKER }
      ],
      unlockIcons: ['negotiation_unlocked', 'negotiation'],
      badges: { negotiation: 1, chat: 1 },
      highlightTile: 'negotiation',
      incomingCall: { appId: 'negotiation', label: 'OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT' },
      sound: 'alarm'
    }
  },
  {
    id: 'negotiation',
    appId: 'negotiation',
    decisions: [9, 10],
    completion: {
      // Meldunek u mentora: cztery osobne beaty.
      conversation: [
        { from: 'player', id: 'm4_reply_neg_1', label: 'SKOŃCZYŁEM ROZMOWĘ Z SZEFEM IT. CZAS NA PODSUMOWANIE' },
        { from: 'byte_master', text: 'TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO', when: { decision: 8, tier: 'ideal' } },
        {
          from: 'byte_master',
          text: 'MAMY OKUP, ALE DOKUMENTACJA FREEVOLT JEST NIEPEŁNA. RESZTĘ TRZEBA BĘDZIE ZDOBYĆ INACZEJ.',
          when: { decision: 8, tier: 'suboptimal' }
        },
        { from: 'player', id: 'm4_reply_neg_2', label: 'CZY TO ZNACZY, ŻE W KOŃCU PRZYJMIECIE MNIE DO DARKSUN?' },
        {
          from: 'byte_master',
          text: 'NIE TAK SZYBKO, MAM DLA CIEBIE JESZCZE WISIENKĘ NA TORCIE. KILKA WISIENEK. PRZYGOTUJ SIĘ'
        }
      ],
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success'
    }
  }
];
