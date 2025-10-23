import React, { useEffect } from 'react';
import { PianoProvider } from './contexts/PianoContext';
import TopBar from './components/TopBar';
import Piano from './components/Piano';
import InfoPanel from './components/InfoPanel';
import InstrumentControls from './components/InstrumentControls';
import Trainer from './components/Trainer';
import Recorder from './components/Recorder';
import SettingsDialog from './components/SettingsDialog';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  useEffect(() => {
    // Check if we need user gesture to unlock audio
    const unlockAudio = () => {
      toast.info('Click anywhere to enable audio', {
        duration: 3000,
      });
    };

    // Most browsers require user interaction before audio can play
    const handleFirstClick = () => {
      document.removeEventListener('click', handleFirstClick);
    };
    
    document.addEventListener('click', handleFirstClick);
    
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  return (
    <PianoProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <TopBar />
        
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Full Width: Piano */}
            <Piano />
            <InstrumentControls />
            
            {/* Below: Info + Trainer + Recorder */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoPanel />
              <Trainer />
              <Recorder />
            </div>
          </div>
        </div>

        <SettingsDialog />
        <Toaster />
      </div>
    </PianoProvider>
  );
}
