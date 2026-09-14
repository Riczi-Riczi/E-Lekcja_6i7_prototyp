// Zadanie „karta → strefa” z pulą jednorazową (Z3 mapa i wniosek, Z4 BIO, Z5 mokry i suchy kompostownik, Z6 znaczenia).
// Specyfikacja: 02_ZADANIA_I_POSTEP.md §1 i §2. Stan zapisu obsługują funkcje adaptera przekazane w konfiguracji,
// bo każde zadanie ma inny kształt danych w progress.initial.json.
(function () {
  'use strict';
  var P = window.GOZProgress;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined && text !== null) n.textContent = text; return n; }

  function create(cfg) {
    var px = cfg.prefix;
    var host = document.getElementById(px + '-board');
    var selected = null, history = [], feedback = {}, guided = null, lastMessage = '';
    var reduced = function () { return false; };
    var poolList, zoneLists = {}, zoneTargets = {}, statusBox, selectionBox, cancelBtn, checkBtn, undoBtn, countBox;

    function item(id) { return cfg.item(id); }
    function label(id) { return item(id).label; }
    function placed(id) { return cfg.placement(id); }
    function confirmed(id) { return cfg.isConfirmed(id); }
    function announce(text) { statusBox.textContent = text; lastMessage = text; }

    function build() {
      host.classList.add('sort-board');
      if (cfg.layoutClass) host.classList.add(cfg.layoutClass);
      var pool = el('div', 'sort-pool');
      var poolTitle = el('p', 'eyebrow', cfg.poolTitle || 'Karty do umieszczenia');
      poolTitle.id = px + '-pool-title';
      pool.appendChild(poolTitle);
      poolList = el('ul', 'sort-list');
      poolList.id = px + '-pool';
      poolList.setAttribute('aria-labelledby', poolTitle.id);
      pool.appendChild(poolList);
      if (cfg.poolNote) pool.appendChild(el('p', 'small-note', cfg.poolNote));
      host.appendChild(pool);

      var zones = el('div', 'sort-zones');
      cfg.zones.forEach(function (z) {
        var box = el('section', 'zone zone-' + z.id);
        box.id = px + '-zone-' + z.id;
        box.dataset.zone = z.id;
        var h = el('h3', 'zone-title', z.label);
        h.id = px + '-zone-title-' + z.id;
        box.setAttribute('aria-labelledby', h.id);
        box.appendChild(h);
        if (z.note) box.appendChild(el('p', 'zone-note', z.note));
        if (cfg.zoneExtra) cfg.zoneExtra(z, box);
        (z.fixed || []).forEach(function (f) { box.appendChild(el('p', 'zone-fixed', f)); });
        var list = el('ul', 'sort-list zone-items');
        box.appendChild(list);
        zoneLists[z.id] = list;
        var target = el('button', 'zone-target', 'Umieść tutaj');
        target.type = 'button';
        target.dataset.zone = z.id;
        target.setAttribute('aria-label', 'Umieść wybraną kartę w polu: ' + z.label);
        box.appendChild(target);
        zoneTargets[z.id] = target;
        if (z.end) box.appendChild(el('p', 'zone-fixed zone-end', z.end));
        zones.appendChild(box);
      });
      host.appendChild(zones);
      if (cfg.caption) host.appendChild(el('p', 'small-note sort-caption', cfg.caption));

      var controls = el('div', 'sort-controls');
      selectionBox = el('p', 'selection');
      selectionBox.setAttribute('role', 'status');
      controls.appendChild(selectionBox);
      cancelBtn = el('button', 'link-button', 'Anuluj wybór (Esc)');
      cancelBtn.type = 'button';
      cancelBtn.hidden = true;
      controls.appendChild(cancelBtn);
      var row = el('div', 'check-row');
      checkBtn = el('button', 'primary', cfg.checkLabel || 'Sprawdź');
      checkBtn.type = 'button';
      checkBtn.id = px + '-check';
      undoBtn = el('button', null, 'Cofnij ostatni ruch');
      undoBtn.type = 'button';
      undoBtn.id = px + '-undo';
      countBox = el('span', 'solved-count');
      countBox.id = px + '-count';
      row.appendChild(checkBtn); row.appendChild(undoBtn); row.appendChild(countBox);
      controls.appendChild(row);
      statusBox = el('div', 'feedback');
      statusBox.id = px + '-feedback';
      statusBox.setAttribute('role', 'status');
      statusBox.textContent = cfg.startMessage;
      controls.appendChild(statusBox);
      host.appendChild(controls);
    }

    function itemNode(id) {
      var it = item(id);
      var li = el('li', 'sort-item');
      li.id = px + '-item-' + id;
      li.dataset.item = id;
      var isConf = confirmed(id);
      li.classList.toggle('is-correct', isConf);
      li.classList.toggle('is-error', !!(!isConf && feedback[id] && feedback[id].kind === 'error'));
      li.classList.toggle('is-selected', selected === id);
      li.classList.toggle('is-guided', guided === id && !isConf);
      var pick = el('button', 'item-pick');
      pick.type = 'button';
      pick.dataset.pick = id;
      pick.disabled = isConf;
      pick.setAttribute('aria-pressed', String(selected === id));
      if (it.art && cfg.art) {
        var art = el('span', 'item-art');
        art.setAttribute('aria-hidden', 'true');
        art.innerHTML = cfg.art(it.art);
        pick.appendChild(art);
      }
      var text = el('span', 'item-label', (isConf ? '✓ ' : '') + it.label);
      pick.appendChild(text);
      li.appendChild(pick);
      if (it.note) li.appendChild(el('p', 'item-note', it.note));
      if (cfg.extraButtons) cfg.extraButtons(id, li);
      if (placed(id) && !isConf) {
        var back = el('button', 'link-button item-back', 'Wróć do kart');
        back.type = 'button';
        back.dataset.back = id;
        li.appendChild(back);
      }
      var fb = feedback[id];
      if (isConf) {
        var good = el('div', 'item-fb good');
        good.appendChild(el('p', 'feedback-state', '✓ Dobrze'));
        var gt = cfg.goodText ? cfg.goodText(id) : null;
        if (gt) good.appendChild(el('p', null, gt));
        li.appendChild(good);
      } else if (fb) {
        var bad = el('div', 'item-fb ' + (fb.kind === 'error' ? 'bad' : 'missing'));
        bad.appendChild(el('p', 'feedback-state', fb.kind === 'error' ? 'Jeszcze nie — przeczytaj wskazówkę' : 'Do uzupełnienia'));
        bad.appendChild(el('p', null, fb.text));
        li.appendChild(bad);
      }
      return li;
    }

    function render() {
      poolList.innerHTML = '';
      Object.keys(zoneLists).forEach(function (z) { zoneLists[z].innerHTML = ''; });
      cfg.items().forEach(function (id) {
        var z = placed(id);
        (z ? zoneLists[z] : poolList).appendChild(itemNode(id));
      });
      if (!poolList.children.length) poolList.appendChild(el('li', 'sort-empty', cfg.poolEmpty || 'Wszystkie karty są już w polach.'));
      Object.keys(zoneTargets).forEach(function (z) {
        zoneTargets[z].classList.toggle('is-ready', !!selected);
        zoneTargets[z].disabled = cfg.isDone();
      });
      var total = cfg.items().length;
      var done = cfg.items().filter(confirmed).length;
      countBox.textContent = cfg.countText ? cfg.countText(done, total) : 'Dobrze umieszczone: ' + done + ' z ' + total;
      checkBtn.disabled = cfg.isDone();
      undoBtn.disabled = history.length === 0;
      selectionBox.textContent = selected
        ? 'Wybrano: ' + label(selected) + '. Teraz wybierz miejsce — przycisk „Umieść tutaj” w polu.'
        : (cfg.isDone() ? '' : 'Wybierz kartę, a potem pole. Możesz też przeciągnąć kartę do pola.');
      cancelBtn.hidden = !selected;
      host.classList.toggle('has-selection', !!selected);
      if (cfg.afterRender) cfg.afterRender();
    }

    // Przebudowa list usuwa przyciski — przywracamy fokus na tę samą kartę, jeśli uczeń pracuje w planszy.
    function focusPick(id) {
      var btn = document.querySelector('#' + px + '-item-' + id + ' .item-pick');
      if (btn) btn.focus({ preventScroll: true });
    }
    function select(id) {
      if (id && confirmed(id)) return;
      var focusInside = document.activeElement && host.contains(document.activeElement);
      var previous = selected;
      selected = id;
      render();
      if (focusInside && (id || previous)) focusPick(id || previous);
    }

    function snapshot() { history.push(cfg.snapshot()); if (history.length > 20) history.shift(); }

    function place(id, zone) {
      if (!id) { announce('Najpierw wybierz kartę, potem pole.'); return; }
      if (confirmed(id)) return;
      if (cfg.canPlace) {
        var refusal = cfg.canPlace(id, zone);
        if (refusal) { announce(refusal); return; }
      }
      snapshot();
      delete feedback[id];
      P.update(function (d) { cfg.setPlacement(d, id, zone); d.lastAnchor = cfg.anchor; }, { kind: px });
      selected = null;
      render();
      var zoneLabel = zone ? cfg.zones.filter(function (z) { return z.id === zone; })[0].label : null;
      announce(zone ? 'Umieszczono „' + label(id) + '” w polu „' + zoneLabel + '”. Użyj „' + (cfg.checkLabel || 'Sprawdź') + '”, aby ocenić odpowiedzi.' : 'Karta „' + label(id) + '” wróciła do kart do umieszczenia.');
      var target = zone ? zoneTargets[zone] : null;
      if (target && document.activeElement === document.body) target.focus({ preventScroll: true });
      if (!zone && document.activeElement === document.body) focusPick(id);
    }

    function undo() {
      if (!history.length) return;
      var snap = history.pop();
      P.update(function (d) { cfg.restore(d, snap); }, { kind: px });
      cfg.items().forEach(function (id) { if (!confirmed(id)) delete feedback[id]; });
      render();
      announce('Cofnięto ostatni ruch.');
    }

    function check() {
      var result = cfg.evaluate();
      feedback = {};
      Object.keys(result.feedback || {}).forEach(function (id) { feedback[id] = result.feedback[id]; });
      history = [];
      P.update(function (d) { cfg.applyConfirm(d, result.confirm || []); d.lastAnchor = cfg.anchor; }, { immediate: true, kind: px });
      if (guided && confirmed(guided)) { guided = null; if (cfg.onGuide) cfg.onGuide(null); }
      render();
      statusBox.textContent = '';
      if (cfg.isDone()) {
        statusBox.appendChild(document.createTextNode((cfg.doneText || 'Wszystko na właściwych miejscach.') + ' '));
        if (cfg.doneLink) {
          var a = el('a', null, cfg.doneLink.label);
          a.href = cfg.doneLink.href;
          statusBox.appendChild(a);
        }
      } else {
        statusBox.textContent = (result.messages || []).join(' ');
      }
      lastMessage = statusBox.textContent;
      if (cfg.onCheck) cfg.onCheck(result);
    }

    function guide() {
      var next = cfg.items().filter(function (id) { return !confirmed(id); })[0];
      if (!next || cfg.isDone()) return null;
      guided = next;
      render();
      var node = document.getElementById(px + '-item-' + next);
      if (node) node.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' });
      if (cfg.onGuide) cfg.onGuide(next);
      return next;
    }

    // Przeciąganie wskaźnikiem z karty do pola.
    var drag = null, ghost = null, hover = null, suppressClick = false;
    function zoneAt(x, y) {
      var n = document.elementFromPoint(x, y);
      var z = n && n.closest ? n.closest('.zone') : null;
      if (z && host.contains(z)) return z;
      var pool = n && n.closest ? n.closest('.sort-pool') : null;
      return pool && host.contains(pool) ? pool : null;
    }
    function cleanDrag() { if (ghost) ghost.remove(); ghost = null; if (hover) hover.classList.remove('drop-hover'); hover = null; drag = null; }

    function bindEvents() {
      host.addEventListener('click', function (e) {
        var pick = e.target.closest('[data-pick]');
        if (pick && host.contains(pick)) { if (!suppressClick) select(selected === pick.dataset.pick ? null : pick.dataset.pick); return; }
        var target = e.target.closest('.zone-target');
        if (target && host.contains(target)) { place(selected, target.dataset.zone); return; }
        var back = e.target.closest('[data-back]');
        if (back && host.contains(back)) { place(back.dataset.back, null); return; }
      });
      host.addEventListener('pointerdown', function (e) {
        var pick = e.target.closest('[data-pick]');
        if (!pick || e.button !== 0 || pick.disabled) return;
        drag = { id: pick.dataset.pick, x: e.clientX, y: e.clientY, pointer: e.pointerId, moved: false, source: pick };
      });
      host.addEventListener('pointermove', function (e) {
        if (!drag || drag.pointer !== e.pointerId) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 9) return;
        if (!drag.moved) {
          drag.moved = true;
          try { drag.source.setPointerCapture(e.pointerId); } catch (err) { /* bez przechwycenia */ }
          ghost = el('div', 'drag-ghost', label(drag.id));
          ghost.setAttribute('aria-hidden', 'true');
          document.body.appendChild(ghost);
        }
        ghost.style.left = e.clientX + 'px';
        ghost.style.top = e.clientY + 'px';
        var z = zoneAt(e.clientX, e.clientY);
        if (hover && hover !== z) hover.classList.remove('drop-hover');
        hover = z;
        if (hover) hover.classList.add('drop-hover');
      });
      host.addEventListener('pointerup', function (e) {
        if (!drag) return;
        var d = drag;
        if (d.moved) {
          var z = zoneAt(e.clientX, e.clientY);
          if (z && z.dataset.zone) place(d.id, z.dataset.zone);
          else if (z) place(d.id, null);
          else announce('Upuść kartę w polu albo wybierz „Umieść tutaj”.');
          suppressClick = true;
          setTimeout(function () { suppressClick = false; }, 0);
        }
        cleanDrag();
      });
      host.addEventListener('pointercancel', cleanDrag);
      cancelBtn.addEventListener('click', function () { selected = null; render(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && selected && !document.querySelector('dialog[open]')) { selected = null; render(); announce('Anulowano wybór karty.'); }
      });
      checkBtn.addEventListener('click', check);
      undoBtn.addEventListener('click', undo);
    }

    return {
      init: function (options) { reduced = options.reducedMotion; build(); bindEvents(); render(); },
      render: render,
      reset: function () { selected = null; history = []; feedback = {}; guided = null; render(); announce(cfg.startMessage); },
      guide: guide,
      check: check,
      clearGuide: function () { guided = null; render(); },
      clearHistory: function () { history = []; render(); },
      setFeedback: function (id, fb) { if (fb) feedback[id] = fb; else delete feedback[id]; render(); },
      selected: function () { return selected; }
    };
  }

  window.GOZSortTask = { create: create };
})();
