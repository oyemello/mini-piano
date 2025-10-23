# Piano (v0 Codex) Prompt

Develop a polished Next.js piano trainer that blends immersive visuals with deep interactivity. Target Next.js 14 App Router with TypeScript, Tailwind CSS (utility-first styling), and custom Web Audio graph management—do not rely on Tone.js.

## Feature Set
- Responsive keyboard spanning A–] on the QWERTY row (14 white keys) plus mapped black keys (`1 2 4 5 6 8 9 - = Backspace`). Reflect press states on screen with smooth transitions, sustain, and optional key labels.
- Dynamic display modes:
  - Marquee idle state cycling inspirational messages.
  - Real-time note marquee when single notes are pressed.
  - Lesson overlay guiding target keys step-by-step.
  - Celebration flash when lessons complete.
- Lesson system containing Twinkle Twinkle, Mary Had a Little Lamb, C Major scale, and a basic chord progression. Track progress, statuses, and allow restarts.
- Integrated metronome with user-set BPM (30–300) and visual beat indicator. Maintain tight timing even while recording.
- Recording pipeline capturing note events with source metadata, generating downloadable WAV files using manual channel buffering and `AudioBuffer`.
- Instrument selector (Piano, Organ, Synth) that swaps oscillator waveforms and release curves; manage gain staging through a reusable `AudioGraph`.

## Technical Constraints
- Build on the Web Audio API: create one shared `AudioContext`, maintain Oscillator + Gain nodes per active key, handle release timing, and clean up on key up or route changes.
- Optimize layout for horizontal resizing: compute key widths/heights based on container measurements and realign black keys accordingly.
- Use React hooks (`useMemo`, `useCallback`, refs) to keep audio graph and timing stable; avoid recreating nodes unnecessarily.
- Implement keyboard listeners for keydown/keyup with repeat prevention, focus management, and support for special keys (Backspace for top A#).
- Persist download URLs cleanly; revoke object URLs when recordings are cleared.

## UX Guidance
- Provide top-level controls for instrument, metronome toggle, BPM entry, lesson picker (modal with progress badges), recorder (record/stop/finalize/playback/download), and key label toggle.
- Offer helpful toasts or inline hints for unlocking audio, handling invalid BPM input, and confirming recording completion.
- Ensure accessibility via aria attributes, focus outlines, and descriptive labels on controls and key elements.
