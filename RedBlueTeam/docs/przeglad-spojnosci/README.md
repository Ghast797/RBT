# Przegląd spójności M1–M4 po audycie (26.11.2026)

Po zamknięciu paczek P1–P6 z audytu złych wyborów ([`../audyt-zle-wybory-postep.md`](../audyt-zle-wybory-postep.md)) czterech agentów przeszło misje w przeglądarce, ścieżką idealną i słabszą, i porównało to z kodem. Nic nie zostało poprawione. Ten plik zbiera **sugestie** do decyzji właściciela. Szczegóły z cytatami i propozycjami tekstów są w plikach misji:

| Plik | Misja | Jak sprawdzone | Ustalenia (wysoki / średni / niski) |
|---|---|---|---|
| [m1.md](m1.md) | M1 PetroLog | przeglądarka (`?dev=1`, bez intro i OSINT) + kod | 3 / 6 / 7 |
| [m2.md](m2.md) | M2 CarbonFlow | **tylko kod** (przeglądarka odmówiła agentowi nawigacji) | 2 / 4 / 4 |
| [m3.md](m3.md) | M3 O&L | przeglądarka: ścieżka słabsza całość, idealna do //DRON + kod | 2 / 3 / 6 |
| [m4.md](m4.md) | M4 Energy Rock | przeglądarka: ścieżka słabsza całość, idealna do wysyłki maila + kod | 1 / 7 / 5 |

Konsola przeglądarki: bez błędów w M1, M3, M4. Podpowiedzi po bezczynności nie były testowane w przeglądarce przez agentów (sprawdzone wcześniej ręcznie w M1).

## Działa dobrze (wszystkie misje)
Odrzucenia przez mentora (karta ✗, baner, kwestia w czacie), pamięć wyborów w mailach, monitorach, kopercie i alertach, warianty czatu zależne od planu (M3), odroczone skutki (M2 monitor, M3 11:40, M4 panel C2 i godziny), „Najpierw: X — odrzucone” w raporcie, wstrzyknięcie wirusa kliknięciem (M1).

## Problemy wspólne dla kilku misji (najpierw te)

1. **Raport: „CO ZADZIAŁAŁOBY LEPIEJ” jest stały, a ideał zależy od wcześniejszego wyboru** — wysoki.
   - M1 D2: po domenie MUFINA raport poleca poradnik biegowy, którego na tej stronie nie było (ideał tam: poradnik z przepisami).
   - M3 D4: przy planie HR raport poleca podpis „ZDJĘCIA Z AFTERPARTY…”, który przy planie HR jest krytyczny.
   - Sugestia: w silniku warianty odpowiedzi w raporcie zależne od wcześniejszego wyboru (`answerVariants` z warunkiem `when`, ten sam mechanizm co w czacie). Przy M1 D4 (prezes) wybrano wcześniej neutralny tekst; przy trzech przypadkach mechanizm zaczyna się opłacać.
2. **Raport: plakietka „IDEALNY WYBÓR” mimo odrzuconych prób i straconych punktów** — średni (M3, M4; M2 z kodu).
   - Licznik w nagłówku liczy taką decyzję jako „DOBRE”, lista pokazuje „IDEALNY”; gracz nie wie, skąd niski wynik (np. M3 D2 po dwóch odrzuceniach daje 0 pkt przy „idealnym” wyborze).
   - Sugestia: przy decyzji z odrzuceniem pokazywać „IDEALNY PO POPRAWCE (−X PKT)” i jedno zdanie w raporcie, że odrzucona próba kosztuje pół udziału.
3. **Raport: „Atak:” / „Obrona:” pod słabszym wyborem opisują wariant idealny** — średni (M2; dotyczy wszystkich).
   - Np. M2 przy ankiecie przeciwpożarowej „Obrona” mówi o terminie w mailu, którego gracz nie miał.
   - Sugestia: etykiety „Atak (wariant idealny):” / „Obrona (przy wariancie idealnym):” albo jedno zdanie o wyborze gracza nad lekcją.
4. **Końcowe kwestie mentora nie odpowiadają temu, jak naprawdę poszło** — średni.
   - M2: „NIEŹLE CI POSZŁO” mimo trzech odrzuceń i wyniku poniżej progu; „MOGŁO PÓJŚĆ LEPIEJ” takie samo dla 1 i 3 słabszych wyborów.
   - M3: „CZEKALIŚMY ZA DŁUGO” nie mówi, co spowodowało zwłokę; potem mentor chwali bez śladu tej uwagi.
   - M4: „TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO” przy 2 z 3 plików (po zmianie zasady D8 sytuacja jest inna niż przy wcześniejszej decyzji „bez osobnej kwestii”); „IT JUŻ COŚ PODEJRZEWA. DZIAŁAJ SZYBKO.” pada po kradzieży plików, gdy nie da się już działać szybciej.
   - M1: kreator strony pisze „DOSKONALE!” przy słabych wyborach.
   - Sugestia: warunek „bez odrzuconych prób” w `when` i trzeci wariant przy wyniku poniżej progu (M2); kwestie zależne od przyczyny (M3); wariant dla niepełnego D8 i przesunięcie ostrzeżenia IT przed szyfrowanie (M4); neutralne „STRONA-PUŁAPKA ZOSTAŁA SKONFIGUROWANA” (M1).
5. **WYNIK i BTC nie są nigdzie wyświetlane w trakcie gry, także w M1** — średni.
   - `Taskbar.tsx` nie jest używany (dolny pasek jest w `Desktop.tsx`), więc flaga `hideLiveScore` z P4 niczego nie zmienia. Ukrycie w M2–M4 działało już wcześniej, ale M1 też nie pokazuje wyniku.
   - Do decyzji: dodać WYNIK/BTC do dolnego paska tylko w M1, albo usunąć martwy `Taskbar.tsx` i flagę oraz poprawić dokumentację.
6. **Interfejs** — średni/niski.
   - M4: czat z ofiarą nie przewija się do najnowszej wiadomości (silnik, `DialogueTree`); po banerze odrzucenia kafelki nachodzą na pole hasła i przycisk ZATWIERDŹ przy 1366×768.
   - M3: pytanie D6 ucięte w widoku drona; w raporcie ucięta kwota BTC przy 1024×768.
7. **Dokumentacja** — niski. `scenario.md` M1 i M2 rozjechały się z kodem (np. M1 „TWÓJ SYNEK = critical”, M2 numeracja „S04, D4” dla wirusa i monitor „bez konsekwencji”).

### Decyzje właściciela do problemów wspólnych (27.11.2026)
1. „CO ZADZIAŁAŁOBY LEPIEJ”: warianty zależne od wcześniejszego wyboru (silnik). M1 D2 wg domeny, M1 D4 wg nadawcy (dokładny adres prezesa zamiast neutralnego tekstu), M3 D4 wg planu.
2. Decyzja z odrzuconą próbą: plakietka „IDEALNY PO POPRAWCE”, „(−X PKT)” przy odrzuconej próbie, zdanie pod licznikiem o koszcie odrzuconej próby.
3. „Atak” / „Obrona” pod słabszym wyborem: dopisek „(wariant idealny)” (bez pytania, oczywiste).
4. Końcowe kwestie mentora: wszystkie cztery poprawki (M2 trzy warianty z odrzuceniami i progiem, M3 przyczyna zwłoki, M4 niepełny zestaw plików i ostrzeżenie IT przed szyfrowaniem, M1 bez „DOSKONALE!”).
5. WYNIK i BTC na dolnym pasku tylko w M1; martwy `Taskbar.tsx` do usunięcia.
6. M4: przebieg negocjacji w raporcie wg faktycznych odpowiedzi (bez pytania, oczywiste).

**Stan 27.11.2026: punkty 1–6 zrobione** (silnik `16ff5dc` + warunki zagnieżdżone `cbc7dab`; M1 `34918b1`, M2 `40a128b`/`cbc7dab`, M3 `25df46d`, M4 `92db822`). Przy okazji zrobione też z listy poniżej: M1 reakcja Anity, zakończenie maila wg pliku, feedback prezesa, „LUB KLIKNIJ”; M2 objaśnienia spadku na monitorze, KATERING; M3 „PODBIJE”, „PODWIESIĆ… KOPERTĘ”; M4 „TEMAT MAILA…”, odpowiedź D8 w raporcie. Zostały: angielskie „TERMINATED & COMMITTED” w oknie wyjścia, UI (autoprzewijanie czatu ofiary w M4, nachodzenie elementów po banerze odrzucenia, ucięte teksty przy 1024×768), M1 feedback „.org.pl”, lekcja M1 D2 „idealnie dopasowany do Twojego wpisu” przy stronie z muffinkami, dokumentacja.

**Stan 27.11.2026, drobne poprawki zrobione:** okno wyjścia po polsku + „W MOODLE ZOSTAJE TWÓJ NAJLEPSZY WYNIK.”, autoprzewijanie czatu (`DialogueTree`), baner odrzucenia w jednej linii i znika po zmianie wyboru, zawijanie nagłówka raportu i paska pytania, adresy i nazwy plików łamią się po `@`, `_`, `.`, „ASYSTENT AI” (silnik `ad3b93a`, `d95a2d9`); M4 układ kreatora hasła i maila, bez „KROK N:”, „LICZBY ZNAKÓW”, „REKRUTER OTWIERA CV Z OPÓŹNIENIEM…” (`424859d`); M1 feedback MUFINA, „remont w domu”; M3 krótsza etykieta pytania w dronie (`378f44f`). Lekcja M1 D2 zostaje (opisuje wariant idealny i ma etykietę „(wariant idealny)”). W przeglądarce sprawdzone: kreator hasła M4 z banerem przy 1366×768. Niesprawdzone w przeglądarce: czat ofiary M4, karta nadawcy VPN, raport przy 1024×768, mail M4.

## Pojedyncze poprawki tekstów (szybkie)
- M1: reakcja Anity na maila od prezesa „dziwi się, że zarząd pisze do niej o bieganiu” także przy muffinkach (wysoki); „Coś, czego szukałaś!” przy muffinkach (wysoki); feedback prezesa „o tematyce sportowej” (średni); „.org.pl nie budzi zaufania” (niski); „Przeciągnij” bez „lub kliknij” (niski).
- M2: KATERING / CATERING w jednym ekranie (niski); monitor nie mówi, czemu penetracja spadła (średni).
- M3: literówka „A NAM **POBICIE** TROCHĘ DRAMATURGIĘ” → „PODBIJE” (wysoki, oba warianty); „PODPIĄĆ DO NIEGO PENDRIVE'A” przy kopercie w //DRON (niski).
- M4: przebieg negocjacji w raporcie jest stały i chwali „twarde stanowisko” po kapitulacji (wysoki); dopisek „NAZWA PLIKU WZBUDZIŁA WĄTPLIWOŚCI” dotyczy tematu maila (średni); odpowiedź D8 w raporcie ucina listę i ukrywa drugi plik Freevolt (średni); modal po wysłaniu pokazuje bieżący, nie najlepszy wynik, i ma angielskie „TERMINATED & COMMITTED” (średni).

## Już rozstrzygnięte (nie ruszać bez nowej decyzji)
- M2: kwestia „PODMIENIĘ JEDNĄ LITERĘ W DOMENIE” zdradza odpowiedź D4 — właściciel zdecydował zostawić 1:1 z VR (D-02). Agent M2 proponuje neutralną kwestię; do ewentualnego ponownego rozważenia.
- M4: suwak hasła startuje na 8, zakazane znaki bez oznaczenia — świadome pułapki (P5).
- M4: dodatkowe pliki w D8 bez kary — decyzja właściciela (P4).
