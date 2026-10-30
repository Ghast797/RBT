import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { SideMonitor } from '../../../engine/components/SideMonitor';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { EmailSenderConfig } from './types';
import { EmailPreview } from './EmailPreview';

type EmailScreen = 'sender' | 'load_email' | 'email' | 'summary';

export const EmailSenderApp: React.FC<BlockProps<EmailSenderConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = '#a855f7'; // Purple theme for email campaign app

  const [screen, setScreen] = useState<EmailScreen>('sender');
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Read the domain and payload configured by the player in the website builder step
  const domainChoice = useMissionStore(
    (s) => s.playerChoices.find((c) => c.num === 1)?.answer
  );
  const payloadChoice = useMissionStore(
    (s) => s.playerChoices.find((c) => c.num === 2)?.answer
  );

  const targetDomain = domainChoice || config?.defaultDomain || 'dalekbieg.info';
  const targetPayload = payloadChoice || config?.defaultPayload || 'Poradnik dla biegaczy długodystansowych';

  const selectedSender = config.senderName?.options.find((o) => o.id === selectedSenderId);
  const selectedEmail = config.senderEmail?.options.find((o) => o.id === selectedEmailId);


  const header = (title: string, subtitle: string, task: string, step: string) => (
    <AppHeader icon={Mail} accent={accent} title={title} subtitle={subtitle} task={task} step={step} />
  );

  const renderOptionCards = (
    options: ChoiceOption[] = [],
    selectedId: string | null,
    onSelect: (id: string) => void,
    showTags: boolean = true
  ) => (
    <ChoiceZone accent={accent} label="WYBIERZ JEDNO">
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <ChoiceTile
            key={opt.id}
            accent={accent}
            state={selectedId === opt.id ? 'selected' : 'idle'}
            markerPosition="corner"
            onClick={() => {
              sounds.playClick();
              onSelect(opt.id);
            }}
            className="p-3.5 h-full"
          >
            <div className="space-y-2 pr-7">
              <h3 className="text-xs font-bold text-white leading-snug">{opt.label}</h3>
              {opt.desc && <p className="text-[0.6875rem] text-gray-300 leading-relaxed">{opt.desc}</p>}
              {showTags && opt.tags && opt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ChoiceTile>
        ))}
      </div>
    </ChoiceZone>
  );

  const renderEmailButtons = (
    options: ChoiceOption[] = [],
    selectedId: string | null,
    onSelect: (id: string) => void
  ) => (
    <ChoiceZone accent={accent} label="WYBIERZ ADRES">
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <ChoiceTile
            key={opt.id}
            accent={accent}
            state={selectedId === opt.id ? 'selected' : 'idle'}
            onClick={() => {
              sounds.playClick();
              onSelect(opt.id);
            }}
            className="p-4 items-center font-mono"
          >
            <span className="text-xs font-bold text-white tracking-wider break-all">{opt.label}</span>
          </ChoiceTile>
        ))}
      </div>
    </ChoiceZone>
  );

  const handleSenderConfirm = () => {
    if (!selectedSender || !config.senderName) return;
    sounds.playSuccess();
    onDecision({
      num: config.senderName.decisionNum,
      question: config.senderName.question,
      answer: selectedSender.label,
      tier: selectedSender.tier,
      feedback: selectedSender.feedback
    });
    if (selectedSender.tier !== 'critical') {
      setScreen('load_email');
    }
  };

  const handleEmailConfirm = () => {
    if (!selectedEmail || !config.senderEmail) return;
    sounds.playSuccess();
    onDecision({
      num: config.senderEmail.decisionNum,
      question: config.senderEmail.question,
      answer: selectedEmail.label,
      tier: selectedEmail.tier,
      feedback: selectedEmail.feedback
    });
    if (selectedEmail.tier !== 'critical') {
      setScreen('summary');
    }
  };

  // Prawy monitor jest zajęty przez //POCZTA przez cały etap (także w trakcie ładowania), żeby
  // nie migał czat. Wybory i przyciski żyją tam, a lewy ekran w całości pokazuje wiadomość.
  const confirmButton = (label: string, enabled: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      disabled={!enabled}
      className="w-full shrink-0 px-4 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
      style={{
        backgroundColor: accent,
        color: '#05090f',
        boxShadow: enabled ? `0 0 15px ${accent}66` : undefined
      }}
    >
      <span>{label}</span>
      <ArrowRight size={15} />
    </button>
  );

  const sidePanel = (heading: string, sub: React.ReactNode, body: React.ReactNode, footer?: React.ReactNode) => (
    <div
      className="flex flex-col h-full bg-[#060c14] border-2 rounded-xl p-4 space-y-3 font-mono text-gray-200 select-none"
      style={{ borderColor: `${accent}66` }}
    >
      <div className="border-b pb-2 shrink-0 space-y-1" style={{ borderColor: `${accent}40` }}>
        <span className="text-xs font-black tracking-widest block" style={{ color: accent }}>
          {heading}
        </span>
        <p className="text-[0.6875rem] text-gray-300 leading-snug">{sub}</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-3">{body}</div>
      {footer}
    </div>
  );

  // Lista elementów kampanii — pokazywana w trakcie ładowania i w podsumowaniu.
  const progressPanel = (heading: string, sub: string, footer?: React.ReactNode) => {
    const steps = [
      { label: 'DOMENA PUŁAPKI', value: targetDomain, done: true },
      { label: 'PRZYNĘTA (PAYLOAD)', value: targetPayload, done: true },
      { label: 'PODSZYTY NADAWCA', value: selectedSender?.label, done: screen !== 'sender' },
      { label: 'SPOOFING EMAIL', value: selectedEmail?.label, done: screen === 'summary' }
    ];
    return sidePanel(
      heading,
      sub,
      <div className="flex flex-col gap-2">
        {steps.map((s, idx) => (
          <div
            key={s.label}
            className={`p-3 rounded-lg border text-xs flex items-center space-x-2.5 ${
              s.done ? 'border-[#00ff66]/70 bg-[#00ff66]/10' : 'border-gray-800 bg-black/20 text-gray-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.625rem] shrink-0 font-bold ${
                s.done ? 'bg-[#00ff66] text-[#05090f]' : 'bg-gray-800 text-gray-500'
              }`}
            >
              {s.done ? '✓' : idx + 1}
            </span>
            <div className="min-w-0">
              <span className="text-[0.625rem] text-gray-400 block tracking-wider">{s.label}</span>
              <span className={`font-bold truncate block ${s.done ? 'text-emerald-200' : ''}`}>
                {s.done ? s.value : '…'}
              </span>
            </div>
          </div>
        ))}
      </div>,
      footer
    );
  };

  const sideContent =
    screen === 'sender'
      ? sidePanel(
          '//POCZTA: WYBÓR',
          config.senderName?.question || 'Wybierz tożsamość nadawcy',
          renderOptionCards(config.senderName?.options || [], selectedSenderId, setSelectedSenderId),
          confirmButton('ZATWIERDŹ TOŻSAMOŚĆ NADAWCY', !!selectedSender, handleSenderConfirm)
        )
      : screen === 'email'
      ? sidePanel(
          '//POCZTA: WYBÓR',
          config.senderEmail?.question || 'Wybierz adres e-mail nadawcy',
          renderEmailButtons(config.senderEmail?.options || [], selectedEmailId, setSelectedEmailId),
          <div className="shrink-0 flex gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setSelectedEmailId(null);
                setScreen('sender');
              }}
              className="px-4 py-2.5 rounded font-bold text-xs uppercase tracking-wider text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>WRÓĆ</span>
            </button>
            <div className="flex-1">{confirmButton('ZATWIERDŹ ADRES EMAIL', !!selectedEmail, handleEmailConfirm)}</div>
          </div>
        )
      : screen === 'summary'
      ? progressPanel(
          '//POCZTA: GOTOWE',
          'Wyślij maila do Anity Klimek i obserwuj jej reakcję w aplikacji monitora.',
          <button
            onClick={() => {
              sounds.playSuccess();
              onComplete();
            }}
            className="w-full shrink-0 px-4 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95"
          >
            <Send size={15} />
            <span>WYŚLIJ MAILA</span>
          </button>
        )
      : // Ładowanie między ekranami: prawy monitor zostaje zajęty (bez czatu), ale pusty.
        <div className="h-full" />;

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <SideMonitor>{sideContent}</SideMonitor>

      {/* 1. SENDER IDENTITY SCREEN (D3) */}
      {screen === 'sender' && (
        <div className="flex flex-col h-full space-y-4">
          {header(
            '//POCZTA',
            'WYBÓR TOŻSAMOŚCI NADAWCY',
            config.senderName?.question || 'Wybierz tożsamość nadawcy',
            'KROK 1/2 (D3)'
          )}

          {/* Email Preview with dynamic sender */}
          <div className="animate-in fade-in duration-300">
            <EmailPreview
              senderName={selectedSender?.label || null}
              senderEmail={null}
              targetDomain={targetDomain}
              payloadName={targetPayload}
              step="sender"
            />
          </div>
        </div>
      )}

      {/* LOADER TO EMAIL */}
      {screen === 'load_email' && (
        <ModuleLoader
          label="ANALIZA ZABEZPIECZEŃ SPF/DKIM I WYBÓR ADRESU SPOOFINGOWEGO..."
          accent={accent}
          onComplete={() => setScreen('email')}
        />
      )}

      {/* 2. SENDER EMAIL SCREEN (D4) */}
      {screen === 'email' && (
        <div className="flex flex-col h-full space-y-4">
          {header(
            '//POCZTA',
            'WYBÓR ADRESU E-MAIL NADAWCY',
            config.senderEmail?.question || 'Wybierz adres e-mail nadawcy',
            'KROK 2/2 (D4)'
          )}

          {/* Email Preview with dynamic sender address */}
          <div className="animate-in fade-in duration-300">
            <EmailPreview
              senderName={selectedSender?.label || 'Jakub Kwiatkowski'}
              senderEmail={selectedEmail?.label || null}
              targetDomain={targetDomain}
              payloadName={targetPayload}
              step="email"
            />
          </div>
        </div>
      )}

      {/* 3. SUMMARY SCREEN */}
      {screen === 'summary' && (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in">
          {header('//POCZTA', 'PODSUMOWANIE KAMPANII', 'WIADOMOŚĆ JEST GOTOWA. WYŚLIJ MAILA I OBSERWUJ REAKCJĘ ANITY W MONITORZE OFIARY.', 'FINALIZACJA')}

          <div className="p-5 rounded-xl border border-gray-800 bg-[#08101a] space-y-4 shadow-xl">
            <div className="flex items-center space-x-2.5 text-purple-400">
              <Sparkles size={20} />
              <h3 className="text-sm font-bold tracking-wider">
                WIADOMOŚĆ SPEAR-PHISHINGOWA JEST W PEŁNI SKONFIGUROWANA
              </h3>
            </div>

            {/* Email Preview Card */}
            <div className="p-4 rounded-lg bg-black/60 border border-gray-800 space-y-2.5 font-sans">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                <span>
                  <strong>OD:</strong> {selectedSender?.label || 'Jakub Kwiatkowski'} &lt;
                  <span className="text-purple-400 font-mono">{selectedEmail?.label || 'k.kwiatkowski@petrolog.com'}</span>&gt;
                </span>
                <span>
                  <strong>DO:</strong> Anita Klimek &lt;a.klimek@petrolog.com&gt;
                </span>
              </div>
              <div className="text-xs text-gray-300">
                <strong>TEMAT:</strong> Zobacz to!
              </div>
              <div className="text-xs text-gray-200 leading-relaxed font-sans pt-1">
                Koniecznie musisz zobaczyć tę stronę:
                <br />
                <span className="text-sky-400 font-bold underline font-mono">
                  https://{targetDomain.toLowerCase()}
                </span>
                <br />
                Mają super {targetPayload.toLowerCase()}!
                <br />
                Coś, czego szukałaś!
                <br />
                <span className="text-gray-400 mt-2 block">{selectedSender?.label || 'Jakub Kwiatkowski'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
