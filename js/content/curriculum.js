/* Curriculum map — Malaysian Year 4 Mathematics, organised as skills with prerequisites.
   `prereqs` lets the engine step backward to a building block and then forward again. */
window.FMQ = window.FMQ || {};

FMQ.curriculum = {
  skills: [
    { id: 'place-value',   name: 'Place value',         icon: '🔢', strand: 'Numbers',     order: 1,  prereqs: [] },
    { id: 'add-sub',       name: 'Adding & subtracting', icon: '➕', strand: 'Numbers',     order: 2,  prereqs: ['place-value'] },
    { id: 'times-divide',  name: 'Times & sharing',     icon: '✖️', strand: 'Numbers',     order: 3,  prereqs: ['add-sub'] },
    { id: 'decimals',      name: 'Decimals',            icon: '🔸', strand: 'Numbers',     order: 4,  prereqs: ['place-value'] },
    { id: 'money',         name: 'Money',               icon: '💵', strand: 'Money',       order: 5,  prereqs: ['decimals', 'add-sub'] },
    { id: 'fractions',     name: 'Fractions',           icon: '🍕', strand: 'Numbers',     order: 6,  prereqs: ['times-divide'] },
    { id: 'percent',       name: 'Percentages',         icon: '💯', strand: 'Numbers',     order: 7,  prereqs: ['fractions'] },
    { id: 'time24',        name: '24-hour time',        icon: '🕐', strand: 'Time',        order: 8,  prereqs: [] },
    { id: 'duration',      name: 'Time duration',       icon: '⏳', strand: 'Time',        order: 9,  prereqs: ['time24'] },
    { id: 'measure',       name: 'Measurement',         icon: '📏', strand: 'Measurement', order: 10, prereqs: ['times-divide'] },
    { id: 'perimeter',     name: 'Perimeter',           icon: '🔲', strand: 'Shapes',      order: 11, prereqs: ['add-sub'] },
    { id: 'area',          name: 'Area',                icon: '🟩', strand: 'Shapes',      order: 12, prereqs: ['times-divide'] },
    { id: 'ratio',         name: 'Ratio',               icon: '⚖️', strand: 'Numbers',     order: 13, prereqs: ['times-divide'] },
    { id: 'data',          name: 'Tables & graphs',     icon: '📊', strand: 'Data',        order: 14, prereqs: ['times-divide'] },
    { id: 'shapes',        name: 'Shapes & angles',     icon: '📐', strand: 'Shapes',      order: 15, prereqs: [] },
    { id: 'coordinates',   name: 'Coordinates',         icon: '📍', strand: 'Shapes',      order: 16, prereqs: [] },
    { id: 'word-problems', name: 'Multi-step problems', icon: '🧩', strand: 'Problem solving', order: 17, prereqs: ['money', 'add-sub'] }
  ],

  // Hidden diagnostic dimensions. Used by the engine and parent view, not shown to the child.
  errorCategories: {
    CONCEPT:    { label: 'Maths idea',         parent: 'understanding the underlying idea' },
    UNDERSTAND: { label: 'Reading the question', parent: 'understanding what the question asks' },
    PLAN:       { label: 'Choosing a method',  parent: 'choosing the right method' },
    EXECUTE:    { label: 'Calculation',        parent: 'calculation accuracy' },
    EXPLAIN:    { label: 'Explaining',         parent: 'explaining the reasoning' },
    CHECK:      { label: 'Checking',           parent: 'checking units and reasonableness' }
  }
};

FMQ.skill = function (id) {
  return FMQ.curriculum.skills.find(function (s) { return s.id === id; });
};
