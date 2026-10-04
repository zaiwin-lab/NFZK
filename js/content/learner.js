/* Learner identity — the only file that is specific to one child.
   To set up the portal for another learner, copy this file and change the values.
   Everything else (curriculum, questions, MARIA, Word Bridge, analytics) is shared. */
window.FMQ = window.FMQ || {};

FMQ.learner = {
  id: 'fathiya',
  name: 'Fathiya',
  year: 4,
  buddy: 'Maria',
  supportLanguage: { code: 'ms', name: 'Bahasa Malaysia', short: 'BM' },
  // Starting focus from the most recent exam. These are hypotheses to test, never labels.
  priorities: [
    'money', 'decimals', 'time24', 'duration', 'percent', 'fractions',
    'ratio', 'perimeter', 'area', 'measure', 'data', 'word-problems'
  ],
  // Target length of one Daily Quest in minutes (for the parent summary).
  sessionMinutes: [15, 20]
};

FMQ.brand = function () {
  var l = FMQ.learner;
  return {
    title: l.name + ' Maths Quest',
    full: l.name + ' Maths Quest — Year ' + l.year,
    tagline: 'Learn Maths. Build English. Grow Every Day.',
    buddy: l.buddy.toUpperCase(),
    buddySub: l.name + '’s Learning Buddy'
  };
};
