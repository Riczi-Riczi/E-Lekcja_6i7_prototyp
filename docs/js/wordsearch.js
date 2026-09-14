// Wykreślanka 10 × 10 (Z6-Z1). Specyfikacja: 02 §2 (Z6) i 01 §3 (widok powiększony).
// Jedno wejście Tab do siatki, strzałki przesuwają aktywną komórkę, Enter/Spacja zaznacza początek i koniec, Escape anuluje.
// Wybór dwóch końców i przeciągnięcie wskaźnikiem (mysz, pióro) korzystają z tej samej funkcji oceny.
(function () {
  'use strict';

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function fill(template, values) { return template.replace(/\{(\w)\}/g, function (m, k) { return values[k] !== undefined ? values[k] : m; }); }

  // Komórki słowa od początku do końca; null, gdy odcinek nie jest poziomy w prawo, pionowy w dół ani ukośny w dół w prawo.
  function lineCells(r0, c0, r1, c1) {
    var dr = r1 - r0, dc = c1 - c0;
    var len = Math.max(Math.abs(dr), Math.abs(dc));
    if (!((dr === 0 && dc > 0) || (dc === 0 && dr > 0) || (dr === dc && dr > 0))) return null;
    var cells = [];
    for (var i = 0; i <= len; i++) cells.push([r0 + (dr ? i : 0), c0 + (dc ? i : 0)]);
    return cells;
  }

  function create(cfg) {
    var D = cfg.data;
    var size = D.grid.length;
    var words = D.words.map(function (w) {
      var r0 = w.start[0] - 1, c0 = w.start[1] - 1, r1 = w.end[0] - 1, c1 = w.end[1] - 1;
      var cells = lineCells(r0, c0, r1, c1);
      var letters = cells ? cells.map(function (p) { return D.grid[p[0]][p[1]]; }).join('') : '';
      return { word: w.word, r0: r0, c0: c0, r1: r1, c1: c1, cells: cells, valid: letters === w.word };
    });
    var root, cellsEl = [], overlay, active = { r: 0, c: 0 }, anchor = null, hint = null, drag = null, suppressClick = false;

    function cellId(r, c) { return 'z6-cell-' + (r + 1) + '-' + (c + 1); }
    function cellAt(r, c) { return cellsEl[r * size + c]; }
    function wordsThrough(r, c, list) {
      return words.filter(function (w) { return list.indexOf(w.word) !== -1 && w.cells.some(function (p) { return p[0] === r && p[1] === c; }); }).map(function (w) { return w.word; });
    }

    function build() {
      root = el('div', 'ws-wrap');
      var grid = el('div', 'ws-grid');
      grid.id = 'z6-grid';
      grid.setAttribute('role', 'grid');
      grid.setAttribute('aria-label', 'Wykreślanka: 10 wierszy i 10 kolumn liter');
      grid.setAttribute('aria-rowcount', String(size));
      grid.setAttribute('aria-colcount', String(size));
      // Instrukcja klawiaturowa (redakcja A) jako opis siatki — dostępna po wejściu fokusem, bez otwierania pomocy.
      if (document.getElementById('z6-grid-description')) grid.setAttribute('aria-describedby', 'z6-grid-description');
      for (var r = 0; r < size; r++) {
        var row = el('div', 'ws-row');
        row.setAttribute('role', 'row');
        row.setAttribute('aria-rowindex', String(r + 1));
        for (var c = 0; c < size; c++) {
          var cell = el('div', 'ws-cell', D.grid[r][c]);
          cell.id = cellId(r, c);
          cell.setAttribute('role', 'gridcell');
          cell.setAttribute('aria-colindex', String(c + 1));
          cell.dataset.r = r; cell.dataset.c = c;
          cell.tabIndex = r === 0 && c === 0 ? 0 : -1;
          row.appendChild(cell);
          cellsEl.push(cell);
        }
        grid.appendChild(row);
      }
      overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      overlay.setAttribute('class', 'ws-lines');
      overlay.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('focusable', 'false');
      root.appendChild(grid);
      root.appendChild(overlay);
      cfg.home.appendChild(root);
      bind(grid);
    }

    function label(r, c) {
      var found = cfg.found(), revealed = cfg.revealed();
      var parts = ['Wiersz ' + (r + 1) + ', kolumna ' + (c + 1) + ': ' + D.grid[r][c]];
      if (anchor && anchor.r === r && anchor.c === c) parts.push('początek zaznaczenia');
      var inFound = wordsThrough(r, c, found);
      if (inFound.length) parts.push('w znalezionym słowie ' + inFound.join(' i '));
      else if (revealed) { var inAll = wordsThrough(r, c, D.words.map(function (w) { return w.word; })); if (inAll.length) parts.push('w odsłoniętym słowie ' + inAll.join(' i ')); }
      if (hint && hint.r === r && hint.c === c) parts.push('podpowiedź: początek słowa ' + hint.word);
      return parts.join(', ');
    }

    function render(preview) {
      var found = cfg.found(), revealed = cfg.revealed();
      var shown = revealed ? words.map(function (w) { return w.word; }) : found;
      var previewSet = {};
      (preview || []).forEach(function (p) { previewSet[p[0] + ':' + p[1]] = true; });
      cellsEl.forEach(function (cell) {
        var r = Number(cell.dataset.r), c = Number(cell.dataset.c);
        var inShown = wordsThrough(r, c, shown).length > 0;
        cell.classList.toggle('is-found', wordsThrough(r, c, found).length > 0);
        cell.classList.toggle('is-revealed', revealed && inShown && !wordsThrough(r, c, found).length);
        cell.classList.toggle('is-start', !!(anchor && anchor.r === r && anchor.c === c));
        cell.classList.toggle('is-hint', !!(hint && hint.r === r && hint.c === c));
        cell.classList.toggle('is-preview', !!previewSet[r + ':' + c]);
        cell.setAttribute('aria-label', label(r, c));
        cell.setAttribute('aria-selected', String(!!(anchor && anchor.r === r && anchor.c === c)));
      });
      var lines = '';
      words.forEach(function (w) {
        if (shown.indexOf(w.word) === -1) return;
        var cls = found.indexOf(w.word) !== -1 ? 'found' : 'revealed';
        lines += '<line class="' + cls + '" x1="' + (w.c0 + 0.5) + '" y1="' + (w.r0 + 0.5) + '" x2="' + (w.c1 + 0.5) + '" y2="' + (w.r1 + 0.5) + '"/>';
      });
      overlay.innerHTML = lines;
    }

    function setActive(r, c, focus) {
      r = Math.max(0, Math.min(size - 1, r)); c = Math.max(0, Math.min(size - 1, c));
      cellAt(active.r, active.c).tabIndex = -1;
      active = { r: r, c: c };
      var cell = cellAt(r, c);
      cell.tabIndex = 0;
      if (focus) cell.focus({ preventScroll: false });
    }

    function evaluate(a, b) {
      var match = null;
      words.forEach(function (w) {
        if ((w.r0 === a.r && w.c0 === a.c && w.r1 === b.r && w.c1 === b.c) || (w.r0 === b.r && w.c0 === b.c && w.r1 === a.r && w.c1 === a.c)) match = w;
      });
      if (!match) { cfg.status(D.messages.notWord); return null; }
      if (cfg.found().indexOf(match.word) !== -1) { cfg.status(D.messages.alreadyFound); return null; }
      if (hint && hint.word === match.word) hint = null;
      cfg.onFound(match.word);
      return match.word;
    }

    function activate(r, c) {
      setActive(r, c, false);
      if (!anchor) {
        anchor = { r: r, c: c };
        render();
        cfg.status(fill(D.messages.start, { r: r + 1, c: c + 1, l: D.grid[r][c] }));
        return;
      }
      if (anchor.r === r && anchor.c === c) { anchor = null; render(); cfg.status(D.messages.cancel); return; }
      var a = anchor;
      anchor = null;
      evaluate(a, { r: r, c: c });
      render();
    }

    function cancel() { if (!anchor) return false; anchor = null; render(); cfg.status(D.messages.cancel); return true; }

    function cellFromEvent(e) {
      var t = e.target && e.target.closest ? e.target.closest('.ws-cell') : null;
      return t && root.contains(t) ? t : null;
    }
    function cellFromPoint(x, y) {
      var n = document.elementFromPoint(x, y);
      var t = n && n.closest ? n.closest('.ws-cell') : null;
      return t && root.contains(t) ? t : null;
    }

    function bind(grid) {
      grid.addEventListener('click', function (e) {
        if (suppressClick) return;
        var cell = cellFromEvent(e);
        if (!cell) return;
        activate(Number(cell.dataset.r), Number(cell.dataset.c));
        cell.focus({ preventScroll: true });
      });
      grid.addEventListener('keydown', function (e) {
        var moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
        if (moves[e.key]) { e.preventDefault(); setActive(active.r + moves[e.key][0], active.c + moves[e.key][1], true); return; }
        if (e.key === 'Home') { e.preventDefault(); setActive(active.r, 0, true); return; }
        if (e.key === 'End') { e.preventDefault(); setActive(active.r, size - 1, true); return; }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(active.r, active.c); return; }
        // Escape najpierw anuluje zaznaczenie; dopiero bez zaznaczenia może zamknąć widok powiększony.
        if (e.key === 'Escape' && cancel()) { e.preventDefault(); e.stopPropagation(); }
      });
      grid.addEventListener('focusin', function (e) {
        var cell = cellFromEvent(e);
        if (cell) { cellAt(active.r, active.c).tabIndex = -1; active = { r: Number(cell.dataset.r), c: Number(cell.dataset.c) }; cell.tabIndex = 0; }
      });
      // Przeciąganie myszą lub piórem. Na ekranie dotykowym gest przewija stronę; dotknięcie dwóch końców działa zawsze (T-60).
      grid.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        var cell = cellFromEvent(e);
        if (!cell) return;
        drag = { r: Number(cell.dataset.r), c: Number(cell.dataset.c), moved: false, id: e.pointerId };
        try { grid.setPointerCapture(e.pointerId); } catch (err) { /* bez przechwycenia */ }
        e.preventDefault();
      });
      grid.addEventListener('pointermove', function (e) {
        if (!drag || drag.id !== e.pointerId) return;
        var cell = cellFromPoint(e.clientX, e.clientY);
        if (!cell) return;
        var r = Number(cell.dataset.r), c = Number(cell.dataset.c);
        if (r === drag.r && c === drag.c) return;
        drag.moved = true;
        var cells = lineCells(drag.r, drag.c, r, c) || lineCells(r, c, drag.r, drag.c);
        render(cells || [[drag.r, drag.c], [r, c]]);
      });
      grid.addEventListener('pointerup', function (e) {
        if (!drag || drag.id !== e.pointerId) return;
        var d = drag; drag = null;
        if (!d.moved) { render(); return; }
        var cell = cellFromPoint(e.clientX, e.clientY);
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
        anchor = null;
        if (cell) { setActive(Number(cell.dataset.r), Number(cell.dataset.c), false); evaluate({ r: d.r, c: d.c }, { r: Number(cell.dataset.r), c: Number(cell.dataset.c) }); }
        render();
      });
      grid.addEventListener('pointercancel', function () { drag = null; render(); });
    }

    return {
      init: function () { build(); render(); },
      render: function () { render(); },
      root: function () { return root; },
      grid: function () { return document.getElementById('z6-grid'); },
      // Przeniesienie tej samej siatki do widoku powiększonego i z powrotem (bez duplikatów w drzewie dostępności).
      moveTo: function (container) { container.appendChild(root); },
      focusActive: function () { cellAt(active.r, active.c).focus({ preventScroll: false }); },
      cancel: cancel,
      hasAnchor: function () { return !!anchor; },
      activate: activate,
      // Podpowiedź: początek pierwszego nieznalezionego słowa.
      hint: function () {
        var found = cfg.found();
        var w = words.filter(function (x) { return found.indexOf(x.word) === -1; })[0];
        if (!w) return null;
        hint = { r: w.r0, c: w.c0, word: w.word };
        render();
        return { word: w.word, r: w.r0 + 1, c: w.c0 + 1 };
      },
      clear: function () { anchor = null; hint = null; drag = null; render(); },
      // Do testów: kontrola zgodności klucza z planszą.
      check: function () { return words.map(function (w) { return { word: w.word, valid: w.valid, length: w.cells ? w.cells.length : 0 }; }); },
      wordCells: function (word) { var w = words.filter(function (x) { return x.word === word; })[0]; return w ? { r0: w.r0, c0: w.c0, r1: w.r1, c1: w.c1 } : null; }
    };
  }

  window.GOZWordsearch = { create: create, lineCells: lineCells };
})();
