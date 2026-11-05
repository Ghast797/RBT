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
      className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[0.6875rem] font-black tracking-widest whitespace-nowrap"
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
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[0.6875rem] font-black shrink-0 transition-colors ${
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

/** Opcja w gotowych układach `ChoiceCardGrid` / `ChoiceRows` (zgodna z `ChoiceOption` i opcjami klocków). */
export interface ChoiceLayoutOption {
  id: string;
  label: string;
  desc?: string;
  tags?: string[];
}

interface ChoiceLayoutProps {
  accent: string;
  options: ChoiceLayoutOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Etykieta ramki (`ChoiceZone`). */
  label?: string;
  /** Tekst etykiet zapisany czcionką monospace (adresy, kod). */
  mono?: boolean;
}

/**
 * Układ „karty”: wybór na DUŻYM (lewym) ekranie. Karty w siatce, tytuł wyśrodkowany i wyraźny, opis pod spodem.
 * Zasada spójności UI: duży ekran = karty, prawy monitor = wiersze (`ChoiceRows`). Zob. docs/scenario-engine.md, sekcja 3.
 */
export const ChoiceCardGrid: React.FC<
  ChoiceLayoutProps & { columns?: 1 | 2 | 3; size?: 'md' | 'lg'; className?: string }
> = ({ accent, options, selectedId, onSelect, label = 'WYBIERZ JEDNO', mono = false, columns = 3, size = 'md', className = '' }) => {
  const cols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';
  const big = size === 'lg';
  return (
    <ChoiceZone accent={accent} label={label} className={className}>
      <div className={`grid ${cols} gap-3`}>
        {options.map((opt) => (
          <ChoiceTile
            key={opt.id}
            accent={accent}
            state={selectedId === opt.id ? 'selected' : 'idle'}
            markerPosition="corner"
            onClick={() => onSelect(opt.id)}
            className={big ? 'p-4 min-h-[11rem]' : 'p-4 min-h-[7rem]'}
          >
            <div
              className={`flex flex-col items-center justify-center text-center h-full space-y-2.5 px-5 ${
                big ? 'min-h-[8.5rem]' : 'min-h-[5rem]'
              }`}
            >
              <h3
                className={`${big ? 'text-lg font-black tracking-wider' : 'text-base font-bold'} text-white leading-snug ${
                  mono ? 'font-mono break-all' : ''
                }`}
              >
                {opt.label}
              </h3>
              {opt.desc && <p className={`${big ? 'text-base' : 'text-sm'} text-gray-200 leading-snug`}>{opt.desc}</p>}
              {opt.tags && opt.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {opt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6875rem] px-1.5 py-0.5 rounded bg-black/50 text-gray-400 border border-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </ChoiceTile>
        ))}
      </div>
    </ChoiceZone>
  );
};

/**
 * Układ „wiersze”: wybór na PRAWYM monitorze. Kolumna kafli ze znacznikiem po lewej,
 * tekst w jednej linii (opcjonalnie krótki opis pod spodem).
 */
export const ChoiceRows: React.FC<ChoiceLayoutProps> = ({
  accent,
  options,
  selectedId,
  onSelect,
  label = 'WYBIERZ JEDNO',
  mono = false
}) => (
  <ChoiceZone accent={accent} label={label}>
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => (
        <ChoiceTile
          key={opt.id}
          accent={accent}
          state={selectedId === opt.id ? 'selected' : 'idle'}
          markerPosition="left"
          onClick={() => onSelect(opt.id)}
          className="px-3 py-2.5 items-center"
        >
          <div className="min-w-0">
            <span className={`block text-xs font-bold text-white leading-snug ${mono ? 'font-mono break-all' : ''}`}>
              {opt.label}
            </span>
            {opt.desc && <span className="block text-xs text-gray-300 leading-snug pt-0.5">{opt.desc}</span>}
          </div>
        </ChoiceTile>
      ))}
    </div>
  </ChoiceZone>
);
