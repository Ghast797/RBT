import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { resolveFormImage, FORM_ASSETS_DIR } from './formAssets';
import { ChoiceZone, ChoiceTile } from '../../../engine/components/ChoiceZone';
import { sounds } from '../../../engine/audio/soundEffects';
import type { ChoiceOption } from '../../../engine/types/mission';

/**
 * Wspólne elementy interfejsu minigier Misji 2 (wzorzec: minigry Misji 1, np. EmailSenderApp).
 * Przycisk zatwierdzenia (`ConfirmButton`) i panel prawego monitora (`SidePanel`) są wspólne z M1
 * i mieszkają w `engine/components/`. Tu zostają elementy używane tylko w M2. Interfejs nie ujawnia
 * oceny wyboru.
 */

/** Lista opcji w ramce wyboru (kafelki z rogowym znacznikiem, jak w M1). */
export const OptionCards: React.FC<{
  accent: string;
  options: ChoiceOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
  mono?: boolean;
}> = ({ accent, options, selectedId, onSelect, label = 'WYBIERZ JEDNO', mono = false }) => (
  <ChoiceZone accent={accent} label={label}>
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <ChoiceTile
          key={opt.id}
          accent={accent}
          state={selectedId === opt.id ? 'selected' : 'idle'}
          markerPosition="corner"
          onClick={() => {
            sounds.playClick();
            onSelect(opt.id);
          }}
          className="p-3.5"
        >
          <div className="space-y-2 pr-7">
            <h3 className={`text-xs font-bold text-white leading-snug ${mono ? 'font-mono break-all' : ''}`}>
              {opt.label}
            </h3>
            {opt.desc && <p className="text-sm text-gray-300 leading-relaxed">{opt.desc}</p>}
            {opt.tags && opt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
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

/** Karta informacyjna (bez przerywanej ramki — to nie jest wybór). */
export const InfoCard: React.FC<{ accent: string; children: React.ReactNode; className?: string }> = ({
  accent,
  children,
  className = ''
}) => (
  <div
    className={`p-5 rounded-xl border space-y-3 ${className}`}
    style={{ borderColor: `${accent}66`, backgroundColor: `${accent}12` }}
  >
    {children}
  </div>
);

/** Miejsce na grafikę: plik z assets/forms/<name>.*, w dev zastępnik z nazwą brakującego pliku. */
const ImageSlot: React.FC<{ name: string; label: string }> = ({ name, label }) => {
  const url = resolveFormImage(name);
  if (url) {
    return <img src={url} alt={label} className="w-full h-full object-cover" draggable={false} />;
  }
  return (
    <div className="w-full h-full bg-black/40 flex flex-col items-center justify-center text-center p-2 space-y-1">
      <ImageIcon size={26} className="text-gray-600" />
      {import.meta.env.DEV && (
        <>
          <span className="text-[0.625rem] font-bold text-gray-500 uppercase tracking-wider">{`GRAFIKA: ${label}`}</span>
          <span className="text-[0.5625rem] text-gray-600">{`${FORM_ASSETS_DIR}/${name}.png`}</span>
        </>
      )}
    </div>
  );
};

/** Karty wyboru z grafiką u góry i nazwą z podtytułem pod spodem (grafika wg `opt.id`). */
export const ImageOptionCards: React.FC<{
  accent: string;
  options: ChoiceOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
}> = ({ accent, options, selectedId, onSelect, label = 'WYBIERZ JEDNO' }) => (
  <ChoiceZone accent={accent} label={label}>
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt) => (
        <ChoiceTile
          key={opt.id}
          accent={accent}
          state={selectedId === opt.id ? 'selected' : 'idle'}
          markerPosition="corner"
          onClick={() => {
            sounds.playClick();
            onSelect(opt.id);
          }}
          className="overflow-hidden !block"
        >
          <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[10px] border-b border-gray-800">
            <ImageSlot name={opt.id} label={opt.label} />
          </div>
          <div className="p-3 space-y-1 text-center">
            <h3 className="text-xs font-bold text-white leading-snug">{opt.label}</h3>
            {opt.desc && <p className="text-xs text-gray-300 leading-relaxed">{opt.desc}</p>}
          </div>
        </ChoiceTile>
      ))}
    </div>
  </ChoiceZone>
);

/** Karty w siatce: duża, wyśrodkowana nazwa i krótka, neutralna definicja pod spodem. */
export const NameCards: React.FC<{
  accent: string;
  options: ChoiceOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
}> = ({ accent, options, selectedId, onSelect, label = 'WYBIERZ JEDNO' }) => (
  <ChoiceZone accent={accent} label={label}>
    <div className="grid grid-cols-3 gap-3">
      {options.map((opt) => (
        <ChoiceTile
          key={opt.id}
          accent={accent}
          state={selectedId === opt.id ? 'selected' : 'idle'}
          markerPosition="corner"
          onClick={() => {
            sounds.playClick();
            onSelect(opt.id);
          }}
          className="p-4 min-h-[11rem]"
        >
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[8.5rem] space-y-3">
            <h3 className="text-lg font-black text-white tracking-wider leading-tight">{opt.label}</h3>
            {opt.desc && <p className="text-base text-gray-200 leading-snug">{opt.desc}</p>}
          </div>
        </ChoiceTile>
      ))}
    </div>
  </ChoiceZone>
);
