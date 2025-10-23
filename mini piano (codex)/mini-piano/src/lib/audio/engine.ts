"use client";
import * as Tone from "tone";
import { Instrument } from "@/state/store";

class AudioEngine {
  private inited = false;
  private instrument: Instrument = "piano";
  private sustain = false;
  private bpm = 100;
  private pianoReady = false;

  private piano?: Tone.Sampler;
  private keys?: Tone.PolySynth<Tone.FMSynth>;
  private drums?: {
    kick: Tone.MembraneSynth;
    snare: Tone.NoiseSynth;
    hihat: Tone.MetalSynth;
  };

  private reverb!: Tone.Reverb;
  private delay!: Tone.FeedbackDelay;
  private volume!: Tone.Volume;
  private limiter!: Tone.Limiter;

  private active = new Set<string>();

  private ensure = async () => {
    if (this.inited) return;
    await Tone.start();
    // Build the audio graph: instruments -> volume -> reverb -> delay -> limiter -> destination
    this.volume = new Tone.Volume(0);
    this.reverb = new Tone.Reverb({ decay: 1.8, wet: 0.2 });
    this.delay = new Tone.FeedbackDelay({ delayTime: 0.2, feedback: 0.2, wet: 0.1 });
    this.limiter = new Tone.Limiter(-1);
    this.volume.chain(this.reverb, this.delay, this.limiter, Tone.getDestination());
    Tone.Transport.bpm.value = this.bpm;
    // Instruments
    this.piano = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      attack: 0.002,
      release: 1.2,
      onload: () => {
        this.pianoReady = true;
      },
    }).connect(this.volume);

    const voiceOpts: Partial<Tone.FMSynthOptions> = {
      modulationIndex: 12,
      harmonicity: 2,
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8, attackCurve: "linear", releaseCurve: "exponential", decayCurve: "exponential" },
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.6, attackCurve: "linear", releaseCurve: "exponential", decayCurve: "exponential" },
    };
    this.keys = new Tone.PolySynth(Tone.FMSynth).connect(this.volume);
    this.keys.set({
      harmonicity: voiceOpts.harmonicity,
      modulationIndex: voiceOpts.modulationIndex,
      envelope: voiceOpts.envelope,
      modulationEnvelope: voiceOpts.modulationEnvelope,
    });

    this.drums = {
      kick: new Tone.MembraneSynth({ octaves: 2, pitchDecay: 0.02, envelope: { attack: 0.001, decay: 0.4, sustain: 0 } }).connect(this.volume),
      snare: new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(this.volume),
      hihat: new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.2, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000 }).connect(this.volume),
    };

    this.inited = true;
  };

  setInstrument(i: Instrument) {
    this.instrument = i;
  }
  setBpm(bpm: number) {
    this.bpm = bpm;
    Tone.Transport.bpm.rampTo(bpm, 0.05);
  }
  setMetronome(on: boolean) {
    if (on) {
      if (!Tone.Transport.state || Tone.Transport.state === "stopped") {
        Tone.Transport.start();
      }
      Tone.Transport.clear(this._metEventId ?? 0);
      this._metEventId = Tone.Transport.scheduleRepeat((time) => {
        const step = Math.floor((Tone.Transport.seconds * this.bpm) / 60) % 4;
        const freq = step === 0 ? 1200 : 800;
        const met = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 6, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).connect(this.volume);
        met.triggerAttackRelease(freq, 0.06, time, 0.5);
      }, "4n");
    } else {
      Tone.Transport.clear(this._metEventId ?? 0);
    }
  }
  private _metEventId?: number;

  setSustain(s: boolean) {
    this.sustain = s;
    if (!s) {
      // release any notes that were held by sustain
      for (const n of Array.from(this.active)) {
        this.noteOff(n);
      }
    }
  }

  setVolume(db: number) {
    this.volume.volume.rampTo(db, 0.05);
  }
  setReverb(wet: number) {
    this.reverb.wet.rampTo(wet, 0.05);
  }
  setDelay(wet: number) {
    this.delay.wet.rampTo(wet, 0.05);
  }
  setEnvelope(attack: number, release: number) {
    if (this.keys) {
      // apply to all voices
      this.keys.set({ envelope: { attack, release } });
    }
    if (this.piano) {
      this.piano.release = release;
    }
  }

  activeVoices() {
    return this.active.size;
  }

  async noteOn(note: string, velocity = 0.8) {
    await this.ensure();
    this.active.add(note);
    if (this.instrument === "piano") {
      if (this.pianoReady) {
        try {
          this.piano?.triggerAttack(note, Tone.now(), velocity);
        } catch (e) {
          // fallback silently if buffer not ready
          this.keys?.triggerAttack(note, Tone.now(), velocity);
        }
      } else {
        // Fallback to keys while samples load to avoid runtime errors
        this.keys?.triggerAttack(note, Tone.now(), velocity);
      }
    } else if (this.instrument === "keys") {
      this.keys?.triggerAttack(note, Tone.now(), velocity);
    } else {
      // drums: map some notes to kit pieces
      const pc = note.replace(/\d+$/, "");
      if (["C", "C#", "B"].includes(pc)) this.drums?.kick.triggerAttackRelease("C2", 0.2);
      else if (["D", "D#", "A"].includes(pc)) this.drums?.snare.triggerAttackRelease(0.2);
      else this.drums?.hihat.triggerAttackRelease("C6", "16n");
    }
  }

  noteOff(note: string) {
    if (this.sustain) return; // hold
    this.active.delete(note);
    if (this.instrument === "piano") {
      if (this.pianoReady) {
        try {
          this.piano?.triggerRelease(note, Tone.now());
        } catch (e) {
          this.keys?.triggerRelease(note, Tone.now());
        }
      } else {
        this.keys?.triggerRelease(note, Tone.now());
      }
    } else if (this.instrument === "keys") {
      this.keys?.triggerRelease(note, Tone.now());
    } else {
      // drums are one-shots
    }
  }

  schedule(when: number, cb: () => void) {
    Tone.Transport.schedule((time) => cb(), when);
    if (Tone.Transport.state !== "started") Tone.Transport.start();
  }

  now() {
    return Tone.Transport.seconds;
  }

  isPianoReady() {
    return this.pianoReady;
  }
}

let singleton: AudioEngine | null = null;
export function getEngine() {
  if (!singleton) singleton = new AudioEngine();
  return singleton;
}
