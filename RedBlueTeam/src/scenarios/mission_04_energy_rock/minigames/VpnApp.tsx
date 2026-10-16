import React, { useState } from 'react';
import { Wifi, Globe, CheckCircle2, Send, Check, ArrowRight } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { VpnConfig } from './types';

type Screen = 'ip' | 'sender' | 'load_send';

/**
 * D7–D8 — maskowanie tożsamości jako sekwencja ekranów: dopasowanie IP (VPN) →
 * wybór nadawcy → loader wysyłki → onComplete.
 */
export const VpnApp: React.FC<BlockProps<VpnConfig>> = ({ config, onDecision, onComplete }) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#a855f7';
  const initial = parseOctets(config.vpn.initialIp);
  const target = parseOctets(config.vpn.targetIp);

  const [screen, setScreen] = useState<Screen>('ip');
  const [octets, setOctets] = useState<number[]>(initial);
  const [senderId, setSenderId] = useState<string | null>(null);

  const currentIp = octets.join('.');
  const isIpCorrect = currentIp === config.vpn.targetIp;
  const sender = config.sender.options.find((s) => s.id === senderId);

  const setOctet = (idx: number, delta: number) => {
    sounds.playKeypress();
    setOctets((prev) => prev.map((v, i) => (i === idx ? Math.max(0, Math.min(255, v + delta)) : v)));
  };

  const handleIp = () => {
    sounds.playClick();
    const tier = isIpCorrect ? 'ideal' : 'critical';
    onDecision({ num: config.vpn.decisionNum, question: config.vpn.question, answer: currentIp, tier, feedback: isIpCorrect ? config.vpn.feedback.ideal : config.vpn.feedback.critical });
    if (tier === 'critical') { sounds.playAlarm(); return; }
    setScreen('sender');
  };

  const handleSender = () => {
    if (!sender) return;
    sounds.playClick();
    onDecision({ num: config.sender.decisionNum, question: config.sender.question, answer: sender.label, tier: sender.tier, feedback: sender.feedback });
    if (sender.tier !== 'critical') setScreen('load_send');
  };

  const header = (sub: string, step: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${accent}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded border" style={{ backgroundColor: `${accent}33`, borderColor: accent, color: accent }}><Wifi size={20} /></div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">//VPN_ROUTING // MASKOWANIE TOŻSAMOŚCI</h2>
          <p className="text-[11px]" style={{ color: accent }}>{sub}</p>
        </div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded border" style={{ backgroundColor: `${accent}26`, borderColor: `${accent}80`, color: '#c084fc' }}>{step}</span>
    </div>
  );

  if (screen === 'load_send') return <ModuleLoader label="TRANSMISJA PRZEZ TUNEL VPN — WYSYŁKA SPEAR-PHISHINGU…" durationMs={1800} accent={accent} onDone={onComplete} />;

  if (screen === 'sender') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('KROK 2/2 — ADRES NADAWCY', 'NADAWCA')}
        <div className="text-xs font-bold text-gray-300">{config.sender.question}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {config.sender.options.map((o) => (
            <button key={o.id} onClick={() => { sounds.playClick(); setSenderId(o.id); }}
              className="p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer"
              style={senderId === o.id ? { borderColor: accent, backgroundColor: `${accent}33`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono">{o.label}</span>{senderId === o.id && <CheckCircle2 size={15} style={{ color: accent }} />}
              </div>
            </button>
          ))}
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button disabled={!senderId} onClick={handleSender}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${senderId ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            style={senderId ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}>
            <Send size={14} /><span>WYŚLIJ SPEAR-PHISHING</span>
          </button>
        </div>
      </div>
    );
  }

  // screen === 'ip'
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header('KROK 1/2 — DOPASOWANIE PODSIECI', 'VPN')}
      <div className="flex items-center space-x-2 text-xs font-bold text-white">
        <Globe size={15} style={{ color: accent }} /><span>{config.vpn.question}</span>
      </div>

      {/* Docelowy adres jako wyraźny wzorzec do dopasowania */}
      <div className="p-4 rounded-xl border-2 text-center" style={{ borderColor: accent, backgroundColor: `${accent}12` }}>
        <div className="text-[10px] text-gray-400 font-bold mb-1">WYMAGANY ADRES IP (PODSIEĆ ENERGY ROCK)</div>
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {target.map((t, i) => (
            <div key={i} className="text-xl font-black tracking-widest" style={{ color: accent }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Bieżący adres budowany oktet po oktecie */}
      <div className="p-4 rounded-xl bg-[#08101a] border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-bold">TWÓJ ADRES IP TUNELU:</span>
          {isIpCorrect
            ? <span className="px-2 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1" style={{ backgroundColor: '#10b98126', borderColor: '#10b981', color: '#10b981' }}><Check size={12} /><span>PODSIEĆ ZGODNA</span></span>
            : <span className="text-[10px] text-gray-400">[DOPASUJ PRZYCISKAMI +/-]</span>}
        </div>
        <div className="grid grid-cols-4 gap-3 text-center text-xs">
          {octets.map((val, idx) => {
            const match = val === target[idx];
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-black/40 border" style={{ borderColor: match ? '#10b981' : '#1f2937' }}>
                <span className="text-[10px] text-gray-500 font-bold block mb-1">OKTET {idx + 1}</span>
                <div className="text-base font-bold mb-2 font-mono" style={{ color: match ? '#10b981' : '#fff' }}>{val}</div>
                <div className="flex justify-center space-x-1.5">
                  <button type="button" onClick={() => setOctet(idx, -1)} className="w-8 h-7 bg-gray-800 rounded text-sm font-bold flex items-center justify-center cursor-pointer hover:text-white">-</button>
                  <button type="button" onClick={() => setOctet(idx, +1)} className="w-8 h-7 bg-gray-800 rounded text-sm font-bold flex items-center justify-center cursor-pointer hover:text-white">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-end">
        <button onClick={handleIp}
          className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 text-white cursor-pointer"
          style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` }}>
          <span>ZESTAW TUNEL VPN</span><ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

function parseOctets(ip: string): number[] {
  const parts = ip.split('.').map((n) => parseInt(n, 10) || 0);
  while (parts.length < 4) parts.push(0);
  return parts.slice(0, 4);
}
