/*
  roomstyle.js
  More ways to make Lumi's room your own.
  Wallpaper and floor: pick them in Room › Walls (the paint roller tab). Plain walls and a wood floor are free;
    the others cost a few stars. The choice shows in Lumi's room, at home and beside the games.
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
    }
  });
  const prevAfter = A.afterRender;
  A.afterRender = () => {
    if (prevAfter) prevAfter();
    try { paint(); } catch (e) { /* decoration only */ }
  };
})();
