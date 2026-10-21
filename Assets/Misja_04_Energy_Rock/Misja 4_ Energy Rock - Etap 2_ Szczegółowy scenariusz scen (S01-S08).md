# **S01: Wybór zadania i odprawa z BYTE\_MASTER**

# **Kontekst sceny**

* **Cel szkoleniowy:** Zrozumienie założeń ataku łączącego socjotechnikę (spear-phishing) z oprogramowaniem ransomware oraz roli legendy (przykrywki finansowej) w uwiarygodnieniu działań atakującego i ukryciu właściwego celu (kradzieży danych technologii Freevolt).  
* **Stan wejściowy:** Gracz znajduje się przed głównym zakrzywionym ekranem z otwartym menu `DARKNET`. Na górnym pasku widnieje stan konta `BITCOINY: 9,52 B`, wskaźnik `CERTYFIKAT UKOŃCZENIA: 4/10` oraz przycisk `BAZA WIEDZY`. Poniżej widoczna jest pozioma karuzela kart zleceń: po lewej `ZADANIE 3 UKOŃCZONO: O&L Company (100%, 4,02 B)`, na środku `ZADANIE 4: Energy Rock (BYTE_MASTER, MUSISZ ZASZYFROWAĆ SERWERY ZA POMOCĄ RANSOMWARE, NAGRODA: 3,79 B, przycisk ROZPOCZNIJ)`, po prawej `ZADANIE 5: BANK BCORP (NAGRODA: 2,96 B, przycisk ROZPOCZNIJ)` oraz fragment `ZADANIA 6`. Pod ekranem głównym znajduje się zielony pasek `PROGRES WSZYSTKICH ZLECEŃ`.  
* **Układ ekranu 2D:** Centralną część zajmuje główne okno systemowe (`DARKNET`, a po odebraniu połączenia okno komunikatora wideo/czatu z `BYTE_MASTER` na tle sylwetki hakera w kapturze i przesuwającego się kodu). W dolnej części przed ekranem pojawia się strefa odpowiedzi gracza (w VR: lewitująca kostka 3D).  
* **Elementy sceny:**  
  * Karta `ZADANIE 4: Energy Rock` – fioletowo-niebieski kontur, ikona `BYTE_MASTER`, logo firmy Energy Rock, opis zadania, kwota nagrody `3,79 B` i niebieski przycisk `ROZPOCZNIJ`.  
  * Ekran połączenia przychodzącego – okrągły niebieski awatar hakera ze znakiem zapytania, napis `BYTE_MASTER`, zielony napis `POŁĄCZENIE PRZYCHODZĄCE` i zielony przycisk `ODBIERZ`.  
  * Okno rozmowy `BYTE_MASTER` – nagłówek z licznikiem czasu połączenia (`POŁĄCZONO 00:00`), ciemna sylwetka rozmówcy w tle, lista dymków czatu (wiadomości mentora po lewej z niebieską ikoną, wiadomości gracza po prawej z pomarańczową ikoną).  
  * Niebieskie kostki odpowiedzi 3D – półprzezroczyste prostopadłościany z ikoną dłoni po lewej stronie, ikoną `(i)` w lewym górnym rogu oraz tekstem odpowiedzi na środku.  
  * Przycisk `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS` – zielony przycisk na dole okna rozmowy, pojawiający się po zakończeniu dialogu.

# **Kroki**

## **S01-K01: Wybór Zadania 4 (Energy Rock)**

**Obserwacja (VR):** Gracz kieruje zieloną wiązkę lasera na kartę `ZADANIE 4: Energy Rock` i klika przycisk ROZPOCZNIJ. Pozostałe karty znikają, a po chwili karta zadania zamienia się w ekran połączenia przychodzącego.

**Dostępne w tym momencie:**

* **Aktywne opcje:** przycisk `ROZPOCZNIJ` na karcie `ZADANIE 4: Energy Rock`, przycisk `PODSUMOWANIE` na karcie `ZADANIE 3`, przycisk `ROZPOCZNIJ` na karcie `ZADANIE 5`, przycisk `BAZA WIEDZY`  
* **Widoczne, ale nieaktywne:** pasek `PROGRES WSZYSTKICH ZLECEŃ`, licznik `BITCOINY: 9,52 B`, wskaźnik `CERTYFIKAT UKOŃCZENIA: 4/10`

**Intencja:**

* **Jak VR prowadzi gracza:** Karta `ZADANIE 4` znajduje się dokładnie w centrum pola widzenia gracza i jest pierwszym nieukończonym zadaniem po ukończonym `ZADANIU 3`. Niebieski przycisk `ROZPOCZNIJ` wyraźnie odcina się od ciemnego tła karty.

**Akcja gracza (z nagrania):** Klika przycisk `ROZPOCZNIJ` pod kartą `ZADANIE 4: Energy Rock`.

**Niewybrane opcje:** `ZADANIE 3 (PODSUMOWANIE)`, `ZADANIE 5 (ROZPOCZNIJ)`, `BAZA WIEDZY`; skutek wyboru: poza nagraniem.

Informacja zwrotna: Dźwięk kliknięcia interfejsu; podświetlenie przycisku ROZPOCZNIJ.

Zmiana sceny: Boczne karty zadań oraz dolny pasek postępu znikają. Karta `ZADANIE 4` pozostaje przez chwilę sama na środku ekranu, po czym przechodzi w widok BYTE\_MASTER – POŁĄCZENIE PRZYCHODZĄCE z przyciskiem `ODBIERZ`.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk `ROZPOCZNIJ` na karcie `ZADANIE 4` (lub bezpośrednie uruchomienie modułu SCORM od ekranu połączenia przychodzącego, jeśli wybór misji odbywa się w LMS).  
* **Jak przenieść prowadzenie:** Wyśrodkowanie karty `ZADANIE 4` i wyróżnienie przycisku `ROZPOCZNIJ` efektem hover oraz delikatnym pulsowaniem obramowania.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – pulsowanie przycisku `ROZPOCZNIJ` na karcie `Energy Rock`; poziom 2 po czasie T2 – wyświetlenie etykiety „Kliknij ROZPOCZNIJ, aby przejść do Zadania 4".

**Kryterium ukończenia:** Kliknięcie przycisku `ROZPOCZNIJ` na karcie `ZADANIE 4`; przejście widoku do ekranu `POŁĄCZENIE PRZYCHODZĄCE`.

## **S01-K02: Odebranie połączenia od BYTE\_MASTER**

**Obserwacja (VR):** Na ekranie głównym pulsuje ikona BYTE\_MASTER z napisem POŁĄCZENIE PRZYCHODZĄCE. Gracz wskazuje laserem zielony przycisk ODBIERZ i klika go.

**Dostępne w tym momencie:**

* **Aktywne opcje:** przycisk `ODBIERZ`  
* **Widoczne, ale nieaktywne:** awatar `BYTE_MASTER`, ikona znaku zapytania `?` w lewym górnym rogu ekranu

**Intencja:**

* **Jak VR prowadzi gracza:** Na ekranie znajduje się wyłącznie jeden aktywny przycisk (`ODBIERZ`) umieszczony centralnie pod napisem `POŁĄCZENIE PRZYCHODZĄCE`, czemu towarzyszy dźwięk dzwonka/połączenia.

**Akcja gracza (z nagrania):** Klika przycisk `ODBIERZ`.

**Niewybrane opcje:** brak innych opcji.

**Informacja zwrotna:** Dźwięk odebrania połączenia; zmiana koloru ramki ekranu z zielonej na niebieską.

Zmiana sceny: Ekran połączenia przychodzącego znika. Pojawia się okno rozmowy z sylwetką hakera w tle, licznikiem czasu POŁĄCZONO 00:00, a po 2 sekundach z dźwiękiem pisania na klawiaturze wyświetla się pierwsza wiadomość od BYTE\_MASTER: „MAMY PROBLEM". Chwilę później przed graczem materializuje się niebieska kostka odpowiedzi.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** wyłącznie przycisk `ODBIERZ`.  
* **Jak przenieść prowadzenie:** Centralny przycisk `ODBIERZ` z pulsującą zieloną ramką i dźwiękiem przychodzącego połączenia.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – silniejsze pulsowanie przycisku `ODBIERZ`; poziom 2 po czasie T2 – podpowiedź tekstowa „Odbierz połączenie od BYTE\_MASTER".

**Kryterium ukończenia:** Kliknięcie przycisku ODBIERZ; otwarcie okna rozmowy i wyświetlenie wiadomości „MAMY PROBLEM".

## **S01-K03: Odpowiedź „CO SIĘ STAŁO?"**

Obserwacja (VR): Po wyświetleniu wiadomości „MAMY PROBLEM" przed graczem po lewej stronie na dole pojawia się niebieska kostka 3D z napisem `CO SIĘ STAŁO?` oraz dymek instruktażowy przy ikonie (i): „ZBLIŻ RĘKĘ DO KOSTKI, ZŁAP JĄ WCISKAJĄC PRZYCISK GRIP I RZUĆ W KIERUNKU EKRANU". Gracz chwyta kostkę prawym kontrolerem i rzuca nią w ekran rozmowy.

**Dostępne w tym momencie:**

* **Aktywne opcje:** kostka dialogowa `CO SIĘ STAŁO?`  
* **Widoczne, ale nieaktywne:** okno rozmowy z wiadomością „MAMY PROBLEM", ikona `(i)` z instrukcją chwytania

**Intencja:**

* **Jak VR prowadzi gracza:** Pojawieniu się kostki towarzyszy charakterystyczny dźwięk materializacji oraz jasna niebieska poświata blisko dłoni gracza. Instrukcja obok kostki wprost opisuje wymaganą akcję fizyczną.

**Akcja gracza (z nagrania):** Chwyta kostkę `CO SIĘ STAŁO?` i rzuca ją w ekran rozmowy.

**Niewybrane opcje:** brak innych opcji.

Informacja zwrotna: Energetyczny dźwięk podczas trzymania kostki; niebieski rozbłysk i dźwięk uderzenia/wysłania w momencie trafienia kostki w ekran.

Zmiana sceny: Kostka znika z przestrzeni. W oknie czatu po prawej stronie pojawia się dymek gracza CO SIĘ STAŁO?. Po chwili BYTE\_MASTER odpisuje (z dźwiękiem pisania): „BRAKUJE KILKU WAŻNYCH PLIKÓW NA TEMAT FREEVOLT. MUSIMY JE ZNALEŹĆ. Z DANYCH, WYKRADZIONYCH Z PETROLOG WYNIKA, ŻE MOGĄ ZNAJDOWAĆ SIĘ W RĘKACH ENERGY ROCK \- JEDNEJ Z NAJWIĘKSZYCH FIRM, ZAJMUJĄCYCH SIĘ MAGAZYNOWANIEM I ZARZĄDZANIEM ZAPASAMI PALIWOWYMI". Następnie przed graczem pojawia się kolejna kostka.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk/kafelek odpowiedzi `CO SIĘ STAŁO?` w dolnej sekcji okna komunikatora.  
* **Jak przenieść prowadzenie:** Pojawienie się przycisku odpowiedzi z animacją wejścia i podświetleniem po zakończeniu animacji pisania wiadomości przez `BYTE_MASTER`.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – delikatne pulsowanie obramowania przycisku odpowiedzi; poziom 2 po czasie T2 – wskazanie przycisku kursorem pomocniczym lub komunikatem „Kliknij odpowiedź, aby kontynuować rozmowę".

**Kryterium ukończenia:** Wysłanie wiadomości `CO SIĘ STAŁO?`; wyświetlenie odpowiedzi `BYTE_MASTER` o firmie Energy Rock i plikach Freevolt.

**\[DO DECYZJI\]:** W VR interakcja polega na fizycznym chwyceniu kostki 3D w przestrzeni i rzuceniu jej w ekran. Mechanika ta opiera się na ruchu ręki w przestrzeni 3D i nie przenosi się wprost na sterowanie myszą w 2D. Celem szkoleniowym kroku jest wyłącznie utrzymanie uwagi gracza podczas przekazywania kontekstu fabularnego i celu ataku.

## **S01-K04: Odpowiedź „CO DOKŁADNIE MAM ZROBIĆ?"**

Obserwacja (VR): Przed graczem znajduje się kostka CO DOKŁADNIE MAM ZROBIĆ?. Gracz czyta wiadomość na ekranie, po czym chwyta kostkę i rzuca ją w ekran.

**Dostępne w tym momencie:**

* **Aktywne opcje:** kostka dialogowa `CO DOKŁADNIE MAM ZROBIĆ?`  
* **Widoczne, ale nieaktywne:** historia czatu na ekranie

**Intencja:**

* **Jak VR prowadzi gracza:** Jedna podświetlona kostka w zasięgu ręki przed ekranem.

**Akcja gracza (z nagrania):** Chwyta kostkę CO DOKŁADNIE MAM ZROBIĆ? i rzuca ją w ekran.

Niewybrane opcje: brak innych opcji.

Informacja zwrotna: Dźwięk uchwycenia i rozbicia kostki na ekranie; niebieski rozbłysk.

Zmiana sceny: W oknie czatu pojawia się wypowiedź gracza CO DOKŁADNIE MAM ZROBIĆ?. BYTE\_MASTER przesyła kolejno dwie wiadomości:

1. „MAJĄ CAŁKIEM DOBRE ZABEZPIECZENIA, WIĘC MUSIMY WYMYŚLIĆ JAKIŚ WIARYGODNY SPOSÓB NA WEJŚCIE. MYŚLĘ, ŻE NAJLEPIEJ ZNOWU POBAWIĆ SIĘ SOCJOTECHNIKAMI I WYKORZYSTAĆ BŁĄD LUDZKI"  
2. „POZA TYM W SIECI KRĄŻĄ TEŻ PLOTKI O TYM, ŻE KTOŚ WYKRADA PLIKI TECHNOLOGII FREEVOLT, WIĘC POTRZEBUJEMY NAPRAWDĘ DOBREJ PRZYKRYWKI"  
   Po drugiej wiadomości przed graczem pojawia się nowa kostka.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk odpowiedzi `CO DOKŁADNIE MAM ZROBIĆ?`.  
* **Jak przenieść prowadzenie:** Podświetlony przycisk odpowiedzi pod oknem czatu.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – pulsowanie przycisku odpowiedzi; poziom 2 po czasie T2 – komunikat „Kliknij odpowiedź, aby kontynuować rozmowę".

**Kryterium ukończenia:** Wysłanie wiadomości `CO DOKŁADNIE MAM ZROBIĆ?`; wyświetlenie dwóch wiadomości `BYTE_MASTER` o socjotechnice i potrzebie przykrywki.

**\[DO DECYZJI\]:** Fizyczny rzut kostką 3D w ekran (analogicznie do kroku S01-K03).

## **S01-K05: Odpowiedź o wykorzystaniu ransomware**

**Obserwacja (VR):** Przed graczem wisi kostka z tekstem `Z TECHNICZNEGO PUNKTU WIDZENIA MOŻEMY WYKORZYSTAĆ RANSOMWARE. NIE DOŚĆ, ŻE UZYSKAMY DOSTĘP DO DANYCH, TO JESZCZE ZASZYFRUJEMY JE I UNIEMOŻLIWIMY IM PRACĘ`. Gracz chwyta ją i rzuca w ekran.

**Dostępne w tym momencie:**

* **Aktywne opcje:** kostka dialogowa `Z TECHNICZNEGO PUNKTU WIDZENIA MOŻEMY WYKORZYSTAĆ RANSOMWARE...`  
* **Widoczne, ale nieaktywne:** historia czatu na ekranie

**Intencja:**

* **Jak VR prowadzi gracza:** Pojedyncza kostka dialogowa w zasięgu ręki. Tekst na kostce definiuje narzędzie ataku (ransomware), którego gracz użyje w kolejnej scenie.

**Akcja gracza (z nagrania):** Chwyta kostkę i rzuca ją w ekran.

**Niewybrane opcje:** brak innych opcji.

Informacja zwrotna: Dźwięk rzutu i rozbłysk na ekranie.

**Zmiana sceny:** Wypowiedź gracza trafia na czat. `BYTE_MASTER` odpowiada: „WIDZĘ, ŻE PROWADZĄ REKRUTACJĘ NA KILKA STANOWISK. MÓGŁBYŚ PODESŁAĆ IM ZAINFEKOWANE CV". Przed graczem pojawia się następna kostka.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk odpowiedzi `Z TECHNICZNEGO PUNKTU WIDZENIA MOŻEMY WYKORZYSTAĆ RANSOMWARE...`.  
* **Jak przenieść prowadzenie:** Aktywny przycisk odpowiedzi na dole okna czatu.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – pulsowanie przycisku; poziom 2 po czasie T2 – komunikat „Kliknij odpowiedź, aby kontynuować".

**Kryterium ukończenia:** Wysłanie wiadomości o wykorzystaniu ransomware; wyświetlenie odpowiedzi `BYTE_MASTER` o rekrutacji i zainfekowanym CV.

\[DO DECYZJI\]: Fizyczny rzut kostką 3D w ekran (analogicznie do kroku S01-K03).

## **S01-K06: Odpowiedź o przykrywce (wyłudzenie okupu)**

Obserwacja (VR): Przed graczem pojawia się kostka z napisem `A CO Z PRZYKRYWKĄ? MOŻE WYŁUDZENIE OKUPU? ZASZANTAŻUJEMY ICH, ŻE UPUBLICZNIMY HANIEBNE ZANIEDBANIA PROCEDUR BEZPIECZEŃSTWA W ICH FIRMIE I TAKIE TAM`. Gracz chwyta kostkę i rzuca ją w ekran.

**Dostępne w tym momencie:**

* **Aktywne opcje:** kostka dialogowa `A CO Z PRZYKRYWKĄ? MOŻE WYŁUDZENIE OKUPU?...`  
* **Widoczne, ale nieaktywne:** historia czatu na ekranie

**Intencja:**

* **Jak VR prowadzi gracza:** Pojedyncza kostka przed graczem. Krok ten wprowadza kluczową informację potrzebną w scenie S07 (podczas negocjacji z Szefem IT gracz musi utrzymywać wersję, że chodzi wyłącznie o okup w Bitcoinach, a nie o pliki Freevolt).

**Akcja gracza (z nagrania):** Chwyta kostkę i rzuca ją w ekran.

**Niewybrane opcje:** brak innych opcji.

**Informacja zwrotna:** Dźwięk rzutu i niebieski rozbłysk na ekranie.

**Zmiana sceny:** Wiadomość gracza pojawia się na czacie. BYTE\_MASTER odpisuje: „BĘDĄ Z CIEBIE LUDZIE". Pojawia się ostatnia kostka w tej rozmowie.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk odpowiedzi `A CO Z PRZYKRYWKĄ? MOŻE WYŁUDZENIE OKUPU?...`.  
* **Jak przenieść prowadzenie:** Aktywny przycisk odpowiedzi pod czatem.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – pulsowanie przycisku; poziom 2 po czasie T2 – komunikat „Kliknij odpowiedź, aby kontynuować".

**Kryterium ukończenia:** Wysłanie wiadomości o przykrywce; wyświetlenie odpowiedzi „BĘDĄ Z CIEBIE LUDZIE".

\[DO DECYZJI\]: Fizyczny rzut kostką 3D w ekran (analogicznie do kroku S01-K03).

## **S01-K07: Odpowiedź „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA"**

Obserwacja (VR): Przed graczem wisi kostka `DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA`. Gracz chwyta ją i rzuca w ekran.

**Dostępne w tym momencie:**

* **Aktywne opcje:** kostka dialogowa `DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA`  
* **Widoczne, ale nieaktywne:** historia czatu na ekranie

**Intencja:**

* **Jak VR prowadzi gracza:** Jedna kostka przed graczem, zamykająca rozmowę wprowadzającą.

**Akcja gracza (z nagrania):** Chwyta kostkę i rzuca ją w ekran.

**Niewybrane opcje:** brak innych opcji.

Informacja zwrotna: Dźwięk rzutu i rozbłysk na ekranie.

**Zmiana sceny:** Wiadomość pojawia się na czacie, a bezpośrednio pod nią w dolnej części okna rozmowy wyświetla się zielony przycisk `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS`.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk odpowiedzi `DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA`.  
* **Jak przenieść prowadzenie:** Aktywny przycisk odpowiedzi na dole okna czatu.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – pulsowanie przycisku; poziom 2 po czasie T2 – komunikat „Kliknij odpowiedź, aby zakończyć rozmowę".

**Kryterium ukończenia:** Wysłanie wiadomości `DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA`; pojawienie się przycisku WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS.

\[DO DECYZJI\]: Fizyczny rzut kostką 3D w ekran (analogicznie do kroku S01-K03).

## **S01-K08: Uruchomienie systemu Hackers.OS**

Obserwacja (VR): Gracz kieruje wiązkę lasera na zielony przycisk WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS u dołu ekranu i klika go.

**Dostępne w tym momencie:**

* **Aktywne opcje:** przycisk `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS`  
* **Widoczne, ale nieaktywne:** historia czatu z `BYTE_MASTER`

**Intencja:**

* **Jak VR prowadzi gracza:** Zielony przycisk jest jedynym klikalnym elementem na niebieskim ekranie rozmowy i pojawia się dokładnie pod ostatnią wiadomością gracza.

**Akcja gracza (z nagrania):** Klika przycisk `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS`.

**Niewybrane opcje:** brak innych opcji.

Informacja zwrotna: Dźwięk kliknięcia i uruchomienia komputera (piknięcie BIOS-u i szum dysku/ładowania).

Zmiana sceny: Okno rozmowy znika, ramka ekranu zmienia kolor na zielony. Rozpoczyna się automatyczna sekwencja startowa (ok. 11 sekund): najpierw wyświetla się terminal BIOS (`HACKERSBIOS 2.0 Release 6.1... WELCOME... HACKER`), a następnie ekran ładowania z logo `//HACKERS.OS` i zielonym paskiem postępu. Po załadowaniu paska pojawia się pulpit systemu z sześcioma ikonami oraz boczny ekran czatu po prawej stronie.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** przycisk `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS`.  
* **Jak przenieść prowadzenie:** Wyraźny, zielony przycisk wyśrodkowany pod oknem dialogowym.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – pulsowanie przycisku; poziom 2 po czasie T2 – komunikat „Uruchom system Hackers.OS, aby przejść do działania".

**Kryterium ukończenia:** Kliknięcie przycisku `WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS`; zakończenie animacji BIOS/ładowania i wyświetlenie pulpitu `//HACKERS.OS`.

# **Stan po scenie**

* Uruchomiony pulpit `//HACKERS.OS` (data systemowa `19.05.2026`).  
* Otwarty boczny panel czatu `BYTE_MASTER` po prawej stronie.  
* Odblokowana i oznaczona powiadomieniem (`1`) ikona aplikacji `//BAZA_WIRUSÓW` na pulpicie.  
* Przekazane informacje fabularne potrzebne w kolejnych scenach: trzeba użyć `RANSOMWARE`, wysłać zainfekowane CV w ramach rekrutacji w `Energy Rock`, wykraść pliki dotyczące `FREEVOLT` i użyć żądania okupu jako przykrywki.

# **Dialogi w scenie**

* **BYTE\_MASTER:** MAMY PROBLEM  
* **GRACZ:** CO SIĘ STAŁO?  
* **BYTE\_MASTER:** BRAKUJE KILKU WAŻNYCH PLIKÓW NA TEMAT FREEVOLT. MUSIMY JE ZNALEŹĆ. Z DANYCH, WYKRADZIONYCH Z PETROLOG WYNIKA, ŻE MOGĄ ZNAJDOWAĆ SIĘ W RĘKACH ENERGY ROCK \- JEDNEJ Z NAJWIĘKSZYCH FIRM, ZAJMUJĄCYCH SIĘ MAGAZYNOWANIEM I ZARZĄDZANIEM ZAPASAMI PALIWOWYMI  
* **GRACZ:** CO DOKŁADNIE MAM ZROBIĆ?  
* **BYTE\_MASTER:** MAJĄ CAŁKIEM DOBRE ZABEZPIECZENIA, WIĘC MUSIMY WYMYŚLIĆ JAKIŚ WIARYGODNY SPOSÓB NA WEJŚCIE. MYŚLĘ, ŻE NAJLEPIEJ ZNOWU POBAWIĆ SIĘ SOCJOTECHNIKAMI I WYKORZYSTAĆ BŁĄD LUDZKI  
* **BYTE\_MASTER:** POZA TYM W SIECI KRĄŻĄ TEŻ PLOTKI O TYM, ŻE KTOŚ WYKRADA PLIKI TECHNOLOGII FREEVOLT, WIĘC POTRZEBUJEMY NAPRAWDĘ DOBREJ PRZYKRYWKI  
* **GRACZ:** Z TECHNICZNEGO PUNKTU WIDZENIA MOŻEMY WYKORZYSTAĆ RANSOMWARE. NIE DOŚĆ, ŻE UZYSKAMY DOSTĘP DO DANYCH, TO JESZCZE ZASZYFRUJEMY JE I UNIEMOŻLIWIMY IM PRACĘ  
* **BYTE\_MASTER:** WIDZĘ, ŻE PROWADZĄ REKRUTACJĘ NA KILKA STANOWISK. MÓGŁBYŚ PODESŁAĆ IM ZAINFEKOWANE CV  
* **GRACZ:** A CO Z PRZYKRYWKĄ? MOŻE WYŁUDZENIE OKUPU? ZASZANTAŻUJEMY ICH, ŻE UPUBLICZNIMY HANIEBNE ZANIEDBANIA PROCEDUR BEZPIECZEŃSTWA W ICH FIRMIE I TAKIE TAM  
* **BYTE\_MASTER:** BĘDĄ Z CIEBIE LUDZIE  
* **GRACZ:** DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA

# **S02: Wybór i kompilacja wirusa (Baza Wirusów)**

# **Kontekst sceny**

* **Cel szkoleniowy:** Rozróżnienie trzech podstawowych rodzajów złośliwego oprogramowania (RAT, Ransomware, Keylogger) na podstawie ich działania i dobór narzędzia realizującego cel ataku (zaszyfrowanie komputera i sieci ofiary).  
* **Stan wejściowy:** Na ekranie głównym widoczny jest pulpit `//HACKERS.OS` z sześcioma ikonami ułożonymi w dwóch kolumnach i trzech wierszach: `//BAZA_WIRUSÓW` (różowa ikona z czerwoną plakietką `1`), `//CHAT: BYTE_MASTER` (zielona ikona), `//DYSK E: PENDRIVE` (pomarańczowa ikona), `//DRON: CONDOR MITE3` (żółta ikona), `//MAIL` (jasnoniebieska ikona), `//TOR: PRZEGLĄDARKA` (niebieska ikona). Po prawej stronie wisi osobny, pionowy ekran czatu `BYTE_MASTER` (obecnie pusty, ze statusem online).  
* **Odblokowane z wcześniejszych scen:** Wiedza z odprawy z `BYTE_MASTER` o konieczności zastosowania oprogramowania `RANSOMWARE`.  
* **Układ ekranu 2D:** Po lewej/centralnej stronie pulpit `//HACKERS.OS` (na którym otwiera się pełnoekranowe okno aplikacji `//BAZA_WIRUSÓW`), po prawej stronie stały panel komunikatora `BYTE_MASTER`.  
* **Elementy sceny:**  
  * Ikona `//BAZA_WIRUSÓW` – różowy trójkąt ostrzegawczy z wykrzyknikiem i czerwoną kropką powiadomienia `1`.  
  * Okno wyboru wirusa (`BAZA WIRUSÓW – WYBIERZ ODPOWIEDNIEGO WIRUSA:`) – trzy duże kafelki ułożone poziomo:  
    1. `RAT: REMOTE ACCESS TROJAN` (zielona ikona myszy/celownika) – opis: „POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY".  
    2. `RANSOMWARE` (fioletowa ikona monitora z kłódką) – opis: „MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ".  
    3. `KEYLOGGER` (żółta ikona klawiatury z lupą) – opis: „POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE".  
  * Ekran minigry (`WYSZUKAJ CZĘŚCI WIRUSA:`) – fioletowa ikona kłódki w lewym górnym rogu, niebieski przycisk pomocy `?`, na środku ciemny obszar roboczy, na dole pusty pasek postępu podzielony na 16 fioletowych segmentów.

# **Kroki**

## **S02-K01: Otwarcie aplikacji Baza Wirusów**

**Obserwacja (VR):** Po załadowaniu pulpitu gracz spogląda w prawo na pusty ekran czatu, wraca wzrokiem na ekran główny, wskazuje laserem ikonę //BAZA\_WIRUSÓW oznaczoną czerwoną jedynką i klika ją.

**Dostępne w tym momencie:**

* **Aktywne opcje:** ikona `//BAZA_WIRUSÓW`  
* **Widoczne, ale nieaktywne:** ikony `//CHAT: BYTE_MASTER`, `//DYSK E: PENDRIVE`, `//DRON: CONDOR MITE3`, `//MAIL`, `//TOR: PRZEGLĄDARKA` `[NIEPEWNE: gracz nie klika innych ikon na pulpicie; w systemie VR ikony bez plakietki powiadomienia są zablokowane na danym etapie scenariusza]`

**Intencja:**

* **Jak VR prowadzi gracza:** Czerwona plakietka z cyfrą `1` na ikonie `//BAZA_WIRUSÓW` jest jedynym wyróżnionym punktem na pulpicie i bezpośrednio nawiązuje do ostatniej deklaracji gracza („ZABIERAM SIĘ ZA TWORZENIE WIRUSA").

**Akcja gracza (z nagrania):** Klika ikonę `//BAZA_WIRUSÓW`.

**Niewybrane opcje:** pozostałe 5 ikon pulpitu; skutek wyboru: poza nagraniem.

Informacja zwrotna: Dźwięk kliknięcia i otwarcia okna aplikacji.

**Zmiana sceny:** Ikony pulpitu znikają, a na ekranie głównym otwiera się okno BAZA WIRUSÓW z nagłówkiem WYBIERZ ODPOWIEDNIEGO WIRUSA: oraz trzema opcjami: `RAT`, `RANSOMWARE`, `KEYLOGGER`. Dolny pasek systemowy zmienia etykietę na `//BAZA_WIRUSÓW`.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** ikona `//BAZA_WIRUSÓW`; pozostałe ikony na pulpicie nieaktywne (wyszarzone lub ze znacznikiem braku powiadomień).  
* **Jak przenieść prowadzenie:** Czerwony badge `1` oraz delikatna animacja pulsowania na ikonie `//BAZA_WIRUSÓW`.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – wyraźniejsze pulsowanie ikony `//BAZA_WIRUSÓW`; poziom 2 po czasie T2 – dymek nad ikoną „Otwórz Bazę Wirusów, aby przygotować złośliwe oprogramowanie".

**Kryterium ukończenia:** Kliknięcie ikony `//BAZA_WIRUSÓW`; wyświetlenie okna z trzema rodzajami wirusów.

## **S02-K02: Wybór wirusa typu Ransomware (Wybór oceniany 1/9)**

Obserwacja (VR): Gracz przesuwa wskaźnik lasera kolejno po kafelkach `KEYLOGGER`, `RANSOMWARE` i `RAT`, czytając ich opisy, a następnie wraca na środkowy kafelek `RANSOMWARE` i klika go.

**Dostępne w tym momencie:**

* **Aktywne opcje:**  
  * `RAT: REMOTE ACCESS TROJAN` („POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY")  
  * `RANSOMWARE` („MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ")  
  * `KEYLOGGER` („POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE")  
* **Widoczne, ale nieaktywne:** pusty ekran czatu po prawej stronie

**Intencja:**

* **Jak VR prowadzi gracza:** Wszystkie trzy kafelki są równoważne wizualnie (każdy ma własny kolor i ikonę, która powiększa się po najechaniu). Gracz musi podjąć decyzję merytoryczną, łącząc opis pod kafelkiem z celem zadania z karty zlecenia („MUSISZ ZASZYFROWAĆ SERWERY ZA POMOCĄ RANSOMWARE") oraz z rozmową z `BYTE_MASTER`.

**Akcja gracza (z nagrania):** Klika kafelek `RANSOMWARE`.

**Niewybrane opcje:** `RAT: REMOTE ACCESS TROJAN`, `KEYLOGGER`; skutek wyboru: poza nagraniem.

Informacja zwrotna: Dźwięk zatwierdzenia wyboru.

Zmiana sceny: Trzy kafelki znikają. W oknie `//BAZA_WIRUSÓW` pojawia się ekran `WYSZUKAJ CZĘŚCI WIRUSA:` z fioletową ikoną RANSOMWARE w lewym górnym rogu, niebieską ikoną ? na środku i pustym paskiem postępu u dołu. Po sekundzie ikona `?` przesuwa się w lewy górny róg obok ikony kłódki.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** trzy karty wyboru wirusa (`RAT`, `RANSOMWARE`, `KEYLOGGER`).  
* **Jak przenieść prowadzenie:** Karty prezentowane w jednym rzędzie z wyraźnymi opisami funkcji; efekt hover (powiększenie i rozjaśnienie ramki) na każdej z trzech kart bez faworyzowania poprawnej odpowiedzi.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – podświetlenie historii czatu z `BYTE_MASTER`, gdzie padła nazwa wybranego rozwiązania; poziom 2 po czasie T2 – komunikat „Przypomnij sobie ustalenia z BYTE\_MASTER: potrzebujesz wirusa, który zaszyfruje dane firmy i uniemożliwi jej pracę".

**Kryterium ukończenia:** Wybranie opcji `RANSOMWARE` (zapisanie wyniku wyboru 1/9); przejście do widoku `WYSZUKAJ CZĘŚCI WIRUSA:`.

## **S02-K03: Minigra – Wyszukanie części wirusa**

**Obserwacja (VR):** Gracz najeżdża laserem na ikonę ?, co wyświetla u góry ekranu niebieski baner: „ABY ODKRYĆ WIRUSA, PRZYTRZYMAJ "TRIGGER" I PRZESUWAJ LASEREM PO EKRANIE". Następnie gracz przytrzymuje spust i wodzi laserem po środkowej części ekranu. W miejscach, gdzie laser natrafia na ukryty kształt, pojawiają się białe fragmenty grafiki przedstawiającej monitor z kłódką i łańcuchami, a dolny pasek zapełnia się fioletowymi segmentami. Gdy wszystkie 16 segmentów paska zostaje zapełnione, cały obraz wirusa rozbłyska na biało i ekran przechodzi dalej.

**Dostępne w tym momencie:**

* **Aktywne opcje:** ciemny obszar roboczy na środku ekranu, ikona pomocy `?`  
* **Widoczne, ale nieaktywne:** fioletowa ikona `RANSOMWARE` w rogu, pasek postępu (16 segmentów)

**Intencja:**

* **Jak VR prowadzi gracza:** Na początku ikona `?` pojawia się na samym środku ekranu, dokładnie pod kursorem gracza, po czym ucieka w lewy górny róg, przyciągając za sobą wzrok i zachęcając do najechania na nią. Podczas wodzenia laserem po ekranie odkryte części zostają na stałe podświetlone, a pasek postępu oraz dźwięki odkrywania kolejnych części pokazują, ile brakuje do końca.

**Akcja gracza (z nagrania):** Najeżdża na ikonę `?`, a następnie przytrzymuje spust i zamalowuje/odkrywa wiązką lasera ukrytą ikonę wirusa na środku ekranu aż do pełnego zapełnienia paska postępu (16/16).

Niewybrane opcje: brak innych opcji.

**Informacja zwrotna:** Przy najechaniu na `?` wyświetla się baner instrukcji; przy odkrywaniu każdego z 16 fragmentów rozlega się krótki dźwięk elektroniczny i przybywa jeden fioletowy klocek na pasku postępu; po odkryciu całości rozlega się dźwięk ukończenia.

Zmiana sceny: Po zapełnieniu paska postępu ekran `WYSZUKAJ CZĘŚCI WIRUSA:` znika, a w jego miejscu otwiera się formularz USTAW ZŁOŻONOŚĆ HASŁA:, równocześnie przed graczem po prawej stronie pojawia się niebieska kostka dialogowa.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** obszar roboczy minigry oraz ikona podpowiedzi `?`.  
* **Jak przenieść prowadzenie:** Wyświetlenie czytelnej instrukcji nad obszarem roboczym oraz paska postępu reagującego na działania gracza.  
* **Podpowiedź po bezczynności:** Poziom 1 po czasie T1 – delikatne błyśnięcie konturu ukrytych elementów na obszarze roboczym; poziom 2 po czasie T2 – wyświetlenie instrukcji „Przytrzymaj lewy przycisk myszy i przesuwaj kursorem po ekranie, aby skompilować wszystkie części wirusa".

**Kryterium ukończenia:** Odkrycie wszystkich części wirusa (pasek postępu 100% / 16 segmentów); automatyczne przejście do ekranu `USTAW ZŁOŻONOŚĆ HASŁA:`.

**\[DO DECYZJI\]:** W VR minigra polega na wodzeniu wiązką lasera z wciśniętym spustem po zaciemnionym polu (mechanika „zdrapki" / „latarki"). Jest to czysto zręcznościowy przerywnik niemający samodzielnego celu merytorycznego (nie wpływa na ocenę 9 wyborów w podsumowaniu), mający jedynie dać graczowi poczucie „tworzenia/skanowania kodu wirusa". Należy decidedować, czy w wersji webowej zachować ją jako zdrapkę myszą (drag/hover po canvasie), zastąpić inną prostą interakcją kompilacji, czy pominąć.

# **Stan po scenie**

* Wybrany typ złośliwego oprogramowania: `RANSOMWARE` (zaliczony Wybór 1 z 9).  
* Skompilowane części wirusa; przejście bezpośrednio do konfiguracji hasła szyfrującego w ramach aplikacji `//BAZA_WIRUSÓW`.

