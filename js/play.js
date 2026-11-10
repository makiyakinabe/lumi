/*
  play.js
  The Play area: short puzzle games with Lumi that are calming, make you think, or teach everyday things.
  No timers and no losing. Wrong taps get a gentle wiggle and a hint.
  Every game has three levels (Easy, Medium, Hard). A game starts at the level the grown-ups chose, and the child can
  change it in the game's top bar; each game remembers its own level (state.gameLevels). More games: games-more.js.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, award, track, render, go, later, every, pick, dots } = A;

  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const NOTES = [392, 440, 523, 587, 659, 784];
  const gameOf = (id) => D.GAMES.find((g) => g.id === id);
  // the level of the game being played (falls back to the grown-ups' level)
  const lv = () => S.gLevel || A.level();
  const LEVEL_NAMES = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const levelOf = (id) => (state.gameLevels || {})[id] || A.level();
  // Easy / Medium / Hard, as one, two or three stars (child-sized buttons)
  function levelPicker(id) {
    const cur = lv();
    return `<div class="lvl-pick" role="group" aria-label="How hard">${[1, 2, 3].map((n) => `<button class="lvl-opt ${cur === n ? 'on' : ''}" data-a="gLevel" data-v="${n}" data-id="${id}" aria-pressed="${cur === n}" aria-label="${LEVEL_NAMES[n]}">
      <span class="lvl-stars">${ic('star', 22).repeat(n)}</span><span>${LEVEL_NAMES[n]}</span></button>`).join('')}</div>`;
  }
  function header(id, voice) {
    const g = gameOf(id);
    return `<div class="row between" style="height:60px;flex:none">
      <div class="row gap12">${A.backBtn()}${A.speakBtn(voice)}<span class="game-chip" style="background:${g.tint};color:${g.ink}">${ic(g.icon, 34)}<span>${g.name}</span></span></div>
      ${levelPicker(id)}
    </div>`;
  }
  function winCard(id) {
    if (!S.g || !S.g.won) return '';
    return `<div class="win-veil"><div class="win-card">
      <div class="hop">${L.svg({ look: A.lookWith(), mood: 'excited', size: 170 })}</div>
      <div class="win-title">${ic('star', 40)}<span>Well done!</span>${ic('star', 40)}</div>
      <div class="row gap16">
        <button class="primary" data-a="gAgain" data-v="${id}" style="height:80px">${ic('undo', 32)}<span>Again</span></button>
        ${lv() < 3 ? `<button class="primary soft-btn" data-a="gLevel" data-v="${lv() + 1}" data-id="${id}" style="height:80px">${ic('star', 32)}<span>Harder</span></button>` : ''}
        <button class="primary soft-btn" data-a="back" style="height:80px">${ic('puzzle', 32)}<span>Games</span></button>
      </div></div></div>`;
  }
  function win(id, stars) {
    if (S.g.won) return;
    S.g.won = true;
    state.stats.games += 1;
    track('games', gameOf(id).name);
    save();
    render();
    award(stars || 1);
    say('Well done! You did it!');
  }

  // ---------------------------------------------------------------- Play hub
  A.PARENT.play = 'fun';
  A.VOICE.play = () => (S.playTab === 'lumi' ? 'Play a game with Lumi. You take turns.' : 'Pick a game to play with Lumi.');
  A.SCREENS.play = () => {
    // two shelves: puzzles you play by yourself, and turn-taking games you play with Lumi (teamgames.js)
    const withLumi = A.TG && A.TG.forAge().length;
    const tab = withLumi && S.playTab === 'lumi' ? 'lumi' : 'puzzles';
    const tabs = withLumi ? `<div class="seg play-tabs" role="tablist">
      <button class="seg-opt ${tab === 'puzzles' ? 'on' : ''}" data-a="playTab" data-v="puzzles" role="tab" aria-selected="${tab === 'puzzles'}">${ic('kPuzzle', 30)}<span>Puzzles</span></button>
      <button class="seg-opt ${tab === 'lumi' ? 'on' : ''}" data-a="playTab" data-v="lumi" role="tab" aria-selected="${tab === 'lumi'}">${ic('kDuo', 30)}<span>With Lumi</span></button></div>` : '';
    if (tab === 'lumi') {
      return `
<section class="screen" aria-label="Play with Lumi">
  ${A.srTitle('Play with Lumi')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.play())}</div>
    ${tabs}
  </div>
  <div class="game-grid tg-grid grow n${A.TG.forAge().length}">${A.tgHubGrid()}</div>
</section>`;
    }
    const games = D.GAMES.filter((g) => state.profile.games[g.id] !== false);
    const cards = games.map((g) => `<button class="game-card" data-a="gOpen" data-v="${g.id}" style="background:${g.tint}">
      <span class="game-ic" style="color:${g.ink}">${ic(g.icon, 92)}</span>
      <span class="game-name">${g.name}</span>
      <span class="game-kind" style="color:${g.ink}">${g.kind}</span>
      <span class="game-lvl" aria-label="${LEVEL_NAMES[levelOf(g.id)]}">${ic('star', 18).repeat(levelOf(g.id))}</span>
      ${state.profile.targets[g.skill] ? `<span class="tile-focus">${ic('star', 22)}</span>` : ''}
    </button>`).join('');
    return `
<section class="screen" aria-label="Play">
  ${A.srTitle('Play with Lumi')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn('Pick a game to play with Lumi.')}</div>
    ${tabs || '<span></span>'}
  </div>
  <div class="row gap24 grow">
    <div class="game-grid grow n${games.length} ${games.length > 6 ? 'many' : ''}">${cards || '<p class="muted">No games turned on. Ask a grown-up.</p>'}</div>
    <div class="panel scene" style="width:280px">
      <div class="floor" style="height:22%"></div>
      <div class="lumi-pos bob" style="left:20px;bottom:30px">${L.svg({ look: A.lookWith(), mood: 'excited', wave: true, size: 240 })}</div>
    </div>
  </div>
</section>`;
  };
  A.GUIDE.play = () => ({ sel: '.game-card', say: 'Tap a game.', delay: state.settings.guideDelay * 1000 + 3000 });

  // ---------------------------------------------------------------- Bubbles (calm)
  A.PARENT['g-bubbles'] = 'play';
  A.VOICE['g-bubbles'] = () => 'Pop the bubbles slowly. Listen to the sounds.';
  const BUB_NAMES = ['blue', 'purple', 'green', 'yellow', 'pink', 'mint'];
  const BUB_STRONG = ['#8EC5EC', '#BBA7EA', '#A6D98E', '#F7CF6A', '#F29BB8', '#8FD9CB'];
  A.SCREENS['g-bubbles'] = () => `
<section class="screen" aria-label="Bubbles">
  ${A.srTitle('Bubbles')}
  ${header('bubbles', 'Pop the bubbles slowly. Listen to the sounds.')}
  <div class="panel bubble-field grow" id="bubbleField">
    <div class="bubble-lumi">${L.svg({ look: A.lookWith(), mood: 'calm', size: 200 })}</div>
    <div class="bubble-count" aria-live="polite">${S.g.target != null ? `<span class="bub-target" style="background:${BUB_STRONG[S.g.target]}"></span><span>Pop ${BUB_NAMES[S.g.target]}</span>` : ic('bubbles', 26)}<span id="popCount">${S.g.popped}</span>${lv() > 1 ? `<span>/ ${lv() === 3 ? 12 : 20}</span>` : ''}</div>
  </div>
</section>`;
  A.AFTER['g-bubbles'] = () => {
    const field = document.getElementById('bubbleField');
    const g = S.g;
    // Hard: strong colours, and only the colour Lumi names counts
    const colours = g.target != null ? [0, 2, 3, 4].map((n) => [BUB_STRONG[n], n]) : [['#BFE3F7', 0], ['#DCD1F4', 1], ['#CFE8C4', 2], ['#FDE6B8', 3], ['#F8D3DE', 4], ['#CDEDE8', 5]];
    const slow = lv() === 1 ? 1.25 : lv() === 3 ? 0.8 : 1;
    const goal = lv() === 1 ? 15 : lv() === 2 ? 20 : 12;
    const spawn = () => {
      if (!document.body.contains(field) || field.querySelectorAll('.bub').length > 9) return;
      const [c, n] = pick(colours);
      const size = 80 + Math.random() * 60;
      const b = document.createElement('button');
      b.className = 'bub';
      b.setAttribute('aria-label', 'Bubble');
      b.dataset.note = n;
      b.style.cssText = `left:${6 + Math.random() * 80}%;width:${size}px;height:${size}px;background:radial-gradient(circle at 32% 30%, #fff 0 12%, ${c} 40%, ${c}cc 100%);animation-duration:${(11 + Math.random() * 5) * slow}s`;
      b.addEventListener('animationend', () => b.remove());
      field.appendChild(b);
    };
    for (let i = 0; i < 4; i++) A.later(spawn, i * 500);
    every(spawn, 1300 * slow);
    field.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.bub');
      if (!b || b.classList.contains('popped')) return;
      b.classList.add('popped');
      tone(NOTES[Number(b.dataset.note)], 0.9, 0.09);
      setTimeout(() => b.remove(), 320);
      if (g.target != null && Number(b.dataset.note) !== g.target) { tone(330, 0.15, 0.04); return; }
      S.g.popped += 1;
      const c = document.getElementById('popCount');
      if (c) c.textContent = S.g.popped;
      if (S.g.popped === goal && !S.g.rewarded) {
        S.g.rewarded = true;
        state.stats.games += 1;
        track('games', 'Bubbles');
        award(1);
        say('Lovely and calm.');
      }
    });
  };

  // ---------------------------------------------------------------- Match pairs (memory)
  const MATCH_FACES = ['sun', 'bus', 'teeth', 'cutlery', 'school', 'shoes', 'bottle', 'umbrella', 'lunchbox', 'buscard', 'jacket', 'towel'];
  function newMatch() {
    const pairs = { 1: 3, 2: 6, 3: 8 }[lv()] || 6;
    const faces = shuffle(MATCH_FACES).slice(0, pairs);
    return { cards: shuffle(faces.concat(faces)).map((k) => ({ k, open: false, done: false })), first: null, lock: false, won: false };
  }
  A.PARENT['g-match'] = 'play';
  A.VOICE['g-match'] = () => 'Find two cards that are the same.';
  A.SCREENS['g-match'] = () => {
    const g = S.g;
    const n = g.cards.length;
    const cols = n <= 6 ? 3 : 4;
    const cards = g.cards.map((c, i) => `<button class="mcard ${c.open || c.done ? 'open' : ''} ${c.done ? 'done' : ''}" data-a="mFlip" data-k="${i}" aria-label="${c.open || c.done ? c.k : 'Card ' + (i + 1)}">
      <span class="mback">${ic('sparkle', 54)}</span><span class="mface">${ic(c.k, n <= 6 ? 120 : 86)}</span></button>`).join('');
    return `
<section class="screen" aria-label="Match">
  ${A.srTitle('Match the pairs')}
  ${header('match', 'Find two cards that are the same.')}
  <div class="row gap24 grow">
    <div class="match-grid grow" style="grid-template-columns:repeat(${cols},1fr)">${cards}</div>
    <div class="col center" style="width:220px">${L.svg({ look: A.lookWith(), mood: 'happy', size: 200 })}${dots(g.cards.filter((c) => c.done).length / 2, n / 2, 'var(--feel)', 22)}</div>
  </div>
  ${winCard('match')}
</section>`;
  };
  A.ACTIONS.mFlip = (d) => {
    const g = S.g;
    const i = Number(d.k);
    const c = g.cards[i];
    if (g.lock || c.open || c.done) return;
    c.open = true;
    tone(523, 0.2, 0.06);
    if (g.first === null) { g.first = i; render(); return; }
    const a = g.cards[g.first];
    g.first = null;
    if (a.k === c.k) {
      a.done = c.done = true;
      a.open = c.open = false;
      render();
      tone(784, 0.4, 0.09);
      say('A match!');
      if (g.cards.every((x) => x.done)) later(() => win('match', lv() === 3 ? 2 : 1), 600);
    } else {
      g.lock = true;
      render();
      later(() => { a.open = c.open = false; g.lock = false; render(); }, 1000);
    }
  };

  // ---------------------------------------------------------------- Jigsaw
  function picture(id) {
    const look = A.lookWith();
    const lumi = (mood, x, y, size, extra) => `<g transform="translate(${x} ${y})">${L.svg({ look: Object.assign({}, look, extra || {}), mood, size })}</g>`;
    if (id === 'beach') {
      return `<rect width="600" height="400" fill="#BFE3F7"/><circle cx="500" cy="80" r="46" fill="#F4D35E"/>
        <rect y="190" width="600" height="80" fill="#8EB8E5"/><path d="M0 200 q30 -14 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#fff" stroke-width="6" fill="none"/>
        <rect y="260" width="600" height="140" fill="#F6D9A8"/><path d="M90 300 l40 -120 l40 120z" fill="#EF8A7A"/><path d="M130 180 v150" stroke="#8A6A4A" stroke-width="6"/>
        <circle cx="110" cy="350" r="16" fill="#F2A7BE"/><rect x="460" y="300" width="60" height="44" rx="6" fill="#F4D35E"/>
        ${lumi('happy', 250, 170, 210, { head: 'buckethat' })}`;
    }
    if (id === 'night') {
      return `<rect width="600" height="400" fill="#33406A"/><circle cx="110" cy="80" r="44" fill="#FFF1C2"/><circle cx="130" cy="70" r="40" fill="#33406A"/>
        ${[[260, 50], [380, 90], [520, 40], [460, 150], [200, 140], [560, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#FFE9A8"/>`).join('')}
        <ellipse cx="300" cy="420" rx="420" ry="150" fill="#46548A"/><rect x="440" y="220" width="110" height="90" fill="#C9A27E"/><path d="M430 225 l65 -55 l65 55z" fill="#8A6A4A"/><rect x="480" y="250" width="34" height="30" fill="#F4D35E"/>
        ${lumi('sleepy', 170, 190, 200, { head: 'none' })}`;
    }
    return `<rect width="600" height="400" fill="#BFE3F7"/><circle cx="90" cy="80" r="44" fill="#F4D35E"/>
      <ellipse cx="420" cy="90" rx="70" ry="26" fill="#fff"/><ellipse cx="470" cy="76" rx="40" ry="24" fill="#fff"/>
      <ellipse cx="300" cy="430" rx="420" ry="190" fill="#9CCB7A"/><rect x="480" y="170" width="22" height="90" fill="#A87B50"/><circle cx="490" cy="150" r="60" fill="#7FB069"/>
      ${[[80, 320, '#EF8A7A'], [140, 350, '#F4D35E'], [530, 330, '#B9A6E0']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="14" fill="${c}"/><circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join('')}
      <circle cx="420" cy="330" r="30" fill="#EF8A7A"/><path d="M392 330 h56 M420 302 v56" stroke="#fff" stroke-width="5"/>
      ${lumi('happy', 190, 160, 220)}`;
  }
  function newJigsaw(pic) {
    const [cols, rows] = { 1: [2, 2], 2: [3, 2], 3: [3, 3] }[lv()] || [3, 2];
    const n = cols * rows;
    return { pic: pic || pick(['park', 'beach', 'night']), cols, rows, placed: Array(n).fill(false), tray: shuffle([...Array(n).keys()]), sel: null, won: false, art: null };
  }
  function pieceSvg(g, k, w, h) {
    const pw = 600 / g.cols;
    const ph = 400 / g.rows;
    const x = (k % g.cols) * pw;
    const y = Math.floor(k / g.cols) * ph;
    return `<svg width="${w}" height="${h}" viewBox="${x} ${y} ${pw} ${ph}" preserveAspectRatio="none" aria-hidden="true">${g.art}</svg>`;
  }
  A.PARENT['g-jigsaw'] = 'play';
  A.VOICE['g-jigsaw'] = () => 'Tap a piece. Then tap where it goes.';
  A.SCREENS['g-jigsaw'] = () => {
    const g = S.g;
    if (!g.art) g.art = picture(g.pic);
    const BW = 600;
    const BH = 400;
    const sw = BW / g.cols;
    const sh = BH / g.rows;
    const slots = g.placed.map((on, k) => `<button class="jslot ${on ? 'on' : ''}" data-a="jSlot" data-k="${k}" style="width:${sw}px;height:${sh}px" aria-label="Space ${k + 1}${on ? ', filled' : ''}">${on ? pieceSvg(g, k, sw, sh) : ''}</button>`).join('');
    const tray = g.tray.filter((k) => !g.placed[k]).map((k) => `<button class="jpiece ${g.sel === k ? 'sel' : ''}" data-a="jPiece" data-k="${k}" aria-label="Piece">${pieceSvg(g, k, Math.round(sw * 0.62), Math.round(sh * 0.62))}</button>`).join('');
    const ghost = lv() < 3 ? `<svg class="jghost" width="${BW}" height="${BH}" viewBox="0 0 600 400" aria-hidden="true">${g.art}</svg>` : '';
    const pics = ['park', 'beach', 'night'].map((p) => `<button class="jpic ${g.pic === p ? 'on' : ''}" data-a="gAgain" data-v="jigsaw" data-pic="${p}" aria-label="${p} picture"><svg width="96" height="64" viewBox="0 0 600 400" aria-hidden="true">${picture(p)}</svg></button>`).join('');
    return `
<section class="screen" aria-label="Jigsaw">
  ${A.srTitle('Jigsaw')}
  ${header('jigsaw', 'Tap a piece. Then tap where it goes.')}
  <div class="row gap24 grow">
    <div class="col gap12">
      <div class="jboard" style="width:${BW}px;height:${BH}px;grid-template-columns:repeat(${g.cols},1fr)">${ghost}${slots}</div>
      <div class="row gap12">${pics}</div>
    </div>
    <div class="jtray grow">${tray || ''}</div>
  </div>
  ${winCard('jigsaw')}
</section>`;
  };
  A.GUIDE['g-jigsaw'] = () => {
    const g = S.g;
    if (!g || g.won) return null;
    if (g.sel !== null) return { sel: `[data-a="jSlot"][data-k="${g.sel}"]`, say: 'Tap where it goes.', delay: lv() === 1 ? 2500 : undefined };
    return { sel: '.jpiece', say: 'Tap a piece.' };
  };
  Object.assign(A.ACTIONS, {
    jPiece: (d) => { S.g.sel = Number(d.k); tone(600, 0.15, 0.05); render(); },
    jSlot: (d, el) => {
      const g = S.g;
      const k = Number(d.k);
      if (g.placed[k]) return;
      if (g.sel === null) { say('Tap a piece first.'); return; }
      if (g.sel === k) {
        g.placed[k] = true;
        g.sel = null;
        tone(NOTES[k % NOTES.length], 0.4, 0.09);
        render();
        if (g.placed.every(Boolean)) later(() => win('jigsaw', lv() === 3 ? 2 : 1), 500);
      } else {
        track('tries', 'jigsaw', { quiet: true });
        el.classList.remove('wiggle-once');
        void el.offsetWidth;
        el.classList.add('wiggle-once');
        say('Hmm, try another space.');
      }
    }
  });

  // ---------------------------------------------------------------- Sort it (everyday learning)
  function newSort() {
    const set = D.SORT_SETS[lv()] || D.SORT_SETS[2];
    return { set, queue: shuffle(set.items), i: 0, wrong: 0, won: false };
  }
  A.PARENT['g-sort'] = 'play';
  A.VOICE['g-sort'] = () => { const it = S.g.queue[S.g.i]; return it ? `Where does the ${it[1].toLowerCase()} go?` : ''; };
  A.SCREENS['g-sort'] = () => {
    const g = S.g;
    const it = g.queue[g.i];
    const bins = g.set.bins.map((b) => `<button class="bin" data-a="sBin" data-v="${b.id}" aria-label="${b.label}">
      <span class="bin-ic">${b.emoji ? `<span class="emoji" style="font-size:64px">${b.emoji}</span>` : ic(b.icon, 64)}</span><span class="bin-label">${b.label}</span></button>`).join('');
    return `
<section class="screen" aria-label="Sort it">
  ${A.srTitle('Sort it')}
  ${header('sort', it ? `Where does the ${it[1].toLowerCase()} go?` : 'All sorted!')}
  <div class="col grow gap24">
    <div class="row center gap40 grow">
      <div class="col center">${L.svg({ look: A.lookWith(), mood: 'happy', size: 170 })}</div>
      ${it ? `<div class="sort-item" aria-live="polite"><span class="emoji" style="font-size:150px">${it[0]}</span><span class="sort-name">${esc(it[1])}</span></div>` : ''}
      <div style="width:170px">${dots(g.i, g.queue.length, 'var(--q)', 16)}</div>
    </div>
    <div class="bins n${g.set.bins.length}">${bins}</div>
  </div>
  ${winCard('sort')}
</section>`;
  };
  A.GUIDE['g-sort'] = () => {
    const g = S.g;
    const it = g && !g.won && g.queue[g.i];
    if (!it) return null;
    return { sel: `[data-a="sBin"][data-v="${it[2]}"]`, say: `The ${it[1].toLowerCase()} goes here.`, quiet: !g.wrong, delay: g.wrong ? 400 : state.settings.guideDelay * 1000 + 6000 };
  };
  A.ACTIONS.sBin = (d, el) => {
    const g = S.g;
    const it = g.queue[g.i];
    if (!it) return;
    if (d.v === it[2]) {
      if (!g.wrong) track('correct', 'sort', { quiet: true });
      tone(NOTES[g.i % NOTES.length], 0.4, 0.1);
      say(pick(['Yes!', 'Good sorting!', 'That is right!']));
      g.i += 1;
      g.wrong = 0;
      render();
      if (g.i >= g.queue.length) later(() => win('sort', lv() === 3 ? 2 : 1), 400);
      else later(() => say(A.VOICE['g-sort']()), 900);
    } else {
      if (!g.wrong) track('tries', 'sort', { quiet: true });
      g.wrong += 1;
      el.classList.remove('wiggle-once');
      void el.offsetWidth;
      el.classList.add('wiggle-once');
      say(g.wrong > 1 ? `Look. The ${it[1].toLowerCase()} goes here.` : 'Hmm, try another one.');
      A.applyGuide();
      if (g.wrong > 1) { A.hintNow(); return 'keep'; }
    }
  };

  // ---------------------------------------------------------------- What comes next? (patterns)
  const SHAPES = {
    circle: '<circle cx="30" cy="30" r="24"/>',
    square: '<rect x="8" y="8" width="44" height="44" rx="8"/>',
    triangle: '<path d="M30 6 L55 52 H5 Z"/>',
    star: '<path d="M30 4 37 22 56 23 41 35 46 54 30 43 14 54 19 35 4 23 23 22Z"/>',
    heart: '<path d="M30 54C8 38 4 22 15 14c6-4 12-2 15 4 3-6 9-8 15-4 11 8 7 24-15 40z"/>'
  };
  const COLS = ['#EF8A7A', '#8EB8E5', '#F4D35E', '#9CCB7A', '#B9A6E0'];
  const shapeSvg = (t, size) => `<svg width="${size}" height="${size}" viewBox="0 0 60 60" aria-hidden="true"><g fill="${t.c}" stroke="#3B2F2F" stroke-width="2.5" stroke-linejoin="round">${SHAPES[t.s]}</g></svg>`;
  const same = (a, b) => a.s === b.s && a.c === b.c;
  function patternRound() {
    const lvl = lv();
    const shapes = shuffle(Object.keys(SHAPES));
    const cols = shuffle(COLS);
    const unit = [{ s: shapes[0], c: cols[0] }, { s: shapes[1], c: cols[1] }];
    let rule;
    if (lvl === 1) rule = [0, 1];
    else if (lvl === 2) { unit.push({ s: shapes[2], c: cols[2] }); rule = [0, 1, 2]; }
    else rule = pick([[0, 0, 1, 1], [0, 1, 1], [0, 0, 1]]);
    const len = lvl === 1 ? 5 : lvl === 2 ? 7 : 8;
    const seq = [];
    for (let i = 0; i < len; i++) seq.push(unit[rule[i % rule.length]]);
    const answer = seq.pop();
    const opts = [answer];
    const pool = unit.concat([{ s: shapes[3], c: cols[3] }, { s: shapes[4], c: cols[4] }]);
    for (const p of shuffle(pool)) if (opts.length < (lvl === 1 ? 2 : lvl === 2 ? 3 : 4) && !opts.some((o) => same(o, p))) opts.push(p);
    return { seq, answer, opts: shuffle(opts), solved: false };
  }
  function newPattern() { return { round: 0, total: 5, r: patternRound(), won: false }; }
  A.PARENT['g-pattern'] = 'play';
  A.VOICE['g-pattern'] = () => 'What comes next?';
  A.SCREENS['g-pattern'] = () => {
    const g = S.g;
    const r = g.r;
    const size = r.seq.length > 6 ? 84 : 104;
    const row = r.seq.map((t) => `<span class="pat-cell">${shapeSvg(t, size)}</span>`).join('') +
      `<span class="pat-cell q ${r.solved ? 'solved' : ''}">${r.solved ? shapeSvg(r.answer, size) : '<span class="qmark">?</span>'}</span>`;
    const opts = r.opts.map((t, k) => `<button class="pat-opt" data-a="pOpt" data-k="${k}" aria-label="${t.s}">${shapeSvg(t, 110)}</button>`).join('');
    return `
<section class="screen" aria-label="What comes next?">
  ${A.srTitle('What comes next?')}
  ${header('pattern', 'What comes next?')}
  <div class="col grow gap24">
    <div class="panel pat-row">${row}</div>
    <div class="row between grow">
      <div style="width:180px">${L.svg({ look: A.lookWith(), mood: r.solved ? 'excited' : 'happy', size: 170 })}</div>
      <div class="row gap24">${opts}</div>
      <div style="width:180px" class="col center">${dots(g.round, g.total, '#C2577A', 18)}</div>
    </div>
  </div>
  ${winCard('pattern')}
</section>`;
  };
  A.ACTIONS.pOpt = (d, el) => {
    const g = S.g;
    const r = g.r;
    if (r.solved) return;
    if (same(r.opts[Number(d.k)], r.answer)) {
      if (!r.missed) track('correct', 'pattern', { quiet: true });
      r.solved = true;
      tone(784, 0.4, 0.1);
      say('Yes!');
      render();
      later(() => {
        g.round += 1;
        if (g.round >= g.total) { win('pattern', lv() === 3 ? 2 : 1); return; }
        g.r = patternRound();
        render();
      }, 1100);
    } else {
      if (!r.missed) track('tries', 'pattern', { quiet: true });
      r.missed = true;
      el.classList.remove('wiggle-once');
      void el.offsetWidth;
      el.classList.add('wiggle-once');
      say('Look at the pattern again.');
    }
  };

  // ---------------------------------------------------------------- open / restart
  const MAKERS = (A.GAME_MAKERS = { bubbles: () => ({ popped: 0, target: lv() === 3 ? pick([0, 2, 3, 4]) : null }), match: newMatch, jigsaw: newJigsaw, sort: newSort, pattern: newPattern });
  // shared with games-more.js
  A.GAME = { header, winCard, win, lv, shuffle, NOTES, gameOf, LEVEL_NAMES, levelPicker, levelOf };
  // games that need a kick after they are drawn (e.g. Lumi plays the tune first) set A.GAME_START[id]
  A.GAME_START = A.GAME_START || {};
  const started = (id) => { if (A.GAME_START[id]) A.GAME_START[id](); };
  Object.assign(A.ACTIONS, {
    gOpen: (d) => { S.gLevel = levelOf(d.v); S.g = MAKERS[d.v](); S.gId = d.v; go('g-' + d.v); started(d.v); },
    // change how hard the game is; it starts again at the new level
    gLevel: (d, el) => {
      const id = el.dataset.id;
      const n = Number(d.v);
      S.gLevel = n;
      state.gameLevels = state.gameLevels || {};
      state.gameLevels[id] = n;
      save();
      S.g = id === 'jigsaw' ? newJigsaw(S.g && S.g.pic) : MAKERS[id]();
      S.gId = id;
      A.clearTimers();
      render();
      started(id);
      tone(n === 1 ? 523 : n === 2 ? 659 : 784, 0.2, 0.07);
      say(LEVEL_NAMES[n] + '.');
    },
    playTab: (d) => { S.playTab = d.v; render(); say(A.VOICE.play()); },
    gAgain: (d, el) => {
      S.g = d.v === 'jigsaw' ? newJigsaw(el.dataset.pic || null) : MAKERS[d.v]();
      S.gId = d.v;
      A.clearTimers();
      render();
      started(d.v);
      const v = A.VOICE['g-' + d.v];
      if (v) say(v());
    }
  });
})();
