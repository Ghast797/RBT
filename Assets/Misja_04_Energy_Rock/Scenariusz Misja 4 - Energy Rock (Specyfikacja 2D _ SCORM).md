# **Misja 4: Energy Rock – Specyfikacja Scenariusza (2D / SCORM)**

# **1\. Metadane misji**

* **ID:** `mission-4-energy-rock`  
* **Tytuł:** Misja 4 – Energy Rock  
* **Podtytuł:** Atak ransomware i eksfiltracja technologii Freevolt  
* **Cel ataku:** Energy Rock (przedsiębiorstwo magazynowania i zarządzania zapasami paliwowymi)  
* **Ocenianych decyzji:** 10 (`D1`–`D10`)  
* **Próg zaliczenia (`passingScore`):** 80% (lub 8/10 poprawnych decyzji)  
* **Nagroda:** 3,79 BTC (stan początkowy portfela: 9,52 BTC; po ukończeniu: 13,31 BTC; certyfikat ukończenia: 5/9)  
* **Kolor przewodni:** Czerwony (\#FF0033) oraz Fioletowy C2 (\#8A2BE2)  
* **Data fabularna w systemie:** 19.05.2026  
* **Środowisko:** `//HACKERS.OS`

---

# **2\. Spis aplikacji i kolejność odblokowań (`//HACKERS.OS`)**

| ID kafelka | Etykieta | Kolejność | Warunek odblokowania |
| :---- | :---- | :---- | :---- |
| `app_chat_bm` | `//KOMUNIKATOR: BYTE_MASTER` | 1 | Dostępny od startu (połączenie przychodzące w Darknecie) |
| `app_virus_db` | `//BAZA_WIRUSÓW` | 2 | Zakończenie dialogu INTRO i uruchomienie systemu HACKERS.OS |
| `item_virus_payload` | `//WIRUS: RANSOMWARE` | 3 | Złożenie i zatwierdzenie wirusa w kreatorze (po scenie S04) |
| `app_mail` | `//MAIL` | 4 | Zakończenie rozmowy ze wskazówkami od mentora (Mostek S04-\>S05) |
| `app_vpn` | `//VPN` | 5 | Uzbrojenie załącznika CV\_WILK.PDF złośliwym oprogramowaniem |
| `app_ransomware_c2` | `//MODUŁ_RANSOMWARE` | 6 | Wysłanie maila phishingowego i odebranie alertu o otwarciu |
| `app_victim_chat` | `//CZAT_Z_OFIARĄ` | 7 | Zakończenie szyfrowania sieci i pobranie plików docelowych |

---

# **3\. Kanoniczna lista ocenianych decyzji (`D1`–`D10`)**

| ID | Scena | Nazwa decyzji / Minigra | Wybór podjęty przez gracza (Idealny) | Wszystkie warianty dostępne na ekranie |
| :---- | :---- | :---- | :---- | :---- |
| **D1** | S01 | Wybór złośliwego oprogramowania | `RANSOMWARE` (blokada dysków i wymuszenie okupu) | RANSOMWARE (ideal) / RAT (suboptimal) / KEYLOGGER (critical) |
| **D2** | S03 | Konfiguracja generatora klucza / hasła | Długość 24 \+ 4 dozwolone zbiory znaków (Siła: 5/5) | Siła 5/5 (ideal) / Siła 3-4/5 (suboptimal) / Długość 8 lub spacje/znaki PL (critical) |
| **D3** | S04 | Komponenty komunikatu okupowego | Ostrzeżenie \+ limit 30 godzin \+ 4 elementy bazowe | Tytuł oficjalny \+ 30h (ideal) / Tytuł żartobliwy \+ 30h (suboptimal) / Czas 30s (critical) |
| **D4** | S04 | Kolorystyka okna wymuszenia | `CZERWONY` | Czerwony (ideal) / Biały/Szary (suboptimal) / Zielony (suboptimal/critical) |
| **D5** | S05 | Temat wiadomości phishingowej | `CV MICHAŁ WILK` | CV MICHAŁ WILK (ideal) / WILK CV (suboptimal) / ANALITYK MICHAŁ WILK (critical) |
| **D6** | S05 | Treść wiadomości phishingowej | Formalny list na analityka rynków \+ hasło: WILK | Treść z hasłem i formalna (ideal) / Luźna bez hasła (suboptimal) / Błędna nazwa stanowiska (critical) |
| **D7** | S05 | Anonimizacja i nadawca (VPN \+ E-mail) | Synchronizacja IP 109.43.200.124 \+ nadawca M.WILK@PRIV.COM | M.WILK@PRIV.COM (ideal) / ALEX@PRIV.COM (suboptimal) / NEWRAWGOODS@COMMERCIAL.BIZ (critical) |
| **D8** | S06 | Eksfiltracja plików projektu Freevolt | Dokładnie 3 pliki: DOCX, PDF, XCF powiązane z Freevolt | 3 pliki Freevolt (ideal) / Częściowe pobranie lub śmieci (suboptimal) / Błędne pliki (critical) |
| **D9** | S07 | Negocjacje z Szefem IT – odpowiedź na zgłoszenie służb | Odpowiednie służby nie odszyfrują waszych plików... | Merytoryczna presja (ideal) / Dziecinne pyskówki (suboptimal) / Kapitulacja (critical) |
| **D10** | S07 | Negocjacje z Szefem IT – motywacja i żądanie | Żądanie wyłącznie Bitcoinów (ochrona kamuflażu) | Tylko Bitcoiny (ideal) / Robię to dla zabawy (suboptimal) / Zdradzenie celu Freevolt (critical) |

---

# **4\. Szczegółowy przebieg scen, dialogów i minigier**

## **Blok dialogowy: INTRO (Darknet \-\> Zlecenie 4\)**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree`  
* **Kontekst:** Gracz wybiera w menu Darknetu „ZADANIE 4: Energy Rock – Musisz zaszyfrować serwery za pomocą ransomware (Nagroda: 3,79 BTC)" i odbiera połączenie od mentora BYTE\_MASTER.

**Zapis dialogu:**

* **BM:** „MAMY PROBLEM"  
* **GRACZ:** „CO SIĘ STAŁO?" *(jedyna opcja)*  
* **BM:** „BRAKUJE KILKU WAŻNYCH PLIKÓW NA TEMAT FREEVOLT. MUSIMY JE ZNALEŹĆ. Z DANYCH WYKRADZIONYCH Z PETROLOG WYNIKA, ŻE MOGĄ ZNAJDOWAĆ SIĘ W RĘKACH ENERGY ROCK \- JEDNEJ Z NAJWIĘKSZYCH FIRM ZAJMUJĄCYCH SIĘ MAGAZYNOWANIEM I ZARZĄDZANIEM ZAPASAMI PALIWOWYMI"  
* **GRACZ:** „CO DOKŁADNIE MAM ZROBIĆ?" *(jedyna opcja)*  
* **BM:** „MAJĄ CAŁKIEM DOBRE ZABEZPIECZENIA, WIĘC MUSIMY WYMYŚLIĆ JAKIŚ WIARYGODNY SPOSÓB NA WEJŚCIE. MYŚLĘ, ŻE NAJLEPIEJ ZNOWU POBAWIĆ SIĘ SOCJOTECHNIKAMI I WYKORZYSTAĆ BŁĄD LUDZKI. POZA TYM W SIECI KRĄŻĄ TEŻ PLOTKI O TYM, ŻE KTOŚ WYKRADŁ PLIKI TECHNOLOGII FREEVOLT, WIĘC POTRZEBUJEMY NAPRAWDĘ DOBREJ PRZYKRYWKI"  
* **GRACZ:** „Z TECHNICZNEGO PUNKTU WIDZENIA MOŻEMY WYKORZYSTAĆ RANSOMWARE. NIE DOŚĆ, ŻE UZYSKAMY DOSTĘP DO DANYCH, TO JESZCZE ZASZYFRUJEMY JE I UNIEMOŻLIWIMY IM PRACĘ" *(jedyna opcja)*  
* **BM:** „WIDZĘ, ŻE PROWADZĄ REKRUTACJĘ NA KILKA STANOWISK. MÓGŁBYŚ PODESŁAĆ IM ZAINFEKOWANE CV"  
* **GRACZ:** „A CO Z PRZYKRYWKĄ? MOŻE WYŁUDZENIE OKUPU? ZASZANTAŻUJEMY ICH, ŻE UPUBLICZNIMY HANIEBNE ZANIEDBANIA PROCEDUR BEZPIECZEŃSTWA W IRH FIRMIE I TAKIE TAM" *(jedyna opcja)*  
* **BM:** „BĘDĄ Z CIEBIE LUDZIE"  
* **GRACZ:** „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA" *(jedyna opcja)*

**Kryterium ukończenia:** Kliknięcie przycisku `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS`. Uruchamia się sekwencja ładowania systemu BIOS i odblokowuje pulpit z aplikacją `//BAZA_WIRUSÓW`.

---

## **Scena S01: Wybór złośliwego oprogramowania (`//BAZA_WIRUSÓW`)**

* **Oceniane:** Decyzja **D1**  
* **Klocek 2D:** `ChoiceCards`  
* **Wygląd ekranu:** Nagłówek „BAZA WIRUSÓW \- WYBIERZ ODPOWIEDNIEGO WIRUSA:", pod spodem 3 duże kafelki z grafikami i opisami.  
* **Interakcja:** Wskazanie i zatwierdzenie wybranego typu malware'u.

**Dostępne opcje na ekranie:**

1. `RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ` \| **ideal** \| Wybór gracza na filmie. Blokuje infrastrukturę firmy, paraliżuje operacje i stwarza idealną przykrywkę finansową pod szantaż.  
2. `RAT: REMOTE ACCESS TROJAN – POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY` \| **suboptimal** \| Pozwala na cichą infiltrację pulpitu, lecz nie paraliżuje całej organizacji i nie wywiera natychmiastowej presji na zarząd.  
3. `KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE` \| **critical** \| Zbiera wpisywane znaki, lecz nie daje natychmiastowego dostępu do serwerów ani nie uniemożliwia pracy firmie.

---

## **Scena S02: Odkrywanie struktury wirusa (Matryca skanująca)**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `Canvas` (efekt odsłaniania / zdrapka kursorem)  
* **Wygląd ekranu:** Nagłówek „WYSZUKAJ CZĘŚCI WIRUSA:", centralny niebieski znak zapytania `?`, a na dole fioletowy segmentowy pasek postępu.  
* **Interakcja gracza:** Przesuwanie kursora/lasera po czarnej powierzchni w celu odsłonięcia ikony wektorowej monitora skutego łańcuchami z kłódką.  
* **Wartość i kryterium:** Wypełnienie paska postępu do 100%. Dopiero pełne odsłonięcie grafiki odblokowuje przejście do konfiguracji klucza.

---

## **Scena S03: Konfiguracja generatora hasła i klucza szyfrującego**

* **Oceniane:** Decyzja **D2**  
* **Klocek 2D:** `Configurator` (suwak numeryczny \+ zasobnik wielokrotnego wyboru)

**Kwestia dialogowa gracza przed akcją:**

* **GRACZ:** „STWORZĘ TAKIE HASŁO, ŻE NIE MA SZANS, ŻEBY ICH SPECJALIŚCI ZŁAMALI JE PRZEZ NAJBLIŻSZE TYGODNIE. WYKORZYSTAM GENERATOR W MOIM MENEDŻERZE HASEŁ"

**Wygląd i mechanika minigry:**

* Ekran „USTAW ZŁOŻONOŚĆ HASŁA:".  
* Suwak „DŁUGOŚĆ HASŁA" (zakres od 8 do 24, wartość domyślna: 8). Gracz może ustawić dowolną długość pomiędzy 8 a 24\.  
* Ramka docelowa „CECHY HASŁA:" przyjmująca kafelki reguł.  
* Pole dynamicznego podglądu „HASŁO:" wyświetlające przykładowo wygenerowany ciąg.  
* Boczny zasobnik zawiera 6 kafelków reguł:  
  1. `DUŻE LITERY A-Z` (dozwolony)  
  2. `MAŁE LITERY A-Z` (dozwolony)  
  3. `CYFRY 0-9` (dozwolony)  
  4. `ZNAKI SPECJALNE !@#$%^&*()_+` (dozwolony)  
  5. `BIAŁE ZNAKI NP. SPACJA` (pułapka / niedozwolony w kluczach technicznych)  
  6. `ZNAKI NARODOWE ĘĆŹĄŚ` (pułapka / ryzyko błędów kodowania znaków)  
* **Akcje wykonane przez gracza na nagraniu:**  
  * Przesunięcie suwaka z wartości 8 na maksymalną wartość: **24**.  
  * Przeciągnięcie do ramki 4 poprawnych reguł: DUŻE LITERY, MAŁE LITERY, CYFRY, ZNAKI SPECJALNE.  
  * Ominięcie kafelków: BIAŁE ZNAKI oraz ZNAKI NARODOWE.  
  * Wygenerowanie hasła (wynik: `B4$EL@5Ue/m0V]BhE/[0[E4`) i kliknięcie „ZAPISZ W BAZIE I KONTYNUUJ".  
* **Wynik na ekranie:** `SIŁA HASŁA: 5/5` – „UŻYTO MAKSYMALNEJ ILOŚCI ZNAKÓW ORAZ ZNAKÓW SPECJALNYCH, JEDNOCZEŚNIE UNIKAJĄC TYCH NIEDOZWOLONYCH. STWORZONO NAPRAWDĘ BARDZO SILNE HASŁO".

**Potencjalne możliwości i ocena Decyzji D2:**

* **Wariant idealny (wybór gracza):** Długość 24 \+ 4 dozwolone zestawy znaków, 0 znaków niedozwolonych \| **ideal** (Siła 5/5).  
* **Warianty suboptymalne:** Długość w przedziale 12–18 znaków lub pominięcie cyfr/znaków specjalnych przy braku znaków niedozwolonych \| **suboptimal** (Siła 3/5 lub 4/5 – podatność na atak słownikowy/brute force).  
* **Warianty krytyczne:** Pozostawienie długości 8 znaków LUB dodanie kafelka „BIAŁE ZNAKI NP. SPACJA" bądź „ZNAKI NARODOWE ĘĆŹĄŚ" \| **critical** (Zbyt słaby klucz lub błąd składniowy/parsera uniemożliwiający dekrypcję).

**Kwestia dialogowa mentora po akcji:**

* **BM:** „GDYBY LUDZIE W RZECZYWISTOŚCI TWORZYLI TAK SILNE HASŁA, TO O WIELE RZADZIEJ SŁYSZAŁOBY SIĘ O KRADZIEŻY DANYCH"

---

## **Scena S04: Projektowanie komunikatu dla ofiary (Ransomware Note)**

* **Oceniane:** Decyzja **D3** (komponenty okna) oraz Decyzja **D4** (kolorystyka)  
* **Klocek 2D:** Krok 1: `Drag-and-drop` / `PoolSelect`; Krok 2: `ChoiceCards`

**Wygląd i mechanika minigry:**

* **Krok 1 (Układ okna):** Nagłówek „KROK 1: PRZECIĄGNIJ INFORMACJE I KOMPONENTY NA GŁÓWNYM EKRANIE". Na makiecie okna znajduje się 6 slotów: `[IKONA]`, `[TYTUŁ WIADOMOŚCI]`, `[CZAS]`, `[KWOTA]`, `[ADRES]`, `[KONTAKT]`.  
  * W zasobniku dostępne są kafelki:  
    * Ikona: Kłódka na niebieskim tle (stały element)  
    * Kwota: `KWOTA: $ 200 000` z symbolem Bitcoina (stały element)  
    * Adres: `ADRES: XKAJ1023KJDf93` (stały element)  
    * Kontakt: `Avatar + NAPISZ DO NAS` (stały element)  
    * Tytuł wiadomości – 2 warianty: `TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!` vs `CZEKAM NA BITCOINY!`  
    * Czas – 2 warianty: `POZOSTAŁY CZAS: 00:30:00:00` (30 godzin) vs `POZOSTAŁY CZAS: 00:00:30:00` (30 sekund)  
  * **Wybór gracza na filmie (D3):**  
    * Tytuł: `TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!`  
    * Czas: `POZOSTAŁY CZAS: 00:30:00:00` (30 godzin)  
* **Krok 2 (Kolor okna):** Nagłówek „KROK 2: WYBIERZ KOLOR OKNA I ELEMENTÓW". Trzy kwadraty barwne:  
  * `Zielony`  
  * `Czerwony` (wybór gracza na filmie – D4)  
  * `Biały / Szary`  
* **Podsumowanie etapu:** Wyświetla się komunikat „WIRUS GOTOWY\! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY". Na pulpicie systemu odblokowuje się obiekt `//WIRUS: RANSOMWARE`.

**Ocena decyzji D3 i D4:**

* **D3 (Komponenty wiadomości):**  
  * Tytuł `TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!` \+ Czas `00:30:00:00` \| **ideal** \| Formalny, alarmujący ton i realny limit czasu (30 godzin na zebranie okupu).  
  * Tytuł `CZEKAM NA BITCOINY!` \+ Czas `00:30:00:00` \| **suboptimal** \| Niepoważny nagłówek obniżający autorytet i wiarygodność żądania.  
  * Jakakolwiek konfiguracja z czasem `00:00:30:00` (30 sekund) \| **critical** \| Czas 30 sekund uniemożliwia ofierze podjęcie negocjacji i zakup kryptowalut.  
* **D4 (Kolor okna):**  
  * `Czerwony` \| **ideal** \| Uniwersalny kolor alarmowy wywołujący silny stan zagrożenia i presję.  
  * `Biały / Szary` \| **suboptimal** \| Neutralna barwa przypominająca standardowy błąd systemowy.  
  * `Zielony` \| **suboptimal / critical** \| Kolor zielony podświadomie kojarzy się ze statusem bezpiecznym i poprawnym.

---

## **Blok dialogowy: MOSTEK `<S04→S05>`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree`

**Zapis dialogu:**

* **BM:** „ZNALEZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA"  
* **GRACZ:** „MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU MAILA Z CV?" *(jedyna opcja)*  
* **BM:** „TEMAT MAILA POWINIEN ZAWIERAĆ ODPOWIEDNIO NAZWISKO ORAZ IMIĘ Z DOPISKIEM CV"

**Kryterium ukończenia:** Kliknięcie odblokowanej na pulpicie aplikacji `//MAIL`.

---

## **Scena S05: Spear-phishing, uzbrojenie załącznika, konfiguracja VPN i nadawcy**

* **Oceniane:** Decyzja **D5** (Temat), Decyzja **D6** (Treść), Flavor (Uzbrojenie), Decyzja **D7** (VPN i Nadawca)  
* **Klocek 2D:** `PoolSelect` (temat/treść), `Drag-and-drop` (uzbrojenie PDF), `Configurator` (oktety IP VPN), `ChoiceCards` (nadawca)

**Wygląd i mechanika minigry:**

1. **Wybór tematu maila (D5):** Okno z polem `TEMAT:` i 3 kafelki w zasobniku:  
   * `CV MICHAŁ WILK` (wybór gracza) \| **ideal** \| Ściśle spełnia wytyczne rekrutacyjne (dopisek CV \+ nazwisko i imię).  
   * `WILK CV` \| **suboptimal** \| Brak imienia, nieprofesjonalny styl.  
   * `ANALITYK MICHAŁ WILK` \| **critical** \| Brak słowa kluczowego „CV" powoduje pominięcie przez filtry HR.  
2. **Wybór treści maila (D6):** Okno z polem `TREŚĆ:` i 3 warianty wiadomości:  
   * `DZIEŃ DOBRY, PRZESYŁAM CV W ZWIĄZKU Z REKRUTACJĄ NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH. HASŁO DO PLIKU: WILK. POZDRAWIAM, MICHAŁ WILK` (wybór gracza) \| **ideal** \| Profesjonalny ton, właściwe stanowisko i podanie hasła do pliku (omijanie piaskownic i skanerów antywirusowych).  
   * `HEJ, W ZAŁĄCZNIKU PRZESYŁAM CV. POZDRAWIAM, MICHAŁ WILK` \| **suboptimal** \| Zbyt nieformalny zwrot, brak nazwy stanowiska i hasła.  
   * `CZEŚĆ, PRZESYŁAM CV NA STANOWISKO ANALITYK USŁUG ENERGETYCZNYCH. POZDRAWIAM, MICHAŁ WILK` \| **critical** \| Błędna nazwa stanowiska („usług" zamiast „rynków") i brak hasła.  
3. **Uzbrojenie załącznika (Flavor):** W oknie maila pojawia się plik `CV_WILK.PDF`. Gracz przeciąga na niego kafelek `//WIRUS: RANSOMWARE`. Plik zostaje zainfekowany i pojawia się przycisk `WŁĄCZ VPN`.  
4. **Konfiguracja VPN (część D7):**  
   * Wyświetlają się wartości: `POŻĄDANY ADRES IP: 109.43.200.124` oraz `AKTUALNY ADRES IP: 106.55.202.120`.  
   * Możliwe akcje: ręczna rotacja kołem oktetów lub kliknięcie przycisku `DOPASUJ W AI`.  
   * Gracz klika `DOPASUJ W AI` \-\> system wyświetla komunikat `POMYŚLNIE DOPASOWANO IP`.  
5. **Wybór adresu nadawcy (część D7):** Ekran „WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:":  
   * `M.WILK@PRIV.COM` (wybór gracza) \| **ideal** \| Pełna spójność z podpisem Michał Wilk.  
   * `ALEX@PRIV.COM` \| **suboptimal** \| Rozbieżność imienia (Alex vs Michał Wilk) wzbudza podejrzenia.  
   * `NEWRAWGOODS@COMMERCIAL.BIZ` \| **critical** \| Domena komercyjna B2B całkowicie niezwiązana z kandydatem.  
* **Kryterium ukończenia:** Kliknięcie `WYŚLIJ MAILA`.

---

## **Blok dialogowy: MOSTEK `<S05→S06>`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree`

**Zapis dialogu:**

* **GRACZ:** „WSZYSTKO ZROBIONE. CZEKAMY AŻ OTWORZĄ CV I AKTYWUJĄ RANSOMWARE. JAK NIE PRZYJMIECIE MNIE DO DARKSUN, TO MOŻE DOSTANĘ PRACĘ W ENERGY ROCK" *(jedyna opcja)*  
* **BM:** „KTO WIE?"

**Kryterium ukończenia:** Na ekranie pojawia się zielony baner: `MALWARE ZOSTAŁ AKTYWOWANY`.

---

## **Scena S06: Szyfrowanie sieci i kradzież dokumentacji Freevolt**

* **Oceniane:** Flavor (Krok 1 – graf sieci) oraz Decyzja **D8** (Krok 2 – eksfiltracja)  
* **Klocek 2D:** Krok 1: Interaktywny graf sieciowy (`SVG`); Krok 2: `PoolSelect` / `Drag-and-drop`

**Wygląd i mechanika minigry:**

* **Krok 1 (Szyfrowanie sieci):**  
  * Ekran startowy: `CV ZOSTAŁO OTWARTE – MALWARE ZOSTAŁ AKTYWOWANY`, `NAZWA KOMPUTERA: ENERGY_ROCK_01_PC`, `AKTYWOWANE NA IP: 151.89.159.52`. Przycisk `SZYFRUJ ZASOBY FIRMY`.  
  * Gracz przechodzi do topologii sieci: centralny pendrive/wektor, 2 stacje robocze, 4 serwery bazodanowe i 1 serwer główny.  
  * Interakcja: Gracz klika zielone węzły. Węzły po kolei zmieniają barwę na fioletową i blokują się kłódką.  
  * Po zaszyfrowaniu wszystkich węzłów pojawia się komunikat: `ZASOBY FIRMY ENERGY ROCK ZOSTAŁY POMYŚLNIE ZASZYFROWANE. UZYSKANO DOSTĘP DO SERWERÓW` oraz przycisk `POBIERZ PLIKI`.  
* **Krok 2 (Eksfiltracja plików – D8):**  
  * Ekran: Puste pole docelowe `POBRANE PLIKI:` oraz chmura 12 dokumentów z serwera:  
    1. `WYPOWIEDZENIE.PDF`  
    2. `MAREK.JPG`  
    3. `FVOLT_TECH.DOCX` *(cel)*  
    4. `KONTRAKTY.XCF`  
    5. `TECHNOLOGIA_OPIS.PDF`  
    6. `FREEVOLT_SCHEMAT.PDF` *(cel)*  
    7. `TECHNOLOGIA_SCHEMATY.PDF`  
    8. `MATERIALY.TXT`  
    9. `WAZNE_DANE.DOCX`  
    10. `SEKRET.TXT`  
    11. `UMOWA02022.PDF`  
    12. `ENERGIA_FVOLT.XCF` *(cel)*  
  * **Wybór gracza na filmie:** Przeciągnięcie dokładnie 3 plików zawierających technologię Freevolt: `FVOLT_TECH.DOCX`, `FREEVOLT_SCHEMAT.PDF` oraz `ENERGIA_FVOLT.XCF`.  
* **Kwestia dialogowa gracza po pobraniu:**  
  * **GRACZ:** „AKTYWOWALI RANSOMWARE I STRACILI DOSTĘP DO PLIKÓW. TERAZ CZEKAMY AŻ SIĘ ZE MNĄ SKONTAKTUJĄ"  
  * **BM:** „PAMIĘTAJ TYLKO, ŻE POTRZEBUJEMY I PLIKÓW, I OKUPU"

**Ocena Decyzji D8:**

* Pobranie dokładnie 3 plików: `FVOLT_TECH.DOCX`, `FREEVOLT_SCHEMAT.PDF`, `ENERGIA_FVOLT.XCF` \| **ideal** \| Pozyskano kompletną dokumentację technologiczną Freevolt bez wzbudzania podejrzeń transferem zbędnych plików.  
* Pobranie plików Freevolt razem z plikami-zmyłkami (np. `TECHNOLOGIA_OPIS.PDF`) LUB pobranie tylko 1–2 plików właściwych \| **suboptimal** \| Niekompletny zestaw danych lub zbyt duży transfer ułatwiający analizę powłamaniową.  
* Pobranie wyłącznie fałszywych plików (np. `WYPOWIEDZENIE.PDF`, `MAREK.JPG`) \| **critical** \| Całkowita porażka głównego celu wywiadowczego operacji.

**Kryterium ukończenia:** Wyświetlenie komunikatu `OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT` i kliknięcie przycisku `URUCHOM CZAT Z OFIARĄ`.

---

## **Scena S07: Negocjacje z Szefem IT (`//CZAT_Z_OFIARĄ`)**

* **Oceniane:** Decyzja **D9** (Wymiana 1), Decyzja **D10** (Wymiana 2), Flavor (Wymiana 3\)  
* **Klocek 2D:** `DialogueTree`  
* **Wygląd ekranu:** Komunikator z kontaktem „SZEF IT ENERGY ROCK" oraz podglądem czerwonego okna żądania okupu na kwotę 200 000 USD w BTC.

**Zapis negocjacji i podjęte decyzje:**

**Wymiana 1 (Decyzja D9):**

* **SZEF IT:** „ROZWIĄZUJEMY PROBLEM RANSOMWARE I ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE"  
* **Warianty gracza:**  
  * `ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ` (wybór gracza) \| **ideal** \| Wskazanie na matematyczną nieodwracalność silnego szyfrowania łamie wiarę ofiary w pomoc z zewnątrz.  
  * `NIE BOJĘ SIĘ POLICJI` \| **suboptimal** \| Emocjonalna reakcja pozbawiona technicznego argumentu o bezradności służb wobec silnego klucza.  
  * `OKEJ, JUŻ WAM NIE PRZESZKADZAM.` \| **critical** \| Natychmiastowa kapitulacja pod wpływem blefu ofiary.

**Wymiana 2 (Decyzja D10):**

* **SZEF IT:** „CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?"  
* **Warianty gracza:**  
  * `TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY` (wybór gracza) \| **ideal** \| Konsekwentne utrzymanie przykrywki ataku czysto finansowego, ukrywające kradzież plików Freevolt.  
  * `NICZEGO NIE ODSZYFRUJĘ, ROBIĘ TO DLA ZABAWY :D` \| **suboptimal** \| Niszczy szansę na okup i podważa wiarygodność grupy jako profesjonalnych szantażystów.  
  * `CHCĘ DOSTĘPU DO PLIKÓW FREEVOLT` \| **critical** \| Błąd dekonspiracyjny – zdradza szpiegowski charakter ataku i prawdziwy cel napastników.

**Wymiana 3 (Flavor – postawienie ultimatum):**

* **SZEF IT:** „POTRZEBUJEMY CZASU NA ICH ZDOBYCIE"  
* **GRACZ:** „MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA DO ODSZYFROWANIA" *(jedyna opcja)*

---

## **Blok dialogowy: MOSTEK `<S07→S08>` (Meldunek końcowy u mentora)**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree`

**Zapis dialogu:**

* **GRACZ:** „MAM TWOJE PLIKI, UDAŁO SIĘ BEZ WIĘKSZYCH PROBLEMÓW" *(jedyna opcja)*  
* **BM:** „TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO"  
* **GRACZ:** „CZY TO ZNACZY, ŻE W KOŃCU PRZYJMIECIE MNIE DO DARKSUN?" *(jedyna opcja)*  
* **BM:** „NIE TAK SZYBKO, MAM DLA CIEBIE JESZCZE WISIENKĘ NA TORCIE. KILKA WISIENEK. PRZYGOTUJ SIĘ"

**Kryterium ukończenia:** Kliknięcie przycisku `PODSUMOWANIE ZADANIA`.

---

# **5\. Podsumowanie zadania i Debriefing Edukacyjny**

## **Ekran wyników z nagrania wideo:**

* **Nagłówek sukcesu:** `ZHAKOWANO ENERGY ROCK – SUKCES – UKOŃCZONO ZADANIE 4`  
* **Wynik procentowy:** `100% MAKSYMALNEGO WYNIKU`  
* **Zestawienie wyborów:**  
  * 9/9 lub 10/10 Idealnych wyborów (w podsumowaniu HUD: 9 kafelków bazowych)  
  * 0 Dobrych, ale nieidealnych wyborów  
  * 0 Błędów krytycznych  
* **Odznaka:** Puchar za 100%  
* **Otrzymane Bitcoiny:** `+3,79 BTC` (wzrost stanu portfela z 9,52 BTC do 13,31 BTC)  
* **Postęp certyfikatu:** `5/9`

---

## **Kanoniczna tabela debriefingu w grze:**

| ID wyboru | Etykieta pytania w debriefingu | Wybór gracza | Ocena |
| :---- | :---- | :---- | :---- |
| **Wybór 1** | WYBIERZ ODPOWIEDNIEGO WIRUSA | `RANSOMWARE` | `ideal` |
| **Wybór 2** | SIŁA WYGENEROWANEGO HASŁA (SKALA DO 5\) | `5` (Maksymalna złożoność, długość 24\) | `ideal` |
| **Wybór 3** | KOMPONENTY WIADOMOŚCI | `Ostrzeżenie + limit 30h` | `ideal` |
| **Wybór 4** | WYBIERZ KOLOR OKNA / ELEMENTÓW | `CZERWONY` | `ideal` |
| **Wybór 5** | WYBIERZ TEMAT MAILA | `CV MICHAŁ WILK` | `ideal` |
| **Wybór 6** | WYBIERZ TREŚĆ MAILA | `Treść z hasłem WILK na stanowisko Analityka...` | `ideal` |
| **Wybór 7** | ZABEZPIECZENIE TOŻSAMOŚCI (VPN / NADAWCA) | `109.43.200.124` \+ `M.WILK@PRIV.COM` | `ideal` |
| **Wybór 8** | EKSFILTRACJA PLIKÓW | `3 pliki Freevolt (DOCX, PDF, XCF)` | `ideal` |
| **Wybór 9** | CZY UDAŁO SIĘ WYŁUDZIĆ OKUP? | `TAK` | `ideal` |

---

## **Karuzela edukacyjna „CO POWINIENEŚ ZAPAMIĘTAĆ?":**

1. **Slajd 1: RANSOMWARE**  
   * *Treść:* „MALWARE, KTÓRY SZYFRUJE I ŻĄDA OKUPU JEST OGROMNYM ZAGROŻENIEM DLA KAŻDEJ INSTYTUCJI. UPEWNIJ SIĘ, ŻE TWOJE DANE I PRACA SĄ ODPOWIEDNIO ZABEZPIECZONE PRZEZ SYSTEMATYCZNIE ROBIONE BACKUPY, DBAJ RÓWNIEŻ O AKTUALIZACJĘ SYSTEMU."  
2. **Slajd 2: BACKUPY DANYCH**  
   * *Treść:* „SKUTECZNY BACKUP TO TAKI, KTÓRY MOŻNA ODTWORZYĆ. STOSUJ POLITYKĘ DWÓCH KOPII LOKALNYCH I JEDNEJ KOPII ZDALNEJ. CO JAKIŚ CZAS SPRAWDŹ, CZY BACKUP MOŻNA PRZYWRÓCIĆ."  
3. **Slajd 3: SILNE HASŁA**  
   * *Treść:* „DO GENEROWANIA UŻYWAJ MENEDŻERA HASEŁ, KTÓRY STWORZY ZA CIEBIE ODPOWIEDNIO SILNE HASŁO. MENEDŻER BĘDZIE TAKŻE PRZETRZYMYWAŁ WSZYSTKIE TWOJE HASŁA W BEZPIECZNEJ BAZIE DANYCH."  
4. **Slajd 4: PODSUMOWUJĄC – NA CO NALEŻY UWAŻAĆ:**  
   * RÓB REGULARNIE BACKUPY SWOICH DANYCH  
   * SPRAWDZAJ, CZY BACKUP MOŻNA PRZYWRÓCIĆ  
   * UŻYWAJ MENEDŻERÓW HASEŁ  
5. **Slajd 5: CHCESZ UNIKNĄĆ HAKOWANIA?**  
   * *Treść:* „WSZYSTKIE WSKAZÓWKI NA TEMAT CYBERBEZPIECZEŃSTWA ZNAJDZIESZ W PANELU BAZA WIEDZY ZNAJDUJE SIĘ ON W GŁÓWNYM MENU HAKERA \- DARKNECIE."

