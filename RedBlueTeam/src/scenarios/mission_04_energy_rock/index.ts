import mission4Data from './data/mission4.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { mission4Stages, mission4Blocks } from './stages';
import {
  RansomwareVirusApp,
  RansomwareBuilderApp,
  PhishingMailApp,
  VpnApp,
  WorkstationExfiltrationApp,
  NegotiationChatApp
} from '../../engine/widgets';

const base = mission4Data as unknown as MissionDefinition;

// Kafelki przepięte na klocki z katalogu (componentId wskazuje klocek, nie widget misji).
const CATALOG_COMPONENT: Record<string, string> = {
  negotiation: 'dialogue_tree'
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

export const mission4Apps: Record<string, React.ComponentType<any>> = {
  virus_database: RansomwareVirusApp,
  ransomware_virus_scanner: RansomwareVirusApp,
  ransomware_builder: RansomwareBuilderApp,
  mail: PhishingMailApp,
  vpn_app: VpnApp,
  victim_workstation: WorkstationExfiltrationApp,
  negotiation: NegotiationChatApp
};

export {
  RansomwareVirusApp,
  RansomwareBuilderApp,
  PhishingMailApp,
  VpnApp,
  WorkstationExfiltrationApp,
  NegotiationChatApp
};
