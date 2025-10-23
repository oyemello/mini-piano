import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function midiToNoteName(midi: number): string {
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export function noteNameToMidi(note: string): number {
  const match = note.match(/^([A-G](?:#)?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const name = match[1];
  const oct = parseInt(match[2], 10);
  const idx = NOTE_NAMES.indexOf(name);
  if (idx < 0) throw new Error(`Invalid note name: ${note}`);
  return (oct + 1) * 12 + idx;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
