# Kanon fabuły (HACKERS.OS, misje 1-5)

Ten plik zbiera fakty fabularne, które muszą być spójne między misjami. Każda nowa misja (5-10) czyta go PRZED napisaniem `scenario.md` i po implementacji dopisuje do niego swoje fakty (wiersz w tabelach 2-6, sprzeczności w sekcji 7). QA sprawdza nową misję z tym plikiem: imiona, domeny, daty, godziny, saldo i nazwy aplikacji muszą zgadzać się z kanonem albo zmiana musi być zapisana jako decyzja właściciela.

Źródłem prawdy jest KOD i dane misji, nie `scenario.md` (M1 i M2 bywa nieaktualne; M4 nie ma `scenario.md`). Gdy kod i dokument się różnią, tu stoi wersja z kodu, a rozbieżność jest w sekcji 7. Stan z 27.11.2026.

Skróty ścieżek (wszystko w `RedBlueTeam/src/scenarios/`):
- `M1/` = `mission_01_petrolog/`, `M2/` = `mission_02_carbon_flow/`, `M3/` = `mission_03_ol_company/`, `M4/` = `mission_04_energy_rock/`, `M5/` = `mission_05_bank_bcorp/`.
- `M1/json` = `M1/data/mission1.json` (analogicznie `M2/json`, `M3/json`, `M4/json`, `M5/json`), `stages` = `stages.ts` w katalogu misji.
- `engine/` = `RedBlueTeam/src/engine/`. `doc` = specyfikacja VR w `docs/` misji (NIE źródło prawdy).
- „brak w kodzie” = fakt występuje tylko w dokumentach, kod go nie zna.

---

## 1. Gracz, mentor, system, grupa

| Fakt | Wartość | Źródło |
|---|---|---|
| System operacyjny | `//HACKERS.OS` (pole `systemOs` we wszystkich 5 misjach); ekran wyboru misji i nagłówek pulpitu pokazują to samo | `M1/json:6`, `M2/json:6`, `M3/json:6`, `M4/json:6`, `M5/json:6`; `engine/components/Desktop.tsx:155` |
| BIOS | „HACKERSBIOS 2.0 RELEASE 6.1”, „COPYRIGHT 1985-2022 HACKERS COLLECTIVE TECHNOLOGIES”, „WELCOME... HACKER” | `M1/json:80-95` (to samo M2/json:71-86, M3/json:60-77, M4/json:54-69, M5/json:64-81) |
| Grupa hakerska | `DARKSUN` (pisownia wielkimi literami, jedno słowo). „HACKERS COLLECTIVE” występuje tylko w tekście BIOS jako nazwa producenta, nie jako nazwa grupy | `M1/json:29` („DARKSUN TO NIE ZABAWA”) |
| Cel grupy (legenda) | Wykradanie informacji „najlepiej strzeżonych firm”, walka z „wielkimi koncernami energetycznymi”, które przejęły dokumentację Freevolt (w M5: uderzenie w paliwowych magnatów finansujących rafinerię) | `M1/json:29,35,47`; `M5/json:31,37` |
| Mentor | `BYTE_MASTER` (zawsze wielkimi, z podkreślnikiem). Odmiana: „BYTE_MASTERA”, „BYTE_MASTEREM”, „wspólnik BYTE_MASTER” | `engine/apps/ChatView.tsx:60,172,221`; `engine/components/Desktop.tsx:105,345` |
| Gracz, imię | Brak imienia. W czacie etykieta `TY (HAKER)`. Mentor mówi „HAKERZE” (M3), „SHERLOCKU” (M2), „HACKER” w BIOS | `engine/apps/ChatView.tsx:172`; `M3/json:37`; `M2/json:37` |
| Gracz, płeć | Męska: mentor „ZASŁUŻYŁEŚ”, gracz „SKOŃCZYŁEM ROZMOWĘ”. W pozostałych kwestiach gracza formy neutralne | `M1/stages:1067`; `M4/stages:748` |
| Status gracza | Kandydat do DARKSUN: M1 „ZANIM PRZYJMIEMY CIĘ W SWOJE SZEREGI, MUSISZ SIĘ WYKAZAĆ”; M2 „CORAZ BLIŻEJ PRZYJĘCIA”; M3 „CIERPLIWOŚCI. JESTEŚ NA DOBREJ DRODZE”; M4 „NIE TAK SZYBKO, MAM DLA CIEBIE JESZCZE WISIENKĘ NA TORCIE”; M5 „BĘDĄ Z CIEBIE LUDZIE”. Gracz nie został przyjęty po M5 | `M1/json:35`; `M2/stages:387`; `M3/json:43`; `M4/stages:755-758`; `M5/stages:684` |
| Ton mentora | WIELKIE LITERY, krótkie zdania, sucha ironia, zawsze o krok przed graczem. Stałe zwroty: „PAMIĘTAJ, JESTEM ZAWSZE DWA KROKI PRZED TOBĄ”, „SHERLOCKU?”, „BĘDĄ Z CIEBIE LUDZIE”, „KTO WIE?”, „WISIENKĘ NA TORCIE” | `M2/json:67,37`; `M4/json:49`; `M4/stages:709,758`; `M5/stages:684` |
| Odrzucenie wyboru | Mentor kończy zdaniem „WYBIERZ INACZEJ.” (standard B2) | np. `M2/stages:82`; `M4/stages:72`; `M5/stages:100,165,313,324`; `engine/components/MentorRejectNotice.tsx:50` |
| Formy gracza do grupy | „PRZYJMIECIE MNIE” (liczba mnoga do grupy) | `M3/json:38`; `M4/stages:707,755` |
| Motyw zarobku | M1 „PRZY OKAZJI MOŻESZ NA TYM NIEŹLE ZAROBIĆ”; M3 gracz pyta o „KILKA BITCOINÓW”, mentor: „OBY TYLKO PIENIĄDZE NIE PRZYSŁONIŁY CI GŁÓWNEJ IDEI” | `M1/json:53`; `M3/stages:879-883` |
| Freevolt | Technologia darmowej i nieskończonej energii; dokumentację przejęły koncerny. Cel M1–M4: zdobyć brakujące kawałki dokumentacji (M5 nie wspomina Freevolt — celem są raporty finansowe dot. rafinerii) | `M1/json:47`; `M2/json:31`; `M3/json:49`; `M4/json:31`; `M5/json:37,43` |
| Fikcja | Wszystkie firmy, osoby i domeny są fikcyjne (zasada projektu, brak w kodzie jako tekst gry) | brak w kodzie |
| Wyświetlana data/godzina | Pulpit pokazuje `systemDate` (z `mission.date`) i `systemTime` (puste, dopóki żaden przeskok czasu go nie ustawi) | `engine/components/Desktop.tsx:184`; `engine/store/useMissionStore.ts:69,309` |
| Zasady ocen | `ideal` / `suboptimal` / `critical`; `critical` = ekran „ZOSTAŁEŚ WYKRYTY!”. Próg zaliczenia w kodzie 70 we wszystkich misjach | `engine/components/Desktop.tsx:454`; `M1/json:11` (analogicznie M2/json:13, M3/json:15, M4/json:13, M5/json:13) |

---

## 2. Tabela misji

| Nr | id | Firma-cel | Branża / rola | Data fabularna | Zegar (przeskoki) | Nagroda BTC (max) | Kolor akcentu | Decyzji ocenianych | Technika ataku |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `mission-1-petrolog` | PetroLog (150 osób) | Logistyka; ma łańcuch dostaw i dokumentację Freevolt | 14.01.2025 | brak przeskoku, zegar pusty | 2,52 | `#00ff66` | 4 | OSINT, profilowanie, spear-phishing: strona dalekbieg.info + zawirusowany PDF + mail z domeny-sobowtóra petr0log.com |
| 2 | `mission-2-carbonflow` | CarbonFlow Inc. (12 adresatów na liście) | Operator systemu przesyłowego paliw, szef Robert Moris | 19.05.2026 | 09:40 -> 14:25 | 2,96 | `#00ff66` | 4 | Fałszywa ankieta (Poodle Forms), VPN pod białą listę IP, robak 0-day, botnet; nadawca z cardonflow.com |
| 3 | `mission-3-ol-company` | O&L Company | Spółka paliwowa, dystrybutor paliw | 19.05.2026 | 22:15 -> 06:02 -> 08:12 (lub 11:40) | 4,02 | `#00ff66` | 6 | Socjotechnika + trojan RAT; baiting: pendrive w kopercie zrzucony dronem pod samochód ofiary |
| 4 | `mission-4-energy-rock` | Energy Rock | Magazynowanie i zarządzanie zapasami paliw | 19.05.2026 | 16:40 -> 09:10 -> 11:35 (lub 16:40 -> 12:25 -> 14:50) | 3,79 | `#FF0033` | 10 | Ransomware w CV (spear-phishing rekrutacyjny), szyfrowanie sieci + eksfiltracja 3 plików Freevolt, szantaż jako przykrywka |
| 5 | `mission-5-bank-bcorp` | Bank Bcorp | Bankowość / cel: raporty finansowe dot. inwestycji rafinerii w pobliżu Doliny Baryczy | 19.05.2026 | brak przeskoku, zegar pusty | 3,14 | `#00ff66` | 10 | OSINT, VPN, combosquatting `archiwumbcorp.biz`, klonowanie logowania, Caller ID spoofing, vishing + AiTM z 2FA |

Źródła: nr 1 `M1/json:3-14`, `M1/stages:36`; nr 2 `M2/json:3-16`, `M2/json:37`, `M2/stages:25-42,370`; nr 3 `M3/json:3-15`, `M3/json:49`, `M3/stages:802,837-841`; nr 4 `M4/json:3-16`, `M4/json:31`, `M4/stages:711-712,731-732`; nr 5 `M5/json:3-16,37,43`, `M5/stages:31-559,607-718`.

Uwagi:
- Nagroda BTC w kodzie to wartość maksymalna; wypłata skaluje się liniowo wynikiem (`engine/core/scoring.ts:47-50`).
- Zegar: pierwszy przeskok ustawia `systemTime`; przed nim pulpit pokazuje samą datę (`engine/store/useMissionStore.ts:69,792`). Data się nie zmienia przy przejściu przez północ (M3, M4), zob. sprzeczność S2.
- M2: ankieta w mailu ma termin „dzisiaj o godzinie 16:00”, czyli przed 16:00 mieści się w przeskoku 09:40 -> 14:25 (`M2/stages:224`).
- M3: wariant spóźniony kończy się o 11:40, gdy któraś z decyzji D3/D4/D6 jest suboptymalna (`M3/stages:840-841`). M4: wariant spóźniony, gdy któraś z D5-D7 jest słabsza (`M4/stages:711-712`).
- M5: bez przeskoku zegara; mostek końcowy ma 3 rozłączne warianty (100% bez odrzuceń / `>= 70%` z usterkami / `< 70%`, `M5/stages:581-601,673-711`).
- Liczba kafelków/etapów: M1 6 etapów, M2 5, M3 5, M4 6, M5 6 (`mission1Stages`…`mission5Stages` w `stages.ts` każdej misji).
- Branża a opis mentora: PetroLog „firma logistyczna” (`M1/json:59`), CarbonFlow „operator systemu przesyłowego paliw” (`M2/json:37`), O&L „jedna z większych spółek paliwowych” (`M3/json:49`), Energy Rock „magazynowanie i zarządzanie zapasami paliwowymi” (`M4/json:31`), Bank Bcorp „WSZYSTKIE RAPORTY FINANSOWE ZNAJDUJĄ SIĘ W BANKU BCORP” (dot. budowy rafinerii w pobliżu Doliny Baryczy, `M5/json:37,43`).

### Kolejność fabularna i odwołania do poprzednich misji (w kodzie)

| Misja | Odwołanie | Źródło |
|---|---|---|
| M1 -> M2 | „Z DOKUMENTÓW, KTÓRE DLA NAS ZDOBYŁEŚ WYNIKA, ŻE JEDNĄ Z FIRM … JEST CARBONFLOW INC.” (nawiązanie do dokumentów z PetroLog; nazwa PetroLog nie pada) | `M2/json:31` |
| M2 -> M3 | Brak wprost. Tylko „KOLEJNE ZADANIE” i „PÓKI CO BARDZO NAM POMAGASZ W WALCE Z KONCERNAMI” | `M3/json:37,43` |
| M1 -> M4 | „Z DANYCH WYKRADZIONYCH Z PETROLOG WYNIKA, ŻE MOGĄ ZNAJDOWAĆ SIĘ W RĘKACH ENERGY ROCK” | `M4/json:31` |
| M4 -> dalej | „MAM DLA CIEBIE JESZCZE WISIENKĘ NA TORCIE. KILKA WISIENEK” (zapowiedź kolejnych misji) | `M4/stages:758` |
| M2 koniec | „ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ” | `M2/stages:387` |
| M3 koniec | „JESTEŚMY W KONTAKCIE!” | `M3/stages:886` |
| M4 -> M1..M3 | M4 nie wspomina CarbonFlow ani O&L | brak w kodzie |
| M5 | „MAM DLA CIEBIE KOLEJNE ZADANIE”, „UTRZEMY NOSA KILKU PALIWOWYM MAGNATOM”, inwestycja „BUDOWA RAFINERII W POBLIŻU DOLINY BARYCZY”; brak bezpośredniej wzmianki o Freevolt ani poprzednich firmach M1–M4 | `M5/json:25,31,37` |
| M5 koniec | „CZYSTA ROBOTA… Z TAKIMI RAPORTAMI W KOŃCU ZOBACZYMY, KTO FINANSUJE TĘ RAFINERIĘ. BĘDĄ Z CIEBIE LUDZIE.” (wariant idealny) | `M5/stages:684` |
| Plotka w świecie | „W SIECI KRĄŻĄ PLOTKI, ŻE KTOŚ WYKRADŁ PLIKI TECHNOLOGII FREEVOLT” (M4 używa tego jako przykrywki; M1-M3 grupa sama kradnie dokumentację) | `M4/json:37` |

---

## 3. Stan przenoszony między misjami

### 3a. Saldo portfela BTC

Kod NIE przechowuje salda portfela. Silnik zna tylko `rewardBtc` bieżącej misji i pokazuje „OTRZYMANE BITCOINY: +x ₿” w raporcie (`engine/apps/DebriefApp.tsx:468-470`; `engine/store/useMissionStore.ts:326,568`). Saldo i licznik certyfikatu istnieją wyłącznie w dokumentach VR. Decyzja o ich wdrożeniu odłożona: P9 (`M3/docs/rebuild-plan.md:348`, `M3/scenario.md:183`).

| Misja | Saldo początkowe (doc) | Nagroda (kod) | Saldo końcowe (doc) | Źródło doc |
|---|---|---|---|---|
| M1 | 0,00 | 2,52 | 2,52 | `M1/docs/scenariusz_misja_1_petrolog_2d.md:10,252` |
| M2 | brak w dokumencie (z sumy M1: 2,52) | 2,96 | brak w dokumencie (z sumy: 5,48) | `M2/docs/Scenariusz Misja 2 - CarbonFlow (Specyfikacja 2D).md:15` (tylko nagroda i certyfikat) |
| M3 | 5,50 | 4,02 | 9,52 | `M3/docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md:11,293` |
| M4 | 9,52 | 3,79 | 13,31 | `M4/docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md:11,333` |
| M5 | brak w dokumencie VR | 3,14 | brak w dokumencie VR | `M5/docs/scenariusz_misji_05_bank_bcorp.md` (karta 2,96 vs podsumowanie 3,14; przyjęto 3,14, decyzja 27.11.2026) |

Suma nagród z kodu: M1+M2 = 5,48; +M3 = 9,50; +M4 = 13,29; +M5 = 16,43. Zob. sprzeczność S3.

### 3b. Licznik certyfikatu / postępu

| Misja | Wartość w doc | Źródło |
|---|---|---|
| M1 | brak | brak w kodzie i w doc |
| M2 | „certyfikat ukończenia: 4/9” | `M2/docs/Scenariusz Misja 2 - CarbonFlow (Specyfikacja 2D).md:15` |
| M3 | „postęp certyfikatu: 4/10” | `M3/docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md:11,294` |
| M4 | „certyfikat ukończenia: 5/9” | `M4/docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md:11,334` |
| M5 | „6/10” — pominięty decyzją właściciela 27.11.2026 (`M5/docs/status.md`) | `M5/docs/scenariusz_misji_05_bank_bcorp.md` |

W kodzie: brak (nie ma żadnego pola ani UI). Zob. sprzeczność S4.

### 3c. Pozostały przenoszony stan

| Co | Stan | Źródło |
|---|---|---|
| Postęp między misjami (SCORM) | Każda misja to osobna paczka SCORM; stan gry NIE przechodzi między misjami. Wynik (`score`) idzie do Moodle osobno | `AGENTS.md` sekcja 2; `engine/apps/DebriefApp.tsx:462,605` |
| Kolejność misji | Wymuszana przez Moodle (kurs), nie przez grę. W grze nie ma wyboru misji (tylko dev) | `engine/components/MissionSelect.tsx:1-30` |
| Wspólne wątki do kontynuacji | Freevolt (brakujące dokumenty); Kwiatkowski i inne nazwiska NIE wracają; narzędzia (wirusy) wracają, zob. sekcja 6 | zob. sekcje 4 i 6 |
| Liczba misji w kampanii | Brak w kodzie. M3 gracz pyta „ILE JESZCZE ZADAŃ”, mentor nie odpowiada liczbą. Doc podaje 9 lub 10 (zob. S4) | `M3/json:38,43` |

---

## 4. Postacie NPC per misja

Gracz i BYTE_MASTER są w sekcji 1. Adresy e-mail w nawiasach to adresy prawdziwe (domena celu), nie sobowtóry.

### M1 PetroLog

| Postać | Stanowisko / rola | Adres / uchwyt | Rola w misji | Źródło |
|---|---|---|---|---|
| Anita Klimek | Specjalista ds. Księgowości, 5 lat w firmie, matka (dzieci: „moi chłopcy”), biegaczka | `a.klimek@petrolog.com`; Kneenook `@anita_klimek`, Quickgram `@anita_k`, Joinin `anita-klimek` | Ofiara (cel spear-phishingu) | `M1/stages:146,171-185,203,303,897` |
| Marcelina Sojka | Specjalista ds. Sprzedaży, Dział Sprzedaży, profile prywatne | brak w kodzie | Fałszywy trop (nie da się jej prześwietlić) | `M1/stages:135-142` |
| Jakub (Kuba) Kwiatkowski | Współpracownik Anity z tego samego pokoju, partner z wieczornych biegów | uchwyt `@j_kwiatkowski`; podszywany `k.kwiatkowski@petr0log.com` | Tożsamość nadawcy (ideał D3) | `M1/stages:234,403,803,894-895` |
| Prezes Buczek | Prezes zarządu PetroLog; imię nieznane (inicjał „P.”) | podszywany `p.buczek@petr0log.com` | Nadawca suboptymalny (D3) | `M1/stages:812,631` |
| „Twój synek” | Podszycie pod dziecko ofiary | brak | Opcja odrzucona przez mentora | `M1/stages:820` |

### M2 CarbonFlow Inc.

Lista mailingowa (12 osób), adres = `imię.nazwisko@carbonflow.com` bez polskich znaków (`emailLocal`, `M2/stages:25-52`):

| Postać | Stanowisko | Adres | Źródło |
|---|---|---|---|
| Robert Moris | CEO / Prezes (szef firmy, wspomniany w intro) | `robert.moris@carbonflow.com` | `M2/stages:29`; `M2/json:37` |
| Anna Kowalska | Dyrektor HR | `anna.kowalska@carbonflow.com` | `M2/stages:26` |
| Tomasz Nowak | Główny Księgowy | `tomasz.nowak@carbonflow.com` | `M2/stages:27` |
| Piotr Wiśniewski | Inżynier Przesyłu | `piotr.wisniewski@carbonflow.com` | `M2/stages:28` |
| Katarzyna Wójcik | Specjalistka ds. Zakupów | `katarzyna.wojcik@carbonflow.com` | `M2/stages:30` |
| Marek Kamiński | Kierownik Dyspozytorni | `marek.kaminski@carbonflow.com` | `M2/stages:31` |
| Magdalena Lewandowska | Analityk Rynku Paliw | `magdalena.lewandowska@carbonflow.com` | `M2/stages:32` |
| Jakub Zieliński | Administrator IT | `jakub.zielinski@carbonflow.com` | `M2/stages:33` |
| Ewa Szymańska | Radca Prawny | `ewa.szymanska@carbonflow.com` | `M2/stages:34` |
| Michał Dąbrowski | Technik Telemetrii | `michal.dabrowski@carbonflow.com` | `M2/stages:35` |
| Agnieszka Woźniak | Koordynator Logistyki | `agnieszka.wozniak@carbonflow.com` | `M2/stages:36` |
| Łukasz Kozłowski | Inspektor BHP | `lukasz.kozlowski@carbonflow.com` | `M2/stages:37` |

Podpisy podszytych nadawców: „Dział Kadr i Płac CarbonFlow Inc.”, „Dział Marketingu CarbonFlow Inc.”, „Obsługa Gastronomiczna OilFlow Katering” (`M2/stages:243-245`). Pierwsze litery wspólnego imienia „Jakub” (Zieliński M2, Kwiatkowski M1) to tylko zbieżność.

### M3 O&L Company

| Postać | Stanowisko | Staż | Rola | Źródło |
|---|---|---|---|---|
| Mateusz Klimowicz | Junior Specjalista ds. Wsparcia Klienta (zespół sprzedaży) | 2 tygodnie | Ofiara (ideał D2); adres domowy ul. Ołtaszyńska 92C/6, 53-034 Wrocław; jeździ białym samochodem z czerwonym dachem; komputer `MATEUSZ_BIURO_O&L` | `M3/stages:163-167,795,503`; `M3/stages:642` (`ratSessionConfig.host`) |
| Jan Łukasiewicz | CEO, założyciel | 21 lat | Cel zły (critical) | `M3/stages:127-137` |
| Sławomir Białek | Szef Działu Cyberbezpieczeństwa | 9 lat | Cel zły (critical) | `M3/stages:140,108` |
| Wiktoria Gałecka | Specjalistka ds. Logistyki | 6 lat | Cel suboptymalny (odrzucony) | `M3/stages:145-149,84` |
| Agnieszka Leman | Szefowa Działu Sprzedaży | 11 lat | Cel suboptymalny (odrzucony) | `M3/stages:154-158,96` |

Adresy e-mail pracowników M3: brak w kodzie. Kontakt firmy: `sales@olcompany.cloud`, tel. +48 871 787-83-76 (`M3/stages:121`).

### M4 Energy Rock

| Postać | Rola | Adres | Źródło |
|---|---|---|---|
| Michał Wilk | Fikcyjny kandydat (przykrywka atakującego), stanowisko „Analityk Rynków Energetycznych”; hasło do pliku: WILK; załącznik `CV_WILK.PDF` | `m.wilk@priv.com` | `M4/stages:285-290,382`; `M4/json:208,217,226` |
| Rekruter (dział rekrutacji) | Odbiorca CV, nienazwany | `rekrutacja@energyrock.com` | `M4/stages:285` |
| Szef IT Energy Rock | Rozmówca w negocjacjach, nienazwany; komunikator „SZEF IT ENERGY ROCK” | brak w kodzie | `M4/stages:500` |
| „Marek” (plik `MAREK.JPG`) | Tylko nazwa pliku-zmyłki, nie postać | brak | `M4/stages:410` |

### M5 Bank Bcorp

| Postać | Stanowisko / rola | Login / adres | Rola w misji | Źródło |
|---|---|---|---|---|
| Filip Wójcik | Dyrektor Sprzedaży Banku Bcorp | login pocztowy `FWOJCIK67` (brak adresu e-mail w kodzie; hasło maskowane `••••••••••••••`, kod SMS `48212`) | Ofiara (cel vishingu i przechwycenia AiTM) | `M5/stages:14,39,198-199,526-528` |
| Dawid Majewski | Przełożony Filipa Wójcika | brak w kodzie | Nieobecny (na urlopie; element legendy w D3 i D7) | `M5/stages:15,215-219,382-393` |
| Michał Mitnik | Świeży pracownik działu IT | brak w kodzie | Prawdziwy pracownik z OSINT — tożsamość użyta przez gracza (ideał D4) | `M5/stages:16,249-252` |
| Sandra Jasińska | Szefowa działu IT (przełożona Michała Mitnika) | brak w kodzie | Autorytet w firmie, powołanie się na nią rozbraja wątpliwości (ideał D7) | `M5/stages:16,382-385` |
| Michał Witnik, Marcin Mitnik, Marcin Rybnik, Darek | Fałszywe / przekręcone warianty imion i nazwisk | brak | Pułapki w opcjach wyborów D4 (`suboptimal`: Michał Witnik, Marcin Mitnik; `critical`: Marcin Rybnik) i D7 (`suboptimal`: Darek) | `M5/stages:257,265,273,405` |

---

## 5. Domeny i adresy

### M1

| Kto | Wartość | Źródło |
|---|---|---|
| Domena firmy-celu | `petrolog.com` (ofiara `a.klimek@petrolog.com`) | `M1/stages:897` |
| Domena-sobowtór (zero zamiast „o”) | `petr0log.com` (ideał D4) | `M1/stages:598,631` |
| Domeny fałszywe nieudane | `hack.com`, `gmail.com` (`DARKSUN.JAKUB@GMAIL.COM`, `DARKSUN.BUCZEK@GMAIL.COM`) | `M1/stages:581,591,614,624` |
| Strona-pułapka (ideał) | `dalekbieg.info` | `M1/stages:648,791,889` |
| Strony nietrafione | `mufina.org.pl` (kulinarna), `medikarz.iq` (medyczna) | `M1/stages:657,666` |
| Sieć wewnętrzna PetroLog | `192.168.10.45` (stacja Anity), `.2` (serwer plików, SMB), `.88` (baza logistyczna Freevolt) | `M1/stages:916-928` |
| Serwisy społecznościowe (fikcyjne) | Kneenook, Quickgram, Joinin | `M1/stages:169-187` |

### M2

| Kto | Wartość | Źródło |
|---|---|---|
| Domena firmy-celu | `carbonflow.com` | `M2/stages:19` |
| Domena-sobowtór (b -> d) | `cardonflow.com`, nadawca `KADRY@CARDONFLOW.COM` (ideał D4) | `M2/stages:194`; `M2/json:213-215` |
| Nadawcy suboptymalne | `MARKETING@CARBON.COM`, `KATERING@OILFLOW.COM` | `M2/stages:200,206` |
| Biała lista IP nadawców | `82.123.192.116`, `77.141.195.139` (cel VPN: pierwszy); IP początkowe gracza `192.168.1.45` | `M2/stages:55,105-106` |
| Hosty szablonów formularza | `poodleforms.net`, `quickgram.social`, `kneenook.forum` | `M2/stages:238-240` |
| Slug ankiety | `carbonflow-integracja-2026` (także `-cwiczenia-pozarnicze-2026`, `-owocowy-czwartek-2026`) | `M2/stages:223,229,234` |

### M3

| Kto | Wartość | Źródło |
|---|---|---|
| Strona firmy-celu | `https://olcompany.cloud`; `sales@olcompany.cloud` | `M3/stages:116-121,737` |
| Komputer ofiary | `MATEUSZ_BIURO_O&L`, IP `161.185.160.93` | `M3/stages:642` |
| Adres ofiary | Ołtaszyńska 92C/6, 53-034 Wrocław (dzielnica Partynice); fałszywe lokalizacje: Oławska 51B, Drzymały 38D, Wystawowa 23A | `M3/stages:500-503,795` |
| Sobowtór nazwy (nie domena) | „B&O Company” zamiast „O&L Company” (błąd w podpisie/nazwie dysku, suboptymalny) | `M3/stages:378,447` (opcje `vol_bo`, `env_bo`) |
| Pliki Freevolt na stacji | `FREEVOLT_OPIS_INFRASTRUKTURY.PDF`, `FREEVOLT_DOKUMENTACJA_CZ2.PDF`, `FREEVOLT_SCHEMAT_SIECI.PDF`, `FREEVOLT_UMOWY_DOSTAWCOW.XLSX` | `M3/stages:667-670` |

### M4

| Kto | Wartość | Źródło |
|---|---|---|
| Domena firmy-celu | `energyrock.com` (`rekrutacja@energyrock.com`) | `M4/stages:285` |
| Nadawca (ideał D7) | `M.WILK@PRIV.COM`; złe: `ALEX@PRIV.COM`, `NEWRAWGOODS@COMMERCIAL.BIZ` | `M4/stages:382-394` |
| VPN | cel `109.43.200.124`, początkowe `106.55.202.120` | `M4/stages:367-368` |
| Komputer ofiary | `ENERGY_ROCK_01_PC`, IP `151.89.159.52` | `M4/stages:459-461` |
| Pliki Freevolt (cele eksfiltracji) | `FVOLT_TECH.DOCX`, `FREEVOLT_SCHEMAT.PDF`, `ENERGIA_FVOLT.XCF` | `M4/stages:411,414,420` |
| Żądanie okupu | „KWOTA: $ 200 000”, adres „XKAJ1023KJDf93”, limit 30 godzin; negocjacje: ultimatum „MACIE 3 H” | `M4/stages:134-135`; `M4/json:~292` (tura 3) |

### M5

| Kto | Wartość | Źródło |
|---|---|---|
| Domena / poczta firmy-celu | `MAIL.BCORP.BIZ` (`HTTPS://MAIL.BCORP.BIZ`, panel `//MAIL.BCORP.BIZ/LOGIN`, skrzynka `//MAIL.BCORP.BIZ/INBOX`) | `M5/stages:17,20,72`; `M5/minigames/VishingApp.tsx:812` |
| Domena-sobowtór (ideał D1) | `ARCHIWUMBCORP.BIZ` (panel `//MAIL.ARCHIWUMBCORP.BIZ/LOGIN`) | `M5/stages:21,77` |
| Domena-sobowtór (suboptimal D1, skutek odroczony) | `BCORP.PL` (panel `//MAIL.BCORP.PL/LOGIN`) | `M5/stages:22,85` |
| Domena odrzucona (B2 w D1) | `BACKUP-BANK.COM` | `M5/stages:93,99-100` |
| Stopka i marka panelu logowania | `BCORP BANK © 2024`, nagłówek `BCORP SYSTEM POCZTY` (spójnie na oryginale i fałszywej stronie) | `M5/stages:23-24` |
| Szablon numeracji wewnętrznej (D2) | `891 [NR DZIAŁU] [NR PRACOWNIKA]`, kody działów: `001` (SPRZEDAŻ), `002` (DZIAŁ IT), `003` (LOGISTYKA), `004` (SUPPORT) | `M5/stages:140-146` |
| Numery telefonów (D2) | `891 002 162` (ideał, IT), `891 003 427` (odrzucony B2, logistyka), `867 452 026` (critical, spoza puli) | `M5/stages:151,159,170` |
| VPN | początkowe `90.55.202.120` -> cel `82.45.195.130` | `M5/stages:50-52` |
| Przechwycone dane logowania i 2FA | login `FWOJCIK67`, hasło maskowane `••••••••••••••`, kod SMS 2FA `48212` | `M5/stages:526-528` |
| Pliki wykradzione ze skrzynki | `RAPORT FINANSOWY 2024`, `RAPORT FINANSOWY 2025` | `M5/stages:555-556` |

Wzorzec sobowtórów: M1 zamiana litery „o” na zero (`petr0log.com`), M2 zamiana „b” na „d” (`cardonflow.com`), M3 błędna nazwa „B&O”, M4 domena nie jest sobowtórem (`priv.com` to darmowa domena kandydata), M5 combosquatting (`archiwumbcorp.biz` — dopisane słowo „archiwum” z zachowaniem `.biz`).

---

## 6. Stałe nazwy i narzędzia wspólne dla misji

### Aplikacje silnika (pulpit), identyczne w każdej misji

| Etykieta na pulpicie | `id` / `componentId` | Występuje | Źródło |
|---|---|---|---|
| `//CHAT: BYTE_MASTER` | `chat_shortcut` / `chat`, zawsze pierwszy kafelek, `#00ff66`, ikona MessageSquareCode | M1-M5 | `M1/json:117-124`, `M2/json:108-115`, `M3/json:81-88`, `M4/json:85-92`, `M5/json:97-103` |
| `//RAPORT POOPERACYJNY` | `debrief_app`, odblokowany przez `mission_completed` | M1-M5 | `M1/json:179-187`, `M2/json:161-169`, `M3/json:134-142`, `M4/json:147-155`, `M5/json:159-166` |
| Nagłówek raportu | „{firma} // RAPORT KOŃCOWY”, „ZHAKOWANO {FIRMA} – UKOŃCZONO ZADANIE {n}” | M1-M5 | `engine/apps/DebriefApp.tsx:404-407`; `M1/json:191-192`, `M5/json:170-171` itd. |

### Aplikacje powtarzające się w kilku misjach (nazwy i różnice)

| Etykieta | Misje | Uwagi | Źródło |
|---|---|---|---|
| `//BAZA_WIRUSÓW` | M2, M3, M4 | `id: virus_database`; M2 buduje ROBAKA (ikona ShieldAlert, `componentId` `worm_builder`), M3 i M4 wybór wirusa + zdrapka (ikona Bug, `ol_virus_lab` / `er_virus_lab`) | `M2/json:134-142`, `M3/json:89-97`, `M4/json:93-101` |
| VPN | M2 `//TUNEL_VPN`, M4 i M5 `//VPN` | Różne etykiety dla tego samego narzędzia; `id` `vpn_app` w każdej. M4 i M5 używają klocka `VpnRouter` (`vpn_router`); w klocku jest „ASYSTENT AI” | `M2/json:125-133`, `M4/json:120-128`, `M5/json:114-121`, `engine/blocks/VpnRouter.tsx:400` |
| Phishing / poczta | M2 `//PHISHING` i `//PHISHING (WYSYŁKA)`, M4 `//MAIL`, M1 `//KREATOR_STRONY` + `//WYSYŁANIE_MAILA` | Różne nazwy dla pisania maila | `M2/json:116-151`, `M4/json:111-119`, `M1/json:152-169` |
| Monitor ofiary / botnetu | M1 `//MONITOR_OFIARY`, M2 `//MONITOR_BOTNETU` | | `M1/json:170-178`, `M2/json:152-160` |
| Sesja z ofiarą | M3 `//WIRUS: RAT (C2)`, M4 `//MODUŁ_RANSOMWARE`, `//CZAT_Z_OFIARĄ` | | `M3/json:125-133`, `M4/json:129-146` |
| Aplikacje tylko jednej misji | M1: `//BAZA_CELU: PETROLOG`, `//WYSZUKIWARKA: OSINT`, `//SOCIAL_MEDIA`; M3: `//TOR: PRZEGLĄDARKA`, `//DYSK E: PENDRIVE`, `//DRON: CONDOR MIT63`; M4: `//KREATOR: RANSOMWARE`; M5: `//FILIP_WOJCIK_BIALY_WYWIAD.PDF`, `//PRZYGOTOWANIE_DOMENY`, `//PRZYGOTOWANIE_STRONY`, `//PRZYGOTOWANIE_NUMERU`, `//ROZMOWA` | | `M1/json:126-151`, `M3/json:98-124`, `M4/json:102-110`, `M5/json:105-112,123-157` |
| Kolor kafelka raportu | M1 i M2 `#10b981`, M3, M4 i M5 `#facc15` | Zob. S9 | `M1/json:182`, `M3/json:137`, `M4/json:150`, `M5/json:161` |

### Narzędzia i wirusy używane w kilku misjach

| Narzędzie | Misje i ocena | Źródło |
|---|---|---|
| Ransomware | M2 D3: critical (alarmuje admina); M3 D1: critical; M4 D1: ideal (przykrywka szantażu) | `M2/stages:86-91`; `M3/stages:50-60`; `M4/stages:56-62` |
| RAT (Remote Access Trojan) | M3 D1: ideal; M4 D1: suboptimal (odrzucony: „NIE DA NAM SZANTAŻU”) | `M3/stages:42-48`; `M4/stages:64-73` |
| Keylogger | M2, M3, M4 zawsze suboptimal z odrzuceniem; w M3 także podpis „KEYLOGGER” na pendrive = critical | `M2/stages:74-84`; `M3/stages:62-71`; `M4/stages:75-85` |
| Robak 0-day | tylko M2, ideał D3 | `M2/stages:67-73` |
| Typosquatting / combosquatting jako wektor wiarygodności | M1 D4 (`petr0log.com`), M2 D4 (`cardonflow.com`), M5 D1 (`archiwumbcorp.biz`) | `M1/stages:598`; `M2/stages:194`; `M5/stages:77` |
| Przeskok czasu z zegarem (TimeJump) | M2, M3, M4 (M1 i M5 brak) | `M2/stages:370`; `M3/stages:802`; `M4/stages:711` |
| Nośniki-przynęty | M1: plik PDF na stronie; M3: pendrive w kopercie (ZIP); M4: załącznik CV chroniony hasłem | `M1/stages:~640-665`; `M3/stages:340-342`; `M4/stages:287-290` |
| Wspólne platformy społecznościowe | Kneenook i Quickgram: M1 (profile Anity), M2 (szablony formularza z hostami `kneenook.forum`, `quickgram.social`) | `M1/stages:169-181`; `M2/stages:238-240` |
| Freevolt | Dokumentacja jako cel w M1–M4 (M5 bez Freevolt — raporty finansowe dot. rafinerii); nazwy plików: patrz sekcja 5 | zob. sekcja 5 |

---

## 7. Sprzeczności do decyzji właściciela

Poniżej tylko to, gdzie dwa miejsca w kodzie lub kod i dokument podają różne wartości. Rozstrzygnięć nie podejmujemy.

### S1. Data fabularna M1 a M2-M5
- M1: `14.01.2025` (`M1/json:7`; doc `scenariusz_misja_1_petrolog_2d.md:12`).
- M2, M3, M4, M5: `19.05.2026` (`M2/json:7`, `M3/json:7`, `M4/json:7`, `M5/json:7`).
- Odstęp M1 -> M2: 16 miesięcy. M2 intro mówi o „dokumentach, które dla nas zdobyłeś” jako o czymś niedawnym (`M2/json:31`), M4 powołuje się na „dane wykradzione z PetroLog” (`M4/json:31`). Nic w kodzie nie tłumaczy przeskoku.
- Dodatkowo M2, M3, M4 i M5 mają tę samą datę 19.05.2026, więc cztery misje „odbywają się tego samego dnia”, choć M3 trwa od 22:15 przez noc do 06:02 (zob. S2). W M5 brak też bezpośredniej wzmianki o Freevolt ani poprzednich firmach — celem są raporty finansowe dot. inwestycji rafinerii (`M5/json:37,43`). ROZSTRZYGNIĘTE (M5, 27.11.2026): właściciel zatwierdził datę `19.05.2026` dla M5 (`M5/docs/status.md:19,41`).

### S2. Zegar i dzień w M2-M4
- M2 kończy się o 14:25 (`M2/stages:370`). M3 zaczyna odliczanie od 22:15 i przechodzi do 06:02 i 08:12 (`M3/stages:802,837`), czyli następnego rana; data na pulpicie zostaje 19.05.2026 (potwierdza `M4/docs/rebuild-plan.md:74`, `:306`).
- M4: wysyłka o 16:40, otwarcie CV „rano” o 09:10, następnego dnia; data nadal 19.05.2026 (`M4/stages:711`).
- Efekt: M3 kończy się o 08:12 (lub 11:40) dnia po 19.05, a M4 zaczyna się „tego samego dnia” o 16:40. Brak zdefiniowanej daty na pulpicie po przekroczeniu północy.
- M2 przeskok 09:40 -> 14:25 zaczyna się o 09:40, pierwsza godzina pojawia się dopiero w przeskoku (`systemTime` puste wcześniej).

### S3. Saldo portfela BTC
- Suma nagród z kodu: M1 2,52 + M2 2,96 = 5,48 (`M1/json:9`, `M2/json:10`).
- Doc M3: saldo początkowe 5,50, po M3: 9,52 (`M3/docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md:11,293`).
- Kod: 5,48 + 4,02 = 9,50 (`M3/json:10`). Doc M4 zaczyna od 9,52 i kończy na 13,31 (`M4/docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md:11,333`); suma z kodu to 13,29.
- Rozbieżność 0,02 BTC powstaje w dokumencie M3 (5,50 zamiast 5,48) i dziedziczy ją doc M4.
- Dodatkowo wypłata w kodzie to nagroda x wynik (`engine/core/scoring.ts:47-50`), więc saldo zależy od wyników z poprzednich misji, a kod ich nie przenosi. Pasek salda w kodzie: brak (P9 w `M3/docs/rebuild-plan.md:348`).
- Doc M2 nie podaje salda początkowego ani końcowego (`M2/docs/...:15`).

### S4. Licznik certyfikatu / postępu
- M2: „4/9” (`M2/docs/Scenariusz Misja 2 - CarbonFlow (Specyfikacja 2D).md:15`).
- M3: „4/10” (`M3/docs/Scenariusz Misja 3 - O&L Company (Specyfikacja 2D).md:11,294`).
- M4: „5/9” (`M4/docs/Scenariusz Misja 4 - Energy Rock (Specyfikacja 2D).md:11,334`).
- M5: „6/10” w VR; pominięty w grze decyzją właściciela (27.11.2026).
- M1: brak licznika. Niespójne zarówno mianowniki (9 vs 10), jak i licznik (M2 4, M3 4, M4 5: M2 i M3 mają ten sam).
- W kodzie: brak. Doc M4 mówi też o „9 kafelkach bazowych” (`M4/docs/...:329`).

### S5. Próg zaliczenia
- Kod: 70 we wszystkich misjach (`M1/json:11`, `M2/json:13`, `M3/json:15`, `M4/json:13`, `M5/json:13`).
- Doc: M1 75% (`M1/docs/scenariusz_misja_1_petrolog_2d.md:9`), M2 80% (`M2/docs/...:14`), M3 80% (`M3/docs/...:10`; w `M3/scenario.md:189` zapisana decyzja NEW-04 o 70%), M4 80% (`M4/docs/...:10`), M5 70% (`M5/scenario.md:9`).

### S6. Nazwa tej samej aplikacji różni się między misjami
- VPN: `//TUNEL_VPN` (M2) vs `//VPN` (M4, M5) (`M2/json:127`, `M4/json:122`, `M5/json:115`).
- Mail: `//PHISHING` (M2), `//WYSYŁANIE_MAILA` (M1), `//MAIL` (M4).
- Wirusy: `//BAZA_WIRUSÓW` (M2-M4); ikona M2 ShieldAlert, M3 i M4 Bug.

### S7. Tytuł ekranu wywołania w intro
- M1-M3: „POŁĄCZENIE PRZYCHODZĄCE (HACKERS.OS)”; M4 i M5: „POŁĄCZENIE PRZYCHODZĄCE” bez nawiasu (`M1/json:18`, `M2/json:20`, `M3/json:19`, `M4/json:20`, `M5/json:20`).
- M4 doc używa menu „Darknetu” i „ZADANIE 4”, a w kodzie wyboru misji w grze nie ma (`M4/docs/...:55`).

### S8. BIOS M3 różni się od M1, M2, M4, M5
- M3: „BUILD TIME: 03/09/2022 10:26:54”, „510M EXTENDED RAM”, „CPU : UNKNOWN”, puste linie (`M3/json:68-70`). Pozostałe (M1, M2, M4, M5): „19:26:54”, „512M”, „CPU - UNKNOWN” (`M1/json:86-89`, `M5/json:71-74`).

### S9. Kolor kafelka raportu pooperacyjnego
- M1, M2: `#10b981`; M3, M4, M5: `#facc15` (`M1/json:182`, `M2/json:164`, `M3/json:137`, `M4/json:150`, `M5/json:161`).
- Kolor akcentu M4: `#FF0033`, pozostałe (M1–M3, M5): `#00ff66` (`M4/json:8`, `M5/json:8`).

### S10. Oś czasu znajomości grupy a rekrutacja
- Intro M1 jest „pierwszym kontaktem” („DOSTAŁEM TWOJĄ WIADOMOŚĆ”, `M1/json:23`), a M2 zaczyna od „KOLEJNE ZADANIE” bez daty; odstęp 16 miesięcy (S1) nie jest nigdzie uzasadniony w rozmowach.

### S11. Wyświetlanie wyniku w trakcie gry
- `hideLiveScore: true` w M2, M3, M4, M5; w M1 brak pola, więc wynik i BTC są widoczne na bieżąco (`M2/json:12`, `M3/json:12`, `M4/json:12`, `M5/json:12`; brak w `M1/json`). Komentarz w typach mówi, że ukrywa „(M1)” (`engine/types/mission.ts:13`), czyli komentarz jest odwrotny do danych.

### S12. Nagroda w danych a opis w doc
- Kod, wszędzie: wypłata skaluje się wynikiem (`engine/core/scoring.ts:47`). Doc M1: „Złoty puchar za 100%” (`M1/docs/...:10`), puchar w kodzie: brak.
- ROZSTRZYGNIĘTE (M5, 27.11.2026): w M5 właściciel zatwierdził nagrodę `3.14 BTC` (z ekranu podsumowania VR, zamiast `2.96 BTC` z karty startowej VR), pominięcie licznika `6/10`, datę `19.05.2026`, kolor `#00ff66` oraz spójną stopkę `BCORP BANK © 2024` (zamiast błędnego `LEPRECHAUN BANK © 2022` z VR) (`M5/docs/status.md:19,41`, `M5/json:7,8,10`, `M5/stages:23`).

### S13. M4 nie ma `scenario.md`
- Katalog `mission_04_energy_rock/` zawiera `assets`, `data`, `docs`, `minigames`, `index.ts`, `stages.ts`, bez `scenario.md`. Źródło fabuły M4 to `data/mission4.json`, `stages.ts` i `docs/rebuild-plan.md`. Do M1-M3 oraz M5 `scenario.md` są, ale M1 i M2 bywają nieaktualne.

---

## 8. Czego nie udało się ustalić (brak w kodzie)

- Saldo portfela BTC w grze, licznik certyfikatu, liczba misji w kampanii.
- Imię prezesa „Buczek” (M1), imię rekrutera i szefa IT (M4), adresy e-mail pracowników M3, adres e-mail Marceliny Sojki (M1), adresy e-mail pracowników M5 (Filipa Wójcika, Dawida Majewskiego, Michała Mitnika, Sandry Jasińskiej).
- Godzina startu zegara M1, M5, M2 przed przeskokiem, M3 przed 22:15 i M4 przed 16:40 (pulpit pokazuje samą datę).
- Czy i jak misje 2-4 wiążą się z „dokumentami z PetroLog” w M3 (brak wprost).
- Wygląd i treść debriefu „CO POWINIENEŚ ZAPAMIĘTAĆ?” poza polami `attack`/`defense` (zob. P10 w `M3/docs/rebuild-plan.md:349`).

## 9. Jak dopisywać do pliku

1. Po implementacji misji N dodaj wiersz do tabeli 2 (firma, data, zegar, BTC, kolor, decyzje, technika).
2. Dopisz NPC (sekcja 4) i domeny (sekcja 5) tej misji z odnośnikiem plik:linia.
3. Dopisz nowe nazwy aplikacji i narzędzi (sekcja 6) oraz odwołania do poprzednich misji (sekcja 2, podtabela).
4. Każdą rozbieżność z kanonem wpisz do sekcji 7 z miejscem występowania obu wersji; nie rozstrzygaj sam.
5. Gdy właściciel rozstrzygnie sprzeczność, zapisz decyzję w sekcji 7 jako „ROZSTRZYGNIĘTE: …” i popraw kod/dokumenty w osobnym zadaniu.
