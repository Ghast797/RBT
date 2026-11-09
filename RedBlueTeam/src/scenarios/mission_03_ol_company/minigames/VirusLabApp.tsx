// Etap 1 — //BAZA_WIRUSÓW: D1 (wybór wirusa) i „matryca kompilacji” (zdrapka, bez oceny).
// Kontrakt i dane: stages.ts (virusLabConfig), docs/rebuild-plan.md, sekcje 3.1 i 4.
// Interfejs nie ujawnia oceny: po wyborze widać tylko postęp, ocena trafia do raportu przez onDecision.

import React, { useEffect, useRef, useState } from 'react';
import { Bug } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceCardGrid } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { VirusLabConfig } from './types';
import { buildReport } from './report';
import { LOADER_LONG_MS } from './ui';
import { ScratchMatrix, MATRIX_TASK } from './ScratchMatrix';

type Screen = 'virus_select' | 'loader' | 'matrix';

/** Jak długo gracz widzi komunikat „WIRUS GOTOWY!”, zanim etap zakończy się sam. */
const DONE_MS = 1400;

export const VirusLabApp: React.FC<BlockProps<VirusLabConfig>> = ({ config, onDecision, onComplete }) => {
  // Akcent = kolor kafelka //BAZA_WIRUSÓW na pulpicie (jak w Misji 2).
  const accent = '#ec4899';

  const [screen, setScreen] = useState<Screen>('virus_select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Po zgłoszeniu D1 wybór jest zablokowany (krytyczny wybór kończy misję w silniku, więc dalej nie idziemy). */
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);

  const options = useShuffled(config.virus.options);
  const selected = config.virus.options.find((o) => o.id === selectedId);

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Krok bez decyzji: po komunikacie sukcesu etap kończy się sam (jeden raz), bez przycisku „dalej”.
  useEffect(() => {
    if (!done) return;
    sounds.playSuccess();
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, DONE_MS);
    return () => clearTimeout(id);
  }, [done]);

  const handleConfirm = () => {
    if (!selected || locked) return;
    sounds.playClick();
    setLocked(true);
    onDecision(buildReport(config.virus, selected));
    if (selected.tier !== 'critical') setScreen('loader');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      {screen === 'virus_select' && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          <AppHeader icon={Bug} accent={accent} title="//BAZA_WIRUSÓW" task={config.virusTexts.task} step="KROK 1/2" />
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
              label={config.virusTexts.choiceLabel}
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
        <ModuleLoader
          label={config.matrix.loaderText}
          durationMs={LOADER_LONG_MS}
          accent={accent}
          onDone={() => setScreen('matrix')}
        />
      )}

      {screen === 'matrix' && (
        <div className="flex flex-col flex-1 min-h-0 gap-3 animate-in fade-in duration-200">
          <AppHeader icon={Bug} accent={accent} title="//BAZA_WIRUSÓW" task={MATRIX_TASK} step="KROK 2/2" />
          <ScratchMatrix config={config.matrix} accent={accent} done={done} onRevealed={() => setDone(true)} />
        </div>
      )}
    </div>
  );
};
