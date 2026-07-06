import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as authService from '../services/authService';
import * as mockTestService from '../services/mockTestService';
import * as executionService from '../services/executionService';
import { Link, useLocation } from 'react-router-dom';

import ProfileSidebar from '../components/profile/ProfileSidebar';
import ActivityCalendar from '../components/profile/ActivityCalendar';
import DifficultyMetrics from '../components/profile/DifficultyMetrics';
import BadgesList from '../components/profile/BadgesList';
import SubmissionsLog from '../components/profile/SubmissionsLog';
import MockTestHistory from '../components/profile/MockTestHistory';
import ProfileSettings from '../components/profile/ProfileSettings';
import AptitudeMetrics from '../components/profile/AptitudeMetrics';
import * as practiceService from '../services/practiceService';
import { Bookmark, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

import {
  calculateStreakDetails,
  getRelativeTime,
  generateActivityData,
  getMonthLabels,
  getBadgesList
} from '../utils/profileHelpers';
import SEO from '../components/SEO';

const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [mockHistory, setMockHistory] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [aptitudeProgress, setAptitudeProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarks, setBookmarks] = useState([]);
  const [revisionQueue, setRevisionQueue] = useState([]);

  // Settings form states
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'submissions', 'mocktests', 'bookmarks', 'revision', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    fetchProfileDetails();
  }, [location.search]);

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, mocks, subs, aptProgress, bmarks, revQ] = await Promise.all([
        authService.getProfile(),
        mockTestService.getMockTestHistory(),
        executionService.getUserSubmissions(),
        practiceService.getPracticeProgress(),
        practiceService.getBookmarks(),
        practiceService.getRevisionQueue()
      ]);

      setProfile(data);
      setFullName(data.fullName || '');
      setBio(data.bio || '');
      setMockHistory(mocks);
      setUserSubmissions(subs);
      setAptitudeProgress(aptProgress);
      setBookmarks(bmarks);
      setRevisionQueue(revQ);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve user stats. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveMessage('');
    try {
      const data = await authService.updateProfile({ fullName, bio });
      setProfile(data);
      setFullName(data.fullName || '');
      setBio(data.bio || '');
      setSaveMessage('Profile changes saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Error updating profile settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accentBlue"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Compiling Profile Stats...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-darkCard border border-darkBorder rounded-lg text-center space-y-3">
        <p className="text-sm text-red-400">{error || 'Failed to locate user details.'}</p>
        <button
          onClick={fetchProfileDetails}
          className="bg-accentBlue hover:bg-accentBlue/90 text-white px-4 py-2 rounded-md text-xs font-semibold uppercase transition-colors"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  const solvedCount = profile.solvedQuestions?.length || 0;
  const submissionsCount = profile.submissionsCount || 0;
  const acceptanceRate = submissionsCount > 0 
    ? Math.round((solvedCount / submissionsCount) * 100) 
    : 0;

  // Professional Level Badge
  const userRank = solvedCount > 30 ? 'Grandmaster' : solvedCount > 15 ? 'Expert' : solvedCount > 5 ? 'Specialist' : 'Novice';

  // Chunk activity cells into 53 weeks (columns)
  const activityCells = generateActivityData(userSubmissions, mockHistory);
  const weeks = [];
  let currentWeek = [];
  
  activityCells.forEach((cell) => {
    currentWeek.push(cell);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const monthLabels = getMonthLabels(weeks);

  const { currentStreak, maxStreak } = calculateStreakDetails(userSubmissions);
  const solvedCountTotal = profile?.solvedQuestions?.length || 0;
  const mockCount = mockHistory?.length || 0;
  const proctorPerfectCount = mockHistory?.filter(m => m.tabSwitchesCount === 0 && m.status === 'completed').length || 0;

  const languagesUsed = [...new Set(userSubmissions.filter(s => s.status === 'Accepted').map(s => s.language))];
  const uniqueLangsCount = languagesUsed.length;

  const bestRuntime = userSubmissions.filter(s => s.status === 'Accepted' && s.runTime !== undefined)
    .reduce((min, s) => s.runTime < min ? s.runTime : min, Infinity);

  const badges = getBadgesList({
    maxStreak,
    solvedCountTotal,
    mockCount,
    proctorPerfectCount,
    uniqueLangsCount,
    bestRuntime
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="My Profile"
        description="View your NQTCoder profile, coding stats, activity calendar, badges, submission history, and mock test results."
        path="/profile"
        noIndex={true}
      />
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes shine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .badge-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .badge-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .badge-card:hover .animate-pulse-slow {
          animation: float 2.5s ease-in-out infinite;
        }
        .premium-shine {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .premium-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: 0.75s;
          pointer-events: none;
        }
        .badge-card:hover .premium-shine::after {
          left: 150%;
        }
        .badge-glow-blue {
          box-shadow: 0 4px 15px -3px rgba(59, 130, 246, 0.15);
        }
        .badge-glow-blue:hover {
          box-shadow: 0 8px 25px -3px rgba(59, 130, 246, 0.35);
          border-color: rgba(59, 130, 246, 0.5) !important;
        }
        .badge-glow-emerald {
          box-shadow: 0 4px 15px -3px rgba(16, 185, 129, 0.15);
        }
        .badge-glow-emerald:hover {
          box-shadow: 0 8px 25px -3px rgba(16, 185, 129, 0.35);
          border-color: rgba(16, 185, 129, 0.5) !important;
        }
        .badge-glow-amber {
          box-shadow: 0 4px 15px -3px rgba(245, 158, 11, 0.15);
        }
        .badge-glow-amber:hover {
          box-shadow: 0 8px 25px -3px rgba(245, 158, 11, 0.35);
          border-color: rgba(245, 158, 11, 0.5) !important;
        }
        .badge-glow-purple {
          box-shadow: 0 4px 15px -3px rgba(168, 85, 247, 0.15);
        }
        .badge-glow-purple:hover {
          box-shadow: 0 8px 25px -3px rgba(168, 85, 247, 0.35);
          border-color: rgba(168, 85, 247, 0.5) !important;
        }
        .badge-glow-rose {
          box-shadow: 0 4px 15px -3px rgba(244, 63, 94, 0.15);
        }
        .badge-glow-rose:hover {
          box-shadow: 0 8px 25px -3px rgba(244, 63, 94, 0.35);
          border-color: rgba(244, 63, 94, 0.5) !important;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.15);
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.3);
        }
      `}</style>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: User Profile Summary Card */}
        <ProfileSidebar 
          profile={profile} 
          userRank={userRank} 
          solvedCount={solvedCount} 
          submissionsCount={submissionsCount} 
          acceptanceRate={acceptanceRate} 
        />

        {/* RIGHT COLUMN: Tab Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-darkBorder pb-px select-none overflow-x-auto">
            {['overview', 'submissions', 'mocktests', 'bookmarks', 'revision', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all -mb-px whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-accentBlue text-accentBlue'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'overview' ? 'Overview' 
                  : tab === 'submissions' ? 'Submissions Log' 
                  : tab === 'mocktests' ? 'Mock Test History' 
                  : tab === 'bookmarks' ? `Bookmarks (${bookmarks.length})`
                  : tab === 'revision' ? `Revision Queue (${revisionQueue.length})`
                  : 'Settings'}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Contribution Calendar Heatmap */}
              <ActivityCalendar 
                activityCells={activityCells} 
                weeks={weeks} 
                monthLabels={monthLabels} 
              />

              {/* Difficulty & Aptitude Breakdown Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <DifficultyMetrics solvedCount={profile.solvedCount} difficultyTotals={profile.difficultyTotals} />
                <AptitudeMetrics progress={aptitudeProgress} />
              </div>

              {/* Achievements & Badges */}
              <BadgesList badges={badges} />
            </div>
          )}

          {/* TAB 2: SUBMISSIONS LOG */}
          {activeTab === 'submissions' && (
            <SubmissionsLog userSubmissions={userSubmissions} getRelativeTime={getRelativeTime} />
          )}

          {/* TAB 3: MOCK TEST HISTORY */}
          {activeTab === 'mocktests' && (
            <MockTestHistory mockHistory={mockHistory} />
          )}

          {/* TAB: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-6">
              <div className="border-b border-darkBorder pb-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Your Bookmarked Questions</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Flagged questions saved during practice sessions</p>
              </div>
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 bg-darkCard border border-darkBorder rounded-2xl text-slate-500 space-y-3">
                  <Bookmark className="w-12 h-12 mx-auto text-slate-700" />
                  <p className="text-xs font-bold">No bookmarks saved yet.</p>
                  <p className="text-xs text-slate-500">Flag questions inside the solver arena to save them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {bookmarks.map((bItem) => {
                    const q = bItem.questionId;
                    if (!q) return null;

                    return (
                      <div 
                        key={bItem._id} 
                        className="bg-darkCard border border-darkBorder hover:border-accentBlue rounded-2xl p-6 flex flex-col justify-between shadow transition-all duration-300 group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between select-none">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-darkBg border border-darkBorder text-slate-400">
                              {q.section || 'quant'}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : q.difficulty === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>

                          <p className="text-slate-200 text-xs font-semibold leading-relaxed line-clamp-3">
                            {q.content?.statement}
                          </p>
                        </div>

                        <Link
                          to={`/aptitude/arena/${q.topic}`}
                          className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-darkBorder hover:border-slate-500 mt-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Solve Bookmarked Set</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: REVISION QUEUE */}
          {activeTab === 'revision' && (
            <div className="space-y-6">
              <div className="border-b border-darkBorder pb-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Your Revision Queue</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Double-missed questions requiring focus and resolution</p>
              </div>
              {revisionQueue.length === 0 ? (
                <div className="text-center py-16 bg-darkCard border border-darkBorder rounded-2xl text-slate-500 space-y-3">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-emerald-400">Your Revision Queue is Empty!</p>
                  <p className="text-xs text-slate-500">Double-missed practice questions automatically show up here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {revisionQueue.map((rItem) => {
                    const q = rItem.questionId;
                    if (!q) return null;

                    return (
                      <div 
                        key={rItem._id} 
                        className="bg-darkCard border border-rose-500/20 hover:border-rose-500 rounded-2xl p-6 flex flex-col justify-between shadow transition-all duration-300 group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between select-none">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Double-Missed
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase">
                              Topic: {q.topic}
                            </span>
                          </div>

                          <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                            {q.content?.statement}
                          </p>
                        </div>

                        <Link
                          to={`/aptitude/arena/${q.topic}`}
                          className="w-full bg-rose-950 hover:bg-rose-900 border border-rose-500/35 text-rose-300 mt-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Resolve Flags</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <ProfileSettings
              fullName={fullName}
              setFullName={setFullName}
              bio={bio}
              setBio={setBio}
              saveLoading={saveLoading}
              saveMessage={saveMessage}
              onSubmit={handleSaveSettings}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
