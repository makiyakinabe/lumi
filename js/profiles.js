/*
  profiles.js
  More than one child on one tablet (for a teacher, therapist, or brothers and sisters).
  Each child has their own Lumi: name, age group, look, timetable, words, stories, stars and progress.
  - "Who is playing?" opens when the app starts and there is more than one child; each child taps their own Lumi.
  - The menu shows a small "Switch" chip with the child's Lumi, so the next child can take a turn.
  - Grown-ups › Child › "Children on this tablet": add a child (they go through setup), switch, or remove.
  Saves: the first child keeps the original save; others are saved under their own key (app.js saveKeyFor).
  Shared by everyone on the tablet: grown-up voice recordings and uploaded music.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { L, S, state, ic, esc, say, render, go } = A;

  // ---------------------------------------------------------------- the list of children
  function reg() {
    let r = null;
    try { r = JSON.parse(localStorage.getItem(A.PROFILE_KEY) || 'null'); } catch (e) { r = null; }
    if (!r || !Array.isArray(r.list) || !r.list.length) r = { current: 'p1', list: [{ id: 'p1' }] };
    if (!r.list.some((p) => p.id === r.current)) r.current = r.list[0].id;
    return r;
  }
  function saveReg(r) { try { localStorage.setItem(A.PROFILE_KEY, JSON.stringify(r)); } catch (e) { /* storage blocked */ } }
  // what we need to show a child on the picker: their name, Lumi's look, photo and age group
  function peek(id) {
    const r = reg();
    let s = null;
    if (id === r.current) s = state;
    else { try { s = JSON.parse(localStorage.getItem(A.saveKeyFor(id)) || 'null'); } catch (e) { s = null; } }
    const n = r.list.findIndex((p) => p.id === id) + 1;
    if (!s) return { id, name: `Child ${n}`, look: null, photo: null, age: null, fresh: true };
    return { id, name: s.childName || `Child ${n}`, look: s.look || null, photo: s.childPhoto || null, age: s.profile && s.profile.age, fresh: !s.setupDone };
  }
  const count = () => reg().list.length;
  A.profileCount = count;
  // start on "Who is playing?" when the tablet is shared
  A.startScreen = () => (count() > 1 ? 'who' : 'menu');

  function resetSession() {
    A.clearTimers();
    Object.assign(S, { day: null, sx: null, tg: null, g: null, cu: null, talk: [], said: false, history: ['menu'], storyDay: null, mode: null, feelPick: null });
  }
  function switchTo(id) {
    const r = reg();
    if (id !== r.current) {
      A.useSave(id);
      r.current = id;
      saveReg(r);
      resetSession();
      A.applyPrefs();
    }
    if (!state.setupDone) { go('setup'); return; }
    go('menu');
    say(state.childName ? `Hello, ${state.childName}!` : 'Hello!');
  }
  function addChild() {
    const r = reg();
    const id = 'p' + Date.now().toString(36);
    r.list.push({ id });
    saveReg(r);
    switchTo(id); // a new child starts with setup (age group, name, colours)
  }
  function removeChild(id) {
    const r = reg();
    if (id === r.current || r.list.length < 2) return;
    try { localStorage.removeItem(A.saveKeyFor(id)); } catch (e) { /* storage blocked */ }
    r.list = r.list.filter((p) => p.id !== id);
    saveReg(r);
  }

  // ---------------------------------------------------------------- "Who is playing?"
  A.PARENT.who = 'menu';
  A.VOICE.who = () => 'Who is playing? Tap your Lumi.';
  A.SCREENS.who = () => {
    const kids = reg().list.map((p) => peek(p.id));
    const cards = kids.map((k) => `<button class="who-card" data-a="whoPick" data-v="${k.id}" aria-label="${esc(k.name)}">
        <span class="who-lumi">${L.svg({ look: Object.assign({}, L.DEFAULT_LOOK, k.look || {}), mood: 'happy', size: 170, label: `${k.name}'s Lumi` })}
          ${k.photo ? `<span class="who-photo"><img src="${k.photo}" alt=""></span>` : ''}</span>
        <span class="who-name">${esc(k.name)}</span>
        ${k.fresh ? '<span class="tag">New</span>' : k.age ? `<span class="tag">${esc((A.D.AGES[k.age] || {}).name || '')}</span>` : ''}
      </button>`).join('');
    return `
<section class="screen who-screen" aria-label="Who is playing?">
  ${A.srTitle('Who is playing?')}
  <div class="row between" style="height:60px">
    <div class="row gap12">${A.speakBtn(A.VOICE.who())}<span class="game-chip" style="background:#FFF1C2;color:#8A6410">${ic('kDuo', 30)}<span>Who is playing?</span></span></div>
    <span></span>
  </div>
  <div class="who-grid n${Math.min(kids.length, 6)} grow">${cards}</div>
</section>`;
  };
  A.GUIDE.who = () => ({ sel: '.who-card', say: 'Tap your Lumi.', delay: 8000 });

  // the "Switch" chip on the menu
  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    if (S.screen !== 'menu' || count() < 2) return;
    const hero = A.stage.querySelector('.menu-hero');
    if (!hero || hero.querySelector('.who-chip')) return;
    hero.insertAdjacentHTML('beforeend', `<button class="who-chip" data-a="nav" data-to="who" aria-label="Switch child">
      <span class="who-chip-lumi">${L.svg({ look: A.lookWith ? A.lookWith({ spark: 'none' }) : state.look, mood: 'happy', size: 46 })}</span><span>Switch</span>${ic('restart', 20)}</button>`);
  };

  // ---------------------------------------------------------------- Grown-ups › Child: children on this tablet
  A.profilesHtml = () => {
    const r = reg();
    const rows = r.list.map((p) => {
      const k = peek(p.id);
      const me = p.id === r.current;
      return `<div class="kid-row ${me ? 'me' : ''}">
        <span class="kid-face">${L.svg({ look: Object.assign({}, L.DEFAULT_LOOK, k.look || {}), mood: 'happy', size: 44 })}</span>
        <span class="grow"><b>${esc(k.name)}</b>${me ? '<span class="tag green">Playing now</span>' : k.fresh ? '<span class="tag">Not set up yet</span>' : ''}</span>
        ${me ? '' : `<button class="g-btn small outline" data-a="kidSwitch" data-v="${p.id}">Switch</button>
          <button class="g-btn small ${S.kidDel === p.id ? 'danger' : 'outline'}" data-a="kidDel" data-v="${p.id}">${S.kidDel === p.id ? 'Tap again to remove' : 'Remove'}</button>`}
      </div>`;
    }).join('');
    return `<h2 class="g-h">Children on this tablet</h2>
      <p class="g-note">For a class, therapy room or brothers and sisters: each child has their own Lumi, timetable, words, stories and progress. When there is more than one, Lumi asks "Who is playing?" when it opens.</p>
      <div class="kid-list">${rows}</div>
      <button class="g-btn small" data-a="kidAdd">${ic('plus', 16)}<span>Add a child</span></button>
      ${S.kidDel ? '<p class="g-note warn-line">Removing a child deletes their progress on this tablet. Save a backup first if you want to keep it.</p>' : ''}`;
  };

  Object.assign(A.ACTIONS, {
    whoPick: (d) => switchTo(d.v),
    kidSwitch: (d) => switchTo(d.v),
    kidAdd: () => addChild(),
    kidDel: (d) => {
      if (S.kidDel !== d.v) { S.kidDel = d.v; render(); return; }
      removeChild(d.v);
      S.kidDel = null;
      render();
    }
  });
})();
