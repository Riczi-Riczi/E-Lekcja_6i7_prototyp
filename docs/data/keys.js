// Klucze sześciu zadań i dozwolone identyfikatory zapisu.
// Źródło: pakiet_wykonawczy_v1/02_ZADANIA_I_POSTEP.md, §2 i §3 (pakiet 1.1); scenariusz 3.2, Z1–Z6 i M1.
// Litery wynikają z identyfikatora rozdziału, nigdy z zapisu w przeglądarce.
window.GOZ_KEYS = {
  order: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6'],
  letters: { Z1: 'N', Z2: 'A', Z3: 'P', Z4: 'R', Z5: 'A', Z6: 'W' },
  password: 'NAPRAW',
  Z1: {
    items: ['H1', 'H2', 'H3', 'H4'],
    options: ['use', 'share', 'repair', 'collect'],
    answers: { H1: 'use', H2: 'share', H3: 'repair', H4: 'collect' }
  },
  Z2: {
    items: ['X', 'Y'],
    options: ['clean', 'repair', 'paint', 'replace'],
    answers: { X: 'clean', Y: 'repair' }
  },
  Z3: {
    items: ['C1', 'C2', 'C3', 'C4', 'C5'],
    zones: ['past', 'repair', 'new'],
    answers: { C1: 'past', C2: 'repair', C3: 'repair', C4: 'new', C5: 'new' },
    conclusions: ['W1', 'W2', 'W3'],
    conclusion: 'W1'
  },
  // Treść 3.2: woreczek z obierkami rozdzielany na obierki i pusty woreczek (08 §1, 02 §2).
  Z4: {
    initialItems: ['eggshells', 'grounds', 'bagWithPeelings', 'bones', 'meat', 'potatoesWithSauce'],
    splitSource: 'bagWithPeelings',
    splitProducts: ['peelings', 'bag'],
    splitItems: ['eggshells', 'grounds', 'peelings', 'bag', 'bones', 'meat', 'potatoesWithSauce'],
    zones: ['bio', 'outside'],
    answers: { eggshells: 'bio', grounds: 'bio', peelings: 'bio', bag: 'outside', bones: 'outside', meat: 'outside', potatoesWithSauce: 'outside' }
  },
  Z5: {
    wetOptions: ['dryLeaves', 'loosen', 'water', 'freshGrass'],
    wetAnswers: ['dryLeaves', 'loosen'],
    dryOptions: ['moistenMix', 'moreDryLeaves'],
    dryAnswer: 'moistenMix'
  },
  Z6: {
    words: ['NAPRAWA', 'OBIEG', 'SUROWCE', 'RECYKLING', 'KOMPOST', 'BIOODPADY', 'DZIELENIE'],
    items: ['S1', 'S2', 'S3'],
    // Karty do dopasowania znaczeń: każde słowo raz (Z6-Z2).
    meaningOptions: ['NAPRAWA', 'RECYKLING', 'DZIELENIE'],
    answers: { S1: 'NAPRAWA', S2: 'RECYKLING', S3: 'DZIELENIE' }
  },
  // Dodatek M1: osiem par, karta sytuacji (s) i karta działania (a). Bez litery.
  memory: {
    pairs: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'],
    cards: ['P1s', 'P1a', 'P2s', 'P2a', 'P3s', 'P3a', 'P4s', 'P4a', 'P5s', 'P5a', 'P6s', 'P6a', 'P7s', 'P7a', 'P8s', 'P8a']
  },
  // Opcjonalny edytor buta (02 §2): cztery panele, osiem kolorów, sześć rodzajów ozdób, maks. sześć ozdób.
  shoe: {
    panels: ['toe', 'side', 'heel', 'tongue'],
    colors: ['white', 'navy', 'sky', 'green', 'lime', 'yellow', 'coral', 'violet'],
    shapes: ['circle', 'square', 'star', 'lightning', 'triangle', 'organic'],
    maxOrnaments: 6
  },
  anchors: ['entry', 'intro-film', 'mission', 'z1-entry', 'z1-knowledge', 'z1-example', 'z1-task', 'z1-result',
    'z2-entry', 'z2-knowledge', 'z2-inspect', 'z2-process', 'z2-task', 'z2-result', 'z2-customize', 'z2-repairability',
    'z3-entry', 'z3-knowledge', 'z3-example', 'z3-task', 'z3-result', 'ocean',
    'z4-entry', 'z4-knowledge', 'z4-example', 'z4-task', 'z4-result',
    'z5-entry', 'z5-knowledge', 'z5-process', 'z5-moisture', 'z5-task', 'z5-result', 'z5-worms',
    'z6-entry', 'z6-knowledge', 'z6-wordsearch', 'z6-meanings', 'z6-result', 'memory',
    'password', 'final-film', 'my-step', 'diploma', 'closing']
};
