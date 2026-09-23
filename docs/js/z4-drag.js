// Z4: adapter przeciągania kart do pól „BIO” / „Poza BIO” i z powrotem do puli (integracja 52, polecenie 55 §8).
// Zachowanie z prototypu, ale ruch zatwierdza ta sama funkcja place() zadania co kliknięcie (wąskie API z task-sort).
// Bez własnego stanu odpowiedzi, klucza, oceniania i resetu. Nasłuch na planszy; operacje globalne tylko w trakcie gestu.
(function () {
  'use strict';
  var PROG = 7;
  var KRAWEDZ = 64, PREDKOSC = 480;
  var aktywny = null; // kontroler z trwającym gestem

  function create(api) {
    var host = api.host;
    var g = null; // { pointerId, id, source, kartaEl, startX, startY, x, y, active, capture, ghost, over, raf, t }

    function strefa(x, y) {
      var z = api.zoneAt(x, y);
      if (!z) return null;
      return { el: z, zone: z.dataset && z.dataset.zone ? z.dataset.zone : null };
    }
    function maluj() {
      if (!g || !g.active) return;
      var cel = strefa(g.x, g.y);
      var el = cel ? cel.el : null;
      if (g.over && g.over !== el) g.over.classList.remove('z4-drag-over');
      g.over = el;
      if (el) el.classList.add('z4-drag-over');
      var w = g.ghost.offsetWidth, h = g.ghost.offsetHeight;
      g.ghost.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, g.x + 14)) + 'px';
      g.ghost.style.top = Math.max(6, Math.min(window.innerHeight - h - 6, g.y + 14)) + 'px';
    }
    // Przewijanie przy krawędzi okna wyłącznie w trakcie aktywnego gestu.
    function klatka(t) {
      if (!g || !g.active) return;
      var dt = Math.min(32, t - (g.t || t)); g.t = t;
      var v = 0;
      if (g.x >= 0 && g.x <= window.innerWidth && g.y >= 0 && g.y <= window.innerHeight) {
        if (g.y < KRAWEDZ) v = -PREDKOSC * (1 - g.y / KRAWEDZ);
        else if (g.y > window.innerHeight - KRAWEDZ) v = PREDKOSC * (1 - (window.innerHeight - g.y) / KRAWEDZ);
      }
      if (v) window.scrollBy(0, v * dt / 1000);
      maluj();
      g.raf = requestAnimationFrame(klatka);
    }
    // Duch: kopia wyglądu karty bez identyfikatorów i kontrolek, poza drzewem dostępności.
    function duch(li) {
      var d = document.createElement('div');
      d.className = 'z4-drag-ghost';
      d.setAttribute('aria-hidden', 'true');
      d.inert = true;
      var img = li.querySelector('.item-art img');
      if (img) { var c = document.createElement('img'); c.src = img.getAttribute('src'); c.alt = ''; c.className = 'z4-drag-ghost-img'; d.appendChild(c); }
      var s = document.createElement('span');
      s.textContent = (li.querySelector('.item-label') || li).textContent.replace(/^✓\s*/, '');
      d.appendChild(s);
      return d;
    }
    function zacznij() {
      g.active = true;
      aktywny = ctl;
      try { g.captureEl.setPointerCapture(g.pointerId); g.capture = g.captureEl.hasPointerCapture(g.pointerId); } catch (e) { g.capture = false; }
      g.ghost = duch(g.kartaEl);
      document.body.appendChild(g.ghost);
      g.kartaEl.classList.add('z4-drag-source');
      document.documentElement.classList.add('z4-drag-active');
      maluj();
      g.raf = requestAnimationFrame(klatka);
    }
    // Zakończenie: jedyne miejsce zmiany stanu to place() przy poprawnym upuszczeniu w dozwolonym celu.
    function zakoncz(cel) {
      var s = g; if (!s) return;
      g = null;
      if (aktywny === ctl) aktywny = null;
      odepnij();
      if (s.raf) cancelAnimationFrame(s.raf);
      if (s.capture) { try { if (s.captureEl.hasPointerCapture(s.pointerId)) s.captureEl.releasePointerCapture(s.pointerId); } catch (e) { /* element mógł zniknąć */ } }
      if (!s.active) return;
      if (s.ghost) s.ghost.remove();
      if (s.over) s.over.classList.remove('z4-drag-over');
      s.kartaEl.classList.remove('z4-drag-source');
      document.documentElement.classList.remove('z4-drag-active');
      api.suppressNextClick();
      if (!cel || api.confirmed(s.id)) return;
      if (cel.zone) api.place(s.id, cel.zone);
      else if (s.kartaEl.closest('.zone')) api.place(s.id, null); // pula: wycofanie niezatwierdzonej karty z pola
    }
    function anuluj() { if (g) zakoncz(null); }

    function ruch(e) {
      if (!g || e.pointerId !== g.pointerId) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) { anuluj(); return; }
      g.x = e.clientX; g.y = e.clientY;
      if (!g.active && Math.hypot(g.x - g.startX, g.y - g.startY) < PROG) return;
      if (!g.active) zacznij();
      if (g && g.active) { if (e.cancelable) e.preventDefault(); maluj(); }
    }
    function puszczenie(e) {
      if (!g || e.pointerId !== g.pointerId) return;
      var cel = g.active ? strefa(e.clientX, e.clientY) : null;
      zakoncz(cel);
    }
    function przerwanie(e) { if (g && e.pointerId === g.pointerId) anuluj(); }
    // Utrata przechwycenia anuluje tylko po wcześniejszym skutecznym przechwyceniu i tylko u jego właściciela.
    function utrata(e) { if (g && g.capture && e.pointerId === g.pointerId && e.target === g.captureEl) anuluj(); }
    function drugi(e) { if (g && e.pointerId !== g.pointerId) anuluj(); }
    function klawisz(e) { if (g && g.active && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); } if (g && e.key === 'Escape') anuluj(); }
    function widocznosc() { if (document.hidden) anuluj(); }
    function przewiniecie() { maluj(); }
    function przypnij() {
      document.addEventListener('pointermove', ruch, { passive: false });
      document.addEventListener('pointerup', puszczenie);
      document.addEventListener('pointercancel', przerwanie);
      document.addEventListener('lostpointercapture', utrata, true);
      document.addEventListener('pointerdown', drugi, true);
      document.addEventListener('keydown', klawisz, true);
      document.addEventListener('visibilitychange', widocznosc);
      window.addEventListener('blur', anuluj);
      window.addEventListener('pagehide', anuluj);
      window.addEventListener('scroll', przewiniecie, { passive: true });
    }
    function odepnij() {
      document.removeEventListener('pointermove', ruch, { passive: false });
      document.removeEventListener('pointerup', puszczenie);
      document.removeEventListener('pointercancel', przerwanie);
      document.removeEventListener('lostpointercapture', utrata, true);
      document.removeEventListener('pointerdown', drugi, true);
      document.removeEventListener('keydown', klawisz, true);
      document.removeEventListener('visibilitychange', widocznosc);
      window.removeEventListener('blur', anuluj);
      window.removeEventListener('pagehide', anuluj);
      window.removeEventListener('scroll', przewiniecie, { passive: true });
    }

    host.addEventListener('pointerdown', function (e) {
      if (g) { anuluj(); return; }
      if (!e.isPrimary || e.button !== 0) return;
      var li = e.target.closest('.sort-item');
      if (!li || !host.contains(li) || !li.dataset.item) return;
      var id = li.dataset.item;
      if (api.confirmed(id)) return;
      // Przyciski operacji (rozdzielenie, powrót, informacja zwrotna) nie rozpoczynają przeciągania.
      if (e.target.closest('[data-split], [data-back], .item-fb')) return;
      var pick = e.target.closest('.item-pick'), uchwyt = e.target.closest('.z4-drag-handle');
      if (pick && pick.disabled) return;
      // Dotyk i pióro: od przycisku karty (natywne przewijanie może anulować gest) albo od uchwytu. Mysz: cała karta.
      if (e.pointerType !== 'mouse' && !pick && !uchwyt) return;
      g = { pointerId: e.pointerId, id: id, kartaEl: li, captureEl: uchwyt || pick || li, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, active: false, capture: false };
      przypnij();
    });
    host.addEventListener('dragstart', function (e) { if (e.target.closest && e.target.closest('.sort-item')) e.preventDefault(); });

    var ctl = {
      // Uchwyt tylko dla wskaźnika: bez fokusu i poza drzewem dostępności; alternatywą jest wybór karty i pola.
      decorate: function (id, li) {
        if (api.confirmed(id)) return;
        var h = document.createElement('span');
        h.className = 'z4-drag-handle';
        h.setAttribute('aria-hidden', 'true');
        h.innerHTML = '<span class="z4-drag-grip">⠿</span><span class="z4-drag-text">Przeciągnij</span>';
        li.appendChild(h);
      },
      // Wywoływane z afterRender: każdy render (także reset i rozdzielenie) anuluje gest i usuwa ducha.
      refresh: function () { anuluj(); },
      cancel: anuluj,
      active: function () { return !!(g && g.active); }
    };
    return ctl;
  }

  window.GOZZ4Drag = { create: create, cancelActive: function () { if (aktywny) aktywny.cancel(); } };
})();
