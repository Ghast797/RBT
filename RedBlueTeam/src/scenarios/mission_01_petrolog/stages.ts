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

/** S01: Baza celu PetroLog – Rozpoznanie celu w 3 krokach (Poznaj → Zbadaj → Zdecyduj). */
export const targetPetrologConfig: TargetPetrologConfig = {
  companyName: 'PetroLog',
  targetObjective: 'ROZPOZNANIE CELU I WYBÓR DROGI ATAKU',
  briefing: {
    title: 'POZNAJ CEL',
    instruction: 'Kliknij zaszyfrowane karty, aby odszyfrować kluczowe informacje o celu.',
    facts: [
      {
        id: 'fact_freevolt',
        title: 'MAJĄ DOKUMENTY O FREEVOLT',
        explanation: 'PetroLog odpowiada za newralgiczny łańcuch dostaw i dysponuje pełną dokumentacją technologii Freevolt.'
      },
      {
        id: 'fact_employees',
        title: 'PRACUJE TAM 150 OSÓB',
        explanation: 'Duża liczba zatrudnionych w strukturze firmy ułatwia ukrycie ataku socjotechnicznego.'
      },
      {
        id: 'fact_socials',
        title: 'PRACOWNICY DUŻO PUBLIKUJĄ W SIECI',
        explanation: 'Personel aktywnie dzieli się życiem zawodowym i prywatnym w otwartych mediach społecznościowych.'
      }
    ]
  },
  investigation: {
    title: 'ZBADAJ FIRMĘ',
    instruction: 'Zbadaj każde miejsce w firmie i oceń, czy jest słabym punktem, czy jest dobrze chronione.',
    places: [
      {
        id: 'place_hq',
        name: 'Budynek centrali',
        iconName: 'building',
        observations: 'Wejście zabezpieczone elektronicznymi kartami dostępu i całodobową recepcją z ochroną fizyczną. Na korytarzach działa gęsta sieć kamer monitoringu CCTV.',
        correctAssessment: 'protected',
        clue: 'Budynek centrali: ochrona fizyczna, karty dostępu i stały monitoring kamer.',
        feedbackCorrect: 'Trafna ocena! Budynek jest silnie chroniony fizycznie, bezpośrednie wtargnięcie jest zbyt ryzykowne.',
        feedbackIncorrect: 'Zwróć uwagę na ochroniarzy i monitoring CCTV przy wejściu. To nie jest łatwy cel.'
      },
      {
        id: 'place_server',
        name: 'Serwerownia',
        iconName: 'server',
        observations: 'Ruch sieciowy jest monitorowany 24/7 przez zewnętrzną wyspecjalizowaną firmę ochronną (SOC). Każde podejrzane skanowanie portów natychmiast wywołuje alarm i blokadę adresu IP.',
        correctAssessment: 'protected',
        clue: 'Serwerownia: zewnętrzna ochrona 24/7 widzi każdy atak na sieć.',
        feedbackCorrect: 'Trafna ocena! Bezpośredni atak na infrastrukturę sieciową zostanie natychmiast zablokowany przez SOC.',
        feedbackIncorrect: 'Zewnętrzny zespół monitoruje ruch przez całą dobę. Próba przełamania serwera natychmiast nas zdradzi.'
      },
      {
        id: 'place_sales',
        name: 'Dział sprzedaży',
        iconName: 'users',
        observations: 'Handlowcy podlegają ścisłym procedurom weryfikacji tożsamości każdego nowego klienta. Przed przesłaniem cenników i dokumentów sprawdzają dane firmy w rejestrach.',
        correctAssessment: 'protected',
        clue: 'Dział sprzedaży: personel dokładnie weryfikuje tożsamość każdego nowego kontaktu.',
        feedbackCorrect: 'Trafna ocena! Handlowcy skrupulatnie sprawdzają nieznajomych i stosują procedury weryfikacyjne.',
        feedbackIncorrect: 'Handlowcy dokładnie weryfikują każdego rozmówcę. Zwykły podstęp w tym dziale szybko spali sprawę.'
      },
      {
        id: 'place_finance',
        name: 'Księgowość',
        iconName: 'calculator',
        observations: 'Pracownicy działają pod ciągłą presją czasu, obsługując dziesiątki faktur w załącznikach dziennie. Nikt nie sprawdza autentyczności adresu nadawcy przed otwarciem pliku.',
        correctAssessment: 'vulnerable',
        clue: 'Księgowość: pośpiech, dziesiątki faktur w załącznikach, nikt nie sprawdza nadawcy maila.',
        feedbackCorrect: 'Trafna ocena! Ciągły pośpiech i bezkrytyczne otwieranie setek załączników to idealny słaby punkt.',
        feedbackIncorrect: 'Zauważ presję terminów i nawyk otwierania każdego nadesłanego pliku bez weryfikacji nadawcy.'
      }
    ]
  },
  decision: {
    title: 'ZDECYDUJ',
    instruction: 'Na podstawie zebranych w notatniku ustaleń wybierz optymalną drogę ataku na PetroLog.',
    question: 'Wskaż najskuteczniejszą drogę ataku na firmę PetroLog:',
    options: [
      {
        id: 'attack_servers',
        iconName: 'server',
        title: 'Zaatakować serwery firmy',
        description: 'Próba przełamania zapory sieciowej i sforsowania serwerów firmy przez Internet.',
        isCorrect: false,
        relatedClueId: 'place_server',
        feedback: 'Ostrzeżenie DarkSun: Przeczytaj ponownie trop dotyczący serwerowni. Zewnętrzny SOC natychmiast wykryje próbę ataku na sieć i zablokuje naszą operację!'
      },
      {
        id: 'attack_building',
        iconName: 'building',
        title: 'Włamać się do budynku',
        description: 'Fizyczne wejście do siedziby przedsiębiorstwa i próba podłączenia urządzenia do sieci.',
        isCorrect: false,
        relatedClueId: 'place_hq',
        feedback: 'Ostrzeżenie DarkSun: Przeczytaj ponownie trop dotyczący budynku centrali. Ochrona fizyczna i monitoring CCTV gwarantują natychmiastową wpadkę!'
      },
      {
        id: 'attack_phishing',
        iconName: 'mail',
        title: 'Wysłać podstępnego maila do pracownika',
        description: 'Skierowanie wiadomości ze złośliwym plikiem do podatnego działu firmy.',
        isCorrect: true,
        relatedClueId: 'place_finance',
        feedback: 'Trafny wybór! Ta technika to spear-phishing — celowany atak socjotechniczny, który wykorzystuje pośpiech w księgowości i omija zewnętrzne zabezpieczenia sieciowe.'
      }
    ]
  }
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
        "ERROR: MARCELINA SOJKA USTAWIŁA WSZYSTKIE SWOJE SOCIAL MEDIA NA 'PRYWATNE'. NIE MAMY JAK ZDOBYĆ O NIEJ INFORMACJI.\n\n[WSKAZÓWKA EDUKACYJNA T2]: Profil prywatny to najskuteczniejsza ochrona pracownika przed białym wywiadem (OSINT). Ukrycie informacji przed osobami z zewnątrz uniemożliwia przestępcom poznanie relacji, nawyków czy zainteresowań ofiary, co całkowicie paraliżuje próbę przygotowania spersonalizowanego ataku phishingowego.",
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
    requiredFacts: 8,
    requiredPrecision: 70
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
      },
      deductionOptions: [
        {
          id: 'kn1_opt_1',
          text: 'Pracuje w firmie PetroLog od 5 lat',
          isCorrect: true,
          feedback: 'Trafna dedukcja! 5-letni staż Anity w PetroLog oznacza doskonałą znajomość zespołu i procedur.'
        },
        {
          id: 'kn1_opt_2',
          text: 'Planuje zwolnić się i przejść do konkurencyjnej firmy paliwowej',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — Anita pisze, że uwielbia tę pracę i poleca firmę.'
        },
        {
          id: 'kn1_opt_3',
          text: 'Zarządza flotą 50 cystern transportowych w PetroLog',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — wpis nie wspomina o flocie ani zarządzaniu transportem.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'kn2_opt_1',
          text: 'Prowadzi przedszkole integracyjne poza godzinami pracy',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — wpis mówi o weekendzie z własnymi dziećmi.'
        },
        {
          id: 'kn2_opt_2',
          text: 'Jest matką dwójki dzieci',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Dzieci to kluczowy element profilu osobistego i potencjalny wektor empatii.'
        },
        {
          id: 'kn2_opt_3',
          text: 'Mieszka sama w kawalerce bez rodziny',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — wpis wprost odwołuje się do rodziny i dzieci.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'kn3_opt_1',
          text: 'Uwielbia biegać i trenuje nawet na wakacjach',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Bieganie to jej pasja sportowa — idealny temat pod spersonalizowaną przynętę.'
        },
        {
          id: 'kn3_opt_2',
          text: 'Zawodowo trenuje pływanie na otwartych akwenach',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — emoji i tekst wskazują jednoznacznie na bieganie.'
        },
        {
          id: 'kn3_opt_3',
          text: 'Jest właścicielką nadmorskiego klubu fitness',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — Anita pisze o prywatnym bieganiu po plaży.'
        }
      ]
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
        'BRAK PRZYDATNYCH INFORMACJI (Wpis o remoncie pokoju nie dostarcza konkretnego wektora do spear-phishingu)',
      deductionOptions: [
        {
          id: 'kn4_opt_1',
          text: 'Zajmuje się architekturą wnętrz i zamówieniami mebli biurowych',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — remont dotyczy jej prywatnego domu, a nie biura.'
        },
        {
          id: 'kn4_opt_2',
          text: 'Brak wartości operacyjnej (szum informacyjny / prywatny remont)',
          isCorrect: true,
          feedback: 'Trafna ocena! Informacja o remoncie pokoju nie dostarcza konkretnego wektora do ataku.'
        },
        {
          id: 'kn4_opt_3',
          text: 'Planuje pilną wyprowadzkę do innego województwa',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — wpis mówi jedynie o odświeżeniu pokoju po 6 latach.'
        }
      ]
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
        'BRAK PRZYDATNYCH INFORMACJI (Typowy post lifestylowy o kawie – brak precyzyjnego motywu socjotechnicznego)',
      deductionOptions: [
        {
          id: 'qg1_opt_1',
          text: 'Odpowiada za zakupy ekspresów do kawy w całej centrali',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — to tylko prywatne zdjęcie filiżanki kawy.'
        },
        {
          id: 'qg1_opt_2',
          text: 'Prowadzi komercyjnego bloga cukierniczego na Instagramie',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — wpis to zwykła relacja z poniedziałkowego poranka.'
        },
        {
          id: 'qg1_opt_3',
          text: 'Brak wartości operacyjnej (post lifestylowy / kawa biurowa)',
          isCorrect: true,
          feedback: 'Trafna ocena! Standardowy post lifestylowy o porannej kawie nie zawiera danych przydatnych w ataku.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'qg2_opt_1',
          text: 'Lubi piec ciasta w wolnym czasie (hobby kulinarne)',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Pieczenie ciast to jej hobby domowe, choć mniej przydatne niż sport.'
        },
        {
          id: 'qg2_opt_2',
          text: 'Jest zawodowym szefem kuchni w restauracji',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — Anita piecze amatorsko w domowym zaciszu w soboty.'
        },
        {
          id: 'qg2_opt_3',
          text: 'Cierpi na ostrą alergię na wypieki pszenne',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — z entuzjazmem publikuje własne ciasto.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'qg3_opt_1',
          text: 'Kuba Kwiatkowski jest jej instruktorem krav magi',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — wpis mówi o wspólnym bieganiu wieczornym.'
        },
        {
          id: 'qg3_opt_2',
          text: 'Codziennie wieczorem trenuje bieganie z Kubą Kwiatkowskim',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Relacja z Kubą Kwiatkowskim to kluczowe odkrycie łączące hobby i zaufanie biurowe.'
        },
        {
          id: 'qg3_opt_3',
          text: 'Przygotowuje się do zawodów triathlonowych na rowerze',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — mowa jest wyłącznie o treningu biegowym.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'qg4_opt_1',
          text: 'Bierze udział wyłącznie w krótkich biegach sprinterskich na 100m',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — Anita wprost pisze: "Nienawidzę sprintów!".'
        },
        {
          id: 'qg4_opt_2',
          text: 'Biega wyłącznie długodystansowo (nie cierpi sprintów)',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Precyzyjny profil biegowy: długie dystanse, równe tempo i muzyka.'
        },
        {
          id: 'qg4_opt_3',
          text: 'Zajmuje się nagrywaniem podcastów o muzyce elektronicznej',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — muzyka to tylko tło do jej treningu biegowego.'
        }
      ]
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
        'BRAK PRZYDATNYCH INFORMACJI (Ogólna wypowiedź motywacyjna bez szczegółów ułatwiających podszycie)',
      deductionOptions: [
        {
          id: 'ji1_opt_1',
          text: 'Brak wartości operacyjnej (ogólny wpis motywacyjny bez faktów)',
          isCorrect: true,
          feedback: 'Trafna ocena! Ogólna wypowiedź motywacyjna o energii i sporcie bez przydatnych detali.'
        },
        {
          id: 'ji1_opt_2',
          text: 'Otrzymała państwowe odznaczenie za zasługi dla logistyki',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — post nie zawiera wzmianki o żadnych nagrodach.'
        },
        {
          id: 'ji1_opt_3',
          text: 'Została awansowana na stanowisko dyrektora generalnego PetroLog',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — to tylko typowy post na portalu biznesowym.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'ji2_opt_1',
          text: 'Pracuje w księgowości z Kubą Kwiatkowskim (rozliczają faktury)',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Kuba Kwiatkowski to zaufany kolega z biura rozliczeń — idealna tożsamość do podszycia.'
        },
        {
          id: 'ji2_opt_2',
          text: 'Kuba Kwiatkowski jest administratorem serwerów Linux w PetroLog',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — Anita wprost pisze: "razem rozliczamy każdą fakturę".'
        },
        {
          id: 'ji2_opt_3',
          text: 'Kuba Kwiatkowski pracuje w oddziale firmy w Berlinie',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — stanowią jeden bezpośredni zespół księgowy.'
        }
      ]
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
      },
      deductionOptions: [
        {
          id: 'ji3_opt_1',
          text: 'Oferuje płatne konsultacje dietetyczne dla sportowców',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — Anita zadaje pytanie społeczności, a nie oferuje usługi.'
        },
        {
          id: 'ji3_opt_2',
          text: 'Szuka profesjonalnych rad na temat biegów długodystansowych',
          isCorrect: true,
          feedback: 'Trafna dedukcja! Kluczowa potrzeba edukacyjna ofiary — idealny wabik na materiał szkoleniowy w PDF.'
        },
        {
          id: 'ji3_opt_3',
          text: 'Sprzedaje używany sprzęt do biegania i buty maratońskie',
          isCorrect: false,
          feedback: 'Nietrafna dedukcja. Zwracaj uwagę na detale — post to prośba o wskazówki treningowe.'
        }
      ]
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
        desc: 'Adres w domenie firmowej @petrolog.com. Serwer pocztowy firmy jest słabo zabezpieczony i nie weryfikuje tożsamości nadawcy, co pozwala podszyć się pod pracownika.',
        tags: ['FIRMOWY', 'PODSZYWANIE', 'PETROLOG.COM'],
        tier: 'ideal',
        feedback:
          'Domena firmowa PetroLog – serwer pocztowy firmy jest słabo zabezpieczony i nie weryfikuje tożsamości nadawcy, co pozwala podszyć się pod pracownika i uśpić czujność ofiary bez podejrzeń.'
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
