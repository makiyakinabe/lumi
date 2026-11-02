/*
  familiar.js
  A familiar voice. Grown-ups record Lumi's key lines in their own voice ("Time to brush your teeth,
  Mia"). When a line has a recording, Lumi plays it instead of the tablet voice. Many non-verbal
  children respond much better to a voice they know.
  Recordings stay on this tablet (in the browser's storage) and are never uploaded.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { S, state, ic, esc, save, render } = A;

  // ---------------------------------------------------------------- storage (IndexedDB)
  const clips = {}; // key -> { url, secs }
  let dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise((res, rej) => {
      try {
        const r = indexedDB.open('lumi-familiar', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('clips');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
    return dbP;
  }
  const tx = (mode, fn) => db().then((d) => new Promise((res, rej) => { const t = d.transaction('clips', mode); const st = t.objectStore('clips'); const out = fn(st); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }));
  function loadAll() {
    return db().then((d) => new Promise((res) => {
      const t = d.transaction('clips', 'readonly');
      const req = t.objectStore('clips').openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) { res(); return; }
        const v = c.value;
        clips[c.key] = { url: URL.createObjectURL(v.blob), secs: v.secs || 0 };
        c.continue();
      };
      req.onerror = () => res();
    })).catch(() => {});
  }
  loadAll().then(() => { if (S.screen === 'cgVoice' || S.screen === 'cgSensory') render(); });

  // ---------------------------------------------------------------- which lines can be recorded
  function lines() {
    const name = state.childName || '';
    const nm = name ? ', ' + name : '';
    const praise = Object.values(A.D.TONE || {}).reduce((a, t) => a.concat(t.praise), ['Well done!']);
    const out = [
      { key: 'hello', group: 'every', icon: 'smile', text: `Good morning${nm}! Let's start our day.`, hint: 'When Lumi says hello', match: (t) => /^(Good (morning|afternoon|evening)|Hi[ ,!])/.test(t) },
      { key: 'praise', group: 'every', icon: 'star', text: `Well done${nm}! I'm proud of you.`, hint: 'When a step is finished', match: (t) => praise.includes(t) },
      { key: 'five', group: 'every', icon: 'hourglass', text: '5 more minutes.', hint: 'Now & Next timer', match: (t) => t === '5 more minutes.' },
      { key: 'one', group: 'every', icon: 'hourglass', text: '1 more minute.', hint: 'Now & Next timer', match: (t) => t === '1 more minute.' },
      { key: 'timeup', group: 'every', icon: 'clock', text: "Time's up! Let's go to the next thing.", hint: 'When a timer ends', match: (t) => /^Time for /.test(t) },
      { key: 'break', group: 'every', icon: 'kBreak', text: "It's okay to take a break. Breathe slowly with me.", hint: 'When the Break button is pressed', match: (t) => t.indexOf("It's okay to take a break") === 0 },
      { key: 'calm', group: 'every', icon: 'kCalm', text: "Let's calm down together.", hint: 'In the calm corner', match: (t) => t === "Let's calm down together." },
      { key: 'back', group: 'every', icon: 'heart', text: `Welcome back${nm}!`, hint: 'After a break', match: (t) => t.indexOf('Welcome back') === 0 }
    ];
    const seen = new Set();
    Object.keys(state.week || {}).forEach((day) => (state.week[day] || []).forEach((st) => {
      const k = st.custom ? 'c:' + st.custom : st.id;
      if (seen.has(k)) return;
      seen.add(k);
      const info = A.stepInfo(st);
      const say = info.voice;
      out.push({ key: 'step:' + k, group: 'steps', icon: info.icon, photo: info.photo, label: info.label, text: `${say.replace(/[.!]$/, '')}${nm}.`, hint: info.label, match: (t) => t === say });
    }));
    return out;
  }
  const stepKey = (st) => 'step:' + (st.custom ? 'c:' + st.custom : st.id);

  // ---------------------------------------------------------------- playing a recording instead of the tablet voice
  let audio = null;
  function stopClip() { if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } audio = null; } }
  if ('speechSynthesis' in window) {
    const orig = window.speechSynthesis.cancel.bind(window.speechSynthesis);
    window.speechSynthesis.cancel = () => { stopClip(); orig(); };
  }
  A.familiarSay = (text, opts) => {
    if (state.settings.familiar === false || !Object.keys(clips).length) return false;
    let key = opts && opts.key;
    if (!key && S.screen === 'routine' && S.day && S.day.plan && S.day.plan[S.day.i]) {
      try { if (text === A.VOICE.routine()) key = stepKey(S.day.plan[S.day.i]); } catch (e) { /* ignore */ }
    }
    if (!key || !clips[key]) { const l = lines().find((x) => x.match(text)); if (l) key = l.key; }
    const c = key && clips[key];
    if (!c) return false;
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    stopClip();
    audio = new Audio(c.url);
    const preset = A.voicePreset ? A.voicePreset() : {};
    audio.volume = Math.min(1, (preset.volume || 0.9) + 0.1);
    audio.play().catch(() => { audio = null; A.tts(text); });
    return true;
  };
  A.familiarCount = () => { const l = lines(); return { have: l.filter((x) => clips[x.key]).length, total: l.length }; };

  // ---------------------------------------------------------------- recording
  let rec = null; // { key, mr, chunks, start, stream, timer }
  function startRec(key) {
    if (rec) stopRec();
    S.recErr = '';
    if (!navigator.mediaDevices || !window.MediaRecorder) { S.recErr = 'This browser cannot record sound. Try Chrome or Safari on the tablet.'; render(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mr = new MediaRecorder(stream);
      rec = { key, mr, chunks: [], start: Date.now(), stream };
      mr.ondataavailable = (e) => { if (e.data && e.data.size) rec && rec.chunks.push(e.data); };
      mr.onstop = () => {
        const r = rec;
        rec = null;
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(r.timer);
        const blob = new Blob(r.chunks, { type: mr.mimeType || 'audio/webm' });
        const secs = Math.round((Date.now() - r.start) / 100) / 10;
        if (secs < 0.6) { render(); return; }
        tx('readwrite', (st) => st.put({ blob, secs }, r.key)).then(() => {
          if (clips[r.key]) URL.revokeObjectURL(clips[r.key].url);
          clips[r.key] = { url: URL.createObjectURL(blob), secs };
          render();
        }).catch(() => { S.recErr = 'Could not save the recording on this tablet.'; render(); });
      };
      mr.start();
      rec.timer = setInterval(() => {
        const el = A.stage.querySelector('.fv-live');
        const s = (Date.now() - rec.start) / 1000;
        if (el) el.textContent = `0:${String(Math.floor(s)).padStart(2, '0')}`;
        if (s >= 12) stopRec(); // keep lines short
      }, 250);
      render();
    }).catch(() => { S.recErr = 'Lumi needs permission to use the microphone. Allow it in the browser, then try again.'; render(); });
  }
  function stopRec() { if (rec && rec.mr.state !== 'inactive') rec.mr.stop(); }

  // ---------------------------------------------------------------- grown-ups: record our voice
  A.PARENT.cgVoice = 'cgSensory';
  A.VOICE.cgVoice = () => '';
  A.SCREENS.cgVoice = () => {
    const all = lines();
    const { have, total } = A.familiarCount();
    const row = (l) => {
      const c = clips[l.key];
      const live = rec && rec.key === l.key;
      return `<div class="fv-row ${c ? 'has' : ''} ${live ? 'live' : ''}">
        <span class="fv-ic">${l.photo ? `<img src="${l.photo}" alt="">` : ic(l.icon, 34)}</span>
        <span class="fv-txt"><b>"${esc(l.text)}"</b><span>${esc(l.hint)}${c ? ` · recorded (${c.secs}s)` : ''}</span></span>
        ${live ? `<span class="fv-live">0:00</span><button class="fv-btn stop" data-a="fvStop" aria-label="Stop recording">${ic('stop', 22)}<span>Stop</span></button>`
          : `<button class="fv-btn rec" data-a="fvRec" data-v="${l.key}" aria-label="Record"><i class="fv-dot"></i><span>${c ? 'Again' : 'Record'}</span></button>`}
        ${c && !live ? `<button class="fv-btn" data-a="fvPlay" data-v="${l.key}" aria-label="Play">${ic('play', 22)}</button><button class="fv-btn" data-a="fvDel" data-v="${l.key}" aria-label="Delete">${ic('trash', 20)}</button>` : ''}
      </div>`;
    };
    return `
<section class="screen grownup" aria-label="Familiar voice">
  ${A.gHeader('cgSensory')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel grow scroll">
      <h2 class="g-h">Everyday lines</h2>${all.filter((l) => l.group === 'every').map(row).join('')}
      <h2 class="g-h top-gap">Routine steps</h2>${all.filter((l) => l.group === 'steps').map(row).join('')}
    </div>
    <div class="g-panel scroll" style="width:380px">
      <h2 class="g-h">Your voice for Lumi</h2>
      <p class="g-note">Record a few lines in your own voice. When Lumi says one of them, your child hears you instead of the tablet voice.</p>
      <div class="fv-count"><b>${have}</b><span>of ${total} lines recorded</span></div>
      <button class="check-row" data-a="fvToggle" aria-pressed="${state.settings.familiar !== false}"><span class="box ${state.settings.familiar !== false ? 'on' : ''}">${state.settings.familiar !== false ? ic('check', 14) : ''}</span><span>Use our recordings</span></button>
      ${S.recErr ? `<p class="bus-test bad">${esc(S.recErr)}</p>` : ''}
      <h2 class="g-h top-gap">Tips</h2>
      <ul class="fv-tips"><li>Speak slowly and warmly, like you do at home.</li><li>Use your child's name.</li><li>You don't have to read the words exactly. Say it your way.</li><li>Start with the lines your child hears most: hello, well done and the morning steps.</li></ul>
      <p class="g-note">Recordings stay on this tablet and are never uploaded.</p>
    </div>
  </div>
</section>`;
  };
  Object.assign(A.ACTIONS, {
    fvRec: (d) => startRec(d.v),
    fvStop: () => stopRec(),
    fvPlay: (d) => { const c = clips[d.v]; if (c) { stopClip(); audio = new Audio(c.url); audio.play().catch(() => {}); } },
    fvDel: (d) => { tx('readwrite', (st) => st.delete(d.v)).catch(() => {}); if (clips[d.v]) URL.revokeObjectURL(clips[d.v].url); delete clips[d.v]; render(); },
    fvToggle: () => { state.settings.familiar = state.settings.familiar === false; save(); render(); }
  });
  // stop recording if the grown-up leaves the screen
  const prevAfter = A.afterRender;
  A.afterRender = () => { if (rec && S.screen !== 'cgVoice') stopRec(); if (prevAfter) prevAfter(); };
})();
