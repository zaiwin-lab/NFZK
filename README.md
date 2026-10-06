# Maths Quest with MARIA

**A calm Year 4 Mathematics and Maths-English learning companion.**

**Maturity:** Family-use educational prototype with a verified public demonstration  
**Portfolio category:** Adaptive practice, bilingual learning support and parent-visible progress  
**Production status:** Static browser application; not a school system, formal assessment or validated educational intervention

[Open the verified live demonstration](https://mathquest-my.netlify.app)

Maths Quest follows one learning loop:

**find the gap → repair the gap → re-test differently → build independence → move forward**

MARIA is the learner-facing companion that guides practice, celebrates recovery and encourages steady daily progress without exposing the answer immediately.

## Learning problem

A child who falls behind can be given more questions without receiving the specific prerequisite help needed to answer them. Language can create a second barrier when mathematical reasoning and English comprehension are developing together.

This product demonstrates a gentler response:

- identify the skill or reading barrier behind an error;
- step back to a smaller prerequisite;
- provide progressive hints and worked reasoning;
- ask a changed question rather than repeat the answer;
- show progress against the learner's own earlier performance;
- give a parent a practical view of what is improving and what needs support.

## Intended users

- a Year 4 learner using short supervised daily practice;
- parents or guardians reviewing progress and supporting a routine;
- educators evaluating a personalised supplementary-learning concept;
- product teams adapting the architecture for another learner.

The current repository is a personalised family prototype. It does not claim classroom adoption, curriculum approval or measured learning outcomes.

## What the child sees

- **Home:** greeting from MARIA, streak, stars, growing skills and mastered skills
- **First visit:** welcome, ten-question diagnostic and strength/growth summary
- **Daily Quest:** Easy Start, Today's Skill, Foundation Fix, Mini Boss and Victory
- **Help Me:** staged hints before a worked example, followed by a changed question
- **Word Bridge:** colour-matched English and Bahasa Malaysia support that fades with progress
- **I'm Confused:** prerequisite repair before returning to the original skill
- **Comeback Win:** recognition when a previously difficult skill is solved independently
- **My Progress:** skill journey, Maths-English growth and self-comparison

## Built for a 12-week journey

- 70 hand-written questions plus 83 seeded generators across 17 skills
- Fresh number, name and context variants with hints and worked steps
- Weekly themes from number foundations through money, time, fractions, measurement, ratio, data, geometry and review
- Shorter weekend Review Mix sessions
- New-question checkpoints in weeks 6 and 12
- A four-day weekly goal, stamps and a 12-week Learning Garden
- Progress milestones, spaced review and continuing practice after week 12
- Backup and restore in Parent View

## What the parent sees

Parent View is designed to answer five questions:

1. What can the learner do now?
2. What is improving?
3. What still needs work?
4. Is the difficulty conceptual, linguistic, procedural, calculation-based or checking-related?
5. What should happen next?

It includes weekly indicators, vocabulary tracking, session summaries, the 12-week plan, sample flows and local backup/restore.

## How adaptation works

The portal uses deterministic browser logic, not a generative-AI model.

A skill becomes secure only when recent evidence includes:

- an independently correct core question;
- an independently correct changed-context question;
- little or no hint dependence;
- no repeated misconception in the recent window.

Outcomes distinguish independent work, one hint, multiple hints and learning through an explanation. The quest generator then mixes the weekly direction with prerequisite repair and spaced review.

MARIA's messages are scripted and selected from learner state. No model API sends a child's answers to an external AI service.

## Strategic value

This repository demonstrates how a focused family need can become a reusable digital-learning product:

- pedagogy is expressed as inspectable rules rather than vague “AI tutor” claims;
- language support is integrated into the Maths task instead of separated from it;
- progress emphasises self-improvement rather than public ranking;
- the learner identity is isolated in one configuration file;
- the static architecture is simple to operate and adapt.

It is strong evidence of child-centred product design, but educational effectiveness still requires supervised evaluation over time.

## Technology

| Layer | Implementation |
|---|---|
| Application | Dependency-free static web application |
| Interface | HTML and responsive CSS |
| Logic | Vanilla JavaScript modules |
| Curriculum | Structured skills, prerequisites and question content |
| Adaptation | Deterministic mastery, hint, review and quest rules |
| Storage | Browser localStorage |
| Backend / accounts | Not implemented |
| External AI API | Not used |
| Hosting | Netlify |

## Verified live demonstration

[mathquest-my.netlify.app](https://mathquest-my.netlify.app)

Netlify records the current deployment as ready and published on **4 October 2026**. It contains one generated page and static assets, with no deployed serverless or edge functions. The deployment was uploaded through an API workflow and has no attached Git branch, commit reference or commit URL; exact deployment-to-commit parity therefore remains unproven.

## Delivery role

**Ts. Zaiwin Kassim** led the learning-product concept, parent requirements, experience direction and delivery review with the **KOBIS AI Prodigy Team**, using supervised AI-assisted development.

The product was created to support a real family learning need. This does not claim endorsement by a school, teacher, examination body or education authority.

## Responsible use and limitations

- Use the portal as supplementary supervised practice, not a replacement for a teacher or professional learning assessment.
- A parent or educator should review generated questions, worked steps and translations before broader reuse.
- Curriculum alignment, accessibility and educational impact have not been independently validated.
- Progress remains in the current browser unless exported; clearing storage or changing devices can remove it.
- There are no accounts, cloud backup, teacher controls or multi-device synchronisation.
- The first-pass Bahasa support and English simplifications may require educator review.
- Avoid publishing a child's detailed progress or entering unnecessary personal information.
- Seek qualified educational support when persistent learning difficulties require assessment.

## Development provenance

Four substantive default-branch commits on **4 October 2026** built and extended the product. They use `claude` as GitHub author and committer, so they do not map to the `zaiwin-lab` contribution graph. Their history has not been rewritten.

Future accepted work should be committed with an email linked to `zaiwin-lab`, while retaining an AI co-author trailer when appropriate.

## Run locally

No build step or dependencies are required:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

```text
index.html
css/app.css                 Visual system
js/content/learner.js       Learner identity and priorities
js/content/curriculum.js    Skills, prerequisites and error categories
js/content/questions.js     Question bank, hints, worked steps and language support
js/content/vocab.js         Word Bridge dictionary and fading rules
js/content/generators.js    Seeded question generators
js/content/plan.js          12-week plan, checkpoints and milestones
js/content/demo.js          Sample history
js/engine/store.js          Browser persistence and backup
js/engine/mastery.js        Outcomes, mastery and comeback logic
js/engine/quest.js          Daily Quest generation and adaptation
js/engine/maria.js          MARIA's scripted voice
js/engine/analytics.js      Progress and parent observations
js/engine/visuals.js        Maths diagrams and visual models
js/ui/app.js                Views and actions
```

## Adapting for another learner

Copy `js/content/learner.js`, then change the learner name, year, companion name and starting priorities. Review the curriculum, questions and language content for the learner's actual syllabus and needs before use.

## Highest-value next validation

Run a supervised four-week family pilot, review a sample of every generated question for correctness, and compare independent changed-context performance with the initial diagnostic. Record observations without claiming impact until the evidence supports it.
