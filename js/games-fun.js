/*
  games-fun.js
  Five "Make it go" games, built from what children (and autistic children in particular) are most often seen
  to choose in play: things that answer straight away when you touch them, things that roll, spin and drop,
  a moment of waiting before something happens, catching and collecting, and lining things up.
  (The reading behind this is in the README.)

  ballrun   Ball run          Drop the ball down a pipe and watch where it goes. Which pipe leads to the star cup?
  fishing   Go fishing        Lower the hook onto a fish to catch it (Medium: one colour; Hard: in number order).
  balloon   Blow the balloon  Pump the balloon up to the ring, then let it go and watch it whizz.
  windmill  Spin the windmill Spin the sails round and round to light up the houses.
  train     Build the train   Line the carriages up in order behind the engine, then send the train off.

  Like every Lumi game: three levels, no losing, no clock. Nothing bangs or pops; a miss gets a soft word.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  if (!A || !A.GAME || !A.GAME.draggable) return;
  const { D, S, state, ic, esc, say, tone, render, later, every, dots, stage } = A;
  const { header, winCard, win, lv, shuffle, NOTES, draggable, inside, wiggle, lumi, restartOn } = A.GAME;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
  const COLORS = [
    { k: 'red', c: '#EF8A7A', d: '#C9584A' }, { k: 'yellow', c: '#F4D35E', d: '#C99A1E' }, { k: 'green', c: '#9CCB7A', d: '#5E9E45' },
    { k: 'blue', c: '#8EB8E5', d: '#4A78A8' }, { k: 'purple', c: '#B9A6E0', d: '#7E64C8' }
  ];
  const stillHere = (id) => S.screen === 'g-' + id && S.g && S.gId === id;

  // ================================================================ 1. Ball run (cause and effect, looking ahead)
  // Pipes go down; little bridges join them. A ball always takes a bridge when it meets one.
  const runCfg = () => ({ 1: { n: 3, rungs: 2 }, 2: { n: 4, rungs: 4 }, 3: { n: 5, rungs: 7 } }[lv()]);
  function runRound() {
    const c = runCfg();
    const rungs = [];
    const rows = shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, c.rungs).sort((a, b) => a - b);
    rows.forEach((row) => rungs.push({ row, lane: Math.floor(Math.random() * (c.n - 1)) }));
    return { n: c.n, rungs, star: Math.floor(Math.random() * c.n), tried: [], busy: false, landed: null };
  }
  const RUN = { top: 70, bottom: 440, w: 1000, h: 520 };
  const laneX = (r, i) => (RUN.w / (r.n + 1)) * (i + 1);
  const rungY = (row) => RUN.top + 40 + row * ((RUN.bottom - RUN.top - 80) / 7);
  function runPath(r, from) {
    let lane = from;
    const pts = [[laneX(r, lane), 20], [laneX(r, lane), RUN.top]];
    r.rungs.forEach((g) => {
      if (g.lane === lane || g.lane === lane - 1) {
        const to = g.lane === lane ? lane + 1 : lane - 1;
        pts.push([laneX(r, lane), rungY(g.row)], [laneX(r, to), rungY(g.row) + 26]);
        lane = to;
      }
    });
    pts.push([laneX(r, lane), RUN.bottom + 34]);
    return { pts, end: lane };
  }
  A.GAME_MAKERS.ballrun = () => ({ round: 0, total: 3, r: runRound(), won: false });
  A.PARENT['g-ballrun'] = 'play';
  A.VOICE['g-ballrun'] = () => 'Which pipe goes to the star cup? Tap one to drop the ball.';
  A.SCREENS['g-ballrun'] = () => {
    const g = S.g;
    const r = g.r;
    let svg = '';
    for (let i = 0; i < r.n; i++) svg += `<line x1="${laneX(r, i)}" y1="${RUN.top}" x2="${laneX(r, i)}" y2="${RUN.bottom}" stroke="${COLORS[i].c}" stroke-width="30" stroke-linecap="round"/>`;
    r.rungs.forEach((k) => { svg += `<line x1="${laneX(r, k.lane)}" y1="${rungY(k.row)}" x2="${laneX(r, k.lane + 1)}" y2="${rungY(k.row) + 26}" stroke="#D9C9B4" stroke-width="24" stroke-linecap="round"/>`; });
    const tops = Array.from({ length: r.n }, (_, i) => `<button class="br-top ${r.tried.includes(i) ? 'tried' : ''}" data-a="brDrop" data-v="${i}" style="left:${(laneX(r, i) / RUN.w) * 100}%;--c:${COLORS[i].c};--d:${COLORS[i].d}" aria-label="Pipe ${i + 1}, ${COLORS[i].k}${r.tried.includes(i) ? ', tried' : ''}"><i></i></button>`).join('');
    const cups = Array.from({ length: r.n }, (_, i) => `<span class="br-cup ${i === r.star ? 'star' : ''} ${r.landed === i ? 'got' : ''}" style="left:${(laneX(r, i) / RUN.w) * 100}%">${i === r.star ? ic('star', 40) : ''}</span>`).join('');
    return `
<section class="screen" aria-label="Ball run">
  ${A.srTitle('Ball run')}
  ${header('ballrun', A.VOICE['g-ballrun']())}
  <div class="row gap24 grow">
    <div class="panel br-board grow" id="brBoard">
      <svg class="br-pipes" viewBox="0 0 ${RUN.w} ${RUN.h}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>
      ${tops}${cups}
      <span class="br-ball" id="brBall" hidden></span>
    </div>
    <div class="col center gap16" style="width:210px">
      <div>${lumi(r.landed === r.star ? 'excited' : 'happy', 170)}</div>
      ${dots(g.round, g.total, 'var(--teal)', 18)}
    </div>
  </div>
  ${winCard('ballrun')}
</section>`;
  };
  A.ACTIONS.brDrop = (d) => {
    const g = S.g;
    const r = g.r;
    if (g.won || r.busy) return 'keep';
    const from = Number(d.v);
    const { pts, end } = runPath(r, from);
    const ball = document.getElementById('brBall');
    if (!ball) return 'keep';
    r.busy = true;
    // how long each stretch takes, so the ball keeps one steady speed
    let total = 0;
    const lens = pts.slice(1).map((p, i) => { const l = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); total += l; return l; });
    const dur = Math.max(1400, total * 3.4);
    let acc = 0;
    const frames = pts.map((p, i) => { if (i) acc += lens[i - 1]; return { left: `${(p[0] / RUN.w) * 100}%`, top: `${(p[1] / RUN.h) * 100}%`, offset: total ? acc / total : 0 }; });
    ball.hidden = false;
    ball.style.background = COLORS[from].d;
    Object.assign(ball.style, { left: frames[0].left, top: frames[0].top });
    try { ball.animate(frames, { duration: dur, fill: 'forwards', easing: 'linear' }); } catch (e) { Object.assign(ball.style, { left: frames[frames.length - 1].left, top: frames[frames.length - 1].top }); }
    frames.slice(1, -1).forEach((f, i) => later(() => { if (stillHere('ballrun')) tone(NOTES[i % NOTES.length], 0.14, 0.05); }, f.offset * dur));
    later(() => {
      if (!stillHere('ballrun')) return;
      r.busy = false;
      r.landed = end;
      if (end === r.star) {
        tone(880, 0.4, 0.1);
        say('In the star cup!');
        render();
        later(() => {
          if (!stillHere('ballrun')) return;
          g.round += 1;
          if (g.round >= g.total) { win('ballrun', lv() === 3 ? 2 : 1); return; }
          g.r = runRound();
          render();
        }, 1500);
      } else {
        if (!r.tried.includes(from)) r.tried.push(from);
        tone(330, 0.2, 0.06);
        say('Not the star cup. Try another pipe!');
        render();
      }
    }, dur + 80);
    return 'keep';
  };
  A.GUIDE['g-ballrun'] = () => (S.g && !S.g.won && !S.g.r.busy ? { sel: '.br-top:not(.tried)', say: 'Tap a pipe to drop the ball.', delay: state.settings.guideDelay * 1000 + 5000 } : null);
  restartOn('ballrun');

  // ================================================================ 2. Go fishing (catching and collecting)
  const fishCfg = () => ({ 1: { fish: 5, goal: 4, mode: 'any', secs: [15, 19] }, 2: { fish: 6, goal: 3, mode: 'colour', secs: [11, 15] }, 3: { fish: 5, goal: 5, mode: 'order', secs: [10, 13] } }[lv()]);
  function fishNew() {
    const c = fishCfg();
    const want = pickOne(COLORS.slice(0, 4));
    const list = [];
    for (let i = 0; i < c.fish; i++) {
      const col = c.mode === 'colour' ? (i < c.goal ? want : pickOne(COLORS.filter((x) => x.k !== want.k))) : COLORS[i % COLORS.length];
      list.push({ id: i, col, n: i + 1, y: 0, secs: rnd(c.secs[0], c.secs[1]), delay: -rnd(0, 12), caught: false });
    }
    const order = shuffle(list.map((_, i) => i));
    list.forEach((f, i) => { f.y = 14 + order[i] * (70 / c.fish); });
    return { fish: list, want, caught: 0, goal: c.goal, mode: c.mode, won: false, t0: Date.now() };
  }
  const fishSvg = (f, show) => `<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M92 35l24-20v40z" fill="${f.col.d}"/><ellipse cx="54" cy="35" rx="44" ry="26" fill="${f.col.c}" stroke="${f.col.d}" stroke-width="4"/><circle cx="28" cy="28" r="6" fill="#fff"/><circle cx="27" cy="28" r="3" fill="#3B2F2F"/><path d="M50 22q10 13 0 26" fill="none" stroke="${f.col.d}" stroke-width="4" stroke-linecap="round"/>${show ? `<text x="70" y="45" font-size="30" font-weight="900" text-anchor="middle" fill="#3B2F2F" font-family="inherit">${f.n}</text>` : ''}</svg>`;
  const fishAsk = (g) => (g.mode === 'colour' ? `Catch the ${g.want.k} fish.` : g.mode === 'order' ? `Catch fish number ${Math.min(g.caught + 1, g.goal)}.` : 'Catch the fish!');
  A.GAME_MAKERS.fishing = fishNew;
  A.PARENT['g-fishing'] = 'play';
  A.VOICE['g-fishing'] = () => `${fishAsk(S.g)} Pull the hook down onto a fish.`;
  A.SCREENS['g-fishing'] = () => {
    const g = S.g;
    // each fish carries on from where it was when the pond is drawn again
    const since = (Date.now() - g.t0) / 1000;
    const fish = g.fish.filter((f) => !f.caught).map((f) => `<span class="fs-fish" data-k="${f.id}" style="top:${f.y}%;animation-duration:${f.secs}s;animation-delay:${(f.delay - since).toFixed(2)}s"><span class="fs-flip" style="animation-duration:${f.secs * 2}s;animation-delay:${(f.delay - since).toFixed(2)}s">${fishSvg(f, g.mode === 'order')}</span></span>`).join('');
    return `
<section class="screen" aria-label="Go fishing">
  ${A.srTitle('Go fishing')}
  ${header('fishing', A.VOICE['g-fishing']())}
  <div class="row gap24 grow">
    <div class="panel fs-pond grow" id="fsPond">
      <span class="fs-ask" aria-live="polite">${esc(fishAsk(g))}</span>
      <div class="fs-water" id="fsWater">${fish}</div>
      <span class="fs-line" id="fsLine"></span>
      <span class="fs-hook" id="fsHook" role="button" aria-label="Fishing hook. Pull it down onto a fish.">${ic('hook', 54)}</span>
    </div>
    <div class="col center gap12" style="width:210px">
      <div>${lumi('happy', 160)}</div>
      <div class="fs-bucket" aria-label="${g.caught} of ${g.goal} caught">${g.fish.filter((f) => f.caught).map((f) => `<span class="fs-got">${fishSvg(f, g.mode === 'order')}</span>`).join('')}</div>
      <b class="fs-count">${g.caught} / ${g.goal}</b>
    </div>
  </div>
  ${winCard('fishing')}
</section>`;
  };
  function fishTry(id, el) {
    const g = S.g;
    const f = g.fish.find((x) => x.id === id);
    if (!f || f.caught || g.won) return false;
    if (g.mode === 'colour' && f.col.k !== g.want.k) { wiggle(el); say(`That one is ${f.col.k}. Catch a ${g.want.k} fish.`); return false; }
    if (g.mode === 'order' && f.n !== g.caught + 1) { wiggle(el); say(`That is number ${f.n}. Find number ${g.caught + 1}.`); return false; }
    f.caught = true;
    g.caught += 1;
    tone(NOTES[Math.min(g.caught, NOTES.length - 1)], 0.3, 0.09);
    if (g.caught >= g.goal) { render(); later(() => win('fishing', lv() === 3 ? 2 : 1), 500); return true; }
    say(g.mode === 'order' ? `Got it! Now number ${g.caught + 1}.` : 'Got one!');
    render();
    return true;
  }
  A.AFTER['g-fishing'] = () => {
    const pond = document.getElementById('fsPond');
    const hook = document.getElementById('fsHook');
    const line = document.getElementById('fsLine');
    if (!pond || !hook) return;
    const place = (x, y) => { hook.style.left = `${x}%`; hook.style.top = `${y}%`; line.style.left = `${x}%`; line.style.height = `${y}%`; };
    const home = () => place(62, 9);
    home();
    let down = false, cool = 0;
    const move = (e) => {
      const r = pond.getBoundingClientRect();
      const x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.max(6, Math.min(92, ((e.clientY - r.top) / r.height) * 100));
      place(x, y);
      if (Date.now() < cool) return;
      const h = hook.getBoundingClientRect();
      const hx = h.left + h.width / 2, hy = h.top + h.height * 0.8;
      const hit = Array.from(pond.querySelectorAll('.fs-fish')).find((el) => inside(el, hx, hy));
      if (hit) { cool = Date.now() + 900; if (fishTry(Number(hit.dataset.k), hit)) down = false; }
    };
    pond.addEventListener('pointerdown', (e) => { if (S.g.won) return; down = true; try { pond.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } move(e); });
    pond.addEventListener('pointermove', (e) => { if (down) move(e); });
    const up = () => { if (!down) return; down = false; hook.classList.add('back'); line.classList.add('back'); home(); setTimeout(() => { hook.classList.remove('back'); line.classList.remove('back'); }, 450); };
    pond.addEventListener('pointerup', up);
    pond.addEventListener('pointercancel', up);
  };
  A.GUIDE['g-fishing'] = () => (S.g && !S.g.won ? { sel: '#fsHook', to: '.fs-fish', say: 'Pull the hook down onto a fish.', delay: state.settings.guideDelay * 1000 + 5000 } : null);
  restartOn('fishing');

  // ================================================================ 3. Blow the balloon (waiting, then whoosh)
  const balCfg = () => ({ 1: { band: 26, step: 9 }, 2: { band: 17, step: 7 }, 3: { band: 10, step: 5 } }[lv()]);
  function balRound() {
    const c = balCfg();
    const target = Math.round(rnd(48, 82));
    return { size: 18, lo: target - c.band / 2, hi: target + c.band / 2, col: pickOne(COLORS), fly: false, soft: false };
  }
  A.GAME_MAKERS.balloon = () => ({ round: 0, total: 3, r: balRound(), won: false });
  A.PARENT['g-balloon'] = 'play';
  A.VOICE['g-balloon'] = () => 'Pump the balloon up to the ring. Then let it go!';
  const balPx = (pct) => Math.round(70 + pct * 3.4);
  A.SCREENS['g-balloon'] = () => {
    const g = S.g;
    const r = g.r;
    const ok = r.size >= r.lo && r.size <= r.hi;
    return `
<section class="screen" aria-label="Blow the balloon">
  ${A.srTitle('Blow the balloon')}
  ${header('balloon', A.VOICE['g-balloon']())}
  <div class="row gap24 grow">
    <div class="panel bl-sky grow">
      <span class="bl-ring" style="width:${balPx(r.hi)}px;height:${balPx(r.hi)}px"></span>
      <span class="bl-ring in" style="width:${balPx(r.lo)}px;height:${balPx(r.lo)}px"></span>
      <span class="bl-balloon ${r.fly ? 'fly' : ''} ${r.soft ? 'soft' : ''} ${ok ? 'ok' : ''}" id="blBalloon" style="width:${balPx(r.size)}px;height:${balPx(r.size)}px;--c:${r.col.c};--d:${r.col.d}"><i></i></span>
      <div class="bl-round">${dots(g.round, g.total, 'var(--teal)', 18)}</div>
    </div>
    <div class="col center gap16" style="width:250px">
      <div>${lumi(r.fly ? 'excited' : 'happy', 150)}</div>
      <button class="primary big bl-pump" data-a="blPump" ${r.fly ? 'disabled' : ''} aria-label="Pump air in">${ic('pump', 54)}<span>Pump</span></button>
      <button class="primary big soft-btn bl-go ${ok ? 'ready' : ''}" data-a="blGo" ${r.fly ? 'disabled' : ''} aria-label="Let the balloon go">${ic('kBalloon', 46)}<span>Let go</span></button>
    </div>
  </div>
  ${winCard('balloon')}
</section>`;
  };
  Object.assign(A.ACTIONS, {
    blPump: () => {
      const g = S.g, r = g.r, c = balCfg();
      if (g.won || r.fly) return 'keep';
      r.soft = false;
      r.size = Math.min(100, r.size + c.step);
      tone(180 + r.size * 4, 0.18, 0.06);
      if (r.size > r.hi + 12) {
        // too much air: it sighs back down. Nothing pops.
        r.size = 18; r.soft = true;
        tone(220, 0.6, 0.05);
        say('Too much air! Pfff. Try again.');
      } else if (r.size >= r.lo && r.size <= r.hi) say('Just right! Let it go.');
      render();
      return 'keep';
    },
    blGo: () => {
      const g = S.g, r = g.r;
      if (g.won || r.fly) return 'keep';
      if (r.size < r.lo) { wiggle(document.getElementById('blBalloon')); say('A bit more air. Pump!'); return 'keep'; }
      if (r.size > r.hi) { r.size = 18; r.soft = true; tone(220, 0.6, 0.05); say('A bit too big. Pfff. Try again.'); render(); return 'keep'; }
      r.fly = true;
      render();
      say('Wheee!');
      [0, 250, 500, 750, 1000].forEach((ms, i) => later(() => { if (stillHere('balloon')) tone(900 - i * 110, 0.2, 0.05); }, ms));
      later(() => {
        if (!stillHere('balloon')) return;
        g.round += 1;
        if (g.round >= g.total) { win('balloon', lv() === 3 ? 2 : 1); return; }
        g.r = balRound();
        render();
      }, 2300);
      return 'keep';
    }
  });
  A.GUIDE['g-balloon'] = () => { const g = S.g; if (!g || g.won || g.r.fly) return null; const ok = g.r.size >= g.r.lo; return { sel: ok ? '.bl-go' : '.bl-pump', say: ok ? 'Let it go!' : 'Tap Pump.', delay: state.settings.guideDelay * 1000 + 5000 }; };
  restartOn('balloon');

  // ================================================================ 4. Spin the windmill (round and round)
  const millCfg = () => ({ 1: { houses: 3, need: 130, drain: 0 }, 2: { houses: 4, need: 190, drain: 4 }, 3: { houses: 5, need: 250, drain: 10 } }[lv()]);
  A.GAME_MAKERS.windmill = () => ({ lit: 0, power: 0, angle: 0, speed: 0, won: false });
  A.PARENT['g-windmill'] = 'play';
  A.VOICE['g-windmill'] = () => 'Spin the windmill round and round to light up the houses.';
  A.SCREENS['g-windmill'] = () => {
    const g = S.g;
    const c = millCfg();
    const sail = (rot) => `<g transform="rotate(${rot} 150 150)"><rect x="141" y="22" width="18" height="128" rx="6" fill="#B58A5E"/><path d="M159 30h58l-12 78h-46z" fill="#FDF6EA" stroke="#D9C9B4" stroke-width="4"/></g>`;
    return `
<section class="screen" aria-label="Spin the windmill">
  ${A.srTitle('Spin the windmill')}
  ${header('windmill', A.VOICE['g-windmill']())}
  <div class="panel wm-field grow" id="wmField">
    <span class="wm-cloud a"></span><span class="wm-cloud b"></span>
    <div class="wm-mill">
      <span class="wm-tower"></span>
      <button class="wm-sails" id="wmSails" aria-label="Windmill sails. Spin them round."><svg viewBox="0 0 300 300" id="wmSvg" aria-hidden="true">${sail(0)}${sail(90)}${sail(180)}${sail(270)}<circle cx="150" cy="150" r="22" fill="#C0674A" stroke="#8A4630" stroke-width="5"/></svg></button>
    </div>
    <div class="wm-side">
      <span class="wm-meter" aria-hidden="true"><i id="wmPower" style="height:${Math.round((g.power / c.need) * 100)}%"></i></span>
      <div class="wm-houses" id="wmHouses" aria-label="${g.lit} of ${c.houses} houses lit">${Array.from({ length: c.houses }, (_, i) => `<span class="wm-house ${i < g.lit ? 'lit' : ''}"><i></i></span>`).join('')}</div>
    </div>
    <div class="wm-hill"></div>
  </div>
  ${winCard('windmill')}
</section>`;
  };
  A.AFTER['g-windmill'] = () => {
    const sails = document.getElementById('wmSails');
    const svg = document.getElementById('wmSvg');
    const power = document.getElementById('wmPower');
    const houses = document.getElementById('wmHouses');
    if (!sails || !svg) return;
    const g = S.g;
    const c = millCfg();
    svg.style.transform = `rotate(${g.angle}deg)`;
    if (sails.dataset.wired) return;
    sails.dataset.wired = '1';
    let last = null, moved = 0, tick = 0;
    const ang = (e) => { const r = sails.getBoundingClientRect(); return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI; };
    sails.addEventListener('pointerdown', (e) => { if (g.won) return; last = ang(e); moved = 0; try { sails.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } });
    sails.addEventListener('pointermove', (e) => {
      if (last == null || g.won) return;
      const a = ang(e);
      let d = a - last;
      if (d > 180) d -= 360; else if (d < -180) d += 360;
      last = a;
      moved += Math.abs(d);
      g.speed = Math.max(-520, Math.min(520, g.speed * 0.6 + d * 14));
    });
    const up = () => { if (last != null && moved < 8 && !g.won) g.speed = Math.min(520, Math.abs(g.speed) + 200) * (g.speed < 0 ? -1 : 1); last = null; }; // a tap gives it a push too
    sails.addEventListener('pointerup', up);
    sails.addEventListener('pointercancel', up);
    every(() => {
      if (!stillHere('windmill') || g.won) return;
      const dt = 0.04;
      g.angle = (g.angle + g.speed * dt) % 360;
      g.speed *= 0.965;
      const v = Math.abs(g.speed);
      if (v > 40) g.power += v * dt * 0.42; else g.power = Math.max(0, g.power - c.drain * dt);
      svg.style.transform = `rotate(${g.angle}deg)`;
      if (v > 60 && ++tick % Math.max(2, Math.round(9 - v / 70)) === 0) tone(300 + v * 0.5, 0.06, 0.025);
      if (g.power >= c.need) {
        g.power = 0;
        g.lit += 1;
        tone(NOTES[Math.min(g.lit, NOTES.length - 1)], 0.4, 0.1);
        const h = houses.children[g.lit - 1];
        if (h) h.classList.add('lit');
        if (g.lit >= c.houses) { later(() => win('windmill', lv() === 3 ? 2 : 1), 700); }
        else say(g.lit === 1 ? 'A light is on! Keep spinning.' : 'Another one!');
      }
      if (power) power.style.height = `${Math.round((g.power / c.need) * 100)}%`;
    }, 40);
  };
  A.GUIDE['g-windmill'] = () => (S.g && !S.g.won && Math.abs(S.g.speed) < 30 ? { sel: '#wmSails', say: 'Spin it round and round.', delay: state.settings.guideDelay * 1000 + 5000 } : null);
  restartOn('windmill');

  // ================================================================ 5. Build the train (lining up, counting)
  const trainCfg = () => ({ 1: { n: 3, step: 1 }, 2: { n: 5, step: 1 }, 3: { n: 5, step: 2 } }[lv()]);
  function trainRound() {
    const c = trainCfg();
    const cols = shuffle(COLORS.slice());
    const cars = Array.from({ length: c.n }, (_, i) => ({ id: i, n: (i + 1) * c.step, col: cols[i % cols.length], on: false }));
    return { cars, tray: shuffle(cars.map((x) => x.id)), placed: 0, go: false };
  }
  const carSvg = (car) => `<svg viewBox="0 0 120 90" aria-hidden="true"><rect x="6" y="10" width="108" height="56" rx="14" fill="${car.col.c}" stroke="${car.col.d}" stroke-width="5"/><rect x="20" y="20" width="24" height="20" rx="5" fill="#fff" opacity="0.85"/><rect x="76" y="20" width="24" height="20" rx="5" fill="#fff" opacity="0.85"/><circle cx="32" cy="72" r="12" fill="#5A4B45"/><circle cx="88" cy="72" r="12" fill="#5A4B45"/><circle cx="60" cy="42" r="19" fill="#fff"/><text x="60" y="52" font-size="${car.n > 9 ? 24 : 30}" font-weight="900" text-anchor="middle" fill="#3B2F2F" font-family="inherit">${car.n}</text></svg>`;
  const engineSvg = '<svg viewBox="0 0 130 90" aria-hidden="true"><rect x="8" y="26" width="76" height="40" rx="12" fill="#C0674A" stroke="#8A4630" stroke-width="5"/><rect x="70" y="6" width="50" height="60" rx="12" fill="#E08A6A" stroke="#8A4630" stroke-width="5"/><rect x="82" y="16" width="26" height="22" rx="5" fill="#fff" opacity="0.9"/><rect x="20" y="8" width="16" height="22" rx="5" fill="#8A4630"/><circle cx="32" cy="72" r="12" fill="#5A4B45"/><circle cx="96" cy="72" r="12" fill="#5A4B45"/></svg>';
  const trainAsk = (r) => { const next = r.cars[r.placed]; return next ? `Find number ${next.n}.` : 'All aboard!'; };
  A.GAME_MAKERS.train = () => ({ round: 0, total: 2, r: trainRound(), won: false });
  A.PARENT['g-train'] = 'play';
  A.VOICE['g-train'] = () => (lv() === 3 ? 'Line up the carriages, counting in twos.' : 'Line up the carriages in order.') + ' ' + trainAsk(S.g.r);
  A.SCREENS['g-train'] = () => {
    const g = S.g;
    const r = g.r;
    const slots = r.cars.map((car, i) => (car.on ? `<span class="tr-car on">${carSvg(car)}</span>` : `<span class="tr-slot ${i === r.placed ? 'next' : ''}" data-i="${i}"><b>${i === r.placed ? car.n : ''}</b></span>`)).join('');
    const tray = r.tray.map((id) => r.cars[id]).filter((car) => !car.on).map((car) => `<span class="tr-car loose" data-k="${car.id}" role="button" aria-label="Carriage number ${car.n}">${carSvg(car)}</span>`).join('');
    return `
<section class="screen" aria-label="Build the train">
  ${A.srTitle('Build the train')}
  ${header('train', A.VOICE['g-train']())}
  <div class="panel tr-yard grow">
    <span class="tr-ask" aria-live="polite">${esc(trainAsk(r))}</span>
    <div class="tr-line ${r.go ? 'go' : ''}" id="trLine"><span class="tr-engine">${engineSvg}<i class="tr-puff"></i></span>${slots}</div>
    <div class="tr-rail"></div>
    <div class="tr-tray">${tray}</div>
    <div class="tr-foot"><span>${lumi(r.go ? 'excited' : 'happy', 120)}</span>${dots(g.round, g.total, 'var(--teal)', 18)}</div>
  </div>
  ${winCard('train')}
</section>`;
  };
  function trainPut(id, el) {
    const g = S.g, r = g.r;
    if (g.won || r.go) return false;
    const car = r.cars[id];
    const next = r.cars[r.placed];
    if (!next || car.id !== next.id) { wiggle(el); say(`That is number ${car.n}. Find number ${next.n}.`); return false; }
    car.on = true;
    r.placed += 1;
    tone(NOTES[Math.min(r.placed, NOTES.length - 1)], 0.3, 0.09);
    if (r.placed >= r.cars.length) {
      r.go = true;
      render();
      say('All aboard! Choo choo!');
      [0, 260, 520, 780, 1040, 1300].forEach((ms, i) => later(() => { if (stillHere('train')) tone(i % 2 ? 196 : 247, 0.16, 0.07); }, 500 + ms));
      later(() => {
        if (!stillHere('train')) return;
        g.round += 1;
        if (g.round >= g.total) { win('train', lv() === 3 ? 2 : 1); return; }
        g.r = trainRound();
        render();
        later(() => say(trainAsk(g.r)), 300);
      }, 2900);
      return true;
    }
    say(`${car.n}! ${trainAsk(r)}`);
    render();
    return true;
  }
  A.AFTER['g-train'] = () => {
    const line = document.getElementById('trLine');
    stage.querySelectorAll('.tr-car.loose').forEach((el) => {
      const id = Number(el.dataset.k);
      draggable(el, {
        over: (x, y) => line && line.classList.toggle('hot', inside(line, x, y)),
        drop: (x, y) => (inside(line, x, y) ? trainPut(id, el) : false),
        tap: () => trainPut(id, el)
      });
    });
  };
  A.GUIDE['g-train'] = () => { const g = S.g; if (!g || g.won || g.r.go) return null; const next = g.r.cars[g.r.placed]; return next ? { sel: `.tr-car.loose[data-k="${next.id}"]`, to: '.tr-slot.next', say: `Drag number ${next.n} to the train.`, delay: state.settings.guideDelay * 1000 + 5000 } : null; };
  restartOn('train');

  // ---------------------------------------------------------------- onto the Play shelves
  if (A.GAME.guard) A.GAME.guard(['ballrun', 'fishing', 'balloon', 'windmill', 'train']);
  D.GAMES.push(
    { id: 'ballrun', name: 'Ball run', icon: 'kBall', kind: 'Watch it roll', tint: '#FDE6D8', ink: '#C0603F', skill: 'thinking', cat: 'go' },
    { id: 'fishing', name: 'Go fishing', icon: 'kFish', kind: 'Catching', tint: '#E3F0FA', ink: '#4A78A8', skill: 'thinking', cat: 'go' },
    { id: 'balloon', name: 'Blow the balloon', icon: 'kBalloon', kind: 'Wait, then whoosh', tint: '#FCE4EC', ink: '#B4507A', skill: 'emotions', cat: 'go' },
    { id: 'windmill', name: 'Spin the windmill', icon: 'kWind', kind: 'Round and round', tint: '#E7F3E1', ink: '#4F8A3F', skill: 'emotions', cat: 'go' },
    { id: 'train', name: 'Build the train', icon: 'kTrain', kind: 'Lining up', tint: '#FFF1C2', ink: '#8A5C0C', skill: 'thinking', cat: 'go' }
  );
})();
