# Silnik Scenariuszy SCORM 2004 (HACKERS.OS) — Przewodnik Twórcy

## 🚨 ZASADA NACZELNA
Każdy scenariusz to **autonomiczna paczka SCORM 2004 (.zip)** dla Moodle (`mod_scorm`).
W interfejsie użytkownika **NIE MA przełącznika scenariuszy**. Każda paczka po wgraniu do Moodle startuje wyłącznie w swoim scenariuszu.

---

## 1. Jak dodać nowy scenariusz do silnika

1. Utwórz dedykowany folder w `src/scenarios/mission_XX_nazwa/`:
   - `data/missionXX.json` (dane fabularne, wstęp BIOS, dialogi, aplikacje pulpitu, slajdy podsumowania)
   - `apps/` (komponenty minigier specyficzne dla danego scenariusza)
   - `index.ts` (eksport definicji i mapy aplikacji)
2. Zarejestruj nowy scenariusz w:
   - `src/engine/registry/missionRegistry.ts` (mapa misji)
   - `src/engine/registry/appRegistry.tsx` (obsługa minigier w rendererze)
   - `scripts/package-scorm.js` (katalog do automatycznego pakowania SCORM)

---

## 2. Niezależne budowanie paczek SCORM (.zip)

Każdy scenariusz buduje się oddzielnie:
```bash
# Budowa paczki dla Misji 4 (Energy Rock)
npm run build:scorm:m4
# lub: node scripts/package-scorm.js --mission=4

# Budowa paczki dla Misji 3 (O&L Company)
npm run build:scorm:m3
# lub: node scripts/package-scorm.js --mission=3

# Budowa wszystkich paczek
npm run build:scorm:all
# lub: node scripts/package-scorm.js --all
```

Wygenerowane pliki `.zip` w `dist/` są w 100% gotowe do bezpośredniego wgrania do Moodle.

---

## 3. Testowanie lokalne (Dev)

W środowisku deweloperskim misję wybiera się przez URL:
- `http://localhost:5173/?mission=4`
- `http://localhost:5173/?mission=3`

Testy jednostkowe i integracyjne:
```bash
node node_modules/vitest/vitest.mjs run
```
