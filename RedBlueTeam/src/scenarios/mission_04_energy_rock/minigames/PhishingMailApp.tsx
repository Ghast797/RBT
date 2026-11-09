// ZAŚLEPKA (porcja B) etapu 3 — //MAIL. Zastępuje ją porcja E (temat, treść, uzbrojenie załącznika).
import React from 'react';
import { Mail } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import { buildReport } from '../../../engine/core/report';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { M4_MAIL_KEY, type MailConfig, type M4MailState } from './types';
import { StubShell } from './stub';

export const PhishingMailApp: React.FC<BlockProps<MailConfig>> = ({ config, onDecision, onComplete }) => {
  const setCustomState = useMissionStore((s) => s.setCustomState);
  const subject = config.subject.options.find((o) => o.tier === 'ideal')!;
  const body = config.body.options.find((o) => o.tier === 'ideal')!;
  return (
    <StubShell
      icon={Mail}
      accent="#38bdf8"
      title={config.title}
      subtitle={config.subtitle}
      actions={[
        { label: 'D5: ZGŁOŚ WYBÓR IDEALNY', run: () => onDecision(buildReport(config.subject, subject)) },
        {
          label: 'D6: ZGŁOŚ WYBÓR IDEALNY',
          run: () => {
            const state: M4MailState = { subjectId: subject.id, bodyId: body.id };
            setCustomState(M4_MAIL_KEY, state);
            onDecision(buildReport(config.body, body));
          }
        },
        { label: 'ZAKOŃCZ ETAP', run: onComplete }
      ]}
    />
  );
};
