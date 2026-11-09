// Etap 1 — //BAZA_WIRUSÓW. D1: wybór wirusa (oceniane, karty na dużym ekranie).
// Potem builder RAT jako aktywność NIEOCENIANA (flavor): trzy grupy przełączników,
// zły zestaw blokuje kompilację komunikatem (bez onDecision i bez wykrycia),
// poprawny kończy etap przez onComplete. Spec: docs/migration-spec.md, sekcja 1.

import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, CheckCircle2, Cpu, AlertTriangle } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile, ChoiceCardGrid } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { SidePanel } from '../../../engine/components/SidePanel';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import type { BlockProps } from '../../../engine/types/mission';
import type { VirusLabConfig, BuilderGroup } from './types';
import { LOADER_MS, LOADER_LONG_MS } from './ui';
import { GROUP_KEYS, validateBuilder, type GroupKey } from './builderLogic';

type Screen = 'virus_select' | 'loading' | 'builder' | 'compiling' | 'ready';

const ACCENT = '#ec4899'; // kolor kafelka //BAZA_WIRUSÓW

/** Jak długo gracz widzi komunikat o gotowym ładunku, zanim etap zakończy się sam. */
const READY_MS = 1400;

/**
 * Jedna grupa przełączników buildera: karty (radio) na dużym ekranie.
 * Kolejność opcji przychodzi z rodzica (`useShuffled` w `VirusLabApp`): kolumna odmontowuje się przy każdej
 * zmianie ekranu (kompilacja, błąd), więc tasowanie we wnętrzu przetasowywałoby karty po każdym powrocie.
 */
const BuilderColumn: React.FC<{
  group: BuilderGroup;
  options: BuilderGroup['options'];
  value: string | null;
  onChange: (id: string) => void;
}> = ({ group, options, value, onChange }) => {
  return (
    <ChoiceZone accent={ACCENT} label={group.title.replace(/:$/, '').toUpperCase()}>
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <ChoiceTile
            key={o.id}
            accent={ACCENT}
            state={value === o.id ? 'selected' : 'idle'}
            markerPosition="corner"
            onClick={() => {
              sounds.playClick();
              onChange(o.id);
            }}
            className="p-3.5 pr-10"
          >
            <div className="space-y-1">
              <div className="text-sm font-bold text-white leading-snug">{o.label}</div>
              <div className="text-sm text-gray-300 leading-snug">{o.desc}</div>
            </div>
          </ChoiceTile>
        ))}
      </div>
    </ChoiceZone>
  );
};

export const VirusLabApp: React.FC<BlockProps<VirusLabConfig>> = ({ config, onDecision, onComplete }) => {
  const [screen, setScreen] = useState<Screen>('virus_select');
  const [virusId, setVirusId] = useState<string | null>(null);
  const [decided, setDecided] = useState(false);
  const [picked, setPicked] = useState<Record<GroupKey, string | null>>({
    modules: null,
    masking: null,
    package: null
  });
  const [error, setError] = useState<string | null>(null);

  const virusOptions = useShuffled(config.virus.options);
  // Kolejność opcji buildera losuje się raz na montaż aplikacji (hooki w rodzicu, nie w kolumnie).
  const builderOptions: Record<GroupKey, BuilderGroup['options']> = {
    modules: useShuffled(config.builder.modules.options),
    masking: useShuffled(config.builder.masking.options),
    package: useShuffled(config.builder.package.options)
  };
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const virus = config.virus.options.find((o) => o.id === virusId);

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={ShieldAlert} accent={ACCENT} title="//BAZA_WIRUSÓW" subtitle={subtitle} task={task} step={step} />
  );

  const handleVirusConfirm = () => {
    if (!virus || decided) return;
    sounds.playSuccess();
    setDecided(true);
    onDecision({
      num: config.virus.decisionNum,
      question: config.virus.question,
      answer: virus.label,
      tier: virus.tier,
      feedback: virus.feedback
    });
    // critical: zostajemy na ekranie wyboru (zablokowanym) — silnik pokazuje wykrycie.
    if (virus.tier !== 'critical') setScreen('loading');
  };

  // Krok bez decyzji: po komunikacie o gotowym ładunku etap kończy się sam (jeden raz).
  useEffect(() => {
    if (screen !== 'ready') return;
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, READY_MS);
    return () => clearTimeout(id);
  }, [screen]);

  const setGroup = (key: GroupKey, id: string) => {
    setError(null);
    setPicked((p) => ({ ...p, [key]: id }));
  };

  const handleCompile = () => {
    sounds.playClick();
    const result = validateBuilder(config.builder, picked);
    if (result.kind === 'incomplete') {
      setError(result.message);
      return;
    }
    setError(null);
    setScreen('compiling');
  };

  const handleCompileDone = () => {
    const result = validateBuilder(config.builder, picked);
    if (result.kind !== 'ok') {
      sounds.playError();
      setError(result.message);
      setScreen('builder');
      return;
    }
    sounds.playSuccess();
    setScreen('ready');
  };

  const summary = (key: GroupKey) => config.builder[key].options.find((o) => o.id === picked[key])?.label;

  const buildPanel = (
    <SidePanel
      accent={ACCENT}
      heading="//BAZA_WIRUSÓW: KOMPILACJA"
      sub="Parametry ładunku RAT (x64 / Windows 11)."
      footer={
        <ConfirmButton
          accent={ACCENT}
          label="KOMPILUJ ŁADUNEK"
          onClick={handleCompile}
          icon={<Cpu size={15} />}
        />
      }
    >
      <div className="space-y-3 text-sm leading-snug">
        {GROUP_KEYS.map((k) => (
          <div key={k} className="space-y-0.5">
            <div className="text-xs font-black tracking-widest text-gray-400 uppercase">
              {config.builder[k].title.replace(/:$/, '')}
            </div>
            <div className={summary(k) ? 'text-white font-bold' : 'text-gray-500 italic'}>
              {summary(k) ?? 'nie wybrano'}
            </div>
          </div>
        ))}
        {error && (
          <div className="p-3 rounded-lg border border-[#ff3366]/70 bg-[#ff3366]/10 text-[#ff3366] font-bold flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </SidePanel>
  );

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {(screen === 'builder' || screen === 'compiling') && (
        <SideMonitor>{screen === 'builder' ? buildPanel : <div className="h-full" />}</SideMonitor>
      )}

      {screen === 'virus_select' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'DOBÓR ŁADUNKU ZŁOŚLIWEGO OPROGRAMOWANIA',
            'Wybierz rodzaj wirusa, który posłuży w operacji przeciwko O&L Company.',
            'KROK 1/2'
          )}
          <ChoiceCardGrid
            accent={ACCENT}
            options={virusOptions}
            label={config.virus.question}
            selectedId={virusId}
            onSelect={(id: string) => {
              if (decided) return;
              sounds.playClick();
              setVirusId(id);
            }}
            size="lg"
          />
          <div className="flex justify-end">
            <ConfirmButton
              accent={ACCENT}
              label="ZATWIERDŹ WYBÓR WIRUSA"
              enabled={!!virus && !decided}
              onClick={handleVirusConfirm}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'loading' && (
        <ModuleLoader
          label="Ładowanie buildera ładunku RAT..."
          durationMs={LOADER_MS}
          accent={ACCENT}
          onDone={() => setScreen('builder')}
        />
      )}

      {screen === 'builder' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            config.builder.title,
            'Skonfiguruj ładunek RAT: wybierz po jednym parametrze w każdej kolumnie, a potem skompiluj go na prawym monitorze.',
            'KROK 2/2'
          )}
          <p className="text-xs text-gray-400 shrink-0">{config.builder.subtitle}</p>
          <div className="grid grid-cols-3 gap-3 items-start">
            {GROUP_KEYS.map((k) => (
              <BuilderColumn
                key={k}
                group={config.builder[k]}
                options={builderOptions[k]}
                value={picked[k]}
                onChange={(id) => setGroup(k, id)}
              />
            ))}
          </div>
        </div>
      )}

      {screen === 'compiling' && (
        <ModuleLoader
          label="Kompilacja ładunku RAT i pakowanie..."
          durationMs={LOADER_LONG_MS}
          accent={ACCENT}
          onDone={handleCompileDone}
        />
      )}

      {screen === 'ready' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('ŁADUNEK SKOMPILOWANY', 'Ładunek jest gotowy. Za chwilę wrócisz na pulpit.', 'FINALIZACJA')}
          <div
            className="p-5 rounded-xl border space-y-3 text-center my-auto"
            style={{ borderColor: `${ACCENT}66`, backgroundColor: `${ACCENT}12` }}
          >
            <div
              className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center"
              style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}26`, color: ACCENT }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{config.builder.successMessage}</h3>
          </div>
        </div>
      )}
    </div>
  );
};
