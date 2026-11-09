import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sounds } from '../audio/soundEffects';
import { clockAt, formatClock, handAngles, hoursElapsed, parseClock, resolveJumpClock } from '../core/clock';

interface TimeJumpProps {
  /** Opcjonalny podpis pod zegarem (czytelny, ale zegar zostaje głównym elementem). */
  label?: string;
  /** Drugi, mniejszy podpis. */
  sublabel?: string;
  /** Czas trwania animacji w ms (domyślnie 3000). */
  durationMs?: number;
  /**
   * Godzina startowa („HH:MM”). Razem z `clockTo` włącza lecący zegar cyfrowy.
   * Bez niej start to `clockTo` minus 3 h (Desktop podstawia zwykle bieżący `systemTime`).
   */
  clockFrom?: string;
  /** Godzina docelowa („HH:MM”). Bez niej: wariant bez cyfr (samo wirujące wskazówki). */
  clockTo?: string;
  onDone: () => void;
  accent?: string;
}

/** Wariant bez cyfr: wskazówki przelatują 6 godzin. */
const DIAL_ONLY_SPAN_MINUTES = 6 * 60;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Tarcza analogowa: 12 kresek i dwie wskazówki obracane według minut od północy. */
const Dial: React.FC<{ minutes: number; accent: string }> = ({ minutes, accent }) => {
  const { hour, minute } = handAngles(minutes);
  return (
    <svg viewBox="-60 -60 120 120" className="w-40 h-40" aria-hidden="true" style={{ filter: `drop-shadow(0 0 10px ${accent}66)` }}>
      <circle r="54" fill="#07131a" stroke={accent} strokeWidth="2" opacity="0.9" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="0"
          y1={i % 3 === 0 ? -46 : -49}
          x2="0"
          y2="-52"
          stroke={accent}
          strokeWidth={i % 3 === 0 ? 2.5 : 1.2}
          transform={`rotate(${i * 30})`}
          opacity={i % 3 === 0 ? 1 : 0.6}
        />
      ))}
      <line x1="0" y1="6" x2="0" y2="-28" stroke={accent} strokeWidth="4" strokeLinecap="round" transform={`rotate(${hour})`} />
      <line x1="0" y1="8" x2="0" y2="-42" stroke="#e5e7eb" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${minute})`} />
      <circle r="3.5" fill={accent} />
    </svg>
  );
};

/**
 * Ekran „przeskoku czasu” — narracyjna pauza między etapami (czekanie z VR).
 * Pokazuje lecący zegar: tarcza analogowa i (gdy podano `clockTo`) cyfrowa godzina,
 * która przewija się od `clockFrom` do `clockTo` krzywą ease-in-out przez `durationMs`.
 * Bez `clockTo` wirują tylko wskazówki, bez cyfr. `label`/`sublabel` to opcjonalny
 * podpis — silnik nie dodaje własnych tekstów typu „mija kilka godzin”.
 * Przy `prefers-reduced-motion` zegar od razu stoi na godzinie docelowej.
 * Zob. docs/scenario-engine.md, sekcja 5.
 */
export const TimeJump: React.FC<TimeJumpProps> = ({
  label,
  sublabel,
  durationMs = 3000,
  clockFrom,
  clockTo,
  onDone,
  accent = '#00ff66'
}) => {
  const [t, setT] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const jump = useMemo(() => {
    const resolved = resolveJumpClock(clockFrom, clockTo);
    if (import.meta.env?.DEV) {
      if (clockTo !== undefined && parseClock(clockTo) === null) {
        console.warn(`[TimeJump] Błędny format clockTo "${clockTo}" (oczekiwano HH:MM) — wariant bez cyfr.`);
      }
      if (clockFrom !== undefined && parseClock(clockFrom) === null) {
        console.warn(`[TimeJump] Błędny format clockFrom "${clockFrom}" (oczekiwano HH:MM) — start = clockTo minus 3 h.`);
      }
    }
    return resolved;
  }, [clockFrom, clockTo]);

  const from = jump ? jump.from : 0;
  const to = jump ? jump.to : DIAL_ONLY_SPAN_MINUTES;

  useEffect(() => {
    let raf = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    let finished = false;
    let lastHours = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      sounds.playNotification();
      finishTimer = setTimeout(() => onDoneRef.current(), 200);
    };

    if (prefersReducedMotion()) {
      setT(1);
      finishTimer = setTimeout(finish, durationMs);
      return () => {
        if (finishTimer) clearTimeout(finishTimer);
      };
    }

    const start = performance.now();
    const frame = (now: number) => {
      const next = durationMs <= 0 ? 1 : Math.min(1, (now - start) / durationMs);
      setT(next);
      // Cichy tyk za każdą godzinę, która właśnie minęła.
      const hours = hoursElapsed(from, to, next);
      if (hours > lastHours) {
        lastHours = hours;
        sounds.playRadarBlip();
      }
      if (next >= 1) finish();
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (finishTimer) clearTimeout(finishTimer);
    };
    // Animacja startuje raz przy montażu; kolejne zmiany propsów jej nie restartują.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = clockAt(from, to, t);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#05090f] text-gray-200 font-mono select-none p-8 space-y-5">
      <Dial minutes={minutes} accent={accent} />
      {jump && (
        <div
          className="text-6xl font-bold tabular-nums tracking-widest"
          style={{ color: accent, textShadow: `0 0 18px ${accent}aa` }}
          role="timer"
          aria-label={`Godzina ${formatClock(jump.to)}`}
        >
          {formatClock(minutes)}
        </div>
      )}
      {label && (
        <div className="text-lg font-bold tracking-widest text-center" style={{ color: accent }}>
          {label}
        </div>
      )}
      {sublabel && <div className="text-base text-gray-300 text-center max-w-md">{sublabel}</div>}
      <div className="w-56 h-1.5 bg-[#0a1610] border rounded overflow-hidden" style={{ borderColor: `${accent}66` }}>
        <div className="h-full" style={{ width: `${t * 100}%`, backgroundColor: accent }} />
      </div>
    </div>
  );
};
