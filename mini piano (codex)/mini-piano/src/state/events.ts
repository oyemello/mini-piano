export const noteOnBus = new EventTarget();

export type NoteOnEventDetail = { note: string; time: number };

export function emitNoteOn(note: string) {
  const ev = new CustomEvent<NoteOnEventDetail>("noteon", {
    detail: { note, time: performance.now() },
  });
  noteOnBus.dispatchEvent(ev);
}

