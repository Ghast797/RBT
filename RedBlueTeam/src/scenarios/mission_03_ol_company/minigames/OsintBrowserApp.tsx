// Etap 2 — //TOR: PRZEGLĄDARKA (strona O&L, D2 cel, D3 wektor). ZAŚLEPKA porcji B: pełna wersja (porcja D) zastąpi ten plik.
// Kontrakt i dane: stages.ts (osintBrowserConfig), docs/rebuild-plan.md, sekcja 3.2.

import React from 'react';
import { Globe } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import type { OsintBrowserConfig } from './types';
import { buildReport } from './report';
import { StubScreen } from './stub';

export const OsintBrowserApp: React.FC<BlockProps<OsintBrowserConfig>> = ({ config, onDecision, onComplete }) => (
  <StubScreen
    icon={Globe}
    accent="#3b82f6"
    title="//TOR: PRZEGLĄDARKA"
    info={[
      config.site.url,
      `${config.site.tabs.home} / ${config.site.tabs.events}`,
      ...config.site.employees.map((e) => `${e.name} — ${e.role} — ${e.tenure}`)
    ]}
    steps={[
      {
        question: config.target.question,
        options: config.target.options,
        onPick: (o) => onDecision(buildReport(config.target, o))
      },
      {
        question: config.vector.question,
        options: config.vector.options,
        onPick: (o) => onDecision(buildReport(config.vector, o))
      }
    ]}
    finishLabel={config.loaders.vectorSave}
    onComplete={onComplete}
  />
);
