"use client";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";
import { KEYBOARD_ROWS } from "@/lib/keys/mapping";

export function InfoPanel() {
  const activeKeys = useStore((s) => s.activeKeys);
  const chord = useStore((s) => s.chordName);
  const instrument = useStore((s) => s.instrument);
  const bpm = useStore((s) => s.bpm);
  const sustain = useStore((s) => s.sustain);
  const polyphony = useStore((s) => s.polyphony);
  const lastNotes = useStore((s) => s.lastNotes);
  const pressed = new Set(Array.from(activeKeys.keys()));

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Now Playing</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="col-span-2">
          <div className="text-xs opacity-70">Keyboard Map</div>
          <div className="flex flex-col gap-2">
            {[KEYBOARD_ROWS.lowerWhite, KEYBOARD_ROWS.upperWhite, KEYBOARD_ROWS.lowerBlack, KEYBOARD_ROWS.upperBlack].map((row, ri) => (
              <div key={ri} className="flex flex-wrap gap-1">
                {row.map(([k, n]) => (
                  <div key={k} className={cn(
                    "px-2 py-1 rounded border text-center min-w-[44px]",
                    pressed.has(k) ? "bg-foreground text-background" : ""
                  )}>
                    <div className="text-[10px] uppercase opacity-60 leading-none">{k}</div>
                    <div className="font-mono text-sm leading-tight">{n}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-70">Chord</div>
          <div className="font-semibold">{chord ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">Instrument</div>
          <div>{instrument}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">BPM</div>
          <div>{bpm}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">Sustain</div>
          <div className={cn("font-medium", sustain ? "text-green-600" : "opacity-70")}>{sustain ? "On" : "Off"}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">Polyphony</div>
          <div>{polyphony}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs opacity-70">Recent</div>
          <div className="font-mono truncate">{lastNotes.join("  ") || "—"}</div>
        </div>
      </div>
    </div>
  );
}
