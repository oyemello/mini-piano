import { NOTE_NAMES, noteNameToMidi } from "@/lib/utils";

// Very small chord detector: major/minor/dim/aug and 7th variants
export function detectChord(notes: string[]): string | null {
  if (notes.length < 3) return null;
  const midis = Array.from(new Set(notes.map(noteNameToMidi))).sort((a, b) => a - b);
  // normalize to pitch classes
  const pcs = midis.map((m) => m % 12);

  // try each note as potential root
  for (let i = 0; i < pcs.length; i++) {
    const rootPc = pcs[i];
    const rel = new Set(pcs.map((p) => (p - rootPc + 12) % 12));
    // sevenths first
    if (has(rel, [0, 4, 7, 10])) return `${NOTE_NAMES[rootPc]}7`;
    if (has(rel, [0, 3, 7, 10])) return `${NOTE_NAMES[rootPc]}m7`;
    if (has(rel, [0, 4, 7, 11])) return `${NOTE_NAMES[rootPc]}maj7`;
    // triads
    if (has(rel, [0, 4, 7])) return `${NOTE_NAMES[rootPc]}maj`;
    if (has(rel, [0, 3, 7])) return `${NOTE_NAMES[rootPc]}min`;
    if (has(rel, [0, 3, 6])) return `${NOTE_NAMES[rootPc]}dim`;
    if (has(rel, [0, 4, 8])) return `${NOTE_NAMES[rootPc]}aug`;
  }
  return null;
}

function has(set: Set<number>, arr: number[]) {
  return arr.every((n) => set.has(n));
}
