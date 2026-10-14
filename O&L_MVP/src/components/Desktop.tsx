import React from 'react';
import { 
  ShieldAlert,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  MessageSquareCode,
  HardDrive
} from 'lucide-react';
import { useMissionStore, type WindowId } from '../store/useMissionStore';
import { BootSequence } from './BootSequence';
import { ChatApp } from './apps/ChatApp';
import { AppRenderer, renderAppIcon } from './apps/appRegistry';
import { sounds } from '../utils/soundEffects';

export const Desktop: React.FC = () => {
  const {
    activeMission,
    bootStage,
    activeApp,
    openApp,
    unlockedIcons,
    notificationBadges,
    chatAvailableChoices,
    isChatAttentionActive,
    triggerChatAttention,
    systemDate,
    systemTime,
    hasUsbInserted,
    isUsbEjected,
    resetGame
  } = useMissionStore();

  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isChatAttentionActive && typeof window !== 'undefined' && window.innerWidth < 768) {
      chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChatAttentionActive]);

  const [isMuted, setIsMuted] = React.useState<boolean>(sounds.getMuted());

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // If still in incoming call, intro or bios boot, render BootSequence
  if (bootStage !== 'desktop') {
    return <BootSequence />;
  }

  // Desktop tiles defined dynamically by the active mission
  const desktopTiles = activeMission.desktopApps || [];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#03060a] select-none font-mono flex flex-col justify-between p-3">
      {/* Background Ambience & Scanlines */}
      <div className="absolute inset-0 crt-scanlines z-50 pointer-events-none opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(#00ff6610_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Main Dual-Screen Workspace (Left Monitor + Right Chat Monitor) */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 lg:gap-4 min-h-0 relative z-10 pb-2">
        {/* LEFT / CENTER MONITOR: Curved Main Terminal (Single-Window Focus) */}
        <div className="flex-1 min-h-0 relative flex flex-col bg-[#050b10]/95 border-2 border-[#00ff66] rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(0,255,102,0.25)]">
          {/* Top Header of Curved Terminal */}
          <div className="px-4 py-2 border-b border-[#00ff66]/30 bg-[#07131a] flex items-center justify-between text-xs text-[#00ff66]">
            <div className="flex items-center space-x-2">
              <ShieldAlert size={14} className="animate-pulse" />
              <span className="font-bold tracking-widest">{activeMission.mission.systemOs || '//HACKERS.OS'}</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <span className="text-[#00ff66]/70">CEL: {activeMission.mission.targetCompany?.toUpperCase()}</span>
              <span className="font-bold text-[#00ff66]">{systemTime !== '00:00' ? systemTime : systemDate}</span>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="flex-1 p-4 overflow-hidden relative flex flex-col justify-between">
            {/* Faint //HACKERS watermark in background */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-5">
              <ShieldAlert size={260} className="text-[#00ff66]" />
              <span className="text-5xl font-black tracking-widest text-[#00ff66] mt-2">
                //HACKERS
              </span>
            </div>

            {/* Content: Either Active Tool OR Desktop Icon Grid */}
            <div className="flex-1 relative z-10 flex flex-col min-h-0">
              {activeApp !== null ? (
                <AppRenderer componentId={activeApp} />
              ) : (
                /* Dynamic Desktop Icon Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 my-auto">
                  {desktopTiles.map((tile) => {
                    const unlockKey = tile.requiredUnlockId || tile.id;
                    if (tile.unlockedOnly && !unlockedIcons.includes(unlockKey)) {
                      return null;
                    }

                    const isChatActiveTile = tile.isChatFocus && (chatAvailableChoices.length > 0 || isChatAttentionActive);
                    const badgeCount = tile.isChatFocus 
                      ? (chatAvailableChoices.length > 0 ? (notificationBadges['chat'] || 1) : notificationBadges['chat'])
                      : notificationBadges[tile.id];

                    return (
                      <div
                        key={tile.id}
                        onClick={() => {
                          if (tile.isChatFocus) {
                            triggerChatAttention();
                          } else {
                            openApp(tile.componentId as WindowId);
                          }
                        }}
                        className={`group flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 relative ${
                          isChatActiveTile ? 'scale-105' : ''
                        }`}
                      >
                        {/* Tile Icon with L-shaped colored brackets */}
                        <div
                          className={`w-18 h-18 rounded-lg flex items-center justify-center relative transition-transform group-hover:scale-105 ${
                            isChatActiveTile ? 'ring-2 ring-[#00ff66] shadow-[0_0_20px_#00ff66] animate-pulse' : ''
                          }`}
                          style={{
                            backgroundColor: `${tile.color}15`,
                            border: `2px solid ${tile.color}`,
                            boxShadow: `0 0 15px ${tile.color}35`
                          }}
                        >
                          {/* Corner brackets */}
                          <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2"
                            style={{ borderColor: tile.color }}
                          />
                          <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2"
                            style={{ borderColor: tile.color }}
                          />
                          <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2"
                            style={{ borderColor: tile.color }}
                          />
                          <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2"
                            style={{ borderColor: tile.color }}
                          />

                          <span style={{ color: tile.color }}>
                            {renderAppIcon(tile.icon, 26)}
                          </span>

                          {/* Notification Badge */}
                          {badgeCount && badgeCount > 0 ? (
                            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ff3366] text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_#ff3366] animate-bounce">
                              {badgeCount}
                            </span>
                          ) : null}
                        </div>

                        {/* Monospace Label */}
                        <span className="text-[11px] font-bold text-[#d1fae5] mt-2.5 text-center leading-tight tracking-wider group-hover:text-[#00ff66] transition-colors">
                          {tile.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Direct chat guidance banner on desktop when Byte_Master is waiting */}
              {activeApp === null && chatAvailableChoices.length > 0 && (
                <div
                  onClick={triggerChatAttention}
                  className="mx-auto mb-2 max-w-lg px-4 py-2 rounded-xl bg-[#00ff66]/10 border-2 border-[#00ff66]/60 hover:border-[#00ff66] hover:bg-[#00ff66]/20 text-[#00ff66] cursor-pointer transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)] animate-pulse flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5 text-xs font-bold">
                    <MessageSquareCode size={18} className="text-[#00ff66] shrink-0" />
                    <span>BYTE_MASTER czeka na Twoją odpowiedź na prawym monitorze!</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-black text-[#00ff66] group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                    <span>POKAŻ</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              )}
            </div>

            {/* Directional Callout Banner pointing to Right Monitor when chat attention is triggered */}
            {isChatAttentionActive && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2 z-50 flex items-center space-x-3 bg-[#06141d]/95 border-2 border-[#00ff66] text-[#00ff66] px-5 py-3.5 rounded-xl shadow-[0_0_40px_rgba(0,255,102,0.9)] font-mono text-xs font-black animate-bounce pointer-events-none">
                <MessageSquareCode size={22} className="text-[#00ff66] animate-pulse shrink-0" />
                <div className="flex flex-col">
                  <span className="text-white text-glow-green">CZAT Z BYTE_MASTEREM</span>
                  <span className="text-[11px] text-[#00ff66]">SPRAWDŹ PRAWY MONITOR ➔</span>
                </div>
                <ArrowRight size={24} className="text-[#00ff66] animate-pulse shrink-0" />
              </div>
            )}

            {/* Bottom Monitor Frame Status & USB Desk Plug */}
            <div className="pt-2 border-t border-[#00ff66]/20 flex items-center justify-between text-[11px] text-[#00ff66]/70 relative z-10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
                <span className="font-bold">{activeMission.mission.systemOs || '//HACKERS.OS'}</span>
              </div>

              {/* Physical USB Stick Icon on Desk */}
              {(hasUsbInserted || isUsbEjected) && (
                <div className="px-3 py-1 rounded bg-purple-950/60 border border-purple-500 text-purple-300 flex items-center space-x-2 text-[10px] font-bold animate-pulse">
                  <HardDrive size={13} />
                  <span>[USB PODŁĄCZONE DO STANOWISKA HAKERA]</span>
                </div>
              )}

              <div className="tracking-widest font-bold text-[#00ff66]">
                {systemDate}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT MONITOR: Dedicated Persistent Chat with Byte_Master */}
        <div 
          ref={chatContainerRef}
          className={`w-full md:w-72 lg:w-80 xl:w-96 shrink-0 h-64 md:h-full flex flex-col min-h-0 transition-all duration-300 relative ${
            isChatAttentionActive
              ? 'scale-[1.02] ring-4 ring-[#00ff66] shadow-[0_0_50px_rgba(0,255,102,0.9)] rounded-xl z-30'
              : chatAvailableChoices.length > 0
              ? 'ring-2 ring-[#00ff66]/50 shadow-[0_0_25px_rgba(0,255,102,0.2)] rounded-xl'
              : ''
          }`}
        >
          {isChatAttentionActive && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 bg-[#00ff66] text-[#05080c] text-[10px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_20px_#00ff66] animate-pulse flex items-center space-x-1 whitespace-nowrap">
              <span>▲ AKTYWNA SESJA CZATU ▲</span>
            </div>
          )}
          <ChatApp />
        </div>
      </div>

      {/* OS Bottom Controls Bar */}
      <div className="h-9 px-3 bg-[#060e14] border border-[#00ff66]/30 rounded-lg flex items-center justify-between text-xs text-[#00ff66] relative z-20">
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="font-bold text-[#00ff66]">{activeMission.mission.title}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">{activeMission.mission.subTitle}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-[#00ff66]/20 text-[#00ff66] transition-colors"
            title={isMuted ? 'Wyłącz wyciszenie' : 'Wycisz dźwięki'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={resetGame}
            className="p-1 rounded hover:bg-[#ff3366]/20 text-gray-400 hover:text-[#ff3366] transition-colors"
            title="Zrestartuj misję od zera"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
