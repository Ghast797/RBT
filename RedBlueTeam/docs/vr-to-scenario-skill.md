# Skill: nagranie VR → scenariusz webowy (RedBlueTeam)

> Status: **PROJEKT do akceptacji.** Treść do wklejenia jako instrukcja agenta w zewnętrznym narzędziu (Gemini). Produkuje plik w formacie [`scenario-format.md`](scenario-format.md).

## Zadanie

Przepisujesz szkoleniową aplikację VR (świadomość cyberbezpieczeństwa) na wersję webową 2D obsługiwaną myszą. Na podstawie nagrania VR tworzysz **scenariusz**, z którego agent kodujący implementuje misję w gotowym silniku. Twój wynik ma dać mu komplet danych bez dopytywania.

Silnik ma już stałe konwencje i katalog klocków. Twoja praca to **przypisać interakcje do klocków i dostarczyć dane decyzji** — nie opisywać, jak wygląda VR.

## Czego NIE opisujesz

Silnik robi to sam w każdej misji. Pominięcie tego jest celowe, nie przeoczeniem:
- prowadzenie gracza (co podświetlić, pulsowanie, hover, „jedyny aktywny element"),
- podpowiedzi po bezczynności (T1/T2),
- dźwięki (klik, sukces, błąd, powiadomienie),
- mechanikę VR (laser, kostki 3D, rozglądanie się),
- kroki mechaniczne: „kliknij KONTYNUUJ", „kliknij ikonę", „odbierz połączenie".

Jeśli akcja gracza niesie tylko „przejdź dalej", nie jest osobnym krokiem. Krokiem jest **decyzja** albo **minigra**.

## Co dostarczasz

Dla każdego etapu (= jedna aplikacja pulpitu):
- **klocek** z katalogu albo `NOWA MINIGRA`,
- **cel dydaktyczny** w jednym zdaniu,
- każdą **decyzję**: pytanie z ekranu, opcje dosłownie, poziom każdej opcji, zdanie feedbacku,
- co etap **odblokowuje** i **wiadomość BYTE_MASTERA** mostkującą do kolejnego etapu,
- liniowe **dialogi** jako listę `BM:` / `GRACZ:`.

Katalog klocków (dopasuj interakcję do jednego):

| Klocek | Kiedy |
|---|---|
| `ChoiceCards` | wybór 1 z N kart z opisem |
| `DialogueTree` | rozmowa z NPC: węzły z opcjami |
| `Configurator` | suwaki/przełączniki ocenione łącznie (np. siła hasła) |
| `PoolSelect` | zaznacz właściwe z puli (cele / śmieci / pułapki) |
| `NOWA MINIGRA` | nic nie pasuje → opisz mechanikę, cel, dane wejściowe i co jest wynikiem |

## Trzy znaczniki — używaj ich zamiast zgadywać

Nagranie pokazuje **tylko ścieżkę idealną**. Silnik obsługuje też błędy, ale ich w nagraniu nie ma. Dlatego:

- `[DO ZAPROJEKTOWANIA]` — przy każdej decyzji wypisz wszystkie widoczne opcje. Dla opcji, której skutku nagranie nie pokazuje, **zaproponuj** poziom (`suboptimal`/`critical`) i feedback pod tym znacznikiem, jako sugestię do akceptacji. Nie podawaj ich jako faktu z nagrania.
- `[DO DECYZJI]` — mechanika VR nieprzenośna na mysz (gest, głębia, dwie ręce, zręczność). Opisz: na czym polega w VR, czemu nie przenosi się wprost, jaki cel dydaktyczny adaptacja musi zachować. **Nie proponuj rozwiązania** — wybiera użytkownik.
- `[NIEPEWNE]` — sprzeczność lub luka w materiale źródłowym.

Oddzielaj fakt z nagrania od wniosku. Fakt zapisuj wprost; wniosek (poziom opcji, cel) oznaczaj, gdy niepewny. Ruch kamery (obrót głowy) to nie zdarzenie w grze — pomijaj. Dźwięków nie transkrybuj.

## Dwa etapy pracy

**Etap 1 — spis scen.** Obejrzyj całość. Tabela: `ID | czas | nazwa | cel dydaktyczny (1 zd.) | co się dzieje (1–2 zd.) | klocek lub NOWA MINIGRA | znaczniki`. Zapisz i **zapytaj, czy podział jest dobry i od której sceny zacząć**. Nie idź dalej bez odpowiedzi.

**Etap 2 — scenariusz.** Dla zatwierdzonych scen wypełnij format [`scenario-format.md`](scenario-format.md). Czas pomijasz (jest tylko w spisie).

## Kontrola przed oddaniem

- Każda decyzja: pytanie + wszystkie opcje dosłownie + poziom każdej + feedback.
- Dokładnie jeden `ideal` na decyzję.
- Każdy etap: klocek lub `NOWA MINIGRA`, cel dydaktyczny, odblokowanie, wiadomość BM.
- Opcje spoza nagrania oznaczone `[DO ZAPROJEKTOWANIA]`, nie podane jako fakt.
- Mechaniki nieprzenośne oznaczone `[DO DECYZJI]` bez narzucania rozwiązania.
- Brak opisów prowadzenia, dźwięków, T1/T2, kroków „kliknij dalej".
- Na końcu: zbiorcza lista wszystkich `[DO DECYZJI]`, `[DO ZAPROJEKTOWANIA]`, `[NIEPEWNE]`.
```
