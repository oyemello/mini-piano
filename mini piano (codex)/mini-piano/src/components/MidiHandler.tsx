"use client";
import { useEffect } from "react";
import { useStore } from "@/state/store";
import { midiToNoteName } from "@/lib/utils";

export function MidiHandler() {
  const noteOn = useStore((s) => s.noteOn);
  const noteOff = useStore((s) => s.noteOff);

  useEffect(() => {
    type MIDIMessageEvent = { data: Uint8Array };
    type MIDIInput = { onmidimessage: ((e: MIDIMessageEvent) => void) | null };
    type MIDIAccess = { inputs: { values: () => Iterable<MIDIInput> } };
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<MIDIAccess> };
    if (!nav.requestMIDIAccess) return;
    nav.requestMIDIAccess().then((access) => {
      for (const input of access.inputs.values()) {
        const handler = (msg: MIDIMessageEvent) => {
          const [status, data1, data2] = msg.data;
          const cmd = status & 0xf0;
          const note = midiToNoteName(data1);
          const velocity = data2 / 127;
          if (cmd === 0x90 && data2 > 0) {
            noteOn(note, velocity);
          } else if (cmd === 0x80 || (cmd === 0x90 && data2 === 0)) {
            noteOff(note);
          }
        };
        (input as unknown as Record<string, unknown>)["onmidimessage"] = handler as unknown;
      }
    }).catch(() => {});
  }, [noteOn, noteOff]);

  return null;
}
