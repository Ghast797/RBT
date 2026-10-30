// Grafiki do //SOCIAL_MEDIA.
// Wrzuć obrazek do src/scenarios/mission_01_petrolog/assets/social/ — nazwa pliku to id platformy
// (kneenook, quickgram, joinin) albo id wpisu ze stages.ts (kn_1, qg_2, ji_3, …), rozszerzenie dowolne.
// Brak pliku = zastępnik (w dev z podpisem, jakiego pliku brakuje).

// Rastry Vite skaluje do 1024 px i zapisuje jako WebP podczas budowania (vite-imagetools),
// więc oryginał z generatora może trafić tu bez ręcznej optymalizacji. GIF/SVG idą bez zmian.
const raster = import.meta.glob<string>('../assets/social/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: { w: '1024', withoutEnlargement: 'true', format: 'webp' },
  import: 'default'
});
const other = import.meta.glob<string>('../assets/social/*.{gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
});
const files = { ...raster, ...other };

const urlsByName = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url])
);

export const SOCIAL_ASSETS_DIR = 'assets/social';

export const resolveSocialImage = (name: string): string | undefined => urlsByName.get(name);
