/*
  nownext.js
  Now & Next board with kid-friendly timers, for the hardest moments: transitions.
  "Now: brush teeth. Next: iPad." A big picture of each, and a timer that shows time passing
  without needing to read numbers:
    - Colour circle: a pie of colour that slowly disappears
    - Sand timer:    sand falls from the top to the bottom
    - Lumi's walk:   Lumi walks along stepping stones to the Next picture
  Lumi gently says "5 more minutes" and "1 more minute", then "Time for iPad!".
  It starts from today's timetable. Grown-ups press and hold Change to pick anything for Now and
  Next (including treats like iPad or the playground) and the timer length and look.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, chime, save, render, go } = A;

  // things grown-ups can put in Now or Next besides timetable steps
  const TREATS = [
    { id: 't-ipad', label: 'iPad', icon: 'tablet', tint: '#E6F0FB' },
    { id: 't-playground', label: 'Playground', icon: 'tree', tint: '#E7F3E1' },
    { id: 't-play', label: 'Play', icon: 'ball', tint: '#E7F3E1' },
    { id: 't-snack', label: 'Snack', icon: 'bowl', tint: '#FDECC8' },
    { id: 't-music', label: 'Music', icon: 'music', tint: '#F1ECFB' },
    { id: 't-story', label: 'Story', icon: 'book', tint: '#F1ECFB' },
    { id: 't-hug', label: 'Hug', icon: 'heart', tint: '#FBE3E8' },
    { id: 't-calm', label: 'Quiet time', icon: 'moon', tint: '#F1ECFB' },
    { id: 't-home', label: 'Go home', icon: 'house', tint: '#F6E7D3' },
    { id: 't-car', label: 'Car ride', icon: 'bus', tint: '#FDECC8' }
  ];
  const STYLES = [['ring', 'Colour circle'], ['sand', 'Sand timer'], ['path', 'Lumi’s walk']];
  const fromStep = (st) => { const i = A.stepInfo(st); return { label: i.label, icon: i.icon, tint: i.tint, photo: i.photo || null, stepUid: st.uid || null, stepId: st.id }; };
  const fromTreat = (t) => ({ label: t.label, icon: t.icon, tint: t.tint, treat: t.id });
  const art = (it, size) => (it.photo ? `<img class="step-photo" src="${it.photo}" width="${size}" height="${size}" alt="">` : ic(it.icon, size));

  function board() {
    const nn = state.nownext;
    if (!nn.now) {
      const { now, next, steps } = A.scheduleNow();
      const a = now || steps[0];
      nn.now = a ? fromStep(a) : fromTreat(TREATS[2]);
      const b = now ? next : steps[1];
      nn.next = b ? fromStep(b) : fromTreat(TREATS[0]);
    }
    return nn;
  }
  // after Next starts: the next timetable step after it, if there is one
  function followingOf(item) {
    if (!item || !item.stepUid) return null;
    const steps = A.dayPlan(A.todayKey());
    const k = steps.findIndex((s) => s.uid === item.stepUid);
    return k >= 0 && steps[k + 1] ? fromStep(steps[k + 1]) : null;
  }

  // ---------------------------------------------------------------- the timer (keeps going if the child leaves the screen)
  const T = { total: 0, left: 0, running: false, done: false, warned: {} };
  let tick = null;
  function resetTimer() {
    T.total = T.left = Math.max(1, Number(state.nownext.mins) || 5) * 60;
    T.running = false; T.done = false; T.warned = {};
    clearInterval(tick);
  }
  function startTimer() {
    if (T.done) return;
    if (!T.total) resetTimer();
    T.running = true;
    clearInterval(tick);
    tick = setInterval(() => {
      if (S.paused || !T.running) return;
      T.left = Math.max(0, T.left - 1);
      const nn = state.nownext;
      if (T.total >= 360 && T.left === 300 && !T.warned[5]) { T.warned[5] = 1; tone(660, 0.4, 0.05); say('5 more minutes.'); }
      if (T.total >= 120 && T.left === 60 && !T.warned[1]) { T.warned[1] = 1; tone(660, 0.4, 0.05); say('1 more minute.'); }
      if (T.left <= 0) {
        clearInterval(tick);
        T.running = false; T.done = true;
        chime();
        const line = `Time for ${nn.next ? nn.next.label : 'the next thing'}!`;
        if (S.screen === 'nownext') { render(); say(line); }
        else { A.showReminder(art(nn.next || { icon: 'clock' }, 44), line); say(line); }
        return;
      }
      if (S.screen === 'nownext') paint();
    }, 1000);
  }
  // update just the moving parts, so nothing flickers
  function paint() {
    const st = A.stage;
    const p = T.total ? T.left / T.total : 1;
    const t = st.querySelector('.nn-timer');
    if (t) t.style.setProperty('--p', p.toFixed(4));
    const w = st.querySelector('.nn-words');
    if (w) w.textContent = words();
    const n = st.querySelector('.nn-num');
    if (n) n.textContent = mmss(T.left);
    const lumi = st.querySelector('.nn-walker');
    if (lumi) lumi.style.left = `calc(${((1 - p) * 100).toFixed(2)}% - 50px)`;
  }
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function words() {
    const nn = state.nownext;
    if (T.done) return `Time for ${nn.next ? nn.next.label : 'the next thing'}!`;
    if (!T.running && T.left === T.total) { const m = Math.round(T.total / 60); return `${m} minute${m === 1 ? '' : 's'} of ${nn.now.label.toLowerCase()}`; }
    if (T.left <= 30) return 'Almost time!';
    if (T.left <= 60) return '1 more minute';
    return `${Math.ceil(T.left / 60)} more minutes`;
  }

  // ---------------------------------------------------------------- timer looks
  function timerArt(style, small) {
    const nn = state.nownext;
    if (style === 'sand') {
      return `<svg class="nn-sand ${T.running ? 'running' : ''}" viewBox="0 0 160 240" width="${small ? 70 : 170}" height="${small ? 105 : 255}" aria-hidden="true">
        <defs><clipPath id="nnTop${small ? 's' : ''}"><path d="M30 26 h100 c0 46-38 66-46 94 h-8 c-8-28-46-48-46-94z"/></clipPath><clipPath id="nnBot${small ? 's' : ''}"><path d="M30 214 h100 c0-46-38-66-46-94 h-8 c-8 28-46 48-46 94z"/></clipPath></defs>
        <g clip-path="url(#nnTop${small ? 's' : ''})"><rect class="sand-top" x="20" width="120" height="120" fill="#F4C76A" style="transform: translateY(calc(26px + (1 - var(--p, 1)) * 94px))"/></g>
        <g clip-path="url(#nnBot${small ? 's' : ''})"><rect class="sand-bot" x="20" width="120" height="120" fill="#F4C76A" style="transform: translateY(calc(214px - (1 - var(--p, 1)) * 94px))"/></g>
        <line class="sand-stream" x1="80" y1="118" x2="80" y2="210" stroke="#F4C76A" stroke-width="4" stroke-dasharray="6 6"/>
        <path d="M30 26 h100 c0 46-38 66-46 94 c8 28 46 48 46 94 h-100 c0-46 38-66 46-94 c-8-28-46-48-46-94z" fill="rgba(220,238,247,.35)" stroke="#9FB7C8" stroke-width="5" stroke-linejoin="round"/>
        <rect x="16" y="10" width="128" height="18" rx="8" fill="#A87B50" stroke="#6B4F3A" stroke-width="3"/><rect x="16" y="212" width="128" height="18" rx="8" fill="#A87B50" stroke="#6B4F3A" stroke-width="3"/>
      </svg>`;
    }
    if (style === 'path') {
      const stones = Array.from({ length: 7 }, (_, i) => `<span class="nn-stone" style="left:${6 + i * 12.5}%"></span>`).join('');
      return `<div class="nn-path ${small ? 'small' : ''}">${stones}
        <span class="nn-goal" style="background:${nn.next ? nn.next.tint : '#fff'}">${art(nn.next || { icon: 'star' }, small ? 26 : 70)}</span>
        <span class="nn-walker ${T.running ? 'walking' : ''}" style="left:calc(${small ? 30 : ((1 - (T.total ? T.left / T.total : 1)) * 100).toFixed(2)}% - 50px)">${L.svg({ look: A.dayLook(), mood: T.done ? 'excited' : 'happy', size: small ? 44 : 100, label: 'Lumi walking' })}</span></div>`;
    }
    // colour circle: a pie of colour that slowly disappears
    return `<div class="nn-pie ${small ? 'small' : ''}"><span class="nn-pie-fill"></span><span class="nn-pie-dot"></span></div>`;
  }

  // ---------------------------------------------------------------- the child's screen
  A.PARENT.nownext = 'schedule';
  A.VOICE.nownext = () => {
    const nn = board();
    return `Now, ${nn.now.label.toLowerCase()}. Next, ${nn.next ? nn.next.label.toLowerCase() : 'something fun'}.`;
  };
  A.ENTER.nownext = () => { board(); if (!T.total) resetTimer(); };
  A.SCREENS.nownext = () => {
    const nn = board();
    const style = nn.style || 'ring';
    const p = T.total ? T.left / T.total : 1;
    const buttons = T.done
      ? `<button class="primary" data-a="nnNext" style="height:92px">${art(nn.next, 46)}<span>Start ${esc(nn.next ? nn.next.label : 'next')}</span></button>`
      : T.running
        ? `<button class="soft-btn" data-a="nnPause">${ic('pause', 30)}<span>Pause</span></button><button class="soft-btn" data-a="nnFinish">${ic('check', 30)}<span>Done early</span></button>`
        : `<button class="primary" data-a="nnStart" style="height:92px">${ic('play', 44)}<span>${T.left < T.total ? 'Keep going' : 'Start timer'}</span></button>`;
    return `
<section class="screen nn" aria-label="Now and Next">
  ${A.srTitle('Now and Next')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.nownext())}</div>
    <button class="nn-change hold-btn" data-hold="cgNowNext" aria-label="Grown-ups: press and hold to change">${ic('kLock', 32)}<span>Change</span><span class="hold-fill"></span></button>
  </div>
  <div class="nn-cards">
    <div class="nn-card now ${T.done ? 'done' : ''}" style="background:${nn.now.tint}">
      <span class="when-chip now">${ic('clock', 22)}<span>Now</span></span>
      <span class="nn-art">${art(nn.now, 170)}</span><span class="nn-name">${esc(nn.now.label)}</span>
      ${T.done ? `<span class="big-check">${ic('check', 80)}</span>` : ''}
    </div>
    <span class="nn-arrow">${ic('arrow', 54)}</span>
    <div class="nn-card next ${T.done ? 'up' : ''}" style="background:${nn.next ? nn.next.tint : '#fff'}">
      <span class="when-chip">${ic('arrow', 20)}<span>Next</span></span>
      <span class="nn-art">${art(nn.next || { icon: 'star' }, 120)}</span><span class="nn-name">${esc(nn.next ? nn.next.label : 'Something fun')}</span>
    </div>
  </div>
  <div class="nn-bottom ${style}">
    <div class="nn-timer ${style} ${T.running ? 'running' : ''} ${T.done ? 'finished' : ''}" style="--p:${p.toFixed(4)}" role="timer" aria-label="${esc(words())}">${timerArt(style)}</div>
    <div class="nn-side">
      <span class="nn-words">${esc(words())}</span>
      ${nn.numbers || state.profile.age === 'teen' ? `<span class="nn-num">${mmss(T.left)}</span>` : ''}
      <div class="row gap12">${buttons}</div>
    </div>
  </div>
</section>`;
  };
  A.GUIDE.nownext = () => {
    if (T.done) return { sel: '[data-a="nnNext"]', say: 'Tap to start the next thing.' };
    if (!T.running) return { sel: '[data-a="nnStart"]', say: 'Tap Start timer.', delay: state.settings.guideDelay * 1000 + 3000 };
    return null;
  };
  A.RESTART && (A.RESTART.nownext = () => resetTimer());

  Object.assign(A.ACTIONS, {
    nnStart: () => {
      startTimer();
      render();
      const m = Math.ceil(T.left / 60);
      say(`${m} minute${m === 1 ? '' : 's'}. Then ${state.nownext.next ? state.nownext.next.label.toLowerCase() : 'the next thing'}.`);
    },
    nnPause: () => { T.running = false; render(); say('Timer paused.'); },
    nnFinish: () => { T.left = 0; T.running = false; T.done = true; clearInterval(tick); chime(); render(); say(`Well done! Time for ${state.nownext.next ? state.nownext.next.label : 'the next thing'}.`); },
    nnNext: () => {
      const nn = state.nownext;
      A.track('nownext', nn.now.label);
      const next = nn.next || fromTreat(TREATS[2]);
      nn.now = next;
      nn.next = followingOf(next) || null;
      save();
      resetTimer();
      render();
      say(A.VOICE.nownext());
    },
    // grown-ups' setup
    nnPick: (d) => {
      const [slot, kind, id] = d.v.split('|');
      let item = null;
      if (kind === 'step') { const st = A.dayPlan(A.todayKey()).find((s) => s.uid === id) || { id }; item = fromStep(st); }
      else item = fromTreat(TREATS.find((t) => t.id === id));
      state.nownext[slot] = item;
      save();
      render();
    },
    nnMins: (d) => { state.nownext.mins = Number(d.v); save(); resetTimer(); render(); },
    nnStyle: (d) => { state.nownext.style = d.v; save(); render(); },
    nnNumbers: () => { state.nownext.numbers = !state.nownext.numbers; save(); render(); },
    nnToday: () => { state.nownext.now = null; state.nownext.next = null; board(); save(); render(); },
    nnDone: () => { resetTimer(); go('nownext', undefined, { replace: true }); }
  });

  // ---------------------------------------------------------------- grown-ups: set up Now & Next
  A.PARENT.cgNowNext = 'nownext';
  A.VOICE.cgNowNext = () => '';
  const seg = (items, cur, action) => `<div class="seg" role="group">${items.map(([v, label]) => `<button class="seg-opt ${String(cur) === String(v) ? 'on' : ''}" data-a="${action}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${label}</button>`).join('')}</div>`;
  A.SCREENS.cgNowNext = () => {
    const nn = board();
    const steps = A.dayPlan(A.todayKey());
    const same = (a, b) => a && b && a.label === b.label && a.icon === b.icon;
    const chips = (slot) => {
      const cur = nn[slot];
      const s = steps.map((st) => { const it = fromStep(st); return `<button class="nn-chip ${same(cur, it) ? 'on' : ''}" data-a="nnPick" data-v="${slot}|step|${st.uid}" style="--tint:${it.tint}">${art(it, 34)}<span>${esc(it.label)}</span></button>`; }).join('');
      const t = TREATS.map((tr) => `<button class="nn-chip ${same(cur, tr) ? 'on' : ''}" data-a="nnPick" data-v="${slot}|treat|${tr.id}" style="--tint:${tr.tint}">${ic(tr.icon, 34)}<span>${esc(tr.label)}</span></button>`).join('');
      return `<div class="nn-picks"><span class="nn-picks-l">Today</span>${s || '<span class="g-note">No steps today</span>'}</div><div class="nn-picks"><span class="nn-picks-l">Fun things</span>${t}</div>`;
    };
    return `
<section class="screen grownup" aria-label="Set up Now and Next">
  <div class="row between g-header">
    <div class="row gap12"><button class="icon-btn sm" data-a="nnDone" aria-label="Back">${ic('back', 22)}</button><div class="col"><h1 class="g-title">Now &amp; Next</h1><span class="g-sub">Pick what happens now, what comes next, and the timer.</span></div></div>
    <button class="g-btn" data-a="nnDone">Done</button>
  </div>
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel grow scroll">
      <h2 class="g-h">Now</h2>${chips('now')}
      <h2 class="g-h top-gap">Next</h2>${chips('next')}
      <button class="g-link" data-a="nnToday">Start from today's timetable again</button>
    </div>
    <div class="g-panel scroll" style="width:420px">
      <h2 class="g-h">How long</h2>${seg([[1, '1 min'], [2, '2'], [5, '5'], [10, '10'], [15, '15'], [20, '20'], [30, '30']], nn.mins, 'nnMins')}
      <h2 class="g-h top-gap">Timer look</h2>
      <div class="nn-styles">${STYLES.map(([id, name]) => `<button class="nn-style ${nn.style === id ? 'on' : ''}" data-a="nnStyle" data-v="${id}" aria-pressed="${nn.style === id}"><span class="nn-style-art" style="--p:.6">${timerArt(id, true)}</span><span>${name}</span></button>`).join('')}</div>
      <button class="check-row" data-a="nnNumbers" aria-pressed="${!!nn.numbers}"><span class="box ${nn.numbers ? 'on' : ''}">${nn.numbers ? ic('check', 14) : ''}</span><span>Also show the minutes as numbers</span></button>
      <p class="g-note">Lumi says "5 more minutes" and "1 more minute" before the end, with a soft chime. The timer keeps going if your child leaves this screen, and a gentle banner pops up when time is up.</p>
    </div>
  </div>
</section>`;
  };
})();
