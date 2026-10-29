import React, { useState } from 'react';
import { Send, AtSign, ArrowRight, ExternalLink } from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { PhishingDispatchConfig } from './types';

type Screen = 'sender_select' | 'preview' | 'dispatching';

export const PhishingDispatchApp: React.FC<BlockProps<PhishingDispatchConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const blue = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('sender_select');
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);

  const selectedSender = config.sender.options.find((o) => o.id === selectedSenderId);

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

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${blue}4d` }}>
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded border"
            style={{ backgroundColor: `${blue}26`, borderColor: blue, color: blue }}
          >
            <Send size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//PHISHING // WYSYŁKA KAMPANII</h2>
            <p className="text-[0.6875rem]" style={{ color: blue }}>
              Dobór fałszywej domeny (typosquatting) oraz egzekucja wysyłki
            </p>
          </div>
        </div>
        <span
          className="text-[0.625rem] px-2 py-0.5 rounded border font-mono"
          style={{ backgroundColor: `${blue}1a`, borderColor: `${blue}66`, color: blue }}
        >
          {screen === 'sender_select' ? 'KROK 1/2' : 'KROK 2/2'}
        </span>
      </div>

      {screen === 'sender_select' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              {config.sender.question}
            </h3>
            <p className="text-[0.6875rem] text-gray-400">
              Wybierz adres e-mail, pod który podszyjesz się w nagłówku wiadomości. Domena powinna jak najbardziej przypominać prawdziwą domenę @carbonflow.com.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {config.sender.options.map((opt) => {
              const isSelected = selectedSenderId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedSenderId(opt.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                      : 'border-gray-800 bg-[#08101a] hover:border-gray-700 hover:bg-[#0c1624]'
                  }`}
                  style={isSelected ? { borderColor: blue, backgroundColor: `${blue}26`, boxShadow: `0 0 20px ${blue}4d` } : undefined}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <AtSign size={16} />
                      <h4 className="text-xs font-bold text-white font-mono">{opt.label}</h4>
                    </div>
                    {opt.desc && <p className="text-[0.6875rem] text-gray-400 leading-relaxed">{opt.desc}</p>}
                  </div>
                  {opt.tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {opt.tags.map((t) => (
                        <span key={t} className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-black/60 text-gray-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={!selectedSender}
              onClick={handleSenderConfirm}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                selectedSender
                  ? 'text-black hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={selectedSender ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}
            >
              <span>ZATWIERDŹ NADAWCĘ</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'preview' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">NADAWCA:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedSender?.label}</span>
                </div>
                <div className="text-[0.6875rem] text-gray-400 font-mono">
                  DO: <span className="text-white">pracownicy@carbonflow.com (12 odbiorców)</span>
                </div>
              </div>

              <div className="text-xs pt-1">
                <span className="text-gray-400">TEMAT: </span>
                <span className="text-white font-bold">{config.surveyTitle}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-800 bg-black/60 space-y-3 text-xs leading-relaxed text-gray-300">
              <p>Dzień dobry,</p>
              <p>
                Przypominamy o konieczności wypełnienia corocznej, obowiązkowej ankiety dotyczącej organizacji
                firmowego wyjazdu integracyjnego CarbonFlow Inc.
              </p>
              <p>
                Czas na wypełnienie formularza upływa dzisiaj o godzinie 16:00. Link do formularza w bezpiecznym serwisie Poodle Forms:
              </p>
              <div className="p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/30 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-cyan-300 font-mono text-[0.6875rem]">
                  <ExternalLink size={14} />
                  <span>https://poodleforms.net/surveys/carbonflow-integracja-2026?token=0day_worm</span>
                </div>
                <span className="text-[0.5625rem] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  ŁADUNEK WSTRZYKNIĘTY
                </span>
              </div>
              <p className="text-[0.6875rem] text-gray-400 pt-2">
                Z poważaniem,<br />
                Dział Kadr i Płac CarbonFlow Inc.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSendCampaign}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-xs text-black hover:opacity-90 shadow-lg transition-all"
              style={{ backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` }}
            >
              <Send size={16} />
              <span>WYŚLIJ KAMPANIĘ PHISHINGOWĄ</span>
            </button>
          </div>
        </div>
      )}

      {screen === 'dispatching' && (
        <ModuleLoader
          label="Rozsyłanie pakietów SMTP przez tunel VPN do serwera CarbonFlow Inc..."
          durationMs={1300}
          accent={blue}
          onDone={onComplete}
        />
      )}
    </div>
  );
};
