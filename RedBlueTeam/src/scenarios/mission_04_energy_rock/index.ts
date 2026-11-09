import mission4Data from './data/mission4.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';
import { mission4Stages, mission4Blocks } from './stages';
import {
  VirusLabApp,
  RansomBuilderApp,
  PhishingMailApp,
  RansomC2App,
  VictimChatApp
} from './minigames';

const base = mission4Data as unknown as MissionDefinition;

// Definicja misji wzbogacona o etapy i dane klocków (wzorzec B).
// Kafelek //VPN używa klocka z katalogu (`vpn_router`, componentId z data/mission4.json).
export const mission4Definition: MissionDefinition = {
  ...base,
  stages: mission4Stages,
  blocks: mission4Blocks
};

// Minigry misji rejestrowane w silniku pod swoimi componentId (prefiks `er_`).
export const mission4Apps: Record<string, React.ComponentType<any>> = {
  er_virus_lab: VirusLabApp,
  er_ransom_builder: RansomBuilderApp,
  er_phishing_mail: PhishingMailApp,
  er_ransom_c2: RansomC2App,
  er_victim_chat: VictimChatApp
};

// Rejestracja per-scenariusz oraz globalna.
registerScenarioApps('mission-4-energy-rock', mission4Apps);
registerScenarioApps('4', mission4Apps);
Object.entries(mission4Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export {
  VirusLabApp,
  RansomBuilderApp,
  PhishingMailApp,
  RansomC2App,
  VictimChatApp
};

export const scenarioDefinition = mission4Definition;
export const scenarioApps = mission4Apps;
