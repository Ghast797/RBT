// Minigry Misji 3 (O&L Company) — unikalne dla tej misji (kontrakt silnika: config, onDecision, onComplete).
// Rejestruje je index.ts misji. Wspólne elementy misji: ui.tsx (ImageSlot), siteAssets.ts (grafiki).
// Z silnika: core/report.ts (budowanie raportu decyzji), LOADER_MS / LOADER_LONG_MS przy components/ModuleLoader.tsx,
// blocks/ScratchMatrix.tsx (zdrapka).

export { VirusLabApp } from './VirusLabApp';
export { OsintBrowserApp } from './OsintBrowserApp';
export { PendriveApp } from './PendriveApp';
export { DroneApp } from './DroneApp';
export { RatSessionApp } from './RatSessionApp';
export { ImageSlot } from './ui';
export { resolveAsset, assetPath, ASSETS_DIR } from './siteAssets';
export * from './types';
