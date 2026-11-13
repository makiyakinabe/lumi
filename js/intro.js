/*
  intro.js
  Lumi's story: the first thing a child sees.
  A short loading screen, then four story pictures (Lumi up in the sky, wishing for a friend, sliding down,
  landing in the room), then Lumi says hello as the child's buddy, asks their name and greets them by it.
  The child sets the pace: nothing moves on until they tap. It plays once per child (state.introDone);
  a grown-up can play it again from Grown-ups › Child.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, tone, save, render, go, later } = A;

  const STORY = [
    { sky: true, mood: 'sleepy', text: 'High up in the night sky lived a little one called Lumi.' },
    { sky: true, mood: 'sad', text: 'Lumi looked down at all the homes. Lumi wished for a friend.' },
    { sky: true, mood: 'excited', text: 'So one night, Lumi slid down a shooting star. Whoosh!' },
    { mood: 'happy', text: 'Lumi landed softly in a cosy room. This room!' },
    { mood: 'excited', wave: true, text: 'Hi! I am Lumi. I am your buddy. We can play, learn and get through the day together.' }
  ];
  const NAME = STORY.length + 1; // step numbers: 0 loading, 1..5 story, then name, then hello
  const HELLO = NAME + 1;
  const it = () => S.intro || (S.intro = { step: 0, ready: false });
  const kid = () => (state.childName || '').trim();
  const lineOf = (step) => (step === NAME ? 'What is your name?' : step === HELLO ? (kid() ? `Hello, ${kid()}! I am so happy to be your buddy.` : 'Hello, my friend! I am so happy to be your buddy.') : step >= 1 ? STORY[step - 1].text : '');
  const lumi = (mood, size, wave) => L.svg({ look: A.lookWith(), mood, size, wave: !!wave });

  // a row of flats with lit windows, drawn once
  const skyline = (() => {
    let h = '';
    const blocks = [[0, 150, 150], [160, 210, 120], [290, 120, 170], [470, 190, 140], [620, 130, 110], [740, 230, 160], [910, 160, 130], [1050, 200, 150]];
    blocks.forEach(([x, bh, w], bi) => {
      h += `<rect x="${x}" y="${260 - bh}" width="${w}" height="${bh}" rx="6" fill="#1F2A4D"/>`;
      for (let r = 0; r < Math.floor((bh - 20) / 34); r++) for (let c = 0; c < Math.floor((w - 16) / 30); c++) {
        const lit = (r * 7 + c * 3 + bi * 5) % 4 !== 0;
        h += `<rect x="${x + 12 + c * 30}" y="${260 - bh + 14 + r * 34}" width="16" height="18" rx="3" fill="${lit ? '#F7D774' : '#34406B'}"/>`;
      }
    });
    return `<svg class="in-city" viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${h}</svg>`;
  })();

  function picture(step) {
    if (step === 0) return `<div class="in-art in-sky"><span class="in-moon"></span><span class="in-glow">${lumi('sleepy', 230)}</span></div>`;
    if (step === NAME || step === HELLO) return '';
    const s = STORY[step - 1];
    if (s.sky) {
      const pos = step === 1 ? 'p1' : step === 2 ? 'p2' : 'p3';
      return `<div class="in-art in-sky ${pos}"><span class="in-moon"></span>${step === 3 ? '<span class="in-trail"></span>' : ''}<span class="in-glow">${lumi(s.mood, step === 3 ? 170 : 210)}</span>${step > 1 ? skyline : ''}</div>`;
    }
    const skin = A.roomSkin ? A.roomSkin() : { wall: '#F6E7D3', floor: '#E8CDB0' };
    return `<div class="in-art in-room" style="background:${skin.wall}"><span class="in-window"><i></i></span><span class="in-floor" style="background:${skin.floor}"></span><span class="in-rug"></span>
      <span class="in-lumi ${step === 4 ? 'land' : 'bobble'}">${lumi(s.mood, 300, s.wave)}</span>${step === 4 ? '<span class="in-spark a"></span><span class="in-spark b"></span><span class="in-spark c"></span>' : ''}</div>`;
  }

  A.VOICE.intro = () => '';
  A.SCREENS.intro = () => {
    const t = it();
    const step = t.step;
    const dots = `<span class="in-dots" aria-hidden="true">${Array.from({ length: HELLO }, (_, i) => `<i class="${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}"></i>`).join('')}</span>`;
    if (step === 0) return `
<section class="screen intro dark" aria-label="Lumi is getting ready">
  ${picture(0)}
  <div class="in-title"><h1>Lumi</h1><span>Your buddy for the day</span></div>
  <div class="in-load">${t.ready
    ? `<button class="primary big in-start" data-a="introNext">${ic('play', 44)}<span>Start</span></button>`
    : '<span class="in-bar" role="progressbar" aria-label="Getting ready"><i></i></span><span class="in-wait">Lumi is waking up…</span>'}</div>
</section>`;
    const text = lineOf(step);
    if (step === NAME) return `
<section class="screen intro" aria-label="Tell Lumi your name">
  <button class="in-skip" data-a="introSkip">Skip</button>
  <div class="in-ask">
    <span class="in-lumi bobble">${lumi('happy', 300, true)}</span>
    <div class="in-form">
      <div class="in-bubble"><span>${esc(text)}</span>${A.speakBtn(text, 52)}</div>
      <input id="in-name" class="in-name" type="text" data-input="childName" value="${esc(state.childName || '')}" maxlength="20" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Type your name" aria-label="Your name">
      <button class="primary big" data-a="introNext">${ic('check', 40)}<span>That is me</span></button>
      <span class="in-help">A grown-up can help you type.</span>
    </div>
  </div>
  ${dots}
</section>`;
    if (step === HELLO) return `
<section class="screen intro" aria-label="Lumi says hello">
  <div class="in-hello">
    ${Array.from({ length: 12 }, (_, i) => `<span class="in-conf c${i % 4}" style="left:${6 + i * 8}%;animation-delay:${(i % 5) * 0.18}s"></span>`).join('')}
    <span class="in-lumi bobble">${lumi('excited', 320, true)}</span>
    <h1 class="in-hi">${kid() ? `Hello, <b>${esc(kid())}</b>!` : 'Hello, my friend!'}</h1>
    <span class="in-hi-sub">I am so happy to be your buddy.</span>
    <div class="row gap16">${A.speakBtn(text, 64)}<button class="primary big" data-a="introDone"><span>Let's go</span>${ic('arrow', 40)}</button></div>
  </div>
</section>`;
    const s = STORY[step - 1];
    return `
<section class="screen intro ${s.sky ? 'dark' : ''}" aria-label="Lumi's story, page ${step} of ${STORY.length}">
  <button class="in-skip" data-a="introSkip">Skip</button>
  ${picture(step)}
  <div class="in-cap">
    ${A.speakBtn(text, 64)}
    <p>${esc(text)}</p>
    <button class="primary in-next" data-a="introNext" aria-label="Next">${ic('arrow', 40)}</button>
  </div>
  ${dots}
</section>`;
  };

  A.ENTER.intro = () => {
    const t = it();
    if (t.step === 0 && !t.ready) later(() => { if (S.screen === 'intro' && it().step === 0) { it().ready = true; render(); } }, 2400);
  };

  function finish() {
    state.introDone = true;
    S.intro = null;
    save();
    go(A.introAfter ? A.introAfter() : 'menu');
  }
  Object.assign(A.ACTIONS, {
    introNext: () => {
      const t = it();
      if (t.step === 0 && !t.ready) return;
      if (t.step === NAME) { const el = document.getElementById('in-name'); if (el) { state.childName = el.value.trim(); el.blur(); } save(); }
      t.step = Math.min(HELLO, t.step + 1);
      tone(t.step === HELLO ? 784 : 523, 0.25, 0.06);
      render();
      say(lineOf(t.step));
      if (t.step === NAME) later(() => { const el = document.getElementById('in-name'); if (el && !el.value) try { el.focus({ preventScroll: true }); } catch (e) { /* no keyboard, no problem */ } }, 500);
    },
    introSkip: finish,
    introDone: finish,
    introReplay: () => { S.intro = { step: 0, ready: false }; go('intro'); }
  });
  // Enter on the keyboard is the same as tapping "That is me"
  A.stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'in-name') { e.preventDefault(); A.ACTIONS.introNext(); }
  });

  // when it plays: straight after a grown-up finishes setting up, or the first time an existing child opens Lumi
  const prevStart = A.startScreen;
  A.introAfter = () => (prevStart ? prevStart() : 'menu');
  A.startScreen = () => (state.introDone ? A.introAfter() : (S.intro = { step: 0, ready: false }, 'intro'));
  const prevFinish = A.ACTIONS.setupFinish;
  A.ACTIONS.setupFinish = (d, el, e) => {
    if (state.introDone) return prevFinish(d, el, e);
    S.setupStep = 1; S.focusMsg = ''; state.setupDone = true; save();
    S.intro = { step: 0, ready: false };
    go('intro');
  };
})();
