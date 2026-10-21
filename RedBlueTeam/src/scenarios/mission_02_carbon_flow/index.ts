import mission2Data from './data/mission2.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { registerApp, registerScenarioApps } from '../../engine/registry/appRegistry';
import { mission2Stages, mission2Blocks } from './stages';
import {
  PhishingCampaignApp,
  VpnApp,
  WormBuilderApp,
  PhishingDispatchApp,
  BotnetMonitorApp
} from './minigames';

const base = mission2Data as unknown as MissionDefinition;

// Kafelki przepięte na klocki z katalogu silnika (klocek VpnRouter).
const CATALOG_COMPONENT: Record<string, string> = {
  vpn_app: 'vpn_router'
};

const desktopApps = base.desktopApps.map((tile) =>
  CATALOG_COMPONENT[tile.id] ? { ...tile, componentId: CATALOG_COMPONENT[tile.id] } : tile
);

// Definicja misji wzbogacona o etapy i dane klocków (wzorzec B).
export const mission2Definition: MissionDefinition = {
  ...base,
  desktopApps,
  stages: mission2Stages,
  blocks: mission2Blocks
};

// Minigry misji rejestrowane w silniku pod swoimi componentId.
export const mission2Apps: Record<string, React.ComponentType<any>> = {
  phishing_campaign: PhishingCampaignApp,
  vpn_app: VpnApp,
  worm_builder: WormBuilderApp,
  phishing_dispatch: PhishingDispatchApp,
  botnet_monitor: BotnetMonitorApp
};

// Rejestracja per-scenariusz (zapobiega konfliktowi z np. vpn_app w misji 4) oraz globalna
registerScenarioApps('mission-2-carbonflow', mission2Apps);
registerScenarioApps('2', mission2Apps);
Object.entries(mission2Apps).forEach(([componentId, component]) => registerApp(componentId, component));

export {
  PhishingCampaignApp,
  VpnApp,
  WormBuilderApp,
  PhishingDispatchApp,
  BotnetMonitorApp
};

export const scenarioDefinition = mission2Definition;
export const scenarioApps = mission2Apps;
