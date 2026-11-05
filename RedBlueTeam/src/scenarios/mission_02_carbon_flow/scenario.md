# Misja 2: CarbonFlow
- id: mission-2-carbonflow
- firma: CarbonFlow Inc.
- nagroda: 2.96 BTC
- kolor: #00FF66
- data fabularna: 19.05.2026
- ocenianych decyzji: 5

Źródło prawdy: `docs/Scenariusz Misja 2 - CarbonFlow (Specyfikacja 2D).md` (VR). Kolejność etapów i numeracja decyzji jak w VR: akcja / szablon / temat → VPN → wirus → nadawca.

## Intro (dialog z BYTE_MASTER)
- BM: MAM DLA CIEBIE KOLEJNE ZADANIE
- GRACZ: HEJ, CO MASZ DLA MNIE TYM RAZEM?
- BM: Z DOKUMENTÓW, KTÓRE DLA NAS ZDOBYŁEŚ WYNIKA, ŻE JEDNĄ Z FIRM, KTÓRA MOŻE POSIADAĆ WIĘCEJ INFORMACJI O TECHNOLOGII FREEVOLT JEST CARBONFLOW INC.
- GRACZ: CO TO ZA FIRMA?
- BM: TO OPERATOR SYSTEMU PRZESYŁOWEGO PALIW, KTÓREGO SZEFEM JEST ROBERT MORIS, WSPÓŁPRACUJĄ Z NAJWIĘKSZYMI KONCERNAMI ZAJMUJĄCYMI SIĘ PRODUKCJĄ I DYSTRYBUCJĄ GAZU ORAZ ROPY
- BM: CHCEMY NAPSUĆ IM TROCHĘ KRWI I SPRAWIĆ, ŻE ICH KLIENCI STRACĄ DO NICH ZAUFANIE. POTRZEBUJEMY TEŻ ZASŁONY DYMNEJ, ŻEBY NA SPOKOJNIE ROZEJRZEĆ SIĘ PO ICH SERWERACH. JAKIEŚ POMYSŁY, SHERLOCKU?
- GRACZ: JAKIE MAJĄ ZABEZPIECZENIA?
- BM: DOŚĆ SŁABE. W MAILACH OD NICH ZAUWAŻYŁEM SYGNATURĘ BEZPŁATNEGO ANTYWIRUSA. OPRÓCZ TEGO, ICH SERWER POCZTOWY DAWNO NIE BYŁ AKTUALIZOWANY, WIĘC NA PEWNO MAJĄ LUKI BEZPIECZEŃSTWA
- GRACZ: CO POWIESZ NA FAŁSZYWĄ ANKIETĘ ZAINFEKOWANĄ WIRUSEM 0-DAY, KTÓRY WYKRYJE DLA NAS TE LUKI? ROBAKI 0-DAY SĄ PRAKTYCZNIE NIEWYKRYWALNE PRZEZ ANTYWIRUSY, A CO DOPIERO W PRZYPADKU GDY ICH OPROGRAMOWANIE JEST NIEAKTUALNE
- BM: A CO Z TĄ ANKIETĄ?
- GRACZ: ZAREJESTRUJĘ FAŁSZYWĄ DOMENĘ I STWORZĘ ANKIETĘ, KTÓRĄ WYŚLĘ WSZYSTKIM PRACOWNIKOM W FIRMIE. KIEDY TYLKO KLIKNĄ W LINK, ROBAK ZAINFEKUJE ICH KOMPUTERY I ROZEŚLE ZAINFEKOWANE WIADOMOŚCI DO KLIENTÓW Z FIRMOWEJ BAZY KONTAKTÓW
- GRACZ: TO NA 100% PODKOPIE WIARYGODNOŚĆ CARBONFLOW, A NAM DA MOŻLIWOŚĆ ROZEJRZENIA SIĘ PO SERWERACH I ZDOBYCIE DANYCH NA TEMAT FREEVOLT
- BM: CZYLI KLASYCZNY PHISHING?
- GRACZ: CZASEM NAJPROSTSZE ROZWIĄZANIA SĄ NAJLEPSZE
- BM: DOBRZE SIĘ SKŁADA, BO MAM AKURAT DLA CIEBIE LISTĘ MAILINGOWĄ PRACOWNIKÓW CARBONFLOW I ADRESY IP, KTÓRE SĄ NA BIAŁEJ LIŚCIE NADAWCÓW
- GRACZ: CZYLI OD POCZĄTKU WIEDZIAŁEŚ, ŻE BĘDĘ PLANOWAĆ ATAK PHISHINGOWY?
- BM: PAMIĘTAJ, JESTEM ZAWSZE DWA KROKI PRZED TOBĄ. A TERAZ ZABIERAJ SIĘ DO PRACY
- GRACZ: DO ROBOTY. ZACZYNAM OD PRZYGOTOWANIA KAMPANII. [SPÓJNIK]
- odblokuj: //PHISHING

## Etap 1: //PHISHING
Klocek: NOWA MINIGRA (`PhishingCampaignApp`, kreator kampanii: akcja → szablon → temat → lista adresatów)
Cel dydaktyczny: dobór rodzaju ataku, serwisu-przykrywki i przynęty socjotechnicznej pod cel operacji (zainfekowanie sieci i zasłona dymna).
Ekrany: „NOWA KAMPANIA PHISHINGOWA” z przyciskiem „KONTYNUUJ” (VR S01) → wybór akcji → wybór szablonu → wybór tematu → import listy adresatów od mentora z białą listą IP (flavor)
Oceniane: D1, D2, D3 | Flavor (nieoceniane): import listy adresatów

Decyzja D1: "WYBIERZ RODZAJ AKCJI:"
- WIRUS 0-DAY | ideal | Wirus 0-day bezbłędnie realizuje cel zlecenia, omijając antywirusy i tworząc sieć botnetu na serwerach ofiary.
- SZKOLENIE Z BEZPIECZEŃSTWA IT | suboptimal | Pozorowane szkolenie nie instaluje złośliwego oprogramowania i nie paraliżuje infrastruktury zgodnie z ustaleniami z mentorem.
- ZBIERANIE WRAŻLIWYCH DANYCH | critical | Phishing nakierowany wyłącznie na kradzież poświadczeń nie infekuje maszyn robakiem i nie tworzy zasłony dymnej.

Decyzja D2: "WYBIERZ SZABLON FORMULARZA:"
- POODLE FORMS (TWOJA ANKIETA | WYPEŁNIJ FORMULARZ) | ideal | Profesjonalny szablon formularza ankietowego idealnie pasuje do planu wysłania fałszywej ankiety pracowniczej.
- Quickgram (OBSERWUJ | SPRAWDŹ TO) | suboptimal | Szablon sieci społecznościowej wzbudza podejrzenia w środowisku korporacyjnym.
- Kneenook (TWÓJ POST | ZOBACZ NA KNEENOOK) | critical | Szablon postu na forum jest niespójny z formatem ankiety.

Decyzja D3: "WYBIERZ TEMAT I PRZYNĘTĘ ANKIETY:"
- OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO | ideal | Przymus w połączeniu z tematem integracji tworzy idealną presję socjotechniczną.
- ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH | suboptimal | Temat formalny i nudny, część pracowników odłoży wypełnienie na później.
- ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU | critical | Błahy temat zostanie zignorowany przez większość personelu.

Opcje w każdej decyzji wyświetlają się w losowej kolejności (konwencja silnika).

Mostek (rozmowa do kolejnego etapu):
- BM: "NIE ZAPOMNIJ, ŻE MAJĄ CZARNĄ LISTĘ ANTYSPAMOWĄ. MUSISZ WYBRAĆ JEDEN Z TYCH ADRESÓW IP, ABY W OGÓLE ZOBACZYLI MAILA OD CIEBIE"
- GRACZ: "WIEM, SKORZYSTAM Z VPN, ABY OMINĄĆ ICH SYSTEMY ANTYSPAMOWE"
- odblokuj: //TUNEL_VPN

## Etap 2: //TUNEL_VPN
Klocek: VpnRouter
Cel dydaktyczny: ominięcie filtrów antyspamowych (biała lista adresów nadawców) przez zmianę adresu wyjściowego.
Ekrany: dopasowanie oktetów IP (ręcznie lub „DOPASUJ W AI”) → potwierdzenie „POMYŚLNIE DOPASOWANO IP”
Oceniane: Flavor (zadanie techniczne, bez oceny; błędny adres tylko blokuje przejście dalej)

Mostek (rozmowa do kolejnego etapu):
- BM: "STWÓRZ WIRUSA 0-DAY. BĘDZIEMY MIELI PEWNOŚĆ, ŻE WIRUS JEST NIEWYKRYWALNY"
- GRACZ: "ROBI SIĘ"
- odblokuj: //BAZA_WIRUSÓW

## Etap 3: //BAZA_WIRUSÓW
Klocek: NOWA MINIGRA (`WormBuilderApp`: wybór wirusa → modyfikacja kodu → kompilacja)
Cel dydaktyczny: rozróżnienie typów malware i dobór tego, który tworzy sieć zainfekowanych komputerów (botnet).
Ekrany: wybór wirusa → modyfikacja kodu (5 instrukcji, zaznaczane klikiem; przycisk „KOMPILUJ ŁADUNEK 0-DAY”) → kompilacja → „WIRUS GOTOWY!” z tekstem „AKTYWUJE SIĘ, GDY OFIARA GO OTWORZY” (VR S04)
Oceniane: D4 | Flavor (nieoceniane): modyfikacja kodu i kompilacja

Decyzja D4: "WYBIERZ ODPOWIEDNIEGO WIRUSA:"
- ROBAK – AUTOMATYCZNIE SIĘ POWIELA I TWORZY KOMPUTERY ZOMBIE | ideal | Robak samodzielnie powiela się w sieci i formuje botnet.
- KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE | suboptimal | Przechwytuje dane na jednej stacji, nie tworzy botnetu.
- RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ | critical | Szyfrowanie przedwcześnie alarmuje administratorów i pali operację.

Mostek (rozmowa do kolejnego etapu):
- BM: "WIESZ JUŻ, Z JAKIEGO ADRESU WYŚLESZ ZAINFEKOWANĄ ANKIETĘ?"
- GRACZ: "SPOKOJNA TWOJA ZAKAPTURZONA. PODMIENIĘ JEDNĄ LITERĘ W DOMENIE FIRMOWEJ. NIKT NIE ZWRÓCI NA TO UWAGI"
- odblokuj: //PHISHING (WYSYŁKA)

## Etap 4: //PHISHING (WYSYŁKA)
Klocek: NOWA MINIGRA (`PhishingDispatchApp`: nadawca → podgląd → wysyłka)
Cel dydaktyczny: dobór adresu nadawcy, któremu pracownicy zaufają, i egzekucja wysyłki kampanii.
Ekrany: wybór nadawcy → podgląd maila (temat, szablon i nadawca z wcześniejszych wyborów) i przycisk „WYŚLIJ” (VR S05) → wysyłka SMTP → potwierdzenie „KAMPANIA PHISHINGOWA ZOSTAŁA WYSŁANA” (prawy monitor wraca wtedy do czatu)
Oceniane: D5 | Flavor (nieoceniane): podgląd i wysyłka

Decyzja D5: "WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:"
- KADRY@CARDONFLOW.COM | ideal | Typosquatting (podmiana 'b' na 'd' w nazwie domeny) połączony z wiarygodnym działem kadr.
- MARKETING@CARBON.COM | suboptimal | Skrócona domena jest podejrzana w kontekście spraw kadrowych.
- KATERING@OILFLOW.COM | critical | Zupełnie obca domena zewnętrznej firmy cateringowej zostanie zablokowana lub zignorowana.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "GOTOWE. TERAZ MUSIMY POCZEKAĆ, AŻ RYBKA CHWYCI HACZYK"
- odblokuj: //MONITOR_BOTNETU

## Etap 5: //MONITOR_BOTNETU
Klocek: NOWA MINIGRA (`BotnetMonitorApp`, wizualizacja)
Cel dydaktyczny: zobaczenie skutku ataku: rozprzestrzenianie się robaka po stacjach i powstanie botnetu.
Ekrany: alert „MALWARE ZOSTAŁ AKTYWOWANY” z komunikatem „ROBAK – MALWARE ZOSTAŁ AKTYWOWANY. KOMPUTERY ZOMBIE SĄ TWORZONE” i przyciskiem „PODGLĄD” (VR S06, pkt 1–2) → telemetria (licznik infekcji do 82%) → topologia sieci. Liczby (82%, 12 stacji, 10 zainfekowanych / 2 zabezpieczone) i węzły wylicza kod z `botnetMonitorConfig` (`targetPercentage`, `totalWorkstations`)
Oceniane: Flavor (bez oceny; wskaźniki niezależne od wyborów gracza, mechanizm konsekwencji planowany później)

Mostek (rozmowa końcowa):
- BM: "NIEŹLE CI POSZŁO. JESTEŚ CORAZ BLIŻEJ PRZYJĘCIA DO DARKSUN. CARBONFLOW MA CO ODKRĘCAĆ, A MY MOŻEMY SPOKOJNIE DZIAŁAĆ DALEJ. ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ"
- GRACZ: "DO USŁUG"
- odblokuj: //PODSUMOWANIE

## Debrief
Lekcje przy decyzjach (rozwijane w raporcie pooperacyjnym):


D1:
- Atak: Atak nie kradnie jednego hasła, tylko wprowadza do firmy złośliwy kod wykorzystujący jeszcze nieznaną lukę. Antywirus oparty na znanych sygnaturach go nie rozpozna, a nieaktualizowany serwer pocztowy CarbonFlow ułatwia wejście.
- Obrona: Sygnały: nieoczekiwana ankieta z linkiem, pilna prośba o kliknięcie, brak wcześniejszej zapowiedzi od działu, którego rzekomo dotyczy. Co zrobić: aktualizuj systemy i serwer pocztowy, trzymaj antywirus włączony i zgłaszaj dziwne wiadomości administratorowi zamiast klikać.

D2:
- Atak: Szablon udający serwis do ankiet pasuje do pretekstu: pracownicy dostają ankiety od działów i przywykli do linków do formularzy. Dzięki temu strona-pułapka wygląda zwyczajnie.
- Obrona: Sygnały: formularz hostowany w zewnętrznym serwisie, a nie w firmowym systemie; adres strony nie należy do firmy. Co zrobić: sprawdź, czy dana ankieta naprawdę została rozesłana (zapytaj dział lub administratora) i nie wypełniaj formularzy z nieznanych serwisów w pracy.

D3:
- Atak: Przynęta łączy dwa bodźce: temat, który ludzi obchodzi (wspólny wyjazd), i słowo „obowiązkowa”, które wymusza szybką reakcję. Presja zmniejsza ostrożność, a nikt nie chce być tym, kto nie wypełnił.
- Obrona: Sygnały: obowiązek i termin w mailu, nacisk na pośpiech, temat spoza codziennych zadań. Co zrobić: zatrzymaj się, gdy wiadomość naciska na natychmiastowe działanie, sprawdź jej prawdziwość innym kanałem i zgłoś ją, zanim klikniesz.

D4:
- Atak: Robak powiela się sam i przechodzi z komputera na komputer bez udziału użytkownika. Jedno kliknięcie jednego pracownika wystarcza, by zbudować sieć zainfekowanych maszyn (botnet) i dać atakującemu zasłonę dymną.
- Obrona: Sygnały: nagłe spowolnienie stacji, nietypowy ruch sieciowy, alerty antywirusa na kilku komputerach naraz. Co zrobić: odłącz zainfekowaną stację od sieci, zgłoś incydent, segmentuj sieć i regularnie aktualizuj oprogramowanie, by robak nie miał luk do wykorzystania.

D5:
- Atak: Podmiana jednej litery w nazwie domeny (cardonflow zamiast carbonflow) daje adres, który na szybki rzut oka wygląda jak firmowy. Dział kadr to nadawca, któremu pracownicy ufają i na którego ankiety odpowiadają.
- Obrona: Sygnały: domena różni się o jeden znak od firmowej, wiadomość od działu, który zwykle pisze inaczej. Co zrobić: czytaj cały adres nadawcy, litera po literze, najeżdżaj kursorem na linki i zgłaszaj wątpliwe wiadomości; firma powinna dodatkowo wykrywać domeny łudząco podobne do własnej.

## Odchylenia od VR / do decyzji
- [SPÓJNIK] Po intro VR nie ma kwestii gracza odblokowującej pierwszy kafelek. Dodana: „DO ROBOTY. ZACZYNAM OD PRZYGOTOWANIA KAMPANII.”
- [NIEPEWNE] Dwie kolejne kwestie jednego mówcy w VR (BM po „GAZU ORAZ ROPY”, GRACZ po „FIRMOWEJ BAZY KONTAKTÓW”) są w intro jednym dymkiem z podziałem linii, bo kontrakt intro to para BM → GRACZ.
- [NIEPEWNE] Mostek po wysyłce kampanii w VR ma tylko kwestię gracza (bez wiersza mentora). Zostawiony 1:1; wcześniejszy kod miał dopisaną kwestię BM („KAMPANIA ROZESŁANA…”), usunięta.
- [DO DECYZJI] Etap 1 w VR to dwa osobne ekrany (S01 ChoiceCards, S02 PoolSelect z przeciąganiem tematu). W webie wszystkie trzy wybory to karty (klik) w jednej aplikacji //PHISHING; przeciąganie tematu na formularz nie zostało zaimplementowane.
- [DO DECYZJI] Etap 1 zawiera krok „import listy adresatów” (z kodu, nie z VR), bo pokazuje białą listę IP potrzebną w //TUNEL_VPN. W VR lista pada tylko w dialogu intro.
- [DO DECYZJI] Etykiety kafelków: VR podaje „//PHISHING” i „//PHISHING (Wysyłka)”; „//TUNEL_VPN” (VR: „//VPN”) i „//MONITOR_BOTNETU” zostawiono z kodu.
- [DO DECYZJI] D1 („WIRUS 0-DAY”) i D4 („ROBAK”) to w VR praktycznie ta sama wiedza dwa razy. Zostawione zgodnie z VR.
- [NIEPEWNE] Pytania w VR-owej tabeli debriefu różnią się od ekranowych (np. „WYBIERZ SZABLON MAILA” vs „WYBIERZ SZABLON FORMULARZA:”). W grze raport używa pytań z ekranu.
- [DO ZAPROJEKTOWANIA] Lekcje atak/obrona w debriefie (D1–D5) nie istnieją w VR; propozycja do recenzji właściciela.
- Opisy i tagi opcji spoza VR usunięto (oceniały opcje); zostawiono podtytuły szablonów z VR.
- [DO DECYZJI] S04, krok 2: VR każe przeciągnąć 5 klocków instrukcji na grafikę robaka. W webie gracz zaznacza segmenty kodu klikiem na prawym monitorze, a lewy ekran pokazuje podgląd assemblera. Przycisk „WSTRZYKNIJ WSZYSTKIE INSTRUKCJE” i kompilacja przez „KOMPILUJ ŁADUNEK 0-DAY” to dodatki kodu (nieoceniane).
- [DO DECYZJI] S01, ekran startowy: VR podaje tylko tytuł „NOWA KAMPANIA PHISHINGOWA” i przycisk „KONTYNUUJ”; reszta ekranu (nagłówek aplikacji, ikona) to standard aplikacji z M1.
- [DO DECYZJI] S06: VR opisuje alert „MALWARE ZOSTAŁ AKTYWOWANY” i monitor z komunikatem „ROBAK – …” jako osobne ekrany; w webie to jeden ekran (tytuł = alert, treść = komunikat monitora, przycisk „PODGLĄD”).
- [DO DECYZJI] S06: topologia sieci (nazwy stacji CF-*, role, podział 10 zainfekowanych / 2 zabezpieczone) nie pochodzi z VR; VR podaje tylko „schemat sieci zakażonej w firmie CarbonFlow”.
- [DO DECYZJI] S05: ekran potwierdzenia po „WYŚLIJ” (podsumowanie wysyłki, „POWRÓT DO PULPITU”) to dodatek kodu; VR kończy się na kliknięciu „WYŚLIJ”.
