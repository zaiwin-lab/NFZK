/* MARIA — the learning buddy's voice.
   Warm, calm, concise, specific. Praise names what was actually demonstrated.
   Big celebrations are kept for mastery, comeback wins and finishing the day. */
window.FMQ = window.FMQ || {};

FMQ.maria = (function () {
  var U = FMQ.util;
  function name() { return FMQ.learner.name; }
  function skillName(id) { var s = FMQ.skill(id); return s ? s.name.toLowerCase() : id; }

  return {
    onboarding: function () {
      return ['Hi ' + name() + ' 👋', 'I’m ' + FMQ.learner.buddy + '.',
        'I’m here to help you get stronger at Maths — one small step at a time.',
        'You don’t need to know everything already.', 'Try first.', 'If you get stuck, I’ll help.', 'Ready?'];
    },

    greeting: function (state) {
      var today = U.dayKey();
      var done = state.sessions.some(function (s) { return s.day === today && s.mode === 'quest'; });
      if (done) return { title: 'Quest complete for today ✅', text: 'You worked well today. You’re done. Go enjoy your day 😊' };
      var aq = state.activeQuest;
      if (aq && aq.day === today && aq.idx > 0) {
        return { title: 'Welcome back, ' + name() + ' 👋', text: 'We paused in the middle. ' + (aq.items.length - aq.idx) + ' questions left. Let’s finish together.' };
      }
      var last = state.sessions.filter(function (s) { return s.mode === 'quest' || s.mode === 'diagnostic'; }).slice(-1)[0];
      if (!last) return { title: 'Hi ' + name() + ' 👋', text: 'Ready to get a little stronger today?' };
      var gap = U.daysBetween(last.day, today);
      var did = last.strengthened && last.strengthened.length ? skillName(last.strengthened[0]) : null;
      if (gap <= 1 && did) {
        return { title: 'Welcome back, ' + name() + ' 👋',
          text: (gap === 0 ? 'Earlier today' : 'Yesterday') + ' you became stronger at ' + did + '. Today we’ll practise one small part again and then learn something new. Ready?' };
      }
      return { title: 'Welcome back, ' + name() + ' 🌱', text: 'Let’s continue.' + (did ? ' Last time you worked on ' + did + '.' : '') };
    },

    sectionIntro: function (quest, section) {
      if (section === 'skill' && quest.stepBackFrom) return 'Let’s make this part easier first: ' + skillName(quest.focus) + '.';
      if (section === 'skill') return 'Today’s skill: ' + skillName(quest.focus) + '.';
      return FMQ.sections[section] ? FMQ.sections[section].intro : '';
    },

    correct: function (ctx) {
      // ctx: { outcome, item, q, wordWins, quest }
      if (ctx.wordWins && ctx.wordWins.length) return 'You understood ‘' + ctx.wordWins[0] + '’ without Word Bridge this time.';
      if (ctx.item.repair && ctx.outcome === 'independent') return 'Yes — you understood the idea, not just the previous question.';
      switch (ctx.outcome) {
        case 'independent':
          if (ctx.q.level >= 4) return 'You solved a two-step problem by yourself ⭐.';
          if (ctx.q.wrong && Object.keys(ctx.q.wrong).some(function (k) { var c = ctx.q.wrong[k][0]; return c === 'PLAN' || c === 'UNDERSTAND'; }))
            return U.pick(['Good — you chose the correct operation.', 'You solved that without help ⭐.']);
          return U.pick(['You solved that without help ⭐.', 'Correct. Careful work.']);
        case 'corrected': return 'Nice correction.';
        case 'hint1': return 'Nice recovery. Let’s try the next one by yourself.';
        case 'hint2': return 'You got there with some help. Next time, try one more step on your own.';
        default: return 'Correct.';
      }
    },

    wrongFirst: function () { return 'Almost. Look at one part again.'; },
    wrongDiag: function () { return U.pick(['Thanks for trying. We’ll work on this one together soon.', 'Good try. This tells me where to help.']); },
    rightDiag: function () { return U.pick(['Got it ✓', 'Nice — next one.', 'You know this one ✓']); },
    help: function () { return 'Let’s look at one small part first.'; },
    confused: function () { return 'No problem. Let’s make this smaller.'; },
    confusedBack: function () { return 'Good. Now let’s go back to the original idea.'; },
    bridgeAfter: function () { return 'Now try the English question again 😊.'; },
    afterExplain: function () { return 'Let’s try a different one now.'; },
    lighten: function () { return 'Let’s keep today light. We’ll finish with what you’ve learned.'; },
    comeback: function (skillId) { return 'Comeback Win 🎉 You used to need help with ' + skillName(skillId) + '. Today you solved it by yourself.'; },
    mastered: function (skillId) { return 'You can do ' + skillName(skillId) + ' by yourself now 🏆.'; },
    end: function () { return U.pick(['Good work today. You’re done. Go enjoy your day 😊.', 'Quest complete. You worked well today. See you next time 😊.']); },
    diagnosticDone: function () { return 'Great — now I know where we should begin 🌱.'; }
  };
})();
