/*
  tg-little.js: two-player games for Little ones (3-6). See teamgames.js for the frame and helpers.
  - More, please!   Lumi does something fun, then stops. The child asks for "more" (or "stop") on a
                    tiny talk strip. Pausing a favourite thing and waiting is a classic way to invite
                    a child to ask, and it links the talk board to real play.
  - Copy me         The leader picks an action card (clap, wave, jump...), Lumi acts it out, the other
                    player copies it for real. Then they swap. Copying actions is an early building
                    block for learning and talking.
  - Peekaboo Lumi   Lumi hides behind a blanket, door or box. Peek until you find him. Shared looking
                    and shared fun.
  - Breathe together  The balloon only grows while both players hold their pad (in solo play Lumi
                    holds his own). Breathe in, let go, breathe out slowly. Calming down together.
  - Feed the animals  Take turns giving each hungry animal the food it wants. Turn-taking and matching.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const T = A.TG;
  const { ic, esc, L } = T;

  // ================================================================ More, please!
  const FUN = [
    { id: 'bubbles', label: 'Bubbles', icon: 'kBubbles', say: 'Bubbles!' },
    { id: 'bounce', label: 'Bounce', icon: 'jump', say: 'Boing, boing!' },
    { id: 'spin', label: 'Spin', icon: 'kTurns', say: 'Wheee, spinning!' },
    { id: 'drum', label: 'Drum', icon: 'music', say: 'Boom, boom, boom!' }
  ];
  const WORDS = [
    { k: 'more', label: 'more', icon: 'wMore' },
    { k: 'again', label: 'again', icon: 'restart' },
    { k: 'stop', label: 'stop', icon: 'stop' },
    { k: 'done', label: 'all done', icon: 'wDone' }
  ];
  function play(g, ms) {
    g.playing = true;
    T.render();
    const f = FUN.find((x) => x.id === g.fun);
    T.say(f.say);
    if (g.fun === 'bubbles') blow();
    if (g.fun === 'drum') [0, 300, 600, 900, 1200].forEach((t, i) => setTimeout(() => T.tone([196, 247, 196, 262, 196][i], 0.18, 0.09), t));
    if (g.fun === 'bounce') [0, 600, 1200].forEach((t) => setTimeout(() => T.tone(520, 0.15, 0.06), t));
    if (g.fun === 'spin') T.tone(440, 0.6, 0.05);
    T.later(() => {
      if (T.cur() !== g) return;
      g.playing = false;
      g.waiting = true;
      T.render();
      // the pause: Lumi (or the grown-up) waits for the child to ask
      T.say(T.solo() ? 'Do you want more?' : `Wait for ${T.childName()} to ask.`);
    }, ms || 2600);
  }
  function blow() {
    const box = A.stage.querySelector('.more-show');
    if (!box) return;
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        const b = document.createElement('span');
        b.className = 'more-bub';
        const s = 40 + Math.random() * 60;
        b.style.cssText = `width:${s}px;height:${s}px;left:${44 + (Math.random() * 14 - 7)}%;--dx:${Math.round(Math.random() * 300 - 150)}px`;
        box.appendChild(b);
        setTimeout(() => b.remove(), 3100);
      }, i * 260);
    }
  }
  T.register({
    id: 'more', name: 'More, please!', icon: 'wMore', tint: '#DDF1EE', ink: '#2F7E79', kind: 'Asking', sub: 'Ask for more with the talk board',
    ages: ['little'], skill: 'communication',
    init(g) {
      g.fun = null;          // what Lumi is doing
      g.playing = false;     // Lumi is doing it now
      g.waiting = false;     // Lumi has stopped and waits for the child to ask
      g.total = T.level() === 1 ? 4 : T.level() === 3 ? 8 : 6; // how many times the child asks
      g.hideTurn = true;     // the child always leads here
      g.childCanTapOnLumiTurn = true;
    },
    voice(g) {
      if (!g.fun) return 'Pick something fun for Lumi to do.';
      if (g.waiting) return T.solo() ? 'Lumi stopped. Tap more if you want more!' : `Wait for ${T.childName()} to ask for more.`;
      return '';
    },
    stage(g) {
      if (!g.fun) {
        return `<div class="col gap24" style="align-items:center">
          <div class="tg-say" style="position:static">What should Lumi do?</div>
          <div class="more-pick">${FUN.map((f) => `<button class="tg-choice" data-a="tg" data-k="fun" data-v="${f.id}">${ic(f.icon, 92)}<span>${f.label}</span></button>`).join('')}</div>
        </div>`;
      }
      const f = FUN.find((x) => x.id === g.fun);
      const anim = g.playing ? `go-${g.fun === 'bubbles' ? 'none' : g.fun}` : '';
      return `<div class="more-show">
          ${g.waiting ? `<div class="tg-say more-wait">${T.solo() ? 'More?' : `${esc(T.partnerName())}: wait and look at ${esc(T.childName())}`}</div>` : ''}
          <div class="more-lumi ${anim}">${L.svg({ look: A.lookWith(), mood: g.playing ? 'excited' : g.waiting ? 'happy' : 'calm', size: 250, wave: g.waiting })}
            ${g.fun === 'drum' ? `<span class="more-drum">${ic('music', 90)}</span>` : ''}</div>
        </div>
        <div class="more-bottom">
          <span class="game-chip" style="background:#fff">${ic(f.icon, 34)}<span>${f.label}</span></span>
          <div class="tg-talk">${WORDS.map((w) => `<button class="tg-word" data-a="tg" data-k="word" data-v="${w.k}" ${g.playing ? 'disabled' : ''}>${ic(w.icon, 52)}<span>${w.label}</span></button>`).join('')}</div>
        </div>`;
    },
    guide(g) {
      if (!g.fun) return { sel: '.tg-choice', say: 'Pick one.' };
      if (g.waiting) return { sel: '.tg-word[data-v="more"]', say: 'Tap more.' };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'fun') { g.fun = d.v; T.cheer(); play(g); return; }
      if (k !== 'word' || g.playing) return;
      T.say({ more: 'More!', again: 'Again!', stop: 'Stop.', done: 'All done.' }[d.v]);
      if (d.v === 'more' || d.v === 'again') {
        g.round += 1;
        g.waiting = false;
        T.cheer();
        if (g.round >= g.total) { T.later(() => T.win(g, { text: 'You asked so well!', say: 'You asked for more so well! Great talking.' }), 400); return; }
        T.later(() => { if (T.cur() === g) play(g); }, 700);
        return;
      }
      if (d.v === 'stop') { g.waiting = false; g.fun = null; T.render(); T.later(() => T.say('Okay, Lumi stopped. Pick something else.'), 700); return; }
      if (d.v === 'done') { T.win(g, { text: 'All done!', say: 'All done. Thank you for telling Lumi!' }); }
    }
  });

  // ---------------------------------------------------------------- little pictures for these games
  // (outlined, flat-filled, the same style as the app's icons)
  const K = 'stroke="#3B2F2F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  const SH = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".6"/>`;
  const svg48 = (body, size) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${body}</svg>`;
  const HAND = (tx, rot, flip) => `<g transform="translate(${tx} 0) rotate(${rot} 12 30)${flip ? ' scale(-1 1) translate(-24 0)' : ''}">
      <rect x="5" y="10" width="4.4" height="13" rx="2.2" fill="#FFD3AE" ${K}/><rect x="9.4" y="7" width="4.6" height="16" rx="2.3" fill="#FFD3AE" ${K}/>
      <rect x="14" y="8.5" width="4.6" height="15" rx="2.3" fill="#FFD3AE" ${K}/><rect x="18.6" y="12" width="4.2" height="11" rx="2.1" fill="#FFD3AE" ${K}/>
      <path d="M5 19h17.8v9a7 7 0 0 1-7 7h-3.8a7 7 0 0 1-7-7z" fill="#FFD3AE"/><path d="M22.8 20v8a7 7 0 0 1-7 7h-3.8a7 7 0 0 1-7-7v-8" fill="none" ${K}/>
      <rect x="8" y="34" width="12" height="7" rx="3" fill="#8EB8E5" ${K}/></g>`;
  const FACE = (extra) => `<circle cx="24" cy="24" r="18" fill="#FFD23F" ${K}/>${SH(16, 14, 2.2, 3.2)}${extra}`;
  const ACT_ART = {
    clap: svg48(`${HAND(0, 18)}${HAND(24, -18, true)}<path d="M24 4v4M17 6l2 3.4M31 6l-2 3.4" stroke="#F4A259" stroke-width="2.4" stroke-linecap="round"/>`, 100),
    wave: svg48(`${HAND(10, -14)}<path d="M38 12q4 5 0 10M42 8q7 9 0 18" fill="none" stroke="#4FB3A9" stroke-width="2.6" stroke-linecap="round"/>`, 100),
    nose: svg48(`${FACE('<circle cx="18" cy="21" r="1.6" fill="#3B2F2F"/><circle cx="30" cy="21" r="1.6" fill="#3B2F2F"/><path d="M19 32q5 3.6 10 0" fill="none" stroke="#3B2F2F" stroke-width="1.8" stroke-linecap="round"/><circle cx="24" cy="26" r="2.6" fill="#F4A259" stroke="#3B2F2F" stroke-width="1.4"/>')}<rect x="25" y="25" width="5" height="20" rx="2.5" fill="#FFD3AE" ${K} transform="rotate(-28 27.5 35)"/>`, 100),
    silly: svg48(FACE('<path d="M14 21q3-3 6 0" fill="none" stroke="#3B2F2F" stroke-width="1.8" stroke-linecap="round"/><circle cx="30" cy="20.5" r="2" fill="#3B2F2F"/><path d="M16 29q8 6 16 0" fill="#fff" stroke="#3B2F2F" stroke-width="1.8" stroke-linejoin="round"/><path d="M21 31.5h7v4a3.5 3.5 0 0 1-7 0z" fill="#F59FBF" stroke="#3B2F2F" stroke-width="1.6"/>'), 100),
    stomp: svg48(`<path d="M6 30c0-5 4-8 9-8l7-1c3 0 4 2 6 4l8 3c4 1.6 6 4 6 7v2H6z" fill="#5B8FD9" ${K}/><rect x="5" y="37" width="38" height="5" rx="2.5" fill="#fff" ${K}/>${SH(12, 27, 1.4, 2.4)}<path d="M6 46h36" stroke="#C9B8A4" stroke-width="2.4" stroke-linecap="round"/><path d="M14 12l-2-4M24 10V5M34 12l2-4" stroke="#F4A259" stroke-width="2.4" stroke-linecap="round"/>`, 100)
  };
  const ACTIONS = [
    { id: 'clap', label: 'Clap', say: 'Clap, clap, clap!', art: () => ACT_ART.clap },
    { id: 'wave', label: 'Wave', say: 'Wave hello!', art: () => ACT_ART.wave },
    { id: 'arms', label: 'Arms up', say: 'Arms up high!', art: () => ic('stretch', 100) },
    { id: 'jump', label: 'Jump', say: 'Jump, jump!', art: () => ic('jump', 100) },
    { id: 'nose', label: 'Touch nose', say: 'Touch your nose!', art: () => ACT_ART.nose },
    { id: 'silly', label: 'Silly face', say: 'Make a silly face!', art: () => ACT_ART.silly },
    { id: 'stomp', label: 'Stomp', say: 'Stomp, stomp!', art: () => ACT_ART.stomp }
  ];
  const actOf = (id) => ACTIONS.find((a) => a.id === id);

  // ================================================================ Copy me
  function copyDeal(g) {
    const n = { 1: 3, 2: 4, 3: 6 }[T.level()] || 4;
    g.cards = T.pick(ACTIONS, n).map((a) => a.id);
    g.chosen = [];
    g.phase = 'pick';
  }
  const leaderIsLumi = (g) => g.solo && g.turn === 'other';
  const followerName = (g) => T.nameOf(g.turn === 'child' ? 'other' : 'child');
  function copyShow(g) {
    g.phase = 'show';
    g.step = 0;
    T.render();
    const acts = g.chosen.map(actOf);
    T.say(acts.map((a) => a.say).join(' Then, ') + (g.solo && g.turn === 'child' ? ' Lumi copies you!' : ` Now ${followerName(g)} copies!`));
    T.cheer();
    // with two actions (Challenge), Lumi shows them one after the other
    if (acts.length > 1) T.later(() => { if (T.cur() === g && g.phase === 'show') { g.step = 1; T.render(); } }, 2400);
    // in solo play, when the child leads, Lumi copies and the turn passes on by itself
    if (g.solo && g.turn === 'child') T.later(() => { if (T.cur() === g && g.phase === 'show') copyDone(g, 'Lumi copied you!'); }, acts.length > 1 ? 5000 : 3200);
  }
  function copyDone(g, line) {
    g.round += 1;
    T.cheer();
    if (g.round >= g.total) { T.win(g, { text: 'Super copying!', say: 'Super copying! You are a great team.' }); return; }
    copyDeal(g);
    T.swap(g, `${line || 'Well done!'} Now it's ${T.nameOf(g.turn === 'child' ? 'other' : 'child')}'s turn to lead.`);
  }
  T.register({
    id: 'copy', name: 'Copy me', icon: 'jump', tint: '#FFF1C2', ink: '#B07A12', kind: 'Copying', sub: 'Do it, then copy each other',
    ages: ['little'], skill: 'social',
    init(g) { g.total = T.level() === 1 ? 4 : 6; copyDeal(g); },
    voice(g) {
      if (g.phase === 'pick') {
        if (leaderIsLumi(g)) return 'Lumi is picking an action.';
        return `${T.nameOf(g.turn)}, pick an action${T.level() === 3 ? ' and then one more' : ''}. ${g.solo ? 'Lumi will copy you.' : ''}`.trim();
      }
      const acts = g.chosen.map(actOf);
      if (g.solo && g.turn === 'child') return `${acts.map((a) => a.say).join(' Then, ')} Lumi copies you!`;
      return `${acts.map((a) => a.say).join(' Then, ')} ${followerName(g)}, copy it! Then tap We did it.`;
    },
    stage(g) {
      if (g.phase === 'pick') {
        const need = T.level() === 3 ? 2 : 1;
        return `<div class="cp-pick">
          <div class="tg-say cp-q">${leaderIsLumi(g) ? 'Lumi is choosing...' : `Pick ${need > 1 ? (g.chosen.length ? 'one more' : 'two actions') : 'an action'}`}</div>
          <div class="tg-choices cp-cards n${g.cards.length}">${g.cards.map((id) => { const a = actOf(id); const k = g.chosen.indexOf(id); return `<button class="tg-choice cp-card ${k >= 0 ? 'on' : ''} ${g.lumiPick === id ? 'right' : ''}" data-a="tg" data-k="act" data-v="${id}" aria-label="${a.label}">${a.art()}<span>${a.label}</span>${k >= 0 && need > 1 ? `<i class="cp-num">${k + 1}</i>` : ''}</button>`; }).join('')}</div>
        </div>`;
      }
      const acts = g.chosen.map(actOf);
      const now = acts[Math.min(g.step || 0, acts.length - 1)];
      return `<div class="cp-show">
        <div class="cp-lumicol"><div class="cp-lumi a-${now.id}">${L.svg({ look: A.lookWith(), mood: now.id === 'silly' ? 'excited' : 'happy', size: 260, wave: now.id === 'wave' || now.id === 'arms' })}</div>
          <span class="cp-cap">${g.solo && g.turn === 'child' ? 'Lumi is copying you!' : g.solo ? 'Lumi did it. Now you!' : `${A.TG.esc(followerName(g))}, copy it!`}</span></div>
        <div class="cp-cardbig">${acts.map((a, i) => `<div class="cp-mini ${i === (g.step || 0) ? 'on' : ''}">${a.art()}<b>${a.label}</b></div>`).join(acts.length > 1 ? '<span class="cp-then">then</span>' : '')}</div>
      </div>`;
    },
    bar(g) {
      if (g.won || g.phase !== 'show' || (g.solo && g.turn === 'child')) return '';
      return `<div class="bar"><span class="tg-bar-note">${g.solo ? 'Copy Lumi for real' : `${A.TG.esc(followerName(g))}: copy it for real`}</span><span class="grow"></span>
        <button class="primary" data-a="tg" data-k="did" data-any="1" style="height:80px">${ic('check', 32)}<span>We did it!</span></button></div>`;
    },
    guide(g) {
      if (g.phase === 'pick') return { sel: '.cp-card:not(.on)', say: 'Pick an action.' };
      if (g.phase === 'show' && !(g.solo && g.turn === 'child')) return { sel: '[data-k="did"]', say: 'Copy it, then tap We did it.' };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'act' && g.phase === 'pick') {
        const need = T.level() === 3 ? 2 : 1;
        if (g.chosen.includes(d.v)) return;
        g.chosen.push(d.v);
        T.tone(560, 0.15, 0.06);
        if (g.chosen.length >= need) T.later(() => { if (T.cur() === g) copyShow(g); }, 350);
        else { T.render(); T.say(actOf(d.v).label + '. And then?'); }
        return;
      }
      if (k === 'did' && g.phase === 'show') copyDone(g, 'Great copying!');
    },
    lumiTurn(g) {
      if (g.phase !== 'pick') return;
      const need = T.level() === 3 ? 2 : 1;
      g.lumiPick = T.pick(g.cards, 1)[0];
      T.render();
      T.later(() => {
        if (T.cur() !== g || g.phase !== 'pick') return;
        g.chosen = [g.lumiPick].concat(need > 1 ? T.pick(g.cards.filter((c) => c !== g.lumiPick), need - 1) : []);
        g.lumiPick = null;
        copyShow(g);
      }, 900);
    }
  });

  // ================================================================ Peekaboo Lumi
  const SPOT_ART = {
    blanket: `<svg viewBox="0 0 200 150" width="100%" height="100%" aria-hidden="true"><path d="M14 140c-6-40 20-104 86-104s92 64 86 104z" fill="#6FCBBE" ${K}/><g fill="#FFE45C"><circle cx="60" cy="96" r="6"/><circle cx="110" cy="70" r="6"/><circle cx="140" cy="110" r="6"/><circle cx="90" cy="120" r="5"/></g><path d="M40 100q20-30 50-40" stroke="#fff" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/></svg>`,
    box: `<svg viewBox="0 0 200 170" width="100%" height="100%" aria-hidden="true"><path d="M24 56h152v104H24z" fill="#D9A066" ${K}/><path d="M24 56l-14-26h76l14 26zM176 56l14-26h-76l-14 26z" fill="#E8BC87" ${K}/><path d="M74 100h52" stroke="#B57E45" stroke-width="6" stroke-linecap="round"/></svg>`,
    door: `<svg viewBox="0 0 150 230" width="100%" height="100%" aria-hidden="true"><rect x="8" y="6" width="134" height="220" rx="10" fill="#A87B50" ${K}/><rect x="24" y="24" width="102" height="80" rx="8" fill="#B98A5E"/><rect x="24" y="118" width="102" height="90" rx="8" fill="#B98A5E"/><circle cx="118" cy="116" r="7" fill="#FFD23F" ${K}/></svg>`,
    curtain: `<svg viewBox="0 0 170 230" width="100%" height="100%" aria-hidden="true"><rect x="4" y="4" width="162" height="12" rx="6" fill="#A87B50" ${K}/><path d="M10 14h150v212H10z" fill="#B9A6E0" ${K}/><path d="M38 18v204M68 18v204M98 18v204M128 18v204" stroke="#9C88D0" stroke-width="5" stroke-linecap="round"/></svg>`,
    plant: `<svg viewBox="0 0 170 230" width="100%" height="100%" aria-hidden="true"><path d="M85 150c-40-6-64-40-58-90 30 6 52 34 58 90zM85 150c40-6 64-40 58-90-30 6-52 34-58 90zM85 150c-10-50 0-100 0-136 10 36 20 86 0 136z" fill="#7BC67E" ${K}/><path d="M48 148h74l-8 72a6 6 0 0 1-6 6H62a6 6 0 0 1-6-6z" fill="#EF6F5E" ${K}/><rect x="42" y="140" width="86" height="16" rx="7" fill="#F58B7A" ${K}/></svg>`
  };
  const SPOTS = [
    { id: 'blanket', label: 'blanket', w: 230, h: 170 },
    { id: 'box', label: 'box', w: 200, h: 170 },
    { id: 'door', label: 'door', w: 150, h: 230 },
    { id: 'curtain', label: 'curtain', w: 170, h: 230 },
    { id: 'plant', label: 'plant', w: 170, h: 230 }
  ];
  function pbHide(g) {
    const n = { 1: 2, 2: 3, 3: 4 }[T.level()] || 3;
    g.spots = T.pick(SPOTS, n).map((s) => s.id);
    g.at = g.spots[Math.floor(Math.random() * g.spots.length)];
    g.open = {};
    g.found = false;
  }
  T.register({
    id: 'peekaboo', name: 'Peekaboo Lumi', icon: 'eye', tint: '#F1ECFB', ink: '#7E64C8', kind: 'Looking', sub: 'Find where Lumi is hiding',
    ages: ['little'], skill: 'social',
    init(g) {
      g.total = T.level() === 1 ? 3 : 4;
      g.hideTurn = g.solo; // in solo play the child does all the looking
      pbHide(g);
    },
    voice(g) {
      if (g.found) return 'Peekaboo!';
      return g.solo ? 'Where is Lumi hiding? Tap to peek.' : `${T.nameOf(g.turn)}, where is Lumi? Tap to peek.`;
    },
    stage(g) {
      return `<div class="pb-room">
        <div class="pb-window"></div>
        <div class="pb-floor"></div>
        <div class="pb-spots n${g.spots.length}">${g.spots.map((id, idx) => {
          const sp = SPOTS.find((x) => x.id === id);
          const here = g.at === id && g.found;
          const empty = g.open[id] && !here;
          return `<button class="pb-spot ${sp.h > 200 ? (idx >= g.spots.length / 2 ? 'tall left' : 'tall') : ''} ${empty ? 'empty' : ''} ${here ? 'here' : ''}" data-a="tg" data-k="peek" data-v="${id}" aria-label="Peek behind the ${sp.label}" style="width:${sp.w}px;height:${sp.h}px">
            ${here ? `<span class="pb-lumi">${L.svg({ look: A.lookWith(), mood: 'excited', size: 170, wave: true })}</span><span class="tg-say pb-boo">Peekaboo!</span>` : ''}
            <span class="pb-art">${SPOT_ART[id]}</span>
            ${empty ? '<span class="pb-not">Not here!</span>' : ''}
          </button>`;
        }).join('')}</div>
      </div>`;
    },
    guide(g) {
      if (g.found) return null;
      const left = g.spots.filter((id) => !g.open[id]);
      return { sel: `.pb-spot[data-v="${left[0]}"]`, say: 'Tap to peek.' };
    },
    tap(g, k, el, d) {
      if (k !== 'peek' || g.found || g.open[d.v]) return;
      g.open[d.v] = true;
      if (d.v !== g.at) {
        T.tone(392, 0.2, 0.05);
        T.say(`Not behind the ${SPOTS.find((x) => x.id === d.v).label}.`);
        if (g.solo) { T.render(); return; }
        T.swap(g, `Not here! ${T.nameOf(g.turn === 'child' ? 'other' : 'child')}'s turn to look.`);
        return;
      }
      g.found = true;
      g.round += 1;
      T.render();
      T.say('Peekaboo!');
      [0, 140, 280, 420].forEach((t, i) => setTimeout(() => T.tone([660, 784, 880, 1047][i], 0.14, 0.06), t));
      T.later(() => {
        if (T.cur() !== g) return;
        if (g.round >= g.total) { T.win(g, { text: 'You found Lumi!', say: 'You found Lumi every time! Peekaboo!' }); return; }
        pbHide(g);
        if (g.solo) { T.render(); T.say('Lumi is hiding again. Where is he?'); } else T.swap(g, `Lumi is hiding again! ${T.nameOf(g.turn === 'child' ? 'other' : 'child')}'s turn to look.`);
      }, 2000);
    }
  });

  // ================================================================ Breathe together
  const IN_MS = 3000;
  const OUT_MS = 4000;
  function brText(g) {
    if (g.phase === 'out') return 'Let go and breathe out slowly...';
    if (g.phase === 'full') return 'Now let go, and breathe out.';
    if (g.solo) return g.held.child ? 'Breathe in slowly...' : 'Hold your pad and breathe in.';
    if (g.held.child && g.held.other) return 'Breathe in slowly, together...';
    if (g.held.child || g.held.other) return `Waiting for ${T.nameOf(g.held.child ? 'other' : 'child')} to hold too.`;
    return 'Both hold your pads and breathe in.';
  }
  function brPaint(g) {
    const box = A.stage.querySelector('.br-wrap');
    if (!box) return;
    const b = box.querySelector('.br-balloon');
    if (b) b.style.transform = `scale(${(0.42 + 0.58 * g.p).toFixed(3)})`;
    const t = box.querySelector('.br-text');
    if (t && t.textContent !== brText(g)) t.textContent = brText(g);
    box.querySelectorAll('.br-pad').forEach((el) => el.classList.toggle('held', !!g.held[el.dataset.who]));
  }
  function brTick(g) {
    if (T.cur() !== g || S_screen() !== 'tg-breathe' || g.won) return;
    const now = Date.now();
    const dt = Math.min(200, now - (g.last || now));
    g.last = now;
    const both = g.held.child && g.held.other;
    if (g.phase === 'ready' && both) { g.phase = 'in'; T.tone(262, 1.2, 0.04); }
    if (g.phase === 'in') {
      if (both) g.p = Math.min(1, g.p + dt / IN_MS);
      if (g.p >= 1) { g.phase = 'full'; Object.keys(g.latch).forEach((w) => { if (g.latch[w]) g.held[w] = false; }); g.latch = {}; T.tone(330, 0.5, 0.04); T.say('Now let go, and breathe out slowly.'); }
    }
    if (g.phase === 'full' && !g.held.child && (g.solo || !g.held.other)) { g.phase = 'out'; T.tone(220, 1.6, 0.04); }
    if (g.phase === 'out') {
      g.p = Math.max(0, g.p - dt / OUT_MS);
      if (g.p <= 0) {
        g.round += 1;
        g.phase = 'ready';
        if (g.round >= g.total) { T.win(g, { text: 'Nice and calm', say: 'Lovely slow breathing. Nice and calm.', stars: 2 }); return; }
        T.render();
        T.say(g.round === g.total - 1 ? 'One more breath.' : 'Again. Hold and breathe in.');
        return;
      }
    }
    brPaint(g);
  }
  const S_screen = () => A.TG.S.screen;
  T.register({
    id: 'breathe', name: 'Breathe together', icon: 'kBalloon', tint: '#E7F0FA', ink: '#4A78A8', kind: 'Calm', sub: 'Hold together, breathe slowly',
    ages: ['little'], skill: 'emotions',
    init(g) {
      g.total = { 1: 3, 2: 4, 3: 5 }[T.level()] || 4;
      g.hideTurn = true;
      g.childCanTapOnLumiTurn = true;
      g.phase = 'ready';
      g.p = 0;
      g.held = { child: false, other: g.solo }; // in solo play Lumi always holds his pad
      g.latch = {};
    },
    voice(g) {
      if (g.solo) return 'Hold your pad and breathe in slowly with Lumi. Then let go and breathe out.';
      return `${T.childName()} and ${T.otherName()}, both hold your pads and breathe in slowly. Then let go and breathe out.`;
    },
    stage(g) {
      const pad = (who) => `<div class="br-pad ${who} ${g.held[who] ? 'held' : ''} ${who === 'other' && g.solo ? 'lumi-holds' : ''}" data-who="${who}" role="button" aria-label="${A.TG.esc(T.nameOf(who))}: hold here">
          ${T.avatar(who, 70)}<span class="br-pad-name">${A.TG.esc(T.nameOf(who))}</span>
          <span class="br-pad-hint">${who === 'other' && g.solo ? 'Lumi is holding' : 'Hold here'}</span></div>`;
      return `<div class="br-wrap">
        ${pad('child')}
        <div class="br-mid">
          <div class="br-sky"><div class="br-balloon" style="transform:scale(${(0.42 + 0.58 * g.p).toFixed(3)})">
            <svg viewBox="0 0 200 250" width="300" height="375" aria-hidden="true"><path d="M100 196q-6 24 4 50" stroke="#9C8B7A" stroke-width="3" fill="none"/><path d="M100 196c-50 0-80-46-80-92a80 80 0 0 1 160 0c0 46-30 92-80 92z" fill="#C9B8EE" stroke="#3B2F2F" stroke-width="4"/><path d="M92 196h16l-8 12z" fill="#B9A6E0" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><ellipse cx="66" cy="70" rx="12" ry="22" fill="#fff" opacity=".6" transform="rotate(20 66 70)"/></svg>
          </div></div>
          <div class="br-text">${brText(g)}</div>
        </div>
        ${pad('other')}
      </div>`;
    },
    guide(g) {
      if (g.phase === 'ready' || g.phase === 'in') return g.held.child ? null : { sel: '.br-pad.child', say: 'Press and hold.' };
      return null;
    },
    tap() {},
    after(g, box) {
      if (!box) return;
      box.querySelectorAll('.br-pad').forEach((el) => {
        const who = el.dataset.who;
        if (who === 'other' && g.solo) return;
        let downAt = 0;
        el.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          try { el.setPointerCapture(e.pointerId); } catch (err) { /* old browser */ }
          downAt = Date.now();
          if (g.latch[who]) { g.latch[who] = false; g.held[who] = false; brPaint(g); return; }
          g.held[who] = true;
          A.hideHand();
          brPaint(g);
        });
        const up = () => {
          if (!downAt) return;
          const quick = Date.now() - downAt < 300;
          downAt = 0;
          // a quick tap keeps holding (for children who can't press and hold) until the breath is in
          if (quick && g.held[who] && (g.phase === 'ready' || g.phase === 'in')) { g.latch[who] = true; brPaint(g); return; }
          g.held[who] = false;
          brPaint(g);
        };
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
      });
      if (!g.timer) {
        g.last = Date.now();
        g.timer = A.every(() => brTick(g), 60);
      }
    }
  });

  // ================================================================ Feed the animals
  const AN_ART = {
    fish: (md, size) => `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true"><path d="M150 100l40-34v68z" fill="#F4A259" stroke="#3B2F2F" stroke-width="5" stroke-linejoin="round"/><ellipse cx="96" cy="100" rx="70" ry="52" fill="#F4A259" stroke="#3B2F2F" stroke-width="5"/><path d="M80 52q20-26 44 0" fill="#EF8A2E" stroke="#3B2F2F" stroke-width="5" stroke-linejoin="round"/><circle cx="66" cy="90" r="9" fill="#3B2F2F"/><circle cx="69" cy="87" r="3" fill="#fff"/><path d="M${md === 'eat' ? '40 112q8 10 16 0' : '42 114q7 6 14 0'}" stroke="#3B2F2F" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 86q14 14 0 28M120 86q14 14 0 28" stroke="#E08A3A" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="80" cy="66" rx="10" ry="6" fill="#fff" opacity=".55"/><circle cx="44" cy="100" r="5" fill="#F2A7BE"/></svg>`,
    rabbit: (md, size) => `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true"><ellipse cx="78" cy="46" rx="15" ry="42" fill="#F2EEE8" stroke="#3B2F2F" stroke-width="5" transform="rotate(-10 78 46)"/><ellipse cx="78" cy="48" rx="6" ry="28" fill="#F59FBF" transform="rotate(-10 78 48)"/><ellipse cx="122" cy="46" rx="15" ry="42" fill="#F2EEE8" stroke="#3B2F2F" stroke-width="5" transform="rotate(10 122 46)"/><ellipse cx="122" cy="48" rx="6" ry="28" fill="#F59FBF" transform="rotate(10 122 48)"/>
      <ellipse cx="100" cy="160" rx="58" ry="36" fill="#F2EEE8" stroke="#3B2F2F" stroke-width="5"/><circle cx="100" cy="112" r="44" fill="#F2EEE8" stroke="#3B2F2F" stroke-width="5"/><circle cx="84" cy="106" r="6" fill="#3B2F2F"/><circle cx="116" cy="106" r="6" fill="#3B2F2F"/><path d="M95 120h10l-5 5z" fill="#EF8A7A"/><path d="M${md === 'eat' ? '90 130q10 10 20 0' : '92 130q8 6 16 0'}" stroke="#3B2F2F" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="74" cy="124" r="5" fill="#F2A7BE"/><circle cx="126" cy="124" r="5" fill="#F2A7BE"/></svg>`,
    bird: (md, size) => `<svg viewBox="0 0 200 200" width="${size}" height="${size}" aria-hidden="true"><path d="M70 180v12M120 180v12" stroke="#E09A2E" stroke-width="6" stroke-linecap="round"/><path d="M150 112l34-12-24 30z" fill="#FFC94A" stroke="#3B2F2F" stroke-width="5" stroke-linejoin="round"/><circle cx="96" cy="114" r="66" fill="#FFD23F" stroke="#3B2F2F" stroke-width="5"/><path d="M96 130q30-6 44 18-26 16-52 2z" fill="#F4B400" stroke="#3B2F2F" stroke-width="5" stroke-linejoin="round"/><circle cx="74" cy="98" r="8" fill="#3B2F2F"/><circle cx="77" cy="95" r="3" fill="#fff"/><path d="M${md === 'eat' ? '36 104l22-8v18z' : '36 106l20-6 0 12z'}" fill="#F4A259" stroke="#3B2F2F" stroke-width="4" stroke-linejoin="round"/><circle cx="70" cy="122" r="6" fill="#F2A7BE"/><ellipse cx="86" cy="70" rx="12" ry="7" fill="#fff" opacity=".6"/></svg>`
  };
  const ANIMALS = [
    { id: 'cat', name: 'Kitty', kind: 'cat', food: 'fish', art: (md, s) => A.petSvg('kitten', md === 'eat' ? 'happy' : 'happy', s) },
    { id: 'dog', name: 'Puppy', kind: 'dog', food: 'bone', art: (md, s) => A.petSvg('puppy', 'happy', s) },
    { id: 'fish', name: 'Goldie', kind: 'fish', food: 'flakes', art: (md, s) => AN_ART.fish(md, s) },
    { id: 'rabbit', name: 'Bunny', kind: 'rabbit', food: 'carrot', art: (md, s) => AN_ART.rabbit(md, s) },
    { id: 'bird', name: 'Tweety', kind: 'bird', food: 'seeds', art: (md, s) => AN_ART.bird(md, s) }
  ];
  const FOOD_ART = {
    fish: svg48(`<path d="M34 24l10-8v16z" fill="#F4A259" ${K}/><ellipse cx="21" cy="24" rx="16" ry="10" fill="#8EB8E5" ${K}/><circle cx="12" cy="22" r="1.8" fill="#3B2F2F"/><path d="M22 18q4 6 0 12" stroke="#5B8FD9" stroke-width="1.6" fill="none" stroke-linecap="round"/>${SH(18, 19, 3, 1.4)}`, 90),
    bone: svg48(`<path d="M12 18a5 5 0 1 1 6-6l12 12a5 5 0 1 1 6 6 5 5 0 1 1-6 6L18 24a5 5 0 1 1-6-6z" fill="#FFF8EC" ${K} transform="rotate(10 24 24)"/>${SH(14, 13, 1.4, 2.4)}`, 90),
    flakes: svg48(`<rect x="12" y="14" width="24" height="28" rx="5" fill="#EF6F5E" ${K}/><rect x="10" y="8" width="28" height="8" rx="3" fill="#FFD23F" ${K}/><path d="M17 26c3-4 9-4 12 0-3 4-9 4-12 0z" fill="#fff"/><circle cx="33" cy="5" r="1.4" fill="#F4A259"/><circle cx="28" cy="3.4" r="1.2" fill="#F4A259"/>${SH(16, 20, 1.4, 3)}`, 90),
    carrot: svg48(`<path d="M24 14c-3-4-8-7-11-6 2 4 6 6 11 6zM24 14c0-5 1-9 4-11 1 5-1 9-4 11zM24 14c3-3 8-4 10-2-3 3-7 3-10 2z" fill="#5FAE4A" ${K}/><path d="M18 15c2-2 10-2 12 0L25.5 44c-.4 2-2.6 2-3 0z" fill="#F4A259" ${K}/><path d="M21 22h4M22 30h3M23 37h2" stroke="#D4701C" stroke-width="1.6" stroke-linecap="round"/>`, 90),
    seeds: svg48(`<path d="M6 26h36l-3 10a6 6 0 0 1-6 4H15a6 6 0 0 1-6-4z" fill="#8EB8E5" ${K}/>${[[14, 22], [19, 19], [24, 21], [29, 18], [34, 22], [22, 24], [28, 24]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.6" fill="#C89A6E" stroke="#3B2F2F" stroke-width="1"/>`).join('')}`, 90)
  };
  const FOOD_NAME = { fish: 'fish', bone: 'bone', flakes: 'fish flakes', carrot: 'carrot', seeds: 'seeds' };
  function fdNext(g) {
    const prev = g.animal;
    const pool = ANIMALS.filter((a) => a.id !== prev);
    const a = pool[Math.floor(Math.random() * pool.length)];
    g.animal = a.id;
    const n = { 1: 2, 2: 3, 3: 4 }[T.level()] || 3;
    const others = T.pick(Object.keys(FOOD_ART).filter((f) => f !== a.food), n - 1);
    g.foods = T.shuffle([a.food].concat(others));
    g.eating = false;
    g.no = null;
  }
  const animalOf = (g) => ANIMALS.find((a) => a.id === g.animal);
  function fdFeed(g, food) {
    const a = animalOf(g);
    if (food !== a.food) {
      g.no = food;
      T.render();
      T.tone(330, 0.2, 0.05);
      T.say('Hmm, not that one.');
      T.later(() => { if (T.cur() === g && g.no === food) { g.no = null; T.render(); } }, 900);
      return;
    }
    g.eating = true;
    g.round += 1;
    T.render();
    [0, 180, 360].forEach((t) => setTimeout(() => T.tone(520 + t / 3, 0.1, 0.06), t));
    T.say(`Yum yum! Thank you, ${T.nameOf(g.turn)}!`);
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'All the animals are full!', say: 'All the animals are happy and full. Great sharing!' }); return; }
      fdNext(g);
      T.swap(g);
    }, 1700);
  }
  T.register({
    id: 'feed', name: 'Feed the animals', icon: 'feed', tint: '#E7F3E1', ink: '#4F8A3F', kind: 'Turn-taking', sub: 'Take turns feeding hungry animals',
    ages: ['little'], skill: 'social',
    init(g) { g.total = 6; g.animal = null; fdNext(g); },
    voice(g) {
      const a = animalOf(g);
      if (g.eating) return 'Yum yum!';
      const who = g.solo && g.turn === 'other' ? 'Lumi' : T.nameOf(g.turn);
      return `${who}'s turn. ${a.name} the ${a.kind} is hungry. ${T.level() === 3 ? `What does a ${a.kind} eat?` : `${a.name} wants ${FOOD_NAME[a.food]}.`}`;
    },
    stage(g) {
      const a = animalOf(g);
      const hint = T.level() < 3 && !g.eating;
      return `<div class="fd-wrap">
        <div class="fd-animal ${g.eating ? 'eat' : ''} ${g.no ? 'no' : ''}">
          ${a.art(g.eating ? 'eat' : 'happy', 230)}
          ${hint ? `<span class="fd-think">${FOOD_ART[a.food]}</span>` : ''}
          ${g.eating ? `<span class="tg-say fd-yum">Yum yum!</span>` : `<span class="fd-name">${a.name} the ${a.kind}</span>`}
        </div>
        <div class="tg-choices fd-foods">${g.foods.map((f) => `<button class="tg-choice fd-food ${g.no === f ? 'wiggle-once' : ''} ${g.lumiPick === f ? 'right' : ''}" data-a="tg" data-k="food" data-v="${f}" ${g.eating ? 'disabled' : ''} aria-label="${FOOD_NAME[f]}">${FOOD_ART[f]}<span>${FOOD_NAME[f]}</span></button>`).join('')}</div>
      </div>`;
    },
    guide(g) {
      if (g.eating) return null;
      return { sel: `.fd-food[data-v="${animalOf(g).food}"]`, say: `Give ${animalOf(g).name} the ${FOOD_NAME[animalOf(g).food]}.` };
    },
    tap(g, k, el, d) { if (k === 'food' && !g.eating) fdFeed(g, d.v); },
    lumiTurn(g) {
      if (g.eating) return;
      g.lumiPick = animalOf(g).food;
      T.render();
      T.say(`Lumi thinks ${animalOf(g).name} wants ${FOOD_NAME[g.lumiPick]}.`);
      T.later(() => { if (T.cur() === g && !g.eating) { const f = g.lumiPick; g.lumiPick = null; fdFeed(g, f); } }, 1300);
    }
  });
})();
