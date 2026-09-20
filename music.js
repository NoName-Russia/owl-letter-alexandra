(() => {
  'use strict';

  const preloadStyle = document.createElement('style');
  preloadStyle.id = 'intro-preload-style';
  preloadStyle.textContent = `
    html.cinematic-intro-pending,html.cinematic-intro-pending body{overflow:hidden!important}
    html.cinematic-intro-pending body>header,
    html.cinematic-intro-pending body>main,
    html.cinematic-intro-pending body>footer,
    html.cinematic-intro-pending #music-panel{opacity:0!important;pointer-events:none!important}
  `;
  document.head.append(preloadStyle);
  document.documentElement.classList.add('cinematic-intro-pending');

  const introScript = document.createElement('script');
  introScript.src = './intro.js?v=3';
  introScript.async = false;
  introScript.onerror = () => {
    document.documentElement.classList.remove('cinematic-intro-pending');
    preloadStyle.remove();
  };
  document.head.append(introScript);

  const button = document.getElementById('music-toggle');
  const label = document.getElementById('music-label');
  const panel = document.getElementById('music-panel');
  const status = document.getElementById('music-status');

  const audio = new Audio('./21071.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.3;

  let enabled = true;
  let playing = false;
  let failed = false;

  function update() {
    button.setAttribute('aria-pressed', String(playing));
    button.dataset.playing = String(playing);

    if (playing) {
      label.textContent = 'Выключить музыку';
      button.setAttribute('aria-label', 'Выключить фоновую музыку');
    } else if (failed) {
      label.textContent = 'Музыка недоступна';
      button.setAttribute('aria-label', 'Фоновая музыка недоступна');
    } else {
      label.textContent = 'Включить музыку';
      button.setAttribute('aria-label', 'Включить фоновую музыку');
    }
  }

  async function play() {
    enabled = true;
    panel.hidden = false;

    if (failed) {
      status.textContent = 'Музыка пока недоступна.';
      update();
      return;
    }

    try {
      await audio.play();
      playing = true;
      status.textContent = 'Пусть музыка сопровождает твоё маленькое приключение.';
    } catch (error) {
      playing = false;
      status.textContent = 'Нажми на письмо ещё раз или включи музыку кнопкой сверху.';
    }

    update();
  }

  function pause() {
    enabled = false;
    playing = false;
    audio.pause();
    panel.hidden = true;
    status.textContent = 'Музыка выключена.';
    update();
  }

  function startAfterGesture() {
    if (enabled && !playing && !failed) play();
  }

  window.invitationMusic = Object.freeze({ startAfterGesture });

  button.addEventListener('click', () => {
    if (playing) pause();
    else {
      enabled = true;
      play();
    }
  });

  document.getElementById('stop-music').addEventListener('click', () => {
    pause();
    button.focus();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      pause();
      button.focus();
    }
  });

  audio.addEventListener('play', () => {
    playing = true;
    update();
  });

  audio.addEventListener('pause', () => {
    if (!audio.ended) playing = false;
    update();
  });

  audio.addEventListener('error', () => {
    failed = true;
    playing = false;
    status.textContent = 'Музыка пока недоступна.';
    update();
  });

  const saveButton = document.getElementById('save-tickets');
  if (saveButton) {
    saveButton.addEventListener('click', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const feedback = document.getElementById('save-feedback');
      saveButton.disabled = true;
      if (feedback) feedback.textContent = 'Готовим красивые билеты…';

      try {
        if (document.fonts?.ready) await document.fonts.ready;

        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.fillStyle = '#091d24';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#998353';
        ctx.lineWidth = 2;
        ctx.strokeRect(35, 35, 1530, 1280);

        const text = (value, x, y, font, color, align = 'left') => {
          ctx.textAlign = align;
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.fillText(value, x, y);
        };

        text('ГАРРИ ПОТТЕР И ФИЛОСОФСКИЙ КАМЕНЬ', 800, 120, '500 54px Georgia', '#e7d4ad', 'center');
        text('Кинотеатр «Другар» · Зал 4 IMAX · 26 сентября · 16:00', 800, 178, '26px Arial', '#aec1bf', 'center');

        function drawTicket(y, name, seat, number, dark) {
          const fill = dark ? '#18343a' : '#ebd7ae';
          const ink = dark ? '#ead8ad' : '#30413b';
          const muted = dark ? '#9fb4b2' : '#637064';

          ctx.fillStyle = fill;
          ctx.fillRect(140, y, 1320, 355);
          ctx.strokeStyle = dark ? '#927f54' : '#dbc39c';
          ctx.strokeRect(140, y, 1320, 355);

          text('ГАРРИ ПОТТЕР И ФИЛОСОФСКИЙ КАМЕНЬ', 190, y + 48, '20px Arial', muted);
          text('КИНОТЕАТР «ДРУГАР» · ЗАЛ 4 IMAX', 190, y + 92, '17px Arial', muted);
          text(name, 190, y + 166, '56px Georgia', ink);

          text('ДАТА', 190, y + 230, '16px Arial', muted);
          text('ВРЕМЯ', 505, y + 230, '16px Arial', muted);
          text('МЕСТО', 735, y + 230, '16px Arial', muted);
          text('26.09.2026', 190, y + 279, '30px Arial', ink);
          text('16:00', 505, y + 279, '30px Arial', ink);
          text(seat, 735, y + 279, '28px Arial', ink);

          ctx.beginPath();
          ctx.setLineDash([8, 8]);
          ctx.moveTo(1260, y);
          ctx.lineTo(1260, y + 355);
          ctx.strokeStyle = muted;
          ctx.stroke();
          ctx.setLineDash([]);

          text('БИЛЕТ', 1360, y + 92, '18px Arial', muted, 'center');
          text(number, 1360, y + 203, '84px Georgia', ink, 'center');
          text('ИЗ ДВУХ', 1360, y + 273, '18px Arial', muted, 'center');
        }

        drawTicket(245, 'Александра', '6 ряд · 18 место', '01', false);
        drawTicket(639, 'Максим', '6 ряд · 19 место', '02', true);

        text('Кинотеатр «Другар» · два места рядом', 800, 1080, '28px Arial', '#c9d2c5', 'center');
        text('Ради твоей улыбки стоило отправить сову.', 800, 1160, 'italic 39px Georgia', '#d7bf8e', 'center');

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Export failed');

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Harry-Potter-Drughar-26-September.png';
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);

        if (feedback) feedback.textContent = 'Билеты готовы — картинка сохранена.';
      } catch (error) {
        if (feedback) feedback.textContent = 'Не получилось сохранить картинку. Можно сделать скриншот билетов.';
      } finally {
        saveButton.disabled = false;
      }
    }, true);
  }

  panel.hidden = false;
  status.textContent = 'Музыка включится, когда ты откроешь письмо.';
  update();
})();