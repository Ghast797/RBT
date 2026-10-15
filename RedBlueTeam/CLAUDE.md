# ZASADY PROJEKTU DLA AGENTÓW AI: SILNIK SCENARIUSZY SCORM (HACKERS.OS)

## 🚨 RYGORY ARCHITEKTURY (BEZWZGLĘDNIE PRZESTRZEGAĆ)

> **MODEL DOCELOWY (źródło prawdy):** `docs/scenario-engine.md`, `docs/scenario-format.md`, `docs/vr-to-scenario-skill.md`. Trwa migracja z `transitions`/widgety na etapy/klocki.

### 1. PODZIAŁ SILNIK / SCENARIUSZE, BEZ DUPLIKATÓW
- **ZAKAZ**: NIE twórz folderów komponentów/store/typów poza `src/engine/` i `src/scenarios/`.
- Silnik rozwija się przez wspólne mechanizmy (kontrakt klocka `reportDecision`/`completeStage`, punktacja z poziomów), nie przez gałęzie `useMissionStore.ts` per misja.
- Nowa misja = jej folder: `stages` + `blocks` + minigry w `scenarios/mission_XX/minigames/`.
- Klocek wielokrotnego użytku w `src/engine/blocks/`; minigra trafia tam dopiero przy drugim użyciu (reguła dwóch).

### 2. SCENARIUSZE TO NIEZALEŻNE PACZKI SCORM DLA MOODLE
- Każda misja to osobna, autonomiczna paczka SCORM 2004 (`dist/scorm-mission-X.zip`).
- **ZAKAZ**: W interfejsie graficznym gracza **NIE MA** żadnego selektora scenariuszy. W Moodle student rozwiązuje wyłącznie przypisaną misję.
- W trybie deweloperskim przełączanie misji odbywa się wyłącznie przez parametr URL: `http://localhost:5173/?mission=3` lub `?mission=4`.

---

## 🗺️ MAPA PLIKÓW PROJEKTU

```
src/
├── engine/                     # RDZEŃ SILNIKA (Współdzielony dla wszystkich misji)
│   ├── apps/                   # Czat z Byte_Masterem (ChatApp), Raport końcowy (DebriefApp)
│   ├── audio/                  # Efekty dźwiękowe Web Audio API (soundEffects.ts)
│   ├── components/             # Desktop, Dual-Screen, BootSequence, CyberWindow, Taskbar
│   ├── registry/               # missionRegistry.ts, appRegistry.tsx
│   ├── scorm/                  # scorm2004.ts, xapi.ts
│   ├── store/                  # useMissionStore.ts (Zustand)
│   ├── types/                  # mission.ts (typy i schematy danych)
│   └── widgets/                # Baza 11 reużywalnych minigier (Virus, Builder, TorBrowser, Pendrive, Drone, RAT, Mail, Vpn, Workstation, Negotiation, Debrief)
└── scenarios/                  # SCENARIUSZE (Tylko dane deklaratywne)
    ├── mission_03_ol_company/  # data/mission3.json, index.ts
    └── mission_04_energy_rock/ # data/mission4.json, docs/, index.ts
```

---

## 🎬 PROCEDURA TWORZENIA NOWEGO SCENARIUSZA Z NAGRANIA WIDEO VR

Gdy użytkownik przekaże nagranie wideo lub transkrypcję scenariusza z gry VR:
1. **Ekstrakcja Kroków i Decyzji**:
   - Wypisz chronologicznie wszystkie wybory gracza (1, 2, 3...).
   - Dla każdego wyboru określ 3 poziomy:
     - `ideal` (decyzja optymalna – pełne punkty i nagroda BTC),
     - `suboptimal` (błąd niekrytyczny – potrącenie punktów i ułamka BTC np. -0.45 do -0.89 BTC, ale operacja toczy się dalej),
     - `critical` (błąd krytyczny – wykrycie przez SOC/alarm, syrena, przerwanie gry ekranem `ZOSTAŁEŚ WYKRYTY!` i modal powtórki).
2. **Dobór Widgetów z `src/engine/widgets/`**:
   - Dobierz istniejące widgety (`componentId`): `virus_database`, `ransomware_virus_scanner`, `ransomware_builder`, `browser`, `pendrive_app`, `drone_app`, `rat_session`, `mail`, `vpn_app`, `victim_workstation`, `negotiation`.
   - Zdefiniuj kafelki w tablicy `desktopApps` w JSON (z flagami `unlockedOnly` dla blokowanych początkowo).
3. **Konfiguracja `data/missionX.json`**:
   - `mission`: ID, tytuł, firma, nagroda BTC, maxScore, passingScore.
   - `intro`: Rozmowa telefoniczna wstępna i linie sekwencji startowej BIOS.
   - `transitions`: Deklaratywne przejścia fabularne (`unlockIcons`, `badges`, `timeJump`, `byteMasterMessages`, `nextChatChoices`).
   - `step6`: Podsumowanie, tabela wyborów do debriefu i slajdy edukacyjne.
4. **Rejestracja Misji**:
   - Utwórz `src/scenarios/mission_XX/index.ts` re-eksportujący definicję.
   - Dodaj misję w `src/engine/registry/missionRegistry.ts`.
   - Dodaj alias w `scripts/package-scorm.js`.
5. **Weryfikacja**:
   - Uruchom `npm test` – wszystkie testy muszą przechodzić w 100%.
   - Zbuduj paczkę SCORM: `node scripts/package-scorm.js --mission=X`.
