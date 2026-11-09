// TYMCZASOWY wspólny ekran zaślepek minigier M3 (porcja B przebudowy, docs/rebuild-plan.md).
// Pełne wersje minigier (porcje C–G) zastępują VirusLabApp/OsintBrowserApp/PendriveApp/DroneApp/RatSessionApp
// i przestają go używać; po ostatniej z nich plik należy usunąć. Zaślepka spełnia kontrakt BlockProps:
// pokazuje dane z configu jako przyciski (onDecision) i na końcu woła onComplete.

import React, { useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { sounds } from '../../../engine/audio/soundEffects';
import type { ReportableOption } from './types';

export interface StubStep {
  /** Pytanie ekranu (nagłówek kroku). */
  question: string;
  options: ReportableOption[];
  /** Wywoływane po kliknięciu opcji (tu minigra woła `onDecision`). */
  onPick: (option: ReportableOption) => void;
}

export const StubScreen: React.FC<{
  icon: LucideIcon;
  accent: string;
  title: string;
  /** Linie z danych configu pokazane nad wyborem (np. wartości do sprawdzenia w przeglądarce). */
  info?: string[];
  steps: StubStep[];
  finishLabel: string;
  onComplete: () => void;
}> = ({ icon, accent, title, info = [], steps, finishLabel, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const finishedRef = useRef(false);
  const step = steps[stepIndex];

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader
        icon={icon}
        accent={accent}
        title={title}
        subtitle="ZAŚLEPKA — pełna wersja w przygotowaniu"
        task={step ? step.question : finishLabel}
      />
      <div className="flex-1 min-h-0 overflow-auto space-y-3">
        {info.length > 0 && (
          <div className="rounded-lg border p-3 text-xs space-y-1" style={{ borderColor: `${accent}55` }}>
            {info.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        )}
        {step ? (
          <div className="space-y-2">
            {step.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className="w-full text-left p-3 rounded-lg border text-sm font-bold cursor-pointer hover:bg-white/5"
                style={{ borderColor: `${accent}66` }}
                onClick={() => {
                  sounds.playClick();
                  step.onPick(o);
                  setStepIndex((i) => i + 1);
                }}
              >
                {o.label}
                {o.desc ? <span className="block text-xs font-normal text-gray-400">{o.desc}</span> : null}
              </button>
            ))}
          </div>
        ) : (
          <ConfirmButton accent={accent} label={finishLabel} onClick={finish} />
        )}
      </div>
    </div>
  );
};
