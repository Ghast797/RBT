import mission4Data from './data/mission4.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';
import { mission4Stages, mission4Blocks } from './stages';
import {
  RansomwareVirusApp,
  RansomwareBuilderApp,
  PhishingMailApp,
  VpnApp,
  WorkstationExfiltrationApp
} from './minigames';

const base = mission4Data as unknown as MissionDefinition;

// Kafelki przepięte na klocki z katalogu (componentId wskazuje klocek, nie minigrę misji).
const CATALOG_COMPONENT: Record<string, string> = {
  negotiation: 'dialogue_tree',
  vpn_app: 'vpn_router'
};

const desktopApps = base.desktopApps.map((tile) =>
  CATALOG_COMPONENT[tile.id] ? { ...tile, componentId: CATALOG_COMPONENT[tile.id] } : tile
);

// Definicja misji wzbogacona o etapy i dane klocków nowego modelu.
export const mission4Definition: MissionDefinition = {
  ...base,
  desktopApps,
  stages: mission4Stages,
  blocks: mission4Blocks
};

// Minigry misji rejestrowane w silniku pod swoimi componentId (bez importów w appRegistry).
export const mission4Apps: Record<string, React.ComponentType<any>> = {
  ransomware_virus_scanner: RansomwareVirusApp,
  ransomware_builder: RansomwareBuilderApp,
  mail: PhishingMailApp,
  vpn_app: VpnApp,
  victim_workstation: WorkstationExfiltrationApp
};

// Rejestracja per-scenariusz oraz globalna
registerScenarioApps('mission-4-energy-rock', mission4Apps);
registerScenarioApps('4', mission4Apps);
Object.entries(mission4Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export {
  RansomwareVirusApp,
  RansomwareBuilderApp,
  PhishingMailApp,
  VpnApp,
  WorkstationExfiltrationApp
};

export const scenarioDefinition = mission4Definition;
export const scenarioApps = mission4Apps;
