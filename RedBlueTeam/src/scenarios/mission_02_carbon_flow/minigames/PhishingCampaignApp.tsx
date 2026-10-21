import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, FileText, Users, ShieldAlert, Sparkles, Database } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { PhishingCampaignConfig } from './types';

type Screen = 'action' | 'load_template' | 'template' | 'load_topic' | 'topic' | 'import_list';

export const PhishingCampaignApp: React.FC<BlockProps<PhishingCampaignConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';
  const blue = '#38bdf8';

  const [screen, setScreen] = useState<Screen>('action');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isImported, setIsImported] = useState(false);

  const selectedAction = config.action.options.find((o) => o.id === selectedActionId);
  const selectedTemplate = config.template.options.find((o) => o.id === selectedTemplateId);
  const selectedTopic = config.topic.options.find((o) => o.id === selectedTopicId);

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
          <p className="text-[11px]" style={{ color: blue }}>{sub}</p>
        </div>
      </div>
      <span
        className="text-[10px] px-2 py-0.5 rounded border font-mono"
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

  const handleFinish = () => {
    sounds.playSuccess();
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {screen === 'action' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//PHISHING // RODZAJ AKCJI', config.action.question, 'KROK 1/4')}
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
                    {opt.desc && <p className="text-[11px] text-gray-400 leading-relaxed">{opt.desc}</p>}
                  </div>
                  {opt.tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {opt.tags.map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-gray-300">
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
          label="Ładowanie bazy szablonów formularzy phishingowych..."
          durationMs={900}
          accent={blue}
          onDone={() => setScreen('template')}
        />
      )}

      {screen === 'template' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//PHISHING // SZABLON FORMULARZA', config.template.question, 'KROK 2/4')}
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
                    <div className="flex items-center space-x-2 text-cyan-400">
                      <FileText size={16} />
                      <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                    </div>
                    {opt.desc && <p className="text-[11px] text-gray-400 leading-relaxed">{opt.desc}</p>}
                  </div>
                  {opt.tags && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {opt.tags.map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-gray-300">
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
          label="Inicjalizacja modułu formularza..."
          durationMs={900}
          accent={blue}
          onDone={() => setScreen('topic')}
        />
      )}

      {screen === 'topic' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          {header('//PHISHING // TEMAT I PRZYNĘTA ANKIETY', config.topic.question, 'KROK 3/4')}
          <div className="space-y-2.5">
            {config.topic.options.map((opt) => {
              const isSelected = selectedTopicId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTopicId(opt.id);
                  }}
                  className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                      : 'border-gray-800 bg-[#08101a] hover:border-gray-700 hover:bg-[#0c1624]'
                  }`}
                  style={isSelected ? { borderColor: blue, backgroundColor: `${blue}26`, boxShadow: `0 0 20px ${blue}4d` } : undefined}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    {opt.desc && <p className="text-[11px] text-gray-400">{opt.desc}</p>}
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="text-[#38bdf8] shrink-0 ml-2" />}
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
          {header('//PHISHING // IMPORT ADRESATÓW & IP', 'Podpięcie bazy mailingowej od BYTE_MASTERA', 'KROK 4/4')}

          {!isImported ? (
            <div className="p-6 rounded-xl border border-dashed border-cyan-800/80 bg-[#081424] flex flex-col items-center justify-center text-center space-y-3 my-auto">
              <Database size={36} className="text-cyan-400 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Baza adresowa CarbonFlow Inc. gotowa do zaimportowania
                </h4>
                <p className="text-[11px] text-gray-400 max-w-md">
                  Paczka danych zawiera zweryfikowaną listę e-mail personelu oraz adresy IP dopuszczone na białej liście antyspamowej.
                </p>
              </div>
              <button
                onClick={handleImport}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs text-black hover:opacity-90 shadow-lg transition-all mt-2"
                style={{ backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` }}
              >
                <Users size={16} />
                <span>IMPORTUJ LISTĘ ADRESATÓW I IP</span>
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
                <span className="text-[10px] text-gray-400 font-mono">STATUS: UZBROJONE</span>
              </div>

              <div className="p-3 rounded-lg border border-gray-800 bg-black/40 space-y-2">
                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">
                  Przykładowi odbiorcy z bazy kontaktów:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                  {config.mailingList.sampleRecipients.map((r) => (
                    <div key={r.email} className="p-2 rounded bg-[#09111c] border border-gray-800 flex justify-between">
                      <span className="text-gray-300">{r.name} ({r.role})</span>
                      <span className="text-cyan-400">{r.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-purple-900/50 bg-purple-950/20 text-[11px] space-y-1">
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
              onClick={handleFinish}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all ${
                isImported
                  ? 'text-black hover:opacity-90'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={isImported ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}
            >
              <span>ZAPISZ KAMPANIĘ I PRZEJDŹ DO MASKOWANIA IP</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
