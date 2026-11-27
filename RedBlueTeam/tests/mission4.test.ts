import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { resolveDecisionCount } from '../src/engine/core/scoring';
import type { ChoiceOutcome, ConversationBeat, MissionDefinition } from '../src/engine/types/mission';
import { scorm2004, MockSCORM2004 } from '../src/engine/scorm/scorm2004';
import { createMissionCompletionStatement, MockLRS } from '../src/engine/scorm/xapi';
import {
  virusLabConfig,
  builderConfig,
  mailConfig,
  vpnConfig,
  c2Config,
  victimChatConfig
} from '../src/scenarios/mission_04_energy_rock/stages';

// ---------------------------------------------------------------------------
// TESTY MISJI 4 (ENERGY ROCK), wzorzec B (porcja B: dane i struktura).
// Stałe struktury (kolejność etapów, decyzje, poziomy, godziny) są wpisane w teście. Testy konkretnych tekstów
// (1:1 z dokumentu) dopisuje koordynator po uzupełnieniu `TODO_VR`; logikę wnętrza minigier testują pliki
// tests/m4-*.test.ts (porcje C–G).
// ---------------------------------------------------------------------------

const MISSION_ID = 'mission-4-energy-rock';
const def = (): MissionDefinition => getMission(MISSION_ID) as MissionDefinition;
const stages = () => def().stages ?? [];

const EXPECTED_STAGE_ORDER = ['virus_database', 'ransomware_builder', 'mail', 'vpn_app', 'victim_workstation', 'negotiation'];

const EXPECTED_DECISIONS_PER_STAGE: Record<string, number[]> = {
  virus_database: [1],
  ransomware_builder: [2, 3, 4],
  mail: [5, 6],
  vpn_app: [7],
  victim_workstation: [8],
  negotiation: [9, 10]
};

const EXPECTED_COMPONENTS = [
  'chat',
  'er_virus_lab',
  'er_ransom_builder',
  'er_phishing_mail',
  'vpn_router',
  'er_ransom_c2',
  'er_victim_chat',
  'debrief_app'
];

const beatKind = (b: ConversationBeat): string =>
  b.from === 'time_jump' ? `time_jump ${b.clockFrom}->${b.clock}` : b.from;
const bridgeKinds = (id: string) => (stages().find((s) => s.id === id)!.completion.conversation ?? []).map(beatKind);

/** Przegrywa rozmowę mostkującą do końca (kwestie mentora, kliki kwestii gracza, przeskoki czasu). */
function driveBridge(jumps?: Array<{ clockFrom?: string; clock?: string }>) {
  for (let i = 0; i < 60; i++) {
    vi.runAllTimers();
    const st = useMissionStore.getState();
    if (st.timeJump) {
      jumps?.push({ clockFrom: st.timeJump.clockFrom, clock: st.timeJump.clock });
      st.endTimeJump();
      continue;
    }
    if (!st.pendingBridge) return;
    const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
    if (beat) useMissionStore.getState().chooseChatOption(beat.id);
    else return;
  }
}

/** Zgłoszenie decyzji o danym poziomie (silnik liczy punkty z poziomu). */
const report = (num: number, tier: ChoiceOutcome) =>
  useMissionStore.getState().reportDecision({ num, question: `D${num}`, answer: 'X', tier, feedback: '' });

describe('Misja 4 — metadane i raport', () => {
  it('ładuje definicję z rejestru (10 decyzji, próg 80%, 3,79 BTC, akcent czerwony)', () => {
    expect(def()).toBeDefined();
    expect(def().mission.id).toBe(MISSION_ID);
    expect(def().mission.title).toBe('MISJA 4 – ENERGY ROCK');
    expect(def().mission.targetCompany).toBe('Energy Rock');
    expect(def().mission.rewardBtc).toBe(3.79);
    expect(def().mission.decisionCount).toBe(10);
    expect(def().mission.passingScore).toBe(70);
    expect(def().mission.accentColor).toBe('#FF0033');
    expect(def().mission.date).toBe('19.05.2026');
    expect(resolveDecisionCount(def())).toBe(10);
  });

  it('raport: 10 pozycji, bez educationalSlides, tytuł ZHAKOWANO ENERGY ROCK', () => {
    expect(def().step6.choices.length).toBe(10);
    expect(def().step6.educationalSlides).toBeUndefined();
    expect(def().step6.summary).toMatchObject({
      title: 'ZHAKOWANO ENERGY ROCK',
      subtitle: 'UKOŃCZONO ZADANIE 4',
      company: 'Energy Rock',
      scorePercent: 100,
      perfectChoices: 10,
      goodChoices: 0,
      criticalErrors: 0,
      btcReward: 3.79
    });
    def().step6.choices.forEach((c) => expect(c.correct).toBe(true));
  });

  it('pytania raportu D1–D10 są pytaniami ekranów (jedno źródło)', () => {
    const q = (k: number) => def().step6.choices.find((c) => c.num === k)!.question;
    expect(virusLabConfig.virus.question).toBe(q(1));
    expect(builderConfig.password.question).toBe(q(2));
    expect(builderConfig.note.question).toBe(q(3));
    expect(builderConfig.color.question).toBe(q(4));
    expect(mailConfig.subject.question).toBe(q(5));
    expect(mailConfig.body.question).toBe(q(6));
    expect(vpnConfig.sender!.question).toBe(q(7));
    expect(c2Config.exfil.question).toBe(q(8));
    expect(victimChatConfig.dialogue.nodes[0].question).toBe(q(9));
    expect(victimChatConfig.dialogue.nodes.find((n) => n.id === 'neg_2')!.question).toBe(q(10));
  });

  it('negocjacje w raporcie: transkrypt 3 tur przy pozycji 10, podpis rozmówcy SZEF IT', () => {
    const d10 = def().step6.choices.find((c) => c.num === 10)!;
    expect(d10.negotiationTranscript?.length).toBe(5);
    d10.negotiationTranscript!.forEach((t) => expect(t.opponentLabel).toBe('SZEF IT'));
  });

  it('intro bez firstChoice (wzorzec M3), baza wirusów odblokowywana po BIOS, czat ma znaczek', () => {
    const intro = def().intro as any;
    expect(intro.firstChoice).toBeUndefined();
    expect(intro.dialogue.length).toBe(5);
    expect(intro.dialogue[4].playerResponse).toBeTruthy();
    expect(intro.firstUnlock.unlockIcons).toContain('virus_database_unlocked');
    expect(intro.firstUnlock.highlightTile).toBe('virus_database');
  });
});

describe('Misja 4 — struktura etapów', () => {
  it('kolejność etapów: wirus -> kreator -> mail -> VPN -> moduł ransomware -> czat z ofiarą', () => {
    expect(stages().map((s) => s.id)).toEqual(EXPECTED_STAGE_ORDER);
    expect(stages().map((s) => s.appId)).toEqual(EXPECTED_STAGE_ORDER);
  });

  it('decyzje rozłożone [1],[2,3,4],[5,6],[7],[8],[9,10]', () => {
    stages().forEach((s) => expect(s.decisions).toEqual(EXPECTED_DECISIONS_PER_STAGE[s.appId]));
    for (let k = 1; k <= 10; k++) {
      expect(stages().filter((s) => (s.decisions ?? []).includes(k)).length).toBe(1);
      expect(def().step6.choices.filter((c) => c.num === k).length).toBe(1);
    }
  });

  it('pulpit: czat pierwszy, potem etapy, raport na końcu; komponenty zarejestrowane', () => {
    expect(def().desktopApps.map((t) => t.id)).toEqual(['chat_shortcut', ...EXPECTED_STAGE_ORDER, 'debrief_app']);
    expect(def().desktopApps.map((t) => t.componentId)).toEqual(EXPECTED_COMPONENTS);
    def().desktopApps.forEach((t) => expect(appComponentRegistry[t.componentId], t.componentId).toBeDefined());
    stages().forEach((s) => {
      const tile = def().desktopApps.find((t) => t.id === s.appId);
      expect(tile, s.appId).toBeDefined();
      expect(tile!.unlockedOnly).toBe(true);
      expect(def().blocks![s.appId], `blocks.${s.appId}`).toBeDefined();
    });
    expect(def().desktopApps.filter((t) => !t.unlockedOnly).map((t) => t.id)).toEqual(['chat_shortcut']);
    expect(def().desktopApps.find((t) => t.id === 'victim_workstation')!.color).toBe('#8A2BE2');
  });

  it('poziomy opcji wg planu: D1, D4, D5, D6, D7, D9, D10', () => {
    const tiers = (opts: Array<{ id: string; tier: ChoiceOutcome }>) => Object.fromEntries(opts.map((o) => [o.id, o.tier]));
    expect(tiers(virusLabConfig.virus.options)).toEqual({ ransomware: 'ideal', rat: 'suboptimal', keylogger: 'suboptimal' });
    expect(tiers(builderConfig.color.options)).toEqual({ red: 'ideal', white: 'suboptimal', green: 'suboptimal' });
    expect(tiers(mailConfig.subject.options)).toEqual({ subj_cv_wilk: 'ideal', subj_wilk_cv: 'suboptimal', subj_analyst: 'suboptimal' });
    expect(tiers(mailConfig.body.options)).toEqual({ body_formal: 'ideal', body_casual: 'suboptimal', body_no_pwd: 'suboptimal' });
    expect(tiers(vpnConfig.sender!.options)).toEqual({ sender_wilk: 'ideal', sender_alex: 'suboptimal', sender_spam: 'suboptimal' });
    const byId = (id: string) => victimChatConfig.dialogue.nodes.find((n) => n.id === id)!;
    const [n1, n2, n3] = [byId('neg_1'), byId('neg_2'), byId('neg_3')];
    expect(tiers(n1.options)).toEqual({ firm_stance: 'ideal', aggression: 'suboptimal', surrender: 'suboptimal' });
    expect(tiers(n2.options)).toEqual({ btc_demand: 'ideal', troll: 'critical', reveal_motive: 'critical' });
    expect(n3.options.length).toBe(1);
  });

  it('D3: tytuł i czas to kafelki z poziomami (30 s odrzucane przez mentora), 4 kafelki stałe bez poziomu', () => {
    const t = Object.fromEntries(builderConfig.note.tiles.map((x) => [x.id, x]));
    expect(builderConfig.note.tiles.length).toBe(8);
    expect(builderConfig.note.slots.map((s) => s.id)).toEqual(['icon', 'title', 'time', 'amount', 'address', 'contact']);
    expect(t.title_encrypted.tier).toBe('ideal');
    expect(t.title_casual.tier).toBe('suboptimal');
    expect(t.time_30h.tier).toBe('ideal');
    expect(t.time_30s.tier).toBe('suboptimal');
    builderConfig.note.tiles.filter((x) => x.tier === undefined).forEach((x) => expect(['icon', 'amount', 'address', 'contact']).toContain(x.slot));
  });

  it('D2: suwak 8–24 (domyślnie 8), 6 kafelków z 2 zakazanymi, progi z planu', () => {
    const p = builderConfig.password;
    expect([p.minLength, p.maxLength, p.defaultLength, p.criticalLength, p.idealLength, p.idealSets]).toEqual([8, 24, 8, 8, 24, 4]);
    expect(p.tiles.length).toBe(6);
    expect(p.tiles.filter((x) => x.forbidden).map((x) => x.id)).toEqual(['pw_space', 'pw_national']);
  });

  it('D8: 12 plików, dokładnie 3 cele, cztery serwery baz i 8 węzłów sieci, bez pułapek honeypot', () => {
    expect(c2Config.exfil.files.length).toBe(12);
    expect(c2Config.exfil.files.filter((f) => f.role === 'target').length).toBe(3);
    expect(c2Config.exfil.requiredTargets).toBe(3);
    expect(c2Config.encrypt.nodes.length).toBe(8);
    expect(c2Config.encrypt.nodes.filter((n) => n.kind === 'database').length).toBe(4);
    expect(c2Config.encrypt.nodes.filter((n) => n.kind === 'workstation').length).toBe(2);
    expect(c2Config.start.host).toBe('ENERGY_ROCK_01_PC');
    expect(c2Config.start.ip).toBe('151.89.159.52');
  });

  it('D7: IP jest bramką bez decisionNum, nadawca niesie decyzję 7 z IP w odpowiedzi, brak timeJump w klocku', () => {
    expect(vpnConfig.vpn!.decisionNum).toBeUndefined();
    expect(vpnConfig.vpn!.targetIp).toBe('109.43.200.124');
    expect(vpnConfig.vpn!.initialIp).toBe('106.55.202.120');
    expect(vpnConfig.sender!.decisionNum).toBe(7);
    expect(vpnConfig.sender!.includeIpInAnswer).toBe(true);
    expect(vpnConfig.sender!.confirmLabel).toBe('WYŚLIJ MAILA');
    expect(vpnConfig.timeJump).toBeUndefined();
  });

  it('negocjacje per-węzeł: D9 na węźle 1, D10 na węźle 2, węzeł 3 bez oceny, bez closingMessage i trybu agregującego', () => {
    const d = victimChatConfig.dialogue;
    expect(d.nodes.map((n) => [n.id, n.decisionNum])).toEqual([
      ['neg_1', 9],
      ['neg_1_retreat', undefined],
      ['neg_1_threat', undefined],
      ['neg_2', 10],
      ['neg_3', undefined]
    ]);
    expect(d.closingMessage).toBeUndefined();
    expect(d.decisionNum).toBeUndefined();
    expect(victimChatConfig.preview.fallback.colorId).toBe('red');
  });

  it('mostki: kształt kolejności beatów, przeskoki czasu i banery połączeń', () => {
    expect(bridgeKinds('virus_database')).toEqual(['player']);
    expect(bridgeKinds('ransomware_builder')).toEqual(['byte_master', 'player', 'byte_master']);
    expect(bridgeKinds('mail')).toEqual(['player']);
    expect(bridgeKinds('vpn_app')).toEqual(['player', 'byte_master', 'time_jump 16:40->09:10', 'time_jump 16:40->12:25']);
    expect(bridgeKinds('victim_workstation')).toEqual([
      'player',
      'byte_master',
      'time_jump 09:10->11:35',
      'time_jump 12:25->14:50'
    ]);
    expect(bridgeKinds('negotiation')).toEqual(['player', 'byte_master', 'byte_master', 'player', 'byte_master']);
    const call = (id: string) => stages().find((s) => s.id === id)!.completion.incomingCall;
    expect(call('vpn_app')).toEqual({ appId: 'victim_workstation', label: 'MALWARE ZOSTAŁ AKTYWOWANY' });
    expect(call('victim_workstation')).toEqual({ appId: 'negotiation', label: 'OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT' });
    expect(JSON.stringify(stages())).not.toContain('WEJDŹ NA STACJĘ OFIARY');
  });
});

describe('Misja 4 — przepływ przez silnik', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    MockLRS.clear();
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  it('ładuje misję do store (wynik 100, 10 wpisów, data 19.05.2026)', () => {
    useMissionStore.getState().loadMission(MISSION_ID);
    const s = useMissionStore.getState();
    expect(s.activeMission.mission.id).toBe(MISSION_ID);
    expect(s.score).toBe(100);
    expect(s.playerChoices.length).toBe(10);
    expect(s.systemDate).toBe('19.05.2026');
  });

  it('completeStage uruchamia mostek; kafelek odblokowuje się PO kwestii gracza', () => {
    const store = useMissionStore.getState();
    store.loadMission(MISSION_ID);
    store.finishBiosBoot();
    driveBridge();
    store.openApp('virus_database');
    store.completeStage('virus_database');
    const mid = useMissionStore.getState();
    expect(mid.activeApp).toBeNull();
    expect(mid.unlockedIcons).not.toContain('ransomware_builder');
    driveBridge();
    const done = useMissionStore.getState();
    expect(done.unlockedIcons).toContain('ransomware_builder');
    expect(done.highlightedTileId).toBe('ransomware_builder');
  });

  it('10 idealnych decyzji = 100% i paczka SCORM; przeskoki 16:40->09:10 i 09:10->11:35; banery połączeń', () => {
    const store = useMissionStore.getState();
    store.loadMission(MISSION_ID);
    store.finishBiosBoot();
    driveBridge();
    const jumps: Array<{ clockFrom?: string; clock?: string }> = [];
    const stage = (id: string, decisions: number[]) => {
      decisions.forEach((n) => report(n, 'ideal'));
      useMissionStore.getState().completeStage(id);
      driveBridge(jumps);
    };

    stage('virus_database', [1]);
    stage('ransomware_builder', [2, 3, 4]);
    stage('mail', [5, 6]);
    expect(useMissionStore.getState().unlockedIcons).toContain('vpn_app');
    expect(useMissionStore.getState().incomingCall).toBeNull();
    stage('vpn_app', [7]);
    expect(useMissionStore.getState().unlockedIcons).toContain('victim_workstation');
    expect(useMissionStore.getState().incomingCall).toEqual({ appId: 'victim_workstation', label: 'MALWARE ZOSTAŁ AKTYWOWANY' });
    stage('victim_workstation', [8]);
    expect(useMissionStore.getState().incomingCall).toEqual({
      appId: 'negotiation',
      label: 'OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT'
    });
    stage('negotiation', [9, 10]);

    expect(jumps).toEqual([
      { clockFrom: '16:40', clock: '09:10' },
      { clockFrom: '09:10', clock: '11:35' }
    ]);
    const fin = useMissionStore.getState();
    expect(fin.incomingCall).toBeNull();
    expect(fin.unlockedIcons).toContain('debrief_app');
    expect(fin.unlockedIcons).toContain('mission_completed');
    expect(fin.score).toBe(100);
    expect(fin.playerChoices.filter((c) => c.outcome === 'ideal').length).toBe(10);
    expect(fin.playerChoices.find((c) => c.num === 10)?.negotiationTranscript?.length).toBe(5);

    const submit = store.submitScormAndExit();
    expect(submit.success).toBe(true);
    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.success_status')).toBe('passed');
    expect(api.GetValue('cmi.score.raw')).toBe('100');
    const statement = createMissionCompletionStatement(
      { name: 'Agent Wilk', mbox: 'mailto:agent@example.com' },
      100,
      'Mission 4: Energy Rock completed',
      def().mission
    );
    expect(statement.result.success).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('błąd krytyczny w D%i otwiera ekran wykrycia i obniża wynik', (num) => {
    useMissionStore.getState().loadMission(MISSION_ID);
    report(num, 'critical');
    const s = useMissionStore.getState();
    expect(s.isDetectedModalOpen).toBe(true);
    expect(s.criticalErrorsCount).toBe(1);
    expect(s.score).toBeLessThan(100);
  });

  it.each([3, 4, 8])('wybór suboptymalny w D%i obniża wynik bez ekranu wykrycia', (num) => {
    useMissionStore.getState().loadMission(MISSION_ID);
    report(num, 'suboptimal');
    const s = useMissionStore.getState();
    expect(s.isDetectedModalOpen).toBe(false);
    expect(s.score).toBeLessThan(100);
  });
});

describe('Misja 4 — teksty do uzupełnienia', () => {
  it('w danych nie ma znacznika TODO_VR', () => {
    const json = JSON.stringify({ def: def(), blocks: def().blocks });
    expect(json).not.toContain('TODO_VR');
  });
});
