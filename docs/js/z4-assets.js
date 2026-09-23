// Z4: rejestr ilustracji ośmiu stanów odpadów i brązowego pojemnika (integracja 52, polecenie 55 §8).
// Klucze = identyfikatory bieżących danych (data/z4.js, pole art). Jeden kanoniczny adres każdego pliku
// w wejściu, przykładzie i kartach; bez kopii, parametrów omijających pamięć podręczną i bez wstępnego pobierania.
(function () {
  'use strict';
  var BASE = 'assets/images/z4/';
  var PLIKI = {
    eggshells: '01-skorupki.webp',
    grounds: '02-fusy.webp',
    bagWithPeelings: '03-obierki-w-woreczku.webp',
    peelings: '04-obierki.webp',
    bag: '05-woreczek.webp',
    bones: '06-kosci-osci.webp',
    meat: '07-resztki-miesa.webp',
    potatoesWithSauce: '08-ziemniaki-z-sosem.webp'
  };
  var POJEMNIK = 'kosz-brown.webp';
  // Wymiary plików (nagłówki WebP): stałe proporcje zapobiegają przesunięciom układu przy leniwym wczytaniu.
  var KARTA = [1536, 1024], KOSZ = [540, 1015];

  function url(id) { return id === 'bin' ? BASE + POJEMNIK : PLIKI[id] ? BASE + PLIKI[id] : null; }
  // Obraz dekoracyjny: pusty alt, bo pełną nazwę niesie etykieta tekstowa karty lub opis przykładu.
  function img(id, cls) {
    var u = url(id);
    if (!u) return '';
    var wh = id === 'bin' ? KOSZ : KARTA;
    return '<img class="' + (cls || 'z4-img') + '" src="' + u + '" width="' + wh[0] + '" height="' + wh[1] + '" alt="" loading="lazy" decoding="async" draggable="false">';
  }

  // Wejście Z4: brązowy pojemnik (zastępuje dawną ilustrację wektorową).
  function renderEntry(el) {
    if (!el || el.querySelector('.z4-entry-bin')) return;
    el.innerHTML = img('bin', 'z4-entry-bin');
  }

  // Przykład Z4-P1: stan początkowy (obierki w woreczku) albo po rozdzieleniu (obierki → pojemnik, woreczek osobno).
  // Pusty pojemnik nie udaje, że ma odpady w środku: strzałka prowadzi od obierek do pojemnika.
  function renderExample(fig, done, opis) {
    if (!fig) return;
    fig.setAttribute('role', 'img');
    fig.setAttribute('aria-label', opis);
    fig.classList.toggle('z4-example-done', !!done);
    fig.innerHTML = done
      ? '<div class="z4-example-row">' +
          '<span class="z4-example-item">' + img('peelings') + '</span>' +
          '<span class="z4-example-arrow" aria-hidden="true">→</span>' +
          '<span class="z4-example-bin">' + img('bin', 'z4-img z4-img-bin') + '</span>' +
        '</div>' +
        '<div class="z4-example-apart"><span class="z4-example-item">' + img('bag') + '</span></div>'
      : '<div class="z4-example-row"><span class="z4-example-item z4-example-single">' + img('bagWithPeelings') + '</span></div>';
  }

  // Brązowy pojemnik w polu BIO planszy — dodawany przez afterRender, idempotentnie.
  function decorateBoard(host) {
    if (!host) return;
    var bio = host.querySelector('.zone-bio');
    if (bio && !bio.querySelector('.z4-zone-bin')) {
      var span = document.createElement('span');
      span.className = 'z4-zone-bin';
      span.setAttribute('aria-hidden', 'true');
      span.innerHTML = img('bin', 'z4-img z4-img-bin');
      var title = bio.querySelector('.zone-title');
      if (title && title.nextSibling) bio.insertBefore(span, title.nextSibling); else bio.appendChild(span);
    }
  }

  window.GOZZ4Assets = { url: url, img: img, renderEntry: renderEntry, renderExample: renderExample, decorateBoard: decorateBoard, ids: Object.keys(PLIKI) };
})();
