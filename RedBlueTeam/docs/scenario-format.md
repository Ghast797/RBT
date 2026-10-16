# Format scenariusza (`scenario.md`)

> **Wiążący format.** Źródło prawdy misji. Agent kodujący czyta ten plik i buduje definicję misji oraz minigry. Kontekst techniczny i procedura: [`scenario-engine.md`](scenario-engine.md). Prowadzenie gracza: [`player-guidance.md`](player-guidance.md).

Zasada nadrzędna: scenariusz opisuje **tylko to, co unikalne dla misji**. Konwencji silnika (czat, badge, blokady, podpowiedzi, dźwięki, ekran wykrycia — sekcja 3 i 4 `scenario-engine.md`) **nie powtarza**. Nie ma kroków „kliknij KONTYNUUJ" ani „kliknij ikonę z badge".

## Struktura

### Nagłówek misji

```
# Misja XX: <nazwa>
- id: mission-XX-nazwa
- firma: <cel>
- nagroda: <N> BTC
- kolor: <#hex>
- data fabularna: <DD.MM.RRRR>
- ocenianych decyzji: <N>
```

### Intro

Dialog wprowadzający jako lista liniowa. Każda para: wiadomość BYTE_MASTERA → odpowiedź gracza.

```
## Intro (dialog z BYTE_MASTER)
- BM: <tekst>
- GRACZ: <tekst>
- BM: <tekst>
- GRACZ: <tekst>
```

### Etapy

Jeden `## Etap` na aplikację pulpitu, w kolejności grania.

```
## Etap N: <//NAZWA_APLIKACJI>
Klocek: <ChoiceCards | DialogueTree | Configurator | PoolSelect | NOWA MINIGRA>
Cel dydaktyczny: <jedno zdanie, czego gracz ma się nauczyć>
Ekrany: <po kolei, np. "wybór → skaner (flavor)"> — jeśli minigra ma kilka ekranów
Oceniane: <D<k>, …>  |  Flavor (nieoceniane): <ekrany bez oceny>

Decyzja D<k>: "<pytanie na ekranie>"
- <opcja dosłownie> | <ideal | suboptimal | critical> | <1 zdanie feedbacku do debriefu>
- <opcja dosłownie> | <poziom> | <feedback>
- <opcja dosłownie> | <poziom> | <feedback>

Mostek (rozmowa do kolejnego etapu):
- BM: "<kwestia mentora, 1:1 z VR>"
- GRACZ: "<kwestia gracza, 1:1 z VR — ostatnia kwestia gracza odblokowuje kolejny kafelek>"
- BM: "<ewentualna odpowiedź mentora>"
- odblokuj: <//IKONA kolejnej aplikacji>
```

Reguły:
- **Opcje dosłownie**, w kolejności wyświetlania. Dokładnie jeden `ideal` na decyzję.
- Etap bez oceny (sam przerywnik) ma `Cel dydaktyczny` i mechanikę, bez bloku `Decyzja`.
- Etap może mieć kilka decyzji (np. temat + treść maila = D5, D6).
- **Mostek to rozmowa (naprzemiennie BM / GRACZ), 1:1 z VR** — także wielobeatowa (np. meldunek). Czat nie otwiera aplikacji; to kwestia gracza odblokowuje kolejny kafelek. Gdy VR milczy na granicy etapów, dodaj krótką kwestię-spójnik gracza i oznacz `[SPÓJNIK]`.
- **`critical` oszczędnie** — tylko dekonspiracja / pułapka kończąca operację (honeypot, zdradzenie celu, rażąca niespójność). Wybór słaby, ale działający = `suboptimal` (gra toczy się dalej, werdykt w debriefie). Nie blokuj gracza na każdym niedoskonałym wyborze.
- **Nie podpowiadaj odpowiedzi na ekranie** minigry (np. nie etykietuj puli plików nazwą celu). Gracz identyfikuje cele z fikcji i kwestii mentora.
- Tempa (loadery, przeskoki czasu, animacje, delaye) **nie opisuj** — daje je silnik (`scenario-engine.md`, sekcja 9).

### Debrief

```
## Debrief
Slajdy edukacyjne:
1. <tytuł> — <treść do zapamiętania>
2. ...
```

Tabela wyborów do debriefu powstaje automatycznie z decyzji etapów — nie przepisuje się jej.

### Odchylenia od VR

Zbiorcza lista na końcu, nie przy każdym kroku.

```
## Odchylenia od VR / do decyzji
- [DO DECYZJI] <mechanika VR nieprzenośna wprost; cel dydaktyczny do zachowania>
- [DO ZAPROJEKTOWANIA] <opcje błędne/punktacja, których nie ma w nagraniu — propozycja do akceptacji>
- [NIEPEWNE] <rozbieżność w materiale źródłowym>
```

## Znaczniki

- `[DO DECYZJI]` — mechanika z VR nie przenosi się 1:1 na mysz (gesty, głębia, dwie ręce, minigra zręcznościowa). Opis: na czym polega w VR, dlaczego nie przenosi się wprost, jaki cel dydaktyczny adaptacja musi zachować. **Bez narzucania rozwiązania** — decyduje użytkownik.
- `[DO ZAPROJEKTOWANIA]` — nagranie pokazuje tylko ścieżkę idealną. Opcje błędne, ich poziomy i punktacja nie istnieją w nagraniu. Skill **proponuje** je jawnie tym znacznikiem, do akceptacji — nie wstawia po cichu jako fakt.
- `[NIEPEWNE]` — sprzeczność lub luka w materiale źródłowym (np. różna liczba segmentów w dwóch opisach tej samej sceny).

## Minimalny przykład

```
## Etap 2: //BAZA_WIRUSÓW
Klocek: ChoiceCards
Cel dydaktyczny: rozróżnienie typów malware i dobór narzędzia do celu operacji.

Decyzja D1: "WYBIERZ ODPOWIEDNIEGO WIRUSA:"
- RANSOMWARE — "<opis z UI>" | ideal | zgodny z celem operacji
- RAT — "<opis z UI>" | suboptimal | nie realizuje celu etapu
- KEYLOGGER — "<opis z UI>" | critical | metoda chybiona dla tego celu

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "STWORZĘ TAKIE HASŁO, ŻE ICH SPECJALIŚCI NIE ZŁAMIĄ GO PRZEZ TYGODNIE."
- odblokuj: //WIRUS: RANSOMWARE

## Odchylenia od VR / do decyzji
- [DO DECYZJI] skaner sygnatury: w VR wodzenie laserem po ekranie; cel = poczucie
  „składania" narzędzia, bez oceny. Forma w webie do ustalenia.
- [DO ZAPROJEKTOWANIA] poziomy i feedback dla RAT i KEYLOGGER — w nagraniu brak,
  propozycja powyżej do akceptacji.
```
