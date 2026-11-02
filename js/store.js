/*
  store.js
  What app stores ask of an app for children:
  - A.parentGate(onPass, why): a "grown-ups only" check before anything that turns on an online feature
    or leaves the app. A sum written in words, with four answers; a wrong answer just gives a new sum.
  - Grown-ups › Child › "Privacy": what Lumi keeps, and which online features are on.
  Lumi has no accounts, no ads, no analytics and no tracking. Everything stays on the tablet.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { state, stage, ic, esc, render } = A;
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  const word = (n) => (n <= 20 ? WORDS[n] : n < 30 ? `twenty-${WORDS[n - 20]}` : `thirty${n > 30 ? '-' + WORDS[n - 30] : ''}`);

  const gateEl = document.createElement('div');
  gateEl.id = 'parentGate';
  gateEl.hidden = true;
  gateEl.setAttribute('role', 'dialog');
  gateEl.setAttribute('aria-label', 'For grown-ups');
  stage.appendChild(gateEl);
  let pending = null;
  function ask(why) {
    const a = 6 + Math.floor(Math.random() * 9);
    const b = 7 + Math.floor(Math.random() * 9);
    const right = a + b;
    const opts = new Set([right]);
    while (opts.size < 4) opts.add(right + [-10, -3, -2, -1, 1, 2, 3, 10][Math.floor(Math.random() * 8)]);
    const list = [...opts].sort((x, y) => x - y);
    gateEl.innerHTML = `<div class="pg-card">
      <span class="pg-ic">${ic('kLock', 54)}</span>
      <b class="pg-title">For grown-ups</b>
      ${why ? `<span class="pg-why">${esc(why)}</span>` : ''}
      <span class="pg-q">What is ${word(a)} plus ${word(b)}?</span>
      <div class="pg-opts">${list.map((n) => `<button class="pg-opt" data-a="pgAnswer" data-v="${n}" data-ok="${n === right ? 1 : 0}">${n}</button>`).join('')}</div>
      <button class="g-btn outline" data-a="pgCancel">Cancel</button>
    </div>`;
  }
  A.parentGate = (onPass, why) => {
    pending = onPass;
    ask(why);
    gateEl.hidden = false;
    A.hideHand && A.hideHand();
  };
  Object.assign(A.ACTIONS, {
    pgAnswer: (d, el) => {
      if (el && el.dataset.ok === '1') {
        gateEl.hidden = true;
        const fn = pending;
        pending = null;
        if (fn) fn();
        return 'keep';
      }
      ask(gateEl.querySelector('.pg-why') ? gateEl.querySelector('.pg-why').textContent : '');
      return 'keep';
    },
    pgCancel: () => { gateEl.hidden = true; pending = null; return 'keep'; }
  });

  // ---------------------------------------------------------------- Grown-ups › Child › Privacy
  A.privacyHtml = () => {
    const st = state.settings;
    const bus = state.bus && state.bus.proxy;
    const row = (on, name, text) => `<li class="pv-row"><span class="tag ${on ? '' : 'green'}">${on ? 'On' : 'Off'}</span><span><b>${esc(name)}</b> ${esc(text)}</span></li>`;
    return `<h2 class="g-h top-gap">Privacy</h2>
      <p class="g-note">Lumi has no accounts, no ads, no analytics and no tracking. Everything (names, photos, recordings, timetables, progress) stays on this tablet. Backups are files you save yourself. Removing Lumi from the tablet deletes it all.</p>
      <ul class="pv-list">
        ${row(st.chatMic === true, 'Microphone in Chat:', 'only when you turn it on. The tablet\'s speech service may send the sound to Apple or Google to turn it into words.')}
        ${row(!!bus, 'Live bus times:', 'only if you add a bus relay link. Lumi then asks the relay for arrival times at your stop.')}
      </ul>
      <p class="g-note">Online features are turned on by a grown-up only.</p>`;
  };
})();
