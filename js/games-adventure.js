/*
  games-adventure.js
  Three adventure games with Lumi, in the spirit of the classic run-and-jump, kart and party-board games
  (Lumi's own worlds and pictures: nothing is borrowed from them).

  lumirun    Lumi's run     A side-scrolling run-and-jump. Lumi runs by itself; ONE button jumps.
                            Hop the bushes, cross the gaps, bounce on the sleepy snails, collect stars, reach home.
  lumikart   Lumi's kart    Steer left and right down the road. Collect stars, drive round the cones,
                            roll over a zoom pad to go fast. Reach the finish line.
  starpath   Star path      A little board game. Roll the dice and hop that many steps along the path.
                            On Medium and Hard the child counts the steps and taps where Lumi lands.

  Made gentle on purpose: no lives, no timer, no losing. A bump only slows Lumi down; a fall puts Lumi
  straight back on the path, standing still until the child is ready to jump again.
  Easy / Medium / Hard: see each game.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  if (!A || !A.GAME || !A.GAME.guard) return;
  const { D, L, S, state, ic, esc, say, tone, render, later, every, dots } = A;
  const { header, winCard, win, lv, NOTES, wiggle, restartOn } = A.GAME;
  const here = (id) => S.screen === 'g-' + id && S.g && S.gId === id;
  const lumiSvg = (mood, size) => L.svg({ look: A.lookWith(), mood, size });
  const sfx = (name, i) => { if (A.MUSIC) A.MUSIC.sound(name, null, i); };

  // ================================================================ 1. Lumi's run (run and jump)
  const RUN_H = 520, FLOOR = 400, LW = 64; // the world is 520 tall; Lumi's feet rest on y = 400
  const RUN = {
    1: { speed: 185, jumps: 1 },
    2: { speed: 215, jumps: 1 },
    3: { speed: 240, jumps: 2 }
  };
  function runWorld(level) {
    const w = { ground: [], plats: [], bushes: [], stars: [], snails: [], end: 0 };
    const arc = (x, y) => [0, 1, 2].forEach((i) => w.stars.push({ x: x + i * 46, y: y - (i === 1 ? 26 : 0) }));
    const row = (x, y, n) => { for (let i = 0; i < n; i++) w.stars.push({ x: x + i * 52, y }); };
    if (level === 1) {
      w.ground.push({ x: -200, w: 4000 });
      [720, 1300, 1880, 2480, 3020].forEach((x) => { w.bushes.push({ x }); arc(x - 34, 268); });
      row(360, 350, 4); row(1000, 350, 3); row(1560, 350, 3); row(2140, 350, 4);
      w.end = 3420;
    } else if (level === 2) {
      w.ground.push({ x: -200, w: 1120 }, { x: 1050, w: 720 }, { x: 1900, w: 660 }, { x: 2690, w: 820 }, { x: 3640, w: 900 });
      [540, 1420, 2260, 3080].forEach((x) => { w.bushes.push({ x }); arc(x - 34, 268); });
      [920, 1770, 2560, 3510].forEach((x) => arc(x + 12, 300)); // stars over each gap show the way
      w.plats.push({ x: 2860, y: 300, w: 200 }, { x: 3900, y: 300, w: 200 });
      row(2880, 250, 3); row(3920, 250, 3); row(280, 350, 3);
      w.end = 4320;
    } else {
      w.ground.push({ x: -200, w: 1000 }, { x: 950, w: 620 }, { x: 1720, w: 760 }, { x: 2640, w: 560 }, { x: 3350, w: 800 }, { x: 4300, w: 900 });
      [460, 1240, 3640].forEach((x) => { w.bushes.push({ x }); arc(x - 34, 268); });
      [800, 1570, 2480, 3200, 4150].forEach((x) => arc(x + 20, 290));
      w.snails.push({ x: 2000, min: 1840, max: 2320 }, { x: 3800, min: 3760, max: 4040 }, { x: 4560, min: 4420, max: 4760 });
      w.plats.push({ x: 2040, y: 290, w: 200 }, { x: 2760, y: 300, w: 180 }, { x: 2980, y: 220, w: 180 }, { x: 4480, y: 300, w: 200 });
      row(2060, 240, 3); row(2990, 170, 3); row(4500, 250, 3); row(240, 350, 3);
      w.end = 4960;
    }
    return w;
  }
  A.GAME_MAKERS.lumirun = () => ({ w: runWorld(lv()), x: 60, y: FLOOR, vy: 0, on: true, air: 0, wait: true, started: false, safe: 60, stars: 0, total: 0, cam: 0, blocked: 0, told: {}, won: false });
  A.PARENT['g-lumirun'] = 'play';
  A.VOICE['g-lumirun'] = () => (lv() === 3 ? 'Tap to jump. Tap again in the air to jump higher. Run home!' : 'Lumi runs. Tap to jump! Run home!');
  A.SCREENS['g-lumirun'] = () => {
    const g = S.g;
    const w = g.w;
    g.total = w.stars.length;
    const els = [];
    w.ground.forEach((p) => els.push(`<span class="lr-ground" style="left:${p.x}px;top:${FLOOR}px;width:${p.w}px"></span>`));
    w.plats.forEach((p) => els.push(`<span class="lr-plat" style="left:${p.x}px;top:${p.y}px;width:${p.w}px"></span>`));
    w.bushes.forEach((b) => els.push(`<span class="lr-bush" style="left:${b.x}px;top:${FLOOR - 52}px"></span>`));
    w.stars.forEach((s, i) => els.push(`<span class="lr-star ${s.got ? 'got' : ''}" data-i="${i}" style="left:${s.x}px;top:${s.y}px">${ic('star', 38)}</span>`));
    w.snails.forEach((s, i) => els.push(`<span class="lr-snail ${s.hid ? 'hid' : ''}" data-i="${i}" style="left:${s.x}px;top:${FLOOR - 44}px"><i></i></span>`));
    els.push(`<span class="lr-home" style="left:${w.end}px;top:${FLOOR - 190}px"><i></i></span>`);
    return `
<section class="screen" aria-label="Lumi's run">
  ${A.srTitle("Lumi's run")}
  ${header('lumirun', A.VOICE['g-lumirun']())}
  <div class="panel lr-view grow" id="lrView" role="button" aria-label="Tap to jump">
    <div class="lr-far" id="lrFar"></div>
    <div class="lr-world" id="lrWorld">${els.join('')}<span class="lr-lumi" id="lrLumi">${lumiSvg('happy', 84)}</span></div>
    <span class="lr-count">${ic('star', 28)}<b id="lrStars">${g.stars}</b></span>
    <span class="lr-bar"><i id="lrBar"></i></span>
    <span class="lr-tip" id="lrTip">${g.started ? '' : 'Tap to start!'}</span>
  </div>
  ${winCard('lumirun')}
</section>`;
  };
  function runJump() {
    const g = S.g;
    if (!here('lumirun') || g.won) return;
    const c = RUN[lv()];
    if (!g.started) { g.started = true; g.wait = false; const tip = document.getElementById('lrTip'); if (tip) tip.textContent = ''; return; }
    if (g.on || g.air < c.jumps) {
      g.vy = g.on ? -650 : -560;
      g.air = g.on ? 1 : g.air + 1;
      g.on = false;
      g.wait = false;
      tone(g.air > 1 ? 780 : 620, 0.12, 0.05);
      const tip = document.getElementById('lrTip'); if (tip) tip.textContent = '';
    }
  }
  function runFrame() {
    const g = S.g;
    if (!here('lumirun') || g.won) return;
    const view = document.getElementById('lrView');
    const world = document.getElementById('lrWorld');
    const lumi = document.getElementById('lrLumi');
    if (!view || !world || !lumi) return;
    const c = RUN[lv()];
    const w = g.w;
    const dt = 0.016;
    const tip = (key, text) => { const el = document.getElementById('lrTip'); if (el) el.textContent = text; if (!g.told[key]) { g.told[key] = true; say(text); } };
    // the snails wander
    w.snails.forEach((s) => { if (s.hid) return; s.dir = s.dir || 1; s.x += s.dir * 34 * dt; if (s.x > s.max) s.dir = -1; else if (s.x < s.min) s.dir = 1; });
    const walls = w.ground.map((p) => ({ x: p.x, y: FLOOR, w: p.w, h: 300 })).concat(w.bushes.map((b) => ({ x: b.x, y: FLOOR - 52, w: 56, h: 52, bush: true })), w.snails.map((s) => ({ x: s.x, y: FLOOR - 44, w: 60, h: 44, snail: s })));
    const floors = walls.concat(w.plats.map((p) => ({ x: p.x, y: p.y, w: p.w, h: 20, thin: true })));
    // forwards, unless something is in the way
    let nx = g.x + (g.wait ? 0 : c.speed * dt);
    let stuck = false;
    walls.forEach((b) => { if (nx + LW > b.x && g.x + LW <= b.x + 4 && g.y > b.y + 6 && g.y - 70 < b.y + b.h) { nx = b.x - LW; stuck = true; } });
    g.blocked = stuck && g.on ? g.blocked + dt : 0;
    if (g.blocked > 0.9) tip('jump', 'Tap to jump!');
    // up and down
    g.vy = Math.min(900, g.vy + 1500 * dt);
    let ny = g.y + g.vy * dt;
    let landed = null;
    if (g.vy >= 0) floors.forEach((b) => { if (nx + LW - 12 > b.x && nx + 12 < b.x + b.w && g.y <= b.y + 2 && ny >= b.y) { if (!landed || b.y < landed.y) landed = b; } });
    if (landed) {
      if (landed.snail && !landed.snail.hid && g.vy > 60) { // boing: a bounce off a snail, which tucks into its shell
        landed.snail.hid = true;
        const el = world.querySelector(`.lr-snail[data-i="${w.snails.indexOf(landed.snail)}"]`); if (el) el.classList.add('hid');
        ny = landed.y; g.vy = -560; g.on = false; g.air = 1;
        tone(880, 0.18, 0.07);
      } else {
        ny = landed.y; g.vy = 0; g.on = true; g.air = 0;
        if (!landed.thin && !landed.bush && !landed.snail && nx > landed.x + 30 && nx < landed.x + landed.w - 230) g.safe = nx;
      }
    } else g.on = false;
    if (ny > RUN_H + 120) { // into a gap: straight back onto the path, standing still until the child is ready
      nx = g.safe; ny = FLOOR; g.vy = 0; g.on = true; g.air = 0; g.wait = true;
      lumi.classList.remove('back'); void lumi.offsetWidth; lumi.classList.add('back');
      tone(300, 0.2, 0.05);
      tip('gap', 'Oops! Tap to run, then tap to jump over.');
      g.started = false;
    }
    g.x = nx; g.y = ny;
    // stars
    w.stars.forEach((s, i) => {
      if (s.got || Math.abs(s.x + 19 - (g.x + LW / 2)) > 44 || Math.abs(s.y + 19 - (g.y - 40)) > 52) return;
      s.got = true; g.stars += 1;
      const el = world.querySelector(`.lr-star[data-i="${i}"]`); if (el) el.classList.add('got');
      const n = document.getElementById('lrStars'); if (n) n.textContent = g.stars;
      tone(NOTES[g.stars % NOTES.length] * 1.5, 0.1, 0.05);
    });
    // draw
    const s = view.clientHeight / RUN_H;
    const vw = view.clientWidth / s;
    g.cam = Math.max(0, Math.min(w.end + 260 - vw, g.x - vw * 0.28));
    world.style.transform = `scale(${s}) translateX(${-g.cam}px)`;
    const far = document.getElementById('lrFar'); if (far) far.style.backgroundPositionX = `${-g.cam * 0.3 * s}px`;
    lumi.style.transform = `translate(${g.x - 10}px, ${g.y - 82}px) rotate(${g.on ? 0 : Math.max(-12, Math.min(12, g.vy / 60))}deg)`;
    lumi.classList.toggle('run', g.on && !g.wait && !stuck);
    w.snails.forEach((sn, i) => { const el = world.querySelector(`.lr-snail[data-i="${i}"]`); if (el) { el.style.left = `${sn.x}px`; el.classList.toggle('left', sn.dir < 0); } });
    const bar = document.getElementById('lrBar'); if (bar) bar.style.width = `${Math.min(100, (g.x / w.end) * 100)}%`;
    if (g.x >= w.end - 10) {
      g.won = false; g.wait = true;
      say('Home! Well done!');
      win('lumirun', g.stars >= g.total * 0.7 || lv() === 3 ? 2 : 1);
    }
  }
  A.AFTER['g-lumirun'] = () => {
    const view = document.getElementById('lrView');
    if (!view || view.dataset.wired) return;
    view.dataset.wired = '1';
    view.addEventListener('pointerdown', (e) => { e.preventDefault(); runJump(); });
    runFrame();
  };
  A.ENTER['g-lumirun'] = () => { every(runFrame, 16); };
  A.GUIDE['g-lumirun'] = () => (S.g && !S.g.won && !S.g.started ? { sel: '#lrView', say: 'Tap to start.', delay: state.settings.guideDelay * 1000 + 5000 } : null);
  restartOn('lumirun');

  // ================================================================ 2. Lumi's kart (steer, collect, zoom)
  const KART = { 1: { speed: 250, len: 5200, cones: 0.22 }, 2: { speed: 330, len: 7200, cones: 0.36 }, 3: { speed: 410, len: 9200, cones: 0.5 } };
  function kartTrack(level) {
    const c = KART[level];
    const items = [];
    let lastCone = -1;
    for (let d = 900; d < c.len - 500; d += 330) {
      const r = Math.random();
      if (r < c.cones) {
        let lane = Math.floor(Math.random() * 3);
        if (lane === lastCone) lane = (lane + 1) % 3;
        lastCone = lane;
        items.push({ d, lane, kind: 'cone' });
        if (level === 3 && Math.random() < 0.4) items.push({ d, lane: (lane + 1 + Math.floor(Math.random() * 2)) % 3, kind: 'cone' }); // two cones: one lane is always free
        items.push({ d: d + 165, lane: Math.floor(Math.random() * 3), kind: 'star' });
      } else if (r > 0.9) items.push({ d, lane: Math.floor(Math.random() * 3), kind: 'zoom' });
      else { const lane = Math.floor(Math.random() * 3); items.push({ d, lane, kind: 'star' }, { d: d + 110, lane, kind: 'star' }); }
    }
    return items;
  }
  A.GAME_MAKERS.lumikart = () => ({ items: kartTrack(lv()), lane: 1, d: 0, v: 0, slow: 0, zoom: 0, stars: 0, started: false, won: false });
  A.PARENT['g-lumikart'] = 'play';
  A.VOICE['g-lumikart'] = () => 'Steer with the arrows. Get the stars. Drive round the cones.';
  A.SCREENS['g-lumikart'] = () => {
    const g = S.g;
    return `
<section class="screen" aria-label="Lumi's kart">
  ${A.srTitle("Lumi's kart")}
  ${header('lumikart', A.VOICE['g-lumikart']())}
  <div class="row gap16 grow">
    <button class="lk-steer" data-a="lkLeft" aria-label="Steer left">${ic('back', 64)}</button>
    <div class="panel lk-road grow" id="lkRoad">
      <div class="lk-lines" id="lkLines"></div>
      <div class="lk-items" id="lkItems"></div>
      <span class="lk-kart" id="lkKart"><span class="lk-rider">${lumiSvg('happy', 92)}</span><i class="lk-body"></i><i class="lk-wheel a"></i><i class="lk-wheel b"></i></span>
      <span class="lr-count">${ic('star', 28)}<b id="lkStars">${g.stars}</b></span>
      <span class="lr-bar"><i id="lkBar"></i></span>
      <span class="lr-tip" id="lkTip">${g.started ? '' : 'Tap an arrow to go!'}</span>
    </div>
    <button class="lk-steer" data-a="lkRight" aria-label="Steer right">${ic('arrow', 64)}</button>
  </div>
  ${winCard('lumikart')}
</section>`;
  };
  function kartSteer(dir) {
    const g = S.g;
    if (!here('lumikart') || g.won) return 'keep';
    if (!g.started) { g.started = true; const tip = document.getElementById('lkTip'); if (tip) tip.textContent = ''; }
    const to = Math.max(0, Math.min(2, g.lane + dir));
    if (to !== g.lane) { g.lane = to; tone(520 + to * 60, 0.08, 0.04); }
    return 'keep';
  }
  Object.assign(A.ACTIONS, { lkLeft: () => kartSteer(-1), lkRight: () => kartSteer(1) });
  document.addEventListener('keydown', (e) => {
    if (here('lumikart') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); kartSteer(e.key === 'ArrowLeft' ? -1 : 1); }
    if (here('lumirun') && (e.key === ' ' || e.key === 'ArrowUp')) { e.preventDefault(); runJump(); }
  });
  function kartFrame() {
    const g = S.g;
    if (!here('lumikart') || g.won) return;
    const road = document.getElementById('lkRoad');
    const box = document.getElementById('lkItems');
    const kart = document.getElementById('lkKart');
    if (!road || !box || !kart) return;
    const c = KART[lv()];
    const dt = 0.016;
    const H = road.clientHeight, W = road.clientWidth;
    const laneX = (l) => W * (0.2 + l * 0.3);
    const kartY = H * 0.78;
    const target = !g.started ? 0 : c.speed * (g.slow > 0 ? 0.4 : g.zoom > 0 ? 1.6 : 1);
    g.v += (target - g.v) * Math.min(1, dt * 4);
    g.d += g.v * dt;
    g.slow = Math.max(0, g.slow - dt); g.zoom = Math.max(0, g.zoom - dt);
    kart.style.transform = `translate(${laneX(g.lane)}px, ${kartY}px)`;
    kart.classList.toggle('spin', g.slow > 0);
    kart.classList.toggle('zoom', g.zoom > 0);
    document.getElementById('lkLines').style.backgroundPositionY = `${g.d}px`;
    // the things on the road: drawn when near, met when they reach the kart
    g.items.forEach((it, i) => {
      const y = kartY - (it.d - g.d);
      if (it.done) return;
      if (y < -80) return;
      if (!it.el) { it.el = document.createElement('span'); it.el.className = `lk-item ${it.kind}`; it.el.innerHTML = it.kind === 'star' ? ic('star', 54) : '<i></i>'; box.appendChild(it.el); }
      if (!it.el.isConnected) box.appendChild(it.el);
      it.el.style.transform = `translate(${laneX(it.lane)}px, ${y}px)`;
      if (!it.hit && it.lane === g.lane && Math.abs(y - kartY) < 54) {
        it.hit = true;
        if (it.kind === 'star') { g.stars += 1; it.el.classList.add('got'); document.getElementById('lkStars').textContent = g.stars; tone(NOTES[g.stars % NOTES.length] * 1.5, 0.1, 0.05); }
        else if (it.kind === 'zoom') { g.zoom = 1.6; tone(700, 0.3, 0.06); if (!g.toldZoom) { g.toldZoom = true; say('Zoom!'); } }
        else { g.slow = 1.1; it.el.classList.add('bumped'); tone(240, 0.2, 0.05); if (!g.toldCone) { g.toldCone = true; say('Bump! Drive round the cones.'); } }
      }
      if (y > H + 80) { it.done = true; it.el.remove(); }
    });
    const bar = document.getElementById('lkBar'); if (bar) bar.style.width = `${Math.min(100, (g.d / c.len) * 100)}%`;
    const fin = kartY - (c.len - g.d);
    let line = document.getElementById('lkFinish');
    if (fin > -60) { if (!line) { line = document.createElement('span'); line.id = 'lkFinish'; line.className = 'lk-finish'; box.appendChild(line); } line.style.transform = `translateY(${fin}px)`; }
    if (g.d >= c.len) { say('The finish line!'); win('lumikart', lv() === 3 ? 2 : 1); }
  }
  A.ENTER['g-lumikart'] = () => { every(kartFrame, 16); };
  A.AFTER['g-lumikart'] = () => { kartFrame(); };
  A.GUIDE['g-lumikart'] = () => (S.g && !S.g.won && !S.g.started ? { sel: '[data-a="lkRight"]', say: 'Tap an arrow to go.', delay: state.settings.guideDelay * 1000 + 5000 } : null);
  restartOn('lumikart');

  // ================================================================ 3. Star path (a board game: roll, count, hop)
  const PATH = { cols: 6, rows: 3 };
  const SPACES = PATH.cols * PATH.rows;
  const pathKinds = () => Array.from({ length: SPACES }, (_, i) => (i === 0 ? 'start' : i === SPACES - 1 ? 'home' : [5, 11].includes(i) ? 'spring' : i % 3 === 0 || i === 8 || i === 14 ? 'star' : 'plain'));
  const cell = (i) => { const r = Math.floor(i / PATH.cols); const c = r % 2 ? PATH.cols - 1 - (i % PATH.cols) : i % PATH.cols; return { x: 9 + c * 16.4, y: 80 - r * 31 }; }; // a path that snakes upwards
  A.GAME_MAKERS.starpath = () => ({ kinds: pathKinds(), pos: 0, roll: null, phase: 'roll', stars: 0, got: {}, miss: 0, won: false });
  A.PARENT['g-starpath'] = 'play';
  const spAsk = (g) => (g.phase === 'roll' ? 'Tap the dice to roll.' : g.phase === 'pick' ? `Count ${g.roll} ${g.roll === 1 ? 'step' : 'steps'}. Tap where Lumi lands.` : g.phase === 'hop' ? `${g.roll}!` : '');
  A.VOICE['g-starpath'] = () => spAsk(S.g) || 'Roll the dice and hop along the path.';
  const pips = (n) => `<span class="sp-dice-face n${n}">${Array.from({ length: n }, () => '<i></i>').join('')}</span>`;
  A.SCREENS['g-starpath'] = () => {
    const g = S.g;
    const at = cell(g.pos);
    const spaces = g.kinds.map((k, i) => {
      const p = cell(i);
      const hint = g.phase === 'pick' && g.miss >= 2 && i > g.pos && i <= g.pos + g.roll ? `<b class="sp-num">${i - g.pos}</b>` : '';
      const inner = k === 'home' ? ic('home', 40) : k === 'star' && !g.got[i] ? ic('star', 34) : k === 'spring' ? '<i class="sp-spring"></i>' : '';
      return `<button class="sp-space ${k} ${i < g.pos ? 'past' : ''}" data-a="spPick" data-v="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="Space ${i + 1}${k === 'star' ? ', a star' : k === 'spring' ? ', a spring' : k === 'home' ? ', home' : ''}">${inner}${hint}</button>`;
    }).join('');
    const d = g.dice || [g.roll || 1];
    return `
<section class="screen" aria-label="Star path">
  ${A.srTitle('Star path')}
  ${header('starpath', A.VOICE['g-starpath']())}
  <div class="row gap16 grow">
    <div class="panel sp-board grow" id="spBoard"><svg class="sp-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${g.kinds.map((_, i) => `${cell(i).x},${cell(i).y}`).join(' ')}" fill="none" stroke="#F6E7C8" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>${spaces}<span class="sp-token" id="spToken" style="left:${at.x}%;top:${at.y}%">${lumiSvg(g.phase === 'hop' ? 'excited' : 'happy', 78)}</span></div>
    <div class="col center gap12" style="width:220px">
      <b class="sp-ask" aria-live="polite">${esc(spAsk(g))}</b>
      <button class="sp-dice ${g.phase === 'roll' ? 'ready' : ''}" data-a="spRoll" ${g.phase === 'roll' ? '' : 'disabled'} aria-label="Roll the dice">${d.map((n) => pips(n)).join('')}</button>
      ${g.dice && g.dice.length > 1 && g.roll ? `<b class="sp-sum">${g.dice.join(' + ')} = ${g.roll}</b>` : ''}
      <span class="sp-stars">${ic('star', 28)}<b>${g.stars}</b></span>
    </div>
  </div>
  ${winCard('starpath')}
</section>`;
  };
  function spHop(to, then) {
    const g = S.g;
    g.phase = 'hop';
    const stepTo = (n) => {
      if (!here('starpath')) return;
      g.pos = n;
      const tok = document.getElementById('spToken');
      const p = cell(n);
      if (tok) { tok.style.left = `${p.x}%`; tok.style.top = `${p.y}%`; tok.classList.remove('hop'); void tok.offsetWidth; tok.classList.add('hop'); }
      tone(NOTES[n % NOTES.length], 0.14, 0.06);
    };
    const from = g.pos;
    for (let n = from + 1; n <= to; n++) later(() => { stepTo(n); if (n - from <= 6 && state.settings.voice) say(String(n - from)); }, (n - from) * 520);
    later(() => { if (here('starpath')) then(); }, (to - from) * 520 + 450);
  }
  function spLand() {
    const g = S.g;
    const k = g.kinds[g.pos];
    if (k === 'home') { render(); say('Home! Well done!'); later(() => { if (here('starpath')) win('starpath', lv() === 3 ? 2 : 1); }, 700); return; }
    if (k === 'star' && !g.got[g.pos]) { g.got[g.pos] = true; g.stars += 1; tone(988, 0.3, 0.09); say('A star!'); }
    if (k === 'spring') {
      render(); say('Boing! Two more!'); tone(660, 0.25, 0.08);
      later(() => { if (here('starpath')) spHop(Math.min(SPACES - 1, g.pos + 2), spLand); }, 700);
      return;
    }
    g.phase = 'roll'; g.roll = null; g.miss = 0;
    render();
  }
  Object.assign(A.ACTIONS, {
    spRoll: () => {
      const g = S.g;
      if (g.won || g.phase !== 'roll') return 'keep';
      const two = lv() === 3;
      const one = () => 1 + Math.floor(Math.random() * (lv() === 1 ? 3 : two ? 3 : 4));
      g.phase = 'rolling';
      let n = 0;
      const spin = () => {
        if (!here('starpath')) return;
        g.dice = two ? [one(), one()] : [one()];
        g.roll = g.dice.reduce((a, b) => a + b, 0);
        tone(400 + n * 40, 0.05, 0.03);
        render();
        if (++n < 7) later(spin, 90);
        else {
          const to = Math.min(SPACES - 1, g.pos + g.roll);
          if (lv() === 1) { say(`${g.roll}!`); later(() => spHop(to, spLand), 500); g.phase = 'hop'; render(); }
          else { g.phase = 'pick'; g.miss = 0; render(); say(two ? `${g.dice[0]} and ${g.dice[1]} make ${g.roll}. Tap where Lumi lands.` : `${g.roll}! Count ${g.roll} ${g.roll === 1 ? 'step' : 'steps'}. Tap where Lumi lands.`); }
        }
      };
      spin();
      return 'keep';
    },
    spPick: (d, el) => {
      const g = S.g;
      if (g.won || g.phase !== 'pick') return 'keep';
      const to = Math.min(SPACES - 1, g.pos + g.roll);
      if (Number(d.v) !== to) {
        g.miss += 1;
        wiggle(el);
        say(g.miss >= 2 ? 'Count the numbers from Lumi.' : `Count ${g.roll} ${g.roll === 1 ? 'step' : 'steps'} from Lumi.`);
        if (g.miss === 2) render();
        return 'keep';
      }
      spHop(to, spLand);
      render();
      return 'keep';
    }
  });
  A.GUIDE['g-starpath'] = () => { const g = S.g; if (!g || g.won) return null; if (g.phase === 'roll') return { sel: '.sp-dice', say: 'Tap the dice.', delay: state.settings.guideDelay * 1000 + 4000 }; if (g.phase === 'pick' && g.miss >= 2) return { sel: `.sp-space[data-v="${Math.min(SPACES - 1, g.pos + g.roll)}"]`, say: 'Tap here.', delay: state.settings.guideDelay * 1000 + 4000 }; return null; };
  restartOn('starpath');

  // ---------------------------------------------------------------- onto the Adventure shelf
  A.GAME.guard(['lumirun', 'lumikart', 'starpath']);
  D.GAMES.push(
    { id: 'lumirun', name: "Lumi's run", icon: 'kRun', kind: 'Run and jump', tint: '#E7F3E1', ink: '#4F8A3F', skill: 'thinking', cat: 'adv' },
    { id: 'lumikart', name: "Lumi's kart", icon: 'kKart', kind: 'Steer and zoom', tint: '#E3F0FA', ink: '#4A78A8', skill: 'thinking', cat: 'adv' },
    { id: 'starpath', name: 'Star path', icon: 'kDice', kind: 'Roll and count', tint: '#FFF1C2', ink: '#8A5C0C', skill: 'thinking', cat: 'adv' }
  );
})();
