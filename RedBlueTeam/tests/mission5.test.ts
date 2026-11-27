import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { resolveDecisionCount } from '../src/engine/core/scoring';
import { scorm2004, MockSCORM2004 } from '../src/engine/scorm/scorm2004';
import { createMissionCompletionStatement, MockLRS } from '../src/engine/scorm/xapi';
import type { ChoiceOutcome, MissionDefinition } from '../src/engine/types/mission';
import {
  intelPdfConfig,
  vpnConfig,
  domainPrepConfig,
  pageClonerConfig,
  numberPrepConfig,
  vishingCallConfig
} from '../src/scenarios/mission_05_bank_bcorp/stages';

// ---------------------------------------------------------------------------
// TESTY MISJI 5 (BANK BCORP), wzorzec B (etapy + klocki/minigry)
// Źródło prawdy: RedBlueTeam/src/scenarios/mission_05_bank_bcorp/scenario.md
// ---------------------------------------------------------------------------

const MISSION_ID = 'mission-5-bank-bcorp';
const def = (): MissionDefinition => getMission(MISSION_ID) as MissionDefinition;
const stages = () => def().stages ?? [];
const blocks = (): Record<string, any> => (def().blocks ?? {}) as Record<string, any>;

const EXPECTED_STAGE_ORDER = [
  'intel_pdf',
  'vpn_app',
  'domain_prep',
  'page_cloner',
  'number_prep',
  'vishing_call'
];

const EXPECTED_DECISIONS_PER_STAGE: Record<string, number[]> = {
  intel_pdf: [],
  vpn_app: [],
  domain_prep: [1],
  page_cloner: [],
  number_prep: [2],
  vishing_call: [3, 4, 5, 6, 7, 8, 9, 10]
};

const EXPECTED_COMPONENTS = [
  'chat',
  'bc_intel_pdf',
  'vpn_router',
  'choice_cards',
  'bc_page_cloner',
  'choice_cards',
  'bc_vishing_call',
  'debrief_app'
];

const EXPECTED_TIERS: Record<number, Record<ChoiceOutcome, string[]>> = {
  1: { ideal: ['archiwumbcorp_biz'], suboptimal: ['bcorp_pl', 'backup_bank_com'], critical: [] },
  2: { ideal: ['891_002_162'], suboptimal: ['891_003_427'], critical: ['867_452_026'] },
  3: { ideal: ['d3_ideal'], suboptimal: ['d3_dawid', 'd3_czesc'], critical: ['d3_hej'] },
  4: { ideal: ['d4_ideal'], suboptimal: ['d4_witnik', 'd4_marcin'], critical: ['d4_rybnik'] },
  5: { ideal: ['d5_ideal'], suboptimal: ['d5_logistyka', 'd5_wsparcie'], critical: ['d5_sprzedaz'] },
  6: { ideal: ['d6_ideal'], suboptimal: ['d6_klient'], critical: ['d6_nudzi', 'd6_raporty'] },
  7: { ideal: ['d7_ideal'], suboptimal: ['d7_dawid', 'd7_wolne', 'd7_darek'], critical: [] },
  8: { ideal: ['d8_ideal'], suboptimal: ['d8_dlugo', 'd8_czlowiek'], critical: [] },
  9: { ideal: ['d9_ideal'], suboptimal: ['d9_mojego', 'd9_ekstra'], critical: ['d9_podstawiona'] },
  10: { ideal: ['d10_ideal'], suboptimal: ['d10_tylko_ty', 'd10_byle_szybko'], critical: [] }
};

function collectDecisions(): Record<number, { question: string; options: any[] }> {
  const result: Record<number, { question: string; options: any[] }> = {};
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.decisionNum === 'number' && Array.isArray(node.options)) {
      result[node.decisionNum] = { question: node.question, options: node.options };
    }
    Object.values(node).forEach(visit);
  };
  Object.values(blocks()).forEach(visit);
  return result;
}

function collectAssets(): Array<{ group: string; name: string }> {
  const found: Array<{ group: string; name: string }> = [];
  const seen = new Set<string>();
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    const keys = Object.keys(node);
    if (keys.length === 2 && keys.includes('group') && keys.includes('name')) {
      const k = `${node.group}/${node.name}`;
      if (!seen.has(k)) {
        seen.add(k);
        found.push(node);
      }
    }
    Object.values(node).forEach(visit);
  };
  Object.values(blocks()).forEach(visit);
  return found;
}

function driveBridge() {
  for (let i = 0; i < 60; i++) {
    vi.runAllTimers();
    const st = useMissionStore.getState();
    if (st.timeJump) {
      st.endTimeJump();
      continue;
    }
    if (!st.pendingBridge) return;
    const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
    if (beat) useMissionStore.getState().chooseChatOption(beat.id);
    else return;
  }
}

const report = (num: number, tier: ChoiceOutcome, optionId?: string) =>
  useMissionStore.getState().reportDecision({
    num,
    question: `D${num}`,
    answer: 'X',
    tier,
    feedback: '',
    ...(optionId ? { optionId } : {})
  });

describe('Misja 5 — metadane, intro i raport (scenario.md)', () => {
  it('ładuje definicję z metadanymi Bank Bcorp (10 decyzji, próg 70%, 3.14 BTC, #00ff66)', () => {
    expect(def()).toBeDefined();
    expect(def().mission.id).toBe(MISSION_ID);
    expect(def().mission.title).toBe('MISJA 5 – BANK BCORP');
    expect(def().mission.targetCompany).toBe('Bank Bcorp');
    expect(def().mission.systemOs).toBe('//HACKERS.OS');
    expect(def().mission.rewardBtc).toBe(3.14);
    expect(def().mission.maxScore).toBe(100);
    expect(def().mission.hideLiveScore).toBe(true);
    expect(def().mission.decisionCount).toBe(10);
    expect(def().mission.passingScore).toBe(70);
    expect(def().mission.accentColor).toBe('#00ff66');
    expect(def().mission.date).toBe('19.05.2026');
    expect(def().mission.idleHints).toEqual({ t1Ms: 30000, t2Ms: 90000 });
    expect(resolveDecisionCount(def())).toBe(10);
  });

  it('intro: BYTE_MASTER, POŁĄCZENIE PRZYCHODZĄCE, 7 kwestii 1:1, brak firstChoice, odblokowanie intel_pdf', () => {
    const intro = def().intro as any;
    expect(intro.callerName).toBe('BYTE_MASTER');
    expect(intro.callStatus).toBe('POŁĄCZENIE PRZYCHODZĄCE');
    expect(intro.firstChoice).toBeUndefined();
    expect(intro.dialogue.length).toBe(7);
    expect(intro.dialogue[0].text).toBe('MAM DLA CIEBIE KOLEJNE ZADANIE');
    expect(intro.dialogue[6].text).toBe('SPRAWDŹMY TO');
    expect(intro.dialogue[6].playerResponse).toBeUndefined();
    expect(intro.firstUnlock).toEqual({
      unlockIcons: ['intel_pdf_unlocked'],
      badges: { intel_pdf: 1 },
      highlightTile: 'intel_pdf'
    });
    expect(intro.startBadges).toEqual({ chat: 1 });
  });

  it('raport: 10 pozycji, bez educationalSlides, tytuł ZHAKOWANO BANK BCORP, lekcje attack/defense', () => {
    expect(def().step6.choices.length).toBe(10);
    expect(def().step6.educationalSlides).toBeUndefined();
    expect(def().step6.summary).toMatchObject({
      title: 'ZHAKOWANO BANK BCORP',
      subtitle: 'UKOŃCZONO ZADANIE 5',
      company: 'Bank Bcorp',
      scorePercent: 100,
      perfectChoices: 10,
      goodChoices: 0,
      criticalErrors: 0,
      btcReward: 3.14
    });
    def().step6.choices.forEach((c) => {
      expect(c.correct).toBe(true);
      expect((c.attack ?? '').length, `attack D${c.num}`).toBeGreaterThan(40);
      expect((c.defense ?? '').length, `defense D${c.num}`).toBeGreaterThan(40);
    });
  });
});

describe('Misja 5 — struktura etapów, decyzje D1–D10 i mostki', () => {
  it('kolejność etapów: intel_pdf -> vpn_app -> domain_prep -> page_cloner -> number_prep -> vishing_call', () => {
    expect(stages().map((s) => s.id)).toEqual(EXPECTED_STAGE_ORDER);
    expect(stages().map((s) => s.appId)).toEqual(EXPECTED_STAGE_ORDER);
  });

  it('pulpit: czat pierwszy, potem 6 etapów, raport na końcu; komponenty zarejestrowane', () => {
    expect(def().desktopApps.map((t) => t.id)).toEqual(['chat_shortcut', ...EXPECTED_STAGE_ORDER, 'debrief_app']);
    expect(def().desktopApps.map((t) => t.componentId)).toEqual(EXPECTED_COMPONENTS);
    def().desktopApps.forEach((t) => expect(appComponentRegistry[t.componentId], t.componentId).toBeDefined());
    expect(def().desktopApps.filter((t) => !t.unlockedOnly).map((t) => t.id)).toEqual(['chat_shortcut']);
    stages().forEach((s) => {
      const tile = def().desktopApps.find((t) => t.id === s.appId);
      expect(tile, s.appId).toBeDefined();
      expect(tile!.unlockedOnly).toBe(true);
      expect(tile!.requiredUnlockId).toBeTruthy();
      expect(blocks()[s.appId], `blocks.${s.appId}`).toBeDefined();
    });
  });

  it('każda decyzja 1..10 jest w dokładnie jednym etapie, w step6.choices i w klocku z identycznym pytaniem i idealną odpowiedzią', () => {
    const decisions = collectDecisions();
    expect(Object.keys(decisions).length).toBe(10);
    stages().forEach((s) => expect(s.decisions).toEqual(EXPECTED_DECISIONS_PER_STAGE[s.appId]));

    for (let k = 1; k <= 10; k++) {
      expect(stages().filter((s) => (s.decisions ?? []).includes(k)).length, `stages D${k}`).toBe(1);
      const stepChoice = def().step6.choices.filter((c) => c.num === k);
      expect(stepChoice.length, `step6 D${k}`).toBe(1);
      expect(decisions[k], `block D${k}`).toBeDefined();
      expect(decisions[k].question, `pytanie ekran=raport D${k}`).toBe(stepChoice[0].question);
      const ideal = decisions[k].options.find((o) => o.tier === 'ideal');
      expect(ideal, `opcja ideal D${k}`).toBeDefined();
      expect(ideal.label, `odpowiedź ideal=raport D${k}`).toBe(stepChoice[0].answer);
    }
  });

  it('poziomy opcji i odrzucenia B2 dla D1–D10 zgodne ze scenario.md', () => {
    const decisions = collectDecisions();
    for (let k = 1; k <= 10; k++) {
      const opts = decisions[k].options as Array<{ id: string; tier: ChoiceOutcome; reject?: { mentorLine: string } }>;
      const expected = EXPECTED_TIERS[k];
      expect(opts.filter((o) => o.tier === 'ideal').length, `D${k} ideal count`).toBe(1);
      const allIds = [...expected.ideal, ...expected.suboptimal, ...expected.critical].sort();
      expect(opts.map((o) => o.id).sort(), `D${k} ids`).toEqual(allIds);
      (['ideal', 'suboptimal', 'critical'] as ChoiceOutcome[]).forEach((tier) => {
        expected[tier].forEach((id) => {
          expect(opts.find((o) => o.id === id)!.tier, `D${k} ${id}`).toBe(tier);
        });
      });
    }

    // D1: ChoiceCards z info i B2 na backup_bank_com
    expect(domainPrepConfig.info?.text).toBe('HTTPS://MAIL.BCORP.BIZ');
    const d1Backup = domainPrepConfig.options.find((o) => o.id === 'backup_bank_com')!;
    expect(d1Backup.reject?.mentorLine).toContain('W TEJ DOMENIE NIE MA NAWET NAZWY BANKU BCORP');

    // D2: ChoiceCards z info (szablon + 4 działy), B2 na logistyce, critical z failTitle/failText na 867_452_026
    expect(numberPrepConfig.info?.text).toContain('891 [NR DZIAŁU] [NR PRACOWNIKA]');
    expect(numberPrepConfig.info?.items?.length).toBe(4);
    const d2Log = numberPrepConfig.options.find((o) => o.id === '891_003_427')!;
    expect(d2Log.reject?.mentorLine).toContain('LOGISTYKI');
    const d2Crit = numberPrepConfig.options.find((o) => o.id === '867_452_026')!;
    expect(d2Crit.failTitle).toBe('ZOSTAŁEŚ WYKRYTY!');
    expect(d2Crit.failText).toBeTruthy();

    // D5: 2 opcje B2 (logistyka, wsparcie klienta)
    const d5 = vishingCallConfig.turns.find((t) => t.decisionNum === 5)!;
    expect(d5.options.find((o) => o.id === 'd5_logistyka')!.reject?.mentorLine).toContain('LOGISTYKA');
    expect(d5.options.find((o) => o.id === 'd5_wsparcie')!.reject?.mentorLine).toContain('WSPARCIE KLIENTA');
  });

  it('etap 1 (PDF), etap 2 (VPN bramka bez decisionNum), etap 4 (kloner) i etap 6 (vishing 2 fazy) zgodne ze scenario.md', () => {
    expect(intelPdfConfig.points).toHaveLength(4);
    expect(vpnConfig.decisionNum).toBeUndefined();
    expect(vpnConfig.initialIp).toBe('90.55.202.120');
    expect(vpnConfig.targetIp).toBe('82.45.195.130');
    expect(vpnConfig.allowAiSync).toBe(true);
    expect(pageClonerConfig.elements.map((e) => e.id)).toEqual(['logo', 'login', 'password', 'submit']);
    expect(pageClonerConfig.footerText).toBe('BCORP BANK © 2024');
    expect(vishingCallConfig.turns.map((t) => t.decisionNum)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
    expect(vishingCallConfig.phase2.capturedLogin).toBe('FWOJCIK67');
    expect(vishingCallConfig.phase2.capturedPasswordMasked).toBe('••••••••••••••');
    expect(vishingCallConfig.phase2.capturedSmsCode).toBe('48212');
    expect(vishingCallConfig.phase2.reports.map((r) => r.title)).toEqual([
      'RAPORT FINANSOWY 2021',
      'RAPORT FINANSOWY 2022'
    ]);
  });

  it('mostki etapów 1–5 mają po jednym spójniku gracza [SPÓJNIK] i badge chat: 1; etap 6 ma 6 beatów (3 warianty) i badge chat: 1', () => {
    stages()
      .slice(0, 5)
      .forEach((s) => {
        const conv = s.completion.conversation ?? [];
        expect(conv, `mostek ${s.id}`).toHaveLength(1);
        expect(conv[0], `spójnik ${s.id}`).toMatchObject({ from: 'player' });
        expect(s.completion.badges, `badges ${s.id}`).toHaveProperty('chat', 1);
      });
    const last = stages()[5];
    expect(last.completion.conversation?.length).toBe(6);
    expect(last.completion.badges).toEqual({ debrief_app: 1, chat: 1 });
    expect(last.completion.highlightTile).toBe('debrief_app');
    expect(last.completion.unlockIcons).toEqual(['mission_completed', 'debrief_app']);
  });

  it('assety: grupy intel i site mają .gitkeep oraz odpowiadają odwołaniom w configach', () => {
    const refs = collectAssets();
    expect(refs).toEqual([
      { group: 'intel', name: 'filip_wojcik' },
      { group: 'site', name: 'bcorp_logo' }
    ]);
    for (const group of ['intel', 'site']) {
      const keep = fileURLToPath(
        new URL(`../src/scenarios/mission_05_bank_bcorp/assets/${group}/.gitkeep`, import.meta.url)
      );
      expect(fs.existsSync(keep), `assets/${group}/.gitkeep`).toBe(true);
    }
  });
});

describe('Misja 5 — przepływ przez silnik i 3 warianty mostka końcowego', () => {
  beforeEach(() => {
    scorm2004.reset();
    useMissionStore.getState().resetGame();
    MockLRS.clear();
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(MISSION_ID);
  });

  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  it('przejście idealne (100%, bez odrzuceń): odblokowania etapów 1–5, Wariant 1 mostka końcowego i zapis SCORM', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();

    expect(useMissionStore.getState().unlockedIcons).toContain('intel_pdf_unlocked');
    expect(useMissionStore.getState().highlightedTileId).toBe('intel_pdf');

    // Etapy 1–5
    store.completeStage('intel_pdf');
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('vpn_unlocked');
    expect(useMissionStore.getState().notificationBadges.chat).toBe(1);

    store.completeStage('vpn_app');
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('domain_prep_unlocked');

    report(1, 'ideal', 'archiwumbcorp_biz');
    store.completeStage('domain_prep');
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('page_cloner_unlocked');

    store.completeStage('page_cloner');
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('number_prep_unlocked');

    report(2, 'ideal', '891_002_162');
    store.completeStage('number_prep');
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('vishing_call_unlocked');

    // Etap 6: D3–D10 ideal
    for (let k = 3; k <= 10; k++) report(k, 'ideal', `d${k}_ideal`);
    store.completeStage('vishing_call');

    // Najpierw kwestia gracza z Wariantu 1, raport jeszcze zablokowany
    const mid = useMissionStore.getState();
    expect(mid.unlockedIcons).not.toContain('debrief_app');
    expect(mid.chatAvailableChoices).toEqual([
      {
        id: 'm5_reply_end_perfect',
        label:
          'MAM RAPORTY FINANSOWE BANKU BCORP Z 2021 I 2022 ROKU. FILIP NAWET NIE ZORIENTOWAŁ SIĘ, ŻE JEGO HASŁO I KOD SMS TRAFIŁY DO NAS.',
        bridgeBeat: true
      }
    ]);

    driveBridge();
    const fin = useMissionStore.getState();
    expect(fin.score).toBe(100);
    expect(fin.btcReward).toBe(3.14);
    expect(fin.unlockedIcons).toContain('debrief_app');
    expect(fin.unlockedIcons).toContain('mission_completed');
    expect(fin.highlightedTileId).toBe('debrief_app');
    expect(fin.chatMessages.map((m) => m.text)).toContain(
      'CZYSTA ROBOTA. ZERO WPADEK, ZERO WĄTPLIWOŚCI. Z TAKIMI RAPORTAMI W KOŃCU ZOBACZYMY, KTO FINANSUJE TĘ RAFINERIĘ. BĘDĄ Z CIEBIE LUDZIE.'
    );

    const submit = store.submitScormAndExit();
    expect(submit.success).toBe(true);
    const api = scorm2004.getApi() as MockSCORM2004;
    expect(api.GetValue('cmi.success_status')).toBe('passed');
    expect(api.GetValue('cmi.score.raw')).toBe('100');
    const statement = createMissionCompletionStatement(
      { name: 'Agent', mbox: 'mailto:agent@example.com' },
      100,
      'Mission 5 completed',
      def().mission
    );
    expect(statement.result.success).toBe(true);
  });

  it('mostek końcowy — Wariant 2 (słabiej, wynik >= 70%, w tym po odrzuceniu B2)', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();

    // B2 odrzucenie w D1, potem ideal (wynik = 95% >= 70%)
    store.rejectDecision({
      num: 1,
      question: domainPrepConfig.question,
      optionId: 'backup_bank_com',
      answer: 'BACKUP-BANK.COM',
      tier: 'suboptimal',
      mentorLine: 'W TEJ DOMENIE NIE MA NAWET NAZWY BANKU BCORP.'
    });
    report(1, 'ideal', 'archiwumbcorp_biz');
    report(2, 'ideal', '891_002_162');
    for (let k = 3; k <= 10; k++) report(k, 'ideal', `d${k}_ideal`);

    store.completeStage('vishing_call');
    expect(useMissionStore.getState().chatAvailableChoices.map((c) => c.id)).toEqual(['m5_reply_end_passing']);
    driveBridge();

    const fin = useMissionStore.getState();
    expect(fin.score).toBe(95);
    const texts = fin.chatMessages.map((m) => m.text);
    expect(texts).toContain(
      'MAM RAPORTY FINANSOWE BANKU BCORP Z 2021 I 2022 ROKU, CHOĆ PO DRODZE BYŁO NERWOWO.'
    );
    expect(texts).toContain(
      'WAŻNE, ŻE RAPORTY SĄ U NAS, ALE NIE OBYŁO SIĘ BEZ WPADEK. NASTĘPNYM RAZEM PILNUJ SZCZEGÓŁÓW.'
    );
    expect(texts).not.toContain(
      'CZYSTA ROBOTA. ZERO WPADEK, ZERO WĄTPLIWOŚCI. Z TAKIMI RAPORTAMI W KOŃCU ZOBACZYMY, KTO FINANSUJE TĘ RAFINERIĘ. BĘDĄ Z CIEBIE LUDZIE.'
    );
    expect(fin.unlockedIcons).toContain('debrief_app');
  });

  it('mostek końcowy — Wariant 2 na progu 70% (6 suboptimal + 4 ideal)', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();

    for (let k = 1; k <= 6; k++) report(k, 'suboptimal');
    for (let k = 7; k <= 10; k++) report(k, 'ideal');

    expect(useMissionStore.getState().score).toBe(70);
    store.completeStage('vishing_call');
    expect(useMissionStore.getState().chatAvailableChoices.map((c) => c.id)).toEqual(['m5_reply_end_passing']);
    driveBridge();
    expect(useMissionStore.getState().chatMessages.map((m) => m.text)).toContain(
      'WAŻNE, ŻE RAPORTY SĄ U NAS, ALE NIE OBYŁO SIĘ BEZ WPADEK. NASTĘPNYM RAZEM PILNUJ SZCZEGÓŁÓW.'
    );
  });

  it('mostek końcowy — Wariant 3 (wynik < 70%, np. 7 suboptimal + 3 ideal = 65%)', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();

    for (let k = 1; k <= 7; k++) report(k, 'suboptimal');
    for (let k = 8; k <= 10; k++) report(k, 'ideal');

    expect(useMissionStore.getState().score).toBe(65);
    store.completeStage('vishing_call');
    expect(useMissionStore.getState().chatAvailableChoices.map((c) => c.id)).toEqual(['m5_reply_end_below']);
    driveBridge();

    const fin = useMissionStore.getState();
    const texts = fin.chatMessages.map((m) => m.text);
    expect(texts).toContain('RAPORTY POBRANE, ALE PO DRODZE BYŁO SPORO WPADEK.');
    expect(texts).toContain(
      'TYM RAZEM SIĘ UDAŁO TYLKO DLATEGO, ŻE FILIP MIAŁ SPOTKANIE. ZA DUŻO BŁĘDÓW JAK NA JEDNĄ ROZMOWĘ — PRZEJRZYJ RAPORT I POPRAW TO.'
    );
    expect(fin.unlockedIcons).toContain('debrief_app');
  });

  it.each([2, 3, 4, 5, 6, 9])('błąd krytyczny w D%i otwiera ekran wykrycia i obniża wynik', (num) => {
    report(num, 'critical');
    const s = useMissionStore.getState();
    expect(s.isDetectedModalOpen).toBe(true);
    expect(s.criticalErrorsCount).toBe(1);
    expect(s.score).toBeLessThan(100);
  });
});

describe('Misja 5 — czystość danych (brak TODO)', () => {
  it('w danych misji nie ma znaczników TODO_VR ani TODO_WŁAŚCICIEL', () => {
    const json = JSON.stringify({ def: def(), blocks: def().blocks });
    expect(json).not.toContain('TODO_VR');
    expect(json).not.toContain('TODO_WŁAŚCICIEL');
  });
});
