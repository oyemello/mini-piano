import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { usePiano } from '../contexts/PianoContext';
import { Mic, Play, Trash2, Download, Upload } from 'lucide-react';

export default function Recorder() {
  const { recording, playRecording, clearRecording } = usePiano();

  const handleExport = () => {
    if (!recording) return;
    
    const json = JSON.stringify(recording, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `piano-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const text = await file.text();
      const data = JSON.parse(text);
      // In a real implementation, we'd set this to the recording state
      console.log('Imported recording:', data);
    };
    input.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-blue-600" />
        <h2>Recorder</h2>
      </div>

      {!recording ? (
        <div className="text-center py-8 text-slate-400">
          <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recording available</p>
          <p className="text-xs mt-1">Press 'R' or click Record in the top bar to start</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Recording Info</div>
            <div className="text-lg">{recording.events.length} notes</div>
            <div className="text-sm text-slate-500">
              Duration: {Math.max(...recording.events.map(e => e.time + e.duration)).toFixed(1)}s
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={playRecording} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            <Button onClick={clearRecording} variant="outline">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExport} variant="secondary" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleImport} variant="secondary" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
