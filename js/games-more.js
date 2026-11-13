/*
  games-more.js
  Six more games for the Play area. Each has three levels (Easy, Medium, Hard) chosen in the game's top bar.
  Like the other games: no losing and no time pressure. A wrong move gets a gentle word and you try again.

  feed     Feed Lumi        Lumi asks for food. Drag (or tap) the right food, the right number of times.
  tune     Copy the tune    Lumi rings the bells. Ring them back in the same order.
  maze     Lumi's way home  Slide Lumi through the maze to the house (Hard: pick up the stars first).
  catch    Catch the stars  Move Lumi left and right to catch falling stars.
  find     Find it          Lumi names a thing; find it in the room (Hard: more things, word only).
  weather  Dress for the weather   Drag the right clothes onto Lumi for sun, rain or cold.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  if (!A || !A.GAME) return;
  const { D, L, S, state, ic, esc, say, tone, render, later, every, pick, dots, stage } = A;
  const { header, winCard, win, lv, shuffle, NOTES } = A.GAME;
  const pic = (k, size) => (window.lumiPic && window.lumiPic(k, size)) || '';
  const wiggle = (el) => { if (!el) return; el.classList.remove('wiggle-once'); void el.offsetWidth; el.classList.add('wiggle-once'); };
  const scale = () => (A.stageScale ? A.stageScale() : 1);
  const inside = (el, x, y) => { if (!el) return false; const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
  const lumi = (mood, size, look) => L.svg({ look: A.lookWith(look || {}), mood, size });

  // a thing you can drag with a finger, or just tap. drop(x, y) / tap() return true when it was accepted.
  function draggable(el, o) {
    el.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      const sc = scale();
      const sx = e.clientX;
      const sy = e.clientY;
      let moved = false;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      el.classList.add('dragging');
      const move = (ev) => {
        const dx = (ev.clientX - sx) / sc;
        const dy = (ev.clientY - sy) / sc;
        if (Math.abs(dx) + Math.abs(dy) > 10) moved = true;
        if (moved) el.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
        if (o.over) o.over(ev.clientX, ev.clientY);
      };
      const up = (ev) => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        el.classList.remove('dragging');
        if (o.over) o.over(-1, -1);
        const ok = ev.type === 'pointercancel' ? false : moved ? o.drop(ev.clientX, ev.clientY) : o.tap();
        if (!ok && document.body.contains(el)) {
          el.style.transition = 'transform 0.3s ease';
          el.style.transform = '';
          setTimeout(() => { el.style.transition = ''; }, 320);
        }
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  }
  const restartOn = (id) => { if (A.RESTART) A.RESTART['g-' + id] = () => A.ACTIONS.gAgain({ v: id }, { dataset: {} }); };
  Object.assign(A.GAME, { draggable, inside, wiggle, lumi, scale, restartOn });

  // ================================================================ 1. Feed Lumi (counting)
  const FOODS = [
    { k: '\u{1F34E}', one: 'apple', many: 'apples' },
    { k: '\u{1F34C}', one: 'banana', many: 'bananas' },
    { k: '\u{1F36A}', one: 'biscuit', many: 'biscuits' },
    { k: '\u{1F955}', one: 'carrot', many: 'carrots' },
    { k: '\u{1F95A}', one: 'egg', many: 'eggs' }
  ];
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
  function feedRound() {
    const l = lv();
    const foods = shuffle(FOODS);
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    let want;
    let tray;
    if (l === 1) { want = [{ f: foods[0], n: rnd(1, 3) }]; tray = Array(5).fill(foods[0]); }
    else if (l === 2) { want = [{ f: foods[0], n: rnd(2, 5) }]; tray = Array(6).fill(foods[0]).concat(Array(3).fill(foods[1])); }
    else { want = [{ f: foods[0], n: rnd(1, 3) }, { f: foods[1], n: rnd(1, 3) }]; tray = Array(4).fill(foods[0]).concat(Array(4).fill(foods[1]), Array(3).fill(foods[2])); }
    return { want, tray: shuffle(tray).map((f, i) => ({ id: i, f, on: false })), eating: false };
  }
  const feedSay = (r) => 'I want ' + r.want.map((w) => `${WORDS[w.n]} ${w.n === 1 ? w.f.one : w.f.many}`).join(' and ') + ', please.';
  const onPlate = (r, f) => r.tray.filter((t) => t.on && t.f === f).length;
  A.GAME_MAKERS.feed = () => ({ round: 0, total: 3, r: feedRound(), won: false });
  A.PARENT['g-feed'] = 'play';
  A.VOICE['g-feed'] = () => feedSay(S.g.r);
  A.SCREENS['g-feed'] = () => {
    const g = S.g;
    const r = g.r;
    const ask = r.want.map((w) => `<span class="fd-ask">${w.n > 0 ? `<b>${w.n}</b>` : ''}${pic(w.f.k, 64)}${dots(onPlate(r, w.f), w.n, 'var(--teal)', 14)}</span>`).join('');
    const plate = r.tray.filter((t) => t.on).map((t) => `<button class="fd-on" data-a="fdBack" data-k="${t.id}" aria-label="Take back the ${t.f.one}">${pic(t.f.k, 56)}</button>`).join('');
    const tray = r.tray.filter((t) => !t.on).map((t) => `<span class="fd-food" data-k="${t.id}" role="button" aria-label="${t.f.one}">${pic(t.f.k, 84)}</span>`).join('');
    return `
<section class="screen" aria-label="Feed Lumi">
  ${A.srTitle('Feed Lumi')}
  ${header('feed', feedSay(r))}
  <div class="row gap24 grow">
    <div class="panel fd-scene grow">
      <div class="fd-bubble" aria-live="polite">${ask}</div>
      <div class="fd-lumi ${r.eating ? 'hop' : ''}">${lumi(r.eating ? 'excited' : 'happy', 230)}</div>
      <div class="fd-plate" id="fdPlate">${plate}</div>
      <div class="fd-round">${dots(g.round, g.total, 'var(--teal)', 18)}</div>
    </div>
    <div class="panel fd-tray" style="width:330px">${tray}</div>
  </div>
  ${winCard('feed')}
</section>`;
  };
  function feedGive(id, el) {
    const g = S.g;
    const r = g.r;
    if (!r || r.eating) return false;
    const t = r.tray.find((x) => x.id === id);
    const w = r.want.find((x) => x.f === t.f);
    if (!w) { wiggle(el); say(`That is a ${t.f.one}. Lumi wants ${r.want.map((x) => x.f.many).join(' and ')}.`); A.track('tries', 'feed', { quiet: true }); return false; }
    const have = onPlate(r, t.f);
    if (have >= w.n) { wiggle(el); say(`That is enough ${t.f.many}!`); return false; }
    t.on = true;
    tone(NOTES[Math.min(have, NOTES.length - 1)], 0.3, 0.09);
    say(WORDS[have + 1].charAt(0).toUpperCase() + WORDS[have + 1].slice(1) + '!');
    if (r.want.every((x) => onPlate(r, x.f) === x.n)) {
      r.eating = true;
      later(() => { say('Yum yum! Thank you!'); tone(784, 0.4, 0.1); }, 600);
      later(() => {
        g.round += 1;
        if (g.round >= g.total) { win('feed', lv() === 3 ? 2 : 1); return; }
        g.r = feedRound();
        render();
        later(() => say(feedSay(g.r)), 300);
      }, 2000);
    }
    render();
    return true;
  }
  A.AFTER['g-feed'] = () => {
    const plate = document.getElementById('fdPlate');
    stage.querySelectorAll('.fd-food').forEach((el) => {
      const id = Number(el.dataset.k);
      draggable(el, {
        over: (x, y) => plate && plate.classList.toggle('hot', inside(plate, x, y) || inside(stage.querySelector('.fd-lumi'), x, y)),
        drop: (x, y) => (inside(plate, x, y) || inside(stage.querySelector('.fd-lumi'), x, y) ? feedGive(id, el) : false),
        tap: () => feedGive(id, el)
      });
    });
  };
  A.GUIDE['g-feed'] = () => (S.g && !S.g.won && !S.g.r.eating ? { sel: '.fd-food', say: 'Drag the food to Lumi.', delay: state.settings.guideDelay * 1000 + 5000 } : null);
  A.ACTIONS.fdBack = (d) => { const t = S.g.r.tray.find((x) => x.id === Number(d.k)); if (t && !S.g.r.eating) { t.on = false; tone(392, 0.15, 0.05); render(); } };
  restartOn('feed');

  // ================================================================ 2. Copy the tune (memory and listening)
  const BELLS = [
    { c: '#EF8A7A', d: '#C9584A', n: 392, icon: 'heart' },
    { c: '#F4D35E', d: '#C99A1E', n: 440, icon: 'sun' },
    { c: '#9CCB7A', d: '#5E9E45', n: 523, icon: 'star' },
    { c: '#8EB8E5', d: '#4A78A8', n: 587, icon: 'cloud' },
    { c: '#B9A6E0', d: '#7E64C8', n: 659, icon: 'moon' }
  ];
  const tuneCfg = () => ({ 1: { bells: 3, start: 2, gap: 900 }, 2: { bells: 4, start: 3, gap: 750 }, 3: { bells: 5, start: 4, gap: 600 } }[lv()]);
  function tuneNew() {
    const c = tuneCfg();
    const seq = [];
    for (let i = 0; i < c.start; i++) seq.push(Math.floor(Math.random() * c.bells));
    return { seq, pos: 0, phase: 'listen', round: 0, total: 3, won: false, missed: 0 };
  }
  A.GAME_MAKERS.tune = tuneNew;
  function tunePlay() {
    const g = S.g;
    const c = tuneCfg();
    g.phase = 'listen';
    g.pos = 0;
    const set = () => stage.querySelectorAll('.tn-bell').forEach((b) => { b.disabled = g.phase !== 'you'; });
    set();
    const line = stage.querySelector('.tn-say');
    if (line) line.textContent = 'Listen…';
    g.seq.forEach((k, i) => later(() => ring(k), 700 + i * c.gap));
    later(() => {
      g.phase = 'you';
      set();
      const ln = stage.querySelector('.tn-say');
      if (ln) ln.textContent = 'Your turn!';
      say('Your turn!');
    }, 700 + g.seq.length * c.gap + 200);
  }
  function ring(k) {
    const b = stage.querySelector(`.tn-bell[data-k="${k}"]`);
    tone(BELLS[k].n, 0.5, 0.11);
    if (!b) return;
    b.classList.remove('lit');
    void b.offsetWidth;
    b.classList.add('lit');
  }
  A.PARENT['g-tune'] = 'play';
  A.VOICE['g-tune'] = () => 'Listen to Lumi ring the bells. Then ring them the same way.';
  A.SCREENS['g-tune'] = () => {
    const g = S.g;
    const c = tuneCfg();
    const bells = BELLS.slice(0, c.bells).map((b, k) => `<button class="tn-bell" data-a="tnTap" data-k="${k}" style="--c:${b.c};--d:${b.d}" aria-label="Bell ${k + 1}" ${g.phase === 'you' ? '' : 'disabled'}>
      <svg viewBox="0 0 100 110" width="100%" height="100%" aria-hidden="true"><path d="M50 8a34 34 0 0 0-34 34v26L6 86h88L84 68V42A34 34 0 0 0 50 8z" fill="${b.c}" stroke="${b.d}" stroke-width="5" stroke-linejoin="round"/><circle cx="50" cy="96" r="9" fill="${b.d}"/><ellipse cx="36" cy="34" rx="6" ry="12" fill="#fff" opacity=".45"/></svg>
      <span class="tn-ic">${ic(b.icon, 40)}</span></button>`).join('');
    return `
<section class="screen" aria-label="Copy the tune">
  ${A.srTitle('Copy the tune')}
  ${header('tune', A.VOICE['g-tune']())}
  <div class="row gap24 grow">
    <div class="col center gap12" style="width:260px">
      ${lumi(g.phase === 'you' ? 'happy' : 'calm', 220)}
      <span class="tn-say" aria-live="polite">${g.phase === 'you' ? 'Your turn!' : 'Listen…'}</span>
      <button class="primary soft-btn" data-a="tnAgain" style="height:72px">${ic('speaker', 30)}<span>Again</span></button>
    </div>
    <div class="col grow gap16">
      <div class="panel tn-bells n${c.bells} grow">${bells}</div>
      <div class="row between"><span class="tn-notes">${dots(g.pos, g.seq.length, 'var(--feel)', 16)}</span><span>${dots(g.round, g.total, 'var(--teal)', 18)}</span></div>
    </div>
  </div>
  ${winCard('tune')}
</section>`;
  };
  A.GAME_START.tune = () => { later(tunePlay, 600); };
  A.ACTIONS.tnAgain = () => { if (S.g.won) return; A.clearTimers(); render(); tunePlay(); };
  A.ACTIONS.tnTap = (d) => {
    const g = S.g;
    if (g.phase !== 'you' || g.won) return 'keep';
    const k = Number(d.k);
    ring(k);
    if (k === g.seq[g.pos]) {
      g.pos += 1;
      const nd = stage.querySelector('.tn-notes');
      if (nd) nd.innerHTML = dots(g.pos, g.seq.length, 'var(--feel)', 16);
      if (g.pos >= g.seq.length) {
        g.phase = 'done';
        if (!g.missed) A.track('correct', 'tune', { quiet: true });
        later(() => { say(pick(['Yes! Same tune!', 'Lovely music!', 'You remembered!'])); tone(784, 0.4, 0.1); }, 500);
        later(() => {
          g.round += 1;
          if (g.round >= g.total) { win('tune', lv() === 3 ? 2 : 1); return; }
          g.seq.push(Math.floor(Math.random() * tuneCfg().bells));
          g.missed = 0;
          render();
          tunePlay();
        }, 1800);
      }
    } else {
      g.phase = 'listen';
      g.missed += 1;
      A.track('tries', 'tune', { quiet: true });
      say('Oops. Listen again.');
      later(() => { render(); tunePlay(); }, 1200);
    }
    return 'keep';
  };
  restartOn('tune');

  // ================================================================ 3. Lumi's way home (maze)
  function makeMaze(cols, rows) {
    // every cell has walls: [top, right, bottom, left]
    const cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) cells.push({ x, y, w: [1, 1, 1, 1], seen: false });
    const at = (x, y) => (x < 0 || y < 0 || x >= cols || y >= rows ? null : cells[y * cols + x]);
    const stack = [cells[0]];
    cells[0].seen = true;
    while (stack.length) {
      const c = stack[stack.length - 1];
      const next = shuffle([[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]]).map(([dx, dy, a, b]) => [at(c.x + dx, c.y + dy), a, b]).filter(([n]) => n && !n.seen);
      if (!next.length) { stack.pop(); continue; }
      const [n, a, b] = next[0];
      c.w[a] = 0;
      n.w[b] = 0;
      n.seen = true;
      stack.push(n);
    }
    return cells.map((c) => c.w);
  }
  A.GAME_MAKERS.maze = () => {
    const [cols, rows, stars] = { 1: [4, 3, 0], 2: [6, 4, 2], 3: [8, 5, 3] }[lv()];
    const walls = makeMaze(cols, rows);
    const spots = shuffle([...Array(cols * rows).keys()].filter((i) => i !== 0 && i !== cols * rows - 1)).slice(0, stars);
    return { cols, rows, walls, at: 0, trail: [0], stars: spots, got: [], needStars: lv() === 3, won: false };
  };
  const mazeCell = () => { const g = S.g; return Math.floor(Math.min(860 / g.cols, 560 / g.rows)); };
  A.PARENT['g-maze'] = 'play';
  A.VOICE['g-maze'] = () => (S.g && S.g.needStars ? 'Pick up the stars, then take Lumi home.' : 'Slide Lumi along the path to the house.');
  A.SCREENS['g-maze'] = () => {
    const g = S.g;
    const cs = mazeCell();
    const end = g.cols * g.rows - 1;
    const cells = g.walls.map((w, i) => {
      const b = ['Top', 'Right', 'Bottom', 'Left'].map((s, k) => (w[k] ? `border-${s.toLowerCase()}:3px solid #8A6A4A;` : '')).join('');
      const inner = i === end ? `<span class="mz-home">${ic('house', Math.round(cs * 0.6))}</span>`
        : g.stars.includes(i) && !g.got.includes(i) ? `<span class="mz-star">${ic('star', Math.round(cs * 0.5))}</span>` : '';
      return `<div class="mz-cell ${g.trail.includes(i) ? 'trail' : ''}" data-i="${i}" style="${b}">${inner}</div>`;
    }).join('');
    const x = (g.at % g.cols) * cs;
    const y = Math.floor(g.at / g.cols) * cs;
    const left = g.stars.length - g.got.length;
    return `
<section class="screen" aria-label="Lumi's way home">
  ${A.srTitle("Lumi's way home")}
  ${header('maze', A.VOICE['g-maze']())}
  <div class="row gap24 grow">
    <div class="panel mz-wrap grow">
      <div class="mz-board" id="mzBoard" style="width:${cs * g.cols}px;height:${cs * g.rows}px;grid-template-columns:repeat(${g.cols},${cs}px);grid-auto-rows:${cs}px">
        ${cells}
        <div class="mz-lumi" id="mzLumi" style="width:${cs}px;height:${cs}px;transform:translate(${x}px,${y}px)">${lumi('happy', Math.round(cs * 0.92))}</div>
      </div>
    </div>
    <div class="col center gap16" style="width:220px">
      ${g.stars.length ? `<span class="mz-count">${ic('star', 36)}<b id="mzLeft">${g.got.length} / ${g.stars.length}</b></span>` : ''}
      <p class="mz-tip">${g.needStars && left ? 'Stars first, then home' : 'Slide your finger'}</p>
    </div>
  </div>
  ${winCard('maze')}
</section>`;
  };
  A.AFTER['g-maze'] = () => {
    const board = document.getElementById('mzBoard');
    if (!board) return;
    let dragging = false;
    const step = (cx, cy) => {
      const g = S.g;
      if (g.won) return;
      const el = document.elementFromPoint(cx, cy);
      const cell = el && el.closest && el.closest('.mz-cell');
      if (!cell || !board.contains(cell)) return;
      const to = Number(cell.dataset.i);
      if (to === g.at) return;
      const fx = g.at % g.cols;
      const fy = Math.floor(g.at / g.cols);
      const tx = to % g.cols;
      const ty = Math.floor(to / g.cols);
      let side = -1;
      if (tx === fx && ty === fy - 1) side = 0;
      else if (tx === fx + 1 && ty === fy) side = 1;
      else if (tx === fx && ty === fy + 1) side = 2;
      else if (tx === fx - 1 && ty === fy) side = 3;
      if (side < 0) return;
      if (g.walls[g.at][side]) { if (!dragging) { say('That way is a wall.'); wiggle(document.getElementById('mzLumi')); } return; }
      g.at = to;
      if (!g.trail.includes(to)) g.trail.push(to);
      cell.classList.add('trail');
      const cs = mazeCell();
      const lu = document.getElementById('mzLumi');
      if (lu) lu.style.transform = `translate(${tx * cs}px,${ty * cs}px)`;
      tone(NOTES[(tx + ty) % NOTES.length], 0.12, 0.04);
      if (g.stars.includes(to) && !g.got.includes(to)) {
        g.got.push(to);
        const s = cell.querySelector('.mz-star');
        if (s) s.remove();
        const c = document.getElementById('mzLeft');
        if (c) c.textContent = `${g.got.length} / ${g.stars.length}`;
        tone(880, 0.3, 0.1);
        say(g.got.length === g.stars.length ? 'All the stars! Now go home.' : 'A star!');
      }
      if (to === g.cols * g.rows - 1) {
        if (g.needStars && g.got.length < g.stars.length) { say('Find the stars first!'); return; }
        dragging = false;
        later(() => win('maze', lv() === 3 ? 2 : 1), 300);
      }
    };
    board.addEventListener('pointerdown', (e) => {
      dragging = true;
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      step(e.clientX, e.clientY);
    });
    board.addEventListener('pointermove', (e) => { if (dragging) step(e.clientX, e.clientY); });
    const stop = () => { dragging = false; };
    board.addEventListener('pointerup', stop);
    board.addEventListener('pointercancel', stop);
  };
  restartOn('maze');

  // ================================================================ 4. Catch the stars (movement and focus)
  const catchCfg = () => ({ 1: { goal: 8, speed: 95, every: 1700, size: 84, rain: false }, 2: { goal: 12, speed: 150, every: 1200, size: 70, rain: false }, 3: { goal: 15, speed: 210, every: 900, size: 60, rain: true } }[lv()]);
  A.GAME_MAKERS.catch = () => ({ caught: 0, x: 0.5, won: false, wet: 0 });
  A.PARENT['g-catch'] = 'play';
  A.VOICE['g-catch'] = () => (lv() === 3 ? 'Catch the stars. Dodge the raindrops!' : 'Move Lumi to catch the falling stars.');
  A.SCREENS['g-catch'] = () => {
    const g = S.g;
    const c = catchCfg();
    return `
<section class="screen" aria-label="Catch the stars">
  ${A.srTitle('Catch the stars')}
  ${header('catch', A.VOICE['g-catch']())}
  <div class="panel ct-field grow" id="ctField">
    <div class="ct-count" aria-live="polite">${ic('star', 30)}<b id="ctN">${g.caught}</b><span>/ ${c.goal}</span></div>
    <div class="ct-lumi" id="ctLumi" style="left:${g.x * 100}%">${lumi('excited', 150)}</div>
    <div class="ct-floor"></div>
  </div>
  ${winCard('catch')}
</section>`;
  };
  A.AFTER['g-catch'] = () => {
    const field = document.getElementById('ctField');
    const lu = document.getElementById('ctLumi');
    const g = S.g;
    if (!field || g.won) return;
    const c = catchCfg();
    const drops = [];
    const moveTo = (cx) => {
      const r = field.getBoundingClientRect();
      g.x = Math.max(0.06, Math.min(0.94, (cx - r.left) / r.width));
      lu.style.left = g.x * 100 + '%';
    };
    field.addEventListener('pointerdown', (e) => { moveTo(e.clientX); try { field.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } });
    field.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') moveTo(e.clientX); });
    const spawn = () => {
      if (!document.body.contains(field) || g.won) return;
      const rain = c.rain && Math.random() < 0.3;
      const el = document.createElement('span');
      el.className = rain ? 'ct-drop rain' : 'ct-drop';
      el.innerHTML = rain ? '<svg viewBox="0 0 40 52" width="100%" height="100%" aria-hidden="true"><path d="M20 2C14 14 4 24 4 34a16 16 0 0 0 32 0C36 24 26 14 20 2z" fill="#8EB8E5" stroke="#4A78A8" stroke-width="3"/><ellipse cx="14" cy="32" rx="3" ry="6" fill="#fff" opacity=".6"/></svg>' : ic('star', c.size);
      const d = { el, rain, x: 0.06 + Math.random() * 0.88, y: -c.size, done: false };
      el.style.width = c.size + 'px';
      el.style.height = c.size + 'px';
      el.style.left = d.x * 100 + '%';
      field.appendChild(el);
      drops.push(d);
    };
    spawn();
    every(spawn, c.every);
    let last = performance.now();
    const tick = (now) => {
      if (!document.body.contains(field) || g.won) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!S.paused) {
        const H = field.offsetHeight;
        const W = field.offsetWidth;
        const catchY = H - 150;
        drops.forEach((d) => {
          if (d.done) return;
          d.y += c.speed * dt;
          d.el.style.transform = `translate(-50%, ${d.y}px)`;
          const near = Math.abs((d.x - g.x) * W) < 70 + c.size * 0.3;
          if (d.y > catchY - c.size && d.y < catchY + 40 && near) {
            d.done = true;
            d.el.classList.add(d.rain ? 'splash' : 'got');
            setTimeout(() => d.el.remove(), 400);
            if (d.rain) {
              g.wet += 1;
              tone(330, 0.2, 0.06);
              if (g.wet % 2 === 1) say('Oops, wet!');
            } else {
              g.caught += 1;
              const n = document.getElementById('ctN');
              if (n) n.textContent = g.caught;
              tone(NOTES[g.caught % NOTES.length], 0.25, 0.09);
              if (g.caught >= c.goal) { win('catch', lv() === 3 ? 2 : 1); return; }
              if (g.caught === Math.floor(c.goal / 2)) say('Halfway there!');
            }
          } else if (d.y > H) { d.done = true; d.el.remove(); }
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  restartOn('catch');

  // ================================================================ 5. Find it (looking carefully, naming things)
  const FIND_POOL = () => D.ROOM.map((r) => ({ id: r.id, name: r.name })).concat(D.WARDROBE.map((w) => ({ id: w.id, name: w.name })));
  function findRound(prev) {
    const l = lv();
    const n = { 1: 4, 2: 8, 3: 12 }[l];
    const items = shuffle(FIND_POOL()).slice(0, n);
    let target = pick(items);
    if (prev && items.length > 1) while (target.id === prev) target = pick(items);
    // place the things on a loose grid, nudged a little so it looks like a messy room
    const cols = { 1: 4, 2: 4, 3: 6 }[l];
    const rows = Math.ceil(n / cols);
    const spots = shuffle([...Array(cols * rows).keys()]).slice(0, n);
    const placed = items.map((it, k) => {
      const s = spots[k];
      return Object.assign({}, it, {
        x: ((s % cols) + 0.5 + (Math.random() - 0.5) * 0.4) / cols,
        y: (Math.floor(s / cols) + 0.5 + (Math.random() - 0.5) * 0.3) / rows,
        rot: l === 3 ? Math.round((Math.random() - 0.5) * 50) : 0
      });
    });
    return { items: placed, target, solved: false, missed: false };
  }
  A.GAME_MAKERS.find = () => ({ round: 0, total: 5, r: findRound(), won: false });
  A.PARENT['g-find'] = 'play';
  A.VOICE['g-find'] = () => `Can you find the ${S.g.r.target.name.toLowerCase()}?`;
  A.SCREENS['g-find'] = () => {
    const g = S.g;
    const r = g.r;
    const l = lv();
    const size = { 1: 150, 2: 112, 3: 84 }[l];
    const things = r.items.map((it, k) => `<button class="fi-thing ${r.solved && it.id === r.target.id ? 'found' : ''}" data-a="fiTap" data-k="${k}" aria-label="${esc(it.name)}" style="left:${it.x * 100}%;top:${it.y * 100}%;width:${size}px;height:${size}px;--rot:${it.rot}deg">${L.item(it.id, size)}</button>`).join('');
    return `
<section class="screen" aria-label="Find it">
  ${A.srTitle('Find it')}
  ${header('find', A.VOICE['g-find']())}
  <div class="row gap24 grow">
    <div class="col center gap12" style="width:250px">
      <div class="fi-ask">${l < 3 ? `<span class="fi-pic">${L.item(r.target.id, 96)}</span>` : ''}<span class="fi-word">${esc(r.target.name)}</span></div>
      ${lumi(r.solved ? 'excited' : 'happy', 190)}
      ${dots(g.round, g.total, 'var(--teal)', 18)}
    </div>
    <div class="panel fi-room grow"><div class="fi-wall"></div><div class="fi-floor"></div>${things}</div>
  </div>
  ${winCard('find')}
</section>`;
  };
  A.ACTIONS.fiTap = (d, el) => {
    const g = S.g;
    const r = g.r;
    if (r.solved) return 'keep';
    const it = r.items[Number(d.k)];
    if (it.id === r.target.id) {
      if (!r.missed) A.track('correct', 'find', { quiet: true });
      r.solved = true;
      tone(784, 0.4, 0.1);
      say(pick([`Yes! The ${it.name.toLowerCase()}!`, 'You found it!', 'Great looking!']));
      render();
      later(() => {
        g.round += 1;
        if (g.round >= g.total) { win('find', lv() === 3 ? 2 : 1); return; }
        g.r = findRound(r.target.id);
        render();
        say(A.VOICE['g-find']());
      }, 1300);
    } else {
      if (!r.missed) A.track('tries', 'find', { quiet: true });
      r.missed = true;
      wiggle(el);
      say(`That is the ${it.name.toLowerCase()}. Find the ${r.target.name.toLowerCase()}.`);
    }
    return 'keep';
  };
  restartOn('find');

  // ================================================================ 6. Dress for the weather (everyday thinking)
  const WEATHER = {
    sunny: { name: 'Sunny and hot', say: 'It is sunny and hot today.', need: [['head', ['sunhat', 'cap']], ['feet', ['sneakers']]], bg: 'linear-gradient(#BFE3F7, #E6F4FB)' },
    rainy: { name: 'Rainy', say: 'It is raining today.', need: [['body', ['raincoat']], ['feet', ['boots']]], bg: 'linear-gradient(#9FB3C8, #D5DEE8)' },
    cold: { name: 'Cold', say: 'It is very cold today.', need: [['head', ['beanie']], ['body', ['scarf']]], bg: 'linear-gradient(#D9E6F5, #F4F8FC)' }
  };
  const CLOTHES = { sunhat: 'head', cap: 'head', sneakers: 'feet', raincoat: 'body', boots: 'feet', beanie: 'head', scarf: 'body' };
  const ITEM_NAME = (id) => A.itemName(id).toLowerCase();
  function weatherRound(kind) {
    const l = lv();
    const w = WEATHER[kind];
    const need = w.need.slice(0, l === 1 ? 1 : 2);
    const right = need.map(([, ids]) => ids[0]);
    if (kind === 'sunny' && l === 3) right.push('cap');
    const wrong = shuffle(Object.keys(CLOTHES).filter((id) => !w.need.some(([, ids]) => ids.includes(id))));
    const opts = shuffle(right.concat(wrong.slice(0, { 1: 1, 2: 2, 3: 4 }[l])));
    return { kind, need, opts, wear: {}, done: false };
  }
  A.GAME_MAKERS.weather = () => { const order = shuffle(Object.keys(WEATHER)); return { order, round: 0, total: 3, r: weatherRound(order[0]), won: false }; };
  const weatherSay = (r) => `${WEATHER[r.kind].say} What should Lumi wear?`;
  A.PARENT['g-weather'] = 'play';
  A.VOICE['g-weather'] = () => weatherSay(S.g.r);
  function sky(kind) {
    if (kind === 'sunny') return '<svg class="wx-sky" viewBox="0 0 600 220" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><circle cx="500" cy="70" r="46" fill="#F4D35E"/><g stroke="#F4B400" stroke-width="6" stroke-linecap="round">' + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = (a * Math.PI) / 180; return `<path d="M${500 + 60 * Math.cos(r)} ${70 + 60 * Math.sin(r)}L${500 + 80 * Math.cos(r)} ${70 + 80 * Math.sin(r)}"/>`; }).join('') + '</g></svg>';
    if (kind === 'rainy') return '<svg class="wx-sky" viewBox="0 0 600 220" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><g fill="#7F93A8"><ellipse cx="160" cy="60" rx="90" ry="38"/><ellipse cx="230" cy="44" rx="70" ry="36"/><ellipse cx="440" cy="70" rx="100" ry="40"/></g><g class="wx-rain" stroke="#5E8FC4" stroke-width="4" stroke-linecap="round">' + [...Array(16).keys()].map((i) => `<path d="M${40 + i * 36} ${110 + (i % 3) * 30}l-8 22"/>`).join('') + '</g></svg>';
    return '<svg class="wx-sky" viewBox="0 0 600 220" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><g fill="#fff" stroke="#A9C3E0" stroke-width="2">' + [...Array(14).keys()].map((i) => `<circle cx="${30 + i * 42}" cy="${40 + ((i * 53) % 150)}" r="${6 + (i % 3) * 3}"/>`).join('') + '</g></svg>';
  }
  A.SCREENS['g-weather'] = () => {
    const g = S.g;
    const r = g.r;
    const w = WEATHER[r.kind];
    const look = {};
    Object.entries(r.wear).forEach(([slot, id]) => { look[slot] = id; });
    const opts = r.opts.filter((id) => !Object.values(r.wear).includes(id)).map((id) => `<span class="wx-item" data-id="${id}" role="button" aria-label="${esc(A.itemName(id))}">${L.item(id, 96)}<span>${esc(A.itemName(id))}</span></span>`).join('');
    const needDots = dots(Object.keys(r.wear).length, r.need.length, 'var(--teal)', 16);
    return `
<section class="screen" aria-label="Dress for the weather">
  ${A.srTitle('Dress for the weather')}
  ${header('weather', weatherSay(r))}
  <div class="row gap24 grow">
    <div class="panel wx-scene grow" style="background:${w.bg}">
      ${sky(r.kind)}
      <span class="wx-name">${ic(r.kind === 'sunny' ? 'sun' : r.kind === 'rainy' ? 'rain' : 'cloud', 32)}<b>${w.name}</b></span>
      <div class="wx-lumi ${r.done ? 'hop' : ''}" id="wxLumi">${lumi(r.done ? 'excited' : 'happy', 280, Object.assign({ head: 'none', body: 'none', feet: 'none', back: 'none' }, look))}</div>
      <div class="wx-ground"></div>
      <div class="wx-need">${needDots}</div>
    </div>
    <div class="panel wx-tray" style="width:340px">${opts}</div>
  </div>
  ${winCard('weather')}
</section>`;
  };
  function wear(id, el) {
    const g = S.g;
    const r = g.r;
    if (r.done) return false;
    const w = WEATHER[r.kind];
    const slot = CLOTHES[id];
    const ok = r.need.find(([s, ids]) => s === slot && ids.includes(id));
    if (!ok) {
      wiggle(el);
      A.track('tries', 'weather', { quiet: true });
      const forW = Object.values(WEATHER).find((x) => x.need.some(([, ids]) => ids.includes(id)));
      say(`Hmm. A ${ITEM_NAME(id)} is for ${forW ? forW.name.toLowerCase() : 'another'} days.`);
      return false;
    }
    if (r.wear[slot]) { wiggle(el); say('Lumi is already wearing one.'); return false; }
    r.wear[slot] = id;
    tone(NOTES[Object.keys(r.wear).length + 1], 0.3, 0.09);
    if (Object.keys(r.wear).length >= r.need.length) {
      r.done = true;
      later(() => say(pick(['Just right for the weather!', 'Lumi is ready to go out!', 'Perfect!'])), 400);
      later(() => {
        g.round += 1;
        if (g.round >= g.total) { win('weather', lv() === 3 ? 2 : 1); return; }
        g.r = weatherRound(g.order[g.round]);
        render();
        say(weatherSay(g.r));
      }, 2100);
    } else say(`Yes, a ${ITEM_NAME(id)}! What else?`);
    render();
    return true;
  }
  A.AFTER['g-weather'] = () => {
    const target = document.getElementById('wxLumi');
    stage.querySelectorAll('.wx-item').forEach((el) => {
      const id = el.dataset.id;
      draggable(el, {
        over: (x, y) => target && target.classList.toggle('hot', inside(target, x, y)),
        drop: (x, y) => (inside(target, x, y) || inside(stage.querySelector('.wx-scene'), x, y) ? wear(id, el) : false),
        tap: () => wear(id, el)
      });
    });
  };
  A.GUIDE['g-weather'] = () => (S.g && !S.g.won && !S.g.r.done ? { sel: '.wx-item', say: 'Drag clothes onto Lumi.', delay: state.settings.guideDelay * 1000 + 6000 } : null);
  restartOn('weather');

  // a game screen reached any other way (going back, a restart) gets a fresh game of its own
  A.GAME.guard = (ids) => ids.filter((id) => id !== 'wait' && A.SCREENS['g-' + id] && !A.SCREENS['g-' + id].guarded).forEach((id) => {
    const draw = A.SCREENS['g-' + id];
    A.SCREENS['g-' + id] = () => {
      if (!S.g || S.gId !== id) { if (!S.gLevel) S.gLevel = A.GAME.levelOf(id); S.g = A.GAME_MAKERS[id](); S.gId = id; }
      return draw();
    };
    A.SCREENS['g-' + id].guarded = true;
  });
  A.GAME.guard(Object.keys(A.GAME_MAKERS));

  // ---------------------------------------------------------------- the new games on the Play shelf
  D.GAMES.push(
    { id: 'feed', name: 'Feed Lumi', icon: 'kFeed', kind: 'Counting', tint: '#FDE6D8', ink: '#C0603F', skill: 'thinking' },
    { id: 'tune', name: 'Copy the tune', icon: 'kTune', kind: 'Listening', tint: '#E3F0FA', ink: '#4A78A8', skill: 'thinking' },
    { id: 'maze', name: 'Way home', icon: 'kMaze', kind: 'Thinking', tint: '#E7F3E1', ink: '#4F8A3F', skill: 'thinking' },
    { id: 'catch', name: 'Catch stars', icon: 'kCatch', kind: 'Moving', tint: '#FFF1C2', ink: '#8A5C0C', skill: 'emotions' },
    { id: 'find', name: 'Find it', icon: 'kFind', kind: 'Looking', tint: '#F1ECFB', ink: '#7E64C8', skill: 'communication' },
    { id: 'weather', name: 'Weather', icon: 'kWeather', kind: 'Everyday', tint: '#DCEFED', ink: '#2F7E79', skill: 'lifeskills' }
  );
})();
