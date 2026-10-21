import React, { useState } from 'react';
import {
  Wifi,
  Globe,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Cpu,
  AlertTriangle,
  Send,
  Check
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import { ModuleLoader } from '../components/ModuleLoader';
import { TimeJump } from '../components/TimeJump';
import type { BlockProps, ChoiceOutcome } from '../types/mission';

function parseOctets(ip?: string): number[] {
  if (!ip) return [127, 0, 0, 1];
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  return parts.length === 4 && parts.every((n) => !isNaN(n)) ? parts : [127, 0, 0, 1];
}

export interface VpnSenderOption {
  id: string;
  label: string;
  desc?: string;
  tier: ChoiceOutcome;
  feedback: string;
}

export interface VpnRouterConfig {
  // Nested structure (Mission 4):
  vpn?: {
    decisionNum?: number;
    question?: string;
    initialIp: string;
    targetIp: string;
    allowedIps?: string[];
    feedback?: { ideal: string; critical: string };
  };
  sender?: {
    decisionNum: number;
    question: string;
    options: VpnSenderOption[];
  };

  // Flat structure (Mission 2):
  decisionNum?: number;
  question?: string;
  initialIp?: string;
  targetIp?: string;
  allowedIps?: string[];
  allowAiSync?: boolean;
  feedback?: { ideal: string; critical: string };

  // Post-send loaders / jumps
  sendLoaderLabel?: string;
  timeJump?: {
    label: string;
    sublabel: string;
    durationMs?: number;
  };
}

type Screen = 'ip' | 'sender' | 'load_send' | 'timejump';

/**
 * Reużywalny klocek VPN / Routing IP (HACKERS.OS).
 *
 * Łączy sprawdzony 2-kolumnowy layout z pionowymi przyciskami oktetów (+/-),
 * moduł wspomagania AI oraz estetykę cyber/neon z Misji 4.
 * Obsługuje zarówno proste dopasowanie IP, jak i opcjonalny krok nadawcy oraz TimeJump.
 */
export const VpnRouter: React.FC<BlockProps<VpnRouterConfig>> = ({
  config,
  onDecision,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#a855f7';

  // Normalizacja konfiguracji (płaska lub zagnieżdżona w config.vpn)
  const vpnSub = config.vpn || config;
  const initialIpStr = vpnSub.initialIp || '127.0.0.1';
  const targetIpStr = vpnSub.targetIp || '127.0.0.1';
  const allowedIps = (vpnSub.allowedIps && vpnSub.allowedIps.length > 0)
    ? vpnSub.allowedIps
    : [targetIpStr];
  const decisionNum = vpnSub.decisionNum;
  const question = vpnSub.question || 'Dopasuj adres IP węzła wyjściowego VPN:';
  const feedback = vpnSub.feedback || {
    ideal: 'Pomyślnie dopasowano adres IP! Ruch zamaskowany i dopuszczony przez filtry.',
    critical: 'Błąd: Adres IP nie znajduje się na białej liście dopuszczonych węzłów!'
  };
  const allowAiSync = config.allowAiSync !== false;
  const hasSenderStep = Boolean(config.sender && config.sender.options?.length > 0);

  const initial = parseOctets(initialIpStr);
  const target = parseOctets(targetIpStr);

  const [screen, setScreen] = useState<Screen>('ip');
  const [octets, setOctets] = useState<number[]>(initial);
  const [isSyncingAi, setIsSyncingAi] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);

  const currentIp = octets.join('.');
  const isTargetMatched = currentIp === targetIpStr || allowedIps.includes(currentIp);
  const sender = config.sender?.options.find((s) => s.id === senderId);

  const setOctet = (idx: number, delta: number) => {
    sounds.playKeypress();
    setErrorMessage(null);
    setOctets((prev) =>
      prev.map((v, i) => (i === idx ? Math.max(0, Math.min(255, v + delta)) : v))
    );
  };

  const handleAiSync = () => {
    sounds.playClick();
    setIsSyncingAi(true);
    setErrorMessage(null);
    setTimeout(() => {
      setOctets(parseOctets(targetIpStr));
      setIsSyncingAi(false);
      sounds.playSuccess();
    }, 900);
  };

  const handleConnect = () => {
    sounds.playClick();

    if (isTargetMatched) {
      sounds.playSuccess();
      setErrorMessage(null);

      if (decisionNum !== undefined) {
        onDecision({
          num: decisionNum,
          question,
          answer: currentIp,
          tier: 'ideal',
          feedback: feedback.ideal
        });
      }

      if (hasSenderStep) {
        setScreen('sender');
      } else {
        setIsConnected(true);
      }
    } else {
      sounds.playAlarm();
      const failMsg = feedback.critical;
      setErrorMessage(failMsg);

      if (decisionNum !== undefined) {
        onDecision({
          num: decisionNum,
          question,
          answer: currentIp,
          tier: 'critical',
          feedback: failMsg
        });
      }
    }
  };

  const handleSender = () => {
    if (!sender || !config.sender) return;
    sounds.playClick();
    onDecision({
      num: config.sender.decisionNum,
      question: config.sender.question,
      answer: sender.label,
      tier: sender.tier,
      feedback: sender.feedback
    });

    if (sender.tier !== 'critical') {
      setScreen('load_send');
    }
  };

  const header = (sub: string, stepBadge: string) => (
    <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${accent}4d` }}>
      <div className="flex items-center space-x-2.5">
        <div
          className="p-1.5 rounded-lg border"
          style={{ backgroundColor: `${accent}26`, borderColor: accent, color: accent }}
        >
          <Wifi size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest">//VPN_ROUTING // MASKOWANIE TOŻSAMOŚCI</h2>
          <p className="text-[11px]" style={{ color: accent }}>{sub}</p>
        </div>
      </div>
      <span
        className="text-[10px] px-2.5 py-1 rounded-md border font-mono font-bold"
        style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
      >
        {stepBadge}
      </span>
    </div>
  );

  if (screen === 'load_send') {
    return (
      <ModuleLoader
        label={config.sendLoaderLabel || "TRANSMISJA PRZEZ TUNEL VPN — WYSYŁKA PAKIETÓW PHISHINGOWYCH…"}
        durationMs={1800}
        accent={accent}
        onDone={() => {
          if (hasSenderStep) {
            setScreen('timejump');
          } else {
            onComplete();
          }
        }}
      />
    );
  }

  if (screen === 'timejump') {
    return (
      <TimeJump
        label={config.timeJump?.label || "MIJA KILKA GODZIN…"}
        sublabel={config.timeJump?.sublabel || "CZEKAMY, AŻ ADRESAT OTWORZY WIADOMOŚĆ I AKTYWUJE ŁADUNEK."}
        durationMs={config.timeJump?.durationMs || 3200}
        accent={accent}
        onDone={onComplete}
      />
    );
  }

  if (screen === 'sender' && config.sender) {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('KROK 2/2 — WYBÓR ADRESU NADAWCY', 'NADAWCA')}
        <div className="text-xs font-bold text-white">{config.sender.question}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {config.sender.options.map((o) => {
            const isSelected = senderId === o.id;
            return (
              <button
                key={o.id}
                onClick={() => {
                  sounds.playClick();
                  setSenderId(o.id);
                }}
                className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.35)] text-white'
                    : 'border-gray-800 bg-[#08101a] text-gray-300 hover:border-gray-700 hover:bg-[#0c1624]'
                }`}
                style={isSelected ? { borderColor: accent, backgroundColor: `${accent}26` } : undefined}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold font-mono text-white">{o.label}</span>
                  {isSelected && <CheckCircle2 size={16} style={{ color: accent }} />}
                </div>
                {o.desc && <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{o.desc}</p>}
              </button>
            );
          })}
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button
            disabled={!senderId}
            onClick={handleSender}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
              senderId
                ? 'text-white cursor-pointer hover:brightness-110 shadow-lg'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            style={senderId ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}
          >
            <Send size={14} />
            <span>WYŚLIJ SPEAR-PHISHING</span>
          </button>
        </div>
      </div>
    );
  }

  // screen === 'ip'
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header(
        hasSenderStep ? 'KROK 1/2 — MASKOWANIE ADRESU IP' : 'DOPASOWANIE ADRESU DO WĘZŁA PROXY',
        isConnected ? 'POŁĄCZONO' : isTargetMatched ? 'ZGODNY' : 'ROZŁĄCZONY'
      )}

      {/* Górny panel 2-kolumnowy (Biała lista + moduł AI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Kolumna 1: Biała lista / Wymagany adres */}
        <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Globe size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Dozwolone IP (Biała lista)</span>
          </div>
          <div className="space-y-1.5">
            {allowedIps.map((ip) => (
              <div
                key={ip}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-gray-800 flex justify-between items-center text-xs"
              >
                <span className="font-mono text-emerald-400 font-bold">{ip}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">SERWER PROXY</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
            Filtry bezpieczeństwa celu natychmiast odrzucają ruch spoza zarejestrowanych węzłów sieci.
          </p>
        </div>

        {/* Kolumna 2: Automatyczna synchronizacja AI */}
        <div
          className="p-3.5 rounded-xl border space-y-3 flex flex-col justify-between"
          style={{ borderColor: `${accent}40`, backgroundColor: `${accent}10` }}
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2" style={{ color: accent }}>
              <Cpu size={16} />
              <span className="text-xs font-bold uppercase tracking-wide">Automatyczna synchronizacja AI</span>
            </div>
            <p className="text-[11px] text-gray-300">
              Moduł heurystyczny AI automatycznie przelicza i dopasowuje octety do allowlisty celu.
            </p>
          </div>

          {allowAiSync && (
            <button
              disabled={isSyncingAi || isConnected}
              onClick={handleAiSync}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs border transition-all cursor-pointer text-white disabled:opacity-50"
              style={{
                backgroundColor: `${accent}33`,
                borderColor: `${accent}80`,
                boxShadow: `0 0 15px ${accent}40`
              }}
            >
              <RefreshCw size={14} className={isSyncingAi ? 'animate-spin' : ''} />
              <span>{isSyncingAi ? 'SYNCHRONIZACJA...' : 'DOPASUJ W AI'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Środkowy panel: Bieżący adres IP + Pionowe przyciski oktetów */}
      <div className="p-4 rounded-xl border border-gray-800 bg-[#08101a] space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            BIEŻĄCY ADRES WYJŚCIOWY VPN:
          </div>
          {isTargetMatched ? (
            <span
              className="px-2.5 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1"
              style={{ backgroundColor: '#10b98126', borderColor: '#10b981', color: '#10b981' }}
            >
              <Check size={12} />
              <span>PODSIEĆ ZGODNA</span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 font-mono">[DOPASUJ PRZYCISKAMI +/-]</span>
          )}
        </div>

        <div className="text-center">
          <div
            className="text-2xl sm:text-3xl font-black font-mono tracking-widest transition-all"
            style={{ color: isTargetMatched ? '#10b981' : '#fff' }}
          >
            {currentIp}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
          {octets.map((val, idx) => {
            const isOctetMatch = val === target[idx];
            return (
              <div key={idx} className="flex flex-col items-center space-y-1">
                <button
                  type="button"
                  disabled={isConnected}
                  onClick={() => setOctet(idx, 1)}
                  className="w-full py-1 rounded bg-[#0c1624] hover:bg-[#15253b] border border-gray-700 text-gray-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
                <div
                  className="w-full py-2 bg-black/70 border rounded text-center font-bold text-sm font-mono transition-all"
                  style={{
                    borderColor: isOctetMatch ? '#10b981' : '#374151',
                    color: isOctetMatch ? '#10b981' : '#fff'
                  }}
                >
                  {val}
                </div>
                <button
                  type="button"
                  disabled={isConnected}
                  onClick={() => setOctet(idx, -1)}
                  className="w-full py-1 rounded bg-[#0c1624] hover:bg-[#15253b] border border-gray-700 text-gray-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg border border-red-500/50 bg-red-950/30 flex items-center space-x-2 text-xs text-red-300 animate-in fade-in">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isConnected && !hasSenderStep && (
          <div className="p-3 rounded-lg border border-emerald-500/50 bg-emerald-950/30 flex items-center space-x-2 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{feedback.ideal}</span>
          </div>
        )}
      </div>

      {/* Dolny przycisk akcji */}
      <div className="flex justify-end pt-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all cursor-pointer hover:brightness-110"
            style={{ backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` }}
          >
            <ShieldCheck size={16} />
            <span>POŁĄCZ Z TUNELEM VPN</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sounds.playSuccess();
              onComplete();
            }}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition-all cursor-pointer"
          >
            <span>ZATWIERDŹ ROUTING I PRZEJDŹ DALEJ</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
