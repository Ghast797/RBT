// ZAŚLEPKA (porcja B) etapu 5 — //MODUŁ_RANSOMWARE. Zastępuje ją porcja F (szyfrowanie sieci, eksfiltracja D8).
import React from 'react';
import { Server } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import type { C2Config } from './types';
import { StubShell } from './stub';

export const RansomC2App: React.FC<BlockProps<C2Config>> = ({ config, onDecision, onComplete }) => {
  const { exfil } = config;
  return (
    <StubShell
      icon={Server}
      accent="#8A2BE2"
      title={config.title}
      subtitle={config.subtitle}
      actions={[
        {
          label: 'D8: ZGŁOŚ WYBÓR IDEALNY',
          run: () =>
            onDecision({
              num: exfil.decisionNum,
              question: exfil.question,
              answer: exfil.answers.ideal,
              tier: 'ideal',
              feedback: exfil.feedback.ideal
            })
        },
        { label: 'ZAKOŃCZ ETAP', run: onComplete }
      ]}
    />
  );
};
