# Misja 3: O&L Company
- id: mission-3-ol-company
- firma: O&L Company
- nagroda: 4.02 BTC
- kolor: #00ff66
- data fabularna: 19.05.2026
- ocenianych decyzji: 8

Źródło: **implementacja** (`stages.ts`, `data/mission3.json`, `minigames/`, `docs/migration-spec.md`) i decyzja właściciela „przepisać 1:1 na nowy silnik”. **Misja nie ma dokumentu VR**, więc nie ma tu znaczników odchyleń od nagrania; sekcja „Odchylenia” opisuje zmiany względem starego przebiegu M3 (widgety i `transitions`). Kolejność etapów (Kill Chain): wirus → rekonesans i cel → nośnik → dostarczenie dronem → sesja RAT.

## Intro (dialog z BYTE_MASTER)
- BM: Witaj, hakerze! Przed tobą kolejne zadanie.
- GRACZ: Jasne, chociaż miło by było wiedzieć na czym stoję i ile jeszcze zadań przede mną, zanim przyjmiecie mnie do DARKSUN.
- BM: Cierpliwości. Jesteś na dobrej drodze. Póki co bardzo nam pomagasz w walce z koncernami.
- GRACZ: Ok, niech będzie. A więc?
- BM: O&L Company to jedna z większych spółek paliwowych. Z moich źródeł wynika, że mają brakującą część dokumentacji na temat FREEVOLT, w tym opis całej infrastruktury, więc to bardzo cenne dane. Zdobycie ich będzie wymagało od ciebie kreatywności!
- GRACZ: Czy wirus, który przejmie pulpit pracownika jest wystarczająco kreatywny?
- BM: To zależy jak go dostarczysz.
- GRACZ: Daj mi chwilę.
- GRACZ: NAJPIERW STWORZĘ WIRUSA. [SPÓJNIK]
- odblokuj: //BAZA_WIRUSÓW

## Etap 1: //BAZA_WIRUSÓW
Klocek: NOWA MINIGRA (`VirusLabApp`, componentId `ol_virus_lab`: wybór wirusa → builder ładunku RAT)
Cel dydaktyczny: dobór typu malware do celu operacji (cicha kradzież danych) i poznanie, jak atakujący maskuje ładunek.
Ekrany: wybór wirusa → terminalowy builder ładunku RAT (3 grupy przełączników) → kompilacja → „WIRUS GOTOWY! PAKIET RAT SKOMPILOWANY POMYŚLNIE.”
Oceniane: D1 | Flavor (nieoceniane): builder RAT (moduł działania, metoda maskowania, pakiet wyjściowy). Zły zestaw tylko blokuje kompilację komunikatem, bez oceny i bez wykrycia. Poprawny: Reverse TCP Shell & Remote Desktop View + ukryty proces w tle (Background Service + Auto-start) + moduł .dll podpięty pod archiwum.

Decyzja D1: "WYBIERZ ODPOWIEDNIEGO WIRUSA:"
- RAT: REMOTE ACCESS TROJAN — "POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY" | ideal | RAT umożliwia pełny, cichy dostęp do stacji roboczej pracownika i zdalny podgląd pulpitu.
- KEYLOGGER — "POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE" | suboptimal | Opcja częściowa – rejestruje klawisze, ale nie daje dostępu do pulpitu.
- RANSOMWARE — "MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ" | critical | Zaalarmuje firmę natychmiast, a celem jest cicha kradzież danych.

Opcje w każdej decyzji wyświetlają się w losowej kolejności (konwencja silnika).

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?"
- BM: "ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD"
- odblokuj: //TOR: PRZEGLĄDARKA

## Etap 2: //TOR: PRZEGLĄDARKA
Klocek: NOWA MINIGRA (`OsintBrowserApp`, componentId `ol_osint_browser`: strona firmy → cel → wektor)
Cel dydaktyczny: pokazanie, że publiczne informacje o firmie i pracownikach (OSINT) pozwalają dobrać najsłabsze ogniwo i wiarygodną przynętę.
Ekrany: strona O&L (hero, kontakt, pracownicy z bio, zakładka WYDARZENIA z newsami) → wybór celu → wybór wektora. Notatka mentora na prawym monitorze (kwestie z intro i mostka).
Oceniane: D2, D3 | Flavor (nieoceniane): przeglądanie strony

Strona O&L (https://olcompany.cloud): „JESTEŚMY JEDNYM Z NAJWIĘKSZYCH DYSTRYBUTORÓW PALIW”. Pracownicy: JAN ŁUKASIEWICZ (CEO), SŁAWOMIR BIAŁEK (SZEF DZIAŁU CYBERBEZPIECZEŃSTWA), WIKTORIA GAŁECKA (SPECJALISTKA DS. LOGISTYKI), AGNIESZKA LEMAN (SZEFOWA DZIAŁU SPRZEDAŻY), MATEUSZ KLIMOWICZ (JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA, zatrudniony 2 tygodnie temu). Wydarzenia: „IMPREZA INTEGRACYJNA!” (17 WRZEŚNIA 2022, dział sprzedaży) i „SPOTKANIE!” (5 LISTOPADA 2020, dział logistyki).

Decyzja D2: "KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?"
- JAN ŁUKASIEWICZ (CEO) | suboptimal | Jan Łukasiewicz to CEO – jego poczta przechodzi przez asystentów i restrykcyjne filtry. Taki atak zostanie spalony szybko.
- WIKTORIA GAŁECKA (LOGISTYKA) | suboptimal | Dział logistyki pracuje w odizolowanym ERP i nie ma dostępu do dokumentacji infrastruktury FREEVOLT.
- MATEUSZ KLIMOWICZ (JUNIOR WSPARCIA) | ideal | Junior nie przeszedł jeszcze pełnego szkolenia anty-phishingowego – idealny wektor wejścia.
- SŁAWOMIR BIAŁEK (CISO) | critical | Szef SOC z 15-letnim stażem natychmiast zauważy anomalię, odetnie sieć i zabezpieczy logi.

Zachowanie D2 (małe rozgałęzienie): wybór CEO lub logistyki nie zgłasza decyzji, tylko pokazuje pushback mentora i wraca do wyboru; późniejszy wybór Mateusza liczy się wtedy jako suboptimal (agregacja zła próba → suboptimal). CISO od razu `critical`.

Decyzja D3: "JAK GO OSZUKASZ (WEKTOR SOCJOTECHNICZNY)?"
- PENDRIVE ZE ZDJĘCIAMI Z IMPREZY (WIRUS W ARCHIWUM ZIP) | ideal | Dzięki archiwum antywirus nie znajdzie zagrożenia, a kontekst imprezy usypia czujność ofiary.
- FAŁSZYWA FAKTURA VAT W PLIKU .EXE | critical | Plik .exe zostanie natychmiast zablokowany przez Windows Defendera i bramkę pocztową.

Mostek (rozmowa do kolejnego etapu):
- BM: "DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE. WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ."
- GRACZ: "ODBIERAM PLIKI. PRZYGOTUJĘ NOŚNIK."
- odblokuj: //DYSK E: PENDRIVE

## Etap 3: //DYSK E: PENDRIVE
Klocek: NOWA MINIGRA (`PendriveApp`, componentId `ol_pendrive`: załącznik → podpięcie RAT → wolumin → koperta)
Cel dydaktyczny: zrozumienie, jak przygotowuje się przynętę fizyczną (baiting): dobór zawartości, nazwy nośnika i opisu, który zachęca do podłączenia.
Ekrany: wybór pliku do wgrania (krok 1/4) → podpięcie RAT w archiwum ZIP (flavor) → nazwa woluminu → podpis na kopercie (krok 4/4) → „PENDRIVE GOTOWY. WYSUNIĘTO PAMIĘĆ USB.”
Oceniane: D4, D5, D6 | Flavor (nieoceniane): podpięcie //WIRUS: RAT do archiwum ZIP (warunek konieczny)

Decyzja D4: "JAKI PLIK WGRASZ NA PENDRIVE'A?"
- IMG_00034521.JPG X3 (ZDJĘCIA Z IMPREZY) | ideal | Paczka zdjęć z imprezy doskonale pasuje do profilu ofiary i usypia jej czujność.
- DOKUMENTY_HR.DOCX | suboptimal | Dokumenty kadrowe wzbudzają pewne podejrzenia, lecz pracownik może je otworzyć.
- WYPOWIEDZENIE_UMOWY_O_PRACE.PDF | critical | Pismo o zwolnieniu wywołuje natychmiastową panikę i telefon do kadr/przełożonego!

Podpięcie RAT (flavor): „Wirus RAT musi zostać ukryty w archiwum ZIP razem z plikami przynęty, aby ominąć skanery.”

Decyzja D5: "WYBIERZ NAZWĘ PENDRIVE'A:"
- KEYLOGGER | critical | Nazwa 'KEYLOGGER' to natychmiastowa kompromitacja nośnika.
- ZDJĘCIA B&D COMPANY | suboptimal | Podejrzana nazwa pendrive’a może zaalarmować użytkownika lub analityka.
- IMPREZA | ideal | Naturalna, wiarygodna etykieta woluminu spójna z przygotowaną przynętą.
- NOWY DYSK | suboptimal | Zbyt ogólna nazwa nie wzmacnia przynęty i może budzić obojętność.

Decyzja D6: "WYBIERZ PODPIS NA KOPERCIE:"
- ZDJĘCIA Z AFTERPARTY O&L COMPANY! | ideal | Dedykowana etykieta fizyczna maksymalizuje szansę podłączenia nośnika przez pracownika.
- PENDRIVE ZE ZDJĘCIAMI B&D COMPANY | suboptimal | Zbyt oczywisty lub obcy podpis budzi podejrzenia.
- ZGUBIONE DOKUMENTY | suboptimal | Neutralny podpis nie wzmacnia przynęty i może zostać zignorowany.
- WYPOWIEDZENIE UMOWY | critical | Napis o zwolnieniu z pracy wzbudził czujność ochrony i personelu.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?"
- BM: "JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-234 WROCŁAW. DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA."
- GRACZ: "JASNE. SŁYSZYMY SIĘ ZA KILKA GODZIN."
- PRZESKOK CZASU: "06:02 — MIJA KILKA GODZIN…" | "DRON GOTOWY DO PORANNEGO LOTU."
- BM: "JUŻ CZAS. WSKAŻ DOM MATEUSZA NA MAPIE. GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM."
- odblokuj: //DRON: CONDOR MIT63 (po przeskoku z opóźnieniem 3 s)

## Etap 4: //DRON: CONDOR MIT63
Klocek: NOWA MINIGRA (`DroneApp`, componentId `ol_drone`: podpięcie koperty → mapa → lot → kamera parkingu → zrzut)
Cel dydaktyczny: uświadomienie, że atak może sięgać poza sieć: dostarczenie przynęty pod dom i do samochodu ofiary na podstawie danych z rekonesansu.
Ekrany: podpięcie koperty do drona (flavor) → mapa satelitarna z czterema adresami → lot z telemetrią → kamera parkingu (6 pojazdów; zdjęcie od mentora na prawym monitorze) → zrzut koperty („POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'EM. DRON WRACA DO POKOJU HAKERA.”)
Oceniane: D7, D8 | Flavor (nieoceniane): podpięcie koperty, lot, zrzut
Dron: CONDOR MIT63, stałe przekazywanie wideo, maks. 25 KM/H, połączony z odbiornikiem hakera.

Decyzja D7: "WSKAŻ DRONOWI ADRES DOMU OFIARY:"
- OŁBIŃSKA 51B (NADODRZE) | critical | Błędne współrzędne – dron wylądował pod niewłaściwym adresem!
- DRZYMAŁY 38D (PILCZYCE) | critical | Błędne współrzędne – dron wylądował pod niewłaściwym adresem!
- WYSTAWOWA 23A (ZALESIE) | critical | Błędne współrzędne – dron wylądował pod niewłaściwym adresem!
- OŁTASZYŃSKA 92C (PARTYNICE) | ideal | Właściwa lokalizacja uzyskana podczas fazy rekonesansu adresu Mateusza.

Decyzja D8: "WYBIERZ MIEJSCE NA PARKINGU (POJAZD OFIARY):"
- Granatowy Sedan | critical | Błędny pojazd – koperta trafiła na samochód osoby postronnej!
- Szary SUV | critical | Błędny pojazd – koperta trafiła na samochód osoby postronnej!
- Zielony Kombi | critical | Błędny pojazd – koperta trafiła na samochód osoby postronnej!
- Biały samochód z czerwonym dachem | ideal | Precyzyjna identyfikacja pojazdu na podstawie zdjęcia przesłanego przez Byte_Mastera.
- Czerwony Hatchback z czarnym dachem | critical | Błędny pojazd – koperta trafiła na samochód osoby postronnej!
- Biały Sedan z białym dachem | critical | Błędny pojazd – koperta trafiła na samochód osoby postronnej!

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "KOPERTA NA SAMOCHODZIE OFIARY. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA."
- PRZESKOK CZASU: "08:12 — MIJA KILKA GODZIN…" | "CZEKAMY, AŻ MATEUSZ PODŁĄCZY PENDRIVE W BIURZE."
- BM: "MALWARE AKTYWNY — MATEUSZ PODŁĄCZYŁ PENDRIVE NA SWOJEJ STACJI. WEJDŹ NA JEGO KOMPUTER."
- odblokuj: //WIRUS: RAT — SESJA (po przeskoku z opóźnieniem 3 s; z przychodzącym połączeniem „MALWARE AKTYWNY — STACJA MATEUSZA”, dźwięk alarmu)

## Etap 5: //WIRUS: RAT — SESJA
Klocek: NOWA MINIGRA (`RatSessionApp`, componentId `ol_rat_session`, finał wizualny)
Cel dydaktyczny: zobaczenie skutku udanego ataku: pełna kontrola nad pulpitem pracownika i dostęp do sieci firmy.
Ekrany: alert aktywacji z danymi stacji (MATEUSZ_BIURO_O&L, 161.185.160.93) i przyciskiem „PRZEJMIJ PULPIT OFIARY” → pulpit ofiary (Windows 11: KOSZ, TEN KOMPUTER, FREEVOLT, okno archiwum ZIP) i przycisk „PRZEJMIJ SIEĆ FREEVOLT” → graf zdalnego dostępu
Oceniane: Flavor (bez oceny; brak decyzji)

Mostek (rozmowa końcowa):
- GRACZ: "MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?"
- BM: "WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI. JESTEŚMY W KONTAKCIE!"
- odblokuj: //RAPORT POOPERACYJNY

## Debrief
Lekcje przy decyzjach (rozwijane w raporcie pooperacyjnym; treść w `data/mission3.json`, `step6.choices[].attack` / `.defense`):

D1:
- Atak: RAT daje atakującemu zdalny pulpit na stacji pracownika, działa w tle jak zwykła usługa, więc nie wywołuje alarmu, a z jednego komputera można sięgnąć do dokumentacji w sieci firmy.
- Obrona: Sygnały: nieznany proces startujący z systemem, ruch wychodzący na obcy adres, pulpit „sam się rusza”. Zasada najmniejszych uprawnień, EDR i monitoring ruchu wychodzącego; przy podejrzeniu odłącz stację i zgłoś do IT.

D2:
- Atak: Atakujący wybiera najsłabsze ogniwo: nowego pracownika bez szkolenia antyphishingowego, który chce zrobić dobre wrażenie.
- Obrona: Szkolenie z cyberbezpieczeństwa od pierwszego dnia pracy, jasna procedura zgłaszania, ostrożność w ujawnianiu na stronie firmy stażu i obowiązków pracowników.

D3:
- Atak: Baiting: fizyczny nośnik z przynętą nawiązującą do prawdziwego wydarzenia znanego z publicznych wpisów firmy; ładunek w ZIP omija proste skanery.
- Obrona: Nie podłączaj znalezionych ani podrzuconych nośników do komputera służbowego, oddaj je do IT. Polityka USB (blokada portów, biała lista urządzeń) i ograniczenie zdjęć z wydarzeń w sieci.

D4:
- Atak: Zdjęcia z imprezy to przynęta dopasowana do ofiary; ładunek DLL ukryty w archiwum obok fotografii, więc użytkownik widzi tylko niewinne pliki.
- Obrona: Nie otwieraj plików z nieznanego nośnika, szczególnie archiwów ZIP/RAR. Skanowanie rozpakowanych archiwów i kontrola uruchamiania nieznanych bibliotek DLL.

D5:
- Atak: Etykieta woluminu „IMPREZA” wzmacnia legendę i brzmi jak pamiątka z wydarzenia.
- Obrona: Nazwa dysku niczego nie dowodzi, bo każdy może ją ustawić. Nie podłączaj obcego pendrive'a niezależnie od podpisu; polityka USB blokuje nieautoryzowane urządzenia.

D6:
- Atak: Podpis na kopercie gra na ciekawość i chęć pomocy właścicielowi, więc ofiara sama podłącza nośnik.
- Obrona: Zasada nieużywania znalezionych nośników obowiązuje także przy znajomo wyglądającym podpisie; zanieś kopertę do IT lub ochrony. Szkolenia z baitingu na przykładach podrzutów.

D7:
- Atak: Dron dostarcza przynętę pod dom ofiary; adres da się ustalić z publicznych źródeł, a koperta przy samochodzie przenosi nośnik do firmy.
- Obrona: Higiena OSINT: ogranicz publikowanie adresu i zdjęć domu oraz auta, traktuj niezamówione przesyłki jako podejrzane; ataki mogą zacząć się poza biurem.

D8:
- Atak: Dokładne rozpoznanie pojazdu (zdjęcie z mediów społecznościowych lub obserwacji) pokazuje poziom przygotowania takiego ataku.
- Obrona: Nie sprawdzaj kopert ani nośników z szyby i parkingu na komputerze, zgłoś je ochronie lub IT; nie publikuj zdjęć z widocznym samochodem i tablicami.

## Odchylenia od VR / do decyzji
Misja nie ma dokumentu VR; poniżej zmiany względem starego przebiegu M3 (widgety, `transitions`, czat jako launcher).
- [DO DECYZJI] Builder RAT w //BAZA_WIRUSÓW jest flavorem bez oceny (pula M3 to 8 decyzji). W starym kodzie zły builder wywoływał wykrycie bez numeru decyzji (błąd); teraz zły zestaw tylko blokuje kompilację komunikatem. Jeśli builder ma być D9: `decisionNum`, wpis w `step6.choices`, `decisionCount: 9`.
- [DO DECYZJI] D2 przy złym celu: wybór CEO lub logistyki pokazuje pushback mentora i wraca do wyboru (pełna pula, stary przebieg zostawiał tylko poprawną opcję); ostateczny wybór Mateusza po złej próbie liczy się jako suboptimal (agregacja jak w `DialogueTree`).
- [DO DECYZJI] Przeskoki czasu (`time_jump`): „06:02 — MIJA KILKA GODZIN…” po D6 i „08:12 — MIJA KILKA GODZIN…” po D8; kafelek następnego etapu odblokowuje się 3 s po przeskoku. Teksty przeskoków to dodatek kodu.
- [DO DECYZJI] Kafelki odblokowywane po kolei: każdy etap odblokowuje następny przez ostatnią kwestię gracza w mostku (i podświetlenie kafelka z badge); aplikacje nie otwierają się z czatu. Wektor D3 przeniesiono z czatu do aplikacji //TOR.
- [DO DECYZJI] Usunięte podpowiedzi UI zdradzające ocenę: etykiety `[WYBÓR SUBOPTYMALNY - KARA BTC]` i `[BŁĄD KRYTYCZNY - ALARM]` na kartach D1, natychmiastowy stan karty i `feedbackMsg` po wyborze, `[ZMIEŃ NA RAT]`, wskazówka na dole //DYSK E, wskaźnik „100% ZGODNOŚĆ ZE ZDJĘCIEM” / „NIEZGODNOŚĆ” w //DRON, opis „(CEL OFIARY)” w danych pojazdu, pokazywanie tylko poprawnej opcji po błędnym celu. Opcje w każdej decyzji są tasowane; opisy opcji D2 i D3 są neutralne.
- [DO DECYZJI] Dane strony O&L (pracownicy, bio, newsy) przeniesione z `data/mission3.json` (`step2.browser`) do `config.site` w `stages.ts` (jedno źródło); notatka mentora (kwestie z intro i mostka) na prawym monitorze //TOR.
- [DO DECYZJI] Standard M2 w minigrach: `AppHeader` z paskiem ZADANIE, karty na dużym ekranie, wiersze na prawym monitorze (`SideMonitor`), `ModuleLoader` między ekranami, pamięć stanu aplikacji (`AppHost`); mapa //DRON skalowana do ekranu, zdjęcie pojazdu od mentora na prawym monitorze.
- [DO DECYZJI] Sesja //WIRUS: RAT — SESJA bez oceny (finał wizualny); etykiety przycisków bez nawiasów kwadratowych.
- [SPÓJNIK] Po intro brak kwestii gracza odblokowującej pierwszy kafelek; dodana „NAJPIERW STWORZĘ WIRUSA.”
- [NIEPEWNE] Wygląd raportu: pytania w `step6.choices` ujednolicono z pytaniami z ekranu (wcześniej odpowiedzi w D1–D4 i D7–D8 różniły się od etykiet opcji; odpowiedzi to teraz etykiety opcji).
- [DO ZAPROJEKTOWANIA] Lekcje atak/obrona (D1–D8) nie istniały w starym M3; propozycja do recenzji właściciela.
- Szczegóły kafelków: //BAZA_WIRUSÓW, //CHAT: BYTE_MASTER, //TOR: PRZEGLĄDARKA, //DYSK E: PENDRIVE, //DRON: CONDOR MIT63, //WIRUS: RAT — SESJA, //RAPORT POOPERACYJNY.
