// Krok 2 //KREATORA: komunikat dla ofiary (D3). Makieta okna z 6 slotami i zasobnik kafelków; kafelek wchodzi tylko
// do slotu swojego typu (zły slot: odbicie bez kary). `NoteMockup` służy też podglądowi koloru w kroku 3.

import React, { useRef, useState } from 'react';
import { Bitcoin, Lock, UserCircle } from 'lucide-react';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { useShuffled } from '../../../engine/core/shuffle';
import { MentorRejectNotice, isRejected, useRejectedAttempts } from '../../../engine/components/MentorRejectNotice';
import type { NoteConfig, NoteSlotId, NoteTile } from './types';
import { isNoteComplete, tileFitsSlot, type NoteFill } from './ransomLogic';

const tileContent = (t: NoteTile): React.ReactNode => {
  switch (t.slot) {
    case 'icon':
      return (
        <span className="flex items-center justify-center w-9 h-9 rounded bg-blue-600 text-white">
          <Lock size={20} />
        </span>
      );
    case 'amount':
      return (
        <span className="flex items-center gap-1.5">
          <Bitcoin size={16} className="text-amber-400 shrink-0" />
          {t.label}
        </span>
      );
    case 'contact':
      return (
        <span className="flex items-center gap-1.5">
          <UserCircle size={16} className="shrink-0" />
          {t.label}
        </span>
      );
    default:
      return t.label;
  }
};

/** Makieta okna komunikatu; `color` koloruje ramkę i nagłówek, `renderSlot` pozwala dodać strefy upuszczania. */
export const NoteMockup: React.FC<{
  config: NoteConfig;
  fill: NoteFill;
  color: string;
  renderSlot?: (slotId: NoteSlotId, label: string, content: React.ReactNode | null) => React.ReactNode;
}> = ({ config, fill, color, renderSlot }) => {
  const slotBody = (id: NoteSlotId, label: string) => {
    const tile = config.tiles.find((t) => t.id === fill[id]);
    const content = tile ? tileContent(tile) : null;
    if (renderSlot) return renderSlot(id, label, content);
    return (
      <div className="min-h-[2.25rem] flex items-center justify-center rounded border border-dashed border-gray-600 px-2 text-xs font-bold text-white text-center">
        {content ?? label}
      </div>
    );
  };
  const label = (id: NoteSlotId) => config.slots.find((s) => s.id === id)?.label ?? id;
  return (
    <div className="rounded-lg border-2 bg-[#0b1220] overflow-hidden" style={{ borderColor: color, boxShadow: `0 0 18px ${color}55` }}>
      <div className="h-3" style={{ backgroundColor: color }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-24 shrink-0">{slotBody('icon', label('icon'))}</div>
          <div className="flex-1 min-w-0">{slotBody('title', label('title'))}</div>
        </div>
        {slotBody('time', label('time'))}
        <div className="grid grid-cols-3 gap-2">
          {slotBody('amount', label('amount'))}
          {slotBody('address', label('address'))}
          {slotBody('contact', label('contact'))}
        </div>
      </div>
    </div>
  );
};

export const NoteStep: React.FC<{
  config: NoteConfig;
  accent: string;
  fill: NoteFill;
  onFill: (fill: NoteFill) => void;
  locked: boolean;
  onConfirm: () => void;
}> = ({ config, accent, fill, onFill, locked, onConfirm }) => {
  const tiles = useShuffled(config.tiles);
  // B2: kafelki odrzucone przez mentora są zablokowane (nie wchodzą do slotu), nad zasobnikiem widać jego kwestię.
  const rejected = useRejectedAttempts(config.decisionNum);
  const [bounce, setBounce] = useState<string | null>(null);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => {
    if (bounceTimer.current) clearTimeout(bounceTimer.current);
  }, []);

  const place = (tileId: string, slotId: string) => {
    if (locked) return;
    const tile = config.tiles.find((t) => t.id === tileId);
    if (!tile || isRejected(rejected, tile.id)) return;
    if (!tileFitsSlot(tile, slotId)) {
      sounds.playError();
      setBounce(slotId);
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
      bounceTimer.current = setTimeout(() => setBounce(null), 600);
      return;
    }
    sounds.playClick();
    onFill({ ...fill, [slotId]: tileId });
  };
  const unplace = (slotId: NoteSlotId) => {
    if (locked || !fill[slotId]) return;
    sounds.playClick();
    const next = { ...fill };
    delete next[slotId];
    onFill(next);
  };

  const placedIds = Object.values(fill);
  const tray = tiles.filter((t) => !placedIds.includes(t.id));
  const drag = usePointerDrag<string>({
    onDrop: ({ itemId, zoneId }) => place(itemId, zoneId),
    // klik: do slotu własnego typu
    onTap: (itemId) => {
      const t = config.tiles.find((x) => x.id === itemId);
      if (t) place(itemId, t.slot);
    },
    canDrag: (itemId) => !locked && !isRejected(rejected, itemId)
  });
  const dragged = config.tiles.find((t) => t.id === drag.draggedId);

  return (
    <>
      <MentorRejectNotice attempts={rejected} />
      <div className="flex-1 min-h-0 grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="min-h-0 flex flex-col justify-center">
          <NoteMockup
            config={config}
            fill={fill}
            color={accent}
            renderSlot={(id, label, content) => (
              <div
                ref={drag.zoneRef(id)}
                role="button"
                tabIndex={0}
                onClick={() => unplace(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') unplace(id);
                }}
                className={`min-h-[2.5rem] flex items-center justify-center rounded border-2 border-dashed px-2 py-1 text-xs font-bold text-center transition-colors ${
                  content ? 'text-white cursor-pointer' : 'text-gray-400'
                } ${bounce === id ? 'animate-pulse' : ''}`}
                style={{
                  borderColor: bounce === id ? '#ef4444' : drag.isOver(id) ? '#00ff66' : drag.isDropTarget(id) ? accent : `${accent}66`,
                  backgroundColor: bounce === id ? '#ef444422' : drag.isOver(id) ? '#00ff6622' : undefined
                }}
              >
                {content ?? label}
              </div>
            )}
          />
        </div>
        <div className="min-h-0 rounded-xl border bg-[#08101a] p-3 grid grid-cols-1 content-start gap-2 overflow-hidden" style={{ borderColor: `${accent}55` }}>
          {tray.map((t) => {
            const props = drag.getDragProps(t.id);
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') place(t.id, t.slot);
                }}
                {...props}
                className={`px-2.5 py-1.5 rounded-lg border-2 bg-[#0b1724] text-xs font-bold text-white transition-all ${
                  isRejected(rejected, t.id) ? 'opacity-40 line-through cursor-not-allowed' : 'cursor-grab hover:-translate-y-0.5'
                } ${drag.draggedId === t.id ? 'opacity-40' : ''}`}
                style={{ ...props.style, borderColor: isRejected(rejected, t.id) ? '#ff3366' : `${accent}88` }}
              >
                {tileContent(t)}
              </div>
            );
          })}
        </div>
      </div>
      <ConfirmButton accent={accent} label={config.confirmLabel} enabled={isNoteComplete(config, fill) && !locked} onClick={onConfirm} />
      <DragGhost dragging={drag.dragging}>{dragged ? tileContent(dragged) : null}</DragGhost>
    </>
  );
};
