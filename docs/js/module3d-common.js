// Wspólny kontrakt osadzenia modułów 3D (integracja 52, polecenie 55 §6): lokalna ramka, protokół wersji 1,
// sesja z crypto.getRandomValues, kontrola kanału, wersji, sesji, origin i source, limity wielkości i częstości,
// dopasowanie wysokości, limit gotowości 20 s, jedna aktywna pracownia naraz oraz wstrzymywanie poza widokiem.
(function () {
  'use strict';
  var WERSJA = 1;
  var LIMIT_GOTOWOSCI = 20000;
  var MAX_BAJTOW = 16384;
  var MAX_NA_SEKUNDE = 30;
  var WYSOKOSC_MIN = 240, WYSOKOSC_MAX = 6000;
  var TYPY_DZIECKA = ['gotowosc', 'init-ok', 'blad', 'wysokosc', 'zmiana', 'zapis'];
  var otwarty = null;
  var wszystkie = [];

  function sesja() {
    var a = new Uint8Array(16);
    window.crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join('');
  }
  function ograniczRuch() {
    if (window.GOZApp && window.GOZApp.reducedMotion) return window.GOZApp.reducedMotion();
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function zPliku() { return window.location.protocol === 'file:'; }

  // opts: kanal, src, title, mount (element ramki), obserwuj (sekcja widoczności), dane() → dane inicjalizacji,
  // naWiadomosc(typ, dane), naGotowosc(), naBlad(powod), naWysokosc(px) — opcjonalne.
  function create(opts) {
    var frame = null, id = null, gotowy = false, czyOtwarty = false, widoczny = true, timer = 0;
    var liczniki = {}, wysokoscTimer = 0, wysokoscDoUstawienia = 0, ostatniaWysokosc = 0, ostatnieUstawienie = 0, aktywnyWyslany = null;
    var ctl;

    function wyslij(typ, dane) {
      if (!frame || !frame.contentWindow || !id) return;
      frame.contentWindow.postMessage({ kanal: opts.kanal, wersja: WERSJA, sesja: id, typ: typ, dane: dane === undefined ? null : dane }, window.location.origin);
    }
    function aktywny() { return !!frame && gotowy && czyOtwarty && widoczny && !document.hidden; }
    function synchronizuj() {
      var a = aktywny();
      if (!frame || !gotowy || a === aktywnyWyslany) return;
      aktywnyWyslany = a;
      wyslij('aktywnosc', { aktywny: a, ograniczRuch: ograniczRuch() });
    }
    // Wysokość: skończona liczba z uzasadnionego zakresu, najwyżej co 100 ms (zmiana końcowa zawsze stosowana).
    function ustawWysokosc(px) {
      wysokoscDoUstawienia = px;
      var teraz = Date.now(), zaile = Math.max(0, 100 - (teraz - ostatnieUstawienie));
      if (wysokoscTimer) return;
      wysokoscTimer = setTimeout(function () {
        wysokoscTimer = 0; ostatnieUstawienie = Date.now();
        if (!frame || wysokoscDoUstawienia === ostatniaWysokosc) return;
        ostatniaWysokosc = wysokoscDoUstawienia;
        frame.style.height = ostatniaWysokosc + 'px';
        if (opts.naWysokosc) opts.naWysokosc(ostatniaWysokosc);
      }, zaile);
    }
    function wPrzedzialeCzestosci(typ) {
      var s = Math.floor(Date.now() / 1000);
      var l = liczniki[typ];
      if (!l || l.s !== s) l = liczniki[typ] = { s: s, n: 0 };
      l.n++;
      return l.n <= MAX_NA_SEKUNDE;
    }

    function odbierz(e) {
      if (!frame || e.source !== frame.contentWindow || e.origin !== window.location.origin) return;
      var m = e.data;
      if (!m || typeof m !== 'object' || Array.isArray(m) || m.kanal !== opts.kanal || m.wersja !== WERSJA || m.sesja !== id || TYPY_DZIECKA.indexOf(m.typ) === -1) return;
      var rozmiar;
      try { rozmiar = JSON.stringify(m).length; } catch (err) { return; }
      if (rozmiar > MAX_BAJTOW || !wPrzedzialeCzestosci(m.typ)) return;
      var dane = m.dane && typeof m.dane === 'object' && !Array.isArray(m.dane) ? m.dane : {};
      if (m.typ === 'gotowosc') {
        var d = opts.dane ? opts.dane() : {};
        d.ograniczRuch = ograniczRuch();
        wyslij('init', d);
      } else if (m.typ === 'init-ok') {
        if (gotowy) return;
        gotowy = true;
        clearTimeout(timer); timer = 0;
        aktywnyWyslany = null;
        synchronizuj();
        if (opts.naGotowosc) opts.naGotowosc();
      } else if (m.typ === 'blad') {
        awaria(typeof dane.powod === 'string' ? dane.powod.slice(0, 40) : 'blad');
      } else if (m.typ === 'wysokosc') {
        var px = Number(dane.px);
        if (!isFinite(px)) return;
        ustawWysokosc(Math.round(Math.min(WYSOKOSC_MAX, Math.max(WYSOKOSC_MIN, px))));
      } else if (opts.naWiadomosc && gotowy) {
        opts.naWiadomosc(m.typ, dane);
      }
    }
    window.addEventListener('message', odbierz);

    // Ramka powstaje dopiero przy świadomym otwarciu. Poprzednia sesja zostaje unieważniona.
    function uruchom() {
      if (zPliku()) return false;
      usun();
      id = sesja();
      gotowy = false; aktywnyWyslany = null; ostatniaWysokosc = 0; liczniki = {};
      frame = document.createElement('iframe');
      frame.title = opts.title;
      frame.className = 'm3d-frame';
      frame.setAttribute('allow', 'fullscreen');
      frame.src = opts.src + '?embed=1&kanal=' + encodeURIComponent(opts.kanal) + '&sesja=' + id;
      opts.mount.appendChild(frame);
      timer = setTimeout(function () { awaria('limit-czasu'); }, opts.limitGotowosci || LIMIT_GOTOWOSCI);
      return true;
    }
    function usun() {
      clearTimeout(timer); timer = 0;
      clearTimeout(wysokoscTimer); wysokoscTimer = 0;
      if (frame) {
        wyslij('reset');
        frame.remove();
      }
      frame = null; id = null; gotowy = false; aktywnyWyslany = null;
    }
    function awaria(powod) {
      usun();
      if (opts.naBlad) opts.naBlad(powod);
    }

    ctl = {
      uruchom: uruchom,
      usun: usun,
      maRamke: function () { return !!frame; },
      gotowy: function () { return gotowy; },
      otwarty: function () { return czyOtwarty; },
      wyslij: function (typ, dane) { if (gotowy) wyslij(typ, dane); },
      // Otwarcie zamyka drugą pracownię (z zachowaniem jej stanu w tej karcie).
      otworz: function () {
        if (otwarty && otwarty !== ctl) otwarty.zamknij();
        otwarty = ctl; czyOtwarty = true;
        if (window.GOZZ4Drag && window.GOZZ4Drag.cancelActive) window.GOZZ4Drag.cancelActive();
        synchronizuj();
      },
      zamknij: function () {
        czyOtwarty = false;
        if (otwarty === ctl) otwarty = null;
        synchronizuj();
        if (opts.naZamkniecie) opts.naZamkniecie();
      },
      synchronizuj: function () { aktywnyWyslany = null; synchronizuj(); }
    };

    if ('IntersectionObserver' in window && opts.obserwuj) {
      new IntersectionObserver(function (wpisy) {
        wpisy.forEach(function (w) { widoczny = w.isIntersecting; });
        synchronizuj();
      }).observe(opts.obserwuj);
    }
    document.addEventListener('visibilitychange', synchronizuj);
    wszystkie.push(ctl);
    return ctl;
  }

  // Zmiana preferencji ruchu w lekcji: aktywne ramki dostają nowy stan przy kolejnej synchronizacji.
  function odswiezRuch() { wszystkie.forEach(function (c) { c.synchronizuj(); }); }
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', odswiezRuch);

  window.GOZModule3D = { create: create, zPliku: zPliku, ograniczRuch: ograniczRuch, odswiezRuch: odswiezRuch };
})();
