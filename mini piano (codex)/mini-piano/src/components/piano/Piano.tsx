"use client";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/state/store";
import { midiToNoteName, noteNameToMidi, cn } from "@/lib/utils";

function isBlack(midi: number) {
  const pc = midi % 12;
  return [1, 3, 6, 8, 10].includes(pc);
}

function buildWhiteRange(): string[] {
  const whites: string[] = [];
  let m = noteNameToMidi("C3");
  while (whites.length < 24) {
    if (!isBlack(m)) whites.push(midiToNoteName(m));
    m++;
  }
  return whites;
}

function buildAllKeys(whites: string[]): { white: string[]; black: string[] } {
  const all = new Set<string>();
  for (const w of whites) {
    const wm = noteNameToMidi(w);
    all.add(w);
    // add black keys preceding D,E,G,A,B (i.e., C#, D#, F#, G#, A#)
    const pc = wm % 12;
    const add = [0, 2, 5, 7, 9].includes(pc);
    if (add) {
      const bm = wm + 1;
      all.add(midiToNoteName(bm));
    }
  }
  const white = Array.from(all).filter((n) => !isBlack(noteNameToMidi(n))).sort((a, b) => noteNameToMidi(a) - noteNameToMidi(b));
  const black = Array.from(all).filter((n) => isBlack(noteNameToMidi(n))).sort((a, b) => noteNameToMidi(a) - noteNameToMidi(b));
  return { white, black };
}

export function Piano() {
  const whites = useMemo(buildWhiteRange, []);
  const { white, black } = useMemo(() => buildAllKeys(whites), [whites]);
  const noteOn = useStore((s) => s.noteOn);
  const noteOff = useStore((s) => s.noteOff);
  const active = useStore((s) => s.activeNotes);
  const showLabels = useStore((s) => s.showKeyLabels);
  const highContrast = useStore((s) => s.highContrast);
  const [isDown, setDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (note: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDown(true);
    noteOn(note, 0.85);
  };
  const onPointerUp = (note: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    setDown(false);
    noteOff(note);
  };
  const onPointerEnter = (note: string) => (e: React.PointerEvent) => {
    if (isDown) noteOn(note, 0.7);
  };
  const onPointerLeave = (note: string) => (e: React.PointerEvent) => {
    if (isDown) noteOff(note);
  };

  const whiteKey = (note: string, idx: number) => (
    <div
      key={note}
      role="button"
      aria-label={note}
      aria-pressed={active.has(note)}
      tabIndex={0}
      onPointerDown={onPointerDown(note)}
      onPointerUp={onPointerUp(note)}
      onPointerEnter={onPointerEnter(note)}
      onPointerLeave={onPointerLeave(note)}
      className={cn(
        "relative select-none w-10 sm:w-11 md:w-12 h-40 sm:h-48 md:h-56 border border-border bg-white text-black flex items-end justify-center pb-2",
        active.has(note) && "bg-gray-200",
        highContrast && "outline outline-2 outline-black"
      )}
    >
      {showLabels && <span className="text-[10px] sm:text-xs opacity-70">{note}</span>}
    </div>
  );

  const blackKey = (note: string, leftIndex: number) => (
    <div
      key={note}
      role="button"
      aria-label={note}
      aria-pressed={active.has(note)}
      tabIndex={0}
      onPointerDown={onPointerDown(note)}
      onPointerUp={onPointerUp(note)}
      onPointerEnter={onPointerEnter(note)}
      onPointerLeave={onPointerLeave(note)}
      className={cn(
        "absolute -translate-x-1/2 z-10 w-6 sm:w-7 md:w-8 h-24 sm:h-28 md:h-32 bg-black text-white border border-black flex items-end justify-center pb-1 rounded-b",
        active.has(note) && "bg-neutral-700",
        highContrast && "outline outline-2 outline-white"
      )}
      style={{ left: `${(leftIndex + 1) * 100 / whites.length}%` }}
    >
      {showLabels && <span className="text-[9px] opacity-80">{note}</span>}
    </div>
  );

  // Map black key positions over whites: place between surrounding whites
  const blackPositions: Array<{ note: string; pos: number }> = [];
  for (let i = 0; i < white.length; i++) {
    const wm = noteNameToMidi(white[i]);
    const pc = wm % 12;
    if ([0, 2, 5, 7, 9].includes(pc)) {
      const bn = midiToNoteName(wm + 1);
      if (black.includes(bn)) blackPositions.push({ note: bn, pos: i });
    }
  }

  return (
    <div ref={containerRef} className="relative" aria-label="Piano" role="group">
      <div className="relative flex gap-[2px] bg-black/10 p-1 rounded-md">
        {white.map(whiteKey)}
        {blackPositions.map(({ note, pos }) => blackKey(note, pos))}
      </div>
    </div>
  );
}

