// //DRON — widok z kamery drona nad parkingiem (D6). 8 aut z góry w losowym rozmieszczeniu; gracz rozpoznaje
// auto po opisie mentora z czatu (nie ma obrazka-wzorca ani podpisów przy autach). Kliknięcie ustawia celownik,
// a o tym, w co trafił, decyduje droneLogic.resolveDropOptionId (te same wymiary, co rysunek poniżej).
// Interfejs nie ocenia: celownik wygląda tak samo na dobrym aucie, na złym i na asfalcie.

import React, { useEffect, useRef, useState } from 'react';
import { BatteryMedium } from 'lucide-react';
import type { CarShape } from './types';
import {
  CAR_DIMS,
  LANE_Y,
  PARKING_SCENE,
  carRoofCenter,
  clientToScene,
  formatClock,
  parkingSlots,
  type PlacedCar,
  type Point
} from './droneLogic';
import { resolveAsset } from './siteAssets';

const RETICLE = '#00ff66';

/** Auto z góry (nosem do góry), współrzędne lokalne: (0,0) = lewy górny róg prostokąta auta. */
const CarTopDown: React.FC<{ shape: CarShape; body: string; roof: string }> = ({ shape, body, roof }) => {
  const { w, h, cabinStart, cabinLen } = CAR_DIMS[shape];
  const cabinY = h * cabinStart;
  const cabinH = h * cabinLen;
  const inset = w * 0.15;
  const frontGlass = `${inset + 1},${cabinY + 2} ${w - inset - 1},${cabinY + 2} ${w - inset - 6},${cabinY - 13} ${inset + 6},${cabinY - 13}`;
  const rearBottom = cabinY + cabinH;
  const rearGlass = `${inset + 1},${rearBottom - 2} ${w - inset - 1},${rearBottom - 2} ${w - inset - 5},${rearBottom + 9} ${inset + 5},${rearBottom + 9}`;
  return (
    <g>
      <rect x={5} y={6} width={w} height={h} rx={16} fill="#000" opacity={0.35} />
      {/* koła wystające spod nadwozia */}
      {[h * 0.14, h * 0.7].map((y) => (
        <g key={y}>
          <rect x={-3} y={y} width={7} height={22} rx={2.5} fill="#0a0f16" />
          <rect x={w - 4} y={y} width={7} height={22} rx={2.5} fill="#0a0f16" />
        </g>
      ))}
      {/* lusterka */}
      <rect x={-5} y={cabinY - 4} width={6} height={9} rx={2} fill={body} stroke="#0b1220" strokeWidth={1} />
      <rect x={w - 1} y={cabinY - 4} width={6} height={9} rx={2} fill={body} stroke="#0b1220" strokeWidth={1} />
      <rect x={0} y={0} width={w} height={h} rx={16} fill={body} stroke="#0b1220" strokeWidth={2} />
      {/* światła */}
      <rect x={6} y={3} width={13} height={5} rx={2} fill="#fde68a" />
      <rect x={w - 19} y={3} width={13} height={5} rx={2} fill="#fde68a" />
      <rect x={6} y={h - 8} width={13} height={5} rx={2} fill="#b91c1c" />
      <rect x={w - 19} y={h - 8} width={13} height={5} rx={2} fill="#b91c1c" />
      <polygon points={frontGlass} fill="#0f1b2a" />
      <polygon points={rearGlass} fill="#0f1b2a" />
      <rect x={inset} y={cabinY} width={w - inset * 2} height={cabinH} rx={7} fill={roof} stroke="#0b1220" strokeOpacity={0.55} strokeWidth={1.4} />
      <line x1={inset + 6} y1={cabinY + 5} x2={w - inset - 6} y2={cabinY + 5} stroke="#fff" strokeOpacity={0.22} strokeWidth={1.5} />
    </g>
  );
};

/** Koperta zrzucona na dach (po zatwierdzeniu zrzutu). */
const DroppedEnvelope: React.FC<{ at: Point }> = ({ at }) => (
  <g transform={`translate(${at.x - 17} ${at.y - 11})`}>
    <rect x={2} y={3} width={34} height={22} rx={2} fill="#000" opacity={0.4} />
    <rect width={34} height={22} rx={2} fill="#fef08a" stroke="#ca8a04" strokeWidth={1.5} />
    <polyline points="0,1 17,13 34,1" fill="none" stroke="#ca8a04" strokeWidth={1.5} />
  </g>
);

const Reticle: React.FC<{ at: Point; locked: boolean }> = ({ at, locked }) => (
  <g transform={`translate(${at.x} ${at.y})`} pointerEvents="none" opacity={locked ? 1 : 0.55}>
    <circle r={30} fill="none" stroke={RETICLE} strokeWidth={locked ? 2.5 : 1.5} strokeDasharray={locked ? undefined : '5 5'} />
    <circle r={3} fill={RETICLE} />
    {[
      [0, -40, 0, -20],
      [0, 20, 0, 40],
      [-40, 0, -20, 0],
      [20, 0, 40, 0]
    ].map(([x1, y1, x2, y2]) => (
      <line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={RETICLE} strokeWidth={2.5} />
    ))}
  </g>
);

interface DroneCameraProps {
  accent: string;
  placed: PlacedCar[];
  /** Zablokowany punkt celownika (po kliknięciu). */
  aim: Point | null;
  /** Gdy podane, scena przyjmuje kliknięcia (celowanie); po zrzucie brak. */
  onAim?: (point: Point) => void;
  /** Koperta leży na wskazanym punkcie. */
  dropped?: boolean;
  /** Stan baterii (%) i podpis zegara transmisji (HUD z dokumentu). */
  batteryPercent: number;
  transmissionLabel: string;
  /** Podpis łącza wideo przy znaczniku REC. */
  videoLabel: string;
  /** Opcjonalna grafika parkingu (`assets/drone/parking.*`) jako tło asfaltu. */
  parkingName?: string;
}

export const DroneCamera: React.FC<DroneCameraProps> = ({
  accent,
  placed,
  aim,
  onAim,
  dropped = false,
  batteryPercent,
  transmissionLabel,
  videoLabel,
  parkingName = 'parking'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<Point | null>(null);
  const [seconds, setSeconds] = useState(0);
  const interactive = !!onAim;

  // Zegar transmisji tyka, dopóki scena żyje.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const toScene = (e: React.PointerEvent | React.MouseEvent): Point | null => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return null;
    return clientToScene({ x: e.clientX, y: e.clientY }, box);
  };

  const slots = parkingSlots(placed.length);
  const imageUrl = resolveAsset('drone', parkingName);
  const { width, height } = PARKING_SCENE;

  return (
    <div className="relative w-full h-full min-h-0 rounded-lg overflow-hidden border border-gray-800 bg-[#1c2530]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={`absolute inset-0 w-full h-full ${interactive ? 'cursor-crosshair' : ''}`}
        role="group"
        aria-label="Parking widziany z drona"
        onPointerMove={interactive ? (e) => setHover(toScene(e)) : undefined}
        onPointerLeave={interactive ? () => setHover(null) : undefined}
        onClick={
          interactive
            ? (e) => {
                const p = toScene(e);
                if (p) onAim!(p);
              }
            : undefined
        }
      >
        <defs>
          <pattern id="droneAsphalt" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#1c2530" />
            <circle cx="5" cy="7" r="0.9" fill="#2a3644" />
            <circle cx="17" cy="4" r="0.7" fill="#273241" />
            <circle cx="12" cy="16" r="1" fill="#2a3644" />
            <circle cx="21" cy="20" r="0.7" fill="#161e28" />
            <circle cx="3" cy="19" r="0.8" fill="#161e28" />
          </pattern>
          <radialGradient id="droneVignette" cx="50%" cy="50%" r="75%">
            <stop offset="60%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <rect width={width} height={height} fill="url(#droneAsphalt)" />
        {imageUrl && <image href={imageUrl} width={width} height={height} preserveAspectRatio="xMidYMid slice" />}
        {/* krawężniki na brzegach sceny */}
        <rect width={width} height={14} fill="#2b3643" />
        <rect y={height - 14} width={width} height={14} fill="#2b3643" />

        {/* linie miejsc: rząd górny otwarty ku jezdni od dołu, dolny od góry */}
        {slots.map((s, i) => {
          const top = i < 4;
          const d = top
            ? `M ${s.x} ${s.y + s.h} L ${s.x} ${s.y} L ${s.x + s.w} ${s.y} L ${s.x + s.w} ${s.y + s.h}`
            : `M ${s.x} ${s.y} L ${s.x} ${s.y + s.h} L ${s.x + s.w} ${s.y + s.h} L ${s.x + s.w} ${s.y}`;
          return <path key={i} d={d} fill="none" stroke="#cbd5e1" strokeOpacity={0.55} strokeWidth={3} />;
        })}
        {/* oś jezdni */}
        <line x1={20} y1={LANE_Y} x2={width - 20} y2={LANE_Y} stroke="#eab308" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="26 18" />

        {placed.map(({ car, rect }) => (
          <g
            key={car.id}
            transform={`translate(${rect.x} ${rect.y})`}
            role={interactive ? 'button' : 'img'}
            tabIndex={interactive ? 0 : undefined}
            aria-label={car.desc}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onAim!(carRoofCenter(rect, car.shape));
                    }
                  }
                : undefined
            }
            className="focus:outline-none"
          >
            <CarTopDown shape={car.shape} body={car.body} roof={car.roof} />
          </g>
        ))}

        {dropped && aim && <DroppedEnvelope at={aim} />}
        {interactive && hover && <Reticle at={hover} locked={false} />}
        {aim && !dropped && <Reticle at={aim} locked />}
        {dropped && aim && (
          <circle cx={aim.x} cy={aim.y} r={30} fill="none" stroke={RETICLE} strokeWidth={2} pointerEvents="none" opacity={0.7} />
        )}

        <rect width={width} height={height} fill="url(#droneVignette)" pointerEvents="none" />
      </svg>

      <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-25" />

      {/* HUD */}
      <div className="absolute top-2 left-3 flex items-center gap-2 text-xs font-black text-white pointer-events-none bg-black/50 px-2 py-1 rounded">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        <span className="tracking-wider">REC</span>
        <span className="font-bold text-gray-200 hidden md:inline">{videoLabel}</span>
      </div>
      <div className="absolute top-2 right-3 flex items-center gap-3 text-xs font-black pointer-events-none">
        <span className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded text-white">
          <BatteryMedium size={16} style={{ color: accent }} />
          {batteryPercent}%
        </span>
        <span className="bg-black/50 px-2 py-1 rounded text-white tabular-nums">
          {transmissionLabel} {formatClock(seconds)}
        </span>
      </div>
    </div>
  );
};
