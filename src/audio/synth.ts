const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

export class SynthAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean;
  private musicElapsed = 0;
  private musicStep = 0;

  constructor(muted = false) {
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  unlock(): void {
    const context = this.ensureContext();
    if (context?.state === 'suspended') void context.resume().catch(() => undefined);
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.72, this.context.currentTime, 0.025);
    }
  }

  drop(): void {
    const context = this.readyContext();
    if (!context) return;
    this.tone(88, 0.18, 'triangle', 0.34, 0.045);
    this.tone(48, 0.23, 'sine', 0.23, 0.04);
  }

  perfect(combo: number): void {
    const context = this.readyContext();
    if (!context) return;
    const base = 520 * 2 ** (PENTATONIC[Math.max(0, combo - 1) % PENTATONIC.length]! / 12);
    this.tone(base, 0.22, 'sine', 0.19, 0.015);
    this.tone(base * 1.5, 0.28, 'sine', 0.12, 0.07);
  }

  chop(): void {
    const context = this.readyContext();
    if (!context) return;
    const length = Math.floor(context.sampleRate * 0.16);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let seed = 0x51a7;
    for (let index = 0; index < length; index += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      channel[index] = (seed / 0x80000000 - 1) * (1 - index / length);
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(0.2, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    source.connect(filter).connect(gain).connect(this.master!);
    source.start();
    source.stop(context.currentTime + 0.17);
  }

  layerBreak(layer: number): void {
    const context = this.readyContext();
    if (!context) return;
    const source = context.createOscillator();
    const gain = context.createGain();
    source.type = 'sawtooth';
    source.frequency.setValueAtTime(280, context.currentTime);
    source.frequency.exponentialRampToValueAtTime(780, context.currentTime + 0.48);
    gain.gain.setValueAtTime(0.11, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
    source.connect(gain).connect(this.master!);
    source.start();
    source.stop(context.currentTime + 0.51);
    [0, 4, 7].forEach((step, index) => {
      this.tone(330 * 2 ** ((step + Math.min(layer, 9)) / 12), 0.32, 'sine', 0.12, index * 0.09);
    });
  }

  countdown(value: number): void {
    this.tone(value <= 0 ? 880 : 480 + (3 - value) * 70, value <= 0 ? 0.36 : 0.15, 'sine', 0.18);
  }

  warning(): void {
    this.tone(740, 0.07, 'square', 0.08);
  }

  gameOver(): void {
    [392, 330, 262].forEach((frequency, index) => {
      this.tone(frequency, 0.42, 'triangle', 0.18, index * 0.16);
    });
  }

  highScore(): void {
    [523, 659, 784, 1047].forEach((frequency, index) => {
      this.tone(frequency, 0.36, 'sine', 0.17, index * 0.11);
    });
  }

  update(dt: number, layer: number, musicEnabled: boolean): void {
    if (!musicEnabled || this.muted || !this.context) return;
    this.musicElapsed += dt;
    const interval = Math.max(0.2, 0.62 - Math.max(0, layer - 1) * 0.045);
    while (this.musicElapsed >= interval) {
      this.musicElapsed -= interval;
      const scale = [0, 2, 4, 7, 9];
      const step = this.musicStep % scale.length;
      const octave = this.musicStep % 8 === 0 ? 0 : 12;
      this.tone(196 * 2 ** ((scale[step]! + octave) / 12), 0.55, 'sine', 0.045);
      if (this.musicStep % 4 === 0) this.tone(98, 1.2, 'triangle', 0.035);
      this.musicStep += 1;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return null;
    this.context = new AudioContextConstructor();
    this.master = this.context.createGain();
    this.master.gain.value = this.muted ? 0 : 0.72;
    this.master.connect(this.context.destination);
    return this.context;
  }

  private readyContext(): AudioContext | null {
    if (this.muted) return null;
    return this.ensureContext();
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
  ): void {
    if (this.muted || !this.context || !this.master) return;
    const context = this.context;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}