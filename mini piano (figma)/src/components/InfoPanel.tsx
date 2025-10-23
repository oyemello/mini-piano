import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { usePiano } from '../contexts/PianoContext';
import { detectChord } from '../utils/chordDetection';
import { Music, Volume2, Clock } from 'lucide-react';

export default function InfoPanel() {
  const {
    pressedKeys,
    activeNotes,
    currentInstrument,
    bpm,
    octave,
    transpose,
    sustainEnabled,
    noteHistory,
  } = usePiano();

  const activeNotesArray = Array.from(activeNotes);
  const chord = detectChord(activeNotesArray);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-blue-600" />
        <h2>Now Playing</h2>
      </div>

      {/* Active Keys */}
      <div className="mb-4">
        <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-2">Pressed Keys</h3>
        {pressedKeys.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(pressedKeys.entries()).map(([key, note]) => (
              <Badge key={key} variant="default">
                {key.toUpperCase()} → {note}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No keys pressed</p>
        )}
      </div>

      {/* Chord Detection */}
      {chord && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Detected Chord</h3>
          <div className="text-2xl text-blue-600 dark:text-blue-400">{chord}</div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
            <Volume2 className="w-3 h-3" />
            Instrument
          </div>
          <div className="text-sm capitalize">{currentInstrument}</div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
            <Clock className="w-3 h-3" />
            BPM
          </div>
          <div className="text-sm">{bpm}</div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Octave</div>
          <div className="text-sm">{octave >= 0 ? `+${octave}` : octave}</div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transpose</div>
          <div className="text-sm">{transpose >= 0 ? `+${transpose}` : transpose}</div>
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={sustainEnabled ? 'default' : 'outline'}>
          Sustain: {sustainEnabled ? 'ON' : 'OFF'}
        </Badge>
        <Badge variant="outline">
          Polyphony: {activeNotes.size}
        </Badge>
      </div>

      {/* Note History */}
      <div>
        <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-2">Recent Notes</h3>
        <div className="flex flex-wrap gap-1">
          {noteHistory.length > 0 ? (
            noteHistory.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {item.note}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-slate-400">No notes played yet</p>
          )}
        </div>
      </div>
    </Card>
  );
}
