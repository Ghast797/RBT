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
  mission3Definition,
  mission3Apps,
  mission4Definition,
  mission4Apps
};
