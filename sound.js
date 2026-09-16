// sound.js - Procedural audio synthesizer using Web Audio API for mechanical switch sounds

class SoundManager {
  constructor() {
    this.ctx = null;
    this.soundType = localStorage.getItem('typing_sound_type') || 'click'; // 'click', 'thock', 'off'
    this.volume = parseFloat(localStorage.getItem('typing_sound_vol') || '0.35');
    this.noiseBuffers = [];
    this.isInitialized = false;

    // Fast unlock on first user interaction anywhere
    this._bindUnlockListeners();
  }

  _bindUnlockListeners() {
    const unlock = () => {
      this.init();
      ['keydown', 'pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
        window.removeEventListener(evt, unlock);
      });
    };

    ['keydown', 'pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this._generateNoiseBuffers();
        this.isInitialized = true;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pre-generate noise buffer pool to avoid CPU spikes and GC stutter during rapid typing
  _generateNoiseBuffers() {
    if (!this.ctx || this.noiseBuffers.length > 0) return;
    try {
      const duration = 0.025;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      // Pre-bake 4 variations
      for (let b = 0; b < 4; b++) {
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        this.noiseBuffers.push(buffer);
      }
    } catch (e) {}
  }

  setSoundType(type) {
    this.soundType = type;
    localStorage.setItem('typing_sound_type', type);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('typing_sound_vol', this.volume.toString());
  }

  playKeySound(isError = false, isSpace = false) {
    if (this.soundType === 'off' || this.volume <= 0) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (isError) {
      // Soft error tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
      return;
    }

    if (this.soundType === 'click') {
      // Crisp mechanical click (Blue Switch style)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pitch = isSpace ? 650 : (780 + (Math.random() * 120 - 60));

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.035);

      gain.gain.setValueAtTime(this.volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);

      this._playNoiseBurst(now, 0.015, 0.25 * this.volume);
    } else if (this.soundType === 'thock') {
      // Deep rounded thock (Brown / Linear lubed style)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pitch = isSpace ? 180 : (240 + (Math.random() * 40 - 20));

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      this._playNoiseBurst(now, 0.02, 0.15 * this.volume);
    }
  }

  _playNoiseBurst(time, duration, vol) {
    if (!this.ctx) return;
    try {
      if (this.noiseBuffers.length === 0) {
        this._generateNoiseBuffers();
      }
      if (this.noiseBuffers.length === 0) return;

      const buffer = this.noiseBuffers[Math.floor(Math.random() * this.noiseBuffers.length)];
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.Q.setValueAtTime(2.0, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(time);
      noise.stop(time + duration);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  playCompletionChime() {
    if (this.soundType === 'off' || this.volume <= 0) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + (idx * 0.08);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.55);
    });
  }
}

const sound = new SoundManager();
