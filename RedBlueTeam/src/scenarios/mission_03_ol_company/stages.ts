// Etapy i dane klocków Misji 3 (O&L Company) — wzorzec B (szkielet migracji).
// Treść (teksty, poziomy, feedback) mieszka tutaj, nie w kodzie minigry.
// Mostki (conversation) odtworzone 1:1 z tekstów starego przebiegu w
// useMissionStore (chatStage / chooseChatOption). Zob. docs/migration-spec.md.

import type { StageDefinition } from '../../engine/types/mission';
import mission3Data from './data/mission3.json';
import type {
  VirusLabConfig,
  OsintBrowserConfig,
  PendriveConfig,
  DroneConfig,
  RatSessionConfig
} from './minigames/types';

// ---------------------------------------------------------------------------
// DANE KLOCKÓW / MINIGIER (kluczowane identyfikatorem kafelka pulpitu)
// ---------------------------------------------------------------------------

/** Kwestia mentora z mostka etapu 1 — ta sama trafia do czatu i do notatki w //TOR (prawy monitor). */
const BRIDGE_BROWSER_LINE = 'ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD';

/** Kwestia mentora z intro (data/mission3.json), cytowana w notatce na prawym monitorze. */
const introLine = (id: string): string => {
  const line = mission3Data.intro.dialogue.find((d) => d.id === id);
  if (!line) throw new Error(`Brak kwestii intro: ${id}`);
  return line.text;
};

/** Etap 1: D1 wybór wirusa + builder RAT (flavor bez oceny). */
export const virusLabConfig: VirusLabConfig = {
  virus: {
    decisionNum: 1,
    question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
    options: [
      {
        id: 'rat',
        label: 'RAT: REMOTE ACCESS TROJAN',
        desc: 'POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY',
        tier: 'ideal',
        feedback: 'RAT umożliwia pełny, cichy dostęp do stacji roboczej pracownika i zdalny podgląd pulpitu.'
      },
      {
        id: 'keylogger',
        label: 'KEYLOGGER',
        desc: 'POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
        tier: 'suboptimal',
        feedback: 'Opcja częściowa – rejestruje klawisze, ale nie daje dostępu do pulpitu.'
      },
      {
        id: 'ransomware',
        label: 'RANSOMWARE',
        desc: 'MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ',
        tier: 'critical',
        feedback: 'Zaalarmuje firmę natychmiast, a celem jest cicha kradzież danych.'
      }
    ]
  },
  builder: {
    title: 'TERMINALOWY BUILDER ŁADUNKU RAT',
    subtitle: 'Parametry kompilacji modułu infiltracyjnego (x64/Windows 11):',
    modules: {
      title: 'Moduł działania:',
      options: [
        {
          id: 'reverse_tcp',
          label: 'Reverse TCP Shell & Remote Desktop View',
          desc: 'Kanał zwrotny TCP łączący stację roboczą ofiary z portem nasłuchującym hakera.',
          correct: true,
          feedback: 'Optymalny kanał zwrotny omijający restrykcje zapory sieciowej.'
        },
        {
          id: 'port_scan',
          label: 'Port Scanning & Network Flooder',
          desc: 'Moduł skanowania portów sieciowych i generowania masowych pakietów SYN-flood.',
          correct: false,
          feedback: 'Agresywny ruch skanera portów zostanie natychmiast wykryty przez system IDS/IPS!'
        }
      ]
    },
    masking: {
      title: 'Metoda maskowania procesu:',
      options: [
        {
          id: 'bg_service',
          label: 'Ukryty proces w tle (Background Service + Auto-start)',
          desc: 'Ukryty proces usługi systemowej startujący w tle automatycznie przy logowaniu.',
          correct: true,
          feedback: 'Cichy serwis nie budzi podejrzeń użytkownika ani antywirusa.'
        },
        {
          id: 'uac_force',
          label: 'Wymuszenie okna UAC z uprawnieniami Administratora',
          desc: 'Wymuszenie systemowego okna UAC z żądaniem podwyższonych uprawnień Administratora.',
          correct: false,
          feedback: 'Monit UAC wywoła natychmiastowy alarm pracownika i reakcję administratora!'
        }
      ]
    },
    package: {
      title: 'Pakiet wyjściowy:',
      options: [
        {
          id: 'dll_archive',
          label: 'Moduł binarny .dll podpięty pod archiwum',
          desc: 'Moduł biblioteki dynamicznej .dll spakowany w archiwum z plikami przynęty.',
          correct: true,
          feedback: 'Biblioteka DLL spakowana w archiwum ZIP omija proste skanery antywirusowe.'
        },
        {
          id: 'raw_bat',
          label: 'Surowy plik .bat z komendami PowerShell',
          desc: 'Skrypt wsadowy .bat uruchamiający polecenia PowerShell ze statycznym payloadem.',
          correct: false,
          feedback: 'Skrypt .bat zostanie natychmiast zablokowany przez mechanizmy Windows Defender AMSI!'
        }
      ]
    },
    successMessage: 'WIRUS GOTOWY! PAKIET RAT SKOMPILOWANY POMYŚLNIE.'
  }
};

/** Etap 2: D2 wybór celu (małe rozgałęzienie) + D3 wektor socjotechniczny. */
export const osintBrowserConfig: OsintBrowserConfig = {
  site: {
    url: 'https://olcompany.cloud',
    title: 'O&L COMPANY',
    heroHeadline: 'JESTEŚMY JEDNYM Z NAJWIĘKSZYCH DYSTRYBUTORÓW PALIW',
    heroSubheadline: 'OBSŁUGUJEMY MIĘDZYNARODOWĄ SIEĆ STACJI PALIWOWYCH ORAZ ZAOPATRUJEMY NAJWIĘKSZE KORPORACJE',
    contact: {
      phone: '+48 871 787-83-76',
      email: 'sales@olcompany.cloud'
    },
    employees: [
      {
        id: 'jan_lukasiewicz',
        name: 'JAN ŁUKASIEWICZ',
        role: 'CEO',
        avatarBg: '#3b82f6',
        bio: 'Założyciel i prezes O&L Company. Nadzoruje kluczowe kontrakty paliwowe oraz rygorystyczne procedury bezpieczeństwa korporacji.',
        optionId: 'choose_ceo'
      },
      {
        id: 'slawomir_bialek',
        name: 'SŁAWOMIR BIAŁEK',
        role: 'SZEF DZIAŁU CYBERBEZPIECZEŃSTWA',
        avatarBg: '#ef4444',
        bio: 'CISO z 15-letnim stażem. Certyfikowany audytor ISO 27001 i architekt SOC. Natychmiast wykrywa i neutralizuje wszelkie anomalie sieciowe.',
        optionId: 'choose_ciso'
      },
      {
        id: 'wiktoria_galecka',
        name: 'WIKTORIA GAŁECKA',
        role: 'SPECJALISTKA DS. LOGISTYKI',
        avatarBg: '#0284c7',
        bio: 'Koordynuje transport cystern kolejowych i rurociągów. Korzysta wyłącznie z dedykowanego, odizolowanego systemu ERP.',
        optionId: 'choose_logistics'
      },
      {
        id: 'agnieszka_leman',
        name: 'AGNIESZKA LEMAN',
        role: 'SZEFOWA DZIAŁU SPRZEDAŻY',
        avatarBg: '#8b5cf6',
        bio: 'Liderka działu handlowego. Skupiona na relacjach B2B, ostrożna wobec niezweryfikowanych kontaktów zewnętrznych.'
      },
      {
        id: 'mateusz_klimowicz',
        name: 'MATEUSZ KLIMOWICZ',
        role: 'JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA',
        avatarBg: '#f59e0b',
        bio: 'Zatrudniony 2 tygodnie temu po udanym procesie rekrutacji. Nowy w branży, nie przeszedł jeszcze pełnego szkolenia z procedur anty-phishingowych.',
        optionId: 'choose_mateusz'
      }
    ],
    news: [
      {
        id: 'party_sales',
        title: 'IMPREZA INTEGRACYJNA!',
        date: '17 WRZEŚNIA 2022',
        boxText: '15 WRZEŚNIA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU SPRZEDAŻY!',
        content: 'POWITALIŚMY NA POKŁADZIE NOWYCH PRACOWNIKÓW ORAZ ŚWIĘTOWALIŚMY OSTATNIE SUKCESY!',
        hashtags: '#OL #BESTCOMPANY #COMPANYUNHACKED',
        galleryText: 'ZAPRASZAMY DO OGLĄDANIA PONIŻSZEJ GALERII ZDJĘĆ!'
      },
      {
        id: 'meeting_logistics',
        title: 'SPOTKANIE!',
        date: '5 LISTOPADA 2020',
        boxText: '4 LISTOPADA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU LOGISTYKI',
        content: 'PRACOWNICY MIELI OKAZJĘ SPRÓBOWAĆ SWOICH SIŁ W CODZIENNYCH ZADANIACH NASZEGO NAJLEPSZEGO DZIAŁU LOGISTYKI!',
        hashtags: '#OL #BESTCOMPANY #COMPANYUNHACKED',
        galleryText: 'FOTORELACJA Z WYDARZENIA FIRMOWEGO'
      }
    ]
  },
  mentorNote: {
    target: [introLine('intro_3'), BRIDGE_BROWSER_LINE],
    vector: [introLine('intro_4')]
  },
  target: {
    decisionNum: 2,
    question: 'KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?',
    options: [
      {
        id: 'choose_ceo',
        label: 'JAN ŁUKASIEWICZ (CEO)',
        desc: 'Założyciel i prezes O&L Company.',
        tier: 'suboptimal',
        feedback:
          'Jan Łukasiewicz to CEO – jego poczta przechodzi przez asystentów i restrykcyjne filtry. Taki atak zostanie spalony szybko.'
      },
      {
        id: 'choose_logistics',
        label: 'WIKTORIA GAŁECKA (LOGISTYKA)',
        desc: 'Specjalistka ds. logistyki.',
        tier: 'suboptimal',
        feedback:
          'Dział logistyki pracuje w odizolowanym ERP i nie ma dostępu do dokumentacji infrastruktury FREEVOLT.'
      },
      {
        id: 'choose_mateusz',
        label: 'MATEUSZ KLIMOWICZ (JUNIOR WSPARCIA)',
        desc: 'Junior specjalista ds. wsparcia klienta.',
        tier: 'ideal',
        feedback: 'Junior nie przeszedł jeszcze pełnego szkolenia anty-phishingowego – idealny wektor wejścia.'
      },
      {
        id: 'choose_ciso',
        label: 'SŁAWOMIR BIAŁEK (CISO)',
        desc: 'Szef działu cyberbezpieczeństwa (CISO).',
        tier: 'critical',
        feedback:
          'Szef SOC z 15-letnim stażem natychmiast zauważy anomalię, odetnie sieć i zabezpieczy logi.'
      }
    ]
  },
  vector: {
    decisionNum: 3,
    question: 'JAK GO OSZUKASZ (WEKTOR SOCJOTECHNICZNY)?',
    options: [
      {
        id: 'vector_party_zip',
        label: 'PENDRIVE ZE ZDJĘCIAMI Z IMPREZY (WIRUS W ARCHIWUM ZIP)',
        desc: 'Fizyczny nośnik ze zdjęciami z wydarzenia firmowego. Ładunek w archiwum ZIP.',
        tier: 'ideal',
        feedback: 'Dzięki archiwum antywirus nie znajdzie zagrożenia, a kontekst imprezy usypia czujność ofiary.'
      },
      {
        id: 'vector_fake_invoice',
        label: 'FAŁSZYWA FAKTURA VAT W PLIKU .EXE',
        desc: 'Plik wykonywalny w załączniku wiadomości e-mail.',
        tier: 'critical',
        feedback: 'Plik .exe zostanie natychmiast zablokowany przez Windows Defendera i bramkę pocztową.'
      }
    ]
  }
};

/** Etap 3: D4 załącznik + flavor (podpięcie RAT) + D5 wolumin + D6 koperta. */
export const pendriveConfig: PendriveConfig = {
  attachments: {
    decisionNum: 4,
    question: "JAKI PLIK WGRASZ NA PENDRIVE'A?",
    options: [
      {
        id: 'party_photos',
        label: 'IMG_00034521.JPG X3 (ZDJĘCIA Z IMPREZY)',
        tier: 'ideal',
        feedback: 'Paczka zdjęć z imprezy doskonale pasuje do profilu ofiary i usypia jej czujność.'
      },
      {
        id: 'hr_docs',
        label: 'DOKUMENTY_HR.DOCX',
        tier: 'suboptimal',
        feedback: 'Dokumenty kadrowe wzbudzają pewne podejrzenia, lecz pracownik może je otworzyć.'
      },
      {
        id: 'termination',
        label: 'WYPOWIEDZENIE_UMOWY_O_PRACE.PDF',
        tier: 'critical',
        feedback: 'Pismo o zwolnieniu wywołuje natychmiastową panikę i telefon do kadr/przełożonego!'
      }
    ]
  },
  bindPrompt: 'Wirus RAT musi zostać ukryty w archiwum ZIP razem z plikami przynęty, aby ominąć skanery.',
  volume: {
    decisionNum: 5,
    question: "WYBIERZ NAZWĘ PENDRIVE'A:",
    options: [
      { id: 'vol_keylogger', label: 'KEYLOGGER', tier: 'critical', feedback: "Nazwa 'KEYLOGGER' to natychmiastowa kompromitacja nośnika." },
      { id: 'vol_bbd', label: 'ZDJĘCIA B&D COMPANY', tier: 'suboptimal', feedback: 'Podejrzana nazwa pendrive’a może zaalarmować użytkownika lub analityka.' },
      { id: 'vol_impreza', label: 'IMPREZA', tier: 'ideal', feedback: 'Naturalna, wiarygodna etykieta woluminu spójna z przygotowaną przynętą.' },
      { id: 'vol_new_disk', label: 'NOWY DYSK', tier: 'suboptimal', feedback: 'Zbyt ogólna nazwa nie wzmacnia przynęty i może budzić obojętność.' }
    ]
  },
  envelope: {
    decisionNum: 6,
    question: 'WYBIERZ PODPIS NA KOPERCIE:',
    options: [
      { id: 'env_afterparty', label: 'ZDJĘCIA Z AFTERPARTY O&L COMPANY!', tier: 'ideal', feedback: 'Dedykowana etykieta fizyczna maksymalizuje szansę podłączenia nośnika przez pracownika.' },
      { id: 'env_bbd', label: 'PENDRIVE ZE ZDJĘCIAMI B&D COMPANY', tier: 'suboptimal', feedback: 'Zbyt oczywisty lub obcy podpis budzi podejrzenia.' },
      { id: 'env_lost_docs', label: 'ZGUBIONE DOKUMENTY', tier: 'suboptimal', feedback: 'Neutralny podpis nie wzmacnia przynęty i może zostać zignorowany.' },
      { id: 'env_termination', label: 'WYPOWIEDZENIE UMOWY', tier: 'critical', feedback: 'Napis o zwolnieniu z pracy wzbudził czujność ochrony i personelu.' }
    ]
  },
  successMessage: "PENDRIVE GOTOWY. WYSUNIĘTO PAMIĘĆ USB."
};

/** Etap 4: D7 adres domu ofiary + D8 pojazd ofiary. */
export const droneConfig: DroneConfig = {
  droneStats: {
    model: '//DRON: CONDOR MIT63',
    video: 'STAŁE PRZEKAZYWANIE WIDEO',
    speed: 'MAKSYMALNA PRĘDKOŚĆ 25 KM/H',
    connection: 'POŁĄCZONY Z ODBIORNIKIEM HAKERA'
  },
  address: {
    decisionNum: 7,
    question: 'WSKAŻ DRONOWI ADRES DOMU OFIARY:',
    options: [
      { id: 'loc_1', label: 'OŁBIŃSKA 51B', desc: 'NADODRZE', tier: 'critical', feedback: 'Błędne współrzędne – dron wylądował pod niewłaściwym adresem!' },
      { id: 'loc_2', label: 'DRZYMAŁY 38D', desc: 'PILCZYCE', tier: 'critical', feedback: 'Błędne współrzędne – dron wylądował pod niewłaściwym adresem!' },
      { id: 'loc_3', label: 'WYSTAWOWA 23A', desc: 'ZALESIE', tier: 'critical', feedback: 'Błędne współrzędne – dron wylądował pod niewłaściwym adresem!' },
      { id: 'loc_4', label: 'OŁTASZYŃSKA 92C', desc: 'PARTYNICE', tier: 'ideal', feedback: 'Właściwa lokalizacja uzyskana podczas fazy rekonesansu adresu Mateusza.' }
    ]
  },
  car: {
    decisionNum: 8,
    question: 'WYBIERZ MIEJSCE NA PARKINGU (POJAZD OFIARY):',
    options: [
      { id: 'car_1', label: 'Granatowy Sedan', tier: 'critical', feedback: 'Błędny pojazd – koperta trafiła na samochód osoby postronnej!' },
      { id: 'car_2', label: 'Szary SUV', tier: 'critical', feedback: 'Błędny pojazd – koperta trafiła na samochód osoby postronnej!' },
      { id: 'car_3', label: 'Zielony Kombi', tier: 'critical', feedback: 'Błędny pojazd – koperta trafiła na samochód osoby postronnej!' },
      { id: 'car_4', label: 'Biały samochód z czerwonym dachem', tier: 'ideal', feedback: 'Precyzyjna identyfikacja pojazdu na podstawie zdjęcia przesłanego przez Byte_Mastera.' },
      { id: 'car_5', label: 'Czerwony Hatchback z czarnym dachem', tier: 'critical', feedback: 'Błędny pojazd – koperta trafiła na samochód osoby postronnej!' },
      { id: 'car_6', label: 'Biały Sedan z białym dachem', tier: 'critical', feedback: 'Błędny pojazd – koperta trafiła na samochód osoby postronnej!' }
    ]
  },
  mapLocations: [
    { id: 'loc_1', number: 1, address: 'OŁBIŃSKA 51B', district: 'NADODRZE', x: 60, y: 16 },
    { id: 'loc_2', number: 2, address: 'DRZYMAŁY 38D', district: 'PILCZYCE', x: 18, y: 24 },
    { id: 'loc_3', number: 3, address: 'WYSTAWOWA 23A', district: 'ZALESIE', x: 82, y: 55 },
    { id: 'loc_4', number: 4, address: 'OŁTASZYŃSKA 92C', district: 'PARTYNICE', x: 28, y: 78 }
  ],
  parkingCars: [
    { id: 1, desc: 'Granatowy Sedan', body: '#1e3a8a', roof: '#1e3a8a', isTarget: false },
    { id: 2, desc: 'Szary SUV', body: '#475569', roof: '#475569', isTarget: false },
    { id: 3, desc: 'Zielony Kombi', body: '#15803d', roof: '#15803d', isTarget: false },
    { id: 4, desc: 'Biały samochód z czerwonym dachem', body: '#f8fafc', roof: '#dc2626', isTarget: true },
    { id: 5, desc: 'Czerwony Hatchback z czarnym dachem', body: '#dc2626', roof: '#0f172a', isTarget: false },
    { id: 6, desc: 'Biały Sedan z białym dachem', body: '#f8fafc', roof: '#f8fafc', isTarget: false }
  ],
  successDrop: "POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'EM. DRON WRACA DO POKOJU HAKERA."
};

/** Etap 5: sesja RAT (finał bez oceny). */
export const ratSessionConfig: RatSessionConfig = {
  host: { name: 'MATEUSZ_BIURO_O&L', ip: '161.185.160.93' },
  takeoverLabel: '[PRZEJMIJ PULPIT OFIARY]',
  networkLabel: '[PRZEJMIJ SIEĆ FREEVOLT]'
};

/** Dane klocków M3, kluczowane identyfikatorem kafelka pulpitu. */
export const mission3Blocks: Record<string, unknown> = {
  virus_database: virusLabConfig,
  browser: osintBrowserConfig,
  pendrive_app: pendriveConfig,
  drone_app: droneConfig,
  rat_session: ratSessionConfig
};

// ---------------------------------------------------------------------------
// ETAPY MISJI — przebieg przez completeStage (wzorzec B).
// Kolejność Kill Chain: uzbrojenie -> rekonesans/cel -> nośnik -> dostarczenie -> egzekucja.
// ---------------------------------------------------------------------------

export const mission3Stages: StageDefinition[] = [
  {
    id: 'virus_database',
    appId: 'virus_database',
    decisions: [1],
    completion: {
      conversation: [
        { from: 'player', id: 'm3_reply_virus', label: 'GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?' },
        { from: 'byte_master', text: BRIDGE_BROWSER_LINE }
      ],
      unlockIcons: ['browser_unlocked', 'browser'],
      badges: { browser: 1, chat: 1 },
      highlightTile: 'browser',
      sound: 'notification'
    }
  },
  {
    id: 'browser',
    appId: 'browser',
    decisions: [2, 3],
    completion: {
      conversation: [
        { from: 'byte_master', text: 'DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE. WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ.' },
        { from: 'player', id: 'm3_reply_vector', label: 'ODBIERAM PLIKI. PRZYGOTUJĘ NOŚNIK.' }
      ],
      unlockIcons: ['pendrive_unlocked', 'pendrive_app'],
      badges: { pendrive_app: 1, chat: 1 },
      highlightTile: 'pendrive_app',
      sound: 'notification'
    }
  },
  {
    id: 'pendrive_app',
    appId: 'pendrive_app',
    decisions: [4, 5, 6],
    completion: {
      conversation: [
        { from: 'player', id: 'm3_reply_pendrive', label: 'GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?' },
        { from: 'byte_master', text: 'JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-234 WROCŁAW. DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA.' },
        { from: 'player', id: 'm3_reply_drone_wait', label: 'JASNE. SŁYSZYMY SIĘ ZA KILKA GODZIN.' },
        { from: 'time_jump', label: '06:02 — MIJA KILKA GODZIN…', sublabel: 'DRON GOTOWY DO PORANNEGO LOTU.' },
        { from: 'byte_master', text: 'JUŻ CZAS. WSKAŻ DOM MATEUSZA NA MAPIE. GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM.' }
      ],
      unlockIcons: ['drone_unlocked', 'drone_app'],
      badges: { drone_app: 1, chat: 1 },
      highlightTile: 'drone_app',
      sound: 'notification'
    }
  },
  {
    id: 'drone_app',
    appId: 'drone_app',
    decisions: [7, 8],
    completion: {
      conversation: [
        { from: 'player', id: 'm3_reply_drop', label: 'KOPERTA NA SAMOCHODZIE OFIARY. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA.' },
        { from: 'time_jump', label: '08:12 — MIJA KILKA GODZIN…', sublabel: 'CZEKAMY, AŻ MATEUSZ PODŁĄCZY PENDRIVE W BIURZE.' },
        { from: 'byte_master', text: 'MALWARE AKTYWNY — MATEUSZ PODŁĄCZYŁ PENDRIVE NA SWOJEJ STACJI. WEJDŹ NA JEGO KOMPUTER.' }
      ],
      unlockIcons: ['rat_session_unlocked', 'rat_session'],
      badges: { rat_session: 1, chat: 1 },
      highlightTile: 'rat_session',
      incomingCall: { appId: 'rat_session', label: 'MALWARE AKTYWNY — STACJA MATEUSZA' },
      sound: 'alarm'
    }
  },
  {
    id: 'rat_session',
    appId: 'rat_session',
    decisions: [],
    completion: {
      conversation: [
        { from: 'player', id: 'm3_reply_rat', label: 'MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?' },
        { from: 'byte_master', text: 'WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI. JESTEŚMY W KONTAKCIE!' }
      ],
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success'
    }
  }
];
