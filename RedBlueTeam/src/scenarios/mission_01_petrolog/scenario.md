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
Klocek: NOWA MINIGRA (Rozpoznanie celu w 3 krokach: Poznaj → Zbadaj → Zdecyduj)
Cel dydaktyczny: gracz sam sprawdza, które miejsca w firmie są dobrze chronione, a które słabe, i na tej podstawie wybiera drogę ataku (podstępny mail vs atak na serwery vs włamanie do budynku). Język prosty, bez żargonu — termin „spear-phishing” pada dopiero po trafnej decyzji, jako wyjaśnienie.
Ekrany (kolejno, oddzielone ekranem ładowania, bez cofania):
1. POZNAJ CEL — 3 zaszyfrowane karty z odprawy VR, odkrywane kliknięciem: „MAJĄ DOKUMENTY O FREEVOLT”, „PRACUJE TAM 150 OSÓB”, „PRACOWNICY DUŻO PUBLIKUJĄ W SIECI”. Dalej po odkryciu wszystkich trzech.
2. ZBADAJ FIRMĘ — plan firmy z 4 miejscami: Budynek centrali, Serwerownia, Dział sprzedaży, Księgowość. Każde miejsce to 2 krótkie zdania obserwacji i pytanie „Słaby punkt czy dobrze chronione?”. Trafna ocena dopisuje trop do notatnika (notatnik śledczy zajmuje prawy monitor od tego kroku do końca etapu, zamiast czatu); nietrafna pokazuje naprowadzenie i pozwala ocenić ponownie. Dalej po ocenieniu wszystkich 4 miejsc. Bez imion pracowników (gracz pozna je w etapie 2).
   - Budynek centrali: chronione (karty wejściowe, ochrona, kamery).
   - Serwerownia: chronione (zewnętrzna ochrona 24/7 widzi każdy atak na sieć).
   - Dział sprzedaży: chronione (sprawdzają każdego nowego klienta).
   - Księgowość: słaby punkt (pośpiech, dziesiątki faktur w załącznikach, nikt nie sprawdza nadawcy maila).
3. ZDECYDUJ — notatnik z tropami gracza + 3 drogi ataku: „Zaatakować serwery firmy”, „Włamać się do budynku”, „Wysłać podstępnego maila do pracownika”. Nietrafny wybór odsyła do konkretnego tropu z notatnika: trop miga w notatniku na prawym monitorze, a komunikat mówi, gdzie go szukać.
Flavor (nieoceniane): trafny wybór (podstępny mail) odblokowuje przycisk przejścia do kolejnego etapu; pozostałe opcje pokazują ostrzeżenie DarkSun i pozwalają wybrać ponownie.

Mostek (rozmowa do kolejnego etapu):
- BM: "150 OSÓB TO SPORO. ZACZNIJ OD WYSZUKANIA PRACOWNIKÓW PETROLOG W SIECI."
- GRACZ: "SPRAWDZĘ, CZY KTOŚ Z NICH MA PUBLICZNE PROFILE W MEDIACH SPOŁECZNOŚCIOWYCH."
- odblokuj: //WYSZUKIWARKA: OSINT

## Etap 2: //WYSZUKIWARKA: OSINT
Klocek: NOWA MINIGRA (Wyszukiwarka OSINT i selekcja celu)
Cel dydaktyczny: weryfikacja dostępności profili pracowników i wybór ofiary z publicznym profilem (bramka logiczna).
Ekrany: wyszukiwanie frazy "PETROLOG PRACOWNICY" → wyniki (Marcelina Sojka vs Anita Klimek). Kliknięcie karty tylko ją zaznacza; wybór zatwierdza osobny przycisk „ZATWIERDŹ WYBÓR CELU” (tak samo dla obu profili). Zatwierdzenie Anity Klimek pokazuje komunikat „DOBRY WYBÓR!” z uzasadnieniem i przycisk przejścia dalej. Zatwierdzenie Marceliny Sojki wyzwala komunikat błędu z wyraźną wskazówką edukacyjną T2 (dlaczego profil prywatny stanowi skuteczną barierę przed białym wywiadem OSINT).
Flavor (nieoceniane): selekcja celu z publicznym profilem (bramka OSINT)

Mostek (rozmowa do kolejnego etapu):
- BM: "ANITA KLIMEK Z DZIAŁU KSIĘGOWOŚCI. JEJ PROFIL JEST CAŁKOWICIE PUBLICZNY. PRZEŚWIETL JEJ MEDIA SPOŁECZNOŚCIOWE."
- GRACZ: "PRZEANALIZUJĘ JEJ WPISY I ZBIORĘ INFORMACJE POTRZEBNE DO ATAKU."
- odblokuj: //SOCIAL_MEDIA

## Etap 3: //SOCIAL_MEDIA
Klocek: NOWA MINIGRA (Symulator platform społecznościowych i aktywna dedukcja faktów)
Cel dydaktyczny: OSINT na portalach społecznościowych, wyciąganie poprawnych wniosków wywiadowczych pod presją Wskaźnika Precyzji Wywiadu (Intel Precision Meter, min. 70%).
Ekrany:
1. PROFILE — 3 grafiki platform (Kneenook → Quickgram → Joinin), odblokowywane po kolei: następna dopiero po przejrzeniu wszystkich wpisów poprzedniej. Notatnik z 8 polami na fakty zajmuje prawy monitor przez cały etap (zamiast czatu), więc ekran platform mieści się bez przewijania.
2. Wejście w platformę (krótkie ładowanie) → wpisy jeden po drugim (11 wpisów łącznie), każdy z miejscem na grafikę. Pod wpisem aktywna dedukcja (pytanie: „Jaki fakt wywiadowczy wynika z tego wpisu?” + 3 kafle wyboru: 1 poprawny, 2 zmyłki; kolejność kafli losowana przy każdym podejściu, żeby przy powtórce trzeba było czytać). „Następny wpis” odblokowuje się po trafnej odpowiedzi; po ostatnim wpisie powrót do ekranu profili.
Spadek precyzji poniżej 70% pokazuje ekran ostrzegawczy z przyciskiem resetu (powrót do ekranu profili, postęp od zera).
Układ wpisu: po lewej wpis jak w aplikacji platformy (kwadratowe zdjęcie, format Instagrama), po prawej osobny panel analizy (pytanie, odpowiedzi, przejście dalej).
Grafiki: `assets/social/<id>.png` — id platformy (kneenook, quickgram, joinin) albo id wpisu (kn_1…ji_3); grafiki wpisów kwadratowe (1:1).
Flavor (nieoceniane): zebranie wszystkich 8 wymaganych faktów przy precyzji ≥ 70% odblokowuje przycisk przejścia do kreatora spear-phishingu.

Mostek (rozmowa do kolejnego etapu):
- BM: "MAMY KOMPLET INFORMACJI O OFIERZE. ANITA JEST ZAPALONĄ BIEGACZKĄ DŁUGODYSTANSOWĄ I SZUKA PORAD TRENINGOWYCH. CZAS NA PRZYGOTOWANIE STRONY-PUŁAPKI."
- GRACZ: "STWORZĘ STRONĘ-PUŁAPKĘ SKROJONĄ IDEALNIE POD JEJ ZAINTERESOWANIA."
- odblokuj: //KREATOR_STRONY

## Etap 4: //KREATOR_STRONY
Klocek: NOWA MINIGRA (Kreator fałszywej witryny z podglądem na żywo)
Cel dydaktyczny: dobór domeny pułapki, wiarygodnego załącznika oraz wstrzyknięcie złośliwego kodu do przycisku pobierania z podglądem na żywo.
Ekrany: D1 (domena) → D2 (przynęta) → Flavor (wstrzyknięcie wirusa metodą drag-and-drop do przycisku na podglądzie strony) → podsumowanie strony
Oceniane: D1, D2  |  Flavor (nieoceniane): przeciągnięcie ładunku malware

Decyzja D1: "OSZUKAĆ OFIARĘ – WYBIERZ ADRES STRONY, KTÓRY MOŻE JĄ ZAINTERESOWAĆ"
- DALEKBIEG.INFO | ideal | Bezpośrednie odwołanie do pasji do biegów długodystansowych i poszukiwania porad przez ofiarę.
- MUFINA.ORG.PL | suboptimal | Nawiązuje do pieczenia ciast, ale nie łączy się z aktywnymi zapytaniami z sieci zawodowej; domena org.pl nie budzi zaufania jako serwis kulinarny.
- MEDIKARZ.IQ | critical | Tematyka medyczna jest całkowicie oderwana od zainteresowań ofiary i wzbudzi natychmiastową nieufność.

Decyzja D2: "OSZUKAĆ OFIARĘ – WYBIERZ PLIK, KTÓRY OFIARA BĘDZIE MOGŁA POBRAĆ ZE STRONY. NIECH BĘDZIE ZACHĘCAJĄCY."
(Drzewo decyzyjne – zestaw opcji dopasowany do domeny wybranej w D1)

Wariant dla DALEKBIEG.INFO (portal biegowy):
- PORADNIK DLA BIEGACZY DŁUGODYSTANSOWYCH - 10 PORAD JAK POPRAWIĆ SWÓJ WYNIK | ideal | Precyzyjna odpowiedź na publiczne zapytanie Anity z portalu Joinin.
- TAPETY DLA BIEGACZY NA TELEFON | suboptimal | Mało angażujący zasób, który nie odpowiada potrzebie zdobycia merytorycznej wiedzy.
- KOD ŹRÓDŁOWY STRONY | critical | Całkowity błąd profilowania – księgowa nigdy nie zainteresuje się pobieraniem surowego kodu.

Wariant dla MUFINA.ORG.PL (serwis kulinarny z muffinkami):
- PORADNIK KULINARNY - 10 SPRAWDZONYCH PRZEPISÓW NA DOMOWE MUFFINKI | ideal | Trafny dobór pliku dla serwisu kulinarnego – merytoryczny e-book z przepisami nawiązuje do pasji pieczenia ciast i wzbudza zaufanie.
- TAPETY ZE SŁODKIMI MUFFINKAMI NA TELEFON | suboptimal | Mało angażujący zasób – zdjęcia babeczek są ładne, ale nie dają żadnej praktycznej wartości kulinarnej ani przepisów.
- KOD ŹRÓDŁOWY BLOGA KULINARNEGO | critical | Całkowity błąd profilowania – miłośniczka domowych wypieków nigdy nie zainteresuje się pobieraniem surowego kodu strony.

Mostek (rozmowa do kolejnego etapu):
- BM: "STRONA-PUŁAPKA JEST GOTOWA I ZAWIRUSOWANA. TERAZ MUSISZ PRZYGOTOWAĆ MAILA DO ANITY I WYBRAĆ TOŻSAMOŚĆ NADAWCY."
- GRACZ: "OTWIERAM KLIENTA POCZTY I PRZYGOTOWUJĘ KAMPANIĘ SPEAR-PHISHINGOWĄ."
- odblokuj: //WYSYŁANIE_MAILA

## Etap 5: //WYSYŁANIE_MAILA
Klocek: NOWA MINIGRA (Konfigurator i wysyłka wiadomości spear-phishing)
Cel dydaktyczny: dobór tożsamości współpracownika oraz spoofing domeny firmowej z podglądem wiadomości e-mail na żywo.
Ekrany: D3 (tożsamość nadawcy) → D4 (adres spoofing) → podgląd i wysyłka maila
Oceniane: D3, D4

Decyzja D3: "WYSŁAĆ MAILA – WYŚLIJ MAILA DO SWOJEJ OFIARY. PODSZYJ SIĘ POD NAJBARDZIEJ WIARYGODNĄ OSOBĘ."
- JAKUB KWIATKOWSKI | ideal | Zaufany współpracownik z tego samego pokoju oraz partner z wieczornych biegów.
- PREZES BUCZEK | suboptimal | Wiadomość o tematyce sportowej od zarządu firmy wyda się ofierze wysoce podejrzana.
- TWÓJ SYNEK | critical | Małe dzieci nie wysyłają maili ze skrzynki korporacyjnej PetroLog.

Decyzja D4: "WYSŁAĆ MAILA – WYBIERZ ADRES EMAIL, Z KTÓREGO WYŚLESZ WIADOMOŚĆ."
- K.KWIATKOWSKI@PETROLOG.COM | ideal | Domena firmowa PetroLog – serwer pocztowy firmy jest słabo zabezpieczony i nie weryfikuje tożsamości nadawcy, co pozwala podszyć się pod pracownika i uśpić czujność ofiary.
- K.KWIATKOWSKI@HACK.COM | suboptimal | Obca domena zewnętrzna, łatwa do wykrycia przy uważnej weryfikacji nagłówków.
- DARKSUN.JAKUB@GMAIL.COM | critical | Jawna nazwa grupy hakerskiej i publiczny provider (Gmail) skutkujący blokadą antyspamową.

Mostek (rozmowa do kolejnego etapu):
- BM: "MAIL ZOSTAŁ WYSŁANY DO ANITY KLIMEK. PRZEŁĄCZ SIĘ NA MONITOR OFIARY I SPRAWDŹ, CZY POŁKNIE PRZYNĘTĘ."
- GRACZ: "PODGLĄDAM JEJ SKRZYNKĘ I RUCH W SIECI."
- odblokuj: //MONITOR_OFIARY

## Etap 6: //MONITOR_OFIARY
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
