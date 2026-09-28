# Eksperci GOZ — podgląd do konsultacji

Interaktywna lekcja dla klas 6–7. Wersja robocza po zbiorczym odbiorze grafik i poprawek 92, wydanie 2, z wcześniejszymi integracjami oceanu (88), Z3 (83) i poprawką etykiety czyszczenia (78). Zakres publikacji 94 z 28.09.2026.

- Adres podglądu: https://lightskyblue-pony-763237.hostingersite.com/
- Adres zapasowy (GitHub Pages): https://riczi-riczi.github.io/E-Lekcja_6i7_prototyp/

To podgląd roboczy do oceny, nie finalny materiał do wdrożenia w szkołach. Do publicznego podglądu nie potrzeba konta GitHub. Strona ma znacznik `noindex, nofollow`, więc wyszukiwarki nie powinny jej indeksować; nie jest to zabezpieczenie dostępu — stronę otworzy każdy, kto zna adres.

## Co zawiera ta wersja

- Zadania, zapis postępu w przeglądarce i dyplom. Nowe otwarcie przedstawia wspólną naprawę: wymontowane koło obok hulajnogi.
- Memory: ilustracje i podpisy wyśrodkowane, jednakowy znak recyklingu na rewersach, nietrafiona para zakrywa się po 1,8 sekundy. Trafione pary pozostają odkryte; dostępny także tryb odkrytych kart.
- Z5: plastikowy kompostownik z dolnym okienkiem, przekrój, składniki, etapy, stany przed/po i dżdżownice. Trzy warianty wilgoci tej samej sceny, w tym stojąca woda przy dnie w stanie zalania.
- Z6: ilustracje pojęć i powiązane grafiki memory.
- Z1 z aktualnymi grafikami stacji i przykładów.
- Ocean i mikroplastiki: ilustracje powierzchni, umownego powiększenia wody i skorupiaka z głębin; lupa przed obrazami oraz dwa doprecyzowane podpisy. Skala głębokości ma ilustrację krajobrazu podwodnego oraz ruchomą sondę i licznik 0–10 890 m; zachowuje oznaczenie badanego zakresu 7000–10 890 m. Krajobraz jest umowny, a skala nie pokazuje stężenia plastiku. Ilustracje nie są fotografiami z badania ani pomiarem liczby cząstek.
- Z2 z realistycznymi ilustracjami: oględziny butów X i Y (plamy błota, odchodząca podeszwa) z czterema punktami obsługiwanymi myszą i klawiaturą, obrazy kart przed i po rozwiązaniu zadania, trzy sceny pokazu naprawy w warsztacie oraz pady A/B.
- Z2: w przykładzie „But ubrudzony błotem” ćwiczenie czyszczenia na modelu 3D (trzy narzędzia). Po ukończeniu Z2 personalizacja buta wyłącznie w 3D: obrót modelu, zmiana kolorów, zapis i odtworzenie projektu.
- Z3: suwak porównujący hulajnogę z wcześniejszymi etapami (surowce, produkcja, transport) oraz lampka z rozdartym kloszem i alternatywami: wymiana klosza LUB zakup całej nowej lampki. Podpisy suwaka na dwóch poziomach; mapa i zadanie zachowują dotychczasowe działanie.
- Z4 (BIO) z grafikami, rozdzieleniem opakowania i przeciąganiem albo wyborem kliknięciem. Pole „Poza BIO” pokazuje ten sam brązowy pojemnik przekreślony czerwonym X; nie oznacza pojemnika na odpady zmieszane.
- W ćwiczeniu czyszczenia etykieta „BUT PO SPACERZE”, bez dawnego „X /” (poprawka 78).
- Teksty do nagrań w wersji 1.6 (`data/audio-manifest.js`).

Moduły 3D działają po otwarciu strony przez HTTP(S) (nie z pliku na dysku) w przeglądarce z obsługą WebGL.

## Znane braki tej wersji

- Brak nagrań MP3 i filmów F01/F02; w lekcji działają wersje tekstowe. Numer wersji 1.6 w `data/audio-manifest.js` oznacza wersję tekstów do nagrań, nie istnienie nagrań.
- Oznaczenia „wersja robocza”, placeholder dofinansowania i roboczy dyplom pozostają do czasu dostarczenia materiałów klienta. Otwarte są również potwierdzenie Z4-D1 i porządkowanie nieużywanych zasobów B-37.
- Otwarte pozostają realny zoom przeglądarki 200%, fizyczny telefon, Safari (także stan awaryjny ilustracji oceanu), czytnik ekranu (w tym zagnieżdżone ilustracje lampki), sprzętowe GPU oraz próby z uczniem. Emulacja szerokości i DPR nie zastępuje tych prób.

Postęp zapisywany jest lokalnie na urządzeniu. Otwierając stronę w innej przeglądarce lub na innym urządzeniu, rozpoczynasz osobny zapis. Imię dyplomu nie jest zapisywane ani wysyłane przez aplikację.

Pliki testowe, dokumentacja robocza i narzędzia nie należą do tej paczki. Licencje zależności: docs/vendor/LICENSES.md oraz `vendor/LICENSE-three.txt` w obu modułach `docs/interaktywne/`.

## Hostinger i GitHub Pages

Strona znajduje się w katalogu `docs`. GitHub Pages: Settings → Pages → Deploy from a branch → main → /docs. Nie wymaga instalowania zależności ani serwera aplikacji.

Hostinger wdraża cały katalog główny repozytorium, a strona leży w `docs`. Dlatego w katalogu głównym są dwa pliki:

- `.htaccess` — kieruje adres główny i wszystkie ścieżki wewnętrznie do `docs/` (bez tego adres główny zwracał błąd 403, bo nie było w nim `index.html`);
- `index.html` — zapasowe przekierowanie do `docs/`, gdyby serwer nie obsłużył reguł z `.htaccess`.

Oba adresy korzystają z istniejącego połączenia z repozytorium (Hostinger: Git w hPanelu; GitHub Pages: main → /docs). Konfiguracji się nie zmienia. Czułość nowych kontroli sprawdza się lokalnie na poprzednim commicie, bez pełnego publicznego odczytu starej wersji przed push. Przed publikacją trzeba ustalić osobę mającą dostęp do czyszczenia CDN tej witryny. Po zakończeniu wdrożenia nowego commitu ta osoba czyści CDN witryny na Hostingerze; czyszczenie przed push nie zastępuje tego kroku.

Na każdym adresie wymagane są dwa pełne zgodne odczyty wszystkich plików z manifestu nowego commitu oraz próba lekcji w przeglądarce. Drugi odczyt rozpoczyna się co najmniej 300 sekund po końcu pierwszego zgodnego odczytu danego adresu. Na Hostingerze oba zestawy odbiorcze wykonuje się po czyszczeniu CDN. Nie normalizuje się treści pobranych odpowiedzi ani nie dodaje parametrów omijających cache. Sam HTTP 200, zgodny HTML, Ctrl+F5 lub komunikat panelu o wyczyszczeniu nie potwierdzają odbioru.

Nagłówek `x-hcdn-cache-status` opisuje obsługę cache: HIT oznacza trafienie, MISS brak trafienia, a DYNAMIC odpowiedź niebuforowaną. DYNAMIC nie oznacza pominięcia CDN. `x-hcdn-request-id` identyfikuje żądanie przez CDN. Sam MISS nie dowodzi opróżnienia wszystkich węzłów; zgodność wersji ustala się na podstawie pełnych sum i prób lekcji.

Nie naprawiać starych odpowiedzi przez ponowne Deploy, dodatkowy commit, zmianę DNS lub `.htaccess`. Brak wdrożenia i niespójność CDN to osobne stany; sam odczyt z parametrem zapytania ich nie rozstrzyga. Jeśli Hostinger pozostaje niespójny, zgłosić konkretne pliki, sumy i czasy oraz stan „oczekuje”; adres klienta jest gotowy dopiero po pełnym odbiorze.

Aktualizacja 94 korzysta wyłącznie z odebranej paczki `pakiet_wykonawczy_v1/projekt_92/rewizja_2/paczka_publikacyjna/docs/` (298 plików) oraz przypiętego manifestu. Nie uruchamia się starego pakera z publikacji 90. Pliki `assets/images/Znaczek-GOZ.png` i `.webp` są wyłączone z paczki i nie występują w poprzednim commicie `docs/`; nie ma ich kopii do usunięcia.

Znana uwaga zapasowego Pages z odbioru 90: przeglądarka odebrała dodatkowy skrypt poza ścieżką lekcji, którego nie było w Git ani w odczycie HTTP. Źródło różnicy nie zostało ustalone. Przy publikacji 94 ponawia się porównanie w świeżym profilu; wynik i ruch są raportowane jawnie. Nie przypisywać przyczyny dostawcy bez dowodu.

Czyszczenie CDN nie usuwa lokalnego cache przeglądarki. Jeśli po poprawnym odbiorze odbiorca widzi dawny wygląd, należy spróbować wymuszonego odświeżenia lub okna prywatnego; nie jest to powód do kolejnego wdrożenia.
