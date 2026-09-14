// Wspólny zapis postępu całej lekcji.
// Specyfikacja: pakiet_wykonawczy_v1/02_ZADANIA_I_POSTEP.md §3 i §5 oraz progress.initial.json (treść 3.2-handoff1).
// Ukończenie i litery są zawsze wyliczane z odpowiedzi i kluczy, nigdy odczytywane z zapisu.
(function () {
  'use strict';
  var KEY = 'selekt.eksperci-goz.progress.v1';
  var SCHEMA = 1;
  var CONTENT = '3.2-handoff1';
  // Jedyna znana wcześniejsza wersja treści, dla której istnieje przejście (02 §5).
  var LEGACY_CONTENT = '3.1-handoff1';
  var K = window.GOZ_KEYS;
  var INITIAL = window.GOZ_PROGRESS_INITIAL;
  var SHOE = window.GOZ_SHOE;
  var SAVE_DELAY = 400;

  var state = clone(INITIAL);
  // mode: 'ok' | 'memory' (brak pamięci lub błąd zapisu) | 'blocked' (uszkodzony lub nieznany zapis, nie nadpisujemy)
  var mode = 'ok';
  // loadStatus: 'new' | 'restored' | 'migrated' | 'corrupt' | 'unknownVersion' | 'unavailable'
  var loadStatus = 'new';
  var saveTimer = null;
  var listeners = [];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function unique(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }
  function pickList(value, allowed) {
    return Array.isArray(value) ? unique(value.filter(function (v) { return allowed.indexOf(v) !== -1; })) : [];
  }
  function pickValue(value, allowed) { return allowed.indexOf(value) !== -1 ? value : null; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  // --- Walidacja zadań -------------------------------------------------------

  function sanitizeMatch(raw, key) {
    var out = { answers: {}, confirmed: [], assisted: false };
    var src = isObject(raw) ? raw : {};
    var answers = isObject(src.answers) ? src.answers : {};
    key.items.forEach(function (item) { out.answers[item] = pickValue(answers[item], key.options); });
    // Potwierdzone mogą być tylko elementy rzeczywiście przypisane poprawnie.
    out.confirmed = pickList(src.confirmed, key.items).filter(function (item) { return out.answers[item] === key.answers[item]; });
    out.assisted = src.assisted === true;
    return out;
  }

  function sanitizeZ3(raw) {
    var key = K.Z3, src = isObject(raw) ? raw : {};
    var placements = isObject(src.placements) ? src.placements : {};
    var out = { placements: {}, confirmed: [], conclusion: null, conclusionConfirmed: false, assisted: src.assisted === true };
    key.items.forEach(function (item) { out.placements[item] = pickValue(placements[item], key.zones); });
    out.confirmed = pickList(src.confirmed, key.items).filter(function (item) { return out.placements[item] === key.answers[item]; });
    out.conclusion = pickValue(src.conclusion, key.conclusions);
    out.conclusionConfirmed = src.conclusionConfirmed === true && out.conclusion === key.conclusion && out.confirmed.length === key.items.length;
    return out;
  }

  // Z4 (treść 3.2): dozwolone są wyłącznie identyfikatory z data/keys.js. Wycofane identyfikatory dawnego zadania
  // nie są przemapowywane na nowe karty — walidator je pomija, więc nie dają przypisań, potwierdzeń ani litery.
  function sanitizeZ4(raw) {
    var key = K.Z4, src = isObject(raw) ? raw : {};
    var split = src.split === true;
    var items = split ? key.splitItems : key.initialItems;
    var placements = isObject(src.placements) ? src.placements : {};
    var out = { split: split, placements: {}, confirmed: [], assisted: src.assisted === true };
    // Po rozdzieleniu nie istnieje już woreczek z obierkami; przed rozdzieleniem nie istnieją osobno obierki i pusty woreczek.
    items.forEach(function (item) { out.placements[item] = pickValue(placements[item], key.zones); });
    out.confirmed = pickList(src.confirmed, items).filter(function (item) { return key.answers[item] && out.placements[item] === key.answers[item]; });
    return out;
  }

  function sanitizeZ5(raw) {
    var key = K.Z5, src = isObject(raw) ? raw : {};
    var out = { wetSelected: pickList(src.wetSelected, key.wetOptions).slice(0, 2), wetConfirmed: [], drySelected: null, dryConfirmed: false, assisted: src.assisted === true };
    out.wetConfirmed = pickList(src.wetConfirmed, key.wetAnswers).filter(function (id) { return out.wetSelected.indexOf(id) !== -1; });
    out.drySelected = pickValue(src.drySelected, key.dryOptions);
    out.dryConfirmed = src.dryConfirmed === true && out.drySelected === key.dryAnswer;
    return out;
  }

  function sanitizeZ6(raw) {
    var key = K.Z6, src = isObject(raw) ? raw : {};
    var meanings = isObject(src.meanings) ? src.meanings : {};
    var out = { foundWords: pickList(src.foundWords, key.words), revealed: src.revealed === true, meanings: {}, confirmed: [], assisted: src.assisted === true };
    var used = [];
    // Każde słowo w znaczeniach tylko raz: przy powtórzeniu zostaje pierwsze wystąpienie.
    key.items.forEach(function (item) {
      var v = pickValue(meanings[item], key.meaningOptions);
      if (v && used.indexOf(v) !== -1) v = null;
      if (v) used.push(v);
      out.meanings[item] = v;
    });
    out.confirmed = pickList(src.confirmed, key.items).filter(function (item) { return out.meanings[item] === key.answers[item]; });
    return out;
  }

  // Projekt buta: kolory paneli, ozdoby (kształt, kolor, panel, współrzędne w układzie ilustracji) i znacznik „Gotowe”.
  // Bez obrazów w zapisie. Ozdoby poza prostokątem panelu lub w strefie naszywki są odrzucane.
  function sanitizeShoe(raw) {
    if (!isObject(raw)) return null;
    var S = K.shoe;
    var colors = isObject(raw.colors) ? raw.colors : {};
    var out = { colors: {}, ornaments: [], finished: raw.finished === true };
    S.panels.forEach(function (p) { out.colors[p] = pickValue(colors[p], S.colors) || 'white'; });
    var protect = SHOE && SHOE.badge ? SHOE.badge.protect : null;
    (Array.isArray(raw.ornaments) ? raw.ornaments : []).forEach(function (o) {
      if (!isObject(o) || out.ornaments.length >= S.maxOrnaments) return;
      var shape = pickValue(o.shape, S.shapes), color = pickValue(o.color, S.colors), panel = pickValue(o.panel, S.panels);
      if (!shape || !color || !panel || !isNum(o.x) || !isNum(o.y)) return;
      var box = SHOE && SHOE.panels[panel] ? SHOE.panels[panel].box : null;
      if (box && (o.x < box[0] || o.x > box[0] + box[2] || o.y < box[1] || o.y > box[1] + box[3])) return;
      if (protect && o.x > protect[0] && o.x < protect[0] + protect[2] && o.y > protect[1] && o.y < protect[1] + protect[3]) return;
      out.ornaments.push({ shape: shape, color: color, panel: panel, x: Math.round(o.x * 10) / 10, y: Math.round(o.y * 10) / 10 });
    });
    return out;
  }

  // Memory: kolejność szesnastu kart (permutacja), znalezione pary i wariant „Odkryte karty”. Bez liczby prób i czasu.
  function sanitizeMemory(raw) {
    if (!isObject(raw)) return null;
    var M = K.memory;
    var order = Array.isArray(raw.order) && raw.order.length === M.cards.length && unique(raw.order).length === M.cards.length &&
      raw.order.every(function (c) { return M.cards.indexOf(c) !== -1; }) ? raw.order.slice() : null;
    return { order: order, matched: pickList(raw.matched, M.pairs), revealed: raw.revealed === true };
  }

  function sanitize(raw) {
    var out = clone(INITIAL);
    out.updatedAt = typeof raw.updatedAt === 'string' && !isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : null;
    out.lastAnchor = pickValue(raw.lastAnchor, K.anchors) || 'entry';
    var prefs = isObject(raw.preferences) ? raw.preferences : {};
    out.preferences.motion = pickValue(prefs.motion, ['system', 'reduced', 'full']) || 'system';
    out.preferences.volume = typeof prefs.volume === 'number' && prefs.volume >= 0 && prefs.volume <= 1 ? prefs.volume : 1;
    var tasks = isObject(raw.tasks) ? raw.tasks : {};
    out.tasks.Z1 = sanitizeMatch(tasks.Z1, K.Z1);
    out.tasks.Z2 = sanitizeMatch(tasks.Z2, K.Z2);
    out.tasks.Z3 = sanitizeZ3(tasks.Z3);
    out.tasks.Z4 = sanitizeZ4(tasks.Z4);
    out.tasks.Z5 = sanitizeZ5(tasks.Z5);
    out.tasks.Z6 = sanitizeZ6(tasks.Z6);
    var optional = isObject(raw.optional) ? raw.optional : {};
    out.optional = { shoeDesign: sanitizeShoe(optional.shoeDesign), memoryState: sanitizeMemory(optional.memoryState) };
    out.finale = sanitizeFinale(raw.finale, out);
    return out;
  }

  // Finał z kartami (02 §6): najpierw ukończenie zadań, potem odsłonięcia. passwordSolved jest wyliczane, nie odczytywane.
  function sanitizeFinale(raw, s) {
    var out = { passwordSolved: false, revealedCards: [] };
    if (!allComplete(s) || !isObject(raw)) return out;
    if (Object.prototype.hasOwnProperty.call(raw, 'revealedCards')) {
      // Istniejące pole jest jedynym źródłem odsłonięć; null, ciąg lub inny typ nie jest „brakiem właściwości”.
      if (Array.isArray(raw.revealedCards)) out.revealedCards = K.order.filter(function (id) { return raw.revealedCards.indexOf(id) !== -1; });
    } else if (raw.passwordSolved === true) {
      // Wyjątek zgodności: stary poprawnie otwarty zapis 3.2 bez pola — komplet odsłoniętych kart (bez uruchamiania filmu).
      out.revealedCards = K.order.slice();
    }
    out.passwordSolved = out.revealedCards.length === K.order.length;
    return out;
  }

  // --- Przejście 3.1-handoff1 → 3.2-handoff1 (02 §5) ---------------------------------------
  // Zachowujemy (po walidacji) Z1–Z3, Z5, Z6, preferencje i dodatki; Z4 dostaje nowy pusty wzór, finał zostaje zamknięty.
  // Nie przenosimy przypisań dawnych kart Z4 na nowe karty. Litery wylicza się ponownie.
  function migrateLegacy(raw) {
    var out = clone(raw);
    if (!isObject(out.tasks)) out.tasks = {};
    out.tasks.Z4 = clone(INITIAL.tasks.Z4);
    out.finale = { passwordSolved: false, revealedCards: [] };
    var at = K.anchors.indexOf(out.lastAnchor);
    if (at > K.anchors.indexOf('z4-task')) out.lastAnchor = 'z4-task';
    out.contentVersion = CONTENT;
    return out;
  }

  // --- Ukończenie ------------------------------------------------------------

  function taskComplete(s, id) {
    var t = s.tasks[id];
    switch (id) {
      case 'Z1': return K.Z1.items.every(function (i) { return t.confirmed.indexOf(i) !== -1; });
      case 'Z2': return K.Z2.items.every(function (i) { return t.confirmed.indexOf(i) !== -1; });
      case 'Z3': return t.confirmed.length === K.Z3.items.length && t.conclusionConfirmed;
      case 'Z4': return t.split && K.Z4.splitItems.every(function (i) { return t.confirmed.indexOf(i) !== -1; });
      case 'Z5': return K.Z5.wetAnswers.every(function (i) { return t.wetConfirmed.indexOf(i) !== -1; }) && t.dryConfirmed;
      case 'Z6': return (t.revealed || t.foundWords.length === K.Z6.words.length) && K.Z6.items.every(function (i) { return t.confirmed.indexOf(i) !== -1; });
    }
    return false;
  }
  function allComplete(s) { return K.order.every(function (id) { return taskComplete(s, id); }); }

  // --- Pamięć przeglądarki ---------------------------------------------------

  function load() {
    var raw;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (e) {
      mode = 'memory'; loadStatus = 'unavailable';
      return;
    }
    if (raw === null) { loadStatus = 'new'; return; }
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { mode = 'blocked'; loadStatus = 'corrupt'; return; }
    if (!isObject(parsed)) { mode = 'blocked'; loadStatus = 'corrupt'; return; }
    // Znana wcześniejsza wersja: przejście przed ogólną blokadą nieznanych wersji.
    if (parsed.schemaVersion === SCHEMA && parsed.contentVersion === LEGACY_CONTENT) {
      state = sanitize(migrateLegacy(parsed));
      loadStatus = 'migrated';
      // Zapis nowej wersji od razu; przy błędzie aplikacja pracuje w pamięci i nie ogłasza trwałego przejścia.
      writeNow();
      return;
    }
    if (parsed.schemaVersion !== SCHEMA || parsed.contentVersion !== CONTENT) { mode = 'blocked'; loadStatus = 'unknownVersion'; return; }
    state = sanitize(parsed);
    loadStatus = 'restored';
    // Znormalizowany finał zapisujemy dotychczasowym mechanizmem, gdy różni się od wczytanego (02 §6 pkt 6).
    if (JSON.stringify(parsed.finale) !== JSON.stringify(state.finale)) writeNow();
  }

  function writeNow() {
    saveTimer = null;
    if (mode === 'blocked') return;
    state.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      if (mode === 'memory') { mode = 'ok'; emit('storage'); }
    } catch (e) {
      if (mode !== 'memory') { mode = 'memory'; emit('storage'); }
    }
  }

  function scheduleSave(immediate) {
    if (saveTimer) clearTimeout(saveTimer);
    if (immediate) writeNow(); else saveTimer = setTimeout(writeNow, SAVE_DELAY);
  }

  function emit(kind) { listeners.forEach(function (fn) { try { fn(kind, state); } catch (e) { console.error(e); } }); }

  // --- Interfejs publiczny ---------------------------------------------------

  window.GOZProgress = {
    key: KEY,
    contentVersion: CONTENT,
    init: function () { load(); return loadStatus; },
    get: function () { return state; },
    loadStatus: function () { return loadStatus; },
    mode: function () { return mode; },
    // Przejście z 3.1 zapisane trwale tylko wtedy, gdy zapis do pamięci przeglądarki się udał.
    migrationSaved: function () { return loadStatus === 'migrated' && mode === 'ok'; },
    // Zmiana stanu: funkcja otrzymuje stan roboczy; po zmianie walidujemy całość, żeby w pamięci nie zostały sprzeczne dane.
    update: function (mutator, options) {
      var draft = clone(state);
      mutator(draft);
      state = sanitize(draft);
      state.updatedAt = draft.updatedAt;
      scheduleSave(options && options.immediate);
      emit((options && options.kind) || 'change');
      return state;
    },
    flush: function () { if (saveTimer) writeNow(); },
    hasProgress: function () {
      if (state.updatedAt === null) return false;
      return state.lastAnchor !== 'entry' || K.order.some(function (id) { return JSON.stringify(state.tasks[id]) !== JSON.stringify(INITIAL.tasks[id]); }) ||
        state.optional.shoeDesign !== null || state.optional.memoryState !== null;
    },
    isComplete: function (id) { return taskComplete(state, id); },
    allComplete: function () { return allComplete(state); },
    // Litery kart zdobytych zadań (dane i kontrole). W interfejsie litera pojawia się dopiero po odsłonięciu karty w finale.
    letter: function (id) { return taskComplete(state, id) ? K.letters[id] : null; },
    letters: function () { return K.order.map(function (id) { return taskComplete(state, id) ? K.letters[id] : null; }); },
    revealedCards: function () { return state.finale.revealedCards.slice(); },
    isRevealed: function (id) { return state.finale.revealedCards.indexOf(id) !== -1; },
    finaleOpen: function () { return state.finale.passwordSolved === true; },
    // Świadome odsłonięcie jednej karty: tylko przy komplecie ukończonych zadań i jeszcze zakrytej karcie.
    revealCard: function (id) {
      if (K.order.indexOf(id) === -1 || !allComplete(state) || state.finale.revealedCards.indexOf(id) !== -1) return { ok: false };
      var before = state.finale.passwordSolved;
      this.update(function (d) {
        d.finale.revealedCards = d.finale.revealedCards.concat([id]);
        d.lastAnchor = 'password';
      }, { immediate: true, kind: 'finale' });
      return { ok: true, count: state.finale.revealedCards.length, opened: !before && state.finale.passwordSolved };
    },
    completedCount: function () { return K.order.filter(function (id) { return taskComplete(state, id); }).length; },
    // „Zacznij od nowa”: usuwa wyłącznie klucz tej lekcji.
    reset: function () {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      var keepMotion = state.preferences.motion;
      state = clone(INITIAL);
      state.preferences.motion = keepMotion;
      try { window.localStorage.removeItem(KEY); if (mode !== 'blocked') mode = 'ok'; } catch (e) { mode = 'memory'; }
      if (mode === 'blocked') mode = 'ok';
      loadStatus = 'new';
      emit('reset');
    },
    // Po świadomym wyborze ucznia tworzymy poprawny zapis w miejsce uszkodzonego lub nieznanego.
    startNewSave: function () {
      mode = 'ok';
      loadStatus = 'new';
      state = clone(INITIAL);
      scheduleSave(true);
      emit('reset');
    },
    onChange: function (fn) { listeners.push(fn); },
    // Do testów: walidacja surowego obiektu bez zmiany stanu.
    _sanitize: function (raw) { return sanitize(raw); },
    _migrate: function (raw) { return sanitize(migrateLegacy(raw)); },
    _taskComplete: function (s, id) { return taskComplete(s, id); }
  };
})();
