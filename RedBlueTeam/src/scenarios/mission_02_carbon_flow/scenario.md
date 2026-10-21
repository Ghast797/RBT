# Misja 02: CarbonFlow
- id: mission-2-carbonflow
- firma: CarbonFlow Inc.
- nagroda: 2.96 BTC
- kolor: #00FF66
- data fabularna: 19.05.2026
- ocenianych decyzji: 5

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

## Etap 1: //PHISHING (Konfiguracja kampanii)
Klocek: PhishingCampaignApp (minigra misji z krokami wyboru)
Cel dydaktyczny: dobór wektora ataku phishingowego, szablonu oraz tematu ankiety pod profil psychologiczny pracowników korporacji.
Ekrany: Start kampanii → Wybór rodzaju akcji → Wybór szablonu formularza → Wybór tematu ankiety i import listy mailingowej
Oceniane: D1, D2, D3 | Flavor: Ekran startowy, import listy mailingowej

Decyzja D1: "WYBIERZ RODZAJ AKCJI:"
- WIRUS 0-DAY | ideal | Wirus 0-day bezbłędnie realizuje cel zlecenia, omijając antywirusy i tworząc sieć botnetu na serwerach ofiary.
- SZKOLENIE Z BEZPIECZEŃSTWA IT | suboptimal | Pozorowane szkolenie nie instaluje złośliwego oprogramowania i nie paraliżuje infrastruktury zgodnie z ustaleniami z mentorem.
- ZBIERANIE WRAŻLIWYCH DANYCH | critical | Phishing nakierowany wyłącznie na kradzież poświadczeń nie infekuje maszyn robakiem i nie tworzy zasłony dymnej.

Decyzja D2: "WYBIERZ SZABLON FORMULARZA:"
- POODLE FORMS | ideal | Profesjonalny szablon formularza ankietowego idealnie pasuje do planu wysłania fałszywej ankiety pracowniczej.
- Quickgram | suboptimal | Szablon sieci społecznościowej wzbudza podejrzenia w środowisku korporacyjnym.
- Kneenook | critical | Szablon postu na forum jest niespójny z formatem ankiety.

Decyzja D3: "WYBIERZ TEMAT I PRZYNĘTĘ ANKIETY:"
- OBOWIĄZKOWA ANKIETA DOTYCZĄCA SPOTKANIA INTEGRACYJNEGO | ideal | Przymus w połączeniu z tematem integracji tworzy idealną presję socjotechniczną.
- ANKIETA DOTYCZĄCA ĆWICZEŃ PRZECIWPOŻAROWYCH | suboptimal | Temat formalny i nudny, część pracowników odłoży wypełnienie na później.
- ULUBIONE OWOCE Z OWOCOWEGO CZWARTKU | critical | Błahy temat zostanie zignorowany przez większość personelu.

Mostek (rozmowa do kolejnego etapu):
- BM: "NIE ZAPOMNIJ, ŻE MAJĄ CZARNĄ LISTĘ ANTYSPAMOWĄ. MUSISZ WYBRAĆ JEDEN Z TYCH ADRESÓW IP, ABY W OGÓLE ZOBACZYLI MAILA OD CIEBIE"
- GRACZ: "WIEM, SKORZYSTAM Z VPN, ABY OMINĄĆ ICH SYSTEMY ANTYSPAMOWE"
- odblokuj: //VPN

## Etap 2: //VPN (Maskowanie adresu IP)
Klocek: VpnConfiguratorApp (minigra misji / Configurator)
Cel dydaktyczny: ominięcie filtrów antyspamowych (IP reputation / allowlist) poprzez tunelowanie i synchronizację adresu wyjściowego.
Ekrany: Panel routingu VPN → Dopasowanie oktetów IP (lub automatyczna synchronizacja AI) → Weryfikacja połączenia
Oceniane: Flavor (zadanie techniczne) | Flavor: Synchronizacja oktetów IP

Mostek (rozmowa do kolejnego etapu):
- BM: "STWÓRZ WIRUSA 0-DAY. BĘDZIEMY MIELI PEWNOŚĆ, ŻE WIRUS JEST NIEWYKRYWALNY"
- GRACZ: "ROBI SIĘ"
- odblokuj: //BAZA_WIRUSÓW

## Etap 3: //BAZA_WIRUSÓW (Konstrukcja i modyfikacja robaka)
Klocek: WormBuilderApp (minigra misji)
Cel dydaktyczny: dobór typu złośliwego oprogramowania tworzącego botnet oraz zrozumienie wektora samoreplikacji w sieci LAN.
Ekrany: Wybór typu wirusa → Modyfikacja kodu robaka (instrukcje assemblera / pipeline) → Kompilacja ładunku 0-day
Oceniane: D4 | Flavor: Modyfikacja instrukcji i kompilacja kodu

Decyzja D4: "WYBIERZ ODPOWIEDNIEGO WIRUSA:"
- ROBAK – AUTOMATYCZNIE SIĘ POWIELA I TWORZY KOMPUTERY ZOMBIE | ideal | Robak samodzielnie powiela się w sieci i formuje botnet.
- KEYLOGGER – POKAŻE WSZYSTKO CO OFIARA WPISUJE NA KLAWIATURZE | suboptimal | Przechwytuje dane na jednej stacji, nie tworzy botnetu.
- RANSOMWARE – MOŻE ZASZYFROWAĆ KOMPUTER OFIARY ORAZ JEJ CAŁĄ SIEĆ | critical | Szyfrowanie przedwcześnie alarmuje administratorów i pali operację.

Mostek (rozmowa do kolejnego etapu):
- BM: "WIESZ JUŻ, Z JAKIEGO ADRESU WYŚLESZ ZAINFEKOWANĄ ANKIETĘ?"
- GRACZ: "SPOKOJNA TWOJA ZAKAPTURZONA. PODMIENIĘ JEDNĄ LITERĘ W DOMENIE FIRMOWEJ. NIKT NIE ZWRÓCI NA TO UWAGI"
- odblokuj: //PHISHING (Wysyłka)

## Etap 4: //PHISHING_DISPATCH (Wybór domeny i wysyłka)
Klocek: PhishingDispatchApp (minigra misji / ChoiceCards)
Cel dydaktyczny: technika typosquattingu (podszywanie się pod domenę korporacyjną) i autoryzacja kampanii phishingowej.
Ekrany: Wybór adresu nadawcy → Przegląd kampanii i uzbrojonego linku → Wysłanie wiadomości
Oceniane: D5 | Flavor: Potwierdzenie wysyłki

Decyzja D5: "WYBIERZ ADRES, Z KTÓREGO WYŚLESZ MAILA:"
- KADRY@CARDONFLOW.COM | ideal | Typosquatting (podmiana 'b' na 'd' w nazwie domeny) połączony z wiarygodnym działem kadr.
- MARKETING@CARBON.COM | suboptimal | Skrócona domena jest podejrzana w kontekście spraw kadrowych.
- KATERING@OILFLOW.COM | critical | Zupełnie obca domena zewnętrznej firmy cateringowej zostanie zablokowana lub zignorowana.

Mostek (rozmowa do kolejnego etapu):
- GRACZ: "GOTOWE. TERAZ MUSIMY POCZEKAĆ, AŻ RYBKA CHWYCI HACZYK"
- odblokuj: //MONITOR_BOTNETU

## Etap 5: //MONITOR_BOTNETU (Rozprzestrzenianie robaka i formowanie botnetu)
Klocek: BotnetMonitorApp (minigra misji / telemetryczna)
Cel dydaktyczny: obserwacja rozprzestrzeniania się infekcji w strukturze sieciowej ofiary oraz skutków kampanii.
Ekrany: Alert aktywacji malware → Monitor telemetryczny z rosnącym wskaźnikiem infekcji maszyn (do 82%) → Topologia sieci zainfekowanej
Oceniane: Flavor (wizualizacja sukcesu)

Mostek (rozmowa końcowa z mentorem):
- BM: "NIEŹLE CI POSZŁO. JESTEŚ CORAZ BLIŻEJ PRZYJĘCIA DO DARKSUN. CARBONFLOW MA CO ODKRĘCAĆ, A MY MOŻEMY SPOKOJNIE DZIAŁAĆ DALEJ. ODEZWĘ SIĘ WKRÓTCE. BĄDŹ GOTOWY NA MOC WRAŻEŃ"
- GRACZ: "DO USŁUG"
- odblokuj: DEBRIEF

## Debrief
Slajdy edukacyjne:
1. ANTYWIRUS — Dobre oprogramowanie chroniące przed wirusami jest pierwszą linią obrony przeciwko atakom hakerskim. Zminimalizuje szkody i powiadomi o próbie zainfekowania urządzenia, co pozwoli na szybką reakcję administratora.
2. ODNOŚNIKI W MAILACH — Każdy mail posiadający odnośnik należy sprawdzić pod kątem złośliwego oprogramowania. Jeżeli nie jesteś pewny linku, zapytaj swojego administratora. Zalecane jest sprawdzenie czy dany rodzaj wiadomości faktycznie został wysłany do pracowników oraz czy nadawca jest ci znany.
3. WYCIECKI DANYCH — Jeśli wiadomość wydaje się podejrzana, przyjrzyj się domenie oraz całemu adresowi, z którego została wysłana. Może się okazać, że dane kontaktowe pracowników firmy są w niepowołanych rękach i będzie trzeba wdrożyć dodatkowe środki ostrożności.
4. PODSUMOWUJĄC - NA CO NALEŻY UWAŻAĆ — Zawsze miej zainstalowane oprogramowanie antywirusowe. Uważaj na odnośniki w mailach. Dane pracowników mogły ulec wyciekom, pamiętaj o tym.
5. CHCESZ UNIKNĄĆ HAKOWANIA? — Wszystkie wskazówki na temat cyberbezpieczeństwa znajdziesz w panelu Baza Wiedzy w głównym menu hakera (Darknecie).
