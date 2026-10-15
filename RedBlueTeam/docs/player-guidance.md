# Reguły prowadzenia gracza

> Reguły dla agenta budującego misję z gotowego scenariusza. Jak ustawić etapy tak, aby gracz w każdej chwili wiedział, co ma zrobić.

## Zasada naczelna

**W każdej chwili dokładnie jeden następny krok jest jasno wskazany; wszystko inne jest nieaktywne i wizualnie odróżnione.**

W grze 2D cały pulpit jest na ekranie naraz. Gracz nie ma przestrzeni, która w VR sama kierowała uwagę (jeden obiekt w zasięgu ręki, światło, dźwięk z kierunku). Dlatego prowadzenie trzeba ustawić wprost — nie opisywać go w scenariuszu, tylko złożyć z mechanizmów silnika.

## Reguły

1. **Jeden aktywny cel.** Odblokowany jest tylko kafelek bieżącego etapu. Pozostałe są ukryte albo wyszarzone (`unlockedOnly` + `requiredUnlockId`). Gracz nie może „zgubić się" w aplikacji, która jeszcze nie ma sensu.
2. **Następny krok ma widoczny znacznik.** Kafelek kolejnego etapu dostaje powiadomienie `[1]` (`notificationBadges`). Gdy czeka odpowiedź na czacie — uwaga idzie na czat (callout na prawy monitor).
3. **Przejście dalej jest zablokowane, dopóki krok nie jest zrobiony.** Przycisk „dalej/zatwierdź" jest wyszarzony do spełnienia kryterium ukończenia, potem aktywny (zielony). Nigdy odwrotnie.
4. **Podpowiedź po bezczynności, dwa poziomy.** T1 subtelny (pulsowanie celu), T2 wyraźny (komunikat tekstowy, `WSKAZÓWKA [?]`). Dla **decyzji** podpowiedź naprowadza na myślenie („przypomnij sobie ustalenia z mentorem"), nie zdradza odpowiedzi. Dla **czynności** („otwórz aplikację", „przeciągnij plik") podpowiedź może wskazać obiekt wprost.
5. **Czat ma pierwszeństwo.** Kiedy mentor czeka na odpowiedź, gracz odpowiada, zanim odblokują się kolejne akcje na pulpicie. Dialog nie konkuruje z minigrą o uwagę w tym samym momencie.
6. **Każdy etap kończy się jednoznacznym mostkiem.** Po ukończeniu etap odblokowuje **dokładnie jeden** następny cel i wysyła wiadomość mentora, która fabularnie mówi, co teraz zrobić („Otwórz klienta poczty i przygotuj wiadomość"). To zamienia „co dalej?" w „kliknij to".
7. **Kryterium ukończenia musi być sprawdzalne.** Silnik musi wiedzieć, kiedy odblokować następny etap: „wybrano opcję", „pasek 100%", „wszystkie sloty wypełnione". Rozmyte („gracz zrozumiał") się nie nadaje.
8. **Błąd krytyczny przerywa z jasnym komunikatem.** Przy decyzji `critical` silnik pokazuje ekran wykrycia z powodem i modal powtórki — gracz wie, co poszło nie tak.

## Co scenariusz musi nieść, żeby to ustawić

Dla każdego etapu agent potrzebuje ze scenariusza:
- **cel etapu** — jednym zdaniem, co gracz w tym momencie robi (to zasila podpowiedź i wiadomość mentora),
- **następny cel** — którą aplikację/kafelek etap odblokowuje,
- **kryterium ukończenia** — sprawdzalny warunek zamknięcia etapu,
- **mostek mentora** — wiadomość, która kieruje do następnego etapu,
- **typ kroku** — decyzja (podpowiedź naprowadza) czy czynność (podpowiedź wskazuje), bo od tego zależy brzmienie podpowiedzi.

Czego scenariusz **nie** opisuje: pulsowania, hoverów, dźwięków, badge'y, czasów T1/T2. To są stałe mechanizmy silnika — agent je podpina, nie wymyśla per misja.

## Kontrola przed oddaniem misji

- Czy w każdym momencie jest dokładnie jeden odblokowany, oznaczony cel?
- Czy każdy etap ma sprawdzalne kryterium ukończenia?
- Czy każdy etap odblokowuje następny i wysyła mostek mentora z celem?
- Czy podpowiedzi dla decyzji nie zdradzają odpowiedzi?
- Czy nieukończony krok trzyma przycisk „dalej" wyszarzony?
