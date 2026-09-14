// Rozdział 1 — dane zadania i treści pomocnicze.
// Źródła: wizualizacje/z1_12_wzorzec/lesson-data.js (opisy, wyjaśnienia, przesłanki),
// scenariusz 3.1 §3 (Z1-Z, komunikaty błędów, pomoc), lesson.js wzorca (pozostałe komunikaty i pytania pomocnicze).
// Klucz odpowiedzi: data/keys.js (GOZ_KEYS.Z1.answers).
window.GOZ_Z1 = {
  id: 'Z1',
  actions: [
    { id: 'use', label: 'Używaj dalej', icon: '↗' },
    { id: 'share', label: 'Przekaż sprawną rzecz', icon: '↔' },
    { id: 'repair', label: 'Oddaj do naprawy', icon: '＋' },
    { id: 'collect', label: 'Oddaj do właściwej zbiórki', icon: '↻' }
  ],
  cases: [
    {
      id: 'H1', audio: 'z1_case_1', title: 'Codzienna droga', image: 'normal',
      text: 'Koła, hamulec i rama są sprawne. Wysokość kierownicy pasuje do użytkownika, który regularnie dojeżdża hulajnogą na boisko.',
      decisive: 'regularnie dojeżdża hulajnogą na boisko',
      explanation: 'Rzecz jest sprawna i spełnia potrzebę. Nie trzeba jej zastępować. Konserwacja pomaga zachować ten stan.',
      result: 'Rezultat: hulajnoga dalej służy temu samemu użytkownikowi.',
      guidedQuestion: 'Czy obecny użytkownik nadal korzysta z tej sprawnej rzeczy?',
      errors: {
        share: 'Obecny użytkownik nadal korzysta z hulajnogi, a jej rozmiar pasuje. Co pozwala zachować jej użyteczność?',
        repair: 'W opisie nie ma usterki wymagającej naprawy. Sprawdź stan rzeczy i potrzebę użytkownika.',
        collect: 'Opis potwierdza sprawność. Sprawdź, kto nadal może korzystać z całej rzeczy.'
      }
    },
    {
      id: 'H2', audio: 'z1_case_2', title: 'Stoi nieużywana', image: 'normal',
      text: 'Koła, hamulec i rama są sprawne. Dla obecnego użytkownika kierownica jest już za niska. W rodzinie jest młodsza osoba, dla której rozmiar pasuje i która chce na niej jeździć.',
      decisive: 'W rodzinie jest młodsza osoba',
      explanation: 'Zmieniła się potrzeba użytkownika, a nie sprawność przedmiotu. Kolejna osoba może używać tej samej hulajnogi. To ponowne użycie.',
      result: 'Rezultat: ta sama hulajnoga zmienia użytkownika.',
      guidedQuestion: 'Komu pasuje rozmiar tej sprawnej hulajnogi?',
      errors: {
        use: 'Obecny użytkownik wyrósł z tej hulajnogi. Sprawdź, czy w opisie jest ktoś, komu pasuje.',
        repair: 'W opisie nie ma usterki wymagającej naprawy. Sprawdź stan rzeczy i potrzebę użytkownika.',
        collect: 'Opis potwierdza sprawność. Sprawdź, kto nadal może korzystać z całej rzeczy.'
      }
    },
    {
      id: 'H3', audio: 'z1_case_3', title: 'Zużyta część', image: 'repair',
      text: 'Jedno koło ma zużyty bieżnik. Według serwisu rama i hamulec są sprawne, pasująca część jest dostępna, a po jej zamontowaniu i kontroli sprzęt może wrócić do jazdy. Użytkownik nadal go potrzebuje.',
      decisive: 'pasująca część jest dostępna',
      explanation: 'Problem dotyczy części. Opinia serwisu uzasadnia naprawę i kontrolę, zamiast zastąpienia całej rzeczy.',
      result: 'Rezultat: wymiana koła w serwisie i kontrola przed dalszą jazdą.',
      guidedQuestion: 'Co serwis potwierdził o części i dalszym używaniu?',
      errors: {
        use: 'Stan koła wymaga działania przed powrotem do jazdy. Skorzystaj z oceny serwisu.',
        share: 'Zmiana właściciela nie usuwa zużycia koła. Najpierw potrzebne jest działanie opisane przez serwis.',
        collect: 'Serwis potwierdził możliwość dalszego korzystania po wymianie części i kontroli. Czy trzeba już rezygnować z całego produktu?'
      }
    },
    {
      id: 'H4', audio: 'z1_case_4', title: 'Pęknięta rama', image: 'retired',
      text: 'Rama jest pęknięta. Serwis ocenił, że w tym przypadku nie można przywrócić bezpiecznego użytkowania.',
      decisive: 'nie można przywrócić bezpiecznego użytkowania',
      explanation: 'Nie przekazujemy komuś niesprawnego sprzętu jako gotowego do jazdy. Po właściwej zbiórce część materiałów może zostać odzyskana. Zbiórka rozpoczyna dalszą drogę, ale nie gwarantuje recyklingu wszystkiego.',
      result: 'Rezultat: po zbiórce materiały trafiają do oceny możliwości odzysku.',
      link: { label: 'Lokalne zasady zbiórki — SELEKT', source: 'S18' },
      guidedQuestion: 'Co ocena serwisu mówi o bezpieczeństwie?',
      errors: {
        use: 'Serwis wykluczył bezpieczne użytkowanie. Nie wracamy do jazdy na tym egzemplarzu.',
        share: 'Nowy właściciel nie usuwa pęknięcia. Nie przekazujemy tej hulajnogi jako sprawnej.',
        repair: 'W tej sytuacji serwis wykluczył bezpieczną naprawę. Wybierz drogę dla rzeczy, która kończy użytkowanie.'
      }
    }
  ],
  help: 'Najpierw sprawdź stan rzeczy. Potem sprawdź, komu może służyć. Przy uszkodzeniu skorzystaj z podanej oceny serwisu.',
  // Pięć stacji historii (scenariusz 3.1, Z1 — aktywna droga produktu; teksty stacji z zaakceptowanego wzorca Z1).
  stations: [
    { id: 'z1-stage-1', short: 'Surowce', eyebrow: '01 / Surowce', title: 'Zanim powstanie rzecz',
      body: ['Hulajnoga zaczyna swoją historię przed sklepem: od surowców potrzebnych do wytworzenia materiałów.'],
      note: 'Rysunek objaśnia proces. Nie przedstawia dokładnego składu konkretnego modelu.', art: 'raw' },
    // Teksty stacji, dróg i podpisu: redakcja A (pakiet_wykonawczy_v1/redakcja_17/propozycja.json, pola z1_stage_1…5, z1_branch_1…3, z1_branch_caption).
    { id: 'z1-stage-2', short: 'Materiały i części', eyebrow: '02 / Materiały i części', title: 'Projekt ma znaczenie',
      body: ['Z materiałów powstają części. Producent może ułatwić naprawę, projektując trwałą konstrukcję i zapewniając części zamienne.'], art: 'parts' },
    { id: 'z1-stage-3', short: 'Gotowa hulajnoga', eyebrow: '03 / Gotowa hulajnoga', title: 'Części stają się całością',
      body: ['Po połączeniu części gotowa hulajnoga trafia do użytkownika. Za nią jest już historia produkcji.'], art: 'product' },
    { id: 'z1-stage-4', short: 'Używanie', eyebrow: '04 / Używanie', title: 'Dbanie też jest działaniem',
      body: ['Dbaj o hulajnogę zgodnie z instrukcją. Przed zakupem sprawdź, czy wystarczy to, co masz, pożyczenie albo rzecz używana.'], art: 'use' },
    { id: 'z1-stage-5', short: 'Dalsza droga', eyebrow: '05 / Dalsza droga', title: 'Co możemy zachować?',
      body: ['Sprawna hulajnoga może służyć dalej — Tobie albo komuś innemu. Uszkodzoną można naprawić, jeśli serwis potwierdzi bezpieczeństwo. Po zakończeniu użytkowania potrzebna jest właściwa zbiórka.'], art: 'paths' }
  ],
  // Rozgałęzienia piątej stacji (scenariusz 3.1, Z1: trzy dalsze drogi). Nie są warunkiem karty.
  branches: [
    { id: 'reuse', art: 'branch-reuse', title: 'Kolejny użytkownik', text: 'Ta sama hulajnoga służy kolejnej osobie.' },
    { id: 'service', art: 'branch-service', title: 'Wymiana elementu w serwisie', text: 'Serwis wymienia część i sprawdza bezpieczeństwo jazdy.' },
    { id: 'materials', art: 'branch-materials', title: 'Materiały po zbiórce', text: 'Po zbiórce część materiałów może zostać odzyskana.' }
  ],
  branchesCaption: 'Odzysk zależy od materiałów i sposobu przetwarzania. Nie oznacza odtworzenia identycznej hulajnogi.',
  sources: {
    S1: { title: 'Parlament Europejski — GOZ: definicja, znaczenie i korzyści', url: 'https://www.europarl.europa.eu/pdfs/news/expert/2023/5/story/20151201STO05603/20151201STO05603_pl.pdf' },
    S2: { title: 'EUR-Lex — Gospodarka o obiegu zamkniętym', url: 'https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=LEGISSUM%3Acircular_economy' },
    S3: { title: 'JRC — Why repairability matters for the future of tech products', url: 'https://joint-research-centre.ec.europa.eu/jrc-explains/why-repairability-matters-future-tech-products_en' },
    S18: { title: 'SELEKT — Jak segregować?', url: 'https://selekt.czempin.pl/asp/pl_start.asp?menu=7&strona=1&typ=14' }
  }
};
