// Etap 5 — //WIRUS: RAT (C2) (sesja, bez ocenianych decyzji). ZAŚLEPKA porcji B: pełna wersja (porcja G) zastąpi ten plik.
// Kontrakt i dane: stages.ts (ratSessionConfig), docs/rebuild-plan.md, sekcja 3.5.

import React from 'react';
import { Radio } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { USB_STATE_KEY, type RatSessionConfig, type UsbState } from './types';
import { StubScreen } from './stub';

export const RatSessionApp: React.FC<BlockProps<RatSessionConfig>> = ({ config, onComplete }) => {
  const usb = useMissionStore((s) => s.customState[USB_STATE_KEY]) as UsbState | undefined;
  const { archive, volume } = usb ?? config.usbFallback;
  return (
    <StubScreen
      icon={Radio}
      accent="#00f0ff"
      title="//WIRUS: RAT (C2)"
      info={[
        config.alert.label,
        config.alert.status,
        `${config.alert.hostLabel} ${config.host.name}`,
        `${config.alert.ipLabel} ${config.host.ip}`,
        `${config.alert.archiveLabel} ${archive}`,
        `${config.alert.volumeLabel} ${volume}`,
        config.network.headline
      ]}
      steps={[]}
      finishLabel={config.network.endLabel}
      onComplete={onComplete}
    />
  );
};
