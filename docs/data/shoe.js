// Opcjonalny edytor wyglądu buta (Z2-I2). Źródło: pakiet 02 §2 (panele, kolory, zestawy, ozdoby, limit, cofanie) i scenariusz 3.2 §4.
// Geometria paneli i naszywki: data/shoe-outline.js (maski robocze z warsztat_05_edytor; do wymiany na finalne maski autora, B-14).
window.GOZ_SHOE_EDITOR = {
  panels: [
    { id: 'toe', name: 'Nosek' },
    { id: 'side', name: 'Bok' },
    { id: 'heel', name: 'Pięta' },
    { id: 'tongue', name: 'Język' }
  ],
  colors: [
    { id: 'white', name: 'Biały', hex: '#FFFFFF' },
    { id: 'navy', name: 'Granat', hex: '#123E6B' },
    { id: 'sky', name: 'Błękit', hex: '#38BDF8' },
    { id: 'green', name: 'Zieleń', hex: '#37A46B' },
    { id: 'lime', name: 'Limonka', hex: '#B8DE45' },
    { id: 'yellow', name: 'Żółty', hex: '#F8C945' },
    { id: 'coral', name: 'Koral', hex: '#F06A55' },
    { id: 'violet', name: 'Fiolet', hex: '#9B6BD3' }
  ],
  // Zestawy w kolejności paneli: nosek / bok / pięta / język.
  sets: [
    { id: 'calm', name: 'Spokojny', colors: { toe: 'white', side: 'navy', heel: 'sky', tongue: 'white' } },
    { id: 'forest', name: 'Leśny', colors: { toe: 'white', side: 'green', heel: 'lime', tongue: 'white' } },
    { id: 'energy', name: 'Energia', colors: { toe: 'yellow', side: 'white', heel: 'coral', tongue: 'navy' } },
    { id: 'cosmic', name: 'Kosmiczny', colors: { toe: 'violet', side: 'navy', heel: 'sky', tongue: 'white' } }
  ],
  shapes: [
    { id: 'circle', name: 'Koło' },
    { id: 'square', name: 'Kwadrat' },
    { id: 'star', name: 'Gwiazdka' },
    { id: 'lightning', name: 'Błyskawica' },
    { id: 'triangle', name: 'Trójkąt' },
    { id: 'organic', name: 'Organiczny kształt' }
  ],
  // Trzy stałe kotwice ozdób w każdym panelu (współrzędne ilustracji 1671 × 941), poza strefą naszywki.
  anchors: {
    toe: [[560, 572], [662, 572], [744, 594]],
    side: [[990, 560], [1375, 562], [1345, 618]],
    heel: [[1502, 566], [1570, 504], [1590, 562]],
    tongue: [[1112, 218], [1160, 236], [1200, 264]]
  },
  ornamentRadius: 22,
  // „Rozmieść wzór”: trzy stałe kompozycje [panel, numer kotwicy], zawsze najwyżej sześć ozdób.
  compositions: [
    [['toe', 0], ['toe', 2], ['side', 0], ['side', 1], ['heel', 1], ['tongue', 1]],
    [['side', 0], ['side', 1], ['side', 2], ['heel', 0], ['heel', 2], ['tongue', 0]],
    [['toe', 0], ['toe', 1], ['toe', 2], ['heel', 0], ['heel', 1], ['tongue', 2]]
  ],
  messages: {
    limit: 'Masz już sześć ozdób. Usuń jedną albo cofnij zmianę.',
    // wykonawca — komunikaty obsługi edytora
    panel: 'Wybrano panel: {p}. Teraz wybierz kolor.',
    color: 'Panel {p}: kolor {c}.',
    set: 'Zestaw „{s}”: nosek {a}, bok {b}, pięta {c}, język {d}.',
    shape: 'Wybrano ozdobę: {s}. Wskaż miejsce na panelu albo wybierz „Dodaj ozdobę”.',
    added: 'Dodano ozdobę „{s}” na panelu {p}. Ozdoby: {n} z 6.',
    noAnchor: 'Na panelu {p} nie ma już wolnego miejsca na ozdobę. Wybierz inny panel.',
    badge: 'Tu jest naszywka SELEKT. Wybierz inne miejsce na panelu.',
    pattern: 'Rozmieszczono wzór {n} z 3.',
    undo: 'Cofnięto ostatnią zmianę.',
    nothingToUndo: 'Nie ma zmian do cofnięcia.',
    clearOrnaments: 'Usunięto ozdoby. Kolory zostały.',
    white: 'But jest znów biały. Naszywka została bez zmian.',
    removed: 'Usunięto ozdobę.',
    done: 'Zapisano wygląd buta. Możesz do niego wrócić.',
    noShape: 'Najpierw wybierz rodzaj ozdoby.'
  },
  practical: 'W realnym projekcie wybierz materiały przeznaczone do danego obuwia i pracuj zgodnie z instrukcją, w razie potrzeby z pomocą dorosłego. Nie musisz nic kupować, żeby ukończyć tę lekcję.'
};
