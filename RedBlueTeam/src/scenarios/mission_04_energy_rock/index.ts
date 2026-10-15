import mission4Data from './data/mission4.json';
import type { MissionDefinition } from '../../engine/types/mission';
import {
  RansomwareVirusApp,
  RansomwareBuilderApp,
  PhishingMailApp,
  VpnApp,
  WorkstationExfiltrationApp,
  NegotiationChatApp
} from '../../engine/widgets';

export const mission4Definition = mission4Data as unknown as MissionDefinition;

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
