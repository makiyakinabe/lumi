/*
  intro.js
  Lumi's title page and Lumi's story.
  The title page opens the app every time: Play goes to the home page, and "Lumi's story" plays the story again.
  The story: Lumi up in the sky, wishing for a friend, coming down, landing in the room, saying hello as the
  child's buddy, asking their name (the first time only) and greeting them by it.
  The child chooses twice, and the story follows: how Lumi comes down (star, rainbow or cloud) and how Lumi
  says hi (wave, dance or hug). The child sets the pace: nothing moves on until they tap.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, tone, save, render, go, later } = A;

  // The pages. Two of them are choices: how Lumi comes down, and how Lumi says hi. The story follows the choice.
  const HOW = [
    { k: 'star', label: 'Star', line: 'Whoosh! Down a star.' },
    { k: 'rainbow', label: 'Rainbow', line: 'Wheee! Down a rainbow.' },
    { k: 'cloud', label: 'Cloud', line: 'Float, float. Down on a cloud.' }
  ];
  const HI = [
    { k: 'wave', label: 'Wave', e: '👋', line: 'Hi! I am Lumi, your buddy.' },
    { k: 'dance', label: 'Dance', e: '🎶', line: 'Hi! I am Lumi, your buddy. Let\'s dance!' },
    { k: 'hug', label: 'Hug', e: '🥰', line: 'Hi! I am Lumi, your buddy. Big hug!' }
  ];
  const PAGES = ['sky', 'wish', 'how', 'down', 'found', 'hi', 'hello', 'name', 'greet'];
  // the name is asked the first time only; watching again goes straight to the hello
  const pages = () => (it().again ? PAGES.filter((p) => p !== 'name') : PAGES);
  const it = () => S.intro || (S.intro = { step: 0, ready: false });
  const pageOf = (step) => (step === 0 ? 'title' : pages()[step - 1]);
  const kid = () => (state.childName || '').trim();
  const how = () => HOW.find((h) => h.k === it().how) || HOW[0];
  const hi = () => HI.find((h) => h.k === it().hi) || HI[0];
  const lineOf = (step) => {
    switch (pageOf(step)) {
      case 'sky': return 'Lumi lived in the sky.';
      case 'wish': return 'Lumi wanted a friend.';
      case 'how': return 'How does Lumi come down?';
      case 'down': return how().line;
      case 'found': return 'Lumi found you!';
      case 'hi': return 'How does Lumi say hi?';
      case 'hello': return hi().line;
      case 'name': return 'What is your name?';
      case 'greet': return kid() ? `Hello, ${kid()}! Let's play.` : `Hello, my friend! Let's play.`;
      default: return '';
    }
  };
  const lumi = (mood, size, wave) => L.svg({ look: A.lookWith(), mood, size, wave: !!wave });
  const picOf = (e) => (window.lumiPic && window.lumiPic(e, '100%')) || '';
  const howArt = { star: '<span class="in-ic star"></span>', rainbow: '<span class="in-ic rainbow"></span>', cloud: '<span class="in-ic cloud"></span>' };

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
    const pg = pageOf(step);
    if (pg === 'title') return `<div class="in-art in-sky"><span class="in-moon"></span><span class="in-glow">${lumi('sleepy', 230)}</span></div>`;
    if (pg === 'sky') return `<div class="in-art in-sky p1"><span class="in-moon"></span><span class="in-glow">${lumi('sleepy', 210)}</span></div>`;
    if (pg === 'wish' || pg === 'how') return `<div class="in-art in-sky p2"><span class="in-moon"></span><span class="in-glow">${lumi(pg === 'how' ? 'happy' : 'sad', 210)}</span>${skyline}</div>`;
    if (pg === 'down') {
      const k = how().k;
      const extra = k === 'star' ? '<span class="in-trail"></span>' : k === 'rainbow' ? '<span class="in-bow"></span>' : '';
      return `<div class="in-art in-sky p3 by-${k}"><span class="in-moon"></span>${extra}<span class="in-glow">${k === 'cloud' ? '<span class="in-cloud"></span>' : ''}${lumi('excited', 170)}</span>${skyline}</div>`;
    }
    if (pg === 'found') return room(`<span class="in-rug"></span><span class="in-lumi land">${lumi('happy', 320)}</span><span class="in-spark a"></span><span class="in-spark b"></span><span class="in-spark c"></span>`);
    if (pg === 'hi') return room(`<span class="in-side"><span class="in-rug"></span><span class="in-lumi bobble">${lumi('happy', 320)}</span></span>`);
    if (pg === 'hello') {
      const k = hi().k;
      const bits = k === 'dance' ? `<span class="in-note a">${picOf('🎵')}</span><span class="in-note b">${picOf('🎶')}</span>` : k === 'hug' ? `<span class="in-note a">${picOf('💜')}</span><span class="in-note b">${picOf('💜')}</span>` : '';
      return room(`<span class="in-rug"></span><span class="in-lumi ${k === 'dance' ? 'dance' : k === 'hug' ? 'hug' : 'bobble'}">${lumi('excited', 320, k !== 'dance')}</span>${bits}`);
    }
    return room('');
  }
  // the child's own room (their wallpaper and floor) fills the whole screen
  function room(inner) {
    const skin = A.roomSkin ? A.roomSkin() : { wall: '#F6E7D3', floor: '#E8CDB0' };
    return `<div class="in-art in-room" style="background:${skin.wall}"><span class="in-window"><i></i></span><span class="in-floor" style="background:${skin.floor}"></span>${inner}</div>`;
  }

  A.VOICE.intro = () => '';
  A.SCREENS.intro = () => {
    const t = it();
    const step = t.step;
    const pg = pageOf(step);
    const n = pages().length;
    const dots = `<span class="in-dots" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}"></i>`).join('')}</span>`;
    const text = lineOf(step);
    if (pg === 'title') return `
<section class="screen intro dark" aria-label="Lumi">
  ${picture(0)}
  <div class="in-title"><h1>Lumi</h1></div>
  <div class="in-load">${t.ready
    ? (state.introDone
      ? `<div class="row gap16"><button class="primary big in-start" data-a="introPlay">${ic('play', 44)}<span>Play</span></button><button class="in-story" data-a="introWatch">${ic('kStories', 40)}<span>Lumi's story</span></button></div>`
      : `<button class="primary big in-start" data-a="introNext">${ic('play', 44)}<span>Start</span></button>`)
    : '<span class="in-bar" role="progressbar" aria-label="Getting ready"><i></i></span>'}</div>
</section>`;
    if (pg === 'how' || pg === 'hi') {
      const list = pg === 'how' ? HOW : HI;
      return `
<section class="screen intro ${pg === 'how' ? 'dark' : 'pick-hi'}" aria-label="You choose">
  <button class="in-skip" data-a="introSkip">Skip</button>
  ${picture(step)}
  <div class="in-choose">
    <div class="in-q">${A.speakBtn(text, 60)}<p>${esc(text)}</p></div>
    <div class="in-opts">${list.map((o) => `<button class="in-opt" data-a="introPick" data-v="${o.k}" aria-label="${esc(o.label)}"><span class="in-opt-art">${pg === 'how' ? howArt[o.k] : picOf(o.e)}</span><b>${esc(o.label)}</b></button>`).join('')}</div>
  </div>
  ${dots}
</section>`;
    }
    if (pg === 'name') return `
<section class="screen intro" aria-label="Tell Lumi your name">
  ${picture(step)}
  <button class="in-skip" data-a="introSkip">Skip</button>
  <div class="in-ask">
    <span class="in-lumi bobble">${lumi('happy', 300, true)}</span>
    <div class="in-form">
      <div class="in-bubble"><span>${esc(text)}</span>${A.speakBtn(text, 52)}</div>
      <input id="in-name" class="in-name" type="text" data-input="childName" value="${esc(state.childName || '')}" maxlength="20" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="My name" aria-label="Your name">
      <button class="primary big" data-a="introNext" aria-label="That is my name">${ic('check', 44)}</button>
    </div>
  </div>
  ${dots}
</section>`;
    if (pg === 'greet') return `
<section class="screen intro" aria-label="Lumi says hello">
  ${picture(step)}
  <div class="in-hello">
    ${Array.from({ length: 12 }, (_, i) => `<span class="in-conf c${i % 4}" style="left:${6 + i * 8}%;animation-delay:${(i % 5) * 0.18}s"></span>`).join('')}
    <span class="in-lumi bobble">${lumi('excited', 320, true)}</span>
    <h1 class="in-hi">${kid() ? `Hello, <b>${esc(kid())}</b>!` : 'Hello, my friend!'}</h1>
    <div class="row gap16">${A.speakBtn(text, 64)}<button class="primary big" data-a="introDone"><span>Let's go</span>${ic('arrow', 40)}</button></div>
  </div>
</section>`;
    return `
<section class="screen intro ${['sky', 'wish', 'down'].includes(pg) ? 'dark' : ''}" aria-label="Lumi's story, page ${step} of ${n}">
  <button class="in-skip" data-a="introSkip">Skip</button>
  ${picture(step)}
  <div class="in-cap">
    ${A.speakBtn(text, 72)}
    <p>${esc(text)}</p>
    <button class="primary in-next" data-a="introNext" aria-label="Next">${ic('arrow', 40)}</button>
  </div>
  ${dots}
</section>`;
  };

  // the title page waits a moment (a short "getting ready" bar), shorter once the child knows Lumi
  A.ENTER.intro = () => {
    const t = it();
    if (t.step === 0 && !t.ready) later(() => { if (S.screen === 'intro' && it().step === 0) { it().ready = true; render(); } }, state.introDone ? 1100 : 2400);
  };

  function finish() {
    state.introDone = true;
    S.intro = null;
    save();
    go(A.introAfter ? A.introAfter() : 'menu');
  }
  function show(step) {
    const t = it();
    t.step = step;
    tone(pageOf(step) === 'greet' ? 784 : 523, 0.25, 0.06);
    render();
    say(lineOf(step));
    if (pageOf(step) === 'name') later(() => { const el = document.getElementById('in-name'); if (el && !el.value) try { el.focus({ preventScroll: true }); } catch (e) { /* no keyboard, no problem */ } }, 500);
  }
  Object.assign(A.ACTIONS, {
    introNext: () => {
      const t = it();
      if (t.step === 0 && !t.ready) return;
      if (['how', 'hi'].includes(pageOf(t.step))) { say(lineOf(t.step)); return; } // a choice page waits for a choice
      if (pageOf(t.step) === 'name') { const el = document.getElementById('in-name'); if (el) { state.childName = el.value.trim(); el.blur(); } save(); }
      show(Math.min(pages().length, t.step + 1));
    },
    // a choice: the story goes that way
    introPick: (d) => {
      const t = it();
      const pg = pageOf(t.step);
      if (pg === 'how') t.how = d.v; else if (pg === 'hi') t.hi = d.v; else return;
      show(t.step + 1);
    },
    introPlay: finish,
    introWatch: () => { S.intro = { step: 0, ready: true, again: true }; show(1); },
    introSkip: finish,
    introDone: finish,
    introReplay: () => { S.intro = { step: 0, ready: true, again: true }; go('intro'); show(1); }
  });
  // Enter on the keyboard is the same as tapping "That is me"
  A.stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target && e.target.id === 'in-name') { e.preventDefault(); A.ACTIONS.introNext(); }
  });

  // when it plays: straight after a grown-up finishes setting up, or the first time an existing child opens Lumi
  const prevStart = A.startScreen;
  A.introAfter = () => (prevStart ? prevStart() : 'menu');
  // Lumi's title page opens the app every time (Play, or watch Lumi's story again); a new tablet is set up first
  A.startScreen = () => {
    const next = A.introAfter();
    if (next === 'setup') return next;
    S.intro = { step: 0, ready: false };
    return 'intro';
  };
  const prevFinish = A.ACTIONS.setupFinish;
  A.ACTIONS.setupFinish = (d, el, e) => {
    if (state.introDone) return prevFinish(d, el, e);
    S.setupStep = 1; S.focusMsg = ''; state.setupDone = true; save();
    S.intro = { step: 0, ready: false };
    go('intro');
  };
})();
