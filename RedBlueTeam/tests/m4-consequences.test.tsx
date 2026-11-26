// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import type { ChoiceOutcome, DecisionChoice } from '../src/engine/types/mission';
import { c2Config } from '../src/scenarios/mission_04_energy_rock/stages';
import {
  applySelection,
  c2StartInfo,
  canConfirmExfil,
  exfilCounterText
} from '../src/scenarios/mission_04_energy_rock/minigames/exfilLogic';
import { ExfilFiles } from '../src/scenarios/mission_04_energy_rock/minigames/ExfilFiles';

const MISSION_ID = 'mission-4-energy-rock';
const MENTOR = 'IT JUŻ COŚ PODEJRZEWA. DZIAŁAJ SZYBKO.';

type Tiers = Record<5 | 6 | 7, ChoiceOutcome>;
type Jump = { clockFrom?: string; clock?: string };

function driveBridge(jumps: Jump[]) {
  for (let i = 0; i < 60; i++) {
    vi.runAllTimers();
    const st = useMissionStore.getState();
    if (st.timeJump) {
      jumps.push({ clockFrom: st.timeJump.clockFrom, clock: st.timeJump.clock });
      st.endTimeJump();
      continue;
    }
    if (!st.pendingBridge) return;
    const beat = st.chatAvailableChoices.find((c) => c.bridgeBeat);
    if (beat) useMissionStore.getState().chooseChatOption(beat.id);
    else return;
  }
}

const rep = (num: number, tier: ChoiceOutcome) =>
  useMissionStore.getState().reportDecision({ num, question: `D${num}`, answer: 'X', tier, feedback: '' });

/** Przechodzi misję do końca etapu `victim_workstation` z podanymi poziomami D5–D7. */
function run(tiers: Tiers) {
  const store = useMissionStore.getState();
  store.loadMission(MISSION_ID);
  store.finishBiosBoot();
  const jumps: Jump[] = [];
  driveBridge(jumps);
  const stage = (id: string, decisions: number[]) => {
    decisions.forEach((n) => rep(n, n === 5 || n === 6 || n === 7 ? tiers[n] : 'ideal'));
    useMissionStore.getState().completeStage(id);
    driveBridge(jumps);
  };
  stage('virus_database', [1]);
  stage('ransomware_builder', [2, 3, 4]);
  stage('mail', [5, 6]);
  stage('vpn_app', [7]);
  stage('victim_workstation', [8]);
  const lines = useMissionStore.getState().chatMessages.map((m) => m.text);
  return { jumps, lines };
}

describe('M4-02: odroczone skutki słabszego maila (mostki)', () => {
  beforeEach(() => {
    useMissionStore.getState().resetGame();
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
  });
  afterEach(() => {
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  it('ideał D5–D7: 09:10 i 09:10->11:35, bez kwestii o podejrzeniach IT', () => {
    const { jumps, lines } = run({ 5: 'ideal', 6: 'ideal', 7: 'ideal' });
    expect(jumps).toEqual([
      { clockFrom: '16:40', clock: '09:10' },
      { clockFrom: '09:10', clock: '11:35' }
    ]);
    expect(lines).not.toContain(MENTOR);
  });

  it.each([5, 6, 7] as const)('sam słabszy D%i: późniejsza godzina i kwestia mentora', (n) => {
    const tiers: Tiers = { 5: 'ideal', 6: 'ideal', 7: 'ideal' };
    tiers[n] = 'suboptimal';
    const { jumps, lines } = run(tiers);
    expect(jumps).toEqual([
      { clockFrom: '16:40', clock: '12:25' },
      { clockFrom: '12:25', clock: '14:50' }
    ]);
    expect(lines).toContain(MENTOR);
  });
});

describe('M4-02: ekran startowy C2', () => {
  const ch = (tier: ChoiceOutcome): DecisionChoice => ({ answer: 'X', tier });
  const { start } = c2Config;

  it('ideał lub brak wyborów: status bez zmian, bez dopisków', () => {
    expect(c2StartInfo(start, {})).toEqual({ status: start.status, notes: [] });
    expect(c2StartInfo(start, { 5: ch('ideal'), 6: ch('ideal'), 7: ch('ideal') })).toEqual({
      status: 'CV ZOSTAŁO OTWARTE – MALWARE ZOSTAŁ AKTYWOWANY',
      notes: []
    });
  });

  it.each([
    [5, 'NAZWA PLIKU WZBUDZIŁA WĄTPLIWOŚCI REKRUTERA – OTWORZYŁ GO Z OPÓŹNIENIEM'],
    [6, 'SKANER POCZTY ZATRZYMAŁ ZAŁĄCZNIK BEZ HASŁA – REKRUTER ZWOLNIŁ GO RĘCZNIE DOPIERO PO POŁUDNIU'],
    [7, 'REKRUTER ZGŁOSIŁ DO IT NIETYPOWY ADRES NADAWCY']
  ])('słabszy D%i: status z opóźnieniem i jedna linia', (n, text) => {
    const choices: Record<number, DecisionChoice> = { 5: ch('ideal'), 6: ch('ideal'), 7: ch('ideal') };
    choices[n] = ch('suboptimal');
    expect(c2StartInfo(start, choices)).toEqual({
      status: 'CV ZOSTAŁO OTWARTE Z OPÓŹNIENIEM – MALWARE ZOSTAŁ AKTYWOWANY',
      notes: [text]
    });
  });

  it('kilka słabszych: po jednej linii na każdy, w kolejności D5, D6, D7', () => {
    const info = c2StartInfo(start, { 5: ch('suboptimal'), 6: ch('suboptimal'), 7: ch('suboptimal') });
    expect(info.notes).toHaveLength(3);
    expect(info.notes[2]).toContain('ADRES NADAWCY');
  });
});

describe('M4-04: licznik plików D8', () => {
  const { exfil } = c2Config;
  const max = exfil.requiredTargets;

  afterEach(cleanup);

  it('limit 3 z configu, nie można dodać czwartego, usunięcie działa', () => {
    expect(max).toBe(3);
    let sel: string[] = [];
    for (const id of ['a', 'b', 'c', 'd']) sel = applySelection(sel, id, true, max);
    expect(sel).toEqual(['a', 'b', 'c']);
    expect(applySelection(sel, 'b', true, max)).toEqual(['a', 'b', 'c']);
    expect(applySelection(sel, 'b', false, max)).toEqual(['a', 'c']);
  });

  it('zatwierdzenie tylko przy dokładnie 3 plikach', () => {
    expect(canConfirmExfil([], max)).toBe(false);
    expect(canConfirmExfil(['a', 'b'], max)).toBe(false);
    expect(canConfirmExfil(['a', 'b', 'c'], max)).toBe(true);
    expect(canConfirmExfil(['a', 'b', 'c', 'd'], max)).toBe(false);
  });

  it('tekst licznika i render w polu pobranych plików', () => {
    const sel = [exfil.files[0].id];
    expect(exfilCounterText(exfil.counterLabel, sel, max)).toBe('WYBRANO 1/3');
    render(
      <ExfilFiles
        accent="#fff"
        files={exfil.files}
        selected={sel}
        fieldLabel={exfil.fieldLabel}
        counter={exfilCounterText(exfil.counterLabel, sel, max)}
        onToggle={() => {}}
        onSet={() => {}}
      />
    );
    expect(screen.getByText('WYBRANO 1/3')).toBeTruthy();
  });
});
