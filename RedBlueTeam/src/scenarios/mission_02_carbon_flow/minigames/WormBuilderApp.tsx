import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, CheckCircle2, Terminal, Cpu, GripVertical } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import type { BlockProps } from '../../../engine/types/mission';
import type { WormBuilderConfig } from './types';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SidePanel } from '../../../engine/components/SidePanel';
import { InfoCard, NameCards } from './ui';

type Screen = 'virus_select' | 'code_edit' | 'compiling' | 'ready';

/** Jak długo gracz widzi komunikat o gotowym wirusie, zanim etap zakończy się sam. */
const READY_MS = 1400;

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
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const selectedVirus = config.virus.options.find((o) => o.id === selectedVirusId);

  // Przeciąganie segmentów kodu (zdarzenia wskaźnika: mysz i dotyk, także między prawym monitorem a lewym ekranem).
  // Kolejność w `enabledInstructions` to kolejność upuszczania.
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; over: boolean } | null>(null);
  const dragId = drag?.id ?? null;

  const isOverDrop = (x: number, y: number) => {
    const r = dropRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  useEffect(() => {
    if (!dragId) return;
    const onMove = (e: PointerEvent) =>
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, over: isOverDrop(e.clientX, e.clientY) } : d));
    const onUp = (e: PointerEvent) => {
      if (isOverDrop(e.clientX, e.clientY)) {
        sounds.playKeypress();
        setEnabledInstructions((prev) => (prev.includes(dragId) ? prev : [...prev, dragId]));
      }
      setDrag(null);
    };
    const onCancel = () => setDrag(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [dragId]);

  const startDrag = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0 || enabledInstructions.includes(id)) return;
    e.preventDefault();
    sounds.playClick();
    setDrag({ id, x: e.clientX, y: e.clientY, over: false });
  };

  // Krok bez decyzji: po komunikacie o gotowym wirusie etap kończy się sam (jeden raz).
  useEffect(() => {
    if (screen !== 'ready') return;
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, READY_MS);
    return () => clearTimeout(id);
  }, [screen]);

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

  // Prawy monitor przy edycji kodu: segmenty do przeciągnięcia i przycisk kompilacji; strefa upuszczenia (podgląd kodu) jest na lewym ekranie.
  const codePanel = (
    <SidePanel
      accent={accent}
      heading="//BAZA_WIRUSÓW: SEGMENTY KODU"
      sub="Przeciągnij segmenty na ekran z podglądem kodu po lewej."
      footer={
        <div className="shrink-0">
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
        <ChoiceZone accent={accent} label="PRZECIĄGNIJ SEGMENTY">
          <div className="flex flex-col gap-2.5">
            {config.instructions.map((inst) => {
              const used = enabledInstructions.includes(inst.id);
              const isDragged = dragId === inst.id;
              return (
                <div
                  key={inst.id}
                  onPointerDown={(e) => startDrag(e, inst.id)}
                  style={{
                    touchAction: 'none',
                    borderColor: used ? '#4b5563' : `${accent}99`,
                    backgroundColor: used ? '#0b1724' : `${accent}14`
                  }}
                  className={`relative p-3 pr-9 rounded-xl border-2 flex items-start gap-2 transition-opacity ${
                    used
                      ? 'opacity-50 cursor-default'
                      : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform'
                  } ${isDragged ? 'opacity-40' : ''}`}
                >
                  <GripVertical size={14} className="mt-0.5 shrink-0 text-gray-500" />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-mono font-bold text-white break-all">{inst.code}</div>
                    <div className="text-xs text-gray-300 leading-snug">{inst.desc}</div>
                  </div>
                  {used && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 text-[0.6875rem] font-black text-emerald-400">
                      <CheckCircle2 size={12} />
                      UŻYTY
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </ChoiceZone>
      )}
    </SidePanel>
  );

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Podczas kompilacji prawy monitor zostaje zajęty (bez migania czatu), ale pusty. */}
      {(screen === 'code_edit' || screen === 'compiling') && (
        <SideMonitor>{screen === 'code_edit' ? codePanel : <div className="h-full" />}</SideMonitor>
      )}

      {screen === 'virus_select' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'DOBÓR ŁADUNKU ZŁOŚLIWEGO OPROGRAMOWANIA',
            'Wybierz rodzaj wirusa, który posłuży w operacji przeciwko CarbonFlow Inc.',
            'KROK 1/2'
          )}
          <NameCards accent={accent} options={virusOptions} selectedId={selectedVirusId} onSelect={setSelectedVirusId} />
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
            'Przeciągnij z prawego monitora wszystkie segmenty kodu na ekran z podglądem kodu, a potem skompiluj ładunek.',
            'KROK 2/2'
          )}

          <div
            ref={dropRef}
            className="relative flex-1 min-h-0 p-4 rounded-xl border-2 bg-black/70 flex flex-col font-mono transition-all"
            style={{
              borderStyle: drag ? 'dashed' : 'solid',
              borderColor: drag ? (drag.over ? accent : `${accent}99`) : '#1f2937',
              backgroundColor: drag?.over ? `${accent}1f` : undefined,
              boxShadow: drag?.over ? `0 0 24px ${accent}66` : undefined
            }}
          >
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
                <div className="text-gray-500 italic pl-4">
                  {drag ? '; upuść segment tutaj' : '; przeciągnij tu segmenty z prawego monitora...'}
                </div>
              )}
              <div>ret</div>
            </div>
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-gray-300">Dodane procedury:</span>
              <span className="font-bold text-white font-mono">
                {enabledInstructions.length} / {config.instructions.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {drag &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold text-white shadow-xl"
            style={{
              left: drag.x + 12,
              top: drag.y + 12,
              borderColor: accent,
              backgroundColor: '#0b1724',
              boxShadow: `0 0 16px ${accent}80`
            }}
          >
            {config.instructions.find((i) => i.id === drag.id)?.code}
          </div>,
          document.body
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
          {header('WIRUS GOTOWY', 'Wirus jest gotowy. Za chwilę wrócisz na pulpit.', 'FINALIZACJA')}
          <InfoCard accent={accent} className="text-center my-auto">
            <div
              className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center"
              style={{ borderColor: accent, backgroundColor: `${accent}26`, color: accent }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              WIRUS GOTOWY!
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY
            </p>
          </InfoCard>
        </div>
      )}
    </div>
  );
};
