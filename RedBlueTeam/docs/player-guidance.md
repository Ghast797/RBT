# Reguły prowadzenia gracza

> Reguły dla agenta budującego misję z gotowego scenariusza. Jak ustawić etapy tak, aby gracz w każdej chwili wiedział, co ma zrobić.

## Zasada naczelna

**W każdej chwili dokładnie jeden następny krok jest jasno wskazany; wszystko inne jest nieaktywne i wizualnie odróżnione.**

W grze 2D cały pulpit jest na ekranie naraz. Gracz nie ma przestrzeni, która w VR sama kierowała uwagę (jeden obiekt w zasięgu ręki, światło, dźwięk z kierunku). Dlatego prowadzenie trzeba ustawić wprost — nie opisywać go w scenariuszu, tylko złożyć z mechanizmów silnika.

## Reguły

1. **Jeden aktywny cel.** Odblokowany jest tylko kafelek bieżącego etapu. Pozostałe są ukryte albo wyszarzone (`unlockedOnly` + `requiredUnlockId`). Gracz nie może „zgubić się" w aplikacji, która jeszcze nie ma sensu.
2. **Następny krok ma widoczny znacznik.** Świeżo odblokowany kafelek dostaje powiadomienie `[1]` (`notificationBadges`) **oraz poświatę uwagi** (`completion.highlightTile` → pulsująca zielona obwódka na pulpicie). Gdy czeka odpowiedź na czacie — uwaga idzie na czat (callout na prawy monitor).
3. **Czat jest rozmową, nie launcherem.** Kliknięcie w czacie **nigdy** nie otwiera aplikacji. Mentor nie ma dostępu do komputera gracza, więc **nie podaje aplikacji do otwarcia** — prowadzi rozmowę (`completion.conversation`, naprzemiennie mentor/gracz). Dopiero gdy gracz napisze mentorowi, co chce zrobić, kolejny kafelek się **odblokowuje i podświetla**; gracz **sam** go klika.
4. **Przejście dalej jest zablokowane, dopóki krok nie jest zrobiony.** Przycisk „dalej/zatwierdź" jest wyszarzony do spełnienia kryterium ukończenia, potem aktywny (zielony). Nigdy odwrotnie.
5. **Podpowiedź po bezczynności, dwa poziomy.** T1 subtelny (pulsowanie celu), T2 wyraźny (komunikat tekstowy, `WSKAZÓWKA [?]`). Dla **decyzji** podpowiedź naprowadza na myślenie („przypomnij sobie ustalenia z mentorem"), nie zdradza odpowiedzi. Dla **czynności** („otwórz aplikację", „przeciągnij plik") podpowiedź może wskazać obiekt wprost.
6. **Czat ma pierwszeństwo.** Kiedy mentor czeka na odpowiedź, gracz odpowiada, zanim przejdzie do pulpitu. Dialog nie konkuruje z minigrą o uwagę w tym samym momencie. Mentor „pisze" (animacja) z delayem, żeby rozmowa miała rytm — nie wyrzucaj kilku zdań naraz.
7. **Kwestie gracza to dialog z VR.** Odpowiedzi gracza w czacie są liniami ze scenariusza (np. „MAJĄ JAKIEŚ WYTYCZNE DOTYCZĄCE TEMATU?"), nie meta-tekstem w stylu „Otwieram maila".
8. **Każdy etap kończy się jednoznacznym mostkiem.** Po ukończeniu etap odblokowuje **dokładnie jeden** następny cel, podświetla go i wysyła wiadomość mentora, która fabularnie mówi, co teraz zrobić. To zamienia „co dalej?" w „kliknij podświetlony kafelek".
9. **Kryterium ukończenia musi być sprawdzalne.** Silnik musi wiedzieć, kiedy odblokować następny etap: „wybrano opcję", „pasek 100%", „wszystkie sloty wypełnione". Rozmyte („gracz zrozumiał") się nie nadaje.
10. **Błąd krytyczny przerywa z jasnym komunikatem.** Przy decyzji `critical` silnik pokazuje ekran wykrycia z powodem i modal powtórki — gracz wie, co poszło nie tak.
11. **Kroki po kolei, z tempem.** Jedna aplikacja = jeden kafelek; kroki w środku to **sekwencyjne pełne ekrany** (bez zakładek, bez cofania), oddzielone krótkim **ekranem ładowania** (`ModuleLoader`). Akcje „komputerowe" (kompilacja, skan, wysyłka) mają trwać chwilę — nie dzieją się natychmiast. Mostek z mentorem i odblokowanie kolejnego kafelka następują **tylko na granicy aplikacji**.
12. **Cyber Kill Chain Order (Kolejność operacji).** Etapy misji muszą zachowywać naturalną sekwencję ataku: Rekonesans/OSINT → Uzbrojenie (wybór i kompilacja malware) → Dostarczenie (VPN / spoofing / mailing / phishing) → Egzekucja → Działania na celach (botnet / eksfiltracja / ransomware / negocjacje). Bezwzględny zakaz uzbrajania formularzy czy wysyłki przed skompilowaniem ładunku.
13. **Brak spoilerów w narracji (No Spoilers).** Dialogi w czacie (kwestie gracza i mentora) oraz wskazówki T1/T2 nie mogą zdradzać bezpośredniej odpowiedzi (np. gracz nie mówi: „podmienię jedną literę w domenie firmowej”, mentor nie podaje formatu poprawnej odpowiedzi). Gracz musi wywnioskować rozwiązanie samodzielnie w minigrze.
14. **Zero-Clicker Agency (Aktywne zaangażowanie).** Wyklucza się ekrany będące wyłącznie pasywnym klikaniem przycisku „DALEJ”. Każdy krok wymaga aktywności intelektualnej gracza (wybór wariantu, dopasowanie cechy, analiza logów, decyzja taktyczna).
15. **Wymóg kanonicznej specyfikacji (`scenario.md`).** Żadna misja nie może powstać w kodzie bez uprzedniego zatwierdzenia kanonicznego pliku `scenario.md` zgodnego z `docs/scenario-format.md`.
16. **Zadanie jest najwyraźniejszym tekstem na ekranie.** Każdy ekran aplikacji ma `AppHeader` z paskiem **ZADANIE** — jedno zdanie, co gracz ma teraz zrobić; po każdym kroku zdanie się aktualizuje.
17. **To, co się klika, wygląda inaczej niż to, co się czyta.** Opcje wyboru zawsze w `ChoiceZone`/`ChoiceTile`; karty informacyjne (fakty, podglądy, notatki) bez ramki-przycisku i bez hovera.

## Co scenariusz musi nieść, żeby to ustawić

Dla każdego etapu agent potrzebuje ze scenariusza:
- **cel etapu** — jednym zdaniem, co gracz w tym momencie robi (to zasila podpowiedź i wiadomość mentora),
- **następny cel** — którą aplikację/kafelek etap odblokowuje i podświetla (`unlockIcons` + `highlightTile`),
- **kryterium ukończenia** — sprawdzalny warunek zamknięcia etapu,
- **mostek mentora** — skrypt rozmowy 1:1 z VR (`conversation`: naprzemiennie kwestie mentora i gracza); kwestia gracza odblokowuje kolejny etap,
- **typ kroku** — decyzja (podpowiedź naprowadza) czy czynność (podpowiedź wskazuje), bo od tego zależy brzmienie podpowiedzi.

Czego scenariusz **nie** opisuje: pulsowania, hoverów, dźwięków, badge'y, czasów T1/T2, animacji „pisze", ekranów ładowania. To są stałe mechanizmy silnika — agent je podpina, nie wymyśla per misja. Scenariusz dostarcza **treść** (kwestie z VR), silnik dostarcza **rytm**.

## Kontrola przed oddaniem misji

- Czy etapy misji zachowują kolejność Cyber Kill Chain (OSINT → Uzbrojenie → Dostarczenie → Egzekucja → Cele)?
- Czy w każdym momencie jest dokładnie jeden odblokowany, oznaczony i **podświetlony** cel?
- Czy żadne kliknięcie w czacie nie otwiera aplikacji (otwiera tylko klik kafelka przez gracza)?
- Czy kwestie gracza w czacie to dialog z VR bez spoilerów odpowiedzi do kolejnych decyzji?
- Czy każdy etap wymaga zaangażowania poznawczego (Zero-Clicker)?
- Czy każdy etap ma sprawdzalne kryterium ukończenia?
- Czy każdy etap odblokowuje następny, podświetla go i wysyła mostek mentora (kwestie z VR)?
- Czy podpowiedzi dla decyzji nie zdradzają odpowiedzi?
- Czy nieukończony krok trzyma przycisk „dalej" wyszarzony?
- Czy kroki aplikacji idą po kolei (osobne ekrany + loader), a nie w zakładkach?
- Czy w katalogu misji znajduje się kompletny, aktualny plik `scenario.md`?
