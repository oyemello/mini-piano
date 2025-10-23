"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'

const WHITE_KEYS = [
  { note: 'C4', freq: 261.63, label: 'C' },
  { note: 'D4', freq: 293.66, label: 'D' },
  { note: 'E4', freq: 329.63, label: 'E' },
  { note: 'F4', freq: 349.23, label: 'F' },
  { note: 'G4', freq: 392.0, label: 'G' },
  { note: 'A4', freq: 440.0, label: 'A' },
  { note: 'B4', freq: 493.88, label: 'B' },
  { note: 'C5', freq: 523.25, label: 'C' },
  { note: 'D5', freq: 587.33, label: 'D' },
  { note: 'E5', freq: 659.25, label: 'E' },
  { note: 'F5', freq: 698.46, label: 'F' },
  { note: 'G5', freq: 783.99, label: 'G' },
  { note: 'A5', freq: 880.0, label: 'A' },
  { note: 'B5', freq: 987.77, label: 'B' },
  { note: 'C6', freq: 1046.5, label: 'C' },
]

const BLACK_KEYS = [
  { note: 'C#4', freq: 277.18, label: 'C#' },
  { note: 'D#4', freq: 311.13, label: 'D#' },
  { note: 'F#4', freq: 369.99, label: 'F#' },
  { note: 'G#4', freq: 415.3, label: 'G#' },
  { note: 'A#4', freq: 466.16, label: 'A#' },
  { note: 'C#5', freq: 554.37, label: 'C#' },
  { note: 'D#5', freq: 622.25, label: 'D#' },
  { note: 'F#5', freq: 739.99, label: 'F#' },
  { note: 'G#5', freq: 830.61, label: 'G#' },
  { note: 'A#5', freq: 932.33, label: 'A#' },
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
  'Mary Had a Little Lamb',
  'Twinkle Twinkle Little Star',
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

export default function Page() {
  const [pressed, setPressed] = useState(new Set())
  const [history, setHistory] = useState([])
  const [lesson, setLesson] = useState('Do-Re-Mi (C Major Scale)')
  const [lessonNotes, setLessonNotes] = useState(
    LESSON_NOTE_MAP['Do-Re-Mi (C Major Scale)']
  )
  const [instrument, setInstrument] = useState('Grand Piano')
  const [bpm, setBpm] = useState(120)
  const [recording, setRecording] = useState(false)
  const [metronome, setMetronome] = useState(false)
  const recordedNotesRef = useRef([])
  const recordBuffersRef = useRef([])
  const recordProcessorRef = useRef(null)
  const downloadUrlRef = useRef('')

  const audioCtxRef = useRef(null)
  const masterGainRef = useRef(null)
  const oscillatorsRef = useRef(new Map())
  const metronomeTimerRef = useRef(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  const noteFreq = useMemo(() => {
    const map = {}
    ;[...WHITE_KEYS, ...BLACK_KEYS].forEach(({ note, freq }) => (map[note] = freq))
    return map
  }, [])

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

    if (recording) {
      recordedNotesRef.current.push(note)
    }

    // Lesson check: advance only if correct note
    if (lessonNotes?.length) {
      const expected = lessonNotes[currentLessonIndex]
      if (note === expected) {
        setCurrentLessonIndex((idx) => Math.min(idx + 1, lessonNotes.length))
      }
    }
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
    processor.connect(audio.destination) // required for onaudioprocess to fire
    recordProcessorRef.current = processor
  }

  const teardownRecorder = () => {
    const audio = audioCtxRef.current
    if (recordProcessorRef.current) {
      try {
        recordProcessorRef.current.disconnect()
      } catch {}
      recordProcessorRef.current = null
    }
    if (masterGainRef.current && audio) {
      // leave master -> destination connected
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
    // Convert Float32 [-1,1] to 16-bit PCM
    const samples = new Int16Array(floatData.length)
    for (let i = 0; i < floatData.length; i++) {
      let s = Math.max(-1, Math.min(1, floatData[i]))
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    const lame = await import('lamejs')
    const Mp3Encoder = lame.Mp3Encoder || (lame.default && lame.default.Mp3Encoder)
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
    // nothing to show in display; download button appears in UI
  }

  const toggleRecording = async () => {
    if (!recording) {
      ensureAudio()
      setRecording(true)
      recordedNotesRef.current = []
      recordBuffersRef.current = []
      setupRecorder()
      // display history only; no status text
    } else {
      setRecording(false)
      teardownRecorder()
      await exportMp3()
    }
  }

  const playbackRecordedNotes = () => {
    const notes = recordedNotesRef.current
    if (!notes.length) return
    let delay = 0
    notes.forEach((note) => {
      setTimeout(() => {
        playNote(note)
        setTimeout(() => stopNote(note), 500)
      }, delay)
      delay += 600
    })
  }

  const onLessonSelect = (selected) => {
    setLesson(selected)
    const notes = LESSON_NOTE_MAP[selected]
    setLessonNotes(notes)
    setCurrentLessonIndex(0)
  }

  const onInstrumentSelect = () => {
    const selected = prompt('Select an instrument:', instrument)
    if (selected && INSTRUMENTS.includes(selected)) {
      setInstrument(selected)
    }
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
      const audio = audioCtxRef.current
      if (audio) {
        for (const [, active] of oscillatorsRef.current.entries()) {
          try {
            active.gain.gain.linearRampToValueAtTime(0, audio.currentTime + 0.05)
            active.osc.stop(audio.currentTime + 0.05)
          } catch {}
        }
        oscillatorsRef.current.clear()
      }
    }
  }, [instrument])

  // Update metronome interval when BPM changes
  useEffect(() => {
    if (metronome) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current)
      metronomeTimerRef.current = setInterval(playClick, 60000 / bpm)
    }
  }, [bpm, metronome])

  // Update metronome interval when BPM changes
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
              onChange={(e) => onLessonSelect(e.target.value)}
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
            {lessonNotes.map((n, i) => {
              const isDone = i < currentLessonIndex
              const isTarget = i === currentLessonIndex
              const cls = `note-item${isDone ? ' correct' : ''}${
                isTarget ? ' target' : ''
              }`
              return (
                <div className={cls} key={`${n}-${i}`}>
                  {n}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="piano-keyboard" id="piano-keyboard">
        {WHITE_KEYS.map(({ note, freq, label }) => (
          <div
            key={note}
            className={`white-key ${pressed.has(note) ? 'active' : ''}`}
            data-note={note}
            data-frequency={freq}
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
          >
            {label}
          </div>
        ))}

        {BLACK_KEYS.map(({ note, freq, label }) => (
          <div
            key={note}
            className={`black-key ${pressed.has(note) ? 'active' : ''}`}
            data-note={note}
            data-frequency={freq}
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
          >
            {label}
          </div>
        ))}
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
                onChange={(e) => setInstrument(e.target.value)}
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
