// Tryb deweloperski: `?dev=1` (np. `/?mission=1&dev=1`), tylko w `npm run dev` — w paczce SCORM ignorowany.
// Pomija intro i od razu odblokowuje wszystkie kafelki misji, bez czekania na rozmowy z BYTE_MASTEREM.
// Kliknięcie kafelka otwiera dany etap od razu; jego ukończenie działa jak w grze (mostek, odblokowania).

import { useMissionStore } from '../store/useMissionStore';

export const isDevMode =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('dev') === '1';

export const enableDevMode = () => {
  const store = useMissionStore;
  if (store.getState().bootStage !== 'desktop') store.getState().finishBiosBoot();

  const { activeMission, unlockedIcons } = store.getState();
  const unlocked = new Set(unlockedIcons);
  activeMission.desktopApps.forEach((app) => unlocked.add(app.requiredUnlockId || app.id));

  store.setState({
    unlockedIcons: [...unlocked],
    pendingBridge: null,
    chatAvailableChoices: [],
    isByteMasterTyping: false,
    highlightedTileId: null
  });
};
