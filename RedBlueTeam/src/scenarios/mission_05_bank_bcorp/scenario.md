# Misja 5: Bank Bcorp
- id: mission-5-bank-bcorp
- firma: Bank Bcorp
- nagroda: 3.14 BTC
- kolor: #00ff66
- data fabularna: 19.05.2026
- ocenianych decyzji: 10

Źródło prawdy: `docs/scenariusz_misji_05_bank_bcorp.md` (nagranie VR, 10 decyzji D1–D10) oraz ustalenia z sesji dopracowania (`docs/status.md`). Wynik zaliczający: 70% (`passingScore`). Podsumowanie: „ZHAKOWANO BANK BCORP”, „UKOŃCZONO ZADANIE 5”.

---

## Intro (dialog z BYTE_MASTER)
- BM: MAM DLA CIEBIE KOLEJNE ZADANIE
- GRACZ: O CZYM MOWA TYM RAZEM?
- BM: BĘDZIE AMBITNIE, SPODOBA CI SIĘ, A PRZY OKAZJI UTRZEMY NOSA KILKU PALIWOWYM MAGNATOM
- GRACZ: CO MASZ NA MYŚLI?
- BM: DOSZŁY MNIE SŁUCHY, ŻE WŁAŚNIE STARTUJE OGROMNA INWESTYCJA - BUDOWA RAFINERII W POBLIŻU DOLINY BARYCZY. TO BARDZO WAŻNY EKOLOGICZNIE TEREN
- BM: MUSIMY ZDOBYĆ INFORMACJE, SKĄD MAJĄ NA TO PIENIĄDZE
- GRACZ: WIESZ, GDZIE MOGĘ JE ZNALEŹĆ?
- BM: WSZYSTKIE RAPORTY FINANSOWE ZNAJDUJĄ SIĘ W BANKU BCORP. DOWIEDZIAŁEM SIĘ, ŻE JEDEN Z DYREKTORÓW WYSYŁAŁ JE OSTATNIO MAILEM, WIĘC MOGĄ BYĆ NA SERWERACH POCZTOWYCH FIRMY
- GRACZ: OK, PRZYGOTUJĘ FAŁSZYWĄ WITRYNĘ NA PODOBNEJ DOMENIE I UTWORZĘ STRONĘ LOGOWANIA. PROBLEM POLEGA NA TYM, ŻE NIE JESTEM W STANIE PRZEWIDZIEĆ CZY I KIEDY NASZA OFIARA SIĘ ZALOGUJE. POTRZEBUJESZ TYCH DANYCH NA JUŻ?
- BM: TAK, DOŚĆ MOCNO GONI NAS CZAS. ZADZWOŃ DO NIEGO, PODSZYJ SIĘ POD PRACOWNIKA DZIAŁU IT I SPRÓBUJ GO NAKŁONIĆ DO ZALOGOWANIA SIĘ NA NASZ SERWER
- GRACZ: JAK TO SOBIE WYOBRAŻASZ?
- BM: ZA MOMENT UDOSTĘPNIĘ CI INFORMACJE, KTÓRE UDAŁO NAM SIĘ UZYSKAĆ Z BIAŁEGO WYWIADU. ZDZIWISZ SIĘ, JAKIE DANE MOŻNA ZDOBYĆ W SIECI. I TO CAŁKIEM LEGALNIE
- GRACZ: OK, MA TO SENS. W TAKIM RAZIE POPROSZĘ DYREKTORA BANKU O ZALOGOWANIE SIĘ DO SYSTEMU ARCHIWIZACJI POCZTY, KTÓRY OBECNIE TESTUJĘ. W TEN SPOSÓB PRZEJMIEMY JEGO LOGIN I HASŁO, I DOSTANIEMY SIĘ DO FIRMOWEJ SKRZYNKI. DALEJ POWINNO JUŻ PÓJŚĆ GŁADKO
- BM: SPRAWDŹMY TO
- odblokuj: //FILIP_WOJCIK_BIALY_WYWIAD.PDF (zaraz po starcie pulpitu)

---

## Etap 1: //FILIP_WOJCIK_BIALY_WYWIAD.PDF
Klocek: NOWA MINIGRA (przeglądarka dokumentu z białym wywiadem)
Cel dydaktyczny: pokazanie, jakie publicznie dostępne informacje (OSINT) o strukturze firmy, urlopach i adresie poczty pozwalają uwiarygodnić scenariusz vishingu.
Ekrany: otwarty dokument `FILIP_WOJCIK_BIALY_WYWIAD.PDF` z 4 punktami (`WAŻNE INFORMACJE — BĘDZIESZ WYKORZYSTYWAŁ TE INFORMACJE PODCZAS ROZMOWY. DOBRZE JE ZAPAMIĘTAJ!`). Przycisk `POTWIERDZAM PRZECZYTANIE` kończy etap.
Oceniane: brak | Flavor (nieoceniane): lektura dokumentu (te same 4 punkty są widoczne na prawym monitorze w Etapie 6)

Materiały na ekranie:
1. `FILIP PRACUJE W BANKU BCORP JAKO DYREKTOR SPRZEDAŻY`
2. `JEGO PRZEŁOŻONYM JEST DAWID MAJEWSKI. OBECNIE PRZEBYWA NA URLOPIE`
3. `MICHAŁ MITNIK TO ŚWIEŻY PRACOWNIK DZIAŁU IT. JEGO SZEFOWĄ JEST SANDRA JASIŃSKA`
4. `WYKUP PODOBNĄ DOMENĘ. ADRES POCZTY FIRMOWEJ TO: HTTPS://MAIL.BCORP.BIZ`

Mostek (rozmowa do kolejnego etapu):
- GRACZ: „MAM WSZYSTKO, CZEGO POTRZEBUJĘ DO ROZMOWY. NAJPIERW UKRYJĘ SWOJE IP.” [SPÓJNIK]
- odblokuj: //VPN

---

## Etap 2: //VPN
Klocek: VpnRouter
Cel dydaktyczny: maskowanie adresu IP atakującego przed przygotowaniem infrastruktury i wykonaniem ataku.
Ekrany: konfiguracja adresu IP (`DOPASUJ SWOJE IP, ABY UNIKNĄĆ WYKRYCIA`, pożądane `82.45.195.130`, początkowe `90.55.202.120`) → animacja dopasowania (`DOPASUJ W AI`) → `POMYŚLNIE DOPASOWANO IP`
Oceniane: brak | Flavor (nieoceniane): dopasowanie 4 oktetów IP

Mostek (rozmowa do kolejnego etapu):
- GRACZ: „IP ZAMASKOWANE. CZAS NA DOMENĘ DLA PODSTAWIONEJ STRONY.” [SPÓJNIK]
- odblokuj: //PRZYGOTOWANIE_DOMENY

---

## Etap 3: //PRZYGOTOWANIE_DOMENY
Klocek: ChoiceCards
Cel dydaktyczny: zrozumienie mechanizmu rejestracji domen łudząco podobnych do oryginalnych (combosquatting / typosquatting), aby uwiarygodnić fałszywą stronę logowania.
Ekrany: wybór domeny (z przypomnieniem oryginalnego adresu z białego wywiadu: `HTTPS://MAIL.BCORP.BIZ`)
Oceniane: D1

Decyzja D1: "WYBIERZ DOMENĘ, KTÓRĄ WYKUPISZ DLA PODSTAWIONEJ STRONY SYSTEMU ARCHIWIZACJI:"
- ARCHIWUMBCORP.BIZ — "Domena w strefie .biz łącząca nazwę banku z określeniem archiwum." | ideal | Domena zawiera nazwę firmy, końcówkę `.biz` identyczną z oryginalną pocztą oraz słowo „archiwum” pasujące do pretekstu testów.
- BCORP.PL — "Krótka domena z nazwą banku zarejestrowana w polskiej strefie .pl." | suboptimal | Zawiera nazwę firmy, ale inna końcówka (`.pl` zamiast `.biz`) i brak słowa „archiwum” mogą wzbudzić czujność rozmówcy.
- BACKUP-BANK.COM — "Domena w strefie .com nawiązująca do kopii zapasowej banku." | suboptimal, odrzucany przez mentora (B2): "W TEJ DOMENIE NIE MA NAWET NAZWY BANKU BCORP. NIKT NIE UWIERZY, ŻE TO FIRMOWA STRONA. WYBIERZ INACZEJ." | Brak nazwy banku i obca końcówka `.com` sprawiają, że adres nie wygląda na wewnętrzny system Banku Bcorp.

Skutek odroczony (gdy D1 = BCORP.PL): w Etapie 4 pasek adresu fałszywej strony pokazuje `//MAIL.BCORP.PL/LOGIN` (zamiast `//MAIL.ARCHIWUMBCORP.BIZ/LOGIN`); w Etapie 6 wysłany Filipowi link to `//MAIL.BCORP.PL/LOGIN`, a Filip reaguje: „BCORP.PL? MYŚLAŁEM, ŻE MAMY .BIZ... NO DOBRA, JAK MAM SIĘ ZALOGOWAĆ?”.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: „DOMENA WYKUPIONA. TERAZ SKOPIUJĘ WYGLĄD ICH STRONY LOGOWANIA.” [SPÓJNIK]
- odblokuj: //PRZYGOTOWANIE_STRONY

---

## Etap 4: //PRZYGOTOWANIE_STRONY
Klocek: NOWA MINIGRA (klonowanie strony logowania)
Cel dydaktyczny: pokazanie, jak łatwo atakujący może skopiować wygląd oryginalnego panelu logowania, aby przechwytywać poświadczenia ofiary.
Ekrany: pusty podgląd fałszywej strony (`//MAIL.ARCHIWUMBCORP.BIZ/LOGIN`, lub `//MAIL.BCORP.PL/LOGIN` gdy D1 = `BCORP.PL`) obok oryginalnej strony (`//MAIL.BCORP.BIZ/LOGIN`, stopka `BCORP BANK © 2024` na obu panelach) → `ZAPROJEKTUJ` (szary szkielet) → `SKOPIUJ GRAFIKI` (przeniesienie 4 elementów: nagłówka z logo `BCORP SYSTEM POCZTY`, pola `LOGIN`, pola `HASŁO` i przycisku `ZALOGUJ` przeciągnięciem lub klik–klik, element pasuje tylko do swojego miejsca) → `USTAW TRYB PRZECHWYTYWANIA DANYCH` → `ŚWIETNIE!`
Oceniane: brak | Flavor (nieoceniane): klonowanie 4 elementów UI i aktywacja przechwytywania

Mostek (rozmowa do kolejnego etapu):
- GRACZ: „STRONA GOTOWA. ZOSTAŁ NUMER, Z KTÓREGO ZADZWONIĘ.” [SPÓJNIK]
- odblokuj: //PRZYGOTOWANIE_NUMERU

---

## Etap 5: //PRZYGOTOWANIE_NUMERU
Klocek: ChoiceCards
Cel dydaktyczny: nauka wykorzystania wewnętrznej numeracji firmy (Caller ID spoofing) do podszycia się pod dział IT i uśpienia czujności ofiary.
Ekrany: opis spoofingu i szablon numeracji (`891 [NR DZIAŁU] [NR PRACOWNIKA]`: SPRZEDAŻ `001`, DZIAŁ IT `002`, LOGISTYKA `003`, SUPPORT `004`) + wybór numeru
Oceniane: D2

Decyzja D2: "WYBIERZ NUMER TELEFONU, POD KTÓRY SIĘ PODSZYJESZ:"
- 891 002 162 — "Numer z puli 891 i kodem wewnętrznym 002." | ideal | Numer zgadza się z firmowym szablonem (`891`) i prefiksem działu IT (`002`), uwiarygadniając połączenie od pracownika IT.
- 891 003 427 — "Numer z puli 891 i kodem wewnętrznym 003." | suboptimal, odrzucany przez mentora (B2): "TEN NUMER NALEŻY DO LOGISTYKI, A MASZ DZWONIĆ JAKO PRACOWNIK IT. SPRAWDŹ SZABLON I WYBIERZ INACZEJ." | Numer należy do działu logistyki (`003`) zamiast IT (`002`), co przeczy przygotowanej legendzie.
- 867 452 026 — "Numer z prefiksem 867 i kodem 452." | critical | Numer spoza firmowej puli (`867` zamiast `891`) od razu budzi podejrzenia dyrektora — Filip nie ufa połączeniu i zgłasza próbę podszycia się pod IT.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: „NUMER USTAWIONY. MOGĘ DZWONIĆ DO FILIPA.” [SPÓJNIK]
- odblokuj: //ROZMOWA

---

## Etap 6: //ROZMOWA
Klocek: DialogueTree + NOWA MINIGRA (vishing w 2 fazach + przechwytywanie AiTM na żywo)
Cel dydaktyczny: pokazanie przebiegu ataku socjotechnicznego (vishing) z wykorzystaniem OSINT, presji czasu i autorytetu oraz ataku Adversary-in-the-Middle (AiTM) przejmującego login, hasło i kod SMS 2FA w czasie rzeczywistym.
Ekrany:
- **Faza 1 (rozmowa D3–D10):** ekran gotowości („MOGĘ JUŻ ZADZWONIĆ DO PRACOWNIKA. MUSZĘ UWAŻAĆ, ABY NIE POWIEDZIEĆ CZEGOŚ PODEJRZANEGO”) → rozmowa z Filipem Wójcikiem na głównym ekranie + notatki z białego wywiadu (`FILIP_WOJCIK_BIALY_WYWIAD.PDF`) stale widoczne na prawym monitorze. Brak licznika `ZAUFANIE PRACOWNIKA` — poziom zaufania widać w odpowiedziach Filipa.
- **Faza 2 (po „DAJ MI CHWILĘ”):** dwie strony logowania obok siebie na głównym ekranie (fałszywa po lewej: `//MAIL.ARCHIWUMBCORP.BIZ/LOGIN` lub `//MAIL.BCORP.PL/LOGIN`, oryginalna po prawej: `//MAIL.BCORP.BIZ/LOGIN`), rozmowa przeniesiona na prawy monitor. Gracz przenosi przechwycone dane (tym samym gestem co w Etapie 4: przeciągnięcie lub klik–klik): najpierw login `FWOJCIK67` i hasło `••••••••••••••`, potem kod SMS `48212`, klika `ZALOGUJ` → `WEJDŹ DO SYSTEMU` → pobranie `RAPORT FINANSOWY 2024` i `RAPORT FINANSOWY 2025` → `POBRAŁEŚ RAPORTY FINANSOWE BANKU BCORP`.
Oceniane: D3–D10 | Flavor (nieoceniane): przechwytywanie i przenoszenie danych logowania oraz kodu 2FA w fazie 2

### Przebieg fazy 1 (D3–D10)

- FILIP: „DZIEŃ DOBRY, FILIP WÓJCIK, BANK BCORP. W CZYM MOGĘ POMÓC?”

Decyzja D3: "DZIEŃ DOBRY, FILIP WÓJCIK, BANK BCORP. W CZYM MOGĘ POMÓC?"
- DZIEŃ DOBRY PANIE FILIPIE. | ideal | Uprzejme, formalne powitanie z użyciem właściwego imienia buduje profesjonalne pierwsze wrażenie.
- DZIEŃ DOBRY PANIE DAWIDZIE. | suboptimal | Pomylenie imienia rozmówcy z imieniem jego przełożonego od razu zdradza brak przygotowania i obniża wiarygodność.
- CZEŚĆ FILIP! | suboptimal | Poufałe „cześć” od nieznajomego, który jeszcze się nie przedstawił, brzmi nienaturalnie i budzi czujność dyrektora.
- HEJ STARY! | critical | Tak nieprofesjonalny zwrot do dyrektora banku natychmiast spalił przykrywkę — Filip rozłączył się i zgłosił podejrzany telefon do działu bezpieczeństwa.

Reakcja Filipa po D3:
- (gdy D3 = DZIEŃ DOBRY PANIE FILIPIE.): brak wtrącenia (przejście od razu do D4)
- FILIP (gdy D3 = DZIEŃ DOBRY PANIE DAWIDZIE.): „CHYBA POMYŁKA — TU FILIP WÓJCIK, DAWID JEST NA URLOPIE. Z KIM ROZMAWIAM?”
- FILIP (gdy D3 = CZEŚĆ FILIP!): „SŁUCHAM? CHYBA SIĘ NIE ZNAMY. Z KIM ROZMAWIAM?”

Decyzja D4: "PRZEDSTAW SIĘ ROZMÓWCY:"
- TU MICHAŁ, MICHAŁ MITNIK | ideal | Poprawne imię i nazwisko nowego pracownika IT zgadzają się z białym wywiadem i wytrzymują ewentualną weryfikację.
- NAZYWAM SIĘ MICHAŁ WITNIK | suboptimal | Przekręcenie nazwiska pracownika, pod którego się podszywasz, osłabia wiarygodność przy ewentualnym sprawdzeniu w firmowej książce adresowej.
- TU MARCIN, MARCIN MITNIK | suboptimal | Błędne imię pracownika IT nie zgadza się z białym wywiadem i zwiększa ryzyko weryfikacji tożsamości.
- MARCIN RYBNIK Z TWOJEJ FIRMY | critical | Zmyślone nazwisko i nienaturalny zwrot „z twojej firmy” od razu zdradzają osobę spoza organizacji — Filip rozłącza się i zgłasza incydent.

Reakcja Filipa po D4:
- FILIP (gdy D4 = TU MICHAŁ, MICHAŁ MITNIK): „O CO CHODZI?”
- FILIP (gdy D4 = NAZYWAM SIĘ MICHAŁ WITNIK): „WITNIK? NIE KOJARZĘ, ALE OK — O CO CHODZI?”
- FILIP (gdy D4 = TU MARCIN, MARCIN MITNIK): „MARCIN MITNIK? NIE KOJARZĘ... O CO CHODZI?”

Decyzja D5: "O CO CHODZI?"
- PRACUJĘ W DZIALE IT | ideal | Dział IT zgadza się z wybranym numerem telefonu (`002`), białym wywiadem i pretekstem testów systemu archiwizacji poczty.
- PRACUJĘ W DZIALE SPRZEDAŻY | critical | Filip sam kieruje działem sprzedaży, więc podanie się za pracownika tego działu natychmiast zdemaskowało fałszywego rozmówcę.
- PRACUJĘ W DZIALE LOGISTYKI | suboptimal, odrzucany przez mentora (B2): "LOGISTYKA NIE TESTUJE SYSTEMU POCZTOWEGO I NIE PASUJE DO NUMERU, Z KTÓREGO DZWONISZ. WYBIERZ INACZEJ." | Dział logistyki nie pasuje ani do sfałszowanego numeru telefonu, ani do pretekstu testów systemu archiwizacji poczty.
- PRACUJĘ W DZIALE WSPARCIA KLIENTA | suboptimal, odrzucany przez mentora (B2): "WSPARCIE KLIENTA NIE WDRAŻA ARCHIWIZACJI POCZTY I NIE PASUJE DO WYBRANEGO NUMERU. WYBIERZ INACZEJ." | Dział wsparcia klienta nie zajmuje się testowaniem systemów pocztowych i jest sprzeczny z wybranym numerem telefonu.

- GRACZ: „TESTUJEMY WŁAŚNIE NOWY SYSTEM ARCHIWIZACJI POCZTY. MASZ MOŻE 5 MINUT?”
- FILIP: „ZA CHWILĘ MAM SPOTKANIE. MOŻE PÓŹNIEJ?”

Decyzja D6: "ZA CHWILĘ MAM SPOTKANIE. MOŻE PÓŹNIEJ?"
- PRZEPRASZAM, ALE TO PILNE. MUSIMY SKOŃCZYĆ TO DZISIAJ MAKSYMALNIE DO KOŃCA DNIA | ideal | Uprzejma presja czasu („pilne, do końca dnia”) skłania ofiarę do szybkiego działania bez dokładnego sprawdzania szczegółów.
- NUDZI MI SIĘ, NIE BĄDŹ TAKI... | critical | Niepoważny ton wobec zabieganego dyrektora natychmiast spala przykrywkę — Filip rozłącza się i zgłasza incydent.
- TO PILNE. MAM PROBLEM Z TRUDNYM KLIENTEM, MUSISZ MI POMÓC | suboptimal | Zmiana pretekstu na „trudnego klienta” przeczy wcześniejszej informacji o testach poczty i osłabia spójność historii.
- PRZEPRASZAM, ALE TO PILNE. POTRZEBUJĘ RAPORTÓW FINANSOWYCH KTÓRE MASZ NA POCZCIE | critical | Prośba pracownika IT o poufne raporty finansowe ze skrzynki dyrektora natychmiast zdradza prawdziwy cel ataku — Filip rozłącza się i zgłasza incydent.

Reakcja Filipa po D6:
- FILIP (gdy D6 = ideal): „MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...”
- FILIP (gdy D6 = TO PILNE. MAM PROBLEM Z TRUDNYM KLIENTEM...): „KLIENTEM? MYŚLAŁEM, ŻE CHODZI O TESTY POCZTY... ZRESZTĄ MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH...”

Decyzja D7: "MÓJ PRZEŁOŻONY NIE WSPOMINAŁ NIC O ŻADNYM NOWYM SYSTEMIE ANI TESTACH..."
- Z TEGO CO WIEM, TO DAWID JEST NA URLOPIE. MOŻESZ ZAPYTAĆ SANDRĘ, KTÓRA DAŁA MI TAK KRÓTKI DEADLINE | ideal | Połączenie faktu o urlopie Dawida z powołaniem się na autorytet Sandry (szefowej IT) skutecznie rozbraja wątpliwości ofiary.
- PAN DAWID WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ | suboptimal | Powołanie się na przełożonego przebywającego na urlopie utrudnia weryfikację, ale słabiej uwiarygadnia prośbę niż wskazanie obecnej w firmie szefowej IT (Sandry).
- TWÓJ PRZEŁOŻONY MA PRZECIEŻ WOLNE, DLATEGO NIC NIE WIESZ | suboptimal | Informacja o urlopie przełożonego jest trafna, ale lekceważący ton i brak powołania się na osobę decyzyjną (Sandrę) obniżają zaufanie rozmówcy.
- DAREK WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ | suboptimal | Błędne imię przełożonego i powołanie się na rozmowę z nim w czasie urlopu mocno podważają wiarygodność.

Reakcja Filipa po D7:
- (gdy D7 = ideal): brak wtrącenia (przejście od razu do D8)
- FILIP (gdy D7 = PAN DAWID WSPOMNIAŁ...): „DAWID JEST TERAZ NA URLOPIE, NIE MAM JAK GO ZAPYTAĆ... DZIWNE, ŻE NIC MI WCZEŚNIEJ NIE MÓWIŁ.”
- FILIP (gdy D7 = TWÓJ PRZEŁOŻONY MA PRZECIEŻ WOLNE...): „WIEM, ŻE JEST NA URLOPIE, ALE TO NIE ZNACZY, ŻE MOGĘ WIERZYĆ NA SŁOWO...”
- FILIP (gdy D7 = DAREK WSPOMNIAŁ...): „DAREK? CHYBA DAWID — I ON JEST NA URLOPIE. NIE BRZMI TO PRZEKONUJĄCO...”

Decyzja D8: "DOMKNIJ PERSWAZJĘ:"
- SZCZERZE MÓWIĄC, ZOSTAŁEŚ MI TYLKO TY DO PRZETESTOWANIA. TO NAPRAWDĘ WAŻNE DLA BEZPIECZEŃSTWA FIRMY | ideal | Połączenie społecznego dowodu słuszności („zostałeś mi tylko ty”) z troską o bezpieczeństwo firmy skutecznie przełamuje opór ofiary.
- TO NIE ZAJMIE DŁUGO, WIĘC NIE MUSISZ SIĘ ZASTANAWIAĆ | suboptimal | Otwarte zniechęcanie rozmówcy do zastanowienia się brzmi natrętnie i może wzbudzić podejrzenia u ostrożniejszej ofiary.
- ZRESZTĄ CZEMU MIAŁBYŚ MI NIE POMÓC? BĄDŹ CZŁOWIEKIEM... | suboptimal | Emocjonalny, nieprofesjonalny ton zamiast argumentu o bezpieczeństwie firmy obniża wiarygodność pracownika IT.

Reakcja Filipa po D8:
- FILIP (gdy D8 = ideal): „OK, JEŚLI TAK TO WYGLĄDA, CO MAM ROBIĆ?”
- FILIP (gdy D8 = TO NIE ZAJMIE DŁUGO...): „NIE LUBIĘ TAKIEGO POŚPIECHU, ALE DOBRA — JEŚLI TO CHWILA, CO MAM ROBIĆ?”
- FILIP (gdy D8 = ZRESZTĄ CZEMU MIAŁBYŚ MI NIE POMÓC...): „ECH, NIE MAM CZASU NA DYSKUSJE. MÓW SZYBKO, CO MAM ROBIĆ?”

Decyzja D9: "POWIEDZ FILIPOWI, CO MA ZROBIĆ:"
- ZALOGUJ SIĘ NA NASZĄ NOWĄ STRONĘ ARCHIWIZACJI POCZTY | ideal | Jasne, służbowe polecenie spójne z całym pretekstem testów systemu archiwizacji.
- PODAM CI LINK DO MOJEGO SYSTEMU POCZTY | suboptimal | Określenie systemu jako „mojego” zamiast firmowego budzi wątpliwości co do oficjalnego charakteru testów.
- PODAJĘ CI NOWĄ EKSTRA WERSJĘ POCZTY | suboptimal | Potoczne, reklamowe określenie „nowa ekstra wersja” nie pasuje do komunikacji działu IT i obniża wiarygodność.
- WYSYŁAM CI TĘ PODSTAWIONĄ STRONĘ | critical | Nazwanie strony wprost „podstawioną” natychmiast zdradza próbę phishingu — Filip rozłącza się i zgłasza incydent do działu bezpieczeństwa.

Reakcja Filipa po D9 i wysłanie linku:
- FILIP (gdy D9 = PODAM CI LINK DO MOJEGO SYSTEMU POCZTY): „TWOJEGO? CHYBA FIRMOWEGO... NO DOBRA, WYŚLIJ TEN LINK.”
- FILIP (gdy D9 = PODAJĘ CI NOWĄ EKSTRA WERSJĘ POCZTY): „„EKSTRA WERSJĘ”? BRZMI TROCHĘ NIEPOWAŻNIE, ALE WYŚLIJ LINK — ZOBACZĘ.”
- GRACZ: `LINK` → na czacie pojawia się `//MAIL.ARCHIWUMBCORP.BIZ/LOGIN` *(gdy D1 = `BCORP.PL`: `//MAIL.BCORP.PL/LOGIN`)*
- FILIP (gdy D1 = `ARCHIWUMBCORP.BIZ`): „OK, MAM. JAK MAM SIĘ ZALOGOWAĆ?”
- FILIP (gdy D1 = `BCORP.PL`): „BCORP.PL? MYŚLAŁEM, ŻE MAMY .BIZ... NO DOBRA, JAK MAM SIĘ ZALOGOWAĆ?”

Decyzja D10: "WYJAŚNIJ FILIPOWI, JAK MA SIĘ ZALOGOWAĆ:"
- SPRAWDZAMY CZY NOWY SYSTEM JEST SPÓJNY Z POPRZEDNIM. UŻYJ DANYCH ZE SWOJEJ POCZTY FIRMOWEJ | ideal | Wiarygodne, techniczne uzasadnienie („test spójności”) skłania ofiarę do wpisania prawdziwych danych logowania na fałszywej stronie.
- TYLKO TY ZNASZ DANE DO LOGOWANIA DO SWOJEJ POCZTY. DO NOWEGO ARCHIWUM UŻYWAJ TYCH SAMYCH DANYCH | suboptimal | Brak technicznego uzasadnienia, dlaczego trzeba podać dane z poczty firmowej, jest mniej przekonujący niż powołanie się na test spójności systemów.
- ZALOGUJ SIĘ JAK DO MAILA, BYLE SZYBKO | suboptimal | Agresywne poganianie ofiary w momencie wpisywania hasła to wyraźna czerwona flaga socjotechniczna, która obniża zaufanie.

Reakcja Filipa po D10 (przejście do fazy 2):
- FILIP (gdy D10 = ideal): „OK, DAJ MI CHWILĘ”
- FILIP (gdy D10 = TYLKO TY ZNASZ...): „ROZUMIEM, ALE WOLAŁBYM WIEDZIEĆ, CZEMU MAM PODAWAĆ FIRMOWE HASŁO... DOBRA, DAJ MI CHWILĘ.”
- FILIP (gdy D10 = ZALOGUJ SIĘ JAK DO MAILA, BYLE SZYBKO): „NIE POGANIAJ MNIE, TO MOJE HASŁO FIRMOWE... NO DOBRA, DAJ MI CHWILĘ.”

### Przebieg fazy 2 (przechwytywanie AiTM na żywo — bez ocenianych decyzji)
1. Na fałszywej stronie pojawiają się wpisane przez Filipa dane: login `FWOJCIK67` i hasło `••••••••••••••`. Gracz przenosi oba pola do oryginalnego panelu `//MAIL.BCORP.BIZ/LOGIN` i klika `ZALOGUJ`.
2. Oryginalny system żąda kodu 2FA (`PODAJ KOD SMS:`).
3. Rozmowa na prawym monitorze (po jednej opcji gracza):
   - FILIP: „W SYSTEMIE NIC NIE MA. CZY TAK POWINNO BYĆ?”
   - GRACZ: „TO NOWA WERSJA, DANE BĘDZIEMY PRZENOSIĆ W PRZYSZŁYM TYGODNIU. NA RAZIE CHCEMY PRZETESTOWAĆ, CZY WSZYSTKO DZIAŁA”
   - FILIP: „ROZUMIEM, COŚ JESZCZE? NAPRAWDĘ MUSZĘ JUŻ KOŃCZYĆ”
   - GRACZ: „MUSIMY JESZCZE PRZETESTOWAĆ UWIERZYTELNIANIE DWUSKŁADNIKOWE”
   - FILIP: „CZYLI?”
   - GRACZ: „ZA MOMENT DOSTANIESZ KOD 2FA, WPISZ GO W POLE NA EKRANIE LOGOWANIA”
   - FILIP: „COŚ PRZYSZŁO, JUŻ WPISUJĘ”
4. Na fałszywej stronie pojawia się kod `48212`. Gracz przenosi go do pola `KOD` w oryginalnym panelu i klika `ZALOGUJ` → `WEJDŹ DO SYSTEMU`.
5. Zakończenie rozmowy:
   - FILIP: „CZY TO WSZYSTKO?”
   - GRACZ: „TAK, DZIĘKI WIELKIE! URATOWAŁEŚ MI SKÓRĘ, MIŁEGO DNIA!”
   - FILIP: „DOBRA, NA RAZIE” *(status: `ROZŁĄCZONO`)*
6. Na ekranie poczty pobierają się `RAPORT FINANSOWY 2024` i `RAPORT FINANSOWY 2025`, pojawia się potwierdzenie `POBRAŁEŚ RAPORTY FINANSOWE BANKU BCORP`.

### Mostek końcowy (rozmowa z BYTE_MASTER po zakończeniu Etapu 6)

Wariant 1 (wszystko idealnie, 100%, bez odrzuceń):
- GRACZ: „MAM RAPORTY FINANSOWE BANKU BCORP Z 2024 I 2025 ROKU. FILIP NAWET NIE ZORIENTOWAŁ SIĘ, ŻE JEGO HASŁO I KOD SMS TRAFIŁY DO NAS.”
- BM: „CZYSTA ROBOTA. ZERO WPADEK, ZERO WĄTPLIWOŚCI. Z TAKIMI RAPORTAMI W KOŃCU ZOBACZYMY, KTO FINANSUJE TĘ RAFINERIĘ. BĘDĄ Z CIEBIE LUDZIE.”

Wariant 2 (słabiej, ale wynik ≥ 70%):
- GRACZ: „MAM RAPORTY FINANSOWE BANKU BCORP Z 2024 I 2025 ROKU, CHOĆ PO DRODZE BYŁO NERWOWO.”
- BM: „WAŻNE, ŻE RAPORTY SĄ U NAS, ALE NIE OBYŁO SIĘ BEZ WPADEK. NASTĘPNYM RAZEM PILNUJ SZCZEGÓŁÓW.”

Wariant 3 (wynik < 70%):
- GRACZ: „RAPORTY POBRANE, ALE PO DRODZE BYŁO SPORO WPADEK.”
- BM: „TYM RAZEM SIĘ UDAŁO TYLKO DLATEGO, ŻE FILIP MIAŁ SPOTKANIE. ZA DUŻO BŁĘDÓW JAK NA JEDNĄ ROZMOWĘ — PRZEJRZYJ RAPORT I POPRAW TO.”

- odblokuj: //RAPORT POOPERACYJNY

---

## Debrief

Lekcje przy decyzjach (rozwijane w raporcie pooperacyjnym; oparte na ścieżce idealnej oraz wskazówkach obronnych z VR; obrony w układzie „Sygnały / Co zrobić” jak w M1–M4 — QA R1-03, akceptacja właściciela 27.11.2026):

D1:
- Atak: Domena z doklejonym słowem (combosquatting): archiwumbcorp.biz łączy nazwę firmy, tę samą końcówkę .biz i słowo „archiwum”. Na pierwszy rzut oka wygląda jak firmowy adres banku.
- Obrona: Sygnały: nazwa firmy sklejona z innym słowem (archiwumbcorp zamiast bcorp) albo inna końcówka (.pl zamiast .biz). Co zrobić: czytaj adres od końca, bo liczy się nazwa tuż przed końcówką. W mail.bcorp.biz to „bcorp”, a w mail.archiwumbcorp.biz to „archiwumbcorp”, czyli zupełnie inny właściciel. Kłódka w pasku tego nie rozstrzyga, bo fałszywe strony też ją mają. Podejrzany adres zgłoś do IT.

D2:
- Atak: Podszywanie się pod numer (spoofing) pozwala wyświetlić na telefonie ofiary numer, który wygląda na firmowy. Tu jest to numer działu IT (891 002 162). Ofiara rozpoznaje znajomy prefiks i odruchowo obniża czujność.
- Obrona: Sygnały: telefon z „firmowego” numeru, a rozmówca prosi o logowanie albo dane. Co zrobić: pamiętaj, że numer na ekranie da się podrobić. Rozłącz się i oddzwoń na numer z firmowej książki adresowej lub intranetu, a nie na ten, który się wyświetlił, ani na ten, który poda rozmówca.

D3:
- Atak: Uprzejmy, formalny ton i poprawne imię rozmówcy budują od pierwszych sekund wrażenie zwykłego, służbowego połączenia wewnątrz firmy.
- Obrona: Sygnały: dzwoni „IT”, choć niczego nie zgłaszałeś, i od razu zwraca się do Ciebie po imieniu. Co zrobić: uprzejmość i znajomość Twojego imienia niczego nie dowodzą, bo takie dane są w sieci. Zapytaj o numer zgłoszenia i powiedz, że oddzwonisz przez helpdesk. Prawdziwy pracownik IT się na to zgodzi.

D4:
- Atak: Podszycie się pod prawdziwego, niedawno zatrudnionego pracownika (Michała Mitnika z białego wywiadu) tłumaczy, dlaczego ofiara nie rozpoznaje głosu ani nazwiska rozmówcy.
- Obrona: Sygnały: dzwoni ktoś, kogo nie znasz, choć przedstawia się nazwiskiem pracownika firmy; coś w nazwisku Ci nie pasuje. Co zrobić: nazwisko w książce adresowej nie potwierdza, kto naprawdę dzwoni, bo oszust podszywa się właśnie pod prawdziwą osobę. Rozłącz się i oddzwoń na numer tej osoby z książki albo napisz do niej przez firmowy komunikator. Gdy coś nie pasuje, nie zgadzaj się dla świętego spokoju, tylko przerwij i sprawdź.

D5:
- Atak: Powołanie się na dział IT spójny z numerem telefonu i pretekstem „testów systemu” nadaje prośbie pozory rutynowej procedury technicznej.
- Obrona: Sygnały: „IT” dzwoni bez zapowiedzi i prosi o logowanie na nowej stronie. Co zrobić: IT nigdy nie prosi o hasło ani kod, a prace techniczne zapowiada wcześniej oficjalnymi kanałami. Odmów, rozłącz się i zgłoś próbę przez helpdesk. Zgłoś ją także wtedy, gdy nic nie podałeś, bo oszust zadzwoni do kolejnej osoby.

D6:
- Atak: Presja czasu („pilne, musimy skończyć dzisiaj”) ma odciąć ofiarę od spokojnej analizy. Atakujący celowo dzwoni, gdy ofiara się spieszy, tu tuż przed spotkaniem.
- Obrona: Sygnały: rozmówca naciska („pilne”, „do końca dnia”), a Ty właśnie się spieszysz. Co zrobić: pośpiech to jeden z najczęstszych sygnałów oszustwa telefonicznego (vishingu). Powiedz „oddzwonię po spotkaniu przez helpdesk” i sprawdź sprawę na spokojnie.

D7:
- Atak: Atakujący wie z białego wywiadu, że przełożony jest na urlopie, więc nie da się go zapytać. Dorzuca „możesz zapytać Sandrę”: propozycja sprawdzenia brzmi uczciwie, a on liczy, że nikt tego nie zrobi.
- Obrona: Sygnały: rozmówca powołuje się na kogoś, kogo nie da się teraz zapytać, albo sam proponuje „zapytaj X”. Co zrobić: zrób to. Zadzwoń do tej osoby na numer z książki adresowej, a gdy jej nie ma, do jej zastępcy albo na helpdesk, zanim cokolwiek wpiszesz. Nie publikuj w sieci informacji o urlopach i strukturze zespołu.

D8:
- Atak: Gra na poczuciu obowiązku („zostałeś mi tylko ty”, „to ważne dla bezpieczeństwa firmy”) wywołuje poczucie winy i chęć szybkiego „odhaczenia” sprawy.
- Obrona: Sygnały: rozmówca przekonuje, że tylko Ty zostałeś, albo zasłania się bezpieczeństwem firmy. Co zrobić: odpowiedz „sprawdzę to i oddzwonię”. Prawdziwy pracownik IT to zaakceptuje, a dalszy nacisk to sygnał ataku.

D9:
- Atak: Link wysłany w trakcie rozmowy i nazwany „nową stroną archiwizacji” prowadzi ofiarę prosto na skopiowany panel logowania, bez czasu na sprawdzenie adresu.
- Obrona: Sygnały: link do logowania dostajesz w trakcie nieoczekiwanego telefonu, a rozmówca prosi, żebyś zalogował się na „nową stronę”. Co zrobić: nie oceniaj strony po wyglądzie, bo kopię robi się w kilka minut i wygląda identycznie. Nie loguj się z linku od rozmówcy. Wejdź na pocztę z własnej zakładki albo wpisz adres sam, a link zgłoś do IT.

D10:
- Atak: Atak „pośrednika” (Adversary-in-the-Middle): fałszywa strona na bieżąco przekazuje wpisane hasło i kod SMS do prawdziwej poczty, więc atakujący loguje się mimo logowania dwuetapowego (2FA).
- Obrona: Sygnały: kod SMS przychodzi zaraz po logowaniu z linku od rozmówcy; ktoś prosi, żebyś wpisał lub podał kod; po zalogowaniu skrzynka jest pusta. Co zrobić: kod wpisuj tylko na stronie, którą sam otworzyłeś, i nigdy nikomu go nie podawaj, bo IT go nie potrzebuje. Jeśli już wpisałeś hasło lub kod na podejrzanej stronie, od razu zmień hasło (z własnej zakładki) i zgłoś to do IT. Logowanie dwuetapowe dalej warto mieć, bo mocno chroni konto, choć kod SMS da się wyłudzić.

---

## Odchylenia od VR
- `[ZMIANA WZGLĘDEM VR]` **Etap 1 (`FILIP_WOJCIK_BIALY_WYWIAD.PDF`)**: dokument do przeczytania bez quizu; przycisk `POTWIERDZAM PRZECZYTANIE` odblokowuje `//VPN`; zamknięcie krzyżykiem X etapu nie kończy (świadome odstępstwo od zasady „zero-clicker”, zgodne z VR).
- `[ZMIANA WZGLĘDEM VR]` **Etap 4 (`PRZYGOTOWANIE STRONY`)**: adaptacja na mysz — 4 elementy kopiowane przeciągnięciem lub klik–klik (mechanizm z M1), każdy element pasuje tylko do swojego miejsca, bez oceny. Stopka na fałszywej stronie wszędzie spójna: `BCORP BANK © 2024` (usunięty błąd z VR `LEPRECHAUN BANK © 2022`).
- `[ZMIANA WZGLĘDEM VR]` **Etap 6 (`//ROZMOWA`) — układ w 2 fazach**: faza 1 to rozmowa na głównym ekranie + notatki z białego wywiadu na prawym monitorze (D3–D7 sprawdzają uważne czytanie); faza 2 po „DAJ MI CHWILĘ” to dwie strony logowania na głównym ekranie + rozmowa na prawym monitorze; dane przenoszone tym samym gestem co w Etapie 4.
- `[ZMIANA WZGLĘDEM VR]` **Etap 6 — brak licznika `ZAUFANIE PRACOWNIKA`**: zamiast paska liczbowego poziom zaufania widać w odpowiedziach Filipa.
- `[ZMIANA WZGLĘDEM VR]` **D2 (`PRZYGOTOWANIE NUMERU TELEFONU`)**: dodane neutralne pytanie na ekranie `WYBIERZ NUMER TELEFONU, POD KTÓRY SIĘ PODSZYJESZ:` (w VR sam opis zadania).
- `[ZMIANA WZGLĘDEM VR]` **D7**: opcja `PAN DAMIAN WSPOMNIAŁ...` zmieniona na `PAN DAWID WSPOMNIAŁ, ŻE TAK PROSTEJ CZYNNOŚCI NIE MUSI ZATWIERDZAĆ` (jako druga sensowna, suboptymalna opcja powołująca się na przełożonego na urlopie).
- `[ZMIANA WZGLĘDEM VR]` **Nagroda i licznik**: przyjęto `3.14 BTC` (z ekranu podsumowania VR, zamiast `2.96 BTC` z karty startowej); pominięto licznik certyfikatu `6/10` i saldo portfela (poza zakresem silnika).
- `[ZMIANA WZGLĘDEM VR]` **Etap 2 (`//VPN`)**: przycisk VR `DOPASUJ W AI` ma w klocku silnika `VpnRouter` etykietę `ASYSTENT AI` (wspólna dla wszystkich misji).
- `[ZMIANA WZGLĘDEM VR]` **Nazwy kafelków**: `//PRZYGOTOWANIE_DOMENY`, `//PRZYGOTOWANIE_STRONY`, `//PRZYGOTOWANIE_NUMERU` (w VR: `PRZYGOTOWANIE DOMENY / STRONY / NUMERU TELEFONU`).
- `[ZMIANA WZGLĘDEM VR]` **D2**: opis zadania z VR („…MUSISZ WYBRAĆ IDENTYCZNY, BY OFIARA NIE MIAŁA SZANS SIĘ ZORIENTOWAĆ…”) zastąpiony neutralnym `KORZYSTAJĄC ZE SPOOFINGU PODSZYJESZ SIĘ POD FIRMOWY NUMER TELEFONU.` plus karta z szablonem numeracji.
- `[ZMIANA WZGLĘDEM VR]` **D4 i D8**: w VR rozmówca nic nie mówi przed tymi decyzjami; dodane neutralne pytania `PRZEDSTAW SIĘ ROZMÓWCY:` i `DOMKNIJ PERSWAZJĘ:`.
- `[ZMIANA WZGLĘDEM VR]` **D9 i D10** (QA R1-06, decyzja właściciela 27.11.2026): pytanie nad opcjami i w raporcie jest neutralne (`POWIEDZ FILIPOWI, CO MA ZROBIĆ:`, `WYJAŚNIJ FILIPOWI, JAK MA SIĘ ZALOGOWAĆ:`), bo kwestia Filipa przed tymi decyzjami zmienia się z wariantem (reakcje po D8 i po D1). Kwestia Filipa zostaje w dymku rozmowy.
- `[ZMIANA WZGLĘDEM VR]` **Kolejność opcji**: w scenariuszu opcja idealna jest pierwsza; w grze opcje są tasowane (`ChoiceCards`, `VishingApp`), więc kolejność z VR nie ma znaczenia.
- `[ZMIANA WZGLĘDEM VR]` **Faza 2 etapu 6**: w VR po pierwszym `ZALOGUJ` jest komunikat „OTRZYMANO DANE I UŻYTO ICH DO ZALOGOWANIA SIĘ W ORYGINALNYM SYSTEMIE MAILOWYM” i `WEJDŹ DO SYSTEMU`, a pole kodu SMS jest na fałszywej stronie. W grze oryginalny panel żąda kodu (`PODAJ KOD SMS:`), kod jest przenoszony z fałszywej strony tak jak login i hasło, a `WEJDŹ DO SYSTEMU` pojawia się po drugim `ZALOGUJ`. Raporty pobiera gracz przyciskami `POBIERZ`, które aktywują się po zakończeniu rozmowy (`ROZŁĄCZONO`).
- `[ZMIANA WZGLĘDEM VR]` **Mostki etapów 1–5**: VR milczy na tych granicach; dodane krótkie kwestie gracza oznaczone `[SPÓJNIK]` (QA R1-04, decyzja właściciela 27.11.2026).
- `[ZMIANA WZGLĘDEM VR]` **Drobne teksty (QA R1-20, R1-21, R1-23, decyzja właściciela 27.11.2026)**: raporty `RAPORT FINANSOWY 2024` i `2025` (w VR 2021 i 2022 — nie pasowały do daty 19.05.2026); `MOŻESZ ZAPYTAĆ SANDRĘ` (w VR „SANDRY”); Filip przedstawia się „BANK BCORP” (w VR „BCORP BANK”; stopka stron logowania zostaje `BCORP BANK © 2024`); intro „JEDEN Z DYREKTORÓW”, „POPROSZĘ DYREKTORA BANKU” (w VR „MENEDŻER”); kafelek `//ROZMOWA` w kolorze `#ef4444` (w kodzie wcześniej ten sam kolor co czat).
- `[ZMIANA WZGLĘDEM VR]` **Opisy kart D1 i D2**: teksty pod etykietami kart (`— "…"`) dodane w implementacji; właściciel zostawił je bez zmian (QA R1-16).
- `[ZMIANA WZGLĘDEM VR]` **Mostek końcowy**: dodane 3 warianty końcowej rozmowy z BYTE_MASTEREM (100% bez odrzuceń / ≥ 70% / < 70%), zgodnie ze standardem misji 2+.
