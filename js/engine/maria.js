/* MARIA — the learning buddy's voice, in English and Bahasa Malaysia.
   Every message is a pair [English, BM]; the UI shows it in the chosen language.
   Warm, calm, concise, specific. Big celebrations are kept for real progress. */
window.FMQ = window.FMQ || {};

FMQ.maria = (function () {
  var U = FMQ.util;
  function name() { return FMQ.learner.name; }
  function sk(id) { var s = FMQ.skill(id); return s ? [s.name.toLowerCase(), (s.nameBm || s.name).toLowerCase()] : [id, id]; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function wk(w) { return [w.icon + ' ' + w.title, w.icon + ' ' + (w.titleBm || w.title)]; }

  return {
    onboarding: function () {
      return [['Hi ' + name() + ' 👋', 'Hai ' + name() + ' 👋'], ['I’m ' + FMQ.learner.buddy + '.', 'Saya ' + FMQ.learner.buddy + '.'],
        ['I’m here to help you get stronger at Maths — one small step at a time.', 'Saya di sini untuk bantu awak jadi lebih kuat dalam Matematik, satu langkah kecil setiap kali.'],
        ['You don’t need to know everything already.', 'Awak tak perlu tahu semuanya dahulu.'], ['Try first.', 'Cuba dahulu.'],
        ['If you get stuck, I’ll help.', 'Kalau tersekat, saya akan bantu.'], ['Ready?', 'Sedia?']];
    },

    greeting: function (state) {
      var today = U.dayKey(), n = name();
      var done = state.sessions.some(function (s) { return s.day === today && (s.mode === 'quest' || s.mode === 'checkpoint'); });
      if (done) return { title: ['Quest complete for today ✅', 'Misi hari ini selesai ✅'], text: pick([['You worked well today. You’re done. Go enjoy your day 😊', 'Awak sudah berusaha dengan baik hari ini. Selesai. Pergilah berehat dan bermain 😊'], ['That’s today’s learning done. See you tomorrow 🌱', 'Pembelajaran hari ini selesai. Jumpa esok 🌱']]) };
      var info = FMQ.planInfo(state);
      if (state.profile.diagnosticDone && FMQ.quest.checkpointDue(state)) {
        return { title: ['Checkpoint day ⭐', 'Hari Semakan ⭐'], text: ['Today we look back at where you started. New questions on the skills from your first day. No pressure. It just shows how much you’ve grown.', 'Hari ini kita lihat semula dari mana awak bermula. Soalan baharu tentang kemahiran hari pertama. Tiada tekanan. Ia cuma menunjukkan betapa awak sudah berkembang.'] };
      }
      if (info.bonus && state.profile.diagnosticDone && info.dayOfWeek === 0) {
        return { title: ['Welcome back, ' + n + ' 🏆', 'Selamat kembali, ' + n + ' 🏆'], text: ['You finished the 12-week journey. Now we keep your skills strong with short quests.', 'Awak sudah tamat perjalanan 12 minggu. Sekarang kita kekalkan kemahiran dengan misi pendek.'] };
      }
      if (state.profile.diagnosticDone && info.inPlan && info.dayOfWeek === 0 && info.weekNo > 1) {
        var w = wk(info.week);
        return { title: ['New week, ' + n + ' 👋', 'Minggu baharu, ' + n + ' 👋'], text: ['Week ' + info.weekNo + ' is ' + w[0] + '. ' + info.week.goal, 'Minggu ' + info.weekNo + ': ' + w[1] + '. ' + (info.week.goalBm || '')] };
      }
      var dow = new Date().getDay();
      if ((dow === 0 || dow === 6) && state.sessions.filter(function (s) { return s.mode === 'quest'; }).length >= 3) {
        return { title: ['Happy weekend, ' + n + ' 😊', 'Selamat hujung minggu, ' + n + ' 😊'], text: ['Today is a short Review Mix: a few skills you already practised.', 'Hari ini Ulang Kaji Campuran yang pendek: beberapa kemahiran yang awak sudah belajar.'] };
      }
      var aq = state.activeQuest;
      if (aq && aq.day === today && aq.idx > 0) {
        var left = aq.items.length - aq.idx;
        return { title: ['Welcome back, ' + n + ' 👋', 'Selamat kembali, ' + n + ' 👋'], text: ['We paused in the middle. ' + left + ' questions left. Let’s finish together.', 'Kita berhenti separuh jalan. Tinggal ' + left + ' soalan. Mari habiskan bersama.'] };
      }
      var last = state.sessions.filter(function (s) { return s.mode === 'quest' || s.mode === 'diagnostic'; }).slice(-1)[0];
      if (!last) return { title: ['Hi ' + n + ' 👋', 'Hai ' + n + ' 👋'], text: ['Ready to get a little stronger today?', 'Sedia untuk jadi lebih kuat sedikit hari ini?'] };
      var gap = U.daysBetween(last.day, today);
      var did = last.strengthened && last.strengthened.length ? sk(last.strengthened[0]) : null;
      if (gap <= 1 && did) {
        return { title: ['Welcome back, ' + n + ' 👋', 'Selamat kembali, ' + n + ' 👋'],
          text: [(gap === 0 ? 'Earlier today' : 'Yesterday') + ' you became stronger at ' + did[0] + '. Today we’ll practise one small part again and then learn something new. Ready?',
            (gap === 0 ? 'Tadi' : 'Semalam') + ' awak jadi lebih kuat dalam ' + did[1] + '. Hari ini kita ulang sedikit, kemudian belajar sesuatu yang baharu. Sedia?'] };
      }
      return { title: ['Welcome back, ' + n + ' 🌱', 'Selamat kembali, ' + n + ' 🌱'], text: ['Let’s continue.' + (did ? ' Last time you worked on ' + did[0] + '.' : ''), 'Jom sambung.' + (did ? ' Kali lepas awak belajar ' + did[1] + '.' : '')] };
    },

    sectionIntro: function (quest, section) {
      var f = sk(quest.focus);
      if (section === 'skill' && quest.stepBackFrom) return ['Let’s make this part easier first: ' + f[0] + '.', 'Mari mudahkan bahagian ini dahulu: ' + f[1] + '.'];
      if (section === 'skill') return ['Today’s skill: ' + f[0] + '.', 'Kemahiran hari ini: ' + f[1] + '.'];
      var s = FMQ.sections[section];
      return s ? [s.intro, s.introBm || s.intro] : null;
    },

    correct: function (ctx) {
      if (ctx.wordWins && ctx.wordWins.length) return ['You understood ‘' + ctx.wordWins[0] + '’ without Word Bridge this time.', 'Awak faham perkataan ‘' + ctx.wordWins[0] + '’ tanpa Jambatan Kata kali ini.'];
      if (ctx.item.repair && ctx.outcome === 'independent') return ['Yes — you understood the idea, not just the previous question.', 'Ya — awak faham ideanya, bukan hanya soalan tadi.'];
      switch (ctx.outcome) {
        case 'independent':
          if (ctx.q.level >= 4) return ['You solved a two-step problem by yourself ⭐.', 'Awak selesaikan masalah dua langkah sendiri ⭐.'];
          return pick([['You solved that without help ⭐.', 'Awak jawab tanpa bantuan ⭐.'], ['Correct. Careful work.', 'Betul. Kerja yang teliti.'], ['Yes. You read it carefully and solved it.', 'Ya. Awak baca dengan teliti dan berjaya.'], ['Good — you chose the correct way.', 'Bagus — awak pilih cara yang betul.']]);
        case 'corrected': return ['Nice correction.', 'Bagus, awak betulkan sendiri.'];
        case 'hint1': return ['Nice recovery. Let’s try the next one by yourself.', 'Bagus. Cuba soalan seterusnya sendiri pula.'];
        case 'hint2': return ['You got there with some help. Next time, try one more step on your own.', 'Awak berjaya dengan sedikit bantuan. Lain kali, cuba satu langkah lagi sendiri.'];
        default: return ['Correct.', 'Betul.'];
      }
    },

    wrongFirst: function () { return ['Almost. Look at one part again.', 'Hampir. Lihat satu bahagian sekali lagi.']; },
    wrongDiag: function () { return pick([['Thanks for trying. We’ll work on this one together soon.', 'Terima kasih kerana mencuba. Kita akan belajar bersama nanti.'], ['Good try. This tells me where to help.', 'Cubaan yang baik. Ini membantu saya tahu di mana perlu bantu.']]); },
    rightDiag: function () { return pick([['Got it ✓', 'Betul ✓'], ['Nice — next one.', 'Bagus — seterusnya.'], ['You know this one ✓', 'Awak tahu yang ini ✓']]); },
    help: function () { return ['Let’s look at one small part first.', 'Mari lihat satu bahagian kecil dahulu.']; },
    confused: function () { return ['No problem. Let’s make this smaller.', 'Tak apa. Mari kita kecilkan langkahnya.']; },
    confusedBack: function () { return ['Good. Now let’s go back to the original idea.', 'Bagus. Sekarang mari kembali kepada soalan asal.']; },
    bridgeAfter: function () { return ['Now try the English question again 😊.', 'Sekarang cuba soalan dalam Bahasa Inggeris semula 😊.']; },
    afterExplain: function () { return ['Let’s try a different one now.', 'Mari cuba soalan yang lain pula.']; },
    lighten: function () { return ['Let’s keep today light. We’ll finish with what you’ve learned.', 'Kita buat ringan hari ini. Kita habiskan dengan apa yang awak sudah belajar.']; },
    comeback: function (id) { var s = sk(id); return ['Comeback Win 🎉 You used to need help with ' + s[0] + '. Today you solved it by yourself.', 'Kemenangan Bangkit 🎉 Dulu awak perlukan bantuan untuk ' + s[1] + '. Hari ini awak jawab sendiri.']; },
    mastered: function (id) { var s = sk(id); return ['You can do ' + s[0] + ' by yourself now 🏆.', 'Awak sudah boleh buat ' + s[1] + ' sendiri 🏆.']; },
    end: function () { return pick([['Good work today. You’re done. Go enjoy your day 😊.', 'Kerja yang bagus hari ini. Selesai. Pergilah berehat 😊.'], ['Quest complete. You worked well today. See you next time 😊.', 'Misi selesai. Awak berusaha dengan baik. Jumpa lagi 😊.'], ['That’s enough for today. Your brain did good work 🌱.', 'Cukup untuk hari ini. Otak awak sudah bekerja keras 🌱.']]); },
    stamp: function (week) { var w = wk(week); return ['Week ' + week.n + ' stamp collected: ' + w[0] + '.', 'Setem Minggu ' + week.n + ' diperoleh: ' + w[1] + '.']; },
    milestone: function (k) { return [k + ' learning days in your garden 🌸. Small steps add up.', k + ' hari belajar dalam taman awak 🌸. Langkah kecil jadi besar.']; },
    checkpointDone: function (grew) { return grew > 0 ? ['Look at that. ' + grew + ' skill' + (grew > 1 ? 's' : '') + ' you needed help with before, you solved by yourself today 🌱.', 'Lihat itu. ' + grew + ' kemahiran yang dulu perlukan bantuan, hari ini awak jawab sendiri 🌱.'] : ['Thank you. Now I know exactly what to practise next 🌱.', 'Terima kasih. Sekarang saya tahu apa yang perlu dilatih seterusnya 🌱.']; },
    diagnosticDone: function () { return ['Great — now I know where we should begin 🌱.', 'Bagus — sekarang saya tahu di mana kita patut bermula 🌱.']; },
    drillStart: function () { return ['Latih Tubi: quick questions. Try fast, but carefully.', 'Latih Tubi: soalan pantas. Cuba cepat, tetapi teliti.']; },
    drillRight: function () { return pick([['Correct ✓', 'Betul ✓'], ['Yes ✓', 'Ya ✓'], ['Good ✓', 'Bagus ✓']]); },
    drillWrong: function () { return ['Not this time. Here is the answer:', 'Belum tepat. Ini jawapannya:']; },
    drillDone: function (score, n) { return score >= n - 1 ? ['Excellent drill: ' + score + ' out of ' + n + ' 🌟.', 'Latih tubi cemerlang: ' + score + ' daripada ' + n + ' 🌟.'] : score >= n / 2 ? ['Good drill: ' + score + ' out of ' + n + '. Practice makes it easier.', 'Latih tubi yang baik: ' + score + ' daripada ' + n + '. Banyak berlatih, makin mudah.'] : [score + ' out of ' + n + '. Let’s read the guide again, then try once more.', score + ' daripada ' + n + '. Mari baca panduan sekali lagi, kemudian cuba lagi.']; },
    restHint: function () { return ['You’ve done a lot of drills today. A short break helps your brain remember.', 'Banyak latih tubi hari ini. Rehat sebentar membantu otak mengingat.']; }
  };
})();
