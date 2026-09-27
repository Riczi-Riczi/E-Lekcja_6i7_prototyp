# Eksperci GOZ — podgląd do konsultacji

Interaktywna lekcja dla klas 6–7. Wersja robocza po pakiecie 71, aktualizacja podglądu 27.09.2026.

- Adres podglądu: https://lightskyblue-pony-763237.hostingersite.com/
- Adres zapasowy (GitHub Pages): https://riczi-riczi.github.io/E-Lekcja_6i7_prototyp/

To podgląd roboczy do oceny, nie finalny materiał do wdrożenia w szkołach. Do publicznego podglądu nie potrzeba konta GitHub. Strona ma znacznik `noindex, nofollow`, więc wyszukiwarki nie powinny jej indeksować; nie jest to zabezpieczenie dostępu — stronę otworzy każdy, kto zna adres.

## Co zawiera ta wersja

- Zadania, zapis postępu w przeglądarce, memory i dyplom.
- Z1 z aktualnymi grafikami stacji i przykładów.
- Z2 z realistycznymi ilustracjami: oględziny butów X i Y (plamy błota, odchodząca podeszwa) z czterema punktami obsługiwanymi myszą i klawiaturą, obrazy kart przed i po rozwiązaniu zadania, trzy sceny pokazu naprawy w warsztacie oraz pady A/B.
- Z2: w przykładzie „But ubrudzony błotem” ćwiczenie czyszczenia na modelu 3D (trzy narzędzia). Po ukończeniu Z2 personalizacja buta wyłącznie w 3D: obrót modelu, zmiana kolorów, zapis i odtworzenie projektu.
- Z3 z dotychczasową mapą i suwakiem oraz Z4 (BIO) z grafikami, rozdzieleniem opakowania i przeciąganiem albo wyborem kliknięciem.
- Teksty do nagrań w wersji 1.6 (`data/audio-manifest.js`).

Moduły 3D działają po otwarciu strony przez HTTP(S) (nie z pliku na dysku) w przeglądarce z obsługą WebGL.

## Znane braki tej wersji

- Brak nagrań MP3 i filmów F01/F02; w lekcji działają wersje tekstowe. Numer wersji 1.6 w `data/audio-manifest.js` oznacza wersję tekstów do nagrań, nie istnienie nagrań.
- Nowe ilustracje obejmują Z2. Ilustracje widżetu Z3 i pozostałe przygotowane grafiki czekają na osobną integrację; do tego czasu te miejsca pokazują dotychczasowe rysunki.
- Oznaczenia „wersja robocza” i placeholder dofinansowania zostają do czasu dostarczenia oryginalnych znaków.
- W ramce ćwiczenia czyszczenia widać dekoracyjny napis „X / BUT PO SPACERZE” (znana uwaga O-18). Poprawka jest zaplanowana osobno i nie weszła do tej wersji.
- Nie wykonano jeszcze prób na fizycznym telefonie, w Safari, z czytnikiem ekranu ani z uczniem.

Postęp zapisywany jest lokalnie na urządzeniu. Otwierając stronę w innej przeglądarce lub na innym urządzeniu, rozpoczynasz osobny zapis. Imię dyplomu nie jest zapisywane ani wysyłane przez aplikację.

Pliki testowe, dokumentacja robocza i narzędzia nie należą do tej paczki. Licencje zależności: docs/vendor/LICENSES.md oraz `vendor/LICENSE-three.txt` w obu modułach `docs/interaktywne/`.

## Hostinger i GitHub Pages

Strona znajduje się w katalogu `docs`. GitHub Pages: Settings → Pages → Deploy from a branch → main → /docs. Nie wymaga instalowania zależności ani serwera aplikacji.

Hostinger wdraża cały katalog główny repozytorium, a strona leży w `docs`. Dlatego w katalogu głównym są dwa pliki:

- `.htaccess` — kieruje adres główny i wszystkie ścieżki wewnętrznie do `docs/` (bez tego adres główny zwracał błąd 403, bo nie było w nim `index.html`);
- `index.html` — zapasowe przekierowanie do `docs/`, gdyby serwer nie obsłużył reguł z `.htaccess`.

Po wysłaniu zmian na GitHub oba adresy wdrażają się z istniejącego połączenia z repozytorium (Hostinger: połączenie Git w hPanelu; GitHub Pages: main → /docs); konfiguracji się nie zmienia. Po każdym push trzeba sprawdzić oba adresy w całości: wszystkie pliki `docs` muszą mieć sumy z commitu, a lekcja musi działać w przeglądarce. Sama odpowiedź HTTP 200 ani zgodny `index.html` nie potwierdzają wersji. Jeśli serwer jest już aktualny, a adres nadal podaje stare bajty plików JS/CSS, jest to pamięć podręczna CDN Hostingera: trzeba ją zdiagnozować i w razie potrzeby wyczyścić cache witryny przez osobę z uprawnieniami do hPanelu. Ponowne „Deploy”, dodatkowy commit ani odświeżenie przeglądarki tego nie naprawiają. Brak samego wdrożenia (serwer nadal ze starym commitem) rozpatruje się osobno od pamięci podręcznej.

Pliki w `docs` są kopią lekcji z folderu roboczego `wdrozenie_v1`. Aktualizacja: `node tools/paczka-hostinger.cjs` (podgląd różnic), potem `--zapisz`, a następnie commit i push w tym repozytorium. Pliki `assets/images/Znaczek-GOZ.png` i `.webp` nie są publikowane: po `--zapisz` usuwa się ich kopie z `docs/`, dlatego podgląd różnic pokazuje je jako „nowe”.
