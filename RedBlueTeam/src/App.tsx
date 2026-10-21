import React, { useEffect } from 'react';
import { Desktop } from './engine/components/Desktop';
import { MissionSelect } from './engine/components/MissionSelect';
import { useMissionStore } from './engine/store/useMissionStore';
import { shouldShowMissionSelect } from './engine/registry/missionRegistry';

const showMissionSelect = shouldShowMissionSelect();

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
