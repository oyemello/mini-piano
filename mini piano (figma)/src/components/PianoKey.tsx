import React, { useCallback } from 'react';
import { usePiano } from '../contexts/PianoContext';
import { getKeyLabel } from '../utils/noteMapping';

interface PianoKeyProps {
  pianoKey: {
    note: string;
    color: 'white' | 'black';
    octave: number;
  };
}

export default function PianoKey({ pianoKey }: PianoKeyProps) {
  const { playNote, stopNote, activeNotes, showKeyLabels } = usePiano();
  const isActive = activeNotes.has(pianoKey.note);
  const isBlack = pianoKey.color === 'black';

  const handleMouseDown = useCallback(() => {
    playNote(pianoKey.note);
  }, [playNote, pianoKey.note]);

  const handleMouseUp = useCallback(() => {
    stopNote(pianoKey.note);
  }, [stopNote, pianoKey.note]);

  const handleMouseLeave = useCallback(() => {
    if (isActive) {
      stopNote(pianoKey.note);
    }
  }, [stopNote, pianoKey.note, isActive]);

  const keyLabel = getKeyLabel(pianoKey.note);

  if (isBlack) {
    return (
      <div
        className={`absolute w-10 h-36 cursor-pointer select-none transition-all duration-75 ${
          isActive
            ? 'bg-blue-600 border-blue-700'
            : 'bg-slate-800 hover:bg-slate-700 border-slate-900'
        } border-2 rounded-b-md shadow-lg z-10`}
        style={{
          left: getBlackKeyPosition(pianoKey.note),
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {showKeyLabels && keyLabel && (
          <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white opacity-70">
            {keyLabel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex-1 h-60 cursor-pointer select-none transition-all duration-75 ${
        isActive
          ? 'bg-blue-200 border-blue-400'
          : 'bg-white hover:bg-slate-50 border-slate-300'
      } border-2 border-r-0 last:border-r-2 rounded-b-md shadow-md`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="text-xs text-slate-400">{pianoKey.note}</div>
        {showKeyLabels && keyLabel && (
          <div className="text-sm text-slate-600 mt-1">{keyLabel}</div>
        )}
      </div>
    </div>
  );
}

function getBlackKeyPosition(note: string): string {
  const positions: Record<string, string> = {
    'C#4': '2.25rem',
    'D#4': '5.75rem',
    'F#4': '11.75rem',
    'G#4': '15.25rem',
    'A#4': '18.75rem',
    'C#5': '26.25rem',
    'D#5': '29.75rem',
    'F#5': '35.75rem',
    'G#5': '39.25rem',
    'A#5': '42.75rem',
    'C#6': '50.25rem',
    'D#6': '53.75rem',
  };
  
  return positions[note] || '0';
}
