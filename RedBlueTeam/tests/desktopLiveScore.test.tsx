// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Desktop } from '../src/engine/components/Desktop';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission1Definition } from '../src/scenarios/mission_01_petrolog';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import { mission3Definition } from '../src/scenarios/mission_03_ol_company';
import { mission4Definition } from '../src/scenarios/mission_04_energy_rock';

const open = (def: any, score?: number) => {
  useMissionStore.getState().loadMission(def);
  useMissionStore.setState({ bootStage: 'desktop', ...(score !== undefined ? { score } : {}) });
  return render(<Desktop />);
};

describe('ENG-17: wynik na dolnym pasku pulpitu', () => {
  afterEach(cleanup);
  it('M1 pokazuje WYNIK i BTC', () => {
    open(mission1Definition);
    expect(screen.queryByText('WYNIK:')).toBeTruthy();
    expect(screen.queryByText(/BTC$/)).toBeTruthy();
  });
  it('wynik poniżej progu jest czerwony, a na progu zielony', () => {
    const pass = mission1Definition.mission.passingScore ?? 70;
    const low = open(mission1Definition, pass - 10);
    expect(low.container.querySelector('[data-live-score] .text-\\[\\#ff3366\\]')).toBeTruthy();
    cleanup();
    const ok = open(mission1Definition, pass);
    expect(ok.container.querySelector('[data-live-score] .text-\\[\\#00ff66\\]')).toBeTruthy();
  });
  it('pasek jest ukrywany na wąskich ekranach (klasa hidden sm:flex)', () => {
    const { container } = open(mission1Definition);
    expect(container.querySelector('[data-live-score]')?.className).toContain('hidden sm:flex');
  });
  it.each([['M2', mission2Definition], ['M3', mission3Definition], ['M4', mission4Definition]])('%s ukrywa WYNIK i BTC', (_n, def) => {
    open(def);
    expect(screen.queryByText('WYNIK:')).toBeNull();
    expect(screen.queryByText(/BTC$/)).toBeNull();
  });
});
