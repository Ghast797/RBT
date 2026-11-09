# Misja 3 (O&L Company) — plan przebudowy wg dokumentu scenariusza

Źródło prawdy: `docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md` (6 decyzji, D1–D6). Obecna implementacja (8 decyzji) powstała bez dokumentu i ma być z nim zgodna. Standard: `RedBlueTeam/docs/mission-standard.md`, kontrakt: `docs/scenario-engine.md` (sekcje 3 i 5). Uwagi właściciela z testu (tabela w sekcji 0) są wiążące.

**Status:** porcje A (silnik) i B (dane i struktura) zrobione. Sekcja 9 („Kontrakt porcji B”) opisuje faktyczne nazwy pól configów, assetów i `componentId` i jest **nadrzędna** wobec sekcji 3 i 6 tam, gdzie nazwy się różnią (plan powstał przed kodem). Odpowiedzi właściciela na pytania P1–P10: sekcja 8.

Skróty: **BM** = Byte_Master, **czat** = czat BM na prawym monitorze (aplikacja nie przejmuje go przez `SideMonitor`).

## 0. Uwagi właściciela → decyzje projektowe

| # | Uwaga | Decyzja w planie |
|---|---|---|
| 1 | //BAZA_WIRUSÓW: builder niezrozumiały dla laika | Builder (3 grupy technicznych przełączników) znika. W jego miejsce **matryca kompilacji** z dokumentu (S02): zdrapka z czarną maską i paskiem postępu, 4 podpisane części wirusa po polsku (sekcja 4). |
| 2 | //TOR do przebudowy od zera | Strona firmy przewija się pionowo (świadomy wyjątek od „bez przewijania”), pracownicy i wydarzenia jeden pod drugim z miejscem na zdjęcia, opisy bez wprost podanego poziomu szkolenia, ekran wyboru tylko z imionami (sekcja 4). |
| 3 | Przeskok czasu = lecący zegar | Zmiana `TimeJump` + beatu `time_jump` (nowe pole `clockFrom`), sekcja 5. |
| 4 | Dron: bez obrazka-wzorca auta | Auto opisuje BM **w czacie, który zostaje na prawym monitorze**. Wymaga małego rozszerzenia silnika `StageDefinition.openingConversation` (sekcja 5b), bo kwestie „w minigrze” z dokumentu muszą trafić do prawdziwego logu czatu. |
| 5 | Pulpit ofiary: pliki Freevolt przeciągane na własny pulpit | Dodatek do S07 (dokument ma tylko klik w ikonę FREEVOLT): po kliknięciu otwiera się folder z 4 plikami, gracz przeciąga je na „PULPIT HAKERA” (sekcja 3, minigra 5). Nieoceniane. |

## 1. Rozjazdy: dokument ↔ obecna implementacja

Legenda: **zostaje** / **zmienić** / **usunąć** / **dodać**.

| Scena | Decyzja | Dokument (mostek / treść) | Obecna implementacja | Zmiana |
|---|---|---|---|---|
| Meta | — | 6 decyzji, `passingScore` 80%, tytuł „ZHAKOWANO O&L”, „UKOŃCZONO ZADANIE 3”, 4,02 BTC | `decisionCount: 8`, brak `passingScore`, tytuł „SUKCES” | zmienić (`decisionCount: 6`, `passingScore: 80`, `summary.title`) |
| INTRO | flavor | 4 pary BM→GRACZ, WERSALIKAMI, bez kropek końcowych; ostatnia kwestia gracza „DAJ MI CHWILĘ” | JSON w zwykłej wielkości liter, z kropkami; dopisany spójnik „NAJPIERW STWORZĘ WIRUSA.” | zmienić (1:1 wersaliki), spójnik usunąć (ostatnią kwestią jest „DAJ MI CHWILĘ”) |
| S01 | D1 | RAT ideal, **Ransomware suboptimal, Keylogger critical** | Keylogger suboptimal, Ransomware critical | zmienić (poziomy) |
| S01→S02 | — | Opisy opcji 1:1 | Zgodne | zostaje |
| S02 | flavor | Matryca kompilacji: zdrapka, maska „?”, segmentowy pasek, „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”, „KONTYNUUJ” | Builder RAT (3 grupy: moduł, maskowanie, pakiet; kod błędu przy złym zestawie) | usunąć builder, dodać matrycę |
| S02→S03 | flavor | GRACZ „GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?” → BM „ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD” | Zgodne (kafelek odblokowany po kwestii gracza) | zostaje (bez klikalnego linku w czacie, patrz odchylenie O1) |
| S03 | D2 | 5 osób; Mateusz ideal; Wiktoria i Agnieszka suboptimal; Sławomir i Jan **critical** | 4 karty (brak Agnieszki), CEO/Logistyka suboptimal z cofnięciem („retry”), tylko CISO critical | zmienić (5 opcji, poziomy z dokumentu), usunąć retry (`osintLogic.ts`) |
| S03 | — | Strona z 2 zakładkami, pracownicy: zdjęcie, imię i nazwisko, stanowisko | Hero + kafle pracowników z bio zdradzającym szkolenie („nie przeszedł szkolenia…”) | zmienić (przebudowa od zera, sekcja 4) |
| S03 | — | Kwestie „w minigrze” po wyborze celu (GRACZ „WIDZĘ, ŻE MAJĄ NOWEGO JUNIORA…”, BM „DOBRY WYBÓR…”) | Brak | usunąć z wersji grywalnej (zależą od wyboru, „DOBRY WYBÓR” łamie standard M2+), patrz O3 |
| S04 | D3 | 3 opcje (impreza+ZIP ideal; dokumenty HR suboptimal; pusty pendrive „KEYLOGGER” critical) | 2 opcje (impreza ideal, faktura .exe critical), w aplikacji //TOR | zmienić (3 opcje z dokumentu, nadal w //TOR) |
| S04 | — | Krok 1: eksploracja zakładki WYDARZENIA (po D2) | Zakładka dostępna od początku, wymóg „zajrzyj” | zmienić (rozpoznanie obu zakładek przed D2, O2) |
| S04 (po D3) | — | BM „DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE” + osobno BM „WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ” | Jedna kwestia BM + spójnik „ODBIERAM PLIKI…” | zmienić (dwie kwestie BM), spójnik zostaje |
| S04 | flavor | Krok 3: „POBIERZ ZAŁĄCZNIKI”, 3 pliki, przeciągnięcie zdjęć na pendrive, potem kafelka RAT na zdjęcia → `FOTKI_AFTERPARTY.ZIP` | Oceniana decyzja (D4: wybór pliku z poziomami) + pasek „podpięcia” | zmienić (nieoceniane, przeciąganie, wybór pliku musi pasować do planu D3) |
| S04 | D4 (cz. 1) | Krok 4: nazwa dysku z 4 przycisków (idealna `IMPREZA`) | Osobna ocena D5 | zmienić (część D4, patrz O4 i pytanie P1) |
| S04 | **D4** | Krok 5: podpis na kopercie: `ZDJĘCIA Z AFTERPARTY O&L COMPANY!` ideal; `PENDRIVE ZE ZDJĘCIAMI B&O COMPANY` suboptimal; `ZGUBIONE DOKUMENTY` / `WYPOWIEDZENIE UMOWY` **critical** | Podpisy z literówką „B&D”, „ZGUBIONE DOKUMENTY” suboptimal | zmienić (nazwa firmy „B&O”, poziomy) |
| S04 | flavor | Krok 6: „WYSUŃ PAMIĘĆ USB” | Auto-zakończenie po decyzji | zmienić (przycisk „WYSUŃ PAMIĘĆ USB” jest przyciskiem zatwierdzenia D4) |
| S04→S05 | flavor | 2 kwestie gracza, BM adres (**53-034**) i „DRONA WYŚLIJ Z SAMEGO RANA…”, GRACZ „SŁYSZYMY SIĘ ZA KILKA GODZIN”, ściemnienie → **06:02**, BM „JUŻ CZAS. DRON GOTOWY DO WYLOTU?”, GRACZ „…MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE’A” | Kwestie scalone, kod **53-234**, BM po przeskoku nie pyta o dron, treść „WSKAŻ DOM…” w mostku | zmienić (mostek 1:1, `clockFrom`) |
| S05 | **D5** | Mapa, 4 adresy: Oławska 51B (Nadodrze), Drzymały 38D (Pilczyce) **suboptimal**; Wystawowa 23A (Zalesie, Hala Stulecia) **critical**; Ołtaszyńska 92C (Partynice) ideal | Wszystkie błędne adresy critical, „OŁBIŃSKA 51B” | zmienić (poziomy, nazwa ulicy) |
| S05 | — | Ekran 1 aktywacja, ekran 2 podpięcie koperty (statusy), ekran 3 mapa | Zgodne co do idei | zostaje (przebudowa wewnętrzna, sekcja 3) |
| S05 | — | Kwestie BM w minigrze: adres „PRZEWIŃ CZAT…” i auto „PRZESYŁAM CI ZDJĘCIE” | Notatka na prawym monitorze + obrazek-wzorzec pojazdu | zmienić (czat + opis słowny, bez zdjęcia; uwaga 4) |
| S06 | **D6** | Kamera z góry, 5 aut (SUV, sedan, hatchback, van, biały z czerwonym dachem); inne auto suboptimal; pusty asfalt **critical** | 6 aut, wszystkie błędne critical; brak „asfaltu” | zmienić (poziomy, dodać opcję „pusty asfalt”) |
| S06 | — | HUD: bateria 48%, zegar transmisji, „URUCHOM KAMERĘ”, „ZRZUĆ ŁADUNEK”, „WYŁĄCZ APLIKACJĘ DRONA” | Częściowo | zmienić (sekcja 3, minigra 4) |
| S07 | flavor | Krok 1 GRACZ „OK. DAM CI ZNAĆ…” → przeskok **08:12** → alert „MALWARE ZOSTAŁ AKTYWOWANY” | Przeskok jest, ale z dopisaną kwestią BM „WEJDŹ NA JEGO KOMPUTER” i etykietą „MALWARE AKTYWNY — STACJA MATEUSZA” | zmienić (usunąć kwestię BM, etykieta wg dokumentu) |
| S07 | flavor | Kroki 3–4: szczegóły C2, pulpit z KOSZ / TEN KOMPUTER / FREEVOLT (pomarańczowy trójkąt) | Zgodne w zarysie | zostaje (dopracować etykiety wg dokumentu) |
| S07 | flavor | Krok 5: meldunek (GRACZ, BM, BM „JESTEŚMY W KONTAKCIE!”), potem klik FREEVOLT | Meldunek w mostku **po** etapie | zostaje (bez zmiany kolejności, O5) |
| S07 | flavor | Krok 6: schemat sieci: haker, węzeł pośredni, 3 zainfekowane stacje; „PODSUMOWANIE ZADANIA” | Węzły: MATEUSZ, PC-1, SRV; przycisk „ZAKOŃCZ SESJĘ I ZAMELDUJ MENTOROWI” | zmienić (topologia i przycisk wg dokumentu) |
| S07 | — | Brak plików do przeciągania | Brak | dodać (uwaga 5) |
| S08 | — | 6 decyzji, tabela debriefu D1–D6, 5 slajdów „CO POWINIENEŚ ZAPAMIĘTAĆ?” | 8 pozycji `step6.choices`, brak slajdów (pole `educationalSlides` przestarzałe) | zmienić (6 pozycji wg tabeli; treść slajdów trafia do lekcji `attack`/`defense`, patrz sekcja 6) |
| Pulpit | — | 7 kafelków; `item_virus_payload` „//WIRUS: RAT” (po S02) przeciągany w S04 | Brak kafelka | pominąć (O6): ładunek przeciąga się w //DYSK E jako element okna, bo okno aplikacji zasłania pulpit |
| Pulpit | — | Etykieta `//WIRUS: RAT (C2)` | „//WIRUS: RAT — SESJA” | zmienić (etykieta) |

## 2. Nowa lista etapów

Zasady wspólne dla etapów: prawy monitor to **czat** we wszystkich pięciu aplikacjach (żadna nie wywołuje `SideMonitor`; patrz sekcja 3, „Prawy monitor”). Kolejność etapów zgodna z Kill Chain (uzbrojenie → rozpoznanie i cel → nośnik → dostarczenie → egzekucja), jak w dokumencie.

| etap | appId | decyzje | minigra (`componentId`) | prawy monitor | time_jump (`clock`) | odblokowuje |
|---|---|---|---|---|---|---|
| 1 | `virus_database` | D1 | `VirusLabApp` (`ol_virus_lab`): wybór wirusa → matryca | czat | — | `browser` (po kwestii gracza) |
| 2 | `browser` | D2, D3 | `OsintBrowserApp` (`ol_osint_browser`): strona → cel → przynęta | czat | — | `pendrive_app` (po spójniku gracza) |
| 3 | `pendrive_app` | D4 | `PendriveApp` (`ol_pendrive`): załączniki → nazwa dysku → podpis | czat | `clockFrom` 22:15 → **06:02** (po 2 kwestiach gracza i BM, przed „JUŻ CZAS…”) | `drone_app` (3 s po przeskoku) |
| 4 | `drone_app` | D5, D6 | `DroneApp` (`ol_drone`): aktywacja → ładunek → mapa → kamera | czat (wymagany: adres i opis auta od BM) | **08:12** (`clockFrom` 06:02), po kwestii gracza „DAM CI ZNAĆ…” | `rat_session` + baner „MALWARE ZOSTAŁ AKTYWOWANY” (3 s po przeskoku) |
| 5 | `rat_session` | — | `RatSessionApp` (`ol_rat_session`): C2 → pulpit ofiary → pliki FREEVOLT → schemat sieci | czat | — | `debrief_app` (po meldunku) |

Mostek etapu 1 (1:1): GRACZ „GOTOWE. MASZ JAKIEŚ DANE O FIRMIE?” → BM „ZAJRZYJ NA ICH STRONĘ INTERNETOWĄ: HTTPS://OLCOMPANY.CLOUD”.

Mostek etapu 2: BM „DZIĘKI ARCHIWUM ANTYWIRUS NIE ZNAJDZIE ZAGROŻENIA. DOBRZE. TERAZ PRZYGOTUJ PENDRIVE” → BM „WYSYŁAM CI PRZYKŁADOWE PLIKI, KTÓRYCH MOŻESZ UŻYĆ” → GRACZ „ODBIERAM PLIKI. PRZYGOTUJĘ NOŚNIK.” (spójnik).

Mostek etapu 3: GRACZ „GOTOWE. ZDJĘCIA PODRZUCĘ PRZY POMOCY DRONA I ZOSTAWIĘ PODPISANĄ KOPERTĘ NA SAMOCHODZIE OFIARY. ZMINIMALIZUJE TO RYZYKO WPADKI, A NAM POBICIE TROCHĘ DRAMATURGIĘ CAŁEJ SYTUACJI” → GRACZ „MATEUSZ POWINIEN SIĘ OSTRO ZESTRESOWAĆ. MAM NADZIEJĘ, ŻE TO DLA CIEBIE WYSTARCZAJĄCO KREATYWNE?” → BM „JEST OK. WYSYŁAM CI ADRES OFIARY: UL. OŁTASZYŃSKA 92C/6, 53-034 WROCŁAW, POLSKA (PL)” → BM „DRONA WYŚLIJ Z SAMEGO RANA, ŻEBY OFIARA ZNALAZŁA KOPERTĘ NA SAMOCHODZIE PRZED WYJAZDEM DO BIURA. WTEDY W PRACY NA PEWNO SPRAWDZI ZAWARTOŚĆ” → GRACZ „JASNE, SŁYSZYMY SIĘ ZA KILKA GODZIN” → `time_jump` (06:02) → BM „JUŻ CZAS. DRON GOTOWY DO WYLOTU?” → GRACZ „JUŻ SPRAWDZAM DRONA W APLIKACJI. MUSZĘ JESZCZE PODPIĄĆ DO NIEGO PENDRIVE'A”. Dwie kolejne kwestie gracza z rzędu: dokument tak je podaje (obie „jedyna opcja”); implementator sprawdza, że `advanceBridge` obsługuje dwa beaty `player` pod rząd (test `driveBridge` w `mission3.test.ts`).

Mostek etapu 4: GRACZ „OK. DAM CI ZNAĆ, KIEDY MATEUSZ PODŁĄCZY PENDRIVE I AKTYWUJE WIRUSA” → `time_jump` (08:12) → odblokowanie `rat_session` z `incomingCall: { appId: 'rat_session', label: 'MALWARE ZOSTAŁ AKTYWOWANY' }`, dźwięk `alarm`. Dopisana wcześniej kwestia BM „MALWARE AKTYWNY — … WEJDŹ NA JEGO KOMPUTER” znika (nie ma jej w dokumencie, a „wejdź na komputer” to czat jako launcher).

Mostek etapu 5: GRACZ „MAM DOSTĘP DO KOMPUTERA MATEUSZA. ROZUMIEM, ŻE OPRÓCZ PRZYJĘCIA DO GRUPY MOGĘ LICZYĆ TEŻ NA KILKA BITCOINÓW W RAMACH UZNANIA?” → BM „WIDZĘ, ŻE SPODOBAŁY CI SIĘ ZAROBKI W DARKSUN. OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI” → BM „JESTEŚMY W KONTAKCIE!” (trzy beaty, dwie kwestie BM osobno wg dokumentu).

`openingConversation` (silnik, sekcja 5b) dla `drone_app`: BM „WSKAŻ DOM MATEUSZA NA MAPIE. ADRES WYSŁAŁEM CI WCZEŚNIEJ. PRZEWIŃ CZAT, JEŚLI GO NIE PAMIĘTASZ”, BM „GOŚĆ JEŹDZI BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM.” (zdanie „PRZESYŁAM CI ZDJĘCIE” usunięte, uwaga 4).

## 3. Per minigra

Wspólne dla wszystkich: `AppHeader` z paskiem ZADANIE (zmienia się z ekranem), `ModuleLoader` 1,5–2 s między ekranami (`LOADER_MS`/`LOADER_LONG_MS` z `ui.tsx`), opcje tasowane (`useShuffled`), `ChoiceZone` z etykietą = pytanie z debriefu, pamięć stanu przez zwykły `useState` (bez resetu przy zamknięciu), `onDecision` z `answer` = `reportAnswer ?? label` opcji (nowe opcjonalne pole w typach M3, patrz sekcja 6). Wszystko mieści się w 1366×768 i 1920×1080 bez przewijania (wyjątek: widok strony w //TOR).

**Grafiki (mechanizm jak w M2).** Plik `minigames/siteAssets.ts` (wzór: `mission_02_carbon_flow/minigames/formAssets.ts`) ładuje `../assets/<grupa>/*.{png,jpg,jpeg,webp}` przez `import.meta.glob` z `query: { w: '1024', withoutEnlargement: 'true', format: 'webp' }` (GIF/SVG bez zmian), udostępnia `resolveAsset(grupa, nazwa)` i `ASSETS_DIR`. Komponent `ImageSlot` (w `ui.tsx`, wzór: `ImageSlot` z M2) pokazuje obraz albo zastępnik; w devie zastępnik ma podpis `GRAFIKA: <opis>` i ścieżkę `assets/<grupa>/<nazwa>.png`. Każda grupa ma `assets/<grupa>/.gitkeep`. Właściciel wrzuca pliki sam, nazwa pliku = id z `stages.ts` (rozszerzenie dowolne).

| Grupa (`assets/…`) | Pliki (nazwa = id) | Gdzie |
|---|---|---|
| `virus/` | `rat` | obraz pod maską matrycy (głowa szczura z cybernetycznymi elementami) |
| `employees/` | `jan_lukasiewicz`, `slawomir_bialek`, `wiktoria_galecka`, `agnieszka_leman`, `mateusz_klimowicz` | zdjęcie przy każdym pracowniku |
| `events/` | `party_sales_1`, `party_sales_2`, `party_sales_3`, `meeting_logistics_1`, `meeting_logistics_2` | zdjęcia pod wpisami WYDARZENIA |
| `usb/` | `party_photos` (miniatura plików IMG), `envelope` (koperta) | //DYSK E |
| `drone/` | `city_map` (plan miasta), `parking` (widok z góry) | //DRON; brak pliku = obecna grafika wektorowa (SVG) jako domyślna |
| `rat/` | `victim_wallpaper` | tapeta pulpitu ofiary; brak = tło wektorowe |

### 3.1 `VirusLabApp.tsx` (`ol_virus_lab`), etap `virus_database`, D1

Pliki: `minigames/VirusLabApp.tsx` (przepisać), `minigames/ScratchMatrix.tsx` (nowy: zdrapka), `minigames/matrixLogic.ts` (nowy, czysta logika postępu; zastępuje `builderLogic.ts`, który znika).

| Ekran | Treść z dokumentu / zadanie (ZADANIE) |
|---|---|
| 1 `virus_select` | Nagłówek „WYBIERZ ODPOWIEDNIEGO WIRUSA”. 3 karty (tasowane), opis 1:1: „RAT: REMOTE ACCESS TROJAN – POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY”, „RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ”, „KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE”. ConfirmButton. |
| loader | „PRZYGOTOWANIE MATRYCY KOMPILACJI…” |
| 2 `matrix` | „WYSZUKAJ CZĘŚCI WIRUSA:”, pole zakryte czarną maską ze „?”, segmentowy pasek na dole. ZADANIE: „PRZECIĄGAJ KURSOREM Z WCIŚNIĘTYM PRZYCISKIEM MYSZY PO CZARNYM POLU, ŻEBY ODSŁONIĆ WIRUSA.” |
| 3 `done` | Po 100%: „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”, przycisk „KONTYNUUJ”. |

Decyzje: D1 zgłaszane przy zatwierdzeniu karty: `rat` ideal, `ransomware` suboptimal, `keylogger` critical (`feedback` z dokumentu: RAT „Daje bezpośredni, interaktywny wgląd w pulpit… bez wszczynania alarmu”; Ransomware „Zablokowanie stacji ofiary natychmiast postawi na nogi dział IT…”; Keylogger „Samo przechwytywanie wciśnięć klawiszy nie gwarantuje dostępu do… plików projektowych i schematów”).
`onComplete`: po kliknięciu „KONTYNUUJ” na ekranie 3 (kryterium z dokumentu: 100% + klik). Matryca zawsze odsłania szczura (patrz pytanie P2).
Prawy monitor: czat. Do D1 gracz potrzebuje tylko intro (wirus, który „przejmie pulpit pracownika”) i ono jest w czacie.
Grafika: `virus/rat`.

### 3.2 `OsintBrowserApp.tsx` (`ol_osint_browser`), etap `browser`, D2 i D3

Pliki: `minigames/OsintBrowserApp.tsx` (przepisać), `minigames/SiteView.tsx` (nowy: przeglądarka i strona), `minigames/osintLogic.ts` (przepisać: warunek przejścia dalej i odpowiedź do raportu; logika „retry” znika).

| Ekran | Treść |
|---|---|
| 1 `site` | Okno przeglądarki: pasek adresu `https://olcompany.cloud`, zakładki STRONA GŁÓWNA / WYDARZENIA. Strona przewija się pionowo (tylko ten obszar). ZADANIE: „PRZEJRZYJ STRONĘ FIRMY: PRZEWIŃ ZAKŁADKI STRONA GŁÓWNA I WYDARZENIA DO KOŃCA.” Stopka z przyciskiem „PRZEJDŹ DO WYBORU CELU” (nieaktywny, dopóki obie zakładki nie zostały przewinięte do końca) i wskaźnikiem „PRZECZYTANO: STRONA GŁÓWNA / WYDARZENIA”. |
| loader | „ŁADOWANIE LISTY PRACOWNIKÓW…” |
| 2 `target` | Etykieta strefy: „KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?”. 5 kart tylko z imieniem i nazwiskiem (bez stanowiska, zdjęcia, opisu). ConfirmButton „ZATWIERDŹ CEL”. Bez przycisku powrotu do strony (P3). |
| loader | „ZAPISYWANIE CELU…” |
| 3 `vector` | Strefa „JAK GO OSZUKASZ?”: 3 wiersze (rozmowa = wiersze), tekst 1:1 z dokumentu (sekcja S04, D3). ConfirmButton „ZATWIERDŹ PLAN”. |
| loader | „ZAPISYWANIE PLANU ATAKU…” |

Strona główna (od góry): hero „JESTEŚMY JEDNYM Z NAJWIĘKSZYCH DYSTRYBUTORÓW PALIW” / „OBSŁUGUJEMY MIĘDZYNARODOWĄ SIEĆ STACJI PALIWOWYCH ORAZ ZAOPATRUJEMY NAJWIĘKSZE KORPORACJE”, kontakt, sekcja „NASI EKSPERCI:” z 5 wierszami jeden pod drugim: `[zdjęcie 112 px] [IMIĘ NAZWISKO, stanowisko, „W O&L OD: …”, krótki opis]`. Kolejność jak w dokumencie: Jan Łukasiewicz (CEO), Sławomir Białek (Szef Działu Cyberbezpieczeństwa), Wiktoria Gałecka (Specjalistka ds. Logistyki), Agnieszka Leman (Szefowa Działu Sprzedaży), Mateusz Klimowicz (Junior Specjalista ds. Wsparcia Klienta). Opisy nie mówią o szkoleniach ani poziomie wiedzy z bezpieczeństwa; wskazówką jest tylko staż i zakres obowiązków (zob. sekcja 4).
Zakładka WYDARZENIA: wpisy w pionie, każdy: tytuł, treść, hashtagi, pod spodem zdjęcia jedno pod drugim: „15 WRZEŚNIA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU SPRZEDAŻY! POWITALIŚMY NA POKŁADZIE NOWYCH PRACOWNIKÓW ORAZ ŚWIĘTOWALIŚMY OSTATNIE SUKCESY! #OL #BESTCOMPANY #COMPANYUNHACKED” (3 zdjęcia z imprezy), „4 LISTOPADA ODBYŁA SIĘ IMPREZA INTEGRACYJNA DZIAŁU LOGISTYKI!” (2 zdjęcia). Bez dat rocznych (dokument ich nie podaje; stare „2022/2020” usunąć).

| Decyzja | Opcja | Poziom |
|---|---|---|
| D2 | Mateusz Klimowicz | ideal |
| D2 | Wiktoria Gałecka, Agnieszka Leman | suboptimal |
| D2 | Sławomir Białek, Jan Łukasiewicz | critical (od razu ekran wykrycia) |
| D3 | „MAM ZDJĘCIA I INFORMACJE O OSTATNIEJ IMPREZIE DZIAŁU SPRZEDAŻY. PODRZUCĘ MU PENDRIVE Z KILKOMA KOMPROMITUJĄCYMI ZDJĘCIAMI. WIRUSA UKRYJĘ W ARCHIWUM ZIP” | ideal |
| D3 | „PODRZUCĘ MU PENDRIVE Z DOKUMENTAMI HR DOTYCZĄCYMI ZWOLNIEŃ” | suboptimal |
| D3 | „PO PROSTU ZOSTAWIE PUSTY PENDRIVE Z PODPISEM KEYLOGGER” | critical |

`feedback` D2/D3: uzasadnienia z dokumentu. `reportAnswer` D2: stanowisko osoby (tabela debriefu: „JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA”); D3 ideal: „NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY”.
`onDecision`: D2 przy zatwierdzeniu celu, D3 przy zatwierdzeniu planu. `onComplete`: po loaderze „ZAPISYWANIE PLANU ATAKU…”.
Prawy monitor: czat. Wszystko, na czym opiera się D2/D3, jest na stronie (lewy ekran); intro i mostek są w czacie. Brak notatki mentora (`mentorNote` w `OsintBrowserConfig` znika).
Grafiki: `employees/*`, `events/*`.

### 3.3 `PendriveApp.tsx` (`ol_pendrive`), etap `pendrive_app`, D4

Pliki: `minigames/PendriveApp.tsx` (przepisać), `minigames/usbLogic.ts` (nowy: dopasowanie pliku do planu D3, agregacja poziomu D4), korzysta z `usePointerDrag` (silnik, sekcja 5c).

| Ekran | Treść |
|---|---|
| 1 `start` | Jeden duży przycisk „POBIERZ ZAŁĄCZNIKI”. ZADANIE: „ODBIERZ PLIKI OD BYTE_MASTERA.” |
| loader | „POBIERANIE ZAŁĄCZNIKÓW…” |
| 2 `arm` | Panel `ZAŁĄCZNIKI`: `IMG_00034521.JPG X3`, `DOKUMENTY_HR.DOCX`, `WYPOWIEDZENIE_UMOWY_O_PRACE.PDF`. Obok slot pendrive'a (//E: USB) i element „//WIRUS: RAT”. ZADANIE (krok a): „PRZECIĄGNIJ NA PENDRIVE'A PLIK PASUJĄCY DO TWOJEGO PLANU.” Potem (krok b): „PRZECIĄGNIJ //WIRUS: RAT NA PLIK NA PENDRIVIE, ŻEBY ZAPAKOWAĆ GO RAZEM W ARCHIWUM.” Powstaje archiwum `FOTKI_AFTERPARTY.ZIP` (pasek „PAKOWANIE DO ARCHIWUM…” ok. 2 s). Klik na kafelek wykonuje to samo co przeciągnięcie. |
| loader | „PRZYGOTOWANIE NOŚNIKA…” |
| 3 `name` | Etykieta strefy „WYBIERZ NAZWĘ PENDRIVE'A:”, 4 karty: `KEYLOGGER`, `ZDJĘCIA B&O COMPANY`, `IMPREZA`, `NOWY DYSK`. ConfirmButton. |
| loader | „ZAPIS ETYKIETY…” |
| 4 `signature` | Strefa „WYBIERZ PODPIS NA KOPERCIE” (D4): 4 wiersze z dokumentu. Przycisk zatwierdzenia ma etykietę „WYSUŃ PAMIĘĆ USB” (zatwierdza D4 i wysuwa nośnik; animacja ok. 1,5 s). |

Plik „pasujący do planu”: ideal D3 → `IMG_00034521.JPG X3`; suboptimal D3 → `DOKUMENTY_HR.DOCX` lub `WYPOWIEDZENIE_UMOWY_O_PRACE.PDF`. Zły plik wraca na listę z komunikatem „TEN PLIK NIE PASUJE DO TWOJEGO PLANU”; bez kary (aktywność nieoceniana, jak w dokumencie). Wybór pliku to sprawdzalny element dedukcji z wymagania „Zero-Clicker Agency”. Plan D3 minigra czyta z `playerChoices` (D3).

D4 (agregowana, jedna pozycja raportu): poziom = najgorszy z dwóch kroków.

| Krok | Opcja | Poziom |
|---|---|---|
| nazwa | `IMPREZA` | ideal |
| nazwa | `ZDJĘCIA B&O COMPANY`, `NOWY DYSK` | suboptimal |
| nazwa | `KEYLOGGER` | critical (zgłaszany od razu, `answer`: „NAZWA DYSKU: KEYLOGGER”) |
| podpis | `ZDJĘCIA Z AFTERPARTY O&L COMPANY!` | ideal |
| podpis | `PENDRIVE ZE ZDJĘCIAMI B&O COMPANY` | suboptimal |
| podpis | `ZGUBIONE DOKUMENTY`, `WYPOWIEDZENIE UMOWY` | critical |

`onDecision` D4: przy „WYSUŃ PAMIĘĆ USB” (albo od razu przy `KEYLOGGER`). `answer` = podpis (raport: „WYBIERZ PODPIS NA KOPERCIE”); poziomy nazw nie występują w dokumencie (pochodzą ze starego D5), patrz P1. `onComplete`: po animacji wysunięcia („PENDRIVE GOTOWY. WYSUNIĘTO PAMIĘĆ USB.”). Minigra zapisuje `customState.m3_usb = { volume, archive, signature }` dla etapów 4 i 5.
Prawy monitor: czat. Do nazwy i podpisu gracz potrzebuje pisowni „O&L” (intro w czacie) i planu z D3, który sam wybrał na poprzednim etapie.
Grafiki: `usb/party_photos`, `usb/envelope`.

### 3.4 `DroneApp.tsx` (`ol_drone`), etap `drone_app`, D5 i D6

Pliki: `minigames/DroneApp.tsx` (przepisać), `minigames/DroneMap.tsx` i `minigames/DroneCamera.tsx` (nowe: podział istniejącego 589-liniowego pliku), `minigames/droneLogic.ts` (nowy: trafienie w auto, statusy drona).

| Ekran | Treść |
|---|---|
| 1 `activate` | Model `CONDOR MIT63`, „STAŁE PRZEKAZYWANIE WIDEO”, „MAKSYMALNA PRĘDKOŚĆ 25 KM/H”, „POŁĄCZENIE Z ODBIORNIKIEM HAKERA”. Jeden przycisk „AKTYWUJ”. |
| 2 `payload` | Status „STOI W POKOJU HAKERA”. „PRZYGOTUJ DO WYLOTU” → „CZEKA NA ŁADUNEK”. Karta koperty (podpis i nazwa dysku z `m3_usb`). „ZATWIERDŹ” zawiesza ładunek (pasek „PODWIESZANIE ŁADUNKU…”). |
| 3 `map` | Status „CZEKA NA WSPÓŁRZĘDNE”. Plan miasta z 4 numerowanymi punktami (strefa „WSKAŻ DRONOWI ADRES DOMU OFIARY”). „ZATWIERDŹ” → status „LECI Z WYSOKĄ PRĘDKOŚCIĄ”, lot z paskiem (ok. 2,5 s). |
| 4 `camera` | Przycisk „URUCHOM KAMERĘ”. Widok z góry parkingu, HUD: bateria 48%, zegar transmisji, celownik. Klik w scenę ustawia celownik; „ZRZUĆ ŁADUNEK” (ConfirmButton). |
| 5 `done` | „POMYŚLNIE POZOSTAWIONO KOPERTĘ Z PENDRIVE'M. DRON WRACA DO POKOJU HAKERA”, przycisk „WYŁĄCZ APLIKACJĘ DRONA” → `onComplete`. |

| Decyzja | Opcja | Poziom |
|---|---|---|
| D5 | `OŁTASZYŃSKA 92C` (Partynice) | ideal |
| D5 | `OŁAWSKA 51B` (Nadodrze), `DRZYMAŁY 38D` (Pilczyce) | suboptimal |
| D5 | `WYSTAWOWA 23A` (Zalesie, okolice Hali Stulecia) | critical |
| D6 | biały samochód z czerwonym dachem | ideal |
| D6 | inne auto (SUV, sedan, hatchback, van, biały sedan z białym dachem, czerwony hatchback z białym dachem, czarne kombi) | suboptimal |
| D6 | pusty asfalt / jezdnia | critical |

Parking: 8 aut w 2 rzędach (5 z dokumentu + 3 łudząco podobne, żeby opis BM miał znaczenie; patrz P4). Jedno źródło: lista aut i punktów mapy w `stages.ts`, z niej powstają opcje (jak teraz). `reportAnswer` D5: „OŁTASZYŃSKA 92C”; D6 ideal: „BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY”.
`onDecision`: D5 przy „ZATWIERDŹ” na mapie, D6 przy „ZRZUĆ ŁADUNEK”. `onComplete`: „WYŁĄCZ APLIKACJĘ DRONA”.
**Prawy monitor: czat, nie panel.** Adres z mostka etapu 3 i opis auta z `openingConversation` są w logu czatu; gracz przewija czat, jak mówi dokument („PRZEWIŃ CZAT, JEŚLI GO NIE PAMIĘTASZ”). Nie ma obrazka-wzorca, nie ma notatki (`droneConfig.mentorNote` i `MentorNote` znikają).
Grafiki: `drone/city_map`, `drone/parking` (opcjonalne, domyślnie SVG).

### 3.5 `RatSessionApp.tsx` (`ol_rat_session`), etap `rat_session`, bez decyzji

Pliki: `minigames/RatSessionApp.tsx` (przepisać), `minigames/FreevoltFiles.tsx` (nowy: folder plików i przeciąganie), `minigames/NetworkDiagram.tsx` (nowy), korzysta z `usePointerDrag`.

| Ekran | Treść |
|---|---|
| 1 `c2` | Etykieta `//MALWARE TYPU RAT: REMOTE ACCESS TROJAN`, status `PENDRIVE ZOSTAŁ PODŁĄCZONY. MALWARE ZOSTAŁ AKTYWOWANY`, `NAZWA KOMPUTERA: MATEUSZ_BIURO_O&L`, `AKTYWOWANE NA IP: 161.185.160.93`; archiwum i nazwa dysku z `m3_usb`. Przycisk „PRZEJMIJ PULPIT OFIARY”. |
| loader | „PRZEJMOWANIE PULPITU OFIARY…” |
| 2 `desktop` | Baner „KONTROLUJESZ PULPIT OFIARY”; pulpit Windows z ikonami `KOSZ`, `TEN KOMPUTER`, `FREEVOLT` (pomarańczowy trójkąt ostrzegawczy). ZADANIE: „OTWÓRZ FOLDER FREEVOLT.” |
| 3 `files` (dodatek) | Okno folderu FREEVOLT z 4 plikami; obok panel „PULPIT HAKERA”. ZADANIE: „PRZECIĄGNIJ PLIKI FREEVOLT NA SWÓJ PULPIT.” Pliki: `FREEVOLT_OPIS_INFRASTRUKTURY.PDF`, `FREEVOLT_DOKUMENTACJA_CZ2.PDF`, `FREEVOLT_SCHEMAT_SIECI.PDF`, `FREEVOLT_UMOWY_DOSTAWCOW.XLSX`. Każde upuszczenie to krótki pasek kopiowania; wszystkie 4 trzeba przeciągnąć. Klik w plik działa jak przeciągnięcie. |
| loader | „ZDALNY DOSTĘP DO SIECI…” |
| 4 `network` | Animowany schemat: węzeł hakera, węzeł pośredni, 3 zainfekowane stacje robocze; napis „UZYSKAŁEŚ ZDALNY DOSTĘP DO SIECI O&L COMPANY”; przycisk „PODSUMOWANIE ZADANIA”. |

`onComplete`: po „PODSUMOWANIE ZADANIA”. Brak decyzji.
Prawy monitor: czat (meldunek z mostka dopiero po etapie, O5).
Grafika: `rat/victim_wallpaper` (opcjonalna).

## 4. Koncepcja: nowa //BAZA_WIRUSÓW i nowy //TOR (z punktu widzenia gracza)

**//BAZA_WIRUSÓW.** Gracz wchodzi i widzi trzy duże karty: RAT, ransomware, keylogger, każda z jednym zdaniem „co robi”. Wybiera i zatwierdza. Potem zamiast formularza z technicznymi przełącznikami dostaje czarny panel z wielkim znakiem zapytania i jednym poleceniem u góry: „PRZECIĄGAJ KURSOREM Z WCIŚNIĘTYM PRZYCISKIEM MYSZY PO CZARNYM POLU”. Jak przy zdrapce, spod maski wyłania się szczur (RAT), a pasek na dole zapełnia się segment po segmencie. Cztery podpisy pod obrazem zapalają się wraz z odsłanianiem, każdy po polsku i bez żargonu: „PODGLĄD EKRANU: widzisz pulpit ofiary”, „STEROWANIE: używasz jej myszy i klawiatury”, „CICHE TŁO: działa jak zwykły proces, nikt go nie zauważa”, „ŁĄCZNOŚĆ: łączy się z Twoim komputerem”. Gracz wie, co ma robić (zdrapuj), widzi postęp (pasek) i rozumie efekt (cztery zdania o tym, czym jest RAT). Na końcu komunikat „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY” i „KONTYNUUJ”. Odsłonięcie liczy się przy ok. 92% pola (próg w danych), żeby nie szukać ostatnich pikseli; klik też odsłania, więc działa bez ciągnięcia (dotyk, touchpad). Po bezczynności pulsuje wskazówka z przesuwającą się „ręką”.

**//TOR.** Gracz dostaje okno przeglądarki z paskiem adresu `https://olcompany.cloud` i dwiema zakładkami. Strona przewija się jak prawdziwa: u góry slogan firmy i kontakt, niżej „NASI EKSPERCI:” (pięć osób jedna pod drugą: miejsce na zdjęcie, imię i nazwisko, stanowisko, „W O&L OD: …” i dwa zdania o zakresie pracy), w zakładce WYDARZENIA wpisy o imprezach ze zdjęciami jedno pod drugim. Nigdzie nie jest napisane „nowy” ani „po szkoleniu”; gracz musi to sam wywnioskować (np. „W O&L OD: 2 TYGODNIE” przy jednej osobie, „od 9 lat” przy innej, zakres obowiązków). Przycisk „PRZEJDŹ DO WYBORU CELU” odblokowuje się dopiero po przewinięciu obu zakładek do końca. Potem są już tylko pytania: ekran celu pokazuje same imiona i nazwiska (żadnych stanowisk ani zdjęć, więc gracz odpowiada z tego, co przeczytał), a ekran przynęty trzy zdania do wyboru. Prawy monitor zostaje z czatem, więc gracz widzi całą rozmowę z BM, a lewy ekran należy do strony.

## 5. Zmiany w silniku

### 5a. `TimeJump` (wspólny komponent, `src/engine/components/TimeJump.tsx`)

**Zachowanie (nowe).** Pełnoekranowa nakładka pokazuje **lecący zegar**: duży cyfrowy odczyt `HH:MM` (monospace, kolor akcentu, poświata) i tarczę analogową ze wskazówkami, które obracają się zgodnie z „płynącym” czasem. Czas biegnie od `clockFrom` do `clock` krzywą przyspieszenia i zwalniania (ease-in-out) przez `durationMs`; minuty przelatują szybko, godziny zmieniają się widocznie, przejście przez północ liczone w przód (`22:15 → 06:02` = 7 h 47 min). Co upłynioną godzinę cichy tyk (`playRadarBlip`), na końcu `playNotification` (jak dziś). Pod zegarem zostaje cienki pasek postępu. `label` i `sublabel` są małym podpisem pod zegarem (nie głównym elementem). Przy `prefers-reduced-motion` zegar nie leci: pokazuje od razu godzinę docelową.

**Propsy.** Dotychczasowe `label?`, `sublabel?`, `durationMs?` (3000), `onDone`, `accent`; nowe `clockFrom?: string`, `clockTo?: string` (obie `HH:MM`). Gdy `clockTo` brak: wariant bez cyfr (tarcza analogowa z szybko wirującymi wskazówkami i podpisem `label`), czyli bez regresji dla misji bez `clock`. Gdy `clockTo` jest, a `clockFrom` brak: Desktop podstawia `systemTime` sprzed skoku, a gdy i tego brak, start = `clockTo` minus 3 h. Błędny format traktowany jak brak (ostrzeżenie w dev).

**Dane i store.** `ConversationBeat` `time_jump` dostaje opcjonalne `clockFrom?: string`; `timeJump` w `useMissionStore` przenosi je razem z `clock`; `Desktop.tsx` przekazuje `clockFrom={timeJump.clockFrom ?? systemTime}` i `clockTo={timeJump.clock}`. `endTimeJump` bez zmian (nadal ustawia `systemTime = clock`). Czysta logika w nowym `src/engine/core/clock.ts`: `parseClock`, `formatClock`, `forwardSpanMinutes`, `clockAt(from, to, t)`; testy w `tests/clock.test.ts`.

**Wpływ na M2.** M2 ma beat `time_jump` bez `clock` (`stages.ts` „MIJA KILKA GODZIN…”). Dostaje wariant bez cyfr: wirująca tarcza zamiast obracającej się ikony zegara, podpis i `sublabel` bez zmian, czas trwania i logika odblokowań (3 s po przeskoku) bez zmian. `VpnRouter` (M2, M4) używa `TimeJump` bezpośrednio, więc też dostaje nowy wariant. Test `tests/timeJump.test.ts` (`toEqual` na `timeJump`) przechodzi bez zmian, bo nowe pola są opcjonalne. Ewentualne dopisanie godzin do M2 to osobna decyzja właściciela (P8).

### 5b. `StageDefinition.openingConversation` (wymagane przez uwagę 4)

Kwestie BM „w minigrze” (adres „PRZEWIŃ CZAT…” i opis auta) muszą trafić do prawdziwego logu czatu, a kontrakt zabrania minigrze pisać wiadomości mentora. Proponowane minimalne rozszerzenie, zgodne z duchem „dane, nie kod”: `StageDefinition.openingConversation?: string[]`, czyli kwestie BM pisane z animacją „pisze” i opóźnieniem (jak w mostku), **raz na rozgrywkę przy pierwszym otwarciu aplikacji etapu**; powtórka misji je czyści. Dotyczy `openApp` w `useMissionStore.ts` oraz typu w `types/mission.ts`; M2 i M4 bez zmian. Użycie w M3: tylko `drone_app`. Alternatywa bez zmiany silnika: dopisać te dwie kwestie na koniec mostka etapu 3 (jako kwestie BM po przeskoku, przed „JUŻ SPRAWDZAM DRONA…”); wtedy opis auta pada przed otwarciem aplikacji, a nie na mapie (P5).

### 5c. `usePointerDrag` (reguła dwóch)

Przeciąganie wskaźnikiem jest w M2 (`WormBuilderApp`, wbudowane w komponent), a M3 potrzebuje go w dwóch minigrach (//DYSK E, pulpit ofiary). Plan: nowy hak `src/engine/components/usePointerDrag.ts` (zdarzenia wskaźnika, ghost przy kursorze, strefa upuszczenia, anulowanie, klik jako alternatywa), użyty w M3. Refaktoru M2 nie robimy (ryzyko bez korzyści); hak jest gotowy dla przyszłych misji.

## 6. Dane

### `stages.ts`
- Usunąć: `virusLabConfig.builder`, `osintBrowserConfig.mentorNote`, `droneConfig.mentorNote`, stałe `BRIDGE_ADDRESS_LINE` w obecnej postaci i `BRIDGE_DRONE_GO_LINE`, `introLine`, `pendriveConfig.attachments` jako decyzję oceniana, `droneConfig.car.decisionNum 8`, `ratSessionConfig.archive*`/`volume*` (dane z `m3_usb`).
- Zmienić: etapy `decisions`: `[1]`, `[2, 3]`, `[4]`, `[5, 6]`, `[]`; poziomy opcji wg dokumentu (sekcja 3); pytania = pytania z tabeli debriefu: „WYBIERZ ODPOWIEDNIEGO WIRUSA”, „KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ?”, „JAK GO OSZUKASZ?”, „WYBIERZ PODPIS NA KOPERCIE”, „WSKAŻ DRONOWI ADRES DOMU OFIARY”, „WYBIERZ MIEJSCE NA PARKINGU, GDZIE OFIARA NA PEWNO ZNAJDZIE KOPERTĘ Z PENDRIVE'M” (bez końcowych dwukropków); `reportAnswer` w opcjach zgodnie z kolumną „Wybór gracza” tabeli (D1 „RAT”, D2 stanowisko, D3 „NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY”, D4 podpis, D5 „OŁTASZYŃSKA 92C”, D6 „BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY”); mostki wg sekcji 2 (z `clockFrom`, `incomingCall`, etykiety przeskoków); adres „53-034”; `droneMapLocations` z „OŁAWSKA 51B”.
- Dodać: `matrix` w `virusLabConfig` (nagłówek, próg `revealThreshold: 0.92`, liczba segmentów, 4 części z podpisami, komunikat końcowy, `imageName: 'rat'`); `site` z 5 pracownikami (opis bez poziomu szkolenia, `tenure`, `photo`) i 2 wpisami (zdjęcia: nazwy z sekcji 3); `vector` z 3 opcjami; `usb` z plikami, regułą „plik pasuje do planu” (mapa `vectorId → [fileId]`), nazwami dysku i podpisami; `drone` z 8 autami i pozycją „pusty asfalt”; `rat` z 4 plikami FREEVOLT, topologią sieci (haker, pośredni, 3 stacje); `openingConversation` w `drone_app`; klucz `blocks`: `virus_database`, `browser`, `pendrive_app`, `drone_app`, `rat_session` (bez zmian).

### `minigames/types.ts`
Wszystkie `ChoiceOption` mogą mieć `reportAnswer?` (lokalny `ReportableOption`); typy konfiguracji wg zmian wyżej; `UsbState` (`m3_usb`); usunąć typy buildera i `mentorNote`.

### `data/mission3.json`
- `mission.decisionCount: 6`, dodać `mission.passingScore: 80`.
- `intro.dialogue` 1:1 z dokumentu, wersalikami, bez kropek końcowych (cztery pary BM→GRACZ; ostatnia kwestia gracza „DAJ MI CHWILĘ” jest kwestią odblokowującą, więc `intro.firstChoice` usunąć, jeśli silnik pozwala; w przeciwnym razie `firstChoice.label` = „DAJ MI CHWILĘ”, a `playerResponse` ostatniej pary usunąć). Wartości do skopiowania: sekcja „Blok dialogowy: INTRO” dokumentu. Uwaga: w dokumencie „PRZEDE MNĄ” i „DARKSUN” bez kropki.
- `desktopApps`: etykiety `//BAZA_WIRUSÓW`, `//CHAT: BYTE_MASTER`, `//TOR: PRZEGLĄDARKA`, `//DYSK E: PENDRIVE`, `//DRON: CONDOR MIT63`, `//WIRUS: RAT (C2)` (zmiana z „— SESJA”), `//RAPORT POOPERACYJNY`; `appId` i `componentId` bez zmian; kolejność jak w dokumencie.
- `step6.summary`: `title: "ZHAKOWANO O&L"`, `subtitle: "UKOŃCZONO ZADANIE 3"`, `perfectChoices: 6`, `goodChoices: 0`, `criticalErrors: 0`, `btcReward: 4.02`.
- `step6.choices` wg „Kanonicznej tabeli debriefu (D1–D6)”: 

| num | question | answer (ścieżka 100%) |
|---|---|---|
| 1 | WYBIERZ ODPOWIEDNIEGO WIRUSA | RAT |
| 2 | KTÓRĄ OSOBĘ ZAMIERZASZ ZHAKOWAĆ? | JUNIOR SPECJALISTA DS. WSPARCIA KLIENTA |
| 3 | JAK GO OSZUKASZ? | NAWIĄŻĘ DO IMPREZY DZIAŁU SPRZEDAŻY |
| 4 | WYBIERZ PODPIS NA KOPERCIE | ZDJĘCIA Z AFTERPARTY O&L COMPANY! |
| 5 | WSKAŻ DRONOWI ADRES DOMU OFIARY | OŁTASZYŃSKA 92C |
| 6 | WYBIERZ MIEJSCE NA PARKINGU, GDZIE OFIARA NA PEWNO ZNAJDZIE KOPERTĘ Z PENDRIVE'M | BIAŁY SAMOCHÓD Z CZERWONYM DACHEM – SAMOCHÓD OFIARY |

Każda pozycja: `correct: true`, `details`, `attack`, `defense` (styl M1/M2). Lekcje: D1 i D2 bez większych zmian względem obecnych (D2 dodaje myśl ze slajdu 3: informacje o tobie w sieci mogą zostać użyte przeciwko tobie); D3 przejmuje wątek archiwum ZIP (dawne D4 plus slajd 1: archiwa .zip/.rar, w razie wątpliwości prośba do IT); D4 łączy dawne D5 i D6 plus slajd 2 (nie wkładaj znalezionych pendrive'ów, włącz skanowanie nośników); D5 i D6 to dawne D7 i D8. Slajdy 4 i 5 („Podsumowując”, „Chcesz uniknąć hakowania?”) nie mają miejsca w grze (pole `educationalSlides` jest przestarzałe): ich treść idzie do `docs/moodle-baza-wiedzy.md` (plik do utworzenia w porcji H; M2 i M4 go jeszcze nie mają).

### `tests/mission3.test.ts`
Przepisać pod 6 decyzji (stałe z dokumentu wpisane w teście, żeby test pilnował zgodności, a nie przepisywał kodu):
- `decisionCount` 6; `step6.choices.length` 6; pytanie D1–D6 = pytanie z bloku; odpowiedź z `step6` = `reportAnswer` opcji ideal.
- etapy: kolejność `virus_database → browser → pendrive_app → drone_app → rat_session`; `decisions` `[1],[2,3],[4],[5,6],[]`; każdy `appId` w `desktopApps`; każda decyzja 1..6 w jednym etapie i w `step6.choices`.
- poziomy wszystkich opcji D1–D6 wg tabel z sekcji 3 (w tym: CEO i CISO critical, Wiktoria i Agnieszka suboptimal, Keylogger critical, Ransomware suboptimal).
- intro 1:1 (kilka kluczowych kwestii wersalikami, brak spójnika „NAJPIERW STWORZĘ WIRUSA”).
- mostki: zawartość i kolejność beatów (w tym dwie kwestie gracza z rzędu w mostku 3), `time_jump` z `clock` `06:02` i `08:12` oraz `clockFrom`, kafelek odblokowuje się dopiero po kwestii gracza i po przeskoku, `incomingCall.label` = „MALWARE ZOSTAŁ AKTYWOWANY”, adres „53-034”, brak kwestii „WEJDŹ NA JEGO KOMPUTER”.
- `drone_app.openingConversation` zawiera „BIAŁYM SAMOCHODEM Z CZERWONYM DACHEM” i „PRZEWIŃ CZAT”, nie zawiera „ZDJĘCIE”.
- przepływ przez silnik: 6 idealnych = 100% i 4,02 BTC; każda decyzja `critical` otwiera ekran wykrycia (D1 keylogger, D2 CEO i CISO, D3 opcja 3, D4 „WYPOWIEDZENIE UMOWY”, D5 Wystawowa, D6 asfalt); przykładowe `suboptimal` obniżają wynik bez wykrycia.
- dane stron: brak pól oceniających w danych strony i kart celu; opisy pracowników nie zawierają słów „szkolen”, „junior”, „nowy”.
- Osobne pliki testów logiki minigier (sekcja 7), żeby porcje nie kolidowały w `mission3.test.ts`: `tests/m3-matrix.test.ts`, `tests/m3-osint.test.ts`, `tests/m3-usb.test.ts`, `tests/m3-drone.test.ts`, `tests/m3-rat.test.ts`; `tests/clock.test.ts` i rozszerzenie `tests/timeJump.test.ts` dla silnika.

### `scenario.md`, `docs/migration-spec.md`
`scenario.md` przepisać wg `docs/scenario-format.md` z dokumentu i niniejszego planu (źródło prawdy kodu), z listą odchyleń z sekcji 8. `docs/migration-spec.md` jest nieaktualny (opisuje 8 decyzji i buildera): usunąć albo oznaczyć na górze jako zastąpiony tym planem.

## 7. Podział pracy na agentów

Każdy agent: osobny commit po zakończeniu, `npx vitest run` i `npx tsc -p tsconfig.app.json --noEmit` zielone (kod wyjścia). Porcje oznaczone **‖** mają rozłączne pliki i mogą iść równolegle w obrębie swojego kroku.

| Krok | Porcja | Pliki (własne) | Zależności / uwagi |
|---|---|---|---|
| 1 | **A. Silnik** (**zrobiona**) | `src/engine/components/TimeJump.tsx`, `src/engine/core/clock.ts`, `src/engine/components/Desktop.tsx` (przekazanie propsów), `src/engine/store/useMissionStore.ts` (`timeJump.clockFrom`, `openingConversation` w `openApp`, czyszczenie przy powtórce), `src/engine/types/mission.ts`, `src/engine/components/usePointerDrag.ts`, `tests/clock.test.ts`, `tests/timeJump.test.ts`, `docs/scenario-engine.md` (sekcje 5 i 9) | Pierwsza: dostarcza typy (`clockFrom`, `openingConversation`) dla B. Bez zmian w `scenarios/`. M2 i M4 muszą zostać zielone. |
| 2 | **B. Dane i struktura** (**zrobiona**, sekcja 9) | `stages.ts`, `minigames/types.ts`, `minigames/ui.tsx` (`ImageSlot`, helpery), `minigames/siteAssets.ts`, `assets/<grupa>/.gitkeep` (6 grup), `data/mission3.json`, `index.ts` (bez zmiany eksportów), `tests/mission3.test.ts`; usunięcie `builderLogic.ts` | Po A. Zastępuje 5 komponentów minigier **tymczasowymi zaślepkami** (te same nazwy eksportów, `AppHeader` + przycisk wołający `onComplete`), żeby `tsc` i testy przepływu przechodziły przed porcjami C–G. Wspólne pliki (`stages.ts`, `types.ts`, `mission3.json`, testy struktury) należą **tylko** do B. |
| 3 ‖ | **C. //BAZA_WIRUSÓW** | `minigames/VirusLabApp.tsx`, `ScratchMatrix.tsx`, `matrixLogic.ts`, `tests/m3-matrix.test.ts` | Po B. |
| 3 ‖ | **D. //TOR** | `minigames/OsintBrowserApp.tsx`, `SiteView.tsx`, `osintLogic.ts`, `tests/m3-osint.test.ts` | Po B. |
| 3 ‖ | **E. //DYSK E** | `minigames/PendriveApp.tsx`, `usbLogic.ts`, `tests/m3-usb.test.ts` | Po B (kontrakt `m3_usb` w `types.ts`). Używa `usePointerDrag` z A. |
| 3 ‖ | **F. //DRON** | `minigames/DroneApp.tsx`, `DroneMap.tsx`, `DroneCamera.tsx`, `droneLogic.ts`, `tests/m3-drone.test.ts` | Po B. Czyta `m3_usb` (z fallbackiem na czas dev). |
| 3 ‖ | **G. //WIRUS: RAT** | `minigames/RatSessionApp.tsx`, `FreevoltFiles.tsx`, `NetworkDiagram.tsx`, `tests/m3-rat.test.ts` | Po B. Używa `usePointerDrag` z A. |
| 4 | **H. Dokumentacja** | `scenario.md`, `docs/migration-spec.md` (usunąć lub oznaczyć), `docs/moodle-baza-wiedzy.md` | Po C–G (odchylenia dopisane na podstawie faktycznej implementacji). Dodać M3 do `docs/mission-standard.md` tylko, jeśli zmieniły się reguły. |
| 5 | **I. Weryfikacja** | brak własnych plików; poprawki zgłasza do właścicieli porcji | Przeglądarka (`?mission=3&dev=1`): każdy ekran przy 1366×768 i 1920×1080, konsola czysta w nowej karcie po świeżym załadowaniu, `node scripts/package-scorm.js --mission=3`. |
| 6 | **J. Niezależna recenzja** | brak | Agent, który nie pisał kodu, przeciw `mission-standard.md` i dokumentowi VR; potem poprawki (commit po każdym kroku, jak w M2). |

Kolejność wymuszona: A → B → (C ‖ D ‖ E ‖ F ‖ G) → H → I → J. Porcje C–G nie edytują wspólnych plików; potrzebną zmianę w `stages.ts`/`types.ts`/`mission3.json` zgłaszają do B (albo robi ją osoba koordynująca po zakończeniu kroku 3).

## 8. Odchylenia od dokumentu i pytania do właściciela

### Odchylenia (do `scenario.md`)

| # | Odchylenie | Powód |
|---|---|---|
| O1 | Hiperłącze `https://olcompany.cloud` w czacie nie otwiera przeglądarki; kafelek //TOR odblokowuje się po kwestii gracza i świeci. Drugi przycisk „PRZEJDŹ DO HAKOWANIA” z mostka S02→S03 nie występuje. | Konwencja silnika: czat to rozmowa, nie launcher. |
| O2 | Eksploracja zakładki WYDARZENIA jest przed D2 (dokument: po D2, jako krok 1 sceny S04). Gracz przewija obie zakładki, potem odpowiada na D2 i D3 jedno po drugim. | Uwaga właściciela: „najpierw rozpoznanie, potem tylko odpowiedź”. |
| O3 | Kwestie „w minigrze” po D2 (GRACZ „WIDZĘ, ŻE MAJĄ NOWEGO JUNIORA…”, BM „DOBRY WYBÓR. ALE JAK CHCESZ GO ZHAKOWAĆ?”) pominięte. Pytanie BM zastępuje etykieta strefy D3 „JAK GO OSZUKASZ?”. | Kwestie zależą od wyboru (przy Wiktorii byłyby nieprawdziwe), a „DOBRY WYBÓR” łamie standard M2+. |
| O4 | Nazwa dysku i podpis na kopercie to jedna decyzja D4 (dokument: Decyzja D4 z dwoma krokami, w debriefie tylko podpis); wybór pliku do wgrania i przeciąganie nie są oceniane, ale plik musi pasować do planu D3. | Dokument nie podaje poziomów nazw dysku; użyto poziomów ze starej implementacji. |
| O5 | Meldunek z kroku 5 sceny S07 (GRACZ, BM, BM) pada po etapie `rat_session` (mostek), a nie między pulpitem a kliknięciem FREEVOLT. | Rozmowa mostkująca silnika następuje po zamknięciu aplikacji; rozdzielenie wymagałoby dodatkowego etapu i kafelka. |
| O6 | Brak kafelka `item_virus_payload`: ładunek RAT przeciąga się w oknie //DYSK E jako element okna. | Okno aplikacji zasłania pulpit, przeciąganie kafelka z pulpitu jest niemożliwe. |
| O7 | Przyciski końcowe: „WYSUŃ PAMIĘĆ USB” jest przyciskiem zatwierdzenia D4; „ZRZUĆ ŁADUNEK” zatwierdza D6; „WYŁĄCZ APLIKACJĘ DRONA” i „KONTYNUUJ” zostają (gracz czyta komunikat). | Jedno zatwierdzenie na decyzję (standard). |
| O8 | Matryca ma cztery podpisane części wirusa i próg 92% pola jako 100% paska; dokument podaje tylko zdrapkę i pasek. Etykieta `//TOR: PRZEGLĄDARKA` (dokument: `TOR: PRZEGLĄDARKA`). | Uwaga 1 (zrozumiałość dla laika); spójność etykiet kafelków. |
| O9 | Parking ma 8 aut (dokument: 5); pierwszy przeskok czasu startuje z 22:15 (dokument: „upływ czasu do poranka” bez godziny startu). Podpisy pod zegarem przeskoków: „DO PORANKA…” i „DO GODZIN PRACY BIURA…” (dokument bez tekstu). | Opis auta ma wymagać uwagi; zegar potrzebuje punktu startu. |
| O10 | Folder FREEVOLT z 4 plikami do przeciągnięcia (nieoceniane). Zdanie BM „PRZESYŁAM CI ZDJĘCIE” pominięte. Opisy pracowników, „W O&L OD: …”, wpisy bez dat rocznych. | Uwagi właściciela 4, 5 i 2; dokument nie podaje opisów i lat. |
| O11 | Wyraźne literówki w kwestiach 1:1 („ZOSTAWIE”, „NAM POBICIE”, „B&O”): przepisujemy dosłownie z wyjątkiem „ZOSTAWIE” → „ZOSTAWIĘ” (P6; dotyczy D3 opcja 3 i kwestii gracza w mostku 3). Kod pocztowy adresu z dokumentu 53-034 (stary kod miał 53-234). | Wierność dokumentowi. |
| O12 | Intro: ostatnia kwestia gracza „DAJ MI CHWILĘ” jest kwestią intro (przed BIOS); `intro.firstChoice` usunięty, więc po starcie pulpitu //BAZA_WIRUSÓW jest od razu odblokowana (jak „Wzorzec B bez kwestii w czacie” w `resolveOpeningChat`). Dawny spójnik „NAJPIERW STWORZĘ WIRUSA.” usunięty. | Dokument kończy intro kwestią „DAJ MI CHWILĘ”. |
| O13 | `reportAnswer` opcji spoza ścieżki 100% wymyślone (tabela debriefu podaje tylko ścieżkę ideal): D2 = stanowisko osoby (`SPECJALISTKA DS. LOGISTYKI`, `SZEFOWA DZIAŁU SPRZEDAŻY`, `SZEF DZIAŁU CYBERBEZPIECZEŃSTWA`, `CEO`), D3 suboptimal `PODRZUCĘ PENDRIVE Z DOKUMENTAMI HR O ZWOLNIENIACH`, D3 critical `PUSTY PENDRIVE Z PODPISEM KEYLOGGER`, D4 critical nazwa dysku `NAZWA DYSKU: KEYLOGGER`. Pozostałe opcje: odpowiedź = etykieta. | Raport musi pokazać, co gracz wybrał. |
| O14 | Opcja D6 „zrzut na inny samochód” rozpisana na 7 aut suboptimal (po jednym na każde inne auto, w tym 3 łudząco podobne), „pusty asfalt” (critical) to opcja `asphalt` (kliknięcie w tło sceny). Opcja D5 `OŁAWSKA 51B` (dokument: „Oławska”; stary kod miał „Ołbińska”). | Dokument zlicza opcje zbiorczo; minigra potrzebuje po jednej na element sceny. |
| O15 | Ikony pulpitu ofiary: dokument podaje `FREEVOLT` z trójkątem; folder z 4 plikami do przeciągnięcia i napis `PULPIT HAKERA` to dodatek (uwaga 5, P7). Stacje w schemacie sieci mają nazwy `MATEUSZ_BIURO_O&L`, `STACJA-02`, `STACJA-03` (dokument: „3 zainfekowane stacje”). Zdanie „W O&L OD: …” i opisy pracowników wymyślone (uwaga 2), bez słowa o szkoleniach. | Dokument ich nie podaje. |

### Pytania do właściciela (rozstrzygnięte: właściciel przyjął propozycje domyślne P1–P10, bez zmian)

Rozstrzygnięcia: P1 oceniana nazwa dysku + podpis, poziom D4 = gorszy z dwóch kroków; P2 Ransomware zostaje suboptimal, gra toczy się jako RAT; P3 z ekranu celu nie ma powrotu do strony; P4 parking 8 aut; P5 `openingConversation` (zrobione w A); P6 poprawione tylko „ZOSTAWIĘ”; P7 4 pliki FREEVOLT bez dystraktorów; P8 M2 bez zmian; P9 pasek certyfikatu i portfel poza zakresem; P10 slajdy tylko jako lekcje `attack`/`defense` i baza Moodle (H). Dodatkowo (decyzja 9): przeskok nocny 22:15 → 06:02, poranny 06:02 → 08:12. Tabela poniżej zostaje jako zapis pytań.

| # | Pytanie | Propozycja domyślna |
|---|---|---|
| P1 | Czy nazwa dysku (`IMPREZA` itd.) ma wpływ na ocenę D4? Dokument wskazuje jej idealny wybór, ale poziomów nie podaje i w debriefie jest tylko podpis. | Tak: D4 = najgorszy z dwóch kroków (poziomy ze starej implementacji, `KEYLOGGER` critical). Alternatywa: nazwa nieoceniana, ale wymagana jest `IMPREZA` (błędna blokuje dalej). |
| P2 | Co po D1 `RANSOMWARE` (suboptimal)? Dokument prowadzi dalej jako RAT (matryca, kafelek, S07). | Zostaje RAT bez zmiany (gra toczy się dalej, werdykt w debriefie). |
| P3 | Czy z ekranu wyboru celu można wrócić do strony? „Najpierw rozpoznanie, potem tylko odpowiedź” sugeruje, że nie (standard też: bez cofania). | Bez powrotu; stan strony zostaje w pamięci aplikacji. |
| P4 | Parking: 8 aut z łudząco podobnymi (biały sedan z białym dachem, czerwony hatchback z białym dachem), czy tylko 5 z dokumentu? | 8 aut. |
| P5 | Czy akceptujesz małe rozszerzenie silnika `openingConversation` (sekcja 5b), żeby BM opisywał auto w czacie przy otwarciu //DRON? Alternatywa: kwestie na końcu mostka, przed otwarciem aplikacji. | Rozszerzenie silnika. |
| P6 | Literówki w dokumencie: „ZOSTAWIE”, „NAM POBICIE TROCHĘ DRAMATURGIĘ” (prawdopodobnie „PODBIJE”), „B&O COMPANY” vs „O&L”. Poprawiać? | Poprawić tylko „ZOSTAWIĘ”, resztę zostawić; „B&O” zostaje (to celowy błąd firmy w opcji suboptimal). |
| P7 | Pliki FREEVOLT na pulpicie ofiary: czy 4 pliki to właściwa liczba i nazwy (`OPIS_INFRASTRUKTURY`, `DOKUMENTACJA_CZ2`, `SCHEMAT_SIECI`, `UMOWY_DOSTAWCOW`)? Czy dodać 1–2 pliki-dystraktory, które nie należą do FREEVOLT? | 4 pliki, bez dystraktorów (czytelny cel, jak w M2). |
| P8 | Czy dopisać godziny (`clock`) do przeskoku czasu w M2, żeby też miał lecący zegar z cyframi? | Nie w tym planie; M2 dostaje wariant bez cyfr. |
| P9 | Pasek „postępu certyfikatu 4/10” i stan portfela (5,50 → 9,52 BTC) z dokumentu: czy mają trafić do raportu? Silnik ma dziś tylko `rewardBtc`. | Poza zakresem tej przebudowy. |
| P10 | Slajdy „CO POWINIENEŚ ZAPAMIĘTAĆ?”: tylko jako lekcje `attack`/`defense` i baza Moodle, bez osobnej karuzeli w grze (pole jest przestarzałe)? | Tak. |

## 9. Kontrakt porcji B (stan po wykonaniu; obowiązuje agentów C–G)

Porcja B zrobiona w gałęzi `refactor/missions-2-4-standard`. Wszystkie dane są w `stages.ts` (źródło: dokument scenariusza, 1:1), typy w `minigames/types.ts`. **Agenci C–G nie edytują** `stages.ts`, `types.ts`, `data/mission3.json`, `ui.tsx`, `siteAssets.ts`, `report.ts`, `index.ts` ani `tests/mission3.test.ts`: potrzebną zmianę zgłaszają osobie koordynującej. Każdy dopisuje tylko własne pliki z sekcji 7 oraz `tests/m3-*.test.ts`.

### 9.1 Co zrobiono

- `stages.ts`: 5 etapów, `decisions` `[1]`, `[2,3]`, `[4]`, `[5,6]`, `[]`; 6 decyzji z poziomami wg dokumentu; 5 mostków 1:1 (w tym dwie kwestie gracza z rzędu w mostku 3, adres 53-034, dwie osobne kwestie BM w mostkach 2 i 5); beaty `time_jump`: noc `clockFrom 22:15 → clock 06:02` (podpis „DO PORANKA…”), poranek `06:02 → 08:12` („DO GODZIN PRACY BIURA…”); `incomingCall.label` „MALWARE ZOSTAŁ AKTYWOWANY”; `drone_app.openingConversation` (2 kwestie BM, bez „PRZESYŁAM CI ZDJĘCIE”); stare podpisy „MIJA KILKA GODZIN…” usunięte.
- `data/mission3.json`: `decisionCount: 6`, `passingScore: 80`, `subTitle` z dokumentu, intro 1:1 wersalikami (bez `firstChoice`, O12), etykiety kafelków (`//TOR: PRZEGLĄDARKA`, `//WIRUS: RAT (C2)`), `step6.summary` („ZHAKOWANO O&L”, 6 idealnych, 4,02 BTC), `step6.choices` D1–D6 wg kanonicznej tabeli z `attack`/`defense` (D3 dostaje wątek ZIP/RAR i prośby do IT, D4 wątek niewkładania znalezionych pendrive'ów i skanowania nośników, D2 myśl o informacjach o sobie w sieci).
- `minigames/`: `types.ts` (nowe typy), `siteAssets.ts` (mechanizm grafik), `report.ts` (`buildReport`, `reportAnswerOf`), `ui.tsx` (`ImageSlot`, `LOADER_MS`, `LOADER_LONG_MS`; `NoteSection`/`MentorNote` usunięte), `stub.tsx` (tymczasowy wspólny ekran), 5 zaślepek, `index.ts`.
- `assets/<grupa>/.gitkeep` dla `virus`, `employees`, `events`, `usb`, `drone`, `rat`.
- `tests/mission3.test.ts` przepisany (41 testów); stare `builderLogic.ts` i `osintLogic.ts` usunięte (stare minigry zastąpione zaślepkami; kod zostaje w historii gita).

### 9.2 Wspólne dla minigier

| Rzecz | Gdzie | Użycie |
|---|---|---|
| Raport decyzji | `minigames/report.ts` | `onDecision(buildReport(config.virus, option))`; `answer` = `reportAnswer ?? label`; trzeci argument nadpisuje `tier`/`feedback`/`answer` (D4) |
| Grafika | `ui.tsx` `ImageSlot` | `<ImageSlot asset={ref} label="opis" fit="cover" />` (`fit`: `cover` albo `contain`), wypełnia rodzica; zastępnik w dev z `GRAFIKA: <opis>` i ścieżką |
| Rozwiązanie assetu | `siteAssets.ts` | `resolveAsset(group, name)`, `assetPath(group, name)`, `ASSETS_DIR`; glob `../assets/*/*.{png,jpg,jpeg,webp}` (WebP 1024 px) i `{gif,svg}` |
| Ładowanie | `ui.tsx` | `LOADER_MS` (1700), `LOADER_LONG_MS` (2000) z `ModuleLoader` |
| Stan między etapami | `types.ts` | `USB_STATE_KEY = 'm3_usb'`, `UsbState { volume, archive, signature }` w `customState` (`setCustomState`): pisze //DYSK E, czytają //DRON i //RAT (z fallbackiem `usbFallback` z configu) |
| Losowa kolejność opcji | silnik | `useShuffled` z `engine/core/shuffle.ts` (zaślepki NIE tasują; pełne minigry tak) |

Kontrakt `BlockProps<Config>`: `config`, `onDecision`, `onComplete`. Żadna minigra nie wywołuje `SideMonitor` (prawy monitor = czat). `AppHeader`, `ChoiceZone`, `ConfirmButton`, `ModuleLoader`, `usePointerDrag` z silnika.

Typy wspólne: `ReportableOption extends ChoiceOption { reportAnswer? }`; `GradedDecision { decisionNum, question, options }`; `GradedStep { question, options }` (bez numeru); `AssetRef { group, name }`.

### 9.3 Per minigra

Teksty ekranów (ZADANIE, przyciski, napisy loaderów) są w configu: nie wpisuj ich w JSX. Poniżej najważniejsze pola; pełne typy w `types.ts`.

| Porcja | Plik (do przepisania) | `componentId` / klucz `blocks` | Typ configu | Kluczowe pola | Assety |
|---|---|---|---|---|---|
| C | `VirusLabApp.tsx` (+ `ScratchMatrix.tsx`, `matrixLogic.ts`) | `ol_virus_lab` / `virus_database` | `VirusLabConfig` | `virus` (D1: `rat` ideal, `ransomware` suboptimal, `keylogger` critical; `desc` = opis karty), `virusTexts {task, choiceLabel, confirmLabel}`, `matrix {heading, loaderText, revealThreshold 0.92, segments 10, image, parts[4] {id,label,desc}, doneMessage, continueLabel}` | `virus/rat` |
| D | `OsintBrowserApp.tsx` (+ `SiteView.tsx`, nowy `osintLogic.ts`) | `ol_osint_browser` / `browser` | `OsintBrowserConfig` | `site {url, title, tabs {home, events}, heroHeadline, heroSubheadline, contact, employeesHeading, employees[5] {id,name,role,tenure,bio,photo,optionId}, events[2] {id,headline,body?,hashtags?,photos[]}}`, `siteTexts {task, continueLabel, readLabel}`, `loaders {target, targetSave, vectorSave}`, `target` (D2: 5 opcji, `label` = imię i nazwisko, bez `desc`, `reportAnswer` = stanowisko), `targetTexts`, `vector` (D3, 3 opcje), `vectorTexts` | `employees/<id pracownika>` (`jan_lukasiewicz`, `slawomir_bialek`, `wiktoria_galecka`, `agnieszka_leman`, `mateusz_klimowicz`), `events/` (`party_sales_1..3`, `meeting_logistics_1..2`) |
| E | `PendriveApp.tsx` (+ `usbLogic.ts`) | `ol_pendrive` / `pendrive_app` | `PendriveConfig` | `planDecisionNum` (3), `plan[] {vectorOptionId, answer, fileIds[]}` (odpowiedź D3 z `playerChoices` → pasujące pliki; `planFallbackVectorOptionId` gdy brak D3), `attachments[3] {id,name,archive,thumb?}`, `startTexts`, `armTexts`, `envelopeImage`, `volume` (krok nazwy: `question`, `options[4]` z poziomami do agregacji D4, brak `decisionNum`; `KEYLOGGER` ma `reportAnswer` „NAZWA DYSKU: KEYLOGGER” i zgłasza D4 od razu), `signature` (D4, `decisionNum 4`, 4 opcje, `confirmLabel` „WYSUŃ PAMIĘĆ USB”), `successMessage`. Zapis `customState.m3_usb` | `usb/party_photos` (`attachments[0].thumb`), `usb/envelope` (`envelopeImage`) |
| F | `DroneApp.tsx` (+ `DroneMap.tsx`, `DroneCamera.tsx`, `droneLogic.ts`) | `ol_drone` / `drone_app` | `DroneConfig` | `droneStats {model, video, speed, connection}`, `statuses {idle, awaitingPayload, awaitingCoordinates, flying}`, `texts {…Label, payloadCaption, payloadAttaching, flightCaption, tasks {activate,payload,map,camera,aim,done}}`, `hud {batteryPercent 48, transmissionLabel}`, `address` (D5, opcje z `mapLocations`), `car` (D6, opcje z `parkingCars` + `asphalt`), `mapLocations[4] {id,number,address,district,x,y,tier}`, `parkingCars[8] {id,desc,shape,body,roof,tier}` (kolejność = miejsca, 2 rzędy po 4), `asphalt {id,label,tier}`, `images {cityMap, parking}`, `successDrop`, `usbFallback` | `drone/city_map`, `drone/parking` (opcjonalne, brak = SVG) |
| G | `RatSessionApp.tsx` (+ `FreevoltFiles.tsx`, `NetworkDiagram.tsx`) | `ol_rat_session` / `rat_session` | `RatSessionConfig` | `host {name, ip}`, `usbFallback`, `alert {label,status,hostLabel,ipLabel,archiveLabel,volumeLabel,takeoverLabel}`, `desktop {banner, icons[3] {id,label,warning?}, wallpaper}`, `files {folderTitle, hackerDesktopLabel, items[4] {id,name,kind}, copyingLabel}`, `network {nodes[5] {id,label,kind: hacker, relay albo infected}, headline, endLabel}`, `loaders {desktop, network}`, `tasks {alert,desktop,files,network}`. Brak decyzji; czyta `m3_usb` | `rat/victim_wallpaper` (opcjonalna) |

Id opcji (stabilne, testowane w `mission3.test.ts`): D1 `rat`/`ransomware`/`keylogger`; D2 `choose_mateusz`/`choose_logistics` (Wiktoria)/`choose_sales` (Agnieszka)/`choose_ciso`/`choose_ceo`; D3 `vector_party_zip`/`vector_hr_docs`/`vector_empty_keylogger`; D4 podpisy `env_afterparty`/`env_bo`/`env_lost_docs`/`env_termination`, nazwy dysku `vol_impreza`/`vol_bo`/`vol_new_disk`/`vol_keylogger`; D5 `loc_1..4` (4 = Ołtaszyńska); D6 `car_*` i `asphalt` (idealne `car_target`).

Logika ocen po stronie minigry: D2 `critical` (CEO, szef cyberbezpieczeństwa) → `onDecision` od razu, bez cofania. D4 = gorszy z poziomów nazwy i podpisu (`buildReport(config.signature, option, { tier, feedback, answer })`); nazwa `KEYLOGGER` zgłasza D4 `critical` natychmiast.

### 9.4 Zaślepki i sprzątanie

- Zaślepki (`stub.tsx` + 5 komponentów) mają te same nazwy eksportów, pokazują dane z configu jako przyciski i wołają `onDecision`/`onComplete`. Nie tasują opcji. Każdy agent zastępuje swój komponent całkowicie i przestaje importować `stub.tsx`; po ostatniej z porcji C–G plik `stub.tsx` należy usunąć (porcja H).
- Nowe pliki logiki (`matrixLogic.ts`, `osintLogic.ts`, `usbLogic.ts`, `droneLogic.ts`) tworzą agenci; stare `builderLogic.ts` i `osintLogic.ts` usunięto w B.
- Uruchomienie: `?mission=3&dev=1`, `window.__STORE__` w dev; zaślepka //DYSK E zapisuje `m3_usb` z wartościami ścieżki ideal.
