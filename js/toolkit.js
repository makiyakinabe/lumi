/*
  toolkit.js
  Three things that help outside the app, and make setting up quicker.

  1. Out and about (child): one screen for outings. Big buttons for "I need the toilet", "It's too
     loud", "Wait with me" (a calm wait with or without a countdown), "What's next", "I'm lost"
     (shows the grown-up's name and number, if grown-ups added them), a break, the talk board with
     "Out" words, and My card. Open it from My card, or from the talk board.
  2. Support Passport (grown-ups): a one-page "About me" for teachers, therapists, relief staff and
     relatives, made from Grown-ups › Support. Choose what to include, then print it, save a copy,
     or show it full screen on the tablet. The phone number is left out unless you tick it.
  3. Ready routines (grown-ups, Timetable › Routines): add a whole routine to a day in one tap
     (School morning, After school, Evening, Weekend outing, Therapy day, Dentist or doctor), or
     save one of your own days as a routine to reuse.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, render, go, track, uid, clone } = A;
  const SP = () => (A.supportState ? A.supportState() : { phrases: [], calm: [], cards: [], custom: [], me: { talk: [], helps: [], dislikes: [], how: [], adult: '', phone: '', show: false } });
  const kid = () => state.childName || '';
  const l2 = (t) => (A.l2Html ? A.l2Html(t) : '');

  // ================================================================ 1. Out and about
  // the needs that come up most when out (a hawker centre, a clinic, the MRT), all one tap away;
  // Talk and My card sit in the top bar
  const OUT = [
    ['food', 'Food', 'eat', '#FFF1D6'], ['drink', 'Drink', 'drink', '#DCEEF7'], ['more', 'More', 'wMore', '#E7F3E1'], ['finished', 'Finished', 'wDone', '#EEF7E6'],
    ['toilet', 'Toilet', 'toilet', '#DCEEF7'], ['loud', 'Too loud', 'volume', '#FDE6CF'], ['break', 'A break', 'kBreak', '#EEE8F9'], ['help', 'Help', 'help', '#FBE1EA'],
    ['stop', 'Stop', 'stop', '#FCE3DE'], ['wait', 'Wait with me', 'hourglass', '#F1ECFB'], ['next', "What's next", 'clock', '#EEF7E6'], ['lost', "I'm lost", 'pin', '#FBE1EA']
  ];
  const OUT_CARDS = {
    food: { big: 'I want food, please', sub: 'I am hungry', icon: 'eat', bg: '#FFF1D6' },
    drink: { big: 'I want a drink, please', sub: 'I am thirsty', icon: 'drink', bg: '#DCEEF7' },
    more: { big: 'More, please', sub: '', icon: 'wMore', bg: '#E7F3E1' },
    finished: { big: 'I am finished', sub: 'All done', icon: 'wDone', bg: '#EEF7E6' },
    help: { big: 'Help me, please', sub: '', icon: 'help', bg: '#FBE1EA' },
    stop: { big: 'Stop, please', sub: '', icon: 'stop', bg: '#FCE3DE' },
    toilet: { big: 'I need the toilet', sub: 'Where is the toilet, please?', icon: 'toilet', bg: '#DCEEF7' },
    loud: { big: 'It is too loud', sub: 'I need somewhere quiet', icon: 'volume', bg: '#FDE6CF' },
    lost: { big: 'I am lost. Please help me.', sub: '', icon: 'pin', bg: '#FBE1EA' }
  };
  const LOUD_TIPS = [['ears', 'Cover my ears', 'hand', 'Cover your ears with your hands.'], ['phones', 'Headphones', 'volume', 'Put on your headphones.'], ['quiet', 'Quiet place', 'house', 'Ask to go somewhere quiet.'], ['breathe', 'Breathe', 'kCalm', 'Breathe in slowly, and out slowly.']];
  const WAIT_TIPS = [['breathe', 'Breathe', 'kCalm', 'Breathe in, two, three. And out, two, three.'], ['count', 'Count', 'count', "Let's count slowly. One, two, three, four, five."], ['squeeze', 'Squeeze', 'squeeze', 'Squeeze your hands, and let go.'], ['look', 'Look around', 'eye', 'Look around. What can you see?']];

  A.PARENT.outkit = 'home';
  A.VOICE.outkit = () => (S.ok && S.ok.wait ? (S.ok.wait.mins ? 'We are waiting. Take your time.' : 'We are waiting for our turn.') : 'Out and about. What do you need?');
  function waitHtml(w) {
    if (!w.mins && w.mins !== 0) {
      return `<div class="ok-wait-pick"><span class="ok-wait-lumi">${L.svg({ look: A.lookWith(), mood: 'calm', size: 170 })}</span><b>How long do we wait?</b>
        <div class="ok-wait-opts">${[[1, '1 minute'], [3, '3 minutes'], [5, '5 minutes'], [0, 'Until my turn']].map(([m, t]) => `<button class="nr-opt" data-a="okWaitFor" data-v="${m}">${m ? `<b class="ok-min">${m}</b>` : ic('person', 50)}<span>${t}</span></button>`).join('')}</div>
        <button class="nr-back" data-a="okWaitOff">${ic('back', 24)}<span>Back</span></button></div>`;
    }
    const secs = w.mins * 60, left = w.mins ? Math.max(0, secs - Math.round((Date.now() - w.t) / 1000)) : 1;
    const showCount = w.mins && !(state.nownext && state.nownext.style === 'none');
    return `<div class="ok-waiting"><div class="nr-wait"><span class="nr-lumi big">${L.svg({ look: A.lookWith(), mood: left ? 'calm' : 'happy', size: 190 })}</span>
        ${showCount ? `<span class="nr-ring" style="--p:${(left / secs).toFixed(3)}"></span>` : '<span class="nr-dots"><i></i><i></i><i></i></span>'}
        <b>${left ? (w.mins ? 'Waiting with Lumi.' : 'Waiting for my turn.') : 'You waited!'}</b><span>${left ? 'Take your time.' : 'Well done.'}</span></div>
      <div class="ok-tips" role="group" aria-label="What helps me wait">${WAIT_TIPS.map((t) => `<button class="brk-chip" data-a="okTip" data-v="${t[0]}">${ic(t[2], 30)}<span>${esc(t[1])}</span></button>`).join('')}</div>
      <button class="primary ok-done" data-a="okWaitOff">${ic('check', 34)}<span>${left ? 'Finished waiting' : 'Back'}</span></button></div>`;
  }
  function cardHtml(k) {
    const c = OUT_CARDS[k], me = SP().me;
    const who = k === 'lost' && me.adult ? `<span>Please call ${esc(me.adult)}${me.phone ? `<br><b class="ok-phone">${esc(me.phone)}</b>` : ''}</span>` : `<span>${esc(c.sub || (kid() ? 'My name is ' + kid() : ''))}</span>`;
    const tips = k === 'loud' ? `<div class="ok-tips in-card">${LOUD_TIPS.filter((t) => t[0] !== 'phones' || SP().calm.includes('headphones')).map((t) => `<span class="brk-chip" data-a="okTip" data-v="${t[0]}" role="button" tabindex="0">${ic(t[2], 26)}<span>${esc(t[1])}</span></span>`).join('')}</div>` : '';
    return `<div class="su-big ok-big" style="--bg:${c.bg}" role="dialog" aria-label="${esc(c.big)}">${ic(c.icon, 110)}<b>${esc(c.big)}${l2(c.big)}</b>${who}${tips}<button class="ok-close" data-a="okCardOff">${ic('check', 26)}<span>Done</span></button></div>`;
  }
  A.SCREENS.outkit = () => {
    const ok = S.ok || (S.ok = {});
    const tiles = OUT.map(([k, label, icon, bg]) => `<button class="ok-tile" data-a="okPick" data-v="${k}" style="--bg:${bg}">${ic(icon, 84)}<span>${esc(label)}${l2(label)}</span></button>`).join('');
    return `
<section class="screen ok-screen" aria-label="Out and about">
  ${A.srTitle('Out and about')}
  <div class="row gap12" style="height:60px;flex:none">${A.backBtn()}${A.speakBtn(A.VOICE.outkit())}<span class="game-chip" style="background:#E3F1FA;color:#3E6E9A">${ic('busLine', 32)}<span>Out and about</span></span><span class="grow"></span>
    <button class="soft-btn ok-top" data-a="okPick" data-v="talk">${ic('kTalk', 26)}<span>Talk</span></button><button class="soft-btn ok-top" data-a="okPick" data-v="me">${ic('cards', 26)}<span>My card</span></button>${A.starChip(true)}</div>
  ${ok.wait ? `<div class="panel grow ok-panel">${waitHtml(ok.wait)}</div>` : `<div class="ok-grid grow">${tiles}</div>`}
  ${ok.card ? cardHtml(ok.card) : ''}
</section>`;
  };
  A.GUIDE.outkit = () => null;
  let okTimer = null;
  function okTick() {
    clearInterval(okTimer);
    okTimer = setInterval(() => {
      const w = S.ok && S.ok.wait;
      if (S.screen !== 'outkit' || !w || !w.mins) { clearInterval(okTimer); return; }
      const secs = w.mins * 60, left = secs - Math.round((Date.now() - w.t) / 1000);
      const ring = A.stage.querySelector('.ok-waiting .nr-ring'); if (ring) ring.style.setProperty('--p', Math.max(0, left / secs).toFixed(3));
      if (left <= 0) { clearInterval(okTimer); track('waits', 'out and about'); render(); if (A.transitionCue) A.transitionCue('You waited! Well done.'); else say('You waited! Well done.'); }
    }, 1000);
  }
  Object.assign(A.ACTIONS, {
    okPick: (d) => {
      const k = d.v;
      if (OUT_CARDS[k]) { S.ok.card = k; render(); const c = OUT_CARDS[k]; if (A.logAsk) A.logAsk(OUT.find((o) => o[0] === k)[1]); say(k === 'lost' && SP().me.adult ? `${c.big} Please call ${SP().me.adult}.` : c.big); tone(659, 0.3, 0.05); if (A.supportLog) A.supportLog('out', OUT.find((o) => o[0] === k)[1]); return 'keep'; }
      if (k === 'wait') { S.ok.wait = {}; render(); say('How long do we wait?'); return 'keep'; }
      if (k === 'next') { go('nownext'); return 'keep'; }
      if (k === 'break') { if (A.supportLog) A.supportLog('out', 'A break'); A.ACTIONS.takeBreak(); return 'keep'; } // the break itself is counted as asking
      if (k === 'talk') { S.aacFolder = 'here'; S.aacHere = 'out'; go('talk'); return 'keep'; }
      if (k === 'me') { S.spView = SP().me.show ? 'me' : 'cards'; go('mycard'); return 'keep'; }
      return 'keep';
    },
    okCardOff: () => { S.ok.card = null; render(); return 'keep'; },
    okTip: (d) => { const t = LOUD_TIPS.concat(WAIT_TIPS).find((x) => x[0] === d.v); if (t) { say(t[3]); if (A.supportLog) A.supportLog('calm', t[1]); } return 'keep'; },
    okWaitFor: (d) => { S.ok.wait = { mins: Number(d.v), t: Date.now() }; render(); say(Number(d.v) ? `Let's wait ${d.v} minute${d.v === '1' ? '' : 's'} together. Take your time.` : "Let's wait for our turn together."); okTick(); return 'keep'; },
    okWaitOff: () => { const w = S.ok.wait; if (w && w.mins === 0 && w.t) track('waits', 'out and about'); clearInterval(okTimer); S.ok.wait = null; render(); return 'keep'; }
  });
  A.ENTER.outkit = () => { S.ok = {}; };
  // Outing calm: while Out and about is open, movement is kept still and Lumi's chimes are soft,
  // so the screen stays calm in a busy place (Grown-ups can switch this off in Sensory).
  let calmAdded = false;
  const prevAfterOut = A.afterRender;
  A.afterRender = () => {
    if (prevAfterOut) prevAfterOut();
    const root = A.stage;
    const want = S.screen === 'outkit' && state.settings.outCalm !== false;
    if (want && !root.classList.contains('reduce-motion')) { root.classList.add('reduce-motion'); calmAdded = true; }
    if (!want && calmAdded) { root.classList.remove('reduce-motion'); calmAdded = false; }
    A.outingQuiet = want;
  };

  // ================================================================ 2. Support Passport
  const PP_SECS = [['talk', 'How I communicate'], ['how', 'How to help me'], ['helps', 'What helps me'], ['hard', 'Things I find hard'], ['say', 'Things I might say'], ['contact', 'My grown-up (name and phone)']];
  const ppHide = () => { const sp = SP(); if (!Array.isArray(sp.ppHide)) sp.ppHide = ['contact']; return sp.ppHide; };
  function passportParts() {
    const sp = SP(), me = sp.me, hide = ppHide();
    const LONG = { Breathe: 'Breathing slowly', Music: 'Music', Quiet: 'Quiet', Move: 'Moving my body', Squeeze: 'Squeezing something soft', Water: 'A drink of water', Space: 'A quiet space', Hug: 'A hug', 'My grown-up': 'My grown-up nearby', Headphones: 'Headphones', 'Favourite toy': 'My favourite toy', Count: 'Counting slowly' };
    const KEY = { breathe: 'Breathe', music: 'Music', quiet: 'Quiet', move: 'Move', squeeze: 'Squeeze', water: 'Water', space: 'Space', hug: 'Hug', adult: 'My grown-up', headphones: 'Headphones', toy: 'Favourite toy', count: 'Count' };
    const helps = [...new Set(me.helps.concat(sp.calm.map((k) => KEY[k])).filter(Boolean).map((x) => LONG[x] || x))];
    const talk = me.talk.length ? `I talk with ${me.talk.map((t) => t.toLowerCase()).join(', ')}.` : '';
    const parts = [];
    if (!hide.includes('talk') && (talk || sp.cards.includes('talk'))) parts.push(['talk', 'How I communicate', `<p>${esc(talk)} I use a tablet app called Lumi to talk. Please give me time to answer.</p>`]);
    const how = me.how.filter((x) => x && x.trim());
    if (!hide.includes('how') && how.length) parts.push(['how', 'How to help me', `<ul>${how.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`]);
    if (!hide.includes('helps') && helps.length) parts.push(['helps', 'What helps me', `<p class="pp-chips">${helps.map((x) => `<span>${esc(x)}</span>`).join('')}</p>`]);
    if (!hide.includes('hard') && me.dislikes.length) parts.push(['hard', 'Things I find hard', `<p class="pp-chips">${me.dislikes.map((x) => `<span>${esc(x)}</span>`).join('')}</p>`]);
    if (!hide.includes('say') && sp.phrases.length) parts.push(['say', 'Things I might say', `<p class="pp-chips">${sp.phrases.map((x) => `<span>“${esc(x)}”</span>`).join('')}</p>`]);
    if (!hide.includes('contact') && me.adult) parts.push(['contact', 'My grown-up', `<p><b>${esc(me.adult)}</b>${me.phone ? ` · ${esc(me.phone)}` : ''}</p>`]);
    return parts;
  }
  function passportHtml() {
    const parts = passportParts();
    const photo = state.childPhoto ? `<img src="${state.childPhoto}" alt="">` : L.svg({ look: A.lookWith(), mood: 'happy', size: 96 });
    return `<div class="pp-sheet">
      <div class="pp-head"><span class="pp-photo">${photo}</span><div><small>Support Passport</small><h2>Hi, I'm ${esc(kid() || 'here')}!</h2><p>Please read this. It helps you help me.</p></div></div>
      ${parts.length ? `<div class="pp-grid">${parts.map(([k, h, b]) => `<div class="pp-sec pp-${k}"><h3>${esc(h)}</h3>${b}</div>`).join('')}</div>` : '<p class="pp-empty">Nothing to show yet. Fill in About me in Grown-ups › Support.</p>'}
      <div class="pp-foot">Made with Lumi · ${esc(A.longDate ? A.longDate() : A.dateKey())}</div>
    </div>`;
  }
  const PP_CSS = `.pp-sheet{font-family:Nunito,system-ui,sans-serif;color:#3B2F2F;max-width:760px;margin:0 auto;font-size:16px;line-height:1.45}
.pp-head{display:flex;gap:18px;align-items:center;border-bottom:3px solid #EDE5D8;padding-bottom:12px}
.pp-photo img,.pp-photo svg{width:96px;height:96px;border-radius:50%;object-fit:cover}
.pp-head small{font-weight:800;color:#2F7E79;text-transform:uppercase;letter-spacing:.06em;font-size:13px}.pp-head h2{margin:2px 0;font-size:30px}.pp-head p{margin:0;color:#6B5A4E}
.pp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.pp-sec{border:2px solid #EDE5D8;border-radius:16px;padding:10px 14px;break-inside:avoid}.pp-sec h3{margin:0 0 6px;font-size:17px;color:#2F7E79}.pp-sec p,.pp-sec ul{margin:0}.pp-sec ul{padding-left:20px}
.pp-chips{display:flex;flex-wrap:wrap;gap:6px}.pp-chips span{border:1.5px solid #E2D8C8;border-radius:999px;padding:4px 12px}
.pp-foot{margin-top:16px;border-top:2px solid #EDE5D8;padding-top:8px;font-size:12px;color:#6B5A4E}.pp-empty{color:#6B5A4E}`;
  A.PARENT.cgPassport = 'cgSupport';
  A.VOICE.cgPassport = () => '';
  A.SCREENS.cgPassport = () => {
    const hide = ppHide(), me = SP().me;
    const ticks = PP_SECS.map(([k, t]) => { const on = !hide.includes(k); return `<button class="check-row" data-a="ppSec" data-v="${k}" aria-pressed="${on}"><span class="box ${on ? 'on' : ''}">${on ? ic('check', 14) : ''}</span><span>${esc(t)}</span></button>`; }).join('');
    const empty = !me.talk.length && !me.helps.length && !me.dislikes.length && !me.how.some((x) => x && x.trim());
    return `
<section class="screen grownup" aria-label="Support Passport">
  ${A.gHeader ? A.gHeader('cgPassport') : ''}
  <div class="row gap16 grow" style="align-items:stretch;min-height:0">
    <div class="g-panel scroll" style="width:330px">
      <h2 class="g-h">Support Passport</h2>
      <p class="g-note">A one-page "About me" for school, therapy, relief staff and family.</p>
      <h3 class="g-sub-h">What to include</h3>${ticks}
      ${empty ? `<p class="g-note">Add more in <button class="g-link inline" data-a="ppEdit">About me</button>.</p>` : `<button class="g-link" data-a="ppEdit">Change About me</button>`}
      <div class="col gap8 top-gap">
        <button class="g-btn" data-a="ppPrint">${ic('copy', 18)}<span>Print or save as PDF</span></button>
        <button class="g-btn outline" data-a="ppSave">${ic('upload', 18)}<span>Save a copy</span></button>
        <button class="g-btn outline" data-a="ppFull">${ic('eye', 18)}<span>Show full screen</span></button>
      </div>
    </div>
    <div class="g-panel grow scroll pp-preview">${passportHtml()}</div>
  </div>
  ${S.ppFull ? `<button class="pp-full" data-a="ppFullOff" aria-label="Support Passport. Tap to close.">${passportHtml()}<small>Tap to close</small></button>` : ''}
</section>`;
  };
  let printEl = null;
  Object.assign(A.ACTIONS, {
    ppSec: (d) => { const h = ppHide(); const i = h.indexOf(d.v); if (i >= 0) h.splice(i, 1); else h.push(d.v); save(); render(); },
    ppEdit: () => { S.spOpen = 'me'; go('cgSupport'); },
    ppFull: () => { S.ppFull = true; render(); },
    ppFullOff: () => { S.ppFull = false; render(); },
    ppPrint: () => {
      printEl = document.getElementById('printReport') || printEl;
      if (!printEl) { printEl = document.createElement('div'); printEl.id = 'printReport'; document.body.appendChild(printEl); }
      printEl.innerHTML = `<style>@media print{${PP_CSS}}</style>${passportHtml()}`;
      try { window.print(); } catch (e) { A.ACTIONS.ppSave(); }
    },
    ppSave: () => {
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Support Passport: ${esc(kid() || 'my child')}</title><style>body{margin:0;padding:24px;background:#fff}${PP_CSS}</style></head><body>${passportHtml()}</body></html>`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      a.download = `support-passport-${(kid() || 'child').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      A.showToast('<span>Passport saved. Open it to print or share.</span>', 'toast-g');
    }
  });
  A.passportHtml = passportHtml;

  // ================================================================ 3. Ready routines (Timetable › Routines)
  const ROUTINES = [
    { id: 'morning', name: 'School morning', icon: 'sSun', tint: '#FFF1C2', steps: [['wake', '06:30'], ['dressed', '06:45'], ['teeth', '07:00'], ['breakfast', '07:10'], ['bus', '07:30', ['shoes', 'bag', 'bottle', 'buscard']], ['school', '08:00']] },
    { id: 'after', name: 'After school', icon: 'sBall', tint: '#E7F3E1', steps: [['lunch', '13:30', ['washhands']], ['play', '14:15'], ['homework', '15:00', ['pencilcase', 'folder']], ['park', '16:30', ['shoes', 'bottle']], ['screen', '17:30']] },
    { id: 'evening', name: 'Evening and bed', icon: 'sMoon', tint: '#F1ECFB', steps: [['dinner', '18:30', ['washhands']], ['bath', '19:30', ['towel', 'pyjamas']], ['teeth', '20:00'], ['reading', '20:15'], ['bedtime', '20:30', ['toilet']]] },
    { id: 'outing', name: 'Weekend outing', icon: 'sTree', tint: '#DCEFED', steps: [['breakfast', '08:30'], ['dressed', '09:00'], ['train', '09:45', ['bag', 'bottle', 'buscard', 'tissue']], ['park', '10:30'], ['lunch', '12:00', ['washhands']], ['play', '14:00']] },
    { id: 'therapy', name: 'Therapy day', icon: 'sTherapy', tint: '#F1ECFB', steps: [['lunch', '12:30'], ['bus', '13:30', ['bag', 'buscard']], ['therapy', '14:00'], ['play', '15:30'], ['dinner', '18:30']] },
    { id: 'clinic', name: 'Dentist or doctor', icon: 'sDentist', tint: '#E3F1FA', steps: [['breakfast', '08:00'], ['teeth', '08:30'], ['bus', '09:00', ['bag', 'buscard', 'tissue']], ['dentist', '09:30'], ['play', '11:00']] }
  ];
  const mine = () => (Array.isArray(state.myRoutines) ? state.myRoutines : (state.myRoutines = []));
  const asEntries = (r) => (r.entries ? r.entries.map((e) => clone(e)) : r.steps.filter(([id]) => D.STEPS[id]).map(([id, time, check]) => (check ? { id, time, check: check.slice() } : { id, time })));
  const icons = (r) => asEntries(r).map((e) => { const info = A.stepInfo(e); return `<span class="rt-ic" style="background:${info.tint}" title="${esc(info.label)}">${A.stepArt(info, 18)}</span>`; }).join('');
  const span = (r) => { const e = asEntries(r); return e.length ? `${A.fmt(e[0].time)}–${A.fmt(e[e.length - 1].time)}` : ''; };
  A.routineTplHtml = (day) => {
    const dn = A.dayName(day);
    const card = (r, isMine) => `<div class="rt-card">
      <div class="row gap8"><span class="lib-ic" style="background:${r.tint || '#F1ECFB'}">${ic(r.icon || 'calendar', 22)}</span><b class="grow">${esc(r.name)}</b><span class="g-note">${span(r)}</span></div>
      <div class="rt-icons">${icons(r)}</div>
      <div class="row gap8"><button class="g-btn small" data-a="rtAdd" data-v="${r.id}">${ic('plus', 16)}<span>Add to ${esc(dn)}</span></button>
        <button class="g-btn small outline ${S.rtSwap === r.id ? 'danger' : ''}" data-a="rtSwap" data-v="${r.id}">${S.rtSwap === r.id ? 'Tap again' : 'Replace day'}</button>
        ${isMine ? `<button class="mini-btn" data-a="rtDel" data-v="${r.id}" aria-label="Delete ${esc(r.name)}">${ic('trash', 16)}</button>` : ''}</div></div>`;
    const plan = A.builderApi ? A.builderApi.bPlan() : [];
    return `<p class="g-note">Add a whole routine in one tap. You can change any step after.</p>
      ${mine().length ? `<div class="g-sub-h">My routines</div>${mine().map((r) => card(r, true)).join('')}` : ''}
      <div class="g-sub-h">Ready-made</div>${ROUTINES.map((r) => card(r)).join('')}
      ${plan.length ? `<div class="rt-save"><input class="g-input grow" data-input="rtName" maxlength="24" placeholder="My ${esc(dn)}" value="${esc(S.rtName || '')}" aria-label="Name for this routine"><button class="g-btn small outline" data-a="rtSave">${ic('copy', 16)}<span>Save ${esc(dn)}</span></button></div>` : ''}`;
  };
  const findR = (id) => ROUTINES.concat(mine()).find((r) => r.id === id);
  function addRoutine(r, replace) {
    const api = A.builderApi; if (!api || !r) return;
    const plan = api.bPlan();
    if (replace) plan.length = 0;
    let first = null, n = 0;
    asEntries(r).forEach((s) => {
      if (plan.some((e) => (e.id || e.custom) === (s.id || s.custom) && e.time === s.time)) return;
      const e = api.entry(s); plan.push(e); n += 1; if (!first) first = e.uid;
    });
    api.sortDay(plan);
    if (first) api.select(first);
    S.rtSwap = null;
    save(); render();
    A.showToast(`<span>${n ? `Added ${n} step${n === 1 ? '' : 's'} to ${esc(A.dayName(S.bDay))}` : 'Those steps are already there'}</span>`, 'toast-g');
  }
  Object.assign(A.ACTIONS, {
    rtAdd: (d) => addRoutine(findR(d.v), false),
    rtSwap: (d) => { if (S.rtSwap !== d.v) { S.rtSwap = d.v; render(); return; } addRoutine(findR(d.v), true); },
    rtDel: (d) => { state.myRoutines = mine().filter((r) => r.id !== d.v); save(); render(); },
    rtSave: () => {
      const plan = A.builderApi ? A.builderApi.bPlan() : [];
      if (!plan.length) return;
      const entries = plan.map((e) => { const c = clone(e); delete c.uid; return c; });
      mine().unshift({ id: 'rt' + uid(), name: (S.rtName || '').trim() || 'My ' + A.dayName(S.bDay), icon: 'calendar', tint: '#FFF4D6', entries });
      S.rtName = '';
      save(); render();
      A.showToast('<span>Saved to My routines</span>', 'toast-g');
    }
  });
  const prevInput = A.onInput;
  A.onInput = (key, v, el) => { if (prevInput) prevInput(key, v, el); if (key === 'rtName') S.rtName = v; };
})();
