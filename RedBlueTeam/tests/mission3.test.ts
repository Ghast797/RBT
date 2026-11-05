import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { resolveDecisionCount } from '../src/engine/core/scoring';
import type { ChoiceOutcome, MissionDefinition } from '../src/engine/types/mission';

// ---------------------------------------------------------------------------
// TEST CHARAKTERYZUJĄCY MISJĘ 3 (O&L COMPANY)
//
// Utrwala zachowanie M3, które MA PRZETRWAĆ migrację ze starego modelu (logika
// w useMissionStore: `chatStage` / `chooseChatOption` + widgety z engine/widgets)
// na nowy silnik (etapy + klocki/minigry, wzorzec B jak M2/M4).
//
// Opisuje CO ma się dziać, a nie JAK robi to stary store. Bloki `describe.skip`
// (struktura etapów, przepływ wzorca B) włącza commit ze szkieletem `stages.ts`.
// Fragmenty zależne od pełnych minigier (nie od stubów) są jako `it.todo`.
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

  it('raport końcowy: numery, pytania i odpowiedzi idealne 8 decyzji (step6.choices)', () => {
    const def = getMission(MISSION_ID) as MissionDefinition;
    const byNum = Object.fromEntries(def.step6.choices.map((c: any) => [c.num, c]));
    expect(byNum[1].answer).toBe('RAT');
    expect(byNum[1].question).toBe('WYBIERZ ODPOWIEDNIEGO WIRUSA:');
    expect(byNum[2].answer).toBe('MATEUSZ KLIMOWICZ');
    expect(byNum[3].answer).toContain('IMPREZY');
    expect(byNum[4].answer).toContain('IMG_00034521');
    expect(byNum[5].answer).toBe('IMPREZA');
    expect(byNum[6].answer).toContain('AFTERPARTY');
    expect(byNum[7].answer).toContain('OŁTASZYŃSKA 92C');
    expect(byNum[8].answer).toContain('BIAŁY SAMOCHÓD');
    for (let k = 1; k <= 8; k++) expect(byNum[k]).toBeDefined();
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
// STRUKTURA ETAPÓW — włączana przez commit ze szkieletem `stages.ts` / `blocks`.
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

/** Wyciąga opcje {id,tier} per numer decyzji z `blocks` niezależnie od kształtu minigry. */
function collectOptionsByDecision(blocks: Record<string, any>): Record<number, Array<{ id: string; tier: ChoiceOutcome }>> {
  const result: Record<number, Array<{ id: string; tier: ChoiceOutcome }>> = {};
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.decisionNum === 'number' && Array.isArray(node.options)) {
      result[node.decisionNum] = node.options.map((o: any) => ({ id: o.id, tier: o.tier }));
    }
    Object.values(node).forEach(visit);
  };
  Object.values(blocks).forEach(visit);
  return result;
}

// ---------------------------------------------------------------------------
// PRZEPŁYW WZORCA B — włączany przez commit ze szkieletem (silnik: completeStage
// + reportDecision + rozmowy mostkujące). Niezależny od wewnętrznej UI minigier.
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
// WEWNĘTRZNE MECHANIKI MINIGIER — do uzupełnienia, gdy kolejni agenci przeniosą
// pełne minigry (stuby nie odwzorowują jeszcze tych szczegółów).
// ---------------------------------------------------------------------------
describe('Misja 3 — mechaniki minigier (po przeniesieniu pełnych wersji)', () => {
  it.todo('builder RAT: zły zestaw (moduł/maskowanie/pakiet) blokuje kompilację bez naliczenia decyzji');
  it.todo('builder RAT: poprawny zestaw reverse_tcp + bg_service + dll_archive odblokowuje onComplete');
  it.todo('cel D2: wybór CEO/Logistyki cofa do ponownego wyboru, a końcowe D2 agreguje się do suboptimal');
  it.todo('cel D2: wybór CISO natychmiast zgłasza critical (bez ponownego wyboru)');
  it.todo('pendrive D4: tylko jeden załącznik można wgrać, potem wymagane podpięcie RAT do ZIP (flavor)');
  it.todo('dron: adres i pojazd to osobne decyzje D7/D8, zły wybór = critical');
});
