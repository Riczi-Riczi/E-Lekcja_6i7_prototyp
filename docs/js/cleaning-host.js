// I57 START naglowek
// Z2: dobrowolna praktyka czyszczenia buta w 3D w przykładzie „But ubrudzony błotem” (pakiet 57: dostępna od
// pierwszego wejścia, bez warunku zatwierdzenia X; ramka dopiero po kliknięciu). Nie zmienia tasks.Z2, nie daje litery,
// I57 END naglowek
// nie odblokowuje kolorowania. Maska brudu nie jest zapisywana: po zamknięciu w tej samej karcie ramka zostaje
// (wstrzymana), po odświeżeniu ćwiczenie zaczyna się od początku.
(function () {
  'use strict';
  var P = window.GOZProgress;
  var $ = function (id) { return document.getElementById(id); };
  var ctl = null;

  // I57 START bez-blokady
  function status(tekst) { $('clean3d-status').textContent = tekst; }
  // I57 END bez-blokady
  function pokaz(otwarte) {
    $('clean3d-work').hidden = !otwarte;
    $('clean3d-open').setAttribute('aria-expanded', String(otwarte));
  }

  function otworz() {
    // I57 START otworz
    // I57 END otworz
    if (window.GOZModule3D.zPliku()) { $('clean3d-file').hidden = false; return; }
    $('clean3d-fail').hidden = true;
    pokaz(true);
    if (!ctl.maRamke()) { status('Przygotowuję ćwiczenie 3D…'); ctl.uruchom(); }
    ctl.otworz();
    $('clean3d-title').focus({ preventScroll: false });
  }
  function zamknij(fokus) {
    if (ctl.otwarty()) ctl.zamknij(); else pokaz(false);
    if (fokus) $('clean3d-open').focus({ preventScroll: true });
  }

  function init() {
    if (!$('clean3d-module')) return;
    ctl = window.GOZModule3D.create({
      kanal: 'goz-cleaning3d',
      src: 'interaktywne/czyszczenie-buta/index.html',
      title: 'Ćwiczenie 3D: czyszczenie buta',
      mount: $('clean3d-frame'),
      obserwuj: $('clean3d-work'),
      dane: function () { return {}; },
      // I57 START gotowosc
      naGotowosc: function () { status('Możesz rozpocząć czyszczenie.'); },
      // I57 END gotowosc
      naBlad: function (powod) {
        $('clean3d-fail').hidden = false;
        $('clean3d-fail-lead').textContent = powod === 'limit-czasu'
          ? 'Ćwiczenie 3D nie uruchomiło się w ciągu 20 sekund.'
          : 'Ćwiczenie 3D jest teraz niedostępne w tej przeglądarce.';
        status('Ćwiczenie 3D jest niedostępne. Poniżej są trzy kroki opisane tekstem.');
      },
      naZamkniecie: function () { pokaz(false); }
    });

    $('clean3d-open').addEventListener('click', function () { if (ctl.otwarty()) zamknij(true); else otworz(); });
    $('clean3d-close').addEventListener('click', function () { zamknij(true); });
    // Po rzeczywistej awarii: jawny start od początku (stan poprzedniej ramki nie istnieje).
    $('clean3d-retry').addEventListener('click', function () {
      $('clean3d-fail').hidden = true;
      status('Ćwiczenie zaczyna się od początku…');
      ctl.uruchom();
      ctl.otworz();
    });

    P.onChange(function (kind) {
      if (kind === 'reset') {
        ctl.usun();
        if (ctl.otwarty()) ctl.zamknij();
        pokaz(false);
        $('clean3d-fail').hidden = true;
        $('clean3d-file').hidden = true;
        status('');
      }
      if (kind === 'prefs') window.GOZModule3D.odswiezRuch();
    // I57 START reset
    });
    // I57 END reset
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
