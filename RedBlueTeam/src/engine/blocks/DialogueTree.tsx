import React, { useState } from 'react';
import { MessageSquareCode, Send } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import type { BlockProps, DialogueTreeConfig, DialogueNode } from '../types/mission';

interface Line {
  sender: string;
  text: string;
  isPlayer: boolean;
}

/**
 * Klocek: rozmowa z rozmówcą innym niż BYTE_MASTER.
 *
 * Węzeł z `decisionNum` jest oceniany i zgłaszany przez `onDecision`.
 * Rozmowa kończy się, gdy opcja nie wskazuje kolejnego węzła.
 */
export const DialogueTree: React.FC<BlockProps<DialogueTreeConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';

  const firstNode = config.nodes[0];
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(firstNode?.id ?? null);
  const [isFinished, setIsFinished] = useState(false);
  const [lines, setLines] = useState<Line[]>(
    firstNode ? [{ sender: config.respondent, text: firstNode.incoming, isPlayer: false }] : []
  );

  const currentNode: DialogueNode | undefined = config.nodes.find((n) => n.id === currentNodeId);

  const handleChoose = (optionId: string) => {
    if (!currentNode || isFinished) return;
    const option = currentNode.options.find((o) => o.id === optionId);
    if (!option) return;

    sounds.playClick();
    setLines((prev) => [...prev, { sender: 'TY', text: option.label, isPlayer: true }]);

    if (currentNode.decisionNum !== undefined) {
      onDecision({
        num: currentNode.decisionNum,
        question: currentNode.question || currentNode.incoming,
        answer: option.label,
        tier: option.tier,
        feedback: option.feedback
      });
    }

    if (option.tier === 'critical') {
      setIsFinished(true);
      setCurrentNodeId(null);
      return;
    }

    const nextNode = option.nextNode ? config.nodes.find((n) => n.id === option.nextNode) : undefined;

    if (nextNode) {
      setCurrentNodeId(null);
      setTimeout(() => {
        sounds.playNotification();
        setLines((prev) => [
          ...prev,
          { sender: config.respondent, text: nextNode.incoming, isPlayer: false }
        ]);
        setCurrentNodeId(nextNode.id);
      }, 900);
      return;
    }

    // Brak kolejnego węzła = koniec rozmowy.
    setCurrentNodeId(null);
    setIsFinished(true);
    setTimeout(() => {
      if (config.closingMessage) {
        sounds.playNotification();
        setLines((prev) => [
          ...prev,
          { sender: config.respondent, text: config.closingMessage!, isPlayer: false }
        ]);
      }
      sounds.playSuccess();
      onComplete();
    }, 900);
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none p-4">
      <div
        className="border-b pb-3 mb-3 flex items-center space-x-2.5"
        style={{ borderColor: `${accent}4d` }}
      >
        <div
          className="p-1.5 rounded border"
          style={{ backgroundColor: `${accent}33`, borderColor: accent, color: accent }}
        >
          <MessageSquareCode size={20} />
        </div>
        <h2 className="text-sm font-bold text-white tracking-widest">{config.respondent}</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {lines.map((line, i) => (
          <div key={i} className={`flex ${line.isPlayer ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                line.isPlayer
                  ? 'bg-[#0b1a26] border border-gray-700 text-gray-200'
                  : 'bg-black/50 border border-gray-800 text-gray-300'
              }`}
            >
              <div className="text-[9px] font-bold mb-1 opacity-70">{line.sender}</div>
              {line.text}
            </div>
          </div>
        ))}
      </div>

      {currentNode && currentNode.options.length > 0 && (
        <div className="pt-3 mt-3 border-t border-gray-800 space-y-2">
          {currentNode.options.map((option) => (
            <button
              key={option.id}
              data-option-id={option.id}
              onClick={() => handleChoose(option.id)}
              className="w-full text-left px-3 py-2 rounded-xl border border-gray-800 bg-[#08101a] hover:bg-[#0c1624] text-[11px] text-gray-200 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>{option.label}</span>
              <Send
                size={13}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                style={{ color: accent }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
