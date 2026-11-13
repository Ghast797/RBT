// Etap 3 — //DYSK E: PENDRIVE (scena S04): pobranie załączników, uzbrojenie nośnika (plik pasujący do planu D3
// na pendrive'a, //WIRUS: RAT na plik -> archiwum ZIP), nazwa dysku, podpis na kopercie (D4), wysunięcie.
// Teksty i opcje z configu (stages.ts, pendriveConfig); logika w usbLogic.ts. Kontrakt: docs/rebuild-plan.md, 3.3.
// D4 = gorszy z dwóch kroków (nazwa, podpis); nazwa `KEYLOGGER` zgłasza D4 od razu. Stan nośnika: customState.m3_usb.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileText, HardDrive, Image as ImageIcon, Package, Usb, Check } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceCardGrid } from '../../../engine/components/ChoiceZone';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { LOADER_LONG_MS, LOADER_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { useShuffled } from '../../../engine/core/shuffle';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { buildRejection } from '../../../engine/core/report';
import type { BlockProps } from '../../../engine/types/mission';
import { PLAN_STATE_KEY, USB_STATE_KEY, type PendriveConfig, type UsbAttachment } from './types';
import { ImageSlot } from './ui';
import {
  buildD4Report,
  buildUsbState,
  buildVolumeCriticalReport,
  fileMatchesPlan,
  resolveOptionsForPlan,
  resolvePlanRule
} from './usbLogic';

// Kolor kafelka //DYSK E na pulpicie.
const ACCENT = '#f59e0b';
const PAYLOAD_ID = 'payload';

type Screen = 'start' | 'dl' | 'arm' | 'prep' | 'name' | 'save' | 'sign' | 'eject' | 'done';

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
  const rejectDecision = useMissionStore((s) => s.rejectDecision);
  // Plan z D3 (id opcji wektora) zapisany przez //TOR we wspólnym stanie.
  const planVectorId = useMissionStore((s) => s.customState[PLAN_STATE_KEY]) as string | undefined;

  const [screen, setScreen] = useState<Screen>('start');
  const [usbFileId, setUsbFileId] = useState<string | null>(null);
  const [packing, setPacking] = useState(false);
  const [packed, setPacked] = useState(false);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [volumeId, setVolumeId] = useState<string | null>(null);
  const [signatureId, setSignatureId] = useState<string | null>(null);
  // Po zgłoszeniu D4 jako critical silnik pokazuje ekran wykrycia; do powtórki wybór jest zablokowany
  // (podwójny klik nie zgłasza D4 drugi raz).
  const [locked, setLocked] = useState(false);
  const [volumeConfirmedId, setVolumeConfirmedId] = useState<string | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);

  const rule = resolvePlanRule(config.plan, config.planFallbackVectorOptionId, planVectorId);
  // Poziomy i feedback D4 zależą od planu z D3 (M3-06): nazwa i podpis oceniane względem tego, co jest na pendrive'ie.
  const planId = rule?.vectorOptionId;
  const planVolumes = useMemo(() => resolveOptionsForPlan(config.volume.options, planId), [config.volume.options, planId]);
  const planSignatures = useMemo(
    () => resolveOptionsForPlan(config.signature.options, planId),
    [config.signature.options, planId]
  );

  const attachments = useShuffled(config.attachments);
  const volumeOptions = useShuffled(planVolumes);
  const signatureOptions = useShuffled(planSignatures);

  const usbFile: UsbAttachment | undefined = config.attachments.find((a) => a.id === usbFileId);
  const volume = planVolumes.find((o) => o.id === volumeConfirmedId);
  const signature = planSignatures.find((o) => o.id === signatureId);

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
    const opt = planVolumes.find((o) => o.id === volumeId);
    if (!opt || locked) return;
    // B2: mentor odrzuca nazwę dysku — zostajemy na wyborze, opcja się blokuje.
    const volumeRejection = buildRejection(config.signature, opt);
    if (volumeRejection) {
      rejectDecision(volumeRejection);
      setVolumeId(null);
      return;
    }
    sounds.playSuccess();
    setVolumeConfirmedId(opt.id);
    const critical = buildVolumeCriticalReport(config.signature, opt);
    if (critical) {
      // Nazwa krytyczna zgłasza D4 od razu; silnik pokazuje wykrycie i powtórkę.
      setLocked(true);
      onDecision(critical);
      return;
    }
    setScreen('save');
  };

  const confirmSignature = () => {
    if (!volume || !signature || !usbFile || locked) return;
    // B2: mentor odrzuca podpis na kopercie — zostajemy na wyborze, opcja się blokuje.
    const signatureRejection = buildRejection(config.signature, signature);
    if (signatureRejection) {
      rejectDecision(signatureRejection);
      setSignatureId(null);
      return;
    }
    sounds.playSuccess();
    setCustomState(USB_STATE_KEY, buildUsbState(volume, usbFile, signature));
    onDecision(buildD4Report(config.signature, volume, signature, config.reportLabels));
    if (signature.tier === 'critical') setLocked(true);
    else setScreen('eject');
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

  const stepBadge: Partial<Record<Screen, string>> = {
    arm: config.steps[0],
    prep: config.steps[0],
    name: config.steps[1],
    save: config.steps[1],
    sign: config.steps[2],
    eject: config.steps[2]
  };

  const wrap = (children: React.ReactNode) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader
        icon={HardDrive}
        accent={ACCENT}
        title={config.title}
        subtitle={config.subtitle}
        step={stepBadge[screen]}
        task={taskFor()}
      />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );

  // --- ładowania (każda akcja ma pasek; nagłówek aplikacji zostaje nad nim) ---
  const loading = (label: string, durationMs: number, onDone: () => void) =>
    wrap(
      <div className="flex-1 min-h-0">
        <ModuleLoader accent={ACCENT} label={label} durationMs={durationMs} onDone={onDone} />
      </div>
    );
  if (screen === 'dl') return loading(config.startTexts.loader, LOADER_MS, () => setScreen('arm'));
  if (screen === 'prep') return loading(config.armTexts.loader, LOADER_MS, () => setScreen('name'));
  if (screen === 'save') return loading(config.volume.loader, LOADER_MS, () => setScreen('sign'));
  if (screen === 'eject') return loading(`${config.signature.confirmLabel}…`, 1500, () => setScreen('done'));

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
          <>
            {/* Przypomnienie planu z D3: wyjaśnia komunikat „TEN PLIK NIE PASUJE DO TWOJEGO PLANU”. */}
            <div
              className="shrink-0 mb-3 flex items-center gap-3 px-4 py-2 rounded-lg border text-sm font-bold tracking-wide text-white"
              style={{ borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}10` }}
            >
              <span className="font-black tracking-widest" style={{ color: ACCENT }}>
                {config.armTexts.planPrefix}
              </span>
              <span>{rule?.planLabel}</span>
            </div>
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
          </>
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
          label={config.volume.question}
          options={volumeOptions}
          decisionNum={config.signature.decisionNum}
          selectedId={volumeId}
          onSelect={(id) => {
            if (!locked) setVolumeId(id);
          }}
          columns={2}
          className="mt-4"
        />
        <ConfirmButton
          accent={ACCENT}
          label={config.volume.confirmLabel}
          enabled={!!volumeId && !locked}
          onClick={confirmVolume}
        />
      </div>
    );
  }

  // --- 4. podpis na kopercie (D4) ---
  if (screen === 'sign') {
    return wrap(
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
        <div className="flex-1 min-h-0 grid grid-cols-[1.05fr_1.35fr] items-center gap-5">
          <div className="flex items-center justify-center min-h-0">
            <div
              className="relative w-full aspect-[16/10] rounded-xl border overflow-hidden bg-[#071019] shadow-lg"
              style={{ borderColor: `${ACCENT}55` }}
            >
              <ImageSlot asset={config.envelopeImage} label={config.envelopeImageAlt} fit="cover" />
              <div className="absolute inset-x-8 top-[60%] -translate-y-1/2 flex items-center justify-center pointer-events-none px-4">
                {signature ? (
                  <span className="text-center text-sm lg:text-base font-bold italic font-serif text-[#241c11] leading-snug break-words drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]">
                    {signature.label}
                  </span>
                ) : (
                  <span className="text-center text-xs font-mono tracking-widest text-[#7c6a4d]/80 uppercase">
                    WYBIERZ PODPIS →
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChoiceCardGrid
            accent={ACCENT}
            label={config.signature.question}
            options={signatureOptions}
            decisionNum={config.signature.decisionNum}
            selectedId={signatureId}
            onSelect={(id) => {
              if (!locked) setSignatureId(id);
            }}
            columns={2}
            className="self-center"
          />
        </div>
        <ConfirmButton
          accent={ACCENT}
          label={config.signature.confirmLabel}
          enabled={!!signatureId && !locked}
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
