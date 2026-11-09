// Etap 4 — //DRON: CONDOR MIT63. D7: adres domu ofiary (mapa satelitarna), D8: pojazd ofiary
// na parkingu (kamera drona). Wzorzec M2: AppHeader, wybór karty/wiersza + ConfirmButton,
// pomocniczy panel na prawym monitorze. Interfejs milczy o ocenie — poziomy idą tylko przez onDecision.
// Spec: docs/migration-spec.md, sekcja 4.

import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Camera, Radio, Navigation, Send } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceRows } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { SidePanel } from '../../../engine/components/SidePanel';
import type { BlockProps } from '../../../engine/types/mission';
import type { DroneConfig, DroneCar, DroneMapLocation } from './types';
import { MentorNote, LOADER_MS } from './ui';

type Screen = 'attach' | 'attaching' | 'map' | 'flying' | 'load_camera' | 'camera' | 'dropping' | 'dropped';

/** Czas lotu drona do celu (ms) i czas komunikatu o zrzucie przed zakończeniem etapu. */
const FLIGHT_MS = 3200;
const DROP_MS = 1600;

/** Punkt startu drona na mapie (pokój hakera) — w układzie viewBox mapy. */
const ORIGIN = { x: 70, y: 362 };

const mapPoint = (loc: DroneMapLocation) => ({
  cx: (loc.x / 100) * 620 + 80,
  cy: (loc.y / 100) * 280 + 50
});

/** Samochód z góry (0,0 = lewy górny róg slotu 90x75). Jedno źródło dla parkingu i zdjęcia referencyjnego. */
const CarShape: React.FC<{ car: DroneCar }> = ({ car }) => (
  <g>
    <rect x={22} y={12} width={46} height={52} rx={10} fill={car.body} stroke="#000" strokeWidth={1.5} />
    <polygon points="28,22 62,22 59,27 31,27" fill="#0f172a" />
    <polygon points="28,48 62,48 59,43 31,43" fill="#0f172a" />
    <rect x={30} y={26} width={30} height={20} rx={3} fill={car.roof} stroke="#000" strokeWidth={1} />
  </g>
);

/** Mapa satelitarna z pinami adresów, punktem startu i (w locie) drogą drona. */
const SatelliteMap: React.FC<{
  accent: string;
  locations: DroneMapLocation[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  /** 0..100 — postęp lotu; undefined = dron stoi w pokoju hakera. */
  flightPct?: number;
}> = ({ accent, locations, selectedId, onSelect, flightPct }) => {
  const target = locations.find((l) => l.id === selectedId);
  const flying = flightPct !== undefined && !!target;
  const t = flying ? flightPct! / 100 : 0;
  const tp = target ? mapPoint(target) : null;
  const dx = tp ? ORIGIN.x + (tp.cx - ORIGIN.x) * t : ORIGIN.x;
  const dy = tp ? ORIGIN.y + (tp.cy - ORIGIN.y) * t : ORIGIN.y;

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa satelitarna Wrocławia">
      <defs>
        <pattern id="droneGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ff66" strokeWidth="0.5" strokeOpacity="0.12" />
        </pattern>
      </defs>
      <rect width="800" height="400" fill="#04090e" />
      <rect width="800" height="400" fill="url(#droneGrid)" />

      <path d="M 0 140 Q 240 180 440 120 T 800 160" fill="none" stroke="#00f0ff" strokeWidth="3.5" strokeOpacity="0.35" />
      <text x="560" y="128" fill="#00f0ff" fillOpacity="0.45" fontSize="12" textAnchor="middle" letterSpacing="4">
        RZEKA ODRA // SEKTOR POŁUDNIOWY
      </text>

      <line x1="160" y1="0" x2="190" y2="400" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" strokeOpacity="0.5" />
      <line x1="600" y1="0" x2="570" y2="400" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" strokeOpacity="0.5" />
      <line x1="0" y1="240" x2="800" y2="240" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" strokeOpacity="0.5" />

      <circle cx="400" cy="200" r="160" fill="none" stroke="#00ff66" strokeWidth="0.8" strokeOpacity="0.15" strokeDasharray="4,4" />
      <circle cx="400" cy="200" r="280" fill="none" stroke="#00ff66" strokeWidth="0.8" strokeOpacity="0.1" />

      {/* Punkt startu */}
      <g>
        <rect x={ORIGIN.x - 10} y={ORIGIN.y - 10} width={20} height={20} rx={3} fill="#050e17" stroke="#00f0ff" strokeWidth={2} />
        <text x={ORIGIN.x} y={ORIGIN.y + 5} textAnchor="middle" fill="#00f0ff" fontSize="13" fontWeight="900">
          H
        </text>
        <text x={ORIGIN.x + 18} y={ORIGIN.y + 5} fill="#00f0ff" fillOpacity="0.8" fontSize="13" fontWeight="bold">
          POKÓJ HAKERA
        </text>
      </g>

      {/* Trasa i dron w locie */}
      {flying && tp && (
        <g>
          <line x1={ORIGIN.x} y1={ORIGIN.y} x2={tp.cx} y2={tp.cy} stroke={accent} strokeWidth={2} strokeDasharray="6,5" strokeOpacity={0.5} />
          <line x1={ORIGIN.x} y1={ORIGIN.y} x2={dx} y2={dy} stroke={accent} strokeWidth={3} />
        </g>
      )}

      {locations.map((loc) => {
        const isSelected = selectedId === loc.id;
        const { cx, cy } = mapPoint(loc);
        const badgeW = 196;
        const badgeX = cx > 500 ? cx - badgeW - 25 : cx + 25;
        const badgeY = cy - 26;
        const interactive = !!onSelect;
        return (
          <g
            key={loc.id}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={`${loc.number}: ${loc.address}, ${loc.district}`}
            onClick={interactive ? () => onSelect!(loc.id) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect!(loc.id);
                    }
                  }
                : undefined
            }
            className={interactive ? 'cursor-pointer focus:outline-none' : ''}
          >
            {isSelected && (
              <circle cx={cx} cy={cy} r={24} fill="none" stroke={accent} strokeWidth={2}>
                <animate attributeName="r" values="20;30;20" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={cx} cy={cy} r={17} fill={isSelected ? accent : '#040d14'} stroke={accent} strokeWidth={2.5} />
            <text x={cx} y={cy + 6} textAnchor="middle" fill={isSelected ? '#04090e' : accent} fontSize="16" fontWeight="900">
              {loc.number}
            </text>
            <rect
              x={badgeX}
              y={badgeY}
              width={badgeW}
              height={52}
              rx={6}
              fill="#050e17"
              stroke={isSelected ? accent : `${accent}66`}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            <text x={badgeX + 12} y={badgeY + 23} fill="#ffffff" fontSize="16" fontWeight="bold">
              {loc.address}
            </text>
            <text x={badgeX + 12} y={badgeY + 42} fill={accent} fontSize="12" fontWeight="bold">
              {loc.district}
            </text>
          </g>
        );
      })}

      {/* Dron */}
      <g transform={`translate(${dx} ${dy})`}>
        <circle r={13} fill="#050e17" stroke="#00f0ff" strokeWidth={2} />
        <circle cx={-14} cy={-14} r={6} fill="none" stroke="#00f0ff" strokeWidth={1.5} />
        <circle cx={14} cy={-14} r={6} fill="none" stroke="#00f0ff" strokeWidth={1.5} />
        <circle cx={-14} cy={14} r={6} fill="none" stroke="#00f0ff" strokeWidth={1.5} />
        <circle cx={14} cy={14} r={6} fill="none" stroke="#00f0ff" strokeWidth={1.5} />
        <circle r={4} fill="#00f0ff" />
      </g>
    </svg>
  );
};

/** Widok z kamery drona nad parkingiem: sloty z pojazdami (kliknięcie = wybór), po zrzucie koperta na dachu. */
const ParkingCamera: React.FC<{
  accent: string;
  cars: DroneCar[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  dropped?: boolean;
}> = ({ accent, cars, selectedId, onSelect, dropped }) => (
  <svg viewBox="0 0 360 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Parking widziany z drona">
    <rect width="360" height="220" fill="#0d141b" />
    <line x1="20" y1="110" x2="340" y2="110" stroke="#334155" strokeWidth="1.5" strokeDasharray="6,6" />
    {cars.map((car, idx) => {
      const x = 35 + (idx % 3) * 110;
      const y = idx < 3 ? 25 : 120;
      const isSelected = selectedId === car.id;
      const interactive = !!onSelect;
      return (
        <g
          key={car.id}
          transform={`translate(${x} ${y})`}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={`Pojazd: ${car.desc}`}
          onClick={interactive ? () => onSelect!(car.id) : undefined}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect!(car.id);
                  }
                }
              : undefined
          }
          className={interactive ? 'cursor-pointer focus:outline-none' : ''}
        >
          <rect
            width={90}
            height={75}
            fill={isSelected ? `${accent}22` : 'transparent'}
            stroke={isSelected ? accent : '#1e293b'}
            strokeWidth={isSelected ? 2 : 1}
            rx={3}
          />
          <CarShape car={car} />
          {dropped && isSelected && (
            <g>
              <rect x={37} y={31} width={16} height={10} rx={1} fill="#fef08a" stroke="#ca8a04" strokeWidth={1} />
              <line x1={37} y1={31} x2={45} y2={36} stroke="#ca8a04" strokeWidth={0.8} />
              <line x1={53} y1={31} x2={45} y2={36} stroke="#ca8a04" strokeWidth={0.8} />
            </g>
          )}
          {isSelected && !dropped && (
            <g>
              <circle
                cx={45}
                cy={36}
                r={22}
                fill="none"
                stroke={accent}
                strokeWidth={1}
                strokeDasharray="3,3"
                className="animate-spin"
                style={{ transformOrigin: '45px 36px' }}
              />
              <line x1={45} y1={10} x2={45} y2={18} stroke={accent} strokeWidth={1.5} />
              <line x1={45} y1={54} x2={45} y2={62} stroke={accent} strokeWidth={1.5} />
              <line x1={19} y1={36} x2={27} y2={36} stroke={accent} strokeWidth={1.5} />
              <line x1={63} y1={36} x2={71} y2={36} stroke={accent} strokeWidth={1.5} />
            </g>
          )}
        </g>
      );
    })}
  </svg>
);

export const DroneApp: React.FC<BlockProps<DroneConfig>> = ({ config, onDecision, onComplete }) => {
  // Akcent = kolor kafelka //DRON na pulpicie.
  const accent = '#ef4444';

  const [screen, setScreen] = useState<Screen>('attach');
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [flight, setFlight] = useState(0);
  const [locked, setLocked] = useState(false);
  const completedRef = useRef(false);

  // Kolejność opcji i miejsc na parkingu losuje się raz przy zamontowaniu (od nowa przy powtórce misji).
  const addressRows = useShuffled(config.address.options);
  const parkingCars = useShuffled(config.parkingCars);

  const selectedLoc = config.address.options.find((o) => o.id === selectedLocId);
  const selectedCar = config.parkingCars.find((c) => c.id === selectedCarId);
  // Zdjęcie od mentora to pojazd, który decyzja D8 uznaje za właściwy (jedno źródło: tier w parkingCars).
  const referenceCar = config.parkingCars.find((c) => c.tier === 'ideal');
  const { droneStats } = config;

  // Lot: pasek postępu napędza dron na mapie; po dolocie — krótkie łączenie z kamerą.
  useEffect(() => {
    if (screen !== 'flying') return;
    const started = Date.now();
    const id = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - started) / FLIGHT_MS) * 100));
      setFlight(pct);
      if (pct >= 100) {
        clearInterval(id);
        sounds.playSuccess();
        setScreen('load_camera');
      }
    }, 60);
    return () => clearInterval(id);
  }, [screen]);

  // Zrzut koperty: komunikat sukcesu, potem koniec etapu.
  useEffect(() => {
    if (screen !== 'dropped') return;
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, DROP_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const handleLocConfirm = () => {
    if (!selectedLoc || locked) return;
    sounds.playSuccess();
    onDecision({
      num: config.address.decisionNum,
      question: config.address.question,
      answer: selectedLoc.label,
      tier: selectedLoc.tier,
      feedback: selectedLoc.feedback
    });
    if (selectedLoc.tier === 'critical') {
      setLocked(true);
      return;
    }
    setFlight(0);
    setScreen('flying');
  };

  const handleCarConfirm = () => {
    if (!selectedCar || locked) return;
    const option = config.car.options.find((o) => o.id === selectedCar.id);
    if (!option) throw new Error(`//DRON: pojazd ${selectedCar.id} nie ma opcji w decyzji D8 (niespójny config)`);
    sounds.playSuccess();
    onDecision({
      num: config.car.decisionNum,
      question: config.car.question,
      answer: option.label,
      tier: option.tier,
      feedback: option.feedback
    });
    if (option.tier === 'critical') {
      setLocked(true);
      return;
    }
    setScreen('dropping');
  };

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={Crosshair} accent={accent} title="//DRON: CONDOR MIT63" subtitle={subtitle} task={task} step={step} />
  );

  const statusBar = (status: string) => (
    <div className="shrink-0 px-3 py-2 rounded-lg border bg-[#081219] flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs"
      style={{ borderColor: `${accent}55` }}>
      <span className="font-black tracking-wider px-2 py-0.5 rounded" style={{ color: accent, backgroundColor: `${accent}22` }}>
        {status}
      </span>
      <span className="flex items-center gap-4 text-gray-300">
        <span className="flex items-center gap-1.5">
          <Camera size={14} style={{ color: accent }} />
          WIDEO AKTYWNE
        </span>
        <span className="flex items-center gap-1.5">
          <Radio size={14} style={{ color: accent }} />
          {droneStats.connection}
        </span>
      </span>
    </div>
  );

  // --- Prawy monitor ---
  const sidePanel = (() => {
    if (screen === 'map') {
      return (
        <SidePanel
          accent={accent}
          heading="//DRON: KOORDYNATY"
          sub="Wskaż adres na mapie albo na liście, a potem zatwierdź."
          footer={
            <ConfirmButton
              accent={accent}
              label="ZATWIERDŹ KOORDYNATY I LEĆ"
              enabled={!!selectedLoc && !locked}
              onClick={handleLocConfirm}
              icon={<Send size={15} />}
            />
          }
        >
          <div className="space-y-4">
            <MentorNote accent={accent} lines={config.mentorNote} />
            <ChoiceRows
              accent={accent}
              options={addressRows}
              selectedId={selectedLocId}
              onSelect={(id) => {
                sounds.playClick();
                setSelectedLocId(id);
              }}
              label="WYBIERZ ADRES"
              mono
            />
          </div>
        </SidePanel>
      );
    }
    if (screen === 'flying' || screen === 'load_camera') {
      return (
        <SidePanel accent={accent} heading="//DRON: TELEMETRIA" sub="Lot do wskazanego adresu.">
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
              <span className="text-xs text-gray-400 block tracking-wider">CEL</span>
              <span className="font-bold text-white font-mono">{selectedLoc?.label}</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
              <span className="text-xs text-gray-400 block tracking-wider">PRĘDKOŚĆ</span>
              <span className="font-bold text-white">{droneStats.speed}</span>
            </div>
            <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
              <span className="text-xs text-gray-400 block tracking-wider">TRASA</span>
              <span className="font-bold text-white">{screen === 'flying' ? `${flight}%` : 'DOTARŁ NA MIEJSCE'}</span>
            </div>
          </div>
        </SidePanel>
      );
    }
    if (screen === 'camera' || screen === 'dropping' || screen === 'dropped') {
      return (
        <SidePanel
          accent={accent}
          heading="//DRON: ZDJĘCIE OD BYTE_MASTERA"
          sub="Samochód ofiary. Znajdź go na parkingu."
          footer={
            <ConfirmButton
              accent={accent}
              label="ZRZUĆ ŁADUNEK NA SAMOCHÓD"
              enabled={!!selectedCar && !locked && screen === 'camera'}
              onClick={handleCarConfirm}
              icon={<Crosshair size={15} />}
            />
          }
        >
          <div className="space-y-3">
            {referenceCar && (
              <div className="rounded-lg border-4 border-gray-200/90 bg-[#0d141b] shadow-lg overflow-hidden -rotate-1">
                <svg viewBox="0 0 90 75" className="w-full h-auto max-h-[28vh]" role="img" aria-label="Zdjęcie samochodu ofiary">
                  <rect width="90" height="75" fill="#1a232d" />
                  <CarShape car={referenceCar} />
                </svg>
              </div>
            )}
            <div className="p-3 rounded-lg border border-gray-800 bg-black/20 text-xs">
              <span className="text-xs text-gray-400 block tracking-wider">WYBRANY POJAZD</span>
              <span className="font-bold text-white">{selectedCar ? selectedCar.desc : '—'}</span>
            </div>
          </div>
        </SidePanel>
      );
    }
    return null;
  })();

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-3">
      {sidePanel && <SideMonitor>{sidePanel}</SideMonitor>}

      {screen === 'attach' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header(
            'PODŁĄCZENIE ŁADUNKU',
            "Podepnij kopertę z pendrive'em do drona, aby odblokować nawigację satelitarną.",
            'START'
          )}
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div
              className="w-full max-w-xl p-6 rounded-2xl border-2 text-center space-y-4"
              style={{ borderColor: `${accent}99`, backgroundColor: `${accent}12`, boxShadow: `0 0 24px ${accent}30` }}
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-gray-200">
                <span className="px-2.5 py-1.5 rounded border border-gray-700 bg-black/30 flex items-center gap-1.5">
                  <Camera size={14} style={{ color: accent }} />
                  {droneStats.video}
                </span>
                <span className="px-2.5 py-1.5 rounded border border-gray-700 bg-black/30 flex items-center gap-1.5">
                  <Navigation size={14} style={{ color: accent }} />
                  {droneStats.speed}
                </span>
                <span className="px-2.5 py-1.5 rounded border border-gray-700 bg-black/30 flex items-center gap-1.5">
                  <Radio size={14} style={{ color: accent }} />
                  {droneStats.connection}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setScreen('attaching');
                }}
                className="w-full p-6 rounded-xl border-2 space-y-2 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                style={{ borderColor: accent, backgroundColor: `${accent}26`, boxShadow: `0 0 20px ${accent}50` }}
              >
                <Crosshair size={38} className="mx-auto" style={{ color: accent }} />
                <span className="block text-base font-black text-white uppercase tracking-wider">
                  PODEPNIJ KOPERTĘ Z PENDRIVE'EM
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === 'attaching' && (
        <ModuleLoader
          label="MOCOWANIE KOPERTY Z PENDRIVE'EM DO DRONA…"
          durationMs={LOADER_MS}
          accent={accent}
          onDone={() => setScreen('map')}
        />
      )}

      {(screen === 'map' || screen === 'flying') && (
        <div className="flex flex-col flex-1 min-h-0 space-y-3 animate-in fade-in duration-200">
          {screen === 'map'
            ? header('MAPA SATELITARNA', 'Wskaż na mapie dom ofiary i zatwierdź koordynaty na prawym monitorze.', 'KROK 1/2')
            : header('LOT DO CELU', `Dron leci pod adres ${selectedLoc?.label ?? ''}. Poczekaj na dolot.`, 'KROK 1/2')}
          {statusBar(screen === 'map' ? 'CZEKA NA WSPÓŁRZĘDNE' : `W LOCIE // ${flight}%`)}
          <ChoiceZone
            accent={accent}
            label={screen === 'map' ? config.address.question : 'TRASA LOTU'}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="flex-1 min-h-0 h-full">
              <SatelliteMap
                accent={accent}
                locations={config.mapLocations}
                selectedId={selectedLocId}
                onSelect={
                  screen === 'map' && !locked
                    ? (id) => {
                        sounds.playClick();
                        setSelectedLocId(id);
                      }
                    : undefined
                }
                flightPct={screen === 'flying' ? flight : undefined}
              />
            </div>
          </ChoiceZone>
        </div>
      )}

      {screen === 'load_camera' && (
        <ModuleLoader label="ŁĄCZENIE Z KAMERĄ PARKINGU…" durationMs={LOADER_MS} accent={accent} onDone={() => setScreen('camera')} />
      )}

      {screen === 'dropping' && (
        <ModuleLoader
          label="ZRZUT ŁADUNKU NA SAMOCHÓD OFIARY…"
          durationMs={LOADER_MS}
          accent={accent}
          onDone={() => setScreen('dropped')}
        />
      )}

      {(screen === 'camera' || screen === 'dropped') && (
        <div className="flex flex-col flex-1 min-h-0 space-y-3 animate-in fade-in duration-200">
          {screen === 'camera'
            ? header(
                'KAMERA PARKINGU',
                'Wskaż samochód ze zdjęcia od Byte_Mastera i zrzuć na niego kopertę z prawego monitora.',
                'KROK 2/2'
              )
            : header('ZRZUT ŁADUNKU', config.successDrop, 'KROK 2/2')}
          <ChoiceZone
            accent={accent}
            label={screen === 'camera' ? config.car.question : 'ŁADUNEK ZRZUCONY'}
            className="flex-1 min-h-0 flex flex-col"
          >
            <div className="relative flex-1 min-h-0 h-full rounded-lg overflow-hidden border border-gray-800">
              <div className="absolute top-2 left-3 z-10 flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                KAMERA AKTYWNA
              </div>
              <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />
              <ParkingCamera
                accent={accent}
                cars={parkingCars}
                selectedId={selectedCarId}
                onSelect={
                  screen === 'camera' && !locked
                    ? (id) => {
                        sounds.playClick();
                        setSelectedCarId(id);
                      }
                    : undefined
                }
                dropped={screen === 'dropped'}
              />
            </div>
          </ChoiceZone>
        </div>
      )}
    </div>
  );
};
