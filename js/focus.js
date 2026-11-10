/*
  focus.js
  "What should Lumi help with?" Grown-ups pick one or more focus areas for their child (needs, not diagnoses;
  nothing here is shown to the child). Each focus:
  - stars the matching skills, so Lumi marks those games and activities "for you"
  - puts the matching home button first
  - suggests stories and lessons first (Stories and Learn show "For Mia")
  - turns on settings that usually help (only when the focus is added; grown-ups can change them after)
  - adds one simple number to Grown-ups > Overview and Progress
  Also: the Grown-ups Overview (the page Grown-ups opens on), the focus page, and step 2 of first-run setup.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, S, L, state, ic, esc, save, render, go, applyPrefs } = A;

  D.FOCUS = [
    { id: 'talk', name: 'Communicating', icon: 'kTalk', tint: '#DDF0EC', ink: '#2F7E79', line: 'Say what they need with pictures and words', skills: ['communication'], tile: 'talk', set: { speakWords: true }, stories: [], count: ['talk'], unit: 'talk-board messages' },
    { id: 'feelings', name: 'Feelings and calm', icon: 'kCalm', tint: '#ECE7F8', ink: '#7E64C8', line: 'Name feelings, calm down, ask for a break', skills: ['emotions'], tile: 'calm', set: { breakBtn: true, moveBreak: true }, stories: ['thunder', 'jab', 'dentist', 'lost', 'polyclinic'], count: ['calm', 'feelings'], unit: 'times calming down or sharing a feeling' },
    { id: 'routines', name: 'Routines and getting ready', icon: 'kDay', tint: '#E1ECF7', ink: '#4A78A8', line: 'Follow the day, step by step', skills: ['routines'], tile: 'day', set: { watchFirst: true }, stories: ['learn-teeth', 'learn-dress', 'learn-pack', 'learn-hands'], count: ['steps', 'checklists'], unit: 'routine steps done' },
    { id: 'sensory', name: 'Sensory comfort', icon: 'sliders', tint: '#F3EBDD', ink: '#9A6A2A', line: 'Fewer surprises, softer sound and motion', skills: ['emotions'], tile: 'calm', set: { reduceMotion: true, musicVolume: 0.3, voiceRate: 0.85 }, stories: ['hawkerstory', 'shop', 'library', 'thunder', 'haircut'], count: ['breaks', 'calm'], unit: 'breaks and calm moments' },
    { id: 'outings', name: 'Going out and new places', icon: 'busLine', tint: '#E3F1FA', ink: '#3E6E9A', line: 'Practise the bus, shops, clinics and more', skills: ['social', 'lifeskills'], tile: 'fun', stories: ['bus', 'mrt', 'shop', 'dentist', 'haircut', 'polyclinic', 'library', 'swim', 'hawkerstory', 'party'], count: ['stories'], unit: 'stories practised' },
    { id: 'attention', name: 'Focus and waiting', icon: 'hourglass', tint: '#FBEFD9', ink: '#B07A12', line: 'Wait, take turns, move when restless', skills: ['thinking'], tile: 'day', set: { breakBtn: true, moveBreak: true, guideDelay: 6 }, games: ['wait'], stories: ['firedrill', 'teacher', 'shop'], count: ['waits', 'games'], unit: 'waits and games finished' },
    { id: 'skills', name: 'Everyday life skills', icon: 'kLearn', tint: '#E6E8FA', ink: '#5B6ABF', line: 'Teeth, dressing, cooking, laundry', skills: ['lifeskills'], tile: 'fun', set: { watchFirst: true }, stories: ['learn-teeth', 'learn-hands', 'learn-dress', 'learn-canteen', 'learn-sandwich', 'learn-laundry', 'learn-pack', 'learn-toilet'], count: ['tutorials', 'petCare'], unit: 'skills practised' },
    { id: 'social', name: 'Friends and turn-taking', icon: 'together', tint: '#F8E4EC', ink: '#C2577A', line: 'Greet, share, play together', skills: ['social'], tile: 'fun', stories: ['party', 'teacher', 'firedrill', 'work'], count: ['together'], unit: 'turns and games together' },
    { id: 'touch', name: 'Easier touch', icon: 'hand', tint: '#EEF2E6', ink: '#5E7A3A', line: 'Tap instead of drag, bigger text', skills: [], tile: null, set: { tapMove: true, textSize: 1.15, guideDelay: 6 }, stories: [], count: null }
  ];
  const byId = (id) => D.FOCUS.find((f) => f.id === id);
  const chosen = () => ((state.profile && state.profile.focus) || []).map(byId).filter(Boolean);
  A.focusChosen = chosen;
  const kid = () => esc(state.childName || 'your child');

  // ---------------------------------------------------------------- what a focus changes
  const SET_NAMES = { speakWords: 'talk board says each word', breakBtn: 'Break button on', moveBreak: 'movement breaks on', watchFirst: 'Lumi shows each step first', reduceMotion: 'less movement', musicVolume: 'quieter music', voiceRate: 'calmer voice', guideDelay: 'guide hand comes sooner', tapMove: 'tap instead of drag', textSize: 'bigger text' };
  function setFocus(ids) {
    const p = state.profile;
    const before = p.focus || [];
    p.focus = ids.slice();
    const added = ids.filter((id) => !before.includes(id)).map(byId).filter(Boolean);
    const changes = [];
    // skills that get a star
    if (ids.length) {
      const t = {};
      Object.keys(D.SKILLS).forEach((k) => { t[k] = false; });
      chosen().forEach((f) => f.skills.forEach((k) => { t[k] = true; }));
      p.targets = t;
    }
    added.forEach((f) => {
      Object.entries(f.set || {}).forEach(([k, v]) => {
        if (state.settings[k] !== v) { state.settings[k] = v; changes.push(SET_NAMES[k] || k); }
      });
      (f.games || []).forEach((g) => { p.games[g] = true; });
      if (f.tile) p.show[f.tile] = true;
    });
    save();
    applyPrefs();
    S.focusMsg = changes.length ? `Turned on: ${[...new Set(changes)].join(', ')}. You can change these in Sensory.` : '';
  }
  A.setFocus = setFocus;
  // home buttons: the focus ones first
  A.focusTileOrder = () => {
    const order = [];
    chosen().forEach((f) => { if (f.tile && !order.includes(f.tile)) order.push(f.tile); });
    return order;
  };
  // stories and lessons to suggest first
  A.focusStories = () => {
    const set = [];
    chosen().forEach((f) => f.stories.forEach((s) => { if (!set.includes(s)) set.push(s); }));
    return set;
  };

  // ---------------------------------------------------------------- the picker (Grown-ups and setup)
  function cards(action) {
    const on = (state.profile.focus || []);
    return `<div class="fo-grid">${D.FOCUS.map((f) => {
      const sel = on.includes(f.id);
      return `<button class="fo-card ${sel ? 'on' : ''}" data-a="${action}" data-v="${f.id}" aria-pressed="${sel}" style="--fc:${f.tint};--fi:${f.ink}">
        <span class="fo-ic">${ic(f.icon, 34)}</span><span class="fo-txt"><b>${esc(f.name)}</b><span>${esc(f.line)}</span></span>
        <span class="fo-check">${sel ? ic('check', 18) : ''}</span></button>`;
    }).join('')}</div>`;
  }
  const toggleFocus = (id) => {
    const cur = (state.profile.focus || []).slice();
    const i = cur.indexOf(id);
    if (i >= 0) cur.splice(i, 1); else cur.push(id);
    setFocus(cur);
    render();
  };

  A.PARENT.cgFocus = 'cgHome';
  A.VOICE.cgFocus = () => '';
  A.SCREENS.cgFocus = () => `
<section class="screen grownup" aria-label="What Lumi helps with">
  ${A.gHeader('cgHome')}
  <div class="g-panel grow scroll fo-page">
    <div class="row between"><div class="col"><h2 class="g-h big-h">What should Lumi help ${kid()} with?</h2><span class="g-note">Pick any. Lumi shows these first and suggests matching stories.</span></div>
      <button class="g-btn" data-a="nav" data-to="cgHome">${ic('check', 18)}<span>Done</span></button></div>
    ${cards('fcToggle')}
    ${S.focusMsg ? `<div class="fo-msg">${ic('sparkle', 20)}<span>${esc(S.focusMsg)}</span></div>` : ''}
  </div>
</section>`;

  // first-run setup: step 2
  const setupScreen = A.SCREENS.setup;
  A.SCREENS.setup = () => {
    if (S.setupStep !== 2) return setupScreen();
    return `
<section class="screen grownup setup" aria-label="What Lumi helps with">
  <div class="row gap16">${L.svg({ look: A.lookWith(), mood: 'happy', size: 84 })}
    <div class="col"><h1 class="g-title big">What should Lumi help ${kid()} with?</h1><span class="g-sub">Pick any. You can change this later in Grown-ups.</span></div></div>
  <div class="grow fo-setup">${cards('fcSetup')}</div>
  <div class="row between">
    <button class="g-btn outline" data-a="fcSetupBack">${ic('back', 18)}<span>Back</span></button>
    <span class="row gap12">${(state.profile.focus || []).length ? '' : `<button class="g-link" data-a="setupFinish">Skip for now</button>`}<button class="g-btn big-g" data-a="setupFinish">${ic('check', 22)}<span>Start Lumi</span></button></span>
  </div>
</section>`;
  };

  // ---------------------------------------------------------------- Overview: the page Grown-ups opens on
  function weekCount(kinds) {
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = state.log[A.dateKey(d)] || {};
      kinds.forEach((k) => { const v = day[k]; n += v && typeof v === 'object' ? Object.values(v).reduce((a, b) => a + b, 0) : v || 0; });
    }
    return n;
  }
  A.focusWeekHtml = () => {
    const fs = chosen().filter((f) => f.count);
    if (!fs.length) return '';
    return `<div class="fo-week">${fs.map((f) => `<div class="fo-stat" style="--fc:${f.tint};--fi:${f.ink}"><span class="fo-ic sm">${ic(f.icon, 24)}</span><b>${weekCount(f.count)}</b><span>${esc(f.unit)}</span></div>`).join('')}</div>`;
  };
  const ACTIONS_LIST = [
    ['builder', 'calendar', 'Timetable', 'Plan the week'],
    ['cgComingUp', 'hourglass', 'Coming up', 'Prepare for something new'],
    ['cgActivities', 'target', 'Activities', 'Games, words, photo steps'],
    ['cgSensory', 'sliders', 'Sensory', 'Sound, motion, reminders'],
    ['cgProgress', 'chart', 'Progress', 'How it is going'],
    ['cgJournal', 'journal', 'Notes', 'Write what you noticed'],
    ['cgReport', 'upload', 'Share a report', 'One page for school or therapy'],
    ['cgChild', 'person', 'Child', 'Name, age, colours, backup']
  ];
  A.PARENT.cgHome = 'menu';
  A.VOICE.cgHome = () => '';
  A.SCREENS.cgHome = () => {
    const p = state.profile;
    const fs = chosen();
    const daysUsed = (() => { let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (Object.keys(state.log[A.dateKey(d)] || {}).length) n++; } return n; })();
    const told = (state.meTalk || [])[0];
    const face = (f) => (f ? L.face(f, 24) : '');
    return `
<section class="screen grownup" aria-label="Grown-ups overview">
  ${A.gHeader('cgHome')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel scroll ov-child" style="width:330px">
      <div class="ov-kid">${state.childPhoto ? `<img class="ov-photo" src="${state.childPhoto}" alt="">` : `<span class="ov-photo">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'happy', size: 76 })}</span>`}
        <div class="col"><b class="ov-name">${esc(state.childName || 'Your child')}</b><span class="g-note">${esc((D.AGES[p.age] || {}).name || '')} · ${esc(D.LEVELS[p.level] || '')}</span></div></div>
      <h2 class="g-h top-gap">Lumi helps with</h2>
      ${fs.length ? `<div class="ov-focus">${fs.map((f) => `<span class="fo-chip" style="--fc:${f.tint};--fi:${f.ink}">${ic(f.icon, 20)}<span>${esc(f.name)}</span></span>`).join('')}</div>
        <button class="g-btn small outline" data-a="nav" data-to="cgFocus">${ic('pencil', 16)}<span>Change</span></button>`
        : `<button class="ov-pick" data-a="nav" data-to="cgFocus">${ic('target', 30)}<span><b>Choose what Lumi helps with</b><span>Takes 10 seconds</span></span>${ic('chev', 20)}</button>`}
    </div>
    <div class="g-panel grow scroll">
      ${A.gsHtml ? A.gsHtml() : ''}
      <h2 class="g-h">What would you like to do?</h2>
      <div class="ov-actions">${ACTIONS_LIST.map(([to, icon, name, sub]) => `<button class="ov-act" data-a="nav" data-to="${to}"><span class="ov-act-ic">${ic(icon, 30)}</span><span class="ov-act-t"><b>${name}</b><span>${sub}</span></span></button>`).join('')}
        <button class="ov-act try" data-a="nav" data-to="menu"><span class="ov-act-ic">${ic('play', 30)}</span><span class="ov-act-t"><b>Back to Lumi</b><span>Hand the tablet back</span></span></button></div>
    </div>
    <div class="g-panel scroll" style="width:300px">
      <h2 class="g-h">This week</h2>
      <div class="fo-week"><div class="fo-stat"><span class="fo-ic sm">${ic('calendar', 24)}</span><b>${daysUsed}/7</b><span>days with Lumi</span></div></div>
      ${A.focusWeekHtml()}
      ${told ? `<h2 class="g-h top-gap">Told Lumi</h2><div class="ov-told"><b>${esc(told.title)}</b><span class="mt-feel">${face(told.before)}${told.before && told.after ? ic('arrow', 14) : ''}${face(told.after)}</span></div>` : ''}
      <button class="g-link see-all top-gap" data-a="nav" data-to="cgProgress">See all progress ${ic('chev', 14)}</button>
    </div>
  </div>
</section>`;
  };

  Object.assign(A.ACTIONS, {
    fcToggle: (d) => toggleFocus(d.v),
    fcSetup: (d) => toggleFocus(d.v),
    fcSetupBack: () => { S.setupStep = 1; render(); },
    setupFinish: () => { S.setupStep = 1; S.focusMsg = ''; state.setupDone = true; save(); go('menu'); }
  });
  // setup: "Next" goes to step 2 instead of starting straight away
  A.ACTIONS.setupDone = () => { S.setupStep = 2; render(); };
})();
