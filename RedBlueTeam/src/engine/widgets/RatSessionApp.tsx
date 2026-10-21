import React from 'react';
import { Radio, AlertOctagon, Monitor, Trash2, ArrowRight, FileArchive, FolderOpen } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';

export const RatSessionApp: React.FC = () => {
  const {
    activeMission,
    isDesktopTakeoverActive,
    launchDesktopTakeover,
    isNetworkGraphActive,
    openNetworkGraph,
    openDebrief
  } = useMissionStore();

  const step5 = activeMission.step5 || {
    host: { name: 'MATEUSZ_BIURO_O&L', ip: '161.185.160.93' },
    desktopIcons: []
  };

  return (
    <div className="flex flex-col h-full bg-[#050b10] rounded-lg overflow-hidden font-mono select-none border border-[#00ff66]/30 shadow-2xl p-4 space-y-4">
      {/* Stage 1: RAT Alert Screen */}
      {!isDesktopTakeoverActive && (
        <div className="flex-1 flex flex-col justify-between p-6 bg-[#09151e] border-2 border-[#00ff66] rounded-xl shadow-[0_0_30px_rgba(0,255,102,0.25)] text-center relative overflow-hidden">
          <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-25" />

          <div className="space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#00ff66]/20 border-2 border-[#00ff66] mx-auto flex items-center justify-center text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.5)]">
              <Radio size={32} className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-black text-[#00ff66] tracking-widest text-glow-green">
                PENDRIVE ZOSTAŁ PODŁĄCZONY
              </h2>
              <div className="text-sm font-bold text-white tracking-wider">
                MALWARE ZOSTAŁ AKTYWOWANY
              </div>
            </div>

            {/* Target Machine Specs Table */}
            <div className="max-w-md mx-auto bg-[#050a0f] border border-[#00ff66]/40 rounded-lg p-3 text-xs text-left space-y-1.5">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-gray-400">NAZWA KOMPUTERA:</span>
                <span className="font-bold text-[#00ff66]">{step5.host.name}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-gray-400">AKTYWOWANE NA IP:</span>
                <span className="font-bold text-[#00ff66]">{step5.host.ip}</span>
              </div>
            </div>
          </div>

          <button
            onClick={launchDesktopTakeover}
            className="w-full max-w-md mx-auto py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_20px_rgba(0,255,102,0.6)] flex items-center justify-center space-x-2"
          >
            <Monitor size={16} />
            <span>[PRZEJMIJ PULPIT OFIARY]</span>
          </button>
        </div>
      )}

      {/* Stage 2: Windows 11 Victim Desktop Takeover */}
      {isDesktopTakeoverActive && !isNetworkGraphActive && (
        <div className="flex-1 flex flex-col justify-between rounded-xl overflow-hidden border-2 border-[#00ff66] relative shadow-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <div className="p-2 bg-red-900/80 border-b border-red-500 text-center text-xs font-black text-white tracking-widest flex items-center justify-center space-x-2 z-20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>KONTROLUJESZ PULPIT OFIARY (MATEUSZ_BIURO_O&L)</span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <div className="text-5xl font-black text-white tracking-widest">
              ⚙ O&L Company
            </div>
          </div>

          <div className="flex-1 relative p-4 flex">
            <div className="space-y-4 relative z-10 w-28">
              <div className="flex flex-col items-center p-2 rounded hover:bg-white/10 cursor-pointer text-center text-[10px] text-white">
                <div className="w-10 h-10 rounded bg-slate-800 border border-slate-600 flex items-center justify-center mb-1 text-slate-300">
                  <Trash2 size={20} />
                </div>
                <span className="font-bold">KOSZ</span>
              </div>

              <div className="flex flex-col items-center p-2 rounded hover:bg-white/10 cursor-pointer text-center text-[10px] text-white">
                <div className="w-10 h-10 rounded bg-blue-900/60 border border-blue-500 flex items-center justify-center mb-1 text-blue-300">
                  <Monitor size={20} />
                </div>
                <span className="font-bold">TEN KOMPUTER</span>
              </div>

              <div 
                onClick={openNetworkGraph}
                className="flex flex-col items-center p-2 rounded bg-amber-500/20 border-2 border-amber-500 hover:bg-amber-500/30 cursor-pointer text-center text-[10px] text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all animate-pulse"
                title="Kliknij, aby zinfiltrować sieć FREEVOLT"
              >
                <div className="w-10 h-10 rounded bg-amber-600 flex items-center justify-center mb-1 text-white">
                  <AlertOctagon size={22} />
                </div>
                <span className="font-black">FREEVOLT</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 w-80 bg-slate-900/95 border-2 border-blue-500 rounded-lg shadow-2xl overflow-hidden z-20 font-sans">
              <div className="px-3 py-1.5 bg-blue-700 text-white font-bold text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <FolderOpen size={14} />
                  <span>E:\ ZDJĘCIA_AFTERPARTY</span>
                </div>
                <div className="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded font-mono">FAT32</div>
              </div>
              <div className="p-3 font-mono text-xs space-y-2">
                <div 
                  onClick={openNetworkGraph}
                  className="flex items-center space-x-2 p-2 rounded bg-amber-500/15 border border-amber-500/50 hover:bg-amber-500/25 cursor-pointer text-amber-300 transition-colors"
                >
                  <FileArchive size={20} className="text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold">FOTKI_AFTERPARTY.ZIP</div>
                    <div className="text-[10px] text-green-400">[STATUS: WYEKSTRAKTOWANO // RAT AKTYWNY]</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400">
                  Pracownik wypakował archiwum. Wirus RAT połączył się z serwerem C2 hakera.
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 z-20">
            <div className="text-[11px] text-amber-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Dostęp do stacji roboczej aktywny. Kliknij ikonę FREEVOLT lub przycisk obok, aby zinfiltrować sieć.</span>
            </div>
            <button
              onClick={openNetworkGraph}
              className="px-4 py-1.5 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-wider rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.5)] flex items-center space-x-1.5 shrink-0"
            >
              <span>[PRZEJMIJ SIEĆ FREEVOLT]</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="px-3 py-1.5 bg-[#0a121c]/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300 z-10">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-black">
                田
              </div>
              <span className="text-[10px] text-gray-400">Wyszukaj pliki w O&L...</span>
            </div>
            <div className="text-[10px] font-mono text-[#00ff66] font-bold">
              08:12:28
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Remote Network Access Diagram */}
      {isNetworkGraphActive && (
        <div className="flex-1 flex flex-col justify-between p-6 bg-[#081219] border-2 border-[#00ff66] rounded-xl text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-black text-[#00ff66] tracking-widest text-glow-green">
              UZYSKAŁEŚ ZDALNY DOSTĘP
            </h2>
            <div className="text-xs text-white tracking-wider">
              DO SIECI O&L COMPANY
            </div>
          </div>

          <div className="relative w-full h-56 bg-[#050a0f] rounded-xl border-2 border-[#00ff66]/40 flex items-center justify-center p-3 shadow-inner">
            <svg viewBox="0 0 420 160" className="w-full h-full max-h-52">
              <line x1="210" y1="120" x2="80" y2="58" stroke="#00ff66" strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="210" y1="120" x2="210" y2="60" stroke="#00ff66" strokeWidth="3" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="210" y1="120" x2="340" y2="58" stroke="#00ff66" strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" />

              <g>
                <rect x="45" y="22" width="70" height="36" rx="6" fill="#08141f" stroke="#00ff66" strokeWidth="1.5" />
                <text x="80" y="44" textAnchor="middle" fill="#00ff66" fontSize="12" fontWeight="bold">PC-1</text>
              </g>

              <g>
                <rect x="145" y="18" width="130" height="42" rx="8" fill="#0b1b26" stroke="#00ff66" strokeWidth="2.5" filter="drop-shadow(0 0 8px rgba(0,255,102,0.4))" />
                <text x="210" y="38" textAnchor="middle" fill="#00ff66" fontSize="13" fontWeight="900" letterSpacing="1">MATEUSZ</text>
                <text x="210" y="52" textAnchor="middle" fill="#00ff66" fontSize="9" fontWeight="bold" opacity="0.85">[PRZEJĘTY // RAT]</text>
              </g>

              <g>
                <rect x="305" y="22" width="70" height="36" rx="6" fill="#08141f" stroke="#00ff66" strokeWidth="1.5" />
                <text x="340" y="44" textAnchor="middle" fill="#00ff66" fontSize="12" fontWeight="bold">SRV</text>
              </g>

              <g transform="translate(192, 104)">
                <circle cx="18" cy="18" r="18" fill="#00ff66" filter="drop-shadow(0 0 10px rgba(0,255,102,0.6))" />
                <text x="18" y="23" textAnchor="middle" fill="#05080c" fontSize="15" fontWeight="black">☣</text>
              </g>
            </svg>
          </div>

          <button
            onClick={openDebrief}
            className="w-full py-3 bg-[#00ff66] text-[#05080c] font-black text-xs uppercase tracking-widest rounded hover:bg-[#00ff66]/90 transition-all shadow-[0_0_20px_rgba(0,255,102,0.6)] flex items-center justify-center space-x-2"
          >
            <span>[PODSUMOWANIE ZADANIA]</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
