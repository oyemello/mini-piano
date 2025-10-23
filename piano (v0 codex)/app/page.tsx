"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type KeyBinding = {
  note: string
  keyboard: string
  pitch: string
}

type WhiteKey = KeyBinding & {
  index: number
}

type BlackKey = KeyBinding & {
  index: number
  whiteIndex: number
}

type LessonStep = {
  keyId: number
  pitch: string
  display: string
}

type Lesson = {
  id: string
  label: string
  steps: LessonStep[]
}

type LessonStatus = "pending" | "correct"

type DisplayMode = "marquee" | "note" | "lesson" | "completeFlash" | "restartPrompt"

const INSTRUMENTS = {
  piano: { label: "Piano", waveform: "sine" as OscillatorType, attackGain: 0.2, releaseTime: 0.15 },
  organ: { label: "Organ", waveform: "square" as OscillatorType, attackGain: 0.22, releaseTime: 0.22 },
  synth: { label: "Synth", waveform: "sawtooth" as OscillatorType, attackGain: 0.18, releaseTime: 0.12 },
} as const

type InstrumentKey = keyof typeof INSTRUMENTS

type RecordedEvent = {
  keyId: number
  pitch: string
  timestamp: number
  source: "mouse" | "keyboard"
  instrument: InstrumentKey
}

type AudioGraph = {
  masterGain: GainNode
}

const WHITE_KEYS: WhiteKey[] = [
  { index: 0, note: "C", keyboard: "Tab", pitch: "C4" },
  { index: 1, note: "D", keyboard: "Q", pitch: "D4" },
  { index: 2, note: "E", keyboard: "W", pitch: "E4" },
  { index: 3, note: "F", keyboard: "E", pitch: "F4" },
  { index: 4, note: "G", keyboard: "R", pitch: "G4" },
  { index: 5, note: "A", keyboard: "T", pitch: "A4" },
  { index: 6, note: "B", keyboard: "Y", pitch: "B4" },
  { index: 7, note: "C", keyboard: "U", pitch: "C5" },
  { index: 8, note: "D", keyboard: "I", pitch: "D5" },
  { index: 9, note: "E", keyboard: "O", pitch: "E5" },
  { index: 10, note: "F", keyboard: "P", pitch: "F5" },
  { index: 11, note: "G", keyboard: "[", pitch: "G5" },
  { index: 12, note: "A", keyboard: "]", pitch: "A5" },
  { index: 13, note: "B", keyboard: "\\", pitch: "B5" },
]

const BLACK_KEYS: BlackKey[] = [
  { index: 0, whiteIndex: 0, note: "C#", keyboard: "1", pitch: "C#4" },
  { index: 1, whiteIndex: 1, note: "D#", keyboard: "2", pitch: "D#4" },
  { index: 2, whiteIndex: 3, note: "F#", keyboard: "4", pitch: "F#4" },
  { index: 3, whiteIndex: 4, note: "G#", keyboard: "5", pitch: "G#4" },
  { index: 4, whiteIndex: 5, note: "A#", keyboard: "6", pitch: "A#4" },
  { index: 5, whiteIndex: 7, note: "C#", keyboard: "8", pitch: "C#5" },
  { index: 6, whiteIndex: 8, note: "D#", keyboard: "9", pitch: "D#5" },
  { index: 7, whiteIndex: 10, note: "F#", keyboard: "-", pitch: "F#5" },
  { index: 8, whiteIndex: 11, note: "G#", keyboard: "=", pitch: "G#5" },
  { index: 9, whiteIndex: 12, note: "A#", keyboard: "Delete", pitch: "A#5" },
]

const PITCH_TO_KEY = new Map<string, { keyId: number; display: string }>()

WHITE_KEYS.forEach((key) => {
  PITCH_TO_KEY.set(key.pitch, { keyId: key.index, display: key.note })
})

BLACK_KEYS.forEach((key) => {
  PITCH_TO_KEY.set(key.pitch, { keyId: 100 + key.index, display: key.note })
})

const createLesson = (id: string, label: string, pitches: string[]): Lesson => {
  const steps: LessonStep[] = pitches
    .map((pitch) => {
      const entry = PITCH_TO_KEY.get(pitch)
      if (!entry) {
        console.warn(`Pitch ${pitch} is not available on the keyboard.`)
        return null
      }
      return { keyId: entry.keyId, pitch, display: entry.display }
    })
    .filter((step): step is LessonStep => step !== null)

  return { id, label, steps }
}

const LESSONS: Lesson[] = [
  createLesson("twinkle", "Twinkle Twinkle Little Star", [
    "C4",
    "C4",
    "G4",
    "G4",
    "A4",
    "A4",
    "G4",
    "F4",
    "F4",
    "E4",
    "E4",
    "D4",
    "D4",
    "C4",
  ]),
  createLesson("mary", "Mary Had a Little Lamb", [
    "E4",
    "D4",
    "C4",
    "D4",
    "E4",
    "E4",
    "E4",
    "D4",
    "D4",
    "D4",
    "E4",
    "G4",
    "G4",
  ]),
  createLesson("ode", "Ode to Joy", [
    "E4",
    "E4",
    "F4",
    "G4",
    "G4",
    "F4",
    "E4",
    "D4",
    "C4",
    "C4",
    "D4",
    "E4",
    "E4",
    "D4",
    "D4",
  ]),
  createLesson("scale", "C Major Scale", [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
  ]),
  createLesson("chords", "Basic Chord Progression", [
    "C4",
    "E4",
    "G4",
    "C4",
    "F4",
    "A4",
    "C5",
    "G4",
    "B4",
    "D4",
    "G4",
  ]),
]

const KEYBOARD_WIDTH = 1388
const KEYBOARD_HEIGHT = 300
const WHITE_KEY_COUNT = WHITE_KEYS.length
const KEY_TO_WHITE_ID = new Map<string, number>(
  WHITE_KEYS.map((key) => [key.keyboard.toLowerCase(), key.index])
)
const KEY_TO_BLACK_ID = new Map<string, number>(
  BLACK_KEYS.map((key) => [key.keyboard.toLowerCase(), 100 + key.index])
)
KEY_TO_BLACK_ID.set("backspace", 100 + 9)

type WhiteKeyGeometry = {
  index: number
  left: number
  width: number
}

type BlackKeyGeometry = {
  index: number
  left: number
}

const SEMITONE_STEPS: Record<string, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
}

function noteToFrequency(note: string): number | null {
  const match = note.match(/^([A-G])(#?)(\d)$/)
  if (!match) return null

  const [, letter, accidental, octaveStr] = match
  const key = `${letter}${accidental}` as keyof typeof SEMITONE_STEPS
  const semitone = SEMITONE_STEPS[key]
  const octave = Number(octaveStr)
  if (Number.isNaN(octave) || semitone === undefined) return null

  const midiNumber = (octave + 1) * 12 + semitone
  return 440 * Math.pow(2, (midiNumber - 69) / 12)
}

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AudioCtor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  return new AudioCtor()
}

export default function PianoPage() {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set())
  const activeKeysRef = useRef<Set<number>>(new Set())
  const [containerWidth, setContainerWidth] = useState(KEYBOARD_WIDTH)
  const pianoRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<Map<number, { oscillator: OscillatorNode; gain: GainNode; releaseTime: number }>>(new Map())
  const [instrument, setInstrument] = useState<InstrumentKey>("piano")
  const [isLessonsOpen, setIsLessonsOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<string>("")
  const [lessonProgress, setLessonProgress] = useState(0)
  const [lessonStatuses, setLessonStatuses] = useState<LessonStatus[]>([])
  const [displayMode, setDisplayMode] = useState<DisplayMode>("marquee")
  const [displayNote, setDisplayNote] = useState<string>("")
  const [showKeyBindings, setShowKeyBindings] = useState(true)
  const [bpmInput, setBpmInput] = useState("120")
  const bpmValue = useMemo(() => {
    const numeric = Number.parseInt(bpmInput, 10)
    if (Number.isNaN(numeric) || numeric <= 0) {
      return 120
    }
    return Math.min(300, Math.max(30, numeric))
  }, [bpmInput])
  const [isMetronomeActive, setIsMetronomeActive] = useState(false)
  const metronomeTimerRef = useRef<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const isRecordingRef = useRef(false)
  const recordStartRef = useRef<number>(0)
  const [recordedEvents, setRecordedEvents] = useState<RecordedEvent[]>([])
  const [hasRecording, setHasRecording] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const audioGraphRef = useRef<AudioGraph | null>(null)
  const recordingDataRef = useRef<{ left: Float32Array[]; right: Float32Array[] }>({ left: [], right: [] })
  const downloadUrlRef = useRef<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const finalizePromiseRef = useRef<Promise<string | null> | null>(null)
  const pendingDownloadRef = useRef(false)
  const selectedLessonRef = useRef<string>("")
  const idleTimerRef = useRef<number | null>(null)

  const effectiveWidth = Math.max(containerWidth, 1)
  const baseWhiteKeyWidth = effectiveWidth / WHITE_KEY_COUNT
  const blackKeyWidth = baseWhiteKeyWidth * 0.6
  const blackKeyHeight = KEYBOARD_HEIGHT * 0.6
  const currentLesson = useMemo(() => LESSONS.find((lesson) => lesson.id === selectedLesson) ?? null, [selectedLesson])

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  const scheduleIdleMarquee = useCallback(() => {
    if (currentLesson) return
    if (activeKeysRef.current.size > 0) return
    if (displayMode === "marquee") return
    clearIdleTimer()
    idleTimerRef.current = window.setTimeout(() => {
      setDisplayMode("marquee")
      idleTimerRef.current = null
    }, 5000)
  }, [currentLesson, displayMode, clearIdleTimer])

  const ensureAudioContext = useCallback(() => {
    let ctx = audioContextRef.current
    if (!ctx) {
      ctx = createAudioContext()
      if (!ctx) {
        return null
      }
      audioContextRef.current = ctx
    }

    if (!audioGraphRef.current) {
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(1, ctx.currentTime)
      masterGain.connect(ctx.destination)

      const recordingNode = ctx.createScriptProcessor(4096, 2, 2)
      const dummyGain = ctx.createGain()
      dummyGain.gain.setValueAtTime(0, ctx.currentTime)
      recordingNode.connect(dummyGain)
      dummyGain.connect(ctx.destination)
      masterGain.connect(recordingNode)

      recordingNode.onaudioprocess = (event) => {
        if (!isRecordingRef.current) {
          return
        }
        const inputBuffer = event.inputBuffer
        const leftData = inputBuffer.getChannelData(0)
        recordingDataRef.current.left.push(Float32Array.from(leftData))

        if (inputBuffer.numberOfChannels > 1) {
          const rightData = inputBuffer.getChannelData(1)
          recordingDataRef.current.right.push(Float32Array.from(rightData))
        }
      }

      audioGraphRef.current = { masterGain }
    }

    return { ctx, masterGain: audioGraphRef.current.masterGain }
  }, [])

  useEffect(() => {
    const element = pianoRef.current
    if (!element || typeof window === "undefined" || !("ResizeObserver" in window)) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        if (width > 0) {
          setContainerWidth((prev) => (Math.abs(prev - width) > 0.5 ? width : prev))
        }
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const whiteKeys = useMemo<WhiteKeyGeometry[]>(() => {
    let cursor = 0

    return Array.from({ length: WHITE_KEY_COUNT }, (_, index) => {
      const remainingWidth = effectiveWidth - cursor
      const width = index === WHITE_KEY_COUNT - 1 ? remainingWidth : baseWhiteKeyWidth
      const geometry = { index, left: cursor, width }

      cursor += width
      return geometry
    })
  }, [effectiveWidth, baseWhiteKeyWidth])

  const blackKeys = useMemo<BlackKeyGeometry[]>(() => {
    return BLACK_KEYS.map(({ index, whiteIndex }) => {
      const anchor = whiteKeys[whiteIndex]
      if (!anchor) return { index, left: 0 }

      const anchorRight = anchor.left + anchor.width
      const left = Math.min(
        Math.max(anchorRight - blackKeyWidth / 2, 0),
        Math.max(effectiveWidth - blackKeyWidth, 0)
      )

      return { index, left }
    })
  }, [whiteKeys, blackKeyWidth, effectiveWidth])

  useEffect(() => {
    selectedLessonRef.current = selectedLesson
  }, [selectedLesson])

  useEffect(() => {
    if (currentLesson && currentLesson.steps.length > 0) {
      setLessonProgress(0)
      setLessonStatuses(currentLesson.steps.map(() => "pending"))
      setDisplayMode("lesson")
    } else {
      setLessonProgress(0)
      setLessonStatuses([])
      setDisplayMode("marquee")
    }
  }, [currentLesson])

  const finalizeRecording = useCallback(async (): Promise<string | null> => {
    const leftBuffers = recordingDataRef.current.left

    try {
      const lamejs = await import("lamejs")
      const channelCount = recordingDataRef.current.right.length > 0 ? 2 : 1
      const sampleRate = audioContextRef.current?.sampleRate ?? 44100
      const encoder = new lamejs.Mp3Encoder(channelCount, sampleRate, 128)
      const mp3Chunks: Uint8Array[] = []

      const convertFloatToInt16 = (buffer: Float32Array) => {
        const length = buffer.length
        const result = new Int16Array(length)
        for (let i = 0; i < length; i++) {
          const s = Math.max(-1, Math.min(1, buffer[i]))
          result[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }
        return result
      }

      // If nothing was captured, encode a short silence so we still return a valid MP3
      if (leftBuffers.length === 0) {
        const silenceLength = Math.round(sampleRate * 0.5)
        const silence = new Float32Array(silenceLength)
        const silenceInt16 = convertFloatToInt16(silence)
        const mp3buf = encoder.encodeBuffer(silenceInt16)
        if (mp3buf.length > 0) mp3Chunks.push(new Uint8Array(mp3buf))
      }

      for (let i = 0; i < leftBuffers.length; i++) {
        const leftChunk = convertFloatToInt16(leftBuffers[i])
        let mp3buf: Int8Array | Uint8Array

        if (channelCount === 2) {
          const rightSource = recordingDataRef.current.right[i] ?? leftBuffers[i]
          const rightChunk = convertFloatToInt16(rightSource)
          mp3buf = encoder.encodeBuffer(leftChunk, rightChunk)
        } else {
          mp3buf = encoder.encodeBuffer(leftChunk)
        }

        if (mp3buf.length > 0) {
          mp3Chunks.push(new Uint8Array(mp3buf))
        }
      }

      const finalBuffer = encoder.flush()
      if (finalBuffer.length > 0) {
        mp3Chunks.push(new Uint8Array(finalBuffer))
      }

      const blob = new Blob(mp3Chunks, { type: "audio/mpeg" })
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current)
      }
      const url = URL.createObjectURL(blob)
      downloadUrlRef.current = url
      setDownloadUrl(url)
      setHasRecording(true)
      return url
    } catch (error) {
      console.error("Failed to export recording", error)
      setHasRecording(false)
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current)
        downloadUrlRef.current = null
      }
      setDownloadUrl(null)
      return null
    } finally {
      recordingDataRef.current = { left: [], right: [] }
    }
  }, [])

  const stopNote = useCallback((keyId: number) => {
    const ctx = audioContextRef.current
    const activeOscillator = oscillatorsRef.current.get(keyId)

    if (!ctx || !activeOscillator) return

    const { oscillator, gain, releaseTime } = activeOscillator
    const now = ctx.currentTime

    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    const release = releaseTime ?? 0.05
    gain.gain.linearRampToValueAtTime(0, now + release)

    oscillator.stop(now + release)
    oscillatorsRef.current.delete(keyId)
  }, [])

  const startNote = useCallback(
    async (keyId: number, pitch: string) => {
      const contextResult = ensureAudioContext()
      if (!contextResult) return
      const { ctx, masterGain } = contextResult
      const frequency = noteToFrequency(pitch)
      if (!ctx || !frequency) return

      const config = INSTRUMENTS[instrument]
      if (!config) return

      if (ctx.state === "suspended") {
        try {
          await ctx.resume()
        } catch (error) {
          console.error("Failed to resume audio context", error)
          return
        }
      }

      if (oscillatorsRef.current.has(keyId)) return

      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = config.waveform
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(config.attackGain, ctx.currentTime + 0.02)

      oscillator.connect(gain)
      gain.connect(masterGain)

      oscillator.start()
      oscillatorsRef.current.set(keyId, { oscillator, gain, releaseTime: config.releaseTime })

      // oscillator now managed by press/release; no additional guard here
    },
    [ensureAudioContext, instrument, stopNote]
  )

  const activateKey = useCallback(
    (keyId: number) => {
      setActiveKeys((prev) => {
        const next = new Set(prev)
        next.add(keyId)
        activeKeysRef.current = next
        return next
      })
    },
    [setActiveKeys]
  )

  const deactivateKey = useCallback(
    (keyId: number) => {
      setActiveKeys((prev) => {
        const next = new Set(prev)
        next.delete(keyId)
        activeKeysRef.current = next
        return next
      })
    },
    [setActiveKeys]
  )

  const pressKey = useCallback(
    (keyId: number, pitch: string, source: "mouse" | "keyboard") => {
      activateKey(keyId)
      void startNote(keyId, pitch)

      if (isRecordingRef.current) {
        const timestamp = performance.now() - recordStartRef.current
        setRecordedEvents((prev) => [
          ...prev,
          {
            keyId,
            pitch,
            timestamp,
            source,
            instrument,
          },
        ])
      }

      if (currentLesson && currentLesson.steps.length > 0) {
        const steps = currentLesson.steps
        const lessonId = currentLesson.id
        setLessonProgress((prevProgress) => {
          if (prevProgress >= steps.length) {
            return prevProgress
          }

          const expectedStep = steps[prevProgress]
          if (expectedStep.keyId !== keyId) {
            return prevProgress
          }

          setLessonStatuses((prevStatuses) => {
            const nextStatuses = [...prevStatuses]
            nextStatuses[prevProgress] = "correct"
            return nextStatuses
          })

          const nextProgress = prevProgress + 1

          if (nextProgress === steps.length) {
            // Completed lesson: show celebratory flash then restart prompt
            setDisplayMode("completeFlash")
            setTimeout(() => {
              if (selectedLessonRef.current !== lessonId) return
              setDisplayMode("restartPrompt")
            }, 1000)
          }

          return nextProgress
        })
      } else {
        // Free play: show the pressed note in the display
        const entry = PITCH_TO_KEY.get(pitch)
        if (entry) {
          setDisplayNote(entry.display)
          setDisplayMode("note")
          clearIdleTimer()
        } else {
          // Fallback to note name by stripping octave
          setDisplayNote(pitch.replace(/[0-9]/g, ""))
          setDisplayMode("note")
          clearIdleTimer()
        }
      }
    },
    [activateKey, startNote, instrument, currentLesson, clearIdleTimer]
  )

  const releaseKey = useCallback(
    (keyId: number) => {
      deactivateKey(keyId)
      stopNote(keyId)
      // If not in a lesson and no more keys held, schedule marquee after 5s
      if (!currentLesson && activeKeysRef.current.size === 0) {
        scheduleIdleMarquee()
      }
    },
    [deactivateKey, stopNote, currentLesson, scheduleIdleMarquee]
  )

  const handlePointerDown = useCallback(
    (keyId: number, pitch: string) => {
      pressKey(keyId, pitch, "mouse")
    },
    [pressKey]
  )

  const handlePointerUp = useCallback(
    (keyId: number) => {
      releaseKey(keyId)
    },
    [releaseKey]
  )

  const playMetronomeTick = useCallback(() => {
    const contextResult = ensureAudioContext()
    if (!contextResult) return
    const { ctx, masterGain } = contextResult

    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(2000, ctx.currentTime)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)

    oscillator.connect(gain)
    gain.connect(masterGain)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.13)
  }, [ensureAudioContext])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (!isMetronomeActive) {
      if (metronomeTimerRef.current !== null) {
        window.clearInterval(metronomeTimerRef.current)
        metronomeTimerRef.current = null
      }
      return
    }

    const intervalMs = (60 / bpmValue) * 1000
    playMetronomeTick()
    const id = window.setInterval(playMetronomeTick, intervalMs)
    metronomeTimerRef.current = id

    return () => {
      if (metronomeTimerRef.current !== null) {
        window.clearInterval(metronomeTimerRef.current)
        metronomeTimerRef.current = null
      }
    }
  }, [isMetronomeActive, bpmValue, playMetronomeTick])

  const handleInstrumentChange = useCallback((value: InstrumentKey) => {
    setInstrument(value)
  }, [])

  const handleBpmChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (/^\d*$/.test(value)) {
      setBpmInput(value)
    }
  }, [])

  const handleBpmBlur = useCallback(() => {
    setBpmInput(String(bpmValue))
  }, [bpmValue])

  const toggleMetronome = useCallback(() => {
    if (!isMetronomeActive && bpmInput.trim().length === 0) {
      setBpmInput("120")
    }
    setIsMetronomeActive((prev) => !prev)
  }, [bpmInput, isMetronomeActive])

  const handleRecordToggle = useCallback(() => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false
      setIsRecording(false)
      setIsFinalizing(true)
      const finalizePromise = finalizeRecording()
      finalizePromiseRef.current = finalizePromise
      void finalizePromise.finally(() => {
        finalizePromiseRef.current = null
        setIsFinalizing(false)
      })
    } else {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current)
        downloadUrlRef.current = null
      }
      finalizePromiseRef.current = null
      pendingDownloadRef.current = false
      isRecordingRef.current = true
      recordStartRef.current = performance.now()
      setRecordedEvents([])
      setHasRecording(false)
      setIsFinalizing(false)
      setDownloadUrl(null)
      recordingDataRef.current = { left: [], right: [] }
      setIsRecording(true)
    }
  }, [finalizeRecording])

  const triggerDownload = useCallback((url: string) => {
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "piano-recording.mp3"
    anchor.style.display = "none"
    const body = document.body
    if (!body) return
    body.appendChild(anchor)
    anchor.click()
    body.removeChild(anchor)
  }, [])

  const clearDownloadState = useCallback(() => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current)
      downloadUrlRef.current = null
    }
    setDownloadUrl(null)
    setHasRecording(false)
    setIsFinalizing(false)
  }, [])

  const handleDownload = useCallback(() => {
    if (!hasRecording && !isFinalizing) return

    if (downloadUrl) {
      triggerDownload(downloadUrl)
      clearDownloadState()
      return
    }

    const finalizePromise = finalizePromiseRef.current
    if (!finalizePromise || pendingDownloadRef.current) {
      return
    }

    pendingDownloadRef.current = true
    finalizePromise
      .then((url) => {
        if (url) {
          triggerDownload(url)
          clearDownloadState()
        }
      })
      .finally(() => {
        pendingDownloadRef.current = false
      })
  }, [hasRecording, isFinalizing, downloadUrl, triggerDownload, clearDownloadState])

  useEffect(() => {
    return () => {
      if (metronomeTimerRef.current !== null) {
        window.clearInterval(metronomeTimerRef.current)
      }
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current)
      }
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current)
      }
    }
  }, [])

  const canDownload = hasRecording || isFinalizing
  const lessonSteps = currentLesson?.steps ?? []
  const buttonBase =
    "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black/30"
  const metronomeButtonClasses = `${buttonBase} ${
    isMetronomeActive ? "bg-black text-white hover:bg-black/80" : "bg-[#F3F3F5] text-black hover:bg-[#E4E4E8]"
  }`
  const recordButtonClasses = `${buttonBase} ${
    isRecording ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#F3F3F5] text-black hover:bg-[#E4E4E8]"
  }`
  const downloadButtonClasses = `${buttonBase} ${
    canDownload ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`
  const controlFieldClasses =
    "h-10 rounded-md border border-[#D7D7D7] bg-white px-4 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-black/20"

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle restart prompt choices first
      if (displayMode === "restartPrompt") {
        const key = event.key.toLowerCase()
        if (key === "z") {
          // Restart the current lesson
          if (currentLesson) {
            setLessonProgress(0)
            setLessonStatuses(currentLesson.steps.map(() => "pending"))
            setDisplayMode("lesson")
          }
          event.preventDefault()
          return
        }
        if (key === "m") {
          // Clear and reset to marquee
          setSelectedLesson("")
          setDisplayMode("marquee")
          event.preventDefault()
          return
        }
      }
      // Any keypress is activity: cancel idle marquee timer
      clearIdleTimer()
      const key = event.key.toLowerCase()
      const whiteKeyId = KEY_TO_WHITE_ID.get(key)
      const blackKeyId = KEY_TO_BLACK_ID.get(key)

      const isBlackKey = typeof blackKeyId === "number"
      const isWhiteKey = typeof whiteKeyId === "number"

      if (!isBlackKey && !isWhiteKey) {
        return
      }

      event.preventDefault()

      if (isBlackKey) {
        const { pitch } = BLACK_KEYS[blackKeyId - 100]
        pressKey(blackKeyId, pitch, "keyboard")
      } else if (isWhiteKey) {
        const { pitch } = WHITE_KEYS[whiteKeyId]
        pressKey(whiteKeyId, pitch, "keyboard")
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const whiteKeyId = KEY_TO_WHITE_ID.get(key)
      const blackKeyId = KEY_TO_BLACK_ID.get(key)

      if (typeof blackKeyId === "number") {
        releaseKey(blackKeyId)
        event.preventDefault()
      }

      if (typeof whiteKeyId === "number") {
        releaseKey(whiteKeyId)
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pressKey, releaseKey, displayMode, currentLesson, clearIdleTimer])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[1428px] rounded-[20px] border-2 border-[#D7D7D7] bg-[#F3F3F5] p-5">
          <div className="flex w-full flex-col items-center gap-5">
            <div className="flex h-[104px] w-full max-w-[1388px] items-center justify-center rounded-[10px] border-2 border-[#D7D7D7] bg-black px-8">
              {displayMode === "marquee" && (
                <div className="marquee w-full">
                  <span className="marquee-inner font-digital text-4xl tracking-[0.3em] text-gray-400">
                    Pick a lesson to learn the keyboard
                  </span>
                </div>
              )}
              {displayMode === "note" && (
                <div className="font-digital text-6xl tracking-[0.2em] text-gray-100">{displayNote}</div>
              )}
              {displayMode === "lesson" && lessonSteps.length > 0 && (
                <div className="font-digital text-5xl tracking-[0.35em]">
                  {lessonSteps.map((step, index) => (
                    <span
                      key={`${step.pitch}-${index}`}
                      className={cn(
                        "mx-2 transition-colors duration-200",
                        lessonStatuses[index] === "correct" ? "text-green-400" : "text-gray-500"
                      )}
                    >
                      {step.display}
                    </span>
                  ))}
                </div>
              )}
              {displayMode === "completeFlash" && (
                <div className="font-digital text-5xl tracking-[0.25em] text-green-400">Yay! You did it</div>
              )}
              {displayMode === "restartPrompt" && (
                <div className="font-digital text-3xl tracking-[0.2em] text-gray-200">
                  Restart the lesson? Press &quot;z&quot; OR &quot;m&quot;
                </div>
              )}
            </div>
            <div
              className="w-full rounded-[10px] border-2 border-[#D7D7D7] bg-white p-6"
              style={{ maxWidth: `${KEYBOARD_WIDTH}px` }}
            >
            <div
              ref={pianoRef}
              className="relative overflow-hidden rounded-md"
              style={{ width: "100%", height: `${KEYBOARD_HEIGHT}px` }}
            >
              {/* White Keys */}
              {whiteKeys.map(({ index, left, width }) => {
                const { note, keyboard, pitch } = WHITE_KEYS[index]

                return (
                  <button
                    key={`white-${index}`}
                    onMouseDown={() => handlePointerDown(index, pitch)}
                    onMouseUp={() => handlePointerUp(index)}
                    onMouseLeave={() => handlePointerUp(index)}
                    className="absolute flex flex-col items-center justify-end gap-1 border border-black pb-2 transition-transform duration-75 hover:bg-gray-100"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      height: `${KEYBOARD_HEIGHT}px`,
                      backgroundColor: activeKeys.has(index) ? "#e5e5e5" : "#ffffff",
                      boxShadow: activeKeys.has(index)
                        ? "inset 0 4px 8px rgba(0,0,0,0.3)"
                        : "0 2px 4px rgba(0,0,0,0.1)",
                      transform: activeKeys.has(index) ? "translateY(2px)" : "translateY(0)",
                    }}
                    aria-label={`${note} key`}
                  >
                    <span className="text-sm font-semibold text-black">{note}</span>
                    {showKeyBindings && (
                      <span className="text-xs uppercase text-neutral-500">{keyboard}</span>
                    )}
                  </button>
                )
              })}

              {/* Black Keys */}
              {blackKeys.map(({ index, left }) => {
                const keyId = 100 + index
                const { note, keyboard, pitch } = BLACK_KEYS[index]

                return (
                  <button
                    key={`black-${index}`}
                    onMouseDown={() => handlePointerDown(keyId, pitch)}
                    onMouseUp={() => handlePointerUp(keyId)}
                    onMouseLeave={() => handlePointerUp(keyId)}
                    className="absolute flex flex-col items-center justify-end gap-1 border border-black pb-2 transition-transform duration-75 hover:bg-gray-800"
                    style={{
                      left: `${left}px`,
                      width: `${blackKeyWidth}px`,
                      height: `${blackKeyHeight}px`,
                      backgroundColor: activeKeys.has(keyId) ? "#1a1a1a" : "#000000",
                      zIndex: 10,
                      boxShadow: activeKeys.has(keyId)
                        ? "inset 0 2px 4px rgba(0,0,0,0.5)"
                        : "0 2px 4px rgba(0,0,0,0.4)",
                      transform: activeKeys.has(keyId) ? "translateY(2px)" : "translateY(0)",
                    }}
                    aria-label={`${note} sharp key`}
                  >
                    <span className="text-xs font-semibold text-white">{note}</span>
                    {showKeyBindings && (
                      <span className="text-[10px] uppercase text-neutral-200">{keyboard}</span>
                    )}
                  </button>
                )
              })}
              <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-black" />
            </div>
          </div>
          <div className="flex h-[104px] w-full max-w-[1388px] flex-wrap items-center justify-between gap-4 rounded-[10px] border-2 border-[#D7D7D7] bg-white px-6 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  className={buttonBase}
                  onClick={() => setIsLessonsOpen((prev) => !prev)}
                  variant={isLessonsOpen ? "default" : "outline"}
                >
                  {isLessonsOpen ? "Hide Lessons" : "Lessons"}
                </Button>
                {isLessonsOpen && (
                  <Select
                    value={selectedLesson}
                    onValueChange={(value) => {
                      setSelectedLesson(value)
                    }}
                  >
                    <SelectTrigger className={`${controlFieldClasses} w-56`}>
                      <SelectValue placeholder="Choose a lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {LESSONS.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-600">Instrument</span>
                <Select
                  value={instrument}
                  onValueChange={(value) => handleInstrumentChange(value as InstrumentKey)}
                >
                  <SelectTrigger className={`${controlFieldClasses} w-40`}>
                    <SelectValue placeholder="Instrument" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(INSTRUMENTS) as InstrumentKey[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {INSTRUMENTS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-600">Show Key Bindings</span>
                <Switch checked={showKeyBindings} onCheckedChange={setShowKeyBindings} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-600">BPM</span>
                <Input
                  aria-label="Set BPM"
                  className={`${controlFieldClasses} w-24 text-center`}
                  inputMode="numeric"
                  maxLength={3}
                  onBlur={handleBpmBlur}
                  onChange={handleBpmChange}
                  placeholder="120"
                  value={bpmInput}
                />
              </div>
              <Button type="button" className={metronomeButtonClasses} onClick={toggleMetronome}>
                {isMetronomeActive ? "Metronome On" : "Metronome"}
              </Button>
              {false && (
                <>
                  <Button type="button" className={recordButtonClasses} onClick={handleRecordToggle}>
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                  <Button
                    type="button"
                    className={downloadButtonClasses}
                    disabled={!canDownload}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
