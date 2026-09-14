// Szkielet lekcji: otwarcie, mapa, preferencja ruchu, komunikaty zapisu, ostatnie miejsce, paralaksa.
(function () {
  'use strict';
  var P = window.GOZProgress;
  var KEYS = window.GOZ_KEYS;
  var CHAPTERS = window.GOZ_CHAPTERS;
  var $ = function (id) { return document.getElementById(id); };
  var systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // --- Ruch -----------------------------------------------------------------

  function reducedMotion() {
    var pref = P.get().preferences.motion;
    if (pref === 'reduced') return true;
    if (pref === 'full') return false;
    return systemReduced.matches;
  }

  function applyMotion() {
    var reduced = reducedMotion();
    document.documentElement.classList.toggle('reduced-motion', reduced);
    $('motion-toggle').setAttribute('aria-pressed', String(reduced));
    if (reduced) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-parallax]'), function (n) { n.style.transform = ''; });
    }
  }

  // --- Zapis: komunikaty -------------------------------------------------------

  function renderStorage() {
    var banner = $('storage-banner');
    var mode = P.mode();
    var status = P.loadStatus();
    var newBtn = $('storage-new');
    if (mode === 'ok') { banner.hidden = true; return; }
    banner.hidden = false;
    newBtn.hidden = mode !== 'blocked';
    if (mode === 'blocked' && status === 'unknownVersion') {
      $('storage-message').textContent = 'W tej przeglądarce jest zapis z innej wersji lekcji. Nie zmieniliśmy go. Możesz kontynuować bez zapisywania albo rozpocząć nowy zapis tej wersji.';
    } else {
      $('storage-message').textContent = 'Nie udało się zapisać postępu. Możesz kontynuować, ale po zamknięciu strony wynik może zniknąć.';
    }
  }

  // --- Mapa i karty rozdziałów -------------------------------------------------

  function chapterStatus(ch) {
    if (ch.stop) return ch.built ? 'Przystanek bez zadania' : 'W przygotowaniu — wersja robocza';
    if (P.isComplete(ch.id)) return 'Ukończone';
    if (!ch.built) return 'W przygotowaniu — wersja robocza';
    return 'Do wykonania';
  }

  function chapterItem(ch, options) {
    var li = document.createElement('li');
    li.className = 'chapter-card' + (P.isComplete(ch.id) ? ' is-done' : '') + (ch.built ? '' : ' is-pending') + (ch.stop ? ' is-stop' : '');
    var num = document.createElement('span');
    num.className = 'chapter-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = ch.stop ? '•' : String(ch.number);
    li.appendChild(num);
    var body = document.createElement('div');
    body.className = 'chapter-body';
    var label = ch.stop ? 'Przystanek badawczy' : 'Rozdział ' + ch.number + ' z 6';
    var title;
    if (ch.built) {
      title = document.createElement('a');
      title.href = '#' + ch.anchor;
      if (options && options.map) title.setAttribute('data-map-link', '');
    } else {
      title = document.createElement('span');
    }
    title.className = 'chapter-title';
    title.textContent = ch.title;
    var small = document.createElement('span');
    small.className = 'chapter-label';
    small.textContent = label + ' · ' + ch.topic;
    body.appendChild(small);
    body.appendChild(title);
    var status = document.createElement('span');
    status.className = 'chapter-status';
    // Zdobyta karta: numer i nazwa bez litery (12 §3).
    var earned = !ch.stop && P.isComplete(ch.id);
    status.textContent = earned ? chapterStatus(ch) + ' · ' + window.GOZRewards.earnedLabel(ch.id) : chapterStatus(ch);
    body.appendChild(status);
    if (options && options.map && ch.built && !ch.stop && !P.isComplete(ch.id)) {
      var go = document.createElement('a');
      go.href = '#' + ch.taskAnchor;
      go.className = 'chapter-go';
      go.setAttribute('data-map-link', '');
      go.textContent = 'Przejdź do zadania';
      body.appendChild(go);
    }
    li.appendChild(body);
    return li;
  }

  function renderOverview() {
    var mission = $('mission-cards');
    mission.innerHTML = '';
    CHAPTERS.forEach(function (ch) { if (!ch.stop) mission.appendChild(chapterItem(ch)); });
    var map = $('map-list');
    map.innerHTML = '';
    CHAPTERS.forEach(function (ch) { map.appendChild(chapterItem(ch, { map: true })); });
    // Pasek i mapa mówią o zdobytych kartach; litery pojawiają się dopiero przy odsłanianiu w finale.
    $('map-progress').textContent = window.GOZRewards.progressText();
    $('topbar-progress').textContent = window.GOZRewards.progressText();
  }

  // --- Otwarcie: rozpoczęcie, kontynuacja, reset -------------------------------------

  function renderEntry() {
    var has = P.hasProgress();
    $('start-button').hidden = has;
    $('continue-button').hidden = !has;
    $('restart-button').hidden = !has;
    if (has) $('continue-button').href = '#' + P.get().lastAnchor;
  }

  var restartTrigger = null, mapTrigger = null;
  function openMap(trigger) { mapTrigger = trigger; renderOverview(); $('map-dialog').showModal(); }
  function askRestart(trigger) {
    restartTrigger = trigger;
    if ($('map-dialog').open) $('map-dialog').close();
    $('restart-dialog').showModal();
  }

  // Reset stanu modułów (odpowiedzi robocze, pomoc, imię na dyplomie, własny krok) po wyczyszczeniu zapisu.
  function resetModules() {
    window.GOZChapters.reset();
    window.GOZChapter6.reset();
    window.GOZRewards.reset();
    window.GOZMemory.reset();
    window.GOZShoeEditor.reset();
    window.GOZFinale.reset();
    $('migration-banner').hidden = true;
  }

  function doRestart() {
    $('restart-dialog').close();
    window.GOZMedia.pauseAll();
    P.reset();
    applyMotion();
    resetModules();
    renderAll();
    location.hash = '';
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('lesson-title').setAttribute('tabindex', '-1');
    $('lesson-title').focus({ preventScroll: true });
  }

  // --- Ostatnie miejsce ---------------------------------------------------------

  function trackAnchors() {
    if (!('IntersectionObserver' in window)) return;
    var visible = {};
    // Ostatnie miejsce zapisujemy dopiero po ruchu ucznia (przewinięcie, przejście kotwicą). Pierwsze powiadomienie obserwatora
    // przy otwarciu strony nie może nadpisać zapisanego miejsca otwarciem lekcji — inaczej „Kontynuuj” prowadziłoby zawsze do #entry (T-62).
    var moved = false, startY = window.scrollY;
    function best() {
      var b = null, ratio = 0;
      Object.keys(visible).forEach(function (k) { if (visible[k] > ratio) { ratio = visible[k]; b = k; } });
      return b;
    }
    function store() {
      var b = best();
      if (moved && b && b !== P.get().lastAnchor) P.update(function (s) { s.lastAnchor = b; }, { kind: 'anchor' });
    }
    function markMoved() { if (!moved) { moved = true; store(); } }
    window.addEventListener('scroll', function () { if (Math.abs(window.scrollY - startY) > 8) markMoved(); }, { passive: true });
    window.addEventListener('hashchange', markMoved);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.dataset.anchor] = e.isIntersecting ? e.intersectionRatio : 0; });
      store();
    }, { threshold: [0.15, 0.4, 0.7] });
    Array.prototype.forEach.call(document.querySelectorAll('[data-anchor]'), function (s) { observer.observe(s); });
  }

  // --- Paralaksa otwarcia rozdziału ------------------------------------------------

  function parallax() {
    var bg = document.querySelector('.z1-entry-bg');
    var section = $('z1-entry');
    var frame = 0;
    window.addEventListener('scroll', function () {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        if (reducedMotion() || window.innerWidth <= 800) { bg.style.transform = ''; return; }
        var r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var y = Math.max(-16, Math.min(16, -r.top * 0.04));
        bg.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
    }, { passive: true });
    bg.setAttribute('data-parallax', '');
  }

  // --- Źródła -----------------------------------------------------------------

  function renderSources() {
    var list = $('sources-items');
    var src = window.GOZ_SOURCES;
    window.GOZ_SOURCES_USED.forEach(function (id) {
      var li = document.createElement('li');
      li.id = 'source-' + id;
      var a = document.createElement('a');
      a.href = src[id].url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = '[' + id + '] ' + src[id].title;
      li.appendChild(a);
      if (src[id].note) { var note = document.createElement('p'); note.className = 'source-note'; note.textContent = src[id].note; li.appendChild(note); }
      list.appendChild(li);
    });
    document.addEventListener('click', function (e) {
      var fn = e.target.closest('a[data-source]');
      if (!fn) return;
      $('sources-list').open = true;
    });
  }

  // --- Z1-P1: przełącznik książki (pokaz, bez zaliczania) ------------------------------

  function bookDemo() {
    var captions = {
      reuse: 'Ponowne użycie: zachowujemy cały przedmiot. Książka służy kolejnej osobie.',
      recycle: 'Recykling: przetwarzamy materiał odpadu. Nie przekazujemy już tej samej książki.'
    };
    Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (b) {
      b.addEventListener('click', function () {
        var kind = b.dataset.book;
        Array.prototype.forEach.call(document.querySelectorAll('[data-book]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $('book-art').innerHTML = window.GOZArt.render('book-' + kind);
        $('book-caption').textContent = captions[kind];
      });
    });
  }

  // --- Rozwinięcia „Dowiedz się więcej” (redakcja A, 18 §3) ------------------------------------
  // Natywne <details>. Otwarcie nie uruchamia nagrania. Zamknięcie zatrzymuje nagranie z wnętrza dodatku i nie zostawia
  // fokusu w ukrytej treści. Kotwice #z2-repairability i #z5-worms otwierają swój dodatek (URL, odnośniki, mapa, „Kontynuuj”).

  function openAddonFor(hash) {
    var id = (hash || '').replace(/^#/, '');
    if (!id) return null;
    var details = document.querySelector('details[data-more-anchor="' + id + '"]');
    if (details && !details.open) details.open = true;
    return details;
  }

  function initMore() {
    // Ostatni element z fokusem: po zamknięciu dodatku przeglądarka może już przenieść fokus na body.
    var lastFocused = null;
    document.addEventListener('focusin', function (e) { lastFocused = e.target; });
    Array.prototype.forEach.call(document.querySelectorAll('details[data-more]'), function (details) {
      var summary = details.querySelector(':scope > summary');
      // Zamknięcie etykietą bez przeniesienia fokusu (np. aktywacja z technologii asystujących): zapamiętujemy, że fokus był w treści.
      var focusWasInside = false;
      summary.addEventListener('click', function () {
        var active = document.activeElement;
        focusWasInside = details.open && !!active && active !== summary && details.contains(active);
      }, true);
      details.addEventListener('toggle', function () {
        if (details.open) { focusWasInside = false; return; }
        window.GOZMedia.pauseInside(details);
        var active = document.activeElement;
        var lost = !active || active === document.body || (active !== summary && details.contains(active));
        var inside = focusWasInside || (lastFocused && lastFocused !== summary && details.contains(lastFocused));
        focusWasInside = false;
        if (lost && inside) summary.focus({ preventScroll: true });
      });
    });
    // Klik odnośnika działa także wtedy, gdy adres ma już tę kotwicę (zdarzenie hashchange wtedy nie występuje).
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a) openAddonFor(a.getAttribute('href'));
    });
    window.addEventListener('hashchange', function () { openAddonFor(location.hash); });
    openAddonFor(location.hash);
  }

  function renderAll() { renderOverview(); renderEntry(); renderStorage(); }

  // Przejście zapisu z treści 3.1 na 3.2: komunikat z 02 §5 pokazany raz po wczytaniu, bez nowego pola w zapisie.
  function renderMigration() {
    if (P.loadStatus() !== 'migrated') return;
    $('migration-message').textContent = 'Zmieniliśmy przykłady w zadaniu BIO. Rozwiąż ten rozdział ponownie. Postęp w pozostałych zadaniach został zachowany.';
    $('migration-banner').hidden = false;
  }

  // --- Start ------------------------------------------------------------------

  function init() {
    P.init();
    applyMotion();
    window.GOZArt.mountAll(document);
    // Teksty kart i nagrody rozdziałów przed montażem nagrań (tekst strony = tekst manifestu).
    window.GOZRewards.init();
    window.GOZStory.init({ reducedMotion: reducedMotion });
    window.GOZChapters.init({ reducedMotion: reducedMotion });
    window.GOZArt3.mountAll(document);
    window.GOZChapter6.init({ reducedMotion: reducedMotion });
    window.GOZMemory.init();
    window.GOZShoeEditor.init();
    window.GOZFinale.init({ reducedMotion: reducedMotion });
    // Odtwarzacze montujemy po zbudowaniu bloków tworzonych skryptem (karty zadań, obserwacje, składniki, sytuacje Z6).
    window.GOZMedia.init();
    initMore();
    renderSources();
    bookDemo();
    renderAll();
    renderMigration();
    trackAnchors();
    parallax();

    P.onChange(function (kind) {
      // Zmiany edytora buta i memory nie zmieniają liter ani mapy.
      if (kind === 'anchor' || kind === 'shoe' || kind === 'memory') { renderEntry(); return; }
      renderAll();
    });
    $('migration-close').addEventListener('click', function () { $('migration-banner').hidden = true; });

    $('motion-toggle').addEventListener('click', function () {
      var next = reducedMotion() ? 'full' : 'reduced';
      P.update(function (s) { s.preferences.motion = next; }, { immediate: true, kind: 'prefs' });
      applyMotion();
      window.GOZStory.refreshMode();
    });
    systemReduced.addEventListener('change', function () { applyMotion(); window.GOZStory.refreshMode(); });

    $('open-map').addEventListener('click', function (e) { openMap(e.currentTarget); });
    $('map-close').addEventListener('click', function () { $('map-dialog').close(); });
    $('map-dialog').addEventListener('close', function () { if (mapTrigger && !pendingMapNav) mapTrigger.focus(); pendingMapNav = false; });
    var pendingMapNav = false;
    $('map-dialog').addEventListener('click', function (e) {
      if (e.target === $('map-dialog')) { $('map-dialog').close(); return; }
      var link = e.target.closest('[data-map-link]');
      if (!link) return;
      // Przejście do innego miejsca mapą wstrzymuje narrację poprzedniej sceny.
      window.GOZMedia.pauseAll();
      pendingMapNav = true;
      $('map-dialog').close();
    });
    $('map-restart').addEventListener('click', function (e) { askRestart(e.currentTarget); });
    $('restart-button').addEventListener('click', function (e) { askRestart(e.currentTarget); });
    $('restart-cancel').addEventListener('click', function () { $('restart-dialog').close(); });
    $('restart-dialog').addEventListener('close', function () { if (restartTrigger && document.contains(restartTrigger) && !restartTrigger.hidden) restartTrigger.focus(); });
    $('restart-confirm').addEventListener('click', doRestart);
    $('storage-new').addEventListener('click', function () { P.startNewSave(); resetModules(); renderAll(); applyMotion(); });

    // Linki między rozdziałami (np. „Przejdź dalej”) wstrzymują nagranie.
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a && !a.closest('#z1-story')) window.GOZMedia.pauseAll();
    });

    window.addEventListener('pagehide', function () { P.flush(); });

    // Wejście bezpośrednio kotwicą innej sekcji — po wczytaniu obrazów przywracamy pozycję.
    window.addEventListener('load', function () {
      if (location.hash && location.hash.indexOf('#z1-stage-') !== 0) {
        var target = document.querySelector(location.hash);
        if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
  }

  window.GOZApp = { reducedMotion: reducedMotion, openMap: function (t) { openMap(t); }, askRestart: function (t) { askRestart(t); }, openAddonFor: openAddonFor };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
