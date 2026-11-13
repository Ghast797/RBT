# Audyt złych wyborów — postęp poprawek

Ten plik prowadzi **bieżący stan** poprawek z audytu złych wyborów w M1–M4.
Treść ustaleń (gdzie, jak odtworzyć, co widzi gracz, propozycja) jest w
[`audyt-zle-wybory.html`](audyt-zle-wybory.html) i tam się jej nie powtarza.

| Plik | Rola | Kto edytuje |
|---|---|---|
| `audyt-zle-wybory.html` | Zamrożony zapis audytu z 13.11.2026, stan kodu na commicie `5814fd8`. Numery linii dotyczą tego commita. | Nikt. Tylko do odczytu. |
| `audyt-zle-wybory-postep.md` (ten plik) | Kolejność prac, statusy, decyzje właściciela, nowe ustalenia. | Agent po każdej poprawce. |

### Commity po audycie, sprawdzone pod kątem ustaleń

| Commit | Co zmienia | Wpływ na ustalenia |
|---|---|---|
| `1ae5dca` | Grafiki M2 (formularze) i M3 (pracownicy, imprezy, wirusy, tapeta RAT, koperta); w M3 `PendriveApp` ekran podpisu z poziomą kopertą i podpisem na niej | Brak. Poziomy i logika D4 bez zmian (M3-06, M3-11 dalej otwarte). |

Agent, który zaczyna pracę po przerwie, dopisuje tu commity spoza poprawek audytu, które dotykają `stages.ts`, danych misji, minigier albo silnika.

## Zasady dla agenta

1. **Szczegóły ustalenia:** wyszukaj w HTML tekst `id:"M3-04"` (z cudzysłowem). Pola obiektu:
   `t` tytuł, `w` gdzie (plik:linia na `5814fd8`), `r` jak odtworzyć, `s` co widzi gracz, `f` propozycja.
   Numery linii mogły się przesunąć — szukaj po nazwie funkcji, etapu albo tekstu z pola `w`.
2. **Najpierw ten plik, potem HTML.** Jeśli w kolumnie *Notatka* jest decyzja albo zmiana planu, ma pierwszeństwo przed propozycją z HTML.
3. **Nie edytuj HTML.** Gdy poprawka idzie inaczej niż w propozycji, opisz to w *Notatce*.
4. **Po poprawce** zmień *Status*, wpisz skrót commita w kolumnie *Commit*, uruchom `npm test`. Gdy zmiana dotyka misji, sprawdź ją w przeglądarce (`?mission=X&dev=1`) na ścieżce ze złym wyborem, nie tylko idealnej.
5. **Ustalenia `czeka na właściciela`** nie ruszaj, dopóki decyzja w sekcji *Decyzje właściciela* nie ma wpisanej odpowiedzi.
6. **Nowe ustalenie** znalezione podczas poprawek dopisz w sekcji *Nowe ustalenia* z kolejnym ID (`NEW-01`, `NEW-02`…), pełnym opisem i paczką.
7. Zasady projektu (AGENTS.md, `scenario-engine.md`, `mission-standard.md`) obowiązują dalej: zmiany w silniku jako wspólne mechanizmy, bez gałęzi per misja.

**Statusy:** `otwarte` · `w toku` · `zrobione` · `odrzucone` (w *Notatce* dlaczego) · `czeka na właściciela`
**Waga:** W wysoka · S średnia · N niska
**Narzędzie** (sekcja 2 HTML): B1 twarda blokada (critical) · B2 miękka blokada (mentor odrzuca, `option.reject`) · A gra idzie za wyborem · C poprawka / tekst

## Kolejność prac

Paczki idą po kolei; w obrębie paczki kolejność dowolna. P3 jest warunkiem dla P4 i dla wariantów B2 w P2.

| Paczka | Zakres | Zależy od |
|---|---|---|
| P1 | Błędy silnika bez decyzji projektowych | — |
| P2 | Zmiana poziomów opcji (tabela z sekcji 3 HTML) + własny tytuł porażki | ENG-15 na początku paczki |
| P3 | Pamięć wyborów w silniku i treść, która idzie za graczem | P1 |
| P4 | Konsekwencje odroczone per misja | P3, decyzja D-01 |
| P5 | Teksty i drobne | — (można równolegle) |
| P6 | SCORM w prawdziwym Moodle | test na instancji Moodle |

### P1 — błędy silnika

| ID | Waga | Krótko | Status | Commit | Notatka |
|---|---|---|---|---|---|
| ENG-01 | W | Po „OD POCZĄTKU” wynik nie zapisuje się w Moodle | zrobione | 477f811 | initialize() idempotentne, błąd 103 = połączenie, mock strict. Nieobsłużone: ponowne Initialize po Terminate (NEW-01). |
| ENG-02 | W | Raport: ZALICZONO od 70, SCORM failed poniżej passingScore | zrobione | 477f811, 571077f | Próg 70% we wszystkich misjach; modal, pasek, SCORM i xAPI przez scormStatus. Status liczony z wyniku wyświetlanego (69,6% = „70%” = zaliczone). |
| ENG-03 | W | „TYLKO NAJLEPSZY WYNIK ZOSTANIE ZAPISANY” — nieprawda | zrobione | 477f811 | Zapis tylko gdy wynik ≥ najlepszego (z LMS i z sesji); gorszy wynik zapisuje tylko completion i czas. |
| ENG-05 | S | Reakcja mentora na odpowiedź w intrze się nie wyświetla | zrobione | 9027b2c | mentorReaction jako dymek w intrze; introReplies zachowane przy „BEZ INTRO”. Sprawdzone w przeglądarce (M1 node_7). |
| ENG-06 | S | Ponowne zgłoszenie decyzji psuje punktację | zrobione | fca0c9e | Pierwsze zgłoszenie numeru wygrywa; wynik, liczniki i BTC wyliczane z decisionTiers. |
| ENG-08 | S | Timery DialogueTree przeżywają powtórkę | zrobione | a2052f5 | Timery w createTimerBag + AppRenderer ignoruje callbacki z poprzedniego appRunId (chroni wszystkie klocki). |
| ENG-11 | N | Wynik z długimi ułamkami w UI i SCORM | zrobione | 477f811 | SCORM: 2 miejsca po przecinku; UI: liczby całkowite. |
| ENG-12 | N | completeStage nadpisuje trwający mostek | odrzucone | | Właściciel: występuje tylko w trybie dev, nie poprawiać. |
| ENG-14 | N | `?dev=1` znika po powtórce | odrzucone | | Właściciel: bez znaczenia, zostawić. |
| M1-02 | W | WRÓĆ w poczcie zgłasza D3 drugi raz | zrobione | 6816f1b | WRÓĆ usunięty z ekranu adresu (D4). Sprawdzone w przeglądarce. |
| M3-10 | S | Wynik z ułamkami i fałszywe „najlepszy wynik” | zrobione | 477f811 | Zamknięte przez ENG-03 i ENG-11. |

### P2 — zmiana poziomów

| ID | Waga | Krótko | Status | Commit | Notatka |
|---|---|---|---|---|---|
| ENG-15 | S | Każdy critical ma tytuł „ZOSTAŁEŚ WYKRYTY!” | w toku |  | Właściciel: tytuł porażki dopasowany do kontekstu opcji (failTitle), domyślnie „ZOSTAŁEŚ WYKRYTY!”. |
| M1-06 | S | Muffin: pełne punkty za przynętę, której ofiara nie szukała | w toku |  | Właściciel: najlepsza opcja zależy od poprzedniego wyboru — na stronie z muffinkami ideal to poradnik o muffinkach (już tak jest). Poziomów nie zmieniać; poprawić tylko feedback, by nie przeczył D1. |
| M2-02 | W | D4 KEYLOGGER, a gra buduje robaka i botnet | w toku |  | D-04: B2 — mentor odrzuca KEYLOGGER, kara zostaje, gracz wybiera ponownie. |
| M2-03 | W | D1 SZKOLENIE IT, a reszta zakłada wirusa 0-day | w toku |  | D-03: usunąć D1 z M2 (przenumerować decyzje, raport, testy). Znika też M2-07. |
| M2-04 | S | Suboptimal, które według opisu nie realizują celu | otwarte | | |
| M3-01 | W | D2 kobieta jako cel, a 4 etapy mówią o Mateuszu | w toku |  | Wiktoria, Agnieszka → B2 (mentor odrzuca: zbyt ostrożne), zamiast critical. |
| M3-02 | W | D1 RANSOMWARE, a reszta misji jako RAT | otwarte | | → critical. |
| M3-03 | S | D1 poziomy odwrócone (keylogger „WYKRYTY”) | w toku |  | D-05: KEYLOGGER w D1 → B2 (mentor odrzuca). |
| M3-04 | W | D5 zły adres i tak trafia do ofiary | w toku |  | Oławska 51B, Drzymały 38D → critical z wyjaśnieniem na ekranie (failTitle). |
| M3-05 | W | D6 złe auto i tak aktywuje wirusa u Mateusza | w toku |  | 7 złych aut → critical; „PUSTY ASFALT” → suboptimal (Mateusz znajdzie kopertę na ziemi, gra idzie dalej). |
| M3-06 | W | D3 „dokumenty HR” psuje ocenę D4 | w toku |  | Właściciel: poziomy D4 (nazwa dysku, podpis) zależne od planu z D3 — przy planie HR ideal to podpis pasujący do dokumentów HR. |
| M4-01 | W | D1 RAT, a reszta misji zakłada ransomware | w toku |  | RAT → B2, spójnie z M2 KEYLOGGER (właściciel zmienił zdanie z critical). |
| M4-03 | W | D10 „troll” i D9 „agresja”: rozmowa zakłada ideał | w toku |  | Troll → critical; agresja (D9) → nowa kwestia, w której szef IT grozi zerwaniem rozmów. Tekst do akceptacji właściciela. |

### P3 — pamięć wyborów (ENG-04) i treść za graczem

| ID | Waga | Krótko | Status | Commit | Notatka |
|---|---|---|---|---|---|
| ENG-04 | W | Silnik nie pamięta wybranej opcji | otwarte | | Szkic API w polu `f` ENG-04. Do tego `option.reject` (B2). |
| ENG-16 | S | Lekcja w raporcie zawsze opisuje opcję idealną | otwarte | | |
| ENG-09 | S | DialogueTree aggregate: odpowiedź z ostatniej tury, poziom z najgorszej | otwarte | | Właściciel: przenieść do P3 (przy przebudowie raportu decyzji). |
| M1-03 | W | D3 Prezes Buczek, a D4 proponuje adresy Kwiatkowskiego | otwarte | | |
| M1-04 | W | Monitor ofiary zawsze mówi o „poradniku biegowym” | otwarte | | |
| M2-05 | S | D3 ankieta przeciwpożarowa: treść maila przeczy feedbackowi | otwarte | | |
| M2-07 | S | Po D1 mentor zawsze każe „STWÓRZ WIRUSA 0-DAY” | otwarte | | Może zniknąć z decyzją D-03. |
| M3-07 | S | Mostki po etapach mówią o ścieżce idealnej | otwarte | | |
| M3-08 | S | Raport: lekcja zawsze opisuje opcję idealną | otwarte | | Razem z ENG-16. |
| M3-11 | N | Raport D4 przy remisie gubi nazwę dysku | otwarte | | |
| M4-05 | S | Słaby klucz w D2, a w D9 „ideał” to „nie odszyfrują plików” | otwarte | | |

### P4 — konsekwencje odroczone

| ID | Waga | Krótko | Status | Commit | Notatka |
|---|---|---|---|---|---|
| ENG-17 | S | WYNIK i BTC na pasku zdradzają słaby wybór od razu | czeka na właściciela | | D-01 |
| M2-01 | W | Monitor botnetu zawsze taki sam | otwarte | | |
| M3-09 | S | Brak odroczonych konsekwencji; wynik spada od razu | otwarte | | |
| M4-02 | W | Brak odroczonych konsekwencji; `m4_mail` nieczytany | otwarte | | |
| M4-04 | S | D8 niepełny zestaw plików, a mostek „mamy wszystko” | otwarte | | |

### P5 — teksty i drobne

| ID | Waga | Krótko | Status | Commit | Notatka |
|---|---|---|---|---|---|
| ENG-13 | N | Podpowiedzi T1/T2 opisane w docs, w silniku ich nie ma | otwarte | | Poprawić dokumentację albo dopisać do P3. |
| M1-01 | W | D4: ideał to domena-sobowtór, a raport uczy o spoofingu i SPF/DKIM | otwarte | | |
| M1-05 | W | Każdy suboptimal kończy się „DOSKONAŁA ROBOTA” | otwarte | | |
| M1-07 | S | Wirus tylko przeciąganiem HTML5 — na dotyku nie przejdzie | otwarte | | |
| M1-08 | N | Treść maila w trzech wersjach | otwarte | | |
| M1-09 | N | Stanowisko Anity niespójne | otwarte | | |
| M2-06 | S | Każdy wybór brzmi jak sukces | otwarte | | |
| M2-08 | N | Teksty critical opisują nieskuteczność, nie wykrycie | otwarte | | Po ENG-15 można dać tytuł „OPERACJA NIEUDANA”. |
| M2-09 | N | Kolejności poziomów w D2 i D3 nie da się wywnioskować | otwarte | | |
| M2-11 | N | „CZARNA LISTA” vs „BIAŁA LISTA” | otwarte | | |
| M2-12 | S | Spoiler „PODMIENIĘ JEDNĄ LITERĘ W DOMENIE” przed decyzją | czeka na właściciela | | D-02 |
| M3-12 | N | Feedback D2 niezgodny z faktami | otwarte | | |
| M3-13 | N | Intro zdradza odpowiedź D1 | otwarte | | |
| M4-06 | S | D2: zakazane znaki nieopisane | otwarte | | |
| M4-07 | S | D3: format czasu niejednoznaczny | otwarte | | |
| M4-08 | S | Critical opisuje porażkę, nie wykrycie; D6 casual za łagodny | otwarte | | |
| M4-09 | N | D5: podpowiedź mentora nie pasuje do ideału | otwarte | | |
| M4-10 | N | D8: liczba plików nieznana, mylące zmyłki | otwarte | | |
| M4-11 | N | Miniatura okna okupu w dev pokazuje ideał | otwarte | | |
| M4-12 | N | D2: suwak startuje na wartości critical | otwarte | | |

### P6 — SCORM w Moodle

| ID | Waga | Krótko | Status | Commit | Notatka |
|---|---|---|---|---|---|
| ENG-07 | S | Interakcje SCORM prawdopodobnie odrzucane przez Moodle | otwarte | | Potwierdzić na prawdziwym Moodle przed poprawką. |
| ENG-10 | S | Brak wznowienia sesji (suspend_data zapisywane, nieczytane) | otwarte | | |

## Decyzje właściciela

Agent wpisuje tu odpowiedź dopiero, gdy właściciel ją poda w czacie.

| ID | Pytanie | Dotyczy | Odpowiedź |
|---|---|---|---|
| D-01 | Ukrywać WYNIK i BTC na pasku zadań w M2+? Bez tego odroczoną konsekwencję widać od razu jako spadek procentów. | ENG-17, P4 | |
| D-02 | Spoiler w M2: zostawić tekst 1:1 z VR czy usunąć zapowiedź przed decyzją? | M2-12 | |
| D-03 | M2 D1 SZKOLENIE IT: zrobić critical czy usunąć D1 (dubluje D4)? | M2-03, M2-07 | Usunąć D1. |
| D-04 | Wirus sprzeczny z planem (M2 D4 KEYLOGGER, M4 D1 RAT): critical (B1) czy mentor odrzuca i gracz wybiera ponownie (B2)? | M2-02, M4-01 | M2 KEYLOGGER: B2. M4 RAT: B2. |
| D-05 | M3 D1 KEYLOGGER: suboptimal z odroczonym skutkiem czy critical z tytułem „OPERACJA NIEUDANA”? | M3-03 | B2. |
| D-06 | Więcej opcji critical = więcej powtórek od zera. Dodać powtórkę od bieżącego etapu? | P2 | B2 wszędzie, gdzie nie ma wykrycia. Critical tylko dla wykrycia albo nieodwracalnej porażki operacji (np. koperta pod złym adresem). |

## Nowe ustalenia

| ID | Waga | Opis | Paczka | Status | Commit | Notatka |
|---|---|---|---|---|---|---|
| NEW-01 | N | Po `Terminate` (`submitScormAndExit`) prawdziwy LMS na ponowne `Initialize` zwraca błąd 104; powtórka misji w tej samej karcie po wysłaniu wyniku może nie zapisać nowego wyniku. Sprawdzić, czy UI w ogóle pozwala grać dalej po wysłaniu. | P6 | otwarte | | Zgłoszone przez agenta przy ENG-01. |
| NEW-02 | N | Repo nie ma biblioteki do testów komponentów (jsdom / Testing Library), więc zmiany w `BootSequence`, `DialogueTree`, `EmailSenderApp` są testowane tylko logiką store'u i ręcznie w przeglądarce. | — | otwarte | | Decyzja: dodać zależność dev czy zostać przy testach logiki. |
