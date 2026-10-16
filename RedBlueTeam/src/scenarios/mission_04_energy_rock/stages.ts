// Etapy i dane klocków Misji 4 (Energy Rock) — wzorzec B.
// Treść (teksty, poziomy, feedback) mieszka tutaj, nie w kodzie minigry.
// Zob. docs/scenario-engine.md, sekcje 1, 5–6.

import type { StageDefinition, DialogueTreeConfig } from '../../engine/types/mission';
import type {
  VirusConfig,
  BuilderConfig,
  MailConfig,
  VpnConfig,
  ExfiltrationConfig
} from './minigames/types';

// ---------------------------------------------------------------------------
// DANE KLOCKÓW / MINIGIER (kluczowane identyfikatorem kafelka pulpitu)
// ---------------------------------------------------------------------------

/** D1: dobór złośliwego oprogramowania (karty + skaner sygnatury). */
export const virusConfig: VirusConfig = {
  decisionNum: 1,
  question: 'Wybierz odpowiedniego wirusa:',
  scannerCells: 32,
  options: [
    {
      id: 'rat',
      label: 'RAT: REMOTE ACCESS TROJAN',
      desc: 'POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY',
      tags: ['TROJAN', 'CICHY NASŁUCH', 'REMOTE DESKTOP'],
      tier: 'suboptimal',
      feedback:
        'RAT umożliwia cichy dostęp, lecz nie paraliżuje infrastruktury firmy ani nie stwarza natychmiastowej przykrywki pod żądanie okupu.'
    },
    {
      id: 'ransomware',
      label: 'RANSOMWARE',
      desc: 'MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ',
      tags: ['SZYFROWANIE', 'PARALIŻ SIECI', 'DOUBLE EXTORTION'],
      tier: 'ideal',
      feedback:
        'Zgodnie z planem operacji paraliżuje serwery ofiary, dając doskonały kamuflaż pod kradzież technologii Freevolt pod płaszczykiem szantażu finansowego.'
    },
    {
      id: 'keylogger',
      label: 'KEYLOGGER',
      desc: 'POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
      tags: ['SNIFFER', 'PRZECHWYTYWANIE ZNAKÓW', 'PASYWNY'],
      tier: 'critical',
      feedback:
        'Zupełnie chybiony wektor. Zbieranie haseł trwa tygodniami i nie pozwala na zablokowanie zasobów Energy Rock.'
    }
  ]
};

/** D2–D4: builder ransomware (hasło, komponenty żądania, kolor). */
export const builderConfig: BuilderConfig = {
  password: {
    decisionNum: 2,
    question: 'Siła wygenerowanego hasła:',
    targetLength: 24,
    minSafeLength: 14,
    safeTags: ['DUŻE LITERY A-Z', 'MAŁE LITERY A-Z', 'CYFRY 0-9', 'ZNAKI SPECJALNE (!@#$%)'],
    forbiddenTags: ['ZNAKI NARODOWE (np. Ą, Ę...)', 'BIAŁE ZNAKI (np. SPACJA)'],
    feedback: {
      ideal:
        'Maksymalna entropia klucza (24 znaki, pełny bezpieczny zestaw). Zespoły obronne nie mają szans na złamanie hasła brute-forcem.',
      suboptimal:
        'Hasło silne, lecz w sprzyjających warunkach (np. klastry GPU) czas łamania ulega znacznemu skróceniu.',
      critical:
        'Hasło podatne na szybki atak słownikowy LUB błąd wykonania skryptu szyfrującego w systemie ofiary (znaki narodowe / spacje).'
    }
  },
  components: {
    decisionNum: 3,
    question: 'Skomponuj komunikat żądania okupu:',
    titleOptions: [
      {
        id: 'title_encrypted',
        label: 'TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!',
        tier: 'ideal',
        feedback: 'Jasny, stanowczy komunikat natychmiast sygnalizuje ofierze powagę sytuacji.'
      },
      {
        id: 'title_casual',
        label: 'CZEKAM NA BITCOINY!',
        tier: 'suboptimal',
        feedback: 'Niepoważny ton osłabia presję i wiarygodność profesjonalnego ataku.'
      }
    ],
    countdownOptions: [
      {
        id: 'time_realistic',
        label: 'POZOSTAŁY CZAS: 00:30:00:00',
        tier: 'ideal',
        feedback: 'Realny limit czasu buduje presję, a jednocześnie pozwala ofierze zebrać okup.'
      },
      {
        id: 'time_30s',
        label: 'POZOSTAŁY CZAS: 00:00:30:00',
        tier: 'suboptimal',
        feedback: '30 sekund to czas nierealistyczny — uniemożliwia kontakt i zapłatę, niszcząc cel szantażu.'
      }
    ],
    staticParts: {
      amount: '$ 200 000',
      wallet: 'XKAJI023KJDF93',
      contact: 'NAPISZ DO NAS'
    }
  },
  color: {
    decisionNum: 4,
    question: 'Wybierz kolor okna i elementów:',
    options: [
      {
        id: 'green',
        label: 'ZIELONY',
        tier: 'suboptimal',
        feedback:
          'Kolor kojarzony z poprawnością i sukcesem. Pracownicy mogą uznać komunikat za zwykłe powiadomienie IT.'
      },
      {
        id: 'white',
        label: 'BIAŁY',
        tier: 'suboptimal',
        feedback: 'Neutralny, nie budzi poczucia natychmiastowego kryzysu ani pośpiechu.'
      },
      {
        id: 'red',
        label: 'CZERWONY',
        tier: 'ideal',
        feedback:
          'Kolor alarmowy. Maksymalizuje stres psychologiczny ofiary i zmusza decydentów do pośpiechu.'
      }
    ]
  }
};

/** D5–D6: kampania spear-phishingowa (temat, treść). */
export const mailConfig: MailConfig = {
  recipient: 'rekrutacja@energyrock.com (HR Dept)',
  position: 'Analityk rynków energetycznych',
  attachment: 'CV_WILK.PDF',
  subject: {
    decisionNum: 5,
    question: 'Wybierz temat maila:',
    options: [
      {
        id: 'subj_analyst',
        label: 'ANALITYK MICHAŁ WILK',
        tier: 'suboptimal',
        feedback: 'Wskazuje stanowisko, lecz pomija kluczowy znacznik "CV", co może opóźnić otwarcie przez rekrutera.'
      },
      {
        id: 'subj_milk',
        label: 'MILK CV',
        tier: 'critical',
        feedback: 'Literówka w nazwisku (Milk zamiast Wilk), brak profesjonalizmu, wysokie ryzyko natychmiastowego odrzucenia.'
      },
      {
        id: 'subj_cv_wilk',
        label: 'CV MICHAŁ WILK',
        tier: 'ideal',
        feedback: 'Zgodny z instrukcją rekrutacyjną. Format "CV [Imię Nazwisko]" bez problemu przechodzi przez filtry HR.'
      }
    ]
  },
  body: {
    decisionNum: 6,
    question: 'Wybierz treść maila:',
    options: [
      {
        id: 'body_no_pwd',
        label: 'WARIANT A',
        text: 'Cześć.\n\nPrzesyłam CV na stanowisko analityka usług energetycznych.\n\nPozdrawiam,\nMichał Wilk',
        tier: 'suboptimal',
        feedback: 'Zbyt swobodny ton oraz brak hasła na załączniku – skanery antywirusowe bramki pocztowej mogą zneutralizować plik.'
      },
      {
        id: 'body_formal',
        label: 'WARIANT B',
        text: 'Dzień dobry.\n\nPrzesyłam CV w związku z rekrutacją na stanowisko Analityka rynków energetycznych.\nHasło do pliku: WILK.\n\nPozdrawiam,\nMichał Wilk',
        tier: 'ideal',
        feedback: 'Formalny styl biznesowy. Szyfrowanie załącznika hasłem uniemożliwia bramkom pocztowym automatyczną detekcję ładunku.'
      },
      {
        id: 'body_casual',
        label: 'WARIANT C',
        text: 'Hej.\n\nW załączniku przesyłam cv.\n\nPozdrawiam,\nMichał Wilk',
        tier: 'critical',
        feedback: 'Niedopuszczalny ton w korespondencji do sektora infrastruktury krytycznej. Wzbudza natychmiastowe podejrzenia.'
      }
    ]
  }
};

/** D7–D8: VPN (dopasowanie IP) + wybór nadawcy. */
export const vpnConfig: VpnConfig = {
  vpn: {
    decisionNum: 7,
    question: 'Ukrycie tożsamości / dopasowanie IP (VPN):',
    targetIp: '109.43.200.124',
    initialIp: '106.55.202.120',
    feedback: {
      ideal: 'Adres IP tunelu zgodny z podsiecią Energy Rock — omija reguły geolokalizacyjne filtrów poczty.',
      critical: 'Nieprawidłowy routing IP wywołał natychmiastowy alarm geolokalizacyjny w systemie ochrony poczty Energy Rock!'
    }
  },
  sender: {
    decisionNum: 8,
    question: 'Wybór adresu nadawcy:',
    options: [
      {
        id: 'sender_alex',
        label: 'alex@priv.com',
        tier: 'suboptimal',
        feedback: 'Niezgodność adresu nadawcy z podpisem pod mailem ("Michał Wilk"), co może zaalarmować czujnego pracownika.'
      },
      {
        id: 'sender_spam',
        label: 'newrapgood@commercial.biz',
        tier: 'critical',
        feedback: 'Domena o fatalnej reputacji, brak rekordów SPF/DKIM powiązanych z kandydatem. Wiadomość trafia do spamu.'
      },
      {
        id: 'sender_wilk',
        label: 'm.wilk@priv.com',
        tier: 'ideal',
        feedback: 'Pełna spójność tożsamości nadawcy z nazwiskiem kandydata w treści i załączniku. Nie budzi podejrzeń rekrutera.'
      }
    ]
  }
};

/** D9: szyfrowanie sieci + eksfiltracja plików Freevolt. */
export const exfiltrationConfig: ExfiltrationConfig = {
  decisionNum: 9,
  question: 'Wybór plików do kradzieży:',
  targetHost: 'ENERGY_ROCK_01_PC',
  targetIp: '151.89.159.52',
  requiredFreevolt: 3,
  files: [
    { name: 'WYPOWIEDZENIE.PDF', type: 'decoy', size: '1.2 MB' },
    { name: 'FREEVOLT_SCHEMAT.PDF', type: 'freevolt', size: '28.6 MB' },
    { name: 'MAREK.JPG', type: 'decoy', size: '4.8 MB' },
    { name: 'SEKRET.TXT', type: 'honeypot', size: '12 KB' },
    { name: 'ENERGIA_FVOLT.KCF', type: 'freevolt', size: '8.4 MB' },
    { name: 'KONTRAKTY.XCF', type: 'decoy', size: '19.1 MB' },
    { name: 'WAZNE_DANE.DOCX', type: 'honeypot', size: '45 KB' },
    { name: 'FVOLT_TECH.DOCX', type: 'freevolt', size: '14.2 MB' },
    { name: 'MATERIALY.TXT', type: 'decoy', size: '240 KB' },
    { name: 'UMOWA2022.PDF', type: 'decoy', size: '2.1 MB' }
  ],
  feedback: {
    ideal: 'Pobrano kompletny zestaw dokumentacji technologii Freevolt (3 pliki) bez pozostawiania śladów w logach.',
    suboptimal: 'Pobrano pliki Freevolt, lecz także zbędne pliki decoy — niepotrzebny transfer zwiększa ryzyko detekcji.',
    criticalHoneypot: 'Pobrano plik-pułapkę (honeypot), co uruchomiło procedurę automatycznego odcięcia transferu przez SOC!',
    criticalIncomplete: 'Główny cel zlecenia nie został osiągnięty — brakuje kluczowych plików technologii Freevolt.'
  }
};

/** D10: negocjacje z Szefem IT (klocek DialogueTree, tryb agregujący). */
export const negotiationBlock: DialogueTreeConfig = {
  respondent: 'SZEF IT ENERGY ROCK',
  decisionNum: 10,
  question: 'Negocjacje z ofiarą:',
  closingMessage: 'ROZUMIEM... PRZYGOTOWUJEMY BITCOINY. TYLKO NIE NISZCZCIE NASZYCH BAZ.',
  nodes: [
    {
      id: 'neg_1',
      incoming: 'ROZWIĄZUJEMY PROBLEM RANSOMWARE! ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE',
      options: [
        {
          id: 'aggression',
          label: 'NIE BOJĘ SIĘ POLICJI',
          tier: 'suboptimal',
          feedback: 'Pusta agresja bez argumentów technicznych.',
          nextNode: 'neg_2'
        },
        {
          id: 'surrender',
          label: 'OKEJ, JUŻ WAM NIE PRZESZKADZAM',
          tier: 'critical',
          feedback: 'Kapitulacja i natychmiastowa rezygnacja z pozycji negocjacyjnej.'
        },
        {
          id: 'firm_stance',
          label: 'ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ',
          tier: 'ideal',
          feedback: 'Rzeczowy argument techniczny paraliżujący decyzyjność ofiary.',
          nextNode: 'neg_2'
        }
      ]
    },
    {
      id: 'neg_2',
      incoming: 'CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?',
      options: [
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
        },
        {
          id: 'btc_demand',
          label: 'TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY',
          tier: 'ideal',
          feedback: 'Podtrzymanie wiarygodnej przykrywki finansowej.',
          nextNode: 'neg_3'
        }
      ]
    },
    {
      id: 'neg_3',
      incoming: 'POTRZEBUJEMY CZASU NA ICH ZDOBYCIE',
      options: [
        {
          id: 'give_days',
          label: 'DOBRZE, DAM WAM KILKA DNI',
          tier: 'critical',
          feedback: 'Zbyt długi czas pozwala ofierze odzyskać dane z kopii zapasowych.'
        },
        {
          id: 'deadline_3h',
          label: 'MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA',
          tier: 'ideal',
          feedback: 'Twardy limit czasu uniemożliwia ofierze procedury przywracania danych.'
        }
      ]
    }
  ]
};

/** Dane klocków M4, kluczowane identyfikatorem kafelka pulpitu. */
export const mission4Blocks: Record<string, unknown> = {
  virus_database: virusConfig,
  ransomware_builder: builderConfig,
  mail: mailConfig,
  vpn_app: vpnConfig,
  victim_workstation: exfiltrationConfig,
  negotiation: negotiationBlock
};

// ---------------------------------------------------------------------------
// ETAPY MISJI — przebieg przez completeStage (wzorzec B)
// ---------------------------------------------------------------------------

export const mission4Stages: StageDefinition[] = [
  {
    id: 'virus_database',
    appId: 'virus_database',
    decisions: [1],
    completion: {
      unlockIcons: ['ransomware_compiled', 'ransomware_builder'],
      badges: { ransomware_builder: 1, chat: 1 },
      highlightTile: 'ransomware_builder',
      sound: 'notification',
      byteMasterMessages: [
        'DOBRY WYBÓR. RANSOMWARE SPARALIŻUJE SERWERY ENERGY ROCK I DA NAM IDEALNĄ PRZYKRYWKĘ POD KRADZIEŻ DOKUMENTACJI FREEVOLT.',
        'TERAZ SKONFIGURUJ ŁADUNEK — KLUCZ SZYFRUJĄCY, KOMUNIKAT OKUPU I JEGO WYGLĄD. OTWÓRZ KREATOR RANSOMWARE NA PULPICIE.'
      ],
      openLink: { label: 'OTWÓRZ KREATOR RANSOMWARE', appId: 'ransomware_builder' },
      playerReply: { id: 'm4_reply_virus', label: 'JASNE. ZABIERAM SIĘ ZA KONFIGURACJĘ WIRUSA.' }
    }
  },
  {
    id: 'ransomware_builder',
    appId: 'ransomware_builder',
    decisions: [2, 3, 4],
    completion: {
      unlockIcons: ['mail_unlocked', 'mail'],
      badges: { mail: 1, chat: 1 },
      highlightTile: 'mail',
      sound: 'notification',
      byteMasterMessages: [
        'ŁADUNEK GOTOWY. ZNALAZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ TERAZ CV NA STANOWISKO „ANALITYK RYNKÓW ENERGETYCZNYCH".',
        'PRZYGOTUJ SPREPAROWANE CV W KAMPANII SPEAR-PHISHINGOWEJ. WŁĄCZ APLIKACJĘ MAILA.'
      ],
      openLink: { label: 'OTWÓRZ POCZTĘ //MAIL', appId: 'mail' },
      playerReply: { id: 'm4_reply_builder', label: 'MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU MAILA Z CV?' }
    }
  },
  {
    id: 'mail',
    appId: 'mail',
    decisions: [5, 6],
    completion: {
      unlockIcons: ['vpn_unlocked', 'vpn_app'],
      badges: { vpn_app: 1, chat: 1 },
      highlightTile: 'vpn_app',
      sound: 'notification',
      byteMasterMessages: [
        'MAIL PRZYGOTOWANY ZE ZŁOŚLIWYM ZAŁĄCZNIKIEM. NIE MOŻEMY GO WYSŁAĆ Z NASZEGO WĘZŁA — BRAMKI ENERGY ROCK WYKRYJĄ ANOMALIĘ GEOLOKALIZACYJNĄ.',
        'SKONFIGURUJ TUNEL VPN I DOPASUJ PODSIEĆ. OTWÓRZ KLIENTA VPN.'
      ],
      openLink: { label: 'OTWÓRZ KLIENTA VPN', appId: 'vpn_app' },
      playerReply: { id: 'm4_reply_mail', label: 'OKEJ, MASKUJĘ IP I WYBIERAM NADAWCĘ.' }
    }
  },
  {
    id: 'vpn_app',
    appId: 'vpn_app',
    decisions: [7, 8],
    completion: {
      unlockIcons: ['victim_workstation_unlocked', 'victim_workstation'],
      badges: { victim_workstation: 1, chat: 1 },
      highlightTile: 'victim_workstation',
      sound: 'alarm',
      byteMasterMessages: [
        'TRANSMISJA ZAKOŃCZONA SUKCESEM! REKRUTER POBRAŁ CV, WPISAŁ HASŁO I OTWORZYŁ PLIK. MAMY AKTYWNĄ SESJĘ W SIECI ENERGY ROCK!',
        'WEJDŹ NA STACJĘ OFIARY: NAJPIERW URUCHOM SZYFROWANIE, POTEM WYCIĄGNIJ DOKUMENTACJĘ FREEVOLT.'
      ],
      openLink: { label: 'PRZEJDŹ DO STACJI OFIARY', appId: 'victim_workstation' },
      playerReply: { id: 'm4_reply_vpn', label: 'WCHODZĘ NA STACJĘ. SZYFRUJĘ I POBIERAM PLIKI.' }
    }
  },
  {
    id: 'victim_workstation',
    appId: 'victim_workstation',
    decisions: [9],
    completion: {
      unlockIcons: ['negotiation_unlocked', 'negotiation'],
      badges: { negotiation: 1, chat: 1 },
      highlightTile: 'negotiation',
      sound: 'alarm',
      byteMasterMessages: [
        'ALARM W CAŁYM ENERGY ROCK! ZARZĄD PANIKUJE, A SZEF IT PRÓBUJE SKONTAKTOWAĆ SIĘ NA KANALE AWARYJNYM Z NOTATKI.',
        'OTWÓRZ KONSOLĘ NEGOCJACJI. TRZYMAJ SIĘ ŻĄDANIA BITCOINÓW I NARZUĆ TWARDY LIMIT CZASU.'
      ],
      openLink: { label: 'OTWÓRZ KONSOLĘ NEGOCJACJI', appId: 'negotiation' },
      playerReply: { id: 'm4_reply_workstation', label: 'MAM PLIKI. ODBIERAM POŁĄCZENIE OD SZEFA IT.' }
    }
  },
  {
    id: 'negotiation',
    appId: 'negotiation',
    decisions: [10],
    completion: {
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success',
      byteMasterMessages: [
        'PERFEKCYJNA ROBOTA! DOKUMENTACJA FREEVOLT JEST NASZA, A ENERGY ROCK KUPIŁO PRZYKRYWKĘ ZWYKŁEGO ATAKU DLA PIENIĘDZY.',
        'OTWÓRZ RAPORT KOŃCOWY, ABY ZAMKNĄĆ OPERACJĘ I PRZESŁAĆ WYNIK DO SCORM.'
      ],
      openLink: { label: 'OTWÓRZ PODSUMOWANIE MISJI', appId: 'debrief_app' },
      playerReply: { id: 'm4_reply_negotiation', label: 'CZY TO ZNACZY, ŻE W KOŃCU PRZYJMIECIE MNIE DO DARKSUN?' }
    }
  }
];
