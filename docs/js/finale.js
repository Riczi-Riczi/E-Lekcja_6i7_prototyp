// Karty i finał (K00 według 12_FINAL_KARTY_SPECYFIKACJA.md), otwieranie F02/K01/dyplomu, własny krok (K01) i zakończenie.
// Teksty kart: data/finale-cards.js (eksport finale_texts.json). Film F02: js/media.js. Dyplom: js/diploma.js.
(function () {
  'use strict';
  var P = window.GOZProgress, K = window.GOZ_KEYS, F = window.GOZ_FINALE, CH = window.GOZ_CHAPTERS, S = window.GOZ_SOURCES;
  var R = window.GOZRewards;
  var $ = function (id) { return document.getElementById(id); };
  var reduced = function () { return false; };
  var slots = {};

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function chapter(id) { return CH.filter(function (c) { return c.id === id; })[0]; }
  function T(key, id, extra) {
    var vars = id ? R.cardVars(id) : {};
    Object.keys(extra || {}).forEach(function (k) { vars[k] = extra[k]; });
    return R.text(key, vars);
  }
  function filmMissing() { var c = window.GOZ_MEDIA_CONFIG && window.GOZ_MEDIA_CONFIG.films && window.GOZ_MEDIA_CONFIG.films.f02; return !c || !c.video; }

  // --- Sześć miejsc kart w stałej kolejności Z1–Z6 ---------------------------------------------

  // Elementy miejsc tworzone raz; stan zmienia treść tych samych elementów (stabilny fokus na przycisku karty).
  function buildSlots() {
    var list = $('password-cards');
    K.order.forEach(function (id) {
      var c = R.card(id);
      var li = el('li', 'case-card');
      li.dataset.card = id;
      var btn = el('button', 'card-button');
      btn.type = 'button';
      btn.dataset.card = id;
      var face = el('span', 'card-face');
      var num = el('span', 'case-card-num', 'Karta ' + c.number);
      var title = el('span', 'case-card-title', c.title);
      var letter = el('span', 'case-card-letter');
      var cover = el('span', 'card-cover');
      cover.setAttribute('aria-hidden', 'true');
      face.appendChild(num); face.appendChild(letter); face.appendChild(title);
      btn.appendChild(face); btn.appendChild(cover);
      var note = el('span', 'card-note');
      var link = el('a', 'button card-link');
      link.href = '#' + chapter(id).taskAnchor;
      li.appendChild(btn); li.appendChild(note); li.appendChild(link);
      list.appendChild(li);
      slots[id] = { li: li, btn: btn, letter: letter, cover: cover, note: note, link: link };
    });
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.card-button');
      if (b) reveal(b.dataset.card, b);
    });
  }

  function renderCards() {
    var all = P.allComplete(), revealed = P.revealedCards(), remaining = K.order.length - revealed.length;
    K.order.forEach(function (id) {
      var s = slots[id], c = R.card(id), done = P.isComplete(id), isRev = revealed.indexOf(id) !== -1;
      var state = !done ? 'missing' : !all ? 'covered' : isRev ? 'revealed' : 'reveal';
      s.li.className = 'case-card is-' + state;
      s.btn.hidden = state === 'missing' || state === 'covered';
      s.note.hidden = state !== 'missing' && state !== 'covered';
      s.link.hidden = state !== 'missing';
      if (state === 'missing') {
        s.note.textContent = T('missingCard', id);
        s.link.textContent = T('finishChapter', id, { chapterTitle: chapter(id).title });
      } else if (state === 'covered') {
        s.note.textContent = T('covered', id);
      }
      // Litera nie istnieje w dokumencie (ani wizualnie, ani w nazwie dostępności) przed odsłonięciem.
      s.letter.textContent = isRev ? c.letter : '';
      s.letter.hidden = !isRev;
      s.cover.hidden = isRev && !s.cover.classList.contains('is-leaving');
      if (state === 'revealed') {
        s.btn.setAttribute('aria-disabled', 'true');
        s.btn.setAttribute('aria-label', T('revealed', id, { letter: c.letter }) + ' ' + c.title);
      } else if (state === 'reveal') {
        s.btn.removeAttribute('aria-disabled');
        var last = remaining === 1;
        s.btn.setAttribute('aria-label', last ? T('revealLast') + '. ' + T('reveal', id) : T('reveal', id));
        s.li.classList.toggle('is-last', last);
      }
    });
    // Instrukcja: braki / K00 (komplet zdobytych, niepełne odsłonięcie) / podsumowanie.
    var k00 = all && remaining > 0;
    $('audio-k00').hidden = !k00;
    if (!k00) window.GOZMedia.pauseInside($('password'));
    var intro = $('cards-intro');
    intro.hidden = k00;
    intro.textContent = !all ? T('missing') : remaining === 0 ? T('complete') : '';
    $('cards-film-note').hidden = !(k00 && filmMissing());
    var count = $('cards-count');
    count.hidden = !all;
    var lastHint = all && remaining === 1;
    count.textContent = T('revealCount', null, { count: revealed.length }) + (lastHint ? ' ' + T('revealLast') + '.' : '');
  }

  function renderLocks() {
    var open = P.finaleOpen();
    Array.prototype.forEach.call(document.querySelectorAll('[data-finale-locked]'), function (n) { n.hidden = open; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-finale-open]'), function (n) { n.hidden = !open; });
  }

  function renderClosing() {
    $('closing-progress').textContent = P.finaleOpen() ? T('closing') : 'Ukończone zadania: ' + P.completedCount() + ' z 6. Brakujące zadania i karty znajdziesz na mapie rozdziałów.';
  }

  function renderAll() { renderCards(); renderLocks(); renderClosing(); }

  // --- Odsłonięcie (jedna aktywacja = jedna karta) ---------------------------------------------

  function filmStatus(kind) {
    var box = $('final-film-status');
    box.textContent = '';
    if (!kind) return;
    box.appendChild(el('p', null, T(kind === 'blocked' ? 'playBlocked' : 'filmError')));
    var play = el('button', 'button primary', T('playFilm'));
    play.type = 'button';
    play.addEventListener('click', function () {
      filmStatus(null);
      window.GOZMedia.playFilm('f02').then(function (r) { if (r === 'blocked' || (r === 'error' && window.GOZMedia.hasFilm('f02'))) filmStatus(r); });
    });
    box.appendChild(play);
  }

  function reveal(id, btn) {
    if (btn.getAttribute('aria-disabled') === 'true') return; // ponowna aktywacja odsłoniętej karty: bez zmian i bez filmu
    var s = slots[id], c = R.card(id);
    // Okładka odsuwa się 250–350 ms; przy ograniczonym ruchu znika od razu (klasa przed zapisem, bo zapis odświeża widok).
    if (!reduced()) s.cover.classList.add('is-leaving');
    var result = P.revealCard(id);
    if (!result.ok) { s.cover.classList.remove('is-leaving'); return; }
    if (!reduced()) setTimeout(function () { s.cover.classList.remove('is-leaving'); renderCards(); }, 320);
    renderAll();
    if (!result.opened) {
      $('cards-status').textContent = T('revealStatus', id, { letter: c.letter, count: result.count });
      return;
    }
    // Ostatnia świadoma aktywacja: otwarty finał → zatrzymanie innych mediów → F02 → jedna próba play() w tej obsłudze.
    $('cards-status').textContent = T('complete');
    window.GOZMedia.pauseAll();
    filmStatus(null);
    var attempt = window.GOZMedia.playFilm('f02');
    var title = $('final-film-title');
    title.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'start' });
    title.focus({ preventScroll: true });
    attempt.then(function (r) {
      if (r === 'blocked') filmStatus('blocked');
      else if (r === 'error' && window.GOZMedia.hasFilm('f02')) filmStatus('error');
    });
  }

  // --- K01 i zakończenie ---------------------------------------------------------------------

  function initSteps() {
    var list = $('my-step-list');
    F.steps.forEach(function (s) {
      var li = el('li');
      var b = el('button', 'step-card', s.text);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
      li.appendChild(b);
      list.appendChild(li);
    });
    var idea = $('my-step-idea');
    idea.addEventListener('input', function () {
      var chars = Array.from(idea.value);
      if (chars.length > F.ideaMax) idea.value = chars.slice(0, F.ideaMax).join('');
      $('my-step-count').textContent = Array.from(idea.value).length + ' z ' + F.ideaMax + ' znaków';
    });
    var sum = $('final-summary');
    F.summary.forEach(function (line) { sum.appendChild(el('li', null, line)); });
  }

  function initClosing() {
    function fillSources(listId, design) {
      var list = $(listId);
      Object.keys(S).sort(function (a, b) { return Number(a.slice(1)) - Number(b.slice(1)); }).forEach(function (id) {
        if (!!S[id].design !== design) return;
        var li = el('li');
        li.id = 'closing-source-' + id;
        var a = el('a', null, '[' + id + '] ' + S[id].title);
        a.href = S[id].url; a.target = '_blank'; a.rel = 'noopener';
        li.appendChild(a);
        // Opis S10, S11, S16: komentarz źródłowy przekroju kompostownika (redakcja A, move_sources).
        if (S[id].note) li.appendChild(el('p', 'source-note', S[id].note));
        list.appendChild(li);
      });
    }
    fillSources('closing-sources', false);
    fillSources('closing-design-sources', true);
    $('closing-map').addEventListener('click', function (e) { window.GOZApp.openMap(e.currentTarget); });
    $('closing-restart').addEventListener('click', function (e) { window.GOZApp.askRestart(e.currentTarget); });
  }

  window.GOZFinale = {
    init: function (options) {
      reduced = options.reducedMotion;
      buildSlots();
      initSteps();
      initClosing();
      window.GOZDiploma.init(options);
      renderAll();
      // Synchronizacja stanu tylko odświeża widok; nigdy nie uruchamia filmu.
      P.onChange(function (kind) { if (kind !== 'anchor' && kind !== 'prefs' && kind !== 'shoe' && kind !== 'memory') renderAll(); });
    },
    reset: function () {
      $('cards-status').textContent = '';
      filmStatus(null);
      Array.prototype.forEach.call(document.querySelectorAll('#my-step-list [aria-pressed]'), function (b) { b.setAttribute('aria-pressed', 'false'); });
      $('my-step-idea').value = '';
      $('my-step-count').textContent = '0 z ' + F.ideaMax + ' znaków';
      window.GOZDiploma.reset();
      renderAll();
    },
    render: renderAll
  };
})();
