# **S04: Projektowanie wiadomości z żądaniem okupu**

# **Kontekst sceny**

* **Cel szkoleniowy:** Zrozumienie budowy i mechanizmów psychologicznych komunikatu ransomware (wywieranie presji czasu poprzez licznik odliczający termin, jasne żądanie finansowe w kryptowalucie, bezpośredni tytuł informujący o zablokowaniu dostępu do danych, dane do wpłaty oraz instrukcja kontaktu) oraz wpływu agresywnej kolorystyki (czerwony kolor ostrzegawczy) na wywołanie stresu i poczucia pilności u ofiary.  
* **Stan wejściowy:** Po zatwierdzeniu hasła w scenie S03, na głównym monitorze w oknie //BAZA\_WIRUSÓW otwiera się moduł projektowania komunikatu ransomware. Po lewej stronie pojawia się pionowy panel instrukcji z nagłówkiem „ZAPROJEKTUJ WIADOMOŚĆ DLA OFIARY / KROK 1 / PRZECIĄGNIJ INFORMACJE I KOMPONENTY NA GŁÓWNYM EKRANIE" z wyszarzonym przyciskiem „KONTYNUUJ". Na ekranie centralnym widoczny jest szablon okna z sześcioma oznaczonymi polami docelowymi, a pod nim zasobnik z ośmioma komponentami do wyboru. Na prawym ekranie czatu BYTE\_MASTER komentuje wygenerowanie silnego hasła.  
* **Odblokowane z wcześniejszych scen:** Skompilowany wirus ransomware (S02) oraz skonfigurowane, zatwierdzenie hasło szyfrujące o sile 5/5 (S03).  
* **Układ ekranu 2D:**  
  * **Lewa strona (panel boczny):** Pionowy panel instrukcji kroków projektowania. W Kroku 1 zawiera opis zadania oraz przycisk „KONTYNUUJ". W Kroku 2 zawiera nagłówek „KROK 2 / WYBIERZ KOLOR OKNA I ELEMENTÓW", trzy kwadratowe próbniki kolorów (zielony, czerwony, biały) oraz przycisk „KONTYNUUJ".  
  * **Środek (główny ekran roboczy):** W górnej części znajduje się ramka szablonu komunikatu z sześcioma slotami docelowymi w układzie 2 kolumny x 3 wiersze: \[IKONA\] i \[TYTUŁ WIADOMOŚCI\] u góry, \[CZAS\] i \[KWOTA\] w środku, \[ADRES\] i \[KONTAKT\] na dole. W dolnej części ekranu znajduje się zasobnik z ośmioma komponentami do przeciągnięcia.  
  * **Prawa strona:** Pionowy ekran komunikatora z nagłówkiem BYTE\_MASTER.  
* **Elementy sceny:**  
  * **Szablon komunikatu dla ofiary:** Prostokątne okno z szarymi obrysami slotów i podpisami: IKONA, TYTUŁ WIADOMOŚCI, CZAS, KWOTA, ADRES, KONTAKT.  
  * **Komponenty w zasobniku (dolna część ekranu głównego):**  
    * POZOSTAŁY CZAS: 00:30:00:00 (licznik z czasem 30 dni/godzin, zielono-czerwony wskaźnik słupkowy)  
    * POZOSTAŁY CZAS: 00:00:30:00 (licznik z czasem 30 sekund/minut – opcja błędna/nierealistyczna)  
    * TWOJE PLIKI ZOSTAŁY ZASZYFROWANE\! (bezpośredni, profesjonalny komunikat informacyjny)  
    * CZEKAM NA BITCOINY\! (nagłówek potoczny/nieprofesjonalny – opcja alternatywna)  
    * KWOTA: \$ 200 000 (kafelek z kwotą w dolarach i symbolem Bitcoina)  
    * Kafelek ikony (niebieska grafika kłódki nałożonej na monitor/dysk)  
    * ADRES: XHAJ1023KJDF93 (ciąg znaków reprezentujący adres portfela kryptowalutowego)  
    * NAPISZ DO NAS (przycisk kontaktu z grafiką postaci w kapturze)  
  * **Próbniki koloru (Krok 2 na lewym panelu):** Trzy kwadratowe przyciski wyboru barwy: ZIELONY (lewy), CZERWONY (środkowy), BIAŁY (prawy).  
  * **Ekran końcowy „WIRUS GOTOWY\!":** Ciemnozielona plansza systemowa z nagłówkiem WIRUS GOTOWY\!, podtytułem AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY oraz zielonym przyciskiem KONTYNUUJ.

# **Kroki**

## **S04-K01: Umieszczenie licznika czasu w szablonie**

* **Obserwacja (VR):** Gracz analizuje dostępne elementy w dolnej części ekranu. Chwyta wiązką lasera kafelek POZOSTAŁY CZAS: 00:30:00:00 i przeciąga go w pole oznaczone etykietą CZAS (środkowy wiersz, lewa kolumna). Kafelek zostaje zablokowany w slocie.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** 8 komponentów w dolnym zasobniku, sloty w szablonie komunikatu  
  * **Widoczne, ale nieaktywne:** przycisk „KONTYNUUJ" na lewym panelu instrukcji, prawy ekran komunikatora z komentarzem BYTE\_MASTER  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** W zasobniku widoczne są dwa liczniki czasu. Licznik 00:30:00:00 daje ofierze realny czas na zebranie środków i kontakt (30 dni/godzin), podczas gdy 00:00:30:00 (30 sekund) uniemożliwiłby jakąkolwiek reakcję. Slot CZAS podświetla się, gdy gracz zbliża do niego odpowiedni komponent.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek POZOSTAŁY CZAS: 00:30:00:00 do slotu CZAS.  
* **Niewybrane opcje:** POZOSTAŁY CZAS: 00:00:30:00 – skutek wyboru: poza nagraniem (nierealistyczny termin wymuszenia).  
* **Informacja zwrotna:** Dźwięk upuszczenia elementu; kafelek dopasowuje się do rozmiaru slotu CZAS.  
* **Zmiana sceny:** Slot CZAS zostaje wypełniony; wybrany kafelek znika z dolnego zasobnika.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** komponenty w dolnym zasobniku oraz 6 slotów docelowych w oknie podglądu.  
  * **Jak przenieść prowadzenie:** technika drag-and-drop z wyraźnym podświetleniem obramowania slotu pasującego do przeciąganego typu elementu (lub kliknięcie komponentu, a następnie kliknięcie slotu).  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (delikatne pulsowanie slotu CZAS i pasującego komponentu), poziom 2 po czasie T2 (komunikat: „Przeciągnij licznik dający ofierze czas na reakcję do pola CZAS").  
* **Kryterium ukończenia:** Poprawne umieszczenie komponentu POZOSTAŁY CZAS: 00:30:00:00 w slocie CZAS.

## **S04-K02: Umieszczenie tytułu wiadomości**

* **Obserwacja (VR):** Gracz chwyta kafelek TWOJE PLIKI ZOSTAŁY ZASZYFROWANE\! i przeciąga go do slotu TYTUŁ WIADOMOŚCI (górny wiersz, prawa kolumna).  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** pozostałe 7 komponentów w zasobniku, 5 pustych slotów  
  * **Widoczne, ale nieaktywne:** przycisk „KONTYNUUJ" na lewym panelu  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Wśród dostępnych opcji są dwa nagłówki tekstowe: bezpośredni i profesjonalny TWOJE PLIKI ZOSTAŁY ZASZYFROWANE\! oraz potoczny CZEKAM NA BITCOINY\!. Atakujący potrzebuje komunikatu natychmiast informującego ofiarę o problemie technicznym.  
* **Akcja gracza (z nagrania):** Przeciąga TWOJE PLIKI ZOSTAŁY ZASZYFROWANE\! do slotu TYTUŁ WIADOMOŚCI.  
* **Niewybrane opcje:** CZEKAM NA BITCOINY\! – skutek wyboru: poza nagraniem.  
* **Informacja zwrotna:** Dźwięk dopasowania; osadzenie tekstu tytułu w górnym panelu.  
* **Zmiana sceny:** Slot TYTUŁ WIADOMOŚCI zostaje zablokowany jako wypełniony.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** zasobnik komponentów, sloty docelowe.  
  * **Kryterium ukończenia:** Umieszczenie kafelka TWOJE PLIKI ZOSTAŁY ZASZYFROWANE\! w slocie TYTUŁ WIADOMOŚCI.

## **S04-K03: Umieszczenie żądanej kwoty okupu**

* **Obserwacja (VR):** Gracz chwyta kafelek KWOTA: \$ 200 000 (z symbolem Bitcoina) i przeciąga go do slotu KWOTA (środkowy wiersz, prawa kolumna).  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** pozostałe komponenty, 4 puste sloty  
  * **Widoczne, ale nieaktywne:** przycisk „KONTYNUUJ" na lewym panelu  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Kafelek z kwotą jest jedynym elementem zawierającym wartość pieniężną w zasobniku, co jednoznacznie wskazuje jego przeznaczenie do slotu KWOTA.  
* **Akcja gracza (z nagrania):** Przeciąga KWOTA: \$ 200 000 do slotu KWOTA.  
* **Niewybrane opcje:** brak innych opcji kwoty.  
* **Informacja zwrotna:** Dźwięk upuszczenia; komponent zostaje osadzony w oknie.  
* **Zmiana sceny:** Slot KWOTA zostaje wypełniony.  
* **Adaptacja web (2D, mysz):**  
  * **Kryterium ukończenia:** Umieszczenie kafelka KWOTA: \$ 200 000 w slocie KWOTA.

## **S04-K04: Umieszczenie ikony graficznej**

* **Obserwacja (VR):** Gracz chwyta kafelek graficzny przedstawiający kłódkę na monitorze komputera i przeciąga go do kwadratowego slotu IKONA (górny wiersz, lewa kolumna).  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** pozostałe komponenty, 3 puste sloty  
  * **Widoczne, ale nieaktywne:** przycisk „KONTYNUUJ" na lewym panelu  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Kształt kafelka (kwadrat) oraz brak tekstu jednoznacznie odpowiadają kwadratowemu slotowi IKONA obok nagłówka wiadomości.  
* **Akcja gracza (z nagrania):** Przeciąga grafikę kłódki do slotu IKONA.  
* **Niewybrane opcje:** brak innych kafelków graficznych.  
* **Informacja zwrotna:** Dźwięk dopasowania; wyświetlenie grafiki w lewym górnym rogu komunikatu.  
* **Zmiana sceny:** Slot IKONA zostaje zablokowany jako wypełniony.  
* **Adaptacja web (2D, mysz):**  
  * **Kryterium ukończenia:** Umieszczenie ikony kłódki w slocie IKONA.

## **S04-K05: Umieszczenie adresu portfela**

* **Obserwacja (VR):** Gracz chwyta kafelek ADRES: XHAJ1023KJDF93 i przeciąga go do slotu ADRES (dolny wiersz, lewa kolumna).  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** pozostałe komponenty, 2 puste sloty  
  * **Widoczne, ale nieaktywne:** przycisk „KONTYNUUJ" na lewym panelu  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Etykieta kafelka ADRES: dosłownie odpowiada nazwie slotu docelowego.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek z adresem portfela do slotu ADRES.  
* **Niewybrane opcje:** brak innych opcji adresu.  
* **Informacja zwrotna:** Dźwięk upuszczenia; zakotwiczenie adresu w lewym dolnym rogu okna.  
* **Zmiana sceny:** Slot ADRES zostaje wypełniony.  
* **Adaptacja web (2D, mysz):**  
  * **Kryterium ukończenia:** Umieszczenie kafelka z adresem w slocie ADRES.

## **S04-K06: Umieszczenie przycisku kontaktu**

* **Obserwacja (VR):** Gracz chwyta ostatni wymagany kafelek NAPISZ DO NAS z awatarem postaci i przeciąga go do slotu KONTAKT (dolny wiersz, prawa kolumna). Po osadzeniu ostatniego elementu przycisk KONTYNUUJ na lewym panelu natychmiast podświetla się na zielono.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** kafelek NAPISZ DO NAS, slot KONTAKT  
  * **Pozostałe niewybrane w zasobniku:** CZEKAM NA BITCOINY\!, POZOSTAŁY CZAS: 00:00:30:00  
  * **Element odblokowany:** przycisk KONTYNUUJ na lewym panelu instrukcji  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Jest to ostatni pusty slot w szablonie. Po jego wypełnieniu gra natychmiast aktywuje przycisk przejścia dalej na lewym panelu (zmiana koloru z szarego na intensywną zieleń), dając jasny sygnał o zakończeniu fazy układania.  
* **Akcja gracza (z nagrania):** Przeciąga kafelek NAPISZ DO NAS do slotu KONTAKT.  
* **Niewybrane opcje (pozostawione w zasobniku):**  
  * CZEKAM NA BITCOINY\! – skutek wyboru: poza nagraniem  
  * POZOSTAŁY CZAS: 00:00:30:00 – skutek wyboru: poza nagraniem  
* **Informacja zwrotna:** Dźwięk upuszczenia; dźwięk aktywacji przycisku; przycisk KONTYNUUJ na lewym panelu zmienia kolor na zielony.  
* **Zmiana sceny:** Wszystkie 6 slotów szablonu jest zapełnionych; przycisk KONTYNUUJ staje się klikalny.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** odblokowany przycisk KONTYNUUJ na panelu instrukcji.  
  * **Kryterium ukończenia:** Zapełnienie wszystkich 6 slotów szablonu i aktywacja przycisku KONTYNUUJ.

## **S04-K07: Zatwierdzenie układu komponentów (Krok 1\)**

* **Obserwacja (VR):** Gracz przesuwa wskaźnik na lewy panel boczny i klika zielony przycisk KONTYNUUJ.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk KONTYNUUJ na lewym panelu  
  * **Widoczne, ale zablokowane:** zapełniony szablon na ekranie głównym, pozostałe niewykorzystane komponenty w zasobniku  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Zielony przycisk jest jedynym aktywnym elementem interakcji po ukończeniu Kroku 1\.  
* **Akcja gracza (z nagrania):** Klika KONTYNUUJ na lewym panelu.  
* **Niewybrane opcje:** brak innych akcji.  
* **Informacja zwrotna:** Dźwięk kliknięcia i zatwierdzenia; animacja przełączenia lewego panelu na Krok 2\.  
* **Zmiana sceny:** Dolny zasobnik z nieużywanymi komponentami znika. Lewy panel zmienia nagłówek na KROK 2 / WYBIERZ KOLOR OKNA I ELEMENTÓW i wyświetla trzy kwadraty kolorów (zielony, czerwony, biały) oraz przycisk KONTYNUUJ.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk KONTYNUUJ.  
  * **Kryterium ukończenia:** Kliknięcie przycisku KONTYNUUJ i wyświetlenie widoku wyboru koloru (Krok 2).

## **S04-K08: Wybór koloru okna komunikatu (Wybór 4\)**

* **Obserwacja (VR):** Na lewym panelu gracz widzi trzy próbniki kolorów: zielony, czerwony i biały. Klika środkowy, czerwony kwadrat. Ramki, nagłówek i tła slotów w oknie podglądu na głównym ekranie natychmiast zmieniają kolor z niebieskiego na jaskrawy czerwony. Następnie gracz klika próbnik zielony (okno zmienia kolor na zielony), próbnik biały (okno zmienia kolor na biały) i ostatecznie ponownie klika próbnik CZERWONY, pozostawiając okno w barwach czerwonych.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:**  
    * Kwadrat ZIELONY (lewy)  
    * Kwadrat CZERWONY (środkowy)  
    * Kwadrat BIAŁY / SZARY (prawy)  
    * Przycisk KONTYNUUJ na dole lewego panelu  
  * **Widoczne:** podgląd zaprojektowanego okna w czasie rzeczywistym na ekranie głównym  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Podgląd na głównym monitorze na bieżąco reaguje na kliknięcie każdego z próbników. Cel dydaktyczny i psychologiczny ataku ransomware polega na wywołaniu u ofiary poczucia zagrożenia, stanu alarmowego i paniki – co najlepiej osiąga kolor czerwony (kojarzony uniwersalnie z alarmem i awarią krytyczną), w przeciwieństwie do uspokajającego zielonego czy neutralnego białego.  
* **Akcja gracza (z nagrania):** Klika czerwony próbnik koloru, ustawiając czerwony motyw okna.  
* **Niewybrane opcje (odrzucone):**  
  * Kolor ZIELONY – skutek wyboru: poza nagraniem (obniżenie oceny w podsumowaniu)  
  * Kolor BIAŁY – skutek wyboru: poza nagraniem (obniżenie oceny w podsumowaniu)  
* **Informacja zwrotna:** Dźwięk zmiany motywu; natychmiastowa zmiana koloru obramowań i podświetleń w oknie podglądu na kolor czerwony.  
* **Zmiana sceny:** Szablon wiadomości przyjmuje czerwony schemat kolorystyczny; przycisk KONTYNUUJ jest gotowy do finalizacji.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** trzy klikalne kafle kolorów oraz przycisk KONTYNUUJ.  
  * **Jak przenieść prowadzenie:** natychmiastowa reakcja podglądu okna na kliknięcie koloru, z zaznaczeniem aktywnego próbnika (np. biała obwódka wokół wybranego kwadratu).  
  * **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (pulsowanie czerwonego próbnika koloru), poziom 2 po czasie T2 (komunikat: „Wybierz kolor kojarzący się z alarmem i wywołujący największą presję psychologiczną na ofierze").  
* **Kryterium ukończenia:** Wybranie koloru CZERWONEGO jako aktywnego motywu okna komunikatu.

## **S04-K09: Zatwierdzenie wyglądu wiadomości (Krok 2\)**

* **Obserwacja (VR):** Mając ustawiony czerwony kolor okna, gracz klika zielony przycisk KONTYNUUJ na dole lewego panelu.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk KONTYNUUJ  
  * **Widoczne:** próbniki kolorów, czerwone okno podglądu  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk KONTYNUUJ zamyka proces projektowania i przechodzi do kompilacji gotowego pakietu wirusa.  
* **Akcja gracza (z nagrania):** Klika KONTYNUUJ na lewym panelu.  
* **Niewybrane opcje:** brak innych opcji.  
* **Informacja zwrotna:** Dźwięk zatwierdzenia sukcesu; zniknięcie lewego panelu instrukcji oraz okna edytora.  
* **Zmiana sceny:** Znika lewy panel i okno szablonu. Na środku głównego ekranu wyświetla się plansza z napisem WIRUS GOTOWY\! / AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY oraz przyciskiem KONTYNUUJ.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk KONTYNUUJ.  
  * **Kryterium ukończenia:** Kliknięcie przycisku KONTYNUUJ, zapisanie wyniku Wyboru nr 4 (Kolor okna / elementów: CZERWONY – 100% wyniku) i wyświetlenie ekranu gotowości wirusa.

## **S04-K10: Zamknięcie powiadomienia o gotowości wirusa i powrót do pulpitu**

* **Obserwacja (VR):** Gracz klika zielony przycisk KONTYNUUJ na planszy WIRUS GOTOWY\!. Plansza znika, a gracz powraca do pulpitu //HACKERS.OS. Na pulpicie pojawiła się nowa ikona //WIRUS: RANSOMWARE (w górnym rzędzie po prawej), a na prawym ekranie czatu BYTE\_MASTER przysyła nowe wytyczne dotyczące ataku e-mailowego.  
* **Dostępne w tym momencie:**  
  * **Aktywne opcje:** przycisk KONTYNUUJ na ekranie głównym  
  * **Widoczne, ale nieaktywne:** tło okna systemowego  
* **Intencja:**  
  * **Jak VR prowadzi gracza:** Przycisk KONTYNUUJ jest jedynym elementem na ekranie.  
* **Akcja gracza (z nagrania):** Klika przycisk KONTYNUUJ.  
* **Niewybrane opcje:** brak innych akcji.  
* **Informacja zwrotna:** Dźwięk kliknięcia; powrót do pulpitu systemowego; dźwięk powiadomienia nowej wiadomości na czacie od BYTE\_MASTER.  
* **Zmiana sceny:** Znika aplikacja BAZA WIRUSÓW. Na pulpicie //HACKERS.OS odblokowuje się nowa ikona //WIRUS: RANSOMWARE z fioletową kłódką. Na prawym ekranie czatu pojawia się nowa wiadomość od mentora wprowadzająca do sceny S05.  
* **Adaptacja web (2D, mysz):**  
  * **Aktywne elementy:** przycisk KONTYNUUJ.  
  * **Kryterium ukończenia:** Kliknięcie KONTYNUUJ, powrót do pulpitu z widoczną ikoną skompilowanego wirusa oraz odebranie nowej wiadomości na czacie.

W wersji VR proces projektowania rozbity jest na trzy oddzielne płaszczyzny w przestrzeni: lewy panel instrukcji z przyciskiem KONTYNUUJ i wyborem koloru, centralny monitor z szablonem i zasobnikiem oraz prawy ekran czatu z komentarzami mentora. W adaptacji 2D należy zdecydować o układzie interfejsu: czy panel instrukcji/kolorów umieścić w jednym oknie obok szablonu (np. boczny pasek narzędziowy z lewej strony okna aplikacji), czy prowadzić gracza w trybie kreatora krok po kroku (Krok 1: przeciąganie na pełnym ekranie \-\> Krok 2: modal/panel wyboru koloru).

# **Stan po scenie**

* Skompilowany i w pełni skonfigurowany wirus ransomware (ustawione hasło, treść komunikatu, kolor czerwony).  
* Zapisany idealny wynik Wyboru nr 4 (Wybierz kolor okna / elementów: CZERWONY).  
* Nowy element na pulpicie //HACKERS.OS: ikona //WIRUS: RANSOMWARE (fioletowa kłódka).  
* Nowa wiadomość na czacie od BYTE\_MASTER: „ZNALEZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA" (punkt wyjścia dla sceny S05).

# **Dialogi i teksty w scenie**

* **Komentarz BYTE\_MASTER na czacie na początku sceny:**  
  „GDYBY LUDZIE W RZECZYWISTOŚCI TWORZYLI TAK SILNE HASŁA, TO O WIELE RZADZIEJ SŁYSZAŁOBY SIĘ O KRADZIEŻY DANYCH"  
* **Treści komponentów komunikatu dla ofiary:**  
  * POZOSTAŁY CZAS: 00:30:00:00  
  * POZOSTAŁY CZAS: 00:00:30:00  
  * TWOJE PLIKI ZOSTAŁY ZASZYFROWANE\!  
  * CZEKAM NA BITCOINY\!  
  * KWOTA: \$ 200 000  
  * Ikona: grafika kłódki na monitorze  
  * ADRES: XHAJ1023KJDF93  
  * NAPISZ DO NAS  
* **Treść lewego panelu instrukcji:**  
  * Krok 1: ZAPROJEKTUJ WIADOMOŚĆ DLA OFIARY / KROK 1 / PRZECIĄGNIJ INFORMACJE I KOMPONENTY NA GŁÓWNYM EKRANIE / KONTYNUUJ  
  * Krok 2: ZAPROJEKTUJ WIADOMOŚĆ DLA OFIARY / KROK 2 / WYBIERZ KOLOR OKNA I ELEMENTÓW / \[ZIELONY\] \[CZERWONY\] \[BIAŁY\] / KONTYNUUJ  
* **Ekran gotowości wirusa:**  
  WIRUS GOTOWY\!  
  AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY  
  KONTYNUUJ  
* **Wiadomość BYTE\_MASTER po zakończeniu sceny:**  
  „ZNALEZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA"

