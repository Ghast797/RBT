import React, { useRef, useState } from 'react';
import {
  Wifi,
  Globe,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Cpu,
  AlertTriangle,
  Send,
  Check
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ChoiceZone, ChoiceTile } from '../components/ChoiceZone';
import { useShuffled } from '../core/shuffle';
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

  /** Nazwa aplikacji w nagłówku (domyślnie "//VPN_ROUTING"). */
  title?: string;
  /** Polecenie w pasku ZADANIE na ekranie dopasowania IP. */
  task?: string;

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
  // Kratki trzymamy jako tekst (puste pole podczas wpisywania), liczby wynikają z nich.
  const [fields, setFields] = useState<string[]>(initial.map(String));
  const octets = fields.map((f) => (f === '' ? 0 : parseInt(f, 10)));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [isSyncingAi, setIsSyncingAi] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);

  const currentIp = octets.join('.');
  const isTargetMatched = currentIp === targetIpStr || allowedIps.includes(currentIp);
  const sender = config.sender?.options.find((s) => s.id === senderId);
  const senderOptions = useShuffled(config.sender?.options ?? []);

  const setOctet = (idx: number, delta: number) => {
    sounds.playKeypress();
    setErrorMessage(null);
    setFields((prev) =>
      prev.map((f, i) =>
        i === idx ? String(Math.max(0, Math.min(255, (f === '' ? 0 : parseInt(f, 10)) + delta))) : f
      )
    );
  };

  const focusOctet = (idx: number) => {
    const el = inputRefs.current[idx];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleOctetChange = (idx: number, raw: string) => {
    setErrorMessage(null);
    const digits = raw.replace(/\D/g, '').slice(0, 3);
    const value = digits === '' ? '' : String(Math.min(255, parseInt(digits, 10)));
    setFields((prev) => prev.map((f, i) => (i === idx ? value : f)));
    // Pełne pole (3 cyfry) przechodzi do następnej kratki.
    if (digits.length === 3 && idx < 3) focusOctet(idx + 1);
  };

  const handleOctetKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' || e.key === 'Enter') {
      e.preventDefault();
      if (idx < 3) focusOctet(idx + 1);
    } else if (e.key === 'Backspace' && fields[idx] === '' && idx > 0) {
      e.preventDefault();
      focusOctet(idx - 1);
    }
  };

  const handleOctetPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const parts = e.clipboardData.getData('text').trim().split('.');
    if (parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p))) {
      e.preventDefault();
      setErrorMessage(null);
      setFields(parts.map((p) => String(Math.min(255, parseInt(p, 10)))));
      focusOctet(3);
    }
  };

  const handleAiSync = () => {
    sounds.playClick();
    setIsSyncingAi(true);
    setErrorMessage(null);
    setTimeout(() => {
      setFields(parseOctets(targetIpStr).map(String));
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

  const header = (sub: string, stepBadge: string, task: string) => (
    <AppHeader
      icon={Wifi}
      accent={accent}
      title={config.title || '//VPN_ROUTING'}
      subtitle={sub}
      step={stepBadge}
      task={task}
    />
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
        {header('KROK 2/2 — WYBÓR ADRESU NADAWCY', 'NADAWCA', config.sender.question)}
        <ChoiceZone accent={accent} label="WYBIERZ ADRES">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {senderOptions.map((o) => (
              <ChoiceTile
                key={o.id}
                accent={accent}
                state={senderId === o.id ? 'selected' : 'idle'}
                markerPosition="corner"
                onClick={() => {
                  sounds.playClick();
                  setSenderId(o.id);
                }}
                className="p-3.5 h-full"
              >
                <div className="space-y-2 pr-7">
                  <span className="text-xs font-bold font-mono text-white break-all">{o.label}</span>
                  {o.desc && <p className="text-[0.6875rem] text-gray-300 leading-relaxed">{o.desc}</p>}
                </div>
              </ChoiceTile>
            ))}
          </div>
        </ChoiceZone>
        <div className="pt-2 flex items-center justify-end">
          <button
            disabled={!senderId}
            onClick={handleSender}
            className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-lg active:scale-95"
            style={{ backgroundColor: accent, color: '#05090f', boxShadow: senderId ? `0 0 15px ${accent}66` : undefined }}
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
        isConnected ? 'POŁĄCZONO' : isTargetMatched ? 'ZGODNY' : 'ROZŁĄCZONY',
        isConnected
          ? 'Połączenie zestawione. Zatwierdź routing i przejdź dalej.'
          : config.task || 'Wpisz w kratki (lub ustaw przyciskami +/-) adres z białej listy i połącz się z tunelem VPN.'
      )}

      {/* Środkowy panel: Bieżący adres IP + Pionowe przyciski oktetów */}
      <div className="p-4 rounded-xl border border-gray-800 bg-[#08101a] space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            BIEŻĄCY ADRES WYJŚCIOWY VPN:
          </div>
          {isTargetMatched ? (
            <span
              className="px-2.5 py-0.5 rounded text-[0.625rem] font-bold border flex items-center space-x-1"
              style={{ backgroundColor: '#10b98126', borderColor: '#10b981', color: '#10b981' }}
            >
              <Check size={12} />
              <span>PODSIEĆ ZGODNA</span>
            </span>
          ) : (
            <span className="text-[0.625rem] text-gray-500 font-mono">[WPISZ LUB +/-]</span>
          )}
        </div>

        {/* Biała lista: główny, wyśrodkowany element, tuż nad polami adresu */}
        <div className="max-w-md mx-auto p-3.5 rounded-xl border border-cyan-500/30 bg-black/40 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <Globe size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Dozwolone IP (Biała lista)</span>
          </div>
          <div className="space-y-1.5">
            {allowedIps.map((ip) => (
              <div
                key={ip}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-gray-800 flex justify-between items-center text-xs"
              >
                <span className="font-mono text-emerald-400 font-bold text-sm">{ip}</span>
                <span className="text-[0.625rem] text-gray-400 uppercase tracking-wider">SERWER PROXY</span>
              </div>
            ))}
          </div>
          <p className="text-[0.6875rem] text-gray-400 leading-relaxed text-center">
            Filtry bezpieczeństwa celu natychmiast odrzucają ruch spoza zarejestrowanych węzłów sieci.
          </p>
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
                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  disabled={isConnected}
                  aria-label={`Oktet ${idx + 1} adresu IP`}
                  value={fields[idx]}
                  onChange={(e) => handleOctetChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOctetKeyDown(idx, e)}
                  onPaste={handleOctetPaste}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => setFields((prev) => prev.map((f, i) => (i === idx && f === '' ? '0' : f)))}
                  className="w-full py-2 bg-black/70 border rounded text-center font-bold text-sm font-mono transition-all outline-none focus:ring-1 select-text"
                  style={{
                    borderColor: isOctetMatch ? '#10b981' : '#374151',
                    color: isOctetMatch ? '#10b981' : '#fff',
                    ['--tw-ring-color' as string]: accent
                  }}
                />
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
      <div className="flex items-center justify-between pt-2">
        {/* Asysta AI: mały, mało widoczny link w rogu (nie jest oczywistą ścieżką) */}
        {allowAiSync && !isConnected ? (
          <button
            type="button"
            disabled={isSyncingAi}
            onClick={handleAiSync}
            title="Asysta AI: dopasuj oktety do allowlisty"
            className="flex items-center space-x-1 text-[0.625rem] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Cpu size={10} className={isSyncingAi ? 'animate-pulse' : ''} />
            <span>{isSyncingAi ? 'synchronizacja…' : 'asysta AI'}</span>
          </button>
        ) : (
          <span />
        )}
        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="flex items-center space-x-2 px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer active:scale-95"
            style={{ backgroundColor: accent, color: '#05090f', boxShadow: `0 0 15px ${accent}66` }}
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
            className="flex items-center space-x-2 px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <span>ZATWIERDŹ ROUTING I PRZEJDŹ DALEJ</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
