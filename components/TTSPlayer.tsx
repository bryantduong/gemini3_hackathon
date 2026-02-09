import React, { useEffect, useState } from 'react';
import { Play, Pause, FastForward, SkipBack, X } from 'lucide-react';

interface TTSPlayerProps {
  textToRead: string;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onClose: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ 
  textToRead, 
  speed, 
  onSpeedChange, 
  onClose,
  isPlaying,
  setIsPlaying
}) => {
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Clean up text for speech (remove markdown basics if any remain)
    const cleanText = textToRead.replace(/[*#_]/g, '');
    const u = new SpeechSynthesisUtterance(cleanText);
    u.rate = speed;
    
    // Select a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && !v.name.includes('Google')) || voices[0];
    if (preferredVoice) u.voice = preferredVoice;

    u.onend = () => setIsPlaying(false);
    setUtterance(u);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [textToRead]); // Re-create utterance if text changes (e.g. document load)

  // Handle dynamic speed changes
  useEffect(() => {
    if (utterance) {
      // Chrome has a bug where you can't change rate mid-speech easily without restart
      // For simplicity in this demo, we'll just set it for the next play
      utterance.rate = speed;
    }
    // If we are currently playing, we'd need to pause/cancel and restart to apply new speed immediately
    // but that disrupts the flow. We'll accept that speed changes apply on next play segment.
  }, [speed, utterance]);

  const togglePlay = () => {
    if (!utterance) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel(); // Safety clear
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-full shadow-2xl flex items-center gap-6 z-50 border border-slate-700">
      <div className="flex items-center gap-2">
         <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Reader</span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); togglePlay(); }}
          className="hover:text-brand-400 transition-colors"
        >
          <SkipBack size={20} />
        </button>

        <button 
          onClick={togglePlay}
          className="bg-white text-slate-900 p-3 rounded-full hover:bg-brand-400 hover:text-white transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
          {[0.75, 1, 1.5, 2].map((r) => (
            <button
              key={r}
              onClick={() => onSpeedChange(r)}
              className={`text-xs font-bold px-2 py-1 rounded ${speed === r ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>

      <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white">
        <X size={20} />
      </button>
    </div>
  );
};