import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import type { BlockProps, ChoiceCardsConfig } from '../types/mission';

/**
 * Klocek: wybór 1 z N kart z opisem.
 *
 * Nie zna żadnej misji — wszystkie teksty i poziomy przychodzą w `config`.
 * Punktów nie liczy; zgłasza decyzję przez `onDecision`.
 */
export const ChoiceCards: React.FC<BlockProps<ChoiceCardsConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selected = config.options.find((o) => o.id === selectedId);

  const handleSelect = (id: string) => {
    if (isConfirmed) return;
    sounds.playClick();
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selected || isConfirmed) return;
    sounds.playSuccess();
    setIsConfirmed(true);

    onDecision({
      num: config.decisionNum,
      question: config.question,
      answer: selected.label,
      tier: selected.tier,
      feedback: selected.feedback
    });

    if (selected.tier !== 'critical') {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <div className="border-b pb-3" style={{ borderColor: `${accent}4d` }}>
        <h2 className="text-sm font-bold text-white tracking-widest">{config.question}</h2>
        {config.subtitle && (
          <p className="text-[0.6875rem] mt-1" style={{ color: accent }}>
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {config.options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <div
              key={option.id}
              data-option-id={option.id}
              onClick={() => handleSelect(option.id)}
              className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                isConfirmed ? 'cursor-default' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'scale-[1.01]'
                  : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
              }`}
              style={
                isSelected
                  ? {
                      borderColor: accent,
                      backgroundColor: `${accent}26`,
                      boxShadow: `0 0 20px ${accent}59`
                    }
                  : undefined
              }
            >
              <div>
                <h3 className="text-xs font-bold text-white mb-1.5 leading-snug">{option.label}</h3>
                {option.desc && (
                  <p className="text-[0.6875rem] text-gray-300 leading-relaxed mb-3">{option.desc}</p>
                )}
              </div>

              <div>
                {option.tags && option.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-black/50 text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {isSelected && (
                  <div
                    className="mt-2 text-[0.625rem] font-bold flex items-center space-x-1"
                    style={{ color: accent }}
                  >
                    <CheckCircle2 size={12} />
                    <span>WYBRANO</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex items-center justify-end">
        <button
          data-confirm-choice="true"
          disabled={!selectedId || isConfirmed}
          onClick={handleConfirm}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedId && !isConfirmed
              ? 'text-white cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          style={
            selectedId && !isConfirmed
              ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` }
              : undefined
          }
        >
          <span>ZATWIERDŹ WYBÓR</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
