# **S05: Przygotowanie maila phishingowego i konfiguracja VPN**

# **Kontekst sceny**

* **Cel szkoleniowy:** Zidentyfikowanie elementów skutecznego ataku spear-phishingowego (dokładne dopasowanie tematu i treści do trwającej w firmie rekrutacji, użycie spójnej tożsamości kandydata, uzbrojenie załącznika CV w ładunek ransomware oraz dodanie hasła do pliku w treści, co usypia czujność ofiary i omija automatyczne piaskownice skanerów) oraz zrozumienie roli maskowania adresu IP (VPN) w ukrywaniu prawdziwej lokalizacji i tożsamości nadawcy.  
* **Stan wejściowy:** Gracz znajduje się na pulpicie //HACKERS.OS po zakończeniu konfiguracji wirusa (S04). Na pulpicie widnieje 7 aplikacji: //BAZA\_WIRUSÓW, //CHAT: BYTE\_MASTER, //DYSK E: PENDRIVE, //DRON: CONDOR MITE3, //MAIL (z czerwoną plakietką powiadomienia 1), //TOR: PRZEGLĄDARKA oraz nowo odblokowana ikona //WIRUS: RANSOMWARE (z fioletową kłódką). Na prawym ekranie czatu BYTE\_MASTER napisał: „ZNALEZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA".  
* **Odblokowane z wcześniejszych scen:** Skompilowany i w pełni skonfigurowany wirus ransomware (//WIRUS: RANSOMWARE).  
* **Układ ekranu 2D:**  
  * **Środek (główny ekran roboczy):** Pulpit //HACKERS.OS, na którym po otwarciu aplikacji wyświetla się pionowe okno pocztowe //MAIL z polami TEMAT:, TREŚĆ: oraz ZAŁĄCZNIK:. W dalszych krokach okno maila zastępowane jest przez fioletowy moduł //VPN, a następnie panel wyboru adresu nadawcy.  
  * **Lewa strona (przestrzeń boczna):** Lewitujące zielone kafelki opcji do przeciągnięcia: najpierw warianty tematu maila, a następnie warianty treści wiadomości.  
  * **Prawa strona:** Pionowy ekran komunikatora z nagłówkiem BYTE\_MASTER.  
  * **Strefa dolna (w VR na podłodze):** Kołowe trójwymiarowe pokrętło oktetów adresu IP w module VPN.  
* **Elementy sceny:**  
  * **Aplikacja pocztowa //MAIL:** Okno z polami tekstowymi, miejscem na załącznik oraz przyciskami akcji („WŁĄCZ VPN", „WYŚLIJ MAILA").  
  * **Kafelki tematu maila (po lewej stronie):**  
    * **CV MICHAŁ WILK:** wariant poprawny/zaliczony  
    * **WILK CV:** wariant odrzucony  
    * **ANALITYK MICHAŁ WILK:** wariant odrzucony  
  * **Kafelki treści maila (po lewej stronie):**  
    * **Wariant formalny z hasłem:** DZIEŃ DOBRY, PRZESYŁAM CV W ZWIĄZKU Z REKRUTACJĄ NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH. HASŁO DO PLIKU: WILK. POZDRAWIAM, MICHAŁ WILK (wariant poprawny)  
    * **Wariant krótki:** HEJ, W ZAŁĄCZNIKU PRZESYŁAM CV. POZDRAWIAM, MICHAŁ WILK (wariant nieformalny)  
    * **Wariant pośredni:** CZEŚĆ, PRZESYŁAM CV NA STANOWISKO ANALITYKA USŁUG ENERGETYCZNYCH. POZDRAWIAM, MICHAŁ WILK (błędna nazwa stanowiska, brak hasła)  
  * **Załącznik CV\_WILK.PDF:** Kafel z ikoną dokumentu w oknie poczty, przyjmujący ładunek ransomware.  
  * **Ikona //WIRUS: RANSOMWARE:** Fioletowy kafelek wirusa lewitujący obok okna maila.  
  * **Moduł //VPN:** Fioletowe okno z nagłówkiem „VPN \- DOPASUJ SWOJE IP, ABY UNIKNĄĆ WYKRYCIA", polami „POŻĄDANY ADRES IP: 109.43.200.124", „AKTUALNY ADRES IP: 106.55.202.120", przyciskami „POPRZEDNI OKTET", „NASTĘPNY OKTET" oraz przyciskiem „DOPASUJ W AI".  
  * **Karty wyboru nadawcy:** Panel z nagłówkiem „WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:" i trzema adresami: M.WILK@PRIV.COM, ALEX@PRIV.COM, NEWRAWGOODS@COMMERCIAL.BIZ.  
  * **Kostki dialogowe 3D:** Niebieskie prostopadłościany pojawiające się przed prawym ekranem czatu.

# **Kroki**

## **S05-K01: Otwarcie aplikacji pocztowej //MAIL**

* **Obserwacja (VR):** Po powrocie do pulpitu gracz kieruje wskaźnik lasera na ikonę //MAIL, która posiada czerwoną plakietkę powiadomienia 1, i klika ją.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** ikona //MAIL na pulpicie  
  * **Widoczne, ale nieaktywne:** pozostałe ikony pulpitu, prawy ekran komunikatora z poleceniem mentora  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Czerwona plakietka 1 na ikonie //MAIL oraz wyraźne polecenie mentora na czacie („WŁĄCZ APLIKACJĘ MAILA") jednoznacznie wskazują kolejny cel.  
* **Akcja gracza (z nagrania):** Klika ikonę //MAIL na pulpicie.  
* **Niewybrane opcje:** pozostałe ikony pulpitu (zablokowane).  
* **Informacja zwrotna:** Dźwięk otwarcia okna; wyświetlenie pustego szablonu maila na głównym ekranie; pojawienie się niebieskiej kostki dialogowej 3D przed prawym ekranem czatu.  
* **Zmiana sceny:** Pulpit zostaje przesłonięty przez okno aplikacji //MAIL; lewy dolny wskaźnik paska stanu zmienia się na //MAIL. Przed ekranem komunikatora pojawia się kostka dialogowa.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** ikona //MAIL z czerwoną plakietką powiadomienia; pozostałe ikony zablokowane.  
  * **Jak przenieść prowadzenie:** pulsowanie ikony //MAIL i plakietki powiadomienia, efekt powiększenia po najechaniu kursorem (hover).  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (wyraźniejsze pulsowanie ikony maila), poziom 2 po czasie T2 (komunikat: „Otwórz aplikację pocztową //MAIL, aby przygotować wiadomość").  
* **Kryterium ukończenia:** Kliknięcie ikony //MAIL i wyświetlenie okna klienta poczty.

## **S05-K02: Zapytanie mentora o wytyczne dotyczące tematu maila**

* **Obserwacja (VR):** Gracz chwyta kontrolerem niebieską kostkę 3D lewitującą przed ekranem czatu i rzuca ją w prawy ekran w stronę BYTE\_MASTER.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** kostka dialogowa 3D  
  * **Widoczne, ale nieaktywne:** puste okno //MAIL na głównym monitorze  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Pojawienie się kostki 3D na pierwszym planie z dźwiękiem energetycznym i ikoną dłoni wskazuje konieczność skonsultowania się z mentorem przed napisaniem maila.  
* **Akcja gracza (z nagrania):** Chwyta kostkę dialogową i rzuca ją w ekran komunikatora.  
* **Niewybrane opcje:** brak innych opcji dialogowych.  
* **Informacja zwrotna:** Dźwięk rzutu, niebieski rozbłysk w punkcie uderzenia; dźwięk nowej wiadomości na czacie i natychmiastowa odpowiedź BYTE\_MASTER.  
* **Zmiana sceny:** Wiadomość gracza pojawia się na czacie, mentor odpowiada: „TEMAT MAILA POWINIEN ZAWIERAĆ ODPOWIEDNIO NAZWISKO ORAZ IMIĘ Z DOPISKIEM CV". W oknie poczty pojawia się puste pole TEMAT:, a po lewej stronie w przestrzeni materializują się trzy zielone kafelki z propozycjami tematów.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** dymek dialogowy w oknie czatu po prawej stronie. Kliknięcie dymka wysyła zapytanie do mentora.  
  * **Jak przenieść prowadzenie:** podświetlenie dymka pytania na panelu czatu z pulsującą ikoną wysyłania.  
  * **Podpowiedź po bezczynności:** T1 – pulsowanie dymka w czacie; T2 – komunikat: „Zapytaj BYTE\_MASTER o wytyczne dotyczące tematu wiadomości".  
* **Kryterium ukończenia:** Wysłanie pytania do mentora i wyświetlenie kafelków z tematami maila.

## **S05-K03: Wybór tematu wiadomości (Wybór 5\)**

* **Obserwacja (VR):** Gracz analizuje trzy kafelki lewitujące po lewej stronie: CV MICHAŁ WILK, WILK CV, ANALITYK MICHAŁ WILK. Chwyta laserem kafelek CV MICHAŁ WILK i przeciąga go do prostokątnego pola TEMAT: w oknie pocztowym.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** CV MICHAŁ WILK, WILK CV, ANALITYK MICHAŁ WILK  
  * **Pole docelowe:** slot TEMAT: w oknie //MAIL  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Wskazówka mentora precyzuje, że temat musi łączyć imię, nazwisko oraz dopisek CV.  
  * **Kontekst wyboru:** Wskazówka BYTE\_MASTER brzmi: „TEMAT MAILA POWINIEN ZAWIERAĆ ODPOWIEDNIO NAZWISKO ORAZ IMIĘ Z DOPISKIEM CV" (co w dosłownej kolejności sugerowałoby „WILK MICHAŁ CV"), jednak wśród dostępnych kafelków znajduje się wyłącznie CV MICHAŁ WILK, WILK CV oraz ANALITYK MICHAŁ WILK. Jako poprawny (idealny wybór – 100% w podsumowaniu) gra zalicza kafelek CV MICHAŁ WILK. W adaptacji webowej należy zachować ten wybór lub ujednolicić tekst podpowiedzi mentora.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek CV MICHAŁ WILK do pola TEMAT:.  
* **Niewybrane opcje:**  
  * **WILK CV:** skutek wyboru poza nagraniem  
  * **ANALITYK MICHAŁ WILK:** skutek wyboru poza nagraniem  
* **Informacja zwrotna:** Dźwięk upuszczenia elementu; pole TEMAT: zostaje zablokowane z wpisanym tekstem CV MICHAŁ WILK. Trzy kafelki tematów znikają.  
* **Zmiana sceny:** W oknie //MAIL pojawia się puste pole TREŚĆ: oraz ikona załącznika CV\_WILK.PDF. Po lewej stronie w przestrzeni pojawiają się trzy nowe zielone kafelki z wariantami treści maila.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** trzy kafelki tematów po lewej stronie oraz pole TEMAT: w oknie maila.  
  * **Jak przenieść prowadzenie:** przeciąganie drag-and-drop z lewej kolumny do pola tematu lub możliwość kliknięcia kafelka w celu automatycznego wstawienia.  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (pulsowanie kafelka CV MICHAŁ WILK), poziom 2 po czasie T2 (komunikat: „Wybierz temat zawierający imię, nazwisko i dopisek CV").  
* **Kryterium ukończenia:** Wybranie tematu CV MICHAŁ WILK, zapisanie wyniku Wyboru nr 5 i odblokowanie konfiguracji treści wiadomości.

## **S05-K04: Wybór treści wiadomości e-mail (Wybór 6\)**

* **Obserwacja (VR):** Gracz zapoznaje się z trzema kafelkami treści maila po lewej stronie:  
  * DZIEŃ DOBRY, PRZESYŁAM CV W ZWIĄZKU Z REKRUTACJĄ NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH. HASŁO DO PLIKU: WILK. POZDRAWIAM, MICHAŁ WILK  
  * HEJ, W ZAŁĄCZNIKU PRZESYŁAM CV. POZDRAWIAM, MICHAŁ WILK  
  * CZEŚĆ, PRZESYŁAM CV NA STANOWISKO ANALITYKA USŁUG ENERGETYCZNYCH. POZDRAWIAM, MICHAŁ WILK  
    Gracz chwyta pierwszy kafelek (formalny, z poprawną nazwą stanowiska i hasłem do pliku) i przeciąga go do pola TREŚĆ:.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** trzy kafelki treści po lewej stronie  
  * **Pole docelowe:** slot TREŚĆ: w oknie pocztowym  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Mentor w S04 zaznaczył, że priorytet rekrutacyjny dotyczy stanowiska „ANALITYK RYNKÓW ENERGETYCZNYCH". Wariant 1 jest jedynym, który zawiera prawidłową, pełną nazwę stanowiska, profesjonalny zwrot grzecznościowy oraz kluczowy element techniczny – hasło zabezpieczające plik (WILK). Hasło w treści maila jest powszechną techniką uśpienia czujności ofiary oraz ominięcia automatycznych piaskownic antywirusowych (sandbox), które nie potrafią otworzyć zaszyfrowanego załącznika bez analizy treści e-maila.  
* **Akcja gracza (z nagrania):** Przeciąga formalną treść z hasłem do pliku do pola TREŚĆ:.  
* **Niewybrane opcje:**  
  * **Wariant nieformalny (HEJ...):** skutek wyboru poza nagraniem  
  * **Wariant pośredni (CZEŚĆ... / ANALITYK USŁUG ENERGETYCZNYCH):** skutek wyboru poza nagraniem  
* **Informacja zwrotna:** Dźwięk upuszczenia; treść zostaje wpisana w pole maila; kafelki po lewej stronie znikają.  
* **Zmiana sceny:** W oknie maila pole treści zostaje zablokowane. Obok załącznika CV\_WILK.PDF pojawia się pulsująca fioletowa ikona //WIRUS: RANSOMWARE.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** trzy kafelki treści oraz pole TREŚĆ:.  
  * **Kryterium ukończenia:** Wybranie formalnej treści z hasłem do pliku, zapisanie wyniku Wyboru nr 6 (Wybierz treść maila: DZIEŃ DOBRY... – idealny wybór) i przejście do kroku infekowania załącznika.

## **S05-K05: Zainfekowanie załącznika CV ładunkiem ransomware**

* **Obserwacja (VR):** Gracz chwyta wiązką lasera fioletową ikonę //WIRUS: RANSOMWARE unoszącą się po prawej stronie okna poczty i przeciąga ją bezpośrednio na kafelek załącznika CV\_WILK.PDF.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** fioletowy kafelek //WIRUS: RANSOMWARE  
  * **Pole docelowe:** kafelek załącznika CV\_WILK.PDF  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Fioletowa ikona wirusa unosi się tuż obok załącznika, wyróżniając się kolorem i delikatną animacją pulsowania. Zbliżenie wirusa do załącznika podświetla ramkę pliku PDF na fioletowo.  
* **Akcja gracza (z nagrania):** Przeciąga ikonę wirusa na załącznik CV\_WILK.PDF.  
* **Niewybrane opcje:** brak innych opcji.  
* **Informacja zwrotna:** Dźwięk infekowania/połączenia plików; ikona CV\_WILK.PDF zyskuje fioletowe obramowanie z miniaturą ikony ransomware w rogu; w oknie maila pojawia się fioletowy przycisk WŁĄCZ VPN.  
* **Zmiana sceny:** Załącznik zostaje oznaczony jako zainfekowany; pod załącznikiem materializuje się przycisk WŁĄCZ VPN.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** ikona wirusa i pole załącznika CV.  
  * **Jak przenieść prowadzenie:** przeciągnięcie ikony wirusa na załącznik (drag-and-drop) lub kliknięcie przycisku „Zainfekuj załącznik wirusem Ransomware".  
  * **Podpowiedź po bezczynności:** T1 – pulsowanie ikony wirusa i załącznika; T2 – komunikat: „Przeciągnij wirusa Ransomware na plik CV\_WILK.PDF, aby dołączyć złośliwy ładunek".  
* **Kryterium ukończenia:** Połączenie ikony wirusa z plikiem CV\_WILK.PDF i wyświetlenie przycisku WŁĄCZ VPN.

## **S05-K06: Uruchomienie konfiguracji VPN**

* **Obserwacja (VR):** Gracz klika fioletowy przycisk WŁĄCZ VPN w oknie pocztowym.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk WŁĄCZ VPN  
  * **Widoczne:** uzupełnione okno maila  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk WŁĄCZ VPN jest jedynym aktywnym elementem interakcji po zainfekowaniu załącznika.  
* **Akcja gracza (z nagrania):** Klika WŁĄCZ VPN.  
* **Niewybrane opcje:** brak innych akcji.  
* **Informacja zwrotna:** Dźwięk kliknięcia i otwarcia modułu sieciowego.  
* **Zmiana sceny:** Okno poczty zostaje przysłonięte fioletowym panelem //VPN. Przed graczem na podłodze/w przestrzeni pojawia się duże poziome kołowe pokrętło z liczbami oktetów adresu IP. Na ekranie głównym wyświetlają się adresy: pożądany (109.43.200.124) oraz aktualny (106.55.202.120), przyciski nawigacji oktetów oraz fioletowy przycisk DOPASUJ W AI w prawym górnym rogu.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk WŁĄCZ VPN.  
* **Kryterium ukończenia:** Kliknięcie przycisku i otwarcie widoku modułu VPN.

## **S05-K07: Dopasowanie adresu IP w module VPN (Wybór 7 / minigra)**

* **Obserwacja (VR):** Na ekranie widoczna jest instrukcja: „DOPASUJ SWOJE IP, ABY UNIKNĄĆ WYKRYCIA". Gracz może obracać kołem oktetów za pomocą kontrolera, jednak natychmiast kieruje wskaźnik lasera na przycisk DOPASUJ W AI w prawym górnym rogu i klika go. Ekran przełącza się w konsolę tekstową z logami sztucznej inteligencji (AI VERSION 1.7.4 / BYPASSING VPN SEQUENCE / FINISHED IN 0.8s), po czym wyświetla komunikat POMYŚLNIE DOPASOWANO IP.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:**  
    * Kołowe pokrętło oktetów IP (obracanie ręczne)  
    * Przyciski POPRZEDNI OKTET / NASTĘPNY OKTET  
    * Przycisk DOPASUJ W AI (automatyczne dopasowanie)  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk DOPASUJ W AI jest wyraźnie wyeksponowany w rogu ekranu jako funkcja ułatwiająca zadanie. Cel dydaktyczny polega na zrozumieniu konieczności zamaskowania adresu IP przed wysłaniem maila, aby ofiara lub systemy bezpieczeństwa nie zidentyfikowały prawdziwego pochodzenia ataku.  
* **Akcja gracza (z nagrania):** Klika przycisk DOPASUJ W AI.  
* **Niewybrane opcje:** ręczne obracanie pokrętłem każdego z 4 oktetów adresu IP (skutek: identyczny rezultat, ale wymagający dłuższego ustawiania manualnego).  
* **Informacja zwrotna:** Dźwięk sekwencji komputerowej; animacja terminala tekstowego; komunikat POMYŚLNIE DOPASOWANO IP.  
* **Zmiana sceny:** Kołowe pokrętło znika z przestrzeni. Na głównym monitorze moduł VPN przełącza się na widok wyboru tożsamości nadawcy z nagłówkiem WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** interfejs dopasowania adresu IP (suwaki/pola wpisywania oktetów) oraz przycisk DOPASUJ Z AI.  
  * **Jak przenieść prowadzenie:** w 2D kołowe pokrętło 3D nie ma racji bytu – można przedstawić adres IP jako 4 pola liczbowe z przyciskami góra/dół lub zachować przycisk automatycznego dopasowania przez AI z krótką animacją terminala.  
  * **Podpowiedź po bezczynności:** T1 – pulsowanie przycisku DOPASUJ Z AI; T2 – komunikat: „Użyj funkcji dopasowania AI, aby szybko zamaskować swój adres IP adresem docelowym".  
* **Kryterium ukończenia:** Skonfigurowanie adresu IP (ręcznie lub przez AI) i wyświetlenie ekranu wyboru adresu nadawcy.

## **S05-K08: Wybór adresu e-mail nadawcy (Wybór 8\)**

* **Obserwacja (VR):** W oknie wyświetla się pytanie WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA: oraz trzy opcje w formie dużych podłużnych przycisków: M.WILK@PRIV.COM, ALEX@PRIV.COM, NEWRAWGOODS@COMMERCIAL.BIZ. Gracz najeżdża wskaźnikiem na pierwszy adres M.WILK@PRIV.COM i klika go.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:**  
    * **M.WILK@PRIV.COM:** adres spójny z nazwiskiem kandydata  
    * **ALEX@PRIV.COM:** adres niespójny  
    * **NEWRAWGOODS@COMMERCIAL.BIZ:** adres firmowy/komercyjny, niespójny z kandydatem prywatnym  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Trzy adresy są wyeksponowane równorzędnie. Gracz musi skojarzyć, że kandydat przedstawiający się jako Michał Wilk w treści maila i załączniku CV\_WILK.PDF musi wysłać wiadomość z adresu zawierającego jego inicjał i nazwisko (M.WILK@PRIV.COM). Adres ze złym imieniem lub generyczną domeną handlową wzbudziłby natychmiastowe podejrzenia rekrutera.  
* **Akcja gracza (z nagrania):** Wybiera adres M.WILK@PRIV.COM.  
* **Niewybrane opcje:**  
  * **ALEX@PRIV.COM:** skutek wyboru poza nagraniem  
  * **NEWRAWGOODS@COMMERCIAL.BIZ:** skutek wyboru poza nagraniem  
* **Informacja zwrotna:** Dźwięk zatwierdzenia wyboru; powrót do widoku okna //MAIL.  
* **Zmiana sceny:** Panel wyboru adresu znika. Okno //MAIL pokazuje gotową do wysłania wiadomość z wybranym nadawcą, tematem, treścią i zainfekowanym CV. Na dole okna aktywny jest zielony przycisk WYŚLIJ MAILA.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** trzy klikalne przyciski adresów e-mail z efektem hover.  
  * **Podpowiedź po bezczynności:** T1 – delikatne podświetlenie adresu M.WILK@PRIV.COM; T2 – komunikat: „Wybierz adres e-mail, który jest w pełni spójny z tożsamością kandydata Michała Wilka".  
* **Kryterium ukończenia:** Wybranie adresu M.WILK@PRIV.COM, zapisanie wyniku Wyboru nr 8 i odblokowanie przycisku wysłania wiadomości.

## **S05-K09: Wysłanie wiadomości e-mail**

* **Obserwacja (VR):** Gracz klika zielony przycisk WYŚLIJ MAILA na dole okna aplikacji pocztowej.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk WYŚLIJ MAILA  
  * **Widoczne:** podgląd skompletowanej wiadomości  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk WYŚLIJ MAILA jest jedynym podświetlonym na zielono elementem po skonfigurowaniu wszystkich parametrów wiadomości.  
* **Akcja gracza (z nagrania):** Klika WYŚLIJ MAILA.  
* **Niewybrane opcje:** brak innych opcji.  
* **Informacja zwrotna:** Dźwięk wysłania poczty (świst/kliknięcie); natychmiastowe zamknięcie okna //MAIL i powrót do pulpitu //HACKERS.OS.  
* **Zmiana sceny:** Okno poczty znika, odsłaniając pulpit. Przed prawym ekranem czatu pojawia się niebieska kostka dialogowa 3D.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk WYŚLIJ MAILA.  
* **Kryterium ukończenia:** Kliknięcie przycisku WYŚLIJ MAILA, zamknięcie okna pocztowego i powrót do pulpitu.

## **S05-K10: Wysłanie meldunku do BYTE\_MASTER**

* **Obserwacja (VR):** Gracz chwyta niebieską kostkę 3D lewitującą przed ekranem komunikatora i rzuca ją w stronę BYTE\_MASTER. Treść wiadomości pojawia się na czacie, a mentor po chwili odpowiada: „KTO WIE?". Po wymianie zdań ekran na moment gaśnie (czarna plansza), po czym na pulpicie wyświetla się baner MALWARE ZOSTAŁ AKTYWOWANY.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** kostka dialogowa 3D  
  * **Widoczne:** pulpit //HACKERS.OS, prawy ekran czatu  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Lewitująca kostka z pulsującym dźwiękiem sygnalizuje konieczność zaraportowania wykonania zadania mentorowi.  
* **Akcja gracza (z nagrania):** Chwyta kostkę i rzuca ją w ekran czatu.  
* **Niewybrane opcje:** brak innych opcji.  
* **Informacja zwrotna:** Dźwięk rzutu, rozbłysk uderzenia; dźwięk wiadomości na czacie; odpowiedź mentora; krótkie wygaszenie ekranu przechodzące w scenę S06.  
* **Zmiana sceny:** Wiadomość gracza zostaje dodana do historii czatu. BYTE\_MASTER odpowiada. Następuje krótkie ściemnienie ekranu, po którym pojawia się zielony baner informacyjny MALWARE ZOSTAŁ AKTYWOWANY (początek sceny S06).  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** dymek raportu w panelu czatu (kliknięcie wysyła meldunek) lub automatyczne wysłanie po zamknięciu klienta poczty.  
* **Kryterium ukończenia:** Wysłanie raportu do mentora, odebranie odpowiedzi i przejście do sceny S06.

## **Decyzje projektowe**

* **Kołowe pokrętło oktetów IP w VPN:** W wersji VR moduł VPN wykorzystuje trójwymiarowe koło na podłodze, którym gracz może obracać kontrolerem w przestrzeni. W 2D ta mechanika nie ma zastosowania – należy decided, czy w webie zastąpić to 4 prostymi polami numerycznymi (slider/stepper), czy pozostawić wyłącznie przycisk „Dopasuj przez AI".  
* **Mechanika infekowania załącznika (drag-and-drop ikony wirusa):** W VR gracz fizycznie przeciąga kafelek wirusa na plik PDF. W 2D należy ustalić, czy zachować przeciąganie myszą na załącznik, czy dodać przycisk „Dołącz wirus do pliku CV".  
* **Mechanika rzutu kostkami dialogowymi 3D:** W krokach S05-K02 i S05-K10 występują rzuty kostkami w ekran czatu. W webie należy zastąpić je kliknięciem wariantów wypowiedzi w panelu komunikatora.

# **Stan po scenie**

* Wysłana wiadomość spear-phishingowa do Energy Rock (spójny nadawca M.WILK@PRIV.COM, dopasowany temat, profesjonalna treść z hasłem do pliku, zamaskowane IP przez VPN).  
* Zainfekowany załącznik CV\_WILK.PDF zawierający ransomware.  
* Zapisane idealne wyniki dla Wyboru 5 (Temat maila), Wyboru 6 (Treść maila) oraz Wyboru 8 (Adres nadawcy).  
* Rozpoczęta faza oczekiwania na otwarcie pliku przez ofiarę, zwieńczona powiadomieniem MALWARE ZOSTAŁ AKTYWOWANY (punkt wyjścia dla sceny S06).

# **Dialogi i teksty w scenie**

* **Wiadomość wprowadzająca BYTE\_MASTER:**  
  ZNALEZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA  
* **Kostka dialogowa gracza (S05-K02):**  
  MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU MAILA Z CV?  
* **Odpowiedź BYTE\_MASTER na czacie:**  
  TEMAT MAILA POWINIEN ZAWIERAĆ ODPOWIEDNIO NAZWISKO ORAZ IMIĘ Z DOPISKIEM CV  
* **Dostępne kafelki tematów:**  
  * CV MICHAŁ WILK  
  * WILK CV  
  * ANALITYK MICHAŁ WILK  
* **Dostępne kafelki treści maila:**  
  * DZIEŃ DOBRY, PRZESYŁAM CV W ZWIĄZKU Z REKRUTACJĄ NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH. HASŁO DO PLIKU: WILK. POZDRAWIAM, MICHAŁ WILK  
  * HEJ, W ZAŁĄCZNIKU PRZESYŁAM CV. POZDRAWIAM, MICHAŁ WILK  
  * CZEŚĆ, PRZESYŁAM CV NA STANOWISKO ANALITYKA USŁUG ENERGETYCZNYCH. POZDRAWIAM, MICHAŁ WILK  
* **Teksty modułu VPN:**  
  * VPN \- DOPASUJ SWOJE IP, ABY UNIKNĄĆ WYKRYCIA  
  * POŻĄDANY ADRES IP: 109.43.200.124  
  * AKTUALNY ADRES IP: 106.55.202.120  
  * POPRZEDNI OKTET / NASTĘPNY OKTET / DOPASUJ W AI  
  * HACKERSBIOS 2.0 RELEASE 6.1 AI  
  * AI VERSION 1.7.4 / BYPASSING VPN SEQUENCE / FINISHED IN 0.8s  
  * POMYŚLNIE DOPASOWANO IP  
* **Dostępne adresy nadawców:**  
  * M.WILK@PRIV.COM  
  * ALEX@PRIV.COM  
  * NEWRAWGOODS@COMMERCIAL.BIZ  
* **Kostka dialogowa gracza (S05-K10):**  
  WSZYSTKO ZROBIONE. CZEKAMY AŻ OTWORZĄ CV I AKTYWUJĄ RANSOMWARE. JAK NIE PRZYJMIE MNIE DO DARKSUN, TO MOŻE DOSTANĘ PRACĘ W ENERGY ROCK  
* **Odpowiedź BYTE\_MASTER:**  
  KTO WIE?

