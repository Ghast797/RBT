# PROJEKT SYSTEMU SCENARIUSZY SZKOLENIOWYCH HACKER.OS (RBT)

Wielomodułowy silnik symulacji cyberbezpieczeństwa zgodny z **SCORM 2004 (4th Edition)** oraz **xAPI** dla platformy LMS Moodle.

## 📁 Struktura projektu (`c:\RBT_web\`):

```text
c:\RBT_web\
├── Assets/                                 <-- ORYGINALNE ASSETY I DOKUMENTACJE
│   └── Misja_04_Energy_Rock/
│       ├── mission4.json                   <-- Definicja scenariusza 4
│       └── Scenariusz Misja 4 - Energy Rock v2.pdf <-- Pełna specyfikacja techniczna
│
├── O&L_MVP/                                <-- KOD ŹRÓDŁOWY APLIKACJI I SILNIKA
│   ├── src/
│   │   ├── engine/                         <-- SILNIK DO TWORZENIA GRY (Game Engine)
│   │   │   ├── apps/                       <-- Uniwersalne aplikacje (Chat, Debriefing)
│   │   │   ├── audio/                      <-- Syntezator SFX (soundEffects)
│   │   │   ├── components/                 <-- Desktop, Taskbar, CyberWindow, BootSequence
│   │   │   ├── registry/                   <-- appRegistry, missionRegistry
│   │   │   ├── scorm/                      <-- scorm2004, xapi
│   │   │   ├── store/                      <-- useMissionStore (Zustand)
│   │   │   └── types/                      <-- Typy TypeScript silnika
│   │   │
│   │   └── scenarios/                      <-- OSOBNE SCENARIUSZE (Scenarios)
│   │       ├── mission_03_ol_company/      <-- Scenariusz 3: O&L Company (zrzut dronem, RAT)
│   │       └── mission_04_energy_rock/     <-- Scenariusz 4: Energy Rock (Ransomware, Spear-Phishing)
│   │
│   ├── tests/                              <-- Testy automatyczne (Vitest)
│   └── scripts/package-scorm.js            <-- Narzędzie budujące paczki ZIP SCORM 2004
│
├── AGENTS.md                               <-- Instrukcje architektoniczne dla agentów AI
├── GEMINI.md                               <-- Wytyczne projektowe (SCORM, Moodle, podział modułów)
└── package.json                            <-- Główne skrypty workspace
```

---

## 🚀 Szybki start

### Z poziomu głównego katalogu (`c:\RBT_web\`):
- **Instalacja zależności**: `npm install`
- **Uruchomienie w trybie dev**: `npm run dev` (domyślnie `http://localhost:5173/?mission=4`)
- **Uruchomienie testów**: `npm test`
- **Budowanie paczek SCORM 2004**:
  - Misja 4 (Energy Rock): `npm run build:scorm:m4`
  - Misja 3 (O&L Company): `npm run build:scorm:m3`
  - Wszystkie misje naraz: `npm run build:scorm:all`

### Lub bezpośrednio w podkatalogu aplikacji (`c:\RBT_web\O&L_MVP\`):
- `cd O&L_MVP`
- `npm install`
- `npm run dev`
- `npm test`
- `node scripts/package-scorm.js --all`

---

## 🚨 Główne zasady architektury:
1. **Każdy scenariusz to niezależna paczka SCORM 2004** – brak przełącznika misji w interfejsie studenta.
2. **Ścisły podział**: silnik gry (`O&L_MVP/src/engine/`) a logika konkretnych scenariuszy (`O&L_MVP/src/scenarios/`).
3. **Parametr URL w DEV**: Przełączanie misji lokalnie odbywa się przez `?mission=3` lub `?mission=4`.
