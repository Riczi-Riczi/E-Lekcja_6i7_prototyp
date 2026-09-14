// Rozdział 6 — słowa, które pomagają działać. Źródło: scenariusz 3.2 §9 (Z6-T1, Z6-Z1, Z6-Z2, Z6-W); pakiet 00 (redakcja S1) i 02 §2.
window.GOZ_Z6 = {
  id: 'Z6',
  // Plansza ze scenariusza, wiersze od góry. Bez losowania nowej planszy.
  grid: ['DRCKOMPOST', 'BZEKYDRUKM', 'ISICOBIEGL', 'ODUEYKIYOY', 'OLIRLKNWHW', 'DRZNOELSWG', 'PYFEKWNIGP', 'AOENUMCINT', 'DLAFPUBEEG', 'YNAPRAWAIF'],
  // Klucz dla wykonawcy: wiersz i kolumna liczone od 1, jak w tabeli scenariusza.
  words: [
    { word: 'NAPRAWA', start: [10, 2], end: [10, 8] },
    { word: 'OBIEG', start: [3, 5], end: [3, 9] },
    { word: 'SUROWCE', start: [3, 2], end: [9, 8] },
    { word: 'RECYKLING', start: [1, 2], end: [9, 10] },
    { word: 'KOMPOST', start: [1, 4], end: [1, 10] },
    { word: 'BIOODPADY', start: [2, 1], end: [10, 1] },
    { word: 'DZIELENIE', start: [1, 1], end: [9, 9] }
  ],
  // Krótkie znaczenia po odnalezieniu — zdania z Z6-T1 (bez innych pojęć). Rozdzielenie ostatniego zdania T1 na dwa hasła: wykonawca.
  dictionary: {
    NAPRAWA: { name: 'Naprawa', text: 'Naprawa przywraca sprawność.', art: 'repair' },
    DZIELENIE: { name: 'Dzielenie się', text: 'Dzielenie się pozwala korzystać z rzeczy wspólnie lub na zmianę.', art: 'share' },
    SUROWCE: { name: 'Surowce', text: 'Surowce służą do wytwarzania materiałów i produktów.', art: 'raw' },
    RECYKLING: { name: 'Recykling', text: 'Recykling dotyczy przetwarzania materiału odpadu.', art: 'recycle' },
    OBIEG: { name: 'Obieg', text: 'Obieg przypomina, że materiały mogą mieć dalszą drogę.', art: 'cycle' },
    BIOODPADY: { name: 'Bioodpady', text: 'Bioodpady wymagają właściwego przygotowania.', art: 'bio' },
    KOMPOST: { name: 'Kompost', text: 'Kompost powstaje w procesie przetwarzania materii organicznej.', art: 'compost' }
  },
  dictionaryOrder: ['NAPRAWA', 'DZIELENIE', 'SUROWCE', 'RECYKLING', 'OBIEG', 'BIOODPADY', 'KOMPOST'],
  // Z6-Z2: sytuacje i wyjaśnienia ze scenariusza; S1 w brzmieniu z pakietu 00.
  meanings: [
    { id: 'S1', audio: 'z6_meaning_1', text: 'W hulajnodze wymieniono zużyty element i przywrócono jej sprawność.', explanation: 'Zachowano rzecz i przywrócono jej sprawność.' },
    { id: 'S2', audio: 'z6_meaning_2', text: 'Zużyty materiał został przetworzony, aby powstał z niego materiał do dalszego wykorzystania.', explanation: 'Chodzi o materiał odpadu, nie tylko zmianę właściciela rzeczy.' },
    { id: 'S3', audio: 'z6_meaning_3', text: 'Dwie osoby korzystają na zmianę z jednej gry planszowej.', explanation: 'Potrzeba może być zaspokojona wspólnym korzystaniem.' }
  ],
  messages: {
    notWord: 'W tym zaznaczeniu nie ma słowa z listy. Spróbuj jeszcze raz.',
    // wykonawca — komunikaty obsługi siatki i pomocy
    alreadyFound: 'To słowo jest już znalezione. Szukaj pozostałych.',
    start: 'Zaznaczono początek: wiersz {r}, kolumna {c}, litera {l}. Teraz wskaż ostatnią literę słowa.',
    cancel: 'Anulowano zaznaczenie.',
    found: 'Znaleziono słowo {w}. {d}',
    allFound: 'Wszystkie siedem słów znalezione. Przejdź do znaczeń.',
    revealed: 'Słowa zostały odsłonięte. Możesz przejść do znaczeń.',
    hintStart: 'Słowo {w} zaczyna się w wierszu {r}, kolumnie {c}. Zaznaczyliśmy tę literę.',
    meaningError: '{d} Sprawdź, czy to pasuje do opisanej sytuacji.'
  },
  help: 'Szukaj pierwszej litery słowa. Potem sprawdź litery w prawo, w dół i ukośnie w dół w prawo.',
  meaningsHelp: 'Zastanów się, co zachowano: całą rzecz, materiał czy możliwość korzystania z rzeczy przez kilka osób.'
};
