// Karty sprawy jako nagrody rozdziałów: numer i nazwa karty bez litery (12_FINAL_KARTY_SPECYFIKACJA.md §3).
// Teksty wyłącznie z data/finale-cards.js (eksport finale_texts.json przez tools/build-data.cjs).
(function () {
  'use strict';
  var P = window.GOZProgress, K = window.GOZ_KEYS, C = window.GOZ_FINALE_CARDS;
  var seen = {}, earnedNow = {};

  function fill(template, values) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) { return values && values[k] !== undefined ? values[k] : m; });
  }
  function text(key, values) { return fill(C.texts[key], values); }
  function card(id) { return C.cards.filter(function (c) { return c.id === id; })[0]; }
  function cardVars(id) { var c = card(id); return { number: c.number, title: c.title }; }

  // Statyczne miejsca tekstów finału w dokumencie (misja, K00, blokady, etykiety odnośników).
  function renderStaticTexts(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('[data-cards-text]'), function (n) {
      n.textContent = text(n.getAttribute('data-cards-text'));
    });
  }

  function renderRewards() {
    K.order.forEach(function (id) {
      var done = P.isComplete(id);
      if (done && seen[id] === false) earnedNow[id] = true;
      if (!done) delete earnedNow[id];
      seen[id] = done;
      var c = card(id);
      Array.prototype.forEach.call(document.querySelectorAll('[data-reward="' + id + '"]'), function (box) {
        if (!box.firstChild) {
          var num = document.createElement('span');
          num.className = 'reward-number';
          num.id = id.toLowerCase() + '-letter';
          num.setAttribute('aria-hidden', 'true');
          num.textContent = String(c.number);
          var label = document.createElement('span');
          label.className = 'letter-label';
          label.appendChild(document.createTextNode('Karta sprawy ' + c.number));
          label.appendChild(document.createElement('br'));
          var strong = document.createElement('strong');
          strong.textContent = c.title;
          label.appendChild(strong);
          box.appendChild(num);
          box.appendChild(label);
        }
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-reward-status="' + id + '"]'), function (p) {
        p.textContent = done ? text(earnedNow[id] ? 'earned' : 'earnedReturn', cardVars(id)) : '';
      });
    });
  }

  window.GOZRewards = {
    init: function () {
      K.order.forEach(function (id) { seen[id] = P.isComplete(id); });
      renderStaticTexts(document);
      renderRewards();
      P.onChange(function (kind) { if (kind !== 'anchor' && kind !== 'prefs' && kind !== 'shoe' && kind !== 'memory') renderRewards(); });
    },
    reset: function () { K.order.forEach(function (id) { seen[id] = false; }); earnedNow = {}; renderRewards(); },
    text: text,
    card: card,
    cardVars: cardVars,
    progressText: function () { return text('progress', { count: P.completedCount() }); },
    // Opis zdobytej karty dla mapy i misji (bez litery).
    earnedLabel: function (id) { return text('earnedReturn', cardVars(id)); }
  };
})();
