# ZASADY PROJEKTU: SILNIK SCENARIUSZY SCORM (HACKER.OS)

## 🚨 KRYTYCZNE WYTYCZNE ARCHITEKTURY (BEZWZGLĘDNIE PRZESTRZEGAĆ)

### 1. SCENARIUSZE TO ODDZIELNE PACZKI SCORM DLA MOODLE
- Każdy scenariusz (np. Misja 3 – O&L Company, Misja 4 – Energy Rock) to **niezależna paczka SCORM 2004 (.zip)** do osadzenia w Moodle (`mod_scorm`).
- **ZAKAZ**: W interfejsie graficznym gracza (wewnątrz aplikacji) **NIE MOŻE BYĆ** żadnego przełącznika ani selektora scenariuszy. Student w systemie LMS rozwiązuje jeden, konkretny scenariusz.
- Każda paczka SCORM musi bezpośrednio i autonomicznie ładować przypisany do niej scenariusz.

### 2. ŚCISŁY PODZIAŁ NA SILNIK I SCENARIUSZE
- **Silnik do tworzenia gry (`src/engine/`)**:
  - Współdzielona platforma techniczna dla wszystkich scenariuszy:
    - Obsługa okien i pulpitu (`CyberWindow`, `Desktop`, `Taskbar`)
    - Sekwencja BIOS i intro (`BootSequence`)
    - Integracja SCORM 2004 4th Edition (`scorm2004.ts`) oraz xAPI (`xapi.ts`)
    - Synteza audio i efekty dźwiękowe (`soundEffects.ts`)
    - Zarządzanie stanem i punktacją w Zustand (`useMissionStore.ts`)
    - Uniwersalne aplikacje silnika: Czat z Byte_Masterem (`ChatApp`), Raport pooperacyjny (`DebriefApp`)
    - Typy i schematy danych (`types/mission.ts`)
- **Scenariusze (`src/scenarios/`)**:
  - Każdy scenariusz w osobnym, dedykowanym katalogu:
    - `src/scenarios/mission_03_ol_company/`
    - `src/scenarios/mission_04_energy_rock/`
  - Scenariusz zawiera:
    - Specyfikację danych JSON (`data/missionX.json`)
    - Dedykowane minigry i narzędzia specyficzne dla danej misji (`apps/`)
    - Dokumentację i materiały źródłowe (`docs/`)

### 3. NIEZALEŻNE BUDOWANIE PACZEK SCORM DLA KAŻDEGO SCENARIUSZA
- Budowanie paczek SCORM musi umożliwiać wygenerowanie oddzielnego archiwum ZIP dla każdej misji z osobna:
  - `node scripts/package-scorm.js --mission=3` -> tworzy `dist/scorm-mission-3-ol-company.zip`
  - `node scripts/package-scorm.js --mission=4` -> tworzy `dist/scorm-mission-4-energy-rock.zip`
- Podczas budowania paczki, zmienna środowiskowa `VITE_MISSION_ID` oraz manifest `imsmanifest.xml` ustawiają twarde powiązanie z konkretnym scenariuszem, dzięki czemu w Moodle moduł działa w 100% samodzielnie.

### 4. TESTOWANIE W PRZEGLĄDARCE
- W trybie deweloperskim przełączanie misji odbywa się wyłącznie poprzez parametr URL:
  - `http://localhost:5173/?mission=3`
  - `http://localhost:5173/?mission=4`
