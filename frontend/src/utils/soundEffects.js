// Web Audio API synthesized sound effects - zero external audio asset dependencies!
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('nqtcoder_games_muted') === 'true';
  }

  initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('nqtcoder_games_muted', this.isMuted.toString());
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playTone(freq, type, duration, startTime = 0, gainLevel = 0.1) {
    if (this.isMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  playCorrect() {
    // Upbeat pleasant two-tone chime (C5 -> G5)
    this.playTone(523.25, 'sine', 0.12, 0, 0.15);
    this.playTone(783.99, 'sine', 0.25, 0.1, 0.2);
  }

  playWrong() {
    // Low error thud/buzz (Ab2 -> F2)
    this.playTone(207.65, 'sawtooth', 0.18, 0, 0.12);
    this.playTone(174.61, 'sawtooth', 0.25, 0.1, 0.12);
  }

  playStreak() {
    // Rising triumphant arpeggio for combo streak (C5 -> E5 -> G5 -> C6)
    this.playTone(523.25, 'triangle', 0.1, 0, 0.15);
    this.playTone(659.25, 'triangle', 0.1, 0.08, 0.15);
    this.playTone(783.99, 'triangle', 0.12, 0.16, 0.18);
    this.playTone(1046.5, 'sine', 0.35, 0.24, 0.25);
  }

  playLevelPassed() {
    // Victory fanfare (G4 -> C5 -> E5 -> G5 -> C6)
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.2, i * 0.1, 0.2);
    });
    this.playTone(1046.5, 'sine', 0.6, 0.5, 0.25);
  }

  playLevelFailed() {
    // Descending melancholy tone (E4 -> C#4 -> A3)
    this.playTone(329.63, 'sine', 0.2, 0, 0.15);
    this.playTone(277.18, 'sine', 0.2, 0.18, 0.15);
    this.playTone(220.0, 'sine', 0.4, 0.36, 0.15);
  }

  playTick() {
    // Subtle clock tick for final countdown seconds
    this.playTone(880.0, 'sine', 0.04, 0, 0.05);
  }
}

export const soundManager = new SoundManager();
