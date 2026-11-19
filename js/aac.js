/*
  aac.js
  The talk board, built like an AAC (augmentative and alternative communication) app:
  - a message bar at the top that collects symbols, then speaks the whole sentence
  - core words that never move (so children build motor memory), coloured by the Fitzgerald Key
  - folders for feelings, phrases, food, play, places, people and the child's own photo words
  - grid size follows the difficulty level (12, 24 or 35 buttons), plus an ABC keyboard on Challenge
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, save, award, track, render, go, later, applyGuide, hintNow, dots } = A;

  const GRID = { 1: [4, 3], 2: [6, 4], 3: [7, 5] };
  // Here: words for where the child is right now. Core words stay where they are.
  const HERE = {
    home: ['Home', 'home', [['h-drink', 'drink', 'verb', 'drink'], ['h-eat', 'eat', 'verb', 'eat'], ['h-snack', 'snack', 'noun', 'snack'], ['h-toilet', 'toilet', 'noun', 'toilet'], ['h-tablet', 'tablet', 'noun', 'tablet'], ['h-tv', 'TV', 'noun', 'sTablet'], ['h-bath', 'bath', 'noun', 'bath'], ['h-bed', 'bed', 'noun', 'sMoon'], ['h-hug', 'hug', 'verb', 'hug'], ['h-play', 'play', 'verb', 'ball'], ['h-music', 'music', 'noun', 'music'], ['h-tired', 'tired', 'feel', 'sleep']]],
    school: ['School', 'school', [['s-teacher', 'teacher', 'people', 'person'], ['s-friend', 'friend', 'people', 'together'], ['s-toilet', 'toilet', 'noun', 'toilet'], ['s-drink', 'water', 'noun', 'drink'], ['s-help', 'help', 'verb', 'help'], ['s-pencil', 'pencil', 'noun', 'pencil'], ['s-book', 'book', 'noun', 'book'], ['s-lunch', 'lunchbox', 'noun', 'lunchbox'], ['s-bag', 'bag', 'noun', 'bag'], ['s-break', 'break', 'noun', 'kBreak'], ['s-notunderstand', "I don't understand", 'q', 'what'], ['s-finished', 'finished', 'desc', 'wDone']]],
    out: ['Out', 'busLine', [['o-bus', 'bus', 'noun', 'bus'], ['o-train', 'MRT', 'noun', 'train'], ['o-card', 'my card', 'noun', 'buscard'], ['o-toilet', 'toilet', 'noun', 'toilet'], ['o-wait', 'wait', 'verb', 'hourglass'], ['o-lost', 'I am lost', 'neg', 'pin'], ['o-loud', 'too loud', 'desc', 'volume'], ['o-home', 'go home', 'verb', 'home'], ['o-howmuch', 'how much?', 'q', 'shop'], ['o-rain', 'rain', 'noun', 'umbrella'], ['o-stop', 'stop', 'neg', 'stop'], ['o-thisone', 'this one', 'desc', 'thumb']]],
    clinic: ['Clinic', 'dentist', [['c-hurt', 'it hurts', 'neg', 'hurt'], ['c-here', 'here', 'desc', 'pin'], ['c-medicine', 'medicine', 'noun', 'medicine'], ['c-wait', 'wait', 'verb', 'hourglass'], ['c-scared', 'scared', 'feel', 'hand'], ['c-stop', 'stop', 'neg', 'stop'], ['c-hand', 'hold my hand', 'verb', 'hand'], ['c-yes', 'yes', 'social', 'yes'], ['c-no', 'no', 'neg', 'no'], ['c-done', 'all done?', 'q', 'wDone'], ['c-toilet', 'toilet', 'noun', 'toilet'], ['c-tissue', 'tissue', 'noun', 'tissue']]],
    meal: ['Meal', 'cutlery', [['m-more', 'more', 'desc', 'wMore'], ['m-finished', 'finished', 'desc', 'wDone'], ['m-eat', 'eat', 'verb', 'eat'], ['m-drink', 'drink', 'verb', 'drink'], ['m-hot', 'hot', 'desc', 'hot'], ['m-cold', 'cold', 'desc', 'cold'], ['m-yummy', 'yummy', 'desc', 'smile'], ['m-dontlike', "don't like", 'neg', 'dont'], ['m-spoon', 'spoon', 'noun', 'cutlery'], ['m-rice', 'rice', 'noun', 'sRice'], ['m-noodles', 'noodles', 'noun', 'sNoodles'], ['m-water', 'water', 'noun', 'drop']]],
    play: ['Play', 'ball', [['p-myturn', 'my turn', 'people', 'me'], ['p-yourturn', 'your turn', 'people', 'you'], ['p-again', 'again', 'desc', 'wMore'], ['p-stop', 'stop', 'neg', 'stop'], ['p-help', 'help', 'verb', 'help'], ['p-ball', 'ball', 'noun', 'ball'], ['p-puzzle', 'puzzle', 'noun', 'puzzle'], ['p-swing', 'swing', 'noun', 'tree'], ['p-music', 'music', 'noun', 'music'], ['p-share', 'share', 'verb', 'together'], ['p-fast', 'fast', 'desc', 'jump'], ['p-finished', 'finished', 'desc', 'wDone']]]
  };
  const HERE_WORDS = Object.values(HERE).flatMap((h) => h[2].map(([id, label, t, icon]) => ({ id, label, t, icon })));
  // guess where the child is from the step they are on (they can always change it)
  const HERE_FROM_STEP = { school: 'school', bus: 'out', train: 'out', park: 'play', play: 'play', dentist: 'clinic', therapy: 'clinic', haircut: 'out', breakfast: 'meal', lunch: 'meal', dinner: 'meal', hawker: 'meal', cook: 'meal', wake: 'home', teeth: 'home', bath: 'home', bedtime: 'home' };
  const hereNow = () => { if (S.aacHere) return S.aacHere; const st = S.day && S.day.plan[S.day.i]; const k = st && HERE_FROM_STEP[st.type || st.id]; return k || 'home'; };
  const FOLDER_COLOURS = { here: '#2F7E79', out: '#4A78A8', core: '#2F7E79', feel: '#7E64C8', quick: '#C98A1E', food: '#E0913E', play: '#4F8A3F', places: '#4A78A8', people: '#C99A10', my: '#C2577A', abc: '#6B5A4E' };

  function folders() {
    const list = D.WORD_FOLDERS.filter((f) => !f.minAge || state.profile.age === f.minAge || A.level() === 3);
    list.splice(1, 0, { id: 'here', name: 'Here', icon: 'pin' });
    if (A.level() === 3 || state.profile.age === 'teen') list.push({ id: 'abc', name: 'Type', icon: 'text' });
    return list;
  }
  function wordsIn(folder) {
    if (folder === 'my') return state.myWords.map((w) => Object.assign({ t: 'misc' }, w));
    if (folder === 'here') return HERE[hereNow()][2].map(([id, label, t, icon]) => ({ id, label, t, icon }));
    return D.WORDS[folder] || [];
  }
  function findWord(id) {
    if (String(id).startsWith('txt:')) return { id, label: id.slice(4), t: 'misc', typed: true };
    const hw = HERE_WORDS.find((x) => x.id === id); if (hw) return hw;
    for (const f of Object.keys(D.WORDS)) {
      const w = D.WORDS[f].find((x) => x.id === id);
      if (w) return w;
    }
    return state.myWords.find((x) => x.id === id) || { id, label: id, t: 'misc' };
  }
  function wordArt(w, size) {
    if (w.photo) return `<img class="word-photo" src="${w.photo}" width="${size}" height="${size}" alt="">`;
    if (w.face) return L.face(w.face, size);
    if (w.emoji) return `<span class="emoji" style="font-size:${Math.round(size * 0.82)}px">${w.emoji}</span>`;
    if (w.typed) return `<span class="typed-ic" style="font-size:${Math.round(size * 0.4)}px">Aa</span>`;
    const ty = D.WORD_TYPES[w.t] || D.WORD_TYPES.misc;
    return `<span style="color:${ty.stroke === '#FFFFFF' ? 'var(--ink)' : darker(ty.stroke)}">${ic(w.icon || 'star', size)}</span>`;
  }
  const darker = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.round(v * 0.72));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };
  const sentenceText = () => S.talk.map((id) => findWord(id).label).join(' ');

  function replyArt(ch) {
    if (ch.id === 'late') return `${ic('bus', 40)}<span class="ic-amber">${ic('clock', 30)}</span><span class="big-num sm">5</span>${dots(5, 5, 'var(--changed)', 14)}`;
    if (ch.id === 'rain') return `${L.item('raincoat', 46)}${L.item('boots', 40)}<span class="ic-green">${ic('check', 30)}</span>`;
    return `${ic('busPurple', 44)}${ic('school', 40)}<span class="ic-green">${ic('check', 30)}</span>`;
  }

  A.VOICE.talk = () => (S.mode === 'flow' ? "Now help Lumi say it. Tap What's next." : 'Tap the pictures to talk.');
  A.SCREENS.talk = () => {
    const flow = S.mode === 'flow';
    const ch = A.activeChange();
    const folder = S.aacFolder || 'core';
    const [cols, rows] = GRID[A.level()] || GRID[2];
    const chips = S.talk.map((id) => {
      const w = findWord(id);
      const ty = D.WORD_TYPES[w.t] || D.WORD_TYPES.misc;
      return `<span class="msg-chip" style="background:${ty.tint};border-color:${ty.stroke}">${wordArt(w, 36)}<span>${esc(w.label)}${A.l2Html ? A.l2Html(w.label, w) : ''}</span></span>`;
    }).join('');
    const folderBtns = folders().map((f) => {
      const on = folder === f.id;
      const c = FOLDER_COLOURS[f.id] || '#6B5A4E';
      const art = f.emoji ? `<span class="emoji" style="font-size:26px">${f.emoji}</span>` : ic(f.icon, 26);
      return `<button class="folder ${on ? 'on' : ''}" data-a="aacFolder" data-v="${f.id}" aria-pressed="${on}" style="--fc:${c}"><span class="folder-ic">${art}</span><span>${f.name}${A.l2Html ? A.l2Html(f.name) : ''}</span></button>`;
    }).join('');

    let grid;
    if (folder === 'abc') {
      const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
      grid = `<div class="abc">
        <div class="abc-typed" role="status">${esc(S.typed || '') || '<span class="muted">Type a word</span>'}</div>
        <div class="abc-keys">${keys.map((k) => `<button class="key" data-a="aacKey" data-v="${k}">${k}</button>`).join('')}
          <button class="key wide" data-a="aacKey" data-v="back" aria-label="Delete letter">${ic('backspace', 26)}</button>
          <button class="key wide add" data-a="aacKey" data-v="add">${ic('plus', 22)}<span>Add word</span></button></div>
      </div>`;
    } else {
      const words = wordsIn(folder).slice(0, folder === 'core' ? cols * rows : 40);
      const n = Math.max(cols * rows, words.length);
      const r = Math.ceil(n / cols);
      let cells = words.map((w) => {
        const ty = D.WORD_TYPES[w.t] || D.WORD_TYPES.misc;
        return `<button class="word ${S.talk.includes(w.id) ? 'sel' : ''}" data-a="addWord" data-id="${esc(w.id)}" style="background:${ty.tint};border-color:${ty.stroke}"><span class="word-art">${wordArt(w, cols >= 7 ? 40 : cols >= 6 ? 48 : 64)}</span><span class="word-label">${esc(w.label)}${A.l2Html ? A.l2Html(w.label, w) : ''}</span></button>`;
      }).join('');
      if (folder === 'my' && !words.length) cells = `<div class="aac-empty">${ic('camera', 44)}<p>Grown-ups can add words with real photos here.</p><p class="small muted">Grown-ups › Activities › Talk words</p></div>`;
      for (let i = words.length; i < n && words.length; i++) cells += '<span class="word empty" aria-hidden="true"></span>';
      grid = `<div class="aac-grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${r},1fr)">${cells}</div>`;
      if (folder === 'here') {
        const cur = hereNow();
        grid = `<div class="col grow gap8" style="min-width:0;min-height:0"><div class="here-row" role="group" aria-label="Where are you?">${Object.entries(HERE).map(([k, h]) => `<button class="here-chip ${cur === k ? 'on' : ''}" data-a="aacHere" data-v="${k}" aria-pressed="${cur === k}">${ic(h[1], 26)}<span>${h[0]}</span></button>`).join('')}</div>${grid.replace('class="aac-grid"', 'class="aac-grid grow"')}</div>`;
      }
    }

    const bottom = flow
      ? `<div class="row between" style="height:80px;flex:none">
           <div class="reply ${S.replyShown ? 'shown' : ''}" role="status" aria-label="${S.replyShown && ch ? esc(ch.reply) : 'Waiting for a reply'}">${S.replyShown && ch ? replyArt(ch) : `<span class="ic-muted">${ic('chat', 30)}</span><span class="typing"><i></i><i></i><i></i></span>`}</div>
           ${A.stepPills('say')}
           <button class="primary ${S.replyShown ? '' : 'faded'}" data-a="talkNext" aria-label="Next: calm down together" style="height:72px">${ic('cloud', 36)}${ic('arrow', 28)}</button>
         </div>`
      : '';
    return `
<section class="screen tight aac" aria-label="Talk board">
  ${A.srTitle('Talk board')}
  <div class="row gap12 aac-top">
    ${A.backBtn()}
    <button class="msg-bar" data-a="sayWords" aria-label="${S.talk.length ? 'Say: ' + esc(sentenceText()) : 'Message is empty'}">${chips || `<span class="sentence-empty">${ic('chat', 30)}<span>Tap pictures to make a message</span></span>`}</button>
    <button class="aac-ctrl" data-a="delWord" aria-label="Delete last word">${ic('backspace', 30)}</button>
    <button class="aac-ctrl" data-a="clearWords" aria-label="Clear message">${ic('x', 28)}</button>
    <button class="say-btn" data-a="sayWords" aria-label="Speak the message">${ic('speaker', 40)}</button>
  </div>
  ${quickStrip()}
  <div class="row gap12 grow" style="align-items:stretch">
    <div class="folder-col" role="group" aria-label="Word folders">${folderBtns}</div>
    ${grid}
  </div>
  ${bottom}
</section>`;
  };

  // quick phrases: one tap says the whole phrase; Repeat, Slower, Stop and Show big for the message
  function quickStrip() {
    const sp = A.supportState ? A.supportState() : null;
    const phrases = sp ? sp.phrases : [];
    return `<div class="quick-strip" role="group" aria-label="Quick phrases">
      <button class="quick-card" data-a="nav" data-to="mycard">${ic('cards', 26)}<span>My card</span></button>
      <div class="quick-phrases">${phrases.map((t) => `<button class="quick-p" data-a="aacQuick" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <div class="play-ctrls" role="group" aria-label="Message controls">
        <button class="aac-ctrl sm" data-a="aacRepeat" aria-label="Say it again">${ic('restart', 24)}<span>Again</span></button>
        <button class="aac-ctrl sm" data-a="aacSlow" aria-label="Say it slowly">${ic('hourglass', 24)}<span>Slow</span></button>
        <button class="aac-ctrl sm" data-a="aacStop" aria-label="Stop talking">${ic('stop', 24)}<span>Stop</span></button>
        <button class="aac-ctrl sm" data-a="aacBig" aria-label="Show the message big">${ic('eye', 24)}<span>Show</span></button>
      </div>
    </div>${S.aacBig ? `<button class="aac-bigmsg" data-a="aacBigOff" aria-label="Close">${S.aacBig.map((w) => `<span class="big-w">${wordArt(w, 90)}<b>${esc(w.label)}</b></span>`).join('')}<small>Tap to close</small></button>` : ''}`;
  }
  A.GUIDE.talk = () => {
    if (S.mode === 'flow') {
      if (S.replyShown) return { sel: '[data-a="talkNext"]', say: 'Tap the arrow.' };
      if (!S.talk.includes('next')) {
        if ((S.aacFolder || 'core') !== 'core') return { sel: '[data-a="aacFolder"][data-v="core"]', say: 'Tap Core.' };
        return { sel: '[data-a="addWord"][data-id="next"]', say: "Tap What's next." };
      }
      if (!S.said) return { sel: '.say-btn', say: 'Tap the speaker to say it.' };
      return null;
    }
    return S.talk.length && !S.said ? { sel: '.say-btn', say: 'Tap the speaker to say it.' } : null;
  };

  Object.assign(A.ACTIONS, {
    aacFolder: (d) => { S.aacFolder = d.v; render(); const f = folders().find((x) => x.id === d.v); if (f && state.settings.speakWords) say(f.name); },
    addWord: (d) => {
      const w = findWord(d.id);
      if (S.talk.length < 8) S.talk.push(w.id);
      S.said = false;
      render();
      if (state.settings.speakWords) say(w.label);
    },
    delWord: () => { S.talk.pop(); S.said = false; render(); },
    clearWords: () => { S.talk = []; S.said = false; render(); },
    sayWords: () => {
      if (!S.talk.length) { say('Tap a picture first.'); return; }
      if (A.sayTalk) A.sayTalk(S.talk.map(findWord)); else say(sentenceText());
      state.stats.talkUses += 1;
      track('talk', sentenceText());
      save();
      if (S.day) S.day.stickers.add('talk');
      const first = !S.said;
      S.said = true;
      if (first) award(1); else A.checkBadges();
      applyGuide();
      const ch = A.activeChange();
      if (S.mode === 'flow' && ch && !S.replyShown) {
        later(() => { S.replyShown = true; render(); say(ch.reply + ' Tap the arrow.'); }, 1800);
      }
    },
    talkNext: () => {
      if (!S.replyShown) { say('Tap the speaker to say it.'); hintNow(); return 'keep'; }
      A.resetCalm();
      go('calm');
    },
    aacHere: (d) => { S.aacHere = d.v; render(); say(HERE[d.v][0]); },
    aacQuick: (d) => {
      say(d.v);
      state.stats.talkUses += 1; track('talk', d.v); save();
      if (A.supportLog) A.supportLog('phrase', d.v);
      if (S.day) S.day.stickers.add('talk');
      const b = A.stage.querySelector(`.quick-p[data-v="${CSS.escape(d.v)}"]`); if (b) { b.classList.remove('said'); void b.offsetWidth; b.classList.add('said'); }
    },
    aacRepeat: () => { if (S.talk.length) { if (A.sayTalk) A.sayTalk(S.talk.map(findWord)); else say(sentenceText()); } else say('Tap pictures first.'); },
    aacSlow: () => {
      if (!S.talk.length) { say('Tap pictures first.'); return; }
      const r = state.settings.voiceRate;
      state.settings.voiceRate = Math.max(0.45, (r || 0.85) * 0.65);
      try { if (A.sayTalk) A.sayTalk(S.talk.map(findWord)); else say(sentenceText()); } finally { state.settings.voiceRate = r; }
    },
    aacStop: () => { try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ } if (window.LumiAudio && window.LumiAudio.stopVoice) window.LumiAudio.stopVoice(); },
    aacBig: () => { if (!S.talk.length) { say('Tap pictures first.'); return; } S.aacBig = S.talk.map(findWord); render(); },
    aacBigOff: () => { S.aacBig = null; render(); },
    aacKey: (d) => {
      S.typed = S.typed || '';
      if (d.v === 'back') S.typed = S.typed.slice(0, -1);
      else if (d.v === 'add') {
        if (S.typed.trim()) { S.talk.push('txt:' + S.typed.trim().toLowerCase()); S.said = false; say(S.typed); }
        S.typed = '';
      } else if (S.typed.length < 16) S.typed += d.v.toLowerCase();
      render();
    }
  });

  // reset the board when it opens from a menu
  const nav = A.ACTIONS.nav;
  A.ACTIONS.nav = (d) => { if (d.to === 'talk') { S.aacFolder = 'core'; S.typed = ''; } return nav(d); };
  const railTalk = A.ACTIONS.railTalk;
  A.ACTIONS.railTalk = (d) => { S.aacFolder = 'core'; return railTalk(d); };
  const feelNext = A.ACTIONS.feelNext;
  A.ACTIONS.feelNext = (d) => { S.aacFolder = 'core'; return feelNext(d); };

  A.findWord = findWord;
  A.wordArt = wordArt;
})();
