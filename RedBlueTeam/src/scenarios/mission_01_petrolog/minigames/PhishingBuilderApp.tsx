import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  Globe,
  FileText,
  Bug,
  Sparkles,
  Send,
  Download,
} from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps, ChoiceOption } from '../../../engine/types/mission';
import type { PhishingBuilderConfig } from './types';

type BuilderScreen =
  | 'domain'
  | 'load_payload'
  | 'payload'
  | 'load_injection'
  | 'injection'
  | 'load_sender'
  | 'sender'
  | 'load_email'
  | 'email'
  | 'summary';

export const PhishingBuilderApp: React.FC<BlockProps<PhishingBuilderConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const pink = '#ec4899';

  const [screen, setScreen] = useState<BuilderScreen>('domain');
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [selectedPayloadId, setSelectedPayloadId] = useState<string | null>(null);
  const [isPayloadInjected, setIsPayloadInjected] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const selectedDomain = config.domain.options.find((o) => o.id === selectedDomainId);
  const selectedPayload = config.payload.options.find((o) => o.id === selectedPayloadId);
  const selectedSender = config.senderName.options.find((o) => o.id === selectedSenderId);
  const selectedEmail = config.senderEmail.options.find((o) => o.id === selectedEmailId);

  const header = (title: string, sub: string, step: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${pink}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div
          className="p-1.5 rounded border"
          style={{ backgroundColor: `${pink}26`, borderColor: pink, color: pink }}
        >
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">{title}</h2>
          <p className="text-[11px]" style={{ color: pink }}>{sub}</p>
        </div>
      </div>
      <span
        className="text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider font-bold"
        style={{ backgroundColor: `${pink}1a`, borderColor: `${pink}66`, color: pink }}
      >
        {step}
      </span>
    </div>
  );

  const renderOptionCards = (
    options: ChoiceOption[],
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
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'scale-[1.01]'
                : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
            }`}
            style={
              isSelected
                ? {
                    borderColor: pink,
                    backgroundColor: `${pink}20`,
                    boxShadow: `0 0 20px ${pink}50`
                  }
                : undefined
            }
          >
            <div>
              <h3 className="text-xs font-bold text-white mb-2 leading-snug">{opt.label}</h3>
              {opt.desc && <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{opt.desc}</p>}
            </div>

            <div>
              {opt.tags && opt.tags.length > 0 && (
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
              <div className="flex items-center space-x-1.5 text-[11px] pt-2 border-t border-gray-800">
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-pink-400 bg-pink-500' : 'border-gray-600'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
                <span style={{ color: isSelected ? pink : '#9ca3af' }}>
                  {isSelected ? 'WYBRANO' : 'KLIKNIJ ABY WYBRAĆ'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const handleDomainConfirm = () => {
    if (!selectedDomain) return;
    sounds.playSuccess();
    onDecision({
      num: config.domain.decisionNum,
      question: config.domain.question,
      answer: selectedDomain.label,
      tier: selectedDomain.tier,
      feedback: selectedDomain.feedback
    });
    if (selectedDomain.tier !== 'critical') {
      setScreen('load_payload');
    }
  };

  const handlePayloadConfirm = () => {
    if (!selectedPayload) return;
    sounds.playSuccess();
    onDecision({
      num: config.payload.decisionNum,
      question: config.payload.question,
      answer: selectedPayload.label,
      tier: selectedPayload.tier,
      feedback: selectedPayload.feedback
    });
    if (selectedPayload.tier !== 'critical') {
      setScreen('load_injection');
    }
  };

  const handleInjectPayload = () => {
    sounds.playSuccess();
    setIsPayloadInjected(true);
  };

  const handleSenderConfirm = () => {
    if (!selectedSender) return;
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
    if (!selectedEmail) return;
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
      {/* 1. DOMAIN SCREEN (D1) */}
      {screen === 'domain' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR // WYBÓR DOMENY STRONY-PUŁAPKI', config.domain.question, 'KROK 1/5 (D1)')}
          {renderOptionCards(config.domain.options, selectedDomainId, setSelectedDomainId)}
          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              onClick={handleDomainConfirm}
              disabled={!selectedDomain}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: pink,
                color: '#05090f',
                boxShadow: selectedDomain ? `0 0 15px ${pink}66` : undefined
              }}
            >
              <span>ZATWIERDŹ DOMENĘ</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* LOADER TO PAYLOAD */}
      {screen === 'load_payload' && (
        <ModuleLoader
          label="REZERWOWANIE DOMENY I KONFIGURACJA STRONY INTERNETOWEJ..."
          accent={pink}
          onComplete={() => setScreen('payload')}
        />
      )}

      {/* 2. PAYLOAD SCREEN (D2) */}
      {screen === 'payload' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR // WYBÓR PRZYNĘTY (PAYLOAD)', config.payload.question, 'KROK 2/5 (D2)')}
          {renderOptionCards(config.payload.options, selectedPayloadId, setSelectedPayloadId)}
          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              onClick={handlePayloadConfirm}
              disabled={!selectedPayload}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: pink,
                color: '#05090f',
                boxShadow: selectedPayload ? `0 0 15px ${pink}66` : undefined
              }}
            >
              <span>ZATWIERDŹ PLIK PRZYNĘTĘ</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* LOADER TO INJECTION */}
      {screen === 'load_injection' && (
        <ModuleLoader
          label="KOMPILOWANIE MODUŁU ROZPRZESTRZENIANIA WIRUSA..."
          accent={pink}
          onComplete={() => setScreen('injection')}
        />
      )}

      {/* 3. INJECTION SCREEN (Flavor) */}
      {screen === 'injection' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR // WSTRZYKNIĘCIE WIRUSA', 'ZAWIRUSUJ PLIK – DODAJ WIRUSA DO STRONY INTERNETOWEJ', 'KROK 3/5')}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left: Payload tile to drag/click */}
            <div className="md:col-span-4 p-4 rounded-xl border border-gray-800 bg-[#08101a] space-y-3">
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase block">
                DOSTĘPNY MODUŁ MALWARE:
              </span>
              <div
                draggable={!isPayloadInjected}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'malware-payload');
                  e.dataTransfer.effectAllowed = 'copyMove';
                }}
                onClick={handleInjectPayload}
                className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                  isPayloadInjected
                    ? 'border-gray-700 bg-gray-900/60 opacity-60 cursor-default'
                    : 'border-[#00ff66] bg-[#00ff66]/15 hover:bg-[#00ff66]/25 shadow-[0_0_20px_rgba(0,255,102,0.3)] animate-pulse cursor-grab active:cursor-grabbing'
                }`}
              >
                <div className="p-2 rounded bg-[#00ff66]/20 text-[#00ff66]">
                  <Bug size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">//PRZEKIEROWANIE</h4>
                  <p className="text-[10px] text-emerald-300">
                    {isPayloadInjected ? 'ZAINSTALOWANO WIRUSA ✓' : 'KLIKNIJ LUB PRZECIĄGNIJ'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Przeciągnij kafelek lub kliknij go, aby wstrzyknąć złośliwy skrypt do przycisku pobierania poradnika.
              </p>
            </div>

            {/* Right: Mockup of the Landing Page */}
            <div className="md:col-span-8 p-4 rounded-xl border border-gray-800 bg-black/50 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-xs">
                <div className="flex items-center space-x-2 text-sky-400">
                  <Globe size={14} />
                  <span className="font-bold">
                    https://{selectedDomain?.label.toLowerCase() || 'dalekbieg.info'}/download
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">CERTYFIKAT SSL: AKTYWNY</span>
              </div>

              {/* Page Content Mockup */}
              <div className="p-4 rounded-lg bg-[#060c14] border border-gray-800 space-y-3 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FileText size={24} />
                </div>
                <h3 className="text-sm font-bold text-white max-w-md mx-auto">
                  {selectedPayload?.label || 'PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH'}
                </h3>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Profesjonalne wskazówki dotyczące przygotowania do biegów długodystansowych, plan treningowy i porady żywieniowe.
                </p>

                {/* Target Download Button */}
                <div
                  onDragOver={(e) => {
                    if (!isPayloadInjected) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      setIsDragOver(true);
                    }
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleInjectPayload();
                  }}
                  className={`pt-2 transition-transform duration-200 ${isDragOver ? 'scale-105' : ''}`}
                >
                  <button
                    onClick={handleInjectPayload}
                    className={`px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 mx-auto cursor-pointer border ${
                      isPayloadInjected
                        ? 'bg-emerald-500 text-[#05090f] border-emerald-400 shadow-[0_0_20px_#00ff66]'
                        : isDragOver
                        ? 'bg-[#00ff66]/30 text-[#00ff66] border-2 border-[#00ff66] shadow-[0_0_30px_#00ff66] animate-pulse'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-dashed border-gray-600'
                    }`}
                  >
                    <Download size={16} />
                    <span>
                      {isPayloadInjected
                        ? 'POBIERZ (ZAINFEKOWANY // EXPLOIT)'
                        : isDragOver
                        ? 'UPUŚĆ TUTAJ, ABY WSTRZYKNĄĆ!'
                        : '[ POBIERZ PORADNIK ] – KLIKNIJ LUB UPUŚĆ'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {isPayloadInjected
                ? '✓ ZAINSTALOWANO WIRUSA W PRZYCISKU STRONY'
                : 'Przeciągnij kafelek //PRZEKIEROWANIE lub kliknij przycisk Pobierz, aby zaimplementować exploit.'}
            </span>
            <button
              onClick={() => {
                sounds.playSuccess();
                setScreen('load_sender');
              }}
              disabled={!isPayloadInjected}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: pink,
                color: '#05090f',
                boxShadow: isPayloadInjected ? `0 0 15px ${pink}66` : undefined
              }}
            >
              <span>PRZEJDŹ DALEJ</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* LOADER TO SENDER */}
      {screen === 'load_sender' && (
        <ModuleLoader
          label="PODŁĄCZANIE SYSTEMU SPOOFINGU TOŻSAMOŚCI..."
          accent={pink}
          onComplete={() => setScreen('sender')}
        />
      )}

      {/* 4. SENDER IDENTITY SCREEN (D3) */}
      {screen === 'sender' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR // WYBÓR TOŻSAMOŚCI NADAWCY', config.senderName.question, 'KROK 4/5 (D3)')}
          {renderOptionCards(config.senderName.options, selectedSenderId, setSelectedSenderId)}
          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              onClick={handleSenderConfirm}
              disabled={!selectedSender}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: pink,
                color: '#05090f',
                boxShadow: selectedSender ? `0 0 15px ${pink}66` : undefined
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
          accent={pink}
          onComplete={() => setScreen('email')}
        />
      )}

      {/* 5. SENDER EMAIL SCREEN (D4) */}
      {screen === 'email' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR // WYBÓR ADRESU E-MAIL NADAWCY', config.senderEmail.question, 'KROK 5/5 (D4)')}
          {renderOptionCards(config.senderEmail.options, selectedEmailId, setSelectedEmailId)}
          <div className="pt-3 border-t border-gray-800 flex justify-end">
            <button
              onClick={handleEmailConfirm}
              disabled={!selectedEmail}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
              style={{
                backgroundColor: pink,
                color: '#05090f',
                boxShadow: selectedEmail ? `0 0 15px ${pink}66` : undefined
              }}
            >
              <span>ZATWIERDŹ ADRES EMAIL</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 6. SUMMARY SCREEN */}
      {screen === 'summary' && (
        <div className="flex flex-col justify-between h-full space-y-4 animate-in fade-in">
          {header('//KREATOR // PODSUMOWANIE KAMPANII', 'GOTOWA WIADOMOŚĆ SPEAR-PHISHINGOWA', 'FINALIZACJA')}

          <div className="p-5 rounded-xl border border-gray-800 bg-[#08101a] space-y-4 shadow-xl">
            <div className="flex items-center space-x-2.5 text-[#00ff66]">
              <Sparkles size={20} />
              <h3 className="text-sm font-bold tracking-wider">
                ŚWIETNIE! KAMPANIA SPEAR-PHISHINGOWA JEST W PEŁNI SKONFIGUROWANA
              </h3>
            </div>

            {/* Email Preview Card */}
            <div className="p-4 rounded-lg bg-black/60 border border-gray-800 space-y-2.5 font-sans">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                <span>
                  <strong>OD:</strong> {selectedSender?.label || 'Jakub Kwiatkowski'} &lt;
                  <span className="text-pink-400 font-mono">{selectedEmail?.label || 'k.kwiatkowski@petrolog.com'}</span>&gt;
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
                  {selectedDomain?.label || 'dalekbieg.info'}
                </span>
                <br />
                Mają super poradnik dla biegaczy długodystansowych!
                <br />
                Coś, czego szukałaś!
                <br />
                <span className="text-gray-400 mt-2 block">{selectedSender?.label || 'Jakub Kwiatkowski'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block">DOMENA PUŁAPKI</span>
                <span className="font-bold text-pink-400">{selectedDomain?.label}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block">PRZYNĘTA</span>
                <span className="font-bold text-emerald-400 truncate block">{selectedPayload?.label}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block">PODSZYTY NADAWCA</span>
                <span className="font-bold text-sky-400">{selectedSender?.label}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-gray-800">
                <span className="text-[10px] text-gray-400 block">SPOOFING EMAIL</span>
                <span className="font-bold text-amber-400 font-mono text-[11px]">{selectedEmail?.label}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Wyślij maila i obserwuj działania ofiary w aplikacji monitora.
            </span>
            <button
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-[#00ff66] text-[#05090f] hover:bg-[#00ff66]/90 transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.4)] active:scale-95"
            >
              <Send size={15} />
              <span>WYŚLIJ MAILA I ZOBACZ, CO ROBI OFIARA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
