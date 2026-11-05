import React from 'react';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { sounds } from '../../../engine/audio/soundEffects';
import type { ChoiceOption } from '../../../engine/types/mission';

/**
 * Wspólne elementy interfejsu minigier Misji 2 (wzorzec: minigry Misji 1, np. EmailSenderApp).
 * Przycisk zatwierdzenia (`ConfirmButton`) i panel prawego monitora (`SidePanel`) są wspólne z M1
 * i mieszkają w `engine/components/`. Tu zostają elementy używane tylko w M2. Interfejs nie ujawnia
 * oceny wyboru.
 */

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
