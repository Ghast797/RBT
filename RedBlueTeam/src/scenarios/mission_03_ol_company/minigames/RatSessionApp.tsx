// Etap 5 — //WIRUS: RAT — SESJA (finał bez oceny). Wzorzec B, standard M2.
// Przebieg: aktywacja ładunku -> przejęcie pulpitu ofiary -> graf zdalnego dostępu
// -> onComplete (mostek do raportu). Brak onDecision: etap nieoceniany.
// Dane (host, teksty, etykiety) z config (stages.ts); archiwum (D4) i wolumin (D5) to
// wybory gracza z `playerChoices`. Stan: zwykły useState, aplikacja trzymana przez
// AppHost (zamknięcie nie resetuje przebiegu).

import React, { useRef, useState } from 'react';
import { Radio, Monitor, Trash2, AlertOctagon, FileArchive, FolderOpen } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { sounds } from '../../../engine/audio/soundEffects';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import type { RatSessionConfig } from './types';
import { LOADER_MS } from './ui';

const ACCENT = '#00f0ff';

type Phase = 'alert' | 'loading_desktop' | 'desktop' | 'loading_network' | 'network';

/** Etykiety w config mają nawiasy kwadratowe (styl przycisku ze starego widgetu); na ekranie są bez nich. */
const plain = (label: string) => label.replace(/^\[|\]$/g, '');

export const RatSessionApp: React.FC<BlockProps<RatSessionConfig>> = ({ config, onComplete }) => {
  const [phase, setPhase] = useState<Phase>('alert');
  const finishedRef = useRef(false);
  const { texts } = config;

  // Archiwum (D4) i wolumin (D5) to to, co gracz faktycznie przygotował; bez wyboru — neutralny fallback.
  const playerChoices = useMissionStore((s) => s.playerChoices);
  const answerFor = (num: number) => playerChoices.find((c) => c.num === num)?.answer;
  const archive =
    config.archiveOptions.find((o) => o.label === answerFor(config.archiveDecisionNum))?.archive ??
    config.fallback.archive;
  const volume = answerFor(config.volumeDecisionNum) ?? config.fallback.volume;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader
        icon={Radio}
        accent={ACCENT}
        title="//WIRUS: RAT — SESJA"
        subtitle="Zdalna sesja ze stacją ofiary"
        task={texts.tasks[phase]}
      />

      {phase === 'alert' && (
        <div
          className="flex-1 min-h-0 flex flex-col justify-between gap-4 p-5 rounded-xl border-2 text-center"
          style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}0d`, boxShadow: `0 0 30px ${ACCENT}33` }}
        >
          <div className="my-auto space-y-4">
            <div
              className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border-2 animate-pulse"
              style={{ borderColor: ACCENT, color: ACCENT, backgroundColor: `${ACCENT}22` }}
            >
              <Radio size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black tracking-widest" style={{ color: ACCENT }}>
                {texts.alert.title}
              </h3>
              <p className="text-sm font-bold text-white tracking-wider">{texts.alert.status}</p>
            </div>
            <div className="max-w-md mx-auto bg-[#050a0f] border rounded-lg p-3 text-sm text-left space-y-1.5" style={{ borderColor: `${ACCENT}66` }}>
              <div className="flex justify-between gap-3 border-b border-slate-800 pb-1">
                <span className="text-gray-400">{texts.alert.hostLabel}</span>
                <span className="font-bold" style={{ color: ACCENT }}>{config.host.name}</span>
              </div>
              <div className="flex justify-between gap-3 pt-0.5">
                <span className="text-gray-400">{texts.alert.ipLabel}</span>
                <span className="font-bold" style={{ color: ACCENT }}>{config.host.ip}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <ConfirmButton
              accent={ACCENT}
              label={plain(config.takeoverLabel)}
              icon={<Monitor size={15} />}
              className="w-full max-w-md"
              onClick={() => {
                sounds.playClick();
                setPhase('loading_desktop');
              }}
            />
          </div>
        </div>
      )}

      {phase === 'loading_desktop' && (
        <div className="flex-1 min-h-0">
          <ModuleLoader
            key="loading_desktop"
            label={texts.loaders.desktop}
            durationMs={LOADER_MS}
            accent={ACCENT}
            onDone={() => setPhase('desktop')}
          />
        </div>
      )}

      {phase === 'desktop' && (
        <div
          className="flex-1 min-h-0 relative rounded-xl overflow-hidden border-2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"
          style={{ borderColor: `${ACCENT}99` }}
        >
          <div className="absolute top-0 inset-x-0 z-20 p-2 bg-red-900/80 border-b border-red-500 text-center text-xs font-black text-white tracking-widest">
            {texts.desktop.banner} ({config.host.name})
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <span className="text-5xl font-black text-white tracking-widest">{texts.desktop.watermark}</span>
          </div>

          <div className="absolute left-3 top-14 z-10 flex flex-col gap-3 w-28">
            <div className="flex flex-col items-center p-2 rounded text-center text-xs text-white">
              <div className="w-10 h-10 rounded bg-slate-800 border border-slate-600 flex items-center justify-center mb-1 text-slate-300">
                <Trash2 size={20} />
              </div>
              <span className="font-bold">KOSZ</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded text-center text-xs text-white">
              <div className="w-10 h-10 rounded bg-blue-900/60 border border-blue-500 flex items-center justify-center mb-1 text-blue-300">
                <Monitor size={20} />
              </div>
              <span className="font-bold">TEN KOMPUTER</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setPhase('loading_network');
              }}
              className="flex flex-col items-center p-2 rounded bg-amber-500/20 border-2 border-amber-500 hover:bg-amber-500/30 text-center text-xs text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse transition-all"
              title={texts.desktop.networkIconTitle}
            >
              <div className="w-10 h-10 rounded bg-amber-600 flex items-center justify-center mb-1 text-white">
                <AlertOctagon size={22} />
              </div>
              <span className="font-black">{texts.desktop.networkIcon}</span>
            </button>
          </div>

          <div className="absolute right-4 top-14 z-10 w-80 max-w-[60%] bg-slate-900/95 border-2 border-blue-500 rounded-lg shadow-2xl overflow-hidden font-sans">
            <div className="px-3 py-1.5 bg-blue-700 text-white font-bold text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <FolderOpen size={14} className="shrink-0" />
                <span className="truncate">E:\ {volume}</span>
              </div>
              <div className="text-[0.6875rem] bg-blue-900 px-1.5 py-0.5 rounded font-mono shrink-0">FAT32</div>
            </div>
            <div className="p-3 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 p-2 rounded bg-amber-500/15 border border-amber-500/50 text-amber-300">
                <FileArchive size={20} className="text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{archive}</div>
                  <div className="text-[0.6875rem] text-green-400">{texts.desktop.extractedStatus}</div>
                </div>
              </div>
              <p className="text-[0.6875rem] text-gray-300 leading-relaxed">
                {texts.desktop.extractedNote}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-slate-950/90 border-t border-slate-700 flex items-center justify-between gap-3">
            <p className="text-xs text-amber-300 leading-snug">
              {texts.desktop.hint}
            </p>
            <ConfirmButton
              accent={ACCENT}
              label={plain(config.networkLabel)}
              className="w-auto px-4 shrink-0"
              onClick={() => {
                sounds.playClick();
                setPhase('loading_network');
              }}
            />
          </div>
        </div>
      )}

      {phase === 'loading_network' && (
        <div className="flex-1 min-h-0">
          <ModuleLoader
            key="loading_network"
            label={texts.loaders.network}
            durationMs={LOADER_MS}
            accent={ACCENT}
            onDone={() => setPhase('network')}
          />
        </div>
      )}

      {phase === 'network' && (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div
            className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 bg-[#081219] text-center"
            style={{ borderColor: ACCENT }}
          >
            <h3 className="text-base font-black tracking-widest" style={{ color: ACCENT }}>
              {texts.network.headline}
            </h3>
            <p className="text-sm text-white tracking-wider">{texts.network.subtitle}</p>
            <div className="flex-1 min-h-0 w-full">
              <svg viewBox="0 0 420 160" className="w-full h-full" role="img" aria-label="Schemat zdalnego dostępu do sieci">
                <line x1="210" y1="120" x2="80" y2="58" stroke={ACCENT} strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="210" y1="120" x2="210" y2="60" stroke={ACCENT} strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="210" y1="120" x2="340" y2="58" stroke={ACCENT} strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />
                <g>
                  <rect x="45" y="22" width="70" height="36" rx="6" fill="#08141f" stroke={ACCENT} strokeWidth="1.5" />
                  <text x="80" y="44" textAnchor="middle" fill={ACCENT} fontSize="12" fontWeight="bold">{texts.network.otherNodes[0]}</text>
                </g>
                <g>
                  <rect x="145" y="18" width="130" height="42" rx="8" fill="#0b1b26" stroke={ACCENT} strokeWidth="2.5" />
                  <text x="210" y="38" textAnchor="middle" fill={ACCENT} fontSize="13" fontWeight="900" letterSpacing="1">{texts.network.victimNode}</text>
                  <text x="210" y="52" textAnchor="middle" fill={ACCENT} fontSize="9" fontWeight="bold" opacity="0.85">{texts.network.victimStatus}</text>
                </g>
                <g>
                  <rect x="305" y="22" width="70" height="36" rx="6" fill="#08141f" stroke={ACCENT} strokeWidth="1.5" />
                  <text x="340" y="44" textAnchor="middle" fill={ACCENT} fontSize="12" fontWeight="bold">{texts.network.otherNodes[1]}</text>
                </g>
                <g transform="translate(192, 104)">
                  <circle cx="18" cy="18" r="18" fill={ACCENT} />
                  <text x="18" y="23" textAnchor="middle" fill="#05080c" fontSize="15" fontWeight="900">☣</text>
                </g>
              </svg>
            </div>
          </div>
          <div className="shrink-0 flex justify-end">
            <ConfirmButton
              accent={ACCENT}
              label={texts.network.endLabel}
              className="w-auto px-6"
              onClick={() => {
                sounds.playClick();
                finish();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
