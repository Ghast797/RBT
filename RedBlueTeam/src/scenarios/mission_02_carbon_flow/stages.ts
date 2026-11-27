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

/** Domena firmy-celu (nie mylić z domeną nadawcy z D4, która jest jej typosquattingiem). */
const TARGET_DOMAIN = 'carbonflow.com';

/**
 * Lista mailingowa pracowników CarbonFlow: jedno źródło dla importu w //PHISHING, siatki skrzynek
 * w wysyłce i liczby stacji w monitorze botnetu. Liczba adresatów = długość tej listy.
 */
const MAILING_LIST: Array<{ name: string; role: string; email: string }> = [
  ['Anna Kowalska', 'Dyrektor HR'],
  ['Tomasz Nowak', 'Główny Księgowy'],
  ['Piotr Wiśniewski', 'Inżynier Przesyłu'],
  ['Robert Moris', 'CEO / Prezes'],
  ['Katarzyna Wójcik', 'Specjalistka ds. Zakupów'],
  ['Marek Kamiński', 'Kierownik Dyspozytorni'],
  ['Magdalena Lewandowska', 'Analityk Rynku Paliw'],
  ['Jakub Zieliński', 'Administrator IT'],
  ['Ewa Szymańska', 'Radca Prawny'],
  ['Michał Dąbrowski', 'Technik Telemetrii'],
  ['Agnieszka Woźniak', 'Koordynator Logistyki'],
  ['Łukasz Kozłowski', 'Inspektor BHP']
].map(([name, role]) => ({
  name,
  role,
  email: `${emailLocal(name)}@${TARGET_DOMAIN}`
}));

/** „Łukasz Kozłowski” -> „lukasz.kozlowski” (bez polskich znaków diakrytycznych). */
function emailLocal(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.');
}

/** Adresy IP z białej listy nadawców CarbonFlow (lista w //PHISHING, cel w //TUNEL_VPN). */
const ALLOWED_SENDER_IPS = ['82.123.192.116', '77.141.195.139'];

// ---------------------------------------------------------------------------
// DANE KLOCKÓW / MINIGIER
// ---------------------------------------------------------------------------

/** D3: Konstrukcja i modyfikacja robaka 0-day (Etap 4 - Uzbrojenie). */
export const wormBuilderConfig: WormBuilderConfig = {
  virus: {
    decisionNum: 3,
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
        feedback: 'Przechwytuje dane na jednej stacji, nie tworzy botnetu.',
        reject: {
          mentorLine:
            'KEYLOGGER ZBIERA DANE Z JEDNEJ STACJI, NIE DA NAM BOTNETU, A POTRZEBUJEMY ZASŁONY DYMNEJ. WYBIERZ INACZEJ.'
        }
      },
      {
        id: 'ransomware',
        label: 'RANSOMWARE',
        desc: 'Program szyfrujący dane na komputerze ofiary i w jej sieci, by zażądać okupu za ich odblokowanie.',
        tier: 'critical',
        feedback: 'Szyfrowanie plików natychmiast alarmuje administratorów CarbonFlow: operacja zostaje wykryta i spalona.'
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

/** D1–D2: Konfiguracja kampanii phishingowej: szablon, temat (Etap 1 - //PHISHING). */
export const phishingCampaignConfig: PhishingCampaignConfig = {
  template: {
    decisionNum: 1,
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
          'Szablon sieci społecznościowej działa, ale w firmowej skrzynce wzbudza więcej podejrzeń niż zwykła ankieta, więc część pracowników nie kliknie.'
      },
      {
        id: 'kneenook',
        label: 'Kneenook',
        desc: 'TWÓJ POST | ZOBACZ NA KNEENOOK',
        tier: 'suboptimal',
        feedback:
          'Szablon postu na forum jest niespójny z formatem ankiety.',
        reject: {
          mentorLine: 'POST NA FORUM NIE WYGLĄDA JAK ANKIETA OD FIRMY. NIKT TEGO NIE WYPEŁNI. WYBIERZ INACZEJ.'
        }
      }
    ]
  },
  topic: {
    decisionNum: 2,
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
          'Ankieta zadziała, ale temat jest formalny i nikogo nie ekscytuje, więc część pracowników odłoży wypełnienie na później.'
      },
      {
        id: 'fruit_thursday',
        label: 'ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU',
        tier: 'suboptimal',
        feedback:
          'Błahy temat zostanie zignorowany przez większość personelu.',
        reject: {
          mentorLine: 'OWOCOWY CZWARTEK NIKOGO NIE PORUSZY. NIE KLIKNĄ W TO, A MY POTRZEBUJEMY KLIKNIĘĆ. WYBIERZ INACZEJ.'
        }
      }
    ]
  },
  mailingList: {
    targetDomain: TARGET_DOMAIN,
    whitelistedIps: ALLOWED_SENDER_IPS,
    recipients: MAILING_LIST
  }
};

/** D4: Wybór adresu nadawcy i wysyłka kampanii (Etap 5 - Dostarczenie, //PHISHING (WYSYŁKA)). */
export const phishingDispatchConfig: PhishingDispatchConfig = {
  sender: {
    decisionNum: 4,
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
        feedback: 'Adres zadziała, ale marketing rzadko pisze w sprawach kadrowych, więc wiadomość wzbudzi więcej podejrzeń niż od kadr.'
      },
      {
        id: 'catering_oilflow',
        label: 'KATERING@OILFLOW.COM',
        tier: 'suboptimal',
        feedback: 'Zupełnie obca domena zewnętrznej firmy kateringowej zostanie zablokowana lub zignorowana.',
        reject: {
          mentorLine: 'OBCA FIRMA KATERINGOWA W POLU NADAWCY? FILTR TO ZABLOKUJE ALBO PRACOWNICY ZIGNORUJĄ. WYBIERZ INACZEJ.'
        }
      }
    ]
  },
  targetDomain: TARGET_DOMAIN,
  recipients: MAILING_LIST.map((r) => r.email),
  topicDecisionNum: phishingCampaignConfig.topic.decisionNum,
  templateDecisionNum: phishingCampaignConfig.template.decisionNum,
  topics: [
    {
      label: 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO',
      body: 'Przypominamy o konieczności wypełnienia corocznej, obowiązkowej ankiety dotyczącej organizacji firmowego wyjazdu integracyjnego CarbonFlow Inc.',
      slug: 'carbonflow-integracja-2026',
      deadline: 'Czas na wypełnienie formularza upływa dzisiaj o godzinie 16:00.'
    },
    {
      label: 'ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH',
      body: 'Prosimy wszystkich pracowników o wypełnienie ankiety weryfikującej znajomość procedur ewakuacyjnych i przeciwpożarowych w CarbonFlow Inc.',
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
    catering_oilflow: 'Obsługa Gastronomiczna OilFlow Katering'
  }
};

/** S04: Telemetria rozprzestrzeniania robaka i monitor botnetu (Etap 4). */
export const botnetMonitorConfig: BotnetMonitorConfig = {
  targetCompany: 'CarbonFlow Inc.',
  targetPercentage: 82,
  totalWorkstations: MAILING_LIST.length,
  // Konsekwencje słabszych wyborów (bez zmiany punktów): mniej stacji zainfekowanych albo alarm IDS.
  consequences: [
    // D1: szablon Quickgram — część pracowników nie kliknie w formularz.
    {
      when: { decision: 1, optionId: 'quickgram' },
      penetrationDelta: -12,
      note: 'CZĘŚĆ PRACOWNIKÓW NIE KLIKNĘŁA: SZABLON SPOŁECZNOŚCIOWY W SŁUŻBOWEJ SKRZYNCE BUDZIŁ PODEJRZENIA'
    },
    // D2: temat ćwiczeń przeciwpożarowych — część pracowników odłoży wypełnienie na później.
    {
      when: { decision: 2, optionId: 'fire_drill' },
      penetrationDelta: -10,
      note: 'CZĘŚĆ PRACOWNIKÓW ODŁOŻYŁA WYPEŁNIENIE ANKIETY NA PÓŹNIEJ'
    },
    // D4: nadawca MARKETING@CARBON.COM — filtr poczty oznacza nadawcę, ładunek nadal niewykryty.
    {
      when: { decision: 4, optionId: 'marketing_carbon' },
      alarms: 1,
      alarmText: 'FILTR POCZTY OZNACZYŁ NADAWCĘ JAKO PODEJRZANEGO'
    }
  ]
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
    decisions: [1, 2],
    completion: {
      conversation: [
        {
          from: 'byte_master',
          text: 'NIE ZAPOMNIJ, ŻE MAJĄ BIAŁĄ LISTĘ NADAWCÓW. MUSISZ WYBRAĆ JEDEN Z TYCH ADRESÓW IP, ABY W OGÓLE ZOBACZYLI MAILA OD CIEBIE'
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
    decisions: [3],
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
    decisions: [4],
    completion: {
      conversation: [
        {
          from: 'player',
          id: 'm2_reply_dispatch',
          label: 'GOTOWE. TERAZ MUSIMY POCZEKAĆ, AŻ RYBKA CHWYCI HACZYK'
        },
        // „Czekanie” z VR pokazane jako przeskok czasu (wirująca tarcza, bez napisów);
        // kafelek monitora podświetla się 3 s po nim.
        { from: 'time_jump', clockFrom: '09:40', clock: '14:25' }
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
        // Ideał na D1, D2 i D4 (mostek pomija wariant poniżej).
        {
          from: 'byte_master',
          text: 'NIEŹLE CI POSZŁO. JESTEŚ CORAZ BLIŻEJ PRZYJĘCIA DO DARKSUN. CARBONFLOW MA CO ODKRĘCAĆ, A MY MOŻEMY SPOKOJNIE DZIAŁAĆ DALEJ. ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ',
          when: {
            allOf: [
              { decision: 1, tier: 'ideal' },
              { decision: 2, tier: 'ideal' },
              { decision: 4, tier: 'ideal' }
            ]
          }
        },
        // Którakolwiek z D1, D2, D4 suboptymalna (mostek pomija wariant powyżej).
        {
          from: 'byte_master',
          text: 'MOGŁO PÓJŚĆ LEPIEJ, ALE CARBONFLOW I TAK MA CO ODKRĘCAĆ, A MY MOŻEMY SPOKOJNIE DZIAŁAĆ DALEJ. ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ',
          when: {
            anyOf: [
              { decision: 1, tier: 'suboptimal' },
              { decision: 2, tier: 'suboptimal' },
              { decision: 4, tier: 'suboptimal' }
            ]
          }
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
