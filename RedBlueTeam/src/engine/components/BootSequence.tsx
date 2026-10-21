import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, Terminal, ChevronRight } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';

export const BootSequence: React.FC = () => {
  const {
    activeMission,
    bootStage,
    introDialogIndex,
    acceptIncomingCall,
    nextIntroDialog,
    startBiosBoot,
    finishBiosBoot
  } = useMissionStore();

  const [biosLineCount, setBiosLineCount] = useState<number>(0);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const introDialogue = activeMission.intro?.dialogue || [];
  const currentDialog = introDialogue[introDialogIndex] || { id: '', text: '', playerResponse: '' };
  const biosLines = activeMission.intro?.biosLines || [];
  const callerName = activeMission.intro?.callerName || 'BYTE_MASTER';
  const callStatus = activeMission.intro?.callStatus || 'POŁĄCZENIE PRZYCHODZĄCE (TOR v3)';

  useEffect(() => {
    setSelectedOptionId(null);
  }, [introDialogIndex]);

  // Handle BIOS typewriter effect & progress bar
  useEffect(() => {
    if (bootStage !== 'bios_boot') return;

    if (biosLineCount < biosLines.length) {
      const timer = setTimeout(() => {
        sounds.playClick(1200, 0.02);
        setBiosLineCount((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timer);
    } else if (bootProgress < 100) {
      const timer = setTimeout(() => {
        setBootProgress((prev) => Math.min(100, prev + 10));
      }, 90);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        finishBiosBoot();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [bootStage, biosLineCount, bootProgress, biosLines.length, finishBiosBoot]);

  if (bootStage === 'incoming_call') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080c] p-4 font-mono select-none">
        <div className="w-full max-w-xl bg-[#091118]/95 border-2 border-[#00ff66] rounded-xl p-8 flex flex-col items-center text-center shadow-[0_0_35px_rgba(0,255,102,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

          {/* Caller Avatar */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-[#00ff66]/15 border-2 border-[#00ff66] flex items-center justify-center text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.5)]">
              <ShieldAlert size={48} className="animate-pulse" />
            </div>
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00ff66] border-2 border-[#091118] animate-ping" />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#00ff66] border-2 border-[#091118]" />
          </div>

          <div className="text-xl font-bold tracking-widest text-[#00ff66] mb-1">
            {callerName}
          </div>
          <div className="text-xs text-[#00ff66]/70 uppercase tracking-wider mb-8 animate-pulse">
            {callStatus}
          </div>

          <button
            onClick={acceptIncomingCall}
            className="px-8 py-3.5 bg-[#00ff66] text-[#05080c] font-black text-sm uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_25px_rgba(0,255,102,0.6)] flex items-center space-x-2"
          >
            <PhoneCall size={18} />
            <span>[ODBIERZ]</span>
          </button>
        </div>
      </div>
    );
  }

  if (bootStage === 'intro_chat') {
    const isLastDialog = introDialogIndex === introDialogue.length - 1;

    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080c] p-4 font-mono select-none">
        <div className="w-full max-w-2xl bg-[#091118]/95 border-2 border-[#00f0ff] rounded-xl p-6 shadow-[0_0_35px_rgba(0,240,255,0.25)] flex flex-col justify-between max-h-[92vh] overflow-y-auto relative">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#00f0ff]/30 pb-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded bg-[#00f0ff]/20 border border-[#00f0ff] flex items-center justify-center text-[#00f0ff]">
                <ShieldAlert size={16} />
              </div>
              <span className="font-bold text-sm tracking-wider text-[#00f0ff]">
                {callerName} // POŁĄCZONO 00:0{introDialogIndex + 1}
              </span>
            </div>
            <span className="text-[10px] text-[#00f0ff]/60">SZYFROWANIE AKTYWNE</span>
          </div>

          {/* Dialogue display */}
          <div className="space-y-4 my-auto">
            {/* Caller speech bubble */}
            <div className="p-4 bg-[#061019] border border-[#00f0ff]/40 rounded-lg text-sm text-[#d1fae5] leading-relaxed shadow-inner">
              <span className="text-[10px] text-[#00f0ff] font-bold block mb-1">
                {callerName}:
              </span>
              {currentDialog.text}
            </div>

            {/* Player's Choice Options (if present) */}
            {currentDialog.playerOptions && currentDialog.playerOptions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-[#00f0ff] font-bold tracking-widest uppercase block">
                  WYBIERZ SWOJĄ ODPOWIEDŹ:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentDialog.playerOptions.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedOptionId(opt.id);
                        }}
                        className={`p-3 rounded-lg border text-left text-xs transition-all flex items-start space-x-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                            : 'bg-[#061019] border-[#00f0ff]/30 text-gray-300 hover:border-[#00f0ff]/70 hover:bg-[#00f0ff]/10'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#00f0ff] bg-[#00f0ff] text-[#05080c] font-bold'
                              : 'border-gray-500 text-gray-400'
                          }`}
                        >
                          {isSelected ? '✓' : '•'}
                        </span>
                        <span className="leading-snug">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mentor's reaction to selected option */}
                {selectedOptionId && (() => {
                  const selectedOpt = currentDialog.playerOptions?.find((o) => o.id === selectedOptionId);
                  if (!selectedOpt?.mentorReaction) return null;
                  return (
                    <div className="p-3 bg-[#061420] border border-[#00f0ff]/50 rounded-lg text-xs text-[#a7f3d0] leading-relaxed shadow-inner mt-2">
                      <span className="text-[10px] text-[#00f0ff] font-bold block mb-1">
                        {callerName}:
                      </span>
                      {selectedOpt.mentorReaction}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Player's Response / Thought (if present and no playerOptions) */}
            {(!currentDialog.playerOptions || currentDialog.playerOptions.length === 0) &&
              Boolean(currentDialog.playerResponse && currentDialog.playerResponse.trim()) && (
              <div className="p-4 bg-[#00f0ff]/10 border border-[#00f0ff]/50 rounded-lg text-sm text-[#00f0ff] leading-relaxed">
                <span className="text-[10px] text-[#d1fae5]/60 font-bold block mb-1">
                  TWOJA ODPOWIEDŹ:
                </span>
                "{currentDialog.playerResponse}"
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-[#00f0ff]/30 flex justify-end">
            {!isLastDialog ? (
              <button
                onClick={() => {
                  setSelectedOptionId(null);
                  nextIntroDialog();
                }}
                disabled={Boolean(currentDialog.playerOptions?.length && !selectedOptionId)}
                className="px-6 py-2.5 bg-[#00f0ff] text-[#05080c] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#00f0ff]/90 transition-all flex items-center space-x-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>DALEJ</span>
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={startBiosBoot}
                className="px-6 py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(0,255,102,0.5)]"
              >
                <Terminal size={16} />
                <span>WŁĄCZ SYSTEM OPERACYJNY {activeMission.mission.systemOs || 'HACKERS.OS'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (bootStage === 'bios_boot') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080c] p-4 font-mono select-none">
        <div className="w-full max-w-2xl bg-black border-2 border-[#00ff66] rounded-xl p-6 max-h-[92vh] overflow-y-auto flex flex-col justify-between shadow-[0_0_30px_rgba(0,255,102,0.3)] relative">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

          {/* BIOS Text Typewriter */}
          <div className="text-xs text-[#00ff66] space-y-0.5 leading-tight font-mono">
            {biosLines.slice(0, biosLineCount).map((line, idx) => (
              <div key={idx} className={line === '' ? 'h-2' : ''}>
                {line}
              </div>
            ))}
          </div>

          {/* System OS loading bar */}
          {biosLineCount >= biosLines.length && (
            <div className="mt-6 pt-4 border-t border-[#00ff66]/30 flex flex-col items-center space-y-3">
              <div className="text-sm font-black tracking-widest text-[#00ff66] flex items-center space-x-2">
                <ShieldAlert size={18} className="animate-pulse" />
                <span>{activeMission.mission.systemOs || '//HACKERS.OS'}</span>
              </div>

              {/* Segmented green progress bar */}
              <div className="w-64 h-4 bg-[#0a1610] border border-[#00ff66] p-0.5 rounded flex items-center">
                <div
                  className="h-full bg-[#00ff66] transition-all duration-100 shadow-[0_0_10px_#00ff66]"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>

              <div className="text-[10px] text-[#00ff66]/70">
                ŁADOWANIE PAMIĘCI RAM & MODUŁÓW JĄDRA: {bootProgress}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
