/*
  lang.js
  Mother tongue support: Chinese (华文), Malay (Bahasa Melayu) and Tamil (தமிழ்).
  Many Singapore families speak another language at home, and grandparents or helpers may not read
  English. When a grown-up picks a home language (Grown-ups › Sensory › Home language):
  - the talk board, feelings and My day show the home-language word under the English word
  - Lumi can speak English, the home language, or both (English first, then the home language)
  - grown-ups can change any word (for example 奶奶 to 婆婆) and give their own photo words a translation
  The tablet must have a voice for the language. If it does not, the words still show and Lumi speaks
  English; the settings say so and explain how to add a voice.
  Translations are kept short and child-friendly. Please ask a native speaker to check them before a
  real release (especially Tamil).
*/
(function () {
  'use strict';
  const A = window.LumiApp;
  const { S, state, ic, esc, save, render } = A;

  const LANGS = {
    zh: { name: 'Chinese', native: '华文', voiceLang: 'zh-CN', prefer: ['zh-cn', 'zh-sg', 'cmn', 'zh'], avoid: ['zh-hk', 'yue'], join: '', test: '你好！我是Lumi。' },
    ms: { name: 'Malay', native: 'Bahasa Melayu', voiceLang: 'ms-MY', prefer: ['ms-my', 'ms-sg', 'ms'], avoid: [], join: ' ', test: 'Helo! Saya Lumi.' },
    ta: { name: 'Tamil', native: 'தமிழ்', voiceLang: 'ta-IN', prefer: ['ta-sg', 'ta-in', 'ta'], avoid: [], join: ' ', test: 'வணக்கம்! நான் லூமி.' }
  };

  // [English, Chinese, Malay, Tamil]. English is matched without capitals or end punctuation.
  const ROWS = [
    // talk board: core words
    ['I', '我', 'saya', 'நான்'], ['want', '要', 'mahu', 'வேண்டும்'], ['more', '更多', 'lagi', 'இன்னும்'],
    ['help', '帮忙', 'tolong', 'உதவி'], ['stop', '停', 'berhenti', 'நிறுத்து'], ['all done', '做完了', 'sudah siap', 'முடிந்தது'],
    ['yes', '是', 'ya', 'ஆம்'], ['no', '不', 'tidak', 'இல்லை'], ['go', '去', 'pergi', 'போ'], ['eat', '吃', 'makan', 'சாப்பிடு'],
    ['I feel', '我觉得', 'saya rasa', 'நான் உணர்கிறேன்'], ["What's next?", '接下来做什么？', 'Apa seterusnya?', 'அடுத்தது என்ன?'],
    ['you', '你', 'awak', 'நீ'], ['like', '喜欢', 'suka', 'பிடிக்கும்'], ['play', '玩', 'main', 'விளையாடு'], ['drink', '喝', 'minum', 'குடி'],
    ['break', '休息', 'rehat', 'இடைவேளை'], ['wait', '等', 'tunggu', 'காத்திரு'], ['where?', '哪里？', 'Di mana?', 'எங்கே?'],
    ['when?', '什么时候？', 'Bila?', 'எப்போது?'], ['different', '不一样', 'lain', 'வேறு'], ['please', '请', 'sila', 'தயவுசெய்து'],
    ['thank you', '谢谢', 'terima kasih', 'நன்றி'], ["don't", '不要', 'jangan', 'வேண்டாம்'], ['look', '看', 'tengok', 'பார்'],
    ['open', '打开', 'buka', 'திற'], ['come', '来', 'mari', 'வா'], ['sleep', '睡觉', 'tidur', 'தூங்கு'], ['toilet', '厕所', 'tandas', 'கழிப்பறை'],
    ['hurt', '痛', 'sakit', 'வலிக்கிறது'], ['big', '大', 'besar', 'பெரிய'], ['little', '小', 'kecil', 'சிறிய'], ['hot', '热', 'panas', 'சூடு'],
    ['cold', '冷', 'sejuk', 'குளிர்'], ['what?', '什么？', 'Apa?', 'என்ன?'],
    // feelings
    ['happy', '开心', 'gembira', 'மகிழ்ச்சி'], ['sad', '难过', 'sedih', 'சோகம்'], ['angry', '生气', 'marah', 'கோபம்'],
    ['worried', '担心', 'risau', 'கவலை'], ['scared', '害怕', 'takut', 'பயம்'], ['tired', '累', 'penat', 'சோர்வு'],
    ['excited', '兴奋', 'teruja', 'உற்சாகம்'], ['calm', '平静', 'tenang', 'அமைதி'], ['sick', '不舒服', 'tidak sihat', 'உடம்பு சரியில்லை'],
    ['bored', '无聊', 'bosan', 'சலிப்பு'], ['loved', '被爱', 'disayangi', 'அன்பு'],
    // phrases
    ['I need help', '我需要帮忙', 'Saya perlukan bantuan', 'எனக்கு உதவி வேண்டும்'], ['I want a break', '我要休息', 'Saya mahu rehat', 'எனக்கு ஓய்வு வேண்டும்'],
    ["I don't like that", '我不喜欢那个', 'Saya tidak suka itu', 'எனக்கு அது பிடிக்கவில்லை'], ["I'm all done", '我做完了', 'Saya sudah siap', 'நான் முடித்துவிட்டேன்'],
    ['Can I have a turn?', '可以轮到我吗？', 'Boleh giliran saya?', 'எனக்கு ஒரு வாய்ப்பு தருவீர்களா?'], ['Please stop', '请停下来', 'Tolong berhenti', 'தயவுசெய்து நிறுத்துங்கள்'],
    ['I need the toilet', '我要上厕所', 'Saya mahu ke tandas', 'நான் கழிப்பறைக்குப் போக வேண்டும்'], ['It is too loud', '太吵了', 'Bising sangat', 'மிகவும் சத்தமாக இருக்கிறது'],
    ["I'm hungry", '我饿了', 'Saya lapar', 'எனக்குப் பசிக்கிறது'], ["I'm thirsty", '我渴了', 'Saya dahaga', 'எனக்குத் தாகமாக இருக்கிறது'],
    ['Something hurts', '我有地方痛', 'Ada yang sakit', 'எனக்கு எங்கோ வலிக்கிறது'], ['Hello!', '你好！', 'Helo!', 'வணக்கம்!'],
    // food
    ['apple', '苹果', 'epal', 'ஆப்பிள்'], ['banana', '香蕉', 'pisang', 'வாழைப்பழம்'], ['bread', '面包', 'roti', 'ரொட்டி'], ['rice', '饭', 'nasi', 'சாதம்'],
    ['noodles', '面', 'mi', 'நூடுல்ஸ்'], ['chicken', '鸡肉', 'ayam', 'கோழி'], ['egg', '蛋', 'telur', 'முட்டை'], ['biscuit', '饼干', 'biskut', 'பிஸ்கட்'],
    ['ice cream', '冰淇淋', 'aiskrim', 'ஐஸ்கிரீம்'], ['water', '水', 'air', 'தண்ணீர்'], ['milk', '牛奶', 'susu', 'பால்'], ['juice', '果汁', 'jus', 'பழச்சாறு'],
    // play
    ['ball', '球', 'bola', 'பந்து'], ['blocks', '积木', 'blok', 'கட்டைகள்'], ['puzzle', '拼图', 'teka-teki', 'புதிர்'], ['tablet', '平板电脑', 'tablet', 'டேப்லெட்'],
    ['music', '音乐', 'muzik', 'இசை'], ['book', '书', 'buku', 'புத்தகம்'], ['drawing', '画画', 'melukis', 'வரைதல்'], ['bubbles', '泡泡', 'gelembung', 'குமிழிகள்'],
    ['teddy', '泰迪熊', 'patung beruang', 'கரடி பொம்மை'], ['swing', '秋千', 'buaian', 'ஊஞ்சல்'], ['car', '车', 'kereta', 'கார்'], ['TV', '电视', 'TV', 'டிவி'],
    // places
    ['home', '家', 'rumah', 'வீடு'], ['school', '学校', 'sekolah', 'பள்ளி'], ['park', '公园', 'taman', 'பூங்கா'], ['shop', '商店', 'kedai', 'கடை'],
    ['beach', '海边', 'pantai', 'கடற்கரை'], ['bus', '巴士', 'bas', 'பேருந்து'], ['doctor', '医生', 'doktor', 'மருத்துவர்'], ['pool', '游泳池', 'kolam renang', 'நீச்சல் குளம்'],
    ['bedroom', '房间', 'bilik tidur', 'படுக்கையறை'], ['outside', '外面', 'luar', 'வெளியே'],
    // people
    ['me', '我', 'saya', 'நான்'], ['Mum', '妈妈', 'ibu', 'அம்மா'], ['Dad', '爸爸', 'ayah', 'அப்பா'], ['teacher', '老师', 'cikgu', 'ஆசிரியர்'],
    ['friend', '朋友', 'kawan', 'நண்பர்'], ['Grandma', '奶奶', 'nenek', 'பாட்டி'], ['Grandpa', '爷爷', 'datuk', 'தாத்தா'], ['brother', '哥哥', 'abang', 'அண்ணன்'],
    ['sister', '姐姐', 'kakak', 'அக்கா'], ['baby', '宝宝', 'bayi', 'குழந்தை'], ['helper', '阿姨', 'pembantu', 'உதவியாளர்'], ['everyone', '大家', 'semua orang', 'எல்லோரும்'],
    // out and about (Teens)
    ['Excuse me', '不好意思', 'Maafkan saya', 'மன்னிக்கவும்'], ['Can you say that again?', '可以再说一次吗？', 'Boleh ulang sekali lagi?', 'மீண்டும் சொல்ல முடியுமா?'],
    ['Please speak slowly', '请说慢一点', 'Tolong cakap perlahan-lahan', 'தயவுசெய்து மெதுவாகப் பேசுங்கள்'],
    ["Please wait, I'm typing", '请等一下，我在打字', 'Tolong tunggu, saya sedang menaip', 'தயவுசெய்து காத்திருங்கள், நான் தட்டச்சு செய்கிறேன்'],
    ['I use this app to talk', '我用这个应用程序说话', 'Saya guna aplikasi ini untuk bercakap', 'நான் பேச இந்தச் செயலியைப் பயன்படுத்துகிறேன்'],
    ["I don't understand", '我不明白', 'Saya tidak faham', 'எனக்குப் புரியவில்லை'], ['How much is it?', '多少钱？', 'Berapa harganya?', 'இது எவ்வளவு?'],
    ['Can I pay by card?', '可以用卡付款吗？', 'Boleh bayar dengan kad?', 'கார்டில் பணம் செலுத்தலாமா?'], ['Where is the toilet?', '厕所在哪里？', 'Di mana tandas?', 'கழிப்பறை எங்கே?'],
    ['I am lost. Please help me.', '我迷路了。请帮帮我。', 'Saya sesat. Tolong bantu saya.', 'நான் வழி தவறிவிட்டேன். தயவுசெய்து உதவுங்கள்.'],
    ['Please call my family', '请打电话给我的家人', 'Tolong telefon keluarga saya', 'தயவுசெய்து என் குடும்பத்தை அழையுங்கள்'],
    ['I feel overwhelmed', '我觉得受不了了', 'Saya rasa terbeban', 'எனக்கு மிகவும் அழுத்தமாக இருக்கிறது'],
    ['I need somewhere quiet', '我需要一个安静的地方', 'Saya perlukan tempat yang senyap', 'எனக்கு அமைதியான இடம் வேண்டும்'],
    // talk board folders
    ['Core', '常用', 'Asas', 'அடிப்படை'], ['Feelings', '感受', 'Perasaan', 'உணர்வுகள்'], ['Phrases', '句子', 'Ayat', 'சொற்றொடர்கள்'],
    ['Out and about', '外出', 'Di luar', 'வெளியே'], ['Food', '食物', 'Makanan', 'உணவு'], ['Places', '地方', 'Tempat', 'இடங்கள்'],
    ['People', '人', 'Orang', 'மக்கள்'], ['My words', '我的词', 'Perkataan saya', 'என் சொற்கள்'], ['Type', '打字', 'Taip', 'தட்டச்சு'],
    // My day steps
    ['Wake up', '起床', 'Bangun', 'எழுந்திரு'], ['Get dressed', '穿衣服', 'Pakai baju', 'உடை அணி'], ['Teeth', '刷牙', 'Gosok gigi', 'பல் துலக்கு'],
    ['Breakfast', '早餐', 'Sarapan', 'காலை உணவு'], ['Lunch', '午餐', 'Makan tengah hari', 'மதிய உணவு'], ['Homework', '功课', 'Kerja rumah', 'வீட்டுப்பாடம்'],
    ['Therapy', '治疗', 'Terapi', 'சிகிச்சை'], ['Train', '地铁', 'Kereta api', 'ரயில்'], ['Tablet time', '平板时间', 'Masa tablet', 'டேப்லெட் நேரம்'],
    ['Dinner', '晚餐', 'Makan malam', 'இரவு உணவு'], ['Reading', '阅读', 'Membaca', 'வாசிப்பு'], ['Bath', '洗澡', 'Mandi', 'குளியல்'],
    ['Bedtime', '睡觉时间', 'Waktu tidur', 'தூங்கும் நேரம்'], ['Dentist', '牙医', 'Doktor gigi', 'பல் மருத்துவர்'], ['Haircut', '剪头发', 'Potong rambut', 'முடி வெட்டுதல்'],
    ['Nap', '午睡', 'Tidur siang', 'குட்டித் தூக்கம்'], ['Shower', '冲凉', 'Mandi', 'குளியல்'], ['Laundry', '洗衣服', 'Basuh baju', 'துணி துவைத்தல்'],
    ['Tidy my room', '整理房间', 'Kemas bilik', 'அறையைச் சுத்தம் செய்'], ['Help make dinner', '帮忙煮晚餐', 'Tolong masak makan malam', 'இரவு உணவு சமைக்க உதவு'],
    ['Hawker centre', '小贩中心', 'Pusat penjaja', 'உணவங்காடி நிலையம்'], ['Pack for tomorrow', '准备明天的东西', 'Kemas barang untuk esok', 'நாளைக்குத் தயார் செய்'],
    ['Work training', '工作训练', 'Latihan kerja', 'வேலைப் பயிற்சி'],
    // what Lumi says at each step
    ['Good morning! Time to wake up.', '早安！起床了。', 'Selamat pagi! Masa untuk bangun.', 'காலை வணக்கம்! எழுந்திருக்கும் நேரம்.'],
    ["Let's get dressed.", '我们来穿衣服。', 'Jom pakai baju.', 'உடை அணிவோம்.'],
    ['Brush, brush, brush your teeth.', '刷刷刷，刷牙齿。', 'Gosok, gosok, gosok gigi.', 'பல் துலக்கு, துலக்கு, துலக்கு.'],
    ['Yummy. Breakfast time.', '好吃！吃早餐了。', 'Sedapnya. Masa sarapan.', 'சுவையானது. காலை உணவு நேரம்.'],
    ['Time to take the bus.', '要搭巴士了。', 'Masa untuk naik bas.', 'பேருந்தில் போகும் நேரம்.'],
    ["Let's go to school.", '我们去上学。', 'Jom pergi sekolah.', 'பள்ளிக்குப் போவோம்.'],
    ['Lunch time.', '吃午餐了。', 'Masa makan tengah hari.', 'மதிய உணவு நேரம்.'],
    ['Homework time.', '做功课了。', 'Masa buat kerja rumah.', 'வீட்டுப்பாட நேரம்.'],
    ['Time to see my therapist.', '要去见治疗师了。', 'Masa jumpa ahli terapi.', 'சிகிச்சையாளரைப் பார்க்கும் நேரம்.'],
    ['We are taking the train.', '我们要搭地铁。', 'Kita naik kereta api.', 'நாம் ரயிலில் போகிறோம்.'],
    ["Let's go to the park.", '我们去公园。', 'Jom pergi taman.', 'பூங்காவுக்குப் போவோம்.'],
    ['Play time!', '玩的时间到了！', 'Masa bermain!', 'விளையாட்டு நேரம்!'],
    ['Dinner time.', '吃晚餐了。', 'Masa makan malam.', 'இரவு உணவு நேரம்.'],
    ['Story time.', '讲故事时间。', 'Masa bercerita.', 'கதை நேரம்.'],
    ['Splash! Bath time.', '哗啦！洗澡了。', 'Percik! Masa mandi.', 'சளப்! குளியல் நேரம்.'],
    ['Time for bed.', '该睡觉了。', 'Masa untuk tidur.', 'தூங்கும் நேரம்.'],
    ['Today we visit the dentist.', '今天我们去看牙医。', 'Hari ini kita jumpa doktor gigi.', 'இன்று நாம் பல் மருத்துவரைப் பார்க்கப் போகிறோம்.'],
    ['Today we get a haircut.', '今天我们去剪头发。', 'Hari ini kita potong rambut.', 'இன்று நாம் முடி வெட்டப் போகிறோம்.'],
    ['Toilet time. Then wash your hands.', '上厕所，然后洗手。', 'Masa ke tandas. Lepas itu basuh tangan.', 'கழிப்பறை நேரம். பிறகு கைகளைக் கழுவு.'],
    ["Quiet time. Let's rest.", '安静时间，我们休息吧。', 'Masa senyap. Jom berehat.', 'அமைதியான நேரம். ஓய்வெடுப்போம்.'],
    ['Time for a shower.', '该冲凉了。', 'Masa untuk mandi.', 'குளிக்கும் நேரம்.'],
    ['Time to do the laundry.', '该洗衣服了。', 'Masa untuk basuh baju.', 'துணி துவைக்கும் நேரம்.'],
    ['Time to tidy up.', '该收拾了。', 'Masa untuk mengemas.', 'சுத்தம் செய்யும் நேரம்.'],
    ["Let's cook together.", '我们一起煮饭吧。', 'Jom masak bersama.', 'சேர்ந்து சமைப்போம்.'],
    ['Lunch at the hawker centre.', '在小贩中心吃午餐。', 'Makan tengah hari di pusat penjaja.', 'உணவங்காடி நிலையத்தில் மதிய உணவு.'],
    ['Get ready for tomorrow.', '为明天做准备。', 'Bersedia untuk esok.', 'நாளைக்குத் தயாராகு.'],
    ['Time for work training.', '工作训练时间。', 'Masa latihan kerja.', 'வேலைப் பயிற்சி நேரம்.'],
    // a few things Lumi often says
    ['How do you feel?', '你觉得怎么样？', 'Apa perasaan awak?', 'நீ எப்படி உணர்கிறாய்?'],
    ['Tap the pictures to talk.', '点图片来说话。', 'Tekan gambar untuk bercakap.', 'பேச படங்களைத் தொடு.'],
    ['Breathe slowly with me.', '跟我慢慢呼吸。', 'Bernafas perlahan-lahan dengan saya.', 'என்னுடன் மெதுவாக மூச்சு விடு.'],
    ['Well done!', '做得好！', 'Syabas!', 'நன்றாகச் செய்தாய்!'], ['Great job!', '很棒！', 'Bagus!', 'அருமை!']
  ];
  const norm = (t) => String(t || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().replace(/[.!?。！？]+$/, '').trim();
  const DICT = { zh: {}, ms: {}, ta: {} };
  const ORDER = []; // the English words in order (for the grown-ups' edit list)
  ROWS.forEach(([en, zh, ms, ta]) => {
    const k = norm(en);
    if (!(k in DICT.zh)) ORDER.push(en);
    DICT.zh[k] = zh; DICT.ms[k] = ms; DICT.ta[k] = ta;
  });

  // ---------------------------------------------------------------- settings
  const lang = () => (LANGS[state.settings.lang2] ? state.settings.lang2 : '');
  const showOn = () => !!lang() && state.settings.lang2Show !== false;
  const voiceMode = () => (lang() ? state.settings.lang2Voice || 'both' : 'en'); // 'en' | 'l2' | 'both'
  const edits = () => { if (!state.lang2Edits) state.lang2Edits = {}; const l = lang(); if (l && !state.lang2Edits[l]) state.lang2Edits[l] = {}; return l ? state.lang2Edits[l] : {}; };

  // the home-language version of an English word or line ('' if there is none)
  function tr(text, word) {
    const l = lang();
    if (!l || !text) return '';
    if (word && word.l2 && word.l2[l]) return word.l2[l];
    const k = norm(text);
    const e = edits()[k];
    if (e) return e;
    if (DICT[l][k]) return DICT[l][k];
    const mine = (state.myWords || []).find((w) => norm(w.label) === k && w.l2 && w.l2[l]);
    return mine ? mine.l2[l] : '';
  }
  // a small second line under a label
  function l2Html(text, word) {
    if (!showOn()) return '';
    const t = tr(text, word);
    return t ? `<span class="l2" lang="${LANGS[lang()].voiceLang}">${esc(t)}</span>` : '';
  }

  // ---------------------------------------------------------------- speaking
  const voiceCache = {};
  function voiceFor(l) {
    if (voiceCache[l] !== undefined) return voiceCache[l];
    try {
      const L2 = LANGS[l];
      const all = window.speechSynthesis.getVoices();
      const tag = (v) => String(v.lang || '').toLowerCase().replace('_', '-');
      let best = null;
      for (const p of L2.prefer) {
        best = all.find((v) => tag(v).startsWith(p) && !L2.avoid.some((x) => tag(v).startsWith(x)));
        if (best) break;
      }
      if (all.length) voiceCache[l] = best || null;
      return best || null;
    } catch (e) { return null; }
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.addEventListener('voiceschanged', () => { Object.keys(voiceCache).forEach((k) => delete voiceCache[k]); }); } catch (e) { /* not supported */ }
  }
  function speakL2(text, cancelFirst) {
    const l = lang();
    const v = voiceFor(l);
    if (!v || !text) return false;
    try {
      if (cancelFirst) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v;
      u.lang = v.lang;
      u.rate = Math.min(1.1, (state.settings.voiceRate || 0.85) * 0.95);
      u.volume = 0.95;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }
  // speak an English line and/or its home-language version, following the grown-up's choice
  function speakPair(en, l2) {
    const mode = voiceMode();
    if (mode === 'en' || !l2 || !voiceFor(lang())) return false;
    if (mode === 'l2') return speakL2(l2, true);
    A.tts(en); // English first...
    speakL2(l2, false); // ...then the home language
    return true;
  }
  // called from say() in app.js: true when this line was spoken here
  A.langSay = (text) => {
    if (voiceMode() === 'en') return false;
    return speakPair(text, tr(text));
  };
  // the talk board's message: translate word by word
  A.sayTalk = (words) => {
    const en = words.map((w) => w.label).join(' ');
    if (voiceMode() === 'en') { A.say(en); return; }
    if (!state.settings.voice || S.mute) return;
    const l = lang();
    const l2 = words.map((w) => tr(w.label, w) || w.label).join(LANGS[l].join);
    if (!speakPair(en, l2)) A.say(en);
  };
  A.tr = tr;
  A.l2Html = l2Html;
  A.LANGS = LANGS;

  // ---------------------------------------------------------------- grown-ups: Sensory › Home language
  A.langSettingsHtml = () => {
    const st = state.settings;
    const l = lang();
    const opts = [['', 'English only']].concat(Object.keys(LANGS).map((k) => [k, `${LANGS[k].name} · ${LANGS[k].native}`]));
    const seg = (items, cur, action) => `<div class="seg" role="group">${items.map(([v, label]) => `<button class="seg-opt ${String(cur) === String(v) ? 'on' : ''}" data-a="${action}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${esc(label)}</button>`).join('')}</div>`;
    let more = '';
    if (l) {
      const has = !!voiceFor(l);
      more = `<button class="check-row" data-a="langShow" aria-pressed="${showOn()}"><span class="box ${showOn() ? 'on' : ''}">${showOn() ? ic('check', 14) : ''}</span><span>Show ${LANGS[l].name} words under the English words (talk board, feelings, My day)</span></button>
        <div class="g-field"><span>Lumi speaks</span>${seg([['en', 'English'], ['l2', LANGS[l].name], ['both', 'Both (English, then ' + LANGS[l].name + ')']], voiceMode(), 'langVoice')}</div>
        <div class="row gap8 wrap"><button class="g-btn small outline" data-a="langTest">${ic('speaker', 16)}<span>Test the ${LANGS[l].name} voice</span></button>
          <button class="g-btn small outline" data-a="nav" data-to="cgLang">${ic('pencil', 16)}<span>Change words (for example family names)</span></button></div>
        <p class="g-note lang-voice ${has ? 'ok' : 'bad'}">${has
          ? `${ic('check', 14)} This tablet has a ${LANGS[l].name} voice.`
          : `This tablet has no ${LANGS[l].name} voice yet, so Lumi will speak English and the ${LANGS[l].name} words will still show. To add one on an iPad: Settings › Accessibility › Spoken Content › Voices. On Android: Settings › Text-to-speech › install voice data.`}</p>`;
    }
    return `<h2 class="g-h top-gap">Home language</h2>
      <p class="g-note">For families who speak another language at home. Grandparents and helpers can read the words too.</p>
      <div class="g-field"><span>Second language</span>${seg(opts, l, 'langPick')}</div>${more}`;
  };

  // Grown-ups › Sensory › Change words
  A.PARENT.cgLang = 'cgSensory';
  A.VOICE.cgLang = () => '';
  A.SCREENS.cgLang = () => {
    const l = lang();
    if (!l) return `<section class="screen grownup">${A.gHeader('cgSensory')}<div class="g-panel grow"><p class="g-note">Choose a home language first.</p><button class="g-btn" data-a="nav" data-to="cgSensory">Back</button></div></section>`;
    const ed = edits();
    const rows = ORDER.map((en) => {
      const k = norm(en);
      const val = ed[k] || DICT[l][k] || '';
      return `<label class="lang-row ${ed[k] ? 'changed' : ''}"><span class="lang-en">${esc(en)}</span><input class="g-input" type="text" lang="${LANGS[l].voiceLang}" data-input="l2:${esc(k)}" value="${esc(val)}" maxlength="60"></label>`;
    }).join('');
    return `
<section class="screen grownup" aria-label="Change ${LANGS[l].name} words">
  ${A.gHeader('cgSensory')}
  <div class="g-panel grow scroll">
    <div class="row between"><h2 class="g-h">${esc(LANGS[l].name)} words <span class="g-note">(${LANGS[l].native})</span></h2>
      <div class="row gap8"><button class="g-btn small outline" data-a="langReset">${ic('restart', 16)}<span>Undo my changes</span></button><button class="g-btn small" data-a="nav" data-to="cgSensory">${ic('check', 16)}<span>Done</span></button></div></div>
    <p class="g-note">Change any word to the one your family uses, for example 奶奶 or 婆婆 for Grandma. Changes save as you type. Your own photo words get their translation in Activities › Talk-board words.</p>
    <div class="lang-list">${rows}</div>
  </div>
</section>`;
  };

  const prevInput = A.onInput;
  A.onInput = (key, v, el) => {
    if (prevInput) prevInput(key, v, el);
    if (key.startsWith('l2:')) {
      const k = key.slice(3);
      const l = lang();
      if (!l) return;
      const t = v.trim();
      if (!t || t === DICT[l][k]) delete edits()[k]; else edits()[k] = t;
      if (el && el.closest('.lang-row')) el.closest('.lang-row').classList.toggle('changed', !!edits()[k]);
    }
    if (key === 'wordL2') S.newWordL2 = v;
  };

  Object.assign(A.ACTIONS, {
    langPick: (d) => { state.settings.lang2 = d.v; if (d.v && !state.settings.lang2Voice) state.settings.lang2Voice = 'both'; save(); render(); },
    langShow: () => { state.settings.lang2Show = !showOn(); save(); render(); },
    langVoice: (d) => { state.settings.lang2Voice = d.v; save(); render(); },
    langTest: () => {
      const l = lang();
      if (!l) return;
      if (!speakL2(LANGS[l].test, true)) A.tts("This tablet doesn't have that voice yet.");
    },
    langReset: () => { const l = lang(); if (l && state.lang2Edits) state.lang2Edits[l] = {}; save(); render(); }
  });
})();
