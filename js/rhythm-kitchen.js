/*
  rhythm-kitchen.js
  Rhythm kitchen: cook to the beat with Lumi's kitchen crew. (A rhythm-cooking game in the spirit of party-game
  rhythm kitchens, made for Lumi: its own chefs, courses, pictures and music.)

  The child cooks in a row of four chefs: the child, Lumi, Momo and Kiwi, each at their own station on one long
  counter. A tune plays and notes slide along a track towards a ring. Tap anywhere when a note reaches the ring:
  the child's chef cooks, and the whole crew cooks on the same beat. Each tap gets "Perfect!", "Nice!" or "Good!".
    1. Chop the carrots     every beat is a slice
    2. Butter the toast     every beat spreads the butter a bit further
    3. Stir the soup        every beat is a stir  (Medium and Hard)
    4. Flip the prata       every beat is a flip, and the prata turns golden
    5. Serve the plates     every beat puts the next thing on the plate  (Hard)
  Each course ends on a gold note: every chef holds up what they made. "Ta-da!"
  The fork-and-knife meter on the right fills up with every good tap. Then lunch is served with one, two or
  three chef hats for how many notes were hit.

  Easy    slow tune, a note every two beats, a wide window, three courses
  Medium  a note on most beats, four courses
  Hard    faster, with quick pairs of notes, all five courses
  Nothing is lost by missing: the note floats past, the friends keep cooking, and the meal is always served.
  The sounds come from the Music corner's instruments (A.MUSIC), so there are no sound files.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  if (!A || !A.GAME || !A.GAME.guard) return;
  const { D, L, S, state, ic, esc, say, render, later, every } = A;
  const { header, winCard, win, lv, lumi, restartOn } = A.GAME;
  const MU = () => A.MUSIC;

  const CFG = { 1: { bpm: 72, win: 300, travel: 4 }, 2: { bpm: 86, win: 220, travel: 4 }, 3: { bpm: 100, win: 170, travel: 4 } };
  // when the notes come, in beats from the start of a course (the first four beats are "3, 2, 1, go")
  const CHARTS = {
    1: [[4, 6, 8, 10, 12, 14, 16, 18], [4, 6, 8, 10, 12, 14, 16], [4, 6, 8, 10, 12, 13, 14, 16]],
    2: [[4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16], [4, 5, 6, 8, 9, 10, 12, 13, 14, 15, 16], [4, 6, 7, 8, 10, 11, 12, 13, 14, 16]],
    3: [[4, 5, 6, 6.5, 7, 8, 9, 10, 10.5, 11, 12, 13, 14, 14.5, 15, 16], [4, 4.5, 5, 6, 7, 8, 8.5, 9, 10, 11, 12, 12.5, 13, 14, 15, 16], [4, 5, 5.5, 6, 7, 8, 9, 9.5, 10, 11, 12, 13, 13.5, 14, 15, 16]]
  };
  const ALL = {
    chop: { id: 'chop', name: 'Chop the carrots', verb: 'Chop!', tint: '#FDE6D8', sound: 'tak' },
    spread: { id: 'spread', name: 'Butter the toast', verb: 'Spread!', tint: '#FFF1C2', sound: 'shake2' },
    stir: { id: 'stir', name: 'Stir the soup', verb: 'Stir!', tint: '#E3F0FA', sound: 'shake2' },
    flip: { id: 'flip', name: 'Flip the prata', verb: 'Flip!', tint: '#FBE6EF', sound: 'tom' },
    plate: { id: 'plate', name: 'Serve the plates', verb: 'Serve!', tint: '#E7F3E1', sound: 'tak' }
  };
  const coursesFor = (l) => (l === 1 ? ['chop', 'spread', 'flip'] : l === 2 ? ['chop', 'spread', 'stir', 'flip'] : ['chop', 'spread', 'stir', 'flip', 'plate']).map((k) => ALL[k]);
  const TUNE = [0, 2, 4, 2, 0, 4, 5, 4]; // a little tune on the xylophone, one note a beat
  // the crew: the child, then Lumi and two friends in other colours
  const CREW = [
    { id: 'you', name: 'You' },
    { id: 'lumi', name: 'Lumi' },
    { id: 'momo', name: 'Momo', color: 'pink' },
    { id: 'kiwi', name: 'Kiwi', color: 'leaf' }
  ];
  // the notes of a course, then the gold "Ta-da!" note two beats after the last one
  const chartFor = (ci) => { const c = CHARTS[lv()][ci % 3].slice(); return c.concat([c[c.length - 1] + 2]); };

  const fresh = () => ({ course: 0, phase: 'ready', hits: 0, notes: 0, total: 0, k: [0, 0, 0, 0], clock: null, cues: [], won: false, served: false, perfect: 0 });
  A.GAME_MAKERS.rkitchen = fresh;
  A.PARENT['g-rkitchen'] = 'play';
  A.VOICE['g-rkitchen'] = () => 'Cook to the beat with Lumi and friends! Tap when a note reaches the ring.';
  const here = () => S.screen === 'g-rkitchen' && S.g && S.gId === 'rkitchen';
  const plan = () => coursesFor(lv());
  const totalNotes = () => plan().reduce((s, c, i) => s + chartFor(i).length, 0);

  // ---------------------------------------------------------------- the pictures (each station is 220 x 160)
  const sv = (body) => `<svg viewBox="0 0 220 160" width="100%" height="100%" aria-hidden="true">${body}</svg>`;
  const board = '<rect x="16" y="66" width="188" height="84" rx="16" fill="#C99A62"/><rect x="16" y="60" width="188" height="82" rx="16" fill="#E9C9A0" stroke="#B58A5E" stroke-width="4"/><path d="M30 76h50M140 128h50" stroke="#F3DDBE" stroke-width="4" stroke-linecap="round"/>';
  const KNIFE = '<path d="M6 58 54 10c6-6 14 0 10 8L22 66z" fill="#DDE4EA" stroke="#7D8894" stroke-width="3" stroke-linejoin="round"/><path d="M14 54 52 16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M6 58 -6 70" stroke="#5A4B45" stroke-width="12" stroke-linecap="round"/>';
  const BUTTERKNIFE = '<path d="M8 56 50 14c5-5 12-1 9 6L20 64z" fill="#DDE4EA" stroke="#7D8894" stroke-width="3" stroke-linejoin="round"/><path d="M40 26 50 16" stroke="#FFF0B8" stroke-width="6" stroke-linecap="round"/><path d="M8 56-4 68" stroke="#C99A62" stroke-width="11" stroke-linecap="round"/>';
  const LADLE = '<path d="M52 4 28 48" stroke="#9C7343" stroke-width="8" stroke-linecap="round"/><path d="M8 50a18 18 0 0 0 36 0z" fill="#C9D2DA" stroke="#6F7B87" stroke-width="3"/>';
  const FLIPPER = '<path d="M64 4 38 36" stroke="#3B2F2F" stroke-width="8" stroke-linecap="round"/><path d="M6 44l22-16 16 18-22 16z" fill="#D5DCE3" stroke="#6F7B87" stroke-width="3" stroke-linejoin="round"/>';
  const TOOLS = { chop: KNIFE, spread: BUTTERKNIFE, stir: LADLE, flip: FLIPPER, plate: '' };
  // a carrot that gets shorter as it is sliced, and a pile of slices
  function chopSvg(f, k) {
    const len = Math.round(150 * (1 - f));
    const pile = Array.from({ length: Math.min(k, 12) }, (_, i) => { const x = 146 + (i % 4) * 14, y = 128 - Math.floor(i / 4) * 9; return `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#F3A968" stroke="#D9803F" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="2" fill="#FFD3A6"/>`; }).join('');
    const tip = Math.min(26, len);
    const carrot = len > 8 ? `<path d="M30 100q0-16 16-16h${Math.max(0, len - 20)}l${tip} 16-${tip} 16H46q-16 0-16-16z" fill="#F3A968" stroke="#D9803F" stroke-width="3.4"/><path d="M42 94h${Math.max(0, len - 34)}" stroke="#FFC89A" stroke-width="3" stroke-linecap="round"/><path d="M30 100q-14-20-20-8M30 100q-18-2-18 10M30 100q-10 16-2 20" fill="none" stroke="#5E9E45" stroke-width="5" stroke-linecap="round"/>` : '';
    return sv(`${board}${carrot}${pile}`);
  }
  // a slice of toast and a little dish of butter: the butter spreads further with every beat
  function spreadSvg(f) {
    const w = Math.round(116 * f);
    return sv(`<ellipse cx="100" cy="150" rx="90" ry="7" fill="#6B4A3A" opacity=".12"/>
      <rect x="14" y="56" width="150" height="90" rx="40" fill="#C98A3E"/><rect x="20" y="60" width="138" height="80" rx="36" fill="#E9B46A"/><rect x="28" y="68" width="122" height="64" rx="30" fill="#F3CC8A"/>
      ${[[46, 82], [76, 112], [118, 88], [136, 118], [60, 122]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#C98A3E" opacity=".6"/>`).join('')}
      ${w > 0 ? `<rect x="32" y="74" width="${w}" height="52" rx="24" fill="#FFF0B8" opacity=".95"/><path d="M42 86h${Math.max(0, w - 24)}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>` : ''}
      <ellipse cx="190" cy="64" rx="26" ry="10" fill="#B9CCDA"/><ellipse cx="190" cy="60" rx="26" ry="10" fill="#FAFCFD"/>${f < 1 ? `<rect x="${178 + f * 6}" y="${42 + f * 9}" width="${24 - f * 12}" height="${18 - f * 9}" rx="3" fill="#FFE27A" stroke="#E8C24A" stroke-width="2"/>` : ''}`);
  }
  // a little pot of soup with a swirl that turns
  function stirSvg(f, k) {
    return sv(`<path d="M74 154h72" stroke="#EF8A7A" stroke-width="10" stroke-linecap="round" opacity=".7"/><rect x="34" y="70" width="152" height="76" rx="20" fill="#C0674A" stroke="#8A4630" stroke-width="5"/><path d="M18 84h18M184 84h18" stroke="#8A4630" stroke-width="9" stroke-linecap="round"/><path d="M46 84v48" stroke="#E08A6A" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="110" cy="72" rx="74" ry="16" fill="#F3C777" stroke="#8A4630" stroke-width="5"/>
      <g transform="rotate(${k * 50} 110 72)"><path d="M84 72q26-12 52 0" stroke="#E0A34B" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="92" cy="70" r="4" fill="#F3A968"/><circle cx="126" cy="74" r="3.6" fill="#9CCB7A"/><circle cx="110" cy="66" r="3" fill="#F3A968"/></g>
      ${[0, 1].map((i) => `<path d="M${92 + i * 34} ${48 - f * 6}c-6-8 6-12 0-22" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="${(0.3 + f * 0.6).toFixed(2)}"/>`).join('')}`);
  }
  // a pan with a prata that gets more golden with every flip
  function flipSvg(f) {
    return sv(`<path d="M60 156h80" stroke="#EF8A7A" stroke-width="10" stroke-linecap="round" opacity=".7"/><ellipse cx="96" cy="124" rx="78" ry="24" fill="#3F3431"/><ellipse cx="96" cy="118" rx="72" ry="20" fill="#5A4B45"/><path d="M170 116h44" stroke="#8A6A4A" stroke-width="12" stroke-linecap="round"/>
      <g class="rk-prata-g"><ellipse cx="96" cy="112" rx="56" ry="14" fill="#F6E7C8" stroke="#E3CFA0" stroke-width="3"/><ellipse cx="96" cy="112" rx="56" ry="14" fill="#E09A3B" opacity="${Math.min(1, f * 1.1).toFixed(2)}"/>
      <path d="M60 110c14-6 40-8 64-2" stroke="#C9853A" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="${f.toFixed(2)}"/></g>`);
  }
  // a plate that fills up: rice, chicken, cucumber, egg, chilli
  function plateSvg(f) {
    const n = Math.round(f * 5);
    return sv(`<ellipse cx="110" cy="122" rx="96" ry="30" fill="#B9CCDA"/><ellipse cx="110" cy="116" rx="96" ry="30" fill="#FAFCFD"/><ellipse cx="110" cy="116" rx="84" ry="24" fill="none" stroke="#5FAE9E" stroke-width="3"/>
      ${n > 0 ? '<path d="M50 118q4-36 42-38q38 2 42 38q-42 8-84 0z" fill="#FFFDF5" stroke="#E6DDC8" stroke-width="2.4"/>' : ''}
      ${n > 1 ? [0, 1, 2, 3].map((i) => `<path d="M${118 + i * 11} 124l2-28h11l1 28z" fill="#FFF4E2" stroke="#D9A86A" stroke-width="1.8"/><path d="M${120 + i * 11} 96h11l.4 6h-11.8z" fill="#E09A44"/>`).join('') : ''}
      ${n > 2 ? [[44, 120], [58, 126], [72, 129]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#EAF6DC" stroke="#3F7A33" stroke-width="2.6"/>`).join('') : ''}
      ${n > 3 ? '<path d="M78 92c1-7 9-10 16-8s12 2 12 8-9 8-16 7-13 0-12-7z" fill="#fff" stroke="#E2B370" stroke-width="1.6"/><circle cx="92" cy="90" r="5" fill="#FFB020"/>' : ''}
      ${n > 4 ? '<ellipse cx="184" cy="92" rx="18" ry="6.4" fill="#FAFCFD" stroke="#B9CCDA" stroke-width="2"/><ellipse cx="184" cy="91" rx="11" ry="3.6" fill="#E64A33"/>' : ''}`);
  }
  function stationSvg(id, f, k) {
    if (id === 'chop') return chopSvg(f, k);
    if (id === 'spread') return spreadSvg(f);
    if (id === 'stir') return stirSvg(f, k);
    if (id === 'flip') return flipSvg(f);
    return plateSvg(f);
  }
  // what each chef holds up at the end of a course: "Ta-da!"
  const TADA = {
    chop: '<svg viewBox="0 0 80 110" width="100%" height="100%" aria-hidden="true"><path d="M40 108V50" stroke="#5A4B45" stroke-width="12" stroke-linecap="round"/><path d="M30 52h20l-4-38c-1-8-11-8-12 0z" fill="#DDE4EA" stroke="#7D8894" stroke-width="3"/><circle cx="40" cy="18" r="17" fill="#E2412F" stroke="#B5301F" stroke-width="3"/><path d="M33 4q7 4 14 0M40 2v6" stroke="#4F8A3F" stroke-width="3.4" stroke-linecap="round" fill="none"/><ellipse cx="34" cy="13" rx="4" ry="2.6" fill="#FF8A70"/></svg>',
    spread: '<svg viewBox="0 0 80 110" width="100%" height="100%" aria-hidden="true"><path d="M40 108V58" stroke="#C99A62" stroke-width="10" stroke-linecap="round"/><rect x="12" y="14" width="56" height="44" rx="18" fill="#E9B46A" stroke="#C98A3E" stroke-width="3"/><rect x="20" y="22" width="40" height="26" rx="12" fill="#FFF0B8"/></svg>',
    stir: '<svg viewBox="0 0 80 110" width="100%" height="100%" aria-hidden="true"><path d="M44 108 40 40" stroke="#9C7343" stroke-width="9" stroke-linecap="round"/><path d="M18 30a22 22 0 0 0 44 0z" fill="#C9D2DA" stroke="#6F7B87" stroke-width="3"/><ellipse cx="40" cy="30" rx="22" ry="5" fill="#F3C777"/><path d="M30 18c-4-6 4-8 0-14M48 18c-4-6 4-8 0-14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    flip: '<svg viewBox="0 0 80 110" width="100%" height="100%" aria-hidden="true"><path d="M40 108V48" stroke="#3B2F2F" stroke-width="9" stroke-linecap="round"/><rect x="18" y="38" width="44" height="14" rx="4" fill="#D5DCE3" stroke="#6F7B87" stroke-width="3"/><ellipse cx="40" cy="28" rx="34" ry="11" fill="#E0A04B" stroke="#C9853A" stroke-width="3"/><path d="M18 26c12-4 30-5 44-1" stroke="#F6D58C" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    plate: '<svg viewBox="0 0 80 110" width="100%" height="100%" aria-hidden="true"><path d="M40 108V44" stroke="#FFD9B8" stroke-width="10" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="36" ry="12" fill="#FAFCFD" stroke="#B9CCDA" stroke-width="3"/><path d="M20 36q4-20 20-21q16 1 20 21z" fill="#FFFDF5" stroke="#E6DDC8" stroke-width="2"/><path d="M44 34l1-12h6l1 12z" fill="#FFF4E2" stroke="#D9A86A" stroke-width="1.4"/></svg>'
  };
  // the chefs: the child (their photo, or the "me" picture) and three Lumis, all in chef's hats
  function chefFace(i, mood, size) {
    const c = CREW[i];
    if (c.id === 'you') {
      return state.childPhoto
        ? `<span class="rk-me photo" style="width:${size}px;height:${size}px"><img src="${state.childPhoto}" alt=""></span>`
        : `<span class="rk-me" style="width:${size}px;height:${size}px">${ic('me', Math.round(size * 0.8))}</span>`;
    }
    if (c.id === 'lumi') return lumi(mood, size);
    return L.svg({ look: { color: c.color }, mood, size, label: c.name });
  }
  const frac = (g, i) => Math.min(1, g.k[i] / Math.max(1, g.cues.length - 1));
  function crewHtml(g) {
    const c = plan()[g.course];
    return `<div class="rk-crew">${CREW.map((m, i) => `<div class="rk-chef ${i === 0 ? 'me' : ''}" id="rkChef${i}">
        <span class="rk-who"><span class="rk-hat" aria-hidden="true"></span>${chefFace(i, 'happy', i === 0 ? 112 : 140)}<span class="rk-tada" aria-hidden="true">${TADA[c.id]}</span><span class="rk-nice" id="rkNice${i}"></span></span>
        <span class="rk-tag">${esc(i === 0 && state.childName ? state.childName : m.name)}</span>
        <span class="rk-sta" id="rkSta${i}">${stationSvg(c.id, frac(g, i), g.k[i])}${TOOLS[c.id] ? `<span class="rk-tool ${c.id}" aria-hidden="true"><svg viewBox="-10 0 80 80" width="100%" height="100%">${TOOLS[c.id]}</svg></span>` : ''}<span class="rk-arc" aria-hidden="true"></span></span>
      </div>`).join('')}</div>`;
  }
  function servedHtml(g) {
    const hats = g.notes ? (g.hits / g.notes >= 0.8 ? 3 : g.hits / g.notes >= 0.5 ? 2 : 1) : 1;
    return `<div class="rk-serve">
      <div class="rk-cheer">${CREW.map((m, i) => `<span class="rk-who bop"><span class="rk-hat" aria-hidden="true"></span>${chefFace(i, 'excited', i === 0 ? 100 : 124)}</span>`).join('')}</div>
      <div class="rk-table">${plan().map((c) => `<span class="rk-dish">${stationSvg(c.id, 1, 12)}</span>`).join('')}</div>
      <b>Lunch is ready!</b><span class="rk-hats" aria-label="${hats} chef hats">${Array.from({ length: 3 }, (_, i) => `<i class="${i < hats ? 'on' : ''}"></i>`).join('')}</span></div>`;
  }
  const meterHtml = (g) => `<div class="rk-meter" role="img" aria-label="Cooking meter"><span class="rk-meter-bar"><i id="rkMeter" style="height:${Math.round(Math.min(1, g.hits / Math.max(1, g.total || totalNotes())) * 100)}%"></i></span><span class="rk-meter-ic">${ic('cutlery', 30)}</span></div>`;

  A.SCREENS['g-rkitchen'] = () => {
    const g = S.g;
    const list = plan();
    const c = list[Math.min(g.course, list.length - 1)];
    return `
<section class="screen" aria-label="Rhythm kitchen">
  ${A.srTitle('Rhythm kitchen')}
  ${header('rkitchen', A.VOICE['g-rkitchen']())}
  <div class="panel rk-kitchen grow" id="rkKitchen" style="--tint:${g.served ? '#E7F3E1' : c.tint}" role="button" aria-label="${g.served ? 'Lunch is ready' : `${c.name}. Tap in time with the notes.`}">
    <div class="rk-top">
      <span class="rk-steps">${list.map((x, i) => `<i class="${i < g.course || g.served ? 'done' : i === g.course ? 'on' : ''}">${i + 1}</i>`).join('')}</span>
      <b class="rk-name">${esc(g.served ? 'All done!' : c.name)}</b>
      <span class="rk-score">${ic('star', 26)}<b id="rkHits">${g.hits}</b></span>
    </div>
    <div class="rk-lane" id="rkLane"><span class="rk-ring" id="rkRing"></span><span class="rk-count" id="rkCount"></span>${g.phase === 'ready' && !g.served ? `<button class="primary rk-start" data-a="rkStart">${ic('play', 36)}<span>${g.course ? 'Next' : 'Start'}</span></button>` : ''}</div>
    <div class="rk-stage">
      ${g.served ? servedHtml(g) : crewHtml(g)}
      ${meterHtml(g)}
      <span class="rk-word" id="rkWord"></span>
    </div>
  </div>
  ${winCard('rkitchen')}
</section>`;
  };

  // ---------------------------------------------------------------- the crew cooks
  const bump = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  function cook(g, i, word) {
    const c = plan()[g.course];
    g.k[i] += 1;
    const sta = document.getElementById('rkSta' + i);
    if (sta) {
      const old = sta.querySelector(':scope > svg');
      if (old) old.outerHTML = stationSvg(c.id, frac(g, i), g.k[i]);
      bump(sta.querySelector('.rk-tool'), 'go');
      bump(sta.querySelector('.rk-arc'), 'go');
      if (c.id === 'flip') bump(sta.querySelector('.rk-prata-g'), 'toss');
    }
    if (word) { const n = document.getElementById('rkNice' + i); if (n) { n.textContent = word; bump(n, 'show'); } }
  }
  const tada = (i) => bump(document.getElementById('rkChef' + i), 'pose');

  // ---------------------------------------------------------------- one course: the beat, the notes, the taps
  function startCourse() {
    const g = S.g;
    if (!here() || g.phase === 'play' || g.served) return;
    const c = CFG[lv()];
    const period = 60000 / c.bpm;
    const chart = chartFor(g.course);
    const t0 = performance.now() + 600;
    g.phase = 'play';
    g.k = [0, 0, 0, 0];
    g.total = totalNotes();
    g.cues = chart.map((b, i) => ({ at: t0 + b * period, hit: false, gone: false, el: null, star: i === chart.length - 1, crew: false }));
    g.notes += g.cues.length;
    g.clock = { t0, period, next: 0, last: chart[chart.length - 1] + 2 };
    render();
    const lane = document.getElementById('rkLane');
    g.cues.forEach((q) => { const el = document.createElement('i'); el.className = 'rk-note' + (q.star ? ' star' : ''); lane.appendChild(el); q.el = el; });
  }
  function frame() {
    const g = S.g;
    if (!here() || g.phase !== 'play' || !g.clock) return;
    const c = CFG[lv()];
    const k = g.clock;
    const now = performance.now();
    // the tune: a bass drum and a soft hat, with a xylophone note on each beat
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
      setTimeout(() => {
        if (!here() || S.g !== g) return;
        const cnt = document.getElementById('rkCount');
        if (cnt) cnt.textContent = n < 3 ? String(3 - n) : n === 3 ? 'Go!' : '';
        document.querySelectorAll('.rk-chef .rk-who').forEach((el) => bump(el, 'bop'));
      }, wait * 1000);
    }
    // Lumi, Momo and Kiwi cook on every note, and hold their food up on the gold one
    g.cues.forEach((q) => {
      if (q.crew || now < q.at) return;
      q.crew = true;
      for (let i = 1; i < CREW.length; i++) {
        if (q.star) tada(i);
        else cook(g, i, ['Nice!', 'Nice!', 'Great!'][(i + g.k[i]) % 3]);
      }
      if (q.star && !q.hit) later(() => { if (here() && S.g === g) tada(0); }, 400); // the child's chef holds theirs up too
    });
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
    const list = plan();
    if (g.course >= list.length - 1) {
      g.served = true;
      render();
      say('Lunch is ready! Yum! Great cooking, chefs!');
      const m = MU();
      if (m && m.on()) [0, 2, 4, 7].forEach((i, n) => m.sound('xylo', m.time() + 0.1 + n * 0.14, i));
      later(() => { if (here()) win('rkitchen', lv() === 3 ? 2 : 1); }, 3000);
      return;
    }
    g.course += 1;
    render();
    say(`Ta-da! Well done. Next: ${list[g.course].name.toLowerCase()}.`);
  }
  function tap() {
    const g = S.g;
    if (!here() || g.won || g.phase !== 'play') return;
    const c = CFG[lv()];
    const course = plan()[g.course];
    const now = performance.now();
    let best = null;
    g.cues.forEach((q) => { if (!q.hit && !q.gone && Math.abs(q.at - now) <= c.win && (!best || Math.abs(q.at - now) < Math.abs(best.at - now))) best = q; });
    const m = MU();
    // the cooking sound, hit or not: the kitchen always answers a tap
    if (m && m.on()) m.sound(course.sound);
    const sta = document.getElementById('rkSta0');
    if (sta) bump(sta.querySelector('.rk-tool'), 'go');
    if (!best) return;
    best.hit = true;
    if (best.el) best.el.classList.add('hit');
    g.hits += 1;
    const off = Math.abs(best.at - now) / c.win;
    const word = off < 0.35 ? 'Perfect!' : off < 0.7 ? 'Nice!' : 'Good!';
    if (off < 0.35) g.perfect += 1;
    const hits = document.getElementById('rkHits');
    if (hits) hits.textContent = g.hits;
    const meter = document.getElementById('rkMeter');
    if (meter) meter.style.height = Math.round(Math.min(1, g.hits / Math.max(1, g.total)) * 100) + '%';
    bump(document.getElementById('rkRing'), 'good');
    if (best.star) {
      tada(0);
      const wd = document.getElementById('rkWord');
      if (wd) { wd.textContent = 'Ta-da!'; bump(wd, 'show'); }
      const n = document.getElementById('rkNice0');
      if (n) { n.textContent = word; bump(n, 'show'); }
      if (m && m.on()) [4, 7].forEach((x, j) => m.sound('xylo', m.time() + j * 0.12, x));
      return;
    }
    cook(g, 0, word);
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
