import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { soundManager } from '../../utils/soundEffects';
import {
  calculateChallengeScore,
  evaluateLevelPass,
  calculateStars,
  formatTime,
} from '../../utils/gameEngine';
import { generatePuzzleForGame } from '../../generators';
import * as gameService from '../../services/gameService';
import GameHeader from '../../components/games/GameHeader';
import LevelResultModal from '../../components/games/LevelResultModal';
import GameCanvasDispatcher from '../../components/games/canvases/GameCanvasDispatcher';
import SEO from '../../components/SEO';
import { CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

const GameArena = () => {
  const { slug, levelNumber: levelNumParam } = useParams();
  const levelNumber = parseInt(levelNumParam, 10) || 1;
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [levelConfig, setLevelConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Game Play State
  const [challenges, setChallenges] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [challengeTimes, setChallengeTimes] = useState([]);
  const [answersLog, setAnswersLog] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong' | null
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const timerRef = useRef(null);
  const challengeStartRef = useRef(Date.now());

  // 1. Fetch Game and Level Data
  useEffect(() => {
    fetchGameAndInitLevel();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slug, levelNumber]);

  const fetchGameAndInitLevel = async () => {
    setLoading(true);
    setError('');
    setIsCompleted(false);
    setFinalResult(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnswersLog([]);
    setChallengeTimes([]);
    setSelectedAnswer(null);
    setFeedbackState(null);

    try {
      const data = await gameService.getGameBySlug(slug);
      if (!data?.game) {
        setError('Game not found.');
        return;
      }
      setGame(data.game);

      const lvl = (data.levels || []).find((l) => l.levelNumber === levelNumber) || {
        levelNumber,
        name: `Level ${levelNumber}`,
        timeLimit: 50,
        scoreMultiplier: 1.0 + (levelNumber - 1) * 0.2,
        passingCriteria: { minAccuracy: 70 },
        totalChallenges: 5,
        difficultyConfig: { gridSize: levelNumber >= 4 ? 5 : 4, missingCells: levelNumber * 2 },
      };
      setLevelConfig(lvl);

      // Generate 5 dynamic puzzles for this level session
      const totalCount = lvl.totalChallenges || 5;
      const generated = [];
      for (let i = 0; i < totalCount; i++) {
        const puzzle = generatePuzzleForGame(data.game.gameType || 'geo-sudo', {
          levelNumber: lvl.levelNumber,
          round: i + 1,
          ...(lvl.difficultyConfig || {}),
        });
        generated.push(puzzle);
      }

      setChallenges(generated);
      setCurrentIdx(0);
      setTimeRemaining(lvl.timeLimit || 50);
      challengeStartRef.current = Date.now();
    } catch (err) {
      console.error('Error starting game session:', err);
      setError('Could not initialize game session.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Timer Loop
  useEffect(() => {
    if (loading || isCompleted || challenges.length === 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 6) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, isCompleted, currentIdx, challenges]);

  const handleTimeExpired = () => {
    if (feedbackState !== null) return;
    handleAnswerSubmit(null, true);
  };

  // 3. User Answer Submission Handler
  const handleAnswerSubmit = (chosenOption, isTimeout = false) => {
    if (feedbackState !== null || isCompleted) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentPuzzle = challenges[currentIdx];
    const duration = Math.max(1, Math.round((Date.now() - challengeStartRef.current) / 1000));
    setChallengeTimes((prev) => [...prev, duration]);

    const isCorrect = !isTimeout && chosenOption === currentPuzzle.correctAnswer;
    setSelectedAnswer(chosenOption);
    setFeedbackState(isCorrect ? 'correct' : 'wrong');

    // Score & Streak
    let newStreak = streak;
    if (isCorrect) {
      soundManager.playCorrect();
      newStreak = streak + 1;
      if (newStreak >= 3) {
        soundManager.playStreak();
      }
      const challengeScore = calculateChallengeScore({
        isCorrect: true,
        timeRemaining,
        timeLimit: levelConfig?.timeLimit || 50,
        levelMultiplier: levelConfig?.scoreMultiplier || 1.0,
        streak: newStreak,
      });
      setScore((prev) => prev + challengeScore.total);
    } else {
      soundManager.playWrong();
      newStreak = 0;
    }

    setStreak(newStreak);
    setMaxStreak((prev) => Math.max(prev, newStreak));
    setAnswersLog((prev) => [...prev, { isCorrect, chosenOption, timeTaken: duration }]);

    // Move to next challenge or finish level after brief delay
    setTimeout(() => {
      if (currentIdx + 1 < challenges.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedAnswer(null);
        setFeedbackState(null);
        setTimeRemaining(levelConfig?.timeLimit || 50);
        challengeStartRef.current = Date.now();
      } else {
        finishLevelSession(
          isCorrect ? score + 100 : score,
          [...answersLog, { isCorrect, chosenOption, timeTaken: duration }],
          [...challengeTimes, duration],
          Math.max(maxStreak, newStreak)
        );
      }
    }, 900);
  };

  // 4. End of Level Session Calculation & Persistence
  const finishLevelSession = async (finalScore, allAnswers, allTimes, bestStr) => {
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalChallenges = allAnswers.length || 5;
    const correctCount = allAnswers.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / totalChallenges) * 100);
    const totalTime = allTimes.reduce((acc, t) => acc + t, 0);
    const averageTime = allTimes.length > 0 ? Math.round(totalTime / allTimes.length) : 0;
    const fastestTime = allTimes.length > 0 ? Math.min(...allTimes) : 0;

    const passEval = evaluateLevelPass({
      accuracy,
      correctAnswers: correctCount,
      totalChallenges,
      passingCriteria: levelConfig?.passingCriteria || { minAccuracy: 70 },
      averageTime,
    });

    const stars = calculateStars({ accuracy, averageTime });

    if (passEval.passed) {
      soundManager.playLevelPassed();
    } else {
      soundManager.playLevelFailed();
    }

    const payload = {
      score: finalScore,
      accuracy,
      totalChallenges,
      correctAnswers: correctCount,
      wrongAnswers: totalChallenges - correctCount,
      totalTime,
      averageTime,
      fastestTime,
      bestStreak: bestStr,
      minAccuracyRequired: levelConfig?.passingCriteria?.minAccuracy || 70,
    };

    try {
      const serverResponse = await gameService.submitLevelAttempt(slug, levelNumber, payload);
      setFinalResult({
        ...payload,
        passed: passEval.passed,
        stars,
        xpEarned: serverResponse.xpEarned || (passEval.passed ? 150 : 50),
        unlockedNextLevel: serverResponse.unlockedNextLevel || (passEval.passed && levelNumber < 5),
      });
    } catch (err) {
      console.error('Error submitting level attempt:', err);
      setFinalResult({
        ...payload,
        passed: passEval.passed,
        stars,
        xpEarned: passEval.passed ? 150 : 50,
        unlockedNextLevel: passEval.passed && levelNumber < 5,
      });
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleRetry = () => {
    fetchGameAndInitLevel();
  };

  const handleNextLevel = () => {
    navigate(`/games/${slug}/level/${levelNumber + 1}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accentBlue" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Generating Level {levelNumber} Challenges...
        </span>
      </div>
    );
  }

  if (error || !game || challenges.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-darkCard border border-darkBorder rounded-2xl text-center space-y-4">
        <p className="text-sm text-red-400">{error || 'Session failed to load.'}</p>
        <button
          onClick={() => navigate(`/games/${slug}`)}
          className="bg-accentBtn hover:bg-accentBtnHover text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
        >
          Back to Game
        </button>
      </div>
    );
  }

  const currentPuzzle = challenges[currentIdx] || {};

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-darkBg text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      <SEO
        title={`${game.name} — Level ${levelNumber} | NQTCoder`}
        description={`Play ${game.name} Level ${levelNumber}`}
        path={`/games/${slug}/level/${levelNumber}`}
      />

      {/* Top Arena HUD Header */}
      <GameHeader
        gameTitle={game.name}
        gameSlug={game.slug}
        levelNumber={levelNumber}
        currentChallengeIndex={currentIdx}
        totalChallenges={challenges.length}
        timeRemaining={timeRemaining}
        score={score}
        streak={streak}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Puzzle Arena Area */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <div className="w-full bg-white dark:bg-darkCard/80 border border-slate-200 dark:border-darkBorder rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md transition-colors">
          
          {/* Visual Feedback Banner on selection */}
          {feedbackState && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-fadeIn z-30 ${
                feedbackState === 'correct'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {feedbackState === 'correct' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct! +Points</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Incorrect!</span>
                </>
              )}
            </div>
          )}

          {/* Modular Game Canvas Dispatcher */}
          <GameCanvasDispatcher
            gameType={game.gameType || 'geo-sudo'}
            puzzle={currentPuzzle}
            selectedAnswer={selectedAnswer}
            feedbackState={feedbackState}
            onSelectAnswer={(chosen) => handleAnswerSubmit(chosen)}
          />

        </div>
      </main>

      {/* Level Result End Modal */}
      {isCompleted && finalResult && (
        <LevelResultModal
          result={finalResult}
          gameSlug={slug}
          levelNumber={levelNumber}
          totalLevels={game.totalLevels || 5}
          onRetry={handleRetry}
          onNextLevel={handleNextLevel}
        />
      )}
    </div>
  );
};

export default GameArena;
