# Plan kursu Moodle (FreeVolt) – propozycja do wspólnej pracy

Stan na 2026-11-10. Kurs: https://ctf.redblueteam.pl/course/view.php?id=2

## Struktura lekcji (powtarzalna dla M1–M4)

Jedna sekcja kursu = jedna lekcja, nazwana jak scenariusz. Każda ma 3 kroki w tej kolejności:

1. **Misja (SCORM)** – paczka z `node scripts/package-scorm.js --mission=X`.
2. **Co powinieneś zapamiętać? (Książka)** – slajdy edukacyjne, jeden rozdział = jeden slajd.
3. **Sprawdź się (Quiz)** – 3–5 pytań z treści slajdów, bez limitu podejść, próg zaliczenia 60%.

Odblokowanie: Książka wymaga ukończenia SCORM, Quiz wymaga obejrzenia Książki
(warunek ukończenia „wyświetlono wszystkie rozdziały" / „wynik ≥ próg").
Kolejna lekcja zostaje otwarta (studenci mogą iść w dowolnej kolejności), chyba że zdecydujemy inaczej.

## Stan (2026-11-10, po wdrożeniu w Moodle)

| Lekcja | SCORM | Książka | Quiz | Warunki ukończenia |
|---|---|---|---|---|
| Petro Log (M1) | jest | jest, 4 rozdz. | jest, 4 pyt. | Książka: obejrzeć, dostępna po SCORM; Quiz: dostępny po Książce, zaliczenie ≥ 6/10 |
| CarbonFlow (M2) | **brak – do wgrania** (`dist/scorm-mission-2-carbonflow.zip`) | jest, 5 rozdz. | jest, 4 pyt. | Książka: obejrzeć; Quiz: po Książce, ≥ 6/10 |
| O&L Company (M3) | **brak – do wgrania** (`dist/scorm-mission-3-ol-company.zip`) | jest, 5 rozdz. | jest, 4 pyt. | jw. |
| Energy Rock (M4) | **brak – do wgrania** (`dist/scorm-mission-4-energy-rock.zip`) | jest, 5 rozdz. | jest, 4 pyt. | jw. |
| Bank Bcorp (M5) | **brak – do wgrania** (`dist/scorm-mission-5-bank-bcorp.zip`, po dostarczeniu logo i portretu) | przygotowana, 6 rozdz. (`ksiazka-misja-5.zip`) | przygotowany, 5 pyt. (`quizy.gift`, kategoria „Misja 5 – Bank Bcorp”) | jw. |

Pytania: `quizy.gift` (zaimportowane do banku kursu, kategorie „Misja 1–4"). Po wgraniu SCORM M2–M4
trzeba dodać ograniczenie „Książka dostępna po ukończeniu SCORM" (jak w Petro Log).

## Do ustalenia razem

- Kolejność lekcji: wolna czy narzucona (M1 → M4)?
- Quiz: pytania pisze Claude, zatwierdza właściciel. Typy: jednokrotny wybór, prawda/fałsz, dopasowanie.
- Ukończenie kursu: po wszystkich 4 lekcjach? Certyfikat lub odznaka?
- Lekcje M2 i M4 „do recenzji właściciela" – przejrzeć przed publikacją.
- Slajd 5 („Chcesz uniknąć hakowania?") – docelowy odsyłacz do materiałów kursu (np. osobna sekcja „Baza wiedzy" z plików `docs/moodle-baza-wiedzy.md`, dziś są dla M1 i M3).
- Wygląd Książki: styl zwykły czy H5P (bardziej „slajdowy").

## Kolejność prac

1. Zbudować i wgrać SCORM M2–M4.
2. Napisać i zatwierdzić pytania quizów (po jednym quizie na lekcję).
3. Dodać quizy do kursu.
4. Ustawić warunki ukończenia i ukończenie kursu.
5. Test na koncie studenta (odblokowywanie, wyniki).
