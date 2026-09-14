// Dodatek M1 — memory 16 kart / 8 par. Specyfikacja: scenariusz 3.2 §9 (M1), pakiet 02 §2 (memory) i §3 (optional.memoryState).
// Dwie odkryte karty → ocena pary. Nietrafiona para zostaje odkryta do „Zapamiętaj i zakryj”. Bez zegara, prób, rankingów i litery.
(function () {
  'use strict';
  var P = window.GOZProgress, K = window.GOZ_KEYS, M = window.GOZ_MEMORY;
  var $ = function (id) { return document.getElementById(id); };
  var open = [], waiting = false, sessionOrder = null;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function fill(template, values) { return template.replace(/\{(\w)\}/g, function (m, k) { return values[k] !== undefined ? values[k] : m; }); }
  function saved() { return P.get().optional.memoryState; }
  function pairOf(card) { return card.slice(0, 2); }
  function kindOf(card) { return card.slice(2) === 's' ? 'situation' : 'action'; }
  function pairData(card) { var id = pairOf(card); return M.pairs.filter(function (p) { return p.id === id; })[0]; }
  function matched() { return saved() ? saved().matched : []; }
  function revealed() { return !!(saved() && saved().revealed); }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function order() {
    if (saved() && saved().order) return saved().order;
    if (!sessionOrder) sessionOrder = shuffle(K.memory.cards);
    return sessionOrder;
  }
  // Zapis powstaje przy pierwszym działaniu ucznia w grze (samo obejrzenie sekcji nie tworzy postępu).
  function ensureSaved(mutator) {
    P.update(function (d) {
      var st = d.optional.memoryState || { order: null, matched: [], revealed: false };
      if (!st.order) st.order = order().slice();
      mutator(st);
      d.optional.memoryState = st;
      d.lastAnchor = 'memory';
    }, { kind: 'memory' });
  }

  function cardText(card) {
    var p = pairData(card);
    return kindOf(card) === 'situation' ? 'sytuacja: ' + p.situation : 'działanie: ' + p.action;
  }

  function status(text) { $('memory-status').textContent = text; }

  function render() {
    var grid = $('memory-grid');
    var focusCard = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.card : null;
    grid.innerHTML = '';
    var done = matched();
    order().forEach(function (card, i) {
      var isMatched = done.indexOf(pairOf(card)) !== -1;
      var isOpen = open.indexOf(card) !== -1;
      var faceUp = isMatched || isOpen || revealed();
      var li = el('li', 'memory-slot');
      var b = el('button', 'memory-card ' + kindOf(card) + (faceUp ? ' is-up' : '') + (isMatched ? ' is-matched' : '') + (isOpen ? ' is-open' : ''));
      b.type = 'button';
      b.dataset.card = card;
      var name = 'Karta ' + (i + 1) + ', ' + (faceUp ? cardText(card) : 'zakryta') + (isMatched ? ', para znaleziona' : isOpen ? ', wybrana' : '');
      b.setAttribute('aria-label', name);
      if (isMatched || isOpen) b.setAttribute('aria-disabled', 'true');
      if (faceUp) {
        var p = pairData(card);
        b.appendChild(el('span', 'memory-corner', kindOf(card) === 'situation' ? '◆ Sytuacja' : '● Działanie'));
        if (kindOf(card) === 'situation') {
          var art = el('span', 'memory-art');
          art.innerHTML = window.GOZArt3.memory(p.art);
          b.appendChild(art);
          b.appendChild(el('span', 'memory-caption', p.situation));
        } else {
          b.appendChild(el('span', 'memory-action', p.action));
        }
        if (isMatched) b.appendChild(el('span', 'memory-badge', '✓ Para'));
      } else {
        b.appendChild(el('span', 'memory-back', '?'));
        b.appendChild(el('span', 'memory-number', 'Karta ' + (i + 1)));
      }
      li.appendChild(b);
      grid.appendChild(li);
    });
    var closeBtn = $('memory-close');
    closeBtn.disabled = !waiting;
    closeBtn.textContent = revealed() ? 'Odznacz karty' : 'Zapamiętaj i zakryj';
    $('memory-reveal').setAttribute('aria-pressed', String(revealed()));
    $('memory-count').textContent = 'Znalezione pary: ' + done.length + ' z 8';
    if (focusCard) { var again = grid.querySelector('[data-card="' + focusCard + '"]'); if (again) again.focus({ preventScroll: true }); }
  }

  function pick(card) {
    if (matched().indexOf(pairOf(card)) !== -1 || open.indexOf(card) !== -1) return;
    if (waiting) { status(revealed() ? M.messages.missOpen : M.messages.waitClose); return; }
    if (!saved()) ensureSaved(function () {});
    open.push(card);
    if (open.length === 1) {
      render();
      status(fill(M.messages.oneOpen, { c: cardText(card) }));
      return;
    }
    var a = open[0], b = open[1];
    if (pairOf(a) === pairOf(b) && kindOf(a) !== kindOf(b)) {
      var p = pairData(a);
      open = [];
      ensureSaved(function (st) { if (st.matched.indexOf(p.id) === -1) st.matched.push(p.id); });
      render();
      var all = matched().length === K.memory.pairs.length;
      status(fill(M.messages.match, { s: p.situation, a: p.action }) + (all ? ' ' + M.messages.done : ''));
    } else {
      waiting = true;
      var focusWasCard = document.activeElement && document.activeElement.classList.contains('memory-card');
      render();
      status(revealed() ? M.messages.missOpen : M.messages.miss);
      if (focusWasCard) $('memory-close').focus({ preventScroll: true });
    }
  }

  function closePair() {
    if (!waiting) return;
    var last = open[1];
    open = [];
    waiting = false;
    render();
    status(M.messages.start);
    var again = last && document.querySelector('#memory-grid [data-card="' + last + '"]');
    if (again) again.focus({ preventScroll: true });
  }

  window.GOZMemory = {
    init: function () {
      $('memory-grid').addEventListener('click', function (e) {
        var b = e.target.closest('[data-card]');
        if (b) pick(b.dataset.card);
      });
      $('memory-close').addEventListener('click', closePair);
      $('memory-reveal').addEventListener('click', function () {
        var next = !revealed();
        ensureSaved(function (st) { st.revealed = next; });
        render();
        status(next ? M.messages.revealedOn : M.messages.revealedOff);
      });
      render();
      if (matched().length === K.memory.pairs.length) status(M.messages.done);
    },
    render: render,
    reset: function () { open = []; waiting = false; sessionOrder = null; render(); status(M.messages.start); },
    // Do testów: karty w kolejności na planszy.
    order: function () { return order().slice(); }
  };
})();
