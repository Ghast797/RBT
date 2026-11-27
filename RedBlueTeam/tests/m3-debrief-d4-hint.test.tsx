// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DebriefApp } from '../src/engine/apps/DebriefApp';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission3Definition } from '../src/scenarios/mission_03_ol_company';
import type { PlayerChoiceRecord, DecisionChoice } from '../src/engine/types/mission';

const PARTY = 'NAZWA DYSKU: IMPREZA / PODPIS: ZDJĘCIA Z AFTERPARTY O&L COMPANY!';
const HR = 'NAZWA DYSKU: DOKUMENTY HR / PODPIS: WYPOWIEDZENIE UMOWY';

const show = (d3: DecisionChoice) => {
  const choice: PlayerChoiceRecord = {
    num: 4, question: 'WYBIERZ PODPIS NA KOPERCIE', answer: 'ZGUBIONE DOKUMENTY', isCorrect: false, details: 'x', outcome: 'suboptimal'
  };
  useMissionStore.getState().loadMission(mission3Definition);
  useMissionStore.setState({
    playerChoices: [choice],
    expandedChoiceIndex: 0,
    decisionChoices: { 3: d3, 4: { answer: 'ZGUBIONE DOKUMENTY', tier: 'suboptimal' } }
  });
  return render(<DebriefApp />);
};

describe('M3: podpowiedź raportu D4 zależy od planu D3', () => {
  afterEach(cleanup);

  it('plan zdjęć: para IMPREZA / ZDJĘCIA Z AFTERPARTY', () => {
    show({ optionId: 'vector_party_zip', answer: 'x', tier: 'ideal' });
    expect(screen.getByText((t) => t.includes(PARTY))).toBeTruthy();
    expect(screen.queryByText((t) => t.includes(HR))).toBeNull();
  });

  it('plan HR: para DOKUMENTY HR / WYPOWIEDZENIE UMOWY', () => {
    show({ optionId: 'vector_hr_docs', answer: 'x', tier: 'suboptimal' });
    expect(screen.getByText((t) => t.includes(HR))).toBeTruthy();
    expect(screen.queryByText((t) => t.includes(PARTY))).toBeNull();
  });
});
