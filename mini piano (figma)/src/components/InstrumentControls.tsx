import React from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { usePiano } from '../contexts/PianoContext';
import { Sliders } from 'lucide-react';

export default function InstrumentControls() {
  const {
    volume,
    setVolume,
    reverb,
    setReverb,
    delay,
    setDelay,
    attack,
    setAttack,
    release,
    setRelease,
  } = usePiano();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-blue-600" />
        <h2>Effects & Controls</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Volume */}
        <div>
          <Label className="text-sm">Volume</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Reverb */}
        <div>
          <Label className="text-sm">Reverb</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[reverb]}
              onValueChange={([v]) => setReverb(v)}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{Math.round(reverb * 100)}%</span>
          </div>
        </div>

        {/* Delay */}
        <div>
          <Label className="text-sm">Delay</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[delay]}
              onValueChange={([v]) => setDelay(v)}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{Math.round(delay * 100)}%</span>
          </div>
        </div>

        {/* Attack */}
        <div>
          <Label className="text-sm">Attack</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[attack]}
              onValueChange={([v]) => setAttack(v)}
              min={0.001}
              max={2}
              step={0.001}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{attack.toFixed(3)}s</span>
          </div>
        </div>

        {/* Release */}
        <div>
          <Label className="text-sm">Release</Label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[release]}
              onValueChange={([v]) => setRelease(v)}
              min={0.1}
              max={5}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{release.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
