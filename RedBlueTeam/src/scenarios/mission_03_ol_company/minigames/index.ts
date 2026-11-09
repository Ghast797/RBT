// Minigry Misji 3 (O&L Company) — unikalne dla tej misji (kontrakt silnika: config, onDecision, onComplete).
// Rejestruje je index.ts misji. Wspólne elementy: ui.tsx (ImageSlot, czasy ładowania), siteAssets.ts (grafiki),
// report.ts (budowanie raportu decyzji). Obecne komponenty to zaślepki z porcji B (zob. stub.tsx).

export { VirusLabApp } from './VirusLabApp';
export { OsintBrowserApp } from './OsintBrowserApp';
export { PendriveApp } from './PendriveApp';
export { DroneApp } from './DroneApp';
export { RatSessionApp } from './RatSessionApp';
export { ImageSlot, LOADER_MS, LOADER_LONG_MS } from './ui';
export { resolveAsset, assetPath, ASSETS_DIR } from './siteAssets';
export { buildReport, reportAnswerOf } from './report';
export * from './types';
