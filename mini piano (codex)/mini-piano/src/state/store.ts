import { create } from "zustand";
import { midiToNoteName, noteNameToMidi, clamp } from "@/lib/utils";
import { getEngine } from "@/lib/audio/engine";
import { emitNoteOn } from "@/state/events";
import { detectChord } from "@/lib/music/chords";

export type Instrument = "piano" | "keys" | "drums";

export type NoteEvent = {
  time: number; // relative seconds
  note: string;
  velocity: number;
  duration?: number;
  instrument: Instrument;
};

type TrainerState = {
  selectedLessonId: string | null;
  playing: boolean;
  accuracy: number; // 0..100
  streak: number;
  earlyLate: "early" | "late" | "on" | null;
};

type RecorderState = {
  isRecording: boolean;
  events: NoteEvent[];
  startTime: number | null;
};

export type AppState = {
  instrument: Instrument;
  transpose: number; // -12..+12
  octave: number; // -2..+2
  bpm: number;
  metronomeOn: boolean;
  sustain: boolean;
  showKeyLabels: boolean;
  highContrast: boolean;
  latencyComp: boolean;

  activeKeys: Map<string, string>; // keyboardKey -> noteName
  activeNotes: Set<string>;
  lastNotes: string[];
  chordName: string | null;
  polyphony: number;

  trainer: TrainerState;
  recorder: RecorderState;

  // actions
  setInstrument: (i: Instrument) => void;
  setBpm: (bpm: number) => void;
  toggleMetronome: () => void;
  setSustain: (s: boolean) => void;
  setTranspose: (t: number) => void;
  setOctave: (o: number) => void;
  setShowKeyLabels: (s: boolean) => void;
  setHighContrast: (s: boolean) => void;
  setLatencyComp: (s: boolean) => void;

  noteOn: (note: string, velocity?: number) => void;
  noteOff: (note: string) => void;
  keyDown: (kbdKey: string, note: string, velocity?: number) => void;
  keyUp: (kbdKey: string) => void;

  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  playRecording: () => Promise<void>;
  importRecording: (events: NoteEvent[]) => void;
  exportRecording: () => NoteEvent[];
};

export const useStore = create<AppState>((set, get) => ({
  instrument: "piano",
  transpose: 0,
  octave: 0,
  bpm: 100,
  metronomeOn: false,
  sustain: false,
  showKeyLabels: true,
  highContrast: false,
  latencyComp: true,

  activeKeys: new Map(),
  activeNotes: new Set(),
  lastNotes: [],
  chordName: null,
  polyphony: 0,

  trainer: { selectedLessonId: null, playing: false, accuracy: 0, streak: 0, earlyLate: null },
  recorder: { isRecording: false, events: [], startTime: null },

  setInstrument: (i) => {
    set({ instrument: i });
    getEngine().setInstrument(i);
  },
  setBpm: (bpm) => {
    set({ bpm });
    getEngine().setBpm(bpm);
  },
  toggleMetronome: () => {
    const on = !get().metronomeOn;
    set({ metronomeOn: on });
    getEngine().setMetronome(on);
  },
  setSustain: (s) => {
    set({ sustain: s });
    getEngine().setSustain(s);
  },
  setTranspose: (t) => set({ transpose: clamp(Math.round(t), -12, 12) }),
  setOctave: (o) => set({ octave: clamp(Math.round(o), -2, 2) }),
  setShowKeyLabels: (s) => set({ showKeyLabels: s }),
  setHighContrast: (s) => set({ highContrast: s }),
  setLatencyComp: (s) => set({ latencyComp: s }),

  noteOn: (note, velocity = 0.8) => {
    const t = get().transpose + get().octave * 12;
    const midi = noteNameToMidi(note) + t;
    const transposed = midiToNoteName(midi);
    getEngine().noteOn(transposed, velocity);
    const activeNotes = new Set(get().activeNotes);
    activeNotes.add(transposed);
    const lastNotes = [transposed, ...get().lastNotes].slice(0, 8);
    const chord = detectChord(Array.from(activeNotes));
    set({
      activeNotes,
      lastNotes,
      chordName: chord,
      polyphony: getEngine().activeVoices(),
    });
    // trainer tap
    emitNoteOn(transposed);
    const rec = get().recorder;
    if (rec.isRecording) {
      const now = getEngine().now();
      const start = rec.startTime ?? now;
      rec.events.push({
        time: now - start,
        note: transposed,
        velocity,
        instrument: get().instrument,
      });
      set({ recorder: { ...rec, startTime: start } });
    }
  },
  noteOff: (note) => {
    const t = get().transpose + get().octave * 12;
    const midi = noteNameToMidi(note) + t;
    const transposed = midiToNoteName(midi);
    getEngine().noteOff(transposed);
    const activeNotes = new Set(get().activeNotes);
    activeNotes.delete(transposed);
    const chord = detectChord(Array.from(activeNotes));
    set({ activeNotes, chordName: chord, polyphony: getEngine().activeVoices() });
    // update last recorded note duration if recording
    const rec = get().recorder;
    if (rec.isRecording) {
      const now = getEngine().now();
      // find last matching note without duration
      for (let i = rec.events.length - 1; i >= 0; i--) {
        const e = rec.events[i];
        if (e.note === transposed && e.duration == null) {
          e.duration = now - (rec.startTime ?? now) - e.time;
          break;
        }
      }
      set({ recorder: { ...rec } });
    }
  },
  keyDown: (kbdKey, note, velocity = 0.8) => {
    const map = new Map(get().activeKeys);
    if (map.has(kbdKey)) return; // prevent repeat
    map.set(kbdKey, note);
    set({ activeKeys: map });
    get().noteOn(note, velocity);
  },
  keyUp: (kbdKey) => {
    const map = new Map(get().activeKeys);
    const note = map.get(kbdKey);
    if (!note) return;
    map.delete(kbdKey);
    set({ activeKeys: map });
    if (!get().sustain) get().noteOff(note);
  },

  startRecording: () => set({ recorder: { isRecording: true, events: [], startTime: null } }),
  stopRecording: () => set({ recorder: { ...get().recorder, isRecording: false } }),
  clearRecording: () => set({ recorder: { isRecording: false, events: [], startTime: null } }),
  exportRecording: () => get().recorder.events,
  importRecording: (events) => set({ recorder: { isRecording: false, events: [...events], startTime: null } }),
  playRecording: async () => {
    const engine = getEngine();
    const events = get().recorder.events;
    if (!events.length) return;
    const start = engine.now() + 0.05;
    for (const ev of events) {
      engine.schedule(start + ev.time, () => engine.noteOn(ev.note, ev.velocity));
      const dur = ev.duration ?? 0.3;
      engine.schedule(start + ev.time + dur, () => engine.noteOff(ev.note));
    }
    return new Promise<void>((resolve) => engine.schedule(start + events.at(-1)!.time + (events.at(-1)!.duration ?? 0.3) + 0.1, resolve));
  },
}));
