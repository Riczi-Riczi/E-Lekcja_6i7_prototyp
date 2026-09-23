// Rozdział 2 — warsztat. Źródło: scenariusz 3.1 §4 (Z2-T1, Z2-P1, Z2-I1, Z2-T2, Z2-Z, Z2-T3, Z2-W).
// Teksty oznaczone „wykonawca” uzupełniają miejsca, dla których scenariusz nie podaje brzmienia (DECYZJE, część C).
// Klucz odpowiedzi: data/keys.js (GOZ_KEYS.Z2.answers).
window.GOZ_Z2 = {
  id: 'Z2',
  actions: [
    { id: 'clean', label: 'Wyczyść zgodnie z instrukcją', icon: '≈' },
    { id: 'repair', label: 'Oddaj do naprawy połączenia', icon: '＋' },
    { id: 'paint', label: 'Pomaluj panele', icon: '◐' },
    { id: 'replace', label: 'Zastąp nowym butem', icon: '⟳' }
  ],
  // Oględziny Z2-I1: dwa przypadki, po dwa punkty. Współrzędne w układzie ilustracji 1671 × 941.
  inspect: [
    { id: 'X', title: 'X - but po spacerze', state: 'mud', points: [
      { id: 'x1', audio: 'z2_x_observation_1', place: 'Bok', text: 'Na całym materiale zaschło błoto.', x: 1010, y: 470 },
      { id: 'x2', audio: 'z2_x_observation_2', place: 'Połączenie podeszwy', text: 'Podeszwa przylega, połączenie jest całe. W tym przykładzie potwierdzono sprawność buta.', x: 760, y: 700 }
    ] },
    { id: 'Y', title: 'Y - but ze szczeliną', state: 'gap', points: [
      { id: 'y1', audio: 'z2_y_observation_1', place: 'Bok', text: 'Materiał jest cały i czysty.', x: 1010, y: 470 },
      { id: 'y2', audio: 'z2_y_observation_2', place: 'Połączenie przy nosku', text: 'Podeszwa miejscowo odchodzi od reszty buta.', x: 520, y: 590 }
    ] }
  ],
  cases: [
    {
      id: 'X', audio: null, title: 'X - but po spacerze', image: 'mud', solvedImage: 'clean',
      text: 'Cały i sprawny, z zaschniętym błotem.',
      decisive: 'z zaschniętym błotem',
      explanation: 'Problemem jest zabrudzenie. Czyszczenie odpowiada na ten problem; w opisie nie ma usterki połączenia ani potrzeby wymiany buta.',
      result: 'Rezultat: but X po czyszczeniu, bez warstwy błota.',
      guidedQuestion: 'Co jest całe, co wymaga działania i która karta na to odpowiada?',
      errors: {
        paint: 'Farba zmienia wygląd. W tym zadaniu potrzebne jest usunięcie błota.',
        repair: 'Sprawdź obserwację połączenia podeszwy: jest całe. Który problem rzeczywiście opisano?',
        replace: 'Z opisu wynika możliwość dalszego używania po odpowiednim działaniu. Wskaż działanie pasujące do problemu.'
      }
    },
    {
      id: 'Y', audio: null, title: 'Y - but ze szczeliną', image: 'gap', solvedImage: 'repaired',
      text: 'Czysty, z odchodzącą podeszwą; naprawa potwierdzona przez warsztat.',
      decisive: 'naprawa potwierdzona przez warsztat',
      explanation: 'Problemem jest połączenie części. Kolor ani samo czyszczenie nie przywrócą jego sprawności. O możliwości naprawy wiemy z oceny warsztatu.',
      result: 'Rezultat: połączenie podeszwy naprawione i sprawdzone przed dalszym noszeniem.',
      link: { label: 'Zobacz pokaz naprawy', href: '#z2-process' },
      guidedQuestion: 'Co jest całe, co wymaga działania i która karta na to odpowiada?',
      errors: {
        clean: 'Te działania nie przywracają połączenia podeszwy. Przeczytaj ocenę warsztatu.',
        paint: 'Te działania nie przywracają połączenia podeszwy. Przeczytaj ocenę warsztatu.',
        replace: 'Z opisu wynika możliwość dalszego używania po odpowiednim działaniu. Wskaż działanie pasujące do problemu.'
      }
    }
  ],
  // wykonawca — scenariusz: „Pomoc: po wyborze przypadku podświetla się istotna obserwacja”.
  help: 'Najpierw ustal problem: co jest całe, a co wymaga działania? Skorzystaj z obserwacji i oceny warsztatu.',
  // Z2-T2: trzy kadry pokazu naprawy. Podpisy: redakcja A (propozycja.json, z2_frame_1…3); nazwy kroków bez zmian.
  process: [
    { id: 'prep', title: 'Przygotowanie', text: 'Warsztat przygotowuje i oczyszcza powierzchnie.' },
    { id: 'repair', title: 'Naprawa i wymagany czas', text: 'Warsztat łączy elementy i zachowuje czas wymagany przez materiały.' },
    { id: 'check', title: 'Kontrola', text: 'Warsztat sprawdza efekt przed dalszym noszeniem.' }
  ],
  // Z2-T3: dwa fikcyjne pady (wykonawca — opisy z przykładu ilustracyjnego scenariusza).
  pads: [
    { id: 'padA', title: 'Pad A', text: 'Dostępny moduł przycisku i dokumentacja naprawy.' },
    { id: 'padB', title: 'Pad B', text: 'Brak danych o częściach zamiennych i naprawie.' }
  ]
};
