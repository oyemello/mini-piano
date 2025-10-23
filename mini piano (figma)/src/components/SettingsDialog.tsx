import React from 'react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { usePiano } from '../contexts/PianoContext';

export default function SettingsDialog() {
  const { showKeyLabels, setShowKeyLabels, darkMode, setDarkMode } = usePiano();

  return null; // Settings can be expanded in a dialog if needed
}
