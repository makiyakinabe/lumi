/*
  chat.js
  "Chat with Lumi": the child talks to Lumi and Lumi talks back.
  - Picture chat (everyone): tap picture buttons ("I feel sad", "Let's play", "Tell me a joke"...).
    It uses the talk-board idea, so it is good practice for using pictures to say things.
  - Voice (Primary and Teens by default; grown-ups can switch it on or off): a microphone button.
    Lumi listens for simple words. If Lumi hears a sound but no words, Lumi praises the try
    ("I heard you! Can you say it again?"), which encourages children who are starting to use sounds.
  - Keyboard (Teens): type a message.
  Everything Lumi says is written here: no AI, no internet needed for the picture chat, so grown-ups
  know exactly what Lumi can say. Some replies lead somewhere useful (calm corner, My day, games,
  stories, a "I need help" card for a grown-up).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, render, go, later } = A;

  const nm = () => (state.childName ? ', ' + state.childName : '');
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const petName = () => {
    const ids = A.buddyPets ? A.buddyPets() : [];
    const p = ids.map((k) => state.pets && state.pets[k]).find((x) => x && x.name);
    return p ? p.name : null;
  };
  function nextStep() {
    try {
      const sn = A.scheduleNow();
      const st = sn.next || sn.now;
      if (!st) return null;
      return { info: A.stepInfo(st), time: A.fmt(st.time), now: !sn.next };
    } catch (e) { return null; }
  }
  const JOKES = [
    'Why did the banana go to the doctor? Because it was not peeling well!',
    'What do you call a bear with no teeth? A gummy bear!',
    'Why do fish live in salt water? Because pepper makes them sneeze!',
    'What do you call a sleeping dinosaur? A dino-snore!',
    'Why did the cookie go to the nurse? It felt crummy!',
    'What did the ocean say to the beach? Nothing, it just waved!'
  ];
  const TEEN_JOKES = [
    'I told my phone a joke. It did not laugh. It just needed charging.',
    'Why did the student bring a ladder to school? To reach the high marks.',
    'What do you call a bus that crashes into the sky? A bus stop... in space.',
    'I would tell you a joke about the MRT, but you might miss it.'
  ];

  // ---------------------------------------------------------------- what the child can say
  // id, picture, words shown on the button, and the words the child "says" (shown in their bubble)
  const SAY = {
    hello: { lumi: true, label: 'Hello', said: 'Hello Lumi!' },
    bye: { icon: 'exit', label: 'Bye', said: 'Bye bye!' },
    happy: { face: 'happy', label: 'Happy', said: 'I feel happy.' },
    sad: { face: 'sad', label: 'Sad', said: 'I feel sad.' },
    angry: { face: 'angry', label: 'Angry', said: 'I feel angry.' },
    worried: { face: 'worried', label: 'Worried', said: 'I feel worried.' },
    scared: { face: 'scared', label: 'Scared', said: 'I feel scared.' },
    tired: { icon: 'sleep', label: 'Tired', said: 'I feel tired.' },
    play: { icon: 'kPuzzle', label: 'Play', said: "Let's play!" },
    story: { icon: 'kStories', label: 'Story', said: 'Can we read a story?' },
    hungry: { icon: 'eat', label: 'Hungry', said: "I'm hungry." },
    drink: { icon: 'drink', label: 'Drink', said: "I'm thirsty." },
    toilet: { icon: 'toilet', label: 'Toilet', said: 'I need the toilet.' },
    break: { icon: 'kBreak', label: 'Break', said: 'I need a break.' },
    help: { icon: 'help', label: 'Help', said: 'I need help.' },
    next: { icon: 'kDay', label: "What's next?", said: "What's next?" },
    joke: { icon: 'laugh', label: 'Joke', said: 'Tell me a joke!' },
    you: { icon: 'what', label: 'How are you?', said: 'How are you, Lumi?' },
    like: { icon: 'like', label: 'What do you like?', said: 'What do you like, Lumi?' },
    time: { icon: 'clock', label: 'Time', said: 'What time is it?' },
    dance: { icon: 'music', label: 'Dance', said: 'Can you dance?' },
    love: { icon: 'kHeart', label: 'I love you', said: 'I love you, Lumi!' },
    pet: { icon: 'kPet', label: 'My pet', said: 'How is my pet?' },
    yes: { icon: 'yes', label: 'Yes', said: 'Yes.' },
    no: { icon: 'no', label: 'No', said: 'No.' }
  };
  const GROUPS = [
    { id: 'feel', label: 'Feelings', icon: 'kHeart', items: ['happy', 'sad', 'angry', 'worried', 'scared', 'tired'] },
    { id: 'want', label: 'I want', icon: 'want', items: ['play', 'story', 'hungry', 'drink', 'toilet', 'break', 'help'] },
    { id: 'ask', label: 'Ask Lumi', icon: 'what', items: ['you', 'next', 'joke', 'like', 'time', 'pet'] },
    { id: 'fun', label: 'Fun', icon: 'kFun', items: ['hello', 'dance', 'love', 'joke', 'bye'] }
  ];
  // Little ones: one row of big pictures, no categories
  const LITTLE = ['hello', 'happy', 'sad', 'play', 'hungry', 'love', 'joke', 'bye'];

  // ---------------------------------------------------------------- how Lumi answers
  // Each answer: text (what Lumi says), mood (Lumi's face), act (a little animation),
  // go (a button that leads somewhere), ask (quick replies for Lumi's question)
  const TO = {
    calm: { label: 'Calm corner', icon: 'kCalm', to: 'calm' },
    games: { label: 'Play a game', icon: 'kPuzzle', to: 'play' },
    stories: { label: 'Read a story', icon: 'kStories', to: 'stories' },
    day: { label: 'My day', icon: 'kDay', to: 'schedule' },
    talk: { label: 'Talk board', icon: 'kTalk', to: 'talk' },
    pet: { label: 'Pet corner', icon: 'kPet', to: 'pet' }
  };
  function answer(id) {
    const teen = state.profile.age === 'teen';
    const pet = petName();
    switch (id) {
      case 'hello': return { text: pick([`Hi${nm()}! I'm so happy to see you.`, `Hello${nm()}! How are you today?`]), mood: 'excited', act: 'hop', ask: ['happy', 'sad', 'tired', 'worried'] };
      case 'bye': return { text: pick([`Bye bye${nm()}! Come and chat again soon.`, 'See you later! I had fun talking with you.']), mood: 'happy', act: 'wave' };
      case 'happy': return { text: pick(["Yay! I'm happy too!", 'That makes me smile! Happy is a lovely feeling.']), mood: 'excited', act: 'hop', go: [TO.games] };
      case 'sad': return { text: 'Oh no. It is okay to feel sad. I am here with you. Do you want a hug, or the calm corner?', mood: 'worried', act: 'hug', go: [TO.calm], ask: ['love', 'help'] };
      case 'angry': return { text: "It's okay to feel angry. Let's breathe slowly together. In... and out.", mood: 'calm', act: 'breathe', go: [TO.calm] };
      case 'worried': return { text: 'Worried feels wobbly inside. Shall we look at what happens next? Knowing can help.', mood: 'worried', act: 'hug', go: [TO.day, TO.calm] };
      case 'scared': return { text: 'You are safe. Let me get a grown-up to help. You can show them this.', mood: 'worried', act: 'hug', help: true, go: [TO.calm] };
      case 'tired': return { text: 'Tired? Maybe it is time for a rest. Do you want a break?', mood: 'sleepy', act: 'yawn', ask: ['yes', 'no'], q: 'break' };
      case 'play': return { text: pick(["Yes! Let's play a game.", 'I love playing! Pick a game.']), mood: 'excited', act: 'hop', go: [TO.games] };
      case 'story': return { text: 'I love stories! Let us read one together.', mood: 'happy', act: 'hop', go: [TO.stories] };
      case 'hungry': return { text: 'Your tummy is talking! Let us tell a grown-up. Show them the talk board.', mood: 'happy', go: [TO.talk] };
      case 'drink': return { text: 'Water is a good idea. Ask a grown-up for a drink.', mood: 'happy', go: [TO.talk] };
      case 'toilet': return { text: 'Good telling me! Go to the toilet now. Ask a grown-up if you need help.', mood: 'happy', help: true };
      case 'break': return { text: "Okay. Let's take a break together.", mood: 'calm', act: 'breathe', go: [{ label: 'Take a break', icon: 'kBreak', action: 'takeBreak' }] };
      case 'help': return { text: 'Good asking for help! Show this to a grown-up.', mood: 'happy', help: true };
      case 'next': {
        const n = nextStep();
        if (!n) return { text: 'There is nothing else on the plan today. Free time!', mood: 'happy', go: [TO.games] };
        return { text: n.now ? `Now it is ${n.info.label}.` : `Next is ${n.info.label}, at ${n.time}.`, mood: 'happy', step: n, go: [TO.day] };
      }
      case 'joke': return { text: pick(teen ? TEEN_JOKES : JOKES), mood: 'excited', act: 'giggle', laugh: true };
      case 'you': return { text: pick(["I'm happy, because I'm talking with you!", "I feel great today! I had a bouncy morning."]) + ' How are you?', mood: 'excited', act: 'hop', ask: ['happy', 'sad', 'tired', 'worried'] };
      case 'like': return { text: pick(['I like bubbles, stories and dancing!', 'I like the colour of sunshine, and kaya toast!', `I like playing with you${pet ? ' and ' + pet : ''}!`]), mood: 'happy', act: 'hop' };
      case 'time': return { text: `It is ${A.fmt(A.fromMin(A.nowMin()))}.`, mood: 'happy', go: [TO.day] };
      case 'dance': return { text: 'Watch me dance! Dance with me!', mood: 'excited', act: 'dance', music: true };
      case 'love': return { text: pick([`I love you too${nm()}!`, 'Big hug! You are my best friend.']), mood: 'excited', act: 'hug', hearts: true };
      case 'pet': return pet ? { text: `${pet} is happy and wants to play with you!`, mood: 'happy', go: [TO.pet] } : { text: 'You do not have a pet yet. You can get one in the room shop!', mood: 'happy' };
      case 'yes': return null; // handled by the question Lumi asked
      case 'no': return null;
      default: return { text: "Hmm, I'm still learning that. Can you show me with a picture?", mood: 'happy', act: 'tilt' };
    }
  }

  // ---------------------------------------------------------------- words heard or typed -> what the child means
  const WORDS = [
    ['sad', /\b(not|don't|dont|no) (happy|good|okay|ok|fine|great)\b/],
    ['hello', /\b(hi|hello|hey|good morning|good afternoon)\b/],
    ['bye', /\b(bye|goodbye|see you|good night)\b/],
    ['sad', /\b(sad|cry|crying|upset|unhappy)\b/],
    ['angry', /\b(angry|mad|cross|annoyed|furious)\b/],
    ['worried', /\b(worried|nervous|anxious|worry)\b/],
    ['scared', /\b(scared|afraid|frightened|fear)\b/],
    ['tired', /\b(tired|sleepy|sleep)\b/],
    ['happy', /\b(happy|good|great|fine|excited|ok|okay)\b/],
    ['hungry', /\b(hungry|eat|food|snack|lunch|dinner|breakfast)\b/],
    ['drink', /\b(thirsty|drink|water|juice|milk)\b/],
    ['toilet', /\b(toilet|pee|poo|potty|bathroom)\b/],
    ['break', /\b(break|rest|stop|quiet)\b/],
    ['help', /\b(help|hurt|pain|sick)\b/],
    ['next', /\b(next|what now|after|later|schedule|plan)\b/],
    ['joke', /\b(joke|funny|laugh)\b/],
    ['story', /\b(story|book|read)\b/],
    ['play', /\b(play|game|games|fun)\b/],
    ['time', /\b(time|clock)\b/],
    ['dance', /\b(dance|sing|song|music)\b/],
    ['love', /\b(love|hug|friend)\b/],
    ['pet', /\b(pet|puppy|kitten|dog|cat|fish)\b/],
    ['you', /\b(how are you|you okay)\b/],
    ['like', /\b(like|favourite|favorite)\b/],
    ['yes', /^(yes|yeah|yep|ya|ok yes)\b/],
    ['no', /^(no|nope|nah)\b/]
  ];
  function meaning(text) {
    const t = String(text || '').toLowerCase().trim();
    if (!t) return null;
    // a question Lumi asked: a yes or no answers it
    for (const [id, re] of WORDS) if (re.test(t)) return id;
    return 'unknown';
  }

  // ---------------------------------------------------------------- the conversation
  function chat() {
    if (!S.chat) S.chat = { log: [], group: 'feel', ask: null, q: null, help: false, mood: 'happy', act: '', listening: false, heard: '', typing: '' };
    return S.chat;
  }
  function push(msg) {
    const c = chat();
    c.log.push(msg);
    if (c.log.length > 40) c.log.shift();
  }
  function lumiSays(a) {
    const c = chat();
    c.mood = a.mood || 'happy';
    c.act = a.act || '';
    c.ask = a.ask || null;
    c.q = a.q || null;
    if (a.help) c.help = true;
    push({ from: 'lumi', text: a.text, go: a.go || null, step: a.step || null });
    render();
    scrollDown();
    say(a.text);
    if (a.laugh) setTimeout(() => { tone(660, 0.12, 0.06); setTimeout(() => tone(784, 0.12, 0.06), 140); setTimeout(() => tone(988, 0.16, 0.06), 280); }, 300);
    if (a.music) [0, 220, 440, 660, 880].forEach((t, i) => setTimeout(() => tone([523, 659, 784, 659, 523][i], 0.18, 0.07), t));
    if (a.hearts) hearts();
    later(() => { if (chat().act === c.act) { chat().act = ''; const el = A.stage.querySelector('.ch-lumi'); if (el) el.className = 'ch-lumi'; } }, 2200);
  }
  function childSays(id, how, words) {
    const s = SAY[id];
    push({ from: 'child', id: how === 'picture' || !how ? id : null, text: words || (s ? s.said : ''), how: how || 'picture' });
    respond(id);
  }
  function respond(id, prefix) {
    const c = chat();
    const s = SAY[id];
    if (state.stats) { state.stats.chats = (state.stats.chats || 0) + 1; save(); }
    if (A.track) A.track('chat', s ? s.label : 'chat', { quiet: true });
    const withPrefix = (a) => (prefix ? Object.assign({}, a, { text: prefix + a.text }) : a);
    // answers to Lumi's own question
    if ((id === 'yes' || id === 'no') && c.q === 'break') {
      c.q = null;
      if (id === 'yes') { lumiSaysLater(withPrefix({ text: "Okay, let's take a break.", mood: 'calm', go: [{ label: 'Take a break', icon: 'kBreak', action: 'takeBreak' }] })); return; }
      lumiSaysLater(withPrefix({ text: 'Okay! Tell me if you change your mind.', mood: 'happy' }));
      return;
    }
    if (id === 'yes' || id === 'no') { lumiSaysLater(withPrefix({ text: id === 'yes' ? 'Yes! Okay!' : 'Okay, no. Thank you for telling me.', mood: 'happy' })); return; }
    lumiSaysLater(withPrefix(answer(id)));
  }
  function lumiSaysLater(a) {
    const c = chat();
    c.ask = null;
    c.thinking = true;
    render();
    scrollDown();
    later(() => { chat().thinking = false; lumiSays(a); }, 650);
  }
  function scrollDown() {
    requestAnimationFrame(() => { const el = A.stage.querySelector('.ch-log'); if (el) el.scrollTop = el.scrollHeight; });
  }
  function hearts() {
    const box = A.stage.querySelector('.ch-scene');
    if (!box) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const h = document.createElement('span');
        h.className = 'ch-heart';
        h.style.left = (30 + Math.random() * 40) + '%';
        h.innerHTML = ic('kHeart', 44);
        box.appendChild(h);
        setTimeout(() => h.remove(), 1600);
      }, i * 220);
    }
  }

  // ---------------------------------------------------------------- voice (the tablet's speech recognition)
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null;
  const micOn = () => {
    const v = state.settings.chatMic;
    // off unless a grown-up turns it on: the tablet's speech service may send the sound away to be
    // turned into words, so children's voices never leave the tablet without a grown-up's say-so
    return v === true && !!Rec;
  };
  function listen() {
    const c = chat();
    if (!Rec || c.listening) return;
    try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
    rec = new Rec();
    rec.lang = 'en-SG';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    let heardSound = false;
    let got = false;
    c.listening = true;
    render();
    rec.onsoundstart = () => { heardSound = true; };
    rec.onresult = (e) => {
      got = true;
      const alts = Array.from(e.results[0] || []).map((r) => r.transcript);
      const text = alts[0] || '';
      let id = null;
      for (const t of alts) { const m = meaning(t); if (m && m !== 'unknown') { id = m; break; } }
      c.listening = false;
      push({ from: 'child', text, how: 'voice' });
      if (id) respond(id, `I heard "${text}". `);
      else lumiSaysLater({ text: `I heard "${text}". I'm still learning that one. Can you show me with a picture?`, mood: 'happy', act: 'tilt' });
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (got) return;
      c.listening = false;
      render();
      // a sound but no words: praise the try
      if (heardSound) lumiSaysLater({ text: pick(['I heard you! Can you say it again?', 'Great voice! Say it one more time?', 'Ooh, I heard that! You can show me with a picture too.']), mood: 'excited', act: 'hop' });
      else lumiSaysLater({ text: "I didn't hear anything. Try again, or tap a picture.", mood: 'happy', act: 'tilt' });
    };
    try { rec.start(); } catch (e) { c.listening = false; render(); }
    later(() => { if (rec && chat().listening) try { rec.stop(); } catch (e) { /* already stopped */ } }, 7000);
  }

  // ---------------------------------------------------------------- the screen
  function sayBtn(id, big) {
    const s = SAY[id];
    const art = s.lumi ? `<span class="ch-wave">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'happy', wave: true, size: big ? 70 : 54 })}</span>` : s.face ? L.face(s.face, big ? 64 : 48) : ic(s.icon, big ? 64 : 48);
    return `<button class="ch-btn ${big ? 'big' : ''}" data-a="chSay" data-v="${id}" aria-label="${esc(s.said)}">${art}<span>${esc(s.label)}</span></button>`;
  }
  function msgHtml(m) {
    if (m.from === 'child') {
      const s = m.id && SAY[m.id];
      const art = s ? (s.lumi ? ic('smile', 38) : s.face ? L.face(s.face, 38) : ic(s.icon, 38)) : m.how === 'voice' ? ic('mic', 32) : ic('text', 30);
      return `<div class="ch-msg me"><span class="ch-bub me">${art}<span>${esc(m.text)}</span></span></div>`;
    }
    const go = (m.go || []).map((g) => g.action
      ? `<button class="ch-go" data-a="${g.action}">${ic(g.icon, 28)}<span>${esc(g.label)}</span></button>`
      : `<button class="ch-go" data-a="nav" data-to="${g.to}">${ic(g.icon, 28)}<span>${esc(g.label)}</span></button>`).join('');
    const step = m.step ? `<span class="ch-step">${A.stepArt(m.step.info, 56)}<b>${esc(m.step.info.label)}</b><span>${esc(m.step.time)}</span></span>` : '';
    return `<div class="ch-msg lumi"><span class="ch-face">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'happy', size: 46 })}</span>
      <span class="ch-bub lumi"><span>${esc(m.text)}</span>${step}${go ? `<span class="ch-gos">${go}</span>` : ''}</span></div>`;
  }
  A.PARENT.chat = 'home';
  A.VOICE.chat = () => {
    const c = chat();
    const last = c.log.filter((m) => m.from === 'lumi').pop();
    return last ? last.text : `Hi${nm()}! Let's chat. Tap a picture to talk to me.`;
  };
  A.ENTER = A.ENTER || {};
  A.SCREENS.chat = () => {
    const c = chat();
    if (!c.log.length) push({ from: 'lumi', text: `Hi${nm()}! How are you today?` }), (c.ask = ['happy', 'sad', 'tired', 'worried']);
    const little = state.profile.age === 'little';
    const teen = state.profile.age === 'teen';
    const g = GROUPS.find((x) => x.id === c.group) || GROUPS[0];
    const tabs = little ? '' : `<div class="ch-tabs">${GROUPS.map((x) => `<button class="ch-tab ${x.id === g.id ? 'on' : ''}" data-a="chGroup" data-v="${x.id}" aria-pressed="${x.id === g.id}">${ic(x.icon, 26)}<span>${x.label}</span></button>`).join('')}</div>`;
    const btns = little ? LITTLE.map((id) => sayBtn(id, true)).join('') : g.items.map((id) => sayBtn(id)).join('');
    const quick = c.ask && !c.thinking ? `<div class="ch-quick">${c.ask.map((id) => sayBtn(id)).join('')}</div>` : '';
    const mic = micOn() ? `<button class="ch-mic ${c.listening ? 'on' : ''}" data-a="chMic" aria-label="Talk to Lumi with your voice">${ic('mic', 44)}<span>${c.listening ? 'Listening…' : 'Talk'}</span></button>` : '';
    const keys = teen ? `<form class="ch-type" data-chat-form><input id="chInput" type="text" maxlength="80" placeholder="Type to Lumi…" autocomplete="off" value="${esc(c.typing || '')}"><button class="ch-send" type="submit" aria-label="Send">${ic('arrow', 26)}</button></form>` : '';
    return `
<section class="screen ch-screen ${little ? 'little' : ''}" aria-label="Chat with Lumi">
  ${A.srTitle('Chat with Lumi')}
  <div class="row between" style="height:60px;flex:none">
    <div class="row gap12">${A.backBtn()}${A.speakBtn(A.VOICE.chat())}<span class="game-chip" style="background:#FDE7EE;color:#A8457A">${ic('kTalk', 30)}<span>Chat with Lumi</span></span></div>
    <span></span>
  </div>
  <div class="row gap16 grow ch-main">
    <div class="panel scene ch-scene">
      <div class="floor" style="height:22%"></div>
      <div class="ch-lumi ${c.act ? 'act-' + c.act : ''} ${c.listening ? 'act-listen' : ''}">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: c.listening ? 'calm' : c.mood, size: little ? 230 : 210, wave: c.act === 'wave' })}</div>
      ${c.listening ? '<span class="ch-ear"><i></i><i></i><i></i></span>' : ''}
    </div>
    <div class="panel ch-panel grow">
      <div class="ch-log" aria-live="polite">${c.log.map(msgHtml).join('')}${c.thinking ? `<div class="ch-msg lumi"><span class="ch-face">${L.svg({ look: A.lookWith({ spark: 'none' }), mood: 'happy', size: 46 })}</span><span class="ch-bub lumi dots"><i></i><i></i><i></i></span></div>` : ''}</div>
      ${quick}
    </div>
  </div>
  <div class="ch-bottom">
    ${tabs}
    <div class="row gap12 ch-row">${mic}<div class="ch-btns ${little ? 'big' : ''}">${btns}</div></div>
    ${keys}
  </div>
  ${c.help ? `<div class="win-veil ch-help"><div class="win-card"><span class="ch-help-ic">${ic('help', 110)}</span><div class="win-title"><span>I need help</span></div><div class="tg-win-sub">${esc(state.childName || 'Your child')} is asking for a grown-up.</div><button class="primary" data-a="chHelpOff" style="height:76px">${ic('check', 30)}<span>A grown-up is here</span></button></div></div>` : ''}
</section>`;
  };
  A.GUIDE.chat = () => {
    const c = chat();
    if (c.help) return { sel: '[data-a="chHelpOff"]', say: 'Show this to a grown-up.', delay: 15000 };
    if (c.ask) return { sel: '.ch-quick .ch-btn', say: 'Tap a picture to answer Lumi.', delay: state.settings.guideDelay * 1000 + 3000 };
    return { sel: '.ch-btns .ch-btn', say: 'Tap a picture to talk to Lumi.', delay: state.settings.guideDelay * 1000 + 5000 };
  };
  A.AFTER.chat = () => {
    scrollDown();
    const f = A.stage.querySelector('[data-chat-form]');
    if (f) {
      const inp = f.querySelector('input');
      inp.addEventListener('input', () => { chat().typing = inp.value; });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inp.value.trim();
        if (!text) return;
        chat().typing = '';
        push({ from: 'child', text, how: 'typed' });
        respond(meaning(text));
      });
    }
  };

  Object.assign(A.ACTIONS, {
    chSay: (d) => { tone(620, 0.1, 0.05); childSays(d.v); return 'keep'; },
    chGroup: (d) => { chat().group = d.v; render(); },
    chMic: () => { if (chat().listening) { try { rec.stop(); } catch (e) { /* ignore */ } return; } listen(); },
    chHelpOff: () => { chat().help = false; render(); say('Thank you!'); }
  });
  // a fresh chat each time the child comes in from home
  const prevNav = A.ACTIONS.nav;
  A.ACTIONS.nav = (d, el, e) => { if (d.to === 'chat' && S.screen !== 'chat') S.chat = null; return prevNav(d, el, e); };
  // stop listening when leaving the chat
  const prevAfter = A.afterRender;
  A.afterRender = () => { if (S.screen !== 'chat' && rec && S.chat && S.chat.listening) { try { rec.abort(); } catch (e) { /* ignore */ } S.chat.listening = false; } if (prevAfter) prevAfter(); };
  A.chatMicAvailable = () => !!Rec;
})();
