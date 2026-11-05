# Misja 3 (O&L Company) — specyfikacja migracji minigier

> Dokument dla agentów przenoszących pełne minigry M3 na wzorzec B. Pozwala
> przenieść minigrę **bez czytania** ~1000 linii starego przebiegu w
> `src/engine/store/useMissionStore.ts`. Kontekst: [`scenario-engine.md`](../../../../docs/scenario-engine.md)
> (sekcja 5 — kontrakt), [`mission-standard.md`](../../../../docs/mission-standard.md)
> (wygląd M2), [`player-guidance.md`](../../../../docs/player-guidance.md).

## Stan po szkielecie

M3 działa już na wzorcu B: `stages.ts` (etapy + `blocks`), `index.ts`
(`scenarioDefinition` / `scenarioApps`), `data/mission3.json`
(`intro.firstChoice`/`firstUnlock`, kafelki z łańcuchem odblokowań). Każdą
minigrę zastępuje na razie **cienki stub** w `minigames/`. Stary przebieg
(`chatStage` / `chooseChatOption`, widgety w `engine/widgets/`) **nadal
istnieje**, ale M3 go już nie używa — zniknie w etapie sprzątania silnika.

Twoje zadanie: zastąpić stub pełną minigrą, wciąż spełniającą kontrakt
`BlockProps<Config>` ( `{ config, onDecision, onComplete }` ). Dane bierzesz
**wyłącznie z `config`** (z `stages.ts`), nie ze store'a. Punktów nie liczysz —
zgłaszasz `onDecision({ num, question, answer, tier, feedback })`; przy `critical`
silnik sam odpala ekran „ZOSTAŁEŚ WYKRYTY!”. Po ostatniej decyzji (nie-critical)
wołasz `onComplete()` — silnik gra mostek i odblokowuje następny kafelek.

## Zasady wspólne (dotyczą każdej minigry)

- **Nie podpowiadaj oceny w UI** (mission-standard.md). Stary widget zdradzał
  odpowiedź — przy przenoszeniu **usuń** te elementy (lista niżej per minigra).
- **Tasuj opcje** przy montażu (`useShuffled` z `engine/core/shuffle.ts`),
  nigdy nie trzymaj „ideal” zawsze pierwszy.
- **Skala M1**: `AppHeader` (pasek ZADANIE), `ChoiceZone`/`ChoiceTile`, teksty
  `text-sm+`. Karty na dużym ekranie, wiersze na prawym monitorze
  (`SideMonitor`/`SidePanel`) — decyzja per ekran, cel: brak przewijania przy
  1366×768 i 1920×1080.
- **Pamięć stanu**: zwykły `useState`, bez resetu przy zamknięciu okna. Silnik
  (`AppHost`) trzyma aplikację zamontowaną. Nie montuj aplikacji poza `AppHost`,
  nie przenoś stanu do store'a.
- **Tempo**: `ModuleLoader` między ekranami, krótkie pauzy przy „akcjach
  komputerowych” (kompilacja, eksfiltracja, wysyłka).
- `config` czytasz z `blocks[<id kafelka>]` — silnik podaje go automatycznie
  (`AppRenderer`). Typy configów: `minigames/types.ts`. Dane: `stages.ts`.

Stare widgety (do podejrzenia UI, ale nie kopiuj z nich logiki ani oceny):
`src/engine/widgets/VirusDatabaseApp.tsx`, `TorBrowserApp.tsx`,
`PendriveApp.tsx`, `DroneApp.tsx`, `RatSessionApp.tsx`.

---

## 1. VirusLabApp — `//BAZA_WIRUSÓW`

- **Plik:** `minigames/VirusLabApp.tsx` · **componentId:** `ol_virus_lab` ·
  **kafelek/etap:** `virus_database` · **decyzje:** D1 (+ builder jako flavor).
- **config:** `VirusLabConfig` (`virusLabConfig` w `stages.ts`). `virus`
  (D1: 3 karty), `builder` (3 grupy przełączników z `correct: boolean` + `successMessage`).
- **Stary widget:** `engine/widgets/VirusDatabaseApp.tsx` (UI do podejrzenia).

### Ekrany po kolei
1. **Wybór wirusa (D1).** 3 karty: `RAT` (ideal), `KEYLOGGER` (suboptimal),
   `RANSOMWARE` (critical). Po wyborze:
   `onDecision({ num: 1, question: config.virus.question, answer: <label>, tier, feedback })`.
   - `critical` → zablokuj dalszy postęp (silnik pokaże wykrycie).
   - `ideal`/`suboptimal` → przejdź do buildera.
2. **Builder RAT (FLAVOR — bez oceny).** 3 grupy radio (`modules`, `masking`,
   `package`). Przycisk „KOMPILUJ ŁADUNEK”:
   - brak kompletu → komunikat „wybierz 3 parametry”;
   - zły zestaw → komunikat błędu z `feedback` błędnej opcji, **blokuje** dalej
     (jak flavor `VpnRouter` bez `decisionNum`); **nie** woła `onDecision` i
     **nie** odpala wykrycia;
   - komplet poprawny (`reverse_tcp` + `bg_service` + `dll_archive`) → krótka
     animacja kompilacji + `successMessage`, potem `onComplete()`.

### Decyzje
| num | kiedy | tier wg opcji |
|---|---|---|
| 1 | po wyborze karty wirusa | z `config.virus.options[].tier` |
| — | builder: brak oceny; blokuje dalej aż poprawny | — |

`onComplete()` po udanej kompilacji buildera.

### Co usunąć ze starego widgetu (zdradza ocenę)
- Etykiety `[WYBÓR SUBOPTYMALNY - KARA BTC]` / `[BŁĄD KRYTYCZNY - ALARM]` na kartach.
- Natychmiastowy czerwony/niebieski stan karty i `feedbackMsg` zaraz po wyborze.
- `[ZMIEŃ NA RAT]` i gałąź „kontynuuj z keyloggerem” (ocena przez UI).

### Decyzja projektowa (ważne)
Builder jest **nieoceniany** (pula M3 = 8 decyzji). W starym kodzie zły builder
wywoływał `triggerDetection` **bez numeru decyzji** (błąd). Tu zły builder tylko
blokuje kompilację komunikatem. Jeśli właściciel zechce buildera jako D9 —
patrz „Pytania do właściciela” w raporcie; wtedy trzeba dodać `decisionNum`,
`step6.choices[9]` i `decisionCount: 9`.

### Prawy monitor
Opcjonalnie: podgląd parametrów kompilacji na `SideMonitor`. Do oceny wizualnej.

### Test w przeglądarce (`?mission=3&dev=1`)
Otwórz `//BAZA_WIRUSÓW` → RAT → zły zestaw (np. Port Scan) = błąd i brak
przejścia; poprawny zestaw = kompilacja i mostek „GOTOWE. MASZ JAKIEŚ DANE…”.

---

## 2. OsintBrowserApp — `//TOR: PRZEGLĄDARKA`

- **Plik:** `minigames/OsintBrowserApp.tsx` · **componentId:** `ol_osint_browser` ·
  **etap:** `browser` · **decyzje:** D2 (cel), D3 (wektor).
- **config:** `OsintBrowserConfig` (`osintBrowserConfig`). `target` (D2),
  `vector` (D3), `eventsHint`. **Pełne dane strony** (hero, pracownicy z bio,
  wydarzenia) są dziś w `data/mission3.json.step2.browser` — przy pełnej wersji
  przenieś je do `config.site` w `stages.ts` (jedno źródło) i wyświetl z niego.
- **Stary widget:** `engine/widgets/TorBrowserApp.tsx`.

### Ekrany po kolei
1. **Strona O&L (OSINT).** Hero, zakładki STRONA GŁÓWNA / WYDARZENIA, lista
   pracowników z „PRZECZYTAJ” (bio). Zakładka WYDARZENIA niesie kontekst imprezy
   działu sprzedaży — to przesłanka do wektora. Gracz **musi** zajrzeć w
   wydarzenia przed wyborem wektora (warunek konieczny, flavor).
2. **Wybór celu (D2).** Opcje: `choose_ceo` (suboptimal), `choose_logistics`
   (suboptimal), `choose_mateusz` (ideal), `choose_ciso` (critical).
   **Małe rozgałęzienie (mechanizmy silnika, bez gałęzi w store):**
   - `critical` (CISO) → `onDecision` tier `critical` od razu (wykrycie).
   - `suboptimal` (CEO/Logistyka) → **nie** zgłaszaj jeszcze decyzji; pokaż
     pushback mentora (`feedback`) i pozwól wybrać ponownie; zapamiętaj, że była
     zła próba (`attempted`).
   - `ideal` (Mateusz) → `onDecision` z tier = `attempted ? 'suboptimal' : 'ideal'`
     (agregacja jak w `DialogueTree` — zła próba obniża końcową ocenę D2).
3. **Wybór wektora (D3).** Opcje: `vector_party_zip` (ideal),
   `vector_fake_invoice` (critical). `onDecision` D3; `critical` blokuje,
   `ideal` → `onComplete()`.

### Decyzje
| num | ekran | tier |
|---|---|---|
| 2 | cel | critical=CISO natychmiast; ideal/suboptimal po agregacji prób |
| 3 | wektor | party_zip=ideal, fake_invoice=critical |

`onComplete()` po D3 nie-critical.

### Co usunąć ze starego widgetu / przebiegu
- Po błędnym celu stary przebieg pokazywał tylko poprawną opcję — **usuń** to
  (po pushbacku pokaż pełną pulę do ponownego wyboru).
- Wybór wektora w **czacie** (stary `chatStage: choose_vector`) — przenieś na
  ekran aplikacji (czat nie jest launcherem).
- Zakładka WYDARZENIA: świecąca ramka `[KLIKNIJ TUTAJ!]` jest OK jako
  prowadzenie do czynności, ale nie etykietuj, że to „właściwa” odpowiedź.

### Prawy monitor
Rozważ: lista pracowników / notatki OSINT na `SideMonitor`, a decyzja (wiersze)
obok — przy 1366×768 strona + opcje mogą nie zmieścić się bez przewijania.

### Test w przeglądarce
`//TOR: PRZEGLĄDARKA` → wybierz CEO = pushback i powrót do wyboru; wybierz
Mateusza po CEO = D2 liczone jako suboptimal (sprawdź w raporcie/`window.__STORE__`);
CISO = ekran wykrycia; wektor .exe = wykrycie, ZIP = mostek do pendrive'a.

---

## 3. PendriveApp — `//DYSK E: PENDRIVE`

- **Plik:** `minigames/PendriveApp.tsx` · **componentId:** `ol_pendrive` ·
  **etap:** `pendrive_app` · **decyzje:** D4 (załącznik), D5 (wolumin), D6 (koperta).
- **config:** `PendriveConfig` (`pendriveConfig`). `attachments` (D4),
  `bindPrompt` (flavor), `volume` (D5), `envelope` (D6), `successMessage`.
- **Stary widget:** `engine/widgets/PendriveApp.tsx`.

### Ekrany po kolei
1. **Załącznik (D4).** 3 pliki: `party_photos` (ideal), `hr_docs` (suboptimal),
   `termination` (critical). Stary UI: tylko **jeden** plik można wgrać; po
   wgraniu panele się blokują. `onDecision` D4.
2. **Podpięcie RAT do ZIP (FLAVOR).** Przycisk „PODEPNIJ //WIRUS: RAT W ARCHIWUM
   ZIP” — warunek konieczny, bez oceny.
3. **Nazwa woluminu (D5).** `vol_impreza` (ideal), `vol_bbd` (suboptimal),
   `vol_new_disk` (suboptimal), `vol_keylogger` (critical). `onDecision` D5.
4. **Podpis koperty (D6).** `env_afterparty` (ideal), `env_bbd` (suboptimal),
   `env_lost_docs` (suboptimal), `env_termination` (critical). `onDecision` D6,
   potem `onComplete()`.

### Decyzje
| num | ekran | tier |
|---|---|---|
| 4 | załącznik | party_photos=ideal, hr_docs=suboptimal, termination=critical |
| 5 | wolumin | vol_impreza=ideal, vol_bbd/vol_new_disk=suboptimal, vol_keylogger=critical |
| 6 | koperta | env_afterparty=ideal, env_bbd/env_lost_docs=suboptimal, env_termination=critical |

`onComplete()` po D6 nie-critical. Każdy `critical` blokuje dalej.

### Co usunąć ze starego widgetu
- Dolna „Wskazówka: wybierz paczkę korespondującą z kontekstem imprezy…” —
  zdradza odpowiedź (audyt, `PendriveApp:195`). Usuń.
- Nazwa wynikowego pliku zależna od wyboru (`FOTKI_AFTERPARTY.ZIP`) jest OK,
  jeśli nie ujawnia poprawności opcji.

### Prawy monitor
Panel „ZAŁĄCZNIKI OD BYTE_MASTERA” + instrukcja nośnika pasuje na `SidePanel`;
decyzja (wolumin/koperta) jako wiersze — sprawdź brak przewijania.

### Test w przeglądarce
`//DYSK E: PENDRIVE` → `WYPOWIEDZENIE…PDF` = wykrycie; ścieżka
zdjęcia → ZIP → `IMPREZA` → `AFTERPARTY` = mostek z przeskokiem czasu 06:02.

---

## 4. DroneApp — `//DRON: CONDOR MIT63`

- **Plik:** `minigames/DroneApp.tsx` · **componentId:** `ol_drone` ·
  **etap:** `drone_app` · **decyzje:** D7 (adres), D8 (pojazd).
- **config:** `DroneConfig` (`droneConfig`). `address` (D7), `car` (D8),
  `droneStats`, `mapLocations` (mapa), `parkingCars` (kamera), `successDrop`.
- **Stary widget:** `engine/widgets/DroneApp.tsx`.

### Ekrany po kolei
1. **Podpięcie koperty (FLAVOR).** Przycisk — odblokowuje nawigację.
2. **Mapa satelitarna (D7).** 4 lokalizacje; `loc_4` (OŁTASZYŃSKA 92C) ideal,
   reszta critical. `onDecision` D7 (`critical` blokuje, inaczej „lot”).
3. **Kamera parkingu (D8).** 6 pojazdów; `car_4` (biały z czerwonym dachem,
   `isTarget`) ideal, reszta critical. `onDecision` D8, potem `onComplete()`.
   Cel identyfikujesz ze zdjęcia od mentora (biały samochód z czerwonym dachem).

### Decyzje
| num | ekran | tier |
|---|---|---|
| 7 | mapa (adres) | loc_4=ideal, loc_1/2/3=critical |
| 8 | kamera (pojazd) | car_4=ideal, pozostałe=critical |

`onComplete()` po D8 ideal.

### Co usunąć ze starego widgetu
- „100% ZGODNOŚĆ ZE ZDJĘCIEM” / „NIEZGODNOŚĆ” w analizie pojazdu — żywy wskaźnik
  oceny (audyt). Pokazuj neutralny opis pojazdu, bez werdyktu zgodności.
- Opis celu „(CEL OFIARY)” z danych pojazdu (w `config` już usunięty).

### Prawy monitor
Zdjęcie referencyjne pojazdu od mentora pasuje na `SideMonitor` podczas D8.

### Test w przeglądarce
`//DRON` → zły adres = wykrycie; `OŁTASZYŃSKA 92C` → zły pojazd = wykrycie;
biały z czerwonym dachem = mostek z przeskokiem 08:12 i banerem połączenia
(aktywacja malware).

---

## 5. RatSessionApp — `//WIRUS: RAT — SESJA` (finał bez oceny)

- **Plik:** `minigames/RatSessionApp.tsx` · **componentId:** `ol_rat_session` ·
  **etap:** `rat_session` · **decyzje:** brak.
- **config:** `RatSessionConfig` (`ratSessionConfig`). `host`, `takeoverLabel`,
  `networkLabel`.
- **Stary widget:** `engine/widgets/RatSessionApp.tsx`.

### Ekrany po kolei
1. **Aktywacja ładunku.** Dane stacji (`host.name`, `host.ip`), przycisk
   „PRZEJMIJ PULPIT OFIARY”.
2. **Pulpit ofiary (Win11).** Ikona FREEVOLT, archiwum ZIP, przycisk
   „PRZEJMIJ SIEĆ FREEVOLT”.
3. **Graf zdalnego dostępu.** Po czym `onComplete()` — mostek do raportu
   (gracz pyta o BTC, mentor odpowiada), odblokowuje `//RAPORT POOPERACYJNY`.

Brak `onDecision` (etap nieoceniany). `onComplete()` na końcu sekwencji.

### Prawy monitor / test
Finał efektowny; test: `//WIRUS: RAT — SESJA` → dwa przyciski → mostek końcowy
i odblokowanie raportu. Raport otwierasz kafelkiem `//RAPORT POOPERACYJNY`.

---

## Raport końcowy (poza minigrami)

`step6.choices` (8 decyzji) ma dziś tylko `details`. Zgodnie z mission-standard
dołóż `attack` / `defense` do każdej (styl M1) — osobny krok treści, nie
blokuje przeniesienia minigier. Pytania `step6.choices[].question` są dziś
identyczne z pytaniami w `config` **poza** D3/D4 (odpowiedzi historyczne różnią
się od etykiet opcji) — ujednolicić przy pracy nad treścią.

## Jak weryfikować (każda minigra)

1. `npx vitest run` + `npx tsc -p tsconfig.app.json --noEmit` zielone.
2. `?mission=3&dev=1`: przejdź etap, sprawdź brak przewijania (1366×768 i
   1920×1080) i czystą konsolę w **nowej karcie** po świeżym załadowaniu.
3. `window.__STORE__.getState()` — sprawdź `playerChoices`, `score`,
   `criticalErrorsCount`, `unlockedIcons` po decyzjach.
