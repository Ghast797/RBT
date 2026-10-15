import mission3Data from './data/mission3.json';
import type { MissionDefinition } from '../../engine/types/mission';
import {
  VirusDatabaseApp,
  TorBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
} from '../../engine/widgets';

export const mission3Definition = mission3Data as unknown as MissionDefinition;

export const mission3Apps: Record<string, React.ComponentType<any>> = {
  virus_database: VirusDatabaseApp,
  browser: TorBrowserApp,
  pendrive_app: PendriveApp,
  drone_app: DroneApp,
  rat_session: RatSessionApp
};

export {
  VirusDatabaseApp,
  TorBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
};
