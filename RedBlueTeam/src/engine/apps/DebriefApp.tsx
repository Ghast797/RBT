import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  X,
  MessageSquareQuote,
  Terminal,
  Crosshair,
  CloudUpload,
  LogOut
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { resolveDecisionCount } from '../core/scoring';
import { scorm2004 } from '../scorm/scorm2004';

export const DebriefApp: React.FC = () => {
  const {
    activeMission,
    score,
    btcReward,
    perfectChoicesCount,
    goodChoicesCount,
    criticalErrorsCount,
    expandedChoiceIndex,
    toggleChoiceDetails,
    playerChoices,
    isScormSubmitted,
    isExitModalOpen,
    submitScormAndExit,
    closeExitModal,
    openExitModal,
    openRetryModal
  } = useMissionStore();
  const isMockScorm = scorm2004.isUsingMock();

  const [hasExited, setHasExited] = useState<boolean>(false);
  const [isCloseAttempted, setIsCloseAttempted] = useState<boolean>(false);
  const [transcriptNum, setTranscriptNum] = useState<number | null>(null);

  const handleCloseTab = () => {
    // 1. Focus the opener window (Moodle course page)
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.focus();
      }
    } catch (e) {
      console.warn('Could not focus opener:', e);
    }

    // 2. Try window.top.close() (if framed)
    try {
      if (window.top && window.top !== window) {
        window.top.close();
      }
    } catch (e) { }

    // 3. Try standard window.close()
    try {
      window.close();
    } catch (e) { }

    // 4. Try self window trick
    try {
      window.open('', '_self')?.close();
    } catch (e) { }

    // 5. Update UI if browser security blocked closing
    setIsCloseAttempted(true);
  };

  const summary = activeMission.step6?.summary || {
    title: 'SUKCES',
    subtitle: `UKOŃCZONO ${activeMission.mission.title}`,
    company: activeMission.mission.targetCompany,
    scorePercent: 100,
    perfectChoices: playerChoices.length,
    goodChoices: 0,
    criticalErrors: 0,
    btcReward: activeMission.mission.rewardBtc
  };
  const choices = playerChoices;
  const totalDecisions = resolveDecisionCount(activeMission);
  const lessonFor = (num: number) => activeMission.step6?.choices?.find((sc) => sc.num === num);

  const outcomeOf = (c: (typeof choices)[number]) => c.outcome || (c.isCorrect ? 'ideal' : 'critical');

  // Wybrana decyzja: ta, którą gracz kliknął (stan w store), a domyślnie pierwsza z błędem
  // (najwięcej do nauczenia się), inaczej pierwsza.
  const firstNonIdeal = choices.findIndex((c) => outcomeOf(c) !== 'ideal');
  const defaultIdx = firstNonIdeal >= 0 ? firstNonIdeal : 0;
  const selectedIdx =
    expandedChoiceIndex !== null && expandedChoiceIndex < choices.length ? expandedChoiceIndex : defaultIdx;
  const selected = choices[selectedIdx];

  const selectDecision = (idx: number) => {
    // `toggleChoiceDetails` przełącza; przy innym indeksie po prostu go ustawia.
    if (expandedChoiceIndex !== idx) toggleChoiceDetails(idx);
    setTranscriptNum(null);
  };

  const tone = (outcome: string) =>
    outcome === 'ideal'
      ? {
          text: 'text-[#00ff66]',
          border: 'border-[#00ff66]/40',
          bg: 'bg-[#081219]',
          badge: 'bg-[#00ff66]/15 border-[#00ff66]/40 text-[#00ff66]',
          answerBorder: 'text-white border-[#00ff66]',
          label: '[IDEALNY WYBÓR]',
          short: 'IDEALNY'
        }
      : outcome === 'suboptimal'
        ? {
            text: 'text-[#facc15]',
            border: 'border-[#facc15]/50',
            bg: 'bg-[#141208]',
            badge: 'bg-[#facc15]/15 border-[#facc15]/40 text-[#facc15]',
            answerBorder: 'text-amber-100 border-[#facc15]',
            label: '[DOBRY, ALE NIEIDEALNY WYBÓR]',
            short: 'DOBRY'
          }
        : {
            text: 'text-[#ff3366]',
            border: 'border-[#ff3366]/50',
            bg: 'bg-[#14080e]',
            badge: 'bg-[#ff3366]/15 border-[#ff3366]/40 text-[#ff3366]',
            answerBorder: 'text-red-200 border-[#ff3366]',
            label: '[BŁĄD KRYTYCZNY]',
            short: 'BŁĄD'
          };

  const outcomeIcon = (outcome: string, size = 14) =>
    outcome === 'ideal' ? (
      <CheckCircle size={size} />
    ) : outcome === 'suboptimal' ? (
      <AlertTriangle size={size} />
    ) : (
      <XCircle size={size} />
    );

  const handleExit = () => {
    if (hasExited) {
      openExitModal();
      return;
    }
    submitScormAndExit();
    setHasExited(true);
  };

  // Szczegóły wybranej decyzji (prawy panel raportu).
  const renderDetail = () => {
    if (!selected) {
      return (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 text-center p-4">
          Brak zgłoszonych decyzji do omówienia.
        </div>
      );
    }
    const outcome = outcomeOf(selected);
    const t = tone(outcome);
    const lesson = lessonFor(selected.num);
    const hasLesson = !!(lesson?.attack || lesson?.defense);
    const transcript = selected.negotiationTranscript || lesson?.negotiationTranscript;

    return (
      <div className={`flex-1 min-h-0 px-2.5 py-2 rounded-lg border flex flex-col gap-1 overflow-y-auto ${t.bg} ${t.border}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`text-xs font-black uppercase tracking-wider ${t.text}`}>
            {hasLesson ? 'WYBÓR' : 'SZCZEGÓŁY: WYBÓR'} {selected.num}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1.5 ${t.badge}`}>
            {outcomeIcon(outcome, 12)}
            <span>{t.label}</span>
            {selected.btcPenalty && (
              <span className="text-amber-300 font-black">
                ({selected.btcPenalty > 0 ? `-${selected.btcPenalty}` : selected.btcPenalty} ₿)
              </span>
            )}
          </span>
        </div>

        <div className="text-xs text-gray-200 font-bold leading-snug">{selected.question}</div>

        <div className={`text-xs font-bold pl-3 border-l-2 leading-snug ${t.answerBorder}`}>
          TWOJA ODPOWIEDŹ: <span className={t.text}>{selected.answer}</span>
        </div>

        <div
          className={`px-2 py-1.5 rounded border text-xs leading-snug flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            outcome === 'ideal'
              ? 'bg-[#050a0f] border-slate-800 text-gray-300'
              : outcome === 'suboptimal'
                ? 'bg-[#1b1708] border-[#facc15]/30 text-amber-100'
                : 'bg-[#1b080f] border-[#ff3366]/30 text-red-100'
          }`}
        >
          <div className="flex-1">
            <span className="mr-1.5 font-black uppercase text-xs text-gray-400">Twoja decyzja:</span>
            <span className="font-sans">{selected.details}</span>
          </div>
          {!selected.isCorrect && (
            <button
              onClick={openRetryModal}
              className="self-start sm:self-auto px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 text-yellow-300 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1 shrink-0 shadow-sm"
            >
              <RotateCcw size={12} />
              <span>POWTÓRZ ZADANIE</span>
            </button>
          )}
        </div>

        {lesson?.attack && (
          <div className="px-2 py-1.5 rounded border border-[#ff3366]/40 bg-[#ff3366]/10 text-red-100 flex items-start gap-2 text-xs leading-snug">
            <Crosshair size={14} className="text-[#ff3366] shrink-0 mt-0.5" />
            <div>
              <span className="mr-1.5 font-black uppercase text-xs text-[#ff3366]">
                Atak — dlaczego to zadziałało:
              </span>
              <span className="font-sans">{lesson.attack}</span>
            </div>
          </div>
        )}

        {lesson?.defense && (
          <div className="px-2 py-1.5 rounded border border-[#3b82f6]/50 bg-[#3b82f6]/10 text-blue-100 flex items-start gap-2 text-xs leading-snug">
            <ShieldCheck size={14} className="text-[#3b82f6] shrink-0 mt-0.5" />
            <div>
              <span className="mr-1.5 font-black uppercase text-xs text-[#60a5fa]">
                Obrona — jak to rozpoznać i co zrobić:
              </span>
              <span className="font-sans">{lesson.defense}</span>
            </div>
          </div>
        )}

        {transcript && transcript.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setTranscriptNum(selected.num)}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-sm"
            >
              <MessageSquareQuote size={13} />
              <span>POKAŻ PRZEBIEG NEGOCJACJI</span>
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Przebieg negocjacji (D10 / Misja 4): pełny panel z turami obok siebie, bez przewijania.
  const renderTranscript = () => {
    const c = choices.find((x) => x.num === transcriptNum);
    if (!c) return null;
    const transcript = c.negotiationTranscript || lessonFor(c.num)?.negotiationTranscript;
    if (!transcript || transcript.length === 0) return null;
    return (
      <div className="absolute inset-0 z-10 p-3 rounded-xl border border-cyan-500/40 bg-[#06131c] flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 shrink-0 gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
            <Terminal size={13} />
            <span>//ZAPIS_AUDIO_I_CZATU: PRZEBIEG NEGOCJACJI Z SZEFEM IT (3 TURY)</span>
          </span>
          <button
            type="button"
            onClick={() => setTranscriptNum(null)}
            className="px-3 py-1 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shrink-0"
          >
            <ChevronLeft size={13} />
            <span>UKRYJ PRZEBIEG NEGOCJACJI</span>
          </button>
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-y-auto lg:overflow-hidden">
          {transcript.map((turn) => (
            <div key={turn.turn} className="p-2 rounded-lg border border-gray-800 bg-black/40 flex flex-col gap-1.5 min-h-0 overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {turn.title}
                </span>
                <span className="text-xs text-gray-400 font-mono">TURA 0{turn.turn}</span>
              </div>
              <div className="p-2 rounded bg-red-950/20 border border-red-500/30 text-red-200 text-xs leading-snug">
                <span className="text-xs uppercase font-bold text-red-400 block mb-0.5">SZEF IT:</span>
                <span className="font-sans">{turn.opponent}</span>
              </div>
              <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs leading-snug">
                <span className="text-xs uppercase font-bold text-emerald-400 block mb-0.5">TWOJA ODPOWIEDŹ:</span>
                <span className="font-sans">{turn.player}</span>
              </div>
              <div className="p-2 rounded bg-purple-950/20 border border-purple-500/30 text-purple-200 text-xs flex items-start space-x-2 leading-snug">
                <span className="text-purple-400 shrink-0">🧠</span>
                <div className="font-sans">
                  <strong className="text-purple-300">Komentarz psychologiczny: </strong>
                  <span>{turn.psychology}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full bg-[#050b10] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl p-2 gap-1.5">
      {/* Nagłówek: tytuł raportu + liczniki wyników w jednej linii */}
      <div className="px-3 py-1.5 bg-gradient-to-r from-[#00ff66]/15 via-[#081219] to-[#00ff66]/15 border-2 border-[#00ff66] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_0_25px_rgba(0,255,102,0.25)] shrink-0">
        <div className="min-w-0">
          <div className="text-xs text-[#00ff66]/70 uppercase tracking-widest font-black">
            {summary.company} // RAPORT KOŃCOWY
          </div>
          <h1 className="text-base font-black text-[#00ff66] tracking-wider text-glow-green leading-tight">
            {summary.title} – {summary.subtitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <div className="px-2.5 py-1 bg-[#081219] border border-[#00ff66] rounded flex items-center gap-1.5 text-[#00ff66]">
            <CheckCircle size={13} />
            <span className="text-sm font-black">{perfectChoicesCount}</span>
            <span className="text-xs font-bold uppercase text-[#00ff66]/70">IDEALNE</span>
          </div>
          <div className="px-2.5 py-1 bg-[#081219] border border-[#facc15] rounded flex items-center gap-1.5 text-[#facc15]">
            <AlertTriangle size={13} />
            <span className="text-sm font-black">{goodChoicesCount}</span>
            <span className="text-xs font-bold uppercase text-[#facc15]/70">DOBRE</span>
          </div>
          <div className="px-2.5 py-1 bg-[#081219] border border-[#ff3366] rounded flex items-center gap-1.5 text-[#ff3366]">
            <XCircle size={13} />
            <span className="text-sm font-black">{criticalErrorsCount}</span>
            <span className="text-xs font-bold uppercase text-[#ff3366]/70">BŁĘDY</span>
          </div>
          <div className="px-2.5 py-1 bg-[#081219] border border-[#00f0ff] rounded flex items-center gap-1.5 text-[#00f0ff]">
            <Trophy size={14} />
            <span className="text-sm font-black">{score}%</span>
          </div>
        </div>
      </div>

      {/* Pasek wyniku, zapis w Moodle i BTC */}
      <div className="px-3 py-1 bg-[#081219] border border-[#00ff66]/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="font-bold text-[#00ff66] text-sm">{score}%</span>
          <div className="w-40 h-2.5 bg-[#050a0f] border border-[#00ff66]/40 rounded-full overflow-hidden">
            <div
              className={`h-full shadow-[0_0_10px_#00ff66] ${score >= 80 ? 'bg-[#00ff66]' : 'bg-[#ff3366]'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 uppercase">MAKSYMALNEGO WYNIKU</span>
        </div>

        <div
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border text-xs font-bold uppercase whitespace-nowrap ${isScormSubmitted
              ? 'border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff]'
              : 'border-gray-600 bg-black/30 text-gray-400'
            }`}
        >
          {isScormSubmitted ? <CheckCircle size={12} /> : <CloudUpload size={12} />}
          <span>
            {isScormSubmitted
              ? `WYNIK ZAPISANY W MOODLE${isMockScorm ? ' (TRYB TESTOWY)' : ''}`
              : 'WYNIK JESZCZE NIEZAPISANY'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-amber-300 font-black text-sm whitespace-nowrap">
          <span>OTRZYMANE BITCOINY:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50">
            +{btcReward.toFixed(2)} ₿
          </span>
        </div>
      </div>

      {/* Decyzje gracza: lista po lewej, lekcja atak / obrona wybranej decyzji po prawej (bez przewijania) */}
      <div className="relative flex-1 min-h-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 shrink-0">
          <div className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
            TWOJE WYBORY ({choices.length}/{totalDecisions}):
          </div>
          <div className="text-xs text-gray-400 uppercase">
            Wybierz decyzję: jak zadziałał atak i jak się przed nim bronić
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-2 max-md:overflow-y-auto">
          <div className="min-h-0 flex flex-col gap-1">
            {choices.map((c, idx) => {
              const outcome = outcomeOf(c);
              const t = tone(outcome);
              const isSel = idx === selectedIdx;
              return (
                <button
                  key={c.num}
                  type="button"
                  onClick={() => selectDecision(idx)}
                  aria-pressed={isSel}
                  title={`${t.short}: ${c.question}`}
                  className={`flex-1 basis-0 min-h-[2.25rem] max-h-[3.25rem] text-left px-2 py-1 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${t.bg} ${t.border} ${
                    isSel ? 'ring-2 ring-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.35)]' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className={`shrink-0 flex items-center gap-1 text-xs font-black ${t.text}`}>
                    {outcomeIcon(outcome, 14)}
                    <span>{c.num}</span>
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-xs text-gray-300 truncate">{c.question}</span>
                    <span className={`block text-xs font-bold truncate ${t.text}`}>{c.answer}</span>
                  </span>
                  <ChevronRight size={14} className={`shrink-0 ${isSel ? 'text-[#00f0ff]' : 'text-gray-600'}`} />
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex flex-col">{renderDetail()}</div>
        </div>

        {transcriptNum !== null && renderTranscript()}
      </div>

      {/* Dolna nawigacja */}
      <div className="pt-1.5 border-t border-[#00ff66]/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <button
          onClick={openRetryModal}
          className="px-3.5 py-1.5 bg-[#ff3366]/20 hover:bg-[#ff3366]/30 border border-[#ff3366] text-[#ff3366] rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5"
        >
          <RotateCcw size={14} />
          <span>POWTÓRZ ZADANIE</span>
        </button>

        <div className="hidden lg:flex flex-1 min-w-0 items-center gap-2 px-2 text-xs text-gray-300">
          <BookOpen size={14} className="text-[#00ff66] shrink-0" />
          <span className="leading-snug">
            Pełny materiał z tej misji i pytania kontrolne znajdziesz w kursie Moodle, pod tą aktywnością.
          </span>
        </div>

        <button
          onClick={handleExit}
          className="px-5 py-1.5 bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#00f0ff] text-[#05080c] font-black text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
        >
          <LogOut size={14} />
          <span>ZAKOŃCZ I WRÓĆ DO MOODLE</span>
        </button>
      </div>

      {/* Cyber-UI SCORM Exit Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07111a] border-2 border-[#00f0ff] rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-[0_0_40px_rgba(0,240,255,0.35)] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeExitModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded transition-colors"
              title="Zamknij okno"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#00f0ff]/15 border-2 border-[#00f0ff] flex items-center justify-center mx-auto text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <Award size={32} />
            </div>

            <div>
              <div className="text-xs text-[#00f0ff] font-bold uppercase tracking-widest">
                SCORM 2004 (4th EDITION) // MOODLE LMS
              </div>
              <h2 className="text-base font-black text-white tracking-wide mt-1">
                WYNIK ZOSTAŁ PRZESŁANY DO DZIENNIKA OCEN
              </h2>
            </div>

            <div className="p-3 bg-[#050a0f] border border-[#00ff66]/40 rounded-xl space-y-2 text-left text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">STATUS ZALICZENIA:</span>
                <span className={`font-black px-2 py-0.5 rounded text-xs ${score >= 70 ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50' : 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/50'
                  }`}>
                  {score >= 70 ? 'ZALICZONO (PASSED)' : 'NIEZALICZONO (FAILED)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">OCENA PUNKTOWA:</span>
                <span className="text-[#00ff66] font-black">{score} / 100 PKT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">ZAPISANE INTERAKCJE:</span>
                <span className="text-gray-200 font-bold">{choices.length} DECYZJI CMI</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">STATUS SESJI:</span>
                <span className="text-blue-300 font-bold">TERMINATED & COMMITTED</span>
              </div>
            </div>

            {isCloseAttempted ? (
              <div className="p-3.5 bg-amber-500/10 border-2 border-amber-400/80 rounded-xl space-y-3 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                  <AlertTriangle size={18} className="shrink-0 text-amber-400" />
                  <span>PRZEGLĄDARKA ZABLOKOWAŁA AUTOMATYCZNE ZAMKNIĘCIE KARTY</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Zabezpieczenia przeglądarek (Chrome, Edge, Firefox) nie pozwalają skryptom na automatyczne zamykanie otwartych kart.
                </p>
                <div className="p-2.5 bg-[#050a0f] border border-amber-500/40 rounded text-center space-y-1.5 shadow-inner">
                  <div className="text-xs font-bold text-[#00ff66]">
                    ✓ TWÓJ WYNIK ZOSTAŁ JUŻ W 100% ZAPISANY W MOODLE!
                  </div>
                  <div className="text-xs font-mono font-black text-white">
                    👉 Wciśnij skrót klawiszowy: <span className="px-2 py-0.5 bg-slate-800 border border-slate-600 rounded text-amber-300">Ctrl + W</span> (lub kliknij <span className="text-red-400 font-bold">X</span> na karcie u góry)
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1 justify-center">
                  <button
                    onClick={() => {
                      try {
                        if (window.opener && !window.opener.closed) {
                          window.opener.focus();
                        }
                      } catch (e) { }
                    }}
                    className="px-4 py-2 bg-[#00f0ff] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00f0ff]/90 transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  >
                    <ExternalLink size={14} />
                    <span>PRZEŁĄCZ NA KARTĘ MOODLE</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCloseAttempted(false);
                      closeExitModal();
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded transition-all"
                  >
                    WRÓĆ DO RAPORTU
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Dane zostały pomyślnie utrwalone w bazie Moodle. Przeglądarka zarejestrowała Twoją próbę. Możesz bezpiecznie zamknąć tę kartę.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={handleCloseTab}
                    className="px-5 py-2.5 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#00ff66]/90 transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_15px_#00ff66]"
                  >
                    <ExternalLink size={14} />
                    <span>ZAMKNIJ KARTĘ I WRÓĆ DO MOODLE</span>
                  </button>
                  <button
                    onClick={closeExitModal}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
                  >
                    WRÓĆ DO RAPORTU
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
