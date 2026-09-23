// Rozdział 6: słownik, wykreślanka z widokiem powiększonym, dopasowanie znaczeń i karta sprawy 6.
// Specyfikacja: scenariusz 3.2 §9; pakiet 02 §2 (Z6) i §3 (zapis foundWords, revealed, meanings, confirmed, assisted).
(function () {
  'use strict';
  var P = window.GOZProgress, K = window.GOZ_KEYS, D = window.GOZ_Z6;
  var $ = function (id) { return document.getElementById(id); };
  var reduced = function () { return false; };
  var ws = null, meanings = null, completeSeen = null, zoomTrigger = null;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function fill(template, values) { return template.replace(/\{(\w)\}/g, function (m, k) { return values[k] !== undefined ? values[k] : m; }); }
  function t() { return P.get().tasks.Z6; }
  function wordsReady() { return t().revealed || t().foundWords.length === K.Z6.words.length; }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }

  function status(text) {
    $('z6-status').textContent = text;
    $('z6-zoom-status').textContent = text;
  }

  function renderDictionary() {
    [['z6-dictionary', true], ['z6-dictionary-task', false]].forEach(function (pair) {
      var list = $(pair[0]);
      D.dictionaryOrder.forEach(function (w) {
        var entry = D.dictionary[w];
        var li = el('li', 'dict-item');
        if (pair[1]) {
          var art = el('span', 'dict-art');
          art.setAttribute('aria-hidden', 'true');
          art.innerHTML = window.GOZArt3.dictionary(entry.art);
          li.appendChild(art);
        }
        var body = el('div', 'dict-body');
        body.appendChild(el('strong', null, entry.name));
        body.appendChild(el('span', null, ' - ' + entry.text));
        li.appendChild(body);
        list.appendChild(li);
      });
    });
  }

  function renderWordState() {
    var found = t().foundWords, revealed = t().revealed;
    var list = $('z6-word-list');
    list.innerHTML = '';
    var legend = [];
    K.Z6.words.forEach(function (w) {
      var isFound = found.indexOf(w) !== -1;
      var li = el('li', 'word-item' + (isFound ? ' is-found' : revealed ? ' is-revealed' : ''));
      li.appendChild(el('span', 'word-name', w));
      var state = isFound ? '✓ znalezione' : revealed ? 'odsłonięte' : 'do znalezienia';
      li.appendChild(el('span', 'word-state', state));
      list.appendChild(li);
      legend.push(w + ' (' + state + ')');
    });
    $('z6-zoom-legend').textContent = 'Słowa: ' + legend.join(', ') + '.';
    $('z6-word-count').textContent = 'Znalezione: ' + found.length + ' z 7' + (revealed ? ' · słowa odsłonięte' : '');
    $('z6-reveal').disabled = wordsReady();

    var fl = $('z6-found');
    fl.innerHTML = '';
    var shown = revealed ? K.Z6.words.filter(function (w) { return found.indexOf(w) === -1; }) : [];
    found.concat(shown).forEach(function (w) {
      var li = el('li', 'found-item');
      li.appendChild(el('strong', null, w + (found.indexOf(w) !== -1 ? ' ✓' : ' (odsłonięte)')));
      li.appendChild(el('span', null, D.dictionary[w].text));
      fl.appendChild(li);
    });
    $('z6-found-empty').hidden = fl.children.length > 0;
    $('z6-to-meanings').hidden = !wordsReady();
    $('z6-meanings-locked').hidden = wordsReady();
    $('z6-meanings-open').hidden = !wordsReady();
    if (ws) ws.render();
  }

  function renderResult() {
    var done = P.isComplete('Z6');
    $('z6-locked').hidden = done;
    $('z6-complete').hidden = !done;
    if (done && completeSeen === false && !reduced()) {
      var letter = $('z6-letter');
      if (letter) { letter.classList.remove('earned'); void letter.offsetWidth; letter.classList.add('earned'); }
    }
    completeSeen = done;
  }

  function renderAll() { renderWordState(); if (meanings) meanings.render(); renderResult(); }

  // --- Wykreślanka ---------------------------------------------------------------------------

  function initWordsearch() {
    ws = window.GOZWordsearch.create({
      data: D,
      home: $('z6-grid-home'),
      found: function () { return t().foundWords; },
      revealed: function () { return t().revealed; },
      status: status,
      onFound: function (word) {
        P.update(function (d) { if (d.tasks.Z6.foundWords.indexOf(word) === -1) d.tasks.Z6.foundWords.push(word); d.lastAnchor = 'z6-wordsearch'; }, { immediate: true, kind: 'z6' });
        var all = t().foundWords.length === K.Z6.words.length;
        status(fill(D.messages.found, { w: word, d: D.dictionary[word].text }) + (all ? ' ' + D.messages.allFound : ''));
        renderWordState();
      }
    });
    ws.init();

    $('z6-reveal').addEventListener('click', function () {
      P.update(function (d) { d.tasks.Z6.revealed = true; d.lastAnchor = 'z6-wordsearch'; }, { immediate: true, kind: 'z6' });
      ws.clear();
      status(D.messages.revealed);
      renderWordState();
      var link = $('z6-to-meanings');
      if (link) link.focus({ preventScroll: false });
    });
    $('z6-hint').addEventListener('click', function () {
      var box = $('z6-hint-text'); box.hidden = false; box.textContent = D.help;
    });
    $('z6-guided').addEventListener('click', function () {
      P.update(function (d) { d.tasks.Z6.assisted = true; }, { kind: 'z6' });
      var box = $('z6-hint-text');
      box.hidden = false;
      if (wordsReady()) { box.textContent = 'Słowa są już znalezione. Przejdź do dopasowania znaczeń - tam też jest pomoc.'; return; }
      var h = ws.hint();
      if (!h) return;
      var text = fill(D.messages.hintStart, { w: h.word, r: h.r, c: h.c });
      box.textContent = text + ' Wskaż tę literę, a potem ostatnią literę słowa.';
      status(text);
    });

    // Widok powiększony na małym ekranie: ta sama siatka w oknie z własnym przewijaniem; zamknięcie przywraca fokus.
    var dialog = $('z6-zoom');
    $('z6-zoom-open').addEventListener('click', function (e) {
      zoomTrigger = e.currentTarget;
      ws.moveTo($('z6-zoom-area'));
      document.documentElement.classList.add('ws-zoomed');
      dialog.showModal();
      ws.focusActive();
    });
    $('z6-zoom-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('cancel', function (e) { if (ws.hasAnchor()) { e.preventDefault(); ws.cancel(); } });
    dialog.addEventListener('close', function () {
      ws.moveTo($('z6-grid-home'));
      document.documentElement.classList.remove('ws-zoomed');
      if (zoomTrigger) zoomTrigger.focus();
    });
  }

  // --- Znaczenia ---------------------------------------------------------------------------

  function placedIn(word) {
    var m = t().meanings;
    return K.Z6.items.filter(function (s) { return m[s] === word; })[0] || null;
  }

  function initMeanings() {
    meanings = window.GOZSortTask.create({
      prefix: 'z6m', anchor: 'z6-meanings', layoutClass: 'layout-z6',
      poolTitle: 'Słowa', poolEmpty: 'Wszystkie słowa są przy sytuacjach.',
      zones: D.meanings.map(function (m, i) { return { id: m.id, label: 'Sytuacja ' + (i + 1) }; }),
      zoneExtra: function (z, box) {
        var m = byId(D.meanings, z.id);
        var block = el('div', 'text-block zone-case');
        block.id = 'audio-' + m.audio;
        block.appendChild(el('p', null, m.text));
        box.appendChild(block);
      },
      startMessage: 'Dopasuj trzy słowa. Poprawne odpowiedzi zostaną po sprawdzeniu.',
      items: function () { return K.Z6.meaningOptions; },
      item: function (id) { return { label: id }; },
      placement: function (id) { return placedIn(id); },
      canPlace: function (id, z) {
        if (z && t().confirmed.indexOf(z) !== -1) return 'Ta sytuacja jest już dobrze dopasowana. Wybierz inną.';
        return null;
      },
      setPlacement: function (d, id, z) {
        K.Z6.items.forEach(function (s) { if (d.tasks.Z6.meanings[s] === id) d.tasks.Z6.meanings[s] = null; });
        if (z) d.tasks.Z6.meanings[z] = id;
      },
      isConfirmed: function (id) { var s = placedIn(id); return !!s && t().confirmed.indexOf(s) !== -1; },
      applyConfirm: function (d, ids) {
        ids.forEach(function (word) {
          K.Z6.items.forEach(function (s) { if (d.tasks.Z6.meanings[s] === word && d.tasks.Z6.confirmed.indexOf(s) === -1) d.tasks.Z6.confirmed.push(s); });
        });
      },
      snapshot: function () { return JSON.stringify(t().meanings); },
      restore: function (d, snap) {
        var prev = JSON.parse(snap);
        K.Z6.items.forEach(function (s) { if (d.tasks.Z6.confirmed.indexOf(s) === -1) d.tasks.Z6.meanings[s] = prev[s]; });
      },
      isDone: function () { return K.Z6.items.every(function (s) { return t().confirmed.indexOf(s) !== -1; }); },
      doneText: 'Trzy znaczenia dopasowane.',
      doneLink: { label: 'Zobacz kartę i wniosek ↓', href: '#z6-result' },
      goodText: function (word) { var s = placedIn(word); return s ? byId(D.meanings, s).explanation : null; },
      countText: function (done) { return 'Dobrze dopasowane: ' + done + ' z 3'; },
      evaluate: function () {
        var out = { confirm: [], feedback: {}, messages: [] }, missing = 0, wrong = 0;
        K.Z6.items.forEach(function (s, i) {
          if (t().confirmed.indexOf(s) !== -1) return;
          var word = t().meanings[s];
          if (!word) { missing++; return; }
          if (word === K.Z6.answers[s]) { out.confirm.push(word); return; }
          wrong++;
          out.feedback[word] = { kind: 'error', text: fill(D.messages.meaningError, { d: D.dictionary[word].text }) };
        });
        out.messages.push('Dobrze dopasowane: ' + (t().confirmed.length + out.confirm.length) + ' z 3.');
        if (missing) out.messages.push('Uzupełnij: ' + missing + (missing === 1 ? ' sytuacja czeka' : ' sytuacje czekają') + ' na słowo.');
        if (wrong) out.messages.push('Poprawne dopasowania zostają. Przy pozostałych przeczytaj znaczenie i spróbuj ponownie.');
        return out;
      },
      afterRender: function () { renderResult(); }
    });

    $('z6m-hint').addEventListener('click', function () { var box = $('z6m-hint-text'); box.hidden = false; box.textContent = D.meaningsHelp; });
    $('z6m-guided').addEventListener('click', function () {
      P.update(function (d) { d.tasks.Z6.assisted = true; }, { kind: 'z6' });
      var box = $('z6m-hint-text');
      box.hidden = false;
      var s = K.Z6.items.filter(function (x) { return t().confirmed.indexOf(x) === -1; })[0];
      if (!s) return;
      var m = byId(D.meanings, s), i = K.Z6.items.indexOf(s);
      var zone = $('z6m-zone-' + s);
      if (zone) { zone.classList.add('is-guided'); zone.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' }); }
      Array.prototype.forEach.call(document.querySelectorAll('#z6m-board .zone'), function (z) { if (z !== zone) z.classList.remove('is-guided'); });
      box.textContent = 'Sytuacja ' + (i + 1) + ': ' + m.text + ' Przeczytaj w słowniku znaczenia trzech słów i wybierz to, które opisuje tę sytuację. Umieść je przy sytuacji i wybierz „Sprawdź”.';
    });
  }

  window.GOZChapter6 = {
    init: function (options) {
      reduced = options.reducedMotion;
      renderDictionary();
      initWordsearch();
      initMeanings();
      meanings.init({ reducedMotion: reduced });
      renderAll();
      completeSeen = P.isComplete('Z6');
      P.onChange(function (kind) { if (kind !== 'anchor' && kind !== 'prefs') { renderWordState(); renderResult(); } });
    },
    reset: function () {
      if (ws) ws.clear();
      if (meanings) meanings.reset();
      $('z6-hint-text').hidden = true;
      $('z6m-hint-text').hidden = true;
      Array.prototype.forEach.call(document.querySelectorAll('#z6m-board .zone.is-guided'), function (z) { z.classList.remove('is-guided'); });
      status('Wskaż pierwszą literę słowa.');
      completeSeen = false;
      renderAll();
    },
    wordsearch: function () { return ws; },
    meanings: function () { return meanings; }
  };
})();
