// Etapy i dane klocków Misji 2 (CarbonFlow) — wzorzec B.
// Treść (teksty, poziomy, feedback) mieszka tutaj, nie w kodzie minigry.
// Zob. docs/scenario-engine.md, sekcje 1, 5–6, 10.

import type { StageDefinition } from '../../engine/types/mission';
import type {
  PhishingCampaignConfig,
  VpnConfig,
  WormBuilderConfig,
  PhishingDispatchConfig,
  BotnetMonitorConfig
} from './minigames/types';

// ---------------------------------------------------------------------------
// WSPÓLNE STAŁE (jedno źródło prawdy dla danych powtarzanych w kilku klockach)
// ---------------------------------------------------------------------------

/** Domena ofiary i liczba adresów na liście mailingowej (//PHISHING i podgląd wysyłki). */
const TARGET_DOMAIN = 'carbonflow.com';
const MAILING_LIST_SIZE = 12;

/** Adresy IP z białej listy nadawców CarbonFlow (lista w //PHISHING, cel w //TUNEL_VPN). */
const ALLOWED_SENDER_IPS = ['82.123.192.116', '77.141.195.139'];

// ---------------------------------------------------------------------------
// DANE KLOCKÓW / MINIGIER
// ---------------------------------------------------------------------------

/** D4: Konstrukcja i modyfikacja robaka 0-day (Etap 4 - Uzbrojenie). */
export const wormBuilderConfig: WormBuilderConfig = {
  virus: {
    decisionNum: 4,
    question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
    options: [
      {
        id: 'worm',
        label: 'ROBAK',
        desc: 'Samoreplikujący się program, który rozprzestrzenia się po sieci bez udziału użytkownika.',
        tier: 'ideal',
        feedback: 'Robak samodzielnie powiela się w sieci i formuje botnet.'
      },
      {
        id: 'keylogger',
        label: 'KEYLOGGER',
        desc: 'Program rejestrujący wszystkie naciśnięcia klawiszy na komputerze ofiary.',
        tier: 'suboptimal',
        feedback: 'Przechwytuje dane na jednej stacji, nie tworzy botnetu.'
      },
      {
        id: 'ransomware',
        label: 'RANSOMWARE',
        desc: 'Program szyfrujący dane na komputerze ofiary i w jej sieci, by zażądać okupu za ich odblokowanie.',
        tier: 'critical',
        feedback: 'Szyfrowanie przedwcześnie alarmuje administratorów i pali operację.'
      }
    ]
  },
  instructions: [
    { id: 'i1', code: 'SKANUJ_PORTY();', desc: 'Wyszukiwanie otwartych usług w podsieci LAN ofiary' },
    { id: 'i2', code: 'AKTYWUJ_SERWER();', desc: 'Uruchomienie nasłuchu dla poleceń C&C Darknetu' },
    { id: 'i3', code: 'ZMIEŃ_METADANE();', desc: 'Zaciemnianie nagłówków binarnych w pamięci RAM' },
    { id: 'i4', code: 'OMIJAJ_ANTYWIRUSA();', desc: 'Wstrzykiwanie kodu w zaufane procesy systemowe' },
    { id: 'i5', code: 'REPLIKUJ();', desc: 'Automatyczne rozsyłanie kopii do wykrytych węzłów' }
  ]
};

/** S03: Konfiguracja VPN (dopasowanie IP do allowlisty antyspamowej CarbonFlow - Flavor). */
export const vpnConfig: VpnConfig = {
  initialIp: '192.168.1.45',
  targetIp: ALLOWED_SENDER_IPS[0],
  allowedIps: ALLOWED_SENDER_IPS,
  feedback: {
    ideal: 'Pomyślnie dopasowano adres IP! Ruch zamaskowany i dopuszczony przez filtry CarbonFlow.',
    critical: 'Błąd: Adres IP nie znajduje się na białej liście CarbonFlow. Wiadomość zostanie odrzucona przez filtry antyspamowe!'
  }
};

/** D1–D3: Konfiguracja kampanii phishingowej: akcja, szablon, temat (Etap 1 - //PHISHING). */
export const phishingCampaignConfig: PhishingCampaignConfig = {
  action: {
    decisionNum: 1,
    question: 'WYBIERZ RODZAJ AKCJI:',
    options: [
      {
        id: 'zero_day_worm',
        label: 'WIRUS 0-DAY',
        tier: 'ideal',
        feedback:
          'Wirus 0-day bezbłędnie realizuje cel zlecenia, omijając antywirusy i tworząc sieć botnetu na serwerach ofiary.'
      },
      {
        id: 'security_training',
        label: 'SZKOLENIE Z BEZPIECZEŃSTWA IT',
        tier: 'suboptimal',
        feedback:
          'Pozorowane szkolenie nie instaluje złośliwego oprogramowania i nie paraliżuje infrastruktury zgodnie z ustaleniami z mentorem.'
      },
      {
        id: 'data_harvesting',
        label: 'ZBIERANIE WRAŻLIWYCH DANYCH',
        tier: 'critical',
        feedback:
          'Phishing nakierowany wyłącznie na kradzież poświadczeń nie infekuje maszyn robakiem i nie tworzy zasłony dymnej.'
      }
    ]
  },
  template: {
    decisionNum: 2,
    question: 'WYBIERZ SZABLON FORMULARZA:',
    options: [
      {
        id: 'poodle_forms',
        label: 'POODLE FORMS',
        desc: 'TWOJA ANKIETA | WYPEŁNIJ FORMULARZ',
        tier: 'ideal',
        feedback:
          'Profesjonalny szablon formularza ankietowego idealnie pasuje do planu wysłania fałszywej ankiety pracowniczej.'
      },
      {
        id: 'quickgram',
        label: 'Quickgram',
        desc: 'OBSERWUJ | SPRAWDŹ TO',
        tier: 'suboptimal',
        feedback:
          'Szablon sieci społecznościowej wzbudza podejrzenia w środowisku korporacyjnym.'
      },
      {
        id: 'kneenook',
        label: 'Kneenook',
        desc: 'TWÓJ POST | ZOBACZ NA KNEENOOK',
        tier: 'critical',
        feedback:
          'Szablon postu na forum jest niespójny z formatem ankiety.'
      }
    ]
  },
  topic: {
    decisionNum: 3,
    question: 'WYBIERZ TEMAT I PRZYNĘTĘ ANKIETY:',
    options: [
      {
        id: 'mandatory_integration',
        label: 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO',
        tier: 'ideal',
        feedback:
          'Przymus w połączeniu z tematem integracji tworzy idealną presję socjotechniczną.'
      },
      {
        id: 'fire_drill',
        label: 'ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH',
        tier: 'suboptimal',
        feedback:
          'Temat formalny i nudny, część pracowników odłoży wypełnienie na później.'
      },
      {
        id: 'fruit_thursday',
        label: 'ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU',
        tier: 'critical',
        feedback:
          'Błahy temat zostanie zignorowany przez większość personelu.'
      }
    ]
  },
  mailingList: {
    targetDomain: TARGET_DOMAIN,
    employeesCount: MAILING_LIST_SIZE,
    whitelistedIps: ALLOWED_SENDER_IPS,
    sampleRecipients: [
      { name: 'Anna Kowalska', email: 'a.kowalska@carbonflow.com', role: 'Dyrektor HR' },
      { name: 'Tomasz Nowak', email: 't.nowak@carbonflow.com', role: 'Główny Księgowy' },
      { name: 'Piotr Wiśniewski', email: 'p.wisniewski@carbonflow.com', role: 'Inżynier Przesyłu' },
      { name: 'Robert Moris', email: 'r.moris@carbonflow.com', role: 'CEO / Prezes' }
    ]
  }
};

/** D5: Wybór adresu nadawcy i wysyłka kampanii (Etap 5 - Dostarczenie, //PHISHING (WYSYŁKA)). */
export const phishingDispatchConfig: PhishingDispatchConfig = {
  sender: {
    decisionNum: 5,
    question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
    options: [
      {
        id: 'typosquatting_kadry',
        label: 'KADRY@CARDONFLOW.COM',
        tier: 'ideal',
        feedback: "Typosquatting (podmiana 'b' na 'd' w nazwie domeny) połączony z wiarygodnym działem kadr."
      },
      {
        id: 'marketing_carbon',
        label: 'MARKETING@CARBON.COM',
        tier: 'suboptimal',
        feedback: 'Skrócona domena jest podejrzana w kontekście spraw kadrowych.'
      },
      {
        id: 'catering_oilflow',
        label: 'KATERING@OILFLOW.COM',
        tier: 'critical',
        feedback: 'Zupełnie obca domena zewnętrznej firmy cateringowej zostanie zablokowana lub zignorowana.'
      }
    ]
  },
  targetDomain: TARGET_DOMAIN,
  recipientsCount: MAILING_LIST_SIZE,
  topicDecisionNum: phishingCampaignConfig.topic.decisionNum,
  templateDecisionNum: phishingCampaignConfig.template.decisionNum,
  topics: [
    {
      label: 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO',
      body: 'Przypominamy o konieczności wypełnienia corocznej, obowiązkowej ankiety dotyczącej organizacji firmowego wyjazdu integracyjnego CarbonFlow Inc.',
      slug: 'carbonflow-integracja-2026'
    },
    {
      label: 'ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH',
      body: 'Prosimy wszystkich pracowników o pilne wypełnienie ankiety weryfikującej znajomość procedur ewakuacyjnych i przeciwpożarowych w CarbonFlow Inc.',
      slug: 'carbonflow-cwiczenia-pozarnicze-2026'
    },
    {
      label: 'ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU',
      body: 'Zapraszamy do udziału w krótkim plebiscycie pracowników na temat preferowanego asortymentu w ramach akcji Owocowe Czwartki w CarbonFlow Inc.',
      slug: 'carbonflow-owocowy-czwartek-2026'
    }
  ],
  templates: [
    { label: 'POODLE FORMS', serviceName: 'Poodle Forms', domainHost: 'poodleforms.net' },
    { label: 'Quickgram', serviceName: 'Quickgram', domainHost: 'quickgram.social' },
    { label: 'Kneenook', serviceName: 'Kneenook', domainHost: 'kneenook.forum' }
  ],
  signoffs: {
    typosquatting_kadry: 'Dział Kadr i Płac CarbonFlow Inc.',
    marketing_carbon: 'Dział Marketingu CarbonFlow Inc.',
    catering_oilflow: 'Obsługa Gastronomiczna OilFlow Catering'
  }
};

/** S04: Telemetria rozprzestrzeniania robaka i monitor botnetu (Etap 4). */
export const botnetMonitorConfig: BotnetMonitorConfig = {
  targetCompany: 'CarbonFlow Inc.',
  targetPercentage: 82,
  totalWorkstations: 12
};

/** Dane klocków M2, kluczowane identyfikatorem kafelka pulpitu. */
export const mission2Blocks: Record<string, unknown> = {
  phishing_app: phishingCampaignConfig,
  vpn_app: vpnConfig,
  virus_database: wormBuilderConfig,
  phishing_dispatch: phishingDispatchConfig,
  botnet_monitor: botnetMonitorConfig
};

// ---------------------------------------------------------------------------
// ETAPY MISJI — kolejność wg VR: akcja / szablon / temat -> VPN -> wirus -> nadawca
// ---------------------------------------------------------------------------

export const mission2Stages: StageDefinition[] = [
  {
    id: 'phishing_app',
    appId: 'phishing_app',
    decisions: [1, 2, 3],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'NIE ZAPOMNIJ, ŻE MAJĄ CZARNĄ LISTĘ ANTYSPAMOWĄ. MUSISZ WYBRAĆ JEDEN Z TYCH ADRESÓW IP, ABY W OGÓLE ZOBACZYLI MAILA OD CIEBIE'
        },
        {
          from: 'player',
          id: 'm2_reply_phishing',
          label: 'WIEM, SKORZYSTAM Z VPN, ABY OMINĄĆ ICH SYSTEMY ANTYSPAMOWE'
        }
      ],
      unlockIcons: ['vpn_unlocked', 'vpn_app'],
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
      conversation: [
        {
          from: 'byte_master',
          text: 'STWÓRZ WIRUSA 0-DAY. BĘDZIEMY MIELI PEWNOŚĆ, ŻE WIRUS JEST NIEWYKRYWALNY'
        },
        {
          from: 'player',
          id: 'm2_reply_vpn',
          label: 'ROBI SIĘ'
        }
      ],
      unlockIcons: ['virus_database_unlocked', 'virus_database'],
      badges: { virus_database: 1, chat: 1 },
      highlightTile: 'virus_database',
      sound: 'notification'
    }
  },
  {
    id: 'virus_database',
    appId: 'virus_database',
    decisions: [4],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'WIESZ JUŻ, Z JAKIEGO ADRESU WYŚLESZ ZAINFEKOWANĄ ANKIETĘ?'
        },
        {
          from: 'player',
          id: 'm2_reply_virus',
          label: 'SPOKOJNA TWOJA ZAKAPTURZONA. PODMIENIĘ JEDNĄ LITERĘ W DOMENIE FIRMOWEJ. NIKT NIE ZWRÓCI NA TO UWAGI'
        }
      ],
      unlockIcons: ['phishing_dispatch_unlocked', 'phishing_dispatch'],
      badges: { phishing_dispatch: 1, chat: 1 },
      highlightTile: 'phishing_dispatch',
      sound: 'notification'
    }
  },
  {
    id: 'phishing_dispatch',
    appId: 'phishing_dispatch',
    decisions: [5],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm2_reply_dispatch',
          label: 'GOTOWE. TERAZ MUSIMY POCZEKAĆ, AŻ RYBKA CHWYCI HACZYK'
        }
      ],
      unlockIcons: ['botnet_monitor_unlocked', 'botnet_monitor'],
      badges: { botnet_monitor: 1, chat: 1 },
      highlightTile: 'botnet_monitor',
      sound: 'notification'
    }
  },
  {
    id: 'botnet_monitor',
    appId: 'botnet_monitor',
    decisions: [],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'NIEŹLE CI POSZŁO. JESTEŚ CORAZ BLIŻEJ PRZYJĘCIA DO DARKSUN. CARBONFLOW MA CO ODKRĘCAĆ, A MY MOŻEMY SPOKOJNIE DZIAŁAĆ DALEJ. ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ'
        },
        {
          from: 'player',
          id: 'm2_reply_end',
          label: 'DO USŁUG'
        }
      ],
      unlockIcons: ['mission_completed', 'debrief_app'],
      badges: { debrief_app: 1, chat: 1 },
      highlightTile: 'debrief_app',
      sound: 'success'
    }
  }
];
