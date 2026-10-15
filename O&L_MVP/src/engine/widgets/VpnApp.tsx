import React, { useState } from 'react';
import { 
  Wifi, 
  Globe, 
  CheckCircle2, 
  Send, 
  RefreshCw,
  Check
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { sounds } from '../audio/soundEffects';

interface SenderOption {
  id: string;
  address: string;
  points: number;
  isCorrect: boolean;
  isCriticalError?: boolean;
  feedback: string;
}

// Order: alex@priv.com, newrapgood@commercial.biz, m.wilk@priv.com (Correct is NOT first!)
const SENDER_OPTIONS: SenderOption[] = [
  {
    id: 'sender_alex',
    address: 'alex@priv.com',
    points: 4.0,
    isCorrect: false,
    feedback: 'Niezgodność adresu nadawcy z podpisem pod mailem ("Michał Wilk"), co może zaalarmować czujnego pracownika.'
  },
  {
    id: 'sender_spam',
    address: 'newrapgood@commercial.biz',
    points: 0.0,
    isCorrect: false,
    isCriticalError: true,
    feedback: 'Domena o fatalnej reputacji, brak rekordów SPF/DKIM powiązanych z kandydatem. Wiadomość trafia do spamu.'
  },
  {
    id: 'sender_wilk',
    address: 'm.wilk@priv.com',
    points: 11.11,
    isCorrect: true,
    feedback: 'Pełna spójność tożsamości nadawcy z nazwiskiem kandydata w treści i załączniku. Nie budzi podejrzeń rekrutera.'
  }
];

export const VpnApp: React.FC = () => {
  const { 
    recordChoice, 
    customState, 
    setCustomState,
    advanceMission4Story 
  } = useMissionStore();

  const TARGET_IP = '109.43.200.124';

  const [octet1, setOctet1] = useState<number>(customState.m4_vpn_o1 ?? 106);
  const [octet2, setOctet2] = useState<number>(customState.m4_vpn_o2 ?? 55);
  const [octet3, setOctet3] = useState<number>(customState.m4_vpn_o3 ?? 202);
  const [octet4, setOctet4] = useState<number>(customState.m4_vpn_o4 ?? 120);

  const [selectedSenderId, setSelectedSenderId] = useState<string | null>(customState.m4_sender_id || null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const currentIp = `${octet1}.${octet2}.${octet3}.${octet4}`;
  const isIpCorrect = currentIp === TARGET_IP;
  const selectedSender = SENDER_OPTIONS.find(s => s.id === selectedSenderId);

  const handleSendCampaign = async () => {
    if (!selectedSender) return;

    sounds.playClick();
    setIsDeploying(true);

    await new Promise((res) => setTimeout(res, 2200));

    sounds.playSuccess();
    setIsDeploying(false);
    setCustomState('m4_vpn_sent', true);
    setCustomState('m4_sender_id', selectedSender.id);
    setCustomState('m4_vpn_o1', octet1);
    setCustomState('m4_vpn_o2', octet2);
    setCustomState('m4_vpn_o3', octet3);
    setCustomState('m4_vpn_o4', octet4);

    // Evaluate choice 7
    let outcome: 'ideal' | 'suboptimal' | 'critical' = 'ideal';
    let isStepCorrect = false;
    let penalty = 0;
    let btcPenalty = 0;
    let details = '';

    if (!isIpCorrect) {
      outcome = 'critical';
      isStepCorrect = false;
      penalty = 11.11;
      btcPenalty = -0.89;
      details = 'Nieprawidłowy routing IP wywołał natychmiastowy alarm geolokalizacyjny w systemie ochrony poczty Energy Rock!';
    } else if (selectedSender.isCriticalError) {
      outcome = 'critical';
      isStepCorrect = false;
      penalty = 11.11;
      btcPenalty = -0.89;
      details = selectedSender.feedback;
    } else if (selectedSender.isCorrect) {
      outcome = 'ideal';
      isStepCorrect = true;
      penalty = 0;
      btcPenalty = 0;
      details = 'Zapewnia pełną spójność tożsamości kandydata oraz omija reguły geolokalizacyjne filtrowania poczty.';
    } else {
      // Suboptimal (e.g. alex@priv.com with correct IP)
      outcome = 'suboptimal';
      isStepCorrect = false;
      penalty = 7.11;
      btcPenalty = -0.45;
      details = selectedSender.feedback;
    }

    recordChoice({
      num: 7,
      question: 'Ukrycie tożsamości / VPN nadawcy:',
      answer: `${selectedSender.address} (IP: ${currentIp})`,
      isCorrect: isStepCorrect,
      outcome,
      btcPenalty,
      details
    }, penalty);

    if (outcome !== 'critical') {
      advanceMission4Story('vpn_done');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border-b border-[#a855f7]/30 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7]">
            <Wifi size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//VPN_ROUTING // MASKOWANIE TOŻSAMOŚCI</h2>
            <p className="text-[11px] text-[#a855f7]">KROK 7/9: DOPASOWANIE PODSIECI I KONTO POCZTOWE NADAWCY</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#a855f7]/15 border border-[#a855f7]/50 text-[#c084fc]">
          KROK 7
        </span>
      </div>

      {/* Task 1: Subnet / IP Matcher */}
      <div className="p-4 rounded-xl bg-[#08101a] border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white flex items-center space-x-2">
            <Globe size={15} className="text-[#a855f7]" />
            <span>ZADANIE 1: DOPASOWANIE ADRESU IP DO PODSIECI DOCELOWEJ:</span>
          </div>
          <span className="text-[10px] text-gray-400">
            WYMAGANA PODSIEĆ ENERGY ROCK: <strong className="text-[#c084fc] font-bold">{TARGET_IP}</strong>
          </span>
        </div>

        {/* Current IP display with indicator */}
        <div className="p-3 rounded-lg bg-black/60 border border-gray-800 flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-bold">WYJŚCIOWY ADRES IP TUNELU:</span>
            <span className={`text-base font-bold tracking-widest ${
              isIpCorrect ? 'text-[#10b981]' : 'text-[#f59e0b]'
            }`}>
              {currentIp}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isIpCorrect ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 border border-[#10b981] text-[#10b981] flex items-center space-x-1">
                <Check size={12} />
                <span>PODSIEĆ ZGODNA (109.43.200.124)</span>
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-mono">
                [WYMAGA SKORYGOWANIA PRZYCISKAMI +/-]
              </span>
            )}
          </div>
        </div>

        {/* Functional Octet Controls with +/- buttons */}
        <div className="grid grid-cols-4 gap-3 text-center text-xs">
          {[
            { val: octet1, set: setOctet1, label: 'OKTET 1' },
            { val: octet2, set: setOctet2, label: 'OKTET 2' },
            { val: octet3, set: setOctet3, label: 'OKTET 3' },
            { val: octet4, set: setOctet4, label: 'OKTET 4' }
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-gray-800">
              <span className="text-[10px] text-gray-500 font-bold block mb-1">{item.label}</span>
              <div className="text-base font-bold text-white mb-2 font-mono">{item.val}</div>
              <div className="flex justify-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playKeypress();
                    item.set(v => Math.max(0, v - 1));
                  }}
                  className="w-8 h-7 bg-gray-800 hover:bg-[#a855f7] hover:text-white rounded text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                  title="Zmniejsz o 1"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playKeypress();
                    item.set(v => Math.min(255, v + 1));
                  }}
                  className="w-8 h-7 bg-gray-800 hover:bg-[#a855f7] hover:text-white rounded text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                  title="Zwiększ o 1"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task 2: Sender Address */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-gray-300">
          <span>ZADANIE 2: WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA DO HR:</span>
          {selectedSender && (
            <span className="text-[10px] text-[#c084fc]">
              WYBRANO: {selectedSender.address}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SENDER_OPTIONS.map((sender) => {
            const isSelected = selectedSenderId === sender.id;
            return (
              <button
                key={sender.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedSenderId(sender.id);
                }}
                className={`p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#a855f7] bg-[#a855f7]/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'border-gray-800 bg-[#08101a] text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-mono">{sender.address}</span>
                  {isSelected && <CheckCircle2 size={15} className="text-[#a855f7]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action and Deployment Sequence */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {selectedSenderId
            ? 'Wysyłka e-maila uruchomi proces otwarcia załącznika przez rekrutera Energy Rock.'
            : 'Dopasuj adres IP i wybierz adres nadawcy.'}
        </span>

        <button
          disabled={!selectedSenderId || isDeploying}
          onClick={handleSendCampaign}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedSenderId && !isDeploying
              ? 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isDeploying ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>TRANSMISJA PRZEZ TUNEL VPN...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>ZESTAW TUNEL VPN I WYŚLIJ SPEAR-PHISHING</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
