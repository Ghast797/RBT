declare module 'virtual:active-scenario' {
  import type React from 'react';
  import type { MissionDefinition } from './mission';

  export const isIsolated: boolean;
  export const activeMissionId: string;
  export const activeMission: MissionDefinition | undefined;
  export const activeApps: Record<string, React.ComponentType<any>>;
  export const allMissions: Record<string, MissionDefinition>;
  export const missionList: Array<{ num: string; id: string; definition: MissionDefinition }>;
}
