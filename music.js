(() => {
  'use strict';
  const button = document.getElementById('music-toggle');
  const label = document.getElementById('music-label');
  const panel = document.getElementById('music-panel');
  const status = document.getElementById('music-status');
  const slot = document.getElementById('player-slot');
  const videoId = 'WUiI5aQcTow';
  let player = null;
  let ready = false;
  let enabled = true;
  let playing = false;
  let blocked = false;
  let failed = false;
  let gestureTried = false;

  function update() {
    button.setAttribute('aria-pressed', String(playing));
    button.dataset.playing = String(playing);
    label.textContent = playing ? 'Выключить музыку' : enabled && !blocked && !failed ? 'Загружаем музыку…' : 'Включить музыку';
    button.setAttribute('aria-label', playing || enabled && !blocked && !failed ? 'Выключить фоновую музыку' : 'Включить фоновую музыку');
  }
  function play() {
    enabled = true;
    panel.hidden = false;
    if (failed) {
      status.textContent = 'Плеер недоступен. Попробуй открыть музыку на YouTube по ссылке ниже.';
      update();
      return;
    }
    blocked = false;
    if (ready) {
      player.unMute();
      player.setVolume(30);
      player.playVideo();
    }
    update();
  }
  function pause() {
    enabled = false;
    playing = false;
    if (ready) player.pauseVideo();
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
    if (playing || enabled && !blocked && !failed) pause(); else play();
  });
  document.getElementById('stop-music').addEventListener('click', () => { pause(); button.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { pause(); button.focus(); }
  });
  // A real tap or key press can unlock sound on browsers that block autoplay.
  function firstGesture(event) {
    if (!event.isTrusted || gestureTried || event.target.closest?.('#music-toggle, #music-panel')) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    startAfterGesture();
  }
  document.addEventListener('click', firstGesture);
  document.addEventListener('keydown', firstGesture);

  function unavailable() {
    failed = true;
    playing = false;
    status.textContent = 'Музыкальный плеер не загрузился. Открой музыку на YouTube по ссылке ниже.';
    update();
  }
  function createPlayer() {
    if (player) return;
    player = new window.YT.Player('music-player', {
      events: {
        onReady(event) {
          clearTimeout(loadTimeout);
          failed = false;
          ready = true;
          event.target.setVolume(30);
          if (enabled) play(); else event.target.pauseVideo();
        },
        onStateChange(event) {
          if (event.data === 1) {
            if (!enabled && panel.hidden) { event.target.pauseVideo(); return; }
            enabled = true;
            playing = true;
            blocked = false;
            status.textContent = 'Пусть эта мелодия сопровождает твоё маленькое приключение.';
          } else if (event.data === 2 && playing) {
            // Respect a pause made in YouTube's own controls.
            playing = false;
            enabled = false;
            status.textContent = 'Музыка на паузе.';
          } else if (event.data === 0) {
            playing = false;
          }
          update();
        },
        onAutoplayBlocked() {
          blocked = true;
          playing = false;
          status.textContent = 'Браузер ждёт твоего нажатия. Открой конверт или нажми ▶ в плеере.';
          update();
        },
        onError: unavailable
      }
    });
  }

  // Keep one official player alive through the letter, quest, and tickets.
  const frame = document.createElement('iframe');
  frame.id = 'music-player';
  frame.title = 'Hedwig’s Theme — музыкальный проигрыватель';
  frame.width = '332';
  frame.height = '200';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allowFullscreen = true;
  const parameters = new URLSearchParams({ enablejsapi: '1', autoplay: '0', playsinline: '1', loop: '1', playlist: videoId, rel: '0', controls: '1', origin: location.origin });
  frame.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + parameters;
  slot.replaceChildren(frame);
  panel.hidden = false;
  update();
  const loadTimeout = setTimeout(() => { if (!ready) unavailable(); }, 20000);
  if (window.YT?.Player) createPlayer();
  else {
    window.onYouTubeIframeAPIReady = createPlayer;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = unavailable;
    document.head.append(script);
  }
})();
