// Wspólna obsługa ilustracji otwarcia, Z5, Z6 i memory (integracja 92).
(function () {
  'use strict';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function registry() { return window.GOZ_REMAINING_ASSETS; }
  function asset(key) { var r = registry(); return r && r.assets && r.assets[key]; }
  function missing() { return '<span class="remaining-missing" role="status">Ilustracja jest niedostępna. Skorzystaj z opisu w lekcji.</span>'; }
  function markup(key, options) {
    var a = asset(key), o = options || {};
    if (!a) return missing();
    var v = a.variants, preferred = v[Math.min(1, v.length - 1)];
    return '<img class="remaining-picture' + (o.overlay ? ' remaining-overlay' : '') + '" data-remaining-key="' + esc(key) + '" src="' + esc(preferred.file) + '" srcset="' + v.map(function (x) { return esc(x.file) + ' ' + x.width + 'w'; }).join(', ') + '" sizes="' + esc(o.sizes || '(max-width: 900px) 90vw, 600px') + '" width="' + a.width + '" height="' + a.height + '" alt="' + esc(o.decorative ? '' : a.alt) + '"' + (o.decorative ? ' aria-hidden="true"' : '') + ' loading="' + (key.indexOf('e00-') === 0 ? 'eager' : 'lazy') + '" decoding="async" draggable="false">';
  }
  function compost() {
    var r = registry();
    if (!r || !r.regions || !asset('z5-02')) return missing();
    var outlines = r.regions.regions.map(function (g) {
      return '<g data-region="' + esc(g.id) + '">' + g.paths.map(function (p) {
        return '<path class="remaining-region-edge" d="' + esc(p) + '"/><path class="remaining-region-line" d="' + esc(p) + '"/>';
      }).join('') + '</g>';
    }).join('');
    return '<span class="remaining-scene compost-picture">' + markup('z5-02') + '<svg class="remaining-regions" viewBox="' + r.regions.viewBox.join(' ') + '" aria-hidden="true" focusable="false">' + outlines + '</svg></span>';
  }
  function worms(active) {
    return '<span class="remaining-scene worm-picture">' + markup('z5-dzdzownice-1') + (active ? markup('z5-dzdzownice-2', { overlay: true, decorative: true }) : '') + '</span>';
  }
  document.addEventListener('error', function (event) {
    var img = event.target;
    if (!img || img.tagName !== 'IMG' || !img.dataset.remainingKey || img.dataset.remainingError) return;
    img.dataset.remainingError = '1';
    var a = asset(img.dataset.remainingKey), scene = img.closest('.remaining-scene');
    img.hidden = true;
    if (scene && !img.classList.contains('remaining-overlay')) {
      scene.classList.add('remaining-base-missing');
      var overlays = scene.querySelectorAll('.remaining-overlay, .remaining-regions');
      Array.prototype.forEach.call(overlays, function (node) { node.style.display = 'none'; });
    }
    var note = document.createElement('span'); note.className = 'remaining-missing';
    note.setAttribute('role', 'status'); note.dataset.remainingMissing = img.dataset.remainingKey;
    note.textContent = 'Ilustracja jest niedostępna. Opis: ' + (a ? a.alt : 'Skorzystaj z opisu w lekcji.');
    if (scene) scene.appendChild(note); else img.parentNode.insertBefore(note, img.nextSibling);
  }, true);
  window.GOZRemainingAssets = { markup: markup, compost: compost, worms: worms };
})();
