/*
  teamgames.js
  Two-player games for every age group. The same game is played:
  - in Fun > Games > "With Lumi": the child plays with Lumi (Lumi takes its own turns), or
  - in Together mode: the child plays with their grown-up, sibling or friend on one tablet.
  The second player is called "other" in the code: Lumi in solo play, the partner in Together.

  Each game lives in its own file (tg-little.js, tg-primary.js, tg-teen.js) and registers itself with
  A.TG.register({...}). This file gives every game the same frame: a header with whose turn it is,
  a big stage, an optional bottom bar, a friendly finish card, and the hub cards.

  A game definition:
    id, name, icon, tint, ink, kind ('Turn-taking', 'Calm'...), sub (one line for grown-ups),
    ages: ['little'] / ['primary'] / ['teen'] (where the game shows up), skill (a target skill key)
    init(g)            set up the game state on g (g.turn, g.round, g.total are ready to use)
    voice(g)           what Lumi says on this screen (read out by the speaker button)
    stage(g)           the main picture area (HTML)
    bar(g)             optional bottom bar (HTML)
    guide(g)           optional { sel, say } for the guide hand
    tap(g, k, el, d)   buttons inside the game use data-a="tg" data-k="..." (and any data-v)
    after(g, box)      optional: wire up drags or holds after each draw
    lumiTurn(g)        optional: called when it's Lumi's turn in solo play (use A.TG.later to act)
  Helpers for games are on A.TG (see below). No timers that rush, no losing.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, award, track, render, go, later } = A;

  const DEFS = {};
  const ORDER = [];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const emo = (e, size) => (window.lumiPic && window.lumiPic(e, size)) || `<span class="emoji" style="font-size:${size}px">${e}</span>`;

  // ---------------------------------------------------------------- who is playing
  const solo = () => S.appMode !== 'together';
  const partnerName = () => state.profile.partner || 'Mum';
  const partnerEmoji = () => (D.PARTNERS.find((p) => p[0] === partnerName()) || ['', '🧑'])[1];
  const childName = () => state.childName || 'You';
  const otherName = () => (solo() ? 'Lumi' : partnerName());
  const nameOf = (who) => (who === 'child' ? childName() : otherName());
  function avatar(who, size) {
    if (who === 'child') {
      return state.childPhoto
        ? `<span class="tg-av photo" style="width:${size}px;height:${size}px"><img src="${state.childPhoto}" alt=""></span>`
        : `<span class="tg-av child" style="width:${size}px;height:${size}px">${ic('me', Math.round(size * 0.8))}</span>`;
    }
    if (solo()) return `<span class="tg-av lumi" style="width:${size}px;height:${size}px">${L.svg({ look: A.lookWith(), mood: 'happy', size: Math.round(size * 1.05) })}</span>`;
    const ph = state.profile.partnerPhoto;
    return ph
      ? `<span class="tg-av photo" style="width:${size}px;height:${size}px"><img src="${ph}" alt=""></span>`
      : `<span class="tg-av partner" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.62)}px">${partnerEmoji()}</span>`;
  }
  // "Your turn" / "Mum's turn" / "Lumi's turn"
  const turnText = (who) => (who === 'child' ? (state.childName ? `${state.childName}'s turn` : 'Your turn') : `${otherName()}'s turn`);

  // ---------------------------------------------------------------- the frame
  const cur = () => S.tg;
  const def = () => S.tg && DEFS[S.tg.id];
  function pairHtml(g) {
    const on = (w) => (g && !g.won && g.turn === w ? 'on' : '');
    return `<div class="pair tg-pair">
      <span class="pair-who ${on('child')}">${avatar('child', 40)}<span>${esc(childName())}</span></span>
      <span class="pair-and">${ic('heart', 18)}</span>
      <span class="pair-who ${on('other')}">${avatar('other', 40)}<span>${esc(otherName())}</span></span>
    </div>`;
  }
  function rounds(g) {
    if (!g.total) return '';
    let h = '';
    for (let i = 0; i < g.total; i++) h += `<span class="tg-round ${i < g.round ? 'done' : ''}"></span>`;
    return `<span class="tg-rounds" role="img" aria-label="${g.round} of ${g.total}">${h}</span>`;
  }
  function winVeil(g) {
    if (!g.won) return '';
    const together = !solo();
    return `<div class="win-veil"><div class="win-card">
      <div class="row gap24 center">${avatar('child', 110)}<span class="tg-win-heart">${ic('kHeart', 64)}</span>${avatar('other', 110)}</div>
      <div class="win-title">${ic('star', 40)}<span>${esc(g.winText || (together ? 'Great teamwork!' : 'Well done!'))}</span>${ic('star', 40)}</div>
      ${g.winSub ? `<div class="tg-win-sub">${g.winSub}</div>` : ''}
      <div class="row gap16">
        <button class="primary" data-a="tgAgain" style="height:80px">${ic('restart', 32)}<span>Again</span></button>
        <button class="primary soft-btn" data-a="back" style="height:80px">${ic(together ? 'together' : 'puzzle', 32)}<span>${together ? 'Together' : 'Games'}</span></button>
      </div></div></div>`;
  }
  function screenHtml() {
    const g = cur();
    const d = def();
    if (!g || !d) return '<section class="screen"></section>';
    const turn = g.turn && !g.hideTurn && !g.won ?`<span class="tg-turn ${g.turn}">${avatar(g.turn, 44)}<span>${esc(turnText(g.turn))}</span></span>` : '';
    const bar = d.bar ? d.bar(g) : '';
    return `
<section class="screen tg-screen tg-${d.id}" aria-label="${esc(d.name)}">
  ${A.srTitle(d.name)}
  <div class="row between" style="height:60px;flex:none">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(d.voice(g))}<span class="game-chip" style="background:${d.tint};color:${d.ink}">${ic(d.icon, 30)}<span>${esc(d.name)}</span></span>${rounds(g)}</div>
    ${pairHtml(g)}
  </div>
  <div class="panel tg-stage grow" style="--tg-tint:${d.tint};--tg-ink:${d.ink}">${turn}${d.stage(g)}</div>
  ${bar}
  ${winVeil(g)}
</section>`;
  }

  // ---------------------------------------------------------------- start, turns, finish
  function start(id) {
    const d = DEFS[id];
    const g = { id, turn: 'child', round: 0, total: 0, won: false, solo: solo(), lv: A.level(), age: state.profile.age || 'primary' };
    d.init(g);
    S.tg = g;
  }
  function open(id) {
    start(id);
    go('tg-' + id);
    kick();
  }
  // when it's Lumi's turn in solo play, let the game act for Lumi after a short, readable pause
  function kick() {
    const g = cur();
    const d = def();
    if (!g || g.won || !g.solo || g.turn !== 'other' || !d.lumiTurn) return;
    const id = g.id;
    const n = (g.kickN = (g.kickN || 0) + 1);
    later(() => { if (cur() === g && g.turn === 'other' && g.kickN === n && S.screen === 'tg-' + id) d.lumiTurn(g); }, 900);
  }
  function swap(g, line) {
    g.turn = g.turn === 'child' ? 'other' : 'child';
    render();
    const v = line !== undefined ? line : def().voice(g);
    if (v) say(v);
    kick();
  }
  function setTurn(g, who, line) {
    g.turn = who;
    render();
    const v = line !== undefined ? line : def().voice(g);
    if (v) say(v);
    kick();
  }
  function win(g, opts) {
    if (g.won) return;
    const o = opts || {};
    g.won = true;
    g.winText = o.text || null;
    g.winSub = o.sub || null;
    if (solo()) { state.stats.games += 1; track('games', DEFS[g.id].name); } else { state.stats.together += 1; track('together', DEFS[g.id].name); }
    save();
    tone(784, 0.25, 0.08); setTimeout(() => tone(988, 0.35, 0.08), 150);
    render();
    award(o.stars || 2);
    say(o.say || (solo() ? 'Well done! That was fun.' : 'Great teamwork!'));
  }
  const cheer = () => { tone(660, 0.18, 0.07); setTimeout(() => tone(880, 0.22, 0.07), 110); };
  const nope = (el) => { tone(330, 0.2, 0.05); if (el) { el.classList.remove('wiggle-once'); void el.offsetWidth; el.classList.add('wiggle-once'); } };

  // ---------------------------------------------------------------- hub cards (Games > With Lumi, and Together)
  function forAge(age) {
    const a = age || state.profile.age || 'primary';
    return ORDER.map((id) => DEFS[id]).filter((d) => d.ages.includes(a) && state.profile.games[d.id] !== false);
  }
  function card(d, action) {
    return `<button class="game-card tg-card" data-a="${action}" data-v="${d.id}" style="background:${d.tint}">
      <span class="game-ic" style="color:${d.ink}">${ic(d.icon, 84)}</span>
      <span class="game-name">${esc(d.name)}</span>
      <span class="game-kind" style="color:${d.ink}">${esc(d.kind)}</span>
      ${d.skill && state.profile.targets[d.skill] ? `<span class="tile-focus">${ic('star', 22)}</span>` : ''}
    </button>`;
  }

  // ---------------------------------------------------------------- the API for game files
  A.TG = {
    register(d) {
      DEFS[d.id] = d;
      if (!ORDER.includes(d.id)) ORDER.push(d.id);
      const sid = 'tg-' + d.id;
      A.SCREENS[sid] = screenHtml;
      A.VOICE[sid] = () => (cur() && cur().id === d.id ? d.voice(cur()) : '');
      A.PARENT[sid] = 'play';
      A.GUIDE[sid] = () => {
        const g = cur();
        if (!g || g.id !== d.id) return null;
        if (g.won) return { sel: '[data-a="tgAgain"]', say: 'Play again?', delay: 12000 };
        if (g.solo && g.turn === 'other') return null; // Lumi is busy
        return d.guide ? d.guide(g) : null;
      };
      A.AFTER[sid] = () => { const g = cur(); if (g && g.id === d.id && d.after) d.after(g, A.stage.querySelector('.tg-stage')); };
    },
    defs: DEFS, forAge, card, open, start, cur, swap, setTurn, win, kick, cheer, nope,
    solo, avatar, nameOf, otherName, childName, partnerName, turnText, shuffle, emo,
    level: () => A.level(),
    age: () => state.profile.age || 'primary',
    later, say, tone, render, esc, ic, L, D, S, state,
    // pick n of an array at random
    pick: (arr, n) => shuffle(arr).slice(0, n)
  };

  Object.assign(A.ACTIONS, {
    tgOpen: (d) => open(d.v),
    tgAgain: () => { const g = cur(); if (!g) return; start(g.id); render(); const v = def().voice(cur()); if (v) say(v); kick(); },
    tg: (d, el) => {
      const g = cur();
      const df = def();
      if (!g || !df || g.won) return 'keep';
      if (g.solo && g.turn === 'other' && !g.childCanTapOnLumiTurn && !el.dataset.any) return 'keep'; // wait for Lumi
      df.tap(g, d.k, el, d);
      return undefined;
    }
  });

  // ---------------------------------------------------------------- Games hub: Puzzles | With Lumi
  // (the Games screen in play.js shows these tabs; this draws the "With Lumi" grid)
  A.tgHubGrid = () => {
    const list = forAge();
    return list.length ? list.map((d) => card(d, 'tgOpen')).join('') : '<p class="muted">No games for this age group yet.</p>';
  };
})();
