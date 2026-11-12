# Motyw Moodle – Red Blue Team (jasny + ciemny)

Motyw Boost (Moodle 5.3) przestylowany według redblueteam.pl: ta sama paleta jasna i ciemna,
fonty Rajdhani / IBM Plex Mono / Inter, siatka w tle, numerowane karty misji („01 PETRO LOG”).
Tryb ciemny to wbudowany w Moodle 5.3 tryb Bootstrapa (`data-bs-theme="dark"`); przełącznik
słońce/księżyc w pasku górnym zapamiętuje wybór w przeglądarce, a domyślnie bierze ustawienie systemu.

Nie wymaga instalowania wtyczki ani dostępu do serwera.

## Pliki i gdzie je wkleić

| Plik | Miejsce w Moodle |
|---|---|
| `rbt-moodle.scss` | Administracja > Wygląd > Motywy > Boost > Ustawienia zaawansowane > **Surowy SCSS** |
| `head.html` | Administracja > Wygląd > Dodatkowy HTML > **W sekcji HEAD** |
| `footer.html` | Administracja > Wygląd > Dodatkowy HTML > **Przed zamknięciem BODY** |

Po zapisaniu SCSS Moodle przebudowuje CSS motywu (może być potrzebne „Wyczyść pamięć podręczną motywu”).

## Ograniczenia

- Logo w pasku jest pobierane z redblueteam.pl (`logo-h-dark.png` w jasnym, `logo-h.png` w ciemnym).
  Docelowo można wgrać pliki do Moodle i podmienić adresy w `--rbt-logo`.
- Tryb ciemny Moodle nie obejmuje treści w ramkach (SCORM, część wtyczek) – te wyglądają tak jak same z siebie.
- Moodle w trybie ciemnym podkreśla linki w treści (dostępność); zdejmujemy to tylko z nazw sekcji i aktywności.
