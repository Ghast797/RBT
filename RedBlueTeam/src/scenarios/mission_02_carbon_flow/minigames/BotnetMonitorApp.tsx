import React, { useState, useEffect, useMemo } from 'react';
import { Radio, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { AppHeader } from '../../../engine/components/AppHeader';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import { ConfirmButton } from '../../../engine/components/ConfirmButton';
import { summarizeBotnet } from './botnet';
import type { BotnetMonitorConfig } from './types';

export const BotnetMonitorApp: React.FC<BlockProps<BotnetMonitorConfig>> = ({
  config,
  onComplete
}) => {
  // Akcent = kolor kafelka //MONITOR_BOTNETU na pulpicie (jak w Misji 1).
  const accent = '#3b82f6';

  const { targetPercentage, totalWorkstations } = config;
  const { infectedCount, secureCount, nodes } = useMemo(() => summarizeBotnet(config), [config]);

  const [percentage, setPercentage] = useState(0);
  const [activeStep, setActiveStep] = useState<'alert' | 'telemetry'>('alert');

  useEffect(() => {
    if (activeStep !== 'telemetry') return;

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= targetPercentage) {
        current = targetPercentage;
        clearInterval(interval);
        sounds.playSuccess();
      }
      setPercentage(current);
    }, 45);

    return () => clearInterval(interval);
  }, [activeStep, targetPercentage]);

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      <AppHeader
        icon={Radio}
        accent={accent}
        title="//MONITOR_BOTNETU"
        subtitle={`Telemetria sieci maszyn zombie w infrastrukturze ${config.targetCompany}`}
        step="LIVE TELEMETRY"
        task={
          activeStep === 'alert'
            ? 'Kliknij PODGLĄD, aby zobaczyć, co zrobił robak.'
            : 'Obserwuj infekcję. Gdy się zakończy, zamelduj mentorowi.'
        }
      />

      {activeStep === 'alert' && (
        <div className="flex flex-col justify-between flex-1 space-y-4">
          <div className="p-6 rounded-xl border border-red-500/60 bg-red-950/20 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 mx-auto flex items-center justify-center text-red-400 animate-pulse">
              <AlertOctagon size={28} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              MALWARE ZOSTAŁ AKTYWOWANY
            </h3>
            <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
              ROBAK – MALWARE ZOSTAŁ AKTYWOWANY. KOMPUTERY ZOMBIE SĄ TWORZONE
            </p>
          </div>

          <div className="flex justify-end">
            <ConfirmButton
              accent={accent}
              label="PODGLĄD"
              onClick={() => {
                sounds.playClick();
                setActiveStep('telemetry');
              }}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}

      {activeStep === 'telemetry' && (
        <div className="flex flex-col justify-between h-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-1">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Stopień penetracji sieci:</span>
              <div className="text-2xl font-bold font-mono text-white flex items-center space-x-2">
                <span>{percentage}%</span>
                {percentage === targetPercentage && <CheckCircle2 size={18} className="text-white" />}
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-blue-500 h-full transition-all duration-100"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-1">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Aktywne maszyny zombie:</span>
              <div className="text-2xl font-bold font-mono text-white">
                {Math.round((percentage / 100) * totalWorkstations)} / {totalWorkstations}
              </div>
              <span className="text-xs text-gray-400">POD KONTROLĄ C&amp;C</span>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-800 bg-[#08101a] space-y-1">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Reakcja systemów IDS:</span>
              <div className="text-2xl font-bold font-mono text-white">0 ALARMÓW</div>
              <span className="text-xs text-white">ŁADUNEK 0-DAY NIEWYKRYTY</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold text-gray-300 uppercase tracking-wide">Topologia węzłów sieciowych:</span>
              <span>{infectedCount} ZAINFEKOWANYCH | {secureCount} ZABEZPIECZONE</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {nodes.map((node) => {
                const isNodeInfected = node.infected && percentage >= node.litAt;
                return (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      isNodeInfected
                        ? 'border-blue-500/60 bg-blue-950/20 text-white'
                        : 'border-gray-800 bg-black/40 text-gray-500'
                    }`}
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="font-mono font-bold truncate">{node.name}</div>
                      <div className="text-[0.6875rem] text-gray-400 truncate">{node.role}</div>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ml-1.5 ${
                        isNodeInfected ? 'bg-blue-400 animate-pulse' : 'bg-gray-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <ConfirmButton
              accent={accent}
              label="ZAKOŃCZ OPERACJĘ I ZAMELDUJ MENTOROWI"
              enabled={percentage >= targetPercentage}
              onClick={() => {
                sounds.playSuccess();
                onComplete();
              }}
              className="w-auto px-6"
            />
          </div>
        </div>
      )}
    </div>
  );
};
