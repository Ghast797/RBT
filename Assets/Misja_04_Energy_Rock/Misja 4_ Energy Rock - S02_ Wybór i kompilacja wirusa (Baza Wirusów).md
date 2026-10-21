# **S02: Wybór i kompilacja wirusa (Baza Wirusów)**

# **Kontekst sceny**

* **Cel szkoleniowy:** Rozróżnienie podstawowych typów złośliwego oprogramowania (RAT, Ransomware, Keylogger) na podstawie ich sposobu działania oraz dobór narzędzia odpowiedniego do zaszyfrowania zasobów ofiary i wymuszenia okupu.  
* **Stan wejściowy:** Po kliknięciu przycisku uruchomienia systemu w scenie S01, na głównym ekranie trwa automatyczna sekwencja startowa systemu //HACKERS.OS (ekran tekstowy HackersBIOS 2.0 Release 6.1, a następnie okno ładowania z zielonym paskiem postępu). Po jej zakończeniu odsłania się pulpit systemu z sześcioma ikonami aplikacji oraz pusty ekran komunikatora po prawej stronie.  
* **Odblokowane z wcześniejszych scen:** Wiedza z odprawy z BYTE\_MASTER (S01) o planowanym wykorzystaniu oprogramowania ransomware jako przykrywki do ataku na firmę Energy Rock.  
* **Układ ekranu 2D:** Na środku głównego ekranu znajduje się pulpit //HACKERS.OS z siatką sześciu ikon ułożonych w trzech wierszach po dwie kolumny (po lewej stronie ekranu). Na dole głównego ekranu widoczny jest pasek stanu z etykietą //HACKERS.OS po lewej i datą 19.05.2026 po prawej. Po prawej stronie przestrzeni znajduje się pionowy, niebieski ekran komunikatora z nagłówkiem BYTE\_MASTER i zieloną kropką statusu (obecnie bez wiadomości).  
* **Elementy sceny:**  
  * **Ekran startowy BIOS i ładowania systemu:** Ciemne okno z zielonym tekstem HackersBIOS 2.0 Release 6.1 wypisywanym linijka po linijce, przechodzące w okno z logo HACKERS //HACKERS.OS i paskiem postępu złożonym z zielonych prostokątnych segmentów.  
  * **Ikona //BAZA\_WIRUSÓW:** Kwadratowy kafelek w pierwszym rzędzie po lewej, z różowym obramowaniem, ikoną trójkąta ostrzegawczego i czerwoną okrągłą plakietką z cyfrą 1 w prawym górnym rogu.  
  * **Ikona //CHAT: BYTE\_MASTER:** Kafelek w pierwszym rzędzie po prawej, z zielonym obramowaniem i ikoną dymku czatu.  
  * **Ikona //DYSK E: PENDRIVE:** Kafelek w drugim rzędzie po lewej, z brązowym obramowaniem i ikoną pamięci USB.  
  * **Ikona //DRON: CONDOR MITE3:** Kafelek w drugim rzędzie po prawej, z pomarańczowym obramowaniem i ikoną drona.  
  * **Ikona //MAIL:** Kafelek w trzecim rzędzie po lewej, z jasnoniebieskim obramowaniem i ikoną koperty.  
  * **Ikona //TOR: PRZEGLĄDARKA:** Kafelek w trzecim rzędzie po prawej, z niebieskim obramowaniem i ikoną lupy.  
  * **Okno aplikacji BAZA WIRUSÓW (ekran wyboru):** Pełnoekranowe okno na głównym monitorze z nagłówkiem BAZA WIRUSÓW i podtytułem WYBIERZ ODPOWIEDNIEGO WIRUSA:. Zawiera trzy duże karty wyboru ułożone poziomo: RAT: REMOTE ACCESS TROJAN (zielona, ikona myszy), RANSOMWARE (fioletowa, ikona ekranu z kłódką) oraz KEYLOGGER (żółta, ikona klawiatury z okiem).  
  * **Okno WYSZUKAJ CZĘŚCI WIRUSA: (minigra kompilacji):** Widok z nagłówkiem WYSZUKAJ CZĘŚCI WIRUSA:, fioletową ikoną ransomware w lewym górnym rogu, niebieską ikoną pomocy ?, centralnym ciemnym polem roboczym oraz dolnym paskiem postępu wypełniającym się fioletowymi segmentami.

# **Kroki**

## **S02-K01: Otwarcie aplikacji Baza Wirusów**

**Obserwacja (VR):** Po automatycznym załadowaniu BIOS-u i paska startowego pojawia się pulpit //HACKERS.OS. Gracz rozgląda się na prawy ekran czatu (jest pusty), po czym kieruje wskaźnik na ikonę //BAZA\_WIRUSÓW, która jako jedyna ma czerwoną plakietkę 1, i klika ją.

**Dostępne w tym momencie:**

* **Aktywne opcje:** ikona //BAZA\_WIRUSÓW  
* **Widoczne, ale nieaktywne:** pozostałe ikony na pulpicie (//CHAT: BYTE\_MASTER, //DYSK E: PENDRIVE, //DRON: CONDOR MITE3, //MAIL, //TOR: PRZEGLĄDARKA), prawy ekran komunikatora BYTE\_MASTER

**Intencja:**

* **Jak VR prowadzi gracza:** W rozmowie zamykającej poprzednią scenę (S01) gracz zadeklarował: „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA". Na pulpicie tylko ikona //BAZA\_WIRUSÓW posiada czerwoną plakietkę powiadomienia 1 oraz wyróżniające się różowe obramowanie. Po najechaniu na nią wskaźnikiem kafelek powiększa się i wydaje dźwięk interfejsu.

**Akcja gracza (z nagrania):** Klika ikonę //BAZA\_WIRUSÓW na pulpicie.

**Niewybrane opcje:** brak innych aktywnych opcji (pozostałe ikony pulpitu są zablokowane na tym etapie).

Informacja zwrotna: Dźwięk kliknięcia interfejsu; animacja otwarcia okna aplikacji na całym głównym ekranie.

**Zmiana sceny:** Widok ikon pulpitu znika, zastąpiony przez okno BAZA WIRUSÓW z trzema kartami złośliwego oprogramowania; lewa etykieta na dolnym pasku stanu zmienia się z //HACKERS.OS na //BAZA\_WIRUSÓW.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** ikona //BAZA\_WIRUSÓW; pozostałe ikony pulpitu nieklikalne (wyszarzone lub ze zmniejszoną przezroczystością).  
* **Jak przenieść prowadzenie:** zachować animację rozruchu BIOS-u (z opcją pominięcia przyciskiem „Pomiń"), a po wyświetleniu pulpitu wyróżnić kafelek //BAZA\_WIRUSÓW czerwoną plakietką 1, pulsowaniem obramowania oraz efektem powiększenia po najechaniu kursorem (hover).  
* **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (wyraźniejsze pulsowanie ikony //BAZA\_WIRUSÓW i plakietki 1), poziom 2 po czasie T2 (komunikat tekstowy na ekranie: „Otwórz aplikację //BAZA\_WIRUSÓW, aby rozpocząć tworzenie wirusa").

**Kryterium ukończenia:** Kliknięcie ikony //BAZA\_WIRUSÓW i wyświetlenie widoku wyboru wirusa z trzema opcjami (RAT, RANSOMWARE, KEYLOGGER).

## **S02-K02: Wybór odpowiedniego typu wirusa (Ransomware)**

**Obserwacja (VR):** W oknie BAZA WIRUSÓW widoczne są trzy karty z opisami działania. Gracz przesuwa wskaźnik kolejno po karcie KEYLOGGER, RANSOMWARE i RAT, czytając ich opisy (każda karta podświetla się po najechaniu), a następnie klika środkową kartę RANSOMWARE.

**Dostępne w tym momencie:**

* **Aktywne opcje:**  
  * **RAT: REMOTE ACCESS TROJAN** – POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY (lewa karta, zielona)  
  * **RANSOMWARE** – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ (środkowa karta, fioletowa)  
  * **KEYLOGGER** – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE (prawa karta, żółta)  
* **Widoczne, ale nieaktywne:** prawy ekran komunikatora BYTE\_MASTER, dolny pasek stanu //BAZA\_WIRUSÓW  
* **Odblokowane wcześniej:** ustalenia z rozmowy z BYTE\_MASTER (S01) dotyczące zaszyfrowania danych Energy Rock jako przykrywki

**Intencja:**

* **Jak VR prowadzi gracza:** Wszystkie trzy karty są równorzędnie wyeksponowane w centrum ekranu i reagują podświetleniem na najechanie wskaźnikiem, co zmusza gracza do przeczytania opisów i podjęcia decyzji merytorycznej. Wskazówką jest cel zadania z menu głównego („MUSISZ ZASZYFROWAĆ SERWERY ZA POMOCĄ RANSOMWARE") oraz wcześniejsza rozmowa z mentorem w S01.

**Akcja gracza (z nagrania):** Wybiera środkową kartę RANSOMWARE.

**Niewybrane opcje:**

* **RAT: REMOTE ACCESS TROJAN** – skutek wyboru: poza nagraniem  
* **KEYLOGGER** – skutek wyboru: poza nagraniem

**Informacja zwrotna:** Dźwięk zatwierdzenia wyboru; przejście do kolejnego widoku wewnątrz aplikacji //BAZA\_WIRUSÓW.

**Zmiana sceny:** Trzy karty wyboru znikają. W oknie //BAZA\_WIRUSÓW pojawia się ekran z nagłówkiem WYSZUKAJ CZĘŚCI WIRUSA:, fioletową ikoną ransomware w lewym górnym rogu, niebieską ikoną ? na środku, pustym ciemnym polem roboczym oraz pustym paskiem postępu na dole.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** trzy karty wirusów (RAT, RANSOMWARE, KEYLOGGER) oraz panel czatu po prawej stronie (umożliwiający przewinięcie i przypomnienie sobie rozmowy z mentorem, jeśli historia z S01 pozostaje widoczna).  
* **Jak przenieść prowadzenie:** trzy karty umieszczone centralnie obok siebie, z wyraźnym efektem hover (podświetlenie ramki i lekkie uniesienie karty). Wszystkie trzy wyglądają na jednakowo dostępne, aby nie zdradzać poprawnej odpowiedzi wizualnie.  
* **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (delikatne podświetlenie opisów pod nazwami wirusów na wszystkich trzech kartach), poziom 2 po czasie T2 (komunikat: „Przypomnij sobie ustalenia z BYTE\_MASTER – potrzebujesz wirusa, który zaszyfruje dane firmy i uniemożliwi jej pracę").

**Kryterium ukończenia:** Wybranie karty RANSOMWARE, zapisanie oceny wyboru nr 1 w systemie punktacji i przejście do widoku WYSZUKAJ CZĘŚCI WIRUSA:.

## **S02-K03: Wyszukanie części wirusa (minigra)**

Obserwacja (VR): Na środku ekranu pojawia się niebieska ikona ?, która po chwili przesuwa się w lewy górny róg (obok fioletowej ikony ransomware). Gracz najeżdża wskaźnikiem na ikonę ?, co wyświetla niebieski baner u góry ekranu: „ABY ODKRYĆ WIRUSA, PRZYTRZYMAJ TRIGGER I PRZESUWAJ LASEREM PO EKRANIE". Następnie gracz przytrzymuje przycisk i wodzi wiązką lasera po ciemnym polu roboczym. W miejscach, gdzie laser natrafia na ukryty kształt, pojawiają się białe, poszarpane fragmenty grafiki (monitor z kłódką i łańcuchem), a dolny pasek postępu stopniowo wypełnia się fioletowymi blokami (łącznie 15 segmentów). Po odkryciu wszystkich fragmentów ikona staje się w pełni widoczna, a okno automatycznie przechodzi do następnego kroku.

**Dostępne w tym momencie:**

* **Aktywne opcje:** ciemny obszar roboczy na środku okna WYSZUKAJ CZĘŚCI WIRUSA:, niebieska ikona pomocy ? w lewym górnym rogu  
* **Widoczne, ale nieaktywne:** fioletowa ikona kategorii w lewym górnym rogu, dolny pasek postępu, prawy ekran komunikatora

**Intencja:**

* **Jak VR prowadzi gracza:** Na początku kroku niebieska ikona ? pojawia się dokładnie na środku ekranu (w miejscu, gdzie gracz ma skupiony wzrok po kliknięciu środkowej karty w poprzednim kroku), a następnie animacją wędruje w lewy górny róg, przyciągając za sobą wzrok gracza. Po najechaniu na ? pojawia się jasna instrukcja sterowania. W trakcie mazania laserem po ekranie natychmiastową informacją zwrotną są odsłaniające się białe elementy grafiki, dźwięk skanowania oraz przybywające fioletowe klocki na pasku postępu.

**Akcja gracza (z nagrania):** Najeżdża na ikonę ?, po czym przytrzymuje spust kontrolera i zamalowuje wiązką lasera obszar roboczy, aż pasek postępu wypełni się w 100% (15/15 fioletowych segmentów).

Niewybrane opcje: brak innych opcji.

**Informacja zwrotna:** W trakcie odkrywania – ciągły dźwięk elektronicznego skanowania/rysowania oraz wizualne odsłanianie kolejnych fragmentów ikony i zapełnianie paska postępu. Po zapełnieniu całego paska – dźwięk ukończenia etapu i automatyczna zmiana widoku.

Zmiana sceny: Widok WYSZUKAJ CZĘŚCI WIRUSA: znika, a w oknie //BAZA\_WIRUSÓW otwiera się kolejny etap kreatora z nagłówkiem USTAW ZŁOŻONOŚĆ HASŁA:. Jednocześnie przed graczem po prawej stronie pojawia się niebieska kostka dialogowa rozpoczynająca scenę S03.

**Adaptacja web (2D, mysz):**

* **Aktywne elementy:** obszar roboczy do odkrywania wirusa oraz ikona pomocy ?.  
* **Jak przenieść prowadzenie:** instrukcję działania wyświetlić od razu pod nagłówkiem WYSZUKAJ CZĘŚCI WIRUSA: (lub po najechaniu na ikonę ?). Pasek postępu na dole jednoznacznie pokazuje, ile jeszcze brakuje do ukończenia kroku.  
* **Podpowiedź po bezczynności:** poziom 1 po czasie T1 (krótki błysk zarysu ukrytej ikony na ciemnym polu i pulsowanie ikony ?), poziom 2 po czasie T2 (wyświetlenie na stałe baneru z instrukcją obsługi myszą oraz podświetlenie nieodkrytych jeszcze fragmentów).

**Kryterium ukończenia:** Odkrycie 100% wymaganych fragmentów ikony wirusa (wypełnienie wszystkich 15 segmentów paska postępu) i przejście do widoku USTAW ZŁOŻONOŚĆ HASŁA:.

\[DO DECYZJI\]: W wersji VR minigra opiera się na fizycznym machaniu kontrolerem z wciśniętym spustem i świeceniu wiązką lasera po dużym zakrzywionym ekranie (mechanika „zdrapki" / „latarki"). Nie przenosi się to wprost 1:1 na typową interakcję kursorem myszy, a krok ten nie sprawdza wiedzy merytorycznej (nie jest oceniany na ekranie podsumowania wyborów – pełni wyłącznie funkcja angażującego przerywnika symulującego „składanie kodu wirusa"). Należy zdecydować, czy w wersji 2D zastąpić to zdrapką obsługiwaną przytrzymaniem lewego przycisku myszy (LPM \+ ruch kursorem), klikaniem w podświetlające się punkty/fragmenty kodu, czy inną prostą interakcją.

# **Stan po scenie**

* Wybrany typ złośliwego oprogramowania: RANSOMWARE (zapisany jako Wybór 1 z wynikiem idealnym).  
* Ukończona minigra wyszukiwania części wirusa.  
* Otwarte okno //BAZA\_WIRUSÓW na etapie USTAW ZŁOŻONOŚĆ HASŁA: (punkt wyjścia dla sceny S03).

# **Dialogi w scenie**

W tej scenie nie występują żadne dialogi na czacie. Pojawiają się wyłącznie komunikaty systemowe i tekst interfejsu:

## **Ekran BIOS**

* **HackersBIOS 2.0 Release 6.1**  
* **Copyright 1985-2022 Hackers Collective Technologies**  
* **All Rights Reserved**  
* **BIOS Version 2.0 r 6.1**  
* **Gateway as54**  
* **System ID \# 00528156**  
* **Build Time: 03/09/2022 19:26:54**  
* **CPU \= Unknown**  
* **1061 KB System RAM Passed**  
* **512M Extended RAM Passed**  
* **512K Cache SRAM Passed**  
* **System BIOS shadowed**  
* **Video BIOS shadowed**  
* **Segment address: E447**  
* **Welcome... Hacker**

## **Karty wyboru w BAZA WIRUSÓW**

* **RAT: REMOTE ACCESS TROJAN** – POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY  
* **RANSOMWARE** – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ  
* **KEYLOGGER** – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE

## **Podpowiedź pod ikoną ?**

* **ABY ODKRYĆ WIRUSA, PRZYTRZYMAJ "TRIGGER" I PRZESUWAJ LASEREM PO EKRANIE**

