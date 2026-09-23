// Z2: dodatkowa pracownia projektowania buta 3D (integracja 52, polecenie 55 §4). Osobny trwały projekt
// optional.shoeDesign3D, niezależny od edytora 2D; bez punktów i liter. Ramka powstaje dopiero po ukończeniu Z2
// i świadomym otwarciu. Walidację i zapis wykonuje rodzic (GOZShoe3D.sanitize, GOZProgress.update).
(function () {
  'use strict';
  var P = window.GOZProgress;
  var $ = function (id) { return document.getElementById(id); };
  var TEKST_TYMCZASOWY = 'Projekt działa w tej karcie, ale nie został zapisany na później.';
  var ctl = null;

  function status(tekst) { $('shoe3d-status').textContent = tekst; }
  function zapisTrwaly() { return P.mode() === 'ok'; }

  function pokazPracownie(otwarta) {
    $('shoe3d-work').hidden = !otwarta;
    $('shoe3d-intro').hidden = otwarta;
    // I57 START bez-2d
    // I57 END bez-2d
  }

  function otworz() {
    if (!P.isComplete('Z2')) return;
    if (window.GOZModule3D.zPliku()) {
      $('shoe3d-file').hidden = false;
      return;
    }
    $('shoe3d-fail').hidden = true;
    pokazPracownie(true);
    if (!ctl.maRamke()) {
      $('shoe3d-save').disabled = true;
      status('Przygotowuję pracownię 3D…');
      ctl.uruchom();
    }
    ctl.otworz();
    $('shoe3d-title').focus({ preventScroll: false });
  }

  // I57 START zamkniecie
  // Zamknięcie pracowni: ramka zostaje wstrzymana (stan projektu jest w zapisie lekcji), wraca przycisk otwarcia.
  // I57 END zamkniecie
  function wroc(fokus) {
    if (ctl.otwarty()) ctl.zamknij(); else pokazPracownie(false);
    if (fokus) $('shoe3d-open').focus({ preventScroll: true });
  }

  function zapiszProjekt(surowy, zakonczony) {
    var projekt = window.GOZShoe3D.sanitize(surowy);
    if (!projekt) return false;
    projekt.finished = zakonczony;
    P.update(function (d) { d.optional.shoeDesign3D = projekt; }, { immediate: zakonczony, kind: 'shoe' });
    return true;
  }

  function awaria(powod) {
    $('shoe3d-save').disabled = true;
    $('shoe3d-fail').hidden = false;
    // I57 START awaria
    $('shoe3d-fail-text').textContent = powod === 'limit-czasu'
      ? 'Pracownia 3D nie uruchomiła się w ciągu 20 sekund. Możesz spróbować ponownie lub kontynuować lekcję.'
      : 'Nie udało się otworzyć pracowni 3D. Możesz spróbować ponownie lub kontynuować lekcję.';
    // Informacja o zachowanym projekcie tylko wtedy, gdy projekt istnieje, a zapis w przeglądarce działa.
    $('shoe3d-fail-saved').hidden = !(P.get().optional.shoeDesign3D && zapisTrwaly());
    // I57 END awaria
    status('Pracownia 3D jest niedostępna.');
  }

  // I57 START blokada
  // Blokada pracowni przejęta z dawnego renderLock edytora 2D: otwarta wyłącznie po ukończeniu Z2.
  function renderBlokada() {
    var otwarta = P.isComplete('Z2');
    $('shoe-locked').hidden = otwarta;
    $('shoe-open').hidden = !otwarta;
  }
  // I57 END blokada
  function init() {
    if (!$('shoe3d-module')) return;
    ctl = window.GOZModule3D.create({
      kanal: 'goz-shoe3d',
      src: 'interaktywne/but/index.html',
      title: 'Pracownia 3D: projektowanie buta',
      mount: $('shoe3d-frame'),
      obserwuj: $('shoe3d-work'),
      dane: function () { return { projekt: P.get().optional.shoeDesign3D || null }; },
      naGotowosc: function () {
        $('shoe3d-save').disabled = false;
        status(zapisTrwaly() ? 'Pracownia gotowa. Zmiany projektu 3D zapisują się w tej przeglądarce.' : TEKST_TYMCZASOWY);
      },
      naWiadomosc: function (typ, dane) {
        if (typ === 'zmiana') {
          if (!zapiszProjekt(dane.projekt, false)) return;
          if (!zapisTrwaly()) status(TEKST_TYMCZASOWY);
        } else if (typ === 'zapis') {
          if (!zapiszProjekt(dane.projekt, true)) { status('Nie udało się odczytać projektu. Spróbuj ponownie.'); return; }
          status(zapisTrwaly() ? 'Projekt 3D zapisany w tej przeglądarce.' : TEKST_TYMCZASOWY);
        }
      },
      naBlad: awaria,
      naZamkniecie: function () { pokazPracownie(false); }
    });

    $('shoe3d-open').addEventListener('click', otworz);
    $('shoe3d-back').addEventListener('click', function () { wroc(true); });
    $('shoe3d-save').addEventListener('click', function () {
      if (!ctl.gotowy()) return;
      ctl.wyslij('zapis', {});
    });
    $('shoe3d-retry').addEventListener('click', function () {
      $('shoe3d-fail').hidden = true;
      $('shoe3d-save').disabled = true;
      status('Przygotowuję pracownię 3D…');
      ctl.uruchom();
      ctl.otworz();
    });

    // Reset lekcji i nowy zapis: unieważniona sesja, usunięta ramka, pracownia ponownie zablokowana do ukończenia Z2.
    P.onChange(function (kind) {
      if (kind === 'reset') {
        ctl.usun();
        if (ctl.otwarty()) ctl.zamknij();
        pokazPracownie(false);
        $('shoe3d-fail').hidden = true;
        $('shoe3d-file').hidden = true;
        status('');
      }
      if (kind === 'prefs') window.GOZModule3D.odswiezRuch();
      if (kind === 'storage' && ctl.gotowy() && !zapisTrwaly()) status(TEKST_TYMCZASOWY);
    });
    // I57 START blokada-init
    // Zmiany postępu (poza projektem, kotwicą i preferencjami), reset i nowy zapis aktualizują blokadę bez przeładowania.
    P.onChange(function (kind) { if (kind !== 'shoe' && kind !== 'anchor' && kind !== 'prefs') renderBlokada(); });
    renderBlokada();
    // I57 END blokada-init
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
