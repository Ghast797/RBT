# INSTRUKCJA WDROŻENIA PACZKI SCORM 2004 W MOODLE
## Misja 3: O&L Company – Infiltracja Socjotechniczna (HACKERS.OS)

Niniejszy poradnik przeprowadzi Cię krok po kroku przez proces dodania, skonfigurowania i przetestowania gotowej paczki SCORM w Twoim kursie na platformie Moodle.

---

## 1. Lokalizacja i Budowanie Paczki SCORM

Gotowa paczka archiwum `.zip` generowana jest automatycznie komendą:
```bash
npm run build:scorm
```
- **Plik wyjściowy:** `dist/scorm-mission3-olcompany.zip`
- **Waga pliku:** ~116 KB (wszystkie assety, wektory SVG i kod w jednym samowystarczalnym archiwum)
- **Standard:** SCORM 2004 4th Edition
- **Ścieżki zasobów:** Relatywne (`base: './'`), w pełni kompatybilne z mechanizmem `pluginfile.php` w Moodle

---

## 2. Krok po Kroku: Dodawanie Aktywności w Kursie Moodle

> **Wymagane uprawnienia:** Prowadzący z prawem edycji (Teacher / Editing Teacher) lub Administrator Moodle.

### Krok 1: Włączenie trybu edycji
1. Zaloguj się do platformy Moodle i wejdź do wybranego kursu.
2. W prawym górnym rogu kliknij przełącznik **Włącz tryb edycji** (*Edit mode*).

### Krok 2: Dodanie aktywności SCORM
1. W wybranej sekcji/tygodniu kursu kliknij **+ Dodaj aktywność lub zasób** (*Add an activity or resource*).
2. Na liście aktywności wybierz **Pakiet SCORM** (*SCORM package*).

### Krok 3: Sekcja „Ogólne” (*General*)
- **Nazwa (*Name*):** `Misja 3: O&L Company – Infiltracja Socjotechniczna`
- **Opis (*Description*):**
  > Wciel się w rolę nowego analityka ofensywnego organizacji DARKSUN. Twoim celem jest przeprowadzenie wieloetapowego ataku socjotechnicznego (spear phishing, rekonesans OSINT, baiting fizyczny dronem) na pracownika firmy O&L Company.
  > 
  > **Uwaga:** Symulacja uruchomi się w nowej karcie przeglądarki. Po przejściu misji pamiętaj o kliknięciu przycisku przesłania wyniku w podsumowaniu!
- **Wyświetl opis na stronie kursu:** Opcjonalnie zaznacz, jeśli chcesz, by instrukcja była widoczna od razu.

### Krok 4: Wgranie pliku archiwum (*Package*)
1. W sekcji **Plik pakietu** (*Package file*) przeciągnij i upuść plik:
   `dist/scorm-mission3-olcompany.zip`
   *(lub kliknij ikonę dodania pliku i wskaż go z dysku).*

---

## 3. Kluczowe Ustawienia Konfiguracyjne (KROK PO KROKU)

Aby gra działała płynnie w nowej karcie i poprawnie przekazywała oceny do Dziennika Ocen, ustaw poniższe parametry:

### Sekcja: Wygląd (*Appearance*)
* **Wygląd pakietu (*Display package*):** Wybierz **Nowe okno (*New window*)**
  *(To kluczowe ustawienie – otwiera grę w pełnym oknie z zachowaniem mostu `window.opener`)*
* **Szerokość (*Width*):** `100%` (lub `1920`)
* **Wysokość (*Height*):** `100%` (lub `1080`)
* **Opcje nowego okna (*Options for new window*):**
  * Zaznacz: *Zezwalaj na zmianę rozmiaru okna* (*Allow window to be resized*)
  * Zaznacz: *Zezwalaj na paski przewijania* (*Allow window to be scrolled*)
* **Wyświetl strukturę kursu na stronie wejściowej (*Display course structure on entry page*):** `Nie (*No*)`
* **Wyświetl strukturę kursu w odtwarzaczu (*Display course structure in player*):** `Ukryte (*Disabled*)`
* **Pokaż przyciski nawigacyjne (*Show navigation buttons*):** `Nie (*No*)`

### Sekcja: Ocena (*Grade*)
* **Metoda oceniania (*Grading method*):** Wybierz **Najwyższa ocena (*Highest grade*)**
* **Ocena maksymalna (*Maximum grade*):** `100`
* **Ocena wymagana do zaliczenia (*Grade to pass*):** `70`

### Sekcja: Zarządzanie próbami (*Attempts management*)
* **Liczba prób (*Number of attempts*):** `2` (lub `Nieograniczona` – wedle uznania prowadzącego)
* **Ocenianie prób (*Attempts grading*):** **Najwyższa próba (*Highest grade*)**
* **Wymuś nową próbę (*Force new attempt*):** `Nie (*No*)`
* **Zablokuj po ostatniej próbie (*Lock after final attempt*):** Zaznacz, jeśli student ma mieć tylko 2 podejścia.

### Sekcja: Ukończenie aktywności (*Activity completion*)
* **Śledzenie ukończenia (*Completion tracking*):** **Pokaż aktywność jako ukończoną, gdy warunki są spełnione**
* **Wymagaj oceny (*Require grade*):** Zaznacz: *Student musi otrzymać ocenę, aby ukończyć tę aktywność*
* **Wymagaj statusu (*Require status*):** Zaznacz: **Zaliczona (*Passed*)**

Kliknij **Zapisz i wróć do kursu (*Save and return to course*)**.

---

## 4. Przebieg Sesji z Perspektywy Studenta

1. Student klika aktywność w kursie Moodle i wciska przycisk **Rozpocznij (*Enter*)**.
2. W nowej karcie przeglądarki uruchamia się cyber-terminal `//HACKERS.OS`.
3. Student przechodzi przez kolejne etapy misji:
   - Konfiguracja wirusa RAT w bazie trojanów.
   - Analiza pracowników i wybór celu (Mateusz Klimowicz – junior).
   - Analiza imprezy firmowej w zakładce Wydarzenia i wybór wektora ataku.
   - Przygotowanie pendrive'a USB z przynętą zdjęciową.
   - Rekonesans dronem parkingu we Wrocławiu i zrzut koperty.
   - Zdalne przejęcie sesji ofiary.
4. Na ekranie **DEBRIEFING** student klika neonowy przycisk:
   **`[PRZEŚLIJ WYNIK DO MOODLE I ZAKOŃCZ]`**.
5. Moduł SCORM 2004 wykonuje:
   - Zapis punktów (`cmi.score.raw`: 70-100)
   - Zapis statusu (`cmi.success_status`: `passed`)
   - Zapis czasu sesji (`cmi.session_time`)
   - Rejestrację 8 wyborów taktycznych (`cmi.interactions.0..7`)
   - `Commit("")` oraz `Terminate("")`
6. Pojawia się okno potwierdzenia z przyciskiem **`[ZAMKNIJ KARTĘ I WRÓĆ DO MOODLE]`**:
   - Przycisk podejmuje wielopoziomową próbę zamknięcia okna (`window.close()`, `window.top.close()`, `window.open('', '_self').close()`) oraz aktywuje pierwotną kartę Moodle (`window.opener.focus()`).
   - Jeśli przeglądarka studenta (zgodnie z politykami Chrome/Edge/Firefox) zablokuje automatyczne zamknięcie karty, aplikacja natychmiast wyświetla czytelną instrukcję z potwierdzeniem:
     * *„Twój wynik został już w 100% zapisany w Moodle!”*
     * *„Wciśnij skrót klawiszowy Ctrl + W (lub zamknij kartę krzyżykiem X u góry)”*
     * Przycisk jednym kliknięciem przełącza widok z powrotem na kartę z kursem Moodle.

---

## 5. Jak Prowadzący Może Sprawdzić Wyniki w Moodle?

Prowadzący ma dostęp do dwóch poziomów raportów:

### 1. Dziennik Ocen Moodle (*Grades*)
- W zakładce **Oceny** przy nazwisku studenta automatycznie pojawi się wynik punktowy (np. `90.00 / 100.00`).
- Jeśli student zdobył $\ge 70$ pkt, aktywność zostaje automatycznie oznaczona zielonym ptaszkiem ukończenia.

### 2. Raport Interakcji SCORM (*Reports -> Interactions*)
1. Kliknij utworzoną aktywność SCORM w kursie.
2. Przejdź do zakładki **Raporty (*Reports*)**.
3. Wybierz podzakładkę **Interakcje (*Interactions*)**.
4. Zobaczysz tabelę z pełną historią decyzji studenta:
   - Czy poprawnie wybrał RAT (`result: correct`).
   - Kogo wytypował za cel ataku.
   - Jak nazwał pendrive'a i czy poprawnie wskazał auto ofiary na parkingu.
