// ZAŚLEPKA (porcja B) etapu 6 — //CZAT_Z_OFIARĄ. Zastępuje ją porcja G (opakowanie `DialogueTree` + miniatura okna okupu).
import React from 'react';
import { MessageSquareCode } from 'lucide-react';
import type { BlockProps } from '../../../engine/types/mission';
import type { VictimChatConfig } from './types';
import { StubShell } from './stub';

export const VictimChatApp: React.FC<BlockProps<VictimChatConfig>> = ({ config, onDecision, onComplete }) => {
  const decide = (nodeId: string) => () => {
    const node = config.dialogue.nodes.find((n) => n.id === nodeId)!;
    const option = node.options.find((o) => o.tier === 'ideal')!;
    onDecision({
      num: node.decisionNum!,
      question: node.question ?? node.incoming,
      answer: config.reportAnswers[option.id] ?? option.label,
      tier: option.tier,
      feedback: option.feedback
    });
  };
  return (
    <StubShell
      icon={MessageSquareCode}
      accent="#f59e0b"
      title={config.title}
      subtitle={config.subtitle}
      actions={[
        { label: 'D9: ZGŁOŚ WYBÓR IDEALNY', run: decide('neg_1') },
        { label: 'D10: ZGŁOŚ WYBÓR IDEALNY', run: decide('neg_2') },
        { label: 'ZAKOŃCZ ETAP', run: onComplete }
      ]}
    />
  );
};
