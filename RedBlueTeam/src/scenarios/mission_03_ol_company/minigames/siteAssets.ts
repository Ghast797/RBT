// Grafiki minigier M3 (wzór: mission_02_carbon_flow/minigames/formAssets.ts).
// Właściciel wrzuca pliki do src/scenarios/mission_03_ol_company/assets/<grupa>/ — nazwa pliku to `name`
// z AssetRef w stages.ts (rozszerzenie dowolne: png, jpg, jpeg, webp, gif, svg). Grupy: virus, employees,
// events, usb, drone, rat. Brak pliku = zastępnik (`ImageSlot` w ui.tsx; w dev z podpisem, jakiego pliku brakuje).

// Rastry Vite skaluje do 1024 px i zapisuje jako WebP podczas budowania (vite-imagetools),
// tak samo jak grafiki M1 i M2. GIF/SVG idą bez zmian.
const raster = import.meta.glob<string>('../assets/*/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: { w: '1024', withoutEnlargement: 'true', format: 'webp' },
  import: 'default'
});
const other = import.meta.glob<string>('../assets/*/*.{gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
});
const files = { ...raster, ...other };

/** Klucz `grupa/nazwa` (bez rozszerzenia) -> adres obrazu. */
const urlsByKey = new Map(
  Object.entries(files).map(([path, url]) => {
    const [group, file] = path.split('/').slice(-2);
    return [`${group}/${file.replace(/\.[^.]+$/, '')}`, url] as const;
  })
);

/** Folder grafik (względem folderu misji), używany w podpisach zastępników. */
export const ASSETS_DIR = 'assets';

/** Adres obrazu z `assets/<group>/<name>.*` albo `undefined`, gdy pliku nie ma. */
export const resolveAsset = (group: string, name: string): string | undefined => urlsByKey.get(`${group}/${name}`);

/** Ścieżka, pod którą właściciel ma wrzucić plik (do podpisu zastępnika). */
export const assetPath = (group: string, name: string): string => `${ASSETS_DIR}/${group}/${name}.png`;
