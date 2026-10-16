import React, { useState } from 'react';
import { Server, Lock, FileText, Download, AlertOctagon, Flame, Check, PhoneCall, Network } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps, ChoiceOutcome } from '../../../engine/types/mission';
import type { ExfiltrationConfig } from './types';

type Screen = 'encrypt' | 'load_net' | 'network' | 'exfil' | 'load_exfil';

/**
 * D9 — stacja ofiary jako sekwencja ekranów: szyfrowanie (flavor) → loader →
 * graf sieci (flavor) → pula plików (oceniana) → loader eksfiltracji → onComplete.
 */
export const WorkstationExfiltrationApp: React.FC<BlockProps<ExfiltrationConfig>> = ({ config, onDecision, onComplete }) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#a855f7';
  const red = '#ef4444';
  const [screen, setScreen] = useState<Screen>('encrypt');
  const [lockedNodes, setLockedNodes] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);

  const NODES = 7;
  const allNodesLocked = lockedNodes.size >= NODES;

  const toggleNode = (i: number) => {
    sounds.playClick(600, 0.04);
    setLockedNodes((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      if (next.size >= NODES) sounds.playAlarm();
      return next;
    });
  };

  const toggleFile = (name: string) => {
    sounds.playClick();
    setSelected((prev) => (prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]));
  };

  // Gracz może zaznaczyć dowolne pliki — punkty daje TYLKO dokładna kombinacja 3 plików Freevolt.
  const evaluate = (): { tier: ChoiceOutcome; feedback: string } => {
    const byName = new Map(config.files.map((f) => [f.name, f.type]));
    const honeypot = selected.filter((f) => byName.get(f) === 'honeypot');
    const freevolt = selected.filter((f) => byName.get(f) === 'freevolt');
    if (freevolt.length < config.requiredFreevolt) return { tier: 'critical', feedback: config.feedback.criticalIncomplete };
    if (selected.length === config.requiredFreevolt && freevolt.length === config.requiredFreevolt) {
      return { tier: 'ideal', feedback: config.feedback.ideal };
    }
    if (honeypot.length > 0) return { tier: 'critical', feedback: config.feedback.criticalHoneypot };
    return { tier: 'critical', feedback: 'Pobrano pliki spoza dokumentacji Freevolt — nadmiarowy transfer wywołał detekcję przez SOC.' };
  };

  const handleExfiltrate = async () => {
    if (selected.length === 0) return;
    const { tier, feedback } = evaluate();
    onDecision({ num: config.decisionNum, question: config.question, answer: `Pobrano ${selected.length} plików`, tier, feedback });
    if (tier === 'critical') return;
    sounds.playAlarm();
    setFlash(true);
    setScreen('load_exfil');
  };

  const header = (sub: string, step: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${red}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded border" style={{ backgroundColor: `${red}33`, borderColor: red, color: red }}><Server size={20} /></div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">//STACJA OFIARY // {config.targetHost}</h2>
          <p className="text-[11px]" style={{ color: red }}>{sub}</p>
        </div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded border" style={{ backgroundColor: `${red}26`, borderColor: `${red}80`, color: '#fca5a5' }}>{step}</span>
    </div>
  );

  if (screen === 'load_net') return <ModuleLoader label="SZYFROWANIE RSA — MAPOWANIE TOPOLOGII SIECI…" durationMs={1200} accent={red} onDone={() => setScreen('network')} />;

  if (screen === 'load_exfil') {
    return (
      <div className="relative h-full">
        {flash && (
          <div className="absolute inset-0 z-50 bg-[#1c0202] border-4 border-red-600 rounded-xl p-6 flex flex-col justify-between items-center text-center">
            <div className="flex items-center space-x-3 text-red-500 animate-pulse">
              <AlertOctagon size={48} /><h1 className="text-xl font-black tracking-widest uppercase text-white">TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!</h1><AlertOctagon size={48} />
            </div>
            <div className="p-4 bg-black/60 border border-red-600 rounded-xl max-w-lg w-full text-red-200 space-y-2">
              <p className="text-sm font-bold">SYSTEMY ENERGY ROCK WYŁĄCZONE. SERWERY SPARALIŻOWANE.</p>
              <div className="p-3 bg-red-950/80 rounded border border-red-500 flex items-center justify-center space-x-3 text-amber-300">
                <PhoneCall size={20} className="animate-spin" /><span className="text-xs font-black uppercase">POŁĄCZENIE: SZEF DZIAŁU IT ENERGY ROCK…</span>
              </div>
            </div>
            <div className="text-xs text-red-400 font-bold tracking-wider">//HACKER.OS // KANAŁ ALARMOWY AKTYWNY</div>
          </div>
        )}
        <ModuleLoader label="EKSFILTRACJA PLIKÓW FREEVOLT…" durationMs={2000} accent={red} onDone={onComplete} />
      </div>
    );
  }

  if (screen === 'network') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('TOPOLOGIA SIECI — ZASZYFRUJ WĘZŁY', 'SIEĆ')}
        <p className="text-xs text-gray-400">Kliknij węzły sieci, aby zaszyfrować zasoby i rozprzestrzenić ransomware ({lockedNodes.size}/{NODES}).</p>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: NODES }, (_, i) => {
            const locked = lockedNodes.has(i);
            return (
              <button key={i} onClick={() => toggleNode(i)}
                className="p-4 rounded-xl border-2 flex flex-col items-center space-y-1 transition-all cursor-pointer"
                style={locked ? { borderColor: accent, backgroundColor: `${accent}26`, color: '#e9d5ff' } : { borderColor: '#10b98155', backgroundColor: '#04140c', color: '#10b981' }}>
                {locked ? <Lock size={20} /> : <Network size={20} />}
                <span className="text-[9px] font-mono">{i === NODES - 1 ? 'SERWER' : `PC-${i + 1}`}</span>
              </button>
            );
          })}
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button disabled={!allNodesLocked} onClick={() => setScreen('exfil')}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${allNodesLocked ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            style={allNodesLocked ? { backgroundColor: red, boxShadow: `0 0 20px ${red}80` } : undefined}>
            <Download size={14} /><span>PRZEJDŹ DO POBIERANIA PLIKÓW</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'exfil') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('EKSFILTRACJA — WYBÓR PLIKÓW', 'PLIKI')}
        <div className="flex justify-between items-center text-xs font-bold text-gray-300">
          <span>ZAZNACZ PLIKI DO POBRANIA (CEL: DOKUMENTACJA „FREEVOLT"):</span>
          <span style={{ color: accent }}>WYBRANO: {selected.length}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {config.files.map((file) => {
            const isSel = selected.includes(file.name);
            return (
              <div key={file.name} data-file-name={file.name} onClick={() => toggleFile(file.name)}
                className="p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between"
                style={isSel ? { borderColor: accent, backgroundColor: `${accent}33`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
                <div className="flex items-center space-x-2.5 min-w-0">
                  <FileText size={18} style={{ color: isSel ? accent : '#6b7280' }} />
                  <div className="truncate"><span className="text-xs font-bold font-mono block truncate">{file.name}</span><span className="text-[10px] text-gray-500">{file.size}</span></div>
                </div>
                {isSel && <span className="w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0" style={{ backgroundColor: accent }}><Check size={12} /></span>}
              </div>
            );
          })}
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button disabled={selected.length === 0} onClick={handleExfiltrate}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${selected.length > 0 ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            style={selected.length > 0 ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}>
            <Download size={14} /><span>POBIERZ PLIKI I ZAINICJUJ NEGOCJACJE</span>
          </button>
        </div>
      </div>
    );
  }

  // screen === 'encrypt'
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header(`IP DOCELOWE: ${config.targetIp}`, 'SZYFROWANIE')}
      <div className="p-5 rounded-xl bg-[#1c0808] border-2 flex items-center justify-between gap-4" style={{ borderColor: red }}>
        <div className="flex items-center space-x-3.5">
          <Flame size={32} style={{ color: red }} className="animate-pulse shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ŁADUNEK RANSOMWARE AKTYWNY W PAMIĘCI STACJI ROBOCZEJ</h3>
            <p className="text-[11px] text-gray-300 mt-1">Uruchom procedurę szyfrowania zasobów firmy, aby sparaliżować serwery i stworzyć zasłonę dymną.</p>
          </div>
        </div>
        <button onClick={() => { sounds.playAlarm(); setScreen('load_net'); }}
          className="px-6 py-3 rounded-xl font-black text-xs uppercase text-white flex items-center space-x-2 shrink-0 cursor-pointer" style={{ backgroundColor: red }}>
          <Lock size={16} /><span>SZYFRUJ ZASOBY FIRMY</span>
        </button>
      </div>
    </div>
  );
};
