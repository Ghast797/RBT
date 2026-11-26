// Etap 6 — //CZAT_Z_OFIARĄ: rozmowa z szefem IT (klocek DialogueTree, tryb per-węzeł: D9, D10, węzeł 3 bez oceny)
// obok miniatury okna żądania okupu, które gracz złożył w kreatorze (customState['m4_note']).
// Stan rozmowy trzyma DialogueTree (zwykły stan Reacta; AppHost nie odmontowuje aplikacji).

import React, { useMemo } from 'react';
import { DialogueTree } from '../../../engine/blocks/DialogueTree';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps, DecisionReport } from '../../../engine/types/mission';
import { M4_NOTE_KEY, type M4NoteState, type RansomPreviewConfig, type VictimChatConfig } from './types';

/** Podmienia `answer` na `reportAnswers[optionId]`; DialogueTree zgłasza etykietę, więc opcję szukamy w węźle decyzji po `label`. */
export function mapReportAnswer(config: VictimChatConfig, decision: DecisionReport): DecisionReport {
  const node = config.dialogue.nodes.find((n) => n.decisionNum === decision.num);
  const option = node?.options.find((o) => o.label === decision.answer);
  const replaced = option ? config.reportAnswers[option.id] : undefined;
  return replaced === undefined ? decision : { ...decision, answer: replaced };
}

export interface ResolvedPreview {
  title: string;
  time: string;
  color: string;
}

/**
 * Tytuł, czas i kolor miniatury z `m4_note`. Brak `m4_note` (okno nie zostało zbudowane w kreatorze)
 * → null: miniatury nie pokazujemy, bo nie ma czego pokazać. Nieznane id → `preview.fallback`.
 */
export function resolvePreview(preview: RansomPreviewConfig, note: M4NoteState | undefined): ResolvedPreview | null {
  if (!note) return null;
  const fb = preview.fallback;
  return {
    title: preview.titles[note.titleId] ?? preview.titles[fb.titleId] ?? '',
    time: preview.times[note.timeId] ?? preview.times[fb.timeId] ?? '',
    color: preview.colors[note.colorId] ?? preview.colors[fb.colorId] ?? '#ef4444'
  };
}

export const VictimChatApp: React.FC<BlockProps<VictimChatConfig>> = ({ config, onDecision, onComplete }) => {
  const note = useMissionStore((s) => s.customState[M4_NOTE_KEY]) as M4NoteState | undefined;
  const view = useMemo(() => resolvePreview(config.preview, note), [config.preview, note]);
  const dialogue = useMemo(
    () => ({ ...config.dialogue, title: config.dialogue.title ?? config.title }),
    [config.dialogue, config.title]
  );
  const { preview } = config;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#05090f]">
      <div className="flex-1 min-w-0 min-h-0">
        <DialogueTree
          config={dialogue}
          onDecision={(d) => onDecision(mapReportAnswer(config, d))}
          onComplete={onComplete}
        />
      </div>
      {view && (
        <aside className="w-[14rem] shrink-0 p-4 pl-0 font-mono select-none flex flex-col min-h-0">
          <div className="text-[0.6875rem] font-bold tracking-widest text-gray-500 mb-2">{preview.heading}</div>
          <div
            className="rounded-lg border-2 bg-black/70 p-3 flex flex-col gap-2 text-center overflow-hidden"
            style={{ borderColor: view.color, boxShadow: `0 0 14px ${view.color}55` }}
          >
            <div className="text-xs font-bold leading-snug" style={{ color: view.color }}>{view.title}</div>
            <div className="text-lg font-bold text-gray-100">{view.time}</div>
            <div className="border-t border-gray-800 pt-2 text-left">
              <div className="text-[0.625rem] text-gray-500">{preview.amountLabel}</div>
              <div className="text-xs text-gray-200 break-words">{preview.amount}</div>
              <div className="text-[0.625rem] text-gray-400 break-all mt-1">{preview.address}</div>
            </div>
            <div className="text-[0.625rem] text-gray-400 break-words">{preview.contact}</div>
          </div>
        </aside>
      )}
    </div>
  );
};
