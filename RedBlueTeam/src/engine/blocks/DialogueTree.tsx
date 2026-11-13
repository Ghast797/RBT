import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareCode, Send } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import { AppHeader } from '../components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../components/ChoiceZone';
import { createTimerBag } from '../core/runGuard';
import { useShuffled } from '../core/shuffle';
import { failFieldsOf } from '../core/report';
import { MentorRejectNotice, isRejected, useRejectedAttempts } from '../components/MentorRejectNotice';
import type { BlockProps, DialogueTreeConfig, DialogueNode, ChoiceOutcome, ChoiceOption, DecisionReport } from '../types/mission';

interface Line {
  sender: string;
  text: string;
  isPlayer: boolean;
}

const TIER_RANK: Record<ChoiceOutcome, number> = { ideal: 0, suboptimal: 1, critical: 2 };

/** Gorszy z dwóch poziomów (critical > suboptimal > ideal). */
function worstTier(a: ChoiceOutcome, b: ChoiceOutcome): ChoiceOutcome {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

/**
 * Klocek: rozmowa z rozmówcą innym niż BYTE_MASTER.
 *
 * Dwa tryby oceny (docs/scenario-engine.md, sekcja 6):
 * - agregujący (`config.decisionNum`): cała rozmowa to jedna decyzja; poziom to
 *   najgorszy wybór na ścieżce, a błąd krytyczny przerywa rozmowę natychmiast.
 * - per-węzeł (`node.decisionNum`): każdy węzeł oceniany osobno.
 */
export const DialogueTree: React.FC<BlockProps<DialogueTreeConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';
  const aggregate = typeof config.decisionNum === 'number';

  const firstNode = config.nodes[0];
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(firstNode?.id ?? null);
  const [isFinished, setIsFinished] = useState(false);
  const [isRespondentTyping, setIsRespondentTyping] = useState(false);
  const [pathTier, setPathTier] = useState<ChoiceOutcome>('ideal');
  const [lastFeedback, setLastFeedback] = useState<string>('');

  // Rozmowa telefoniczna: rozmówca „pisze" przez chwilę zanim pojawi się jego kwestia.
  const REPLY_DELAY = 1600;
  const [lines, setLines] = useState<Line[]>(
    firstNode ? [{ sender: config.respondent, text: firstNode.incoming, isPlayer: false }] : []
  );

  // Id opóźnionych kroków — sprzątane przy odmontowaniu (np. powtórka misji w trakcie opóźnienia).
  const timerBag = useRef(createTimerBag()).current;
  useEffect(() => () => timerBag.clear(), [timerBag]);
  const later = timerBag.later;

  const currentNode: DialogueNode | undefined = config.nodes.find((n) => n.id === currentNodeId);
  const currentOptions = useShuffled(currentNode?.options ?? []);
  // Numer decyzji bieżącego węzła (tryb agregujący: jeden na całą rozmowę) — dla odrzuceń mentora (B2).
  const currentNum = aggregate ? config.decisionNum : currentNode?.decisionNum;
  const rejected = useRejectedAttempts(currentNum);
  const rejectDecision = useMissionStore((s) => s.rejectDecision);

  const finish = (
    closing: boolean,
    tier: ChoiceOutcome,
    feedback: string,
    question: string,
    answer: string,
    failOption?: ChoiceOption
  ) => {
    setIsFinished(true);
    setCurrentNodeId(null);
    const willShowClosing = closing && !!config.closingMessage;
    if (willShowClosing) setIsRespondentTyping(true);
    later(() => {
      if (willShowClosing) {
        setIsRespondentTyping(false);
        sounds.playNotification();
        setLines((prev) => [
          ...prev,
          { sender: config.respondent, text: config.closingMessage!, isPlayer: false }
        ]);
      }
      if (aggregate) {
        const report: DecisionReport = { num: config.decisionNum!, question, answer, tier, feedback };
        if (failOption) Object.assign(report, failFieldsOf(failOption, tier));
        onDecision(report);
      }
      if (tier !== 'critical') {
        sounds.playSuccess();
        onComplete();
      }
    }, willShowClosing ? REPLY_DELAY : 900);
  };

  const handleChoose = (optionId: string) => {
    if (!currentNode || isFinished) return;
    const option = currentNode.options.find((o) => o.id === optionId);
    if (!option) return;

    // B2: mentor odrzuca tę odpowiedź — kara za próbę, rozmowa stoi w miejscu, odpowiedź się blokuje.
    if (option.reject && currentNum !== undefined) {
      if (isRejected(rejected, option.label)) return;
      rejectDecision({
        num: currentNum,
        question: aggregate
          ? config.question || firstNode.incoming
          : currentNode.question || currentNode.incoming,
        answer: option.label,
        tier: option.tier,
        mentorLine: option.reject.mentorLine
      });
      return;
    }

    sounds.playClick();
    setLines((prev) => [...prev, { sender: 'TY', text: option.label, isPlayer: true }]);

    const combinedTier = worstTier(pathTier, option.tier);
    setPathTier(combinedTier);
    setLastFeedback(option.feedback);

    // Per-węzeł: ocena od razu dla węzła z własnym numerem.
    if (!aggregate && currentNode.decisionNum !== undefined) {
      onDecision({
        num: currentNode.decisionNum,
        question: currentNode.question || currentNode.incoming,
        answer: option.label,
        tier: option.tier,
        feedback: option.feedback,
        ...failFieldsOf(option, option.tier)
      });
    }

    // Błąd krytyczny kończy rozmowę natychmiast.
    if (option.tier === 'critical') {
      if (aggregate) {
        finish(false, combinedTier, option.feedback, config.question || firstNode.incoming, option.label, option);
      } else {
        setIsFinished(true);
        setCurrentNodeId(null);
      }
      return;
    }

    const nextNode = option.nextNode ? config.nodes.find((n) => n.id === option.nextNode) : undefined;

    if (nextNode) {
      setCurrentNodeId(null);
      setIsRespondentTyping(true);
      later(() => {
        setIsRespondentTyping(false);
        sounds.playNotification();
        setLines((prev) => [
          ...prev,
          { sender: config.respondent, text: nextNode.incoming, isPlayer: false }
        ]);
        setCurrentNodeId(nextNode.id);
      }, REPLY_DELAY);
      return;
    }

    // Brak kolejnego węzła = koniec rozmowy.
    finish(true, combinedTier, option.feedback, config.question || firstNode.incoming, option.label, option);
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none p-4">
      <AppHeader
        icon={MessageSquareCode}
        accent={accent}
        title={config.title || '//ROZMOWA'}
        subtitle={config.respondent}
        task={
          isFinished
            ? 'Rozmowa zakończona.'
            : config.task || 'Przeczytaj wiadomość rozmówcy i wybierz odpowiedź.'
        }
      />

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-3">
        {lines.map((line, i) => (
          <div key={i} className={`flex ${line.isPlayer ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed font-sans ${
                line.isPlayer
                  ? 'bg-[#0b1a26] border border-gray-700 text-gray-200'
                  : 'bg-black/50 border border-gray-800 text-gray-300'
              }`}
            >
              <div className="text-[0.6875rem] font-bold font-mono mb-1 opacity-70">{line.sender}</div>
              {line.text}
            </div>
          </div>
        ))}
        {isRespondentTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-3 py-2 rounded-xl bg-black/50 border border-gray-800">
              <div className="text-[0.6875rem] font-bold font-mono mb-1 opacity-70">{config.respondent}</div>
              <div className="flex items-center space-x-1" style={{ color: accent }}>
                <span className="text-xs opacity-80">pisze</span>
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {isFinished && lastFeedback && pathTier === 'critical' && (
          <div className="text-xs text-red-400 italic px-1">{lastFeedback}</div>
        )}
      </div>

      {currentNode && currentNode.options.length > 0 && !isFinished && (
        <ChoiceZone accent={accent} label="WYBIERZ ODPOWIEDŹ" className="shrink-0">
          <MentorRejectNotice attempts={rejected} />
          <div className="flex flex-col gap-2">
            {currentOptions.map((option) => (
              <ChoiceTile
                key={option.id}
                accent={accent}
                state={isRejected(rejected, option.label) ? 'wrong' : 'idle'}
                disabled={isRejected(rejected, option.label)}
                onClick={() => handleChoose(option.id)}
                className="px-3.5 py-2.5 items-center"
              >
                <div className="flex items-center justify-between gap-2" data-option-id={option.id}>
                  <span className="text-sm text-gray-100 font-sans leading-snug">{option.label}</span>
                  <Send size={14} className="shrink-0" style={{ color: accent }} />
                </div>
              </ChoiceTile>
            ))}
          </div>
        </ChoiceZone>
      )}
    </div>
  );
};
