// Etapy i dane klocków Misji 4 (Energy Rock) — wzorzec B, po przebudowie (porcja B).
// Źródło prawdy: docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md; plan: docs/rebuild-plan.md (sekcje 2, 3, 5, 9).
// Treść (teksty, feedback) mieszka tutaj, nie w kodzie minigry. Struktura i poziomy (`tier`) są wg planu.
// Teksty, których nie było w poprzedniej wersji, mają wartość `TODO_VR` i komentarz `TODO(tekst-VR)`:
// koordynator uzupełnia je z dokumentu. Istniejące stringi przeniesiono bez zmian (część do poprawy 1:1 z dokumentem
// jest oznaczona tym samym komentarzem).

import type { DialogueTreeConfig, StageDefinition } from '../../engine/types/mission';
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

/** Znacznik tekstu do uzupełnienia z dokumentu (test `mission4.test.ts` ma wyłączone sprawdzenie jego braku). */
export const TODO = 'TODO_VR';

// ---------------------------------------------------------------------------
// ETAP 1: er_virus_lab — D1 + zdrapka (flavor bez oceny)
// ---------------------------------------------------------------------------

export const virusLabConfig: VirusLabConfig = {
  title: '//BAZA_WIRUSÓW',
  subtitle: TODO, // TODO(tekst-VR): podtytuł aplikacji (kontekst, nie polecenie), plan 3.1
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
        imageAlt: TODO, // TODO(tekst-VR): tekst alternatywny grafiki karty Ransomware, plan 3.1
        tier: 'ideal',
        feedback:
          'Zgodnie z planem operacji paraliżuje serwery ofiary, dając doskonały kamuflaż pod kradzież technologii Freevolt pod płaszczykiem szantażu finansowego.' // TODO(tekst-VR): feedback 1:1 z dokumentu
      },
      {
        id: 'rat',
        label: 'RAT: REMOTE ACCESS TROJAN',
        desc: 'POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY',
        image: { group: 'virus', name: 'rat' },
        imageAlt: TODO, // TODO(tekst-VR): tekst alternatywny grafiki karty RAT
        tier: 'suboptimal',
        feedback:
          'RAT umożliwia cichy dostęp, lecz nie paraliżuje infrastruktury firmy ani nie stwarza natychmiastowej przykrywki pod żądanie okupu.' // TODO(tekst-VR): feedback 1:1 z dokumentu
      },
      {
        id: 'keylogger',
        label: 'KEYLOGGER',
        desc: 'POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
        image: { group: 'virus', name: 'keylogger' },
        imageAlt: TODO, // TODO(tekst-VR): tekst alternatywny grafiki karty Keylogger
        tier: 'critical',
        feedback:
          'Zupełnie chybiony wektor. Zbieranie haseł trwa tygodniami i nie pozwala na zablokowanie zasobów Energy Rock.' // TODO(tekst-VR): feedback 1:1 z dokumentu
      }
    ]
  },
  virusTexts: {
    task: TODO, // TODO(tekst-VR): ZADANIE ekranu wyboru wirusa, plan 3.1
    confirmLabel: TODO // TODO(tekst-VR): etykieta przycisku zatwierdzenia wyboru
  },
  matrix: {
    heading: 'WYSZUKAJ CZĘŚCI WIRUSA:',
    programPrefix: TODO, // TODO(tekst-VR): przedrostek podtytułu „SKŁADASZ PROGRAM:” (plan 3.1)
    loaderText: TODO, // TODO(tekst-VR): „PRZYGOTOWANIE MATRYCY KOMPILACJI…” (plan 3.1)
    revealThreshold: 0.92,
    segments: 10,
    // Keylogger (critical) kończy misję przed zdrapką, więc nie ma wariantu.
    variants: {
      ransomware: {
        programName: 'RANSOMWARE',
        image: { group: 'virus', name: 'matrix_ransomware' },
        imageAlt: TODO, // TODO(tekst-VR): alt ikony monitora w łańcuchach
        parts: [
          { id: 'encrypt', label: TODO, desc: TODO }, // TODO(tekst-VR): 4 podpisane części (plan 3.1, wzorzec: M3 VirusLabApp)
          { id: 'key', label: TODO, desc: TODO },
          { id: 'spread', label: TODO, desc: TODO },
          { id: 'ransom', label: TODO, desc: TODO }
        ],
        barColor: '#8A2BE2'
      },
      rat: {
        programName: 'RAT',
        image: { group: 'virus', name: 'rat' },
        imageAlt: TODO, // TODO(tekst-VR): alt grafiki RAT
        parts: [
          { id: 'screen', label: TODO, desc: TODO }, // TODO(tekst-VR): 4 części RAT (można przenieść z M3)
          { id: 'control', label: TODO, desc: TODO },
          { id: 'stealth', label: TODO, desc: TODO },
          { id: 'link', label: TODO, desc: TODO }
        ],
        barColor: '#8A2BE2'
      }
    },
    doneMessage: TODO, // TODO(tekst-VR): krótki komunikat po 100% paska (plan 3.1, ekran 3)
    task: TODO, // TODO(tekst-VR): ZADANIE zdrapki „PRZECIĄGAJ KURSOREM… ODSŁONIĆ WIRUSA.”
    hint: TODO, // TODO(tekst-VR): „PRZECIĄGAJ TUTAJ”
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
  { id: 'pw_special', label: 'ZNAKI SPECJALNE (!@#$%)', charset: '!@#$%^&*()_+', forbidden: false }, // TODO(tekst-VR): etykieta 1:1 „ZNAKI SPECJALNE !@#$%^&*()_+”
  { id: 'pw_space', label: 'BIAŁE ZNAKI (np. SPACJA)', charset: ' ', forbidden: true }, // TODO(tekst-VR): etykieta 1:1 „BIAŁE ZNAKI NP. SPACJA”
  { id: 'pw_national', label: 'ZNAKI NARODOWE (np. Ą, Ę...)', charset: 'ĄĘĆŹŚ', forbidden: true } // TODO(tekst-VR): etykieta 1:1 „ZNAKI NARODOWE ĘĆŹĄŚ”
];

const noteTiles: NoteTile[] = [
  { id: 'note_icon', slot: 'icon', label: TODO }, // TODO(tekst-VR): ikona (kłódka na niebieskim tle), plan 3.2 ekran 2; opis/alt
  { id: 'note_amount', slot: 'amount', label: '$ 200 000' }, // TODO(tekst-VR): „KWOTA: $ 200 000” 1:1
  { id: 'note_address', slot: 'address', label: 'XKAJI023KJDF93' }, // TODO(tekst-VR): „ADRES: XKAJ1023KJDf93” 1:1 (plan O16)
  { id: 'note_contact', slot: 'contact', label: 'NAPISZ DO NAS' },
  {
    id: 'title_encrypted',
    slot: 'title',
    label: 'TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!',
    tier: 'ideal',
    reportPart: TODO, // TODO(tekst-VR): „OSTRZEŻENIE” (plan 3.2: answer ideal „OSTRZEŻENIE + LIMIT 30 H”)
    feedback: 'Jasny, stanowczy komunikat natychmiast sygnalizuje ofierze powagę sytuacji.' // TODO(tekst-VR): feedback 1:1 z dokumentu
  },
  {
    id: 'title_casual',
    slot: 'title',
    label: 'CZEKAM NA BITCOINY!',
    tier: 'suboptimal',
    reportPart: TODO, // TODO(tekst-VR): „TYTUŁ: CZEKAM NA BITCOINY!” (plan O13)
    feedback: 'Niepoważny ton osłabia presję i wiarygodność profesjonalnego ataku.' // TODO(tekst-VR)
  },
  {
    id: 'time_30h',
    slot: 'time',
    label: 'POZOSTAŁY CZAS: 00:30:00:00',
    tier: 'ideal',
    reportPart: TODO, // TODO(tekst-VR): „LIMIT 30 H”
    feedback: 'Realny limit czasu buduje presję, a jednocześnie pozwala ofierze zebrać okup.' // TODO(tekst-VR)
  },
  {
    id: 'time_30s',
    slot: 'time',
    label: 'POZOSTAŁY CZAS: 00:00:30:00',
    tier: 'critical',
    reportPart: TODO, // TODO(tekst-VR): „LIMIT 30 S”
    feedback: '30 sekund to czas nierealistyczny — uniemożliwia kontakt i zapłatę, niszcząc cel szantażu.' // TODO(tekst-VR)
  }
];

const colorOptions: ColorOption[] = [
  {
    id: 'green',
    label: 'ZIELONY',
    swatch: '#22c55e',
    tier: 'suboptimal', // plan P4: zielony = suboptimal
    feedback: 'Kolor kojarzony z poprawnością i sukcesem. Pracownicy mogą uznać komunikat za zwykłe powiadomienie IT.'
  },
  {
    id: 'red',
    label: 'CZERWONY',
    swatch: '#ef4444',
    tier: 'ideal',
    feedback: 'Kolor alarmowy. Maksymalizuje stres psychologiczny ofiary i zmusza decydentów do pośpiechu.'
  },
  {
    id: 'white',
    label: 'BIAŁY', // TODO(tekst-VR): etykieta 1:1 „BIAŁY / SZARY”
    swatch: '#e5e7eb',
    tier: 'suboptimal',
    feedback: 'Neutralny, nie budzi poczucia natychmiastowego kryzysu ani pośpiechu.'
  }
];

export const builderConfig: BuilderConfig = {
  title: '//KREATOR: RANSOMWARE',
  subtitle: TODO, // TODO(tekst-VR): podtytuł aplikacji
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  password: {
    decisionNum: 2,
    question: 'SIŁA WYGENEROWANEGO HASŁA (SKALA DO 5)',
    task: TODO, // TODO(tekst-VR): ZADANIE „SKONFIGURUJ GENERATOR HASŁA W MENEDŻERZE HASEŁ.” (plan 3.2)
    heading: TODO, // TODO(tekst-VR): „USTAW ZŁOŻONOŚĆ HASŁA:”
    lengthLabel: TODO, // TODO(tekst-VR): „DŁUGOŚĆ HASŁA”
    frameLabel: TODO, // TODO(tekst-VR): „CECHY HASŁA:”
    previewLabel: TODO, // TODO(tekst-VR): „HASŁO:”
    confirmLabel: TODO, // TODO(tekst-VR): „ZAPISZ W BAZIE I KONTYNUUJ”
    resultLabel: TODO, // TODO(tekst-VR): „SIŁA HASŁA:”
    minLength: 8,
    maxLength: 24,
    defaultLength: 8,
    criticalLength: 8,
    idealLength: 24,
    idealSets: 4,
    tiles: passwordTiles,
    strengthMessages: { 1: TODO, 2: TODO, 3: TODO, 4: TODO, 5: TODO }, // TODO(tekst-VR): komunikaty pod wynikiem x/5 (plan 3.2; dla 1–2 pokazywany ekran wykrycia)
    answers: {
      ideal: TODO, // TODO(tekst-VR): „5 (DŁUGOŚĆ 24, 4 ZESTAWY ZNAKÓW)”
      other: TODO // TODO(tekst-VR): szablon z `{score}`, `{length}`, `{sets}` (plan O13)
    },
    feedback: {
      ideal:
        'Maksymalna entropia klucza (24 znaki, pełny bezpieczny zestaw). Zespoły obronne nie mają szans na złamanie hasła brute-forcem.',
      suboptimal:
        'Hasło silne, lecz w sprzyjających warunkach (np. klastry GPU) czas łamania ulega znacznemu skróceniu.',
      critical:
        'Hasło podatne na szybki atak słownikowy LUB błąd wykonania skryptu szyfrującego w systemie ofiary (znaki narodowe / spacje).'
    }
  },
  note: {
    decisionNum: 3,
    question: 'KOMPONENTY WIADOMOŚCI',
    task: TODO, // TODO(tekst-VR): „KROK 1: PRZECIĄGNIJ INFORMACJE I KOMPONENTY NA GŁÓWNYM EKRANIE”
    confirmLabel: TODO, // TODO(tekst-VR): „ZATWIERDŹ KOMUNIKAT”
    slots: [
      { id: 'icon', label: TODO }, // TODO(tekst-VR): 6 podpisów slotów: [IKONA], [TYTUŁ WIADOMOŚCI], [CZAS], [KWOTA], [ADRES], [KONTAKT]
      { id: 'title', label: TODO },
      { id: 'time', label: TODO },
      { id: 'amount', label: TODO },
      { id: 'address', label: TODO },
      { id: 'contact', label: TODO }
    ],
    tiles: noteTiles,
    answerJoiner: ' + ',
    idealFeedback: TODO // TODO(tekst-VR): feedback D3 ideal (tytuł + limit 30 h), 1:1 z dokumentu
  },
  color: {
    decisionNum: 4,
    question: 'WYBIERZ KOLOR OKNA / ELEMENTÓW',
    task: TODO, // TODO(tekst-VR): „KROK 2: WYBIERZ KOLOR OKNA I ELEMENTÓW”
    confirmLabel: TODO,
    options: colorOptions
  },
  loaders: { note: TODO, color: TODO, compile: TODO }, // TODO(tekst-VR): „ŁADOWANIE KOMPONENTÓW KOMUNIKATU…”, „PRZYGOTOWANIE PALETY KOLORÓW…”, „KOMPILACJA WIRUSA…”
  doneMessage: TODO // TODO(tekst-VR): „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”
};

// ---------------------------------------------------------------------------
// ETAP 3: er_phishing_mail — D5 temat, D6 treść, uzbrojenie załącznika
// ---------------------------------------------------------------------------

export const mailConfig: MailConfig = {
  title: '//MAIL',
  subtitle: TODO, // TODO(tekst-VR): podtytuł aplikacji
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  recipient: 'rekrutacja@energyrock.com',
  positionLabel: TODO, // TODO(tekst-VR): „STANOWISKO:”
  position: 'Analityk rynków energetycznych', // TODO(tekst-VR): WERSALIKI wg dokumentu
  attachment: 'CV_WILK.PDF',
  payloadLabel: '//WIRUS: RANSOMWARE',
  subject: {
    decisionNum: 5,
    question: 'WYBIERZ TEMAT MAILA',
    fieldLabel: TODO, // TODO(tekst-VR): „TEMAT:”
    task: TODO, // TODO(tekst-VR): ZADANIE ekranu tematu (plan 3.3)
    options: [
      {
        id: 'subj_cv_wilk',
        label: 'CV MICHAŁ WILK',
        tier: 'ideal',
        feedback: 'Zgodny z instrukcją rekrutacyjną. Format "CV [Imię Nazwisko]" bez problemu przechodzi przez filtry HR.'
      },
      {
        id: 'subj_wilk_cv',
        label: TODO, // TODO(tekst-VR): „WILK CV”
        tier: 'suboptimal',
        feedback: TODO // TODO(tekst-VR): feedback D5 „WILK CV” (brak imienia, nieprofesjonalny styl)
      },
      {
        id: 'subj_analyst',
        label: 'ANALITYK MICHAŁ WILK',
        tier: 'critical', // plan: critical (dawniej suboptimal)
        feedback: TODO // TODO(tekst-VR): feedback D5 „ANALITYK MICHAŁ WILK” (brak słowa „CV”, filtry HR)
      }
    ]
  },
  body: {
    decisionNum: 6,
    question: 'WYBIERZ TREŚĆ MAILA',
    fieldLabel: TODO, // TODO(tekst-VR): „TREŚĆ:”
    task: TODO, // TODO(tekst-VR): ZADANIE ekranu treści
    options: [
      {
        id: 'body_formal',
        label:
          'Dzień dobry.\n\nPrzesyłam CV w związku z rekrutacją na stanowisko Analityka rynków energetycznych.\nHasło do pliku: WILK.\n\nPozdrawiam,\nMichał Wilk', // TODO(tekst-VR): WERSALIKI 1:1 z dokumentu
        reportAnswer: TODO, // TODO(tekst-VR): „TREŚĆ Z HASŁEM WILK NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH”
        tier: 'ideal',
        feedback: 'Formalny styl biznesowy. Szyfrowanie załącznika hasłem uniemożliwia bramkom pocztowym automatyczną detekcję ładunku.'
      },
      {
        id: 'body_casual',
        label: 'Hej.\n\nW załączniku przesyłam cv.\n\nPozdrawiam,\nMichał Wilk', // TODO(tekst-VR): „HEJ, W ZAŁĄCZNIKU PRZESYŁAM CV. POZDRAWIAM, MICHAŁ WILK”
        reportAnswer: TODO, // TODO(tekst-VR): odpowiedź w raporcie (plan O13)
        tier: 'suboptimal', // plan: „HEJ…” suboptimal (dawniej critical)
        feedback: TODO // TODO(tekst-VR): feedback 1:1 (zbyt nieformalny zwrot, brak stanowiska i hasła)
      },
      {
        id: 'body_no_pwd',
        label: 'Cześć.\n\nPrzesyłam CV na stanowisko analityka usług energetycznych.\n\nPozdrawiam,\nMichał Wilk', // TODO(tekst-VR): „CZEŚĆ, PRZESYŁAM CV NA STANOWISKO ANALITYK USŁUG ENERGETYCZNYCH. POZDRAWIAM, MICHAŁ WILK”
        reportAnswer: TODO, // TODO(tekst-VR): odpowiedź w raporcie (plan O13)
        tier: 'critical', // plan: „USŁUG” critical (dawniej suboptimal)
        feedback: TODO // TODO(tekst-VR): feedback 1:1 (błędna nazwa stanowiska, brak hasła)
      }
    ]
  },
  confirmLabel: TODO, // TODO(tekst-VR): etykieta przycisków zatwierdzenia ekranów
  loaders: { body: TODO, arm: TODO }, // TODO(tekst-VR): „ŁADOWANIE TREŚCI WIADOMOŚCI…”, „DODAWANIE ZAŁĄCZNIKA…”
  arm: {
    task: TODO, // TODO(tekst-VR): „PRZECIĄGNIJ //WIRUS: RANSOMWARE NA ZAŁĄCZNIK CV_WILK.PDF.”
    arming: TODO, // TODO(tekst-VR): „UZBRAJANIE ZAŁĄCZNIKA…”
    armed: TODO, // TODO(tekst-VR): „ZAŁĄCZNIK ZAINFEKOWANY”
    nextLabel: TODO // TODO(tekst-VR): „WŁĄCZ VPN”
  }
};

// ---------------------------------------------------------------------------
// ETAP 4: vpn_router (klocek katalogu) — D7: IP (bramka) + nadawca (jedna decyzja)
// ---------------------------------------------------------------------------

export const vpnConfig: VpnRouterConfig = {
  title: '//VPN',
  vpn: {
    // bez decisionNum: IP jest bramką bez oceny (zły adres blokuje, nie karze)
    question: TODO, // TODO(tekst-VR): ewentualne pytanie kroku IP (nieraportowane)
    targetIp: '109.43.200.124',
    initialIp: '106.55.202.120',
    feedback: {
      ideal: 'POMYŚLNIE DOPASOWANO IP',
      critical: TODO // TODO(tekst-VR): komunikat błędu złego adresu IP (bez kary)
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
        label: 'm.wilk@priv.com', // TODO(tekst-VR): WERSALIKI 1:1 „M.WILK@PRIV.COM”
        tier: 'ideal',
        feedback: 'Pełna spójność tożsamości nadawcy z nazwiskiem kandydata w treści i załączniku. Nie budzi podejrzeń rekrutera.'
      },
      {
        id: 'sender_alex',
        label: 'alex@priv.com', // TODO(tekst-VR): „ALEX@PRIV.COM”
        tier: 'suboptimal',
        feedback: 'Niezgodność adresu nadawcy z podpisem pod mailem ("Michał Wilk"), co może zaalarmować czujnego pracownika.'
      },
      {
        id: 'sender_spam',
        label: 'newrapgood@commercial.biz', // TODO(tekst-VR): „NEWRAWGOODS@COMMERCIAL.BIZ”
        tier: 'critical',
        feedback: 'Domena o fatalnej reputacji, brak rekordów SPF/DKIM powiązanych z kandydatem. Wiadomość trafia do spamu.'
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
  { id: 'f_tech_opis', name: TODO, role: 'other' }, // TODO(tekst-VR): „TECHNOLOGIA_OPIS.PDF”
  { id: 'f_freevolt_schemat', name: 'FREEVOLT_SCHEMAT.PDF', role: 'target' },
  { id: 'f_tech_schematy', name: TODO, role: 'other' }, // TODO(tekst-VR): „TECHNOLOGIA_SCHEMATY.PDF”
  { id: 'f_materialy', name: 'MATERIALY.TXT', role: 'other' },
  { id: 'f_wazne_dane', name: 'WAZNE_DANE.DOCX', role: 'other' },
  { id: 'f_sekret', name: 'SEKRET.TXT', role: 'other' },
  { id: 'f_umowa', name: 'UMOWA2022.PDF', role: 'other' },
  { id: 'f_energia_fvolt', name: 'ENERGIA_FVOLT.KCF', role: 'target' } // TODO(tekst-VR): „ENERGIA_FVOLT.XCF” (rozszerzenie wg dokumentu)
];

// 8 węzłów: wektor (pendrive), 2 stacje, 4 serwery baz danych, serwer główny.
const networkNodes: NetworkNode[] = [
  { id: 'n_vector', label: TODO, kind: 'vector', x: 50, y: 50 }, // TODO(tekst-VR): podpisy węzłów (plan 3.5 ekran 2)
  { id: 'n_ws1', label: TODO, kind: 'workstation', x: 20, y: 22 },
  { id: 'n_ws2', label: TODO, kind: 'workstation', x: 80, y: 22 },
  { id: 'n_db1', label: TODO, kind: 'database', x: 12, y: 60 },
  { id: 'n_db2', label: TODO, kind: 'database', x: 30, y: 82 },
  { id: 'n_db3', label: TODO, kind: 'database', x: 70, y: 82 },
  { id: 'n_db4', label: TODO, kind: 'database', x: 88, y: 60 },
  { id: 'n_main', label: TODO, kind: 'main', x: 50, y: 18 }
];

export const c2Config: C2Config = {
  title: '//MODUŁ_RANSOMWARE',
  subtitle: TODO, // TODO(tekst-VR): podtytuł aplikacji
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  start: {
    status: TODO, // TODO(tekst-VR): „CV ZOSTAŁO OTWARTE – MALWARE ZOSTAŁ AKTYWOWANY”
    hostLabel: TODO, // TODO(tekst-VR): „NAZWA KOMPUTERA:”
    host: 'ENERGY_ROCK_01_PC',
    ipLabel: TODO, // TODO(tekst-VR): „AKTYWOWANE NA IP:”
    ip: '151.89.159.52',
    button: TODO, // TODO(tekst-VR): „SZYFRUJ ZASOBY FIRMY”
    loader: TODO // TODO(tekst-VR): „SKANOWANIE SIECI…”
  },
  encrypt: {
    task: TODO, // TODO(tekst-VR): „KLIKAJ ZIELONE WĘZŁY, ŻEBY JE ZASZYFROWAĆ.”
    nodes: networkNodes,
    doneMessage: TODO, // TODO(tekst-VR): komunikat po zaszyfrowaniu wszystkich węzłów
    nextLabel: TODO // TODO(tekst-VR): „POBIERZ PLIKI”
  },
  exfil: {
    decisionNum: 8,
    question: 'EKSFILTRACJA PLIKÓW',
    // Brak `options`: poziom D8 wylicza minigra z reguł (cele/pozostałe), `answer` z `answers`, feedback z `feedback`.
    task: TODO, // TODO(tekst-VR): „PRZECIĄGNIJ DO POLA PLIKI, PO KTÓRE PRZYSZEDŁEŚ.”
    fieldLabel: TODO, // TODO(tekst-VR): „POBRANE PLIKI:”
    confirmLabel: TODO, // TODO(tekst-VR): „POBIERZ ZAZNACZONE”
    loader: TODO, // TODO(tekst-VR): „POBIERANIE PLIKÓW…”
    requiredTargets: 3,
    files: exfilFiles,
    answers: { ideal: TODO }, // TODO(tekst-VR): „3 PLIKI FREEVOLT (DOCX, PDF, XCF)”
    feedback: {
      ideal: 'Pobrano kompletny zestaw dokumentacji technologii Freevolt (3 pliki) bez pozostawiania śladów w logach.',
      suboptimal: 'Pobrano pliki Freevolt, lecz także zbędne pliki decoy — niepotrzebny transfer zwiększa ryzyko detekcji.', // TODO(tekst-VR): feedback 1:1 (niekompletny zestaw lub nadmiar)
      critical: 'Główny cel zlecenia nie został osiągnięty — brakuje kluczowych plików technologii Freevolt.'
    }
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
      incoming: 'ROZWIĄZUJEMY PROBLEM RANSOMWARE! ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE', // TODO(tekst-VR): bez wykrzyknika (dokument: „…RANSOMWARE I ODPOWIEDNIE SŁUŻBY…”)
      options: [
        {
          id: 'firm_stance',
          label: 'ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ',
          tier: 'ideal',
          feedback: 'Rzeczowy argument techniczny paraliżujący decyzyjność ofiary.', // TODO(tekst-VR): feedback 1:1
          nextNode: 'neg_2'
        },
        {
          id: 'aggression',
          label: 'NIE BOJĘ SIĘ POLICJI',
          tier: 'suboptimal',
          feedback: 'Pusta agresja bez argumentów technicznych.',
          nextNode: 'neg_2'
        },
        {
          id: 'surrender',
          label: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM', // TODO(tekst-VR): z kropką wg dokumentu „OKEJ, JUŻ WAM NIE PRZESZKADZAM.”
          tier: 'critical',
          feedback: 'Kapitulacja i natychmiastowa rezygnacja z pozycji negocjacyjnej.'
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
          feedback: 'Podtrzymanie wiarygodnej przykrywki finansowej.',
          nextNode: 'neg_3'
        },
        {
          id: 'troll',
          label: 'NICZEGO NIE ODSZYFRUJĘ, ROBIĘ TO DLA ZABAWY :D',
          tier: 'suboptimal',
          feedback: 'Utrata wiarygodności profesjonalnego żądania.',
          nextNode: 'neg_3'
        },
        {
          id: 'reveal_motive',
          label: 'CHCĘ DOSTĘPU DO PLIKÓW FREEVOLT',
          tier: 'critical',
          feedback: 'Zdemaskowanie prawdziwego celu operacji zamiast przykrywki finansowej.'
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
          label: 'MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA', // TODO(tekst-VR): „…DO ODSZYFROWANIA” wg dokumentu
          tier: 'ideal',
          feedback: 'Twardy limit czasu uniemożliwia ofierze procedury przywracania danych.'
        }
      ]
    }
  ]
};

export const victimChatConfig: VictimChatConfig = {
  title: '//CZAT_Z_OFIARĄ',
  subtitle: TODO, // TODO(tekst-VR): podtytuł aplikacji (komunikator „SZEF IT ENERGY ROCK”)
  dialogue: negotiationDialogue,
  reportAnswers: {
    firm_stance: TODO, // TODO(tekst-VR): „ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW…” (plan, tabela raportu, wiersz 9)
    btc_demand: TODO // TODO(tekst-VR): „INTERESUJĄ MNIE TYLKO BITCOINY (OKUP WYŁUDZONY: TAK)”
  },
  preview: {
    heading: TODO, // TODO(tekst-VR): nagłówek miniatury okna żądania okupu
    amountLabel: TODO, // TODO(tekst-VR): podpis kwoty
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
        { from: 'byte_master', text: TODO } // TODO(tekst-VR): „TEMAT MAILA POWINIEN ZAWIERAĆ ODPOWIEDNIO NAZWISKO ORAZ IMIĘ Z DOPISKIEM CV” (plan, mostek 2)
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
      conversation: [{ from: 'player', id: 'm4_reply_mail', label: TODO }], // TODO(tekst-VR): „ZAŁĄCZNIK GOTOWY. CZAS ZAMASKOWAĆ ADRES IP PRZED WYSŁANIEM”
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
        // Wysłanie późnym popołudniem, otwarcie CV rano (plan P7); podpis pod zegarem do uzupełnienia.
        { from: 'time_jump', clockFrom: '16:40', clock: '09:10', label: TODO } // TODO(tekst-VR): podpis „DO GODZIN PRACY REKRUTERA…” (plan sekcja 2)
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
    completion: {
      conversation: [
        { from: 'player', id: 'm4_reply_workstation', label: TODO }, // TODO(tekst-VR): „AKTYWOWALI RANSOMWARE I STRACILI DOSTĘP DO PLIKÓW. TERAZ CZEKAMY AŻ SIĘ ZE MNĄ SKONTAKTUJĄ”
        { from: 'byte_master', text: 'PAMIĘTAJ TYLKO, ŻE POTRZEBUJEMY I PLIKÓW, I OKUPU' },
        { from: 'time_jump', clockFrom: '09:10', clock: '11:35', label: TODO } // TODO(tekst-VR): podpis „DO REAKCJI SZEFA IT…”
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
        { from: 'player', id: 'm4_reply_neg_1', label: 'MAM TWOJE PLIKI, UDAŁO SIĘ BEZ WIĘKSZYCH PROBLEMÓW' },
        { from: 'byte_master', text: 'TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO' },
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
