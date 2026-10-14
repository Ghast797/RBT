import React, { useEffect } from 'react';
import { Desktop } from './engine/components/Desktop';
import { useMissionStore } from './engine/store/useMissionStore';

export const App: React.FC = () => {
  const activeMission = useMissionStore((s) => s.activeMission);

  useEffect(() => {
    if (activeMission?.mission?.title) {
      document.title = `${activeMission.mission.title} (HACKERS.OS)`;
    }
  }, [activeMission]);

  return <Desktop />;
};

export default App;
