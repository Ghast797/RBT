// Wspólne elementy UI cienkich stubów minigier M3 (wzorzec B, faza szkieletu).
// Pełne minigry przeniosą kolejni agenci wg docs/migration-spec.md — wtedy te
// stuby zostaną zastąpione bogatszym UI (AppHeader / ChoiceZone / SideMonitor).

import React from 'react';
import { X } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { ChoiceOption } from '../../../engine/types/mission';

/** Nagłówek aplikacji z pasuem ZADANIE i krzyżykiem powrotu na pulpit. */
export const StubHeader: React.FC<{ title: string; task: string }> = ({ title, task }) => {
  const closeApp = useMissionStore((s) => s.closeApp);
  return (
    <div className="space-y-2 border-b border-[#00ff66]/30 pb-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm tracking-wider text-[#00ff66]">{title}</span>
        <button
          onClick={closeApp}
          className="p-1 hover:bg-[#ff3366]/20 text-[#00ff66] hover:text-[#ff3366] rounded transition-colors"
          title="Zamknij i wróć do pulpitu"
        >
          <X size={16} />
        </button>
      </div>
      <div className="text-[0.6875rem] uppercase tracking-wider text-[#00ff66]/70">
        <span className="font-black">ZADANIE:</span> {task}
      </div>
    </div>
  );
};

/** Lista wyboru 1 z N (stub). Pełna wersja: karty/wiersze wg mission-standard.md. */
export const StubChoiceList: React.FC<{
  options: ChoiceOption[];
  selectedId?: string | null;
  disabled?: boolean;
  onPick: (option: ChoiceOption) => void;
}> = ({ options, selectedId, disabled, onPick }) => (
  <div className="space-y-2">
    {options.map((o) => (
      <button
        key={o.id}
        data-option-id={o.id}
        disabled={disabled}
        onClick={() => onPick(o)}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all disabled:opacity-40 ${
          selectedId === o.id
            ? 'bg-[#00ff66]/15 border-[#00ff66]'
            : 'bg-[#081017] border-[#00ff66]/30 hover:border-[#00ff66]/70 hover:bg-[#00ff66]/5'
        }`}
      >
        <div className="font-bold text-xs text-white leading-snug">{o.label}</div>
        {o.desc && <div className="text-[0.6875rem] text-gray-300 mt-1 leading-relaxed">{o.desc}</div>}
      </button>
    ))}
  </div>
);

/** Przycisk akcji w kolorze akcentu (dalej / kompiluj / zatwierdź). */
export const StubActionButton: React.FC<{ label: string; disabled?: boolean; onClick: () => void }> = ({
  label,
  disabled,
  onClick
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 disabled:opacity-40 transition-all"
  >
    {label}
  </button>
);

/** Ramka stuba. */
export const StubShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col h-full bg-[#050b10] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl p-4 space-y-4">
    {children}
  </div>
);

/** Baner informacyjny (flavor / kontekst OSINT). */
export const StubNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-3 bg-[#081017] border border-[#00ff66]/20 rounded-lg text-[0.6875rem] text-gray-300 leading-relaxed">
    {children}
  </div>
);
