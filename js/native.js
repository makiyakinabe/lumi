/*
  native.js
  Only for the Lumi app from the App Store / Google Play (made with Capacitor, see ../app/STORE-GUIDE.md).
  In a web browser it does nothing: it only adds a few "not available here" helpers for the Grown-ups screens.

  Inside the app it:
  - gives Lumi a voice on Android: Android's built-in web view has no speech (speechSynthesis), so Lumi's
    speaking is passed to the tablet's own text-to-speech (the same voices as Settings > Text-to-speech)
  - turns off the website's offline helper (sw.js): the app already has every file inside it
  - hides the splash screen when Lumi is ready, and hides the status bar (and Android's navigation bar)
  - Android back button = Lumi's own Back. On the first screen it asks before closing Lumi
  - reminders while Lumi is closed: when Lumi goes into the background it schedules gentle notifications for
    the coming timetable steps (5 minutes before, like the "Soon:" banner) and the grown-ups' reminders, for the
    next 24 hours ("every N minutes" reminders only for the first 3 hours). When Lumi opens again they are
    cancelled (Lumi shows its own banners). Only after a grown-up turns them on in Grown-ups
    (A.nativeAskNotifications), which is when the tablet asks for permission.
  - a light tap (haptics) when the child finishes something, if "Sounds and chimes" is on
  - keeps the screen awake on the timetable, Now & Next, calm corner and waiting screens

  Load it FIRST, before the other scripts (so the Android voice is ready before app.js starts):
    <script src="js/native.js"></script>   <- just above <script src="js/icons.js"></script>
  (It also works further down, e.g. just before main.js, but then the Android voice is set up a little late.)
  Plugins are reached through window.Capacitor (no build step, no imports). Nothing here sends data anywhere.

  For Grown-ups (all safe to call in a browser too):
    A.isNative                     true inside the app
    A.nativePlatform               'ios', 'android' or 'web'
    A.nativeNotifyHtml()           ready-made Grown-ups block (switch + test button + note); '' in a browser
    A.nativeAskNotifications()     asks the tablet for permission and turns reminders on -> 'granted' | 'denied' | 'unavailable'
    A.nativeSetNotifications(on)   on: same as above; off: turns them off and cancels any waiting -> Promise
    A.nativeNotifyStatus()         -> Promise<{ available, permission, on }>
    A.nativeTestNotification()     sends one test notification in 5 seconds -> Promise<boolean>
    A.nativeNotifyPreview()        the notifications Lumi would schedule right now [{ at: Date, title, body }]
*/
(function () {
  'use strict';
  const C = window.Capacitor;
  const native = !!(C && typeof C.isNativePlatform === 'function' && C.isNativePlatform());
  const platform = native && typeof C.getPlatform === 'function' ? C.getPlatform() : 'web';
  const ANDROID = platform === 'android';
  const quiet = (p) => { if (p && typeof p.catch === 'function') p.catch(() => {}); return p; };

  // ---------------------------------------------------------------- reaching the plugins without a bundler
  function call(plugin, method, opts) {
    try {
      const p = C.Plugins && C.Plugins[plugin];
      if (p && typeof p[method] === 'function') return Promise.resolve(p[method](opts || {}));
      if (typeof C.nativePromise === 'function') return C.nativePromise(plugin, method, opts || {});
    } catch (e) { return Promise.reject(e); }
    return Promise.reject(new Error(plugin + ' is not available'));
  }
  function listen(plugin, event, fn) {
    try {
      const p = C.Plugins && C.Plugins[plugin];
      if (p && typeof p.addListener === 'function') return quiet(p.addListener(event, fn));
      if (typeof C.addListener === 'function') return C.addListener(plugin, event, fn);
    } catch (e) { /* plugin missing: that feature is simply off */ }
    return null;
  }

  // full screen: hide the status bar (and on Android the navigation bar; a swipe brings them back for a moment)
  function hideBars() {
    call('SystemBars', 'hide').catch(() => quiet(call('StatusBar', 'hide')));
  }

  if (native) {
    // ---------------------------------------------------------------- 1. no service worker in the app
    try {
      const sw = navigator.serviceWorker;
      if (sw) {
        Object.defineProperty(sw, 'register', { configurable: true, value: () => Promise.reject(new Error('Not needed inside the Lumi app')) });
        quiet(sw.getRegistrations().then((rs) => rs.forEach((r) => quiet(r.unregister()))));
      }
      if (window.caches) quiet(caches.keys().then((ks) => ks.filter((k) => /^lumi-/.test(k)).forEach((k) => quiet(caches.delete(k)))));
    } catch (e) { /* nothing to undo */ }

    // ---------------------------------------------------------------- 2. full screen
    hideBars();

    // ---------------------------------------------------------------- 3. a voice for Lumi on Android
    if (!window.speechSynthesis) installSpeech();
  }

  // A small stand-in for the browser's speechSynthesis / SpeechSynthesisUtterance, spoken by the
  // @capacitor-community/text-to-speech plugin. It keeps the browser's behaviour that Lumi relies on:
  // utterances queue one after another, cancel() stops everything, getVoices() lists the tablet's voices.
  function installSpeech() {
    function Utterance(text) {
      this.text = text == null ? '' : String(text);
      this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1;
      this.onstart = null; this.onend = null; this.onerror = null; this.onboundary = null;
      this._l = {};
    }
    Utterance.prototype.addEventListener = function (t, fn) { (this._l[t] = this._l[t] || []).push(fn); };
    Utterance.prototype.removeEventListener = function (t, fn) { this._l[t] = (this._l[t] || []).filter((f) => f !== fn); };
    const fire = (u, type, extra) => {
      const ev = Object.assign({ type, utterance: u, target: u, charIndex: 0, elapsedTime: 0 }, extra || {});
      try { if (typeof u['on' + type] === 'function') u['on' + type](ev); } catch (e) { /* the page's handler failed */ }
      ((u._l && u._l[type]) || []).forEach((fn) => { try { fn(ev); } catch (e) { /* ignore */ } });
    };

    let voices = [];
    const vl = {};
    const queue = [];
    let current = null;
    let gen = 0;
    const synth = {
      onvoiceschanged: null,
      get speaking() { return !!current; },
      get pending() { return queue.length > 0; },
      get paused() { return false; },
      getVoices: () => voices.slice(),
      speak(u) { if (!u) return; queue.push(u); if (!current) next(); },
      cancel() {
        gen++;
        const dropped = queue.splice(0);
        const was = current;
        current = null;
        quiet(call('TextToSpeech', 'stop'));
        if (was) fire(was, 'error', { error: 'interrupted' });
        dropped.forEach((u) => fire(u, 'error', { error: 'canceled' }));
      },
      pause() {}, resume() {},
      addEventListener(t, fn) { (vl[t] = vl[t] || []).push(fn); },
      removeEventListener(t, fn) { vl[t] = (vl[t] || []).filter((f) => f !== fn); }
    };
    function next() {
      const u = queue.shift();
      if (!u) { current = null; return; }
      current = u;
      const my = gen;
      const vi = u.voice ? voices.indexOf(u.voice) : -1;
      const opts = {
        text: u.text,
        lang: u.lang || (u.voice && u.voice.lang) || 'en-US',
        rate: Math.max(0.1, Math.min(4, Number(u.rate) || 1)),
        pitch: Math.max(0.5, Math.min(2, Number(u.pitch) || 1)),
        volume: Math.max(0, Math.min(1, u.volume == null ? 1 : Number(u.volume))),
        queueStrategy: 0
      };
      if (vi >= 0) opts.voice = vi;
      fire(u, 'start');
      call('TextToSpeech', 'speak', opts).then(
        () => { if (my !== gen) return; current = null; fire(u, 'end'); next(); },
        (e) => { if (my !== gen) return; current = null; fire(u, 'error', { error: (e && e.message) || 'synthesis-failed' }); next(); }
      );
    }
    try {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, writable: true, value: synth });
      if (typeof window.SpeechSynthesisUtterance !== 'function') {
        Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, writable: true, value: Utterance });
      }
    } catch (e) { return; }
    // the tablet's voices (Settings > Text-to-speech); Lumi picks an English one, as in the browser
    call('TextToSpeech', 'getSupportedVoices').then((r) => {
      voices = ((r && r.voices) || []).map((v, i) => ({
        name: v.name || 'Voice ' + (i + 1), lang: String(v.lang || '').replace('_', '-'),
        voiceURI: v.voiceURI || v.name || String(i), default: !!v.default, localService: v.localService !== false
      }));
      const ev = { type: 'voiceschanged', target: synth };
      try { if (typeof synth.onvoiceschanged === 'function') synth.onvoiceschanged(ev); } catch (e) { /* ignore */ }
      (vl.voiceschanged || []).forEach((fn) => { try { fn(ev); } catch (e) { /* ignore */ } });
    }).catch(() => {});
  }

  // ---------------------------------------------------------------- the rest needs Lumi itself (window.LumiApp)
  function setup(A) {
    if (A.__native) return;
    A.__native = true;
    A.isNative = native;
    A.nativePlatform = platform;
    A.nativeNotifyHtml = () => '';
    A.nativeAskNotifications = () => Promise.resolve('unavailable');
    A.nativeSetNotifications = () => Promise.resolve('unavailable');
    A.nativeNotifyStatus = () => Promise.resolve({ available: false, permission: 'unavailable', on: false });
    A.nativeTestNotification = () => Promise.resolve(false);
    A.nativeNotifyPreview = () => [];
    if (!native) return;

    // keep the screen on where the child watches a timer or follows steps (applied after each screen is drawn)
    const AWAKE = ['routine', 'nownext', 'calm', 'g-wait'];
    let awake = null;
    function applyAwake() {
      const want = !!(A.S && AWAKE.includes(A.S.screen));
      if (want === awake) return;
      awake = want;
      quiet(call('KeepAwake', want ? 'keepAwake' : 'allowSleep'));
    }

    // ---------------------------------------------------------------- 4. Android back button
    let confirmEl = null;
    function closeConfirm() { if (confirmEl) { confirmEl.remove(); confirmEl = null; } }
    function openConfirm() {
      if (confirmEl) return;
      const el = document.createElement('div');
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Close Lumi?');
      el.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(59,47,47,.45);font-family:Nunito,system-ui,sans-serif';
      el.innerHTML = `<div style="background:#FFF8EE;color:#3B2F2F;border-radius:28px;padding:clamp(20px,4vmin,36px);width:min(440px,86vw);text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.25)">
          <div style="font-size:clamp(22px,4.2vmin,32px);font-weight:800;margin-bottom:6px">Close Lumi?</div>
          <div style="font-size:clamp(15px,2.6vmin,19px);font-weight:700;color:#7A6B60;margin-bottom:22px">Lumi will be here when you come back.</div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <button data-n="stay" style="font:inherit;font-weight:800;font-size:clamp(18px,3.2vmin,24px);min-width:150px;min-height:64px;border:0;border-radius:20px;background:#2F7E79;color:#fff;padding:0 26px">Stay</button>
            <button data-n="close" style="font:inherit;font-weight:800;font-size:clamp(15px,2.6vmin,19px);min-width:130px;min-height:64px;border:3px solid #D9C9B6;border-radius:20px;background:#fff;color:#3B2F2F;padding:0 22px">Close Lumi</button>
          </div></div>`;
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-n]');
        if (!b && e.target !== el) return;
        if (b && b.dataset.n === 'close') { closeConfirm(); quiet(call('App', 'exitApp')); return; }
        closeConfirm();
      });
      document.body.appendChild(el);
      confirmEl = el;
      const stay = el.querySelector('[data-n="stay"]');
      if (stay) stay.focus();
    }
    const visible = (sel) => { const n = document.querySelector(sel); return n && n.offsetParent !== null ? n : null; };
    function onBack() {
      if (confirmEl) { closeConfirm(); return; }
      // the "For grown-ups" question (store.js) is open: Back = Cancel
      const gate = document.getElementById('parentGate');
      if (gate && !gate.hidden) {
        const c = gate.querySelector('[data-a="pgCancel"]');
        if (c) c.click(); else gate.hidden = true;
        return;
      }
      const S = A.S || {};
      // a pause, break or celebration card is open: close it the same way the child would
      const card = (S.paused || S.celebrating) && (visible('[data-a="pResume"]') || visible('[data-a="brkDone"]') || visible('[data-a="celebrateClose"]'));
      if (card) { card.click(); return; }
      const rem = document.getElementById('reminder');
      if (rem && !rem.hidden) { rem.hidden = true; return; }
      // first screens: never close without asking
      if (['menu', 'setup', 'who'].includes(S.screen)) { openConfirm(); return; }
      if (typeof A.goBack === 'function') A.goBack();
    }
    if (ANDROID) listen('App', 'backButton', onBack);

    // ---------------------------------------------------------------- 5. reminders while Lumi is closed
    const FIRST_ID = 7000; // Lumi's notifications use ids 7000-7998; 7999 is the test
    const TEST_ID = 7999;
    const MAX_NOTES = 60; // iPadOS keeps at most 64 waiting notifications per app
    const LEAD_MIN = 5; // timetable steps: 5 minutes before, like the "Soon:" banner
    const HORIZON_MS = 24 * 3600e3;
    // "every N minutes" reminders (like "Drink some water"): only for the next 3 hours after Lumi is closed,
    // at most 3 of each, and only between the day's first and last timetable step
    const EVERY_MS = 3 * 3600e3;
    const EVERY_MAX = 3;
    const CHANNEL = 'lumi-gentle';
    const ours = (id) => { const n = Number(id); return n >= FIRST_ID && n < TEST_ID; };
    const notifyOn = () => !!(A.state && A.state.settings && A.state.settings.notify);

    function dayKeyOf(d) { return A.D.DAYS[(d.getDay() + 6) % 7].id; }
    function atTime(day, hhmm, minusMin) {
      const t = new Date(day);
      t.setHours(0, A.toMin(hhmm) - (minusMin || 0), 0, 0);
      return t;
    }

    function plan(now) {
      const st = A.state;
      if (!st || !st.setupDone) return [];
      const end = now + HORIZON_MS;
      const out = [];
      const add = (at, title, body) => {
        const t = at.getTime();
        if (t > now + 30000 && t <= end && !out.some((n) => n.at.getTime() === t && n.title === title)) out.push({ at, title, body });
      };
      const rem = st.reminders || {};
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < 2; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() + i);
        const key = dayKeyOf(day);
        const iso = A.dateKey(day);
        const steps = st.week && st.week[key] ? A.dayPlan(key).slice() : [];
        if (rem.next) {
          steps.forEach((s) => {
            const label = String(A.stepInfo(s).label || "").trim();
            add(atTime(day, s.time, LEAD_MIN), `Soon: ${label}`, `At ${A.fmt(s.time)}.`);
          });
          const events = A.comingUp && typeof A.comingUp.list === 'function' ? A.comingUp.list() : [];
          events.filter((ev) => ev && ev.date === iso && ev.inDay !== false).forEach((ev) => {
            add(atTime(day, ev.time || '10:00', LEAD_MIN), `Soon: ${String(ev.title || "").trim()}`, `At ${A.fmt(ev.time || '10:00')}.`);
          });
        }
        // the grown-ups' own reminders
        const mins = steps.map((s) => A.toMin(s.time));
        const from = mins.length ? Math.min.apply(null, mins) : 7 * 60;
        const to = mins.length ? Math.max.apply(null, mins) : 20 * 60;
        (rem.list || []).forEach((it) => {
          const title = `${it.e ? it.e + ' ' : ''}${it.text || 'Reminder'}`;
          const body = 'A gentle reminder from Lumi.';
          if (it.at) add(atTime(day, it.at), title, body);
          else if (Number(it.every) > 0) {
            const gap = Number(it.every) * 60000;
            const last = (A.S && A.S.reminded && A.S.reminded['every-' + it.id]) || now;
            let t = last + gap;
            while (t < day.getTime()) t += gap;
            let n = 0;
            const dayEnd = day.getTime() + 864e5;
            for (; t < dayEnd && t <= now + EVERY_MS && n < EVERY_MAX; t += gap) {
              const d = new Date(t);
              const m = d.getHours() * 60 + d.getMinutes();
              if (m >= from && m <= to) { add(d, title, body); n++; }
            }
          }
        });
      }
      out.sort((a, b) => a.at - b.at);
      return out.slice(0, MAX_NOTES);
    }

    let queue = Promise.resolve();
    const serial = (fn) => (queue = queue.then(fn, fn).catch(() => 0));

    async function cancelWaiting() {
      const r = await call('LocalNotifications', 'getPending');
      const list = ((r && r.notifications) || []).filter((n) => ours(n.id)).map((n) => ({ id: Number(n.id) }));
      if (list.length) await call('LocalNotifications', 'cancel', { notifications: list });
    }
    async function scheduleAll() {
      await cancelWaiting();
      if (!notifyOn()) return 0;
      const perm = await call('LocalNotifications', 'checkPermissions');
      if (!perm || perm.display !== 'granted') return 0;
      const items = plan(Date.now());
      if (!items.length) return 0;
      await call('LocalNotifications', 'schedule', {
        notifications: items.map((n, i) => ({
          id: FIRST_ID + i, title: n.title, body: n.body,
          schedule: { at: n.at, allowWhileIdle: true },
          channelId: ANDROID ? CHANNEL : undefined,
          extra: { lumi: true }
        }))
      });
      return items.length;
    }
    function onBackground() { serial(scheduleAll); }
    function onForeground() {
      serial(async () => {
        await cancelWaiting();
        await call('LocalNotifications', 'removeAllDeliveredNotifications');
      });
      hideBars();
      awake = null;
      applyAwake();
    }

    if (ANDROID) {
      quiet(call('LocalNotifications', 'createChannel', {
        id: CHANNEL, name: 'Gentle reminders', description: 'Timetable steps and reminders set by a grown-up',
        importance: 3, visibility: 1, vibration: false, lights: false
      }));
    }
    let lastState = null;
    const setActive = (active) => {
      if (active === lastState) return;
      lastState = active;
      if (active) onForeground(); else onBackground();
    };
    listen('App', 'appStateChange', (s) => setActive(!!(s && s.isActive)));
    document.addEventListener('visibilitychange', () => setActive(document.visibilityState === 'visible'));
    // opening Lumi cancels anything left from last time
    setActive(true);

    const S2 = { perm: null, msg: '' }; // what the Grown-ups block shows
    async function ask() {
      let r = null;
      try { r = await call('LocalNotifications', 'requestPermissions'); } catch (e) { r = null; }
      const ok = !!(r && r.display === 'granted');
      A.state.settings.notify = ok;
      A.save();
      S2.perm = r ? r.display : 'unknown';
      return ok ? 'granted' : 'denied';
    }
    A.nativeAskNotifications = ask;
    A.nativeSetNotifications = async (on) => {
      if (on) return ask();
      A.state.settings.notify = false;
      A.save();
      await serial(cancelWaiting);
      return 'off';
    };
    A.nativeNotifyStatus = async () => {
      let p = null;
      try { p = await call('LocalNotifications', 'checkPermissions'); } catch (e) { p = null; }
      S2.perm = p ? p.display : 'unknown';
      return { available: true, permission: S2.perm, on: notifyOn() };
    };
    A.nativeTestNotification = async () => {
      try {
        await call('LocalNotifications', 'cancel', { notifications: [{ id: TEST_ID }] }).catch(() => {});
        await call('LocalNotifications', 'schedule', {
          notifications: [{ id: TEST_ID, title: 'Lumi', body: 'This is how a gentle reminder looks.', schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true }, channelId: ANDROID ? CHANNEL : undefined, extra: { lumi: true } }]
        });
        return true;
      } catch (e) { return false; }
    };
    A.nativeNotifyPreview = () => plan(Date.now());

    // ready-made block for Grown-ups (uses the Grown-ups button and note styles)
    A.nativeNotifyHtml = () => {
      const on = notifyOn();
      if (S2.perm === null) quiet(A.nativeNotifyStatus().then(() => { if (/^cg/.test(A.S.screen)) A.render(); }));
      const denied = S2.perm === 'denied';
      const next = on ? plan(Date.now())[0] : null;
      const esc = A.esc || ((s) => String(s));
      const note = denied
        ? `Notifications are off for Lumi in this ${ANDROID ? 'tablet' : 'iPad'}'s Settings. To use them: Settings › ${ANDROID ? 'Apps › Lumi › Notifications' : 'Notifications › Lumi'}, then turn them on here.`
        : on
          ? `Lumi shows the coming timetable steps (${LEAD_MIN} minutes before) and your reminders on this tablet even when Lumi is closed, for the next day. While Lumi is open it shows its own banners instead.${next ? ` Next: <b>${esc(next.title)}</b>, ${esc(next.at.toLocaleString('en-SG', { weekday: 'short', hour: 'numeric', minute: '2-digit' }))}.` : ''}`
          : 'Off. Turn on to let the timetable steps and your reminders show on this tablet when Lumi is closed. The tablet will ask you to allow notifications.';
      return `<div class="g-field"><span>Reminders when Lumi is closed</span>
          <div class="row gap8 wrap">
            <button class="g-btn small ${on ? '' : 'outline'}" data-a="nativeNotify" data-v="${on ? 'off' : 'on'}" aria-pressed="${on}">${on ? 'On' : 'Off'}</button>
            ${on ? '<button class="g-btn small outline" data-a="nativeNotifyTest">Send a test</button>' : ''}
          </div></div>
        <p class="g-note">${note}</p>${S2.msg ? `<p class="g-note">${esc(S2.msg)}</p>` : ''}`;
    };
    if (A.ACTIONS) {
      Object.assign(A.ACTIONS, {
        nativeNotify: (d) => { S2.msg = ''; A.nativeSetNotifications(d.v === 'on').then(() => A.render()); },
        nativeNotifyTest: () => {
          A.nativeTestNotification().then((ok) => {
            S2.msg = ok ? 'A test notification comes in 5 seconds. Lock the tablet or go to the home screen to see it.' : 'The test could not be sent.';
            A.render();
          });
        }
      });
    }

    // ---------------------------------------------------------------- 6. haptics and keep-awake (hooked in once every file has loaded)
    const SUCCESS = ['steps', 'checklists', 'games', 'tutorials', 'stories', 'petCare', 'together', 'realLife', 'stepGames', 'nownext', 'waits', 'correct'];
    let lastTap = 0;
    function tap(kind, opts) {
      const st = A.state;
      if (!st || !st.settings || !st.settings.sounds || (A.S && A.S.mute)) return;
      if ((opts && opts.quiet) || !SUCCESS.includes(kind)) return;
      const now = Date.now();
      if (now - lastTap < 700) return;
      lastTap = now;
      quiet(call('Haptics', 'impact', { style: 'LIGHT' }));
    }
    function offlineNote(html) {
      // Grown-ups › Backup and offline: the website's "add to home screen" advice does not apply in the app
      const ic = A.ic ? A.ic('check', 16) : '';
      return String(html).replace(/(Backup and offline<\/h2>)[\s\S]*?(\s*<p class="g-note[^"]*">Last backup:)/,
        `$1\n      <p class="g-note ok-line">${ic} Lumi is installed as an app, so it works without internet.</p>$2`);
    }

    let hooked = false;
    function hookIn() {
      if (hooked) return;
      hooked = true;
      const prevTrack = A.onTrack;
      A.onTrack = function (kind, detail, opts) {
        if (prevTrack) prevTrack.apply(this, arguments);
        try { tap(kind, opts); } catch (e) { /* haptics are extra */ }
      };
      const prevAfter = A.afterRender;
      A.afterRender = function () {
        if (prevAfter) prevAfter.apply(this, arguments);
        try { applyAwake(); } catch (e) { /* keep-awake is extra */ }
      };
      const prevOffline = A.offlineHtml;
      if (typeof prevOffline === 'function') A.offlineHtml = function () { return offlineNote(prevOffline.apply(this, arguments)); };
      applyAwake();
      setTimeout(() => quiet(call('SplashScreen', 'hide', { fadeOutDuration: 300 })), 120);
    }
    if (window.LumiDebug) hookIn(); // Lumi already started (native.js was loaded after main.js)
    else if (typeof A.start === 'function') {
      const start = A.start;
      A.start = function () {
        const r = start.apply(this, arguments);
        try { hookIn(); } catch (e) { /* the app still runs without these extras */ }
        return r;
      };
    }
  }

  // native.js loaded first: Lumi does not exist yet, so finish once the page (and main.js) has run.
  // native.js loaded later: Lumi exists, finish now.
  if (window.LumiApp && typeof window.LumiApp.start === 'function') setup(window.LumiApp);
  else document.addEventListener('DOMContentLoaded', () => { if (window.LumiApp) setup(window.LumiApp); });
})();
