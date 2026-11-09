# **`Misja 3: O&L Company – Specyfikacja Scenariusza (2D / SCORM)`**

# **`1. Metadane misji`**

* **ID:** `mission-3-ol-company`  
* **Tytuł:** Misja 3 – O\&L Company  
* **Podtytuł:** Socjotechnika, trojan RAT i fizyczny atak drop USB z wykorzystaniem drona  
* **Cel ataku:** O\&L Company (międzynarodowy dystrybutor paliw zaopatrujący największe korporacje)  
* **Ocenianych decyzji:** 6 (`D1`–`D6`)  
* **Próg zaliczenia (`passingScore`):** 80% (lub 100% dla odznaki mistrzowskiej)  
* **Nagroda:** 4,02 BTC (stan początkowy portfela: 5,50 BTC; po ukończeniu: 9,52 BTC; postęp certyfikatu: 4/10)  
* **Kolor przewodni:** `#00FF66` (Cyberzieleń / Matrix Green)  
* **Data fabularna:** 19.05.2026  
* **Środowisko:** `//HACKERS.OS`

---

# **`2. Spis aplikacji i kolejność odblokowań (//HACKERS.OS)`**

| `ID kafelka` | `Etykieta` | `Kolejność` | `Warunek odblokowania` |
| :---- | :---- | :---- | :---- |
| `app_chat_bm` | `//CHAT: BYTE_MASTER` | 1 | Dostępny od początku (rozpoczęcie zadania w Darknecie) |
| `app_virus_db` | `//BAZA_WIRUSÓW` | 2 | Zakończenie dialogu INTRO i uruchomienie systemu HACKERS.OS |
| `item_virus_payload` | `//WIRUS: RAT` | 3 | Odkrycie matrycy wirusa w scenie S02 |
| `app_browser` | `TOR: PRZEGLĄDARKA` | 4 | Kliknięcie linku `https://olcompany.cloud` w czacie z mentorem |
| `app_usb_disk` | `//DYSK E: PENDRIVE` | 5 | Pobranie załączników po zatwierdzeniu wektora socjotechnicznego |
| `app_drone` | `//DRON: CONDOR MIT63` | 6 | Przygotowanie pendrive'a, upływ nocy i wejście w fazę poranną (06:02) |
| `app_rat_c2` | `//WIRUS: RAT (C2)` | 7 | Pomyślny zrzut ładunku z drona i podłączenie pendrive'a przez ofiarę |

---

# **`3. Kanoniczna lista ocenianych decyzji (D1–D6)`**

| `ID` | `Scena` | `Nazwa decyzji / Minigra` | `Wybór idealny` |
| :---- | :---- | :---- | :---- |
| **D1** | S01 | Wybór złośliwego oprogramowania | `RAT: REMOTE ACCESS TROJAN` |
| **D2** | S03 | Wybór celu ataku z personelu O\&L Company | `MATEUSZ KLIMOWICZ – JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA` |
| **D3** | S04 | Wybór wektora ataku i przynęty socjotechnicznej | Nawiązanie do imprezy działu sprzedaży \+ ukrycie wirusa w archiwum ZIP |
| **D4** | S04 | Konfiguracja i kamuflaż nośnika USB | Podpis: `ZDJĘCIA Z AFTERPARTY O&L COMPANY!` (oraz nazwa dysku `IMPREZA`) |
| **D5** | S05 | Wskazanie adresu domowego ofiary na mapie drona | `OŁTASZYŃSKA 92C PARTYNICE` |
| **D6** | S06 | Wybór miejsca zrzutu ładunku na parkingu | `BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY` |

---

# **`4. Przebieg scen, dialogów i minigier`**

## **`Blok dialogowy: INTRO`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree` (okno komunikatora z mentorem)  
* **Kontekst:** Gracz wybiera Zadanie 3 w menu Darknetu i odbiera połączenie przychodzące od mentora BYTE\_MASTER.

**Skrypt `conversation`:**

* **BM:** „WITAJ, HAKERZE\! PRZED TOBĄ KOLEJNE ZADANIE"  
* **GRACZ:** „JASNE, CHOCIAŻ MIŁO BY BYŁO WIEDZIEĆ NA CZYM STOJĘ I ILE JESZCZE ZADAŃ PRZEDE MNĄ, ZANIM PRZYJMIECIE MNIE DO DARKSUN" *(jedyna opcja)*  
* **BM:** „CIERPLIWOŚCI. JESTEŚ NA DOBREJ DRODZE, PÓKI CO BARDZO NAM POMAGASZ W WALCE Z KONCERNAMI"  
* **GRACZ:** „OK, NIECH BĘDZIE. A WIĘC?" *(jedyna opcja)*  
* **BM:** „O\&L COMPANY TO JEDNA Z WIĘKSZYCH SPÓŁEK PALIWOWYCH. Z MOICH ŹRÓDEŁ WYNIKA, ŻE MAJĄ BRAKUJĄCĄ CZĘŚĆ DOKUMENTACJI NA TEMAT FREEVOLT, W TYM OPIS CAŁEJ INFRASTRUKTURY, WIĘC TO BARDZO CENNE DANE. ZDOBYCIE ICH BĘDZIE WYMAGAŁO OD CIEBIE KREATYWNOŚCI"  
* **GRACZ:** „CZY WIRUS, KTÓRY PRZEJMIE PULPIT PRACOWNIKA JEST WYSTARCZAJĄCO KREATYWNY?" *(jedyna opcja)*  
* **BM:** „TO ZALEŻY JAK GO DOSTARCZYSZ"  
* **GRACZ:** „DAJ MI CHWILĘ" *(jedyna opcja)*

**Kryterium ukończenia:** Kliknięcie przycisku „WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS". Następuje symulacja procedury bootowania HACKERSBIOS 2.0 i odblokowanie pulpitu operacyjnego.

---

## **`Scena S01: Wybór złośliwego oprogramowania (//BAZA_WIRUSÓW)`**

* **Oceniane:** Decyzja **D1**  
* **Klocek 2D:** `ChoiceCards` (3 poziome karty z ikonami i technicznymi opisami działania)  
* **Ekrany po kolei:** Ekran aplikacji `//BAZA_WIRUSÓW` z nagłówkiem „WYBIERZ ODPOWIEDNIEGO WIRUSA:" oraz trzema kartami wyboru.  
* **Interakcja:** Kliknięcie wybranej karty z malware'em.  
* **Dane:** Pula 3 typów złośliwego oprogramowania.  
* **Kryterium ukończenia:** Wybór jednego z programów (przejście do Sceny S02).

**Dane i opcje oceny (Decyzja D1):**

* **Opcja 1:** `RAT: REMOTE ACCESS TROJAN – POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY` \| **ideal** \| Daje bezpośredni, interaktywny wgląd w pulpit stacji roboczej pracownika i pozwala na swobodną eksplorację zasobów korporacyjnych bez wszczynania alarmu.  
* **Opcja 2:** `RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ` \| **suboptimal** \| Zablokowanie stacji ofiary natychmiast postawi na nogi dział IT i zablokuje możliwość cichego wykradzenia dokumentacji Freevolt.  
* **Opcja 3:** `KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE` \| **critical** \| Samo przechwytywanie wciśnięć klawiszy nie gwarantuje dostępu do zgromadzonych na dyskach plików projektowych i schematów.

---

## **`Scena S02: Odkrywanie struktury wirusa (Matryca kompilacji)`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** Interaktywny `Canvas` (mechanika zdrapki kursorem myszy) lub pasek postępu kompilacji.  
* **Ekrany po kolei:** Ekran z nagłówkiem „WYSZUKAJ CZĘŚCI WIRUSA:", centralnym polem zakrytym czarną maską ze znakiem zapytania „?" oraz segmentowym paskiem postępu na dole. Po osiągnięciu 100% pojawia się komunikat: „WIRUS GOTOWY\! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY".  
* **Interakcja:** Przesuwanie kursorem z wciśniętym lewym przyciskiem myszy po czarnym polu w celu odsłonięcia wektorowego symbolu szczura (RAT).  
* **Dane:** Wektorowa ikona głowy szczura z cybernetycznymi elementami; próg odsłonięcia: 100%.  
* **Kryterium ukończenia:** Osiągnięcie 100% wypełnienia paska postępu i kliknięcie przycisku „KONTYNUUJ". Odblokowuje kafelek `//WIRUS: RAT` na pulpicie.

---

## **`Blok dialogowy: MOSTEK <S02→S03> (Rozpoznanie OSINT)`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree`  
* **Kontekst:** Gracz po przygotowaniu ładunku kontaktuje się z mentorem w celu uzyskania namiarów na firmę.

**Skrypt `conversation`:**

* **GRACZ:** „GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?" *(wariant zalecany; w grze widoczny też przycisk „PRZEJDŹ DO HAKOWANIA")*  
* **BM:** „ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS\://OLCOMPANY.CLOUD"

**Kryterium ukończenia:** Kliknięcie hiperłącza `https://olcompany.cloud` w oknie czatu, co powoduje uruchomienie aplikacji `TOR: PRZEGLĄDARKA`.

---

## **`Scena S03: Rozpoznanie celów i wybór ofiary (TOR: PRZEGLĄDARKA)`**

* **Oceniane:** Decyzja **D2**  
* **Klocek 2D:** `ChoiceCards` / `DialogueTree` zintegrowane z widokiem strony internetowej.  
* **Ekrany po kolei:**  
  * Okno przeglądarki z witryną `O&L COMPANY` (zakładki: `STRONA GŁÓWNA` oraz `WYDARZENIA`).  
  * Na stronie głównej sekcja „NASI EKSPERCI:" prezentująca 5 pracowników (zdjęcie, imię i nazwisko, stanowisko):  
    1. Jan Łukasiewicz – CEO  
    2. Sławomir Białek – Szef Działu Cyberbezpieczeństwa  
    3. Wiktoria Gałecka – Specjalistka ds. Logistyki  
    4. Agnieszka Leman – Szefowa Działu Sprzedaży  
    5. Mateusz Klimowicz – Junior Specjalista ds. Wsparcia Klienta  
  * Panel komunikatora z pytaniem mentora: „KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?".  
* **Interakcja:** Kliknięcie profilu Mateusza Klimowicza na stronie internetowej lub wybór odpowiedniej kwestii dialogowej w komunikatorze.  
* **Kryterium ukończenia:** Wybór celu ataku (Decyzja D2).

**Dane i opcje oceny (Decyzja D2):**

* **Opcja 1:** `MATEUSZ KLIMOWICZ – JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA` \| **ideal** \| Nowo zatrudniony pracownik na juniorskim stanowisku charakteryzuje się najmniejszym doświadczeniem, brakiem obycia z procedurami bezpieczeństwa i najwyższą podatnością na socjotechnikę.  
* **Opcja 2:** `WIKTORIA GAŁECKA – SPECJALISTKA DS. LOGISTYKI` LUB `AGNIESZKA LEMAN – SZEFOWA DZIAŁU SPRZEDAŻY` \| **suboptimal** \| Doświadczone pracownice wyższego szczebla, które zachowują większą ostrożność wobec nietypowych nośników pamięci.  
* **Opcja 3:** `SŁAWOMIR BIAŁEK – SZEF DZIAŁU CYBERBEZPIECZEŃSTWA` LUB `JAN ŁUKASIEWICZ – CEO` \| **critical** \| Zaatakowanie szefa bezpieczeństwa lub CEO tak jawnym wektorem to gwarancja natychmiastowego zgłoszenia incydentu i spalenia całej operacji.

**Blok dialogowy: W MINIGRZE (po zatwierdzeniu wyboru celu):**

* **GRACZ:** „WIDZĘ, ŻE MAJĄ NOWEGO JUNIORA NA POKŁADZIE. ZHAKUJĘ MATEUSZA, LICZĄC NA JEGO BRAK DOŚWIADCZENIA ALBO PRZYNAJMNIEJ BRAK ZNAJOMOŚCI PROCEDUR"  
* **BM:** „DOBRY WYBÓR. ALE JAK CHCESZ GO ZHAKOWAĆ?"

---

## **`Scena S04: Przygotowanie wektora socjotechnicznego i nośnika USB (//DYSK E: PENDRIVE)`**

* **Oceniane:** Decyzja **D3** (Wektor ataku) oraz Decyzja **D4** (Kamuflaż pendrive'a i podpis na kopercie)  
* **Klocek 2D:** `DialogueTree` (D3), `Drag-and-drop` (uzbrojenie nośnika) oraz `ChoiceCards` (D4).  
* **Ekrany po kolei:**  
  * **Krok 1 (Eksploracja zakładki WYDARZENIA):** Gracz analizuje posty na firmowym portalu:  
    * „15 WRZEŚNIA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU SPRZEDAŻY\! POWITALIŚMY NA POKŁADZIE NOWYCH PRACOWNIKÓW ORAZ ŚWIĘTOWALIŚMY OSTATNIE SUKCESY\! \#OL \#BESTCOMPANY \#COMPANYUNHACKED" (wraz ze zdjęciami z imprezy piwnej).  
    * „4 LISTOPADA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU LOGISTYKI\!".  
  * **Krok 2 (Wybór strategii w czacie – Decyzja D3):** Wybór sposobu oszukania ofiary.  
  * **Krok 3 (Pobranie plików i uzbrojenie nośnika):** Mentor wysyła pliki. Po kliknięciu „POBIERZ ZAŁĄCZNIKI" otwiera się aplikacja `//E: USB` oraz panel `ZAŁĄCZNIKI` z trzema pozycjami:  
    * `IMG_00034521.JPG X3` *(cel)*  
    * `DOKUMENTY_HR.DOCX`  
    * `WYPOWIEDZENIE_UMOWY_O_PRACE.PDF`  
    * Gracz przeciąga zdjęcia na pendrive, a następnie przeciąga kafelek `//WIRUS: RAT` na plik zdjęć, tworząc archiwum `FOTKI_AFTERPARTY.ZIP`.  
  * **Krok 4 (Wybór nazwy dysku):** Ekran „WYBIERZ NAZWĘ PENDRIVE'A:" z 4 przyciskami: `KEYLOGGER`, `ZDJĘCIA B&O COMPANY`, `IMPREZA`, `NOWY DYSK`.  
  * **Krok 5 (Wybór podpisu na kopercie – Decyzja D4):** Ekran „WYBIERZ PODPIS NA KOPERCIE:" z 4 przyciskami.  
  * **Krok 6 (Eksmisja nośnika):** Kliknięcie przycisku „WYSUŃ PAMIĘĆ USB".  
* **Interakcja:** Wybór opcji dialogowej (D3), przeciąganie elementów myszą, kliknięcie nazwy nośnika i podpisu koperty (D4), kliknięcie „WYSUŃ PAMIĘĆ USB".

**Dane i opcje oceny – Wektor socjotechniczny (Decyzja D3):**

* **Opcja 1:** `MAM ZDJĘCIA I INFORMACJE O OSTATNIEJ IMPREZIE DZIAŁU SPRZEDAŻY. PODRZUCĘ MU PENDRIVE Z KILKOMA KOMPROMITUJĄCYMI ZDJĘCIAMI. WIRUSA UKRYJĘ W ARCHIWUM ZIP` \| **ideal** \| Idealnie wykorzystuje świeże wydarzenie firmowe oraz naturalną ludzką ciekawość i strach przed kompromitacją, a spakowanie złośliwego kodu do ZIP omija proste skanery antywirusowe.  
* **Opcja 2:** `PODRZUCĘ MU PENDRIVE Z DOKUMENTAMI HR DOTYCZĄCYMI ZWOLNIEŃ` \| **suboptimal** \| Wzbudza silny lęk, lecz junior w dziale wsparcia może uznać to za pomyłkę i odnieść nośnik prosto do kadr.  
* **Opcja 3:** `PO PROSTU ZOSTAWIE PUSTY PENDRIVE Z PODPISEM KEYLOGGER` \| **critical** \| Całkowity brak kamuflażu socjotechnicznego natychmiast zaalarmuje pracownika i spowoduje zablokowanie nośnika przez administratora.

**Blok dialogowy: W MINIGRZE (reakcja mentora na wybór D3):**

* **BM:** „DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE"  
* **BM:** „WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ"

**Dane i opcje oceny – Konfiguracja i kamuflaż nośnika (Decyzja D4):**  
*(Krok A: Nazwa pendrive'a – Wybór idealny: `IMPREZA`; Krok B: Podpis na kopercie):*

* **Opcja 1:** `ZDJĘCIA Z AFTERPARTY O&L COMPANY!` \| **ideal** \| Precyzyjnie nawiązuje do właściwej nazwy koncernu i nieformalnego charakteru imprezy, wzbudzając maksymalne zaufanie i motywację do natychmiastowego otwarcia.  
* **Opcja 2:** `PENDRIVE ZE ZDJĘCIAMI B&O COMPANY` \| **suboptimal** \| Błędna nazwa firmy („B\&O" zamiast „O\&L") wprowadza dysonans i może skłonić ofiarę do zignorowania nośnika jako cudzej własności.  
* **Opcja 3:** `ZGUBIONE DOKUMENTY` LUB `WYPOWIEDZENIE UMOWY` \| **critical** \| Etykieta stoi w całkowitej sprzeczności ze spakowanymi zdjęciami i przygotowaną legendą socjotechniczną, prowokując oddanie koperty do ochrony.

---

## **`Blok dialogowy: MOSTEK <S04→S05> (Planowanie logistyki drona)`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree`  
* **Kontekst:** Gracz planuje bezzałogowy zrzut nośnika na samochód ofiary pod jej domem.

**Skrypt `conversation`:**

* **GRACZ:** „GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIE PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI" *(jedyna opcja)*  
* **GRACZ:** „MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?" *(jedyna opcja)*  
* **BM:** „JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW, POLSKA (PL)"  
* **BM:** „DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA. WTEDY W PRACY NA PEWNO SPRAWDZI ZAWARTOŚĆ"  
* **GRACZ:** „JASNE, SŁYSZYMY SIĘ ZA KILKA GODZIN" *(jedyna opcja)*

*(Następuje ściemnienie ekranu i upływ czasu do poranka – godzina 06:02)*

* **BM:** „JUŻ CZAS. DRON GOTOWY DO WYLOTU?"  
* **GRACZ:** „JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE'A" *(jedyna opcja)*

**Kryterium ukończenia:** Zakończenie porannej odprawy odblokowuje aplikację `//DRON: CONDOR MIT63`.

---

## **`Scena S05: Konfiguracja drona i nawigacja do celu (//DRON: CONDOR MIT63)`**

* **Oceniane:** Decyzja **D5**  
* **Klocek 2D:** Interaktywny panel kontrolny drona \+ mapa taktyczna miasta (`SVG` / `ChoiceCards`).  
* **Ekrany po kolei:**  
  * **Ekran 1 (Aktywacja):** Model drona `CONDOR MIT63`, specyfikacja techniczna (stałe przekazywanie wideo, prędkość maksymalna 25 km/h, połączenie z odbiornikiem hakera) oraz przycisk „AKTYWUJ".  
  * **Ekran 2 (Podpięcie ładunku):** Status drona: „STOI W POKOJU HAKERA". Po kliknięciu „PRZYGOTUJ DO WYLOTU" status zmienia się na „CZEKA NA ŁADUNEK". Gracz zatwierdza podwieszenie przygotowanej koperty z pendrive'em i klika „ZATWIERDŹ".  
  * **Ekran 3 (Współrzędne na mapie – Decyzja D5):** Status: „CZEKA NA WSPÓŁRZĘDNE". Na planie miasta widoczne są 4 ponumerowane lokalizacje:  
    1. Oławska 51B (Nadodrze)  
    2. Drzymały 38D (Pilczyce)  
    3. Wystawowa 23A (Zalesie)  
    4. Ołtaszyńska 92C (Partynice)  
* **Interakcja:** Kliknięcie punktu docelowego na mapie i zatwierdzenie przyciskiem „ZATWIERDŹ".  
* **Kryterium ukończenia:** Wybór lokalizacji docelowej (status przechodzi w „LECI Z WYSOKĄ PRĘDKOŚCIĄ").

**Dane i opcje oceny (Decyzja D5):**

* **Opcja 1:** `OŁTASZYŃSKA 92C PARTYNICE` \| **ideal** \| Prawidłowy adres domowy Mateusza Klimowicza przekazany wcześniej przez mentora w wywiadzie operacyjnym.  
* **Opcja 2:** `OŁAWSKA 51B NADODRZE` LUB `DRZYMAŁY 38D PILCZYCE` \| **suboptimal** \| Skierowanie drona w zupełnie inną dzielnicę Wrocławia; ładunek nie trafi do rąk wytypowanej ofiary.  
* **Opcja 3:** `WYSTAWOWA 23A ZALESIE` \| **critical** \| Wysłanie drona w rejon obiektów użyteczności publicznej (Hala Stulecia) grozi przechwyceniem nośnika przez osoby trzecie.

**Blok dialogowy: W MINIGRZE (wskazówka rozpoznawcza pojazdu):**

* **BM:** „WSKAŻ DOM MATEUSZA NA MAPIE. ADRES WYSŁAŁEM CI WCZEŚNIEJ. PRZEWIŃ CZAT, JEŚLI GO NIE PAMIĘTASZ"  
* **BM:** „GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM. PRZESYŁAM CI ZDJĘCIE" *(w oknie czatu pojawia się fotografia białego miejskiego auta z charakterystycznym czerwonym dachem)*

---

## **`Scena S06: Precyzyjny zrzut ładunku z drona na parking (Aplikacja drona)`**

* **Oceniane:** Decyzja **D6**  
* **Klocek 2D:** Interaktywny `Canvas` (widok z kamery drona z góry, wirtualny celownik, wskaźniki HUD: bateria 48%, zegar transmisji, przycisk „ZRZUĆ ŁADUNEK").  
* **Ekrany po kolei:**  
  * Po dotarciu na miejsce gracz klika przycisk „URUCHOM KAMERĘ".  
  * Na ekranie pojawia się podgląd parkingu osiedlowego z perspektywy lotu ptaka.  
  * Na miejscach parkingowych stoją różne pojazdy: ciemny SUV, srebrny sedan, zielony hatchback, pomarańczowy van oraz biały samochód z czerwonym dachem.  
* **Interakcja:** Naprowadzenie celownika kamery myszą na dach właściwego samochodu i kliknięcie przycisku „ZRZUĆ ŁADUNEK".  
* **Kryterium ukończenia:** Wykonanie zrzutu ładunku. Pojawia się komunikat: „POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'M. DRON WRACA DO POKOJU HAKERA", a gracz klika „WYŁĄCZ APLIKACJĘ DRONA".

**Dane i opcje oceny (Decyzja D6):**

* **Opcja 1:** `BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY` \| **ideal** \| Koperta zostaje precyzyjnie umieszczona na samochodzie Mateusza, gwarantując jej odnalezienie przed wyjazdem do biura.  
* **Opcja 2:** `Zrzut na inny samochód (szary sedan / ciemny SUV)` \| **suboptimal** \| Koperta trafi do przypadkowego sąsiada, co drastycznie zmniejsza szansę na dostarczenie payloadu do biura O\&L Company.  
* **Opcja 3:** `Zrzut na pusty asfalt / jezdnię między miejscami parkingowymi` \| **critical** \| Zgubienie lub zniszczenie nośnika pod kołami innych pojazdów oraz całkowite fiasko operacji drop USB.

---

## **`Scena S07: Aktywacja trojana RAT i eksfiltracja danych Freevolt`**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** `DialogueTree` oraz symulator pulpitu przejętego komputera.  
* **Ekrany po kolei:**  
  * **Krok 1 (Czat oczekiwania):**  
    * **GRACZ:** „OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA"  
    * Przeskok czasu do godzin pracy biurowej (08:12).  
  * **Krok 2 (Alert aktywacji):** Na pulpicie HACKERS.OS pojawia się migający alert: „MALWARE ZOSTAŁ AKTYWOWANY". Gracz uruchamia kafelek `//WIRUS: RAT`.  
  * **Krok 3 (Szczegóły połączenia C2):**  
    * Etykieta: `//MALWARE TYPU RAT: REMOTE ACCESS TROJAN`  
    * Status: `PENDRIVE ZOSTAŁ PODŁĄCZONY. MALWARE ZOSTAŁ AKTYWOWANY`  
    * Metadane stacji: `NAZWA KOMPUTERA: MATEUSZ_BIURO_O&L`, `AKTYWOWANE NA IP: 161.185.160.93`  
    * Przycisk: `PRZEJMIJ PULPIT OFIARY`.  
  * **Krok 4 (Zdalny pulpit ofiary):**  
    * Górny baner: `KONTROLUJESZ PULPIT OFIARY`.  
    * Pulpit systemu Windows stacji roboczej Mateusza z ikonami: `KOSZ`, `TEN KOMPUTER`, `FREEVOLT` (z pomarańczowym trójkątem ostrzegawczym).  
  * **Krok 5 (Meldunek i penetracja sieci):**  
    * Gracz raportuje mentorowi:  
      * **GRACZ:** „MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?"  
      * **BM:** „WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI"  
      * **BM:** „JESTEŚMY W KONTAKCIE\!"  
    * Gracz klika ikonę `FREEVOLT` na pulpicie ofiary.  
  * **Krok 6 (Sukces eksfiltracji sieciowej):**  
    * Ekran końcowy z animowanym schematem połączeń: „UZYSKAŁEŚ ZDALNY DOSTĘP DO SIECI O\&L COMPANY" (widoczny węzeł hakera, węzeł pośredni oraz 3 zainfekowane stacje robocze).  
* **Kryterium ukończenia:** Kliknięcie przycisku „PODSUMOWANIE ZADANIA".

---

# **`5. Scena S08: Podsumowanie zadania i Debriefing Edukacyjny`**

* **Oceniane:** Podsumowanie wyników decyzji `D1`–`D6`.  
* **Klocek 2D:** Zunifikowany moduł podsumowania punktacji SCORM \+ karuzela slajdów edukacyjnych.

## **`Ekran wyników w grze:`**

* **Nagłówek:** „ZHAKOWANO O\&L – SUKCES – UKOŃCZONO ZADANIE 3"  
* **Wynik procentowy:** `100% MAKSYMALNEGO WYNIKU`  
* **Zestawienie wyborów:**  
  * 6 idealnych wyborów (`ideal`)  
  * 0 dobrych, ale nieidealnych (`suboptimal`)  
  * 0 błędów krytycznych (`critical`)  
* **Nagroda i odznaki:**  
  * Odznaka za 100%: Złoty/srebrny puchar  
  * Otrzymane Bitcoiny: `4,02 BTC` (stan konta gracza wzrasta z 5,50 BTC do 9,52 BTC)  
  * Postęp certyfikatu ukończenia: `4/10`

## **`Kanoniczna tabela debriefu (D1–D6):`**

| `ID` | `Pytanie z ekranu debriefu` | `Wybór gracza (Ścieżka 100%)` | `Ocena` |
| :---- | :---- | :---- | :---- |
| **D1** | WYBIERZ ODPOWIEDNIEGO WIRUSA | `RAT` | `ideal` |
| **D2** | KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ? | `JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA` | `ideal` |
| **D3** | JAK GO OSZUKASZ? | `NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY` | `ideal` |
| **D4** | WYBIERZ PODPIS NA KOPERCIE | `ZDJĘCIA Z AFTERPARTY O&L COMPANY!` | `ideal` |
| **D5** | WSKAŻ DRONOWI ADRES DOMU OFIARY | `OŁTASZYŃSKA 92C` | `ideal` |
| **D6** | WYBIERZ MIEJSCE NA PARKINGU, GDZIE OFIARA NA PEWNO ZNAJDZIE KOPERTĘ Z PENDRIVE'M | `BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY` | `ideal` |

---

## **`Slajdy edukacyjne „CO POWINIENEŚ ZAPAMIĘTAĆ?":`**

1. **UWAŻAJ NA PODEJRZANE PLIKI:**  
   „Wirusy mogą być zawarte w dowolnym pliku, szczególnie uważaj na archiwa .rar, .zip itp. Jeżeli nie masz pewności skąd pochodzi dany plik i czy jest bezpieczny, poproś o pomoc administratora lub dział IT."  
2. **PODEJRZANE PENDRIVE'Y:**  
   „Nie wkładaj znalezionych lub podejrzanych pendrive'ów do swojego komputera, bo mogą one zawierać niebezpieczne wirusy. Pamiętaj, że każdy nośnik pamięci to potencjalne ryzyko infekcji. Aktywuj skanowanie dysków przenośnych w swoim programie antywirusowym."  
3. **INFORMACJE W SOCJOTECHNIKACH:**  
   „Wszystkie informacje, które są udostępnione o tobie w sieci mogą być wykorzystane przeciwko tobie. Cyberprzestępcy wykorzystują je do ataków socjotechnicznych."  
4. **PODSUMOWUJĄC – NA CO NALEŻY UWAŻAĆ:**  
   * Uważaj na podejrzane pliki, szczególnie archiwa .rar i .zip.  
   * Nie wkładaj nieznanych pendrive'ów do komputera.  
   * Uważaj na nieznane osoby, które coś o tobie wiedzą.  
5. **CHCESZ UNIKNĄĆ HAKOWANIA?**  
   „Wszystkie wskazówki na temat cyberbezpieczeństwa znajdziesz w panelu Baza Wiedzy. Znajduje się on w głównym menu hakera – Darknecie."

