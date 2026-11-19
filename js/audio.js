/*
  audio.js
  Calming music for the calm corner. Every track is made live in the browser (no music files, nothing
  copied): a music-box lullaby, ocean waves, soft rain and floating chords, and three tunes written for Lumi:
  Starlight (kalimba, 60 beats a minute), Rocking boat (a music-box waltz, 54) and Quiet forest (a slow
  flute over warm chords and a breeze, 50). They follow what helps children calm down: slow and steady,
  the same short tune again and again (no surprises), soft, low and smooth (no drums, no words).

  The music never talks over Lumi: whenever a narrator, a grown-up's recording or the home language is
  speaking, the music dips to a quarter of its volume and its bright notes are softened, then comes back
  slowly when the words end.
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
  let softF = null; // the music's tone filter: lowered while someone is speaking

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
    softF = soft;
    ducked = false;
    watchVoice();
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

  // ---------------------------------------------------------------- ducking: words always come first
  const DUCK = 0.25;
  let ducked = false, duckTimer = null, quietSince = 0;
  const speaking = () => { try { return !!(window.speechSynthesis && window.speechSynthesis.speaking) || !!window.LumiVoiceBusy; } catch (e) { return !!window.LumiVoiceBusy; } };
  function applyDuck(on) {
    ducked = on;
    if (bus && ctx) {
      bus.gain.cancelScheduledValues(ctx.currentTime);
      bus.gain.setTargetAtTime(on ? volume * DUCK : volume, ctx.currentTime, on ? 0.06 : 0.45);
      if (softF) softF.frequency.setTargetAtTime(on ? 1300 : 5000, ctx.currentTime, on ? 0.06 : 0.45);
    }
    if (mineEl) mineEl.volume = on ? volume * DUCK : volume;
  }
  function watchVoice() {
    if (duckTimer) return;
    duckTimer = setInterval(() => {
      if (!playing) { clearInterval(duckTimer); duckTimer = null; ducked = false; return; }
      const now = Date.now();
      if (speaking()) { quietSince = 0; if (!ducked) applyDuck(true); }
      else if (ducked) { if (!quietSince) quietSince = now; else if (now - quietSince > 450) applyDuck(false); }
    }, 90);
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
    },

    // Starlight: a kalimba tune at 60 beats a minute over soft warm chords. 8 bars, then again.
    starlight(dest) {
      const e = echo(dest);
      const tune = [[64, 1], [67, 1], [69, 1], [67, 1], [64, 1], [62, 1], [60, 2], [62, 1], [64, 1], [67, 1], [64, 1], [62, 1], [60, 1], [57, 2],
        [64, 1], [67, 1], [69, 1], [72, 1], [69, 1], [67, 1], [64, 2], [62, 1], [64, 1], [62, 1], [60, 1], [57, 1], [60, 1], [60, 2]];
      const chords = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 55], [48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]];
      sequence(32, 1.0, timeline(tune), (b, t, note) => {
        if (b % 4 === 0) {
          const ch = chords[(b / 4) % 8];
          tone(hz(ch[0] - 12), t, 4.4, 'sine', 0.05, dest, 0.3);
          ch.forEach((m, k) => tone(hz(m), t + k * 0.05, 4.6, 'sine', 0.018, dest, 1.2));
        }
        if (note) kalimba(hz(note[0]), t, 1.8 + note[1], dest, e);
      });
    },
    // Rocking boat: a music-box waltz (1-2-3, 1-2-3) at 54 beats a minute, like being rocked.
    rocking(dest) {
      const e = echo(dest);
      const tune = [[72, 2], [69, 1], [65, 2], [67, 1], [69, 1], [72, 1], [74, 1], [72, 3], [74, 2], [72, 1], [69, 2], [67, 1], [65, 1], [67, 1], [69, 1], [65, 3]];
      const roots = [[41, 57, 60], [38, 57, 62], [41, 57, 60], [36, 55, 64], [34, 58, 62], [41, 57, 60], [36, 55, 64], [41, 57, 60]];
      sequence(24, 60 / 54, timeline(tune), (b, t, note) => {
        const bar = Math.floor(b / 3), beat = b % 3, ch = roots[bar % 8];
        if (beat === 0) tone(hz(ch[0]), t, 2.6, 'sine', 0.06, dest, 0.08);
        else { tone(hz(ch[1]), t, 0.9, 'sine', 0.016, dest, 0.05); tone(hz(ch[2]), t, 0.9, 'sine', 0.014, dest, 0.05); }
        if (note) musicBox(hz(note[0]), t, 1.4 + note[1] * 0.6, dest, e);
      });
    },
    // Quiet forest: a slow flute (50 beats a minute) over long warm chords, with a soft breeze.
    forest(dest) {
      const c = getCtx();
      const n = noiseSource(true);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
      const g = c.createGain(); g.gain.value = 0.05;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.06;
      const depth = c.createGain(); depth.gain.value = 0.03;
      lfo.connect(depth); depth.connect(g.gain); lfo.start();
      n.connect(lp); lp.connect(g); g.connect(dest);
      sources.push(lp, g, lfo, depth);
      const tune = [[66, 2], [69, 2], [71, 4], [69, 2], [66, 2], [64, 4], [62, 2], [64, 2], [66, 2], [69, 2], [64, 8],
        [66, 2], [69, 2], [71, 4], [69, 2], [66, 2], [64, 4], [64, 2], [66, 2], [64, 2], [62, 2], [62, 8]];
      const pads = [[50, 54, 57, 64], [47, 50, 54, 57], [43, 47, 50, 54], [45, 52, 57, 59], [50, 54, 57, 64], [47, 50, 54, 57], [43, 47, 50, 54], [50, 54, 57, 62]];
      const beat = 60 / 50;
      sequence(64, beat, timeline(tune), (b, t, note) => {
        if (b % 8 === 0) pads[(b / 8) % 8].forEach((m, k) => tone(hz(m), t + k * 0.1, beat * 8.6, 'sine', 0.02, dest, 2.2));
        if (note) flute(hz(note[0]), t, note[1] * beat, dest);
      });
    }
  };

  // ---------------------------------------------------------------- helpers for the written tunes
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // [[midi, beats], ...] -> a note (or nothing) for each beat
  function timeline(tune) {
    const out = []; let b = 0;
    tune.forEach(([m, len]) => { out[b] = [m, len]; b += len; });
    return out;
  }
  // calls onBeat(beatInLoop, time, noteStartingNow) for every beat, scheduled a little ahead
  function sequence(loopBeats, beatSec, notes, onBeat) {
    const c = getCtx();
    let next = c.currentTime + 0.4, b = 0;
    const tick = () => {
      while (next < c.currentTime + 1.6) {
        const k = b % loopBeats;
        onBeat(k, next, notes[k]);
        next += beatSec; b += 1;
      }
    };
    tick();
    loops.push(setInterval(tick, 300));
  }
  // a soft plucked metal tine: a round note, a tiny bright "tink" at the start, and a gentle echo
  function kalimba(f, t, dur, dest, e) {
    tone(f, t, dur, 'sine', 0.075, dest, 0.006);
    tone(f * 2.76, t, 0.35, 'sine', 0.012, dest, 0.004);
    tone(f, t, dur * 0.8, 'sine', 0.03, e, 0.006);
  }
  function musicBox(f, t, dur, dest, e) {
    tone(f, t, dur, 'triangle', 0.05, dest, 0.004);
    tone(f * 2, t, dur * 0.5, 'sine', 0.012, dest, 0.004);
    tone(f, t, dur * 0.7, 'sine', 0.025, e, 0.004);
  }
  // a breathy flute: slow start, a little vibrato, a soft end
  function flute(f, t, dur, dest) {
    const c = getCtx();
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const vib = c.createOscillator(); vib.frequency.value = 4.6;
    const vd = c.createGain(); vd.gain.value = f * 0.006;
    vib.connect(vd); vd.connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.35);
    g.gain.setValueAtTime(0.05, t + Math.max(0.4, dur - 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
    o.connect(g); g.connect(dest);
    o.start(t); vib.start(t); o.stop(t + dur + 0.4); vib.stop(t + dur + 0.4);
  }

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
        ducked = false;
        watchVoice();
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
    if (bus && ctx) bus.gain.setTargetAtTime(ducked ? volume * DUCK : volume, ctx.currentTime, 0.2);
    if (mineEl) mineEl.volume = ducked ? volume * DUCK : volume;
  }

  window.LumiAudio = {
    play,
    stop,
    setVolume,
    get playing() { return playing; },
    _duck: () => ducked, // for tests
    saveMine(file) {
      memoryMine = { blob: file, name: file.name };
      return putMine(file).catch(() => file.name);
    },
    getMineName() { return memoryMine ? Promise.resolve(memoryMine.name) : getMine().then((r) => (r ? r.name : null)); },
    removeMine() { memoryMine = null; if (playing === 'mine') stop(); return deleteMine(); }
  };
})();
