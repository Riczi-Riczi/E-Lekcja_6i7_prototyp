// Rozdział 3 — ślad produktu. Źródło: scenariusz 3.1 §5; pakiet 02 §2 (identyfikatory, strefy, cztery stałe podpisy).
// Klucze: data/keys.js (GOZ_KEYS.Z3).
window.GOZ_Z3 = {
  id: 'Z3',
  items: [
    { id: 'C1', label: 'Wydobycie surowców i wykonanie hulajnogi, którą już masz' },
    { id: 'C2', label: 'Wykonanie jednej części i jej dostarczenie do serwisu' },
    { id: 'C3', label: 'Wymiana zużytego elementu, kontrola i powrót do jazdy' },
    { id: 'C4', label: 'Wykonanie ramy, kół i kierownicy od podstaw' },
    { id: 'C5', label: 'Złożenie wszystkich części w gotowy produkt i dostarczenie do sklepu' }
  ],
  zones: [
    { id: 'past', label: 'Już się wydarzyło', note: 'Wspólne dla obu porównywanych dróg' },
    { id: 'repair', label: 'Naprawa obecnej hulajnogi', fixed: ['Dalsze zagospodarowanie wymienionego koła'], end: 'Późniejsze zagospodarowanie używanej hulajnogi' },
    { id: 'new', label: 'Zakup nowej hulajnogi', fixed: ['Dalsza droga dotychczasowej hulajnogi'], end: 'Późniejsze zagospodarowanie nowej hulajnogi po zakończeniu jej używania' }
  ],
  mapCaption: 'Uproszczona mapa etapów. Nie podaje wielkości emisji ani pełnego wyniku porównania.',
  messages: {
    pastInFuture: 'Ta hulajnoga już istnieje. Jej produkcja wydarzyła się przed dzisiejszą decyzją i należy do wspólnej przeszłości.',
    futureInPast: 'Czy ten opis dotyczy powstania rzeczy, którą już masz, czy działania potrzebnego dopiero w wybranym wariancie?',
    scope: 'Porównaj zakres: jedna nowa część czy nowy produkt?'
  },
  conclusions: [
    { id: 'W1', label: 'Naprawa pozwala zachować większość istniejącej rzeczy. Dokładna różnica emisji wymaga danych.' },
    { id: 'W2', label: 'Naprawa usuwa wszystkie emisje, które powstały wcześniej.', error: 'Możemy zmieniać przyszłe działania, ale nie cofnąć wykonanej produkcji.' },
    { id: 'W3', label: 'Skoro hulajnoga nie ma silnika, jej produkcja nie powoduje emisji.', error: 'Wróć do etapów sprzed sklepu. Jazda to tylko część historii.' }
  ],
  // wykonawca — scenariusz: „pomoc wskazuje odpowiednie objaśnienie z Z3-P1”.
  help: 'Wróć do przykładu z lampką: co już się wydarzyło, a co trzeba zrobić dopiero w każdym wariancie?',
  conclusionHelp: 'Przeczytaj jeszcze raz drugi akapit wiadomości: co naprawa zmienia, a czego nie wymazuje?'
};
