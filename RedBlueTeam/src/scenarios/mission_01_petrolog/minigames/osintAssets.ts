// Zdjęcia pracowniczek do //WYSZUKIWARKA: OSINT.
// Wrzuć obrazek do src/scenarios/mission_01_petrolog/assets/osint/ — nazwa pliku to id profilu ze stages.ts
// (marcelina_sojka, anita_klimek), rozszerzenie dowolne.
// Brak pliku = inicjały (w dev dodatkowo zastępnik z podpisem, jakiego pliku brakuje).

const files = import.meta.glob<string>('../assets/osint/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default'
});

const urlsByName = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url])
);

export const OSINT_ASSETS_DIR = 'assets/osint';

export const resolveOsintImage = (name: string): string | undefined => urlsByName.get(name);
