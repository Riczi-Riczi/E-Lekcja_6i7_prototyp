// Rozdział 4 — BIO do odbioru. Źródło: scenariusz 3.2 §7 (Z4-Z); pakiet 08 §1 i 02 §2 (identyfikatory, rozdzielenie woreczka, Z4-D1).
// Zasady wyłącznie z karty SELEKT [S9] w scenariuszu. Nie dopisujemy innych frakcji.
window.GOZ_Z4 = {
  id: 'Z4',
  items: {
    eggshells: { label: 'Skorupki jaj bez zawartości', art: 'eggshells', row: 'bio' },
    grounds: { label: 'Fusy po kawie i herbacie bez opakowań', art: 'grounds', row: 'bio' },
    bagWithPeelings: { label: 'Obierki warzyw w otwartym woreczku foliowym', art: 'bagWithPeelings', row: 'split' },
    bones: { label: 'Kości i ości po posiłku', art: 'bones', row: 'outside' },
    meat: { label: 'Resztki mięsa', art: 'meat', row: 'outside' },
    potatoesWithSauce: { label: 'Ugotowane ziemniaki z sosem pozostałe po posiłku', art: 'potatoesWithSauce', row: 'outside' },
    // Obiekty powstające po „Oddziel opakowanie” — nazwy ze scenariusza 3.2 (Z4-Z, klucz).
    peelings: { label: 'Obierki warzyw', art: 'peelings', row: 'bio' },
    bag: { label: 'Pusty woreczek foliowy', art: 'bag', row: 'outside' }
  },
  zones: [
    { id: 'bio', label: 'BIO', note: 'Brązowy pojemnik' },
    { id: 'outside', label: 'Poza BIO — dalsza segregacja', note: 'To nie jest pojemnik na odpady zmieszane.' }
  ],
  // Informacja zwrotna — scenariusz 3.2, Z4-Z (dosłownie; kropki końcowe i cudzysłowy „” w miejsce »« w zdaniu bez cudzysłowu zewnętrznego).
  messages: {
    bagTogether: 'Najpierw oddziel opakowanie. Potem umieść obierki i woreczek osobno.',
    bioOutside: 'Sprawdź kartę SELEKT: ten odpad jest w części „Do BIO”.',
    bagInBio: 'Woreczek foliowy jest opakowaniem. Nie wrzucaj go do BIO razem z obierkami.',
    notAllowed: 'Sprawdź kartę SELEKT: te resztki są w części „Poza BIO”.',
    goodBio: 'Ten odpad pasuje do części „Do BIO” na karcie SELEKT.',
    goodOutside: 'Ten odpad jest w części „Poza BIO”; wymaga dalszej segregacji.',
    // wykonawca — komunikaty obsługi rozdzielenia (scenariusz: „komunikat ogłasza powstanie obierek i pustego woreczka”).
    splitMissing: 'Przy woreczku z obierkami najpierw wybierz „Oddziel opakowanie”.',
    splitDone: 'Oddzielono opakowanie. Powstały dwie karty: „Obierki warzyw” i „Pusty woreczek foliowy”.'
  },
  // Z4-D1 — dosłowny komunikat po sprawdzeniu ze scenariusza; lokalne wskazanie dalszej drogi do potwierdzenia (localDisposalConfirmed=false).
  disposal: { localDisposalConfirmed: false, source: 'S18', items: ['bag', 'bones', 'meat', 'potatoesWithSauce'] },
  // wykonawca
  help: 'Korzystaj z karty zasad SELEKT. Przy woreczku z obierkami najpierw oddziel opakowanie.',
  guided: {
    bio: 'Znajdź ten odpad na karcie zasad. Zaznaczyliśmy wiersz „Do BIO w naszych przykładach”.',
    outside: 'Znajdź ten odpad na karcie zasad. Zaznaczyliśmy wiersz „Poza BIO w naszych przykładach”.',
    split: 'To obierki w opakowaniu. Zaznaczyliśmy przycisk „Oddziel opakowanie”. Wybierz go, a potem umieść osobno obierki i woreczek.'
  },
  catalogChecked: '13.09.2026'
};
