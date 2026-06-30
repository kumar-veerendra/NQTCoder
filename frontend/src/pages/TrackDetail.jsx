import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as trackService from '../services/trackService';
import { 
  ChevronLeft, Play, CheckCircle2, Lock, Tag, Compass, Calendar, 
  HelpCircle, ShieldCheck, Award, Target, BookOpen 
} from 'lucide-react';
import SEO from '../components/SEO';

const TrackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [track, setTrack] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrackDetails();
  }, [id]);

  const fetchTrackDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await trackService.getTrackById(id);
      setTrack(data.track);
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve practice track details. Verify server state.');
    } finally {
      setLoading(false);
    }
  };

  const handleSolveQuestion = async (q) => {
    try {
      // Record access tracking
      await trackService.updateTrackLastAccessed(id, q._id);
      navigate(`/problem/${q.slug || q._id}`);
    } catch (err) {
      console.error('Failed to log last accessed question', err);
      // Navigate anyway to not block user
      navigate(`/problem/${q.slug || q._id}`);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10';
      case 'Medium': return 'text-amber-400 border-amber-500/25 bg-amber-500/10';
      case 'Hard': return 'text-rose-400 border-rose-500/25 bg-rose-500/10';
      default: return 'text-slate-400 border-slate-500/25 bg-slate-500/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Opening practice roadmap...</span>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-darkCard border border-darkBorder rounded-lg text-center space-y-4">
        <Target className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-white">Oops! Practice Track Load Error</h2>
        <p className="text-sm text-slate-400">{error || 'Requested practice track was not found.'}</p>
        <button
          onClick={() => navigate('/tracks')}
          className="bg-accentBlue hover:bg-accentBlue/90 text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Back to Learning Tracks
        </button>
      </div>
    );
  }

  const completedCount = questions.filter(q => q.solved).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title={track ? `${track.title} Track Detail` : "Track Detail"}
        description="Structured roadmap timeline and progress tracking for NQTCoder tracks."
        path={`/tracks/${id}`}
        noIndex={true}
      />
      
      {/* 1. Header Navigation Option */}
      <div className="flex items-center space-x-4 border-b border-darkBorder pb-5">
        <button
          onClick={() => navigate('/tracks')}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-darkCard rounded-md transition-all"
          title="Back to Tracks"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[9px] font-bold uppercase text-accentBlue tracking-wider">Learning Tracks Wizard</span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">{track.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side Track Summary */}
        <div className="lg:col-span-1 bg-darkCard border border-darkBorder rounded-lg p-5 space-y-5 shadow relative overflow-hidden">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-darkBg border border-darkBorder text-slate-300">
                {track.type}
              </span>
              {track.month && (
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {track.month}
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {track.description || 'Practice curated questions sequentially to complete this path.'}
            </p>
          </div>

          {/* Details list */}
          <div className="space-y-3 pt-4 border-t border-darkBorder/40 select-none">
            {track.company && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Target Company:</span>
                <span className="text-slate-300 font-bold uppercase">{track.company}</span>
              </div>
            )}
            {track.category && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Category:</span>
                <span className="text-slate-300 font-bold uppercase">{track.category}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold">Total Challenges:</span>
              <span className="text-slate-300 font-bold">{totalCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold">Completed:</span>
              <span className="text-emerald-400 font-bold">{completedCount}</span>
            </div>
          </div>

          {/* Progress bar info */}
          <div className="pt-4 border-t border-darkBorder/40 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              <span>Path Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-darkBg rounded overflow-hidden border border-darkBorder/30">
              <div 
                className="h-full bg-accentBlue transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Side Question Items List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
            <BookOpen className="w-4 h-4 text-accentBlue mr-2" />
            Curated Questions Flow
          </h2>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div 
                key={question._id}
                className={`bg-darkCard border rounded-lg p-4 flex items-center justify-between transition-all group ${
                  question.solved 
                    ? 'border-emerald-500/20 hover:border-emerald-500/30' 
                    : 'border-darkBorder hover:border-accentBlue'
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0">
                  {/* Solved indicator bullet */}
                  <div className="shrink-0 select-none">
                    {question.solved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:border-accentBlue group-hover:text-accentBlue transition-all">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className={`text-sm font-bold tracking-wide truncate ${
                      question.solved ? 'text-slate-400 line-through' : 'text-slate-200'
                    }`}>
                      {question.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 text-[10px] select-none">
                      <span className={`font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-slate-500 flex items-center font-semibold">
                        <Tag className="w-3 h-3 text-slate-600 mr-1" />
                        {question.topic}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Solve Action Button */}
                <button
                  onClick={() => handleSolveQuestion(question)}
                  className={`shrink-0 ml-4 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition-colors ${
                    question.solved
                      ? 'bg-darkBg hover:bg-darkCard text-slate-300 border border-darkBorder'
                      : 'bg-accentBlue hover:bg-accentBlue/90 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>{question.solved ? 'Re-Solve' : 'Solve'}</span>
                </button>

              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default TrackDetail;
