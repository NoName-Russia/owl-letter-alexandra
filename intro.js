(() => {
  'use strict';

  if (document.getElementById('cinematic-intro')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.remove('cinematic-intro-pending');
  root.classList.add('cinematic-intro-active');

  const style = document.createElement('style');
  style.id = 'cinematic-intro-style';
  style.textContent = `
    html.cinematic-intro-active,
    html.cinematic-intro-active body{overflow:hidden!important}
    html.cinematic-intro-active body>header,
    html.cinematic-intro-active body>main,
    html.cinematic-intro-active body>footer,
    html.cinematic-intro-active #music-panel{opacity:0!important;pointer-events:none!important}

    #cinematic-intro{position:fixed;inset:0;z-index:9999;overflow:hidden;background:#051219;color:#f5ead1;font-family:Manrope,Arial,sans-serif;isolation:isolate}
    #cinematic-intro:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 20%,rgba(222,204,155,.13),transparent 18%),linear-gradient(180deg,rgba(2,10,15,.14),rgba(2,10,15,.64));z-index:1;pointer-events:none}
    #cinematic-intro.intro-leaving{animation:introFadeOut 1.05s cubic-bezier(.4,0,.2,1) forwards}

    .intro-sky{position:absolute;inset:0;background:linear-gradient(180deg,#07141c 0%,#0b2029 50%,#09171d 100%)}
    .intro-sky:after{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 1px,transparent 1.4px);background-size:83px 83px;opacity:.19;animation:introStars 9s linear infinite}
    .intro-moon{position:absolute;top:8%;right:10%;width:min(18vw,180px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 36% 34%,#fff8dc 0,#ead8a5 46%,#c8b47c 72%,#857551 100%);box-shadow:0 0 55px rgba(238,218,161,.23),0 0 130px rgba(214,190,128,.13);opacity:.86}
    .intro-moon:after{content:'';position:absolute;width:22%;height:22%;left:23%;top:25%;border-radius:50%;background:rgba(114,100,69,.11);box-shadow:37px 27px 0 4px rgba(114,100,69,.08),6px 55px 0 -2px rgba(114,100,69,.07)}

    .intro-room{position:absolute;inset:0;display:grid;place-items:center;z-index:2;perspective:1200px}
    .intro-window-wrap{position:relative;width:min(78vw,760px);height:min(67vh,650px);filter:drop-shadow(0 30px 50px rgba(0,0,0,.6));animation:windowAppear 1.25s ease both}
    .intro-window{position:absolute;inset:0;border:15px solid #16252a;border-radius:42% 42% 4px 4px/20% 20% 4px 4px;background:linear-gradient(180deg,rgba(10,30,40,.14),rgba(5,17,23,.08));box-shadow:inset 0 0 0 2px rgba(218,187,124,.18),inset 0 0 55px rgba(0,0,0,.25)}
    .intro-window:before,.intro-window:after{content:'';position:absolute;background:#172a30;box-shadow:0 0 0 1px rgba(218,187,124,.08)}
    .intro-window:before{width:13px;top:0;bottom:0;left:50%;transform:translateX(-50%)}
    .intro-window:after{height:13px;left:0;right:0;top:51%;transform:translateY(-50%)}
    .intro-sill{position:absolute;left:-5%;right:-5%;height:24px;bottom:-14px;background:linear-gradient(180deg,#22353a,#0c1c21);border-radius:4px;box-shadow:0 16px 30px rgba(0,0,0,.55)}
    .intro-curtain{position:absolute;top:-8%;bottom:-4%;width:29%;background:linear-gradient(90deg,#091319,#1b262a 54%,#071015);filter:drop-shadow(0 20px 30px rgba(0,0,0,.7));opacity:.93}
    .intro-curtain.left{left:-21%;transform:rotate(2deg);border-radius:0 40% 24% 0}
    .intro-curtain.right{right:-21%;transform:rotate(-2deg);border-radius:40% 0 0 24%}

    .intro-copy{position:absolute;left:50%;top:7.5%;transform:translateX(-50%);z-index:6;text-align:center;width:min(88vw,640px);opacity:0;animation:introCopy 1.2s ease .35s forwards}
    .intro-copy small{display:block;color:#d7bd87;letter-spacing:.25em;font-size:11px;text-transform:uppercase;margin-bottom:10px}
    .intro-copy strong{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:clamp(28px,4vw,48px);letter-spacing:.01em;text-shadow:0 7px 25px #000}

    .intro-owl-flight{position:absolute;z-index:5;width:min(60vw,590px);left:-66vw;top:19%;transform:rotate(-7deg) scale(.72);animation:owlFlyIn 3.05s cubic-bezier(.18,.71,.23,1) .72s forwards}
    .intro-owl-flight img{display:block;width:100%;height:auto;filter:drop-shadow(0 20px 23px rgba(0,0,0,.63));animation:owlWingFloat 1.05s ease-in-out .7s 3 alternate}
    .intro-owl-flight.is-delivered{animation:owlFlyAway 1.45s cubic-bezier(.55,.08,.73,.16) forwards}

    .intro-envelope{position:absolute;left:50%;top:58%;z-index:7;width:min(41vw,300px);aspect-ratio:1.52;transform:translate(-50%,-50%) scale(.35) rotate(5deg);opacity:0;cursor:pointer;border:0;background:transparent;padding:0;filter:drop-shadow(0 25px 30px rgba(0,0,0,.48));animation:envelopeArrive 1.25s cubic-bezier(.18,.84,.31,1.1) 3.1s forwards}
    .intro-envelope:focus-visible{outline:2px solid #f1d397;outline-offset:11px}
    .intro-envelope-base{position:absolute;inset:0;background:linear-gradient(145deg,#ead9b8,#c9ad79);border:1px solid rgba(100,76,43,.42);border-radius:3px;overflow:hidden}
    .intro-envelope-base:before,.intro-envelope-base:after{content:'';position:absolute;bottom:-1px;width:72%;height:100%;background:linear-gradient(135deg,transparent 49%,rgba(120,91,50,.18) 50%,transparent 51%)}
    .intro-envelope-base:before{left:-21%;transform:skewX(16deg)}
    .intro-envelope-base:after{right:-21%;transform:scaleX(-1) skewX(16deg)}
    .intro-flap{position:absolute;left:0;right:0;top:0;height:58%;transform-origin:top center;background:linear-gradient(160deg,#f0dfbd,#d1b784);clip-path:polygon(0 0,100% 0,50% 100%);z-index:3;border-top:1px solid rgba(255,255,255,.28);transition:transform .9s cubic-bezier(.22,.68,.31,1),filter .5s}
    .intro-envelope.open .intro-flap{transform:rotateX(178deg);filter:brightness(.88)}
    .intro-seal{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%);z-index:5;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 36% 30%,#a45248,#702b2b 65%,#4d1f22);border:1px solid #ba7363;box-shadow:0 4px 8px #0004;color:#e8cfa1;font-family:'Cormorant Garamond',Georgia,serif;font-size:27px;transition:opacity .35s,transform .45s}
    .intro-envelope.open .intro-seal{opacity:0;transform:translate(-50%,-50%) scale(.65)}
    .intro-letter-peek{position:absolute;left:8%;right:8%;bottom:7%;height:68%;z-index:1;background:linear-gradient(135deg,#f6ead0,#e2cea6);border:1px solid rgba(107,82,48,.26);transform:translateY(35%);transition:transform 1s cubic-bezier(.2,.75,.23,1),height 1s}
    .intro-envelope.open .intro-letter-peek{transform:translateY(-69%);height:105%}
    .intro-letter-peek:before{content:'Александра, тебе письмо';position:absolute;left:10%;right:10%;top:20%;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:clamp(15px,2.5vw,22px);line-height:1.2;color:#56452f;text-align:center}
    .intro-letter-peek:after{content:'✦';position:absolute;left:50%;bottom:12%;transform:translateX(-50%);color:#8a7045;font-size:18px}

    .intro-hint{position:absolute;left:50%;bottom:6.5%;transform:translateX(-50%);z-index:8;text-align:center;opacity:0;animation:hintIn .85s ease 4.05s forwards;white-space:nowrap}
    .intro-hint span{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border:1px solid rgba(218,187,124,.24);border-radius:999px;background:rgba(4,17,23,.56);backdrop-filter:blur(8px);color:#dbc28f;font-size:12px;letter-spacing:.08em}
    .intro-hint i{width:5px;height:5px;border-radius:50%;background:#e7cf98;box-shadow:0 0 14px #e7cf98;animation:hintPulse 1.5s ease infinite}
    .intro-skip{position:absolute;right:22px;bottom:19px;z-index:9;border:0;border-bottom:1px solid rgba(225,205,164,.34);background:transparent;color:#9cb0b1;padding:5px 0;font:500 11px Manrope,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
    .intro-skip:hover{color:#e5d1a7}
    .intro-spark{position:absolute;z-index:4;width:4px;height:4px;border-radius:50%;background:#e6d2a3;box-shadow:0 0 13px #e7ce91;opacity:0;animation:sparkDrift 3.4s ease-in-out var(--delay) infinite}

    @keyframes windowAppear{0%{opacity:0;transform:scale(.92);filter:blur(6px)}100%{opacity:1;transform:scale(1);filter:blur(0)}}
    @keyframes introStars{to{transform:translateY(83px)}}
    @keyframes introCopy{from{opacity:0;transform:translate(-50%,-7px)}to{opacity:.94;transform:translate(-50%,0)}}
    @keyframes owlFlyIn{0%{left:-66vw;top:16%;transform:rotate(-9deg) scale(.67)}62%{left:19%;top:22%;transform:rotate(2deg) scale(.92)}100%{left:24%;top:25%;transform:rotate(0) scale(.88)}}
    @keyframes owlWingFloat{from{transform:translateY(-5px) rotate(-1.5deg)}to{transform:translateY(8px) rotate(1.5deg)}}
    @keyframes owlFlyAway{0%{left:24%;top:25%;opacity:1;transform:rotate(0) scale(.88)}100%{left:112%;top:6%;opacity:.2;transform:rotate(14deg) scale(.62)}}
    @keyframes envelopeArrive{0%{opacity:0;transform:translate(-50%,-50%) scale(.35) rotate(7deg)}55%{opacity:1;transform:translate(-50%,-50%) scale(1.08) rotate(-2deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}}
    @keyframes hintIn{to{opacity:1}}
    @keyframes hintPulse{50%{transform:scale(1.8);opacity:.45}}
    @keyframes sparkDrift{0%,100%{opacity:0;transform:translate3d(0,13px,0) scale(.6)}35%{opacity:.8}70%{opacity:.25;transform:translate3d(var(--dx),-34px,0) scale(1.15)}}
    @keyframes introFadeOut{0%{opacity:1;filter:blur(0)}100%{opacity:0;filter:blur(9px);visibility:hidden}}

    @media(max-width:700px){
      .intro-window-wrap{width:86vw;height:61vh;top:2vh}
      .intro-window{border-width:10px}
      .intro-window:before{width:9px}.intro-window:after{height:9px}
      .intro-owl-flight{width:94vw;left:-104vw;top:26%}
      .intro-envelope{width:min(64vw,270px);top:62%}
      .intro-copy{top:8%;padding:0 22px}.intro-copy strong{font-size:32px}.intro-copy small{font-size:9px}
      .intro-hint{bottom:8.2%}.intro-hint span{font-size:10px}
      .intro-moon{width:31vw;right:5%;top:12%}
      @keyframes owlFlyIn{0%{left:-104vw;top:26%;transform:rotate(-9deg) scale(.58)}62%{left:1%;top:31%;transform:rotate(2deg) scale(.83)}100%{left:4%;top:34%;transform:rotate(0) scale(.8)}}
      @keyframes owlFlyAway{0%{left:4%;top:34%;opacity:1;transform:rotate(0) scale(.8)}100%{left:112%;top:16%;opacity:.15;transform:rotate(14deg) scale(.53)}}
    }

    @media(prefers-reduced-motion:reduce){
      #cinematic-intro *,#cinematic-intro *:before,#cinematic-intro *:after{animation-duration:.001ms!important;animation-delay:0s!important;transition-duration:.001ms!important}
      .intro-owl-flight{left:24%;top:25%;opacity:1;transform:scale(.88)}
      .intro-envelope{opacity:1;transform:translate(-50%,-50%) scale(1)}
      .intro-hint{opacity:1}
    }
  `;
  document.head.append(style);

  const scene = document.createElement('section');
  scene.id = 'cinematic-intro';
  scene.setAttribute('aria-label', 'Сова доставляет письмо для Александры');
  scene.innerHTML = `
    <div class="intro-sky" aria-hidden="true"></div>
    <div class="intro-moon" aria-hidden="true"></div>
    <div class="intro-copy" aria-hidden="true"><small>Совиная почта · особое отправление</small><strong>Кажется, к твоему окну кто-то летит…</strong></div>
    <div class="intro-room" aria-hidden="true">
      <div class="intro-window-wrap">
        <div class="intro-curtain left"></div><div class="intro-curtain right"></div>
        <div class="intro-window"></div><div class="intro-sill"></div>
      </div>
    </div>
    <div class="intro-owl-flight" aria-hidden="true"><img src="./assets/owl.webp" alt=""></div>
    <button class="intro-envelope" type="button" aria-label="Открыть письмо для Александры">
      <span class="intro-letter-peek"></span><span class="intro-envelope-base"></span><span class="intro-flap"></span><span class="intro-seal">М</span>
    </button>
    <div class="intro-hint" aria-hidden="true"><span><i></i> Письмо доставлено</span></div>
    <button class="intro-skip" type="button">Пропустить</button>
  `;

  for (let i = 0; i < 17; i++) {
    const spark = document.createElement('i');
    spark.className = 'intro-spark';
    spark.style.left = (12 + Math.random() * 76) + '%';
    spark.style.top = (22 + Math.random() * 62) + '%';
    spark.style.setProperty('--delay', (-Math.random() * 3.2) + 's');
    spark.style.setProperty('--dx', (-20 + Math.random() * 40) + 'px');
    scene.append(spark);
  }

  document.body.prepend(scene);

  const envelope = scene.querySelector('.intro-envelope');
  const owl = scene.querySelector('.intro-owl-flight');
  const skip = scene.querySelector('.intro-skip');
  let ending = false;

  function revealLetter() {
    if (ending) return;
    ending = true;
    window.invitationMusic?.startAfterGesture?.();
    envelope.classList.add('open');
    owl.classList.add('is-delivered');

    const openExistingLetter = () => {
      const button = document.getElementById('open-letter');
      if (button && !button.disabled) button.click();
    };

    setTimeout(openExistingLetter, reduceMotion ? 0 : 520);
    setTimeout(() => scene.classList.add('intro-leaving'), reduceMotion ? 0 : 1050);
    setTimeout(() => {
      root.classList.remove('cinematic-intro-active');
      scene.remove();
      style.remove();
      const preload = document.getElementById('intro-preload-style');
      preload?.remove();
    }, reduceMotion ? 50 : 2150);
  }

  envelope.addEventListener('click', revealLetter);
  skip.addEventListener('click', revealLetter);

  // После прилёта письмо раскрывается само, если пользователь ничего не нажал.
  setTimeout(revealLetter, reduceMotion ? 120 : 5200);
})();
