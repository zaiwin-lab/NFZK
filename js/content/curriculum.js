/* Curriculum map — Malaysian Year 4 Mathematics, organised as skills with prerequisites.
   `prereqs` lets the engine step backward to a building block and then forward again. */
window.FMQ = window.FMQ || {};

FMQ.curriculum = {
  skills: [
    // Foundation skills (basic: true) are checked first and repaired before Year 4 work that depends on them.
    { id: 'clock',         name: 'Reading the clock',    nameBm: 'Membaca jam',              icon: '⏰', strand: 'Time',            order: 0,  prereqs: [], basic: true },
    { id: 'basic-facts',   name: 'Basic + and −',        nameBm: 'Tambah & tolak asas',      icon: '🧮', strand: 'Numbers',         order: 0,  prereqs: [], basic: true },
    { id: 'times-tables',  name: 'Times tables',         nameBm: 'Sifir',                    icon: '🔟', strand: 'Numbers',         order: 0,  prereqs: ['basic-facts'], basic: true },
    { id: 'place-value',   name: 'Place value',          nameBm: 'Nilai tempat',             icon: '🔢', strand: 'Numbers',         order: 1,  prereqs: [] },
    { id: 'add-sub',       name: 'Adding & subtracting', nameBm: 'Tambah & tolak',           icon: '➕', strand: 'Numbers',         order: 2,  prereqs: ['place-value', 'basic-facts'] },
    { id: 'times-divide',  name: 'Times & sharing',      nameBm: 'Darab & bahagi',           icon: '✖️', strand: 'Numbers',         order: 3,  prereqs: ['add-sub', 'times-tables'] },
    { id: 'decimals',      name: 'Decimals',             nameBm: 'Perpuluhan',               icon: '🔸', strand: 'Numbers',         order: 4,  prereqs: ['place-value'] },
    { id: 'money',         name: 'Money',                nameBm: 'Wang',                     icon: '💵', strand: 'Money',           order: 5,  prereqs: ['decimals', 'add-sub'] },
    { id: 'fractions',     name: 'Fractions',            nameBm: 'Pecahan',                  icon: '🍕', strand: 'Numbers',         order: 6,  prereqs: ['times-divide'] },
    { id: 'percent',       name: 'Percentages',          nameBm: 'Peratus',                  icon: '💯', strand: 'Numbers',         order: 7,  prereqs: ['fractions'] },
    { id: 'time24',        name: '24-hour time',         nameBm: 'Sistem 24 jam',            icon: '🕐', strand: 'Time',            order: 8,  prereqs: ['clock'] },
    { id: 'duration',      name: 'Time duration',        nameBm: 'Tempoh masa',              icon: '⏳', strand: 'Time',            order: 9,  prereqs: ['time24', 'clock'] },
    { id: 'measure',       name: 'Measurement',          nameBm: 'Ukuran',                   icon: '📏', strand: 'Measurement',     order: 10, prereqs: ['times-divide'] },
    { id: 'perimeter',     name: 'Perimeter',            nameBm: 'Perimeter',                icon: '🔲', strand: 'Shapes',          order: 11, prereqs: ['add-sub'] },
    { id: 'area',          name: 'Area',                 nameBm: 'Luas',                     icon: '🟩', strand: 'Shapes',          order: 12, prereqs: ['times-divide'] },
    { id: 'ratio',         name: 'Ratio',                nameBm: 'Nisbah',                   icon: '⚖️', strand: 'Numbers',         order: 13, prereqs: ['times-divide'] },
    { id: 'data',          name: 'Tables & graphs',      nameBm: 'Jadual & graf',            icon: '📊', strand: 'Data',            order: 14, prereqs: ['times-divide'] },
    { id: 'shapes',        name: 'Shapes & angles',      nameBm: 'Bentuk & sudut',           icon: '📐', strand: 'Shapes',          order: 15, prereqs: [] },
    { id: 'coordinates',   name: 'Coordinates',          nameBm: 'Koordinat',                icon: '📍', strand: 'Shapes',          order: 16, prereqs: [] },
    { id: 'word-problems', name: 'Multi-step problems',  nameBm: 'Masalah beberapa langkah', icon: '🧩', strand: 'Problem solving', order: 17, prereqs: ['money', 'add-sub'] }
  ],


  // Hidden diagnostic dimensions. Used by the engine and parent view, not shown to the child.
  errorCategories: {
    CONCEPT:    { label: 'Maths idea', labelBm: 'Konsep matematik', parent: 'understanding the underlying idea', parentBm: 'memahami konsep' },
    UNDERSTAND: { label: 'Reading the question', labelBm: 'Memahami soalan', parent: 'understanding what the question asks', parentBm: 'memahami kehendak soalan' },
    PLAN:       { label: 'Choosing a method', labelBm: 'Memilih kaedah', parent: 'choosing the right method', parentBm: 'memilih kaedah yang betul' },
    EXECUTE:    { label: 'Calculation', labelBm: 'Pengiraan', parent: 'calculation accuracy', parentBm: 'ketepatan pengiraan' },
    EXPLAIN:    { label: 'Explaining', labelBm: 'Menerangkan', parent: 'explaining the reasoning', parentBm: 'menerangkan penaakulan' },
    CHECK:      { label: 'Checking', labelBm: 'Menyemak', parent: 'checking units and reasonableness', parentBm: 'menyemak unit dan kemunasabahan jawapan' }
  }
};

FMQ.skill = function (id) {
  return FMQ.curriculum.skills.find(function (s) { return s.id === id; });
};
