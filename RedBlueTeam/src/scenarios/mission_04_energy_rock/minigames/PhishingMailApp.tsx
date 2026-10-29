import React, { useState } from 'react';
import { Mail, Paperclip, CheckCircle2, ArrowRight, AtSign, Lock } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { MailConfig } from './types';

type Screen = 'subject' | 'body' | 'load_arm' | 'arm';

/**
 * D5–D6 — spear-phishing jako sekwencja ekranów: temat → treść → loader →
 * uzbrojenie załącznika (flavor) → onComplete.
 */
export const PhishingMailApp: React.FC<BlockProps<MailConfig>> = ({ config, onDecision, onComplete }) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#38bdf8';
  const blue = '#38bdf8';
  const [screen, setScreen] = useState<Screen>('subject');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [bodyId, setBodyId] = useState<string | null>(null);

  const subject = config.subject.options.find((o) => o.id === subjectId);
  const body = config.body.options.find((o) => o.id === bodyId);

  const header = (sub: string, step: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${blue}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded border" style={{ backgroundColor: `${blue}33`, borderColor: blue, color: blue }}><Mail size={20} /></div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">//MAIL_CLIENT // KAMPANIA SPEAR-PHISHINGOWA</h2>
          <p className="text-[0.6875rem]" style={{ color: blue }}>{sub}</p>
        </div>
      </div>
      <span className="text-[0.625rem] px-2 py-0.5 rounded border" style={{ backgroundColor: `${blue}26`, borderColor: `${blue}80`, color: '#7dd3fc' }}>{step}</span>
    </div>
  );

  const recipientBanner = (
    <div className="p-3 rounded-xl bg-[#081524] border flex items-center justify-between text-xs" style={{ borderColor: `${blue}4d` }}>
      <div className="flex items-center space-x-2" style={{ color: '#7dd3fc' }}>
        <AtSign size={16} /><span className="font-bold">ADRESAT:</span><span className="text-white font-mono">{config.recipient}</span>
      </div>
      <span className="text-[0.6875rem] text-gray-400">STANOWISKO: <strong className="text-white">{config.position}</strong></span>
    </div>
  );

  const handleSubject = () => {
    if (!subject) return;
    sounds.playSuccess();
    onDecision({ num: config.subject.decisionNum, question: config.subject.question, answer: subject.label, tier: subject.tier, feedback: subject.feedback });
    if (subject.tier !== 'critical') setScreen('body');
  };

  const handleBody = () => {
    if (!body) return;
    sounds.playSuccess();
    onDecision({ num: config.body.decisionNum, question: config.body.question, answer: body.label, tier: body.tier, feedback: body.feedback });
    if (body.tier !== 'critical') setScreen('load_arm');
  };

  if (screen === 'load_arm') return <ModuleLoader label="SZYFROWANIE I DOŁĄCZANIE ŁADUNKU DO ZAŁĄCZNIKA…" durationMs={1100} accent={blue} onDone={() => setScreen('arm')} />;

  if (screen === 'arm') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('UZBROJENIE ZAŁĄCZNIKA', 'ZAŁĄCZNIK')}
        {recipientBanner}
        <div className="p-4 rounded-xl bg-black/50 border flex items-center justify-between text-xs" style={{ borderColor: `${accent}66` }}>
          <div className="flex items-center space-x-2 text-gray-300">
            <Paperclip size={16} style={{ color: blue }} /><span>ZAŁĄCZNIK:</span><span className="font-bold text-white font-mono">{config.attachment}</span>
          </div>
          <span className="text-[0.625rem] px-1.5 py-0.5 rounded border flex items-center space-x-1" style={{ backgroundColor: `${accent}26`, borderColor: accent, color: '#c084fc' }}>
            <Lock size={10} /><span>ŁADUNEK UZBROJONY</span>
          </span>
        </div>
        <p className="text-[0.6875rem] text-gray-400">Załącznik zaszyfrowany hasłem i uzbrojony ładunkiem. Teraz trzeba zamaskować nadawcę — otwórz klienta VPN.</p>
        <div className="pt-2 flex items-center justify-end">
          <button onClick={onComplete} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white flex items-center space-x-2 cursor-pointer"
            style={{ backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` }}>
            <span>ZATWIERDŹ MAILA I PRZEKAŻ DO BYTE_MASTERA</span><ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'body') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('KROK 2/2 — TREŚĆ WIADOMOŚCI', 'TREŚĆ')}
        {recipientBanner}
        <div className="text-xs font-bold text-gray-300">{config.body.question}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {config.body.options.map((o) => (
            <button key={o.id} onClick={() => { sounds.playClick(); setBodyId(o.id); }}
              className="p-3 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between"
              style={bodyId === o.id ? { borderColor: blue, backgroundColor: `${blue}33`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold" style={{ color: '#7dd3fc' }}>{o.label}</span>{bodyId === o.id && <CheckCircle2 size={14} style={{ color: blue }} />}
                </div>
                <pre className="text-[0.625rem] font-mono whitespace-pre-wrap leading-relaxed opacity-85">{o.text}</pre>
              </div>
            </button>
          ))}
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button disabled={!bodyId} onClick={handleBody}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${bodyId ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            style={bodyId ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}>
            <span>ZATWIERDŹ TREŚĆ</span><ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // screen === 'subject'
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header('KROK 1/2 — TEMAT WIADOMOŚCI', 'TEMAT')}
      {recipientBanner}
      <div className="text-xs font-bold text-gray-300">{config.subject.question}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {config.subject.options.map((o) => (
          <button key={o.id} onClick={() => { sounds.playClick(); setSubjectId(o.id); }}
            className="p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer"
            style={subjectId === o.id ? { borderColor: blue, backgroundColor: `${blue}33`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold">{o.label}</span>{subjectId === o.id && <CheckCircle2 size={15} style={{ color: blue }} />}
            </div>
          </button>
        ))}
      </div>
      <div className="pt-2 flex items-center justify-end">
        <button disabled={!subjectId} onClick={handleSubject}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${subjectId ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          style={subjectId ? { backgroundColor: blue, boxShadow: `0 0 20px ${blue}80` } : undefined}>
          <span>ZATWIERDŹ TEMAT</span><ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
