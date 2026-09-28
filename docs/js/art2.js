// Robocze schematy SVG etapu 2: warsztat (Z2), ślad produktu (Z3), ocean, BIO (Z4), kompostownik (Z5).
// Schematy objaśniają treść; nie są pomiarem, fotografią ani instrukcją. Finalne ilustracje mogą je zastąpić w tych samych miejscach.
(function () {
  'use strict';
  var INK = '#123E34', LIME = '#D9F294', SAGE = '#9FB594', SAND = '#E7DCC4', PAPER = '#F5F7F0', RUST = '#B4603A', BROWN = '#6B4A2F';
  var uid = 0;
  function svg(viewBox, label, body, cls) {
    return '<svg class="art-svg ' + (cls || '') + '" viewBox="' + viewBox + '" role="img" aria-label="' + label + '" focusable="false">' + body + '</svg>';
  }
  function deco(viewBox, body, cls) {
    return '<svg class="art-svg ' + (cls || '') + '" viewBox="' + viewBox + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  // I69 START z2-funkcje
  // --- Z2: statyczne ilustracje (polecenie 71) ---------------------------------------
  // Rastry z rejestru data/z2-assets.js przez GOZ2Assets; bez roboczych nakładek SVG na nowych obrazach.
  // Opis domyślny pochodzi z dostawy autora; wejście Z2 jest dekoracyjne (pusty alt).
  // sizes odpowiada zmierzonej szerokości pól (dowody_pakiet_69), srcset wybiera wariant.
  var Z2_SIZES = {
    entry: '(max-width: 900px) 100vw, min(56vw, 820px)',
    inspect: '(max-width: 800px) calc(100vw - 86px), (max-width: 900px) calc(100vw - 106px), (max-width: 1100px) calc(50vw - 90px), min(calc(50vw - 138px), 582px)',
    card: '(max-width: 800px) calc(100vw - 86px), (max-width: 1100px) calc(50vw - 84px), min(calc(50vw - 298px), 422px)',
    frame: '(max-width: 800px) calc(100vw - 88px), (max-width: 900px) calc(100vw - 108px), (max-width: 1100px) calc((100vw - 104px) / 3 - 44px), min(calc((100vw - 200px) / 3 - 44px), 370px)',
    pad: '(max-width: 800px) calc(100vw - 128px), (max-width: 900px) calc(100vw - 172px), 278px'
  };
  function z2Image(key, alt, sizes) {
    return window.GOZ2Assets ? window.GOZ2Assets.markup(key, { alt: alt, sizes: sizes }) : '';
  }
  function shoe(state, label, small) {
    return z2Image(state, label, small ? Z2_SIZES.card : Z2_SIZES.inspect);
  }
  function processFrame(step) { return z2Image(step, undefined, Z2_SIZES.frame); }
  function pad(kind) { return z2Image(kind, undefined, Z2_SIZES.pad); }
  // I69 END z2-funkcje

  // --- Z3 ---------------------------------------------------------------------
  // I82 START renderery-z3
  // Rejestr zasobów zawiera jedyną listę ścieżek; teksty podpisów są HTML.
  function earlierStages() {
    return window.GOZ3Assets ? window.GOZ3Assets.comparison('earlier') : '<span class="z3-image-note" role="status">Ilustracja Z3 jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
  }
  function visibleScooter() {
    return window.GOZ3Assets ? window.GOZ3Assets.comparison('visible') : '<span class="z3-image-note" role="status">Ilustracja Z3 jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
  }
  function lamp() {
    return window.GOZ3Assets ? window.GOZ3Assets.lamp() : '<span class="z3-image-note" role="status">Ilustracja Z3 jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
  }
  // I82 END renderery-z3


  // --- Ocean -----------------------------------------------------------------
  // I87 oceanSurface — cały dawny renderer zastąpiony ilustracją.
  function oceanSurface() {
    return window.GOZOceanAssets ? window.GOZOceanAssets.markup('surface') : '<span class="ocean-renderer-missing" role="status">Ilustracja jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
  }
  // I87 oceanZoom — cały dawny renderer zastąpiony ilustracją.
  function oceanZoom() {
    return window.GOZOceanAssets ? window.GOZOceanAssets.markup('zoom') : '<span class="ocean-renderer-missing" role="status">Ilustracja jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
  }
  function depthColumn() {
    var marks = '';
    [0, 2000, 4000, 6000, 8000, 10890].forEach(function (m) {
      var y = 30 + (m / 10890) * 560;
      marks += '<path d="M70 ' + y + 'h24" stroke="#E6F2F4" stroke-width="2"/><text x="100" y="' + (y + 6) + '" font-family="system-ui" font-size="18" fill="#E6F2F4">' + m.toLocaleString('pl-PL') + ' m</text>';
    });
    var yStart = 30 + (7000 / 10890) * 560;
    return svg('0 0 260 620', 'Skala głębokości od 0 do 10 890 metrów z zaznaczonym zakresem badanych głębokości 7000–10 890 m',
      '<defs><linearGradient id="deep" x2="0" y2="1"><stop stop-color="#2E8BA8"/><stop offset=".45" stop-color="#0F4D63"/><stop offset="1" stop-color="#051E28"/></linearGradient></defs>' +
      '<rect x="20" y="20" width="230" height="580" rx="16" fill="url(#deep)"/>' +
      '<rect x="28" y="' + yStart + '" width="36" height="' + (590 - yStart) + '" rx="6" fill="' + LIME + '" opacity=".85"/>' + marks);
  }
  // I87 amphipod — cały dawny renderer zastąpiony ilustracją.
  function amphipod() {
    return window.GOZOceanAssets ? window.GOZOceanAssets.markup('amphipod') : '<span class="ocean-renderer-missing" role="status">Ilustracja jest niedostępna. Skorzystaj z opisu w lekcji.</span>';
  }
  // --- Z4 --------------------------------------------------------------------
  // Robocze ikony obiektów treści 3.2 (08 §1). Skorupki bez zawartości, fusy bez opakowań, woreczek foliowy jako osobny obiekt.
  var PEEL = '<path d="M28 58c10-14 26-10 32-2M50 52c14-12 30-6 34 4M40 62c16-4 30 0 40 4" stroke="#D08A3C" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M34 70c8-6 18-6 24 0" stroke="#8FB25A" stroke-width="6" fill="none" stroke-linecap="round"/>';
  var BAG = '<path d="M30 80L36 30h48l6 50z" fill="#E7EEF5" fill-opacity=".85" stroke="#8A9BAA" stroke-width="3" stroke-linejoin="round"/><path d="M36 30c4-8 10-12 14-10M84 30c-4-8-10-12-14-10" stroke="#8A9BAA" stroke-width="3" fill="none"/><path d="M44 44l4 28M70 42l-2 30" stroke="#FFFFFF" stroke-width="3" opacity=".8"/>';
  var z4 = {
    eggshells: '<ellipse cx="60" cy="70" rx="46" ry="10" fill="#FFFFFF" stroke="#9AA99C" stroke-width="3"/><path d="M26 64c2-18 12-26 20-26l6 10 6-8 6 10c6 2 10 8 10 14z" fill="#F4E9D8" stroke="#B89F7C" stroke-width="3" stroke-linejoin="round"/><path d="M66 66c4-14 14-20 22-18l2 8 8-2c4 4 6 8 6 12z" fill="#EFE1CB" stroke="#B89F7C" stroke-width="3" stroke-linejoin="round"/>',
    grounds: '<ellipse cx="60" cy="64" rx="40" ry="16" fill="#3E2A1C"/><circle cx="46" cy="58" r="3" fill="#6B4A2F"/><circle cx="66" cy="54" r="3" fill="#6B4A2F"/><circle cx="74" cy="66" r="3" fill="#6B4A2F"/><path d="M30 60c10-8 50-10 60 0" stroke="#5A3F28" stroke-width="3" fill="none"/>',
    bagWithPeelings: BAG + '<g transform="translate(2 -6)">' + PEEL + '</g>',
    peelings: '<ellipse cx="60" cy="66" rx="48" ry="12" fill="#FFFFFF" stroke="#9AA99C" stroke-width="3"/>' + PEEL,
    bag: BAG,
    bones: '<ellipse cx="60" cy="72" rx="48" ry="10" fill="#FFFFFF" stroke="#9AA99C" stroke-width="3"/><path d="M22 54l40-10" stroke="#F3EAD8" stroke-width="9" stroke-linecap="round"/><circle cx="20" cy="50" r="6" fill="#F3EAD8" stroke="#B9A98A" stroke-width="2"/><circle cx="22" cy="60" r="6" fill="#F3EAD8" stroke="#B9A98A" stroke-width="2"/><circle cx="64" cy="40" r="6" fill="#F3EAD8" stroke="#B9A98A" stroke-width="2"/><circle cx="66" cy="50" r="6" fill="#F3EAD8" stroke="#B9A98A" stroke-width="2"/><path d="M70 62h34M76 62l-4-8M84 62l-4-8M92 62l-4-8M76 62l-4 8M84 62l-4 8M92 62l-4 8" stroke="#B9A98A" stroke-width="2.5" stroke-linecap="round"/>',
    meat: '<ellipse cx="60" cy="72" rx="48" ry="10" fill="#FFFFFF" stroke="#9AA99C" stroke-width="3"/><path d="M34 62c-4-16 12-28 30-26s28 14 22 26-48 14-52 0z" fill="#B55A4A" stroke="#7E3A2E" stroke-width="3"/><path d="M46 52c8-4 18-4 26 2" stroke="#E9B3A6" stroke-width="4" fill="none" stroke-linecap="round"/>',
    potatoesWithSauce: '<ellipse cx="60" cy="70" rx="48" ry="12" fill="#FFFFFF" stroke="#9AA99C" stroke-width="3"/><path d="M24 66c10-8 24-6 36-8s30 0 38 6c-10 8-62 10-74 2z" fill="#9C6A3A" opacity=".85"/><ellipse cx="46" cy="56" rx="16" ry="12" fill="#E7CD8E" stroke="#B0904C" stroke-width="3"/><ellipse cx="74" cy="54" rx="15" ry="11" fill="#DFC382" stroke="#B0904C" stroke-width="3"/><path d="M36 50c6 4 14 4 20 2M64 48c6 4 12 4 18 2" stroke="#8A5A2E" stroke-width="3" fill="none"/>'
  };
  function z4Item(name) { return deco('0 0 120 90', z4[name] || ''); }
  function z4Example(done) {
    var peel = '<path d="M-22 -4c10-14 26-10 32-2M0 -10c14-12 30-6 34 4M-10 0c16-4 30 0 40 4" stroke="#D08A3C" stroke-width="7" fill="none" stroke-linecap="round"/>';
    return svg('0 0 640 300', done ? 'Obierki w brązowym pojemniku, woreczek foliowy pozostaje obok' : 'Miseczka z obierkami i woreczek foliowy, w którym zostały przyniesione',
      '<rect width="640" height="300" rx="22" fill="#FFFFFF"/><rect x="0" y="230" width="640" height="70" fill="#EEE3CF"/>' +
      '<g transform="translate(430 70)"><rect x="0" y="30" width="150" height="150" rx="12" fill="' + BROWN + '"/><rect x="-10" y="16" width="170" height="24" rx="8" fill="#4E3522"/><text x="75" y="120" text-anchor="middle" font-family="system-ui" font-size="26" font-weight="700" fill="#FFFFFF">BIO</text>' +
      (done ? '<g transform="translate(60 40)">' + peel + '</g>' : '') + '</g>' +
      '<g transform="translate(90 170)"><ellipse cx="60" cy="50" rx="70" ry="18" fill="#FFFFFF" stroke="#9AA99C" stroke-width="3"/>' + (done ? '' : '<g transform="translate(60 40)">' + peel + '</g>') + '</g>' +
      '<g transform="translate(250 120)"><path d="M10 110L30 20h80l20 90z" fill="#E7EEF5" stroke="#8A9BAA" stroke-width="3"/><path d="M40 20c0-20 20-20 20 0M80 20c0-20 20-20 20 0" stroke="#8A9BAA" stroke-width="3" fill="none"/><text x="70" y="80" text-anchor="middle" font-family="system-ui" font-size="16" fill="#56677A">woreczek</text></g>' +
      (done ? '<path d="M200 150C260 60 360 40 440 100" stroke="' + INK + '" stroke-width="4" stroke-dasharray="8 8" fill="none"/><path d="M428 86l14 16-20 4" stroke="' + INK + '" stroke-width="4" fill="none"/>' : ''));
  }

  // --- Z5 --------------------------------------------------------------------
  function compostSection() {
    var twig = function (x, y) { return '<path d="M' + x + ' ' + y + 'l40-10M' + (x + 16) + ' ' + (y - 4) + 'l10-16" stroke="#7B5A36" stroke-width="5" stroke-linecap="round"/>'; };
    var twigs = ''; for (var i = 0; i < 6; i++) twigs += twig(70 + i * 70, 430 - (i % 2) * 8);
    return svg('0 0 560 500', 'Przekrój przykładowego kompostownika ogrodowego z pięcioma składnikami',
      '<rect width="560" height="500" rx="22" fill="#EEF2E7"/>' +
      '<rect x="40" y="60" width="480" height="400" rx="10" fill="none" stroke="#7B5A36" stroke-width="8"/>' +
      '<g data-region="twigs"><rect class="region" x="48" y="400" width="464" height="52" fill="#C8B08C"/>' + twigs + '</g>' +
      '<g data-region="brown"><rect class="region" x="48" y="300" width="464" height="100" fill="#B98B4E"/><path d="M80 330l30-10 10 20M200 360l30-12 8 18M340 320l26-10 12 18M440 350l24-8 8 16" stroke="#8A6130" stroke-width="5" fill="none"/></g>' +
      '<g data-region="green"><rect class="region" x="48" y="210" width="464" height="90" fill="#8FB25A"/><path d="M90 250c14-10 30-8 36 2M230 240c14-10 30-8 36 2M380 260c14-10 30-8 36 2" stroke="#D08A3C" stroke-width="6" fill="none"/><path d="M160 270l10-24M320 270l10-24M460 270l8-24" stroke="#5E8B34" stroke-width="4"/></g>' +
      '<g data-region="cardboard"><rect class="region" x="48" y="160" width="464" height="50" fill="#D9C3A0"/><path d="M90 180h30M150 192h26M220 178h34M300 190h24M380 182h30M440 194h28" stroke="#A88A5E" stroke-width="7" stroke-linecap="round"/></g>' +
      '<g data-region="mature"><rect class="region" x="48" y="120" width="464" height="40" fill="#4E3522"/><circle cx="120" cy="140" r="4" fill="#7B5A36"/><circle cx="300" cy="136" r="4" fill="#7B5A36"/><circle cx="420" cy="144" r="4" fill="#7B5A36"/></g>' +
      '<path d="M20 200c20-10 20 10 40 0M20 300c20-10 20 10 40 0" stroke="#5B8FB0" stroke-width="3" fill="none" opacity=".7"/>');
  }
  function compostStage(i) {
    var inner = [
      '<rect x="40" y="70" width="240" height="30" fill="#8FB25A"/><rect x="40" y="100" width="240" height="40" fill="#B98B4E"/><rect x="40" y="140" width="240" height="30" fill="#C8B08C"/>',
      '<path d="M40 90c60-20 180 20 240-4V170H40Z" fill="#8C7A45"/><path d="M80 120c20-12 40 10 60 0s40-12 60 0" stroke="#B98B4E" stroke-width="8" fill="none"/><path d="M150 50c10-20-10-30 0-44M180 50c10-20-10-30 0-44" stroke="#D9A35B" stroke-width="4" fill="none"/>',
      '<rect x="40" y="110" width="240" height="60" fill="#4E3522"/><circle cx="90" cy="140" r="4" fill="#6B4A2F"/><circle cx="200" cy="130" r="4" fill="#6B4A2F"/>',
      '<rect x="20" y="140" width="280" height="40" fill="#5A3F28"/><path d="M110 140V90M110 110c-20-20-40-10-40 0M110 100c20-20 40-14 40-4" stroke="#37A46B" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M220 140V110M220 118c14-10 26-8 26 0" stroke="#37A46B" stroke-width="5" fill="none"/>'
    ][i];
    var frame = i < 3 ? '<rect x="32" y="40" width="256" height="138" rx="6" fill="none" stroke="#7B5A36" stroke-width="6"/>' : '';
    return deco('0 0 320 200', '<rect width="320" height="200" rx="18" fill="#EEF2E7"/>' + inner + frame);
  }
  // Z5 — pokaz wilgoci (pakiet 26, 24 §5): zbliżenie tej samej mieszanki w trzech stanach, viewBox 0 0 800 400.
  // Warstwa „skladniki” (liście, obierki, gałązki: kształty i położenia) jest identyczna we wszystkich stanach.
  // Zmieniają się wyłącznie warstwy wody i widocznej przestrzeni z powietrzem. Bez tekstu w obrazie, bez organizmów i dojrzewania.
  // Opis dostępności: GOZ_Z5.moisture[].alt (redakcja_26/propozycja.json).
  var MIX_PARTS = [
    ['leaf', 70, 70, -20, '#A8743F', 1.5], ['peel', 230, 62, 10, 0, 1.45], ['twig', 395, 78, -8, 0, 1.4], ['leaf', 545, 72, 35, '#6E9A3F', 1.5], ['peel', 705, 70, -15, 0, 1.4],
    ['leaf', 250, 150, 80, '#6E9A3F', 0.95], ['peel', 540, 150, -70, 0, 0.9], ['twig', 735, 150, 40, 0, 0.9], ['leaf', 45, 165, 15, '#A8743F', 0.9],
    ['twig', 105, 212, 20, 0, 1.3], ['leaf', 290, 208, -40, '#6E9A3F', 1.45], ['peel', 455, 212, 25, 0, 1.4], ['leaf', 630, 210, 10, '#A8743F', 1.45], ['twig', 760, 222, 70, 0, 1.1],
    ['peel', 290, 278, -60, 0, 0.9], ['leaf', 455, 285, 40, '#A8743F', 0.9], ['twig', 625, 285, -40, 0, 0.9], ['leaf', 85, 280, -10, '#6E9A3F', 0.9],
    ['peel', 95, 345, -5, 0, 1.45], ['leaf', 250, 340, 60, '#A8743F', 1.45], ['twig', 420, 350, 5, 0, 1.4], ['leaf', 580, 338, -25, '#6E9A3F', 1.45], ['peel', 725, 350, 20, 0, 1.4]
  ];
  // Wolne przestrzenie między składnikami: [cx, cy, rx, ry]. W stanie „wet” sześć pierwszych wypełnia woda.
  var MIX_GAPS = [[160, 140, 46, 30], [375, 145, 44, 28], [645, 145, 46, 29], [195, 275, 44, 28], [375, 278, 48, 30], [705, 285, 42, 27], [470, 142, 32, 22], [540, 278, 34, 24]];
  var MIX_SHAPES = {
    leaf: 'M0 -34C22 -31 35 -9 31 13C27 30 9 38 0 40C-8 37 -27 29 -31 12C-35 -6 -24 -29 -6 -33Z',
    peel: 'M-46 -8C-20 -27 24 -26 48 -10C53 -6 50 1 44 0C22 -13 -18 -12 -40 4C-46 7 -51 -2 -46 -8Z',
    twig: 'M-48 6L44 -8'
  };
  function mixPart(p, film) {
    var t = 'translate(' + p[1] + ' ' + p[2] + ') rotate(' + p[3] + ') scale(' + (p[5] || 1) + ')';
    if (p[0] === 'twig') {
      if (film) return '<g transform="' + t + '" stroke="#3E86B5" stroke-width="3" fill="none" opacity=".85"><path d="M-44 11L46 -3"/></g>';
      return '<g transform="' + t + '" stroke="#6B4A2F" stroke-linecap="round" fill="none"><path d="' + MIX_SHAPES.twig + '" stroke-width="8"/><path d="M8 -2L24 -22" stroke-width="5"/><path d="M-22 2L-34 -14" stroke-width="4"/></g>';
    }
    if (film) return '<path transform="' + t + '" d="' + MIX_SHAPES[p[0]] + '" fill="none" stroke="#3E86B5" stroke-width="3.5" opacity=".85"/>';
    if (p[0] === 'leaf') return '<g transform="' + t + '"><path d="' + MIX_SHAPES.leaf + '" fill="' + p[4] + '" stroke="#4E3A22" stroke-width="1.5"/><path d="M0 -30L1 36M1 -8L14 -18M1 6L-14 -4M1 18L13 10" stroke="#3D2B18" stroke-width="1.6" fill="none" opacity=".55"/></g>';
    return '<g transform="' + t + '"><path d="' + MIX_SHAPES.peel + '" fill="#D8893A" stroke="#8A4F1E" stroke-width="1.5"/><path d="M-36 -6C-12 -19 18 -19 40 -8" stroke="#F2C27E" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
  }
  function mixGap(g) {
    var cx = g[0], cy = g[1], rx = g[2], ry = g[3];
    return 'M' + (cx - rx) + ' ' + cy + 'C' + (cx - rx) + ' ' + (cy - ry * 1.2) + ' ' + (cx + rx * 0.6) + ' ' + (cy - ry * 1.1) + ' ' + (cx + rx) + ' ' + (cy - ry * 0.2) +
      'C' + (cx + rx * 1.1) + ' ' + (cy + ry * 0.8) + ' ' + (cx - rx * 0.2) + ' ' + (cy + ry * 1.2) + ' ' + (cx - rx) + ' ' + cy + 'Z';
  }
  function moistureState(state) {
    var flooded = state === 'wet' ? 6 : 0;
    var air = '', water = '', films = '', parts = '';
    MIX_GAPS.forEach(function (g, i) {
      if (i < flooded) water += '<path d="' + mixGap(g) + '" fill="#6FB3DE" fill-opacity=".8" stroke="#2F6F99" stroke-width="2.5"/>';
      else air += '<path d="' + mixGap(g) + '" fill="#FFFDF6" stroke="#7E8E7A" stroke-width="2" stroke-dasharray="6 5"/>';
    });
    MIX_PARTS.forEach(function (p) {
      parts += mixPart(p, false);
      if (state !== 'dry') films += mixPart(p, true);
    });
    if (state !== 'dry') {
      // Krople przy powierzchni kilku składników (ta sama pozycja w stanach wilgotnym i zalanym).
      [[262, 78], [566, 104], [306, 240], [648, 240], [262, 372], [596, 366]].forEach(function (d) {
        films += '<path d="M' + d[0] + ' ' + (d[1] - 9) + 'C' + (d[0] + 6) + ' ' + (d[1] - 1) + ' ' + (d[0] + 6) + ' ' + (d[1] + 5) + ' ' + d[0] + ' ' + (d[1] + 5) + 'C' + (d[0] - 6) + ' ' + (d[1] + 5) + ' ' + (d[0] - 6) + ' ' + (d[1] - 1) + ' ' + d[0] + ' ' + (d[1] - 9) + 'Z" fill="#6FB3DE" stroke="#2F6F99" stroke-width="1.5"/>';
      });
    }
    var body = '<rect width="800" height="400" rx="24" fill="#E9E1CF"/>' +
      '<g data-layer="powietrze">' + air + '</g>' +
      '<g data-layer="woda">' + water + '</g>' +
      '<g data-layer="skladniki">' + parts + '</g>' +
      '<g data-layer="woda-przy-skladnikach">' + films + '</g>';
    var info = window.GOZ_Z5 && window.GOZ_Z5.moisture.filter(function (m) { return m.id === state; })[0];
    var label = info && info.alt ? info.alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') : '';
    return label ? svg('0 0 800 400', label, body, 'moisture-' + state) : deco('0 0 800 400', body, 'moisture-' + state);
  }
  function wetCompost(fixed) {
    var body = '<rect width="400" height="240" rx="18" fill="#EEF2E7"/><rect x="40" y="30" width="320" height="190" rx="8" fill="none" stroke="#7B5A36" stroke-width="6"/>';
    if (!fixed) {
      body += '<rect x="46" y="70" width="308" height="146" fill="#6F8F4A"/><rect x="46" y="130" width="308" height="86" fill="#5B8FB0" opacity=".45"/><path d="M60 90h280M60 110h280" stroke="#4E6B32" stroke-width="6"/>';
    } else {
      body += '<rect x="46" y="70" width="308" height="146" fill="#8C7A45"/><g fill="#B98B4E"><rect x="70" y="90" width="40" height="18" rx="5"/><rect x="170" y="120" width="40" height="18" rx="5"/><rect x="270" y="96" width="40" height="18" rx="5"/><rect x="120" y="170" width="40" height="18" rx="5"/></g><g stroke="#FFFFFF" stroke-width="3" fill="none"><path d="M90 150c20-12 20 12 40 0"/><path d="M230 170c20-12 20 12 40 0"/></g>';
    }
    return deco('0 0 400 240', body);
  }
  function wormBin(active) {
    var worms = '<g stroke="#C46A6A" stroke-width="6" fill="none" stroke-linecap="round" class="worms"><path d="M90 150c10-10 20 10 30 0s20 10 30 0"/><path d="M200 170c10-10 20 10 30 0s20 10 30 0"/><path d="M150 120c10-10 20 10 30 0"/></g>';
    return svg('0 0 400 240', 'Oddzielny pojemnik do wermikompostowania z dżdżownicami - schemat, inny niż ogrodowy kompostownik',
      '<rect width="400" height="240" rx="18" fill="#F2F6EA"/><rect x="50" y="60" width="300" height="150" rx="12" fill="#6B5A48"/><rect x="40" y="46" width="320" height="22" rx="8" fill="#4E4034"/><g fill="#FFFFFF"><circle cx="80" cy="190" r="4"/><circle cx="110" cy="190" r="4"/><circle cx="140" cy="190" r="4"/></g>' +
      '<rect x="62" y="96" width="276" height="100" rx="6" fill="#4E3522"/>' + (active ? worms : '<path d="M160 146c10-10 20 10 30 0" stroke="#C46A6A" stroke-width="6" fill="none" stroke-linecap="round"/>'));
  }
  function gardenCompost() {
    return deco('0 0 520 300', '<rect width="520" height="300" rx="24" fill="#E6EFD8"/><path d="M0 220Q140 190 260 214T520 206V300H0Z" fill="#9FB594"/><rect x="170" y="110" width="180" height="120" rx="8" fill="none" stroke="#7B5A36" stroke-width="10"/><path d="M180 130h160M180 160h160M180 190h160" stroke="#7B5A36" stroke-width="6"/><path d="M420 214V150M420 170c-20-20-40-10-40 0M420 160c20-20 40-14 40-4" stroke="#37A46B" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="90" cy="220" rx="40" ry="14" fill="#5A3F28"/>');
  }
  function kitchenBio() {
    return deco('0 0 520 300', '<rect width="520" height="300" rx="24" fill="#F4EEE2"/><rect x="0" y="210" width="520" height="90" fill="#E0D3BC"/><g transform="translate(300 60)"><rect y="30" width="150" height="150" rx="12" fill="' + BROWN + '"/><rect x="-10" y="16" width="170" height="24" rx="8" fill="#4E3522"/><text x="75" y="120" text-anchor="middle" font-family="system-ui" font-size="30" font-weight="700" fill="#FFFFFF">BIO</text></g><g transform="translate(60 150)">' + z4.peelings + '</g><g transform="translate(160 150)">' + z4.eggshells + '</g>');
  }
  function oceanEntry() {
    return deco('0 0 520 300', '<defs><linearGradient id="oe" x2="0" y2="1"><stop stop-color="#2E8BA8"/><stop offset="1" stop-color="#051E28"/></linearGradient></defs><rect width="520" height="300" rx="24" fill="url(#oe)"/><path d="M0 70q40-14 80 0t80 0 80 0 80 0 80 0 80 0 80 0" stroke="#FFFFFF88" stroke-width="4" fill="none"/><circle cx="400" cy="200" r="46" fill="none" stroke="' + LIME + '" stroke-width="6"/><path d="M432 232l40 40" stroke="' + LIME + '" stroke-width="10" stroke-linecap="round"/><g fill="#F8C945"><circle cx="390" cy="190" r="4"/><circle cx="410" cy="210" r="3"/><circle cx="380" cy="214" r="3"/></g>');
  }

  var registry = {
    // I69 START z2-rejestr
    'shoe-clean': function () { return z2Image('clean', '', Z2_SIZES.entry); },
    'shoe-mud': function () { return shoe('mud'); },
    'shoe-gap': function () { return shoe('gap'); },
    'process-prep': function () { return processFrame('prep'); },
    'process-repair': function () { return processFrame('repair'); },
    'process-check': function () { return processFrame('check'); },
    padA: function () { return pad('padA'); },
    padB: function () { return pad('padB'); },
    // I69 END z2-rejestr
    'z3-visible': visibleScooter,
    'z3-earlier': earlierStages,
    lamp: lamp,
    'ocean-surface': oceanSurface,
    'ocean-zoom': oceanZoom,
    'ocean-depth': depthColumn,
    amphipod: amphipod,
    'z4-example-start': function () { return z4Example(false); },
    'z4-example-done': function () { return z4Example(true); },
    'compost-section': compostSection,
    'compost-stage-0': function () { return compostStage(0); },
    'compost-stage-1': function () { return compostStage(1); },
    'compost-stage-2': function () { return compostStage(2); },
    'compost-stage-3': function () { return compostStage(3); },
    'moisture-dry': function () { return moistureState('dry'); },
    'moisture-moist': function () { return moistureState('moist'); },
    'moisture-wet': function () { return moistureState('wet'); },
    'wet-before': function () { return wetCompost(false); },
    'wet-after': function () { return wetCompost(true); },
    'worm-bin': function () { return wormBin(false); },
    'worm-bin-active': function () { return wormBin(true); },
    'garden-compost': gardenCompost,
    'kitchen-bio': kitchenBio,
    'ocean-entry': oceanEntry
  };

  window.GOZArt2 = {
    render: function (name) { return registry[name] ? registry[name]() : ''; },
    shoeSmall: function (state, label) { return shoe(state, label, true); },
    z4Item: z4Item,
    mountAll: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll('[data-art2]'), function (node) {
        if (!node.dataset.artMounted) {
          // Podpis figcaption zapisany w dokumencie zostaje przy ilustracji (wcześniej był usuwany przy montażu — T-83).
          var caption = node.querySelector(':scope > figcaption');
          node.innerHTML = window.GOZArt2.render(node.dataset.art2);
          if (caption) node.appendChild(caption);
          node.dataset.artMounted = '1';
        }
      });
    }
  };
})();
