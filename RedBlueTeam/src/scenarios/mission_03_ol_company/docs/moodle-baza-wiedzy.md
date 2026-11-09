# Misja 3: O&L Company — baza wiedzy

> Materiał do kursu Moodle, umieszczany pod aktywnością SCORM „Misja 3 – O&L Company”. Najlepiej udostępnić go po ukończeniu scenariusza (Ograniczenia dostępu → Ukończenie aktywności).
> Nie trafia do paczki SCORM. Lekcje przy pojedynczych decyzjach gracz widzi w raporcie pooperacyjnym w grze. Ten materiał je uzupełnia i uogólnia.

## Co się wydarzyło w misji

Jako członek grupy DarkSun wszedłeś do sieci spółki paliwowej O&L Company bez łamania zabezpieczeń technicznych. Wystarczyło, żeby jeden pracownik sam podłączył do służbowego komputera pendrive'a, który „ktoś zgubił”. Atak miał pięć kroków:

1. **Narzędzie.** Wybrałeś trojana zdalnego dostępu (RAT), czyli program, który po cichu oddaje atakującemu pulpit komputera ofiary. Program, który szyfruje dane, zaalarmowałby firmę od razu, a rejestrator klawiszy nie dałby dostępu do plików.
2. **Rozpoznanie i cel.** Ze strony internetowej firmy dowiedziałeś się, kto tam pracuje, jak długo i czym się zajmuje. Wybrałeś nowego pracownika działu wsparcia klienta, bo nie znał jeszcze firmowych zwyczajów i chciał zrobić dobre wrażenie. Wpis o imprezie integracyjnej dał gotową przynętę.
3. **Pendrive.** Przygotowałeś nośnik ze zdjęciami „z afterparty”, a wirusa ukryłeś w archiwum ZIP obok fotografii. Nadałeś dyskowi wiarygodną nazwę i podpisałeś kopertę tak, żeby ciekawość wygrała z ostrożnością.
4. **Dostarczenie.** Dron zostawił kopertę na samochodzie ofiary, pod jej domem. Adres i opis auta pochodziły z rozpoznania. Atak sięgnął poza sieć firmy.
5. **Przejęcie.** Pracownik podłączył pendrive'a w biurze. Zobaczyłeś jego pulpit, skopiowałeś pliki o technologii Freevolt i uzyskałeś dostęp do sieci firmy.

Żaden z tych kroków nie wymagał zaawansowanej techniki. Każdy opierał się na informacjach, które firma lub pracownik sami upublicznili, i na zwykłej ludzkiej ciekawości.

## 1. Nieznane nośniki USB (baiting)

**Baiting** („przynęta”) to atak, w którym ofiara sama podłącza zainfekowany nośnik, bo coś ją zainteresowało: zdjęcia, „zgubione” dokumenty, podpis sugerujący ważną zawartość. Pendrive nie musi nic robić sam z siebie. Wystarczy, że ktoś go otworzy.

Dlaczego to działa:
- **ciekawość i chęć pomocy**: „może należy do kolegi, sprawdzę, czyje to”,
- **kontekst**: przynęta nawiązuje do prawdziwego wydarzenia znanego z publicznych wpisów firmy,
- **maskowanie**: wirus ukryty w archiwum ZIP obok niewinnych plików nie jest widoczny na pierwszy rzut oka, a proste skanery pomijają zawartość archiwów,
- **fałszywa wiarygodność**: nazwę dysku i podpis na kopercie może ustawić każdy, więc niczego nie dowodzą.

**Jak się chronić**
- **Nie podłączaj znalezionych ani podrzuconych nośników** do komputera służbowego ani prywatnego. Dotyczy to też „zgubionych” pendrive'ów, kopert i darmowych gadżetów.
- Oddaj nośnik do działu IT lub ochrony i powiedz, gdzie go znalazłeś.
- Nie otwieraj archiwów ZIP/RAR z nieznanego źródła. Wirusy mogą kryć się w dowolnym pliku.
- Włącz w programie antywirusowym skanowanie nośników wymiennych.

## 2. Polityka urządzeń w firmie

Pojedynczy pracownik nie powinien być ostatnią linią obrony. Firma może zmniejszyć ryzyko zasadami i narzędziami:
- **blokada portów USB** albo **biała lista** zatwierdzonych urządzeń,
- **zasada najmniejszych uprawnień**: konto pracownika wsparcia klienta nie ma dostępu do dokumentacji infrastruktury,
- **EDR i monitoring ruchu wychodzącego**, które wychwytują nieznane procesy i połączenia na obce adresy,
- **segmentacja sieci**, żeby jedna zainfekowana stacja nie otwierała drogi do całej firmy,
- **szkolenie od pierwszego dnia pracy**, zanim nowa osoba dostanie dostęp do systemów,
- **prosta procedura zgłaszania** podejrzanych rzeczy i kultura, w której nikt nie boi się zapytać IT.

## 3. Co firma i pracownicy ujawniają publicznie (OSINT)

W misji strona firmy i zakładka z wydarzeniami wystarczyły, żeby wybrać ofiarę i przynętę. Atakujący czytał stanowiska, staż i zakres obowiązków każdej osoby oraz opisy imprez ze zdjęciami.

**Zachowaj ostrożność z publikowaniem**
- **danych pracowników**: imię, nazwisko, stanowisko i staż razem mówią atakującemu, kto jest najłatwiejszym celem. Pokaż tyle, ile potrzebują klienci, nie więcej,
- **zdjęć i opisów z firmowych wydarzeń**: pokazują twarze, relacje i okoliczności, na które można się powołać w przynęcie. Zanim opublikujesz, zapytaj: „Co obca osoba mogłaby z tym zrobić?”,
- **własnego adresu, zdjęć domu i samochodu** w mediach społecznościowych: na tej podstawie dron zostawił kopertę przy właściwym aucie pod właściwym domem.

## 4. Ataki poza biurem

Zagrożenie nie kończy się na sieci firmowej. Przynęta może czekać pod domem, na parkingu, na szybie samochodu lub w poczcie.

**Sygnały ostrzegawcze**
- Koperta, pendrive lub drobny przedmiot bez nadawcy, zostawione w miejscu, gdzie na pewno je znajdziesz.
- Przynęta, która pasuje do Twojego życia lub niedawnego wydarzenia w firmie.
- Etykieta, która nakłania do szybkiego sprawdzenia zawartości (zdjęcia, „zgubione dokumenty”, wypowiedzenie).

**Co zrobić**
- Nie sprawdzaj takiej przesyłki na żadnym komputerze. Zgłoś ją ochronie lub działowi IT.
- Traktuj niezamówione przesyłki jako podejrzane, także gdy podpis wygląda znajomo.

## 5. Zgłaszanie znalezisk i incydentów

Szybkie zgłoszenie często decyduje o skali szkód. Gdy znajdziesz podejrzany nośnik albo podłączysz go przez pomyłkę:

1. **Nie ukrywaj tego.** Od razu zgłoś sprawę do działu IT lub bezpieczeństwa. Liczą się minuty.
2. **Nie podłączaj nośnika ponownie** i nie otwieraj jego zawartości „żeby sprawdzić”.
3. **Odłącz komputer od sieci**, jeśli tak mówi procedura firmy albo prosi o to dział IT.
4. **Zachowaj nośnik, kopertę i ich opis** (gdzie i kiedy znaleziono). To dowody potrzebne do analizy.
5. **Zgłoś też próby**: koperta pod wycieraczką albo „zgubiony” pendrive w recepcji to sygnał, że ktoś celuje w firmę.

Firma, w której zgłoszenie pomyłki nie grozi karą, wykrywa ataki szybciej.

## Zanim podłączysz nośnik: lista kontrolna

- [ ] Czy to na pewno mój nośnik, z którym wiem, skąd go mam?
- [ ] Czy znalazłem go przypadkowo albo dostałem od kogoś, kogo nie znam?
- [ ] Czy podpis lub zawartość mnie intryguje, goni albo gra na emocjach (ciekawość, strach)?
- [ ] Czy w środku jest archiwum ZIP/RAR albo plik, którego nie rozpoznaję?
- [ ] Czy polityka firmy w ogóle pozwala na podłączanie takich urządzeń?

Jeśli choć jedna odpowiedź budzi wątpliwość, nie podłączaj nośnika i oddaj go do IT lub ochrony.

## Słowniczek

| Pojęcie | Znaczenie |
|---|---|
| Baiting | Atak z przynętą: ofiara sama sięga po podrzucony nośnik lub plik. |
| RAT | Remote Access Trojan: program, który po cichu daje atakującemu zdalny dostęp do komputera ofiary. |
| Ransomware | Złośliwe oprogramowanie szyfrujące dane i żądające okupu. |
| Keylogger | Program zapisujący wciskane klawisze. |
| OSINT | Biały wywiad, czyli zbieranie informacji z publicznie dostępnych źródeł. |
| Socjotechnika | Wykorzystanie zaufania, ciekawości i pośpiechu, żeby skłonić człowieka do działania. |
| Polityka USB | Zasady firmy dotyczące nośników: blokada portów lub lista zatwierdzonych urządzeń. |
| EDR | Narzędzie obserwujące zachowanie komputerów i wykrywające podejrzane procesy. |
| Zasada najmniejszych uprawnień | Każde konto ma dostęp tylko do tego, czego potrzebuje do pracy. |

## Pytania kontrolne (do quizu Moodle)

Prawidłowa odpowiedź jest oznaczona ✔. Pytania można przenieść do banku pytań jako pytania wielokrotnego wyboru.

1. **Znajdujesz na firmowym parkingu pendrive'a w kopercie z podpisem „Zdjęcia z imprezy firmowej”. Co robisz?**
   - Podłączam go do komputera i sprawdzam, czyje to.
   - ✔ Nie podłączam go nigdzie i oddaję do działu IT lub ochrony.
   - Podłączam go do prywatnego laptopa, żeby nie ryzykować firmowego.

2. **Dlaczego atakujący wybrał nowego pracownika działu wsparcia, a nie dyrektora?**
   - Nowy pracownik ma najwyższe uprawnienia.
   - ✔ Nowa osoba zwykle nie zna jeszcze procedur i chce zrobić dobre wrażenie, a atak na dyrektora szybciej wzbudziłby alarm.
   - Dyrektor nie używa komputera.

3. **Co z nazwy dysku i podpisu na kopercie wynika o bezpieczeństwie nośnika?**
   - Że nośnik jest bezpieczny, jeśli podpis jest zgodny z nazwą firmy.
   - ✔ Nic, bo każdy może je ustawić.
   - Że nośnik został sprawdzony przez ochronę.

4. **Dlaczego atakujący ukrył wirusa w archiwum ZIP obok zdjęć?**
   - Żeby plik zajmował mniej miejsca.
   - ✔ Proste skanery często nie sprawdzają zawartości archiwów, a użytkownik widzi tylko niewinne pliki.
   - Żeby pendrive uruchomił się sam po podłączeniu.

5. **Które zasady firmy najlepiej ograniczają skutki podrzuconego pendrive'a?**
   - Wymóg zmiany hasła co tydzień.
   - ✔ Blokada portów USB lub biała lista urządzeń oraz szkolenie z baitingu od pierwszego dnia pracy.
   - Zakaz używania poczty elektronicznej.

6. **Jakie informacje o firmie i pracownikach publicznie dostępne ułatwiły atak?**
   - Hasła do kont pracowników.
   - ✔ Stanowiska, staż i opisy obowiązków oraz zdjęcia i opisy imprez z wydarzeń firmowych.
   - Numer NIP firmy.

7. **Kliknąłeś w pendrive'a lub otworzyłeś plik z nieznanego nośnika. Co robisz najpierw?**
   - Usuwam pliki i nikomu nic nie mówię.
   - ✔ Od razu zgłaszam sprawę do działu IT lub bezpieczeństwa i odłączam komputer od sieci, jeśli tak mówi procedura.
   - Podłączam pendrive'a jeszcze raz, żeby sprawdzić, co zawierał.

8. **Pod Twoim samochodem lub domem leży niezamówiona koperta bez nadawcy. Co robisz?**
   - Otwieram ją w pracy, bo sprawdzą to tam na pewno.
   - ✔ Traktuję ją jako podejrzaną i zgłaszam ochronie lub IT, bez sprawdzania zawartości na komputerze.
   - Wrzucam jej zawartość do skanera antywirusowego na własnym laptopie.
