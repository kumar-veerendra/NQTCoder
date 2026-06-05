import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as trackService from '../services/trackService';
import { 
  Code2, Award, BookOpen, ChevronRight, Play, RefreshCw, 
  Tag, Compass, Target, Calendar, CheckCircle2 
} from 'lucide-react';

const Tracks = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'company', 'topic'

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await trackService.getTracks();
      setTracks(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve learning tracks. Please verify server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueTrack = async (trackId) => {
    try {
      const trackData = await trackService.getTrackById(trackId);
      const { questions, lastAccessedQuestion } = trackData;

      if (!questions || questions.length === 0) {
        alert('This learning track does not contain any questions yet.');
        return;
      }

      // Find the next target question:
      // 1. If lastAccessedQuestion is present and unsolved, go there
      // 2. Otherwise find the first unsolved question
      // 3. If all solved, default to the first question in the track
      let targetQuestion = null;
      
      if (lastAccessedQuestion) {
        const accessedQ = questions.find(q => q._id === lastAccessedQuestion);
        if (accessedQ && !accessedQ.solved) {
          targetQuestion = accessedQ;
        }
      }

      if (!targetQuestion) {
        targetQuestion = questions.find(q => !q.solved);
      }

      if (!targetQuestion) {
        targetQuestion = questions[0]; // Rollback to first if all solved
      }

      // Record access on backend
      await trackService.updateTrackLastAccessed(trackId, targetQuestion._id);
      
      // Navigate to problem arena
      navigate(`/problem/${targetQuestion._id}`);
    } catch (err) {
      console.error('Failed to resolve track target', err);
      alert('Error continuing practice track.');
    }
  };

  const filteredTracks = tracks.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.type === activeFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-darkCard border border-darkBorder p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs text-accentBlue uppercase font-black tracking-widest flex items-center justify-center md:justify-start">
            <Compass className="w-4 h-4 mr-1.5" /> Curated Learning Roadmaps
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            NQTCoder <span className="text-accentBlue">Learning Tracks</span>
          </h1>
          <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
            Accelerate your practice with hand-picked challenges. Master topic fundamentals or solve real company assessment shifts sequentially with real-time analytics tracking.
          </p>
        </div>
        <div className="flex items-center space-x-4 shrink-0 bg-darkBg/60 border border-darkBorder p-3 rounded-lg">
          <div className="text-center px-4 border-r border-darkBorder/60">
            <div className="text-xl font-extrabold text-accentBlue">
              {tracks.filter(t => t.progressPercent === 100).length}
            </div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Completed</div>
          </div>
          <div className="text-center px-4">
            <div className="text-xl font-extrabold text-slate-300">
              {tracks.filter(t => t.progressPercent > 0 && t.progressPercent < 100).length}
            </div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">In Progress</div>
          </div>
        </div>
      </div>

      {/* 2. Filter Toggles */}
      <div className="flex items-center justify-between border-b border-darkBorder pb-4">
        <div className="flex space-x-2">
          {['all', 'company', 'topic'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md border text-xs font-bold tracking-wider uppercase transition-all ${
                activeFilter === filter
                  ? 'bg-accentBlue border-accentBlue text-white'
                  : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-accentBlue/30'
              }`}
            >
              {filter === 'all' ? 'All Tracks' : `${filter} Tracks`}
            </button>
          ))}
        </div>

        <button
          onClick={fetchTracks}
          className="p-2 text-slate-400 hover:text-accentBlue bg-darkCard border border-darkBorder hover:border-accentBlue/30 rounded-md transition-all"
          title="Refresh Progress"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Track Cards Grid */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-5 rounded-lg text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Assembling learning modules...</span>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-lg text-slate-500 space-y-3">
          <Target className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-xs font-bold">No practice roadmaps found matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track) => {
            const isCompleted = track.progressPercent === 100;
            const hasStarted = track.progressPercent > 0;

            return (
              <div 
                key={track._id} 
                className="bg-darkCard border border-darkBorder hover:border-accentBlue rounded-lg p-5 flex flex-col justify-between shadow transition-all duration-250 relative overflow-hidden group"
              >
                <div className="space-y-4 relative z-10">
                  {/* Category badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-darkBg border border-darkBorder text-slate-300">
                      {track.type}
                    </span>

                    {/* Auto Generated Mode Tag */}
                    {track.isAutoGenerated && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        Auto Match
                      </span>
                    )}

                    {track.month && (
                      <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        {track.month}
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 
                      onClick={() => navigate(`/tracks/${track._id}`)}
                      className="text-base font-bold text-white tracking-wide hover:text-accentBlue cursor-pointer transition-colors"
                    >
                      {track.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {track.description || 'No roadmap description provided.'}
                    </p>
                  </div>

                  {/* Company / Topic Info tags */}
                  <div className="flex flex-wrap gap-2 pt-1 select-none">
                    {track.company && (
                      <span className="text-[9px] bg-darkBg border border-darkBorder px-2 py-0.5 rounded font-bold uppercase text-slate-400 tracking-wider">
                        🏢 {track.company}
                      </span>
                    )}
                    {track.category && (
                      <span className="text-[9px] bg-darkBg border border-darkBorder px-2 py-0.5 rounded font-bold uppercase text-slate-400 tracking-wider">
                        🏷️ {track.category}
                      </span>
                    )}
                    <span className="text-[9px] bg-darkBg border border-darkBorder px-2 py-0.5 rounded font-bold uppercase text-slate-400 tracking-wider">
                      🎯 {track.totalQuestions} Questions
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="mt-5 pt-4 border-t border-darkBorder/40 space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500 flex items-center">
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5 shrink-0" />
                          <span className="text-emerald-400">Track Finished</span>
                        </>
                      ) : (
                        <span>Solved: {track.completedQuestions} / {track.totalQuestions}</span>
                      )}
                    </span>
                    <span className={isCompleted ? 'text-emerald-400' : 'text-slate-300'}>
                      {track.progressPercent}%
                    </span>
                  </div>

                  {/* Progress Line Bar */}
                  <div className="h-1.5 w-full bg-darkBg rounded overflow-hidden border border-darkBorder/30">
                    <div 
                      className={`h-full rounded transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-accentBlue'
                      }`}
                      style={{ width: `${track.progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => navigate(`/tracks/${track._id}`)}
                      className="flex-grow bg-darkBg hover:bg-darkCard text-slate-300 hover:text-white border border-darkBorder px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View Path</span>
                    </button>

                    <button
                      onClick={() => handleContinueTrack(track._id)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-accentBlue hover:bg-accentBlue/90 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      <span>{isCompleted ? 'Review' : hasStarted ? 'Continue' : 'Start'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Tracks;
