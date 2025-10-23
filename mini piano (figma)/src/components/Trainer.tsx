import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { usePiano } from '../contexts/PianoContext';
import { GraduationCap, Play, Pause, RotateCcw } from 'lucide-react';
import { LESSONS } from '../data/lessons';

export default function Trainer() {
  const { activeLesson, setActiveLesson, activeNotes } = usePiano();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [streak, setStreak] = useState(0);

  const lesson = activeLesson ? LESSONS.find(l => l.id === activeLesson) : null;
  const progress = lesson ? (currentStep / lesson.steps.length) * 100 : 0;

  useEffect(() => {
    if (!lesson || !isPlaying) return;

    const currentStepData = lesson.steps[currentStep];
    if (!currentStepData) return;

    // Check if the user played the correct notes
    const expectedNotes = new Set(currentStepData.notes);
    const playedNotes = new Set(Array.from(activeNotes));

    if (expectedNotes.size > 0 && playedNotes.size > 0) {
      const correct = [...expectedNotes].every(note => playedNotes.has(note));
      
      if (correct && playedNotes.size === expectedNotes.size) {
        // Correct! Move to next step
        setTimeout(() => {
          setStreak(prev => prev + 1);
          if (currentStep < lesson.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
          } else {
            // Lesson complete
            setIsPlaying(false);
            setAccuracy(100);
          }
        }, 500);
      }
    }
  }, [activeNotes, lesson, isPlaying, currentStep]);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setStreak(0);
    setAccuracy(100);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setStreak(0);
    setAccuracy(100);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-blue-600" />
        <h2>Trainer Mode</h2>
      </div>

      {/* Lesson Selection */}
      {!activeLesson && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">Choose a lesson to begin:</p>
          {LESSONS.map(lesson => (
            <Button
              key={lesson.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => setActiveLesson(lesson.id)}
            >
              <div className="text-left">
                <div>{lesson.name}</div>
                <div className="text-xs text-slate-500">{lesson.description}</div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {/* Active Lesson */}
      {activeLesson && lesson && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3>{lesson.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveLesson(null)}>
                Change
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{lesson.description}</p>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Current Step */}
          {lesson.steps[currentStep] && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Step {currentStep + 1} of {lesson.steps.length}
              </div>
              <div className="text-lg mb-2">{lesson.steps[currentStep].instruction}</div>
              <div className="flex flex-wrap gap-2">
                {lesson.steps[currentStep].notes.map((note, i) => (
                  <Badge key={i} variant={activeNotes.has(note) ? 'default' : 'outline'}>
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Accuracy</div>
              <div className="text-lg">{accuracy}%</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Streak</div>
              <div className="text-lg">{streak}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isPlaying ? (
              <Button onClick={handleStart} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="secondary" className="flex-1">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
