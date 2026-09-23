// Z3: prezentacja mapy czasu i alternatyw w istniejącej planszy #z3-board (integracja 52, polecenie 55 §7).
// Wspólna przeszłość pokazana raz, punkt „Dzisiaj” i dwie odnogi z jawnym „LUB”. Zmienia wyłącznie opakowanie
// i dekorację: te same trzy strefy (.zone), karty, przyciski i stany zadania. Wywoływane z afterRender — idempotentnie:
// strefy przenoszone są tylko raz, więc kolejne rendery nie odłączają przycisków ani nie gubią fokusu.
(function () {
  'use strict';
  function el(tag, cls, text) { var n = document.createElement(tag); n.className = cls; if (text) n.textContent = text; return n; }

  function apply(host) {
    if (!host) return;
    host.classList.add('z3-map');
    var zones = host.querySelector('.sort-zones');
    if (!zones || zones.querySelector('.z3-map-branches')) return;
    var past = zones.querySelector('.zone-past'), repair = zones.querySelector('.zone-repair'), nowa = zones.querySelector('.zone-new');
    if (!past || !repair || !nowa) return;
    var focused = document.activeElement && zones.contains(document.activeElement) ? document.activeElement : null;
    zones.classList.add('z3-map-zones');
    // Dekoracje bez klasy .zone, bez podpisów stref; niewidoczne dla wskaźnika.
    var dzis = el('div', 'z3-map-today');
    dzis.appendChild(el('span', 'z3-map-today-label', 'Dzisiaj'));
    dzis.appendChild(el('span', 'z3-map-today-note', 'Stąd porównujemy dwie alternatywy.'));
    var branches = el('div', 'z3-map-branches');
    var a = el('div', 'z3-map-branch z3-map-branch-repair');
    a.appendChild(el('span', 'z3-map-link'));
    a.appendChild(el('span', 'z3-map-tag', 'Droga A'));
    var lub = el('div', 'z3-map-or', 'LUB');
    var b = el('div', 'z3-map-branch z3-map-branch-new');
    b.appendChild(el('span', 'z3-map-link'));
    b.appendChild(el('span', 'z3-map-tag', 'Droga B'));
    branches.appendChild(a); branches.appendChild(lub); branches.appendChild(b);
    zones.insertBefore(dzis, repair);
    zones.insertBefore(branches, repair);
    a.appendChild(repair);
    b.appendChild(nowa);
    if (focused && document.activeElement !== focused) focused.focus({ preventScroll: true });
  }

  window.GOZZ3Layout = { apply: apply };
})();
