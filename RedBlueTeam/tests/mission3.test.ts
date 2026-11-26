import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { getMission } from '../src/engine/registry/missionRegistry';
import { appComponentRegistry } from '../src/engine/registry/appRegistry';
import { resolveDecisionCount } from '../src/engine/core/scoring';
import type { ChoiceOutcome, ConversationBeat, MissionDefinition } from '../src/engine/types/mission';
import {
  virusLabConfig,
  osintBrowserConfig,
  pendriveConfig,
  droneConfig,
  ratSessionConfig
} from '../src/scenarios/mission_03_ol_company/stages';
import { buildReport, reportAnswerOf } from '../src/engine/core/report';

// ---------------------------------------------------------------------------
// TESTY MISJI 3 (O&L COMPANY), wzorzec B (etapy + klocki/minigry, jak M2/M4)
//
// Stałe z dokumentu scenariusza (docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md)
// są wpisane w teście, żeby test pilnował zgodności danych z dokumentem, a nie przepisywał kodu.
// Logikę wnętrza minigier testują osobne pliki (tests/m3-*.test.ts, porcje C–G).
// ---------------------------------------------------------------------------

const MISSION_ID = 'mission-3-ol-company';
const def = (): MissionDefinition => getMission(MISSION_ID) as MissionDefinition;
const blocks = (): Record<string, any> => (def().blocks ?? {}) as Record<string, any>;

/** Kolejność etapów (Kill Chain): uzbrojenie, rekonesans i cel, nośnik, dostarczenie, egzekucja. */
const EXPECTED_STAGE_ORDER = ['virus_database', 'browser', 'pendrive_app', 'drone_app', 'rat_session'];

/** Decyzje D1..D6 w etapach. */
const EXPECTED_DECISIONS_PER_STAGE: Record<string, number[]> = {
  virus_database: [1],
  browser: [2, 3],
  pendrive_app: [4],
  drone_app: [5, 6],
  rat_session: []
};

/** Pytania z tabeli debriefu (D1–D6): identyczne na ekranie i w raporcie. */
const EXPECTED_QUESTIONS: Record<number, string> = {
  1: 'WYBIERZ ODPOWIEDNIEGO WIRUSA',
  2: 'KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?',
  3: 'JAK GO OSZUKASZ?',
  4: 'WYBIERZ PODPIS NA KOPERCIE',
  5: 'WSKAŻ DRONOWI ADRES DOMU OFIARY',
  6: "WYBIERZ MIEJSCE NA PARKINGU, GDZIE OFIARA NA PEWNO ZNAJDZIE KOPERTĘ Z PENDRIVE'M"
};

/** Odpowiedzi ścieżki 100% z tabeli debriefu. */
const EXPECTED_ANSWERS: Record<number, string> = {
  1: 'RAT',
  2: 'JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA',
  3: 'NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY',
  4: 'ZDJĘCIA Z AFTERPARTY O&L COMPANY!',
  5: 'OŁTASZYŃSKA 92C',
  6: 'BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY'
};

/** Poziomy opcji wg dokumentu (opcje „LUB” rozpisane na osobne id). */
const EXPECTED_TIERS: Record<number, Record<ChoiceOutcome, string[]>> = {
  1: { ideal: ['rat'], suboptimal: ['keylogger'], critical: ['ransomware'] },
  2: {
    ideal: ['choose_mateusz'],
    suboptimal: ['choose_logistics', 'choose_sales'],
    critical: ['choose_ciso', 'choose_ceo']
  },
  3: { ideal: ['vector_party_zip'], suboptimal: ['vector_hr_docs'], critical: ['vector_empty_keylogger'] },
  4: { ideal: ['env_afterparty'], suboptimal: ['env_bo'], critical: ['env_lost_docs', 'env_termination'] },
  5: { ideal: ['loc_4'], suboptimal: [], critical: ['loc_1', 'loc_2', 'loc_3'] },
  6: {
    ideal: ['car_target'],
    suboptimal: ['asphalt'],
    critical: [
      'car_suv',
      'car_white_sedan',
      'car_green_hatch',
      'car_silver_sedan',
      'car_red_hatch',
      'car_orange_van',
      'car_black_wagon'
    ]
  }
};

/** Opis kolejki beatów do porównań: kwestie 1:1 z dokumentu. */
const beatLine = (b: ConversationBeat): string => {
  if (b.from === 'player') return `GRACZ: ${b.label}`;
  if (b.from === 'byte_master') return `BM: ${b.text}`;
  return `PRZESKOK: ${b.clockFrom}->${b.clock}`;
};
const stageOf = (id: string) => (def().stages ?? []).find((s) => s.id === id)!;
/** Kwestie mostka dla planu D3 (domyślnie plan zdjęć): beaty z `when` innego planu odpadają. */
const bridgeOf = (id: string, plan = 'vector_party_zip') =>
  (stageOf(id).completion.conversation ?? [])
    .filter((b) => !b.when || ([b.when.optionId ?? []].flat() as string[]).includes(plan))
    .map(beatLine);

/** Wszystkie opcje ocenianych decyzji (numer decyzji + pytanie + opcje) z danych klocków. */
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

/** Odwołania do grafik (`{ group, name }`) z danych klocków. */
function collectAssets(): Array<{ group: string; name: string }> {
  const found: Array<{ group: string; name: string }> = [];
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    const keys = Object.keys(node);
    if (keys.length === 2 && keys.includes('group') && keys.includes('name')) found.push(node);
    Object.values(node).forEach(visit);
  };
  Object.values(blocks()).forEach(visit);
  return found;
}

/** Przegrywa rozmowę mostkującą do końca (flush kwestii mentora, kliki kwestii gracza, przeskoki czasu). */
function driveBridge(jumps?: Array<{ clockFrom?: string; clock?: string; label?: string }>) {
  for (let i = 0; i < 60; i++) {
    vi.runAllTimers();
    const st = useMissionStore.getState();
    if (st.timeJump) {
      jumps?.push({ clockFrom: st.timeJump.clockFrom, clock: st.timeJump.clock, label: st.timeJump.label });
      st.endTimeJump();
      continue;
    }
    if (!st.pendingBridge) return;
    const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
    if (beat) useMissionStore.getState().chooseChatOption(beat.id);
    else return;
  }
}

describe('Misja 3 — metadane, intro i raport (dokument VR)', () => {
  it('ładuje definicję z metadanymi O&L Company (6 decyzji, próg 80%, 4,02 BTC)', () => {
    expect(def()).toBeDefined();
    expect(def().mission.id).toBe(MISSION_ID);
    expect(def().mission.title).toBe('MISJA 3 – O&L COMPANY');
    expect(def().mission.targetCompany).toBe('O&L Company');
    expect(def().mission.rewardBtc).toBe(4.02);
    expect(def().mission.decisionCount).toBe(6);
    expect(def().mission.passingScore).toBe(70);
    expect(def().mission.date).toBe('19.05.2026');
  });

  it('ma 6 ocenianych decyzji (pula punktów = step6.choices)', () => {
    expect(def().step6.choices.length).toBe(6);
    expect(resolveDecisionCount(def())).toBe(6);
  });

  it('raport: pytania z debriefu = pytania ekranów, odpowiedź idealna = reportAnswer opcji ideal, lekcje atak/obrona', () => {
    const decisions = collectDecisions();
    for (let k = 1; k <= 6; k++) {
      const choice = def().step6.choices.find((c: any) => c.num === k) as any;
      expect(choice, `step6.choices D${k}`).toBeDefined();
      expect(choice.question).toBe(EXPECTED_QUESTIONS[k]);
      expect(decisions[k].question, `pytanie D${k} na ekranie`).toBe(choice.question);
      expect(choice.answer).toBe(EXPECTED_ANSWERS[k]);
      const ideal = decisions[k].options.find((o) => o.tier === 'ideal');
      expect(reportAnswerOf(ideal), `D${k}: odpowiedź opcji ideal`).toBe(choice.answer);
      expect(choice.correct).toBe(true);
      expect((choice.attack ?? '').length, `attack D${k}`).toBeGreaterThan(40);
      expect((choice.defense ?? '').length, `defense D${k}`).toBeGreaterThan(40);
    }
  });

  it('podsumowanie: ZHAKOWANO O&L, ukończono zadanie 3, 6 idealnych, 4,02 BTC', () => {
    expect(def().step6.summary).toMatchObject({
      title: 'ZHAKOWANO O&L',
      subtitle: 'UKOŃCZONO ZADANIE 3',
      company: 'O&L Company',
      scorePercent: 100,
      perfectChoices: 6,
      goodChoices: 0,
      criticalErrors: 0,
      btcReward: 4.02
    });
  });

  it('intro 1:1 z dokumentu: cztery pary BM -> gracz, wersaliki, bez spójnika „NAJPIERW STWORZĘ WIRUSA”', () => {
    const d = def().intro.dialogue;
    expect(d.map((x) => x.text)).toEqual([
      'WITAJ, HAKERZE! PRZED TOBĄ KOLEJNE ZADANIE',
      'CIERPLIWOŚCI. JESTEŚ NA DOBREJ DRODZE, PÓKI CO BARDZO NAM POMAGASZ W WALCE Z KONCERNAMI',
      'O&L COMPANY TO JEDNA Z WIĘKSZYCH SPÓŁEK PALIWOWYCH. Z MOICH ŹRÓDEŁ WYNIKA, ŻE MAJĄ BRAKUJĄCĄ CZĘŚĆ DOKUMENTACJI NA TEMAT FREEVOLT, W TYM OPIS CAŁEJ INFRASTRUKTURY, WIĘC TO BARDZO CENNE DANE. ZDOBYCIE ICH BĘDZIE WYMAGAŁO OD CIEBIE KREATYWNOŚCI',
      'TO ZALEŻY JAK GO DOSTARCZYSZ'
    ]);
    expect(d.map((x) => x.playerResponse)).toEqual([
      'JASNE, CHOCIAŻ MIŁO BY BYŁO WIEDZIEĆ NA CZYM STOJĘ I ILE JESZCZE ZADAŃ PRZEDE MNĄ, ZANIM PRZYJMIECIE MNIE DO DARKSUN',
      'OK, NIECH BĘDZIE. A WIĘC?',
      'CZY WIRUS, KTÓRY PRZEJMIE PULPIT PRACOWNIKA JEST WYSTARCZAJĄCO KREATYWNY?',
      'DAJ MI CHWILĘ'
    ]);
    const intro = def().intro as any;
    // Ostatnią kwestią gracza jest „DAJ MI CHWILĘ” (w intro), więc nie ma osobnego spójnika w czacie.
    expect(intro.firstChoice).toBeUndefined();
    expect(JSON.stringify(d)).not.toContain('NAJPIERW STWORZĘ WIRUSA');
    expect(intro.firstUnlock.unlockIcons).toContain('virus_database');
  });
});

describe('Misja 3 — struktura etapów (wzorzec B)', () => {
  const stages = () => def().stages ?? [];

  it('kolejność etapów: wirus -> OSINT -> pendrive -> dron -> sesja RAT', () => {
    expect(stages().map((s) => s.appId)).toEqual(EXPECTED_STAGE_ORDER);
    expect(stages().map((s) => s.id)).toEqual(EXPECTED_STAGE_ORDER);
  });

  it('każdy appId etapu istnieje w desktopApps, a komponent kafelka jest zarejestrowany', () => {
    stages().forEach((s) => {
      const tile = def().desktopApps.find((t) => t.id === s.appId);
      expect(tile, `kafelek dla etapu ${s.appId}`).toBeDefined();
      expect(appComponentRegistry[tile!.componentId], `komponent ${tile!.componentId}`).toBeDefined();
    });
    // Czat BYTE_MASTER jest pierwszym kafelkiem (jak w M2).
    expect(def().desktopApps.map((t) => t.label)).toEqual([
      '//CHAT: BYTE_MASTER',
      '//BAZA_WIRUSÓW',
      '//TOR: PRZEGLĄDARKA',
      '//DYSK E: PENDRIVE',
      '//DRON: CONDOR MIT63',
      '//WIRUS: RAT (C2)',
      '//RAPORT POOPERACYJNY'
    ]);
    expect(def().desktopApps.map((t) => t.componentId)).toEqual([
      'chat',
      'ol_virus_lab',
      'ol_osint_browser',
      'ol_pendrive',
      'ol_drone',
      'ol_rat_session',
      'debrief_app'
    ]);
  });

  it('decyzje rozłożone na etapy: [1],[2,3],[4],[5,6],[]', () => {
    stages().forEach((s) => expect(s.decisions ?? []).toEqual(EXPECTED_DECISIONS_PER_STAGE[s.appId]));
  });

  it('każda decyzja 1..6 jest w dokładnie jednym etapie, w step6.choices i w danych klocka', () => {
    const decisions = collectDecisions();
    for (let k = 1; k <= 6; k++) {
      expect(stages().filter((s) => (s.decisions ?? []).includes(k)).length).toBe(1);
      expect(def().step6.choices.filter((c: any) => c.num === k).length).toBe(1);
      expect(decisions[k], `klocek D${k}`).toBeDefined();
    }
    expect(Object.keys(decisions).length).toBe(6);
  });

  it('kafelki odblokowują się łańcuchem: start tylko czat, reszta zablokowana do mostka', () => {
    const tiles = def().desktopApps;
    expect(tiles.filter((t) => !t.unlockedOnly).map((t) => t.id)).toEqual(['chat_shortcut']);
    EXPECTED_STAGE_ORDER.forEach((id) => {
      const tile = tiles.find((t) => t.id === id)!;
      expect(tile.unlockedOnly, id).toBe(true);
      expect(tile.requiredUnlockId, id).toBeTruthy();
    });
  });

  it('poziomy opcji każdej decyzji zgodne z dokumentem (jedna ideal, reszta wg tabeli)', () => {
    const decisions = collectDecisions();
    for (let k = 1; k <= 6; k++) {
      const opts = decisions[k].options as Array<{ id: string; tier: ChoiceOutcome }>;
      const expected = EXPECTED_TIERS[k];
      expect(opts.filter((o) => o.tier === 'ideal').length, `D${k}: dokładnie jedna ideal`).toBe(1);
      const allExpected = [...expected.ideal, ...expected.suboptimal, ...expected.critical];
      expect(opts.map((o) => o.id).sort(), `D${k}: komplet opcji`).toEqual([...allExpected].sort());
      (['ideal', 'suboptimal', 'critical'] as ChoiceOutcome[]).forEach((tier) => {
        expected[tier].forEach((id) => {
          expect(opts.find((o) => o.id === id)!.tier, `D${k} ${id}`).toBe(tier);
        });
      });
    }
  });

  it('D1: RAT ideal, Ransomware critical (wykrycie), Keylogger B2; etykiety z dokumentu, opisy to neutralne definicje', () => {
    const byId = Object.fromEntries(virusLabConfig.virus.options.map((o) => [o.id, o]));
    expect(byId.rat.tier).toBe('ideal');
    expect(byId.ransomware.tier).toBe('critical');
    expect(byId.ransomware.feedback).toMatch(/dział IT/);
    expect(byId.ransomware.feedback).toMatch(/wykryje/);
    expect(byId.ransomware).not.toHaveProperty('reject');
    expect(byId.keylogger.tier).toBe('suboptimal');
    expect(byId.keylogger.reject?.mentorLine).toMatch(/KEYLOGGER/);
    expect(byId.rat.label).toBe('RAT: REMOTE ACCESS TROJAN');
    expect(byId.ransomware.label).toBe('RANSOMWARE');
    expect(byId.keylogger.label).toBe('KEYLOGGER');
    // Opisy z VR oceniały przydatność („POKAŻE WSZYSTKO…”): na ekranie jest tylko definicja typu programu.
    expect(byId.rat.desc).toBe('PROGRAM POZWALAJĄCY ZDALNIE STEROWAĆ ZAINFEKOWANYM KOMPUTEREM, JAK GDYBY SIEDZIAŁO SIĘ PRZY NIM');
    expect(byId.ransomware.desc).toBe('PROGRAM SZYFRUJĄCY DANE NA KOMPUTERZE I W SIECI, ŻEBY ZAŻĄDAĆ OKUPU ZA ICH ODBLOKOWANIE');
    expect(byId.keylogger.desc).toBe('PROGRAM REJESTRUJĄCY WSZYSTKIE KLAWISZE WCIŚNIĘTE NA ZAINFEKOWANYM KOMPUTERZE');
    for (const o of Object.values(byId) as any[]) {
      expect(o.desc, `desc ${o.id} bez oceny przydatności`).not.toMatch(/POZWOLI|POKAŻE|MOŻE ZASZYFROWAĆ|CICH|NIEZAUWAŻ/);
    }
  });

  it('D3: trzy opcje 1:1 z dokumentu, literówka „ZOSTAWIE” poprawiona na „ZOSTAWIĘ”', () => {
    const labels = osintBrowserConfig.vector.options.map((o) => o.label);
    expect(labels).toEqual([
      'MAM ZDJĘCIA I INFORMACJE O OSTATNIEJ IMPREZIE DZIAŁU SPRZEDAŻY. PODRZUCĘ MU PENDRIVE Z KILKOMA KOMPROMITUJĄCYMI ZDJĘCIAMI. WIRUSA UKRYJĘ W ARCHIWUM ZIP',
      'PODRZUCĘ MU PENDRIVE Z DOKUMENTAMI HR DOTYCZĄCYMI ZWOLNIEŃ',
      'PO PROSTU ZOSTAWIĘ PUSTY PENDRIVE Z PODPISEM KEYLOGGER'
    ]);
  });

  it('D4 (pendrive): podpisy z dokumentem („B&O”), nazwy dysku, poziom D4 liczony z dwóch kroków', () => {
    expect(pendriveConfig.signature.options.map((o) => o.label)).toEqual([
      'ZDJĘCIA Z AFTERPARTY O&L COMPANY!',
      'PENDRIVE ZE ZDJĘCIAMI B&O COMPANY',
      'ZGUBIONE DOKUMENTY',
      'WYPOWIEDZENIE UMOWY'
    ]);
    expect(pendriveConfig.signature.decisionNum).toBe(4);
    expect(pendriveConfig.signature.confirmLabel).toBe('WYSUŃ PAMIĘĆ USB');
    // Nazwa dysku nie jest osobną decyzją (brak decisionNum), ale ma poziomy do agregacji D4.
    expect(pendriveConfig.volume).not.toHaveProperty('decisionNum');
    const vol = Object.fromEntries(pendriveConfig.volume.options.map((o) => [o.label, o]));
    expect(Object.keys(vol).sort()).toEqual([
      'DOKUMENTY B&O COMPANY',
      'DOKUMENTY HR',
      'IMPREZA',
      'KEYLOGGER',
      'NOWY DYSK',
      'ZDJĘCIA B&O COMPANY'
    ]);
    expect(vol['IMPREZA'].tier).toBe('ideal');
    expect(vol['ZDJĘCIA B&O COMPANY'].tier).toBe('suboptimal');
    expect(vol['NOWY DYSK'].tier).toBe('suboptimal');
    expect(vol['KEYLOGGER'].tier).toBe('critical');
    expect(vol['KEYLOGGER'].reportAnswer).toBe('NAZWA DYSKU: KEYLOGGER');
    expect(pendriveConfig.attachments.map((a) => a.name)).toEqual([
      'IMG_00034521.JPG X3',
      'DOKUMENTY_HR.DOCX',
      'WYPOWIEDZENIE_UMOWY_O_PRACE.PDF'
    ]);
  });

  it('reguła „plik pasuje do planu”: każda opcja D3 ma regułę z odpowiedzią i plikami z załączników', () => {
    const vectorIds = osintBrowserConfig.vector.options.map((o) => o.id).sort();
    expect(pendriveConfig.plan.map((r) => r.vectorOptionId).sort()).toEqual(vectorIds);
    const fileIds = pendriveConfig.attachments.map((a) => a.id);
    pendriveConfig.plan.forEach((rule) => {
      const opt = osintBrowserConfig.vector.options.find((o) => o.id === rule.vectorOptionId)!;
      expect(rule.planLabel).toBe(reportAnswerOf(opt));
      rule.fileIds.forEach((f) => expect(fileIds).toContain(f));
    });
    const rule = (id: string) => pendriveConfig.plan.find((r) => r.vectorOptionId === id)!;
    expect(rule('vector_party_zip').fileIds).toEqual(['party_photos']);
    expect(rule('vector_hr_docs').fileIds.sort()).toEqual(['hr_docs', 'termination']);
    expect(pendriveConfig.planFallbackVectorOptionId).toBe('vector_party_zip');
    pendriveConfig.attachments.forEach((a) => expect(a.archive).toMatch(/^[A-Z0-9_]+\.ZIP$/));
  });

  it('dron: opcje D5 i D6 powstają z mapy i parkingu (jedno źródło), 8 aut + pusty asfalt', () => {
    expect(droneConfig.address.options).toHaveLength(droneConfig.mapLocations.length);
    expect(droneConfig.mapLocations.map((l) => `${l.address} ${l.district}`)).toEqual([
      'OŁAWSKA 51B NADODRZE',
      'DRZYMAŁY 38D PILCZYCE',
      'WYSTAWOWA 23A ZALESIE',
      'OŁTASZYŃSKA 92C PARTYNICE'
    ]);
    droneConfig.mapLocations.forEach((l) => {
      const o = droneConfig.address.options.find((x) => x.id === l.id)!;
      expect([o.label, o.desc, o.tier]).toEqual([l.address, l.district, l.tier]);
    });
    expect(droneConfig.parkingCars).toHaveLength(8);
    expect(droneConfig.car.options).toHaveLength(9);
    droneConfig.parkingCars.forEach((c) => {
      const o = droneConfig.car.options.find((x) => x.id === c.id)!;
      expect([o.label, o.tier]).toEqual([c.desc, c.tier]);
      expect(c).not.toHaveProperty('isTarget');
    });
    expect(droneConfig.car.options.find((o) => o.id === droneConfig.asphalt.id)!.tier).toBe('suboptimal');
    // Dokładnie jedno auto z czerwonym dachem jest białe (ideal); łudząco podobne auta są critical (koperta u sąsiada).
    const target = droneConfig.parkingCars.find((c) => c.tier === 'ideal')!;
    expect([target.body, target.roof]).toEqual(['#f8fafc', '#dc2626']);
    expect(droneConfig.parkingCars.filter((c) => c.tier === 'ideal')).toHaveLength(1);
    expect(droneConfig.hud.batteryPercent).toBe(48);
    expect(droneConfig.droneStats.model).toBe('CONDOR MIT63');
  });

  it('sesja RAT: 4 pliki FREEVOLT, schemat sieci (haker, węzeł pośredni, 3 stacje), wartości zapasowe zgodne ze ścieżką ideal', () => {
    expect(ratSessionConfig.files.items.map((f) => f.name)).toEqual([
      'FREEVOLT_OPIS_INFRASTRUKTURY.PDF',
      'FREEVOLT_DOKUMENTACJA_CZ2.PDF',
      'FREEVOLT_SCHEMAT_SIECI.PDF',
      'FREEVOLT_UMOWY_DOSTAWCOW.XLSX'
    ]);
    const kinds = ratSessionConfig.network.nodes.map((n) => n.kind);
    expect(kinds.filter((k) => k === 'hacker')).toHaveLength(1);
    expect(kinds.filter((k) => k === 'relay')).toHaveLength(1);
    expect(kinds.filter((k) => k === 'infected')).toHaveLength(3);
    expect(ratSessionConfig.host).toEqual({ name: 'MATEUSZ_BIURO_O&L', ip: '161.185.160.93' });
    expect(ratSessionConfig.desktop.icons.map((i) => i.label)).toEqual(['KOSZ', 'TEN KOMPUTER', 'FREEVOLT']);
    expect(ratSessionConfig.desktop.icons.find((i) => i.label === 'FREEVOLT')!.warning).toBe(true);
    expect(ratSessionConfig.network.headline).toBe('UZYSKAŁEŚ ZDALNY DOSTĘP DO SIECI O&L COMPANY');
    // Wartości zapasowe (dev) = ścieżka 100%: ideal nazwa dysku, ideal podpis, archiwum ze zdjęć.
    const idealVolume = pendriveConfig.volume.options.find((o) => o.tier === 'ideal' && !o.forPlans?.includes('vector_hr_docs'))!.label;
    const idealSignature = pendriveConfig.signature.options.find((o) => o.tier === 'ideal')!.label;
    const photosArchive = pendriveConfig.attachments.find((a) => a.id === 'party_photos')!.archive;
    for (const fb of [ratSessionConfig.usbFallback, droneConfig.usbFallback]) {
      expect(fb).toEqual({ volume: idealVolume, archive: photosArchive, signature: idealSignature });
    }
  });

  it('assety: odwołania w danych = lista z planu, każda grupa ma folder z .gitkeep', () => {
    const refs = collectAssets();
    const byGroup: Record<string, string[]> = {};
    refs.forEach((r) => (byGroup[r.group] = [...(byGroup[r.group] ?? []), r.name]));
    Object.values(byGroup).forEach((names) => names.sort());
    expect(byGroup).toEqual({
      virus: ['rat'],
      employees: ['agnieszka_leman', 'jan_lukasiewicz', 'mateusz_klimowicz', 'slawomir_bialek', 'wiktoria_galecka'],
      events: ['meeting_logistics_1', 'meeting_logistics_2', 'party_sales_1', 'party_sales_2', 'party_sales_3'],
      usb: ['envelope', 'party_photos'],
      drone: ['city_map', 'parking'],
      rat: ['victim_wallpaper']
    });
    Object.keys(byGroup).forEach((g) => {
      const keep = fileURLToPath(
        new URL(`../src/scenarios/mission_03_ol_company/assets/${g}/.gitkeep`, import.meta.url)
      );
      expect(fs.existsSync(keep), `assets/${g}/.gitkeep`).toBe(true);
    });
  });
});

describe('Misja 3 — spójność interfejsu z M2 (nagłówki, kafelki, czytelność)', () => {
  it('pulpit: czat BYTE_MASTER jest pierwszym kafelkiem (jak w M2), potem etapy w kolejności Kill Chain, raport na końcu', () => {
    const ids = def().desktopApps.map((a) => a.id);
    expect(ids[0]).toBe('chat_shortcut');
    expect(ids.slice(1)).toEqual([...EXPECTED_STAGE_ORDER, 'debrief_app']);
  });

  it('każda minigra ma podtytuł nagłówka z configu (kontekst aplikacji, nie polecenie)', () => {
    for (const cfg of [virusLabConfig, osintBrowserConfig, pendriveConfig, droneConfig, ratSessionConfig]) {
      expect(cfg.subtitle.length).toBeGreaterThan(10);
    }
  });

  it('każda minigra przekazuje podtytuł do AppHeader (ekrany ładowania mają ten sam nagłówek)', () => {
    const dir = fileURLToPath(new URL('../src/scenarios/mission_03_ol_company/minigames/', import.meta.url));
    for (const f of ['VirusLabApp', 'OsintBrowserApp', 'PendriveApp', 'DroneApp', 'RatSessionApp']) {
      const src = fs.readFileSync(`${dir}${f}.tsx`, 'utf8');
      expect(src, f).toMatch(/subtitle=/);
    }
  });

  it('tekst nie jest mniejszy niż text-xs (0,75 rem) w minigrach M3 (poza zastępnikiem grafiki w trybie dev)', () => {
    const dir = fileURLToPath(new URL('../src/scenarios/mission_03_ol_company/minigames/', import.meta.url));
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx') && f !== 'ui.tsx');
    for (const f of files) {
      const src = fs.readFileSync(`${dir}${f}`, 'utf8');
      const small = [...src.matchAll(/text-\[(\d*\.?\d+)rem\]/g)].filter((m) => parseFloat(m[1]) < 0.75).map((m) => m[0]);
      expect(small, f).toEqual([]);
    }
  });
});

describe('Misja 3 — jedno źródło tekstów (pytania, grafiki)', () => {
  it('pytanie decyzji to jedyne źródło etykiety na ekranie i w raporcie: dane nie mają osobnych pól choiceLabel', () => {
    const found: string[] = [];
    const visit = (node: any, path: string) => {
      if (!node || typeof node !== 'object') return;
      for (const [k, v] of Object.entries(node)) {
        if (k === 'choiceLabel') found.push(`${path}.${k}`);
        visit(v, `${path}.${k}`);
      }
    };
    Object.entries(blocks()).forEach(([id, cfg]) => visit(cfg, id));
    expect(found).toEqual([]);
    // Ekrany czytają etykietę strefy z `question` (to samo trafia do raportu).
    const dir = fileURLToPath(new URL('../src/scenarios/mission_03_ol_company/minigames/', import.meta.url));
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.tsx'))) {
      expect(fs.readFileSync(`${dir}${f}`, 'utf8'), f).not.toMatch(/choiceLabel/);
    }
  });

  it('teksty alternatywne grafik pochodzą z configu (bez literałów w komponentach), grafiki drona podłączone', () => {
    const dir = fileURLToPath(new URL('../src/scenarios/mission_03_ol_company/minigames/', import.meta.url));
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.tsx'))) {
      const src = fs.readFileSync(`${dir}${f}`, 'utf8');
      expect(src, `${f}: ImageSlot z literałem label`).not.toMatch(/<ImageSlot[^>]*\slabel="/);
    }
    expect(pendriveConfig.envelopeImageAlt.length).toBeGreaterThan(5);
    expect(ratSessionConfig.desktop.wallpaperAlt.length).toBeGreaterThan(5);
    Object.values(virusLabConfig.matrix.variants).forEach((v) => expect(v.imageAlt.length).toBeGreaterThan(5));
    const drone = fs.readFileSync(`${dir}DroneApp.tsx`, 'utf8');
    expect(drone).toMatch(/config\.images\.cityMap/);
    expect(drone).toMatch(/config\.images\.parking/);
  });
});

describe('Misja 3 — dane strony //TOR (OSINT)', () => {
  const site = osintBrowserConfig.site;

  it('strona: adres, zakładki, hero 1:1, 5 pracowników w kolejności z dokumentu', () => {
    expect(site.url).toBe('https://olcompany.cloud');
    expect([site.tabs.home, site.tabs.events]).toEqual(['STRONA GŁÓWNA', 'WYDARZENIA']);
    expect(site.heroHeadline).toBe('JESTEŚMY JEDNYM Z NAJWIĘKSZYCH DYSTRYBUTORÓW PALIW');
    expect(site.employeesHeading).toBe('NASI EKSPERCI:');
    expect(site.employees.map((e) => [e.name, e.role])).toEqual([
      ['JAN ŁUKASIEWICZ', 'CEO'],
      ['SŁAWOMIR BIAŁEK', 'SZEF DZIAŁU CYBERBEZPIECZEŃSTWA'],
      ['WIKTORIA GAŁECKA', 'SPECJALISTKA DS. LOGISTYKI'],
      ['AGNIESZKA LEMAN', 'SZEFOWA DZIAŁU SPRZEDAŻY'],
      ['MATEUSZ KLIMOWICZ', 'JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA']
    ]);
  });

  it('wydarzenia: dwa wpisy (daty wg fabuły), 3 i 2 zdjęcia, bez dat rocznych', () => {
    expect(site.events).toHaveLength(2);
    expect(site.events[0].headline).toBe('8 MAJA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU SPRZEDAŻY!');
    expect(site.events[0].body).toBe('POWITALIŚMY NA POKŁADZIE NOWYCH PRACOWNIKÓW ORAZ ŚWIĘTOWALIŚMY OSTATNIE SUKCESY!');
    expect(site.events[0].hashtags).toBe('#OL #BESTCOMPANY #COMPANYUNHACKED');
    expect(site.events[0].photos).toHaveLength(3);
    expect(site.events[1].headline).toBe('14 MARCA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU LOGISTYKI!');
    expect(site.events[1].photos).toHaveLength(2);
    expect(JSON.stringify(site.events)).not.toMatch(/20\d\d/);
  });

  it('daty wydarzeń zgodne z fabułą: dzień misji 19.05.2026, staż Mateusza ok. 2 tygodnie', () => {
    const MONTHS: Record<string, number> = { STYCZNIA: 1, LUTEGO: 2, MARCA: 3, KWIETNIA: 4, MAJA: 5, CZERWCA: 6 };
    const [dd, mm] = def().mission.date.split('.').map(Number);
    const missionDay = mm * 100 + dd; // porównywalne w obrębie roku (MMDD)
    const dayOf = (headline: string) => {
      const m = headline.match(/^(\d{1,2}) ([A-ZŁŚŹŻĆ]+) /)!;
      return MONTHS[m[2]] * 100 + Number(m[1]);
    };
    const sales = dayOf(site.events[0].headline);
    const logistics = dayOf(site.events[1].headline);
    // Staż 2 tygodnie: Mateusz zaczął ok. 5 maja, więc impreza z „nowymi pracownikami” jest po jego starcie, a przed dniem misji.
    expect(sales).toBeGreaterThanOrEqual(5 * 100 + 5);
    expect(sales).toBeLessThan(missionDay);
    // Wydarzenie logistyki jest wcześniejsze niż impreza sprzedaży (lekcja D3: „świeże wydarzenie” to impreza sprzedaży).
    expect(logistics).toBeLessThan(sales);
    expect(site.events[0].body).toMatch(/NOWYCH PRACOWNIKÓW/);
  });

  it('brak pól oceniających w danych strony i na kartach celu, opisy bez słów o szkoleniach', () => {
    site.employees.forEach((e) => {
      expect(e).not.toHaveProperty('isTarget');
      expect(e).not.toHaveProperty('tier');
      expect(e).not.toHaveProperty('feedback');
      // Tylko staż i zakres pracy: żadnego słowa o szkoleniach, stopniu wiedzy ani „nowym” pracowniku.
      expect(`${e.bio} ${e.tenure}`, e.id).not.toMatch(/szkolen|junior|nowy|nowo|przeszkol|certyfik|doświadcz/i);
      expect(e.bio.length).toBeGreaterThan(40);
      expect(e.tenure).toMatch(/^W O&L OD: /);
    });
    expect(site.employees.find((e) => e.id === 'mateusz_klimowicz')!.tenure).toBe('W O&L OD: 2 TYGODNIE');
    site.events.forEach((ev) => {
      expect(ev).not.toHaveProperty('tier');
      expect(ev).not.toHaveProperty('feedback');
    });
    expect(osintBrowserConfig).not.toHaveProperty('mentorNote');
  });

  it('D2: pięć kart tylko z imieniem i nazwiskiem, każda z jednym pracownikiem na stronie', () => {
    const opts = osintBrowserConfig.target.options;
    expect(opts).toHaveLength(5);
    opts.forEach((o) => {
      const emps = site.employees.filter((e) => e.optionId === o.id);
      expect(emps, `pracownik dla ${o.id}`).toHaveLength(1);
      expect(o.label).toBe(emps[0].name);
      expect(o.desc).toBeUndefined();
      // Odpowiedź w raporcie to stanowisko osoby.
      expect(reportAnswerOf(o)).toBe(emps[0].role);
    });
  });
});

describe('Misja 3 — kwestie zależne od planu D3 (when)', () => {
  const PARTY_BROWSER = 'DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE';
  const HR_BROWSER = 'DOKUMENTY O ZWOLNIENIACH GO ZANIEPOKOJĄ, ALE MOŻE ODDAĆ PENDRIVE DO KADR. TERAZ PRZYGOTUJ PENDRIVE';
  const PARTY_PENDRIVE =
    'GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI';
  const HR_PENDRIVE =
    'GOTOWE. PENDRIVE Z DOKUMENTAMI HR PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI';
  const PENDRIVE_COMMON = 'MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?';

  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
    useMissionStore.getState().loadMission(MISSION_ID);
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  /** Zgłasza D3 z wybranym planem (z `optionId`, jak robi to ekran), kończy etap i odtwarza mostek. */
  const playBridge = (stageId: string, optionId: string): string[] => {
    const tier = optionId === 'vector_party_zip' ? 'ideal' : 'suboptimal';
    useMissionStore.getState().reportDecision({ num: 3, question: 'JAK GO OSZUKASZ?', answer: 'X', tier, feedback: '', optionId });
    useMissionStore.setState({ chatMessages: [] });
    useMissionStore.getState().completeStage(stageId);
    driveBridge();
    return useMissionStore.getState().chatMessages.map((m) => m.text);
  };

  it.each([
    ['vector_party_zip', PARTY_BROWSER, HR_BROWSER],
    ['vector_hr_docs', HR_BROWSER, PARTY_BROWSER]
  ])('mostek 2 dla planu %s: pasuje tylko jego kwestia BM', (plan, expected, other) => {
    const texts = playBridge('browser', plan);
    expect(texts).toContain(expected);
    expect(texts).not.toContain(other);
    expect(texts).toContain('WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ');
  });

  it.each([
    ['vector_party_zip', PARTY_PENDRIVE, HR_PENDRIVE],
    ['vector_hr_docs', HR_PENDRIVE, PARTY_PENDRIVE]
  ])('mostek 3 dla planu %s: pasuje tylko jego kwestia gracza, wspólne kwestie zostają', (plan, expected, other) => {
    const texts = playBridge('pendrive_app', plan);
    expect(texts).toContain(expected);
    expect(texts).not.toContain(other);
    expect(texts).toContain(PENDRIVE_COMMON);
    expect(texts).toContain('JASNE, SŁYSZYMY SIĘ ZA KILKA GODZIN');
  });
});

describe('Misja 3 — raport i helpery zgłaszania decyzji', () => {
  it('buildReport: odpowiedź = reportAnswer ?? label, poziom i feedback z opcji, z możliwością nadpisania', () => {
    const rat = virusLabConfig.virus.options.find((o) => o.id === 'rat')!;
    expect(buildReport(virusLabConfig.virus, rat)).toEqual({
      num: 1,
      question: 'WYBIERZ ODPOWIEDNIEGO WIRUSA',
      optionId: 'rat',
      answer: 'RAT',
      tier: 'ideal',
      feedback: rat.feedback
    });
    const sig = pendriveConfig.signature.options.find((o) => o.tier === 'ideal')!;
    expect(buildReport(pendriveConfig.signature, sig).answer).toBe(sig.label);
    expect(buildReport(pendriveConfig.signature, sig, { tier: 'suboptimal' }).tier).toBe('suboptimal');
  });
});

// ---------------------------------------------------------------------------
// MOSTKI, PRZESKOKI CZASU I ROZMOWA PRZY OTWARCIU
// ---------------------------------------------------------------------------
describe('Misja 3 — mostki (1:1 z dokumentem), przeskoki z zegarem, openingConversation', () => {
  it('mostek 1 (wirus -> przeglądarka): kwestia gracza i adres strony', () => {
    expect(bridgeOf('virus_database')).toEqual([
      'GRACZ: GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?',
      'BM: ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD'
    ]);
  });

  it('mostek 2 (przeglądarka -> pendrive): dwie osobne kwestie BM, spójnik gracza na końcu', () => {
    expect(bridgeOf('browser')).toEqual([
      'BM: DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE',
      'BM: WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ',
      'GRACZ: ODBIERAM PLIKI. PRZYGOTUJĘ NOŚNIK.'
    ]);
  });

  it('mostek 3 (pendrive -> dron): dwie kwestie gracza z rzędu, adres 53-034, nocny przeskok 22:15 -> 06:02', () => {
    expect(bridgeOf('pendrive_app')).toEqual([
      'GRACZ: GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI',
      'GRACZ: MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?',
      'BM: JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW, POLSKA (PL)',
      'BM: DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA. WTEDY W PRACY NA PEWNO SPRAWDZI ZAWARTOŚĆ',
      'GRACZ: JASNE, SŁYSZYMY SIĘ ZA KILKA GODZIN',
      'PRZESKOK: 22:15->06:02',
      'BM: JUŻ CZAS. DRON GOTOWY DO WYLOTU?',
      "GRACZ: JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE'A"
    ]);
    const beats = stageOf('pendrive_app').completion.conversation!;
    expect(beats[0].from).toBe('player');
    expect(beats[1].from).toBe('player');
  });

  it('mostek 4 (dron -> RAT): kwestia gracza, poranny przeskok 06:02 -> 08:12, baner MALWARE ZOSTAŁ AKTYWOWANY, bez „WEJDŹ NA JEGO KOMPUTER”', () => {
    expect(bridgeOf('drone_app')).toEqual([
      'GRACZ: OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA',
      'PRZESKOK: 06:02->08:12'
    ]);
    const completion = stageOf('drone_app').completion;
    expect(completion.incomingCall).toEqual({ appId: 'rat_session', label: 'MALWARE ZOSTAŁ AKTYWOWANY' });
    expect(completion.sound).toBe('alarm');
    expect(JSON.stringify(def().stages)).not.toContain('WEJDŹ NA JEGO KOMPUTER');
    expect(JSON.stringify(def().stages)).not.toContain('MIJA KILKA GODZIN');
  });

  it('mostek 5 (RAT -> raport): kwestia gracza i dwie osobne kwestie BM', () => {
    expect(bridgeOf('rat_session')).toEqual([
      'GRACZ: MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?',
      'BM: WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI',
      'BM: JESTEŚMY W KONTAKCIE!'
    ]);
  });

  it('//DRON ma openingConversation z adresem i opisem auta (dwie kwestie obok siebie), bez „ZDJĘCIE”; inne etapy jej nie mają', () => {
    const opening = stageOf('drone_app').openingConversation!;
    expect(opening.map(beatLine)).toEqual([
      'BM: WSKAŻ DOM MATEUSZA NA MAPIE. PRZYPOMINAM ADRES: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW',
      'BM: GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM.'
    ]);
    const text = opening.map(beatLine).join(' ');
    expect(text).toContain('BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM');
    // Adres z rozmowy = adres opcji idealnej D5 (gracz nie musi niczego przewijać).
    expect(text).toContain('OŁTASZYŃSKA 92C');
    expect(text).not.toContain('PRZEWIŃ CZAT');
    expect(text).not.toContain('ZDJĘCIE');
    (def().stages ?? [])
      .filter((s) => s.id !== 'drone_app')
      .forEach((s) => expect(s.openingConversation, s.id).toBeUndefined());
  });
});

describe('Misja 3 — przepływ przez silnik', () => {
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

  it('same idealne decyzje -> 100%, 4,02 BTC, 0 wpadek, odblokowany raport; dwa przeskoki czasu z zegarem', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    const jumps: Array<{ clockFrom?: string; clock?: string; label?: string }> = [];
    driveBridge(jumps); // intro -> odblokowanie bazy wirusów
    expect(useMissionStore.getState().unlockedIcons).toContain('virus_database');

    (def().stages ?? []).forEach((stage) => {
      (stage.decisions ?? []).forEach((num) =>
        store.reportDecision({ num, question: `D${num}`, answer: 'IDEAL', tier: 'ideal', feedback: '' })
      );
      store.completeStage(stage.id);
      driveBridge(jumps);
    });

    const final = useMissionStore.getState();
    expect(final.score).toBe(100);
    expect(final.btcReward).toBe(4.02);
    expect(final.criticalErrorsCount).toBe(0);
    expect(final.playerChoices.length).toBe(6);
    expect(final.unlockedIcons).toContain('debrief_app');
    expect(jumps).toEqual([
      { clockFrom: '22:15', clock: '06:02', label: 'DO PORANKA…' },
      { clockFrom: '06:02', clock: '08:12', label: 'DO GODZIN PRACY BIURA…' }
    ]);
    // Po przeskokach zegar pulpitu stoi na godzinie z ostatniego przeskoku.
    expect(final.systemTime).toBe('08:12');
  });

  [1, 2, 3, 4, 5, 6].forEach((num) => {
    it(`decyzja ${num} z poziomem critical otwiera ekran wykrycia i zbiera 0 pkt`, () => {
      report(num, 'critical');
      const st = useMissionStore.getState();
      expect(st.isDetectedModalOpen).toBe(true);
      expect(st.criticalErrorsCount).toBe(1);
      expect(st.detectionReason?.choiceNum).toBe(num);
      expect(st.score).toBeLessThan(100);
    });
  });

  it('suboptimal (np. D1 keylogger, D2 Wiktoria, D3 dokumenty HR, D6 pusty asfalt) obniża wynik bez wykrycia', () => {
    report(1, 'suboptimal');
    report(2, 'suboptimal');
    report(3, 'suboptimal');
    report(6, 'suboptimal');
    const st = useMissionStore.getState();
    expect(st.isDetectedModalOpen).toBe(false);
    expect(st.criticalErrorsCount).toBe(0);
    expect(st.goodChoicesCount).toBe(4);
    // Suboptimal to połowa udziału decyzji (100/6): cztery takie decyzje kosztują 4 × 8,33 pkt.
    expect(st.score).toBeCloseTo(100 - 4 * (100 / 6 / 2), 1);
    expect(st.playerChoices.find((c) => c.num === 6)?.outcome).toBe('suboptimal');
  });

  it('mostki odblokowują kafelki dopiero po kwestii gracza (a przy przeskoku czasu także po przeskoku)', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();
    for (const stage of def().stages ?? []) {
      const unlockId = stage.completion.unlockIcons![0];
      const beats = stage.completion.conversation ?? [];
      expect(beats.some((b) => b.from === 'player'), `${stage.id}: kwestia gracza`).toBe(true);
      expect(useMissionStore.getState().unlockedIcons).not.toContain(unlockId);

      store.completeStage(stage.id);
      vi.runAllTimers();
      // Mostek czeka na kliknięcie kwestii gracza albo na koniec przeskoku: kafelek jeszcze zablokowany.
      expect(useMissionStore.getState().unlockedIcons, `${stage.id}: przed kwestią gracza`).not.toContain(unlockId);
      driveBridge();
      expect(useMissionStore.getState().unlockedIcons, `${stage.id}: po mostku`).toContain(unlockId);
    }
  });

  it('mostek pendrive -> dron: dwie kwestie gracza pod rząd, potem przeskok 22:15 -> 06:02, kafelek drona po przeskoku', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();
    for (const id of ['virus_database', 'browser']) {
      store.completeStage(id);
      driveBridge();
    }
    // Plan D3 zgłoszony z optionId (jak na ekranie): od niego zależy kwestia „ZDJĘCIA PODRZUCĘ…”.
    store.reportDecision({ num: 3, question: 'JAK GO OSZUKASZ?', answer: 'X', tier: 'ideal', feedback: '', optionId: 'vector_party_zip' });
    store.completeStage('pendrive_app');
    // Pętla ręczna: klikamy kwestie gracza do momentu przeskoku.
    let playerClicks = 0;
    for (let i = 0; i < 20 && !useMissionStore.getState().timeJump; i++) {
      vi.runAllTimers();
      const beat = useMissionStore.getState().chatAvailableChoices.find((c) => c.bridgeBeat);
      if (beat && !useMissionStore.getState().timeJump) {
        useMissionStore.getState().chooseChatOption(beat.id);
        playerClicks++;
      }
    }
    expect(playerClicks).toBe(3); // dwie kwestie otwierające (po rzędzie) + „SŁYSZYMY SIĘ ZA KILKA GODZIN”
    const jump = useMissionStore.getState().timeJump!;
    expect(jump.clockFrom).toBe('22:15');
    expect(jump.clock).toBe('06:02');
    expect(useMissionStore.getState().unlockedIcons).not.toContain('drone_unlocked');
    useMissionStore.getState().endTimeJump();
    expect(useMissionStore.getState().systemTime).toBe('06:02');
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('drone_unlocked');
  });

  it('mostek drona -> sesja RAT: przeskok 06:02 -> 08:12, kafelek sesji i baner dopiero po przeskoku', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();
    for (const id of ['virus_database', 'browser', 'pendrive_app']) {
      store.completeStage(id);
      driveBridge();
    }
    store.completeStage('drone_app');
    for (let i = 0; i < 20 && !useMissionStore.getState().timeJump; i++) {
      vi.runAllTimers();
      const beat = useMissionStore.getState().chatAvailableChoices.find((c) => c.bridgeBeat);
      if (beat && !useMissionStore.getState().timeJump) useMissionStore.getState().chooseChatOption(beat.id);
    }
    const jump = useMissionStore.getState().timeJump!;
    expect([jump.clockFrom, jump.clock]).toEqual(['06:02', '08:12']);
    expect(useMissionStore.getState().unlockedIcons).not.toContain('rat_session_unlocked');
    expect(useMissionStore.getState().incomingCall).toBeNull();
    useMissionStore.getState().endTimeJump();
    driveBridge();
    expect(useMissionStore.getState().unlockedIcons).toContain('rat_session_unlocked');
    expect(useMissionStore.getState().incomingCall).toEqual({
      appId: 'rat_session',
      label: 'MALWARE ZOSTAŁ AKTYWOWANY'
    });
  });

  it('pierwsze otwarcie //DRON gra w czacie opis auta od BM (raz na rozgrywkę)', () => {
    const store = useMissionStore.getState();
    store.finishBiosBoot();
    driveBridge();
    for (const id of ['virus_database', 'browser', 'pendrive_app']) {
      store.completeStage(id);
      driveBridge();
    }
    const dronTexts = () =>
      useMissionStore
        .getState()
        .chatMessages.filter((m) => m.sender === 'BYTE_MASTER' && /BIAŁYM SAMOCHODEM/.test(m.text));
    expect(dronTexts()).toHaveLength(0);

    useMissionStore.getState().openApp('drone_app');
    driveBridge();
    const messages = useMissionStore.getState().chatMessages.map((m) => m.text);
    expect(messages).toContain('WSKAŻ DOM MATEUSZA NA MAPIE. PRZYPOMINAM ADRES: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW');
    expect(dronTexts()).toHaveLength(1);
    // Adres jest dwa razy w logu: w mostku etapu 3 i w ostatnich kwestiach przed mapą (widoczny bez przewijania).
    expect(messages.filter((t) => t.includes('OŁTASZYŃSKA 92C/6, 53-034'))).toHaveLength(2);
    // Opis auta jest ostatnią kwestią: adres i opis auta sąsiadują na dole czatu.
    expect(messages[messages.length - 1]).toBe('GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM.');
    expect(messages[messages.length - 2]).toContain('OŁTASZYŃSKA 92C/6');

    // Zamknięcie i ponowne otwarcie nie powtarza rozmowy.
    useMissionStore.getState().closeApp();
    useMissionStore.getState().openApp('drone_app');
    driveBridge();
    expect(dronTexts()).toHaveLength(1);
  });
});
