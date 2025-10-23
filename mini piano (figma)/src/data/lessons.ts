export interface LessonStep {
  instruction: string;
  notes: string[];
  duration?: number;
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  steps: LessonStep[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'do-re-mi',
    name: 'Do-Re-Mi (C Major Scale)',
    description: 'Learn the basic C major scale',
    steps: [
      { instruction: 'Play C', notes: ['C4'] },
      { instruction: 'Play D', notes: ['D4'] },
      { instruction: 'Play E', notes: ['E4'] },
      { instruction: 'Play F', notes: ['F4'] },
      { instruction: 'Play G', notes: ['G4'] },
      { instruction: 'Play A', notes: ['A4'] },
      { instruction: 'Play B', notes: ['B4'] },
      { instruction: 'Play C (octave)', notes: ['C5'] },
    ],
  },
  {
    id: 'twinkle',
    name: 'Twinkle Twinkle (Excerpt)',
    description: 'Play the opening of Twinkle Twinkle Little Star',
    steps: [
      { instruction: 'Twin-', notes: ['C4'] },
      { instruction: '-kle', notes: ['C4'] },
      { instruction: 'twin-', notes: ['G4'] },
      { instruction: '-kle', notes: ['G4'] },
      { instruction: 'lit-', notes: ['A4'] },
      { instruction: '-tle', notes: ['A4'] },
      { instruction: 'star', notes: ['G4'] },
    ],
  },
  {
    id: 'chords-basic',
    name: 'Basic Chords',
    description: 'Learn C, F, G, and Am chords',
    steps: [
      { instruction: 'Play C major chord (C-E-G)', notes: ['C4', 'E4', 'G4'] },
      { instruction: 'Play F major chord (F-A-C)', notes: ['F4', 'A4', 'C5'] },
      { instruction: 'Play G major chord (G-B-D)', notes: ['G4', 'B4', 'D5'] },
      { instruction: 'Play A minor chord (A-C-E)', notes: ['A4', 'C5', 'E5'] },
    ],
  },
  {
    id: 'intervals',
    name: 'Musical Intervals',
    description: 'Practice recognizing intervals',
    steps: [
      { instruction: 'Perfect Unison (same note)', notes: ['C4'] },
      { instruction: 'Major Second (C to D)', notes: ['C4', 'D4'] },
      { instruction: 'Major Third (C to E)', notes: ['C4', 'E4'] },
      { instruction: 'Perfect Fourth (C to F)', notes: ['C4', 'F4'] },
      { instruction: 'Perfect Fifth (C to G)', notes: ['C4', 'G4'] },
      { instruction: 'Octave (C to C)', notes: ['C4', 'C5'] },
    ],
  },
];
