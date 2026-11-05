// Etap 5 — //WIRUS: RAT, sesja (stub szkieletu). Finał bez oceny: aktywacja
// ładunku -> przejęcie pulpitu -> zdalny dostęp -> onComplete (mostek do raportu).
// Pełna wersja (pulpit ofiary, graf sieci): migration-spec.md.

import React, { useState } from 'react';
import type { BlockProps } from '../../../engine/types/mission';
import type { RatSessionConfig } from './types';
import { StubShell, StubHeader, StubActionButton, StubNote } from './ui';

export const RatSessionApp: React.FC<BlockProps<RatSessionConfig>> = ({ config, onComplete }) => {
  const [phase, setPhase] = useState<'alert' | 'takeover' | 'done'>('alert');

  return (
    <StubShell>
      <StubHeader title="//WIRUS: RAT — SESJA" task="Przejmij stację ofiary i uzyskaj zdalny dostęp do sieci O&L." />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        <StubNote>KOMPUTER: {config.host.name} · IP: {config.host.ip}</StubNote>
        {phase === 'alert' && (
          <StubActionButton label={config.takeoverLabel} onClick={() => setPhase('takeover')} />
        )}
        {phase === 'takeover' && (
          <StubActionButton
            label={config.networkLabel}
            onClick={() => { setPhase('done'); onComplete(); }}
          />
        )}
        {phase === 'done' && <StubNote>UZYSKANO ZDALNY DOSTĘP DO SIECI O&L COMPANY.</StubNote>}
      </div>
    </StubShell>
  );
};
