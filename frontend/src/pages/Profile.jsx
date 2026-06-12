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

import {
  calculateStreakDetails,
  getRelativeTime,
  generateActivityData,
  getMonthLabels,
  getBadgesList
} from '../utils/profileHelpers';

const Profile = () => {
  const { user: authUser } = useContext(AuthContext);
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [mockHistory, setMockHistory] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'submissions', 'mocktests', 'settings'

  // Settings form states
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'submissions', 'mocktests', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    fetchProfileDetails();
  }, [location.search]);

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setBio(data.bio || '');
      
      const mocks = await mockTestService.getMockTestHistory();
      setMockHistory(mocks);

      const subs = await executionService.getUserSubmissions();
      setUserSubmissions(subs);
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
          <div className="flex items-center space-x-2 border-b border-darkBorder pb-px select-none">
            {['overview', 'submissions', 'mocktests', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all -mb-px ${
                  activeTab === tab
                    ? 'border-accentBlue text-accentBlue'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'submissions' ? 'Submissions Log' : tab === 'mocktests' ? 'Mock Test History' : 'Settings'}
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

              {/* Difficulty Breakdown Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <DifficultyMetrics solvedCount={profile.solvedCount} difficultyTotals={profile.difficultyTotals} />
                <BadgesList badges={badges} />
              </div>
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
