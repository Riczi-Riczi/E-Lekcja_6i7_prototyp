# Eksperci GOZ — podgląd do konsultacji

Interaktywna lekcja dla klas 6–7. Wersja robocza po pakiecie 59, aktualizacja podglądu 23.09.2026.

- Adres podglądu: https://lightskyblue-pony-763237.hostingersite.com/
- Adres zapasowy (GitHub Pages): https://riczi-riczi.github.io/E-Lekcja_6i7_prototyp/

To podgląd roboczy do oceny, nie finalny materiał do wdrożenia w szkołach. Do publicznego podglądu nie potrzeba konta GitHub. Strona ma znacznik `noindex, nofollow`, więc wyszukiwarki nie powinny jej indeksować; nie jest to zabezpieczenie dostępu — stronę otworzy każdy, kto zna adres.

## Co zawiera ta wersja

- Zadania, zapis postępu w przeglądarce, memory i dyplom.
- Z1 z aktualnymi grafikami stacji i przykładów.
- Z2: w przykładzie „But ubrudzony błotem” ćwiczenie czyszczenia na modelu 3D (trzy narzędzia). Po ukończeniu Z2 personalizacja buta wyłącznie w 3D: obrót modelu, zmiana kolorów, zapis i odtworzenie projektu. Dawny edytor 2D został usunięty.
- Z3 z mapą oraz Z4 (BIO) z grafikami, rozdzieleniem woreczka i przeciąganiem albo wyborem kliknięciem.

Moduły 3D działają po otwarciu strony przez HTTP(S) (nie z pliku na dysku) w przeglądarce z obsługą WebGL.

## Znane braki tej wersji

- Brak nagrań MP3 i filmów F01/F02; w lekcji działają wersje tekstowe. Numer wersji w `data/audio-manifest.js` oznacza wersję tekstów do nagrań, nie istnienie nagrań.
- Oznaczenia „wersja robocza” i placeholder dofinansowania zostają do czasu dostarczenia oryginalnych znaków; część ilustracji jest robocza.
- W ramce ćwiczenia czyszczenia widać dekoracyjny napis „X / BUT PO SPACERZE”. Poprawka jest uzgodniona, ale nie weszła do tej wersji.
- Nie wykonano jeszcze prób na fizycznym telefonie, w Safari, z czytnikiem ekranu ani z uczniem.

Postęp zapisywany jest lokalnie na urządzeniu. Otwierając stronę w innej przeglądarce lub na innym urządzeniu, rozpoczynasz osobny zapis. Imię dyplomu nie jest zapisywane ani wysyłane przez aplikację.

Pliki testowe, dokumentacja robocza i narzędzia nie należą do tej paczki. Licencje zależności: docs/vendor/LICENSES.md oraz `vendor/LICENSE-three.txt` w obu modułach `docs/interaktywne/`.

## Hostinger i GitHub Pages

Strona znajduje się w katalogu `docs`. GitHub Pages: Settings → Pages → Deploy from a branch → main → /docs. Nie wymaga instalowania zależności ani serwera aplikacji.

Hostinger wdraża cały katalog główny repozytorium, a strona leży w `docs`. Dlatego w katalogu głównym są dwa pliki:

- `.htaccess` — kieruje adres główny i wszystkie ścieżki wewnętrznie do `docs/` (bez tego adres główny zwracał błąd 403, bo nie było w nim `index.html`);
- `index.html` — zapasowe przekierowanie do `docs/`, gdyby serwer nie obsłużył reguł z `.htaccess`.

Po wysłaniu zmian na GitHub wdrożenie w hPanelu (Witryny → Git) trzeba uruchomić przyciskiem „Deploy”, jeśli nie jest włączone automatyczne wdrażanie. GitHub Pages działa bez zmian (main → /docs).

Pliki w `docs` są kopią lekcji z folderu roboczego `wdrozenie_v1`. Aktualizacja: `node tools/paczka-hostinger.cjs` (podgląd różnic), potem `--zapisz`, a następnie commit i push w tym repozytorium. Pliki `assets/images/Znaczek-GOZ.png` i `.webp` nie są publikowane: po `--zapisz` usuwa się ich kopie z `docs/`, dlatego podgląd różnic pokazuje je jako „nowe”.
