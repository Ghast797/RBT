import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { sounds } from '../../../engine/audio/soundEffects';
import type { ChoiceOption } from '../../../engine/types/mission';

/**
 * Wspólne elementy interfejsu minigier Misji 2 (wzorzec: minigry Misji 1, np. EmailSenderApp).
 * Wygląd jak w M1: przycisk zatwierdzenia w kolorze akcentu, panel prawego monitora i lista wyborów
 * w `ChoiceZone`. Interfejs nie ujawnia oceny wyboru.
 */

/** Przycisk „dalej/zatwierdź” (jak `confirmButton` w EmailSenderApp). */
export const ConfirmButton: React.FC<{
  accent: string;
  label: string;
  enabled?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}> = ({ accent, label, enabled = true, onClick, icon, className = 'w-full' }) => (
  <button
    onClick={onClick}
    disabled={!enabled}
    className={`${className} shrink-0 px-4 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95`}
    style={{
      backgroundColor: accent,
      color: '#05090f',
      boxShadow: enabled ? `0 0 15px ${accent}66` : undefined
    }}
  >
    <span>{label}</span>
    {icon ?? <ArrowRight size={15} />}
  </button>
);

/** Panel prawego monitora (jak `sidePanel` w EmailSenderApp): nagłówek, przewijalna treść, stopka. */
export const SidePanel: React.FC<{
  accent: string;
  heading: string;
  sub?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ accent, heading, sub, footer, children }) => (
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

/** Lista opcji w ramce wyboru (kafelki z rogowym znacznikiem, jak w M1). */
export const OptionCards: React.FC<{
  accent: string;
  options: ChoiceOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
  mono?: boolean;
}> = ({ accent, options, selectedId, onSelect, label = 'WYBIERZ JEDNO', mono = false }) => (
  <ChoiceZone accent={accent} label={label}>
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <ChoiceTile
          key={opt.id}
          accent={accent}
          state={selectedId === opt.id ? 'selected' : 'idle'}
          markerPosition="corner"
          onClick={() => {
            sounds.playClick();
            onSelect(opt.id);
          }}
          className="p-3.5"
        >
          <div className="space-y-2 pr-7">
            <h3 className={`text-xs font-bold text-white leading-snug ${mono ? 'font-mono break-all' : ''}`}>
              {opt.label}
            </h3>
            {opt.desc && <p className="text-[0.6875rem] text-gray-300 leading-relaxed">{opt.desc}</p>}
            {opt.tags && opt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {opt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </ChoiceTile>
      ))}
    </div>
  </ChoiceZone>
);

/** Karta informacyjna (bez przerywanej ramki — to nie jest wybór). */
export const InfoCard: React.FC<{ accent: string; children: React.ReactNode; className?: string }> = ({
  accent,
  children,
  className = ''
}) => (
  <div
    className={`p-5 rounded-xl border space-y-3 ${className}`}
    style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
  >
    {children}
  </div>
);
