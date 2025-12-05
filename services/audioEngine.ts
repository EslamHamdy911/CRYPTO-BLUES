export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackNode: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  
  // Backing Track State
  private isBackingTrackPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private currentBeat: number = 0;
  private tempo: number = 90; // BPM
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s
  private timerID: number | null = null;

  constructor() {}

  public async init() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;

    // Create Delay Effect (Space/Echo)
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.value = 0.4; 
    
    this.feedbackNode = this.ctx.createGain();
    this.feedbackNode.gain.value = 0.4; 

    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode);
    
    this.masterGain.connect(this.ctx.destination);
    this.delayNode.connect(this.masterGain);
    
    // Synthetic Reverb
    this.reverbNode = this.ctx.createConvolver();
    try {
      this.reverbNode.buffer = await this.createImpulseResponse();
      this.reverbNode.connect(this.masterGain);
    } catch (e) {
      console.warn("Reverb gen failed", e);
    }
    
    console.log("Audio Engine Initialized");
  }

  // --- BLUES BACKING TRACK ENGINE ---

  public startBluesBackingTrack() {
    if (this.isBackingTrackPlaying || !this.ctx) return;
    this.isBackingTrackPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
  }

  public stopBluesBackingTrack() {
    this.isBackingTrackPlaying = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }

  private scheduler() {
    if (!this.isBackingTrackPlaying || !this.ctx) return;
    // While there are notes that will need to play before the next interval, schedule them
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleBeat(this.currentBeat, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat; // Advance 1 beat
    this.currentBeat++;
    if (this.currentBeat >= 48) { // 12 bars * 4 beats
        this.currentBeat = 0;
    }
  }

  private scheduleBeat(beatNumber: number, time: number) {
     if (!this.ctx || !this.masterGain) return;

     // 12-Bar Blues Progression in C
     // C7 (I) - 4 bars
     // F7 (IV) - 2 bars
     // C7 (I) - 2 bars
     // G7 (V) - 1 bar
     // F7 (IV) - 1 bar
     // C7 (I) - 1 bar
     // G7 (V) - 1 bar (Turnaround)
     
     // Current Bar (0-indexed)
     const bar = Math.floor(beatNumber / 4);
     const beatInBar = beatNumber % 4;

     let rootFreq = 65.41; // C2
     if (bar >= 4 && bar < 6) rootFreq = 87.31; // F2
     else if (bar >= 6 && bar < 8) rootFreq = 65.41; // C2
     else if (bar === 8) rootFreq = 98.00; // G2
     else if (bar === 9) rootFreq = 87.31; // F2
     else if (bar === 10) rootFreq = 65.41; // C2
     else if (bar === 11) rootFreq = 98.00; // G2

     // Walking Bass Pattern: 1, 3, 5, 6 for each chord (Basic Shuffle)
     // Freq Multipliers for Major chord + 6th
     const ratios = [1, 1.25, 1.5, 1.68]; 
     const noteFreq = rootFreq * ratios[beatInBar % 4];

     this.playBassNote(noteFreq, time, 0.4);

     // Hi-hat / Snare rhythm
     this.playRhythm(time, beatInBar);
  }

  private playBassNote(freq: number, time: number, duration: number) {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine'; // Deep smooth bass
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.4, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration + 0.1);
      
      // Add a little grit (second osc)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.value = freq;
      const gain2 = this.ctx.createGain();
      gain2.gain.value = 0.05; // Low volume
      gain2.gain.setValueAtTime(0, time);
      gain2.gain.linearRampToValueAtTime(0.05, time + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(time);
      osc2.stop(time + duration + 0.1);
  }

  private playRhythm(time: number, beat: number) {
      if (!this.ctx || !this.masterGain) return;
      
      // Simple Noise Hi-hat
      const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 5000;
      const noiseGain = this.ctx.createGain();
      
      // Accent beats 2 and 4
      if (beat === 1 || beat === 3) {
          noiseGain.gain.value = 0.15; // Louder (Snare-ish)
      } else {
          noiseGain.gain.value = 0.05; // Softer (Hi-hat)
      }
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(time);
  }

  // --- EXISTING METHODS ---

  private async createImpulseResponse(): Promise<AudioBuffer> {
    if (!this.ctx) throw new Error("Audio Context not initialized");
    const rate = this.ctx.sampleRate;
    const length = rate * 2.0; 
    const decay = 2.0;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  }

  public playTone(frequency: number) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain) return;

    const now = this.ctx.currentTime;
    // Lead Synth Sound (Neon Pluck)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = frequency;

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = frequency * 1.002; // Slight detune

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 3;
    filter.frequency.setValueAtTime(frequency * 4, now);
    filter.frequency.exponentialRampToValueAtTime(frequency, now + 0.3);

    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(0.2, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(amp);
    amp.connect(this.masterGain);
    
    if (this.delayNode) amp.connect(this.delayNode); 
    if (this.reverbNode) amp.connect(this.reverbNode); 

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.1);
    osc2.stop(now + 1.1);

    setTimeout(() => {
      osc1.disconnect();
      osc2.disconnect();
      filter.disconnect();
      amp.disconnect();
    }, 1200);
  }

  public resume() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(e => console.error(e));
    }
  }
}

export const audioEngine = new AudioEngine();
