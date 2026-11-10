// Etap 1 — //BAZA_WIRUSÓW: D1 (wybór wirusa) i zdrapka składania programu (bez oceny w interfejsie).
// Kontrakt i dane: stages.ts (virusLabConfig), docs/rebuild-plan.md, sekcje 3.1, 8 i 9.
// Interfejs nie ujawnia oceny: ocena trafia do raportu przez onDecision. Keylogger (critical) nie otwiera zdrapki —
// silnik pokazuje ekran wykrycia. Stan aplikacji trzyma zwykły useState (AppHost nie odmontowuje jej przy zamknięciu).

import React, { useEffect, useRef, useState } from 'react';
import { Bug } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceCardGrid } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { LOADER_LONG_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { VirusLabConfig } from './types';
import { buildReport } from '../../../engine/core/report';
import { ScratchMatrix } from '../../../engine/blocks/ScratchMatrix';
import { ImageSlot } from './ui';

type Screen = 'virus_select' | 'loader' | 'matrix';

/** Czas pokazania komunikatu o odnalezieniu wszystkich części, zanim etap się zakończy. */
const SUCCESS_MS = 1500;

export const VirusLabApp: React.FC<BlockProps<VirusLabConfig>> = ({ config, onDecision, onComplete }) => {
  // Akcent = kolor kafelka //BAZA_WIRUSÓW na pulpicie.
  const accent = '#ec4899';

  const [screen, setScreen] = useState<Screen>('virus_select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Po zgłoszeniu D1 wybór jest zablokowany (krytyczny wybór kończy misję w silniku). */
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);

  const options = useShuffled(config.virus.options);
  const selected = config.virus.options.find((o) => o.id === selectedId);
  const variant = selected ? config.matrix.variants[selected.id] : undefined;

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!done) return;
    sounds.playSuccess();
    const t = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, SUCCESS_MS);
    return () => clearTimeout(t);
  }, [done]);

  const handleConfirm = () => {
    if (!selected || locked) return;
    sounds.playClick();
    setLocked(true);
    onDecision(buildReport(config.virus, selected));
    if (selected.tier !== 'critical' && config.matrix.variants[selected.id]) setScreen('loader');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      {screen === 'virus_select' && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          <AppHeader
            icon={Bug}
            accent={accent}
            title={config.title}
            subtitle={config.subtitle}
            task={config.virusTexts.task}
            step={config.steps[0]}
          />
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            <ChoiceCardGrid
              accent={accent}
              options={options}
              selectedId={selectedId}
              onSelect={(id) => {
                if (locked) return;
                sounds.playClick();
                setSelectedId(id);
              }}
              label={config.heading}
              size="lg"
            />
          </div>
          <div className="flex justify-end shrink-0">
            <ConfirmButton
              accent={accent}
              label={config.virusTexts.confirmLabel}
              enabled={!!selected && !locked}
              onClick={handleConfirm}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {screen === 'loader' && (
        <>
          <AppHeader icon={Bug} accent={accent} title={config.title} subtitle={config.subtitle} step={config.steps[1]} />
          <div className="flex-1 min-h-0">
            <ModuleLoader
              label={config.matrix.loaderText}
              durationMs={LOADER_LONG_MS}
              accent={accent}
              onDone={() => setScreen('matrix')}
            />
          </div>
        </>
      )}

      {screen === 'matrix' && variant && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          <AppHeader
            icon={Bug}
            accent={accent}
            title={config.title}
            subtitle={`${config.matrix.programPrefix} ${variant.programName}`}
            task={config.matrix.task}
            step={config.steps[1]}
          />
          <ScratchMatrix
            config={config.matrix}
            variant={variant}
            accent={accent}
            done={done}
            onRevealed={() => setDone(true)}
            renderImage={(v) => <ImageSlot asset={v.image} label={v.imageAlt} fit="contain" />}
          />
        </div>
      )}
    </div>
  );
};
