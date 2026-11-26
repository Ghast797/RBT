import { useEffect, useState } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { resolveIdleHints } from '../core/idleHints';

/** 0 = brak podpowiedzi, 1 = T1 (subtelna), 2 = T2 (wyraźna). */
export type IdleHintLevel = 0 | 1 | 2;

/**
 * Wspólny licznik bezczynności gracza. Zeruje go aktywność (klik, klawisz, kółko, dotyk)
 * oraz postęp gry (zmiana aplikacji, etapu, decyzji, wiadomość czatu, odblokowanie).
 * Nie działa podczas intro/BIOS, okien modalnych, przeskoku czasu ani rozmowy mostkującej
 * odgrywanej automatycznie (czekanie na wybór gracza w mostku liczy się jako bezczynność).
 */
export function useIdleHint(): IdleHintLevel {
  const mission = useMissionStore((s) => s.activeMission.mission);
  const blocked = useMissionStore(
    (s) =>
      s.bootStage !== 'desktop' ||
      s.isDetectedModalOpen ||
      s.isRetryModalOpen ||
      s.timeJump !== null ||
      // Mostek gra sam; gdy czeka na odpowiedź gracza (beat z wyborem), bezczynność liczy się normalnie.
      (s.pendingBridge !== null && s.chatAvailableChoices.length === 0) ||
      s.isByteMasterTyping
  );
  const progressKey = useMissionStore((s) =>
    [
      s.activeApp,
      s.completedStages.length,
      s.chatMessages.length,
      s.chatAvailableChoices.length,
      s.unlockedIcons.length,
      s.highlightedTileId,
      s.incomingCall?.appId,
      Object.keys(s.decisionTiers ?? {}).length
    ].join('|')
  );
  const [level, setLevel] = useState<IdleHintLevel>(0);
  const timings = resolveIdleHints(mission);
  const t1Ms = timings?.t1Ms;
  const t2Ms = timings?.t2Ms ?? null;

  useEffect(() => {
    setLevel(0);
    if (blocked || t1Ms === undefined) return;
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      clearTimeout(t1);
      clearTimeout(t2);
      setLevel(0);
      t1 = setTimeout(() => setLevel(1), t1Ms);
      if (t2Ms !== null) t2 = setTimeout(() => setLevel(2), t2Ms);
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, arm, true));
    arm();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      events.forEach((e) => window.removeEventListener(e, arm, true));
    };
  }, [blocked, progressKey, t1Ms, t2Ms]);

  return level;
}
