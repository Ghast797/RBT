import React from 'react';

interface SidePanelProps {
  /** Kolor akcentu aplikacji (hex). */
  accent: string;
  heading: string;
  sub?: React.ReactNode;
  /** Stopka pod przewijalną treścią (zwykle `ConfirmButton`). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Panel prawego monitora aplikacji (wzorzec Misji 1): nagłówek z opisem, przewijalna treść i stopka.
 * Używany wewnątrz `SideMonitor`. Zob. docs/scenario-engine.md, sekcja 3.
 */
export const SidePanel: React.FC<SidePanelProps> = ({ accent, heading, sub, footer, children }) => (
  <div
    className="flex flex-col h-full bg-[#060c14] border-2 rounded-xl p-4 space-y-3 font-mono text-gray-200 select-none"
    style={{ borderColor: `${accent}66` }}
  >
    <div className="border-b pb-2 shrink-0 space-y-1" style={{ borderColor: `${accent}40` }}>
      <span className="text-xs font-black tracking-widest block" style={{ color: accent }}>
        {heading}
      </span>
      {sub && <p className="text-[0.6875rem] text-gray-300 leading-snug">{sub}</p>}
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-3">{children}</div>
    {footer}
  </div>
);
