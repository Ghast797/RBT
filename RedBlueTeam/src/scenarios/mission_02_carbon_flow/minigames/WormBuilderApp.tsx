import React, { useState } from 'react';
import { ShieldAlert, Bug, CheckCircle2, ArrowRight, Code, Terminal, Cpu } from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { WormBuilderConfig } from './types';

type Screen = 'virus_select' | 'code_edit' | 'compiling' | 'ready';

export const WormBuilderApp: React.FC<BlockProps<WormBuilderConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const purple = '#a855f7';

  const [screen, setScreen] = useState<Screen>('virus_select');
  const [selectedVirusId, setSelectedVirusId] = useState<string | null>(null);
  const [enabledInstructions, setEnabledInstructions] = useState<string[]>([]);

  const selectedVirus = config.virus.options.find((o) => o.id === selectedVirusId);

  const toggleInstruction = (id: string) => {
    sounds.playKeypress();
    setEnabledInstructions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addAllInstructions = () => {
    sounds.playSuccess();
    setEnabledInstructions(config.instructions.map((i) => i.id));
  };

  const handleVirusConfirm = () => {
    if (!selectedVirus) return;
    sounds.playSuccess();
    onDecision({
      num: config.virus.decisionNum,
      question: config.virus.question,
      answer: selectedVirus.label,
      tier: selectedVirus.tier,
      feedback: selectedVirus.feedback
    });
    if (selectedVirus.tier !== 'critical') {
      setScreen('code_edit');
    }
  };

  const handleCompile = () => {
    sounds.playClick();
    setScreen('compiling');
  };

  const isAllInstructionsReady = enabledInstructions.length === config.instructions.length;

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${purple}4d` }}>
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded-lg border"
            style={{ backgroundColor: `${purple}26`, borderColor: purple, color: purple }}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//BAZA_WIRUSÓW // ROBOTYKA 0-DAY</h2>
            <p className="text-[11px]" style={{ color: purple }}>
              Konstrukcja i modyfikacja samoreplikującego robaka sieciowego
            </p>
          </div>
        </div>
        <span
          className="text-[10px] px-2.5 py-1 rounded-md border font-mono font-bold"
          style={{ backgroundColor: `${purple}1a`, borderColor: `${purple}66`, color: purple }}
        >
          {screen === 'virus_select' ? 'KROK 1/2' : 'KROK 2/2'}
        </span>
      </div>

      {screen === 'virus_select' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              {config.virus.question}
            </h3>
            <p className="text-[11px] text-gray-400">
              Wybierz rodzaj ładunku złośliwego oprogramowania pasujący do założeń operacji przeciwko CarbonFlow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {config.virus.options.map((opt) => {
              const isSelected = selectedVirusId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedVirusId(opt.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'border-gray-800 bg-[#08101a] text-gray-300 hover:border-gray-700 hover:bg-[#0c1624]'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: purple,
                          backgroundColor: `${purple}26`,
                          boxShadow: `0 0 20px ${purple}4d`
                        }
                      : undefined
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2" style={{ color: isSelected ? '#c084fc' : purple }}>
                      <Bug size={18} />
                      <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                    </div>
                    {opt.desc && <p className="text-[11px] text-gray-400 leading-relaxed">{opt.desc}</p>}
                  </div>

                  {opt.tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {opt.tags.map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={!selectedVirus}
              onClick={handleVirusConfirm}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                selectedVirus
                  ? 'text-white cursor-pointer hover:brightness-110 shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={selectedVirus ? { backgroundColor: purple, boxShadow: `0 0 20px ${purple}80` } : undefined}
            >
              <span>ZATWIERDŹ WYBÓR WIRUSA</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'code_edit' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2" style={{ color: purple }}>
                <Code size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">
                  Modyfikacja kodu robaka 0-day (Wstrzykiwanie procedur)
                </span>
              </div>
              <button
                onClick={addAllInstructions}
                className="text-[10px] px-2.5 py-1 rounded border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white transition-all bg-black/40 cursor-pointer"
              >
                WSTRZYKNIJ WSZYSTKIE INSTRUKCJE
              </button>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Zaznacz kluczowe procedury wykonawcze, które zostaną skompilowane w ładunek robaka 0-day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Dostępne segmenty kodu:
              </span>
              <div className="space-y-1.5">
                {config.instructions.map((inst) => {
                  const isChecked = enabledInstructions.includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      onClick={() => toggleInstruction(inst.id)}
                      className={`p-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'text-white'
                          : 'border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700'
                      }`}
                      style={isChecked ? { borderColor: purple, backgroundColor: `${purple}26` } : undefined}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold" style={{ color: isChecked ? '#c084fc' : '#9ca3af' }}>{inst.code}</div>
                        <div className="text-[10px] text-gray-400">{inst.desc}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'border-gray-700 bg-gray-900'
                        }`}
                      >
                        {isChecked && <CheckCircle2 size={12} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-800 bg-black/70 flex flex-col justify-between font-mono text-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400 border-b border-gray-800 pb-2">
                  <Terminal size={14} />
                  <span className="text-[10px] uppercase tracking-widest">Podgląd assemblera / payload.asm</span>
                </div>
                <div className="text-[11px] text-emerald-400 space-y-1 overflow-y-auto max-h-48">
                  <div>; --- WORM 0-DAY PAYLOAD ENTRYPOINT ---</div>
                  <div>BITS 64</div>
                  <div>SECTION .text</div>
                  <div>global _start</div>
                  <div>_start:</div>
                  {enabledInstructions.map((id) => {
                    const inst = config.instructions.find((i) => i.id === id);
                    return inst ? (
                      <div key={id} className="text-purple-300 pl-4 animate-in fade-in">
                        call {inst.code}
                      </div>
                    ) : null;
                  })}
                  {enabledInstructions.length === 0 && (
                    <div className="text-gray-600 italic pl-4">; brak wybranych procedur...</div>
                  )}
                  <div>ret</div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Wybrane procedury:</span>
                <span className="font-bold text-white font-mono">
                  {enabledInstructions.length} / {config.instructions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={!isAllInstructionsReady}
              onClick={handleCompile}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isAllInstructionsReady
                  ? 'text-white cursor-pointer hover:brightness-110 shadow-lg'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={isAllInstructionsReady ? { backgroundColor: purple, boxShadow: `0 0 20px ${purple}80` } : undefined}
            >
              <Cpu size={16} />
              <span>KOMPILUJ ŁADUNEK 0-DAY</span>
            </button>
          </div>
        </div>
      )}

      {screen === 'compiling' && (
        <ModuleLoader
          label="Kompilacja i zaciemnianie kodu (obfuscation + bypass AV)..."
          durationMs={1200}
          onDone={() => setScreen('ready')}
        />
      )}

      {screen === 'ready' && (
        <div className="flex flex-col justify-between h-full space-y-4 my-auto">
          <div className="p-6 rounded-xl border border-emerald-500/50 bg-[#081a14] space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              WIRUS GOTOWY! ŁADUNEK 0-DAY SKOMPILOWANY
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              Ładunek robaka 0-day został pomyślnie skompilowany i zaciemniony. Jest gotowy do wstrzyknięcia w wektor dostarczenia po zamaskowaniu połączenia sieciowego.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition-all"
            >
              <span>ZAPISZ ŁADUNEK I PRZEJDŹ DALEJ</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
