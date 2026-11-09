// Etap 4 — //DRON: CONDOR MIT63 (D5 adres na mapie, D6 samochód ofiary na parkingu).
// Źródło: docs/Scenariusz…md (S05, S06), plan: docs/rebuild-plan.md, sekcja 3.4 i 9.
// Przebieg: aktywacja -> ładunek (koperta z m3_usb) -> mapa (D5) -> lot -> kamera -> wskazanie auta po opisie
// mentora z czatu (D6) -> zrzut -> komunikat i onComplete. Prawy monitor zostaje czatem: adres i opis auta
// gracz ma w logu rozmowy (openingConversation etapu), tu nie ma obrazka-wzorca ani notatek.
// Interfejs milczy o ocenie: poziomy idą wyłącznie przez onDecision. Teksty pochodzą z configu (stages.ts).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Camera, Radio, Power, CheckCircle2, Navigation } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import type { BlockProps } from '../../../engine/types/mission';
import { USB_STATE_KEY, type DroneConfig, type UsbState } from './types';
import { buildReport } from './report';
import { LOADER_MS } from './ui';
import { DroneMap } from './DroneMap';
import { DroneCamera } from './DroneCamera';
import {
  FLIGHT_MS,
  droneStatusFor,
  flightProgress,
  placeCars,
  resolveDropOptionId,
  type DronePhase,
  type Point
} from './droneLogic';

/** Jak długo gracz widzi komunikat o zrzucie, zanim etap zakończy się sam. */
const DONE_MS = 2600;

/** Dron z góry (cztery wirniki); z podwieszoną kopertą, gdy `loaded`. */
const DroneGlyph: React.FC<{ accent: string; loaded?: boolean; className?: string }> = ({ accent, loaded, className = '' }) => (
  <svg viewBox="-60 -50 120 110" className={className} role="img" aria-label="Dron">
    {[[-40, -30], [40, -30], [-40, 30], [40, 30]].map(([cx, cy]) => (
      <g key={`${cx}${cy}`}>
        <line x1="0" y1="0" x2={cx} y2={cy} stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="17" fill="#07131d" stroke="#00f0ff" strokeWidth="3" />
        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#00f0ff" strokeOpacity="0.6" strokeWidth="2" />
      </g>
    ))}
    <rect x="-16" y="-14" width="32" height="28" rx="7" fill="#07131d" stroke={accent} strokeWidth="3" />
    <circle r="6" fill={accent} />
    {loaded && (
      <g>
        <line x1="-8" y1="14" x2="-8" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="8" y1="14" x2="8" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="-18" y="30" width="36" height="24" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
        <polyline points="-18,31 0,44 18,31" fill="none" stroke="#ca8a04" strokeWidth="2" />
      </g>
    )}
  </svg>
);

/** Koperta z pendrive'em: podpis i nazwa dysku z `m3_usb` (wybory gracza z poprzedniego etapu). */
const EnvelopeCard: React.FC<{ accent: string; caption: string; usb: UsbState }> = ({ accent, caption, usb }) => (
  <div className="rounded-xl border-2 p-3 space-y-2.5" style={{ borderColor: `${accent}88`, backgroundColor: `${accent}12` }}>
    <div className="relative rounded-md bg-[#e9dcc0] border border-[#b8a67e] shadow-lg px-4 pt-9 pb-4 min-h-[6.5rem] flex items-center justify-center">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 w-full h-9" aria-hidden="true">
        <polygon points="0,0 100,0 50,38" fill="#dccda9" stroke="#b8a67e" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="relative text-center text-base font-bold italic text-[#2d2415] leading-snug font-serif">{usb.signature}</span>
    </div>
    <div className="text-center space-y-0.5">
      <div className="text-xs font-black text-white tracking-wider">{caption}</div>
      <div className="text-xs text-gray-300 font-mono break-all">
        {usb.volume} // {usb.archive}
      </div>
    </div>
  </div>
);

const BigAction: React.FC<{ accent: string; label: string; icon: React.ReactNode; onClick: () => void }> = ({
  accent,
  label,
  icon,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full px-6 py-5 rounded-xl border-2 space-y-1.5 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
    style={{ borderColor: accent, backgroundColor: `${accent}26`, boxShadow: `0 0 20px ${accent}50` }}
  >
    <span className="flex justify-center" style={{ color: accent }}>
      {icon}
    </span>
    <span className="block text-base font-black text-white uppercase tracking-wider">{label}</span>
  </button>
);

export const DroneApp: React.FC<BlockProps<DroneConfig>> = ({ config, onDecision, onComplete }) => {
  // Akcent = kolor kafelka //DRON na pulpicie.
  const accent = '#ef4444';

  const usbState = useMissionStore((s) => s.customState[USB_STATE_KEY]) as UsbState | undefined;
  const usb = usbState ?? config.usbFallback;

  const [phase, setPhase] = useState<DronePhase>('activate');
  const [prepared, setPrepared] = useState(false);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const [flight, setFlight] = useState(0);
  const [aim, setAim] = useState<Point | null>(null);
  const [locked, setLocked] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Miejsca aut na parkingu losuje się raz przy zamontowaniu (od nowa przy powtórce misji).
  const cars = useShuffled(config.parkingCars);
  const placed = useMemo(() => placeCars(cars), [cars]);

  const { droneStats, texts } = config;
  const status = droneStatusFor(phase, prepared, config.statuses);

  // Lot: pasek postępu napędza dron na planie; po dolocie ekran „URUCHOM KAMERĘ”.
  useEffect(() => {
    if (phase !== 'flying') return;
    const started = Date.now();
    const id = setInterval(() => {
      const pct = flightProgress(Date.now() - started, FLIGHT_MS);
      setFlight(pct);
      if (pct >= 100) {
        clearInterval(id);
        sounds.playSuccess();
        setPhase('cameraOff');
      }
    }, 60);
    return () => clearInterval(id);
  }, [phase]);

  // Krok bez decyzji: po komunikacie o zrzucie etap kończy się sam (jeden raz).
  useEffect(() => {
    if (phase !== 'done') return;
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, DONE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const handleLocConfirm = () => {
    const option = config.address.options.find((o) => o.id === selectedLocId);
    if (!option || locked) return;
    sounds.playSuccess();
    onDecision(buildReport(config.address, option));
    if (option.tier === 'critical') {
      setLocked(true);
      return;
    }
    setFlight(0);
    setPhase('flying');
  };

  const handleDrop = () => {
    if (!aim || locked) return;
    const optionId = resolveDropOptionId(aim, placed, config.asphalt.id);
    const option = config.car.options.find((o) => o.id === optionId);
    if (!option) throw new Error(`//DRON: brak opcji D6 dla ${optionId} (niespójny config)`);
    sounds.playSuccess();
    onDecision(buildReport(config.car, option));
    if (option.tier === 'critical') {
      setLocked(true);
      return;
    }
    setPhase('dropping');
  };

  const statusBadge = (
    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
      {status ? (
        <span
          className="text-xs px-3 py-1.5 rounded-lg border font-mono tracking-wider font-black"
          style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
        >
          {status}
        </span>
      ) : (
        <span className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 bg-black/30 font-mono font-bold text-gray-300 flex items-center gap-1.5">
          <Radio size={14} style={{ color: accent }} />
          {droneStats.connection}
        </span>
      )}
    </div>
  );

  const header = (task: string) => (
    <AppHeader icon={Crosshair} accent={accent} title={`//DRON: ${droneStats.model}`} aside={statusBadge} task={task} />
  );

  // --- ekrany ładowania (każda akcja ma widoczny odzew) ---
  if (phase === 'activating') {
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <ModuleLoader label={`${droneStats.connection}…`} durationMs={LOADER_MS} accent={accent} onDone={() => setPhase('payload')} />
      </div>
    );
  }
  if (phase === 'attaching') {
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <ModuleLoader label={texts.payloadAttaching} durationMs={LOADER_MS} accent={accent} onDone={() => setPhase('map')} />
      </div>
    );
  }
  if (phase === 'cameraLoading') {
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <ModuleLoader label={`${droneStats.video}…`} durationMs={LOADER_MS} accent={accent} onDone={() => setPhase('camera')} />
      </div>
    );
  }
  if (phase === 'dropping') {
    return (
      <div className="h-full min-h-0 overflow-hidden">
        <ModuleLoader label={`${texts.dropLabel}…`} durationMs={LOADER_MS} accent={accent} onDone={() => setPhase('done')} />
      </div>
    );
  }

  const shell = 'flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3 animate-in fade-in duration-200';

  if (phase === 'activate') {
    return (
      <div className={shell}>
        {header(texts.tasks.activate)}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div
            className="w-full max-w-2xl p-5 rounded-2xl border-2 text-center space-y-4"
            style={{ borderColor: `${accent}99`, backgroundColor: `${accent}12`, boxShadow: `0 0 24px ${accent}30` }}
          >
            <DroneGlyph accent={accent} className="mx-auto h-24 w-auto" />
            <div className="text-2xl font-black text-white tracking-widest">{droneStats.model}</div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-gray-200">
              {[
                { icon: Camera, text: droneStats.video },
                { icon: Navigation, text: droneStats.speed },
                { icon: Radio, text: droneStats.connection }
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="px-2.5 py-1.5 rounded border border-gray-700 bg-black/30 flex items-center gap-1.5 font-bold">
                  <Icon size={14} style={{ color: accent }} />
                  {text}
                </span>
              ))}
            </div>
            <BigAction
              accent={accent}
              label={texts.activateLabel}
              icon={<Power size={34} />}
              onClick={() => {
                sounds.playClick();
                setPhase('activating');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'payload') {
    return (
      <div className={shell}>
        {header(texts.tasks.payload)}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div
              className="rounded-2xl border-2 p-4 text-center space-y-2"
              style={{ borderColor: `${accent}55`, backgroundColor: '#07131d' }}
            >
              <DroneGlyph accent={accent} className="mx-auto h-28 w-auto" />
              <div className="text-sm font-black text-white tracking-widest">{droneStats.model}</div>
            </div>
            <div className="space-y-3">
              {!prepared ? (
                <BigAction
                  accent={accent}
                  label={texts.prepareLabel}
                  icon={<Power size={34} />}
                  onClick={() => {
                    sounds.playClick();
                    setPrepared(true);
                  }}
                />
              ) : (
                <>
                  <EnvelopeCard accent={accent} caption={texts.payloadCaption} usb={usb} />
                  <ConfirmButton
                    accent={accent}
                    label={texts.confirmLabel}
                    onClick={() => {
                      sounds.playSuccess();
                      setPhase('attaching');
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'map' || phase === 'flying') {
    const flying = phase === 'flying';
    return (
      <div className={shell}>
        {header(flying ? texts.flightCaption : texts.tasks.map)}
        <ChoiceZone accent={accent} label={config.address.question} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <DroneMap
              accent={accent}
              locations={config.mapLocations}
              selectedId={selectedLocId}
              onSelect={
                flying || locked
                  ? undefined
                  : (id) => {
                      sounds.playClick();
                      setSelectedLocId(id);
                    }
              }
              flightPct={flying ? flight : undefined}
              originLabel={config.statuses.idle}
            />
          </div>
        </ChoiceZone>
        <div className="shrink-0 flex justify-end items-center min-h-[2.5rem]">
          {flying ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-3 bg-[#0a1610] border rounded p-0.5" style={{ borderColor: accent }}>
                <div className="h-full rounded transition-all duration-100" style={{ width: `${flight}%`, backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }} />
              </div>
              <span className="text-xs font-bold text-gray-300 w-10 text-right tabular-nums">{flight}%</span>
            </div>
          ) : (
            <ConfirmButton
              accent={accent}
              label={texts.confirmLabel}
              enabled={!!selectedLocId && !locked}
              onClick={handleLocConfirm}
              className="w-auto px-8"
            />
          )}
        </div>
      </div>
    );
  }

  if (phase === 'cameraOff') {
    return (
      <div className={shell}>
        {header(texts.tasks.camera)}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="w-full max-w-md">
            <BigAction
              accent={accent}
              label={texts.cameraLabel}
              icon={<Camera size={34} />}
              onClick={() => {
                sounds.playClick();
                setPhase('cameraLoading');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 'camera' i 'done': ta sama scena; po zrzucie koperta leży na wskazanym punkcie, a gracz widzi komunikat.
  const done = phase === 'done';
  return (
    <div className={shell}>
      {header(done ? texts.tasks.done : texts.tasks.aim)}
      <ChoiceZone accent={accent} label={config.car.question} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <DroneCamera
            accent={accent}
            placed={placed}
            aim={aim}
            onAim={
              done || locked
                ? undefined
                : (p) => {
                    sounds.playClick();
                    setAim(p);
                  }
            }
            dropped={done}
            batteryPercent={config.hud.batteryPercent}
            transmissionLabel={config.hud.transmissionLabel}
            videoLabel={droneStats.video}
          />
        </div>
      </ChoiceZone>
      <div className="shrink-0 flex justify-end items-center min-h-[2.5rem]">
        {done ? (
          <div className="flex items-center gap-2.5 w-full px-4 py-2 rounded-lg border-2 border-emerald-500/70 bg-emerald-500/10 text-sm font-bold text-emerald-300">
            <CheckCircle2 size={20} className="shrink-0" />
            {config.successDrop}
          </div>
        ) : (
          <ConfirmButton
            accent={accent}
            label={texts.dropLabel}
            enabled={!!aim && !locked}
            onClick={handleDrop}
            icon={<Crosshair size={15} />}
            className="w-auto px-8"
          />
        )}
      </div>
    </div>
  );
};
