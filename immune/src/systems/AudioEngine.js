import { BALANCE } from '../config/balance.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.heartbeatActive = false;
    this.currentBpm = BALANCE.audio.heartbeat.bpmCalm;
    this.currentGain = BALANCE.audio.heartbeat.baseGain;
    this.beatTimer = 0;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(BALANCE.audio.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.createNoiseBuffer();
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return;
    const duration = 1.0;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  startHeartbeat() {
    this.init();
    this.heartbeatActive = true;
    this.beatTimer = 0.15;
    this.currentBpm = BALANCE.audio.heartbeat.bpmCalm;
    this.currentGain = BALANCE.audio.heartbeat.baseGain;
  }

  stopHeartbeat() {
    this.heartbeatActive = false;
  }

  update(dt, vitalityRatio = 1.0) {
    if (!this.heartbeatActive || !this.ctx) return;

    const cfg = BALANCE.audio.heartbeat;
    let targetBpm = cfg.bpmCalm;
    let targetGain = cfg.baseGain;
    let jitterAmount = 0;

    if (vitalityRatio >= 0.75) {
      targetBpm = cfg.bpmCalm;
      targetGain = cfg.baseGain;
    } else if (vitalityRatio >= 0.40) {
      const t = (0.75 - vitalityRatio) / (0.75 - 0.40);
      targetBpm = cfg.bpmCalm + t * (cfg.bpmElevated - cfg.bpmCalm);
      targetGain = cfg.baseGain;
    } else if (vitalityRatio >= 0.15) {
      const t = (0.40 - vitalityRatio) / (0.40 - 0.15);
      targetBpm = cfg.bpmElevated + t * (cfg.bpmTachycardia - cfg.bpmElevated);
      targetGain = cfg.baseGain;
      jitterAmount = cfg.jitterAmount;
    } else {
      const t = Math.max(0, vitalityRatio / 0.15);
      targetBpm = cfg.bpmFailing;
      targetGain = cfg.faintGain + t * (cfg.baseGain - cfg.faintGain);
      jitterAmount = cfg.jitterAmount * 1.5;
    }

    const lerpFactor = Math.min(1, dt * cfg.bpmLerpSpeed);
    this.currentBpm += (targetBpm - this.currentBpm) * lerpFactor;
    this.currentGain += (targetGain - this.currentGain) * lerpFactor;

    this.beatTimer -= dt;
    if (this.beatTimer <= 0) {
      this.playHeartbeatThump(this.currentGain);
      const interval = 60 / Math.max(20, this.currentBpm);
      const jitter = jitterAmount > 0 ? (Math.random() * 2 - 1) * jitterAmount : 0;
      this.beatTimer = Math.max(0.2, interval + jitter);
    }
  }

  playHeartbeatThump(volume) {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.heartbeat;
    const t1 = this.ctx.currentTime;
    const t2 = t1 + cfg.thump2Delay;

    // First thump (lub)
    this.synthesizeThump(t1, cfg.thump1Freq, volume, 1.0, 120);

    // Second thump (dub)
    this.synthesizeThump(t2, cfg.thump2Freq, volume * cfg.thump2VolumeRatio, 0.85, 95);
  }

  synthesizeThump(startTime, freq, gainLevel, decayMult, filterFreq) {
    if (!this.ctx || gainLevel <= 0.001) return;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.65), startTime + 0.12 * decayMult);

    oscGain.gain.setValueAtTime(0.0001, startTime);
    oscGain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.006);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.13 * decayMult);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.14 * decayMult);

    if (this.noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, startTime);
      filter.frequency.exponentialRampToValueAtTime(35, startTime + 0.08 * decayMult);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(gainLevel * 0.32, startTime + 0.006);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.09 * decayMult);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(startTime);
      noise.stop(startTime + 0.10 * decayMult);
    }
  }

  playAttack() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(460, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(280, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  playHit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.16);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.17);

    this.playNoise(0.09, 650, 160, 0.25);
  }

  playDash() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.11);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.26);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.27);

    this.playNoise(0.18, 1400, 320, 0.18);
  }

  playEnemyDeath() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.24);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);

    this.playNoise(0.24, 2000, 90, 0.35);
  }

  playEnemyWeakened() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.enemyWeakened;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(cfg.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, t + cfg.duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + cfg.duration);

    gain.gain.setValueAtTime(cfg.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + cfg.duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + cfg.duration + 0.02);

    this.playNoise(cfg.duration * 0.75, 400, 80, cfg.volume * 0.22);
  }

  playEngulf() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.engulf;
    const t = this.ctx.currentTime;

    // Primary rising suction tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(cfg.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, t + cfg.duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, t);
    filter.frequency.exponentialRampToValueAtTime(580, t + cfg.duration);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(cfg.volume, t + 0.08);
    gain.gain.setValueAtTime(cfg.volume, t + cfg.duration * 0.75);
    gain.gain.exponentialRampToValueAtTime(0.001, t + cfg.duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + cfg.duration + 0.02);

    // Wet texture squelch
    this.playNoise(cfg.duration * 0.85, 220, 650, cfg.volume * 0.35);
  }

  playVent() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.vent;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(cfg.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, t + cfg.duration);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + cfg.duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(cfg.volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + cfg.duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + cfg.duration + 0.02);

    this.playNoise(cfg.duration * 0.8, 1400, 300, cfg.volume * 0.35);
  }

  playVentDenied() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.ventDenied;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(cfg.freq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.freq * 0.6, t + cfg.duration);

    gain.gain.setValueAtTime(cfg.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + cfg.duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + cfg.duration + 0.02);
  }

  playPlayerDamage() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(55, t + 0.3);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.31);
  }

  playWaveComplete() {
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  playRespawn() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.35);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.39);
  }

  playHeal() {
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 chime
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.30);
    });
  }

  playInfect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  playInfectionRupture() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.25);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.26);

    this.playNoise(0.25, 800, 120, 0.4);
  }

  playNoise(duration, startFreq, endFreq, volume) {

    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const t = this.ctx.currentTime;
    filter.frequency.setValueAtTime(startFreq, t);
    filter.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  playTensionCue(secondsLeft = 10) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Urgency factor from 0.0 at 10s to 1.0 at 0s
    const urgency = Math.max(0, Math.min(1, (10 - secondsLeft) / 10));

    // Sharp, tense rising frequency pulse
    const startFreq = 260 + urgency * 380;
    const endFreq = startFreq * 1.35;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.14);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(200 + urgency * 300, t);

    const vol = 0.20 + urgency * 0.35;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playDebrisCollect() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 soft crystalline chime
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  playSplinterDeflect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1480, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.10);
  }

  playProximityPulse(urgency = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Soft bio-radar ping higher and more resonant as player closes in
    const freq = 180 + urgency * 320;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600 + urgency * 800, t);

    const vol = 0.12 + urgency * 0.22;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  playLevelIntro() {
    if (!this.ctx) return;
    const notes = [220, 329.63, 440]; // A3, E4, A4 quiet crystalline opening chord
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.20, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  playLevelFailed() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [220, 196, 174.61, 130.81]; // Descending ominous tones
    notes.forEach((freq, i) => {
      const noteTime = t + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, noteTime);
      filter.frequency.exponentialRampToValueAtTime(100, noteTime + 0.35);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.35, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  }

  playBacteriaSplit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.035);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.14);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(280, t + 0.14);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.38, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);

    this.playNoise(0.09, 900, 180, 0.18);
  }

  playParasiteSteal() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.parasiteSteal;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(cfg.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.midFreq, t + cfg.duration * 0.4);
    osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, t + cfg.duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2200, t + cfg.duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(600, t + cfg.duration);
    filter.Q.setValueAtTime(3.5, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(cfg.volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + cfg.duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + cfg.duration + 0.01);

    this.playNoise(cfg.duration * 0.8, 1400, 400, 0.25);
  }

  playParasiteEscape() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.parasiteEscape;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(cfg.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, t + cfg.duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + cfg.duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(cfg.volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + cfg.duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + cfg.duration + 0.01);

    this.playNoise(cfg.duration, 500, 100, 0.2);
  }

  playPickupCollect() {
    if (!this.ctx) return;
    const cfg = BALANCE.audio.pickupCollect;
    const t = this.ctx.currentTime;

    const notes = [cfg.note1, cfg.note2];
    notes.forEach((freq, i) => {
      const noteTime = t + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.exponentialRampToValueAtTime(cfg.volume, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + cfg.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + cfg.duration + 0.01);
    });
  }
}

