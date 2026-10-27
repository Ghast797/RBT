import React, { useEffect } from 'react';
import { Desktop } from './engine/components/Desktop';
import { MissionSelect } from './engine/components/MissionSelect';
import { useMissionStore } from './engine/store/useMissionStore';
import { shouldShowMissionSelect } from './engine/registry/missionRegistry';
import { isDevMode, enableDevMode } from './engine/core/devMode';

const showMissionSelect = shouldShowMissionSelect();

/**
 * Tryb deweloperski: `?skipIntro=1` (np. `/?mission=1&skipIntro=1`) pomija telefon, dialog intra i BIOS
 * i od razu włącza pulpit HACKERS.OS. W buildzie produkcyjnym (paczka SCORM) parametr jest ignorowany.
 * `?dev=1` dodatkowo odblokowuje od razu wszystkie kafelki misji (engine/core/devMode.ts).
 */
if (
  import.meta.env.DEV &&
  !showMissionSelect &&
  new URLSearchParams(window.location.search).get('skipIntro') === '1' &&
  useMissionStore.getState().bootStage === 'incoming_call'
) {
  useMissionStore.getState().finishBiosBoot();
}

if (isDevMode && !showMissionSelect) {
  enableDevMode();
}

export const App: React.FC = () => {
  const activeMission = useMissionStore((s) => s.activeMission);

  useEffect(() => {
    if (showMissionSelect) {
      document.title = 'Wybór misji (HACKERS.OS)';
    } else if (activeMission?.mission?.title) {
      document.title = `${activeMission.mission.title} (HACKERS.OS)`;
    }
  }, [activeMission]);

  if (showMissionSelect) return <MissionSelect />;
  return <Desktop />;
};

export default App;
