import mission1Data from './data/mission1.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';
import { mission1Stages, mission1Blocks } from './stages';
import {
  TargetPetrologApp,
  OsintSearchApp,
  SocialIntelApp,
  PhishingBuilderApp,
  VictimMonitorApp
} from './minigames';

const base = mission1Data as unknown as MissionDefinition;

// Definicja misji wzbogacona o etapy i dane klocków (wzorzec B).
export const mission1Definition: MissionDefinition = {
  ...base,
  stages: mission1Stages,
  blocks: mission1Blocks
};

// Minigry misji rejestrowane pod swoimi componentId.
export const mission1Apps: Record<string, React.ComponentType<any>> = {
  target_petrolog: TargetPetrologApp,
  osint_search: OsintSearchApp,
  social_intel: SocialIntelApp,
  phishing_builder: PhishingBuilderApp,
  victim_monitor: VictimMonitorApp
};

// Rejestracja per-scenariusz oraz globalna
registerScenarioApps('mission-1-petrolog', mission1Apps);
registerScenarioApps('1', mission1Apps);
Object.entries(mission1Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export {
  TargetPetrologApp,
  OsintSearchApp,
  SocialIntelApp,
  PhishingBuilderApp,
  VictimMonitorApp
};

export const scenarioDefinition = mission1Definition;
export const scenarioApps = mission1Apps;
