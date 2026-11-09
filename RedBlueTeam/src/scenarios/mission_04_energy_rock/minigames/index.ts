// Minigry Misji 4 (Energy Rock) — unikalne dla tej misji (kontrakt silnika: config, onDecision, onComplete).
// Rejestruje je index.ts misji. Wspólne elementy misji: ui.tsx (ImageSlot), siteAssets.ts (grafiki).
// Z silnika: core/report.ts, LOADER_MS / LOADER_LONG_MS (components/ModuleLoader.tsx), blocks/ScratchMatrix.tsx.
// Stan porcji B: pliki *App.tsx to zaślepki oparte o stub.tsx (zastępują je porcje C–G).

export { VirusLabApp } from './VirusLabApp';
export { RansomBuilderApp } from './RansomBuilderApp';
export { PhishingMailApp } from './PhishingMailApp';
export { RansomC2App } from './RansomC2App';
export { VictimChatApp } from './VictimChatApp';
export { ImageSlot } from './ui';
export { resolveAsset, assetPath, ASSETS_DIR } from './siteAssets';
export * from './types';
