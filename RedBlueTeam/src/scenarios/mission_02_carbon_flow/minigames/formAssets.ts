// Grafiki szablonów formularzy w //PHISHING (krok 2/4).
// Wrzuć obrazek do src/scenarios/mission_02_carbon_flow/assets/forms/ — nazwa pliku to id opcji
// ze stages.ts (poodle_forms, quickgram, kneenook), rozszerzenie dowolne (png, jpg, jpeg, webp, gif, svg).
// Brak pliku = zastępnik (w dev z podpisem, jakiego pliku brakuje).

// Rastry Vite skaluje do 1024 px i zapisuje jako WebP podczas budowania (vite-imagetools),
// tak samo jak grafiki Misji 1. GIF/SVG idą bez zmian.
const raster = import.meta.glob<string>('../assets/forms/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: { w: '1024', withoutEnlargement: 'true', format: 'webp' },
  import: 'default'
});
const other = import.meta.glob<string>('../assets/forms/*.{gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
});
const files = { ...raster, ...other };

const urlsByName = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url])
);

export const FORM_ASSETS_DIR = 'assets/forms';

export const resolveFormImage = (name: string): string | undefined => urlsByName.get(name);
