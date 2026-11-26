// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, render, act, cleanup } from '@testing-library/react';
import { useMissionStore, __setBridgeDelayForTests } from '../src/engine/store/useMissionStore';
import { useIdleHint } from '../src/engine/hooks/useIdleHint';
import { resolveIdleHints, DEFAULT_IDLE_HINTS } from '../src/engine/core/idleHints';
import { mission1Definition } from '../src/scenarios/mission_01_petrolog';
import { Desktop } from '../src/engine/components/Desktop';
import type { MissionDefinition } from '../src/engine/types/mission';

const withHints = (idleHints: unknown): MissionDefinition =>
  ({ ...mission1Definition, mission: { ...mission1Definition.mission, idleHints } }) as MissionDefinition;

const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

function startDesktop(def: MissionDefinition = mission1Definition) {
  useMissionStore.getState().loadMission(def);
  useMissionStore.getState().finishBiosBoot();
  // Rozmowa otwierająca (mostek) musi się wygrać do końca — w jej trakcie podpowiedzi są wstrzymane.
  act(() => { vi.advanceTimersByTime(120_000); });
}

describe('Silnik: podpowiedzi po bezczynności', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __setBridgeDelayForTests(0);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    __setBridgeDelayForTests(2000);
  });

  it('resolveIdleHints: domyślne, nadpisanie, wyłączenie T2 i całości', () => {
    expect(resolveIdleHints(undefined)).toEqual(DEFAULT_IDLE_HINTS);
    expect(resolveIdleHints({ idleHints: { t1Ms: 5, t2Ms: 9 } })).toEqual({ t1Ms: 5, t2Ms: 9 });
    expect(resolveIdleHints({ idleHints: { t2Ms: null } })).toEqual({ t1Ms: 20_000, t2Ms: null });
    expect(resolveIdleHints({ idleHints: false })).toBeNull();
  });

  it('T1 po 20 s, T2 po 45 s bezczynności (domyślnie)', () => {
    startDesktop();
    const { result } = renderHook(() => useIdleHint());
    expect(result.current).toBe(0);
    tick(19_000);
    expect(result.current).toBe(0);
    tick(1_500);
    expect(result.current).toBe(1);
    tick(25_000);
    expect(result.current).toBe(2);
  });

  it('aktywność gracza zeruje licznik', () => {
    startDesktop();
    const { result } = renderHook(() => useIdleHint());
    tick(30_000);
    expect(result.current).toBe(1);
    act(() => { window.dispatchEvent(new Event('pointerdown')); });
    expect(result.current).toBe(0);
    tick(19_000);
    expect(result.current).toBe(0);
    tick(2_000);
    expect(result.current).toBe(1);
  });

  it('postęp gry (zmiana aplikacji) zeruje licznik', () => {
    startDesktop();
    const { result } = renderHook(() => useIdleHint());
    tick(50_000);
    expect(result.current).toBe(2);
    act(() => { useMissionStore.getState().openApp('app_social_intel'); });
    expect(result.current).toBe(0);
  });

  it('nie odpala podczas modala wykrycia ani powtórki', () => {
    startDesktop();
    const { result } = renderHook(() => useIdleHint());
    act(() => { useMissionStore.setState({ isRetryModalOpen: true }); });
    tick(120_000);
    expect(result.current).toBe(0);
    act(() => { useMissionStore.setState({ isRetryModalOpen: false, isDetectedModalOpen: true }); });
    tick(120_000);
    expect(result.current).toBe(0);
  });

  it('nie odpala w trakcie rozmowy mostkującej i przeskoku czasu', () => {
    startDesktop();
    const { result } = renderHook(() => useIdleHint());
    act(() => {
      useMissionStore.setState({ chatAvailableChoices: [], pendingBridge: { beats: [], index: 0, unlock: {} } });
    });
    tick(120_000);
    expect(result.current).toBe(0);
    // Mostek czekający na odpowiedź gracza to bezczynność jak każda inna.
    act(() => {
      useMissionStore.setState({ chatAvailableChoices: [{ id: 'b', label: 'Dalej', bridgeBeat: true }] });
    });
    tick(50_000);
    expect(result.current).toBe(2);
    act(() => { useMissionStore.setState({ chatAvailableChoices: [] }); });
    act(() => { useMissionStore.setState({ pendingBridge: null, timeJump: { label: 'x' } }); });
    tick(120_000);
    expect(result.current).toBe(0);
  });

  it('nie odpala przed pulpitem (intro/BIOS)', () => {
    useMissionStore.getState().loadMission(mission1Definition);
    const { result } = renderHook(() => useIdleHint());
    tick(120_000);
    expect(result.current).toBe(0);
  });

  it('ustawienie misji: własne progi, brak T2, wyłączenie', () => {
    startDesktop(withHints({ t1Ms: 1000, t2Ms: 2000 }));
    const a = renderHook(() => useIdleHint());
    tick(2_100);
    expect(a.result.current).toBe(2);
    a.unmount();

    startDesktop(withHints({ t1Ms: 1000, t2Ms: null }));
    const b = renderHook(() => useIdleHint());
    tick(200_000);
    expect(b.result.current).toBe(1);
    b.unmount();

    startDesktop(withHints(false));
    const c = renderHook(() => useIdleHint());
    tick(200_000);
    expect(c.result.current).toBe(0);
  });

  it('Desktop: T1 pulsuje przycisk WSKAZÓWKA, T2 otwiera podpowiedź operacyjną', () => {
    startDesktop(withHints({ t1Ms: 1000, t2Ms: 3000 }));
    const { container, queryByText } = render(<Desktop />);
    expect(container.querySelector('button[data-idle-cue]')).toBeNull();
    expect(queryByText('PODPOWIEDŹ OPERACYJNA:')).toBeNull();
    tick(1_500);
    expect(container.querySelector('button[data-idle-cue="true"]')).not.toBeNull();
    expect(queryByText('PODPOWIEDŹ OPERACYJNA:')).toBeNull();
    tick(2_000);
    expect(queryByText('PODPOWIEDŹ OPERACYJNA:')).not.toBeNull();
  });
});
