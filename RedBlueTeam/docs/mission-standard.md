# Standard misji (wzorzec: M2 CarbonFlow)

Lista kontrolna misji 2+ ustalona na M2 po audycie właściciela. M1 (PetroLog) jest **samouczkiem**: prowadzi mocniej (np. „DOBRY WYBÓR!”) i jest jedynym wyjątkiem od reguł z sekcji „Treść”. Mechanika i komponenty: [`scenario-engine.md`](scenario-engine.md) (sekcja 3 „Konwencje”, sekcja 5 „Kontrakt”). Format scenariusza: [`scenario-format.md`](scenario-format.md). Ta lista nie powtarza tych dokumentów. Mówi, **jak** ich użyć, żeby misja wyglądała i grała jak M2.

Misja jest gotowa do audytu właściciela, gdy **każdy punkt poniżej jest spełniony albo opisany jako odchylenie** w `scenario.md` misji.

## Treść

- **VR jest źródłem prawdy.** Kolejność etapów, numeracja decyzji, opcje z poziomami, intro i mostki są 1:1 z dokumentem VR misji. Każde odejście (spójnik, klik zamiast przeciągania, dopisany tekst) trafia na listę **odchyleń** w `scenario.md`.
- **Treść naprowadza, interfejs milczy.** Mentor, OSINT i materiały mogą wskazywać dobrą odpowiedź, bo misja jest sprawdzianem czytania ze zrozumieniem. Ekran po wyborze pokazuje tylko postęp. Ocena trafia do raportu przez `onDecision`.
- **Opisy opcji są neutralne.** Opis mówi, czym rzecz jest (np. definicja robaka), a nie czy pasuje do celu. Opis z VR, który zdradza odpowiedź, zamień na neutralny i zapisz to jako odchylenie.
- **Dane w danych.** Teksty, opcje, adresy i liczby mieszkają w `stages.ts` / `data/*.json`, nie w JSX. Każda wartość ma jedno źródło (np. lista adresatów zasila import, wysyłkę i liczbę stacji). Wizualizacje liczą się z tych danych.
- **Realia zamiast numerów.** Gdzie ekran pokazuje ludzi lub rzeczy z fabuły (pracownicy, skrzynki, pliki), pokazuj je z nazwy: fikcyjne `imie.nazwisko@domena-celu`, z postaciami z VR na początku listy.
- **Raport końcowy.** Każda decyzja w `step6.choices` ma `attack` i `defense` (styl M1), a jej pytanie jest identyczne z ekranem.

## Interfejs

- **Skala M1.** Każdy ekran ma `AppHeader` z paskiem ZADANIE: jedno zdanie, co gracz robi teraz. Tekst do czytania ma co najmniej `text-xs`, a opisy kart `text-sm`–`text-base`. Elementy wypełniają szerokość ekranu: karta z kluczową informacją (np. biała lista VPN) idzie na pełną szerokość.
- **Bez przewijania.** Przy 1366×768 i 1920×1080 kontener aplikacji się nie przewija. Gdy się nie mieści, treść pomocnicza (podgląd maila, lista, notatki) idzie na **prawy monitor** (`SideMonitor`/`SidePanel`). Decyzja zapada per ekran.
- **Karty i wiersze.** Wybór na dużym ekranie to karty, na prawym monitorze to wiersze, a rozmowa to zawsze wiersze (`scenario-engine.md`, sekcja 3).
- **Grafika w kartach.** Opcje, które w VR są obrazami (np. szablony formularzy), mają kartę z obrazkiem. Pliki ładuje mechanizm assetów misji (`assets/<grupa>/`, zastępnik z nazwą pliku w dev). Właściciel wrzuca je sam.
- **Pomoc dostępna, nie nachalna.** Asysty (np. „ASYSTA AI” w VPN) to normalny przycisk w prawym górnym rogu ekranu.

## Tempo i interakcja

- **Jedno zatwierdzenie na decyzję.** Krok bez decyzji przechodzi dalej sam: krótki komunikat sukcesu (ok. 1–1,5 s), potem `onComplete()`. Przycisk „dalej” zostaje tam, gdzie gracz coś wybiera lub czyta.
- **Start z sedna.** Ekran startowy aplikacji to jeden duży przycisk akcji na środku (np. „NOWA KAMPANIA PHISHINGOWA”), bez osobnego „KONTYNUUJ”.
- **Każda akcja ma odzew.** Import, wysyłka, kompilacja: widoczne ładowanie z paskiem i licznikiem (ok. 1,5–2,5 s). Efekt pokazuje to, co się stało (skrzynki zapalające się po kolei), bez wykresów dla ozdoby.
- **Ręka jak w VR.** Przeciąganie z VR to przeciąganie w webie (zdarzenia wskaźnika). Wpisywanie liczb (oktety IP) jest z klawiatury: kropka lub Enter przechodzi dalej, wklejenie wypełnia całość. Przyciski +/- zostają jako alternatywa.
- **Czekanie = przeskok czasu.** Gdy fabuła mówi o czekaniu, mostek ma beat `time_jump`, a kafelek podświetla się 3 s po przeskoku (`scenario-engine.md`, sekcja 5; `scenario-format.md`).
- **Pamięć stanu.** Zamknięcie i ponowne otwarcie aplikacji w trakcie (także w trakcie ładowania) wraca do tego samego miejsca.

## Weryfikacja (przed oddaniem)

1. `npx vitest run` i `npx tsc -p tsconfig.app.json --noEmit` zielone (sprawdzaj kod wyjścia).
2. Testy misji `tests/missionN.test.ts`: kolejność etapów, spójność danych (każdy `appId` w `desktopApps`, każda decyzja 1..N w jednym etapie i w `step6.choices`), poziomy `suboptimal`/`critical`, mostki odblokowujące dopiero po kwestii gracza.
3. `node scripts/package-scorm.js --mission=N` buduje paczkę bez danych innych misji.
4. Przeglądarka (`?mission=N&dev=1`): każdy ekran przy 1366×768 i 1920×1080 bez przewijania, konsola czysta w **nowej karcie** po świeżym załadowaniu.
5. Niezależna recenzja (agent, który nie pisał kodu) przeciw tej liście i dokumentowi VR, potem poprawki.

## Proces (jak powstało M2)

Każdy etap to osobny agent i osobne commity: **struktura wg VR** (etapy, decyzje, mostki, raport, testy) → **wygląd** (ta lista) → **recenzja** → **poprawki** → **audyt właściciela** → tury poprawek z audytu. Commit po każdym zakończonym kroku.
