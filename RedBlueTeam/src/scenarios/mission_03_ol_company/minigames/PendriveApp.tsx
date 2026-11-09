// Etap 3 — //DYSK E: PENDRIVE (załączniki, nazwa dysku, podpis na kopercie, D4). ZAŚLEPKA porcji B:
// pełna wersja (porcja E) zastąpi ten plik. Kontrakt i dane: stages.ts (pendriveConfig), docs/rebuild-plan.md, sekcja 3.3.
// Zaślepka zapisuje `customState.m3_usb` (UsbState), z którego korzystają //DRON i //WIRUS: RAT.

import React from 'react';
import { HardDrive } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { USB_STATE_KEY, type PendriveConfig, type UsbState } from './types';
import { buildReport } from './report';
import { StubScreen } from './stub';

export const PendriveApp: React.FC<BlockProps<PendriveConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  return (
    <StubScreen
      icon={HardDrive}
      accent="#f59e0b"
      title="//DYSK E: PENDRIVE"
      info={[
        `${config.startTexts.panelTitle}: ${config.attachments.map((a) => a.name).join(', ')}`,
        `${config.volume.question}: ${config.volume.options.map((o) => o.label).join(', ')}`
      ]}
      steps={[
        {
          question: config.signature.question,
          options: config.signature.options,
          onPick: (o) => {
            const ideal = config.volume.options.find((v) => v.tier === 'ideal')!;
            const usb: UsbState = {
              volume: ideal.label,
              archive: config.attachments[0].archive,
              signature: o.label
            };
            setCustomState(USB_STATE_KEY, usb);
            onDecision(buildReport(config.signature, o));
          }
        }
      ]}
      finishLabel={config.signature.confirmLabel}
      onComplete={onComplete}
    />
  );
};
