import { mission1Definition, mission1Apps } from './mission_01_petrolog';
import { mission2Definition, mission2Apps } from './mission_02_carbon_flow';
import { mission3Definition, mission3Apps } from './mission_03_ol_company';
import { mission4Definition, mission4Apps } from './mission_04_energy_rock';
import type { MissionDefinition } from '../engine/types/mission';

export const availableScenarios: Array<{
  id: string;
  name: string;
  definition: MissionDefinition;
  apps: Record<string, React.ComponentType<any>>;
}> = [
  {
    id: 'mission-1-petrolog',
    name: 'MISJA 1 – PETROLOG (OSINT & Spear-Phishing)',
    definition: mission1Definition,
    apps: mission1Apps
  },
  {
    id: 'mission-2-carbonflow',
    name: 'MISJA 2 – CARBONFLOW (Kampania Phishingowa & Botnet)',
    definition: mission2Definition,
    apps: mission2Apps
  },
  {
    id: 'mission-3-ol-company',
    name: 'MISJA 3 – O&L COMPANY (Infiltracja Socjotechniczna)',
    definition: mission3Definition,
    apps: mission3Apps
  },
  {
    id: 'mission-4-energy-rock',
    name: 'MISJA 4 – ENERGY ROCK (Atak Ransomware & Freevolt)',
    definition: mission4Definition,
    apps: mission4Apps
  }
];

export {
  mission1Definition,
  mission1Apps,
  mission2Definition,
  mission2Apps,
  mission3Definition,
  mission3Apps,
  mission4Definition,
  mission4Apps
};

