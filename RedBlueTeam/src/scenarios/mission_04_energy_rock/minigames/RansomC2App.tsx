// Etap 5 — //MODUŁ_RANSOMWARE: start -> loader -> szyfrowanie sieci -> eksfiltracja (D8) -> loader -> onComplete.
// Teksty i dane z configu (stages.ts, c2Config). Stan ekranów, zaszyfrowanych węzłów i wyboru plików to zwykły
// stan Reacta (zasada „aplikacje pamiętają stan”: AppHost nie odmontowuje aplikacji).

import React, { useRef, useState } from 'react';
import { AlertTriangle, Server } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { LOADER_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { EncryptNetwork } from './EncryptNetwork';
import { ExfilFiles } from './ExfilFiles';
import {
  applySelection,
  buildExfilReport,
  c2StartInfo,
  canConfirmExfil,
  countSelection,
  exfilTier
} from './exfilLogic';
import type { C2Config } from './types';

type Screen = 'start' | 'loader_scan' | 'encrypt' | 'exfil' | 'loader_download';

const ACCENT = '#8A2BE2';

export const RansomC2App: React.FC<BlockProps<C2Config>> = ({ config, onDecision, onComplete }) => {
  const { start, encrypt, exfil } = config;
  const [screen, setScreen] = useState<Screen>('start');
  const [encrypted, setEncrypted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);
  const files = useShuffled(exfil.files);
  const decidedRef = useRef(false);
  const choices = useMissionStore((s) => s.decisionChoices);
  const rejected = useMissionStore((s) => s.rejectedAttempts);
  const score = useMissionStore((s) => s.score);
  const passingScore = useMissionStore((s) => s.activeMission.mission.passingScore);

  const targets = encrypt.nodes.filter((n) => n.kind !== 'vector');
  const allEncrypted = targets.length > 0 && targets.every((n) => encrypted.has(n.id));

  const stepIndex = screen === 'start' || screen === 'loader_scan' ? 0 : screen === 'encrypt' ? 1 : 2;
  const taskFor: Record<Screen, string | undefined> = {
    start: start.task,
    loader_scan: undefined,
    encrypt: encrypt.task,
    exfil: exfil.task,
    loader_download: undefined
  };

  const shell = (children: React.ReactNode) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader
        icon={Server}
        accent={ACCENT}
        title={config.title}
        subtitle={config.subtitle}
        step={config.steps[stepIndex]}
        task={taskFor[screen]}
      />
      {children}
    </div>
  );

  const encryptNode = (id: string) => {
    if (encrypted.has(id)) return;
    sounds.playClick();
    setEncrypted((prev) => new Set(prev).add(id));
  };

  const setInField = (id: string, inField: boolean) =>
    setSelected((prev) => applySelection(prev, id, inField));

  const confirm = () => {
    if (decidedRef.current || !canConfirmExfil(selected)) return;
    decidedRef.current = true;
    sounds.playClick();
    onDecision(buildExfilReport(exfil, selected));
    // Critical: silnik pokazuje wykrycie, bez dalszego loadera.
    if (exfilTier(countSelection(exfil.files, selected), exfil.requiredTargets) === 'critical') return;
    setScreen('loader_download');
  };

  if (screen === 'loader_scan' || screen === 'loader_download') {
    const scan = screen === 'loader_scan';
    return shell(
      <div className="flex-1 min-h-0">
        <ModuleLoader
          label={scan ? start.loader : exfil.loader}
          durationMs={LOADER_MS}
          accent={ACCENT}
          onDone={() => (scan ? setScreen('encrypt') : onComplete())}
        />
      </div>
    );
  }

  if (screen === 'start') {
    const rows: [string, string][] = [
      [start.hostLabel, start.host],
      [start.ipLabel, start.ip]
    ];
    const { status, notes } = c2StartInfo(start, choices, { rejected, score, passingScore });
    return shell(
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div
          className="w-full rounded-xl border p-5 2xl:p-8 space-y-4 2xl:space-y-6 bg-black/40"
          style={{ borderColor: `${ACCENT}66`, boxShadow: `0 0 24px ${ACCENT}22` }}
        >
          <div className="flex items-center gap-3 text-base 2xl:text-2xl font-black tracking-wide text-red-300">
            <AlertTriangle size={26} className="shrink-0 text-red-400" />
            <span>{status}</span>
          </div>
          {notes.length > 0 && (
            <ul className="space-y-1.5 text-xs 2xl:text-base font-bold tracking-wide text-yellow-300/90">
              {notes.map((n) => (
                <li key={n}>&gt; {n}</li>
              ))}
            </ul>
          )}
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
            label={start.button}
            className="w-full py-4 2xl:py-5 text-sm 2xl:text-lg"
            onClick={() => {
              sounds.playClick();
              setScreen('loader_scan');
            }}
          />
        </div>
      </div>
    );
  }

  if (screen === 'encrypt') {
    return shell(
      <>
        <div className="flex-1 min-h-0 rounded-lg border border-gray-700 bg-black/30 p-2">
          <EncryptNetwork nodes={encrypt.nodes} encrypted={encrypted} onEncrypt={encryptNode} />
        </div>
        {allEncrypted && (
          <div className="shrink-0 space-y-2 animate-in fade-in duration-300">
            <div className="text-xs 2xl:text-base font-black tracking-wide text-center" style={{ color: ACCENT }}>
              {encrypt.doneMessage}
            </div>
            <ConfirmButton
              accent={ACCENT}
              label={encrypt.nextLabel}
              onClick={() => {
                sounds.playClick();
                setScreen('exfil');
              }}
            />
          </div>
        )}
      </>
    );
  }

  return shell(
    <>
      <ExfilFiles
        accent={ACCENT}
        files={files}
        selected={selected}
        fieldLabel={exfil.fieldLabel}
        onToggle={(id) => setInField(id, !selected.includes(id))}
        onSet={setInField}
      />
      <ConfirmButton accent={ACCENT} label={exfil.confirmLabel} enabled={canConfirmExfil(selected)} onClick={confirm} />
    </>
  );
};
