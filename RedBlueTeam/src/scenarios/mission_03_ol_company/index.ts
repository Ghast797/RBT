import mission3Data from './data/mission3.json';
import type { MissionDefinition } from '../../engine/types/mission';
import {
  VirusDatabaseApp,
  TorBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
} from '../../engine/widgets';

import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';

export const mission3Definition = mission3Data as unknown as MissionDefinition;

export const mission3Apps: Record<string, React.ComponentType<any>> = {
  virus_database: VirusDatabaseApp,
  browser: TorBrowserApp,
  pendrive_app: PendriveApp,
  drone_app: DroneApp,
  rat_session: RatSessionApp
};

registerScenarioApps('mission-3-ol-company', mission3Apps);
registerScenarioApps('3', mission3Apps);
Object.entries(mission3Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export const scenarioDefinition = mission3Definition;
export const scenarioApps = mission3Apps;

export {
  VirusDatabaseApp,
  TorBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
};
