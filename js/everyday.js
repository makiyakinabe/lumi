/*
  everyday.js
  Small things that make Lumi easier to use every day (from the AAC playtest review):
  - Tomorrow: My day has a Tomorrow button that shows tomorrow's plan in pictures, and anything coming up,
    so the child can get ready the night before.
  - Asking is counted, not scored: every time the child asks for a break, help, stop, too loud, the toilet,
    food or a drink (talk board, Out and about, Not yet, the Break button), it is noted. Grown-ups ›
    Progress › What helped this week shows "Asked for what they needed".
  - A gentle buzz when tapping (Android tablets that can vibrate; Grown-ups › Sensory, off at first).
  - Grown-ups can hide talk board folders the child does not use (Core always stays, in the same place).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, save, render } = A;

  // ---------------------------------------------------------------- asking for what they need
  const ASK = [[/\b(a )?break\b/i, 'A break'], [/\bhelp\b/i, 'Help'], [/\bstop\b/i, 'Stop'], [/too loud/i, 'Too loud'], [/toilet/i, 'Toilet'], [/\b(all done|finished)\b/i, 'Finished'], [/\bdrink\b|\bwater\b/i, 'Drink'], [/\b(food|hungry|eat)\b/i, 'Food']];
  // app.js calls A.onTrack for everything it notes; talk board words, phrases and sentences arrive as 'talk'
  // the same ask twice within a few seconds (a word, then the sentence it is in) counts once
  let lastAsk = { w: '', t: 0 };
  function logAsk(w) { const now = Date.now(); if (lastAsk.w === w && now - lastAsk.t < 4000) return; lastAsk = { w, t: now }; if (A.supportLog) A.supportLog('ask', w); }
  A.logAsk = logAsk;
  const prevOn = A.onTrack;
  A.onTrack = (kind, detail) => {
    if (prevOn) prevOn(kind, detail);
    if (kind === 'talk' && typeof detail === 'string' && A.supportLog) {
      const hit = ASK.find(([re]) => re.test(detail));
      if (hit) logAsk(hit[1]);
    }
  };
  const prevBreak = A.ACTIONS.takeBreak;
  if (prevBreak) A.ACTIONS.takeBreak = (d) => { logAsk('A break'); return prevBreak(d); };

  // ---------------------------------------------------------------- a gentle buzz when tapping
  A.stage.addEventListener('pointerdown', (e) => {
    if (!state.settings.buzz || !navigator.vibrate) return;
    const t = e.target.closest && e.target.closest('[data-a], button');
    if (!t || t.closest('.grownup')) return;
    try { navigator.vibrate(12); } catch (err) { /* not supported */ }
  }, { passive: true });

  // ---------------------------------------------------------------- grown-ups settings
  Object.assign(A.ACTIONS, {
    cgFolder: (d) => {
      const h = state.settings.hideFolders || (state.settings.hideFolders = []);
      const i = h.indexOf(d.v);
      if (i >= 0) h.splice(i, 1); else h.push(d.v);
      if (S.aacFolder === d.v) S.aacFolder = 'core';
      save(); render();
    },
    cgOutCalm: () => { state.settings.outCalm = state.settings.outCalm === false; save(); render(); }
  });

  // ---------------------------------------------------------------- Tomorrow (on My day)
  const tomorrowKey = () => D.DAYS[(new Date().getDay() + 7) % 7].id; // DAYS starts on Monday, getDay() on Sunday
  function tomorrowHtml() {
    const k = tomorrowKey();
    const dayName = (D.DAYS.find((x) => x.id === k) || {}).name || 'Tomorrow';
    const plan = (state.week[k] || []).slice().sort((a, b) => (a.time < b.time ? -1 : 1));
    const ups = A.comingUp ? A.comingUp.list().filter((ev) => !ev.keep && A.comingUp.daysUntil(ev) === 1) : [];
    const steps = plan.map((st) => { const info = A.stepInfo(st); return `<div class="tm-step" style="background:${info.tint}"><span class="tm-art">${A.stepArt(info, 64)}</span><b>${esc(info.label)}</b><span>${A.fmt(st.time)}</span></div>`; }).join('');
    return `<div class="tm-box" role="dialog" aria-label="Tomorrow">
      <div class="tm-head">${L.svg({ look: A.lookWith(), mood: 'happy', size: 80 })}<div><b>Tomorrow is ${esc(dayName)}</b><span>${plan.length ? `${plan.length} things to do` : 'No plan yet'}</span></div><span class="grow"></span>
        <button class="primary tm-close" data-a="tmOff">${ic('check', 28)}<span>OK</span></button></div>
      ${ups.length ? `<div class="tm-up">${ic('star', 24)}<span>Coming up tomorrow: <b>${ups.map((e) => esc(e.title)).join(', ')}</b></span>${ups.map((e) => `<button class="soft-btn" data-a="cuOpen" data-v="${e.id}" data-from="schedule">${ic('kStories', 24)}<span>Read</span></button>`).join('')}</div>` : ''}
      <div class="tm-steps">${steps || '<p class="tm-none">A grown-up can make tomorrow\'s plan in Grown-ups › Timetable.</p>'}</div>
    </div>`;
  }
  const prevSchedule = A.SCREENS.schedule;
  A.SCREENS.schedule = () => {
    const html = prevSchedule();
    return S.tmrw ? html.replace(/<\/section>\s*$/, `${tomorrowHtml()}</section>`) : html;
  };
  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    if (S.screen !== 'schedule') { S.tmrw = false; return; }
    const scr = A.stage.querySelector('.screen');
    if (!scr || scr.querySelector('[data-a="tmOn"]')) return;
    const anchor = scr.querySelector('.hint-mini') || scr.querySelector('.speak-btn');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', `<button class="soft-btn tm-open" data-a="tmOn">${ic('calendar', 26)}<span>Tomorrow</span></button>`);
  };
  Object.assign(A.ACTIONS, {
    tmOn: () => {
      S.tmrw = true; render();
      const k = tomorrowKey(), plan = state.week[k] || [];
      const first = plan.slice().sort((a, b) => (a.time < b.time ? -1 : 1))[0];
      say(plan.length ? `Tomorrow is ${(D.DAYS.find((x) => x.id === k) || {}).name}. First, ${A.stepInfo(first).label.toLowerCase()}.` : 'Tomorrow has no plan yet.');
      return 'keep';
    },
    tmOff: () => { S.tmrw = false; render(); return 'keep'; }
  });
})();
