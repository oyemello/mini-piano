"use client";
import { useEffect } from "react";
import { useStore } from "@/state/store";
import { buildKeyMap } from "@/lib/keys/mapping";

const map = buildKeyMap();

export function KeyboardHandler() {
  const keyDown = useStore((s) => s.keyDown);
  const keyUp = useStore((s) => s.keyUp);
  const setOctave = useStore((s) => s.setOctave);
  const setTranspose = useStore((s) => s.setTranspose);
  const octaveVal = useStore((s) => s.octave);
  const transposeVal = useStore((s) => s.transpose);
  const toggleMetronome = useStore((s) => s.toggleMetronome);
  const startRecording = useStore((s) => s.startRecording);
  const stopRecording = useStore((s) => s.stopRecording);
  const setSustain = useStore((s) => s.setSustain);
  const recorder = useStore((s) => s.recorder);

  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      if (e.repeat) return; // prevent auto-repeat
      // shortcuts
      if (key === "[" || key === "]") {
        e.preventDefault();
        setOctave(octaveVal + (key === "]" ? 1 : -1));
        return;
      }
      if (key === "-" || key === "=") {
        e.preventDefault();
        setTranspose(transposeVal + (key === "=" ? 1 : -1));
        return;
      }
      if (key === " ") {
        e.preventDefault();
        toggleMetronome();
        return;
      }
      if (key === "r") {
        e.preventDefault();
        if (recorder.isRecording) stopRecording();
        else startRecording();
        return;
      }
      if (key === "shift") {
        setSustain(true);
        return;
      }
      const note = map[key];
      if (note) {
        e.preventDefault();
        keyDown(key, note, 0.9);
      }
    }
    function onUp(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      if (key === "shift") {
        setSustain(false);
        return;
      }
      const note = map[key];
      if (note) {
        keyUp(key);
      }
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [keyDown, keyUp, setOctave, setTranspose, toggleMetronome, startRecording, stopRecording, recorder.isRecording, setSustain, octaveVal, transposeVal]);
  return null;
}
