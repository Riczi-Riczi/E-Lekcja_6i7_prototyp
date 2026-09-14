// Dodatek M1 — memory 4 × 4 „Sytuacja i działanie”. Źródło: scenariusz 3.2 §9 (tabela M1). Bez litery, zegara i liczby prób.
window.GOZ_MEMORY = {
  pairs: [
    { id: 'P1', situation: 'Sprawna rzecz, nadal potrzebna właścicielowi', action: 'Używaj dalej — dbaj o to, co działa.', art: 'keep' },
    { id: 'P2', situation: 'Sprawna rzecz potrzebna innej osobie', action: 'Przekaż — produkt może służyć komuś innemu.', art: 'give' },
    { id: 'P3', situation: 'Usterka możliwa do bezpiecznej naprawy', action: 'Napraw — skorzystaj z właściwej pomocy.', art: 'fix' },
    { id: 'P4', situation: 'Dwie osoby potrzebujące gry planszowej', action: 'Korzystajcie wspólnie lub na zmianę.', art: 'game' },
    { id: 'P5', situation: 'Materiał odpadu gotowy do przetwarzania', action: 'Recykling — odzyskaj materiał w odpowiednim procesie.', art: 'material' },
    { id: 'P6', situation: 'Obierki przyniesione w opakowaniu', action: 'Oddziel opakowanie przed oddaniem do BIO.', art: 'peel-bag' },
    { id: 'P7', situation: 'Kompostownik bardzo mokry i zbity', action: 'Dodaj suchy materiał i rozluźnij.', art: 'wet' },
    { id: 'P8', situation: 'Sucha zawartość kompostownika', action: 'Umiarkowanie zwilż i przemieszaj.', art: 'dry' }
  ],
  // wykonawca — komunikaty obsługi gry
  messages: {
    start: 'Odkryj pierwszą kartę.',
    oneOpen: 'Odkryto: {c}. Odkryj drugą kartę.',
    match: 'Para! {s} — {a}',
    miss: 'To nie jest para. Zapamiętaj obie karty i wybierz „Zapamiętaj i zakryj”.',
    missOpen: 'To nie jest para. Wybierz „Odznacz karty” i spróbuj innej pary.',
    waitClose: 'Najpierw zakryj nietrafioną parę przyciskiem „Zapamiętaj i zakryj”.',
    done: 'Wszystkie osiem par odnalezione. To był dodatek — możesz wrócić do finału.',
    revealedOn: 'Karty są odkryte. Łącz sytuację z działaniem, wybierając dwie karty.',
    revealedOff: 'Karty są znów zakryte. Znalezione pary pozostają odkryte.'
  }
};
