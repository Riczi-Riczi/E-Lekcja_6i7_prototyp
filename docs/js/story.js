// Z1 — droga produktu w pięciu stacjach.
// Specyfikacja: 01_EKRANY_STYL_I_RUCH.md §4 i 07_MECHANIKA_PRZEWIJANIA.md §1–2.
// Duży ekran: zwykłe pionowe przewijanie wyznacza stację, plansze przechodzą poziomo w przyklejonym polu.
// Mały ekran, niskie okno, niemieszcząca się treść lub ograniczony ruch: pięć zwykłych bloków pionowych.
// Nie przechwytujemy kółka ani gestu dotykowego i nie przenosimy fokusu podczas przewijania.
(function () {
  'use strict';
  var data = window.GOZ_Z1;
  var story, track, links, prev, next, countLabel, stations;
  var mode = 'vertical';
  var active = 0;
  var frame = 0;
  var reducedMotion = function () { return false; };
  var TRANSITION = 0.15; // przejście trwa ostatnie 15% odcinka
  var N = 5;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

  function build() {
    story = document.getElementById('z1-story');
    track = document.getElementById('story-track');
    links = document.getElementById('story-links');
    prev = document.getElementById('story-prev');
    next = document.getElementById('story-next');
    countLabel = document.getElementById('story-count');

    data.stations.forEach(function (st, i) {
      var li = el('li');
      var a = el('a', 'story-link');
      a.href = '#' + st.id;
      a.dataset.stage = String(i);
      a.innerHTML = '<span>0' + (i + 1) + '</span> ';
      a.appendChild(document.createTextNode(st.short));
      li.appendChild(a);
      links.appendChild(li);

      var art = el('article', 'station');
      art.id = st.id;
      art.dataset.stage = String(i);
      art.setAttribute('aria-labelledby', st.id + '-title');
      // Wszystkie pięć stacji buduje jedna ścieżka renderowania z modułu mapowania
      // (js/art.js → js/z1-assets.js). Stacje 1-4 to pełne kadry ilustracji autora,
      // stacja 5 ma własną kompozycję z §8 i nie dziedziczy sztywnego pola.
      var visual = el('div', 'station-visual');
      visual.setAttribute('data-art', st.art);
      if (st.art === 'paths') visual.classList.add('station-composition');
      var copy = el('div', 'station-copy');
      copy.appendChild(el('p', 'eyebrow', st.eyebrow));
      var h = el('h3', 'station-title', st.title);
      h.id = st.id + '-title';
      h.tabIndex = -1;
      copy.appendChild(h);
      st.body.forEach(function (p) { copy.appendChild(el('p', null, p)); });
      if (st.note) copy.appendChild(el('p', 'small-note', st.note));
      if (st.art === 'paths') {
        var branches = el('div', 'branches');
        var group = el('div', 'branch-buttons');
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', 'Trzy dalsze drogi');
        var detail = el('div', 'branch-detail');
        detail.setAttribute('role', 'status');
        data.branches.forEach(function (b, bi) {
          var btn = el('button', 'branch-button');
          btn.type = 'button';
          btn.setAttribute('aria-pressed', bi === 0 ? 'true' : 'false');
          // Kompozycja obok pokazuje już te obrazy — przycisk zostaje tekstowy,
          // bez duplikowanej miniatury (polecenie 39 §8).
          btn.appendChild(el('span', 'branch-name', b.title));
          btn.addEventListener('click', function () {
            Array.prototype.forEach.call(group.children, function (x) { x.setAttribute('aria-pressed', String(x === btn)); });
            detail.textContent = b.title + ': ' + b.text;
          });
          group.appendChild(btn);
        });
        detail.textContent = data.branches[0].title + ': ' + data.branches[0].text;
        branches.appendChild(group);
        branches.appendChild(detail);
        branches.appendChild(el('p', 'small-note', data.branchesCaption));
        copy.appendChild(branches);
      }
      art.appendChild(visual);
      art.appendChild(copy);
      track.appendChild(art);
    });
    stations = Array.prototype.slice.call(track.children);
    window.GOZArt.mountAll(track);
  }

  // --- Pomiar i wybór wariantu ------------------------------------------------

  function headerHeight() {
    var bar = document.getElementById('topbar');
    return bar ? bar.getBoundingClientRect().height : 0;
  }
  function available() { return window.innerHeight - headerHeight(); }

  // Treść każdej stacji musi zmieścić się w przyklejonym polu pod nazwami etapów.
  // Od zakresu B mierzymy nie tylko kolumnę tekstu, ale też pole wizualizacji oraz
  // etykiety kompozycji stacji 5 — sama .station-copy była niewystarczająca.
  function stationRoom() {
    var head = story.querySelector('.story-head').getBoundingClientRect().height;
    return available() - head - 24;
  }

  // Budżet pola wizualizacji to całe przyklejone pole pod nazwami etapów; kolumna
  // tekstu ma własny, mniejszy budżet (room) uwzględniający odstęp wewnętrzny.
  function viewportRoom() {
    var vp = story.querySelector('.story-viewport');
    return vp ? vp.clientHeight : stationRoom();
  }

  function stationOverflow(s, room) {
    var copy = s.querySelector('.station-copy');
    if (copy && copy.scrollHeight > room) return 'copy';
    var pole = viewportRoom();
    var visual = s.querySelector('.station-visual');
    if (visual && pole && visual.scrollHeight > pole + 2) return 'visual';
    var paths = s.querySelector('.z1-paths');
    if (paths) {
      if (paths.scrollHeight > paths.clientHeight + 1) return 'composition-height';
      if (paths.scrollWidth > paths.clientWidth + 1) return 'composition-width';
      var zaWaskie = Array.prototype.some.call(paths.querySelectorAll('.z1-path-label'), function (lbl) {
        return lbl.scrollWidth > lbl.clientWidth + 1;
      });
      if (zaWaskie) return 'composition-label';
    }
    return '';
  }

  function contentFits() {
    var room = stationRoom();
    return stations.every(function (s) { return !stationOverflow(s, room); });
  }

  function wantHorizontal() {
    if (reducedMotion()) return false;
    if (window.innerWidth <= 1100) return false;
    if (available() < 700 - headerHeight() || window.innerHeight < 700) return false;
    return true;
  }

  function applyMode(nextMode) {
    story.dataset.mode = nextMode;
    mode = nextMode;
    if (nextMode === 'horizontal') {
      var seg = available();
      story.style.setProperty('--story-seg', seg + 'px');
      story.style.setProperty('--story-top', headerHeight() + 'px');
      // Pięć odcinków po jednej wysokości widoku + wysokość samego przyklejonego pola.
      story.style.height = (seg * (N + 1)) + 'px';
    } else {
      story.style.removeProperty('height');
      track.style.removeProperty('transform');
      stations.forEach(function (s) { s.inert = false; s.removeAttribute('aria-hidden'); });
    }
  }

  function chooseMode(keepStage, opcje) {
    var keep = typeof keepStage === 'number' ? keepStage : active;
    var inView = storyInView();
    var target = 'vertical';
    if (wantHorizontal()) {
      applyMode('horizontal');
      target = contentFits() ? 'horizontal' : 'vertical';
    }
    applyMode(target);
    update(true);
    // Przełączenie wariantu w środku rozdziału nie gubi bieżącej stacji.
    // Ponowny pomiar po doładowaniu obrazów nie przewija i nie przejmuje fokusu.
    if (inView && !(opcje && opcje.bezPrzewijania)) scrollToStage(keep, 'instant');
  }

  // --- Ponowny pomiar po doładowaniu obrazów lazy ---------------------------
  // Proporcje pól są zarezerwowane w CSS, więc pomiar nie skacze; to tylko
  // domknięcie na wypadek zmiany wysokości tekstu przy fontach i obrazach.
  // Twardy limit przebiegów chroni przed pętlą odświeżeń, gdy obraz się nie dekoduje.
  var LIMIT_ODSWIEZEN = 12;
  var odswiezen = 0;
  var odswiezTimer = null;
  function odswiezPoObrazie() {
    if (odswiezen >= LIMIT_ODSWIEZEN) return;
    odswiezen++;
    if (odswiezTimer) clearTimeout(odswiezTimer);
    odswiezTimer = setTimeout(function () {
      odswiezTimer = null;
      chooseMode(active, { bezPrzewijania: true });
    }, 80);
  }

  function obserwujObrazy() {
    Array.prototype.forEach.call(track.querySelectorAll('img'), function (img) {
      if (img.dataset.storyWatched) return;
      img.dataset.storyWatched = '1';
      if (img.complete) return;
      img.addEventListener('load', odswiezPoObrazie, { once: true });
      img.addEventListener('error', odswiezPoObrazie, { once: true });
    });
  }

  function storyInView() {
    var r = story.getBoundingClientRect();
    return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
  }

  // --- Postęp sceny ---------------------------------------------------------

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function horizontalOffset() {
    var seg = available();
    var pos = headerHeight() - story.getBoundingClientRect().top;
    pos = Math.max(0, Math.min(pos, seg * N - 1));
    var index = Math.min(N - 1, Math.floor(pos / seg));
    var t = (pos - index * seg) / seg;
    var offset = index;
    if (index < N - 1 && t > 1 - TRANSITION) offset = index + ease((t - (1 - TRANSITION)) / TRANSITION);
    return offset;
  }

  function verticalActive() {
    // Linia odniesienia jest ta sama, w którą prowadzi stageScrollY: tuż pod paskiem.
    // Stacja, która ją zawiera, jest bieżąca. Po integracji grafik stacje bywają niższe
    // niż dawne pole 10:7 i sama odległość od środka ekranu wskazywała już sąsiednią,
    // przez co zmiana szerokości gubiła etap. Gdy żadna stacja nie obejmuje linii
    // (przewijanie między stacjami), zostaje dotychczasowa reguła najbliższego środka.
    var linia = headerHeight() + 24;
    for (var i = 0; i < stations.length; i++) {
      var r = stations[i].getBoundingClientRect();
      if (r.top <= linia && r.bottom > linia) return i;
    }
    var center = window.innerHeight * 0.45;
    var best = 0, dist = Infinity;
    stations.forEach(function (s, j) {
      var rr = s.getBoundingClientRect();
      var d = Math.abs(rr.top + Math.min(rr.height / 2, 200) - center);
      if (d < dist) { dist = d; best = j; }
    });
    return best;
  }

  function setActive(i) {
    active = i;
    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
      if (+a.dataset.stage === i) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    countLabel.textContent = 'etap ' + (i + 1) + ' z ' + N;
    prev.href = '#' + data.stations[Math.max(0, i - 1)].id;
    next.href = '#' + data.stations[Math.min(N - 1, i + 1)].id;
    prev.setAttribute('aria-disabled', String(i === 0));
    next.setAttribute('aria-disabled', String(i === N - 1));
    if (mode === 'horizontal') {
      // Ukryte plansze nie przyjmują fokusu.
      stations.forEach(function (s, si) { s.inert = si !== i; if (si !== i) s.setAttribute('aria-hidden', 'true'); else s.removeAttribute('aria-hidden'); });
    }
  }

  function update(force) {
    frame = 0;
    if (mode === 'horizontal') {
      var offset = horizontalOffset();
      track.style.transform = 'translate3d(' + (-offset * 100 / N) + '%,0,0)';
      var i = Math.round(offset);
      if (force || i !== active) setActive(i);
    } else {
      var v = verticalActive();
      if (force || v !== active) setActive(v);
    }
  }

  function onScroll() { if (!frame) frame = requestAnimationFrame(function () { update(false); }); }

  // --- Nawigacja do stacji -------------------------------------------------

  function stageScrollY(i) {
    if (mode === 'horizontal') {
      var top = story.getBoundingClientRect().top + window.scrollY;
      // Stabilny moment stacji: tuż po początku jej odcinka.
      return top - headerHeight() + i * available() + 2;
    }
    return stations[i].getBoundingClientRect().top + window.scrollY - headerHeight() - 12;
  }

  function scrollToStage(i, behavior) {
    window.scrollTo({ top: stageScrollY(i), behavior: behavior || (reducedMotion() ? 'instant' : 'smooth') });
  }

  function goToStage(i, focusHeading) {
    scrollToStage(i);
    if (history.replaceState) history.replaceState(null, '', '#' + data.stations[i].id);
    if (focusHeading) {
      var h = stations[i].querySelector('.station-title');
      var done = false;
      var focus = function () { if (done) return; done = true; update(true); h.focus({ preventScroll: true }); };
      if ('onscrollend' in window) window.addEventListener('scrollend', focus, { once: true });
      setTimeout(focus, reducedMotion() ? 0 : 900);
    }
  }

  function stageFromHash(hash) {
    for (var i = 0; i < N; i++) if ('#' + data.stations[i].id === hash) return i;
    return -1;
  }

  function onLinkClick(e) {
    var a = e.target.closest('a');
    if (!a || !story.contains(a)) return;
    var i = stageFromHash(a.getAttribute('href'));
    if (i === -1) return;
    e.preventDefault();
    if (a.getAttribute('aria-disabled') === 'true') return;
    goToStage(i, true);
  }

  function onHash() {
    var i = stageFromHash(location.hash);
    if (i !== -1) { scrollToStage(i, 'instant'); update(true); }
  }

  var resizeTimer = null;
  var stacjaPrzedZmiana = null;
  function onResize() {
    // Stację zapamiętujemy w chwili rozpoczęcia zmiany rozmiaru. Po przebudowie
    // układu wysokości stacji są inne i zdarzenia scroll zdążyłyby wskazać sąsiednią.
    if (stacjaPrzedZmiana === null) stacjaPrzedZmiana = active;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var keep = stacjaPrzedZmiana;
      stacjaPrzedZmiana = null;
      resizeTimer = null;
      chooseMode(keep);
    }, 150);
  }

  window.GOZStory = {
    init: function (options) {
      reducedMotion = options.reducedMotion;
      build();
      obserwujObrazy();
      chooseMode(0);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      window.addEventListener('hashchange', onHash);
      story.addEventListener('click', onLinkClick);
      // Obrazy i fonty mogą zmienić wysokość treści — mierzymy ponownie.
      // Obrazy lazy potrafią doładować się po window.load, więc obserwujemy je nadal.
      window.addEventListener('load', function () { obserwujObrazy(); chooseMode(active); onHash(); });
      onHash();
    },
    refreshMode: function () { chooseMode(active); },
    state: function () { return { mode: mode, active: active }; },
    // Diagnostyka dla testów: wysokości treści stacji w wariancie poziomym oraz
    // faktyczny wymiar i przepełnienie wizualizacji i etykiet kompozycji stacji 5.
    measure: function () {
      var prevMode = mode;
      applyMode('horizontal');
      var head = story.querySelector('.story-head').getBoundingClientRect().height;
      var room = stationRoom();
      var out = {
        available: available(), head: head, room: room,
        copies: stations.map(function (s) { return s.querySelector('.station-copy').scrollHeight; }),
        viewportRoom: viewportRoom(),
        visuals: stations.map(function (s) {
          var v = s.querySelector('.station-visual');
          return v ? { height: v.scrollHeight, width: v.scrollWidth, clientWidth: v.clientWidth } : null;
        }),
        overflow: stations.map(function (s) { return stationOverflow(s, room); }),
        images: stations.map(function (s) {
          return Array.prototype.map.call(s.querySelectorAll('img'), function (img) {
            return { key: img.dataset.z1Key || null, currentSrc: img.currentSrc || img.src, error: img.dataset.z1Error === '1' };
          });
        }),
        refreshes: odswiezen
      };
      applyMode(prevMode);
      update(true);
      return out;
    },
    stageScrollY: stageScrollY
  };
})();
