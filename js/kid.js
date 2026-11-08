/*
  kid.js
  Things that make Lumi feel calm, predictable and rewarding for the child:
  - Pause, anytime: a Pause button on every child screen opens Keep going / Start again / Exit,
    and lets the child choose Lumi's voice.
  - The real clock: the date and time come from the tablet, update live, and a new day starts at midnight.
  - Streaks (inspired by Duolingo): reach a small daily goal to keep the flame going. Lumi's shield
    protects the streak if a day is missed, and grown-ups can set rest days. It never says "you lost".
  - Badges for new skills, with a celebration.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, stage, ic, esc, say, tone, save, award, render, go, dateKey } = A;

  // ================================================================ PAUSE
  const GROWN = /^(builder|cg)/;
  const NO_PAUSE = ['menu', 'setup'];
  const childScreen = (s) => !NO_PAUSE.includes(s) && !GROWN.test(s);

  const pauseBtn = document.createElement('button');
  pauseBtn.id = 'pauseBtn';
  pauseBtn.dataset.a = 'pause';
  pauseBtn.setAttribute('aria-label', 'Pause');
  pauseBtn.innerHTML = ic('pause', 30);
  stage.appendChild(pauseBtn);

  const pauseEl = document.createElement('div');
  pauseEl.id = 'pauseMenu';
  pauseEl.hidden = true;
  pauseEl.setAttribute('role', 'dialog');
  pauseEl.setAttribute('aria-label', 'Paused');
  stage.appendChild(pauseEl);

  // what "Start again" does on each screen (others just redraw)
  const RESTART = (A.RESTART = {
    routine: () => { if (S.day) A.startDay({ fresh: true, day: S.day.dayKey, part: S.day.part }); },
    feelings: () => { S.feelPick = null; S.feelHint = false; },
    talk: () => { S.talk = []; S.said = false; S.replyShown = false; },
    calm: () => { A.resetCalm(); },
    lesson: () => { Object.assign(S.les, { i: 0, stepDone: false, progress: 0, wrong: 0 }); },
    tt: () => A.ACTIONS.tOpen({ v: 'tt' }),
    scen: () => { S.sc.chosen = null; S.sc.explored = []; },
    fsm: () => A.ACTIONS.tOpen({ v: 'fsm' }),
    mission: () => A.ACTIONS.tOpen({ v: 'mission' }),
    pet: () => { S.care = null; S.petX = null; S.petFromX = null; S.petAnim = null; },
    draw: () => A.ACTIONS.drawClear(),
    'g-bubbles': () => A.ACTIONS.gAgain({ v: 'bubbles' }, { dataset: {} }),
    'g-match': () => A.ACTIONS.gAgain({ v: 'match' }, { dataset: {} }),
    'g-jigsaw': () => A.ACTIONS.gAgain({ v: 'jigsaw' }, { dataset: {} }),
    'g-sort': () => A.ACTIONS.gAgain({ v: 'sort' }, { dataset: {} }),
    'g-pattern': () => A.ACTIONS.gAgain({ v: 'pattern' }, { dataset: {} })
  });
  const exitTarget = () => {
    if (S.appMode === 'together') return S.screen === 'together' ? 'menu' : 'together';
    return S.screen === 'home' ? 'menu' : 'home';
  };

  // the voice picker: who speaks, and how it sounds. Tapping one plays a short sample straight away.
  function whoArt(v, size) {
    if (v.id === 'lumi') return L.svg({ look: A.lookWith ? A.lookWith({ spark: 'none' }) : state.look, mood: 'happy', size });
    if (v.person && A.person) return A.person({ who: v.person, crop: 'head', h: size, mood: 'smile' });
    const pic = window.lumiPic && window.lumiPic(v.e, size);
    return pic || ic('smile', size);
  }
  A.voicePickerHtml = (o) => {
    const op = o || {};
    const size = op.size || 44;
    const st = state.settings;
    const who = st.voiceId === 'soft' ? 'lumi' : st.voiceId;
    const how = st.voiceStyle || (st.voiceId === 'soft' ? 'quiet' : 'gentle');
    return `<div class="vp ${op.cls || ''}">
      <div class="vp-row"><span class="vp-label">${ic('speaker', 20)}<span>Who speaks</span></span>
        <div class="vp-opts">${D.VOICES.map((v) => `<button class="vp-opt ${who === v.id ? 'on' : ''}" data-a="setVoice" data-v="${v.id}" aria-pressed="${who === v.id}"><span class="vp-art">${whoArt(v, size)}</span><span class="vp-name">${esc(v.name)}</span></button>`).join('')}</div></div>
      <div class="vp-row"><span class="vp-label">${ic('music', 20)}<span>How it sounds</span></span>
        <div class="vp-opts">${(D.VOICE_STYLES || []).map((v) => `<button class="vp-opt ${how === v.id ? 'on' : ''}" data-a="setVoiceStyle" data-v="${v.id}" aria-pressed="${how === v.id}"><span class="vp-art">${ic(v.icon, Math.round(size * 0.8))}</span><span class="vp-name">${esc(v.name)}</span>${op.subs ? `<small>${esc(v.sub)}</small>` : ''}</button>`).join('')}</div></div>
    </div>`;
  };
  function voiceRow() {
    if (!state.settings.childVoice) return '';
    return `<div class="pause-voices">${A.voicePickerHtml({ size: 40, cls: 'kid' })}</div>`;
  }
  function drawPause() {
    const canRestart = !!RESTART[S.screen] || /^g-/.test(S.screen);
    const exitTo = exitTarget();
    pauseEl.innerHTML = `<div class="pause-card">
      <div class="pause-head">${L.svg({ look: A.lookWith(), mood: 'sleepy', size: 110 })}<span class="pause-title">Paused</span></div>
      <div class="pause-actions">
        <button class="pause-btn resume" data-a="pResume">${ic('play', 54)}<span>Keep going</span></button>
        ${canRestart ? `<button class="pause-btn restart" data-a="pRestart">${ic('restart', 44)}<span>Start again</span></button>` : ''}
        <button class="pause-btn exit" data-a="pExit">${ic(exitTo === 'menu' ? 'exit' : 'home', 44)}<span>${exitTo === 'menu' ? 'Exit' : exitTo === 'together' ? 'Together' : 'Home'}</span></button>
      </div>
      ${voiceRow()}
    </div>`;
  }
  function pause() {
    if (S.paused) return;
    S.paused = true;
    S.pausedQueue = [];
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    S.pausedMusic = window.LumiAudio && window.LumiAudio.playing;
    if (S.pausedMusic) window.LumiAudio.stop();
    stage.classList.add('is-paused');
    A.hideHand();
    drawPause();
    pauseEl.hidden = false;
    pauseBtn.hidden = true;
    breakBtn.hidden = true;
    setTimeout(() => say('Paused. Tap Keep going when you are ready.'), 150);
  }
  function unpause(runQueue) {
    S.paused = false;
    stage.classList.remove('is-paused');
    pauseEl.hidden = true;
    const q = S.pausedQueue.splice(0);
    if (runQueue) q.forEach((fn, i) => setTimeout(fn, 250 + i * 60));
    if (S.pausedMusic && runQueue) window.LumiAudio.play(S.pausedMusic);
    S.pausedMusic = null;
    showCelebration();
  }

  Object.assign(A.ACTIONS, {
    pause: () => { pause(); return 'keep'; },
    pResume: () => {
      unpause(true);
      A.afterRender();
      const v = A.VOICE[S.screen] ? A.VOICE[S.screen]() : '';
      if (v) say(v);
    },
    pRestart: () => {
      unpause(false);
      A.clearTimers();
      const fn = RESTART[S.screen];
      if (fn) fn();
      if (S.screen !== 'routine') render();
      const v = A.VOICE[S.screen] ? A.VOICE[S.screen]() : '';
      say('Starting again. ' + (v || ''));
    },
    pExit: () => {
      unpause(false);
      const to = exitTarget();
      S.history = to === 'menu' ? [] : ['menu'];
      go(to, undefined, { replace: true });
    },
    setVoice: (d) => {
      state.settings.voiceId = d.v;
      save();
      if (S.paused) drawPause(); else render();
      const how = (D.VOICE_STYLES || []).find((v) => v.id === (state.settings.voiceStyle || 'gentle'));
      say(`Hello${state.childName ? ' ' + state.childName : ''}! This is how I sound${how ? ', ' + how.name.toLowerCase() : ''}. Let's do it together.`);
      return 'keep';
    },
    setVoiceStyle: (d) => {
      state.settings.voiceStyle = d.v;
      save();
      if (S.paused) drawPause(); else render();
      const how = D.VOICE_STYLES.find((v) => v.id === d.v);
      say(`Hello${state.childName ? ' ' + state.childName : ''}. This is my ${how.name.toLowerCase()} voice. We can take our time.`);
      return 'keep';
    }
  });

  // ================================================================ BREAK: "I need a break", on every child screen
  // One tap stops everything (like Pause) and opens a quiet break space: slow breathing with Lumi,
  // calm music or total quiet, and a big "I need a break" card the child can show a grown-up.
  // Breaks are never a failure: they are logged for grown-ups as a good way of asking for help.
  const breakBtn = document.createElement('button');
  breakBtn.id = 'breakBtn';
  breakBtn.dataset.a = 'takeBreak';
  breakBtn.setAttribute('aria-label', 'I need a break');
  breakBtn.innerHTML = `${ic('kBreak', 44)}<span>Break</span>`;
  stage.appendChild(breakBtn);
  const breakEl = document.createElement('div');
  breakEl.id = 'breakMenu';
  breakEl.hidden = true;
  breakEl.setAttribute('role', 'dialog');
  breakEl.setAttribute('aria-label', 'Break time');
  stage.appendChild(breakEl);
  let breakTick = null;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function drawBreak() {
    const b = S.brk;
    breakEl.className = b.quiet ? 'quiet' : '';
    breakEl.innerHTML = `<div class="brk">
      <div class="brk-top"><span class="brk-title">${ic('kBreak', 54)}<span>Break time</span></span><span class="brk-time">${ic('clock', 24)}<span>${mmss(Math.round((Date.now() - b.t) / 1000))}</span></span></div>
      ${b.move && A.moveBreakHtml ? A.moveBreakHtml(b) : `<div class="brk-mid">
        <div class="brk-breathe"><span class="brk-ring"></span><span class="brk-ring r2"></span><span class="brk-lumi">${L.svg({ look: A.lookWith(), mood: 'calm', size: 200, label: 'Lumi breathing slowly' })}</span></div>
        <div class="brk-words" aria-hidden="true"><span class="in">Breathe in</span><span class="out">Breathe out</span></div>
      </div>`}
      <div class="brk-opts">
        <button class="brk-opt ${b.music ? 'on' : ''}" data-a="brkMusic" aria-pressed="${!!b.music}">${ic('music', 40)}<span>Music</span></button>
        <button class="brk-opt ${b.quiet ? 'on' : ''}" data-a="brkQuiet" aria-pressed="${!!b.quiet}">${ic('quiet', 40)}<span>Quiet</span></button>
        ${A.moveBreakOn && A.moveBreakOn() ? `<button class="brk-opt ${b.move ? 'on' : ''}" data-a="brkMove" aria-pressed="${!!b.move}">${ic(b.move ? 'kCalm' : 'stretch', 40)}<span>${b.move ? 'Breathe' : 'Move'}</span></button>` : ''}
        <button class="brk-opt" data-a="brkTell">${ic('person', 40)}<span>Show a grown-up</span></button>
        <button class="primary brk-ready" data-a="brkDone">${ic('check', 36)}<span>I'm ready</span></button>
      </div>
      ${b.tell ? `<button class="brk-card" data-a="brkTellOff" aria-label="I need a break. Tap to close.">${ic('kBreak', 120)}<b>I need a break</b><span>${esc(state.childName || 'I')} ${state.childName ? 'needs' : 'need'} a quiet minute, please.</span></button>` : ''}
    </div>`;
  }
  function takeBreak() {
    if (S.paused) return;
    S.paused = true;
    S.pausedQueue = [];
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    S.pausedMusic = window.LumiAudio && window.LumiAudio.playing;
    if (S.pausedMusic) window.LumiAudio.stop();
    S.brk = { t: Date.now(), music: false, quiet: false, tell: false, from: S.screen };
    stage.classList.add('is-paused');
    A.hideHand();
    drawBreak();
    breakEl.hidden = false;
    pauseBtn.hidden = true;
    breakBtn.hidden = true;
    A.track('breaks', screenName(S.screen));
    tone(523, 0.6, 0.05);
    setTimeout(() => say("It's okay to take a break. Breathe slowly with me."), 300);
    clearInterval(breakTick);
    breakTick = setInterval(() => {
      const t = breakEl.querySelector('.brk-time span');
      if (t && S.brk) t.textContent = mmss(Math.round((Date.now() - S.brk.t) / 1000));
    }, 1000);
  }
  A.drawBreak = () => { if (S.brk) drawBreak(); };
  function endBreak() {
    clearInterval(breakTick);
    if (A.moveBreakStop) A.moveBreakStop();
    if (S.brk && S.brk.music && window.LumiAudio) window.LumiAudio.stop();
    S.mute = false;
    S.brk = null;
    breakEl.hidden = true;
    unpause(true);
    A.afterRender();
  }
  const SCREEN_NAMES = { home: 'Home', routine: 'My day', talk: 'Talk', calm: 'Calm', feelings: 'Feelings', fun: 'Fun', story: 'a story', lesson: 'a lesson', pet: 'Pet corner' };
  function screenName(s) { return SCREEN_NAMES[s] || (/^g-/.test(s) ? 'a game' : s); }
  Object.assign(A.ACTIONS, {
    takeBreak: () => { takeBreak(); return 'keep'; },
    brkMusic: () => {
      const b = S.brk;
      b.music = !b.music;
      if (b.music) { b.quiet = false; S.mute = false; if (window.LumiAudio) window.LumiAudio.play('lullaby'); } else if (window.LumiAudio) window.LumiAudio.stop();
      drawBreak();
      return 'keep';
    },
    brkQuiet: () => {
      const b = S.brk;
      b.quiet = !b.quiet;
      if (b.quiet) { try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ } if (b.music && window.LumiAudio) window.LumiAudio.stop(); b.music = false; }
      S.mute = b.quiet;
      drawBreak();
      return 'keep';
    },
    brkTell: () => {
      S.brk.tell = true;
      drawBreak();
      // three soft notes so a grown-up nearby notices
      if (!S.brk.quiet) { tone(659, 0.35, 0.06); setTimeout(() => tone(784, 0.35, 0.06), 260); setTimeout(() => tone(988, 0.5, 0.06), 520); }
      A.track('breakAsk', screenName(S.brk.from), { quiet: true });
      return 'keep';
    },
    brkTellOff: () => { S.brk.tell = false; drawBreak(); return 'keep'; },
    brkDone: () => {
      endBreak();
      const v = A.VOICE[S.screen] ? A.VOICE[S.screen]() : '';
      say('Welcome back! ' + (v || ''));
    }
  });

  // ================================================================ after every redraw
  A.afterRender = () => {
    const show = childScreen(S.screen) && !S.paused;
    if (queue.length && celEl.hidden) setTimeout(showCelebration, 900);
    if (!childScreen(S.screen) && celEl && !celEl.hidden) { celEl.hidden = true; S.celebrating = false; }
    pauseBtn.hidden = !show;
    const brk = show && state.settings.breakBtn !== false && S.screen !== 'end'; // the day is over: no Break needed
    breakBtn.hidden = !brk;
    if (show) {
      const top = stage.querySelector('#screen .screen > .row');
      if (top) { top.classList.add('pad-pause'); top.classList.toggle('pad-break', brk); }
    }
    tickClock();
  };

  // ================================================================ REAL TIME from the tablet's clock
  S.today = dateKey();
  function tickClock() {
    const t = A.fmt(A.fromMin(A.nowMin()));
    stage.querySelectorAll('[data-clock="time"]').forEach((el) => { if (el.textContent !== t) el.textContent = t; });
    const d = A.longDate();
    stage.querySelectorAll('[data-clock="date"]').forEach((el) => { if (el.textContent !== d) el.textContent = d; });
  }
  function checkNewDay() {
    const k = dateKey();
    if (k === S.today) return;
    // a new day has started (midnight, or the tablet woke up the next morning)
    S.today = k;
    if (S.day && S.screen !== 'routine' && S.screen !== 'end') S.day = null;
    reconcileStreak();
    if (['home', 'schedule', 'trophies'].includes(S.screen) && !S.paused) render();
  }
  setInterval(() => { tickClock(); checkNewDay(); }, 15000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { tickClock(); checkNewDay(); if (S.screen === 'schedule' && !S.paused) render(); }
  });

  // minutes played per day (for the grown-ups), counted only while the child is actually using Lumi
  S.lastInput = 0;
  stage.addEventListener('pointerdown', () => { S.lastInput = Date.now(); }, true);
  setInterval(() => {
    if (document.visibilityState === 'visible' && !S.paused && childScreen(S.screen) && Date.now() - S.lastInput < 120000) A.track('minutes', '', { quiet: true });
  }, 60000);

  // ================================================================ STREAKS
  const ACTIVE = ['steps', 'checklists', 'talk', 'calm', 'games', 'tutorials', 'together', 'stories', 'petCare', 'feelings'];
  const st = () => state.streak;
  const keyToDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const dayIdOf = (date) => D.DAYS[(date.getDay() + 6) % 7].id;
  const weekOf = (date) => { const d = new Date(date); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dateKey(d); };
  function todayPoints() {
    const day = state.log[dateKey()] || {};
    return ACTIVE.reduce((t, k) => t + (k === 'feelings' ? Object.values(day.feelings || {}).reduce((a, b) => a + b, 0) : day[k] || 0), 0);
  }
  const metToday = () => st().last === dateKey();
  // days the child missed since the last goal (rest days don't count)
  function missedSince(lastKey) {
    if (!lastKey) return 0;
    const d = keyToDate(lastKey);
    const today = keyToDate(dateKey());
    let missed = 0;
    d.setDate(d.getDate() + 1);
    while (d < today) {
      if (!(st().restDays || []).includes(dayIdOf(d))) missed += 1;
      d.setDate(d.getDate() + 1);
    }
    return missed;
  }
  function reconcileStreak() {
    const s = st();
    const wk = weekOf(new Date());
    if (!s.shieldWeek) s.shieldWeek = wk;
    else if (s.shieldWeek !== wk) { s.shieldWeek = wk; s.shields = Math.min(2, (s.shields || 0) + 1); }
    if (s.last && !metToday() && missedSince(s.last) > (s.shields || 0)) s.count = 0;
    save();
  }
  function meetGoal() {
    const s = st();
    if (metToday()) return;
    const missed = missedSince(s.last);
    if (s.last && s.count > 0 && missed <= (s.shields || 0)) {
      if (missed > 0) { s.shields -= missed; s.shieldUsed = dateKey(); }
      s.count += 1;
    } else s.count = 1;
    s.last = dateKey();
    s.days = (s.days || []).concat([dateKey()]).slice(-90);
    s.best = Math.max(s.best || 0, s.count);
    save();
    award(Math.min(5, 1 + Math.floor(s.count / 3)));
    queueCelebration(streakCelebration(), s.count === 1 ? 'You reached your goal today! Your streak has started.' : `${s.count} days in a row! Your streak is ${s.count}.`);
    checkSkillBadges();
  }
  A.streakChip = () => {
    const s = st();
    const lit = metToday();
    const goal = s.goal || 3;
    const pts = Math.min(goal, todayPoints());
    return `<button class="streak-chip ${lit ? 'lit' : ''}" data-a="nav" data-to="trophies" aria-label="Streak: ${s.count} days. Today ${pts} of ${goal}">
      ${ic(lit ? 'flame' : 'flameGrey', 34)}<span class="streak-n">${s.count}</span>
      ${lit ? '' : `<span class="goal-dots">${Array.from({ length: goal }, (_, i) => `<i class="${i < pts ? 'on' : ''}"></i>`).join('')}</span>`}</button>`;
  };
  function weekStrip(big) {
    const s = st();
    const mon = keyToDate(weekOf(new Date()));
    let h = '<div class="week-strip">';
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      const k = dateKey(d);
      const isToday = k === dateKey();
      const done = (s.days || []).includes(k);
      const rest = (s.restDays || []).includes(dayIdOf(d));
      const art = done ? ic('flame', big ? 40 : 30) : rest ? ic('moon', big ? 30 : 24) : isToday ? ic('flameGrey', big ? 40 : 30) : '';
      h += `<span class="wk-day ${done ? 'done' : ''} ${isToday ? 'today' : ''}"><span class="wk-dot">${art}</span><span class="wk-label">${D.DAYS[i].short}</span></span>`;
    }
    return h + '</div>';
  }
  function streakCelebration() {
    const s = st();
    return `<div class="celebrate-art streak-art"><span class="big-flame">${ic('flame', 170)}</span><span class="big-num-flame">${s.count}</span></div>
      <div class="celebrate-title">${s.count === 1 ? 'Streak started!' : `${s.count} day streak!`}</div>
      ${weekStrip(true)}`;
  }

  // ================================================================ SKILL BADGES
  function passes(b) {
    const t = b.test;
    const stt = state.stats;
    if (t.stat) return (stt[t.stat] || 0) >= t.n;
    if (t.len) return (stt[t.len] || []).length >= t.n;
    if (t.tut) return !!(stt.tutDone && stt.tutDone[t.tut]);
    if (t.story) return A.storiesForAge().every((x) => stt.storyDone && stt.storyDone[x.id]);
    if (t.streak) return (st().best || 0) >= t.streak;
    return false;
  }
  function badgeArt(b, size, locked) {
    const c = locked ? '#C9B8A4' : b.color;
    return `<svg class="badge-art ${locked ? 'locked' : ''}" width="${size}" height="${size * 1.1}" viewBox="0 0 100 110" aria-hidden="true">
      <path d="M30 70 L18 106 L35 99 L43 109 L52 76Z" fill="${c}" opacity=".75"/><path d="M70 70 L82 106 L65 99 L57 109 L48 76Z" fill="${c}" opacity=".75"/>
      <circle cx="50" cy="48" r="42" fill="${c}"/><circle cx="50" cy="48" r="42" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-dasharray="4 5"/>
      <circle cx="50" cy="48" r="31" fill="#fff"/>
      <g transform="translate(28 26)" style="color:${c}">${locked ? ic('lock', 44) : ic(b.icon, 44)}</g></svg>`;
  }
  A.badgeArt = badgeArt;
  function checkSkillBadges() {
    D.SKILL_BADGES.forEach((b) => {
      if (state.skillBadges.includes(b.id) || !passes(b)) return;
      state.skillBadges.push(b.id);
      state.badgeDates[b.id] = dateKey();
      save();
      award(2);
      queueCelebration(`<div class="celebrate-art">${badgeArt(b, 190)}</div><div class="celebrate-title">New badge!</div><div class="celebrate-sub">${esc(b.name)}</div>`,
        `You earned a new badge: ${b.name}!`);
    });
  }
  A.checkSkillBadges = checkSkillBadges;

  // ================================================================ celebrations (one at a time)
  const celEl = document.createElement('div');
  celEl.id = 'celebrate';
  celEl.hidden = true;
  stage.appendChild(celEl);
  const queue = [];
  function queueCelebration(html, voice) {
    queue.push({ html, voice });
    setTimeout(showCelebration, 1300);
  }
  // A badge or streak never pops up in the middle of something: it waits until the step is finished
  // (the step's own "well done", the end of a story or lesson, or a calm screen like Home).
  function busy() {
    if (S.screen === 'routine') return !!(S.day && !S.day.celebrate && !(S.day.game && S.day.game.phase === 'turn'));
    if (S.screen === 'story') return !!(S.sx && !S.sx.ended && !S.sx.done);
    if (S.screen === 'lesson') return !!(S.les && !S.les.stepDone && (S.les.steps[S.les.i] || {}).act !== 'done');
    if (/^g-|^tg|^(tt|scen|fsm|mission|nownext)$/.test(S.screen)) return true;
    return false;
  }
  A.celebrationWaiting = () => queue.length > 0;
  A.showCelebrationSoon = () => { if (queue.length) setTimeout(showCelebration, 700); };
  function showCelebration() {
    if (!celEl.hidden || S.paused || !queue.length || !childScreen(S.screen) || busy()) return;
    const c = queue.shift();
    celEl.innerHTML = `<div class="celebrate-card">${c.html}
      <span class="confetti">${Array.from({ length: 14 }, (_, i) => `<i style="left:${(i * 7.3) % 100}%;animation-delay:${(i % 5) * 0.15}s;background:${['#F4D35E', '#EF8A7A', '#8EB8E5', '#9CCB7A', '#B9A6E0'][i % 5]}"></i>`).join('')}</span>
      <button class="primary" data-a="celebrateClose" style="height:84px">${ic('check', 36)}<span>Yay!</span></button></div>`;
    celEl.hidden = false;
    S.celebrating = true;
    A.hideHand();
    tone(659, 0.25, 0.1); setTimeout(() => tone(880, 0.25, 0.1), 160); setTimeout(() => tone(1175, 0.5, 0.1), 320);
    say(c.voice);
  }
  A.ACTIONS.celebrateClose = () => { celEl.hidden = true; S.celebrating = false; setTimeout(showCelebration, 300); };

  // every tracked activity can move the daily goal and unlock badges
  A.onTrack = (kind) => {
    if (ACTIVE.includes(kind) && !metToday() && todayPoints() >= (st().goal || 3)) meetGoal();
    if (kind !== 'minutes' && kind !== 'hints') checkSkillBadges();
  };

  // ================================================================ the child's "My stars" screen: streak and badges
  A.PARENT.trophies = 'home';
  A.VOICE.trophies = () => {
    const s = st();
    if (metToday()) return `Your streak is ${s.count}. You reached your goal today!`;
    const left = Math.max(0, (s.goal || 3) - todayPoints());
    return `Do ${left} more ${left === 1 ? 'thing' : 'things'} with Lumi today to ${s.count ? 'keep your streak' : 'start a streak'}.`;
  };
  A.SCREENS.trophies = () => {
    const s = st();
    const goal = s.goal || 3;
    const pts = Math.min(goal, todayPoints());
    const R = 52;
    const C = 2 * Math.PI * R;
    const ring = `<svg width="130" height="130" viewBox="0 0 130 130" aria-hidden="true"><circle cx="65" cy="65" r="${R}" fill="none" stroke="#EFE3D2" stroke-width="14"/>
      <circle cx="65" cy="65" r="${R}" fill="none" stroke="#FF9600" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pts / goal)}" transform="rotate(-90 65 65)"/></svg>`;
    const sel = D.SKILL_BADGES.find((b) => b.id === S.badgeSel);
    const badges = D.SKILL_BADGES.map((b) => {
      const got = state.skillBadges.includes(b.id);
      return `<button class="badge-tile ${got ? 'got' : ''} ${S.badgeSel === b.id ? 'sel' : ''}" data-a="badgeSel" data-v="${b.id}" aria-label="${esc(b.name)}${got ? '' : ', not yet'}">${badgeArt(b, 64, !got)}<span>${got ? esc(b.name) : '?'}</span></button>`;
    }).join('');
    return `
<section class="screen" aria-label="My stars">
  ${A.srTitle('My streak and badges')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.trophies())}</div>
    ${A.starChip(false)}
  </div>
  <div class="row gap24 grow">
    <div class="panel streak-panel" style="width:430px">
      <div class="streak-hero ${metToday() ? 'lit' : ''}">${ic(metToday() ? 'flame' : 'flameGrey', 120)}<span class="streak-big">${s.count}</span><span class="streak-word">${s.count === 1 ? 'day' : 'days'}</span></div>
      ${weekStrip(false)}
      <div class="goal-box"><div class="goal-ring">${ring}<span class="goal-ring-n">${pts}/${goal}</span></div>
        <div class="col gap8"><span class="label">Today</span><span class="small muted">${metToday() ? 'Goal reached!' : 'Do things with Lumi to fill the ring.'}</span></div></div>
      <div class="shield-box">${ic('shield', 40)}<span><b>× ${s.shields || 0}</b> Lumi's shield keeps your streak safe if you miss a day.</span></div>
    </div>
    <div class="col gap12 grow">
      <div class="badge-grid">${badges}</div>
      <div class="badge-info">${sel ? `${badgeArt(sel, 54, !state.skillBadges.includes(sel.id))}<span><b>${esc(sel.name)}</b><br>${esc(sel.how)}</span>` : `${ic('medal', 30)}<span>Tap a badge to see how to get it.</span>`}</div>
    </div>
  </div>
</section>`;
  };
  A.ACTIONS.badgeSel = (d) => {
    S.badgeSel = d.v;
    render();
    const b = D.SKILL_BADGES.find((x) => x.id === d.v);
    say(state.skillBadges.includes(b.id) ? `${b.name}. You did it!` : `${b.how}.`);
  };

  reconcileStreak();
  A.metToday = metToday;
  A.todayPoints = todayPoints;
  A.weekStrip = weekStrip;
})();
