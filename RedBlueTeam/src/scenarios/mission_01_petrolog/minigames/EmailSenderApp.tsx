import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import { AppHeader } from '../../../engine/components/AppHeader';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => {
              sounds.playClick();
              onSelect(opt.id);
            }}
            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'scale-[1.01]'
                : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
            }`}
            style={
              isSelected
                ? {
                    borderColor: accent,
                    backgroundColor: `${accent}20`,
                    boxShadow: `0 0 20px ${accent}50`
                  }
                : undefined
            }
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-white leading-snug">{opt.label}</h3>
                {isSelected && <CheckCircle2 size={14} className="text-purple-400 shrink-0 ml-1" />}
              </div>
              {opt.desc && <p className="text-[11px] text-gray-300 leading-relaxed mb-2.5">{opt.desc}</p>}
            </div>

            <div>
              {showTags && opt.tags && opt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-1.5 text-[11px] pt-1.5 border-t border-gray-800">
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-purple-400 bg-purple-500' : 'border-gray-600'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
                <span style={{ color: isSelected ? accent : '#9ca3af' }}>
                  {isSelected ? 'WYBRANO' : 'KLIKNIJ ABY WYBRAĆ'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderEmailButtons = (
    options: ChoiceOption[] = [],
    selectedId: string | null,
    onSelect: (id: string) => void
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => {
              sounds.playClick();
              onSelect(opt.id);
            }}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between font-mono ${
              isSelected
                ? 'scale-[1.01] border-purple-400 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                  isSelected ? 'border-purple-400 bg-purple-500' : 'border-gray-600'
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <span className="text-xs font-bold text-white tracking-wider truncate">
                {opt.label}
              </span>
            </div>
            {isSelected && <CheckCircle2 size={16} className="text-purple-400 shrink-0 ml-2" />}
          </div>
        );
      })}
    </div>
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

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* 1. SENDER IDENTITY SCREEN (D3) */}
      {screen === 'sender' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header(
            '//POCZTA',
            'WYBÓR TOŻSAMOŚCI NADAWCY',
            config.senderName?.question || 'Wybierz tożsamość nadawcy',
            'KROK 1/2 (D3)'
          )}
          {renderOptionCards(config.senderName?.options || [], selectedSenderId, setSelectedSenderId)}

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

          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              onClick={handleSenderConfirm}
              disabled={!selectedSender}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: accent,
                color: '#05090f',
                boxShadow: selectedSender ? `0 0 15px ${accent}66` : undefined
              }}
            >
              <span>ZATWIERDŹ TOŻSAMOŚĆ NADAWCY</span>
              <ArrowRight size={15} />
            </button>
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
        <div className="flex flex-col justify-between h-full space-y-4">
          {header(
            '//POCZTA',
            'WYBÓR ADRESU E-MAIL NADAWCY',
            config.senderEmail?.question || 'Wybierz adres e-mail nadawcy',
            'KROK 2/2 (D4)'
          )}
          {renderEmailButtons(config.senderEmail?.options || [], selectedEmailId, setSelectedEmailId)}

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

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
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

            <button
              onClick={handleEmailConfirm}
              disabled={!selectedEmail}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: accent,
                color: '#05090f',
                boxShadow: selectedEmail ? `0 0 15px ${accent}66` : undefined
              }}
            >
              <span>ZATWIERDŹ ADRES EMAIL</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 3. SUMMARY SCREEN */}
      {screen === 'summary' && (
        <div className="flex flex-col justify-between h-full space-y-4 animate-in fade-in">
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

            {/* Attack components summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block font-mono">DOMENA PUŁAPKI</span>
                <span className="font-bold text-sky-400 truncate block">{targetDomain}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block font-mono">PRZYNĘTA (PAYLOAD)</span>
                <span className="font-bold text-sky-400 truncate block">{targetPayload}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block font-mono">PODSZYTY NADAWCA</span>
                <span className="font-bold text-purple-400 truncate block">{selectedSender?.label}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block font-mono">SPOOFING EMAIL</span>
                <span className="font-bold text-purple-400 font-mono text-[11px] truncate block">{selectedEmail?.label}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Wyślij maila do Anity Klimek i obserwuj jej reakcję w aplikacji monitora.
            </span>
            <button
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95"
            >
              <Send size={15} />
              <span>WYŚLIJ MAILA I PRZEJDŹ DO MONITORA OFIARY</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
