// =========================================================================
// ÁudioLab SM - Navegação Não-Linear, Progresso, Controles Antes/Depois e Glossário
// =========================================================================

const GLOSSARY_TERMS = [
  { term: 'Onda Sonora (Analógica)', desc: 'Variação contínua de pressão mecânica no ar que carrega frequência (altura) e amplitude (intensidade/volume).' },
  { term: 'Transdutor (Microfone / Alto-falante)', desc: 'Dispositivo que converte energia acústica em sinal elétrico (microfone) ou sinal elétrico em ondas sonoras (alto-falante).' },
  { term: 'ADC (Conversor Analógico-Digital)', desc: 'Circuito que digitaliza o sinal elétrico contínuo em duas etapas: amostragem no tempo e quantização na amplitude.' },
  { term: 'DAC (Conversor Digital-Analógico)', desc: 'Reconstrói o sinal elétrico analógico a partir da sequência de números binários para reprodução sonora.' },
  { term: 'Taxa de Amostragem (Sample Rate)', desc: 'Número de medições da onda por segundo, medido em Hertz (Hz). Exemplos: 44,1 kHz (CD) e 48 kHz (vídeo).' },
  { term: 'Teorema de Nyquist-Shannon', desc: 'Estabelece que a taxa de amostragem deve ser no mínimo o dobro da maior frequência do sinal (fs ≥ 2 · fmáx) para evitar perda de informação.' },
  { term: 'Aliasing', desc: 'Distorção que cria frequências falsas mais graves quando a taxa de amostragem é menor que o dobro da frequência do sinal.' },
  { term: 'Quantização e Profundidade de Bits (Bit Depth)', desc: 'Processo de arredondar cada amostra para um dos 2^n níveis discretos disponíveis (ex.: 16 bits = 65.536 níveis).' },
  { term: 'PCM (Pulse-Code Modulation)', desc: 'Representação padrão de áudio digital não comprimido, usada em arquivos WAV e CDs de áudio.' },
  { term: 'Bitrate (Taxa de Bits)', desc: 'Quantidade de dados processados por segundo (kbps). Em PCM: fs × bits × canais.' },
  { term: 'Compressão Lossless vs. Lossy', desc: 'Lossless (FLAC/ALAC) reduz tamanho sem perder dados; Lossy (MP3/AAC/OGG) usa psicoacústica para descartar informações menos audíveis.' },
  { term: 'MIDI (Musical Instrument Digital Interface)', desc: 'Protocolo e formato de arquivo (.mid) que guarda eventos musicais (notas, duração, velocity, instrumento) em vez de ondas sonoras gravadas.' },
  { term: 'dBFS e Clipping', desc: 'Decibéis relativos à escala máxima digital (0 dBFS). Ultrapassar 0 dBFS ceifa os picos da onda, causando distorção chamada clipping.' },
  { term: 'Normalização', desc: 'Ajuste proporcional de ganho que eleva ou reduz o áudio até o pico máximo atingir um teto seguro (ex.: -1 dBFS).' }
];

function goToModule(modId) {
  document.querySelectorAll('.module').forEach((m) => m.classList.remove('active'));
  const target = document.getElementById(modId);
  if (!target) return;
  target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.target === modId);
  });

  // Sync Before/After slider image width when Module 1 becomes visible
  if (modId === 'mod-captura') {
    const baOverlayImg = document.getElementById('ba-overlay-img');
    const baContainer = document.getElementById('ba-container');
    if (baOverlayImg && baContainer) {
      requestAnimationFrame(() => { baOverlayImg.style.width = baContainer.clientWidth + 'px'; });
    }
  }

  // Lazy load MIDI when opening Module 4
  if (modId === 'mod-midi' && window.midiPlayer && !window.midiPlayer.parsed) {
    window.midiPlayer.loadPreset('trilha_completa.mid').catch(console.error);
  } else if (modId !== 'mod-midi' && window.midiPlayer && window.midiPlayer.isPlaying) {
    window.midiPlayer.pause();
  }

  // Close mobile sidebar if open
  document.getElementById('sidebar')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.goToModule = goToModule;

function renderGlossary(filter = '') {
  const list = document.getElementById('glossary-list');
  if (!list) return;
  const q = filter.trim().toLowerCase();
  const filtered = GLOSSARY_TERMS.filter(
    (item) => item.term.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
  );
  list.innerHTML = filtered.length
    ? filtered.map((it) => `<div class="glossary-item"><h4>${it.term}</h4><p>${it.desc}</p></div>`).join('')
    : '<p style="color:var(--muted)">Nenhum termo encontrado para a busca informada.</p>';
}

window.addEventListener('DOMContentLoaded', () => {
  // Navigation triggers
  document.querySelectorAll('[data-target]').forEach((el) => {
    el.addEventListener('click', () => goToModule(el.dataset.target));
  });

  // Mobile menu button
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });

  // Before/After raster photo slider
  const baRange = document.getElementById('ba-range');
  const baOverlay = document.getElementById('ba-overlay');
  const baOverlayImg = document.getElementById('ba-overlay-img');
  const baContainer = document.getElementById('ba-container');
  const syncBaWidth = () => {
    if (baOverlayImg && baContainer) {
      baOverlayImg.style.width = baContainer.clientWidth + 'px';
    }
  };
  if (baRange && baOverlay) {
    baRange.addEventListener('input', () => {
      baOverlay.style.width = baRange.value + '%';
    });
    window.addEventListener('resize', syncBaWidth);
    setTimeout(syncBaWidth, 100);
  }

  // Toggle SVG Cadeia (Rascunho vs Final)
  document.querySelectorAll('[data-svg-cadeia]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-svg-cadeia]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('img-svg-cadeia').src = btn.dataset.svgCadeia;
      document.getElementById('cap-svg-cadeia').textContent = btn.dataset.caption;
    });
  });

  // Toggle SVG Nyquist (Rascunho vs Final)
  document.querySelectorAll('[data-svg-nyquist]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-svg-nyquist]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('img-svg-nyquist').src = btn.dataset.svgNyquist;
    });
  });

  // Toggle Video (Bruto vs Editado)
  document.querySelectorAll('[data-vid-src]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-vid-src]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const vid = document.getElementById('main-video');
      vid.pause();
      vid.src = btn.dataset.vidSrc;
      vid.load();
      document.getElementById('video-caption').textContent = btn.dataset.caption;
    });
  });

  // MIDI controls
  document.getElementById('midi-play')?.addEventListener('click', () => {
    if (window.midiPlayer.isPlaying) window.midiPlayer.pause();
    else window.midiPlayer.play();
  });
  document.getElementById('midi-stop')?.addEventListener('click', () => window.midiPlayer.stop());
  document.querySelectorAll('[data-midi-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-midi-preset]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      window.midiPlayer.loadPreset(btn.dataset.midiPreset);
    });
  });
  document.getElementById('midi-tempo')?.addEventListener('input', (e) => {
    const scale = Number(e.target.value) / 100;
    document.getElementById('midi-tempo-val').textContent = `${e.target.value}%`;
    window.midiPlayer.setBpmScale(scale);
  });
  document.getElementById('midi-upload')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) window.midiPlayer.loadFromFile(file);
  });

  // Glossary search
  renderGlossary();
  document.getElementById('glossary-search')?.addEventListener('input', (e) => {
    renderGlossary(e.target.value);
  });
});
