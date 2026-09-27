// Projekt 82: lokalne renderowanie ilustracji Z3. Ścieżki wyłącznie w data/z3-assets.js.
(function () {
  'use strict';
  var R = window.GOZ_Z3_ASSETS;
  var SIZES = {
    compare: '(max-width: 600px) calc(100vw - 86px), (max-width: 800px) calc(100vw - 110px), (max-width: 900px) calc(100vw - 130px), (max-width: 1100px) calc(50vw - 122px), min(calc(50vw - 170px), 550px)',
    past: '(max-width: 600px) 160px, 180px',
    future: '(max-width: 600px) 104px, 180px'
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function asset(key) { return R && R.assets && R.assets[key]; }
  function markup(key, sizes) {
    var a = asset(key);
    if (!a) return '<span class="z3-image-note" role="status">Ilustracja jest niedostępna. Skorzystaj z podpisów.</span>';
    var src = a.variants[1];
    return '<img src="' + esc(src.file) + '" srcset="' + a.variants.map(function (v) { return esc(v.file) + ' ' + v.width + 'w'; }).join(', ') + '" sizes="' + esc(sizes) + '" width="' + a.width + '" height="' + a.height + '" loading="eager" decoding="async" alt="' + esc(a.alt) + '" draggable="false" data-z3-key="' + key + '">';
  }
  function comparison(key) {
    var pic = markup(key, SIZES.compare).replace('<img ', '<img class="z3-compare-picture" ');
    if (key === 'visible') return pic + '<p class="z3-product-lead">Gotowy<br>produkt</p><div class="z3-captions z3-captions-single"><span>Hulajnoga bez silnika</span></div>';
    return pic + '<div class="z3-captions"><span>Surowce</span><span>Produkcja</span><span>Transport</span></div>';
  }
  function state(key, caption, cls, sizes) {
    return '<figure class="z3-lamp-state ' + cls + '">' + markup(key, sizes) + '<figcaption>' + caption + '</figcaption></figure>';
  }
  function lamp() {
    return '<div class="z3-lamp">' + state('lamp-old', 'Już się wydarzyło:<br>produkcja starej lampki', 'z3-lamp-past', SIZES.past) +
      '<svg class="z3-branch" viewBox="0 0 300 36" aria-hidden="true" focusable="false"><path d="M150 0V14M48 34V14H252V34" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '<p class="z3-futures-title">Dwie możliwości od teraz</p><div class="z3-lamp-futures">' +
      state('lamp-repaired', 'Wymiana klosza', '', SIZES.future) + '<span class="z3-or">LUB</span>' +
      state('lamp-new', 'Zakup całej nowej lampki', '', SIZES.future) + '</div></div>';
  }
  function missing(img) {
    if (img.dataset.z3Error) return;
    var a = asset(img.dataset.z3Key), compare = img.closest('#z3-knowledge .compare');
    var host = compare || img.closest('#z3-example .z3-lamp-state');
    if (!host) return;
    img.dataset.z3Error = '1'; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    var note = document.createElement('p'); note.className = 'z3-image-note'; note.setAttribute('role', 'status');
    note.dataset.z3Missing = img.dataset.z3Key;
    note.textContent = 'Ilustracja jest niedostępna. Opis: ' + (a ? a.alt : 'Skorzystaj z podpisów.');
    if (compare) { var controls = host.querySelector('.compare-controls'); host.insertBefore(note, controls); }
    else host.appendChild(note);
  }
  document.addEventListener('error', function (e) { var i = e.target; if (i && i.tagName === 'IMG' && i.dataset.z3Key) missing(i); }, true);
  window.GOZ3Assets = { revision: function () { return R && R.revision; }, keys: function () { return R ? Object.keys(R.assets) : []; }, markup: markup, comparison: comparison, lamp: lamp };
})();
