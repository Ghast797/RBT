import React, { useState, useEffect } from 'react';
import { Radio, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { BotnetMonitorConfig } from './types';

interface NodeStatus {
  id: string;
  name: string;
  role: string;
  infected: boolean;
}

const DEFAULT_NODES: NodeStatus[] = [
  { id: '1', name: 'CF-WRK-HR01', role: 'Kadry (Ofiara 0)', infected: true },
  { id: '2', name: 'CF-WRK-HR02', role: 'Kadry', infected: true },
  { id: '3', name: 'CF-WRK-ACC01', role: 'Księgowość', infected: true },
  { id: '4', name: 'CF-WRK-LOG01', role: 'Dyspozytornia', infected: true },
  { id: '5', name: 'CF-SRV-MAIL', role: 'Serwer Pocztowy', infected: true },
  { id: '6', name: 'CF-SRV-APP01', role: 'Baza Danych', infected: true },
  { id: '7', name: 'CF-WRK-ENG01', role: 'Inżynieria Rurociągów', infected: true },
  { id: '8', name: 'CF-WRK-ENG02', role: 'Inżynieria Przesyłu', infected: true },
  { id: '9', name: 'CF-GW-MAIN', role: 'Brama Główna', infected: true },
  { id: '10', name: 'CF-SCADA-CTRL', role: 'Kontroler SCADA', infected: true },
  { id: '11', name: 'CF-SEC-SOC', role: 'Stacja Bezpieczeństwa', infected: false },
  { id: '12', name: 'CF-SRV-BACKUP', role: 'Izolowany Backup', infected: false }
];

export const BotnetMonitorApp: React.FC<BlockProps<BotnetMonitorConfig>> = ({
  config,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';

  const [percentage, setPercentage] = useState(0);
  const [activeStep, setActiveStep] = useState<'alert' | 'telemetry'>('alert');

  useEffect(() => {
    if (activeStep !== 'telemetry') return;

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= 82) {
        current = 82;
        clearInterval(interval);
        sounds.playSuccess();
      }
      setPercentage(current);
    }, 45);

    return () => clearInterval(interval);
  }, [activeStep]);

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <div className="border-b pb-3 flex items-center justify-between" style={{ borderColor: `${accent}4d` }}>
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded border"
            style={{ backgroundColor: `${accent}26`, borderColor: accent, color: accent }}
          >
            <Radio size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//MONITOR_BOTNETU // STATUS INFEKCJI</h2>
            <p className="text-[11px]" style={{ color: accent }}>
              Telemetria formowania sieci maszyn zombie w infrastrukturze {config.targetCompany}
            </p>
          </div>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded border font-mono"
          style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
        >
          LIVE TELEMETRY
        </span>
      </div>

      {activeStep === 'alert' && (
        <div className="flex flex-col justify-between h-full space-y-4 my-auto">
          <div className="p-6 rounded-xl border border-red-500/60 bg-red-950/20 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 mx-auto flex items-center justify-center text-red-400 animate-pulse">
              <AlertOctagon size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              MALWARE ZOSTAŁ AKTYWOWANY!
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              Pracownik działu kadr otworzył link do ankiety. Robak 0-day bezszelestnie wstrzyknął proces
              w systemie operacyjnym i rozpoczął skanowanie lokalnej podsieci w poszukiwaniu podatnych maszyn.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveStep('telemetry');
              }}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-all"
              style={{ boxShadow: '0 0 20px rgba(239,68,68,0.5)' }}
            >
              <span>OTWÓRZ MONITOR SIECI BOTNETU</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {activeStep === 'telemetry' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Stopień penetracji sieci:</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center space-x-2">
                <span>{percentage}%</span>
                {percentage === 82 && <CheckCircle2 size={18} className="text-emerald-400" />}
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-emerald-500 h-full transition-all duration-100"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Aktywne maszyny zombie:</span>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {Math.round((percentage / 100) * 12)} / 12
              </div>
              <span className="text-[10px] text-gray-400">POD KONTROLĄ C&amp;C</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Reakcja systemów IDS:</span>
              <div className="text-2xl font-bold font-mono text-purple-400">0 ALARMÓW</div>
              <span className="text-[10px] text-emerald-400">ŁADUNEK 0-DAY NIEWYKRYTY</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold text-gray-300 uppercase tracking-wide">Topologia węzłów sieciowych:</span>
              <span>10 ZAINFEKOWANYCH | 2 ZABEZPIECZONE</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DEFAULT_NODES.map((node, index) => {
                const isNodeInfected = node.infected && percentage >= (index + 1) * 7;
                return (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      isNodeInfected
                        ? 'border-emerald-500/60 bg-emerald-950/20 text-white'
                        : 'border-gray-800 bg-black/40 text-gray-500'
                    }`}
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="font-mono font-bold truncate">{node.name}</div>
                      <div className="text-[9px] text-gray-400 truncate">{node.role}</div>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ml-1.5 ${
                        isNodeInfected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={percentage < 82}
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-xs transition-all ${
                percentage >= 82
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              style={percentage >= 82 ? { boxShadow: '0 0 20px rgba(16,185,129,0.5)' } : undefined}
            >
              <span>ZAKOŃCZ OPERACJĘ I ZAMELDUJ MENTOROWI</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
