# ZASADY PROJEKTU: SILNIK SCENARIUSZY SCORM (HACKERS.OS)

## 🚨 KRYTYCZNE WYTYCZNE ARCHITEKTURY (BEZWZGLĘDNIE PRZESTRZEGAĆ)

> **MODEL DOCELOWY:** `RedBlueTeam/docs/scenario-engine.md` (kontrakt, konwencje, katalog klocków), `scenario-format.md` (format `scenario.md`), `player-guidance.md` (prowadzenie gracza — jak ze scenariusza ustawić, by gracz wiedział, co robić), `vr-to-scenario-skill.md` (skill). Trwa migracja z modelu `transitions`/widgety na model etapów/klocków — poniższe zasady opisują stan docelowy.

### 1. PODZIAŁ SILNIK / SCENARIUSZE, BEZ DUPLIKATÓW
- **ZAKAZ**: NIE twórz folderów komponentów/store/typów poza `src/engine/` i `src/scenarios/`.
- **Silnik rozwija się przez wspólne mechanizmy, nie przez gałęzie per misja.** Kontrakt klocka (`reportDecision`, `completeStage`) i punktacja z poziomów są w silniku raz. Dodając misję, nie rozgałęziaj `useMissionStore.ts` jej identyfikatorem.
- **Nowa misja = jej własny folder:** etapy i dane klocków (`stages`, `blocks`) plus minigry unikalne dla misji w `src/scenarios/mission_XX/minigames/`.
- **Klocek wielokrotnego użytku** mieszka w `src/engine/blocks/`. Minigra trafia tam dopiero, gdy użyje jej druga misja (reguła dwóch).

### 1a. APLIKACJE PAMIĘTAJĄ STAN (ZASADA SILNIKA)
- Każda aplikacja na pulpicie HACKERS.OS — we wszystkich misjach — ma przycisk wyjścia na pulpit (krzyżyk **X** w prawym górnym rogu terminala, jak w systemie operacyjnym) i po ponownym otwarciu wraca dokładnie tam, gdzie gracz ją zostawił. Zaliczonej aktywności nie robi się od nowa.
- Zapewnia to silnik (`AppHost` + `openedApps`, `completedStages` w `useMissionStore.ts`), nie minigra. W klockach i minigrach używaj zwykłego stanu Reacta; nie resetuj go przy zamknięciu i nie renderuj aplikacji poza `AppHost`. Stan czyści tylko powtórka misji.
- Szczegóły: `RedBlueTeam/docs/scenario-engine.md`, sekcja 5 („Pamięć stanu aplikacji”).

### 2. SCENARIUSZE TO ODDZIELNE PACZKI SCORM DLA MOODLE
- Każdy scenariusz (np. Misja 3 – O&L Company, Misja 4 – Energy Rock) to **niezależna paczka SCORM 2004 (.zip)** do osadzenia w Moodle (`mod_scorm`).
- **ZAKAZ**: W interfejsie graficznym gracza (wewnątrz aplikacji) **NIE MOŻE BYĆ** żadnego przełącznika ani selektora scenariuszy. Student w systemie LMS rozwiązuje jeden, konkretny scenariusz.
- Każda paczka SCORM musi bezpośrednio i autonomicznie ładować przypisany do niej scenariusz.

### 3. ŚCISŁY PODZIAŁ NA SILNIK I SCENARIUSZE
- **Silnik do tworzenia gry (`RedBlueTeam/src/engine/`)**:
  - Współdzielona platforma techniczna dla wszystkich scenariuszy:
    - Obsługa okien i pulpitu (`CyberWindow`, `Desktop`, `Taskbar`)
    - Sekwencja BIOS i intro (`BootSequence`)
    - Integracja SCORM 2004 4th Edition (`scorm2004.ts`) oraz xAPI (`xapi.ts`)
    - Synteza audio i efekty dźwiękowe (`soundEffects.ts`)
    - Stan i punktacja w Zustand (`useMissionStore.ts`), punktacja z poziomów (`core/scoring.ts`)
    - Kontrakt klocka/minigry: `reportDecision`, `completeStage` (zob. `docs/scenario-engine.md`, sekcja 5)
    - Uniwersalne aplikacje silnika: Czat z Byte_Masterem (`ChatApp`), Raport pooperacyjny (`DebriefApp`)
    - Typy i schematy danych (`types/mission.ts`)
    - Katalog reużywalnych klocków (`src/engine/blocks/`: `ChoiceCards`, `DialogueTree`, …)
- **Scenariusze (`RedBlueTeam/src/scenarios/`)**:
  - Każdy scenariusz w osobnym katalogu, np. `src/scenarios/mission_04_energy_rock/`, zawiera:
    - `scenario.md` — źródło prawdy (format: `docs/scenario-format.md`)
    - definicję misji: meta, intro, `desktopApps`, `stages`, `blocks`, debrief (`data/*.json` + `stages.ts`)
    - `minigames/` — minigry unikalne dla misji (kontrakt silnika)
    - `docs/` — materiały źródłowe (PDF, notatki z nagrania VR)
    - `index.ts` — składa i rejestruje definicję

### 4. NIEZALEŻNE BUDOWANIE PACZEK SCORM DLA KAŻDEGO SCENARIUSZA (IZOLACJA BUNDLE'A)
- Każda paczka SCORM zawiera **fizycznie w kodzie wyłącznie jeden wybrany scenariusz** (oraz wspólny silnik). Pozostałe scenariusze, ich minigry i pliki JSON są całkowicie odrzucane przez mechanizm Tree-Shaking w Vite (`virtual:active-scenario`).
- Budowanie paczek SCORM umożliwia wygenerowanie oddzielnego archiwum ZIP dla każdej misji z osobna:
  - `node scripts/package-scorm.js --mission=3` -> tworzy `dist/scorm-mission-3-ol-company.zip`
  - `node scripts/package-scorm.js --mission=4` -> tworzy `dist/scorm-mission-4-energy-rock.zip`
  - `node scripts/package-scorm.js --all` -> buduje kolejno wszystkie odizolowane paczki
- Podczas budowania paczki, zmienna środowiskowa `VITE_MISSION_ID` oraz manifest `imsmanifest.xml` ustawiają twarde powiązanie z konkretnym scenariuszem, a wynikowy plik JS nie zawiera żadnych danych ani kodu innych misji.

### 5. TESTOWANIE W PRZEGLĄDARCE
- W trybie deweloperskim przełączanie misji odbywa się poprzez parametr URL:
  - `http://localhost:5173/?mission=3`
  - `http://localhost:5173/?mission=4`
- Możliwe jest też uruchomienie dev serwera z izolacją konkretnej misji: `VITE_MISSION_ID=4 npm run dev`.
- Tryb deweloperski `?dev=1` (np. `http://localhost:5173/?mission=1&dev=1`) pomija intro i od razu odblokowuje wszystkie kafelki misji, więc dowolny etap można otworzyć bez przechodzenia gry od zera (`src/engine/core/devMode.ts`; w paczce SCORM ignorowany). Samo `?skipIntro=1` pomija tylko intro.

---

## 🎬 TWORZENIE NOWEGO SCENARIUSZA

1. **Scenariusz** (`scenario.md`) powstaje ze skilla VR→scenariusz. Format: `RedBlueTeam/docs/scenario-format.md`.
2. **Implementacja** wg `RedBlueTeam/docs/scenario-engine.md` i reguł prowadzenia gracza z `docs/player-guidance.md`:
   - utwórz katalog `src/scenarios/mission_XX_nazwa/` (Vite wykrywa go automatycznie);
   - dla każdej decyzji dobierz klocek z `src/engine/blocks/` albo napisz minigrę w `minigames/` misji (kontrakt silnika);
   - ustaw etapy tak, by w każdej chwili był jeden jasny następny krok (`player-guidance.md`);
   - złóż definicję misji (`desktopApps`, `stages`, `blocks`, intro, debrief) i w `index.ts` wyeksportuj standardowy kontrakt: `scenarioDefinition` oraz `scenarioApps`;
   - dodaj misję do `MISSION_CATALOG` w `scripts/package-scorm.js`.
3. **Weryfikacja**: `npm test` oraz `node scripts/package-scorm.js --mission=X` (sprawdź czy ZIP w `dist/` zawiera wyłącznie tę misję).

Poziomy decyzji: `ideal` (pełne punkty + BTC), `suboptimal` (część punktów, gra trwa), `critical` (0 pkt, ekran `ZOSTAŁEŚ WYKRYTY!` i powtórka). Punkty liczy silnik z poziomu — nie w widgecie.
