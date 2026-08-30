import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX, ArrowLeft, Flame } from 'lucide-react';
import { formatTime } from '../../utils/gameEngine';

const GameHeader = ({
  gameTitle = 'Deductive Challenge',
  gameSlug,
  levelNumber,
  currentChallengeIndex,
  totalChallenges = 5,
  timeRemaining,
  score = 0,
  streak = 0,
  isMuted,
  onToggleMute,
}) => {
  const isUrgent = timeRemaining <= 10;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white px-3 sm:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-40 select-none shadow-sm transition-colors">
      {/* Left: Controls & Level */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Back / Exit Button */}
        <Link
          to={`/games/${gameSlug}`}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center shadow-xs cursor-pointer"
          title="Exit Game"
          aria-label="Exit Game"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </Link>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label="Toggle sound"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-500 stroke-[2.5]" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-200 stroke-[2.5]" />
          )}
        </button>

        {/* Level Capsule Badge */}
        <div className="px-3 sm:px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 tracking-wide shadow-xs flex items-center justify-center">
          Level {levelNumber}
        </div>
      </div>

      {/* Center: Vibrant Orange Score Banner */}
      <div className="flex items-center justify-center">
        <div className="bg-amber-500 text-slate-950 font-black text-sm sm:text-base px-5 sm:px-9 py-1 sm:py-1.5 rounded-xl shadow-md tracking-wider flex items-center gap-1.5 sm:gap-2">
          <span>{score}</span>
          {streak >= 2 && (
            <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded-md font-black uppercase flex items-center gap-0.5">
              <Flame className="w-3 h-3 fill-amber-400" />
              {streak}x
            </span>
          )}
        </div>
      </div>

      {/* Right: Countdown Timer & Game Title */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Countdown Timer */}
        <div
          className={`px-3 sm:px-4 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm tracking-wider border shadow-xs transition-all ${
            isUrgent
              ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white'
          }`}
        >
          {formatTime(timeRemaining)}
        </div>

        {/* Title */}
        <span className="hidden md:inline-block font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
          {gameTitle}
        </span>
      </div>
    </header>
  );
};

export default GameHeader;
