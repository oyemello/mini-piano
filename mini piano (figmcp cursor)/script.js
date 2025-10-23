// Mini Piano Application
class MiniPiano {
    constructor() {
        this.audioContext = null;
        this.oscillators = new Map();
        this.pressedKeys = new Set();
        this.currentLesson = 'Do-Re-Mi (C Major Scale)';
        this.currentInstrument = 'Grand Piano';
        this.bpm = 120;
        this.isRecording = false;
        this.isMetronomeOn = false;
        this.recordedNotes = [];
        this.lessonNotes = ['C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4'];
        
        this.init();
    }

    init() {
        this.setupAudioContext();
        this.setupEventListeners();
        this.updateDisplay();
        this.renderLessonNotes();
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported');
        }
    }

    setupEventListeners() {
        // Piano key events
        const pianoKeys = document.querySelectorAll('.white-key, .black-key');
        pianoKeys.forEach(key => {
            key.addEventListener('mousedown', (e) => this.playNote(e.target));
            key.addEventListener('mouseup', (e) => this.stopNote(e.target));
            key.addEventListener('mouseleave', (e) => this.stopNote(e.target));
            
            // Touch events for mobile
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playNote(e.target);
            });
            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopNote(e.target);
            });
        });

        // Computer keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Control buttons
        document.getElementById('metronome-btn').addEventListener('click', () => this.toggleMetronome());
        document.getElementById('record-btn').addEventListener('click', () => this.toggleRecording());

        // Lesson selector
        document.querySelector('.lesson-selector').addEventListener('click', () => this.showLessonMenu());
        
        // Instrument selector
        document.querySelector('.instrument-selector').addEventListener('click', () => this.showInstrumentMenu());
    }

    playNote(keyElement) {
        if (!this.audioContext) return;

        // Ensure audio context is running (some browsers start suspended until user interaction)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const note = keyElement.dataset.note;
        const frequency = parseFloat(keyElement.dataset.frequency);
        
        if (this.oscillators.has(note)) return; // Already playing

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = this.getInstrumentType();
        
        // Envelope for smoother sound
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        
        oscillator.start();
        this.oscillators.set(note, { oscillator, gainNode });
        
        // Visual feedback
        keyElement.classList.add('active');
        this.pressedKeys.add(note);
        this.updatePressedKeysDisplay();
        this.updateDisplay(`Playing: ${note}`);

        // Recording support
        if (this.isRecording) {
            this.recordedNotes.push(note);
        }
    }

    stopNote(keyElement) {
        const note = keyElement.dataset.note;
        
        if (this.oscillators.has(note)) {
            const { oscillator, gainNode } = this.oscillators.get(note);
            
            // Fade out
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            oscillator.stop(this.audioContext.currentTime + 0.1);
            
            this.oscillators.delete(note);
        }
        
        // Visual feedback
        keyElement.classList.remove('active');
        this.pressedKeys.delete(note);
        this.updatePressedKeysDisplay();
        
        if (this.pressedKeys.size === 0) {
            this.updateDisplay('Ready to Play');
        }
    }

    getInstrumentType() {
        switch (this.currentInstrument) {
            case 'Grand Piano': return 'sine';
            case 'Electric Piano': return 'triangle';
            case 'Organ': return 'sawtooth';
            case 'Synthesizer': return 'square';
            default: return 'sine';
        }
    }

    handleKeyDown(event) {
        const keyMap = {
            'KeyA': 'C4', 'KeyS': 'D4', 'KeyD': 'E4', 'KeyF': 'F4', 'KeyG': 'G4',
            'KeyH': 'A4', 'KeyJ': 'B4', 'KeyK': 'C5', 'KeyL': 'D5', 'Semicolon': 'E5',
            'Quote': 'F5', 'KeyZ': 'C#4', 'KeyX': 'D#4', 'KeyC': 'F#4', 'KeyV': 'G#4',
            'KeyB': 'A#4', 'KeyN': 'C#5', 'KeyM': 'D#5', 'Comma': 'F#5', 'Period': 'G#5',
            'Slash': 'A#5'
        };

        const note = keyMap[event.code];
        if (note && !event.repeat) {
            const keyElement = document.querySelector(`[data-note="${note}"]`);
            if (keyElement) {
                this.playNote(keyElement);
            }
        }
    }

    handleKeyUp(event) {
        const keyMap = {
            'KeyA': 'C4', 'KeyS': 'D4', 'KeyD': 'E4', 'KeyF': 'F4', 'KeyG': 'G4',
            'KeyH': 'A4', 'KeyJ': 'B4', 'KeyK': 'C5', 'KeyL': 'D5', 'Semicolon': 'E5',
            'Quote': 'F5', 'KeyZ': 'C#4', 'KeyX': 'D#4', 'KeyC': 'F#4', 'KeyV': 'G#4',
            'KeyB': 'A#4', 'KeyN': 'C#5', 'KeyM': 'D#5', 'Comma': 'F#5', 'Period': 'G#5',
            'Slash': 'A#5'
        };

        const note = keyMap[event.code];
        if (note) {
            const keyElement = document.querySelector(`[data-note="${note}"]`);
            if (keyElement) {
                this.stopNote(keyElement);
            }
        }
    }

    updateDisplay(message = 'Ready to Play') {
        document.getElementById('display-text').textContent = message;
    }

    updatePressedKeysDisplay() {
        const pressedKeysElement = document.getElementById('pressed-keys');
        if (this.pressedKeys.size === 0) {
            pressedKeysElement.textContent = 'N/A';
        } else {
            pressedKeysElement.textContent = Array.from(this.pressedKeys).join(', ');
        }
    }

    renderLessonNotes() {
        const notesContainer = document.getElementById('notes-container');
        notesContainer.innerHTML = '';
        
        this.lessonNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.textContent = note;
            notesContainer.appendChild(noteElement);
        });
    }

    toggleMetronome() {
        this.isMetronomeOn = !this.isMetronomeOn;
        const btn = document.getElementById('metronome-btn');
        
        if (this.isMetronomeOn) {
            btn.classList.add('active');
            this.startMetronome();
        } else {
            btn.classList.remove('active');
            this.stopMetronome();
        }
    }

    startMetronome() {
        if (!this.audioContext) return;
        
        const interval = 60000 / this.bpm; // Convert BPM to milliseconds
        this.metronomeInterval = setInterval(() => {
            this.playMetronomeClick();
        }, interval);
    }

    stopMetronome() {
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }
    }

    playMetronomeClick() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    toggleRecording() {
        this.isRecording = !this.isRecording;
        const btn = document.getElementById('record-btn');
        
        if (this.isRecording) {
            btn.classList.add('active');
            this.recordedNotes = [];
            this.updateDisplay('Recording...');
        } else {
            btn.classList.remove('active');
            this.updateDisplay('Recording stopped');
            this.playbackRecordedNotes();
        }
    }

    playbackRecordedNotes() {
        if (this.recordedNotes.length === 0) return;
        
        this.updateDisplay('Playing back recording...');
        let delay = 0;
        
        this.recordedNotes.forEach(note => {
            setTimeout(() => {
                const keyElement = document.querySelector(`[data-note="${note}"]`);
                if (keyElement) {
                    this.playNote(keyElement);
                    setTimeout(() => this.stopNote(keyElement), 500);
                }
            }, delay);
            delay += 600;
        });
        
        setTimeout(() => {
            this.updateDisplay('Ready to Play');
        }, delay);
    }

    showLessonMenu() {
        const lessons = [
            'Do-Re-Mi (C Major Scale)',
            'Twinkle Twinkle Little Star',
            'Mary Had a Little Lamb',
            'Happy Birthday',
            'Chopsticks'
        ];
        
        // Simple alert for now - could be enhanced with a proper modal
        const selectedLesson = prompt('Select a lesson:', this.currentLesson);
        if (selectedLesson && lessons.includes(selectedLesson)) {
            this.currentLesson = selectedLesson;
            document.querySelector('.lesson-name').textContent = selectedLesson;
            this.updateLessonNotes(selectedLesson);
        }
    }

    showInstrumentMenu() {
        const instruments = [
            'Grand Piano',
            'Electric Piano', 
            'Organ',
            'Synthesizer'
        ];
        
        const selectedInstrument = prompt('Select an instrument:', this.currentInstrument);
        if (selectedInstrument && instruments.includes(selectedInstrument)) {
            this.currentInstrument = selectedInstrument;
            document.querySelector('.instrument-name').textContent = selectedInstrument;
        }
    }

    updateLessonNotes(lesson) {
        const lessonNoteMap = {
            'Do-Re-Mi (C Major Scale)': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            'Twinkle Twinkle Little Star': ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'],
            'Mary Had a Little Lamb': ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'D4', 'D4', 'E4', 'G4', 'G4'],
            'Happy Birthday': ['C4', 'C4', 'D4', 'C4', 'F4', 'E4', 'C4', 'C4', 'D4', 'C4', 'G4', 'F4'],
            'Chopsticks': ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4']
        };
        
        this.lessonNotes = lessonNoteMap[lesson] || this.lessonNotes;
        this.renderLessonNotes();
    }
}

// Initialize the piano when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.piano = new MiniPiano();
});

// Handle audio context unlock on first user interaction
document.addEventListener('click', () => {
    const piano = window.piano;
    if (!piano) return;

    if (!piano.audioContext) {
        piano.setupAudioContext();
    } else if (piano.audioContext.state === 'suspended') {
        piano.audioContext.resume();
    }
}, { once: true });
