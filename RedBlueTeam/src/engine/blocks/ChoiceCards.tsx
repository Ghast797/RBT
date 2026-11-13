import React, { useState } from 'react';
import { ArrowRight, ListChecks } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import { AppHeader } from '../components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../components/ChoiceZone';
import { useShuffled } from '../core/shuffle';
import { failFieldsOf } from '../core/report';
import { MentorRejectNotice, isRejected, useRejectedAttempts } from '../components/MentorRejectNotice';
import type { BlockProps, ChoiceCardsConfig } from '../types/mission';

/**
 * Klocek: wybór 1 z N kart z opisem.
 *
 * Nie zna żadnej misji — wszystkie teksty i poziomy przychodzą w `config`.
 * Punktów nie liczy; zgłasza decyzję przez `onDecision`. Opcje wyświetla w losowej kolejności.
 */
export const ChoiceCards: React.FC<BlockProps<ChoiceCardsConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const options = useShuffled(config.options);
  const rejected = useRejectedAttempts(config.decisionNum);
  const rejectDecision = useMissionStore((s) => s.rejectDecision);

  const selected = config.options.find((o) => o.id === selectedId);

  const handleSelect = (id: string) => {
    if (isConfirmed || isRejected(rejected, id)) return;
    sounds.playClick();
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selected || isConfirmed) return;

    // B2: mentor odrzuca wybór — kara za próbę, decyzja otwarta, opcja się blokuje.
    if (selected.reject) {
      rejectDecision({
        num: config.decisionNum,
        question: config.question,
        optionId: selected.id,
        answer: selected.label,
        tier: selected.tier,
        mentorLine: selected.reject.mentorLine
      });
      setSelectedId(null);
      return;
    }

    sounds.playSuccess();
    setIsConfirmed(true);

    onDecision({
      num: config.decisionNum,
      question: config.question,
      answer: selected.label,
      tier: selected.tier,
      feedback: selected.feedback,
      ...failFieldsOf(selected, selected.tier)
    });

    if (selected.tier !== 'critical') {
      onComplete();
    }
  };

  const columns = options.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <AppHeader
        icon={ListChecks}
        accent={accent}
        title={config.title || '//WYBÓR'}
        subtitle={config.subtitle}
        step={config.step}
        task={config.task || config.question}
      />

      <ChoiceZone accent={accent} label={config.choiceLabel || 'WYBIERZ JEDNO'}>
        <MentorRejectNotice attempts={rejected} />
        <div className={`grid grid-cols-1 ${columns} gap-3`}>
          {options.map((option) => (
            <ChoiceTile
              key={option.id}
              accent={accent}
              state={isRejected(rejected, option.id) ? 'wrong' : selectedId === option.id ? 'selected' : 'idle'}
              disabled={isConfirmed || isRejected(rejected, option.id)}
              markerPosition="corner"
              onClick={() => handleSelect(option.id)}
              className="p-3.5 h-full"
            >
              <div className="space-y-2 pr-7" data-option-id={option.id}>
                <h3 className="text-xs font-bold text-white leading-snug">{option.label}</h3>
                {option.desc && <p className="text-[0.6875rem] text-gray-300 leading-relaxed">{option.desc}</p>}
                {option.tags && option.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {option.tags.map((tag) => (
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

      <div className="pt-1 flex items-center justify-end">
        <button
          data-confirm-choice="true"
          disabled={!selectedId || isConfirmed}
          onClick={handleConfirm}
          className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-lg active:scale-95"
          style={{
            backgroundColor: accent,
            color: '#05090f',
            boxShadow: selectedId && !isConfirmed ? `0 0 15px ${accent}66` : undefined
          }}
        >
          <span>ZATWIERDŹ WYBÓR</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
