import React, { useState } from 'react';
import { Crosshair, ArrowRight, CheckCircle2, ShieldAlert, Database, ChevronRight, FileText } from 'lucide-react';
import { useMissionStore } from '../../../engine/store/useMissionStore';
import { sounds } from '../../../engine/audio/soundEffects';
import type { BlockProps } from '../../../engine/types/mission';
import type { TargetPetrologConfig } from './types';

export const TargetPetrologApp: React.FC<BlockProps<TargetPetrologConfig>> = ({
  config,
  onComplete
}) => {
  const accent = useMissionStore((s) => s.activeMission.mission?.accentColor) || '#00ff66';
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = config?.slides || [];
  const currentSlide = slides[currentSlideIndex];
  const isLast = currentSlideIndex === slides.length - 1;

  const handleNext = () => {
    sounds.playClick();
    if (isLast) {
      sounds.playSuccess();
      onComplete();
    } else {
      setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center font-mono text-gray-400">
        Brak danych wywiadowczych.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#05090f] text-gray-200 font-mono select-none overflow-y-auto p-4 space-y-4">
      {/* Header with cyber brackets and step indicator */}
      <div
        className="border-b pb-3 flex items-center justify-between"
        style={{ borderColor: `${accent}4d` }}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className="p-1.5 rounded border"
            style={{ backgroundColor: `${accent}26`, borderColor: accent, color: accent }}
          >
            <Crosshair size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest">
              //BAZA_CELU: {config.companyName.toUpperCase()}
            </h2>
            <p className="text-[11px]" style={{ color: accent }}>
              {config.targetObjective || 'ODPRAWA WYWIADOWCZA I PROFILOWANIE FIRMY'}
            </p>
          </div>
        </div>
        <span
          className="text-[10px] px-2.5 py-1 rounded border font-mono tracking-wider"
          style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
        >
          SLAJD {currentSlideIndex + 1}/{slides.length}
        </span>
      </div>

      {/* Main Slide Card */}
      <div className="flex-1 flex flex-col justify-between p-5 rounded-xl border bg-[#08101a]/95 border-gray-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative grid/glow */}
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ backgroundColor: accent }}
        />

        <div className="space-y-4">
          {/* Badge */}
          <div className="flex items-center space-x-2">
            <span
              className="text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest text-[#05090f]"
              style={{ backgroundColor: accent }}
            >
              {currentSlide.badge}
            </span>
            <span className="text-xs text-gray-500 font-bold">
              ID_DOKUMENTU: #PL-INTEL-0{currentSlideIndex + 1}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-base sm:text-lg font-black text-white tracking-wide uppercase leading-snug">
            {currentSlide.title}
          </h1>

          {/* Primary Highlight Message */}
          <div
            className="p-4 rounded-lg border text-sm sm:text-base font-bold text-[#d1fae5] leading-relaxed shadow-inner"
            style={{
              backgroundColor: `${accent}0d`,
              borderColor: `${accent}40`
            }}
          >
            {currentSlide.content}
          </div>

          {/* Bullet points if available */}
          {currentSlide.bullets && currentSlide.bullets.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                ANALIZA OPERACYJNA:
              </span>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="mt-1" style={{ color: accent }}>▸</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Slide navigation bar */}
        <div className="pt-6 border-t border-gray-800 flex items-center justify-between mt-4">
          <div className="flex space-x-1.5">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className="w-8 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentSlideIndex ? accent : '#1f2937',
                  boxShadow: idx === currentSlideIndex ? `0 0 8px ${accent}` : undefined
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center space-x-2 cursor-pointer shadow-lg active:scale-95"
            style={{
              backgroundColor: accent,
              color: '#05090f',
              boxShadow: `0 0 20px ${accent}66`
            }}
          >
            <span>{currentSlide.buttonLabel}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
