# Misja 4 (Energy Rock) — plan przebudowy wg dokumentu scenariusza

Źródło prawdy: `docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md` (10 decyzji, D1–D10). Obecna implementacja (10 decyzji, ale inna numeracja i treść) powstała z PDF-a i ma być zgodna z dokumentem. Standard: `RedBlueTeam/docs/mission-standard.md`, kontrakt: `docs/scenario-engine.md` (sekcje 3 i 5), prowadzenie gracza: `docs/player-guidance.md`. Wzorzec procesu i formy: `mission_03_ol_company/docs/rebuild-plan.md` (M3 zamknięta). Uwagi z audytu (`docs/audit-missions-2-4.md`) są wiążące.

**Status:** implementacja wg propozycji domyślnych P1–P17 (przyjęte przez koordynatora 2026-11-09, jak w M3; właściciel może je zmienić przy audycie). Porcje E3 i E4 robimy (opcjonalne → przyjęte).

Skróty: **BM** = Byte_Master, **czat** = czat BM na prawym monitorze (aplikacje nie przejmują go przez `SideMonitor`).

## 0. Założenia

| # | Założenie | Źródło |
|---|---|---|
| 1 | M4 ma być co najmniej tak samodzielna jak M3: opisy opcji neutralne, brak żywych wskaźników oceny, opcje tasowane, każda aplikacja z `AppHeader` + paskiem ZADANIE, bez przewijania przy 1366×768 i 1920×1080. | `mission-standard.md`, audyt, „Ustalenia wspólne” 1–2 |
| 2 | Prawy monitor to **czat** we wszystkich aplikacjach M4 (żadna nie wywołuje `SideMonitor`). Wszystko, na czym opiera się decyzja, jest na lewym ekranie albo w czacie (intro, mostki). | M3 sekcja 2 |
| 3 | Mentor może naprowadzać treścią, interfejs milczy: żadnego „DOBRY WYBÓR”, żadnej oceny po wyborze; poziom trafia tylko do raportu przez `onDecision`. | `scenario-engine.md` sekcja 3 |
| 4 | Dialogi (intro, mostki, negocjacje) 1:1 z dokumentem, WERSALIKAMI, bez dopisanych zdań. Gdzie dokument milczy na granicy etapów, jest krótka kwestia-spójnik gracza (zapis w odchyleniach). | `scenario-engine.md` 10.2 pkt 5 |
| 5 | Poziomy opcji, teksty opcji i feedback 1:1 z dokumentem. Różnice względem kodu naprawiamy w kodzie. | decyzja właściciela 2026-11-05 |
| 6 | Misja ma 10 decyzji (`decisionCount: 10`, `passingScore: 80`), jedna decyzja = 10 pkt. Raport ma 10 pozycji (P1). | dokument sekcja 1 |
| 7 | Silnik rozwija się wspólnymi mechanizmami; M4 nie dodaje gałęzi po identyfikatorze misji. Zmiany silnika: sekcja 4. | `AGENTS.md` pkt 1 |
| 8 | Etapy w kolejności Kill Chain: uzbrojenie (wirus, hasło, komunikat) → dostarczenie (mail, VPN) → egzekucja (alert) → działania na celach (szyfrowanie, eksfiltracja, negocjacje). | `scenario-engine.md` 10.1 |
| 9 | Aplikacje pamiętają stan (zwykły `useState`, bez resetu przy zamknięciu). | `AGENTS.md` pkt 1a |

## 1. Rozjazdy: dokument ↔ obecna implementacja

Legenda: **zostaje** / **zmienić** / **usunąć** / **dodać**.

| Scena | Decyzja | Dokument | Obecna implementacja | Zmiana |
|---|---|---|---|---|
| Meta | — | `passingScore` 80%, tytuł „ZHAKOWANO ENERGY ROCK”, „UKOŃCZONO ZADANIE 4”, 10 idealnych, 3,79 BTC, kolor przewodni czerwony `#FF0033` + fiolet C2 `#8A2BE2` | `passingScore: 70`, `summary.title: "SUKCES"`, `perfectChoices: 10`, `accentColor: #a855f7` | zmienić (`passingScore: 80`, tytuł, akcent, P13) |
| Pulpit | — | 7 kafelków w kolejności: czat (1), BAZA_WIRUSÓW (2), `//WIRUS: RANSOMWARE` (3), MAIL (4), VPN (5), MODUŁ_RANSOMWARE (6), CZAT_Z_OFIARĄ (7); etykieta czatu `//KOMUNIKATOR: BYTE_MASTER` | BAZA_WIRUSÓW pierwsza, czat drugi; `//CHAT: BYTE_MASTER`, `//WIRUS: RANSOMWARE` (otwiera kreator), `//TUNEL_VPN`, `//STACJA OFIARY`, `//NEGOCJACJE: SZEF IT`, `//PODSUMOWANIE` | zmienić (czat pierwszy, etykiety wg dokumentu, `//RAPORT POOPERACYJNY` jak w M3) |
| Pulpit | — | `item_virus_payload` „`//WIRUS: RANSOMWARE`” po S04, przeciągany na załącznik w oknie maila | Kafelek `//WIRUS: RANSOMWARE` to wejście do kreatora S03/S04, ładunku do przeciągania brak | zmienić (kreator dostaje własną etykietę, P11; ładunek to element w oknie maila, O6/P8) |
| INTRO | flavor | 5 par, ostatnia kwestia gracza „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA” kończy dialog, potem BIOS | Tekst zgodny (poprawione „IRH”→„ICH”), ale ostatnia kwestia to `intro.firstChoice` (spójnik po BIOS) | zmienić (kwestia w intro, `firstChoice` usunąć, jak O12 w M3) |
| S01 | D1 | 3 karty z grafikami: Ransomware ideal, RAT suboptimal, Keylogger critical; feedback z dokumentu | Poziomy zgodne; karty bez grafik, z `tags` zdradzającymi ocenę („DOUBLE EXTORTION”, „PASYWNY”), feedback zbliżony | zmienić (grafiki, usunąć `tags`, feedback 1:1, pytanie bez dwukropka) |
| S02 | flavor | Matryca skanująca: czarna maska z `?`, zdrapka kursorem, fioletowy segmentowy pasek do 100%, ikona monitora w łańcuchach z kłódką | `scannerCells: 32`, „skaner sygnatury” (inna mechanika) | zmienić (wspólny klocek `ScratchMatrix` z M3, sekcja 4) |
| S02→S03 | flavor | GRACZ „STWORZĘ TAKIE HASŁO…” (kwestia „przed akcją” S03) | Spójnik po etapie 1 z kropką na końcu | zostaje (jako kwestia odblokowująca kreator, bez kropki) |
| S03 | **D2** | Suwak 8–24 (domyślnie 8), 6 kafelków reguł do ramki „CECHY HASŁA”, podgląd „HASŁO:”, wynik „SIŁA HASŁA x/5”; critical: długość 8 albo kafelek BIAŁE ZNAKI / ZNAKI NARODOWE | Suwak domyślnie 12, 6 przełączników (nie kafelki), **hasło nigdy critical** (świadoma decyzja kodu), `minSafeLength: 14`, żywy wskaźnik „OCENA ENTROPII” | zmienić (kafelki do ramki, progi z P3, critical wg dokumentu, żywy wskaźnik usunąć) |
| S03 | — | BM po akcji: „GDYBY LUDZIE W RZECZYWISTOŚCI TWORZYLI TAK SILNE HASŁA…” | W mostku po kreatorze, przed kwestią o mailu | zmienić (pomijamy: chwali po wyniku, przy 3–4/5 byłaby nieprawdziwa, O3/P12) |
| S04 | **D3** | 6 slotów (IKONA, TYTUŁ, CZAS, KWOTA, ADRES, KONTAKT); 4 kafelki stałe + 2 tytuły + 2 czasy; critical: czas 30 s w dowolnej konfiguracji; suboptimal: tytuł „CZEKAM NA BITCOINY!” | Tylko 2 wybory (tytuł, czas) + `staticParts`; **czas 30 s = suboptimal**; adres `XKAJI023KJDF93` (dokument: `XKAJ1023KJDf93`) | zmienić (6 slotów z przeciąganiem, 30 s critical, adres 1:1, poziom D3 = gorszy z dwóch slotów, P2) |
| S04 | **D4** | 3 kwadraty: Zielony, Czerwony (ideal), Biały/Szary (suboptimal); zielony „suboptimal / critical” | Zielony suboptimal, „BIAŁY” suboptimal | zmienić (etykieta „BIAŁY / SZARY”; zielony wg P4, domyślnie suboptimal) |
| S04 | flavor | „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY”; odblokowanie `//WIRUS: RANSOMWARE` | Kompilacja z loaderem bez tego komunikatu | zmienić (komunikat 1:1, brak kafelka O6) |
| S04→S05 | flavor | BM „ZNALEZŁEM INFORMACJE… WŁĄCZ APLIKACJĘ MAILA”, GRACZ „MAJĄ JAKIEŚ WYTYCZNE…”, BM „TEMAT MAILA POWINIEN ZAWIERAĆ…” | BM dopisuje zdanie o haśle do archiwum („Załącznik z CV zabezpiecz prostym hasłem…”), mały druk zamiast WERSALIKÓW, dopisany BM o haśle w S03 | zmienić (1:1, dopisane zdanie usunąć: zdradza D6) |
| S05 | **D5** | WILK CV suboptimal, ANALITYK MICHAŁ WILK **critical** | `MILK CV` critical, `ANALITYK MICHAŁ WILK` suboptimal, brak „WILK CV” | zmienić (opcje i poziomy z dokumentu) |
| S05 | **D6** | 3 pełne treści WERSALIKAMI: formalna z hasłem (ideal), „HEJ…” bez hasła (suboptimal), „CZEŚĆ… USŁUG” (critical) | Treści małą literą z „WARIANT A/B/C”; „Cześć… usług” suboptimal, „Hej” critical (zamienione) | zmienić (treści 1:1, poziomy z dokumentu, bez „WARIANT”) |
| S05 | flavor | Przeciągnięcie `//WIRUS: RANSOMWARE` na `CV_WILK.PDF`, pojawia się `WŁĄCZ VPN` | Uzbrojenie bez przeciągania (loader „arm”) | zmienić (przeciąganie elementu w oknie maila, O6/P8) |
| S05 | **D7** | `POŻĄDANY ADRES IP: 109.43.200.124`, `AKTUALNY: 106.55.202.120`, rotacja oktetów lub „DOPASUJ W AI”; potem nadawca: M.WILK@PRIV.COM ideal, ALEX@PRIV.COM suboptimal, NEWRAWGOODS@COMMERCIAL.BIZ critical; koniec: `WYŚLIJ MAILA` | IP i nadawca to **dwie decyzje** (D7 IP: zły adres critical, D8 nadawca), adresy małą literą, `newrapgood@commercial.biz`; po wysyłce wbudowany `TimeJump` w `VpnRouter` | zmienić (jedna decyzja D7, IP bramką bez oceny, P2; adresy 1:1; przeskok do mostka; sekcja 4) |
| S05→S06 | flavor | GRACZ „WSZYSTKO ZROBIONE…”, BM „KTO WIE?”, zielony baner „MALWARE ZOSTAŁ AKTYWOWANY” | Zgodne co do dwóch kwestii, ale dodane BM „MALWARE AKTYWNY — REKRUTER OTWORZYŁ CV… WEJDŹ NA STACJĘ OFIARY” (launcher, spoiler); przeskok czasu bez godzin | zmienić (usunąć dopisek, `time_jump` z `clockFrom`/`clock`, `incomingCall` = baner) |
| S06 | flavor | Ekran startowy `ENERGY_ROCK_01_PC`, IP `151.89.159.52`, `SZYFRUJ ZASOBY FIRMY`; topologia: wektor, 2 stacje, 4 serwery baz, 1 serwer główny; klik zielonych węzłów → fiolet + kłódka; komunikat + `POBIERZ PLIKI` | 7 węzłów (`NODES = 7`), klik, host i IP zgodne | zmienić (8 węzłów wg dokumentu, nowy komponent `EncryptNetwork`) |
| S06 | **D8** | 12 plików, 3 cele (`FVOLT_TECH.DOCX`, `FREEVOLT_SCHEMAT.PDF`, `ENERGIA_FVOLT.XCF`); ideal = dokładnie 3; suboptimal = cele + zmyłki albo 1–2 cele; critical = wyłącznie fałszywe | 10 plików z typami `freevolt/decoy/honeypot`, `ENERGIA_FVOLT.KCF`, `UMOWA2022.PDF`; „honeypot” → critical (poza dokumentem); brak 2 plików | zmienić (12 plików z dokumentu, reguły P5, honeypot usunąć) |
| S06 | flavor | Po pobraniu: GRACZ „AKTYWOWALI RANSOMWARE…”, BM „PAMIĘTAJ TYLKO…”; komunikat `OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT`, `URUCHOM CZAT Z OFIARĄ` | Kwestie rozbite: spójnik „MAM PLIKI FREEVOLT. SZEF IT DZWONI…” po S06, a „PAMIĘTAJ TYLKO…” w mostku po negocjacjach; baner „SZEF IT ENERGY ROCK” bez przeskoku czasu | zmienić (mostek po S06 1:1 + `time_jump` + `incomingCall`, P7) |
| S07 | **D9** | Wymiana 1: SZEF IT „…PROBLEM RANSOMWARE **I** ODPOWIEDNIE SŁUŻBY…” (bez wykrzyknika), 3 odpowiedzi | Kod z wykrzyknikiem; jedna zagregowana decyzja D10 (3 tury) | zmienić (oddzielna D9 na węźle 1, `DialogueTree` w trybie per-węzeł, P6) |
| S07 | **D10** | Wymiana 2: „CZEGO CHCESZ W ZAMIAN…”, 3 odpowiedzi, poziomy jak w kodzie | Zgodne treściowo, część w agregacie | zmienić (oddzielna D10 na węźle 2) |
| S07 | flavor | Wymiana 3: SZEF IT „POTRZEBUJEMY CZASU NA ICH ZDOBYCIE”, GRACZ „MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA DO ODSZYFROWANIA” (jedyna opcja) | Dwie opcje (w tym wymyślone „DOBRZE, DAM WAM KILKA DNI” critical), skrócona kwestia, `closingMessage` spoza dokumentu | zmienić (jedna opcja bez oceny, treść 1:1, `closingMessage` usunąć) |
| S07 | — | Komunikator „SZEF IT ENERGY ROCK” + podgląd czerwonego okna żądania okupu 200 000 USD | Sam czat, bez podglądu | dodać (miniatura okna z wyborów D3/D4 gracza, P16) |
| S07→S08 | flavor | 4 beaty: GRACZ „MAM TWOJE PLIKI…”, BM „TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO”, GRACZ „CZY TO ZNACZY…”, BM „NIE TAK SZYBKO…” | Beaty 2 i 4 sklejone w jedną kwestię BM; kropki na końcu kwestii gracza | zmienić (osobne beaty 1:1) |
| Raport | — | 9 wierszy tabeli (wiersz 9 „CZY UDAŁO SIĘ WYŁUDZIĆ OKUP? TAK”), pytania wg tabeli | 10 pozycji z innymi pytaniami („Siła wygenerowanego hasła:”, „Wybór plików do kradzieży:”, „Negocjacje z ofiarą:”), bez `attack`/`defense` | zmienić (P1, P9) |
| Raport | — | 5 slajdów „CO POWINIENEŚ ZAPAMIĘTAĆ?” (3 treściowe, 1 lista, 1 odesłanie do bazy wiedzy) | `educationalSlides`: 3 skrócone slajdy (reguła „3-2-1” spoza dokumentu) | usunąć (treść do lekcji `attack`/`defense` i `docs/moodle-baza-wiedzy.md`, P9) |
| Test | — | — | `tests/mission4.test.ts` pilnuje `passingScore` nieobecnego, `educationalSlides.length === 3`, bridgeBeat intro | zmienić (sekcja 5) |

Rozjazdów razem: 29 wierszy tabeli (w tym 6 dotyczących decyzji D1–D10 z innymi poziomami lub opcjami: D2, D3, D4, D5, D6, D8; D7 i D9/D10 z inną numeracją).

## 2. Nowa lista etapów

Zasady: prawy monitor to **czat** w każdym etapie. `componentId` aplikacji misji ma prefiks `er_`; wspólny klocek `vpn_router` zostaje z katalogu (jak teraz). Identyfikatory kafelków (`appId`) zostają z kodu, żeby nie mnożyć zmian (`victim_workstation`, `negotiation`); zmieniają się etykiety.

| etap | appId | decyzje | `componentId` | prawy monitor | `time_jump` (`clockFrom` → `clock`) | odblokowuje |
|---|---|---|---|---|---|---|
| 1 | `virus_database` | D1 | `er_virus_lab`: wybór wirusa → matryca (S01, S02) | czat | — | `ransomware_builder` (po kwestii gracza) |
| 2 | `ransomware_builder` | D2, D3, D4 | `er_ransom_builder`: hasło → komunikat okupu → kolor (S03, S04) | czat | — | `mail` (po kwestii gracza) |
| 3 | `mail` | D5, D6 | `er_phishing_mail`: temat → treść → uzbrojenie (S05 cz. 1) | czat | — | `vpn_app` (po spójniku gracza) |
| 4 | `vpn_app` | D7 | `vpn_router` (klocek katalogu): IP → nadawca → `WYŚLIJ MAILA` (S05 cz. 2) | czat | `16:40` → `09:10` (po „KTO WIE?”) | `victim_workstation` + baner „MALWARE ZOSTAŁ AKTYWOWANY” (3 s po przeskoku) |
| 5 | `victim_workstation` | D8 | `er_ransom_c2`: start → szyfrowanie sieci → eksfiltracja (S06) | czat | `09:10` → `11:35` (po kwestii BM „PAMIĘTAJ TYLKO…”) | `negotiation` + baner „OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT” (3 s po przeskoku) |
| 6 | `negotiation` | D9, D10 | `er_victim_chat`: opakowanie `DialogueTree` + miniatura okna okupu (S07) | czat (rozmowa z szefem IT jest w aplikacji, czat to meldunek) | — | `debrief_app` (po meldunku) |

Godziny (P7): wysłanie maila późnym popołudniem 16:40, otwarcie CV przez rekrutera rano 09:10 (przeskok przez północ liczony w przód, jak w M3 22:15 → 06:02; data na pulpicie zostaje 19.05.2026); drugi przeskok to czas od uruchomienia ransomware do przeczytania komunikatu przez szefa IT (09:10 → 11:35). Podpisy pod zegarem: „DO GODZIN PRACY REKRUTERA…” i „DO REAKCJI SZEFA IT…” (małe, nie powtarzają godziny).

Mostek etapu 1 (spójnik kwestią z dokumentu): GRACZ „STWORZĘ TAKIE HASŁO, ŻE NIE MA SZANS, ŻEBY ICH SPECJALIŚCI ZŁAMALI JE PRZEZ NAJBLIŻSZE TYGODNIE. WYKORZYSTAM GENERATOR W MOIM MENEDŻERZE HASEŁ” (bez kropki; `id` `m4_reply_virus`). Odblokowuje kreator.

Mostek etapu 2 (S04→S05, 1:1): BM „ZNALEZŁEM INFORMACJE, ŻE PRIORYTET MAJĄ W TEJ CHWILI CV WYSYŁANE NA STANOWISKO 'ANALITYK RYNKÓW ENERGETYCZNYCH'. WŁĄCZ APLIKACJĘ MAILA” → GRACZ „MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU MAILA Z CV?” → BM „TEMAT MAILA POWINIEN ZAWIERAĆ ODPOWIEDNIO NAZWISKO ORAZ IMIĘ Z DOPISKIEM CV”. Zdanie „WŁĄCZ APLIKACJĘ MAILA” zostaje (wierność VR, kafelek świeci, nie ma linku w czacie).

Mostek etapu 3 (spójnik): GRACZ „ZAŁĄCZNIK GOTOWY. CZAS ZAMASKOWAĆ ADRES IP PRZED WYSŁANIEM” (zastępuje „…I WYBIORĘ NADAWCĘ”, które zdradzało kolejny krok).

Mostek etapu 4 (S05→S06, 1:1): GRACZ „WSZYSTKO ZROBIONE. CZEKAMY AŻ OTWORZĄ CV I AKTYWUJĄ RANSOMWARE. JAK NIE PRZYJMIECIE MNIE DO DARKSUN, TO MOŻE DOSTANĘ PRACĘ W ENERGY ROCK” → BM „KTO WIE?” → `time_jump` (`clockFrom: '16:40'`, `clock: '09:10'`) → odblokowanie `victim_workstation` z `incomingCall: { appId: 'victim_workstation', label: 'MALWARE ZOSTAŁ AKTYWOWANY' }`, dźwięk `alarm`. Dopisana kwestia „MALWARE AKTYWNY — … WEJDŹ NA STACJĘ OFIARY” znika.

Mostek etapu 5 (po S06, 1:1): GRACZ „AKTYWOWALI RANSOMWARE I STRACILI DOSTĘP DO PLIKÓW. TERAZ CZEKAMY AŻ SIĘ ZE MNĄ SKONTAKTUJĄ” → BM „PAMIĘTAJ TYLKO, ŻE POTRZEBUJEMY I PLIKÓW, I OKUPU” → `time_jump` (`09:10` → `11:35`) → odblokowanie `negotiation` z `incomingCall: { appId: 'negotiation', label: 'OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT' }` (P15), dźwięk `alarm`. Dawny spójnik „MAM PLIKI FREEVOLT. SZEF IT DZWONI…” znika.

Mostek etapu 6 (S07→S08, 1:1, cztery beaty): GRACZ „MAM TWOJE PLIKI, UDAŁO SIĘ BEZ WIĘKSZYCH PROBLEMÓW” → BM „TERAZ POWINNIŚMY MIEĆ JUŻ WSZYSTKO” → GRACZ „CZY TO ZNACZY, ŻE W KOŃCU PRZYJMIECIE MNIE DO DARKSUN?” → BM „NIE TAK SZYBKO, MAM DLA CIEBIE JESZCZE WISIENKĘ NA TORCIE. KILKA WISIENEK. PRZYGOTUJ SIĘ”. Odblokowuje `debrief_app`, dźwięk `success`. (Dokument: kryterium to klik `PODSUMOWANIE ZADANIA`, tu: kafelek `//RAPORT POOPERACYJNY`.)

Intro (1:1, dokument): ostatnia kwestia gracza „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA” jest ostatnią parą intro (po BM „BĘDĄ Z CIEBIE LUDZIE”), `intro.firstChoice` usunięty, `//BAZA_WIRUSÓW` jest od razu odblokowana po BIOS (wzorzec O12 z M3).

## 3. Per aplikacja

Wspólne: `AppHeader` z paskiem ZADANIE (zmienia się z ekranem), `ModuleLoader` 1,5–2 s między ekranami (`LOADER_MS` / `LOADER_LONG_MS`), opcje tasowane (`useShuffled`), `ChoiceZone` z etykietą = pytanie z raportu, pamięć stanu przez `useState`, przeciąganie przez `usePointerDrag` (klik = alternatywa), `onDecision` przez `buildReport(decision, option, overrides?)` z `answer` = `reportAnswer ?? label`. Teksty ekranów w configu (`stages.ts`), nie w JSX. Kolor C2 (`#8A2BE2`) tylko w elementach C2 (kafelek modułu, węzły zaszyfrowane, pasek matrycy), akcent misji to `accentColor` (P13).

### 3.1 `er_virus_lab` (`VirusLabApp.tsx`), etap 1, D1

| Ekran | Treść / zadanie (ZADANIE) |
|---|---|
| 1 `virus_select` | Nagłówek „BAZA WIRUSÓW - WYBIERZ ODPOWIEDNIEGO WIRUSA”. 3 karty z grafikami (tasowane), opis 1:1: „RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ”, „RAT: REMOTE ACCESS TROJAN – POZWOLI PRZEJĄĆ KONTROLĘ NAD PULPITEM OFIARY”, „KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE”. Bez `tags`. `ConfirmButton`. |
| loader | „PRZYGOTOWANIE MATRYCY KOMPILACJI…” |
| 2 `matrix` | „WYSZUKAJ CZĘŚCI WIRUSA:”, czarna maska z niebieskim `?`, fioletowy segmentowy pasek. ZADANIE: „PRZECIĄGAJ KURSOREM Z WCIŚNIĘTYM PRZYCISKIEM MYSZY PO CZARNYM POLU, ŻEBY ODSŁONIĆ WIRUSA.” Pod maską ikona wektorowa dla wybranego wirusa (Ransomware: monitor w łańcuchach z kłódką; RAT: grafika z M3). Wspólny klocek `ScratchMatrix` z silnika. |
| 3 `done` | Po 100% krótki komunikat sukcesu ok. 1,5 s, potem `onComplete` (bez osobnego „KONTYNUUJ”; dokument tego przycisku nie ma, wymaga tylko 100%). |

D1 zgłaszane przy zatwierdzeniu karty: `ransomware` ideal, `rat` suboptimal, `keylogger` critical (feedback z dokumentu). `keylogger` nie otwiera matrycy (od razu detekcja). `onComplete` po 100% paska. Grafiki: `virus/ransomware`, `virus/rat`, `virus/keylogger` (karty), `virus/matrix_ransomware` (pod maską, domyślnie SVG), RAT pod maską to ta sama `virus/rat`.

### 3.2 `er_ransom_builder` (`RansomBuilderApp.tsx`), etap 2, D2–D4

Pliki: `RansomBuilderApp.tsx`, `PasswordStep.tsx`, `NoteStep.tsx`, `ColorStep.tsx`, `ransomLogic.ts` (czysta logika: siła hasła, poziom D3, kompletność slotów).

| Ekran | Treść / zadanie |
|---|---|
| 1 `password` (D2) | „USTAW ZŁOŻONOŚĆ HASŁA:”. Suwak „DŁUGOŚĆ HASŁA” 8–24 (domyślnie 8), ramka docelowa „CECHY HASŁA:”, pole „HASŁO:” z dynamicznym podglądem (losowy ciąg z wybranych zestawów; bez żadnego wskaźnika siły). Zasobnik 6 kafelków (tasowane, bez oznaczeń „pułapka”): `DUŻE LITERY A-Z`, `MAŁE LITERY A-Z`, `CYFRY 0-9`, `ZNAKI SPECJALNE !@#$%^&*()_+`, `BIAŁE ZNAKI NP. SPACJA`, `ZNAKI NARODOWE ĘĆŹĄŚ`. Przeciąganie do ramki, z ramki z powrotem do zasobnika, klik przełącza. ZADANIE: „SKONFIGURUJ GENERATOR HASŁA W MENEDŻERZE HASEŁ.” `ConfirmButton` „ZAPISZ W BAZIE I KONTYNUUJ” (aktywny przy ≥ 1 kafelku w ramce). |
| wynik | Dopiero po zatwierdzeniu: „SIŁA HASŁA: x/5” z komunikatem (P3); ok. 2,5 s, potem loader. Przy `critical` zamiast wyniku od razu ekran wykrycia silnika. |
| loader | „ŁADOWANIE KOMPONENTÓW KOMUNIKATU…” |
| 2 `note` (D3) | „KROK 1: PRZECIĄGNIJ INFORMACJE I KOMPONENTY NA GŁÓWNYM EKRANIE”. Makieta okna z 6 slotami `[IKONA]`, `[TYTUŁ WIADOMOŚCI]`, `[CZAS]`, `[KWOTA]`, `[ADRES]`, `[KONTAKT]`. Zasobnik 8 kafelków (tasowane): ikona (kłódka na niebieskim tle), `KWOTA: $ 200 000` z symbolem Bitcoina, `ADRES: XKAJ1023KJDf93`, avatar + `NAPISZ DO NAS`, tytuły `TWOJE PLIKI ZOSTAŁY ZASZYFROWANE!` i `CZEKAM NA BITCOINY!`, czasy `POZOSTAŁY CZAS: 00:30:00:00` i `POZOSTAŁY CZAS: 00:00:30:00`. Kafelek wchodzi tylko do slotu swojego typu (zły slot: odbicie, bez kary). `ConfirmButton` „ZATWIERDŹ KOMUNIKAT” aktywny, gdy wszystkie 6 slotów pełne. |
| loader | „PRZYGOTOWANIE PALETY KOLORÓW…” |
| 3 `color` (D4) | „KROK 2: WYBIERZ KOLOR OKNA I ELEMENTÓW”. 3 karty-kwadraty: `ZIELONY`, `CZERWONY`, `BIAŁY / SZARY` (tasowane), z podglądem okna z kroku 2 w wybranym kolorze. `ConfirmButton`. |
| loader / koniec | „KOMPILACJA WIRUSA…”, potem „WIRUS GOTOWY! AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY” (ok. 1,5 s) → `onComplete`. Zapis `customState.m4_note = { titleId, timeId, colorId }` dla aplikacji szefa IT (P16). |

Poziomy (D3, jedna pozycja raportu): poziom = gorszy z dwóch slotów zmiennych; `answer` = złożone `reportAnswer` kafelków („OSTRZEŻENIE + LIMIT 30 H” dla ideal). `onDecision`: D2 przy „ZAPISZ W BAZIE I KONTYNUUJ”, D3 przy „ZATWIERDŹ KOMUNIKAT”, D4 przy zatwierdzeniu koloru. `onComplete` po komunikacie „WIRUS GOTOWY!”.

Siła hasła (decyzja P3), liczona przez `ransomLogic.ts`:

| Warunek (zestawy = z 4 dozwolonych) | Siła | Poziom |
|---|---|---|
| kafelek BIAŁE ZNAKI lub ZNAKI NARODOWE w ramce | 1/5 | critical |
| długość 8 (domyślna) | 2/5 | critical |
| długość 24 i 4 zestawy | 5/5 | ideal |
| długość 19–23 i 4 zestawy, albo długość 24 i 3 zestawy | 4/5 | suboptimal |
| pozostałe (długość 9–18; albo ≤ 2 zestawy) | 3/5 | suboptimal |

### 3.3 `er_phishing_mail` (`PhishingMailApp.tsx`), etap 3, D5–D6

Pliki: `PhishingMailApp.tsx`, `mailLogic.ts` (stan przeciągnięcia, kompletność), korzysta z `usePointerDrag`.

| Ekran | Treść / zadanie |
|---|---|
| 1 `subject` (D5) | Okno nowego maila: pasek adresata (`rekrutacja@energyrock.com`, STANOWISKO: ANALITYK RYNKÓW ENERGETYCZNYCH), pole `TEMAT:` i 3 kafelki w zasobniku (tasowane): `CV MICHAŁ WILK`, `WILK CV`, `ANALITYK MICHAŁ WILK`. Przeciągnięcie do pola (lub klik). `ConfirmButton`. |
| loader | „ŁADOWANIE TREŚCI WIADOMOŚCI…” |
| 2 `body` (D6) | Pole `TREŚĆ:` i 3 pełne treści (tasowane, WERSALIKAMI, 1:1 z dokumentu, bez „WARIANT”). Przeciągnięcie/klik, `ConfirmButton`. |
| loader | „DODAWANIE ZAŁĄCZNIKA…” |
| 3 `arm` (flavor) | W oknie maila `CV_WILK.PDF` oraz element `//WIRUS: RANSOMWARE` obok. ZADANIE: „PRZECIĄGNIJ //WIRUS: RANSOMWARE NA ZAŁĄCZNIK CV_WILK.PDF.” Po upuszczeniu pasek „UZBRAJANIE ZAŁĄCZNIKA…” (ok. 2 s), potem status „ZAŁĄCZNIK ZAINFEKOWANY” i przycisk `WŁĄCZ VPN` → `onComplete`. |

`onDecision`: D5 i D6 przy zatwierdzeniu na swoim ekranie; poziomy: D5 `CV MICHAŁ WILK` ideal, `WILK CV` suboptimal, `ANALITYK MICHAŁ WILK` critical; D6 formalna z hasłem ideal, „HEJ…” suboptimal, „CZEŚĆ… USŁUG ENERGETYCZNYCH” critical. `reportAnswer` D6 ideal: „TREŚĆ Z HASŁEM WILK NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH”. Zapis `customState.m4_mail = { subjectId, bodyId }` dla podsumowania przed wysyłką (VPN). Zero-clicker: ekrany 1–2 wymagają czytania opcji (nazwisko, imię, „CV”, nazwa stanowiska), ekran 3 przeciągnięcia.

### 3.4 `vpn_router` (klocek katalogu), etap 4, D7

Bez nowej minigry: `VpnRouter` z configiem zagnieżdżonym (`vpn` bez `decisionNum`, `sender.decisionNum: 7`). Zmiany silnika w sekcji 4 (E2).

| Ekran | Treść / zadanie |
|---|---|
| 1 `ip` | `POŻĄDANY ADRES IP: 109.43.200.124`, `AKTUALNY ADRES IP: 106.55.202.120`, pionowe oktety z klawiaturą i wklejaniem; przycisk asysty w prawym górnym rogu (dziś „ASYSTA AI”, dokument „DOPASUJ W AI”: zostaje etykieta silnika, P2). Komunikat `POMYŚLNIE DOPASOWANO IP`. Zły adres: komunikat błędu i brak przejścia, bez kary (IP bramką, nie oceną). |
| 2 `sender` | „WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:” 3 karty (tasowane): `M.WILK@PRIV.COM`, `ALEX@PRIV.COM`, `NEWRAWGOODS@COMMERCIAL.BIZ`. Przycisk zatwierdzenia „WYŚLIJ MAILA”. |
| loader | „TRANSMISJA PRZEZ TUNEL VPN — WYSYŁKA…” (istniejący `sendLoaderLabel`); potem `onComplete` (przeskok czasu gra mostek, nie klocek). |

D7: poziom = poziom nadawcy (ideal/suboptimal/critical wg dokumentu); `answer` = `109.43.200.124 + M.WILK@PRIV.COM` (adres IP dopisany do odpowiedzi, sekcja 4 E2).

### 3.5 `er_ransom_c2` (`RansomC2App.tsx`), etap 5, D8

Pliki: `RansomC2App.tsx`, `EncryptNetwork.tsx`, `ExfilFiles.tsx`, `exfilLogic.ts`; korzysta z `usePointerDrag`.

| Ekran | Treść / zadanie |
|---|---|
| 1 `start` | `CV ZOSTAŁO OTWARTE – MALWARE ZOSTAŁ AKTYWOWANY`, `NAZWA KOMPUTERA: ENERGY_ROCK_01_PC`, `AKTYWOWANE NA IP: 151.89.159.52`. Jeden duży przycisk `SZYFRUJ ZASOBY FIRMY`. |
| loader | „SKANOWANIE SIECI…” |
| 2 `encrypt` | Topologia: centralny wektor (pendrive), 2 stacje robocze, 4 serwery baz danych, 1 serwer główny (8 węzłów, SVG). ZADANIE: „KLIKAJ ZIELONE WĘZŁY, ŻEBY JE ZASZYFROWAĆ.” Kliknięty węzeł zmienia kolor na fioletowy i dostaje kłódkę. Po ostatnim komunikat `ZASOBY FIRMY ENERGY ROCK ZOSTAŁY POMYŚLNIE ZASZYFROWANE. UZYSKANO DOSTĘP DO SERWERÓW` i przycisk `POBIERZ PLIKI`. |
| 3 `exfil` (D8) | Puste pole `POBRANE PLIKI:` i chmura 12 plików (tasowane, ikona rozszerzenia, bez rozmiarów i oznaczeń): `WYPOWIEDZENIE.PDF`, `MAREK.JPG`, `FVOLT_TECH.DOCX`, `KONTRAKTY.XCF`, `TECHNOLOGIA_OPIS.PDF`, `FREEVOLT_SCHEMAT.PDF`, `TECHNOLOGIA_SCHEMATY.PDF`, `MATERIALY.TXT`, `WAZNE_DANE.DOCX`, `SEKRET.TXT`, `UMOWA2022.PDF`, `ENERGIA_FVOLT.XCF`. Przeciąganie do pola (klik przełącza), plik z pola wraca do chmury. ZADANIE: „PRZECIĄGNIJ DO POLA PLIKI, PO KTÓRE PRZYSZEDŁEŚ.” `ConfirmButton` „POBIERZ ZAZNACZONE” (aktywny przy ≥ 1 pliku). |
| loader | „POBIERANIE PLIKÓW…” (pasek z licznikiem MB z liczby plików) → `onComplete`. |

Reguły D8 (P5): 3 cele = `FVOLT_TECH.DOCX`, `FREEVOLT_SCHEMAT.PDF`, `ENERGIA_FVOLT.XCF`. Niech `t` = liczba wybranych celów, `f` = liczba pozostałych.

| Wybór | Poziom |
|---|---|
| t = 3 i f = 0 | ideal |
| t ≥ 1 i (t < 3 lub f ≥ 1) | suboptimal |
| t = 0 (wyłącznie pliki fałszywe) | critical |

`onDecision` przy „POBIERZ ZAZNACZONE” (critical od razu bez loadera). `answer` ideal: „3 PLIKI FREEVOLT (DOCX, PDF, XCF)”; w pozostałych przypadkach lista nazw (maks. 3 + „…”). Dokument nie ma pułapek „honeypot”, więc `type: honeypot` znika (zostają `target` i `other`).

### 3.6 `er_victim_chat` (`VictimChatApp.tsx`), etap 6, D9–D10

Opakowanie `DialogueTree` w trybie per-węzeł (P6): dwuwęzłowa decyzja + trzeci węzeł narracyjny. Układ: rozmowa po lewej, po prawej wąska miniatura okna żądania okupu złożonego przez gracza w D3/D4 (`customState.m4_note`; P16); brak `m4_note` (dev) → domyślna czerwona miniatura. Prawy monitor czat, bez zmian.

| Węzeł | SZEF IT | Odpowiedzi gracza | Decyzja |
|---|---|---|---|
| `neg_1` | „ROZWIĄZUJEMY PROBLEM RANSOMWARE I ODPOWIEDNIE SŁUŻBY ZOSTAŁY JUŻ POWIADOMIONE” | `ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW. ZASTANÓW SIĘ DOBRZE, CO CHCESZ ZROBIĆ` ideal; `NIE BOJĘ SIĘ POLICJI` suboptimal; `OKEJ, JUŻ WAM NIE PRZESZKADZAM.` critical | D9 |
| `neg_2` | „CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?” | `TAK, JAK NAPISAŁEM W WIADOMOŚCI - INTERESUJĄ MNIE TYLKO BITCOINY` ideal; `NICZEGO NIE ODSZYFRUJĘ, ROBIĘ TO DLA ZABAWY :D` suboptimal; `CHCĘ DOSTĘPU DO PLIKÓW FREEVOLT` critical | D10 |
| `neg_3` | „POTRZEBUJEMY CZASU NA ICH ZDOBYCIE” | jedyna opcja `MACIE 3 H. POTEM NIE DOSTANIECIE JUŻ KLUCZA DO ODSZYFROWANIA` | bez oceny |

`onDecision` zgłasza silnik klocka przy kliknięciu odpowiedzi na `neg_1` (D9) i `neg_2` (D10); `critical` przerywa rozmowę. `onComplete` po wyborze jedynej opcji w `neg_3` (bez `closingMessage`, O12). Pytania do raportu: D9 „JAK ODPOWIESZ SZEFOWI IT NA INFORMACJĘ O SŁUŻBACH?”, D10 „CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH?” (pytanie szefa IT, identyczne z ekranem).

## 4. Zmiany w silniku

Zasada: tylko wspólne mechanizmy, żadnych gałęzi po identyfikatorze misji (`AGENTS.md` pkt 1). Minimalnie dwie zmiany obowiązkowe, dwie opcjonalne.

| # | Zmiana | Pliki | Uzasadnienie |
|---|---|---|---|
| E1 (obowiązkowa) | **`ScratchMatrix` + `matrixLogic` do silnika** (reguła dwóch: M3 i M4). Klocek `ScratchMatrix` w `src/engine/blocks/`, logika `src/engine/core/matrixLogic.ts`, typy `ScratchMatrixConfig`/`MatrixVariant` w `types/mission.ts`. Zamiast `ImageSlot` komponent dostaje prop `renderImage(variant)`, więc silnik nie zna mechanizmu assetów misji. M3 importuje z silnika (jego pliki stają się cienkimi re-eksportami), logika i zachowanie bez zmian. | `src/engine/blocks/ScratchMatrix.tsx`, `src/engine/blocks/index.ts`, `src/engine/core/matrixLogic.ts`, `src/engine/types/mission.ts`, M3: `minigames/ScratchMatrix.tsx` i `matrixLogic.ts` (re-eksport), `VirusLabApp.tsx` (podanie `renderImage`), testy `tests/m3-viruslab.test.ts` (ścieżka importu), nowy `tests/matrixLogic.test.ts` | Scena S02 w M4 to ta sama mechanika. |
| E2 (obowiązkowa) | **`VpnRouter`**: (a) przeskok czasu tylko gdy `config.timeJump` podane (dziś w wariancie z nadawcą zawsze), bo M4 gra go w mostku z `clockFrom`/`clock`; (b) opcjonalne `sender.confirmLabel` (przycisk „WYŚLIJ MAILA”) i `sender.includeIpInAnswer` (odpowiedź = `IP + nadawca`); (c) potwierdzić testem, że wariant `vpn` bez `decisionNum` + `sender.decisionNum` działa jako bramka IP + jedna decyzja (kontrakt 10.1 pkt 5). | `src/engine/blocks/VpnRouter.tsx`, `tests/blocks.test.ts` | D7 = jedna decyzja; przeskok z godzinami należy do mostka (standard). M2 nie używa kroku nadawcy, więc bez zmian. |
| E3 (opcjonalna) | **`report.ts` i stałe loaderów do silnika** (reguła dwóch: M3 i M4): `buildReport`, `reportAnswerOf`, typ `ReportableOption` w `src/engine/core/report.ts`, `LOADER_MS`/`LOADER_LONG_MS` przy `ModuleLoader`. M3 re-eksportuje. `ImageSlot` i `siteAssets.ts` zostają kopią w M4 (glob `import.meta.glob` jest per misja: wspólny glob zepsułby izolację paczek). | `src/engine/core/report.ts`, `ModuleLoader.tsx`, M3: `report.ts`, `ui.tsx` | Bez E3 M4 kopiuje te dwa pliki (trzecia kopia). Domyślnie robimy E3 w porcji A, bo kosztuje kilkanaście linii (O14). |
| E4 (opcjonalna) | **`DebriefApp`**: etykieta „SZEF IT:” w widoku transkryptu (`DebriefApp.tsx:294`) to jedyny zaszyty tekst M4 w silniku (`Desktop.tsx` jest już czysty: baner pochodzi z `incomingCall`). Zamiana na neutralne „ROZMÓWCA:”. | `src/engine/apps/DebriefApp.tsx` | Tylko M4 ma `negotiationTranscript`, więc zmiana jest bezpieczna. |

Bez zmian silnika: `DialogueTree` ma tryb per-węzeł (`DialogueNode.decisionNum`), czyli D9 i D10 mieszczą się w jednym klocku (sprawdzone w `src/engine/blocks/DialogueTree.tsx`); `TimeJump` z `clockFrom`/`clock`; `incomingCall`; `usePointerDrag`; `openingConversation` nie jest potrzebne (M4 nie ma kwestii „w minigrze”).

Wspólny klocek ekranu maila dla M1/M2/M4 (pkt 10): **później**. Trzy wersje mają różny przepływ (M1 kreator i wysyłka, M2 kampania 5 ekranów z importem, M4 kafelki + uzbrojenie przeciąganiem). Warto wydzielić dopiero po audycie M4 sam prezentacyjny „podgląd okna maila” (pasek adresata, temat, treść, załącznik), nie przepływ.

## 5. Dane

### `stages.ts`
- Usunąć: `builderConfig` w obecnej postaci (3 podkonfiguracje), `mailConfig.body[].label` „WARIANT A/B/C”, `virusConfig.scannerCells`, `GradedOption.tags`, `exfiltrationConfig` z typami `honeypot`/`decoy` i `feedback.criticalHoneypot`, `negotiationBlock` w trybie agregującym (`decisionNum` na poziomie klocka, `closingMessage`, opcje `give_days`), dopisane zdania w mostkach.
- Zmienić: `decisions` etapów na `[1]`, `[2,3,4]`, `[5,6]`, `[7]`, `[8]`, `[9,10]`; poziomy i teksty opcji wg dokumentu (sekcja 3); pytania = pytania z raportu (sekcja 6 w tym planie, bez końcowych dwukropków); mostki wg sekcji 2 (z `clockFrom`/`clock`, `incomingCall`); adresy IP i nadawców 1:1 (WERSALIKI, `NEWRAWGOODS`); `vpnConfig` zagnieżdżony (`vpn` bez `decisionNum`, `sender.decisionNum: 7`, `timeJump` pominięte); `negotiationBlock` per-węzeł.
- Dodać: `virusLabConfig` (D1 + `matrix` z `revealThreshold`, `segments`, `variants` dla `ransomware` i `rat`); `builderConfig` z `password` (progi, 6 kafelków z `forbidden: boolean`), `note` (6 slotów, 8 kafelków z `slot` i `tier`, `staticParts`), `color`; `mailConfig` z `recipient`, `position`, `attachment`, `payloadLabel`, 3+3 opcji; `c2Config` (`host`, `ip`, `network` 8 węzłów, `files` 12 z `role: target|other`, teksty ekranów); `victimChatConfig`; klucz `blocks`: `virus_database`, `ransomware_builder`, `mail`, `vpn_app`, `victim_workstation`, `negotiation`.

### `minigames/types.ts`
Typy zgodne z `stages.ts`: `ReportableOption extends GradedOption { reportAnswer? }`, `VirusLabConfig`, `BuilderConfig` (`PasswordConfig`, `NoteConfig`, `ColorConfig`), `MailConfig`, `C2Config`, `ExfilFile { id, name, role: 'target' | 'other' }`, `VictimChatConfig`, `AssetRef`; klucze `customState`: `M4_NOTE_KEY = 'm4_note'`, `M4_MAIL_KEY = 'm4_mail'`. Usunąć: `ExfiltrationFile.type honeypot`, `RansomComponentsConfig.titleOptions/countdownOptions` w starej postaci.

### `data/mission4.json`
- `mission`: `decisionCount: 10` (bez zmian), `passingScore: 80`, `accentColor: "#FF0033"` (P13), `title` „MISJA 4 – ENERGY ROCK” bez zmian.
- `intro.dialogue`: 1:1 z dokumentu, WERSALIKAMI, bez kropek końcowych; piąta para BM „BĘDĄ Z CIEBIE LUDZIE” → GRACZ „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA”; `intro.firstChoice` usunąć; w node_4 „IRH”/„ICH” wg P14.
- `desktopApps` (kolejność z dokumentu): `//KOMUNIKATOR: BYTE_MASTER` (czat), `//BAZA_WIRUSÓW` (`er_virus_lab`), `//KREATOR: RANSOMWARE` (`ransomware_builder`, `er_ransom_builder`; P11), `//MAIL`, `//VPN`, `//MODUŁ_RANSOMWARE` (`victim_workstation`, `er_ransom_c2`, kolor `#8A2BE2`), `//CZAT_Z_OFIARĄ` (`negotiation`, `er_victim_chat`), `//RAPORT POOPERACYJNY`. `index.ts`: `CATALOG_COMPONENT` zostaje tylko dla `vpn_app: 'vpn_router'` (`negotiation` przechodzi na `er_victim_chat`).
- `step6.summary`: `title: "ZHAKOWANO ENERGY ROCK"`, `subtitle: "UKOŃCZONO ZADANIE 4"`, `perfectChoices: 10`, `goodChoices: 0`, `criticalErrors: 0`, `btcReward: 3.79`.
- `step6.choices` (P1, P9): 10 pozycji, każda `correct: true`, `details`, `attack`, `defense`:

| num | question | answer (ścieżka 100%) |
|---|---|---|
| 1 | WYBIERZ ODPOWIEDNIEGO WIRUSA | RANSOMWARE |
| 2 | SIŁA WYGENEROWANEGO HASŁA (SKALA DO 5) | 5 (DŁUGOŚĆ 24, 4 ZESTAWY ZNAKÓW) |
| 3 | KOMPONENTY WIADOMOŚCI | OSTRZEŻENIE + LIMIT 30 H |
| 4 | WYBIERZ KOLOR OKNA / ELEMENTÓW | CZERWONY |
| 5 | WYBIERZ TEMAT MAILA | CV MICHAŁ WILK |
| 6 | WYBIERZ TREŚĆ MAILA | TREŚĆ Z HASŁEM WILK NA STANOWISKO ANALITYKA RYNKÓW ENERGETYCZNYCH |
| 7 | ZABEZPIECZENIE TOŻSAMOŚCI (VPN / NADAWCA) | 109.43.200.124 + M.WILK@PRIV.COM |
| 8 | EKSFILTRACJA PLIKÓW | 3 PLIKI FREEVOLT (DOCX, PDF, XCF) |
| 9 | JAK ODPOWIESZ SZEFOWI IT NA INFORMACJĘ O SŁUŻBACH? | ODPOWIEDNIE SŁUŻBY NIE ODSZYFRUJĄ WASZYCH PLIKÓW… |
| 10 | CZEGO CHCESZ W ZAMIAN ZA ODSZYFROWANIE DANYCH? | INTERESUJĄ MNIE TYLKO BITCOINY (OKUP WYŁUDZONY: TAK) |

Wiersz 9 dokumentu („CZY UDAŁO SIĘ WYŁUDZIĆ OKUP? TAK”) jest wynikiem, nie decyzją: trafia jako pierwsze zdanie `details` pozycji 10 i jako tytuł transkryptu (`negotiationTranscript` zostaje przy pozycji 10, 3 tury).
- Lekcje (atak/obrona, styl M1/M2): D1 ransomware vs RAT/keylogger, obrona: backup i aktualizacje (slajd 1, 2); D2 menedżer haseł, długie hasła (slajd 3); D3/D4 presja czasu i alarmowy kolor w komunikatach okupu, obrona: nie płacić, zgłosić do IT/CSIRT; D5/D6 spear-phishing na rekrutację (pracownik HR: temat, hasło do pliku omija skanery, nie otwierać załączników z hasłem bez weryfikacji); D7 nadawca spójny z podpisem, obrona: weryfikacja nadawcy, SPF/DKIM; D8 eksfiltracja przy szyfrowaniu (double extortion), obrona: segmentacja i monitorowanie transferu; D9/D10 negocjacje, obrona: procedura reagowania, nie negocjować samemu. Slajdy 4 i 5 („PODSUMOWUJĄC…”, „CHCESZ UNIKNĄĆ HAKOWANIA?”) nie mają miejsca w grze: trafiają do `docs/moodle-baza-wiedzy.md` (porcja H).
- `educationalSlides`: usunąć.

### `tests/mission4.test.ts`
Przepisać pod nową strukturę (stałe z dokumentu wpisane w teście):
- meta: `decisionCount` 10, `passingScore` 80, `step6.choices.length` 10, brak `educationalSlides`; `summary.title` „ZHAKOWANO ENERGY ROCK”.
- etapy: kolejność `virus_database → ransomware_builder → mail → vpn_app → victim_workstation → negotiation`; `decisions` `[1],[2,3,4],[5,6],[7],[8],[9,10]`; każdy `appId` w `desktopApps`; każda decyzja 1..10 w jednym etapie i w `step6.choices`; pytanie D1–D10 = pytanie z bloku.
- poziomy opcji wg dokumentu (w tym: Ransomware ideal / RAT suboptimal / Keylogger critical; `WILK CV` suboptimal, `ANALITYK MICHAŁ WILK` critical; D6 „CZEŚĆ… USŁUG” critical; sender trzy poziomy; D9/D10 trzy poziomy).
- intro 1:1 (bez `firstChoice`, `//BAZA_WIRUSÓW` odblokowana po BIOS); mostki: zawartość i kolejność beatów, `time_jump` z `clockFrom`/`clock` (`16:40`→`09:10`, `09:10`→`11:35`), `incomingCall.label` obu banerów, kafelki odblokowują się dopiero po kwestii gracza (i po przeskoku), brak kwestii „WEJDŹ NA STACJĘ OFIARY”, czterobeatowy mostek 6, brak dopisanego zdania o haśle w mostku 2.
- negocjacje: 3 węzły, `decisionNum` 9 i 10 na węzłach 1 i 2, węzeł 3 bez opcji ocenianej, brak `closingMessage`.
- przepływ przez silnik: 10 idealnych = 100% i 3,79 BTC; każda decyzja `critical` otwiera ekran wykrycia (D1 keylogger, D2 długość 8 / zakazany kafelek, D3 czas 30 s, D5 `ANALITYK MICHAŁ WILK`, D6 „USŁUG”, D7 `NEWRAWGOODS`, D8 same fałszywe, D9 kapitulacja, D10 `CHCĘ DOSTĘPU…`); przykładowe `suboptimal` obniżają wynik bez wykrycia (D4 zielony, D3 „CZEKAM NA BITCOINY!”, D8 1 cel).
- logika minigier w osobnych plikach (porcje nie kolidują): `tests/m4-viruslab.test.ts`, `tests/m4-builder.test.ts` (siła hasła, poziom D3, kompletność slotów), `tests/m4-mail.test.ts`, `tests/m4-c2.test.ts` (reguły D8), `tests/m4-negotiation.test.ts`; w silniku `tests/matrixLogic.test.ts`, rozszerzenie `tests/blocks.test.ts` (VpnRouter wariant D7, `DialogueTree` per-węzeł D9+D10).

### `scenario.md`
Utworzyć wg `docs/scenario-format.md` z dokumentu i niniejszego planu (źródło prawdy kodu), z listą odchyleń z sekcji 7 (dziś go nie ma). Dodać `docs/moodle-baza-wiedzy.md` (5 slajdów dokumentu).

## 6. Porcje pracy dla agentów

Każdy agent: osobny commit po zakończeniu, `npx vitest run` i `npx tsc -p tsconfig.app.json --noEmit` zielone (kod wyjścia). Porcje **‖** mają rozłączne pliki i idą równolegle w obrębie swojego kroku. Wspólne pliki (`stages.ts`, `types.ts`, `mission4.json`, `index.ts`, testy struktury) należą **tylko** do B; potrzebną zmianę zgłaszać koordynatorowi.

| Krok | Porcja | Pliki (własne) | Zależności / uwagi |
|---|---|---|---|
| 1 | **A. Silnik** | E1, E2 (opcjonalnie E3, E4): `src/engine/blocks/ScratchMatrix.tsx`, `blocks/index.ts`, `blocks/VpnRouter.tsx`, `core/matrixLogic.ts`, `core/report.ts` (E3), `types/mission.ts`, `components/ModuleLoader.tsx` (E3), `apps/DebriefApp.tsx` (E4); M3: `minigames/ScratchMatrix.tsx`, `matrixLogic.ts`, `VirusLabApp.tsx`, `report.ts`, `ui.tsx`; `tests/matrixLogic.test.ts`, `tests/blocks.test.ts`, `tests/m3-viruslab.test.ts`; `docs/scenario-engine.md` (sekcja 6: katalog) | Pierwsza. M2, M3 i testy M3 muszą zostać zielone. Bez zmian w `scenarios/mission_04_*`. |
| 2 | **B. Dane i struktura** | `stages.ts`, `minigames/types.ts`, `minigames/ui.tsx` (`ImageSlot`, loadery lub import z silnika po E3), `minigames/siteAssets.ts`, `minigames/report.ts` (jeśli bez E3), `minigames/stub.tsx` + 5 zaślepek (`er_virus_lab`, `er_ransom_builder`, `er_phishing_mail`, `er_ransom_c2`, `er_victim_chat`), `minigames/index.ts`, `assets/virus/.gitkeep`, `data/mission4.json`, `index.ts`, `tests/mission4.test.ts`; usunięcie starych 5 minigier | Po A. Zaślepki mają te same nazwy eksportów, `AppHeader` + przycisk wołający `onComplete`/`onDecision` z danych, żeby `tsc` i testy przepływu przechodziły przed C–G. |
| 3 ‖ | **C. //BAZA_WIRUSÓW** | `minigames/VirusLabApp.tsx`, `tests/m4-viruslab.test.ts` | Po B. Używa `ScratchMatrix` z silnika. |
| 3 ‖ | **D. //KREATOR: RANSOMWARE** | `minigames/RansomBuilderApp.tsx`, `PasswordStep.tsx`, `NoteStep.tsx`, `ColorStep.tsx`, `ransomLogic.ts`, `tests/m4-builder.test.ts` | Po B. `usePointerDrag`. Zapis `m4_note`. |
| 3 ‖ | **E. //MAIL** | `minigames/PhishingMailApp.tsx`, `mailLogic.ts`, `tests/m4-mail.test.ts` | Po B. `usePointerDrag`. Zapis `m4_mail`. |
| 3 ‖ | **F. //MODUŁ_RANSOMWARE** | `minigames/RansomC2App.tsx`, `EncryptNetwork.tsx`, `ExfilFiles.tsx`, `exfilLogic.ts`, `tests/m4-c2.test.ts` | Po B. `usePointerDrag`. |
| 3 ‖ | **G. //CZAT_Z_OFIARĄ** | `minigames/VictimChatApp.tsx`, `tests/m4-negotiation.test.ts` | Po B. Opakowuje `DialogueTree`; czyta `m4_note` (fallback). |
| 4 | **H. Dokumentacja** | `scenario.md`, `docs/moodle-baza-wiedzy.md`, usunięcie `stub.tsx`, dopisek w `docs/audit-missions-2-4.md` (status M4) | Po C–G (odchylenia na podstawie faktycznej implementacji). |
| 5 | **I. Weryfikacja** | brak własnych plików; poprawki do właścicieli porcji | Przeglądarka (`?mission=4&dev=1`): każdy ekran przy 1366×768 i 1920×1080 bez przewijania, konsola czysta w nowej karcie po świeżym załadowaniu, `node scripts/package-scorm.js --mission=4` (ZIP tylko z M4). |
| 6 | **J. Niezależna recenzja** | brak | Agent, który nie pisał kodu, przeciw `mission-standard.md` i dokumentowi VR; potem poprawki. |

Kolejność wymuszona: A → B → (C ‖ D ‖ E ‖ F ‖ G) → H → I → J. Grafiki (`virus/ransomware`, `virus/rat`, `virus/keylogger`, opcjonalnie `virus/matrix_ransomware`) wrzuca właściciel; do tego czasu zastępniki z podpisem `GRAFIKA: <opis>` w devie.

## 7. Odchylenia od dokumentu i pytania do właściciela

### Odchylenia (do `scenario.md`)

| # | Odchylenie | Powód |
|---|---|---|
| O1 | Czat to rozmowa, nie launcher: w mostku 2 zdanie „WŁĄCZ APLIKACJĘ MAILA” zostaje 1:1, ale nie ma klikalnego linku; kafelek odblokowuje się po kwestii gracza i świeci. | Konwencja silnika. |
| O2 | Intro: ostatnia kwestia gracza „DOBRA. ZABIERAM SIĘ ZA TWORZENIE WIRUSA” jest kwestią intro (przed BIOS), `firstChoice` usunięty. | Dokument kończy dialog tą kwestią (jak O12 w M3). |
| O3 | BM po S03 („GDYBY LUDZIE W RZECZYWISTOŚCI TWORZYLI TAK SILNE HASŁA…”) pominięte. | Chwali po wyniku i dla 3–4/5 byłoby nieprawdziwe; standard M2+ zabrania „DOBRY WYBÓR” (P12). |
| O4 | Kreator S03/S04 ma własny kafelek `//KREATOR: RANSOMWARE` (dokument: brak kafelka dla S03/S04, tylko `item_virus_payload` po S04). Kwestia „STWORZĘ TAKIE HASŁO…” (dokument: w S03) jest kwestią odblokowującą kreator. | Dwa etapy z mostkiem między nimi, jak w obecnym kodzie (P11). |
| O5 | S02: `Canvas` zdrapki z klocka silnika (próg 92% pola = 100% paska), bez osobnego „KONTYNUUJ”; ikona wirusa zależna od D1 (Ransomware: monitor w łańcuchach, RAT: grafika z M3). | Reguła dwóch (`ScratchMatrix`); po D1 `RAT` (suboptimal) gra idzie dalej, więc ekran nie może kłamać. |
| O6 | Brak kafelka `item_virus_payload`: ładunek `//WIRUS: RANSOMWARE` jest elementem w oknie maila, przeciąganym na `CV_WILK.PDF`. | Okno aplikacji zasłania pulpit, przeciąganie z pulpitu niemożliwe (O6 w M3, P8). |
| O7 | D2: wynik „SIŁA HASŁA x/5” po zatwierdzeniu, bez żywego wskaźnika; progi dla luk 9–11 i 19–23 dopisane (tabela w 3.2). Zasobnik bez oznaczeń „pułapka”. | Audyt: żywy wskaźnik zdradza ocenę; dokument podaje tylko 24, 12–18, 8 (P3). |
| O8 | D3: poziom = gorszy z dwóch slotów zmiennych (tytuł, czas); 4 sloty stałe nieoceniane, zły slot = odbicie bez kary. D4: zielony = suboptimal. | Dokument nie podaje agregacji i rozstrzygnięcia „suboptimal / critical” (P2, P4). |
| O9 | D7: IP jest bramką bez oceny (zły adres blokuje, nie karze), poziom decyzji = poziom nadawcy; przycisk asysty ma etykietę silnika („ASYSTA AI”, nie „DOPASUJ W AI”); `WYŚLIJ MAILA` jest przyciskiem zatwierdzenia nadawcy. | Dokument podaje poziomy tylko dla nadawcy; jedno zatwierdzenie na decyzję (P2). |
| O10 | D8: 12 plików z dokumentu bez rozmiarów i bez pułapek „honeypot”; reguły oceny z 3 cel/pozostałe (tabela w 3.5). Literówki dokumentu `UMOWA02022.PDF` → `UMOWA2022.PDF`, `NEWRAWGOODS` zostaje (P5, P14). | Dokument podaje reguły na przykładach. |
| O11 | Meldunek po S06 (GRACZ, BM) i komunikat `OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT` są w mostku po etapie, z przeskokiem czasu, a „URUCHOM CZAT Z OFIARĄ” to klik w baner `incomingCall`. | Rozmowa mostkująca następuje po zamknięciu aplikacji (jak O5 w M3), P7, P15. |
| O12 | D9 i D10 to osobne pozycje raportu (dokument: wiersz 9 „CZY UDAŁO SIĘ WYŁUDZIĆ OKUP?” zamiast D9 i D10). Wymiana 3 bez oceny; `closingMessage` usunięty; etykieta strefy wyboru w rozmowie to stałe „WYBIERZ ODPOWIEDŹ” (klocek `DialogueTree`). | Dokument ma 10 decyzji w metadanych i 9 wierszy w tabeli (P1, P6). |
| O13 | Raport: pytania D9 „JAK ODPOWIESZ SZEFOWI IT NA INFORMACJĘ O SŁUŻBACH?” wymyślone; `reportAnswer` opcji spoza ścieżki 100% wymyślone (D3 „TYTUŁ: CZEKAM NA BITCOINY! + LIMIT 30 H”, D2 „SIŁA x/5 (DŁUGOŚĆ N)”). | Tabela debriefu podaje tylko ścieżkę ideal. |
| O14 | `report.ts` i loadery do silnika (E3); `ImageSlot` i `siteAssets.ts` zostają kopią w M4. | Reguła dwóch; glob assetów jest per misja (izolacja paczek). |
| O15 | Przeskoki czasu: godziny 16:40 → 09:10 i 09:10 → 11:35 oraz podpisy pod zegarem dopisane. | Dokument: „czekanie” bez godzin (P7). |
| O16 | Pytania w raporcie bez końcowych dwukropków; opcje i nazwy plików WERSALIKAMI wg dokumentu (dawniej małe litery); adres w komunikacie okupu `XKAJ1023KJDf93` 1:1. | Wierność dokumentowi. |

### Pytania do właściciela (każde z propozycją domyślną)

| # | Pytanie | Propozycja domyślna |
|---|---|---|
| P1 | Dokument ma 10 decyzji, ale tabela raportu 9 wierszy (wiersz 9 „CZY UDAŁO SIĘ WYŁUDZIĆ OKUP?”). Jaki układ raportu? | 10 pozycji D1–D10 (silnik liczy z `playerChoices`, `decisionCount: 10`, 10 idealnych = 100%); wynik „OKUP WYŁUDZONY: TAK” jako początek `details` pozycji 10 i tytuł transkryptu. Alternatywa: 9 decyzji i zagregowane negocjacje (traci osobne poziomy D9 i D10). |
| P2 | D3 (dwa sloty), D7 (IP + nadawca): jak liczyć poziom? Gdzie przycisk asysty? | D3 = gorszy z dwóch slotów zmiennych (czas 30 s zawsze critical). D7 = poziom nadawcy; IP bramką bez kary (dokument nie ocenia IP). Asysta jako zwykły przycisk w prawym górnym rogu (już tak w `VpnRouter`), etykieta „ASYSTA AI”. Alternatywa: zły IP = critical jak dziś. |
| P3 | D2: progi dla wszystkich długości i moment pokazania „SIŁA HASŁA x/5”? | Tabela w 3.2: critical przy zakazanym kafelku albo długości 8; ideal 24 + 4 zestawy; 4/5 dla 19–23 + 4 zestawy lub 24 + 3 zestawy; reszta 3/5 (luki 9–11 i 19–23 wypełnione). Wynik tylko po zatwierdzeniu, bez żywego wskaźnika. |
| P4 | D4 zielony: suboptimal czy critical? | Suboptimal (zasada „critical oszczędnie”: zielone okno nie kończy operacji, werdykt w debriefie). |
| P5 | D8: reguły oceny na 12 plikach? | 3 cele; `t = 3` i `f = 0` ideal; `t ≥ 1` z nadmiarem lub niekompletne suboptimal; `t = 0` critical; bez pułapek „honeypot” (spoza dokumentu), `TECHNOLOGIA_*` to zmyłki jak w dokumencie. |
| P6 | Rozmowa z ofiarą: dwie decyzje w jednym `DialogueTree`? | Tak, bez zmian silnika: `DialogueTree` ma tryb per-węzeł (`DialogueNode.decisionNum`); `neg_1` = D9, `neg_2` = D10, `neg_3` bez oceny. Test w `tests/blocks.test.ts` potwierdza. |
| P7 | Czekanie w fabule i godziny? | Przeskoki w mostkach z lecącym zegarem: po wysłaniu maila 16:40 → 09:10; po komunikacie szefa IT 09:10 → 11:35; data stała 19.05.2026. |
| P8 | `//WIRUS: RANSOMWARE` na załącznik w oknie maila? | Tak, jak w M3 (O6): element w oknie maila, przeciąganie wskaźnikiem, klik jako alternatywa; brak osobnego kafelka. |
| P9 | Raport: `attack`/`defense`, slajdy, pytania? | Każda z 10 pozycji ma `attack` i `defense`; treść slajdów 1–3 do lekcji, slajdy 4–5 do `docs/moodle-baza-wiedzy.md`; pytania identyczne z ekranami (poza D9, O13). |
| P10 | Wspólny klocek ekranu maila (M1/M2/M4): teraz czy później? | Później (po audycie M4). Teraz tylko `ScratchMatrix` i `report.ts` jako klocki wspólne. |
| P11 | Gdzie mieszka S03/S04: osobny kafelek czy w //BAZA_WIRUSÓW? | Osobny kafelek `//KREATOR: RANSOMWARE` (dwa etapy z mostkiem, kwestia „STWORZĘ TAKIE HASŁO…” odblokowuje kreator). Alternatywa: jeden kafelek na S01–S04 (jeden długi etap, traci się mostek). |
| P12 | BM po S03 „GDYBY LUDZIE… TAK SILNE HASŁA”: pominąć czy zostawić? | Pominąć (chwali po wyniku, nieprawdziwe przy 3–4/5). Morał trafia do lekcji D2. |
| P13 | Kolor przewodni: czerwony `#FF0033` + fiolet C2 `#8A2BE2` (dokument) czy obecny fiolet `#a855f7`? | Akcent misji `#FF0033`, fiolet `#8A2BE2` tylko w elementach C2 (matryca, zaszyfrowane węzły, kafelek modułu). Uwaga: czerwień nie może mylić się z błędem, więc ekran wykrycia zostaje w własnej szacie. |
| P14 | Literówki dokumentu: „IRH FIRMIE”, `UMOWA02022.PDF`, `NEWRAWGOODS`, „ADRES: XKAJ1023KJDf93”? | Poprawić „IRH”→„ICH” i `UMOWA02022`→`UMOWA2022`; resztę zostawić 1:1 (`NEWRAWGOODS` to celowo podejrzana domena). |
| P15 | Etykieta banera po S06: „OFIARA WYŚWIETLIŁA WIADOMOŚĆ – PROŚBA O KONTAKT” (dokument) czy „SZEF IT ENERGY ROCK”? | Tekst z dokumentu, po sprawdzeniu czytelności banera „POŁĄCZENIE PRZYCHODZĄCE: …”; w razie potrzeby „SZEF IT ENERGY ROCK”. |
| P16 | Podgląd czerwonego okna okupu w aplikacji rozmowy (dokument) — robić? | Tak, wąska miniatura z wyborów gracza (D3 tytuł i czas, D4 kolor) obok rozmowy, w aplikacji misji opakowującej `DialogueTree`; bez zmian silnika. Pierwszy krok ku „konsekwencji odroczonej” z audytu. |
| P17 | Ikona matrycy: zależna od D1 (Ransomware / RAT) czy zawsze monitor w łańcuchach (dokument)? | Zależna od D1 (po RAT-cie suboptimal ekran nie może pokazywać ransomware), monitor w łańcuchach dla Ransomware. |

## 8. Kontrakt porcji A

Stan po porcji A (E1–E4 zrobione). Importy z `src/engine/` (ścieżki względem `src/scenarios/mission_04_energy_rock/minigames/`: `../../../engine/...`).

- **Zdrapka (C):** `import { ScratchMatrix } from '../../../engine/blocks/ScratchMatrix'` (też `engine/blocks/index.ts`; typ props `ScratchMatrixProps<TImage>`). Props: `config` (`ScratchMatrixConfig` bez `variants`), `variant: MatrixVariant<TImage>`, `accent: string`, `done: boolean` (pokazuje `doneMessage` zamiast `heading`), `onRevealed()` (raz, przy 100%), `renderImage(variant) => ReactNode` (misja rysuje grafikę, np. `<ImageSlot asset={v.image} label={v.imageAlt} fit="contain" />` albo SVG monitora w łańcuchach). Fragment ekranu: `AppHeader`, loader, komunikat ~1,5 s i `onComplete` robi minigra.
- **Typy (B):** z `engine/types/mission`: `ScratchMatrixConfig<TImage>` = `{ heading, revealThreshold, segments, variants: Record<id, MatrixVariant<TImage>>, doneMessage, hint, barColor?, maskColor? }`; `MatrixVariant<TImage>` = `{ programName, image: TImage, imageAlt, parts: MatrixPart[], barColor? }`; `MatrixPart` = `{ id, label, desc }`. `barColor` (wariant > config > akcent) = kolor zapalonych segmentów (fioletowy C2 `#8A2BE2`); po 100% pasek zielony. `maskColor` = siatka i „?” na masce (niebieski). Wzorzec rozszerzenia: M3 `VirusMatrixConfig extends ScratchMatrixConfig<AssetRef>` (+ `programPrefix`, `loaderText`, `task`).
- **Logika:** `engine/core/matrixLogic.ts` (`createGrid`, `revealStroke`, `matrixView`, …), testy w `tests/matrixLogic.test.ts`; M4 testuje tylko swoje dane.
- **Raport (B–G):** `import { buildReport, reportAnswerOf, type ReportableOption, type ReportableDecision } from '../../../engine/core/report'`. `buildReport({decisionNum, question}, option, overrides?)`; `answer` = `reportAnswer ?? label`; `overrides` nadpisuje `tier`/`feedback`/`answer`. `ReportableOption` = `ChoiceOption` + `reportAnswer?`. M4 nie tworzy własnego `report.ts`.
- **Loadery:** `import { LOADER_MS, LOADER_LONG_MS, ModuleLoader } from '../../../engine/components/ModuleLoader'` (1700 / 2000 ms). `ImageSlot` i `siteAssets.ts` M4 kopiuje z M3 (glob per misja).
- **VPN (B, D7):** `VpnRouterConfig` z `engine/blocks/VpnRouter`: `vpn: { initialIp, targetIp }` **bez** `decisionNum` (bramka: zły adres = komunikat `vpn.feedback.critical`, brak raportu i kary); `sender: { decisionNum: 7, question, options: VpnSenderOption[] (id, label, desc?, tier, feedback, reportAnswer?), confirmLabel: 'WYŚLIJ MAILA', includeIpInAnswer: true }` → jedna decyzja, `answer` = `109.43.200.124 + M.WILK@PRIV.COM`; `sendLoaderLabel`; **bez** `timeJump` (po loaderze od razu `onComplete`, przeskok gra mostek). Czyste funkcje do testów: `resolveVpnStep`, `vpnConnectResult`, `vpnSenderReport`, `vpnAfterSend`.
- **Debrief (B):** `NegotiationTurn.opponentLabel?` (podpis kwestii rozmówcy, domyślnie `ROZMÓWCA`); nagłówek transkryptu neutralny: `PRZEBIEG NEGOCJACJI (TURY: n)`. Dla „SZEF IT” wpisać `opponentLabel: "SZEF IT"` w turach `negotiationTranscript` w `mission4.json`.
- **Skutki dla starej M4 do czasu B:** `vpnConfig` M4 nie ma `timeJump`, więc po wysyłce nie ma już przeskoku w klocku (testy M4 zielone); transkrypt pokazuje „ROZMÓWCA:”.
