import React, { useEffect, useRef, useState } from 'react';
import { Send, ExternalLink, CheckCircle2, Mail } from 'lucide-react';
import { useShuffled } from '../../../engine/core/shuffle';
import { sounds } from '../../../engine/audio/soundEffects';
import { AppHeader } from '../../../engine/components/AppHeader';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { submitDecision } from '../../../engine/core/report';
import type { BlockProps } from '../../../engine/types/mission';
import type { PhishingDispatchConfig } from './types';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { SidePanel } from '../../../engine/components/SidePanel';
import { OptionCards } from './ui';

type Screen = 'sender_select' | 'preview' | 'dispatching' | 'sent';

const NEUTRAL_TOPIC: PhishingDispatchConfig['topics'][number] = { label: '…', body: '…', slug: '…' };
const NEUTRAL_TEMPLATE = { label: '…', serviceName: '…', domainHost: '…' };

const DISPATCH_DURATION_MS = 4800;

/**
 * Wizualizacja wysyłki: pasek postępu, licznik dostarczonych i skrzynki (adresy e-mail pracowników)
 * zapalające się po kolei. Adresy i domena z konfiguracji; liczba odbiorców = długość listy.
 * Wszystko „dostarczone" — to nie jest ocena wyboru gracza.
 */
const DispatchViz: React.FC<{
  accent: string;
  recipients: string[];
  domain: string;
  /** Aktualna liczba dostarczonych; w stanie końcowym równa `total`. */
  delivered: number;
  done?: boolean;
}> = ({ accent, recipients, domain, delivered, done }) => {
  const total = recipients.length;
  const pct = total > 0 ? Math.round((delivered / total) * 100) : 100;
  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-[#08101a] space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs text-gray-400 tracking-wider uppercase">
            {done ? 'Dostarczono' : 'Wysyłanie wiadomości'}
          </div>
          <div className="text-3xl font-black font-mono text-white leading-none pt-1">
            <span style={{ color: accent }}>{delivered}</span>
            <span className="text-gray-500"> / {total}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono text-right">
          serwer pocztowy {domain}
          <div className="text-lg font-black" style={{ color: accent }}>{pct}%</div>
        </div>
      </div>

      <div className="h-2.5 rounded bg-black/60 border overflow-hidden" style={{ borderColor: `${accent}55` }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {recipients.map((email, i) => {
          const on = i < delivered;
          return (
            <div
              key={email}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-300 min-w-0"
              style={{
                borderColor: on ? accent : '#1f2937',
                backgroundColor: on ? `${accent}1f` : '#05090f',
                color: on ? accent : '#4b5563',
                boxShadow: on ? `0 0 10px ${accent}55` : undefined
              }}
            >
              {on ? <CheckCircle2 size={16} className="shrink-0" /> : <Mail size={16} className="shrink-0" />}
              <span className="text-xs sm:text-sm font-mono truncate">{email}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DispatchProgress: React.FC<{
  accent: string;
  recipients: string[];
  domain: string;
  onDone: () => void;
}> = ({ accent, recipients, domain, onDone }) => {
  const total = recipients.length;
  const [delivered, setDelivered] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const step = Math.max(60, Math.floor(DISPATCH_DURATION_MS / Math.max(1, total)));
    let n = 0;
    let finishId: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      n += 1;
      setDelivered(n);
      sounds.playKeypress();
      if (n >= total) {
        clearInterval(id);
        finishId = setTimeout(() => onDoneRef.current(), 700);
      }
    }, step);
    return () => {
      clearInterval(id);
      if (finishId) clearTimeout(finishId);
    };
  }, [total]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="text-sm font-bold tracking-widest animate-pulse" style={{ color: accent }}>
        ROZSYŁANIE PAKIETÓW SMTP PRZEZ TUNEL VPN…
      </div>
      <DispatchViz accent={accent} recipients={recipients} domain={domain} delivered={delivered} />
    </div>
  );
};

export const PhishingDispatchApp: React.FC<BlockProps<PhishingDispatchConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  // Akcent = kolor kafelka //PHISHING (WYSYŁKA) na pulpicie (jak w Misji 1).
  const accent = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('sender_select');
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);

  const rejectDecision = useMissionStore((s) => s.rejectDecision);
  const senderOptions = useShuffled(config.sender.options);
  const selectedSender = config.sender.options.find((o) => o.id === selectedSenderId);

  // Treść maila zależy od wcześniejszych wyborów (temat, szablon) zapisanych w silniku.
  const playerChoices = useMissionStore((s) => s.playerChoices);
  const answerFor = (num: number) => playerChoices.find((c) => c.num === num)?.answer;
  // Brak zapisanego wyboru (np. tryb deweloperski) daje neutralny podgląd, który nie zdradza dobrej odpowiedzi.
  const topic = config.topics.find((t) => t.label === answerFor(config.topicDecisionNum)) ?? NEUTRAL_TOPIC;
  const template =
    config.templates.find((t) => t.label === answerFor(config.templateDecisionNum)) ?? NEUTRAL_TEMPLATE;
  const signoff = (selectedSender && config.signoffs[selectedSender.id]) || '';

  const handleSenderConfirm = () => {
    if (!selectedSender) return;
    // B2: mentor odrzuca adres nadawcy — zostajemy na wyborze, opcja się blokuje.
    if (submitDecision({ decisionNum: config.sender.decisionNum, question: config.sender.question }, selectedSender, { onDecision, rejectDecision }) === 'rejected') {
      setSelectedSenderId(null);
      return;
    }
    sounds.playSuccess();
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
          <div className="text-xs text-gray-400 font-mono text-right">
            DO:{' '}
            <span className="text-white">
              pracownicy@{config.targetDomain} ({config.recipients.length} odbiorców)
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
          {topic.deadline && <>{topic.deadline} </>}Link do formularza w serwisie{' '}
          {template.serviceName}:
        </p>
        <div
          className="p-3 rounded-lg border flex items-center justify-between gap-3"
          style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
        >
          <div className="flex items-center space-x-2 font-mono text-xs min-w-0" style={{ color: accent }}>
            <ExternalLink size={14} className="shrink-0" />
            <span className="truncate">{`https://${template.domainHost}/surveys/${topic.slug}?token=0day_worm`}</span>
          </div>
          <span
            className="text-[0.6875rem] px-2 py-0.5 rounded border font-mono shrink-0"
            style={{ borderColor: `${accent}66`, color: accent, backgroundColor: `${accent}1a` }}
          >
            ŁADUNEK WSTRZYKNIĘTY
          </span>
        </div>
        <p className="text-xs text-gray-400 pt-2">
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
          layout="rows"
          mono
          decisionNum={config.sender.decisionNum}
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
            label="WYŚLIJ"
            onClick={handleSendCampaign}
            icon={<Send size={15} />}
          />
        }
      >
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
            <span className="text-xs text-gray-400 block tracking-wider">NADAWCA</span>
            <span className="font-bold text-white font-mono break-all">{selectedSender?.label}</span>
          </div>
          <div className="p-3 rounded-lg border border-gray-800 bg-black/20">
            <span className="text-xs text-gray-400 block tracking-wider">ODBIORCY</span>
            <span className="font-bold text-white">
              {config.recipients.length} adresów w domenie {config.targetDomain}
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
      {/* Po wysyłce prawy monitor wraca do czatu z mentorem; w trakcie wysyłki zostaje zajęty. */}
      {screen !== 'sent' && <SideMonitor>{sideContent}</SideMonitor>}

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
        <DispatchProgress
          accent={accent}
          recipients={config.recipients}
          domain={config.targetDomain}
          onDone={() => {
            sounds.playSuccess();
            setScreen('sent');
          }}
        />
      )}

      {screen === 'sent' && (
        <div className="flex flex-col h-full space-y-3 animate-in fade-in duration-200">
          {header('KAMPANIA WYSŁANA', 'Wróć na pulpit i obserwuj, co się stanie.', 'FINALIZACJA')}
          <div className="flex items-center gap-3 px-1">
            <CheckCircle2 size={28} style={{ color: accent }} className="shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                KAMPANIA PHISHINGOWA ZOSTAŁA WYSŁANA
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Pakiety SMTP trafiły do skrzynek pracowników {config.targetDomain}. Oczekujemy na otwarcie linku i
                aktywację ładunku w sieci LAN.
              </p>
            </div>
          </div>
          <DispatchViz
            accent={accent}
            recipients={config.recipients}
            domain={config.targetDomain}
            delivered={config.recipients.length}
            done
          />
          <div className="flex justify-end">
            <ConfirmButton accent={accent} label="POWRÓT DO PULPITU" onClick={onComplete} className="w-auto px-6" />
          </div>
        </div>
      )}
    </div>
  );
};
