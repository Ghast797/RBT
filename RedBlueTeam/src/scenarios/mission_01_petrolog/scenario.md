# Misja 1: PetroLog
- id: mission-1-petrolog
- firma: PetroLog
- nagroda: 2.52 BTC
- kolor: #00FF66
- data fabularna: 14.01.2025
- ocenianych decyzji: 4

## Intro (dialog z BYTE_MASTER)
- BM: DOSTAŁEM TWOJĄ WIADOMOŚĆ. A WIĘC CHCESZ DO NAS DOŁĄCZYĆ.
- GRACZ: TAK, MAM INFORMACJE, ILE DOBREGO WASZA GRUPA ROBI W SIECI. ZNAM SIĘ NA CYBERBEZPIECZEŃSTWIE, UMIEM ZDOBYWAĆ DANE NIEDOSTĘPNE DLA INNYCH. MOŻE SIĘ PRZYDAM?
- BM: DARKSUN TO NIE ZABAWA. WYKRADAMY INFORMACJE NAJLEPIEJ STRZEŻONYCH FIRM I NIE BIERZEMY JEŃCÓW. MUSISZ BYĆ W PEŁNEJ GOTOWOŚCI.
- GRACZ: JESTEM. W KOŃCU DZIAŁACIE W SŁUŻBIE NAS WSZYSTKICH.
- BM: ZGADZA SIĘ, LUBIMY PSUĆ PLANY TYM, KTÓRZY MYŚLĄ, ŻE SĄ PANAMI TEGO ŚWIATA. ZANIM JEDNAK PRZYJMIEMY CIĘ W SWOJE SZEREGI, MUSISZ SIĘ WYKAZAĆ. TAK SIĘ SKŁADA, ŻE MAM DLA CIEBIE IDEALNE ZADANIE.
- GRACZ: OK, PRZYJMUJĘ WYZWANIE.
- BM: FREEVOLT - MÓWI CI TO COŚ?
- GRACZ: NIE ZA WIELE.
- BM: NO WŁAŚNIE. TO TECHNOLOGIA, KTÓRA POZWOLIŁABY LUDZIOM NA DARMOWY I NIESKOŃCZONY DOSTĘP DO ENERGII. JAK SIĘ DOMYŚLASZ, JEST TO SPRZECZNE Z INTERESAMI WIELKICH KONCERNÓW ENERGETYCZNYCH, KTÓRE WESZŁY W POSIADANIE CAŁEJ DOKUMENTACJI I PILNIE STRZEGĄ, ŻEBY NIKT SIĘ O NIEJ NIE DOWIEDZIAŁ.
- GRACZ: CZYLI MAM WYKRAŚĆ TE DANE?
- BM: DOKŁADNIE, A PRZY OKAZJI MOŻESZ NA TYM NIEŹLE ZAROBIĆ. POTRAKTUJ TO JAKO ZACHĘTĘ DO DZIAŁANIA.
- GRACZ: BRZMI JAK PLAN. TO OD CZEGO ZACZYNAMY?
- BM: PETROLOG. TO FIRMA LOGISTYCZNA, DZIĘKI KTÓREJ POZNAMY DOKŁADNY ŁAŃCUCH DOSTAW I NAZWY FIRM POSIADAJĄCYCH INFORMACJE O FREEVOLT. TO POZWOLI NAM ZAPLANOWAĆ DALSZE RUCHY.
- GRACZ (Wariant A): Z MOJEGO DOŚWIADCZENIA WYNIKA, ŻE NAJSŁABSZYM OGNIWEM SĄ LUDZIE. SPRAWDZĘ PRACOWNIKÓW FIRMY I ZOBACZĘ, KOGO MOŻNA NAJŁATWIEJ ZHAKOWAĆ.
- GRACZ (Wariant B): PRZEJMĘ ICH SOCIAL MEDIA I STWORZĘ WIRUSA, KTÓRY PRZECHWYCI POTRZEBNE DANE.
- BM: BIERZ SIĘ DO PRACY I CZEKAM NA WIADOMOŚĆ.

## Etap 1: //BAZA_CELU: PETROLOG
Klocek: NOWA MINIGRA (Interaktywna teczka wywiadowcza Dossier)
Cel dydaktyczny: analiza 4 działów firmy PetroLog (Zarząd, Sprzedaż, Finanse, Bezpieczeństwo IT) i wytypowanie najbardziej podatnego wektora ataku (spear-phishing vs DDoS vs włamanie fizyczne).
Ekrany: 4 zakładki teczki akt (Zarząd, Sprzedaż, Finanse, IT) + panel analityczny z 3 opcjami wyboru wektora wejścia (A: DDoS – alarm SOC, B: spear-phishing – ideal/zatwierdzenie, C: włamanie fizyczne – dozór CCTV).
Flavor (nieoceniane): bramka jakościowa Flavor — poprawny wybór wektora B odblokowuje przycisk zatwierdzenia i przejście do kolejnego etapu; błędne opcje A i C wyświetlają ostrzeżenie analityczne DarkSun i nakazują ponowną analizę teczki.

Mostek (rozmowa do kolejnego etapu):
- BM: "150 OSÓB TO SPORO. ZACZNIJ OD WYSZUKANIA PRACOWNIKÓW PETROLOG W SIECI."
- GRACZ: "SPRAWDZĘ, CZY KTOŚ Z NICH MA PUBLICZNE PROFILE W MEDIACH SPOŁECZNOŚCIOWYCH."
- odblokuj: //WYSZUKIWARKA: OSINT

## Etap 2: //WYSZUKIWARKA: OSINT
Klocek: NOWA MINIGRA (Wyszukiwarka OSINT i selekcja celu)
Cel dydaktyczny: weryfikacja dostępności profili pracowników i wybór ofiary z publicznym profilem (bramka logiczna).
Ekrany: wyszukiwanie frazy "PETROLOG PRACOWNICY" → wyniki (Marcelina Sojka vs Anita Klimek). Wybór Marceliny Sojki wyzwala komunikat błędu z wyraźną wskazówką edukacyjną T2 (dlaczego profil prywatny stanowi skuteczną barierę przed białym wywiadem OSINT).
Flavor (nieoceniane): selekcja celu z publicznym profilem (bramka OSINT)

Mostek (rozmowa do kolejnego etapu):
- BM: "ANITA KLIMEK Z DZIAŁU KSIĘGOWOŚCI. JEJ PROFIL JEST CAŁKOWICIE PUBLICZNY. PRZEŚWIETL JEJ MEDIA SPOŁECZNOŚCIOWE."
- GRACZ: "PRZEANALIZUJĘ JEJ WPISY I ZBIORĘ INFORMACJE POTRZEBNE DO ATAKU."
- odblokuj: //INTEL_SOCIAL_MEDIA

## Etap 3: //INTEL_SOCIAL_MEDIA
Klocek: NOWA MINIGRA (Symulator platform społecznościowych i aktywna dedukcja faktów)
Cel dydaktyczny: OSINT na portalach społecznościowych, wyciąganie poprawnych wniosków wywiadowczych pod presją Wskaźnika Precyzji Wywiadu (Intel Precision Meter, min. 70%).
Ekrany: profil ofiary + symulator feedu (Kneenook, Quickgram, Joinin) z aktywną dedukcją pod każdym z 11 wpisów (pytanie: „Jaki fakt wywiadowczy wynika z tego wpisu?” + 3 kafle wyboru: 1 poprawny, 2 zmyłki) oraz ekranem ostrzegawczym i przyciskiem resetu w razie spadku precyzji poniżej 70%.
Flavor (nieoceniane): zebranie wszystkich 8 wymaganych faktów przy precyzji ≥ 70% odblokowuje przycisk przejścia do kreatora spear-phishingu.

Mostek (rozmowa do kolejnego etapu):
- BM: "MAMY KOMPLET INFORMACJI O OFIERZE. ANITA JEST ZAPALONĄ BIEGACZKĄ DŁUGODYSTANSOWĄ I SZUKA PORAD TRENINGOWYCH. CZAS NA PRZYGOTOWANIE STRONY-PUŁAPKI I MAILA."
- GRACZ: "STWORZĘ KAMPANIĘ SPEAR-PHISHINGOWĄ SKROJONĄ IDEALNIE POD JEJ ZAINTERESOWANIA."
- odblokuj: //KREATOR_PHISHINGU

## Etap 4: //KREATOR_PHISHINGU
Klocek: NOWA MINIGRA (Kreator spear-phishingu)
Cel dydaktyczny: dobór domeny pułapki, wiarygodnego załącznika, tożsamości współpracownika i spoofingu domeny.
Ekrany: D1 (domena) → D2 (przynęta) → Flavor (wstrzyknięcie wirusa do przycisku pobierz) → D3 (tożsamość nadawcy) → D4 (adres spoofing) → podsumowanie kampanii
Oceniane: D1, D2, D3, D4  |  Flavor (nieoceniane): wstrzyknięcie ładunku

Decyzja D1: "OSZUKAĆ OFIARĘ – WYBIERZ ADRES STRONY, KTÓRY MOŻE JĄ ZAINTERESOWAĆ"
- DALEKBIEG.INFO | ideal | Bezpośrednie odwołanie do pasji do biegów długodystansowych i poszukiwania porad przez ofiarę.
- MUFINA.ORG.PL | suboptimal | Nawiązuje do pieczenia ciast, ale nie łączy się z aktywnymi zapytaniami z sieci zawodowej; domena org.pl nie budzi zaufania jako serwis kulinarny.
- MEDIKARZ.IQ | critical | Tematyka medyczna jest całkowicie oderwana od zainteresowań ofiary i wzbudzi natychmiastową nieufność.

Decyzja D2: "OSZUKAĆ OFIARĘ – WYBIERZ PLIK, KTÓRY OFIARA BĘDZIE MOGŁA POBRAĆ ZE STRONY. NIECH BĘDZIE ZACHĘCAJĄCY."
- PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK | ideal | Precyzyjna odpowiedź na publiczne zapytanie Anity z portalu Joinin.
- TAPETY DLA BIEGACZY NA TELEFON | suboptimal | Mało angażujący zasób, który nie odpowiada potrzebie zdobycia merytorycznej wiedzy.
- KOD ŹRÓDŁOWY STRONY | critical | Całkowity błąd profilowania – księgowa nigdy nie zainteresuje się pobieraniem surowego kodu.

Decyzja D3: "WYSŁAĆ MAILA – WYŚLIJ MAILA DO SWOJEJ OFIARY. PODSZYJ SIĘ POD NAJBARDZIEJ WIARYGODNĄ OSOBĘ."
- JAKUB KWIATKOWSKI | ideal | Zaufany współpracownik z tego samego pokoju oraz partner z wieczornych biegów.
- PREZES BUCZEK | suboptimal | Wiadomość o tematyce sportowej od zarządu firmy wyda się ofierze wysoce podejrzana.
- TWÓJ SYNEK | critical | Małe dzieci nie wysyłają maili ze skrzynki korporacyjnej PetroLog.

Decyzja D4: "WYSŁAĆ MAILA – WYBIERZ ADRES EMAIL, Z KTÓREGO WYŚLESZ WIADOMOŚĆ."
- K.KWIATKOWSKI@PETROLOG.COM | ideal | Domena firmowa PetroLog – serwer pocztowy firmy jest słabo zabezpieczony i nie weryfikuje tożsamości nadawcy, co pozwala podszyć się pod pracownika i uśpić czujność ofiary.
- K.KWIATKOWSKI@HACH.COM | suboptimal | Obca domena zewnętrzna, łatwa do wykrycia przy uważnej weryfikacji nagłówków.
- DARKSUN.JAKUB@GMAIL.COM | critical | Jawna nazwa grupy hakerskiej i publiczny provider (Gmail) skutkujący blokadą antyspamową.

Mostek (rozmowa do kolejnego etapu):
- BM: "MAIL ZOSTAŁ WYSŁANY DO ANITY KLIMEK. PRZEŁĄCZ SIĘ NA MONITOR OFIARY I SPRAWDŹ, CZY POŁKNIE PRZYNĘTĘ."
- GRACZ: "PODGLĄDAM JEJ SKRZYNKĘ I RUCH W SIECI."
- odblokuj: //MONITOR_OFIARY

## Etap 5: //MONITOR_OFIARY
Klocek: NOWA MINIGRA (Symulacja reakcji ofiary i eksfiltracja)
Cel dydaktyczny: obserwacja łańcucha infekcji (klikanie w link, pobranie złośliwego pliku, przejęcie sieci).
Ekrany: poczta Anity → przeglądarka dalekbieg.info → infekcja i mapa sieci PetroLog
Flavor (nieoceniane): egzekucja ataku i przejęcie dokumentacji Freevolt

Mostek (rozmowa do kolejnego etapu):
- BM: "DOSKONAŁA ROBOTA! OFIARA POBRAŁA PLIK, A MY MAMY DOSTĘP DO WEWNĘTRZNEJ SIECI PETROLOG. DANE O ŁAŃCUCHU DOSTAW FREEVOLT SĄ NASZE. ZASŁUŻYŁEŚ NA SWOJĄ DOLĘ W BITCOINACH."
- GRACZ: "DZIĘKI. CZAS NA ANALIZĘ WYNIKÓW I RAPORT POOPERACYJNY."
- odblokuj: //PODSUMOWANIE

## Debrief
Slajdy edukacyjne:
1. OSINT – Biały wywiad w mediach społecznościowych — Cyberprzestępcy nie potrzebują łamać skomplikowanych zabezpieczeń, gdy sami publikujemy kluczowe informacje. Posty z biura, relacje z urlopu czy zapytania o hobby pozwalają stworzyć dokładny profil psychologiczny pracownika. Ogranicz widoczność swoich postów w mediach społecznościowych wyłącznie do zaufanego kręgu znajomych.
2. Spear-phishing – Atak spersonalizowany — W przeciwieństwie do masowego spamu, spear-phishing jest precyzyjnie wymierzony w konkretną osobę. Wykorzystuje autentyczne relacje biurowe, imiona kolegów z zespołu oraz aktualne zainteresowania ofiary, aby uśpić jej czujność i nakłonić do wykonania niebezpiecznej akcji.
3. Weryfikacja nadawcy i spoofing domeny — Atakujący potrafią podrobić nagłówek wiadomości lub zarejestrować domenę łudząco podobną do firmowej (typosquatting). Jeśli otrzymujesz nieoczekiwany link lub załącznik od współpracownika – zweryfikuj to z nim innym kanałem (np. zadzwoń lub zapytaj osobiście przy biurku).
4. Higiena cyfrowa i bezpieczne odnośniki — Przed kliknięciem w link zawsze najedź kursorem myszy i sprawdź rzeczywisty adres docelowy w lewym dolnym rogu przeglądarki. Stosuj menedżer haseł, regularnie aktualizuj system oraz bezwzględnie włącz uwierzytelnianie dwuskładnikowe (2FA) na wszystkich kontach firmowych i prywatnych.
