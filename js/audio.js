/*
  audio.js
  Calming music for the calm corner. Every track is made live in the browser (no music files needed):
  a music-box lullaby, ocean waves, soft rain and floating chords.
  "My music" plays a song a grown-up uploaded. It is kept in the browser (IndexedDB) on this device only.
*/
(function () {
  'use strict';

  let ctx = null;
  let bus = null; // everything plays through this gain, so we can fade and set the volume
  let playing = null;
  let sources = [];
  let loops = [];
  let volume = 0.6;
  let mineEl = null;
  let mineUrl = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function newBus() {
    const c = getCtx();
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(volume, c.currentTime + 1.5);
    const soft = c.createBiquadFilter();
    soft.type = 'lowpass';
    soft.frequency.value = 5000;
    g.connect(soft);
    soft.connect(c.destination);
    return g;
  }

  // a soft echo, so single notes feel spacious
  function echo(dest) {
    const c = getCtx();
    const d = c.createDelay(1);
    d.delayTime.value = 0.38;
    const fb = c.createGain();
    fb.gain.value = 0.32;
    const wet = c.createGain();
    wet.gain.value = 0.35;
    d.connect(fb);
    fb.connect(d);
    d.connect(wet);
    wet.connect(dest);
    sources.push(d, fb, wet);
    return d;
  }

  function tone(freq, start, dur, type, peak, dest, attack) {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(peak, start + (attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(dest);
    o.start(start);
    o.stop(start + dur + 0.1);
  }

  function noiseBuffer(brown) {
    const c = getCtx();
    const len = c.sampleRate * 3;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; data[i] = last * 3.5; } else data[i] = w;
    }
    return buf;
  }

  function noiseSource(brown) {
    const c = getCtx();
    const s = c.createBufferSource();
    s.buffer = noiseBuffer(brown);
    s.loop = true;
    s.start();
    sources.push(s);
    return s;
  }

  // ---------------------------------------------------------------- tracks
  const SCALE = [392, 440, 523.25, 587.33, 659.25, 783.99, 880]; // G major pentatonic, gentle and never "wrong"
  const TRACKS = {
    lullaby(dest) {
      const c = getCtx();
      const e = echo(dest);
      let next = c.currentTime + 0.3;
      let step = 0;
      let idx = 2;
      const bass = [196, 164.81, 130.81, 146.83];
      const tick = () => {
        while (next < c.currentTime + 1.2) {
          if (step % 8 === 0) tone(bass[(step / 8) % 4], next, 4.2, 'sine', 0.09, dest, 0.4);
          if (step % 2 === 0 || Math.random() < 0.35) {
            idx = Math.max(0, Math.min(SCALE.length - 1, idx + Math.floor(Math.random() * 3) - 1));
            tone(SCALE[idx], next, 1.6, 'triangle', 0.07, dest);
            tone(SCALE[idx], next, 1.6, 'sine', 0.05, e);
          }
          next += 0.55;
          step += 1;
        }
      };
      tick();
      loops.push(setInterval(tick, 300));
    },
    waves(dest) {
      const c = getCtx();
      const n = noiseSource(true);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      const g = c.createGain();
      g.gain.value = 0.35;
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.09; // one wave about every 11 seconds
      const depth = c.createGain();
      depth.gain.value = 0.3;
      lfo.connect(depth);
      depth.connect(g.gain);
      lfo.start();
      n.connect(lp);
      lp.connect(g);
      g.connect(dest);
      sources.push(lp, g, lfo, depth);
    },
    rain(dest) {
      const c = getCtx();
      const n = noiseSource(false);
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 900;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 5200;
      const g = c.createGain();
      g.gain.value = 0.07;
      n.connect(hp);
      hp.connect(lp);
      lp.connect(g);
      g.connect(dest);
      sources.push(hp, lp, g);
      const drops = () => {
        const t = c.currentTime + Math.random() * 0.5;
        tone(1200 + Math.random() * 900, t, 0.18, 'sine', 0.025, dest, 0.005);
      };
      loops.push(setInterval(drops, 260));
    },
    clouds(dest) {
      const c = getCtx();
      const chords = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [196, 246.94, 293.66, 392]];
      let i = 0;
      const play = () => {
        const t = c.currentTime + 0.05;
        chords[i % chords.length].forEach((f, k) => {
          tone(f, t + k * 0.12, 8.5, 'sine', 0.045, dest, 2.5);
          tone(f * 2, t + k * 0.12, 7, 'triangle', 0.012, dest, 3);
        });
        i += 1;
      };
      play();
      loops.push(setInterval(play, 7000));
    }
  };

  // ---------------------------------------------------------------- "My music" storage (IndexedDB)
  function db() {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open('lumi-media', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('files');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) { reject(e); }
    });
  }
  function putMine(file) {
    return db().then((d) => new Promise((resolve, reject) => {
      const tx = d.transaction('files', 'readwrite');
      tx.objectStore('files').put({ blob: file, name: file.name }, 'mine');
      tx.oncomplete = () => resolve(file.name);
      tx.onerror = () => reject(tx.error);
    }));
  }
  function getMine() {
    return db().then((d) => new Promise((resolve) => {
      const tx = d.transaction('files', 'readonly');
      const req = tx.objectStore('files').get('mine');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    })).catch(() => null);
  }
  function deleteMine() {
    return db().then((d) => new Promise((resolve) => {
      const tx = d.transaction('files', 'readwrite');
      tx.objectStore('files').delete('mine');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    })).catch(() => {});
  }
  let memoryMine = null; // used if the browser blocks IndexedDB (for example in a private window)

  // ---------------------------------------------------------------- public controls
  function stop() {
    loops.forEach(clearInterval);
    loops = [];
    if (mineEl) { mineEl.pause(); mineEl = null; }
    if (bus && ctx) {
      const old = bus;
      const oldSources = sources;
      old.gain.cancelScheduledValues(ctx.currentTime);
      old.gain.setValueAtTime(old.gain.value, ctx.currentTime);
      old.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      setTimeout(() => {
        oldSources.forEach((s) => { try { if (s.stop) s.stop(); s.disconnect(); } catch (e) { /* already stopped */ } });
        try { old.disconnect(); } catch (e) { /* already disconnected */ }
      }, 900);
    }
    sources = [];
    bus = null;
    playing = null;
  }

  function play(id) {
    stop();
    if (id === 'mine') {
      const start = (rec) => {
        if (!rec) return false;
        if (mineUrl) URL.revokeObjectURL(mineUrl);
        mineUrl = URL.createObjectURL(rec.blob);
        mineEl = new Audio(mineUrl);
        mineEl.loop = true;
        mineEl.volume = volume;
        mineEl.play().catch(() => {});
        playing = 'mine';
        return true;
      };
      playing = 'mine';
      if (memoryMine) return Promise.resolve(start(memoryMine));
      return getMine().then(start);
    }
    try {
      bus = newBus();
      TRACKS[id](bus);
      playing = id;
    } catch (e) { playing = null; }
    return Promise.resolve(!!playing);
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (bus && ctx) bus.gain.setTargetAtTime(volume, ctx.currentTime, 0.2);
    if (mineEl) mineEl.volume = volume;
  }

  window.LumiAudio = {
    play,
    stop,
    setVolume,
    get playing() { return playing; },
    saveMine(file) {
      memoryMine = { blob: file, name: file.name };
      return putMine(file).catch(() => file.name);
    },
    getMineName() { return memoryMine ? Promise.resolve(memoryMine.name) : getMine().then((r) => (r ? r.name : null)); },
    removeMine() { memoryMine = null; if (playing === 'mine') stop(); return deleteMine(); }
  };
})();
