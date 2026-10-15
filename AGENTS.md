# ZASADY PROJEKTU: SILNIK SCENARIUSZY SCORM (HACKERS.OS)

## 🚨 KRYTYCZNE WYTYCZNE ARCHITEKTURY (BEZWZGLĘDNIE PRZESTRZEGAĆ)

### 1. ZAKAZ DUPLIKATÓW I ZAKAZ MODYFIKACJI RDZENIA
- **ZAKAZ**: NIE twórz żadnych folderów komponentów/store/typów poza `src/engine/` i `src/scenarios/`. Stare foldery `src/components/`, `src/data/`, `src/store/` zostały trwale usunięte.
- **ZAKAZ MODYFIKACJI SILNIKA**: Przy dodawaniu lub edycji scenariuszy (Misja 3, 4, 5...) **NIE MODYFIKUJ** plików w `src/engine/store/useMissionStore.ts` ani komponentów powłoki!
- Nowe scenariusze tworzy się **w 100% deklaratywnie** w `src/scenarios/mission_XX/data/missionX.json` za pomocą mechanizmu `transitions`.
- Jedyny wyjątek: Gdy tworzysz zupełnie nowy, unikalny widget minigry – utwórz go w `src/engine/widgets/` i zarejestruj w `appComponentRegistry` w `src/engine/registry/appRegistry.tsx`.

### 2. SCENARIUSZE TO ODDZIELNE PACZKI SCORM DLA MOODLE
- Każdy scenariusz (np. Misja 3 – O&L Company, Misja 4 – Energy Rock) to **niezależna paczka SCORM 2004 (.zip)** do osadzenia w Moodle (`mod_scorm`).
- **ZAKAZ**: W interfejsie graficznym gracza (wewnątrz aplikacji) **NIE MOŻE BYĆ** żadnego przełącznika ani selektora scenariuszy. Student w systemie LMS rozwiązuje jeden, konkretny scenariusz.
- Każda paczka SCORM musi bezpośrednio i autonomicznie ładować przypisany do niej scenariusz.

### 3. ŚCISŁY PODZIAŁ NA SILNIK I SCENARIUSZE
- **Silnik do tworzenia gry (`O&L_MVP/src/engine/`)**:
  - Współdzielona platforma techniczna dla wszystkich scenariuszy:
    - Obsługa okien i pulpitu (`CyberWindow`, `Desktop`, `Taskbar`)
    - Sekwencja BIOS i intro (`BootSequence`)
    - Integracja SCORM 2004 4th Edition (`scorm2004.ts`) oraz xAPI (`xapi.ts`)
    - Synteza audio i efekty dźwiękowe (`soundEffects.ts`)
    - Zarządzanie stanem i punktacją w Zustand (`useMissionStore.ts`)
    - Uniwersalne aplikacje silnika: Czat z Byte_Masterem (`ChatApp`), Raport pooperacyjny (`DebriefApp`)
    - Typy i schematy danych (`types/mission.ts`)
    - Katalog 11 reużywalnych widgetów minigier (`src/engine/widgets/`)
- **Scenariusze (`O&L_MVP/src/scenarios/`)**:
  - Każdy scenariusz w osobnym, dedykowanym katalogu:
    - `src/scenarios/mission_03_ol_company/`
    - `src/scenarios/mission_04_energy_rock/`
  - Scenariusz zawiera **WYŁĄCZNIE**:
    - Specyfikację danych JSON (`data/missionX.json`)
    - Dokumentację i materiały źródłowe (`docs/`)
    - Plik rejestracyjny (`index.ts`)

### 4. NIEZALEŻNE BUDOWANIE PACZEK SCORM DLA KAŻDEGO SCENARIUSZA
- Budowanie paczek SCORM musi umożliwiać wygenerowanie oddzielnego archiwum ZIP dla każdej misji z osobna:
  - `node scripts/package-scorm.js --mission=3` -> tworzy `dist/scorm-mission-3-ol-company.zip`
  - `node scripts/package-scorm.js --mission=4` -> tworzy `dist/scorm-mission-4-energy-rock.zip`
- Podczas budowania paczki, zmienna środowiskowa `VITE_MISSION_ID` oraz manifest `imsmanifest.xml` ustawiają twarde powiązanie z konkretnym scenariuszem, dzięki czemu w Moodle moduł działa w 100% samodzielnie.

### 5. TESTOWANIE W PRZEGLĄDARCE
- W trybie deweloperskim przełączanie misji odbywa się wyłącznie poprzez parametr URL:
  - `http://localhost:5173/?mission=3`
  - `http://localhost:5173/?mission=4`

---

## 🎬 PROCEDURA TWORZENIA NOWEGO SCENARIUSZA Z NAGRANIA WIDEO VR

1. Wypisz chronologicznie wszystkie wybory gracza (1, 2, 3...) i przypisz im 3 poziomy:
   - `ideal` (pełne punkty i nagroda BTC),
   - `suboptimal` (błąd niekrytyczny – kara punktowa i ułamka BTC, ale gracz kontynuuje),
   - `critical` (błąd krytyczny – wykrycie przez SOC, alarm dźwiękowy, ekran `ZOSTAŁEŚ WYKRYTY!` i modal powtórki).
2. Dobierz istniejące widgety (`componentId`) z `src/engine/widgets/` i skonfiguruj kafelki w `desktopApps`.
3. Skonfiguruj `data/missionX.json` z obiektem `transitions` (przejścia fabularne, odblokowania ikon, powiadomienia, wiadomości Byte_Mastera).
4. Zarejestruj misję w `src/engine/registry/missionRegistry.ts` oraz w `scripts/package-scorm.js`.
5. Uruchom `npm test` oraz zbuduj paczkę SCORM: `node scripts/package-scorm.js --mission=X`.
