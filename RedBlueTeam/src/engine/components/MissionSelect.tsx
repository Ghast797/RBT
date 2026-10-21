import React from 'react';
import { Terminal, ChevronRight } from 'lucide-react';
import { getMissionList } from '../registry/missionRegistry';

/**
 * Ekran wyboru misji — tylko w trybie dev (bez VITE_MISSION_ID).
 * Wybór przeładowuje stronę z ?mission=X, żeby store wystartował od zera.
 */
export const MissionSelect: React.FC = () => {
  const missions = getMissionList();

  const openMission = (num: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('mission', num);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen w-full bg-black text-[#00ff66] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2 text-sm tracking-widest mb-1">
          <Terminal size={16} />
          <span className="font-bold">//HACKERS.OS</span>
          <span className="text-[#00ff66]/50">— TRYB DEWELOPERSKI</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-widest mb-2">WYBIERZ MISJĘ</h1>
        <p className="text-xs text-gray-400 mb-6">
          Ekran widoczny tylko w trybie dev. Paczka SCORM ładuje jedną, przypisaną misję.
        </p>

        <div className="grid gap-3">
          {missions.map(({ num, id, definition }) => {
            const meta = definition?.mission;
            const accent = meta?.accentColor || '#00ff66';
            return (
              <button
                key={id}
                type="button"
                onClick={() => openMission(num)}
                className="group w-full text-left border bg-black/60 hover:bg-white/5 transition-colors p-4 flex items-center gap-4"
                style={{ borderColor: `${accent}66` }}
              >
                <div
                  className="shrink-0 w-12 h-12 flex items-center justify-center border text-xl font-bold"
                  style={{ borderColor: accent, color: accent }}
                >
                  {num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold tracking-wider truncate" style={{ color: accent }}>
                    {meta?.title || id}
                  </div>
                  <div className="text-sm text-gray-300 truncate">{meta?.subTitle}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    CEL: {meta?.targetCompany?.toUpperCase()} · ?mission={num}
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ color: accent }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
