(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { screen: 'arrival', step: 0, solved: false, words: [], busy: false };
  const challenges = [
    { title: 'Зажги немного света', emblem: '✧', prompt: 'Путь к билетам скрыт в темноте. Какое заклинание зажжёт свет на кончике палочки?', choices: ['Акцио', 'Люмос', 'Алохомора'], answer: 'Люмос', hint: 'Оно начинается на «Л» и звучит почти как свет.', success: 'Люмос! Уже светлее. Твоя улыбка, впрочем, справилась бы не хуже.', wrong: 'Почти! Это заклинание умеет другое. Попробуй ещё раз.' },
    { title: 'Найди свою платформу', emblem: '9¾', prompt: 'Свет привёл нас на вокзал. С какой платформы отправляется Хогвартс-экспресс?', choices: ['9¼', '9¾', '10½'], answer: '9¾', hint: 'Между девятой и десятой. Девять и ещё три четверти.', success: 'Нужная платформа найдена. До нашего приключения — один шаг.', wrong: 'С этой платформы поезд уедет в другую историю. Поищи номер между 9 и 10.' },
    { title: 'Последнее заклинание', emblem: '✦', prompt: 'Самое важное заклинание состоит всего из трёх слов. Нажми на них в правильном порядке.', hint: 'Начни с «Пойдём», добавь «в» и закончи словом «кино».', success: 'Пойдём в кино! Вот и всё волшебство. Билеты теперь твои.' }
  ];

  function showScreen(name) {
    if (!['arrival', 'letter', 'quest', 'tickets'].includes(name)) throw new Error('Неизвестный этап');
    document.querySelectorAll('.screen').forEach(el => { el.hidden = el.id !== name; el.classList.toggle('active', el.id === name); });
    state.screen = name;
    const phase = name === 'arrival' || name === 'letter' ? 'arrival' : name;
    const order = ['arrival', 'quest', 'tickets'];
    document.querySelectorAll('.journey [data-phase]').forEach(el => {
      el.classList.toggle('current', el.dataset.phase === phase);
      el.classList.toggle('done', order.indexOf(el.dataset.phase) < order.indexOf(phase));
      if (el.dataset.phase === phase) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    const heading = $(name === 'arrival' ? 'arrival-title' : name === 'letter' ? 'letter-title' : name === 'quest' ? 'quest-title' : 'tickets-title');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function sparkle() {
    if (reduceMotion) return;
    for (let i = 0; i < 32; i++) {
      const spark = document.createElement('i'); spark.className = 'spark';
      const angle = Math.random() * Math.PI * 2, distance = 80 + Math.random() * 250;
      spark.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      spark.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
      $('burst').append(spark); setTimeout(() => spark.remove(), 1700);
    }
  }

  async function openLetter() {
    if (state.busy || state.screen !== 'arrival') return;
    window.invitationMusic?.startAfterGesture();
    state.busy = true; $('open-letter').disabled = true; $('owl-letter').disabled = true;
    $('owl-letter').classList.add('depart'); sparkle();
    await new Promise(resolve => setTimeout(resolve, reduceMotion ? 0 : 660));
    showScreen('letter');
    $('owl-letter').classList.remove('depart'); $('open-letter').disabled = false; $('owl-letter').disabled = false; state.busy = false;
  }
  $('open-letter').addEventListener('click', openLetter); $('owl-letter').addEventListener('click', openLetter);
  $('home-link').addEventListener('click', (e) => { e.preventDefault(); if (!state.busy) showScreen('arrival'); });
  $('back-to-letter').addEventListener('click', () => showScreen('letter'));
  $('reread').addEventListener('click', () => showScreen('letter'));

  function renderQuest() {
    const q = challenges[state.step]; state.solved = false; state.words = [];
    $('quest-title').textContent = q.title; $('quest-emblem').textContent = q.emblem; $('quest-prompt').textContent = q.prompt;
    $('quest-counter').textContent = 'ЗАКЛИНАНИЕ 0' + (state.step + 1) + ' / 03';
    $('quest-feedback').textContent = ''; $('quest-hint').textContent = q.hint; $('quest-hint').hidden = true; $('hint-button').hidden = false;
    $('next-step').disabled = true;
    $('next-step').innerHTML = state.step === 2 ? 'Получить билеты <span aria-hidden="true">✦</span>' : 'Следующее заклинание <span aria-hidden="true">→</span>';
    document.querySelector('.quest-card').classList.remove('solved');
    document.querySelectorAll('.quest-progress span').forEach((el, index) => { el.classList.toggle('current', index === state.step); el.classList.toggle('done', index < state.step); el.textContent = index < state.step ? '✓' : '0' + (index + 1); });
    const choices = $('quest-choices'); choices.replaceChildren();
    if (state.step < 2) {
      q.choices.forEach(answer => { const button = document.createElement('button'); button.className = 'choice'; button.type = 'button'; button.textContent = answer; button.addEventListener('click', () => answerChoice(answer)); choices.append(button); });
    } else {
      const puzzle = document.createElement('div'); puzzle.className = 'word-puzzle';
      const slots = document.createElement('div'); slots.className = 'word-slots'; slots.setAttribute('aria-label', 'Твоё заклинание'); slots.setAttribute('aria-live', 'polite');
      for (let i = 0; i < 3; i++) { const slot = document.createElement('span'); slot.className = 'word-slot'; slot.textContent = '·'; slots.append(slot); }
      const options = document.createElement('div'); options.className = 'word-options';
      ['кино', 'Пойдём', 'в'].forEach(word => { const button = document.createElement('button'); button.className = 'choice'; button.type = 'button'; button.textContent = word; button.dataset.word = word; button.addEventListener('click', () => chooseWord(word)); options.append(button); });
      const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'text-button reset-words'; reset.id = 'reset-words'; reset.textContent = 'Собрать заново'; reset.addEventListener('click', () => { renderQuest(); document.querySelector('.word-options button').focus(); });
      puzzle.append(slots, options, reset); choices.append(puzzle);
    }
  }
  function solved() {
    state.solved = true; $('next-step').disabled = false; $('quest-feedback').textContent = challenges[state.step].success;
    $('hint-button').hidden = true; $('quest-hint').hidden = true; document.querySelector('.quest-card').classList.add('solved'); sparkle();
  }
  function answerChoice(answer) {
    if (state.screen !== 'quest' || state.step > 1 || state.solved) return { ok: false, message: 'Сейчас нельзя выбрать этот ответ.' };
    const q = challenges[state.step];
    if (!q.choices.includes(answer)) throw new Error('Выбери одно из предложенных заклинаний');
    const buttons = [...document.querySelectorAll('#quest-choices .choice')];
    buttons.forEach(button => button.classList.remove('wrong'));
    const button = buttons.find(button => button.textContent === answer);
    if (answer === q.answer) { button.classList.add('correct'); buttons.forEach(button => button.disabled = true); solved(); return { ok: true, solved: true }; }
    button.classList.add('wrong'); $('quest-feedback').textContent = q.wrong; return { ok: true, solved: false, message: q.wrong };
  }
  function chooseWord(word) {
    if (state.screen !== 'quest' || state.step !== 2 || state.solved) return { ok: false, message: 'Сначала дойди до последнего заклинания.' };
    if (!['Пойдём', 'в', 'кино'].includes(word)) throw new Error('Неизвестное слово');
    if (state.words.includes(word)) return { ok: false, message: 'Это слово уже выбрано.' };
    const expected = ['Пойдём', 'в', 'кино'];
    if (word !== expected[state.words.length]) { $('quest-feedback').textContent = 'Слова чуть-чуть перепутались. ' + (state.words.length ? 'Какое слово будет следующим?' : 'Начни с приглашения: «Пойдём…»'); return { ok: true, solved: false }; }
    state.words.push(word); $('quest-feedback').textContent = '';
    document.querySelectorAll('.word-slot').forEach((el, i) => { el.textContent = state.words[i] || '·'; el.classList.toggle('filled', Boolean(state.words[i])); });
    const button = [...document.querySelectorAll('.word-options button')].find(button => button.dataset.word === word); button.disabled = true; button.classList.add('correct');
    if (state.words.length === 3) solved(); return { ok: true, words: [...state.words], solved: state.solved };
  }
  function startQuest() { state.step = 0; renderQuest(); showScreen('quest'); }
  function nextStep() {
    if (state.screen !== 'quest' || !state.solved) return { ok: false, message: 'Сначала разгадай текущее заклинание.' };
    if (state.step === 2) { showScreen('tickets'); sparkle(); return { ok: true, screen: 'tickets' }; }
    state.step++; renderQuest(); $('quest-title').focus({ preventScroll: true }); return { ok: true, step: state.step + 1 };
  }
  $('start-quest').addEventListener('click', startQuest); $('next-step').addEventListener('click', nextStep);
  $('hint-button').addEventListener('click', () => { $('quest-hint').hidden = false; $('hint-button').hidden = true; });

  async function saveTickets() {
    const button = $('save-tickets'); button.disabled = true; $('save-feedback').textContent = 'Готовим билеты…';
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1350;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#091d24'; ctx.fillRect(0, 0, 1600, 1350);
      ctx.strokeStyle = '#998353'; ctx.lineWidth = 2; ctx.strokeRect(35, 35, 1530, 1280);
      const text = (value,x,y,font,color) => { ctx.font = font; ctx.fillStyle = color; ctx.fillText(value,x,y); };
      ctx.textAlign = 'center'; text('СУББОТА. КИНО. МЫ.',800,130,'500 68px Georgia','#e7d4ad');
      text('Два приглашения в маленькое приключение',800,187,'28px Arial','#aec1bf');
      function ticket(y,name,companion,no,dark) {
        const fill = dark ? '#18343a' : '#ebd7ae', ink = dark ? '#ead8ad' : '#30413b', muted = dark ? '#9fb4b2' : '#637064';
        ctx.fillStyle = fill; ctx.fillRect(140,y,1320,355); ctx.strokeStyle = dark ? '#927f54' : '#dbc39c'; ctx.strokeRect(140,y,1320,355);
        ctx.textAlign = 'left'; text('ВОЛШЕБНЫЙ КИНОВЕЧЕР',190,y+52,'22px Arial',muted);
        text('БИЛЕТ-ПРИГЛАШЕНИЕ ДЛЯ',190,y+105,'17px Arial',muted); text(name,190,y+178,'60px Georgia',ink);
        text('ДАТА',190,y+237,'17px Arial',muted); text('ВРЕМЯ',530,y+237,'17px Arial',muted); text('МЕСТО',760,y+237,'17px Arial',muted);
        text('26.09.2026',190,y+283,'32px Arial',ink); text('16:00',530,y+283,'32px Arial',ink); text('Рядом с '+companion,760,y+283,'25px Arial',ink);
        ctx.beginPath(); ctx.setLineDash([8,8]); ctx.moveTo(1260,y); ctx.lineTo(1260,y+355); ctx.strokeStyle = muted; ctx.stroke(); ctx.setLineDash([]);
        ctx.textAlign = 'center'; text('БИЛЕТ',1360,y+96,'18px Arial',muted); text(no,1360,y+205,'86px Georgia',ink); text('ИЗ ДВУХ',1360,y+273,'18px Arial',muted);
      }
      ticket(245,'Александры','Максимом','01',false); ticket(639,'Максима','Александрой','02',true);
      ctx.textAlign = 'center'; text('Фильм и кинотеатр выберем вместе.',800,1080,'28px Arial','#c9d2c5');
      text('Ради твоей улыбки стоило отправить сову.',800,1150,'italic 39px Georgia','#d7bf8e');
      text('Памятные приглашения. Не являются входными билетами кинотеатра.',800,1258,'20px Arial','#8ba6a8');
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw new Error('Export failed');
      const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'Alexandra-and-Maxim-26-September.png'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),60000);
      $('save-feedback').textContent = 'Билеты готовы. Найди картинку в загрузках браузера.';
    } catch { $('save-feedback').textContent = 'Не получилось сохранить картинку. Можно сделать скриншот билетов.'; }
    finally { button.disabled = false; }
  }
  $('save-tickets').addEventListener('click', saveTickets);
  if (!reduceMotion) for (let i=0;i<27;i++) { const star=document.createElement('i'); star.className='star'; const size=1+Math.random()*2; star.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;width:'+size+'px;height:'+size+'px;animation-delay:-'+Math.random()*12+'s;--duration:'+(8+Math.random()*12)+'s'; $('stars').append(star); }

  // Same in-page actions are available to supporting browsers, without external side effects.
  if (document.modelContext?.registerTool) {
    const lifetime = new AbortController();
    const tools = [
      { name:'read_invitation_progress',description:'Read the visible invitation stage and current quest without changing anything.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({screen:state.screen,step:state.step+1,solved:state.solved,words:[...state.words]}) },
      { name:'open_invitation_letter',description:'Open the delivered letter from Maxim to Alexandra.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:async()=>{if(state.screen!=='arrival')return {ok:false,message:'The letter has already been opened.'};await openLetter();return {ok:true,screen:state.screen};} },
      { name:'start_invitation_quest',description:'Start or restart the three-step quest from the open letter.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{if(state.screen!=='letter')return {ok:false,message:'Open the letter first.'};startQuest();return {ok:true,step:1};} },
      { name:'answer_invitation_quest',description:'Choose a displayed spell, platform, or one word in the current quest. Does not advance to the next step.',inputSchema:{type:'object',properties:{answer:{type:'string'}},required:['answer'],additionalProperties:false},execute:(input)=>{if(!input||typeof input.answer!=='string')throw new Error('answer must be a string');return state.step===2?chooseWord(input.answer):answerChoice(input.answer);} },
      { name:'advance_invitation_quest',description:'Advance a solved quest step, or reveal the souvenir invitations after all three steps.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:nextStep }
    ];
    for (const tool of tools) { try { Promise.resolve(document.modelContext.registerTool(tool,{signal:lifetime.signal})).catch(()=>{}); } catch {} }
    window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
  }
})();
