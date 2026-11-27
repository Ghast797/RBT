// Minigry Misji 5 (Bank Bcorp) — unikalne dla tej misji (kontrakt silnika: config, onDecision, onComplete).
// Rejestruje je index.ts misji. Wspólne elementy misji: ui.tsx (ImageSlot), siteAssets.ts (grafiki).

export { IntelPdfApp } from './IntelPdfApp';
export { PageClonerApp } from './PageClonerApp';
export { VishingApp } from './VishingApp';
export { ImageSlot } from './ui';
export { resolveAsset, assetPath, ASSETS_DIR } from './siteAssets';
export * from './types';

import { IntelPdfApp } from './IntelPdfApp';
import { PageClonerApp } from './PageClonerApp';
import { VishingApp } from './VishingApp';

export const mission5Apps = {
  bc_intel_pdf: IntelPdfApp,
  bc_page_cloner: PageClonerApp,
  bc_vishing_call: VishingApp
};
