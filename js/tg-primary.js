/*
  tg-primary.js: two-player games for Primary (7-12). See teamgames.js for the frame and helpers.
  Every game is played with Lumi (solo, Lumi takes its own turns) or with a grown-up (Together).
  - Hawker uncle       pretend food stall: order, serve, pay, say thank you, then swap roles
  - Find it            a busy picture: one gives a clue, the other finds it
  - Music echo         one plays a short drum beat, the other copies it
  - Lumi says          picture instruction cards: one leads, the other does it for real
  - Hide Lumi          hide Lumi in the room, find it by asking yes/no questions
  - Build it together  copy a block picture; the colour of the next block says whose turn it is
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const T = A.TG;
  const { ic, esc, L } = T;
  const K = 'stroke="#3B2F2F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
  const sv = (vb, body, w, h) => `<svg viewBox="${vb}" width="${w || '100%'}" height="${h || '100%'}" aria-hidden="true">${body}</svg>`;
  const otherOf = (w) => (w === 'child' ? 'other' : 'child');
  const nm = (w) => T.nameOf(w);
  const lumiBig = (mood, size, wave) => L.svg({ look: A.lookWith(), mood: mood || 'happy', size: size || 160, wave });
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const food = (id) => (A.foodSvg ? A.foodSvg(id) : '');
  const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  // ================================================================ 1. Hawker uncle
  const FPLATE = '<ellipse cx="50" cy="68" rx="42" ry="6" fill="#6B4A3A" opacity=".16"/><ellipse cx="48" cy="57" rx="42" ry="14" fill="#C7D9E6"/><ellipse cx="48" cy="54" rx="42" ry="14" fill="#E4EEF5"/><ellipse cx="48" cy="54" rx="31" ry="9.5" fill="#fff"/>';
  const PRATA = `${FPLATE}<ellipse cx="38" cy="50" rx="24" ry="9" fill="#D9963F"/><ellipse cx="38" cy="48.4" rx="22" ry="7.6" fill="#F2BE68"/><path d="M22 48c6-3 14-4 22-2M28 52c8 2 14 1 20-2" stroke="#D9963F" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="44" rx="20" ry="7.6" fill="#D9963F"/><ellipse cx="50" cy="42.6" rx="18" ry="6.4" fill="#F7CB7A"/><path d="M38 41c5-2 12-2 18 0" stroke="#FFE3A6" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M70 46h24c-1 9-6 13-12 13s-11-4-12-13z" fill="#7CC0B6"/><ellipse cx="82" cy="46" rx="12" ry="3.6" fill="#E9964C"/><circle cx="79" cy="45.4" r="1.6" fill="#FFF3DC"/><circle cx="85" cy="46.2" r="1.4" fill="#6DAE4E"/>`;
  const KACHANG = `<ellipse cx="50" cy="75" rx="30" ry="4.6" fill="#6B4A3A" opacity=".16"/><path d="M14 46h72c-1 18-16 28-36 28S15 64 14 46z" fill="#B9A6E0"/><path d="M18 56c8 12 18 16 32 16s24-4 32-16c-6 14-16 18-32 18S24 70 18 56z" fill="#8E78C9" opacity=".6"/>
    <path d="M20 46c0-22 14-36 30-36s30 14 30 36z" fill="#F7F4FB"/><path d="M26 30c8-6 16-2 24-6s14 2 22 0" stroke="#F26B8A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M22 40c10-4 18 0 28-3s18 1 28-1" stroke="#7CC26A" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="14" r="3" fill="#B5543B"/><circle cx="52" cy="12" r="3" fill="#B5543B"/><circle cx="58" cy="17" r="2.6" fill="#FFD23F"/><circle cx="38" cy="19" r="2.6" fill="#FFD23F"/><ellipse cx="50" cy="46" rx="36" ry="7" fill="#D4C6F2"/>`;
  const MILO = `<ellipse cx="50" cy="77" rx="18" ry="3.4" fill="#6B4A3A" opacity=".16"/><path d="M58 4 50 30" stroke="#E07A5F" stroke-width="4" stroke-linecap="round"/><path d="M32 16h36l-4 56c-.2 2.6-2.4 4.6-5 4.6H41c-2.6 0-4.8-2-5-4.6z" fill="#EEF4F8"/>
    <path d="M34 30h32l-3 41c-.2 2-1.8 3.4-3.8 3.4H40.8c-2 0-3.6-1.4-3.8-3.4z" fill="#8A5A3C"/><ellipse cx="50" cy="30" rx="16" ry="3" fill="#A87050"/><ellipse cx="50" cy="16" rx="18" ry="3.2" fill="#F6FBFE"/><path d="M38 36l1.4 32" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`;
  const DISHES = [
    { id: 'chickenrice', name: 'Chicken rice', price: 4, art: () => food('chicken') },
    { id: 'noodles', name: 'Noodles', price: 4, art: () => food('noodles') },
    { id: 'prata', name: 'Roti prata', price: 2, art: () => sv('0 0 100 80', PRATA) },
    { id: 'kaya', name: 'Kaya toast', price: 3, art: () => food('toastPlate') },
    { id: 'kachang', name: 'Ice kachang', price: 3, art: () => sv('0 0 100 80', KACHANG) },
    { id: 'milo', name: 'Milo', price: 2, art: () => sv('0 0 100 80', MILO) }
  ];
  const dish = (id) => DISHES.find((d) => d.id === id);
  const CARD_ART = sv('0 0 48 48', `<rect x="4" y="10" width="40" height="28" rx="5" fill="#9B87D9" ${K}/><rect x="4" y="16" width="40" height="5" fill="#3B2F2F"/><rect x="9" y="27" width="12" height="6" rx="1.6" fill="#FFD23F"/><path d="M28 30h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`);
  const READER_ART = sv('0 0 48 48', `<rect x="10" y="4" width="28" height="40" rx="6" fill="#5B6B7A" ${K}/><rect x="14" y="9" width="20" height="12" rx="2" fill="#BFE6C8"/><path d="M20 30q4-4 8 0M18 34q6-6 12 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  const coinArt = (v) => sv('0 0 48 48', `<circle cx="24" cy="24" r="19" fill="${v === 2 ? '#E8C25A' : '#D8DEE5'}" ${K}/><circle cx="24" cy="24" r="14" fill="none" stroke="${v === 2 ? '#C79A2E' : '#A9B3BE'}" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-size="19" font-weight="800" fill="#3B2F2F" font-family="Nunito, ui-rounded, sans-serif">$${v}</text>`);
  const customer = (g) => (g.round % 2 === 0 ? 'child' : 'other');
  const uncle = (g) => otherOf(customer(g));
  const hkTotal = (g) => g.order.reduce((s, id) => s + dish(id).price, 0);
  const hkPaid = (g) => g.coins.reduce((s, v) => s + v, 0);
  function hkRound(g) {
    g.phase = 'order';
    g.order = [];
    g.served = [];
    g.coins = [];
    g.bubble = null;
    g.need = T.level() === 3 ? 2 : 1;
    T.setTurn(g, customer(g));
  }
  function hkCounter(g) {
    // the ordered dishes plus a few others, shuffled once for this round
    const n = { 1: 3, 2: 4, 3: 6 }[T.level()] || 4;
    const others = T.shuffle(DISHES.map((d) => d.id).filter((id) => !g.order.includes(id))).slice(0, Math.max(0, n - g.order.length));
    g.counter = T.shuffle(g.order.concat(others));
  }
  function hkOrder(g, id) {
    if (g.order.includes(id) || g.phase !== 'order') return;
    g.order.push(id);
    T.tone(600 + g.order.length * 80, 0.15, 0.06);
    if (g.order.length < g.need) { T.render(); T.say(dish(id).name + '. And one more?'); return; }
    const line = g.order.length === 1 ? `One ${lc(dish(g.order[0]).name)}, please!` : `One ${lc(dish(g.order[0]).name)} and one ${lc(dish(g.order[1]).name)}, please!`;
    g.bubble = { who: customer(g), text: line };
    hkCounter(g);
    // the uncle cooks first (chop, then stir), then finds the order on the counter
    const K = A.KITCHEN;
    g.phase = K ? 'cook' : 'serve';
    g.cook = { step: 'chop', cut: [], p: 0, n: { 1: 2, 2: 3, 3: 4 }[T.level()] || 3 };
    T.render();
    T.say(line);
    T.later(() => { if (T.cur() === g) T.setTurn(g, uncle(g), g.phase === 'cook' ? 'Time to cook! Chop the carrot.' : undefined); }, 1700);
  }
  function hkCooked(g) {
    if (g.phase !== 'cook') return;
    g.cook.step = 'done';
    T.cheer();
    T.later(() => {
      if (T.cur() !== g) return;
      g.phase = 'serve';
      g.bubble = { who: uncle(g), text: 'All cooked!' };
      T.render();
      T.say('All cooked! Now find the order on the counter.');
      if (T.solo() && uncle(g) !== 'child') T.later(() => { if (T.cur() === g) T.setTurn(g, uncle(g)); }, 900);
    }, 900);
  }
  function hkCut(g, i) {
    const c = g.cook;
    if (g.phase !== 'cook' || c.step !== 'chop' || c.cut.includes(i)) return;
    c.cut.push(i);
    T.tone(300 + c.cut.length * 40, 0.08, 0.1);
    if (c.cut.length >= c.n) T.later(() => { if (T.cur() !== g || g.phase !== 'cook') return; c.step = 'stir'; T.render(); T.say('Now stir it in the wok. Round and round.'); }, 700);
  }
  function hkStir(g, dp) {
    const c = g.cook;
    if (g.phase !== 'cook' || c.step !== 'stir') return;
    c.p = Math.min(1, c.p + dp);
    if (c.p >= 1) hkCooked(g);
  }
  function hkServe(g, id, el) {
    if (g.phase !== 'serve') return;
    if (!g.order.includes(id) || g.served.includes(id)) {
      T.nope(el);
      T.say(`That's ${lc(dish(id).name)}. Look for the ${lc(dish(g.order.find((x) => !g.served.includes(x))).name)}.`);
      return;
    }
    g.served.push(id);
    T.cheer();
    if (g.served.length < g.order.length) { T.render(); return; }
    g.bubble = { who: uncle(g), text: T.level() === 3 ? `Here you go! That's $${hkTotal(g)}.` : 'Here you go!' };
    g.phase = 'pay';
    T.render();
    T.say(g.bubble.text);
    T.later(() => { if (T.cur() === g) T.setTurn(g, customer(g)); }, 1500);
  }
  function hkPaidDone(g) {
    if (g.phase !== 'pay') return;
    g.phase = 'thanks';
    g.bubble = { who: uncle(g), text: 'Paid! Thank you.' };
    T.tone(1046, 0.2, 0.07);
    T.render();
    T.later(() => { if (T.cur() === g) T.setTurn(g, customer(g), 'Now say thank you!'); }, 900);
  }
  function hkCoin(g, v, el) {
    const total = hkTotal(g);
    if (hkPaid(g) + v > total) { T.nope(el); T.say(`Too much! We need $${total}. Try a smaller coin.`); return; }
    g.coins.push(v);
    T.tone(880, 0.12, 0.06);
    if (hkPaid(g) === total) { hkPaidDone(g); return; }
    T.render();
  }
  function hkThanks(g, w) {
    if (g.phase !== 'thanks') return;
    if (w !== 'thanks') { T.say(w === 'yummy' ? 'Yummy!' : 'Bye-bye!'); T.later(() => { if (T.cur() === g) T.say('And say thank you.'); }, 900); return; }
    g.phase = 'bye';
    g.bubble = { who: customer(g), text: 'Thank you!' };
    T.render();
    T.say('Thank you!');
    T.later(() => {
      if (T.cur() !== g) return;
      g.bubble = { who: uncle(g), text: "You're welcome. Enjoy!" };
      g.round += 1;
      T.render();
      T.say("You're welcome. Enjoy!");
      T.later(() => {
        if (T.cur() !== g) return;
        if (g.round >= g.total) { T.win(g, { text: 'Yummy teamwork!', sub: 'You ordered, served and paid like real hawkers.', say: 'Well done! You were a great customer and a great uncle.' }); return; }
        hkRound(g);
      }, 1600);
    }, 1100);
  }
  const roleName = (g, who) => (who === customer(g) ? 'Customer' : 'Uncle');
  T.register({
    id: 'hawker', name: 'Hawker uncle', icon: 'sNoodles', tint: '#FCE6D6', ink: '#B4572E', kind: 'Pretend play', sub: 'Order, cook and serve at a food stall',
    ages: ['primary'], skill: 'social',
    init(g) {
      g.total = T.level() === 3 ? 4 : 2;
      g.phase = 'order'; g.order = []; g.served = []; g.coins = []; g.bubble = null; g.need = T.level() === 3 ? 2 : 1; g.counter = [];
      g.turn = 'child';
    },
    voice(g) {
      const c = customer(g);
      if (g.phase === 'order') return c === 'child' ? `You are the customer. What would you like? Pick ${g.need > 1 ? 'two things' : 'from the menu'}.` : (T.solo() ? 'Lumi is the customer. Lumi is choosing.' : `${nm(c)} is the customer. What would you like?`);
      if (g.phase === 'cook') { const who = g.turn === 'child' ? 'You are' : `${nm(g.turn)} is`; return g.cook.step === 'chop' ? `${who} the uncle. Slice the carrot along the dotted lines.` : `${who} the uncle. Stir the wok, round and round.`; }
      if (g.phase === 'serve') { const left = g.order.filter((x) => !g.served.includes(x)).map((x) => lc(dish(x).name)).join(' and the '); return g.turn === 'child' ? `You are the uncle. Find the ${left}.` : `${nm(g.turn)} is the uncle. Find the ${left}.`; }
      if (g.phase === 'pay') return T.level() === 3 ? `That's $${hkTotal(g)}. Pay with the coins.` : 'Pay with the card. Tap the card.';
      if (g.phase === 'thanks') return 'Say thank you!';
      return '';
    },
    stage(g) {
      const c = customer(g), u = uncle(g);
      const person = (who, side) => `<div class="hk-person ${side} ${g.turn === who ? 'on' : ''}">
          ${g.bubble && g.bubble.who === who ? `<div class="tg-say hk-bubble">${esc(g.bubble.text)}</div>` : ''}
          ${T.avatar(who, 100)}<span class="hk-role">${roleName(g, who)}</span><span class="hk-name">${esc(nm(who))}</span></div>`;
      let mid = '';
      if (g.phase === 'order') {
        mid = `<div class="hk-board"><div class="hk-board-title">Menu</div><div class="hk-menu">${DISHES.map((d) => `<button class="hk-dish ${g.order.includes(d.id) ? 'on' : ''}" data-a="tg" data-k="order" data-v="${d.id}">
            <span class="hk-art">${d.art()}</span><b>${d.name}</b>${T.level() === 3 ? `<span class="hk-price">$${d.price}</span>` : ''}</button>`).join('')}</div></div>`;
      } else if (g.phase === 'cook' && A.KITCHEN) {
        const K = A.KITCHEN;
        const c = g.cook;
        mid = `<div class="hk-ticket">${ic('journal', 30)}<span>${g.order.map((x) => esc(dish(x).name)).join(' + ')}</span></div>
          <div class="hk-cook"><span class="hk-cook-title">${c.step === 'chop' ? 'Chop' : c.step === 'stir' ? 'Stir' : 'Cooked!'}</span>${c.step === 'chop' ? K.chopHtml('carrot', c.n, c.cut) : K.wokHtml(['carrot', 'broccoli'], c.p) + K.bar(c.p)}</div>`;
      } else if (g.phase === 'serve') {
        mid = `<div class="hk-ticket">${ic('journal', 30)}<span>${g.order.map((x) => esc(dish(x).name)).join(' + ')}</span></div>
          <div class="hk-counter">${g.counter.map((id) => g.served.includes(id) ? '<span class="hk-gap"></span>' : `<button class="hk-dish plain" data-a="tg" data-k="serve" data-v="${id}" aria-label="${esc(dish(id).name)}"><span class="hk-art">${dish(id).art()}</span><b>${dish(id).name}</b></button>`).join('')}</div>
          <div class="hk-tray">${g.served.map((id) => `<span class="hk-art small">${dish(id).art()}</span>`).join('') || '<span class="hk-tray-note">Tray</span>'}</div>`;
      } else {
        const tray = `<div class="hk-tray">${g.order.map((id) => `<span class="hk-art small">${dish(id).art()}</span>`).join('')}</div>`;
        let pay = '';
        if (g.phase === 'pay') {
          pay = T.level() === 3
            ? `<div class="hk-pay"><span class="hk-total">$${hkTotal(g)}</span><div class="hk-coins">${[1, 2, 1, 2].map((v) => `<button class="hk-coin" data-a="tg" data-k="coin" data-v="${v}" aria-label="$${v} coin">${coinArt(v)}</button>`).join('')}</div>
                <div class="hk-coin-tray">${g.coins.map((v) => `<span class="hk-coin small">${coinArt(v)}</span>`).join('')}<span class="hk-paid">$${hkPaid(g)} of $${hkTotal(g)}</span></div></div>`
            : `<div class="hk-pay row"><button class="hk-card" data-a="tg" data-k="card" aria-label="Pay with the card">${CARD_ART}</button><span class="hk-arrow">${ic('arrow', 40)}</span><span class="hk-reader">${READER_ART}</span></div>`;
        } else {
          pay = `<div class="tg-talk hk-talk">${[['thanks', 'Thank you', 'kHeart'], ['yummy', 'Yummy!', 'smile'], ['bye', 'Bye-bye', 'come']].map(([k, label, icon]) => `<button class="tg-word" data-a="tg" data-k="word" data-v="${k}" ${g.phase === 'bye' ? 'disabled' : ''}>${ic(icon, 46)}<span>${label}</span></button>`).join('')}</div>`;
        }
        mid = tray + pay;
      }
      return `<div class="hk-awning"><span class="hk-sign">${ic('cutlery', 32)}<span>Lumi's Food Stall</span></span></div>
        <div class="hk-row">${person(c, 'left')}<div class="hk-mid">${mid}</div>${person(u, 'right')}</div>`;
    },
    after(g, box) {
      const K = A.KITCHEN;
      if (!K || !box || g.phase !== 'cook' || g.turn !== uncle(g) || (T.solo() && g.turn !== 'child')) return; // only the uncle cooks
      const c = g.cook;
      if (c.step === 'chop') K.chopWire(box, (i) => hkCut(g, i));
      else if (c.step === 'stir') K.wokWire(box, 1400, (dp) => {
        hkStir(g, dp);
        const wok = box.querySelector('.ck-wok');
        if (!wok) return;
        wok.style.setProperty('--p', c.p);
        wok.querySelector('.ck-wok-in').style.transform = `rotate(${Math.round(c.p * 540)}deg)`;
        const m = box.querySelector('.ev-meter i');
        if (m) m.style.width = c.p * 100 + '%';
      });
    },
    guide(g) {
      if (g.phase === 'order') return { sel: '.hk-dish:not(.on)', say: 'Pick from the menu.' };
      if (g.phase === 'cook') return g.cook.step === 'chop' ? { sel: '.ck-cut:not(.done)', say: 'Slice along the dotted line.' } : g.cook.step === 'stir' ? { sel: '.ck-wok', say: 'Stir round and round.' } : null;
      if (g.phase === 'serve') { const id = g.order.find((x) => !g.served.includes(x)); return id ? { sel: `.hk-counter [data-v="${id}"]`, say: `Find the ${lc(dish(id).name)}.` } : null; }
      if (g.phase === 'pay') return T.level() === 3 ? { sel: '.hk-coin', say: 'Tap the coins to pay.' } : { sel: '.hk-card', say: 'Tap the card.' };
      if (g.phase === 'thanks') return { sel: '[data-k="word"][data-v="thanks"]', say: 'Say thank you.' };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'order' && g.turn === customer(g)) hkOrder(g, d.v);
      else if (k === 'serve' && g.turn === uncle(g)) hkServe(g, d.v, el);
      else if (k === 'card' && g.turn === customer(g)) hkPaidDone(g);
      else if (k === 'coin' && g.phase === 'pay' && g.turn === customer(g)) hkCoin(g, Number(d.v), el);
      else if (k === 'word' && g.turn === customer(g)) hkThanks(g, d.v);
    },
    lumiTurn(g) {
      if (g.phase === 'order' && g.order.length < g.need) {
        const pickOne = () => { const left = DISHES.filter((d) => !g.order.includes(d.id)); hkOrder(g, rnd(left).id); };
        pickOne();
        if (g.need > 1) T.later(() => { if (T.cur() === g && g.phase === 'order') pickOne(); }, 1100);
      } else if (g.phase === 'cook') {
        // Lumi cooks: chop, chop, chop, then a good stir
        const c = g.cook;
        const chop = () => {
          if (T.cur() !== g || g.phase !== 'cook' || c.step !== 'chop') return;
          const i = [...Array(c.n).keys()].find((k) => !c.cut.includes(k));
          if (i == null) { T.later(stir, 1400); return; }
          hkCut(g, i);
          T.render();
          if (c.cut.length < c.n) T.later(chop, 650);
          else T.later(stir, 1400);
        };
        const stir = () => {
          if (T.cur() !== g || g.phase !== 'cook' || c.step !== 'stir') return;
          hkStir(g, 0.26);
          if (g.phase === 'cook' && c.step === 'stir') { T.render(); T.later(stir, 450); }
        };
        T.later(chop, 700);
      } else if (g.phase === 'serve') {
        const step = () => { if (T.cur() !== g || g.phase !== 'serve') return; const id = g.order.find((x) => !g.served.includes(x)); if (id) { hkServe(g, id); if (g.phase === 'serve') T.later(step, 900); } };
        step();
      } else if (g.phase === 'pay') {
        if (T.level() !== 3) { hkPaidDone(g); return; }
        const step = () => { if (T.cur() !== g || g.phase !== 'pay') return; const left = hkTotal(g) - hkPaid(g); hkCoin(g, left >= 2 ? 2 : 1); if (g.phase === 'pay') T.later(step, 700); };
        step();
      } else if (g.phase === 'thanks') {
        hkThanks(g, 'thanks');
      }
    }
  });

  // ================================================================ 2. Find it
  const KIND = { food: 'you can eat', drink: 'you can drink', toy: 'you play with', clothes: 'you can wear', vehicle: 'you can ride in', plant: 'that grows', school: 'you use at school', rain: 'you use when it rains', sky: 'you see in the sky', music: 'that makes a sound', animal: 'that is an animal', read: 'you can read' };
  const OBJ = [
    { id: 'apple', icon: 'apple', name: 'apple', colour: 'red', kind: 'food' },
    { id: 'balloon', icon: 'kBalloon', name: 'balloon', colour: 'red', kind: 'toy' },
    { id: 'bag', icon: 'bag', name: 'school bag', colour: 'red', kind: 'school' },
    { id: 'umbrella', icon: 'umbrella', name: 'umbrella', colour: 'pink', kind: 'rain' },
    { id: 'shoes', icon: 'shoes', name: 'shoe', colour: 'blue', kind: 'clothes' },
    { id: 'shirt', icon: 'sShirt', name: 'T-shirt', colour: 'blue', kind: 'clothes' },
    { id: 'cap', icon: 'cap2', name: 'cap', colour: 'green', kind: 'clothes' },
    { id: 'bottle', icon: 'bottle', name: 'water bottle', colour: 'blue', kind: 'drink' },
    { id: 'juice', icon: 'drink', name: 'cup of juice', colour: 'orange', kind: 'drink' },
    { id: 'bus', icon: 'bus', name: 'bus', colour: 'yellow', kind: 'vehicle' },
    { id: 'train', icon: 'sTrain', name: 'train', colour: 'white', kind: 'vehicle' },
    { id: 'tree', icon: 'sTree', name: 'tree', colour: 'green', kind: 'plant' },
    { id: 'plant', icon: 'rPlant', name: 'plant in a pot', colour: 'green', kind: 'plant' },
    { id: 'sun', icon: 'sSun', name: 'sun', colour: 'yellow', kind: 'sky' },
    { id: 'bell', icon: 'kBell', name: 'bell', colour: 'yellow', kind: 'music' },
    { id: 'notes', icon: 'music', name: 'music notes', colour: 'purple', kind: 'music' },
    { id: 'cookie', icon: 'snack', name: 'cookie', colour: 'brown', kind: 'food' },
    { id: 'dog', icon: 'kPet', name: 'dog', colour: 'brown', kind: 'animal' },
    { id: 'book', icon: 'sBook', name: 'book', colour: 'purple', kind: 'read' },
    { id: 'pencil', icon: 'sPencil', name: 'notebook', colour: 'yellow', kind: 'school' }
  ];
  const obj = (id) => OBJ.find((o) => o.id === id);
  // spots in the picture (percent of the scene), kept clear of the turn chip at the top left
  const SPOTS = [[32, 16], [52, 14], [72, 16], [90, 22], [12, 44], [32, 42], [54, 42], [76, 44], [92, 58], [14, 76], [38, 74], [62, 76], [84, 82]];
  const SCENES = {
    park: '<rect width="1000" height="520" fill="#DCEEF7"/><circle cx="880" cy="70" r="44" fill="#FBE7A1"/><rect y="250" width="1000" height="270" fill="#A9D68E"/><path d="M0 250 Q500 220 1000 250" fill="#B9DE9F"/><path d="M380 520 Q470 380 620 250 L700 250 Q560 400 520 520z" fill="#F0DDBB"/>',
    kitchen: '<rect width="1000" height="520" fill="#FFF3D9"/><g stroke="#F3E2BE" stroke-width="2">' + Array.from({ length: 12 }, (_, i) => `<path d="M${i * 90} 0v300"/>`).join('') + Array.from({ length: 4 }, (_, i) => `<path d="M0 ${i * 80}h1000"/>`).join('') + '</g><rect y="300" width="1000" height="40" fill="#D9A27E"/><rect y="340" width="1000" height="180" fill="#F2D5B8"/>',
    mrt: '<rect width="1000" height="520" fill="#E5EDF3"/><rect width="1000" height="60" fill="#CCD8E2"/><rect y="330" width="1000" height="18" fill="#FFD23F"/><rect y="348" width="1000" height="172" fill="#C3CED8"/><rect x="560" y="110" width="420" height="210" rx="26" fill="#fff" opacity=".7"/>'
  };
  const SCENE_IDS = ['park', 'kitchen', 'mrt'];
  const finder = (g) => (g.round % 2 === 0 ? 'child' : 'other');
  const giver = (g) => otherOf(finder(g));
  function clueFor(t) {
    if (T.level() === 1) return { text: `Find the ${t.name}!`, pic: true };
    if (T.level() === 2) return { text: `Find something ${KIND[t.kind]}.`, pic: false };
    return { text: `Find something ${t.colour} ${KIND[t.kind]}.`, pic: false };
  }
  // does object o also fit the clue for target t? (then the clue would not be clear)
  function fitsClue(o, t) {
    if (T.level() === 1) return o.id === t.id;
    if (T.level() === 2) return o.kind === t.kind;
    return o.kind === t.kind && o.colour === t.colour;
  }
  const sceneSize = () => ({ 1: 8, 2: 10, 3: 12 }[T.level()] || 10);
  function lay(g, ids) {
    const spots = T.shuffle(SPOTS).slice(0, ids.length);
    g.items = T.shuffle(ids).map((id, i) => ({ id, x: spots[i][0], y: spots[i][1], r: Math.round(Math.random() * 16 - 8) }));
  }
  // a picture where the clue fits only the target; on Challenge add look-alikes (same colour or same kind)
  function fiScene(g, t) {
    const n = sceneSize();
    const pool = T.shuffle(OBJ.filter((o) => o.id !== t.id && !fitsClue(o, t)));
    let picks = pool;
    if (T.level() === 3) {
      const near = pool.filter((o) => o.colour === t.colour || o.kind === t.kind);
      picks = near.slice(0, 4).concat(pool.filter((o) => !near.slice(0, 4).includes(o)));
    }
    lay(g, picks.slice(0, n - 1).map((o) => o.id).concat(t.id));
    g.target = t.id;
    g.clue = clueFor(t);
    g.wrong = [];
  }
  function fiRound(g) {
    g.scene = SCENE_IDS[g.round % SCENE_IDS.length];
    g.wrong = []; g.found = false; g.lumiLook = null;
    if (giver(g) === 'child') {
      // the child is the clue-giver: pick a secret thing from three in the picture
      g.phase = 'secret';
      g.target = null; g.clue = null;
      g.options = T.shuffle(OBJ).slice(0, 3).map((o) => o.id);
      const rest = T.shuffle(OBJ.filter((o) => !g.options.includes(o.id))).slice(0, sceneSize() - 3).map((o) => o.id);
      lay(g, g.options.concat(rest));
      T.setTurn(g, 'child', T.solo() ? 'Your turn to give a clue. Pick a secret thing for Lumi to find.' : `Your turn to give a clue. Pick a secret thing for ${nm('other')} to find.`);
    } else {
      g.phase = 'find';
      fiScene(g, rnd(OBJ));
      T.setTurn(g, 'child', T.solo() ? `Lumi says: ${g.clue.text}` : `${nm('other')}, read the clue to ${nm('child')}. ${g.clue.text}`);
    }
  }
  function fiPickSecret(g, id) {
    const t = obj(id);
    g.target = id;
    g.clue = clueFor(t);
    // swap out anything else the clue would fit, so it points to the secret thing only
    g.items.forEach((it) => {
      if (it.id !== id && fitsClue(obj(it.id), t)) {
        const sw = OBJ.find((o) => !fitsClue(o, t) && !g.items.some((x) => x.id === o.id));
        if (sw) it.id = sw.id;
      }
    });
    g.phase = 'find';
    T.cheer();
    T.setTurn(g, 'other', `${T.solo() ? 'Your clue for Lumi' : 'Your clue'}: ${g.clue.text}`);
  }
  function fiTap(g, id, el) {
    if (g.phase !== 'find' || g.found) return;
    if (id !== g.target) {
      T.nope(el);
      if (!g.wrong.includes(id)) g.wrong.push(id);
      T.say(`That's the ${obj(id).name}. Try again! ${g.clue.text}`);
      T.render();
      return;
    }
    g.found = true;
    T.cheer();
    T.say(`Yes! The ${obj(id).name}! ${g.turn === 'other' ? (T.solo() ? 'Lumi found it.' : `${nm('other')} found it.`) : 'You found it!'}`);
    g.round += 1;
    T.render();
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'Super finders!', say: 'Great looking and great clues!' }); return; }
      fiRound(g);
    }, 1800);
  }
  T.register({
    id: 'findit', name: 'Find it', icon: 'eye', tint: '#E3F1FB', ink: '#3D74B5', kind: 'Looking', sub: 'One gives a clue, one finds it',
    ages: ['primary'], skill: 'thinking',
    init(g) {
      g.total = 4;
      g.scene = 'park'; g.phase = 'find'; g.items = []; g.wrong = []; g.found = false; g.options = []; g.lumiLook = null;
      fiScene(g, rnd(OBJ));
      g.turn = 'child';
    },
    voice(g) {
      if (g.phase === 'secret') return 'Pick a secret thing for the other player to find.';
      if (!g.clue) return '';
      if (g.turn === 'child') return g.clue.text;
      return T.solo() ? `Lumi is looking. ${g.clue.text}` : `${nm('other')}, ${lc(g.clue.text)}`;
    },
    stage(g) {
      const bg = `<svg class="fi-bg" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">${SCENES[g.scene] || SCENES.park}</svg>`;
      const size = T.level() === 3 ? 70 : 82;
      const items = g.items.map((it) => `<button class="fi-obj ${g.wrong.includes(it.id) ? 'tried' : ''} ${g.found && it.id === g.target ? 'found' : ''} ${g.lumiLook === it.id ? 'looking' : ''}" data-a="tg" data-k="obj" data-v="${it.id}" aria-label="${esc(obj(it.id).name)}"
        style="left:${it.x}%;top:${it.y}%;--r:${it.r}deg">${ic(obj(it.id).icon, size)}</button>`).join('');
      return `${bg}<div class="fi-field">${items}</div>`;
    },
    bar(g) {
      if (g.phase === 'secret') {
        return `<div class="bar fi-bar"><span class="fi-label">${ic('kHint', 34)}<span>Pick a secret thing</span></span>
          <div class="fi-opts">${g.options.map((id) => `<button class="fi-opt" data-a="tg" data-k="secret" data-v="${id}">${ic(obj(id).icon, 52)}<span>${esc(obj(id).name)}</span></button>`).join('')}</div></div>`;
      }
      if (!g.clue) return '';
      const t = obj(g.target);
      const who = giver(g);
      return `<div class="bar fi-bar">
        <span class="fi-from">${T.avatar(who, 54)}<span>${esc(who === 'child' ? 'Your clue' : `${nm(who)}'s clue`)}</span></span>
        <div class="fi-clue">${g.clue.pic ? `<span class="fi-clue-pic">${ic(t.icon, 60)}</span>` : `<span class="fi-clue-pic">${ic('eye', 46)}</span>`}<b>${esc(g.clue.text)}</b></div>
        ${A.speakBtn(g.clue.text, 60)}
      </div>`;
    },
    guide(g) {
      if (g.phase === 'secret') return { sel: '.fi-opt', say: 'Pick a secret thing.' };
      if (g.phase === 'find' && g.target && !g.found) return { sel: `.fi-obj[data-v="${g.target}"]`, say: g.clue.text, delay: 9000 };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'secret' && g.phase === 'secret') { fiPickSecret(g, d.v); return; }
      if (k === 'obj' && g.turn === finder(g)) fiTap(g, d.v, el);
    },
    lumiTurn(g) {
      if (g.phase !== 'find' || !g.target || g.found) return;
      // Lumi looks around, sometimes tries a wrong one first (said kindly), then finds it
      const wrong = Math.random() < 0.5 && g.wrong.length === 0 ? rnd(g.items.filter((it) => it.id !== g.target)) : null;
      const look = (id, then) => { g.lumiLook = id; T.render(); T.later(() => { if (T.cur() === g) { g.lumiLook = null; then(); } }, 1000); };
      if (wrong) {
        T.say('Hmm, is it this one?');
        look(wrong.id, () => { g.wrong.push(wrong.id); T.render(); T.say(`Oops, that's the ${obj(wrong.id).name}. Let me look again.`); T.later(() => { if (T.cur() === g) look(g.target, () => fiTap(g, g.target)); }, 1500); });
      } else {
        T.say('I think I see it!');
        look(g.target, () => fiTap(g, g.target));
      }
    }
  });

  // ================================================================ 3. Music echo
  const DRUMS = [
    { c: '#EF6F5E', d: '#C94E3F', f: 262, name: 'red' },
    { c: '#FFD23F', d: '#D8A81E', f: 330, name: 'yellow' },
    { c: '#5B8FD9', d: '#3E6EB5', f: 392, name: 'blue' },
    { c: '#7BC67E', d: '#559E58', f: 523, name: 'green' }
  ];
  const drumArt = (dr) => sv('0 0 120 110', `<ellipse cx="60" cy="98" rx="48" ry="8" fill="#6B4A3A" opacity=".15"/><path d="M14 34v44c0 10 20 18 46 18s46-8 46-18V34" fill="${dr.c}" ${K}/>
    <path d="M14 50c10 6 28 9 46 9s36-3 46-9" fill="none" stroke="${dr.d}" stroke-width="3"/><path d="M26 44l12 40M50 48l6 40M74 48l-6 40M94 44l-12 40" stroke="#fff" stroke-width="2.4" opacity=".5"/>
    <ellipse cx="60" cy="34" rx="46" ry="16" fill="#FFF8EC" ${K}/><ellipse cx="60" cy="34" rx="34" ry="10" fill="none" stroke="#EADCC5" stroke-width="2"/>`);
  const lens = () => ({ 1: [2, 2, 3, 3], 2: [2, 3, 3, 4], 3: [3, 4, 4, 5] }[T.level()] || [2, 3, 3, 4]);
  const drumsNow = () => (T.level() === 3 ? 4 : 3);
  const ecLeader = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  function hit(i) {
    T.tone(DRUMS[i].f, 0.32, 0.12);
    const el = A.stage.querySelector(`.ec-drum[data-v="${i}"]`);
    if (el) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
  }
  function playBack(g, pattern, done) {
    g.busy = true;
    T.render();
    pattern.forEach((i, n) => T.later(() => { if (T.cur() === g) hit(i); }, 450 + n * 650));
    T.later(() => { if (T.cur() !== g) return; g.busy = false; if (done) done(); }, 450 + pattern.length * 650 + 250);
  }
  function ecRound(g) {
    g.phase = 'lead';
    g.pattern = [];
    g.input = [];
    g.len = lens()[g.round] || 3;
    T.setTurn(g, ecLeader(g));
  }
  function ecToEcho(g) {
    g.phase = 'echo';
    g.input = [];
    g.busy = true;
    T.render();
    T.later(() => { if (T.cur() === g) { g.busy = false; T.setTurn(g, otherOf(ecLeader(g)), `Now copy it, ${otherOf(ecLeader(g)) === 'child' ? (T.state.childName || 'you') : nm('other')}!`); } }, 700);
  }
  function ecDrum(g, i, el) {
    if (g.busy) return;
    hit(i);
    if (g.phase === 'lead') {
      g.pattern.push(i);
      if (g.pattern.length >= g.len) ecToEcho(g); else T.render();
      return;
    }
    const want = g.pattern[g.input.length];
    if (i !== want) {
      T.nope(el);
      g.input = [];
      T.say('Oops! Listen again.');
      g.busy = true;
      T.later(() => { if (T.cur() === g) playBack(g, g.pattern, () => { T.render(); T.say('Your turn to copy.'); }); }, 900);
      return;
    }
    g.input.push(i);
    if (g.input.length < g.pattern.length) { T.render(); return; }
    g.round += 1;
    g.busy = true;
    T.cheer();
    T.render();
    T.say(rnd(['You copied it!', 'Perfect echo!', 'Great listening!']));
    T.later(() => {
      if (T.cur() !== g) return;
      g.busy = false;
      if (g.round >= g.total) { T.win(g, { text: 'Music makers!', say: 'Great listening! You made music together.' }); return; }
      ecRound(g);
    }, 1400);
  }
  T.register({
    id: 'echo', name: 'Music echo', icon: 'music', tint: '#EFE7FB', ink: '#7055B8', kind: 'Listening', sub: 'Play a beat, copy the beat',
    ages: ['primary'], skill: 'thinking',
    init(g) { g.total = 4; g.phase = 'lead'; g.pattern = []; g.input = []; g.len = lens()[0]; g.busy = false; g.turn = 'other'; },
    voice(g) {
      if (g.phase === 'lead') return g.turn === 'child' ? `You lead! Play ${g.len} drums.` : (T.solo() ? 'Listen to Lumi play.' : `${nm('other')}, play ${g.len} drums.`);
      return g.turn === 'child' ? 'Now copy the beat.' : (T.solo() ? 'Lumi is copying.' : `${nm('other')}, copy the beat.`);
    },
    stage(g) {
      const n = drumsNow();
      const filled = g.phase === 'lead' ? g.pattern : g.input;
      const slots = Array.from({ length: g.len }, (_, k) => `<span class="ec-slot ${k < filled.length ? 'on' : ''}" style="${k < filled.length ? `background:${DRUMS[filled[k]].c}` : ''}"></span>`).join('');
      const who = g.turn === 'child' ? 'You' : nm(g.turn);
      return `<div class="ec-wrap">
        <div class="ec-head"><span class="ec-what">${g.phase === 'lead' ? `${ic('music', 34)}<span>${esc(who)} ${g.turn === 'child' ? 'play' : 'plays'}</span>` : `${ic('restart', 30)}<span>${esc(who)} ${g.turn === 'child' ? 'copy' : 'copies'}</span>`}</span><span class="ec-slots">${slots}</span></div>
        <div class="ec-drums n${n}">${DRUMS.slice(0, n).map((dr, i) => `<button class="ec-drum" data-a="tg" data-k="drum" data-v="${i}" aria-label="${dr.name} drum" ${g.busy ? 'disabled' : ''}>${drumArt(dr)}</button>`).join('')}</div>
        <div class="ec-foot">${g.phase === 'echo' ? `<button class="ec-again" data-a="tg" data-k="again" data-any="1" ${g.busy ? 'disabled' : ''}>${ic('speaker', 30)}<span>Listen again</span></button>` : ''}</div>
      </div>`;
    },
    guide(g) {
      if (g.busy) return null;
      if (g.phase === 'echo') return { sel: `.ec-drum[data-v="${g.pattern[g.input.length]}"]`, say: 'Copy the beat.', delay: 9000 };
      return { sel: '.ec-drum', say: 'Tap the drums.' };
    },
    tap(g, k, el, d) {
      if (k === 'again' && g.phase === 'echo' && !g.busy) { g.input = []; playBack(g, g.pattern, () => T.render()); return; }
      if (k === 'drum') ecDrum(g, Number(d.v), el);
    },
    lumiTurn(g) {
      if (g.busy) return;
      if (g.phase === 'lead') {
        const pat = Array.from({ length: g.len }, () => Math.floor(Math.random() * drumsNow()));
        g.busy = true;
        T.render();
        pat.forEach((i, k) => T.later(() => { if (T.cur() === g) { g.pattern.push(i); T.render(); hit(i); } }, 300 + k * 700));
        T.later(() => { if (T.cur() === g) { g.busy = false; ecToEcho(g); } }, 300 + pat.length * 700 + 300);
      } else if (g.phase === 'echo') {
        g.busy = true;
        T.render();
        const head = g.pattern.slice(0, -1);
        head.forEach((i, k) => T.later(() => { if (T.cur() === g) { g.input.push(i); T.render(); hit(i); } }, 300 + k * 700));
        T.later(() => { if (T.cur() !== g) return; g.busy = false; g.input = head.slice(); ecDrum(g, g.pattern[g.pattern.length - 1]); }, 300 + head.length * 700);
      }
    }
  });

  // ================================================================ 4. Lumi says
  // little pictures of a child doing each action
  const SKIN = '#FFD3AE';
  const limb = (d, col) => `<path d="${d}" stroke="#3B2F2F" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d}" stroke="${col || SKIN}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  function kidPose(pose) {
    const arms = {
      nose: 'M17 22l-3 9M31 22q5-6-6-9',
      sit: 'M17 22l-3 8M31 22l3 8',
      stand: 'M17 22l-3 9M31 22l3 9',
      clap: 'M17 22q1 7 7 5M31 22q-1 7-7 5',
      wave: 'M17 22l-3 9M31 22l6-9',
      jump: 'M17 22l-6-9M31 22l6-9',
      head: 'M17 22q-7-6-1-12M31 22q7-6 1-12',
      turn: 'M17 22l-3 9M31 22l3 9'
    }[pose];
    const legs = pose === 'sit' ? 'M20 33l-1 3h-7v7M28 33l1 3h7v7' : pose === 'jump' ? 'M21 33l-4 8M27 33l4 8' : 'M21 33v10M27 33v10';
    let extra = '';
    if (pose === 'sit') extra += `<rect x="9" y="33" width="30" height="4" rx="2" fill="#C99A6B" ${K}/><path d="M12 37v9M36 37v9" stroke="#3B2F2F" stroke-width="2.4" stroke-linecap="round"/>`;
    if (pose === 'jump') extra += '<ellipse cx="24" cy="46.5" rx="9" ry="1.6" fill="#3B2F2F" opacity=".15"/><path d="M6 22h4M38 22h4M5 30h4M39 30h4" stroke="#8EB8E5" stroke-width="2" stroke-linecap="round"/>';
    if (pose === 'clap') extra += '<path d="M24 21l-1-4M28 21l2-3M20 21l-3-2" stroke="#F4B400" stroke-width="2" stroke-linecap="round"/>';
    if (pose === 'wave') extra += '<path d="M41 9q3 3 0 6M44 6q4 5 0 10" stroke="#8EB8E5" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    if (pose === 'turn') extra += '<path d="M7 31a18 8 0 1 0 8-13" fill="none" stroke="#9B87D9" stroke-width="2.6" stroke-linecap="round"/><path d="M12 15l3 3-4 2" fill="none" stroke="#9B87D9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    if (pose === 'stand') extra += '<path d="M41 34V16M37 20l4-4 4 4" fill="none" stroke="#5DAA68" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';
    if (pose === 'nose') extra += '';
    return sv('0 0 48 48', `${extra}${limb(legs, '#5B8FD9')}<path d="M17 33v-9a7 7 0 0 1 14 0v9z" fill="#7BC67E" ${K}/>${limb(arms)}
      <circle cx="24" cy="12" r="7" fill="${SKIN}" ${K}/><path d="M17 11a7 7 0 0 1 14 0q-4-3-7-1q-4-2-7 1z" fill="#A87B50" ${K}/>
      <circle cx="21.6" cy="12.6" r="1" fill="#3B2F2F"/><circle cx="26.4" cy="12.6" r="1" fill="#3B2F2F"/><path d="M22.2 15.4q1.8 1.4 3.6 0" fill="none" stroke="#3B2F2F" stroke-width="1.1" stroke-linecap="round"/>`);
  }
  const ACTS = [
    { id: 'nose', text: 'Touch your nose', done: 'I touched my nose!' },
    { id: 'sit', text: 'Sit down', done: 'I sat down!' },
    { id: 'stand', text: 'Stand up tall', done: 'I stood up tall!' },
    { id: 'clap', text: 'Clap two times', done: 'Clap, clap!' },
    { id: 'wave', text: 'Wave hello', done: 'Hello!' },
    { id: 'jump', text: 'Jump', done: 'Boing!' },
    { id: 'head', text: 'Hands on your head', done: 'Hands on my head!' },
    { id: 'turn', text: 'Turn around', done: 'Wheee, I turned around!' }
  ];
  const act = (id) => ACTS.find((a) => a.id === id);
  const lsLeader = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  const cardText = (ids) => (ids.length === 1 ? act(ids[0]).text : `${act(ids[0]).text}, then ${lc(act(ids[1]).text)}`);
  function lsDeal(g) {
    const two = T.level() === 3;
    const deck = T.shuffle(ACTS.map((a) => a.id));
    g.options = [0, 1, 2].map((k) => (two ? [deck[k * 2], deck[k * 2 + 1]] : [deck[k]]));
  }
  function lsRound(g) {
    g.phase = 'pick';
    g.card = null;
    g.doing = null;
    lsDeal(g);
    T.setTurn(g, lsLeader(g));
  }
  function lsPick(g, k) {
    if (g.phase !== 'pick') return;
    g.card = g.options[k];
    g.phase = 'show';
    T.cheer();
    const lead = lsLeader(g);
    const line = `${lead === 'child' ? 'You say' : `${nm(lead)} says`}: ${cardText(g.card)}!`;
    T.render();
    T.say(line);
    T.later(() => { if (T.cur() === g) { g.phase = 'do'; T.setTurn(g, otherOf(lead), ''); } }, 1900);
  }
  function lsDone(g) {
    if (g.phase !== 'do') return;
    g.phase = 'well';
    g.round += 1;
    g.doing = null;
    T.cheer();
    T.say(rnd(['Well done!', 'You did it!', 'Great moving!']));
    T.render();
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'Great listening!', say: 'Great listening and great moving!' }); return; }
      lsRound(g);
    }, 1300);
  }
  T.register({
    id: 'lumisays', name: 'Lumi says', icon: 'jump', tint: '#E7F4E0', ink: '#4F8A3F', kind: 'Following', sub: 'Lead with picture cards, then swap',
    ages: ['primary'], skill: 'communication',
    init(g) { g.total = 6; g.phase = 'pick'; g.card = null; g.doing = null; g.turn = 'other'; lsDeal(g); },
    voice(g) {
      if (g.phase === 'pick') return g.turn === 'child' ? 'You lead! Pick a card.' : (T.solo() ? 'Lumi is picking a card.' : `${nm('other')}, pick a card.`);
      if (!g.card) return '';
      if (g.phase !== 'do') return '';
      return g.turn === 'child' ? `${cardText(g.card)}! Then tap Done.` : (T.solo() ? `Lumi is doing it: ${lc(cardText(g.card))}.` : `${nm('other')}: ${lc(cardText(g.card))}! Then tap Done.`);
    },
    stage(g) {
      if (g.phase === 'pick') {
        return `<div class="ls-pick"><div class="tg-say ls-q">${esc(g.turn === 'child' ? 'You lead. Pick a card!' : `${nm(g.turn)} picks a card`)}</div>
          <div class="ls-cards">${g.options.map((ids, k) => `<button class="ls-card" data-a="tg" data-k="pick" data-v="${k}">
            <span class="ls-pics">${ids.map((id) => `<span class="ls-pic">${kidPose(id)}</span>`).join(`<span class="ls-then">${ic('chev', 22)}</span>`)}</span><b>${esc(cardText(ids))}</b></button>`).join('')}</div></div>`;
      }
      const lead = lsLeader(g);
      const doer = otherOf(lead);
      const lumiDoing = T.solo() && doer === 'other';
      const showDo = g.phase === 'do';
      return `<div class="ls-do">
        <div class="ls-big"><span class="ls-from">${T.avatar(lead, 44)}<span>${esc(lead === 'child' ? 'You say' : nm(lead) + ' says')}</span></span>
          <span class="ls-pics big">${g.card.map((id) => `<span class="ls-pic">${kidPose(id)}</span>`).join(`<span class="ls-then">${ic('chev', 30)}</span>`)}</span>
          <b>${esc(cardText(g.card))}!</b>${A.speakBtn(cardText(g.card), 56)}</div>
        <div class="ls-doer">${lumiDoing ? `<div class="ls-lumi ${g.doing ? 'go-' + g.doing : ''}">${lumiBig(g.doing ? 'excited' : 'happy', 190)}</div><span class="ls-doer-name">${showDo ? 'Lumi does it!' : 'Lumi is listening'}</span>`
          : `${T.avatar(doer, 120)}<span class="ls-doer-name">${esc(doer === 'child' ? 'Your turn to do it!' : nm(doer) + ', do it!')}</span>
          <button class="primary ls-done" data-a="tg" data-k="done" ${showDo ? '' : 'disabled'}>${ic('check', 32)}<span>Done</span></button>`}</div>
      </div>`;
    },
    guide(g) {
      if (g.phase === 'pick') return { sel: '.ls-card', say: 'Pick a card.' };
      if (g.phase === 'do') return { sel: '.ls-done', say: 'Do it, then tap Done.', delay: 7000 };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'pick' && g.turn === lsLeader(g)) lsPick(g, Number(d.v));
      else if (k === 'done' && g.turn !== lsLeader(g)) lsDone(g);
    },
    lumiTurn(g) {
      if (g.phase === 'pick') { lsPick(g, Math.floor(Math.random() * 3)); return; }
      if (g.phase === 'do') {
        g.doing = g.card[0];
        T.render();
        T.say(act(g.card[0]).done);
        const second = g.card[1];
        T.later(() => {
          if (T.cur() !== g) return;
          if (second) { g.doing = second; T.render(); T.say(act(second).done); T.later(() => { if (T.cur() === g) lsDone(g); }, 1900); } else lsDone(g);
        }, 1900);
      }
    }
  });

  // ================================================================ 5. Hide Lumi
  const PLACES = [
    { id: 'bed', name: 'under the bed', short: 'the bed', x: 21, y: 74, w: 26, at: { under: 1, nearBed: 1 } },
    { id: 'wardrobe', name: 'on top of the wardrobe', short: 'the wardrobe', x: 88, y: 50, w: 13, at: { high: 1 } },
    { id: 'box', name: 'in the toy box', short: 'the toy box', x: 42, y: 80, w: 11, at: { inside: 1, nearBed: 1 } },
    { id: 'table', name: 'under the table', short: 'the table', x: 66, y: 76, w: 17, at: { under: 1 } },
    { id: 'curtain', name: 'behind the curtain', short: 'the curtain', x: 48, y: 36, w: 15, at: { behind: 1 } },
    { id: 'plant', name: 'behind the plant', short: 'the plant', x: 9, y: 44, w: 9, at: { behind: 1 } }
  ];
  const QUESTIONS = [
    { k: 'high', q: 'Is Lumi up high?', icon: 'up' },
    { k: 'under', q: 'Is Lumi under something?', icon: 'down' },
    { k: 'inside', q: 'Is Lumi inside something?', icon: 'open' },
    { k: 'behind', q: 'Is Lumi behind something?', icon: 'eye' },
    { k: 'nearBed', q: 'Is Lumi near the bed?', icon: 'sNap' }
  ];
  const place = (id) => PLACES.find((p) => p.id === id);
  const placesNow = () => (T.level() === 1 ? PLACES.filter((p) => ['bed', 'wardrobe', 'box', 'table'].includes(p.id)) : PLACES);
  const questionsNow = () => QUESTIONS.filter((q) => placesNow().some((p) => p.at[q.k]));
  const truth = (spot, k) => !!place(spot).at[k];
  const mustAsk = () => ({ 1: 0, 2: 1, 3: 2 }[T.level()]);
  const hider = (g) => (g.round % 2 === 0 ? 'other' : 'child');
  const seeker = (g) => otherOf(hider(g));
  const PLACE_ART = {
    bed: sv('0 0 120 70', `<rect x="4" y="8" width="12" height="58" rx="5" fill="#A87B50" ${K}/><rect x="10" y="26" width="104" height="22" rx="8" fill="#fff" ${K}/><rect x="40" y="24" width="72" height="26" rx="9" fill="#8EC5E8" ${K}/><rect x="16" y="20" width="26" height="12" rx="6" fill="#fff" ${K}/><rect x="12" y="48" width="104" height="8" rx="3" fill="#A87B50" ${K}/><path d="M18 56v10M108 56v10" stroke="#3B2F2F" stroke-width="3" stroke-linecap="round"/>`),
    wardrobe: sv('0 0 60 110', `<rect x="4" y="6" width="52" height="98" rx="5" fill="#D9A06A" ${K}/><path d="M30 10v90" ${K}/><circle cx="25" cy="56" r="2.2" fill="#3B2F2F"/><circle cx="35" cy="56" r="2.2" fill="#3B2F2F"/><rect x="2" y="2" width="56" height="8" rx="3" fill="#C88A55" ${K}/>`),
    box: sv('0 0 60 50', `<rect x="4" y="14" width="52" height="34" rx="5" fill="#F4A259" ${K}/><rect x="2" y="8" width="56" height="10" rx="4" fill="#F7BE7A" ${K}/><path d="M14 30h32" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="38" r="3" fill="#FFD23F"/>`),
    table: sv('0 0 90 60', `<rect x="4" y="8" width="82" height="10" rx="4" fill="#C99A6B" ${K}/><path d="M12 18v38M78 18v38" stroke="#3B2F2F" stroke-width="6" stroke-linecap="round"/><path d="M12 18v38M78 18v38" stroke="#A87B50" stroke-width="2.6" stroke-linecap="round"/><circle cx="45" cy="4" r="5" fill="#EF6F5E" ${K}/>`),
    curtain: sv('0 0 80 90', `<rect x="10" y="8" width="60" height="70" rx="4" fill="#BFE3F7" ${K}/><rect x="4" y="2" width="72" height="6" rx="3" fill="#A87B50"/><path d="M6 8h20c-4 20 2 50-4 76H6z" fill="#F59FBF" ${K}/><path d="M74 8H54c4 20-2 50 4 76h16z" fill="#F59FBF" ${K}/>`),
    plant: sv('0 0 50 90', `<path d="M25 52V24" stroke="#5DAA68" stroke-width="3"/><path d="M25 34c-14 0-20-10-18-22 10 0 18 8 18 22zM25 28c2-14 10-22 20-20 0 12-8 20-20 20zM25 44c-10 2-18-4-20-12 10-2 18 2 20 12z" fill="#7BC67E" ${K}/><path d="M12 52h26l-4 32H16z" fill="#EF6F5E" ${K}/>`)
  };
  function hlRound(g) {
    g.spot = null; g.asked = []; g.empty = []; g.q = null; g.wrongAns = 0; g.foundAt = null;
    const h = hider(g);
    if (T.solo() && h === 'other') {
      g.phase = 'lumihide';
      T.setTurn(g, 'other', 'Close your eyes! Lumi is hiding. One, two, three...');
    } else if (T.solo()) {
      g.phase = 'hide';
      T.setTurn(g, 'child', 'Lumi is closing its eyes. Tap where Lumi should hide!');
    } else {
      g.phase = 'cover';
      T.setTurn(g, h, `${nm(seeker(g))}, close your eyes! ${nm(h)}, get ready to hide Lumi.`);
    }
  }
  function hlHide(g, spot) {
    g.spot = spot;
    T.cheer();
    g.phase = 'seek';
    const s = seeker(g);
    const line = T.solo() && s === 'other' ? 'Lumi is hidden. Now Lumi will ask you a question.' : `Lumi is hidden! ${s === 'child' ? 'Open your eyes' : nm(s) + ', open your eyes'}. ${mustAsk() ? `Ask ${mustAsk() === 1 ? 'a question' : 'two questions'}, then look.` : 'Where is Lumi?'}`;
    T.setTurn(g, s, line);
  }
  function hlAsk(g, k) {
    if (g.asked.some((a) => a.k === k) || g.q) return;
    g.q = k;
    const q = QUESTIONS.find((x) => x.k === k);
    if (T.solo() && hider(g) === 'other') {
      // Lumi is the hider and answers
      T.say(q.q);
      T.render();
      const yes = truth(g.spot, k);
      T.later(() => { if (T.cur() !== g) return; g.asked.push({ k, yes }); g.q = null; T.render(); T.say(`Lumi says ${yes ? 'yes' : 'no'}!`); }, 1100);
      return;
    }
    g.phase = 'answer';
    g.wrongAns = 0;
    T.setTurn(g, hider(g), `${q.q} ${hider(g) === 'child' ? 'Tap yes or no.' : nm(hider(g)) + ', tap yes or no.'}`);
  }
  function hlAnswer(g, yes, el) {
    if (g.phase !== 'answer') return;
    const right = truth(g.spot, g.q);
    if (yes !== right) {
      g.wrongAns += 1;
      T.nope(el);
      if (g.wrongAns < 2) { T.say(`Hmm, are you sure? Lumi is ${place(g.spot).name}.`); return; }
      T.say(`Lumi is ${place(g.spot).name}, so the answer is ${right ? 'yes' : 'no'}.`);
    } else {
      T.cheer();
      T.say(yes ? 'Yes!' : 'No!');
    }
    g.asked.push({ k: g.q, yes: right });
    g.q = null;
    g.phase = 'seek';
    T.render();
    T.later(() => { if (T.cur() === g) T.setTurn(g, seeker(g), ''); }, 1300);
  }
  function hlLook(g, spot, el) {
    if (g.phase !== 'seek' || g.q) return;
    if (g.asked.length < mustAsk()) { T.nope(el); T.say(mustAsk() - g.asked.length === 1 ? 'Ask a question first.' : `Ask ${mustAsk() - g.asked.length} questions first.`); return; }
    if (g.empty.includes(spot)) return;
    if (spot !== g.spot) {
      g.empty.push(spot);
      T.nope(el);
      T.render();
      T.say(`Not by ${place(spot).short}. Keep looking!`);
      if (T.solo() && seeker(g) === 'other') T.later(() => { if (T.cur() === g) T.kick(); }, 600);
      return;
    }
    g.foundAt = spot;
    g.phase = 'found';
    g.round += 1;
    T.cheer();
    T.render();
    T.say(`Peekaboo! Lumi was ${place(spot).name}!`);
    T.later(() => {
      if (T.cur() !== g) return;
      if (g.round >= g.total) { T.win(g, { text: 'Hide and seek stars!', say: 'Great hiding, great asking and great answers!' }); return; }
      hlRound(g);
    }, 2100);
  }
  T.register({
    id: 'hidelumi', name: 'Hide Lumi', icon: 'kRoom', tint: '#FBEFD9', ink: '#B07A12', kind: 'Yes and no', sub: 'Hide Lumi, ask yes or no questions',
    ages: ['primary'], skill: 'communication',
    init(g) { g.total = 4; g.spot = null; g.asked = []; g.empty = []; g.q = null; g.foundAt = null; g.wrongAns = 0; g.turn = 'other'; g.phase = T.solo() ? 'lumihide' : 'cover'; },
    voice(g) {
      const s = seeker(g), h = hider(g);
      if (g.phase === 'lumihide') return 'Close your eyes! Lumi is hiding.';
      if (g.phase === 'cover') return `${nm(s)}, close your eyes! ${nm(h)}, tap Ready.`;
      if (g.phase === 'hide') return h === 'child' ? 'Tap where Lumi should hide.' : `${nm(h)}, tap where Lumi should hide.`;
      if (g.phase === 'seek') return s === 'child' ? (g.asked.length < mustAsk() ? 'Ask a question.' : 'Where is Lumi? Tap a place to look.') : (T.solo() ? 'Lumi is thinking.' : `${nm(s)}, ask a question or look.`);
      if (g.phase === 'answer') { const q = QUESTIONS.find((x) => x.k === g.q); return q ? q.q : ''; }
      return '';
    },
    stage(g) {
      const h = hider(g), s = seeker(g);
      if (g.phase === 'cover') {
        return `<div class="hl-cover"><span class="hl-eyes">${ic('eye', 90)}</span><b>${esc(nm(s))}, close your eyes!</b><span>${esc(nm(h))} hides Lumi.</span>
          <button class="primary" data-a="tg" data-k="ready" style="height:80px">${ic('check', 30)}<span>Ready</span></button></div>`;
      }
      if (g.phase === 'lumihide') {
        return `<div class="hl-cover"><span class="hl-eyes">${ic('eye', 90)}</span><b>Close your eyes!</b><span>Lumi is hiding... 1, 2, 3</span></div>`;
      }
      const peek = T.solo() && h === 'child' && g.phase !== 'hide' ? g.spot : null;
      const showAt = g.foundAt || peek;
      const spots = placesNow().map((p) => `<button class="hl-place ${g.empty.includes(p.id) ? 'empty' : ''}" data-a="tg" data-k="place" data-v="${p.id}" aria-label="${esc(p.name)}" style="left:${p.x}%;top:${p.y}%;width:${p.w}%">
        <span class="hl-art">${PLACE_ART[p.id]}</span>${showAt === p.id ? `<span class="hl-lumi ${g.foundAt ? 'pop' : 'peek'}">${lumiBig(g.foundAt ? 'excited' : 'happy', 70)}</span>` : ''}
        ${g.empty.includes(p.id) ? `<span class="hl-x">${ic('no', 30)}</span>` : ''}</button>`).join('');
      const blind = g.phase === 'hide' && T.solo() ? `<div class="hl-blind">${lumiBig('calm', 100)}<span>Lumi's eyes are closed</span></div>` : '';
      return `<div class="hl-room"><div class="hl-wall"></div><div class="hl-floor"></div>${spots}${blind}</div>`;
    },
    bar(g) {
      if (g.phase === 'answer') {
        const q = QUESTIONS.find((x) => x.k === g.q);
        return `<div class="bar hl-bar"><span class="hl-qtext">${T.avatar(seeker(g), 50)}<b>${esc(q ? q.q : '')}</b></span><span class="grow"></span>
          <button class="hl-yes" data-a="tg" data-k="answer" data-v="yes">${ic('yes', 52)}<span>Yes</span></button>
          <button class="hl-no" data-a="tg" data-k="answer" data-v="no">${ic('no', 52)}<span>No</span></button></div>`;
      }
      if (g.phase !== 'seek' && g.phase !== 'found') return '';
      const qs = questionsNow().map((q) => {
        const a = g.asked.find((x) => x.k === q.k);
        return `<button class="hl-q ${a ? (a.yes ? 'yes' : 'no') : ''} ${g.q === q.k ? 'asking' : ''}" data-a="tg" data-k="ask" data-v="${q.k}" ${a ? 'disabled' : ''}>${ic(q.icon, 28)}<span>${esc(q.q.replace('Is Lumi ', '').replace('?', ''))}</span>${a ? `<i>${a.yes ? 'Yes' : 'No'}</i>` : ''}</button>`;
      }).join('');
      return `<div class="bar hl-bar"><span class="hl-qlabel">${ic('what', 34)}<span>${mustAsk() ? `Ask ${mustAsk() === 1 ? '1 question' : '2 questions'}` : 'Ask (if you like)'}</span></span><div class="hl-qs">${qs}</div></div>`;
    },
    guide(g) {
      if (g.phase === 'cover') return { sel: '[data-k="ready"]', say: 'Tap Ready.' };
      if (g.phase === 'hide') return { sel: '.hl-place', say: 'Pick a hiding place.' };
      if (g.phase === 'answer') return { sel: truth(g.spot, g.q) ? '.hl-yes' : '.hl-no', say: 'Yes or no?', delay: 9000 };
      if (g.phase === 'seek' && !g.q) return g.asked.length < mustAsk() ? { sel: '.hl-q:not([disabled])', say: 'Ask a question.' } : { sel: `.hl-place[data-v="${g.spot}"]`, say: 'Tap a place to look.', delay: 9000 };
      return null;
    },
    tap(g, k, el, d) {
      if (k === 'ready' && g.phase === 'cover') { g.phase = 'hide'; T.render(); T.say(`${hider(g) === 'child' ? 'Tap' : nm(hider(g)) + ', tap'} where Lumi should hide.`); return; }
      if (k === 'place' && g.phase === 'hide') { hlHide(g, d.v); return; }
      if (k === 'place' && g.phase === 'seek' && g.turn === seeker(g)) { hlLook(g, d.v, el); return; }
      if (k === 'ask' && g.phase === 'seek' && g.turn === seeker(g)) { hlAsk(g, d.v); return; }
      if (k === 'answer' && g.phase === 'answer' && g.turn === hider(g)) hlAnswer(g, d.v === 'yes', el);
    },
    lumiTurn(g) {
      if (g.phase === 'lumihide') {
        T.later(() => { if (T.cur() === g && g.phase === 'lumihide') hlHide(g, rnd(placesNow()).id); }, 1800);
        return;
      }
      if (g.phase !== 'seek' || g.q) return;
      // Lumi is the seeker: ask (so the child answers yes or no), then look where the answers point
      const need = Math.max(1, mustAsk());
      const left = questionsNow().filter((q) => !g.asked.some((a) => a.k === q.k));
      if (g.asked.length < need && left.length) { hlAsk(g, rnd(left).k); return; }
      const open = placesNow().filter((p) => !g.empty.includes(p.id));
      const fits = open.filter((p) => g.asked.every((a) => !!p.at[a.k] === a.yes));
      const pickP = rnd(fits.length ? fits : open);
      T.say(`Is Lumi ${pickP.name}? Let me look.`);
      T.later(() => { if (T.cur() === g && g.phase === 'seek') hlLook(g, pickP.id); }, 1300);
    }
  });

  // ================================================================ 6. Build it together
  const COLS = { red: { c: '#EF6F5E', who: 'child' }, yellow: { c: '#FFD23F', who: 'child' }, blue: { c: '#5B8FD9', who: 'other' }, green: { c: '#7BC67E', who: 'other' } };
  const blockArt = (col, size) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><circle cx="16" cy="8" r="4" fill="${COLS[col].c}" ${K}/><circle cx="32" cy="8" r="4" fill="${COLS[col].c}" ${K}/><rect x="4" y="9" width="40" height="35" rx="7" fill="${COLS[col].c}" ${K}/><rect x="9" y="13" width="14" height="5" rx="2.5" fill="#fff" opacity=".55"/></svg>`;
  const buShape = () => ({ 1: [1, 4], 2: [2, 3], 3: [2, 4] }[T.level()] || [2, 3]); // [columns, rows]
  function buPattern(n) {
    for (let tries = 0; tries < 50; tries++) {
      const p = Array.from({ length: n }, () => rnd(Object.keys(COLS)));
      const kids = p.filter((c) => COLS[c].who === 'child').length;
      if (kids >= 2 && n - kids >= 2) return p;
    }
    return Array.from({ length: n }, (_, i) => ['red', 'blue', 'yellow', 'green'][i % 4]);
  }
  function buNext(g) {
    const col = g.pattern[g.placed];
    const who = COLS[col].who;
    T.setTurn(g, who, `A ${col} block! ${who === 'child' ? 'Your turn.' : nm('other') + "'s turn."}`);
  }
  function buPlace(g, col, el) {
    const need = g.pattern[g.placed];
    if (col !== need) { T.nope(el); T.say(`Look again. We need a ${need} block.`); return; }
    g.placed += 1;
    g.round = g.placed;
    T.tone(440 + g.placed * 60, 0.18, 0.07);
    if (g.placed >= g.pattern.length) {
      T.render();
      T.later(() => { if (T.cur() === g) T.win(g, { text: 'We built it together!', say: 'It matches! You built it together.' }); }, 700);
      return;
    }
    const nextWho = COLS[g.pattern[g.placed]].who;
    if (nextWho === g.turn) { T.render(); T.say(`Another one! A ${g.pattern[g.placed]} block.`); T.kick(); } else buNext(g);
  }
  T.register({
    id: 'build', name: 'Build it together', icon: 'kSort', tint: '#FDECE3', ink: '#C0574A', kind: 'Teamwork', sub: 'Copy the picture, one block each',
    ages: ['primary'], skill: 'social',
    init(g) {
      const [cols, rows] = buShape();
      g.cols = cols; g.rows = rows;
      g.pattern = buPattern(cols * rows);
      g.placed = 0;
      g.total = g.pattern.length;
      g.turn = COLS[g.pattern[0]].who;
    },
    voice(g) {
      const col = g.pattern[g.placed];
      if (!col) return 'It matches!';
      return `Copy the picture. We need a ${col} block. ${g.turn === 'child' ? 'Your turn.' : (T.solo() ? "Lumi's turn." : `${nm('other')}'s turn.`)}`;
    },
    stage(g) {
      // the copy fills from the bottom row up, left to right
      const order = [];
      for (let r = g.rows - 1; r >= 0; r--) for (let c = 0; c < g.cols; c++) order.push([r, c]);
      const big = g.rows > 3 ? 88 : 108;
      const cell = (k, mode) => {
        const col = g.pattern[k];
        if (mode === 'target') return `<span class="bu-cell">${blockArt(col, big * 0.62)}</span>`;
        const on = k < g.placed;
        const next = k === g.placed;
        return `<span class="bu-cell slot ${next ? 'next' : ''}" style="width:${big}px;height:${big}px">${on ? blockArt(col, big) : next ? `<span class="bu-ghost" style="border-color:${COLS[col].c}"></span>` : ''}</span>`;
      };
      const grid = (mode) => {
        const cells = [];
        for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) { const k = order.findIndex(([rr, cc]) => rr === r && cc === c); cells.push(cell(k, mode)); }
        return `<div class="bu-grid" style="grid-template-columns:repeat(${g.cols}, auto)">${cells.join('')}</div>`;
      };
      const tray = (who) => {
        const mine = Object.keys(COLS).filter((c) => COLS[c].who === who);
        const active = g.turn === who && !g.won;
        return `<div class="bu-tray ${active ? 'on' : ''}">${T.avatar(who, 54)}<span class="bu-tname">${esc(who === 'child' ? 'Your blocks' : nm(who) + "'s blocks")}</span>
          <div class="bu-blocks">${mine.map((c) => `<button class="bu-block" data-a="tg" data-k="block" data-v="${c}" data-who="${who}" ${!active && who === 'child' ? 'data-any="1"' : ''} aria-label="${c} block">${blockArt(c, 80)}</button>`).join('')}</div></div>`;
      };
      return `<div class="bu-wrap">
        ${tray('child')}
        <div class="bu-center"><div class="bu-panel target"><span class="bu-label">${ic('eye', 24)}<span>Copy this</span></span>${grid('target')}</div>
          <div class="bu-panel build"><span class="bu-label">${ic('kSort', 24)}<span>Our build</span></span>${grid('build')}</div></div>
        ${tray('other')}
      </div>`;
    },
    guide(g) {
      const col = g.pattern[g.placed];
      if (!col) return null;
      return { sel: `.bu-block[data-v="${col}"]`, say: `Tap the ${col} block.` };
    },
    tap(g, k, el, d) {
      if (k !== 'block' || g.placed >= g.pattern.length) return;
      if (d.who !== g.turn) { T.nope(el); T.say(`It's ${g.turn === 'child' ? 'your' : nm(g.turn) + "'s"} turn. We need a ${g.pattern[g.placed]} block.`); return; }
      if (T.solo() && d.who === 'other') return;
      buPlace(g, d.v, el);
    },
    lumiTurn(g) {
      const col = g.pattern[g.placed];
      if (!col || COLS[col].who !== 'other') return;
      buPlace(g, col);
    }
  });
})();
