/*
  music.js
  The Music corner (Fun › Music): six instruments to play, and two ways to practise rhythm.

  Play            Pick an instrument and play it. A soft backing beat can be switched on (slow, medium, fast)
                  to play along with.
  Keep the beat   A steady beat ticks and four lights take turns. Tap any pad in time with it.
                  Taps that land on the beat fill the row of stars. Taps that miss cost nothing.
  Copy me         Lumi plays a short rhythm (shown as dots: a big dot is a long sound, small dots are quick
                  ones). The child plays it back. Only the pattern is judged, not the speed, so a child who
                  taps slowly still gets it right.

  Instruments: drums, xylophone, piano, ukulele, kompang (the Malay hand drum: "dum" in the middle, "tak" at
  the edge) and shakers. All are made in the browser (Web Audio), so there are no sound files.
  Pads answer on touch-down, not on release, so the sound comes when the finger lands.
  Easy / Medium / Hard changes the speed and the patterns. Nothing is ever marked wrong in red.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, save, render, later, every, stage } = A;

  // ---------------------------------------------------------------- the sound engine
  let ctx = null, master = null, noiseBuf = null;
  const VOLS = [0.35, 0.6, 0.9];
  const vol = () => (state.musicVol == null ? 1 : state.musicVol);
  function engine() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -12; lim.knee.value = 8; lim.ratio.value = 12; lim.attack.value = 0.002; lim.release.value = 0.2;
    master = ctx.createGain();
    master.gain.value = VOLS[vol()];
    master.connect(lim);
    lim.connect(ctx.destination);
    const n = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, n, n);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  // a note: an oscillator that starts at f (and may slide to f2) and dies away
  function note(t, { f, f2, type = 'sine', peak = 0.3, up = 0.004, down = 0.4, lp }) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + up + down * 0.7);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + up); g.gain.exponentialRampToValueAtTime(0.0001, t + up + down);
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(lp[0], t); fl.frequency.exponentialRampToValueAtTime(lp[1], t + up + down); o.connect(fl); fl.connect(g); } else o.connect(g);
    g.connect(master);
    o.start(t); o.stop(t + up + down + 0.05);
  }
  // a puff of filtered noise (a snare, a shaker, the skin of a drum)
  function puff(t, { type = 'bandpass', f = 1800, q = 0.8, peak = 0.3, up = 0.002, down = 0.12 }) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + up); g.gain.exponentialRampToValueAtTime(0.0001, t + up + down);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5); s.stop(t + up + down + 0.05);
  }
  const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25]; // C D E F G A B C
  const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
  const RAINBOW = ['#EF8A7A', '#F3A968', '#F4D35E', '#9CCB7A', '#7CC4B8', '#8EB8E5', '#B9A6E0', '#EF8A7A'];
  const SOUND = {
    kick: (t) => note(t, { f: 125, f2: 45, peak: 0.95, down: 0.28 }),
    snare: (t) => { puff(t, { f: 1900, q: 0.6, peak: 0.42, down: 0.14 }); note(t, { f: 190, f2: 150, peak: 0.3, down: 0.1 }); },
    hat: (t) => puff(t, { type: 'highpass', f: 6500, peak: 0.34, down: 0.06 }),
    tom: (t) => note(t, { f: 210, f2: 110, peak: 0.7, down: 0.3 }),
    ting: (t) => { note(t, { f: 1760, peak: 0.16, down: 0.7 }); puff(t, { type: 'highpass', f: 5000, peak: 0.12, down: 0.3 }); },
    xylo: (t, i) => { note(t, { f: SCALE[i] * 2, peak: 0.34, down: 0.5 }); note(t, { f: SCALE[i] * 8, peak: 0.05, down: 0.12 }); },
    piano: (t, i, f) => { const fr = f || SCALE[i]; note(t, { f: fr, type: 'triangle', peak: 0.36, down: 1.1 }); note(t, { f: fr * 2, peak: 0.08, down: 0.6 }); },
    uke: (t, i) => note(t, { f: [392.0, 261.63, 329.63, 440.0][i], type: 'sawtooth', peak: 0.4, down: 0.8, lp: [3200, 500] }),
    dum: (t) => { note(t, { f: 150, f2: 85, peak: 0.85, down: 0.32 }); puff(t, { type: 'lowpass', f: 500, peak: 0.25, down: 0.06 }); },
    tak: (t) => { puff(t, { f: 2600, q: 1.2, peak: 0.8, down: 0.07 }); note(t, { f: 620, f2: 500, peak: 0.34, down: 0.06, type: 'triangle' }); },
    shake: (t) => { puff(t, { type: 'highpass', f: 5200, peak: 0.5, up: 0.02, down: 0.07 }); puff(t + 0.09, { type: 'highpass', f: 5600, peak: 0.34, up: 0.015, down: 0.06 }); },
    shake2: (t) => puff(t, { type: 'highpass', f: 4300, peak: 0.5, up: 0.03, down: 0.12 }),
    tick: (t, strong) => note(t, { f: strong ? 1150 : 880, type: 'triangle', peak: strong ? 0.16 : 0.1, down: 0.05 })
  };
  const BLACK = [277.18, 311.13, null, 369.99, 415.3, 466.16, null]; // the black keys between the white ones

  // ---------------------------------------------------------------- the instruments
  const pad = (s, i, cls, style, inner, label, extra) => `<button class="mu-pad ${cls}" data-s="${s}" data-i="${i == null ? '' : i}" ${extra || ''} style="${style || ''}" aria-label="${esc(label)}">${inner || ''}</button>`;
  const INSTRUMENTS = [
    { id: 'drums', name: 'Drums', main: ['kick'],
      art: '<circle cx="24" cy="27" r="15" fill="#F6D2C8" stroke="#C0674A" stroke-width="3.5"/><circle cx="24" cy="27" r="8" fill="#fff" stroke="#C0674A" stroke-width="2.5"/><path d="M8 8l10 9M40 8l-10 9" stroke="#8A6A4A" stroke-width="3.5" stroke-linecap="round"/>',
      draw: () => `<div class="mu-kit">
        ${pad('ting', null, 'mu-drum cym', '--c:#F6E08C;--d:#C99A1E;left:1%;top:5%;width:20%', '<span class="dr-stand"></span><span class="dr-cym"><b>Ting</b></span>', 'Cymbal')}
        ${pad('hat', null, 'mu-drum cym', '--c:#F6E08C;--d:#C99A1E;right:1%;top:5%;width:20%', '<span class="dr-stand"></span><span class="dr-cym"><b>Tss</b></span>', 'Hi-hat')}
        ${pad('tom', null, 'mu-drum', '--c:#BFD8EE;--d:#4A78A8;left:38%;top:2%;width:20%', '<span class="dr-shell"></span><span class="dr-head"><b>Tom</b></span>', 'Tom drum')}
        ${pad('snare', null, 'mu-drum', '--c:#CFE3C4;--d:#4F8A3F;left:17%;top:42%;width:27%', '<span class="dr-shell"></span><span class="dr-head"><b>Tap</b></span>', 'Snare drum')}
        ${pad('kick', null, 'mu-drum', '--c:#F6D2C8;--d:#C0674A;right:13%;top:38%;width:30%', '<span class="dr-shell"></span><span class="dr-head"><b>Boom</b></span>', 'Bass drum')}
      </div>` },
    { id: 'xylo', name: 'Xylophone', main: ['xylo', 0],
      art: '<rect x="6" y="8" width="7" height="32" rx="3" fill="#EF8A7A"/><rect x="15.5" y="11" width="7" height="26" rx="3" fill="#F4D35E"/><rect x="25" y="14" width="7" height="20" rx="3" fill="#9CCB7A"/><rect x="34.5" y="17" width="7" height="14" rx="3" fill="#8EB8E5"/>',
      draw: () => `<div class="mu-xylo"><svg class="xy-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="-2,12 102,30 102,35.5 -2,17.5" fill="#A8744A"/><polygon points="-2,12 102,30 102,31.5 -2,13.5" fill="#D9A877"/><polygon points="-2,88 102,70 102,64.5 -2,82.5" fill="#8A5A34"/><polygon points="-2,82.5 102,64.5 102,66 -2,84" fill="#C99568"/></svg>${SCALE.map((_, i) => pad('xylo', i, 'mu-bar', `--c:${RAINBOW[i]};height:${100 - i * 6.5}%`, `<b>${NAMES[i]}</b>`, `Note ${NAMES[i]}`)).join('')}</div>` },
    { id: 'piano', name: 'Piano', main: ['piano', 0],
      art: '<rect x="5" y="10" width="38" height="28" rx="5" fill="#fff" stroke="#5A4B45" stroke-width="3"/><path d="M14.5 10v28M24 10v28M33.5 10v28" stroke="#5A4B45" stroke-width="2.4"/><rect x="11.5" y="10" width="6" height="16" rx="2" fill="#5A4B45"/><rect x="30.5" y="10" width="6" height="16" rx="2" fill="#5A4B45"/>',
      draw: () => `<div class="mu-piano">${SCALE.map((_, i) => pad('piano', i, 'mu-key', `--c:${RAINBOW[i]}`, `<i></i><b>${NAMES[i]}</b>`, `Note ${NAMES[i]}`)).join('')}
        ${BLACK.map((f, i) => (f ? pad('piano', null, 'mu-black', `left:${(i + 1) * 12.5}%`, '', 'Black key', `data-f="${f}"`) : '')).join('')}</div>` },
    { id: 'uke', name: 'Ukulele', main: ['uke', 1],
      art: '<circle cx="18" cy="31" r="12" fill="#E9C9A0" stroke="#8A6A4A" stroke-width="3"/><circle cx="18" cy="31" r="4" fill="#8A6A4A"/><path d="M26 23l14-14" stroke="#8A6A4A" stroke-width="6" stroke-linecap="round"/>',
      draw: () => `<div class="mu-uke"><svg class="uke-body" viewBox="0 0 135 100" aria-hidden="true"><defs><radialGradient id="ukW" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#F6DDB6"/><stop offset=".6" stop-color="#E2B984"/><stop offset="1" stop-color="#C08A55"/></radialGradient></defs><path d="M46 5C70 5 74 21 86 19C112 13 134 27 134 50S112 87 86 81C74 79 70 95 46 95C20 95 2 75 2 50S20 5 46 5Z" fill="#8A5A34"/><path d="M46 3C70 3 74 19 86 17C112 11 133 25 133 48S112 85 86 79C74 77 70 93 46 93C20 93 3 73 3 48S20 3 46 3Z" fill="url(#ukW)" stroke="#8A5A34" stroke-width="2.5"/><path d="M46 8C68 8 72 23 86 22C109 17 128 29 128 48S109 79 86 75C72 74 68 88 46 88C23 88 8 70 8 48S23 8 46 8Z" fill="none" stroke="#FFF3DE" stroke-width="1.5" opacity=".7"/><circle cx="94" cy="48" r="16" fill="none" stroke="#F4D35E" stroke-width="3" stroke-dasharray="3 2.4"/><circle cx="94" cy="48" r="12.5" fill="#3B2A1E"/><path d="M84 42a12 12 0 0 1 8-6" stroke="#6B4A2E" stroke-width="2" fill="none"/><rect x="21" y="25" width="11" height="48" rx="3.5" fill="#6B4A2E"/><rect x="23" y="27" width="3" height="44" rx="1.5" fill="#F7F1E6"/></svg><span class="uke-neck"><i class="uke-head"></i></span>${['G', 'C', 'E', 'A'].map((n, i) => pad('uke', i, 'mu-string', `--c:${RAINBOW[i * 2]};top:calc(50% + ${i - 1.5} * var(--sp))`, `<i></i><b>${n}</b>`, `String ${n}`)).join('')}</div>` },
    { id: 'kompang', name: 'Kompang', main: ['dum'],
      art: '<circle cx="24" cy="24" r="18" fill="#C9A27E" stroke="#8A6A4A" stroke-width="3.5"/><circle cx="24" cy="24" r="12" fill="#FDF6EA" stroke="#D9C9B4" stroke-width="2.5"/>',
      draw: () => `<div class="mu-kompang">${pad('tak', null, 'mu-rim', '', '<b>Tak</b>', 'Edge of the kompang: tak')}${pad('dum', null, 'mu-skin', '', '<b>Dum</b>', 'Middle of the kompang: dum')}</div>` },
    { id: 'shaker', name: 'Shakers', main: ['shake2'],
      art: '<ellipse cx="15" cy="16" rx="9" ry="11" fill="#EF8A7A" stroke="#C9584A" stroke-width="3"/><path d="M19 25l7 15" stroke="#8A6A4A" stroke-width="5" stroke-linecap="round"/><ellipse cx="34" cy="16" rx="8" ry="10" fill="#9CCB7A" stroke="#5E9E45" stroke-width="3"/>',
      draw: () => `<div class="mu-shakers">${pad('shake', null, 'mu-maraca', '--c:#EF8A7A;--d:#C9584A', '<i></i><b>Ch-ch</b>', 'Red shaker')}${pad('shake2', null, 'mu-maraca', '--c:#9CCB7A;--d:#5E9E45', '<i></i><b>Chh</b>', 'Green shaker')}</div>` }
  ];
  const instNow = () => INSTRUMENTS.find((x) => x.id === M().inst) || INSTRUMENTS[0];
  const art = (inst, size) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${inst.art}</svg>`;

  // ---------------------------------------------------------------- state
  const TEMPOS = [[66, 'Slow'], [88, 'Medium'], [112, 'Fast']];
  const M = () => S.mu || (S.mu = { tab: 'play', inst: state.musicInst || 'drums', backing: false, tempo: 0, beat: null, copy: null });
  const lvl = () => state.musicLevel || 1;
  const soundsOn = () => state.settings.sounds && !S.mute;
  const BEAT = { 1: { bpm: 60, win: 270, goal: 12 }, 2: { bpm: 80, win: 200, goal: 16 }, 3: { bpm: 100, win: 150, goal: 20 } };
  const X = true, _ = false;
  const PATTERNS = {
    1: [[X, _, X, _, X, _, X, _], [X, _, X, _, X, _, _, _], [X, _, _, _, X, _, X, _], [X, _, X, _, _, _, X, _]],
    2: [[X, _, X, _, X, X, X, _], [X, X, X, _, X, _, X, _], [X, _, X, X, X, _, X, _], [X, X, X, _, X, X, X, _]],
    3: [[X, _, X, X, X, _, X, X], [X, X, _, X, X, _, X, _], [X, _, _, X, X, _, X, _], [X, X, X, X, X, _, X, _]]
  };
  const SLOT = { 1: 400, 2: 340, 3: 300 };
  const TOL = { 1: 1.1, 2: 0.7, 3: 0.5 };

  function hit(s, i, f) {
    if (!soundsOn()) return;
    try { engine(); SOUND[s](ctx.currentTime + 0.005, i, f); } catch (e) { /* no sound on this device */ }
  }
  const mainHit = () => { const m = instNow().main; hit(m[0], m[1]); };
  const flash = (el, cls) => { if (!el) return; el.classList.remove('hit', 'good'); void el.offsetWidth; el.classList.add(cls || 'hit'); };
  const lumiBop = () => flash(document.getElementById('muLumi'), 'hit');

  // ---------------------------------------------------------------- the beat (backing beat, and Keep the beat)
  let clock = null; // { period, t0 (ms, performance clock), next (beat number to schedule), on(n) }
  function clockStart(bpm, onBeat) {
    engine();
    clock = { period: 60000 / bpm, t0: performance.now() + 500, next: 0, on: onBeat };
  }
  function clockStop() { clock = null; }
  function clockTick() {
    if (!clock || S.screen !== 'music') return;
    const now = performance.now();
    while (clock && clock.t0 + clock.next * clock.period < now + 140) {
      const n = clock.next++;
      const wait = clock.t0 + n * clock.period - now;
      const at = ctx.currentTime + Math.max(0, wait) / 1000;
      const mine = clock;
      mine.on(n, at);
      setTimeout(() => { if (clock === mine && S.screen === 'music') beatSeen(n); }, Math.max(0, wait));
    }
  }
  function beatSeen(n) {
    stage.querySelectorAll('.mu-light').forEach((el, i) => el.classList.toggle('on', i === n % 4));
    lumiBop();
  }

  function beatStart() {
    const m = M();
    const c = BEAT[lvl()];
    m.beat = { on: true, hits: 0, goal: c.goal, got: {}, done: false };
    clockStart(c.bpm, (n, at) => { if (soundsOn()) SOUND.tick(at, n % 4 === 0); });
    render();
    say('Tap with the beat.');
  }
  function beatTap(el) {
    const m = M();
    const b = m.beat;
    if (!b || !b.on || !clock) return;
    const c = BEAT[lvl()];
    const t = performance.now();
    const k = Math.round((t - clock.t0) / clock.period);
    if (k < 0 || b.got[k] || Math.abs(t - (clock.t0 + k * clock.period)) > c.win) return;
    b.got[k] = true;
    b.hits += 1;
    flash(el, 'good');
    const pip = stage.querySelectorAll('.mu-pip')[b.hits - 1];
    if (pip) pip.classList.add('on');
    if (b.hits >= b.goal) {
      b.on = false; b.done = true;
      clockStop();
      later(() => { if (S.screen !== 'music') return; if (A.award) A.award(lvl() === 3 ? 2 : 1); say('You kept the beat!'); render(); }, 350);
    }
  }

  // ---------------------------------------------------------------- Copy me
  function copyNew() {
    const m = M();
    m.copy = { round: 0, total: 4, order: [0, 1, 2, 3].sort(() => Math.random() - 0.5), phase: 'idle', taps: [], miss: 0, msg: '', done: false };
  }
  const copyPat = () => PATTERNS[lvl()][M().copy.order[M().copy.round % 4]];
  function copyListen() {
    const m = M();
    const c = m.copy;
    if (!c || c.done || c.phase === 'listen') return;
    engine();
    c.phase = 'listen'; c.taps = []; c.msg = 'Listen…';
    render();
    const pat = copyPat();
    const slot = SLOT[lvl()];
    pat.forEach((on, i) => later(() => {
      if (S.screen !== 'music' || M().copy !== c) return;
      stage.querySelectorAll('.mu-slot').forEach((el, k) => el.classList.toggle('now', k === i));
      if (on) { mainHit(); lumiBop(); }
    }, 500 + i * slot));
    later(() => {
      if (S.screen !== 'music' || M().copy !== c) return;
      c.phase = 'you'; c.msg = 'Your turn!';
      render();
      say('Your turn!');
    }, 500 + pat.length * slot + 250);
  }
  function copyTap() {
    const c = M().copy;
    if (!c || c.phase !== 'you') return;
    const pat = copyPat();
    const need = pat.filter(Boolean).length;
    c.taps.push(performance.now());
    const row = document.getElementById('muYou');
    if (row) {
      const x = Math.min(96, ((c.taps[c.taps.length - 1] - c.taps[0]) / (SLOT[lvl()] * 8)) * 100 + 4);
      row.insertAdjacentHTML('beforeend', `<i class="mu-dot" style="left:${x}%"></i>`);
    }
    const stamp = c.taps.length;
    if (c.taps.length >= need) later(() => copyJudge(), 450);
    else later(() => { if (M().copy === c && c.phase === 'you' && c.taps.length === stamp) copyJudge(); }, 3200); // the child stopped part-way
  }
  function copyJudge() {
    const m = M();
    const c = m.copy;
    if (!c || c.phase !== 'you' || S.screen !== 'music') return;
    const pat = copyPat();
    const want = pat.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
    let ok = c.taps.length === want.length;
    if (ok && want.length > 1) {
      // only the pattern counts, not the speed: stretch the child's taps to the length of Lumi's rhythm
      const unit = (c.taps[c.taps.length - 1] - c.taps[0]) / (want[want.length - 1] - want[0]);
      ok = unit > 0 && c.taps.every((t, i) => Math.abs((t - c.taps[0]) / unit - (want[i] - want[0])) <= TOL[lvl()]);
    }
    if (ok || c.miss >= 1) {
      c.phase = 'good';
      c.msg = ok ? 'You got it!' : 'Good try!';
      if (soundsOn()) { try { note(ctx.currentTime + 0.02, { f: 784, peak: 0.2, down: 0.3 }); note(ctx.currentTime + 0.16, { f: 1175, peak: 0.2, down: 0.5 }); } catch (e) { /* quiet */ } }
      render();
      say(c.msg);
      later(() => {
        if (S.screen !== 'music' || M().copy !== c) return;
        c.round += 1; c.miss = 0;
        if (c.round >= c.total) { c.done = true; c.phase = 'idle'; if (A.award) A.award(lvl() === 3 ? 2 : 1); say('You copied them all!'); render(); return; }
        copyListen();
      }, 1700);
    } else {
      c.miss += 1; c.phase = 'retry'; c.msg = 'Nearly! Listen again.';
      render();
      say(c.msg);
      later(() => { if (S.screen === 'music' && M().copy === c) { c.phase = 'idle'; copyListen(); } }, 1900);
    }
  }

  // ---------------------------------------------------------------- the screen
  const levelPick = () => `<div class="mu-lvl" role="group" aria-label="How hard">${[1, 2, 3].map((n) => `<button class="${lvl() === n ? 'on' : ''}" data-a="muLevel" data-v="${n}" aria-pressed="${lvl() === n}" aria-label="${['Easy', 'Medium', 'Hard'][n - 1]}">${ic('star', 15).repeat(n)}</button>`).join('')}</div>`;
  const lights = () => `<span class="mu-lights" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<i class="mu-light ${i === 0 ? 'first' : ''}"></i>`).join('')}</span>`;
  function strip() {
    const m = M();
    const lumi = `<span class="mu-lumi" id="muLumi">${L.svg({ look: A.lookWith(), mood: 'happy', size: 96 })}</span>`;
    if (m.tab === 'play') return `<div class="mu-strip">${lumi}
      <button class="mu-toggle ${m.backing ? 'on' : ''}" data-a="muBacking" aria-pressed="${m.backing}">${ic(m.backing ? 'pauseFill' : 'play', 28)}<span>Beat</span></button>
      ${m.backing ? lights() : '<span class="mu-hint">Play anything you like!</span>'}
      <span class="grow"></span>
      <div class="mu-seg" role="group" aria-label="How fast">${TEMPOS.map(([, name], i) => `<button class="${m.tempo === i ? 'on' : ''}" data-a="muTempo" data-v="${i}" aria-pressed="${m.tempo === i}">${name}</button>`).join('')}</div>
    </div>`;
    if (m.tab === 'beat') {
      const b = m.beat || { hits: 0, goal: BEAT[lvl()].goal };
      return `<div class="mu-strip">${lumi}
        ${b.on ? `<button class="mu-toggle on" data-a="muBeatStop">${ic('pauseFill', 28)}<span>Stop</span></button>` : `<button class="mu-toggle go" data-a="muBeatStart">${ic('play', 28)}<span>${b.done ? 'Again' : 'Start'}</span></button>`}
        ${lights()}
        <span class="mu-pips" aria-label="${b.hits} of ${b.goal} on the beat">${Array.from({ length: b.goal }, (_, i) => `<i class="mu-pip ${i < b.hits ? 'on' : ''}"></i>`).join('')}</span>
        ${b.done ? `<b class="mu-msg">You kept the beat!</b>` : ''}
      </div>`;
    }
    const c = m.copy;
    const pat = copyPat();
    return `<div class="mu-strip copy">${lumi}
      ${c.done ? `<button class="mu-toggle go" data-a="muCopyAgain">${ic('play', 28)}<span>Again</span></button>` : `<button class="mu-toggle ${c.phase === 'idle' ? 'go' : ''}" data-a="muListen" ${c.phase === 'listen' ? 'disabled' : ''}>${ic('speaker', 28)}<span>Listen</span></button>`}
      <div class="mu-rows">
        <div class="mu-row" aria-label="Lumi's rhythm">${pat.map((on, i) => `<i class="mu-slot ${on ? (pat[i + 1] || pat[i - 1] ? 'on quick' : 'on') : ''}"></i>`).join('')}</div>
        <div class="mu-row you ${c.phase === 'you' ? 'live' : ''}" id="muYou" aria-label="Your rhythm"></div>
      </div>
      <b class="mu-msg">${esc(c.done ? 'You copied them all!' : c.msg || 'Tap Listen.')}</b>
      <span class="mu-round">${Array.from({ length: c.total }, (_, i) => `<i class="${i < c.round ? 'on' : ''}"></i>`).join('')}</span>
    </div>`;
  }

  A.PARENT.music = 'fun';
  A.VOICE.music = () => (soundsOn() ? { play: 'Pick an instrument and play!', beat: 'Tap Start, then tap with the beat.', copy: 'Listen to Lumi, then play it back.' }[M().tab] : 'Sounds are turned off.');
  A.SCREENS.music = () => {
    const m = M();
    if (m.tab === 'copy' && !m.copy) copyNew();
    const tabs = [['play', 'Play', 'kMusic'], ['beat', 'Keep the beat', 'clock'], ['copy', 'Copy me', 'together']];
    return `
<section class="screen mu-screen" aria-label="Music corner">
  ${A.srTitle('Music corner')}
  <div class="row" style="height:60px;gap:12px;flex:none">
    ${A.backBtn()}${A.speakBtn(A.VOICE.music())}
    <div class="mu-tabs" role="tablist">${tabs.map(([id, name, icon]) => `<button class="tab shelf-tab ${m.tab === id ? 'on' : ''}" data-a="muTab" data-v="${id}" role="tab" aria-selected="${m.tab === id}">${ic(icon, 30)}<span>${name}</span></button>`).join('')}</div>
  </div>
  ${soundsOn() ? '' : `<div class="mu-off">${ic('speaker', 26)}<span>Sounds are turned off. A grown-up can turn them on in Grown-ups.</span></div>`}
  <div class="row grow mu-body">
    <div class="mu-list" role="group" aria-label="Instruments">${INSTRUMENTS.map((x) => `<button class="mu-inst ${m.inst === x.id ? 'on' : ''}" data-a="muInst" data-v="${x.id}" aria-pressed="${m.inst === x.id}">${art(x, 50)}<b>${x.name}</b></button>`).join('')}
      ${m.tab === 'play' ? '' : levelPick()}
      <div class="mu-vol" role="group" aria-label="How loud">${VOLS.map((v, i) => `<button class="${vol() === i ? 'on' : ''}" data-a="muVol" data-v="${i}" aria-pressed="${vol() === i}" aria-label="${['Quiet', 'Medium', 'Louder'][i]}"><i style="height:${10 + i * 9}px"></i></button>`).join('')}</div>
    </div>
    <div class="col grow mu-main">
      ${strip()}
      <div class="panel mu-stage grow" id="muStage">${instNow().draw()}</div>
    </div>
  </div>
</section>`;
  };
  A.GUIDE.music = () => {
    const m = M();
    if (m.tab === 'beat' && !(m.beat && m.beat.on)) return { sel: '[data-a="muBeatStart"]', say: 'Tap Start.', delay: state.settings.guideDelay * 1000 + 4000 };
    if (m.tab === 'copy' && m.copy && m.copy.phase === 'idle' && !m.copy.done) return { sel: '[data-a="muListen"]', say: 'Tap Listen.', delay: state.settings.guideDelay * 1000 + 4000 };
    return null;
  };
  A.ENTER.music = () => { every(clockTick, 25); };

  // pads answer the moment a finger lands (and a finger sliding across the strings or bars plays each one)
  A.AFTER.music = () => {
    const box = document.getElementById('muStage');
    if (!box || box.dataset.wired) return;
    box.dataset.wired = '1';
    let lastKey = 0;
    const play = (el) => {
      const d = el.dataset;
      hit(d.s, d.i === '' ? undefined : Number(d.i), d.f ? Number(d.f) : undefined);
      flash(el);
      const m = M();
      if (m.tab === 'beat') beatTap(el);
      else if (m.tab === 'copy') copyTap();
      else lumiBop();
    };
    const down = {};
    box.addEventListener('pointerdown', (e) => {
      const el = e.target.closest && e.target.closest('.mu-pad');
      if (!el) return;
      e.preventDefault();
      lastKey = Date.now();
      down[e.pointerId] = el;
      play(el);
    });
    box.addEventListener('pointermove', (e) => {
      if (!(e.pointerId in down) || M().tab !== 'play') return;
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const el = over && over.closest && over.closest('.mu-pad');
      if (el && el !== down[e.pointerId] && box.contains(el)) { down[e.pointerId] = el; play(el); }
    });
    const up = (e) => { delete down[e.pointerId]; };
    box.addEventListener('pointerup', up);
    box.addEventListener('pointercancel', up);
    // a keyboard or switch presses a pad with a click
    box.addEventListener('click', (e) => { const el = e.target.closest && e.target.closest('.mu-pad'); if (el && Date.now() - lastKey > 600) play(el); });
  };

  function leaveTab() {
    clockStop();
    const m = M();
    m.backing = false;
    if (m.beat) m.beat.on = false;
    if (m.copy && !m.copy.done) m.copy = null;
  }
  Object.assign(A.ACTIONS, {
    muTab: (d) => { leaveTab(); M().tab = d.v; if (d.v === 'copy') copyNew(); if (d.v === 'beat') M().beat = null; render(); say(A.VOICE.music()); },
    muInst: (d) => { M().inst = d.v; state.musicInst = d.v; save(); render(); mainHit(); return 'keep'; },
    muVol: (d) => { state.musicVol = Number(d.v); save(); if (master) master.gain.value = VOLS[vol()]; render(); mainHit(); return 'keep'; },
    muLevel: (d) => { state.musicLevel = Number(d.v); save(); leaveTab(); if (M().tab === 'copy') copyNew(); M().beat = null; render(); },
    muBacking: () => {
      const m = M();
      m.backing = !m.backing;
      if (m.backing) clockStart(TEMPOS[m.tempo][0], (n, at) => { if (!soundsOn()) return; if (n % 2 === 0) SOUND.kick(at); SOUND.hat(at); });
      else clockStop();
      render();
      return 'keep';
    },
    muTempo: (d) => { const m = M(); m.tempo = Number(d.v); if (m.backing) { m.backing = false; A.ACTIONS.muBacking(); } else render(); return 'keep'; },
    muBeatStart: () => { beatStart(); return 'keep'; },
    muBeatStop: () => { clockStop(); if (M().beat) M().beat.on = false; render(); return 'keep'; },
    muListen: () => { copyListen(); return 'keep'; },
    muCopyAgain: () => { copyNew(); render(); copyListen(); return 'keep'; }
  });

  // leaving the Music corner stops the beat
  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    if (S.screen !== 'music' && (clock || (S.mu && S.mu.backing))) { clockStop(); if (S.mu) { S.mu.backing = false; if (S.mu.beat) S.mu.beat.on = false; } }
  };
  A.musicEngine = () => ({ ctx, master }); // for the sound-level test
  // the same instruments for other games that need a beat (js/rhythm-kitchen.js)
  A.MUSIC = { on: soundsOn, time: () => { engine(); return ctx.currentTime; }, sound: (name, at, i, f) => { if (!soundsOn()) return; try { engine(); SOUND[name](at == null ? ctx.currentTime + 0.005 : at, i, f); } catch (e) { /* quiet */ } }, note: (at, o) => { if (!soundsOn()) return; try { engine(); note(at, o); } catch (e) { /* quiet */ } }, puff: (at, o) => { if (!soundsOn()) return; try { engine(); puff(at, o); } catch (e) { /* quiet */ } } };
})();
