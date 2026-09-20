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
  introScript.src = './intro.js?v=1';
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
  let blocked = false;
  let failed = false;
  let gestureTried = false;

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
    blocked = false;
    panel.hidden = false;

    if (failed) {
      status.textContent = 'Музыка пока недоступна.';
      update();
      return;
    }

    try {
      await audio.play();
      playing = true;
      blocked = false;
      status.textContent = 'Пусть музыка сопровождает твоё маленькое приключение.';
    } catch (error) {
      playing = false;
      blocked = true;
      status.textContent = 'Коснись страницы или открой конверт — музыка включится.';
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
    if (enabled && !playing && !failed) {
      gestureTried = true;
      play();
    }
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

  function firstGesture(event) {
    if (!event.isTrusted || gestureTried || event.target.closest?.('#music-toggle, #music-panel')) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    startAfterGesture();
  }

  document.addEventListener('click', firstGesture);
  document.addEventListener('keydown', firstGesture);
  document.addEventListener('touchstart', firstGesture, { passive: true });

  audio.addEventListener('play', () => {
    playing = true;
    blocked = false;
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

  panel.hidden = false;
  update();

  play();
})();
