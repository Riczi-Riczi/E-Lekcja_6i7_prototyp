// Ilustracje oceanu, rewizja ocean-grafiki-87-review1. Ścieżki tylko w rejestrze danych.
(function () {
  'use strict';
  var R = window.GOZ_OCEAN_ASSETS;
  var SIZES = {
    compare: '(max-width: 800px) calc(100vw - 108px), (max-width: 900px) calc(100vw - 128px), (max-width: 1100px) calc(50vw - 120px), min(calc(50vw - 168px), 552px)',
    amphipod: '(max-width: 428px) calc(100vw - 108px), 320px'
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function asset(key) { return R && R.assets && R.assets[key]; }
  function markup(key) {
    var a = asset(key);
    if (!a) return '<span class="ocean-renderer-missing" role="status">Ilustracja jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
    return '<img class="ocean-picture" src="' + esc(a.variants[1].file) + '" srcset="' + a.variants.map(function (v) { return esc(v.file) + ' ' + v.width + 'w'; }).join(', ') + '" sizes="' + esc(SIZES[key === 'amphipod' ? 'amphipod' : 'compare']) + '" width="' + a.width + '" height="' + a.height + '" loading="eager" decoding="async" alt="' + esc(a.alt) + '" draggable="false" data-ocean-key="' + key + '">';
  }
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.dataset.oceanKey || img.dataset.oceanError) return;
    var host = img.closest('#ocean .compare') || img.closest('#ocean .amphipod');
    if (!host) return;
    var a = asset(img.dataset.oceanKey);
    img.dataset.oceanError = '1'; img.alt = ''; img.setAttribute('aria-hidden', 'true'); img.style.visibility = 'hidden';
    var note = document.createElement('p'); note.className = 'ocean-image-note'; note.setAttribute('role', 'status');
    note.dataset.oceanMissing = img.dataset.oceanKey;
    note.textContent = 'Ilustracja jest niedostępna. Opis: ' + (a ? a.alt : 'Skorzystaj z opisu w lekcji.');
    var controls = host.querySelector('.compare-controls');
    if (controls) host.insertBefore(note, controls); else host.appendChild(note);
  }, true);
  window.GOZOceanAssets = { markup: markup, revision: function () { return R && R.revision; } };
})();
