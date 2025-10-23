"use client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/state/store";
import { Music, Timer, Disc3, Settings } from "lucide-react";
import * as Tone from "tone";
import { useEffect, useState } from "react";
import type { Instrument } from "@/state/store";

export function TransportBar() {
  const instrument = useStore((s) => s.instrument);
  const setInstrument = useStore((s) => s.setInstrument);
  const bpm = useStore((s) => s.bpm);
  const setBpm = useStore((s) => s.setBpm);
  const metronomeOn = useStore((s) => s.metronomeOn);
  const toggleMetronome = useStore((s) => s.toggleMetronome);
  const recorder = useStore((s) => s.recorder);
  const startRecording = useStore((s) => s.startRecording);
  const stopRecording = useStore((s) => s.stopRecording);
  const showKeyLabels = useStore((s) => s.showKeyLabels);
  const setShowKeyLabels = useStore((s) => s.setShowKeyLabels);
  const highContrast = useStore((s) => s.highContrast);
  const setHighContrast = useStore((s) => s.setHighContrast);

  const [needsUnlock, setNeedsUnlock] = useState(false);
  useEffect(() => {
    setNeedsUnlock(Tone.getContext().state !== "running");
  }, []);

  async function unlock() {
    await Tone.start();
    setNeedsUnlock(false);
  }

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-2xl px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Music className="h-5 w-5" />
          <span className="font-semibold">Mini Piano</span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={instrument} onValueChange={(v: Instrument) => setInstrument(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Instrument" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="piano">Grand Piano</SelectItem>
              <SelectItem value="keys">EP/Keys</SelectItem>
              <SelectItem value="drums">Drums/Kit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-[180px]">
          <span className="text-xs opacity-70">BPM</span>
          <Slider value={[bpm]} min={40} max={200} step={1} onValueChange={([v]) => setBpm(v)} />
          <span className="w-8 text-right text-xs">{bpm}</span>
        </div>

        <div className="flex-1" />

        <Button variant={metronomeOn ? "secondary" : "outline"} onClick={toggleMetronome} aria-pressed={metronomeOn} title="Space">
          <Timer className="h-4 w-4" />
          {metronomeOn ? "Metronome On" : "Metronome Off"}
        </Button>

        <Button
          variant={recorder.isRecording ? "secondary" : "outline"}
          onClick={() => (recorder.isRecording ? stopRecording() : startRecording())}
          title="R"
        >
          <Disc3 className="h-4 w-4" /> {recorder.isRecording ? "Stop" : "Record"}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline"><Settings className="h-4 w-4" /> Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="labels">Show Key Labels</Label>
                <Switch id="labels" checked={showKeyLabels} onCheckedChange={setShowKeyLabels} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hc">High Contrast</Label>
                <Switch id="hc" checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
              {needsUnlock && (
                <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-2 text-sm">
                  Audio is locked. Click the button below to enable sound.
                  <div className="mt-2"><Button onClick={unlock}>Unlock Audio</Button></div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
