/*
  appicons.js
  Choose Lumi's app icon (Grown-ups › Child › App icon). Twelve designs, drawn in Lumi's colours,
  plus the original. The choice belongs to the tablet (not to one child), so it is kept on its own.
  It sets the browser tab icon, the iPad/iPhone home-screen icon (apple-touch-icon) and the install
  manifest's icons. A home-screen icon is copied when Lumi is added to the home screen, so if Lumi is
  already there, remove it and add it again to see the new one.
  The pictures are icons/app-<id>-180|192|512.png and app-<id>-mask-512.png (Android round icons).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { S, ic, esc, render, say } = A;
  const KEY = 'lumi-appicon';
  const ICONS = [
    { id: 'original', name: 'Original' },
    { id: 'face', name: "Lumi's face" },
    { id: 'peek', name: 'Peekaboo' },
    { id: 'night', name: 'Little light' },
    { id: 'wave', name: 'Hello wave' },
    { id: 'word', name: 'Wordmark' },
    { id: 'talk', name: 'Talk and feel' },
    { id: 'wonder', name: 'Wonder' },
    { id: 'blanket', name: 'Cosy blanket' },
    { id: 'sunny', name: 'Sunny day' },
    { id: 'crown', name: 'Glow on teal' },
    { id: 'moon', name: 'Moon and spark' },
    { id: 'corner', name: 'Corner peek' }
  ];
  const files = (id) => (id === 'original'
    ? { s180: 'icons/icon-180.png', s192: 'icons/icon-192.png', s512: 'icons/icon-512.png', mask: 'icons/maskable-512.png' }
    : { s180: `icons/app-${id}-180.png`, s192: `icons/app-${id}-192.png`, s512: `icons/app-${id}-512.png`, mask: `icons/app-${id}-mask-512.png` });
  const current = () => { try { const v = localStorage.getItem(KEY); return ICONS.some((i) => i.id === v) ? v : 'original'; } catch (e) { return 'original'; } };
  const abs = (p) => new URL(p, document.baseURI).href;

  let blobUrl = null;
  function apply(id) {
    const f = files(id);
    const set = (rel, href, sizes) => {
      let l = document.head.querySelector(`link[rel="${rel}"]`);
      if (!l) { l = document.createElement('link'); l.rel = rel; document.head.appendChild(l); }
      if (sizes) l.setAttribute('sizes', sizes);
      l.href = href;
    };
    set('icon', f.s192, '192x192');
    set('apple-touch-icon', f.s180);
    if (id === 'original') { set('manifest', 'manifest.webmanifest'); return; }
    // the install manifest, pointing at the chosen pictures (a blob needs full addresses)
    fetch('manifest.webmanifest').then((r) => r.json()).catch(() => ({ name: 'Lumi', short_name: 'Lumi', display: 'standalone' })).then((m) => {
      m.start_url = abs(m.start_url || './index.html');
      m.scope = abs(m.scope || './');
      m.icons = [
        { src: abs(f.s192), sizes: '192x192', type: 'image/png' },
        { src: abs(f.s512), sizes: '512x512', type: 'image/png' },
        { src: abs(f.mask), sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ];
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: 'application/manifest+json' }));
      set('manifest', blobUrl);
    });
  }
  apply(current());

  A.appIconHtml = () => {
    const cur = current();
    return `<h2 class="g-h top-gap">App icon</h2>
      <p class="g-note">Pick the picture for Lumi on the tablet's home screen. If Lumi is already on the home screen, remove it and add it again (Share › Add to Home Screen) to see the new one.</p>
      <div class="appicon-grid">${ICONS.map((i) => `<button class="appicon-opt ${cur === i.id ? 'on' : ''}" data-a="appIcon" data-v="${i.id}" aria-pressed="${cur === i.id}" aria-label="${esc(i.name)}">
        <img src="${files(i.id).s192}" alt="" width="64" height="64"><span>${esc(i.name)}</span>${cur === i.id ? `<i class="appicon-tick">${ic('check', 14)}</i>` : ''}</button>`).join('')}</div>`;
  };
  A.ACTIONS.appIcon = (d) => {
    try { localStorage.setItem(KEY, d.v); } catch (e) { /* storage blocked: still changes for now */ }
    apply(d.v);
    render();
    const i = ICONS.find((x) => x.id === d.v);
    say(`App icon: ${i.name}.`);
  };
  A.APP_ICONS = ICONS;
  void S;
})();
