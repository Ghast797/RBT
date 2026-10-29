# Misja 1: PetroLog – Specyfikacja Scenariusza (2D / SCORM)

## 1. Metadane misji
* **ID:** `mission-1-petrolog`
* **Tytuł:** Misja 1 – PetroLog
* **Podtytuł:** OSINT, profilowanie pracownika i ukierunkowany spear-phishing
* **Cel ataku:** PetroLog (przedsiębiorstwo logistyczne dysponujące danymi o łańcuchu dostaw technologii Freevolt)
* **Liczba ocenianych decyzji:** 4 (`D1`–`D4`)
* **Próg zaliczenia (`passingScore`):** 75%
* **Nagroda:** 2,52 BTC (stan początkowy portfela: 0,00 BTC; po pomyślnym ukończeniu: 2,52 BTC; trofeum: Złoty puchar za 100%)
* **Kolor przewodni UI:** `#00FF66` (Terminal Green)
* **Data fabularna:** 14.01.2025
* **Środowisko:** `//HACKERS.OS`

---

## 2. Spis aplikacji i sekwencja odblokowań (`//HACKERS.OS`)

| ID kafelka | Etykieta | Kolejność | Warunek odblokowania |
| :--- | :--- | :--- | :--- |
| `app_chat_bm` | `//KOMUNIKATOR: BYTE_MASTER` | 1 | Dostępny od początku (przychodzące połączenie Darknet) |
| `app_target_petrolog` | `//BAZA_CELU: PETROLOG` | 2 | Zakończenie dialogu wprowadzającego i uruchomienie systemu |
| `app_osint_search` | `//WYSZUKIWARKA: OSINT` | 3 | Zapoznanie się z kartami wywiadowczymi o firmie PetroLog (S01) |
| `app_social_intel` | `//SOCIAL_MEDIA` | 4 | Wytypowanie pracownika z profilem publicznym (S02) |
| `app_phishing_builder` | `//KREATOR_PHISHINGU` | 5 | Skompletowanie 8 faktów o ofierze w panelu analizy (S03) |
| `app_victim_monitor` | `//MONITOR_OFIARY` | 6 | Zatwierdzenie parametrów wiadomości i wysłanie phishingu (S04) |

---

## 3. Kanoniczna lista ocenianych decyzji (`D1`–`D4`)

| ID | Krok sceny | Nazwa decyzji / Minigra | Wybór optymalny |
| :--- | :--- | :--- | :--- |
| **D1** | S04 - Krok 1 | Wybór domeny strony-pułapki | `DALEKBIEG.INFO` |
| **D2** | S04 - Krok 2 | Wybór pliku-przynęty (payload) | `PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK` |
| **D3** | S04 - Krok 4 | Wybór tożsamości nadawcy | `JAKUB KWIATKOWSKI` |
| **D4** | S04 - Krok 5 | Wybór adresu e-mail nadawcy (spoofing) | `K.KWIATKOWSKI@PETROLOG.COM` |

---

## 4. Przebieg scen, dialogów i minigier

### Blok dialogowy: INTRO (Czat Darknet)
* **Typ węzła:** Narracyjny / Wprowadzający (nieoceniany)
* **Komponent 2D:** `DialogueTree`
* **Kontekst:** Gracz nawiązuje szyfrowany kontakt z liderem kolektywu DarkSun – BYTE_MASTEREM.

#### Drzewo dialogowe:
1. **BYTE_MASTER:** „DOSTAŁEM TWOJĄ WIADOMOŚĆ. A WIĘC CHCESZ DO NAS DOŁĄCZYĆ.”
   * **Gracz:** „TAK, MAM INFORMACJE, ILE DOBREGO WASZA GRUPA ROBI W SIECI. ZNAM SIĘ NA CYBERBEZPIECZEŃSTWIE, UMIEM ZDOBYWAĆ DANE NIEDOSTĘPNE DLA INNYCH. MOŻE SIĘ PRZYDAM?”
2. **BYTE_MASTER:** „DARKSUN TO NIE ZABAWA. WYKRADAJMY INFORMACJE NAJLEPIEJ STRZEŻONYCH FIRM I NIE BIERZEMY JEŃCÓW. MUSISZ BYĆ W PEŁNEJ GOTOWOŚCI.”
   * **Gracz:** „JESTEM. W KOŃCU DZIAŁACIE W SŁUŻBIE NAS WSZYSTKICH.”
3. **BYTE_MASTER:** „ZGADZA SIĘ, LUBIMY PSUĆ PLANY TYM, KTÓRZY MYŚLĄ, ŻE SĄ PANAMI TEGO ŚWIATA. ZANIM JEDNAK PRZYJMIEMY CIĘ W SWOJE SZEREGI, MUSISZ SIĘ WYKAZAĆ. TAK SIĘ SKŁADA, ŻE MAM DLA CIEBIE IDEALNE ZADANIE.”
   * **Gracz:** „OK, PRZYJMUJĘ WYZWANIE.”
4. **BYTE_MASTER:** „FREEVOLT - MÓWI CI TO COŚ?”
   * **Gracz:** „NIE ZA WIELE.”
5. **BYTE_MASTER:** „NO WŁAŚNIE. TO TECHNOLOGIA, KTÓRA POZWOLIŁABY LUDZIOM NA DARMOWY I NIESKOŃCZONY DOSTĘP DO ENERGII. JAK SIĘ DOMYŚLASZ, JEST TO SPRZECZNE Z INTERESAMI WIELKICH KONCERNÓW ENERGETYCZNYCH, KTÓRE WESZŁY W POSIADANIE CAŁEJ DOKUMENTACJI I PILNIE STRZEGĄ, ŻEBY NIKT SIĘ O NIEJ NIE DOWIEDZIAŁ.”
   * **Gracz:** „CZYLI MAM WYKRAŚĆ TE DANE?”
6. **BYTE_MASTER:** „DOKŁADNIE, A PRZY OKAZJI MOŻESZ NA TYM NIEŹLE ZAROBIĆ. POTRAKTUJ TO JAKO ZACHĘTĘ DO DZIAŁANIA.”
   * **Gracz:** „BRZMI JAK PLAN. TO OD CZEGO ZACZYNAMY?”
7. **BYTE_MASTER:** „PETROLOG. TO FIRMA LOGISTYCZNA, DZIĘKI KTÓREJ POZNAMY DOKŁADNY ŁAŃCUCH DOSTAW I NAZWY FIRM POSIADAJĄCYCH INFORMACJE O FREEVOLT. TO POZWOLI NAM ZAPLANOWAĆ DALSZE RUCHY.”
   * **Wariant gracza A:** „Z MOJEGO DOŚWIADCZENIA WYNIKA, ŻE NAJSŁABSZYM OGNIWEM SĄ LUDZIE. SPRAWDZĘ PRACOWNIKÓW FIRMY I ZOBACZĘ, KOGO MOŻNA NAJŁATWIEJ ZHAKOWAĆ.” *(ścieżka domyślna)*
   * **Wariant gracza B:** „PRZEJMĘ ICH SOCIAL MEDIA I STWORZĘ WIRUSA, KTÓRY PRZECHWYCI POTRZEBNE DANE.”
8. **BYTE_MASTER:** „BIERZ SIĘ DO PRACY I CZEKAM NA WIADOMOŚĆ.”

* **Akcja końcowa:** Kliknięcie przycisku `[WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS]` -> animacja bootloadera `TROMBODISK 2.0` -> przejście do pulpitu.

---

### Scena S01: Odprawa wywiadowcza – PetroLog (`//BAZA_CELU: PETROLOG`)
* **Typ węzła:** Briefing operacyjny
* **Komponent 2D:** `ChoiceCards` / Karuzela slajdów informacyjnych
* **Przebieg:**
  1. **Slajd 1:** Prezentacja celu misji: „ZADANIE 1: MUSISZ ZHAKOWAĆ FIRMĘ LOGISTYCZNĄ PETROLOG” -> przycisk `[START ZADANIA]`.
  2. **Slajd 2 (Wskazówka 1/3):** „CO WIEMY O FIRMIE PETROLOG? 1. POSIADA INFORMACJE O FREEVOLT” -> przycisk `[NASTĘPNA WSKAZÓWKA]`.
  3. **Slajd 3 (Wskazówka 2/3):** „2. W FIRMIE PRACUJE 150 OSÓB” -> przycisk `[NASTĘPNA WSKAZÓWKA]`.
  4. **Slajd 4 (Wskazówka 3/3):** „3. PRACOWNICY SĄ BARDZO AKTYWNI NA SOCIAL MEDIACH” -> przycisk `[URUCHOM WYSZUKIWARKĘ]`.
* **Warunek ukończenia:** Kliknięcie `[URUCHOM WYSZUKIWARKĘ]` (odblokowuje aplikację `//WYSZUKIWARKA: OSINT`).

---

### Scena S02: Wyszukiwarka OSINT i selekcja celu (`//WYSZUKIWARKA: OSINT`)
* **Typ węzła:** Selekcja celu (bramka logiczna)
* **Komponent 2D:** Pasek wyszukiwania + `ChoiceCards`
* **Przebieg:**
  1. **Ekran wyszukiwania:** Gracz wprowadza frazę w pasku wyszukiwania: `PETROLOG PRACOWNICY` i klika ikonę lupy.
  2. **Ekran wyników wyszukiwania:** Prezentacja dwóch profili:
     * **Karta A:** `MARCELINA SOJKA – DZIAŁ SPRZEDAŻY`
     * **Karta B:** `ANITA KLIMEK – DZIAŁ KSIĘGOWY`
  3. **Ścieżka błędu (Marcelina Sojka):**
     * Pojawia się okno błędu: „ERROR: MARCELINA SOJKA USTAWIŁA WSZYSTKIE SWOJE SOCIAL MEDIA NA 'PRYWATNE'. NIE MAMY JAK ZDOBYĆ O NIEJ INFORMACJI.”
     * Przycisk: `[WRÓĆ DO LISTY PRACOWNIKÓW]`.
  4. **Ścieżka poprawna (Anita Klimek):**
     * Profil publiczny dostępny. System przechodzi do modułu analizy mediów społecznościowych.

---

### Scena S03: Eksploracja mediów społecznościowych i profilowanie (`//SOCIAL_MEDIA`)
* **Typ węzła:** Minigra analityczna (OSINT / zbieranie faktów)
* **Komponent 2D:** `PoolSelect` / Widok split-screen:
  * **Lewy panel:** Profil Anity Klimek + licznik skompletowanych cech (0/8).
  * **Prawy panel:** Interaktywny symulator aplikacji social media z przyciskami `[SKANUJ WPIS OFIARY]` oraz `[NASTĘPNY WPIS]`.

#### Analizowane serwisy i baza postów:

#### 1. Platforma `Kneenook` (odpowiednik Facebooka)
* **Wpis 1:** Zdjęcie z biura: „Od 5 lat pracuję w firmie PetroLog. Po prostu uwielbiam tę pracę. Wspaniali współpracownicy, odpowiedni zakres obowiązków i ciągły rozwój. Zdecydowanie polecam!”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `PRACUJE W FIRMIE PETROLOG`.
* **Wpis 2:** Zdjęcie dzieci na trawniku: „Wspólna zabawa z moimi dziećmi ❤️ Jednak czasem weekend z rodziną to wyzwanie! 📷 fotograf: @j_kwiatkowski”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `JEST MATKĄ DWÓJKI DZIECI`.
* **Wpis 3:** Zdjęcie z biegu nad morzem: „Bieganie na plaży? Czemu nie? 🏃 Biegam praktycznie wszędzie, nawet na wakacjach - kocham ten sport! 👟”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `UWIELBIA BIEGAĆ`.
* **Wpis 4:** Zdjęcie odnowionego pokoju: „W końcu remont po 6 latach! Potrzebowałam tego, a tym bardziej moi chłopcy!”
  * *Akcja:* Skanuj -> **BRAK PRZYDATNYCH INFORMACJI** (zmyłka).

#### 2. Platforma `Quickgram` (odpowiednik Instagrama)
* **Wpis 1:** Kubek kawy i ciastka: „Kawa i ciasteczka! ☕️ Poniedziałki potrafią być ciężkie, ale z tym zestawem zawsze dam radę! #work #coffee #magia”
  * *Akcja:* Skanuj -> **BRAK PRZYDATNYCH INFORMACJI** (zmyłka).
* **Wpis 2:** Domowy wypiek z owocami: „Sobota - no to ciasto! 🍰 #bake #wypieki #rodzinnie”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `LUBI PIEC CIASTA`.
* **Wpis 3:** Zdjęcie ze wspólnego treningu: „Uwielbiamy razem biegać, ostatnio dosłownie KAŻDY wieczór to porządny trening! 🏃‍♀️🏃‍♂️ @j_kwiatkowski”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `CODZIENNIE WIECZOREM BIEGA Z KUBĄ KWIATKOWSKIM`.
* **Wpis 4:** Biegaczka na tle molo: „Nienawidzę sprintów! 🏃‍♀️ Tylko biegi długodystansowe! Muzyka, odpowiednie tempo i mogę biec godzinami! #running #workout”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `BIEGA DŁUGODYSTANSOWO`.

#### 3. Platforma `Joinin` (odpowiednik LinkedIna)
* **Wpis 1:** Zwycięska statuetka i biurko: „Kolejny sukces w pracy! Jaki jest mój sekret? Codzienna dawka sportu! To właśnie dlatego mam tyle energii!”
  * *Akcja:* Skanuj -> **BRAK PRZYDATNYCH INFORMACJI** (zmyłka).
* **Wpis 2:** Zdjęcie zespołu przy dokumentach: „Najlepsi współpracownicy! Razem z Kubą Kwiatkowskim rozliczamy każdą fakturę w #Petrolog! Życzę każdemu takiej ekipy w pracy!”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `PRACUJE Z KUBĄ KWIATKOWSKIM`.
* **Wpis 3:** Pytanie do społeczności zawodowej: „Dzisiaj oderwanie od tematów zawodowych. Wiecie może jak poprawić swoje wyniki w biegach długodystansowych? Jakieś konkretne rady?”
  * *Akcja:* Skanuj -> **ZNALEZIONO INFORMACJĘ** -> pobrany kafelek: `SZUKA RAD NA TEMAT BIEGANIA DŁUGODYSTANSOWEGO`.

* **Warunek ukończenia:** Umieszczenie wszystkich 8 właściwych kafelków w lewym panelu cech ofiary. Pojawia się komunikat: „INFORMACJE GOTOWE! UTWÓRZ STRONĘ INTERNETOWĄ Z WIRUSEM” -> przycisk `[PRZEJDŹ DALEJ]`.

---

### Scena S04: Przygotowanie kampanii spear-phishingowej (`//KREATOR_PHISHINGU`)
* **Typ węzła:** Złożony kreator socjotechniczny (decyzje oceniane `D1`–`D4`)
* **Komponent 2D:** Sekwencja paneli wyboru i interakcji `Drag-and-drop`.

#### Krok 1: Wybór domeny strony-pułapki (Decyzja D1)
* **Nagłówek:** „OSZUKAĆ OFIARĘ – WYBIERZ ADRES STRONY, KTÓRY MOŻE JĄ ZAINTERESOWAĆ”
* **Warianty:**
  * **Opcja A:** `DALEKBIEG.INFO`  
    * *Ocena:* **ideal** (100 pkt)  
    * *Uzasadnienie:* Bezpośrednie odwołanie do pasji do biegów długodystansowych i poszukiwania porad przez ofiarę.
  * **Opcja B:** `MUFINA.ORG.PL`  
    * *Ocena:* **suboptimal** (50 pkt)  
    * *Uzasadnienie:* Nawiązuje do pieczenia ciast, ale nie łączy się z aktywnymi zapytaniami z sieci zawodowej; domena org.pl nie budzi zaufania jako serwis kulinarny.
  * **Opcja C:** `MEDIKARZ.IQ`  
    * *Ocena:* **critical** (0 pkt)  
    * *Uzasadnienie:* Tematyka medyczna jest całkowicie oderwana od zainteresowań ofiary i wzbudzi natychmiastową nieufność.

#### Krok 2: Wybór pliku-przynęty (Decyzja D2)
* **Nagłówek:** „OSZUKAĆ OFIARĘ – WYBIERZ PLIK, KTÓRY OFIARA BĘDZIE MOGŁA POBRAĆ ZE STRONY. NIECH BĘDZIE ZACHĘCAJĄCY.”
* **Warianty:**
  * **Opcja A:** `PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK`  
    * *Ocena:* **ideal** (100 pkt)  
    * *Uzasadnienie:* Precyzyjna odpowiedź na publiczne zapytanie Anity z portalu Joinin.
  * **Opcja B:** `TAPETY DLA BIEGACZY NA TELEFON`  
    * *Ocena:* **suboptimal** (50 pkt)  
    * *Uzasadnienie:* Mało angażujący zasób, który nie odpowiada potrzebie zdobycia merytorycznej wiedzy.
  * **Opcja C:** `KOD ŹRÓDŁOWY STRONY`  
    * *Ocena:* **critical** (0 pkt)  
    * *Uzasadnienie:* Całkowity błąd profilowania – księgowa nigdy nie zainteresuje się pobieraniem surowego kodu.

#### Krok 3: Implementacja ładunku (Payload Injection – Flavor)
* **Nagłówek:** „ZAWIRUSUJ PLIK – DODAJ WIRUSA DO STRONY INTERNETOWEJ”
* **Interakcja:** Przeciągnięcie kafelka `//PRZEKIEROWANIE` na makietę przycisku `[POBIERZ]` na stronie `dalekbieg.info`.
* **Rezultat:** Komunikat potwierdzający: „ZAINSTALOWANO WIRUSA” -> przycisk `[PRZEJDŹ DALEJ]`.

#### Krok 4: Wybór tożsamości nadawcy (Decyzja D3)
* **Nagłówek:** „WYSŁAĆ MAILA – WYŚLIJ MAILA DO SWOJEJ OFIARY. PODSZYJ SIĘ POD NAJBARDZIEJ WIARYGODNĄ OSOBĘ.”
* **Warianty:**
  * **Opcja A:** `JAKUB KWIATKOWSKI`  
    * *Ocena:* **ideal** (100 pkt)  
    * *Uzasadnienie:* Zaufany współpracownik z tego samego pokoju oraz partner z wieczornych biegów.
  * **Opcja B:** `PREZES BUCZEK`  
    * *Ocena:* **suboptimal** (50 pkt)  
    * *Uzasadnienie:* Wiadomość o tematyce sportowej od zarządu firmy wyda się ofierze wysoce podejrzana.
  * **Opcja C:** `TWÓJ SYNEK`  
    * *Ocena:* **critical** (0 pkt)  
    * *Uzasadnienie:* Małe dzieci nie wysyłają maili ze skrzynki korporacyjnej PetroLog.

#### Krok 5: Wybór adresu e-mail nadawcy (Decyzja D4)
* **Nagłówek:** „WYSŁAĆ MAILA – WYBIERZ ADRES EMAIL, Z KTÓREGO WYŚLESZ WIADOMOŚĆ.”
* **Warianty:**
  * **Opcja A:** `K.KWIATKOWSKI@PETROLOG.COM`  
    * *Ocena:* **ideal** (100 pkt)  
    * *Uzasadnienie:* Domena firmowa PetroLog – pełne uwiarygodnienie wewnętrznej korespondencji służbowej.
  * **Opcja B:** `K.KWIATKOWSKI@HACH.COM`  
    * *Ocena:* **suboptimal** (50 pkt)  
    * *Uzasadnienie:* Obca domena zewnętrzna, łatwa do wykrycia przy uważnej weryfikacji nagłówków.
  * **Opcja C:** `DARKSUN.JAKUB@GMAIL.COM`  
    * *Ocena:* **critical** (0 pkt)  
    * *Uzasadnienie:* Jawna nazwa grupy hakerskiej i publiczny provider (Gmail) skutkujący blokadą antyspamową.

* **Warunek ukończenia:** Wyświetlenie okna podsumowania kreacji: „ŚWIETNIE! WIADOMOŚĆ GOTOWA. WYŚLIJ MAILA I OBSERWUJ DZIAŁANIA OFIARY. PRZEJDŹ NA ŚRODKOWY EKRAN” -> przycisk `[WYŚLIJ MAILA I ZOBACZ, CO ROBI OFIARA]`.

---

### Scena S05: Egzekucja ataku i monitoring reakcji ofiary (`//MONITOR_OFIARY`)
* **Typ węzła:** Narracyjny / Prezentacja skutków (nieoceniany)
* **Komponent 2D:** Symulacja pulpitu ofiary (Webmail + Przeglądarka)
* **Przebieg:**
  1. **Klient poczty pocztowej Anity:**
     * Powiadomienie: „Otrzymałeś maila od: k.kwiatkowski@petrolog.com”.
     * Podgląd wiadomości:
       > **Od:** Jakub Kwiatkowski (`k.kwiatkowski@petrolog.com`)  
       > **Temat:** Zobacz to!  
       > **Treść:**  
       > Koniecznie musisz zobaczyć tę stronę:  
       > **dalekbieg.info**  
       > Mają super poradnik dla biegaczy długodystansowych!  
       > Coś, czego szukałaś!  
       > Jakub Kwiatkowski
  2. **Interakcja ofiary:**
     * Anita klika odnośnik w mailu.
     * Przeglądarka wyświetla witrynę `dalekbieg.info`.
     * Anita klika przycisk `[POBIERZ]` pod poradnikiem biegowym.
  3. **Infekcja i eksfiltracja:**
     * Komunikat w oknie gracza: „OFIARA POBRAŁA PLIK!”.
     * Wizualizacja przejęcia: „UDAŁO SIĘ! UZYSKANO DOSTĘP DO SIECI FIRMY PETROLOG” (schemat sieci wewnętrznej podświetla się na zielono).
* **Warunek ukończenia:** Kliknięcie przycisku `[PODSUMOWANIE ZADANIA]`.

---

## 5. Scena S06: Podsumowanie zadania i Debriefing Edukacyjny
* **Typ węzła:** Podsumowanie modułu SCORM / Debriefing
* **Komponent 2D:** Panel statystyk punktowych + Karuzela pigułek wiedzy

### Wyniki gracza (dla ścieżki wzorcowej 100%):
* **Status:** ZHAKOWANO PETROLOG – SUKCES (Zadanie 1 ukończone)
* **Zestawienie wyborów:**
  * Wybory idealne (`ideal`): **4 / 4**
  * Wybory częściowo poprawne (`suboptimal`): **0**
  * Błędy krytyczne (`critical`): **0**
* **Wynik procentowy:** 100%
* **Trofeum:** Złoty puchar za perfekcyjne wykonanie
* **Nagroda finansowa:** +2,52 BTC (stan końcowy portfela: 2,52 BTC)

### Tabela decyzji debriefingu:

| Decyzja | Wybór optymalny | Wybór gracza | Ocena |
| :--- | :--- | :--- | :--- |
| **Wybór strony WWW** | `DALEKBIEG.INFO` | `DALEKBIEG.INFO` | Idealny |
| **Wybór pliku do pobrania** | `PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH...` | `PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH...` | Idealny |
| **Wybór nadawcy wiadomości** | `JAKUB KWIATKOWSKI` | `JAKUB KWIATKOWSKI` | Idealny |
| **Wybór adresu e-mail nadawcy** | `K.KWIATKOWSKI@PETROLOG.COM` | `K.KWIATKOWSKI@PETROLOG.COM` | Idealny |

---

### Pigułki wiedzy „CO POWINIENEŚ ZAPAMIĘTAĆ?” (Narracja: Dawid Mortka)

1. **OSINT – Biały wywiad w mediach społecznościowych:**
   Cyberprzestępcy nie potrzebują łamać skomplikowanych zabezpieczeń, gdy sami publikujemy kluczowe informacje. Posty z biura, relacje z urlopu czy zapytania o hobby pozwalają stworzyć dokładny profil psychologiczny pracownika. Ogranicz widoczność swoich postów w mediach społecznościowych wyłącznie do zaufanego kręgu znajomych.

2. **Spear-phishing – Atak spersonalizowany:**
   W przeciwieństwie do masowego spamu, spear-phishing jest precyzyjnie wymierzony w konkretną osobę. Wykorzystuje autentyczne relacje biurowe, imiona kolegów z zespołu oraz aktualne zainteresowania ofiary, aby uśpić jej czujność i nakłonić do wykonania niebezpiecznej akcji.

3. **Weryfikacja nadawcy i spoofing domeny:**
   Atakujący potrafią podrobić nagłówek wiadomości lub zarejestrować domenę łudząco podobną do firmowej (typosquatting). Jeśli otrzymujesz nieoczekiwany link lub załącznik od współpracownika – zweryfikuj to z nim innym kanałem (np. zadzwoń lub zapytaj osobiście przy biurku).

4. **Higiena cyfrowa i bezpieczne odnośniki:**
   Przed kliknięciem w link zawsze najedź kursorem myszy i sprawdź rzeczywisty adres docelowy w lewym dolnym rogu przeglądarki. Stosuj menedżer haseł, regularnie aktualizuj system oraz bezwzględnie włącz uwierzytelnianie dwuskładnikowe (2FA) na wszystkich kontach firmowych i prywatnych.