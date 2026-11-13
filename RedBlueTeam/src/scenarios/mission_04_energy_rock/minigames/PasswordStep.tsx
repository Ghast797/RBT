// Krok 1 //KREATORA: hasło (D2). Suwak długości, ramka cech (przeciąganie kafelków z zasobnika i z powrotem, klik przełącza),
// podgląd hasła bez wskaźnika siły. Ocena dopiero po zatwierdzeniu (w RansomBuilderApp).

import React, { useMemo } from 'react';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { useShuffled } from '../../../engine/core/shuffle';
import type { PasswordConfig } from './types';
import { randomPreview } from './ransomLogic';

const FRAME = 'frame';
const TRAY = 'tray';

export const PasswordStep: React.FC<{
  config: PasswordConfig;
  accent: string;
  length: number;
  onLength: (n: number) => void;
  selected: string[];
  onSelected: (ids: string[]) => void;
  locked: boolean;
  /** Komunikat mentora (B2) nad ustawieniami. */
  notice?: React.ReactNode;
  /** Zatwierdzenie zablokowane (ta konfiguracja została już odrzucona przez mentora). */
  confirmBlocked?: boolean;
  onConfirm: () => void;
}> = ({ config, accent, length, onLength, selected, onSelected, locked, notice, confirmBlocked = false, onConfirm }) => {
  const tiles = useShuffled(config.tiles);

  const move = (id: string, toFrame: boolean) => {
    if (locked) return;
    if (toFrame === selected.includes(id)) return;
    sounds.playClick();
    onSelected(toFrame ? [...selected, id] : selected.filter((s) => s !== id));
  };

  const drag = usePointerDrag<string>({
    onDrop: ({ itemId, zoneId }) => move(itemId, zoneId === FRAME),
    onTap: (itemId) => move(itemId, !selected.includes(itemId)),
    canDrag: () => !locked
  });

  // Podgląd losuje się przy zmianie zestawu kafelków lub długości.
  const preview = useMemo(
    () => randomPreview(config.tiles, selected, length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, length]
  );

  const tileEl = (id: string) => {
    const t = config.tiles.find((x) => x.id === id)!;
    const props = drag.getDragProps(id);
    return (
      <div
        key={id}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') move(id, !selected.includes(id));
        }}
        {...props}
        className={`px-3 py-2 rounded-lg border-2 bg-[#0b1724] text-xs font-bold text-white cursor-grab transition-all hover:-translate-y-0.5 ${
          drag.draggedId === id ? 'opacity-40' : ''
        }`}
        style={{ ...props.style, borderColor: `${accent}88` }}
      >
        {t.label}
      </div>
    );
  };

  const dragged = config.tiles.find((t) => t.id === drag.draggedId);
  const tray = tiles.filter((t) => !selected.includes(t.id));
  const inFrame = tiles.filter((t) => selected.includes(t.id));

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {notice}
        <div className="text-sm font-black tracking-widest text-white">{config.heading}</div>
        <div className="flex items-center gap-4 rounded-xl border bg-[#08101a] px-4 py-2.5" style={{ borderColor: `${accent}55` }}>
          <span className="text-xs font-black tracking-widest shrink-0" style={{ color: accent }}>
            {config.lengthLabel}
          </span>
          <input
            type="range"
            min={config.minLength}
            max={config.maxLength}
            step={1}
            value={length}
            disabled={locked}
            onChange={(e) => onLength(Number(e.target.value))}
            className="flex-1 cursor-pointer"
            style={{ accentColor: accent }}
            aria-label={config.lengthLabel}
          />
          <span className="text-lg font-black text-white w-8 text-right">{length}</span>
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
          <div
            ref={drag.zoneRef(TRAY)}
            className="min-h-0 rounded-xl border bg-[#08101a] p-3 flex flex-col gap-2"
            style={{ borderColor: drag.isOver(TRAY) ? accent : `${accent}44` }}
          >
            {tray.map((t) => tileEl(t.id))}
          </div>
          <div
            ref={drag.zoneRef(FRAME)}
            className="min-h-0 rounded-xl border-2 border-dashed p-3 flex flex-col gap-2 transition-colors"
            style={{
              borderColor: drag.isOver(FRAME) || drag.isDropTarget(FRAME) ? accent : `${accent}66`,
              backgroundColor: drag.isOver(FRAME) ? `${accent}22` : `${accent}0a`
            }}
          >
            <div className="text-xs font-black tracking-widest" style={{ color: accent }}>
              {config.frameLabel}
            </div>
            {inFrame.map((t) => tileEl(t.id))}
          </div>
        </div>
        <div className="rounded-xl border bg-black/50 px-4 py-2.5 flex items-center gap-3" style={{ borderColor: `${accent}55` }}>
          <span className="text-xs font-black tracking-widest shrink-0" style={{ color: accent }}>
            {config.previewLabel}
          </span>
          <span className="font-mono text-base text-white break-all whitespace-pre">{preview || ' '}</span>
        </div>
      </div>
      <ConfirmButton accent={accent} label={config.confirmLabel} enabled={selected.length >= 1 && !locked && !confirmBlocked} onClick={onConfirm} />
      <DragGhost dragging={drag.dragging}>{dragged?.label}</DragGhost>
    </>
  );
};
