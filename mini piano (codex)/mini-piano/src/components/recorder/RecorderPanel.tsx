"use client";
import { Button } from "@/components/ui/button";
import { useStore } from "@/state/store";

export function RecorderPanel() {
  const recorder = useStore((s) => s.recorder);
  const play = useStore((s) => s.playRecording);
  const clear = useStore((s) => s.clearRecording);
  const exportRec = useStore((s) => s.exportRecording);
  const importRec = useStore((s) => s.importRecording);

  function exportJson() {
    const data = JSON.stringify(exportRec(), null, 2);
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mini-piano-recording.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const events = JSON.parse(reader.result as string);
        importRec(events);
      } catch {}
    };
    reader.readAsText(file);
  }

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Recorder</h3>
        <div className="text-xs opacity-70">Events: {recorder.events.length}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => play()}>Play</Button>
        <Button variant="outline" onClick={clear}>Clear</Button>
        <Button variant="outline" onClick={exportJson}>Export</Button>
        <label className="border rounded-md px-3 py-2 text-sm cursor-pointer">
          Import
          <input type="file" accept="application/json" className="hidden" onChange={importJson} />
        </label>
      </div>
    </div>
  );
}
