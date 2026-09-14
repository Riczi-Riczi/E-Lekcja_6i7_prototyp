// Film finałowy, własny krok, dyplom i zakończenie. Źródło: scenariusz 3.2 §10 (F02, K01, K02); pakiet 02 §4 i 01 §1. K00: 12_FINAL_KARTY_SPECYFIKACJA.md.
window.GOZ_FINALE = {
  // Teksty kart i odsłaniania (K00): data/finale-cards.js, eksport finale_texts.json — nie powtarzać ich tutaj.
  // F02: statyczny skrót końcowy ze scenariusza.
  summary: ['Zachowuj użyteczność rzeczy.', 'Rozróżniaj naprawę i recykling.', 'Stosuj lokalne zasady BIO.', 'Dbaj o warunki kompostowania.'],
  steps: [
    { id: 'give', text: 'Sprawdzę, czy nieużywana rzecz może przydać się komuś innemu.' },
    { id: 'repair', text: 'Porozmawiam z dorosłym o możliwości naprawy.' },
    { id: 'rules', text: 'Sprawdzę zasady odbioru jednego odpadu.' },
    { id: 'compost', text: 'Jeśli mamy kompostownik, przyjrzę się jego warunkom.' }
  ],
  ideaMax: 140,
  diploma: {
    title: 'DYPLOM',
    body: 'za ukończenie e-lekcji „Eksperci GOZ” i poznanie sposobów na dłuższe korzystanie z rzeczy oraz odpowiedzialne gospodarowanie materiałami i bioodpadami.',
    motto: 'Rzeczy mają dalszy ciąg.',
    seal: 'Eksperci GOZ',
    nameMax: 40,
    fileName: 'dyplom-eksperci-goz.pdf',
    // Wersja robocza: brak oryginalnego znaku WFOŚiGW i zatwierdzonej formuły (B-01). Nie wpisujemy wymyślonych oznaczeń.
    draftMark: 'WERSJA ROBOCZA',
    fundingPlaceholder: 'Miejsce na oryginalny znak WFOŚiGW w Poznaniu i zatwierdzoną formułę dofinansowania.',
    footer: 'E-lekcja dla Związku Międzygminnego Centrum Zagospodarowania Odpadów SELEKT w Czempiniu.',
    messages: {
      needName: 'Wpisz imię albo wybierz „Dyplom bez imienia”.',
      tooLong: 'Imię może mieć najwyżej 40 znaków.',
      preparing: 'Przygotowujemy plik PDF…',
      pdfDone: 'Plik dyplom-eksperci-goz.pdf został przygotowany. Sprawdź pobrane pliki.',
      pdfError: 'Nie udało się przygotować pliku. Spróbuj ponownie lub wybierz Drukuj i zapisz jako PDF',
      ready: 'Dyplom jest gotowy. Możesz pobrać PDF, wydrukować go albo poprawić imię.'
    }
  }
};
