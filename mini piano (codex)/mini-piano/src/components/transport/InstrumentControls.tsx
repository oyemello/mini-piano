"use client";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useStore } from "@/state/store";
import { getEngine } from "@/lib/audio/engine";
import { useState } from "react";

export function InstrumentControls() {
  const transpose = useStore((s) => s.transpose);
  const setTranspose = useStore((s) => s.setTranspose);
  const octave = useStore((s) => s.octave);
  const setOctave = useStore((s) => s.setOctave);

  const [vol, setVol] = useState(0);
  const [rev, setRev] = useState(0.2);
  const [del, setDel] = useState(0.1);
  const [attack, setAttack] = useState(0.01);
  const [release, setRelease] = useState(0.8);

  function updateVolume([v]: number[]) {
    setVol(v);
    getEngine().setVolume(v);
  }
  function updateReverb([v]: number[]) {
    setRev(v);
    getEngine().setReverb(v);
  }
  function updateDelay([v]: number[]) {
    setDel(v);
    getEngine().setDelay(v);
  }
  function updateEnv([a]: number[]) {
    setAttack(a);
    getEngine().setEnvelope(a, release);
  }
  function updateRel([r]: number[]) {
    setRelease(r);
    getEngine().setEnvelope(attack, r);
  }

  return (
    <div className="border-t bg-background/60">
      <div className="mx-auto max-w-screen-2xl px-4 py-2 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70 w-16">Volume</span>
          <Slider value={[vol]} min={-24} max={6} step={0.5} onValueChange={updateVolume} className="w-36" />
          <span className="w-10 text-right text-xs">{vol} dB</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70 w-16">Reverb</span>
          <Slider value={[rev]} min={0} max={1} step={0.01} onValueChange={updateReverb} className="w-36" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70 w-16">Delay</span>
          <Slider value={[del]} min={0} max={1} step={0.01} onValueChange={updateDelay} className="w-36" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70 w-16">Attack</span>
          <Slider value={[attack]} min={0} max={0.5} step={0.005} onValueChange={updateEnv} className="w-36" />
          <span className="text-xs w-10 text-right">{attack.toFixed(2)}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70 w-16">Release</span>
          <Slider value={[release]} min={0} max={2} step={0.01} onValueChange={updateRel} className="w-36" />
          <span className="text-xs w-10 text-right">{release.toFixed(2)}s</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">Transpose</span>
          <Button variant="outline" onClick={() => setTranspose(transpose - 1)}>-</Button>
          <span className="w-8 text-center text-sm">{transpose}</span>
          <Button variant="outline" onClick={() => setTranspose(transpose + 1)}>+</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">Octave</span>
          <Button variant="outline" onClick={() => setOctave(octave - 1)}>-</Button>
          <span className="w-8 text-center text-sm">{octave}</span>
          <Button variant="outline" onClick={() => setOctave(octave + 1)}>+</Button>
        </div>
      </div>
    </div>
  );
}

