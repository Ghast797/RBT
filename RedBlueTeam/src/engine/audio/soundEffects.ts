// Procedural Web Audio API sound synthesizer - zero external audio assets!

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private ambientTargetVolume: number = 0.06;

  private getContext(): AudioContext | null {
    if (this.isMuted && !this.isAmbientPlaying) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.syncAmbientGain();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.syncAmbientGain();
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private syncAmbientGain() {
    if (!this.ctx || !this.ambientGain) return;
    try {
      const target = this.isMuted ? 0.0001 : this.ambientTargetVolume;
      this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(target, this.ctx.currentTime + 0.3);
    } catch {}
  }

  /**
   * Procedural Cyberpunk Darknet Drone
   * Synthesizes a deep server-room ambient drone with sub-bass and filtered airflow noise.
   * Completely procedural with 0 external sound files!
   */
  public startAmbient(volume = 0.06) {
    this.ambientTargetVolume = volume;
    if (this.isAmbientPlaying) {
      this.syncAmbientGain();
      return;
    }

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.isAmbientPlaying = true;
      const masterGain = ctx.createGain();
      const initialVol = this.isMuted ? 0.0001 : this.ambientTargetVolume;
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(initialVol, ctx.currentTime + 2.5);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      // 1. Deep Sub-bass drone (55 Hz - A1) with gentle lowpass
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const subFilter = ctx.createBiquadFilter();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(55, ctx.currentTime);
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(110, ctx.currentTime);
      subGain.gain.setValueAtTime(0.4, ctx.currentTime);
      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start();

      // 2. Harmonic Drone (82.4 Hz - E2) with slow breathing LFO
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = 'sine';
      harmOsc.frequency.setValueAtTime(82.41, ctx.currentTime);
      harmGain.gain.setValueAtTime(0.2, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 1 cycle per ~12.5s
      lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(harmGain.gain);
      harmOsc.connect(harmGain);
      harmGain.connect(masterGain);
      harmOsc.start();
      lfo.start();

      // 3. Server room filtered ventilation noise
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 2));
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.11;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(260, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      this.ambientNodes = [
        { stop: () => subOsc.stop(), disconnect: () => subOsc.disconnect() },
        { stop: () => harmOsc.stop(), disconnect: () => harmOsc.disconnect() },
        { stop: () => lfo.stop(), disconnect: () => lfo.disconnect() },
        { stop: () => noiseSource.stop(), disconnect: () => noiseSource.disconnect() },
        { disconnect: () => masterGain.disconnect() }
      ];
    } catch {}
  }

  public stopAmbient() {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;
    const ctx = this.ctx;
    if (ctx && this.ambientGain) {
      try {
        this.ambientGain.gain.cancelScheduledValues(ctx.currentTime);
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        setTimeout(() => {
          this.ambientNodes.forEach((node) => {
            try {
              if (node.stop) node.stop();
              node.disconnect();
            } catch {}
          });
          this.ambientNodes = [];
          this.ambientGain = null;
        }, 1300);
      } catch {
        this.ambientGain = null;
      }
    }
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying && !this.isMuted;
  }

  // Keypress tick
  public playKeypress() {
    this.playClick(1200, 0.02);
  }

  // Short mechanical key/button click
  public playClick(freq = 800, duration = 0.04) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Terminal confirmation / positive feedback chime
  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.18);
      });
    } catch {}
  }

  // Warning or error buzz
  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }

  // Drone radar blip
  public playRadarBlip() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // Siren / Alarm sound for malware activation
  public playAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = ctx.currentTime + i * 0.22;
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, startTime);
        osc.frequency.setValueAtTime(587.33, startTime + 0.11);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      }
    } catch {}
  }

  // Cyber notification / chat focus alert chime
  public playNotification() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [659.25, 880]; // E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.15);
      });
    } catch {}
  }
}

export const sounds = new SoundSystem();
