import React, { useState } from 'react';
import { AlertTriangle, Bug, Cpu, Layers, PackageCheck, Terminal, X, CheckCircle2 } from 'lucide-react';
import { useMissionStore } from '../../store/useMissionStore';

export const VirusDatabaseApp: React.FC = () => {
  const {
    activeMission,
    selectedVirus,
    selectVirusCard,
    builderModule,
    setBuilderModule,
    builderMasking,
    setBuilderMasking,
    builderPackage,
    setBuilderPackage,
    builderError,
    isRatCompiling,
    isRatCompiled,
    compileRatPayload,
    finishRatStep,
    closeApp
  } = useMissionStore();

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const step1 = activeMission.step1 || {};
  const viruses: any[] = step1.viruses || [];
  const builderData = step1.ratBuilder || {
    title: 'BUILDER ŁADUNKU',
    subtitle: '',
    modules: { title: '', options: [] },
    masking: { title: '', options: [] },
    package: { title: '', options: [] },
    successMessage: ''
  };

  const handleVirusClick = (v: typeof viruses[0]) => {
    selectVirusCard(v.id);
    if (!v.isCorrect) {
      setFeedbackMsg(v.feedback || 'Niewłaściwy wybór dla tego zadania.');
    } else {
      setFeedbackMsg(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 font-mono select-none">
      {/* App Header */}
      <div className="flex items-center justify-between border-b border-[#00ff66]/30 pb-2">
        <div className="flex items-center space-x-2 text-[#00ff66]">
          <Bug size={18} />
          <span className="font-bold text-sm tracking-wider">//BAZA_WIRUSÓW</span>
        </div>
        <button
          onClick={closeApp}
          className="p-1 hover:bg-[#ff3366]/20 text-[#00ff66] hover:text-[#ff3366] rounded transition-colors"
          title="Zamknij i wróć do pulpitu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
        {/* Step 1.1: 3 Virus Cards (matching baza_wirusow.png) */}
        {!selectedVirus || selectedVirus !== 'rat' ? (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-[#00ff66] tracking-widest text-glow-green">
                BAZA WIRUSÓW
              </h2>
              <p className="text-xs text-[#00ff66]/70 uppercase">
                {step1.prompt || 'WYBIERZ ODPOWIEDNIEGO WIRUSA:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              {viruses.map((v) => {
                const isSelected = selectedVirus === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleVirusClick(v)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center text-center relative group ${
                      isSelected
                        ? v.isCorrect
                          ? 'bg-[#00f0ff]/15 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                          : 'bg-[#ff3366]/15 border-[#ff3366] shadow-[0_0_20px_rgba(255,51,102,0.4)]'
                        : 'bg-[#081017] border-[#00ff66]/20 hover:border-[#00ff66]/60 hover:bg-[#00ff66]/5'
                    }`}
                  >
                    {/* Glowing Icon Frame with Brackets */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-3 relative"
                      style={{
                        backgroundColor: `${v.badgeColor}15`,
                        border: `2px solid ${v.badgeColor}`,
                        boxShadow: `0 0 15px ${v.badgeColor}40`
                      }}
                    >
                      <Bug size={28} style={{ color: v.badgeColor }} />
                    </div>

                    <div className="font-bold text-xs tracking-wider mb-2" style={{ color: v.badgeColor }}>
                      {v.name}
                    </div>

                    <p className="text-[11px] text-[#d1fae5]/80 leading-relaxed">
                      {v.description}
                    </p>

                    {isSelected && !v.isCorrect && (
                      <div className="mt-2 text-[10px] text-[#ff3366] font-bold">
                        [NIEZALECANE DO TEJ MISJI]
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {feedbackMsg && (
              <div className="p-3 rounded bg-[#ff3366]/10 border border-[#ff3366]/50 text-xs text-[#ff3366] flex items-center space-x-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}
          </div>
        ) : (
          /* Step 1.2: Terminal RAT Builder (from Scenariusz.txt) */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#081219] border border-[#00f0ff]/40 rounded-lg">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/20 border border-[#00f0ff] flex items-center justify-center text-[#00f0ff]">
                  <Bug size={18} />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#00f0ff] tracking-wider">
                    {builderData.title}
                  </div>
                  <div className="text-[10px] text-[#d1fae5]/60">
                    {builderData.subtitle}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#00ff66] font-bold">STATUS: KONFIGURACJA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Module selection */}
              <div className="p-3.5 bg-[#081017] border border-[#00ff66]/30 rounded-lg space-y-2.5">
                <div className="text-sm font-black text-[#00ff66] flex items-center space-x-1.5 tracking-wide">
                  <Layers size={16} />
                  <span>{builderData.modules.title}</span>
                </div>
                <div className="space-y-2">
                  {builderData.modules.options.map((opt: any) => (
                    <label
                      key={opt.id}
                      className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        builderModule === opt.id
                          ? 'bg-[#00ff66]/15 border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                          : 'bg-[#060a0f] border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="builderModule"
                        checked={builderModule === opt.id}
                        onChange={() => setBuilderModule(opt.id)}
                        disabled={isRatCompiled}
                        className="hidden"
                      />
                      <div className={`font-bold text-xs sm:text-sm leading-snug ${builderModule === opt.id ? 'text-[#00ff66]' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {opt.desc}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Masking selection */}
              <div className="p-3.5 bg-[#081017] border border-[#00ff66]/30 rounded-lg space-y-2.5">
                <div className="text-sm font-black text-[#00ff66] flex items-center space-x-1.5 tracking-wide">
                  <Cpu size={16} />
                  <span>{builderData.masking.title}</span>
                </div>
                <div className="space-y-2">
                  {builderData.masking.options.map((opt: any) => (
                    <label
                      key={opt.id}
                      className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        builderMasking === opt.id
                          ? 'bg-[#00ff66]/15 border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                          : 'bg-[#060a0f] border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="builderMasking"
                        checked={builderMasking === opt.id}
                        onChange={() => setBuilderMasking(opt.id)}
                        disabled={isRatCompiled}
                        className="hidden"
                      />
                      <div className={`font-bold text-xs sm:text-sm leading-snug ${builderMasking === opt.id ? 'text-[#00ff66]' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {opt.desc}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Package selection */}
              <div className="p-3.5 bg-[#081017] border border-[#00ff66]/30 rounded-lg space-y-2.5">
                <div className="text-sm font-black text-[#00ff66] flex items-center space-x-1.5 tracking-wide">
                  <PackageCheck size={16} />
                  <span>{builderData.package.title}</span>
                </div>
                <div className="space-y-2">
                  {builderData.package.options.map((opt: any) => (
                    <label
                      key={opt.id}
                      className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        builderPackage === opt.id
                          ? 'bg-[#00ff66]/15 border-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                          : 'bg-[#060a0f] border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="builderPackage"
                        checked={builderPackage === opt.id}
                        onChange={() => setBuilderPackage(opt.id)}
                        disabled={isRatCompiled}
                        className="hidden"
                      />
                      <div className={`font-bold text-xs sm:text-sm leading-snug ${builderPackage === opt.id ? 'text-[#00ff66]' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {opt.desc}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Feedback */}
            {builderError && (
              <div className="p-3.5 bg-[#ff3366]/15 border-2 border-[#ff3366] rounded-lg text-xs text-[#ff3366] flex items-center space-x-3 shadow-[0_0_15px_rgba(255,51,102,0.3)]">
                <AlertTriangle size={20} className="shrink-0" />
                <span className="font-bold leading-relaxed">{builderError}</span>
              </div>
            )}

            {/* Compilation Action */}
            <div className="p-4 bg-[#081017] border border-[#00ff66]/40 rounded-lg space-y-3">
              {isRatCompiling && (
                <div className="space-y-2 text-xs text-[#00ff66]">
                  <div className="flex items-center space-x-2 animate-pulse font-bold">
                    <Terminal size={16} />
                    <span>Generowanie stuba... Szyfrowanie payloadu... Gotowe.</span>
                  </div>
                  <div className="w-full h-3 bg-[#0a1610] border border-[#00ff66] rounded overflow-hidden">
                    <div className="h-full bg-[#00ff66] animate-pulse w-3/4 shadow-[0_0_10px_#00ff66]" />
                  </div>
                </div>
              )}

              {isRatCompiled ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-[#00ff66] font-bold">
                    <CheckCircle2 size={20} className="text-[#00ff66]" />
                    <span>{builderData.successMessage}</span>
                  </div>

                  <button
                    onClick={finishRatStep}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.5)]"
                  >
                    [KONTYNUUJ]
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={compileRatPayload}
                    disabled={isRatCompiling}
                    className="px-6 py-3 bg-[#00ff66] text-[#05080c] font-black text-xs sm:text-sm uppercase tracking-widest rounded hover:bg-[#00ff66]/90 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(0,255,102,0.4)] flex items-center space-x-2"
                  >
                    <Terminal size={16} />
                    <span>[KOMPILUJ ŁADUNEK]</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
