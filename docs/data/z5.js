// Rozdział 5 — kompostownik. Źródło: scenariusz 3.1 §8; pakiet 02 §2 (identyfikatory i warunki).
window.GOZ_Z5 = {
  id: 'Z5',
  // Podpisy składników i etapów: redakcja A (propozycja.json, z5_component_1…5, z5_stage_1…4); nazwy bez zmian.
  components: [
    { id: 'twigs', audio: 'z5_component_1', name: 'Drobne gałązki u podstawy', text: 'Pomagają zachować luźną strukturę i dostęp powietrza przy dnie.' },
    { id: 'brown', audio: 'z5_component_2', name: 'Suche liście i suche części roślin', text: 'To materiał brązowy, bogaty w węgiel. Pomaga równoważyć wilgotne dodatki.' },
    { id: 'green', audio: 'z5_component_3', name: 'Obierki, świeże resztki roślin i niewielkie porcje trawy', text: 'To materiał zielony, zwykle bogatszy w azot i wilgoć. Nazwa nie określa koloru resztek.' },
    { id: 'cardboard', audio: 'z5_component_4', name: 'Rozdrobniony, niepowlekany karton bez taśmy', text: 'Uzupełnia materiał brązowy. W przykładzie jest rozdrobniony i ułożony luźno, z dostępem powietrza.' },
    { id: 'mature', audio: 'z5_component_5', name: 'Dojrzały kompost - dodatek opcjonalny', text: 'Możesz dodać niewielką porcję. Nie jest konieczna do rozpoczęcia kompostowania.' }
  ],
  // Z5-T2: cztery etapy (nazwy ze scenariusza).
  stages: [
    { id: 's1', name: 'Dodanie składników', text: 'Do kompostownika trafia materiał brązowy i zielony. Zostaje miejsce na powietrze, materiał jest wilgotny.' },
    { id: 's2', name: 'Rozkład i mieszanie', text: 'Mikroorganizmy rozkładają materię. Podczas mieszania zanikają granice warstw.' },
    { id: 's3', name: 'Dojrzewanie', text: 'Kompost dojrzewa: ciemnieje i staje się kruchy. O gotowości nie decyduje sam kalendarz.' },
    { id: 's4', name: 'Wykorzystanie w ogrodzie', text: 'Dojrzały kompost może wzbogacać glebę w materię organiczną.' }
  ],
  // Podpisy stanów i opisy ilustracji: pakiet 26 (redakcja_26/propozycja.json — z5_moisture_*, z5_state_*_alt).
  moisture: [
    { id: 'dry', audio: 'z5_moisture_dry', name: 'Bardzo sucho', caption: 'Składniki są bardzo suche. Brakuje wilgoci potrzebnej mikroorganizmom do rozkładu materii.', alt: 'Przekrój mieszanki: suche składniki, przestrzenie z powietrzem i brak widocznej warstwy wody.' },
    { id: 'moist', audio: 'z5_moisture_moist', name: 'Wilgotno', caption: 'Składniki są wilgotne. Między nimi pozostaje miejsce na powietrze potrzebne do kompostowania.', alt: 'Przekrój tej samej mieszanki: wilgotne składniki, niewielka ilość wody przy ich powierzchni i wolne przestrzenie z powietrzem.' },
    { id: 'wet', audio: 'z5_moisture_wet', name: 'Zalane', caption: 'Nadmiar wody wypełnia przestrzenie między składnikami i utrudnia dostęp powietrza.', alt: 'Przekrój tej samej mieszanki: nadmiar wody zajmuje wiele przestrzeni między składnikami; pozostaje mniej miejsca na powietrze.' }
  ],
  wet: {
    items: [
      { id: 'dryLeaves', label: 'Dodaj suche liście', explanation: 'Dodajesz suchy materiał do nadmiernie wilgotnej zawartości.' },
      { id: 'loosen', label: 'Delikatnie rozluźnij i przemieszaj', explanation: 'Poprawiasz jej strukturę i dostęp powietrza.' },
      { id: 'water', label: 'Dolej wodę', explanation: 'W opisie wody jest już za dużo.' },
      { id: 'freshGrass', label: 'Dodaj dużą porcję świeżej trawy', explanation: 'Dodajesz kolejną porcję wilgotnego materiału zielonego, a w tym przypadku potrzebny jest suchy dodatek i rozluźnienie.' }
    ],
    decisive: 'bardzo wilgotna i zbita',
    tooMany: 'Wybierz dwa działania. Usuń jedno, aby zmienić zestaw.',
    // wykonawca
    result: 'Rezultat: więcej suchego materiału i przestrzeni na powietrze. Proces trwa dalej - to jeszcze nie jest gotowy kompost.',
    guidedQuestion: 'Co w opisie wskazuje na nadmiar wody, a co na brak przestrzeni dla powietrza?'
  },
  dry: {
    items: [
      // wykonawca — scenariusz podaje karty i klucz, bez wyjaśnień dla tej części.
      { id: 'moistenMix', label: 'Umiarkowanie zwilż i przemieszaj', explanation: 'Materiał jest suchy, więc potrzebuje wilgoci - w umiarkowanej ilości, bez zalewania.' },
      { id: 'moreDryLeaves', label: 'Dosyp kolejną porcję suchych liści', explanation: 'Materiał jest już bardzo suchy. Kolejne suche liście nie dostarczą potrzebnej wilgoci.' }
    ],
    decisive: 'bardzo suchy i lekki',
    guidedQuestion: 'Czego brakuje w tym pojemniku: suchego materiału czy wilgoci?'
  },
  // wykonawca
  help: 'Najpierw przeczytaj opis: czego jest za dużo, a czego brakuje? Wróć do pokazu z suwakiem wilgoci.'
};
