// Wspólna obsługa statycznych ilustracji Z2 (polecenie 71, pakiet 69).
// Jedynym źródłem ścieżek, rozmiarów i opisów jest data/z2-assets.js generowane przez tools/build-data.cjs
// z zatwierdzonej dostawy redakcja_69/zasoby_z2.json. Ten moduł nie trzyma drugiej listy ścieżek.
//
// Obraz dostaje width/height (rezerwacja proporcji przed ładowaniem), srcset/sizes i jeden opis alt.
// Gdy pliku nie ma, pole zachowuje wymiary i opis, obok pojawia się krótki komunikat bez przejęcia
// fokusu, a znaczniki oględzin na brakującym obrazie są ukrywane (klasa z2-img-missing w CSS).
// Nie wracamy do dawnych schematów SVG, które pokazywałyby inne uszkodzenie.
(function () {
  'use strict';
  var REJESTR = window.GOZ_Z2_ASSETS;
  var BRAK = 'Ilustracja jest niedostępna. Skorzystaj z opisu.';
  var POLA = '.inspect-stage, .shoe-art, .frame-art, .pad-art, .z2-entry-shoe';

  function zasob(key) {
    return REJESTR && REJESTR.assets ? REJESTR.assets[key] : null;
  }
  function srcset(a) {
    return a.variants.map(function (v) { return v.file + ' ' + v.width + 'w'; }).join(', ');
  }
  // Zapasowe src dla silników bez srcset: wariant środkowy.
  function domyslny(a) {
    return a.variants[Math.min(1, a.variants.length - 1)];
  }
  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  // Znacznik <img> do miejsc budowanych przez innerHTML. Opis: jawny alt albo opis z rejestru.
  function znacznik(key, opcje) {
    var a = zasob(key);
    if (!a) return '';
    var o = opcje || {};
    var alt = typeof o.alt === 'string' ? o.alt : a.alt;
    return '<img src="' + domyslny(a).file + '" srcset="' + srcset(a) + '"' +
      (o.sizes ? ' sizes="' + o.sizes + '"' : '') +
      ' width="' + a.width + '" height="' + a.height + '"' +
      ' loading="' + (o.loading === 'eager' ? 'eager' : 'lazy') + '" decoding="async"' +
      ' alt="' + esc(alt) + '" draggable="false" data-z2-key="' + key + '">';
  }

  function oznaczBrak(img) {
    img.dataset.z2Error = '1';
    var pole = img.closest(POLA);
    if (!pole || pole.classList.contains('z2-img-missing')) return;
    pole.classList.add('z2-img-missing');
    // Dekoracyjne wejście (pusty alt) nie potrzebuje komunikatu; opis zostaje w pozostałych miejscach.
    if (!img.getAttribute('alt')) return;
    var note = document.createElement('p');
    note.className = 'small-note z2-img-note';
    note.textContent = BRAK;
    pole.parentNode.insertBefore(note, pole.nextSibling);
  }

  // Obrazy powstają przez innerHTML, więc błąd ładowania łapie jeden nasłuch w fazie przechwytywania.
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.dataset && img.dataset.z2Key) oznaczBrak(img);
  }, true);

  window.GOZ2Assets = {
    has: function (key) { return !!zasob(key); },
    get: function (key) { var a = zasob(key); return a ? { alt: a.alt, width: a.width, height: a.height, ratio: a.ratio, source: a.source, variants: a.variants.slice() } : null; },
    keys: function () { return REJESTR && REJESTR.assets ? Object.keys(REJESTR.assets) : []; },
    revision: function () { return REJESTR ? REJESTR.revision : null; },
    markup: znacznik,
    missingText: BRAK
  };
})();
