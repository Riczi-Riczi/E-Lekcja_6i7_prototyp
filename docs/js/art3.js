// Robocze schematy SVG etapu 3: słownik Z6, karty sytuacji memory, wejście rozdziału 6 i ozdoby edytora buta.
// Schematy objaśniają treść; finalne ilustracje mogą je zastąpić w tych samych miejscach.
(function () {
  'use strict';
  var INK = '#123E34', LIME = '#D9F294', SAGE = '#9FB594', BROWN = '#6B4A2F', RUST = '#B4603A', SKY = '#5B8FB0';

  function deco(viewBox, body, cls) {
    return '<svg class="art-svg ' + (cls || '') + '" viewBox="' + viewBox + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  // Ikony słownika: jednakowy kadr 120 × 90.
  var dictionary = {
    repair: '<rect x="16" y="30" width="60" height="40" rx="8" fill="#E7EEF5" stroke="#8A9BAA" stroke-width="3"/><path d="M62 18l28 28-10 10-28-28z" fill="' + INK + '"/><circle cx="92" cy="60" r="10" fill="none" stroke="' + INK + '" stroke-width="6"/><path d="M28 50h30" stroke="' + RUST + '" stroke-width="4" stroke-dasharray="5 5"/>',
    share: '<circle cx="38" cy="30" r="12" fill="' + SAGE + '"/><circle cx="82" cy="30" r="12" fill="#C9B38A"/><path d="M20 76c2-18 34-18 36 0M64 76c2-18 34-18 36 0" fill="none" stroke="' + INK + '" stroke-width="4"/><rect x="44" y="52" width="32" height="22" rx="4" fill="' + LIME + '" stroke="' + INK + '" stroke-width="2"/>',
    raw: '<path d="M14 76l24-34 16 18 14-26 38 42z" fill="#B7B1A1" stroke="#7A7465" stroke-width="3" stroke-linejoin="round"/><path d="M40 18l10 14h-20z" fill="#37A46B"/><path d="M50 32v12" stroke="' + BROWN + '" stroke-width="4"/>',
    recycle: '<path d="M60 14l16 26H44z" fill="' + INK + '"/><path d="M30 76l-14-26h30z" fill="' + SAGE + '"/><path d="M90 76H60l14-26z" fill="#C9B38A"/><path d="M46 36l-14 22M74 36l14 22M42 76h36" stroke="' + INK + '" stroke-width="3" stroke-dasharray="4 4" fill="none"/>',
    cycle: '<circle cx="60" cy="46" r="28" fill="none" stroke="' + INK + '" stroke-width="6" stroke-dasharray="120 20"/><path d="M84 18l6 18-18 0z" fill="' + INK + '"/><circle cx="60" cy="46" r="8" fill="' + LIME + '"/>',
    bio: '<path d="M30 78V34h60v44z" fill="' + BROWN + '"/><rect x="24" y="26" width="72" height="12" rx="4" fill="#4E3522"/><text x="60" y="64" text-anchor="middle" font-family="system-ui" font-size="18" font-weight="700" fill="#FFFFFF">BIO</text>',
    compost: '<rect x="18" y="30" width="84" height="48" rx="4" fill="none" stroke="#7B5A36" stroke-width="5"/><rect x="22" y="56" width="76" height="20" fill="#4E3522"/><rect x="22" y="44" width="76" height="12" fill="#8C7A45"/><path d="M60 44V20M60 30c-10-10-20-6-20 0M60 26c10-10 20-8 20-2" stroke="#37A46B" stroke-width="4" fill="none" stroke-linecap="round"/>'
  };

  // Ilustracje sytuacji memory: jednakowy kadr 120 × 90.
  var memory = {
    keep: '<rect x="20" y="40" width="80" height="24" rx="12" fill="' + SAGE + '"/><circle cx="36" cy="70" r="10" fill="' + INK + '"/><circle cx="84" cy="70" r="10" fill="' + INK + '"/><path d="M84 40V18h10" stroke="' + INK + '" stroke-width="5" fill="none"/><circle cx="30" cy="22" r="9" fill="#C9B38A"/>',
    give: '<rect x="44" y="30" width="32" height="40" rx="3" fill="' + LIME + '" stroke="' + INK + '" stroke-width="3"/><path d="M14 62c10-6 20-6 30 0M106 62c-10-6-20-6-30 0" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M52 20h24l-6-6M76 20l-6 6" stroke="' + RUST + '" stroke-width="3" fill="none"/>',
    fix: '<rect x="14" y="44" width="70" height="20" rx="10" fill="#E7EEF5" stroke="#8A9BAA" stroke-width="3"/><path d="M40 44l6 20" stroke="' + RUST + '" stroke-width="4"/><path d="M76 14l26 26-8 8-26-26z" fill="' + INK + '"/><circle cx="98" cy="54" r="8" fill="none" stroke="' + INK + '" stroke-width="5"/>',
    game: '<rect x="30" y="44" width="60" height="34" rx="4" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/><path d="M60 44v34M30 61h60" stroke="' + SAGE + '" stroke-width="3"/><circle cx="18" cy="30" r="10" fill="' + SAGE + '"/><circle cx="102" cy="30" r="10" fill="#C9B38A"/><circle cx="45" cy="52" r="4" fill="' + RUST + '"/><circle cx="75" cy="70" r="4" fill="' + INK + '"/>',
    material: '<rect x="18" y="26" width="30" height="46" rx="6" fill="#DCEFF5" stroke="#7FA3AE" stroke-width="3"/><rect x="54" y="46" width="48" height="26" rx="4" fill="#C9B38A" stroke="#8A6130" stroke-width="3"/><path d="M60 38c10-12 30-12 38 0" stroke="' + INK + '" stroke-width="3" stroke-dasharray="5 4" fill="none"/><path d="M96 32l4 8-9 1" stroke="' + INK + '" stroke-width="3" fill="none"/>',
    'peel-bag': '<path d="M30 80L36 30h48l6 50z" fill="#E7EEF5" fill-opacity=".85" stroke="#8A9BAA" stroke-width="3"/><path d="M40 52c8-10 20-8 24-2M52 46c10-8 22-4 24 2" stroke="#D08A3C" stroke-width="6" fill="none" stroke-linecap="round"/>',
    wet: '<rect x="20" y="20" width="80" height="60" rx="4" fill="none" stroke="#7B5A36" stroke-width="5"/><rect x="24" y="36" width="72" height="40" fill="#6F8F4A"/><rect x="24" y="54" width="72" height="22" fill="' + SKY + '" opacity=".6"/><path d="M50 12c0 6-8 6-8 0l4-8zM74 12c0 6-8 6-8 0l4-8z" fill="' + SKY + '"/>',
    dry: '<rect x="20" y="20" width="80" height="60" rx="4" fill="none" stroke="#7B5A36" stroke-width="5"/><rect x="24" y="46" width="72" height="30" fill="#C9B38A"/><path d="M34 52l12-6M58 58l14-4M78 50l10 6" stroke="#8A6130" stroke-width="4"/><circle cx="92" cy="14" r="8" fill="#F8C945"/>'
  };

  function entry() {
    var cells = '';
    var letters = 'NAPRAWAOBIEG';
    for (var i = 0; i < 12; i++) {
      var x = 40 + (i % 4) * 60, y = 50 + Math.floor(i / 4) * 60;
      cells += '<rect x="' + x + '" y="' + y + '" width="52" height="52" rx="10" fill="' + (i < 7 && i % 4 !== 3 ? LIME : '#FFFFFF') + '" stroke="' + SAGE + '" stroke-width="2"/><text x="' + (x + 26) + '" y="' + (y + 35) + '" text-anchor="middle" font-family="system-ui" font-size="24" font-weight="700" fill="' + INK + '">' + letters[i] + '</text>';
    }
    return deco('0 0 520 300', '<rect width="520" height="300" rx="24" fill="#EEF2E7"/>' + cells +
      '<g transform="translate(300 60)"><rect width="180" height="180" rx="18" fill="#FFFFFF" stroke="' + SAGE + '" stroke-width="2"/>' +
      '<g transform="translate(30 20) scale(1)">' + dictionary.repair + '</g><path d="M30 130h120M30 150h90" stroke="' + SAGE + '" stroke-width="8" stroke-linecap="round"/></g>');
  }

  // Ozdoby edytora buta: kształt wyśrodkowany w (x, y), promień r. Zwraca element SVG (tekst), bez atrybutów zdarzeń.
  function ornament(shape, x, y, r, fill) {
    var st = ' fill="' + fill + '" stroke="#12302588" stroke-width="3"';
    switch (shape) {
      case 'circle': return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + st + '/>';
      case 'square': return '<rect x="' + (x - r * 0.85) + '" y="' + (y - r * 0.85) + '" width="' + (r * 1.7) + '" height="' + (r * 1.7) + '" rx="4"' + st + '/>';
      case 'triangle': return '<path d="M' + x + ' ' + (y - r) + 'L' + (x + r * 0.95) + ' ' + (y + r * 0.75) + 'H' + (x - r * 0.95) + 'Z"' + st + '/>';
      case 'star': {
        var pts = [];
        for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push((x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1)); }
        return '<path d="M' + pts.join('L') + 'Z"' + st + '/>';
      }
      case 'lightning': return '<path d="M' + (x + r * 0.2) + ' ' + (y - r) + 'L' + (x - r * 0.7) + ' ' + (y + r * 0.15) + 'H' + (x - r * 0.05) + 'L' + (x - r * 0.3) + ' ' + (y + r) + 'L' + (x + r * 0.7) + ' ' + (y - r * 0.2) + 'H' + (x + r * 0.05) + 'Z"' + st + '/>';
      case 'organic': return '<path d="M' + (x - r) + ' ' + y + 'C' + (x - r) + ' ' + (y - r * 1.1) + ' ' + (x + r * 0.4) + ' ' + (y - r * 1.2) + ' ' + (x + r * 0.9) + ' ' + (y - r * 0.4) + 'S' + (x + r * 0.6) + ' ' + (y + r) + ' ' + x + ' ' + (y + r * 0.9) + 'S' + (x - r) + ' ' + (y + r * 0.8) + ' ' + (x - r) + ' ' + y + 'Z"' + st + '/>';
    }
    return '';
  }

  window.GOZArt3 = {
    dictionary: function (name) { return deco('0 0 120 90', dictionary[name] || ''); },
    memory: function (name) { return deco('0 0 120 90', memory[name] || ''); },
    ornament: ornament,
    ornamentIcon: function (shape) { return deco('0 0 60 60', ornament(shape, 30, 30, 20, '#123E34')); },
    mountAll: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll('[data-art3]'), function (node) {
        if (!node.dataset.artMounted && node.dataset.art3 === 'z6-entry') { node.innerHTML = entry(); node.dataset.artMounted = '1'; }
      });
    }
  };
})();
