// Etap 4 — //DRON: CONDOR MIT63 (D5 adres, D6 samochód). ZAŚLEPKA porcji B: pełna wersja (porcja F) zastąpi ten plik.
// Kontrakt i dane: stages.ts (droneConfig), docs/rebuild-plan.md, sekcja 3.4.

import React from 'react';
import { Crosshair } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import type { DroneConfig } from './types';
import { buildReport } from './report';
import { StubScreen } from './stub';

export const DroneApp: React.FC<BlockProps<DroneConfig>> = ({ config, onDecision, onComplete }) => (
  <StubScreen
    icon={Crosshair}
    accent="#ef4444"
    title={`//DRON: ${config.droneStats.model}`}
    info={[
      config.droneStats.video,
      config.droneStats.speed,
      config.droneStats.connection,
      `STATUS: ${config.statuses.idle}`
    ]}
    steps={[
      {
        question: config.address.question,
        options: config.address.options,
        onPick: (o) => onDecision(buildReport(config.address, o))
      },
      {
        question: config.car.question,
        options: config.car.options,
        onPick: (o) => onDecision(buildReport(config.car, o))
      }
    ]}
    finishLabel={config.texts.shutdownLabel}
    onComplete={onComplete}
  />
);
