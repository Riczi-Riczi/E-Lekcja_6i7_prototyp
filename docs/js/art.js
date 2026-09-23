// Ilustracje rozdziału Z1 pochodzą z zatwierdzonych grafik autora (zakres 37b) i są
// budowane wspólną obsługą js/z1-assets.js na podstawie data/z1-assets.js.
// Pozostałe robocze schematy SVG (sneaker, liść, fala) nie należą do Z1 i zostają bez zmian.
(function () {
  'use strict';
  var LIME = '#D9F294';

  function svg(viewBox, label, body) {
    return '<svg class="art-svg" viewBox="' + viewBox + '" role="img" aria-label="' + label + '" focusable="false">' + body + '</svg>';
  }

  var INK = '#123E34';

  // --- Ilustracje Z1: jedno źródło ścieżek i rozmiarów -----------------------------
  var A = function () { return window.GOZ1Assets; };
  function obraz(key, sizes, klasa) {
    var a = A();
    return a && a.has(key) ? a.markup(key, { sizes: sizes, className: klasa }) : '';
  }

  // Stacja 5: jedna hulajnoga i trzy alternatywne dalsze drogi.
  // Całość to jedna grupa role="img" z opisem z compositionLabel; obrazy w środku mają
  // pusty alt, a łączniki i powtórzone etykiety są ukryte przed czytnikiem.
  // Przyciski wyboru drogi i status są poza tą grupą (buduje je js/story.js).
  function kompozycjaDrog() {
    var a = A();
    if (!a || !a.has('normal')) return '';
    var dane = window.GOZ_Z1;
    var gałęzie = (dane && dane.branches) || [];
    var kafle = gałęzie.map(function (b) {
      return '<div class="z1-path">' +
        '<span class="z1-path-link" aria-hidden="true"></span>' +
        obraz(b.art, '(min-width: 1100px) 220px, 40vw', 'z1-path-media') +
        '<span class="z1-path-label" aria-hidden="true">' + b.title + '</span>' +
        '</div>';
    }).join('');
    // Układ wybrany po oględzinach przy 1440x900: obiekt u góry, trzy kafle w rzędzie
    // poniżej. Drugi dozwolony układ („obok”) jest w dowodach zrzutami do porównania —
    // w nim miniatury wychodziły wyraźnie mniejsze i trudniej je było odróżnić.
    return '<div class="z1-paths" data-uklad="pod" role="img" aria-label="' +
      String(a.compositionLabel()).replace(/"/g, '&quot;') + '">' +
      '<div class="z1-paths-source">' + obraz('normal', '(min-width: 1100px) 260px, 45vw', 'z1-path-object') + '</div>' +
      '<div class="z1-paths-branches">' + kafle + '</div>' +
      '</div>';
  }

  var arts = {
    // Stacje 1-4 i przykłady: zatwierdzone ilustracje autora w pełnym kadrze.
    raw: function () { return obraz('raw', '(min-width: 1100px) 44vw, 92vw'); },
    parts: function () { return obraz('parts', '(min-width: 1100px) 44vw, 92vw'); },
    product: function () { return obraz('product', '(min-width: 1100px) 44vw, 92vw'); },
    use: function () { return obraz('use', '(min-width: 1100px) 44vw, 92vw'); },
    paths: kompozycjaDrog,
    'branch-reuse': function () { return obraz('branch-reuse', '(min-width: 1100px) 220px, 40vw'); },
    'branch-service': function () { return obraz('branch-service', '(min-width: 1100px) 220px, 40vw'); },
    'branch-materials': function () { return obraz('branch-materials', '(min-width: 1100px) 220px, 40vw'); },
    'book-reuse': function () { return obraz('book-reuse', '(min-width: 900px) 520px, 92vw'); },
    'book-recycle': function () { return obraz('book-recycle', '(min-width: 900px) 520px, 92vw'); },
    game: function () { return obraz('game', '360px'); },
    // Otwarcie lekcji: sneaker i liść jako zapowiedź tematów (hulajnoga to osobny obraz).
    sneaker: function () {
      return svg('0 0 300 160', 'Sneaker - zapowiedź rozdziału o warsztacie',
        '<path d="M20 112C20 84 46 70 70 66L118 40C132 32 150 36 158 50L176 78C196 82 252 88 268 104C282 118 280 132 262 134H34C24 134 20 124 20 112Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M20 124H280" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M96 70l16 22M116 58l16 22M136 50l14 20" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M186 96h52" stroke="#37A46B" stroke-width="8" stroke-linecap="round"/>');
    },
    leaf: function () {
      return svg('0 0 160 160', 'Liść - zapowiedź rozdziałów o bioodpadach i kompostowaniu',
        '<path d="M28 132C18 70 60 20 138 22C142 98 98 142 28 132Z" fill="#37A46B"/><path d="M30 130C62 96 90 70 124 38" stroke="' + LIME + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M62 98l-4-26M86 76l-2-24M70 90l26 2M94 68l24 2" stroke="' + LIME + '" stroke-width="3" stroke-linecap="round"/>');
    },
    wave: function () {
      return svg('0 0 400 60', 'Woda - zapowiedź przystanku oceanicznego',
        '<path d="M0 30Q50 5 100 30T200 30T300 30T400 30" stroke="#38BDF8" stroke-width="6" fill="none"/><path d="M0 48Q50 23 100 48T200 48T300 48T400 48" stroke="#38BDF866" stroke-width="4" fill="none"/>');
    }
  };

  window.GOZArt = {
    render: function (name) { return arts[name] ? arts[name]() : ''; },
    mountAll: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll('[data-art]'), function (node) {
        if (!node.dataset.artMounted) { node.innerHTML = arts[node.dataset.art] ? arts[node.dataset.art]() : ''; node.dataset.artMounted = '1'; }
      });
    }
  };
})();
