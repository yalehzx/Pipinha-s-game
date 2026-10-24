import Phaser from 'phaser';

export class AudioManager {
  private static instance: AudioManager | null = null;

  private audioContext: AudioContext | null = null;
  private masterVolume = 0.8;
  private muted = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }

    return AudioManager.instance;
  }

  private init(): void {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) {
      return;
    }

    this.audioContext = new AudioCtor();
  }

  public setVolume(value: number): void {
    this.masterVolume = Phaser.Math.Clamp(value, 0, 1);
  }

  public toggleMute(): void {
    this.muted = !this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public playShoot(frequency = 180): void {
    this.playTone(frequency, 0.06, 'square', 0.03);
  }

  public playHit(frequency = 120): void {
    this.playTone(frequency, 0.09, 'sawtooth', 0.08);
  }

  public playLevelUp(): void {
    this.playTone(440, 0.08, 'triangle', 0.08);
    setTimeout(() => this.playTone(660, 0.08, 'triangle', 0.08), 90);
  }

  public playUiClick(): void {
    this.playTone(340, 0.04, 'square', 0.04);
  }

  private playTone(
    frequency: number,
    duration: number,
    waveform: OscillatorType,
    volume: number,
  ): void {
    if (!this.audioContext || this.muted) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume * this.masterVolume;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}
