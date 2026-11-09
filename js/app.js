/*
  app.js
  All the screens and game logic for the Lumi prototype.

  How it works:
  - `state` is the child's saved progress (stars, outfit, weekly timetable...). It is saved in the browser.
  - `S` is the "session": what is happening right now (current screen, today's step...).
  - Each screen is a function in SCREENS that returns HTML.
  - Buttons have data-a="actionName". Clicking one runs ACTIONS.actionName.
  - GUIDE says which button the child should press next on each screen. It glows, and if the
    child waits, a tapping hand appears and Lumi says what to do.
*/
(function () {
  'use strict';

  const D = window.DATA;
  const L = window.Lumi;
  const stage = document.getElementById('stage');
  const screenEl = document.getElementById('screen');
  const toastEl = document.getElementById('toast');
  // Shared with the feature files (aac.js, play.js, learn.js, pet.js, together.js, caregiver.js).
  const A = (window.LumiApp = {});

  // ---------------------------------------------------------------- helpers
  const ic = (name, size, cls) => window.icon(name, size, cls);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let uidN = 0;
  const uid = () => 'u' + Date.now().toString(36) + (uidN++).toString(36);

  // time helpers ("07:45" <-> minutes)
  const toMin = (t) => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ''); return m ? Number(m[1]) * 60 + Number(m[2]) : 0; };
  const fromMin = (n) => { const x = ((n % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  const fmt = (t) => { const n = toMin(t); const h = Math.floor(n / 60); return `${(h % 12) || 12}:${String(n % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const todayKey = () => D.DAYS[(new Date().getDay() + 6) % 7].id;
  const dayName = (k) => (D.DAYS.find((d) => d.id === k) || D.DAYS[0]).name;
  const partOf = (t) => (D.PARTS.find((p) => toMin(t) >= toMin(p.from) && toMin(t) <= toMin(p.to)) || D.PARTS[0]).id;
  const sortDay = (arr) => arr.sort((a, b) => toMin(a.time) - toMin(b.time));

  // ---------------------------------------------------------------- saved progress
  // Each child on this tablet has their own save (profiles.js). The first child keeps the original key.
  const PROFILE_KEY = 'lumi-profiles';
  const saveKeyFor = (id) => (!id || id === 'p1' ? 'lumi-save-v1' : 'lumi-save-v1:' + id);
  let SAVE_KEY = (() => { try { const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); return saveKeyFor(p && p.current); } catch (e) { return saveKeyFor(); } })();

  const entry = (s) => Object.assign({ uid: uid(), stars: 1 }, clone(s));
  function defaultWeek() {
    const w = {};
    D.DAYS.forEach((d, i) => { w[d.id] = (i < 5 ? D.SCHOOL_DAY : D.WEEKEND_DAY).map(entry); });
    return w;
  }

  function defaults() {
    return {
      stars: 12,
      look: Object.assign({}, L.DEFAULT_LOOK),
      shirt: null, // the T-shirt drawing, cropped to fit Lumi (an image)
      shirtFull: null, // the whole drawing, so it can be edited again
      savedLooks: [
        { color: 'pink', pattern: 'spots', head: 'flowers', body: 'none', back: 'none', feet: 'none', spark: 'heart' },
        { color: 'leaf', pattern: 'stripes', head: 'cap', body: 'scarf', back: 'none', feet: 'none', spark: 'star' },
        null
      ],
      owned: ['picture', 'plant'],
      rug: 'cloud',
      rugs: ['cloud'],
      buddy: null, // the pet that walks with Lumi (puppy or kitten)
      badges: [],
      week: defaultWeek(), // the child's real timetable, one list per day
      customSteps: {}, // steps grown-ups made themselves (name, icon, colour, photo)
      stats: { changesHandled: 0, talkUses: 0, calmTried: [], daysDone: 0, totalEarned: 0, checklists: 0, games: 0, tutorials: 0, together: 0, petCare: 0, feelingsNamed: 0, missions: 0, stories: 0, tutDone: {}, storyDone: {} },
      goal: { name: 'Park trip', target: 30 },
      settings: {
        voice: true, sounds: true, guide: true, guideDelay: 6,
        reduceMotion: false, highContrast: false, tapMove: false, textSize: 1, voiceRate: 0.85, musicVolume: 0.6, speakWords: true,
        voiceId: 'lumi', voiceStyle: 'gentle', watchFirst: true, childVoice: true, stepGames: true, breakBtn: true, familiar: true, buddy: true
      },
      // Now & Next board: what is happening now, what comes next, and a kid-friendly timer
      nownext: { now: null, next: null, mins: 5, style: 'ring', numbers: false },
      // answers to the sensory quick-start questions
      sensory: { done: false, answers: {} },
      // live bus times for the Bus step (LTA DataMall, the same data the MyTransport.SG app uses)
      bus: { live: false, stop: '', service: '', proxy: '', key: '', walk: 5 },
      streak: { count: 0, best: 0, last: null, days: [], shields: 1, shieldWeek: null, goal: 3, restDays: [], celebrated: null },
      skillBadges: [], // badges earned for new skills (see SKILL_BADGES in data.js)
      journal: [], // grown-ups' observation notes
      badgeDates: {}, // when each skill badge was earned
      childName: '',
      childPhoto: null, // a photo of the child for the menu (stays on this tablet)
      setupDone: false,
      sparkOff: false,
      // set by grown-ups: age group, difficulty, look, and what the child sees
      profile: {
        age: 'primary', level: 2, theme: 'sand', artStyle: 'soft', partner: 'Mum', routineMode: 'play',
        targets: { communication: true, routines: true, emotions: true, lifeskills: false, social: false, thinking: false },
        show: { day: true, talk: true, calm: true, play: true, learn: true, stories: true, pet: true, me: true, room: true },
        games: { bubbles: true, match: true, jigsaw: true, sort: true, pattern: true },
        tutorials: { teeth: true, hands: true, dress: true, pack: true }
      },
      reminders: { next: true, breakMin: 20, list: [{ id: 'water', e: '💧', text: 'Drink some water', every: 60 }] },
      customActivities: [], // tutorials grown-ups build with their own photos
      myWords: [], // talk-board words grown-ups add (with photos)
      pets: {}, // pet corner: { puppy: { name, food, fun, clean, rest, last } }
      log: {}, // progress by day: { '2026-10-24': { steps: 3, talk: 1, feelings: { happy: 1 } } }
      events: [], // recent things the child did, newest first
      petCareDay: null // which kinds of pet care already earned a star today
    };
  }

  function load() {
    const base = defaults();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      // older saves had one plan for every day: turn it into a week
      if (saved.plan && !saved.week) {
        let t = toMin('07:00');
        const plan = saved.plan.map((s) => { const e = entry(s); if (!e.time || !/^\d{1,2}:\d{2}$/.test(e.time)) e.time = fromMin(t); else e.time = fromMin(toMin(e.time)); t = toMin(e.time) + 15; return e; });
        saved.week = {};
        D.DAYS.forEach((d, i) => { saved.week[d.id] = i < 5 ? plan.map((s) => entry(Object.assign({}, s, { uid: undefined }))) : D.WEEKEND_DAY.map(entry); });
        delete saved.plan;
      }
      Object.keys(base).forEach((k) => {
        if (saved[k] === undefined) return;
        const isObj = base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]);
        base[k] = isObj ? Object.assign(base[k], saved[k]) : saved[k];
      });
    } catch (e) { /* storage unavailable: start fresh */ }
    return base;
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
  }
  // switch to another child's save, keeping the same state object (every module holds a reference to it)
  function useSave(id) {
    save();
    SAVE_KEY = saveKeyFor(id);
    const next = load();
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, next);
  }

  const state = load();
  // Lumi no longer has a star above the head by default (children can still add one in Dress up)
  if (!state.sparkOff) { state.look.spark = 'none'; state.sparkOff = true; }

  // ---------------------------------------------------------------- progress log (for the grown-ups' progress checker)
  const dateKey = (d) => { const x = d || new Date(); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  // opts.quiet: count it for the grown-ups' numbers, but don't list it in "recent activity"
  function track(kind, detail, opts) {
    const k = dateKey();
    const day = state.log[k] || (state.log[k] = {});
    if (kind === 'feelings') {
      day.feelings = day.feelings || {};
      day.feelings[detail] = (day.feelings[detail] || 0) + 1;
    } else {
      day[kind] = (day[kind] || 0) + 1;
    }
    if (!(opts && opts.quiet)) {
      state.events.unshift({ t: Date.now(), kind, detail: detail || '' });
      if (state.events.length > 60) state.events.length = 60;
    }
    // keep about two months of history
    const keys = Object.keys(state.log).sort();
    while (keys.length > 62) delete state.log[keys.shift()];
    save();
    if (A.onTrack) A.onTrack(kind, detail, opts);
  }

  // ---------------------------------------------------------------- the child's look and sensory settings
  function applyPrefs() {
    if (state.profile.theme === 'night') state.profile.theme = 'space';
    const th = D.THEMES[state.profile.theme] || D.THEMES.sand;
    const st = stage.style;
    st.setProperty('--bg', th.bg);
    st.setProperty('--surface-200', th.surface);
    st.setProperty('--surface-300', th.floor);
    st.setProperty('--teal', th.accent);
    st.setProperty('--teal-dark', th.accentDark);
    st.setProperty('--teal-soft', th.accentSoft);
    st.setProperty('--ts', state.settings.textSize || 1);
    stage.classList.toggle('reduce-motion', !!state.settings.reduceMotion);
    stage.classList.toggle('high-contrast', !!state.settings.highContrast);
    stage.classList.toggle('tap-move', !!state.settings.tapMove);
    // Lumi has one art style: Soft and round. (Older saves that chose another look are moved to it.)
    const art = 'soft';
    state.profile.artStyle = art;
    ['soft', 'paper', 'water', 'diorama', 'minimal', 'pixel'].forEach((k) => stage.classList.toggle('art-' + k, art === k));
    L.style = art;
    window.ICON_MODE = '';
    ['little', 'primary', 'teen'].forEach((a) => stage.classList.toggle('age-' + a, state.profile.age === a));
    [1, 2, 3].forEach((n) => stage.classList.toggle('lv-' + n, (state.profile.level || 2) === n));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', th.bg);
    if (window.LumiAudio) window.LumiAudio.setVolume(state.settings.musicVolume);
  }
  const level = () => state.profile.level || 2;

  // ---------------------------------------------------------------- session (not saved)
  const S = {
    screen: 'menu',
    appMode: 'solo',
    paused: false,
    pausedQueue: [],
    lastBreak: Date.now(),
    reminded: {},
    history: [],
    mode: 'free', // 'flow' = helping Lumi after a plan change; 'free' = opened from a menu
    day: null,
    feelPick: null,
    feelHint: false,
    talk: [],
    said: false,
    replyShown: false,
    calmTool: 'balloon',
    calmDone: false,
    squeeze: 0,
    countN: 0,
    gift: null,
    roomTab: 'furniture',
    roomSel: null,
    shopSel: null,
    dressHist: [],
    draw: { tool: 'brush', color: '#2F7E79', undo: [] },
    drew: false,
    bDay: todayKey(),
    bSel: null,
    bTab: 'step',
    newStep: { label: '', voice: '', icon: 'star', tint: '#FFF1C2', photo: null, error: '' },
    confirmReset: false,
    confirmClear: false,
    interacted: false,
    timers: [],
    intervals: []
  };

  // ---------------------------------------------------------------- voice and sound
  // Lumi uses the voices installed on the tablet. Each voice choice picks a matching one (girl, boy...) if it exists.
  const FEMALE = /female|zira|samantha|karen|moira|tessa|serena|susan|hazel|libby|sonia|aria|jenny|natasha|victoria|allison|ava|fiona|veena|catherine|kate|joanna|salli|emma|amy/i;
  const MALE = /\bmale|david|mark|daniel|alex|fred|george|ryan|guy|thomas|arthur|oliver|rishi|aaron|james|matthew|brian|william|lee/i;
  // Gentle voices: the newer "natural" voices sound much softer than the old robotic ones, so they are
  // chosen first. Joke voices (Bells, Bubbles, Whisper...) are never used.
  const QUALITY = /natural|neural|enhanced|premium|siri|google|online/i;
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|kathy|princess|fred/i;
  const voiceCache = {};
  function voiceScore(v, prefer) {
    let s = 0;
    if (QUALITY.test(v.name)) s += 5;
    if (/en[-_](SG|GB|AU|IE|NZ)/i.test(v.lang)) s += 1.5;
    else if (/en[-_]US/i.test(v.lang)) s += 1;
    if (prefer === 'female' && FEMALE.test(v.name)) s += 6;
    if (prefer === 'male' && MALE.test(v.name) && !/female/i.test(v.name)) s += 6;
    if (NOVELTY.test(v.name)) s -= 50;
    return s;
  }
  function pickVoice(prefer) {
    try {
      if (voiceCache[prefer || 'any'] !== undefined) return voiceCache[prefer || 'any'];
      const all = window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
      if (!all.length) return null;
      const best = all.slice().sort((a, b) => voiceScore(b, prefer) - voiceScore(a, prefer))[0];
      voiceCache[prefer || 'any'] = best && voiceScore(best, prefer) > -10 ? best : null;
      return voiceCache[prefer || 'any'];
    } catch (e) { return null; }
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => { Object.keys(voiceCache).forEach((k) => delete voiceCache[k]); });
    } catch (e) { /* not supported */ }
  }
  // the voice = who speaks (D.VOICES) x how it sounds (D.VOICE_STYLES); the old "soft" voice is Lumi, quiet
  function voicePreset() {
    const st = state.settings;
    const legacy = st.voiceId === 'soft';
    const who = D.VOICES.find((v) => v.id === (legacy ? 'lumi' : st.voiceId)) || D.VOICES[0];
    const how = (D.VOICE_STYLES || []).find((v) => v.id === (st.voiceStyle || (legacy ? 'quiet' : 'gentle'))) || { rate: 1, pitch: 1, volume: 1 };
    return { prefer: who.prefer, rate: (who.rate || 1) * how.rate, pitch: (who.pitch || 1) * how.pitch, volume: Math.min(1, (who.volume || 0.9) * (how.volume / 0.9)) };
  }
  // Lumi speaks one sentence at a time, a little slower and softer, so each idea has room to land.
  function say(text, opts) {
    if (!text || !state.settings.voice || S.mute) return;
    // a grown-up's own recording of this line plays instead of the tablet voice (see familiar.js)
    if (A.familiarSay && A.familiarSay(text, opts)) return;
    // the home language (lang.js) may speak this line too, or instead
    if (A.langSay && A.langSay(text, opts)) return;
    tts(text);
  }
  function tts(text) {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const preset = voicePreset();
      const v = pickVoice(preset.prefer);
      const parts = String(text).match(/[^.!?]+[.!?]*/g) || [text];
      parts.map((p) => p.trim()).filter(Boolean).forEach((p) => {
        const u = new SpeechSynthesisUtterance(p);
        u.rate = Math.min(1.15, (state.settings.voiceRate || 0.85) * (preset.rate || 1));
        u.pitch = Math.max(0.5, Math.min(1.6, preset.pitch));
        u.volume = preset.volume || 0.9;
        if (v) { u.voice = v; u.lang = v.lang; }
        window.speechSynthesis.speak(u);
      });
    } catch (e) { /* speech not supported */ }
  }

  let audioCtx = null;
  function tone(freq, dur, vol) {
    if (!state.settings.sounds || S.mute) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol || 0.15, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.6));
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + (dur || 0.6) + 0.05);
    } catch (e) { /* audio not supported */ }
  }
  const chime = () => { tone(784, 0.3, 0.08); setTimeout(() => tone(1175, 0.5, 0.08), 120); };

  // ---------------------------------------------------------------- timers (cleared when the screen changes)
  // While the game is paused, timers wait: a "later" runs after Keep going, an "every" skips its turns.
  function later(fn, ms) {
    const t = setTimeout(() => { if (S.paused) S.pausedQueue.push(fn); else fn(); }, ms);
    S.timers.push(t);
    return t;
  }
  function every(fn, ms) { const t = setInterval(() => { if (!S.paused) fn(); }, ms); S.intervals.push(t); return t; }
  function clearTimers() {
    S.timers.forEach(clearTimeout);
    S.intervals.forEach(clearInterval);
    S.timers = [];
    S.intervals = [];
  }

  // ---------------------------------------------------------------- stars and prizes
  function setStarCount() {
    const el = document.getElementById('starCount');
    if (el) el.textContent = state.stars;
  }

  function showToast(html, cls) {
    const t = document.createElement('div');
    t.className = 'toast ' + (cls || '');
    t.innerHTML = html;
    toastEl.appendChild(t);
    setTimeout(() => t.remove(), 1700);
  }

  function award(n) {
    if (!n) return;
    state.stars += n;
    state.stats.totalEarned += n;
    save();
    setStarCount();
    showToast(`${ic('star', 36)}<span>+${n}</span>`);
    chime();
    checkBadges();
  }

  function badgeProgress(b) {
    const v = state.stats[b.stat];
    return Math.min(b.target, Array.isArray(v) ? v.length : v || 0);
  }

  function checkBadges() {
    D.BADGES.forEach((b) => {
      if (state.badges.includes(b.id) || badgeProgress(b) < b.target) return;
      state.badges.push(b.id);
      if (!state.owned.includes(b.reward.id)) state.owned.push(b.reward.id);
      save();
      setTimeout(() => {
        showToast(`${L.item(b.reward.id, 48)}<span>New!</span>`, 'toast-new');
        say(`You earned the ${b.reward.name}!`);
      }, 1200);
    });
  }

  // ---------------------------------------------------------------- look helpers
  function lookWith(extra) {
    return Object.assign({}, state.look, { shirt: state.shirt }, extra || {});
  }
  function dayLook() {
    // After a rainy-day change, Lumi wears a raincoat (and boots if owned) for the rest of the day.
    const look = lookWith();
    if (S.day && S.day.rainLook) {
      look.body = 'raincoat';
      if (state.owned.includes('boots')) look.feet = 'boots';
    }
    return look;
  }
  function itemName(id) {
    const w = D.WARDROBE.find((x) => x.id === id) || D.ROOM.find((x) => x.id === id);
    if (w) return w.name;
    const b = D.BADGES.find((x) => x.reward.id === id);
    if (b) return b.reward.name;
    return D.NAMES[id] || id;
  }
  function slotOptions(slot) {
    const list = D.FREE[slot].slice();
    if (slot === 'body' && state.shirt) list.push('shirt');
    D.WARDROBE.forEach((w) => { if (w.slot === slot && state.owned.includes(w.id)) list.push(w.id); });
    D.BADGES.forEach((b) => { if (b.reward.slot === slot && state.owned.includes(b.reward.id)) list.push(b.reward.id); });
    return list;
  }

  // ---------------------------------------------------------------- timetable helpers
  function stepInfo(step) {
    const base = step.custom
      ? state.customSteps[step.custom] || { label: 'My step', icon: 'star', tint: '#FFFFFF', voice: '' }
      : D.STEPS[step.id] || { label: step.id, icon: 'star', voice: '', tint: '#FFFFFF' };
    const info = Object.assign({ photo: null }, base);
    if (step.label) info.label = step.label;
    info.voice = step.voice || (step.label ? step.label : '') || base.voice || info.label;
    return info;
  }
  function stepArt(info, size) {
    return info.photo
      ? `<img class="step-photo" src="${info.photo}" width="${size}" height="${size}" alt="">`
      : ic(info.icon, size);
  }
  const dayPlan = (k) => sortDay(state.week[k] || (state.week[k] = []));

  // ---------------------------------------------------------------- routine helpers
  function checkInfo(id) {
    if (String(id).startsWith('txt:')) { const label = id.slice(4); return { label, icon: 'wDone', voice: label, kind: 'do', custom: true }; }
    return D.CHECK_ITEMS[id] || { label: id, icon: 'wDone', voice: id, kind: 'do' };
  }
  function checkArt(id, size) {
    const c = checkInfo(id);
    return c.custom ? `<span class="check-txt" style="width:${size}px;height:${size}px">${ic('check', Math.round(size * 0.55))}</span>` : ic(c.icon, size);
  }
  const checklistPending = () => !!(S.day && S.day.check && !S.day.check.done);

  function activeChange() {
    const d = S.day;
    if (!d || !d.change || d.resolved) return null;
    if (d.check && !d.check.done) return null; // get ready first, then the surprise
    // a late bus is handled inside the Bus game: a waiting countdown with games, not a feelings detour
    if (d.change === 'late' && d.plan[d.i].id === 'bus' && A.stepGame && A.stepGame.has(d.plan[d.i])) return null;
    return Object.assign({ id: d.change }, D.CHANGES[d.change]);
  }

  function prepareStep() {
    const d = S.day;
    const step = d.plan[d.i];
    d.celebrate = false;
    d.game = null; // the hands-on mini game for this step (see routinegames.js)
    d.change = null;
    d.resolved = false;
    d.check = step.check && step.check.length ? { items: step.check.slice(), ticked: step.check.map(() => false), done: false } : null;
    const chance = { never: 0, sometimes: 0.5, often: 1 }[step.surprise || 'never'] || 0;
    if (step.changes && step.changes.length && Math.random() < chance) d.change = pick(step.changes);
  }

  // ---------------------------------------------------------------- age packs (see agepacks.js)
  function praise() {
    const t = (D.TONE || {})[state.profile.age];
    return t ? pick(t.praise) : 'Well done!';
  }
  // is a tutorial shown? grown-ups' choice first, otherwise whether it suits the age group
  function tutOn(t) {
    const v = state.profile.tutorials[t.id];
    if (v === true || v === false) return v;
    return !t.ages || t.ages.includes(state.profile.age);
  }
  const agePack = () => (D.AGE_PACKS || {})[state.profile.age] || null;
  const storiesForAge = () => D.STORIES.filter((s) => !s.learn && (!s.ages || s.ages.includes(state.profile.age)));
  // load an age pack: look, difficulty, voice, activities, routine style, and (if asked) its timetable
  function applyAgePack(age, opts) {
    const P = (D.AGE_PACKS || {})[age];
    const p = state.profile;
    p.age = age;
    if (!P) { p.level = D.AGES[age].level; save(); applyPrefs(); return; }
    p.level = P.level;
    p.artStyle = 'soft';
    p.theme = P.theme || D.ART_STYLES.soft.theme;
    p.routineMode = P.routineMode;
    p.show = Object.assign({}, P.show);
    p.games = Object.assign({}, P.games);
    p.tutorials = P.tutorials();
    state.settings.voiceId = P.voiceId;
    state.settings.voiceRate = P.voiceRate;
    state.settings.guideDelay = P.guideDelay;
    if (opts && opts.week) {
      const w = {};
      D.DAYS.forEach((d, i) => { w[d.id] = (i < 5 ? P.week : P.weekend).map(entry); });
      state.week = w;
      S.day = null;
    }
    save();
    applyPrefs();
  }

  function greeting() {
    const h = new Date().getHours();
    const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const t = (D.TONE || {})[state.profile.age] || {};
    return `${part}${state.childName ? ', ' + state.childName : ''}! ${t.hello || "I'm Lumi. Tap Go to start."}`;
  }

  // ---------------------------------------------------------------- shared pieces of UI
  function speakBtn(text, size) {
    const s = size || 56;
    return `<button class="speak-btn" style="width:${s}px;height:${s}px" data-a="say" data-text="${esc(text)}" aria-label="Hear it">${ic(state.settings.voice ? 'speaker' : 'mute', Math.round(s * 0.47))}</button>`;
  }
  // Teens see what they got done today instead of a star counter
  function doneChip() {
    const n = (state.log[dateKey()] || {}).steps || 0;
    return `<span class="stars done-chip" role="img" aria-label="${n} things done today">${ic('check', 26)}<span>${n} done today</span></span>`;
  }
  function starChip(toShop) {
    const inner = `${ic('star', 28)}<span id="starCount">${state.stars}</span>`;
    return toShop
      ? `<button class="stars" data-a="nav" data-to="shop" aria-label="${state.stars} stars. Open the shop">${inner}</button>`
      : `<div class="stars" role="img" aria-label="${state.stars} stars">${inner}</div>`;
  }
  const homeBtn = () => `<button class="icon-btn" data-a="nav" data-to="home" aria-label="Home">${ic('home', 26)}</button>`;
  const backBtn = () => `<button class="icon-btn back-btn" data-a="back" aria-label="Back">${ic('back', 28)}</button>`;
  const srTitle = (t) => `<h1 class="sr-only">${esc(t)}</h1>`;

  function stepPills(now) {
    const items = [['feel', 'heart', 'Feel'], ['say', 'chat', 'Say'], ['calm', 'cloud', 'Calm']];
    const idx = items.findIndex((x) => x[0] === now);
    return `<div class="pills">${items.map((x, i) => {
      if (i < idx) return `<span class="pill done" role="img" aria-label="${x[2]}: done">${ic('check', 22)}</span>`;
      if (i === idx) return `<span class="pill now" role="img" aria-label="${x[2]}: now">${ic(x[1], 26)}</span>`;
      return `<span class="pill" role="img" aria-label="${x[2]}: next">${ic(x[1], 26)}</span>`;
    }).join('')}</div>`;
  }

  function dots(done, total, color, size) {
    let h = `<div class="dots" role="img" aria-label="${done} of ${total}">`;
    for (let i = 0; i < total; i++) {
      h += `<span class="dot ${i < done ? 'on' : ''}" style="width:${size || 20}px;height:${size || 20}px;${i < done ? 'background:' + (color || 'var(--teal)') : ''}"></span>`;
    }
    return h + '</div>';
  }

  // the things Lumi owns, where the child put them (state.roomPos[id] = { l, t, z } in % of the room),
  // or where they start. In the room itself (edit) each one can be dragged anywhere.
  function roomDecor(edit) {
    const walkers = A.buddyPets ? A.buddyPets() : []; // the puppy and kitten walk with Lumi instead
    const placed = state.roomPos || {};
    return D.ROOM.filter((r) => state.owned.includes(r.id) && !walkers.includes(r.id)).map((r) => {
      const p = r.pos;
      const c = placed[r.id];
      const pos = c ? `left:${c.l}%;top:${c.t}%;width:${p.w}%;z-index:${2 + (c.z || 0)}` : `left:${p.left}%;${p.top != null ? 'top:' + p.top + '%' : 'bottom:' + p.bottom + '%'};width:${p.w}%`;
      const art = L.item(r.id, '100%').replace('height="100%"', '');
      return edit
        ? `<div class="decor movable" data-id="${r.id}" style="${pos}" role="button" tabindex="-1" aria-label="${esc(r.name)}. Drag to move it.">${art}</div>`
        : `<div class="decor" style="${pos}" role="img" aria-label="${esc(r.name)}">${art}</div>`;
    }).join('');
  }

  // ================================================================ GUIDE: what to press next
  const handEl = document.createElement('div');
  handEl.id = 'hand';
  handEl.hidden = true;
  handEl.setAttribute('aria-hidden', 'true');
  handEl.innerHTML = ic('hand', 86);
  stage.appendChild(handEl);
  let guideTimer = null;

  const GUIDE = {
    home: () => ({ sel: '[data-a="startDay"]', say: S.day && !S.day.ended ? "Tap Go to carry on with Lumi's day." : 'Tap Go to start the day.' }),
    schedule: () => ({ sel: '[data-a="startDay"]', say: 'Tap Go to practise with Lumi.' }),
    menu: () => ({ sel: '[data-a="modeSolo"]', say: 'Tap Play.' }),
    routine: () => {
      if (!S.day || S.day.celebrate) return null;
      if (checklistPending()) {
        const k = S.day.check.ticked.indexOf(false);
        if (k < 0) return { sel: '[data-a="checkDone"]', say: 'All ready! Tap Ready.' };
        return { sel: `[data-a="tick"][data-k="${k}"]`, say: checkInfo(S.day.check.items[k]).voice + ' Then tap it.' };
      }
      if (activeChange()) return { sel: '[data-a="startHelp"]', say: 'Lumi needs help. Tap Help.' };
      const st = S.day.plan[S.day.i];
      if (A.stepGame && A.stepGame.has(st)) return A.stepGame.guide(st);
      return null;
    },
    feelings: () => {
      if (S.feelPick) return { sel: '[data-a="feelNext"]', say: 'Tap the arrow.' };
      const ch = activeChange();
      if (!ch) return null;
      // The answer is never shown straight away: the hand only appears if the child waits.
      return { sel: `[data-a="pickFeeling"][data-k="${ch.feeling}"]`, say: `Look at Lumi's face. Lumi feels ${D.FEELINGS[ch.feeling].label.toLowerCase()}.`, quiet: true, delay: state.settings.guideDelay * 1000 + 4000 };
    },
    calm: () => {
      if (S.calmDone) return { sel: '[data-a="calmReady"]', say: 'Tap Ready when you feel calm.' };
      if (S.calmTool === 'squeeze') return { sel: '[data-squeeze]', say: 'Press and hold the ball.' };
      if (S.calmTool === 'count') return { sel: '.count-btn.next', say: 'Tap the next number.' };
      if (S.calmTool === 'music') return { sel: '[data-a="bell"]', say: 'Tap the bells.' };
      return null;
    },
    end: () => ({ sel: '.gift-btn', say: S.gift ? 'Tap to see your present.' : 'Tap Open.' }),
    room: () => (S.roomSel ? { sel: '[data-a="roomBuy"]', say: 'Tap to buy it.' } : null),
    shop: () => {
      const it = D.WARDROBE.find((w) => w.id === S.shopSel);
      if (!it) return null;
      if (state.owned.includes(it.id)) return { sel: '[data-a="shopWear"]', say: 'Tap Wear.' };
      return state.stars >= it.price ? { sel: '[data-a="shopBuy"]', say: 'Tap to buy it.' } : null;
    },
    draw: () => (S.drew ? { sel: '[data-a="drawWear"]', say: 'Tap Wear to put it on Lumi.' } : null)
  };

  function guideTarget() {
    const g = GUIDE[S.screen] && GUIDE[S.screen]();
    if (!g) return null;
    const el = stage.querySelector(g.sel);
    return el ? Object.assign({ el }, g) : null;
  }
  function hideHand() { handEl.hidden = true; }
  function placeHand(el) {
    const st = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = st.width / (stage.offsetWidth || 1194);
    handEl.style.left = ((r.left - st.left + r.width * 0.5) / s) + 'px';
    handEl.style.top = ((r.top - st.top + r.height * 0.55) / s) + 'px';
    handEl.hidden = false;
  }
  function showHint(g) {
    if (!g || S.paused || !document.body.contains(g.el)) return;
    placeHand(g.el);
    if (S.lastHintFor !== S.screen + g.sel) { S.lastHintFor = S.screen + g.sel; track('hints', S.screen, { quiet: true }); }
    if (S.interacted) say(g.say);
  }
  function applyGuide() {
    clearTimeout(guideTimer);
    hideHand();
    stage.querySelectorAll('.guide-glow').forEach((e) => e.classList.remove('guide-glow'));
    if (!state.settings.guide || S.paused || S.celebrating) return;
    const g = guideTarget();
    if (!g) return;
    if (!g.quiet) g.el.classList.add('guide-glow');
    guideTimer = setTimeout(() => showHint(g), g.delay || state.settings.guideDelay * 1000);
  }
  function hintNow() {
    const g = guideTarget();
    if (g) { g.el.classList.add('guide-glow'); showHint(g); }
  }

  // ================================================================ SCREENS
  const PARENT_EARLY = {};
  const GUIDE_EARLY = {};
  const SCREENS = {};
  const AFTER = {}; // runs after a screen is drawn
  const ENTER = {}; // runs before a screen is drawn
  const VOICE = {}; // what Lumi says when a screen opens

  // ---------------------------------------------------------------- Art style cards (setup and Grown-ups › Child)
  function artCards(current, action, size) {
    return Object.keys(D.ART_STYLES).map((k) => {
      const a = D.ART_STYLES[k];
      return `<button class="art-card ${current === k ? 'on' : ''}" data-a="${action}" data-v="${k}" aria-pressed="${current === k}">
        <span class="art-prev" style="background:${a.bg}">${L.svg({ look: Object.assign({}, state.look, { head: 'none', body: 'none', back: 'none', feet: 'none' }), mood: 'happy', size, style: k })}
          <span class="art-dots">${a.dots.map((c) => `<i style="background:${c}"></i>`).join('')}</span></span>
        <span class="art-name">${a.name}</span><span class="art-who">${a.who}</span></button>`;
    }).join('');
  }
  A.artCards = artCards;
  // ---------------------------------------------------------------- Colour cards (setup and Grown-ups › Child)
  // The dark "Night arcade" colours were made for the pixel look, so they are not offered with Soft and round.
  const colourKeys = () => Object.keys(D.THEMES).filter((k) => k !== 'night');
  function colourCards(current, action) {
    const look = Object.assign({}, state.look, { head: 'none', body: 'none', back: 'none', feet: 'none' });
    return colourKeys().map((k) => {
      const t = D.THEMES[k];
      return `<button class="colour-card ${current === k ? 'on' : ''}" data-a="${action}" data-v="${k}" aria-pressed="${current === k}" aria-label="${esc(t.name)} colours">
        <span class="colour-prev" style="background:${t.surface}"><span class="colour-floor" style="background:${t.floor}"></span><span class="colour-dot" style="background:${t.accent}"></span>
          <span class="colour-lumi">${L.svg({ look, mood: 'happy', size: 44 })}</span></span>
        <span class="colour-name">${esc(t.name)}</span></button>`;
    }).join('');
  }
  A.colourCards = colourCards;

  // ---------------------------------------------------------------- First-run setup (for grown-ups)
  VOICE.setup = () => '';
  SCREENS.setup = () => {
    const p = state.profile;
    const ages = Object.keys(D.AGES).map((k) => {
      const a = D.AGES[k];
      const look = k === 'teen' ? { color: 'cocoa', head: 'phones' } : k === 'little' ? { color: 'pink', head: 'bow' } : {};
      return `<button class="age-card ${p.age === k ? 'on' : ''}" data-a="setupAge" data-v="${k}" aria-pressed="${p.age === k}">
        <span class="age-lumi">${L.svg({ look: lookWith(look), mood: 'happy', size: 130 })}</span>
        <span class="age-name">${a.name}</span><span class="age-range">Ages ${a.range}</span><span class="g-note">${a.note}</span></button>`;
    }).join('');
    const themes = Object.keys(D.THEMES).map((k) => `<button class="theme-dot ${p.theme === k ? 'on' : ''}" data-a="setupTheme" data-v="${k}" style="background:${D.THEMES[k].bg};border-color:${D.THEMES[k].accent}" aria-label="${D.THEMES[k].name} theme" aria-pressed="${p.theme === k}"><span style="background:${D.THEMES[k].accent}"></span></button>`).join('');
    const levels = [1, 2, 3].map((n) => `<button class="seg-opt ${p.level === n ? 'on' : ''}" data-a="setupLevel" data-v="${n}" aria-pressed="${p.level === n}">${D.LEVELS[n]}</button>`).join('');
    return `
<section class="screen grownup setup" aria-label="Set up Lumi">
  <div class="row gap16">${L.svg({ look: lookWith(), mood: 'excited', wave: true, size: 92 })}
    <div class="col"><h1 class="g-title big">Welcome to Lumi</h1><span class="g-sub">For grown-ups: set Lumi up for your child. You can change everything later in Grown-ups.</span></div></div>
  <div class="g-h">1. Who is playing?</div>
  <div class="row gap16">${ages}</div>
  <div class="row gap24 setup-row">
    <label class="g-field grow"><span>2. Child's name (Lumi will say it)</span><input id="f-setup-name" type="text" data-input="childName" value="${esc(state.childName)}" maxlength="20" placeholder="Optional"></label>
    <div class="g-field grow"><span>3. How hard should games be?</span><div class="seg">${levels}</div></div>
  </div>
  <div class="g-h">4. Colours (you can change this later)</div>
  <div class="colour-grid six">${colourCards(p.theme, 'setupTheme')}</div>
  <div class="row between">
    <span class="row gap12"><button class="g-btn outline" data-a="qzOpen" data-v="setup">${ic('sliders', 20)}<span>${state.sensory && state.sensory.done ? 'Sensory settings done' : 'Sensory quick-start (5 questions)'}</span></button><span class="g-note">Saved on this device only.</span></span>
    <button class="g-btn big-g" data-a="setupDone">${ic('check', 22)}<span>Start Lumi</span></button>
  </div>
</section>`;
  };

  // ---------------------------------------------------------------- Main menu: choose a mode
  // The child's own world: the sky follows the real time of day, Lumi greets them by name, their photo hangs
  // on the wall, Lumi shows what is coming next, and tapping Lumi gets a giggle.
  function timeOfDay() {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'day' : h >= 17 && h < 19.5 ? 'evening' : 'night';
  }
  const GREET = { morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good evening' };
  VOICE.menu = () => `${GREET[timeOfDay()]}${state.childName ? ' ' + state.childName : ''}! Do you want to play by yourself, or together?`;
  function menuNext() {
    let sn;
    try { sn = scheduleNow(); } catch (e) { return null; }
    if (!sn || !sn.steps.length) return null;
    const st = sn.next || sn.now;
    if (!st) return null;
    return { st, info: stepInfo(st), when: sn.next ? 'Next' : 'Now' };
  }
  function menuSky(tod) {
    if (tod === 'night') {
      return `<div class="mh-moon"></div>${[[14, 30], [30, 18], [72, 14], [86, 32], [58, 26], [8, 46]].map(([x, y], i) => `<i class="mh-star" style="left:${x}%;top:${y}%;animation-delay:${i * 0.7}s"></i>`).join('')}`;
    }
    return `<div class="mh-sun ${tod}"></div><div class="sky-cloud" style="left:5%;top:20%"></div><div class="sky-cloud sm" style="left:70%;top:46%"></div>`;
  }
  SCREENS.menu = () => {
    const teen = state.profile.age === 'teen';
    const tod = timeOfDay();
    const nm = state.childName;
    const nx = menuNext();
    const show = state.profile.show || {};
    const peek = [['day', 'kDay'], ['talk', 'kTalk'], ['calm', 'kCalm'], ['play', 'kFun']].filter(([k]) => show[k] !== false)
      .map(([, icon]) => `<span class="mc-peek-ic">${ic(icon, 38)}</span>`).join('');
    const partner = state.profile.partner || 'a grown-up';
    const pPhoto = state.profile.partnerPhoto;
    const duo = state.childPhoto || pPhoto
      ? `<span class="duo"><span class="duo-a">${state.childPhoto ? `<img src="${state.childPhoto}" alt="">` : L.svg({ look: lookWith({ spark: 'none' }), mood: 'happy', size: 74 })}</span>
         <span class="duo-b">${pPhoto ? `<img src="${pPhoto}" alt="">` : `<b>${esc(partner.charAt(0))}</b>`}</span><span class="duo-heart">${ic('kHeart', 30)}</span></span>`
      : ic('kDuo', 70);
    return `
<section class="screen menu-screen" aria-label="Lumi main menu">
  ${srTitle('Lumi')}
  <div class="row gap24 grow">
    <div class="panel scene menu-hero tod-${tod}">
      ${menuSky(tod)}
      <div class="menu-brand">Lumi</div>
      <div class="menu-greet ${nm ? '' : 'no-name'}"><span class="mg-hi">${GREET[tod]}${nm ? ',' : '!'}</span>${nm ? `<span class="mg-name">${esc(nm)}!</span>` : ''}</div>
      ${state.childPhoto ? `<div class="mh-frame"><img src="${state.childPhoto}" alt="${esc(nm || 'Me')}"><span class="mh-tape"></span></div>` : ''}
      <div class="floor" style="height:22%"></div>
      ${nx ? `<button class="mh-next ${state.childPhoto ? 'right' : ''}" data-a="say" data-text="${esc(nx.when + ': ' + nx.info.label)}" aria-label="${esc(nx.when + ': ' + nx.info.label)}">
        <span class="mh-next-art" style="background:${nx.info.tint || '#FFF1C2'}">${stepArt(nx.info, 56)}</span>
        <span class="col"><span class="mh-next-when">${nx.when}${nx.st.time ? ' · ' + fmt(nx.st.time) : ''}</span><span class="mh-next-label">${esc(nx.info.label)}</span></span>
      </button>` : ''}
      <button class="lumi-pos menu-lumi tap-lumi bob" data-a="lumiPlay" data-mood="${tod === 'night' ? 'sleepy' : 'happy'}" aria-label="Play with Lumi" style="left:50%;margin-left:-180px;bottom:3%">${L.svg({ look: lookWith({ spark: 'none' }), mood: tod === 'night' ? 'sleepy' : 'happy', wave: tod !== 'night', size: 360 })}</button>
      <div class="menu-speak">${speakBtn(VOICE.menu(), 60)}</div>
    </div>
    <div class="col gap16" style="width:520px">
      <button class="mode-card solo" data-a="modeSolo">
        <span class="mc-deco"><i></i><i></i><i></i></span>
        <span class="mode-ic play-ic"><span class="mc-pulse"></span>${ic('kPlay', 70)}</span>
        <span class="col gap10"><span class="mode-name">${teen ? 'Solo' : 'Play'}</span>
          ${teen ? '<span class="mode-sub">My day, talk, calm and games</span>' : ''}
          <span class="mc-peek">${peek}</span></span>
      </button>
      <button class="mode-card together" data-a="modeTogether">
        <span class="mc-deco hearts"><i>${ic('heart', 26)}</i><i>${ic('heart', 18)}</i></span>
        <span class="mode-ic">${duo}</span>
        <span class="col"><span class="mode-name">Together</span><span class="mode-sub">With ${esc(partner)}</span></span>
      </button>
      <button class="mode-card grown hold-btn" data-hold="builder" aria-label="Grown-ups: press and hold">
        <span class="mode-ic">${ic('kLock', 70)}</span>
        <span class="col"><span class="mode-name">Grown-ups</span><span class="mode-sub">Press and hold</span></span>
        <span class="hold-fill"></span>
      </button>
    </div>
  </div>
</section>`;
  };
  // ---------------------------------------------------------------- playing with Lumi on the start screens
  // Each tap gets a different trick: a jump, a spin, a wiggle dance, a squishy bounce, a star jump, a big hug.
  // Lumi looks excited while doing it, the pet joins in, and there is a short happy sound and line.
  // At night the tricks are slower and sleepier. The tricks never run faster than the child can follow.
  const TRICKS = [
    { id: 'jump', mood: 'excited', ms: 900, notes: [523, 659, 784], line: 'Wheee! Up I go!' },
    { id: 'spin', mood: 'excited', ms: 1300, notes: [587, 698, 880, 698], line: 'Look, I can turn around!' },
    { id: 'wiggle', mood: 'happy', ms: 1100, notes: [622, 740, 622, 740], line: 'Wiggle wiggle!' },
    { id: 'squish', mood: 'happy', ms: 800, notes: [392, 523], line: 'Boing! That tickles!' },
    { id: 'star', mood: 'excited', ms: 1000, notes: [659, 880, 1047, 1319], line: 'Star jump!', fx: 'star' },
    { id: 'hug', mood: 'happy', ms: 1300, notes: [523, 659], line: 'hug', fx: 'kHeart' }
  ];
  const SLEEPY_TRICKS = [
    { id: 'yawn', mood: 'sleepy', ms: 1500, notes: [440, 392], line: 'Yaaawn! I\'m a little sleepy.' },
    { id: 'squish', mood: 'happy', ms: 800, notes: [392, 523], line: 'Boing!' },
    { id: 'hug', mood: 'happy', ms: 1300, notes: [523, 659], line: 'hug', fx: 'kHeart' }
  ];
  let trickN = 0;
  function turnAround(el, size, mood, ms) {
    const t0 = performance.now();
    const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      const cur = el.querySelector('svg.lumi');
      if (!cur || !el.isConnected) return;
      cur.outerHTML = p < 1 ? L.turnSvg({ look: lookWith({ spark: 'none' }), mood, size }, ease(p) * 360) : L.svg({ look: lookWith({ spark: 'none' }), mood, size });
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  let trickTimer = null;
  function lumiPlay() {
    const el = stage.querySelector('.tap-lumi');
    if (!el) return;
    const night = S.screen === 'menu' && timeOfDay() === 'night';
    const list = night ? SLEEPY_TRICKS : TRICKS;
    const t = list[trickN++ % list.length];
    const nm = state.childName ? ', ' + state.childName : '';
    const pet = (A.buddyPets ? A.buddyPets() : []).map((k) => state.pets && state.pets[k] && state.pets[k].name).filter(Boolean)[0];
    let line = t.line === 'hug' ? `A big hug for you${nm}!` : t.line;
    if (pet && t.id === 'jump') line = `Wheee! ${pet} is jumping too!`;
    say(line);
    t.notes.forEach((f, k) => setTimeout(() => tone(f, 0.22, 0.07), k * 110));
    // Lumi's face changes for the trick, then goes back
    const svg = el.querySelector('svg.lumi');
    const size = svg ? parseFloat(svg.getAttribute('width')) : 300;
    const baseMood = el.dataset.mood || 'happy';
    const draw = (mood, wave) => { const cur = el.querySelector('svg.lumi'); if (cur) cur.outerHTML = L.svg({ look: lookWith({ spark: 'none' }), mood, wave, size }); };
    clearTimeout(trickTimer);
    draw(t.mood, t.id === 'hug' || t.id === 'jump' || t.id === 'star');
    TRICKS.concat(SLEEPY_TRICKS).forEach((x) => el.classList.remove('lj-' + x.id, 'lj-spin3d'));
    void el.offsetWidth;
    // the turn-around is drawn frame by frame, so Lumi really turns: face round the side, back with a tail, and front again
    if (t.id === 'spin' && L.canTurn && L.canTurn() && !state.settings.reduceMotion) {
      el.classList.add('lj-spin3d');
      turnAround(el, size, t.mood, t.ms);
    } else {
      el.classList.add('lj-' + t.id);
    }
    // the pet joins in a moment later
    el.querySelectorAll('.pet-buddy').forEach((p) => { p.classList.remove('joins'); void p.offsetWidth; p.classList.add('joins'); });
    if (t.fx) {
      const n = t.fx === 'star' ? 6 : 3;
      for (let k = 0; k < n; k++) {
        const f = document.createElement('span');
        f.className = 'lj-fx ' + (t.fx === 'star' ? 'burst' : 'float');
        f.style.setProperty('--a', (t.fx === 'star' ? -75 + k * 30 : 0) + 'deg');
        f.style.left = t.fx === 'star' ? '50%' : (30 + k * 20) + '%';
        f.style.animationDelay = (t.fx === 'star' ? 0.25 : k * 0.18) + 's';
        f.innerHTML = ic(t.fx, t.fx === 'star' ? 40 : 44);
        el.appendChild(f);
        setTimeout(() => f.remove(), 1800);
      }
    }
    trickTimer = setTimeout(() => {
      el.classList.remove('lj-' + t.id);
      draw(baseMood, baseMood !== 'sleepy');
    }, t.ms + 150);
  }
  // ---------------------------------------------------------------- Home (solo mode)
  VOICE.home = () => greeting();
  // The home screen keeps choices few: Go, plus four big tiles. Games, stories, learning, the pet and dressing up live in "Fun".
  const TILES = [
    ['day', 'My day', 'kDay', 'schedule', '#BFD8EE', '#4A78A8', 'routines'],
    ['talk', 'Talk', 'kTalk', 'talk', '#BFE0DC', '#2F7E79', 'communication'],
    ['calm', 'Calm', 'kCalm', 'calm', '#D9D2EE', '#7E64C8', 'emotions'],
    ['fun', 'Fun', 'kFun', 'fun', '#F3DDA0', '#B07A12', null]
  ];
  const FUN = [
    ['play', 'Games', 'kPuzzle', 'play', '#CFE3C4', '#4F8A3F', 'thinking'],
    ['stories', 'Stories', 'kStories', 'stories', '#F2D2E4', '#A8457A', 'social'],
    ['learn', 'Learn', 'kLearn', 'learn', '#D6DAF5', '#5B6ABF', 'lifeskills'],
    ['pet', 'Pet', 'kPet', 'pet', '#F2D2C4', '#C0674A', 'lifeskills'],
    ['me', 'Dress up', 'kDress', 'dressup', '#F2C9D6', '#C2577A', null],
    ['room', 'Room', 'kRoom', 'room', '#F6D2C8', '#C0574A', null]
  ];
  const ownedPets = () => ['puppy', 'kitten', 'fishtank'].filter((id) => state.owned.includes(id));
  // Little ones get fewer choices in Fun (no room shop); grown-ups can still open it from the Pet corner
  const funItems = () => FUN.filter((t) => state.profile.show[t[0]] !== false && !(t[0] === 'room' && state.profile.age === 'little'));
  // Teens get a few words under each home button
  const TILE_SUB = { day: 'Your timetable', talk: 'Say what you need', calm: 'Calm tools', fun: 'Games, stories, skills' };
  function tileHtml([key, label, icon, to, border, color, skill], big) {
    const locked = key === 'pet' && !ownedPets().length;
    const focus = skill && state.profile.targets[skill];
    return `<button class="tile home-tile ${big ? 'big-tile' : ''} ${locked ? 'locked' : ''}" data-a="${locked ? 'petLocked' : 'nav'}" data-to="${to}" style="border-color:${border}" aria-label="${label}${locked ? ', locked' : ''}">
      <span class="tile-ic" style="background:${border}66;color:${color}">${ic(icon, big ? (state.profile.age === 'little' ? 104 : 84) : 60)}</span><span class="tile-label">${label}</span>${big && state.profile.age === 'teen' && TILE_SUB[key] ? `<span class="tile-sub">${TILE_SUB[key]}</span>` : ''}
      ${locked ? `<span class="tile-lock">${ic('lock', 18)}</span>` : ''}${focus ? `<span class="tile-focus" title="Focus">${ic('star', 22)}</span>` : ''}
    </button>`;
  }
  const longDate = () => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  SCREENS.home = () => {
    const resume = S.day && !S.day.ended;
    const tiles = TILES.filter((t) => (t[0] === 'fun' ? funItems().length : state.profile.show[t[0]] !== false)).map((t) => tileHtml(t, true)).join('');
    return `
<section class="screen" aria-label="Home">
  ${srTitle('Lumi home')}
  <div class="row between" style="height:60px">
    <div class="row gap12"><button class="icon-btn back-btn" data-a="nav" data-to="menu" aria-label="Back to the menu">${ic('back', 28)}</button>${speakBtn(greeting())}
      <span class="clock-chip" aria-live="off">${ic('clock', 22)}<span data-clock="date">${esc(longDate())}</span><b data-clock="time">${fmt(fromMin(nowMin()))}</b></span></div>
    <div class="row gap12">${A.streakChip && state.profile.age !== 'little' ? A.streakChip() : ''}${state.profile.age === 'teen' ? doneChip() : starChip(true)}</div>
  </div>
  <div class="row gap24 grow">
    <div class="col gap16" style="width:540px">
      <div class="panel scene grow">
        <div class="window"><div class="window-sun"></div><div class="window-cloud"></div></div>
        <div class="floor"></div>
        ${roomDecor()}
        ${A.comingUpChip ? A.comingUpChip() : ''}
        ${state.profile.show.chat !== false ? `<button class="ch-open" data-a="nav" data-to="chat" aria-label="Chat with Lumi"><span class="ch-open-face">${L.svg({ look: lookWith({ spark: 'none' }), mood: 'happy', size: 44 })}</span><span>Chat</span><span class="ch-open-dots"><i></i><i></i><i></i></span></button>` : ''}
        ${(() => { const sz = (agePack() || {}).lumiSize || 350; return `<button class="lumi-pos tap-lumi bob" data-a="lumiPlay" data-mood="happy" aria-label="Play with Lumi" style="left:50%;margin-left:-${sz / 2}px;bottom:4%">${L.svg({ look: lookWith(), mood: 'happy', wave: true, size: sz })}</button>`; })()}
      </div>
      <button class="primary big" data-a="startDay" style="height:112px;flex:none">${ic('play', 54)}<span>${resume ? 'Go on' : 'Go'}</span></button>
    </div>
    <div class="home-grid four grow">${tiles}</div>
  </div>
</section>`;
  };

  // "Fun": games, stories, learning, the pet and dressing up, one tap away from home
  PARENT_EARLY.fun = 'home';
  VOICE.fun = () => 'What would you like to do?';
  SCREENS.fun = () => `
<section class="screen" aria-label="Fun">
  ${srTitle('Fun')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn('What would you like to do?')}</div>
    ${starChip(true)}
  </div>
  <div class="fun-grid grow n${funItems().length}">${funItems().map((t) => tileHtml(t, true)).join('')}</div>
</section>`;
  GUIDE_EARLY.fun = () => ({ sel: '.fun-grid .home-tile', say: 'Pick one.', delay: state.settings.guideDelay * 1000 + 4000 });

  // ---------------------------------------------------------------- My day (the child's real timetable, now and next)
  function scheduleNow() {
    const steps = dayPlan(todayKey());
    const n = nowMin();
    let idx = -1;
    steps.forEach((s, i) => { if (toMin(s.time) <= n) idx = i; });
    return { steps, idx, now: idx >= 0 ? steps[idx] : null, next: steps[idx + 1] || null };
  }
  VOICE.schedule = () => {
    const { now, next, steps } = scheduleNow();
    if (!steps.length) return 'There is no plan for today yet.';
    const parts = [];
    if (now) parts.push(`Now: ${stepInfo(now).label}.`);
    if (next) parts.push(`Next: ${stepInfo(next).label}, at ${fmt(next.time)}.`);
    if (!next) parts.push('That is the last thing today.');
    return parts.join(' ');
  };
  SCREENS.schedule = () => {
    const { steps, idx, now, next } = scheduleNow();
    const n = nowMin();
    let nowCard;
    if (now) {
      const info = stepInfo(now);
      const start = toMin(now.time);
      const end = next ? toMin(next.time) : 24 * 60;
      const pct = Math.max(0, Math.min(100, Math.round(((n - start) / Math.max(1, end - start)) * 100)));
      nowCard = `<div class="now-card" style="background:${info.tint}">
        <span class="when-chip now">${ic('clock', 22)}<span>Now</span></span>
        <div class="now-art">${stepArt(info, 190)}</div>
        <div class="now-name">${esc(info.label)}</div>
        <div class="row gap12 now-time"><span>${fmt(now.time)}</span>${next ? `<span class="muted">to ${fmt(next.time)}</span>` : ''}</div>
        <div class="bar-track wide" role="img" aria-label="${pct}% of the time used"><div class="bar-fill teal" style="width:${pct}%"></div></div>
      </div>`;
    } else {
      nowCard = `<div class="now-card" style="background:#F1ECFB">
        <span class="when-chip now">${ic('moon', 22)}<span>Now</span></span>
        <div class="now-art">${L.svg({ look: lookWith(), mood: 'sleepy', size: 210 })}</div>
        <div class="now-name">${steps.length ? 'Rest time' : 'No plan yet'}</div>
        <div class="now-time muted">${steps.length ? 'The day starts at ' + fmt(steps[0].time) : 'Ask a grown-up to make one'}</div>
      </div>`;
    }
    const nextCard = next
      ? (() => {
        const info = stepInfo(next);
        const bring = (next.check || []).slice(0, 5).map((id) => `<span class="bring-ic" title="${esc(checkInfo(id).label)}">${checkArt(id, 30)}</span>`).join('');
        return `<div class="next-card" style="background:${info.tint}"><span class="when-chip">${ic('arrow', 20)}<span>Next</span></span><div class="next-art">${stepArt(info, bring ? 90 : 110)}</div><div class="label">${esc(info.label)}</div><div class="small muted">${fmt(next.time)}</div>${bring ? `<div class="bring-row" role="img" aria-label="Get ready: ${esc((next.check || []).map((id) => checkInfo(id).label).join(', '))}">${bring}</div>` : ''}</div>`;
      })()
      : `<div class="next-card" style="background:#fff"><span class="when-chip">${ic('arrow', 20)}<span>Next</span></span><div class="next-art">${ic('moon', 100)}</div><div class="label">Sleep</div></div>`;
    const strip = steps.map((s, i) => {
      const info = stepInfo(s);
      const cls = i < idx ? 'past' : i === idx ? 'current' : '';
      return `<div class="day-chip ${cls}" role="img" aria-label="${esc(info.label)} at ${fmt(s.time)}${i < idx ? ', done' : i === idx ? ', now' : ''}">
        <span class="day-time">${fmt(s.time).replace(' ', ' ')}</span>
        <span class="day-art" style="background:${info.tint}">${stepArt(info, 44)}${i < idx ? `<span class="day-done">${ic('check', 16)}</span>` : ''}</span>
        <span class="day-name">${esc(info.label)}</span>
      </div>`;
    }).join('');
    return `
<section class="screen" aria-label="My day">
  ${srTitle('My day')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn(VOICE.schedule())}</div>
    <span class="day-badge">${ic('calendar', 26)}<span>${dayName(todayKey())}</span></span>
  </div>
  <div class="row gap24 grow">
    ${nowCard}
    <div class="col gap16" style="width:340px">
      ${nextCard}
      <button class="soft-btn" data-a="nav" data-to="nownext">${ic('hourglass', 34)}<span>Now &amp; Next timer</span></button>
      <button class="primary" data-a="startDay" style="height:96px">${ic('play', 44)}<span>Go</span></button>
    </div>
  </div>
  <div class="day-strip" id="dayStrip">${strip || '<span class="muted small">No steps yet</span>'}</div>
</section>`;
  };
  AFTER.schedule = () => {
    const cur = stage.querySelector('.day-chip.current');
    if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    every(() => { if (S.screen === 'schedule') render(); }, 30000);
  };

  // ---------------------------------------------------------------- Routine (the game)
  VOICE.routine = () => {
    if (checklistPending()) return checkVoice();
    const ch = activeChange();
    const st = S.day.plan[S.day.i];
    if (!ch && A.stepGame && A.stepGame.has(st)) return A.stepGame.voice(st);
    return ch ? ch.voice : stepInfo(st).voice;
  };

  function planStrip() {
    const d = S.day;
    const plan = d.plan;
    const ch = activeChange();
    // Little ones see fewer, bigger cards; Teens see more of the day at once
    // (little ones see just Now and Next, so the day never looks like a long list of jobs)
    const little = state.profile.age === 'little';
    const N = { little: 2, teen: 5 }[state.profile.age] || 4;
    const start = little ? Math.min(d.i, Math.max(0, plan.length - N)) : Math.max(0, Math.min(d.i - 1, plan.length - N));
    const show = plan.slice(start, start + N);
    const cards = show.map((st, k) => {
      const idx = start + k;
      const info = stepInfo(st);
      let cls = 'next';
      let badge = '';
      let status = 'next';
      if (idx < d.i) { cls = 'done'; status = 'done'; badge = `<span class="badge done-badge">${ic('check', 20)}</span>`; }
      else if (idx === d.i) {
        cls = ch ? 'changed' : 'now';
        status = ch ? 'changed' : 'now';
        if (ch) badge = `<span class="badge change-badge">${ic(ch.icon === 'busPurple' ? 'busLine' : ch.icon, 26)}</span>`;
      }
      return `<div class="plan-card ${cls}" role="img" aria-label="${esc(info.label)} at ${fmt(st.time)}: ${status}">${badge}<span class="plan-ic">${stepArt(info, state.profile.age === 'little' ? 64 : state.profile.age === 'teen' ? 40 : 48)}</span><span class="label">${esc(info.label)}${A.l2Html ? A.l2Html(info.label) : ''}</span><span class="plan-time">${fmt(st.time)}</span></div>`;
    });
    let html = '<div class="plan-strip">';
    cards.forEach((c, k) => { html += c; if (k < cards.length - 1) html += `<span class="chev">${ic('chev', 24)}</span>`; });
    const more = plan.length - (start + show.length);
    if (more > 0 && !little) html += `<span class="more-steps">+${more}</span>`;
    return html + '</div>';
  }

  function thought(ch) {
    if (ch.id === 'late') return `<span class="ic-amber">${ic('clock', 60)}</span><div class="col gap8"><span class="big-num">5</span>${dots(5, 5, 'var(--changed)', 18)}</div>`;
    if (ch.id === 'rain') return `<span class="ic-blue">${ic('rain', 64)}</span>${L.item('raincoat', 60)}`;
    return `${ic('bus', 56)}<span class="ic-muted">${ic('arrow', 36)}</span>${ic('busPurple', 56)}`;
  }

  function changeScene(ch) {
    const rain = ch.id === 'rain';
    let drops = '';
    if (rain) for (let i = 0; i < 14; i++) drops += `<span class="drop" style="left:${(i * 7.3) % 100}%;animation-delay:${(i % 5) * 0.25}s"></span>`;
    const mood = ch.feeling === 'sad' ? 'sad' : ch.feeling === 'scared' ? 'scared' : 'worried';
    return `<div class="panel scene grow" style="background:${rain ? '#C9D6E2' : '#DCEEF7'}">
      ${rain ? '' : '<div class="sky-cloud" style="left:6%;top:9%"></div>'}
      ${drops}
      <div class="floor" style="height:26%;background:#D9D2C7"></div>
      <div class="bus-stop"><div class="bus-sign">${ic('busLine', 40)}</div><div class="bus-pole"></div></div>
      <div class="bench"></div>
      <div class="lumi-pos" style="left:38%;bottom:10%">${L.svg({ look: lookWith(), mood, size: 230, label: 'Lumi looks ' + ch.feeling })}</div>
      <div class="thought" style="left:63%;top:8%">${thought(ch)}</div>
      <span class="thought-dot" style="left:61%;top:47%"></span><span class="thought-dot sm" style="left:59%;top:55%"></span>
    </div>`;
  }

  function celebrateScene(info) {
    return `<div class="panel scene grow" style="background:${info.tint}">
      <div class="floor" style="height:22%"></div>
      <div class="step-picture done-pic"><span class="step-ic">${stepArt(info, 180)}</span><span class="big-check">${ic('check', 90)}</span></div>
      <div class="lumi-pos hop" style="right:5%;bottom:5%">${L.svg({ look: dayLook(), mood: 'excited', size: 240 })}</div>
    </div>`;
  }

  function checkVoice() {
    const d = S.day;
    const info = stepInfo(d.plan[d.i]);
    return `Before ${info.label.toLowerCase()}, let's get ready. Tap each one when it is done.`;
  }
  // "Before you go": things to do or bring before this step starts
  function checklistScene(info) {
    const c = S.day.check;
    const all = !c.ticked.includes(false);
    const cards = c.items.map((id, k) => {
      const ci = checkInfo(id);
      const on = c.ticked[k];
      return `<button class="check-card ${on ? 'on' : ''}" data-a="tick" data-k="${k}" aria-pressed="${on}" aria-label="${esc(ci.label)}${on ? ', done' : ''}">
        <span class="check-kind">${ci.kind === 'bring' ? ic('bag', 18) : ic('check', 18)}<span>${ci.kind === 'bring' ? 'Bring' : 'Do'}</span></span>
        <span class="check-art">${checkArt(id, 96)}</span><span class="check-label">${esc(ci.label)}</span>
        <span class="check-tick">${on ? ic('check', 30) : ''}</span></button>`;
    }).join('');
    return `<div class="panel scene grow check-scene" style="background:${info.tint}">
      <div class="check-head"><span class="check-step">${stepArt(info, 54)}</span><span class="check-title">Before ${esc(info.label)}</span></div>
      <div class="check-grid n${Math.min(c.items.length, 6)}">${cards}</div>
      <div class="lumi-pos ${all ? 'hop' : ''}" style="right:3%;bottom:3%">${L.svg({ look: lookWith({ back: state.owned.includes('backpack') ? 'backpack' : state.look.back }), mood: all ? 'excited' : 'happy', size: 170 })}</div>
    </div>`;
  }

  SCREENS.routine = () => {
    const d = S.day;
    const step = d.plan[d.i];
    const info = stepInfo(step);
    if (checklistPending()) {
      const c = d.check;
      const n = c.ticked.filter(Boolean).length;
      const all = n === c.items.length;
      return routineFrame(info, step, checklistScene(info), `<div class="bar">${speakBtn(checkVoice(), 52)}<span class="time-chip">${ic('clock', 26)}<span>${fmt(step.time)}</span></span><span class="grow"></span>
        ${dots(n, c.items.length, 'var(--green)', 24)}
        <button class="primary ${all ? '' : 'faded'}" data-a="checkDone" style="height:76px">${ic('check', 32)}<span>Ready</span></button></div>`, null);
    }
    const ch = activeChange();
    const game = !ch && !d.celebrate && A.stepGame && A.stepGame.has(step);
    const main = ch ? changeScene(ch) : d.celebrate ? celebrateScene(info) : A.stepGame.scene(step, info);
    const bar = game ? A.stepGame.bar(step, info) : ch
      ? `<div class="bar">${speakBtn(ch.voice, 52)}<span class="mini-lumi">${L.svg({ look: lookWith(), mood: 'worried', size: 70 })}</span><span class="grow"></span>
          <button class="primary" data-a="startHelp" style="height:76px">${ic('heart', 32)}<span>Help</span>${ic('arrow', 30)}</button></div>`
      : `<div class="bar">${speakBtn(info.voice, 52)}<span class="time-chip">${ic('clock', 26)}<span>${fmt(step.time)}</span></span><span class="grow"></span></div>`;
    return routineFrame(info, step, main, bar, ch);
  };
  function routineFrame(info, step, main, bar, ch) {
    const d = S.day;
    const part = D.PARTS.find((p) => p.id === d.part);
    const rail = `<div class="rail">
      <button class="rail-btn" data-a="railTalk" aria-label="Talk"><span class="rail-circle" style="background:var(--teal-soft);border-color:var(--teal);color:var(--teal)">${ic('kTalk', 54)}</span><span>Talk</span></button>
      <button class="rail-btn" data-a="railCalm" aria-label="Calm"><span class="rail-circle" style="background:#EEE8F9;border-color:#7E64C8;color:#7E64C8">${ic('kCalm', 56)}</span><span>Calm</span></button>
      <button class="rail-btn" data-a="hint" aria-label="Hint: show me what to tap"><span class="rail-circle" style="background:var(--star-tint);border-color:var(--q);color:#9A6A10">${ic('kHint', 54)}</span><span>Hint</span></button>
    </div>`;
    return `
<section class="screen tight" aria-label="Today's plan">
  ${srTitle("Today's plan")}
  <div class="row between" style="height:52px">
    <div class="row gap12">${backBtn()}${speakBtn(VOICE.routine(), 52)}</div>
    <div class="row gap12"><span class="day-badge sm"><span data-clock="time">${fmt(fromMin(nowMin()))}</span><span class="muted">·</span><span>${part ? esc(part.name) : esc(dayName(d.dayKey))}</span></span></div>
  </div>
  ${planStrip()}
  <div class="row gap24 grow">${main}${rail}</div>
  ${bar}
</section>`;
  }

  // ---------------------------------------------------------------- Name the feeling
  VOICE.feelings = () => (activeChange() ? 'How does Lumi feel?' : 'How do you feel?');
  SCREENS.feelings = () => {
    const ch = activeChange();
    const expected = ch ? ch.feeling : null;
    let kinds = expected === 'scared' ? ['happy', 'sad', 'worried', 'scared'] : ['happy', 'sad', 'angry', 'worried'];
    if (level() === 1) kinds = expected && expected !== 'happy' ? ['happy', expected] : ['happy', 'sad'];
    if (level() === 3) kinds = ['happy', 'sad', 'angry', 'worried', 'scared'];
    const lumiMood = !ch ? (S.feelPick || 'happy') : expected === 'sad' ? 'sad' : expected === 'scared' ? 'scared' : 'worried';
    const cards = kinds.map((k) => {
      const f = D.FEELINGS[k];
      const sel = S.feelPick === k;
      const hint = S.feelHint && k === expected && !S.feelPick;
      return `<button class="feel-card ${sel ? 'sel' : ''} ${hint ? 'hint-ring' : ''}" data-a="pickFeeling" data-k="${k}" style="background:${f.tint};border-color:${f.stroke}">${L.face(k, 130)}<span>${f.label}${A.l2Html ? A.l2Html(f.label) : ''}</span></button>`;
    }).join('');
    return `
<section class="screen" aria-label="Name the feeling">
  ${srTitle(ch ? 'How does Lumi feel?' : 'How do you feel?')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn(ch ? 'How does Lumi feel?' : 'How do you feel?')}<span class="qmark" aria-hidden="true">?</span></div>
    ${S.mode === 'flow' ? stepPills('feel') : ''}
  </div>
  <div class="row gap24 grow">
    <div class="panel scene" style="width:400px;background:#DCEEF7">
      <div class="floor" style="height:19%;background:#D9D2C7"></div>
      ${ch ? `<div class="chip-white" style="left:28px;top:28px"><span class="ic-amber">${ic(ch.icon === 'busPurple' ? 'busLine' : ch.icon, 24)}</span>${ic('bus', 26)}</div>` : ''}
      <div class="lumi-pos" style="left:50px;bottom:60px">${L.svg({ look: lookWith(), mood: lumiMood === 'angry' ? 'worried' : lumiMood, size: 300 })}</div>
    </div>
    <div class="feel-grid grow n${kinds.length}">${cards}</div>
  </div>
  <div class="bar" style="height:96px">
    <button class="round-btn" data-a="hint" aria-label="Hint: show me what to tap" style="background:var(--star-tint);border-color:var(--q);color:#9A6A10">${ic('kHint', 46)}</button>
    <span class="grow"></span>
    <button class="primary ${S.feelPick ? '' : 'faded'}" data-a="feelNext" aria-label="Next: help Lumi say it" style="height:72px">${ic('chat', 32)}${ic('arrow', 28)}</button>
  </div>
</section>`;
  };

  // ---------------------------------------------------------------- Calm corner
  VOICE.calm = () => "Let's calm down together.";
  function calmCenter() {
    const t = S.calmTool;
    if (t === 'balloon') {
      return `<div class="balloon-box">
        <div class="balloon ${S.calmDone ? 'still' : ''}"><svg width="280" height="336" viewBox="0 0 300 360" aria-hidden="true"><path d="M150 282 C140 300 160 314 150 332 C142 346 156 352 150 360" fill="none" stroke="#7D8CA8" stroke-width="3" stroke-linecap="round"/><ellipse cx="150" cy="140" rx="120" ry="134" fill="#9BB7D4"/><ellipse cx="108" cy="84" rx="22" ry="38" fill="#fff" opacity=".5"/><polygon points="140 286 160 286 150 272" fill="#7FA0C2"/></svg></div>
        <div id="breathWord" class="breath-word">${S.calmDone ? '' : 'In'}</div>
        <div id="breathDots">${dots(S.breaths || 0, 3)}</div>
      </div>`;
    }
    if (t === 'squeeze') {
      return `<div class="balloon-box">
        <button class="squeeze-ball" data-squeeze aria-label="Press and hold to squeeze"><span class="ball-face">${L.face('happy', 90)}</span></button>
        <div id="squeezeDots">${dots(S.squeeze, 3, '#7E64C8')}</div>
      </div>`;
    }
    if (t === 'count') {
      let b = '<div class="count-row">';
      for (let n = 1; n <= 5; n++) b += `<button class="count-btn ${n <= S.countN ? 'on' : ''} ${n === S.countN + 1 ? 'next' : ''}" data-a="countTap" data-n="${n}" aria-label="${n}">${n}</button>`;
      return b + '</div>';
    }
    const colors = ['#EF8A7A', '#F4D35E', '#9CCB7A', '#8EB8E5', '#B9A6E0'];
    return `<div class="count-row">${colors.map((c, i) => `<button class="bell" data-a="bell" data-n="${i}" style="background:${c}" aria-label="Bell ${i + 1}">${ic('music', 40)}</button>`).join('')}</div>`;
  }
  SCREENS.calm = () => {
    const flow = S.mode === 'flow';
    const tools = [['balloon', 'Balloon breathing'], ['squeeze', 'Squeeze'], ['count', 'Count'], ['music', 'Bells']];
    const now = window.LumiAudio ? window.LumiAudio.playing : null;
    const tracks = D.TRACKS.map((t) => `<button class="track ${now === t.id ? 'on' : ''}" data-a="music" data-v="${t.id}" aria-pressed="${now === t.id}" aria-label="${t.name}${now === t.id ? ', playing. Tap to stop' : ''}">
      <span class="track-ic">${ic(t.icon, 26)}</span><span class="track-name">${t.name}</span><span class="track-pp">${ic(now === t.id ? 'pauseFill' : 'playPause', 20)}</span></button>`).join('');
    return `
<section class="screen calm-screen" aria-label="Calm corner">
  ${srTitle('Calm down together')}
  <div class="blob" style="left:-80px;top:120px;width:360px;height:360px;background:#C9B6E4"></div>
  <div class="blob" style="left:40px;top:260px;width:260px;height:260px;background:#9BB7D4"></div>
  <div class="blob" style="right:-60px;top:80px;width:320px;height:320px;background:#B5D8C7"></div>
  <div class="blob" style="right:120px;bottom:120px;width:220px;height:220px;background:#F6D6AD"></div>
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn("Let's calm down together.")}</div>
    ${flow ? stepPills('calm') : '<span></span>'}
  </div>
  <div class="row grow" style="justify-content:center;gap:60px">
    <div class="calm-lumi" style="width:250px;align-self:flex-end;margin-bottom:24px">${L.svg({ look: dayLook(), mood: 'calm', size: 250 })}</div>
    <div class="calm-center">${calmCenter()}</div>
    <div class="music-list" role="group" aria-label="Calming music">
      <div class="music-head">${ic('music', 24)}<span>Music</span>
        <span class="grow"></span><button class="mini-btn" data-a="musicVol" data-v="-0.1" aria-label="Quieter">${ic('minus', 18)}</button><button class="mini-btn" data-a="musicVol" data-v="0.1" aria-label="Louder">${ic('plus', 18)}</button></div>
      ${tracks}
    </div>
  </div>
  <div class="row between" style="height:100px">
    <div class="row gap12">${tools.map(([t, name]) => `<button class="tool ${S.calmTool === t ? 'on' : ''}" data-a="calmTool" data-t="${t}" aria-label="${name}" aria-pressed="${S.calmTool === t}">${ic({ balloon: 'kBalloon', squeeze: 'kSqueeze', count: 'kCount', music: 'kBell' }[t], 58)}</button>`).join('')}</div>
    <button class="primary ${S.calmDone ? '' : 'soft'}" data-a="calmReady" style="height:84px">${ic('smile', 36)}<span>Ready</span></button>
  </div>
</section>`;
  };
  AFTER.calm = () => {
    if (S.calmTool !== 'balloon' || S.calmDone) return;
    let phase = 'in';
    if (S.interacted) later(() => say('Breathe in'), 1200);
    every(() => {
      const word = document.getElementById('breathWord');
      if (!word) return;
      if (phase === 'in') {
        phase = 'out';
        word.textContent = 'Out';
        say('Breathe out');
      } else {
        S.breaths = (S.breaths || 0) + 1;
        document.getElementById('breathDots').innerHTML = dots(S.breaths, 3);
        if (S.breaths >= 3) {
          calmFinished();
        } else {
          phase = 'in';
          word.textContent = 'In';
          say('Breathe in');
        }
      }
    }, 4000);
  };
  function calmFinished() {
    if (S.calmDone) return;
    S.calmDone = true;
    clearTimers();
    const word = document.getElementById('breathWord');
    if (word) word.textContent = '';
    const b = stage.querySelector('.balloon');
    if (b) b.classList.add('still');
    const ready = stage.querySelector('[data-a="calmReady"]');
    if (ready) ready.classList.remove('soft');
    say('Well done. You feel calm. Tap Ready.');
    applyGuide();
  }

  // ---------------------------------------------------------------- End of the day (or part of the day)
  const isEvening = () => !S.day || S.day.part === 'evening' || S.day.part === 'day';
  VOICE.end = () => (isEvening() ? 'The day is done. Well done!' : `Great job this ${S.day.part}! Tap Open.`);
  ENTER.end = () => {
    const d = S.day;
    if (!d || d.ended) return;
    d.ended = true;
    d.stickers.add('plan');
    state.stats.daysDone += 1;
    track('parts', d.part);
    save();
    later(() => award(d.stickers.size), 900);
  };
  SCREENS.end = () => {
    const st = S.day ? S.day.stickers : new Set(['plan']);
    const night = isEvening();
    const sticker = (on, tint, iconHtml, label) => on
      ? `<div class="sticker" role="img" aria-label="${label}, plus 1 star"><span class="sticker-face" style="background:${tint}">${iconHtml}</span><span class="plus1">+1</span></div>` : '';
    const gift = S.gift
      ? `<div class="gift-open" role="img" aria-label="Gift: ${esc(S.gift.name)}">${L.item(S.gift.id, 150)}</div>`
      : `<button class="gift-box wiggle" data-a="openGift" aria-label="Open the gift">${giftSvg()}</button>`;
    const left = night
      ? `<div class="panel bedroom">
          <div class="bed-head"></div><div class="bed-foot"></div><div class="bed-base"></div><div class="pillow"></div>
          <div class="lumi-pos" style="left:150px;top:200px">${L.svg({ look: lookWith({ head: 'none', body: 'none', back: 'none' }), mood: 'sleepy', size: 230 })}</div>
          <div class="blanket"></div>
          <span class="zz" style="left:352px;top:70px;font-size:40px">z</span><span class="zz" style="left:384px;top:36px;font-size:28px">z</span>
        </div>`
      : `<div class="panel bedroom sunny"><div class="floor" style="height:22%"></div><div class="lumi-pos hop" style="left:110px;bottom:60px">${L.svg({ look: dayLook(), mood: 'excited', wave: true, size: 260 })}</div></div>`;
    return `
<section class="screen ${night ? 'night' : 'daytime'}" aria-label="${night ? 'End of the day' : 'Part of the day done'}">
  ${srTitle(night ? 'Day done' : 'Well done')}
  ${night ? '<span class="star-dot" style="left:120px;top:120px"></span><span class="star-dot" style="left:300px;top:70px"></span><span class="star-dot" style="left:760px;top:60px"></span><span class="star-dot" style="left:980px;top:210px"></span><div class="moon"></div>' : '<div class="sun-disc"></div>'}
  <div class="row between" style="height:60px;padding-right:150px">${speakBtn(VOICE.end())}${starChip(false)}</div>
  <div class="row gap40 grow">
    ${left}
    <div class="col grow center gap40">
      <div class="row gap24">
        ${sticker(st.has('plan'), '#E7F3E1', `<span class="ic-green">${ic('calendar', 68)}</span>`, 'Finished the plan')}
        ${sticker(st.has('talk'), '#DCEFED', `<span style="color:var(--teal)">${ic('chat', 64)}</span>`, 'Used the talk board')}
        ${sticker(st.has('calm'), '#F1ECFB', `<span style="color:#7E64C8">${ic('cloud', 68)}</span>`, 'Calmed down')}
      </div>
      ${gift}
    </div>
  </div>
  <div class="row gap24" style="height:110px">
    <button class="night-btn" data-a="goodnight" aria-label="${night ? 'Goodnight, back home' : 'Back home'}">${ic(night ? 'moon' : 'home', 48)}</button>
    ${S.gift
      ? `<button class="gift-btn" data-a="wearGift">${S.gift.slot ? ic('shirt', 44) : ic('house', 44)}<span>${S.gift.slot ? 'Wear' : 'See'}</span></button>`
      : `<button class="gift-btn" data-a="openGift">${ic('gift', 46)}<span>Open</span></button>`}
  </div>
</section>`;
  };
  function giftSvg() {
    return `<svg width="220" height="190" viewBox="0 0 210 180" aria-hidden="true"><rect x="20" y="60" width="170" height="120" rx="16" fill="#E07A5F"/><rect x="6" y="34" width="198" height="40" rx="14" fill="#EF8A7A"/><rect x="92" y="34" width="26" height="146" fill="#F4D35E"/><ellipse cx="82" cy="22" rx="24" ry="20" fill="#F4D35E"/><ellipse cx="128" cy="22" rx="24" ry="20" fill="#F4D35E"/></svg>`;
  }

  // ---------------------------------------------------------------- Room
  VOICE.room = () => (state.roomMoved ? "This is Lumi's room. Move things anywhere you like." : "This is Lumi's room. Drag things to move them anywhere you like. Tap something new to buy it.");
  // soft music-box music plays the whole time the child is in the room (and dressing Lumi up)
  const ROOM_SCREENS = ['room', 'dressup'];
  const roomMusicOn = () => state.settings.roomMusic !== false && state.settings.sounds && !S.mute;
  function roomMusic(on) {
    const M = window.LumiAudio;
    if (!M) return;
    if (on && roomMusicOn() && !M.playing) { M.play('lullaby'); S.roomMusic = true; }
    if (!on && S.roomMusic) { if (M.playing === 'lullaby') M.stop(); S.roomMusic = false; }
  }
  ENTER.room = () => roomMusic(true);
  ENTER.dressup = () => roomMusic(true);
  A.roomMusic = roomMusic;
  A.ROOM_SCREENS = ROOM_SCREENS;
  SCREENS.room = () => {
    const tabs = [['furniture', 'Furniture', 'rSofa'], ['plants', 'Plants', 'rPlant'], ['rugs', 'Rugs', 'rRug'], ['clothes', 'Clothes', 'shirt'], ['pets', 'Pets', 'kPet']];
    const tabHtml = tabs.map(([id, name, inner]) => {
      const svg = ic(inner, 36);
      return id === 'clothes'
        ? `<button class="tab" data-a="nav" data-to="dressup" aria-label="Clothes for Lumi">${svg}</button>`
        : `<button class="tab ${S.roomTab === id ? 'on' : ''}" data-a="roomTab" data-t="${id}" aria-label="${name}" aria-pressed="${S.roomTab === id}">${svg}</button>`;
    }).join('');
    const items = S.roomTab === 'rugs' && A.rugTiles ? A.rugTiles() : D.ROOM.filter((r) => r.tab === S.roomTab).map((r) => itemTile(r, state.owned.includes(r.id), S.roomSel === r.id, 'roomItem')).join('');
    const sel = D.ROOM.find((r) => r.id === S.roomSel);
    const goalPct = Math.min(100, Math.round((state.stats.totalEarned / state.goal.target) * 100));
    return `
<section class="screen" aria-label="Lumi's room">
  ${srTitle("Lumi's room")}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn("This is Lumi's room.")}<button class="icon-btn room-music ${S.roomMusic ? 'on' : ''}" data-a="roomMusicToggle" aria-label="${S.roomMusic ? 'Turn the music off' : 'Turn the music on'}" aria-pressed="${!!S.roomMusic}">${ic(S.roomMusic ? 'music' : 'mute', 30)}</button></div>
    ${starChip(true)}
  </div>
  <div class="row gap24 grow">
    <div class="panel scene room-scene" style="width:690px">
      <div class="floor" style="height:24%"></div>
      ${roomDecor(true)}
      <div class="lumi-pos bob movable room-lumi" data-id="lumi" role="button" tabindex="-1" aria-label="Lumi. Drag to move Lumi." style="${state.roomLumi ? `left:${state.roomLumi.l}%;top:${state.roomLumi.t}%` : 'left:33%;bottom:6%'};z-index:30">${L.svg({ look: lookWith(), mood: 'happy', size: 230 })}</div>
      ${state.roomMoved ? '' : `<span class="room-hint">${ic('hand', 26)}<span>Drag things to move them</span></span>`}
      ${S.roomUndo ? `<button class="room-undo" data-a="roomUndo" aria-label="Undo the last move">${ic('undo', 26)}<span>Undo</span></button>` : ''}
    </div>
    <div class="col grow gap16">
      <div class="row gap12">${tabHtml}</div>
      <div class="item-grid grow">${items}</div>
      ${String(S.roomSel || '').startsWith('rug:') && A.rugBuyBar ? A.rugBuyBar() : sel ? buyBar(sel, 'roomBuy') : `<div class="goal" role="img" aria-label="Goal: ${esc(state.goal.name)}, ${Math.min(state.stats.totalEarned, state.goal.target)} of ${state.goal.target} stars">
        <span class="goal-ic">${L.item('plant', 40)}</span>
        <div class="col grow gap8"><div class="bar-track"><div class="bar-fill" style="width:${goalPct}%"></div></div><span class="small" style="color:#3C6E30">${esc(state.goal.name)} · ${Math.min(state.stats.totalEarned, state.goal.target)} / ${state.goal.target}</span></div>
      </div>`}
    </div>
  </div>
</section>`;
  };

  function itemTile(it, owned, selected, action) {
    const afford = state.stars >= it.price;
    const status = owned ? `<span class="ic-green">${ic('check', 28)}</span>`
      : `<span class="price ${afford ? '' : 'grey'}">${ic(afford ? 'star' : 'starGrey', 20)}${it.price}</span>`;
    return `<button class="item-tile ${owned ? 'owned' : ''} ${selected ? 'sel' : ''} ${!owned && !afford ? 'locked' : ''}" data-a="${action}" data-id="${it.id}" aria-label="${esc(it.name)}${owned ? ', yours' : ', ' + it.price + ' stars'}">
      <span class="item-art">${L.item(it.id, 58)}</span>${status}</button>`;
  }

  function buyBar(it, action) {
    const afford = state.stars >= it.price;
    return `<div class="buy-bar">
      <span class="item-art">${L.item(it.id, 56)}</span>
      <span class="label grow">${esc(it.name)}</span>
      <button class="primary ${afford ? '' : 'faded'}" data-a="${action}" data-id="${it.id}" style="height:72px" aria-label="Buy for ${it.price} stars">${ic('shop', 32)}${ic('star', 28)}<span>${it.price}</span></button>
    </div>`;
  }

  // ---------------------------------------------------------------- Dress up
  // drag anything in the room (and Lumi) to a new place; it stays there, here and on the home screen
  AFTER.room = () => {
    const box = stage.querySelector('.room-scene');
    if (!box || !A.SG) return;
    box.querySelectorAll('.movable').forEach((el) => {
      const id = el.dataset.id;
      const name = id === 'lumi' ? 'Lumi' : (D.ROOM.find((r) => r.id === id) || {}).name || '';
      A.SG.drag(el, box, {
        start: () => { el.classList.add('lifted'); el.style.zIndex = 60; tone(520, 0.08, 0.04); },
        tap: () => { el.classList.remove('lifted'); el.classList.remove('wiggle-once'); void el.offsetWidth; el.classList.add('wiggle-once'); say(id === 'lumi' ? 'Hi! Drag me anywhere.' : `${name}. Drag it anywhere.`); },
        drop: (p, s) => {
          el.classList.remove('lifted');
          const W = box.offsetWidth, H = box.offsetHeight, w = el.offsetWidth, h = el.offsetHeight;
          // a drag moves it by how far the finger went; a tap-to-move puts its middle where the child tapped
          const dragged = s && s.x0 != null;
          let x = dragged ? el.offsetLeft + (p.x - s.x0) : p.x - w / 2;
          let y = dragged ? el.offsetTop + (p.y - s.y0) : p.y - h / 2;
          x = Math.max(-w * 0.15, Math.min(W - w * 0.85, x));
          y = Math.max(0, Math.min(H - h, y));
          const pct = { l: Math.round((x / W) * 1000) / 10, t: Math.round((y / H) * 1000) / 10 };
          const before = id === 'lumi' ? state.roomLumi || null : (state.roomPos || {})[id] || null;
          S.roomUndo = { id, before };
          if (id === 'lumi') state.roomLumi = pct;
          else {
            state.roomPos = state.roomPos || {};
            const top = Math.max(0, ...Object.values(state.roomPos).map((q) => q.z || 0));
            state.roomPos[id] = Object.assign(pct, { z: top + 1 }); // the last thing moved sits in front
          }
          if (!state.roomMoved) { state.roomMoved = true; say('You moved it! Make the room just how you like it.'); }
          tone(660, 0.12, 0.05);
          save();
          render();
          return true;
        }
      });
    });
  };
  VOICE.dressup = () => 'Dress up Lumi! Tap anything to try it.';
  SCREENS.dressup = () => {
    const look = state.look;
    const opt = (slot, val, art, label) => `<button class="opt ${look[slot] === val ? 'on' : ''}" data-a="setLook" data-slot="${slot}" data-v="${val}" aria-label="${esc(label)}" aria-pressed="${look[slot] === val}">${art}</button>`;
    const row = (label, iconHtml, inner) => `<div class="dress-row" role="group" aria-label="${label}"><span class="row-ic" aria-hidden="true">${iconHtml}</span><div class="opts">${inner}</div></div>`;
    const colors = Object.keys(L.COLORS).map((k) => `<button class="swatch ${look.color === k ? 'on' : ''}" data-a="setLook" data-slot="color" data-v="${k}" style="background:${L.COLORS[k].body}" aria-label="${L.COLORS[k].name}" aria-pressed="${look.color === k}"></button>`).join('');
    const patterns = ['none', 'spots', 'stripes'].map((p) => opt('pattern', p, L.item(p, 40), p === 'none' ? 'No pattern' : D.NAMES[p])).join('');
    const slotRow = (slot) => slotOptions(slot).map((v) => opt(slot, v, L.item(v, 42), v === 'none' ? 'Nothing' : itemName(v))).join('');
    const sparks = opt('spark', 'none', L.item('none', 38), 'No spark') + ['star', 'heart', 'flower'].map((s) => opt('spark', s, L.item('spark-' + s, 38), D.NAMES['spark-' + s])).join('');
    const saved = state.savedLooks.map((lk, i) => lk
      ? `<button class="saved-look" data-a="wearLook" data-k="${i}" aria-label="Saved look ${i + 1}">${L.svg({ look: Object.assign({}, lk, { shirt: state.shirt }), size: 60 })}</button>`
      : `<button class="saved-look empty" data-a="saveLook" data-k="${i}" aria-label="Save this look">${ic('plus', 28)}</button>`).join('');
    return `
<section class="screen" aria-label="Dress up Lumi">
  ${srTitle('Dress up Lumi')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn('Dress up Lumi! Tap anything to try it.')}</div>
    ${starChip(true)}
  </div>
  <div class="row gap24 grow">
    <div class="panel dress-stage">
      <div class="row gap12 center">${saved}<button class="saved-look save" data-a="saveLook" data-k="-1" aria-label="Save this look">${ic('heart', 30)}</button></div>
      <div class="lumi-pos-static">${L.svg({ look: lookWith(), mood: 'happy', size: 330 })}</div>
      <div class="row gap12 center">
        <button class="icon-btn lg" data-a="undoLook" aria-label="Undo" style="width:84px">${ic('undo', 34)}</button>
        <button class="primary" data-a="surprise" style="height:72px">${ic('dice', 34)}<span>Surprise</span></button>
      </div>
    </div>
    <div class="col grow gap8">
      ${row('Colour', ic('palette', 30), colors)}
      ${row('Pattern', `<span style="color:var(--muted)">${ic('count', 30)}</span>`, patterns)}
      ${row('Head', L.item('cap', 30), slotRow('head'))}
      ${row('Body', ic('shirt', 30), slotRow('body'))}
      ${row('Back', L.item('backpack', 30), slotRow('back'))}
      ${row('Feet', L.item('boots', 30), slotRow('feet'))}
      ${row('Spark', L.item('spark-star', 30), sparks)}
      <button class="draw-link" data-a="nav" data-to="draw">${ic('pencil', 34)}<span>Draw</span></button>
    </div>
  </div>
</section>`;
  };

  // ---------------------------------------------------------------- Shop
  VOICE.shop = () => "Lumi's shop. Tap something to try it on.";
  SCREENS.shop = () => {
    const sel = D.WARDROBE.find((w) => w.id === S.shopSel);
    const tryLook = sel ? lookWith({ [sel.slot]: sel.id }) : lookWith();
    const owned = sel && state.owned.includes(sel.id);
    const grid = D.WARDROBE.map((w) => itemTile(w, state.owned.includes(w.id), S.shopSel === w.id, 'shopItem')).join('');
    const badges = D.BADGES.map((b) => {
      const done = state.badges.includes(b.id);
      const p = badgeProgress(b);
      return `<div class="badge-card ${done ? 'done' : ''}" role="img" aria-label="${b.name}: ${done ? 'earned' : p + ' of ' + b.target}">
        <div class="row gap12"><span class="badge-ic" style="${done ? 'background:#fff' : ''}">${done ? L.item(b.reward.id, 42) : `<span style="color:${b.color};opacity:.75">${ic(b.icon === 'bus' ? 'busLine' : b.icon, 38)}</span>`}</span><span class="label">${b.name}</span></div>
        ${done ? `<span class="row gap8 small" style="color:#2F5A24">${ic('check', 24)}<span>Yours</span></span>` : dots(p, b.target, b.color, 20)}
      </div>`;
    }).join('');
    let action = `<button class="primary faded" style="height:84px;width:100%" aria-label="Pick something first">${ic('shop', 34)}</button>`;
    if (sel && owned) action = `<button class="primary" data-a="shopWear" data-id="${sel.id}" style="height:84px;width:100%">${ic('shirt', 34)}<span>Wear</span></button>`;
    else if (sel) action = `<button class="primary ${state.stars >= sel.price ? '' : 'faded'}" data-a="shopBuy" data-id="${sel.id}" style="height:84px;width:100%" aria-label="Buy for ${sel.price} stars">${ic('shop', 34)}${ic('star', 28)}<span>${sel.price}</span></button>`;
    return `
<section class="screen" aria-label="Lumi's shop">
  ${srTitle("Lumi's shop")}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn("Lumi's shop. Tap something to try it on.")}</div>
    ${starChip(false)}
  </div>
  <div class="row gap24 grow">
    <div class="panel col center between" style="width:340px;padding:24px">
      <span class="chip-white static">${ic('eye', 22)}<span>${sel ? esc(sel.name) : 'Try on'}</span></span>
      <div class="lumi-pos-static">${L.svg({ look: tryLook, mood: 'excited', size: 270 })}</div>
      ${action}
    </div>
    <div class="item-grid shop-grid grow">${grid}</div>
    <div class="col gap12 earned">
      <div class="row gap12"><span style="color:#C98A1E">${ic('medal', 34)}</span><span class="label">Earned</span></div>
      ${badges}
    </div>
  </div>
</section>`;
  };

  // ---------------------------------------------------------------- Draw your own T-shirt
  const SHIRT_PATH = 'M80 10 L50 20 L10 60 L40 90 L60 75 L60 210 L200 210 L200 75 L220 90 L250 60 L210 20 L180 10 Q130 40 80 10 Z';
  const DRAW_COLORS = ['#2F7E79', '#F2A7BE', '#F4D35E', '#9CCB7A', '#8EB8E5', '#EF8A7A', '#7E64C8', '#3B2F2F'];
  VOICE.draw = () => 'Draw a T-shirt for Lumi. Use your finger.';
  SCREENS.draw = () => {
    const dr = S.draw;
    const tool = (id, html, label) => `<button class="draw-tool ${dr.tool === id ? 'on' : ''}" data-a="drawTool" data-t="${id}" aria-label="${label}" aria-pressed="${dr.tool === id}">${html}</button>`;
    return `
<section class="screen" aria-label="Draw a T-shirt">
  ${srTitle('Draw a T-shirt for Lumi')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${backBtn()}${speakBtn('Draw a T-shirt for Lumi. Use your finger.')}</div>
    <button class="primary" data-a="drawWear" style="height:64px">${ic('shirt', 32)}<span>Wear</span></button>
  </div>
  <div class="row gap24 grow">
    <div class="draw-tools" role="toolbar" aria-label="Drawing tools">
      ${tool('thin', '<span class="brush-dot" style="width:10px;height:10px"></span>', 'Thin brush')}
      ${tool('brush', '<span class="brush-dot" style="width:20px;height:20px"></span>', 'Medium brush')}
      ${tool('thick', '<span class="brush-dot" style="width:32px;height:32px"></span>', 'Thick brush')}
      <span class="tool-sep"></span>
      ${tool('star', ic('star', 34), 'Star stamp')}
      ${tool('heart', ic('kHeart', 34), 'Heart stamp')}
      ${tool('eraser', ic('eraser', 34), 'Eraser')}
      <span class="grow"></span>
      <button class="draw-tool" data-a="drawUndo" aria-label="Undo">${ic('undo', 32)}</button>
      <button class="draw-tool" data-a="drawClear" aria-label="Start again">${ic('trash', 30)}</button>
    </div>
    <div class="panel canvas-wrap grow">
      <div class="canvas-box">
        <canvas id="drawCanvas" width="520" height="440" aria-label="Drawing area shaped like a T-shirt"></canvas>
        <svg class="shirt-outline" width="520" height="440" viewBox="0 0 260 220" aria-hidden="true"><path d="${SHIRT_PATH}" fill="none" stroke="#C9B8A4" stroke-width="3" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <div class="col gap16" style="width:250px">
      <div class="color-grid" role="group" aria-label="Colours">
        ${DRAW_COLORS.map((c) => `<button class="draw-color ${dr.color === c ? 'on' : ''}" data-a="drawColor" data-c="${c}" style="background:${c}" aria-label="Colour ${c}" aria-pressed="${dr.color === c}"></button>`).join('')}
      </div>
      <div class="card col center grow gap8">
        <div id="drawPreview">${L.svg({ look: lookWith({ body: 'shirt' }), size: 190 })}</div>
        <span class="row gap8 small" style="color:var(--muted)">${ic('eye', 22)}</span>
      </div>
    </div>
  </div>
</section>`;
  };
  AFTER.draw = () => {
    const cv = document.getElementById('drawCanvas');
    const ctx = cv.getContext('2d');
    const shirt = new Path2D(SHIRT_PATH);
    const clipped = (fn) => { ctx.save(); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clip(shirt); ctx.setTransform(1, 0, 0, 1, 0, 0); fn(); ctx.restore(); };
    const fillWhite = () => clipped(() => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); });
    S.draw.undo = [];
    S.draw.ctx = ctx;
    S.draw.cv = cv;
    S.draw.fillWhite = fillWhite;
    if (state.shirtFull) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = state.shirtFull;
    } else {
      fillWhite();
    }
    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
    };
    const sizes = { thin: 7, brush: 14, thick: 26, eraser: 30 };
    let drawing = false;
    let last = null;
    const snapshot = () => {
      S.draw.undo.push(ctx.getImageData(0, 0, cv.width, cv.height));
      if (S.draw.undo.length > 15) S.draw.undo.shift();
    };
    const stroke = (a, b) => clipped(() => {
      ctx.strokeStyle = S.draw.tool === 'eraser' ? '#fff' : S.draw.color;
      ctx.lineWidth = sizes[S.draw.tool] || 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    const stamp = (p) => clipped(() => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(2.2, 2.2);
      ctx.translate(-12, -12);
      if (S.draw.tool === 'star') {
        ctx.fillStyle = S.draw.color === '#3B2F2F' ? '#F4B400' : S.draw.color;
        ctx.fill(new Path2D('M12 3 14.6 8.6 20.6 9.2 16 13.2 17.3 19.2 12 16.1 6.7 19.2 8 13.2 3.4 9.2 9.4 8.6Z'));
      } else {
        ctx.fillStyle = S.draw.color;
        ctx.fill(new Path2D('M12 21C4 15 3 8 7.5 6 9.5 5 11 6.5 12 8c1-1.5 2.5-3 4.5-2C21 8 20 15 12 21z'));
      }
      ctx.restore();
    });
    const drew = () => { updateDrawPreview(); if (!S.drew) { S.drew = true; applyGuide(); } };
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      snapshot();
      const p = pos(e);
      if (S.draw.tool === 'star' || S.draw.tool === 'heart') { stamp(p); tone(880, 0.2, 0.06); drew(); return; }
      drawing = true;
      last = p;
      stroke(p, { x: p.x + 0.1, y: p.y + 0.1 });
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = pos(e);
      stroke(last, p);
      last = p;
    });
    const end = () => { if (drawing) { drawing = false; drew(); } };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
  };
  // Lumi's tummy is wide and short, so crop the middle band of the T-shirt drawing to fit it.
  function shirtImage(cv) {
    const crop = document.createElement('canvas');
    crop.width = 520;
    crop.height = 250;
    crop.getContext('2d').drawImage(cv, 0, 120, 520, 250, 0, 0, 520, 250);
    return crop.toDataURL('image/png');
  }
  function updateDrawPreview() {
    const el = document.getElementById('drawPreview');
    if (el && S.draw.cv) el.innerHTML = L.svg({ look: lookWith({ body: 'shirt', shirt: shirtImage(S.draw.cv) }), size: 190 });
  }

  // ---------------------------------------------------------------- Grown-ups: weekly timetable builder
  function selectedEntry() {
    const plan = dayPlan(S.bDay);
    let e = plan.find((x) => x.uid === S.bSel);
    if (!e && plan.length) { e = plan[0]; S.bSel = e.uid; }
    return e || null;
  }
  function photoField(name, photo) {
    return `<div class="photo-row">
      <span class="photo-box">${photo ? `<img src="${photo}" alt="">` : ic('camera', 30)}</span>
      <div class="col gap8 grow">
        <label class="g-btn outline file-btn">${ic('camera', 18)}<span>${photo ? 'Change photo' : 'Add a photo'}</span><input type="file" accept="image/*" data-photo="${name}"></label>
        ${photo ? `<button class="g-link" data-a="bPhotoRemove" data-v="${name}">Remove photo</button>` : '<span class="g-note">A real photo (your bus stop, your school) helps most.</span>'}
      </div>
    </div>`;
  }

  function timelineHtml(plan) {
    let timeline = '';
    D.PARTS.forEach((p) => {
      const items = plan.filter((e) => partOf(e.time) === p.id);
      if (!items.length) return;
      timeline += `<div class="part-head"><span>${p.name}</span><span class="g-note">${items.length} step${items.length > 1 ? 's' : ''}</span></div>`;
      timeline += items.map((e) => {
        const info = stepInfo(e);
        const surprise = e.changes && e.changes.length && e.surprise && e.surprise !== 'never';
        return `<div class="tl-row ${e.uid === S.bSel ? 'sel' : ''}">
          <span class="tl-time">${fmt(e.time)}</span>
          <span class="tl-dot"></span>
          <button class="tl-card" data-a="bSel" data-v="${e.uid}" aria-label="Edit ${esc(info.label)} at ${fmt(e.time)}">
            <span class="lib-ic big" style="background:${info.tint}">${stepArt(info, 26)}</span>
            <span class="grow left">${esc(info.label)}</span>
            ${surprise ? `<span class="tag amber" title="Surprise changes on">${ic('clock', 14)}<span>${esc(e.surprise)}</span></span>` : ''}
            ${e.check && e.check.length ? `<span class="tag green" title="Before-you-go checklist">${ic('check', 14)}<span>${e.check.length}</span></span>` : ''}
            ${e.custom ? '<span class="tag">Mine</span>' : ''}
          </button>
          <button class="mini-btn" data-a="bDel" data-v="${e.uid}" aria-label="Remove ${esc(info.label)}">${ic('x', 18)}</button>
        </div>`;
      }).join('');
    });
    if (!timeline) timeline = `<div class="empty-note">${ic('calendar', 40)}<p>No steps on ${dayName(S.bDay)} yet.</p><p class="g-note">Tap a step on the left to add it, or copy another day.</p></div>`;
    return timeline;
  }

  SCREENS.builder = () => {
    const plan = dayPlan(S.bDay);
    const step = selectedEntry();
    const dayTabs = D.DAYS.map((d) => `<button class="day-tab ${S.bDay === d.id ? 'on' : ''}" data-a="bDay" data-v="${d.id}" aria-pressed="${S.bDay === d.id}">${d.short}<span class="count">${(state.week[d.id] || []).length}</span>${d.id === todayKey() ? '<span class="today-dot" title="Today"></span>' : ''}</button>`).join('');

    const libBuiltIn = Object.keys(D.STEPS).map((id) => {
      const s = D.STEPS[id];
      return `<button class="lib-card" data-a="bAdd" data-id="${id}" aria-label="Add ${esc(s.label)}"><span class="lib-ic" style="background:${s.tint}">${ic(s.icon, 22)}</span><span>${esc(s.label)}</span><span class="lib-plus">${ic('plus', 16)}</span></button>`;
    }).join('');
    const customIds = Object.keys(state.customSteps);
    const libCustom = customIds.map((cid) => {
      const c = state.customSteps[cid];
      return `<button class="lib-card" data-a="bAdd" data-custom="${cid}" aria-label="Add ${esc(c.label)}"><span class="lib-ic" style="background:${c.tint}">${stepArt(c, 22)}</span><span>${esc(c.label)}</span><span class="lib-plus">${ic('plus', 16)}</span></button>`;
    }).join('');

    const timeline = timelineHtml(plan);

    // right panel
    if (S.bTab === 'settings') S.bTab = 'step';
    const tabs = [['step', 'Step'], ['new', 'New step']].map(([id, name]) => `<button class="seg-opt ${S.bTab === id ? 'on' : ''}" data-a="bTab" data-v="${id}" aria-pressed="${S.bTab === id}">${name}</button>`).join('');
    let right = '';
    if (S.bTab === 'step') {
      if (!step) {
        right = '<p class="g-note">Add a step to the day, then tap it here to change its time, name or surprises.</p>';
      } else {
        const info = stepInfo(step);
        const surprise = step.surprise || 'never';
        const changes = step.changes || [];
        const seg = ['never', 'sometimes', 'often'].map((v) => `<button class="seg-opt ${surprise === v ? 'on' : ''}" data-a="bSurprise" data-v="${v}" aria-pressed="${surprise === v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('');
        const chList = Object.keys(D.CHANGES).map((id) => `<button class="check-row" data-a="bChange" data-v="${id}" aria-pressed="${changes.includes(id)}"><span class="box ${changes.includes(id) ? 'on' : ''}">${changes.includes(id) ? ic('check', 14) : ''}</span><span>${esc(D.CHANGES[id].label)}</span></button>`).join('');
        const custom = step.custom ? state.customSteps[step.custom] : null;
        right = `
          <div class="row gap12"><span class="lib-ic big" style="background:${info.tint}">${stepArt(info, 28)}</span><strong class="g-strong">${esc(info.label)}</strong></div>
          <label class="g-field"><span>Time</span><input id="f-time" type="time" data-input="time" value="${esc(step.time)}" step="300"></label>
          <label class="g-field"><span>Name (one word works best)</span><input id="f-label" type="text" data-input="label" value="${esc(step.label || info.label)}" maxlength="20"></label>
          <label class="g-field"><span>What Lumi says</span><input id="f-voice" type="text" data-input="voice" value="${esc(step.voice || '')}" placeholder="${esc(info.voice)}" maxlength="80"></label>
          ${custom ? `<div class="g-field"><span>Picture</span>${photoField('custom', custom.photo)}</div>` : ''}
          <div class="g-field"><span>Before this step: things to do or bring</span>
            <div class="chk-pick">${Object.keys(D.CHECK_ITEMS).map((id) => { const on = (step.check || []).includes(id); return `<button class="chk-opt ${on ? 'on' : ''}" data-a="bCheck" data-v="${id}" aria-pressed="${on}" title="${esc(D.CHECK_ITEMS[id].label)}">${ic(D.CHECK_ITEMS[id].icon, 30)}<span>${esc(D.CHECK_ITEMS[id].label)}</span></button>`; }).join('')}</div>
            ${(step.check || []).filter((id) => id.startsWith('txt:')).map((id) => `<span class="tag">${esc(id.slice(4))}<button class="tag-x" data-a="bCheck" data-v="${esc(id)}" aria-label="Remove ${esc(id.slice(4))}">${ic('x', 12)}</button></span>`).join('')}
            <div class="row gap8"><input id="f-check" class="g-input grow" type="text" data-input="checkTxt" maxlength="24" placeholder="Add your own, e.g. Feed the cat"><button class="g-btn small" data-a="bCheckAdd">${ic('plus', 16)}<span>Add</span></button></div>
          </div>
          <div class="g-field"><span>Surprise changes</span><div class="seg" role="group" aria-label="Surprise changes">${seg}</div></div>
          <div class="g-field"><span>Which changes can happen</span>${chList}</div>
          <div class="row between g-field row-field"><span>Stars for this step</span>
            <div class="row gap8"><button class="mini-btn bordered" data-a="bStars" data-v="-1" aria-label="Fewer stars">${ic('minus', 16)}</button><span class="row gap4 g-strong">${ic('star', 18)}${step.stars || 1}</span><button class="mini-btn bordered" data-a="bStars" data-v="1" aria-label="More stars">${ic('plus', 16)}</button></div>
          </div>
          <div class="row gap8"><button class="g-btn outline grow" data-a="bDup">Duplicate</button><button class="g-btn outline grow danger-text" data-a="bDel" data-v="${step.uid}">Remove</button></div>`;
      }
    } else if (S.bTab === 'new') {
      const n = S.newStep;
      right = `
        <p class="g-note">Make a step for anything in the child's real day: swimming, grandma's house, speech therapy.</p>
        <label class="g-field"><span>Name</span><input id="f-newlabel" type="text" data-input="newLabel" value="${esc(n.label)}" maxlength="20" placeholder="Swimming"></label>
        ${n.error ? `<span class="g-error">${esc(n.error)}</span>` : ''}
        <label class="g-field"><span>What Lumi says (optional)</span><input id="f-newvoice" type="text" data-input="newVoice" value="${esc(n.voice)}" maxlength="80" placeholder="Time to go swimming!"></label>
        <div class="g-field"><span>Picture</span>${photoField('new', n.photo)}</div>
        <div class="g-field"><span>Or pick an icon</span><div class="icon-pick">${D.CUSTOM_ICONS.map((i) => `<button class="pick-ic ${n.icon === i && !n.photo ? 'on' : ''}" data-a="newIcon" data-v="${i}" aria-label="${i}">${ic(i, 22)}</button>`).join('')}</div></div>
        <div class="g-field"><span>Colour</span><div class="row gap8 wrap">${D.CUSTOM_TINTS.map((t) => `<button class="pick-tint ${n.tint === t ? 'on' : ''}" data-a="newTint" data-v="${t}" style="background:${t}" aria-label="Colour ${t}"></button>`).join('')}</div></div>
        <div class="row gap12"><span class="lib-ic big" style="background:${n.tint}">${stepArt(n, 28)}</span><span class="g-strong">${esc(n.label || 'Preview')}</span></div>
        <button class="g-btn" data-a="bCreate">${ic('plus', 18)}<span>Add to ${dayName(S.bDay)}</span></button>`;
    }

    return `
<section class="screen grownup" aria-label="Weekly timetable">
  ${A.gHeader('builder')}
  <div class="row between" style="height:44px">
    <div class="row gap6">${dayTabs}</div>
    <div class="row gap8">
      <button class="g-btn small" data-a="bPreview">${ic('play', 18)}<span>Try as child</span></button>
      <span class="g-note">Copy to</span>
      <button class="g-btn small outline" data-a="bCopy" data-v="weekdays">Weekdays</button>
      <button class="g-btn small outline" data-a="bCopy" data-v="weekend">Weekend</button>
      <button class="g-btn small outline" data-a="bCopy" data-v="all">All</button>
      <button class="g-btn small outline danger-text" data-a="bClear">${S.confirmClear ? 'Tap again to clear' : 'Clear day'}</button>
    </div>
  </div>
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel" style="width:286px">
      <h2 class="g-h">Steps</h2>
      <p class="g-note">Tap to add to ${dayName(S.bDay)}.</p>
      <div class="lib-scroll">
        ${libCustom ? `<div class="g-sub-h">My steps</div><div class="lib-grid">${libCustom}</div>` : ''}
        <div class="g-sub-h">Ready-made</div>
        <div class="lib-grid">${libBuiltIn}</div>
      </div>
      <button class="g-btn outline" data-a="bTab" data-v="new">${ic('plus', 18)}<span>Make a new step</span></button>
    </div>
    <div class="g-panel grow">
      <div class="row between"><h2 class="g-h">${dayName(S.bDay)}</h2><span class="g-note">Steps sort by time</span></div>
      <div class="timeline">${timeline}</div>
    </div>
    <div class="g-panel" style="width:340px;overflow-y:auto">
      <div class="seg" role="group" aria-label="Panel">${tabs}</div>
      ${right}
    </div>
  </div>
</section>`;
  };

  // ================================================================ NAVIGATION
  function screenIsValid(s) {
    if (s === 'routine') return !!(S.day && !S.day.ended);
    if (s === 'end') return !!(S.day && !S.day.ended);
    if (s === 'feelings') return !!(S.day && activeChange());
    return !!SCREENS[s];
  }

  function go(screen, voiceLine, opts) {
    const o = opts || {};
    clearTimers();
    if (S.screen === 'calm' && screen !== 'calm' && window.LumiAudio && window.LumiAudio.playing) window.LumiAudio.stop();
    if (S.roomMusic && !ROOM_SCREENS.includes(screen)) roomMusic(false);
    if (screen !== 'room') S.roomUndo = null;
    if (S.screen === 'pet' && screen !== 'pet') { if (A.petStopLullaby) A.petStopLullaby(); S.care = null; S.petX = null; S.petFromX = null; S.petAnim = null; }
    if (screen === 'menu' || screen === 'setup') S.history = [];
    else if (!o.back && !o.replace && S.screen && S.screen !== screen) {
      S.history.push(S.screen);
      if (S.history.length > 30) S.history.shift();
    }
    S.screen = screen;
    if (ENTER[screen]) ENTER[screen]();
    render();
    const v = voiceLine !== undefined ? voiceLine : VOICE[screen] ? VOICE[screen]() : '';
    if (v && S.interacted) say(v);
  }

  function goBack() {
    let prev = null;
    while (S.history.length) {
      const c = S.history.pop();
      if (c !== S.screen && screenIsValid(c)) { prev = c; break; }
    }
    if (prev === 'talk' || prev === 'calm') S.mode = S.day && activeChange() ? 'flow' : 'free';
    go(prev || PARENT[S.screen] || (S.appMode === 'together' ? 'together' : 'home'), undefined, { back: true });
  }

  // where Back goes when there is no history (feature files add to this)
  const PARENT = Object.assign({ home: 'menu', together: 'menu', menu: 'menu', builder: 'menu' }, PARENT_EARLY);
  Object.assign(GUIDE, GUIDE_EARLY);

  function render() {
    const same = S.lastRendered === S.screen;
    S.lastRendered = S.screen;
    screenEl.innerHTML = SCREENS[S.screen]();
    // redrawing the same screen (e.g. the next stage of a game) should not fade the whole screen in again
    if (same && screenEl.firstElementChild) screenEl.firstElementChild.classList.add('no-fade');
    if (AFTER[S.screen]) AFTER[S.screen]();
    if (A.afterRender) A.afterRender();
    applyGuide();
  }

  // ================================================================ GAME ACTIONS
  function startDay(opts) {
    const o = opts || {};
    // carry on a day that is already going
    if (!o.fresh && S.day && !S.day.ended && !o.day) { go('routine'); return; }
    const dayKey = o.day || todayKey();
    // "Coming up" events for today (comingup.js) join the plan at their time
    const all = sortDay(dayPlan(dayKey).slice().concat(A.comingUpSteps ? A.comingUpSteps(dayKey) : []));
    if (!all.length) {
      go('schedule', 'There is no plan for today yet. Ask a grown-up to make one.');
      return;
    }
    let part = o.part || partOf(fromMin(nowMin()));
    let steps = all.filter((s) => partOf(s.time) === part);
    if (!steps.length) { part = 'day'; steps = all; }
    S.day = { dayKey, part, plan: clone(steps), i: 0, stickers: new Set(), rainLook: false };
    S.gift = null;
    S.mode = 'flow';
    prepareStep();
    go('routine');
  }

  function completeStep() {
    const d = S.day;
    const step = d.plan[d.i];
    d.celebrate = true;
    render();
    award(step.stars || 1);
    track('steps', stepInfo(step).label);
    say(praise());
    later(() => {
      d.i += 1;
      if (d.i >= d.plan.length) { go('end'); return; }
      prepareStep();
      render();
      say(VOICE.routine());
    }, 1500);
  }

  function resetCalm() { S.calmDone = false; S.breaths = 0; S.squeeze = 0; S.countN = 0; S.bells = 0; }

  function noteCalmTool(t) {
    if (!state.stats.calmTried.includes(t)) { state.stats.calmTried.push(t); save(); checkBadges(); }
  }

  function setLook(slot, val) {
    S.dressHist.push(Object.assign({}, state.look));
    if (S.dressHist.length > 30) S.dressHist.shift();
    state.look[slot] = val;
    save();
  }

  function readPhoto(file, done) {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const c = document.createElement('canvas');
        c.width = 240;
        c.height = 240;
        c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 240, 240);
        done(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  function addToDay(stepFields) {
    const plan = dayPlan(S.bDay);
    const sel = plan.find((x) => x.uid === S.bSel);
    const time = sel ? fromMin(toMin(sel.time) + 15) : plan.length ? fromMin(toMin(plan[plan.length - 1].time) + 30) : '07:00';
    const e = entry(Object.assign({ time }, stepFields));
    plan.push(e);
    sortDay(plan);
    S.bSel = e.uid;
    S.bTab = 'step';
    save();
    render();
  }

  const ACTIONS = {
    lumiPlay: () => lumiPlay(),
    say: (d) => say(d.text),
    back: () => goBack(),
    hint: () => {
      if (S.screen === 'feelings') S.feelHint = true;
      if (S.screen === 'feelings') render();
      hintNow();
      return 'keep';
    },

    nav: (d) => {
      if (d.to === 'talk' || d.to === 'calm') S.mode = 'free';
      if (d.to === 'talk') { S.talk = []; S.replyShown = false; S.said = false; }
      if (d.to === 'calm') resetCalm();
      if (d.to === 'shop') S.shopSel = null;
      if (d.to === 'room') S.roomSel = null;
      if (d.to === 'draw') S.drew = false;
      go(d.to);
    },

    startDay: () => startDay(),

    // routine
    railTalk: () => {
      S.mode = activeChange() ? 'flow' : 'free';
      S.talk = [];
      S.replyShown = false;
      S.said = false;
      go('talk');
    },
    railCalm: () => {
      S.mode = activeChange() ? 'flow' : 'free';
      resetCalm();
      go('calm');
    },
    startHelp: () => {
      S.mode = 'flow';
      S.feelPick = null;
      S.feelHint = false;
      go('feelings');
    },

    // feelings
    pickFeeling: (d) => {
      const ch = activeChange();
      const expected = ch ? ch.feeling : null;
      const label = D.FEELINGS[d.k].label;
      if (!expected || d.k === expected) {
        if (!S.feelPick) award(1);
        if (!ch) track('feelings', d.k);
        if (ch && !S.feelPick && !S.feelHint) { state.stats.feelingsNamed += 1; track('correct', 'feelings', { quiet: true }); }
        S.feelPick = d.k;
        render();
        say(ch ? `Yes. Lumi feels ${label.toLowerCase()}. Tap the arrow.` : `You feel ${label.toLowerCase()}.`);
      } else {
        if (!S.feelHint) track('tries', 'feelings', { quiet: true });
        S.feelHint = true;
        render();
        hintNow();
        say(`Hmm. I think Lumi feels ${D.FEELINGS[expected].label.toLowerCase()}. Look at Lumi's eyebrows.`);
        return 'keep';
      }
    },
    feelNext: () => {
      if (!S.feelPick) { say('Tap a face first.'); hintNow(); return 'keep'; }
      S.talk = ['ifeel', S.feelPick];
      S.replyShown = false;
      S.said = false;
      go('talk');
    },

    // before-you-go checklist
    tick: (d) => {
      const c = S.day && S.day.check;
      if (!c) return;
      const k = Number(d.k);
      c.ticked[k] = !c.ticked[k];
      if (c.ticked[k]) {
        tone(660 + k * 90, 0.25, 0.1);
        const left = c.ticked.filter((x) => !x).length;
        say(left ? checkInfo(c.items[k]).label + '. Done!' : 'All ready! Tap Ready.');
      }
      render();
    },
    checkDone: () => {
      const c = S.day && S.day.check;
      if (!c) return;
      if (c.ticked.includes(false)) { say('Tap each one first.'); hintNow(); return 'keep'; }
      c.done = true;
      state.stats.checklists += 1;
      track('checklists', stepInfo(S.day.plan[S.day.i]).label);
      award(1);
      render();
      say(VOICE.routine());
    },

    // menu, modes and first-run setup
    modeSolo: () => { S.appMode = 'solo'; go('home'); },
    modeTogether: () => { S.appMode = 'together'; go('together'); },
    petLocked: () => {
      S.roomTab = 'pets';
      S.roomSel = null;
      say('Get a pet for Lumi in the room first. Then you can look after it!');
      go('room', '');
    },
    setupAge: (d) => {
      // first run: load the whole pack, including its example timetable
      applyAgePack(d.v, { week: true });
      render();
    },
    setupLevel: (d) => { state.profile.level = Number(d.v); save(); applyPrefs(); render(); },
    setupTheme: (d) => { state.profile.theme = d.v; save(); applyPrefs(); render(); },
    setupDone: () => { state.setupDone = true; save(); go('menu'); },

    // calming music
    music: (d) => {
      const A = window.LumiAudio;
      if (!A) return;
      if (A.playing === d.v) { A.stop(); render(); return; }
      A.setVolume(state.settings.musicVolume);
      A.play(d.v).then((ok) => {
        if (!ok && d.v === 'mine') say('Ask a grown-up to add your music first.');
        render();
      });
      render();
    },
    musicVol: (d) => {
      state.settings.musicVolume = Math.max(0.1, Math.min(1, Math.round((state.settings.musicVolume + Number(d.v)) * 10) / 10));
      save();
      if (window.LumiAudio) window.LumiAudio.setVolume(state.settings.musicVolume);
      render();
    },

    // calm
    calmTool: (d) => {
      clearTimers();
      S.calmTool = d.t;
      resetCalm();
      noteCalmTool(d.t);
      render();
      if (d.t === 'balloon') say('Breathe with the balloon.');
      if (d.t === 'squeeze') say('Press and hold the ball. Squeeze!');
      if (d.t === 'count') say("Let's count to five.");
      if (d.t === 'music') say('Tap the bells.');
    },
    countTap: (d) => {
      const n = Number(d.n);
      if (n !== S.countN + 1) return;
      S.countN = n;
      tone(D.CALM_NOTES[n - 1], 0.5, 0.1);
      render();
      say(String(n));
      if (n === 5) calmFinished();
    },
    bell: (d, el) => {
      const n = Number(d.n);
      tone(D.CALM_NOTES[n], 1.2, 0.18);
      el.classList.remove('ring');
      void el.offsetWidth; // restart the animation
      el.classList.add('ring');
      S.bells = (S.bells || 0) + 1;
      if (S.bells >= 8) calmFinished();
    },
    calmReady: () => {
      noteCalmTool(S.calmTool);
      track('calm', S.calmTool);
      if (S.mode === 'flow' && activeChange()) {
        const d = S.day;
        if (d.change === 'rain') d.rainLook = true;
        d.resolved = true;
        d.stickers.add('calm');
        state.stats.changesHandled += 1;
        track('changes', d.change);
        save();
        award(1);
        S.mode = 'flow';
        S.history = S.history.filter((s) => !['feelings', 'talk', 'calm', 'routine'].includes(s));
        go('routine', "Let's go! " + stepInfo(d.plan[d.i]).voice, { replace: true });
      } else {
        goBack();
      }
    },

    // end of day
    openGift: () => {
      if (S.gift) { ACTIONS.wearGift(); return; }
      const pool = D.WARDROBE.filter((w) => w.price <= 7 && !state.owned.includes(w.id))
        .concat(D.ROOM.filter((r) => r.price <= 8 && !state.owned.includes(r.id)));
      if (!pool.length) {
        S.gift = { id: 'spark-star', name: 'Three stars' };
        award(3);
      } else {
        S.gift = pick(pool);
        state.owned.push(S.gift.id);
        save();
      }
      tone(523, 0.3, 0.1); setTimeout(() => tone(659, 0.3, 0.1), 150); setTimeout(() => tone(784, 0.6, 0.1), 300);
      render();
      say(`A present for Lumi! ${S.gift.name}.`);
    },
    wearGift: () => {
      const g = S.gift;
      S.day = null;
      S.history = ['menu', 'home'];
      if (g && g.slot) { setLook(g.slot, g.id); go('dressup'); } else go('room');
    },
    goodnight: () => { S.day = null; S.gift = null; S.history = ['menu']; go('home', 'See you soon!', { replace: true }); },

    // room
    roomTab: (d) => { S.roomTab = d.t; S.roomSel = null; render(); },
    roomItem: (d) => {
      const it = D.ROOM.find((r) => r.id === d.id);
      if (state.owned.includes(it.id)) { S.roomSel = null; render(); say(it.name); return; }
      S.roomSel = it.id;
      render();
      say(state.stars >= it.price ? `${it.name}. ${it.price} stars. Tap to buy it.` : `${it.name}. You need ${it.price - state.stars} more stars.`);
    },
    roomBuy: (d) => {
      const it = D.ROOM.find((r) => r.id === d.id);
      if (state.stars < it.price) { say(`You need ${it.price - state.stars} more stars.`); return; }
      state.stars -= it.price;
      state.owned.push(it.id);
      save();
      S.roomSel = null;
      tone(659, 0.3, 0.1);
      render();
      say(`Lumi loves the ${it.name.toLowerCase()}!`);
    },
    roomMusicToggle: () => {
      if (S.roomMusic) { roomMusic(false); state.settings.roomMusic = false; say('Music off.'); }
      else { state.settings.roomMusic = true; if (window.LumiAudio && window.LumiAudio.playing) window.LumiAudio.stop(); roomMusic(true); say(S.roomMusic ? 'Music on.' : 'Sounds are turned off in Grown-ups.'); }
      save();
      render();
    },
    roomUndo: () => {
      const u = S.roomUndo;
      if (!u) return;
      if (u.id === 'lumi') state.roomLumi = u.before;
      else if (u.before) state.roomPos[u.id] = u.before;
      else delete state.roomPos[u.id];
      S.roomUndo = null;
      save();
      render();
      say('Back where it was.');
    },

    // dress up
    setLook: (d) => {
      setLook(d.slot, d.v);
      render();
      tone(740, 0.15, 0.06);
      const name = d.slot === 'color' ? L.COLORS[d.v].name : d.slot === 'spark' ? D.NAMES['spark-' + d.v] : d.slot === 'pattern' ? (d.v === 'none' ? 'No pattern' : D.NAMES[d.v]) : itemName(d.v);
      say(name);
    },
    undoLook: () => {
      const prev = S.dressHist.pop();
      if (!prev) { say('Nothing to undo.'); return; }
      state.look = prev;
      save();
      render();
    },
    surprise: () => {
      setLook('color', pick(Object.keys(L.COLORS)));
      state.look.pattern = pick(['none', 'spots', 'stripes']);
      ['head', 'body', 'back', 'feet'].forEach((slot) => { state.look[slot] = pick(slotOptions(slot)); });
      state.look.spark = pick(['star', 'heart', 'flower']);
      save();
      render();
      tone(523, 0.2, 0.08); setTimeout(() => tone(784, 0.3, 0.08), 120);
      say('Surprise!');
    },
    saveLook: (d) => {
      const k = Number(d.k);
      const look = Object.assign({}, state.look);
      if (k >= 0) state.savedLooks[k] = look;
      else { state.savedLooks.unshift(look); state.savedLooks = state.savedLooks.slice(0, 3); }
      save();
      render();
      say('Saved!');
    },
    wearLook: (d) => {
      const lk = state.savedLooks[Number(d.k)];
      if (!lk) return;
      S.dressHist.push(Object.assign({}, state.look));
      const look = Object.assign({}, lk);
      ['head', 'body', 'back', 'feet'].forEach((slot) => { if (!slotOptions(slot).includes(look[slot])) look[slot] = 'none'; });
      state.look = look;
      save();
      render();
    },

    // shop
    shopItem: (d) => {
      const it = D.WARDROBE.find((w) => w.id === d.id);
      S.shopSel = it.id;
      render();
      if (state.owned.includes(it.id)) say(`${it.name}. Tap Wear.`);
      else if (state.stars >= it.price) say(`${it.name}. ${it.price} stars. Tap to buy it.`);
      else say(`${it.name}. You need ${it.price - state.stars} more stars.`);
    },
    shopBuy: (d) => {
      const it = D.WARDROBE.find((w) => w.id === d.id);
      if (state.stars < it.price) { say(`You need ${it.price - state.stars} more stars.`); return; }
      state.stars -= it.price;
      state.owned.push(it.id);
      setLook(it.slot, it.id);
      tone(659, 0.3, 0.1);
      render();
      say(`Lumi loves the ${it.name.toLowerCase()}!`);
    },
    shopWear: (d) => {
      const it = D.WARDROBE.find((w) => w.id === d.id);
      setLook(it.slot, it.id);
      go('dressup', it.name);
    },

    // draw (these update the page directly so the drawing is not lost)
    drawTool: (d, el) => {
      S.draw.tool = d.t;
      stage.querySelectorAll('[data-a="drawTool"]').forEach((b) => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', b === el); });
    },
    drawColor: (d, el) => {
      S.draw.color = d.c;
      if (S.draw.tool === 'eraser') {
        S.draw.tool = 'brush';
        stage.querySelectorAll('[data-a="drawTool"]').forEach((b) => b.classList.toggle('on', b.dataset.t === 'brush'));
      }
      stage.querySelectorAll('[data-a="drawColor"]').forEach((b) => { b.classList.toggle('on', b === el); b.setAttribute('aria-pressed', b === el); });
    },
    drawUndo: () => {
      const img = S.draw.undo.pop();
      if (img) { S.draw.ctx.putImageData(img, 0, 0); updateDrawPreview(); }
    },
    drawClear: () => {
      const { ctx, cv } = S.draw;
      S.draw.undo.push(ctx.getImageData(0, 0, cv.width, cv.height));
      ctx.clearRect(0, 0, cv.width, cv.height);
      S.draw.fillWhite();
      updateDrawPreview();
    },
    drawWear: () => {
      state.shirt = shirtImage(S.draw.cv);
      state.shirtFull = S.draw.cv.toDataURL('image/png');
      setLook('body', 'shirt');
      S.history = S.history.filter((s) => s !== 'draw' && s !== 'dressup');
      go('dressup', 'Lumi loves the new T-shirt!', { replace: true });
    },

    // grown-ups: weekly timetable
    bDay: (d) => { S.bDay = d.v; S.bSel = null; S.confirmClear = false; render(); },
    bTab: (d) => { S.bTab = d.v; render(); },
    bSel: (d) => { S.bSel = d.v; S.bTab = 'step'; render(); },
    bAdd: (d) => {
      if (d.custom) addToDay({ custom: d.custom });
      else addToDay({ id: d.id });
    },
    bDel: (d) => {
      const plan = dayPlan(S.bDay);
      const i = plan.findIndex((x) => x.uid === d.v);
      if (i < 0) return;
      plan.splice(i, 1);
      S.bSel = plan[Math.min(i, plan.length - 1)] ? plan[Math.min(i, plan.length - 1)].uid : null;
      save();
      render();
    },
    bDup: () => {
      const e = selectedEntry();
      if (!e) return;
      const copy = Object.assign(clone(e), { uid: uid(), time: fromMin(toMin(e.time) + 15) });
      dayPlan(S.bDay).push(copy);
      sortDay(state.week[S.bDay]);
      S.bSel = copy.uid;
      save();
      render();
    },
    bSurprise: (d) => {
      const st = selectedEntry();
      if (!st) return;
      st.surprise = d.v;
      if (d.v !== 'never' && (!st.changes || !st.changes.length)) st.changes = ['late'];
      save();
      render();
    },
    bChange: (d) => {
      const st = selectedEntry();
      if (!st) return;
      st.changes = st.changes || [];
      const i = st.changes.indexOf(d.v);
      if (i >= 0) st.changes.splice(i, 1); else st.changes.push(d.v);
      if (st.changes.length && (!st.surprise || st.surprise === 'never')) st.surprise = 'sometimes';
      save();
      render();
    },
    bCheck: (d) => {
      const st = selectedEntry();
      if (!st) return;
      st.check = st.check || [];
      const i = st.check.indexOf(d.v);
      if (i >= 0) st.check.splice(i, 1); else st.check.push(d.v);
      save();
      render();
    },
    bCheckAdd: () => {
      const st = selectedEntry();
      const txt = (S.checkTxt || '').trim();
      if (!st || !txt) { const f = document.getElementById('f-check'); if (f) f.focus(); return; }
      st.check = st.check || [];
      st.check.push('txt:' + txt);
      S.checkTxt = '';
      save();
      render();
    },
    bStars: (d) => {
      const st = selectedEntry();
      if (!st) return;
      st.stars = Math.max(1, Math.min(3, (st.stars || 1) + Number(d.v)));
      save();
      render();
    },
    bCopy: (d) => {
      const src = dayPlan(S.bDay);
      const targets = D.DAYS.map((x) => x.id).filter((id, i) => id !== S.bDay && (d.v === 'all' || (d.v === 'weekdays' ? i < 5 : i >= 5)));
      targets.forEach((id) => { state.week[id] = src.map((e) => Object.assign(clone(e), { uid: uid() })); });
      save();
      render();
      showToast(`<span>Copied to ${d.v === 'all' ? 'every day' : d.v}</span>`, 'toast-g');
    },
    bClear: () => {
      if (!S.confirmClear) { S.confirmClear = true; render(); later(() => { S.confirmClear = false; if (S.screen === 'builder') render(); }, 4000); return; }
      state.week[S.bDay] = [];
      S.confirmClear = false;
      S.bSel = null;
      save();
      render();
    },
    bPreview: () => {
      const e = selectedEntry();
      startDay({ fresh: true, day: S.bDay, part: e ? partOf(e.time) : undefined });
    },
    newIcon: (d) => { S.newStep.icon = d.v; S.newStep.photo = null; render(); },
    newTint: (d) => { S.newStep.tint = d.v; render(); },
    bPhotoRemove: (d) => {
      if (d.v === 'new') S.newStep.photo = null;
      else { const e = selectedEntry(); if (e && e.custom) state.customSteps[e.custom].photo = null; save(); }
      render();
    },
    bCreate: () => {
      const n = S.newStep;
      if (!n.label.trim()) { n.error = 'Give the step a name first.'; render(); const f = document.getElementById('f-newlabel'); if (f) f.focus(); return; }
      const cid = 'c' + uid();
      state.customSteps[cid] = { label: n.label.trim(), voice: n.voice.trim() || n.label.trim(), icon: n.icon, tint: n.tint, photo: n.photo };
      S.newStep = { label: '', voice: '', icon: 'star', tint: '#FFF1C2', photo: null, error: '' };
      addToDay({ custom: cid });
    },
    bGoal: (d) => {
      state.goal.target = Math.max(5, Math.min(200, state.goal.target + Number(d.v)));
      save();
      render();
    },
    bDelay: (d) => { state.settings.guideDelay = Number(d.v); save(); render(); },
    bToggle: (d) => {
      state.settings[d.v] = !state.settings[d.v];
      save();
      if (['reduceMotion', 'highContrast', 'tapMove'].includes(d.v)) applyPrefs();
      render();
    },
    bReset: () => {
      if (!S.confirmReset) { S.confirmReset = true; render(); later(() => { S.confirmReset = false; if (S.screen === 'builder') render(); }, 4000); return; }
      const fresh = defaults();
      Object.keys(fresh).forEach((k) => { state[k] = fresh[k]; });
      S.confirmReset = false;
      S.dressHist = [];
      S.day = null;
      save();
      render();
    }
  };

  // ================================================================ GENTLE REMINDERS
  // A small banner slides in at the top (next step soon, a break, a drink of water). It never blocks play.
  const remEl = document.createElement('div');
  remEl.id = 'reminder';
  remEl.hidden = true;
  remEl.setAttribute('role', 'status');
  stage.appendChild(remEl);
  let remTimer = null;
  function hideReminder() { remEl.hidden = true; }
  function showReminder(art, text, voice) {
    remEl.innerHTML = `<span class="rem-art">${art}</span><span class="rem-text">${esc(text)}</span>
      <button class="rem-btn" data-rem="say" aria-label="Hear it">${ic('speaker', 22)}</button>
      <button class="rem-btn" data-rem="close" aria-label="Close">${ic('x', 20)}</button>`;
    remEl.dataset.voice = voice || text;
    remEl.hidden = false;
    remEl.classList.remove('rem-in');
    void remEl.offsetWidth;
    remEl.classList.add('rem-in');
    tone(988, 0.35, 0.05);
    if (S.interacted && !(window.speechSynthesis && window.speechSynthesis.speaking)) say(voice || text);
    clearTimeout(remTimer);
    remTimer = setTimeout(hideReminder, 9000);
  }
  remEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const b = e.target.closest('[data-rem]');
    if (!b) return;
    if (b.dataset.rem === 'say') say(remEl.dataset.voice);
    else hideReminder();
  });
  const emojiArt = (e) => `<span class="emoji" style="font-size:34px">${e}</span>`;
  function checkReminders() {
    const quietScreens = ['setup', 'builder', 'calm', 'menu'];
    if (!state.setupDone || quietScreens.includes(S.screen) || /^cg/.test(S.screen)) return;
    // never in the middle of a story or lesson step, or a game: it waits, and shows once that step is done
    if ((S.screen === 'story' && S.sx && !S.sx.ended && !S.sx.done) || /^(g-|tg-|lesson$)/.test(S.screen) || S.picked) return;
    const r = state.reminders;
    const now = Date.now();
    if (r.next) {
      const n = nowMin();
      const up = dayPlan(todayKey()).find((x) => { const m = toMin(x.time) - n; return m > 0 && m <= 10; });
      if (up) {
        const key = dateKey() + up.uid;
        if (!S.reminded[key]) {
          S.reminded[key] = 1;
          const info = stepInfo(up);
          showReminder(stepArt(info, 40), `Soon: ${info.label} at ${fmt(up.time)}`, `Soon it is time for ${info.label.toLowerCase()}, at ${fmt(up.time)}.`);
          return;
        }
      }
    }
    if (r.breakMin && now - S.lastBreak > r.breakMin * 60000) {
      S.lastBreak = now;
      showReminder(`<span style="color:var(--teal)">${ic('stretch', 38)}</span>`, 'Time for a little break. Stretch with Lumi!', 'Time for a little break. Stretch up high with Lumi!');
      return;
    }
    for (const it of r.list || []) {
      if (it.every) {
        const k = 'every-' + it.id;
        if (!S.reminded[k]) S.reminded[k] = now;
        if (now - S.reminded[k] >= it.every * 60000) { S.reminded[k] = now; showReminder(emojiArt(it.e), it.text); return; }
      } else if (it.at) {
        const k = dateKey() + '-at-' + it.id;
        const m = toMin(it.at);
        const n = nowMin();
        if (n >= m && n < m + 5 && !S.reminded[k]) { S.reminded[k] = 1; showReminder(emojiArt(it.e), it.text); return; }
      }
    }
  }

  // ================================================================ SHARED API for the feature files
  Object.assign(A, {
    D, L, stage, state, S, SCREENS, AFTER, ENTER, VOICE, ACTIONS, GUIDE, PARENT,
    ic, pick, esc, clone, uid, toMin, fromMin, fmt, nowMin, todayKey, dayName, dateKey, partOf, longDate, tileHtml, pickVoice,
    save, useSave, saveKeyFor, PROFILE_KEY, say, tts, tone, chime, later, every, clearTimers, award, showToast, track, level, applyPrefs,
    lookWith, dayLook, itemName, stepInfo, stepArt, checkInfo, checkArt, dayPlan, ownedPets,
    speakBtn, starChip, homeBtn, backBtn, srTitle, dots, stepPills, activeChange, resetCalm, calmFinished,
    go, goBack, render, applyGuide, hintNow, hideHand, readPhoto, showReminder, defaults, emojiArt,
    checkBadges, startDay, setLook, noteCalmTool, roomDecor, completeStep, checklistPending,
    praise, tutOn, voicePreset, applyAgePack, agePack, storiesForAge, scheduleNow,
    // feature files may set: gHeader, onInput, onPhoto, onFile, onChange
    start() {
      applyPrefs();
      go(!state.setupDone ? 'setup' : A.startScreen ? A.startScreen() : 'menu');
      setInterval(checkReminders, 30000);
      window.LumiDebug = { state, S, go, render, A, checkReminders }; // handy for testing in the browser console
    }
  });

  // ================================================================ EVENTS
  stage.addEventListener('click', (e) => {
    S.interacted = true;
    const holdEl = e.target.closest('[data-hold]');
    if (holdEl && e.detail === 0) { go(holdEl.dataset.hold); return; } // keyboard users can open it directly
    const el = e.target.closest('[data-a]');
    if (!el || !stage.contains(el) || el.disabled) { applyGuide(); return; }
    const fn = ACTIONS[el.dataset.a];
    const result = fn ? fn(el.dataset, el, e) : null;
    // 'keep' means the action has just shown the hint hand, so leave it on screen
    if (S.screen !== 'draw' && result !== 'keep') applyGuide();
  });

  // Text fields and photos in the timetable builder.
  stage.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (!el) return;
    const v = el.value;
    const step = selectedEntry();
    const key = el.dataset.input;
    if (key === 'label' && step) { const base = stepInfo(Object.assign({}, step, { label: '' })).label; if (v.trim() && v.trim() !== base) step.label = v.trim(); else delete step.label; }
    if (key === 'voice' && step) { if (v.trim()) step.voice = v.trim(); else delete step.voice; }
    if (key === 'time' && step && /^\d{2}:\d{2}/.test(v)) {
      step.time = v.slice(0, 5);
      const t = stage.querySelector('.tl-row.sel .tl-time');
      if (t) t.textContent = fmt(step.time);
    }
    if (key === 'label' && step) {
      const t = stage.querySelector('.tl-row.sel .tl-card .grow');
      if (t) t.textContent = stepInfo(step).label;
    }
    if (key === 'childName') state.childName = v.trim();
    if (key === 'goalName') state.goal.name = v.trim() || 'My goal';
    if (key === 'newLabel') { S.newStep.label = v; if (v.trim()) S.newStep.error = ''; }
    if (key === 'newVoice') S.newStep.voice = v;
    if (key === 'checkTxt') S.checkTxt = v;
    if (A.onInput) A.onInput(key, v, el);
    save();
  });
  stage.addEventListener('change', (e) => {
    const photo = e.target.closest('[data-photo]');
    if (photo && photo.files && photo.files[0]) {
      readPhoto(photo.files[0], (url) => {
        const name = photo.dataset.photo;
        if (name === 'new') S.newStep.photo = url;
        else if (name === 'custom') { const st = selectedEntry(); if (st && st.custom) state.customSteps[st.custom].photo = url; save(); }
        else if (A.onPhoto) { A.onPhoto(name, url, photo); return; }
        render();
      });
      return;
    }
    const file = e.target.closest('[data-file]');
    if (file && file.files && file.files[0] && A.onFile) { A.onFile(file.dataset.file, file.files[0], file); return; }
    const ch = e.target.closest('[data-change]');
    if (ch && A.onChange) A.onChange(ch.dataset.change, ch.value, ch);
  });
  // When a grown-up leaves the time box, re-sort the day. Text boxes update in place, so a tap on
  // another button straight after typing is never lost to a re-draw.
  let pointerDown = false;
  let pendingSort = false;
  const resort = () => {
    pendingSort = false;
    if (S.screen !== 'builder') return;
    sortDay(state.week[S.bDay]);
    save();
    const tl = stage.querySelector('.timeline');
    if (tl) tl.innerHTML = timelineHtml(state.week[S.bDay]);
  };
  stage.addEventListener('focusout', (e) => {
    const el = e.target.closest('[data-input="time"]');
    if (!el) return;
    if (pointerDown) pendingSort = true; else resort();
  });
  window.addEventListener('pointerup', () => { pointerDown = false; if (pendingSort) setTimeout(resort, 0); }, true);

  // Press-and-hold: the grown-up lock and the squeeze ball.
  let holdTimer = null;
  let squeezeStart = 0;
  stage.addEventListener('pointerdown', (e) => {
    S.interacted = true;
    pointerDown = true;
    hideHand();
    clearTimeout(guideTimer);
    const hold = e.target.closest('[data-hold]');
    if (hold) {
      hold.classList.add('holding');
      holdTimer = setTimeout(() => { hold.classList.remove('holding'); go(hold.dataset.hold); }, 1200);
    }
    const ball = e.target.closest('[data-squeeze]');
    if (ball) {
      ball.classList.add('squeezing');
      squeezeStart = Date.now();
      tone(330, 0.6, 0.06);
    }
  });
  const endPress = () => {
    clearTimeout(holdTimer);
    stage.querySelectorAll('.holding').forEach((x) => x.classList.remove('holding'));
    const ball = stage.querySelector('.squeezing');
    if (ball) {
      ball.classList.remove('squeezing');
      if (Date.now() - squeezeStart > 600 && S.squeeze < 3) {
        S.squeeze += 1;
        const dd = document.getElementById('squeezeDots');
        if (dd) dd.innerHTML = dots(S.squeeze, 3, '#7E64C8');
        say(S.squeeze < 3 ? 'And let go.' : 'Well done.');
        if (S.squeeze >= 3) calmFinished();
      }
    }
  };
  stage.addEventListener('pointerup', endPress);
  stage.addEventListener('pointercancel', endPress);
  stage.addEventListener('pointerleave', endPress);
  stage.addEventListener('contextmenu', (e) => e.preventDefault());

  // ================================================================ FILL THE SCREEN, WHATEVER THE DEVICE
  // Lumi is designed on a 1194 x 834 landscape stage. The stage keeps that height (or width) and grows in the
  // other direction to match the screen's shape exactly, so every screen fills a phone, an iPad, a laptop or a
  // big monitor edge to edge with no bars: the flexible layouts stretch, and the fixed pictures (story scenes,
  // games) stay centred. The notch and home bar are kept clear, and a phone or tablet held upright shows
  // "Turn me sideways".
  const root = document.documentElement;
  const vp = document.getElementById('viewport');
  const turnEl = document.createElement('div');
  turnEl.id = 'turnPhone';
  turnEl.setAttribute('role', 'alert');
  turnEl.innerHTML = `<div class="tp-pic" aria-hidden="true">
      <svg viewBox="0 0 120 120" width="150" height="150"><g class="tp-phone"><rect x="38" y="16" width="44" height="88" rx="10" fill="#fff" stroke="#3B2F2F" stroke-width="5"/><circle cx="60" cy="92" r="4" fill="#3B2F2F"/><circle cx="60" cy="52" r="15" fill="#F2A65A"/><circle cx="54" cy="50" r="2.6" fill="#3B2F2F"/><circle cx="66" cy="50" r="2.6" fill="#3B2F2F"/><path d="M54 57 q6 5 12 0" fill="none" stroke="#3B2F2F" stroke-width="2.6" stroke-linecap="round"/></g>
      <path d="M100 34 a44 44 0 0 1 2 46" fill="none" stroke="#2F7E79" stroke-width="6" stroke-linecap="round"/><path d="M94 74 l8 8 l6 -10" fill="none" stroke="#2F7E79" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <b class="tp-word">Turn me sideways</b>`;
  document.body.appendChild(turnEl);
  function sideColour() {
    let c = '';
    const first = document.getElementById('screen').firstElementChild;
    for (const el of [first, stage]) {
      if (!el) continue;
      const b = getComputedStyle(el).backgroundColor;
      if (b && b !== 'transparent' && !/rgba\(\d+, \d+, \d+, 0\)/.test(b)) { c = b; break; }
    }
    document.body.style.background = c;
  }
  const BASE_W = 1194, BASE_H = 834, MIN_ASPECT = 1.2, MAX_ASPECT = 2.4;
  let lastSize = '';
  function fit() {
    const W0 = window.innerWidth, H0 = window.innerHeight;
    const phone = Math.min(W0, H0) < 600 && Math.max(W0, H0) < 1100;
    const touch = navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    root.classList.toggle('is-phone', phone);
    root.classList.toggle('turn-me', H0 > W0 && (phone || touch));
    const cs = getComputedStyle(vp);
    const W = Math.max(1, vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    const H = Math.max(1, vp.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom));
    // the stage takes the screen's shape (within sensible limits: a very tall or very wide window gets thin edges)
    const a = Math.max(MIN_ASPECT, Math.min(MAX_ASPECT, W / H));
    const sw = a >= BASE_W / BASE_H ? Math.round(BASE_H * a) : BASE_W;
    const sh = a >= BASE_W / BASE_H ? BASE_H : Math.round(BASE_W / a);
    const s = Math.min(W / sw, H / sh);
    stage.style.width = sw + 'px';
    stage.style.height = sh + 'px';
    stage.style.transform = `scale(${s})`;
    root.style.setProperty('--stage-w', sw + 'px');
    root.style.setProperty('--stage-h', sh + 'px');
    A.stageW = sw;
    A.stageH = sh;
    sideColour();
    const size = sw + 'x' + sh;
    if (lastSize && size !== lastSize && A.onStageResize) A.onStageResize();
    lastSize = size;
  }
  // how much the stage is scaled on screen (screen pixels per stage pixel)
  A.stageScale = () => stage.getBoundingClientRect().width / (stage.offsetWidth || 1);
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 120));
  new MutationObserver(() => requestAnimationFrame(sideColour))
    .observe(document.getElementById('screen'), { childList: true });
  fit();

  // The app starts from js/main.js, after all the feature files have added their screens.
})();
