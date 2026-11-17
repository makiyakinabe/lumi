/*
  rhythm-kitchen.js
  Rhythm kitchen: cook to the beat with Lumi. (A rhythm-cooking game in the spirit of party-game rhythm
  kitchens, made for Lumi: its own courses, pictures and music.)

  A tune plays. Notes slide along a track towards a ring. Tap anywhere in the kitchen when a note reaches the
  ring, and Lumi cooks in time:
    1. Chop the carrot      every hit is a slice
    2. Stir the soup        every hit is a stir
    3. Flip the prata       every hit is a flip
  Then the meal is served with one, two or three chef hats for how many notes were hit.

  Easy    slow tune, a note every two beats, a wide window
  Medium  a note on every beat
  Hard    faster, with quick pairs of notes
  Nothing is lost by missing: a missed note just floats past, and the meal is always served.
  The sounds come from the Music corner's instruments (A.MUSIC), so there are no sound files.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  if (!A || !A.GAME || !A.GAME.guard) return;
  const { D, S, state, ic, esc, say, render, later, every, dots, stage } = A;
  const { header, winCard, win, lv, lumi, restartOn } = A.GAME;
  const MU = () => A.MUSIC;

  const CFG = { 1: { bpm: 72, win: 280, travel: 4 }, 2: { bpm: 86, win: 210, travel: 4 }, 3: { bpm: 100, win: 160, travel: 4 } };
  // when the notes fall, counted in beats from the start of a course (the first four beats are "ready, steady…")
  const CHARTS = {
    1: [[4, 6, 8, 10, 12, 14, 16, 18], [4, 6, 8, 10, 12, 14, 16, 18], [4, 6, 8, 10, 12, 13, 14, 16, 18]],
    2: [[4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16], [4, 5, 6, 8, 9, 10, 12, 13, 14, 15, 16], [4, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18]],
    3: [[4, 5, 6, 6.5, 7, 8, 9, 10, 10.5, 11, 12, 13, 14, 14.5, 15, 16], [4, 4.5, 5, 6, 7, 8, 8.5, 9, 10, 11, 12, 12.5, 13, 14, 15, 16], [4, 5, 5.5, 6, 7, 8, 9, 9.5, 10, 11, 12, 13, 13.5, 14, 15, 16]]
  };
  const COURSES = [
    { id: 'chop', name: 'Chop the carrot', verb: 'Chop!', tint: '#FDE6D8' },
    { id: 'stir', name: 'Stir the soup', verb: 'Stir!', tint: '#E3F0FA' },
    { id: 'flip', name: 'Flip the prata', verb: 'Flip!', tint: '#FFF1C2' }
  ];
  const TUNE = [0, 2, 4, 2, 0, 4, 5, 4]; // a little tune on the xylophone, one note a beat

  const fresh = () => ({ course: 0, phase: 'ready', hits: 0, notes: 0, n: 0, clock: null, cues: [], won: false, served: false });
  A.GAME_MAKERS.rkitchen = fresh;
  A.PARENT['g-rkitchen'] = 'play';
  A.VOICE['g-rkitchen'] = () => 'Cook to the beat! Tap when a note reaches the ring.';
  const here = () => S.screen === 'g-rkitchen' && S.g && S.gId === 'rkitchen';

  // ---------------------------------------------------------------- the pictures
  const carrot = (cut) => `<svg viewBox="0 0 300 120" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => (i < cut ? '' : `<ellipse cx="${46 + i * 24}" cy="60" rx="${15 + i * 2.2}" ry="${22 + i * 2.6}" fill="#F3A968" stroke="#D9803F" stroke-width="4"/>`)).join('')}<path d="M262 60q24-34 30-10M262 60q30-6 28 12M262 60q22 24 12 34" fill="none" stroke="#5E9E45" stroke-width="7" stroke-linecap="round"/></svg>`;
  const slices = (n) => Array.from({ length: Math.min(n, 18) }, (_, i) => `<i style="left:${8 + (i % 6) * 15}%;bottom:${4 + Math.floor(i / 6) * 22}%"></i>`).join('');
  function scene(g) {
    const c = COURSES[g.course];
    if (g.served) {
      const hats = g.notes ? (g.hits / g.notes >= 0.8 ? 3 : g.hits / g.notes >= 0.5 ? 2 : 1) : 1;
      return `<div class="rk-serve"><span class="rk-plate"><i class="rk-rice"></i><i class="rk-prata"></i><i class="rk-bowl"></i></span>
        <b>Lunch is ready!</b><span class="rk-hats" aria-label="${hats} chef hats">${Array.from({ length: 3 }, (_, i) => `<i class="${i < hats ? 'on' : ''}"></i>`).join('')}</span></div>`;
    }
    if (c.id === 'chop') return `<div class="rk-chop"><span class="rk-board"><span class="rk-carrot" id="rkFood">${carrot(g.n % 9)}</span><span class="rk-pile" id="rkPile">${slices(g.n)}</span></span><span class="rk-knife" id="rkTool"></span></div>`;
    if (c.id === 'stir') return `<div class="rk-stir"><span class="rk-steam a"></span><span class="rk-steam b"></span><span class="rk-pot"><i class="rk-soup" id="rkFood"></i><span class="rk-spoon" id="rkTool" style="transform:rotate(${g.n * 45}deg)"><i></i></span></span><span class="rk-flame"></span></div>`;
    return `<div class="rk-flip"><span class="rk-prata-fly" id="rkFood"></span><span class="rk-pan" id="rkTool"><i></i></span><span class="rk-flame"></span></div>`;
  }

  A.SCREENS['g-rkitchen'] = () => {
    const g = S.g;
    const c = COURSES[g.course];
    return `
<section class="screen" aria-label="Rhythm kitchen">
  ${A.srTitle('Rhythm kitchen')}
  ${header('rkitchen', A.VOICE['g-rkitchen']())}
  <div class="panel rk-kitchen grow" id="rkKitchen" style="--tint:${g.served ? '#E7F3E1' : c.tint}" role="button" aria-label="${g.served ? 'Lunch is ready' : `${c.name}. Tap in time with the notes.`}">
    <div class="rk-top">
      <span class="rk-steps">${COURSES.map((x, i) => `<i class="${i < g.course || g.served ? 'done' : i === g.course ? 'on' : ''}">${i + 1}</i>`).join('')}</span>
      <b class="rk-name">${esc(g.served ? 'All done!' : c.name)}</b>
      <span class="rk-score">${ic('star', 26)}<b id="rkHits">${g.hits}</b></span>
    </div>
    <div class="rk-lane" id="rkLane"><span class="rk-ring" id="rkRing"></span><span class="rk-count" id="rkCount"></span>${g.phase === 'ready' && !g.served ? `<button class="primary rk-start" data-a="rkStart">${ic('play', 36)}<span>${g.course ? 'Next' : 'Start'}</span></button>` : ''}</div>
    <div class="rk-stage">
      <span class="rk-lumi" id="rkLumi">${lumi(g.served ? 'excited' : 'happy', 230)}</span>
      ${scene(g)}
      <span class="rk-word" id="rkWord"></span>
    </div>
  </div>
  ${winCard('rkitchen')}
</section>`;
  };

  // ---------------------------------------------------------------- one course: the beat, the notes, the taps
  function startCourse() {
    const g = S.g;
    if (!here() || g.phase === 'play' || g.served) return;
    const c = CFG[lv()];
    const period = 60000 / c.bpm;
    const chart = CHARTS[lv()][g.course];
    const t0 = performance.now() + 600;
    g.phase = 'play';
    g.n = 0;
    g.cues = chart.map((b) => ({ at: t0 + b * period, hit: false, gone: false, el: null }));
    g.notes += g.cues.length;
    g.clock = { t0, period, next: 0, last: chart[chart.length - 1] + 2 };
    render();
    const lane = document.getElementById('rkLane');
    g.cues.forEach((q) => { const el = document.createElement('i'); el.className = 'rk-note'; lane.appendChild(el); q.el = el; });
  }
  function frame() {
    const g = S.g;
    if (!here() || g.phase !== 'play' || !g.clock) return;
    const c = CFG[lv()];
    const k = g.clock;
    const now = performance.now();
    // the tune: a bass drum and a soft hat, with a xylophone note on each beat; a quiet "ding" where each note falls
    while (k.t0 + k.next * k.period < now + 150) {
      const n = k.next++;
      if (n > k.last) break;
      const wait = Math.max(0, k.t0 + n * k.period - now) / 1000;
      const m = MU();
      if (m && m.on()) {
        const at = m.time() + wait;
        if (n % 2 === 0) m.sound('kick', at);
        m.sound('hat', at);
        if (n >= 4) m.sound('xylo', at, TUNE[n % TUNE.length]);
        else m.sound('tick', at, true);
      }
      setTimeout(() => { if (!here() || S.g !== g) return; const cnt = document.getElementById('rkCount'); if (cnt) cnt.textContent = n < 3 ? String(3 - n) : n === 3 ? 'Go!' : ''; const lu = document.getElementById('rkLumi'); if (lu) { lu.classList.remove('bop'); void lu.offsetWidth; lu.classList.add('bop'); } }, wait * 1000);
    }
    const lane = document.getElementById('rkLane');
    if (!lane) return;
    const w = lane.clientWidth;
    const ringX = w * 0.16;
    const travel = c.travel * k.period;
    g.cues.forEach((q) => {
      if (!q.el || q.done) return;
      if (!q.el.isConnected) lane.appendChild(q.el); // the kitchen was drawn again
      const dt = q.at - now;
      if (!q.hit && !q.gone && dt < -c.win) { q.gone = true; q.el.classList.add('gone'); }
      if (dt < -900) { q.el.remove(); q.done = true; return; }
      q.el.style.transform = `translateX(${Math.round(ringX + (dt / travel) * (w - ringX))}px)`;
      q.el.style.opacity = dt > travel ? '0' : '';
    });
    if (now > k.t0 + k.last * k.period) endCourse();
  }
  function endCourse() {
    const g = S.g;
    g.phase = 'ready';
    g.clock = null;
    if (g.course >= COURSES.length - 1) {
      g.served = true;
      render();
      say('Lunch is ready! Yum!');
      const m = MU();
      if (m && m.on()) [0, 2, 4, 7].forEach((i, n) => m.sound('xylo', m.time() + 0.1 + n * 0.14, i));
      later(() => { if (here()) win('rkitchen', lv() === 3 ? 2 : 1); }, 2600);
      return;
    }
    g.course += 1;
    render();
    say(`Well done! Next: ${COURSES[g.course].name.toLowerCase()}.`);
  }
  function tap() {
    const g = S.g;
    if (!here() || g.won || g.phase !== 'play') return;
    const c = CFG[lv()];
    const course = COURSES[g.course];
    const now = performance.now();
    let best = null;
    g.cues.forEach((q) => { if (!q.hit && !q.gone && Math.abs(q.at - now) <= c.win && (!best || Math.abs(q.at - now) < Math.abs(best.at - now))) best = q; });
    const m = MU();
    // the cooking sound, hit or not: the kitchen always answers a tap
    if (m && m.on()) {
      if (course.id === 'chop') m.sound('tak');
      else if (course.id === 'stir') m.sound('shake2');
      else m.sound('tom');
    }
    const tool = document.getElementById('rkTool');
    if (tool) { tool.classList.remove('go'); void tool.offsetWidth; tool.classList.add('go'); }
    if (!best) return;
    best.hit = true;
    if (best.el) best.el.classList.add('hit');
    g.hits += 1;
    g.n += 1;
    const hits = document.getElementById('rkHits');
    if (hits) hits.textContent = g.hits;
    const ring = document.getElementById('rkRing');
    if (ring) { ring.classList.remove('good'); void ring.offsetWidth; ring.classList.add('good'); }
    const word = document.getElementById('rkWord');
    if (word) { word.textContent = course.verb; word.classList.remove('show'); void word.offsetWidth; word.classList.add('show'); }
    const food = document.getElementById('rkFood');
    if (course.id === 'chop') {
      if (food) food.innerHTML = carrot(g.n % 9);
      const pile = document.getElementById('rkPile');
      if (pile) pile.innerHTML = slices(g.n);
    } else if (course.id === 'stir') {
      if (tool) tool.style.transform = `rotate(${g.n * 45}deg)`;
      if (food) { food.classList.remove('swirl'); void food.offsetWidth; food.classList.add('swirl'); }
    } else if (food) { food.classList.remove('toss'); void food.offsetWidth; food.classList.add('toss'); }
  }
  A.ACTIONS.rkStart = () => { startCourse(); return 'keep'; };
  A.AFTER['g-rkitchen'] = () => {
    const box = document.getElementById('rkKitchen');
    if (!box || box.dataset.wired) return;
    box.dataset.wired = '1';
    box.addEventListener('pointerdown', (e) => { if (e.target.closest && e.target.closest('.rk-start')) return; e.preventDefault(); tap(); });
  };
  // a keyboard or a switch can play too
  document.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && here() && S.g.phase === 'play') { e.preventDefault(); tap(); } });
  A.ENTER = A.ENTER || {};
  A.ENTER['g-rkitchen'] = () => { every(frame, 16); };
  A.GUIDE['g-rkitchen'] = () => (S.g && !S.g.won && S.g.phase === 'ready' && !S.g.served ? { sel: '.rk-start', say: 'Tap Start.', delay: state.settings.guideDelay * 1000 + 4000 } : null);
  restartOn('rkitchen');
  A.GAME.guard(['rkitchen']);
  D.GAMES.push({ id: 'rkitchen', name: 'Rhythm kitchen', icon: 'kChef', kind: 'Cook to the beat', tint: '#FDE6D8', ink: '#C0603F', skill: 'thinking', cat: 'go' });
})();
