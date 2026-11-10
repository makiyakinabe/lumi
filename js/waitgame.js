/*
  waitgame.js
  "Waiting game": gentle practice for waiting, one of the hardest everyday skills.
  The child picks something to wait for (the bus, food cooking, a queue). A big timer ring empties while the
  scene moves on (the bus drives closer, the pot steams, the queue gets shorter) and Lumi waits calmly with
  them, saying what helps. While waiting the child can breathe, count, squeeze, or look around (find things
  in the picture). "It's too hard" is always there: the first time Lumi helps wait just 5 more seconds, the
  second time the wait ends kindly. Nothing is ever lost.
  The wait starts short (Easy 10 s, Medium 20 s, Challenge 30 s) and grows by 5 seconds each time the child
  waits all the way, a little at a time. Grown-ups see the waits in Progress.
  Games hub (Fun › Games › Puzzles) and in D.GAMES, so grown-ups can switch it off in Activities.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, award, track, render, go } = A;
  const LP = window.LP;
  const pic = (k, s) => (window.lumiPic ? window.lumiPic(k, s) : '') || '';

  D.GAMES.push({ id: 'wait', name: 'Waiting game', icon: 'hourglass', kind: 'Calm practice', tint: '#E3F1FA', ink: '#3E6E9A', skill: 'emotions' });

  const SCENES = {
    bus: { name: 'Wait for the bus', short: 'the bus', art: () => pic('\u{1F68C}', 110), done: 'The bus is here! Let’s get on.', sky: '#CFE8F7', spy: [['\u{1F436}', 'the dog', 560, 300], ['\u{1F388}', 'the balloon', 120, 70], ['⭐', 'the star', 470, 40]] },
    cook: { name: 'Wait for food to cook', short: 'the food', art: () => pic('\u{1F373}', 110), done: 'Ding! The noodles are ready. Yum!', sky: '#FFF4E0', spy: [['\u{1F34E}', 'the apple', 600, 250], ['\u{1F36A}', 'the biscuit', 90, 250], ['\u{1F944}', 'the spoon', 380, 60]] },
    queue: { name: 'Wait in a queue', short: 'your turn', art: () => pic('\u{1F366}', 110), done: 'It’s your turn! One ice cream, please.', sky: '#FDE7EE', spy: [['\u{1F9F8}', 'the teddy', 600, 120], ['\u{1F388}', 'the balloon', 60, 60], ['⭐', 'the star', 330, 40]] }
  };
  const ACTS = [
    { id: 'breathe', label: 'Breathe', icon: 'kCalm', line: 'Breathe in slowly... and out. Waiting feels easier.' },
    { id: 'count', label: 'Count', icon: 'kCount', line: 'Let’s count together.' },
    { id: 'squeeze', label: 'Squeeze', icon: 'kSqueeze', line: 'Squeeze your hands tight... and let go.' },
    { id: 'look', label: 'Look around', icon: 'eye', line: 'Let’s look around while we wait.' }
  ];
  const LUMI_LINES = ['Waiting can be hard. I’m breathing slowly.', 'I can wait. I keep my body calm.', 'We are getting closer.', 'Good waiting! I’m proud of us.', 'Almost there. Just a little more.'];

  // how long to wait: grows a little each time the child waits all the way
  const W = () => state.waitPractice || (state.waitPractice = { len: {}, best: {}, used: {}, times: 0 });
  const base = () => ({ 1: 10, 2: 20, 3: 30 }[(state.gameLevels || {}).wait || A.level()] || 20);
  const lenFor = (k) => Math.max(5, Math.round(W().len[k] || base()));

  // ---------------------------------------------------------------- drawing
  function sceneSvg(k) {
    const sc = SCENES[k];
    let s = `<rect width="700" height="520" fill="${sc.sky}"/>`;
    if (k === 'bus') {
      s += `<circle cx="600" cy="80" r="40" fill="#FFD84D" opacity=".9"/>${[[90, 110], [330, 70]].map(([x, y]) => `<g opacity=".9"><ellipse cx="${x}" cy="${y}" rx="60" ry="20" fill="#fff"/><ellipse cx="${x + 30}" cy="${y - 12}" rx="34" ry="18" fill="#fff"/></g>`).join('')}
        <rect y="300" width="700" height="220" fill="#9CCB7A"/><rect y="352" width="700" height="96" fill="#8A929C"/><path d="M0 400h700" stroke="#fff" stroke-width="6" stroke-dasharray="40 30"/>
        ${LP.vol('<rect x="520" y="196" width="12" height="164" rx="5"/>', '#9AA6B2')}${LP.vol('<rect x="462" y="132" width="128" height="74" rx="14"/>', '#3E8E5E', { shade: 'v' })}
        <text x="526" y="164" text-anchor="middle" font-weight="900" font-size="20" letter-spacing="1" fill="#fff">BUS STOP</text><text x="526" y="190" text-anchor="middle" font-weight="800" font-size="17" fill="#DFF3E6">83139</text>`;
    } else if (k === 'cook') {
      s += `<rect y="300" width="700" height="220" fill="#E8D6BC"/>${LP.vol('<rect x="40" y="250" width="620" height="70" rx="12"/>', '#F2F4F6', { shade: 'v' })}
        ${LP.vol('<rect x="220" y="230" width="260" height="30" rx="8"/>', '#3E4A5A')}${[270, 430].map((x) => `<ellipse cx="${x}" cy="236" rx="40" ry="8" fill="#20262E"/>`).join('')}
        ${LP.vol('<rect x="60" y="70" width="140" height="110" rx="12"/>', '#FFFFFF')}<rect x="76" y="86" width="108" height="78" rx="6" fill="#CFE6F5"/>
        ${LP.vol('<rect x="520" y="110" width="120" height="60" rx="10"/>', '#2B2F4A')}`;
    } else {
      s += `<rect y="320" width="700" height="200" fill="#EAD9E3"/>${LP.vol('<rect x="20" y="60" width="300" height="70" rx="14"/>', '#E58BA6', { shade: 'v' })}
        <text x="170" y="106" text-anchor="middle" font-weight="900" font-size="30" fill="#fff" letter-spacing="1">ICE CREAM</text>
`;
    }
    return `<svg class="wg-bg" viewBox="0 0 700 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
  }
  // the moving parts, placed from the progress p (0 = just started, 1 = done)
  function movers(k, p, g) {
    if (k === 'bus') {
      const x = -180 + p * 470;
      const sz = 130 + p * 150;
      return `<div class="wg-mover" id="wgBus" style="left:${x}px;top:${400 - sz * 0.8}px;width:${sz}px;height:${sz}px">${pic('\u{1F68C}', '100%')}</div>`;
    }
    if (k === 'cook') {
      const steam = [0, 1, 2].map((i) => `<span class="wg-steam" style="left:${300 + i * 40}px;opacity:${Math.min(1, p * 1.6 - i * 0.3)}"></span>`).join('');
      return `<div class="wg-mover" style="left:270px;top:120px;width:160px;height:160px">${g.phase === 'done' ? A.foodSvg('noodles', 160, 128) : pic('\u{1F373}', '100%')}</div>${steam}
        <div class="wg-clock" id="wgClock" style="left:526px;top:120px">${Math.max(0, Math.ceil(g.left))}</div>`;
    }
    const ahead = g.phase === 'done' ? 0 : Math.max(0, Math.ceil((1 - p) * 3 - 0.001));
    let h = `<div class="wg-mover" style="left:110px;top:120px;width:120px;height:240px">${A.person({ who: 'aunty', h: 240, pose: 'give', item: 'cup', top: '#F7B6CD', apron: '#E58BA6' })}</div>`;
    // the counter in front of the ice cream aunty
    h += `<div class="wg-mover" style="left:20px;top:230px;width:300px;height:110px"><svg viewBox="20 230 300 110" width="100%" height="100%" aria-hidden="true">${LP.vol('<rect x="20" y="230" width="300" height="110" rx="12"/>', '#FFF8EC', { shade: 'v' })}<rect x="20" y="230" width="300" height="14" fill="#E58BA6"/></svg></div>`;
    for (let i = 0; i < ahead; i++) h += `<div class="wg-mover wg-person" style="left:${330 + i * 95}px;top:260px;width:100px;height:200px">${A.person({ who: ['woman', 'boy', 'grandpa'][i], h: 200, flip: true })}</div>`;
    return h;
  }
  function lumiSpot(k, p, g) {
    if (k === 'queue') { const ahead = g.phase === 'done' ? 0 : Math.max(0, Math.ceil((1 - p) * 3 - 0.001)); return { x: 330 + ahead * 95, y: 300 }; }
    if (k === 'bus') return { x: 560, y: 250 };
    return { x: 40, y: 300 };
  }
  function ring(g) {
    const r = 74;
    const c = 2 * Math.PI * r;
    const frac = g.total ? Math.max(0, g.left / g.total) : 1;
    return `<svg class="wg-ring" viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="${Math.ceil(g.left)} seconds left"><circle cx="90" cy="90" r="${r}" fill="#fff" stroke="#E6EEF5" stroke-width="18"/>
      <circle id="wgArc" cx="90" cy="90" r="${r}" fill="none" stroke="#5B8FD9" stroke-width="18" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}" transform="rotate(-90 90 90)"/>
      <text id="wgSecs" x="90" y="104" text-anchor="middle" font-weight="900" font-size="44" fill="#3B2F2F">${Math.max(0, Math.ceil(g.left))}</text></svg>`;
  }

  // ---------------------------------------------------------------- the screen
  A.PARENT['g-wait'] = 'play';
  A.VOICE['g-wait'] = () => {
    const g = S.wg || {};
    if (!g.scene) return 'What should we practise waiting for? Pick one.';
    if (g.phase === 'done') return g.early ? `You waited ${g.waited} seconds. That is still good practice.` : `You waited ${g.waited} seconds! ${SCENES[g.scene].done}`;
    return `Let's wait for ${SCENES[g.scene].short} together. You can breathe, count, squeeze, or look around while we wait.`;
  };
  A.SCREENS['g-wait'] = () => {
    const g = S.wg || (S.wg = {});
    const head = `<div class="row between" style="height:60px;flex:none"><div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE['g-wait']())}<span class="game-chip" style="background:#E3F1FA;color:#3E6E9A">${ic('hourglass', 30)}<span>Waiting game</span></span></div>${!g.scene && A.GAME ? A.GAME.levelPicker('wait') : '<span></span>'}</div>`;
    if (!g.scene) {
      const cards = Object.keys(SCENES).map((k) => `<button class="game-card wg-pick" data-a="wgPick" data-v="${k}" style="background:${SCENES[k].sky}">
          <span class="wg-pick-art">${SCENES[k].art()}</span><span class="game-name">${esc(SCENES[k].name)}</span>
          <span class="game-kind">${W().best[k] ? `Longest wait: ${W().best[k]} seconds` : `${lenFor(k)} seconds`}</span></button>`).join('');
      return `<section class="screen" aria-label="Waiting game">${A.srTitle('Waiting game')}${head}
        <div class="wg-intro">${L.svg({ look: A.lookWith(), mood: 'calm', size: 110 })}<p>Waiting is hard for everyone. Let's practise together. Lumi will wait with you.</p></div>
        <div class="game-grid n3 grow">${cards}</div></section>`;
    }
    const k = g.scene;
    const p = g.total ? 1 - g.left / g.total : 0;
    const spot = lumiSpot(k, p, g);
    const spies = g.act === 'look' ? SCENES[k].spy.map(([e, label, x, y], i) => `<button class="wg-spy ${g.found.includes(i) ? 'found' : ''}" data-a="wgSpy" data-v="${i}" style="left:${x}px;top:${y}px" aria-label="${esc(label)}">${pic(e, 54)}</button>`).join('') : '';
    const done = g.phase === 'done';
    const side = done
      ? `<div class="wg-side done"><div class="wg-done-title">${ic('star', 36)}<span>${g.early ? 'Good try!' : 'You waited!'}</span></div>
          <p class="wg-done-sub">${g.waited} seconds${!g.early && g.best ? ' · your longest!' : ''}</p>
          <button class="primary" data-a="wgAgain" style="height:80px">${ic('restart', 30)}<span>Again</span></button>
          <button class="primary soft-btn" data-a="wgOther" style="height:80px">${ic('hourglass', 30)}<span>Something else</span></button></div>`
      : `<div class="wg-side">${ring(g)}
          <div class="wg-acts-title">While we wait</div>
          <div class="wg-acts">${ACTS.map((a) => `<button class="wg-act ${g.act === a.id ? 'on' : ''}" data-a="wgAct" data-v="${a.id}">${ic(a.icon, 40)}<span>${a.label}</span></button>`).join('')}</div>
          <button class="wg-hard" data-a="wgHard">${ic('stop', 26)}<span>It's too hard</span></button></div>`;
    let extra = '';
    if (!done && g.act === 'breathe') extra = '<div class="wg-breath"></div>';
    if (!done && g.act === 'count') extra = `<div class="wg-count" id="wgCount">${g.countN || 1}</div>`;
    if (!done && g.act === 'squeeze') extra = `<div class="wg-squeeze">${ic('kSqueeze', 120)}</div>`;
    if (!done && g.act === 'look') extra = `<div class="wg-spy-note">${g.found.length < 3 ? `Can you find ${esc(SCENES[k].spy.find((s, i) => !g.found.includes(i))[1])}?` : 'You found them all!'}</div>`;
    return `<section class="screen" aria-label="${esc(SCENES[k].name)}">${A.srTitle(SCENES[k].name)}${head}
      <div class="row gap16 grow" style="min-height:0">
        <div class="panel wg-scene">${sceneSvg(k)}<div id="wgMovers">${movers(k, p, g)}</div>
          <div class="wg-lumi ${done ? 'hop' : ''}" style="left:${spot.x}px;top:${spot.y}px">${L.svg({ look: A.lookWith(), mood: done ? 'excited' : g.hard ? 'calm' : 'calm', size: 170, wave: done })}</div>
          ${g.lumiLine && !done ? `<div class="wg-bubble">${esc(g.lumiLine)}</div>` : ''}${extra}${spies}</div>
        ${side}
      </div></section>`;
  };
  A.GUIDE['g-wait'] = () => {
    const g = S.wg || {};
    if (!g.scene) return { sel: '.wg-pick', say: 'Pick something to wait for.' };
    if (g.phase === 'done') return { sel: '[data-a="wgAgain"]', say: 'Play again?', delay: 10000 };
    if (g.act === 'look' && g.found.length < 3) return { sel: '.wg-spy:not(.found)', say: 'Find it in the picture.', delay: 9000 };
    return { sel: '.wg-act', say: 'You can breathe, count, squeeze or look around.', delay: 12000 };
  };

  // ---------------------------------------------------------------- the waiting itself
  function begin(k) {
    const total = lenFor(k);
    S.wg = { scene: k, phase: 'wait', total, left: total, act: null, found: [], hard: 0, lumiLine: '', countN: 0, sinceLine: 0, waited: 0 };
    render();
    say(`Let's wait for ${SCENES[k].short}. Lumi will wait with you.`);
    const g = S.wg;
    A.every(() => tick(g), 250);
  }
  function tick(g) {
    if (S.wg !== g || g.phase !== 'wait' || S.screen !== 'g-wait') return;
    g.left = Math.max(0, g.left - 0.25);
    g.sinceLine += 0.25;
    if (g.act === 'count' && Math.abs(g.left * 4 % 4) < 0.01) {
      g.countN = (g.countN % 10) + 1;
      const c = document.getElementById('wgCount');
      if (c) c.textContent = g.countN;
      say(String(g.countN));
    }
    if (g.left <= 0) { finish(g, false); return; }
    // Lumi says something calm now and then (not while counting)
    if (g.sinceLine >= 9 && g.act !== 'count' && g.left > 3) {
      g.sinceLine = 0;
      g.lumiLine = LUMI_LINES[Math.floor(Math.random() * LUMI_LINES.length)];
      render();
      say(g.lumiLine);
      return;
    }
    // move the scene without redrawing everything
    const p = 1 - g.left / g.total;
    const arc = document.getElementById('wgArc');
    if (arc) { const c = 2 * Math.PI * 74; arc.setAttribute('stroke-dashoffset', String(c * (1 - g.left / g.total))); }
    const sec = document.getElementById('wgSecs');
    if (sec) sec.textContent = String(Math.ceil(g.left));
    const m = document.getElementById('wgMovers');
    if (m) {
      const before = m.querySelectorAll('.wg-person').length;
      const html = movers(g.scene, p, g);
      if (g.scene !== 'queue' || before !== (html.match(/wg-person/g) || []).length) {
        m.innerHTML = html;
        if (g.scene === 'queue') { render(); say('The line moved. We are closer.'); }
      }
    }
  }
  function finish(g, early) {
    g.phase = 'done';
    g.early = early;
    g.waited = Math.round(g.total - g.left);
    const w = W();
    w.times += 1;
    if (!early) {
      g.best = g.waited > (w.best[g.scene] || 0);
      if (g.best) w.best[g.scene] = g.waited;
      w.len[g.scene] = Math.min(base() * 4, lenFor(g.scene) + 5);
    } else {
      w.len[g.scene] = Math.max(Math.round(base() / 2), lenFor(g.scene) - 5);
    }
    const day = state.log[A.dateKey()] || (state.log[A.dateKey()] = {});
    day.waitSecs = (day.waitSecs || 0) + g.waited;
    state.stats.waits = (state.stats.waits || 0) + 1;
    track('waits', `${SCENES[g.scene].short}, ${g.waited} seconds${early ? ' (stopped early)' : ''}`);
    save();
    tone(784, 0.25, 0.08);
    setTimeout(() => tone(988, 0.35, 0.08), 150);
    render();
    award(early ? 1 : 2);
    say(early ? `You waited ${g.waited} seconds. That is still good practice. Next time we can try again.` : `You waited ${g.waited} seconds! ${SCENES[g.scene].done}`);
  }

  // the Games hub opens games with gOpen; this one is ours
  const gOpen = A.ACTIONS.gOpen;
  A.ACTIONS.gOpen = (d, el) => { if (d.v === 'wait') { S.wg = {}; if (A.GAME) S.gLevel = A.GAME.levelOf('wait'); go('g-wait'); return undefined; } return gOpen(d, el); };
  // Easy / Medium / Hard start the waits at 10, 20 or 30 seconds (they still grow as the child gets better)
  if (A.GAME_MAKERS) A.GAME_MAKERS.wait = () => { W().len = {}; S.wg = {}; return {}; };
  Object.assign(A.ACTIONS, {
    wgPick: (d) => begin(d.v),
    wgAct: (d) => {
      const g = S.wg;
      if (!g || g.phase !== 'wait') return;
      const a = ACTS.find((x) => x.id === d.v);
      g.act = g.act === a.id ? null : a.id;
      g.countN = 0;
      g.lumiLine = '';
      g.sinceLine = 0;
      const w = W();
      w.used[a.id] = (w.used[a.id] || 0) + 1;
      render();
      if (g.act) say(a.id === 'look' ? `${a.line} Can you find ${SCENES[g.scene].spy.find((s, i) => !g.found.includes(i))[1]}?` : a.line);
    },
    wgSpy: (d, el) => {
      const g = S.wg;
      const i = Number(d.v);
      if (!g || g.found.includes(i)) return;
      g.found.push(i);
      tone(880, 0.15, 0.06);
      render();
      const next = SCENES[g.scene].spy.find((s, j) => !g.found.includes(j));
      say(next ? `You found it! Now find ${next[1]}.` : 'You found them all!');
    },
    wgHard: () => {
      const g = S.wg;
      if (!g || g.phase !== 'wait') return;
      g.hard += 1;
      if (g.hard === 1 && g.left > 5) {
        g.left = 5;
        g.total = Math.max(g.total, 5);
        g.act = 'breathe';
        g.lumiLine = 'That’s okay. Let’s breathe and wait just 5 more seconds.';
        render();
        say(g.lumiLine);
        return;
      }
      finish(g, true);
    },
    wgAgain: () => { const k = S.wg && S.wg.scene; if (k) begin(k); },
    wgOther: () => { S.wg = {}; render(); say(A.VOICE['g-wait']()); }
  });
})();
