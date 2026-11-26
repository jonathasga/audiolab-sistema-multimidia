// =========================================================================
// Simulador Animado Interativo: Amostragem (Nyquist/Aliasing) + Quantização
// + Calculadora de Bitrate / Tamanho de Arquivo
// =========================================================================

(function initSimulators() {
  let simPhase = 0;
  let simAnimating = true;
  let previewCtx = null;

  function getParams() {
    const freq = Number(document.getElementById('sim-freq')?.value || 3);
    const fs = Number(document.getElementById('sim-fs')?.value || 18);
    const bits = Number(document.getElementById('sim-bits')?.value || 4);
    return { freq, fs, bits };
  }

  function updateReadouts() {
    const { freq, fs, bits } = getParams();
    const levels = Math.pow(2, bits);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('sim-freq-val', `${freq} Hz (ciclos/janela)`);
    set('sim-fs-val', `${fs} amostras/seg`);
    set('sim-bits-val', `${bits} bits (${levels} níveis)`);

    const banner = document.getElementById('sim-nyquist-banner');
    if (banner) {
      const aliasing = fs < 2 * freq;
      banner.className = 'status-banner ' + (aliasing ? 'status-warn' : 'status-ok');
      banner.innerHTML = aliasing
        ? `<span>⚠️ <strong>ALIASING DETECTADO!</strong> Taxa de amostragem (${fs} Hz) é menor que 2 × ${freq} Hz (${2 * freq} Hz). A onda reconstruída (vermelha) fica distorcida!</span>`
        : `<span>✅ <strong>NYQUIST ATENDIDO:</strong> Taxa (${fs} Hz) ≥ 2 × ${freq} Hz (${2 * freq} Hz). A onda pode ser reconstruída fielmente com ${levels} níveis de amplitude.</span>`;
    }
  }

  function drawSimulator() {
    const canvas = document.getElementById('nyquist-canvas');
    if (canvas && canvas.offsetParent !== null) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || 760;
      const h = canvas.clientHeight || 280;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { freq, fs, bits } = getParams();
      const levels = Math.pow(2, bits);
      const aliasing = fs < 2 * freq;
      const padX = 36, padY = 26;
      const plotW = w - padX * 2;
      const plotH = h - padY * 2;
      const midY = padY + plotH / 2;
      const amp = plotH * 0.42;

      ctx.fillStyle = '#090f1d';
      ctx.fillRect(0, 0, w, h);

      // Quantization horizontal levels (show up to 16 lines visually)
      const visualLevels = Math.min(levels, 16);
      ctx.strokeStyle = 'rgba(148,163,184,0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= visualLevels; i++) {
        const y = midY - amp + (i / visualLevels) * (amp * 2);
        ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(w - padX, y); ctx.stroke();
      }
      // Zero axis
      ctx.strokeStyle = '#475569';
      ctx.beginPath(); ctx.moveTo(padX, midY); ctx.lineTo(w - padX, midY); ctx.stroke();

      // 1. Original continuous analog wave (Cyan)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const steps = 260;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = padX + t * plotW;
        const y = midY - Math.sin(2 * Math.PI * freq * t - simPhase) * amp;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Sample points + quantized values
      const samplePts = [];
      for (let i = 0; i <= fs; i++) {
        const t = i / fs;
        const x = padX + t * plotW;
        const rawV = Math.sin(2 * Math.PI * freq * t - simPhase);
        const halfLv = levels / 2;
        const qV = Math.max(-1, Math.min(1, Math.round(rawV * halfLv) / halfLv));
        const y = midY - qV * amp;
        samplePts.push({ x, y });
      }

      // 3. Reconstructed signal connecting samples (Red if aliasing, Purple staircase if valid)
      ctx.strokeStyle = aliasing ? '#fb7185' : '#a78bfa';
      ctx.lineWidth = aliasing ? 3 : 2;
      ctx.beginPath();
      samplePts.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else if (aliasing) ctx.lineTo(pt.x, pt.y);
        else {
          ctx.lineTo(pt.x, samplePts[idx - 1].y);
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.stroke();

      // 4. Stems & Sample Dots
      for (const pt of samplePts) {
        ctx.strokeStyle = 'rgba(52,211,153,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pt.x, midY); ctx.lineTo(pt.x, pt.y); ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 4.2, 0, Math.PI * 2); ctx.fill();
      }

      // Legend
      ctx.font = '600 11.5px Segoe UI, sans-serif';
      ctx.fillStyle = '#38bdf8'; ctx.fillText('● Onda Analógica', padX, 16);
      ctx.fillStyle = '#facc15'; ctx.fillText('● Amostras (fs)', padX + 135, 16);
      ctx.fillStyle = aliasing ? '#fb7185' : '#a78bfa';
      ctx.fillText(aliasing ? '● Onda Falsa (Aliasing)' : '● Degrau Quantizado (Bits)', padX + 255, 16);

      if (simAnimating) simPhase += 0.03;
    }
    requestAnimationFrame(drawSimulator);
  }

  // Synthesize brief audio preview demonstrating current bit depth quantization
  function playQuantizedTone() {
    const { freq, bits } = getParams();
    if (!previewCtx) previewCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (previewCtx.state === 'suspended') previewCtx.resume();

    const sr = previewCtx.sampleRate;
    const dur = 1.1;
    const buf = previewCtx.createBuffer(1, Math.floor(sr * dur), sr);
    const ch = buf.getChannelData(0);
    const audibleFreq = 220 + freq * 55; // map visual Hz to audible pitch
    const halfLv = Math.pow(2, bits) / 2;

    for (let i = 0; i < ch.length; i++) {
      const t = i / sr;
      const env = Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.12);
      const s = Math.sin(2 * Math.PI * audibleFreq * t) * 0.7;
      const q = Math.round(s * halfLv) / halfLv;
      ch[i] = q * env * 0.4;
    }
    const src = previewCtx.createBufferSource();
    src.buffer = buf;
    src.connect(previewCtx.destination);
    src.start();
  }

  // File Size / Bitrate Calculator in Module 3
  function updateBitrateCalc() {
    const sr = Number(document.getElementById('calc-sr')?.value || 44100);
    const bits = Number(document.getElementById('calc-bits')?.value || 16);
    const ch = Number(document.getElementById('calc-ch')?.value || 2);
    const mins = Number(document.getElementById('calc-min')?.value || 3);

    const bitrateBps = sr * bits * ch;
    const kbps = Math.round(bitrateBps / 1000);
    const wavMB = ((bitrateBps / 8) * (mins * 60)) / (1024 * 1024);
    const flacMB = wavMB * 0.55;
    const mp3MB = ((192000 / 8) * (mins * 60)) / (1024 * 1024);

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('calc-res-kbps', `${kbps.toLocaleString('pt-BR')} kbps`);
    set('calc-res-wav', `${wavMB.toFixed(1)} MB`);
    set('calc-res-flac', `~${flacMB.toFixed(1)} MB`);
    set('calc-res-mp3', `~${mp3MB.toFixed(1)} MB`);
  }

  window.addEventListener('DOMContentLoaded', () => {
    ['sim-freq', 'sim-fs', 'sim-bits'].forEach((id) => {
      document.getElementById(id)?.addEventListener('input', updateReadouts);
    });
    document.getElementById('sim-toggle-anim')?.addEventListener('click', (e) => {
      simAnimating = !simAnimating;
      e.target.textContent = simAnimating ? '⏸ Pausar Animação' : '▶ Retomar Animação';
    });
    document.getElementById('sim-play-tone')?.addEventListener('click', playQuantizedTone);

    ['calc-sr', 'calc-bits', 'calc-ch', 'calc-min'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', updateBitrateCalc);
      document.getElementById(id)?.addEventListener('input', updateBitrateCalc);
    });

    updateReadouts();
    updateBitrateCalc();
    requestAnimationFrame(drawSimulator);
  });
})();
