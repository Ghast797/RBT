# Audyt misji 2–4 względem standardu M1 (2026-11-05)

Audyt wykonany tylko odczytem. Punkt odniesienia: M1 (PetroLog) jako wzorzec **wyglądu i kontraktu**, ale **nie** poziomu podpowiedzi (M1 to samouczek). Założenia projektowe:
- Misje 2+ mają więcej wyborów i mniej wskazywania dobrej odpowiedzi. Gracz zawsze wie, CO robić, nie dowiaduje się, KTÓRA odpowiedź jest dobra.
- Konsekwencja odroczona: słaby wybór ujawnia się etap lub dwa później, tekstem, z potrąceniem BTC, a w raporcie pojawia się „Widok Blue Teamu”.
- Bez licznika wykrycia. Rozgałęzienia tylko małe i oczywiste.

## Stan prac (aktualizacja 2026-11-05, koniec sesji)

Gałąź `refactor/missions-2-4-standard`, niewypchnięta. Kolejna sesja (Claude lub Gemini/OpenCode) zaczyna od tej sekcji.

**Zrobione**
- **Silnik:**
  - `useShuffled`;
  - klocki `ChoiceCards`/`VpnRouter`/`DialogueTree` w standardzie M1;
  - `ChoiceCardGrid`/`ChoiceRows`;
  - `ConfirmButton`/`SidePanel`;
  - `incomingCall`;
  - beat `time_jump` + `unlockDelayMs`;
  - VPN: wpisywanie z klawiatury i auto-przejście.
- **M2 zamknięte** po trzech turach audytu właściciela. Brakuje tylko grafik szablonów w `mission_02_carbon_flow/assets/forms/` (`poodle_forms`, `quickgram`, `kneenook`, 4:3).
- **Standard misji 2+:** [`mission-standard.md`](mission-standard.md).
- **M3 na wzorcu B:**
  - 5 minigier `ol_*` w `mission_03_ol_company/minigames/`;
  - etapy w `stages.ts`;
  - raport z lekcjami;
  - `scenario.md`;
  - spec w `mission_03_ol_company/docs/migration-spec.md`;
  - `tests/mission3.test.ts`.
- **Sprzątanie legacy M3 w silniku** (zacommitowane): stare widgety, maszyna stanów w store, przyciski w `ChatView`, test `missionStore`, neutralna domyślna misja, zaślepki `Stub*`.

**Domknięte (2026-11-09)**
- Martwe `step1..step5` usunięte z `mission3.json` (zostaje `intro`, `desktopApps`, `step6`).
- Silnik bez legacy: w `src/engine/` nie ma `widgets`, `transitions`, `ScenarioTransition*`, `chatStage` ani pól Step1–Step5 w store; `scenario-engine.md` sekcja 8 i `AGENTS.md` opisują to jako wygaszone.
- Izolacja paczek (`package-scorm.js --all`): żadna paczka nie zawiera nazw innych misji. Wyjątek legalny: tekst fabularny M4 wspomina Petrolog. Znaleziony i naprawiony wyciek: domyślne wartości `xapi.ts` zawierały id i tytuł M3 (trafiały do M1, M2, M4).
- Regresja M1–M4 w przeglądarce (`?mission=N&dev=1`, 2 kafelki, czat) i `/` (wybór misji): bez nowych błędów w konsoli.

**Otwarte: cykl importów w dev (HMR)**
- Próba cięcia przez `engine/registry/scenarioApps.ts` **została odrzucona**: nie usuwa cyklu. Edycja minigry (np. `PhishingDispatchApp.tsx`) nadal daje w konsoli `Cannot access 'PhishingDispatchApp' before initialization`, po czym Vite przeładowuje stronę i gra działa. Dotyczy tylko HMR w dev, nie paczek.
- Przyczyna: minigry importują `useMissionStore`, a store przez `missionRegistry` → `virtual:active-scenario` importuje wszystkie `scenarios/*/index.ts`, które importują minigry. Rejestr aplikacji to tylko jedna z krawędzi cyklu.
- Propozycja: store nie powinien importować scenariuszy synchronnie na starcie modułu (`resolveInitialMission()` przy tworzeniu store). Np. neutralny stan początkowy + jawne `initMission()` wołane z `main.tsx` po załadowaniu scenariuszy. To zmiana architektury startu, wymaga osobnej decyzji.

**Następne kroki**
1. **Agenci testujący M3:** recenzja kodu przeciw `mission-standard.md` (Opus), audyt w przeglądarce każdego ekranu przy 1366×768 i 1920×1080 (Sonnet), izolacja paczek (Haiku).
2. **Tura poprawek M3.** Już znane:
   - po udanej kompilacji RAT `VirusLabApp` ma przejść dalej sam, bez przycisku „ZAPISZ ŁADUNEK…”;
   - `DroneApp` zajmuje prawy monitor, więc wiadomość mentora z adresem ofiary trzeba pokazać w panelu jako notatkę;
   - odpowiedzi D1/D2 w `step6` mają mieć pełne etykiety z ekranu; wymaga to poprawki `tests/mission3.test.ts` ok. l.100.
3. **Audyt M3 przez właściciela.** Do akceptacji:
   - builder RAT bez oceny (8 decyzji);
   - zły cel D2 → `suboptimal` po powrocie mentora;
   - `educationalSlides` usunięte z M3 (M2/M4 nadal je mają).
4. **M4** wg `mission-standard.md`: rozjazdy z PDF (9 vs 10 decyzji — układ wg oceny logiki), `scenario.md`, przeskok czasu w mostku po VPN, wygląd M2.
5. **Do decyzji właściciela:** dopasowanie M1 do zasady „karty na dużym ekranie, wiersze na prawym” (POCZTA, KREATOR_STRONY).

## Stan w skrócie

| | M2 CarbonFlow | M3 O&L | M4 Energy Rock |
|---|---|---|---|
| Model | etapy (B) | etapy (B); stary przebieg ze store usunięty | etapy (B), kompletne |
| Decyzje | 5 | 8 + niepunktowany builder RAT | 10 (VR: 9) |
| `scenario.md` | jest, ale odzwierciedla kod, nie VR | brak, brak dokumentu VR w repo | brak, jest PDF |
| `AppHeader` / `ChoiceZone` / `SideMonitor` | brak | brak | brak |
| Tasowanie opcji | brak, ideal zawsze pierwszy | brak | brak |
| Lekcje atak/obrona w raporcie | brak | brak | brak |
| Testy | przepływ store, brak testów minigier | brak `mission3.test.ts` | przepływ store, brak testów ocen |

## Ustalenia wspólne

1. **Wygląd.** Żadna minigra M2–4 ani wspólne klocki `VpnRouter` i `DialogueTree` nie używają `AppHeader`, `ChoiceZone` ani `SideMonitor`. Czcionki są już w `rem`, ale treść ma rozmiar `text-xs` / `0.625–0.6875rem`, a M1 ma `text-sm+` i tytuły `text-lg/xl`. Brakuje paska ZADANIE, więc gracz nie widzi w aplikacji, co ma zrobić.
2. **Spoilery.**
   - Opcje bez tasowania (tasuje tylko M1: `PhishingBuilderApp`, `SocialIntelApp`).
   - Mostki czatu i intro nazywają odpowiedź (M2 `stages.ts:276`, M4 `mission4.json:36`, `stages.ts:362, 377-379`).
   - Opisy i tagi opcji zawierają ocenę.
   - Żywe wskaźniki: M4 „OCENA ENTROPII x/5”, M3 „100% ZGODNOŚĆ”, VPN „DOPASUJ W AI”.
   - M3 po błędzie pokazuje tylko poprawną opcję.
   - M3 `PendriveApp:195` zawiera „Wskazówka: …imprezy…”.
3. **Powtórka po `critical`** to konwencja silnika i zostaje. Komunikat wykrycia nie może jednak podawać dobrej odpowiedzi, a opcje po powtórce powinny się przetasować.
4. **Raport końcowy.** `step6.choices` we wszystkich trzech misjach nie ma `attack` ani `defense`, a typ i `DebriefApp` już je obsługują. Do napisania: M2 5 par, M3 8–9 par, M4 9–10 par.
5. **Miejsce na konsekwencję odroczoną** istnieje w każdej misji:
   - M2 `BotnetMonitorApp`: dziś stałe 82%, ignoruje wybory;
   - M3 `rat_session`: nazwa woluminu, opóźnienie uruchomienia;
   - M4 negocjacje z szefem IT: jego ton w zależności od okna okupu i maila.

   Silnik potrzebuje jednego wspólnego mechanizmu (pole skutku przy opcji, kanał i etap ujawnienia, wpis Blue Team, potrącenie BTC), a nie gałęzi per misja.
6. **Phishing w trzech wersjach.** M1 ma `PhishingBuilderApp` i `EmailSenderApp`, M2 `PhishingCampaignApp` (638 linii, 5 ekranów), M4 `PhishingMailApp`. Ten sam przepływ: wybór tematu, treści i nadawcy, podgląd, wysyłka. Reguła dwóch jest spełniona, to kandydat na klocek silnika.
7. **Przecieki misji do silnika.**
   - `Desktop.tsx:296`: zaszyty baner „SZEF IT ENERGY ROCK” (M4);
   - `missionRegistry.ts:110`: domyślna misja to M3;
   - `scorm2004.ts:307`: fallback `mission3_…`;
   - `engine/widgets/` (używa tylko M3) i ich wpisy w `appRegistry.tsx`;
   - logika M3 w store i `ChatView.tsx:166-215`.
8. **Martwy kod.** M2 `PhishingDispatchApp` (nieużywany kafelek) z `phishingDispatchConfig`, nakładki `VpnApp.tsx` w M2 i M4, `runScenarioTransition` (używa go tylko test atrapy).

## Ustalenia per misja

### M2 CarbonFlow
- **Kolejność względem VR.** Kod ma kolejność wirus → VPN → phishing, a VR akcja/szablon/temat → VPN → wirus → nadawca. Numeracja decyzji też się różni.
- **Redundancja D1 i D2.** D1 „ROBAK” i D2 „WIRUS 0-DAY” to praktycznie ta sama odpowiedź dwa razy.
- **Monitor botnetu.** `BotnetMonitorApp` pokazuje zawsze „0 alarmów / 82%”. To naturalne miejsce na skutki D1–D5.
- **Wywołania `onComplete`.** `onComplete` w `PhishingCampaignApp` jest wołane dwa razy, przez co ekran `sent` jest nieosiągalny.
- **Etykieta debriefu.** W debriefie „SZABLON MAILA”, w kodzie „SZABLON FORMULARZA”.

### M3 O&L Company
- **Migracja dotyczy kodu store, nie JSON.** Treści `step1–step5` przechodzą do `blocks` prawie 1:1.
- **Proponowane etapy:** `virus_database` [1, builder] → `browser` [2] → wektor [3] → `pendrive_app` [4, 5, 6] → `drone_app` [7, 8] → `rat_session` (bez decyzji) → debrief.
- **Widgety.** Żadnego z 5 widgetów nie używa inna misja. D1 przechodzi na `ChoiceCards`, a builder, przeglądarka, pendrive, dron i sesja RAT trafiają do `mission_03_ol_company/minigames/` z lokalnym stanem i `onDecision`.
- **Błędy obecnego kodu:**
  - `criticalErrorsCount` liczony podwójnie;
  - punkty liczone inline (progi 60/70, stałe −0,89 BTC) zamiast przez `core/scoring.ts`;
  - wszystkie kafelki odblokowane od startu, więc ścieżka nie jest wymuszona.
- **Testy.** `tests/missionStore.test.ts` testuje gałąź M3 w store i po migracji przestanie działać. Trzeba go zastąpić `tests/mission3.test.ts`.
- **Plan migracji** (każdy krok to osobny, testowalny commit):
  1. test charakteryzujący M3 i neutralna misja domyślna w testach;
  2. `stages.ts` i `blocks`;
  3. wirus z builderem;
  4. przeglądarka, cel i wektor;
  5. pendrive;
  6. dron;
  7. sesja RAT i zakończenie;
  8. debrief;
  9. wygląd;
  10. sprzątanie silnika (po zielonych testach M1, M2 i M4);
  11. konsekwencje;
  12. weryfikacja ZIP.

### M4 Energy Rock
- **Rozjazdy z PDF:**
  - brak decyzji „CZY WARTO WYŁUDZIĆ OKUP?”;
  - VPN i nadawca są w PDF jedną decyzją, w kodzie dwiema;
  - poziomy: D2 hasło nigdy nie jest `critical` (świadoma decyzja zapisana w kodzie, `RansomwareBuilderApp.tsx:51`), D4 zielony to w PDF `critical`, D9 nadmiar plików to w PDF `suboptimal`, D10 „dla zabawy” to w PDF 0 pkt.
- **Punktacja.** PDF ma zmienne wagi dla `suboptimal`, a silnik stałe 50%. Proponuję zaakceptować tę różnicę.
- **Brakuje `scenario.md`.** Da się go odtworzyć z PDF i kodu po rozstrzygnięciu rozjazdów.

## Rozstrzygnięcia właściciela (2026-11-05)

- **Mentor może naprowadzać na poprawną odpowiedź.** Gracze nie są z branży, a misja ma być sprawdzianem czytania ze zrozumieniem. Spoilerem jest UI, które ujawnia ocenę lub układa opcje stale w tej samej kolejności, a nie tekst mentora czy OSINT.
- **Mostki: wierność VR** (pytanie 8).
- **M2: poprawiamy wzorem M1**, czyli kolejność i decyzje jak w VR (pytania 1–2).
- **M3: na razie przepisujemy 1:1** na nowy silnik, przemyślenia treści później (pytania 3–5 odłożone).
- **M4: układ decyzji wg oceny logiki** przy pracy nad misją (pytania 6–7).
- **Prawy monitor (`SideMonitor`):** po powiększeniu UI do skali M1 decyzja per etap, na podstawie audytu wizualnego. Cel: brak przewijania.

## Pytania z audytu (stan przed rozstrzygnięciem)

| # | Misja | Pytanie |
|---|---|---|
| 1 | M2 | Zostaje kolejność z kodu (wirus → VPN → phishing) czy wracamy do VR? |
| 2 | M2 | Co z redundancją D1/D2: scalić, czy zamienić D2 na niezależną decyzję? |
| 3 | M3 | Zły cel (CEO, Logistyka): małe rozgałęzienie z powrotem mentora czy `critical`? |
| 4 | M3 | Builder RAT jako 9. decyzja (agregowana)? |
| 5 | M3 | Czy istnieje dokument lub nagranie VR misji 3, z którego zrobimy `scenario.md`? |
| 6 | M4 | 9 decyzji jak w PDF (dodać „wyłudzić okup?”, scalić VPN z nadawcą) czy 10 jak w kodzie? |
| 7 | M4 | Poziomy D2, D4, D9, D10: wg PDF czy wg kodu? |
| 8 | wszystkie | Mostki z VR, które zdradzają odpowiedź: przeformułować czy zostawić wierność VR? |
| 9 | M2, M4 | VPN „DOPASUJ W AI” i biała lista: zostaje jako ozdobnik czy ma być realnym zadaniem? |

## Kolejność prac

**A. Silnik (wspólne, po kolei, przed misjami)**
1. Wygląd wspólnych klocków: `VpnRouter` i `DialogueTree` dostają `AppHeader` i `ChoiceZone`. Wspólne tasowanie opcji, także przy powtórce.
2. Usunięcie przecieków: baner M4 z `Desktop.tsx` przechodzi do danych etapu, neutralna misja domyślna, fallback SCORM.
3. Decyzja o klocku phishingu (pkt 6 ustaleń wspólnych): wyciągnąć go z M1 przy okazji M2.

**B. Misje**
4. M2 jako pilot: wygląd, spoilery, martwy kod, testy minigier. Agent implementer, przegląd Opus, test w przeglądarce.
5. M4: to samo, plus `scenario.md` po decyzjach 6–7.
6. M3: migracja wg planu powyżej, krok po kroku.

**C. Treść i konsekwencje (po akceptacji koncepcji)**
7. Lekcje atak/obrona w raportach M2–4.
8. Mechanizm konsekwencji odroczonej w silniku, „Widok Blue Teamu” w `DebriefApp`, dane dla M2–4.
