/* ==========================================
   GENDER REVEAL — main.js
   ========================================== */

// ── LOADING SCREEN ────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loader-bar');
  if (!loader) return;

  const imgSrcs = [
    '/static/img/nube_rosa.png',
    '/static/img/nube_celeste.png',
    '/static/img/globo_rosa.png',
    '/static/img/globo_azul.png',
    '/static/img/lazo_rosa.png',
    '/static/img/lazo_azul.png',
    '/static/img/bear_blue.png',
    '/static/img/bear_pink.png',
  ];

  let loaded = 0;
  const total = imgSrcs.length;

  function hideLoader() {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 650);
  }

  function onDone() {
    loaded++;
    bar.style.width = Math.round((loaded / total) * 100) + '%';
    if (loaded >= total) hideLoader();
  }

  imgSrcs.forEach(src => {
    const img = new Image();
    // Si ya está en caché complete=true, igual llamamos onDone
    img.onload  = onDone;
    img.onerror = onDone;
    img.src = src;
    if (img.complete) onDone(); // caché hit
  });

  // Seguridad: máximo 5 segundos
  setTimeout(hideLoader, 5000);
})();

// ── MÚSICA ───────────────────────────────────
let playing = false;

function toggleMusic() {
  const audio    = document.getElementById('audio');
  const heroIcon = document.getElementById('play-icon-hero');
  const heroBtn  = document.getElementById('play-btn-hero');

  if (playing) {
    audio.pause();
    heroIcon.textContent = '🎵  Reproducir música';
    heroBtn.classList.remove('playing');
    playing = false;
  } else {
    audio.play().catch(err => console.warn('Autoplay:', err));
    heroIcon.textContent = '⏸  Pausar música';
    heroBtn.classList.add('playing');
    playing = true;
  }
}

// ── CUENTA REGRESIVA ─────────────────────────
(function countdown() {
  const target = new Date('2026-06-27T15:00:00-05:00');

  function update() {
    const diff = target - new Date();
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML =
        '<p style="font-family:Playfair Display,serif;font-size:2rem;color:var(--gold-light)">🎉 ¡Es hoy!</p>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    document.getElementById('dias').textContent     = String(d).padStart(2,'0');
    document.getElementById('horas').textContent    = String(h).padStart(2,'0');
    document.getElementById('minutos').textContent  = String(m).padStart(2,'0');
    document.getElementById('segundos').textContent = String(s).padStart(2,'0');
  }
  update();
  setInterval(update, 1000);
})();

// ── VOTACIÓN ─────────────────────────────────
let yaVoto = false;

function votar(opcion) {
  if (yaVoto) return;
  yaVoto = true;

  const btnNino = document.getElementById('btn-nino');
  const btnNina = document.getElementById('btn-nina');
  btnNino.classList.add('voted');
  btnNina.classList.add('voted');
  document.getElementById('btn-' + opcion).classList.add('selected');

  fetch('/votar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opcion })
  })
  .then(r => r.json())
  .then(data => renderVotes(data))
  .catch(() => {
    yaVoto = false;
    btnNino.classList.remove('voted');
    btnNina.classList.remove('voted');
  });
}

function renderVotes(data) {
  const results = document.getElementById('vote-results');
  results.style.display = 'block';
  document.getElementById('bar-nino').style.width  = data.pct_nino + '%';
  document.getElementById('bar-nina').style.width  = data.pct_nina + '%';
  document.getElementById('pct-nino').textContent  = data.pct_nino + '%';
  document.getElementById('pct-nina').textContent  = data.pct_nina + '%';
  document.getElementById('vote-total').textContent =
    `${data.total} ${data.total === 1 ? 'voto registrado' : 'votos registrados'}`;
}

fetch('/votos').then(r => r.json()).then(data => {
  if (data.total > 0) renderVotes(data);
});

// ── WHATSAPP RSVP ─────────────────────────────
const WA_PAPA = '593990287112';
const WA_MAMA = '593990051539';

function confirmar(quien) {
  const nombre    = document.getElementById('nombre-invitado').value.trim();
  const nombreStr = nombre ? `*${nombre}*` : 'Un invitado';

  const mensaje = `¡Hola! 🍼 ${nombreStr} confirma su asistencia a la *Revelación de Género* de Christopher & Paula.\n\n📅 Sábado 27 de junio 2026 — 3:00 PM\n📍 Quinta "El Descanso"\n\n¡Ahí estaré! 🎉`;

  const numero = quien === 'papa' ? WA_PAPA : WA_MAMA;
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
  return false;
}
