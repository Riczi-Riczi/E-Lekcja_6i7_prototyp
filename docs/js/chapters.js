// Rozdziały 1–5 i przystanek oceaniczny: konfiguracje zadań oraz elementy pokazowe (bez zaliczania).
(function () {
  'use strict';
  var P = window.GOZProgress, K = window.GOZ_KEYS, S = window.GOZ_SOURCES;
  var $ = function (id) { return document.getElementById(id); };
  var reduced = function () { return false; };
  var tasks = {};

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function markText(p, text, fragment) {
    p.textContent = '';
    var i = fragment ? text.indexOf(fragment) : -1;
    if (i === -1) { p.textContent = text; return; }
    p.appendChild(document.createTextNode(text.slice(0, i)));
    p.appendChild(el('mark', null, fragment));
    p.appendChild(document.createTextNode(text.slice(i + fragment.length)));
  }
  function unique(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }

  // --- Z1 i Z2: dopasowanie z pulą wielokrotną ----------------------------------------

  function initMatchTasks() {
    tasks.Z1 = window.GOZMatchTask.create({
      prefix: 'z1', taskId: 'Z1', data: window.GOZ_Z1, key: K.Z1,
      startMessage: 'Dopasuj działania. Poprawne odpowiedzi zostaną po sprawdzeniu.',
      completeText: 'Wszystkie cztery sytuacje rozwiązane.',
      guidePrefix: function (c, i) { return 'Sytuacja ' + (i + 1); },
      // Zatwierdzone obiekty Z1: H1 i H2 ten sam obraz `normal`, H3 `repair`, H4 `retired`
      // — tak samo przed odpowiedzią i po niej. Alty są puste, bo stan opisują teksty kart.
      // Pod obrazem zostaje osobny wiersz etykiety, ukryty przed czytnikiem jak dotąd.
      imageFor: function (c) {
        var A = window.GOZ1Assets;
        var obraz = A && A.has(c.image) ? A.markup(c.image, { sizes: '(min-width: 900px) 360px, 45vw', alt: '' }) : '';
        var tag = '';
        if (c.image === 'repair') tag = '<span class="case-tag" aria-hidden="true">Przebita opona</span>';
        if (c.image === 'retired') tag = '<span class="case-tag tag-warn" aria-hidden="true">Ocena serwisu</span>';
        return '<div class="case-art case-art-z1">' + obraz + tag + '</div>';
      }
    });
    tasks.Z2 = window.GOZMatchTask.create({
      prefix: 'z2', taskId: 'Z2', data: window.GOZ_Z2, key: K.Z2,
      startMessage: 'Dopasuj działania. Poprawne odpowiedzi zostaną po sprawdzeniu.',
      completeText: 'Oba przypadki rozwiązane.',
      numberLabel: function (c) { return c.id; },
      guidePrefix: function (c) { return 'Przypadek ' + c.id; },
      imageFor: function (c, solved) {
        var state = solved ? 'clean' : c.image;
        var label = solved ? (c.id === 'X' ? 'But X po czyszczeniu' : 'But Y po naprawie połączenia i kontroli') : (c.id === 'X' ? 'But X z zaschniętym błotem' : 'But Y z odchodzącą podeszwą przy nosku');
        return '<div class="case-art shoe-art">' + window.GOZArt2.shoeSmall(state, label) + '</div>';
      }
    });
  }

  // --- Z2: oględziny, pokaz naprawy, pady --------------------------------------------------

  function initZ2Extras() {
    var D = window.GOZ_Z2;
    var grid = $('z2-inspect-grid');
    D.inspect.forEach(function (c) {
      var fig = el('article', 'inspect-case');
      fig.setAttribute('aria-labelledby', 'z2-inspect-' + c.id);
      var h = el('h3', null, c.title);
      h.id = 'z2-inspect-' + c.id;
      fig.appendChild(h);
      var stage = el('div', 'inspect-stage');
      stage.innerHTML = window.GOZArt2.render(c.state === 'mud' ? 'shoe-mud' : 'shoe-gap');
      var list = el('ol', 'observations');
      c.points.forEach(function (pt, i) {
        var hot = el('button', 'hotspot', String(i + 1));
        hot.type = 'button';
        hot.style.left = (pt.x / 1671 * 100) + '%';
        hot.style.top = (pt.y / 941 * 100) + '%';
        hot.setAttribute('aria-pressed', 'false');
        hot.setAttribute('aria-label', 'Punkt ' + (i + 1) + ': ' + pt.place + ' - przypadek ' + c.id);
        hot.dataset.point = pt.id;
        stage.appendChild(hot);
        var li = el('li', 'observation');
        li.id = 'z2-obs-' + pt.id;
        li.appendChild(el('span', 'obs-place', (i + 1) + '. ' + pt.place));
        var block = el('div', 'text-block');
        block.id = 'audio-' + pt.audio;
        block.appendChild(el('p', null, pt.text));
        li.appendChild(block);
        list.appendChild(li);
      });
      fig.appendChild(stage);
      fig.appendChild(list);
      grid.appendChild(fig);
    });
    grid.addEventListener('click', function (e) {
      var hot = e.target.closest('.hotspot');
      if (!hot) return;
      var on = hot.getAttribute('aria-pressed') !== 'true';
      Array.prototype.forEach.call(grid.querySelectorAll('.hotspot'), function (h) { h.setAttribute('aria-pressed', 'false'); });
      Array.prototype.forEach.call(grid.querySelectorAll('.observation'), function (o) { o.classList.remove('is-active'); });
      if (on) { hot.setAttribute('aria-pressed', 'true'); $('z2-obs-' + hot.dataset.point).classList.add('is-active'); }
    });

    // Pokaz naprawy: trzy kadry, wyzwalany przez ucznia, z pauzą.
    var frames = $('z2-frames');
    D.process.forEach(function (f, i) {
      var li = el('li', 'process-frame');
      li.id = 'z2-frame-' + f.id;
      var art = el('div', 'frame-art');
      art.innerHTML = window.GOZArt2.render('process-' + f.id);
      li.appendChild(art);
      li.appendChild(el('h3', null, (i + 1) + '. ' + f.title));
      li.appendChild(el('p', null, f.text));
      frames.appendChild(li);
    });
    var timer = null, step = -1;
    function show(i) {
      step = i;
      Array.prototype.forEach.call(frames.children, function (li, k) {
        li.classList.toggle('is-current', k === i);
        if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      $('z2-show-status').textContent = i >= 0 ? 'Kadr ' + (i + 1) + ' z 3: ' + D.process[i].title + '.' : '';
    }
    function stop(done) {
      if (timer) clearInterval(timer);
      timer = null;
      $('z2-show-play').hidden = false;
      $('z2-show-pause').hidden = true;
      $('z2-show-play').textContent = done ? 'Zobacz pokaz ponownie' : (step >= 0 ? 'Wznów pokaz' : 'Zobacz pokaz');
    }
    $('z2-show-play').addEventListener('click', function () {
      if (step < 0 || step >= 2 || $('z2-show-play').textContent.indexOf('ponownie') !== -1) show(0); else show(step + 1);
      if (reduced()) { $('z2-show-status').textContent += ' Kolejne kadry pokażesz, wybierając przycisk ponownie.'; $('z2-show-play').textContent = step >= 2 ? 'Zobacz pokaz ponownie' : 'Następny kadr'; return; }
      $('z2-show-play').hidden = true;
      $('z2-show-pause').hidden = false;
      timer = setInterval(function () {
        if (step >= 2) { stop(true); return; }
        show(step + 1);
      }, 4000);
    });
    $('z2-show-pause').addEventListener('click', function () { stop(false); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && timer) stop(false); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (!en.isIntersecting && timer) stop(false); }); }).observe($('z2-process'));
    }

    // Pady: odsłaniane opisy.
    var pads = $('z2-pads');
    D.pads.forEach(function (p) {
      var li = el('li', 'pad-card');
      var art = el('div', 'pad-art');
      art.innerHTML = window.GOZArt2.render(p.id);
      li.appendChild(art);
      li.appendChild(el('h3', null, p.title));
      var btn = el('button', null, 'Pokaż opis');
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');
      var text = el('p', 'pad-text', p.text);
      text.id = 'z2-' + p.id + '-text';
      text.hidden = true;
      btn.setAttribute('aria-controls', text.id);
      btn.addEventListener('click', function () {
        var open = text.hidden;
        text.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Ukryj opis' : 'Pokaż opis';
      });
      li.appendChild(btn);
      li.appendChild(text);
      pads.appendChild(li);
    });
  }

  // --- Suwaki porównania (07 §4) -------------------------------------------------------------

  function initCompare() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-compare]'), function (box) {
      var range = box.querySelector('input[type="range"]');
      var over = box.querySelector('.compare-over');
      var handle = box.querySelector('.compare-handle');
      var buttons = box.querySelectorAll('[data-compare-set]');
      var leftLabel = buttons[0].textContent, rightLabel = buttons[1].textContent;
      function apply() {
        var v = Number(range.value);
        over.style.clipPath = 'inset(0 ' + v + '% 0 0)';
        handle.style.left = (100 - v) + '%';
        range.setAttribute('aria-valuetext', v === 0 ? leftLabel : v === 100 ? rightLabel : rightLabel + ': odsłonięto ' + v + '%');
      }
      range.addEventListener('input', apply);
      Array.prototype.forEach.call(buttons, function (b) {
        b.addEventListener('click', function () { range.value = b.dataset.compareSet; apply(); });
      });
      apply();
    });
  }

  // --- Z3 ----------------------------------------------------------------------------------

  function initZ3() {
    var D = window.GOZ_Z3;
    var t = function () { return P.get().tasks.Z3; };
    var byId = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };

    tasks.Z3map = window.GOZSortTask.create({
      prefix: 'z3', anchor: 'z3-task', layoutClass: 'layout-z3',
      poolTitle: 'Karty etapów',
      zones: D.zones, caption: D.mapCaption,
      // I52 START z3-mapa
      // Integracja 52: mapa czasu i alternatyw (js/z3-layout.js) — opakowanie idempotentne, bez zmiany stanu i oceny.
      afterRender: function () { window.GOZZ3Layout.apply($('z3-board')); },
      // I52 END z3-mapa
      startMessage: 'Umieść pięć kart. Poprawne odpowiedzi zostaną po sprawdzeniu.',
      items: function () { return K.Z3.items; },
      item: function (id) { return byId(D.items, id); },
      placement: function (id) { return t().placements[id]; },
      setPlacement: function (d, id, z) { d.tasks.Z3.placements[id] = z; },
      isConfirmed: function (id) { return t().confirmed.indexOf(id) !== -1; },
      applyConfirm: function (d, ids) { ids.forEach(function (id) { if (d.tasks.Z3.confirmed.indexOf(id) === -1) d.tasks.Z3.confirmed.push(id); }); },
      snapshot: function () { return JSON.stringify(t().placements); },
      restore: function (d, snap) { var prev = JSON.parse(snap); K.Z3.items.forEach(function (id) { if (d.tasks.Z3.confirmed.indexOf(id) === -1) d.tasks.Z3.placements[id] = prev[id]; }); },
      isDone: function () { return t().confirmed.length === K.Z3.items.length; },
      doneText: 'Pięć kart na właściwych miejscach.',
      doneLink: { label: 'Przejdź do wniosku ↓', href: '#z3-conclusion' },
      evaluate: function () {
        var out = { confirm: [], feedback: {}, messages: [] }, missing = [], wrong = 0;
        K.Z3.items.forEach(function (id) {
          if (t().confirmed.indexOf(id) !== -1) return;
          var z = t().placements[id];
          if (!z) { missing.push(byId(D.items, id).label); return; }
          if (z === K.Z3.answers[id]) { out.confirm.push(id); return; }
          wrong++;
          var text = id === 'C1' ? D.messages.pastInFuture : z === 'past' ? D.messages.futureInPast : D.messages.scope;
          out.feedback[id] = { kind: 'error', text: text };
        });
        var done = t().confirmed.length + out.confirm.length;
        out.messages.push('Dobrze umieszczone: ' + done + ' z 5.');
        if (missing.length) out.messages.push('Uzupełnij: ' + missing.length + (missing.length === 1 ? ' karta czeka' : ' karty czekają') + ' na umieszczenie.');
        if (wrong) out.messages.push('Poprawne karty zostają. Przy pozostałych przeczytaj wskazówki i spróbuj ponownie.');
        return out;
      }
    });

    tasks.Z3conc = window.GOZSortTask.create({
      prefix: 'z3c', anchor: 'z3-task', layoutClass: 'layout-conclusion',
      poolTitle: 'Karty wniosków', poolEmpty: 'Karta jest w polu wniosku.',
      zones: [{ id: 'slot', label: 'Wniosek z porównania' }],
      startMessage: 'Wybierz jeden wniosek. Odpowiedź sprawdzisz przyciskiem „Sprawdź”.',
      countText: function (done) { return done ? 'Wniosek potwierdzony' : 'Wniosek: jeszcze niepotwierdzony'; },
      items: function () { return K.Z3.conclusions; },
      item: function (id) { return byId(D.conclusions, id); },
      placement: function (id) { return t().conclusion === id ? 'slot' : null; },
      setPlacement: function (d, id, z) {
        if (z === 'slot') d.tasks.Z3.conclusion = id;
        else if (d.tasks.Z3.conclusion === id) d.tasks.Z3.conclusion = null;
      },
      isConfirmed: function (id) { return id === K.Z3.conclusion && t().conclusionConfirmed; },
      applyConfirm: function (d, ids) { if (ids.indexOf(K.Z3.conclusion) !== -1) d.tasks.Z3.conclusionConfirmed = true; },
      snapshot: function () { return JSON.stringify(t().conclusion); },
      restore: function (d, snap) { if (!d.tasks.Z3.conclusionConfirmed) d.tasks.Z3.conclusion = JSON.parse(snap); },
      isDone: function () { return t().conclusionConfirmed; },
      doneText: 'Wniosek potwierdzony.',
      doneLink: { label: 'Zobacz kartę i wniosek ↓', href: '#z3-result' },
      goodText: function () { return 'Naprawa nie cofa wcześniejszej produkcji, ale może zmienić przyszłe działania. Liczbowa różnica wymaga danych.'; },
      evaluate: function () {
        var c = t().conclusion;
        if (!c) return { confirm: [], feedback: {}, messages: ['Uzupełnij: przenieś jedną kartę w pole „Wniosek z porównania”.'] };
        if (c === K.Z3.conclusion) return { confirm: [c], feedback: {}, messages: [] };
        var fb = {}; fb[c] = { kind: 'error', text: byId(D.conclusions, c).error };
        return { confirm: [], feedback: fb, messages: ['Mapa etapów zostaje bez zmian. Wybierz inny wniosek.'] };
      }
    });

    $('z3-hint').addEventListener('click', function () {
      var box = $('z3-hint-text');
      box.hidden = false;
      box.textContent = t().confirmed.length === 5 ? D.conclusionHelp : D.help;
    });
    $('z3-guided').addEventListener('click', function () {
      P.update(function (d) { d.tasks.Z3.assisted = true; }, { kind: 'z3' });
      var box = $('z3-hint-text');
      box.hidden = false;
      if (t().confirmed.length < 5) {
        var id = tasks.Z3map.guide();
        if (!id) return;
        box.textContent = 'Karta „' + byId(D.items, id).label + '”: ' + (id === 'C1' ? D.messages.futureInPast : D.messages.scope) + ' Wybierz kartę, umieść ją w polu i wybierz „Sprawdź”.';
      } else if (!t().conclusionConfirmed) {
        tasks.Z3conc.guide();
        box.textContent = D.conclusionHelp + ' Porównaj każdą kartę z tą częścią, przenieś wybraną w pole wniosku i wybierz „Sprawdź”.';
      }
    });
  }

  // --- Z4 ----------------------------------------------------------------------------------

  function initZ4() {
    var D = window.GOZ_Z4;
    var t = function () { return P.get().tasks.Z4; };
    var splitGuided = false;
    // I52 START z4-kontroler
    // Integracja 52: kontroler przeciągania (js/z4-drag.js) przechowywany tutaj i rejestr ilustracji (js/z4-assets.js).
    var z4Drag = null, A4 = window.GOZZ4Assets;
    // I52 END z4-kontroler
    tasks.Z4clearSplitGuide = function () { splitGuided = false; };
    Array.prototype.forEach.call(document.querySelectorAll('[data-source-link]'), function (a) { a.href = S[a.dataset.sourceLink].url; });

    function guideRows(row) {
      Array.prototype.forEach.call(document.querySelectorAll('#z4-rules-toggle [data-row], #z4-rules [data-row]'), function (p) {
        p.classList.toggle('is-guided', p.dataset.row === row);
      });
    }

    tasks.Z4 = window.GOZSortTask.create({
      prefix: 'z4', anchor: 'z4-task', layoutClass: 'layout-z4',
      poolTitle: 'Odpady do przygotowania', poolEmpty: 'Wszystkie odpady są już w polach.',
      zones: D.zones,
      startMessage: 'Przygotuj odpady. Poprawne odpowiedzi zostaną po sprawdzeniu.',
      // I52 START z4-rejestr
      art: function (name) { return A4.img(name); },
      // I52 END z4-rejestr
      items: function () { return t().split ? K.Z4.splitItems : K.Z4.initialItems; },
      item: function (id) { return D.items[id]; },
      placement: function (id) { return t().placements[id] || null; },
      setPlacement: function (d, id, z) { d.tasks.Z4.placements[id] = z; },
      isConfirmed: function (id) { return t().confirmed.indexOf(id) !== -1; },
      applyConfirm: function (d, ids) { ids.forEach(function (id) { if (d.tasks.Z4.confirmed.indexOf(id) === -1) d.tasks.Z4.confirmed.push(id); }); },
      snapshot: function () { return JSON.stringify({ split: t().split, placements: t().placements }); },
      restore: function (d, snap) {
        var prev = JSON.parse(snap);
        if (prev.split !== d.tasks.Z4.split) return;
        Object.keys(prev.placements).forEach(function (id) { if (d.tasks.Z4.confirmed.indexOf(id) === -1) d.tasks.Z4.placements[id] = prev.placements[id]; });
      },
      isDone: function () { return P.isComplete('Z4'); },
      doneText: 'Wszystkie odpady przygotowane zgodnie z kartą.',
      doneLink: { label: 'Zobacz kartę i wniosek ↓', href: '#z4-result' },
      extraButtons: function (id, li) {
        // I52 START z4-uchwyt
        if (z4Drag) z4Drag.decorate(id, li);
        // I52 END z4-uchwyt
        if (id !== K.Z4.splitSource || t().split) return;
        var b = el('button', 'split-button', 'Oddziel opakowanie');
        b.type = 'button';
        b.dataset.split = '1';
        b.id = 'z4-split';
        b.classList.toggle('is-guided', splitGuided);
        li.appendChild(b);
      },
      goodText: function (id) { return K.Z4.answers[id] === 'bio' ? D.messages.goodBio : D.messages.goodOutside; },
      evaluate: function () {
        var out = { confirm: [], feedback: {}, messages: [] }, missing = [], wrong = 0;
        var items = t().split ? K.Z4.splitItems : K.Z4.initialItems;
        items.forEach(function (id) {
          if (t().confirmed.indexOf(id) !== -1) return;
          var z = t().placements[id];
          // Nierozdzielony woreczek z obierkami nie zalicza zadania w żadnym polu.
          if (id === K.Z4.splitSource) {
            if (z) { wrong++; out.feedback[id] = { kind: 'error', text: D.messages.bagTogether }; }
            else { missing.push(D.items[id].label); out.feedback[id] = { kind: 'missing', text: D.messages.splitMissing }; }
            return;
          }
          if (!z) { missing.push(D.items[id].label); return; }
          if (z === K.Z4.answers[id]) { out.confirm.push(id); return; }
          wrong++;
          var text = id === 'bag' ? D.messages.bagInBio : K.Z4.answers[id] === 'bio' ? D.messages.bioOutside : D.messages.notAllowed;
          out.feedback[id] = { kind: 'error', text: text };
        });
        var total = K.Z4.splitItems.length;
        out.messages.push('Dobrze przygotowane: ' + (t().confirmed.length + out.confirm.length) + ' z ' + total + '.');
        if (missing.length) out.messages.push('Uzupełnij: ' + missing.join(', ') + '.');
        if (wrong) out.messages.push('Poprawne odpowiedzi zostają. Przy pozostałych przeczytaj wskazówki.');
        return out;
      },
      onCheck: function () { $('z4-disposal').hidden = false; },
      // I52 START z4-gesty
      // Gesty: adapter dostaje wąskie API silnika (place tej samej ścieżki co kliknięcie); każdy render anuluje gest.
      dragAdapter: function (api) { z4Drag = window.GOZZ4Drag.create(api); },
      afterRender: function () { if (z4Drag) z4Drag.refresh(); A4.decorateBoard($('z4-board')); },
      // I52 END z4-gesty
      countText: function (done) { return 'Dobrze przygotowane: ' + done + ' z ' + K.Z4.splitItems.length; }
    });

    // Rozdzielenie woreczka z obierkami: operacja jednorazowa, ponowne kliknięcie niemożliwe (przycisk znika).
    // Usuwa przypisanie całej paczki (walidator nie zna jej po rozdzieleniu); nowe karty trafiają do puli, historia cofania jest czyszczona.
    $('z4-board').addEventListener('click', function (e) {
      var b = e.target.closest('[data-split]');
      if (!b || t().split) return;
      P.update(function (d) { d.tasks.Z4.split = true; d.lastAnchor = 'z4-task'; }, { immediate: true, kind: 'z4' });
      splitGuided = false;
      tasks.Z4.setFeedback(K.Z4.splitSource, null);
      tasks.Z4.clearHistory();
      $('z4-feedback').textContent = D.messages.splitDone;
      var next = document.querySelector('#z4-item-peelings .item-pick');
      if (next) next.focus({ preventScroll: true });
    });

    $('z4-hint').addEventListener('click', function () { var box = $('z4-hint-text'); box.hidden = false; box.textContent = D.help; });
    $('z4-guided').addEventListener('click', function () {
      P.update(function (d) { d.tasks.Z4.assisted = true; }, { kind: 'z4' });
      var id = tasks.Z4.guide();
      if (!id) return;
      var row = D.items[id].row;
      if (window.innerWidth <= 1100) $('z4-rules-toggle').open = true;
      guideRows(row === 'split' ? null : row);
      // Pomoc przy woreczku wskazuje przycisk „Oddziel opakowanie”.
      splitGuided = row === 'split';
      tasks.Z4.render();
      var box = $('z4-hint-text');
      box.hidden = false;
      box.textContent = '„' + D.items[id].label + '”: ' + D.guided[row];
    });

    // Karta zasad w zadaniu: na dużym ekranie zawsze otwarta, na telefonie rozwijana.
    function syncRules() { if (window.innerWidth > 1100) $('z4-rules-toggle').open = true; }
    syncRules();
    window.addEventListener('resize', syncRules);

    // Przykład Z4-P1: pokaz rozdzielenia (statyczne kadry, bez fizyki).
    $('z4-example-play').addEventListener('click', function () {
      var done = $('z4-example-play').getAttribute('aria-pressed') !== 'true';
      $('z4-example-play').setAttribute('aria-pressed', String(done));
      var fig = $('z4-example-art');
      fig.classList.toggle('is-animating', done && !reduced());
      // I52 START z4-przyklad-kadr
      A4.renderExample(fig, done, done ? 'Obierki oddzielono od woreczka. Do BIO trafiają luzem; woreczek pozostaje poza nim.' : 'Obierki są w otwartym woreczku foliowym.');
      // I52 END z4-przyklad-kadr
      $('z4-example-play').textContent = done ? 'Pokaż stan początkowy' : 'Zobacz pokaz';
      // I52 START z4-przyklad-opis
      $('z4-example-status').textContent = done ? 'Obierki oddzielono od woreczka. Do BIO trafiają luzem; woreczek pozostaje poza nim.' : 'Obierki są w otwartym woreczku foliowym.';
      // I52 END z4-przyklad-opis
    });
    // I52 START z4-init-grafiki
    // Ilustracje wejścia i stanu początkowego przykładu z rejestru (zamiast dawnego renderera tych dwóch miejsc).
    A4.renderEntry(document.querySelector('#z4-entry .entry-figure'));
    A4.renderExample($('z4-example-art'), false, 'Obierki są w otwartym woreczku foliowym.');
    // I52 END z4-init-grafiki
  }

  // --- Z5 ----------------------------------------------------------------------------------

  function initZ5() {
    var D = window.GOZ_Z5;
    var t = function () { return P.get().tasks.Z5; };
    var byId = function (list, id) { return list.filter(function (x) { return x.id === id; })[0]; };

    // Składniki przekroju: tekst stale widoczny, wybór nazwy podświetla fragment ilustracji.
    var list = $('z5-components');
    D.components.forEach(function (c) {
      var li = el('li', 'component');
      var btn = el('button', 'component-name', c.name);
      btn.type = 'button';
      btn.dataset.component = c.id;
      btn.setAttribute('aria-pressed', 'false');
      li.appendChild(btn);
      var block = el('div', 'text-block');
      block.id = 'audio-' + c.audio;
      block.appendChild(el('p', null, c.text));
      li.appendChild(block);
      list.appendChild(li);
    });
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-component]');
      if (!btn) return;
      var on = btn.getAttribute('aria-pressed') !== 'true';
      Array.prototype.forEach.call(list.querySelectorAll('[data-component]'), function (b) { b.setAttribute('aria-pressed', String(on && b === btn)); });
      Array.prototype.forEach.call(document.querySelectorAll('#z5-section-art [data-region]'), function (g) {
        g.classList.toggle('is-highlight', on && g.dataset.region === btn.dataset.component);
        g.classList.toggle('is-dim', on && g.dataset.region !== btn.dataset.component);
      });
    });

    // Etapy procesu: cztery statyczne kroki z opisem upływu czasu i odnośnikami „Zobacz etap”.
    var stages = $('z5-stages'), links = $('z5-stage-links');
    D.stages.forEach(function (s, i) {
      var li = el('li', 'stage-step');
      li.id = 'z5-stage-' + (i + 1);
      var art = el('div', 'stage-art');
      art.innerHTML = window.GOZArt2.render('compost-stage-' + i);
      li.appendChild(art);
      var body = el('div', 'stage-body');
      var h = el('h3', null, (i + 1) + '. ' + s.name);
      h.tabIndex = -1;
      body.appendChild(h);
      body.appendChild(el('p', null, s.text));
      if (i < D.stages.length - 1) body.appendChild(el('p', 'time-mark', '↓ Upływ czasu'));
      li.appendChild(body);
      stages.appendChild(li);
      var a = el('a', 'stage-link', 'Zobacz etap ' + (i + 1) + ': ' + s.name);
      a.href = '#' + li.id;
      links.appendChild(a);
    });

    // Suwak wilgoci (pakiet 26): trzy pozycje; suwak, przyciski i klawiatura ustawiają tę samą wartość.
    // Synchronizacja: ilustracja z opisem dostępności, nazwa stanu, podpis, aria-valuetext i aria-pressed.
    // Bez obszaru live, bez automatycznego dźwięku i bez zapisu wartości; zmiana wstrzymuje nagranie ukrywanego podpisu.
    var range = $('z5-moisture-range');
    var names = D.moisture.map(function (m) { return m.name; });
    var moistureValue = -1;
    function setMoisture(v) {
      v = Number(v);
      range.value = v;
      range.setAttribute('aria-valuetext', names[v]);
      $('z5-moisture-state').textContent = names[v];
      if (v !== moistureValue) {
        var art = $('z5-moisture-art');
        art.innerHTML = window.GOZArt2.render('moisture-' + D.moisture[v].id);
        // Krótkie przenikanie 200 ms tylko przy zmianie stanu i pełnym ruchu; przy ograniczonym ruchu natychmiastowa podmiana.
        art.classList.remove('is-changing');
        if (moistureValue !== -1 && !reduced()) { void art.offsetWidth; art.classList.add('is-changing'); }
      }
      moistureValue = v;
      Array.prototype.forEach.call(document.querySelectorAll('.moisture-caption'), function (cap) {
        var show = Number(cap.dataset.state) === v;
        if (!show && !cap.hidden) window.GOZMedia.pauseInside(cap);
        cap.hidden = !show;
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-moisture]'), function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.moisture) === v)); });
    }
    range.addEventListener('input', function () { setMoisture(Number(range.value)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-moisture]'), function (b) { b.addEventListener('click', function () { setMoisture(Number(b.dataset.moisture)); }); });
    setMoisture(1);
    // „Przejdź do zadania”: zwykłe przejście kotwicą do obecnego #z5-task (nagranie sceny zatrzymuje wspólna obsługa odnośników w app.js);
    // po przewinięciu fokus trafia na istniejący nagłówek zadania, bez zmian w jego układzie i danych.
    $('z5-to-task').addEventListener('click', function () {
      setTimeout(function () {
        var h = $('z5-task-title');
        if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }, 0);
    });

    function guideText(id, fragment) { var p = $(id); markText(p, p.textContent, fragment); }
    function clearGuideText(id) { var p = $(id); p.textContent = p.textContent; }

    tasks.Z5wet = window.GOZSortTask.create({
      prefix: 'z5w', anchor: 'z5-task', layoutClass: 'layout-z5',
      poolTitle: 'Karty działań', poolEmpty: 'Wszystkie karty są w kompostowniku.',
      zones: [{ id: 'compost', label: 'Kompostownik', note: 'Miejsce na dwa działania' }],
      checkLabel: 'Sprawdź i zobacz wyjaśnienie',
      startMessage: 'Wybierz dwa działania. Wyjaśnienie zobaczysz po sprawdzeniu.',
      items: function () { return K.Z5.wetOptions; },
      item: function (id) { return byId(D.wet.items, id); },
      placement: function (id) { return t().wetSelected.indexOf(id) !== -1 ? 'compost' : null; },
      canPlace: function (id, z) { if (z === 'compost' && t().wetSelected.indexOf(id) === -1 && t().wetSelected.length >= 2) return D.wet.tooMany; return null; },
      setPlacement: function (d, id, z) {
        var sel = d.tasks.Z5.wetSelected.filter(function (x) { return x !== id; });
        if (z === 'compost') sel.push(id);
        d.tasks.Z5.wetSelected = unique(sel).slice(0, 2);
      },
      isConfirmed: function (id) { return t().wetConfirmed.indexOf(id) !== -1; },
      applyConfirm: function (d, ids) { ids.forEach(function (id) { if (d.tasks.Z5.wetConfirmed.indexOf(id) === -1) d.tasks.Z5.wetConfirmed.push(id); }); },
      snapshot: function () { return JSON.stringify(t().wetSelected); },
      restore: function (d, snap) {
        var prev = JSON.parse(snap);
        var keep = d.tasks.Z5.wetConfirmed.slice();
        d.tasks.Z5.wetSelected = unique(keep.concat(prev)).slice(0, 2);
      },
      isDone: function () { return K.Z5.wetAnswers.every(function (id) { return t().wetConfirmed.indexOf(id) !== -1; }); },
      doneText: 'Mokry kompostownik poprawiony.',
      doneLink: { label: 'Przejdź do suchego pojemnika ↓', href: '#z5-dry' },
      goodText: function (id) { return byId(D.wet.items, id).explanation; },
      countText: function (done) { return 'Dobrze wybrane działania: ' + done + ' z 2'; },
      evaluate: function () {
        var out = { confirm: [], feedback: {}, messages: [] };
        var sel = t().wetSelected;
        sel.forEach(function (id) {
          if (t().wetConfirmed.indexOf(id) !== -1) return;
          if (K.Z5.wetAnswers.indexOf(id) !== -1) out.confirm.push(id);
          else out.feedback[id] = { kind: 'error', text: byId(D.wet.items, id).explanation };
        });
        var good = t().wetConfirmed.length + out.confirm.length;
        out.messages.push('Dobrze wybrane działania: ' + good + ' z 2.');
        if (sel.length < 2) out.messages.push('Uzupełnij: w kompostowniku są miejsca na dwa działania.');
        if (Object.keys(out.feedback).length) out.messages.push('Usuń kartę, która nie pasuje do opisu, i wybierz inną.');
        return out;
      },
      afterRender: function () { renderZ5State(); }
    });

    tasks.Z5dry = window.GOZSortTask.create({
      prefix: 'z5d', anchor: 'z5-task', layoutClass: 'layout-z5',
      poolTitle: 'Karty działań', poolEmpty: 'Karta jest w pojemniku.',
      zones: [{ id: 'dry', label: 'Suchy pojemnik', note: 'Miejsce na jedno działanie' }],
      startMessage: 'Wybierz jedno działanie dla suchego pojemnika.',
      items: function () { return K.Z5.dryOptions; },
      item: function (id) { return byId(D.dry.items, id); },
      placement: function (id) { return t().drySelected === id ? 'dry' : null; },
      setPlacement: function (d, id, z) {
        if (z === 'dry') d.tasks.Z5.drySelected = id;
        else if (d.tasks.Z5.drySelected === id) d.tasks.Z5.drySelected = null;
      },
      isConfirmed: function (id) { return t().dryConfirmed && t().drySelected === id; },
      applyConfirm: function (d, ids) { if (ids.indexOf(K.Z5.dryAnswer) !== -1) d.tasks.Z5.dryConfirmed = true; },
      snapshot: function () { return JSON.stringify(t().drySelected); },
      restore: function (d, snap) { if (!d.tasks.Z5.dryConfirmed) d.tasks.Z5.drySelected = JSON.parse(snap); },
      isDone: function () { return t().dryConfirmed; },
      doneText: 'Suchy pojemnik: działanie dobrane.',
      doneLink: { label: 'Zobacz kartę i wniosek ↓', href: '#z5-result' },
      goodText: function (id) { return byId(D.dry.items, id).explanation; },
      countText: function (done) { return done ? 'Działanie potwierdzone' : 'Działanie: jeszcze niepotwierdzone'; },
      evaluate: function () {
        var id = t().drySelected;
        if (!id) return { confirm: [], feedback: {}, messages: ['Uzupełnij: umieść jedną kartę w suchym pojemniku.'] };
        if (id === K.Z5.dryAnswer) return { confirm: [id], feedback: {}, messages: [] };
        var fb = {}; fb[id] = { kind: 'error', text: byId(D.dry.items, id).explanation };
        return { confirm: [], feedback: fb, messages: ['Usuń tę kartę i wybierz drugą.'] };
      }
    });

    $('z5-hint').addEventListener('click', function () { var box = $('z5-hint-text'); box.hidden = false; box.textContent = D.help; });
    $('z5-guided').addEventListener('click', function () {
      P.update(function (d) { d.tasks.Z5.assisted = true; }, { kind: 'z5' });
      var box = $('z5-hint-text');
      box.hidden = false;
      if (!tasks.Z5wet_done()) {
        guideText('z5-wet-text', D.wet.decisive);
        box.textContent = D.wet.guidedQuestion + ' Zaznaczyliśmy ważny fragment opisu. Umieść w kompostowniku dwie pasujące karty i wybierz „Sprawdź i zobacz wyjaśnienie”.';
        $('z5-wet-text').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' });
      } else if (!t().dryConfirmed) {
        guideText('z5-dry-text', D.dry.decisive);
        box.textContent = D.dry.guidedQuestion + ' Zaznaczyliśmy ważny fragment opisu. Umieść jedną kartę w pojemniku i wybierz „Sprawdź”.';
        $('z5-dry-text').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' });
      }
    });
    tasks.Z5wet_done = function () { return K.Z5.wetAnswers.every(function (id) { return t().wetConfirmed.indexOf(id) !== -1; }); };

    // Stan ilustracji: po poprawie warunków osobny opis; gotowego kompostu nie ogłaszamy.
    var lastFixed = null;
    function renderZ5State() {
      var fixed = tasks.Z5wet_done && tasks.Z5wet_done();
      if (fixed === lastFixed) return;
      lastFixed = fixed;
      $('z5-wet-art').innerHTML = window.GOZArt2.render(fixed ? 'wet-after' : 'wet-before');
      $('z5-wet-caption').textContent = fixed ? D.wet.result : 'Kompostownik z opisu: bardzo wilgotny i zbity.';
      $('z5-dry').hidden = !fixed;
      if (fixed) { var p = $('z5-wet-text'); p.textContent = p.textContent; }
    }

    // Wermikompostownik: krótki ruch po kliknięciu, przy ograniczonym ruchu stan statyczny.
    $('z5-worms-play').addEventListener('click', function () {
      var on = $('z5-worms-play').getAttribute('aria-pressed') !== 'true';
      $('z5-worms-play').setAttribute('aria-pressed', String(on));
      var fig = $('z5-worms-art');
      var cap = fig.querySelector('figcaption');
      fig.innerHTML = window.GOZArt2.render(on ? 'worm-bin-active' : 'worm-bin');
      if (cap) fig.appendChild(cap);
      fig.classList.toggle('is-animating', on && !reduced());
      $('z5-worms-play').textContent = on ? 'Ukryj mieszkańców' : 'Zobacz mieszkańców';
      if (on && !reduced()) setTimeout(function () { fig.classList.remove('is-animating'); }, 5000);
    });
  }

  // --- Ocean -------------------------------------------------------------------------------

  function initOcean() {
    $('ocean-lupa').addEventListener('click', function () {
      var open = $('ocean-lupa-text').hidden;
      $('ocean-lupa-text').hidden = !open;
      $('ocean-lupa').setAttribute('aria-expanded', String(open));
    });
    var range = $('ocean-depth');
    function setDepth(v) {
      v = Math.max(0, Math.min(10890, Number(v)));
      range.value = v;
      var txt = v.toLocaleString('pl-PL') + ' m';
      $('ocean-depth-value').textContent = txt;
      range.setAttribute('aria-valuetext', v.toLocaleString('pl-PL') + ' metrów');
      // Znacznik na skali: 30…590 z 620 jednostek wysokości rysunku.
      $('ocean-depth-marker').style.top = ((30 + (v / 10890) * 560) / 620 * 100) + '%';
    }
    range.addEventListener('input', function () { setDepth(range.value); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-depth]'), function (b) { b.addEventListener('click', function () { setDepth(b.dataset.depth); }); });
    setDepth(0);
  }

  // --- Wyniki rozdziałów 3–5 ---------------------------------------------------------------

  var completeSeen = {};
  function renderResults() {
    ['Z3', 'Z4', 'Z5'].forEach(function (id) {
      var px = id.toLowerCase();
      var done = P.isComplete(id);
      $(px + '-locked').hidden = done;
      $(px + '-complete').hidden = !done;
      if (done && completeSeen[id] === false && !reduced()) {
        var letter = $(px + '-letter');
        if (letter) letter.classList.remove('earned'); if (letter) { void letter.offsetWidth; letter.classList.add('earned'); }
      }
      completeSeen[id] = done;
    });
    $('z3-conclusion').hidden = P.get().tasks.Z3.confirmed.length !== 5;
  }

  function renderAllTasks() {
    Object.keys(tasks).forEach(function (k) { if (tasks[k] && tasks[k].render) tasks[k].render(); });
    renderResults();
  }

  window.GOZChapters = {
    init: function (options) {
      reduced = options.reducedMotion;
      initMatchTasks();
      initZ2Extras();
      initCompare();
      initZ3();
      initZ4();
      initZ5();
      initOcean();
      ['Z1', 'Z2', 'Z3map', 'Z3conc', 'Z4', 'Z5wet', 'Z5dry'].forEach(function (k) { tasks[k].init({ reducedMotion: reduced }); });
      window.GOZArt2.mountAll(document);
      renderResults();
      P.onChange(function (kind) { if (kind !== 'anchor' && kind !== 'prefs') renderResults(); });
    },
    reset: function () {
      tasks.Z4clearSplitGuide();
      ['Z1', 'Z2', 'Z3map', 'Z3conc', 'Z4', 'Z5wet', 'Z5dry'].forEach(function (k) { tasks[k].reset(); });
      ['z2', 'z3', 'z4', 'z5'].forEach(function (px) { var b = $(px + '-hint-text'); if (b) b.hidden = true; });
      $('z4-disposal').hidden = true;
      Array.prototype.forEach.call(document.querySelectorAll('[data-row].is-guided'), function (p) { p.classList.remove('is-guided'); });
      completeSeen = {};
      renderAllTasks();
    },
    tasks: tasks
  };
  // Zgodność z etapem 1: dotychczasowe odwołania do modułu zadania Z1.
  window.GOZTaskZ1 = { reset: function () { tasks.Z1.reset(); }, render: function () { tasks.Z1.render(); } };
})();
