/*
  story-me.js
  Lumi's stories and lessons, linked to the child's own life.

  - Before the story: Lumi asks "Have you been to the dentist?" and "How do you feel about it?". The child
    answers with pictures; Lumi says how he feels too (the same, often) and that they will practise together.
  - During the story: tap Lumi and he answers (how he feels now, and thank you for helping).
  - After the story: "Now it's your turn!" The child puts four pictures in order to make their own plan
    ("When I go to the dentist: first, next, then, last"), and says how they feel about it now. Lumi compares:
    "Before, you felt worried. Now you feel okay. Practising helps!"
  - What the child said is kept for the grown-ups (Grown-ups > Progress > What Mia told Lumi).

  Each story or lesson gets a line in ME: ask (the question), about (for "how do you feel about ..."),
  when (for "When you ..."), plan: four [words, icon] in order. Stories without a line are left as they are.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, track } = A;
  const SX = A.SX;
  if (!SX) return;

  const ME = {
    hawkerstory: { today: 'Today Lumi is having lunch at a hawker centre.', ask: 'Have you eaten at a hawker centre?', about: 'eating at a hawker centre', when: 'eat at a hawker centre', plan: [['Chope a table', 'tissuepack'], ['Choose your food', 'cutlery'], ['Pay', 'shop'], ['Return the tray', 'bowl']] },
    dentist: { today: 'Today Lumi is going to the dentist.', ask: 'Have you been to the dentist?', about: 'going to the dentist', when: 'go to the dentist', plan: [['Say hello at the counter', 'chat'], ['Wait for your turn', 'hourglass'], ['Sit in the big chair', 'dentist'], ['Open wide', 'teeth']] },
    haircut: { today: 'Today Lumi is getting a haircut.', ask: 'Have you had a haircut at a hair salon?', about: 'having a haircut', when: 'have a haircut', plan: [['Climb into the chair', 'person'], ['Put on the cape', 'shirt'], ['Snip, snip', 'scissors'], ['Look in the mirror', 'smile']] },
    polyclinic: { today: 'Today Lumi is going to see the doctor.', ask: 'Have you been to see a doctor?', about: 'seeing the doctor', when: 'see the doctor', plan: [['Take a queue number', 'pin'], ['Wait for your number', 'hourglass'], ['Tell the doctor', 'chat'], ['Get your medicine', 'medicine']] },
    shop: { today: 'Today Lumi is going to the supermarket.', ask: 'Have you been to the supermarket?', about: 'going to the supermarket', when: 'go to the supermarket', plan: [['Take a basket', 'shop'], ['Find the things on the list', 'apple'], ['Pay at the counter', 'buscard'], ['Pack the bag', 'bag']] },
    mrt: { today: 'Today Lumi is taking the MRT.', ask: 'Have you taken the MRT?', about: 'taking the MRT', when: 'take the MRT', plan: [['Tap in at the gantry', 'buscard'], ['Wait behind the line', 'hourglass'], ['Hold on in the train', 'train'], ['Get off and tap out', 'pin']] },
    party: { today: 'Today Lumi is going to a birthday party.', ask: 'Have you been to a birthday party?', about: 'going to a birthday party', when: 'go to a birthday party', plan: [['Ring the doorbell', 'bell'], ['Say hello', 'chat'], ['Give the present', 'gift'], ['Sing and eat cake', 'balloon']] },
    teacher: { today: 'Today Lumi is meeting a new teacher.', ask: 'Have you had a new teacher?', about: 'meeting a new teacher', when: 'meet a new teacher', plan: [['Put your bag away', 'bag'], ['Say hello', 'chat'], ['Look at the plan', 'calendar'], ['Snack and play', 'snack']] },
    firedrill: { today: 'Today there is a fire drill at school.', ask: 'Have you done a fire drill?', about: 'fire drills', when: 'hear the fire alarm', plan: [['Hear the alarm', 'bell'], ['Leave your bag', 'bag'], ['Walk in a line', 'person'], ['Wait on the field', 'tree']] },
    work: { today: 'Today Lumi is working at a café.', ask: 'Have you ever helped out at a job?', about: 'asking for help at work', when: 'work at a job', plan: [['Put on the apron', 'shirt'], ['Do your task', 'soap'], ['Ask when you are not sure', 'help'], ['Clock out', 'clock']] },
    bus: { today: 'Today Lumi is taking the bus.', ask: 'Have you taken the bus?', about: 'taking the bus', when: 'take the bus', plan: [['Find your bus number', 'bus'], ['Tap your card', 'buscard'], ['Find a seat', 'person'], ['Press the bell', 'bell']] },
    library: { today: 'Today Lumi is going to the library.', ask: 'Have you been to the library?', about: 'going to the library', when: 'go to the library', plan: [['Use a quiet voice', 'quiet'], ['Find a book', 'book'], ['Sit and read', 'storybook'], ['Borrow it', 'check']] },
    jab: { today: 'Today Lumi is getting a jab.', ask: 'Have you had a jab, a vaccination?', about: 'getting a jab', when: 'get a jab', plan: [['Wait for your number', 'hourglass'], ['Roll up your sleeve', 'shirt'], ['Count 1, 2, 3', 'count'], ['Get a sticker', 'star']] },
    thunder: { today: 'Today there is a thunderstorm.', ask: 'Have you heard thunder?', about: 'thunderstorms', when: 'hear thunder', plan: [['Hear the boom', 'rain'], ['Cover your ears', 'quiet'], ['Get cosy', 'hug'], ['Wait for the sun', 'sun']] },
    swim: { today: 'Today Lumi has a swimming lesson.', ask: 'Have you been to a swimming lesson?', about: 'swimming lessons', when: 'go swimming', plan: [['Change in a free cubicle', 'shirt'], ['Have a quick shower', 'drop'], ['Go in slowly', 'stretch'], ['Dry with a towel', 'towel']] },
    lost: { today: 'Today Lumi is going shopping with Mum.', ask: 'Have you ever lost your grown-up in a shop?', about: 'getting lost', when: 'cannot find your grown-up', plan: [['Stop and stay', 'stop'], ['Find a helper', 'person'], ['Show your card', 'pin'], ['Wait together', 'hug']] },
    'learn-teeth': { lesson: 'brush your teeth', about: 'brushing your teeth', when: 'brush your teeth', plan: [['Wet the brush', 'drop'], ['A little toothpaste', 'teeth'], ['Brush all your teeth', 'smile'], ['Spit and rinse', 'bowl']] },
    'learn-hands': { lesson: 'wash your hands', about: 'washing your hands', when: 'wash your hands', plan: [['Turn on the tap', 'drop'], ['Soap', 'soap'], ['Rub, rub, rub', 'washhands'], ['Dry your hands', 'towel']] },
    'learn-toilet': { lesson: 'use the toilet', about: 'using the toilet', when: 'use the toilet', plan: [['Lift the lid', 'toilet'], ['Sit and wait', 'hourglass'], ['Wipe and flush', 'tissue'], ['Wash your hands', 'washhands']] },
    'learn-dress': { lesson: 'get dressed', about: 'getting dressed', when: 'get dressed', plan: [['Look at the weather', 'sun'], ['Pyjamas off', 'pyjamas'], ['Clothes on', 'shirt'], ['Socks, then shoes', 'shoes']] },
    'learn-pack': { lesson: 'pack your school bag', about: 'packing your bag', when: 'pack your bag', plan: [['Check the timetable', 'calendar'], ['Books and pencil case', 'pencilcase'], ['Water bottle and snack', 'bottle'], ['Zip it up', 'bag']] },
    'learn-canteen': { lesson: 'buy food at the canteen', about: 'buying food at the canteen', when: 'buy food at the canteen', plan: [['Wash your hands', 'washhands'], ['Wait in the line', 'person'], ['Order and pay', 'shop'], ['Return the tray', 'bowl']] },
    'learn-sandwich': { lesson: 'make a sandwich', about: 'making a sandwich', when: 'make a sandwich', plan: [['Wash your hands', 'washhands'], ['Bread and filling', 'snack'], ['Cut it in half', 'cutlery'], ['Clean up', 'soap']] },
    'learn-laundry': { lesson: 'do the laundry', about: 'doing the laundry', when: 'do the laundry', plan: [['Sort the clothes', 'shirt'], ['Load and add soap', 'sWasher'], ['Start the machine', 'play'], ['Hang them to dry', 'sun']] }
  };

  const ORDER = ['First', 'Next', 'Then', 'Last'];
  const FEEL = [
    { id: 'happy', label: 'Happy', art: () => L.face('happy', 56) },
    { id: 'okay', label: 'Okay', art: () => L.face('okay', 56) },
    { id: 'worried', label: 'Worried', art: () => L.face('worried', 56) },
    { id: 'scared', label: 'Scared', art: () => L.face('scared', 56) }
  ];
  const HARD = ['worried', 'scared'];
  const kid = () => state.childName || '';
  const me = () => (state.childPhoto ? `<img class="me-photo" src="${state.childPhoto}" alt="">` : `<span class="me-photo me-star">${ic('star', 30)}</span>`);
  const feelLabel = (id) => (FEEL.find((f) => f.id === id) || FEEL[1]).label.toLowerCase();

  // a note for the grown-ups (newest first, a few dozen kept)
  function remember(def, st) {
    state.meTalk = state.meTalk || [];
    const prev = state.meTalk[0];
    const rec = { t: Date.now(), id: def.id, title: def.title, have: st.data.meHave || '', before: st.data.meBefore || '', after: st.data.meAfter || '' };
    if (prev && prev.id === rec.id && Date.now() - prev.t < 30 * 60 * 1000) state.meTalk[0] = rec; else state.meTalk.unshift(rec);
    if (state.meTalk.length > 40) state.meTalk.length = 40;
    save();
  }

  // ---------------------------------------------------------------- before: "Have you ...? How do you feel?"
  function introStep(def, m) {
    const lesson = !!m.lesson;
    const HAVE = lesson
      ? [{ id: 'self', label: 'By myself', art: ic('star', 52) }, { id: 'help', label: 'With help', art: ic('together', 52) }, { id: 'notyet', label: 'Not yet', art: ic('hourglass', 52) }]
      : [{ id: 'yes', label: 'Yes', art: ic('thumb', 52) }, { id: 'notyet', label: 'Not yet', art: ic('hourglass', 52) }, { id: 'unsure', label: 'Not sure', art: ic('what', 52) }];
    const ask = lesson ? `Do you ${m.lesson} by yourself?` : m.ask;
    return {
      id: 'me-hello',
      meStep: true,
      noDemo: true,
      bg: 'outHome',
      text: (st) => {
        if (st.s.phase === 'feel') return `How do you feel about ${m.about}?`;
        return `${kid() ? `Hi ${kid()}! ` : 'Hi! '}${lesson ? `Today Lumi is learning to ${m.lesson}.` : m.today} ${ask}`;
      },
      task: (st) => (st.s.phase === 'feel' ? 'Tap the face that shows how you feel.' : 'Tap an answer.'),
      lumi: (st) => ({ x: 300, y: 545, h: 270, mood: st.s.mood || 'happy' }),
      draw(st) {
        let h = SX.at(24, 22, 200, 64, `<span class="me-chip">${me()}<b>${esc(kid() || 'Me')}</b></span>`, { z: 6 });
        if (st.s.phase !== 'feel') {
          h += SX.bubble(400, 70, ask, { tail: 'left', w: 270 });
          h += SX.choices(HAVE, 'meHave', { on: HAVE.findIndex((x) => x.id === st.data.meHave), style: 'right:40px;top:50px;', cls: 'col me-big' });
        } else {
          h += SX.bubble(400, 70, st.done ? st.praise : `How do you feel about ${m.about}?`, { tail: 'left', w: 250 });
          h += `<div class="sx-choices me-feel" style="right:30px;top:40px;">${FEEL.map((f, i) => `<button class="sx-choice ${st.data.meBefore === f.id ? 'on' : ''}" data-a="sx" data-k="meFeel" data-v="${i}"><span class="sx-ch-art">${f.art()}</span><span>${f.label}</span></button>`).join('')}</div>`;
        }
        return h;
      },
      tap(st, k, el, d) {
        if (k === 'meHave') {
          st.data.meHave = HAVE[Number(d.v)].id;
          st.s.phase = 'feel';
          SX.ok();
          SX.render();
          say(`${HAVE[Number(d.v)].label}. How do you feel about ${m.about}?`);
        }
        if (k === 'meFeel') {
          const f = FEEL[Number(d.v)].id;
          st.data.meBefore = f;
          st.s.mood = f === 'happy' ? 'excited' : HARD.includes(f) ? 'worried' : 'calm';
          const line = {
            happy: `Yay! I feel happy too. Let's go together!`,
            okay: `Okay is good. Let's practise together.`,
            worried: `I feel a bit worried too. When we practise, it feels less new. You can help me.`,
            scared: `It's okay to feel scared. We will go slowly, one step at a time. You can help me be brave.`
          }[f];
          SX.done(st, line);
        }
      },
      guide: (st) => ({ sel: st.s.phase === 'feel' ? '.me-feel .sx-choice' : '.me-big .sx-choice', say: st.s.phase === 'feel' ? 'Tap a face.' : 'Tap an answer.' }),
      auto(st) { st.data.meHave = st.data.meHave || HAVE[0].id; st.data.meBefore = 'okay'; SX.done(st, 'Let’s practise together.'); }
    };
  }

  // ---------------------------------------------------------------- after: "Now it's your turn" (put your plan in order)
  function planStep(def, m) {
    const N = m.plan.length;
    return {
      id: 'me-plan',
      meStep: true,
      noDemo: true,
      bg: 'outHome',
      enter(st) {
        // a mixed-up order (never already right)
        const idx = m.plan.map((_, i) => i);
        do { idx.sort(() => Math.random() - 0.5); } while (idx.every((v, i) => v === i));
        st.s.order = idx;
        st.s.n = 0;
      },
      text: (st) => {
        if (st.s.phase === 'feel') return `That is your plan${kid() ? `, ${kid()}` : ''}! Now, how do you feel about ${m.about}?`;
        return `Now it's your turn${kid() ? `, ${kid()}` : ''}! When you ${m.when}, what happens? Put the pictures in order.`;
      },
      task: (st) => (st.s.phase === 'feel' ? 'Tap the face that shows how you feel now.' : `What happens ${['first', 'next', 'after that', 'last'][st.s.n] || ''}? Drag it into box ${st.s.n + 1}.`),
      lumi: (st) => ({ x: 150, y: 548, h: 230, mood: st.done ? 'excited' : 'happy' }),
      draw(st) {
        let h = SX.at(296, 8, 520, 50, `<span class="me-chip wide">${me()}<b>${esc(kid() ? `${kid()}'s plan` : 'My plan')}</b><small>${esc(def.title)}</small></span>`, { z: 6 });
        m.plan.forEach(([label, icon], i) => {
          const placed = i < st.s.n;
          h += SX.at(296 + i * 200, 70, 184, 196, `<span class="me-num">${i + 1}</span><span class="me-when">${ORDER[i]}</span>${placed ? `<span class="me-card-in">${ic(icon, 70)}<b>${esc(label)}</b></span>` : ''}`, { cls: `me-slot ${i === st.s.n && st.s.phase !== 'feel' ? 'next' : ''} ${placed ? 'filled' : ''}`, target: i === st.s.n, z: 3 });
        });
        if (st.s.phase !== 'feel') {
          st.s.order.forEach((v, j) => {
            if (v < st.s.n) return;
            const [label, icon] = m.plan[v];
            h += SX.at(296 + j * 200, 318, 184, 196, `<span class="me-card-in">${ic(icon, 70)}<b>${esc(label)}</b></span>`, { cls: 'sx-drag me-card', id: String(v), label, z: 8 });
          });
        } else {
          h += `<div class="sx-choices me-feel row" style="left:296px;top:300px;">${FEEL.map((f, i) => `<button class="sx-choice ${st.data.meAfter === f.id ? 'on' : ''}" data-a="sx" data-k="meAfter" data-v="${i}"><span class="sx-ch-art">${f.art()}</span><span>${f.label}</span></button>`).join('')}</div>`;
        }
        return h;
      },
      after(st, box) {
        if (st.s.phase === 'feel' || st.done) return;
        SX.dragTo(box, '.me-card', '.me-slot.next', (t, el) => {
          const v = Number(el.dataset.id);
          if (v !== st.s.n) { SX.nope(el, `Hmm. Is that ${['first', 'next', 'after that', 'last'][st.s.n]}? Look again.`); return false; }
          st.s.n += 1;
          tone(523 + st.s.n * 80, 0.15, 0.06);
          if (st.s.n >= N) {
            st.s.phase = 'feel';
            SX.render();
            say(`${m.plan.map(([w], i) => `${ORDER[i]}, ${w.toLowerCase()}.`).join(' ')} That is your plan! How do you feel about ${m.about} now?`);
            return false;
          }
          SX.render();
          say(`${ORDER[st.s.n - 1]}, ${m.plan[st.s.n - 1][0].toLowerCase()}. What happens ${['first', 'next', 'after that', 'last'][st.s.n]}?`);
          return false;
        }, { pad: 30, miss: () => say(`Drag it into box ${st.s.n + 1}.`), tap: (el) => say(`${el.getAttribute('aria-label')}. Drag it into box ${st.s.n + 1} if it happens ${['first', 'next', 'after that', 'last'][st.s.n]}.`) });
      },
      tap(st, k, el, d) {
        if (k !== 'meAfter') return;
        const now = FEEL[Number(d.v)].id;
        const before = st.data.meBefore;
        st.data.meAfter = now;
        let line;
        if (before && HARD.includes(before) && !HARD.includes(now)) line = `Before, you felt ${feelLabel(before)}. Now you feel ${feelLabel(now)}. Practising helps!`;
        else if (HARD.includes(now)) line = `It's okay to still feel ${feelLabel(now)}. You can practise again, and a grown-up can help you.`;
        else if (now === 'happy') line = `Hooray! You can do it, just like Lumi.`;
        else line = `Okay is good. You know what happens now. You can do it!`;
        remember(def, st);
        track('meTalk', `${def.title}: ${feelLabel(before || now)} → ${feelLabel(now)}`);
        SX.done(st, line);
      },
      guide: (st) => (st.s.phase === 'feel' ? { sel: '.me-feel .sx-choice', say: 'Tap a face.' } : { sel: `.me-card[data-id="${st.s.n}"]`, to: '.me-slot.next', say: `What happens ${['first', 'next', 'after that', 'last'][st.s.n]}? Drag it into box ${st.s.n + 1}.` }),
      auto(st) { st.s.n = N; st.s.phase = 'feel'; SX.render(); }
    };
  }

  // add the two steps to every story and lesson that has a line in ME
  D.STORIES.forEach((def) => {
    const m = ME[def.id];
    if (!m || def.meAdded) return;
    def.meAdded = true;
    def.steps.unshift(introStep(def, m));
    def.steps.push(planStep(def, m));
    def.pages = def.steps;
  });

  // ---------------------------------------------------------------- tap Lumi: he answers
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function lumiLine(st) {
    const def = D.STORIES.find((s) => s.id === st.id);
    const step = def && def.steps[st.i];
    const spot = step && (typeof step.lumi === 'function' ? step.lumi(st) : step.lumi);
    const mood = (spot && spot.mood) || 'happy';
    if (st.done) return pick(['We did it! High five!', 'Thank you for helping me.', 'You are a great helper.']);
    if (/worried|scared|sad/.test(mood)) {
      if (HARD.includes(st.data.meBefore)) return pick(['You felt worried too. We can be brave together.', 'I feel a bit worried. Can you stay with me?']);
      return pick(['I feel a bit worried. Thank you for staying with me.', 'Can you help me? I feel better with you.']);
    }
    return pick(['Hee hee! That tickles!', 'Can you help me with this?', 'I like doing this with you.', 'What do we do now? Can you show me?']);
  }
  const afterStory = A.AFTER.story;
  A.AFTER.story = () => {
    if (afterStory) afterStory();
    const st = S.sx;
    const el = A.stage.querySelector('.sx-scene .sx-lumi');
    if (!st || !el || el.querySelector('.sx-lumi-hit')) return;
    const hit = document.createElement('button');
    hit.className = 'sx-lumi-hit';
    hit.setAttribute('aria-label', 'Talk to Lumi');
    hit.addEventListener('click', (e) => {
      e.stopPropagation();
      if (S.picked || A.stage.querySelector('.sx-scene.sx-dragging')) return;
      const svg = el.querySelector('svg');
      if (svg) { svg.classList.remove('sx-wiggle'); void svg.getBoundingClientRect(); svg.classList.add('sx-wiggle'); }
      const heart = document.createElement('span');
      heart.className = 'sx-heart';
      heart.innerHTML = ic('heart', 34);
      el.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
      tone(880, 0.08, 0.05);
      setTimeout(() => tone(1100, 0.1, 0.05), 90);
      say(lumiLine(st));
    });
    el.appendChild(hit);
    // never cover something the child should tap or drag (things standing behind or next to Lumi)
    const hr = hit.getBoundingClientRect();
    const overlaps = [...A.stage.querySelectorAll('.sx-scene .sx-hit, .sx-scene .sx-drag, .sx-scene .sx-target, .sx-scene .sx-choice')].some((o) => {
      if (el.contains(o)) return false;
      const r = o.getBoundingClientRect();
      return r.width && r.left < hr.right && r.right > hr.left && r.top < hr.bottom && r.bottom > hr.top;
    });
    if (overlaps) hit.remove();
  };

  // ---------------------------------------------------------------- for the grown-ups
  A.meTalkHtml = () => {
    const list = (state.meTalk || []).slice(0, 8);
    const helps = Object.entries(state.myHelps || {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const name = esc(state.childName || 'your child');
    const face = (f) => (f ? L.face(f, 26) : '');
    const rows = list.map((r) => `<li><b>${esc(r.title)}</b><span class="mt-feel">${face(r.before)}${r.before && r.after ? ic('arrow', 16) : ''}${face(r.after)}</span><span class="g-note">${r.have === 'yes' || r.have === 'self' ? 'Has done this' : r.have === 'help' ? 'Does it with help' : r.have === 'notyet' ? 'Not yet' : ''}</span></li>`).join('');
    return `<h2 class="g-h top-gap">What ${name} told Lumi</h2>
      ${rows ? `<ul class="mt-list">${rows}</ul>` : `<p class="g-note">Before and after each story, Lumi asks how ${name} feels about it. The answers will show here.</p>`}
      ${helps.length ? `<p class="g-note mt-helps-t">What ${name} says helps them:</p><div class="row wrap gap8">${helps.map(([l, n]) => `<span class="tag">${esc(l)} <b>${n}</b></span>`).join('')}</div>` : ''}`;
  };
})();
