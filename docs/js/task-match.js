// Zadanie dopasowania z pulą wielokrotną (Z1 — cztery sytuacje, Z2 — dwa przypadki).
// Specyfikacja: 02_ZADANIA_I_POSTEP.md §1 (stany) i §2 (Z1, Z2). Mechanika przeniesiona z wzorca Z1.
// Identyfikatory elementów mają przedrostek rozdziału, np. z1-actions, z2-check.
(function () {
  'use strict';
  var P = window.GOZProgress;

  function create(cfg) {
    var D = cfg.data, KEY = cfg.key, px = cfg.prefix, TASK = cfg.taskId;
    var $ = function (id) { return document.getElementById(px + '-' + id); };
    var selected = null, history = [], feedback = {}, guided = null, wasComplete = false;
    var reduced = function () { return false; };

    function t() { return P.get().tasks[TASK]; }
    function action(id) { return D.actions.filter(function (a) { return a.id === id; })[0]; }
    function caseById(id) { return D.cases.filter(function (c) { return c.id === id; })[0]; }
    function caseIndex(id) { return D.cases.map(function (c) { return c.id; }).indexOf(id); }
    function isConfirmed(id) { return t().confirmed.indexOf(id) !== -1; }
    function announce(text) { $('feedback').textContent = text; }
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

    function buildActions() {
      var box = $('actions');
      D.actions.forEach(function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'action';
        b.dataset.action = a.id;
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="action-icon" aria-hidden="true">' + a.icon + '</span><span class="action-label"></span>';
        b.querySelector('.action-label').textContent = a.label;
        box.appendChild(b);
      });
    }

    function buildCases() {
      var list = $('cases');
      D.cases.forEach(function (c, i) {
        var li = document.createElement('li');
        li.className = 'case';
        li.id = px + '-case-' + c.id;
        li.dataset.case = c.id;
        var textHost = c.audio ? ' id="audio-' + c.audio + '"' : '';
        li.innerHTML =
          '<div class="case-head"><span class="case-number" aria-hidden="true">' + (cfg.numberLabel ? esc(cfg.numberLabel(c, i)) : (i + 1)) + '</span><h3>' + esc(c.title) + '</h3></div>' +
          '<div class="case-art-host"></div>' +
          '<div class="case-text"' + textHost + '><p id="' + px + '-text-' + c.id + '"></p></div>' +
          '<div class="case-answer">' +
            '<button type="button" class="assign" data-target="' + c.id + '"></button>' +
            '<button type="button" class="link-button remove" data-remove="' + c.id + '" hidden>Usuń przypisanie</button>' +
          '</div>' +
          '<div class="case-feedback" id="' + px + '-fb-' + c.id + '" hidden></div>';
        list.appendChild(li);
        $('text-' + c.id).textContent = c.text;
      });
    }

    function markClue(c, on) {
      var p = $('text-' + c.id);
      var idx = on ? c.text.indexOf(c.decisive) : -1;
      p.textContent = '';
      if (idx === -1) { p.textContent = c.text; return; }
      p.appendChild(document.createTextNode(c.text.slice(0, idx)));
      var mark = document.createElement('mark');
      mark.textContent = c.decisive;
      p.appendChild(mark);
      p.appendChild(document.createTextNode(c.text.slice(idx + c.decisive.length)));
    }

    function renderSelection() {
      Array.prototype.forEach.call($('actions').querySelectorAll('.action'), function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.action === selected));
      });
      $('selection').textContent = selected
        ? 'Wybrano: ' + action(selected).label + '. Teraz wybierz miejsce - przycisk na karcie.'
        : 'Wybierz działanie. Możesz użyć go na kilku kartach.';
      $('cancel').hidden = !selected;
      $('task').classList.toggle('has-selection', !!selected);
    }

    function appendLine(parent, cls, text) {
      var p = document.createElement('p');
      if (cls) p.className = cls;
      p.textContent = text;
      parent.appendChild(p);
    }

    function render() {
      var task = t();
      D.cases.forEach(function (c) {
        var card = $('case-' + c.id);
        var answer = task.answers[c.id];
        var confirmed = isConfirmed(c.id);
        var btn = card.querySelector('.assign');
        var label = answer ? action(answer).label : 'Przypisz działanie';
        btn.textContent = confirmed ? '✓ ' + label : label;
        btn.setAttribute('aria-label', (answer ? 'Przypisane działanie: ' + label : 'Przypisz działanie') + ' - ' + c.title);
        btn.disabled = confirmed;
        btn.classList.toggle('filled', !!answer);
        card.querySelector('.remove').hidden = confirmed || !answer;
        card.classList.toggle('is-correct', confirmed);
        card.classList.toggle('is-error', !confirmed && !!feedback[c.id] && feedback[c.id].kind === 'error');
        card.classList.toggle('is-guided', guided === c.id && !confirmed);
        markClue(c, confirmed || guided === c.id);
        var artHost = card.querySelector('.case-art-host');
        var artKey = confirmed ? 'solved' : 'start';
        if (artHost.dataset.state !== artKey) { artHost.innerHTML = cfg.imageFor(c, confirmed); artHost.dataset.state = artKey; }

        var fb = $('fb-' + c.id);
        fb.innerHTML = '';
        if (confirmed) {
          fb.hidden = false;
          fb.className = 'case-feedback good';
          appendLine(fb, 'feedback-state', '✓ Dobrze');
          appendLine(fb, null, c.explanation);
          appendLine(fb, 'feedback-result', c.result);
          if (c.link) {
            var a = document.createElement('a');
            if (c.link.source) {
              a.href = window.GOZ_SOURCES[c.link.source].url; a.target = '_blank'; a.rel = 'noopener';
              a.textContent = c.link.label + ' ↗';
            } else {
              a.href = c.link.href; a.textContent = c.link.label + ' ↑';
            }
            fb.appendChild(a);
          }
        } else if (feedback[c.id]) {
          fb.hidden = false;
          fb.className = 'case-feedback ' + (feedback[c.id].kind === 'missing' ? 'missing' : 'bad');
          appendLine(fb, 'feedback-state', feedback[c.id].kind === 'missing' ? 'Brakuje działania' : 'Jeszcze nie - przeczytaj wskazówkę');
          appendLine(fb, null, feedback[c.id].text);
        } else {
          fb.hidden = true;
        }
      });
      $('count').textContent = 'Rozwiązane: ' + task.confirmed.length + ' z ' + D.cases.length;
      $('undo').disabled = history.length === 0;
      var complete = P.isComplete(TASK);
      $('check').disabled = complete;
      $('guided').disabled = complete;
      $('locked').hidden = complete;
      $('complete').hidden = !complete;
      if (complete && !wasComplete) {
        // Akcent zdobytej karty (numer karty; litera ujawniana dopiero w finale).
        var letter = $('letter');
        if (letter && !reduced()) { letter.classList.remove('earned'); void letter.offsetWidth; letter.classList.add('earned'); }
        document.dispatchEvent(new CustomEvent('goz:task-complete', { detail: { task: TASK } }));
      }
      wasComplete = complete;
    }

    function select(id) { selected = id; renderSelection(); }

    function assign(caseId, actionId) {
      var c = caseById(caseId);
      if (isConfirmed(caseId)) { announce('„' + c.title + '” jest już rozwiązane. Wybierz kolejną kartę.'); return; }
      if (KEY.options.indexOf(actionId) === -1) {
        announce('Najpierw wybierz działanie z listy, potem wybierz miejsce na karcie „' + c.title + '”.');
        $('actions').querySelector('.action').focus();
        return;
      }
      history.push(JSON.stringify(t().answers));
      delete feedback[caseId];
      P.update(function (s) { s.tasks[TASK].answers[caseId] = actionId; s.lastAnchor = px + '-task'; }, { kind: px });
      render();
      announce('Przypisano „' + action(actionId).label + '” do karty „' + c.title + '”. Użyj „Sprawdź”, aby ocenić odpowiedzi.');
    }

    function removeAnswer(caseId) {
      if (isConfirmed(caseId)) return;
      history.push(JSON.stringify(t().answers));
      delete feedback[caseId];
      P.update(function (s) { s.tasks[TASK].answers[caseId] = null; }, { kind: px });
      render();
      announce('Usunięto przypisanie z karty „' + caseById(caseId).title + '”.');
    }

    function undo() {
      if (!history.length) return;
      var prev = JSON.parse(history.pop());
      P.update(function (s) {
        KEY.items.forEach(function (id) { if (s.tasks[TASK].confirmed.indexOf(id) === -1) s.tasks[TASK].answers[id] = prev[id]; });
      }, { kind: px });
      KEY.items.forEach(function (id) { if (!isConfirmed(id)) delete feedback[id]; });
      render();
      announce('Cofnięto ostatni ruch.');
    }

    function check() {
      var task = t();
      var missing = [], wrong = 0, newly = [];
      D.cases.forEach(function (c) {
        if (isConfirmed(c.id)) return;
        var answer = task.answers[c.id];
        if (answer === null) {
          missing.push(c.title);
          feedback[c.id] = { kind: 'missing', text: 'Jeszcze nie ma działania. Wybierz je z listy i przypisz do tej karty.' };
        } else if (answer === KEY.answers[c.id]) {
          newly.push(c.id);
          delete feedback[c.id];
        } else {
          wrong++;
          feedback[c.id] = { kind: 'error', text: c.errors[answer] };
        }
      });
      history = [];
      P.update(function (s) {
        newly.forEach(function (id) { if (s.tasks[TASK].confirmed.indexOf(id) === -1) s.tasks[TASK].confirmed.push(id); });
        s.lastAnchor = px + '-task';
      }, { immediate: true, kind: px });
      if (guided && isConfirmed(guided)) { guided = null; $('hint-text').hidden = true; }
      render();
      var box = $('feedback');
      box.textContent = '';
      if (P.isComplete(TASK)) {
        box.appendChild(document.createTextNode((cfg.completeText || 'Wszystkie karty rozwiązane.') + ' '));
        var link = document.createElement('a');
        link.href = '#' + px + '-result';
        link.textContent = 'Zobacz kartę i wniosek ↓';
        box.appendChild(link);
        return;
      }
      var parts = ['Dobrze rozwiązane: ' + t().confirmed.length + ' z ' + D.cases.length + '.'];
      if (missing.length) parts.push('Uzupełnij: ' + missing.join(', ') + '.');
      if (wrong) parts.push('Poprawne odpowiedzi zostają. Przy pozostałych przeczytaj wskazówki na kartach i spróbuj ponownie.');
      box.textContent = parts.join(' ');
    }

    function hint() { var box = $('hint-text'); box.hidden = false; box.textContent = D.help; }

    function guide() {
      var next = KEY.items.filter(function (id) { return !isConfirmed(id); })[0];
      if (!next) return;
      guided = next;
      var c = caseById(next);
      P.update(function (s) { s.tasks[TASK].assisted = true; }, { kind: px });
      render();
      var box = $('hint-text');
      box.hidden = false;
      box.textContent = (cfg.guidePrefix ? cfg.guidePrefix(c, caseIndex(next)) : 'Karta ' + (caseIndex(next) + 1)) + ' - „' + c.title + '”: ' + c.guidedQuestion + ' Zaznaczyliśmy ważny fragment opisu. Wybierz działanie i przypisz je do tej karty, a potem „Sprawdź”.';
      $('case-' + next).scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' });
      if (cfg.onGuide) cfg.onGuide(c);
    }

    // Przeciąganie wskaźnikiem (mysz, pióro, dotyk); równoważnie działa wybór → miejsce.
    var drag = null, ghost = null, hover = null, suppressClick = false;
    function cleanDrag() { if (ghost) ghost.remove(); ghost = null; if (hover) hover.classList.remove('drop-hover'); hover = null; drag = null; }
    function cardAt(x, y) {
      var el = document.elementFromPoint(x, y);
      var card = el && el.closest ? el.closest('.case') : null;
      return card && $('cases').contains(card) ? card : null;
    }
    function bindDrag(button) {
      button.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        drag = { id: button.dataset.action, x: e.clientX, y: e.clientY, pointer: e.pointerId, moved: false };
      });
      button.addEventListener('pointermove', function (e) {
        if (!drag || drag.pointer !== e.pointerId) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 9) return;
        if (!drag.moved) {
          drag.moved = true;
          try { button.setPointerCapture(e.pointerId); } catch (err) { /* bez przechwycenia */ }
          select(drag.id);
          ghost = document.createElement('div');
          ghost.className = 'drag-ghost';
          ghost.setAttribute('aria-hidden', 'true');
          ghost.textContent = action(drag.id).label;
          document.body.appendChild(ghost);
        }
        ghost.style.left = e.clientX + 'px';
        ghost.style.top = e.clientY + 'px';
        var card = cardAt(e.clientX, e.clientY);
        if (hover && hover !== card) hover.classList.remove('drop-hover');
        hover = card;
        if (hover && !isConfirmed(hover.dataset.case)) hover.classList.add('drop-hover');
      });
      button.addEventListener('pointerup', function (e) {
        if (!drag) return;
        var d = drag;
        if (d.moved) {
          var card = cardAt(e.clientX, e.clientY);
          if (card) assign(card.dataset.case, d.id);
          else announce('Upuść działanie na kartę albo przypisz je przyciskiem na karcie.');
          suppressClick = true;
          setTimeout(function () { suppressClick = false; }, 0);
        }
        cleanDrag();
      });
      button.addEventListener('pointercancel', cleanDrag);
      button.addEventListener('lostpointercapture', function () { if (drag && drag.moved) cleanDrag(); });
    }

    return {
      init: function (options) {
        reduced = options.reducedMotion;
        buildActions();
        buildCases();
        Array.prototype.forEach.call($('actions').querySelectorAll('.action'), function (b) {
          // Ponowne kliknięcie zostawia wybór — działanie można przypisać do kolejnych kart.
          b.addEventListener('click', function () { if (!suppressClick) select(b.dataset.action); });
          bindDrag(b);
        });
        $('cases').addEventListener('click', function (e) {
          var assignBtn = e.target.closest('[data-target]');
          if (assignBtn) { assign(assignBtn.dataset.target, selected); return; }
          var removeBtn = e.target.closest('[data-remove]');
          if (removeBtn) removeAnswer(removeBtn.dataset.remove);
        });
        $('cancel').addEventListener('click', function () { select(null); $('actions').querySelector('.action').focus(); });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && selected && !document.querySelector('dialog[open]')) { select(null); announce('Anulowano wybór działania.'); }
        });
        $('check').addEventListener('click', check);
        $('undo').addEventListener('click', undo);
        $('hint').addEventListener('click', hint);
        $('guided').addEventListener('click', guide);
        wasComplete = P.isComplete(TASK);
        if (t().assisted && !wasComplete) hint();
        renderSelection();
        render();
      },
      reset: function () {
        selected = null; history = []; feedback = {}; guided = null; wasComplete = false;
        $('hint-text').hidden = true;
        renderSelection(); render();
        announce(cfg.startMessage);
      },
      render: function () { render(); }
    };
  }

  window.GOZMatchTask = { create: create };
})();
