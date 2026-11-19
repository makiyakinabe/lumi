/*
  calmplus.js
  Two more ways to calm down with Lumi, in the calm corner (next to Balloon, Squeeze, Count and Bells).

  1. Smell and blow: breathe with Lumi. "Smell the flower" (breathe in for 4 seconds), then "blow out the
     candle" (breathe out for 6 seconds), 4 times. Lumi breathes too. Slow breathing with a longer
     breath out lowers the heart rate; a one-minute "smell the flower, blow out the candle" video
     calmed 7-year-olds' bodies in a Stanford study, so this follows the same 4 breaths.
  2. Count the stars: a night sky. One star comes out at a time; the child taps it and Lumi counts softly
     with a gentle note. If the child just watches, the star lights up by itself, so there is no wrong way.
     Ten stars join up into a heart. Counting slowly (up, or down from 10 to 1) is a calming strategy
     used in schools for children with special needs. Both are quiet, slow and predictable.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, say, tone, dots } = A;

  const flowerSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
    <defs><radialGradient id="fbPet" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFD6E4"/><stop offset="1" stop-color="#F08CB0"/></radialGradient>
    <radialGradient id="fbMid" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF1A8"/><stop offset="1" stop-color="#F4B63F"/></radialGradient></defs>
    <path d="M60 64 C58 84 62 98 60 116" stroke="#5E9E4A" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M60 96 C44 86 34 92 30 100 C42 104 52 102 60 96Z" fill="#7FB86A"/><path d="M61 88 C76 78 88 82 92 90 C80 96 70 94 61 88Z" fill="#7FB86A"/>
    <g class="fb-petals">${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="60" cy="34" rx="15" ry="22" fill="url(#fbPet)" transform="rotate(${r} 60 54)"/>`).join('')}</g>
    <circle cx="60" cy="54" r="13" fill="url(#fbMid)"/><circle cx="55" cy="50" r="3" fill="#fff" opacity=".7"/></svg>`;
  const candleSvg = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
    <defs><linearGradient id="fbWax" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3EEF9"/><stop offset="1" stop-color="#D9CFEA"/></linearGradient>
    <radialGradient id="fbFlame" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".5" stop-color="#FFC94A"/><stop offset="1" stop-color="#F28A3A"/></radialGradient></defs>
    <ellipse cx="60" cy="112" rx="30" ry="6" fill="#000" opacity=".08"/>
    <rect x="42" y="50" width="36" height="62" rx="8" fill="url(#fbWax)" stroke="#CFC4E2" stroke-width="2"/>
    <path d="M44 56 C50 62 56 56 60 62 C64 56 70 62 76 56" stroke="#E7DFF3" stroke-width="3" fill="none"/>
    <path d="M60 50 L60 40" stroke="#5A4A3A" stroke-width="3" stroke-linecap="round"/>
    <g class="fb-flame"><path d="M60 8 C70 22 72 32 60 42 C48 32 50 22 60 8Z" fill="url(#fbFlame)"/><path d="M60 22 C64 28 64 33 60 38 C56 33 56 28 60 22Z" fill="#FFF8D8"/></g>
    <g class="fb-smoke"><path d="M60 36 C54 28 66 22 60 12 C55 4 64 0 62 -6" stroke="#B9B2C8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></g></svg>`;
  const starSvg = (size, cls) => `<svg class="${cls || ''}" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L24.6 14.6 L37 15.4 L27.4 23.4 L30.6 35.6 L20 28.8 L9.4 35.6 L12.6 23.4 L3 15.4 L15.4 14.6Z" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`;

  // ================================================================ 1. Smell and blow
  const BREATHS = 4, IN_MS = 4000, OUT_MS = 6000;
  let fbTok = 0, fbOn = false;
  function fbHtml() {
    const f = S.fb || { n: 0, phase: 'in' };
    const done = S.calmDone;
    return `<div class="fb-box ${done ? 'done' : f.phase}" id="fbBox">
      <div class="fb-pair">
        <div class="fb-item flower"><span class="fb-ring"></span>${flowerSvg(170)}<span class="fb-cap">Smell</span></div>
        <div class="fb-item candle"><span class="fb-ring"></span>${candleSvg(170)}<span class="fb-cap">Blow</span></div>
      </div>
      <div class="fb-word" id="fbWord">${done ? 'Well done' : f.phase === 'in' ? 'Smell the flower' : 'Blow out the candle'}</div>
      <div id="fbDots">${dots(f.n, BREATHS)}</div>
    </div>`;
  }
  function fbShow() {
    const box = document.getElementById('fbBox'), f = S.fb;
    if (!box || !f) return;
    box.classList.remove('in', 'out');
    box.classList.add(f.phase);
    const w = document.getElementById('fbWord'); if (w) w.textContent = f.phase === 'in' ? 'Smell the flower' : 'Blow out the candle';
    const d = document.getElementById('fbDots'); if (d) d.innerHTML = dots(f.n, BREATHS);
    const lumi = A.stage.querySelector('.calm-lumi');
    if (lumi) { lumi.classList.add('lumi-breathes'); lumi.classList.toggle('in', f.phase === 'in'); }
  }
  function fbStart() {
    S.fb = { n: 0, phase: 'in' };
    const tok = ++fbTok;
    fbOn = true;
    const alive = () => { const ok = tok === fbTok && S.screen === 'calm' && S.calmTool === 'flower' && !S.calmDone; if (!ok && tok === fbTok) fbOn = false; return ok; };
    const breatheIn = () => {
      if (!alive()) return;
      S.fb.phase = 'in'; fbShow();
      say(S.fb.n === 0 ? 'Smell the flower. Breathe in slowly.' : 'Smell the flower.');
      setTimeout(breatheOut, IN_MS);
    };
    const breatheOut = () => {
      if (!alive()) return;
      S.fb.phase = 'out'; fbShow();
      say(S.fb.n === 0 ? 'Now blow out the candle. Slowly.' : 'Blow out the candle.');
      setTimeout(() => {
        if (!alive()) return;
        S.fb.n += 1; fbShow();
        if (S.fb.n >= BREATHS) {
          const box = document.getElementById('fbBox'); if (box) { box.classList.remove('in', 'out'); box.classList.add('done'); }
          const w = document.getElementById('fbWord'); if (w) w.textContent = 'Well done';
          const lumi = A.stage.querySelector('.calm-lumi'); if (lumi) lumi.classList.remove('lumi-breathes', 'in');
          fbOn = false;
          A.calmFinished();
          return;
        }
        breatheIn();
      }, OUT_MS);
    };
    setTimeout(breatheIn, 600);
  }

  // ================================================================ 2. Count the stars
  // ten stars around a heart, in counting order; a few tiny far-away stars that never change
  const HEART = [[50, 30], [37, 16], [21, 18], [11, 34], [17, 54], [33, 70], [50, 86], [67, 70], [83, 54], [89, 34], [79, 18], [63, 16]].filter((_, i) => i !== 1 && i !== 11);
  const FAR = [[6, 8], [18, 80], [30, 40], [44, 6], [58, 52], [72, 92], [92, 74], [94, 10], [64, 34], [40, 60], [8, 90], [86, 88], [26, 28], [76, 40]];
  const NOTES = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  const WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  let stTok = 0, stOn = false;
  const numFor = (i) => (S.st && S.st.down ? 10 - i : i + 1);
  function stHtml() {
    const st = S.st || { lit: 0, cur: -1, down: false };
    const pts = HEART;
    const lines = pts.map((p, i) => { const q = pts[(i + 1) % pts.length]; return `<line class="${i + 1 < st.lit || (st.lit === 10) ? 'on' : ''}" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`; }).join('');
    const stars = pts.map((p, i) => `<button class="st-star ${i < st.lit ? 'lit' : ''} ${i === st.cur ? 'show' : ''}" data-a="stTap" data-n="${i}" style="left:${p[0]}%;top:${p[1]}%" aria-label="Star ${numFor(i)}" ${i > st.cur && i >= st.lit ? 'tabindex="-1" aria-hidden="true"' : ''}>${starSvg(44)}</button>`).join('');
    return `<div class="st-box">
      <div class="st-sky ${st.lit >= 10 ? 'done' : ''}" id="stSky">
        ${FAR.map(([x, y], i) => `<i class="st-far" style="left:${x}%;top:${y}%;animation-delay:${(i % 5) * 0.7}s"></i>`).join('')}
        <span class="st-moon" aria-hidden="true"><svg width="62" height="62" viewBox="0 0 60 60"><path d="M38 6 A24 24 0 1 0 54 40 A20 20 0 1 1 38 6Z" fill="#FFF3C4"/><circle cx="30" cy="30" r="1.8" fill="#C9A85A"/><path d="M26 38 Q30 41 34 38" stroke="#C9A85A" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>
        <svg class="st-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
        ${stars}
        <button class="st-dir" data-a="stDir" aria-label="${st.down ? 'Counting down from 10. Tap to count up' : 'Counting up to 10. Tap to count down'}">${st.down ? '10 → 1' : '1 → 10'}</button>
      </div>
      <div class="st-count" id="stCount" aria-live="polite">${st.lit ? numFor(st.lit - 1) : ''}</div>
    </div>`;
  }
  function stShow() {
    const sky = document.getElementById('stSky'), st = S.st;
    if (!sky || !st) return;
    sky.querySelectorAll('.st-star').forEach((b, i) => {
      b.classList.toggle('lit', i < st.lit);
      b.classList.toggle('show', i === st.cur);
      const hide = i > st.cur && i >= st.lit;
      if (hide) { b.setAttribute('tabindex', '-1'); b.setAttribute('aria-hidden', 'true'); } else { b.removeAttribute('tabindex'); b.removeAttribute('aria-hidden'); }
    });
    sky.querySelectorAll('.st-lines line').forEach((l, i) => l.classList.toggle('on', i + 1 < st.lit || st.lit === 10));
    sky.classList.toggle('done', st.lit >= 10);
    const c = document.getElementById('stCount'); if (c) c.textContent = st.lit ? numFor(st.lit - 1) : '';
  }
  function light(i, byChild) {
    const st = S.st;
    if (!st || i !== st.cur || i < st.lit) return;
    st.lit = i + 1; st.cur = -1;
    tone(NOTES[st.down ? 9 - i : i] / 2, 1.6, 0.12);
    say(WORDS[numFor(i) - 1] + (st.lit === 10 ? '.' : ''));
    if (byChild) st.taps += 1;
    stShow();
    const tok = stTok;
    if (st.lit >= 10) {
      stOn = false;
      setTimeout(() => {
        if (tok !== stTok || S.screen !== 'calm') return;
        say(st.down ? 'Ten, nine, eight... all the way to one. The stars make a heart. Well done.' : 'Ten stars. They make a heart. Well done.');
        A.calmFinished();
      }, 1600);
      return;
    }
    setTimeout(() => nextStar(tok), 1700);
  }
  function nextStar(tok) {
    const st = S.st;
    if (tok !== stTok || !st || S.screen !== 'calm' || S.calmTool !== 'stars' || S.calmDone) { if (tok === stTok) stOn = false; return; }
    st.cur = st.lit; stShow();
    // no wrong way: if the child just watches, the star lights up by itself
    const i = st.cur;
    setTimeout(() => { if (tok === stTok && S.st && S.st.cur === i) light(i, false); }, 6500);
  }
  function stStart(down, intro) {
    const tok = ++stTok;
    stOn = true;
    if (intro) say(down ? "Let's count the stars down, from ten." : "Let's count the stars. Tap each star when it comes out.");
    S.st = { lit: 0, cur: -1, down: !!down, taps: 0 };
    const sky = document.getElementById('stSky');
    if (sky) { const box = sky.closest('.calm-center'); if (box) box.innerHTML = stHtml(); }
    setTimeout(() => nextStar(tok), 900);
  }

  // ================================================================ hook into the calm corner
  A.CALM_EXTRA = {
    flower: { name: 'Smell and blow', icon: (sz) => `<span class="calm-tool-ic">${flowerSvg(Math.round(sz * 0.7))}</span>`, html: fbHtml },
    stars: { name: 'Count the stars', icon: (sz) => `<span class="calm-tool-ic star-ic">${starSvg(Math.round(sz * 0.62))}</span>`, html: stHtml }
  };
  Object.assign(A.ACTIONS, {
    stTap: (d) => { light(Number(d.n), true); return 'keep'; },
    stDir: () => {
      const down = !(S.st && S.st.down);
      S.calmDone = false;
      say(down ? "Let's count down, from ten to one." : "Let's count up, from one to ten.");
      stStart(down);
      return 'keep';
    }
  });
  // choosing one (or coming back to the calm corner with one chosen) starts it; other redraws just show it
  const prevAfter = A.AFTER.calm;
  A.AFTER.calm = () => {
    if (prevAfter) prevAfter();
    if (S.calmDone) return;
    if (S.calmTool === 'flower') { if (!fbOn) fbStart(); else fbShow(); }
    if (S.calmTool === 'stars' && !stOn) stStart(S.st && S.st.down, true);
  };
  const prevGuide = A.GUIDE.calm;
  A.GUIDE.calm = () => {
    if (!S.calmDone && S.calmTool === 'stars') return S.st && S.st.cur >= 0 ? { sel: '.st-star.show', say: 'Tap the star.', quiet: true } : null;
    if (!S.calmDone && S.calmTool === 'flower') return null;
    return prevGuide ? prevGuide() : null;
  };
  void L; void state; void ic;
})();
