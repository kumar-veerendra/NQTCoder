import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, RefreshCw, ArrowRight, CheckCircle2, XCircle, Zap, Clock, Target, Flame } from 'lucide-react';
import { formatTime } from '../../utils/gameEngine';

const LevelResultModal = ({
  result,
  gameSlug,
  levelNumber,
  totalLevels = 5,
  onRetry,
  onNextLevel,
}) => {
  const {
    passed = false,
    score = 0,
    accuracy = 0,
    correctAnswers = 0,
    totalChallenges = 5,
    averageTime = 0,
    bestStreak = 0,
    xpEarned = 0,
    stars = 0,
    minAccuracyRequired = 70,
    unlockedNextLevel = false,
  } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-darkCard border border-darkBorder max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            passed ? 'bg-emerald-500/20' : 'bg-rose-500/15'
          }`}
        />

        {/* Status Icon & Title */}
        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl border">
            {passed ? (
              <div className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 p-3 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
            ) : (
              <div className="bg-rose-500/10 border-rose-500/30 text-rose-400 p-3 rounded-2xl">
                <XCircle className="w-10 h-10" />
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {passed ? 'LEVEL PASSED! 🎉' : 'LEVEL NOT PASSED'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {passed
              ? `Congratulations! You mastered Level ${levelNumber}.`
              : `Minimum ${minAccuracyRequired}% accuracy required to unlock the next level.`}
          </p>

          {/* Stars */}
          {passed && (
            <div className="flex items-center justify-center gap-1.5 mt-3 mb-1">
              {[1, 2, 3, 4, 5].map((sIndex) => (
                <Star
                  key={sIndex}
                  className={`w-6 h-6 transition-all ${
                    sIndex <= stars
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Unlock Alert Banner */}
          {unlockedNextLevel && (
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentBlue text-xs font-black uppercase tracking-wider animate-pulse">
              🔓 Level {levelNumber + 1} Unlocked!
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-6 text-left">
            {/* Score */}
            <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Score</span>
              </div>
              <span className="text-sm sm:text-base font-black text-white">{score.toLocaleString()}</span>
            </div>

            {/* Accuracy */}
            <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Target className="w-3 h-3 text-sky-400" />
                <span>Accuracy</span>
              </div>
              <span className={`text-sm sm:text-base font-black ${accuracy >= minAccuracyRequired ? 'text-emerald-400' : 'text-rose-400'}`}>
                {accuracy}%
              </span>
            </div>

            {/* XP Earned */}
            <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3 text-purple-400" />
                <span>XP Earned</span>
              </div>
              <span className="text-sm sm:text-base font-black text-purple-400">+{xpEarned} XP</span>
            </div>

            {/* Correct */}
            <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Solved</span>
              </div>
              <span className="text-sm sm:text-base font-black text-white">
                {correctAnswers}/{totalChallenges}
              </span>
            </div>

            {/* Avg Time */}
            <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Avg Time</span>
              </div>
              <span className="text-sm sm:text-base font-black text-white">{averageTime}s</span>
            </div>

            {/* Best Streak */}
            <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Streak</span>
              </div>
              <span className="text-sm sm:text-base font-black text-amber-400">{bestStreak} 🔥</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onRetry}
              className="w-full bg-darkBg hover:bg-slate-800 text-slate-200 border border-darkBorder py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Level</span>
            </button>

            {passed && levelNumber < totalLevels ? (
              <button
                onClick={onNextLevel}
                className="w-full bg-accentBtn hover:bg-accentBtnHover text-white py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-accentBlue/25 cursor-pointer"
              >
                <span>Next Level</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to={`/games/${gameSlug}`}
                className="w-full bg-accentBtn hover:bg-accentBtnHover text-white py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-accentBlue/25"
              >
                <span>Back to Game</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelResultModal;
