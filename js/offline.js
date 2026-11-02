/*
  offline.js
  1. Use Lumi without internet. With manifest.webmanifest and sw.js, Lumi can be added to the tablet's home
     screen, opens full-screen like an app and keeps working with no Wi-Fi (on the MRT, at the clinic, on
     holiday). This needs Lumi to be opened from a web address (for example GitHub Pages), not as a file.
  2. Backup. Everything Lumi keeps (progress, timetable, words, stories, settings and photos) is saved on
     this tablet only. Grown-ups can save it all to one file and restore it here or on another tablet.
  Both live in Grown-ups › Child › "Backup and offline".
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { S, state, ic, esc, save, render, go } = A;

  // ---------------------------------------------------------------- the offline helper (service worker)
  const framed = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const canOffline = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !framed;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installed = () => { try { return window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { return false; } };
  let installEvt = null;
  S.offlineReady = false;
  const refresh = () => { if (S.screen === 'cgChild') render(); };
  if (canOffline) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(() => { S.offlineReady = true; refresh(); }).catch(() => { /* offline mode not available here */ });
    });
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; refresh(); });
    window.addEventListener('appinstalled', () => { installEvt = null; refresh(); });
  }

  // ---------------------------------------------------------------- backup
  const ago = (t) => {
    if (!t) return 'never';
    const days = Math.floor((Date.now() - t) / 864e5);
    return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
  };
  async function saveBackup() {
    const when = new Date();
    const file = { app: 'lumi', kind: 'backup', version: 1, saved: when.toISOString(), child: state.childName || '', state };
    const data = JSON.stringify(file);
    const filename = `lumi-backup${state.childName ? '-' + state.childName.replace(/[^\w-]+/g, '') : ''}-${A.dateKey(when)}.json`;
    let done = false;
    // inside claude.ai the page asks the viewer to save the file
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        const dl = await window.claude.use('downloads');
        if (dl) { await dl.save({ filename, data }); done = true; }
      } catch (e) {
        if (e && e.code === 'declined') { S.backupMsg = { ok: false, text: 'Backup not saved.' }; render(); return; }
      }
    }
    if (!done) {
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    state.lastBackup = Date.now();
    save();
    S.backupMsg = { ok: true, text: `Saved ${filename}. Keep it somewhere safe, like your email or cloud drive.` };
    render();
  }
  function readBackup(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const f = JSON.parse(fr.result);
        if (!f || f.app !== 'lumi' || !f.state || typeof f.state !== 'object' || !f.state.profile) throw new Error('not a Lumi backup');
        S.restore = { state: f.state, saved: f.saved, child: f.child || f.state.childName || '' };
        S.backupMsg = null;
      } catch (e) {
        S.restore = null;
        S.backupMsg = { ok: false, text: "That file isn't a Lumi backup. Choose a file called lumi-backup-….json." };
      }
      render();
    };
    fr.readAsText(file);
  }
  function restore() {
    const saved = S.restore && S.restore.state;
    if (!saved) return;
    // rebuild from fresh defaults, exactly as when Lumi starts, keeping the same state object
    const base = A.defaults();
    Object.keys(base).forEach((k) => {
      if (saved[k] === undefined) return;
      const isObj = base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]);
      base[k] = isObj ? Object.assign(base[k], saved[k]) : saved[k];
    });
    Object.keys(saved).forEach((k) => { if (!(k in base)) base[k] = saved[k]; });
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, base);
    S.restore = null;
    S.day = null;
    S.backupMsg = null;
    save();
    A.applyPrefs();
    go('menu', 'Backup restored.');
  }

  // ---------------------------------------------------------------- Grown-ups › Child: "Backup and offline"
  A.offlineHtml = () => {
    let off;
    if (installed()) off = `<p class="g-note ok-line">${ic('check', 16)} Lumi is on this tablet's home screen and works without internet.</p>`;
    else if (canOffline && S.offlineReady) {
      off = `<p class="g-note ok-line">${ic('check', 16)} Ready to work without internet.</p>
        ${installEvt ? `<button class="g-btn small" data-a="offInstall">${ic('upload', 16)}<span>Add Lumi to the home screen</span></button>`
          : `<p class="g-note">${ios ? 'On an iPad: open Lumi in Safari, tap Share, then "Add to Home Screen".' : 'Add it to the home screen from the browser menu ("Install app" or "Add to Home screen"). It then opens full-screen.'}</p>`}`;
    } else if (canOffline) off = '<p class="g-note">Getting Lumi ready to work without internet…</p>';
    else off = `<p class="g-note">To use Lumi without internet and add it to the home screen, open Lumi from its own web address (for example a free GitHub Pages site), then add it to the home screen.</p>`;
    const stale = !state.lastBackup || Date.now() - state.lastBackup > 30 * 864e5;
    const r = S.restore;
    const restoreCard = r ? `<div class="restore-card">
        <b>Restore this backup?</b>
        <span>${r.child ? esc(r.child) + ', s' : 'S'}aved ${r.saved ? esc(new Date(r.saved).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })) : 'earlier'}.</span>
        <span class="g-note">This replaces everything on this tablet: progress, timetable, words, stories, settings and photos.</span>
        <div class="row gap8"><button class="g-btn small danger" data-a="offRestore">${ic('restart', 16)}<span>Restore</span></button><button class="g-btn small outline" data-a="offCancel">Cancel</button></div>
      </div>` : '';
    const msg = S.backupMsg ? `<p class="g-note backup-msg ${S.backupMsg.ok ? 'ok' : 'bad'}">${esc(S.backupMsg.text)}</p>` : '';
    return `<h2 class="g-h top-gap">Backup and offline</h2>
      ${off}
      <p class="g-note ${stale ? 'warn-line' : ''}">Last backup: <b>${ago(state.lastBackup)}</b>.${stale ? ' Everything is saved on this tablet only, so a backup keeps it safe if the tablet is reset or lost.' : ''}</p>
      <div class="row gap8 wrap"><button class="g-btn small" data-a="offBackup">${ic('upload', 16)}<span>Save a backup</span></button>
        <label class="g-btn small outline file-btn">${ic('restart', 16)}<span>Restore from a backup</span><input type="file" accept=".json,application/json" data-file="backup"></label></div>
      ${msg}${restoreCard}
      <p class="g-note">The backup file has your child's progress, timetable, words, stories and photos. Your own voice recordings and music are not included.</p>`;
  };

  const prevFile = A.onFile;
  A.onFile = (name, file, el) => {
    if (name === 'backup') { readBackup(file); if (el) el.value = ''; return; }
    if (prevFile) prevFile(name, file, el);
  };
  Object.assign(A.ACTIONS, {
    offBackup: () => { saveBackup(); },
    offRestore: () => restore(),
    offCancel: () => { S.restore = null; render(); },
    offInstall: () => {
      if (!installEvt) return;
      installEvt.prompt();
      installEvt.userChoice.finally(() => { installEvt = null; refresh(); });
    }
  });
})();
