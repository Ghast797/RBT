// Klocek „zdrapka” (M3 i M4, scena „matryca kompilacji”). Gracz przeciąga kursorem (myszą albo palcem) po
// czarnej masce, spod której wyłania się grafika, a pasek postępu rośnie segmentami i zapalają się podpisy części.
// Cała matematyka odsłaniania jest w core/matrixLogic.ts; tu jest tylko rysowanie i obsługa wskaźnika.
//
// Pole ma stałą rozdzielczość wewnętrzną (960×540), więc zmiana rozmiaru okna ani ukrycie aplikacji na pulpicie
// (display: none w AppHost) nie kasują zdrapanych miejsc. Komponent nie zna oceny i nie raportuje decyzji.
// Silnik nie zna mechanizmu grafik misji: grafikę pod maską rysuje `renderImage(variant)` podane przez misję.
// To fragment ekranu (bez AppHeader i bez przycisku dalej), osadzany w minigrze misji, nie samodzielny etap.

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CheckCircle2, MousePointer2 } from 'lucide-react';
import { sounds } from '../audio/soundEffects';
import type { MatrixVariant, ScratchMatrixConfig } from '../types/mission';
import {
  createGrid,
  matrixView,
  revealStroke,
  revealedFraction,
  type NormPoint
} from '../core/matrixLogic';

/** Rozdzielczość wewnętrzna płótna (proporcje 16:9 jak siatka w matrixLogic). */
const CANVAS_W = 960;
const CANVAS_H = 540;
const ASPECT = CANVAS_W / CANVAS_H;
/** Promień pędzla jako ułamek szerokości pola. */
const BRUSH_RADIUS = 0.07;
/** Po tylu ms bez zdrapywania pojawia się wskazówka z przesuwającą się ręką. */
const HINT_AFTER_MS = 4000;

/** Maska: ciemne pole z siatką i dużym „?”. */
function drawMask(ctx: CanvasRenderingContext2D, accent: string) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#04070b';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.strokeStyle = `${accent}22`;
  ctx.lineWidth = 1;
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }
  ctx.fillStyle = `${accent}55`;
  ctx.font = 'bold 340px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', CANVAS_W / 2, CANVAS_H / 2 + 14);
}

export interface ScratchMatrixProps<TImage = unknown> {
  /** Teksty i parametry zdrapki (warianty nie są tu czytane: wybrany podaje `variant`). */
  config: Omit<ScratchMatrixConfig<TImage>, 'variants'>;
  /** Wybrany wariant: grafika, tekst alternatywny i podpisy części. */
  variant: MatrixVariant<TImage>;
  /** Akcent aplikacji (ramka, podpisy, domyślny kolor maski i paska). */
  accent: string;
  /** Zdrapka zakończona i komunikat sukcesu widoczny (minigra zaraz kończy etap lub pokazuje przycisk dalej). */
  done: boolean;
  /** Pasek doszedł do 100% (wołane raz). */
  onRevealed: () => void;
  /** Grafika pod maską; wypełnia pole (proporcje 16:9), np. `<ImageSlot asset={v.image} … />` misji. */
  renderImage: (variant: MatrixVariant<TImage>) => React.ReactNode;
}

export function ScratchMatrix<TImage = unknown>({
  config,
  variant,
  accent,
  done,
  onRevealed,
  renderImage
}: ScratchMatrixProps<TImage>) {
  const maskColor = config.maskColor ?? accent;
  const barColor = variant.barColor ?? config.barColor ?? accent;
  const gridRef = useRef(createGrid());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ active: boolean; last: NormPoint | null }>({ active: false, last: null });
  const onRevealedRef = useRef(onRevealed);
  onRevealedRef.current = onRevealed;
  const revealedSentRef = useRef(false);
  const lastSegmentsRef = useRef(0);

  const [fraction, setFraction] = useState(0);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [hint, setHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { complete, segmentsLit, partsLit, percent } = matrixView(
    fraction,
    config.revealThreshold,
    config.segments,
    variant.parts.length
  );

  // Wskazówka po bezczynności (zdrapywanie ją chowa i odlicza od nowa).
  const armHint = useCallback(() => {
    if (hintTimerRef.current !== null) clearTimeout(hintTimerRef.current);
    setHint(false);
    hintTimerRef.current = setTimeout(() => setHint(true), HINT_AFTER_MS);
  }, []);
  useEffect(() => {
    armHint();
    return () => {
      if (hintTimerRef.current !== null) clearTimeout(hintTimerRef.current);
    };
  }, [armHint]);
  useEffect(() => {
    if (complete && hintTimerRef.current !== null) {
      clearTimeout(hintTimerRef.current);
      setHint(false);
    }
  }, [complete]);

  // Maska rysowana raz, w chwili podpięcia płótna (pojawia się dopiero po zmierzeniu miejsca; stała rozdzielczość).
  const attachCanvas = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasRef.current = el;
      const ctx = el?.getContext('2d');
      if (ctx) drawMask(ctx, maskColor);
    },
    [maskColor]
  );

  // Pole o stałych proporcjach 16:9 wpisane w dostępne miejsce. Zerowe rozmiary (aplikacja ukryta) ignorujemy.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w <= 0 || h <= 0) return;
      const fitW = Math.min(w, h * ASPECT);
      setBox({ w: Math.floor(fitW), h: Math.floor(fitW / ASPECT) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dźwięk przy zapaleniu kolejnego segmentu.
  useEffect(() => {
    if (segmentsLit > lastSegmentsRef.current) sounds.playClick(900 + segmentsLit * 60, 0.03);
    lastSegmentsRef.current = segmentsLit;
  }, [segmentsLit]);

  useEffect(() => {
    if (complete && !revealedSentRef.current) {
      revealedSentRef.current = true;
      onRevealedRef.current();
    }
  }, [complete]);

  const toNorm = (e: React.PointerEvent<HTMLCanvasElement>): NormPoint => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  /** Zdrapuje odcinek: ślad na płótnie (gumka) i odsłonięcie komórek w siatce. */
  const scratch = (from: NormPoint, to: NormPoint) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = '#000'; // gumka kasuje proporcjonalnie do krycia koloru, więc kolor musi być pełny
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = BRUSH_RADIUS * 2 * CANVAS_W;
      ctx.beginPath();
      ctx.moveTo(from.x * CANVAS_W, from.y * CANVAS_H);
      ctx.lineTo(to.x * CANVAS_W + 0.01, to.y * CANVAS_H);
      ctx.stroke();
    }
    const added = revealStroke(gridRef.current, from, to, BRUSH_RADIUS);
    if (added > 0) setFraction(revealedFraction(gridRef.current));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (complete || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toNorm(e);
    pointerRef.current = { active: true, last: p };
    armHint();
    scratch(p, p); // klik albo stuknięcie też odsłania
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const st = pointerRef.current;
    if (!st.active || !st.last) return;
    const p = toNorm(e);
    scratch(st.last, p);
    st.last = p;
    armHint();
  };
  const endPointer = () => {
    pointerRef.current = { active: false, last: null };
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <style>{`@keyframes scratch-matrix-hint { 0% { transform: translate(-30%, 25%); opacity: 0 } 15% { opacity: 1 } 80% { opacity: 1 } 100% { transform: translate(30%, -25%); opacity: 0 } }`}</style>

      {/* Nagłówek ekranu; po 100% zmienia się w komunikat sukcesu. */}
      {done ? (
        <div
          className="shrink-0 flex items-center justify-center gap-3 px-4 py-2 rounded-lg border-2 animate-in fade-in duration-200"
          style={{ borderColor: '#00ff66', backgroundColor: '#00ff6618' }}
        >
          <CheckCircle2 size={22} className="text-[#00ff66] shrink-0" />
          <span className="text-sm sm:text-base font-black text-white tracking-wider text-center">{config.doneMessage}</span>
        </div>
      ) : (
        <div className="shrink-0 text-sm font-black tracking-widest text-center" style={{ color: accent }}>
          {config.heading}
        </div>
      )}

      <div className="flex-1 min-h-0 flex gap-4">
        {/* Pole zdrapki. */}
        <div ref={wrapRef} className="flex-1 min-w-0 min-h-0 flex items-center justify-center">
          {box && (
            <div
              className="relative rounded-xl overflow-hidden border-2 transition-shadow duration-500"
              style={{
                width: box.w,
                height: box.h,
                borderColor: complete ? '#00ff66' : `${accent}99`,
                boxShadow: complete ? '0 0 28px #00ff6666' : `0 0 18px ${accent}33`
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 50%, ${accent}55 0%, #16263b 60%, #0e1a2a 100%)` }}
              >
                {renderImage(variant)}
              </div>
              <canvas
                ref={attachCanvas}
                width={CANVAS_W}
                height={CANVAS_H}
                className="absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-300"
                style={{ touchAction: 'none', opacity: complete ? 0 : 1, pointerEvents: complete ? 'none' : 'auto' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
                onLostPointerCapture={endPointer}
              />
              {hint && !complete && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2">
                  <MousePointer2
                    size={44}
                    className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ animation: 'scratch-matrix-hint 1.8s ease-in-out infinite' }}
                  />
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black tracking-widest animate-pulse"
                    style={{ backgroundColor: accent, color: '#05090f' }}
                  >
                    {config.hint}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Podpisane części programu: zapalają się w trakcie odsłaniania. */}
        <div className="w-[38%] max-w-[22rem] shrink-0 min-h-0 flex flex-col justify-center gap-2.5">
          {variant.parts.map((part, i) => {
            const lit = i < partsLit;
            return (
              <div
                key={part.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 transition-all duration-150"
                style={{
                  borderColor: lit ? accent : '#1f2937',
                  backgroundColor: lit ? `${accent}1f` : '#0b1724',
                  boxShadow: lit ? `0 0 16px ${accent}44` : undefined,
                  opacity: lit ? 1 : 0.55
                }}
              >
                <span
                  className="mt-1 w-3 h-3 rounded-full shrink-0 transition-all duration-150"
                  style={{
                    backgroundColor: lit ? '#00ff66' : '#374151',
                    boxShadow: lit ? '0 0 10px #00ff66' : undefined
                  }}
                />
                <div className="min-w-0">
                  <div className={`text-xs font-black tracking-widest ${lit ? 'text-white' : 'text-gray-400'}`}>{part.label}</div>
                  <div className={`text-sm leading-snug font-sans ${lit ? 'text-gray-100' : 'text-gray-500'}`}>{part.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Segmentowy pasek postępu. */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="flex-1 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          {Array.from({ length: config.segments }, (_, i) => {
            const on = i < segmentsLit;
            return (
              <div
                key={i}
                className="flex-1 h-4 rounded-sm border transition-all duration-200"
                style={{
                  borderColor: on ? (complete ? '#00ff66' : barColor) : '#1f2937',
                  backgroundColor: on ? (complete ? '#00ff66' : barColor) : '#0b1724',
                  boxShadow: on ? `0 0 8px ${complete ? '#00ff66' : barColor}88` : undefined
                }}
              />
            );
          })}
        </div>
        <span className="w-12 text-right text-sm font-black font-mono text-white">{percent}%</span>
      </div>
    </div>
  );
}
