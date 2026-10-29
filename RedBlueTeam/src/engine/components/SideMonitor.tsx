import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Prawy monitor HACKERS.OS: domyślnie czat z BYTE_MASTEREM, ale aplikacja z notatnikiem
 * może go przejąć na czas swojej pracy. Monitor jest wtedy ZABLOKOWANY na notatniku —
 * gracz nie przełącza się między czatem a notatnikiem (decyzja projektowa). Po zamknięciu
 * aplikacji (zwykle automatycznie po ukończeniu etapu) monitor wraca do czatu na mostek.
 * Zob. docs/scenario-engine.md, sekcja 3 („Nagłówek aplikacji / Prawy monitor”).
 */

// --- Czy ta aplikacja jest teraz aktywna (widoczna na pulpicie, nie tylko zamontowana) ---
const ActiveAppContext = createContext(false);
export const ActiveAppProvider = ActiveAppContext.Provider;
export const useIsActiveApp = (): boolean => useContext(ActiveAppContext);

// --- Slot prawego monitora ---
interface SideMonitorCtxValue {
  targetEl: HTMLElement | null;
  setTargetEl: (el: HTMLElement | null) => void;
  /** true, gdy jakaś aktywna aplikacja zajmuje prawy monitor notatnikiem. */
  active: boolean;
  /** Zgłasza zajęcie slotu; zwraca funkcję zwalniającą. */
  register: () => () => void;
}

const SideMonitorCtx = createContext<SideMonitorCtxValue | null>(null);

export const SideMonitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const [count, setCount] = useState(0);

  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => Math.max(0, c - 1));
  }, []);

  return (
    <SideMonitorCtx.Provider value={{ targetEl, setTargetEl, active: count > 0, register }}>
      {children}
    </SideMonitorCtx.Provider>
  );
};

/** Czy prawy monitor jest teraz zajęty notatnikiem (czat ma być schowany). */
export const useSideMonitorActive = (): boolean => useContext(SideMonitorCtx)?.active ?? false;

/**
 * Cel portalu w prawym monitorze. Jest zawsze zamontowany (żeby portal miał dokąd trafić),
 * a tylko pokazywany, gdy slot jest aktywny. Poza providerem (np. w testach) nie renderuje nic.
 */
export const SideMonitorSlot: React.FC = () => {
  const ctx = useContext(SideMonitorCtx);
  if (!ctx) return null;
  return (
    <div
      ref={ctx.setTargetEl}
      className={ctx.active ? 'flex-1 flex flex-col min-h-0' : 'hidden'}
      aria-hidden={!ctx.active}
    />
  );
};

/**
 * Treść notatnika/panelu przeniesiona na prawy monitor. Aplikacja renderuje ją u siebie
 * (zwykły stan Reacta napędza notatnik), a trafia ona na prawy monitor tylko wtedy, gdy ta
 * aplikacja jest aktywna. Gdy aplikacja jest schowana albo zamknięta, monitor wraca do czatu.
 * Poza providerem (np. render w izolacji w testach) renderuje treść w miejscu, bez portalu.
 */
export const SideMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isActive = useIsActiveApp();
  const ctx = useContext(SideMonitorCtx);
  const register = ctx?.register;

  useEffect(() => {
    if (!isActive || !register) return;
    return register();
  }, [isActive, register]);

  if (!ctx) return <>{children}</>;
  if (!isActive || !ctx.targetEl) return null;
  return createPortal(children, ctx.targetEl);
};
