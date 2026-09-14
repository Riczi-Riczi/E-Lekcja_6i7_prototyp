# Eksperci GOZ — podgląd do konsultacji

Interaktywna lekcja dla klas 6–7. Wersja robocza po redakcji A, 14.09.2026.

Zadania, zapis postępu w przeglądarce, memory, edytor 2D i dyplom działają. Filmy, nagrania oraz część grafik i oznaczeń pozostają do uzupełnienia. To podgląd do oceny, nie finalny materiał do wdrożenia w szkołach.

Strona znajduje się w katalogu `docs`. GitHub Pages: Settings → Pages → Deploy from a branch → main → /docs. Nie wymaga instalowania zależności ani serwera aplikacji. Klient otrzymuje adres strony Pages i nie potrzebuje konta GitHub do publicznego podglądu.

Postęp zapisywany jest lokalnie na urządzeniu. Otwierając stronę w innej przeglądarce lub na innym urządzeniu, rozpoczynasz osobny zapis. Imię dyplomu nie jest zapisywane ani wysyłane przez aplikację.

Pliki testowe, dokumentacja robocza i narzędzia nie należą do tej paczki. Licencje zależności: docs/vendor/LICENSES.md.

## Hostinger

Hostinger wdraża cały katalog główny repozytorium, a strona leży w `docs`. Dlatego w katalogu głównym są dwa pliki:

- `.htaccess` — kieruje adres główny i wszystkie ścieżki wewnętrznie do `docs/` (bez tego adres główny zwracał błąd 403, bo nie było w nim `index.html`);
- `index.html` — zapasowe przekierowanie do `docs/`, gdyby serwer nie obsłużył reguł z `.htaccess`.

Po wysłaniu zmian na GitHub wdrożenie w hPanelu (Witryny → Git) trzeba uruchomić przyciskiem „Deploy”, jeśli nie jest włączone automatyczne wdrażanie. GitHub Pages działa bez zmian (main → /docs).

Pliki w `docs` są kopią lekcji z folderu roboczego `wdrozenie_v1`. Aktualizacja: `node tools/paczka-hostinger.cjs` (podgląd różnic), potem `--zapisz`, a następnie commit i push w tym repozytorium.
