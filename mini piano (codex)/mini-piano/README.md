Mini Piano (Keyboard + Trainer)

Tech
- Next.js (App Router) + React + Tailwind CSS v4
- Audio: Tone.js (polyphony, sampler, synths)
- UI: shadcn-style components using Radix primitives, lucide-react icons
- State: Zustand
- Tests: Vitest

Run
```
npm i
npm run dev
```
Open http://localhost:3000

Features
- Computer keyboard input (polyphonic):
  - Whites (lower row): Z X C V B N M , . / → C4 D4 E4 F4 G4 A4 B4 C5 D5 E5
  - Whites (upper row): A S D F G H J K L ; → C5 D5 E5 F5 G5 A5 B5 C6 D6 E6
  - Blacks: 1 2 4 5 6 → C#4 D#4 F#4 G#4 A#4; Q W E T Y U → C#5 D#5 F#5 G#5 A#5 C#6
  - Hold = sustain on keyup; optional Sustain = hold Shift
- On-screen piano
  - 24 white keys with matching black keys, responsive, accessible (aria-pressed, keyboard focus)
- Now Playing panel
  - Shows pressed keys (A → C4), chord name, instrument, BPM, sustain, polyphony, last 8 notes
- Instruments
  - Grand Piano (multi-sampled Sampler using Tone Salamander), EP/Keys (FM synth), Drums (kick/snare/hat)
  - Global: Volume, Reverb, Delay, Attack/Release, Transpose ±12, Octave −2…+2
- Trainer
  - Built-in lessons: Do-Re-Mi, Twinkle (excerpt), Basic chords
  - Guided playback synced to metronome, step highlight
  - Grading: accuracy %, timing (early/late), streaks
  - Loops: select beat range and loop, speed 70–100%
- Recorder
  - Record/Stop/Play performance (MIDI-like event list)
  - Export/Import JSON of note events
- Settings
  - Latency compensation toggle (placeholder), Show Key Labels, High Contrast
  - MIDI Input: auto-detect if Web MIDI available

Shortcuts
- [ / ] = Octave −/+
- - / = = Transpose −/+
- Space = Metronome on/off
- R = Record toggle
- Shift = Sustain

Adding Lessons
- Put JSON files in `src/data/lessons/*.json`
- Shape:
```
{
  "id": "unique-id",
  "title": "Lesson Title",
  "bpm": 90,
  "events": [
    { "time": 0, "note": "C4", "duration": 1, "velocity": 0.9 },
    ...
  ]
}
```

Adding Instruments
- See `src/lib/audio/engine.ts`.
- Add a new instrument type, create its Tone synth/sampler, and update `noteOn` / `noteOff` accordingly.

Testing
- `npm test` runs unit tests for note mapping and chord detection.

Accessibility
- Keys have `aria-label` and `aria-pressed`.
- Full keyboard control mirrors on-screen controls.
- High-contrast outlines available from Settings.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
