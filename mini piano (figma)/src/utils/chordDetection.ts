import * as Tone from 'tone';

interface ChordPattern {
  name: string;
  intervals: number[];
}

const CHORD_PATTERNS: ChordPattern[] = [
  { name: 'maj', intervals: [0, 4, 7] },
  { name: 'min', intervals: [0, 3, 7] },
  { name: 'dim', intervals: [0, 3, 6] },
  { name: 'aug', intervals: [0, 4, 8] },
  { name: '7', intervals: [0, 4, 7, 10] },
  { name: 'maj7', intervals: [0, 4, 7, 11] },
  { name: 'min7', intervals: [0, 3, 7, 10] },
  { name: 'sus2', intervals: [0, 2, 7] },
  { name: 'sus4', intervals: [0, 5, 7] },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function detectChord(notes: string[]): string | null {
  if (notes.length < 3) return null;
  
  try {
    // Convert notes to MIDI numbers
    const midiNotes = notes.map(note => Tone.Frequency(note).toMidi()).sort((a, b) => a - b);
    
    // Get unique pitch classes (mod 12)
    const pitchClasses = [...new Set(midiNotes.map(n => n % 12))].sort((a, b) => a - b);
    
    if (pitchClasses.length < 3) return null;
    
    // Try each note as root
    for (let rootIdx = 0; rootIdx < pitchClasses.length; rootIdx++) {
      const root = pitchClasses[rootIdx];
      
      // Calculate intervals from this root
      const intervals = pitchClasses.map(pc => (pc - root + 12) % 12).sort((a, b) => a - b);
      
      // Check against known patterns
      for (const pattern of CHORD_PATTERNS) {
        if (intervalsMatch(intervals, pattern.intervals)) {
          const rootName = NOTE_NAMES[root];
          return `${rootName}${pattern.name}`;
        }
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

function intervalsMatch(actual: number[], pattern: number[]): boolean {
  if (actual.length < pattern.length) return false;
  
  for (let i = 0; i < pattern.length; i++) {
    if (!actual.includes(pattern[i])) return false;
  }
  
  return true;
}
