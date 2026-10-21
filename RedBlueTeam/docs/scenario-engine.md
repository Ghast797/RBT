# Silnik scenariuszy RedBlueTeam — kontrakt i konwencje

> **Wiążący standard budowy misji (wzorzec B).** Tak buduje się każdą misję w tym projekcie. Stary wzorzec (A: fabuła i dane zaszyte w kodzie) jest wygaszany — zob. sekcję 8. Nie kopiuj kodu starych misji; kopiuj negocjacje M4 jako wzorzec.

Dokument dla agentów implementujących misje szkoleniowe (SCORM 2004 dla Moodle). Prowadzenie gracza: [`player-guidance.md`](player-guidance.md). Format wejściowy scenariusza: [`scenario-format.md`](scenario-format.md).

## 0. Jak zbudować misję (krok po kroku)

1. Przeczytaj scenariusz (`scenario.md`) i rozbij go na **etapy** — jeden etap = jedna aplikacja pulpitu.
2. Dla każdego etapu wybierz element: **klocek** z katalogu (sekcja 6) albo **minigra** misji w `scenarios/mission_XX/minigames/` wg kontraktu (sekcja 5).
3. Wypisz dane do `blocks{}` (opcje, poziomy, feedback) i etapy do `stages[]` (odblokowania, badge, wiadomość mentora, następny krok).
4. Ustaw prowadzenie wg [`player-guidance.md`](player-guidance.md): w każdej chwili jeden jasny następny krok.
5. Złóż definicję w `index.ts` misji i wyeksportuj standardowy kontrakt:
   - `export const scenarioDefinition = ...;`
   - `export const scenarioApps = ...;`
   Vite (`virtual:active-scenario`) automatycznie wykrywa każdy folder `src/scenarios/mission_XX/` — **nie edytujesz** ręcznie `missionRegistry.ts`.
6. Dodaj metadane do `MISSION_CATALOG` w `scripts/package-scorm.js`.
7. `npm test` + `node scripts/package-scorm.js --mission=X`.

Czego **nie** robisz: nie dodajesz gałęzi per misja do `useMissionStore.ts`, nie edytujesz na sztywno importów w `missionRegistry.ts`, nie liczysz punktów w komponencie, nie opisujesz prowadzenia/dźwięków w danych. To należy do silnika.

Wzorcowy, działający przykład w kodzie: negocjacje M4 — `scenarios/mission_04_energy_rock/stages.ts` + klocek `engine/blocks/DialogueTree.tsx`.

## 1. Model w jednym zdaniu

Misja to **lista etapów**. Każdy etap to jedna aplikacja na pulpicie HACKERS.OS, zbudowana z **klocka** z katalogu albo z **minigry** napisanej dla tej misji. Klocek i minigra zgłaszają silnikowi **wynik decyzji** lub **ukończenie**; silnik liczy punkty, odblokowuje następny etap i prowadzi dialog z BYTE_MASTEREM.

## 2. Struktura folderów (docelowa)

```
RedBlueTeam/
├── docs/                       # ten dokument, format scenariusza
├── src/
│   ├── engine/
│   │   ├── core/               # store, punktacja, przebieg etapów, SCORM/xAPI, audio, typy
│   │   ├── shell/              # HACKERS.OS: boot, pulpit, okna, czat BYTE_MASTER, debrief
│   │   └── blocks/             # katalog klocków (sekcja 6)
│   └── scenarios/
│       ├── _template/          # kopia startowa nowej misji
│       └── mission_XX_nazwa/
│           ├── scenario.md     # źródło prawdy (format: scenario-format.md)
│           ├── mission.ts      # meta, intro, etapy, dane klocków, debrief
│           ├── minigames/      # minigry tylko tej misji
│           ├── assets/
│           └── docs/           # materiały źródłowe (PDF, notatki z nagrania VR)
```

Nowa misja zmienia **tylko swój folder**. Jedyny wyjątek: promocja minigry do `blocks/` (sekcja 7).

## 3. Konwencje (wspólne dla wszystkich misji)

Implementuje je silnik raz. Scenariusz ich nie opisuje — zakłada je.

| Obszar | Konwencja |
|---|---|
| Start misji | połączenie przychodzące → dialog wprowadzający z BYTE_MASTEREM → sekwencja BIOS → pulpit. Rozmowa intro „przenosi się" do logu czatu na prawym monitorze (silnik zasiewa ją z `intro.dialogue`). |
| Wypowiedź gracza | w webie: przycisk odpowiedzi w panelu czatu (zastępuje rzut kostką 3D z VR); treść to linia z VR; klik = echo, **nigdy** nie otwiera aplikacji |
| Czat = rozmowa, nie launcher | kliknięcie w czacie nie otwiera aplikacji; mentor nie podaje aplikacji do otwarcia; kolejny kafelek odblokowuje się + podświetla po kwestii gracza, a gracz klika go sam |
| Prowadzenie do celu | badge `1` + poświata uwagi (`highlightTile`) na ikonie następnego etapu; ikony nieodblokowane są ukryte |
| Tempo | BYTE_MASTER „pisze" (animacja) z delayem; rozmowa z NPC (`DialogueTree`) też ma delay i wskaźnik pisania (rozmowa telefoniczna) |
| Ekrany aplikacji | jeden kafelek = jedna aplikacja; kroki w środku to sekwencyjne pełne ekrany (bez zakładek/cofania), z krótkim ekranem ładowania `ModuleLoader` między nimi |
| Przejście dalej | przycisk „dalej" wyszarzony, dopóki krok nie spełnia kryterium ukończenia |
| Podpowiedzi | po bezczynności: T1 subtelna (pulsowanie celu), T2 wyraźna (komunikat tekstowy) |
| Dźwięki | stały zestaw: klik, sukces, błąd, powiadomienie, alarm (`soundEffects.ts`) |
| Układ ekranu | lewy monitor = pulpit i okna, prawy monitor = czat BYTE_MASTER |
| Przeciąganie z VR | w webie: drag & drop **lub** klik kafelka (decyzja per klocek, nie per scenariusz) |

## 4. Trzy poziomy oceny

Każda **oceniana decyzja** ma jeden z trzech poziomów. Silnik na ich podstawie liczy wynik — klocek/minigra nie liczy punktów sama.

| Poziom | Punkty | BTC | Przebieg |
|---|---|---|---|
| `ideal` | pełne (100%/N) | pełna część nagrody | płynny postęp |
| `suboptimal` | część punktów | ułamek kary BTC | gra toczy się dalej; błąd omawiany w debriefie |
| `critical` | 0 | pełna kara BTC | **przerwanie**: ekran „ZOSTAŁEŚ WYKRYTY!" + modal powtórki |

Zasady liczbowe (silnik, nie scenariusz):
- `maxScore = 100`, rozłożone równo na `N` ocenianych decyzji (udział decyzji `= 100/N`).
- Nagroda `BTC = (wynik% / 100) × rewardBtc`, skalowana liniowo.
- Próg zaliczenia SCORM `= passingScore` (domyślnie 70%), mapowany na `cmi.success_status`.
- Scenariusz podaje **tylko poziom każdej opcji**. Punkty i kary wylicza silnik z `N` i `rewardBtc`.

## 5. Kontrakt klocka i minigry

Najważniejsza część. Każdy element etapu — klocek z katalogu lub minigra misji — spełnia **ten sam kontrakt**, więc silnik obsługuje je jednakowo.

Element **dostaje** (props):
- `config` — dane z `mission.ts` (opcje, teksty, parametry minigry).
- `onDecision(record)` — zgłasza ocenianą decyzję: `{ num, question, answer, tier, feedback }`. Silnik przelicza na punkty, zapisuje do debriefu, a przy `critical` odpala ekran wykrycia.
- `onComplete()` — zgłasza ukończenie etapu bez oceny (np. przerywnik). Silnik odblokowuje następny etap.

Element **nie robi** samodzielnie: nie liczy punktów, nie odblokowuje ikon, nie pisze wiadomości BYTE_MASTERA, nie dotyka SCORM. To wszystko należy do silnika i do definicji etapów.

Stan między etapami (co wybrano wcześniej) element czyta z `customState`, nie z własnych pól store'a.

**Zamknięcie etapu (mostek do następnego).** Gdy element woła `onComplete()`, silnik gra `StageCompletion` z definicji etapu jako **rozmowę mostkującą**. Dane (nie kod):
- `conversation: ConversationBeat[]` — skrypt rozmowy 1:1 z VR, naprzemiennie:
  - `{ from: 'byte_master', text }` — kwestia mentora: pojawia się po jednej, z animacją „pisze" i delayem (2 s);
  - `{ from: 'player', id, label }` — kwestia gracza: przycisk w czacie; klik wysyła echo i przesuwa rozmowę, **nic nie otwiera**.
- `unlockIcons` + `badges` + `highlightTile` — stosowane **dopiero po ostatnim beacie** rozmowy. Kafelek odblokowuje się więc wtedy, gdy gracz napisze do mentora, co ma zrobić.
- `sound` — dźwięk na koniec mostka.

Zasady: BYTE_MASTER nie ma dostępu do komputera gracza, więc **nie podaje aplikacji do otwarcia** — mówi, co zrobić, a gracz sam klika podświetlony kafelek. Mostek bez dialogu w scenariuszu dostaje krótką kwestię spójnikową gracza (to ona odblokowuje kolejny kafelek). Rozmowa wielobeatowa (np. meldunek: gracz→mentor→gracz→mentor) odwzorowuje scenariusz 1:1.

**Pamięć stanu aplikacji (zasada silnika, dotyczy wszystkich misji).** Aplikacja na pulpicie HACKERS.OS pamięta, gdzie gracz skończył. Gracz może w każdej chwili wyjść na pulpit krzyżykiem **X** w prawym górnym rogu terminala (jak zamknięcie okna w systemie), a po ponownym otwarciu wraca do tego samego miejsca — także do aktywności już zaliczonej, której nie musi robić od nowa. Realizuje to silnik, nie minigra:
- `AppHost` (`registry/appRegistry.tsx`) trzyma każdą aplikację otwartą w tym podejściu zamontowaną (`openedApps`) i tylko ją ukrywa. Zwykły `useState` w klocku/minigrze wystarcza — **nie resetuj stanu przy zamknięciu, nie przenoś go do store'a „na zapas” i nie montuj aplikacji warunkowo poza `AppHost`**.
- Ponowne `onComplete()` w zaliczonym etapie (`completedStages`) tylko zamyka okno — mostek, punkty i odblokowania nie powtarzają się.
- Stan czyści wyłącznie powtórka misji (`retryFromChoices`, `retryFromScratch`, `loadMission`), która zmienia `appRunId`.
- Minigra nie dokłada własnego „zamknij, zacznij od nowa”. Własny przycisk powrotu może jedynie wołać `closeApp()`.

## 6. Katalog klocków (z M3/M4)

Tylko klocki, które **już się powtarzają** w istniejącym kodzie. Katalog rośnie przyrostowo (sekcja 7), nie projektujemy go z góry pod 10 misji.

| Klocek | Interakcja | Dane w `config` | Wynik |
|---|---|---|---|
| `ChoiceCards` | wybór 1 z N kart z opisem | `question`, `options[]` z `{label, desc, tier, feedback}` | `onDecision` z wybraną kartą |
| `DialogueTree` | rozmowa z NPC, węzły z opcjami | `nodes[]` z `{incoming, options[], nextNode}` | `onDecision` per węzeł oceniany, `onComplete` na końcu |
| `Configurator` | suwaki + przełączniki, ocena z funkcji | `controls[]`, `evaluate(state) → tier` | `onDecision` z oceną konfiguracji |
| `PoolSelect` | zaznacz właściwe z puli (cele / śmieci / pułapki) | `items[]` z `{label, role}`, `targetRole` | `onDecision` z trafnością zestawu |

`ChoiceCards` pokrywa dziś 5 decyzji w M4 i część M3 — to pierwszy kandydat do wydzielenia. Intro BYTE_MASTERA i negocjacje to `DialogueTree`.

## 7. Jak rośnie katalog (reguła dwóch)

Dla każdej interakcji nowego scenariusza:
1. Pasuje klocek z katalogu → podaj mu `config`.
2. Nie pasuje → napisz minigrę w `scenarios/mission_XX/minigames/` wg kontraktu z sekcji 5.
3. Podobna minigra pojawia się **drugi raz** → przenieś ją do `blocks/` i uogólnij `config`.

Minigra zostaje w folderze misji, dopóki służy jednej misji. Nie uogólniamy „na zapas".

## 8. Wzorzec B vs legacy (A) — co wygaszamy

Wzorzec **A jest legacy** — nie kopiuj go do nowych misji. Przepisujemy na **B** (ten dokument). Co się zmienia:

| Element | A (legacy, do wygaszenia) | B (standard) |
|---|---|---|
| Dane decyzji (opcje, punkty) | wpisane w widgetach (`VIRUSES`, `SUBJECT_OPTIONS`…) | w `blocks{}` definicji misji |
| Punktacja | każdy widget liczy kary sam (`isCritical ? 11.11 : 7.11`) | silnik z poziomu + `N` + `rewardBtc` (`reportDecision`) |
| Przebieg fabuły | `advanceMission4Story` / `transitions` zaszyte w store | `stages[]` + `completeStage` |
| Wybór 1 z N | osobne widgety o tej samej logice | jeden klocek `ChoiceCards` |
| Minigry (skaner, VPN, stacja) | w `engine/widgets/` z resztą | w `scenarios/mission_XX/minigames/`, kontrakt z sekcji 5 |
| `steps` w JSON | martwe (żaden komponent nie czyta) | nie używać — dane idą do `blocks` |

**Stan migracji:** **cała Misja 4 jest już na B** — to wzorzec referencyjny do kopiowania (etapy, klocki/minigry, przepływ czatu, tempo). Minigry M4 (`scenarios/mission_04_energy_rock/minigames/`) pokazują: sekwencyjne ekrany per aplikacja, `ModuleLoader` między ekranami, zgłaszanie decyzji przez kontrakt. Misja 3 zostaje na legacy (A) do osobnej konwersji — do tego czasu w kodzie są oba wzorce, ale **nowy kod piszemy wyłącznie w B**.

## 9. Tempo i „czucie komputera" (toolkit silnika)

Rzeczy dzieją się rozmyślnie wolno — gracz ma czuć, że obsługuje system. Silnik daje gotowe elementy (scenariusz ich nie opisuje, agent je podpina):

| Element | Gdzie | Zastosowanie |
|---|---|---|
| `ModuleLoader` | `engine/components/ModuleLoader.tsx` | pasek ładowania ~1 s przy otwarciu aplikacji i między ekranami minigry („pobieranie modułu", „kompilacja") |
| `TimeJump` | `engine/components/TimeJump.tsx` | narracyjny przeskok czasu (np. po wysłaniu maila: „MIJA KILKA GODZIN…") przed kolejnym etapem |
| Rozmowa mostka | `completeStage` → `advanceBridge` | kwestie BYTE_MASTERA po jednej, animacja „pisze" + delay 2 s; kwestie gracza jako przyciski |
| Pojawienie kafelka | `Desktop.tsx` | świeżo odblokowany kafelek wjeżdża animacją (`animate-in fade-in zoom-in`) + pulsuje (`highlightTile`) |

Minigra z akcją „komputerową" (skan, kompilacja, wysyłka, eksfiltracja) robi krótką pauzę `await setTimeout` + spinner — nigdy natychmiast.

## 10. Zasady z iteracji M4 (stosuj w nowych misjach)

Wnioski z dopracowywania M4 — trzymaj się ich, żeby nie powtarzać iteracji:

1. **Czat to rozmowa, nie launcher.** BYTE_MASTER nie ma dostępu do komputera gracza — nie podaje aplikacji do otwarcia. Mówi, co zrobić; gracz sam klika podświetlony kafelek.
2. **Aplikacje zablokowane do kwestii gracza.** Kolejny kafelek odblokowuje się dopiero, gdy gracz napisze mentorowi, co chce zrobić (ostatni beat `conversation`). To jego „ja się tym zajmę" jest wyzwalaczem.
3. **`critical` oszczędnie.** Poziom `critical` (ekran „ZOSTAŁEŚ WYKRYTY!" + powtórka) rezerwuj na prawdziwe dekonspiracje / pułapki kończące operację (honeypot, zdradzenie celu, rażąca niespójność). Wybór słaby, ale działający = `suboptimal`: gra toczy się dalej, a werdykt pada w debriefie. Nie blokuj gracza na każdym niedoskonałym wyborze (np. słabe hasło przepuszcza dalej).
4. **Nie podpowiadaj odpowiedzi na ekranie.** Minigra nie wypisuje, które elementy są poprawne (np. nie etykietuj puli plików „cel: Freevolt"). Gracz identyfikuje cele z fikcji i wcześniejszych wskazówek mentora.
5. **Dialogi 1:1 z VR.** Kwestie w czacie (intro i mostki) przepisuj dosłownie ze scenariusza, łącznie z wymianą wielobeatową (np. meldunek: gracz→mentor→gracz→mentor). Tam, gdzie scenariusz milczy na granicy etapów, dołóż krótką kwestię-spójnik gracza (to ona odblokowuje kolejny kafelek) i oznacz ją w kodzie jako spójnik.
6. **Tempo.** Patrz sekcja 9 — loadery, przeskoki czasu, delaye. Nic nie dzieje się natychmiast.

## 11. Architektura budowania i izolacja paczek SCORM

Każda generowana paczka SCORM 2004 (`dist/scorm-mission-X.zip`) jest **fizycznie odizolowanym bundle'em**:

1. **Wirtualny moduł `virtual:active-scenario` w Vite:**
   - Podczas budowania produkcyjnego (`node scripts/package-scorm.js --mission=X`) zmienna środowiskowa `VITE_MISSION_ID` wskazuje kompilatorowi aktywny scenariusz.
   - Plugin w `vite.config.ts` importuje wyłącznie plik `index.ts` wybranej misji. Pozostałe foldery `mission_YY/`, ich minigry, pliki JSON i teksty są całkowicie pomijane i odrzucane przez mechanizm Tree-Shaking.
   - Wynikowy plik JS wewnątrz archiwum `.zip` nie zawiera żadnych danych ani logiki innych misji (ochrona przed spoilerami, brak wycieku odpowiedzi do konsoli przeglądarki, minimalny rozmiar paczki ~130–140 KB).
2. **Kontrakt wejściowy `src/scenarios/mission_XX/index.ts`:**
   Każdy scenariusz wystawia:
   ```ts
   export const scenarioDefinition: MissionDefinition = ...;
   export const scenarioApps: Record<string, React.ComponentType<any>> = ...;
   ```
   Dzięki temu silnik automatycznie podpina minigry pod kafelki i etapy.
3. **Tryb deweloperski i testy:**
   - W trybie dev (`npm run dev`) oraz testach (`npm test`), gdy `VITE_MISSION_ID` nie jest ustawiony, wirtualny moduł udostępnia wszystkie wykryte scenariusze, umożliwiając przełączanie w przeglądarce (`?mission=2`, `?mission=3`, `?mission=4`).
   - W devie można też odpalić izolację konkretnej misji: `VITE_MISSION_ID=4 npm run dev`.

## 12. Backlog audio (TODO dla agentów)

Do zrobienia w przyszłych iteracjach (nie teraz):
- **Ścieżka dźwiękowa w tle** per scenariusz (pętla ambientu/napięcia), z regulacją głośności i wyciszeniem spójnym z `soundEffects.ts`.
- **Dopracowanie dźwięków UI** (kliknięcia, potwierdzenia, alarmy) — spójny, przyjemniejszy zestaw.
