import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

const Timer = ({ durationMinutes = 20, isEnabled = true, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Initialize and reset the timer ONLY when the duration parameter changes (new question loaded)
  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
    setIsPaused(false);
  }, [durationMinutes]);

  useEffect(() => {
    if (!isEnabled || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (onTimeout) {
            onTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isEnabled, isPaused]);

  const handleReset = () => {
    setTimeLeft(durationMinutes * 60);
    setIsPaused(false);
  };

  if (!isEnabled) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 120; // 2 minutes

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div
      className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 shadow-md ${
        isUrgent
          ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse font-black'
          : 'bg-darkCard border-darkBorder text-slate-200'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
      ) : (
        <TimerIcon className="w-4 h-4 text-accentBlue shrink-0" />
      )}
      
      <span className="text-[10px] font-bold tracking-wider uppercase hidden sm:inline">Time:</span>
      
      <span className="text-md font-mono font-bold tracking-widest shrink-0">
        {formatNumber(minutes)}:{formatNumber(seconds)}
      </span>

      <div className="w-px h-4 bg-darkBorder shrink-0"></div>

      <div className="flex items-center space-x-1 shrink-0">
        {/* Manual Pause / Play control button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          type="button"
          className="p-1 hover:bg-darkBg/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title={isPaused ? "Resume Timer" : "Pause Timer"}
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {/* Manual Reset button */}
        <button
          onClick={handleReset}
          type="button"
          className="p-1 hover:bg-darkBg/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Restart Timer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default Timer;
