// Robocze schematy SVG wykonawcy (03_ZASOBY_I_BRAKI.md: „autorskie czytelne schematy SVG”).
// Nie przedstawiają składu materiałowego ani instrukcji naprawy. Finalne ilustracje mogą je zastąpić w tych samych miejscach.
(function () {
  'use strict';
  var INK = '#123E34', LIME = '#D9F294', SAGE = '#9FB594', SAND = '#E7DCC4', PAPER = '#F5F7F0', RUST = '#B4603A';
  var uid = 0;

  function svg(viewBox, label, body) {
    return '<svg class="art-svg" viewBox="' + viewBox + '" role="img" aria-label="' + label + '" focusable="false">' + body + '</svg>';
  }

  // Uproszczona geometria hulajnogi z zaakceptowanego wzorca Z1.
  function scooterGeometry(stroke, fill) {
    return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="127" cy="294" r="40" fill="' + fill + '" stroke="' + stroke + '" stroke-width="6"/><circle cx="127" cy="294" r="12" fill="' + stroke + '"/>' +
      '<circle cx="477" cy="294" r="44" fill="' + fill + '" stroke="' + stroke + '" stroke-width="6"/><circle cx="477" cy="294" r="13" fill="' + stroke + '"/>' +
      '<path d="M139 272L344 264L363 276L149 291Z" fill="' + stroke + '" stroke="' + stroke + '" stroke-width="3"/>' +
      '<path d="M146 286H359Q381 286 397 263L452 188" stroke="' + stroke + '" stroke-width="12"/>' +
      '<path d="M477 291L416 63" stroke="' + stroke + '" stroke-width="12"/>' +
      '<path d="M376 60L465 43" stroke="' + stroke + '" stroke-width="12"/></g>';
  }

  var arts = {
    // 1. Surowce: umowne bryły i warstwy, bez przypisywania konkretnych materiałów.
    raw: function () {
      return svg('0 0 600 420', 'Schemat: surowce przed wytworzeniem materiałów',
        '<rect width="600" height="420" rx="28" fill="#1E4A3D"/>' +
        '<path d="M0 330Q150 300 300 322T600 310V420H0Z" fill="#2B5A4A"/>' +
        '<path d="M70 318L120 238L180 262L220 318Z" fill="' + SAGE + '"/><path d="M120 238L150 290L180 262" fill="none" stroke="#DCE6CF" stroke-width="3"/>' +
        '<path d="M250 322L292 204L352 232L392 322Z" fill="' + SAND + '"/><path d="M292 204L318 270L352 232" fill="none" stroke="#FFF7E6" stroke-width="3"/>' +
        '<g fill="' + LIME + '"><circle cx="455" cy="296" r="26"/><circle cx="498" cy="306" r="18"/><circle cx="476" cy="262" r="16"/></g>' +
        '<path d="M60 120H540" stroke="#FFFFFF33" stroke-width="2" stroke-dasharray="6 10"/>' +
        '<path d="M300 150v40m-14-14 14 14 14-14" stroke="' + LIME + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<rect x="232" y="84" width="136" height="44" rx="22" fill="none" stroke="' + LIME + '" stroke-width="3"/>' +
        '<g fill="' + LIME + '"><rect x="254" y="100" width="22" height="12" rx="3"/><rect x="289" y="100" width="22" height="12" rx="3"/><rect x="324" y="100" width="22" height="12" rx="3"/></g>');
    },
    // 2. Materiały i części: rozłożona hulajnoga.
    parts: function () {
      return svg('0 0 600 420', 'Schemat: osobne części hulajnogi — koła, podest, kolumna kierownicy',
        '<rect width="600" height="420" rx="28" fill="#1E4A3D"/>' +
        '<g stroke="' + LIME + '" stroke-dasharray="5 9" stroke-width="2" fill="none"><path d="M150 300L230 260M450 300L380 260M420 120L360 200"/></g>' +
        '<g transform="translate(40 40)"><circle cx="90" cy="280" r="46" fill="#2B5A4A" stroke="' + PAPER + '" stroke-width="8"/><circle cx="90" cy="280" r="14" fill="' + PAPER + '"/></g>' +
        '<g transform="translate(380 40)"><circle cx="90" cy="280" r="50" fill="#2B5A4A" stroke="' + PAPER + '" stroke-width="8"/><circle cx="90" cy="280" r="15" fill="' + PAPER + '"/></g>' +
        '<path d="M190 236L402 228L420 242L200 252Z" fill="' + SAGE + '" stroke="' + PAPER + '" stroke-width="3"/>' +
        '<path d="M430 180L380 40" stroke="' + PAPER + '" stroke-width="14" stroke-linecap="round"/>' +
        '<path d="M330 44L430 26" stroke="' + SAND + '" stroke-width="14" stroke-linecap="round"/>' +
        '<circle cx="250" cy="120" r="10" fill="' + LIME + '"/><circle cx="280" cy="140" r="7" fill="' + LIME + '"/><rect x="200" y="96" width="24" height="12" rx="4" fill="' + LIME + '"/>');
    },
    // 5. Dalsza droga: trzy odnogi (szczegóły w przyciskach rozgałęzień).
    paths: function () {
      return svg('0 0 600 420', 'Schemat: jedna hulajnoga i trzy możliwe dalsze drogi',
        '<rect width="600" height="420" rx="28" fill="#1E4A3D"/>' +
        '<g transform="translate(40 120) scale(.42)">' + scooterGeometry(PAPER, '#2B5A4A') + '</g>' +
        '<g stroke="' + LIME + '" stroke-width="4" fill="none" stroke-linecap="round"><path d="M270 230C330 230 340 110 420 110"/><path d="M270 230H420"/><path d="M270 230C330 230 340 350 420 350"/>' +
        '<path d="M406 98l14 12-14 12M406 218l14 12-14 12M406 338l14 12-14 12"/></g>' +
        '<g fill="' + PAPER + '"><circle cx="470" cy="96" r="14"/><path d="M450 140q20-34 40 0z"/>' +
        '<circle cx="470" cy="230" r="26" fill="none" stroke="' + PAPER + '" stroke-width="7"/><path d="M492 208l24-24" stroke="' + SAND + '" stroke-width="9" stroke-linecap="round"/>' +
        '<rect x="448" y="336" width="18" height="18" rx="3" fill="' + SAGE + '"/><rect x="472" y="336" width="18" height="18" rx="3" fill="' + SAND + '"/><rect x="460" y="314" width="18" height="18" rx="3" fill="' + LIME + '"/></g>');
    },
    'branch-reuse': function () {
      return svg('0 0 240 150', 'Kolejny użytkownik tej samej hulajnogi',
        '<rect width="240" height="150" rx="18" fill="#E9F0DE"/>' +
        '<g fill="' + INK + '"><circle cx="46" cy="52" r="14"/><path d="M24 104q22-50 44 0z"/><circle cx="194" cy="60" r="11"/><path d="M177 104q17-40 34 0z"/></g>' +
        '<path d="M86 80H152m-12-12 12 12-12 12" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<g transform="translate(78 92) scale(.16)">' + scooterGeometry(INK, '#E9F0DE') + '</g>');
    },
    'branch-service': function () {
      return svg('0 0 240 150', 'Wymiana koła w serwisie',
        '<rect width="240" height="150" rx="18" fill="#E9F0DE"/>' +
        '<circle cx="96" cy="84" r="40" fill="none" stroke="' + INK + '" stroke-width="10"/><circle cx="96" cy="84" r="12" fill="' + INK + '"/>' +
        '<path d="M140 110l52-52" stroke="' + RUST + '" stroke-width="12" stroke-linecap="round"/><circle cx="196" cy="54" r="14" fill="none" stroke="' + RUST + '" stroke-width="8"/>' +
        '<path d="M30 132h60" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M40 124l8 8 14-16" stroke="#37A46B" stroke-width="5" fill="none" stroke-linecap="round"/>');
    },
    'branch-materials': function () {
      return svg('0 0 240 150', 'Materiały po zbiórce kierowane do przetwarzania',
        '<rect width="240" height="150" rx="18" fill="#E9F0DE"/>' +
        '<g transform="translate(8 38) scale(.2)">' + scooterGeometry('#7C8F80', '#E9F0DE') + '</g>' +
        '<path d="M132 76h28m-10-10 10 10-10 10" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<g><rect x="172" y="84" width="22" height="22" rx="4" fill="' + SAGE + '"/><rect x="198" y="84" width="22" height="22" rx="4" fill="' + SAND + '"/><rect x="185" y="58" width="22" height="22" rx="4" fill="#B8DE45"/></g>' +
        '<path d="M172 120h48" stroke="#7C8F80" stroke-width="3" stroke-dasharray="4 5"/>');
    },
    // Przykład z książką: ponowne użycie i recykling.
    'book-reuse': function () {
      return svg('0 0 420 260', 'Książka przekazana kolejnej osobie',
        '<rect width="420" height="260" rx="22" fill="#FFFFFF"/>' +
        '<g transform="translate(50 70)"><rect width="110" height="140" rx="8" fill="' + INK + '"/><rect x="10" y="10" width="90" height="120" rx="4" fill="#2B5A4A"/><path d="M26 40h58M26 58h40" stroke="' + LIME + '" stroke-width="6" stroke-linecap="round"/></g>' +
        '<path d="M186 140H250m-14-14 14 14-14 14" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<g fill="' + INK + '"><circle cx="320" cy="92" r="26"/><path d="M270 214q50-110 100 0z"/></g>' +
        '<g transform="translate(296 150) rotate(-8)"><rect width="52" height="66" rx="5" fill="#2B5A4A" stroke="' + LIME + '" stroke-width="3"/></g>');
    },
    'book-recycle': function () {
      return svg('0 0 420 260', 'Zużyty papier przetwarzany na materiał',
        '<rect width="420" height="260" rx="22" fill="#FFFFFF"/>' +
        '<g transform="translate(40 88)"><rect width="120" height="18" rx="4" fill="' + SAND + '"/><rect y="26" width="120" height="18" rx="4" fill="#D8CBAE"/><rect y="52" width="120" height="18" rx="4" fill="' + SAND + '"/><path d="M8 96h104" stroke="#9C8F74" stroke-width="3" stroke-dasharray="6 6"/></g>' +
        '<path d="M186 130H250m-14-14 14 14-14 14" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<g transform="translate(272 70)"><path d="M0 130V50L34 30V50L68 30V50L102 30V130Z" fill="#7C8F80"/><rect x="16" y="76" width="18" height="18" fill="' + PAPER + '"/><rect x="54" y="76" width="18" height="18" fill="' + PAPER + '"/><path d="M78 30V0h16v38" fill="#5E7263"/></g>' +
        '<g transform="translate(290 210)"><rect width="64" height="12" rx="3" fill="' + LIME + '"/></g>');
    },
    // Wspólna gra planszowa (Z1-T2, dzielenie się).
    game: function () {
      return svg('0 0 320 200', 'Jedna gra planszowa, z której korzystają na zmianę różne osoby',
        '<rect width="320" height="200" rx="20" fill="#2B5A4A"/>' +
        '<g transform="translate(96 60)"><rect width="128" height="96" rx="8" fill="' + PAPER + '"/><path d="M0 32H128M0 64H128M42 0V96M86 0V96" stroke="' + SAGE + '" stroke-width="3"/><circle cx="21" cy="16" r="8" fill="' + RUST + '"/><circle cx="106" cy="80" r="8" fill="' + INK + '"/><rect x="58" y="42" width="12" height="12" rx="2" fill="#F8C945"/></g>' +
        '<g fill="' + LIME + '"><circle cx="46" cy="72" r="16"/><path d="M20 150q26-60 52 0z"/><circle cx="274" cy="72" r="16"/><path d="M248 150q26-60 52 0z"/></g>' +
        '<path d="M100 178c40 16 80 16 120 0m-12-8 12 8-12 8" stroke="' + LIME + '" stroke-width="4" fill="none" stroke-linecap="round"/>');
    },
    // Otwarcie lekcji: sneaker i liść jako zapowiedź tematów (hulajnoga to osobny obraz).
    sneaker: function () {
      return svg('0 0 300 160', 'Sneaker — zapowiedź rozdziału o warsztacie',
        '<path d="M20 112C20 84 46 70 70 66L118 40C132 32 150 36 158 50L176 78C196 82 252 88 268 104C282 118 280 132 262 134H34C24 134 20 124 20 112Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="5"/>' +
        '<path d="M20 124H280" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M96 70l16 22M116 58l16 22M136 50l14 20" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M186 96h52" stroke="#37A46B" stroke-width="8" stroke-linecap="round"/>');
    },
    leaf: function () {
      return svg('0 0 160 160', 'Liść — zapowiedź rozdziałów o bioodpadach i kompostowaniu',
        '<path d="M28 132C18 70 60 20 138 22C142 98 98 142 28 132Z" fill="#37A46B"/><path d="M30 130C62 96 90 70 124 38" stroke="' + LIME + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M62 98l-4-26M86 76l-2-24M70 90l26 2M94 68l24 2" stroke="' + LIME + '" stroke-width="3" stroke-linecap="round"/>');
    },
    wave: function () {
      return svg('0 0 400 60', 'Woda — zapowiedź przystanku oceanicznego',
        '<path d="M0 30Q50 5 100 30T200 30T300 30T400 30" stroke="#38BDF8" stroke-width="6" fill="none"/><path d="M0 48Q50 23 100 48T200 48T300 48T400 48" stroke="#38BDF866" stroke-width="4" fill="none"/>');
    }
  };

  window.GOZArt = {
    render: function (name) { return arts[name] ? arts[name]() : ''; },
    mountAll: function (root) {
      Array.prototype.forEach.call((root || document).querySelectorAll('[data-art]'), function (node) {
        if (!node.dataset.artMounted) { node.innerHTML = arts[node.dataset.art] ? arts[node.dataset.art]() : ''; node.dataset.artMounted = '1'; }
      });
    }
  };
})();
