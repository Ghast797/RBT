// ZAŚLEPKA (porcja B) etapu 1 — //BAZA_WIRUSÓW. Zastępuje ją porcja C (D1 + zdrapka `ScratchMatrix`).
import React from 'react';
import { Bug } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import { buildReport } from '../../../engine/core/report';
import type { VirusLabConfig } from './types';
import { StubShell } from './stub';

export const VirusLabApp: React.FC<BlockProps<VirusLabConfig>> = ({ config, onDecision, onComplete }) => {
  const ideal = config.virus.options.find((o) => o.tier === 'ideal')!;
  return (
    <StubShell
      icon={Bug}
      accent="#ec4899"
      title={config.title}
      subtitle={config.subtitle}
      actions={[
        { label: 'D1: ZGŁOŚ WYBÓR IDEALNY', run: () => onDecision(buildReport(config.virus, ideal)) },
        { label: 'ZAKOŃCZ ETAP', run: onComplete }
      ]}
    />
  );
};
