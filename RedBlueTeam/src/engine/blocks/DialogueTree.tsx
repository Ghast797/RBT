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
import type { BlockProps, DialogueTreeConfig, DialogueNode, ChoiceOutcome } from '../types/mission';

interface Line {
  sender: string;
  text: string;
  isPlayer: boolean;
}

/**
 * Klocek: rozmowa z rozmówcą innym niż BYTE_MASTER.
 *
 * Ocena per-węzeł (docs/scenario-engine.md, sekcja 6): każdy węzeł z `decisionNum` jest oceniany osobno.
 * Odpowiedź wybrana w węźle bez `decisionNum` zapisuje się jako „ciąg dalszy” ostatniej ocenianej decyzji
 * tej rozmowy (`appendFollowUp`) i trafia do raportu.
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
  const [isRespondentTyping, setIsRespondentTyping] = useState(false);
  const [criticalFeedback, setCriticalFeedback] = useState<string>('');
  // Numer ostatniej ocenianej decyzji tej rozmowy — do niego dopisują się odpowiedzi z węzłów bez oceny.
  const lastScoredNum = useRef<number | null>(null);

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
  // Numer decyzji bieżącego węzła — dla odrzuceń mentora (B2).
  const currentNum = currentNode?.decisionNum;
  const rejected = useRejectedAttempts(currentNum);
  const rejectDecision = useMissionStore((s) => s.rejectDecision);
  const appendFollowUp = useMissionStore((s) => s.appendFollowUp);

  const finish = (closing: boolean, tier: ChoiceOutcome) => {
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
      if (isRejected(rejected, option.id)) return;
      rejectDecision({
        num: currentNum,
        question: currentNode.question || currentNode.incoming,
        optionId: option.id,
        answer: option.label,
        tier: option.tier,
        mentorLine: option.reject.mentorLine,
        feedback: option.feedback
      });
      return;
    }

    sounds.playClick();
    setLines((prev) => [...prev, { sender: 'TY', text: option.label, isPlayer: true }]);

    // Ocena od razu dla węzła z własnym numerem; odpowiedź w węźle bez oceny to ciąg dalszy ostatniej decyzji.
    if (currentNode.decisionNum !== undefined) {
      lastScoredNum.current = currentNode.decisionNum;
      onDecision({
        num: currentNode.decisionNum,
        question: currentNode.question || currentNode.incoming,
        optionId: option.id,
        answer: option.label,
        tier: option.tier,
        feedback: option.feedback,
        ...failFieldsOf(option, option.tier)
      });
    } else if (lastScoredNum.current !== null) {
      appendFollowUp(lastScoredNum.current, option.label);
    }

    // Błąd krytyczny kończy rozmowę natychmiast.
    if (option.tier === 'critical') {
      setCriticalFeedback(option.feedback);
      setIsFinished(true);
      setCurrentNodeId(null);
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
    finish(true, option.tier);
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
        {isFinished && criticalFeedback && (
          <div className="text-xs text-red-400 italic px-1">{criticalFeedback}</div>
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
                state={isRejected(rejected, option.id) ? 'wrong' : 'idle'}
                disabled={isRejected(rejected, option.id)}
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
