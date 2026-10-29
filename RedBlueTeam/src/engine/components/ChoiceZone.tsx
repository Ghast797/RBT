import React from 'react';

/**
 * Strefa wyboru: wszystko, co gracz wybiera, stoi w ramce z etykietą „▼ WYBIERZ…”,
 * żeby elementy do kliknięcia nie wyglądały jak karty informacyjne obok (zob. docs/player-guidance.md).
 */
export const ChoiceZone: React.FC<{
  accent: string;
  /** Tekst etykiety na ramce, np. "WYBIERZ JEDNO", "TWOJA OCENA". */
  label?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ accent, label = 'WYBIERZ JEDNO', className = '', children }) => (
  <div
    className={`relative mt-3 rounded-xl border-2 border-dashed px-3 pb-3 pt-6 ${className}`}
    style={{ borderColor: `${accent}73`, backgroundColor: `${accent}0a` }}
  >
    <span
      className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[11px] font-black tracking-widest whitespace-nowrap"
      style={{ backgroundColor: accent, color: '#05090f', boxShadow: `0 0 12px ${accent}80` }}
    >
      {`▼ ${label}`}
    </span>
    {children}
  </div>
);

export type ChoiceTileState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const STATE_COLOR: Partial<Record<ChoiceTileState, string>> = {
  correct: '#00ff66',
  wrong: '#ff3366'
};

/**
 * Kafel wyboru: znacznik (kółko albo litera), podniesienie przy najechaniu i jednoznaczne stany.
 * `marker`: `'radio'` (domyślnie) – kółko; tekst (np. "A") – litera; `null` – bez znacznika.
 * `markerPosition`: `'left'` – znacznik obok treści (odpowiedzi w wierszach), `'corner'` – w rogu karty.
 */
export const ChoiceTile: React.FC<{
  accent: string;
  state?: ChoiceTileState;
  marker?: string | null;
  markerPosition?: 'left' | 'corner';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({
  accent,
  state = 'idle',
  marker = 'radio',
  markerPosition = 'left',
  disabled = false,
  onClick,
  className = '',
  children
}) => {
  const color = STATE_COLOR[state] || accent;
  const isActive = state === 'selected' || state === 'correct';
  const isInteractive = !disabled && (state === 'idle' || state === 'selected');

  const stateClass =
    state === 'idle'
      ? 'bg-[#0b1724] border-[color-mix(in_srgb,var(--choice)_40%,transparent)]'
      : state === 'dimmed'
      ? 'bg-[#0b1724] border-gray-800 opacity-40'
      : state === 'wrong'
      ? 'opacity-70'
      : '';

  const stateStyle: React.CSSProperties =
    isActive || state === 'wrong'
      ? {
          borderColor: color,
          backgroundColor: `${color}1f`,
          boxShadow: isActive ? `0 0 0 1px ${color}, 0 0 20px ${color}55` : undefined
        }
      : {};

  const markerContent =
    state === 'correct' ? '✓' : state === 'wrong' ? '✗' : marker === 'radio' ? null : marker;

  const markerEl =
    marker === null ? null : (
      <span
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
          markerPosition === 'corner' ? 'absolute top-2.5 right-2.5 z-[70]' : 'mt-0.5'
        }`}
        style={{
          borderColor: isActive || state === 'wrong' ? color : `${accent}99`,
          backgroundColor: isActive || state === 'wrong' ? color : '#05090f',
          color: isActive || state === 'wrong' ? '#05090f' : accent
        }}
      >
        {markerContent ?? (isActive ? <span className="w-2.5 h-2.5 rounded-full bg-[#05090f]" /> : null)}
      </span>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !isInteractive}
      className={`relative w-full text-left rounded-xl border-2 transition-all duration-150 flex items-start gap-3 ${stateClass} ${
        isInteractive
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--choice)] hover:shadow-[0_6px_20px_-6px_var(--choice)] active:translate-y-0'
          : 'cursor-default'
      } ${className}`}
      style={{ ['--choice' as string]: accent, ...stateStyle }}
    >
      {markerPosition === 'left' && markerEl}
      <div className="flex-1 min-w-0">{children}</div>
      {markerPosition === 'corner' && markerEl}
    </button>
  );
};
