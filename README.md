# Fathiya Maths Quest — Year 4

**Learn Maths. Build English. Grow Every Day.**
Featuring **MARIA**, Fathiya’s Learning Buddy.

A calm, mobile-first learning portal that helps a Malaysian Year 4 pupil rebuild Mathematics
foundations and grow Maths English along the way. It follows one loop:

**Find the gap → Repair the gap → Re-test differently → Build independence → Move forward.**

## Run it

No build step and no dependencies. Serve the folder with any static server:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploys as-is to Netlify (`netlify.toml` included). Progress is saved in the browser on the device.

## What the child sees

- **Home**: greeting from MARIA, four indicators (🔥 streak, ⭐ stars, 🌱 growing, 🏆 mastered), one main button.
- **First visit**: a short welcome, then a 10-question diagnostic (no score shown), then
  “Things you already know” / “Things we’ll make stronger”, then the first mission.
- **Daily Quest (~15 min)**: Easy Start (2) → Today’s Skill (foundation, normal, changed context) →
  Foundation Fix (1) → Mini Boss (1 multi-step) → Victory screen. The session always ends.
- **Signature tools on every question**
  - 💡 **Help Me**: Notice → Strategy → One step together → 📘 Show Me How. Never the answer first.
    After an explanation, a *changed question* always follows.
  - 🌐 **Word Bridge**: English stays visible; matching colour + icon + word pairs (e.g. *spends ↔ membelanjakan*),
    plus “Explain this word / sentence in BM / simpler English”. Support fades: full → short → tap to reveal → plain.
  - 😕 **I’m Confused**: steps back to a smaller prerequisite (e.g. what 1/4 means), then returns to the question.
- **COMEBACK WIN 🎉** when a skill that was difficult on an earlier day is solved independently on a changed question.
- **My Progress**: Maths Journey (🟢 / 🟡 / 🌱), English Power from Maths, Fathiya vs Fathiya, Comeback Wins.

## Built for 3 months of daily use

- **Fresh questions every day.** 70 hand-written questions plus 83 question generators across 17 skills.
  Each generator builds a complete question from a seed (Malaysian names, foods, places and money),
  with its own hints, worked steps, Bahasa sentence, simpler English and error-tagged wrong answers.
  Thousands of variants; hand-written questions return only as spaced review.
- **12-week journey.** One theme per week (Number Builders → Money Smart → Time Explorer → Fraction Friends →
  Percent Power → Shape Up → Measure It → Ratio Ranger → Data Detective → Shapes & Grids → Problem Solver →
  Grand Review). The theme sets the direction; the daily quest still steps back to missing foundations and
  skips secure skills. After week 12 it continues as spaced review.
- **Weekend Review Mix.** Saturdays and Sundays give a shorter mix of skills already practised.
- **Checkpoints in weeks 6 and 12.** The same skills as the first diagnostic with new questions, shown as
  “Fathiya then vs Fathiya now”. No scores.
- **Gentle weekly goal and stamps.** Learn on 4 days in a week (any days) to collect that week’s stamp.
- **My Learning Garden.** One cell per day for 12 weeks: 🌿 learning day, 🌸 comeback day, ⭐ checkpoint.
  Rest days stay plain soil, never red. Milestones at 5, 10, 20, 30, 45, 60, 75 and 90 days.
- **New skills.** Shapes & angles (faces/edges/vertices, right angles, parallel/perpendicular lines) and
  coordinates, plus bar charts, rounding, units of time and mixed units.
- **Backup and restore** in Parent View, with a reminder when the last backup is over a week old.

## What the parent sees

Parent View answers five questions: what can she do now, what is improving, what still needs work,
why she is struggling (hidden error categories: concept, reading the question, method, calculation,
checking), and what should happen next. It also has weekly indicators, vocabulary tracking,
per-session summaries, three sample flows, sample history, export and reset.

## How mastery works

One correct answer is never mastery. A skill is **secure** only when, in the recent window, there is
an independent correct answer on a core question **and** on a changed/context question, little or no
help, and no repeated misconception. Outcomes are recorded as ✅ independent, 💡 one hint,
💡💡 two or more hints, or 📘 learned with explanation.

## Project structure

```
index.html
css/app.css                 Visual system (light + dark)
js/content/learner.js       Learner identity — the only child-specific file
js/content/curriculum.js    Skills, prerequisites, hidden error categories
js/content/questions.js     Question bank, hints, worked steps, BM + simple English, confusion ladders
js/content/vocab.js         Word Bridge dictionary (roles, BM, fading, explanations)
js/content/generators.js    Question generators (seeded, rebuildable from the stored id)
js/content/plan.js          12-week plan, checkpoints, milestones
js/content/demo.js          Sample history (replayed through the real engine)
js/engine/store.js          Persistence (swappable storage driver)
js/engine/mastery.js        Outcomes, mastery states, comeback, stars, vocabulary tracking
js/engine/quest.js          Daily Quest generation and in-session adaptation
js/engine/maria.js          MARIA’s voice
js/engine/analytics.js      Progress, self-comparison, parent observations, session summaries
js/engine/visuals.js        Fraction bars, grids, pictographs, tables, clocks
js/ui/app.js                Views and actions
```

### Another learner

Copy `js/content/learner.js`, change the name, year, buddy name and starting priorities. The brand
becomes “[Child Name] Maths Quest — Year N” automatically; each learner’s progress is stored separately.

### Adding questions

Add an entry to `FMQ.questions` with `skill`, `level` (1 foundation · 2 normal · 3 changed · 4 multi-step),
options, three hints, `show` steps, `bm` and `simple` sentences, and optional `wrong` nudges tagged with
an error category. Word Bridge words listed in `vocab` must appear in the question text.
