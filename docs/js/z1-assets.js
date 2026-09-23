// Wspólna obsługa ilustracji Z1 (zakres 37b).
// Jedynym źródłem ścieżek i rozmiarów jest data/z1-assets.js generowane z zatwierdzonego
// mapowania autora i manifestu pochodnych. Ten moduł nie trzyma drugiej listy ścieżek.
//
// Zasady z polecenia 39 §10: poprawne width/height i zarezerwowane proporcje przed
// ładowaniem, srcset/sizes wynikające z faktycznego pola, lazy dla dalszych sekcji,
// brak nowych punktów tabulacji. Gdy obrazu nie ma, zostają teksty, nawigacja i zadanie,
// a pole nie zapada się; nie przywracamy dawnych ilustracji ani nie pokazujemy ścieżki.
(function () {
  'use strict';
  var REJESTR = window.GOZ_Z1_ASSETS;

  function zasob(key) {
    return REJESTR && REJESTR.assets ? REJESTR.assets[key] : null;
  }

  function srcset(a) {
    return a.variants.map(function (v) { return v.file + ' ' + v.width + 'w'; }).join(', ');
  }

  // Domyślny wariant: najmniejszy, który pokrywa typowe pole; przeglądarka i tak
  // wybiera po srcset/sizes, a src jest zapasem dla starszych silników.
  function domyslny(a) {
    for (var i = 0; i < a.variants.length; i++) {
      if (a.variants[i].width >= 1280) return a.variants[i];
    }
    return a.variants[a.variants.length - 1];
  }

  function ustaw(img, key, opcje) {
    var a = zasob(key);
    if (!a) return null;
    var o = opcje || {};
    img.src = domyslny(a).file;
    img.srcset = srcset(a);
    if (o.sizes) img.sizes = o.sizes;
    img.width = a.width;
    img.height = a.height;
    img.decoding = 'async';
    if (o.loading !== 'eager') img.loading = 'lazy';
    // Obrazy nie tworzą punktów tabulacji.
    img.removeAttribute('tabindex');
    img.draggable = false;
    var alt = typeof o.alt === 'string' ? o.alt : a.alt;
    img.alt = alt;
    if (!alt) img.setAttribute('role', 'presentation');
    img.dataset.z1Key = key;
    if (o.className) img.className = o.className;
    img.addEventListener('error', function () {
      // Brak pliku nie uruchamia generowania i nie przywraca dawnego obrazu.
      img.dataset.z1Error = '1';
      img.setAttribute('alt', '');
      img.setAttribute('role', 'presentation');
      if (img.parentNode && img.parentNode.classList) img.parentNode.classList.add('z1-img-missing');
    }, { once: true });
    img.addEventListener('load', function () {
      img.dataset.z1Loaded = '1';
      if (typeof o.onLoad === 'function') o.onLoad(img);
    }, { once: true });
    return img;
  }

  function utworz(key, opcje) {
    var a = zasob(key);
    if (!a) return null;
    return ustaw(document.createElement('img'), key, opcje);
  }

  // Pole o zarezerwowanych proporcjach — wysokość znana przed ładowaniem obrazu,
  // więc pomiar układu nie skacze po doładowaniu.
  function pole(key, opcje) {
    var a = zasob(key);
    if (!a) return null;
    var o = opcje || {};
    var box = document.createElement(o.tag || 'div');
    box.className = 'z1-figure' + (o.className ? ' ' + o.className : '');
    box.style.setProperty('--z1-ratio', a.width + ' / ' + a.height);
    var img = utworz(key, o);
    if (img) box.appendChild(img);
    return box;
  }

  function atrybuty(key, opcje) {
    var a = zasob(key);
    if (!a) return '';
    var o = opcje || {};
    var alt = typeof o.alt === 'string' ? o.alt : a.alt;
    var d = domyslny(a);
    return 'src="' + d.file + '" srcset="' + srcset(a) + '"' +
      (o.sizes ? ' sizes="' + o.sizes + '"' : '') +
      ' width="' + a.width + '" height="' + a.height + '"' +
      ' loading="' + (o.loading === 'eager' ? 'eager' : 'lazy') + '" decoding="async"' +
      ' alt="' + alt.replace(/"/g, '&quot;') + '"' + (alt ? '' : ' role="presentation"') +
      ' draggable="false" data-z1-key="' + key + '"';
  }

  // Znacznik pola razem z obrazem, do miejsc budowanych przez innerHTML.
  function znacznik(key, opcje) {
    var a = zasob(key);
    if (!a) return '';
    var o = opcje || {};
    return '<div class="z1-figure' + (o.className ? ' ' + o.className : '') +
      '" style="--z1-ratio: ' + a.width + ' / ' + a.height + '"><img ' + atrybuty(key, o) + '></div>';
  }

  // Montaż znaczników deklaratywnych: <div data-z1-image="entry" data-z1-sizes="..."></div>
  function mountAll(root) {
    var lista = (root || document).querySelectorAll('[data-z1-image]');
    Array.prototype.forEach.call(lista, function (node) {
      if (node.dataset.z1Mounted) return;
      var key = node.dataset.z1Image;
      var a = zasob(key);
      if (!a) return;
      node.style.setProperty('--z1-ratio', a.width + ' / ' + a.height);
      node.classList.add('z1-figure');
      var img = utworz(key, {
        sizes: node.dataset.z1Sizes,
        loading: node.dataset.z1Loading,
        alt: typeof node.dataset.z1Alt === 'string' ? node.dataset.z1Alt : undefined
      });
      if (!img) return;
      node.appendChild(img);
      node.dataset.z1Mounted = '1';
    });
  }

  // Podmiana obrazu w istniejącym polu (przykład książki) — bez skoku wysokości,
  // bo pole zachowuje proporcje poprzedniego wariantu do czasu ustawienia nowych.
  function podmien(box, key, opcje) {
    var a = zasob(key);
    if (!a || !box) return null;
    box.classList.remove('z1-img-missing');
    box.style.setProperty('--z1-ratio', a.width + ' / ' + a.height);
    var img = box.querySelector('img');
    if (!img) {
      img = utworz(key, opcje);
      if (img) box.appendChild(img);
      return img;
    }
    // Nowy element zamiast mutowania: stare zdarzenia load/error nie zostają.
    var nowy = utworz(key, opcje);
    if (!nowy) return null;
    box.replaceChild(nowy, img);
    return nowy;
  }

  window.GOZ1Assets = {
    has: function (key) { return !!zasob(key); },
    get: function (key) { var a = zasob(key); return a ? { alt: a.alt, width: a.width, height: a.height, ratio: a.ratio, object: a.object, variants: a.variants.slice() } : null; },
    keys: function () { return REJESTR && REJESTR.assets ? Object.keys(REJESTR.assets) : []; },
    revision: function () { return REJESTR ? REJESTR.revision : null; },
    compositionLabel: function () { return REJESTR ? REJESTR.compositionLabel : ''; },
    img: utworz,
    figure: pole,
    markup: znacznik,
    attrs: atrybuty,
    mountAll: mountAll,
    replace: podmien
  };
})();
