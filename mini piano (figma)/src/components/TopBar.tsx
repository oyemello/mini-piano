import React from 'react';
import { Music2, Circle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { usePiano } from '../contexts/PianoContext';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function TopBar() {
  const {
    currentInstrument,
    setCurrentInstrument,
    bpm,
    setBpm,
    metronomeActive,
    setMetronomeActive,
    isRecording,
    startRecording,
    stopRecording,
  } = usePiano();

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <Music2 className="w-6 h-6 text-blue-600" />
            <span className="text-xl">Mini Piano</span>
            <Badge variant="outline">Keyboard + Trainer</Badge>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Instrument Select */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Instrument:</Label>
              <Select value={currentInstrument} onValueChange={(v) => setCurrentInstrument(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piano">Grand Piano</SelectItem>
                  <SelectItem value="ep">EP/Keys</SelectItem>
                  <SelectItem value="drums">Drums/Kit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BPM */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">BPM:</Label>
              <Input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-20"
                min="40"
                max="240"
              />
            </div>

            {/* Metronome */}
            <Button
              variant={metronomeActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetronomeActive(!metronomeActive)}
              title="Space to toggle"
            >
              <Circle className={`w-4 h-4 mr-2 ${metronomeActive ? 'fill-current' : ''}`} />
              Metronome
            </Button>

            {/* Record */}
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => isRecording ? stopRecording() : startRecording()}
              title="R to toggle"
            >
              <Circle className={`w-4 h-4 mr-2 ${isRecording ? 'fill-current animate-pulse' : ''}`} />
              {isRecording ? 'Stop' : 'Record'}
            </Button>

            {/* Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
