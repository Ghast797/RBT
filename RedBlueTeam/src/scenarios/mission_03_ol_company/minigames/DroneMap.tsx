// //DRON — plan miasta z numerowanymi punktami (D5). Skaluje się do kontenera (bez sztywnych wysokości):
// tło to SVG rozciągnięte na całe pole, piny i podpisy to HTML w procentach pola, więc napisy mają stały,
// czytelny rozmiar niezależnie od okna. Samo kliknięcie w pin wybiera adres; ocena idzie tylko przez onDecision.

import React from 'react';
import type { AssetRef, DroneMapLocation } from './types';
import { DRONE_ORIGIN, flightPosition, locationPoint } from './droneLogic';
import { resolveAsset } from './siteAssets';

interface DroneMapProps {
  accent: string;
  locations: DroneMapLocation[];
  selectedId: string | null;
  /** Gdy podane, piny są klikalne (ekran wyboru adresu). */
  onSelect?: (id: string) => void;
  /** Postęp lotu 0..100; brak = dron stoi w pokoju hakera. */
  flightPct?: number;
  /** Podpis punktu startu (np. „POKÓJ HAKERA”). */
  originLabel: string;
  /** Grafika planu z configu (`config.images.cityMap`); brak pliku w `assets/drone/` = plan wektorowy. */
  image?: AssetRef;
}

/** Plan miasta (rzeka, ulice, bloki) rysowany jako tło; `non-scaling-stroke`, żeby linie nie pęczniały przy rozciąganiu. */
const MapBackdrop: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full"
    aria-hidden="true"
  >
    <rect width="100" height="100" fill="#06101a" />
    {imageUrl ? (
      <image href={imageUrl} width="100" height="100" preserveAspectRatio="none" />
    ) : (
      <>
        {/* Bloki zabudowy */}
        {[
          [4, 6, 18, 14], [26, 4, 14, 10], [44, 8, 12, 10], [70, 6, 20, 12],
          [6, 32, 12, 16], [24, 36, 16, 12], [48, 30, 14, 14], [74, 34, 14, 12],
          [8, 58, 14, 12], [34, 56, 14, 14], [56, 62, 16, 12], [78, 70, 14, 14],
          [48, 82, 14, 10], [68, 86, 12, 8]
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="#0b1a28" stroke="#13324a" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {/* Odra */}
        <path
          d="M 0 44 Q 24 52 46 42 T 100 48"
          fill="none"
          stroke="#00f0ff"
          strokeOpacity="0.4"
          strokeWidth="9"
          vectorEffect="non-scaling-stroke"
        />
        {/* Ulice */}
        {[
          'M 20 0 L 24 100', 'M 62 0 L 58 100', 'M 0 28 L 100 30', 'M 0 70 L 100 66', 'M 0 90 L 100 94'
        ].map((d) => (
          <path key={d} d={d} stroke="#334155" strokeOpacity="0.8" strokeWidth="3" strokeDasharray="10 6" fill="none" vectorEffect="non-scaling-stroke" />
        ))}
      </>
    )}
    {/* Siatka */}
    {Array.from({ length: 9 }, (_, i) => (
      <g key={i}>
        <line x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" stroke="#00ff66" strokeOpacity="0.07" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} stroke="#00ff66" strokeOpacity="0.07" vectorEffect="non-scaling-stroke" />
      </g>
    ))}
  </svg>
);

export const DroneMap: React.FC<DroneMapProps> = ({
  accent,
  locations,
  selectedId,
  onSelect,
  flightPct,
  originLabel,
  image
}) => {
  const target = locations.find((l) => l.id === selectedId);
  const flying = flightPct !== undefined && !!target;
  const dronePos = flying ? flightPosition(DRONE_ORIGIN, locationPoint(target), flightPct!) : DRONE_ORIGIN;
  const targetPos = target ? locationPoint(target) : null;

  return (
    <div className="relative w-full h-full min-h-0 rounded-lg overflow-hidden border border-gray-800 bg-[#06101a]">
      <MapBackdrop imageUrl={image ? resolveAsset(image.group, image.name) : undefined} />

      {/* Trasa lotu (współrzędne w procentach pola) */}
      {flying && targetPos && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <line x1={DRONE_ORIGIN.x} y1={DRONE_ORIGIN.y} x2={targetPos.x} y2={targetPos.y} stroke={accent} strokeOpacity="0.5" strokeWidth="2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
          <line x1={DRONE_ORIGIN.x} y1={DRONE_ORIGIN.y} x2={dronePos.x} y2={dronePos.y} stroke={accent} strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
      )}

      {/* Punkt startu */}
      <div className="absolute pointer-events-none" style={{ left: `${DRONE_ORIGIN.x}%`, top: `${DRONE_ORIGIN.y}%` }}>
        <div className="absolute -left-3.5 -translate-y-1/2 flex items-center gap-2">
          <span className="w-7 h-7 rounded border-2 border-cyan-300 bg-[#050e17] flex items-center justify-center text-sm font-black text-cyan-300">
            H
          </span>
          {!flying && (
            <span className="text-xs font-bold text-cyan-200 whitespace-nowrap bg-[#050e17]/80 px-1.5 py-0.5 rounded">{originLabel}</span>
          )}
        </div>
      </div>

      {/* Piny adresów: numer + adres + dzielnica w jednym przycisku */}
      {locations.map((loc) => {
        const selected = selectedId === loc.id;
        const flip = loc.x > 55;
        const interactive = !!onSelect;
        return (
          <div key={loc.id} className="absolute" style={{ left: `${loc.x}%`, top: `${loc.y}%` }}>
            <button
              type="button"
              disabled={!interactive}
              onClick={interactive ? () => onSelect!(loc.id) : undefined}
              aria-label={`${loc.number}: ${loc.address}, ${loc.district}`}
              aria-pressed={selected}
              className={`absolute top-0 -translate-y-1/2 flex items-center gap-2 ${flip ? 'right-[-18px] flex-row-reverse' : 'left-[-18px]'} ${
                interactive ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              <span
                className={`relative w-9 h-9 shrink-0 rounded-full border-2 flex items-center justify-center text-base font-black transition-transform ${
                  interactive ? 'group-hover:scale-110' : ''
                }`}
                style={{
                  borderColor: accent,
                  backgroundColor: selected ? accent : '#040d14',
                  color: selected ? '#05090f' : accent,
                  boxShadow: selected ? `0 0 0 3px ${accent}55, 0 0 18px ${accent}99` : `0 0 10px ${accent}40`
                }}
              >
                {selected && <span className="absolute inset-0 rounded-full animate-ping" style={{ border: `2px solid ${accent}` }} />}
                {loc.number}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md border-2 text-left leading-tight transition-colors ${
                  interactive ? 'group-hover:border-white/70' : ''
                }`}
                style={{
                  backgroundColor: '#050e17',
                  borderColor: selected ? accent : `${accent}66`,
                  boxShadow: selected ? `0 0 12px ${accent}66` : undefined
                }}
              >
                <span className="block text-sm font-bold text-white font-mono whitespace-nowrap">{loc.address}</span>
                <span className="block text-xs font-bold whitespace-nowrap" style={{ color: accent }}>
                  {loc.district}
                </span>
              </span>
            </button>
          </div>
        );
      })}

      {/* Dron */}
      <div className="absolute pointer-events-none" style={{ left: `${dronePos.x}%`, top: `${dronePos.y}%` }}>
        <svg viewBox="-20 -20 40 40" className="absolute w-9 h-9 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <circle r="7" fill="#050e17" stroke="#00f0ff" strokeWidth="2" />
          {[[-13, -13], [13, -13], [-13, 13], [13, 13]].map(([cx, cy]) => (
            <g key={`${cx}${cy}`}>
              <line x1="0" y1="0" x2={cx} y2={cy} stroke="#00f0ff" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="5" fill="#050e17" stroke="#00f0ff" strokeWidth="1.5" />
            </g>
          ))}
          <circle r="2.5" fill="#00f0ff" />
        </svg>
      </div>
    </div>
  );
};
