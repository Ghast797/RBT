// Etap 1 — //BAZA_WIRUSÓW (D1 + matryca kompilacji). ZAŚLEPKA porcji B: pełna wersja (porcja C) zastąpi ten plik.
// Kontrakt i dane: stages.ts (virusLabConfig), docs/rebuild-plan.md, sekcja 3.1.

import React from 'react';
import { Bug } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import type { VirusLabConfig } from './types';
import { buildReport } from './report';
import { StubScreen } from './stub';

export const VirusLabApp: React.FC<BlockProps<VirusLabConfig>> = ({ config, onDecision, onComplete }) => (
  <StubScreen
    icon={Bug}
    accent="#ec4899"
    title="//BAZA_WIRUSÓW"
    info={[config.matrix.heading, ...config.matrix.parts.map((p) => `${p.label}: ${p.desc}`), config.matrix.doneMessage]}
    steps={[
      {
        question: config.virus.question,
        options: config.virus.options,
        onPick: (o) => onDecision(buildReport(config.virus, o))
      }
    ]}
    finishLabel={config.matrix.continueLabel}
    onComplete={onComplete}
  />
);
