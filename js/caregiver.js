/*
  caregiver.js
  Caregiver mode ("Grown-ups"). Open it by pressing and holding the lock.
  Tabs:
  - Timetable   the weekly timetable builder (in app.js)
  - Activities  target skills, what the child sees, our own photo tutorials, talk-board words
  - Child       name, age group, difficulty, play partner, colour theme, real-life goal
  - Sensory     motion, sound, voice pace, text size, music (including your own track), guide hand, reminders
  - Progress    a weekly progress checker
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, save, render, go, uid, applyPrefs, dots } = A;

  const TABS = [['builder', 'Timetable', 'calendar'], ['cgComingUp', 'Coming up', 'hourglass'], ['cgActivities', 'Activities', 'target'], ['cgChild', 'Child', 'person'], ['cgSensory', 'Sensory', 'sliders'], ['cgProgress', 'Progress', 'chart'], ['cgJournal', 'Journal', 'journal']];
  const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' '); } catch (e) { return ''; } };
  A.gHeader = (active) => `<div class="row between g-header">
    <div class="row gap12">
      <button class="icon-btn sm" data-a="nav" data-to="menu" aria-label="Back to the menu">${ic('back', 22)}</button>
      <div class="col"><h1 class="g-title">Grown-ups</h1><span class="g-sub" title="Lumi uses this tablet's own date, time and time zone">${ic('clock', 13)} <span data-clock="date">${A.longDate()}</span>, <span data-clock="time">${A.fmt(A.fromMin(A.nowMin()))}</span> · ${esc(tz())}</span></div>
    </div>
    <div class="g-tabs" role="tablist">${TABS.map(([id, name, icon]) => `<button class="g-tab ${active === id ? 'on' : ''}" role="tab" aria-selected="${active === id}" data-a="nav" data-to="${id}">${ic(icon, 20)}<span>${name}</span></button>`).join('')}</div>
    <button class="g-btn" data-a="nav" data-to="menu">Done</button>
  </div>`;
  TABS.forEach(([id]) => { A.PARENT[id] = 'menu'; A.VOICE[id] = () => ''; });

  const toggle = (on, action, value, label, extra) => `<button class="check-row" data-a="${action}" data-v="${value}" aria-pressed="${!!on}"><span class="box ${on ? 'on' : ''}">${on ? ic('check', 14) : ''}</span>${extra || ''}<span>${label}</span></button>`;
  const seg = (items, cur, action) => `<div class="seg" role="group">${items.map(([v, label]) => `<button class="seg-opt ${String(cur) === String(v) ? 'on' : ''}" data-a="${action}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${label}</button>`).join('')}</div>`;

  // ================================================================ Activities
  const TILE_NAMES = { day: 'My day', talk: 'Talk', calm: 'Calm', play: 'Games (in Fun)', stories: 'Stories (in Fun)', learn: 'Learn (in Fun)', pet: 'Pet (in Fun)', me: 'Dress up (in Fun)', room: 'Room (in Fun)' };
  function selectedActivity() { return state.customActivities.find((a) => a.id === S.cgAct) || null; }

  A.SCREENS.cgActivities = () => {
    const p = state.profile;
    const skills = Object.keys(D.SKILLS).map((k) => toggle(p.targets[k], 'cgTarget', k, D.SKILLS[k].name, `<span style="color:${D.SKILLS[k].color}">${ic(D.SKILLS[k].icon, 20)}</span>`)).join('');
    const tiles = Object.keys(TILE_NAMES).map((k) => toggle(p.show[k] !== false, 'cgShow', k, TILE_NAMES[k])).join('');
    const games = D.GAMES.map((g) => toggle(p.games[g.id] !== false, 'cgGame', g.id, g.name)).join('')
      + (A.TG ? Object.values(A.TG.defs).filter((d) => d.ages.includes(p.age || 'primary')).map((d) => toggle(p.games[d.id] !== false, 'cgGame', d.id, d.name + ' (with Lumi or together)')).join('') : '');
    const tuts = D.LEARN.map((t) => toggle(A.tutOn(t), 'cgTut', t.id, t.name)).join('');

    // our own activities (photo tutorials)
    const act = selectedActivity();
    const list = state.customActivities.map((a) => `<button class="tl-card ${a.id === S.cgAct ? 'sel-card' : ''}" data-a="cgActSel" data-v="${a.id}"><span class="lib-ic big" style="background:${a.tint || '#F1ECFB'}">${a.photo ? `<img class="step-photo" src="${a.photo}" width="30" height="30" alt="">` : ic(a.icon || 'star', 24)}</span><span class="grow left">${esc(a.name || 'Untitled')}</span><span class="tag">${a.steps.length} steps</span></button>`).join('');
    let editor = `<div class="empty-note">${ic('camera', 40)}<p>Make your own step-by-step activity with real photos.</p><p class="g-note">For example: feeding the cat, using the school toilet, making toast.</p></div>`;
    if (act) {
      editor = `
        <label class="g-field"><span>Name</span><input id="f-act-name" type="text" data-input="actName" value="${esc(act.name)}" maxlength="24" placeholder="Feed the cat"></label>
        <div class="g-field"><span>Skill it practises</span>${seg(Object.keys(D.SKILLS).map((k) => [k, D.SKILLS[k].name.split(' ')[0]]), act.skill, 'cgActSkill')}</div>
        <div class="g-field"><span>Cover picture</span>${photoRow('act-cover', act.photo)}</div>
        <div class="g-field"><span>Steps (one short sentence each)</span>
          <div class="act-steps">${act.steps.map((st, i) => `<div class="act-step"><span class="act-n">${i + 1}</span>
            <label class="photo-box small file-label" title="Add a photo">${st.photo ? `<img src="${st.photo}" alt="">` : ic(st.icon || 'camera', 22)}<input type="file" accept="image/*" data-photo="act-step-${i}"></label>
            <input class="g-input grow" type="text" data-input="act-step-${i}" value="${esc(st.text)}" maxlength="60" placeholder="Step ${i + 1}">
            <button class="mini-btn" data-a="cgStepDel" data-v="${i}" aria-label="Remove step ${i + 1}">${ic('x', 16)}</button></div>`).join('')}</div>
          <button class="g-btn small outline" data-a="cgStepAdd">${ic('plus', 16)}<span>Add a step</span></button>
        </div>
        <div class="row gap8">${toggle(act.on !== false, 'cgActOn', act.id, 'Show in Learn')}<span class="grow"></span>
          <button class="g-btn small outline" data-a="cgActTry">${ic('play', 16)}<span>Try it</span></button>
          <button class="g-btn small outline danger-text" data-a="cgActDel">Delete</button></div>`;
    }

    // talk-board words
    const words = state.myWords.map((w) => `<span class="word-chip">${w.photo ? `<img src="${w.photo}" alt="">` : `<span class="emoji">${esc(w.emoji || '⭐')}</span>`}<span>${esc(w.label)}</span><button class="tag-x" data-a="cgWordDel" data-v="${w.id}" aria-label="Remove ${esc(w.label)}">${ic('x', 12)}</button></span>`).join('');
    const nw = S.newWord || (S.newWord = { label: '', photo: null });

    return `
<section class="screen grownup" aria-label="Activities">
  ${A.gHeader('cgActivities')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel scroll" style="width:300px">
      <h2 class="g-h">Target skills</h2>
      <p class="g-note">Activities for these skills get a star on the child's screens.</p>
      ${skills}
      <h2 class="g-h top-gap">What the child sees</h2>
      ${tiles}
      <div class="g-sub-h">Games</div>${games}
      <div class="g-sub-h">Learn with Lumi</div>${tuts}
    </div>
    <div class="g-panel grow scroll">
      <div class="row between"><h2 class="g-h">Our own activities</h2><button class="g-btn small" data-a="cgActNew">${ic('plus', 16)}<span>New activity</span></button></div>
      <div class="act-list">${list}</div>
      ${editor}
    </div>
    <div class="g-panel scroll" style="width:300px">
      <h2 class="g-h">Talk-board words</h2>
      <p class="g-note">Add family names, favourite foods or places with a real photo. They appear in "My words".</p>
      <div class="row wrap gap8">${words || '<span class="g-note">No words yet.</span>'}</div>
      <label class="g-field"><span>Word</span><input id="f-word" type="text" data-input="wordLabel" value="${esc(nw.label)}" maxlength="20" placeholder="Grandma"></label>
      ${A.LANGS && A.LANGS[state.settings.lang2] ? `<label class="g-field"><span>In ${A.LANGS[state.settings.lang2].name} (optional)</span><input id="f-word-l2" type="text" lang="${A.LANGS[state.settings.lang2].voiceLang}" data-input="wordL2" value="${esc(S.newWordL2 || '')}" maxlength="30" placeholder="${state.settings.lang2 === 'zh' ? '婆婆' : state.settings.lang2 === 'ms' ? 'Nenek' : 'பாட்டி'}"></label>` : ''}
      <div class="g-field"><span>Photo</span>${photoRow('word', nw.photo)}</div>
      <button class="g-btn" data-a="cgWordAdd">${ic('plus', 18)}<span>Add word</span></button>
    </div>
  </div>
</section>`;
  };
  function photoRow(name, photo) {
    return `<div class="photo-row"><span class="photo-box">${photo ? `<img src="${photo}" alt="">` : ic('camera', 28)}</span>
      <div class="col gap8"><label class="g-btn outline file-btn">${ic('camera', 18)}<span>${photo ? 'Change' : 'Add photo'}</span><input type="file" accept="image/*" data-photo="${name}"></label>
      ${photo ? `<button class="g-link" data-a="cgPhotoDel" data-v="${name}">Remove</button>` : ''}</div></div>`;
  }

  // ================================================================ Child: who is playing and how it looks
  // Live bus times for the Bus step. LTA DataMall (the data behind the MyTransport.SG app) needs a free
  // AccountKey and a small relay, because it does not answer browsers directly.
  function busSettings() {
    const b = state.bus;
    const t = S.busTest;
    return `<h2 class="g-h top-gap">Bus times (for the Bus step)</h2>
      ${toggle(b.live, 'cgBusLive', '1', 'Use live bus arrival times from LTA DataMall (the same data as the MyTransport.SG app)')}
      <div class="row gap8">
        <label class="g-field grow"><span>Bus stop number (5 digits, on the bus stop sign)</span><input class="g-input" type="text" inputmode="numeric" maxlength="5" data-input="busStop" value="${esc(b.stop)}" placeholder="e.g. 83139"></label>
        <label class="g-field" style="width:150px"><span>Bus number</span><input class="g-input" type="text" maxlength="5" data-input="busService" value="${esc(b.service)}" placeholder="e.g. 15"></label>
      </div>
      <label class="g-field"><span>Relay link</span><input class="g-input" type="url" data-input="busProxy" value="${esc(b.proxy)}" placeholder="https://your-relay.workers.dev"></label>
      <label class="g-field"><span>AccountKey (only if your relay does not keep it; stays on this tablet)</span><input class="g-input" type="password" data-input="busKey" value="${esc(b.key)}" autocomplete="off"></label>
      <div class="g-field"><span>Minutes to walk to the bus stop (Lumi says when to leave)</span>${seg([[0, 'Off'], [3, '3 min'], [5, '5 min'], [8, '8 min'], [10, '10 min']], b.walk, 'cgBusWalk')}</div>
      <div class="row gap8"><button class="g-btn small outline" data-a="cgBusTest">${ic('busLine', 16)}<span>Check bus times now</span></button>
        ${t ? `<span class="bus-test ${t.ok ? 'ok' : t.ok === false ? 'bad' : ''}">${esc(t.text)}</span>` : ''}</div>
      <p class="g-note">How to set it up: get a free AccountKey from LTA DataMall, then copy tools/bus-relay-worker.js into a free Cloudflare Worker with your key saved as LTA_KEY. Paste the worker's link above. Without live times, the Bus step runs a short practice countdown.</p>`;
  }

  // what the chosen age pack changes, and an offer to load its example timetable
  function packBox() {
    const age = state.profile.age;
    const P = (D.AGE_PACKS || {})[age];
    if (!P) return '';
    const name = D.AGES[age].name;
    return `<div class="pack-box">
      <div class="row between"><b>${esc(name)} pack</b><span class="g-note">Everything can still be changed below.</span></div>
      <ul>${P.summary.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${S.packOffer === age ? `<div class="pack-offer"><span>Also use the ${esc(name)} example timetable? It replaces your current timetable.</span>
        <span class="row gap8"><button class="g-btn small" data-a="cgPackWeek">Use it</button><button class="g-btn small outline" data-a="cgPackNo">Keep mine</button></span></div>`
        : `<button class="g-link" data-a="cgPackAsk">Load the ${esc(name)} example timetable</button>`}
      <p class="g-note">Age sets the look, words and topics. Difficulty (below) is separate, so you can match your child's ability, for example the Teens look on Easy.</p>
    </div>`;
  }

  A.SCREENS.cgChild = () => {
    const p = state.profile;
    const ages = Object.keys(D.AGES).map((k) => `<button class="age-card small ${p.age === k ? 'on' : ''}" data-a="cgAge" data-v="${k}" aria-pressed="${p.age === k}"><span class="age-name">${D.AGES[k].name}</span><span class="age-range">Ages ${D.AGES[k].range}</span><span class="g-note">${D.AGES[k].note}</span></button>`).join('');
    const themes = Object.keys(D.THEMES).map((k) => {
      const t = D.THEMES[k];
      return `<button class="theme-card ${p.theme === k ? 'on' : ''}" data-a="cgTheme" data-v="${k}" aria-pressed="${p.theme === k}" style="background:${t.bg}">
        <span class="theme-mini" style="background:${t.surface}"><span style="background:${t.floor}"></span></span><span class="theme-btn" style="background:${t.accent}"></span><span class="theme-name">${t.name}</span></button>`;
    }).join('');
    const partners = D.PARTNERS.map(([n, e]) => `<button class="partner-chip ${p.partner === n ? 'on' : ''}" data-a="cgPartner" data-v="${n}"><span class="emoji">${e}</span><span>${n}</span></button>`).join('');
    return `
<section class="screen grownup" aria-label="Child">
  ${A.gHeader('cgChild')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel grow scroll">
      ${A.profilesHtml ? A.profilesHtml() : ''}
      <h2 class="g-h top-gap">This child</h2>
      <label class="g-field"><span>Child's name (Lumi says it)</span><input id="f-child" type="text" data-input="childName" value="${esc(state.childName)}" maxlength="20"></label>
      <div class="g-field"><span>Age group (loads that age pack)</span><div class="row gap8">${ages}</div></div>
      ${packBox()}
      <div class="g-field"><span>Difficulty (games, talk-board size, feelings choices, tutorial steps)</span>${seg([[1, 'Easy'], [2, 'Medium'], [3, 'Challenge']], p.level, 'cgLevel')}</div>
      <p class="g-note">${{ 1: 'Easy: 12 talk buttons, 2 feeling choices, 3 matching pairs, 4-piece jigsaws, fewer tutorial steps. My day games are shorter: 2 foods at breakfast, fewer teeth to brush, 2 taps instead of 3 and less rubbing.', 2: 'Medium: 24 talk buttons, 4 feeling choices, 6 pairs, 6-piece jigsaws. My day games are played in full.', 3: 'Challenge: 35 talk buttons and a keyboard, 5 feeling choices, 8 pairs, 9-piece jigsaws, every tutorial step. My day games are played in full with more rubbing and no glowing hints.' }[p.level]}</p>
      <div class="g-field"><span>Usually plays Together with</span><div class="row wrap gap8">${partners}</div></div>
      <div class="g-field"><span>Photos for the main menu (optional, stay on this tablet)</span>
        <div class="row gap24 wrap"><div class="col gap6"><span class="g-note">${esc(state.childName || 'Your child')}</span>${photoRow('child', state.childPhoto)}</div>
        <div class="col gap6"><span class="g-note">${esc(p.partner || 'Play partner')}</span>${photoRow('partner', p.partnerPhoto)}</div></div></div>
      <div class="g-field"><span>Daily goal for the streak (things to do with Lumi each day)</span>${seg([[1, '1 thing'], [2, '2 things'], [3, '3 things'], [5, '5 things']], state.streak.goal, 'cgGoal')}</div>
      <div class="g-field"><span>Rest days (they never break the streak)</span><div class="row gap6">${D.DAYS.map((d) => { const on = (state.streak.restDays || []).includes(d.id); return `<button class="partner-chip ${on ? 'on' : ''}" data-a="cgRest" data-v="${d.id}" aria-pressed="${on}"><span>${d.short}</span></button>`; }).join('')}</div></div>
      <p class="g-note">${ic('flame', 16)} Streak now: <b>${state.streak.count}</b> · best: <b>${state.streak.best || 0}</b> · shields: <b>${state.streak.shields || 0}</b> (one more every Monday, up to 2). Missing a day never shows "you lost": Lumi just says "let's start a new streak".</p>
      ${busSettings()}
      <div class="g-field"><span>Real-life goal (stars count towards it)</span>
        <div class="row gap8"><input id="f-goal" class="g-input grow" type="text" data-input="goalName" value="${esc(state.goal.name)}" maxlength="24">
        <button class="mini-btn bordered" data-a="bGoal" data-v="-5" aria-label="Fewer">${ic('minus', 16)}</button><span class="row gap4 g-strong">${ic('star', 18)}${state.goal.target}</span><button class="mini-btn bordered" data-a="bGoal" data-v="5" aria-label="More">${ic('plus', 16)}</button></div></div>
    </div>
    <div class="g-panel scroll" style="width:440px">
      <h2 class="g-h">Colours</h2>
      <p class="g-note">Lumi is always drawn soft and round. Pick the colours that suit your child best: "Soft (low colour)" and "Stone" are the calmest.</p>
      <div class="colour-grid three">${A.colourCards(p.theme, 'cgTheme')}</div>
      ${A.offlineHtml ? A.offlineHtml() : ''}
      ${A.nativeNotifyHtml ? A.nativeNotifyHtml() : ''}
      ${A.appIconHtml ? A.appIconHtml() : ''}
      ${A.privacyHtml ? A.privacyHtml() : ''}
      <span class="grow"></span>
      <button class="g-btn danger" data-a="bReset">${S.confirmReset ? 'Tap again to reset everything' : 'Reset all progress'}</button>
    </div>
  </div>
</section>`;
  };

  // ================================================================ Sensory
  A.SCREENS.cgSensory = () => {
    const st = state.settings;
    const r = state.reminders;
    const rem = (r.list || []).map((it) => `<div class="rem-row"><span class="emoji">${esc(it.e)}</span><span class="grow">${esc(it.text)}</span><span class="tag">${it.every ? 'every ' + it.every + ' min' : 'at ' + A.fmt(it.at)}</span><button class="mini-btn" data-a="cgRemDel" data-v="${it.id}" aria-label="Remove">${ic('x', 16)}</button></div>`).join('');
    const nr = S.newRem || (S.newRem = { e: '💧', text: '', mode: 'every', every: 60, at: '08:00' });
    return `
<section class="screen grownup" aria-label="Sensory and comfort">
  ${A.gHeader('cgSensory')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel grow scroll">
      <div class="qz-banner">${ic('sliders', 30)}<span class="grow"><b>Not sure what to choose?</b><span>${state.sensory && state.sensory.done ? 'You answered the quick-start. Answer again any time.' : 'Answer 5 quick questions and Lumi sets these for you.'}</span></span><button class="g-btn small" data-a="qzOpen" data-v="cgSensory">${state.sensory && state.sensory.done ? 'Answer again' : 'Start'}</button></div>
      <h2 class="g-h top-gap">Sight and motion</h2>
      ${toggle(st.reduceMotion, 'bToggle', 'reduceMotion', 'Reduce animation (no bouncing or moving backgrounds)')}
      ${toggle(st.highContrast, 'bToggle', 'highContrast', 'High contrast (darker outlines and text, stronger colours)')}
      ${toggle(st.tapMove, 'bToggle', 'tapMove', 'Tap instead of drag: tap a thing, then tap where it goes (and tap to rub). For children who find dragging hard. "Do it with me" in Learn helps with any step.')}
      <div class="g-field"><span>Text size</span>${seg([[0.9, 'Small'], [1, 'Normal'], [1.15, 'Large'], [1.3, 'Extra large']], st.textSize, 'cgText')}</div>
      <h2 class="g-h top-gap">Sound and voice</h2>
      ${toggle(st.sounds, 'bToggle', 'sounds', 'Sounds and chimes')}
      ${toggle(st.voice, 'bToggle', 'voice', "Lumi's voice")}
      <div class="g-field"><span>Lumi's voice (tap one to hear it)</span>${A.voicePickerHtml ? A.voicePickerHtml({ size: 40, cls: 'grown', subs: true }) : ''}</div>
      ${toggle(st.childVoice, 'bToggle', 'childVoice', 'Child can choose the voice in the Pause menu')}
      <button class="fv-entry" data-a="nav" data-to="cgVoice">${ic('heart', 26)}<span class="grow"><b>Your own voice for Lumi</b><span>${A.familiarCount ? (() => { const c = A.familiarCount(); return c.have ? `${c.have} of ${c.total} lines recorded` : 'Record key lines so your child hears you'; })() : ''}</span></span>${ic('chev', 22)}</button>
      <p class="g-note">Voices come from the tablet. To add more on an iPad: Settings › Accessibility › Spoken Content › Voices. On Android: Settings › Text-to-speech.</p>
      ${toggle(st.speakWords, 'bToggle', 'speakWords', 'Talk board says each word when tapped')}
      ${A.langSettingsHtml ? A.langSettingsHtml() : ''}
      <div class="g-field"><span>Chat with Lumi: Lumi listens with the microphone</span>${seg([['off', 'Off'], ['on', 'On']], st.chatMic === true ? 'on' : 'off', 'cgChatMic')}</div>
      <p class="g-note">${A.chatMicAvailable && A.chatMicAvailable() ? 'Off unless you turn it on. The tablet\'s speech service may send the sound to Apple or Google to turn it into words; Lumi saves nothing. Picture chat always works without the microphone.' : 'This browser cannot listen. Picture chat still works. Chrome or Safari on the tablet can listen.'}</p>
      <div class="g-field"><span>Voice pace</span><div class="row gap8">${seg([[0.7, 'Slow'], [0.85, 'Calm'], [1, 'Normal'], [1.15, 'Quick']], st.voiceRate, 'cgRate')}<button class="g-btn small outline" data-a="cgTestVoice">${ic('speaker', 16)}<span>Test</span></button></div></div>
      <div class="g-field"><span>Music volume</span>${seg([[0.3, 'Quiet'], [0.6, 'Medium'], [0.9, 'Loud']], st.musicVolume, 'cgVol')}</div>
      <div class="g-field"><span>Child's favourite music (plays in the calm corner as "My music")</span>
        <div class="row gap8"><label class="g-btn outline file-btn">${ic('upload', 18)}<span>Upload a song</span><input type="file" accept="audio/*" data-file="music"></label>
        <span class="g-note" id="mineName">${S.mineName ? esc(S.mineName) : 'No song yet'}</span>
        ${S.mineName ? `<button class="g-btn small outline" data-a="music" data-v="mine">${ic(window.LumiAudio && window.LumiAudio.playing === 'mine' ? 'pauseFill' : 'playPause', 14)}<span>Play</span></button><button class="g-link" data-a="cgMineDel">Remove</button>` : ''}</div></div>
      <h2 class="g-h top-gap">Play and breaks</h2>
      ${toggle(st.watchFirst !== false, 'bToggle', 'watchFirst', 'Learn with Lumi: Lumi shows each step first, then the child tries (watch, then do)')}
      ${toggle(st.stepGames !== false, 'bToggle', 'stepGames', 'Full Lumi games for every part of the day (off: a quicker "do it with Lumi" version)')}
      <div class="g-field"><span>How routine steps work</span>${seg([['play', 'Play with Lumi first'], ['tasks', 'Task checklist (Teens)']], state.profile.routineMode || 'play', 'cgRoutineMode')}</div>
      <div class="g-field"><span>Reading time in My day</span>${seg([['choose', 'Child chooses'], ['own', 'Their own book'], ['story', 'A Lumi story']], st.reading || 'choose', 'cgReading')}</div>
      <p class="g-note">A Lumi story opens today's story from the Stories shelf (a new one each day). Your child can also pick another one.</p>
      ${toggle(st.breakBtn !== false, 'bToggle', 'breakBtn', 'Show the Break button on every child screen')}
      ${toggle(st.moveBreak !== false, 'cgMoveOn', 'moveBreak', 'Movement breaks: "Move with Lumi" on the Break screen')}
      ${st.moveBreak !== false ? `<div class="g-field"><span>Which moves</span>${seg([['choose', 'Child chooses'], ['calm', 'Calm moves (push, stretch, squeeze)'], ['energy', 'Energy moves (jump, march, shake)']], st.moveKind || 'choose', 'cgMoveKind')}</div>
      ${toggle(!!st.moveSeated, 'bToggle', 'moveSeated', 'Seated moves only (every move has a sitting version)')}
      <p class="g-note">Calm moves help a body that is too busy settle; energy moves wake up a tired or fidgety body. Lumi always offers moving as a choice. If your child is very upset, breathing and quiet come first.</p>` : ''}
      ${toggle(st.buddy !== false, 'bToggle', 'buddy', 'Our pets walk with Lumi on every screen')}
      <p class="g-note">Breaks are never counted as a problem. Each one shows in Progress, so you can see when and where your child needs a pause.</p>
      <h2 class="g-h top-gap">Guide hand</h2>
      ${toggle(st.guide, 'bToggle', 'guide', 'Glow and a tapping hand show what to press next')}
      <div class="g-field"><span>Show the hand after</span>${seg([[3, '3 seconds'], [6, '6 seconds'], [10, '10 seconds']], st.guideDelay, 'bDelay')}</div>
    </div>
    <div class="g-panel scroll" style="width:430px">
      <h2 class="g-h">Gentle reminders</h2>
      <p class="g-note">A small banner slides in at the top with a soft chime. It never stops play.</p>
      ${toggle(r.next, 'cgRemNext', 'next', 'Remind before the next timetable step (10 minutes before)')}
      <div class="g-field"><span>Break reminder after</span>${seg([[0, 'Off'], [10, '10 min'], [20, '20 min'], [30, '30 min']], r.breakMin, 'cgBreak')}</div>
      <div class="g-sub-h">Our reminders</div>
      ${rem || '<p class="g-note">None yet.</p>'}
      <div class="g-sub-h">Add a reminder</div>
      <div class="row gap6 wrap">${D.REMINDER_IDEAS.map(([e, t]) => `<button class="partner-chip" data-a="cgRemIdea" data-v="${e}|${t}"><span class="emoji">${e}</span><span>${t}</span></button>`).join('')}</div>
      <label class="g-field"><span>Text</span><input id="f-rem" type="text" data-input="remText" value="${esc(nr.text)}" maxlength="40" placeholder="Drink some water"></label>
      <div class="row gap8">${seg([['every', 'Every'], ['at', 'At a time']], nr.mode, 'cgRemMode')}
        ${nr.mode === 'every' ? seg([[30, '30 min'], [60, '1 hour'], [120, '2 hours']], nr.every, 'cgRemEvery') : `<input class="g-input" type="time" data-input="remAt" value="${nr.at}">`}</div>
      <div class="row gap8"><button class="g-btn" data-a="cgRemAdd">${ic('plus', 18)}<span>Add</span></button><button class="g-btn outline" data-a="cgRemTest">${ic('bell', 18)}<span>Test a reminder</span></button></div>
    </div>
  </div>
</section>`;
  };
  A.ENTER.cgSensory = () => {
    if (window.LumiAudio) window.LumiAudio.getMineName().then((n) => { if (n !== S.mineName) { S.mineName = n; if (S.screen === 'cgSensory') render(); } });
  };

  // ================================================================ Progress checker
  function lastDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ key: A.dateKey(d), label: D.DAYS[(d.getDay() + 6) % 7].short, data: state.log[A.dateKey(d)] || {} });
    }
    return out;
  }
  const sumOf = (days, k) => days.reduce((t, d) => {
    const v = d.data[k];
    return t + (v && typeof v === 'object' ? Object.values(v).reduce((a, b) => a + b, 0) : v || 0);
  }, 0);
  function barChart(title, days, key, color) {
    const W = 330;
    const H = 150;
    const vals = days.map((d) => d.data[key] || 0);
    const max = Math.max(4, ...vals);
    const bw = 30;
    const gap = (W - 30 - bw * days.length) / (days.length - 1);
    const y = (v) => H - 22 - (v / max) * (H - 40);
    const grid = [0, Math.round(max / 2), max].map((g) => `<line x1="24" x2="${W}" y1="${y(g)}" y2="${y(g)}" stroke="#EDE5D8" stroke-width="1"/><text x="18" y="${y(g) + 4}" text-anchor="end" font-size="11" fill="#6B5A4E">${g}</text>`).join('');
    const bars = days.map((d, i) => {
      const v = vals[i];
      const x = 30 + i * (bw + gap);
      const top = y(v);
      const h = H - 22 - top;
      const shape = v > 0 ? `<path d="M${x} ${H - 22} V${top + 4} q0 -4 4 -4 h${bw - 8} q4 0 4 4 V${H - 22} Z" fill="${color}"/>` : '';
      const today = i === days.length - 1;
      return `<g class="bar-g"><title>${d.label}: ${v}</title><rect x="${x - gap / 2}" y="0" width="${bw + gap}" height="${H}" fill="transparent"/>${shape}
        ${today && v > 0 ? `<text x="${x + bw / 2}" y="${top - 6}" text-anchor="middle" font-size="12" font-weight="800" fill="#3B2F2F">${v}</text>` : ''}
        <text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="11" fill="${today ? '#3B2F2F' : '#6B5A4E'}" font-weight="${today ? 800 : 600}">${today ? 'Today' : d.label}</text></g>`;
    }).join('');
    return `<figure class="chart"><figcaption class="g-sub-h">${title}</figcaption><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}: ${days.map((d, i) => d.label + ' ' + vals[i]).join(', ')}">${grid}${bars}</svg></figure>`;
  }
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; };
  const EVENT_NAMES = { breaks: 'Asked for a break during', steps: 'Finished a step', parts: 'Finished part of the day', checklists: 'Got ready (checklist)', talk: 'Said', calm: 'Calmed down with', feelings: 'Felt', changes: 'Handled a change', games: 'Played', tutorials: 'Learned', together: 'Together:', petCare: 'Pet care:', comingUp: 'Coming up story:', moveBreak: 'Moved with Lumi:', meTalk: 'Told Lumi how they feel:' };
  const SKILL_EVENTS = { routines: ['steps', 'checklists', 'parts'], communication: ['talk'], emotions: ['calm', 'feelings', 'changes'], lifeskills: ['tutorials', 'petCare'], social: ['together'], thinking: ['games'] };

  const pct = (a, b) => (a + b ? Math.round((a / (a + b)) * 100) : null);
  const goalDays = (days) => days.filter((d) => (state.streak.days || []).includes(d.key)).length;
  function perfTiles(week, prev) {
    const acc = pct(sumOf(week, 'correct'), sumOf(week, 'tries'));
    const accP = pct(sumOf(prev, 'correct'), sumOf(prev, 'tries'));
    const hints = sumOf(week, 'hints');
    const hintsP = sumOf(prev, 'hints');
    const mins = sumOf(week, 'minutes');
    const tile = (icon, num, label, diff) => `<div class="stat-tile perf"><span class="stat-ic">${ic(icon, 22)}</span><span class="stat-num">${num}</span><span class="stat-label">${label}</span><span class="stat-diff">${diff}</span></div>`;
    return tile('target', acc === null ? '–' : acc + '%', 'Right first try', accP === null ? 'feelings, sorting, patterns, tutorials' : `was ${accP}% last week`) +
      tile('hand', hints, 'Guide hand needed', hints < hintsP ? `down from ${hintsP}: more independent` : `last week ${hintsP}`) +
      tile('clock', mins, 'Minutes using Lumi', `about ${Math.round(mins / 7)} a day`) +
      tile('flame', `${goalDays(week)}/7`, 'Daily goal reached', `streak ${state.streak.count}, best ${state.streak.best || 0}`);
  }
  function insights(week, prev) {
    const out = [];
    const cmp = (k, label) => {
      const a = sumOf(week, k);
      const b = sumOf(prev, k);
      if (a > b && a > 0) out.push(`${ic('up', 16)} ${label}: <b>${a}</b> this week, up from ${b}.`);
      else if (b > a && b > 2) out.push(`${ic('down', 16)} ${label}: <b>${a}</b> this week, down from ${b}. It may help to practise this together.`);
    };
    cmp('steps', 'Routine steps finished');
    cmp('checklists', 'Got ready with the checklist');
    cmp('talk', 'Talk-board messages');
    const h = sumOf(week, 'hints');
    const hp = sumOf(prev, 'hints');
    if (hp > 0 && h < hp) out.push(`${ic('hand', 16)} Needed the guide hand less often (${h} vs ${hp}): a sign of growing independence.`);
    const feels = {};
    week.forEach((d) => Object.entries(d.data.feelings || {}).forEach(([f, n]) => { feels[f] = (feels[f] || 0) + n; }));
    const top = Object.entries(feels).sort((a, b) => b[1] - a[1])[0];
    if (top) out.push(`${ic('heart', 16)} Most shared feeling: <b>${top[0]}</b> (${top[1]} times).`);
    const newBadges = Object.entries(state.badgeDates || {}).filter(([, k]) => week.some((d) => d.key === k)).map(([id]) => (D.SKILL_BADGES.find((b) => b.id === id) || {}).name).filter(Boolean);
    if (newBadges.length) out.push(`${ic('medal', 16)} New skills this week: <b>${newBadges.map(esc).join(', ')}</b>.`);
    if (!out.length) out.push('Not much to compare yet. Play a few days with Lumi and the trends will show here.');
    return out;
  }
  A.SCREENS.cgProgress = () => {
    const week = lastDays(7);
    const prev = lastDays(14).slice(0, 7);
    const tiles = [['steps', 'Routine steps', 'calendar'], ['checklists', 'Got ready', 'check'], ['talk', 'Talk messages', 'chat'], ['calm', 'Calm moments', 'cloud'], ['tutorials', 'Learn tasks', 'learn'], ['together', 'Together', 'together'], ['games', 'Games', 'puzzle'], ['petCare', 'Pet care', 'paw']].map(([k, label, icon]) => {
      const now = sumOf(week, k);
      const before = sumOf(prev, k);
      const diff = now - before;
      return `<div class="stat-tile"><span class="stat-ic">${ic(icon, 22)}</span><span class="stat-num">${now}</span><span class="stat-label">${label}</span><span class="stat-diff">${diff === 0 ? 'same as last week' : (diff > 0 ? '+' : '') + diff + ' vs last week'}</span></div>`;
    }).join('');
    const skills = Object.keys(D.SKILLS).map((k) => {
      const n = SKILL_EVENTS[k].reduce((t, e) => t + sumOf(week, e), 0);
      const pct = Math.min(100, Math.round((n / 15) * 100));
      const focus = state.profile.targets[k];
      return `<div class="skill-row"><span class="skill-name">${ic(D.SKILLS[k].icon, 18)}<span>${D.SKILLS[k].name}</span>${focus ? '<span class="tag green">Target</span>' : ''}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${D.SKILLS[k].color}"></div></div><span class="skill-n">${n}</span></div>`;
    }).join('');
    const feels = {};
    week.forEach((d) => Object.entries(d.data.feelings || {}).forEach(([f, n]) => { feels[f] = (feels[f] || 0) + n; }));
    const feelHtml = Object.keys(feels).length
      ? Object.entries(feels).sort((a, b) => b[1] - a[1]).map(([f, n]) => `<span class="feel-count">${D.FEELINGS[f] ? L.face(f, 40) : `<span class="emoji" style="font-size:32px">${f === 'tired' ? '😴' : '💬'}</span>`}<span>${f}</span><b>${n}</b></span>`).join('')
      : '<p class="g-note">No feelings shared this week yet.</p>';
    const events = state.events.slice(0, 14).map((e) => `<li><span class="ev-time">${ago(e.t)}</span><span>${EVENT_NAMES[e.kind] || e.kind} ${esc(e.detail || '')}</span></li>`).join('');
    return `
<section class="screen grownup" aria-label="Progress">
  ${A.gHeader('cgProgress')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel grow scroll">
      <div class="row between"><h2 class="g-h">How ${esc(state.childName || 'your child')} is doing</h2><span class="g-note">Last 7 days compared with the 7 days before</span></div>
      <ul class="insights">${insights(week, prev).map((t) => `<li>${t}</li>`).join('')}</ul>
      ${A.feelChartHtml ? A.feelChartHtml() : ''}
      <div class="stat-grid">${perfTiles(week, prev)}</div>
      <div class="row between top-gap"><h2 class="g-h">What ${esc(state.childName || 'they')} did</h2><span class="g-note">${state.stats.totalEarned} stars earned in total</span></div>
      <div class="stat-grid">${tiles}</div>
      <div class="row gap16 wrap">${barChart('Routine steps per day', week, 'steps', 'var(--teal)')}${barChart('Minutes using Lumi per day', week, 'minutes', '#7E64C8')}</div>
    </div>
    <div class="g-panel scroll" style="width:400px">
      <h2 class="g-h">Skills this week</h2>
      ${skills}
      <h2 class="g-h top-gap">Feelings shared</h2>
      <div class="row wrap gap8">${feelHtml}</div>
      ${A.meTalkHtml ? A.meTalkHtml() : ''}
      <h2 class="g-h top-gap">Recent activity</h2>
      <ul class="ev-list">${events || '<li class="g-note">Nothing yet. Play a little and come back!</li>'}</ul>
    </div>
  </div>
</section>`;
  };

  // ================================================================ inputs and photos from these tabs
  const prevInput = A.onInput;
  A.onInput = (key, v, el) => {
    if (prevInput) prevInput(key, v, el);
    const act = selectedActivity();
    if (key === 'actName' && act) { act.name = v; save(); }
    const m = /^act-step-(\d+)$/.exec(key);
    if (m && act && act.steps[Number(m[1])]) { act.steps[Number(m[1])].text = v; save(); }
    if (key === 'wordLabel') S.newWord.label = v;
    if (key === 'remText') S.newRem.text = v;
    if (key === 'busStop') state.bus.stop = v.replace(/\D/g, '').slice(0, 5);
    if (key === 'busService') state.bus.service = v.trim().toUpperCase();
    if (key === 'busProxy') state.bus.proxy = v.trim();
    if (key === 'busKey') state.bus.key = v.trim();
    if (key === 'remAt') S.newRem.at = v;
  };
  A.onPhoto = (name, url) => {
    const act = selectedActivity();
    if (name === 'act-cover' && act) act.photo = url;
    const m = /^act-step-(\d+)$/.exec(name);
    if (m && act) act.steps[Number(m[1])].photo = url;
    if (name === 'word') S.newWord.photo = url;
    if (name === 'child') state.childPhoto = url;
    if (name === 'partner') state.profile.partnerPhoto = url;
    save();
    render();
  };
  A.onFile = (name, file) => {
    if (name !== 'music' || !window.LumiAudio) return;
    S.mineName = file.name;
    window.LumiAudio.saveMine(file).then(() => render());
    render();
  };

  // ================================================================ actions
  Object.assign(A.ACTIONS, {
    cgBusLive: () => { state.bus.live = !state.bus.live; save(); render(); },
    cgBusWalk: (d) => { state.bus.walk = Number(d.v); save(); render(); },
    cgBusTest: () => {
      S.busTest = { text: 'Checking…' };
      render();
      A.busFetch().then((r) => {
        S.busTest = { ok: true, text: `Bus ${r.service}: ${r.mins === 0 ? 'arriving now' : r.mins + ' min'}${r.next != null ? ', then ' + r.next + ' min' : ''}. It works!` };
      }).catch((e) => {
        const msg = String((e && e.message) || e);
        S.busTest = { ok: false, text: /Failed to fetch|NetworkError|Load failed/i.test(msg) ? 'Could not reach the relay. Check the link (LTA does not allow tablets to ask directly).' : msg };
      }).then(() => { if (S.screen === 'cgChild') render(); });
    },
    cgGoal: (d) => { state.streak.goal = Number(d.v); save(); render(); },
    cgRest: (d) => {
      const r = state.streak.restDays || (state.streak.restDays = []);
      const i = r.indexOf(d.v);
      if (i >= 0) r.splice(i, 1); else r.push(d.v);
      save();
      render();
    },
    cgTarget: (d) => { state.profile.targets[d.v] = !state.profile.targets[d.v]; save(); render(); },
    cgShow: (d) => { state.profile.show[d.v] = state.profile.show[d.v] === false; save(); render(); },
    cgGame: (d) => { state.profile.games[d.v] = state.profile.games[d.v] === false; save(); render(); },
    cgTut: (d) => { state.profile.tutorials[d.v] = !A.tutOn(D.LEARN.find((t) => t.id === d.v)); save(); render(); },
    cgActNew: () => {
      const a = { id: 'act' + uid(), name: '', skill: 'lifeskills', icon: 'star', photo: null, tint: '#F1ECFB', on: true, steps: [{ text: '', photo: null }, { text: '', photo: null }] };
      state.customActivities.push(a);
      S.cgAct = a.id;
      save();
      render();
      const f = document.getElementById('f-act-name');
      if (f) f.focus();
    },
    cgActSel: (d) => { S.cgAct = d.v; render(); },
    cgActSkill: (d) => { const a = selectedActivity(); if (a) { a.skill = d.v; save(); render(); } },
    cgActOn: () => { const a = selectedActivity(); if (a) { a.on = a.on === false; save(); render(); } },
    cgStepAdd: () => { const a = selectedActivity(); if (a && a.steps.length < 12) { a.steps.push({ text: '', photo: null }); save(); render(); } },
    cgStepDel: (d) => { const a = selectedActivity(); if (a && a.steps.length > 1) { a.steps.splice(Number(d.v), 1); save(); render(); } },
    cgActDel: () => {
      if (!S.cgConfirmDel) { S.cgConfirmDel = true; say(''); A.showToast('<span>Tap Delete again to remove it</span>', 'toast-g'); setTimeout(() => { S.cgConfirmDel = false; }, 3000); return; }
      state.customActivities = state.customActivities.filter((a) => a.id !== S.cgAct);
      S.cgAct = null;
      S.cgConfirmDel = false;
      save();
      render();
    },
    cgActTry: () => {
      const a = selectedActivity();
      if (!a) return;
      a.steps = a.steps.filter((s) => s.text.trim() || s.photo);
      if (!a.name.trim()) a.name = 'Our activity';
      if (!a.steps.length) { A.showToast('<span>Add at least one step</span>', 'toast-g'); a.steps.push({ text: '', photo: null }); render(); return; }
      a.on = true;
      save();
      A.ACTIONS.lesOpen({ v: a.id });
    },
    cgPhotoDel: (d) => {
      const a = selectedActivity();
      if (d.v === 'act-cover' && a) a.photo = null;
      if (d.v === 'word') S.newWord.photo = null;
      if (d.v === 'child') state.childPhoto = null;
      if (d.v === 'partner') state.profile.partnerPhoto = null;
      save();
      render();
    },
    cgWordAdd: () => {
      const w = S.newWord;
      if (!w.label.trim()) { const f = document.getElementById('f-word'); if (f) f.focus(); return; }
      const nw2 = { id: 'w' + uid(), label: w.label.trim(), photo: w.photo, emoji: w.photo ? null : '⭐', t: 'misc' };
      if (state.settings.lang2 && (S.newWordL2 || '').trim()) nw2.l2 = { [state.settings.lang2]: S.newWordL2.trim() };
      state.myWords.push(nw2);
      S.newWord = { label: '', photo: null };
      S.newWordL2 = '';
      save();
      render();
    },
    cgWordDel: (d) => { state.myWords = state.myWords.filter((w) => w.id !== d.v); save(); render(); },
    cgAge: (d) => {
      // loads the age pack (look, difficulty, voice, activities, routine style); the timetable is offered separately
      A.applyAgePack(d.v, { week: false });
      S.packOffer = d.v;
      render();
    },
    cgPackAsk: () => { S.packOffer = state.profile.age; render(); },
    cgPackNo: () => { S.packOffer = null; render(); },
    cgPackWeek: () => { A.applyAgePack(state.profile.age, { week: true }); S.packOffer = null; A.showToast('Timetable updated for ' + D.AGES[state.profile.age].name); render(); },
    cgRoutineMode: (d) => { state.profile.routineMode = d.v; save(); render(); },
    cgLevel: (d) => { state.profile.level = Number(d.v); save(); A.applyPrefs(); render(); },
    cgChatMic: (d) => { if (d.v === 'on' && state.settings.chatMic !== true && A.parentGate) { A.parentGate(() => { state.settings.chatMic = true; save(); render(); }, 'Turn on the microphone'); return; } state.settings.chatMic = d.v === 'on'; save(); render(); },
    cgMoveOn: () => { state.settings.moveBreak = state.settings.moveBreak === false; save(); render(); },
    cgMoveKind: (d) => { state.settings.moveKind = d.v; save(); render(); },
    cgReading: (d) => { state.settings.reading = d.v; save(); render(); },
    cgPartner: (d) => { state.profile.partner = d.v; save(); render(); },
    cgTheme: (d) => { state.profile.theme = d.v; save(); applyPrefs(); render(); },
    cgText: (d) => { state.settings.textSize = Number(d.v); save(); applyPrefs(); render(); },
    cgRate: (d) => { state.settings.voiceRate = Number(d.v); save(); render(); say('Hello! This is how I sound.'); },
    cgTestVoice: () => say(`Hello${state.childName ? ' ' + state.childName : ''}! I'm Lumi.`),
    cgVol: (d) => { state.settings.musicVolume = Number(d.v); save(); applyPrefs(); render(); },
    cgMineDel: () => { window.LumiAudio.removeMine().then(() => { S.mineName = null; render(); }); },
    cgRemNext: () => { state.reminders.next = !state.reminders.next; save(); render(); },
    cgBreak: (d) => { state.reminders.breakMin = Number(d.v); S.lastBreak = Date.now(); save(); render(); },
    cgRemIdea: (d) => { const [e, t] = d.v.split('|'); S.newRem.e = e; S.newRem.text = t; render(); },
    cgRemMode: (d) => { S.newRem.mode = d.v; render(); },
    cgRemEvery: (d) => { S.newRem.every = Number(d.v); render(); },
    cgRemAdd: () => {
      const n = S.newRem;
      if (!n.text.trim()) { const f = document.getElementById('f-rem'); if (f) f.focus(); return; }
      const it = { id: 'r' + uid(), e: n.e || '🔔', text: n.text.trim() };
      if (n.mode === 'every') it.every = n.every; else it.at = n.at;
      state.reminders.list.push(it);
      S.newRem = { e: '💧', text: '', mode: 'every', every: 60, at: '08:00' };
      save();
      render();
    },
    cgRemDel: (d) => { state.reminders.list = state.reminders.list.filter((x) => x.id !== d.v); save(); render(); },
    cgRemTest: () => {
      const n = S.newRem;
      A.showReminder(A.emojiArt(n.e || '💧'), n.text || 'Drink some water');
    }
  });

  // ================================================================ Observation journal
  const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  function todaySummary() {
    const day = state.log[A.dateKey()] || {};
    const parts = [];
    const add = (k, label) => { if (day[k]) parts.push(`${day[k]} ${label}`); };
    add('steps', 'routine steps');
    add('checklists', 'checklists');
    add('talk', 'talk messages');
    add('calm', 'calm-downs');
    add('tutorials', 'tutorials');
    add('stories', 'stories');
    add('games', 'games');
    add('together', 'together activities');
    const f = Object.entries(day.feelings || {}).map(([k, n]) => `${k} ×${n}`).join(', ');
    if (f) parts.push(`felt ${f}`);
    if (day.hints) parts.push(`guide hand ${day.hints}×`);
    if (day.minutes) parts.push(`${day.minutes} min`);
    return parts.length ? 'In Lumi today: ' + parts.join(', ') + '.' : '';
  }
  const jDraft = () => S.jDraft || (S.jDraft = { when: nowLocal(), mood: null, tags: [], note: '', photo: null, summary: true });
  const fmtWhen = (w) => { const d = new Date(w); return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
  function exportText() {
    return `Lumi observation journal${state.childName ? ' for ' + state.childName : ''}\n\n` + state.journal.map((j) => {
      const m = D.JOURNAL_MOODS.find((x) => x[0] === j.mood);
      return `${fmtWhen(j.when)}${m ? ' — ' + m[2] : ''}${j.tags.length ? ' [' + j.tags.join(', ') + ']' : ''}\n${j.note || ''}${j.summary ? '\n' + j.summary : ''}`;
    }).join('\n\n');
  }
  A.SCREENS.cgJournal = () => {
    const dr = jDraft();
    const sum = todaySummary();
    const filter = S.jFilter || 'All';
    const counts = {};
    state.journal.forEach((j) => j.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const list = state.journal.filter((j) => filter === 'All' || j.tags.includes(filter)).map((j) => {
      const m = D.JOURNAL_MOODS.find((x) => x[0] === j.mood);
      return `<article class="j-entry">
        <div class="row between"><span class="j-when">${m ? `<span class="emoji">${m[1]}</span>` : ''}<b>${esc(fmtWhen(j.when))}</b>${m ? `<span class="g-note">${m[2]}</span>` : ''}</span>
          <button class="g-link" data-a="jDel" data-v="${j.id}">${S.jConfirm === j.id ? 'Tap again to delete' : 'Delete'}</button></div>
        ${j.tags.length ? `<div class="row gap6 wrap">${j.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="row gap12">${j.photo ? `<img class="j-photo" src="${j.photo}" alt="">` : ''}<div class="col gap4 grow">${j.note ? `<p class="j-note">${esc(j.note)}</p>` : ''}${j.summary ? `<p class="g-note">${ic('chart', 14)} ${esc(j.summary)}</p>` : ''}</div></div>
      </article>`;
    }).join('');
    return `
<section class="screen grownup" aria-label="Observation journal">
  ${A.gHeader('cgJournal')}
  <div class="row gap16 grow" style="align-items:stretch">
    <div class="g-panel scroll" style="width:430px">
      <h2 class="g-h">New observation</h2>
      <label class="g-field"><span>When</span><input class="g-input" type="datetime-local" data-input="jWhen" value="${esc(dr.when)}"></label>
      <div class="g-field"><span>How was ${esc(state.childName || 'your child')}?</span><div class="row gap6">${D.JOURNAL_MOODS.map(([id, e, label]) => `<button class="mood-btn ${dr.mood === id ? 'on' : ''}" data-a="jMood" data-v="${id}" aria-pressed="${dr.mood === id}"><span class="emoji">${e}</span><span>${label}</span></button>`).join('')}</div></div>
      <div class="g-field"><span>Tags</span><div class="row gap6 wrap">${D.JOURNAL_TAGS.map((t) => `<button class="partner-chip small ${dr.tags.includes(t) ? 'on' : ''}" data-a="jTag" data-v="${t}" aria-pressed="${dr.tags.includes(t)}"><span>${t}</span></button>`).join('')}</div></div>
      <label class="g-field"><span>What happened? (what came before, what you saw, what helped)</span><textarea id="f-jnote" class="g-text" data-input="jNote" rows="5" maxlength="1200" placeholder="e.g. Bus was late. Used the talk board to say 'I feel worried', then balloon breathing. Calm in 3 minutes.">${esc(dr.note)}</textarea></label>
      <div class="g-field"><span>Photo (optional)</span>${photoRow('journal', dr.photo)}</div>
      ${sum ? toggle(dr.summary, 'jSum', '1', 'Add today\'s Lumi summary', '') + `<p class="g-note">${esc(sum)}</p>` : ''}
      <button class="g-btn" data-a="jSave">${ic('plus', 18)}<span>Save observation</span></button>
    </div>
    <div class="g-panel grow scroll">
      <div class="row between"><h2 class="g-h">Journal <span class="g-note">(${state.journal.length})</span></h2>
        <div class="row gap8"><button class="g-btn small outline" data-a="jCopy">${ic('journal', 16)}<span>Copy all</span></button><button class="g-btn small outline" data-a="jDownload">${ic('upload', 16)}<span>Download</span></button></div></div>
      <div class="row gap6 wrap">${['All'].concat(D.JOURNAL_TAGS.filter((t) => counts[t])).map((t) => `<button class="partner-chip small ${filter === t ? 'on' : ''}" data-a="jFilter" data-v="${t}"><span>${t}${t !== 'All' ? ' ' + counts[t] : ''}</span></button>`).join('')}</div>
      <div class="j-list">${list || `<div class="empty-note">${ic('journal', 40)}<p>No observations yet.</p><p class="g-note">Short notes after a good moment or a hard one help you spot patterns, and are useful to share with teachers and therapists.</p></div>`}</div>
    </div>
  </div>
</section>`;
  };
  A.PARENT.cgJournal = 'menu';
  A.VOICE.cgJournal = () => '';
  const prevInput2 = A.onInput;
  A.onInput = (key, v, el) => {
    if (prevInput2) prevInput2(key, v, el);
    if (key === 'jNote') jDraft().note = v;
    if (key === 'jWhen') jDraft().when = v;
  };
  const prevPhoto = A.onPhoto;
  A.onPhoto = (name, url, el) => {
    if (name === 'journal') { jDraft().photo = url; render(); return; }
    prevPhoto(name, url, el);
  };
  const prevPhotoDel = A.ACTIONS.cgPhotoDel;
  Object.assign(A.ACTIONS, {
    cgPhotoDel: (d) => { if (d.v === 'journal') { jDraft().photo = null; render(); return; } prevPhotoDel(d); },
    jMood: (d) => { const dr = jDraft(); dr.mood = dr.mood === d.v ? null : d.v; render(); },
    jTag: (d) => { const dr = jDraft(); const i = dr.tags.indexOf(d.v); if (i >= 0) dr.tags.splice(i, 1); else dr.tags.push(d.v); render(); },
    jSum: () => { jDraft().summary = !jDraft().summary; render(); },
    jSave: () => {
      const dr = jDraft();
      if (!dr.note.trim() && !dr.mood && !dr.tags.length && !dr.photo) { const f = document.getElementById('f-jnote'); if (f) f.focus(); A.showToast('<span>Write a note or pick a mood first</span>', 'toast-g'); return; }
      state.journal.unshift({ id: 'j' + uid(), when: dr.when || nowLocal(), mood: dr.mood, tags: dr.tags.slice(), note: dr.note.trim(), photo: dr.photo, summary: dr.summary ? todaySummary() : '' });
      state.journal.sort((a, b) => (a.when < b.when ? 1 : -1));
      S.jDraft = null;
      save();
      render();
      A.showToast('<span>Saved to the journal</span>', 'toast-g');
    },
    jDel: (d) => {
      if (S.jConfirm !== d.v) { S.jConfirm = d.v; render(); setTimeout(() => { if (S.jConfirm === d.v) { S.jConfirm = null; if (S.screen === 'cgJournal') render(); } }, 3500); return; }
      state.journal = state.journal.filter((j) => j.id !== d.v);
      S.jConfirm = null;
      save();
      render();
    },
    jFilter: (d) => { S.jFilter = d.v; render(); },
    jCopy: () => {
      const text = exportText();
      const done = () => A.showToast('<span>Copied. Paste it into an email or message.</span>', 'toast-g');
      try {
        navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
      } catch (e) { fallbackCopy(text, done); }
    },
    jDownload: () => {
      try {
        const blob = new Blob([exportText()], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `lumi-journal-${A.dateKey()}.txt`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      } catch (e) { A.ACTIONS.jCopy(); }
    }
  });
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* copying not allowed */ }
    ta.remove();
  }

  // the old toggles also re-apply the look
  const bToggle = A.ACTIONS.bToggle;
  A.ACTIONS.bToggle = (d) => { bToggle(d); applyPrefs(); };
  const bReset = A.ACTIONS.bReset;
  A.ACTIONS.bReset = (d) => {
    const wasConfirm = S.confirmReset;
    bReset(d);
    if (wasConfirm) { state.setupDone = true; save(); applyPrefs(); render(); }
  };
  void dots;
})();
