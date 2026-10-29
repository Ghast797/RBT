import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AppHeaderProps {
  icon: LucideIcon;
  accent: string;
  /** Nazwa aplikacji/ekranu, np. "//SOCIAL_MEDIA". */
  title: string;
  /** Krótki opis kontekstu pod tytułem (nie polecenie). */
  subtitle?: string;
  /** Plakietka po prawej, np. "KROK 1/3". */
  step?: string;
  /** Własna zawartość po prawej (zastępuje plakietkę `step`). */
  aside?: React.ReactNode;
  /** Polecenie dla gracza: co ma teraz zrobić. Pokazywane w wyraźnym pasku ZADANIE. */
  task?: React.ReactNode;
}

/**
 * Wspólny nagłówek aplikacji na pulpicie HACKERS.OS: nazwa aplikacji i bieżące zadanie gracza.
 * Zadanie jest najważniejszym tekstem na ekranie (zob. docs/player-guidance.md), więc ma osobny, duży pasek.
 */
export const AppHeader: React.FC<AppHeaderProps> = ({ icon: Icon, accent, title, subtitle, step, aside, task }) => (
  <div className="space-y-2.5 shrink-0">
    <div
      className="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      style={{ borderColor: `${accent}4d` }}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div
          className="p-2 rounded-lg border shrink-0"
          style={{ backgroundColor: `${accent}26`, borderColor: accent, color: accent, boxShadow: `0 0 12px ${accent}40` }}
        >
          <Icon size={26} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-widest leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs font-bold tracking-wide" style={{ color: accent }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {aside ??
        (step && (
          <span
            className="text-xs px-3 py-1.5 rounded-lg border font-mono tracking-wider font-black shrink-0 self-start sm:self-auto"
            style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}66`, color: accent }}
          >
            {step}
          </span>
        ))}
    </div>

    {task && (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg border-l-4 animate-in fade-in duration-200"
        style={{ borderColor: accent, backgroundColor: `${accent}14`, boxShadow: `inset 0 0 20px ${accent}12` }}
      >
        <span
          className="text-[11px] font-black tracking-widest px-2 py-1 rounded shrink-0 text-[#05090f]"
          style={{ backgroundColor: accent }}
        >
          ZADANIE
        </span>
        <span className="text-base sm:text-lg font-bold text-white leading-snug font-sans">{task}</span>
      </div>
    )}
  </div>
);
