# Zależności zewnętrzne

Stan: 13.09.2026, etap 3. Pobrano wyłącznie pliki dozwolone poleceniem `pakiet_wykonawczy_v1/10_PROMPT_ETAP_3_FINAL.md`. Strona ucznia korzysta z nich lokalnie i nie pobiera niczego z CDN. Font Noto Sans służy tylko do pliku PDF dyplomu; strona nadal używa fontów systemowych (`system-ui`, „Segoe UI”, Arial).

| Zależność | Wersja | Plik lokalny | Źródło pobrania | Licencja | Użycie |
|---|---|---|---|---|---|
| jsPDF, kompilacja UMD (jeden plik) | 4.2.1 (w nagłówku pliku: „Version 4.2.1 Built on 2026-03-17”), przypięta | `vendor/jspdf.umd.min.js` (420 165 B, SHA-256 base64 `5lUfzcMvCdaFOyxRJtGNAdlEfg2mGKQaEevu4PbCDVQ=`, zgodna z sumą publikowaną przez jsDelivr) | https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js | MIT — `vendor/jspdf-LICENSE.txt` (https://cdn.jsdelivr.net/npm/jspdf@4.2.1/LICENSE) | generowanie PDF dyplomu w przeglądarce, ładowane dopiero po wybraniu „Pobierz PDF” |
| Noto Sans Regular, TTF (bez hintingu) | 2.015 (tabela `name`, nameID 5) | `vendor/fonts/NotoSans-Regular.ttf` (431 364 B, SHA-256 `f3961a9cde016d41a4879aecda1474d3a36d6bf54fa0e4643de029cc2248b0e8`) | projekt Noto: https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSans/unhinted/ttf/NotoSans-Regular.ttf | SIL Open Font License 1.1 — `vendor/fonts/OFL.txt` | font osadzony w PDF dyplomu (polskie znaki) |
| Noto Sans Bold, TTF (bez hintingu) | 2.015 | `vendor/fonts/NotoSans-Bold.ttf` (432 376 B, SHA-256 `87cb2d84472a7d66da659ee47b6cdb9552326e8c128245231f191b6ac72529d9`) | projekt Noto: https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSans/unhinted/ttf/NotoSans-Bold.ttf | SIL Open Font License 1.1 — `vendor/fonts/OFL.txt` (https://github.com/notofonts/notofonts.github.io/raw/main/fonts/LICENSE) | font osadzony w PDF dyplomu (nagłówki) |

Uwagi:
- OFL 1.1 pozwala osadzać font w dokumentach. Nazwa „Noto Sans” jest nazwą zastrzeżoną w rozumieniu licencji; pliku fontu nie modyfikowano.
- jsPDF osadza w PDF cały plik TTF (bez podzbioru znaków), dlatego plik dyplomu ma około 0,97 MB (kompresja strumieni wyłączona, T-68).
- Innych bibliotek, wtyczek jsPDF, html2canvas ani DOMPurify nie pobrano. Dyplom nie korzysta z funkcji `html()`.
