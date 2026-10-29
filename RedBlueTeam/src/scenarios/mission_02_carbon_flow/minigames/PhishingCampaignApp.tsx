import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Users, ShieldAlert, Send, AtSign, ExternalLink } from 'lucide-react';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { PhishingCampaignConfig } from './types';

type Screen =
  | 'action'
  | 'load_template'
  | 'template'
  | 'load_topic'
  | 'topic'
  | 'import_list'
  | 'sender_select'
  | 'preview'
  | 'dispatching'
  | 'sent';

export const PhishingCampaignApp: React.FC<BlockProps<PhishingCampaignConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const blue = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('action');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(null);
  const [isImported, setIsImported] = useState(false);

  const selectedAction = config.action.options.find((o) => o.id === selectedActionId);
  const selectedTemplate = config.template.options.find((o) => o.id === selectedTemplateId);
  const selectedTopic = config.topic.options.find((o) => o.id === selectedTopicId);
  const selectedSender = config.sender?.options.find((o) => o.id === selectedSenderId);

  const header = (title: string, sub: string, step: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${blue}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div
          className="p-1.5 rounded border"
          style={{ backgroundColor: `${blue}26`, borderColor: blue, color: blue }}
        >
          <Mail size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">{title}</h2>
          <p className="text-[0.6875rem]" style={{ color: blue }}>{sub}</p>
        </div>
      </div>
      <span
        className="text-[0.625rem] px-2 py-0.5 rounded border font-mono"
        style={{ backgroundColor: `${blue}1a`, borderColor: `${blue}66`, color: blue }}
      >
        {step}
      </span>
    </div>
  );

  const handleActionConfirm = () => {
    if (!selectedAction) return;
    sounds.playSuccess();
    onDecision({
      num: config.action.decisionNum,
      question: config.action.question,
      answer: selectedAction.label,
      tier: selectedAction.tier,
      feedback: selectedAction.feedback
    });
    if (selectedAction.tier !== 'critical') {
      setScreen('load_template');
    }
  };

  const handleTemplateConfirm = () => {
    if (!selectedTemplate) return;
    sounds.playSuccess();
    onDecision({
      num: config.template.decisionNum,
      question: config.template.question,
      answer: selectedTemplate.label,
      tier: selectedTemplate.tier,
      feedback: selectedTemplate.feedback
    });
    if (selectedTemplate.tier !== 'critical') {
      setScreen('load_topic');
    }
  };

  const handleTopicConfirm = () => {
    if (!selectedTopic) return;
    sounds.playSuccess();
    onDecision({
      num: config.topic.decisionNum,
      question: config.topic.question,
      answer: selectedTopic.label,
      tier: selectedTopic.tier,
      feedback: selectedTopic.feedback
    });
    if (selectedTopic.tier !== 'critical') {
      setScreen('import_list');
    }
  };

  const handleImport = () => {
    sounds.playSuccess();
    setIsImported(true);
  };

  const handleSenderConfirm = () => {
    if (!selectedSender || !config.sender) return;
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

  const getEmailContent = () => {
    let body =
      'Przypominamy o konieczności wypełnienia corocznej, obowiązkowej ankiety dotyczącej organizacji firmowego wyjazdu integracyjnego CarbonFlow Inc.';
    let slug = 'carbonflow-integracja-2026';
    if (selectedTopicId === 'fire_drill') {
      body =
        'Prosimy wszystkich pracowników o pilne wypełnienie ankiety weryfikującej znajomość procedur ewakuacyjnych i przeciwpożarowych w CarbonFlow Inc.';
      slug = 'carbonflow-cwiczenia-pozarnicze-2026';
    } else if (selectedTopicId === 'fruit_thursday') {
      body =
        'Zapraszamy do udziału w krótkim plebiscycie pracowników na temat preferowanego asortymentu w ramach akcji Owocowe Czwartki w CarbonFlow Inc.';
      slug = 'carbonflow-owocowy-czwartek-2026';
    }

    let serviceName = 'Poodle Forms';
    let domainHost = 'poodleforms.net';
    if (selectedTemplateId === 'quickgram') {
      serviceName = 'Quickgram';
      domainHost = 'quickgram.social';
    } else if (selectedTemplateId === 'kneenook') {
      serviceName = 'Kneenook';
      domainHost = 'kneenook.forum';
    }

    let signoff = 'Dział Kadr i Płac CarbonFlow Inc.';
    if (selectedSenderId === 'marketing_carbon') {
      signoff = 'Dział Marketingu CarbonFlow Inc.';
    } else if (selectedSenderId === 'catering_oilflow') {
      signoff = 'Obsługa Gastronomiczna OilFlow Catering';
    }

    return {
      body,
      link: `https://${domainHost}/surveys/${slug}?token=0day_worm`,
      serviceName,
      signoff
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {screen === 'action' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_PHISHINGU // RODZAJ AKCJI', config.action.question, 'KROK 1/5')}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {config.action.options.map((opt) => {
              const isSelected = selectedActionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedActionId(opt.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                      : 'border-gray-800 bg-[#08101a] hover:border-gray-700 hover:bg-[#0c1624]'
                  }`}
                  style={isSelected ? { borderColor: blue, backgroundColor: `${blue}26`, boxShadow: `0 0 20px ${blue}4d` } : undefined}
                >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{opt.label}</h4>
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
              disabled={!selectedAction}
              onClick={handleActionConfirm}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                selectedAction
                  ? 'text-black hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={selectedAction ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}
            >
              <span>ZATWIERDŹ RODZAJ AKCJI</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'load_template' && (
        <ModuleLoader
          label="Pobieranie bazy szablonów formularzy..."
          durationMs={900}
          accent={blue}
          onDone={() => setScreen('template')}
        />
      )}

      {screen === 'template' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_PHISHINGU // SZABLON FORMULARZA', config.template.question, 'KROK 2/5')}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {config.template.options.map((opt) => {
              const isSelected = selectedTemplateId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTemplateId(opt.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                      : 'border-gray-800 bg-[#08101a] hover:border-gray-700 hover:bg-[#0c1624]'
                  }`}
                  style={isSelected ? { borderColor: blue, backgroundColor: `${blue}26`, boxShadow: `0 0 20px ${blue}4d` } : undefined}
                >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{opt.label}</h4>
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
              disabled={!selectedTemplate}
              onClick={handleTemplateConfirm}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                selectedTemplate
                  ? 'text-black hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={selectedTemplate ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}
            >
              <span>ZATWIERDŹ SZABLON</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'load_topic' && (
        <ModuleLoader
          label="Konfigurowanie przynęty socjotechnicznej..."
          durationMs={900}
          accent={blue}
          onDone={() => setScreen('topic')}
        />
      )}

      {screen === 'topic' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_PHISHINGU // TEMAT I PRZYNĘTA', config.topic.question, 'KROK 3/5')}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {config.topic.options.map((opt) => {
              const isSelected = selectedTopicId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTopicId(opt.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                      : 'border-gray-800 bg-[#08101a] hover:border-gray-700 hover:bg-[#0c1624]'
                  }`}
                  style={isSelected ? { borderColor: blue, backgroundColor: `${blue}26`, boxShadow: `0 0 20px ${blue}4d` } : undefined}
                >
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{opt.label}</h4>
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
              disabled={!selectedTopic}
              onClick={handleTopicConfirm}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                selectedTopic
                  ? 'text-black hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={selectedTopic ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}
            >
              <span>ZATWIERDŹ TEMAT ANKIETY</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'import_list' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_PHISHINGU // IMPORT BAZY ODBIORCÓW', 'Baza mailingowa pracowników CarbonFlow Inc.', 'KROK 4/5')}

          {!isImported ? (
            <div className="p-6 rounded-xl border border-gray-800 bg-[#08101a] space-y-3 text-center my-auto">
              <Users size={32} className="mx-auto" style={{ color: blue }} />
              <h3 className="text-sm font-bold text-white">LISTA PRACOWNIKÓW CARBONFLOW INC.</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Lista mailingowa zawiera {config.mailingList.employeesCount} zweryfikowanych adresów pracowników w domenie {config.mailingList.targetDomain}.
                Załaduj bazę do kreatora, aby zaadresować kampanię.
              </p>
              <button
                onClick={handleImport}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs text-black hover:opacity-90 shadow-lg transition-all mx-auto mt-2"
                style={{ backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` }}
              >
                <Users size={16} />
                <span>IMPORTUJ LISTĘ ADRESATÓW</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                className="p-3.5 rounded-xl border flex items-center justify-between"
                style={{ borderColor: `${blue}66`, backgroundColor: `${blue}1a` }}
              >
                <div className="flex items-center space-x-2" style={{ color: blue }}>
                  <CheckCircle2 size={18} />
                  <span className="text-xs font-bold">ZAŁADOWANO BAZĘ: {config.mailingList.targetDomain} ({config.mailingList.employeesCount} REKORDÓW)</span>
                </div>
                <span className="text-[0.625rem] text-gray-400 font-mono">STATUS: UZBROJONE</span>
              </div>

              <div className="p-3 rounded-lg border border-gray-800 bg-black/40 space-y-2">
                <div className="text-[0.6875rem] font-bold text-gray-300 uppercase tracking-wide">
                  Przykładowi odbiorcy z bazy kontaktów:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[0.625rem] font-mono">
                  {config.mailingList.sampleRecipients.map((r) => (
                    <div key={r.email} className="p-2 rounded bg-[#09111c] border border-gray-800 flex justify-between">
                      <span className="text-gray-300">{r.name} ({r.role})</span>
                      <span className="text-cyan-400">{r.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-purple-900/50 bg-purple-950/20 text-[0.6875rem] space-y-1">
                <div className="font-bold text-purple-300 flex items-center space-x-1.5">
                  <ShieldAlert size={14} />
                  <span>BIAŁA LISTA NADAWCÓW (ALLOWLISTA IP CARBONFLOW):</span>
                </div>
                <div className="flex gap-2 font-mono text-purple-200">
                  {config.mailingList.whitelistedIps.map((ip) => (
                    <span key={ip} className="px-2 py-0.5 rounded bg-black/50 border border-purple-800/60">
                      {ip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              disabled={!isImported}
              onClick={() => {
                if (config.sender && config.sender.options.length > 0) {
                  setScreen('sender_select');
                } else {
                  onComplete();
                }
              }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                isImported
                  ? 'text-black hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={isImported ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}
            >
              <span>PRZEJDŹ DO WYBORU ADRESU NADAWCY</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'sender_select' && config.sender && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//KREATOR_PHISHINGU // ADRES NADAWCY', config.sender.question, 'KROK 5/5')}

          <div className="space-y-1">
            <p className="text-[0.6875rem] text-gray-400">
              Wybierz adres e-mail, pod który podszyjesz się w nagłówku wiadomości. Domena powinna jak najbardziej przypominać prawdziwą domenę @carbonflow.com (technika typosquattingu).
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
              <span>ZATWIERDŹ NADAWCĘ I PODGLĄD</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {screen === 'preview' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${blue}4d` }}>
            <div className="flex items-center space-x-2.5">
              <div
                className="p-1.5 rounded border"
                style={{ backgroundColor: `${blue}26`, borderColor: blue, color: blue }}
              >
                <Send size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-widest">//KREATOR_PHISHINGU // PODGLĄD I WYSYŁKA</h2>
                <p className="text-[0.6875rem]" style={{ color: blue }}>
                  Przegląd zmontowanej kampanii przed rozesłaniem
                </p>
              </div>
            </div>
            <span
              className="text-[0.625rem] px-2 py-0.5 rounded border font-mono"
              style={{ backgroundColor: `${blue}1a`, borderColor: `${blue}66`, color: blue }}
            >
              FINALIZACJA
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">NADAWCA:</span>
                  <span className="font-mono text-cyan-400 font-bold">{selectedSender?.label || 'KADRY@CARDONFLOW.COM'}</span>
                </div>
                <div className="text-[0.6875rem] text-gray-400 font-mono">
                  DO: <span className="text-white">pracownicy@carbonflow.com (12 odbiorców)</span>
                </div>
              </div>

              <div className="text-xs pt-1">
                <span className="text-gray-400">TEMAT: </span>
                <span className="text-white font-bold">{selectedTopic?.label || 'OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO'}</span>
              </div>
            </div>

            {(() => {
              const previewData = getEmailContent();
              return (
                <div className="p-4 rounded-xl border border-gray-800 bg-black/60 space-y-3 text-xs leading-relaxed text-gray-300">
                  <p>Dzień dobry,</p>
                  <p>{previewData.body}</p>
                  <p>
                    Czas na wypełnienie formularza upływa dzisiaj o godzinie 16:00. Link do formularza w serwisie {previewData.serviceName}:
                  </p>
                  <div className="p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-cyan-300 font-mono text-[0.6875rem] truncate max-w-[80%]">
                      <ExternalLink size={14} className="shrink-0" />
                      <span className="truncate">{previewData.link}</span>
                    </div>
                    <span className="text-[0.5625rem] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono shrink-0">
                      ŁADUNEK WSTRZYKNIĘTY
                    </span>
                  </div>
                  <p className="text-[0.6875rem] text-gray-400 pt-2">
                    Z poważaniem,<br />
                    {previewData.signoff}
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSendCampaign}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-xs text-black hover:opacity-90 shadow-lg transition-all cursor-pointer"
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
          onDone={() => {
            setScreen('sent');
            onComplete();
          }}
        />
      )}

      {screen === 'sent' && (
        <div className="flex flex-col justify-between h-full space-y-4 my-auto">
          <div className="p-6 rounded-xl border border-cyan-500/50 bg-[#081524] space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 mx-auto flex items-center justify-center text-cyan-400">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              KAMPANIA PHISHINGOWA ZOSTAŁA WYSŁANA
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              Pakiety SMTP zostały pomyślnie dostarczone do skrzynek 12 pracowników w domenie carbonflow.com. Oczekujemy na otworzenie załącznika i aktywację robaka w sieci LAN.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg transition-all cursor-pointer"
            >
              <span>POWRÓT DO PULPITU</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
