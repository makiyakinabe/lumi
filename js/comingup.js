/*
  comingup.js
  "Coming up" stories: short picture stories (social stories) that prepare a child for something new or
  different, like the dentist, a haircut, visitors, a party or a change of plan.
  - Grown-ups › Coming up: pick a ready-made story, set the date and time, swap in real photos and edit the
    sentences. Stories are written as the child ("I will…", "I can…") and stay short and calm.
  - The child sees a countdown on Lumi's home screen ("3 sleeps until Dentist", with a moon for each
    sleep) from a few days before, and can read the story with Lumi as often as they like.
  - On the day, the event is added to My day at its time, with the story ready to read before going.
  - The last page asks how the child feels about it (shown to grown-ups in Progress) and ends with "I'm ready".
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, save, render, go, uid, award, track } = A;

  // ---------------------------------------------------------------- ready-made stories
  const TPL = {
    dentist: { name: 'Dentist', icon: 'sDentist', tint: '#E3F1FA', step: 'dentist', pages: [
      'I am going to see the dentist. The dentist helps keep my teeth healthy.',
      'I will sit in a big chair. The chair can move up and down.',
      'The dentist will look at my teeth with a little mirror and a bright light.',
      'If I feel worried, I can hold my toy or squeeze my hands.',
      'When it is finished, I can go home. I did it!'] },
    doctor: { name: 'Doctor', icon: 'medicine', tint: '#E7F3E1', pages: [
      'I am going to see the doctor. The doctor helps my body stay well.',
      'First, I will wait in the waiting room. I can bring something to do.',
      'The doctor may look in my ears and listen to my heart.',
      'If I feel worried, I can take slow breaths with Lumi.',
      'When it is finished, I can go home.'] },
    haircut: { name: 'Haircut', icon: 'sScissors', tint: '#FBE9F0', step: 'haircut', pages: [
      'I am going to get a haircut.',
      'I will sit in a chair and wear a cape, so hair does not get on my clothes.',
      'The hairdresser will use scissors or a buzzing clipper. It does not hurt.',
      'If it is too loud, I can wear my headphones or ask for a break.',
      'When it is finished, I can look in the mirror at my new haircut.'] },
    school: { name: 'New school', icon: 'school', tint: '#F6E7D3', pages: [
      'I am going to a new school.',
      'There will be a new teacher and new friends. They will say hello.',
      'Everything may look different at first. That is okay.',
      'If I need help, I can show my teacher my talk board.',
      'Every day, the new place will feel a little more familiar.'] },
    visitors: { name: 'Visitors', icon: 'home', tint: '#FFF1C2', pages: [
      'Some visitors are coming to our home.',
      'They may ring the bell and say hello. I can wave or say hi.',
      'Our home might be busier and louder than usual.',
      'If I need a quiet break, I can go to my quiet space.',
      'After the visit, they will go home and it will be quiet again.'] },
    party: { name: 'Birthday party', icon: 'kBalloon', tint: '#FDE7EE', pages: [
      'I am going to a birthday party.',
      'There may be music, games and lots of people.',
      'We will sing Happy Birthday, and there may be cake.',
      'If it feels too loud, I can take a break with a grown-up.',
      'When the party ends, we will go home.'] },
    trip: { name: 'A new place', icon: 'pin', tint: '#DCEFED', pages: [
      'I am going somewhere new.',
      'We will travel there together. I can bring something I like.',
      'The new place may look, sound and smell different. That is okay.',
      'I can stay close to my grown-up.',
      'When we are finished, we will come back home.'] },
    change: { name: 'Change of plan', icon: 'wDifferent', tint: '#EEE8F9', pages: [
      'Something will be different from my usual day.',
      'Sometimes plans change. That is okay.',
      'A grown-up will tell me what will happen instead.',
      'I can look at My day to see the new plan.',
      'If I feel upset, I can use Calm, or tell someone with my talk board.'] },
    other: { name: 'Something new', icon: 'kStories', tint: '#FFF4D6', pages: [
      'Something new is happening.',
      'Here is what will happen.',
      'If I feel worried, I can take slow breaths with Lumi.',
      'When it is finished, I did it!'] }
  };
  const MAX_PAGES = 8;
  // each kind of event is also a My day step, so it can sit in the plan on the day
  Object.keys(TPL).forEach((k) => {
    const t = TPL[k];
    D.STEPS['cu_' + k] = { label: t.name, icon: t.icon, tint: t.tint, voice: `Today is ${t.name}.` };
  });

  // ---------------------------------------------------------------- dates
  const list = () => (Array.isArray(state.comingUp) ? state.comingUp : (state.comingUp = []));
  const parse = (iso) => { const [y, m, d] = String(iso || '').split('-').map(Number); return new Date(y || 2000, (m || 1) - 1, d || 1); };
  const today = () => parse(A.dateKey());
  const daysUntil = (ev) => Math.round((parse(ev.date) - today()) / 864e5);
  const niceDate = (ev) => { try { return parse(ev.date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' }); } catch (e) { return ev.date; } };
  const sortKey = (ev) => `${ev.date} ${ev.time || '00:00'}`;
  const visible = (ev) => { const n = daysUntil(ev); return n >= 0 && n <= (ev.show || 7); };
  const nextUp = () => list().filter(visible).sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
  const find = (id) => list().find((e) => e.id === id) || null;
  const tplOf = (ev) => TPL[ev && ev.kind] || TPL.other;

  function countLine(ev) {
    const n = daysUntil(ev);
    if (n <= 0) return `${ev.title} is today!`;
    if (n === 1) return `1 sleep until ${ev.title}. That's tomorrow!`;
    return `${n} sleeps until ${ev.title}.`;
  }
  function moons(ev, size) {
    const n = Math.max(0, daysUntil(ev));
    if (n === 0) return `<span class="cu-today">${ic('star', size)}<b>Today</b></span>`;
    if (n > 7) return `<span class="cu-sleeps"><b>${n}</b> sleeps</span>`;
    return `<span class="cu-moons" role="img" aria-label="${n} ${n === 1 ? 'sleep' : 'sleeps'}">${Array.from({ length: n }, () => `<span class="cu-moon">${ic('sMoon', size)}</span>`).join('')}</span>`;
  }
  function art(ev, size, page) {
    const photo = page ? page.photo : ev.photo;
    if (photo) return `<img class="cu-photo" src="${photo}" alt="" width="${size}" height="${size}">`;
    return ic(tplOf(ev).icon, Math.round(size * 0.62));
  }

  // ---------------------------------------------------------------- child: countdown on the home screen
  A.comingUpChip = () => {
    const up = nextUp();
    if (!up.length) return '';
    const ev = up[0];
    const n = daysUntil(ev);
    return `<button class="cu-chip ${n === 0 ? 'today' : ''}" data-a="cuOpen" data-v="${ev.id}" aria-label="${esc(countLine(ev))} Tap to read the story.">
      <span class="cu-chip-art" style="background:${tplOf(ev).tint}">${art(ev, 54)}</span>
      <span class="cu-chip-txt"><b>${esc(ev.title)}</b>${moons(ev, 20)}</span>
      ${up.length > 1 ? `<span class="cu-chip-more">+${up.length - 1}</span>` : ''}
    </button>`;
  };
  const homeVoice = A.VOICE.home;
  A.VOICE.home = () => {
    const base = homeVoice ? homeVoice() : '';
    const up = nextUp();
    return up.length ? `${base} ${countLine(up[0])}`.trim() : base;
  };

  // ---------------------------------------------------------------- child: the story reader
  // pages: 0 = the countdown cover, 1..n = the grown-up's pages, n+1 = "How do you feel?" and "I'm ready"
  const cur = () => (S.cu && find(S.cu.id)) || null;
  const pageCount = (ev) => ev.pages.length + 2;
  function pageVoice(ev, p) {
    if (p === 0) return `${ev.title}. ${countLine(ev)} Let's read about it.`;
    if (p <= ev.pages.length) return ev.pages[p - 1].text;
    return `How do you feel about ${ev.title}?`;
  }
  const FEEL = [['happy', 'Happy', 'Yay! It is going to be a good day.'], ['worried', 'Worried', 'It is okay to feel worried. We can read the story again, and you can squeeze your hands.'], ['scared', 'Scared', 'It is okay to feel scared. A grown-up will be with you.']];
  A.PARENT.cuRead = 'home';
  A.VOICE.cuRead = () => { const ev = cur(); return ev ? pageVoice(ev, S.cu.page) : ''; };
  A.SCREENS.cuRead = () => {
    const ev = cur();
    if (!ev) return '<section class="screen"></section>';
    const p = S.cu.page;
    const total = pageCount(ev);
    const t = tplOf(ev);
    const pg = p >= 1 && p <= ev.pages.length ? ev.pages[p - 1] : null;
    const last = p === total - 1;
    const pd = Array.from({ length: total }, (_, k) => `<span class="cu-dot ${k === p ? 'on' : k < p ? 'done' : ''}"></span>`).join('');
    let words;
    if (p === 0) {
      words = `<div class="cu-count">${moons(ev, 46)}</div><b class="cu-title">${esc(ev.title)}</b>
        <p class="cu-line">${esc(countLine(ev))}</p><p class="cu-when">${ic('clock', 22)}<span>${esc(niceDate(ev))}${ev.time ? ', ' + A.fmt(ev.time) : ''}</span></p>`;
    } else if (pg) {
      words = `<p class="cu-sentence">${esc(pg.text)}</p>`;
    } else {
      words = `<p class="cu-sentence small">How do you feel about ${esc(ev.title)}?</p>
        <div class="cu-feel">${FEEL.map(([k, label]) => `<button class="cu-feel-btn ${S.cu.felt === k ? 'on' : ''}" data-a="cuFeel" data-v="${k}" aria-pressed="${S.cu.felt === k}">${L.face(k, 96)}<span>${label}</span></button>`).join('')}</div>
        <button class="primary big cu-ready" data-a="cuReady">${ic('check', 40)}<span>I'm ready</span></button>`;
    }
    const mood = last ? (S.cu.felt === 'happy' || !S.cu.felt ? 'happy' : 'calm') : p === 0 ? 'excited' : 'happy';
    return `
<section class="screen cu-read" aria-label="${esc(ev.title)} story">
  ${A.srTitle(ev.title)}
  <div class="row between" style="height:60px;flex:none">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(pageVoice(ev, p))}<span class="game-chip" style="background:${t.tint}">${ic(t.icon, 30)}<span>${esc(ev.title)}</span></span></div>
    <div class="cu-dots" role="img" aria-label="Page ${p + 1} of ${total}">${pd}</div>
  </div>
  <div class="row gap24 grow" style="min-height:0">
    <div class="panel cu-pic" style="background:${t.tint}">
      ${pg && pg.photo ? `<img class="cu-page-photo" src="${pg.photo}" alt="">` : p === 0 && ev.photo ? `<img class="cu-page-photo" src="${ev.photo}" alt="">` : `<span class="cu-pic-ic">${ic(t.icon, 210)}</span>`}
      <span class="cu-pic-lumi ${p === 0 || (last && S.cu.felt === 'happy') ? 'hop' : ''}">${L.svg({ look: A.lookWith(), mood, size: 170 })}</span>
    </div>
    <div class="panel cu-words">${words}</div>
  </div>
  <div class="row between cu-nav">
    <button class="cu-arrow ${p === 0 ? 'hidden' : ''}" data-a="cuPage" data-v="-1" aria-label="Back a page">${ic('back', 44)}</button>
    <button class="cu-arrow next ${last ? 'hidden' : ''}" data-a="cuPage" data-v="1" aria-label="Next page">${ic('arrow', 44)}</button>
  </div>
</section>`;
  };
  A.GUIDE.cuRead = () => {
    const ev = cur();
    if (!ev) return null;
    const last = S.cu.page === pageCount(ev) - 1;
    if (last) return S.cu.felt ? { sel: '.cu-ready', say: "Tap I'm ready." } : { sel: '.cu-feel-btn', say: 'How do you feel?' };
    return { sel: '.cu-arrow.next', say: 'Tap the arrow.', delay: 9000 };
  };

  function open(id, from) {
    const ev = find(id);
    if (!ev) return;
    S.cu = { id, page: 0, felt: null, from: from || S.screen };
    go('cuRead');
    say(pageVoice(ev, 0));
  }

  // ---------------------------------------------------------------- on the day: a step in My day
  // startDay (app.js) adds these to today's plan
  A.comingUpSteps = (dayKey) => {
    if (dayKey !== A.todayKey()) return [];
    const iso = A.dateKey();
    return list().filter((ev) => ev.date === iso && ev.inDay !== false).map((ev) => ({
      uid: 'cu-' + ev.id, id: 'cu_' + (TPL[ev.kind] ? ev.kind : 'other'), cu: ev.id, time: ev.time || '10:00',
      label: ev.title, voice: `Today is ${ev.title}! Let's read my story first.`
    }));
  };
  const SG = A.SG;
  if (SG && SG.G) {
    const evOfStep = () => { const st = S.day && S.day.plan[S.day.i]; return (st && find(st.cu)) || { id: '', title: st ? st.label : 'Today', kind: 'other', pages: [] }; };
    SG.G.cu = {
      init: () => ({ read: false }),
      total: () => 2,
      progress: (g) => (g.phase === 'turn' ? 2 : g.read ? 1 : 0),
      real: 'I did it!',
      voice: (g) => { const ev = evOfStep(); return g.phase === 'turn' ? `Now it's time for ${ev.title}. Tap I did it when it is finished.` : `Today is ${ev.title}! Tap the book to read about it.`; },
      guide: (g) => (g.phase === 'turn' ? { sel: '[data-a="sgReal"]', say: 'Tap I did it when it is finished.' } : { sel: '.cu-step-book', say: 'Tap the book.' }),
      barMid: (g) => `<span class="sg-label">${g.phase === 'turn' ? 'Now you!' : 'Read my story'}</span>`,
      scene(g, info) {
        const ev = evOfStep();
        const t = tplOf(ev);
        return `<div class="panel scene grow sg cu-step" style="background:${t.tint}">
          <div class="floor" style="height:22%"></div>
          ${ev.id ? `<button class="cu-step-book" data-a="cuOpen" data-v="${ev.id}" data-from="routine" aria-label="Read the ${esc(ev.title)} story">
            <span class="cu-book-art">${art(ev, 150)}</span><b>${esc(ev.title)}</b><span class="cu-book-go">${ic('kStories', 30)}<span>${g.read ? 'Read again' : 'Read my story'}</span></span></button>` : ''}
          <button class="gn-lumi ${g.phase === 'turn' ? 'hop' : ''}" data-a="sgTap" data-k="lumi" aria-label="Lumi">${L.svg({ look: A.dayLook(), mood: g.phase === 'turn' ? 'excited' : 'happy', wave: true, size: 230, label: 'Lumi' })}</button>
          ${g.phase === 'turn' ? SG.turnCard(info, `It's time for ${ev.title}. You can do it!`, 'right') : ''}
        </div>`;
      },
      // tapping Lumi skips the story (nothing is ever locked)
      tap(g, k) { if (k === 'lumi' && g.phase !== 'turn') SG.setPhase(g, 'turn'); }
    };
  }

  // ---------------------------------------------------------------- grown-ups: Grown-ups › Coming up
  A.PARENT.cgComingUp = 'menu';
  A.VOICE.cgComingUp = () => '';
  const photoBox = (name, photo, size) => `<div class="photo-row"><span class="photo-box" style="width:${size || 72}px;height:${size || 72}px">${photo ? `<img src="${photo}" alt="">` : ic('camera', 24)}</span>
    <div class="col gap6"><label class="g-btn outline small file-btn">${ic('camera', 16)}<span>${photo ? 'Change' : 'Add photo'}</span><input type="file" accept="image/*" data-photo="${name}"></label>
    ${photo ? `<button class="g-link" data-a="cuPhotoDel" data-v="${name}">Remove</button>` : ''}</div></div>`;
  function statusChip(ev) {
    const n = daysUntil(ev);
    if (n < 0) return '<span class="cu-tag past">Past</span>';
    if (n === 0) return '<span class="cu-tag today">Today</span>';
    return `<span class="cu-tag ${visible(ev) ? 'on' : ''}">${n === 1 ? 'Tomorrow' : 'In ' + n + ' days'}</span>`;
  }
  A.SCREENS.cgComingUp = () => {
    const all = list().slice().sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));
    const upcoming = all.filter((e) => daysUntil(e) >= 0);
    const past = all.filter((e) => daysUntil(e) < 0);
    const row = (ev) => `<button class="cu-row ${S.cuSel === ev.id && !S.cuNew ? 'sel' : ''}" data-a="cuSel" data-v="${ev.id}">
      <span class="cu-row-art" style="background:${tplOf(ev).tint}">${art(ev, 44)}</span>
      <span class="col grow"><b>${esc(ev.title)}</b><span class="g-note">${esc(niceDate(ev))}${ev.time ? ' · ' + A.fmt(ev.time) : ''}</span></span>${statusChip(ev)}</button>`;
    const left = `<div class="g-panel scroll" style="width:380px">
      <div class="row between"><h2 class="g-h">Coming up</h2><button class="g-btn small" data-a="cuNew">${ic('plus', 16)}<span>New story</span></button></div>
      <p class="g-note">Prepare your child for something new or different. They see a countdown on Lumi's home screen and can read the story with Lumi.</p>
      ${upcoming.map(row).join('') || '<p class="g-note">Nothing coming up yet.</p>'}
      ${past.length ? `<div class="g-sub-h">Past</div>${past.map(row).join('')}` : ''}
    </div>`;
    let right;
    const ev = find(S.cuSel);
    if (S.cuNew || !ev) {
      right = `<div class="g-panel grow scroll">
        <h2 class="g-h">What is coming up?</h2>
        <p class="g-note">Pick one to start. You can change every sentence and add your own photos.</p>
        <div class="cu-tpl-grid">${Object.keys(TPL).map((k) => `<button class="cu-tpl" data-a="cuMake" data-v="${k}" style="background:${TPL[k].tint}">${ic(TPL[k].icon, 64)}<span>${esc(TPL[k].name)}</span></button>`).join('')}</div>
        <div class="cu-tips"><b>Tips for a good story</b>
          <ul><li>Write as your child: "I will…", "I can…".</li><li>Keep each page to one or two short sentences.</li><li>Real photos of the place or person help most.</li><li>Say what will happen, what they can do if they feel worried, and how it ends.</li><li>Read it together a few times before the day.</li></ul></div>
      </div>`;
    } else {
      const pages = ev.pages.map((pg, i) => `<div class="cu-edit-page">
        <span class="cu-num">${i + 1}</span>${photoBox('cu-page-' + i, pg.photo, 56)}
        <textarea class="g-input grow" rows="2" data-input="cu-page-${i}" maxlength="140" aria-label="Page ${i + 1}">${esc(pg.text)}</textarea>
        <button class="mini-btn" data-a="cuPageDel" data-v="${i}" aria-label="Remove page ${i + 1}">${ic('x', 16)}</button></div>`).join('');
      right = `<div class="g-panel grow scroll">
        <div class="row between"><h2 class="g-h">${ic(tplOf(ev).icon, 28)} Story</h2>
          <div class="row gap8"><button class="g-btn small outline" data-a="cuOpen" data-v="${ev.id}" data-from="cgComingUp">${ic('eye', 16)}<span>Preview</span></button>
          <button class="g-btn small ${S.cuDel === ev.id ? 'danger' : 'outline'}" data-a="cuDelete" data-v="${ev.id}">${ic('trash', 16)}<span>${S.cuDel === ev.id ? 'Tap again to delete' : 'Delete'}</span></button></div></div>
        <div class="row gap12">
          <label class="g-field grow"><span>Name (short works best)</span><input class="g-input" type="text" data-input="cu-title" value="${esc(ev.title)}" maxlength="24"></label>
          <label class="g-field"><span>Date</span><input class="g-input" type="date" data-input="cu-date" value="${esc(ev.date)}" min="${A.dateKey()}"></label>
          <label class="g-field"><span>Time</span><input class="g-input" type="time" data-input="cu-time" value="${esc(ev.time || '10:00')}" step="300"></label>
        </div>
        <div class="row gap16 wrap">
          <div class="g-field"><span>Show the countdown from</span><div class="seg" role="group">${[[3, '3 days before'], [7, '1 week'], [14, '2 weeks']].map(([v, l]) => `<button class="seg-opt ${(ev.show || 7) === v ? 'on' : ''}" data-a="cuShow" data-v="${v}" aria-pressed="${(ev.show || 7) === v}">${l}</button>`).join('')}</div></div>
          <div class="g-field"><span>Cover photo</span>${photoBox('cu-cover', ev.photo, 56)}</div>
        </div>
        <button class="check-row" data-a="cuInDay" aria-pressed="${ev.inDay !== false}"><span class="box ${ev.inDay !== false ? 'on' : ''}">${ev.inDay !== false ? ic('check', 14) : ''}</span><span>Add it to My day on the day, with the story to read before going</span></button>
        <div class="g-sub-h">Pages</div>
        <div class="cu-edit-pages">${pages}</div>
        ${ev.pages.length < MAX_PAGES ? `<button class="g-btn outline" data-a="cuPageAdd">${ic('plus', 18)}<span>Add a page</span></button>` : ''}
        <p class="g-note">Lumi adds a first page with the countdown, and a last page where your child can say how they feel and tap "I'm ready". What they choose shows in Progress.</p>
      </div>`;
    }
    return `
<section class="screen grownup" aria-label="Coming up">
  ${A.gHeader('cgComingUp')}
  <div class="row gap16 grow" style="align-items:stretch">${left}${right}</div>
</section>`;
  };

  const prevInput = A.onInput;
  A.onInput = (key, v, el) => {
    if (prevInput) prevInput(key, v, el);
    const ev = find(S.cuSel);
    if (!ev) return;
    if (key === 'cu-title') { ev.title = v.trim() || tplOf(ev).name; const r = A.stage.querySelector('.cu-row.sel b'); if (r) r.textContent = ev.title; }
    if (key === 'cu-date' && /^\d{4}-\d{2}-\d{2}$/.test(v)) ev.date = v;
    if (key === 'cu-time' && /^\d{2}:\d{2}/.test(v)) ev.time = v.slice(0, 5);
    const m = /^cu-page-(\d+)$/.exec(key);
    if (m && ev.pages[Number(m[1])]) ev.pages[Number(m[1])].text = v;
  };
  // re-draw the list when a date is changed (the order and countdown may change)
  A.stage.addEventListener('change', (e) => { if (e.target.matches('[data-input="cu-date"], [data-input="cu-time"]') && S.screen === 'cgComingUp') { save(); render(); } });
  const prevPhoto = A.onPhoto;
  A.onPhoto = (name, url, el) => {
    if (!/^cu-/.test(name)) { if (prevPhoto) prevPhoto(name, url, el); return; }
    const ev = find(S.cuSel);
    if (!ev) return;
    if (name === 'cu-cover') ev.photo = url;
    const m = /^cu-page-(\d+)$/.exec(name);
    if (m && ev.pages[Number(m[1])]) ev.pages[Number(m[1])].photo = url;
    save();
    render();
  };

  const tomorrow = () => { const d = today(); d.setDate(d.getDate() + 1); return A.dateKey(d); };
  Object.assign(A.ACTIONS, {
    cuOpen: (d) => open(d.v, d.from),
    cuPage: (d) => {
      const ev = cur();
      if (!ev) return;
      S.cu.page = Math.max(0, Math.min(pageCount(ev) - 1, S.cu.page + Number(d.v)));
      A.tone(Number(d.v) > 0 ? 660 : 523, 0.15, 0.05);
      render();
      say(pageVoice(ev, S.cu.page));
    },
    cuFeel: (d) => {
      const ev = cur();
      const f = FEEL.find((x) => x[0] === d.v);
      if (!ev || !f) return;
      if (S.cu.felt !== d.v) track('feelings', d.v, { quiet: true });
      S.cu.felt = d.v;
      track('comingUp', `${ev.title}: ${f[1].toLowerCase()}`);
      render();
      say(f[2]);
    },
    cuReady: () => {
      const ev = cur();
      if (!ev) return;
      const first = ev.readOn !== A.dateKey();
      if (first) { ev.readOn = A.dateKey(); state.stats.changesHandled = (state.stats.changesHandled || 0) + 1; }
      save();
      if (first && S.cu.from !== 'cgComingUp') award(1);
      if (!S.cu.felt) track('comingUp', `${ev.title}: read the story`);
      const from = S.cu.from;
      S.cu = null;
      if (from === 'routine' && S.day) {
        go('routine');
        const g = S.day.game;
        if (g && g.id === 'cu') { g.read = true; A.SG.setPhase(g, 'turn'); }
        return;
      }
      go(from === 'cgComingUp' ? 'cgComingUp' : 'home');
      say(daysUntil(ev) === 0 ? `You're ready for ${ev.title}!` : `Great reading! ${countLine(ev)}`);
    },
    cuNew: () => { S.cuNew = true; S.cuDel = null; render(); },
    cuSel: (d) => { S.cuSel = d.v; S.cuNew = false; S.cuDel = null; render(); },
    cuMake: (d) => {
      const t = TPL[d.v] || TPL.other;
      const ev = { id: 'cu' + uid(), kind: d.v, title: t.name, date: tomorrow(), time: '10:00', show: 7, inDay: true, photo: null, pages: t.pages.map((text) => ({ text, photo: null })) };
      list().push(ev);
      S.cuSel = ev.id;
      S.cuNew = false;
      save();
      render();
    },
    cuShow: (d) => { const ev = find(S.cuSel); if (ev) { ev.show = Number(d.v); save(); render(); } },
    cuInDay: () => { const ev = find(S.cuSel); if (ev) { ev.inDay = ev.inDay === false; save(); render(); } },
    cuPageAdd: () => { const ev = find(S.cuSel); if (ev && ev.pages.length < MAX_PAGES) { ev.pages.push({ text: '', photo: null }); save(); render(); const f = A.stage.querySelector(`[data-input="cu-page-${ev.pages.length - 1}"]`); if (f) f.focus(); } },
    cuPageDel: (d) => { const ev = find(S.cuSel); if (ev && ev.pages.length > 1) { ev.pages.splice(Number(d.v), 1); save(); render(); } },
    cuPhotoDel: (d) => {
      const ev = find(S.cuSel);
      if (!ev) return;
      if (d.v === 'cu-cover') ev.photo = null;
      const m = /^cu-page-(\d+)$/.exec(d.v);
      if (m && ev.pages[Number(m[1])]) ev.pages[Number(m[1])].photo = null;
      save();
      render();
    },
    cuDelete: (d) => {
      if (S.cuDel !== d.v) { S.cuDel = d.v; render(); return; }
      state.comingUp = list().filter((e) => e.id !== d.v);
      S.cuDel = null;
      S.cuSel = null;
      save();
      render();
    }
  });
  A.comingUp = { list, nextUp, daysUntil, countLine, open, TPL };
})();
