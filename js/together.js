/*
  together.js
  Together mode: the child and a grown-up (or sibling, or friend) play side by side on one tablet,
  or around a table with real cards. Four activities:
  1. Take turns: "Your turn to choose a card" → "Now invite your partner to take a turn".
  2. Everyday scenario cards: act out a situation and try more than one way to communicate.
  3. Feelings and support match: the child shows how they feel and what would help, without having to explain.
  4. Cooperative missions: collect three stars together. Attempts count, not speed or perfect answers.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, award, track, render, go, later, every, pick, dots } = A;

  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const partner = () => state.profile.partner || 'Mum';
  const partnerEmoji = () => (D.PARTNERS.find((p) => p[0] === partner()) || ['', '🧑'])[1];
  const child = () => state.childName || 'You';
  const emo = (e, size) => (window.lumiPic && window.lumiPic(e, size)) || `<span class="emoji" style="font-size:${size}px">${e}</span>`;
  const childAvatar = (size) => `<span class="avatar child">${L.svg({ look: A.lookWith(), mood: 'happy', size })}</span>`;
  const partnerAvatar = (size) => `<span class="avatar partner" style="font-size:${Math.round(size * 0.7)}px">${partnerEmoji()}</span>`;

  function pair(active) {
    return `<div class="pair">
      <span class="pair-who ${active === 'child' ? 'on' : ''}">${childAvatar(40)}<span>${esc(child())}</span></span>
      <span class="pair-and">${ic('heart', 18)}</span>
      <span class="pair-who ${active === 'partner' ? 'on' : ''}">${partnerAvatar(40)}<span>${esc(partner())}</span></span>
    </div>`;
  }
  function header(title, icon, voice, active) {
    return `<div class="row between" style="height:60px;flex:none">
      <div class="row gap12">${A.backBtn()}${A.speakBtn(voice)}<span class="game-chip together-chip">${ic(icon, 26)}<span>${title}</span></span></div>
      ${pair(active)}
    </div>`;
  }
  function finishTogether(name, stars) {
    state.stats.together += 1;
    track('together', name);
    save();
    award(stars || 2);
  }
  function teamwork(title, againAction) {
    return `<div class="win-veil"><div class="win-card">
      <div class="row gap24 center">${childAvatar(120)}${emo('🤝', 70)}${partnerAvatar(120)}</div>
      <div class="win-title">${ic('star', 40)}<span>${title}</span>${ic('star', 40)}</div>
      <div class="row gap16">
        <button class="primary" data-a="${againAction}" style="height:80px">${ic('undo', 32)}<span>Again</span></button>
        <button class="primary soft-btn" data-a="nav" data-to="together" style="height:80px">${ic('together', 32)}<span>Together</span></button>
      </div></div></div>`;
  }

  // ================================================================ Together hub
  A.PARENT.together = 'menu';
  A.VOICE.together = () => `Let's play together with ${partner()}. Pick a game.`;
  A.SCREENS.together = () => {
    const acts = [
      ['tt', 'Take turns', 'kTurns', '#DCEEF7', '#4A78A8', 'Your turn, my turn'],
      ['scen', 'What could I say?', 'kTalk', '#E7F3E1', '#4F8A3F', 'Everyday scenario cards'],
      ['fsm', 'Feelings and help', 'kHeart', '#F1ECFB', '#7E64C8', 'How I feel, what helps'],
      ['mission', 'Team mission', 'kFlag', '#FFF1C2', '#B07A12', 'Collect 3 stars together']
    ];
    const more = A.TG ? A.TG.forAge().map((d) => [d.id, d.name, d.icon, d.tint, d.ink, d.sub, true]) : [];
    const cards = acts.concat(more).map(([to, name, icon, tint, ink, sub, tg]) => `<button class="together-card" data-a="${tg ? 'tgOpen' : 'tOpen'}" data-v="${to}" style="background:${tint}">
      <span class="together-ic" style="color:${ink}">${ic(icon, more.length ? 64 : 80)}</span><span class="col"><span class="game-name">${name}</span><span class="small muted">${sub}</span></span></button>`).join('');
    const partners = D.PARTNERS.map(([n, e]) => `<button class="partner-chip ${partner() === n ? 'on' : ''}" data-a="tPartner" data-v="${n}" aria-pressed="${partner() === n}">${emo(e, 28)}<span>${n}</span></button>`).join('');
    return `
<section class="screen together-screen" aria-label="Together">
  ${A.srTitle('Together')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.together())}<span class="game-chip together-chip">${ic('kDuo', 34)}<span>Together</span></span></div>
    ${pair(null)}
  </div>
  <div class="row gap12 partner-row"><span class="small muted">Playing with</span>${partners}</div>
  <div class="together-grid grow ${more.length ? 'many' : ''}">${cards}</div>
  <button class="check-row real-toggle" data-a="tReal" aria-pressed="${!!S.realCards}"><span class="box ${S.realCards ? 'on' : ''}">${S.realCards ? ic('check', 14) : ''}</span><span>We are using real cards on the table</span></button>
</section>`;
  };
  A.GUIDE.together = () => ({ sel: '.together-card', say: 'Pick a game to play together.', delay: state.settings.guideDelay * 1000 + 3000 });

  // ================================================================ 1. Take turns
  function newTT() { return { turn: 'child', phase: 'choose', cards: shuffle(D.CHALLENGES).slice(0, 3), picked: null, count: 0, total: A.level() === 1 ? 4 : 6, log: [], won: false }; }
  const whoName = (t) => (t === 'child' ? child() : partner());
  const otherOf = (t) => (t === 'child' ? 'partner' : 'child');
  A.PARENT.tt = 'together';
  A.VOICE.tt = () => {
    const t = S.tt;
    if (t.won) return 'Great teamwork!';
    const you = t.turn === 'child' ? 'Your' : `${partner()}'s`;
    if (t.phase === 'choose') return S.realCards ? `${you} turn. Pick a card from the table.` : `${you} turn to choose a card.`;
    if (t.phase === 'do') return S.realCards ? 'Do what the card says!' : t.picked.text + '!';
    return t.turn === 'child' ? `Now invite ${partner()} to take a turn.` : `Now invite ${child()} to take a turn.`;
  };
  A.SCREENS.tt = () => {
    const t = S.tt;
    let main;
    if (t.phase === 'choose') {
      main = S.realCards
        ? `<div class="tt-real">${emo('🃏', 150)}<button class="primary" data-a="ttPicked" style="height:90px">${ic('check', 34)}<span>Picked one</span></button></div>`
        : `<div class="tt-cards">${t.cards.map((c, k) => `<button class="tt-card back" data-a="ttPick" data-k="${k}" aria-label="Card ${k + 1}">${ic('sparkle', 80)}</button>`).join('')}</div>`;
    } else if (t.phase === 'do') {
      main = S.realCards
        ? `<div class="tt-real">${emo('🃏', 150)}<div class="tt-text">Do what the card says!</div></div>`
        : `<div class="tt-card front big">${emo(t.picked.e, 150)}<span class="tt-text">${esc(t.picked.text)}</span>${A.speakBtn(t.picked.text, 56)}</div>`;
    } else {
      const next = otherOf(t.turn);
      main = `<div class="tt-invite">
        <div class="tt-arrow">${t.turn === 'child' ? childAvatar(120) : partnerAvatar(120)}<span class="tt-go">${ic('arrow', 60)}</span>${next === 'child' ? childAvatar(120) : partnerAvatar(120)}</div>
        <button class="invite-btn" data-a="ttInvite">${ic('speaker', 40)}<span>Your turn, ${esc(whoName(next))}!</span></button>
      </div>`;
    }
    const trackHtml = t.log.map((w) => `<span class="turn-dot ${w}"></span>`).join('') + Array(Math.max(0, t.total - t.log.length)).fill('<span class="turn-dot"></span>').join('');
    const banner = `<div class="turn-banner ${t.turn}">${t.turn === 'child' ? childAvatar(64) : partnerAvatar(64)}<span>${t.phase === 'invite' ? 'Invite!' : t.turn === 'child' ? 'Your turn' : esc(partner()) + "'s turn"}</span></div>`;
    return `
<section class="screen together-screen" aria-label="Take turns">
  ${A.srTitle('Take turns')}
  ${header('Take turns', 'swap', A.VOICE.tt(), t.phase === 'invite' ? otherOf(t.turn) : t.turn)}
  <div class="row gap24 grow">
    <div class="col gap16" style="width:280px">${banner}<div class="turn-track" role="img" aria-label="${t.log.length} of ${t.total} turns">${trackHtml}</div></div>
    <div class="panel tt-stage grow">${main}</div>
  </div>
  ${t.phase === 'do' ? `<div class="bar"><span class="les-say">${S.realCards ? 'Do the card together' : esc(t.picked.text)}</span><span class="grow"></span><button class="primary" data-a="ttDone" style="height:80px">${ic('check', 34)}<span>Done!</span></button></div>` : ''}
  ${t.won ? teamwork('Great teamwork!', 'ttAgain') : ''}
</section>`;
  };
  A.GUIDE.tt = () => {
    const t = S.tt;
    if (!t || t.won) return null;
    if (t.phase === 'choose') return { sel: S.realCards ? '[data-a="ttPicked"]' : '[data-a="ttPick"]', say: A.VOICE.tt() };
    if (t.phase === 'do') return { sel: '[data-a="ttDone"]', say: 'When it is done, tap Done.', delay: state.settings.guideDelay * 1000 + 4000 };
    return { sel: '[data-a="ttInvite"]', say: A.VOICE.tt() };
  };
  Object.assign(A.ACTIONS, {
    ttPick: (d) => { const t = S.tt; t.picked = t.cards[Number(d.k)]; t.phase = 'do'; tone(660, 0.3, 0.08); render(); say(t.picked.text + '!'); },
    ttPicked: () => { const t = S.tt; t.phase = 'do'; render(); say('Do what the card says!'); },
    ttDone: () => {
      const t = S.tt;
      t.log.push(t.turn);
      t.count += 1;
      tone(784, 0.3, 0.08);
      if (t.count >= t.total) {
        t.won = true;
        finishTogether('Take turns', 2);
        render();
        say('Great teamwork! You took turns so well.');
        return;
      }
      t.phase = 'invite';
      render();
      say(A.VOICE.tt());
    },
    ttInvite: () => {
      const t = S.tt;
      const next = otherOf(t.turn);
      say(`Your turn, ${whoName(next)}!`);
      t.turn = next;
      t.phase = 'choose';
      t.cards = shuffle(D.CHALLENGES).slice(0, 3);
      t.picked = null;
      later(() => { render(); }, 900);
    },
    ttAgain: () => { S.tt = newTT(); render(); say(A.VOICE.tt()); }
  });

  // ================================================================ 2. Everyday scenario cards
  function scenOptions(sc) {
    const lv = A.level();
    const o = sc.options;
    if (lv === 1) return [o[0], o[o.length - 1]];
    if (lv === 2) return [o[0], o[1], o[o.length - 1]];
    return o;
  }
  A.PARENT.scen = 'together';
  A.VOICE.scen = () => `${D.SCENARIOS[S.sc.i].text} What could you communicate?`;
  A.SCREENS.scen = () => {
    const sc = D.SCENARIOS[S.sc.i];
    const opts = scenOptions(sc);
    const chosen = S.sc.chosen !== null ? sc.options.find((o) => o.say === S.sc.chosen) : null;
    const cards = opts.map((o) => {
      const tried = S.sc.explored.includes(o.say);
      return `<button class="scen-opt ${chosen === o ? 'on' : ''} ${tried ? 'tried' : ''}" data-a="scPick" data-v="${esc(o.say)}">
        ${emo(o.e, 64)}<span class="scen-say">${esc(o.say)}</span><span class="scen-kind">${esc(o.kind)}</span>${tried ? `<span class="scen-tick">${ic('check', 18)}</span>` : ''}</button>`;
    }).join('');
    const outcome = chosen ? `<div class="scen-out ${chosen.ok ? 'ok' : 'think'}">
        <span>${L.svg({ look: A.lookWith(), mood: chosen.ok ? 'happy' : 'worried', size: 90 })}</span>
        <span class="scen-out-text">${esc(chosen.out)}</span>
        <div class="col gap8"><button class="g-btn" data-a="scAgain">${ic('undo', 18)}<span>Try another way</span></button>
        <button class="g-btn outline" data-a="scNext">${ic('arrow', 18)}<span>Next card</span></button></div></div>` : '';
    return `
<section class="screen together-screen" aria-label="What could I say?">
  ${A.srTitle('What could I say?')}
  ${header('What could I say?', 'chat', A.VOICE.scen(), null)}
  <div class="row gap24 grow">
    <div class="panel scen-scene" style="width:420px">
      <div class="scen-pic">${emo(sc.e, 120)}</div>
      <div class="scen-people"><span>${L.svg({ look: A.lookWith(), mood: 'worried', size: 140 })}</span><span>${L.svg({ look: { color: 'leaf', head: 'cap' }, mood: 'happy', size: 120 })}</span></div>
      <div class="scen-text">${esc(sc.text)}</div>
    </div>
    <div class="col gap16 grow">
      <div class="scen-q">${ic('chat', 28)}<span>What could you communicate?</span></div>
      <div class="scen-grid n${opts.length}">${cards}</div>
      ${outcome}
    </div>
  </div>
  <div class="grown-tip">${ic('together', 22)}<span><b>For ${esc(partner())}:</b> ${esc(sc.tip)}</span><span class="grow"></span>${dots(S.sc.i + 1, D.SCENARIOS.length, '#4F8A3F', 12)}</div>
</section>`;
  };
  A.GUIDE.scen = () => {
    if (!S.sc) return null;
    if (S.sc.chosen === null) return { sel: '.scen-opt', say: 'Tap what you could say.', delay: state.settings.guideDelay * 1000 + 6000 };
    return { sel: '[data-a="scAgain"]', say: 'Try another way.', delay: state.settings.guideDelay * 1000 + 3000 };
  };
  Object.assign(A.ACTIONS, {
    scPick: (d) => {
      const sc = D.SCENARIOS[S.sc.i];
      const o = sc.options.find((x) => x.say === d.v);
      S.sc.chosen = o.say;
      if (!S.sc.explored.includes(o.say)) S.sc.explored.push(o.say);
      if (S.sc.explored.length === 1) finishTogether('Scenario: ' + sc.id, 1);
      tone(o.ok ? 784 : 392, 0.35, 0.08);
      render();
      say(`${o.say}. ${o.out}`);
    },
    scAgain: () => { S.sc.chosen = null; render(); say('What else could you say?'); },
    scNext: () => { S.sc = { i: (S.sc.i + 1) % D.SCENARIOS.length, chosen: null, explored: [] }; render(); say(A.VOICE.scen()); }
  });

  // ================================================================ 3. Feelings and support match
  const FEEL6 = [['happy', null], ['sad', null], ['angry', null], ['worried', null], ['scared', null], ['tired', '😴']];
  const feelArt = (k, size) => { const f = FEEL6.find((x) => x[0] === k); return f && f[1] ? emo(f[1], size * 0.85) : L.face(k, size); };
  A.PARENT.fsm = 'together';
  A.VOICE.fsm = () => ({ 1: 'How do you feel?', 2: 'What would help you?', 3: `Let's try it together.`, 4: 'How do you feel now?' }[S.fs.step]);
  A.SCREENS.fsm = () => {
    const f = S.fs;
    let main = '';
    if (f.step === 1 || f.step === 4) {
      main = `<div class="fs-faces">${FEEL6.map(([k]) => `<button class="fs-face ${f.step === 1 && f.feel === k ? 'on' : ''}" data-a="fsFeel" data-v="${k}">${feelArt(k, 120)}<span>${k[0].toUpperCase() + k.slice(1)}</span></button>`).join('')}</div>`;
      if (f.step === 4 && f.after) main = `<div class="fs-thanks">${feelArt(f.after, 150)}<p>Thank you for showing me.</p>${ic('heart', 50)}</div>`;
    } else if (f.step === 2) {
      main = `<div class="fs-supports">${D.SUPPORTS.map((sp) => `<button class="fs-sup ${f.supports.includes(sp.id) ? 'on' : ''}" data-a="fsSup" data-v="${sp.id}" aria-pressed="${f.supports.includes(sp.id)}">${ic(sp.icon, 54)}<span>${sp.label}</span></button>`).join('')}</div>`;
    } else {
      const chosen = D.SUPPORTS.filter((sp) => f.supports.includes(sp.id));
      const tools = chosen.filter((sp) => sp.go).map((sp) => {
        if (sp.go === 'calm') return `<button class="g-btn" data-a="fsCalm">${ic('cloud', 20)}<span>Open the calm corner</span></button>`;
        if (sp.go === 'jump') return `<div class="jump-box"><span class="small">Jump together</span><button class="jump-btn" data-a="fsJump">${f.jumps || 0}</button></div>`;
        return `<div class="timer-box"><span class="small">Break</span><button class="timer-btn" data-a="fsTimer" id="fsTimer">${f.timerEnd ? fmtLeft(f.timerEnd) : '5:00'}</button></div>`;
      }).join('');
      main = `<div class="fs-try">
        <div class="fs-chosen">${chosen.map((sp) => `<span class="fs-sup on">${ic(sp.icon, 64)}<span>${sp.label}</span></span>`).join('')}</div>
        <div class="fs-ideas"><div class="g-h">${ic('together', 22)} For ${esc(partner())}: ideas to try</div>
          <ul>${chosen.map((sp) => sp.ideas.map((i) => `<li>${esc(i)}</li>`).join('')).join('')}</ul>
          <div class="row gap12 wrap">${tools}</div></div>
      </div>`;
    }
    const next = f.step === 2
      ? `<button class="primary ${f.supports.length ? '' : 'faded'}" data-a="fsNext" style="height:80px">${ic('arrow', 32)}<span>Try it</span></button>`
      : f.step === 3 ? `<button class="primary" data-a="fsNext" style="height:80px">${ic('check', 32)}<span>We tried it</span></button>`
        : f.step === 4 && f.after ? `<button class="primary" data-a="nav" data-to="together" style="height:80px">${ic('together', 32)}<span>Finish</span></button>` : '';
    return `
<section class="screen together-screen" aria-label="Feelings and help">
  ${A.srTitle('Feelings and help')}
  ${header('Feelings and help', 'heart', A.VOICE.fsm(), f.step === 3 ? 'partner' : 'child')}
  <div class="fs-steps">${[1, 2, 3, 4].map((n) => `<span class="fs-step ${n === f.step ? 'now' : n < f.step ? 'done' : ''}">${n < f.step ? ic('check', 18) : n}</span>`).join('')}<span class="fs-q">${A.VOICE.fsm()}</span></div>
  <div class="panel fs-stage grow">${main}</div>
  ${next ? `<div class="row between" style="flex:none"><span class="small muted">No need to explain. Pictures are enough.</span>${next}</div>` : ''}
</section>`;
  };
  const fmtLeft = (end) => { const s = Math.max(0, Math.round((end - Date.now()) / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  A.AFTER.fsm = () => {
    if (S.fs.timerEnd) every(() => {
      const b = document.getElementById('fsTimer');
      if (b) b.textContent = fmtLeft(S.fs.timerEnd);
      if (Date.now() >= S.fs.timerEnd) { S.fs.timerEnd = null; tone(659, 0.8, 0.1); say('Break time is finished.'); render(); }
    }, 1000);
  };
  A.GUIDE.fsm = () => {
    const f = S.fs;
    if (!f) return null;
    if (f.step === 1) return { sel: '.fs-face', say: 'Tap how you feel.', delay: state.settings.guideDelay * 1000 + 4000 };
    if (f.step === 2) return f.supports.length ? { sel: '[data-a="fsNext"]', say: 'Tap Try it.' } : { sel: '.fs-sup', say: 'Tap what would help.', delay: state.settings.guideDelay * 1000 + 4000 };
    if (f.step === 3) return { sel: '[data-a="fsNext"]', say: 'When you have tried it, tap We tried it.', delay: 20000 };
    return f.after ? { sel: '[data-a="nav"][data-to="together"]', say: 'Tap Finish.' } : { sel: '.fs-face', say: 'How do you feel now?', delay: state.settings.guideDelay * 1000 + 4000 };
  };
  Object.assign(A.ACTIONS, {
    fsFeel: (d) => {
      const f = S.fs;
      if (f.step === 1) { f.feel = d.v; track('feelings', d.v); f.step = 2; render(); say(`You feel ${d.v}. What would help you?`); return; }
      f.after = d.v;
      track('feelings', d.v);
      finishTogether('Feelings and help', 2);
      render();
      say(`You feel ${d.v} now. Thank you for showing me.`);
    },
    fsSup: (d) => {
      const f = S.fs;
      const i = f.supports.indexOf(d.v);
      if (i >= 0) f.supports.splice(i, 1); else if (f.supports.length < 2) f.supports.push(d.v); else f.supports = [f.supports[1], d.v];
      tone(600, 0.2, 0.06);
      render();
      say(D.SUPPORTS.find((x) => x.id === d.v).label);
    },
    fsNext: () => {
      const f = S.fs;
      if (f.step === 2 && !f.supports.length) { say('Tap what would help first.'); return; }
      f.step += 1;
      render();
      say(A.VOICE.fsm());
    },
    fsCalm: () => { S.mode = 'free'; A.resetCalm(); go('calm'); },
    fsJump: () => { S.fs.jumps = ((S.fs.jumps || 0) % 10) + 1; tone(392 + S.fs.jumps * 40, 0.2, 0.08); render(); say(String(S.fs.jumps)); },
    fsTimer: () => { S.fs.timerEnd = Date.now() + 5 * 60000; render(); say('Five minute break. Lumi will tell you when it is finished.'); }
  });

  // ================================================================ 4. Cooperative missions
  A.PARENT.mission = 'together';
  function taskNow() { const m = D.MISSIONS[S.ms.m]; return m.tasks[S.ms.t]; }
  function startTask() {
    const t = taskNow();
    S.ms.sub = { choice: null, said: false, placed: [], tray: t.type === 'order' ? shuffle(t.steps) : [], turn: 'child', tries: 0, calm: null };
  }
  A.VOICE.mission = () => {
    if (S.ms.m === null) return 'Pick a mission to do together.';
    if (S.ms.won) return 'Mission complete! You did it together.';
    return taskNow().text;
  };
  A.SCREENS.mission = () => {
    const ms = S.ms;
    if (ms.m === null) {
      const cards = D.MISSIONS.map((m, i) => `<button class="together-card" data-a="msPick" data-v="${i}" style="background:${m.tint}">
        <span class="together-ic">${ic(m.icon, 58)}</span><span class="col"><span class="game-name">${m.name}</span><span class="row gap4">${ic('starGrey', 22)}${ic('starGrey', 22)}${ic('starGrey', 22)}</span></span></button>`).join('');
      return `<section class="screen together-screen" aria-label="Team missions">${A.srTitle('Team missions')}
        ${header('Team mission', 'flag', A.VOICE.mission(), null)}
        <div class="together-grid three grow">${cards}</div></section>`;
    }
    const m = D.MISSIONS[ms.m];
    const t = taskNow();
    const sub = ms.sub;
    const path = m.tasks.map((x, i) => `<span class="ms-node ${ms.stars[i] ? 'got' : i === ms.t ? 'now' : ''}">${ms.stars[i] ? ic('star', 46) : ic({ ask: 'chat', order: 'sort', calm: 'heart' }[x.type], 32)}</span>${i < 2 ? '<span class="ms-line"></span>' : ''}`).join('');
    let main = '';
    if (t.type === 'ask') {
      main = `<div class="ms-ask">
        <div class="msg-bar static"><span class="msg-chip" style="background:#FFF4C7;border-color:#E0B83A">${ic('me', 34)}<span>I</span></span><span class="msg-chip" style="background:#E3F3DA;border-color:#5E9E45">${ic('want', 34)}<span>want</span></span>${sub.choice ? `<span class="msg-chip" style="background:#FDE6CF;border-color:#E0913E">${emo(sub.choice[0], 34)}<span>${esc(sub.choice[1])}</span></span>` : '<span class="msg-chip empty">?</span>'}
          <button class="say-btn" data-a="msSay" aria-label="Say it">${ic('speaker', 36)}</button></div>
        <div class="row gap16 center">${t.choices.map((c, k) => `<button class="ms-choice ${sub.choice === c ? 'on' : ''}" data-a="msChoose" data-k="${k}">${emo(c[0], 80)}<span>${esc(c[1])}</span></button>`).join('')}</div>
        ${sub.said ? `<button class="invite-btn" data-a="msHeard">${partnerAvatar(54)}<span>${esc(partner())}: "I heard you!"</span></button>` : ''}
      </div>`;
    } else if (t.type === 'order') {
      const slots = t.steps.map((id, i) => {
        const placed = sub.placed[i];
        const info = placed ? A.stepInfo({ id: placed }) : null;
        return `<span class="ms-slot ${placed ? 'on' : ''}"><span class="ms-num">${i + 1}</span>${info ? `${A.stepArt(info, 70)}<span>${esc(info.label)}</span>` : ''}</span>`;
      }).join('');
      const tray = sub.tray.filter((id) => !sub.placed.includes(id)).map((id) => { const info = A.stepInfo({ id }); return `<button class="ms-card" data-a="msPlace" data-v="${id}" style="background:${info.tint}">${A.stepArt(info, 76)}<span>${esc(info.label)}</span></button>`; }).join('');
      main = `<div class="ms-order">
        <div class="turn-banner small ${sub.turn}">${sub.turn === 'child' ? childAvatar(44) : partnerAvatar(44)}<span>${sub.turn === 'child' ? 'Your turn' : esc(partner()) + "'s turn"}</span></div>
        <div class="ms-slots">${slots}</div><div class="ms-tray">${tray}</div></div>`;
    } else {
      const ch = sub.calm ? D.CALM_CHOICES.find((c) => c.id === sub.calm) : null;
      main = `<div class="ms-calm">
        <div class="col center">${L.svg({ look: A.lookWith(), mood: ch ? 'calm' : t.feeling, size: 220 })}${ch ? `<span class="calm-said">${ic(ch.icon, 30)}<span>${esc(ch.label)} helps Lumi feel calm.</span></span>` : ''}</div>
        <div class="ms-calm-grid">${D.CALM_CHOICES.slice(0, A.level() === 1 ? 4 : 6).map((c) => `<button class="fs-sup ${sub.calm === c.id ? 'on' : ''}" data-a="msCalm" data-v="${c.id}">${ic(c.icon, 50)}<span>${c.label}</span></button>`).join('')}</div>
      </div>`;
    }
    return `
<section class="screen together-screen" aria-label="${esc(m.name)}">
  ${A.srTitle(m.name)}
  ${header(m.name, m.icon, A.VOICE.mission(), t.type === 'order' ? sub.turn : null)}
  <div class="ms-path">${path}<span class="ms-task">${esc(t.text)}</span></div>
  <div class="panel ms-stage grow">${main}</div>
  ${ms.won ? teamwork('Mission complete!', 'msAgain') : ''}
</section>`;
  };
  A.GUIDE.mission = () => {
    const ms = S.ms;
    if (!ms || ms.won) return null;
    if (ms.m === null) return { sel: '[data-a="msPick"]', say: 'Pick a mission.', delay: state.settings.guideDelay * 1000 + 3000 };
    const t = taskNow();
    const sub = ms.sub;
    if (t.type === 'ask') {
      if (!sub.choice) return { sel: '[data-a="msChoose"]', say: 'Tap what you want.', delay: state.settings.guideDelay * 1000 + 3000 };
      if (!sub.said) return { sel: '[data-a="msSay"]', say: 'Tap the speaker to ask.' };
      return { sel: '[data-a="msHeard"]', say: `${partner()}, tap I heard you.` };
    }
    if (t.type === 'order') {
      const nextId = t.steps[sub.placed.length];
      return { sel: `[data-a="msPlace"][data-v="${nextId}"]`, say: 'What comes next?', quiet: !sub.tries, delay: sub.tries ? 400 : state.settings.guideDelay * 1000 + 6000 };
    }
    return sub.calm ? null : { sel: '[data-a="msCalm"]', say: 'Pick something that helps Lumi.', delay: state.settings.guideDelay * 1000 + 3000 };
  };
  function taskStar() {
    const ms = S.ms;
    ms.stars[ms.t] = true;
    tone(784, 0.3, 0.09);
    setTimeout(() => tone(1047, 0.5, 0.09), 150);
    if (ms.stars.every(Boolean)) {
      ms.won = true;
      state.stats.missions = (state.stats.missions || 0) + 1;
      finishTogether(D.MISSIONS[ms.m].name, 3);
      render();
      say('Mission complete! You did it together.');
      return;
    }
    render();
    say('A star! Next task.');
    later(() => { ms.t += 1; startTask(); render(); say(taskNow().text); }, 1500);
  }
  Object.assign(A.ACTIONS, {
    msPick: (d) => { S.ms = { m: Number(d.v), t: 0, stars: [false, false, false], won: false }; startTask(); render(); say(taskNow().text); },
    msChoose: (d) => { const sub = S.ms.sub; sub.choice = taskNow().choices[Number(d.k)]; sub.said = false; render(); say(sub.choice[1]); },
    msSay: () => {
      const sub = S.ms.sub;
      if (!sub.choice) { say('Pick what you want first.'); return; }
      say(`I want ${sub.choice[1].toLowerCase()}.`);
      state.stats.talkUses += 1;
      track('talk', `I want ${sub.choice[1].toLowerCase()}`);
      sub.said = true;
      later(render, 600);
    },
    msHeard: () => { say('I heard you!'); taskStar(); },
    msPlace: (d, el) => {
      const t = taskNow();
      const sub = S.ms.sub;
      const want = t.steps[sub.placed.length];
      if (d.v === want) {
        sub.placed.push(d.v);
        sub.tries = 0;
        tone(523 + sub.placed.length * 80, 0.3, 0.08);
        say(A.stepInfo({ id: d.v }).label);
        if (sub.placed.length === t.steps.length) { taskStar(); return; }
        sub.turn = sub.turn === 'child' ? 'partner' : 'child';
        render();
        later(() => say(sub.turn === 'child' ? 'Your turn.' : `${partner()}'s turn.`), 900);
      } else {
        if (!sub.tries) track('tries', 'mission', { quiet: true });
        sub.tries += 1;
        el.classList.remove('wiggle-once');
        void el.offsetWidth;
        el.classList.add('wiggle-once');
        say('Good try! What comes next? Help each other.');
        A.applyGuide();
      }
    },
    msCalm: (d) => {
      const sub = S.ms.sub;
      if (sub.calm) return;
      sub.calm = d.v;
      render();
      say(`${D.CALM_CHOICES.find((c) => c.id === d.v).label} helps Lumi feel calm. Thank you!`);
      later(taskStar, 1800);
    },
    msAgain: () => { S.ms = { m: null }; render(); say(A.VOICE.mission()); }
  });

  // ================================================================ open activities, partner
  Object.assign(A.ACTIONS, {
    tOpen: (d) => {
      if (d.v === 'tt') S.tt = newTT();
      if (d.v === 'scen') S.sc = { i: S.sc ? (S.sc.i + 1) % D.SCENARIOS.length : 0, chosen: null, explored: [] };
      if (d.v === 'fsm') S.fs = { step: 1, feel: null, supports: [], after: null };
      if (d.v === 'mission') S.ms = { m: null };
      go(d.v);
    },
    tPartner: (d) => { state.profile.partner = d.v; save(); render(); say(`Playing with ${d.v}.`); },
    tReal: () => { S.realCards = !S.realCards; render(); }
  });
})();
