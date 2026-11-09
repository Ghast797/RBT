// ZAŚLEPKA (porcja B) etapu 2 — //KREATOR: RANSOMWARE. Zastępuje ją porcja D (hasło, komunikat, kolor).
import React from 'react';
import { Lock } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import { buildReport } from '../../../engine/core/report';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { M4_NOTE_KEY, type BuilderConfig, type M4NoteState } from './types';
import { StubShell } from './stub';

export const RansomBuilderApp: React.FC<BlockProps<BuilderConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  const { password, note, color } = config;
  const idealTitle = note.tiles.find((t) => t.slot === 'title' && t.tier === 'ideal')!;
  const idealTime = note.tiles.find((t) => t.slot === 'time' && t.tier === 'ideal')!;
  const idealColor = color.options.find((o) => o.tier === 'ideal')!;
  return (
    <StubShell
      icon={Lock}
      accent="#a855f7"
      title={config.title}
      subtitle={config.subtitle}
      actions={[
        {
          label: 'D2: ZGŁOŚ WYBÓR IDEALNY',
          run: () =>
            onDecision({
              num: password.decisionNum,
              question: password.question,
              answer: password.answers.ideal,
              tier: 'ideal',
              feedback: password.feedback.ideal
            })
        },
        {
          label: 'D3: ZGŁOŚ WYBÓR IDEALNY',
          run: () =>
            onDecision({
              num: note.decisionNum,
              question: note.question,
              answer: [idealTitle.reportPart, idealTime.reportPart].join(note.answerJoiner),
              tier: 'ideal',
              feedback: note.idealFeedback
            })
        },
        {
          label: 'D4: ZGŁOŚ WYBÓR IDEALNY',
          run: () => {
            const state: M4NoteState = { titleId: idealTitle.id, timeId: idealTime.id, colorId: idealColor.id };
            setCustomState(M4_NOTE_KEY, state);
            onDecision(buildReport(color, idealColor));
          }
        },
        { label: 'ZAKOŃCZ ETAP', run: onComplete }
      ]}
    />
  );
};
