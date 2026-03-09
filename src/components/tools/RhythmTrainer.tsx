"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Shuffle } from "lucide-react";

type BeatType = "full" | "half" | "quarter";

interface Beat {
  type: BeatType;
}

function generatePattern(): Beat[] {
  const types: BeatType[] = ["full", "half", "quarter"];
  return Array.from({ length: 8 }, () => ({
    type: types[Math.floor(Math.random() * types.length)],
  }));
}

function playClick(ctx: AudioContext, type: BeatType) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Different sounds for different beat types
  osc.frequency.value = type === "full" ? 1000 : type === "half" ? 800 : 600;
  osc.type = "sine";
  
  const duration = type === "full" ? 0.08 : type === "half" ? 0.05 : 0.03;
  
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  osc.start(now);
  osc.stop(now + duration);
}

export function RhythmTrainer() {
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [pattern, setPattern] = useState<Beat[]>(() => generatePattern());
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const listenersAddedRef = useRef(false);

  const resumeContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      resumeContext();
      return;
    }

    // Use webkitAudioContext for older Safari
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContextRef.current = new AudioCtx();

    if (!listenersAddedRef.current) {
      // Mobile browser audio context resume handling
      const resumeOnInteraction = () => resumeContext();
      document.addEventListener("touchstart", resumeOnInteraction, { passive: true });
      document.addEventListener("touchend", resumeOnInteraction, { passive: true });
      document.addEventListener("click", resumeOnInteraction, { passive: true });

      // Resume when tab becomes visible again
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          resumeContext();
        }
      });

      // iOS/Safari unlock: play a silent buffer on first interaction
      let unlocked = false;
      const unlock = () => {
        if (unlocked) return;
        resumeContext();
        if (audioContextRef.current) {
          const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.start(0);
        }
        unlocked = true;
      };
      document.addEventListener("touchstart", unlock, { passive: true });
      document.addEventListener("click", unlock, { passive: true });

      listenersAddedRef.current = true;
    }
  }, [resumeContext]);

  const startPlayback = useCallback(() => {
    if (!audioContextRef.current) {
      initAudioContext();
    }
    
    resumeContext();
    
    const interval = 60000 / bpm; // milliseconds per beat
    let beatIndex = 0;
    
    const tick = () => {
      setCurrentBeat(beatIndex);
      
      if (audioContextRef.current) {
        playClick(audioContextRef.current, pattern[beatIndex].type);
      }
      
      beatIndex = (beatIndex + 1) % 8; // Loop back to 0 after 7
    };
    
    // Start immediately
    tick();
    
    intervalRef.current = setInterval(tick, interval);
    setIsPlaying(true);
  }, [bpm, pattern, initAudioContext, resumeContext]);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleNextPattern = () => {
    setPattern(generatePattern());
    // Keep playing at same BPM if already playing
  };

  const handleBpmChange = (value: number[]) => {
    setBpm(value[0]);
    // If playing, the change will take effect on the next beat cycle
    // We don't restart the loop immediately
  };

  const handleBpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 40 && value <= 200) {
      setBpm(value);
    }
  };

  // Initialize audio context on mount
  useEffect(() => {
    initAudioContext();
  }, [initAudioContext]);

  // Update interval when BPM changes during playback
  useEffect(() => {
    if (isPlaying) {
      // Stop current interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start new interval with updated BPM
      const interval = 60000 / bpm;
      let beatIndex = (currentBeat + 1) % 8;
      
      const tick = () => {
        setCurrentBeat(beatIndex);
        
        if (audioContextRef.current) {
          playClick(audioContextRef.current, pattern[beatIndex].type);
        }
        
        beatIndex = (beatIndex + 1) % 8;
      };
      
      intervalRef.current = setInterval(tick, interval);
    }
  }, [bpm, isPlaying, currentBeat, pattern]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopPlayback]);

  const getBeatSquareClassName = (index: number, beat: Beat) => {
    const isCurrentBeat = currentBeat === index;
    const baseClasses = "w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-lg transition-all duration-150 flex-shrink-0";
    
    if (isCurrentBeat) {
      return `${baseClasses} border-primary shadow-lg scale-110 ring-2 ring-primary/50`;
    }
    
    return `${baseClasses} border-muted`;
  };

  const getBeatSquareStyle = (beat: Beat) => {
    switch (beat.type) {
      case "full":
        return {
          background: "hsl(var(--primary))",
        };
      case "half":
        return {
          background: `linear-gradient(to right, hsl(var(--primary)) 50%, hsl(var(--muted)) 50%)`,
        };
      case "quarter":
        return {
          background: `linear-gradient(to right, hsl(var(--primary)) 25%, hsl(var(--muted)) 25%)`,
        };
      default:
        return {};
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Rhythm Trainer</h1>
        <p className="text-muted-foreground">
          Practice rhythm patterns with visual beats and metronome clicks
        </p>
      </div>

      {/* BPM Controls */}
      <div className="mb-8 space-y-4">
        <label htmlFor="bpm-slider" className="text-sm font-medium">
          BPM: {bpm}
        </label>
        <div className="flex items-center gap-4">
          <Slider
            id="bpm-slider"
            data-testid="bpm-slider"
            value={[bpm]}
            onValueChange={handleBpmChange}
            min={40}
            max={200}
            step={1}
            className="flex-1"
          />
          <input
            data-testid="bpm-input"
            type="number"
            value={bpm}
            onChange={handleBpmInputChange}
            min={40}
            max={200}
            className="w-20 px-3 py-1.5 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Beat Display */}
      <div className="mb-8">
        <div 
          className="flex justify-center gap-2 sm:gap-4 mb-4 flex-wrap"
          data-testid="rhythm-display"
        >
          {pattern.map((beat, index) => (
            <div
              key={index}
              className={getBeatSquareClassName(index, beat)}
              style={getBeatSquareStyle(beat)}
              data-testid={`beat-${index}`}
              title={`Beat ${index + 1}: ${beat.type}`}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ background: "hsl(var(--primary))" }} />
            <span>Full</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border" 
              style={{ background: "linear-gradient(to right, hsl(var(--primary)) 50%, hsl(var(--muted)) 50%)" }} 
            />
            <span>Half</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border" 
              style={{ background: "linear-gradient(to right, hsl(var(--primary)) 25%, hsl(var(--muted)) 25%)" }} 
            />
            <span>Quarter</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handlePlayPause}
          size="lg"
          data-testid="play-btn"
          className="min-w-[120px]"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>
        
        <Button
          onClick={handleNextPattern}
          variant="outline"
          size="lg"
          data-testid="next-btn"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Next Pattern
        </Button>
      </div>
    </div>
  );
}