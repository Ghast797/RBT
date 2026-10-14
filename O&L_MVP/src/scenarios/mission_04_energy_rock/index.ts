import mission4Data from './data/mission4.json';
import type { MissionDefinition } from '../../engine/types/mission';
import { RansomwareVirusApp } from './apps/RansomwareVirusApp';
import { RansomwareBuilderApp } from './apps/RansomwareBuilderApp';
import { PhishingMailApp } from './apps/PhishingMailApp';
import { VpnApp } from './apps/VpnApp';
import { WorkstationExfiltrationApp } from './apps/WorkstationExfiltrationApp';
import { NegotiationChatApp } from './apps/NegotiationChatApp';

export const mission4Definition = mission4Data as unknown as MissionDefinition;

export const mission4Apps: Record<string, React.ComponentType<any>> = {
  virus_database: RansomwareVirusApp,
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
