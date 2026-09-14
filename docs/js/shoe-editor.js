// Opcjonalny edytor wyglądu sprawnego buta 2D (Z2-I2). Specyfikacja: pakiet 02 §2 (edytor) i §3 (optional.shoeDesign), scenariusz 3.2 §4.
// Warstwy: baza → barwione panele → ozdoby przycięte do paneli → szwy → nienaruszana naszywka SELEKT.
// Maski paneli są robocze (data/shoe-outline.js); bez 3D, bez generatorów obrazów, bez punktów i warunków zaliczenia.
(function () {
  'use strict';
  var P = window.GOZProgress, K = window.GOZ_KEYS, E = window.GOZ_SHOE_EDITOR, G = window.GOZ_SHOE;
  var $ = function (id) { return document.getElementById(id); };
  var HISTORY_MAX = 20;
  // Położenie naszywki na roboczej bazie (środek, bok kwadratu, obrót); strefa ochronna ozdób: G.badge.protect.
  var PATCH = { cx: 1155, cy: 538, size: 290, rotation: -8 };
  var history = [], selectedPanel = null, selectedShape = null, ornamentColor = 'navy', patternIndex = -1;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }
  function fill(template, values) { return template.replace(/\{(\w)\}/g, function (m, k) { return values[k] !== undefined ? values[k] : m; }); }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function colorHex(id) { return byId(E.colors, id).hex; }
  function colorName(id) { return byId(E.colors, id).name; }
  function panelName(id) { return byId(E.panels, id).name; }
  function shapeName(id) { return byId(E.shapes, id).name; }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  function blank() { return { colors: { toe: 'white', side: 'white', heel: 'white', tongue: 'white' }, ornaments: [], finished: false }; }
  function design() { var d = P.get().optional.shoeDesign; return d ? JSON.parse(JSON.stringify(d)) : blank(); }

  function status(text) { $('shoe-status').textContent = text; }

  // Zapis wyglądu (kolory, kształty, współrzędne); walidacja w js/progress.js. Zapis z opóźnieniem do 400 ms.
  function commit(next, options) {
    P.update(function (d) { d.optional.shoeDesign = next; d.lastAnchor = 'z2-customize'; }, { kind: 'shoe', immediate: options && options.immediate });
    render();
  }
  function change(mutator) {
    var before = design();
    history.push(JSON.stringify(before));
    if (history.length > HISTORY_MAX) history.shift();
    var next = design();
    next.finished = false;
    mutator(next);
    commit(next);
  }

  // --- Rysunek -----------------------------------------------------------------------------

  function svgMarkup(d, prefix, interactive) {
    var vb = G.viewBox.join(' ');
    var defs = '<defs>';
    K.shoe.panels.forEach(function (p) { defs += '<clipPath id="' + prefix + '-clip-' + p + '"><path d="' + G.panels[p].path + '"/></clipPath>'; });
    defs += '</defs>';
    var paint = '<g class="shoe-paint">';
    K.shoe.panels.forEach(function (p) { paint += '<path d="' + G.panels[p].path + '" fill="' + colorHex(d.colors[p]) + '"/>'; });
    paint += '</g>';
    var orn = '';
    K.shoe.panels.forEach(function (p) {
      var list = d.ornaments.filter(function (o) { return o.panel === p; });
      if (!list.length) return;
      orn += '<g class="shoe-orn" clip-path="url(#' + prefix + '-clip-' + p + ')">';
      list.forEach(function (o) { orn += window.GOZArt3.ornament(o.shape, o.x, o.y, E.ornamentRadius, colorHex(o.color)); });
      orn += '</g>';
    });
    var seams = '<g class="shoe-seams">';
    K.shoe.panels.forEach(function (p) { seams += '<path d="' + G.panels[p].path + '"/>'; });
    seams += '</g>';
    // Robocza baza ma narysowany konturowy znak w innej perspektywie niż naszywka. Pod naszywką zakrywamy go gładką plamą
    // w kolorze materiału (przyciętą do panelu boku), żeby nie było podwójnego konturu (T-58).
    defs = defs.replace('</defs>', '<filter id="' + prefix + '-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter><radialGradient id="' + prefix + '-cream"><stop offset="0" stop-color="#D9C9BC"/><stop offset="1" stop-color="#D0BEAF"/></radialGradient></defs>');
    var cover = '<g clip-path="url(#' + prefix + '-clip-side)"><ellipse cx="' + PATCH.cx + '" cy="' + PATCH.cy + '" rx="152" ry="154" fill="url(#' + prefix + '-cream)" filter="url(#' + prefix + '-soft)"/></g>';
    var badge = '<image href="assets/images/naszywka-selekt.webp" x="' + (PATCH.cx - PATCH.size / 2) + '" y="' + (PATCH.cy - PATCH.size / 2) + '" width="' + PATCH.size + '" height="' + PATCH.size + '" transform="rotate(' + PATCH.rotation + ' ' + PATCH.cx + ' ' + PATCH.cy + ')"/>';
    var hit = '';
    if (interactive) {
      hit = '<g class="shoe-hit">';
      K.shoe.panels.forEach(function (p) { hit += '<path data-panel="' + p + '" class="' + (p === selectedPanel ? 'is-selected' : '') + '" d="' + G.panels[p].path + '"/>'; });
      hit += '</g>';
    }
    var label = 'But po naprawie. ' + E.panels.map(function (p) { return p.name + ': ' + lower(colorName(d.colors[p.id])); }).join(', ') + '. Ozdoby: ' + d.ornaments.length + '. Biała naszywka SELEKT.';
    return '<svg class="shoe-svg" viewBox="' + vb + '" role="img" aria-label="' + label + '" focusable="false">' + defs +
      '<image href="assets/images/but-baza.webp" x="0" y="0" width="' + G.viewBox[2] + '" height="' + G.viewBox[3] + '"/>' + cover + paint + orn + seams + badge + hit + '</svg>';
  }

  function toolButtons() {
    var panels = $('shoe-panels');
    E.panels.forEach(function (p) {
      var b = el('button', 'tool', p.name); b.type = 'button'; b.dataset.panel = p.id; b.setAttribute('aria-pressed', 'false');
      panels.appendChild(b);
    });
    function swatch(host, c, attr) {
      var b = el('button', 'swatch'); b.type = 'button'; b.dataset[attr] = c.id; b.setAttribute('aria-pressed', 'false');
      var dot = el('span', 'swatch-dot'); dot.style.background = c.hex; dot.setAttribute('aria-hidden', 'true');
      b.appendChild(dot); b.appendChild(el('span', 'swatch-name', c.name));
      host.appendChild(b);
    }
    E.colors.forEach(function (c) { swatch($('shoe-colors'), c, 'color'); swatch($('shoe-ornament-colors'), c, 'ornamentColor'); });
    E.sets.forEach(function (s) {
      var b = el('button', 'tool set'); b.type = 'button'; b.dataset.set = s.id;
      var dots = el('span', 'set-dots'); dots.setAttribute('aria-hidden', 'true');
      K.shoe.panels.forEach(function (p) { var dot = el('span', 'swatch-dot'); dot.style.background = colorHex(s.colors[p]); dots.appendChild(dot); });
      b.appendChild(dots); b.appendChild(el('span', null, s.name));
      b.setAttribute('aria-label', 'Zestaw ' + s.name + ': ' + E.panels.map(function (p) { return p.name.toLowerCase() + ' ' + lower(colorName(s.colors[p.id])); }).join(', '));
      $('shoe-sets').appendChild(b);
    });
    E.shapes.forEach(function (s) {
      var b = el('button', 'tool shape'); b.type = 'button'; b.dataset.shape = s.id; b.setAttribute('aria-pressed', 'false');
      var icon = el('span', 'shape-icon'); icon.setAttribute('aria-hidden', 'true'); icon.innerHTML = window.GOZArt3.ornamentIcon(s.id);
      b.appendChild(icon); b.appendChild(el('span', null, s.name));
      $('shoe-shapes').appendChild(b);
    });
  }

  function render() {
    var d = design();
    $('shoe-stage').innerHTML = svgMarkup(d, 'shoe-main', true);
    $('shoe-compare-design').innerHTML = svgMarkup(d, 'shoe-cmp', false);
    Array.prototype.forEach.call(document.querySelectorAll('#shoe-panels [data-panel]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.panel === selectedPanel)); });
    Array.prototype.forEach.call(document.querySelectorAll('#shoe-colors [data-color]'), function (b) { b.setAttribute('aria-pressed', String(!!selectedPanel && d.colors[selectedPanel] === b.dataset.color)); });
    Array.prototype.forEach.call(document.querySelectorAll('#shoe-ornament-colors [data-ornament-color]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.ornamentColor === ornamentColor)); });
    Array.prototype.forEach.call(document.querySelectorAll('#shoe-shapes [data-shape]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.shape === selectedShape)); });
    $('shoe-count').textContent = 'Ozdoby: ' + d.ornaments.length + ' z ' + K.shoe.maxOrnaments;
    var list = $('shoe-ornaments');
    list.innerHTML = '';
    d.ornaments.forEach(function (o, i) {
      var li = el('li', 'ornament-item');
      li.appendChild(el('span', null, (i + 1) + '. ' + shapeName(o.shape) + ' · ' + panelName(o.panel) + ' · ' + lower(colorName(o.color))));
      var rm = el('button', 'link-button', 'Usuń'); rm.type = 'button'; rm.dataset.remove = String(i);
      rm.setAttribute('aria-label', 'Usuń ozdobę ' + (i + 1) + ': ' + shapeName(o.shape).toLowerCase() + ' na panelu ' + panelName(o.panel));
      li.appendChild(rm);
      list.appendChild(li);
    });
    $('shoe-undo').disabled = history.length === 0;
    $('shoe-clear').disabled = d.ornaments.length === 0;
  }

  // --- Działania ---------------------------------------------------------------------------

  function selectPanel(p) { selectedPanel = p; render(); status(fill(E.messages.panel, { p: panelName(p) })); }

  function inProtect(x, y) {
    var r = G.badge.protect;
    return x > r[0] && x < r[0] + r[2] && y > r[1] && y < r[1] + r[3];
  }
  function freeAnchor(d, panel) {
    var r = E.ornamentRadius * 2;
    return E.anchors[panel].filter(function (a) {
      return !d.ornaments.some(function (o) { return o.panel === panel && Math.hypot(o.x - a[0], o.y - a[1]) < r; });
    })[0] || null;
  }
  function addOrnament(panel, x, y) {
    var d = design();
    if (!selectedShape) { status(E.messages.noShape); return false; }
    if (d.ornaments.length >= K.shoe.maxOrnaments) { status(E.messages.limit); return false; }
    if (inProtect(x, y)) { status(E.messages.badge); return false; }
    change(function (n) { n.ornaments.push({ shape: selectedShape, color: ornamentColor, panel: panel, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }); });
    status(fill(E.messages.added, { s: shapeName(selectedShape), p: panelName(panel), n: design().ornaments.length }));
    return true;
  }

  function svgPoint(svg, e) {
    var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : null;
  }

  function bind() {
    $('shoe-panels').addEventListener('click', function (e) { var b = e.target.closest('[data-panel]'); if (b) selectPanel(b.dataset.panel); });
    $('shoe-colors').addEventListener('click', function (e) {
      var b = e.target.closest('[data-color]'); if (!b) return;
      if (!selectedPanel) { status('Najpierw wybierz panel.'); return; }
      var p = selectedPanel, c = b.dataset.color;
      change(function (n) { n.colors[p] = c; });
      status(fill(E.messages.color, { p: panelName(p), c: lower(colorName(c)) }));
    });
    $('shoe-ornament-colors').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ornament-color]'); if (!b) return;
      ornamentColor = b.dataset.ornamentColor; render();
      status('Kolor kolejnych ozdób: ' + lower(colorName(ornamentColor)) + '.');
    });
    $('shoe-sets').addEventListener('click', function (e) {
      var b = e.target.closest('[data-set]'); if (!b) return;
      var s = byId(E.sets, b.dataset.set);
      change(function (n) { K.shoe.panels.forEach(function (p) { n.colors[p] = s.colors[p]; }); });
      status(fill(E.messages.set, { s: s.name, a: lower(colorName(s.colors.toe)), b: lower(colorName(s.colors.side)), c: lower(colorName(s.colors.heel)), d: lower(colorName(s.colors.tongue)) }));
    });
    $('shoe-shapes').addEventListener('click', function (e) {
      var b = e.target.closest('[data-shape]'); if (!b) return;
      selectedShape = selectedShape === b.dataset.shape ? null : b.dataset.shape;
      render();
      status(selectedShape ? fill(E.messages.shape, { s: shapeName(selectedShape) }) : 'Anulowano wybór ozdoby. Wskazanie na ilustracji wybiera panel.');
    });
    $('shoe-add').addEventListener('click', function () {
      if (!selectedShape) { status(E.messages.noShape); return; }
      if (!selectedPanel) { status('Najpierw wybierz panel, na którym ma być ozdoba.'); return; }
      var d = design();
      if (d.ornaments.length >= K.shoe.maxOrnaments) { status(E.messages.limit); return; }
      var a = freeAnchor(d, selectedPanel);
      if (!a) { status(fill(E.messages.noAnchor, { p: panelName(selectedPanel) })); return; }
      addOrnament(selectedPanel, a[0], a[1]);
    });
    $('shoe-pattern').addEventListener('click', function () {
      patternIndex = (patternIndex + 1) % E.compositions.length;
      var comp = E.compositions[patternIndex], shape = selectedShape || 'star';
      change(function (n) {
        n.ornaments = comp.slice(0, K.shoe.maxOrnaments).map(function (c) { var a = E.anchors[c[0]][c[1]]; return { shape: shape, color: ornamentColor, panel: c[0], x: a[0], y: a[1] }; });
      });
      status(fill(E.messages.pattern, { n: patternIndex + 1 }));
    });
    $('shoe-ornaments').addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]'); if (!b) return;
      var i = Number(b.dataset.remove);
      change(function (n) { n.ornaments.splice(i, 1); });
      status(E.messages.removed + ' Ozdoby: ' + design().ornaments.length + ' z 6.');
      var next = document.querySelector('#shoe-ornaments [data-remove]') || $('shoe-add');
      next.focus({ preventScroll: true });
    });
    $('shoe-undo').addEventListener('click', function () {
      if (!history.length) { status(E.messages.nothingToUndo); return; }
      var prev = JSON.parse(history.pop());
      commit(prev);
      status(E.messages.undo);
    });
    $('shoe-clear').addEventListener('click', function () {
      change(function (n) { n.ornaments = []; });
      status(E.messages.clearOrnaments);
    });
    $('shoe-white').addEventListener('click', function () {
      change(function (n) { var b = blank(); n.colors = b.colors; n.ornaments = []; });
      status(E.messages.white);
    });
    $('shoe-done').addEventListener('click', function () {
      var d = design(); d.finished = true;
      commit(d, { immediate: true });
      status(E.messages.done);
    });
    // Wskazanie na ilustracji: wybór panelu albo umieszczenie wybranej ozdoby w miejscu kliknięcia.
    $('shoe-stage').addEventListener('click', function (e) {
      var path = e.target.closest ? e.target.closest('[data-panel]') : null;
      if (!path) return;
      var panel = path.getAttribute('data-panel');
      selectedPanel = panel;
      if (!selectedShape) { selectPanel(panel); return; }
      var svg = path.ownerSVGElement, pt = svgPoint(svg, e);
      if (pt) addOrnament(panel, pt.x, pt.y);
    });
  }

  function renderLock() {
    var open = P.isComplete('Z2');
    $('shoe-locked').hidden = open;
    $('shoe-open').hidden = !open;
  }

  window.GOZShoeEditor = {
    init: function () {
      toolButtons();
      bind();
      render();
      renderLock();
      P.onChange(function (kind) { if (kind !== 'shoe' && kind !== 'anchor' && kind !== 'prefs') renderLock(); });
    },
    render: function () { render(); renderLock(); },
    reset: function () { history = []; selectedPanel = null; selectedShape = null; ornamentColor = 'navy'; patternIndex = -1; render(); renderLock(); status('Wybierz panel, potem kolor. Panel możesz też wskazać na ilustracji.'); },
    // Do testów.
    historyLength: function () { return history.length; },
    svg: function (d) { return svgMarkup(d || design(), 'shoe-test', false); }
  };
})();
