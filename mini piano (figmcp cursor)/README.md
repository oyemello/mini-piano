Mini Piano + Figma MCP

Overview
- Mini Piano: A browser-based piano with mouse/touch and keyboard controls, simple metronome, recording/playback, and basic instrument waveforms.
- Figma MCP Server: A Model Context Protocol (MCP) server exposing simple Figma API tools over stdio for agent integrations.

Project Structure
- `app/` — Next.js App Router files (`page.jsx`, `layout.jsx`, `globals.css`).
- `src/` — Legacy React (Vite) files kept for reference (`App.jsx`, `styles.css`).
- `index.js` — MCP server for Figma (Node.js + stdio transport).
- `env.example` — Example environment variables for Figma access.

Running the Mini Piano (Next.js)
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Open the printed local URL (usually `http://localhost:3000`).
- First click unlocks audio due to browser autoplay policies.
- Controls:
  - Mouse/touch on keys
  - Keyboard mapping: A S D F G H J K L ; ' for white keys, Z X C V B N M , . / for accidentals.
  - Metronome and Record buttons in the dashboard

Notes
- Recording collects notes you play and replays them at a fixed tempo.
- Instrument selects oscillator waveform (sine/triangle/saw/square).
- Lessons: simple prompt-driven selector; updates the note chips.
- Legacy static files (`index.html`, root `styles.css`, `script.js`) are not used by Next.js.

Running the Figma MCP Server
1) Copy `env.example` to `.env` and set `FIGMA_ACCESS_TOKEN`.
2) Install dependencies:
   - `npm init -y`
   - `npm install @modelcontextprotocol/sdk figma-api dotenv`
3) Start the server:
   - `node index.js`

MCP Tools
- `get_figma_file({ fileKey })`
- `get_figma_node({ fileKey, nodeId })`
- `search_figma_nodes({ fileKey, query })`

Known Limitations / TODOs
- Black key layout uses fixed pixel offsets; may not align perfectly on small screens.
- Recording playback uses fixed timing; does not preserve exact rhythm.
- The MCP server runs over stdio; `.env` values for host/port are placeholders.
