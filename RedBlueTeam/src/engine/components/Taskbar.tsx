import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert,
  Coins,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useMissionStore, type WindowId } from '../store/useMissionStore';
import { renderAppIcon } from '../registry/appRegistry';
import { sounds } from '../audio/soundEffects';

export const Taskbar: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const {
    activeMission,
    activeApp,
    openApp,
    closeApp,
    notificationBadges,
    score,
    btcReward
  } = useMissionStore();

  const [time, setTime] = useState<string>('00:00:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pl-PL'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const apps = activeMission.desktopApps || [];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-11 bg-[#05090d]/95 border-t border-[#00ff66]/30 backdrop-blur-lg z-50 flex items-center justify-between px-3 font-mono text-xs select-none">
      {/* Left: OS Menu & Quick Launchers */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#00ff66]/20 border border-[#00ff66]/50 rounded text-[#00ff66] font-bold tracking-wider">
          <ShieldAlert size={14} className="text-[#00ff66] animate-pulse" />
          <span>{activeMission.mission.systemOs || '//HACKERS.OS'}</span>
        </div>

        {/* Running / Available Apps */}
        <div className="flex items-center space-x-1 ml-2">
          {apps.map((app) => {
            const isActive = activeApp === app.id;
            const notif = notificationBadges[app.id] || 0;

            return (
              <button
                key={app.id}
                onClick={() => {
                  if (isActive) {
                    closeApp();
                  } else {
                    openApp(app.id as WindowId);
                  }
                }}
                className={`relative flex items-center space-x-1.5 px-2.5 py-1 rounded border transition-all ${
                  isActive
                    ? 'bg-[#00ff66]/25 border-[#00ff66] text-[#00ff66] shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-[#0e1620] border-[#00ff66]/30 text-[#d1fae5]/80 hover:bg-[#00ff66]/10'
                }`}
              >
                <span>{renderAppIcon(app.icon, 15)}</span>
                <span className="hidden md:inline text-[11px]">{app.label}</span>
                {notif > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3366] text-[9px] font-bold text-white shadow-[0_0_6px_#ff3366]">
                    {notif}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Mission Stats, Wallet & Clock */}
      <div className="flex items-center space-x-3 text-[#00ff66]/90">
        {/* BTC Reward */}
        <div className="hidden md:flex items-center space-x-1 px-2 py-0.5 rounded bg-[#091119] border border-[#00ff66]/30 text-[11px] text-[#ffaa00]">
          <Coins size={13} />
          <span>{btcReward.toFixed(2)} BTC</span>
        </div>

        {/* Mission Score */}
        <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded bg-[#091119] border border-[#00ff66]/30 text-[11px]">
          <span className="text-[#00ff66]/60">WYNIK:</span>
          <span className={`font-bold ${score >= 80 ? 'text-[#00ff66]' : 'text-[#ff3366]'}`}>{score}%</span>
        </div>

        {/* Clock */}
        <div className="px-2 py-0.5 rounded bg-[#091119] border border-[#00ff66]/30 text-[11px] tracking-widest text-[#00ff66]">
          {time}
        </div>

        {/* Audio / Ambient Mute Toggle */}
        <button
          onClick={() => {
            const next = sounds.toggleMute();
            setIsMuted(next);
          }}
          className="p-1 rounded bg-[#091119] border border-[#00ff66]/30 text-[#00ff66] hover:bg-[#00ff66]/15 transition-all cursor-pointer"
          title={isMuted ? "Włącz dźwięk i ambient" : "Wycisz dźwięk i ambient"}
        >
          {isMuted ? <VolumeX size={14} className="text-gray-500" /> : <Volume2 size={14} className="animate-pulse" />}
        </button>
      </div>
    </div>
  );
};
