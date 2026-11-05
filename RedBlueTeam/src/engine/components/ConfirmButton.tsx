import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ConfirmButtonProps {
  /** Kolor akcentu aplikacji (hex), zwykle kolor jej kafelka na pulpicie. */
  accent: string;
  label: string;
  enabled?: boolean;
  onClick: () => void;
  /** Ikona po etykiecie; domyślnie strzałka. */
  icon?: React.ReactNode;
  /** Klasy szerokości/układu; domyślnie pełna szerokość (np. w stopce `SidePanel`). */
  className?: string;
}

/**
 * Przycisk „dalej/zatwierdź” w kolorze akcentu aplikacji (wzorzec Misji 1). Wyszarzony, dopóki
 * krok nie spełnia kryterium ukończenia. Zob. docs/scenario-engine.md, sekcja 3.
 */
export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  accent,
  label,
  enabled = true,
  onClick,
  icon,
  className = 'w-full'
}) => (
  <button
    onClick={onClick}
    disabled={!enabled}
    className={`${className} shrink-0 px-4 py-2.5 rounded font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer shadow-lg active:scale-95`}
    style={{
      backgroundColor: accent,
      color: '#05090f',
      boxShadow: enabled ? `0 0 15px ${accent}66` : undefined
    }}
  >
    <span>{label}</span>
    {icon ?? <ArrowRight size={15} />}
  </button>
);
