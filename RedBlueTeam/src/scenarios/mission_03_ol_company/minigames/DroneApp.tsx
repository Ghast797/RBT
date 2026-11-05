// Etap 4 — //DRON: CONDOR MIT63 (stub szkieletu). D7: adres domu ofiary,
// D8: pojazd ofiary na parkingu. Pełna wersja (mapa + kamera): migration-spec.md.

import React, { useState } from 'react';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { DroneConfig } from './types';
import { StubShell, StubHeader, StubChoiceList, StubNote } from './ui';

export const DroneApp: React.FC<BlockProps<DroneConfig>> = ({ config, onDecision, onComplete }) => {
  const [phase, setPhase] = useState<'address' | 'car' | 'done'>('address');
  const [locked, setLocked] = useState(false);

  const pickAddress = (o: ChoiceOption) => {
    if (locked) return;
    onDecision({ num: config.address.decisionNum, question: config.address.question, answer: o.label, tier: o.tier, feedback: o.feedback });
    if (o.tier === 'critical') { setLocked(true); return; }
    setPhase('car');
  };

  const pickCar = (o: ChoiceOption) => {
    if (locked) return;
    onDecision({ num: config.car.decisionNum, question: config.car.question, answer: o.label, tier: o.tier, feedback: o.feedback });
    if (o.tier === 'critical') { setLocked(true); return; }
    setPhase('done');
    onComplete();
  };

  return (
    <StubShell>
      <StubHeader
        title={config.droneStats.model}
        task={phase === 'address' ? config.address.question : phase === 'car' ? config.car.question : config.successDrop}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        <StubNote>{config.droneStats.video} · {config.droneStats.speed} · {config.droneStats.connection}</StubNote>
        {phase === 'address' && <StubChoiceList options={config.address.options} disabled={locked} onPick={pickAddress} />}
        {phase === 'car' && <StubChoiceList options={config.car.options} disabled={locked} onPick={pickCar} />}
        {phase === 'done' && <StubNote>{config.successDrop}</StubNote>}
      </div>
    </StubShell>
  );
};
