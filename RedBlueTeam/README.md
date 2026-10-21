# SILNIK SCENARIUSZY SZKOLENIOWYCH SCORM 2004 (HACKER.OS)

Wielomodułowy silnik w React + TypeScript do tworzenia cyberbezpiecznych gier symulacyjnych zgodnych ze standardami **SCORM 2004 (4th Edition)** oraz **xAPI (Tin Can API)**.

---

## 🚨 KLUCZOWA ZASADA PROJEKTU: OSOBNE PACZKI SCORM DLA MOODLE

- **Każdy scenariusz to NIEZALEŻNA paczka SCORM (.zip)** do osadzenia jako odrębna aktywność w Moodle (`mod_scorm`).
- W interfejsie gracza **NIE MA żadnego przełącznika scenariuszy**. Użytkownik w Moodle uruchamia i przechodzi wyłącznie jeden, dedykowany moduł szkoleniowy.
- Każda paczka posiada własną kompilację i manifest `imsmanifest.xml`, startując bezpośrednio w dedykowanej misji.

---

## 🏗️ PODZIAŁ NA SILNIK I SCENARIUSZE

```text
c:\RBT_web\
├── GEMINI.md                                 <-- Główne wytyczne architektoniczne dla agentów AI
├── Assets/                                   <-- Oryginalne materiały i specyfikacje
│   └── Misja_04_Energy_Rock/
│
└── RedBlueTeam/
    ├── src/
    │   ├── engine/                           <-- SILNIK DO TWORZENIA GRY (Game Engine)
    │   │   ├── components/                   <-- BootSequence, CyberWindow, Desktop, Taskbar
    │   │   ├── apps/                         <-- Uniwersalne aplikacje: ChatApp, DebriefApp
    │   │   ├── registry/                     <-- appRegistry, missionRegistry
    │   │   ├── store/                        <-- useMissionStore (Zustand)
    │   │   ├── scorm/                        <-- scorm2004 (4th Ed), xapi
    │   │   ├── audio/                        <-- soundEffects (Web Audio API)
    │   │   └── types/                        <-- Typy danych TypeScript
    │   │
    │   └── scenarios/                        <-- OSOBNE SCENARIUSZE (Scenarios)
    │       ├── mission_03_ol_company/        <-- Scenariusz 3: O&L Company (USB, Dron, RAT)
    │       │   ├── data/mission3.json
    │       │   └── apps/ (DroneApp, PendriveApp, RatSessionApp, TorBrowserApp, VirusDatabaseApp)
    │       │
    │       └── mission_04_energy_rock/       <-- Scenariusz 4: Energy Rock (Ransomware, Spear-phishing)
    │           ├── data/mission4.json
    │           └── apps/ (RansomwareVirusApp, RansomwareBuilderApp, PhishingMailApp, VpnApp, WorkstationExfiltrationApp, NegotiationChatApp)
```

---

## 📦 GENEROWANIE NIEZALEŻNYCH PACZEK SCORM

Każdy scenariusz buduje się i pakuje niezależnie poleceniami:

### 1. Paczka dla Misji 4 (Energy Rock):
```bash
npm run build:scorm:m4
# lub: node scripts/package-scorm.js --mission=4
```
Tworzy: **`dist/scorm-mission-4-energy-rock.zip`** — gotową paczkę SCORM 2004 bezpośrednio ładującą Misję 4 w Moodle.

### 2. Paczka dla Misji 3 (O&L Company):
```bash
npm run build:scorm:m3
# lub: node scripts/package-scorm.js --mission=3
```
Tworzy: **`dist/scorm-mission-3-ol-company.zip`** — gotową paczkę SCORM 2004 bezpośrednio ładującą Misję 3 w Moodle.

### 3. Zbudowanie wszystkich paczek naraz:
```bash
npm run build:scorm:all
# lub: node scripts/package-scorm.js --all
```
Tworzy oba niezależne archiwa `.zip` w folderze `dist/`.

---

## 💻 TESTOWANIE W PRZEGLĄDARCE (DEV)

W lokalnym środowisku deweloperskim misję wskazuje się parametrem URL:
- `http://localhost:5173/?mission=4`
- `http://localhost:5173/?mission=3`

Uruchomienie serwera dev:
```bash
node node_modules/vite/bin/vite.js
```

---

## 🧪 TESTY AUTOMATYCZNE
```bash
node node_modules/vitest/vitest.mjs run
```
Pakiet zawiera 23 testy jednostkowe i integracyjne (w tym pełny test przebiegu Misji 4 i SCORM 2004 w `tests/mission4.test.ts`).
