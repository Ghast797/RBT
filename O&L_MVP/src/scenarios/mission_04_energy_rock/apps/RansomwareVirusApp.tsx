import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Scan,
  Check
} from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';

interface VirusOption {
  id: 'rat' | 'ransomware' | 'keylogger';
  name: string;
  desc: string;
  tags: string[];
  points: number;
  isCorrect: boolean;
  isCriticalError?: boolean;
  feedback: string;
}

// Order: RAT, Ransomware, Keylogger (Ransomware is NOT first)
const VIRUSES: VirusOption[] = [
  {
    id: 'rat',
    name: 'RAT: REMOTE ACCESS TROJAN',
    desc: 'POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY',
    tags: ['TROJAN', 'CICHY NASŁUCH', 'REMOTE DESKTOP'],
    points: 4.0,
    isCorrect: false,
    feedback: 'RAT umożliwia cichy dostęp, lecz nie paraliżuje infrastruktury firmy ani nie stwarza natychmiastowej przykrywki pod żądanie okupu.'
  },
  {
    id: 'ransomware',
    name: 'RANSOMWARE',
    desc: 'MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ',
    tags: ['SZYFROWANIE', 'PARALIŻ SIECI', 'DOUBLE EXTORTION'],
    points: 11.11,
    isCorrect: true,
    feedback: 'Zgodnie z planem operacji paraliżuje serwery ofiary, dając doskonały kamuflaż pod kradzież technologii Freevolt pod płaszczykiem szantażu finansowego.'
  },
  {
    id: 'keylogger',
    name: 'KEYLOGGER',
    desc: 'POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE',
    tags: ['SNIFFER', 'PRZECHWYTYWANIE ZNAKÓW', 'PASYWNY'],
    points: 0.0,
    isCorrect: false,
    isCriticalError: true,
    feedback: 'Zupełnie chybiony wektor. Zbieranie haseł trwa tygodniami i nie pozwala na zablokowanie zasobów Energy Rock.'
  }
];

export const RansomwareVirusApp: React.FC = () => {
  const { 
    recordChoice, 
    customState, 
    setCustomState,
    advanceMission4Story 
  } = useMissionStore();

  const [selectedId, setSelectedId] = useState<string | null>(customState.m4_step1_selected || null);
  const [scannedCells, setScannedCells] = useState<Set<number>>(new Set());
  const [isConfirmed, setIsConfirmed] = useState<boolean>(customState.m4_step1_confirmed || false);

  const selectedVirus = VIRUSES.find(v => v.id === selectedId);

  // Hex matrix for scanner minigame
  const matrixCells = React.useMemo(() => {
    const hex = ['7F', 'A1', 'E4', '0B', 'FF', 'C2', '99', '5D', '1E', '3A', '8C', '42', 'D7', '6B', '9F', 'F0'];
    return Array.from({ length: 32 }, (_, i) => hex[i % hex.length]);
  }, []);

  const scanProgress = customState.m4_step1_scanned || scannedCells.size >= matrixCells.length
    ? 100
    : Math.min(100, Math.round((scannedCells.size / matrixCells.length) * 100));

  const handleCellHover = (index: number) => {
    setScannedCells((prev) => {
      if (prev.has(index) || prev.size >= matrixCells.length) return prev;
      const next = new Set(prev);
      next.add(index);
      if (next.size >= matrixCells.length) {
        sounds.playSuccess();
      } else {
        sounds.playKeypress();
      }
      return next;
    });
  };

  const handleQuickScanAll = () => {
    sounds.playSuccess();
    setScannedCells(new Set(Array.from({ length: matrixCells.length }, (_, i) => i)));
  };

  const handleSelect = (virus: VirusOption) => {
    sounds.playClick();
    setSelectedId(virus.id);
    setCustomState('m4_step1_selected', virus.id);
    if (!customState.m4_step1_scanned) {
      setScannedCells(new Set());
    }
  };

  const handleConfirm = () => {
    if (!selectedVirus || scanProgress < 100) return;

    sounds.playSuccess();
    setIsConfirmed(true);
    setCustomState('m4_step1_confirmed', true);
    setCustomState('m4_step1_scanned', true);

    // Record decision 1 in store
    recordChoice({
      num: 1,
      question: 'Wybierz odpowiedniego wirusa:',
      answer: selectedVirus.name,
      isCorrect: selectedVirus.isCorrect,
      details: selectedVirus.feedback
    }, selectedVirus.isCorrect ? 0 : (selectedVirus.isCriticalError ? 11.11 : 7.11));

    // Advance story: closes app, returns to desktop, unlocks builder with badge, Byte_Master guides in chat
    advanceMission4Story('virus_done');
  };

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Top Header */}
      <div className="border-b border-[#a855f7]/30 pb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#a855f7]/20 border border-[#a855f7] text-[#a855f7]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">//BAZA_WIRUSÓW // SELEKCJA ZŁOŚLIWEGO KODU</h2>
            <p className="text-[11px] text-[#a855f7]">MISJA 4: ENERGY ROCK // CEL: PARALIŻ OPERACYJNY I PRZYKRYWKA POD FREEVOLT</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#a855f7]/15 border border-[#a855f7]/50 text-[#c084fc]">
          KROK 1/9
        </span>
      </div>

      {/* PHASE 1: Virus Selection Cards (FIRST) */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
          <span>KROK 1A: WYBIERZ ODPOWIEDNIEGO WIRUSA DO OPERACJI:</span>
          {selectedVirus && (
            <span className="text-[10px] text-[#c084fc] font-bold">
              WYBRANO: {selectedVirus.id.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {VIRUSES.map((virus) => {
            const isSelected = selectedId === virus.id;
            return (
              <div
                key={virus.id}
                data-virus-id={virus.id}
                onClick={() => !isConfirmed && handleSelect(virus)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#a855f7] bg-[#a855f7]/15 shadow-[0_0_20px_rgba(168,85,247,0.35)] scale-[1.01]'
                    : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 text-[#c084fc] border border-[#a855f7]/30">
                      {virus.id.toUpperCase()}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-ping" />
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1.5 leading-snug">
                    {virus.name}
                  </h3>
                  <p className="text-[11px] text-gray-300 leading-relaxed mb-3">
                    {virus.desc}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {virus.tags.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-[10px] font-bold text-[#c084fc] flex items-center space-x-1">
                      <CheckCircle2 size={12} />
                      <span>WYBRANY (ODKRYJ SYGNATURĘ PONIŻEJ)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PHASE 2: Signature Scanner Minigame (ONLY AFTER VIRUS IS SELECTED) */}
      {selectedVirus ? (
        <div className="bg-[#090f18] border border-[#a855f7]/30 rounded-xl p-3.5 relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs text-[#c084fc] font-bold">
              <Scan size={14} className="animate-spin" />
              <span>KROK 1B: SKANOWANIE MATRYCY PAMIĘCI – ODKRYJ SYGNATURĘ ŁADUNKU:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#a855f7]">
                ODKRYCIE: {scanProgress}%
              </span>
              {scanProgress < 100 && (
                <button
                  type="button"
                  onClick={handleQuickScanAll}
                  className="text-[10px] px-2 py-0.5 rounded bg-[#a855f7]/20 border border-[#a855f7] text-[#c084fc] hover:bg-[#a855f7]/30 cursor-pointer transition-all"
                >
                  SKANUJ WSZYSTKO
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800 mb-3">
            <div 
              className="h-full bg-gradient-to-r from-[#9333ea] to-[#a855f7] transition-all duration-200"
              style={{ width: `${scanProgress}%` }}
            />
          </div>

          {/* Hex Matrix Grid */}
          <div className="grid grid-cols-8 gap-1.5">
            {matrixCells.map((hex, i) => {
              const isScanned = scannedCells.has(i) || scanProgress >= 100;
              return (
                <div
                  key={i}
                  onMouseEnter={() => handleCellHover(i)}
                  onClick={() => handleCellHover(i)}
                  className={`py-1 text-center text-[10px] font-mono rounded cursor-crosshair transition-all duration-150 ${
                    isScanned 
                      ? 'bg-[#a855f7]/30 text-[#e9d5ff] border border-[#a855f7]/60 shadow-[0_0_8px_rgba(168,85,247,0.4)]' 
                      : 'bg-[#0f1722] text-gray-600 border border-gray-800/60 hover:border-gray-600'
                  }`}
                >
                  {isScanned ? (i % 5 === 0 ? '🔒' : hex) : hex}
                </div>
              );
            })}
          </div>

          {scanProgress < 100 ? (
            <p className="text-[10px] text-gray-400 mt-2 text-center animate-pulse">
              [PRZESUŃ KURSOR PO MATRYCY LUB KLIKNIJ KOMÓRKI, ABY ZIDENTYFIKOWAĆ SYGNATURĘ]
            </p>
          ) : (
            <div className="mt-2.5 p-2 rounded bg-[#a855f7]/20 border border-[#a855f7] flex items-center justify-center space-x-2 text-xs font-bold text-[#e9d5ff]">
              <Lock size={15} className="text-[#a855f7]" />
              <span>SYGNATURA ZNALEZIONA: ŁADUNEK SZYFRUJĄCY ZIDENTYFIKOWANY! MOŻESZ ZATWIERDZIĆ WYBÓR.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-center text-xs text-gray-500">
          [NAJPIERW WYBIERZ JEDNEGO Z POWYŻSZYCH WIRUSÓW, ABY PRZEJŚĆ DO SKANOWANIA SYGNATURY]
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {scanProgress >= 100 
            ? 'Zatwierdzenie wyboru odeśle raport do Byte_Mastera i odblokuje Kreator Wirusów na pulpicie.' 
            : 'Wymagane: Wybór wirusa i 100% skanu matrycy pamięci.'}
        </span>

        <button
          data-confirm-virus="true"
          disabled={!selectedId || scanProgress < 100}
          onClick={handleConfirm}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedId && scanProgress >= 100
              ? 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>ZATWIERDŹ ŁADUNEK I PRZEKAŻ DO BYTE_MASTERA</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
