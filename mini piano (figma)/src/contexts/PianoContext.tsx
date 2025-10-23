import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export type InstrumentType = 'piano' | 'ep' | 'drums';

export interface NoteEvent {
  note: string;
  time: number;
  velocity: number;
  duration: number;
  instrument: InstrumentType;
}

export interface Recording {
  events: NoteEvent[];
  startTime: number;
}

interface PianoContextType {
  // Audio state
  activeNotes: Set<string>;
  pressedKeys: Map<string, string>; // key -> note
  currentInstrument: InstrumentType;
  setCurrentInstrument: (instrument: InstrumentType) => void;
  
  // Audio controls
  volume: number;
  setVolume: (volume: number) => void;
  reverb: number;
  setReverb: (reverb: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  attack: number;
  setAttack: (attack: number) => void;
  release: number;
  setRelease: (release: number) => void;
  transpose: number;
  setTranspose: (transpose: number) => void;
  octave: number;
  setOctave: (octave: number) => void;
  
  // Metronome
  bpm: number;
  setBpm: (bpm: number) => void;
  metronomeActive: boolean;
  setMetronomeActive: (active: boolean) => void;
  
  // Recording
  isRecording: boolean;
  recording: Recording | null;
  startRecording: () => void;
  stopRecording: () => void;
  playRecording: () => void;
  clearRecording: () => void;
  
  // Trainer
  activeLesson: string | null;
  setActiveLesson: (lesson: string | null) => void;
  lessonProgress: number;
  setLessonProgress: (progress: number) => void;
  
  // Settings
  showKeyLabels: boolean;
  setShowKeyLabels: (show: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  sustainEnabled: boolean;
  setSustainEnabled: (enabled: boolean) => void;
  
  // Note history
  noteHistory: Array<{ note: string; key: string; time: number }>;
  
  // Audio methods
  playNote: (note: string, key?: string) => void;
  stopNote: (note: string, key?: string) => void;
}

const PianoContext = createContext<PianoContextType | null>(null);

export function usePiano() {
  const context = useContext(PianoContext);
  if (!context) {
    throw new Error('usePiano must be used within PianoProvider');
  }
  return context;
}

export function PianoProvider({ children }: { children: React.ReactNode }) {
  // Audio state
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [pressedKeys, setPressedKeys] = useState<Map<string, string>>(new Map());
  const [currentInstrument, setCurrentInstrument] = useState<InstrumentType>('piano');
  
  // Audio controls
  const [volume, setVolume] = useState(0.8);
  const [reverb, setReverb] = useState(0.3);
  const [delay, setDelay] = useState(0.2);
  const [attack, setAttack] = useState(0.005);
  const [release, setRelease] = useState(1.0);
  const [transpose, setTranspose] = useState(0);
  const [octave, setOctave] = useState(0);
  
  // Metronome
  const [bpm, setBpm] = useState(120);
  const [metronomeActive, setMetronomeActive] = useState(false);
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Recording | null>(null);
  const recordingEvents = useRef<NoteEvent[]>([]);
  const recordingStartTime = useRef<number>(0);
  
  // Trainer
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState(0);
  
  // Settings
  const [showKeyLabels, setShowKeyLabels] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sustainEnabled, setSustainEnabled] = useState(false);
  
  // Note history
  const [noteHistory, setNoteHistory] = useState<Array<{ note: string; key: string; time: number }>>([]);
  
  // Audio refs
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const drumKitRef = useRef<Tone.Players | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const metronomeRef = useRef<Tone.Loop | null>(null);
  const metronomeSynthRef = useRef<Tone.Synth | null>(null);
  
  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      await Tone.start();
      
      // Create effects chain
      reverbRef.current = new Tone.Reverb({ decay: 2.5, wet: reverb }).toDestination();
      delayRef.current = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: delay }).connect(reverbRef.current);
      volumeRef.current = new Tone.Volume({ volume: Tone.gainToDb(volume) }).connect(delayRef.current);
      
      // Create piano sampler
      samplerRef.current = new Tone.Sampler({
        urls: {
          C4: 'C4',
          'D#4': 'Ds4',
          'F#4': 'Fs4',
          A4: 'A4',
        },
        release: 1,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
      }).connect(volumeRef.current);
      
      // Create EP synth
      synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 14,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.008, decay: 0.3, sustain: 0.4, release: 0.8 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.006, decay: 0.2, sustain: 0.3, release: 0.6 },
      }).connect(volumeRef.current);
      
      // Create metronome
      metronomeSynthRef.current = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      }).toDestination();
      
      metronomeRef.current = new Tone.Loop((time) => {
        metronomeSynthRef.current?.triggerAttackRelease('C6', '32n', time, 0.5);
      }, '4n');
    };
    
    initAudio();
    
    return () => {
      synthRef.current?.dispose();
      samplerRef.current?.dispose();
      drumKitRef.current?.dispose();
      reverbRef.current?.dispose();
      delayRef.current?.dispose();
      volumeRef.current?.dispose();
      metronomeRef.current?.dispose();
      metronomeSynthRef.current?.dispose();
    };
  }, []);
  
  // Update effects
  useEffect(() => {
    if (reverbRef.current) reverbRef.current.wet.value = reverb;
  }, [reverb]);
  
  useEffect(() => {
    if (delayRef.current) delayRef.current.wet.value = delay;
  }, [delay]);
  
  useEffect(() => {
    if (volumeRef.current) volumeRef.current.volume.value = Tone.gainToDb(volume);
  }, [volume]);
  
  // Update metronome
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);
  
  useEffect(() => {
    if (metronomeActive) {
      Tone.Transport.start();
      metronomeRef.current?.start(0);
    } else {
      metronomeRef.current?.stop();
      Tone.Transport.stop();
    }
  }, [metronomeActive]);
  
  const playNote = useCallback((note: string, key?: string) => {
    // Apply transpose and octave
    const midiNote = Tone.Frequency(note).toMidi();
    const transposedMidi = midiNote + transpose + (octave * 12);
    const transposedNote = Tone.Frequency(transposedMidi, 'midi').toNote();
    
    setActiveNotes(prev => new Set(prev).add(transposedNote));
    if (key) {
      setPressedKeys(prev => new Map(prev).set(key, transposedNote));
    }
    
    // Add to history
    setNoteHistory(prev => [...prev.slice(-7), { note: transposedNote, key: key || 'click', time: Date.now() }]);
    
    // Play based on instrument
    if (currentInstrument === 'piano' && samplerRef.current) {
      samplerRef.current.triggerAttack(transposedNote, undefined, 1);
    } else if (currentInstrument === 'ep' && synthRef.current) {
      synthRef.current.triggerAttack(transposedNote, undefined, 1);
    } else if (currentInstrument === 'drums') {
      // Simplified drum mapping
      const drumSynth = new Tone.MembraneSynth().toDestination();
      drumSynth.triggerAttackRelease(transposedNote, '8n');
    }
    
    // Record if active
    if (isRecording) {
      recordingEvents.current.push({
        note: transposedNote,
        time: Tone.now() - recordingStartTime.current,
        velocity: 1,
        duration: 0.5,
        instrument: currentInstrument,
      });
    }
  }, [currentInstrument, transpose, octave, isRecording]);
  
  const stopNote = useCallback((note: string, key?: string) => {
    const midiNote = Tone.Frequency(note).toMidi();
    const transposedMidi = midiNote + transpose + (octave * 12);
    const transposedNote = Tone.Frequency(transposedMidi, 'midi').toNote();
    
    if (!sustainEnabled) {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(transposedNote);
        return next;
      });
      
      if (currentInstrument === 'piano' && samplerRef.current) {
        samplerRef.current.triggerRelease(transposedNote);
      } else if (currentInstrument === 'ep' && synthRef.current) {
        synthRef.current.triggerRelease(transposedNote);
      }
    }
    
    if (key) {
      setPressedKeys(prev => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    }
  }, [currentInstrument, transpose, octave, sustainEnabled]);
  
  const startRecording = useCallback(() => {
    recordingEvents.current = [];
    recordingStartTime.current = Tone.now();
    setIsRecording(true);
  }, []);
  
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setRecording({
      events: recordingEvents.current,
      startTime: recordingStartTime.current,
    });
  }, []);
  
  const playRecording = useCallback(() => {
    if (!recording) return;
    
    recording.events.forEach(event => {
      Tone.Transport.schedule((time) => {
        if (currentInstrument === 'piano' && samplerRef.current) {
          samplerRef.current.triggerAttackRelease(event.note, event.duration, time, event.velocity);
        } else if (currentInstrument === 'ep' && synthRef.current) {
          synthRef.current.triggerAttackRelease(event.note, event.duration, time, event.velocity);
        }
      }, event.time);
    });
    
    Tone.Transport.start();
  }, [recording, currentInstrument]);
  
  const clearRecording = useCallback(() => {
    setRecording(null);
    recordingEvents.current = [];
  }, []);
  
  const value: PianoContextType = {
    activeNotes,
    pressedKeys,
    currentInstrument,
    setCurrentInstrument,
    volume,
    setVolume,
    reverb,
    setReverb,
    delay,
    setDelay,
    attack,
    setAttack,
    release,
    setRelease,
    transpose,
    setTranspose,
    octave,
    setOctave,
    bpm,
    setBpm,
    metronomeActive,
    setMetronomeActive,
    isRecording,
    recording,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
    activeLesson,
    setActiveLesson,
    lessonProgress,
    setLessonProgress,
    showKeyLabels,
    setShowKeyLabels,
    darkMode,
    setDarkMode,
    sustainEnabled,
    setSustainEnabled,
    noteHistory,
    playNote,
    stopNote,
  };
  
  return <PianoContext.Provider value={value}>{children}</PianoContext.Provider>;
}
