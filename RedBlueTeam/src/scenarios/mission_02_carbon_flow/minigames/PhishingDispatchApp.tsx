import React, { useState } from 'react';
import { Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps } from '../../../engine/types/mission';
import type { PhishingDispatchConfig } from './types';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SidePanel } from '../../../engine/components/SidePanel';
import { InfoCard, OptionCards } from './ui';

type Screen = 'sender_select' | 'preview' | 'dispatching' | 'sent';

export const PhishingDispatchApp: React.FC<BlockProps<PhishingDispatchConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  // Akcent = kolor kafelka //PHISHING (WYSYŁKA) na pulpicie (jak w Misji 1).
  const accent = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('sender_select');
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);

  const senderOptions = useShuffled(config.sender.options);
  const selectedSender = config.sender.options.find((o) => o.id === selectedSenderId);

  // Treść maila zależy od wcześniejszych wyborów (temat, szablon) zapisanych w silniku.
  const playerChoices = useMissionStore((s) => s.playerChoices);
  const answerFor = (num: number) => playerChoices.find((c) => c.num === num)?.answer;
  const topic = config.topics.find((t) => t.label === answerFor(config.topicDecisionNum)) ?? config.topics[0];
  const template =
    config.templates.find((t) => t.label === answerFor(config.templateDecisionNum)) ?? config.templates[0];
  const signoff = (selectedSender && config.signoffs[selectedSender.id]) || '';

  const handleSenderConfirm = () => {
    if (!selectedSender) return;
    sounds.playSuccess();
    onDecision({
      num: config.sender.decisionNum,
      question: config.sender.question,
      answer: selectedSender.label,
      tier: selectedSender.tier,
      feedback: selectedSender.feedback
    });
    if (selectedSender.tier !== 'critical') {
      setScreen('preview');
    }
  };

  const handleSendCampaign = () => {
    sounds.playClick();
    setScreen('dispatching');
  };

  const header = (subtitle: string, task: string, step: string) => (
    <AppHeader icon={Send} accent={accent} title="//PHISHING (WYSYŁKA)" subtitle={subtitle} task={task} step={step} />
  );

  // Podgląd maila stoi na lewym ekranie przez cały etap; na prawym monitorze są wybór nadawcy i przycisk wysyłki.
  const mailPreview = (
    <div className="space-y-3 animate-in fade-in duration-200">
      <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs border-b border-gray-800 pb-2">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-gray-400">NADAWCA:</span>
            <span className="font-mono font-bold truncate" style={{ color: selectedSender ? accent : '#6b7280' }}>
              {selectedSender?.label ?? '…'}
            </span>
          </div>
          <div className="text-[0.6875rem] text-gray-400 font-mono text-right">
            DO:{' '}
            <span className="text-white">
              pracownicy@{config.targetDomain} ({config.recipientsCount} odbiorców)
            </span>
          </div>
        </div>
        <div className="text-xs pt-1">
          <span className="text-gray-400">TEMAT: </span>
          <span className="text-white font-bold">{topic.label}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-800 bg-black/60 space-y-3 text-xs leading-relaxed text-gray-300">
        <p>Dzień dobry,</p>
        <p>{topic.body}</p>
        <p>
          Czas na wypełnienie formularza upływa dzisiaj o godzinie 16:00. Link do formularza w serwisie{' '}
          {template.serviceName}:
        </p>
        <div
          className="p-3 rounded-lg border flex items-center justify-between gap-3"
          style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
        >
          <div className="flex items-center space-x-2 font-mono text-[0.6875rem] min-w-0" style={{ color: accent }}>
            <ExternalLink size={14} className="shrink-0" />
            <span className="truncate">{`https://${template.domainHost}/surveys/${topic.slug}?token=0day_worm`}</span>
          </div>
          <span
            className="text-[0.5625rem] px-2 py-0.5 rounded border font-mono shrink-0"
            style={{ borderColor: `${accent}66`, color: accent, backgroundColor: `${accent}1a` }}
          >
            ŁADUNEK WSTRZYKNIĘTY
          </span>
        </div>
        <p className="text-[0.6875rem] text-gray-400 pt-2">
          Z poważaniem,
          <br />
          {signoff || '…'}
        </p>
      </div>
    </div>
  );

  const sideContent =
    screen === 'sender_select' ? (
      <SidePanel
        accent={accent}
        heading="//PHISHING (WYSYŁKA): NADAWCA"
        sub={config.sender.question}
        footer={
          <ConfirmButton
            accent={accent}
            label="ZATWIERDŹ NADAWCĘ"
            enabled={!!selectedSender}
            onClick={handleSenderConfirm}
          />
        }
      >
        <OptionCards
          accent={accent}
          options={senderOptions}
          selectedId={selectedSenderId}
          onSelect={setSelectedSenderId}
          label="WYBIERZ ADRES"
          mono
        />
      </SidePanel>
    ) : screen === 'preview' ? (
      <SidePanel
        accent={accent}
        heading="//PHISHING (WYSYŁKA): GOTOWE"
        sub="Wiadomość jest skonfigurowana. Wyślij kampanię do pracowników CarbonFlow."
        footer={
          <ConfirmButton
            accent={accent}
            label="WYŚLIJ KAMPANIĘ PHISHINGOWĄ"
            onClick={handleSendCampaign}
            icon={<Send size={15} />}
          />
        }
      >
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
            <span className="text-[0.625rem] text-gray-400 block tracking-wider">NADAWCA</span>
            <span className="font-bold text-white font-mono break-all">{selectedSender?.label}</span>
          </div>
          <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
            <span className="text-[0.625rem] text-gray-400 block tracking-wider">ODBIORCY</span>
            <span className="font-bold text-white">
              {config.recipientsCount} adresów w domenie {config.targetDomain}
            </span>
          </div>
        </div>
      </SidePanel>
    ) : (
      // Wysyłka i potwierdzenie: monitor zostaje zajęty (bez migania czatu), ale pusty.
      <div className="h-full" />
    );

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <SideMonitor>{sideContent}</SideMonitor>

      {screen === 'sender_select' && (
        <div className="flex flex-col h-full space-y-4">
          {header(
            'WYBÓR NADAWCY',
            'Wybierz na prawym monitorze adres, z którego zostanie wysłana wiadomość.',
            'KROK 1/2'
          )}
          {mailPreview}
        </div>
      )}

      {screen === 'preview' && (
        <div className="flex flex-col h-full space-y-4">
          {header('WYSYŁKA KAMPANII', 'Sprawdź wiadomość i wyślij kampanię z prawego monitora.', 'KROK 2/2')}
          {mailPreview}
        </div>
      )}

      {screen === 'dispatching' && (
        <ModuleLoader
          label="Rozsyłanie pakietów SMTP przez tunel VPN do serwera CarbonFlow Inc..."
          durationMs={1300}
          accent={accent}
          onDone={() => {
            sounds.playSuccess();
            setScreen('sent');
          }}
        />
      )}

      {screen === 'sent' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
          {header('KAMPANIA WYSŁANA', 'Wróć na pulpit i obserwuj, co się stanie.', 'FINALIZACJA')}
          <InfoCard accent={accent} className="text-center my-auto">
            <div
              className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center"
              style={{ borderColor: accent, backgroundColor: `${accent}26`, color: accent }}
            >
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              KAMPANIA PHISHINGOWA ZOSTAŁA WYSŁANA
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              Pakiety SMTP zostały dostarczone do skrzynek {config.recipientsCount} pracowników w domenie{' '}
              {config.targetDomain}. Oczekujemy na otwarcie linku i aktywację ładunku w sieci LAN.
            </p>
          </InfoCard>
          <div className="flex justify-end">
            <ConfirmButton accent={accent} label="POWRÓT DO PULPITU" onClick={onComplete} className="w-auto px-6" />
          </div>
        </div>
      )}
    </div>
  );
};
