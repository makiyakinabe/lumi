/*
  access.js
  Switch access: for children who use one or two switches (or a keyboard) instead of touch.
  Grown-ups › Sensory › Switch access:
  - Auto scan (one switch): Lumi moves a bright orange frame from button to button. Press the switch
    (Space, Enter, or any key a switch interface sends) to choose the button in the frame.
  - Step scan (two switches): Space or → moves the frame, Enter chooses. ← goes back one.
  - Speed (auto scan): slow, medium or quick. "Say each button" reads the button's name out loud.
  - Turning switch access on also turns on "Tap instead of drag", so every game can be played by choosing.
  Pop-ups (Not yet, a card, the break space) are scanned first. Grown-ups pages are never scanned, and the
  press-and-hold Grown-ups button is skipped. The tablet's own Switch Control (iPad) or Switch Access
  (Android) still work as normal; use one or the other, not both.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { S, state, stage, ic, esc, save, render, say } = A;
  const st = () => state.settings;
  const mode = () => st().scan || 'off';

  const bar = document.createElement('div');
  bar.id = 'scanBar'; bar.hidden = true; bar.setAttribute('aria-hidden', 'true');
  stage.appendChild(bar);

  let list = [], idx = -1, timer = null, loops = 0, cur = null, lastRoot = null, paused = false;
  const setBar = (txt) => { if (txt == null) { if (!bar.hidden) bar.hidden = true; return; } if (bar.textContent !== txt) bar.textContent = txt; if (bar.hidden) bar.hidden = false; };
  const visible = (el) => {
    if (el.disabled || el.closest('[hidden]') || el.closest('[aria-hidden="true"]') || el.classList.contains('hidden')) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && s.pointerEvents !== 'none' && Number(s.opacity) > 0.05;
  };
  function collect() {
    const scr = stage.querySelector('.screen');
    if (!scr || scr.classList.contains('grownup')) return [];
    // a pop-up on top: only scan inside it
    const tops = [...stage.querySelectorAll('#nrBox:not([hidden]), #breakMenu:not([hidden]), .su-big, .ok-big, .su-tips, .pp-full, [role="dialog"]')].filter(visible);
    const root = tops.length ? tops[tops.length - 1] : stage;
    const sel = 'button, [data-a], [role="button"], input:not([type="hidden"]), textarea, select';
    const els = [...root.querySelectorAll(sel)].filter((el) => !el.hasAttribute('data-hold') && !el.closest('#scanBar') && visible(el));
    if (root.matches(sel) && visible(root)) els.unshift(root);
    // drop a button that sits inside another scanned button
    const out = els.filter((el) => !els.some((o) => o !== el && o.contains(el) && o.matches('button')));
    if (root !== stage) return out;
    // on a screen, the main choices come first; the top bar (back, hear it, stars...) comes last
    const top = stage.getBoundingClientRect().top, h = stage.getBoundingClientRect().height || 1;
    const head = (el) => (el.getBoundingClientRect().top - top) / h < 0.11;
    return out.filter((el) => !head(el)).concat(out.filter(head));
  }
  function nameOf(el) {
    const t = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '';
    return t.replace(/\s+/g, ' ').trim().slice(0, 60);
  }
  function mark(i) {
    if (cur) cur.classList.remove('scan-on');
    if (!list.length) { cur = null; idx = -1; return; }
    idx = (i + list.length) % list.length;
    if (idx === 0 && i !== 0) loops += 1;
    cur = list[idx];
    cur.classList.add('scan-on');
    try { cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ }
    if (st().scanSpeak) { const n = nameOf(cur); if (n) A.tts ? A.tts(n) : say(n); }
  }
  function stopAuto() { clearInterval(timer); timer = null; }
  function startAuto() {
    stopAuto();
    if (mode() !== 'auto') return;
    loops = 0;
    timer = setInterval(() => {
      if (!document.body.contains(cur)) refresh(true);
      if (loops >= 3) { stopAuto(); paused = true; if (cur) cur.classList.remove('scan-on'); setBar('Press the switch to start again'); return; }
      mark(idx + 1);
    }, (st().scanSpeed || 2.5) * 1000);
  }
  function refresh(keep) {
    if (mode() === 'off') { if (cur) cur.classList.remove('scan-on'); cur = null; setBar(null); stopAuto(); return; }
    const was = cur;
    list = collect();
    if (!list.length) { setBar(null); stopAuto(); return; }
    // a new screen or pop-up starts again at the first button
    const root = (list[0].closest('#nrBox, #breakMenu, .su-big, .ok-big, .su-tips, .pp-full, [role="dialog"]') || stage.querySelector('.screen'));
    if (root !== lastRoot) { keep = false; lastRoot = root; paused = false; }
    if (paused) return;
    setBar(mode() === 'auto' ? 'Switch: press to choose' : 'Space: next · Enter: choose');
    const k = keep && was ? list.indexOf(was) : -1;
    mark(k >= 0 ? k : 0);
    if (mode() === 'auto' && !timer) startAuto();
  }
  let pend = null;
  const soon = () => { clearTimeout(pend); pend = setTimeout(() => refresh(true), 160); };
  new MutationObserver((muts) => {
    if (mode() === 'off') return;
    // ignore our own highlight changes
    if (muts.every((m) => (m.type === 'attributes' && m.attributeName === 'class') || m.target === bar || bar.contains(m.target))) return;
    soon();
  }).observe(stage, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });

  function choose() {
    if (!cur || !document.body.contains(cur)) { refresh(false); return; }
    const el = cur;
    if (el.matches('input, textarea, select')) { el.focus(); return; }
    el.click();
    if (mode() === 'auto') { stopAuto(); soon(); }
  }
  window.addEventListener('keydown', (e) => {
    const m = mode();
    if (m === 'off') return;
    const t = e.target;
    if (t && t.matches && t.matches('input, textarea, select') && e.key !== 'Escape') return;
    const scr = stage.querySelector('.screen');
    if (scr && scr.classList.contains('grownup')) return;
    const k = e.key;
    if (m === 'auto') {
      if ([' ', 'Enter', 'Spacebar', '1', '2'].includes(k) || k.length === 1) {
        e.preventDefault();
        if (paused || !timer || !cur) { paused = false; lastRoot = null; refresh(false); startAuto(); return; }
        choose();
      }
      return;
    }
    if ([' ', 'ArrowRight', 'ArrowDown', 'Tab', '1'].includes(k)) { e.preventDefault(); if (!cur || !document.body.contains(cur)) refresh(false); else mark(idx + 1); return; }
    if (['ArrowLeft', 'ArrowUp'].includes(k)) { e.preventDefault(); mark(idx - 1); return; }
    if (['Enter', '2'].includes(k)) { e.preventDefault(); choose(); }
  }, true);

  // ---------------------------------------------------------------- Grown-ups › Sensory
  A.switchSettingsHtml = () => {
    const m = mode();
    const seg = (opts, cur2, action) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button class="seg-opt ${cur2 === v ? 'on' : ''}" data-a="${action}" data-v="${v}" aria-pressed="${cur2 === v}">${l}</button>`).join('')}</div>`;
    return `<h2 class="g-h top-gap">Switch access</h2>
      ${seg([['off', 'Off'], ['auto', 'One switch'], ['step', 'Two switches']], m, 'scMode')}
      ${m !== 'off' ? `<p class="g-note">${m === 'auto' ? 'An orange frame moves by itself. Press the switch (or Space) to choose.' : 'Space or → moves the frame. Enter chooses.'} Grown-ups pages are not scanned.</p>
        ${m === 'auto' ? `<div class="g-field"><span>Speed</span>${seg([[4, 'Slow'], [2.5, 'Medium'], [1.5, 'Quick']], st().scanSpeed || 2.5, 'scSpeed')}</div>` : ''}
        <button class="check-row" data-a="scSpeak" aria-pressed="${!!st().scanSpeak}"><span class="box ${st().scanSpeak ? 'on' : ''}">${st().scanSpeak ? ic('check', 14) : ''}</span><span>Say each button's name</span></button>` : ''}`;
  };
  Object.assign(A.ACTIONS, {
    scMode: (d) => { st().scan = d.v; if (d.v !== 'off') st().tapMove = true; save(); A.applyPrefs(); render(); refresh(false); },
    scSpeed: (d) => { st().scanSpeed = Number(d.v); save(); render(); },
    scSpeak: () => { st().scanSpeak = !st().scanSpeak; save(); render(); }
  });
  // start after the first screen is drawn
  setTimeout(() => refresh(false), 600);
  A.scanRefresh = refresh;
  void esc;
})();
