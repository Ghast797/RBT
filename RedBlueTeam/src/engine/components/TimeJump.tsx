import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface TimeJumpProps {
  /** Tekst narracji przeskoku (np. "MIJA KILKA GODZIN…"). */
  label?: string;
  /** Podtekst (np. "CZEKAMY, AŻ REKRUTER OTWORZY CV"). */
  sublabel?: string;
  /** Czas trwania animacji w ms (domyślnie 3000). */
  durationMs?: number;
  onDone: () => void;
  accent?: string;
}

/**
 * Ekran „przeskoku czasu" — narracyjna pauza między etapami (np. po wysłaniu maila,
 * gdy czekamy aż ofiara otworzy załącznik). Odpowiednik przeskoku czasu z Misji 3.
 * Zob. docs/scenario-engine.md (tempo/loadery).
 */
export const TimeJump: React.FC<TimeJumpProps> = ({
  label = 'MIJA CZAS…',
  sublabel,
  durationMs = 3000,
  onDone,
  accent = '#00ff66'
}) => {
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const steps = 20;
    const tick = Math.max(40, Math.floor(durationMs / steps));
    let current = 0;
    const id = setInterval(() => {
      current += 100 / steps;
      setProgress(Math.min(100, current));
      if (Math.round(current) % 20 === 0) sounds.playRadarBlip();
      if (current >= 100) {
        clearInterval(id);
        if (!doneRef.current) {
          doneRef.current = true;
          sounds.playNotification();
          setTimeout(onDone, 200);
        }
      }
    }, tick);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#05090f] text-gray-200 font-mono select-none p-8 space-y-5">
      <div className="relative">
        <Clock size={56} className="animate-spin" style={{ color: accent, animationDuration: '3s' }} />
        <span className="absolute inset-0 rounded-full animate-ping" style={{ boxShadow: `0 0 30px ${accent}` }} />
      </div>
      <div className="text-sm font-bold tracking-widest text-center animate-pulse" style={{ color: accent }}>
        {label}
      </div>
      {sublabel && <div className="text-[0.6875rem] text-gray-400 text-center max-w-sm">{sublabel}</div>}
      <div className="w-56 h-1.5 bg-[#0a1610] border rounded overflow-hidden" style={{ borderColor: `${accent}66` }}>
        <div className="h-full transition-all duration-150" style={{ width: `${progress}%`, backgroundColor: accent }} />
      </div>
    </div>
  );
};
