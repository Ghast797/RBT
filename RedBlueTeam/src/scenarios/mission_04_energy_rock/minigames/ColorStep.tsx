// Krok 3 //KREATORA: kolor okna (D4). Trzy karty z kolorem i podgląd makiety komunikatu w wybranym kolorze.
// Interfejs nie ocenia wyboru przed zatwierdzeniem.

import React from 'react';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { useShuffled } from '../../../engine/core/shuffle';
import { MentorRejectNotice, isRejected, useRejectedAmong } from '../../../engine/components/MentorRejectNotice';
import type { ColorConfig, NoteConfig } from './types';
import type { NoteFill } from './ransomLogic';
import { NoteMockup } from './NoteStep';

export const ColorStep: React.FC<{
  config: ColorConfig;
  note: NoteConfig;
  fill: NoteFill;
  accent: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  locked: boolean;
  onConfirm: () => void;
}> = ({ config, note, fill, accent, selectedId, onSelect, locked, onConfirm }) => {
  const options = useShuffled(config.options);
  // B2: opcje odrzucone przez mentora są zablokowane, nad nimi widać jego kwestię.
  const rejected = useRejectedAmong(config.decisionNum, config.options);
  const selected = config.options.find((o) => o.id === selectedId);
  return (
    <>
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.3fr] gap-4">
        <div className="min-h-0 flex flex-col justify-center gap-3">
          <MentorRejectNotice attempts={rejected} />
          {options.map((o) => {
            const active = o.id === selectedId;
            return (
              <button
                key={o.id}
                type="button"
                disabled={locked || isRejected(rejected, o.id)}
                onClick={() => onSelect(o.id)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 bg-[#0b1724] cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ borderColor: isRejected(rejected, o.id) ? '#ff3366' : active ? accent : `${accent}55`, opacity: isRejected(rejected, o.id) ? 0.45 : undefined, boxShadow: active ? `0 0 0 1px ${accent}, 0 0 18px ${accent}55` : undefined }}
              >
                <span className="w-12 h-12 rounded-lg border border-white/30 shrink-0" style={{ backgroundColor: o.swatch }} />
                <span className="text-sm font-black tracking-widest text-white">{o.label}</span>
              </button>
            );
          })}
        </div>
        <div className="min-h-0 flex flex-col justify-center">
          <NoteMockup config={note} fill={fill} color={selected?.swatch ?? '#4b5563'} />
        </div>
      </div>
      <ConfirmButton accent={accent} label={config.confirmLabel} enabled={!!selected && !locked} onClick={onConfirm} />
    </>
  );
};
