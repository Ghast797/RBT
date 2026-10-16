import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../audio/soundEffects';

interface ModuleLoaderProps {
  /** Nagłówek paska (np. "ŁADOWANIE MODUŁU: SKANER SYGNATURY"). */
  label?: string;
  /** Czas trwania ładowania w ms (domyślnie 1000). */
  durationMs?: number;
  /** Wywoływane po dojściu do 100%. */
  onDone: () => void;
  /** Kolor akcentu (hex). */
  accent?: string;
}

/**
 * Krótki ekran ładowania „czucia komputera" — pasek postępu w tempie sekwencji BIOS.
 * Reużywalny między ekranami minigry (otwarcie modułu, przejście do kolejnego kroku).
 * Zob. docs/scenario-engine.md (tempo/loadery).
 */
export const ModuleLoader: React.FC<ModuleLoaderProps> = ({
  label = 'ŁADOWANIE MODUŁU…',
  durationMs = 1000,
  onDone,
  accent = '#a855f7'
}) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const steps = 10;
    const tick = Math.max(40, Math.floor(durationMs / steps));
    let current = 0;
    const id = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current % 30 === 0) sounds.playClick(1200, 0.02);
      if (current >= 100) {
        clearInterval(id);
        if (!doneRef.current) {
          doneRef.current = true;
          sounds.playSuccess();
          setTimeout(onDone, 180);
        }
      }
    }, tick);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#05090f] text-gray-200 font-mono select-none p-8 space-y-4">
      <div className="text-xs font-bold tracking-widest text-center" style={{ color: accent }}>
        {label}
      </div>
      <div className="w-64 h-3 bg-[#0a1610] border rounded p-0.5" style={{ borderColor: accent }}>
        <div
          className="h-full rounded transition-all duration-100"
          style={{ width: `${progress}%`, backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
        />
      </div>
      <div className="text-[10px] text-gray-500 font-mono">{progress}%</div>
    </div>
  );
};
