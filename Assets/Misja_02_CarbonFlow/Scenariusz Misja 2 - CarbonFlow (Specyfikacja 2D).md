# **Misja 2: CarbonFlow – Specyfikacja Scenariusza (2D / SCORM)**

Dokument zawiera kompletną specyfikację techniczną i wykonawczą scenariusza dla Misji 2 (CarbonFlow), przeznaczonego do wdrożenia w środowisku dwuwymiarowym / SCORM w ramach systemu //HACKERS.OS.

---

# **1\. Metadane misji**

* **ID:** mission-2-carbonflow  
* **Tytuł:** Misja 2 – CarbonFlow  
* **Podtytuł:** Kampania phishingowa, infekcja robakiem 0-day i utworzenie sieci komputerów zombie (botnet)  
* **Cel ataku:** CarbonFlow Inc. (operator systemu przesyłowego paliw i gazu)  
* **Ocenianych decyzji:** 5 (D1–D5)  
* **Próg zaliczenia:** 80% (minimum 4/5 poprawnych wyborów)  
* **Nagroda:** 2,96 BTC (certyfikat ukończenia: 4/9)  
* **Kolor przewodni:** `#00FF66` / `#3399FF` (Cyber Accent)  
* **Data fabularna:** 19.05.2026  
* **Środowisko:** //HACKERS.OS

---

# **2\. Spis aplikacji i kolejność odblokowań (//HACKERS.OS)**

| ID kafelka | Etykieta | Kolejność | Warunek odblokowania |
| :---- | :---- | :---- | :---- |
| `app_chat_bm` | //CHAT: BYTE\_MASTER | 1 | Dostępny od startu (połączenie przychodzące w Darknecie) |
| `app_phishing` | //PHISHING | 2 | Zakończenie dialogu INTRO i uruchomienie systemu HACKERS.OS |
| `app_vpn` | //VPN | 3 | Wybór tematu ankiety i przeciągnięcie listy IP w scenie S02 |
| `app_virus_db` | //BAZA\_WIRUSÓW | 4 | Pomyślne skonfigurowanie VPN i dialog z mentorem |
| `app_phishing_dispatch` | //PHISHING (Wysyłka) | 5 | Skompilowanie kodu robaka i dialog z mentorem o fałszywej domenie |

---

# **3\. Kanoniczna lista ocenianych decyzji (D1–D5)**

| ID | Scena | Nazwa decyzji / Minigra | Wybór idealny |
| :---- | :---- | :---- | :---- |
| **D1** | S01 | Wybór rodzaju akcji phishingowej | `WIRUS 0-DAY` |
| **D2** | S01 | Wybór szablonu formularza phishingowego | `POODLE FORMS` |
| **D3** | S02 | Wybór tematu i przynęty ankiety | `OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO` |
| **D4** | S04 | Dobór złośliwego oprogramowania | `ROBAK` |
| **D5** | S05 | Wybór adresu nadawcy (domena phishingowa) | `KADRY@CARDONFLOW.COM` |

---

# **4\. Przebieg scen, dialogów i minigier**

## **Blok dialogowy: INTRO**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** DialogueTree  
* **Kontekst:** Gracz w menu Darknetu odbiera połączenie od mentora BYTE\_MASTER dotyczące operacji przeciwko CarbonFlow Inc.

**Skrypt rozmowy:**

* **BM:** MAM DLA CIEBIE KOLEJNE ZADANIE  
* **GRACZ:** HEJ, CO MASZ DLA MNIE TYM RAZEM? *(jedyna opcja)*  
* **BM:** Z DOKUMENTÓW, KTÓRE DLA NAS ZDOBYŁEŚ WYNIKA, ŻE JEDNĄ Z FIRM, KTÓRA MOŻE POSIADAĆ WIĘCEJ INFORMACJI O TECHNOLOGII FREEVOLT JEST CARBONFLOW INC.  
* **GRACZ:** CO TO ZA FIRMA? *(jedyna opcja)*  
* **BM:** TO OPERATOR SYSTEMU PRZESYŁOWEGO PALIW, KTÓREGO SZEFEM JEST ROBERT MORIS, WSPÓŁPRACUJĄ Z NAJWIĘKSZYMI KONCERNAMI ZAJMUJĄCYMI SIĘ PRODUKCJĄ I DYSTRYBUCJĄ GAZU ORAZ ROPY  
* **BM:** CHCEMY NAPSUĆ IM TROCHĘ KRWI I SPRAWIĆ, ŻE ICH KLIENCI STRACĄ DO NICH ZAUFANIE. POTRZEBUJEMY TEŻ ZASŁONY DYMNEJ, ŻEBY NA SPOKOJNIE ROZEJRZEĆ SIĘ PO ICH SERWERACH. JAKIEŚ POMYSŁY, SHERLOCKU?  
* **GRACZ:** JAKIE MAJĄ ZABEZPIECZENIA? *(jedyna opcja)*  
* **BM:** DOŚĆ SŁABE. W MAILACH OD NICH ZAUWAŻYŁEM SYGNATURĘ BEZPŁATNEGO ANTYWIRUSA. OPRÓCZ TEGO, ICH SERWER POCZTOWY DAWNO NIE BYŁ AKTUALIZOWANY, WIĘC NA PEWNO MAJĄ LUKI BEZPIECZEŃSTWA  
* **GRACZ:** CO POWIESZ NA FAŁSZYWĄ ANKIETĘ ZAINFEKOWANĄ WIRUSEM 0-DAY, KTÓRY WYKRYJE DLA NAS TE LUKI? ROBAKI 0-DAY SĄ PRAKTYCZNIE NIEWYKRYWALNE PRZEZ ANTYWIRUSY, A CO DOPIERO W PRZYPADKU GDY ICH OPROGRAMOWANIE JEST NIEAKTUALNE *(jedyna opcja)*  
* **BM:** A CO Z TĄ ANKIETĄ?  
* **GRACZ:** ZAREJESTRUJĘ FAŁSZYWĄ DOMENĘ I STWORZĘ ANKIETĘ, KTÓRĄ WYŚLĘ WSZYSTKIM PRACOWNIKOM W FIRMIE. KIEDY TYLKO KLIKNĄ W LINK, ROBAK ZAINFEKUJE ICH KOMPUTERY I ROZEŚLE ZAINFEKOWANE WIADOMOŚCI DO KLIENTÓW Z FIRMOWEJ BAZY KONTAKTÓW *(jedyna opcja)*  
* **GRACZ:** TO NA 100% PODKOPIE WIARYGODNOŚĆ CARBONFLOW, A NAM DA MOŻLIWOŚĆ ROZEJRZENIA SIĘ PO SERWERACH I ZDOBYCIE DANYCH NA TEMAT FREEVOLT *(jedyna opcja)*  
* **BM:** CZYLI KLASYCZNY PHISHING?  
* **GRACZ:** CZASEM NAJPROSTSZE ROZWIĄZANIA SĄ NAJLEPSZE *(jedyna opcja)*  
* **BM:** DOBRZE SIĘ SKŁADA, BO MAM AKURAT DLA CIEBIE LISTĘ MAILINGOWĄ PRACOWNIKÓW CARBONFLOW I ADRESY IP, KTÓRE SĄ NA BIAŁEJ LIŚCIE NADAWCÓW  
* **GRACZ:** CZYLI OD POCZĄTKU WIEDZIAŁEŚ, ŻE BĘDĘ PLANOWAĆ ATAK PHISHINGOWY? *(jedyna opcja)*  
* **BM:** PAMIĘTAJ, JESTEM ZAWSZE DWA KROKI PRZED TOBĄ. A TERAZ ZABIERAJ SIĘ DO PRACY

**Kryterium ukończenia:** Kliknięcie przycisku "WŁĄCZ SYSTEM OPERACYJNY HACKERS.OS".

---

## **Scena S01: Konfiguracja kampanii – Rodzaj akcji i szablon (//PHISHING)**

* **Oceniane:** Decyzja D1 (Rodzaj akcji) oraz Decyzja D2 (Szablon)  
* **Klocek 2D:** ChoiceCards

**Ekrany po kolei:**

1. Ekran startowy: "NOWA KAMPANIA PHISHINGOWA" z przyciskiem "KONTYNUUJ".  
2. Ekran wyboru akcji: 3 pionowe opcje.  
3. Ekran wyboru szablonu: 3 karty serwisów.

**Opcje oceny – Krok 1: Wybierz rodzaj akcji (Decyzja D1):**

* `WIRUS 0-DAY` | **ideal** | Wirus 0-day bezbłędnie realizuje cel zlecenia, omijając antywirusy i tworząc sieć botnetu na serwerach ofiary.  
* `SZKOLENIE Z BEZPIECZEŃSTWA IT` | **suboptimal** | Pozorowane szkolenie nie instaluje złośliwego oprogramowania i nie paraliżuje infrastruktury zgodnie z ustaleniami z mentorem.  
* `ZBIERANIE WRAŻLIWYCH DANYCH` | **critical** | Phishing nakierowany wyłącznie na kradzież poświadczeń nie infekuje maszyn robakiem i nie tworzy zasłony dymnej.

**Opcje oceny – Krok 2: Wybierz szablon (Decyzja D2):**

* `POODLE FORMS` *(Podtytuł: TWOJA ANKIETA | Przycisk: WYPEŁNIJ FORMULARZ)* | **ideal** | Profesjonalny szablon formularza ankietowego idealnie pasuje do planu wysłania fałszywej ankiety pracowniczej.  
* `Quickgram` *(Podtytuł: OBSERWUJ | Przycisk: SPRAWDŹ TO)* | **suboptimal** | Szablon sieci społecznościowej wzbudza podejrzenia w środowisku korporacyjnym.  
* `Kneenook` *(Podtytuł: TWÓJ POST | Przycisk: ZOBACZ NA KNEENOOK)* | **critical** | Szablon postu na forum jest niespójny z formatem ankiety.

---

## **Scena S02: Opracowanie treści ankiety i przygotowanie do ominięcia antyspamu**

* **Oceniane:** Decyzja D3 (Temat ankiety)  
* **Klocek 2D:** PoolSelect / Drag-and-drop

**Ekrany po kolei:**

1. Ekran "POODLE FORMS" z pustym obszarem formularza.  
2. Boczny zasobnik z 3 tematami ankiety.  
3. Po przeciągnięciu poprawnego tematu pojawia się wypełniony formularz.

**Opcje oceny – Temat ankiety (Decyzja D3):**

* `OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO` | **ideal** | Przymus w połączeniu z tematem integracji tworzy idealną presję socjotechniczną.  
* `ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH` | **suboptimal** | Temat formalny i nudny, część pracowników odłoży wypełnienie na później.  
* `ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU` | **critical** | Błahy temat zostanie zignorowany przez większość personelu.

---

## **Scena S03: Konfiguracja VPN i maskowanie adresu IP (//VPN)**

* **Oceniane:** Flavor (zadanie techniczne / nieoceniane)  
* **Klocek 2D:** Configurator / Modal

**Dialog przed konfiguracją VPN:**

* **BM:** NIE ZAPOMNIJ, ŻE MAJĄ CZARNĄ LISTĘ ANTYSPAMOWĄ. MUSISZ WYBRAĆ JEDEN Z TYCH ADRESÓW IP, ABY W OGÓLE ZOBACZYLI MAILA OD CIEBIE  
* **GRACZ:** WIEM, SKORZYSTAM Z VPN, ABY OMINĄĆ ICH SYSTEMY ANTYSPAMOWE *(jedyna opcja)*

**Przebieg:**

1. Ekran modułu //VPN: nagłówek "VPN – DOPASUJ SWOJE IP, ABY UNIKNĄĆ WYKRYCIA".  
2. Etykiety: Pożądany adres IP (np. `82.123.192.116` lub `77.141.195.139`) oraz Aktualny adres IP.  
3. Kontrolki zmiany 4 oktetów oraz przycisk "DOPASUJ W AI" (automatyczna synchronizacja).  
4. Komunikat: "POMYŚLNIE DOPASOWANO IP".

---

## **Blok dialogowy: MOSTEK S03 \-\> S04**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** DialogueTree

**Skrypt rozmowy:**

* **BM:** STWÓRZ WIRUSA 0-DAY. BĘDZIEMY MIELI PEWNOŚĆ, ŻE WIRUS JEST NIEWYKRYWALNY  
* **GRACZ:** ROBI SIĘ *(jedyna opcja)*

---

## **Scena S04: Konstrukcja i modyfikacja robaka 0-day (//BAZA\_WIRUSÓW)**

* **Oceniane:** Decyzja D4 (Wybór wirusa) oraz Flavor (Modyfikacja kodu robaka)  
* **Klocek 2D:** Krok 1: ChoiceCards; Krok 2: Drag-and-drop

**Ekrany po kolei:**

1. Baza wirusów – wybór typu z 3 kart.  
2. Zmodyfikuj kod wirusa – przeciągnięcie 5 klocków instrukcji na grafikę robaka:  
   * `SKANUJ_PORTY();`  
   * `AKTYWUJ_SERWER();`  
   * `ZMIEŃ_METADANE();`  
   * `OMIJAJ_ANTYWIRUSA();`  
   * `REPLIKUJ();`  
3. Ekran podsumowania: "WIRUS GOTOWY\! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY".

**Opcje oceny – Wybór wirusa (Decyzja D4):**

* `ROBAK – AUTOMATYCZNIE SIĘ POWIELA I TWORZY KOMPUTERY ZOMBIE` | **ideal** | Robak samodzielnie powiela się w sieci i formuje botnet.  
* `KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE` | **suboptimal** | Przechwytuje dane na jednej stacji, nie tworzy botnetu.  
* `RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ` | **critical** | Szyfrowanie przedwcześnie alarmuje administratorów i pali operację.

---

## **Blok dialogowy: MOSTEK S04 \-\> S05**

* **Oceniane:** Flavor (nieoceniane)  
* **Klocek 2D:** DialogueTree

**Skrypt rozmowy:**

* **BM:** WIESZ JUŻ, Z JAKIEGO ADRESU WYŚLESZ ZAINFEKOWANĄ ANKIETĘ?  
* **GRACZ:** SPOKOJNA TWOJA ZAKAPTURZONA. PODMIENIĘ JEDNĄ LITERĘ W DOMENIE FIRMOWEJ. NIKT NIE ZWRÓCI NA TO UWAGI *(jedyna opcja)*

---

## **Scena S05: Wybór domeny podszywającej i wysyłka kampanii (//PHISHING)**

* **Oceniane:** Decyzja D5  
* **Klocek 2D:** ChoiceCards

**Ekrany po kolei:**

1. Ekran wyboru adresu z 3 wariantów.  
2. Potwierdzenie i kliknięcie przycisku "WYŚLIJ".

**Opcje oceny – Wybór adresu nadawcy (Decyzja D5):**

* `KADRY@CARDONFLOW.COM` | **ideal** | Typosquatting (podmiana 'b' na 'd' w nazwie domeny) połączony z wiarygodnym działem kadr.  
* `MARKETING@CARBON.COM` | **suboptimal** | Skrócona domena jest podejrzana w kontekście spraw kadrowych.  
* `KATERING@OILFLOW.COM` | **critical** | Zupełnie obca domena zewnętrznej firmy cateringowej zostanie zablokowana lub zignorowana.

---

## **Blok dialogowy: MOSTEK S05 \-\> S06**

* **Oceniane:** Flavor (nieoceniane)  
* **GRACZ:** GOTOWE. TERAZ MUSIMY POCZEKAĆ, AŻ RYBKA CHWYCI HACZYK *(jedyna opcja)*

---

## **Scena S06: Rozprzestrzenianie robaka i formowanie botnetu**

* **Oceniane:** Flavor (nieoceniane / wizualizacja sukcesu)  
* **Klocek 2D:** Interaktywny monitor monitoringu botnetu (Canvas z rosnącym wskaźnikiem)

**Przebieg:**

1. Alert: "MALWARE ZOSTAŁ AKTYWOWANY".  
2. Monitor: "ROBAK – MALWARE ZOSTAŁ AKTYWOWANY. KOMPUTERY ZOMBIE SĄ TWORZONE" z przyciskiem "PODGLĄD".  
3. Dynamiczny licznik infekcji maszyn rośnie do 82%.  
4. Schemat sieci zakażonej w firmie CarbonFlow.

**Dialog końcowy:**

* **BM:** NIEŹLE CI POSZŁO. JESTEŚ CORAZ BLIŻEJ PRZYJĘCIA DO DARKSUN. CARBONFLOW MA CO ODKRĘCAĆ, A MY MOŻEMY SPOKOJNIE DZIAŁAĆ DALEJ. ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ  
* **GRACZ:** DO USŁUG *(jedyna opcja)*

---

# **5\. Scena S07: Podsumowanie zadania i Debriefing Edukacyjny**

* **Oceniane:** Podsumowanie wyników decyzji D1–D5  
* **Klocek 2D:** Moduł podsumowania SCORM \+ interaktywna karuzela slajdów wiedzy

**Ekran wyników:**

* ZHAKOWANO CARBONFLOW – SUKCES – UKOŃCZONO ZADANIE 2  
* 5 idealnych wyborów (100% maksymalnego wyniku)  
* Nagroda: 2,96 BTC

**Kanoniczna tabela debriefu (D1–D5):**

| ID Decyzji | Nazwa kroku | Wybrana opcja | Ocena |
| :---- | :---- | :---- | :---- |
| **D1** | WYBIERZ RODZAJ AKCJI | WIRUS 0-DAY | Idealny |
| **D2** | WYBIERZ SZABLON MAILA | POODLE (POODLE FORMS) | Idealny |
| **D3** | WYBIERZ TEMAT ANKIETY | OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO | Idealny |
| **D4** | WYBIERZ ODPOWIEDNIEGO WIRUSA | ROBAK | Idealny |
| **D5** | WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA | KADRY@CARDONFLOW.COM | Idealny |

**Slajdy edukacyjne "CO POWINIENEŚ ZAPAMIĘTAĆ?":**

1. **ANTYWIRUS:** Dobre oprogramowanie chroniące przed wirusami jest pierwszą linią obrony przeciwko atakom hakerskim. Zminimalizuje szkody i powiadomi o próbie zainfekowania urządzenia, co pozwoli na szybką reakcję administratora.  
2. **ODNOŚNIKI W MAILACH:** Każdy mail posiadający odnośnik należy sprawdzić pod kątem złośliwego oprogramowania. Jeżeli nie jesteś pewny linku, zapytaj swojego administratora. Zalecane jest sprawdzenie czy dany rodzaj wiadomości faktycznie został wysłany do pracowników oraz czy nadawca jest ci znany.  
3. **WYCIECKI DANYCH:** Jeśli wiadomość wydaje się podejrzana, przyjrzyj się domenie oraz całemu adresowi, z którego została wysłana. Może się okazać, że dane kontaktowe pracowników firmy są w niepowołanych rękach i będzie trzeba wdrożyć dodatkowe środki ostrożności.  
4. **PODSUMOWUJĄC – NA CO NALEŻY UWAŻAĆ:**  
   * Zawsze miej zainstalowane oprogramowanie antywirusowe.  
   * Uważaj na odnośniki w mailach.  
   * Dane pracowników mogły ulec wyciekom, pamiętaj o tym.  
5. **CHCESZ UNIKNĄĆ HAKOWANIA?:** Wszystkie wskazówki na temat cyberbezpieczeństwa znajdziesz w panelu Baza Wiedzy w głównym menu hakera (Darknecie).

