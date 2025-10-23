import React, { useEffect, useMemo, useRef, useState } from 'react'
import './styles.css'

const NOTE_FREQUENCIES = {
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.3,
  A4: 440.0,
  'A#4': 466.16,
  B4: 493.88,
  C5: 523.25,
  'C#5': 554.37,
  D5: 587.33,
  'D#5': 622.25,
  E5: 659.25,
  F5: 698.46,
  'F#5': 739.99,
  G5: 783.99,
  'G#5': 830.61,
  A5: 880.0,
  'A#5': 932.33,
  B5: 987.77,
  C6: 1046.5,
}

const WHITE_KEYS = [
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'A4',
  'B4',
  'C5',
  'D5',
  'E5',
  'F5',
  'G5',
  'A5',
  'B5',
  'C6',
]

const BLACK_KEYS = [
  { note: 'C#4', baseIndex: 0 },
  { note: 'D#4', baseIndex: 1 },
  { note: 'F#4', baseIndex: 3 },
  { note: 'G#4', baseIndex: 4 },
  { note: 'A#4', baseIndex: 5 },
  { note: 'C#5', baseIndex: 7 },
  { note: 'D#5', baseIndex: 8 },
  { note: 'F#5', baseIndex: 10 },
  { note: 'G#5', baseIndex: 11 },
  { note: 'A#5', baseIndex: 12 },
]

const KEYBOARD_MAP = {
  KeyA: 'C4',
  KeyS: 'D4',
  KeyD: 'E4',
  KeyF: 'F4',
  KeyG: 'G4',
  KeyH: 'A4',
  KeyJ: 'B4',
  KeyK: 'C5',
  KeyL: 'D5',
  Semicolon: 'E5',
  Quote: 'F5',
  KeyZ: 'C#4',
  KeyX: 'D#4',
  KeyC: 'F#4',
  KeyV: 'G#4',
  KeyB: 'A#4',
  KeyN: 'C#5',
  KeyM: 'D#5',
  Comma: 'F#5',
  Period: 'G#5',
  Slash: 'A#5',
}

const LESSONS = [
  'Do-Re-Mi (C Major Scale)',
  'Twinkle Twinkle Little Star',
  'Mary Had a Little Lamb',
  'Happy Birthday',
  'Chopsticks',
]

const LESSON_NOTE_MAP = {
  'Do-Re-Mi (C Major Scale)': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  'Twinkle Twinkle Little Star': [
    'C4',
    'C4',
    'G4',
    'G4',
    'A4',
    'A4',
    'G4',
    'F4',
    'F4',
    'E4',
    'E4',
    'D4',
    'D4',
    'C4',
  ],
  'Mary Had a Little Lamb': [
    'E4',
    'D4',
    'C4',
    'D4',
    'E4',
    'E4',
    'E4',
    'D4',
    'D4',
    'D4',
    'E4',
    'G4',
    'G4',
  ],
  'Happy Birthday': [
    'C4',
    'C4',
    'D4',
    'C4',
    'F4',
    'E4',
    'C4',
    'C4',
    'D4',
    'C4',
    'G4',
    'F4',
  ],
  Chopsticks: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4'],
}

const INSTRUMENTS = ['Grand Piano', 'Electric Piano', 'Organ', 'Synthesizer']

export default function App() {
  const [pressed, setPressed] = useState(new Set())
  const [history, setHistory] = useState([]) // recent pressed notes
  const [lesson, setLesson] = useState('Do-Re-Mi (C Major Scale)')
  const [lessonNotes, setLessonNotes] = useState(
    LESSON_NOTE_MAP['Do-Re-Mi (C Major Scale)']
  )
  const [instrument, setInstrument] = useState('Grand Piano')
  const [bpm, setBpm] = useState(120)
  const [recording, setRecording] = useState(false)
  const [metronome, setMetronome] = useState(false)
  const recordBuffersRef = useRef([])
  const recordProcessorRef = useRef(null)
  const downloadUrlRef = useRef('')

  const audioCtxRef = useRef(null)
  const masterGainRef = useRef(null)
  const oscillatorsRef = useRef(new Map())
  const metronomeTimerRef = useRef(null)

  const noteFreq = useMemo(() => ({ ...NOTE_FREQUENCIES }), [])

  const getOscType = () => {
    switch (instrument) {
      case 'Grand Piano':
        return 'sine'
      case 'Electric Piano':
        return 'triangle'
      case 'Organ':
        return 'sawtooth'
      case 'Synthesizer':
        return 'square'
      default:
        return 'sine'
    }
  }

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        console.error('Web Audio API not supported')
      }
    }
    if (audioCtxRef.current && !masterGainRef.current) {
      const master = audioCtxRef.current.createGain()
      master.gain.setValueAtTime(1.0, audioCtxRef.current.currentTime)
      master.connect(audioCtxRef.current.destination)
      masterGainRef.current = master
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  const playNote = (note) => {
    ensureAudio()
    const audio = audioCtxRef.current
    if (!audio) return
    if (oscillatorsRef.current.has(note)) return

    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(masterGainRef.current || audio.destination)

    osc.frequency.setValueAtTime(noteFreq[note], audio.currentTime)
    osc.type = getOscType()

    gain.gain.setValueAtTime(0, audio.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, audio.currentTime + 0.01)

    osc.start()
    oscillatorsRef.current.set(note, { osc, gain })

    setPressed((prev) => new Set(prev).add(note))
    setHistory((prev) => [...prev, note].slice(-12))

    // When recording audio we don't separately track the note list
  }

  const stopNote = (note) => {
    const audio = audioCtxRef.current
    const active = oscillatorsRef.current.get(note)
    if (audio && active) {
      active.gain.gain.linearRampToValueAtTime(0, audio.currentTime + 0.1)
      active.osc.stop(audio.currentTime + 0.1)
      oscillatorsRef.current.delete(note)
    }
    setPressed((prev) => {
      const next = new Set(prev)
      next.delete(note)
      // display remains as history; no status text
      return next
    })
  }

  const playClick = () => {
    ensureAudio()
    const audio = audioCtxRef.current
    if (!audio) return
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.connect(gain)
    gain.connect(masterGainRef.current || audio.destination)
    osc.frequency.setValueAtTime(800, audio.currentTime)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.1, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1)
    osc.start()
    osc.stop(audio.currentTime + 0.1)
  }

  const startMetronome = () => {
    setMetronome(true)
    const interval = 60000 / bpm
    if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current)
    metronomeTimerRef.current = setInterval(playClick, interval)
  }

  const stopMetronome = () => {
    setMetronome(false)
    if (metronomeTimerRef.current) {
      clearInterval(metronomeTimerRef.current)
      metronomeTimerRef.current = null
    }
  }

  const setupRecorder = () => {
    const audio = audioCtxRef.current
    if (!audio || !masterGainRef.current) return
    const processor = audio.createScriptProcessor(4096, 1, 1)
    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0)
      recordBuffersRef.current.push(new Float32Array(input))
    }
    masterGainRef.current.connect(processor)
    processor.connect(audio.destination)
    recordProcessorRef.current = processor
  }

  const teardownRecorder = () => {
    if (recordProcessorRef.current) {
      try {
        recordProcessorRef.current.disconnect()
      } catch {}
      recordProcessorRef.current = null
    }
  }

  const exportMp3 = async () => {
    const audio = audioCtxRef.current
    if (!audio) return
    const Float32Concat = (arrays) => {
      let total = 0
      arrays.forEach((a) => (total += a.length))
      const result = new Float32Array(total)
      let offset = 0
      arrays.forEach((a) => {
        result.set(a, offset)
        offset += a.length
      })
      return result
    }
    const floatData = Float32Concat(recordBuffersRef.current)
    if (!floatData.length) return
    const samples = new Int16Array(floatData.length)
    for (let i = 0; i < floatData.length; i++) {
      let s = Math.max(-1, Math.min(1, floatData[i]))
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    const mod = await import('lamejs')
    const Lame = mod?.default || mod
    const Mp3Encoder = Lame.Mp3Encoder || (Lame && Lame.default && Lame.default.Mp3Encoder)
    const mp3encoder = new Mp3Encoder(1, audio.sampleRate, 128)
    const chunkSize = 1152
    const mp3Data = []
    for (let i = 0; i < samples.length; i += chunkSize) {
      const chunk = samples.subarray(i, i + chunkSize)
      const mp3buf = mp3encoder.encodeBuffer(chunk)
      if (mp3buf.length > 0) mp3Data.push(new Uint8Array(mp3buf))
    }
    const d = mp3encoder.flush()
    if (d.length > 0) mp3Data.push(new Uint8Array(d))
    const blob = new Blob(mp3Data, { type: 'audio/mpeg' })
    const url = URL.createObjectURL(blob)
    downloadUrlRef.current = url
  }

  const toggleRecording = async () => {
    if (!recording) {
      ensureAudio()
      setRecording(true)
      recordBuffersRef.current = []
      setupRecorder()
    } else {
      setRecording(false)
      teardownRecorder()
      await exportMp3()
    }
  }

  const onLessonSelect = () => {
    const selected = prompt('Select a lesson:', lesson)
    if (selected && LESSONS.includes(selected)) {
      setLesson(selected)
      setLessonNotes(LESSON_NOTE_MAP[selected])
    }
  }

  const onInstrumentSelect = (selected) => {
    setInstrument(selected)
  }

  useEffect(() => {
    const onDown = (e) => {
      const note = KEYBOARD_MAP[e.code]
      if (note && !e.repeat) playNote(note)
    }
    const onUp = (e) => {
      const note = KEYBOARD_MAP[e.code]
      if (note) stopNote(note)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current)
        metronomeTimerRef.current = null
      }
      // Stop any active oscillators to avoid leaking audio nodes
      const audio = audioCtxRef.current
      if (audio) {
        for (const [n, active] of oscillatorsRef.current.entries()) {
          try {
            active.gain.gain.linearRampToValueAtTime(0, audio.currentTime + 0.05)
            active.osc.stop(audio.currentTime + 0.05)
          } catch {}
        }
        oscillatorsRef.current.clear()
      }
    }
  }, [instrument])

  // Update metronome when BPM changes
  useEffect(() => {
    if (metronome) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current)
      metronomeTimerRef.current = setInterval(playClick, 60000 / bpm)
    }
  }, [bpm, metronome])

  return (
    <div className="piano-container" onClick={ensureAudio}>
      <div className="display" id="display">
        <div className="display-content">
          <div className="display-history">
            {history.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="history-note"
                style={{ opacity: Math.max(0.25, 1 - (history.length - 1 - i) * 0.15) }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="lesson-notes-section">
        <div className="lesson-section">
          <span className="label">Lesson:</span>
          <div className="lesson-selector">
            <select
              className="lesson-select"
              value={lesson}
              onChange={(e) => {
                const sel = e.target.value
                setLesson(sel)
                setLessonNotes(LESSON_NOTE_MAP[sel])
              }}
            >
              {LESSONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="notes-section">
          <span className="label">Notes:</span>
          <div className="notes-container" id="notes-container">
            {lessonNotes.map((n, i) => (
              <div className="note-item" key={`${n}-${i}`}>
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="piano-keyboard">
        <div className="keys-layout">
          <div className="white-keys-grid">
            {WHITE_KEYS.map((note) => (
              <button
                key={note}
                type="button"
                className={`white-key ${pressed.has(note) ? 'active' : ''}`}
                aria-label={note}
                onMouseDown={() => playNote(note)}
                onMouseUp={() => stopNote(note)}
                onMouseLeave={() => stopNote(note)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  playNote(note)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  stopNote(note)
                }}
              />
            ))}
          </div>
          <div className="black-keys-layer">
            {BLACK_KEYS.map(({ note, baseIndex }) => (
              <button
                key={note}
                type="button"
                className={`black-key ${pressed.has(note) ? 'active' : ''}`}
                aria-label={note}
                style={{
                  left: `calc(${baseIndex + 1} * (var(--white-key-width) + var(--white-key-gap)) - (var(--white-key-gap) / 2))`,
                }}
                onMouseDown={() => playNote(note)}
                onMouseUp={() => stopNote(note)}
                onMouseLeave={() => stopNote(note)}
                onTouchStart={(e) => {
                  e.preventDefault()
                  playNote(note)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  stopNote(note)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard">
        <div className="pressed-keys-section">
          <span className="label">Pressed Keys:</span>
          <div className="pressed-keys-display" id="pressed-keys">
            {pressed.size ? Array.from(pressed).join(', ') : 'N/A'}
          </div>
        </div>
        <div className="features-section">
          <div className="feature-item">
            <span className="label">Instrument:</span>
            <div className="instrument-selector">
              <select
                className="instrument-select"
                value={instrument}
                onChange={(e) => onInstrumentSelect(e.target.value)}
              >
                {INSTRUMENTS.map((i) => (
                  <option value={i} key={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="feature-item">
            <span className="label">BPM:</span>
            <input
              className="bpm-input"
              type="number"
              min={40}
              max={240}
              value={bpm}
              onChange={(e) => {
                const v = Math.max(40, Math.min(240, Number(e.target.value) || 0))
                setBpm(v)
              }}
            />
          </div>
          <div className="feature-item">
            <button
              className={`control-button ${metronome ? 'active' : ''}`}
              onClick={() => (metronome ? stopMetronome() : startMetronome())}
            >
              Metronome
            </button>
          </div>
          <div className="feature-item">
            <button
              className={`control-button ${recording ? 'active' : ''}`}
              onClick={toggleRecording}
            >
              {recording ? 'Stop & Save MP3' : 'Record'}
            </button>
          </div>
          {downloadUrlRef.current ? (
            <div className="feature-item">
              <a className="control-button" href={downloadUrlRef.current} download="recording.mp3">
                Download MP3
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
