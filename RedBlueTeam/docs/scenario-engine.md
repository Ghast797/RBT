# Silnik scenariuszy RedBlueTeam — kontrakt i konwencje

> Status: **PROJEKT do akceptacji.** Opisuje model docelowy. Kod jeszcze go nie realizuje w pełni — zob. sekcję 8 „Stan obecny vs docelowy”.

Dokument dla agentów implementujących misje szkoleniowe (SCORM 2004 dla Moodle). Format wejściowy scenariusza opisuje [`scenario-format.md`](scenario-format.md).

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
| Start misji | połączenie przychodzące → dialog wprowadzający z BYTE_MASTEREM → sekwencja BIOS → pulpit |
| Wypowiedź gracza | w webie: przycisk/kafelek odpowiedzi w panelu czatu (zastępuje rzut kostką 3D z VR) |
| Prowadzenie do celu | badge `1` na ikonie następnego etapu; ikony nieodblokowane są ukryte/zablokowane |
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

## 8. Stan obecny vs docelowy

Do czego odnosi się refaktor M4:

| Element | Dziś | Docelowo |
|---|---|---|
| Dane decyzji (opcje, punkty) | wpisane w widgetach (`VIRUSES`, `SUBJECT_OPTIONS`…) | w `config` z `mission.ts` |
| Punktacja | każdy widget liczy kary sam (`isCritical ? 11.11 : 7.11`) | silnik liczy z poziomu + `N` + `rewardBtc` |
| Przebieg fabuły | `advanceMission4Story` zaszyte w store | lista etapów + wiadomości w `mission.ts` |
| Wybór 1 z N | 3 osobne widgety o tej samej logice | jeden `ChoiceCards` |
| Minigry (skaner, VPN, stacja) | w `engine/widgets/` z resztą | w `scenarios/mission_04/minigames/`, kontrakt z sekcji 5 |
| `steps` w JSON | nieczytane przez kod | usunięte albo zasilają `config` |

Sekcja `steps` w obecnym `mission4.json` jest martwa (żaden komponent jej nie czyta) — w refaktorze znika.
