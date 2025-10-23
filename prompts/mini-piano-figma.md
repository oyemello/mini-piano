# Mini Piano (Figma) Prompt

Recreate the “Mini Piano App Development” Figma design in a Vite + React 18 + TypeScript project. Maintain pixel accuracy with the design file at https://www.figma.com/design/yxlwnyPT3Wo7zDfwHD11WD/Mini-Piano-App-Development while delivering a fully functional audio experience powered by Tone.js.

## Architecture
- Scaffold with Vite (`npm create vite@latest`) configured for React, SWC, and TypeScript.
- Centralize audio and UI state in a PianoContext provider that exposes the sampler, FM synth, drum kit, transport controls, lesson data, and recorder actions.
- Style with Tailwind CSS utilities (matching gradients, glass panels, rounded cards) and custom CSS modules where needed for piano key geometry.
- Use shadcn-inspired UI primitives (dialogs, switches, sliders, toasts) to reflect the design system.

## Functional Requirements
- On-screen 24-key piano with proper spacing for black keys, press/release animations, and optional note labels.
- Keyboard mapping that mirrors the Figma spec (QWERTY rows for white keys, ZXCV row for sharps/flats) with sustain toggle.
- Controls deck comprising:
  - Instrument picker (Piano, Electric Piano, Drums) with volume, reverb, delay, attack, release, transpose, and octave sliders.
  - Info panel summarizing active notes, chord name, metronome state, and recent history.
  - Trainer module supporting multiple lessons (Do-Re-Mi, Mary Had a Little Lamb, Twinkle Twinkle) with progress indicators and autoplay guidance.
  - Recorder with record/stop/play, timeline visualization, and JSON export/import of note events.
- Settings modal for theme toggle, key labels, sustain, latency compensation hints, and tutorial tips.
- Toast notification prompting the first click to unlock audio contexts.

## Interaction & UX
- Preserve layout hierarchy from the Figma frame: top bar with branding/actions, piano occupying full width, secondary panels arranged in responsive grid (stacked on mobile, 3-column on desktop).
- Smooth transitions and status badges for metronome, recording, and active lesson steps.
- Ensure metronome stays in sync with playback and trainer cues via Tone.Transport.
- Favor accessible semantics (aria-pressed, focus rings, descriptive labels) and support dark mode switch.

## Deliverables
- Fully typed React components residing under `src/components`, grouped by feature (Piano, Trainer, Recorder, Settings, UI).
- Context-backed hooks for audio actions and derived state (chords, history, lesson progress).
- Utility helpers for note <-> key mappings, lesson definitions, and formatting.
- Light documentation outlining how to add new lessons, instruments, or settings toggles.
