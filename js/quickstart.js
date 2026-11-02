/*
  quickstart.js
  Sensory quick-start: five simple questions for grown-ups. The answers set sound, animation,
  voice, pace and colours, so nobody has to understand every setting first. Everything can still
  be fine-tuned in Grown-ups › Sensory afterwards.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, S, state, ic, esc, save, render, go, say } = A;

  const QS = [
    { id: 'sound', icon: 'volume', q: 'Do loud or sudden sounds upset your child?' },
    { id: 'motion', icon: 'motion', q: 'Do moving, bouncing or flashing things on screen bother your child?' },
    { id: 'voice', icon: 'speaker', q: 'Does your child enjoy hearing Lumi talk?' },
    { id: 'pace', icon: 'hourglass', q: 'Does your child need extra time to understand what is said?' },
    { id: 'colour', icon: 'palette', q: 'Do bright, busy colours overwhelm your child?' }
  ];
  const ANS = [['yes', 'Yes'], ['some', 'Sometimes'], ['no', 'No']];

  // what each answer changes, in plain words for the summary
  function apply(a) {
    const st = state.settings;
    const out = [];
    if (a.sound === 'yes') { st.sounds = false; st.musicVolume = 0.3; st.voiceStyle = 'quiet'; out.push('Chimes off, music quiet, a quiet voice'); }
    else if (a.sound === 'some') { st.sounds = true; st.musicVolume = 0.3; out.push('Chimes on, music quiet'); }
    else if (a.sound === 'no') { st.sounds = true; st.musicVolume = 0.6; out.push('Chimes and music at a normal level'); }
    if (a.motion === 'yes' || a.motion === 'some') { st.reduceMotion = true; out.push('Less animation (no bouncing or moving backgrounds)'); }
    else if (a.motion === 'no') { st.reduceMotion = false; out.push('Normal animation'); }
    if (a.voice === 'no') { st.voice = false; out.push('Lumi stays quiet (pictures and words only)'); }
    else if (a.voice === 'some') { st.voice = true; st.speakWords = false; out.push('Lumi talks, but the talk board does not read every word aloud'); }
    else if (a.voice === 'yes') { st.voice = true; st.speakWords = true; out.push('Lumi talks and reads talk-board words aloud'); }
    if (a.pace === 'yes') { st.voiceRate = 0.7; st.guideDelay = 10; st.textSize = 1.15; out.push('Slow voice, larger text, the helping hand waits longer'); }
    else if (a.pace === 'some') { st.voiceRate = 0.8; st.guideDelay = 6; out.push('A calm, slightly slower voice'); }
    else if (a.pace === 'no') { st.voiceRate = 0.9; out.push('Normal voice pace'); }
    if (a.colour === 'yes') { state.profile.theme = 'soft'; out.push('Low-colour "Soft" colours'); }
    else if (a.colour === 'some') { state.profile.theme = 'mist'; out.push('Gentle misty-blue colours'); }
    save();
    A.applyPrefs();
    return out;
  }

  A.PARENT.cgQuiz = 'cgSensory';
  A.VOICE.cgQuiz = () => '';
  A.ENTER.cgQuiz = () => { if (!S.quiz) S.quiz = { i: 0, a: Object.assign({}, state.sensory.answers), summary: null }; };
  A.SCREENS.cgQuiz = () => {
    const z = S.quiz || (S.quiz = { i: 0, a: {}, summary: null });
    const header = `<div class="row between g-header">
      <div class="row gap12"><button class="icon-btn sm" data-a="qzExit" aria-label="Back">${ic('back', 22)}</button><div class="col"><h1 class="g-title">Sensory quick-start</h1><span class="g-sub">Five questions. About one minute.</span></div></div>
      <button class="g-btn outline" data-a="qzExit">${z.summary ? 'Done' : 'Skip'}</button></div>`;
    if (z.summary) {
      return `<section class="screen grownup" aria-label="Sensory quick-start">${header}
        <div class="g-panel grow qz-card">
          <span class="qz-ic done">${ic('check', 54)}</span>
          <h2 class="qz-q">All set for ${esc(state.childName || 'your child')}</h2>
          <ul class="qz-sum">${z.summary.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <p class="g-note">You can change any of these in Grown-ups › Sensory, or answer again later.</p>
          <div class="row gap12"><button class="g-btn" data-a="qzExit">Done</button><button class="g-btn outline" data-a="qzAgain">Answer again</button></div>
        </div></section>`;
    }
    const q = QS[z.i];
    return `<section class="screen grownup" aria-label="Sensory quick-start">${header}
      <div class="g-panel grow qz-card">
        <div class="qz-dots">${QS.map((_, k) => `<span class="${k < z.i ? 'done' : k === z.i ? 'cur' : ''}"></span>`).join('')}</div>
        <span class="qz-ic">${ic(q.icon, 54)}</span>
        <h2 class="qz-q">${esc(q.q)}</h2>
        <div class="qz-ans">${ANS.map(([v, l]) => `<button class="qz-a ${z.a[q.id] === v ? 'on' : ''}" data-a="qzAns" data-v="${v}">${l}</button>`).join('')}</div>
        ${z.i > 0 ? `<button class="g-link" data-a="qzBack">Back to the last question</button>` : '<span class="g-note">There are no wrong answers. Pick what is true most days.</span>'}
      </div></section>`;
  };
  Object.assign(A.ACTIONS, {
    qzAns: (d) => {
      const z = S.quiz;
      z.a[QS[z.i].id] = d.v;
      if (z.i < QS.length - 1) z.i += 1;
      else { state.sensory = { done: true, answers: Object.assign({}, z.a) }; z.summary = apply(z.a); A.track('sensoryQuiz', '', { quiet: true }); }
      render();
    },
    qzBack: () => { S.quiz.i = Math.max(0, S.quiz.i - 1); render(); },
    qzAgain: () => { S.quiz = { i: 0, a: {}, summary: null }; render(); },
    qzExit: () => { const back = S.quizFrom || 'cgSensory'; S.quiz = null; S.quizFrom = null; go(back, undefined, { replace: true }); },
    qzOpen: (d) => { S.quiz = null; S.quizFrom = d.v || 'cgSensory'; go('cgQuiz'); }
  });
})();
