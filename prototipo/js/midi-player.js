// =========================================================================
// Player MIDI Nativo (.mid SMF Format 0/1) + Sintetizador Web Audio + Piano Roll
// Funciona 100% offline (tanto via HTTP quanto via file://)
// =========================================================================

class SimpleMidiPlayer {
  constructor() {
    this.audioCtx = null;
    this.parsed = null;
    this.fileSize = 0;
    this.fileName = '';
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseOffset = 0;
    this.bpmScale = 1.0;
    this.rafId = null;
    this.scheduledIdx = 0;
    this.trackMuted = {};
    this.activeVoices = [];
  }

  readVLQ(view, posObj) {
    let value = 0;
    while (true) {
      const b = view.getUint8(posObj.p++);
      value = (value << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) break;
    }
    return value;
  }

  parseSMF(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const str = (off, len) => {
      let s = '';
      for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(off + i));
      return s;
    };

    if (str(0, 4) !== 'MThd') throw new Error('Arquivo MIDI inválido (sem cabeçalho MThd)');
    const headerLen = view.getUint32(4);
    const format = view.getUint16(8);
    const nTracks = view.getUint16(10);
    const tpq = view.getUint16(12);

    let offset = 8 + headerLen;
    let tempoUs = 500000; // default 120 BPM
    const tracks = [];
    const allNotes = [];

    for (let t = 0; t < nTracks; t++) {
      if (offset + 8 > view.byteLength) break;
      const chunkId = str(offset, 4);
      const chunkLen = view.getUint32(offset + 4);
      offset += 8;
      const end = offset + chunkLen;
      if (chunkId !== 'MTrk') { offset = end; continue; }

      const posObj = { p: offset };
      let tick = 0;
      let runningStatus = 0;
      let trackName = `Faixa ${t + 1}`;
      let program = 0;
      const openNotes = new Map();
      let noteCount = 0;

      while (posObj.p < end) {
        const delta = this.readVLQ(view, posObj);
        tick += delta;
        let status = view.getUint8(posObj.p);
        if (status < 0x80) {
          status = runningStatus;
        } else {
          posObj.p++;
          if (status < 0xf0) runningStatus = status;
        }

        if (status === 0xff) {
          const metaType = view.getUint8(posObj.p++);
          const len = this.readVLQ(view, posObj);
          if (metaType === 0x51 && len === 3) {
            tempoUs = (view.getUint8(posObj.p) << 16) | (view.getUint8(posObj.p + 1) << 8) | view.getUint8(posObj.p + 2);
          } else if (metaType === 0x03) {
            trackName = str(posObj.p, len);
          }
          posObj.p += len;
        } else if (status === 0xf0 || status === 0xf7) {
          const len = this.readVLQ(view, posObj);
          posObj.p += len;
        } else {
          const type = status & 0xf0;
          const ch = status & 0x0f;
          if (type === 0x90) {
            const note = view.getUint8(posObj.p++);
            const vel = view.getUint8(posObj.p++);
            const key = `${ch}-${note}`;
            if (vel > 0) {
              openNotes.set(key, { tick, note, vel, ch, trackIdx: t });
            } else if (openNotes.has(key)) {
              const n = openNotes.get(key);
              openNotes.delete(key);
              allNotes.push({ ...n, endTick: tick, program });
              noteCount++;
            }
          } else if (type === 0x80) {
            const note = view.getUint8(posObj.p++);
            posObj.p++; // velocity
            const key = `${ch}-${note}`;
            if (openNotes.has(key)) {
              const n = openNotes.get(key);
              openNotes.delete(key);
              allNotes.push({ ...n, endTick: tick, program });
              noteCount++;
            }
          } else if (type === 0xc0) {
            program = view.getUint8(posObj.p++);
          } else if (type === 0xd0) {
            posObj.p += 1;
          } else {
            posObj.p += 2;
          }
        }
      }

      if (noteCount > 0) {
        tracks.push({ index: t, name: trackName, program, noteCount });
      }
      offset = end;
    }

    const bpm = Math.round(60000000 / tempoUs);
    const secPerTick = (tempoUs / 1e6) / tpq;
    const notes = allNotes
      .map((n) => ({
        ...n,
        startSec: n.tick * secPerTick,
        durSec: Math.max(0.06, (n.endTick - n.tick) * secPerTick)
      }))
      .sort((a, b) => a.startSec - b.startSec);

    const totalSec = notes.reduce((mx, n) => Math.max(mx, n.startSec + n.durSec), 1);

    return { format, tpq, bpm, tracks, notes, totalSec };
  }

  async loadPreset(fileName) {
    this.stop();
    this.fileName = fileName;
    let buf;
    const decodeEmbedded = () => {
      const b64 = window.EMBEDDED_MIDI && window.EMBEDDED_MIDI[fileName];
      if (!b64) throw new Error('MIDI não encontrado offline: ' + fileName);
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return u8.buffer;
    };
    if (window.location.protocol === 'file:' && window.EMBEDDED_MIDI && window.EMBEDDED_MIDI[fileName]) {
      buf = decodeEmbedded();
    } else {
      try {
        const res = await fetch('midias/' + fileName);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        buf = await res.arrayBuffer();
      } catch {
        buf = decodeEmbedded();
      }
    }
    this.fileSize = buf.byteLength;
    this.parsed = this.parseSMF(buf);
    this.trackMuted = {};
    this.pauseOffset = 0;
    this.renderMeta();
    this.drawPianoRoll(0);
  }

  async loadFromFile(file) {
    this.stop();
    this.fileName = file.name;
    const buf = await file.arrayBuffer();
    this.fileSize = buf.byteLength;
    this.parsed = this.parseSMF(buf);
    this.trackMuted = {};
    this.pauseOffset = 0;
    this.renderMeta();
    this.drawPianoRoll(0);
  }

  midiNoteToFreq(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  playVoice(noteObj, when, dur) {
    if (!this.audioCtx || this.trackMuted[noteObj.trackIdx]) return;
    const ctx = this.audioCtx;
    const freq = this.midiNoteToFreq(noteObj.note);
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Timbre approximation by GM program
    if (noteObj.program >= 32 && noteObj.program <= 39) {
      // Bass
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 0.5;
      filter.type = 'lowpass';
      filter.frequency.value = 650;
    } else if (noteObj.program >= 88 && noteObj.program <= 95) {
      // Warm pad
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc2.detune.value = 7;
      filter.type = 'lowpass';
      filter.frequency.value = 1600;
    } else {
      // Piano / Electric Piano
      osc.type = 'triangle';
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2;
      filter.type = 'lowpass';
      filter.frequency.value = 2800;
    }

    osc.frequency.value = freq;
    if (osc2.frequency.value === 440 && freq !== 440) osc2.frequency.value = freq;

    const amp = (noteObj.vel / 127) * 0.14;
    const attack = noteObj.program >= 88 ? 0.08 : 0.012;
    const release = Math.min(0.18, dur * 0.35);

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(amp, when + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * 0.45), when + Math.max(attack + 0.02, dur - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.06);

    const g2 = ctx.createGain();
    g2.gain.value = 0.35;

    osc.connect(filter);
    osc2.connect(g2).connect(filter);
    filter.connect(gain).connect(ctx.destination);

    osc.start(when);
    osc2.start(when);
    osc.stop(when + dur + 0.08);
    osc2.stop(when + dur + 0.08);
    this.activeVoices.push(osc, osc2);
  }

  play() {
    if (!this.parsed) return;
    if (this.isPlaying) return;
    if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    this.isPlaying = true;
    const scaledDur = this.parsed.totalSec / this.bpmScale;
    if (this.pauseOffset >= scaledDur - 0.05) this.pauseOffset = 0;

    this.startTime = this.audioCtx.currentTime - this.pauseOffset;
    this.scheduledIdx = this.parsed.notes.findIndex((n) => (n.startSec / this.bpmScale) >= this.pauseOffset);
    if (this.scheduledIdx < 0) this.scheduledIdx = this.parsed.notes.length;

    const tickLoop = () => {
      if (!this.isPlaying) return;
      const elapsed = this.audioCtx.currentTime - this.startTime;
      const total = this.parsed.totalSec / this.bpmScale;

      // Schedule lookahead 0.25s
      while (this.scheduledIdx < this.parsed.notes.length) {
        const n = this.parsed.notes[this.scheduledIdx];
        const t = n.startSec / this.bpmScale;
        if (t > elapsed + 0.25) break;
        const when = this.startTime + t;
        const dur = n.durSec / this.bpmScale;
        if (when >= this.audioCtx.currentTime - 0.05) {
          this.playVoice(n, Math.max(this.audioCtx.currentTime, when), dur);
        }
        this.scheduledIdx++;
      }

      this.drawPianoRoll(elapsed * this.bpmScale);
      if (elapsed >= total + 0.15) {
        this.stop();
        return;
      }
      this.rafId = requestAnimationFrame(tickLoop);
    };
    this.rafId = requestAnimationFrame(tickLoop);
    this.updateButtons();
  }

  pause() {
    if (!this.isPlaying) return;
    this.pauseOffset = this.audioCtx.currentTime - this.startTime;
    this.isPlaying = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.stopVoices();
    this.updateButtons();
  }

  stop() {
    this.isPlaying = false;
    this.pauseOffset = 0;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.stopVoices();
    if (this.parsed) this.drawPianoRoll(0);
    this.updateButtons();
  }

  stopVoices() {
    for (const v of this.activeVoices) {
      try { v.stop(); } catch {}
    }
    this.activeVoices = [];
  }

  setBpmScale(scale) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      const currentRawTime = (this.audioCtx.currentTime - this.startTime) * this.bpmScale;
      this.pause();
      this.bpmScale = scale;
      this.pauseOffset = currentRawTime / this.bpmScale;
      this.play();
    } else {
      this.bpmScale = scale;
    }
    this.renderMeta();
  }

  updateButtons() {
    const btnPlay = document.getElementById('midi-play');
    if (btnPlay) btnPlay.textContent = this.isPlaying ? '⏸ Pausar MIDI' : '▶ Reproduzir MIDI';
  }

  renderMeta() {
    if (!this.parsed) return;
    const p = this.parsed;
    const effBpm = Math.round(p.bpm * this.bpmScale);
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('midi-stat-size', `${this.fileSize} bytes (~${(this.fileSize / 1024).toFixed(2)} KB)`);
    setText('midi-stat-tracks', `${p.tracks.length} faixa(s)`);
    setText('midi-stat-notes', `${p.notes.length} notas`);
    setText('midi-stat-bpm', `${effBpm} BPM`);

    const container = document.getElementById('midi-track-toggles');
    if (container) {
      const colors = ['#38bdf8', '#34d399', '#a78bfa', '#facc15'];
      container.innerHTML = p.tracks.map((tr, i) => {
        const col = colors[i % colors.length];
        const checked = !this.trackMuted[tr.index] ? 'checked' : '';
        return `<label class="track-chip" style="border-left:4px solid ${col}">
          <input type="checkbox" data-track="${tr.index}" ${checked}>
          <span>${tr.name} <small style="color:var(--muted)">(${tr.noteCount} notas)</small></span>
        </label>`;
      }).join('');
      container.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
        chk.addEventListener('change', (e) => {
          const idx = Number(e.target.dataset.track);
          this.trackMuted[idx] = !e.target.checked;
        });
      });
    }
  }

  drawPianoRoll(curRawSec) {
    const canvas = document.getElementById('midi-canvas');
    if (!canvas || !this.parsed) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 720;
    const h = canvas.clientHeight || 220;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#090f1d';
    ctx.fillRect(0, 0, w, h);

    const p = this.parsed;
    const minNote = Math.min(...p.notes.map((n) => n.note), 42) - 2;
    const maxNote = Math.max(...p.notes.map((n) => n.note), 86) + 2;
    const noteRange = Math.max(12, maxNote - minNote);

    // Subtle horizontal grid
    ctx.strokeStyle = 'rgba(148,163,184,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const y = (i / 8) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const trackIdxToColorIdx = new Map(p.tracks.map((tr, i) => [tr.index, i]));
    const colors = ['#38bdf8', '#34d399', '#a78bfa', '#facc15'];

    for (const n of p.notes) {
      const x = (n.startSec / p.totalSec) * (w - 24) + 12;
      const nw = Math.max(4, (n.durSec / p.totalSec) * (w - 24));
      const y = h - 12 - ((n.note - minNote) / noteRange) * (h - 24);
      const nh = Math.max(5, (h - 24) / noteRange);
      const active = curRawSec >= n.startSec && curRawSec <= n.startSec + n.durSec && this.isPlaying;
      const ci = trackIdxToColorIdx.get(n.trackIdx) ?? 0;

      ctx.globalAlpha = this.trackMuted[n.trackIdx] ? 0.18 : (active ? 1 : 0.72);
      ctx.fillStyle = active ? '#ffffff' : colors[ci % colors.length];
      ctx.beginPath();
      ctx.roundRect(x, y - nh / 2, nw, nh, 3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Playhead
    const px = 12 + (Math.min(curRawSec, p.totalSec) / p.totalSec) * (w - 24);
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
  }
}

window.midiPlayer = new SimpleMidiPlayer();
