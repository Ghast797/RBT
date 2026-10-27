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
// DANE KLOCKÓW / MINIGIER
// ---------------------------------------------------------------------------

/** D1: Konstrukcja i modyfikacja robaka 0-day (Etap 1 - Uzbrojenie). */
export const wormBuilderConfig: WormBuilderConfig = {
  virus: {
    decisionNum: 1,
    question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA:',
    options: [
      {
        id: 'worm',
        label: 'ROBAK – AUTOMATYCZNIE SIĘ POWIELA I TWORZY KOMPUTERY ZOMBIE',
        desc: 'Samoreplikujący się kod infekujący stacje robocze w lokalnej podsieci.',
        tags: ['AUTOMAT', 'SAMOREPLIKACJA'],
        tier: 'ideal',
        feedback: 'Robak samodzielnie powiela się w sieci i formuje botnet.'
      },
      {
        id: 'keylogger',
        label: 'KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
        desc: 'Rejestrator wprowadzanych znaków klawiatury na pojedynczej stacji.',
        tags: ['MONITORING', 'LOKALNY'],
        tier: 'suboptimal',
        feedback: 'Przechwytuje dane na jednej stacji, nie tworzy botnetu.'
      },
      {
        id: 'ransomware',
        label: 'RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ',
        desc: 'Szyfruje zasoby dyskowe i żąda okupu za przywrócenie dostępu.',
        tags: ['SZYFROWANIE', 'EXTORTION'],
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

/** S02: Konfiguracja VPN (dopasowanie IP do allowlisty antyspamowej CarbonFlow - Flavor). */
export const vpnConfig: VpnConfig = {
  initialIp: '192.168.1.45',
  targetIp: '82.123.192.116',
  allowedIps: ['82.123.192.116', '77.141.195.139'],
  feedback: {
    ideal: 'Pomyślnie dopasowano adres IP! Ruch zamaskowany i dopuszczony przez filtry CarbonFlow.',
    critical: 'Błąd: Adres IP nie znajduje się na białej liście CarbonFlow. Wiadomość zostanie odrzucona przez filtry antyspamowe!'
  }
};

/** D2–D5: Pełna konfiguracja kampanii phishingowej (Etap 3 - Dostarczenie). */
export const phishingCampaignConfig: PhishingCampaignConfig = {
  action: {
    decisionNum: 2,
    question: 'WYBIERZ RODZAJ AKCJI:',
    options: [
      {
        id: 'zero_day_worm',
        label: 'WIRUS 0-DAY',
        desc: 'Infekcja złośliwym oprogramowaniem wykorzystującym nieznane podatności systemowe.',
        tags: ['EXPLOIT', 'MALWARE', 'AUTORUN'],
        tier: 'ideal',
        feedback:
          'Wirus 0-day bezbłędnie realizuje cel zlecenia, omijając antywirusy i tworząc sieć botnetu na serwerach ofiary.'
      },
      {
        id: 'security_training',
        label: 'SZKOLENIE Z BEZPIECZEŃSTWA IT',
        desc: 'Pozorowana kampania edukacyjna sprawdzająca czujność pracowników firmy.',
        tags: ['AUDYT', 'AWARENESS', 'SECURITY'],
        tier: 'suboptimal',
        feedback:
          'Pozorowane szkolenie nie instaluje złośliwego oprogramowania i nie paraliżuje infrastruktury zgodnie z ustaleniami z mentorem.'
      },
      {
        id: 'data_harvesting',
        label: 'ZBIERANIE WRAŻLIWYCH DANYCH',
        desc: 'Formularz przechwytujący poświadczenia domenowe i hasła użytkowników.',
        tags: ['CREDENTIALS', 'LOGOWANIE', 'HARVESTING'],
        tier: 'critical',
        feedback:
          'Phishing nakierowany wyłącznie na kradzież poświadczeń nie infekuje maszyn robakiem i nie tworzy zasłony dymnej.'
      }
    ]
  },
  template: {
    decisionNum: 3,
    question: 'WYBIERZ SZABLON FORMULARZA:',
    options: [
      {
        id: 'poodle_forms',
        label: 'POODLE FORMS',
        desc: 'Szablon formularza ankietowego (TWOJA ANKIETA | WYPEŁNIJ FORMULARZ).',
        tags: ['FORMULARZ', 'ANKIETA'],
        tier: 'ideal',
        feedback:
          'Profesjonalny szablon formularza ankietowego idealnie pasuje do planu wysłania fałszywej ankiety pracowniczej.'
      },
      {
        id: 'quickgram',
        label: 'Quickgram',
        desc: 'Szablon platformy społecznościowej (OBSERWUJ | SPRAWDŹ TO).',
        tags: ['SOCIAL', 'PROFIL'],
        tier: 'suboptimal',
        feedback:
          'Szablon sieci społecznościowej wzbudza podejrzenia w środowisku korporacyjnym.'
      },
      {
        id: 'kneenook',
        label: 'Kneenook',
        desc: 'Szablon otwartego forum dyskusyjnego (TWÓJ POST | ZOBACZ NA KNEENOOK).',
        tags: ['FORUM', 'DYSKUSJA'],
        tier: 'critical',
        feedback:
          'Szablon postu na forum jest niespójny z formatem ankiety.'
      }
    ]
  },
  topic: {
    decisionNum: 4,
    question: 'WYBIERZ TEMAT I PRZYNĘTĘ ANKIETY:',
    options: [
      {
        id: 'mandatory_integration',
        label: 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO',
        desc: 'Formularz organizacyjny wyjazdu integracyjnego oznaczony jako wymagany.',
        tags: ['HR', 'WYJAZD', 'FORMULARZ'],
        tier: 'ideal',
        feedback:
          'Przymus w połączeniu z tematem integracji tworzy idealną presję socjotechniczną.'
      },
      {
        id: 'fire_drill',
        label: 'ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH',
        desc: 'Kwestionariusz weryfikujący znajomość procedur przeciwpożarowych.',
        tags: ['BHP', 'EWAKUACJA', 'BEZPIECZEŃSTWO'],
        tier: 'suboptimal',
        feedback:
          'Temat formalny i nudny, część pracowników odłoży wypełnienie na później.'
      },
      {
        id: 'fruit_thursday',
        label: 'ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU',
        desc: 'Głosowanie nad asortymentem owocowym w firmowej kantynie.',
        tags: ['BIURO', 'ŻYWNOŚĆ', 'PLEBISCYT'],
        tier: 'critical',
        feedback:
          'Błahy temat zostanie zignorowany przez większość personelu.'
      }
    ]
  },
  mailingList: {
    targetDomain: 'carbonflow.com',
    employeesCount: 12,
    whitelistedIps: ['82.123.192.116', '77.141.195.139'],
    sampleRecipients: [
      { name: 'Anna Kowalska', email: 'a.kowalska@carbonflow.com', role: 'Dyrektor HR' },
      { name: 'Tomasz Nowak', email: 't.nowak@carbonflow.com', role: 'Główny Księgowy' },
      { name: 'Piotr Wiśniewski', email: 'p.wisniewski@carbonflow.com', role: 'Inżynier Przesyłu' },
      { name: 'Robert Moris', email: 'r.moris@carbonflow.com', role: 'CEO / Prezes' }
    ]
  },
  sender: {
    decisionNum: 5,
    question: 'WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:',
    options: [
      {
        id: 'typosquatting_kadry',
        label: 'KADRY@CARDONFLOW.COM',
        desc: 'Wiadomość z adresu kadry@cardonflow.com.',
        tags: ['KADRY', 'DOMENA'],
        tier: 'ideal',
        feedback: "Typosquatting (podmiana 'b' na 'd' w nazwie domeny) połączony z wiarygodnym działem kadr."
      },
      {
        id: 'marketing_carbon',
        label: 'MARKETING@CARBON.COM',
        desc: 'Wiadomość z adresu marketing@carbon.com.',
        tags: ['MARKETING', 'DOMENA'],
        tier: 'suboptimal',
        feedback: 'Skrócona domena jest podejrzana w kontekście spraw kadrowych.'
      },
      {
        id: 'catering_oilflow',
        label: 'KATERING@OILFLOW.COM',
        desc: 'Wiadomość z adresu katering@oilflow.com.',
        tags: ['CATERING', 'DOMENA'],
        tier: 'critical',
        feedback: 'Zupełnie obca domena zewnętrznej firmy cateringowej zostanie zablokowana lub zignorowana.'
      }
    ]
  }
};

/** PhishingDispatchConfig dla zgodności wstecznej minigry. */
export const phishingDispatchConfig: PhishingDispatchConfig = {
  sender: phishingCampaignConfig.sender!,
  targetDomain: 'carbonflow.com',
  surveyTitle: 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO'
};

/** S04: Telemetria rozprzestrzeniania robaka i monitor botnetu (Etap 4). */
export const botnetMonitorConfig: BotnetMonitorConfig = {
  targetCompany: 'CarbonFlow Inc.',
  targetPercentage: 82,
  totalWorkstations: 12
};

/** Dane klocków M2, kluczowane identyfikatorem kafelka pulpitu. */
export const mission2Blocks: Record<string, unknown> = {
  virus_database: wormBuilderConfig,
  vpn_app: vpnConfig,
  phishing_app: phishingCampaignConfig,
  botnet_monitor: botnetMonitorConfig
};

// ---------------------------------------------------------------------------
// ETAPY MISJI — przebieg przez completeStage (wzorzec B, Cyber Kill Chain)
// ---------------------------------------------------------------------------

export const mission2Stages: StageDefinition[] = [
  {
    id: 'virus_database',
    appId: 'virus_database',
    decisions: [1],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'NIE ZAPOMNIJ, ŻE MAJĄ CZARNĄ LISTĘ ANTYSPAMOWĄ. MUSISZ WYBRAĆ JEDEN Z TYCH ADRESÓW IP, ABY W OGÓLE ZOBACZYLI MAILA OD CIEBIE'
        },
        {
          from: 'player',
          id: 'm2_reply_virus',
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
          text: 'WIESZ JUŻ, Z JAKIEGO ADRESU WYŚLESZ ZAINFEKOWANĄ ANKIETĘ?'
        },
        {
          from: 'player',
          id: 'm2_reply_vpn',
          label: 'ZAREJESTRUJĘ DOMENĘ ŁUDZĄCO PODOBNĄ DO FIRMOWEJ. PRZYGOTUJĘ ADRES, KTÓRY UŚPI CZUJNOŚĆ PRACOWNIKÓW.'
        }
      ],
      unlockIcons: ['phishing_unlocked', 'phishing_app'],
      badges: { phishing_app: 1, chat: 1 },
      highlightTile: 'phishing_app',
      sound: 'notification'
    }
  },
  {
    id: 'phishing_app',
    appId: 'phishing_app',
    decisions: [2, 3, 4, 5],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'KAMPANIA ROZESŁANA. SPRAWDŹMY, CZY ŁADUNEK ZACZĄŁ ROZPRZESTRZENIAĆ SIĘ PO STACJACH ROBOCZYCH.'
        },
        {
          from: 'player',
          id: 'm2_reply_phishing',
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
