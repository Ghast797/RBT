import React, { useState, useEffect, useRef } from 'react';
import {
  Building,
  Server,
  Users,
  Calculator,
  Mail,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import type { BlockProps } from '../../../engine/types/mission';
import type {
  TargetPetrologConfig,
  BriefingFact,
  InvestigationPlace,
  AttackVectorDecision,
  AssessmentType
} from './types';

// Helper: render icon for places and attack vectors
const renderIcon = (iconName?: string, size = 24, className?: string) => {
  switch (iconName) {
    case 'building':
      return <Building size={size} className={className} />;
    case 'server':
      return <Server size={size} className={className} />;
    case 'users':
      return <Users size={size} className={className} />;
    case 'calculator':
      return <Calculator size={size} className={className} />;
    case 'mail':
      return <Mail size={size} className={className} />;
    default:
      return <FileText size={size} className={className} />;
  }
};

interface NotebookClue {
  id: string;
  placeId: string;
  placeName: string;
  text: string;
  isWeakPoint: boolean;
}

// ---------------------------------------------------------------------------
// NOTATNIK ŚLEDCZY: prawy monitor (SideMonitor) od kroku ZBADAJ do końca etapu.
// W kroku ZDECYDUJ błędna odpowiedź podświetla trop, do którego odsyła feedback.
// ---------------------------------------------------------------------------
const InvestigationNotebook: React.FC<{
  clues: NotebookClue[];
  totalPlaces: number;
  flashingPlaceId: string | null;
  accent: string;
}> = ({ clues, totalPlaces, flashingPlaceId, accent }) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!flashingPlaceId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-clue-place="${flashingPlaceId}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [flashingPlaceId]);

  return (
    <div
      className="flex flex-col h-full bg-[#040810] border-2 rounded-xl p-4 space-y-3 font-mono"
      style={{
        borderColor: `${accent}66`,
        backgroundImage:
          'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}
    >
      <div className="flex items-center justify-between border-b pb-2 shrink-0" style={{ borderColor: `${accent}40` }}>
        <span className="text-xs font-black tracking-widest" style={{ color: accent }}>
          //NOTATNIK_ŚLEDCZY
        </span>
        <span
          className="text-[0.625rem] px-2 py-0.5 rounded border font-mono tracking-wider font-bold"
          style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
        >
          {`USTALENIA ${clues.length}/${totalPlaces}`}
        </span>
      </div>

      {clues.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-xs italic text-center p-6">
          Tu pojawią się Twoje ustalenia
        </div>
      ) : (
        <div ref={listRef} className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {clues.map((clue) => {
            const isFlashing = flashingPlaceId === clue.placeId;
            return (
              <div
                key={clue.id}
                data-clue-place={clue.placeId}
                className={`p-3 rounded-lg border text-xs transition-all duration-300 ${
                  isFlashing
                    ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse'
                    : clue.isWeakPoint
                    ? 'border-red-500/70 bg-red-950/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                    : 'border-gray-800/80 bg-black/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-[0.625rem] font-bold uppercase tracking-wider text-gray-300">
                    {clue.placeName}
                  </span>
                  <span
                    className={`text-[0.5625rem] font-black uppercase tracking-wider shrink-0 ${
                      clue.isWeakPoint ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {clue.isWeakPoint ? '● SŁABY PUNKT' : '● CHRONIONE'}
                  </span>
                </div>
                <p className="font-sans text-xs leading-relaxed text-gray-200">{clue.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// KROK 1: POZNAJ CEL (BriefingStep)
// ---------------------------------------------------------------------------
interface BriefingStepProps {
  facts: BriefingFact[];
  decryptedIds: string[];
  onCardDecrypted: (factId: string) => void;
  accent: string;
  onNext: () => void;
}

const BriefingStep: React.FC<BriefingStepProps> = ({
  facts,
  decryptedIds,
  onCardDecrypted,
  accent,
  onNext
}) => {
  const [decryptingIds, setDecryptingIds] = useState<string[]>([]);
  const [scrambleTexts, setScrambleTexts] = useState<Record<string, string>>({});
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleCardClick = (fact: BriefingFact) => {
    // If already decrypted, do nothing
    if (decryptedIds.includes(fact.id)) return;

    // If already decrypting, clicking again instantly finishes decryption as failsafe
    if (decryptingIds.includes(fact.id)) {
      if (intervalsRef.current.has(fact.id)) {
        clearInterval(intervalsRef.current.get(fact.id)!);
        intervalsRef.current.delete(fact.id);
      }
      if (timeoutsRef.current.has(fact.id)) {
        clearTimeout(timeoutsRef.current.get(fact.id)!);
        timeoutsRef.current.delete(fact.id);
      }
      setDecryptingIds((prev) => prev.filter((id) => id !== fact.id));
      onCardDecrypted(fact.id);
      sounds.playSuccess();
      return;
    }

    sounds.playClick(1000, 0.03);
    setDecryptingIds((prev) => (prev.includes(fact.id) ? prev : [...prev, fact.id]));

    const chars = '01#@$%&*!?ABCDEFXYZ_';
    const duration = 600;
    const tick = 50;

    // Safety: clear any prior timer for this specific card
    if (intervalsRef.current.has(fact.id)) {
      clearInterval(intervalsRef.current.get(fact.id)!);
      intervalsRef.current.delete(fact.id);
    }
    if (timeoutsRef.current.has(fact.id)) {
      clearTimeout(timeoutsRef.current.get(fact.id)!);
      timeoutsRef.current.delete(fact.id);
    }

    const intervalId = setInterval(() => {
      const scrambled = Array.from({ length: 12 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
      setScrambleTexts((prev) => ({ ...prev, [fact.id]: scrambled }));
    }, tick);
    intervalsRef.current.set(fact.id, intervalId);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      intervalsRef.current.delete(fact.id);
      timeoutsRef.current.delete(fact.id);

      setDecryptingIds((prev) => prev.filter((id) => id !== fact.id));
      onCardDecrypted(fact.id);
      sounds.playSuccess();
    }, duration);
    timeoutsRef.current.set(fact.id, timeoutId);
  };

  useEffect(() => {
    const currentIntervals = intervalsRef.current;
    const currentTimeouts = timeoutsRef.current;
    return () => {
      currentIntervals.forEach((id) => clearInterval(id));
      currentIntervals.clear();
      currentTimeouts.forEach((id) => clearTimeout(id));
      currentTimeouts.clear();
    };
  }, []);

  const allDecrypted = facts.length > 0 && decryptedIds.length >= facts.length;

  return (
    <div className="flex flex-col flex-1 justify-between space-y-6">
      {/* 3 Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
        {facts.map((fact) => {
          const isDecrypted = decryptedIds.includes(fact.id);
          const isDecrypting = decryptingIds.includes(fact.id);

          return (
            <div
              key={fact.id}
              onClick={() => handleCardClick(fact)}
              className={`min-h-[170px] sm:min-h-[190px] p-5 rounded-xl border flex flex-col justify-between transition-all select-none relative overflow-hidden ${
                isDecrypted
                  ? 'bg-[#081824]/90 border-emerald-500/60 shadow-[0_0_20px_rgba(0,255,102,0.15)]'
                  : isDecrypting
                  ? 'bg-emerald-950/30 border-emerald-400 cursor-wait shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'bg-black/50 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/20 cursor-pointer animate-pulse'
              }`}
              style={{
                borderColor: isDecrypted ? `${accent}80` : isDecrypting ? accent : undefined
              }}
            >
              {isDecrypted ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.625rem] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                        ODSZYFROWANO
                      </span>
                      <CheckCircle2 size={20} className="text-[#00ff66]" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-wide">
                      {fact.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                      {fact.explanation}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-800/60 text-[0.625rem] text-gray-500 font-mono">
                    STATUS: JAWNY
                  </div>
                </>
              ) : isDecrypting ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-6">
                  <div className="text-emerald-400 font-mono text-base font-bold animate-pulse">
                    {scrambleTexts[fact.id] || 'ODSZYFROWYWANIE...'}
                  </div>
                  <span className="text-[0.6875rem] font-mono text-gray-400 tracking-wider">
                    ŁAMANIE KLUCZA AES...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-6">
                  <div className="p-3 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
                    <Lock size={26} />
                  </div>
                  <span className="text-sm font-black tracking-widest text-emerald-400 uppercase">
                    ZASZYFROWANE
                  </span>
                  <span className="text-[0.6875rem] text-gray-500 font-mono">
                    (KLIKNIJ, ABY ODSZYFROWAĆ)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar with counter and next button */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-800/80 gap-3">
        <div className="flex items-center space-x-2 text-xs sm:text-sm font-mono text-gray-400">
          <span>Postęp odszyfrowywania:</span>
          <span className="text-white font-bold">
            {`Odszyfrowano ${decryptedIds.length}/${facts.length}`}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!allDecrypted}
          className={`w-full sm:w-auto px-7 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
            allDecrypted
              ? 'bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95'
              : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 cursor-not-allowed'
          }`}
        >
          <span>DALEJ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// KROK 2: ZBADAJ FIRMĘ (InvestigationStep)
// ---------------------------------------------------------------------------
interface InvestigationStepProps {
  places: InvestigationPlace[];
  evaluatedPlaces: Record<string, { assessment: AssessmentType; isCorrect: boolean }>;
  accent: string;
  onEvaluate: (placeId: string, assessment: AssessmentType) => void;
  onNext: () => void;
}

const InvestigationStep: React.FC<InvestigationStepProps> = ({
  places,
  evaluatedPlaces,
  accent,
  onEvaluate,
  onNext
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    places[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{
    placeId: string;
    type: 'success' | 'hint';
    message: string;
  } | null>(null);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || places[0];
  const evaluatedCount = Object.keys(evaluatedPlaces).length;
  const isSelectedEvaluated = selectedPlace && !!evaluatedPlaces[selectedPlace.id];

  const handleSelectPlace = (placeId: string) => {
    sounds.playClick();
    setSelectedPlaceId(placeId);
    setFeedback(null);
  };

  const handleAssessment = (assessment: AssessmentType) => {
    if (!selectedPlace) return;

    if (assessment === selectedPlace.correctAssessment) {
      sounds.playSuccess();
      setFeedback({
        placeId: selectedPlace.id,
        type: 'success',
        message: selectedPlace.feedbackCorrect
      });
      onEvaluate(selectedPlace.id, assessment);
    } else {
      sounds.playNotification();
      setFeedback({
        placeId: selectedPlace.id,
        type: 'hint',
        message: selectedPlace.feedbackIncorrect
      });
    }
  };

  const activeFeedback =
    feedback && feedback.placeId === selectedPlace?.id
      ? feedback
      : isSelectedEvaluated && selectedPlace
      ? {
          type: 'success' as const,
          message: selectedPlace.feedbackCorrect
        }
      : null;

  const allEvaluated = places.length > 0 && evaluatedCount >= places.length;

  return (
    <div className="flex flex-col flex-1 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 lg:items-start">
        {/* Notatnik jest na prawym monitorze, więc tu: miejsca (lewa) + obserwacja i ocena (prawa) */}
        <div className="contents">
          {/* 2x2 Grid of Places */}
          <ChoiceZone accent={accent} label="WYBIERZ MIEJSCE DO ZBADANIA" className="w-full lg:w-[45%] shrink-0">
          <div className="grid grid-cols-2 gap-2.5">
            {places.map((place) => {
              const evalInfo = evaluatedPlaces[place.id];
              const isSelected = selectedPlaceId === place.id;
              const isEvaluated = !!evalInfo;

              return (
                <ChoiceTile
                  key={place.id}
                  accent={accent}
                  state={isSelected ? 'selected' : 'idle'}
                  marker={null}
                  onClick={() => handleSelectPlace(place.id)}
                  className="p-3.5 min-h-[92px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`p-2 rounded-lg border ${
                        isSelected
                          ? 'bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/40'
                          : 'bg-gray-900 border-gray-800 text-gray-400'
                      }`}
                      style={isSelected ? { color: accent, borderColor: `${accent}66` } : undefined}
                    >
                      {renderIcon(place.iconName, 20)}
                    </div>

                    {isEvaluated && (
                      <span
                        className={`text-[0.5625rem] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                          place.correctAssessment === 'vulnerable'
                            ? 'bg-red-950/80 text-red-400 border-red-500/50'
                            : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                        }`}
                      >
                        {place.correctAssessment === 'vulnerable'
                          ? '● SŁABY PUNKT'
                          : '● CHRONIONE'}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                      {place.name}
                    </h4>
                    {!isEvaluated && (
                      <span className="text-[0.625rem] text-gray-500 font-mono block">
                        kliknij, aby sprawdzić
                      </span>
                    )}
                  </div>
                </ChoiceTile>
              );
            })}
          </div>
          </ChoiceZone>

          {/* Place Detail & Assessment Panel */}
          {selectedPlace && (
            <div className="p-4 rounded-xl border border-gray-800 bg-[#08121d]/95 flex flex-col space-y-3.5 shadow-xl relative flex-1 lg:mt-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-emerald-400">
                    {renderIcon(selectedPlace.iconName, 18)}
                  </div>
                  <h3 className="text-sm font-black text-white tracking-wider uppercase">
                    {selectedPlace.name}
                  </h3>
                </div>
                <span className="text-[0.625rem] text-gray-500 font-mono">
                  OBSERWACJA_CELU
                </span>
              </div>

              {/* Observation Sentences: large, readable, no bullets */}
              <p className="text-sm sm:text-base text-gray-100 font-sans leading-relaxed">
                {selectedPlace.observations}
              </p>

              {/* Ocena miejsca: strefa wyboru */}
              <ChoiceZone accent={accent} label="JAK OCENIASZ TO MIEJSCE?">
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'vulnerable', label: '🔴 SŁABY PUNKT', color: '#ff3366' },
                    { id: 'protected', label: '🟢 CHRONIONE', color: '#00ff66' }
                  ] as const).map((opt) => (
                    <ChoiceTile
                      key={opt.id}
                      accent={opt.color}
                      state={isSelectedEvaluated && selectedPlace.correctAssessment === opt.id ? 'selected' : 'idle'}
                      onClick={() => handleAssessment(opt.id)}
                      className="py-3 px-4 items-center"
                    >
                      <span className="font-bold text-xs sm:text-sm text-white">{opt.label}</span>
                    </ChoiceTile>
                  ))}
                </div>
              </ChoiceZone>

              {/* Feedback Banner */}
              {activeFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-2 animate-in fade-in ${
                    activeFeedback.type === 'success'
                      ? 'border-[#00ff66]/60 bg-[#00ff66]/15 text-[#00ff66]'
                      : 'border-amber-500/60 bg-amber-950/30 text-amber-200'
                  }`}
                >
                  {activeFeedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#00ff66]" />
                  ) : (
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                  )}
                  <span className="font-sans leading-relaxed">{activeFeedback.message}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-gray-800/80 gap-3">
        <div className="flex items-center space-x-2 text-xs sm:text-sm font-mono text-gray-400">
          <span>Stan rozpoznania:</span>
          <span className="text-white font-bold">
            {`Zbadano ${evaluatedCount}/${places.length}`}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!allEvaluated}
          className={`w-full sm:w-auto px-7 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
            allEvaluated
              ? 'bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95'
              : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 cursor-not-allowed'
          }`}
        >
          <span>DALEJ: PODEJMIJ DECYZJĘ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// KROK 3: ZDECYDUJ (DecisionStep)
// ---------------------------------------------------------------------------
interface DecisionStepProps {
  question: string;
  options: AttackVectorDecision[];
  accent: string;
  /** Podświetla trop w notatniku na prawym monitorze (null = zgaś). */
  onFlashClue: (placeId: string | null) => void;
  onComplete: () => void;
}

const DecisionStep: React.FC<DecisionStepProps> = ({
  question,
  options,
  accent,
  onFlashClue,
  onComplete
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [decisionFeedback, setDecisionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    pointsToClue?: boolean;
  } | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedOption = options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect === true;

  const handleSelectOption = (option: AttackVectorDecision) => {
    sounds.playClick();
    setSelectedOptionId(option.id);

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

    if (option.isCorrect) {
      sounds.playSuccess();
      onFlashClue(null);
      setDecisionFeedback({
        type: 'success',
        message: option.feedback
      });
    } else {
      sounds.playNotification();
      setDecisionFeedback({
        type: 'error',
        message: option.feedback,
        pointsToClue: !!option.relatedClueId
      });

      if (option.relatedClueId) {
        // Notatnik jest na prawym monitorze, dalej od wzroku gracza — miganie trwa dłużej.
        onFlashClue(option.relatedClueId);
        flashTimeoutRef.current = setTimeout(() => {
          onFlashClue(null);
        }, 4000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      onFlashClue(null);
    };
  }, [onFlashClue]);

  return (
    <div className="flex flex-col flex-1 space-y-4">
      {/* Attack Options Section */}
      <div className="p-4 rounded-xl border border-gray-800 bg-[#08121d]/95 flex flex-col space-y-3.5 shadow-xl flex-1">
        <div className="border-b border-gray-800 pb-2">
          <h3 className="text-sm font-black text-white tracking-wide uppercase">
            {question || 'Wskaż najskuteczniejszą drogę ataku na firmę PetroLog:'}
          </h3>
        </div>

        {/* 3 duże karty drogi ataku (bez liter A/B/C, bez żargonu) */}
        <ChoiceZone accent={accent} label="WYBIERZ DROGĘ ATAKU">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <ChoiceTile
                  key={option.id}
                  accent={accent}
                  state={
                    isSelected
                      ? option.isCorrect
                        ? 'correct'
                        : 'wrong'
                      : isCorrect
                      ? 'dimmed'
                      : 'idle'
                  }
                  markerPosition="corner"
                  onClick={() => handleSelectOption(option)}
                  className="p-4 h-full"
                >
                  <div className="space-y-2 pr-7">
                    <div className="p-2 rounded-lg border bg-gray-900 border-gray-800 text-gray-300 inline-flex">
                      {renderIcon(option.iconName, 22)}
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">{option.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{option.description}</p>
                  </div>
                </ChoiceTile>
              );
            })}
          </div>
        </ChoiceZone>

        {/* Feedback Banner */}
        {decisionFeedback && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
              decisionFeedback.type === 'success'
                ? 'border-[#00ff66] bg-[#00ff66]/15 text-[#00ff66]'
                : 'border-amber-500/60 bg-amber-950/40 text-amber-200'
            }`}
          >
            {decisionFeedback.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0 text-[#00ff66] mt-0.5" />
            ) : (
              <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-[0.6875rem] uppercase tracking-wider block">
                {decisionFeedback.type === 'success'
                  ? 'WEKTOR ZATWIERDZONY // SPEAR-PHISHING'
                  : 'OSTRZEŻENIE DARKSUN'}
              </span>
              <p className="text-xs leading-relaxed font-sans text-gray-100">
                {decisionFeedback.message}
              </p>
              {decisionFeedback.pointsToClue && (
                <p className="text-[0.6875rem] font-bold text-amber-300 tracking-wide">
                  TROP JEST PODŚWIETLONY W NOTATNIKU PO PRAWEJ ➔
                </p>
              )}
            </div>
          </div>
        )}

        {/* Transition button when correct */}
        {isCorrect && (
          <div className="pt-2 flex justify-end animate-in fade-in">
            <button
              onClick={onComplete}
              className="px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 cursor-pointer shadow-lg active:scale-95 bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 shadow-[0_0_25px_rgba(0,255,102,0.4)]"
            >
              <span>ZATWIERDŹ WEKTOR // PRZEJDŹ DALEJ</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// GŁÓWNY KOMPONENT TargetPetrologApp
// ---------------------------------------------------------------------------
export const TargetPetrologApp: React.FC<BlockProps<TargetPetrologConfig>> = ({
  config,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission?.mission?.accentColor) || '#00ff66';
  const companyName = config?.companyName || 'PETROLOG';

  const [phase, setPhase] = useState<
    'briefing' | 'loader_investigate' | 'investigate' | 'loader_decide' | 'decide'
  >('briefing');

  // Lifted state: decrypted cards in Step 1
  const [decryptedCardIds, setDecryptedCardIds] = useState<string[]>([]);

  // Evaluated places and notebook clues collected in Step 2
  const [evaluatedPlaces, setEvaluatedPlaces] = useState<
    Record<string, { assessment: AssessmentType; isCorrect: boolean }>
  >({});
  const [clues, setClues] = useState<NotebookClue[]>([]);
  // Trop podświetlony w notatniku (krok ZDECYDUJ, po błędnej odpowiedzi)
  const [flashingCluePlaceId, setFlashingCluePlaceId] = useState<string | null>(null);

  const facts = config?.briefing?.facts || [];
  const places = config?.investigation?.places || [];
  const decisionOptions = config?.decision?.options || [];
  const question = config?.decision?.question || 'Wskaż najskuteczniejszą drogę ataku na PetroLog:';

  const handleCardDecrypted = (factId: string) => {
    setDecryptedCardIds((prev) => (prev.includes(factId) ? prev : [...prev, factId]));
  };

  const handleEvaluatePlace = (placeId: string, assessment: AssessmentType) => {
    const place = places.find((p) => p.id === placeId);
    if (!place) return;

    setEvaluatedPlaces((prev) => ({
      ...prev,
      [placeId]: { assessment, isCorrect: assessment === place.correctAssessment }
    }));

    setClues((prev) => {
      const exists = prev.some((c) => c.placeId === placeId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: `clue_${placeId}`,
          placeId: place.id,
          placeName: place.name,
          text: place.clue,
          isWeakPoint: assessment === 'vulnerable'
        }
      ];
    });
  };

  // Determine current step index (0, 1, or 2)
  const stepIndex =
    phase === 'briefing'
      ? 0
      : phase === 'loader_investigate' || phase === 'investigate'
      ? 1
      : 2;

  // Single sentence command under progress bar
  const commandText =
    phase === 'briefing'
      ? config?.briefing?.instruction ||
        'Kliknij zaszyfrowane karty, aby odszyfrować kluczowe informacje o celu.'
      : phase === 'loader_investigate'
      ? 'Inicjalizacja modułu rozpoznania celu...'
      : phase === 'investigate'
      ? config?.investigation?.instruction ||
        'Zbadaj każde miejsce w firmie i oceń, czy jest słabym punktem, czy jest dobrze chronione.'
      : phase === 'loader_decide'
      ? 'Kompilacja ustaleń wywiadowczych...'
      : config?.decision?.instruction ||
        'Na podstawie ustaleń w notatniku wskaż optymalną drogę ataku na cel.';

  const steps = [
    { label: 'POZNAJ' },
    { label: 'ZBADAJ' },
    { label: 'ZDECYDUJ' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <AppHeader
        icon={Building}
        accent={accent}
        title={`//BAZA_CELU: ${companyName.toUpperCase()}`}
        subtitle="ROZPOZNANIE OPERACYJNE CELU"
        task={commandText}
        // Postęp w 3 krokach: 1 POZNAJ · 2 ZBADAJ · 3 ZDECYDUJ
        aside={
          <div className="flex items-center space-x-2 text-xs font-mono pointer-events-none">
            {steps.map((st, i) => {
              const isCompleted = stepIndex > i;
              const isCurrent = stepIndex === i;

              return (
                <React.Fragment key={st.label}>
                  {i > 0 && <span className="text-gray-600 select-none">·</span>}
                  <span
                    className={`px-2.5 py-1 rounded font-bold transition-all ${
                      isCurrent
                        ? 'text-white border shadow-md'
                        : isCompleted
                        ? 'text-[#00ff66] bg-[#00ff66]/10'
                        : 'text-gray-600 bg-gray-900/40'
                    }`}
                    style={
                      isCurrent
                        ? {
                            borderColor: accent,
                            color: '#ffffff',
                            backgroundColor: `${accent}33`,
                            boxShadow: `0 0 10px ${accent}40`
                          }
                        : isCompleted
                        ? { color: accent }
                        : undefined
                    }
                  >
                    {isCompleted ? `✓ ${st.label}` : `${i + 1} ${st.label}`}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        }
      />

      {/* Notatnik śledczy na prawym monitorze — od kroku ZBADAJ do końca etapu */}
      {phase !== 'briefing' && (
        <SideMonitor>
          <InvestigationNotebook
            clues={clues}
            totalPlaces={places.length}
            flashingPlaceId={flashingCluePlaceId}
            accent={accent}
          />
        </SideMonitor>
      )}

      {/* Body Content based on Phase */}
      {phase === 'briefing' && (
        <BriefingStep
          facts={facts}
          decryptedIds={decryptedCardIds}
          onCardDecrypted={handleCardDecrypted}
          accent={accent}
          onNext={() => setPhase('loader_investigate')}
        />
      )}

      {phase === 'loader_investigate' && (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <ModuleLoader
            label="ŁADOWANIE MODUŁU: PLAN PRZEDSIĘBIORSTWA..."
            durationMs={1000}
            accent={accent}
            onDone={() => setPhase('investigate')}
          />
        </div>
      )}

      {phase === 'investigate' && (
        <InvestigationStep
          places={places}
          evaluatedPlaces={evaluatedPlaces}
          accent={accent}
          onEvaluate={handleEvaluatePlace}
          onNext={() => setPhase('loader_decide')}
        />
      )}

      {phase === 'loader_decide' && (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <ModuleLoader
            label="ŁADOWANIE MODUŁU: ANALIZA WEKTORA ATAKU..."
            durationMs={1000}
            accent={accent}
            onDone={() => setPhase('decide')}
          />
        </div>
      )}

      {phase === 'decide' && (
        <DecisionStep
          question={question}
          options={decisionOptions}
          accent={accent}
          onFlashClue={setFlashingCluePlaceId}
          onComplete={onComplete}
        />
      )}
    </div>
  );
};
