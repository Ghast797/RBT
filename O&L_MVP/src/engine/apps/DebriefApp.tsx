import React, { useState } from 'react';
import { Trophy, CheckCircle, AlertTriangle, XCircle, Award, ChevronDown, ChevronUp, RotateCcw, BookOpen, CheckCheck, ExternalLink, Send, ShieldCheck, X } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';

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
    isKnowledgeBaseOpen,
    toggleKnowledgeBase,
    playerChoices,
    resetGame,
    isScormSubmitted,
    isExitModalOpen,
    submitScormAndExit,
    closeExitModal,
    openExitModal,
    openRetryModal
  } = useMissionStore();

  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isCloseAttempted, setIsCloseAttempted] = useState<boolean>(false);

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
    } catch (e) {}

    // 3. Try standard window.close()
    try {
      window.close();
    } catch (e) {}

    // 4. Try self window trick
    try {
      window.open('', '_self')?.close();
    } catch (e) {}

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
  const slides = activeMission.step6?.educationalSlides || [];

  return (
    <div className="flex flex-col h-full bg-[#050b10] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl p-4 space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-[#00ff66]/15 via-[#081219] to-[#00ff66]/15 border-2 border-[#00ff66] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(0,255,102,0.25)]">
        <div>
          <div className="text-[10px] text-[#00ff66]/70 uppercase tracking-widest font-black">
            {summary.company} // RAPORT KOŃCOWY
          </div>
          <h1 className="text-lg font-black text-[#00ff66] tracking-wider text-glow-green">
            {summary.title} – {summary.subtitle}
          </h1>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          {/* Card 1: Idealne */}
          <div className="px-3 py-1.5 bg-[#081219] border border-[#00ff66] rounded text-center">
            <div className="flex items-center justify-center space-x-1 text-[#00ff66]">
              <CheckCircle size={13} />
              <span className="text-sm font-black">{perfectChoicesCount}</span>
            </div>
            <div className="text-[9px] text-[#00ff66]/70 font-bold uppercase">IDEALNE</div>
          </div>

          {/* Card 2: Dobre */}
          <div className="px-3 py-1.5 bg-[#081219] border border-[#facc15] rounded text-center">
            <div className="flex items-center justify-center space-x-1 text-[#facc15]">
              <AlertTriangle size={13} />
              <span className="text-sm font-black">{goodChoicesCount}</span>
            </div>
            <div className="text-[9px] text-[#facc15]/70 font-bold uppercase">DOBRE</div>
          </div>

          {/* Card 3: Błędy */}
          <div className="px-3 py-1.5 bg-[#081219] border border-[#ff3366] rounded text-center">
            <div className="flex items-center justify-center space-x-1 text-[#ff3366]">
              <XCircle size={13} />
              <span className="text-sm font-black">{criticalErrorsCount}</span>
            </div>
            <div className="text-[9px] text-[#ff3366]/70 font-bold uppercase">BŁĘDY</div>
          </div>

          {/* Card 4: Odznaka */}
          <div className="px-3 py-1.5 bg-[#081219] border border-[#00f0ff] rounded text-center">
            <div className="flex items-center justify-center text-[#00f0ff]">
              <Trophy size={14} />
            </div>
            <div className="text-[9px] text-[#00f0ff] font-bold uppercase">{score}%</div>
          </div>
        </div>
      </div>

      {/* Score bar & BTC earnings */}
      <div className="p-3 bg-[#081219] border border-[#00ff66]/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="font-bold text-[#00ff66] text-sm">{score}%</span>
          <div className="w-48 h-2.5 bg-[#050a0f] border border-[#00ff66]/40 rounded-full overflow-hidden">
            <div
              className={`h-full shadow-[0_0_10px_#00ff66] ${score >= 80 ? 'bg-[#00ff66]' : 'bg-[#ff3366]'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 uppercase">MAKSYMALNEGO WYNIKU</span>
        </div>

        <div className="flex items-center space-x-2 text-amber-300 font-black text-sm">
          <span>OTRZYMANE BITCOINY:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50">
            +{btcReward.toFixed(2)} ₿
          </span>
        </div>
      </div>

      {/* xAPI & SCORM 2004 Delivery Status Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="px-3 py-1.5 bg-[#050b10] border border-[#00ff66]/20 rounded text-[#00ff66] flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <CheckCheck size={14} className="text-[#00ff66]" />
            <span>xAPI: "passed", score: {score}%</span>
          </span>
          <span className="text-[10px] text-gray-500">IEEE xAPI</span>
        </div>

        <div className={`px-3 py-1.5 rounded flex items-center justify-between border ${
          isScormSubmitted
            ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]'
            : 'bg-[#081219] border-blue-900/40 text-blue-300'
        }`}>
          <span className="flex items-center space-x-1.5">
            <ShieldCheck size={14} className={isScormSubmitted ? 'text-[#00f0ff]' : 'text-blue-400'} />
            <span>
              {isScormSubmitted
                ? `SCORM 2004: Zapisano (${score} pkt, ${score >= 70 ? 'passed' : 'failed'})`
                : 'SCORM 2004: Gotowy do zapisu w Moodle'}
            </span>
          </span>
          <span className="text-[10px] text-gray-500 font-bold">4th EDITION</span>
        </div>
      </div>

      {/* Main Container: 8 Choice Reviews or Knowledge Base */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5">
        {!isKnowledgeBaseOpen ? (
          /* Detailed 8 Choices Review with Accordion */
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#00ff66] uppercase tracking-wider mb-1">
              TWOJE WYBORY ({choices.length}/8):
            </div>

            {choices.map((c, idx) => {
              const isExpanded = expandedChoiceIndex === idx;
              const outcome = c.outcome || (c.isCorrect ? 'ideal' : 'critical');
              const isIdeal = outcome === 'ideal';
              const isSuboptimal = outcome === 'suboptimal';

              return (
                <div
                  key={c.num}
                  className={`p-3 rounded-lg space-y-2 transition-all border ${
                    isIdeal
                      ? 'bg-[#081219] border-[#00ff66]/40 shadow-sm'
                      : isSuboptimal
                      ? 'bg-[#141208] border-[#facc15]/50 shadow-[0_0_10px_rgba(250,204,21,0.15)]'
                      : 'bg-[#14080e] border-[#ff3366]/50 shadow-[0_0_10px_rgba(255,51,102,0.15)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`font-bold ${
                        isIdeal ? 'text-[#00ff66]' : isSuboptimal ? 'text-[#facc15]' : 'text-[#ff3366]'
                      }`}>
                        WYBÓR {c.num}:
                      </span>
                      <span className="text-gray-300">{c.question}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1 ${
                          isIdeal
                            ? 'bg-[#00ff66]/15 border-[#00ff66]/40 text-[#00ff66]'
                            : isSuboptimal
                            ? 'bg-[#facc15]/15 border-[#facc15]/40 text-[#facc15]'
                            : 'bg-[#ff3366]/15 border-[#ff3366]/40 text-[#ff3366]'
                        }`}
                      >
                        <span>
                          {isIdeal
                            ? '[IDEALNY WYBÓR]'
                            : isSuboptimal
                            ? '[DOBRY, ALE NIEIDEALNY WYBÓR]'
                            : '[BŁĄD KRYTYCZNY]'}
                        </span>
                        {c.btcPenalty && (
                          <span className="text-amber-300 ml-1 font-black">
                            ({c.btcPenalty > 0 ? `-${c.btcPenalty}` : c.btcPenalty} ₿)
                          </span>
                        )}
                      </span>

                      <button
                        onClick={() => toggleChoiceDetails(idx)}
                        className="px-2.5 py-1 rounded bg-[#050a0f] border border-[#00ff66]/40 text-[#00ff66] text-[10px] font-bold flex items-center space-x-1 hover:bg-[#00ff66]/15 transition-all"
                      >
                        <span>SZCZEGÓŁY</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`text-xs font-bold pl-4 border-l-2 ${
                      isIdeal
                        ? 'text-white border-[#00ff66]'
                        : isSuboptimal
                        ? 'text-amber-100 border-[#facc15]'
                        : 'text-red-200 border-[#ff3366]'
                    }`}
                  >
                    TWOJA ODPOWIEDŹ:{' '}
                    <span className={isIdeal ? 'text-[#00ff66]' : isSuboptimal ? 'text-[#facc15]' : 'text-[#ff3366]'}>
                      {c.answer}
                    </span>
                  </div>

                  {isExpanded && (
                    <div
                      className={`p-2.5 rounded text-[11px] leading-relaxed mt-2 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isIdeal
                          ? 'bg-[#050a0f] border-slate-800 text-gray-300'
                          : isSuboptimal
                          ? 'bg-[#1b1708] border-[#facc15]/30 text-amber-100'
                          : 'bg-[#1b080f] border-[#ff3366]/30 text-red-100'
                      }`}
                    >
                      <div className="flex-1">{c.details}</div>
                      {!c.isCorrect && (
                        <button
                          onClick={openRetryModal}
                          className="self-start sm:self-auto px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 text-yellow-300 rounded font-bold text-[10px] uppercase tracking-wider transition-all flex items-center space-x-1 shrink-0 shadow-sm"
                        >
                          <RotateCcw size={11} />
                          <span>POWTÓRZ ZADANIE</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Baza Wiedzy: Educational Slides (matching Scenariusz.txt) */
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#00ff66] uppercase tracking-wider">
              BAZA WIEDZY EDUKACYJNEJ:
            </div>

            <div className="p-4 bg-[#081219] border-2 border-[#00ff66] rounded-xl space-y-3">
              <div className="text-xs font-bold text-[#00ff66] uppercase">
                SLAJD {activeSlideIdx + 1} / {slides.length}: {slides[activeSlideIdx].title}
              </div>

              <p className="text-xs text-gray-200 leading-relaxed">
                {slides[activeSlideIdx].desc}
              </p>

              <div className="flex justify-between pt-2 border-t border-[#00ff66]/20">
                <button
                  onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
                  disabled={activeSlideIdx === 0}
                  className="px-3 py-1 bg-[#050a0f] border border-[#00ff66]/40 text-[#00ff66] rounded text-xs disabled:opacity-30"
                >
                  POPRZEDNI
                </button>
                <button
                  onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
                  disabled={activeSlideIdx === slides.length - 1}
                  className="px-3 py-1 bg-[#050a0f] border border-[#00ff66]/40 text-[#00ff66] rounded text-xs disabled:opacity-30"
                >
                  NASTĘPNY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-2 border-t border-[#00ff66]/20 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={openRetryModal}
          className="px-3.5 py-2 bg-[#ff3366]/20 hover:bg-[#ff3366]/30 border border-[#ff3366] text-[#ff3366] rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5"
        >
          <RotateCcw size={14} />
          <span>POWTÓRZ ZADANIE</span>
        </button>

        {/* Moodle SCORM Submit / Exit Button */}
        {!isScormSubmitted ? (
          <button
            onClick={submitScormAndExit}
            className="px-5 py-2 bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#00f0ff] text-[#05080c] font-black text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse"
          >
            <Send size={14} />
            <span>PRZEŚLIJ WYNIK DO MOODLE I ZAKOŃCZ</span>
          </button>
        ) : (
          <button
            onClick={openExitModal}
            className="px-5 py-2 bg-[#00f0ff]/20 border-2 border-[#00f0ff] text-[#00f0ff] font-black text-xs uppercase tracking-wider rounded-lg hover:bg-[#00f0ff]/30 transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <ShieldCheck size={14} />
            <span>WYNIK W MOODLE // ZAMKNIJ OKNO</span>
          </button>
        )}

        <button
          onClick={toggleKnowledgeBase}
          className="px-3.5 py-2 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00ff66]/90 transition-all flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,255,102,0.4)]"
        >
          <BookOpen size={14} />
          <span>{isKnowledgeBaseOpen ? 'POWRÓT DO WYBORÓW' : 'BAZA WIEDZY >>'}</span>
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
              <div className="text-[10px] text-[#00f0ff] font-bold uppercase tracking-widest">
                SCORM 2004 (4th EDITION) // MOODLE LMS
              </div>
              <h2 className="text-base font-black text-white tracking-wide mt-1">
                WYNIK ZOSTAŁ PRZESŁANY DO DZIENNIKA OCEN
              </h2>
            </div>

            <div className="p-3 bg-[#050a0f] border border-[#00ff66]/40 rounded-xl space-y-2 text-left text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400">STATUS ZALICZENIA:</span>
                <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                  score >= 70 ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50' : 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/50'
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
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Zabezpieczenia przeglądarek (Chrome, Edge, Firefox) nie pozwalają skryptom na automatyczne zamykanie otwartych kart.
                </p>
                <div className="p-2.5 bg-[#050a0f] border border-amber-500/40 rounded text-center space-y-1.5 shadow-inner">
                  <div className="text-[11px] font-bold text-[#00ff66]">
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
                      } catch (e) {}
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
                <p className="text-[11px] text-gray-300 leading-relaxed">
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
