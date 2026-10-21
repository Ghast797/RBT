// Etapy i dane klocków Misji 1 (PetroLog) — wzorzec B.
// Treść (teksty, poziomy, feedback) mieszka tutaj, nie w kodzie minigry.
// Zob. docs/scenario-engine.md, sekcje 1, 5–6 oraz docs/scenario-format.md.

import type { StageDefinition } from '../../engine/types/mission';
import type {
  TargetPetrologConfig,
  OsintSearchConfig,
  SocialIntelConfig,
  PhishingBuilderConfig,
  VictimMonitorConfig
} from './minigames/types';

// ---------------------------------------------------------------------------
// DANE KLOCKÓW / MINIGIER
// ---------------------------------------------------------------------------

/** S01: Odprawa wywiadowcza – PetroLog. */
export const targetPetrologConfig: TargetPetrologConfig = {
  companyName: 'PetroLog',
  targetObjective: 'ODPRAWA WYWIADOWCZA I PROFILOWANIE FIRMY',
  slides: [
    {
      id: 'slide_1',
      badge: 'CEL OPERACJI',
      title: 'ZADANIE 1: MUSISZ ZHAKOWAĆ FIRMĘ LOGISTYCZNĄ PETROLOG',
      content:
        'Cel ataku: PetroLog – przedsiębiorstwo logistyczne dysponujące danymi o łańcuchu dostaw technologii Freevolt.',
      bullets: [
        'Poznaj strukturę organizacyjną przedsiębiorstwa i kluczowy personel',
        'Znajdź wektor wejścia poprzez nieświadomego pracownika podatnego na socjotechnikę',
        'Pozyskaj dane logistyczne i wykaz podmiotów przechowujących specyfikację Freevolt'
      ],
      buttonLabel: 'START ZADANIA'
    },
    {
      id: 'slide_2',
      badge: 'WSKAZÓWKA WYWIADOWCZA 1/3',
      title: 'CO WIEMY O FIRMIE PETROLOG?',
      content: '1. POSIADA INFORMACJE O FREEVOLT',
      bullets: [
        'PetroLog odpowiada za newralgiczne łańcuchy dostaw komponentów prototypu Freevolt',
        'Wewnętrzne bazy danych zawierają pełną listę dostawców i magazynów'
      ],
      buttonLabel: 'NASTĘPNA WSKAZÓWKA'
    },
    {
      id: 'slide_3',
      badge: 'WSKAZÓWKA WYWIADOWCZA 2/3',
      title: 'STRUKTURA PERSONELU',
      content: '2. W FIRMIE PRACUJE 150 OSÓB',
      bullets: [
        'Duża liczba zatrudnionych ułatwia ukrycie ataku spear-phishingowego',
        'Różne poziomy świadomości cyberzagrożeń w poszczególnych działach'
      ],
      buttonLabel: 'NASTĘPNA WSKAZÓWKA'
    },
    {
      id: 'slide_4',
      badge: 'WSKAZÓWKA WYWIADOWCZA 3/3',
      title: 'AKTYWNOŚĆ W SIECI',
      content: '3. PRACOWNICY SĄ BARDZO AKTYWNI NA SOCIAL MEDIACH',
      bullets: [
        'Personel publikuje publiczne relacje z pracy, wydarzeń biurowych oraz życia prywatnego',
        'Biały wywiad (OSINT) pozwoli bez przeszkód stworzyć profil psychologiczny pracownika'
      ],
      buttonLabel: 'URUCHOM WYSZUKIWARKĘ'
    }
  ]
};

/** S02: Wyszukiwarka OSINT i selekcja celu. */
export const osintSearchConfig: OsintSearchConfig = {
  suggestedQuery: 'PETROLOG PRACOWNICY',
  searchPlaceholder: 'WPROWADŹ FRAZĘ: PETROLOG PRACOWNICY',
  profiles: [
    {
      id: 'marcelina_sojka',
      name: 'MARCELINA SOJKA',
      role: 'Specjalista ds. Sprzedaży',
      department: 'Dział Sprzedaży',
      avatarText: 'MS',
      isPublic: false,
      privacyNotice:
        "ERROR: MARCELINA SOJKA USTAWIŁA WSZYSTKIE SWOJE SOCIAL MEDIA NA 'PRYWATNE'. NIE MAMY JAK ZDOBYĆ O NIEJ INFORMACJI.",
      tags: ['SPRZEDAŻ', 'LOGISTYKA', 'B2B', 'PROFIL PRYWATNY']
    },
    {
      id: 'anita_klimek',
      name: 'ANITA KLIMEK',
      role: 'Specjalista ds. Rozliczeń',
      department: 'Dział Księgowy',
      avatarText: 'AK',
      isPublic: true,
      tags: ['KSIĘGOWOŚĆ', 'FAKTURY', 'BIEGANIE', 'PROFIL PUBLICZNY']
    }
  ]
};

/** S03: Eksploracja mediów społecznościowych i profilowanie (OSINT). */
export const socialIntelConfig: SocialIntelConfig = {
  target: {
    name: 'Anita Klimek',
    role: 'Specjalista ds. Księgowości',
    company: 'PetroLog',
    requiredFacts: 8
  },
  platforms: [
    {
      id: 'kneenook',
      name: 'Kneenook',
      handlePrefix: '@anita_klimek',
      accentColor: '#3b82f6',
      tagline: 'Platforma społecznościowa'
    },
    {
      id: 'quickgram',
      name: 'Quickgram',
      handlePrefix: '@anita_k',
      accentColor: '#ec4899',
      tagline: 'Fotorelacje i chwile'
    },
    {
      id: 'joinin',
      name: 'Joinin',
      handlePrefix: 'anita-klimek',
      accentColor: '#06b6d4',
      tagline: 'Sieć kontaktów zawodowych'
    }
  ],
  posts: [
    // Kneenook (4 wpisy, 3 fakty, 1 zmyłka)
    {
      id: 'kn_1',
      platform: 'kneenook',
      author: 'Anita Klimek',
      handle: '@anita_klimek',
      timestamp: '3 dni temu',
      content:
        'Od 5 lat pracuję w firmie PetroLog. Po prostu uwielbiam tę pracę. Wspaniali współpracownicy, odpowiedni zakres obowiązków i ciągły rozwój. Zdecydowanie polecam!',
      tags: ['#PetroLog', '#Work', '#Team'],
      fact: {
        id: 'f1',
        text: 'PRACUJE W FIRMIE PETROLOG',
        category: 'ZAWODOWE'
      }
    },
    {
      id: 'kn_2',
      platform: 'kneenook',
      author: 'Anita Klimek',
      handle: '@anita_klimek',
      timestamp: 'Tydzień temu',
      content:
        'Wspólna zabawa z moimi dziećmi ❤️ Jednak czasem weekend z rodziną to wyzwanie! 📷 fotograf: @j_kwiatkowski',
      tags: ['#Rodzina', '#Weekend'],
      fact: {
        id: 'f2',
        text: 'JEST MATKĄ DWÓJKI DZIECI',
        category: 'RODZINA'
      }
    },
    {
      id: 'kn_3',
      platform: 'kneenook',
      author: 'Anita Klimek',
      handle: '@anita_klimek',
      timestamp: '2 tygodnie temu',
      content:
        'Bieganie na plaży? Czemu nie? 🏃 Biegam praktycznie wszędzie, nawet na wakacjach - kocham ten sport! 👟',
      tags: ['#Running', '#Sport', '#Plaża'],
      fact: {
        id: 'f3',
        text: 'UWIELBIA BIEGAĆ',
        category: 'PASJA'
      }
    },
    {
      id: 'kn_4',
      platform: 'kneenook',
      author: 'Anita Klimek',
      handle: '@anita_klimek',
      timestamp: 'Miesiąc temu',
      content: 'W końcu remont po 6 latach! Potrzebowałam tego, a tym bardziej moi chłopcy!',
      tags: ['#Remont', '#Dom'],
      distractorNotice:
        'BRAK PRZYDATNYCH INFORMACJI (Wpis o remoncie pokoju nie dostarcza konkretnego wektora do spear-phishingu)'
    },

    // Quickgram (4 wpisy, 3 fakty, 1 zmyłka)
    {
      id: 'qg_1',
      platform: 'quickgram',
      author: 'Anita Klimek',
      handle: '@anita_k',
      timestamp: 'Wczoraj',
      content:
        'Kawa i ciasteczka! ☕️ Poniedziałki potrafią być ciężkie, ale w tym zestawie zawsze dam radę! #work #coffee #magia',
      tags: ['#Coffee', '#WorkLife'],
      distractorNotice:
        'BRAK PRZYDATNYCH INFORMACJI (Typowy post lifestylowy o kawie – brak precyzyjnego motywu socjotechnicznego)'
    },
    {
      id: 'qg_2',
      platform: 'quickgram',
      author: 'Anita Klimek',
      handle: '@anita_k',
      timestamp: 'Sobota',
      content: 'Sobota - no to ciasto! 🍰 #bake #wypieki #rodzinnie',
      tags: ['#Bake', '#Wypieki', '#Rodzinnie'],
      fact: {
        id: 'f4',
        text: 'LUBI PIEC CIASTA',
        category: 'HOBBY'
      }
    },
    {
      id: 'qg_3',
      platform: 'quickgram',
      author: 'Anita Klimek',
      handle: '@anita_k',
      timestamp: '3 dni temu',
      content:
        'Uwielbiamy razem biegać, ostatnio dosłownie KAŻDY wieczór to porządny trening! 🏃‍♀️🏃‍♂️ @j_kwiatkowski',
      tags: ['#EveningRun', '#Trening', '#Partners'],
      fact: {
        id: 'f5',
        text: 'CODZIENNIE WIECZOREM BIEGA Z KUBĄ KWIATKOWSKIM',
        category: 'RELACJE'
      }
    },
    {
      id: 'qg_4',
      platform: 'quickgram',
      author: 'Anita Klimek',
      handle: '@anita_k',
      timestamp: '5 dni temu',
      content:
        'Nienawidzę sprintów! 🏃‍♀️ Tylko biegi długodystansowe! Muzyka, odpowiednie tempo i mogę biec godzinami! #running #workout',
      tags: ['#LongRun', '#Running', '#Workout'],
      fact: {
        id: 'f6',
        text: 'BIEGA DŁUGODYSTANSOWO',
        category: 'PASJA'
      }
    },

    // Joinin (3 wpisy, 2 fakty, 1 zmyłka)
    {
      id: 'ji_1',
      platform: 'joinin',
      author: 'Anita Klimek',
      handle: 'anita-klimek',
      timestamp: '3 dni temu',
      content:
        'Kolejny sukces w pracy! Jaki jest mój sekret? Codzienna dawka sportu! To właśnie dlatego mam tyle energii!',
      tags: ['#Sukces', '#Energia'],
      distractorNotice:
        'BRAK PRZYDATNYCH INFORMACJI (Ogólna wypowiedź motywacyjna bez szczegółów ułatwiających podszycie)'
    },
    {
      id: 'ji_2',
      platform: 'joinin',
      author: 'Anita Klimek',
      handle: 'anita-klimek',
      timestamp: 'Tydzień temu',
      content:
        'Najlepsi współpracownicy! Razem z Kubą Kwiatkowskim rozliczamy każdą fakturę w #Petrolog! Życzę każdemu takiej ekipy w pracy!',
      tags: ['#Petrolog', '#Finanse', '#Teamwork'],
      fact: {
        id: 'f7',
        text: 'PRACUJE Z KUBĄ KWIATKOWSKIM',
        category: 'ZAWODOWE'
      }
    },
    {
      id: 'ji_3',
      platform: 'joinin',
      author: 'Anita Klimek',
      handle: 'anita-klimek',
      timestamp: '2 tygodnie temu',
      content:
        'Dzisiaj oderwanie od tematów zawodowych. Wiecie może jak poprawić swoje wyniki w biegach długodystansowych? Jakieś konkretne rady?',
      tags: ['#Pytanie', '#Bieganie', '#TreningDługodystansowy'],
      fact: {
        id: 'f8',
        text: 'SZUKA RAD NA TEMAT BIEGANIA DŁUGODYSTANSOWEGO',
        category: 'POTRZEBA'
      }
    }
  ]
};

/** S04: Przygotowanie kampanii spear-phishingowej (D1–D4 + Flavor). */
export const phishingBuilderConfig: PhishingBuilderConfig = {
  domain: {
    decisionNum: 1,
    question: 'OSZUKAĆ OFIARĘ – WYBIERZ ADRES STRONY, KTÓRY MOŻE JĄ ZAINTERESOWAĆ',
    subtitle: 'Decyzja D1: Rejestracja domeny pod kątem profilu psychologicznego ofiary',
    options: [
      {
        id: 'dalekbieg_info',
        label: 'DALEKBIEG.INFO',
        desc: 'Portal dedykowany pasjonatom biegów długodystansowych z poradami i planami treningowymi.',
        tags: ['SPORT', 'BIEGI', 'PORADY'],
        tier: 'ideal',
        feedback:
          'Bezpośrednie odwołanie do pasji do biegów długodystansowych i poszukiwania porad przez ofiarę.'
      },
      {
        id: 'mufina_org_pl',
        label: 'MUFINA.ORG.PL',
        desc: 'Serwis kulinarny z domowymi przepisami na wypieki i ciasta owocowe.',
        tags: ['KUCHNIA', 'WYPIEKI', 'BLOG'],
        tier: 'suboptimal',
        feedback:
          'Nawiązuje do pieczenia ciast, ale nie łączy się z aktywnymi zapytaniami z sieci zawodowej; domena org.pl nie budzi zaufania jako serwis kulinarny.'
      },
      {
        id: 'medikarz_iq',
        label: 'MEDIKARZ.IQ',
        desc: 'Portal telemedycyny i komercyjnych porad lekarskich online.',
        tags: ['MEDYCYNA', 'ZDROWIE', 'SPAM'],
        tier: 'critical',
        feedback:
          'Tematyka medyczna jest całkowicie oderwana od zainteresowań ofiary i wzbudzi natychmiastową nieufność.'
      }
    ]
  },
  payload: {
    decisionNum: 2,
    question: 'OSZUKAĆ OFIARĘ – WYBIERZ PLIK, KTÓRY OFIARA BĘDZIE MOGŁA POBRAĆ ZE STRONY. NIECH BĘDZIE ZACHĘCAJĄCY.',
    subtitle: 'Decyzja D2: Wybór pliku-przynęty (payload)',
    options: [
      {
        id: 'guide_running',
        label: 'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK',
        desc: 'Plik PDF zawierający merytoryczne wskazówki treningowe odpowiadające na zapytanie ofiary.',
        tags: ['PDF', 'EBOOK', 'TRENING'],
        tier: 'ideal',
        feedback: 'Precyzyjna odpowiedź na publiczne zapytanie Anity z portalu Joinin.'
      },
      {
        id: 'wallpapers_running',
        label: 'TAPETY DLA BIEGACZY NA TELEFON',
        desc: 'Zestaw grafik motywacyjnych dla biegaczy w formacie ZIP.',
        tags: ['GRAFIKA', 'TAPETY', 'ZIP'],
        tier: 'suboptimal',
        feedback:
          'Mało angażujący zasób, który nie odpowiada potrzebie zdobycia merytorycznej wiedzy.'
      },
      {
        id: 'source_code',
        label: 'KOD ŹRÓDŁOWY STRONY',
        desc: 'Surowe pliki źródłowe HTML/JS skompresowane w archiwum.',
        tags: ['KOD', 'DEV', 'ARCHIWUM'],
        tier: 'critical',
        feedback:
          'Całkowity błąd profilowania – księgowa nigdy nie zainteresuje się pobieraniem surowego kodu.'
      }
    ]
  },
  injection: {
    instruction: 'ZAWIRUSUJ PLIK – DODAJ WIRUSA DO STRONY INTERNETOWEJ',
    targetDomain: 'dalekbieg.info',
    payloadModuleLabel: '//PRZEKIEROWANIE',
    downloadButtonText: 'POBIERZ PORADNIK'
  },
  senderName: {
    decisionNum: 3,
    question: 'WYSŁAĆ MAILA – WYŚLIJ MAILA DO SWOJEJ OFIARY. PODSZYJ SIĘ POD NAJBARDZIEJ WIARYGODNĄ OSOBĘ.',
    subtitle: 'Decyzja D3: Wybór tożsamości nadawcy',
    options: [
      {
        id: 'jakub_kwiatkowski',
        label: 'JAKUB KWIATKOWSKI',
        desc: 'Zaufany współpracownik z tego samego pokoju księgowości oraz stały partner z wieczornych biegów.',
        tags: ['KOLEGA', 'KSIĘGOWOŚĆ', 'PARTNER BIEGOWY'],
        tier: 'ideal',
        feedback:
          'Zaufany współpracownik z tego samego pokoju oraz partner z wieczornych biegów.'
      },
      {
        id: 'prezes_buczek',
        label: 'PREZES BUCZEK',
        desc: 'Prezes zarządu PetroLog – osoba stojąca na czele firmy.',
        tags: ['ZARZĄD', 'PREZES', 'DYREKCJA'],
        tier: 'suboptimal',
        feedback:
          'Wiadomość o tematyce sportowej od zarządu firmy wyda się ofierze wysoce podejrzana.'
      },
      {
        id: 'twoj_synek',
        label: 'TWÓJ SYNEK',
        desc: 'Tożsamość podszywająca się pod dziecko ofiary.',
        tags: ['RODZINA', 'DZIECKO'],
        tier: 'critical',
        feedback: 'Małe dzieci nie wysyłają maili ze skrzynki korporacyjnej PetroLog.'
      }
    ]
  },
  senderEmail: {
    decisionNum: 4,
    question: 'WYSŁAĆ MAILA – WYBIERZ ADRES EMAIL, Z KTÓREGO WYŚLESZ WIADOMOŚĆ.',
    subtitle: 'Decyzja D4: Wybór adresu e-mail nadawcy (spoofing)',
    options: [
      {
        id: 'kwiatkowski_petrolog',
        label: 'K.KWIATKOWSKI@PETROLOG.COM',
        desc: 'Wiarygodny adres w domenie korporacyjnej PetroLog.',
        tags: ['FIRMOWY', 'SPOOFING', 'PETROLOG.COM'],
        tier: 'ideal',
        feedback:
          'Domena firmowa PetroLog – pełne uwiarygodnienie wewnętrznej korespondencji służbowej.'
      },
      {
        id: 'kwiatkowski_hach',
        label: 'K.KWIATKOWSKI@HACH.COM',
        desc: 'Adres w obcej domenie zewnętrznej hach.com.',
        tags: ['ZEWNĘTRZNY', 'HACH.COM'],
        tier: 'suboptimal',
        feedback:
          'Obca domena zewnętrzna, łatwa do wykrycia przy uważnej weryfikacji nagłówków.'
      },
      {
        id: 'darksun_gmail',
        label: 'DARKSUN.JAKUB@GMAIL.COM',
        desc: 'Adres publiczny na serwerze Gmail z nazwą grupy hakerskiej.',
        tags: ['PUBLICZNY', 'DARKSUN', 'GMAIL'],
        tier: 'critical',
        feedback:
          'Jawna nazwa grupy hakerskiej i publiczny provider (Gmail) skutkujący blokadą antyspamową.'
      }
    ]
  }
};

/** S05: Egzekucja ataku i monitoring reakcji ofiary. */
export const victimMonitorConfig: VictimMonitorConfig = {
  senderName: 'Jakub Kwiatkowski',
  senderEmail: 'k.kwiatkowski@petrolog.com',
  recipientName: 'Anita Klimek',
  recipientEmail: 'a.klimek@petrolog.com',
  emailSubject: 'Zobacz to!',
  emailBody: [
    'Koniecznie musisz zobaczyć tę stronę:',
    'dalekbieg.info',
    'Mają super poradnik dla biegaczy długodystansowych!',
    'Coś, czego szukałaś!',
    'Jakub Kwiatkowski'
  ],
  targetDomain: 'dalekbieg.info',
  payloadFileName: 'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK',
  networkNodes: [
    {
      id: 'n1',
      label: 'STACJA_ANITY_KSIĘGOWOŚĆ',
      ip: '192.168.10.45',
      role: 'PUNKT WEJŚCIA (EXPLOIT OK)'
    },
    {
      id: 'n2',
      label: 'SERWER_PLIKÓW_PETROLOG',
      ip: '192.168.10.2',
      role: 'UDOSTĘPNIANIE ZASOBÓW SMB'
    },
    {
      id: 'n3',
      label: 'BAZA_LOGISTYCZNA_FREEVOLT',
      ip: '192.168.10.88',
      role: 'ŁAŃCUCH DOSTAW (EXFILTRACJA)'
    }
  ]
};

/** Dane klocków M1, kluczowane identyfikatorem kafelka pulpitu. */
export const mission1Blocks: Record<string, unknown> = {
  app_target_petrolog: targetPetrologConfig,
  app_osint_search: osintSearchConfig,
  app_social_intel: socialIntelConfig,
  app_phishing_builder: phishingBuilderConfig,
  app_victim_monitor: victimMonitorConfig
};

// ---------------------------------------------------------------------------
// ETAPY MISJI — przebieg przez completeStage (wzorzec B)
// ---------------------------------------------------------------------------

export const mission1Stages: StageDefinition[] = [
  {
    id: 'app_target_petrolog',
    appId: 'app_target_petrolog',
    decisions: [],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: '150 OSÓB TO SPORO. ZACZNIJ OD WYSZUKANIA PRACOWNIKÓW PETROLOG W SIECI.'
        },
        {
          from: 'player',
          id: 'm1_reply_target',
          label: 'SPRAWDZĘ, CZY KTOŚ Z NICH MA PUBLICZNE PROFILE W MEDIACH SPOŁECZNOŚCIOWYCH.'
        }
      ],
      unlockIcons: ['osint_search_unlocked', 'app_osint_search'],
      badges: { app_osint_search: 1, chat: 1 },
      highlightTile: 'app_osint_search',
      sound: 'notification'
    }
  },
  {
    id: 'app_osint_search',
    appId: 'app_osint_search',
    decisions: [],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'ANITA KLIMEK Z DZIAŁU KSIĘGOWOŚCI. JEJ PROFIL JEST CAŁKOWICIE PUBLICZNY. PRZEŚWIETL JEJ MEDIA SPOŁECZNOŚCIOWE.'
        },
        {
          from: 'player',
          id: 'm1_reply_osint',
          label: 'PRZEANALIZUJĘ JEJ WPISY I ZBIORĘ INFORMACJE POTRZEBNE DO ATAKU.'
        }
      ],
      unlockIcons: ['social_intel_unlocked', 'app_social_intel'],
      badges: { app_social_intel: 1, chat: 1 },
      highlightTile: 'app_social_intel',
      sound: 'notification'
    }
  },
  {
    id: 'app_social_intel',
    appId: 'app_social_intel',
    decisions: [],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'MAMY KOMPLET INFORMACJI O OFIERZE. ANITA JEST ZAPALONĄ BIEGACZKĄ DŁUGODYSTANSOWĄ I SZUKA PORAD TRENINGOWYCH. CZAS NA PRZYGOTOWANIE STRONY-PUŁAPKI I MAILA.'
        },
        {
          from: 'player',
          id: 'm1_reply_social',
          label: 'STWORZĘ KAMPANIĘ SPEAR-PHISHINGOWĄ SKROJONĄ IDEALNIE POD JEJ ZAINTERESOWANIA.'
        }
      ],
      unlockIcons: ['phishing_builder_unlocked', 'app_phishing_builder'],
      badges: { app_phishing_builder: 1, chat: 1 },
      highlightTile: 'app_phishing_builder',
      sound: 'notification'
    }
  },
  {
    id: 'app_phishing_builder',
    appId: 'app_phishing_builder',
    decisions: [1, 2, 3, 4],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'MAIL ZOSTAŁ WYSŁANY DO ANITY KLIMEK. PRZEŁĄCZ SIĘ NA MONITOR OFIARY I SPRAWDŹ, CZY POŁKNIE PRZYNĘTĘ.'
        },
        {
          from: 'player',
          id: 'm1_reply_phishing',
          label: 'PODGLĄDAM JEJ SKRZYNKĘ I RUCH W SIECI.'
        }
      ],
      unlockIcons: ['victim_monitor_unlocked', 'app_victim_monitor'],
      badges: { app_victim_monitor: 1, chat: 1 },
      highlightTile: 'app_victim_monitor',
      sound: 'notification'
    }
  },
  {
    id: 'app_victim_monitor',
    appId: 'app_victim_monitor',
    decisions: [],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'DOSKONAŁA ROBOTA! OFIARA POBRAŁA PLIK, A MY MAMY DOSTĘP DO WEWNĘTRZNEJ SIECI PETROLOG. DANE O ŁAŃCUCHU DOSTAW FREEVOLT SĄ NASZE. ZASŁUŻYŁEŚ NA SWOJĄ DOLĘ W BITCOINACH.'
        },
        {
          from: 'player',
          id: 'm1_reply_victim',
          label: 'DZIĘKI. CZAS NA ANALIZĘ WYNIKÓW I RAPORT POOPERACYJNY.'
        }
      ],
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success'
    }
  }
];
