// Etap 1 — //BAZA_WIRUSÓW (stub szkieletu). D1: wybór wirusa (oceniane) +
// builder RAT jako aktywność nieoceniana (flavor): zły zestaw blokuje
// kompilację, poprawny wywołuje onComplete. Pełna wersja: migration-spec.md.

import React, { useState } from 'react';
import type { BlockProps } from '../../../engine/types/mission';
import type { ChoiceOption } from '../../../engine/types/mission';
import type { VirusLabConfig } from './types';
import { StubShell, StubHeader, StubChoiceList, StubActionButton, StubNote } from './ui';

export const VirusLabApp: React.FC<BlockProps<VirusLabConfig>> = ({ config, onDecision, onComplete }) => {
  const [virusId, setVirusId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [mod, setMod] = useState<string | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [pkg, setPkg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const chosen = config.virus.options.find((o) => o.id === virusId);
  const showBuilder = chosen && chosen.tier !== 'critical';

  const pickVirus = (o: ChoiceOption) => {
    if (locked) return;
    setVirusId(o.id);
    onDecision({
      num: config.virus.decisionNum,
      question: config.virus.question,
      answer: o.label,
      tier: o.tier,
      feedback: o.feedback
    });
    if (o.tier === 'critical') setLocked(true);
  };

  const compile = () => {
    if (!mod || !mask || !pkg) {
      setError('WYBIERZ WSZYSTKIE 3 PARAMETRY PRZED KOMPILACJĄ.');
      return;
    }
    const okMod = config.builder.modules.options.find((x) => x.id === mod)?.correct;
    const okMask = config.builder.masking.options.find((x) => x.id === mask)?.correct;
    const okPkg = config.builder.package.options.find((x) => x.id === pkg)?.correct;
    if (!okMod || !okMask || !okPkg) {
      const wrong = !okMod
        ? config.builder.modules.options.find((x) => x.id === mod)
        : !okMask
          ? config.builder.masking.options.find((x) => x.id === mask)
          : config.builder.package.options.find((x) => x.id === pkg);
      setError(`BŁĄD KOMPILACJI: ${wrong?.feedback ?? 'zły parametr ładunku.'}`);
      return;
    }
    setError(null);
    setDone(true);
    onComplete();
  };

  const Group: React.FC<{ title: string; opts: VirusLabConfig['builder']['modules']['options']; value: string | null; set: (v: string) => void }> = ({ title, opts, value, set }) => (
    <div className="space-y-2">
      <div className="text-xs font-black text-[#00ff66] tracking-wide">{title}</div>
      {opts.map((o) => (
        <label
          key={o.id}
          className={`block p-2.5 rounded border-2 cursor-pointer text-[0.6875rem] ${
            value === o.id ? 'bg-[#00ff66]/15 border-[#00ff66]' : 'bg-[#060a0f] border-slate-800 hover:border-slate-600'
          }`}
        >
          <input type="radio" className="hidden" checked={value === o.id} onChange={() => { setError(null); set(o.id); }} />
          <div className="font-bold text-white leading-snug">{o.label}</div>
          <div className="text-gray-400 mt-0.5 leading-relaxed">{o.desc}</div>
        </label>
      ))}
    </div>
  );

  return (
    <StubShell>
      <StubHeader title="//BAZA_WIRUSÓW" task={showBuilder ? 'Skonfiguruj i skompiluj ładunek RAT.' : config.virus.question} />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {!showBuilder ? (
          <StubChoiceList options={config.virus.options} selectedId={virusId} disabled={locked} onPick={pickVirus} />
        ) : (
          <div className="space-y-4">
            <StubNote>{config.builder.subtitle}</StubNote>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Group title={config.builder.modules.title} opts={config.builder.modules.options} value={mod} set={setMod} />
              <Group title={config.builder.masking.title} opts={config.builder.masking.options} value={mask} set={setMask} />
              <Group title={config.builder.package.title} opts={config.builder.package.options} value={pkg} set={setPkg} />
            </div>
            {error && (
              <div className="p-3 rounded bg-[#ff3366]/10 border border-[#ff3366]/60 text-xs text-[#ff3366] font-bold">{error}</div>
            )}
            {done ? (
              <StubNote>{config.builder.successMessage}</StubNote>
            ) : (
              <StubActionButton label="[KOMPILUJ ŁADUNEK]" onClick={compile} />
            )}
          </div>
        )}
      </div>
    </StubShell>
  );
};
