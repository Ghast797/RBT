// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { DebriefApp } from '../src/engine/apps/DebriefApp';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { mission4Definition } from '../src/scenarios/mission_04_energy_rock';
import { c2Config } from '../src/scenarios/mission_04_energy_rock/stages';
import { buildExfilReport } from '../src/scenarios/mission_04_energy_rock/minigames/exfilLogic';
import type { ChoiceOutcome, PlayerChoiceRecord } from '../src/engine/types/mission';

const MISSION_ID = 'mission-4-energy-rock';

describe('M4: przebieg negocjacji zależny od odpowiedzi D9', () => {
  afterEach(cleanup);

  const showTranscript = (optionId: string, tier: ChoiceOutcome) => {
    useMissionStore.getState().loadMission(mission4Definition);
    const rec: PlayerChoiceRecord = {
      num: 10, question: 'CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?', answer: 'X', isCorrect: true, details: 'x', outcome: 'ideal'
    };
    useMissionStore.setState({
      playerChoices: [rec],
      expandedChoiceIndex: 0,
      decisionChoices: { 9: { answer: 'X', tier, optionId }, 10: { answer: 'X', tier: 'ideal', optionId: 'btc_demand' } }
    });
    render(<DebriefApp />);
    fireEvent.click(screen.getByText('POKAŻ PRZEBIEG NEGOCJACJI'));
  };

  it('stanowczość: tura 1 z pochwałą, 3 tury', () => {
    showTranscript('firm_stance', 'ideal');
    expect(screen.getByText(/TURY: 3/)).toBeTruthy();
    expect(screen.getByText(/Twarde stanowisko techniczne/)).toBeTruthy();
    expect(screen.queryByText(/NIE BOJĘ SIĘ POLICJI/)).toBeNull();
    expect(screen.queryByText(/OKEJ, JUŻ WAM NIE PRZESZKADZAM/)).toBeNull();
  });

  it('agresja: tura 1 z groźbą zerwania i powrotem, bez twardego stanowiska', () => {
    showTranscript('aggression', 'suboptimal');
    expect(screen.getByText(/TURY: 3/)).toBeTruthy();
    expect(screen.getByText(/NIE BOJĘ SIĘ POLICJI/)).toBeTruthy();
    expect(screen.getByText(/ZRYWAM ROZMOWY I ZOSTAWIAM SPRAWĘ SŁUŻBOM/)).toBeTruthy();
    expect(screen.queryByText(/Twarde stanowisko techniczne/)).toBeNull();
  });

  it('kapitulacja: tura 1 z wycofaniem i powrotem', () => {
    showTranscript('surrender', 'suboptimal');
    expect(screen.getByText(/TURY: 3/)).toBeTruthy();
    expect(screen.getByText(/OKEJ, JUŻ WAM NIE PRZESZKADZAM/)).toBeTruthy();
    expect(screen.getByText(/NO WRESZCIE ROZSĄDEK/)).toBeTruthy();
    expect(screen.getByText(/CHWILA, NIE TAK SZYBKO/)).toBeTruthy();
    expect(screen.queryByText(/Twarde stanowisko techniczne/)).toBeNull();
  });
});

describe('M4: mentor po negocjacjach zależy od D8 i ostrzeżenie IT przed szyfrowaniem', () => {
  const FULL = 'TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO';
  const PARTIAL = 'MAMY OKUP, ALE DOKUMENTACJA FREEVOLT JEST NIEPEŁNA. RESZTĘ TRZEBA BĘDZIE ZDOBYĆ INACZEJ.';
  const WARN = 'IT JUŻ COŚ PODEJRZEWA. DZIAŁAJ SZYBKO.';
  const rep = (num: number, tier: ChoiceOutcome) =>
    useMissionStore.getState().reportDecision({ num, question: `D${num}`, answer: 'X', tier, feedback: '' });
  const drive = () => {
    for (let i = 0; i < 60; i++) {
      vi.runAllTimers();
      const st = useMissionStore.getState();
      if (st.timeJump) { st.endTimeJump(); continue; }
      if (!st.pendingBridge) return;
      const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
      if (beat) useMissionStore.getState().chooseChatOption(beat.id); else return;
    }
  };
  const lines = () => useMissionStore.getState().chatMessages.map((m) => m.text);

  beforeEach(() => {
    useMissionStore.getState().resetGame();
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
  });
  afterEach(() => { vi.useRealTimers(); __setBridgeDelayForTests(2000); });

  const toWorkstation = (d5: ChoiceOutcome) => {
    const s = useMissionStore.getState();
    s.loadMission(MISSION_ID);
    s.finishBiosBoot();
    drive();
    const stage = (id: string, ds: number[]) => {
      ds.forEach((n) => rep(n, n === 5 ? d5 : 'ideal'));
      useMissionStore.getState().completeStage(id);
      drive();
    };
    stage('virus_database', [1]);
    stage('ransomware_builder', [2, 3, 4]);
    stage('mail', [5, 6]);
    stage('vpn_app', [7]);
  };

  it('słabszy mail: ostrzeżenie pada po otwarciu panelu CV, przed szyfrowaniem (nie w mostku po eksfiltracji)', () => {
    toWorkstation('suboptimal');
    expect(lines()).not.toContain(WARN);
    useMissionStore.getState().openApp('victim_workstation');
    drive();
    expect(lines()).toContain(WARN);
    expect(useMissionStore.getState().completedStages).not.toContain('victim_workstation');
    rep(8, 'ideal');
    useMissionStore.getState().completeStage('victim_workstation');
    drive();
    expect(lines().filter((l) => l === WARN)).toHaveLength(1);
  });

  it('idealny mail: brak ostrzeżenia', () => {
    toWorkstation('ideal');
    useMissionStore.getState().openApp('victim_workstation');
    drive();
    expect(lines()).not.toContain(WARN);
  });

  it.each([
    ['ideal', FULL, PARTIAL],
    ['suboptimal', PARTIAL, FULL]
  ] as const)('D8 %s: właściwa kwestia mentora', (tier, yes, no) => {
    toWorkstation('ideal');
    rep(8, tier);
    useMissionStore.getState().completeStage('victim_workstation');
    drive();
    rep(9, 'ideal');
    rep(10, 'ideal');
    useMissionStore.getState().completeStage('negotiation');
    drive();
    expect(lines()).toContain(yes);
    expect(lines()).not.toContain(no);
    expect(lines()).toContain('CZY TO ZNACZY, ŻE W KOŃCU PRZYJMIECIE MNIE DO DARKSUN?');
  });
});

describe('M4: odpowiedź D8 w raporcie', () => {
  const { exfil } = c2Config;
  const id = (name: string) => exfil.files.find((f) => f.name === name)!.id;

  it('ideał bez zmian', () => {
    const sel = ['FVOLT_TECH.DOCX', 'FREEVOLT_SCHEMAT.PDF', 'ENERGIA_FVOLT.XCF'].map(id);
    expect(buildExfilReport(exfil, sel).answer).toBe('3 PLIKI FREEVOLT (DOCX, PDF, XCF)');
  });

  it('2 cele i dużo innych: nazwy celów widoczne, nadmiar liczbą', () => {
    const sel = ['MAREK.JPG', 'KONTRAKTY.XCF', 'SEKRET.TXT', 'FVOLT_TECH.DOCX', 'UMOWA2022.PDF', 'ENERGIA_FVOLT.XCF'].map(id);
    expect(buildExfilReport(exfil, sel).answer).toBe('2 Z 3 PLIKÓW FREEVOLT (FVOLT_TECH.DOCX, ENERGIA_FVOLT.XCF) + 4 INNE');
  });

  it('1 cel i 1 inny', () => {
    const sel = ['MAREK.JPG', 'FREEVOLT_SCHEMAT.PDF'].map(id);
    expect(buildExfilReport(exfil, sel).answer).toBe('1 Z 3 PLIKÓW FREEVOLT (FREEVOLT_SCHEMAT.PDF) + 1 INNY');
  });

  it('0 celów: dotychczasowa lista', () => {
    const sel = ['MAREK.JPG', 'SEKRET.TXT'].map(id);
    expect(buildExfilReport(exfil, sel).answer).toBe('MAREK.JPG, SEKRET.TXT');
  });
});
