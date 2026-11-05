import mission3Data from './data/mission3.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';
import { mission3Stages, mission3Blocks } from './stages';
import {
  VirusLabApp,
  OsintBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
} from './minigames';

const base = mission3Data as unknown as MissionDefinition;

// Definicja misji wzbogacona o etapy i dane klocków (wzorzec B).
export const mission3Definition: MissionDefinition = {
  ...base,
  stages: mission3Stages,
  blocks: mission3Blocks
};

// Minigry misji rejestrowane w silniku pod swoimi componentId (nowe id, by nie
// kolidować ze starymi widgetami z engine/widgets, które zostają do sprzątania).
export const mission3Apps: Record<string, React.ComponentType<any>> = {
  ol_virus_lab: VirusLabApp,
  ol_osint_browser: OsintBrowserApp,
  ol_pendrive: PendriveApp,
  ol_drone: DroneApp,
  ol_rat_session: RatSessionApp
};

// Rejestracja per-scenariusz oraz globalna.
registerScenarioApps('mission-3-ol-company', mission3Apps);
registerScenarioApps('3', mission3Apps);
Object.entries(mission3Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export {
  VirusLabApp,
  OsintBrowserApp,
  PendriveApp,
  DroneApp,
  RatSessionApp
};

export const scenarioDefinition = mission3Definition;
export const scenarioApps = mission3Apps;
