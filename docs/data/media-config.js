// Konfiguracja mediów dostarczanych przez autora.
// Wpisz ścieżkę dopiero wtedy, gdy plik rzeczywiście istnieje w assets/.
// Brak wpisu = brak przycisku odtwarzania (nagranie) albo wersja tekstowa (film).
window.GOZ_MEDIA_CONFIG = {
  // Przykład: audio: { e00_t1: 'assets/audio/e00_t1.mp3' }
  audio: {},
  // Przykład: f01: { video: 'assets/video/f01.mp4', type: 'video/mp4', poster: 'assets/images/f01-poster.webp', captionsPl: 'assets/video/f01-pl.vtt' }
  films: {
    f01: { video: null, type: 'video/mp4', poster: null, captionsPl: null },
    f02: { video: null, type: 'video/mp4', poster: null, captionsPl: null }
  }
};
