/*
  roomstyle.js
  More ways to make Lumi's room your own:
  - Wallpaper and floor: pick them in Room › Walls (the paint roller tab). Plain walls and a wood floor are free;
    the others cost a few stars. The choice shows in Lumi's room, at home and beside the games.
  - 3D view: the cube button in the room turns the flat picture into a little 3D room. Drag (or use the arrows)
    to turn it and look around; tap things to hear their names; tap the lamp to switch the light off and on.
    Moving, resizing and buying still happen as before; the 3D room is built from the same saved places.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, tone, save, render, stage } = A;

  // ---------------------------------------------------------------- wallpapers and floors (plain CSS, no image files)
  const dots = (c, size, r) => `radial-gradient(circle, ${c} 0 ${r}px, transparent ${r + 1}px) 0 0 / ${size}px ${size}px, radial-gradient(circle, ${c} 0 ${r}px, transparent ${r + 1}px) ${size / 2}px ${size / 2}px / ${size}px ${size}px`;
  const WALLS = [
    { id: 'plain', name: 'Cream wall', price: 0, css: '#F6E7D3' },
    { id: 'stripes', name: 'Stripy wall', price: 2, css: 'repeating-linear-gradient(90deg, #FBE9DA 0 44px, #F6D5C0 44px 88px)' },
    { id: 'dots', name: 'Spotty wall', price: 3, css: `${dots('#F6BCCB', 64, 9)}, #FDEEF2` },
    { id: 'sky', name: 'Sky wall', price: 4, css: 'radial-gradient(ellipse 90px 30px at 22% 24%, #fff 0 99%, transparent 100%), radial-gradient(ellipse 60px 24px at 30% 17%, #fff 0 99%, transparent 100%), radial-gradient(ellipse 110px 34px at 72% 40%, #fff 0 99%, transparent 100%), radial-gradient(ellipse 70px 26px at 64% 32%, #fff 0 99%, transparent 100%), linear-gradient(#BFE3F7, #E9F6FD)' },
    { id: 'rainbow', name: 'Rainbow wall', price: 5, css: 'radial-gradient(circle at 50% 78%, #FFF8EC 0 26%, #D7C6F2 26% 31%, #B8DDF8 31% 36%, #BDEBC8 36% 41%, #FFF1A8 41% 46%, #FFD8A8 46% 51%, #FFB3BA 51% 56%, transparent 56%), #FFF8EC' },
    { id: 'leaves', name: 'Leafy wall', price: 4, css: `${dots('#B9DBA0', 80, 12)}, repeating-linear-gradient(60deg, rgba(255,255,255,0.35) 0 14px, transparent 14px 60px), #DDEFD0` },
    { id: 'lavender', name: 'Purple wall', price: 3, css: 'repeating-linear-gradient(90deg, #EEE7FA 0 60px, #E4DAF6 60px 64px)' },
    { id: 'night', name: 'Night sky wall', price: 6, css: `${dots('#F4D35E', 110, 3)}, ${dots('#fff', 70, 1.6)}, linear-gradient(#2F3B66, #55649A)`, dark: true }
  ];
  const FLOORS = [
    { id: 'wood', name: 'Wood floor', price: 0, css: 'repeating-linear-gradient(90deg, transparent 0 118px, rgba(90,60,40,0.14) 118px 120px), #E8CDB0' },
    { id: 'pale', name: 'Pale floor', price: 2, css: 'repeating-linear-gradient(90deg, transparent 0 88px, rgba(90,60,40,0.10) 88px 90px), #F3E6D2' },
    { id: 'tiles', name: 'Tile floor', price: 3, css: 'repeating-conic-gradient(#F6F1E9 0 25%, #D5E4EE 0 50%) 0 0 / 92px 92px' },
    { id: 'grass', name: 'Green carpet', price: 3, css: `${dots('#A9D08A', 46, 4)}, #C3E0AC` },
    { id: 'pink', name: 'Pink carpet', price: 3, css: `${dots('#F4BFCD', 46, 4)}, #F9D6DF` },
    { id: 'blue', name: 'Blue carpet', price: 3, css: `${dots('#B4CDE9', 46, 4)}, #CFE0F3` }
  ];
  const byId = (list, id) => list.find((x) => x.id === id) || list[0];
  const st = () => {
    if (!state.roomStyle) state.roomStyle = { wall: 'plain', floor: 'wood', walls: ['plain'], floors: ['wood'] };
    const r = state.roomStyle;
    if (!Array.isArray(r.walls)) r.walls = ['plain'];
    if (!Array.isArray(r.floors)) r.floors = ['wood'];
    return r;
  };
  const wallNow = () => byId(WALLS, st().wall);
  const floorNow = () => byId(FLOORS, st().floor);
  A.roomSkin = () => ({ wall: wallNow().css, floor: floorNow().css, dark: !!wallNow().dark });

  // paint every picture of Lumi's room (the room itself, home, beside the games)
  function paint() {
    stage.querySelectorAll('#screen .panel.scene.lumi-room').forEach((p) => {
      p.style.background = wallNow().css;
      p.classList.toggle('dark-wall', !!wallNow().dark);
      const f = p.querySelector(':scope > .floor');
      if (f) f.style.background = floorNow().css;
    });
  }

  // ---------------------------------------------------------------- the Walls tab in the room shop
  const kindOf = (key) => (key.indexOf('wall:') === 0 ? ['wall', WALLS, 'walls'] : ['floor', FLOORS, 'floors']);
  function tile(kind, list, it) {
    const r = st();
    const have = r[kind + 's'].includes(it.id);
    const on = r[kind] === it.id;
    const afford = state.stars >= it.price;
    const status = on ? `<span class="ic-green">${ic('check', 28)}</span>` : have ? '<span class="rug-wear">Use</span>' : `<span class="price ${afford ? '' : 'grey'}">${ic(afford ? 'star' : 'starGrey', 20)}${it.price}</span>`;
    return `<button class="item-tile skin-tile ${have ? 'owned' : ''} ${on || S.roomSel === kind + ':' + it.id ? 'sel' : ''} ${!have && !afford ? 'locked' : ''}" data-a="skinPick" data-id="${kind}:${it.id}" aria-label="${esc(it.name)}${on ? ', in the room now' : have ? ', yours' : `, ${it.price} stars`}">
      <span class="skin-swatch ${kind}"><i style="background:${it.css}"></i></span>${status}</button>`;
  }
  A.wallTiles = () => `<span class="skin-head">${ic('rWall', 26)}<span>Walls</span></span>${WALLS.map((w) => tile('wall', WALLS, w)).join('')}<span class="skin-head">${ic('rFloor', 26)}<span>Floors</span></span>${FLOORS.map((f) => tile('floor', FLOORS, f)).join('')}`;
  A.wallBuyBar = () => {
    const [kind, list] = kindOf(S.roomSel || '');
    const it = byId(list, (S.roomSel || '').split(':')[1]);
    const afford = state.stars >= it.price;
    return `<div class="buy-bar">
      <span class="skin-swatch small ${kind}"><i style="background:${it.css}"></i></span>
      <span class="label grow">${esc(it.name)}</span>
      <button class="primary ${afford ? '' : 'faded'}" data-a="skinBuy" data-id="${kind}:${it.id}" style="height:72px" aria-label="Buy for ${it.price} stars">${ic('shop', 32)}${ic('star', 28)}<span>${it.price}</span></button>
    </div>`;
  };
  function use(kind, id) { st()[kind] = id; S.roomSel = null; save(); render(); }
  Object.assign(A.ACTIONS, {
    skinPick: (d) => {
      const [kind, list] = kindOf(d.id);
      const it = byId(list, d.id.split(':')[1]);
      if (st()[kind + 's'].includes(it.id)) { use(kind, it.id); tone(587, 0.2, 0.06); say(`${it.name}.`); return; }
      S.roomSel = d.id;
      S.roomPick = null;
      render();
      say(state.stars >= it.price ? `${it.name}. ${it.price} stars. Tap to buy it.` : `${it.name}. You need ${it.price - state.stars} more stars.`);
    },
    skinBuy: (d) => {
      const [kind, list] = kindOf(d.id);
      const it = byId(list, d.id.split(':')[1]);
      if (state.stars < it.price) { say(`You need ${it.price - state.stars} more stars.`); return; }
      state.stars -= it.price;
      st()[kind + 's'].push(it.id);
      tone(659, 0.3, 0.1);
      use(kind, it.id);
      say(`A new ${kind} for Lumi's room!`);
    },
    room3d: () => { state.room3d = !state.room3d; S.roomPick = null; save(); render(); tone(state.room3d ? 784 : 523, 0.2, 0.07); say(state.room3d ? '3D room. Drag to look around.' : 'Flat room. Drag things to move them.'); },
    r3Turn: (d) => { turn((S.r3Rot == null ? -24 : S.r3Rot) + Number(d.v), true); return 'keep'; },
    r3Tap: (d, el) => {
      const id = d.id;
      el.classList.remove('r3-wig');
      void el.offsetWidth;
      el.classList.add('r3-wig');
      if (id === 'lumi') { tone(659, 0.2, 0.08); say(A.pick(['Hello!', 'I love my room!', 'Look around!'])); return 'keep'; }
      const it = D.ROOM.find((r) => r.id === id);
      if (id === 'lamp' || id === 'fairylights') {
        S.r3Dark = !S.r3Dark;
        const sc = stage.querySelector('.room-scene');
        if (sc) sc.classList.toggle('r3-dark', S.r3Dark);
        tone(S.r3Dark ? 392 : 784, 0.25, 0.07);
        say(S.r3Dark ? 'Lights off.' : 'Lights on.');
        return 'keep';
      }
      tone(587, 0.15, 0.06);
      if (it) say(it.name + '.');
      return 'keep';
    }
  });
  A.room3dBtn = () => `<button class="icon-btn room-3d ${state.room3d ? 'on' : ''}" data-a="room3d" aria-pressed="${!!state.room3d}" aria-label="${state.room3d ? 'Show the flat room' : 'Show the room in 3D'}">${ic('k3d', 32)}<span>${state.room3d ? 'Flat' : '3D'}</span></button>`;

  // ---------------------------------------------------------------- the 3D room
  const TILT = -15;
  function turn(deg, smooth) {
    const world = stage.querySelector('.r3-world');
    S.r3Rot = Math.max(-42, Math.min(42, deg));
    if (!world) return;
    world.classList.toggle('smooth', !!smooth);
    world.style.setProperty('--ry', S.r3Rot + 'deg');
  }
  function build(scene) {
    if (scene.querySelector('.r3-stage')) return;
    const W = scene.offsetWidth;
    const H = scene.offsetHeight;
    const floor = scene.querySelector(':scope > .floor');
    const floorTop = floor ? floor.offsetTop : H * 0.76;
    const fh = H - floorTop;
    const Dp = Math.round(W * 0.66); // how deep the room is
    const skin = A.roomSkin();
    const things = [];
    scene.querySelectorAll(':scope > .decor, :scope > .room-lumi').forEach((el) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      const id = el.dataset.id;
      const bottom = el.offsetTop + h;
      const onFloor = id === 'lumi' || bottom >= floorTop - H * 0.07;
      things.push({ id, w, h, x: el.offsetLeft, y: el.offsetTop, onFloor, depth: Math.max(0, Math.min(1, (bottom - floorTop) / fh)), html: el.innerHTML, name: id === 'lumi' ? 'Lumi' : (D.ROOM.find((r) => r.id === id) || {}).name || '' });
    });
    const rug = scene.querySelector(':scope > .lumi-rug');
    const zOf = (t) => -Dp / 2 + (0.1 + 0.8 * t.depth) * Dp;
    const wallBits = things.filter((t) => !t.onFloor).map((t) => `<button class="r3-flat" data-a="r3Tap" data-id="${t.id}" aria-label="${esc(t.name)}" style="left:${t.x}px;top:${Math.min(t.y, floorTop - t.h)}px;width:${t.w}px;height:${t.h}px">${t.html}</button>`).join('');
    const floorBits = things.filter((t) => t.onFloor).map((t) => `<button class="r3-bb ${t.id === 'lumi' ? 'r3-lumi' : ''}" data-a="r3Tap" data-id="${t.id}" aria-label="${esc(t.name)}" style="width:${t.w}px;height:${t.h}px;transform:translate3d(${Math.round(t.x - W / 2)}px, ${-t.h}px, ${Math.round(zOf(t))}px) rotateY(calc(var(--ry) * -1))">${t.html}</button>`).join('');
    let rugBit = '';
    const lu = things.find((t) => t.id === 'lumi');
    if (rug && lu) {
      const rw = rug.offsetWidth;
      const rd = Math.round(rw * 0.62);
      rugBit = `<div class="r3-rug" style="width:${rw}px;height:${rd}px;transform:translate3d(${Math.round(lu.x + lu.w / 2 - W / 2 - rw / 2)}px, -2px, ${Math.round(zOf(lu) - rd / 2)}px) rotateX(90deg)">${A.rugSvg ? A.rugSvg(null, rw).replace('<svg ', '<svg preserveAspectRatio="none" style="width:100%;height:100%" ') : ''}</div>`;
    }
    const el = document.createElement('div');
    el.className = 'r3-stage';
    el.innerHTML = `<div class="r3-world" style="--ry:${S.r3Rot == null ? -24 : S.r3Rot}deg;--tilt:${TILT}deg">
        <div class="r3-wall back" style="width:${W}px;height:${floorTop}px;background:${skin.wall};transform:translate3d(${-W / 2}px, ${-floorTop}px, ${-Dp / 2}px)">${wallBits}</div>
        <div class="r3-wall side" style="width:${Dp}px;height:${floorTop}px;background:${skin.wall};transform:translate3d(${-W / 2}px, ${-floorTop}px, ${Dp / 2}px) rotateY(90deg)"><span class="r3-window"><i></i></span></div>
        <div class="r3-wall side" style="width:${Dp}px;height:${floorTop}px;background:${skin.wall};transform:translate3d(${W / 2}px, ${-floorTop}px, ${-Dp / 2}px) rotateY(-90deg)"><span class="r3-door"></span></div>
        <div class="r3-floor" style="width:${W}px;height:${Dp}px;background:${skin.floor};transform:translate3d(${-W / 2}px, 0, ${-Dp / 2}px) rotateX(90deg)"></div>
        ${rugBit}${floorBits}
      </div>`;
    scene.appendChild(el);
    const ctl = document.createElement('div');
    ctl.className = 'r3-ctl';
    ctl.innerHTML = `<button class="icon-btn" data-a="r3Turn" data-v="-14" aria-label="Turn the room left">${ic('back', 30)}</button><span class="r3-tip">${ic('hand', 24)}<span>Drag to look around</span></span><button class="icon-btn r3-right" data-a="r3Turn" data-v="14" aria-label="Turn the room right">${ic('back', 30)}</button>`;
    scene.appendChild(ctl);
    if (S.r3Dark) scene.classList.add('r3-dark');
    // drag anywhere to turn the room; a drag is never a tap
    let down = null;
    let dragged = false;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, rot: S.r3Rot == null ? -24 : S.r3Rot }; dragged = false; });
    el.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 8) { dragged = true; try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
      if (dragged) turn(down.rot + dx * 0.22, false);
    });
    const end = () => { down = null; };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
  }

  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    try {
      paint();
      const scene = stage.querySelector('#screen .room-scene.is3d');
      if (scene) build(scene);
    } catch (e) { /* decoration only */ }
  };
})();
