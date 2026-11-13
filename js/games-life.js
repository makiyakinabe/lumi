/*
  games-life.js
  Everyday-skills games (Fun › Games › Everyday). Each one is done with the hands, not by pressing "next":
  rubbing, slicing, stirring, dragging coins, holding to walk, turning clock hands, pulling a zip.
  Three levels each, no timers that end a game, no losing. A wrong move gets a kind word and another go.

  cook    Lumi's kitchen   Pick the food, wash it, chop it, stir the wok, serve Lumi. (The chopping and stirring
                           are shared with the Hawker uncle game through A.KITCHEN.)
  shop    Go shopping      Put what is on the list in the basket, then pay with coins and notes.
  road    Cross the road   Press the button, wait for the green man, look right, left, right, hold to walk.
  clock   Tell the time    Turn the hands of the clock to the time of Lumi's day.
  fasten  Zip and button   Pull the zip, push buttons through holes, click the buckle, tighten the laces.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  if (!A || !A.GAME || !A.GAME.draggable) return;
  const { D, S, state, ic, esc, say, tone, render, later, pick, dots, stage } = A;
  const { header, winCard, win, lv, shuffle, NOTES, draggable, inside, wiggle, lumi, scale, restartOn } = A.GAME;
  const pic = (k, size) => (window.lumiPic && window.lumiPic(k, size)) || '';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const bar = (p) => `<span class="ev-meter" role="img" aria-label="${Math.round(p * 100)} percent"><i style="width:${Math.round(Math.min(1, p) * 100)}%"></i></span>`;
  // rubbing or stirring: how far the finger has travelled while it is down inside el
  function rub(el, onMove) {
    let last = null;
    el.addEventListener('pointerdown', (e) => { last = { x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } onMove(14, e); });
    el.addEventListener('pointermove', (e) => {
      if (!last) return;
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y) / scale();
      last = { x: e.clientX, y: e.clientY };
      if (d > 0) onMove(d, e);
    });
    const end = () => { last = null; };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  // ================================================================ the kitchen pieces (also used by Hawker uncle)
  const VEG = {
    carrot: { name: 'carrot', c: '#F4A261', d: '#D97B3A', k: '\u{1F955}' },
    broccoli: { name: 'broccoli', c: '#7FB069', d: '#4F8A3F', k: '\u{1F966}' }
  };
  // a vegetable lying on a board, with dotted lines to slice along. cut = which lines are done
  function chopHtml(veg, n, cut) {
    const v = VEG[veg];
    let h = '';
    for (let i = 0; i <= n; i++) {
      h += `<span class="ck-seg ${veg} ${i === 0 ? 'first' : ''} ${i === n ? 'last' : ''}" style="--c:${v.c};--d:${v.d}"></span>`;
      if (i < n) h += `<button class="ck-cut ${cut.includes(i) ? 'done' : ''}" data-cut="${i}" aria-label="Cut here" ${cut.includes(i) ? 'disabled' : ''}></button>`;
    }
    return `<div class="ck-board"><div class="ck-vegrow" data-veg="${veg}">${h}</div><span class="ck-knife" aria-hidden="true"><svg viewBox="0 0 40 150" width="40" height="150"><path d="M8 4c18 14 26 50 24 92H8z" fill="#E6EBF0" stroke="#8A94A0" stroke-width="3" stroke-linejoin="round"/><rect x="6" y="96" width="20" height="50" rx="8" fill="#8B5A3C" stroke="#5E3A22" stroke-width="3"/></svg></span></div>`;
  }
  // slice through a dotted line with a finger (any direction), or tap it. onCut(i) is called once per line
  function chopWire(box, onCut) {
    const row = box.querySelector('.ck-vegrow');
    const knife = box.querySelector('.ck-knife');
    if (!row) return;
    const tryCut = (x, y) => {
      const rr = row.getBoundingClientRect();
      if (y < rr.top - 30 || y > rr.bottom + 30) return;
      row.querySelectorAll('.ck-cut:not(.done)').forEach((c) => {
        const r = c.getBoundingClientRect();
        if (Math.abs(x - (r.left + r.width / 2)) > Math.max(16, r.width / 2)) return;
        c.classList.add('done');
        c.disabled = true;
        if (knife) {
          const br = box.querySelector('.ck-board').getBoundingClientRect();
          knife.style.left = ((r.left + r.width / 2 - br.left) / scale() - 20) + 'px';
          knife.classList.remove('chop');
          void knife.offsetWidth;
          knife.classList.add('chop');
        }
        onCut(Number(c.dataset.cut));
      });
    };
    let down = false;
    const board = box.querySelector('.ck-board');
    board.addEventListener('pointerdown', (e) => { down = true; try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } tryCut(e.clientX, e.clientY); });
    board.addEventListener('pointermove', (e) => { if (down) tryCut(e.clientX, e.clientY); });
    const end = () => { down = false; };
    board.addEventListener('pointerup', end);
    board.addEventListener('pointercancel', end);
  }
  // a wok with chopped bits in it; p = how cooked (0 to 1)
  function wokHtml(vegs, p) {
    const bits = [];
    for (let i = 0; i < 12; i++) {
      const v = VEG[vegs[i % vegs.length]];
      const a = (i / 12) * Math.PI * 2;
      const r = 26 + (i % 3) * 22;
      bits.push(`<i class="ck-bit" style="left:${50 + (r / 2.2) * Math.cos(a)}%;top:${50 + (r / 2.6) * Math.sin(a)}%;background:${v.c};border-color:${v.d}"></i>`);
    }
    return `<div class="ck-wok" style="--p:${p}"><div class="ck-wok-in" style="transform:rotate(${Math.round(p * 540)}deg)"><span class="ck-noodles"></span>${bits.join('')}</div>
      <span class="ck-steam s1"></span><span class="ck-steam s2"></span><span class="ck-steam s3"></span><span class="ck-ladle" aria-hidden="true"></span></div>`;
  }
  function wokWire(box, need, onStir) {
    const wok = box.querySelector('.ck-wok');
    if (!wok) return;
    const ladle = wok.querySelector('.ck-ladle');
    rub(wok, (d, e) => {
      const r = wok.getBoundingClientRect();
      if (ladle) { ladle.style.left = ((e.clientX - r.left) / r.width) * 100 + '%'; ladle.style.top = ((e.clientY - r.top) / r.height) * 100 + '%'; }
      onStir(d / need);
    });
  }
  A.KITCHEN = { VEG, chopHtml, chopWire, wokHtml, wokWire, bar };

  // ================================================================ 1. Lumi's kitchen
  const FRIDGE = [['\u{1F955}', 'carrot'], ['\u{1F966}', 'broccoli'], ['\u{1F35C}', 'noodles'], ['\u{1F34E}', 'apple'], ['\u{1F36A}', 'biscuit'], ['\u{1F34C}', 'banana'], ['\u{1F9C0}', 'cheese'], ['\u{1F95B}', 'milk']];
  const STEP_INFO = {
    pick: ['kShop', 'Find', 'Find the food on the recipe card. Drag it to the basket.'],
    wash: ['sShower', 'Wash', 'Rub the %v under the water to wash it.'],
    chop: ['sScissors', 'Chop', 'Slice along the dotted lines. In real life we chop with a grown-up.'],
    stir: ['kCook', 'Stir', 'Stir round and round in the wok.'],
    serve: ['sDinner', 'Serve', 'Drag the noodles to Lumi\'s bowl.']
  };
  function cookNew() {
    const l = lv();
    const vegs = l === 3 ? ['carrot', 'broccoli'] : ['carrot'];
    const steps = [];
    if (l === 3) steps.push({ k: 'pick' });
    if (l >= 2) steps.push({ k: 'wash', veg: 'carrot' });
    vegs.forEach((v) => steps.push({ k: 'chop', veg: v }));
    steps.push({ k: 'stir' }, { k: 'serve' });
    return { vegs, steps, i: 0, p: 0, cut: [], got: [], cuts: { 1: 3, 2: 4, 3: 5 }[l], need: ['carrot', 'broccoli', 'noodles'], fridge: shuffle(FRIDGE), served: false, won: false };
  }
  const cookStep = (g) => g.steps[Math.min(g.i, g.steps.length - 1)];
  const cookSay = (g) => { const st = cookStep(g); return STEP_INFO[st.k][2].replace('%v', st.veg || 'carrot'); };
  function cookNext(g) {
    g.busy = true;
    tone(784, 0.3, 0.09);
    later(() => {
      g.busy = false;
      g.i += 1;
      g.p = 0;
      g.cut = [];
      render();
      say(cookSay(g));
    }, 1100);
  }
  A.GAME_MAKERS.cook = cookNew;
  A.PARENT['g-cook'] = 'play';
  A.VOICE['g-cook'] = () => cookSay(S.g);
  A.SCREENS['g-cook'] = () => {
    const g = S.g;
    const st = cookStep(g);
    const strip = g.steps.map((s, i) => `<span class="ev-step ${i < g.i || g.served ? 'done' : i === g.i ? 'now' : ''}">${ic(i < g.i || g.served ? 'check' : STEP_INFO[s.k][0], 30)}<span>${STEP_INFO[s.k][1]}</span></span>`).join(`<span class="ev-arrow">${ic('chev', 18)}</span>`);
    let work = '';
    if (st.k === 'pick') {
      work = `<div class="ck-pick"><div class="ck-card"><b>Recipe</b><div class="row gap8">${g.need.map((n) => { const f = FRIDGE.find((x) => x[1] === n); return `<span class="ck-need ${g.got.includes(n) ? 'got' : ''}">${pic(f[0], 58)}</span>`; }).join('')}</div></div>
        <div class="ck-fridge">${g.fridge.filter((f) => !g.got.includes(f[1])).map((f) => `<span class="ck-food" data-k="${f[1]}" role="button" aria-label="${f[1]}">${pic(f[0], 76)}</span>`).join('')}</div>
        <div class="ck-basket" id="ckBasket">${g.got.map((n) => `<span>${pic(FRIDGE.find((x) => x[1] === n)[0], 52)}</span>`).join('') || '<em>Basket</em>'}</div></div>`;
    } else if (st.k === 'wash') {
      const spots = [[18, 30], [38, 62], [56, 28], [72, 58], [86, 36]].map(([x, y], i) => `<i class="ck-dirt ${g.p * 5 > i ? 'gone' : ''}" style="left:${x}%;top:${y}%"></i>`).join('');
      work = `<div class="ck-sink"><span class="ck-tap"></span><span class="ck-water"></span>
        <div class="ck-washveg" id="ckWash"><span class="ck-seg ${st.veg} first last whole" style="--c:${VEG[st.veg].c};--d:${VEG[st.veg].d}"></span>${spots}</div>${bar(g.p)}</div>`;
    } else if (st.k === 'chop') {
      work = `<div class="ck-chop">${chopHtml(st.veg, g.cuts, g.cut)}<span id="ckDots">${dots(g.cut.length, g.cuts, 'var(--teal)', 18)}</span></div>`;
    } else if (st.k === 'stir') {
      work = `<div class="ck-stir">${wokHtml(g.vegs, g.p)}${bar(g.p)}</div>`;
    } else {
      work = `<div class="ck-serve">${g.served ? '' : `<span class="ck-scoop" role="button" aria-label="The noodles">${A.foodSvg ? A.foodSvg('noodles', 190, 152) : pic('\u{1F35C}', 150)}</span>`}
        <span class="ev-arrow big">${ic('chev', 44)}</span>
        <div class="ck-bowl ${g.served ? 'full' : ''}" id="ckBowl">${g.served ? (A.foodSvg ? A.foodSvg('noodles', 200, 160) : pic('\u{1F35C}', 150)) : '<em>Lumi\'s bowl</em>'}</div></div>`;
    }
    return `
<section class="screen" aria-label="Lumi's kitchen">
  ${A.srTitle("Lumi's kitchen")}
  ${header('cook', cookSay(g))}
  <div class="row gap24 grow">
    <div class="panel ev-scene ck-scene grow"><div class="ev-strip">${strip}</div><div class="ev-work">${work}</div></div>
    <div class="col center gap12" style="width:230px">${lumi(g.served ? 'excited' : 'happy', 210)}<p class="ev-tip" aria-live="polite">${esc(g.served ? 'Yum! Thank you, chef!' : STEP_INFO[st.k][1])}</p></div>
  </div>
  ${winCard('cook')}
</section>`;
  };
  A.AFTER['g-cook'] = () => {
    const g = S.g;
    if (!g || g.won || g.busy) return;
    const st = cookStep(g);
    const box = stage.querySelector('.ev-work');
    if (!box) return;
    if (st.k === 'pick') {
      const basket = document.getElementById('ckBasket');
      const take = (n, el) => {
        if (!g.need.includes(n)) { wiggle(el); say(`${cap(n)} is not on the recipe.`); A.track('tries', 'cook', { quiet: true }); return false; }
        g.got.push(n);
        tone(NOTES[g.got.length], 0.25, 0.08);
        say(cap(n) + '!');
        if (g.got.length >= g.need.length) { render(); cookNext(g); return true; }
        render();
        return true;
      };
      box.querySelectorAll('.ck-food').forEach((el) => draggable(el, {
        over: (x, y) => basket.classList.toggle('hot', inside(basket, x, y)),
        drop: (x, y) => (inside(basket, x, y) ? take(el.dataset.k, el) : false),
        tap: () => take(el.dataset.k, el)
      }));
    } else if (st.k === 'wash') {
      const v = document.getElementById('ckWash');
      rub(v, (d) => {
        if (g.busy) return;
        const before = Math.floor(g.p * 5);
        g.p = Math.min(1, g.p + d / 900);
        const m = box.querySelector('.ev-meter i');
        if (m) m.style.width = g.p * 100 + '%';
        if (Math.floor(g.p * 5) > before) { box.querySelectorAll('.ck-dirt').forEach((s, i) => s.classList.toggle('gone', g.p * 5 > i)); tone(NOTES[Math.floor(g.p * 5) % NOTES.length], 0.12, 0.05); }
        if (g.p >= 1) { say('All clean!'); cookNext(g); }
      });
    } else if (st.k === 'chop') {
      chopWire(box, (i) => {
        g.cut.push(i);
        tone(300 + g.cut.length * 40, 0.08, 0.1);
        const d = document.getElementById('ckDots');
        if (g.cut.length >= g.cuts) { say('All chopped!'); cookNext(g); }
        else if (g.cut.length === 1) say('Chop!');
        if (d) d.innerHTML = dots(g.cut.length, g.cuts, 'var(--teal)', 18);
      });
    } else if (st.k === 'stir') {
      wokWire(box, { 1: 1500, 2: 2400, 3: 3200 }[lv()], (dp) => {
        if (g.busy) return;
        const half = g.p < 0.5;
        g.p = Math.min(1, g.p + dp);
        const wok = box.querySelector('.ck-wok');
        wok.style.setProperty('--p', g.p);
        wok.querySelector('.ck-wok-in').style.transform = `rotate(${Math.round(g.p * 540)}deg)`;
        const m = box.querySelector('.ev-meter i');
        if (m) m.style.width = g.p * 100 + '%';
        if (half && g.p >= 0.5) { say('Sizzle! Keep stirring.'); tone(523, 0.2, 0.06); }
        if (g.p >= 1) { say('It smells so good!'); cookNext(g); }
      });
    } else if (!g.served) {
      const bowl = document.getElementById('ckBowl');
      const serve = () => {
        g.served = true;
        tone(784, 0.3, 0.1);
        render();
        say('Yum yum! Thank you, chef!');
        later(() => win('cook', lv() === 3 ? 2 : 1), 1500);
        return true;
      };
      box.querySelectorAll('.ck-scoop').forEach((el) => draggable(el, { over: (x, y) => bowl.classList.toggle('hot', inside(bowl, x, y)), drop: (x, y) => (inside(bowl, x, y) ? serve() : false), tap: serve }));
    }
  };
  A.GUIDE['g-cook'] = () => {
    const g = S.g;
    if (!g || g.won || g.busy || g.served) return null;
    const k = cookStep(g).k;
    const sel = { pick: '.ck-food', wash: '#ckWash', chop: '.ck-cut:not(.done)', stir: '.ck-wok', serve: '.ck-scoop' }[k];
    return { sel, say: cookSay(g), delay: state.settings.guideDelay * 1000 + 6000 };
  };
  restartOn('cook');

  // ================================================================ 2. Go shopping (lists and money)
  const GOODS = [['\u{1F34E}', 'apple', 1], ['\u{1F34C}', 'banana', 1], ['\u{1F35E}', 'bread', 2], ['\u{1F95B}', 'milk', 3], ['\u{1F95A}', 'eggs', 2], ['\u{1F9C0}', 'cheese', 3], ['\u{1F36A}', 'biscuits', 2], ['\u{1F9C3}', 'juice', 1], ['\u{1F9FC}', 'soap', 2], ['\u{1FAA5}', 'toothbrush', 2]];
  const MONEY = { 0.5: ['50¢', 'coin silver'], 1: ['$1', 'coin gold'], 2: ['$2', 'note purple'], 5: ['$5', 'note green'] };
  const dollars = (v) => (v % 1 ? `$${v.toFixed(2)}` : `$${v}`);
  const moneyHtml = (v, k, cls) => `<span class="sp-money ${MONEY[v][1]} ${cls || ''}" data-v="${v}" data-k="${k}" role="button" aria-label="${MONEY[v][0]}">${MONEY[v][0]}</span>`;
  function shopRound() {
    const l = lv();
    const shelf = shuffle(GOODS).slice(0, { 1: 4, 2: 6, 3: 8 }[l]).map(([k, name, p]) => ({ k, name, price: l === 1 ? 1 : l === 3 && p > 1 ? p - 0.5 : p }));
    const list = shuffle(shelf).slice(0, { 1: 2, 2: 3, 3: 4 }[l]);
    const wallet = { 1: [1, 1, 1, 1], 2: [1, 1, 1, 2, 2, 2, 2], 3: [5, 5, 2, 2, 1, 1, 0.5, 0.5] }[l].map((v, i) => ({ v, id: i, used: false }));
    return { phase: 'pick', shelf, list, basket: [], wallet, change: null };
  }
  const shopTotal = (r) => r.list.reduce((t, x) => t + x.price, 0);
  const shopPaid = (r) => r.wallet.filter((m) => m.used).reduce((t, m) => t + m.v, 0);
  const shopSay = (r) => (r.phase === 'pick' ? 'Find what is on the list. Drag it to the basket.' : r.change != null ? (r.change ? `Here is ${dollars(r.change)} change. Thank you!` : 'Thank you!') : `That is ${dollars(shopTotal(r))}. Drag the money to the tray.`);
  A.GAME_MAKERS.shop = () => ({ round: 0, total: 2, r: shopRound(), won: false });
  A.PARENT['g-shop'] = 'play';
  A.VOICE['g-shop'] = () => shopSay(S.g.r);
  A.SCREENS['g-shop'] = () => {
    const g = S.g;
    const r = g.r;
    const tag = (x) => `<span class="sp-tag">${dollars(x.price)}</span>`;
    let body = '';
    if (r.phase === 'pick') {
      body = `<div class="panel ev-scene sp-shelf grow">${r.shelf.map((x) => (r.basket.includes(x.name) ? '<span class="sp-gap"></span>' : `<span class="sp-item" data-k="${x.name}" role="button" aria-label="${x.name}, ${dollars(x.price)}">${pic(x.k, 92)}${tag(x)}</span>`)).join('')}</div>
        <div class="col gap16" style="width:330px">
          <div class="sp-list"><b>${ic('journal', 26)} Shopping list</b>${r.list.map((x) => `<span class="sp-li ${r.basket.includes(x.name) ? 'got' : ''}">${pic(x.k, 44)}<span>${cap(x.name)}</span>${r.basket.includes(x.name) ? ic('check', 24) : ''}</span>`).join('')}</div>
          <div class="sp-basket grow" id="spBasket">${r.basket.map((n) => pic(r.shelf.find((x) => x.name === n).k, 56)).join('') || '<em>Basket</em>'}</div>
        </div>`;
    } else {
      const paid = shopPaid(r);
      body = `<div class="panel ev-scene sp-till grow">
          <div class="sp-receipt">${r.list.map((x) => `<span>${pic(x.k, 40)}<i>${dollars(x.price)}</i></span>`).join('')}<b>Total ${dollars(shopTotal(r))}</b></div>
          <div class="sp-uncle">${A.person ? A.person({ who: 'aunty', h: 210 }) : ''}</div>
          <div class="sp-tray ${r.change != null ? 'paid' : ''}" id="spTray">${r.wallet.filter((m) => m.used).map((m) => moneyHtml(m.v, m.id, 'in')).join('') || '<em>Put the money here</em>'}</div>
          <div class="sp-paid" aria-live="polite">${r.change != null ? (r.change ? `Change ${dollars(r.change)}` : 'Paid!') : `${dollars(paid)} of ${dollars(shopTotal(r))}`}</div>
        </div>
        <div class="col gap12" style="width:330px"><div class="sp-wallet grow"><b>${ic('kShop', 28)} My wallet</b><div class="sp-coins">${r.wallet.filter((m) => !m.used).map((m) => moneyHtml(m.v, m.id)).join('')}</div></div></div>`;
    }
    return `
<section class="screen" aria-label="Go shopping">
  ${A.srTitle('Go shopping')}
  ${header('shop', shopSay(r))}
  <div class="row gap24 grow">${body}</div>
  <div class="ev-rounds">${dots(g.round, g.total, 'var(--teal)', 18)}</div>
  ${winCard('shop')}
</section>`;
  };
  function shopPaidUp(g) {
    const r = g.r;
    r.change = shopPaid(r) - shopTotal(r);
    tone(1046, 0.25, 0.09);
    render();
    say(shopSay(r));
    later(() => {
      g.round += 1;
      if (g.round >= g.total) { win('shop', lv() === 3 ? 2 : 1); return; }
      g.r = shopRound();
      render();
      say(shopSay(g.r));
    }, 2400);
  }
  A.AFTER['g-shop'] = () => {
    const g = S.g;
    if (!g || g.won) return;
    const r = g.r;
    if (r.phase === 'pick') {
      const basket = document.getElementById('spBasket');
      const take = (n, el) => {
        if (!r.list.some((x) => x.name === n)) { wiggle(el); say(`${cap(n)} is not on the list.`); A.track('tries', 'shop', { quiet: true }); return false; }
        r.basket.push(n);
        tone(NOTES[r.basket.length], 0.25, 0.08);
        if (r.basket.length >= r.list.length) {
          say('That is everything on the list! Now we pay.');
          render();
          later(() => { r.phase = 'pay'; render(); say(shopSay(r)); }, 1500);
        } else { say(cap(n) + '.'); render(); }
        return true;
      };
      stage.querySelectorAll('.sp-item').forEach((el) => draggable(el, {
        over: (x, y) => basket.classList.toggle('hot', inside(basket, x, y)),
        drop: (x, y) => (inside(basket, x, y) ? take(el.dataset.k, el) : false),
        tap: () => take(el.dataset.k, el)
      }));
    } else if (r.change == null) {
      const tray = document.getElementById('spTray');
      const total = shopTotal(r);
      const give = (id, el) => {
        const m = r.wallet.find((x) => x.id === id);
        if (lv() < 3 && shopPaid(r) + m.v > total) { wiggle(el); say(`Too much. We need ${dollars(total - shopPaid(r))} more.`); A.track('tries', 'shop', { quiet: true }); return false; }
        m.used = true;
        tone(880, 0.12, 0.07);
        const paid = shopPaid(r);
        if (paid >= total) { shopPaidUp(g); return true; }
        say(dollars(paid) + '.');
        render();
        return true;
      };
      stage.querySelectorAll('.sp-wallet .sp-money').forEach((el) => draggable(el, {
        over: (x, y) => tray.classList.toggle('hot', inside(tray, x, y)),
        drop: (x, y) => (inside(tray, x, y) ? give(Number(el.dataset.k), el) : false),
        tap: () => give(Number(el.dataset.k), el)
      }));
      // tap money on the tray to take it back
      tray.querySelectorAll('.sp-money').forEach((el) => el.addEventListener('click', () => { const m = r.wallet.find((x) => x.id === Number(el.dataset.k)); if (m && r.change == null) { m.used = false; tone(392, 0.12, 0.05); render(); } }));
    }
  };
  A.GUIDE['g-shop'] = () => (S.g && !S.g.won && S.g.r.change == null ? { sel: S.g.r.phase === 'pick' ? '.sp-item' : '.sp-wallet .sp-money', say: shopSay(S.g.r), delay: state.settings.guideDelay * 1000 + 6000 } : null);
  restartOn('shop');

  // ================================================================ 3. Cross the road (road safety)
  // steps: button (press), wait (red man), look (right, left, right), walk (hold), done
  const LOOKS = () => (lv() === 1 ? ['both'] : ['right', 'left', 'right']);
  function roadRound() { const l = lv(); return { step: l === 3 ? 'wait' : 'button', looks: [], y: 0, light: l !== 3, cars: 'go', looking: null, waited: 0 }; }
  const roadSay = (r) => ({
    button: 'Stop at the kerb. Press the button on the pole.',
    wait: r.light ? 'Red man. We wait on the pavement.' : 'Wait on the pavement until the cars stop.',
    look: r.looking ? 'No cars moving.' : (r.light ? 'Green man! ' : 'The cars have stopped. ') + 'Look ' + ((LOOKS()[r.looks.length] || 'right') === 'both' ? 'both ways' : LOOKS()[r.looks.length] || 'right') + '.',
    walk: 'Safe to cross. Press and hold Walk.',
    done: 'We crossed safely!'
  })[r.step];
  A.GAME_MAKERS.road = () => ({ round: 0, total: 2, r: roadRound(), won: false });
  A.PARENT['g-road'] = 'play';
  A.VOICE['g-road'] = () => roadSay(S.g.r);
  const carSvg = (c) => `<svg viewBox="0 0 150 70" width="150" height="70" aria-hidden="true"><path d="M10 44c0-10 6-14 16-16l14-18c3-4 7-6 12-6h38c6 0 10 2 14 7l12 17c12 2 24 6 24 16v8a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill="${c}" stroke="#3B2F2F" stroke-width="3" stroke-linejoin="round"/><path d="M46 12h20v16H34zM72 12h18l12 16H72z" fill="#DCEFF7" stroke="#3B2F2F" stroke-width="2.5" stroke-linejoin="round"/><circle cx="40" cy="58" r="11" fill="#3B2F2F"/><circle cx="40" cy="58" r="4.5" fill="#D8D2C8"/><circle cx="112" cy="58" r="11" fill="#3B2F2F"/><circle cx="112" cy="58" r="4.5" fill="#D8D2C8"/></svg>`;
  A.SCREENS['g-road'] = () => {
    const g = S.g;
    const r = g.r;
    const need = LOOKS();
    const lookBtn = (side, label) => `<button class="xr-look ${r.looking === side ? 'on' : ''}" data-a="rdLook" data-v="${side}" ${r.step === 'look' ? '' : 'disabled'}>${side === 'left' ? ic('back', 30) : ''}<span>${ic('eye', 34)}${label}</span>${side === 'right' ? `<span class="flip">${ic('back', 30)}</span>` : ''}</button>`;
    return `
<section class="screen" aria-label="Cross the road">
  ${A.srTitle('Cross the road')}
  ${header('road', roadSay(r))}
  <div class="panel xr-scene grow cars-${r.cars} ${r.looking ? 'look-' + r.looking : ''}" id="xrScene">
    <div class="xr-far"><span class="xr-park">${ic('sTree', 70)}${ic('kBalloon', 54)}${ic('sTree', 70)}</span></div>
    <div class="xr-road"><span class="xr-line"></span><span class="xr-zebra"></span>
      <span class="xr-car far">${carSvg('#8EB8E5')}</span><span class="xr-car near">${carSvg('#EF8A7A')}</span>
      <span class="xr-beam right"></span><span class="xr-beam left"></span></div>
    <div class="xr-near"></div>
    ${r.light ? `<div class="xr-signal ${r.step === 'look' || r.step === 'walk' || r.step === 'done' ? 'green' : 'red'}" role="img" aria-label="${r.step === 'look' || r.step === 'walk' ? 'Green man' : 'Red man'}"><span class="man red">${ic('me', 40)}</span><span class="man green">${ic('me', 40)}</span></div>
      <button class="xr-pole ${r.step === 'button' ? '' : 'pressed'}" data-a="rdButton" aria-label="Crossing button" ${r.step === 'button' ? '' : 'disabled'}><span class="xr-pole-btn"></span></button>` : `<span class="xr-sign">${ic('me', 34)}</span>`}
    <div class="xr-lumi ${r.step === 'done' ? 'hop' : ''}" id="rdLumi" style="--y:${r.y}">${lumi(r.step === 'done' ? 'excited' : r.step === 'wait' ? 'calm' : 'happy', 150)}</div>
    <div class="xr-say" aria-live="polite">${esc(roadSay(r))}</div>
    <div class="xr-bar">
      ${need[0] === 'both' ? lookBtn('both', 'Look both ways') : lookBtn('left', 'Look left') }
      <button class="primary xr-walk" id="rdWalk" data-a="rdWalkTap" ${r.step === 'done' ? 'disabled' : ''}>${ic('play', 34)}<span>Walk</span></button>
      ${need[0] === 'both' ? '<span class="xr-looks"></span>' : lookBtn('right', 'Look right')}
    </div>
    <div class="xr-ticks">${need.map((n, i) => `<span class="${i < r.looks.length ? 'done' : ''}">${ic(i < r.looks.length ? 'check' : 'eye', 22)}</span>`).join('')}</div>
  </div>
  <div class="ev-rounds">${dots(g.round, g.total, 'var(--teal)', 18)}</div>
  ${winCard('road')}
</section>`;
  };
  function roadGreen(g) {
    const r = g.r;
    if (S.g !== g || r.step !== 'wait') return;
    r.cars = 'stop';
    render();
    later(() => { if (S.g !== g || r.step !== 'wait') return; r.step = 'look'; tone(880, 0.3, 0.09); render(); say(roadSay(r)); }, 1500);
  }
  A.GAME_START.road = () => { const g = S.g; if (g.r.step === 'wait') later(() => roadGreen(g), 5000); };
  function roadStep(g) {
    const r = g.r;
    if (r.step !== 'walk') return;
    r.y = Math.min(1, r.y + 0.012);
    const lu = document.getElementById('rdLumi');
    if (lu) lu.style.setProperty('--y', r.y);
    if (Math.round(r.y * 100) % 12 === 0) tone(NOTES[Math.round(r.y * 8) % NOTES.length], 0.08, 0.04);
    if (r.y >= 1) {
      r.step = 'done';
      render();
      say('We crossed safely! Well done.');
      later(() => {
        g.round += 1;
        if (g.round >= g.total) { win('road', lv() === 3 ? 2 : 1); return; }
        g.r = roadRound();
        render();
        say(roadSay(g.r));
        A.GAME_START.road();
      }, 1800);
    }
  }
  Object.assign(A.ACTIONS, {
    rdButton: () => {
      const g = S.g;
      const r = g.r;
      if (r.step !== 'button') return;
      r.step = 'wait';
      tone(660, 0.15, 0.08);
      render();
      say('Beep. Now we wait for the green man.');
      later(() => roadGreen(g), 4200);
    },
    rdLook: (d) => {
      const g = S.g;
      const r = g.r;
      if (r.step !== 'look') return;
      const want = LOOKS()[r.looks.length];
      if (d.v !== want) { say(`Look ${want} first. Cars come from the ${want} on this side.`); A.track('tries', 'road', { quiet: true }); return; }
      r.looks.push(d.v);
      r.looking = d.v;
      tone(NOTES[r.looks.length + 1], 0.2, 0.07);
      render();
      const all = r.looks.length >= LOOKS().length;
      say(all ? 'No cars moving. Safe to cross! Hold Walk.' : 'No cars moving. Now look ' + LOOKS()[r.looks.length] + '.');
      later(() => { if (S.g !== g) return; r.looking = null; if (all) r.step = 'walk'; render(); }, 1100);
    },
    rdWalkTap: () => {
      const r = S.g.r;
      if (r.step === 'walk' || r.step === 'done') return 'keep';
      A.track('tries', 'road', { quiet: true });
      wiggle(document.getElementById('rdLumi'));
      say({ button: 'Not yet. Press the button first.', wait: r.light ? 'Red man. We wait.' : 'Cars are coming. We wait.', look: 'Look before you cross.' }[r.step] || '');
      return 'keep';
    }
  });
  A.AFTER['g-road'] = () => {
    const g = S.g;
    const btn = document.getElementById('rdWalk');
    if (!btn || !g || g.won) return;
    let held = false;
    const loop = () => { if (!held || S.g !== g || !document.body.contains(btn)) { held = false; return; } roadStep(g); if (g.r.step === 'walk') requestAnimationFrame(loop); };
    btn.addEventListener('pointerdown', () => { if (g.r.step !== 'walk' || held) return; held = true; requestAnimationFrame(loop); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => btn.addEventListener(ev, () => { held = false; }));
    // keyboard and switch users: each press takes a few steps
    btn.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && g.r.step === 'walk') for (let i = 0; i < 8; i++) roadStep(g); });
  };
  A.GUIDE['g-road'] = () => {
    const r = S.g && S.g.r;
    if (!r || S.g.won) return null;
    const sel = { button: '.xr-pole', look: `.xr-look[data-v="${LOOKS()[r.looks.length]}"]`, walk: '#rdWalk' }[r.step];
    return sel ? { sel, say: roadSay(r), delay: state.settings.guideDelay * 1000 + 5000 } : null;
  };
  restartOn('road');

  // ================================================================ 4. Tell the time
  const DAY = [[7, 'Wake up', 'sSun'], [8, 'School starts', 'sPencil'], [10, 'Snack time', 'apple'], [12, 'Lunch', 'sDinner'], [3, 'Home time', 'bus'], [5, 'Play time', 'sBall'], [6, 'Dinner', 'sRice'], [9, 'Bedtime', 'sMoon']];
  const timeWords = (h, m) => (m === 0 ? `${h} o'clock` : m === 30 ? `half past ${h}` : m === 15 ? `quarter past ${h}` : `quarter to ${(h % 12) + 1}`);
  const timeDigits = (h, m) => `${h}:${m < 10 ? '0' + m : m}`;
  function clockRound(prev) {
    const l = lv();
    let ev = pick(DAY);
    while (prev && ev[0] === prev) ev = pick(DAY);
    const m = l === 1 ? 0 : l === 2 ? pick([0, 30, 30]) : pick([15, 30, 45, 0]);
    const mm = l === 1 ? 0 : 180 * (m === 30 ? 0 : 1);
    let hh = ((ev[0] % 12) * 30 + 180) % 360;
    if (l > 1 && hh === mm) hh = (hh + 90) % 360; // never start with one hand hiding the other
    return { h: ev[0], m, label: ev[1], icon: ev[2], hh, mm, tries: 0, solved: false };
  }
  A.GAME_MAKERS.clock = () => ({ round: 0, total: 4, r: clockRound(), won: false });
  const clockSay = (r) => `${r.label} is at ${timeWords(r.h, r.m)}. Turn the ${lv() === 1 ? 'short hand' : 'hands'} to show the time.`;
  A.PARENT['g-clock'] = 'play';
  A.VOICE['g-clock'] = () => clockSay(S.g.r);
  A.SCREENS['g-clock'] = () => {
    const g = S.g;
    const r = g.r;
    const nums = [...Array(12).keys()].map((i) => { const n = i + 1; const a = (n * 30 * Math.PI) / 180; return `<span class="cl-num ${r.tries >= 3 && !r.solved && n === r.h ? 'hint' : ''}" style="left:${50 + 39 * Math.sin(a)}%;top:${50 - 39 * Math.cos(a)}%">${n}</span>`; }).join('');
    const ticks = [...Array(60).keys()].map((i) => `<i class="cl-tick ${i % 5 ? '' : 'big'}" style="transform:rotate(${i * 6}deg)"></i>`).join('');
    return `
<section class="screen" aria-label="Tell the time">
  ${A.srTitle('Tell the time')}
  ${header('clock', clockSay(r))}
  <div class="row gap24 grow">
    <div class="col center gap16" style="width:330px">
      <div class="cl-card"><span class="cl-ic">${ic(r.icon, 64)}</span><b>${esc(r.label)}</b>${lv() < 3 ? `<span class="cl-digits">${timeDigits(r.h, r.m)}</span>` : ''}<span class="cl-words">${cap(timeWords(r.h, r.m))}</span></div>
      ${lumi(r.solved ? 'excited' : 'happy', 170)}
      ${dots(g.round, g.total, 'var(--teal)', 18)}
    </div>
    <div class="panel ev-scene cl-scene grow">
      <div class="cl-face ${r.solved ? 'ok' : ''}" id="clFace">${ticks}${nums}
        <span class="cl-hand min ${lv() === 1 ? 'fixed' : ''}" style="transform:rotate(${r.mm}deg)"><i></i></span>
        <span class="cl-hand hour" style="transform:rotate(${r.hh}deg)"><i></i></span><span class="cl-pin"></span></div>
      <div class="cl-key"><span><i class="short"></i>Short hand: hour</span>${lv() > 1 ? '<span><i class="long"></i>Long hand: minutes</span>' : ''}</div>
    </div>
  </div>
  ${winCard('clock')}
</section>`;
  };
  A.AFTER['g-clock'] = () => {
    const g = S.g;
    const face = document.getElementById('clFace');
    if (!face || !g || g.won) return;
    const r = g.r;
    let hand = null;
    const ang = (e) => { const b = face.getBoundingClientRect(); return ((Math.atan2(e.clientX - (b.left + b.width / 2), -(e.clientY - (b.top + b.height / 2))) * 180) / Math.PI + 360) % 360; };
    const diff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
    const set = (a) => {
      if (hand === 'min') { r.mm = (Math.round(a / 30) * 30) % 360; face.querySelector('.cl-hand.min').style.transform = `rotate(${r.mm}deg)`; }
      else { r.hh = (Math.round(a / 7.5) * 7.5) % 360; face.querySelector('.cl-hand.hour').style.transform = `rotate(${r.hh}deg)`; }
    };
    face.addEventListener('pointerdown', (e) => {
      if (r.solved) return;
      const a = ang(e);
      const fb = face.getBoundingClientRect();
      const far = Math.hypot(e.clientX - (fb.left + fb.width / 2), e.clientY - (fb.top + fb.height / 2)) > fb.width * 0.3;
      // both hands close together: the long hand is the one you can reach further out
      hand = lv() === 1 ? 'hour' : Math.abs(diff(a, r.mm) - diff(a, r.hh)) < 25 ? (far ? 'min' : 'hour') : diff(a, r.mm) < diff(a, r.hh) ? 'min' : 'hour';
      try { face.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      set(a);
    });
    face.addEventListener('pointermove', (e) => { if (hand && !r.solved) set(ang(e)); });
    const up = () => {
      if (!hand || r.solved) { hand = null; return; }
      const was = hand;
      hand = null;
      tone(was === 'min' ? 587 : 440, 0.1, 0.05);
      const minOk = diff(r.mm, r.m * 6) < 1;
      const hourOk = diff(r.hh, (r.h % 12) * 30 + r.m * 0.5) <= (lv() === 1 ? 12 : 16);
      if (minOk && hourOk) {
        r.solved = true;
        if (!r.tries) A.track('correct', 'clock', { quiet: true });
        tone(784, 0.4, 0.1);
        render();
        say(`Yes! ${cap(timeWords(r.h, r.m))}. ${r.label}!`);
        later(() => {
          g.round += 1;
          if (g.round >= g.total) { win('clock', lv() === 3 ? 2 : 1); return; }
          g.r = clockRound(r.h);
          render();
          say(clockSay(g.r));
        }, 2000);
        return;
      }
      r.tries += 1;
      if (r.tries === 1) A.track('tries', 'clock', { quiet: true });
      if (r.tries === 3) render();
      say(!hourOk && was === 'hour' ? `The short hand points to the ${r.m === 45 ? 'space before ' + ((r.h % 12) + 1) : r.h}.` : !minOk ? `The long hand points to the ${r.m === 0 ? 12 : r.m / 5}.` : `Now the short hand. It points to ${r.h}.`);
    };
    face.addEventListener('pointerup', up);
    face.addEventListener('pointercancel', () => { hand = null; });
  };
  A.GUIDE['g-clock'] = () => (S.g && !S.g.won && !S.g.r.solved ? { sel: '.cl-hand.hour i', say: clockSay(S.g.r), delay: state.settings.guideDelay * 1000 + 8000 } : null);
  restartOn('clock');

  // ================================================================ 5. Zip and button (getting dressed)
  const FZ_TASKS = { 1: ['zip', 'buttons'], 2: ['zip', 'buttons', 'buckle'], 3: ['buttons', 'zip', 'buckle', 'laces'] };
  const FZ_INFO = {
    zip: ['kZip', 'Zip', 'Pull the zip all the way up.'],
    buttons: ['sShirt', 'Buttons', 'Push each button into its hole.'],
    buckle: ['bag', 'Buckle', 'Push the two parts of the buckle together.'],
    laces: ['shoes', 'Laces', 'Pull both laces out to make them tight.']
  };
  A.GAME_MAKERS.fasten = () => ({ tasks: FZ_TASKS[lv()], i: 0, p: 0, done: [], n: { 1: 2, 2: 3, 3: 4 }[lv()], busy: false, won: false });
  const fzTask = (g) => g.tasks[Math.min(g.i, g.tasks.length - 1)];
  const fzSay = (g) => (fzTask(g) === 'buttons' && lv() === 3 ? 'Button up from the top, so the shirt lines up.' : FZ_INFO[fzTask(g)][2]);
  function fzNext(g) {
    g.busy = true;
    tone(784, 0.3, 0.09);
    say(pick(['Done!', 'You did it!', 'Nice and neat!']));
    later(() => {
      g.busy = false;
      g.i += 1;
      g.p = 0;
      g.done = [];
      if (g.i >= g.tasks.length) { g.i = g.tasks.length - 1; g.all = true; win('fasten', lv() === 3 ? 2 : 1); return; }
      render();
      say(fzSay(g));
    }, 1300);
  }
  A.PARENT['g-fasten'] = 'play';
  A.VOICE['g-fasten'] = () => fzSay(S.g);
  A.SCREENS['g-fasten'] = () => {
    const g = S.g;
    const t = fzTask(g);
    const strip = g.tasks.map((k, i) => `<span class="ev-step ${i < g.i || g.all ? 'done' : i === g.i ? 'now' : ''}">${ic(i < g.i || g.all ? 'check' : FZ_INFO[k][0], 30)}<span>${FZ_INFO[k][1]}</span></span>`).join(`<span class="ev-arrow">${ic('chev', 18)}</span>`);
    let work = '';
    if (t === 'zip') {
      work = `<div class="fz-jacket" id="fzJacket" style="--p:${g.p}"><span class="fz-collar l"></span><span class="fz-collar r"></span><span class="fz-open"></span><span class="fz-teeth"></span>
        <span class="fz-pull" id="fzPull" role="slider" aria-label="Zip" aria-valuenow="${Math.round(g.p * 100)}" aria-valuemin="0" aria-valuemax="100" tabindex="0"><i></i></span><span class="fz-pocket l"></span><span class="fz-pocket r"></span></div>`;
    } else if (t === 'buttons') {
      const rows = [...Array(g.n).keys()];
      work = `<div class="fz-shirt n${g.n}"><span class="fz-collar l"></span><span class="fz-collar r"></span><span class="fz-placket"></span>
        ${rows.map((i) => `<span class="fz-hole ${g.done.includes(i) ? 'full' : ''}" data-i="${i}" style="top:${18 + (i * 68) / g.n}%">${g.done.includes(i) ? '<i class="fz-btn in"></i>' : ''}</span>`).join('')}
        ${rows.filter((i) => !g.done.includes(i)).map((i) => `<span class="fz-btn loose" data-i="${i}" role="button" aria-label="Button ${i + 1}" style="top:${18 + (i * 68) / g.n}%"></span>`).join('')}</div>`;
    } else if (t === 'buckle') {
      work = `<div class="fz-bag"><span class="fz-strap l"></span><span class="fz-strap r"></span>
        ${g.p >= 1 ? '<span class="fz-clip joined"></span>' : '<span class="fz-clip a" id="fzClipA" role="button" aria-label="Buckle"></span><span class="fz-clip b" id="fzClipB"></span>'}</div>`;
    } else {
      work = `<div class="fz-shoe"><span class="fz-sole"></span><span class="fz-upper"></span><span class="fz-x"></span>
        ${['l', 'r'].map((s) => (g.done.includes(s) ? '' : `<span class="fz-lace ${s}" data-s="${s}" role="button" aria-label="Lace"></span><span class="fz-eye ${s}" data-s="${s}"></span>`)).join('')}
        ${g.done.length >= 2 ? '<span class="fz-bow"></span>' : ''}</div>`;
    }
    return `
<section class="screen" aria-label="Zip and button">
  ${A.srTitle('Zip and button')}
  ${header('fasten', fzSay(g))}
  <div class="row gap24 grow">
    <div class="panel ev-scene fz-scene grow"><div class="ev-strip">${strip}</div><div class="ev-work">${work}</div></div>
    <div class="col center gap12" style="width:230px">${lumi(g.busy || g.all ? 'excited' : 'happy', 210)}<p class="ev-tip" aria-live="polite">${esc(FZ_INFO[t][1])}</p></div>
  </div>
  ${winCard('fasten')}
</section>`;
  };
  A.AFTER['g-fasten'] = () => {
    const g = S.g;
    if (!g || g.won || g.busy) return;
    const t = fzTask(g);
    if (t === 'zip') {
      const jacket = document.getElementById('fzJacket');
      const pull = document.getElementById('fzPull');
      let from = null;
      const setP = (p) => {
        const step = Math.floor(g.p * 8);
        g.p = Math.max(0, Math.min(1, p));
        jacket.style.setProperty('--p', g.p);
        if (Math.floor(g.p * 8) !== step) tone(300 + g.p * 500, 0.05, 0.05);
        if (g.p >= 1 && !g.busy) fzNext(g);
      };
      pull.addEventListener('pointerdown', (e) => { from = { y: e.clientY, p: g.p }; try { pull.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } });
      pull.addEventListener('pointermove', (e) => { if (from && !g.busy) setP(from.p + (from.y - e.clientY) / scale() / (jacket.offsetHeight * 0.68)); });
      ['pointerup', 'pointercancel'].forEach((ev) => pull.addEventListener(ev, () => { from = null; }));
      pull.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') setP(g.p + 0.2); });
    } else if (t === 'buttons') {
      const put = (i, el, hole) => {
        const next = Math.min(...[...Array(g.n).keys()].filter((k) => !g.done.includes(k)));
        if (hole !== i) { wiggle(el); say('That hole is for another button. Use the hole beside it.'); return false; }
        if (lv() === 3 && i !== next) { wiggle(el); say('Start from the top button.'); A.track('tries', 'fasten', { quiet: true }); return false; }
        g.done.push(i);
        tone(NOTES[g.done.length], 0.2, 0.08);
        render();
        if (g.done.length >= g.n) fzNext(g);
        return true;
      };
      stage.querySelectorAll('.fz-btn.loose').forEach((el) => {
        const i = Number(el.dataset.i);
        draggable(el, {
          drop: (x, y) => { const h = [...stage.querySelectorAll('.fz-hole:not(.full)')].find((ho) => { const r = ho.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < r.width * 1.1; }); return h ? put(i, el, Number(h.dataset.i)) : false; },
          tap: () => put(i, el, i)
        });
      });
    } else if (t === 'buckle') {
      const a = document.getElementById('fzClipA');
      const b = document.getElementById('fzClipB');
      if (!a) return;
      const join = () => { g.p = 1; tone(988, 0.12, 0.1); render(); say('Click!'); fzNext(g); return true; };
      draggable(a, { over: (x, y) => b.classList.toggle('hot', inside(b, x, y)), drop: (x, y) => { const r = b.getBoundingClientRect(); return x > r.left - 60 && y > r.top - 60 && y < r.bottom + 60 ? join() : false; }, tap: join });
    } else {
      const pullOut = (s) => { g.done.push(s); tone(NOTES[g.done.length + 2], 0.2, 0.08); render(); if (g.done.length >= 2) fzNext(g); else say('Now the other lace.'); return true; };
      stage.querySelectorAll('.fz-lace').forEach((el) => {
        const s = el.dataset.s;
        const eye = stage.querySelector(`.fz-eye.${s}`);
        draggable(el, { over: (x, y) => eye.classList.toggle('hot', inside(eye, x, y)), drop: (x, y) => { const r = eye.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < 90 * scale() ? pullOut(s) : false; }, tap: () => pullOut(s) });
      });
    }
  };
  A.GUIDE['g-fasten'] = () => {
    const g = S.g;
    if (!g || g.won || g.busy) return null;
    const sel = { zip: '#fzPull', buttons: '.fz-btn.loose', buckle: '#fzClipA', laces: '.fz-lace' }[fzTask(g)];
    return { sel, say: fzSay(g), delay: state.settings.guideDelay * 1000 + 6000 };
  };
  restartOn('fasten');

  // ---------------------------------------------------------------- on the Everyday shelf
  D.GAMES.push(
    { id: 'cook', name: "Lumi's kitchen", icon: 'kCook', kind: 'Cooking', tint: '#FDE6D8', ink: '#C0603F', skill: 'lifeskills', cat: 'life' },
    { id: 'shop', name: 'Go shopping', icon: 'kShop', kind: 'Money', tint: '#FCE4EC', ink: '#B4507A', skill: 'lifeskills', cat: 'life' },
    { id: 'road', name: 'Cross the road', icon: 'kRoad', kind: 'Road safety', tint: '#E3F0FA', ink: '#4A78A8', skill: 'lifeskills', cat: 'life' },
    { id: 'clock', name: 'Tell the time', icon: 'kClock', kind: 'Time', tint: '#FFF1C2', ink: '#8A5C0C', skill: 'thinking', cat: 'life' },
    { id: 'fasten', name: 'Zip and button', icon: 'kZip', kind: 'Getting dressed', tint: '#E7F3E1', ink: '#4F8A3F', skill: 'lifeskills', cat: 'life' }
  );
  A.GAME.guard(['cook', 'shop', 'road', 'clock', 'fasten']);
})();
