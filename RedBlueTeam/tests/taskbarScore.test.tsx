// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Taskbar } from '../src/engine/components/Taskbar';
import { useMissionStore } from '../src/engine/store/useMissionStore';
import { mission1Definition } from '../src/scenarios/mission_01_petrolog';
import { mission2Definition } from '../src/scenarios/mission_02_carbon_flow';
import { mission3Definition } from '../src/scenarios/mission_03_ol_company';
import { mission4Definition } from '../src/scenarios/mission_04_energy_rock';

describe('ENG-17: wynik na pasku zadań', () => {
  afterEach(cleanup);
  it('M1 pokazuje WYNIK i BTC', () => {
    useMissionStore.getState().loadMission(mission1Definition);
    render(<Taskbar />);
    expect(screen.queryByText('WYNIK:')).toBeTruthy();
    expect(screen.queryByText(/BTC$/)).toBeTruthy();
  });
  it.each([['M2', mission2Definition], ['M3', mission3Definition], ['M4', mission4Definition]])('%s ukrywa WYNIK i BTC', (_n, def) => {
    useMissionStore.getState().loadMission(def);
    render(<Taskbar />);
    expect(screen.queryByText('WYNIK:')).toBeNull();
    expect(screen.queryByText(/BTC$/)).toBeNull();
  });
});
