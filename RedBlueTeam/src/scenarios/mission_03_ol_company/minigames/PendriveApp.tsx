// Etap 3 — //DYSK E: PENDRIVE (stub szkieletu). D4 załącznik -> flavor
// (podpięcie RAT do ZIP) -> D5 wolumin -> D6 koperta -> onComplete.
// Pełna wersja (jeden załącznik, panele): migration-spec.md.

import React, { useState } from 'react';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { PendriveConfig } from './types';
import { StubShell, StubHeader, StubChoiceList, StubActionButton, StubNote } from './ui';

type Phase = 'attachment' | 'bind' | 'volume' | 'envelope' | 'done';

export const PendriveApp: React.FC<BlockProps<PendriveConfig>> = ({ config, onDecision, onComplete }) => {
  const [phase, setPhase] = useState<Phase>('attachment');
  const [locked, setLocked] = useState(false);

  const report = (d: PendriveConfig['attachments'], o: ChoiceOption, next: Phase) => {
    if (locked) return;
    onDecision({ num: d.decisionNum, question: d.question, answer: o.label, tier: o.tier, feedback: o.feedback });
    if (o.tier === 'critical') { setLocked(true); return; }
    setPhase(next);
    // Ostatnia decyzja etapu (koperta) kończy etap — mostek do drona.
    if (next === 'done') onComplete();
  };

  return (
    <StubShell>
      <StubHeader
        title="//DYSK E: PENDRIVE"
        task={
          phase === 'attachment' ? config.attachments.question
          : phase === 'bind' ? config.bindPrompt
          : phase === 'volume' ? config.volume.question
          : phase === 'envelope' ? config.envelope.question
          : config.successMessage
        }
      />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {phase === 'attachment' && (
          <StubChoiceList options={config.attachments.options} disabled={locked} onPick={(o) => report(config.attachments, o, 'bind')} />
        )}
        {phase === 'bind' && (
          <div className="space-y-4">
            <StubNote>{config.bindPrompt}</StubNote>
            <StubActionButton label="[PODEPNIJ //WIRUS: RAT W ARCHIWUM ZIP]" onClick={() => setPhase('volume')} />
          </div>
        )}
        {phase === 'volume' && (
          <StubChoiceList options={config.volume.options} disabled={locked} onPick={(o) => report(config.volume, o, 'envelope')} />
        )}
        {phase === 'envelope' && (
          <StubChoiceList options={config.envelope.options} disabled={locked} onPick={(o) => report(config.envelope, o, 'done')} />
        )}
        {phase === 'done' && <StubNote>{config.successMessage}</StubNote>}
      </div>
    </StubShell>
  );
};
