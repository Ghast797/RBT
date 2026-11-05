import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Terminal, Cpu } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import type { BlockProps } from '../../../engine/types/mission';
import type { WormBuilderConfig } from './types';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SidePanel } from '../../../engine/components/SidePanel';
import { InfoCard, OptionCards } from './ui';

type Screen = 'virus_select' | 'code_edit' | 'compiling' | 'ready';

export const WormBuilderApp: React.FC<BlockProps<WormBuilderConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  // Akcent = kolor kafelka //BAZA_WIRUSÓW na pulpicie (jak w Misji 1).
  const accent = '#ec4899';

  const [screen, setScreen] = useState<Screen>('virus_select');
  const [selectedVirusId, setSelectedVirusId] = useState<string | null>(null);
  const [enabledInstructions, setEnabledInstructions] = useState<string[]>([]);

  const virusOptions = useShuffled(config.virus.options);
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

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={ShieldAlert} accent={accent} title="//BAZA_WIRUSÓW" subtitle={subtitle} task={task} step={step} />
  );

  // Prawy monitor przy edycji kodu: wybór segmentów (wybory) i przyciski; lewy ekran pokazuje podgląd kodu.
  const codePanel = (
    <SidePanel
      accent={accent}
      heading="//BAZA_WIRUSÓW: SEGMENTY KODU"
      sub="Zaznacz procedury, które zostaną skompilowane w ładunek."
      footer={
        <div className="shrink-0 space-y-2">
          <button
            onClick={addAllInstructions}
            className="w-full px-3 py-2 rounded border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-[0.6875rem] font-bold uppercase tracking-wider transition-all bg-black/40 cursor-pointer"
          >
            WSTRZYKNIJ WSZYSTKIE INSTRUKCJE
          </button>
          <ConfirmButton
            accent={accent}
            label="KOMPILUJ ŁADUNEK 0-DAY"
            enabled={isAllInstructionsReady}
            onClick={handleCompile}
            icon={<Cpu size={15} />}
          />
        </div>
      }
    >
      {screen === 'code_edit' && (
        <ChoiceZone accent={accent} label="ZAZNACZ SEGMENTY">
          <div className="flex flex-col gap-2.5">
            {config.instructions.map((inst) => (
              <ChoiceTile
                key={inst.id}
                accent={accent}
                state={enabledInstructions.includes(inst.id) ? 'selected' : 'idle'}
                onClick={() => toggleInstruction(inst.id)}
                className="p-3"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-white break-all">{inst.code}</div>
                  <div className="text-[0.6875rem] text-gray-300 leading-snug">{inst.desc}</div>
                </div>
              </ChoiceTile>
            ))}
          </div>
        </ChoiceZone>
      )}
    </SidePanel>
  );

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {(screen === 'code_edit' || screen === 'compiling') && <SideMonitor>{codePanel}</SideMonitor>}

      {screen === 'virus_select' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'DOBÓR ŁADUNKU ZŁOŚLIWEGO OPROGRAMOWANIA',
            'Wybierz rodzaj wirusa, który posłuży w operacji przeciwko CarbonFlow Inc.',
            'KROK 1/2'
          )}
          <OptionCards accent={accent} options={virusOptions} selectedId={selectedVirusId} onSelect={setSelectedVirusId} />
          <div className="flex justify-end">
            <ConfirmButton
              accent={accent}
              label="ZATWIERDŹ WYBÓR WIRUSA"
              enabled={!!selectedVirus}
              onClick={handleVirusConfirm}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'code_edit' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'MODYFIKACJA KODU ROBAKA 0-DAY',
            'Zaznacz na prawym monitorze wszystkie segmenty kodu, a potem skompiluj ładunek.',
            'KROK 2/2'
          )}

          <div className="flex-1 min-h-0 p-4 rounded-xl border border-gray-800 bg-black/70 flex flex-col font-mono">
            <div className="flex items-center space-x-2 text-gray-300 border-b border-gray-800 pb-2 shrink-0">
              <Terminal size={15} />
              <span className="text-xs uppercase tracking-widest">Podgląd assemblera / payload.asm</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pt-3 text-xs text-gray-200 space-y-1">
              <div className="text-gray-400">; --- WORM 0-DAY PAYLOAD ENTRYPOINT ---</div>
              <div>BITS 64</div>
              <div>SECTION .text</div>
              <div>global _start</div>
              <div>_start:</div>
              {enabledInstructions.map((id) => {
                const inst = config.instructions.find((i) => i.id === id);
                return inst ? (
                  <div key={id} className="pl-4 animate-in fade-in" style={{ color: accent }}>
                    call {inst.code}
                  </div>
                ) : null;
              })}
              {enabledInstructions.length === 0 && (
                <div className="text-gray-500 italic pl-4">; brak wybranych procedur...</div>
              )}
              <div>ret</div>
            </div>
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-gray-300">Wybrane procedury:</span>
              <span className="font-bold text-white font-mono">
                {enabledInstructions.length} / {config.instructions.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {screen === 'compiling' && (
        <ModuleLoader
          label="Kompilacja i zaciemnianie kodu (obfuscation + bypass AV)..."
          durationMs={1200}
          accent={accent}
          onDone={() => setScreen('ready')}
        />
      )}

      {screen === 'ready' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('ŁADUNEK SKOMPILOWANY', 'Zapisz ładunek i wróć na pulpit.', 'FINALIZACJA')}
          <InfoCard accent={accent} className="text-center my-auto">
            <div
              className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center"
              style={{ borderColor: accent, backgroundColor: `${accent}26`, color: accent }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ŁADUNEK 0-DAY SKOMPILOWANY
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              Ładunek został skompilowany i zaciemniony. Jest gotowy do wstrzyknięcia w wektor dostarczenia.
            </p>
          </InfoCard>
          <div className="flex justify-end">
            <ConfirmButton
              accent={accent}
              label="ZAPISZ ŁADUNEK I PRZEJDŹ DALEJ"
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}
    </div>
  );
};
