// Most osadzenia modułu 3D w lekcji Eksperci GOZ (integracja 52, polecenie 55 §6). Protokół wersji 1:
// gotowosc → init → init-ok, blad, aktywnosc, reset, wysokosc; tylko kolorowanie: zmiana i zapis.
// Działa wyłącznie w ramce tej samej domeny (?embed=1, kanał i sesja od rodzica). Samodzielna strona działa jak dotąd.
// Każda wiadomość: kanał, wersja, sesja, źródło (window.parent) i origin (location.origin); wysyłka tylko do location.origin.
const MAX_BLAD = 40;
export function connectBridge(channel, api) {
  const q = new URLSearchParams(location.search), session = q.get('sesja');
  if (q.get('embed') !== '1' || q.get('kanal') !== channel || !/^[0-9a-f]{32}$/.test(session || '') || window.parent === window || location.protocol === 'file:') return null;
  const origin = location.origin;
  let valid = true, pendingInit = null, modelReady = false, failed = false, lastHeight = 0, heightTimer = 0, changeTimer = 0;
  const send = (typ, dane = null) => { if (valid) window.parent.postMessage({ kanal: channel, wersja: 1, sesja: session, typ, dane }, origin); };

  // Wysokość treści (bez zależności od wysokości samej ramki): ciało dokumentu z marginesami, wysyłana po ustaleniu układu.
  function measure() {
    heightTimer = 0;
    const b = document.body, cs = getComputedStyle(b);
    const h = Math.ceil(b.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom));
    if (h > 0 && Math.abs(h - lastHeight) >= 1) { lastHeight = h; send('wysokosc', { px: h }); }
  }
  const scheduleHeight = () => { clearTimeout(heightTimer); heightTimer = setTimeout(measure, 150); };
  new ResizeObserver(scheduleHeight).observe(document.body);

  function applyInit() {
    if (!pendingInit || !modelReady || failed) return;
    const d = pendingInit; pendingInit = null;
    api.setReduced?.(d.ograniczRuch);
    if (api.importDesign && d.projekt) api.importDesign(d.projekt);
    send('init-ok');
    scheduleHeight();
  }

  addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== origin) return;
    const m = e.data;
    if (!m || typeof m !== 'object' || m.kanal !== channel || m.wersja !== 1 || m.sesja !== session || typeof m.typ !== 'string' || !valid) return;
    const dane = m.dane && typeof m.dane === 'object' && !Array.isArray(m.dane) ? m.dane : {};
    if (m.typ === 'init') { pendingInit = { projekt: dane.projekt || null, ograniczRuch: dane.ograniczRuch === true }; applyInit(); }
    else if (m.typ === 'aktywnosc') { if (typeof dane.ograniczRuch === 'boolean') api.setReduced?.(dane.ograniczRuch); if (dane.aktywny === true) api.resume(); else api.pause(); }
    else if (m.typ === 'zapis' && api.exportDesign && modelReady && !failed) { clearTimeout(changeTimer); changeTimer = 0; send('zapis', { projekt: api.exportDesign() }); }
    else if (m.typ === 'reset') { api.pause(); clearTimeout(changeTimer); clearTimeout(heightTimer); valid = false; }
  });
  send('gotowosc');

  return {
    modelReady() { modelReady = true; applyInit(); },
    fail(powod) { if (failed) return; failed = true; clearTimeout(changeTimer); send('blad', { powod: String(powod).slice(0, MAX_BLAD) }); },
    // Zmiany projektu zbierane przez 300 ms: jeden komunikat po serii ruchów suwaka lub pipety.
    changed() {
      if (!api.exportDesign || failed) return;
      clearTimeout(changeTimer);
      changeTimer = setTimeout(() => { changeTimer = 0; send('zmiana', { projekt: api.exportDesign() }); }, 300);
    }
  };
}
