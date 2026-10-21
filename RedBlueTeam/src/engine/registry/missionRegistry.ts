import type { MissionDefinition } from '../types/mission';
import {
  isIsolated,
  activeMission,
  activeMissionId,
  allMissions,
  missionList
} from 'virtual:active-scenario';

// Global Missions Map (populated from virtual active scenario)
export const missions: Record<string, MissionDefinition> = { ...allMissions };

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
  return Object.values(missions);
}

/**
 * Get mission by ID or numeric index
 */
export function getMission(idOrNumber: string | number): MissionDefinition | undefined {
  const key = String(idOrNumber).trim();
  if (missions[key]) return missions[key];
  if (missions[`mission-${key}`]) return missions[`mission-${key}`];
  if (missions[`mission${key}`]) return missions[`mission${key}`];

  const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [mKey, mVal] of Object.entries(missions)) {
    const cleanMKey = mKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanMKey === cleanKey) return mVal;
    if (mVal?.mission?.id) {
      const cleanId = mVal.mission.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanId === cleanKey || cleanId.includes(cleanKey)) return mVal;
    }
  }
  return undefined;
}

/**
 * Misje do ekranu wyboru (tylko tryb dev — paczka SCORM zawiera jedną misję).
 */
export function getMissionList(): Array<{ num: string; id: string; definition: MissionDefinition }> {
  return missionList;
}

/**
 * Ekran wyboru misji pokazujemy tylko w trybie wielomisyjnym (dev) i tylko gdy
 * URL nie wskazuje istniejącej misji (?mission=X). Paczka SCORM jest izolowana
 * (VITE_MISSION_ID), więc zawsze ładuje swoją misję bezpośrednio.
 */
export function shouldShowMissionSelect(): boolean {
  if (isIsolated) return false;
  if (typeof window === 'undefined' || !window.location) return false;
  const missionParam = new URLSearchParams(window.location.search).get('mission');
  return !missionParam || !getMission(missionParam);
}

/**
 * Resolve initial mission based on isolated build, URL params (?mission=X), environment variable, or default (mission 3)
 */
export function resolveInitialMission(): MissionDefinition {
  // 1. In isolated single-mission build, always use activeMission directly
  if (isIsolated && activeMission) {
    console.log(`[MissionEngine] Loaded isolated scenario: ${activeMission.mission?.title || activeMissionId}`);
    return activeMission;
  }

  // 2. Check URL params (?mission=X)
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

  // 3. Check build-time injected environment variable
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

  // 4. Fallback (Mission 3 or first available mission)
  return missions['mission-3-ol-company'] || missions['3'] || Object.values(missions)[0];
}
