import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Lock,
  CheckCircle2,
  Star,
  Trophy,
  Clock,
  Zap,
  Target,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Layers,
  Flame,
  Brain,
  BookOpen,
  Compass,
  Repeat,
  BarChart3,
  TrendingUp,
  Award,
} from 'lucide-react';
import * as gameService from '../../services/gameService';
import SEO from '../../components/SEO';

const GameDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGameDetails();
  }, [slug]);

  const fetchGameDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gameService.getGameBySlug(slug);
      setData(res);
    } catch (err) {
      console.error('Error fetching game details:', err);
      setError('Failed to load game details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accentBlue" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Loading Educational Guide...
        </span>
      </div>
    );
  }

  if (error || !data?.game) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-darkCard border border-darkBorder rounded-2xl text-center space-y-4">
        <p className="text-sm text-red-400">{error || 'Game not found.'}</p>
        <Link
          to="/games"
          className="inline-flex items-center gap-2 bg-accentBtn hover:bg-accentBtnHover text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Games Hub</span>
        </Link>
      </div>
    );
  }

  const { game, levels = [], userProgress = {} } = data;
  const highestUnlocked = userProgress?.highestUnlockedLevel || 1;

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <SEO
        title={`${game.name} — How to Play & Practice Guide | NQTCoder`}
        description={game.shortDescription || `Master ${game.name} for cognitive placement assessments.`}
        path={`/games/${game.slug}`}
      />

      {/* Back to Hub Nav */}
      <div className="mb-6">
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Games</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl bg-darkCard border border-darkBorder p-6 sm:p-10 mb-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accentBlue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap select-none">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-accentBlue/15 text-accentBlue border border-accentBlue/30">
                {game.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-darkBg px-2.5 py-1 rounded-md border border-darkBorder">
                {game.difficulty}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-darkBg px-2.5 py-1 rounded-md border border-darkBorder flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {game.estimatedTime || '10-15 mins'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {game.name} — How to Play & Practice
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {game.description || game.shortDescription}
            </p>

            {/* Companies Tagged */}
            <div className="flex items-center gap-2 pt-2 select-none">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Reported In:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {game.companyNames && game.companyNames.length > 0 ? (
                  game.companyNames.map((cName, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-darkBg text-white border border-darkBorder"
                    >
                      {cName}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-slate-400">Cognizant, Capgemini & Top Placement Drives</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Play CTA Card */}
          <div className="bg-darkBg/90 border border-darkBorder rounded-2xl p-6 md:w-72 shrink-0 space-y-4 text-center shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Progression</span>
              <div className="text-xl font-black text-white flex items-center justify-center gap-2">
                <Layers className="w-5 h-5 text-accentBlue" />
                <span>Level {highestUnlocked} of {game.totalLevels || 5}</span>
              </div>
            </div>

            {userProgress?.bestScore > 0 && (
              <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5 pt-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Best: {userProgress.bestScore.toLocaleString()} pts</span>
              </div>
            )}

            <button
              onClick={() => navigate(`/games/${game.slug}/level/${highestUnlocked}`)}
              className="w-full bg-accentBtn hover:bg-accentBtnHover text-white py-3 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-accentBlue/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Level {highestUnlocked}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Educational Details, Right Column Level Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Deep Dedicated Educational Guide */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Objective & Skills Tested */}
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                What is the Objective?
              </h3>
            </div>
            
            <div className="p-4 rounded-xl bg-darkBg/90 border border-emerald-500/25">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold">
                {game.objective || game.shortDescription}
              </p>
            </div>

            {/* Why Practice This Game? */}
            {game.whyPractice && (
              <div className="pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-white font-bold block mb-1">🧠 What does it test?</strong>
                {game.whyPractice}
              </div>
            )}

            {/* Skills breakdown pills */}
            {game.skills && game.skills.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Cognitive Competencies Evaluated:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {game.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold px-3 py-1 rounded-lg bg-darkBg text-slate-200 border border-darkBorder flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: How to Think About the Game & Mental Models */}
          {game.howToThink && (
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  How to Think About the Game
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {game.howToThink}
              </p>
            </div>
          )}

          {/* Section 3: Basic Rules & Common Transformations */}
          {game.commonRules && game.commonRules.length > 0 && (
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Basic Rules & Governing Logic
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {game.commonRules.map((ruleItem, idx) => (
                  <div
                    key={idx}
                    className="bg-darkBg/90 border border-darkBorder rounded-xl p-4 space-y-2"
                  >
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{ruleItem.title}</span>
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ruleItem.description}
                    </p>
                    {ruleItem.example && (
                      <div className="text-[11px] font-mono text-cyan-400/90 pt-1.5 border-t border-darkBorder/40">
                        {ruleItem.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: How to Play Step-by-Step */}
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-sky-400">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                How to Play — Step-by-Step
              </h3>
            </div>

            <ol className="space-y-3 text-xs sm:text-sm text-slate-300">
              {(game.instructions || []).map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-darkBg/60 p-3 rounded-xl border border-darkBorder/60">
                  <span className="w-6 h-6 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Section 5: Timer, Scoring & Streaks */}
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2 text-amber-400">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                ⏱️ Timer, 🏆 Scoring & 🔥 Streaks
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-darkBg p-4 rounded-xl border border-darkBorder space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Countdown Timer</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {game.timerDescription || 'Each challenge has a timer (30-60s). Practice accuracy first, then speed.'}
                </p>
              </div>

              <div className="bg-darkBg p-4 rounded-xl border border-darkBorder space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Scoring System</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Base 100 pts + up to +30 Speed Bonus, multiplied by level multiplier (×1.0 to ×2.0).
                </p>
              </div>

              <div className="bg-darkBg p-4 rounded-xl border border-darkBorder space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Streak Multiplier</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Consecutive correct answers build streak multipliers (🔥 3x, 🔥 5x).
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: Levels Breakdown & Placement Goal Roadmap */}
          {game.levelsGuide && game.levelsGuide.length > 0 && (
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-purple-400">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  📈 Level Roadmap & Difficulty Curve
                </h3>
              </div>

              <div className="space-y-3">
                {game.levelsGuide.map((lvlItem, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-darkBg/90 border border-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-black text-white">{lvlItem.title}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{lvlItem.description}</p>
                    </div>
                    {lvlItem.focus && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 px-2.5 py-1 rounded-md bg-purple-500/15 border border-purple-500/30 shrink-0 self-start sm:self-auto">
                        Focus: {lvlItem.focus}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {game.placementGoal && (
                <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                    🚀 Your Placement Readiness Goal:
                  </span>
                  <p className="text-xs font-semibold text-purple-200">
                    {game.placementGoal}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Section 7: Pro Tips for Placement Candidates */}
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                💡 Pro Tips for Placement Candidates
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {(game.tips || []).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-darkBg/50 p-2.5 rounded-xl border border-darkBorder/40">
                  <span className="text-amber-400 font-black">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 8: Interactive Example Walkthrough */}
          {game.example && (
            <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Example Walkthrough</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Educational Pattern</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-medium">{game.example.question}</p>

              {/* Render Example Grid if present (e.g. Geo-Sudo) */}
              {Array.isArray(game.example.grid) && (
                <div className="flex justify-center my-3">
                  <div className="inline-grid grid-cols-4 gap-1.5 p-3 bg-darkBg border border-darkBorder rounded-xl shadow-inner">
                    {game.example.grid.map((row, rIdx) =>
                      row.map((cell, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg border ${
                            cell === '?'
                              ? 'bg-accentBlue/20 border-accentBlue text-accentBlue animate-pulse font-black'
                              : 'bg-darkCard border-darkBorder text-slate-200'
                          }`}
                        >
                          {cell}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Correct Answer & Detailed Breakdown */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct Answer: {game.example.correctAnswer}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {game.example.explanation}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: 5-Level Progression Selector */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="border-b border-darkBorder pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Level Progression
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Pass each level with required accuracy to unlock the next challenge set
            </p>
          </div>

          <div className="space-y-3">
            {levels.map((lvl) => {
              const isUnlocked = lvl.levelNumber <= highestUnlocked;
              const isCompleted = (userProgress?.completedLevels || []).includes(lvl.levelNumber);
              const stars = lvl.stars || 0;

              return (
                <div
                  key={lvl._id || lvl.levelNumber}
                  className={`border rounded-2xl p-4 transition-all ${
                    isUnlocked
                      ? 'bg-darkCard border-darkBorder hover:border-accentBlue/50'
                      : 'bg-darkCard/50 border-darkBorder/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 select-none">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          Level {lvl.levelNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-darkBg px-2 py-0.5 rounded border border-darkBorder">
                          {lvl.difficulty || 'Medium'}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1">{lvl.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {lvl.description}
                      </p>
                    </div>

                    {/* Lock / Star Rating */}
                    <div className="shrink-0">
                      {isUnlocked ? (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((sIdx) => (
                            <Star
                              key={sIdx}
                              className={`w-3.5 h-3.5 ${
                                sIdx <= stars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-darkBg border border-darkBorder text-slate-600">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level Parameters */}
                  <div className="mt-3 pt-3 border-t border-darkBorder/60 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>⏱ {lvl.timeLimit || 60}s / challenge</span>
                    <span>Pass: ≥{lvl.passingCriteria?.minAccuracy || 70}% Acc</span>
                  </div>

                  {/* Play Action Button */}
                  <button
                    disabled={!isUnlocked}
                    onClick={() => navigate(`/games/${game.slug}/level/${lvl.levelNumber}`)}
                    className={`mt-3 w-full py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-accentBtn/15 hover:bg-accentBtn text-accentBlue hover:text-white border border-accentBlue/30 hover:border-accentBtn'
                        : 'bg-darkBg text-slate-600 border border-darkBorder/40 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCompleted ? 'Replay Level' : 'Start Level'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked (Pass Level {lvl.levelNumber - 1})</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDetails;
