import type { MissionDefinition } from '../types/mission';
import mission3Data from '../../scenarios/mission_03_ol_company/data/mission3.json';
import mission4Data from '../../scenarios/mission_04_energy_rock/data/mission4.json';

// Global Missions Map
export const missions: Record<string, MissionDefinition> = {
  'mission-3-ol-company': mission3Data as unknown as MissionDefinition,
  'mission3': mission3Data as unknown as MissionDefinition,
  '3': mission3Data as unknown as MissionDefinition,
  'mission-4-energy-rock': mission4Data as unknown as MissionDefinition,
  'mission4': mission4Data as unknown as MissionDefinition,
  '4': mission4Data as unknown as MissionDefinition,
  'energy-rock': mission4Data as unknown as MissionDefinition,
};

/**
 * Register a new mission dynamically
 */
export function registerMission(id: string, mission: MissionDefinition): void {
  missions[id] = mission;
}

/**
 * Get all available missions
 */
export function getAllMissions(): MissionDefinition[] {
  return [
    missions['mission-3-ol-company'],
    missions['mission-4-energy-rock']
  ];
}

/**
 * Get mission by ID or numeric index
 */
export function getMission(idOrNumber: string | number): MissionDefinition | undefined {
  const key = String(idOrNumber).trim();
  return missions[key] || missions[`mission-${key}`] || missions[`mission${key}`];
}

/**
 * Resolve initial mission based on URL params (?mission=X), environment variable, or default (mission 3)
 */
export function resolveInitialMission(): MissionDefinition {
  if (typeof window !== 'undefined' && window.location) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const missionParam = urlParams.get('mission');
      if (missionParam) {
        const found = getMission(missionParam);
        if (found) {
          console.log(`[MissionEngine] Loaded mission from URL param (?mission=${missionParam}):`, found.mission.title);
          return found;
        }
        console.warn(`[MissionEngine] Mission "${missionParam}" not found in registry. Falling back to default.`);
      }
    } catch (e) {
      console.warn('[MissionEngine] Error parsing mission from URL:', e);
    }
  }

  // 2. Check build-time injected environment variable (when packaged for specific SCORM module)
  try {
    const buildMissionId = (import.meta as any)?.env?.VITE_MISSION_ID;
    if (buildMissionId) {
      const found = getMission(buildMissionId);
      if (found) {
        console.log(`[MissionEngine] Loaded mission from build-time VITE_MISSION_ID (${buildMissionId}):`, found.mission.title);
        return found;
      }
    }
  } catch (e) {
    // Ignore in non-vite / test environments
  }

  // 3. Fallback to mission 3 (guarantees test suite compatibility)
  return mission3Data as unknown as MissionDefinition;
}
