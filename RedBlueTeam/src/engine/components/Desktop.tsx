import React, { useState } from 'react';
import { 
  ShieldAlert,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  MessageSquareCode,
  HardDrive,
  HelpCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Play
} from 'lucide-react';
import { useMissionStore, type WindowId } from '../store/useMissionStore';
import { BootSequence } from './BootSequence';
import { ChatApp } from '../apps/ChatApp';
import { AppHost, renderAppIcon } from '../registry/appRegistry';
import { sounds } from '../audio/soundEffects';

export const Desktop: React.FC = () => {
  const {
    activeMission,
    bootStage,
    activeApp,
    openApp,
    closeApp,
    unlockedIcons,
    notificationBadges,
    highlightedTileId,
    chatAvailableChoices,
    isChatAttentionActive,
    triggerChatAttention,
    systemDate,
    systemTime,
    hasUsbInserted,
    isUsbEjected,
    isDetectedModalOpen,
    detectionReason,
    isRetryModalOpen,
    openRetryModal,
    closeRetryModal,
    retryFromScratch,
    retryFromChoices
  } = useMissionStore();

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isChatAttentionActive && typeof window !== 'undefined' && window.innerWidth < 768) {
      chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChatAttentionActive]);

  React.useEffect(() => {
    if (bootStage === 'desktop') {
      sounds.startAmbient(0.05);
    }
  }, [bootStage]);

  const [isMuted, setIsMuted] = React.useState<boolean>(sounds.getMuted());

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Dynamic context-sensitive guidance
  const getGuidanceText = () => {
    if (activeApp === null) {
      if (chatAvailableChoices.length > 0) {
        return "Sprawdź prawy monitor i odpowiedz wspólnikowi BYTE_MASTER.";
      }
      const hasBadges = Object.values(notificationBadges).some((count) => count > 0);
      if (hasBadges) {
        return "Uruchom aplikację oznaczoną czerwonym powiadomieniem [1] na pulpicie.";
      }
      return "Wybierz narzędzie z pulpitu, aby przejść do kolejnej fazy operacji.";
    }
    return "TRYB SWOBODNEJ DECYZJI: Przeanalizuj dane w otwartym narzędziu i podejmij właściwą decyzję. Uważaj – błędy obniżą wypłatę BTC lub doprowadzą do wykrycia!";
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

              {/* VR Style Blue Context Help Button */}
              <button
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className={`ml-2 px-2 py-0.5 rounded flex items-center space-x-1 font-bold text-[10px] tracking-wider transition-all border ${
                  isHelpOpen
                    ? 'bg-[#00f0ff] text-[#050b10] border-[#00f0ff] shadow-[0_0_10px_#00f0ff]'
                    : 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/50 hover:bg-[#00f0ff]/30'
                }`}
                title="Wskazówka taktyczna misji"
              >
                <HelpCircle size={12} />
                <span>WSKAZÓWKA [?]</span>
              </button>

            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-[#00ff66]/70">CEL: {activeMission.mission.targetCompany?.toUpperCase()}</span>
              <span className="font-bold text-[#00ff66]">{systemTime !== '00:00' ? systemTime : systemDate}</span>
              <button
                onClick={toggleMute}
                className="p-1 rounded text-[#00ff66]/70 hover:text-[#00ff66] transition-colors border border-transparent hover:border-[#00ff66]/40 cursor-pointer ml-1"
                title={isMuted ? "Włącz dźwięk i ambient" : "Wycisz dźwięk i ambient"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="animate-pulse" />}
              </button>

              {/* Zamknięcie aplikacji (jak w systemie) — powrót na pulpit, stan zostaje zapamiętany */}
              {activeApp !== null && (
                <button
                  onClick={closeApp}
                  className="p-1 rounded border border-[#ff3366]/50 bg-[#ff3366]/10 text-[#ff3366] hover:bg-[#ff3366] hover:text-white transition-colors cursor-pointer"
                  title="Zamknij aplikację (postęp zostanie zapamiętany)"
                  aria-label="Zamknij aplikację"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Context Help Banner */}
          {isHelpOpen && (
            <div className="px-4 py-2 bg-gradient-to-r from-blue-950/80 via-cyan-950/90 to-blue-950/80 border-b border-[#00f0ff]/40 text-blue-200 text-xs flex items-center justify-between shadow-inner animate-in fade-in slide-in-from-top-1 duration-150 relative z-20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping shrink-0" />
                <span className="font-bold text-[#00f0ff]">PODPOWIEDŹ OPERACYJNA:</span>
                <span className="text-gray-200">{getGuidanceText()}</span>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-gray-400 hover:text-white ml-2 p-0.5 rounded"
              >
                <X size={14} />
              </button>
            </div>
          )}

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
              <AppHost />
              {activeApp === null && (
                /* Dynamic Desktop Icon Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 my-auto">
                  {desktopTiles.map((tile) => {
                    const unlockKey = tile.requiredUnlockId || tile.id;
                    if (tile.unlockedOnly && !unlockedIcons.includes(unlockKey)) {
                      return null;
                    }

                    const isChatActiveTile = tile.isChatFocus && (chatAvailableChoices.length > 0 || isChatAttentionActive);
                    const isHighlighted = !tile.isChatFocus && highlightedTileId === tile.id;
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
                            openApp(tile.id as WindowId);
                          }
                        }}
                        className={`group flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 relative animate-in fade-in zoom-in-95 duration-500 ${
                          isChatActiveTile || isHighlighted ? 'scale-105' : ''
                        }`}
                      >
                        {/* Tile Icon with L-shaped colored brackets */}
                        <div
                          className={`w-18 h-18 rounded-lg flex items-center justify-center relative transition-transform group-hover:scale-105 ${
                            isChatActiveTile || isHighlighted ? 'ring-2 ring-[#00ff66] shadow-[0_0_20px_#00ff66] animate-pulse' : ''
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

              {/* Incoming emergency call banner from IT Chief when negotiation is unlocked */}
              {activeApp === null && unlockedIcons.includes('negotiation_unlocked') && !unlockedIcons.includes('mission_completed') && (
                <div
                  onClick={() => openApp('negotiation')}
                  className="mx-auto mb-2 max-w-lg px-4 py-3 rounded-xl bg-red-950/40 border-2 border-red-500 hover:border-red-400 hover:bg-red-900/50 text-red-200 cursor-pointer transition-all shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-bounce flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5 text-xs font-black tracking-wider text-amber-300">
                    <ShieldAlert size={20} className="text-red-500 animate-pulse shrink-0" />
                    <span>⚠️ POŁĄCZENIE PRZYCHODZĄCE: SZEF IT ENERGY ROCK</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-black text-white px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 shrink-0 ml-2 shadow-[0_0_10px_#ef4444]">
                    <span>ODBIERZ</span>
                    <ArrowRight size={14} />
                  </div>
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
            onClick={openRetryModal}
            className="p-1 rounded hover:bg-[#ff3366]/20 text-gray-400 hover:text-[#ff3366] transition-colors"
            title="Powtórz misję"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* FULL-SCREEN DETECTION ALARM MODAL */}
      {isDetectedModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#120407] border-2 border-[#ff3366] rounded-2xl max-w-xl w-full p-6 sm:p-8 text-center space-y-5 shadow-[0_0_60px_rgba(255,51,102,0.6)] relative">
            <div className="w-20 h-20 rounded-full bg-[#ff3366]/15 border-2 border-[#ff3366] flex items-center justify-center mx-auto text-[#ff3366] shadow-[0_0_30px_#ff3366] animate-bounce">
              <AlertTriangle size={44} />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-black tracking-widest text-[#ff3366] uppercase animate-pulse">
                ⚠️ OPERACJA SPALONA // ZOSTAŁEŚ WYKRYTY!
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {detectionReason?.title || "ALARM SYSTEMÓW BEZPIECZEŃSTWA"}
              </h2>
            </div>

            <div className="p-4 bg-[#1f060b] border border-[#ff3366]/40 rounded-xl text-left text-xs text-red-200 leading-relaxed shadow-inner">
              <div className="text-[10px] text-[#ff3366] font-bold uppercase mb-1">
                SZCZEGÓŁY WPADKI:
              </div>
              <p>{detectionReason?.details || "Podjęte działanie zaalarmowało ochronę lub systemy IDS/IPS. Atak został zneutralizowany."}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retryFromChoices}
                className="flex-1 py-3 px-4 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#00ff66]/90 transition-all shadow-[0_0_20px_#00ff66] flex items-center justify-center space-x-2"
              >
                <Play size={15} />
                <span>POWTÓRZ OD WYBORÓW (SZYBKI POWRÓT)</span>
              </button>
              <button
                onClick={retryFromScratch}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                <RefreshCw size={14} />
                <span>OD POCZĄTKU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VR-STYLE RETRY MODAL (POWTÓRKA) */}
      {isRetryModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#07131b] border-2 border-[#00ff66] rounded-2xl max-w-lg w-full p-6 sm:p-7 text-center space-y-5 shadow-[0_0_40px_rgba(0,255,102,0.35)] relative">
            <button
              onClick={closeRetryModal}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1 rounded transition-colors"
              title="Zamknij"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#00ff66]/15 border-2 border-[#00ff66] flex items-center justify-center mx-auto text-[#00ff66] shadow-[0_0_25px_#00ff66]">
              <RotateCcw size={32} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#00ff66] tracking-widest text-glow-green uppercase">
                POWTÓRKA
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto mt-2">
                MOŻESZ WRÓCIĆ DO ZADANIA, ABY POPRAWIĆ WYNIK LUB UTRWALIĆ WIEDZĘ. TYLKO NAJLEPSZY WYNIK ZOSTANIE ZAPISANY.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={retryFromScratch}
                className="py-3 px-4 bg-[#00ff66]/15 border-2 border-[#00ff66] hover:bg-[#00ff66] text-[#00ff66] hover:text-[#05080c] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] flex flex-col items-center justify-center space-y-1 group"
              >
                <div className="flex items-center space-x-1.5">
                  <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-300" />
                  <span>OD POCZĄTKU</span>
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-900 font-normal">Intro + BIOS + Fabuła</span>
              </button>

              <button
                onClick={retryFromChoices}
                className="py-3 px-4 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#00ff66]/90 transition-all shadow-[0_0_20px_#00ff66] flex flex-col items-center justify-center space-y-1"
              >
                <div className="flex items-center space-x-1.5">
                  <Play size={15} />
                  <span>OD WYBORÓW</span>
                </div>
                <span className="text-[10px] text-gray-900 font-normal">Pulpit + Baza Wirusów</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
