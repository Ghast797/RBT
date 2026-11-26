import type { MissionMeta } from '../types/mission';

/** Domyślne progi podpowiedzi po bezczynności (misja 1 = samouczek, najbardziej pomocna). */
export const DEFAULT_IDLE_HINTS = { t1Ms: 20_000, t2Ms: 45_000 } as const;

export interface IdleHintTimings {
  t1Ms: number;
  /** `null` — brak podpowiedzi tekstowej T2 (tylko subtelna T1). */
  t2Ms: number | null;
}

/** Progi dla misji; `null` = podpowiedzi po bezczynności wyłączone. */
export function resolveIdleHints(meta: Pick<MissionMeta, 'idleHints'> | undefined): IdleHintTimings | null {
  const cfg = meta?.idleHints;
  if (cfg === false) return null;
  const t1Ms = cfg?.t1Ms ?? DEFAULT_IDLE_HINTS.t1Ms;
  const t2Ms = cfg && 't2Ms' in cfg ? (cfg.t2Ms ?? null) : DEFAULT_IDLE_HINTS.t2Ms;
  return { t1Ms, t2Ms };
}
