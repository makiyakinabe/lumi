/*
  narrator.js
  "Who reads to me?": the child picks the narrator they like. Lumi, a girl, a boy, a grown-up woman or man,
  Grandma, Grandpa, a teacher, Storyteller Owl, Big Bear, Little Star or a friendly robot. Tapping one
  says hello in that voice and makes it the narrator for everything Lumi says. "How it sounds" (gentle,
  calm and slow, cheerful, slow and clear, quiet) works with any narrator.
  Each narrator uses a different voice from the tablet when the tablet has several (see pickVoice in app.js),
  plus its own pitch and speed, so they really sound different. Grown-ups › Sensory also lists every English
  voice on this tablet, to try them and pick one as the "Tablet voice" narrator.
  Open it from the pause menu, the calm corner (Voice) or Grown-ups › Sensory.
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { D, L, S, state, ic, esc, say, save, render } = A;

  // ---------------------------------------------------------------- pictures for the animal narrators
  const ART = {
    owl: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">
      <defs><radialGradient id="nOwl" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#C79A6B"/><stop offset="1" stop-color="#8A5E3B"/></radialGradient>
      <radialGradient id="nOwlB" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFF3DD"/><stop offset="1" stop-color="#EBD3B0"/></radialGradient></defs>
      <path d="M22 30 L30 12 L40 26 Z M78 30 L70 12 L60 26 Z" fill="#7A5232"/>
      <ellipse cx="50" cy="58" rx="34" ry="38" fill="url(#nOwl)"/>
      <ellipse cx="50" cy="70" rx="20" ry="22" fill="url(#nOwlB)"/>
      <path d="M40 66 q4 3 8 0 M52 72 q4 3 8 0 M42 80 q4 3 8 0" stroke="#D4B48C" stroke-width="2" fill="none"/>
      <circle cx="36" cy="44" r="13" fill="#FFF8EC"/><circle cx="64" cy="44" r="13" fill="#FFF8EC"/>
      <circle cx="37" cy="45" r="6.5" fill="#3B2F2F"/><circle cx="63" cy="45" r="6.5" fill="#3B2F2F"/><circle cx="39" cy="43" r="2" fill="#fff"/><circle cx="65" cy="43" r="2" fill="#fff"/>
      <path d="M46 54 L50 62 L54 54 Z" fill="#F4A259"/>
      <path d="M24 38 C26 30 32 28 38 30 M76 38 C74 30 68 28 62 30" stroke="#3B2F2F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="28" y="38" width="44" height="3" rx="1.5" fill="#6B4A2A" opacity=".0"/></svg>`,
    bear: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">
      <defs><radialGradient id="nBear" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#B98457"/><stop offset="1" stop-color="#7C5233"/></radialGradient></defs>
      <circle cx="24" cy="26" r="13" fill="#7C5233"/><circle cx="76" cy="26" r="13" fill="#7C5233"/><circle cx="24" cy="26" r="6" fill="#E7B98E"/><circle cx="76" cy="26" r="6" fill="#E7B98E"/>
      <circle cx="50" cy="56" r="38" fill="url(#nBear)"/>
      <ellipse cx="50" cy="68" rx="17" ry="13" fill="#F1D2AE"/>
      <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#3B2F2F"/>
      <path d="M44 72 Q50 77 56 72" stroke="#3B2F2F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="48" r="4.5" fill="#3B2F2F"/><circle cx="63" cy="48" r="4.5" fill="#3B2F2F"/><circle cx="38.5" cy="46.5" r="1.5" fill="#fff"/><circle cx="64.5" cy="46.5" r="1.5" fill="#fff"/>
      <circle cx="28" cy="62" r="5" fill="#F09A8A" opacity=".45"/><circle cx="72" cy="62" r="5" fill="#F09A8A" opacity=".45"/></svg>`,
    star: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true">
      <defs><radialGradient id="nStar" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF4B8"/><stop offset="1" stop-color="#F4C430"/></radialGradient></defs>
      <path d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36Z" fill="url(#nStar)" stroke="#E0A92A" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="41" cy="50" r="4" fill="#3B2F2F"/><circle cx="59" cy="50" r="4" fill="#3B2F2F"/><circle cx="42.4" cy="48.6" r="1.3" fill="#fff"/><circle cx="60.4" cy="48.6" r="1.3" fill="#fff"/>
      <path d="M44 60 Q50 65 56 60" stroke="#3B2F2F" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="35" cy="58" r="4" fill="#F59A8A" opacity=".5"/><circle cx="65" cy="58" r="4" fill="#F59A8A" opacity=".5"/></svg>`,
    tablet: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true"><rect x="18" y="12" width="64" height="78" rx="10" fill="#5B6ABF"/><rect x="24" y="18" width="52" height="62" rx="5" fill="#DCE6FA"/><circle cx="50" cy="85" r="2.6" fill="#DCE6FA"/>
      <path d="M38 44 h6 l8 -8 v28 l-8 -8 h-6z" fill="#5B6ABF"/><path d="M58 42 q5 8 0 16 M63 38 q9 12 0 24" stroke="#5B6ABF" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`
  };
  A.narratorArt = (v, size) => (v.art && ART[v.art] ? ART[v.art](size) : null);
  const kidVoices = () => D.VOICES.filter((v) => !v.grownOnly || (v.id === 'tablet' && state.settings.voiceName));
  A.kidVoices = kidVoices;
  const curId = () => (state.settings.voiceId === 'soft' ? 'lumi' : state.settings.voiceId);
  function art(v, size) {
    if (A.narratorArt(v, size)) return A.narratorArt(v, size);
    if (v.id === 'lumi') return L.svg({ look: A.lookWith ? A.lookWith({ spark: 'none' }) : state.look, mood: 'happy', size });
    if (v.person && A.person) return A.person({ who: v.person, crop: 'head', h: size, mood: 'smile' });
    const pic = window.lumiPic && window.lumiPic(v.e, size);
    return pic || ic('smile', size);
  }
  A.narratorPic = art;
  const hello = (v) => {
    const name = state.childName ? v.hello.replace(/^(Hi|Hello|Hey)([,!.]?)/, `$1 ${state.childName}$2`) : v.hello;
    return name;
  };

  // ---------------------------------------------------------------- the child's screen
  A.PARENT.narrator = 'home';
  A.VOICE.narrator = () => 'Who reads to you? Tap a voice to hear it.';
  A.GUIDE.narrator = () => null;
  A.SCREENS.narrator = () => {
    const cur = curId();
    const how = state.settings.voiceStyle || 'gentle';
    const cards = kidVoices().map((v) => `<button class="nar-card ${cur === v.id ? 'on' : ''}" data-a="narPick" data-v="${v.id}" aria-pressed="${cur === v.id}" aria-label="${esc(v.name)}${cur === v.id ? ', chosen' : ''}">
        <span class="nar-art">${art(v, 92)}</span><span class="nar-name">${esc(v.name)}</span>${cur === v.id ? `<span class="nar-tick">${ic('check', 20)}</span>` : ''}</button>`).join('');
    const styles = (D.VOICE_STYLES || []).map((v) => `<button class="nar-style ${how === v.id ? 'on' : ''}" data-a="narStyle" data-v="${v.id}" aria-pressed="${how === v.id}">${ic(v.icon, 26)}<span>${esc(v.name)}</span></button>`).join('');
    return `
<section class="screen nar-screen" aria-label="Who reads to me">
  ${A.srTitle('Who reads to me?')}
  <div class="row gap12" style="height:60px;flex:none">${A.backBtn()}${A.speakBtn(A.VOICE.narrator())}<span class="game-chip" style="background:#EEE8F9;color:#5B45A8">${ic('speaker', 30)}<span>Who reads to me?</span></span><span class="grow"></span></div>
  <div class="nar-grid grow">${cards}</div>
  <div class="nar-bar"><span class="nar-bar-label">${ic('music', 22)}<span>How it sounds</span></span><div class="nar-styles">${styles}</div>
    <button class="primary nar-done" data-a="back">${ic('check', 30)}<span>Done</span></button></div>
</section>`;
  };
  Object.assign(A.ACTIONS, {
    narPick: (d) => {
      const v = D.VOICES.find((x) => x.id === d.v);
      if (!v) return 'keep';
      state.settings.voiceId = v.id;
      save(); render();
      try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
      say(hello(v));
      A.track && A.track('narrator', v.name, { quiet: true });
      return 'keep';
    },
    narStyle: (d) => {
      state.settings.voiceStyle = d.v;
      save(); render();
      const how = D.VOICE_STYLES.find((x) => x.id === d.v);
      say(`This is my ${how.name.toLowerCase()} voice.`);
      return 'keep';
    },
    narOpen: () => {
      if (S.paused && A.ACTIONS.pResume) A.ACTIONS.pResume();
      A.go('narrator');
      return 'keep';
    },
    // grown-ups: try every voice on this tablet, and use one as the "Tablet voice" narrator
    tvTry: (d) => {
      const v = (A.voiceList ? A.voiceList() : []).find((x) => x.name === d.v);
      if (!v) return 'keep';
      try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(`Hello${state.childName ? ' ' + state.childName : ''}. This is how I sound.`); u.voice = v; u.lang = v.lang; u.rate = 0.9; window.speechSynthesis.speak(u); } catch (e) { /* no speech */ }
      return 'keep';
    },
    tvUse: (d) => {
      state.settings.voiceName = d.v;
      state.settings.voiceId = 'tablet';
      if (A.clearVoiceCache) A.clearVoiceCache();
      save(); render();
      say('Hello. I will read to you now.');
      return 'keep';
    },
    tvMore: () => { S.tvAll = !S.tvAll; render(); return 'keep'; }
  });
  A.tabletVoicesHtml = () => {
    const all = A.voiceList ? A.voiceList() : [];
    if (!all.length) return '<p class="g-note">This device has no voices to choose from.</p>';
    const list = S.tvAll ? all : all.slice(0, 6);
    return `<div class="tv-list">${list.map((v) => { const on = state.settings.voiceId === 'tablet' && state.settings.voiceName === v.name; return `<div class="tv-row ${on ? 'on' : ''}"><button class="mini-btn" data-a="tvTry" data-v="${esc(v.name)}" aria-label="Hear ${esc(v.name)}">${ic('speaker', 18)}</button><span class="grow">${esc(v.name.replace(/\s*\(.*\)$/, ''))} <small>${esc(v.lang)}</small></span><button class="g-btn small ${on ? '' : 'outline'}" data-a="tvUse" data-v="${esc(v.name)}">${on ? 'In use' : 'Use'}</button></div>`; }).join('')}</div>
      ${all.length > 6 ? `<button class="g-link" data-a="tvMore">${S.tvAll ? 'Show fewer' : `Show all ${all.length} voices`}</button>` : ''}
      <p class="g-note">${all.length} English voices on this device. More can be added in the device's settings (iPad: Accessibility › Spoken Content › Voices).</p>`;
  };
})();
