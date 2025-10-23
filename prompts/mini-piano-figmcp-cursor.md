# Mini Piano + Figma MCP Prompt

Build a dual-purpose repository that ships both a Next.js piano web app and a Node-based MCP server exposing Figma tooling. Keep the two concerns organized but documented side by side.

## Mini Piano Web App
- Framework: Next.js 14 App Router with React 18 and client components for the interactive UI.
- Render a responsive 3-octave piano with mouse/touch input, QWERTY keyboard bindings (`A`–`;` for whites, `Z`–`/` for accidentals), sustain, metronome, lesson selector, and recorder playback.
- Manage Web Audio API graph manually (AudioContext, GainNode, per-note oscillators) without Tone.js—support sine/triangle/saw/square waveforms chosen by an instrument dropdown.
- Track pressed notes, history timeline, BPM, metronome beats, and recorded sessions in state; provide play/pause/reset controls.
- Include a lesson deck (`Do-Re-Mi`, `Mary Had a Little Lamb`, `Twinkle Twinkle`, `Happy Birthday`, `Chopsticks`) with highlighted target notes and step-through instructions.
- Respect browser autoplay policies by prompting for an initial click to unlock audio.

## Figma MCP Server
- Implement `index.js` as a Model Context Protocol server using `@modelcontextprotocol/sdk` over stdio.
- Load Figma credentials from `.env` (`FIGMA_ACCESS_TOKEN`) and expose tools:
  - `get_figma_file({ fileKey })`
  - `get_figma_node({ fileKey, nodeId })`
  - `search_figma_nodes({ fileKey, query })`
- Provide graceful error messages for missing tokens, API failures, and invalid parameters.
- Document quickstart steps: copy `env.example`, install dependencies, run `node index.js`.

## Repo Expectations
- Keep legacy static `src/` React files for reference but flag them as non-production in documentation.
- Supply usage notes on coordinating piano recordings, exporting data, and unlocking audio.
- Outline how the MCP server integrates with agent tooling (stdin/stdout lifecycle, request schema, example invocations).
