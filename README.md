# Mini Piano Project Collection

This workspace bundles four separate front-end piano experiences along with tailored generation prompts. Use the new `prompts/` directory when you want to recreate or iterate on any individual build.

## Projects & Installation

### `mini piano (codex)/mini-piano`
- Description: Prompt was given to Codex in VS Code to make the mini-piano.
- Stack: Next.js 15, React 19, Tailwind CSS v4, Tone.js, Zustand, Vitest.
- Install dependencies: `cd "mini piano (codex)/mini-piano" && npm install`.
- Start the dev server: `npm run dev` (listens on http://localhost:3000).
- Useful extras: `npm test` runs Vitest suites, `npm run lint` checks ESLint.

### `mini piano (figma)`
- Description: Mini-piano was made by giving a prompt to Figma make.
- Stack: Vite + React 18 with Tone.js and shadcn-style components.
- Install dependencies: `cd "mini piano (figma)" && npm install`.
- Launch locally: `npm run dev` (Vite defaults to http://localhost:5173).

### `mini piano (figmcp cursor)`
- Description: Mini-piano was designed in Figma, made in Cursor via Figma MCP
- Stack: Next.js 14 web app plus a standalone Node MCP server for Figma tooling.
- Web app:
  - `cd "mini piano (figmcp cursor)" && npm install`
  - `npm run dev` to start Next.js (typically http://localhost:3000).
- MCP server:
  1. Copy `env.example` to `.env` and set `FIGMA_ACCESS_TOKEN`.
  2. Install server deps (if not already present): `npm install @modelcontextprotocol/sdk figma-api dotenv`.
  3. Run with `node index.js` (communicates via stdio for MCP-compatible agents).

### `piano (v0 codex)`
- Description: Mini-piano was designed in v0 using a prompt, made in VS Code using Codex.
- Stack: Next.js 14, React 18, Tailwind CSS, custom Web Audio implementation.
- Install dependencies: `cd "piano (v0 codex)" && npm install` (or `pnpm install`).
- Start developing: `npm run dev` (Next.js dev server on http://localhost:3000).

> All projects require at least Node.js 18+. Align the package manager (npm/pnpm) with the provided lockfiles for consistent tooling.
