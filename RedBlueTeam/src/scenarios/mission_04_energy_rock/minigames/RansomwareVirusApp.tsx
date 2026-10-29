import React, { useState } from 'react';
import { ShieldAlert, Lock, CheckCircle2, ArrowRight, Scan } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import { ModuleLoader } from '../../../engine/components/ModuleLoader';
import type { BlockProps } from '../../../engine/types/mission';
import type { VirusConfig } from './types';

type Screen = 'boot' | 'select' | 'loading' | 'scanner';

/**
 * D1 — dobór złośliwego oprogramowania. Ekrany po kolei:
 * 1) wybór wirusa (oceniana decyzja) → 2) loader → 3) skaner sygnatury (nieoceniany) → onComplete.
 */
export const RansomwareVirusApp: React.FC<BlockProps<VirusConfig>> = ({ config, onDecision, onComplete }) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#a855f7';

  const [screen, setScreen] = useState<Screen>('boot');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [scannedCells, setScannedCells] = useState<Set<number>>(new Set());

  const cellCount = config.scannerCells;
  const matrixCells = React.useMemo(() => {
    const hex = ['7F', 'A1', 'E4', '0B', 'FF', 'C2', '99', '5D', '1E', '3A', '8C', '42', 'D7', '6B', '9F', 'F0'];
    return Array.from({ length: cellCount }, (_, i) => hex[i % hex.length]);
  }, [cellCount]);

  const selected = config.options.find((o) => o.id === selectedId);
  const scanProgress = scannedCells.size >= matrixCells.length
    ? 100
    : Math.min(100, Math.round((scannedCells.size / matrixCells.length) * 100));

  const handleConfirmSelect = () => {
    if (!selected || isConfirmed) return;
    sounds.playSuccess();
    setIsConfirmed(true);
    onDecision({
      num: config.decisionNum,
      question: config.question,
      answer: selected.label,
      tier: selected.tier,
      feedback: selected.feedback
    });
    if (selected.tier !== 'critical') setScreen('loading');
  };

  const handleCellHover = (index: number) => {
    setScannedCells((prev) => {
      if (prev.has(index) || prev.size >= matrixCells.length) return prev;
      const next = new Set(prev);
      next.add(index);
      if (next.size >= matrixCells.length) sounds.playSuccess();
      else sounds.playKeypress();
      return next;
    });
  };

  const handleQuickScanAll = () => {
    sounds.playSuccess();
    setScannedCells(new Set(Array.from({ length: matrixCells.length }, (_, i) => i)));
  };

  const header = (title: string, subtitle: string) => (
    <div className="border-b pb-3 flex items-center space-x-2.5" style={{ borderColor: `${accent}4d` }}>
      <div className="p-1.5 rounded border" style={{ backgroundColor: `${accent}33`, borderColor: accent, color: accent }}>
        <ShieldAlert size={20} />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white tracking-widest">{title}</h2>
        <p className="text-[0.6875rem]" style={{ color: accent }}>{subtitle}</p>
      </div>
    </div>
  );

  if (screen === 'boot') {
    return (
      <ModuleLoader
        label="POBIERANIE I URUCHAMIANIE //BAZA_WIRUSÓW…"
        durationMs={2600}
        accent={accent}
        onDone={() => setScreen('select')}
      />
    );
  }

  if (screen === 'loading') {
    return (
      <ModuleLoader
        label="KOMPILACJA ŁADUNKU — URUCHAMIANIE SKANERA SYGNATURY…"
        durationMs={1100}
        accent={accent}
        onDone={() => setScreen('scanner')}
      />
    );
  }

  if (screen === 'scanner') {
    return (
      <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
        {header('//BAZA_WIRUSÓW // SKANER SYGNATURY', 'ODKRYJ SYGNATURĘ WYBRANEGO ŁADUNKU')}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold" style={{ color: accent }}>
            <Scan size={14} className="animate-spin" />
            <span>PRZESUŃ KURSOREM PO MATRYCY, ABY ODKRYĆ SYGNATURĘ:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold" style={{ color: accent }}>ODKRYCIE: {scanProgress}%</span>
            {scanProgress < 100 && (
              <button type="button" onClick={handleQuickScanAll}
                className="text-[0.625rem] px-2 py-0.5 rounded border cursor-pointer"
                style={{ backgroundColor: `${accent}26`, borderColor: accent, color: accent }}>
                SKANUJ WSZYSTKO
              </button>
            )}
          </div>
        </div>
        <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          <div className="h-full transition-all duration-200" style={{ width: `${scanProgress}%`, backgroundColor: accent }} />
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {matrixCells.map((hex, i) => {
            const isScanned = scannedCells.has(i) || scanProgress >= 100;
            return (
              <div key={i} onMouseEnter={() => handleCellHover(i)} onClick={() => handleCellHover(i)}
                className="py-1 text-center text-[0.625rem] font-mono rounded cursor-crosshair transition-all duration-150 border"
                style={isScanned
                  ? { backgroundColor: `${accent}4d`, color: '#e9d5ff', borderColor: `${accent}99` }
                  : { backgroundColor: '#0f1722', color: '#4b5563', borderColor: '#1f2937' }}>
                {isScanned ? (i % 5 === 0 ? '🔒' : hex) : hex}
              </div>
            );
          })}
        </div>
        <div className="pt-2 flex items-center justify-end">
          <button disabled={scanProgress < 100} onClick={onComplete}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
              scanProgress >= 100 ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            style={scanProgress >= 100 ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}>
            <span>ZATWIERDŹ ŁADUNEK I PRZEKAŻ DO BYTE_MASTERA</span>
            <Lock size={14} />
          </button>
        </div>
      </div>
    );
  }

  // screen === 'select'
  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {header('//BAZA_WIRUSÓW // SELEKCJA ZŁOŚLIWEGO KODU', 'CEL: PARALIŻ OPERACYJNY I PRZYKRYWKA POD FREEVOLT')}
      <div className="text-xs font-bold text-gray-300">{config.question}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {config.options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <div key={option.id} data-option-id={option.id} onClick={() => { if (!isConfirmed) { sounds.playClick(); setSelectedId(option.id); } }}
              className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${isConfirmed ? 'cursor-default' : 'cursor-pointer'} ${
                isSelected ? 'scale-[1.01]' : 'border-gray-800 bg-[#08101a]/90 hover:border-gray-600 hover:bg-[#0c1624]'
              }`}
              style={isSelected ? { borderColor: accent, backgroundColor: `${accent}26`, boxShadow: `0 0 20px ${accent}59` } : undefined}>
              <div>
                <h3 className="text-xs font-bold text-white mb-1.5 leading-snug">{option.label}</h3>
                {option.desc && <p className="text-[0.6875rem] text-gray-300 leading-relaxed mb-3">{option.desc}</p>}
              </div>
              <div>
                {option.tags && option.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {option.tags.map((t) => (
                      <span key={t} className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-black/50 text-gray-400">{t}</span>
                    ))}
                  </div>
                )}
                {isSelected && (
                  <div className="mt-2 text-[0.625rem] font-bold flex items-center space-x-1" style={{ color: accent }}>
                    <CheckCircle2 size={12} /><span>WYBRANO</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-2 flex items-center justify-end">
        <button data-confirm-choice="true" disabled={!selectedId || isConfirmed} onClick={handleConfirmSelect}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
            selectedId && !isConfirmed ? 'text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          style={selectedId && !isConfirmed ? { backgroundColor: accent, boxShadow: `0 0 20px ${accent}80` } : undefined}>
          <span>POTWIERDŹ WYBÓR WIRUSA</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
