"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/state/store";
import { getEngine } from "@/lib/audio/engine";
import { noteOnBus } from "@/state/events";
import * as Tone from "tone";

type Lesson = {
  id: string;
  title: string;
  bpm: number;
  events: { time: number; note: string; duration?: number; velocity?: number }[];
};

import doReMi from "@/data/lessons/do-re-mi.json";
import twinkle from "@/data/lessons/twinkle.json";
import chords from "@/data/lessons/chords.json";

const LESSONS: Lesson[] = [doReMi as Lesson, twinkle as Lesson, chords as Lesson];

export function TrainerPanel() {
  const bpm = useStore((s) => s.bpm);
  const setBpm = useStore((s) => s.setBpm);
  const [lessonId, setLessonId] = useState<string>(LESSONS[0].id);
  const lesson = useMemo(() => LESSONS.find((l) => l.id === lessonId)!, [lessonId]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100); // percent
  const [loop, setLoop] = useState(true);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [accuracy, setAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);
  const [earlyLate, setEarlyLate] = useState<"early" | "late" | "on" | null>(null);

  const totalBeats = useMemo(() => {
    const end = Math.max(...lesson.events.map((e) => e.time + (e.duration ?? 1)));
    return Math.ceil(end);
  }, [lesson]);
  useEffect(() => setRange([0, totalBeats]), [totalBeats]);

  useEffect(() => {
    setBpm(lesson.bpm);
  }, [lesson.bpm, setBpm]);

  // grading counters
  const hitCount = useRef(0);
  const totalCount = useRef(0);
  const expectedTimes = useRef<number[]>([]); // absolute seconds for each event

  useEffect(() => {
    function onNote(ev: Event) {
      const { note, time } = (ev as CustomEvent<{ note: string; time: number }>).detail;
      if (currentIndex < 0 || !playing) return;
      const idx = currentIndex;
      const targetNote = lesson.events[idx].note;
      const targetTime = expectedTimes.current[idx];
      if (!targetTime) return;
      // window in ms adjusted by speed
      const windowMs = 150;
      const dt = time - targetTime * 1000;
      if (note === targetNote && Math.abs(dt) <= windowMs) {
        hitCount.current += 1;
        setStreak((s) => s + 1);
        setEarlyLate("on");
        setAccuracy(Math.round((100 * hitCount.current) / Math.max(1, totalCount.current)));
      } else if (note === targetNote) {
        setEarlyLate(dt < 0 ? "early" : "late");
        setStreak(0);
        setAccuracy(Math.round((100 * hitCount.current) / Math.max(1, totalCount.current)));
      }
    }
    noteOnBus.addEventListener("noteon", onNote as EventListener);
    return () => noteOnBus.removeEventListener("noteon", onNote as EventListener);
  }, [currentIndex, playing, lesson.events]);

  useEffect(() => {
    if (!playing) return;
    const engine = getEngine();
    const sp = Math.max(0.7, Math.min(1, speed / 100));
    const secPerBeat = 60 / bpm / sp;
    const now = engine.now() + 0.2;
    expectedTimes.current = [];
    totalCount.current = lesson.events.filter((e) => e.time >= range[0] && e.time < range[1]).length;
    hitCount.current = 0;
    setAccuracy(0);
    setStreak(0);

    const ids: number[] = [];
    const filtered = lesson.events.filter((e) => e.time >= range[0] && e.time < range[1]);
    filtered.forEach((ev, i) => {
      const at = now + ev.time * secPerBeat;
      expectedTimes.current.push(at);
      ids.push(Tone.Transport.schedule(() => setCurrentIndex(i), at));
      ids.push(Tone.Transport.schedule(() => engine.noteOn(ev.note, ev.velocity ?? 0.8), at));
      ids.push(Tone.Transport.schedule(() => engine.noteOff(ev.note), at + (ev.duration ?? 1) * secPerBeat));
    });
    // stop/loop
    const endAt = now + range[1] * secPerBeat + 0.05;
    ids.push(Tone.Transport.schedule(() => {
      setCurrentIndex(-1);
      if (loop) {
        setPlaying(false);
        setTimeout(() => setPlaying(true), 10);
      } else {
        setPlaying(false);
      }
    }, endAt));
    if (Tone.Transport.state !== "started") Tone.Transport.start();
    return () => ids.forEach((id) => Tone.Transport.clear(id));
  }, [playing, bpm, speed, range, lesson]);

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center gap-2 mb-3">
        <Select value={lessonId} onValueChange={setLessonId}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Lesson" /></SelectTrigger>
          <SelectContent>
            {LESSONS.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setPlaying((p) => !p)}>{playing ? "Stop" : "Play"}</Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs opacity-70">Speed</span>
          <Slider value={[speed]} min={70} max={100} step={1} onValueChange={([v]) => setSpeed(v)} className="w-36" />
          <span className="w-10 text-right text-xs">{speed}%</span>
        </div>
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70 w-16">Loop</span>
          <Button variant={loop ? "secondary" : "outline"} onClick={() => setLoop((v) => !v)}>{loop ? "On" : "Off"}</Button>
          <span className="ml-3 text-xs opacity-70">Range (beats)</span>
          <input type="number" className="w-16 border rounded px-2 py-1 text-sm bg-background" value={range[0]} min={0} max={totalBeats - 1} onChange={(e) => setRange([Number(e.target.value), range[1]])} />
          <span>–</span>
          <input type="number" className="w-16 border rounded px-2 py-1 text-sm bg-background" value={range[1]} min={1} max={totalBeats} onChange={(e) => setRange([range[0], Number(e.target.value)])} />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs opacity-70">Accuracy</div>
            <div className="font-semibold">{accuracy}%</div>
          </div>
          <div>
            <div className="text-xs opacity-70">Streak</div>
            <div className="font-semibold">{streak}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">Timing</div>
            <div className="font-semibold capitalize">{earlyLate ?? "—"}</div>
          </div>
        </div>

        <div>
          <div className="text-xs opacity-70 mb-1">Steps</div>
          <div className="flex flex-wrap gap-1">
            {lesson.events.map((e, i) => (
              <span key={i} className={"px-2 py-1 rounded border text-xs " + (i === currentIndex ? "bg-foreground text-background" : "")}>{e.note}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
