# M5 — propozycje tekstów po QA R1 (do akceptacji właściciela)

Po akceptacji teksty trafią do `scenario.md`, `data/mission5.json` (lekcje), `stages.ts` (spójniki, feedback) i testów. Ustalenia: `qa.md`.

## A. Lekcje „Atak / Obrona” (R1-01, R1-02, R1-03)

Schemat obrony jak w M1–M4: „Sygnały: … Co zrobić: …”. Zmienione pola „Atak” są oznaczone; pozostałe zostają bez zmian.

**D1 — domena**
- Atak *(zmiana)*: Domena z doklejonym słowem (combosquatting): archiwumbcorp.biz łączy nazwę firmy, tę samą końcówkę .biz i słowo „archiwum”. Na pierwszy rzut oka wygląda jak firmowy adres banku.
- Obrona: Sygnały: nazwa firmy sklejona z innym słowem (archiwumbcorp zamiast bcorp) albo inna końcówka (.pl zamiast .biz). Co zrobić: czytaj adres od końca, bo liczy się nazwa tuż przed końcówką. W mail.bcorp.biz to „bcorp”, a w mail.archiwumbcorp.biz to „archiwumbcorp”, czyli zupełnie inny właściciel. Kłódka w pasku tego nie rozstrzyga, bo fałszywe strony też ją mają. Podejrzany adres zgłoś do IT.

**D2 — numer**
- Atak *(zmiana)*: Podszywanie się pod numer (spoofing) pozwala wyświetlić na telefonie ofiary numer, który wygląda na firmowy. Tu jest to numer działu IT (891 002 162). Ofiara rozpoznaje znajomy prefiks i odruchowo obniża czujność.
- Obrona: Sygnały: telefon z „firmowego” numeru, a rozmówca prosi o logowanie albo dane. Co zrobić: pamiętaj, że numer na ekranie da się podrobić. Rozłącz się i oddzwoń na numer z firmowej książki adresowej lub intranetu, a nie na ten, który się wyświetlił, ani na ten, który poda rozmówca.

**D3 — powitanie**
- Obrona: Sygnały: dzwoni „IT”, choć niczego nie zgłaszałeś, i od razu zwraca się do Ciebie po imieniu. Co zrobić: uprzejmość i znajomość Twojego imienia niczego nie dowodzą, bo takie dane są w sieci. Zapytaj o numer zgłoszenia i powiedz, że oddzwonisz przez helpdesk. Prawdziwy pracownik IT się na to zgodzi.

**D4 — przedstawienie się**
- Atak *(zmiana)*: Podszycie się pod prawdziwego, niedawno zatrudnionego pracownika (Michała Mitnika z białego wywiadu) tłumaczy, dlaczego ofiara nie rozpoznaje głosu ani nazwiska rozmówcy.
- Obrona: Sygnały: dzwoni ktoś, kogo nie znasz, choć przedstawia się nazwiskiem pracownika firmy; coś w nazwisku Ci nie pasuje. Co zrobić: nazwisko w książce adresowej nie potwierdza, kto naprawdę dzwoni, bo oszust podszywa się właśnie pod prawdziwą osobę. Rozłącz się i oddzwoń na numer tej osoby z książki albo napisz do niej przez firmowy komunikator. Gdy coś nie pasuje, nie zgadzaj się dla świętego spokoju, tylko przerwij i sprawdź.

**D5 — dział**
- Obrona: Sygnały: „IT” dzwoni bez zapowiedzi i prosi o logowanie na nowej stronie. Co zrobić: IT nigdy nie prosi o hasło ani kod, a prace techniczne zapowiada wcześniej oficjalnymi kanałami. Odmów, rozłącz się i zgłoś próbę przez helpdesk. Zgłoś ją także wtedy, gdy nic nie podałeś, bo oszust zadzwoni do kolejnej osoby.

**D6 — presja czasu**
- Atak *(zmiana)*: Presja czasu („pilne, musimy skończyć dzisiaj”) ma odciąć ofiarę od spokojnej analizy. Atakujący celowo dzwoni, gdy ofiara się spieszy, tu tuż przed spotkaniem.
- Obrona: Sygnały: rozmówca naciska („pilne”, „do końca dnia”), a Ty właśnie się spieszysz. Co zrobić: pośpiech to jeden z najczęstszych sygnałów oszustwa telefonicznego (vishingu). Powiedz „oddzwonię po spotkaniu przez helpdesk” i sprawdź sprawę na spokojnie.

**D7 — przełożony**
- Atak *(zmiana)*: Atakujący wie z białego wywiadu, że przełożony jest na urlopie, więc nie da się go zapytać. Dorzuca „możesz zapytać Sandrę”: propozycja sprawdzenia brzmi uczciwie, a on liczy, że nikt tego nie zrobi.
- Obrona: Sygnały: rozmówca powołuje się na kogoś, kogo nie da się teraz zapytać, albo sam proponuje „zapytaj X”. Co zrobić: zrób to. Zadzwoń do tej osoby na numer z książki adresowej, a gdy jej nie ma, do jej zastępcy albo na helpdesk, zanim cokolwiek wpiszesz. Nie publikuj w sieci informacji o urlopach i strukturze zespołu.

**D8 — perswazja**
- Atak *(zmiana)*: Gra na poczuciu obowiązku („zostałeś mi tylko ty”, „to ważne dla bezpieczeństwa firmy”) wywołuje poczucie winy i chęć szybkiego „odhaczenia” sprawy.
- Obrona: Sygnały: rozmówca przekonuje, że tylko Ty zostałeś, albo zasłania się bezpieczeństwem firmy. Co zrobić: odpowiedz „sprawdzę to i oddzwonię”. Prawdziwy pracownik IT to zaakceptuje, a dalszy nacisk to sygnał ataku.

**D9 — link**
- Atak *(zmiana)*: Link wysłany w trakcie rozmowy i nazwany „nową stroną archiwizacji” prowadzi ofiarę prosto na skopiowany panel logowania, bez czasu na sprawdzenie adresu.
- Obrona: Sygnały: link do logowania dostajesz w trakcie nieoczekiwanego telefonu, a rozmówca prosi, żebyś zalogował się na „nową stronę”. Co zrobić: nie oceniaj strony po wyglądzie, bo kopię robi się w kilka minut i wygląda identycznie. Nie loguj się z linku od rozmówcy. Wejdź na pocztę z własnej zakładki albo wpisz adres sam, a link zgłoś do IT.

**D10 — hasło i kod**
- Atak *(zmiana)*: Atak „pośrednika” (Adversary-in-the-Middle): fałszywa strona na bieżąco przekazuje wpisane hasło i kod SMS do prawdziwej poczty, więc atakujący loguje się mimo logowania dwuetapowego (2FA).
- Obrona: Sygnały: kod SMS przychodzi zaraz po logowaniu z linku od rozmówcy; ktoś prosi, żebyś wpisał lub podał kod; po zalogowaniu skrzynka jest pusta. Co zrobić: kod wpisuj tylko na stronie, którą sam otworzyłeś, i nigdy nikomu go nie podawaj, bo IT go nie potrzebuje. Jeśli już wpisałeś hasło lub kod na podejrzanej stronie, od razu zmień hasło (z własnej zakładki) i zgłoś to do IT. Logowanie dwuetapowe dalej warto mieć, bo mocno chroni konto, choć kod SMS da się wyłudzić.

## B. Spójniki gracza między etapami (R1-04)

Kwestie gracza w czacie po zamknięciu etapu, oznaczone `[SPÓJNIK]` w `scenario.md` (wzorzec M4).

1. Po PDF: „MAM WSZYSTKO, CZEGO POTRZEBUJĘ DO ROZMOWY. NAJPIERW UKRYJĘ SWOJE IP.”
2. Po VPN: „IP ZAMASKOWANE. CZAS NA DOMENĘ DLA PODSTAWIONEJ STRONY.”
3. Po domenie: „DOMENA WYKUPIONA. TERAZ SKOPIUJĘ WYGLĄD ICH STRONY LOGOWANIA.”
4. Po klonowaniu: „STRONA GOTOWA. ZOSTAŁ NUMER, Z KTÓREGO ZADZWONIĘ.”
5. Po numerze: „NUMER USTAWIONY. MOGĘ DZWONIĆ DO FILIPA.”

## C. Drobne poprawki tekstów (R1-07, R1-17, R1-18)

- D3 `CZEŚĆ FILIP!`, feedback: „Poufałe „cześć” od nieznajomego, który jeszcze się nie przedstawił, brzmi nienaturalnie i budzi czujność dyrektora.” (zamiast „zbyt poufałe powitanie dyrektora przez nowego pracownika IT”, bo ścieżka idealna też mówi Filipowi na „ty”).
- D7 `DAREK…`, feedback: „Błędne imię przełożonego i powołanie się na rozmowę z nim w czasie urlopu mocno podważają wiarygodność.” (bez „zbyt poufały zwrot”).
- D8 ideal, feedback: „(„wszyscy już przeszli test”)” → „(„zostałeś mi tylko ty”)”.
- Mostek końcowy, wariant 100%, gracz: „…FILIP NAWET NIE ZORIENTOWAŁ SIĘ, ŻE JEGO HASŁO I KOD SMS TRAFIŁY DO NAS.”
