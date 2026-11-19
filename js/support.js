/*
  support.js
  Support without taking control: the child always has a clear next step, a way to say something,
  a way to pause or change direction, and a choice about how much help they want.

  Child
  - "Not yet" (My day rail, Now & Next): More time, A break, Help me, Do it later. Never a fail.
    More time waits calmly (with or without a countdown, as grown-ups choose), then says "Ready when
    you are" and waits for the child. Do it later swaps the step with the next one (or skips it today).
  - After a real-life step: the green button ("I'm up!", "Done"...) or "Together". Grown-ups see how
    many steps were done on their own and how many together. "Not today" is the Do it later choice.
  - My card (Talk board › My card, and the Break space): big cards to show someone ("I need quiet",
    "Please give me space", "Please find my grown-up"...) and, if grown-ups allow it, About me:
    how I talk, what helps me, what I don't like, how to help me, my grown-up's name and number.
  - Break space: the child's own calm menu (squeeze, water, a quiet space, a hug, headphones...),
    "Show a card", and after "I'm ready": Carry on, Change it, Do it together, or Finish for now.
  Grown-ups
  - Support (Overview): quick phrases for the talk board, the calm menu, the cards, About me,
    and switches for Not yet, the Together check-in and partner tips.
  - Progress › "What helped this week" (strengths first): steps done on their own and together,
    steps that are getting easier, what the child chose when not ready, and favourite calm supports.
  Everything is kept on this tablet (state.support).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, stage, ic, esc, say, tone, save, render, go, track, later } = A;

  // ---------------------------------------------------------------- what can be chosen
  const PHRASES = ['I need a break', 'Help me, please', 'Please wait', "I don't like this", 'Something hurts', 'I want to go home'];
  const CALM = [
    ['breathe', 'Breathe', 'kCalm', 'Breathe slowly with Lumi.'], ['music', 'Music', 'music', 'Listen to some music.'], ['quiet', 'Quiet', 'quiet', 'Make everything quiet.'],
    ['move', 'Move', 'stretch', 'Move your body.'], ['squeeze', 'Squeeze', 'squeeze', 'Squeeze something soft. Squeeze, and let go.'], ['water', 'Water', 'drink', 'Have a drink of water.'],
    ['space', 'Space', 'house', 'Go to your quiet space.'], ['hug', 'Hug', 'hug', 'Ask for a hug.'], ['adult', 'My grown-up', 'person', 'Find your grown-up.'],
    ['headphones', 'Headphones', 'volume', 'Put on your headphones.'], ['toy', 'Favourite toy', 'paw', 'Hold your favourite toy.'], ['count', 'Count', 'count', 'Count slowly to ten.']
  ];
  const CALM_OF = Object.fromEntries(CALM.map((c) => [c[0], c]));
  const CARDS = [
    ['break', 'I need a break', 'kBreak', '#EEE8F9'], ['quiet', 'I need quiet', 'quiet', '#DCEEF7'], ['space', 'Please give me space', 'hand', '#FDE6CF'],
    ['help', 'I need help', 'help', '#FFF4C7'], ['leave', 'I am ready to leave', 'exit', '#E3F3DA'], ['talk', 'I use this app to talk', 'kTalk', '#DCEFED'],
    ['find', 'Please find my grown-up', 'person', '#FBE1EA'], ['wait', 'Please wait for me', 'hourglass', '#F1ECFB']
  ];
  const TALK_BY = ['Pictures', 'Some words', 'Typing', 'Signs', 'Pointing', 'Sounds'];
  const DISLIKES = ['Loud noises', 'Crowds', 'Bright lights', 'Being touched', 'Waiting', 'Surprises', 'Strong smells', 'Being rushed'];

  const SP = () => {
    const d = { phrases: PHRASES.slice(), calm: ['music', 'quiet', 'move', 'squeeze', 'water', 'space', 'adult'], cards: ['break', 'quiet', 'space', 'help', 'leave', 'find'], custom: [], me: { talk: [], helps: [], dislikes: [], how: ['', '', ''], adult: '', phone: '', show: false }, log: [], notReady: true, checkin: true, tips: true, more: 2 };
    if (!state.support) state.support = d;
    Object.keys(d).forEach((k) => { if (state.support[k] == null) state.support[k] = d[k]; });
    return state.support;
  };
  function logS(k, d) {
    const sp = SP();
    sp.log.unshift({ t: Date.now(), k, d: d || '' });
    if (sp.log.length > 400) sp.log.length = 400;
    track(k.split(':')[0], d, { quiet: true });
    save();
  }
  A.supportLog = logS;
  const stepNow = () => (S.day && S.day.plan[S.day.i] ? A.stepInfo(S.day.plan[S.day.i]) : null);
  const kid = () => state.childName || '';
  const softNotes = () => { tone(659, 0.35, 0.06); setTimeout(() => tone(784, 0.35, 0.06), 260); setTimeout(() => tone(988, 0.5, 0.06), 520); };
  // the transition cue chosen in Now & Next settings: chime and/or words, picture only, or nothing
  function cue(line) {
    const c = (state.nownext && state.nownext.cue) || 'both';
    if (c === 'both' || c === 'chime') tone(660, 0.4, 0.05);
    if (c === 'both' || c === 'voice') say(line);
  }
  A.transitionCue = cue;

  // ================================================================ "Not yet"
  const nr = document.createElement('div');
  nr.id = 'nrBox'; nr.hidden = true; nr.setAttribute('role', 'dialog'); nr.setAttribute('aria-label', 'Not ready yet');
  stage.appendChild(nr);
  let nrTimer = null;
  A.notReadyRail = () => (SP().notReady === false ? '' : `<button class="rail-btn" data-a="nrOpen" aria-label="Not ready yet"><span class="rail-circle" style="background:#FFF1E6;border-color:#E0913E;color:#B8651E">${ic('hourglass', 50)}</span><span>Not yet</span></button>`);
  function nrDraw() {
    const n = S.nr;
    if (!n) { nr.hidden = true; return; }
    const step = n.from === 'routine' ? stepNow() : null;
    const what = step ? step.label.toLowerCase() : n.from === 'nownext' && state.nownext && state.nownext.next ? state.nownext.next.label.toLowerCase() : 'this';
    let body = '';
    if (n.view === 'menu') {
      const opts = [['more', 'More time', 'hourglass'], ['break', 'A break', 'kBreak'], ['help', 'Help me', 'help']];
      if (n.from === 'routine') opts.push(['later', S.day && S.day.i + 1 < S.day.plan.length ? 'Do it later' : 'Not today', 'arrow']);
      body = `<div class="nr-head"><span class="nr-lumi">${L.svg({ look: A.lookWith(), mood: 'calm', size: 120 })}</span><div><b>Not ready yet?</b><span>That's okay. What would help?</span></div></div>
        <div class="nr-opts n${opts.length}">${opts.map(([k, l, i]) => `<button class="nr-opt" data-a="nrPick" data-v="${k}">${ic(i, 56)}<span>${l}${A.l2Html ? A.l2Html(l) : ''}</span></button>`).join('')}</div>
        <button class="nr-back" data-a="nrClose">${ic('back', 24)}<span>Back to ${esc(what)}</span></button>`;
    } else if (n.view === 'more') {
      const secs = (SP().more || 2) * 60, left = Math.max(0, secs - Math.round((Date.now() - n.t) / 1000));
      const showCount = !(state.nownext && state.nownext.style === 'none');
      body = `<div class="nr-wait"><span class="nr-lumi big">${L.svg({ look: A.lookWith(), mood: 'calm', size: 200 })}</span>
        ${showCount ? `<span class="nr-ring" style="--p:${(left / secs).toFixed(3)}"></span>` : '<span class="nr-dots"><i></i><i></i><i></i></span>'}
        <b>${left > 0 ? 'Take your time.' : 'Ready when you are.'}</b><span>Then ${esc(what)}.</span></div>
        <button class="primary nr-ready" data-a="nrClose">${ic('check', 36)}<span>I'm ready</span></button>`;
    } else if (n.view === 'help') {
      body = `<button class="nr-card" data-a="nrClose" aria-label="I need help. Tap to close.">${ic('help', 110)}<b>I need help</b><span>${step ? `with ${esc(step.label.toLowerCase())}` : 'please'}</span><small>Tap when someone is helping</small></button>`;
    }
    nr.innerHTML = `<div class="nr ${n.view}">${body}</div>`;
    nr.hidden = false;
  }
  function nrClose() {
    clearInterval(nrTimer); nrTimer = null;
    S.nr = null; nr.hidden = true;
    A.afterRender();
  }
  function doLater() {
    const d = S.day, i = d.i, a = d.plan[i];
    if (i + 1 < d.plan.length) {
      const b = d.plan[i + 1];
      d.plan[i] = Object.assign({}, b, { time: a.time });
      d.plan[i + 1] = Object.assign({}, a, { time: b.time });
      logS('notyet:later', A.stepInfo(a).label);
      if (A.prepareStep) A.prepareStep();
      render();
      say(`Okay. ${A.stepInfo(a).label} later. First, ${A.stepInfo(b).label.toLowerCase()}.`);
      return;
    }
    logS('notyet:skip', A.stepInfo(a).label);
    d.i += 1;
    if (d.i >= d.plan.length) { go('end'); return; }
    if (A.prepareStep) A.prepareStep();
    render();
  }
  Object.assign(A.ACTIONS, {
    nrOpen: () => { S.nr = { from: S.screen, view: 'menu' }; A.hideHand(); nrDraw(); say("Not ready yet? That's okay. What would help?"); return 'keep'; },
    nrClose: () => { const from = S.nr && S.nr.from; nrClose(); if (from === 'routine') say(A.VOICE.routine ? A.VOICE.routine() : ''); return 'keep'; },
    nrPick: (d) => {
      const n = S.nr; if (!n) return 'keep';
      const lbl = n.from === 'routine' && stepNow() ? stepNow().label : n.from;
      if (d.v === 'break') { logS('notyet:break', lbl); nrClose(); A.ACTIONS.takeBreak(); return 'keep'; }
      if (d.v === 'later') { nrClose(); doLater(); return 'keep'; }
      if (d.v === 'help') { logS('notyet:help', lbl); n.view = 'help'; nrDraw(); softNotes(); say('I need help.'); return 'keep'; }
      if (d.v === 'more') {
        logS('notyet:more', lbl);
        if (n.from === 'nownext' && A.nnMoreTime) { nrClose(); A.nnMoreTime((SP().more || 2) * 60); say(`${SP().more || 2} more minutes. Take your time.`); return 'keep'; }
        n.view = 'more'; n.t = Date.now(); nrDraw(); say('Take your time.');
        clearInterval(nrTimer);
        nrTimer = setInterval(() => {
          if (!S.nr || S.nr.view !== 'more') { clearInterval(nrTimer); return; }
          const secs = (SP().more || 2) * 60, left = secs - Math.round((Date.now() - S.nr.t) / 1000);
          const ring = nr.querySelector('.nr-ring'); if (ring) ring.style.setProperty('--p', Math.max(0, left / secs).toFixed(3));
          if (left === 0) { nrDraw(); cue('Ready when you are.'); }
        }, 1000);
      }
      return 'keep';
    }
  });

  // ================================================================ after a real-life step: on my own, or together
  A.checkinHtml = () => (SP().checkin === false ? '' : `<button class="sg-together" data-a="sgRealT" aria-label="We did it together">${ic('together', 30)}<span>Together</span></button>`);
  const sgReal = A.ACTIONS.sgReal;
  if (sgReal) {
    A.ACTIONS.sgReal = (d, el) => {
      const st = stepNow();
      if (st) logS(S.ciT ? 'together' : 'self', st.label);
      S.ciT = false;
      return sgReal(d, el);
    };
    A.ACTIONS.sgRealT = (d, el) => { S.ciT = true; tone(587, 0.2, 0.05); return A.ACTIONS.sgReal(d, el); };
  }

  // ================================================================ cards to show someone, and My card
  const cardList = () => SP().cards.map((id) => CARDS.find((c) => c[0] === id)).filter(Boolean).concat(SP().custom.map((t, i) => ['c' + i, t, 'chat', '#FFFFFF']));
  const bigCard = (c) => `<button class="su-big" data-a="spCardOff" style="--bg:${c[3]}" aria-label="${esc(c[1])}. Tap to close.">${ic(c[2], 130)}<b>${esc(c[1])}</b>${c[0] === 'find' && SP().me.adult ? `<span>${esc(SP().me.adult)}${SP().me.phone ? ' · ' + esc(SP().me.phone) : ''}</span>` : kid() ? `<span>${esc(kid())}</span>` : ''}<small>Tap to close</small></button>`;
  const cardBtns = (action) => cardList().map((c) => `<button class="su-card" data-a="${action}" data-v="${c[0]}" style="--bg:${c[3]}">${ic(c[2], 46)}<span>${esc(c[1])}${A.l2Html ? A.l2Html(c[1]) : ''}</span></button>`).join('');
  function meHtml() {
    const me = SP().me;
    const chips = (arr) => arr.map((x) => `<span class="su-chip">${esc(x)}</span>`).join('');
    const how = me.how.filter((x) => x.trim());
    return `<div class="su-me">
      <div class="su-me-head">${state.childPhoto ? `<img src="${state.childPhoto}" alt="">` : L.svg({ look: A.lookWith(), mood: 'happy', size: 90 })}<div><b>${esc(kid() || 'About me')}</b><span>This is how I am.</span></div></div>
      ${me.talk.length ? `<div class="su-row"><span class="su-l">${ic('kTalk', 26)} I talk with</span><div>${chips(me.talk)}</div></div>` : ''}
      ${me.helps.length ? `<div class="su-row"><span class="su-l">${ic('heart', 26)} What helps me</span><div>${chips(me.helps)}</div></div>` : ''}
      ${me.dislikes.length ? `<div class="su-row"><span class="su-l">${ic('dont', 26)} I don't like</span><div>${chips(me.dislikes)}</div></div>` : ''}
      ${how.length ? `<div class="su-row"><span class="su-l">${ic('help', 26)} How to help me</span><ul>${how.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
      ${me.adult ? `<div class="su-row"><span class="su-l">${ic('person', 26)} My grown-up</span><div><b>${esc(me.adult)}</b>${me.phone ? ` · ${esc(me.phone)}` : ''}</div></div>` : ''}
    </div>`;
  }
  A.PARENT.mycard = 'talk';
  A.VOICE.mycard = () => 'My card. Tap a card to show it to someone.';
  A.SCREENS.mycard = () => {
    const sp = SP(), view = S.spView || 'cards';
    const canMe = sp.me.show;
    return `
<section class="screen su-screen" aria-label="My card">
  ${A.srTitle('My card')}
  <div class="row gap12" style="height:60px;flex:none">${A.backBtn()}${A.speakBtn(A.VOICE.mycard())}
    <div class="mu-tabs" role="tablist"><button class="tab shelf-tab ${view === 'cards' ? 'on' : ''}" data-a="spView" data-v="cards" role="tab" aria-selected="${view === 'cards'}">${ic('cards', 28)}<span>Show a card</span></button>
    ${canMe ? `<button class="tab shelf-tab ${view === 'me' ? 'on' : ''}" data-a="spView" data-v="me" role="tab" aria-selected="${view === 'me'}">${ic('person', 28)}<span>About me</span></button>` : ''}</div>${A.starChip(true)}</div>
  <div class="row grow gap16" style="min-height:0">
    ${view === 'me' && canMe ? `<div class="panel grow scroll su-panel">${meHtml()}</div>` : `<div class="su-cards grow">${cardBtns('spCard')}</div>`}
    <div class="su-side">
      <span class="su-side-l">Say it now</span>
      ${sp.phrases.slice(0, 6).map((p) => `<button class="su-phrase" data-a="spSay" data-v="${esc(p)}">${ic('speaker', 22)}<span>${esc(p)}${A.l2Html ? A.l2Html(p) : ''}</span></button>`).join('')}
      <button class="su-phrase nn" data-a="nav" data-to="nownext">${ic('clock', 22)}<span>Now &amp; Next</span></button>
      ${A.SCREENS.outkit ? `<button class="su-phrase out" data-a="nav" data-to="outkit">${ic('busLine', 22)}<span>Out and about</span></button>` : ''}
    </div>
  </div>
  ${S.spCard ? bigCard(cardList().find((c) => c[0] === S.spCard) || CARDS[0]) : ''}
</section>`;
  };
  Object.assign(A.ACTIONS, {
    spView: (d) => { S.spView = d.v; render(); say(d.v === 'me' ? 'About me.' : 'Tap a card to show it.'); },
    spCard: (d) => { S.spCard = d.v; render(); const c = cardList().find((x) => x[0] === d.v); if (c) { say(c[1]); softNotes(); logS('card', c[1]); } },
    spCardOff: () => { S.spCard = null; render(); },
    spSay: (d) => { say(d.v); logS('phrase', d.v); state.stats.talkUses += 1; track('talk', d.v); save(); }
  });

  // ================================================================ the break space: my calm menu, cards, and what next
  A.breakExtras = (b) => {
    const sp = SP();
    if (b.card) return bigCard(cardList().find((c) => c[0] === b.card) || CARDS[0]).replace('data-a="spCardOff"', 'data-a="brkCardOff"');
    if (b.cards) return `<div class="brk-cards"><b>Show a card</b><div class="brk-cards-row">${cardBtns('brkCard')}</div><button class="nr-back" data-a="brkCardsOff">${ic('back', 24)}<span>Back</span></button></div>`;
    if (b.after) {
      const opts = [['carry', 'Carry on', 'play'], ['change', b.from === 'routine' ? 'Do it later' : 'Something else', 'swap'], ['together', 'Do it together', 'together'], ['finish', 'Finish for now', 'home']];
      return `<div class="brk-after"><span class="nr-lumi">${L.svg({ look: A.lookWith(), mood: 'happy', size: 110 })}</span><b>What would you like to do now?</b><div class="nr-opts n4">${opts.map(([k, l, i]) => `<button class="nr-opt" data-a="brkAfter" data-v="${k}">${ic(i, 50)}<span>${l}</span></button>`).join('')}</div></div>`;
    }
    if (b.tip) return `<button class="brk-tip" data-a="brkTipOff">${ic(b.tip[2], 90)}<b>${esc(b.tip[3])}</b><small>Tap when you are done</small></button>`;
    const own = sp.calm.filter((k) => !['music', 'quiet', 'move', 'breathe'].includes(k)).map((k) => CALM_OF[k]).filter(Boolean);
    return own.length ? `<div class="brk-mine" role="group" aria-label="What helps me"><span>What helps me</span>${own.map((c) => `<button class="brk-chip" data-a="brkTip" data-v="${c[0]}">${ic(c[2], 30)}<span>${esc(c[1])}</span></button>`).join('')}</div>` : '';
  };
  A.breakShows = (k) => SP().calm.includes(k);
  Object.assign(A.ACTIONS, {
    brkTip: (d) => { const c = CALM_OF[d.v]; S.brk.tip = c; logS('calm', c[1]); A.drawBreak(); if (!S.brk.quiet) say(c[3]); return 'keep'; },
    brkTipOff: () => { S.brk.tip = null; A.drawBreak(); return 'keep'; },
    brkCard: (d) => { const c = cardList().find((x) => x[0] === d.v); S.brk.card = d.v; S.brk.cards = false; A.drawBreak(); if (!S.brk.quiet) softNotes(); if (c) logS('card', c[1]); return 'keep'; },
    brkCardOff: () => { S.brk.card = null; A.drawBreak(); return 'keep'; },
    brkCardsOff: () => { S.brk.cards = false; A.drawBreak(); return 'keep'; },
    brkAfter: (d) => {
      const from = S.brk.from;
      logS('after:' + d.v, from);
      A.endBreakNow();
      if (d.v === 'carry') { const v = A.VOICE[S.screen] ? A.VOICE[S.screen]() : ''; say('Welcome back! ' + (v || '')); return 'keep'; }
      if (d.v === 'together') { S.ciT = true; say('Ask your grown-up to do it with you.'); return 'keep'; }
      if (d.v === 'finish') { go('home'); say("That's okay. We can finish for now."); return 'keep'; }
      if (from === 'routine' && S.day) { doLater(); return 'keep'; }
      go(['home', 'menu'].includes(from) ? 'home' : 'fun'); say('Okay. Let\'s do something else.');
      return 'keep';
    }
  });

  // ================================================================ grown-ups: Support
  A.PARENT.cgSupport = 'cgHome';
  A.VOICE.cgSupport = () => '';
  const tick = (on, action, v, label) => `<button class="check-row" data-a="${action}" data-v="${esc(v)}" aria-pressed="${!!on}"><span class="box ${on ? 'on' : ''}">${on ? ic('check', 14) : ''}</span><span>${esc(label)}</span></button>`;
  const pickChips = (list, chosen, action) => `<div class="su-picks">${list.map((x) => { const v = Array.isArray(x) ? x[0] : x; const l = Array.isArray(x) ? x[1] : x; const on = chosen.includes(v); return `<button class="su-pick ${on ? 'on' : ''}" data-a="${action}" data-v="${esc(v)}" aria-pressed="${on}">${Array.isArray(x) && x[2] ? ic(x[2], 22) : ''}<span>${esc(l)}</span></button>`; }).join('')}</div>`;
  A.SCREENS.cgSupport = () => {
    const sp = SP(), me = sp.me, open = S.spOpen || 'phrases';
    const sec = (id, title, sub, body) => `<div class="su-sec ${open === id ? 'open' : ''}"><button class="su-sec-h" data-a="spSec" data-v="${id}" aria-expanded="${open === id}"><b>${title}</b><span>${sub}</span>${ic(open === id ? 'up' : 'down', 20)}</button>${open === id ? `<div class="su-sec-b">${body}</div>` : ''}</div>`;
    return `
<section class="screen grownup" aria-label="Support">
  ${A.gHeader ? A.gHeader('cgSupport') : ''}
  <div class="row gap16 grow" style="align-items:stretch;min-height:0">
    <div class="g-panel grow scroll">
      <h2 class="g-h">Support for ${esc(kid() || 'your child')}</h2>
      ${sec('phrases', 'Quick phrases', 'Always on the talk board', `<div class="su-list">${sp.phrases.map((p, i) => `<span class="su-li">${esc(p)}<button class="icon-btn xs" data-a="spPhraseDel" data-v="${i}" aria-label="Remove">${ic('x', 16)}</button></span>`).join('')}</div>
        <div class="row gap8"><input class="g-input grow" data-input="spPhrase" placeholder="Add a phrase, e.g. I need my headphones" value="${esc(S.spNew || '')}" maxlength="40"><button class="g-btn" data-a="spPhraseAdd">${ic('plus', 18)}<span>Add</span></button></div>`)}
      ${sec('calm', 'Calm menu', 'What the Break space offers', pickChips(CALM, sp.calm, 'spCalm'))}
      ${sec('cards', 'Cards to show', 'In My card and the Break space', `${pickChips(CARDS.map((c) => [c[0], c[1], c[2]]), sp.cards, 'spCardPick')}
        <div class="su-list">${sp.custom.map((t, i) => `<span class="su-li">${esc(t)}<button class="icon-btn xs" data-a="spCustomDel" data-v="${i}" aria-label="Remove">${ic('x', 16)}</button></span>`).join('')}</div>
        <div class="row gap8"><input class="g-input grow" data-input="spCustom" placeholder="Your own card, e.g. I am deaf, please write it down" value="${esc(S.spCustom || '')}" maxlength="44"><button class="g-btn" data-a="spCustomAdd">${ic('plus', 18)}<span>Add</span></button></div>`)}
      ${sec('me', 'About me', me.show ? 'Your child can show it' : 'Hidden from your child', `${tick(me.show, 'spMeShow', '', 'Let my child show About me (in My card)')}
        <h3 class="g-sub-h">Talks with</h3>${pickChips(TALK_BY, me.talk, 'spMeTalk')}
        <h3 class="g-sub-h">What helps</h3>${pickChips(CALM.map((c) => c[1]), me.helps, 'spMeHelp')}
        <h3 class="g-sub-h">Doesn't like</h3>${pickChips(DISLIKES, me.dislikes, 'spMeDis')}
        <h3 class="g-sub-h">How to help (up to 3)</h3>${me.how.map((h, i) => `<input class="g-input" data-input="spHow${i}" placeholder="${['Give me time to answer', 'Show me a picture', 'Use few words'][i]}" value="${esc(h)}" maxlength="50">`).join('')}
        <h3 class="g-sub-h">Grown-up to find (optional)</h3><div class="row gap8"><input class="g-input grow" data-input="spAdult" placeholder="Name" value="${esc(me.adult)}" maxlength="30"><input class="g-input grow" data-input="spPhone" placeholder="Phone" value="${esc(me.phone)}" maxlength="20" inputmode="tel"></div>`)}
    </div>
    <div class="g-panel scroll" style="width:380px">
      <h2 class="g-h">In My day</h2>
      ${tick(sp.notReady, 'spToggle', 'notReady', 'Show "Not yet" (more time, a break, help, later)')}
      <h3 class="g-sub-h">More time lasts</h3>
      <div class="seg" role="group">${[1, 2, 3, 5].map((m) => `<button class="seg-opt ${sp.more === m ? 'on' : ''}" data-a="spMore" data-v="${m}" aria-pressed="${sp.more === m}">${m} min</button>`).join('')}</div>
      ${tick(sp.checkin, 'spToggle', 'checkin', 'Show "Together" next to the done button')}
      <h2 class="g-h top-gap">Together mode</h2>
      ${tick(sp.tips, 'spToggle', 'tips', 'Show tips for the grown-up before each activity')}
      <h2 class="g-h top-gap">Transitions</h2>
      <button class="g-btn outline" data-a="nav" data-to="cgNowNext">${ic('clock', 18)}<span>Warnings and countdowns</span></button>
      <p class="g-note">Choose how Lumi warns before a change, and turn countdowns off if they are stressful.</p>
      <button class="g-btn outline top-gap" data-a="spPreview">${ic('eye', 18)}<span>See My card as your child does</span></button>
      ${A.SCREENS.cgPassport ? `<button class="g-btn top-gap" data-a="nav" data-to="cgPassport">${ic('cards', 18)}<span>Support Passport</span></button><p class="g-note">A one-page About me to print or share.</p>` : ''}
    </div>
  </div>
</section>`;
  };
  const toggleIn = (arr, v) => { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); };
  Object.assign(A.ACTIONS, {
    spSec: (d) => { S.spOpen = S.spOpen === d.v ? '' : d.v; render(); },
    spPhraseDel: (d) => { SP().phrases.splice(Number(d.v), 1); save(); render(); },
    spPhraseAdd: () => { const t = (S.spNew || '').trim(); if (t && SP().phrases.length < 8) { SP().phrases.push(t); S.spNew = ''; save(); render(); } },
    spCustomDel: (d) => { SP().custom.splice(Number(d.v), 1); save(); render(); },
    spCustomAdd: () => { const t = (S.spCustom || '').trim(); if (t && SP().custom.length < 4) { SP().custom.push(t); S.spCustom = ''; save(); render(); } },
    spCalm: (d) => { toggleIn(SP().calm, d.v); save(); render(); },
    spCardPick: (d) => { toggleIn(SP().cards, d.v); save(); render(); },
    spMeShow: () => { SP().me.show = !SP().me.show; save(); render(); },
    spMeTalk: (d) => { toggleIn(SP().me.talk, d.v); save(); render(); },
    spMeHelp: (d) => { toggleIn(SP().me.helps, d.v); save(); render(); },
    spMeDis: (d) => { toggleIn(SP().me.dislikes, d.v); save(); render(); },
    spToggle: (d) => { SP()[d.v] = SP()[d.v] === false; save(); render(); },
    spMore: (d) => { SP().more = Number(d.v); save(); render(); },
    spPreview: () => { S.spView = SP().me.show ? 'me' : 'cards'; go('mycard'); }
  });
  const prevInput = A.onInput;
  A.onInput = (key, v, el) => {
    if (prevInput) prevInput(key, v, el);
    const me = SP().me;
    if (key === 'spPhrase') S.spNew = v;
    if (key === 'spCustom') S.spCustom = v;
    if (key === 'spAdult') { me.adult = v; save(); }
    if (key === 'spPhone') { me.phone = v; save(); }
    const m = /^spHow(\d)$/.exec(key); if (m) { me.how[Number(m[1])] = v; save(); }
  };

  // ================================================================ Progress: what helped this week (strengths first)
  A.supportWeekHtml = (days) => {
    const since = Date.now() - (days || 7) * 86400000;
    const log = SP().log.filter((e) => e.t >= since);
    if (!log.length) return '';
    const count = (pre) => log.filter((e) => e.k === pre || e.k.startsWith(pre + ':'));
    const self = count('self'), tog = count('together');
    const by = (list) => { const m = {}; list.forEach((e) => { m[e.d] = (m[e.d] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    // getting easier: steps done together before, and on their own more recently
    const old = SP().log.filter((e) => e.t < since && e.k === 'together').map((e) => e.d);
    const easier = [...new Set(self.map((e) => e.d))].filter((d) => old.includes(d)).slice(0, 3);
    const ny = log.filter((e) => e.k.startsWith('notyet:'));
    const nyKinds = by(ny.map((e) => ({ d: { 'notyet:more': 'more time', 'notyet:break': 'a break', 'notyet:help': 'help', 'notyet:later': 'later', 'notyet:skip': 'not today' }[e.k] })));
    const calm = by(count('calm')).slice(0, 3);
    const cards = by(count('card')).slice(0, 3);
    const after = by(log.filter((e) => e.k.startsWith('after:')).map((e) => ({ d: { 'after:carry': 'carry on', 'after:change': 'change it', 'after:together': 'do it together', 'after:finish': 'finish for now' }[e.k] })));
    const lines = [];
    if (self.length || tog.length) lines.push(`<b>${self.length}</b> real-life step${self.length === 1 ? '' : 's'} done on their own${tog.length ? `, <b>${tog.length}</b> together` : ''}.${self.length ? ` Most often: ${by(self).slice(0, 3).map(([s]) => esc(s)).join(', ')}.` : ''}`);
    if (easier.length) lines.push(`Getting easier: ${easier.map(esc).join(', ')} (done together before, on their own now).`);
    if (ny.length) lines.push(`Asked for ${nyKinds.map(([k, n]) => `${k} (${n})`).join(', ')}, mostly at ${by(ny).slice(0, 2).map(([s]) => esc(s)).join(' and ')}.`);
    if (after.length) lines.push(`After a break they chose: ${after.map(([k, n]) => `${k} (${n})`).join(', ')}.`);
    if (calm.length) lines.push(`Calm supports they picked: ${calm.map(([k]) => esc(k)).join(', ')}.`);
    if (cards.length) lines.push(`Cards they showed: ${cards.map(([k]) => esc(k)).join(', ')}.`);
    return `<div class="su-week"><h3 class="g-sub-h">${ic('heart', 18)} What helped this week</h3><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul><p class="g-note">These are things Lumi noticed, not a test. Your own notes matter more.</p></div>`;
  };

  // ================================================================ Together: tips for the grown-up, and how the child wants to play
  const TIPS = ['Give time. Count to ten in your head before helping.', 'Show it once, then wait.', 'Use few words.', 'Offer two choices.', 'Every way of answering counts: pointing, a sound, a picture.'];
  A.partnerTipHtml = (go2) => (SP().tips === false ? '' : `<div class="su-tips" role="dialog" aria-label="Tips for the grown-up"><div class="su-tips-card">
      <b>${ic('together', 26)} Before you start</b><ul>${TIPS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <span class="su-tips-q">${esc(kid() || 'Your child')}, how shall we play?</span>
      <div class="nr-opts n4">${[['show', 'Show me', 'eye'], ['together', 'Together', 'together'], ['help', 'Help me', 'help'], ['mine', 'My turn', 'me']].map(([k, l, i]) => `<button class="nr-opt" data-a="spTipGo" data-v="${k}" data-go="${esc(go2)}">${ic(i, 44)}<span>${l}</span></button>`).join('')}</div>
      <button class="g-link" data-a="spTipsOff">Don't show tips again</button></div></div>`);
  Object.assign(A.ACTIONS, {
    spTipGo: (d) => { logS('play:' + d.v, S.spTipV); S.spTipFor = null; S.spTipDone = true; S.togetherHow = d.v; const a = A.ACTIONS[d.go]; render(); say({ show: 'Okay. Watch first.', together: "Let's do it together.", help: 'Your grown-up will help.', mine: 'Your turn first!' }[d.v]); if (a) a({ v: S.spTipV }); },
    spTipsOff: () => { SP().tips = false; save(); const a = A.ACTIONS[S.spTipFor]; S.spTipFor = null; S.spTipDone = true; if (a) a({ v: S.spTipV }); else render(); }
  });
  ['tOpen', 'tgOpen'].forEach((name) => {
    const orig = A.ACTIONS[name];
    if (!orig) return;
    A.ACTIONS[name] = (d, el) => {
      if (SP().tips !== false && !S.spTipDone) { S.spTipFor = name; S.spTipV = d.v; render(); say('Before you start, a few tips for the grown-up.'); return 'keep'; }
      return orig(d, el);
    };
  });
  const enterTogether = A.ENTER.together;
  A.ENTER.together = () => { S.spTipDone = false; S.spTipFor = null; if (enterTogether) enterTogether(); };
  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    try {
      const sec = stage.querySelector('.together-screen');
      if (sec && S.spTipFor && !sec.querySelector('.su-tips')) { sec.insertAdjacentHTML('beforeend', A.partnerTipHtml(S.spTipFor)); A.hideHand(); }
    } catch (e) { /* tips are optional */ }
  };
  A.supportState = SP;
})();
