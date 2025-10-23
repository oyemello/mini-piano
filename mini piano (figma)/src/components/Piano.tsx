import React, { useEffect, useRef } from 'react';
import { usePiano } from '../contexts/PianoContext';
import { KEY_TO_NOTE, PIANO_KEYS } from '../utils/noteMapping';
import PianoKey from './PianoKey';
import { Card } from './ui/card';

export default function Piano() {
  const { playNote, stopNote, setOctave, setTranspose, setMetronomeActive, isRecording, startRecording, stopRecording, setSustainEnabled } = usePiano();
  const pressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      
      // Prevent repeat
      if (pressedKeysRef.current.has(key)) return;
      pressedKeysRef.current.add(key);
      
      // Sustain (Shift)
      if (e.shiftKey && key === 'shift') {
        setSustainEnabled(true);
        return;
      }
      
      // Shortcuts
      if (key === '[') {
        setOctave(prev => Math.max(-2, prev - 1));
        return;
      }
      if (key === ']') {
        setOctave(prev => Math.min(2, prev + 1));
        return;
      }
      if (key === '-') {
        setTranspose(prev => Math.max(-12, prev - 1));
        return;
      }
      if (key === '=') {
        setTranspose(prev => Math.min(12, prev + 1));
        return;
      }
      if (key === ' ') {
        e.preventDefault();
        setMetronomeActive(prev => !prev);
        return;
      }
      if (key === 'r') {
        isRecording ? stopRecording() : startRecording();
        return;
      }
      
      // Play note
      const note = KEY_TO_NOTE[key];
      if (note) {
        playNote(note, key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeysRef.current.delete(key);
      
      // Release sustain
      if (key === 'shift') {
        setSustainEnabled(false);
        return;
      }
      
      const note = KEY_TO_NOTE[key];
      if (note) {
        stopNote(note, key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote, setOctave, setTranspose, setMetronomeActive, isRecording, startRecording, stopRecording, setSustainEnabled]);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="mb-2">On-Screen Piano</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Click keys to play or use your keyboard. Shortcuts: [/] octave, -/= transpose, Space metronome, R record, Shift sustain
        </p>
      </div>
      
      <div className="relative w-full">
        <div className="flex relative w-full" style={{ height: '240px' }}>
          {PIANO_KEYS.map((key, index) => (
            <PianoKey key={key.note} pianoKey={key} />
          ))}
        </div>
      </div>
      
      {/* Keyboard Legend */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <h3 className="text-sm mb-2">Keyboard Mapping</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-600 dark:text-slate-400 mb-1">Lower Octave (White):</p>
            <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Z X C V B N M , . /</code>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 mb-1">Lower Octave (Black):</p>
            <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">1 2 4 5 6 8 9</code>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 mb-1">Upper Octave (White):</p>
            <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">A S D F G H J K L ;</code>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 mb-1">Upper Octave (Black):</p>
            <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Q W E T Y I O</code>
          </div>
        </div>
      </div>
    </Card>
  );
}
