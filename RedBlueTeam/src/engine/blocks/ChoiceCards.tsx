import React, { useState } from 'react';
import { ArrowRight, Info, ListChecks } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import { AppHeader } from '../components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../components/ChoiceZone';
import { useShuffled } from '../core/shuffle';
import { failFieldsOf } from '../core/report';
import { MentorRejectNotice, isRejected, useRejectedAttempts } from '../components/MentorRejectNotice';
import type { BlockProps, ChoiceCardsConfig } from '../types/mission';

/**
 * Wstawia `<wbr />` po znakach `@`, `_`, `.` oraz pojedynczym `/` (nie między `//`),
 * żeby długie domeny, adresy e-mail i URL-e łamały się czytelnie bez zniekształcania `textContent`.
 */
function renderBreakableText(text: string): React.ReactNode {
  const parts = text.split(/([@_.]|(?<!\/)\/(?!\/))(?=\S)/);
  if (parts.length === 1) return text;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const chunk = parts[i];
    const sep = parts[i + 1];
    if (sep !== undefined) {
      out.push(
        <React.Fragment key={i}>
          {chunk}
          {sep}
          <wbr />
        </React.Fragment>
      );
    } else if (chunk) {
      out.push(chunk);
    }
  }
  return out;
}

/**
 * Klocek: wybór 1 z N kart z opisem (opcjonalnie ze statyczną kartą kontekstu `info`).
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
  const info = config.info;
  const hasInfo = Boolean(info && (info.title || info.text || (info.items && info.items.length > 0)));
  const itemCount = info?.items?.length ?? 0;
  const infoItemsCols =
    itemCount >= 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : itemCount === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : itemCount === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1';
  const hasDetails = options.some((o) => Boolean(o.desc) || Boolean(o.tags && o.tags.length > 0));

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
        mentorLine: selected.reject.mentorLine,
        feedback: selected.feedback
      });
      setSelectedId(null);
      return;
    }

    sounds.playSuccess();
    setIsConfirmed(true);

    onDecision({
      num: config.decisionNum,
      question: config.question,
      optionId: selected.id,
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
    <div className="flex flex-col h-full min-h-0 bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 gap-3.5">
      <AppHeader
        icon={ListChecks}
        accent={accent}
        title={config.title || '//WYBÓR'}
        subtitle={config.subtitle}
        step={config.step}
        task={config.task || config.question}
      />

      {hasInfo && info && (
        <section
          aria-label={info.title || 'Informacje pomocnicze'}
          data-choice-info="true"
          className="w-full shrink-0 rounded-xl border border-cyan-500/35 bg-[#07111b] p-3.5 sm:p-4 space-y-2.5"
        >
          {info.title && (
            <div className="flex items-center gap-2 text-cyan-400">
              <Info size={16} className="shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider leading-snug">
                {info.title}
              </h3>
            </div>
          )}
          {info.text && (
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
              {renderBreakableText(info.text)}
            </p>
          )}
          {info.items && info.items.length > 0 && (
            <div className={`grid ${infoItemsCols} gap-2.5`}>
              {info.items.map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  className="px-3 py-2 rounded-lg bg-black/50 border border-gray-800 flex items-center justify-between gap-2 min-w-0"
                >
                  <span className="text-xs sm:text-sm text-gray-300 font-semibold break-words min-w-0">
                    {renderBreakableText(item.label)}
                  </span>
                  {item.value && (
                    <span className="text-xs sm:text-sm font-black tracking-wider text-cyan-300 text-right break-words [overflow-wrap:anywhere] min-w-0">
                      {renderBreakableText(item.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <ChoiceZone accent={accent} label={config.choiceLabel || 'WYBIERZ JEDNO'} className="my-auto shrink-0">
        <MentorRejectNotice attempts={rejected} selectedId={selectedId} />
        <div className={`grid grid-cols-1 ${columns} gap-3`}>
          {options.map((option) => (
            <ChoiceTile
              key={option.id}
              accent={accent}
              state={isRejected(rejected, option.id) ? 'wrong' : selectedId === option.id ? 'selected' : 'idle'}
              disabled={isConfirmed || isRejected(rejected, option.id)}
              markerPosition="corner"
              onClick={() => handleSelect(option.id)}
              className={hasDetails ? 'p-4 h-full' : 'p-4 h-full min-h-[5.5rem]'}
            >
              <div
                className={
                  hasDetails
                    ? 'space-y-2 pr-7 min-w-0'
                    : 'flex flex-col items-center justify-center text-center h-full px-6 min-h-[4rem] min-w-0'
                }
                data-option-id={option.id}
              >
                <h3
                  className={`${
                    hasDetails ? 'text-base font-bold' : 'text-base sm:text-lg font-black tracking-wide'
                  } text-white leading-snug break-words [overflow-wrap:anywhere] w-full`}
                >
                  {renderBreakableText(option.label)}
                </h3>
                {option.desc && (
                  <p className="text-sm text-gray-200 leading-relaxed break-words [overflow-wrap:anywhere]">
                    {renderBreakableText(option.desc)}
                  </p>
                )}
                {option.tags && option.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded bg-black/50 text-gray-300 border border-gray-800"
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

      <div className="pt-1 flex items-center justify-end shrink-0">
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
