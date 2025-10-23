# Mini Piano (Codex) Prompt

You are an expert Next.js engineer building a polyphonic piano trainer for the web. Implement an App Router project using TypeScript, Tailwind CSS v4, Radix UI primitives with shadcn-inspired components, Zustand for state, and Tone.js for audio.

## Core Features
- Responsive 24-key piano rendered on screen with accurate layout for white and black keys.
- Computer keyboard support with the following mapping:
  - White keys lower row: `Z X C V B N M , . /` → `C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`.
  - White keys upper row: `A S D F G H J K L ;` → `C5 D5 E5 F5 G5 A5 B5 C6 D6 E6`.
  - Black keys: `1 2 4 5 6` → `C#4 D#4 F#4 G#4 A#4`; `Q W E T Y U` → `C#5 D#5 F#5 G#5 A#5 C#6`.
  - Hold-to-sustain behavior with optional sustain modifier when Shift is held.
- “Now Playing” panel showing pressed keys, interpreted chord name, instrument settings, BPM, sustain state, and the last eight notes.
- Instrument selector with at least: Grand Piano (multisampled), Electric Piano (FM synth), and Drum Kit. Global controls for volume, reverb, delay, ADSR, transpose ±12 semitones, and octave offsets.
- Lesson trainer with built-in sequences (Do-Re-Mi, Twinkle excerpt, basic triads) and playback guidance synchronized to a metronome. Provide accuracy and timing feedback plus looping over selectable beat ranges.
- Recording workflow that captures note events, plays them back, and supports JSON import/export.
- Settings drawer with toggles for latency compensation, key labels, high-contrast mode, and Web MIDI input detection.

## Technical Notes
- Use Tone.js to handle polyphony, sampler loading, effects routing, metronome, and playback timing.
- Manage global performance state with Zustand stores; ensure derived state (e.g., pressed chords) is memoized.
- Keep accessibility in mind: aria roles and keyboard focus on keys, high-contrast outlines, descriptive labels.
- Provide Vitest coverage for note mapping and chord detection utilities.
- Follow shadcn/ui design language for panels, tabs, sliders, and toasts.

## UX Expectations
- First user gesture should unlock audio; surface a toast reminder if needed.
- Layout must remain fluid from mobile to desktop, with the piano occupying full width above supporting panels.
- Display shortcuts like `[`/`]` for octave and `-`/`=` for transpose, `Space` for metronome, and `R` to toggle recording.
- Favor smooth transitions and micro-interactions (key press states, meter animations) without degrading audio timing.
