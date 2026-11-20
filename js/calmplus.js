/*
  calmplus.js
  One more way to calm down with Lumi, in the calm corner (next to Balloon, Squeeze, Count and Bells).

  Count the stars: a night sky. One star comes out at a time; the child taps it and Lumi counts softly
  with a gentle note. If the child just watches, the star lights up by itself, so there is no wrong way.
  Ten stars join up into a heart. Counting slowly (up, or down from 10 to 1) is a calming strategy
  used in schools for children with special needs. It is quiet, slow and predictable.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, say, tone, dots } = A;

  const starSvg = (size, cls) => `<svg class="${cls || ''}" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 L24.6 14.6 L37 15.4 L27.4 23.4 L30.6 35.6 L20 28.8 L9.4 35.6 L12.6 23.4 L3 15.4 L15.4 14.6Z" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`;

  // ================================================================ Count the stars
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
  // choosing it (or coming back to the calm corner with it chosen) starts it
  const prevAfter = A.AFTER.calm;
  A.AFTER.calm = () => {
    if (prevAfter) prevAfter();
    if (S.calmDone) return;
    if (S.calmTool === 'stars' && !stOn) stStart(S.st && S.st.down, true);
  };
  const prevGuide = A.GUIDE.calm;
  A.GUIDE.calm = () => {
    if (!S.calmDone && S.calmTool === 'stars') return S.st && S.st.cur >= 0 ? { sel: '.st-star.show', say: 'Tap the star.', quiet: true } : null;
    return prevGuide ? prevGuide() : null;
  };
  void L; void state; void ic;
})();
