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

  // --- Z2: but ---------------------------------------------------------------
  // Stany: clean (sprawny), mud (błoto — nakładka robocza), gap (odchodząca podeszwa — nakładka robocza), repaired.
  function shoe(state, label, small) {
    var id = 'shoe' + (++uid);
    var outline = window.GOZ_SHOE.outline;
    var src = small ? 'assets/images/but-baza-mala.webp' : 'assets/images/but-baza.webp';
    var overlay = '';
    if (state === 'mud') {
      overlay = '<filter id="' + id + 'f"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="38"/></filter><g clip-path="url(#' + id + ')"><g filter="url(#' + id + 'f)" fill="' + BROWN + '" opacity=".62">' +
        '<path d="M420 560c60-40 140-20 190 10s40 90-30 100-200 20-220-30 0-50 60-80z"/>' +
        '<path d="M880 430c80-50 190-30 230 20s-10 110-110 110-180-40-170-80 0-30 50-50z"/>' +
        '<path d="M1180 520c50-30 130-10 150 30s-30 80-100 70-110-40-100-60 10-30 50-40z"/>' +
        '<path d="M640 470c40-20 90-10 100 20s-20 50-70 45-70-30-60-45 10-15 30-20z"/>' +
        '<path d="M380 680c80-10 300 0 520 20l20 60c-200 0-420-10-560-30z" opacity=".8"/>' +
        '<circle cx="1040" cy="640" r="22"/><circle cx="760" cy="600" r="16"/><circle cx="1260" cy="420" r="14"/></g></g>';
    } else if (state === 'gap') {
      overlay = '<path d="M346 640C420 622 530 632 640 668L642 684C540 664 450 676 350 700Z" fill="#2A1D14"/>' +
        '<path d="M350 700C450 676 540 664 642 684" stroke="#F3E3C8" stroke-width="5" fill="none"/>' +
        '<path d="M346 640C420 622 530 632 640 668" stroke="#8A6A48" stroke-width="3" fill="none"/>';
    }
    return svg('0 0 1671 941', label,
      '<defs><clipPath id="' + id + '"><path d="' + outline + '"/></clipPath></defs>' +
      '<image href="' + src + '" width="1671" height="941"/>' + overlay);
  }

  function processFrame(step) {
    var body = '<rect width="360" height="240" rx="20" fill="#F2F6EA"/>' +
      '<path d="M40 170C80 140 170 130 250 150L320 170V190H40Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M40 190H320" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>';
    if (step === 'prep') body += '<path d="M60 176C90 170 120 172 150 180" stroke="' + RUST + '" stroke-width="6" stroke-dasharray="8 8" fill="none"/><rect x="160" y="60" width="90" height="26" rx="8" fill="' + SAND + '"/><path d="M170 86v30M185 86v30M200 86v30M215 86v30M230 86v30" stroke="' + BROWN + '" stroke-width="4"/>';
    if (step === 'repair') body += '<path d="M60 176C90 170 120 172 150 180" stroke="#37A46B" stroke-width="6" fill="none"/><circle cx="270" cy="70" r="36" fill="#fff" stroke="' + INK + '" stroke-width="5"/><path d="M270 70V46M270 70l18 12" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M40 120h110" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M60 110v24M130 110v24" stroke="' + INK + '" stroke-width="6"/>';
    if (step === 'check') body += '<path d="M60 176C90 170 120 172 150 180" stroke="#37A46B" stroke-width="6" fill="none"/><circle cx="270" cy="70" r="38" fill="#DDEFC8"/><path d="M250 70l14 14 26-30" stroke="' + INK + '" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="110" cy="100" r="30" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M132 122l24 24" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/>';
    return deco('0 0 360 240', body);
  }

  function pad(kind) {
    var body = '<rect width="300" height="200" rx="18" fill="#F2F6EA"/>' +
      '<path d="M60 80C70 50 110 44 150 60C190 44 230 50 240 80L262 140C270 170 236 180 216 158L190 130H110L84 158C64 180 30 170 38 140Z" fill="' + (kind === 'padA' ? INK : '#5E6F64') + '"/>' +
      '<circle cx="104" cy="92" r="12" fill="' + PAPER + '"/><rect x="92" y="80" width="24" height="24" rx="4" fill="none"/><circle cx="196" cy="84" r="8" fill="' + LIME + '"/><circle cx="214" cy="102" r="8" fill="' + LIME + '"/>';
    if (kind === 'padA') body += '<rect x="176" y="72" width="54" height="44" rx="8" fill="none" stroke="' + LIME + '" stroke-width="3" stroke-dasharray="6 5"/><rect x="236" y="18" width="48" height="60" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M246 36h28M246 48h28M246 60h18" stroke="' + INK + '" stroke-width="3"/>';
    else body += '<circle cx="258" cy="44" r="24" fill="#fff" stroke="#5E6F64" stroke-width="3"/><text x="258" y="54" text-anchor="middle" font-size="28" font-family="system-ui" fill="#5E6F64">?</text>';
    return deco('0 0 300 200', body);
  }

  // --- Z3 ---------------------------------------------------------------------
  function earlierStages() {
    var icon = function (x, body, name) {
      return '<g transform="translate(' + x + ' 70)"><circle cx="70" cy="70" r="66" fill="#24594A"/>' + body + '<text x="70" y="176" text-anchor="middle" font-family="system-ui" font-size="20" fill="' + PAPER + '">' + name + '</text></g>';
    };
    return svg('0 0 680 300', 'Wcześniejsze etapy: surowce, produkcja, transport — ikony tej samej wielkości',
      '<rect width="680" height="300" rx="22" fill="#163B31"/>' +
      icon(20, '<path d="M30 100L60 50L80 70L110 100Z" fill="' + SAGE + '"/><circle cx="96" cy="60" r="12" fill="' + LIME + '"/>', 'Surowce') +
      icon(250, '<path d="M30 110V60L55 45V60L80 45V60L105 45V110Z" fill="' + SAND + '"/><rect x="45" y="80" width="14" height="14" fill="#163B31"/><rect x="75" y="80" width="14" height="14" fill="#163B31"/>', 'Produkcja') +
      icon(480, '<rect x="22" y="58" width="62" height="40" rx="4" fill="' + LIME + '"/><path d="M84 70h22l14 16v12H84Z" fill="' + LIME + '"/><circle cx="44" cy="104" r="9" fill="' + PAPER + '"/><circle cx="102" cy="104" r="9" fill="' + PAPER + '"/>', 'Transport') +
      '<path d="M175 140h60m-12-10 12 10-12 10M405 140h60m-12-10 12 10-12 10" stroke="' + LIME + '" stroke-width="4" fill="none" stroke-linecap="round"/>');
  }
  function visibleScooter() {
    return svg('0 0 680 300', 'To, co widzisz: hulajnoga bez silnika',
      '<rect width="680" height="300" rx="22" fill="#E9F0DE"/><image href="assets/images/hulajnoga-bez-tla-mala.webp" x="190" y="20" width="300" height="217"/><text x="340" y="276" text-anchor="middle" font-family="system-ui" font-size="20" fill="' + INK + '">Hulajnoga podczas jazdy</text>');
  }
  function lamp() {
    return svg('0 0 640 320', 'Lampka: wspólna przeszłość, potem wymiana klosza albo zakup całej nowej lampki',
      '<rect width="640" height="320" rx="22" fill="#FFFFFF"/>' +
      '<rect x="170" y="20" width="300" height="70" rx="14" fill="#EEF2E7" stroke="' + SAGE + '" stroke-width="2"/>' +
      '<text x="320" y="50" text-anchor="middle" font-family="system-ui" font-size="18" fill="' + INK + '">Już się wydarzyło:</text><text x="320" y="74" text-anchor="middle" font-family="system-ui" font-size="18" fill="' + INK + '">produkcja starej lampki</text>' +
      '<path d="M270 90L160 140M370 90L480 140" stroke="' + INK + '" stroke-width="3" stroke-dasharray="6 6"/>' +
      '<g transform="translate(70 140)"><rect width="180" height="160" rx="16" fill="#F2F6EA"/><path d="M60 40h60l20 40H40Z" fill="' + LIME + '" stroke="' + INK + '" stroke-width="3"/><path d="M90 80v44M60 124h60" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><text x="90" y="150" text-anchor="middle" font-family="system-ui" font-size="16" fill="' + INK + '">Nowy klosz</text></g>' +
      '<g transform="translate(390 140)"><rect width="180" height="160" rx="16" fill="#F2F6EA"/><path d="M60 40h60l20 40H40Z" fill="' + SAND + '" stroke="' + INK + '" stroke-width="3"/><path d="M90 80v44M60 124h60" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><rect x="20" y="16" width="140" height="120" rx="10" fill="none" stroke="' + RUST + '" stroke-width="3" stroke-dasharray="7 6"/><text x="90" y="150" text-anchor="middle" font-family="system-ui" font-size="16" fill="' + INK + '">Cała nowa lampka</text></g>');
  }

  // --- Ocean -----------------------------------------------------------------
  function oceanSurface() {
    return svg('0 0 680 360', 'Powierzchnia oceanu widziana z pokładu — wygląda na czystą',
      '<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#CFE8F2"/><stop offset="1" stop-color="#EAF5F7"/></linearGradient><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#2E8BA8"/><stop offset="1" stop-color="#0F4D63"/></linearGradient></defs>' +
      '<rect width="680" height="360" fill="url(#sky)"/><rect y="140" width="680" height="220" fill="url(#sea)"/>' +
      '<g stroke="#FFFFFF66" stroke-width="3" fill="none"><path d="M40 190q30-10 60 0t60 0"/><path d="M300 230q30-10 60 0t60 0"/><path d="M500 180q30-10 60 0t60 0"/><path d="M140 290q30-10 60 0t60 0"/><path d="M420 310q30-10 60 0t60 0"/></g>');
  }
  function oceanZoom() {
    var dots = '';
    var pts = [[80, 200, 6], [130, 250, 3], [200, 190, 4], [240, 300, 7], [310, 220, 3], [360, 270, 5], [420, 200, 4], [470, 320, 3], [520, 240, 6], [590, 290, 4], [620, 190, 3], [160, 330, 4], [280, 180, 5], [560, 170, 3]];
    pts.forEach(function (p, i) {
      dots += i % 3 === 0 ? '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + p[2] * 2 + '" height="' + p[2] + '" rx="1" fill="' + ['#F8C945', '#F06A55', '#FFFFFF'][i % 3] + '" transform="rotate(' + (i * 23) + ' ' + p[0] + ' ' + p[1] + ')"/>'
        : '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + ['#F8C945', '#F06A55', '#FFFFFF'][i % 3] + '"/>';
    });
    return svg('0 0 680 360', 'Umowne powiększenie tej samej wody z drobnymi fragmentami — ilustracja, nie pomiar',
      '<rect width="680" height="360" fill="#0F4D63"/><rect y="0" width="680" height="140" fill="#1B6781"/>' + dots +
      '<path d="M60 130q40-12 80 0t80 0" stroke="#FFFFFF55" stroke-width="3" fill="none"/>');
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
  function amphipod() {
    return svg('0 0 320 180', 'Schemat drobnego skorupiaka z głębin — rysunek objaśniający, nie fotografia z badania',
      '<rect width="320" height="180" rx="18" fill="#0A2C38"/>' +
      '<path d="M60 110C80 60 170 44 240 70C270 80 280 100 262 112C220 138 120 142 60 110Z" fill="#E8D9C0"/>' +
      '<path d="M100 72v48M140 62v62M180 60v64M220 66v54" stroke="#C9B89C" stroke-width="3"/>' +
      '<path d="M250 80c30-30 50-40 60-38M252 90c30-10 44-6 56 2" stroke="#E8D9C0" stroke-width="3" fill="none"/>' +
      '<path d="M80 124l-14 26M120 132l-8 30M170 134l0 30M210 130l10 28" stroke="#E8D9C0" stroke-width="3"/>' +
      '<path d="M110 100c30 6 70 6 110-4" stroke="' + RUST + '" stroke-width="3" stroke-dasharray="4 4" fill="none"/>');
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
  function moistureState(state) {
    var base = '<rect width="400" height="260" rx="18" fill="#EEF2E7"/><rect x="40" y="40" width="320" height="190" rx="8" fill="none" stroke="#7B5A36" stroke-width="6"/>';
    var pieces = '';
    var coords = [[70, 76], [140, 70], [210, 88], [280, 74], [90, 136], [170, 128], [240, 148], [290, 132], [64, 184], [140, 188], [215, 180], [284, 190]];
    coords.forEach(function (c, i) {
      pieces += '<rect x="' + c[0] + '" y="' + c[1] + '" width="' + (state === 'wet' ? 50 : 40) + '" height="' + (state === 'wet' ? 28 : 20) + '" rx="6" fill="' + (i % 2 ? '#B98B4E' : '#8FB25A') + '"/>';
    });
    var extra = '';
    if (state === 'dry') extra = '<g fill="#C9B38A" opacity=".9"><circle cx="130" cy="112" r="3"/><circle cx="210" cy="176" r="3"/><circle cx="290" cy="118" r="3"/></g><text x="200" y="30" text-anchor="middle" font-family="system-ui" font-size="18" fill="' + INK + '">Bardzo sucho</text>';
    if (state === 'moist') extra = '<g fill="#5B8FB0"><path d="M140 104c0 6-8 6-8 0l4-8z"/><path d="M250 172c0 6-8 6-8 0l4-8z"/><path d="M310 120c0 6-8 6-8 0l4-8z"/></g><g stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".9"><path d="M60 120c20-10 20 10 40 0"/><path d="M200 116c20-10 20 10 40 0"/></g><text x="200" y="30" text-anchor="middle" font-family="system-ui" font-size="18" fill="' + INK + '">Wilgotno</text>';
    if (state === 'wet') extra = '<rect x="44" y="120" width="312" height="106" fill="#5B8FB0" opacity=".55"/><text x="200" y="30" text-anchor="middle" font-family="system-ui" font-size="18" fill="' + INK + '">Zalane</text>';
    var orgs = state === 'dry' ? 2 : state === 'moist' ? 6 : 3;
    var dots = ''; for (var k = 0; k < orgs; k++) dots += '<circle class="organism" cx="' + (90 + k * 45) + '" cy="' + (110 + (k % 2) * 60) + '" r="5" fill="#F8C945"/>';
    return deco('0 0 400 260', base + pieces + extra + dots, 'moisture-' + state);
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
    return svg('0 0 400 240', 'Oddzielny pojemnik do wermikompostowania z dżdżownicami — schemat, inny niż ogrodowy kompostownik',
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
    'shoe-clean': function () { return shoe('clean', 'Sprawny but, czysty'); },
    'shoe-mud': function () { return shoe('mud', 'But X: materiał pokryty zaschniętym błotem (nakładka robocza)'); },
    'shoe-gap': function () { return shoe('gap', 'But Y: podeszwa miejscowo odchodzi przy nosku (nakładka robocza)'); },
    'process-prep': function () { return processFrame('prep'); },
    'process-repair': function () { return processFrame('repair'); },
    'process-check': function () { return processFrame('check'); },
    padA: function () { return pad('padA'); },
    padB: function () { return pad('padB'); },
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
