// Ekran „eksfiltracja” (RansomC2App, ekran 3): chmura plików i pole „POBRANE PLIKI”. Plik przeciąga się do pola
// i z powrotem (hak `usePointerDrag`); klik przełącza. Bez rozmiarów i oznaczeń roli: interfejs nie ocenia wyboru.

import React from 'react';
import { Download, File as FileGeneric, FileImage, FileText, Folder } from 'lucide-react';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import type { ExfilFile } from './types';

const FIELD_ZONE = 'exfil_field';
const CLOUD_ZONE = 'exfil_cloud';

const extOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toUpperCase();

const FileIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 22 }) => {
  switch (extOf(name)) {
    case 'PDF':
      return <FileText size={size} className="text-red-400 shrink-0" />;
    case 'DOCX':
      return <FileText size={size} className="text-blue-400 shrink-0" />;
    case 'TXT':
      return <FileText size={size} className="text-gray-300 shrink-0" />;
    case 'JPG':
      return <FileImage size={size} className="text-yellow-400 shrink-0" />;
    case 'XCF':
      return <FileImage size={size} className="text-green-400 shrink-0" />;
    default:
      return <FileGeneric size={size} className="text-gray-400 shrink-0" />;
  }
};

export const ExfilFiles: React.FC<{
  accent: string;
  /** Pliki w kolejności wyświetlania (już potasowane). */
  files: ExfilFile[];
  selected: string[];
  fieldLabel: string;
  /** Licznik pola, np. „WYBRANO 2/3”. */
  counter: string;
  onToggle: (id: string) => void;
  onSet: (id: string, inField: boolean) => void;
}> = ({ accent, files, selected, fieldLabel, counter, onToggle, onSet }) => {
  const inField = new Set(selected);
  const drag = usePointerDrag<string>({
    onDrop: ({ itemId, zoneId }) => onSet(itemId, zoneId === FIELD_ZONE),
    onTap: (id) => onToggle(id)
  });
  const dragged = files.find((f) => f.id === drag.dragging?.itemId);
  const cloud = files.filter((f) => !inField.has(f.id));
  const field = files.filter((f) => inField.has(f.id));
  const fieldOver = drag.isOver(FIELD_ZONE);
  const fieldTarget = drag.isDropTarget(FIELD_ZONE);

  const chip = (f: ExfilFile) => (
    <div
      key={f.id}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(f.id);
        }
      }}
      {...drag.getDragProps(f.id)}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border border-gray-600 bg-[#10243a] hover:border-white/60 cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
        drag.draggedId === f.id ? 'opacity-40' : ''
      }`}
    >
      <FileIcon name={f.name} />
      <span className="text-xs font-bold font-mono text-white break-all leading-tight">{f.name}</span>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
      <div
        ref={drag.zoneRef(CLOUD_ZONE)}
        className="min-h-0 flex flex-col rounded-lg border border-gray-700 bg-[#0d1b2a] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-[#14263a] border-b border-gray-700 shrink-0">
          <Folder size={16} style={{ color: accent }} />
          <span className="text-xs font-bold tracking-widest text-white">SERWER</span>
        </div>
        <div className="flex-1 min-h-0 p-3 grid grid-cols-2 gap-2 content-start">{cloud.map(chip)}</div>
      </div>

      <div
        ref={drag.zoneRef(FIELD_ZONE)}
        className="min-h-0 flex flex-col rounded-lg border-2 border-dashed transition-all bg-black/30"
        style={{
          borderColor: fieldOver ? accent : fieldTarget ? `${accent}aa` : `${accent}55`,
          backgroundColor: fieldOver ? `${accent}22` : fieldTarget ? `${accent}12` : undefined,
          boxShadow: fieldOver ? `0 0 20px ${accent}55` : undefined
        }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: `${accent}44` }}>
          <div className="flex items-center gap-2">
            <Download size={16} style={{ color: accent }} />
            <span className="text-xs font-black tracking-widest" style={{ color: accent }}>
              {fieldLabel}
            </span>
          </div>
          <span className="text-xs font-mono font-black" style={{ color: accent }}>
            {counter}
          </span>
        </div>
        <div className="flex-1 min-h-0 p-3 grid grid-cols-2 gap-2 content-start">{field.map(chip)}</div>
      </div>

      <DragGhost dragging={drag.dragging}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-[#07131a] font-mono text-xs font-bold text-white shadow-xl"
          style={{ borderColor: accent }}
        >
          {dragged && <FileIcon name={dragged.name} size={16} />}
          {dragged?.name}
        </div>
      </DragGhost>
    </div>
  );
};
