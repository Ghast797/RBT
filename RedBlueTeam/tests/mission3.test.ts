import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { resolveDecisionCount } from '../src/engine/core/scoring';
import type { ChoiceOutcome, MissionDefinition } from '../src/engine/types/mission';
import type { OsintBrowserConfig } from '../src/scenarios/mission_03_ol_company/minigames/types';
import { resolveTargetPick, targetCardContent } from '../src/scenarios/mission_03_ol_company/minigames/osintLogic';
import {
  validateBuilder,
  GROUP_KEYS,
  BUILDER_INCOMPLETE_MESSAGE,
  type BuilderPick
} from '../src/scenarios/mission_03_ol_company/minigames/builderLogic';
import type { VirusLabConfig } from '../src/scenarios/mission_03_ol_company/minigames/types';

// ---------------------------------------------------------------------------
// TESTY MISJI 3 (O&L COMPANY), wzorzec B (etapy + klocki/minigry, jak M2/M4)
//
// Opisują CO ma się dziać w misji: spójność danych (etapy, decyzje, raport),
// przepływ przez silnik (decyzje, mostki, przeskoki czasu) i czystą logikę
// minigier (cel D2, builder RAT). Szczegóły UI sprawdza się w przeglądarce.
// ---------------------------------------------------------------------------

const MISSION_ID = 'mission-3-ol-company';

/** Oczekiwana kolejność etapów (jedna aplikacja = jeden kafelek). */
const EXPECTED_STAGE_ORDER = [
  'virus_database', // D1 (+ builder RAT jako flavor bez oceny)
  'browser',        // D2 (cel), D3 (wektor)
  'pendrive_app',   // D4 (załącznik), D5 (wolumin), D6 (koperta)
  'drone_app',      // D7 (adres), D8 (pojazd)
  'rat_session'     // finał bez oceny
];

/** Mapowanie decyzji na etapy — 8 ocenianych decyzji. */
const EXPECTED_DECISIONS_PER_STAGE: Record<string, number[]> = {
  virus_database: [1],
  browser: [2, 3],
  pendrive_app: [4, 5, 6],
  drone_app: [7, 8],
  rat_session: []
};

/** Poziom opcji idealnej/suboptymalnej/krytycznej per decyzja (ze starego zachowania). */
const EXPECTED_TIERS: Record<number, Record<ChoiceOutcome, string[]>> = {
  // D1: RAT ideal, keylogger suboptimal, ransomware critical
  1: { ideal: ['rat'], suboptimal: ['keylogger'], critical: ['ransomware'] },
  // D2: Mateusz ideal, CEO + Logistyka suboptimal (powrót mentora), CISO critical
  2: { ideal: ['choose_mateusz'], suboptimal: ['choose_ceo', 'choose_logistics'], critical: ['choose_ciso'] },
  // D3: impreza/ZIP ideal, faktura .exe critical
  3: { ideal: ['vector_party_zip'], suboptimal: [], critical: ['vector_fake_invoice'] },
  // D4: zdjęcia ideal, dokumenty HR suboptimal, wypowiedzenie critical
  4: { ideal: ['party_photos'], suboptimal: ['hr_docs'], critical: ['termination'] },
  // D5: IMPREZA ideal, B&D + NOWY DYSK suboptimal, KEYLOGGER critical
  5: { ideal: ['vol_impreza'], suboptimal: ['vol_bbd', 'vol_new_disk'], critical: ['vol_keylogger'] },
  // D6: afterparty ideal, B&D + zgubione suboptimal, wypowiedzenie critical
  6: { ideal: ['env_afterparty'], suboptimal: ['env_bbd', 'env_lost_docs'], critical: ['env_termination'] },
  // D7: Ołtaszyńska 92C ideal, pozostałe adresy critical
  7: { ideal: ['loc_4'], suboptimal: [], critical: ['loc_1', 'loc_2', 'loc_3'] },
  // D8: biały z czerwonym dachem ideal, pozostałe pojazdy critical
  8: { ideal: ['car_4'], suboptimal: [], critical: ['car_1', 'car_2', 'car_3', 'car_5', 'car_6'] }
};

/** Decyzje, których błędny wybór prowadzi do ekranu „ZOSTAŁEŚ WYKRYTY!”. */
const DECISIONS_WITH_CRITICAL = [1, 2, 3, 4, 5, 6, 7, 8];

/** Przegrywa rozmowę mostkującą do końca (flush kwestii mentora, klik kwestii gracza, przeskok czasu). */
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

describe('Misja 3 — dane, które przetrwają migrację', () => {
  it('ładuje definicję z metadanymi O&L Company', () => {
    const def = getMission(MISSION_ID);
    expect(def).toBeDefined();
    expect(def?.mission.id).toBe(MISSION_ID);
    expect(def?.mission.title).toContain('O&L COMPANY');
    expect(def?.mission.targetCompany).toBe('O&L Company');
    expect(def?.mission.rewardBtc).toBe(4.02);
  });

  it('ma 8 ocenianych decyzji (pula punktów = step6.choices)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    expect(def.step6.choices.length).toBe(8);
    expect(resolveDecisionCount(def)).toBe(8);
  });

  it('raport końcowy: odpowiedź idealna każdej decyzji to dosłownie etykieta opcji ideal z klocków', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const decisions = collectDecisions((def.blocks ?? {}) as Record<string, any>);
    for (let k = 1; k <= 8; k++) {
      const choice = def.step6.choices.find((c: any) => c.num === k) as any;
      expect(choice, `step6.choices D${k}`).toBeDefined();
      const ideal = decisions[k].options.find((o) => o.tier === 'ideal')!;
      expect(choice.answer, `D${k}: odpowiedź idealna w raporcie`).toBe(ideal.label);
    }
  });

  it('intro z BYTE_MASTEREM zawiera kluczowe kwestie mentora (FREEVOLT, kreatywność)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const allText = def.intro.dialogue.map((d: any) => `${d.text} ${d.playerResponse ?? ''}`).join(' ');
    expect(allText).toContain('FREEVOLT');
    expect(allText.toLowerCase()).toContain('kreatyw');
    expect(def.intro.dialogue.length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// STRUKTURA ETAPÓW — kolejność, decyzje, kafelki i dane klocków (`stages.ts` / `blocks`).
// ---------------------------------------------------------------------------
describe('Misja 3 — struktura etapów (wzorzec B)', () => {
  it('kolejność etapów: wirus -> OSINT -> pendrive -> dron -> sesja RAT', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const stages = def.stages ?? [];
    expect(stages.map((s) => s.appId)).toEqual(EXPECTED_STAGE_ORDER);
  });

  it('każdy appId etapu istnieje w desktopApps, a jego komponent jest zarejestrowany', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const stages = def.stages ?? [];
    const tiles = def.desktopApps;
    stages.forEach((s) => {
      const tile = tiles.find((t) => t.id === s.appId);
      expect(tile, `kafelek dla etapu ${s.appId}`).toBeDefined();
      // index.ts rejestruje componentId minigier globalnie przez registerApp.
      expect(appComponentRegistry[tile!.componentId], `komponent ${tile!.componentId}`).toBeDefined();
    });
  });

  it('decyzje rozłożone na etapy: [1],[2,3],[4,5,6],[7,8],[]', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const stages = def.stages ?? [];
    stages.forEach((s) => {
      expect(s.decisions ?? []).toEqual(EXPECTED_DECISIONS_PER_STAGE[s.appId]);
    });
  });

  it('każda decyzja 1..8 jest w dokładnie jednym etapie i w step6.choices', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const stages = def.stages ?? [];
    for (let k = 1; k <= 8; k++) {
      expect(stages.filter((s) => (s.decisions ?? []).includes(k)).length).toBe(1);
      expect(def.step6.choices.filter((c: any) => c.num === k).length).toBe(1);
    }
  });

  it('kafelki odblokowują się łańcuchem (jeden jasny następny krok)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const tiles = def.desktopApps;
    const byId = Object.fromEntries(tiles.map((t) => [t.id, t]));
    // Na starcie odblokowany jest tylko czat; bazę wirusów odblokowuje intro.firstUnlock.
    const baseUnlocked = tiles.filter((t) => !t.unlockedOnly).map((t) => t.id);
    expect(baseUnlocked).toEqual(['chat_shortcut']);
    expect((def.intro as any).firstUnlock?.unlockIcons).toContain('virus_database');
    // Każdy etap przebiegu jest zablokowany do odblokowania przez mostek.
    ['virus_database', 'browser', 'pendrive_app', 'drone_app', 'rat_session'].forEach((id) => {
      expect(byId[id]?.unlockedOnly, id).toBe(true);
      expect(byId[id]?.requiredUnlockId, id).toBeTruthy();
    });
  });

  it('mostek pendrive -> dron zawiera przeskok czasu (czekanie na ofiarę)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const stages = def.stages ?? [];
    const pendrive = stages.find((s) => s.appId === 'pendrive_app');
    const beats = pendrive?.completion.conversation ?? [];
    expect(beats.some((b: any) => b.from === 'time_jump')).toBe(true);
  });

  it('blocks: poziomy opcji każdej decyzji zgodne ze starym zachowaniem', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const blocks = (def.blocks ?? {}) as Record<string, any>;
    // Zbiera wszystkie opcje ocenianych decyzji z danych klocków.
    const optionsByDecision = collectOptionsByDecision(blocks);
    for (let k = 1; k <= 8; k++) {
      const opts = optionsByDecision[k];
      expect(opts, `opcje decyzji ${k}`).toBeDefined();
      // Dokładnie jedna opcja idealna.
      expect(opts.filter((o) => o.tier === 'ideal').length).toBe(1);
      const exp = EXPECTED_TIERS[k];
      (['ideal', 'suboptimal', 'critical'] as ChoiceOutcome[]).forEach((tier) => {
        exp[tier].forEach((id) => {
          const found = opts.find((o) => o.id === id);
          expect(found, `opcja ${id} (D${k})`).toBeDefined();
          expect(found!.tier, `${id} tier`).toBe(tier);
        });
      });
    }
  });
});

interface DecisionData {
  question: string;
  options: Array<{ id: string; label: string; tier: ChoiceOutcome }>;
}

/** Wyciąga pytanie i opcje {id,label,tier} per numer decyzji z `blocks` niezależnie od kształtu minigry. */
function collectDecisions(blocks: Record<string, any>): Record<number, DecisionData> {
  const result: Record<number, DecisionData> = {};
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.decisionNum === 'number' && Array.isArray(node.options)) {
      result[node.decisionNum] = {
        question: node.question,
        options: node.options.map((o: any) => ({ id: o.id, label: o.label, tier: o.tier }))
      };
    }
    Object.values(node).forEach(visit);
  };
  Object.values(blocks).forEach(visit);
  return result;
}

/** Wyciąga opcje {id,tier} per numer decyzji z `blocks`. */
function collectOptionsByDecision(blocks: Record<string, any>): Record<number, Array<{ id: string; tier: ChoiceOutcome }>> {
  return Object.fromEntries(
    Object.entries(collectDecisions(blocks)).map(([num, d]) => [num, d.options.map(({ id, tier }) => ({ id, tier }))])
  );
}

// ---------------------------------------------------------------------------
// PRZEPŁYW WZORCA B — silnik: completeStage + reportDecision + rozmowy mostkujące.
// Niezależny od wewnętrznej UI minigier.
// ---------------------------------------------------------------------------
describe('Misja 3 — przepływ wzorca B przez silnik', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(MISSION_ID);
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  it('same idealne decyzje -> 100%, pełna nagroda BTC, 0 wpadek', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge(); // intro -> odblokowanie bazy wirusów

    const ideal = (num: number) =>
      store.reportDecision({ num, question: `D${num}`, answer: 'IDEAL', tier: 'ideal', feedback: '' });

    const def = useMissionStore.getState().activeMission;
    const stages = def.stages ?? [];
    stages.forEach((stage) => {
      (stage.decisions ?? []).forEach(ideal);
      store.completeStage(stage.id);
      driveBridge();
    });

    const final = useMissionStore.getState();
    expect(final.score).toBe(100);
    expect(final.btcReward).toBe(4.02);
    expect(final.criticalErrorsCount).toBe(0);
    expect(final.unlockedIcons).toContain('debrief_app');
  });

  DECISIONS_WITH_CRITICAL.forEach((num) => {
    it(`decyzja ${num} z poziomem critical otwiera ekran wykrycia`, () => {
      const store = useMissionStore.getState();
      store.reportDecision({ num, question: `D${num}`, answer: 'ZŁA', tier: 'critical', feedback: 'Wykryto.' });
      const st = useMissionStore.getState();
      expect(st.isDetectedModalOpen).toBe(true);
      expect(st.criticalErrorsCount).toBe(1);
      expect(st.score).toBeLessThan(100);
    });
  });
});

// ---------------------------------------------------------------------------
// MECHANIKI MINIGIER — czyste funkcje i dane, bez renderowania UI.
// ---------------------------------------------------------------------------
describe('Misja 3 — mechaniki minigier', () => {
  describe('builder RAT (validateBuilder)', () => {
    const builder = (): VirusLabConfig['builder'] =>
      ((getMission(MISSION_ID) as MissionDefinition).blocks as Record<string, any>).virus_database.builder;
    const correctPick = (): BuilderPick =>
      Object.fromEntries(GROUP_KEYS.map((k) => [k, builder()[k].options.find((o) => o.correct)!.id])) as BuilderPick;

    it('w każdej grupie dokładnie jedna opcja jest poprawna: reverse_tcp + bg_service + dll_archive', () => {
      GROUP_KEYS.forEach((k) => expect(builder()[k].options.filter((o) => o.correct)).toHaveLength(1));
      expect(correctPick()).toEqual({ modules: 'reverse_tcp', masking: 'bg_service', package: 'dll_archive' });
    });

    it('niepełny wybór nie zaczyna kompilacji', () => {
      expect(validateBuilder(builder(), { modules: null, masking: null, package: null })).toEqual({
        kind: 'incomplete',
        message: BUILDER_INCOMPLETE_MESSAGE
      });
      expect(validateBuilder(builder(), { ...correctPick(), masking: null }).kind).toBe('incomplete');
    });

    it('zły parametr blokuje kompilację komunikatem z feedbackiem opcji, bez naliczenia decyzji', () => {
      const before = useMissionStore.getState().playerChoices.length;
      GROUP_KEYS.forEach((group) => {
        builder()[group].options
          .filter((o) => !o.correct)
          .forEach((wrongOption) => {
            const result = validateBuilder(builder(), { ...correctPick(), [group]: wrongOption.id });
            expect(result).toEqual({
              kind: 'wrong',
              group,
              message: `BŁĄD KOMPILACJI: ${wrongOption.feedback}`
            });
          });
      });
      // Funkcja jest czysta: builder nie zgłasza decyzji (aktywność nieoceniana).
      expect(useMissionStore.getState().playerChoices.length).toBe(before);
    });

    it('przy kilku błędach zgłasza pierwszą złą grupę w kolejności modułu, maskowania, pakietu', () => {
      const wrongPick = Object.fromEntries(
        GROUP_KEYS.map((k) => [k, builder()[k].options.find((o) => !o.correct)!.id])
      ) as BuilderPick;
      expect(validateBuilder(builder(), wrongPick)).toMatchObject({ kind: 'wrong', group: 'modules' });
    });

    it('poprawny zestaw (reverse_tcp + bg_service + dll_archive) kończy kompilację sukcesem', () => {
      expect(validateBuilder(builder(), correctPick())).toEqual({ kind: 'ok' });
    });
  });
  it('cel D2: wybór CEO/Logistyki cofa do ponownego wyboru, a końcowe D2 agreguje się do suboptimal', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const cfg = (def.blocks as Record<string, any>).browser as OsintBrowserConfig;
    const byId = (id: string) => cfg.target.options.find((o) => o.id === id)!;

    // Zły cel (suboptimal): brak decyzji, pushback mentora = feedback opcji.
    for (const id of ['choose_ceo', 'choose_logistics']) {
      const res = resolveTargetPick(byId(id), false);
      expect(res).toEqual({ kind: 'retry', pushback: byId(id).feedback });
    }
    // Poprawny cel bez złych prób = ideal, po złej próbie = suboptimal (agregacja).
    expect(resolveTargetPick(byId('choose_mateusz'), false)).toEqual({ kind: 'proceed', tier: 'ideal' });
    expect(resolveTargetPick(byId('choose_mateusz'), true)).toEqual({ kind: 'proceed', tier: 'suboptimal' });
  });

  it('cel D2: wybór CISO natychmiast zgłasza critical (bez ponownego wyboru), nawet po złej próbie', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const cfg = (def.blocks as Record<string, any>).browser as OsintBrowserConfig;
    const ciso = cfg.target.options.find((o) => o.id === 'choose_ciso')!;
    expect(resolveTargetPick(ciso, false)).toEqual({ kind: 'critical' });
    expect(resolveTargetPick(ciso, true)).toEqual({ kind: 'critical' });
  });

  describe('D2/D3 przez silnik', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      __setBridgeDelayForTests(0);
      useMissionStore.getState().loadMission(MISSION_ID);
    });
    afterEach(() => {
      vi.useRealTimers();
      __setBridgeDelayForTests(2000);
    });

    const report = (num: number, tier: ChoiceOutcome) =>
      useMissionStore.getState().reportDecision({ num, question: `D${num}`, answer: 'X', tier, feedback: '' });

    it('Mateusz po złej próbie: D2 suboptimal obniża wynik, nie wykrywa', () => {
      report(2, 'suboptimal');
      const st = useMissionStore.getState();
      expect(st.isDetectedModalOpen).toBe(false);
      expect(st.criticalErrorsCount).toBe(0);
      expect(st.score).toBeLessThan(100);
      expect(st.playerChoices.find((c) => c.num === 2)?.outcome).toBe('suboptimal');
    });

    it('CISO (D2) otwiera ekran wykrycia', () => {
      report(2, 'critical');
      expect(useMissionStore.getState().isDetectedModalOpen).toBe(true);
      expect(useMissionStore.getState().playerChoices.find((c) => c.num === 2)?.outcome).toBe('critical');
    });

    it('faktura .exe (D3) otwiera ekran wykrycia', () => {
      report(3, 'critical');
      expect(useMissionStore.getState().isDetectedModalOpen).toBe(true);
    });
  });

  it('//TOR: jedno źródło danych strony i notatka mentora (bez pól oceniających i bez podpowiedzi w opisach)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const cfg = (def.blocks as Record<string, any>).browser as OsintBrowserConfig;
    // Dane strony pełne i bez pola isTarget.
    expect(cfg.site.employees.length).toBeGreaterThanOrEqual(5);
    expect(cfg.site.news.length).toBeGreaterThanOrEqual(2);
    cfg.site.employees.forEach((e) => expect(e).not.toHaveProperty('isTarget'));
    expect(cfg).not.toHaveProperty('eventsHint');
    // Każda karta celu D2 ma swojego pracownika z bio na stronie (OSINT), jednoznacznie.
    cfg.target.options.forEach((o) => {
      const emps = cfg.site.employees.filter((e) => e.optionId === o.id);
      expect(emps, `pracownik dla ${o.id}`).toHaveLength(1);
      expect(emps[0].bio.length).toBeGreaterThan(20);
    });
    // Zakładka wydarzeń niesie imprezę działu sprzedaży (przesłanka do D3).
    expect(cfg.site.news.some((n) => /IMPREZA INTEGRACYJNA DZIAŁU SPRZEDAŻY/.test(n.boxText))).toBe(true);
    // Notatka mentora na prawym monitorze cytuje intro i mostek etapu 1 z danych.
    const virusStage = (def.stages ?? []).find((s) => s.id === 'virus_database')!;
    const bridgeLine = (virusStage.completion.conversation ?? []).find((b: any) => b.from === 'byte_master') as any;
    expect(cfg.mentorNote.target).toContain(bridgeLine.text);
    const introTexts = def.intro.dialogue.map((d: any) => d.text);
    expect(cfg.mentorNote.target.some((l) => introTexts.includes(l))).toBe(true);
    expect(cfg.mentorNote.vector.some((l) => introTexts.includes(l))).toBe(true);
    // D3: dwie opcje, ZIP ideal i .exe critical; opisy bez słów oceny.
    expect(cfg.vector.options.map((o) => [o.id, o.tier])).toEqual(
      expect.arrayContaining([['vector_party_zip', 'ideal'], ['vector_fake_invoice', 'critical']])
    );
    const EVALUATIVE = /idealn|najsłabsz|najlepsz|najgorsz|natychmiast|omija|usypia|wzbudza|ostrożn|słabe ogniwo/i;
    cfg.vector.options.forEach((o) => {
      expect(o.desc ?? '', o.id).not.toMatch(EVALUATIVE);
    });
    // Karta celu D2 pokazuje to, co daje targetCardContent: nazwisko z rolą i neutralny opis,
    // bez oceniającego bio. Bio z OSINT jest w panelu prawego monitora po zaznaczeniu karty.
    cfg.target.options.forEach((o) => {
      const card = targetCardContent(o);
      const emp = cfg.site.employees.find((e) => e.optionId === o.id)!;
      const shown = `${card.title} ${card.desc ?? ''}`;
      expect(shown, o.id).not.toMatch(EVALUATIVE);
      expect(shown, o.id).not.toContain(emp.bio);
      expect(card.desc ?? '', o.id).not.toBe(emp.bio);
      expect(shown, o.id).toContain(emp.name);
    });
  });
  it('pendrive i sesja RAT mają jedno źródło: nazwy archiwów w opcjach D4, wolumin z D5', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const blocks = def.blocks as Record<string, any>;
    const pendrive = blocks.pendrive_app;
    const rat = blocks.rat_session;
    pendrive.attachments.options.forEach((o: any) => expect(o.archive, o.id).toMatch(/^[A-Z0-9_]+\.ZIP$/));
    // Sesja RAT czyta archiwum z tych samych opcji (po numerze decyzji i etykiecie), a wolumin z D5.
    expect(rat.archiveDecisionNum).toBe(pendrive.attachments.decisionNum);
    expect(rat.archiveOptions).toBe(pendrive.attachments.options);
    expect(rat.volumeDecisionNum).toBe(pendrive.volume.decisionNum);
    expect(rat.fallback.archive).toMatch(/\.ZIP$/);
    // Każda etykieta D4 jest unikalna, więc odpowiedź gracza jednoznacznie wskazuje archiwum.
    const labels = pendrive.attachments.options.map((o: any) => o.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
  it.todo('pendrive D4: tylko jeden załącznik można wgrać, potem wymagane podpięcie RAT do ZIP (flavor)');
  it('dron: adres i pojazd to osobne decyzje D7/D8, opcje generowane z mapy i parkingu (jedno źródło, tier w jednym miejscu)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const cfg = (def.blocks as Record<string, any>).drone_app;
    expect(cfg.address.decisionNum).toBe(7);
    expect(cfg.car.decisionNum).toBe(8);
    // D7: tylko jeden adres ideal, reszta critical; opcje 1:1 z pinami mapy (id, etykieta, dzielnica, tier).
    expect(cfg.address.options.filter((o: any) => o.tier === 'ideal')).toHaveLength(1);
    expect(cfg.address.options.filter((o: any) => o.tier === 'critical')).toHaveLength(3);
    expect(cfg.address.options).toHaveLength(cfg.mapLocations.length);
    cfg.mapLocations.forEach((l: any) => {
      const o = cfg.address.options.find((x: any) => x.id === l.id);
      expect(o, `opcja dla pinu ${l.id}`).toBeDefined();
      expect([o.label, o.desc, o.tier]).toEqual([l.address, l.district, l.tier]);
    });
    // D8: tylko jeden pojazd ideal (cel ze zdjęcia), reszta critical; opcje 1:1 z autami na parkingu.
    const idealCar = cfg.car.options.filter((o: any) => o.tier === 'ideal');
    expect(idealCar).toHaveLength(1);
    expect(cfg.car.options.filter((o: any) => o.tier === 'critical')).toHaveLength(5);
    expect(cfg.car.options).toHaveLength(cfg.parkingCars.length);
    cfg.parkingCars.forEach((c: any) => {
      const o = cfg.car.options.find((x: any) => x.id === c.id);
      expect(o, `opcja dla auta ${c.id}`).toBeDefined();
      expect([o.label, o.tier]).toEqual([c.desc, c.tier]);
      expect(c).not.toHaveProperty('isTarget');
    });
    // Zdjęcie od mentora to auto ideal (jedyne w danych).
    expect(cfg.parkingCars.filter((c: any) => c.tier === 'ideal').map((c: any) => c.id)).toEqual([idealCar[0].id]);
    // Notatka mentora na prawym monitorze cytuje kwestie z mostka (adres, poranny lot) z jednego źródła.
    const pendrive = (def.stages ?? []).find((s) => s.id === 'pendrive_app')!;
    const bridgeTexts = (pendrive.completion.conversation ?? [])
      .filter((b: any) => b.from === 'byte_master')
      .map((b: any) => b.text);
    expect(cfg.mentorNote.length).toBeGreaterThan(0);
    cfg.mentorNote.forEach((line: string) => expect(bridgeTexts).toContain(line));
    expect(cfg.mentorNote.join(' ')).toContain('OŁTASZYŃSKA 92C/6');
  });
});


// ---------------------------------------------------------------------------
// MOSTKI, PRZESKOKI CZASU I RAPORT — wzorem tests/mission2.test.ts
// ---------------------------------------------------------------------------
describe('Misja 3 — mostki i raport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(MISSION_ID);
    useMissionStore.getState().finishBiosBoot();
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  /** Przegrywa mostek aż do przeskoku czasu (kwestie mentora i kliki gracza przed nim). */
  const driveUntilTimeJump = () => {
    for (let i = 0; i < 20 && !useMissionStore.getState().timeJump; i++) {
      vi.runAllTimers();
      const beat = useMissionStore.getState().chatAvailableChoices.find((c) => c.bridgeBeat);
      if (beat && !useMissionStore.getState().timeJump) useMissionStore.getState().chooseChatOption(beat.id);
    }
  };

  it('pytania w step6.choices są identyczne z pytaniami z klocków (ekranem decyzji)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const decisions = collectDecisions((def.blocks ?? {}) as Record<string, any>);
    for (let k = 1; k <= 8; k++) {
      const choice = def.step6.choices.find((c: any) => c.num === k) as any;
      expect(decisions[k]?.question, `pytanie D${k} w blocks`).toBeTruthy();
      expect(choice.question, `pytanie D${k} w raporcie`).toBe(decisions[k].question);
      expect(choice.attack, `attack D${k}`).toBeTruthy();
      expect(choice.defense, `defense D${k}`).toBeTruthy();
    }
  });

  it('mostki odblokowują kafelki dopiero po kwestii gracza (i po przeskoku czasu)', () => {
    const store = useMissionStore.getState();
    driveBridge(); // intro -> odblokowanie bazy wirusów
    expect(useMissionStore.getState().unlockedIcons).toContain('virus_database');

    const def = useMissionStore.getState().activeMission as MissionDefinition;
    for (const stage of def.stages ?? []) {
      const unlockId = stage.completion.unlockIcons![0];
      const beats = stage.completion.conversation ?? [];
      // Mostek ma kwestię gracza (klik), więc samo wyświetlenie kwestii mentora niczego nie odblokowuje.
      expect(beats.some((b: any) => b.from === 'player'), `${stage.id}: kwestia gracza`).toBe(true);
      expect(useMissionStore.getState().unlockedIcons).not.toContain(unlockId);

      store.completeStage(stage.id);
      vi.runAllTimers();
      expect(useMissionStore.getState().unlockedIcons, `${stage.id}: przed kwestią gracza`).not.toContain(unlockId);
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons, `${stage.id}: po mostku`).toContain(unlockId);
    }
  });

  it('mostek pendrive -> dron: przeskok 06:02, kafelek drona odblokowuje się dopiero po przeskoku', () => {
    const store = useMissionStore.getState();
    driveBridge();
    for (const id of ['virus_database', 'browser']) {
      store.completeStage(id);
      driveBridge();
    }
    store.completeStage('pendrive_app');
    driveUntilTimeJump();
    expect(useMissionStore.getState().timeJump?.label).toContain('06:02');
    expect(useMissionStore.getState().unlockedIcons).not.toContain('drone_unlocked');
    useMissionStore.getState().endTimeJump();
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('drone_unlocked');
  });

  it('mostek drona -> sesja RAT: przeskok 08:12, kafelek sesji odblokowuje się dopiero po przeskoku', () => {
    const store = useMissionStore.getState();
    driveBridge();
    for (const id of ['virus_database', 'browser', 'pendrive_app']) {
      store.completeStage(id);
      driveBridge();
    }
    store.completeStage('drone_app');
    driveUntilTimeJump();
    expect(useMissionStore.getState().timeJump?.label).toContain('08:12');
    expect(useMissionStore.getState().unlockedIcons).not.toContain('rat_session_unlocked');
    useMissionStore.getState().endTimeJump();
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('rat_session_unlocked');
  });
});
