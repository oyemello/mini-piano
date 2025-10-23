// Keyboard to note mapping
export const KEY_TO_NOTE: Record<string, string> = {
  // Bottom row (white keys) - C4 to E5
  'z': 'C4',
  'x': 'D4',
  'c': 'E4',
  'v': 'F4',
  'b': 'G4',
  'n': 'A4',
  'm': 'B4',
  ',': 'C5',
  '.': 'D5',
  '/': 'E5',
  
  // Middle row (white keys) - C5 to E6
  'a': 'C5',
  's': 'D5',
  'd': 'E5',
  'f': 'F5',
  'g': 'G5',
  'h': 'A5',
  'j': 'B5',
  'k': 'C6',
  'l': 'D6',
  ';': 'E6',
  
  // Black keys for bottom row
  '1': 'C#4',
  '2': 'D#4',
  '4': 'F#4',
  '5': 'G#4',
  '6': 'A#4',
  '8': 'C#5',
  '9': 'D#5',
  
  // Black keys for middle row
  'q': 'C#5',
  'w': 'D#5',
  'e': 'F#5',
  't': 'G#5',
  'y': 'A#5',
  'i': 'C#6',
  'o': 'D#6',
};

export const NOTE_TO_KEYS: Record<string, string[]> = Object.entries(KEY_TO_NOTE).reduce(
  (acc, [key, note]) => {
    if (!acc[note]) acc[note] = [];
    acc[note].push(key);
    return acc;
  },
  {} as Record<string, string[]>
);

// Piano keys layout (for visual display)
export const PIANO_KEYS = [
  { note: 'C4', color: 'white', octave: 4 },
  { note: 'C#4', color: 'black', octave: 4 },
  { note: 'D4', color: 'white', octave: 4 },
  { note: 'D#4', color: 'black', octave: 4 },
  { note: 'E4', color: 'white', octave: 4 },
  { note: 'F4', color: 'white', octave: 4 },
  { note: 'F#4', color: 'black', octave: 4 },
  { note: 'G4', color: 'white', octave: 4 },
  { note: 'G#4', color: 'black', octave: 4 },
  { note: 'A4', color: 'white', octave: 4 },
  { note: 'A#4', color: 'black', octave: 4 },
  { note: 'B4', color: 'white', octave: 4 },
  
  { note: 'C5', color: 'white', octave: 5 },
  { note: 'C#5', color: 'black', octave: 5 },
  { note: 'D5', color: 'white', octave: 5 },
  { note: 'D#5', color: 'black', octave: 5 },
  { note: 'E5', color: 'white', octave: 5 },
  { note: 'F5', color: 'white', octave: 5 },
  { note: 'F#5', color: 'black', octave: 5 },
  { note: 'G5', color: 'white', octave: 5 },
  { note: 'G#5', color: 'black', octave: 5 },
  { note: 'A5', color: 'white', octave: 5 },
  { note: 'A#5', color: 'black', octave: 5 },
  { note: 'B5', color: 'white', octave: 5 },
  
  { note: 'C6', color: 'white', octave: 6 },
  { note: 'C#6', color: 'black', octave: 6 },
  { note: 'D6', color: 'white', octave: 6 },
  { note: 'D#6', color: 'black', octave: 6 },
  { note: 'E6', color: 'white', octave: 6 },
];

export function getKeyLabel(note: string): string {
  const keys = NOTE_TO_KEYS[note];
  if (!keys || keys.length === 0) return '';
  return keys[0].toUpperCase();
}
