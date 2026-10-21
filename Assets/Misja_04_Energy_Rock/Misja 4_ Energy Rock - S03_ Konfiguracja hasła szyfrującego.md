# **S03: Konfiguracja hasła szyfrującego**

# **Kontekst sceny**

* **Cel szkoleniowy:** Poznanie zasad tworzenia silnego hasła (odpowiednia długość powyżej standardowych minimów oraz łączenie małych i wielkich liter, cyfr i znaków specjalnych, przy jednoczesnym unikaniu znaków niedozwolonych lub problematycznych, takich jak spacje czy znaki diakrytyczne) oraz roli wbudowanych generatorów w menedżerach haseł.  
* **Stan wejściowy:** Po zakończeniu minigry kompilacji wirusa (S02), na głównym monitorze w oknie //BAZA\_WIRUSÓW wyświetla się formularz „USTAW ZŁOŻONOŚĆ HASŁA:". Domyślna długość hasła wynosi 8 znaków, pole cech hasła oraz wygenerowanego hasła są puste. Przycisk „WYGENERUJ" ma zielone obramowanie, a przycisk „ZAPISZ W BAZIE I KONTYNUUJ" jest wyszarzony (nieaktywny). Po prawej stronie w przestrzeni unosi się niebieska kostka dialogowa 3D.  
* **Odblokowane z wcześniejszych scen:** Skompilowany wirus ransomware (S02), do którego konfigurujemy parametry szyfrowania.  
* **Układ ekranu 2D:**  
  * **Środek (główny ekran):** Okno formularza //BAZA\_WIRUSÓW z fioletową ikoną ransomware w lewym górnym rogu. Zawiera od góry: suwak długości hasła z wartością liczbową (skala od 8 do 24), duże prostokątne pole „CECHY HASŁA:", linię wynikową „HASŁO:", a pod nią dwa przyciski akcji: „WYGENERUJ" (po lewej) oraz „ZAPISZ W BAZIE I KONTYNUUJ" (po prawej).  
  * **Lewa strona (przestrzeń boczna):** Zestaw sześciu zielonych kafelków z grupami znaków do przeciągania, ułożonych w kolumnach na lewo od monitora.  
  * **Prawa strona:** Pionowy ekran komunikatora z nagłówkiem BYTE\_MASTER.  
* **Elementy sceny:**  
  * **Formularz konfiguracji hasła:** Panel wewnątrz aplikacji Baza Wirusów.  
  * **Suwak „DŁUGOŚĆ HASŁA:":** Suwak poziomy ze wskaźnikiem i etykietą liczbową (wartości widoczne na nagraniu: 8, 12, 18, 24).  
  * **Pole „CECHY HASŁA:":** Obszar docelowy typu drag-and-drop, w którym po upuszczeniu pojawiają się białe kafelki wybranych cech.  
  * **Kafelki cech (w przestrzeni po lewej stronie):**  
    * PRZECIĄGNIJ \-\> DUŻE LITERY A-Z  
    * PRZECIĄGNIJ \-\> MAŁE LITERY A-Z  
    * PRZECIĄGNIJ \-\> CYFRY 0-9  
    * PRZECIĄGNIJ \-\> ZNAKI SPECJALNE \!@\#\$%^&\*()\_+  
    * PRZECIĄGNIJ \-\> BIAŁE ZNAKI NP. SPACJA (opcja błędna/niedozwolona)  
    * PRZECIĄGNIJ \-\> ZNAKI NARODOWE ĘĆŻŹĄ (opcja błędna/niedozwolona)  
  * **Przycisk „WYGENERUJ":** Aktywny przycisk generujący hasło na podstawie bieżących ustawień i wpisujący je w pole „HASŁO:".  
  * **Przycisk „ZAPISZ W BAZIE I KONTYNUUJ":** Przycisk zatwierdzający, stający się aktywny po spełnieniu kryteriów siły hasła.  
  * **Ekran walidacji „SIŁA HASŁA: 5/5":** Plansza podsumowująca parametry hasła z tekstem wyjaśniającym oraz zielonym przyciskiem „KONTYNUUJ".  
  * **Kostka dialogowa 3D:** Niebieski prostopadłościan z dłonią i tekstem o użyciu generatora menedżera haseł.

# **Kroki**

## **S03-K01: Wysłanie deklaracji użycia generatora haseł do mentora**

* **Obserwacja (VR):** Na początku sceny przed prawym ekranem czatu pojawia się niebieska kostka 3D. Gracz chwyta ją kontrolerem i rzuca w stronę ekranu komunikatora BYTE\_MASTER. Kostka rozbija się niebieskim rozbłyskiem, a jej treść pojawia się w oknie czatu jako wiadomość gracza.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** kostka dialogowa 3D w przestrzeni po prawej stronie  
  * **Widoczne, ale nieaktywne:** formularz „USTAW ZŁOŻONOŚĆ HASŁA:" na głównym ekranie (suwak, przyciski), kafelki cech po lewej stronie (pojawiają się dopiero po rzuceniu kostki lub stają się aktywne)  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Kostka pojawia się na pierwszym planie, dokładnie na wysokości wzroku, emitując pulsujący dźwięk. Znak informacyjny (i) przypomina o mechanice rzutu w ekran. Formularz na głównym ekranie czeka na rozpoczęcie interakcji.  
* **Akcja gracza (z nagrania):** Chwyta kostkę dialogową i rzuca ją w ekran komunikatora po prawej stronie.  
* **Niewybrane opcje:** brak innych opcji dialogowych.  
* **Informacja zwrotna:** Dźwięk chwycenia i energetyczny dźwięk rzutu; niebieski rozbłysk w punkcie uderzenia; dźwięk wysłania wiadomości i pojawienie się tekstu w oknie rozmowy z BYTE\_MASTER.  
* **Zmiana sceny:** Wiadomość pojawia się na czacie; po lewej stronie ekranu głównego materializuje się sześć zielonych kafelków z grupami znaków do wyboru.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** w wersji 2D dialog może zostać wysłany automatycznie po wejściu do sceny lub jako kliknięcie dymka odpowiedzi na panelu czatu. Po jego wysłaniu odblokowuje się interakcja z formularzem hasła.  
  * **Jak przenieść prowadzenie:** podświetlenie dymka w czacie lub automatyczne przejście do aktywnego formularza, aby nie wymuszać zbędnego klikania, jeśli nie ma wyboru ścieżki dialogowej.  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (pulsowanie panelu czatu lub przycisku wysłania wiadomości), poziom 2 po czasie T2 (komunikat: „Wyślij wiadomość do mentora, aby przejść do konfiguracji hasła").  
* **Kryterium ukończenia:** Wysłanie wiadomości o menedżerze haseł i uaktywnienie elementów konfiguracji hasła.

## **S03-K02: Ustawienie maksymalnej długości hasła na suwaku**

* **Obserwacja (VR):** Gracz kieruje wskaźnik lasera na suwak „DŁUGOŚĆ HASŁA:", chwyta znacznik suwaka i przeciąga go w prawo, zwiększając wartość z początkowych 8 do 24 znaków (maksimum skali).  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** suwak długości hasła (wartości od 8 do 24), kafelki cech po lewej stronie, przycisk „WYGENERUJ"  
  * **Widoczne, ale nieaktywne:** przycisk „ZAPISZ W BAZIE I KONTYNUUJ"  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Wskaźnik suwaka podświetla się po najechaniu wiązką. Etykieta liczbowa na bieżąco pokazuje wybraną wartość. Cel dydaktyczny wymaga ustawienia jak najdłuższego hasła, aby uniemożliwić jego szybkie złamanie metodą brute-force czy słownikową.  
* **Akcja gracza (z nagrania):** Przesuwa suwak na maksymalną wartość 24\.  
* **Niewybrane opcje:** pozostawienie domyślnych 8 znaków lub ustawienie wartości pośredniej (np. 12, 18); skutek wyboru: poza nagraniem (skutkowałoby niższą oceną końcową siły hasła).  
* **Informacja zwrotna:** Dźwięk przeskakiwania suwaka; zmiana etykiety liczbowej z 8 na 24\.  
* **Zmiana sceny:** Wartość parametru długości zostaje zaktualizowana w formularzu.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** standardowy suwak HTML/UI (slider) z możliwością przeciągania myszą lub klikania na podziałce.  
  * **Jak przenieść prowadzenie:** wyraźna podziałka suwaka z wyróżnioną etykietą liczbową zmieniającą kolor (np. żółty przy 8–12, zielony powyżej 16 znaków).  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (delikatne pulsowanie suwaka), poziom 2 po czasie T2 (komunikat: „Zwiększ długość hasła, aby utrudnić jego złamanie").  
* **Kryterium ukończenia:** Ustawienie suwaka na wartość 24\.

## **S03-K03: Dodanie grupy „DUŻE LITERY A-Z"**

* **Obserwacja (VR):** Gracz chwyta wiązką lasera zielony kafelek PRZECIĄGNIJ \-\> DUŻE LITERY A-Z lewitujący po lewej stronie i upuszcza go wewnątrz pola „CECHY HASŁA:". Następnie klika przycisk „WYGENERUJ", co generuje w polu hasła 24-znakowy ciąg składający się wyłącznie z wielkich liter.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** sześć kafelków cech po lewej stronie, suwak długości, przycisk „WYGENERUJ"  
  * **Widoczne, ale nieaktywne:** przycisk „ZAPISZ W BAZIE I KONTYNUUJ"  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Kafelki po lewej stronie mają zielone strzałki PRZECIĄGNIJ \-\> skierowane w stronę ekranu centralnego. Pole „CECHY HASŁA:" podświetla się przerywaną linią/obramowaniem po najechaniu z chwyconym kafelkiem.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek „DUŻE LITERY A-Z" do pola cech i klika „WYGENERUJ".  
* **Niewybrane opcje:** pozostałe kafelki (wybierane w kolejnych krokach lub pomijane).  
* **Informacja zwrotna:** Dźwięk upuszczenia elementu; pojawienie się kafelka z białą ramką wewnątrz pola cech; po kliknięciu „WYGENERUJ" – dźwięk generowania i wpisanie ciągu znaków w linii „HASŁO:".  
* **Zmiana sceny:** Kafelek „DUŻE LITERY A-Z" znika z lewej przestrzeni i zostaje zakotwiczony w polu cech.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** kafelki po lewej stronie i pole drop-zone „CECHY HASŁA:". Opcjonalnie możliwość przeciągania myszą (drag-and-drop) lub kliknięcia kafelka (kliknięcie dodaje go do pola).  
  * **Jak przenieść prowadzenie:** kafelki ułożone w czytelnej kolumnie obok formularza, z wyraźnym podświetleniem pola docelowego przy najechaniu.  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (pulsowanie kafelka DUŻE LITERY), poziom 2 po czasie T2 (komunikat: „Przeciągnij dozwolone grupy znaków do pola cech hasła").  
* **Kryterium ukończenia:** Dodanie cechy „DUŻE LITERY A-Z" do pola cech hasła.

## **S03-K04: Dodanie grupy „MAŁE LITERY A-Z"**

* **Obserwacja (VR):** Gracz chwyta kafelek PRZECIĄGNIJ \-\> MAŁE LITERY A-Z i przeciąga go do pola „CECHY HASŁA:", po czym klika przycisk „WYGENERUJ". W polu hasła pojawia się ciąg łączący duże i małe litery.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** pozostałe pięć kafelków cech, przycisk „WYGENERUJ"  
  * **Widoczne, ale nieaktywne:** przycisk „ZAPISZ W BAZIE I KONTYNUUJ"  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Uzupełnianie zestawu znaków o małe litery zwiększa przestrzeń klucza. Pole cech przyjmuje kolejny element obok pierwszego.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek „MAŁE LITERY A-Z" do pola cech i klika „WYGENERUJ".  
* **Niewybrane opcje:** pozostałe kafelki po lewej stronie.  
* **Informacja zwrotna:** Dźwięk upuszczenia; pojawienie się drugiego kafelka w polu; wygenerowanie nowego hasła zawierającego małe i wielkie litery.  
* **Zmiana sceny:** Kafelek „MAŁE LITERY A-Z" zostaje dodany do aktywnych reguł generatora.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** kafelki cech, pole drop-zone, przycisk generowania.  
  * **Jak przenieść prowadzenie:** analogicznie do kroku S03-K03.  
  * **Podpowiedź po bezczynności:** T1 – pulsowanie kafelka MAŁE LITERY; T2 – wskazówka tekstowa o konieczności łączenia wielkości liter.  
* **Kryterium ukończenia:** Dodanie cechy „MAŁE LITERY A-Z" do pola cech hasła.

## **S03-K05: Dodanie grupy „CYFRY 0-9"**

* **Obserwacja (VR):** Gracz chwyta kafelek PRZECIĄGNIJ \-\> CYFRY 0-9, przenosi go do pola „CECHY HASŁA:" i klika „WYGENERUJ". Wygenerowane hasło zawiera teraz litery i cyfry.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** pozostałe cztery kafelki cech, przycisk „WYGENERUJ"  
  * **Widoczne, ale nieaktywne:** przycisk „ZAPISZ W BAZIE I KONTYNUUJ"  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Dodanie cyfr to standardowy wymóg silnego hasła.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek „CYFRY 0-9" do pola cech i klika „WYGENERUJ".  
* **Niewybrane opcje:** pozostałe kafelki.  
* **Informacja zwrotna:** Dźwięk upuszczenia; pojawienie się trzeciego kafelka w polu; zaktualizowanie hasła w linii wynikowej.  
* **Zmiana sceny:** Kafelek „CYFRY 0-9" zostaje zablokowany w polu cech.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** kafelki, drop-zone, przycisk generowania.  
  * **Kryterium ukończenia:** Dodanie cechy „CYFRY 0-9" do pola cech hasła.

## **S03-K06: Dodanie grupy „ZNAKI SPECJALNE \!@\#\$%^&\*()\_+"**

* **Obserwacja (VR):** Gracz chwyta kafelek PRZECIĄGNIJ \-\> ZNAKI SPECJALNE \!@\#\$%^&\*()\_+ i upuszcza go w polu „CECHY HASŁA:". Następnie klika przycisk „WYGENERUJ". W linii „HASŁO:" pojawia się 24-znakowy ciąg zawierający wszystkie cztery dozwolone klasy znaków (np. B4YSELOSUE/m0V)BhE/B(QE4). W tym momencie przycisk „ZAPISZ W BAZIE I KONTYNUUJ" podświetla się na zielono i staje się w pełni aktywny.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** kafelki BIAŁE ZNAKI NP. SPACJA, ZNAKI NARODOWE ĘĆŻŹĄ, przycisk „WYGENERUJ", przycisk „ZAPISZ W BAZIE I KONTYNUUJ"  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Po dodaniu czwartej kluczowej cechy przycisk „ZAPISZ W BAZIE I KONTYNUUJ" natychmiast zmienia stan z wyszarzonego na aktywny z zielonym obramowaniem i zielonym tekstem, sygnalizując osiągnięcie wymaganej złożoności. Dwa pozostałe kafelki (BIAŁE ZNAKI oraz ZNAKI NARODOWE) gracz celowo ignoruje, ponieważ znaki diakrytyczne i spacje mogą powodować błędy kodowania w narzędziach ransomware lub są odrzucane przez standardy bezpieczeństwa.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek „ZNAKI SPECJALNE", klika „WYGENERUJ" i nie dodaje kafelków „BIAŁE ZNAKI" ani „ZNAKI NARODOWE".  
* **Niewybrane opcje:**  
  * PRZECIĄGNIJ \-\> BIAŁE ZNAKI NP. SPACJA – skutek wyboru: poza nagraniem (obniżenie oceny za użycie niedozwolonych znaków)  
  * PRZECIĄGNIJ \-\> ZNAKI NARODOWE ĘĆŻŹĄ – skutek wyboru: poza nagraniem (obniżenie oceny za użycie znaków narodowych)  
* **Informacja zwrotna:** Dźwięk upuszczenia; pojawienie się kafelka; po wygenerowaniu hasła – dźwięk aktywacji przycisku i zmiana koloru „ZAPISZ W BAZIE I KONTYNUUJ" na zielony.  
* **Zmiana sceny:** Przycisk „ZAPISZ W BAZIE I KONTYNUUJ" staje się klikalny.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** kafelki, drop-zone, przycisk „WYGENERUJ", odblokowany przycisk „ZAPISZ W BAZIE I KONTYNUUJ".  
  * **Jak przenieść prowadzenie:** dynamiczna zmiana stanu przycisku zapisu z disabled na enabled z wyraźnym zielonym podświetleniem.  
  * **Podpowiedź po bezczynności:** T1 – pulsowanie zielonego przycisku zapisu; T2 – komunikat: „Osiągnięto maksymalną złożoność. Zapisz hasło w bazie, unikając znaków narodowych i spacji".  
* **Kryterium ukończenia:** Dodanie znaków specjalnych do cech hasła, wygenerowanie poprawnego ciągu znaków i odblokowanie przycisku zapisu.

## **S03-K07: Zapisanie i walidacja hasła**

* **Obserwacja (VR):** Gracz klika aktywny, zielony przycisk „ZAPISZ W BAZIE I KONTYNUUJ". Formularz konfiguracji znika, a na głównym ekranie pojawia się plansza oceny siły hasła.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk „ZAPISZ W BAZIE I KONTYNUUJ"  
  * **Widoczne, ale nieaktywne:** pozostałe elementy formularza  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk jest jedynym wyróżnionym, zielonym elementem na ekranie po skonfigurowaniu cech.  
* **Akcja gracza (z nagrania):** Klika „ZAPISZ W BAZIE I KONTYNUUJ".  
* **Niewybrane opcje:** brak innych akcji.  
* **Informacja zwrotna:** Dźwięk zatwierdzenia sukcesu; zniknięcie formularza i kafelków z przestrzeni; wyświetlenie ekranu podsumowania.  
* **Zmiana sceny:** Znikają lewitujące kafelki po lewej stronie. Na ekranie głównym pojawia się panel „SIŁA HASŁA: 5/5" z opisem i przyciskiem „KONTYNUUJ".  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk „ZAPISZ W BAZIE I KONTYNUUJ".  
  * **Kryterium ukończenia:** Kliknięcie przycisku i przejście do widoku oceny siły hasła.

## **S03-K08: Zatwierdzenie oceny siły hasła**

* **Obserwacja (VR):** Gracz czyta treść podsumowania na ekranie („SIŁA HASŁA: 5/5...") i klika zielony przycisk „KONTYNUUJ".  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk „KONTYNUUJ"  
  * **Widoczne, ale nieaktywne:** tekst podsumowania na panelu głównym, komunikator po prawej  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk „KONTYNUUJ" znajduje się centralnie pod tekstem oceny i jest jedynym interaktywnym elementem.  
* **Akcja gracza (z nagrania):** Klika przycisk „KONTYNUUJ".  
* **Niewybrane opcje:** brak innych opcji.  
* **Informacja zwrotna:** Dźwięk kliknięcia i zatwierdzenia; przejście do kolejnego etapu aplikacji.  
* **Zmiana sceny:** Ekran siły hasła znika. Po lewej stronie pojawia się pionowy panel instrukcji z nagłówkiem „ZAPROJEKTUJ WIADOMOŚĆ DLA OFIARY / KROK 1", a na ekranie centralnym ukazuje się siatka do rozmieszczenia komponentów komunikatu (początek sceny S04). Jednocześnie na prawym ekranie czatu BYTE\_MASTER komentuje wybór hasła.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk „KONTYNUUJ".  
  * **Kryterium ukończenia:** Kliknięcie przycisku „KONTYNUUJ", zapisanie wyniku Wyboru nr 2 (Siła wygenerowanego hasła: skala do 5 – wynik maksymalny) i przejście do sceny S04.

**\[DO DECYZJI\]:** W wersji VR kafelki grup znaków unoszą się w przestrzeni 3D poza monitorem, a gracz przeciąga je laserem do okna na zakrzywionym ekranie. W adaptacji 2D należy zdecydować, czy kafelki mają być przeciągane techniką drag-and-drop ze strefy bocznej do pola „CECHY HASŁA:", czy wystarczy prosty model klikalnych chipów/przełączników (kliknięcie dodaje cechę do pola lub zaznacza checkbox w interfejsie menedżera haseł).

# **Stan po scenie**

* Wygenerowane i zapisane hasło szyfrujące (24 znaki, małe i wielkie litery, cyfry, znaki specjalne).  
* Uzyskany maksymalny wynik w kategorii Wybór 2 (Siła hasła: 5/5 punktów).  
* Zamknięty etap konfiguracji parametrów hasła; otwarta aplikacja na etapie projektowania wiadomości z żądaniem okupu (S04).

# **Dialogi i teksty w scenie**

* **Treść kostki dialogowej gracza (S03-K01):**  
  „STWORZĘ TAKIE HASŁO, ŻE NIE MA SZANS, ŻEBY ICH SPECJALIŚCI ZŁAMALI JE PRZEZ NAJBLIŻSZE TYGODNIE. WYKORZYSTAM GENERATOR W MOIM MENEDŻERZE HASEŁ"  
* **Napisy na kafelkach cech hasła:**  
  * PRZECIĄGNIJ \-\> DUŻE LITERY A-Z  
  * PRZECIĄGNIJ \-\> MAŁE LITERY A-Z  
  * PRZECIĄGNIJ \-\> CYFRY 0-9  
  * PRZECIĄGNIJ \-\> ZNAKI SPECJALNE \!@\#\$%^&\*()\_+  
  * PRZECIĄGNIJ \-\> BIAŁE ZNAKI NP. SPACJA  
  * PRZECIĄGNIJ \-\> ZNAKI NARODOWE ĘĆŻŹĄ  
* **Ekran podsumowania siły hasła:**  
  * Nagłówek: SIŁA HASŁA: 5/5  
  * Treść: UŻYTO MAKSYMALNEJ ILOŚCI ZNAKÓW ORAZ ZNAKÓW SPECJALNYCH, JEDNOCZEŚNIE UNIKAJĄC TYCH NIEDOZWOLONYCH. STWORZONO NAPRAWDĘ BARDZO SILNE HASŁO  
  * Przycisk: KONTYNUUJ

