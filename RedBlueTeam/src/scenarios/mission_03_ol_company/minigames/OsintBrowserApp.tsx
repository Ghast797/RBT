// Etap 2 — //TOR: PRZEGLĄDARKA (stub szkieletu). D2: wybór celu z małym
// rozgałęzieniem (suboptimal cofa, critical wykrywa, ideal przechodzi) +
// D3: wektor socjotechniczny. Pełna wersja OSINT: migration-spec.md.

import React, { useState } from 'react';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { OsintBrowserConfig } from './types';
import { StubShell, StubHeader, StubChoiceList, StubNote } from './ui';

export const OsintBrowserApp: React.FC<BlockProps<OsintBrowserConfig>> = ({ config, onDecision, onComplete }) => {
  const [screen, setScreen] = useState<'target' | 'vector'>('target');
  const [locked, setLocked] = useState(false);
  const [pushback, setPushback] = useState<string | null>(null);
  // Czy gracz wybrał wcześniej zły (suboptimal) cel — końcowe D2 agreguje się do suboptimal.
  const [attempted, setAttempted] = useState(false);

  const pickTarget = (o: ChoiceOption) => {
    if (locked) return;
    if (o.tier === 'critical') {
      onDecision({ num: config.target.decisionNum, question: config.target.question, answer: o.label, tier: 'critical', feedback: o.feedback });
      setLocked(true);
      return;
    }
    if (o.tier === 'suboptimal') {
      // Mentor cofa do ponownego wyboru (mechanika silnika, bez gałęzi w store).
      setAttempted(true);
      setPushback(o.feedback);
      return;
    }
    // ideal — poziom końcowy zależy od wcześniejszych prób.
    const tier = attempted ? 'suboptimal' : 'ideal';
    onDecision({
      num: config.target.decisionNum,
      question: config.target.question,
      answer: o.label,
      tier,
      feedback: o.feedback
    });
    setPushback(null);
    setScreen('vector');
  };

  const pickVector = (o: ChoiceOption) => {
    if (locked) return;
    onDecision({ num: config.vector.decisionNum, question: config.vector.question, answer: o.label, tier: o.tier, feedback: o.feedback });
    if (o.tier === 'critical') { setLocked(true); return; }
    onComplete();
  };

  return (
    <StubShell>
      <StubHeader
        title="//TOR: PRZEGLĄDARKA"
        task={screen === 'target' ? config.target.question : config.vector.question}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {config.eventsHint && <StubNote>OSINT: {config.eventsHint}</StubNote>}
        {screen === 'target' ? (
          <>
            {pushback && (
              <div className="p-3 rounded bg-[#ff3366]/10 border border-[#ff3366]/60 text-xs text-[#ff3366] font-bold">
                {pushback} <span className="text-[#00ff66]">Wybierz inny cel.</span>
              </div>
            )}
            <StubChoiceList options={config.target.options} disabled={locked} onPick={pickTarget} />
          </>
        ) : (
          <StubChoiceList options={config.vector.options} disabled={locked} onPick={pickVector} />
        )}
      </div>
    </StubShell>
  );
};
