# Misja 05: Bank Bcorp — status wdrożenia

Plik stanu procesu (skill `rbt-proces-misji`). Każdy krok aktualizuje go na końcu. Ustalenia QA: [`qa.md`](qa.md).

## Kroki

- [x] 1. Scenariusz z VR → `docs/scenariusz_misji_05_bank_bcorp.md` (źródło: https://youtu.be/Iyb44SJuRqQ, narzędzie: Gemini)
- [x] 2. Dopracowanie → `scenario.md` zatwierdzony przez właściciela (data: 27.11.2026)
- [x] 3. Implementacja → kod, testy, paczka SCORM (commit: `7dba80d`)
- [x] 4. QA → `docs/qa.md` bez otwartych W i S (rund: 2, zamknięte 27.11.2026)
- [ ] 5. Książka i quiz → `docs/moodle-ksiazki/misja_5/`, `quizy.gift`
- [ ] 6. Wdrożenie w Moodle i test w firmie (data: …)

## Czeka na właściciela

| Co | Kontekst (moment w grze, cytat) | Od kroku | Odpowiedź |
|---|---|---|---|
| Rozmowa D3–D10: poziomy opcji, reakcje Filipa, kwestie mentora | 20 opcji `[DO ZAPROJEKTOWANIA]` w rozmowie telefonicznej. | 2 | **ZROBIONE** (27.11.2026, zapisane poniżej) |
| Kanon | data 19.05.2026, licznik 6/10, nagroda 2,96 (karta) vs 3,14 BTC (podsumowanie), stopka „LEPRECHAUN BANK © 2022” na fałszywej stronie | 2 | **ROZSTRZYGNIĘTE** (27.11.2026): data `19.05.2026`, nagroda `3.14 BTC`, kolor `#00ff66`, stopka spójnie `BCORP BANK © 2024`, bez licznika `6/10`. |
| Nazwa folderu | `mission_05_Bank_Bcorp` — pozostałe misje mają małe litery (`mission_04_energy_rock`) | 2 | **WYKONANE** (`mission_05_bank_bcorp`) |

## Decyzje właściciela

| Data | Decyzja | Dotyczy |
|---|---|---|
| 27.11.2026 | Notatki z białego wywiadu widoczne na prawym monitorze w trakcie rozmowy. Decyzje D3–D7 sprawdzają uważne czytanie (pułapki: podobne imiona i nazwiska). | Etap 6, D3–D7 |
| 27.11.2026 | PDF z białym wywiadem zostaje dokumentem do przeczytania, jak w VR; zamknięcie odblokowuje VPN. Świadome odstępstwo od zasady „zero-clicker”. | Etap 1 |
| 27.11.2026 | Klonowanie strony: 4 elementy przeciągane (albo klik w element i klik w miejsce, mechanizm z M1) z oryginału na szkielet; element pasuje tylko do swojego miejsca. Bez oceny. | Etap 4 |
| 27.11.2026 | Rozmowa w dwóch fazach: (1) rozmowa na głównym ekranie + notatki na prawym monitorze; (2) po „DAJ MI CHWILĘ” dwie strony logowania na głównym ekranie, rozmowa na prawym monitorze; dane przenoszone tym samym gestem co w etapie 4. | Etap 6 |
| 27.11.2026 | Bez licznika „ZAUFANIE PRACOWNIKA”. Zaufanie widać w odpowiedziach Filipa. Odstępstwo od VR. | Etap 6 |
| 27.11.2026 | D1: ARCHIWUMBCORP.BIZ ideal; BCORP.PL suboptimal (adres fałszywej strony i link w rozmowie w wariancie MAIL.BCORP.PL); BACKUP-BANK.COM odrzuca mentor (B2). | Etap 3 |
| 27.11.2026 | D2: 891 002 162 ideal; 891 003 427 (logistyka) odrzuca mentor (B2); 867 452 026 (spoza firmy) critical (wykrycie). Pytanie na ekranie do potwierdzenia przy zapisie scenariusza. | Etap 5 |
| 27.11.2026 | D3: DZIEŃ DOBRY PANIE FILIPIE. ideal; DZIEŃ DOBRY PANIE DAWIDZIE. suboptimal (Filip: „CHYBA POMYŁKA — TU FILIP WÓJCIK, DAWID JEST NA URLOPIE. Z KIM ROZMAWIAM?”); CZEŚĆ FILIP! suboptimal (Filip: „SŁUCHAM? CHYBA SIĘ NIE ZNAMY. Z KIM ROZMAWIAM?”); HEJ STARY! critical (wykrycie — spala przykrywkę). | Etap 6, D3 |
| 27.11.2026 | D4: TU MICHAŁ, MICHAŁ MITNIK ideal; NAZYWAM SIĘ MICHAŁ WITNIK suboptimal (Filip: „WITNIK? NIE KOJARZĘ, ALE OK — O CO CHODZI?”); TU MARCIN, MARCIN MITNIK suboptimal (Filip: „MARCIN MITNIK? NIE KOJARZĘ... O CO CHODZI?”); MARCIN RYBNIK Z TWOJEJ FIRMY critical (wykrycie). | Etap 6, D4 |
| 27.11.2026 | D5: PRACUJĘ W DZIALE IT ideal; PRACUJĘ W DZIALE SPRZEDAŻY critical (wykrycie — Filip sam jest dyrektorem sprzedaży); PRACUJĘ W DZIALE LOGISTYKI odrzuca mentor (B2); PRACUJĘ W DZIALE WSPARCIA KLIENTA odrzuca mentor (B2). | Etap 6, D5 |
| 27.11.2026 | D6: PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA ideal; NUDZI MI SIĘ, NIE BĄDŹ TAKI... critical (wykrycie — Filip rozłącza się); TO PILNE. MAM PROBLEM Z TRUDNYM KLIENTEM, MUSISZ MI POMÓC suboptimal (Filip: „KLIENTEM? MYŚLAŁEM, ŻE CHODZI O TESTY POCZTY... ZRESZTĄ MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...”); PRZEPRASZAM, ALE TO PILNE. POTRZEBUJĘ RAPORTÓW FINANSOWYCH KTÓRE MASZ NA POCZCIE critical (wykrycie — zdradza cel ataku). | Etap 6, D6 |
| 27.11.2026 | D7: Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE... ideal; zmiana z VR: PAN DAMIAN → PAN DAWID WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ [ZMIANA WZGLĘDEM VR] jako suboptimal (Filip: „DAWID JEST TERAZ NA URLOPIE, NIE MAM JAK GO ZAPYTAĆ... DZIWNE, ŻE NIC MI WCZEŚNIEJ NIE MÓWIŁ.”); TWÓJ PRZEŁOŻONY MA PRZECIEŻ WOLNE... suboptimal (Filip: „WIEM, ŻE JEST NA URLOPIE, ALE TO NIE ZNACZY, ŻE MOGĘ WIERZYĆ NA SŁOWO...”); DAREK WSPOMNIAŁ... suboptimal (Filip: „DAREK? CHYBA DAWID — I ON JEST NA URLOPIE. NIE BRZMI TO PRZEKONUJĄCO...”). | Etap 6, D7 |
| 27.11.2026 | D8: SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY... ideal; TO NIE ZAJMIE DŁUGO, WIĘC NIE MUSISZ SIĘ ZASTANAWIAĆ suboptimal (Filip: „NIE LUBIĘ TAKIEGO POŚPIECHU, ALE DOBRA — JEŚLI TO CHWILA, CO MAM ROBIĆ?”); ZRESZTĄ CZEMU MIAŁBYŚ MI NIE POMÓC? BĄDŹ CZŁOWIEKIEM... suboptimal (Filip: „ECH, NIE MAM CZASU NA DYSKUSJE. MÓW SZYBKO, CO MAM ROBIĆ?”). | Etap 6, D8 |
| 27.11.2026 | D9: ZALOGUJ SIĘ NA NASZĄ NOWĄ STRONĘ ARCHIWIZACJI POCZTY ideal; PODAM CI LINK DO MOJEGO SYSTEMU POCZTY suboptimal (Filip przed linkiem: „TWOJEGO? CHYBA FIRMOWEGO... NO DOBRA, WYŚLIJ TEN LINK.”); PODAJĘ CI NOWĄ EKSTRA WERSJĘ POCZTY suboptimal (Filip przed linkiem: „„EKSTRA WERSJĘ”? BRZMI TROCHĘ NIEPOWAŻNIE, ALE WYŚLIJ LINK — ZOBACZĘ.”); WYSYŁAM CI TĘ PODSTAWIONĄ STRONĘ critical (wykrycie — wprost zdradza phishing). | Etap 6, D9 |
| 27.11.2026 | D10: SPRAWDZAMY CZY NOWY SYSTEM JEST SPÓJNY Z POPRZEDNIM... ideal; TYLKO TY ZNASZ DANE DO LOGOWANIA... suboptimal (Filip: „ROZUMIEM, ALE WOLAŁBYM WIEDZIEĆ, CZEMU MAM PODAWAĆ FIRMOWE HASŁO... DOBRA, DAJ MI CHWILĘ.”); ZALOGUJ SIĘ JAK DO MAILA, BYLE SZYBKO suboptimal (Filip: „NIE POGANIAJ MNIE, TO MOJE HASŁO FIRMOWE... NO DOBRA, DAJ MI CHWILĘ.”). | Etap 6, D10 |
| 27.11.2026 | Kanon i szczegóły: nagroda `3.14 BTC`, data `19.05.2026`, kolor `#00ff66`, stopka `BCORP BANK © 2024`, pytanie D2 „WYBIERZ NUMER TELEFONU, POD KTÓRY SIĘ PODSZYJESZ:”, skutek odroczony dla D1=`BCORP.PL` w reakcji Filipa na link, zmiana nazwy folderu na `mission_05_bank_bcorp`. | Kanon, D1, D2 |

## Do dostarczenia przez właściciela

| Plik | Folder | Proporcje / układ | Co | Status |
|---|---|---|---|---|
| `filip_wojcik.png` (lub `.jpg`/`.webp`/`.svg`) | `RedBlueTeam/src/scenarios/mission_05_bank_bcorp/assets/intel/` | pionowe ok. `4:5` / `1:1` (`w-full h-44`, `fit="cover"`) | Portret służbowy Filipa Wójcika (Dyrektora Sprzedaży Banku Bcorp) do dokumentu białego wywiadu (`IntelPdfApp.tsx`) | `oczekuje na plik` |
| `bcorp_logo.png` (lub `.jpg`/`.webp`/`.svg`) | `RedBlueTeam/src/scenarios/mission_05_bank_bcorp/assets/site/` | poziome `2:1` (`w-28 h-14`, `fit="contain"`) | Logo firmowe Banku Bcorp w nagłówku panelu logowania `BCORP SYSTEM POCZTY` (`PageClonerApp.tsx`, `VishingApp.tsx`) | `oczekuje na plik` |

## Notatki z sesji

27.11.2026: start kroku 2. Scenariusz z Gemini jest kompletny (6 etapów, 10 decyzji, 26 opcji do zaprojektowania, 2 mechaniki do decyzji). Nie weryfikowany z nagraniem (krok Antigravity pominięty).

## Weryfikacja Kroku 3

- `vitest run`: `49/49` plików, `620/620` testów PASS (w tym regresja M1–M4 i M5).
- `tsc -p tsconfig.app.json --noEmit`: exit `0`.
- `node scripts/package-scorm.js --all`: exit `0` (zbudowano M1–M5; `scorm-mission-5-bank-bcorp.zip` 148.1 KB odizolowany).
- Audyt kryminalistyczny: `CLEAN`. Recenzja niezależna: `APPROVE`.
- Przeglądarka (`?mission=5&dev=1` w Chromium, `1366×768` i `1920×1080`): ścieżka idealna do raportu (`100%`, `3.14 BTC`, `10/10`), wszystkie `7` opcji `critical`, wszystkie `4` opcje B2, wszystkie `14` wariantów `suboptimal` i skutek odroczony `D1=BCORP.PL`, `3` warianty mostka końcowego, pamięć stanu po `X` w Etapie 4 i 6, brak przewijania i brak błędów w konsoli/sieci; nie testowano responsywności mobilnej `<768px` ani wgranych docelowych grafik PNG (sprawdzone zastępniki dev).

## Weryfikacja Kroku 4

- QA w 2 rundach (`docs/qa.md`): R1 — 5 niezależnych recenzentów (spójność, złe wybory, zgodność ze scenariuszem, standard i UI, treść dydaktyczna); wymiar złych wyborów przerwany przez zabezpieczenia modelu i powtórzony na Haiku. R2 — niezależna recenzja zmian.
- Zmiany: pytania D1/D2/D9/D10 na ekranie, kolejność końca etapu 6 (pobieranie po rozmowie), loadery z paskiem, baner odrzucenia bez ucinania (silnik), 10 lekcji „Sygnały / Co zrobić”, 5 spójników między etapami, poprawione feedbacki i zdania mostka końcowego, drobne teksty (lata raportów 2024/2025, SANDRĘ, BANK BCORP, DYREKTOR), kafelek //ROZMOWA w kolorze `#ef4444`, watcher Vite odporny na pakowanie SCORM.
- `vitest` 622/622, `tsc` 0, `package-scorm --all` 0 (5 paczek, przy działającym dev). Przeglądarka 1366×768: cała rozmowa ze słabszym D8, faza 2, raport, spójnik, M4 (regresja banera).
- Przed wgraniem do Moodle: dostarczyć `bcorp_logo.*` i `filip_wojcik.*` (tabela „Do dostarczenia”), przebudować paczkę.
- Następny krok: `rbt-moodle-ksiazka-quiz`.
