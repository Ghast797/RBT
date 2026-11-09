// Etap 3 — //DYSK E: PENDRIVE (scena S04): pobranie załączników, uzbrojenie nośnika (plik pasujący do planu D3
// na pendrive'a, //WIRUS: RAT na plik -> archiwum ZIP), nazwa dysku, podpis na kopercie (D4), wysunięcie.
// Teksty i opcje z configu (stages.ts, pendriveConfig); logika w usbLogic.ts. Kontrakt: docs/rebuild-plan.md, 3.3.
// D4 = gorszy z dwóch kroków (nazwa, podpis); nazwa `KEYLOGGER` zgłasza D4 od razu. Stan nośnika: customState.m3_usb.

import React, { useEffect, useRef, useState } from 'react';
import { Download, FileText, HardDrive, Image as ImageIcon, Package, Usb, Check } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceCardGrid } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { useShuffled } from '../../../engine/core/shuffle';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { USB_STATE_KEY, type PendriveConfig, type UsbAttachment } from './types';
import { LOADER_LONG_MS, LOADER_MS, ImageSlot } from './ui';
import {
  buildD4Report,
  buildUsbState,
  buildVolumeCriticalReport,
  fileMatchesPlan,
  planAnswerFromChoices,
  resolvePlanRule
} from './usbLogic';

// Kolor kafelka //DYSK E na pulpicie.
const ACCENT = '#f59e0b';
const PAYLOAD_ID = 'payload';

type Screen = 'start' | 'dl' | 'arm' | 'prep' | 'name' | 'save' | 'sign' | 'eject' | 'done';
const STEP_BADGE: Partial<Record<Screen, string>> = { arm: 'KROK 1/3', name: 'KROK 2/3', sign: 'KROK 3/3' };

const fileIcon = (name: string, size: number) =>
  /\.(jpg|jpeg|png)/i.test(name) ? <ImageIcon size={size} /> : <FileText size={size} />;

/** Pasek pakowania w archiwum (~2 s); `onDone` po 100%. */
const PackingBar: React.FC<{ label: string; onDone: () => void }> = ({ label, onDone }) => {
  const [pct, setPct] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    let finishId: ReturnType<typeof setTimeout> | undefined;
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(100, n + 5);
      setPct(n);
      if (n >= 100) {
        clearInterval(id);
        sounds.playSuccess();
        finishId = setTimeout(() => doneRef.current(), 700);
      }
    }, LOADER_LONG_MS / 20);
    return () => {
      clearInterval(id);
      if (finishId) clearTimeout(finishId);
    };
  }, []);
  return (
    <div className="w-full space-y-1.5 animate-in fade-in duration-200">
      <div className="flex justify-between text-xs font-bold tracking-widest" style={{ color: ACCENT }}>
        <span>{label}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="h-3 rounded border p-0.5 bg-black/50" style={{ borderColor: ACCENT }}>
        <div
          className="h-full rounded transition-all duration-100"
          style={{ width: `${pct}%`, backgroundColor: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
        />
      </div>
    </div>
  );
};

export const PendriveApp: React.FC<BlockProps<PendriveConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  const playerChoices = useMissionStore((s) => s.playerChoices);

  const [screen, setScreen] = useState<Screen>('start');
  const [usbFileId, setUsbFileId] = useState<string | null>(null);
  const [packing, setPacking] = useState(false);
  const [packed, setPacked] = useState(false);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [volumeId, setVolumeId] = useState<string | null>(null);
  const [signatureId, setSignatureId] = useState<string | null>(null);
  const [volumeConfirmedId, setVolumeConfirmedId] = useState<string | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  const attachments = useShuffled(config.attachments);
  const volumeOptions = useShuffled(config.volume.options);
  const signatureOptions = useShuffled(config.signature.options);

  const rule = resolvePlanRule(
    config.plan,
    config.planFallbackVectorOptionId,
    planAnswerFromChoices(playerChoices, config.planDecisionNum)
  );
  const usbFile: UsbAttachment | undefined = config.attachments.find((a) => a.id === usbFileId);
  const volume = config.volume.options.find((o) => o.id === volumeConfirmedId);
  const signature = config.signature.options.find((o) => o.id === signatureId);

  useEffect(
    () => () => {
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
    },
    []
  );

  // Po wysunięciu nośnika: chwila na przeczytanie komunikatu i wyjście z etapu.
  useEffect(() => {
    if (screen !== 'done') return;
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, 1800);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const placeFile = (fileId: string) => {
    if (usbFileId || screen !== 'arm') return;
    if (fileMatchesPlan(rule, fileId)) {
      sounds.playSuccess();
      setWrongMsg(null);
      setUsbFileId(fileId);
    } else {
      sounds.playError();
      setWrongMsg(config.armTexts.wrongFileMessage);
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrongMsg(null), 3000);
    }
  };

  const packPayload = () => {
    if (!usbFileId || packing || packed) return;
    sounds.playClick();
    setPacking(true);
  };

  const drag = usePointerDrag<string>({
    onDrop: ({ itemId }) => (itemId === PAYLOAD_ID ? packPayload() : placeFile(itemId)),
    onTap: (itemId) => (itemId === PAYLOAD_ID ? packPayload() : placeFile(itemId)),
    canDrag: (itemId) => (itemId === PAYLOAD_ID ? !!usbFileId && !packing && !packed : !usbFileId),
    accepts: (itemId, zoneId) => (itemId === PAYLOAD_ID ? zoneId === 'usbfile' : zoneId === 'usb')
  });

  const confirmVolume = () => {
    const opt = config.volume.options.find((o) => o.id === volumeId);
    if (!opt) return;
    sounds.playSuccess();
    setVolumeConfirmedId(opt.id);
    const critical = buildVolumeCriticalReport(config.signature, opt);
    if (critical) {
      // Nazwa krytyczna zgłasza D4 od razu; silnik pokazuje wykrycie i powtórkę.
      onDecision(critical);
      return;
    }
    setScreen('save');
  };

  const confirmSignature = () => {
    if (!volume || !signature || !usbFile) return;
    sounds.playSuccess();
    setCustomState(USB_STATE_KEY, buildUsbState(volume, usbFile, signature));
    onDecision(buildD4Report(config.signature, volume, signature));
    if (signature.tier !== 'critical') setScreen('eject');
  };

  const taskFor = (): string | undefined => {
    switch (screen) {
      case 'start':
        return config.startTexts.task;
      case 'arm':
        return usbFileId ? config.armTexts.taskPayload : config.armTexts.taskFile;
      case 'name':
        return config.volume.task;
      case 'sign':
        return config.signature.task;
      default:
        return undefined;
    }
  };

  const wrap = (children: React.ReactNode) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader icon={HardDrive} accent={ACCENT} title="//DYSK E: PENDRIVE" step={STEP_BADGE[screen]} task={taskFor()} />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );

  // --- ładowania (każda akcja ma pasek) ---
  if (screen === 'dl')
    return <ModuleLoader accent={ACCENT} label={config.startTexts.loader} durationMs={LOADER_MS} onDone={() => setScreen('arm')} />;
  if (screen === 'prep')
    return <ModuleLoader accent={ACCENT} label={config.armTexts.loader} durationMs={LOADER_MS} onDone={() => setScreen('name')} />;
  if (screen === 'save')
    return <ModuleLoader accent={ACCENT} label={config.volume.loader} durationMs={LOADER_MS} onDone={() => setScreen('sign')} />;
  if (screen === 'eject')
    return (
      <ModuleLoader
        accent={ACCENT}
        label={`${config.signature.confirmLabel}…`}
        durationMs={1500}
        onDone={() => setScreen('done')}
      />
    );

  // --- 1. start ---
  if (screen === 'start') {
    return wrap(
      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setScreen('dl');
          }}
          className="flex flex-col items-center gap-4 px-14 py-10 rounded-2xl border-2 cursor-pointer transition-all hover:-translate-y-1 active:scale-95"
          style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}14`, boxShadow: `0 0 30px ${ACCENT}33` }}
        >
          <Download size={56} style={{ color: ACCENT }} />
          <span className="text-2xl font-black tracking-widest text-white">{config.startTexts.button}</span>
        </button>
      </div>
    );
  }

  // --- 2. uzbrajanie nośnika ---
  if (screen === 'arm') {
    const available = attachments.filter((a) => a.id !== usbFileId);
    const payloadActive = !!usbFileId && !packing && !packed;
    const slotHot = drag.isOver('usb');
    const draggedFile = config.attachments.find((a) => a.id === drag.draggedId);
    return (
      <>
        {wrap(
          <div className="flex-1 min-h-0 grid grid-cols-[1.1fr_1fr_0.7fr] gap-4">
            {/* panel ZAŁĄCZNIKI */}
            <div
              className="min-h-0 rounded-xl border bg-[#08101a] p-3 flex flex-col gap-2.5"
              style={{ borderColor: `${ACCENT}55` }}
            >
              <div className="text-xs font-black tracking-widest" style={{ color: ACCENT }}>
                {config.startTexts.panelTitle}
              </div>
              {available.map((a) => (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') placeFile(a.id);
                  }}
                  {...drag.getDragProps(a.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border-2 bg-[#0b1724] cursor-grab transition-all hover:-translate-y-0.5 ${
                    drag.draggedId === a.id ? 'opacity-40' : ''
                  }`}
                  style={{ ...drag.getDragProps(a.id).style, borderColor: `${ACCENT}66` }}
                >
                  <div className="w-16 h-12 rounded border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center bg-black/40 text-gray-300">
                    {a.thumb ? <ImageSlot asset={a.thumb} label={a.name} /> : fileIcon(a.name, 24)}
                  </div>
                  <span className="text-sm font-bold text-white break-all leading-snug">{a.name}</span>
                </div>
              ))}
              {wrongMsg && (
                <div className="text-xs font-black tracking-wider text-red-400 border border-red-500/60 bg-red-500/10 rounded-lg px-3 py-2 animate-in fade-in duration-150">
                  {wrongMsg}
                </div>
              )}
            </div>

            {/* slot pendrive'a */}
            <div
              ref={drag.zoneRef('usb')}
              className="min-h-0 rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center gap-4 transition-colors"
              style={{
                borderColor: slotHot || drag.isDropTarget('usb') ? ACCENT : `${ACCENT}55`,
                backgroundColor: slotHot ? `${ACCENT}22` : `${ACCENT}0a`
              }}
            >
              <Usb size={56} style={{ color: ACCENT }} />
              <div className="text-sm font-black tracking-widest text-white">{config.armTexts.slotLabel}</div>
              {usbFile && (
                <div
                  ref={drag.zoneRef('usbfile')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: drag.isOver('usbfile') ? '#00ff66' : drag.isDropTarget('usbfile') ? ACCENT : `${ACCENT}88`,
                    backgroundColor: drag.isOver('usbfile') ? '#00ff6622' : '#0b1724'
                  }}
                >
                  {packed ? <Package size={22} style={{ color: '#00ff66' }} /> : fileIcon(usbFile.name, 22)}
                  <span className="text-sm font-bold text-white break-all text-center">
                    {packed ? usbFile.archive : usbFile.name}
                  </span>
                </div>
              )}
              {packing && (
                <PackingBar
                  label={config.armTexts.packing}
                  onDone={() => {
                    setPacked(true);
                    setScreen('prep');
                  }}
                />
              )}
            </div>

            {/* kafelek ładunku */}
            <div
              className="min-h-0 rounded-xl border bg-[#08101a] p-3 flex flex-col items-center justify-center"
              style={{ borderColor: `${ACCENT}55` }}
            >
              <div
                role="button"
                tabIndex={payloadActive ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') packPayload();
                }}
                {...drag.getDragProps(PAYLOAD_ID)}
                className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  payloadActive ? 'cursor-grab hover:-translate-y-0.5' : 'opacity-40'
                } ${drag.draggedId === PAYLOAD_ID ? 'opacity-40' : ''}`}
                style={{
                  ...drag.getDragProps(PAYLOAD_ID).style,
                  borderColor: payloadActive ? '#ef4444' : '#374151',
                  backgroundColor: payloadActive ? '#ef444418' : '#0b1724',
                  boxShadow: payloadActive ? '0 0 18px #ef444455' : undefined
                }}
              >
                <Package size={34} className={payloadActive ? 'text-red-400' : 'text-gray-500'} />
                <span className="text-sm font-black tracking-wider text-white text-center">
                  {config.armTexts.payloadLabel}
                </span>
              </div>
            </div>
          </div>
        )}
        <DragGhost dragging={drag.dragging}>
          {drag.draggedId === PAYLOAD_ID ? config.armTexts.payloadLabel : draggedFile?.name}
        </DragGhost>
      </>
    );
  }

  // --- 3. nazwa dysku ---
  if (screen === 'name') {
    return wrap(
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
        <ChoiceCardGrid
          accent={ACCENT}
          label={config.volume.choiceLabel}
          options={volumeOptions}
          selectedId={volumeId}
          onSelect={setVolumeId}
          columns={2}
          className="mt-4"
        />
        <ConfirmButton accent={ACCENT} label={config.volume.confirmLabel} enabled={!!volumeId} onClick={confirmVolume} />
      </div>
    );
  }

  // --- 4. podpis na kopercie (D4) ---
  if (screen === 'sign') {
    return wrap(
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
        <div className="flex-1 min-h-0 grid grid-cols-[0.8fr_1.6fr] gap-4">
          <div
            className="relative min-h-0 rounded-xl border overflow-hidden bg-black/40"
            style={{ borderColor: `${ACCENT}55` }}
          >
            <ImageSlot asset={config.envelopeImage} label="Koperta z pendrive'em" fit="cover" />
            {signature && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent text-center">
                <span className="text-sm font-black tracking-wider text-white break-words">{signature.label}</span>
              </div>
            )}
          </div>
          <ChoiceCardGrid
            accent={ACCENT}
            label={config.signature.choiceLabel}
            options={signatureOptions}
            selectedId={signatureId}
            onSelect={setSignatureId}
            columns={2}
            className="mt-4 self-start"
          />
        </div>
        <ConfirmButton
          accent={ACCENT}
          label={config.signature.confirmLabel}
          enabled={!!signatureId}
          onClick={confirmSignature}
        />
      </div>
    );
  }

  // --- 5. gotowe ---
  return wrap(
    <div className="flex-1 flex flex-col items-center justify-center gap-5 animate-in fade-in duration-300">
      <div className="p-5 rounded-full border-2" style={{ borderColor: '#00ff66', backgroundColor: '#00ff6618' }}>
        <Check size={48} className="text-green-400" />
      </div>
      <div className="text-xl font-black tracking-widest text-white text-center">{config.successMessage}</div>
    </div>
  );
};
