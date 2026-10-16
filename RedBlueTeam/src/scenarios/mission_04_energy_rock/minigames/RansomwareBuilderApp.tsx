import React, { useState, useEffect } from 'react';
import { Lock, Key, ArrowRight, Check, Cpu, DollarSign, Clock, Wallet, AlertOctagon } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps, ChoiceOutcome } from '../../../engine/types/mission';
import type { BuilderConfig } from './types';

type Screen = 'password' | 'load_components' | 'components' | 'load_color' | 'color' | 'compile';

const TIER_RANK: Record<ChoiceOutcome, number> = { ideal: 0, suboptimal: 1, critical: 2 };
const worstTier = (a: ChoiceOutcome, b: ChoiceOutcome): ChoiceOutcome => (TIER_RANK[a] >= TIER_RANK[b] ? a : b);

/**
 * D2–D4 — kreator ransomware jako sekwencja ekranów (bez zakładek, bez cofania):
 * hasło → loader → komunikat okupu → loader → kolor → loader kompilacji → onComplete.
 */
export const RansomwareBuilderApp: React.FC<BlockProps<BuilderConfig>> = ({ config, onDecision, onComplete }) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#a855f7';
  const [screen, setScreen] = useState<Screen>('password');

  // D2
  const [passwordLength, setPasswordLength] = useState(12);
  const [useUppercase, setUseUppercase] = useState(false);
  const [useLowercase, setUseLowercase] = useState(false);
  const [useNumbers, setUseNumbers] = useState(false);
  const [useSymbols, setUseSymbols] = useState(false);
  const [useNational, setUseNational] = useState(false);
  const [useSpaces, setUseSpaces] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  // D3
  const [titleId, setTitleId] = useState<string | null>(null);
  const [countdownId, setCountdownId] = useState<string | null>(null);
  // D4
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    let charset = '';
    if (useUppercase) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (useLowercase) charset += 'abcdefghijkmnopqrstuvwxyz';
    if (useNumbers) charset += '23456789';
    if (useSymbols) charset += '!@#$%^&*()_+';
    if (useNational) charset += 'ĄĘŚĆŻŹÓŁń';
    if (useSpaces) charset += ' ';
    if (!charset) { setGeneratedKey('— (WYBIERZ ZESTAW ZNAKÓW) —'); return; }
    let result = '';
    for (let i = 0; i < passwordLength; i++) result += charset.charAt(Math.floor(Math.random() * charset.length));
    setGeneratedKey(result);
  }, [passwordLength, useUppercase, useLowercase, useNumbers, useSymbols, useNational, useSpaces]);

  const evaluatePassword = (): { strength: number; tier: ChoiceOutcome } => {
    const hasForbidden = useNational || useSpaces;
    const safeGroups = [useUppercase, useLowercase, useNumbers, useSymbols].filter(Boolean).length;
    if (safeGroups === 0) return { strength: 1, tier: 'critical' };
    if (hasForbidden || passwordLength < config.password.minSafeLength || safeGroups < 2) return { strength: 2, tier: 'critical' };
    if (passwordLength >= config.password.targetLength - 2 && safeGroups === 4) return { strength: 5, tier: 'ideal' };
    return { strength: 4, tier: 'suboptimal' };
  };
  const pwdEval = evaluatePassword();

  const title = config.components.titleOptions.find((o) => o.id === titleId);
  const countdown = config.components.countdownOptions.find((o) => o.id === countdownId);
  const color = config.color.options.find((o) => o.id === selectedColor);

  const handleSavePassword = () => {
    sounds.playSuccess();
    onDecision({
      num: config.password.decisionNum,
      question: config.password.question,
      answer: `${pwdEval.strength}/5 (${passwordLength} znaków, ${useNational || useSpaces ? 'niebezpieczne znaki' : 'bezpieczny charset'})`,
      tier: pwdEval.tier,
      feedback: config.password.feedback[pwdEval.tier]
    });
    if (pwdEval.tier !== 'critical') setScreen('load_components');
  };

  const handleSaveComponents = () => {
    if (!title || !countdown) return;
    sounds.playSuccess();
    const tier = worstTier(title.tier, countdown.tier);
    const feedback = tier === 'ideal'
      ? 'Komunikat jest jasny i wiarygodny: stanowczy tytuł oraz realny limit czasu.'
      : `${title.feedback} ${countdown.feedback}`.trim();
    onDecision({ num: config.components.decisionNum, question: config.components.question, answer: `${title.label} / ${countdown.label}`, tier, feedback });
    if (tier !== 'critical') setScreen('load_color');
  };

  const handleSaveColor = () => {
    if (!color) return;
    sounds.playSuccess();
    onDecision({ num: config.color.decisionNum, question: config.color.question, answer: color.label, tier: color.tier, feedback: color.feedback });
    if (color.tier !== 'critical') setScreen('compile');
  };

  const header = (sub: string, step: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${accent}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded border" style={{ backgroundColor: `${accent}33`, borderColor: accent, color: accent }}><Lock size={20} /></div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">//RANSOMWARE_BUILDER // KONFIGURATOR ŁADUNKU</h2>
          <p className="text-[11px]" style={{ color: accent }}>{sub}</p>
        </div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded border" style={{ backgroundColor: `${accent}26`, borderColor: `${accent}80`, color: '#c084fc' }}>{step}</span>
    </div>
  );

  if (screen === 'load_components') return <ModuleLoader label="ZAPIS KLUCZA — GENEROWANIE KOMUNIKATU OKUPU…" durationMs={1000} accent={accent} onDone={() => setScreen('components')} />;
  if (screen === 'load_color') return <ModuleLoader label="ZAPIS KOMUNIKATU — RENDEROWANIE INTERFEJSU…" durationMs={1000} accent={accent} onDone={() => setScreen('color')} />;
  if (screen === 'compile') return <ModuleLoader label="KOMPILACJA ŁADUNKU RANSOMWARE…" durationMs={1600} accent={accent} onDone={onComplete} />;

  if (screen === 'password') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('KROK 1/3 — KLUCZ SZYFRUJĄCY', 'HASŁO')}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white tracking-wider">{config.password.question}</span>
          <span className="text-[10px]" style={{ color: accent }}>OCENA ENTROPII: {pwdEval.strength}/5</span>
        </div>
        <div className="p-3.5 rounded-xl bg-black/60 border flex items-center space-x-2 min-w-0" style={{ borderColor: `${accent}66` }}>
          <Key size={16} style={{ color: accent }} className="shrink-0" />
          <span className="text-xs font-bold text-gray-400 shrink-0">KLUCZ:</span>
          <span className="text-xs sm:text-sm font-bold text-[#e9d5ff] tracking-widest break-all truncate">{generatedKey}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#08101a] border border-gray-800 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-300">DŁUGOŚĆ KLUCZA (8 - {config.password.targetLength}):</span>
            <span style={{ color: accent }} className="text-sm">{passwordLength} ZNAKÓW</span>
          </div>
          <input type="range" min={8} max={config.password.targetLength} step={1} value={passwordLength}
            onChange={(e) => { sounds.playKeypress(); setPasswordLength(parseInt(e.target.value)); }}
            className="w-full cursor-pointer" style={{ accentColor: accent }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {[
            { label: config.password.safeTags[0], val: useUppercase, set: setUseUppercase },
            { label: config.password.safeTags[1], val: useLowercase, set: setUseLowercase },
            { label: config.password.safeTags[2], val: useNumbers, set: setUseNumbers },
            { label: config.password.safeTags[3], val: useSymbols, set: setUseSymbols },
            { label: config.password.forbiddenTags[0], val: useNational, set: setUseNational },
            { label: config.password.forbiddenTags[1], val: useSpaces, set: setUseSpaces }
          ].map((item, i) => (
            <button key={i} type="button" onClick={() => { sounds.playClick(); item.set(!item.val); }}
              className="p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all cursor-pointer"
              style={item.val ? { backgroundColor: `${accent}33`, borderColor: accent, color: '#fff' } : { backgroundColor: '#08101a', borderColor: '#1f2937', color: '#9ca3af' }}>
              <span className="font-bold">{item.label}</span>
              {item.val ? <Check size={14} style={{ color: accent }} /> : <span className="text-[10px] text-gray-600">NIE</span>}
            </button>
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <button onClick={handleSavePassword} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white flex items-center space-x-2 cursor-pointer"
            style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` }}>
            <span>ZAPISZ KLUCZ</span><ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'components') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('KROK 2/3 — KOMUNIKAT ŻĄDANIA OKUPU', 'KOMUNIKAT')}
        <div className="text-xs font-bold text-white tracking-wider">{config.components.question}</div>
        <div className="space-y-2">
          <div className="text-[11px] text-gray-400 font-bold">TYTUŁ KOMUNIKATU:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {config.components.titleOptions.map((o) => (
              <button key={o.id} onClick={() => { sounds.playClick(); setTitleId(o.id); }}
                className="p-3 rounded-xl text-left border-2 text-xs font-bold transition-all cursor-pointer"
                style={titleId === o.id ? { borderColor: accent, backgroundColor: `${accent}26`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[11px] text-gray-400 font-bold">ZEGAR ODLICZAJĄCY:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {config.components.countdownOptions.map((o) => (
              <button key={o.id} onClick={() => { sounds.playClick(); setCountdownId(o.id); }}
                className="p-3 rounded-xl text-left border-2 text-xs font-bold font-mono transition-all cursor-pointer"
                style={countdownId === o.id ? { borderColor: accent, backgroundColor: `${accent}26`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-gray-800 grid grid-cols-3 gap-3 text-[11px]">
          <div><div className="text-gray-500">KWOTA</div><div className="font-bold text-white">{config.components.staticParts.amount}</div></div>
          <div><div className="text-gray-500">PORTFEL</div><div className="font-bold text-white font-mono">{config.components.staticParts.wallet}</div></div>
          <div><div className="text-gray-500">KONTAKT</div><div className="font-bold text-white">{config.components.staticParts.contact}</div></div>
        </div>
        <div className="pt-2 flex justify-end">
          <button disabled={!title || !countdown} onClick={handleSaveComponents}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${title && countdown ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            style={title && countdown ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}>
            <span>ZAPISZ KOMUNIKAT</span><ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // screen === 'color'
  const previewColorClass =
    selectedColor === 'red' ? 'bg-[#180404] border-red-600 text-red-100'
    : selectedColor === 'green' ? 'bg-[#021808] border-green-600 text-green-100'
    : selectedColor === 'white' ? 'bg-[#121214] border-gray-400 text-gray-100'
    : 'bg-black/60 border-gray-800 text-gray-400';
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header('KROK 3/3 — KOLOR INTERFEJSU SZANTAŻU', 'KOLOR')}
      <div className="text-xs font-bold text-white tracking-wider">{config.color.question}</div>
      <div className="grid grid-cols-3 gap-3">
        {config.color.options.map((o) => (
          <button key={o.id} onClick={() => { sounds.playClick(); setSelectedColor(o.id); }}
            className="p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer text-xs font-bold"
            style={selectedColor === o.id ? { borderColor: accent, backgroundColor: `${accent}26`, color: '#fff' } : { borderColor: '#1f2937', backgroundColor: '#08101a', color: '#9ca3af' }}>
            <span>{o.label}</span>{selectedColor === o.id && <Check size={15} />}
          </button>
        ))}
      </div>
      <div className={`p-5 rounded-2xl border-4 transition-all ${previewColorClass}`}>
        <div className="flex items-center justify-between pb-3 border-b border-current/30">
          <div className="flex items-center space-x-2">
            <AlertOctagon size={24} className="animate-pulse" />
            <h2 className="text-sm font-black tracking-widest uppercase">{title?.label || config.components.titleOptions[0].label}</h2>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-current">ENERGY ROCK CORP</span>
        </div>
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="p-3 rounded-xl border border-current/40 bg-black/40 flex items-center space-x-3">
            <DollarSign size={24} /><div><div className="text-[10px] opacity-70">KWOTA:</div><div className="text-base font-black">{config.components.staticParts.amount}</div></div>
          </div>
          <div className="p-3 rounded-xl border border-current/40 bg-black/40 flex items-center space-x-3">
            <Clock size={24} className="animate-pulse" /><div><div className="text-[10px] opacity-70">CZAS:</div><div className="text-sm font-black font-mono">{(countdown?.label || '').replace('POZOSTAŁY CZAS: ', '')}</div></div>
          </div>
          <div className="p-3 rounded-xl border border-current/40 bg-black/40 flex items-center space-x-3">
            <Wallet size={24} /><div><div className="text-[10px] opacity-70">PORTFEL:</div><div className="text-xs font-mono font-bold">{config.components.staticParts.wallet}</div></div>
          </div>
        </div>
      </div>
      <div className="pt-2 flex items-center justify-end">
        <button disabled={!color} onClick={handleSaveColor}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${color ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          style={color ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}>
          <Cpu size={14} /><span>KOMPILUJ ŁADUNEK RANSOMWARE</span>
        </button>
      </div>
    </div>
  );
};
