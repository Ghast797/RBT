import React, { useEffect, useRef, useState } from 'react';
import {
  Wifi,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Send,
  Check
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { ChoiceCardGrid } from '../components/ChoiceZone';
import { ConfirmButton } from '../components/ConfirmButton';
import { useShuffled } from '../core/shuffle';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';
import { ModuleLoader } from '../components/ModuleLoader';
import { TimeJump } from '../components/TimeJump';
import { reportAnswerOf, failFieldsOf } from '../core/report';
import type { BlockProps, ChoiceOutcome, DecisionReport, DecisionRejection } from '../types/mission';

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
  /** Odpowiedź do raportu, gdy inna niż etykieta (domyślnie `label`). */
  reportAnswer?: string;
  /** B2: mentor odrzuca ten adres nadawcy (zob. docs/scenario-engine.md, 6.1). */
  reject?: { mentorLine: string };
  failTitle?: string;
  failText?: string;
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
    /** Etykieta przycisku wysyłki (domyślnie „WYŚLIJ SPEAR-PHISHING”). */
    confirmLabel?: string;
    /** Odpowiedź w raporcie = `IP + nadawca` (np. `109.43.200.124 + M.WILK@PRIV.COM`), gdy IP nie jest osobną decyzją. */
    includeIpInAnswer?: boolean;
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
  /**
   * Przeskok czasu po wysyłce (wariant z nadawcą, tylko gdy podany): bez tekstów to sama wirująca tarcza;
   * `label`/`sublabel` to mały podpis. Bez `timeJump` klocek kończy etap zaraz po ładowaniu wysyłki,
   * a przeskok z godzinami gra mostek (`TimeJump` z `clockFrom`/`clock`, standard misji).
   */
  timeJump?: {
    label?: string;
    sublabel?: string;
    durationMs?: number;
  };
}

type Screen = 'ip' | 'sender' | 'load_send' | 'timejump';

// ---------------------------------------------------------------------------
// Czysta logika klocka (bez UI, testowana w tests/blocks.test.ts)
// ---------------------------------------------------------------------------

const DEFAULT_VPN_FEEDBACK = {
  ideal: 'Pomyślnie dopasowano adres IP! Ruch zamaskowany i dopuszczony przez filtry.',
  critical: 'Błąd: Adres IP nie znajduje się na białej liście dopuszczonych węzłów!'
};

/** Konfiguracja kroku IP po normalizacji (płaska M2 albo zagnieżdżona w `config.vpn`). */
export function resolveVpnStep(config: VpnRouterConfig) {
  const vpnSub = config.vpn || config;
  const targetIp = vpnSub.targetIp || '127.0.0.1';
  return {
    initialIp: vpnSub.initialIp || '127.0.0.1',
    targetIp,
    allowedIps: vpnSub.allowedIps && vpnSub.allowedIps.length > 0 ? vpnSub.allowedIps : [targetIp],
    /** Bez numeru krok IP jest bramką: zły adres blokuje przejście bez kary, dobry nie jest oceniany. */
    decisionNum: vpnSub.decisionNum,
    question: vpnSub.question || 'Dopasuj adres IP węzła wyjściowego VPN:',
    feedback: vpnSub.feedback || DEFAULT_VPN_FEEDBACK
  };
}

/** Próba połączenia: czy adres przechodzi i raport (tylko gdy krok IP ma `decisionNum`). */
export function vpnConnectResult(config: VpnRouterConfig, ip: string): { ok: boolean; report: DecisionReport | null } {
  const step = resolveVpnStep(config);
  const ok = ip === step.targetIp || step.allowedIps.includes(ip);
  const report: DecisionReport | null =
    step.decisionNum === undefined
      ? null
      : {
          num: step.decisionNum,
          question: step.question,
          answer: ip,
          optionId: ip,
          tier: ok ? 'ideal' : 'critical',
          feedback: ok ? step.feedback.ideal : step.feedback.critical
        };
  return { ok, report };
}

/** Raport decyzji kroku nadawcy; z `includeIpInAnswer` odpowiedź = `IP + nadawca`. */
export function vpnSenderReport(
  sender: NonNullable<VpnRouterConfig['sender']>,
  option: VpnSenderOption,
  ip: string
): DecisionReport {
  const answer = reportAnswerOf(option);
  return {
    num: sender.decisionNum,
    question: sender.question,
    optionId: option.id,
    answer: sender.includeIpInAnswer ? `${ip} + ${answer}` : answer,
    tier: option.tier,
    feedback: option.feedback,
    ...failFieldsOf(option, option.tier)
  };
}

/** Odrzucenie adresu nadawcy przez mentora (B2) albo `null`; odpowiedź jak w raporcie (`IP + nadawca`). */
export function vpnSenderRejection(
  sender: NonNullable<VpnRouterConfig['sender']>,
  option: VpnSenderOption,
  ip: string
): DecisionRejection | null {
  if (!option.reject) return null;
  const report = vpnSenderReport(sender, option, ip);
  return {
    num: report.num,
    question: report.question,
    optionId: option.id,
    answer: report.answer,
    tier: option.tier,
    mentorLine: option.reject.mentorLine,
    feedback: option.feedback
  };
}

/** Co po ekranie ładowania wysyłki: przeskok czasu tylko, gdy config go podaje. */
export function vpnAfterSend(config: VpnRouterConfig): 'timejump' | 'complete' {
  return config.timeJump ? 'timejump' : 'complete';
}

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
  const rejectDecision = useMissionStore((s) => s.rejectDecision);

  // Normalizacja konfiguracji (płaska lub zagnieżdżona w config.vpn)
  const step = resolveVpnStep(config);
  const initialIpStr = step.initialIp;
  const targetIpStr = step.targetIp;
  const allowedIps = step.allowedIps;
  const feedback = step.feedback;
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

  // Po udanym połączeniu (wariant bez kroku nadawcy) krótko pokazujemy sukces i sami przechodzimy dalej.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (!isConnected || hasSenderStep) return;
    const id = setTimeout(() => onCompleteRef.current(), 1300);
    return () => clearTimeout(id);
  }, [isConnected, hasSenderStep]);

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
    const { ok, report } = vpnConnectResult(config, currentIp);
    if (report) onDecision(report);

    if (ok) {
      sounds.playSuccess();
      setErrorMessage(null);
      if (hasSenderStep) {
        setScreen('sender');
      } else {
        setIsConnected(true);
      }
    } else {
      sounds.playAlarm();
      setErrorMessage(feedback.critical);
    }
  };

  const handleSender = () => {
    if (!sender || !config.sender) return;
    sounds.playClick();
    // B2: mentor odrzuca adres — zostajemy na wyborze, opcja się blokuje.
    const rejection = vpnSenderRejection(config.sender, sender, currentIp);
    if (rejection) {
      rejectDecision(rejection);
      setSenderId(null);
      return;
    }
    onDecision(vpnSenderReport(config.sender, sender, currentIp));

    if (sender.tier !== 'critical') {
      setScreen('load_send');
    }
  };

  const header = (sub: string, stepBadge: string, task: string, action?: React.ReactNode) => (
    <AppHeader
      icon={Wifi}
      accent={accent}
      title={config.title || '//VPN_ROUTING'}
      subtitle={sub}
      step={stepBadge}
      action={action}
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
          if (vpnAfterSend(config) === 'timejump') {
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
        label={config.timeJump?.label}
        sublabel={config.timeJump?.sublabel}
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
        <ChoiceCardGrid
          accent={accent}
          label="WYBIERZ ADRES"
          mono
          options={senderOptions}
          decisionNum={config.sender.decisionNum}
          selectedId={senderId}
          onSelect={(id) => {
            sounds.playClick();
            setSenderId(id);
          }}
        />
        <div className="pt-2 flex items-center justify-end">
          <button
            disabled={!senderId}
            onClick={handleSender}
            className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-lg active:scale-95"
            style={{ backgroundColor: accent, color: '#05090f', boxShadow: senderId ? `0 0 15px ${accent}66` : undefined }}
          >
            <Send size={14} />
            <span>{config.sender.confirmLabel || 'WYŚLIJ SPEAR-PHISHING'}</span>
          </button>
        </div>
      </div>
    );
  }

  // screen === 'ip'
  // Asysta AI: normalny przycisk w prawym górnym rogu (jak inne przyciski aplikacji), nie ukryty link.
  const aiButton =
    allowAiSync && !isConnected ? (
      <ConfirmButton
        accent={accent}
        label={isSyncingAi ? 'SYNCHRONIZACJA…' : 'ASYSTA AI'}
        enabled={!isSyncingAi}
        onClick={handleAiSync}
        icon={<Cpu size={15} className={isSyncingAi ? 'animate-pulse' : ''} />}
        className="w-auto px-4"
      />
    ) : undefined;

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header(
        hasSenderStep ? 'KROK 1/2 — MASKOWANIE ADRESU IP' : 'DOPASOWANIE ADRESU DO WĘZŁA PROXY',
        isConnected ? 'POŁĄCZONO' : isTargetMatched ? 'ZGODNY' : 'ROZŁĄCZONY',
        isConnected
          ? 'Połączenie zestawione. Za chwilę przejdziemy dalej…'
          : config.task || 'Wpisz w kratki (lub ustaw przyciskami +/-) adres z białej listy i połącz się z tunelem VPN.',
        aiButton
      )}

      {/* Biała lista: karta na pełną szerokość obszaru aplikacji, duże adresy */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-black/40 space-y-3 shrink-0">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Globe size={20} />
          <span className="text-sm font-bold uppercase tracking-wide">Dozwolone IP (Biała lista)</span>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))' }}>
          {allowedIps.map((ip) => (
            <div
              key={ip}
              className="px-4 py-2.5 rounded-lg bg-black/60 border border-gray-800 flex justify-between items-center gap-3"
            >
              <span className="font-mono text-emerald-400 font-black text-xl tracking-wider">{ip}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">SERWER PROXY</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 leading-snug">
          Filtry bezpieczeństwa celu natychmiast odrzucają ruch spoza zarejestrowanych węzłów sieci.
        </p>
      </div>

      {/* Bieżący adres IP + pola oktetów (+/-) */}
      <div className="p-4 rounded-xl border border-gray-800 bg-[#08101a] space-y-3 flex-1 min-h-0 flex flex-col justify-center">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="text-sm text-gray-300 font-bold uppercase tracking-wider">BIEŻĄCY ADRES WYJŚCIOWY VPN:</div>
          {isTargetMatched ? (
            <span
              className="px-3 py-1 rounded text-xs font-bold border flex items-center space-x-1"
              style={{ backgroundColor: '#10b98126', borderColor: '#10b981', color: '#10b981' }}
            >
              <Check size={14} />
              <span>PODSIEĆ ZGODNA</span>
            </span>
          ) : (
            <span className="text-xs text-gray-500 font-mono">[WPISZ LUB +/-]</span>
          )}
        </div>

        <div className="text-center">
          <div
            className="text-4xl font-black font-mono tracking-widest transition-all"
            style={{ color: isTargetMatched ? '#10b981' : '#fff' }}
          >
            {currentIp}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {octets.map((val, idx) => {
            const isOctetMatch = val === target[idx];
            return (
              <div key={idx} className="flex flex-col items-center space-y-1.5">
                <button
                  type="button"
                  disabled={isConnected}
                  onClick={() => setOctet(idx, 1)}
                  className="w-full py-1.5 rounded bg-[#0c1624] hover:bg-[#15253b] border border-gray-700 text-gray-300 text-base font-bold transition-all disabled:opacity-40 cursor-pointer"
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
                  className="w-full py-3 bg-black/70 border-2 rounded text-center font-black text-3xl font-mono transition-all outline-none focus:ring-1 select-text"
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
                  className="w-full py-1.5 rounded bg-[#0c1624] hover:bg-[#15253b] border border-gray-700 text-gray-300 text-base font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg border border-red-500/50 bg-red-950/30 flex items-center space-x-2 text-sm text-red-300 animate-in fade-in">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isConnected && !hasSenderStep && (
          <div className="p-3 rounded-lg border border-emerald-500/50 bg-emerald-950/30 flex items-center space-x-2 text-sm text-emerald-300 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{feedback.ideal}</span>
          </div>
        )}
      </div>

      {/* Dolny przycisk akcji */}
      <div className="flex items-center justify-end shrink-0">
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
          <span className="text-xs font-bold tracking-widest animate-pulse" style={{ color: accent }}>
            TUNEL AKTYWNY — PRZEKAZYWANIE…
          </span>
        )}
      </div>
    </div>
  );
};
