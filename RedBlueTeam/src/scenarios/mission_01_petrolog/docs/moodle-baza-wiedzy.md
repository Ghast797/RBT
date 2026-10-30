# Misja 1: PetroLog — baza wiedzy

> Materiał do kursu Moodle, umieszczany pod aktywnością SCORM „Misja 1 – PetroLog”. Najlepiej udostępnić go po ukończeniu scenariusza (Ograniczenia dostępu → Ukończenie aktywności).
> Nie trafia do paczki SCORM. Lekcje przy pojedynczych decyzjach gracz widzi w raporcie pooperacyjnym w grze. Ten materiał je uzupełnia i uogólnia.

## Co się wydarzyło w misji

Jako nowy członek grupy DarkSun wykradłeś dane firmy logistycznej PetroLog. Nie łamałeś zabezpieczeń technicznych. Wystarczyło przekonać jedną osobę, żeby sama otworzyła drzwi. Atak miał sześć kroków:

1. **Rozpoznanie firmy.** Budynek, serwerownia i dział sprzedaży były dobrze chronione. Słabym punktem okazała się księgowość: pośpiech, dziesiątki faktur w załącznikach i brak nawyku sprawdzania nadawcy.
2. **Wybór ofiary.** Spośród pracowników znalezionych w sieci wybrałeś osobę z publicznym profilem: Anitę Klimek z księgowości. Profil prywatny drugiej pracownicy zatrzymał atak na starcie.
3. **Biały wywiad (OSINT).** Z wpisów Anity w mediach społecznościowych dowiedziałeś się, że biega długie dystanse, szuka porad treningowych i biega po pracy z kolegą z pokoju, Jakubem Kwiatkowskim.
4. **Strona-pułapka.** Przygotowałeś blog biegowy z poradnikiem do pobrania, czyli dokładnie tym, o co Anita pytała publicznie. Do pliku dołączyłeś złośliwe oprogramowanie.
5. **Mail od „kolegi”.** Wysłałeś link w wiadomości podpisanej jako Jakub, z adresu w domenie firmy. Serwer pocztowy PetroLog nie sprawdził, czy nadawca jest prawdziwy.
6. **Przejęcie.** Anita kliknęła, pobrała plik, a Ty uzyskałeś dostęp do wewnętrznej sieci firmy i dokumentów o łańcuchu dostaw.

Żaden z tych kroków nie wymagał zaawansowanej techniki. Każdy opierał się na informacjach, które ofiara lub firma same udostępniły.

## 1. OSINT, czyli biały wywiad

**OSINT** (Open Source Intelligence) to zbieranie informacji z ogólnodostępnych źródeł: mediów społecznościowych, portali zawodowych, stron firmowych i wyszukiwarek. Nie jest nielegalny i nie wymaga włamania, dlatego to zwykle pierwszy krok ataku.

Co atakujący wyczyta z pozornie niewinnych wpisów:
- **gdzie pracujesz i na jakim stanowisku**, czyli czy jesteś dobrym celem,
- **z kim pracujesz**, czyli pod kogo się podszyć,
- **czym się interesujesz**, czyli jaką przynętę przygotować,
- **czego aktualnie szukasz**, czyli na jaką potrzebę odpowiedzieć „idealnym” plikiem.

**Jak się chronić**
- Ustaw profile prywatne i udostępniaj wpisy tylko znajomym.
- Nie łącz w jednym miejscu informacji o pracy, współpracownikach i życiu prywatnym.
- Przed publikacją zapytaj się: „Co obca osoba mogłaby z tym zrobić?”.

## 2. Spear-phishing, czyli atak szyty na miarę

Zwykły phishing to masowe maile do tysięcy osób, liczące na to, że ktoś się nabierze. **Spear-phishing** jest wymierzony w jedną, wybraną osobę i przygotowany na podstawie wywiadu. Wykorzystuje:
- **zaufanie**: nadawcą jest ktoś znajomy (kolega, przełożony, kontrahent),
- **trafność**: treść odpowiada na prawdziwą potrzebę lub zainteresowanie ofiary,
- **rutynę**: wiadomość wygląda jak jedna z wielu, które ofiara codziennie otwiera.

Im lepiej wiadomość pasuje do Ciebie, tym ostrożniej trzeba ją traktować. Mail, który „czyta w myślach”, nie jest przypadkiem.

## 3. Strony-pułapki i złośliwe pliki

Atakujący nie musi włamywać się na znaną stronę. Wystarczy postawić nową, wiarygodnie wyglądającą stronę z tematem bliskim ofierze i podsunąć link.

**Sygnały ostrzegawcze**
- Link do nieznanej strony prowadzi z maila lub wiadomości, a nie z Twojego wyszukiwania.
- Adres ma nietypową końcówkę (.info, .iq, .xyz) albo literówkę w znanej nazwie (*typosquatting*, np. `petro1og.com`).
- Treść jest „do pobrania” zamiast „do przeczytania”: poradnik jako plik, faktura w archiwum ZIP, dokument z prośbą o włączenie makr.
- Plik ma podwójne rozszerzenie lub jest programem (`poradnik.pdf.exe`, `.exe`, `.scr`, `.js`).

**Jak się chronić**
- Przed kliknięciem najedź kursorem na link i sprawdź prawdziwy adres docelowy.
- Porad i materiałów szukaj samodzielnie w wyszukiwarce lub na znanych serwisach.
- Nie pobieraj prywatnych plików na komputer służbowy.

## 4. Podszywanie się pod nadawcę (spoofing)

Pole „Od:” w mailu można wpisać dowolnie, tak jak adres zwrotny na kopercie. Jeśli serwer pocztowy firmy nie weryfikuje nadawców, fałszywy mail „od kolegi z pokoju” wygląda dokładnie jak prawdziwy.

**Co może zrobić pracownik**
- Zwracaj uwagę na ostrzeżenia programu pocztowego („nadawca zewnętrzny”, „nie można zweryfikować nadawcy”).
- Sprawdź, czy adres w polu „Odpowiedz do” jest taki sam jak adres nadawcy.
- Przy nietypowej prośbie potwierdź ją **innym kanałem**: zadzwoń albo zapytaj osobiście. Nie odpisuj na podejrzanego maila, bo odpowiedź trafi do atakującego.

**Co może zrobić firma**
- **SPF**: lista serwerów, które mogą wysyłać pocztę w imieniu domeny firmy.
- **DKIM**: cyfrowy podpis wiadomości, który potwierdza, że nikt jej nie zmienił po drodze.
- **DMARC**: reguła mówiąca serwerom odbiorców, co zrobić z mailem, który nie przeszedł SPF ani DKIM (np. odrzucić).

Gdyby PetroLog miał włączone te trzy mechanizmy, mail z adresu `k.kwiatkowski@petrolog.com` wysłany spoza firmy zostałby odrzucony albo wyraźnie oznaczony.

## Zanim klikniesz: lista kontrolna

- [ ] Czy spodziewałem się tej wiadomości?
- [ ] Czy nadawca zwykle pisze do mnie w tej sprawie i tym stylem?
- [ ] Czy prawdziwy adres linku (po najechaniu kursorem) prowadzi tam, gdzie powinien?
- [ ] Czy wiadomość mnie pogania albo gra na emocjach (ciekawość, strach, okazja)?
- [ ] Czy muszę coś pobrać, uruchomić lub włączyć, żeby zobaczyć treść?

Jeśli choć jedna odpowiedź budzi wątpliwość, zatrzymaj się i potwierdź wiadomość innym kanałem.

## Co zrobić, gdy już kliknąłeś

1. **Nie ukrywaj tego.** Od razu zgłoś sprawę do działu IT lub bezpieczeństwa. Liczą się minuty.
2. **Odłącz komputer od sieci**, jeśli tak mówi procedura firmy albo prosi o to dział IT.
3. **Nie usuwaj maila ani pliku.** To dowody potrzebne do analizy.
4. **Zmień hasła** do kont, na których mogłeś coś wpisać, ale zrób to z innego, bezpiecznego urządzenia.

Firma, w której zgłoszenie pomyłki nie grozi karą, wykrywa ataki szybciej.

## Słowniczek

| Pojęcie | Znaczenie |
|---|---|
| OSINT | Biały wywiad, czyli zbieranie informacji z publicznie dostępnych źródeł. |
| Phishing | Wiadomość podszywająca się pod zaufane źródło, by wyłudzić dane lub skłonić do kliknięcia. |
| Spear-phishing | Phishing przygotowany pod konkretną osobę na podstawie wywiadu. |
| Spoofing | Podszywanie się pod nadawcę, np. fałszowanie adresu w polu „Od:”. |
| Typosquatting | Rejestrowanie domen z literówką w znanej nazwie (`petro1og.com`). |
| Malware | Złośliwe oprogramowanie, np. program dający atakującemu zdalny dostęp. |
| SPF / DKIM / DMARC | Mechanizmy poczty, które pozwalają serwerom odróżnić prawdziwego nadawcę od podrobionego. |

## Pytania kontrolne (do quizu Moodle)

Prawidłowa odpowiedź jest oznaczona ✔. Pytania można przenieść do banku pytań jako pytania wielokrotnego wyboru.

1. **Dlaczego atak na PetroLog zaczął się od księgowości, a nie od serwerów?**
   - Serwery firmy były wyłączone.
   - ✔ Serwery były monitorowane całą dobę, a księgowość pracowała w pośpiechu i nie sprawdzała nadawców.
   - Księgowość miała najstarsze komputery.

2. **Co zatrzymało atak na pracownicę z prywatnym profilem?**
   - Silne hasło do konta.
   - ✔ Brak publicznych informacji, z których można było przygotować przynętę.
   - Program antywirusowy.

3. **Czym spear-phishing różni się od zwykłego phishingu?**
   - Jest wysyłany wyłącznie przez SMS.
   - ✔ Jest przygotowany pod konkretną osobę na podstawie informacji o niej.
   - Nie zawiera linków ani załączników.

4. **Dostajesz od kolegi z pokoju mail z linkiem do poradnika, o który pytałeś wczoraj w sieci. Co robisz?**
   - Klikam, bo znam nadawcę.
   - Odpisuję na maila z pytaniem, czy to on go wysłał.
   - ✔ Pytam kolegę osobiście lub telefonicznie, czy wysłał tę wiadomość.

5. **Który mechanizm pozwala serwerowi odbiorcy odrzucić maila podszywającego się pod domenę firmy?**
   - VPN
   - ✔ DMARC (razem z SPF i DKIM)
   - Zapora sieciowa (firewall) na komputerze pracownika

6. **Kliknąłeś w podejrzany link i pobrałeś plik. Co robisz najpierw?**
   - Usuwam plik i maila, żeby nikt się nie dowiedział.
   - ✔ Od razu zgłaszam sprawę do działu IT lub bezpieczeństwa.
   - Uruchamiam plik jeszcze raz, żeby sprawdzić, co robi.
