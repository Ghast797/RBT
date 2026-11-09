// Wspólne elementy interfejsu minigier M3. Prawy monitor w M3 to czat BYTE_MASTERA (żadna minigra nie
// wywołuje SideMonitor), więc nie ma tu notatek mentora. Wspólne z innymi misjami: AppHeader, ChoiceZone,
// ConfirmButton, ModuleLoader, usePointerDrag w engine/components/.

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { resolveAsset, assetPath } from './siteAssets';
import type { AssetRef } from './types';

/** Czas ładowania między ekranami minigier M3 (ms): standard M2 to ok. 1,5–2 s. */
export const LOADER_MS = 1700;
/** Dłuższe ładowanie dla „ciężkich” akcji (kompilacja, zapis planu). */
export const LOADER_LONG_MS = 2000;

/**
 * Miejsce na grafikę: plik z assets/<group>/<name>.*, w dev zastępnik z opisem i ścieżką brakującego pliku.
 * Wypełnia rodzica (`w-full h-full`); proporcje i rozmiar nadaje kontener.
 */
export const ImageSlot: React.FC<{
  asset: AssetRef;
  /** Opis grafiki (alt oraz podpis zastępnika w dev). */
  label: string;
  fit?: 'cover' | 'contain';
  className?: string;
}> = ({ asset, label, fit = 'cover', className = '' }) => {
  const url = resolveAsset(asset.group, asset.name);
  if (url) {
    return (
      <img
        src={url}
        alt={label}
        draggable={false}
        className={`w-full h-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
      />
    );
  }
  return (
    <div className={`w-full h-full bg-black/40 flex flex-col items-center justify-center text-center p-2 space-y-1 ${className}`}>
      <ImageIcon size={26} className="text-gray-600" />
      {import.meta.env.DEV && (
        <>
          <span className="text-[0.625rem] font-bold text-gray-500 uppercase tracking-wider">{`GRAFIKA: ${label}`}</span>
          <span className="text-[0.5625rem] text-gray-600">{assetPath(asset.group, asset.name)}</span>
        </>
      )}
    </div>
  );
};
