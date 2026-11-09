// Etap 5 — //WIRUS: RAT (C2): sesja zdalna na komputerze ofiary (finał bez oceny, bez decyzji).
// Ekrany: c2 -> loader -> desktop (pulpit ofiary) -> files (przeciąganie plików FREEVOLT) -> loader -> network.
// Teksty z configu (stages.ts, ratSessionConfig); nazwa dysku i archiwum z customState['m3_usb'].
// Stan ekranów to zwykły stan Reacta (zasada „aplikacje pamiętają stan”: AppHost nie odmontowuje aplikacji).

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, Folder, Loader2, Monitor, Radio, Trash2 } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { sounds } from '../../../engine/audio/soundEffects';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { FreevoltFiles } from './FreevoltFiles';
import { NetworkDiagram } from './NetworkDiagram';
import { COPY_TICK_MS, allCopied, hasActiveCopies, startCopy, tickCopies, type CopyProgress } from './ratLogic';
import { ImageSlot, LOADER_MS } from './ui';
import { USB_STATE_KEY, type RatSessionConfig, type UsbState } from './types';

type Screen = 'c2' | 'loader_desktop' | 'desktop' | 'files' | 'loader_network' | 'network';

const ACCENT = '#00f0ff';
const OPEN_FOLDER_MS = 700;
const FINISH_DELAY_MS = 900;

export const RatSessionApp: React.FC<BlockProps<RatSessionConfig>> = ({ config, onComplete }) => {
  const usb = useMissionStore((s) => s.customState[USB_STATE_KEY]) as UsbState | undefined;
  const { archive, volume } = usb ?? config.usbFallback;

  const [screen, setScreen] = useState<Screen>('c2');
  const [opening, setOpening] = useState(false);
  const [progress, setProgress] = useState<CopyProgress>({});
  const completedRef = useRef(false);

  const fileIds = config.files.items.map((f) => f.id);
  const everythingCopied = allCopied(progress, fileIds);

  // Tyknięcia kopiowania: działają tylko, gdy jakiś plik jest w trakcie.
  const copying = hasActiveCopies(progress);
  useEffect(() => {
    if (!copying) return;
    const id = setInterval(() => setProgress((p) => tickCopies(p)), COPY_TICK_MS);
    return () => clearInterval(id);
  }, [copying]);

  // Wszystkie pliki przeniesione: po krótkiej chwili gra sama przechodzi dalej.
  useEffect(() => {
    if (screen !== 'files' || !everythingCopied) return;
    sounds.playSuccess();
    const id = setTimeout(() => setScreen('loader_network'), FINISH_DELAY_MS);
    return () => clearTimeout(id);
  }, [screen, everythingCopied]);

  // Otwieranie folderu FREEVOLT (krótki, widoczny postęp).
  useEffect(() => {
    if (!opening) return;
    const id = setTimeout(() => {
      setOpening(false);
      setScreen('files');
    }, OPEN_FOLDER_MS);
    return () => clearTimeout(id);
  }, [opening]);

  const handleCopy = (id: string) => {
    if (id in progress) return;
    sounds.playClick();
    setProgress((p) => startCopy(p, id));
  };

  // Zawsze woła onComplete: dla etapu już zaliczonego (ponowne otwarcie) silnik tylko zamyka okno,
  // więc przycisk nie może się „zablokować” po pierwszym kliknięciu. Dźwięk sukcesu tylko raz.
  const finish = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      sounds.playSuccess();
    }
    onComplete();
  };

  const taskFor: Record<Screen, string | undefined> = {
    c2: config.tasks.alert,
    loader_desktop: undefined,
    desktop: config.tasks.desktop,
    files: config.tasks.files,
    loader_network: undefined,
    network: config.tasks.network
  };

  const shell = (children: React.ReactNode) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader icon={Radio} accent={ACCENT} title={config.alert.label} subtitle={config.subtitle} task={taskFor[screen]} />
      {children}
    </div>
  );

  // Ładowania z nagłówkiem aplikacji nad paskiem.
  if (screen === 'loader_desktop' || screen === 'loader_network') {
    const toDesktop = screen === 'loader_desktop';
    return shell(
      <div className="flex-1 min-h-0">
        <ModuleLoader
          label={toDesktop ? config.loaders.desktop : config.loaders.network}
          durationMs={LOADER_MS}
          accent={ACCENT}
          onDone={() => setScreen(toDesktop ? 'desktop' : 'network')}
        />
      </div>
    );
  }

  if (screen === 'c2') {
    const rows: [string, string][] = [
      [config.alert.hostLabel, config.host.name],
      [config.alert.ipLabel, config.host.ip],
      [config.alert.archiveLabel, archive],
      [config.alert.volumeLabel, volume]
    ];
    return shell(
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div
          className="w-full rounded-xl border p-5 2xl:p-8 space-y-4 2xl:space-y-6 bg-black/40"
          style={{ borderColor: `${ACCENT}66`, boxShadow: `0 0 24px ${ACCENT}22` }}
        >
          <div className="flex items-center gap-3 text-base 2xl:text-2xl font-black tracking-wide text-red-300">
            <AlertTriangle size={26} className="shrink-0 text-red-400" />
            <span>{config.alert.status}</span>
          </div>
          <div className="space-y-2">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-4 border-b border-gray-800 pb-1.5 2xl:pb-2.5 text-sm 2xl:text-xl"
              >
                <span className="text-gray-400 tracking-wider">{label}</span>
                <span className="font-bold text-white text-right break-all">{value}</span>
              </div>
            ))}
          </div>
          <ConfirmButton
            accent={ACCENT}
            label={config.alert.takeoverLabel}
            onClick={() => {
              sounds.playClick();
              setScreen('loader_desktop');
            }}
          />
        </div>
      </div>
    );
  }

  if (screen === 'desktop') {
    return shell(
      <div className="flex-1 min-h-0 flex flex-col rounded-lg border overflow-hidden" style={{ borderColor: `${ACCENT}55` }}>
        <div
          className="shrink-0 px-4 py-1.5 text-xs font-black tracking-widest text-center text-[#05090f]"
          style={{ backgroundColor: ACCENT }}
        >
          {config.desktop.banner}
        </div>
        <div className="relative flex-1 min-h-0 bg-gradient-to-br from-[#0b3a6b] via-[#0f5fa8] to-[#0a2a4d]">
          <div className="absolute inset-0 opacity-90">
            <ImageSlot asset={config.desktop.wallpaper} label="tapeta pulpitu ofiary" />
          </div>
          <div className="relative p-4 flex flex-col gap-3 items-start">
            {config.desktop.icons.map((icon) => {
              const isFolder = icon.warning;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => {
                    if (!isFolder || opening) return;
                    sounds.playClick();
                    setOpening(true);
                  }}
                  className={`w-24 flex flex-col items-center gap-1 p-2 rounded text-center ${
                    isFolder ? 'cursor-pointer hover:bg-white/15 ring-1 ring-orange-400/60' : 'cursor-default hover:bg-white/5'
                  }`}
                >
                  <span className="relative">
                    {icon.id === 'trash' ? (
                      <Trash2 size={34} className="text-gray-100" />
                    ) : icon.id === 'this_pc' ? (
                      <Monitor size={34} className="text-gray-100" />
                    ) : (
                      <Folder size={34} className="text-yellow-300" />
                    )}
                    {icon.warning && (
                      <AlertTriangle
                        size={16}
                        className="absolute -right-2 -bottom-1 text-orange-400 fill-orange-950"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="text-xs font-bold text-white drop-shadow leading-tight">{icon.label}</span>
                  {isFolder && opening && <Loader2 size={14} className="animate-spin text-orange-300" />}
                </button>
              );
            })}
          </div>
          <div className="absolute bottom-0 inset-x-0 h-7 bg-black/60 border-t border-white/10 flex items-center px-3">
            <span className="text-xs text-gray-300">{config.host.name}</span>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'files') {
    return shell(<FreevoltFiles accent={ACCENT} files={config.files} progress={progress} onCopy={handleCopy} />);
  }

  // network
  return shell(
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="flex-1 min-h-0 rounded-lg border bg-black/30 p-2" style={{ borderColor: `${ACCENT}44` }}>
        <NetworkDiagram accent={ACCENT} nodes={config.network.nodes} />
      </div>
      <div className="shrink-0 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm sm:text-base font-black tracking-wide text-white">{config.network.headline}</div>
        <ConfirmButton
          accent={ACCENT}
          label={config.network.endLabel}
          onClick={finish}
          icon={<ArrowRight size={15} />}
          className="w-auto px-6"
        />
      </div>
    </div>
  );
};
