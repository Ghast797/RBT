// Etap 3 — //MAIL (M4): makieta nowej wiadomości do działu rekrutacji. Ekran 1: temat (D5), ekran 2: treść (D6,
// zapis customState.m4_mail), ekran 3: przeciągnięcie //WIRUS na ikonę załącznika (pasek ok. 2 s -> `armed`).
// Teksty i opcje z configu (stages.ts, mailConfig); logika w mailLogic.ts. Interfejs nie ocenia wyboru.

import React, { useEffect, useRef, useState } from 'react';
import { Mail, Paperclip, Skull, Check } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { LOADER_LONG_MS, LOADER_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import { DragGhost, usePointerDrag } from '../../../engine/components/usePointerDrag';
import { sounds } from '../../../engine/audio/soundEffects';
import { submitDecision } from '../../../engine/core/report';
import { MentorRejectNotice, isRejected, useRejectedAttempts } from '../../../engine/components/MentorRejectNotice';
import { useShuffled } from '../../../engine/core/shuffle';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { M4_MAIL_KEY, type MailConfig } from './types';
import { buildMailState, canConfirmStep, findOption, placeInField } from './mailLogic';

const ACCENT = '#38bdf8';
const PAYLOAD_ID = 'payload';

type Screen = 'subject' | 'loadBody' | 'body' | 'loadArm' | 'arm';

const ArmBar: React.FC<{ label: string; onDone: () => void }> = ({ label, onDone }) => {
  const [pct, setPct] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n = Math.min(100, n + 5);
      setPct(n);
      if (n >= 100) {
        clearInterval(id);
        sounds.playSuccess();
        doneRef.current();
      }
    }, LOADER_LONG_MS / 20);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-xs font-bold tracking-widest text-red-400">
        <span>{label}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="h-3 rounded border border-red-500 p-0.5 bg-black/50">
        <div className="h-full rounded bg-red-500 transition-all duration-100" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-700 text-sm">
    <span className="w-28 shrink-0 font-black tracking-widest text-gray-400">{label}</span>
    <span className="font-bold text-white">{children}</span>
  </div>
);

export const PhishingMailApp: React.FC<BlockProps<MailConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  const rejectDecision = useMissionStore((s) => s.rejectDecision);
  const [screen, setScreen] = useState<Screen>('subject');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [bodyId, setBodyId] = useState<string | null>(null);
  const [arming, setArming] = useState(false);
  const [armed, setArmed] = useState(false);
  // Po critical silnik pokazuje ekran wykrycia; do powtórki wybór jest zablokowany.
  const [locked, setLocked] = useState(false);

  const subjectTiles = useShuffled(config.subject.options);
  const bodyTiles = useShuffled(config.body.options);
  const subject = findOption(config.subject.options, subjectId);
  const body = findOption(config.body.options, bodyId);

  const isSubject = screen === 'subject';
  const decision = isSubject ? config.subject : config.body;
  const tiles = isSubject ? subjectTiles : bodyTiles;
  const fieldValue = isSubject ? subject : body;
  // B2: kafelki odrzucone przez mentora (D5 temat, D6 treść) są zablokowane, nad nimi widać jego kwestię.
  const rejected = useRejectedAttempts(decision.decisionNum);

  const pick = (id: string) => {
    if (locked || isRejected(rejected, id)) return;
    if (screen === 'subject') setSubjectId((c) => placeInField(c, id, config.subject.options));
    else if (screen === 'body') setBodyId((c) => placeInField(c, id, config.body.options));
    else return;
    sounds.playClick();
  };

  const startArm = () => {
    if (screen !== 'arm' || arming || armed) return;
    sounds.playClick();
    setArming(true);
  };

  const drag = usePointerDrag<string>({
    onDrop: ({ itemId }) => (itemId === PAYLOAD_ID ? startArm() : pick(itemId)),
    onTap: (itemId) => (itemId === PAYLOAD_ID ? startArm() : pick(itemId)),
    canDrag: (itemId) =>
      itemId === PAYLOAD_ID ? screen === 'arm' && !arming && !armed : !locked && screen !== 'arm' && !isRejected(rejected, itemId),
    accepts: (itemId, zoneId) => (itemId === PAYLOAD_ID ? zoneId === 'attachment' : zoneId === 'field')
  });

  const confirm = () => {
    if (locked) return;
    if (screen === 'subject' && subject) {
      if (submitDecision(config.subject, subject, { onDecision, rejectDecision }) === 'rejected') {
        setSubjectId(null);
        return;
      }
      sounds.playSuccess();
      if (subject.tier === 'critical') setLocked(true);
      else setScreen('loadBody');
    } else if (screen === 'body' && body) {
      if (submitDecision(config.body, body, { onDecision, rejectDecision }) === 'rejected') {
        setBodyId(null);
        return;
      }
      sounds.playSuccess();
      const state = buildMailState(subjectId, bodyId);
      if (state) setCustomState(M4_MAIL_KEY, state);
      if (body.tier === 'critical') setLocked(true);
      else setScreen('loadArm');
    }
  };

  const task =
    screen === 'subject'
      ? config.subject.task
      : screen === 'body'
        ? config.body.task
        : screen === 'arm'
          ? config.arm.task
          : undefined;
  const step = screen === 'subject' ? config.steps[0] : screen === 'body' || screen === 'loadBody' ? config.steps[1] : config.steps[2];

  const wrap = (children: React.ReactNode) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader icon={Mail} accent={ACCENT} title={config.title} subtitle={config.subtitle} step={step} task={task} />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );

  if (screen === 'loadBody')
    return wrap(<ModuleLoader accent={ACCENT} label={config.loaders.body} durationMs={LOADER_MS} onDone={() => setScreen('body')} />);
  if (screen === 'loadArm')
    return wrap(<ModuleLoader accent={ACCENT} label={config.loaders.arm} durationMs={LOADER_MS} onDone={() => setScreen('arm')} />);

  // --- ekran 3: uzbrojenie załącznika ---
  if (screen === 'arm') {
    const payloadActive = !arming && !armed;
    return (
      <>
        {wrap(
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="rounded-xl border bg-[#08101a] overflow-hidden" style={{ borderColor: `${ACCENT}55` }}>
              <Row label="DO:">{config.recipient}</Row>
              <Row label={config.positionLabel}>{config.position}</Row>
              <Row label={config.subject.fieldLabel}>{subject?.label}</Row>
              <div className="px-4 py-3 text-sm text-gray-200 leading-snug border-b border-gray-700">
                <span className="font-black tracking-widest text-gray-400 mr-3">{config.body.fieldLabel}</span>
                {body?.label}
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  ref={drag.zoneRef('attachment')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: armed
                      ? '#ef4444'
                      : drag.isOver('attachment')
                        ? '#00ff66'
                        : drag.isDropTarget('attachment')
                          ? ACCENT
                          : `${ACCENT}66`,
                    backgroundColor: armed ? '#ef444422' : drag.isOver('attachment') ? '#00ff6622' : '#0b1724'
                  }}
                >
                  <Paperclip size={20} style={{ color: armed ? '#ef4444' : ACCENT }} />
                  <span className="text-sm font-bold text-white">{config.attachment}</span>
                </div>
                {!armed && (
                  <div
                    role="button"
                    tabIndex={payloadActive ? 0 : -1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') startArm();
                    }}
                    {...drag.getDragProps(PAYLOAD_ID)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      payloadActive ? 'cursor-grab hover:-translate-y-0.5' : 'opacity-40'
                    } ${drag.draggedId === PAYLOAD_ID ? 'opacity-40' : ''}`}
                    style={{
                      ...drag.getDragProps(PAYLOAD_ID).style,
                      borderColor: payloadActive ? '#ef4444' : '#374151',
                      backgroundColor: payloadActive ? '#ef444418' : '#0b1724'
                    }}
                  >
                    <Skull size={20} className={payloadActive ? 'text-red-400' : 'text-gray-500'} />
                    <span className="text-sm font-black tracking-wider text-white">{config.payloadLabel}</span>
                  </div>
                )}
              </div>
            </div>
            {arming && !armed && (
              <ArmBar
                label={config.arm.arming}
                onDone={() => {
                  setArmed(true);
                  setArming(false);
                }}
              />
            )}
            {armed && (
              <div className="flex items-center justify-center gap-3 text-lg font-black tracking-widest text-green-400 animate-in fade-in duration-300">
                <Check size={26} />
                {config.arm.armed}
              </div>
            )}
            <div className="flex-1" />
            {armed && <ConfirmButton accent={ACCENT} label={config.arm.nextLabel} onClick={onComplete} />}
          </div>
        )}
        <DragGhost dragging={drag.dragging}>{config.payloadLabel}</DragGhost>
      </>
    );
  }

  // --- ekrany 1 i 2: pole + kafelki ---
  const draggedTile = tiles.find((t) => t.id === drag.draggedId);
  return (
    <>
      {wrap(
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="rounded-xl border bg-[#08101a] overflow-hidden" style={{ borderColor: `${ACCENT}55` }}>
            <Row label="DO:">{config.recipient}</Row>
            <Row label={config.positionLabel}>{config.position}</Row>
            {!isSubject && <Row label={config.subject.fieldLabel}>{subject?.label}</Row>}
            <div
              ref={drag.zoneRef('field')}
              className="flex items-start gap-3 px-4 py-3 m-3 rounded-lg border-2 border-dashed transition-colors"
              style={{
                minHeight: isSubject ? 52 : 96,
                borderColor: drag.isOver('field') ? '#00ff66' : drag.isDropTarget('field') ? ACCENT : `${ACCENT}66`,
                backgroundColor: drag.isOver('field') ? '#00ff6618' : '#0b172455'
              }}
            >
              <span className="w-28 shrink-0 text-sm font-black tracking-widest text-gray-400">{decision.fieldLabel}</span>
              <span className="text-sm font-bold text-white leading-snug">{fieldValue?.label}</span>
            </div>
          </div>
          <MentorRejectNotice attempts={rejected} />
          <div className="flex-1 min-h-0 flex flex-col gap-2.5 justify-center">
            {tiles.map((t) => {
              const used = t.id === fieldValue?.id;
              const blocked = isRejected(rejected, t.id);
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') pick(t.id);
                  }}
                  {...drag.getDragProps(t.id)}
                  className={`p-3 rounded-lg border-2 bg-[#0b1724] text-sm font-bold text-white leading-snug transition-all ${
                    blocked ? 'opacity-40 line-through cursor-not-allowed' : 'cursor-grab hover:-translate-y-0.5'
                  } ${drag.draggedId === t.id ? 'opacity-40' : used ? 'opacity-50' : ''}`}
                  style={{ ...drag.getDragProps(t.id).style, borderColor: blocked ? '#ff3366' : used ? ACCENT : `${ACCENT}55` }}
                >
                  {t.label}
                </div>
              );
            })}
          </div>
          <ConfirmButton
            accent={ACCENT}
            label={config.confirmLabel}
            enabled={canConfirmStep(screen, subjectId, bodyId) && !locked}
            onClick={confirm}
          />
        </div>
      )}
      <DragGhost dragging={drag.dragging}>{draggedTile?.label}</DragGhost>
    </>
  );
};
