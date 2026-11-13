// Etapy i dane klocków Misji 3 (O&L Company) — wzorzec B.
// Treść (teksty, poziomy, feedback) mieszka tutaj, nie w kodzie minigry. Dane 1:1 z dokumentu
// `docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md`; odchylenia opisuje docs/rebuild-plan.md (sekcja 8).
// Mostki (conversation) to rozmowy po zaliczeniu etapu; kafelek następnego etapu odblokowuje się
// dopiero po kwestii gracza (i po przeskoku czasu). Źródło prawdy: scenario.md + docs/rebuild-plan.md.

import type { ChoiceOutcome, StageDefinition } from '../../engine/types/mission';
import type {
  VirusLabConfig,
  OsintBrowserConfig,
  PendriveConfig,
  DroneConfig,
  DroneMapLocation,
  DroneCar,
  RatSessionConfig,
  UsbState
} from './minigames/types';
import { reportAnswerOf } from '../../engine/core/report';

// ---------------------------------------------------------------------------
// WSPÓLNE STAŁE (jedno źródło prawdy dla danych powtarzanych w kilku klockach)
// ---------------------------------------------------------------------------

/** Wartości pendrive'a, gdy gracz wszedł w //DRON lub //RAT bez przejścia //DYSK E (tylko tryb deweloperski). */
const USB_FALLBACK: UsbState = {
  volume: 'IMPREZA',
  archive: 'FOTKI_AFTERPARTY.ZIP',
  signature: 'ZDJĘCIA Z AFTERPARTY O&L COMPANY!'
};

// ---------------------------------------------------------------------------
// ETAP 1: //BAZA_WIRUSÓW — D1 + zdrapka składania programu (flavor bez oceny)
// ---------------------------------------------------------------------------

export const virusLabConfig: VirusLabConfig = {
  title: '//BAZA_WIRUSÓW',
  subtitle: 'WYBÓR I SKŁADANIE ZŁOŚLIWEGO OPROGRAMOWANIA',
  steps: ['KROK 1/2', 'KROK 2/2'],
  virus: {
    decisionNum: 1,
    question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA',
    options: [
      {
        id: 'rat',
        label: 'RAT: REMOTE ACCESS TROJAN',
        // Opisy to neutralne definicje typu programu (bez oceny przydatności), jak w M2; opisy z VR zdradzały odpowiedź.
        desc: 'PROGRAM POZWALAJĄCY ZDALNIE STEROWAĆ ZAINFEKOWANYM KOMPUTEREM, JAK GDYBY SIEDZIAŁO SIĘ PRZY NIM',
        reportAnswer: 'RAT',
        tier: 'ideal',
        feedback:
          'Daje bezpośredni, interaktywny wgląd w pulpit stacji roboczej pracownika i pozwala na swobodną eksplorację zasobów korporacyjnych bez wszczynania alarmu.'
      },
      {
        id: 'ransomware',
        label: 'RANSOMWARE',
        desc: 'PROGRAM SZYFRUJĄCY DANE NA KOMPUTERZE I W SIECI, ŻEBY ZAŻĄDAĆ OKUPU ZA ICH ODBLOKOWANIE',
        tier: 'critical',
        feedback:
          'Zaszyfrowanie danych na stacji ofiary od razu postawi na nogi dział IT, który wykryje włamanie, odetnie stację od sieci i zablokuje możliwość cichego wykradzenia dokumentacji Freevolt.'
      },
      {
        id: 'keylogger',
        label: 'KEYLOGGER',
        desc: 'PROGRAM REJESTRUJĄCY WSZYSTKIE KLAWISZE WCIŚNIĘTE NA ZAINFEKOWANYM KOMPUTERZE',
        tier: 'suboptimal',
        feedback:
          'Samo przechwytywanie wciśnięć klawiszy nie gwarantuje dostępu do zgromadzonych na dyskach plików projektowych i schematów.',
        reject: {
          mentorLine: 'KEYLOGGER ZAPISZE TYLKO WCIŚNIĘTE KLAWISZE, A MY POTRZEBUJEMY DOSTĘPU DO PLIKÓW. PRZEMYŚL TO JESZCZE RAZ.'
        }
      }
    ]
  },
  virusTexts: {
    task: 'WYBIERZ WIRUSA I ZATWIERDŹ WYBÓR.',
    confirmLabel: 'ZATWIERDŹ WIRUSA',
    nextLabel: 'DALEJ'
  },
  // Zdrapka (w danych `matrix` to nazwa wewnętrzna; graczowi nie pokazujemy żargonu „matryca kompilacji”).
  matrix: {
    heading: 'WYSZUKAJ CZĘŚCI WIRUSA:',
    programPrefix: 'SKŁADASZ PROGRAM:',
    loaderText: 'PRZYGOTOWANIE PROGRAMU DO SKŁADANIA…',
    revealThreshold: 0.92,
    segments: 10,
    // Wariant wg wyboru z D1. Do zdrapki dochodzi tylko RAT: ransomware (critical) kończy misję, keylogger
    // (odrzucony przez mentora) zostaje na wyborze wirusa, więc dla nich wariantu nie ma.
    variants: {
      rat: {
        programName: 'RAT',
        image: { group: 'virus', name: 'rat' },
        imageAlt: 'głowa szczura z cybernetycznymi elementami (RAT)',
        parts: [
          { id: 'screen', label: 'PODGLĄD EKRANU', desc: 'widzisz pulpit ofiary' },
          { id: 'control', label: 'STEROWANIE', desc: 'używasz jej myszy i klawiatury' },
          { id: 'stealth', label: 'CICHE TŁO', desc: 'działa jak zwykły proces, nikt go nie zauważa' },
          { id: 'link', label: 'ŁĄCZNOŚĆ', desc: 'łączy się z Twoim komputerem' }
        ]
      }
    },
    doneMessage: 'WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY',
    task: 'PRZECIĄGAJ KURSOREM Z WCIŚNIĘTYM PRZYCISKIEM MYSZY PO CZARNYM POLU, ŻEBY ODSŁONIĆ PROGRAM.',
    hint: 'PRZECIĄGAJ TUTAJ'
  }
};

// ---------------------------------------------------------------------------
// ETAP 2: //TOR: PRZEGLĄDARKA — rozpoznanie strony, D2 cel, D3 wektor
// ---------------------------------------------------------------------------

export const osintBrowserConfig: OsintBrowserConfig = {
  title: '//TOR: PRZEGLĄDARKA',
  subtitle: 'REKONESANS: STRONA FIRMY I DOBÓR OFIARY',
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  site: {
    url: 'https://olcompany.cloud',
    title: 'O&L COMPANY',
    tabs: { home: 'STRONA GŁÓWNA', events: 'WYDARZENIA' },
    heroHeadline: 'JESTEŚMY JEDNYM Z NAJWIĘKSZYCH DYSTRYBUTORÓW PALIW',
    heroSubheadline: 'OBSŁUGUJEMY MIĘDZYNARODOWĄ SIEĆ STACJI PALIWOWYCH ORAZ ZAOPATRUJEMY NAJWIĘKSZE KORPORACJE',
    contact: { phone: '+48 871 787-83-76', email: 'sales@olcompany.cloud' },
    employeesHeading: 'NASI EKSPERCI:',
    scrollDownLabel: 'Przewiń stronę w dół',
    // Opisy i staż: tylko zakres pracy i czas w firmie, bez słowa o szkoleniach i poziomie wiedzy z bezpieczeństwa.
    employees: [
      {
        id: 'jan_lukasiewicz',
        name: 'JAN ŁUKASIEWICZ',
        role: 'CEO',
        tenure: 'W O&L OD: 21 LAT',
        bio: 'Założyciel i prezes O&L Company. Podpisuje kluczowe kontrakty paliwowe i reprezentuje firmę wobec największych klientów.',
        photo: { group: 'employees', name: 'jan_lukasiewicz' },
        optionId: 'choose_ceo'
      },
      {
        id: 'slawomir_bialek',
        name: 'SŁAWOMIR BIAŁEK',
        role: 'SZEF DZIAŁU CYBERBEZPIECZEŃSTWA',
        tenure: 'W O&L OD: 9 LAT',
        bio: 'Kieruje działem cyberbezpieczeństwa i odpowiada za ochronę systemów firmy. Od lat współpracuje z zarządem przy każdej zmianie w infrastrukturze.',
        photo: { group: 'employees', name: 'slawomir_bialek' },
        optionId: 'choose_ciso'
      },
      {
        id: 'wiktoria_galecka',
        name: 'WIKTORIA GAŁECKA',
        role: 'SPECJALISTKA DS. LOGISTYKI',
        tenure: 'W O&L OD: 6 LAT',
        bio: 'Koordynuje transport paliw: cysterny, rurociągi i terminale. Na co dzień pracuje w systemie logistycznym firmy.',
        photo: { group: 'employees', name: 'wiktoria_galecka' },
        optionId: 'choose_logistics'
      },
      {
        id: 'agnieszka_leman',
        name: 'AGNIESZKA LEMAN',
        role: 'SZEFOWA DZIAŁU SPRZEDAŻY',
        tenure: 'W O&L OD: 11 LAT',
        bio: 'Kieruje zespołem handlowym. Odpowiada za relacje z największymi klientami i za wyniki sprzedaży.',
        photo: { group: 'employees', name: 'agnieszka_leman' },
        optionId: 'choose_sales'
      },
      {
        id: 'mateusz_klimowicz',
        name: 'MATEUSZ KLIMOWICZ',
        role: 'JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA',
        tenure: 'W O&L OD: 2 TYGODNIE',
        bio: 'Odpowiada na zapytania klientów i obsługuje zgłoszenia w dziale wsparcia. Pracuje w zespole działu sprzedaży.',
        photo: { group: 'employees', name: 'mateusz_klimowicz' },
        optionId: 'choose_mateusz'
      }
    ],
    // Wpisy z dokumentu, daty dopasowane do fabuły (dzień misji 19.05.2026, Mateusz w firmie od ok. 2 tygodni):
    // impreza sprzedaży niedawno, w maju, z powitaniem nowych pracowników; wydarzenie logistyki wcześniej.
    // VR podaje „15 WRZEŚNIA” i „4 LISTOPADA” (niezgodne z fabułą). Bez dat rocznych.
    events: [
      {
        id: 'party_sales',
        headline: '8 MAJA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU SPRZEDAŻY!',
        body: 'POWITALIŚMY NA POKŁADZIE NOWYCH PRACOWNIKÓW ORAZ ŚWIĘTOWALIŚMY OSTATNIE SUKCESY!',
        hashtags: '#OL #BESTCOMPANY #COMPANYUNHACKED',
        photos: [
          { group: 'events', name: 'party_sales_1' },
          { group: 'events', name: 'party_sales_2' },
          { group: 'events', name: 'party_sales_3' }
        ]
      },
      {
        id: 'meeting_logistics',
        headline: '14 MARCA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU LOGISTYKI!',
        photos: [
          { group: 'events', name: 'meeting_logistics_1' },
          { group: 'events', name: 'meeting_logistics_2' }
        ]
      }
    ]
  },
  siteTexts: {
    task: 'PRZEJRZYJ STRONĘ FIRMY: PRZEWIŃ ZAKŁADKI STRONA GŁÓWNA I WYDARZENIA DO KOŃCA.',
    continueLabel: 'PRZEJDŹ DO WYBORU CELU',
    readLabel: 'PRZECZYTANO:',
    idleHint: 'PRZEWIŃ W DÓŁ OBIE ZAKŁADKI STRONY (STRONA GŁÓWNA I WYDARZENIA) — WTEDY PRZYCISK SIĘ ODBLOKUJE.'
  },
  loaders: {
    target: 'ŁADOWANIE LISTY PRACOWNIKÓW…',
    targetSave: 'ZAPISYWANIE CELU…',
    vectorSave: 'ZAPISYWANIE PLANU ATAKU…'
  },
  target: {
    decisionNum: 2,
    question: 'KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?',
    // Karty tylko z imieniem i nazwiskiem (label); stanowisko do raportu w `reportAnswer`.
    options: [
      {
        id: 'choose_mateusz',
        label: 'MATEUSZ KLIMOWICZ',
        reportAnswer: 'JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA',
        tier: 'ideal',
        feedback:
          'Nowo zatrudniony pracownik na juniorskim stanowisku charakteryzuje się najmniejszym doświadczeniem, brakiem obycia z procedurami bezpieczeństwa i najwyższą podatnością na socjotechnikę.'
      },
      {
        id: 'choose_logistics',
        label: 'WIKTORIA GAŁECKA',
        reportAnswer: 'SPECJALISTKA DS. LOGISTYKI',
        tier: 'suboptimal',
        feedback:
          'Doświadczone pracownice wyższego szczebla, które zachowują większą ostrożność wobec nietypowych nośników pamięci.',
        reject: {
          mentorLine:
            'WIKTORIA PRACUJE TU OD SZEŚCIU LAT I ZNA PROCEDURY. NIEZNANY PENDRIVE RACZEJ ZANIESIE DO IT. WYBIERZ KOGOŚ INNEGO.'
        }
      },
      {
        id: 'choose_sales',
        label: 'AGNIESZKA LEMAN',
        reportAnswer: 'SZEFOWA DZIAŁU SPRZEDAŻY',
        tier: 'suboptimal',
        feedback:
          'Doświadczone pracownice wyższego szczebla, które zachowują większą ostrożność wobec nietypowych nośników pamięci.',
        reject: {
          mentorLine:
            'AGNIESZKA KIERUJE ZESPOŁEM I ZGŁOSI KAŻDĄ PODEJRZANĄ RZECZ. TO ZBYT OSTROŻNA OSOBA NA TAKI ATAK. SPRÓBUJ JESZCZE RAZ.'
        }
      },
      {
        id: 'choose_ciso',
        label: 'SŁAWOMIR BIAŁEK',
        reportAnswer: 'SZEF DZIAŁU CYBERBEZPIECZEŃSTWA',
        tier: 'critical',
        feedback:
          'Zaatakowanie szefa bezpieczeństwa lub CEO tak jawnym wektorem to gwarancja natychmiastowego zgłoszenia incydentu i spalenia całej operacji.'
      },
      {
        id: 'choose_ceo',
        label: 'JAN ŁUKASIEWICZ',
        reportAnswer: 'CEO',
        tier: 'critical',
        feedback:
          'Zaatakowanie szefa bezpieczeństwa lub CEO tak jawnym wektorem to gwarancja natychmiastowego zgłoszenia incydentu i spalenia całej operacji.'
      }
    ]
  },
  targetTexts: {
    task: 'WYBIERZ OSOBĘ, KTÓRĄ ZAATAKUJESZ.',
    confirmLabel: 'ZATWIERDŹ CEL'
  },
  vector: {
    decisionNum: 3,
    question: 'JAK GO OSZUKASZ?',
    options: [
      {
        id: 'vector_party_zip',
        label:
          'MAM ZDJĘCIA I INFORMACJE O OSTATNIEJ IMPREZIE DZIAŁU SPRZEDAŻY. PODRZUCĘ MU PENDRIVE Z KILKOMA KOMPROMITUJĄCYMI ZDJĘCIAMI. WIRUSA UKRYJĘ W ARCHIWUM ZIP',
        reportAnswer: 'NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY',
        tier: 'ideal',
        feedback:
          'Idealnie wykorzystuje świeże wydarzenie firmowe oraz naturalną ludzką ciekawość i strach przed kompromitacją, a spakowanie złośliwego kodu do ZIP omija proste skanery antywirusowe.'
      },
      {
        id: 'vector_hr_docs',
        label: 'PODRZUCĘ MU PENDRIVE Z DOKUMENTAMI HR DOTYCZĄCYMI ZWOLNIEŃ',
        reportAnswer: 'PODRZUCĘ PENDRIVE Z DOKUMENTAMI HR O ZWOLNIENIACH',
        tier: 'suboptimal',
        feedback:
          'Wzbudza silny lęk, lecz junior w dziale wsparcia może uznać to za pomyłkę i odnieść nośnik prosto do kadr.'
      },
      {
        id: 'vector_empty_keylogger',
        // Literówka „ZOSTAWIE” z dokumentu poprawiona na „ZOSTAWIĘ” (decyzja właściciela).
        label: 'PO PROSTU ZOSTAWIĘ PUSTY PENDRIVE Z PODPISEM KEYLOGGER',
        reportAnswer: 'PUSTY PENDRIVE Z PODPISEM KEYLOGGER',
        tier: 'critical',
        feedback:
          'Całkowity brak kamuflażu socjotechnicznego natychmiast zaalarmuje pracownika i spowoduje zablokowanie nośnika przez administratora.'
      }
    ]
  },
  vectorTexts: {
    task: 'WYBIERZ SPOSÓB, W JAKI OSZUKASZ OFIARĘ.',
    confirmLabel: 'ZATWIERDŹ PLAN'
  }
};

// ---------------------------------------------------------------------------
// ETAP 3: //DYSK E: PENDRIVE — załączniki, archiwum, nazwa dysku, podpis (D4)
// ---------------------------------------------------------------------------

/** Id opcji D3 (plan), od których zależą poziomy D4. Bazowe poziomy D4 odpowiadają planowi zdjęć z imprezy. */
const PLAN_PARTY = 'vector_party_zip';
const PLAN_HR = 'vector_hr_docs';

/** Pliki D3 -> pliki pasujące do planu: pliki do wgrania wynikają z tego, co gracz wybrał w D3. */
const vectorAnswer = (optionId: string): string => {
  const opt = osintBrowserConfig.vector.options.find((o) => o.id === optionId);
  if (!opt) throw new Error(`Brak opcji D3: ${optionId}`);
  return reportAnswerOf(opt);
};

export const pendriveConfig: PendriveConfig = {
  title: '//DYSK E: PENDRIVE',
  subtitle: 'PRZYGOTOWANIE NOŚNIKA Z PRZYNĘTĄ',
  steps: ['KROK 1/3', 'KROK 2/3', 'KROK 3/3'],
  // Ideal D3 -> zdjęcia; suboptimal D3 -> dokumenty HR lub wypowiedzenie; critical D3 kończy się wykryciem
  // (do //DYSK E nie dochodzi), więc reguła nie ma plików.
  plan: [
    { vectorOptionId: PLAN_PARTY, planLabel: vectorAnswer('vector_party_zip'), fileIds: ['party_photos'] },
    { vectorOptionId: PLAN_HR, planLabel: vectorAnswer('vector_hr_docs'), fileIds: ['hr_docs', 'termination'] },
    { vectorOptionId: 'vector_empty_keylogger', planLabel: vectorAnswer('vector_empty_keylogger'), fileIds: [] }
  ],
  planFallbackVectorOptionId: 'vector_party_zip',
  attachments: [
    {
      id: 'party_photos',
      name: 'IMG_00034521.JPG X3',
      archive: 'FOTKI_AFTERPARTY.ZIP',
      thumb: { group: 'usb', name: 'party_photos' }
    },
    { id: 'hr_docs', name: 'DOKUMENTY_HR.DOCX', archive: 'DOKUMENTY_HR.ZIP' },
    { id: 'termination', name: 'WYPOWIEDZENIE_UMOWY_O_PRACE.PDF', archive: 'WYPOWIEDZENIE_UMOWY_O_PRACE.ZIP' }
  ],
  startTexts: {
    task: 'ODBIERZ PLIKI OD BYTE_MASTERA.',
    button: 'POBIERZ ZAŁĄCZNIKI',
    loader: 'POBIERANIE ZAŁĄCZNIKÓW…',
    panelTitle: 'ZAŁĄCZNIKI'
  },
  armTexts: {
    taskFile: "PRZECIĄGNIJ NA PENDRIVE'A PLIK PASUJĄCY DO TWOJEGO PLANU.",
    planPrefix: 'PLAN:',
    taskPayload: 'PRZECIĄGNIJ //WIRUS: RAT NA PLIK NA PENDRIVIE, ŻEBY ZAPAKOWAĆ GO RAZEM W ARCHIWUM.',
    payloadLabel: '//WIRUS: RAT',
    slotLabel: '//E: USB',
    packing: 'PAKOWANIE DO ARCHIWUM…',
    wrongFileMessage: 'TEN PLIK NIE PASUJE DO TWOJEGO PLANU',
    loader: 'PRZYGOTOWANIE NOŚNIKA…'
  },
  envelopeImage: { group: 'usb', name: 'envelope' },
  envelopeImageAlt: "Koperta z pendrive'em",
  volume: {
    question: "WYBIERZ NAZWĘ PENDRIVE'A",
    confirmLabel: 'ZATWIERDŹ NAZWĘ',
    loader: 'ZAPIS ETYKIETY…',
    task: "WYBIERZ NAZWĘ DLA PENDRIVE'A.",
    // Dokument podaje tylko wybór idealny (`IMPREZA`); poziomy pozostałych nazw to odchylenie O4 (z poprzedniej implementacji).
    // Poziomy bazowe obowiązują przy planie zdjęć z imprezy; `forPlans`/`byPlan` dostosowują je do planu HR (M3-06):
    // nazwa pasująca do tego, co faktycznie jest na pendrive'ie, jest idealna, a „KEYLOGGER” zawsze zdradza nośnik.
    options: [
      {
        id: 'vol_keylogger',
        label: 'KEYLOGGER',
        reportAnswer: 'NAZWA DYSKU: KEYLOGGER',
        tier: 'critical',
        feedback:
          'Nazwa „KEYLOGGER” zdradza, czym jest ten nośnik: ofiara albo dział IT od razu zgłoszą go do administratora i operacja zostanie wykryta.'
      },
      {
        id: 'vol_bo',
        label: 'ZDJĘCIA B&O COMPANY',
        forPlans: [PLAN_PARTY],
        tier: 'suboptimal',
        feedback:
          'Na pendrive\'ie są zdjęcia z imprezy, więc nazwa pasuje do zawartości, ale błędna nazwa firmy („B&O” zamiast „O&L”) może zaalarmować użytkownika lub analityka.'
      },
      {
        id: 'vol_impreza',
        label: 'IMPREZA',
        forPlans: [PLAN_PARTY],
        tier: 'ideal',
        feedback: 'Naturalna, wiarygodna etykieta woluminu spójna z zawartością (zdjęcia z imprezy) i z przygotowaną przynętą.'
      },
      {
        id: 'vol_hr_docs',
        label: 'DOKUMENTY HR',
        forPlans: [PLAN_HR],
        tier: 'ideal',
        feedback:
          'Naturalna etykieta woluminu spójna z zawartością (dokumenty HR o zwolnieniach) i z przygotowaną przynętą: od razu budzi niepokój.'
      },
      {
        id: 'vol_hr_bo',
        label: 'DOKUMENTY B&O COMPANY',
        forPlans: [PLAN_HR],
        tier: 'suboptimal',
        feedback:
          'Nazwa pasuje do zawartości (dokumenty HR), ale błędna nazwa firmy („B&O” zamiast „O&L”) może zaalarmować użytkownika lub analityka.'
      },
      {
        id: 'vol_new_disk',
        label: 'NOWY DYSK',
        tier: 'suboptimal',
        feedback:
          'Zbyt ogólna nazwa nie wzmacnia przynęty (na pendrive\'ie są zdjęcia z imprezy) i może budzić obojętność.',
        byPlan: {
          [PLAN_HR]: {
            tier: 'suboptimal',
            feedback:
              'Zbyt ogólna nazwa nie wzmacnia przynęty (na pendrive\'ie są dokumenty HR o zwolnieniach) i może budzić obojętność.'
          }
        }
      }
    ]
  },
  signature: {
    decisionNum: 4,
    question: 'WYBIERZ PODPIS NA KOPERCIE',
    confirmLabel: 'WYSUŃ PAMIĘĆ USB',
    task: 'WYBIERZ PODPIS, KTÓRY ZNAJDZIE SIĘ NA KOPERCIE.',
    // Poziomy bazowe: plan zdjęć z imprezy. Przy planie HR (`byPlan`) pendrive zawiera dokumenty o zwolnieniach,
    // więc oceniamy podpis względem tego, co ofiara faktycznie zobaczy po otwarciu koperty (M3-06).
    options: [
      {
        id: 'env_afterparty',
        label: 'ZDJĘCIA Z AFTERPARTY O&L COMPANY!',
        tier: 'ideal',
        feedback:
          'Precyzyjnie nawiązuje do właściwej nazwy koncernu i nieformalnego charakteru imprezy, wzbudzając maksymalne zaufanie i motywację do natychmiastowego otwarcia.',
        byPlan: {
          [PLAN_HR]: {
            tier: 'critical',
            feedback:
              'Na kopercie obiecano zdjęcia z afterparty, a na pendrive\'ie są dokumenty HR o zwolnieniach. Ofiara otwiera archiwum, widzi coś innego niż zapowiedziano, uznaje nośnik za podejrzany i oddaje kopertę do ochrony.'
          }
        }
      },
      {
        id: 'env_bo',
        label: 'PENDRIVE ZE ZDJĘCIAMI B&O COMPANY',
        tier: 'suboptimal',
        feedback:
          'Błędna nazwa firmy („B&O” zamiast „O&L”) wprowadza dysonans i może skłonić ofiarę do zignorowania nośnika jako cudzej własności.',
        byPlan: {
          [PLAN_HR]: {
            tier: 'critical',
            feedback:
              'Podpis obiecuje zdjęcia (w dodatku z błędną nazwą firmy), a na pendrive\'ie są dokumenty HR o zwolnieniach. Ofiara otwiera archiwum, widzi coś innego niż zapowiedziano i oddaje kopertę do ochrony.'
          }
        }
      },
      {
        id: 'env_lost_docs',
        label: 'ZGUBIONE DOKUMENTY',
        tier: 'critical',
        feedback:
          'Podpis obiecuje dokumenty, a na pendrive\'ie są zdjęcia z imprezy. Ofiara otwiera archiwum, widzi coś innego niż zapowiedziano i oddaje kopertę do ochrony.',
        byPlan: {
          [PLAN_HR]: {
            tier: 'suboptimal',
            feedback:
              'Podpis pasuje do zawartości (na pendrive\'ie są dokumenty HR), ale jest ogólny i nie budzi lęku o zwolnienia. Junior może uznać, że to cudza pomyłka, i odnieść kopertę do kadr albo ochrony zamiast ją otworzyć.'
          }
        }
      },
      {
        id: 'env_termination',
        label: 'WYPOWIEDZENIE UMOWY',
        tier: 'critical',
        feedback:
          'Podpis obiecuje wypowiedzenie umowy, a na pendrive\'ie są zdjęcia z imprezy. Ofiara otwiera archiwum, widzi coś innego niż zapowiedziano i oddaje kopertę do ochrony.',
        byPlan: {
          [PLAN_HR]: {
            tier: 'ideal',
            feedback:
              'Podpis zapowiada wypowiedzenie umowy i zgadza się z zawartością (dokumenty HR o zwolnieniach). Strach o własne stanowisko skłania do natychmiastowego otwarcia pendrive\'a.'
          }
        }
      }
    ]
  },
  reportLabels: { volume: 'NAZWA DYSKU', signature: 'PODPIS' },
  successMessage: 'PENDRIVE GOTOWY. WYSUNIĘTO PAMIĘĆ USB.'
};

// ---------------------------------------------------------------------------
// ETAP 4: //DRON: CONDOR MIT63 — D5 adres domu ofiary, D6 samochód na parkingu
// Opcje decyzji powstają z listy mapy i parkingu (jedno źródło, `tier` w jednym miejscu).
// ---------------------------------------------------------------------------

const droneMapLocations: DroneMapLocation[] = [
  { id: 'loc_1', number: 1, address: 'OŁAWSKA 51B', district: 'NADODRZE', x: 60, y: 16, tier: 'critical' },
  { id: 'loc_2', number: 2, address: 'DRZYMAŁY 38D', district: 'PILCZYCE', x: 18, y: 24, tier: 'critical' },
  { id: 'loc_3', number: 3, address: 'WYSTAWOWA 23A', district: 'ZALESIE', x: 82, y: 55, tier: 'critical' },
  { id: 'loc_4', number: 4, address: 'OŁTASZYŃSKA 92C', district: 'PARTYNICE', x: 28, y: 78, tier: 'ideal' }
];

// 8 aut w dwóch rzędach po 4: 5 z dokumentu + 3 łudząco podobne do auta ofiary (opis BM ma mieć znaczenie).
const droneParkingCars: DroneCar[] = [
  { id: 'car_suv', desc: 'CIEMNY SUV', shape: 'suv', body: '#1f2937', roof: '#1f2937', tier: 'critical' },
  { id: 'car_white_sedan', desc: 'BIAŁY SEDAN Z BIAŁYM DACHEM', shape: 'sedan', body: '#f8fafc', roof: '#f8fafc', tier: 'critical' },
  { id: 'car_target', desc: 'BIAŁY SAMOCHÓD Z CZERWONYM DACHEM', shape: 'hatchback', body: '#f8fafc', roof: '#dc2626', tier: 'ideal' },
  { id: 'car_green_hatch', desc: 'ZIELONY HATCHBACK', shape: 'hatchback', body: '#15803d', roof: '#15803d', tier: 'critical' },
  { id: 'car_silver_sedan', desc: 'SREBRNY SEDAN', shape: 'sedan', body: '#94a3b8', roof: '#94a3b8', tier: 'critical' },
  { id: 'car_red_hatch', desc: 'CZERWONY HATCHBACK Z BIAŁYM DACHEM', shape: 'hatchback', body: '#dc2626', roof: '#f8fafc', tier: 'critical' },
  { id: 'car_orange_van', desc: 'POMARAŃCZOWY VAN', shape: 'van', body: '#f97316', roof: '#f97316', tier: 'critical' },
  { id: 'car_black_wagon', desc: 'CZARNE KOMBI', shape: 'wagon', body: '#0f172a', roof: '#0f172a', tier: 'critical' }
];

const ADDRESS_FEEDBACK = {
  ideal: 'Prawidłowy adres domowy Mateusza Klimowicza przekazany wcześniej przez mentora w wywiadzie operacyjnym.',
  // Zły adres to nieodwracalna porażka (nikt nas nie wykrył, ale koperta nie trafi do ofiary): critical z własnym tytułem.
  wrong: 'Dron zostawił kopertę pod adresem obcych ludzi w innej dzielnicy Wrocławia; nośnik nigdy nie trafi do wytypowanej ofiary, a operacja kończy się niepowodzeniem.',
  publicPlace:
    'Dron poleciał w rejon obiektów użyteczności publicznej (Hala Stulecia): koperta trafia do osób trzecich, nie do wytypowanej ofiary, a operacja kończy się niepowodzeniem.'
};

const ADDRESS_FAIL_TITLE = 'KOPERTA POD ZŁYM ADRESEM';

/** Wyjaśnienie na ekranie porażki D5: gdzie trafiła koperta i skąd gracz znał prawidłowy adres (bez jego zdradzania). */
const addressFailText = (loc: DroneMapLocation): string =>
  `Dron zostawił kopertę przy adresie ${loc.address} (${loc.district}). To nie jest dom Mateusza, więc nośnik nigdy do niego nie trafi, a operacji nie da się już uratować. Adres ofiary podał Ci BYTE_MASTER w rozmowie.`;

/** Opcja D5 dla pinu na mapie: poziom pochodzi z listy lokalizacji, teksty porażki z jednego miejsca. */
const addressOption = (l: DroneMapLocation) => ({
  id: l.id,
  label: l.address,
  desc: l.district,
  tier: l.tier,
  feedback:
    l.tier === 'ideal' ? ADDRESS_FEEDBACK.ideal : l.id === 'loc_3' ? ADDRESS_FEEDBACK.publicPlace : ADDRESS_FEEDBACK.wrong,
  ...(l.tier === 'critical' ? { failTitle: ADDRESS_FAIL_TITLE, failText: addressFailText(l) } : {})
});

const CAR_FEEDBACK = {
  ideal: 'Koperta zostaje precyzyjnie umieszczona na samochodzie Mateusza, gwarantując jej odnalezienie przed wyjazdem do biura.',
  // Złe auto to nieodwracalna porażka: koperta u przypadkowego sąsiada, nośnik nie trafi do Mateusza.
  wrong:
    'Koperta trafiła do przypadkowego sąsiada: nośnik nie dotrze do Mateusza i biura O&L Company, a podejrzana przesyłka może zostać zgłoszona.',
  asphalt:
    'Koperta leży na ziemi między miejscami parkingowymi, a nie na aucie Mateusza. Mateusz może ją zauważyć i podnieść, ale równie dobrze może ją ominąć, więc powodzenie operacji jest niepewne.'
};

const CAR_FAIL_TITLE = 'KOPERTA U PRZYPADKOWEGO SĄSIADA';

/** Wyjaśnienie na ekranie porażki D6: które auto dostało kopertę (opis z etykiety), bez wskazywania właściwego. */
const carFailText = (car: DroneCar): string =>
  `Dron zostawił kopertę na aucie: ${car.desc.toLowerCase()}. To nie jest samochód Mateusza. Koperta trafiła do przypadkowego sąsiada, więc nośnik nie dotrze do biura O&L Company, a operacji nie da się już uratować. Opis auta ofiary podał Ci BYTE_MASTER w rozmowie.`;

const droneAsphalt = {
  id: 'asphalt',
  label: 'PUSTY ASFALT MIĘDZY MIEJSCAMI PARKINGOWYMI',
  tier: 'suboptimal' as ChoiceOutcome
};

export const droneConfig: DroneConfig = {
  title: '//DRON: CONDOR MIT63',
  subtitle: 'DOSTARCZENIE KOPERTY POD DOM I SAMOCHÓD OFIARY',
  droneStats: {
    model: 'CONDOR MIT63',
    video: 'STAŁE PRZEKAZYWANIE WIDEO',
    speed: 'MAKSYMALNA PRĘDKOŚĆ 25 KM/H',
    connection: 'POŁĄCZENIE Z ODBIORNIKIEM HAKERA'
  },
  statuses: {
    idle: 'STOI W POKOJU HAKERA',
    awaitingPayload: 'CZEKA NA ŁADUNEK',
    awaitingCoordinates: 'CZEKA NA WSPÓŁRZĘDNE',
    flying: 'LECI Z WYSOKĄ PRĘDKOŚCIĄ'
  },
  texts: {
    activateLabel: 'AKTYWUJ',
    prepareLabel: 'PRZYGOTUJ DO WYLOTU',
    confirmLabel: 'ZATWIERDŹ',
    cameraLabel: 'URUCHOM KAMERĘ',
    dropLabel: 'ZRZUĆ ŁADUNEK',
    loaders: {
      activate: 'POŁĄCZENIE Z ODBIORNIKIEM HAKERA…',
      camera: 'STAŁE PRZEKAZYWANIE WIDEO…',
      drop: 'ZRZUĆ ŁADUNEK…'
    },
    payloadCaption: "KOPERTA Z PENDRIVE'M",
    payloadDragHint: 'PRZECIĄGNIJ KOPERTĘ NA DRONA',
    payloadAttaching: 'PODWIESZANIE ŁADUNKU…',
    flightCaption: 'LOT DO CELU…',
    tasks: {
      activate: 'AKTYWUJ DRONA.',
      payload: 'PRZYGOTUJ DRONA DO WYLOTU I PODWIEŚ ŁADUNEK: PRZECIĄGNIJ KOPERTĘ NA DRONA.',
      map: 'WSKAŻ NA PLANIE MIASTA ADRES, POD KTÓRY LECI DRON.',
      camera: 'URUCHOM KAMERĘ DRONA.',
      aim: 'NAPROWADŹ CELOWNIK NA WŁAŚCIWY SAMOCHÓD I ZRZUĆ ŁADUNEK.',
      done: 'ŁADUNEK DOSTARCZONY.'
    }
  },
  hud: { batteryPercent: 48, transmissionLabel: 'TRANSMISJA' },
  address: {
    decisionNum: 5,
    question: 'WSKAŻ DRONOWI ADRES DOMU OFIARY',
    options: droneMapLocations.map(addressOption)
  },
  car: {
    decisionNum: 6,
    question: "WYBIERZ MIEJSCE NA PARKINGU, GDZIE OFIARA NA PEWNO ZNAJDZIE KOPERTĘ Z PENDRIVE'M",
    options: [
      ...droneParkingCars.map((c) => ({
        id: c.id,
        label: c.desc,
        // Odpowiedź w raporcie dla auta ofiary jest dłuższa niż opis na scenie.
        ...(c.tier === 'ideal' ? { reportAnswer: 'BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY' } : {}),
        tier: c.tier,
        feedback: c.tier === 'ideal' ? CAR_FEEDBACK.ideal : CAR_FEEDBACK.wrong,
        ...(c.tier === 'critical' ? { failTitle: CAR_FAIL_TITLE, failText: carFailText(c) } : {})
      })),
      { id: droneAsphalt.id, label: droneAsphalt.label, tier: droneAsphalt.tier, feedback: CAR_FEEDBACK.asphalt }
    ]
  },
  mapLocations: droneMapLocations,
  parkingCars: droneParkingCars,
  asphalt: droneAsphalt,
  images: {
    cityMap: { group: 'drone', name: 'city_map' },
    parking: { group: 'drone', name: 'parking' }
  },
  successDrop: "POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'M. DRON WRACA DO POKOJU HAKERA",
  usbFallback: USB_FALLBACK
};

// ---------------------------------------------------------------------------
// ETAP 5: //WIRUS: RAT (C2) — sesja (finał bez oceny)
// ---------------------------------------------------------------------------

export const ratSessionConfig: RatSessionConfig = {
  subtitle: 'SESJA ZDALNA NA KOMPUTERZE OFIARY',
  host: { name: 'MATEUSZ_BIURO_O&L', ip: '161.185.160.93' },
  usbFallback: USB_FALLBACK,
  alert: {
    label: '//MALWARE TYPU RAT: REMOTE ACCESS TROJAN',
    status: 'PENDRIVE ZOSTAŁ PODŁĄCZONY. MALWARE ZOSTAŁ AKTYWOWANY',
    hostLabel: 'NAZWA KOMPUTERA:',
    ipLabel: 'AKTYWOWANE NA IP:',
    archiveLabel: 'ARCHIWUM NA PENDRIVIE:',
    volumeLabel: 'NAZWA DYSKU:',
    takeoverLabel: 'PRZEJMIJ PULPIT OFIARY'
  },
  desktop: {
    banner: 'KONTROLUJESZ PULPIT OFIARY',
    icons: [
      { id: 'trash', label: 'KOSZ' },
      { id: 'this_pc', label: 'TEN KOMPUTER' },
      { id: 'freevolt', label: 'FREEVOLT', warning: true }
    ],
    wallpaper: { group: 'rat', name: 'victim_wallpaper' },
    wallpaperAlt: 'tapeta pulpitu ofiary'
  },
  files: {
    folderTitle: 'FREEVOLT',
    hackerDesktopLabel: 'PULPIT HAKERA',
    items: [
      { id: 'infrastructure', name: 'FREEVOLT_OPIS_INFRASTRUKTURY.PDF', kind: 'pdf' },
      { id: 'documentation', name: 'FREEVOLT_DOKUMENTACJA_CZ2.PDF', kind: 'pdf' },
      { id: 'network_scheme', name: 'FREEVOLT_SCHEMAT_SIECI.PDF', kind: 'pdf' },
      { id: 'contracts', name: 'FREEVOLT_UMOWY_DOSTAWCOW.XLSX', kind: 'xlsx' }
    ],
    copyingLabel: 'KOPIOWANIE…'
  },
  network: {
    nodes: [
      { id: 'hacker', label: 'HAKER', kind: 'hacker' },
      { id: 'relay', label: 'WĘZEŁ POŚREDNI', kind: 'relay' },
      { id: 'pc_mateusz', label: 'MATEUSZ_BIURO_O&L', kind: 'infected' },
      { id: 'pc_02', label: 'STACJA-02', kind: 'infected' },
      { id: 'pc_03', label: 'STACJA-03', kind: 'infected' }
    ],
    headline: 'UZYSKAŁEŚ ZDALNY DOSTĘP DO SIECI O&L COMPANY',
    endLabel: 'PODSUMOWANIE ZADANIA'
  },
  loaders: {
    desktop: 'PRZEJMOWANIE PULPITU OFIARY…',
    network: 'ZDALNY DOSTĘP DO SIECI…'
  },
  tasks: {
    alert: 'PRZEJMIJ PULPIT STACJI OFIARY.',
    desktop: 'OTWÓRZ FOLDER FREEVOLT.',
    files: 'PRZECIĄGNIJ PLIKI FREEVOLT NA SWÓJ PULPIT.',
    network: 'SESJA AKTYWNA. PRZEJDŹ DO PODSUMOWANIA ZADANIA.'
  }
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
        { from: 'byte_master', text: 'ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD' }
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
        { from: 'byte_master', text: 'DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE' },
        { from: 'byte_master', text: 'WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ' },
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
    decisions: [4],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm3_reply_pendrive_1',
          label:
            'GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI'
        },
        {
          from: 'player',
          id: 'm3_reply_pendrive_2',
          label: 'MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?'
        },
        { from: 'byte_master', text: 'JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW, POLSKA (PL)' },
        {
          from: 'byte_master',
          text: 'DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA. WTEDY W PRACY NA PEWNO SPRAWDZI ZAWARTOŚĆ'
        },
        { from: 'player', id: 'm3_reply_drone_wait', label: 'JASNE, SŁYSZYMY SIĘ ZA KILKA GODZIN' },
        // Noc: zegar leci 22:15 -> 06:02 (godzina startu to odchylenie O9, dokument podaje tylko „do poranka”).
        { from: 'time_jump', clockFrom: '22:15', clock: '06:02', label: 'DO PORANKA…' },
        { from: 'byte_master', text: 'JUŻ CZAS. DRON GOTOWY DO WYLOTU?' },
        {
          from: 'player',
          id: 'm3_reply_drone_ready',
          label: "JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE'A"
        }
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
    decisions: [5, 6],
    // Adres i opis auta od mentora trafiają do logu czatu przy pierwszym otwarciu //DRON (bez obrazka-wzorca;
    // „PRZESYŁAM CI ZDJĘCIE” pominięte). Adres jest powtórzony w pierwszej kwestii (krótszej niż w VR, bez „PRZEWIŃ CZAT”),
    // bo przy 1366×768 oryginalna wiadomość z adresem leży poza widocznym fragmentem czatu: obie kwestie mają mieścić się razem.
    openingConversation: [
      { from: 'byte_master', text: 'WSKAŻ DOM MATEUSZA NA MAPIE. PRZYPOMINAM ADRES: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW' },
      { from: 'byte_master', text: 'GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM.' }
    ],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm3_reply_drop',
          label: 'OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA'
        },
        // Poranek: 06:02 -> 08:12 (godziny pracy biura).
        { from: 'time_jump', clockFrom: '06:02', clock: '08:12', label: 'DO GODZIN PRACY BIURA…' }
      ],
      unlockIcons: ['rat_session_unlocked', 'rat_session'],
      badges: { rat_session: 1, chat: 1 },
      highlightTile: 'rat_session',
      incomingCall: { appId: 'rat_session', label: 'MALWARE ZOSTAŁ AKTYWOWANY' },
      sound: 'alarm'
    }
  },
  {
    id: 'rat_session',
    appId: 'rat_session',
    decisions: [],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm3_reply_rat',
          label:
            'MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?'
        },
        {
          from: 'byte_master',
          text: 'WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI'
        },
        { from: 'byte_master', text: 'JESTEŚMY W KONTAKCIE!' }
      ],
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success'
    }
  }
];
