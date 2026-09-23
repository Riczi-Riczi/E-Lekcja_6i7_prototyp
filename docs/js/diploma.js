// Dyplom K02: imię tylko w pamięci bieżącej strony, animowana karta, lokalny PDF (jsPDF + Noto Sans) i osobny druk.
// Specyfikacja: scenariusz 3.2 §10 (K02), pakiet 02 §4, 01 §5 (animacja 3–4 s, przy ograniczonym ruchu od razu gotowy podgląd).
// Biblioteka i fonty ładują się dopiero po wybraniu „Pobierz PDF”, z katalogu vendor/ tej strony (bez CDN).
(function () {
  'use strict';
  var F = window.GOZ_FINALE.diploma;
  var $ = function (id) { return document.getElementById(id); };
  var reduced = function () { return false; };
  var currentName = null; // null — dyplom nieprzygotowany; '' — dyplom bez imienia
  var animTimer = null, libPromise = null, assetsPromise = null;
  var ANIM_MS = 3500;

  function chars(s) { return Array.from(s).length; }
  function normalize(raw) { return String(raw || '').replace(/\s+/g, ' ').trim(); }

  function msg(text) { var m = $('diploma-msg'); m.hidden = !text; m.textContent = text || ''; }
  function pdfStatus(text) { var m = $('diploma-pdf-status'); m.hidden = !text; m.textContent = text || ''; }

  // Długie imię: najwyżej dwa wiersze, czcionka zmniejszana do czytelnego minimum.
  function fitName() {
    var node = $('diploma-card-name');
    if (node.hidden) return;
    node.style.fontSize = '';
    var size = parseFloat(getComputedStyle(node).fontSize) || 40;
    var min = Math.max(16, size * 0.45);
    var line = function () { return parseFloat(getComputedStyle(node).lineHeight) || size * 1.15; };
    for (var i = 0; i < 40 && node.scrollHeight > line() * 2 + 2 && size > min; i++) {
      size -= 1.5;
      node.style.fontSize = size + 'px';
    }
  }

  function showCard(name) {
    currentName = name;
    var nameNode = $('diploma-card-name');
    nameNode.textContent = name;
    nameNode.hidden = name === '';
    $('diploma-card-label').textContent = (name ? 'Dyplom dla: ' + name + '. ' : 'Dyplom bez imienia. ') + F.body.charAt(0).toUpperCase() + F.body.slice(1) + ' ' + F.motto + ' ' + F.draftMark + '.';
    $('diploma-stage').hidden = false;
    pdfStatus('');
    var card = $('diploma-card');
    card.classList.remove('is-unfolding', 'is-ready');
    fitName();
    if (animTimer) { clearTimeout(animTimer); animTimer = null; }
    if (reduced()) { finishAnimation(); return; }
    $('diploma-actions').hidden = true;
    $('diploma-skip').hidden = false;
    void card.offsetWidth;
    card.classList.add('is-unfolding');
    msg('Przygotowujemy dyplom…');
    animTimer = setTimeout(finishAnimation, ANIM_MS);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function finishAnimation() {
    if (animTimer) { clearTimeout(animTimer); animTimer = null; }
    var card = $('diploma-card');
    card.classList.remove('is-unfolding');
    card.classList.add('is-ready');
    $('diploma-skip').hidden = true;
    $('diploma-actions').hidden = false;
    fitName();
    msg(F.messages.ready);
    var focusInForm = document.activeElement && ($('diploma-form').contains(document.activeElement) || document.activeElement === $('diploma-skip') || document.activeElement === document.body);
    if (focusInForm) $('diploma-pdf').focus({ preventScroll: true });
  }

  // --- PDF ---------------------------------------------------------------------------------

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = function () { reject(new Error('Nie wczytano ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadLib() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (!libPromise) libPromise = loadScript('vendor/jspdf.umd.min.js').then(function () {
      if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Brak jsPDF');
      return window.jspdf.jsPDF;
    }).catch(function (e) { libPromise = null; throw e; });
    return libPromise;
  }
  function toBase64(buffer) {
    var bytes = new Uint8Array(buffer), out = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) out += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    return btoa(out);
  }
  function fetchBinary(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ': ' + r.status); return r.arrayBuffer(); });
  }
  function logoPng() {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas');
        c.width = 440; c.height = 440;
        c.getContext('2d').drawImage(img, 0, 0, 440, 440);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = function () { reject(new Error('Nie wczytano logo')); };
      img.src = 'assets/logos/selekt-logo.webp';
    });
  }
  function loadAssets() {
    if (!assetsPromise) assetsPromise = Promise.all([
      fetchBinary('vendor/fonts/NotoSans-Regular.ttf').then(toBase64),
      fetchBinary('vendor/fonts/NotoSans-Bold.ttf').then(toBase64),
      logoPng()
    ]).then(function (r) { return { regular: r[0], bold: r[1], logo: r[2] }; }).catch(function (e) { assetsPromise = null; throw e; });
    return assetsPromise;
  }

  // A4 poziomo 297 × 210 mm, marginesy bezpieczne 12 mm. Tekst wektorowy z osadzonym fontem Noto Sans; logo jako raster.
  function build(name) {
    return Promise.all([loadLib(), loadAssets()]).then(function (res) {
      var JsPDF = res[0], A = res[1];
      var doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: false });
      doc.addFileToVFS('NotoSans-Regular.ttf', A.regular);
      doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
      doc.addFileToVFS('NotoSans-Bold.ttf', A.bold);
      doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
      doc.setProperties({ title: 'Dyplom - Eksperci GOZ (wersja robocza)', subject: 'Pamiątka ukończenia e-lekcji', creator: 'Eksperci GOZ - wersja robocza' });
      var W = 297, H = 210, M = 12, cx = W / 2;
      var ink = [18, 62, 52], sage = [57, 115, 84];

      doc.setFillColor(245, 247, 240); doc.rect(0, 0, W, H, 'F');
      doc.setDrawColor(ink[0], ink[1], ink[2]); doc.setLineWidth(0.8);
      doc.roundedRect(M, M, W - 2 * M, H - 2 * M, 4, 4, 'S');
      doc.setDrawColor(188, 203, 177); doc.setLineWidth(0.4);
      doc.roundedRect(M + 3, M + 3, W - 2 * M - 6, H - 2 * M - 6, 3, 3, 'S');

      // Znak wodny wersji roboczej (B-01): brak oryginalnych oznaczeń funduszu.
      if (doc.GState) { doc.setGState(new doc.GState({ opacity: 0.1 })); }
      doc.setFont('NotoSans', 'bold'); doc.setFontSize(64); doc.setTextColor(113, 61, 34);
      doc.text(F.draftMark, cx, 142, { align: 'center', angle: 18 });
      if (doc.GState) { doc.setGState(new doc.GState({ opacity: 1 })); }

      doc.addImage(A.logo, 'PNG', M + 10, M + 9, 30, 30);
      // Stały obszar oryginalnych oznaczeń i formuły dofinansowania — w wersji roboczej jawny opis braku.
      doc.setDrawColor(180, 138, 98); doc.setLineWidth(0.5);
      if (doc.setLineDashPattern) doc.setLineDashPattern([2, 1.5], 0);
      doc.roundedRect(W - M - 10 - 110, M + 9, 110, 30, 2, 2, 'S');
      if (doc.setLineDashPattern) doc.setLineDashPattern([], 0);
      doc.setTextColor(113, 61, 34);
      doc.setFont('NotoSans', 'bold'); doc.setFontSize(10);
      doc.text(F.draftMark, W - M - 10 - 105, M + 17);
      doc.setFont('NotoSans', 'normal'); doc.setFontSize(9);
      doc.text(doc.splitTextToSize(F.fundingPlaceholder, 100), W - M - 10 - 105, M + 23);

      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFont('NotoSans', 'bold'); doc.setFontSize(46);
      doc.text(F.title, cx, 78, { align: 'center' });

      var y = 100;
      if (name) {
        // Imię: maks. dwa wiersze szerokości 230 mm; zmniejszanie czcionki do 16 pt.
        var size = 34, lines;
        doc.setFont('NotoSans', 'bold');
        for (;;) {
          doc.setFontSize(size);
          lines = doc.splitTextToSize(name, 230);
          if ((lines.length <= 1 || (lines.length <= 2 && size <= 26)) || size <= 16) break;
          size -= 2;
        }
        if (lines.length > 2) lines = [lines[0], lines.slice(1).join(' ')];
        doc.setTextColor(sage[0], sage[1], sage[2]);
        var lh = size * 0.4233 * 1.2;
        lines.forEach(function (ln, i) { doc.text(ln, cx, y + i * lh, { align: 'center' }); });
        y += (lines.length - 1) * lh + 16;
      } else {
        y = 96;
      }
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.setFont('NotoSans', 'normal'); doc.setFontSize(15);
      var body = doc.splitTextToSize(F.body, 210);
      body.forEach(function (ln, i) { doc.text(ln, cx, y + i * 7.4, { align: 'center' }); });
      y += body.length * 7.4 + 8;
      doc.setFont('NotoSans', 'bold'); doc.setFontSize(18); doc.setTextColor(sage[0], sage[1], sage[2]);
      doc.text(F.motto, cx, y, { align: 'center' });

      // Pieczęć „Eksperci GOZ”.
      doc.setDrawColor(ink[0], ink[1], ink[2]); doc.setLineWidth(0.9); doc.setFillColor(217, 242, 148);
      doc.circle(W - M - 36, H - M - 40, 17, 'FD');
      doc.setFont('NotoSans', 'bold'); doc.setFontSize(9); doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.text('Eksperci', W - M - 36, H - M - 41, { align: 'center' });
      doc.text('GOZ', W - M - 36, H - M - 36.5, { align: 'center' });

      doc.setFont('NotoSans', 'normal'); doc.setFontSize(8.5); doc.setTextColor(78, 101, 88);
      doc.text(F.footer, M + 10, H - M - 12);
      doc.text(F.draftMark + ' - dyplom nie zawiera jeszcze oryginalnych oznaczeń funduszu.', M + 10, H - M - 7.5);
      return doc;
    });
  }

  function downloadPdf() {
    var btn = $('diploma-pdf');
    btn.disabled = true;
    pdfStatus(F.messages.preparing);
    return build(currentName || '').then(function (doc) {
      doc.save(F.fileName);
      pdfStatus(F.messages.pdfDone);
    }).catch(function (e) {
      if (window.console) console.warn('PDF:', e && e.message);
      pdfStatus(F.messages.pdfError);
    }).then(function () { btn.disabled = false; });
  }

  function print() {
    var root = document.documentElement;
    root.classList.add('print-diploma');
    var done = function () { root.classList.remove('print-diploma'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000);
  }

  window.GOZDiploma = {
    init: function (options) {
      reduced = options.reducedMotion;
      var input = $('diploma-name');
      input.addEventListener('input', function () {
        var n = normalize(input.value);
        $('diploma-preview').textContent = n || '-';
        if (chars(n) > F.nameMax) msg(F.messages.tooLong); else if ($('diploma-msg').textContent === F.messages.tooLong) msg('');
      });
      $('diploma-make').addEventListener('click', function () {
        var n = normalize(input.value);
        if (!n) { msg(F.messages.needName); input.focus(); return; }
        if (chars(n) > F.nameMax) { msg(F.messages.tooLong); input.focus(); return; }
        showCard(n);
      });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('diploma-make').click(); } });
      $('diploma-noname').addEventListener('click', function () { showCard(''); });
      $('diploma-skip').addEventListener('click', finishAnimation);
      $('diploma-pdf').addEventListener('click', downloadPdf);
      $('diploma-print').addEventListener('click', print);
      $('diploma-edit').addEventListener('click', function () {
        $('diploma-stage').hidden = true;
        msg('');
        input.focus();
        input.select();
      });
      window.addEventListener('resize', function () { if (!$('diploma-stage').hidden) fitName(); });
    },
    reset: function () {
      if (animTimer) { clearTimeout(animTimer); animTimer = null; }
      currentName = null;
      $('diploma-name').value = '';
      $('diploma-preview').textContent = '-';
      $('diploma-card-name').textContent = '';
      $('diploma-stage').hidden = true;
      msg(''); pdfStatus('');
    },
    // Do testów: budowa dokumentu bez zapisu pliku.
    buildPdf: function (name) { return build(normalize(name)).then(function (doc) { return doc.output('arraybuffer'); }); },
    currentName: function () { return currentName; },
    finishAnimation: finishAnimation
  };
})();
