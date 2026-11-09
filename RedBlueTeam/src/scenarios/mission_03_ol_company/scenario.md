# Misja 3: O&L Company
- id: mission-3-ol-company
- firma: O&L Company
- nagroda: 4.02 BTC
- kolor: #00ff66
- data fabularna: 19.05.2026
- ocenianych decyzji: 6

Źródło prawdy: `docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md` (VR, 6 decyzji D1–D6) oraz uwagi właściciela z testu; przebudowa wg `docs/rebuild-plan.md` (porcje A–H). Kolejność etapów (Kill Chain): uzbrojenie → rekonesans i cel → nośnik → dostarczenie dronem → sesja RAT. Wynik zaliczający: 80%. Podsumowanie: „ZHAKOWANO O&L”, „UKOŃCZONO ZADANIE 3”.

## Intro (dialog z BYTE_MASTER)
- BM: WITAJ, HAKERZE! PRZED TOBĄ KOLEJNE ZADANIE
- GRACZ: JASNE, CHOCIAŻ MIŁO BY BYŁO WIEDZIEĆ NA CZYM STOJĘ I ILE JESZCZE ZADAŃ PRZEDE MNĄ, ZANIM PRZYJMIECIE MNIE DO DARKSUN
- BM: CIERPLIWOŚCI. JESTEŚ NA DOBREJ DRODZE, PÓKI CO BARDZO NAM POMAGASZ W WALCE Z KONCERNAMI
- GRACZ: OK, NIECH BĘDZIE. A WIĘC?
- BM: O&L COMPANY TO JEDNA Z WIĘKSZYCH SPÓŁEK PALIWOWYCH. Z MOICH ŹRÓDEŁ WYNIKA, ŻE MAJĄ BRAKUJĄCĄ CZĘŚĆ DOKUMENTACJI NA TEMAT FREEVOLT, W TYM OPIS CAŁEJ INFRASTRUKTURY, WIĘC TO BARDZO CENNE DANE. ZDOBYCIE ICH BĘDZIE WYMAGAŁO OD CIEBIE KREATYWNOŚCI
- GRACZ: CZY WIRUS, KTÓRY PRZEJMIE PULPIT PRACOWNIKA JEST WYSTARCZAJĄCO KREATYWNY?
- BM: TO ZALEŻY JAK GO DOSTARCZYSZ
- GRACZ: DAJ MI CHWILĘ
- odblokuj: //BAZA_WIRUSÓW (zaraz po starcie pulpitu, bez kwestii w czacie)

## Etap 1: //BAZA_WIRUSÓW
Klocek: NOWA MINIGRA (`VirusLabApp`, componentId `ol_virus_lab`: wybór wirusa → ładowanie → matryca kompilacji w formie zdrapki)
Cel dydaktyczny: dobór typu malware do celu operacji (cicha kradzież danych) i zrozumienie, z jakich części składa się trojan zdalnego dostępu.
Ekrany: wybór wirusa (D1) → matryca kompilacji: czarne pole z „?”, spod którego gracz zdrapuje grafikę wirusa, pod spodem pasek postępu i cztery podpisy części (PODGLĄD EKRANU, STEROWANIE, CICHE TŁO, ŁĄCZNOŚĆ) → „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”
Oceniane: D1 | Flavor (nieoceniane): matryca kompilacji

Decyzja D1: "WYBIERZ ODPOWIEDNIEGO WIRUSA"
- RAT: REMOTE ACCESS TROJAN — "POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY" | ideal | Daje bezpośredni, interaktywny wgląd w pulpit stacji roboczej pracownika i pozwala na swobodną eksplorację zasobów korporacyjnych bez wszczynania alarmu.
- RANSOMWARE — "MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ" | suboptimal | Zablokowanie stacji ofiary natychmiast postawi na nogi dział IT i zablokuje możliwość cichego wykradzenia dokumentacji Freevolt.
- KEYLOGGER — "POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE" | critical | Samo przechwytywanie wciśnięć klawiszy nie gwarantuje dostępu do zgromadzonych na dyskach plików projektowych i schematów.

Opcje wyświetlają się w losowej kolejności (konwencja silnika). Po wyborze Ransomware gra toczy się dalej jak z RAT (werdykt w debriefie).

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?"
- BM: "ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD"
- odblokuj: //TOR: PRZEGLĄDARKA

## Etap 2: //TOR: PRZEGLĄDARKA
Klocek: NOWA MINIGRA (`OsintBrowserApp`, componentId `ol_osint_browser`: strona firmy → cel → wektor)
Cel dydaktyczny: pokazanie, że publiczne informacje o firmie i pracownikach (OSINT) pozwalają dobrać najsłabsze ogniwo i wiarygodną przynętę.
Ekrany: okno przeglądarki ze stroną O&L Company (https://olcompany.cloud) i dwiema zakładkami, STRONA GŁÓWNA (hero „JESTEŚMY JEDNYM Z NAJWIĘKSZYCH DYSTRYBUTORÓW PALIW”, kontakt, „NASI EKSPERCI:” z pięcioma osobami: zdjęcie, imię i nazwisko, stanowisko, staż „W O&L OD: …”, opis zakresu pracy) oraz WYDARZENIA (dwa wpisy: impreza integracyjna działu sprzedaży z trzema zdjęciami, impreza integracyjna działu logistyki z dwoma) → wybór celu (D2) → wybór wektora (D3). Przewija się tylko wnętrze okna strony; przycisk „PRZEJDŹ DO WYBORU CELU” aktywuje się po przewinięciu obu zakładek do końca. Z ekranu wyboru celu nie ma powrotu do strony.
Oceniane: D2, D3 | Flavor (nieoceniane): rozpoznanie strony

Pracownicy: JAN ŁUKASIEWICZ (CEO), SŁAWOMIR BIAŁEK (SZEF DZIAŁU CYBERBEZPIECZEŃSTWA), WIKTORIA GAŁECKA (SPECJALISTKA DS. LOGISTYKI), AGNIESZKA LEMAN (SZEFOWA DZIAŁU SPRZEDAŻY), MATEUSZ KLIMOWICZ (JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA, w firmie od 2 tygodni). Opisy mówią wyłącznie o zakresie pracy i stażu, bez słowa o szkoleniach z bezpieczeństwa.

Decyzja D2: "KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?"
- MATEUSZ KLIMOWICZ | ideal | Nowo zatrudniony pracownik na juniorskim stanowisku charakteryzuje się najmniejszym doświadczeniem, brakiem obycia z procedurami bezpieczeństwa i najwyższą podatnością na socjotechnikę.
- WIKTORIA GAŁECKA | suboptimal | Doświadczone pracownice wyższego szczebla, które zachowują większą ostrożność wobec nietypowych nośników pamięci.
- AGNIESZKA LEMAN | suboptimal | Doświadczone pracownice wyższego szczebla, które zachowują większą ostrożność wobec nietypowych nośników pamięci.
- SŁAWOMIR BIAŁEK | critical | Zaatakowanie szefa bezpieczeństwa lub CEO tak jawnym wektorem to gwarancja natychmiastowego zgłoszenia incydentu i spalenia całej operacji.
- JAN ŁUKASIEWICZ | critical | Zaatakowanie szefa bezpieczeństwa lub CEO tak jawnym wektorem to gwarancja natychmiastowego zgłoszenia incydentu i spalenia całej operacji.

Karty celu mają tylko imię i nazwisko (stanowisko trafia do raportu jako odpowiedź). Nie ma „cofania” po złym wyborze.

Decyzja D3: "JAK GO OSZUKASZ?"
- MAM ZDJĘCIA I INFORMACJE O OSTATNIEJ IMPREZIE DZIAŁU SPRZEDAŻY. PODRZUCĘ MU PENDRIVE Z KILKOMA KOMPROMITUJĄCYMI ZDJĘCIAMI. WIRUSA UKRYJĘ W ARCHIWUM ZIP | ideal | Idealnie wykorzystuje świeże wydarzenie firmowe oraz naturalną ludzką ciekawość i strach przed kompromitacją, a spakowanie złośliwego kodu do ZIP omija proste skanery antywirusowe.
- PODRZUCĘ MU PENDRIVE Z DOKUMENTAMI HR DOTYCZĄCYMI ZWOLNIEŃ | suboptimal | Wzbudza silny lęk, lecz junior w dziale wsparcia może uznać to za pomyłkę i odnieść nośnik prosto do kadr.
- PO PROSTU ZOSTAWIĘ PUSTY PENDRIVE Z PODPISEM KEYLOGGER | critical | Całkowity brak kamuflażu socjotechnicznego natychmiast zaalarmuje pracownika i spowoduje zablokowanie nośnika przez administratora.

Mostek (rozmowa do kolejnego etapu):
- BM: "DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE"
- BM: "WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ"
- GRACZ: "ODBIERAM PLIKI. PRZYGOTUJĘ NOŚNIK." [SPÓJNIK]
- odblokuj: //DYSK E: PENDRIVE

## Etap 3: //DYSK E: PENDRIVE
Klocek: NOWA MINIGRA (`PendriveApp`, componentId `ol_pendrive`: załączniki → plik i RAT na pendrive'a → nazwa dysku → podpis na kopercie)
Cel dydaktyczny: zrozumienie, jak przygotowuje się przynętę fizyczną (baiting): dobór zawartości pasującej do ofiary, nazwy nośnika i podpisu zachęcającego do podłączenia.
Ekrany: „POBIERZ ZAŁĄCZNIKI” (trzy pliki: IMG_00034521.JPG X3, DOKUMENTY_HR.DOCX, WYPOWIEDZENIE_UMOWY_O_PRACE.PDF) → przeciągnięcie pliku pasującego do planu z D3 na pendrive'a (błędny plik wraca na listę z komunikatem, bez kary), potem przeciągnięcie //WIRUS: RAT na ten plik (powstaje archiwum, np. FOTKI_AFTERPARTY.ZIP) → „WYBIERZ NAZWĘ PENDRIVE'A:” (4 karty) → „WYBIERZ PODPIS NA KOPERCIE” z przyciskiem „WYSUŃ PAMIĘĆ USB” → „PENDRIVE GOTOWY. WYSUNIĘTO PAMIĘĆ USB.”
Oceniane: D4 (poziom D4 = gorszy z dwóch kroków: nazwa dysku, podpis) | Flavor (nieoceniane): wybór pliku, pakowanie RAT do archiwum

Nazwa dysku (krok w ramach D4; VR podaje tylko wybór idealny `IMPREZA`):
- KEYLOGGER | critical | Nazwa „KEYLOGGER” to natychmiastowa kompromitacja nośnika. (odpowiedź w raporcie: „NAZWA DYSKU: KEYLOGGER”)
- ZDJĘCIA B&O COMPANY | suboptimal | Błędna nazwa firmy („B&O” zamiast „O&L”) może zaalarmować użytkownika lub analityka.
- IMPREZA | ideal | Naturalna, wiarygodna etykieta woluminu spójna z przygotowaną przynętą.
- NOWY DYSK | suboptimal | Zbyt ogólna nazwa nie wzmacnia przynęty i może budzić obojętność.

Decyzja D4: "WYBIERZ PODPIS NA KOPERCIE"
- ZDJĘCIA Z AFTERPARTY O&L COMPANY! | ideal | Precyzyjnie nawiązuje do właściwej nazwy koncernu i nieformalnego charakteru imprezy, wzbudzając maksymalne zaufanie i motywację do natychmiastowego otwarcia.
- PENDRIVE ZE ZDJĘCIAMI B&O COMPANY | suboptimal | Błędna nazwa firmy („B&O” zamiast „O&L”) wprowadza dysonans i może skłonić ofiarę do zignorowania nośnika jako cudzej własności.
- ZGUBIONE DOKUMENTY | critical | Etykieta stoi w całkowitej sprzeczności ze spakowanymi zdjęciami i przygotowaną legendą socjotechniczną, prowokując oddanie koperty do ochrony.
- WYPOWIEDZENIE UMOWY | critical | Etykieta stoi w całkowitej sprzeczności ze spakowanymi zdjęciami i przygotowaną legendą socjotechniczną, prowokując oddanie koperty do ochrony.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI"
- GRACZ: "MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?"
- BM: "JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW, POLSKA (PL)"
- BM: "DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA. WTEDY W PRACY NA PEWNO SPRAWDZI ZAWARTOŚĆ"
- GRACZ: "JASNE, SŁYSZYMY SIĘ ZA KILKA GODZIN"
- PRZESKOK CZASU: 22:15 → 06:02 ("DO PORANKA…")
- BM: "JUŻ CZAS. DRON GOTOWY DO WYLOTU?"
- GRACZ: "JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE'A"
- odblokuj: //DRON: CONDOR MIT63 (po przeskoku z opóźnieniem 3 s)

## Etap 4: //DRON: CONDOR MIT63
Klocek: NOWA MINIGRA (`DroneApp`, componentId `ol_drone`: aktywacja → podpięcie koperty → mapa → lot → kamera parkingu → zrzut)
Cel dydaktyczny: uświadomienie, że atak może sięgać poza sieć: dostarczenie przynęty pod dom i do samochodu ofiary na podstawie danych z rekonesansu.
Ekrany: aktywacja drona CONDOR MIT63 (stałe przekazywanie wideo, maks. 25 KM/H, połączenie z odbiornikiem hakera) → przygotowanie do wylotu i podwieszenie koperty z pendrive'em (podpis i archiwum z //DYSK E) → mapa miasta z czterema adresami (D5) → lot → „URUCHOM KAMERĘ” → widok z góry na parking: osiem aut w dwóch rzędach, HUD (bateria 48%, zegar transmisji), celownik (D6) → „ZRZUĆ ŁADUNEK” → „POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'M. DRON WRACA DO POKOJU HAKERA”
Oceniane: D5, D6 | Flavor (nieoceniane): aktywacja, podpięcie koperty, lot, zrzut

Rozmowa przy otwarciu (gra raz w czacie, przy pierwszym otwarciu aplikacji):
- BM: "WSKAŻ DOM MATEUSZA NA MAPIE. ADRES WYSŁAŁEM CI WCZEŚNIEJ. PRZEWIŃ CZAT, JEŚLI GO NIE PAMIĘTASZ"
- BM: "GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM."

Decyzja D5: "WSKAŻ DRONOWI ADRES DOMU OFIARY"
- OŁAWSKA 51B (NADODRZE) | suboptimal | Skierowanie drona w zupełnie inną dzielnicę Wrocławia; ładunek nie trafi do rąk wytypowanej ofiary.
- DRZYMAŁY 38D (PILCZYCE) | suboptimal | Skierowanie drona w zupełnie inną dzielnicę Wrocławia; ładunek nie trafi do rąk wytypowanej ofiary.
- WYSTAWOWA 23A (ZALESIE) | critical | Wysłanie drona w rejon obiektów użyteczności publicznej (Hala Stulecia) grozi przechwyceniem nośnika przez osoby trzecie.
- OŁTASZYŃSKA 92C (PARTYNICE) | ideal | Prawidłowy adres domowy Mateusza Klimowicza przekazany wcześniej przez mentora w wywiadzie operacyjnym.

Decyzja D6: "WYBIERZ MIEJSCE NA PARKINGU, GDZIE OFIARA NA PEWNO ZNAJDZIE KOPERTĘ Z PENDRIVE'M"
Gracz wskazuje auto na scenie (nie z listy); poniżej etykiety aut. Odpowiedź w raporcie dla ideal: „BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY”.
- BIAŁY SAMOCHÓD Z CZERWONYM DACHEM | ideal | Koperta zostaje precyzyjnie umieszczona na samochodzie Mateusza, gwarantując jej odnalezienie przed wyjazdem do biura.
- CIEMNY SUV / BIAŁY SEDAN Z BIAŁYM DACHEM / ZIELONY HATCHBACK / SREBRNY SEDAN / CZERWONY HATCHBACK Z BIAŁYM DACHEM / POMARAŃCZOWY VAN / CZARNE KOMBI (po jednej opcji na auto) | suboptimal | Koperta trafi do przypadkowego sąsiada, co drastycznie zmniejsza szansę na dostarczenie payloadu do biura O&L Company.
- PUSTY ASFALT MIĘDZY MIEJSCAMI PARKINGOWYMI (kliknięcie w tło sceny) | critical | Zgubienie lub zniszczenie nośnika pod kołami innych pojazdów oraz całkowite fiasko operacji drop USB.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA"
- PRZESKOK CZASU: 06:02 → 08:12 ("DO GODZIN PRACY BIURA…")
- odblokuj: //WIRUS: RAT — SESJA (po przeskoku z opóźnieniem 3 s; z przychodzącym połączeniem „MALWARE ZOSTAŁ AKTYWOWANY”, dźwięk alarmu)

## Etap 5: //WIRUS: RAT — SESJA
Klocek: NOWA MINIGRA (`RatSessionApp`, componentId `ol_rat_session`, finał wizualny)
Cel dydaktyczny: zobaczenie skutku udanego ataku: pełna kontrola nad pulpitem pracownika i dostęp do sieci firmy.
Ekrany: alert aktywacji („PENDRIVE ZOSTAŁ PODŁĄCZONY. MALWARE ZOSTAŁ AKTYWOWANY”; MATEUSZ_BIURO_O&L, 161.185.160.93, archiwum i nazwa dysku wybrane przez gracza) z przyciskiem „PRZEJMIJ PULPIT OFIARY” → pulpit ofiary (KOSZ, TEN KOMPUTER, FREEVOLT z pomarańczowym trójkątem ostrzegawczym) → folder FREEVOLT z czterema plikami do przeciągnięcia na „PULPIT HAKERA” → schemat sieci (haker, węzeł pośredni, trzy zainfekowane stacje) „UZYSKAŁEŚ ZDALNY DOSTĘP DO SIECI O&L COMPANY” z przyciskiem „PODSUMOWANIE ZADANIA”
Oceniane: Flavor (bez oceny; brak decyzji)

Mostek (rozmowa końcowa):
- GRACZ: "MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?"
- BM: "WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI"
- BM: "JESTEŚMY W KONTAKCIE!"
- odblokuj: //RAPORT POOPERACYJNY

## Debrief
Lekcje przy decyzjach (rozwijane w raporcie pooperacyjnym; treść w `data/mission3.json`, `step6.choices[].attack` / `.defense`). Tabela wyborów powstaje z decyzji etapów; zamiast osobnej karuzeli „CO POWINIENEŚ ZAPAMIĘTAĆ?” z dokumentu wskazówki obronne niosą lekcje.

D1:
- Atak: RAT (Remote Access Trojan) daje atakującemu zdalny pulpit na stacji pracownika. Działa w tle jak zwykła usługa systemowa, więc nie wywołuje alarmu, a z jednego komputera można sięgnąć do dokumentacji w sieci firmy. Ransomware zablokowałby stację i od razu postawił na nogi dział IT, a keylogger pokazałby tylko wciskane klawisze, bez dostępu do plików projektowych i schematów.
- Obrona: Sygnały: nieznany proces lub usługa startująca razem z systemem, nietypowy ruch wychodzący na obcy adres, pulpit, który „sam się rusza”. Co zrobić: ogranicz uprawnienia kont (zasada najmniejszych uprawnień), korzystaj z EDR i monitoringu ruchu wychodzącego, a przy podejrzeniu infekcji odłącz stację od sieci i zgłoś incydent do IT.

D2:
- Atak: Atakujący wybiera najsłabsze ogniwo, a nie najważniejszą osobę. Strona firmy pokazywała, że Mateusz pracuje w O&L od dwóch tygodni i obsługuje klientów, więc najpewniej nie zna jeszcze procedur i chce zrobić dobre wrażenie. CEO i szef cyberbezpieczeństwa zgłosiliby incydent od razu, a doświadczone pracownice wyższego szczebla są ostrożniejsze wobec nietypowych nośników.
- Obrona: Sygnały: publicznie widoczny staż, stanowisko i zakres obowiązków każdej osoby na stronie firmy. Wszystkie informacje o Tobie w sieci mogą zostać użyte przeciwko Tobie. Co zrobić: szkolenie z cyberbezpieczeństwa już pierwszego dnia pracy (przed dostępem do systemów), jasna procedura zgłaszania podejrzanych rzeczy i kultura, w której nikt nie boi się zapytać IT. Warto też nie ujawniać na stronie firmy zbędnych szczegółów o stażu i obowiązkach osób.

D3:
- Atak: To baiting: fizyczny nośnik z przynętą, która nawiązuje do prawdziwego wydarzenia (impreza działu sprzedaży, znana z publicznych wpisów firmy). Zdjęcia z imprezy chce obejrzeć każdy, a ładunek ukryty w archiwum ZIP omija proste skanery antywirusowe. Dokumenty HR o zwolnieniach mogłyby trafić prosto do kadr, a pusty pendrive z podpisem KEYLOGGER zaalarmowałby pracownika i administratora.
- Obrona: Sygnały: nośnik USB, którego nikt nie zamawiał i który „przypadkiem” trafił do Ciebie; przynęta pasująca do niedawnego wydarzenia; archiwum ZIP lub RAR z nieznanego źródła. Co zrobić: wirusy mogą kryć się w dowolnym pliku, szczególnie w archiwach .zip i .rar. Jeśli nie masz pewności, skąd pochodzi plik i czy jest bezpieczny, poproś o pomoc administratora lub dział IT. Firma powinna też ograniczyć zdjęcia z wydarzeń publikowane w sieci.

D4:
- Atak: Nazwa dysku („IMPREZA”) i podpis na kopercie budują legendę nośnika: „zdjęcia z afterparty” z poprawną nazwą firmy sugerują, że ktoś zgubił coś bliskiego pracownikowi i warto to sprawdzić. Błędna nazwa firmy (B&O zamiast O&L) wprowadza dysonans, a podpis „WYPOWIEDZENIE UMOWY” lub „ZGUBIONE DOKUMENTY” sprzeczny ze zdjęciami skłoniłby do oddania koperty ochronie. Nazwa „KEYLOGGER” zdradziłaby nośnik od razu.
- Obrona: Sygnały: koperta z pendrive'em zostawiona tam, gdzie na pewno ją znajdziesz, z podpisem skłaniającym do ciekawości. Co zrobić: nie wkładaj znalezionych ani podejrzanych pendrive'ów do swojego komputera, bo każdy nośnik pamięci to potencjalne ryzyko infekcji. Nazwa dysku i podpis niczego nie dowodzą, bo każdy może je ustawić. Zanieś kopertę do IT lub ochrony, a w programie antywirusowym włącz skanowanie dysków przenośnych.

D5:
- Atak: Atak sięgnął poza sieć: dron dostarcza przynętę pod dom ofiary, bo adres da się ustalić z publicznych źródeł i danych zdobytych w rozpoznaniu. Zostawienie koperty przy samochodzie, którym ofiara jedzie do pracy, przenosi zainfekowany nośnik prosto do firmy. Pomyłka adresu oznaczałaby koniec operacji, a w rejonie obiektów użyteczności publicznej nośnik przechwyciłyby osoby trzecie.
- Obrona: Sygnały: tajemnicza przesyłka lub drobny przedmiot pozostawiony przy domu albo samochodzie bez nadawcy. Co zrobić: ogranicz publikowanie adresu, zdjęć domu i auta w mediach społecznościowych (higiena OSINT) i traktuj niezamówione przesyłki jako podejrzane. Firma powinna uczyć, że ataki mogą zacząć się poza biurem i że znaleziony nośnik niezależnie od miejsca to zagrożenie.

D6:
- Atak: Dokładne rozpoznanie pojazdu ofiary na parkingu pokazuje, jak szczegółowe jest przygotowanie takiego ataku. Wystarczy opis auta z rozmowy lub zdjęcie z mediów społecznościowych. Koperta na złym samochodzie trafia do przypadkowego sąsiada i zdradza próbę ataku, a koperta upuszczona na asfalt może zostać zgubiona lub zniszczona.
- Obrona: Sygnały: obce przedmioty lub koperty pozostawione na szybie albo pod wycieraczką, szczególnie bez wiadomego nadawcy. Co zrobić: nie sprawdzaj takiej przesyłki w komputerze, zgłoś ją ochronie lub IT. Nie wrzucaj zdjęć, na których widać swój samochód i tablice, i zachowaj zasadę ograniczonego zaufania do podrzuconych rzeczy na parkingu.

## Odchylenia od VR / do decyzji
Zbiorcza lista odstępstw od dokumentu scenariusza (O1–O15 i rozstrzygnięcia właściciela P1–P10 z `docs/rebuild-plan.md`, sekcja 8) oraz zmian z implementacji.
- [DO DECYZJI] Hiperłącze `https://olcompany.cloud` w czacie nie otwiera przeglądarki; kafelek //TOR odblokowuje się po kwestii gracza i świeci. Drugiego przycisku „PRZEJDŹ DO HAKOWANIA” z mostka nie ma (konwencja silnika: czat to rozmowa, nie launcher).
- [DO DECYZJI] Zakładka WYDARZENIA jest czytana przed D2 (VR: po D2). Gracz przewija obie zakładki, potem odpowiada na D2 i D3 jedno po drugim; z wyboru celu nie ma powrotu do strony (uwaga właściciela „najpierw rozpoznanie, potem tylko odpowiedź”, P3). Strona przewija się pionowo (świadomy wyjątek od „bez przewijania”: przewija się tylko wnętrze okna).
- [DO DECYZJI] Kwestie „w minigrze” po D2 (GRACZ „WIDZĘ, ŻE MAJĄ NOWEGO JUNIORA…”, BM „DOBRY WYBÓR…”) pominięte, bo zależą od wyboru i zdradzałyby ocenę; pytanie mentora zastępuje etykieta strefy D3 „JAK GO OSZUKASZ?”.
- [DO DECYZJI] Matryca kompilacji jako zdrapka: gracz zdrapuje czarną maskę kursorem lub palcem, próg 92% odsłoniętego pola liczy się jako 100% paska, dodane cztery podpisane części wirusa (zrozumiałość dla laika). Scena S02 nie ma przycisku „KONTYNUUJ”: etap kończy się sam po komunikacie „WIRUS GOTOWY!”.
- [DO DECYZJI] Nazwa dysku i podpis na kopercie to jedna decyzja D4 (P1): poziom D4 = gorszy z dwóch kroków. Wybór pliku i pakowanie RAT są nieoceniane, ale plik musi pasować do planu z D3 (błędny wraca na listę z komunikatem). Ładunek RAT przeciąga się w oknie //DYSK E, bo kafelek `item_virus_payload` z VR byłby zasłonięty przez okno aplikacji.
- [DO DECYZJI] //DRON bez przycisku „WYŁĄCZ APLIKACJĘ DRONA” (VR: przycisk końcowy): po komunikacie o zrzucie etap kończy się sam. „ZRZUĆ ŁADUNEK” zatwierdza D6, „WYSUŃ PAMIĘĆ USB” zatwierdza D4.
- [DO DECYZJI] Parking ma 8 aut, nie 5 (P4): oprócz aut z VR są łudząco podobne (biały sedan z białym dachem, czerwony hatchback z białym dachem), żeby opis mentora miał znaczenie. Opcja „zrzut na inne auto” rozpisana na 7 aut suboptimal; „pusty asfalt” (critical) to kliknięcie w tło sceny. Auto opisuje BM w czacie przy otwarciu aplikacji (`openingConversation`), bez zdjęcia-wzorca; zdanie „PRZESYŁAM CI ZDJĘCIE” pominięte.
- [DO DECYZJI] Przeskoki czasu to lecący zegar: noc 22:15 → 06:02 i poranek 06:02 → 08:12. Godzina startowa 22:15 jest dodatkiem (VR podaje „upływ czasu do poranka” bez godziny), podobnie podpisy „DO PORANKA…” i „DO GODZIN PRACY BIURA…”.
- [DO DECYZJI] Pliki FREEVOLT na pulpicie ofiary: po kliknięciu ikony otwiera się folder z czterema plikami (OPIS_INFRASTRUKTURY, DOKUMENTACJA_CZ2, SCHEMAT_SIECI, UMOWY_DOSTAWCOW), które gracz przeciąga na „PULPIT HAKERA” (uwaga właściciela 5, P7; VR ma tylko klik w ikonę). Nieoceniane, bez dystraktorów.
- [DO DECYZJI] Meldunek końcowy (GRACZ, BM, BM „JESTEŚMY W KONTAKCIE!”) pada w mostku po etapie //WIRUS: RAT — SESJA, nie między pulpitem a kliknięciem FREEVOLT (rozmowa mostkująca następuje po zamknięciu aplikacji). Etykieta kafelka „//WIRUS: RAT — SESJA” (VR: „//WIRUS: RAT (C2)”), etykieta „//TOR: PRZEGLĄDARKA”.
- [DO DECYZJI] Schemat sieci: stacje `MATEUSZ_BIURO_O&L`, `STACJA-02`, `STACJA-03` (VR: „3 zainfekowane stacje”); przycisk „PODSUMOWANIE ZADANIA”.
- [DO DECYZJI] Pasek certyfikatu „4/10” i stan portfela (5,50 → 9,52 BTC) z VR poza zakresem (P9); silnik zna tylko `rewardBtc`. Slajdy „CO POWINIENEŚ ZAPAMIĘTAĆ?” tylko jako lekcje atak/obrona i baza Moodle (P10).
- [DO DECYZJI] Standard M2+: `AppHeader` z paskiem ZADANIE, ekrany bez podpowiedzi oceny (etykiety poziomów, natychmiastowy feedback, wskaźniki zgodności usunięte), opcje decyzji tasowane, kroki bez decyzji kończą się same po komunikacie, pamięć stanu aplikacji (`AppHost`). Grafiki mają zastępniki, dopóki pliki nie trafią do `assets/<grupa>/`.
- [SPÓJNIK] „ODBIERAM PLIKI. PRZYGOTUJĘ NOŚNIK.” po kwestiach BM o archiwum i plikach (VR kończy kwestią BM). Spójnik „NAJPIERW STWORZĘ WIRUSA.” z dawnej implementacji usunięty: intro kończy się „DAJ MI CHWILĘ”.
- [NIEPEWNE] Literówki VR przepisane dosłownie („NAM POBICIE TROCHĘ DRAMATURGIĘ”, „B&O COMPANY” jako celowy błąd firmy w opcjach suboptimal); poprawione tylko „ZOSTAWIE” → „ZOSTAWIĘ” (P6). Kod pocztowy adresu z VR: 53-034 (dawny kod: 53-234).
- [DO ZAPROJEKTOWANIA] Poziomy nazw dysku w D4 (VR podaje tylko wybór idealny `IMPREZA`; pozostałe z dawnej implementacji, `KEYLOGGER` critical), odpowiedzi do raportu dla opcji poza ścieżką ideal (D2: stanowisko osoby; D3 suboptimal „PODRZUCĘ PENDRIVE Z DOKUMENTAMI HR O ZWOLNIENIACH”; D3 critical „PUSTY PENDRIVE Z PODPISEM KEYLOGGER”), staż „W O&L OD: …” i opisy pracowników, wpisy WYDARZENIA bez dat rocznych, lekcje atak/obrona D1–D6: propozycja do recenzji właściciela.
- [DO DECYZJI] Raport D4: gdy ocenę wyznacza nazwa dysku (gorsza od podpisu), odpowiedź w raporcie to `NAZWA DYSKU: X / PODPIS: Y` (VR: sam podpis), żeby gracz widział, co obniżyło ocenę. Przy ocenie wyznaczonej przez podpis (także przy remisie) odpowiedź to sam podpis, jak w debriefie VR.
- [DO DECYZJI] D1: opisy opcji z VR („POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY”, „MOŻE ZASZYFROWAĆ…”, „POKAŻE WSZYSTKO CO OFIARA WPISUJE…”) zastąpiono neutralnymi definicjami typu programu, jak w M2 (RAT: program do zdalnego sterowania zainfekowanym komputerem; ransomware: program szyfrujący dane w celu okupu; keylogger: program rejestrujący wciśnięte klawisze). Wersje z VR oceniały przydatność i wskazywały odpowiedź. Etykiety (nazwy typów) i poziomy bez zmian.
- [DO DECYZJI] Zdrapka (dawniej „matryca kompilacji”): żargon „matryca kompilacji” usunięty z widocznych tekstów (ekran ładowania: „PRZYGOTOWANIE PROGRAMU DO SKŁADANIA…”; w danych zostaje nazwa wewnętrzna `matrix`). Podtytuł nagłówka pokazuje, po co jest ekran: „SKŁADASZ PROGRAM: RAT”. Grafika i cztery podpisy części zależą od wyboru z D1 (`matrix.variants`): po wyborze Ransomware (suboptimal, gra idzie dalej) ekran składa „RANSOMWARE” (szyfrowanie, klucz, rozprzestrzenianie, żądanie okupu), nie RAT. Pasek, podpisy i komunikat „WIRUS GOTOWY!” liczą się z jednego źródła (`matrixView`): po przekroczeniu progu 92% zdrapka jest domknięta (maska znika, pasek 100%, cztery podpisy zapalone naraz), a komunikat widać ok. 2 s.
- [DO DECYZJI] Daty wpisów WYDARZENIA zgodne z fabułą (dzień misji 19.05.2026, staż Mateusza ok. 2 tygodnie): impreza integracyjna działu sprzedaży „8 MAJA” (po starcie Mateusza, z powitaniem nowych pracowników; VR: „15 WRZEŚNIA”), wydarzenie logistyki „14 MARCA” (wcześniej; VR: „4 LISTOPADA”). Dzięki temu lekcja D3 o „świeżym wydarzeniu” jest prawdziwa. Test pilnuje kolejności i zgodności z datą misji.
- [DO DECYZJI] //TOR, układ okna strony: hero skrócony (mniejszy nagłówek, mniejsze marginesy), żeby przy 1366×768 od razu było widać kontakt i pierwszą osobę z „NASZYCH EKSPERTÓW”; strzałka „⌄” u dołu okna jest przyciskiem przewijającym stronę w dół (znika po dojściu do końca). Ekran wyboru celu nadal bez powrotu do strony (świadoma decyzja właściciela: najpierw research, potem tylko odpowiedzi).
- [DO DECYZJI] //DYSK E, ekran przygotowania nośnika: nad panelami jedna linijka przypominająca plan z D3 („PLAN: NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY”; odpowiedź D3 z raportu), żeby komunikat „TEN PLIK NIE PASUJE DO TWOJEGO PLANU” był zrozumiały. Po decyzji critical (nazwa „KEYLOGGER” albo podpis critical) wybór jest zablokowany do powtórki, więc podwójny klik nie zgłasza D4 dwa razy.
