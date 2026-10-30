// Zdjęcia pracowniczek do //WYSZUKIWARKA: OSINT.
// Wrzuć obrazek do src/scenarios/mission_01_petrolog/assets/osint/ — nazwa pliku to id profilu ze stages.ts
// (marcelina_sojka, anita_klimek), rozszerzenie dowolne.
// Brak pliku = inicjały (w dev dodatkowo zastępnik z podpisem, jakiego pliku brakuje).

// Rastry Vite skaluje do 1024 px i zapisuje jako WebP podczas budowania (vite-imagetools),
// więc oryginał z generatora może trafić tu bez ręcznej optymalizacji. GIF/SVG idą bez zmian.
const raster = import.meta.glob<string>('../assets/osint/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: { w: '1024', withoutEnlargement: 'true', format: 'webp' },
  import: 'default'
});
const other = import.meta.glob<string>('../assets/osint/*.{gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
});
const files = { ...raster, ...other };

const urlsByName = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url])
);

export const OSINT_ASSETS_DIR = 'assets/osint';

export const resolveOsintImage = (name: string): string | undefined => urlsByName.get(name);
