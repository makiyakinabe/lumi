/*
  sw.js — lets Lumi work without internet (see js/offline.js).
  Every file Lumi needs is kept on the tablet. Lumi always opens from the saved copy straight away and
  quietly fetches any newer version in the background, which shows the next time Lumi is opened.
  When you add or rename a file, add it to FILES and change VERSION.
*/
const VERSION = 'lumi-2026-11-08-3';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'privacy.html',
  'css/chat.css',
  'css/fonts.css',
  'css/learn-bath.css',
  'css/learn-bedroom.css',
  'css/learn-life.css',
  'css/learn.css',
  'css/story-care.css',
  'css/story-out.css',
  'css/story-school.css',
  'css/story-life.css',
  'css/styles.css',
  'css/teamgames.css',
  'css/tg-little.css',
  'css/tg-primary.css',
  'css/tg-teen.css',
  'js/aac.js',
  'js/agepacks.js',
  'js/app.js',
  'js/appicons.js',
  'js/audio.js',
  'js/caregiver.js',
  'js/chat.js',
  'js/comingup.js',
  'js/data.js',
  'js/daygames.js',
  'js/familiar.js',
  'js/feelchart.js',
  'js/icons.js',
  'js/kid.js',
  'js/lang.js',
  'js/learn-bath.js',
  'js/learn-bedroom.js',
  'js/learn-life.js',
  'js/learn-teeth.js',
  'js/learn.js',
  'js/lumi.js',
  'js/main.js',
  'js/movebreak.js',
  'js/native.js',
  'js/nownext.js',
  'js/offline.js',
  'js/people.js',
  'js/pet.js',
  'js/pics-food.js',
  'js/pics-symbols.js',
  'js/pics-things.js',
  'js/pics.js',
  'js/play.js',
  'js/profiles.js',
  'js/quickstart.js',
  'js/routinegames.js',
  'js/rugs.js',
  'js/store.js',
  'js/stories.js',
  'js/story-care.js',
  'js/story-hawker.js',
  'js/story-out.js',
  'js/story-school.js',
  'js/story-life.js',
  'js/teamgames.js',
  'js/tg-little.js',
  'js/tg-primary.js',
  'js/tg-teen.js',
  'js/together.js',
  'js/waitgame.js',
  'icons/app-blanket-180.png',
  'icons/app-blanket-192.png',
  'icons/app-blanket-512.png',
  'icons/app-blanket-mask-512.png',
  'icons/app-corner-180.png',
  'icons/app-corner-192.png',
  'icons/app-corner-512.png',
  'icons/app-corner-mask-512.png',
  'icons/app-crown-180.png',
  'icons/app-crown-192.png',
  'icons/app-crown-512.png',
  'icons/app-crown-mask-512.png',
  'icons/app-face-180.png',
  'icons/app-face-192.png',
  'icons/app-face-512.png',
  'icons/app-face-mask-512.png',
  'icons/app-moon-180.png',
  'icons/app-moon-192.png',
  'icons/app-moon-512.png',
  'icons/app-moon-mask-512.png',
  'icons/app-night-180.png',
  'icons/app-night-192.png',
  'icons/app-night-512.png',
  'icons/app-night-mask-512.png',
  'icons/app-peek-180.png',
  'icons/app-peek-192.png',
  'icons/app-peek-512.png',
  'icons/app-peek-mask-512.png',
  'icons/app-sunny-180.png',
  'icons/app-sunny-192.png',
  'icons/app-sunny-512.png',
  'icons/app-sunny-mask-512.png',
  'icons/app-talk-180.png',
  'icons/app-talk-192.png',
  'icons/app-talk-512.png',
  'icons/app-talk-mask-512.png',
  'icons/app-wave-180.png',
  'icons/app-wave-192.png',
  'icons/app-wave-512.png',
  'icons/app-wave-mask-512.png',
  'icons/app-wonder-180.png',
  'icons/app-wonder-192.png',
  'icons/app-wonder-512.png',
  'icons/app-wonder-mask-512.png',
  'icons/app-word-180.png',
  'icons/app-word-192.png',
  'icons/app-word-512.png',
  'icons/app-word-mask-512.png',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('lumi-') && k !== VERSION && k !== 'lumi-fonts').map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // the saved copy first, then refresh it in the background
    e.respondWith(caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || fresh;
    }));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // the Nunito font: keep a copy once it has loaded
    e.respondWith(caches.open('lumi-fonts').then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      cache.put(req, res.clone());
      return res;
    }).catch(() => fetch(req)));
  }
  // everything else (live bus times) goes straight to the network
});
