/*
  sounds.js
  The Sound corner: gentle, steady, real-life sounds to listen to (an MRT ride, rain on the window, a fan,
  the washing machine…) and soft things to tap (a drip, a pop, a page turning).

  Why it is built this way (see the README for the reading behind it):
  - Steady and predictable. Every sound fades in, loops without a jump and never has a sudden loud part.
  - Low sounds first. Brown-noise style rumbles and nature sounds are the ones most often found calming.
  - The child is in charge: one tap to start, one to stop, three volume steps (the loudest is still soft).
  - A sleep timer (5, 10 or 20 minutes) fades the sound out, so it does not play all night.
  - No voices, whispering or mouth sounds.

  The sounds are made in the browser (Web Audio), so the app still needs no sound files and works offline.
  To use a real recording instead, put it in web/sounds/ and name it in web/sounds/list.json, for example
  { "mrt": "mrt.mp3" }: that file then plays, looped, in place of the built-in sound.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, save, render, later, every } = A;
  const pic = (e) => (window.lumiPic && window.lumiPic(e, '100%')) || '';

  // ---------------------------------------------------------------- the sounds
  const LISTEN = [
    { id: 'mrt', name: 'MRT ride', e: '🚇', tint: '#F6D2C8' },
    { id: 'bus', name: 'Bus ride', e: '🚌', tint: '#CFE3C4' },
    { id: 'rain', name: 'Rain', e: '💧', tint: '#CFE0F3' },
    { id: 'waves', name: 'Beach waves', e: '🏖', tint: '#F3DDA0' },
    { id: 'fan', name: 'Fan', e: '🌀', tint: '#D6DAF5' },
    { id: 'aircon', name: 'Air-con', e: '🌬', tint: '#D5ECEA' },
    { id: 'washer', name: 'Washing machine', e: '🧺', tint: '#E4DAF6' },
    { id: 'tank', name: 'Fish tank', e: '🐟', tint: '#BFE3F7' },
    { id: 'kettle', name: 'Kettle', e: '🫖', tint: '#F2D2C4' },
    { id: 'heart', name: 'Heartbeat', e: '💜', tint: '#F2D2E4' },
    { id: 'pencil', name: 'Pencil', e: '✏', tint: '#F6E7B8' },
    { id: 'hum', name: 'Soft hum', e: '🎧', tint: '#E3DACB' }
  ];
  const TAPS = [
    { id: 'tap', name: 'Tap', e: '🥁' }, { id: 'pop', name: 'Pop', e: '🫧' }, { id: 'drip', name: 'Drip', e: '💧' }, { id: 'brush', name: 'Brush', e: '🪥' },
    { id: 'page', name: 'Page', e: '📚' }, { id: 'bell', name: 'Bell', e: '🔔' }, { id: 'blocks', name: 'Blocks', e: '🧱' }, { id: 'squish', name: 'Squish', e: '🧽' }
  ];
  const VOLS = [0.3, 0.55, 0.85]; // master levels: quiet, medium, a little louder (a limiter sits after this)
  const MINS = [5, 10, 20];

  // ---------------------------------------------------------------- the sound engine
  let ctx = null, master = null, now = null, buffers = null, files = null;
  function engine() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -14; lim.knee.value = 10; lim.ratio.value = 12; lim.attack.value = 0.003; lim.release.value = 0.25;
    master = ctx.createGain();
    master.gain.value = VOLS[vol()];
    master.connect(lim);
    lim.connect(ctx.destination);
    // two seconds each of white, pink and brown noise, looped
    const n = ctx.sampleRate * 2;
    buffers = {};
    ['white', 'pink', 'brown'].forEach((kind) => {
      const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, last = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === 'white') d[i] = w * 0.5;
        else if (kind === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
        else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      }
      // the end meets the start, so the loop has no click
      for (let i = 0; i < 2000; i++) { const k = i / 2000; d[n - 2000 + i] = d[n - 2000 + i] * (1 - k) + d[i] * k; }
      buffers[kind] = b;
    });
    return ctx;
  }
  const vol = () => (state.soundVol == null ? 1 : state.soundVol);
  const mins = () => state.soundMins || 10;

  // one playing sound: its nodes and timers, so it can be faded and stopped cleanly
  function voice() {
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(master);
    const v = { out, nodes: [], timers: [] };
    v.noise = (kind) => { const s = ctx.createBufferSource(); s.buffer = buffers[kind]; s.loop = true; s.loopStart = 0; s.loopEnd = 2 - 2000 / ctx.sampleRate; s.start(0, Math.random() * 1.5); v.nodes.push(s); return s; };
    v.osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(); v.nodes.push(o); return o; };
    v.filter = (type, f, q) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; };
    v.gain = (g) => { const n = ctx.createGain(); n.gain.value = g; return n; };
    v.chain = (...ns) => { for (let i = 0; i < ns.length - 1; i++) ns[i].connect(ns[i + 1]); return ns[ns.length - 1]; };
    // a slow wobble on a parameter (a fan blade, a wave coming in)
    v.lfo = (f, depth, param) => { const o = v.osc('sine', f), g = v.gain(depth); o.connect(g); g.connect(param); return o; };
    // things that happen again and again (a wheel on a rail joint, a drop, a heartbeat), scheduled a little ahead
    v.repeat = (gap, fn) => {
      let t = ctx.currentTime + 0.3;
      const tick = () => { while (t < ctx.currentTime + 0.6) { fn(t); t += typeof gap === 'function' ? gap() : gap; } };
      tick();
      v.timers.push(setInterval(tick, 200));
    };
    return v;
  }
  // a short soft burst of filtered noise at time t
  function burst(v, t, { kind = 'white', type = 'bandpass', f = 800, q = 1, peak = 0.1, up = 0.005, down = 0.08, f2 }) {
    const s = ctx.createBufferSource(); s.buffer = buffers[kind]; s.loop = true;
    const fl = v.filter(type, f, q), g = v.gain(0.0001);
    if (f2) fl.frequency.setValueAtTime(f, t), fl.frequency.exponentialRampToValueAtTime(f2, t + up + down);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + up); g.gain.exponentialRampToValueAtTime(0.0001, t + up + down);
    v.chain(s, fl, g, v.out);
    s.start(t, Math.random() * 1.5); s.stop(t + up + down + 0.05);
  }
  // a short soft note that slides from f to f2
  function blip(v, t, { f = 600, f2, peak = 0.05, up = 0.006, down = 0.1, type = 'sine' }) {
    const o = ctx.createOscillator(), g = v.gain(0.0001);
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + up + down);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + up); g.gain.exponentialRampToValueAtTime(0.0001, t + up + down);
    o.connect(g); g.connect(v.out);
    o.start(t); o.stop(t + up + down + 0.05);
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  const MAKE = {
    hum: (v) => { v.chain(v.noise('brown'), v.filter('lowpass', 420), v.gain(0.9), v.out); },
    mrt: (v) => {
      // the low rumble of the carriage, a little air, a faint motor, and wheels over the rail joints: da-dum … da-dum
      const g = v.gain(0.95); v.chain(v.noise('brown'), v.filter('lowpass', 240), g, v.out); v.lfo(0.21, 0.12, g.gain);
      v.chain(v.noise('white'), v.filter('bandpass', 1700, 0.6), v.gain(0.035), v.out);
      const m = v.gain(0.012); v.chain(v.osc('sine', 318), m, v.out); v.lfo(0.13, 0.006, m.gain);
      v.repeat(1.46, (t) => { [0, 0.1, 0.42, 0.52].forEach((d, i) => burst(v, t + d, { kind: 'brown', type: 'bandpass', f: i % 2 ? 420 : 520, q: 1.2, peak: i < 2 ? 0.5 : 0.36, up: 0.006, down: 0.07 })); });
    },
    bus: (v) => {
      const e = v.gain(0.2); v.chain(v.osc('sawtooth', 47), v.filter('lowpass', 130), e, v.out); v.lfo(5.5, 0.04, e.gain);
      v.chain(v.osc('sine', 94), v.gain(0.07), v.out);
      const r = v.gain(0.55); v.chain(v.noise('brown'), v.filter('lowpass', 320), r, v.out); v.lfo(0.17, 0.1, r.gain);
    },
    rain: (v) => {
      v.chain(v.noise('white'), v.filter('highpass', 1300), v.filter('lowpass', 6500), v.gain(0.16), v.out);
      v.chain(v.noise('pink'), v.filter('bandpass', 520, 0.5), v.gain(0.3), v.out);
      v.repeat(() => rnd(0.05, 0.22), (t) => blip(v, t, { f: rnd(900, 1600), f2: rnd(500, 800), peak: rnd(0.008, 0.024), down: 0.05 }));
    },
    waves: (v) => {
      const f = v.filter('lowpass', 700), g = v.gain(0.3);
      v.chain(v.noise('pink'), f, g, v.out);
      v.lfo(0.105, 0.24, g.gain); v.lfo(0.105, 420, f.frequency);
      v.chain(v.noise('brown'), v.filter('lowpass', 200), v.gain(0.3), v.out);
    },
    fan: (v) => {
      const g = v.gain(0.8); v.chain(v.noise('brown'), v.filter('lowpass', 540), g, v.out); v.lfo(4.4, 0.1, g.gain);
      v.chain(v.noise('white'), v.filter('bandpass', 2300, 0.7), v.gain(0.018), v.out);
    },
    aircon: (v) => {
      v.chain(v.noise('pink'), v.filter('lowpass', 1300), v.filter('highpass', 130), v.gain(0.42), v.out);
      v.chain(v.osc('sine', 100), v.gain(0.02), v.out);
    },
    washer: (v) => {
      v.chain(v.noise('brown'), v.filter('lowpass', 300), v.gain(0.65), v.out);
      const s = v.gain(0.06); v.chain(v.noise('white'), v.filter('bandpass', 850, 0.9), s, v.out); v.lfo(0.85, 0.055, s.gain);
      v.chain(v.osc('sine', 62), v.gain(0.05), v.out);
    },
    tank: (v) => {
      v.chain(v.noise('brown'), v.filter('lowpass', 480), v.gain(0.3), v.out);
      v.repeat(() => rnd(0.07, 0.33), (t) => { const f = rnd(420, 980); blip(v, t, { f, f2: f * 1.6, peak: rnd(0.02, 0.05), down: 0.07 }); });
    },
    kettle: (v) => {
      v.chain(v.noise('pink'), v.filter('bandpass', 2600, 0.5), v.gain(0.1), v.out);
      v.chain(v.noise('brown'), v.filter('lowpass', 380), v.gain(0.4), v.out);
      v.repeat(() => rnd(0.04, 0.16), (t) => { const f = rnd(140, 320); blip(v, t, { f, f2: f * 1.5, peak: rnd(0.03, 0.07), down: 0.06 }); });
    },
    heart: (v) => {
      v.chain(v.noise('brown'), v.filter('lowpass', 220), v.gain(0.16), v.out);
      v.repeat(1.0, (t) => { blip(v, t, { f: 62, f2: 40, peak: 0.6, up: 0.012, down: 0.16 }); blip(v, t + 0.29, { f: 70, f2: 46, peak: 0.4, up: 0.012, down: 0.13 }); });
    },
    pencil: (v) => {
      v.chain(v.noise('brown'), v.filter('lowpass', 300), v.gain(0.1), v.out);
      v.repeat(() => rnd(0.32, 0.75), (t) => burst(v, t, { type: 'bandpass', f: rnd(2200, 3200), q: 1.4, peak: rnd(0.04, 0.075), up: rnd(0.06, 0.14), down: rnd(0.12, 0.26) }));
    }
  };
  // the quieter sounds are lifted so every sound is about as loud as the others (measured, not guessed)
  const TRIM = { rain: 2.6, aircon: 2.3, tank: 2.3, kettle: 1.8, pencil: 4.5, waves: 1.6, heart: 1.4 };
  // soft things to tap: each plays once
  const HIT = {
    tap: (v, t) => { burst(v, t, { type: 'lowpass', f: 900, peak: 0.35, down: 0.07 }); blip(v, t, { f: 190, f2: 150, peak: 0.3, down: 0.09 }); },
    pop: (v, t) => blip(v, t, { f: 320, f2: 900, peak: 0.28, down: 0.07 }),
    drip: (v, t) => { blip(v, t, { f: 1250, f2: 520, peak: 0.22, down: 0.13 }); blip(v, t + 0.16, { f: 900, f2: 480, peak: 0.07, down: 0.12 }); },
    brush: (v, t) => { burst(v, t, { f: 2400, q: 0.8, peak: 0.13, up: 0.14, down: 0.22 }); burst(v, t + 0.34, { f: 2100, q: 0.8, peak: 0.1, up: 0.12, down: 0.22 }); },
    page: (v, t) => burst(v, t, { f: 900, f2: 3800, q: 0.7, peak: 0.14, up: 0.1, down: 0.3 }),
    bell: (v, t) => { blip(v, t, { f: 660, peak: 0.16, down: 2.4 }); blip(v, t, { f: 1320, peak: 0.05, down: 1.6 }); blip(v, t, { f: 1985, peak: 0.02, down: 0.9 }); },
    blocks: (v, t) => { blip(v, t, { f: 520, f2: 470, peak: 0.24, down: 0.06, type: 'triangle' }); blip(v, t + 0.12, { f: 400, f2: 360, peak: 0.2, down: 0.07, type: 'triangle' }); },
    squish: (v, t) => burst(v, t, { type: 'lowpass', f: 700, f2: 220, peak: 0.3, up: 0.05, down: 0.22, kind: 'pink' })
  };

  function fade(v, to, secs) {
    const t = ctx.currentTime;
    v.out.gain.cancelScheduledValues(t);
    v.out.gain.setValueAtTime(Math.max(0.0001, v.out.gain.value), t);
    v.out.gain.linearRampToValueAtTime(Math.max(0.0001, to), t + secs);
  }
  function kill(v, secs) {
    fade(v, 0, secs);
    v.timers.forEach(clearInterval);
    setTimeout(() => {
      v.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } });
      if (v.el) { try { v.el.pause(); } catch (e) { /* gone */ } }
      try { v.out.disconnect(); } catch (e) { /* gone */ }
    }, secs * 1000 + 120);
  }
  function start(id) {
    engine();
    if (ctx.state === 'suspended') ctx.resume();
    if (window.LumiAudio && window.LumiAudio.playing) window.LumiAudio.stop();
    if (A.roomMusicStop) A.roomMusicStop();
    if (now) kill(now.v, 1.2);
    const v = voice();
    const file = files && files[id];
    if (file) {
      // a real recording, if the grown-up added one
      const el = new Audio('sounds/' + file); el.loop = true; el.crossOrigin = 'anonymous';
      try { ctx.createMediaElementSource(el).connect(v.out); el.play().catch(() => MAKE[id](v)); v.el = el; } catch (e) { MAKE[id](v); }
    } else MAKE[id](v);
    fade(v, TRIM[id] || 1, 2.5); // never a sudden start
    now = { id, v, ends: Date.now() + mins() * 60000 };
  }
  function stop(secs) {
    if (!now) return;
    kill(now.v, secs == null ? 1.2 : secs);
    now = null;
  }
  function hit(id) {
    engine();
    if (ctx.state === 'suspended') ctx.resume();
    const v = voice();
    v.out.gain.value = 1;
    HIT[id](v, ctx.currentTime + 0.02);
    setTimeout(() => { try { v.out.disconnect(); } catch (e) { /* gone */ } }, 3200);
  }
  A.soundStop = () => stop(0.4);
  A.soundPlaying = () => (now ? now.id : null);
  A.soundEngine = () => ({ ctx, master }); // for the sound-level test

  // ---------------------------------------------------------------- the screen
  const soundsOn = () => state.settings.sounds && !S.mute;
  const left = () => (now ? Math.max(0, Math.ceil((now.ends - Date.now()) / 60000)) : 0);
  const leftText = () => (left() <= 1 ? 'Less than 1 minute left' : `${left()} minutes left`);
  const bars = '<span class="snd-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

  A.PARENT.sounds = 'fun';
  A.VOICE.sounds = () => (soundsOn() ? 'Pick a sound.' : 'Sounds are turned off.');
  A.SCREENS.sounds = () => {
    const tab = S.sndTab === 'tap' ? 'tap' : 'listen';
    const cur = now ? LISTEN.find((x) => x.id === now.id) : null;
    const grid = tab === 'listen'
      ? `<div class="snd-grid">${LISTEN.map((x) => `<button class="snd-tile ${now && now.id === x.id ? 'on' : ''}" data-a="sndPlay" data-v="${x.id}" style="--tint:${x.tint}" aria-pressed="${!!(now && now.id === x.id)}" aria-label="${esc(x.name)}${now && now.id === x.id ? ', playing. Tap to stop' : ''}">
          <span class="snd-pic">${pic(x.e)}</span><b>${esc(x.name)}</b>${now && now.id === x.id ? bars : ''}</button>`).join('')}</div>`
      : `<div class="snd-grid pads">${TAPS.map((x) => `<button class="snd-pad" data-a="sndHit" data-v="${x.id}" aria-label="${esc(x.name)}"><span class="snd-pic">${pic(x.e)}</span><b>${esc(x.name)}</b></button>`).join('')}</div>`;
    const side = `<div class="snd-side ${cur ? 'playing' : ''}" style="${cur ? `--tint:${cur.tint}` : ''}">
      <span class="snd-lumi">${L.svg({ look: A.lookWith(), mood: cur ? 'calm' : 'happy', size: 190 })}</span>
      ${cur
        ? `<span class="snd-now">${bars}<b>${esc(cur.name)}</b></span>
           <button class="primary snd-stop" data-a="sndStop" aria-label="Stop the sound">${ic('pauseFill', 34)}<span>Stop</span></button>
           <span class="snd-left" id="sndLeft">${leftText()}</span>`
        : `<span class="snd-now idle"><b>${tab === 'listen' ? 'Tap a sound' : 'Tap a picture'}</b></span>`}
      <div class="snd-ctl" role="group" aria-label="How loud">
        <span class="snd-ctl-ic">${ic('speaker', 26)}</span>
        ${VOLS.map((_, i) => `<button class="snd-vol ${vol() === i ? 'on' : ''}" data-a="sndVol" data-v="${i}" aria-pressed="${vol() === i}" aria-label="${['Quiet', 'Medium', 'A little louder'][i]}"><i style="height:${14 + i * 12}px"></i></button>`).join('')}
      </div>
      <div class="snd-ctl" role="group" aria-label="Stop after">
        <span class="snd-ctl-ic">${ic('clock', 26)}</span>
        ${MINS.map((m) => `<button class="snd-min ${mins() === m ? 'on' : ''}" data-a="sndMins" data-v="${m}" aria-pressed="${mins() === m}" aria-label="Stop after ${m} minutes">${m}</button>`).join('')}
      </div>
    </div>`;
    return `
<section class="screen snd-screen" aria-label="Sound corner">
  ${A.srTitle('Sound corner')}
  <div class="row" style="height:60px;gap:12px">
    ${A.backBtn()}${A.speakBtn(soundsOn() ? 'Pick a sound.' : 'Sounds are turned off.')}
    <span class="game-chip" style="background:#E4DAF6;color:#6A55B0">${ic('kSound', 34)}<span>Sound corner</span></span>
    <div class="snd-tabs" role="tablist"><button class="tab shelf-tab ${tab === 'listen' ? 'on' : ''}" data-a="sndTab" data-v="listen" role="tab" aria-selected="${tab === 'listen'}">${ic('kSound', 30)}<span>Listen</span></button><button class="tab shelf-tab ${tab === 'tap' ? 'on' : ''}" data-a="sndTab" data-v="tap" role="tab" aria-selected="${tab === 'tap'}">${ic('hand', 30)}<span>Tap</span></button></div>
  </div>
  ${soundsOn() ? '' : `<div class="snd-off">${ic('speaker', 26)}<span>Sounds are turned off. A grown-up can turn them on in Grown-ups.</span></div>`}
  <div class="row grow snd-body">${grid}${side}</div>
</section>`;
  };
  A.GUIDE.sounds = () => (now ? null : { sel: S.sndTab === 'tap' ? '.snd-pad' : '.snd-tile', say: 'Tap one to listen.', delay: state.settings.guideDelay * 1000 + 4000 });
  A.ENTER.sounds = () => {
    if (files === null) {
      files = {};
      try { fetch('sounds/list.json').then((r) => (r.ok ? r.json() : {})).then((j) => { files = j && typeof j === 'object' ? j : {}; }).catch(() => {}); } catch (e) { /* no recordings: the built-in sounds play */ }
    }
    // the timer: say how long is left, and fade out gently at the end
    every(() => {
      if (!now) return;
      const el = document.getElementById('sndLeft');
      if (el) el.textContent = leftText();
      if (Date.now() >= now.ends) { stop(6); later(() => { if (S.screen === 'sounds') render(); }, 400); }
    }, 5000);
  };

  Object.assign(A.ACTIONS, {
    sndTab: (d) => { S.sndTab = d.v; render(); },
    sndPlay: (d) => {
      if (!soundsOn()) { say('Sounds are turned off.'); return; }
      const x = LISTEN.find((s) => s.id === d.v);
      if (!x) return;
      if (now && now.id === x.id) { stop(); render(); return 'keep'; }
      try { start(x.id); } catch (e) { now = null; }
      render();
      say(x.name);
      return 'keep';
    },
    sndStop: () => { stop(); render(); },
    sndHit: (d, el) => {
      if (!soundsOn()) { say('Sounds are turned off.'); return 'keep'; }
      try { hit(d.v); } catch (e) { /* no sound on this device */ }
      if (el) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
      return 'keep';
    },
    sndVol: (d) => {
      state.soundVol = Number(d.v); save();
      if (master) master.gain.linearRampToValueAtTime(VOLS[vol()], ctx.currentTime + 0.4);
      render();
      return 'keep';
    },
    sndMins: (d) => { state.soundMins = Number(d.v); save(); if (now) now.ends = Date.now() + mins() * 60000; render(); return 'keep'; }
  });

  // leaving the Sound corner stops the sound
  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    if (now && S.screen !== 'sounds') stop(0.8);
  };
})();
