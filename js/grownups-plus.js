/*
  grownups-plus.js
  Small things that make Grown-ups easier to use:
  - Getting started: five steps on Overview that tick themselves, then disappear
  - A one-page report for teachers and therapists (print, save as PDF, or download)
  - A password lock for Grown-ups (made the first time Grown-ups is opened)
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

  // ================================================================ 3. Grown-ups lock: a password
  // Grown-ups always asks for a password. The first time, the grown-up makes one up (typed twice).
  // Only a scrambled form is saved on the tablet (state.lock.hash), never the password itself.
  // "Forgot password?" asks a sum written in words, then lets the grown-up choose a new one.
  const scramble = (t) => { let a = 2166136261, b = 5381; const x = 'lumi:' + t; for (let k = 0; k < x.length; k++) { a = Math.imul(a ^ x.charCodeAt(k), 16777619); b = (Math.imul(b, 33) + x.charCodeAt(k)) | 0; } return (a >>> 0).toString(36) + (b >>> 0).toString(36); };
  const lk = () => {
    const l = state.lock || (state.lock = {});
    if (l.pin && !l.hash) l.hash = scramble(l.pin); // an earlier 4-digit PIN becomes the password
    delete l.pin;
    delete l.mode;
    return l;
  };
  const isG = (s) => !!s && (s.indexOf('cg') === 0 || s === 'builder');
  A.gateGo = (screen, voice, opts) => {
    if (!isG(screen)) { S.gUnlocked = false; return false; }
    if (isG(S.screen) || S.gUnlocked) return false;
    pwAsk(lk().hash ? 'enter' : 'new', () => { S.gUnlocked = true; go(screen, voice, opts); });
    return true;
  };

  const pwEl = document.createElement('div');
  pwEl.id = 'pinGate';
  pwEl.hidden = true;
  pwEl.setAttribute('role', 'dialog');
  pwEl.setAttribute('aria-label', 'Grown-ups password');
  stage.appendChild(pwEl);
  let pw = { mode: 'enter', onPass: null, msg: '', show: false };
  const field = (id, label) => `<label class="pw-field"><span>${label}</span><input id="${id}" type="${pw.show ? 'text' : 'password'}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="40"></label>`;
  function drawPw(keep) {
    const old = keep ? ['pw1', 'pw2'].map((id) => { const el = document.getElementById(id); return el ? el.value : ''; }) : ['', ''];
    const isNew = pw.mode !== 'enter';
    pwEl.innerHTML = `<div class="pg-card pin-card pw-card">
      <span class="pg-ic">${ic('kLock', 48)}</span>
      <b class="pg-title">${pw.mode === 'enter' ? 'Grown-ups password' : pw.mode === 'change' ? 'Choose a new password' : 'Make a password'}</b>
      ${isNew ? '<span class="pg-why">This keeps the Grown-ups pages for you. At least 4 letters or numbers.</span>' : ''}
      ${field('pw1', isNew ? 'Password' : 'Type the password')}
      ${isNew ? field('pw2', 'Type it again') : ''}
      <span class="pg-why pin-msg" aria-live="polite">${esc(pw.msg)}</span>
      <div class="row gap12"><button class="g-btn outline" data-a="pwShow" aria-pressed="${pw.show}">${ic('eye', 18)}<span>${pw.show ? 'Hide' : 'Show'}</span></button><button class="g-btn" data-a="pwOk">${ic('check', 18)}<span>${isNew ? 'Save' : 'Open'}</span></button></div>
      <div class="row gap12">${pw.mode === 'enter' ? '<button class="g-link" data-a="pwForgot">Forgot password?</button>' : ''}<button class="g-link" data-a="pwCancel">Cancel</button></div>
    </div>`;
    ['pw1', 'pw2'].forEach((id, k) => { const el = document.getElementById(id); if (el) el.value = old[k]; });
  }
  function pwAsk(mode, onPass) {
    pw = { mode, onPass, msg: '', show: false };
    drawPw(false);
    pwEl.hidden = false;
    if (A.hideHand) A.hideHand();
    const f = document.getElementById('pw1');
    if (f) setTimeout(() => { try { f.focus(); } catch (e) { /* ignore */ } }, 50);
  }
  function pwOk() {
    const a = (document.getElementById('pw1') || {}).value || '';
    const b = (document.getElementById('pw2') || {}).value || '';
    if (pw.mode === 'enter') {
      if (scramble(a) === lk().hash) { pwEl.hidden = true; const fn = pw.onPass; pw.onPass = null; if (fn) fn(); return; }
      pw.msg = 'That is not the password. Try again.';
      drawPw(false);
      const f = document.getElementById('pw1');
      if (f) f.focus();
      return;
    }
    if (a.length < 4) { pw.msg = 'Use at least 4 letters or numbers.'; drawPw(true); return; }
    if (a !== b) { pw.msg = 'The two do not match. Type them again.'; drawPw(false); return; }
    lk().hash = scramble(a);
    save();
    pwEl.hidden = true;
    const fn = pw.onPass;
    pw.onPass = null;
    A.showToast('<span>Password saved</span>', 'toast-g');
    if (fn) fn(); else render();
  }
  pwEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pwOk(); } e.stopPropagation(); });
  Object.assign(A.ACTIONS, {
    pwOk: () => { pwOk(); return 'keep'; },
    pwShow: () => { pw.show = !pw.show; drawPw(true); return 'keep'; },
    pwCancel: () => { pwEl.hidden = true; pw.onPass = null; return 'keep'; },
    pwForgot: () => { const fn = pw.onPass; pwEl.hidden = true; A.parentGate(() => pwAsk('change', fn), 'Forgot the password'); return 'keep'; },
    lockChange: () => { pwAsk('change', null); return 'keep'; }
  });
  A.lockHtml = () => `<p class="g-note">Grown-ups opens only with your password. If you forget it, tap <b>Forgot password?</b> and answer a sum to choose a new one.</p>
      <button class="g-btn small outline" data-a="lockChange">${ic('pencil', 16)}<span>Change password</span></button>`;
  A.lockLabel = () => (lk().hash ? 'Password on' : 'Not set yet');
})();
