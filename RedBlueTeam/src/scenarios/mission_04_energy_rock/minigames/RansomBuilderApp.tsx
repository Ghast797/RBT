// Etap 2 — //KREATOR: RANSOMWARE: hasło (D2), komunikat (D3), kolor (D4), kompilacja. Teksty i poziomy z configu
// (stages.ts, builderConfig); logika w ransomLogic.ts. Kontrakt: docs/rebuild-plan.md, 3.2, 8, 9.
// Zwykły useState (aplikacje pamiętają stan: AppHost trzyma instancję). Po critical dalsze kroki są zablokowane.

import React, { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { LOADER_LONG_MS, LOADER_MS, ModuleLoader } from '../../../engine/components/ModuleLoader';
import { sounds } from '../../../engine/audio/soundEffects';
import { submitDecision } from '../../../engine/core/report';
import { MentorRejectNotice, isRejected, useRejectedAttempts } from '../../../engine/components/MentorRejectNotice';

import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import { M4_NOTE_KEY, type BuilderConfig, type M4NoteState } from './types';
import { PasswordStep } from './PasswordStep';
import { NoteStep } from './NoteStep';
import { ColorStep } from './ColorStep';
import {
  buildNoteReport,
  buildNoteRejection,
  buildPasswordReport,
  buildPasswordRejection,
  evaluatePassword,
  passwordOptionId,
  type NoteFill,
  type PasswordEvaluation
} from './ransomLogic';

const ACCENT = '#a855f7';
const RESULT_MS = 2500;
const DONE_MS = 1500;

type Screen = 'password' | 'result' | 'loadNote' | 'note' | 'loadColor' | 'color' | 'compile' | 'done';

export const RansomBuilderApp: React.FC<BlockProps<BuilderConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  const rejectDecision = useMissionStore((s) => s.rejectDecision);
  const { password, note, color } = config;

  const [screen, setScreen] = useState<Screen>('password');
  const [length, setLength] = useState(password.defaultLength);
  const [selected, setSelected] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<PasswordEvaluation | null>(null);
  const [fill, setFill] = useState<NoteFill>({});
  const [colorId, setColorId] = useState<string | null>(null);
  // Po zgłoszeniu critical silnik pokazuje wykrycie; do powtórki (nowy montaż) wybór jest zablokowany.
  const [locked, setLocked] = useState(false);
  const completedRef = useRef(false);
  const passwordRejected = useRejectedAttempts(password.decisionNum);

  useEffect(() => {
    if (screen !== 'result') return;
    const id = setTimeout(() => setScreen('loadNote'), RESULT_MS);
    return () => clearTimeout(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'done') return;
    const id = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, DONE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const confirmPassword = () => {
    if (locked || selected.length < 1) return;
    const ev = evaluatePassword(password, selected, length);
    // B2: mentor odrzuca hasło (np. za słabe) — zostajemy w kroku, konfiguracja się blokuje.
    const rejection = buildPasswordRejection(password, ev, selected);
    if (rejection) {
      rejectDecision(rejection);
      return;
    }
    sounds.playSuccess();
    setEvaluation(ev);
    onDecision(buildPasswordReport(password, ev));
    if (ev.tier === 'critical') setLocked(true);
    else setScreen('result');
  };

  const confirmNote = () => {
    if (locked) return;
    // B2: mentor odrzuca kafelek tytułu/czasu — kafelek wraca do zasobnika i się blokuje.
    const noteRejection = buildNoteRejection(note, fill);
    if (noteRejection) {
      rejectDecision(noteRejection.rejection);
      const next = { ...fill };
      delete next[noteRejection.slot];
      setFill(next);
      return;
    }
    sounds.playSuccess();
    const report = buildNoteReport(note, fill);
    onDecision(report);
    if (report.tier === 'critical') setLocked(true);
    else setScreen('loadColor');
  };

  const confirmColor = () => {
    const opt = color.options.find((o) => o.id === colorId);
    if (!opt || locked) return;
    if (submitDecision(color, opt, { onDecision, rejectDecision }) === 'rejected') {
      setColorId(null);
      return;
    }
    sounds.playSuccess();
    const state: M4NoteState = { titleId: fill.title ?? '', timeId: fill.time ?? '', colorId: opt.id };
    setCustomState(M4_NOTE_KEY, state);
    if (opt.tier === 'critical') setLocked(true);
    else setScreen('compile');
  };

  const task = (): string | undefined => {
    if (screen === 'password') return password.task;
    if (screen === 'note') return note.task;
    if (screen === 'color') return color.task;
    return undefined;
  };
  const stepBadge: Partial<Record<Screen, string>> = {
    password: config.steps[0],
    result: config.steps[0],
    loadNote: config.steps[1],
    note: config.steps[1],
    loadColor: config.steps[2],
    color: config.steps[2]
  };

  const wrap = (children: React.ReactNode) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[#05090f] text-gray-200 font-mono select-none p-4 gap-3">
      <AppHeader icon={Lock} accent={ACCENT} title={config.title} subtitle={config.subtitle} step={stepBadge[screen]} task={task()} />
      <div className="flex-1 min-h-0 flex flex-col gap-3">{children}</div>
    </div>
  );
  const loading = (label: string, ms: number, next: Screen) =>
    wrap(
      <div className="flex-1 min-h-0">
        <ModuleLoader accent={ACCENT} label={label} durationMs={ms} onDone={() => setScreen(next)} />
      </div>
    );

  if (screen === 'loadNote') return loading(config.loaders.note, LOADER_MS, 'note');
  if (screen === 'loadColor') return loading(config.loaders.color, LOADER_MS, 'color');
  if (screen === 'compile') return loading(config.loaders.compile, LOADER_LONG_MS, 'done');

  if (screen === 'result' && evaluation) {
    return wrap(
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-200">
        <div className="text-3xl font-black tracking-widest text-white">{`${password.resultLabel} ${evaluation.score}/5`}</div>
        <div className="max-w-2xl text-sm font-bold tracking-wide" style={{ color: ACCENT }}>
          {password.strengthMessages[evaluation.score]}
        </div>
      </div>
    );
  }

  if (screen === 'done') {
    return wrap(
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="text-2xl font-black tracking-widest text-[#00ff66] animate-in fade-in duration-200">{config.doneMessage}</div>
      </div>
    );
  }

  if (screen === 'note') {
    return wrap(<NoteStep config={note} accent={ACCENT} fill={fill} onFill={setFill} locked={locked} onConfirm={confirmNote} />);
  }

  if (screen === 'color') {
    return wrap(
      <ColorStep
        config={color}
        note={note}
        fill={fill}
        accent={ACCENT}
        selectedId={colorId}
        onSelect={setColorId}
        locked={locked}
        onConfirm={confirmColor}
      />
    );
  }

  return wrap(
    <PasswordStep
      config={password}
      accent={ACCENT}
      length={length}
      onLength={setLength}
      selected={selected}
      onSelected={setSelected}
      locked={locked}
      notice={<MentorRejectNotice attempts={passwordRejected} />}
      // Ta sama konfiguracja odrzucona przez mentora: trzeba ją zmienić, zanim da się zatwierdzić ponownie.
      confirmBlocked={isRejected(passwordRejected, passwordOptionId(selected, length))}
      onConfirm={confirmPassword}
    />
  );
};
