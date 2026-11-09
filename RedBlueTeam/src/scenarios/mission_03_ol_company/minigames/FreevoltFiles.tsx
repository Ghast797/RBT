// Ekran „pliki FREEVOLT” (RatSessionApp, ekran 3): okno folderu na pulpicie ofiary i panel „PULPIT HAKERA”.
// Gracz przeciąga pliki hakiem `usePointerDrag` (albo klika plik). Postęp kopiowania liczy ratLogic.ts.

import React from 'react';
import { CheckCircle2, FileSpreadsheet, FileText, Folder, Monitor } from 'lucide-react';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { isCopied, isCopying, type CopyProgress } from './ratLogic';
import type { FreevoltFile, RatSessionConfig } from './types';

const ZONE_ID = 'hacker_desktop';
const ORANGE = '#fb923c';

const FileIcon: React.FC<{ kind: FreevoltFile['kind']; size?: number }> = ({ kind, size = 22 }) =>
  kind === 'xlsx' ? (
    <FileSpreadsheet size={size} className="text-green-400 shrink-0" />
  ) : (
    <FileText size={size} className="text-red-400 shrink-0" />
  );

export const FreevoltFiles: React.FC<{
  accent: string;
  files: RatSessionConfig['files'];
  progress: CopyProgress;
  /** Plik upuszczony w strefie „nasz pulpit” albo kliknięty. */
  onCopy: (id: string) => void;
}> = ({ accent, files, progress, onCopy }) => {
  const drag = usePointerDrag<string>({
    onDrop: ({ itemId }) => onCopy(itemId),
    onTap: (id) => onCopy(id),
    canDrag: (id) => !(id in progress)
  });
  const dragged = files.items.find((f) => f.id === drag.dragging?.itemId);
  const copiedCount = files.items.filter((f) => isCopied(progress, f.id)).length;
  const over = drag.isOver(ZONE_ID);
  const target = drag.isDropTarget(ZONE_ID);

  return (
    <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
      {/* Pulpit ofiary: okno folderu */}
      <div className="min-h-0 flex flex-col rounded-lg border border-gray-700 bg-[#0d1b2a] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#14263a] border-b border-gray-700 shrink-0">
          <Folder size={16} style={{ color: ORANGE }} />
          <span className="text-xs font-bold tracking-widest text-white">{files.folderTitle}</span>
        </div>
        <div className="flex-1 min-h-0 p-3 space-y-2">
          {files.items.map((f) => {
            const done = isCopied(progress, f.id);
            const busy = isCopying(progress, f.id);
            const locked = done || busy;
            const dragProps = drag.getDragProps(f.id);
            return (
              <div
                key={f.id}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-disabled={locked}
                onKeyDown={(e) => {
                  // Obsługa z klawiatury jak w //DYSK E: Enter (albo spacja) przenosi plik na pulpit hakera.
                  if (!locked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onCopy(f.id);
                  }
                }}
                {...dragProps}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  locked
                    ? 'border-gray-700 bg-black/30'
                    : 'border-gray-600 bg-[#10243a] hover:border-white/60 cursor-grab active:cursor-grabbing'
                } ${drag.draggedId === f.id ? 'opacity-40' : ''}`}
              >
                <FileIcon kind={f.kind} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold font-mono truncate ${locked ? 'text-gray-500' : 'text-white'}`}>{f.name}</div>
                  {busy && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded bg-black/60 overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${progress[f.id]}%`, backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                        />
                      </div>
                      <span className="text-xs font-mono shrink-0" style={{ color: accent }}>
                        {files.copyingLabel} {progress[f.id]}%
                      </span>
                    </div>
                  )}
                </div>
                {done && <CheckCircle2 size={18} className="text-green-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pulpit hakera: strefa upuszczania */}
      <div
        ref={drag.zoneRef(ZONE_ID)}
        className="min-h-0 flex flex-col rounded-lg border-2 border-dashed transition-all bg-black/30"
        style={{
          borderColor: over ? accent : target ? `${accent}aa` : `${accent}55`,
          backgroundColor: over ? `${accent}22` : target ? `${accent}12` : undefined,
          boxShadow: over ? `0 0 20px ${accent}55` : undefined
        }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: `${accent}44` }}>
          <div className="flex items-center gap-2">
            <Monitor size={16} style={{ color: accent }} />
            <span className="text-xs font-black tracking-widest" style={{ color: accent }}>
              {files.hackerDesktopLabel}
            </span>
          </div>
          <span className="text-xs font-mono font-black" style={{ color: accent }}>
            {copiedCount} / {files.items.length}
          </span>
        </div>
        <div className="flex-1 min-h-0 p-3 grid grid-cols-2 gap-2 content-start">
          {files.items.map((f) =>
            f.id in progress ? (
              <div
                key={f.id}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border text-center animate-in fade-in zoom-in-95 duration-200"
                style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
              >
                <FileIcon kind={f.kind} size={28} />
                <span className="text-xs font-mono text-white break-all leading-tight">{f.name}</span>
                <span className="text-xs font-mono" style={{ color: isCopied(progress, f.id) ? '#4ade80' : accent }}>
                  {`${progress[f.id]}%`}
                </span>
              </div>
            ) : (
              <div key={f.id} className="h-[5.25rem] rounded-lg border border-dashed border-gray-700/70" />
            )
          )}
        </div>
      </div>

      <DragGhost dragging={drag.dragging}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-[#07131a] font-mono text-xs font-bold text-white shadow-xl"
          style={{ borderColor: accent }}
        >
          {dragged && <FileIcon kind={dragged.kind} size={16} />}
          {dragged?.name}
        </div>
      </DragGhost>
    </div>
  );
};
