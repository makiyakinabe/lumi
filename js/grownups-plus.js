/*
  grownups-plus.js
  Small things that make Grown-ups easier to use:
  - Getting started: five steps on Overview that tick themselves, then disappear
  - A one-page report for teachers and therapists (print, save as PDF, or download)
  - An optional lock for Grown-ups: press and hold (default), a sum, or a 4-digit PIN
  - A short summary in plain sentences for the top of Progress
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, S, L, state, stage, ic, esc, save, render, go } = A;
  const kidName = () => state.childName || 'Your child';

  // ================================================================ shared numbers
  function days(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push(state.log[A.dateKey(d)] || {}); }
    return out;
  }
  const sum = (ds, k) => ds.reduce((t, d) => { const v = d[k]; return t + (v && typeof v === 'object' ? Object.values(v).reduce((a, b) => a + b, 0) : v || 0); }, 0);
  const sinceT = (n) => { const d = new Date(); d.setDate(d.getDate() - (n - 1)); d.setHours(0, 0, 0, 0); return d; };
  const feelName = (f) => (D.FEELINGS[f] ? D.FEELINGS[f].label : f === 'okay' ? 'Okay' : String(f).charAt(0).toUpperCase() + String(f).slice(1));
  const VAL = { happy: 3, okay: 2, worried: 1, sad: 1, angry: 1, scared: 0 };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
  function feelCounts(ds) {
    const c = {};
    ds.forEach((d) => Object.entries(d.feelings || {}).forEach(([f, k]) => { c[f] = (c[f] || 0) + k; }));
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }
  const talksSince = (n) => (state.meTalk || []).filter((r) => r.t >= sinceT(n).getTime());

  // three plain sentences: used, feelings, stories
  A.plainSummary = (n) => {
    const ds = days(n);
    const name = esc(kidName());
    const used = ds.filter((d) => Object.keys(d).length).length;
    const mins = sum(ds, 'minutes');
    const out = [];
    out.push(['calendar', used
      ? `${name} used Lumi on <b>${used} of the last ${n} days</b>${mins ? `, about ${Math.max(1, Math.round(mins / used))} minutes a day` : ''}.`
      : `${name} has not used Lumi in the last ${n} days.`]);
    const fc = feelCounts(ds);
    const fTot = fc.reduce((t, [, k]) => t + k, 0);
    out.push(['heart', fTot
      ? `Shared a feeling <b>${plural(fTot, 'time')}</b>, most often <b>${esc(feelName(fc[0][0]).toLowerCase())}</b>.`
      : 'No feelings shared yet.']);
    const talks = talksSince(n).filter((r) => r.before && r.after);
    const better = talks.filter((r) => (VAL[r.after] || 0) > (VAL[r.before] || 0)).length;
    const st = sum(ds, 'stories');
    out.push(['book', talks.length
      ? `Practised <b>${plural(Math.max(st, talks.length), 'story', 'stories')}</b> with Lumi and felt better afterwards <b>${plural(better, 'time')}</b>.`
      : st ? `Practised <b>${plural(st, 'story', 'stories')}</b> with Lumi.` : 'No stories practised yet.']);
    return out;
  };
  A.plainSummaryHtml = (n) => `<ul class="ps-sum">${A.plainSummary(n).map(([i, t]) => `<li><span class="ps-ic">${ic(i, 20)}</span><span>${t}</span></li>`).join('')}</ul>`;

  // ================================================================ 1. Getting started
  const gs = () => { if (!state.gs) state.gs = { seen: {}, hide: false }; if (!state.gs.seen) state.gs.seen = {}; return state.gs; };
  const seen = (k) => !!gs().seen[k];
  const GS = [
    ['target', 'Choose what Lumi helps with', 'cgFocus', () => A.focusChosen && A.focusChosen().length > 0],
    ['calendar', 'Check the timetable', 'builder', () => seen('builder')],
    ['chat', 'Add a family word or photo', 'cgActivities', () => (state.myWords || []).length > 0],
    ['book', 'Try a story together', 'stories', () => Object.keys(state.stats.storyDone || {}).length > 0],
    ['sliders', 'Set sound and reminders', 'cgSensory', () => seen('cgSensory')]
  ];
  ['builder', 'cgSensory'].forEach((k) => {
    const prev = A.ENTER[k];
    A.ENTER[k] = () => { if (!seen(k)) { gs().seen[k] = 1; save(); } if (prev) prev(); };
  });
  A.gsHtml = () => {
    if (gs().hide) return '';
    const done = GS.map((g) => g[3]());
    const n = done.filter(Boolean).length;
    if (n === GS.length) return '';
    return `<div class="gs-box">
      <div class="row between"><h2 class="g-h">Getting started <span class="g-note">${n} of ${GS.length}</span></h2><button class="g-link" data-a="gsHide">Hide</button></div>
      <div class="gs-bar"><i style="width:${Math.round((n / GS.length) * 100)}%"></i></div>
      <div class="gs-list">${GS.map(([icon, label, to], i) => `<button class="gs-item ${done[i] ? 'done' : ''}" data-a="nav" data-to="${to}"><span class="gs-tick">${done[i] ? ic('check', 18) : ic(icon, 18)}</span><span class="grow left">${label}</span>${done[i] ? '' : ic('chev', 16)}</button>`).join('')}</div>
    </div>`;
  };

  // ================================================================ 2. The report
  S.rpDays = S.rpDays || 7;
  const fmtDate = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  function reportHtml(n) {
    const ds = days(n);
    const name = esc(kidName());
    const p = state.profile || {};
    const fs = A.focusChosen ? A.focusChosen() : [];
    const from = sinceT(n);
    const fromKey = A.dateKey(from);
    const sec = (title, body) => (body ? `<section class="rp-sec"><h3>${title}</h3>${body}</section>` : '');
    const nums = fs.filter((f) => f.count).map((f) => `<div class="rp-num"><b>${sum(ds, f.count[0]) + (f.count[1] ? sum(ds, f.count[1]) : 0)}</b><span>${esc(f.unit)}</span></div>`).join('');
    const fc = feelCounts(ds);
    const talks = talksSince(n).slice(0, 10);
    const HAVE = { yes: 'has done this', self: 'has done this', help: 'does it with help', notyet: 'not yet' };
    const helps = Object.entries(state.myHelps || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const notes = (state.journal || []).filter((j) => (j.when || '').slice(0, 10) >= fromKey).slice(0, 8);
    return `<article class="rp-sheet">
      <header class="rp-head">
        <div><h2>${name}</h2><p>${esc((D.AGES[p.age] || {}).name || '')}${p.age ? ' · ' : ''}${fmtDate(from)} to ${fmtDate(new Date())}</p></div>
        <span class="rp-logo">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'happy', size: 64 })}<b>Lumi</b></span>
      </header>
      ${fs.length ? `<p class="rp-focus"><b>Lumi helps with:</b> ${fs.map((f) => esc(f.name)).join(' · ')}</p>` : ''}
      ${sec('In short', `<ul class="rp-list">${A.plainSummary(n).map(([, t]) => `<li>${t}</li>`).join('')}</ul>`)}
      ${sec('Practice in this time', nums ? `<div class="rp-nums">${nums}</div>` : '')}
      ${sec('Feelings shared', fc.length ? `<p>${fc.map(([f, k]) => `${esc(feelName(f))} <b>${k}</b>`).join(' · ')}</p>` : '')}
      ${sec(`What ${name} told Lumi`, talks.length ? `<table class="rp-table"><tr><th>Story</th><th>Before</th><th>After</th><th>Has done it?</th></tr>${talks.map((r) => `<tr><td>${esc(r.title)}</td><td>${r.before ? esc(feelName(r.before)) : '–'}</td><td>${r.after ? esc(feelName(r.after)) : '–'}</td><td>${HAVE[r.have] || '–'}</td></tr>`).join('')}</table>` : '')}
      ${sec(`What ${name} says helps`, helps.length ? `<p>${helps.map(([l, k]) => `${esc(l)} <b>${k}</b>`).join(' · ')}</p>` : '')}
      ${sec('Notes from home', notes.length ? `<ul class="rp-notes">${notes.map((j) => `<li><b>${esc(fmtDate(new Date(j.when)))}</b>${j.tags && j.tags.length ? ` <span>${j.tags.map(esc).join(', ')}</span>` : ''}${j.note ? `<br>${esc(j.note)}` : ''}</li>`).join('')}</ul>` : '')}
      <footer class="rp-foot">Made with Lumi on ${fmtDate(new Date())}. Everything Lumi records stays on the family's tablet.</footer>
    </article>`;
  }
  A.PARENT.cgReport = 'cgProgress';
  A.VOICE.cgReport = () => '';
  A.SCREENS.cgReport = () => {
    const seg = [[7, 'Last 7 days'], [30, 'Last 30 days']].map(([v, l]) => `<button class="seg-opt ${S.rpDays === v ? 'on' : ''}" data-a="rpDays" data-v="${v}" aria-pressed="${S.rpDays === v}">${l}</button>`).join('');
    return `
<section class="screen grownup" aria-label="Report">
  ${A.gHeader('cgReport')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel" style="width:300px">
      <h2 class="g-h">Share a report</h2>
      <p class="g-note">One page for a teacher, therapist or doctor.</p>
      <div class="seg" role="group" aria-label="How long">${seg}</div>
      <button class="g-btn top-gap" data-a="rpPrint">${ic('upload', 18)}<span>Print or save as PDF</span></button>
      <button class="g-btn outline" data-a="rpDownload">${ic('journal', 18)}<span>Download as a file</span></button>
      <p class="g-note">To save a PDF, choose <b>Save as PDF</b> (or Share › Save to Files) in the print window.</p>
      <button class="g-link top-gap" data-a="nav" data-to="cgJournal">${ic('pencil', 14)} Add a note first</button>
    </div>
    <div class="g-panel grow scroll rp-wrap">${reportHtml(S.rpDays)}</div>
  </div>
</section>`;
  };
  const RP_CSS = `body{font-family:Nunito,system-ui,sans-serif;color:#3B2F2F;margin:0;padding:24px;background:#fff}
.rp-sheet{max-width:760px;margin:0 auto;font-size:15px;line-height:1.45}
.rp-head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #EDE5D8;padding-bottom:10px}
.rp-head h2{margin:0;font-size:26px}.rp-head p{margin:2px 0 0;color:#6B5A4E}
.rp-logo{display:flex;align-items:center;gap:6px;font-size:20px}.rp-logo svg{width:48px;height:48px}
.rp-focus{margin:12px 0}.rp-sec{margin:14px 0;break-inside:avoid}.rp-sec h3{font-size:16px;margin:0 0 6px;color:#2F7E79}
.rp-list{margin:0;padding-left:20px}.rp-nums{display:flex;flex-wrap:wrap;gap:10px}
.rp-num{border:2px solid #EDE5D8;border-radius:12px;padding:6px 12px;display:flex;gap:8px;align-items:baseline}.rp-num b{font-size:22px}
.rp-table{border-collapse:collapse;width:100%}.rp-table th,.rp-table td{border-bottom:1px solid #EDE5D8;padding:5px 6px;text-align:left}
.rp-notes{margin:0;padding-left:18px}.rp-notes span{color:#6B5A4E}
.rp-foot{margin-top:18px;border-top:2px solid #EDE5D8;padding-top:8px;font-size:12px;color:#6B5A4E}`;
  let printEl = null;
  Object.assign(A.ACTIONS, {
    gsHide: () => { gs().hide = true; save(); render(); },
    rpDays: (d) => { S.rpDays = Number(d.v); render(); },
    rpPrint: () => {
      if (!printEl) { printEl = document.createElement('div'); printEl.id = 'printReport'; document.body.appendChild(printEl); }
      printEl.innerHTML = `<style>@media print{${RP_CSS.replace(/body\{[^}]*\}/, '')}}</style>${reportHtml(S.rpDays)}`;
      try { window.print(); } catch (e) { A.ACTIONS.rpDownload(); }
    },
    rpDownload: () => {
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lumi report: ${esc(kidName())}</title><style>${RP_CSS}</style></head><body>${reportHtml(S.rpDays)}</body></html>`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      a.download = `lumi-report-${(state.childName || 'child').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${A.dateKey()}.html`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      A.showToast('<span>Report saved. Open it to print or share.</span>', 'toast-g');
    }
  });

  // ================================================================ 3. Grown-ups lock
  const lk = () => state.lock || (state.lock = { mode: 'hold', pin: '' });
  const isG = (s) => !!s && (s.indexOf('cg') === 0 || s === 'builder');
  A.gateGo = (screen, voice, opts) => {
    if (!isG(screen)) { S.gUnlocked = false; return false; }
    if (isG(S.screen) || S.gUnlocked) return false;
    const m = lk().mode;
    if (m !== 'sum' && m !== 'pin') return false;
    const pass = () => { S.gUnlocked = true; go(screen, voice, opts); };
    if (m === 'pin' && lk().pin) pinAsk('enter', pass);
    else A.parentGate(pass, 'Opening Grown-ups');
    return true;
  };

  const pinEl = document.createElement('div');
  pinEl.id = 'pinGate';
  pinEl.hidden = true;
  pinEl.setAttribute('role', 'dialog');
  pinEl.setAttribute('aria-label', 'Grown-ups PIN');
  stage.appendChild(pinEl);
  let pin = { mode: 'enter', typed: '', first: '', onPass: null, msg: '' };
  const TITLES = { enter: 'Grown-ups PIN', new: 'Choose a 4-digit PIN', confirm: 'Type it again' };
  function drawPin() {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', '0', '<'];
    pinEl.innerHTML = `<div class="pg-card pin-card">
      <span class="pg-ic">${ic('kLock', 48)}</span>
      <b class="pg-title">${TITLES[pin.mode]}</b>
      <span class="pin-dots" aria-live="polite">${[0, 1, 2, 3].map((i) => `<i class="${i < pin.typed.length ? 'on' : ''}"></i>`).join('')}</span>
      <span class="pg-why pin-msg">${esc(pin.msg)}</span>
      <div class="pin-keys">${keys.map((k) => k === 'x' ? '<span></span>' : k === '<' ? `<button class="pin-key soft" data-a="pinBack" aria-label="Delete">${ic('back', 22)}</button>` : `<button class="pin-key" data-a="pinKey" data-v="${k}">${k}</button>`).join('')}</div>
      <div class="row gap12">${pin.mode === 'enter' ? '<button class="g-link" data-a="pinForgot">Forgot PIN?</button>' : ''}<button class="g-btn outline" data-a="pinCancel">Cancel</button></div>
    </div>`;
  }
  function pinAsk(mode, onPass) {
    pin = { mode, typed: '', first: '', onPass, msg: '' };
    drawPin();
    pinEl.hidden = false;
    if (A.hideHand) A.hideHand();
  }
  function pinDone() {
    const t = pin.typed;
    if (pin.mode === 'enter') {
      if (t === lk().pin) { pinEl.hidden = true; const fn = pin.onPass; pin.onPass = null; if (fn) fn(); return; }
      pin.typed = ''; pin.msg = 'Not quite. Try again.';
    } else if (pin.mode === 'new') {
      pin.first = t; pin.typed = ''; pin.mode = 'confirm'; pin.msg = '';
    } else {
      if (t === pin.first) {
        lk().pin = t; lk().mode = 'pin'; save();
        pinEl.hidden = true; render();
        A.showToast('<span>PIN saved</span>', 'toast-g');
        return;
      }
      pin.typed = ''; pin.first = ''; pin.mode = 'new'; pin.msg = 'Those did not match. Start again.';
    }
    drawPin();
  }
  Object.assign(A.ACTIONS, {
    pinKey: (d) => { if (pin.typed.length < 4) pin.typed += d.v; pin.msg = ''; drawPin(); if (pin.typed.length === 4) setTimeout(pinDone, 150); return 'keep'; },
    pinBack: () => { pin.typed = pin.typed.slice(0, -1); drawPin(); return 'keep'; },
    pinCancel: () => { pinEl.hidden = true; pin.onPass = null; return 'keep'; },
    pinForgot: () => { const fn = pin.onPass; pinEl.hidden = true; A.parentGate(() => { if (fn) fn(); A.showToast('<span>You can set a new PIN in Child › Grown-ups lock</span>', 'toast-g'); }, 'Forgot the PIN'); return 'keep'; },
    lockMode: (d) => {
      if (d.v === 'pin' && !lk().pin) { pinAsk('new', null); return 'keep'; }
      lk().mode = d.v; save(); render();
    },
    lockNewPin: () => { pinAsk('new', null); return 'keep'; }
  });
  A.lockHtml = () => {
    const m = lk().mode;
    const seg = [['hold', 'Press and hold'], ['sum', 'Sum question'], ['pin', 'PIN']].map(([v, l]) => `<button class="seg-opt ${m === v ? 'on' : ''}" data-a="lockMode" data-v="${v}" aria-pressed="${m === v}">${l}</button>`).join('');
    const note = { hold: 'Hold the Grown-ups button for one second. Good for young children.', sum: 'Answer a sum written in words. Good for children who can hold a button.', pin: 'Type a 4-digit PIN. Good for older children and teens.' }[m];
    return `<div class="seg" role="group" aria-label="Grown-ups lock">${seg}</div><p class="g-note">${note}</p>
      ${m === 'pin' ? `<button class="g-btn small outline" data-a="lockNewPin">${ic('pencil', 16)}<span>Change PIN</span></button>` : ''}`;
  };
  A.lockLabel = () => ({ hold: 'Press and hold', sum: 'Sum question', pin: 'PIN' })[lk().mode] || 'Press and hold';
})();
