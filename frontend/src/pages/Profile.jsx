import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as authService from '../services/authService';
import * as mockTestService from '../services/mockTestService';
import * as executionService from '../services/executionService';
import { 
  User, Award, BookOpen, Percent, Flame, CircleDot, ChevronRight, 
  Activity, Calendar, History, CheckCircle, ExternalLink, GraduationCap,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

  const getRelativeTime = (dateVal) => {
    const now = new Date();
    const subDate = new Date(dateVal);
    const diffMs = now - subDate;
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return subDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const generateActivityData = () => {
    const activityMap = {};
    
    // Count user submissions per day
    userSubmissions.forEach(sub => {
      if (sub.createdAt) {
        const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    });

    // Also count mock tests completed per day (weighted slightly higher for activity visual)
    mockHistory.forEach(test => {
      const dateVal = test.completedAt || test.createdAt;
      if (dateVal) {
        const dateStr = new Date(dateVal).toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 3;
      }
    });

    const today = new Date();
    const cells = [];
    
    // Generate last 53 weeks starting on Sunday (53 * 7 = 371 days)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day);
    
    for (let i = 0; i < 371; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      
      cells.push({
        date: dateStr,
        count,
        dayOfWeek: currentDate.getDay()
      });
    }

    return cells;
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
  const activityCells = generateActivityData();
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

  // Get month labels with wIdx
  const getMonthLabels = () => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wIdx) => {
      if (week && week[0]) {
        const d = new Date(week[0].date + 'T00:00:00');
        const month = d.getMonth();
        if (month !== lastMonth) {
          labels.push({
            wIdx,
            label: d.toLocaleDateString(undefined, { month: 'short' })
          });
          lastMonth = month;
        }
      }
    });
    return labels;
  };
  const monthLabels = getMonthLabels();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-darkBg text-slate-100 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: User Profile Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-darkCard border border-darkBorder rounded-lg p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-accentBlue text-white flex items-center justify-center font-bold text-3xl uppercase border-2 border-slate-700 select-none mx-auto shadow-md">
              {(profile.username || 'U')[0]}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white tracking-wide truncate">
                {profile.fullName || profile.username}
              </h2>
              {profile.fullName && (
                <p className="text-[10px] text-slate-400 font-bold tracking-wider">@{profile.username}</p>
              )}
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{profile.email}</p>
            </div>

            {profile.bio && (
              <p className="text-xs text-slate-300 italic px-3 py-2 bg-darkBg/30 border border-darkBorder/40 rounded-lg leading-relaxed text-left break-words">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-darkBorder/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Rank</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-darkBg text-accentBlue px-2 py-0.5 border border-darkBorder rounded">
                  {userRank}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">System Role</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-darkBg text-slate-300 px-2 py-0.5 border border-darkBorder rounded">
                  {profile.role}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Member Since</span>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  {new Date(profile.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Stats summary box */}
          <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4 select-none">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
              <GraduationCap className="w-4 h-4 text-accentBlue mr-2" /> Overall Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-darkBg/40 border border-darkBorder p-3 rounded-md">
                <div className="text-md font-black text-white">{solvedCount}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Solved</div>
              </div>
              <div className="bg-darkBg/40 border border-darkBorder p-3 rounded-md">
                <div className="text-md font-black text-white">{submissionsCount}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Attempts</div>
              </div>
            </div>

            <div className="bg-darkBg/40 border border-darkBorder p-3 rounded-md text-center">
              <div className="text-md font-black text-emerald-400">{acceptanceRate}%</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Success Rate</div>
            </div>
          </div>
        </div>

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
              <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wide select-none">
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 text-accentBlue mr-2" /> Activity Calendar
                  </span>
                  <span className="text-slate-500">Streak details over last 365 days</span>
                </div>
                
                {activityCells.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">No activity recorded.</div>
                ) : (
                  <div className="space-y-2">
                    <div className="overflow-x-auto select-none py-2">
                      <div className="min-w-[780px] select-none py-1">
                        {/* Month names row */}
                        <div className="relative h-5 mb-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          {monthLabels.map((m, idx) => (
                            <div 
                              key={idx} 
                              className="absolute" 
                              style={{ left: `${m.wIdx * 14 + 34}px` }}
                            >
                              {m.label}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Heatmap Grid */}
                        <div className="flex gap-1.5">
                          {/* Day-of-week labels */}
                          <div className="flex flex-col text-[9px] text-slate-500 font-bold h-[94px] justify-between text-right select-none w-7 pr-2.5">
                            <span className="h-2.5 leading-none"></span>
                            <span className="h-2.5 leading-none">Mon</span>
                            <span className="h-2.5 leading-none"></span>
                            <span className="h-2.5 leading-none">Wed</span>
                            <span className="h-2.5 leading-none"></span>
                            <span className="h-2.5 leading-none">Fri</span>
                            <span className="h-2.5 leading-none"></span>
                          </div>

                          {/* Weeks Columns */}
                          <div className="flex gap-1 flex-1 justify-between">
                            {weeks.map((week, wIdx) => (
                              <div key={wIdx} className="flex flex-col gap-1">
                                {week.map((cell, cIdx) => {
                                  const cellDate = new Date(cell.date + 'T00:00:00');
                                  const todayMidnight = new Date();
                                  todayMidnight.setHours(0, 0, 0, 0);
                                  const isFuture = cellDate > todayMidnight;
                                  
                                  let cellClass = 'calendar-cell-0';
                                  if (cell.count > 0 && cell.count <= 2) cellClass = 'calendar-cell-1';
                                  else if (cell.count > 2 && cell.count <= 5) cellClass = 'calendar-cell-2';
                                  else if (cell.count > 5 && cell.count <= 8) cellClass = 'calendar-cell-3';
                                  else if (cell.count > 8) cellClass = 'calendar-cell-4';
                                  
                                  return (
                                    <div 
                                      key={cIdx} 
                                      className={`w-2.5 h-2.5 rounded-sm transition-all ${
                                        isFuture 
                                          ? 'opacity-0 pointer-events-none' 
                                          : `cursor-pointer hover:scale-125 ${cellClass}`
                                      }`}
                                      title={isFuture ? '' : `${cell.count} activities on ${new Date(cell.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                    ></div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Calendar color indicator legend */}
                    <div className="flex items-center justify-end space-x-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider select-none pr-1">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-sm calendar-cell-0"></div>
                      <div className="w-2.5 h-2.5 rounded-sm calendar-cell-1"></div>
                      <div className="w-2.5 h-2.5 rounded-sm calendar-cell-2"></div>
                      <div className="w-2.5 h-2.5 rounded-sm calendar-cell-3"></div>
                      <div className="w-2.5 h-2.5 rounded-sm calendar-cell-4"></div>
                      <span>More</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty Breakdown Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side Progress Bars */}
                <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
                    <CircleDot className="w-4 h-4 text-accentBlue mr-2" /> Difficulty Metrics
                  </h3>

                  <div className="space-y-4">
                    {/* Easy Solved Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold select-none">
                        <span className="text-emerald-400">Easy</span>
                        <span className="text-slate-300 font-mono">{profile.solvedCount?.easy || 0} / {profile.difficultyTotals?.easy || 0} Solved</span>
                      </div>
                      <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded transition-all duration-500" 
                          style={{ width: `${(profile.difficultyTotals?.easy || 0) > 0 ? Math.min(((profile.solvedCount?.easy || 0) / profile.difficultyTotals.easy) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Medium Solved Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold select-none">
                        <span className="text-amber-400">Medium</span>
                        <span className="text-slate-300 font-mono">{profile.solvedCount?.medium || 0} / {profile.difficultyTotals?.medium || 0} Solved</span>
                      </div>
                      <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded transition-all duration-500" 
                          style={{ width: `${(profile.difficultyTotals?.medium || 0) > 0 ? Math.min(((profile.solvedCount?.medium || 0) / profile.difficultyTotals.medium) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Hard Solved Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold select-none">
                        <span className="text-rose-400">Hard</span>
                        <span className="text-slate-300 font-mono">{profile.solvedCount?.hard || 0} / {profile.difficultyTotals?.hard || 0} Solved</span>
                      </div>
                      <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded transition-all duration-500" 
                          style={{ width: `${(profile.difficultyTotals?.hard || 0) > 0 ? Math.min(((profile.solvedCount?.hard || 0) / profile.difficultyTotals.hard) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Badges */}
                <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
                    <Award className="w-4 h-4 text-accentBlue mr-2" /> Badges & Achievements
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-darkBorder p-3 rounded bg-darkBg/30 text-center space-y-1 select-none">
                      <div className="text-xs font-extrabold text-accentBlue">Streak Champion</div>
                      <div className="text-[9px] text-slate-500 uppercase font-black">Active Solver</div>
                    </div>
                    <div className="border border-darkBorder p-3 rounded bg-darkBg/30 text-center space-y-1 select-none">
                      <div className="text-xs font-extrabold text-amber-400">Focus Pro</div>
                      <div className="text-[9px] text-slate-500 uppercase font-black">Mock Competitor</div>
                    </div>
                    <div className="border border-darkBorder p-3 rounded bg-darkBg/30 text-center space-y-1 select-none">
                      <div className="text-xs font-extrabold text-emerald-400">All-Rounder</div>
                      <div className="text-[9px] text-slate-500 uppercase font-black">Languages Polyglot</div>
                    </div>
                    <div className="border border-darkBorder p-3 rounded bg-darkBg/30 text-center space-y-1 select-none">
                      <div className="text-xs font-extrabold text-rose-400">Fast Solver</div>
                      <div className="text-[9px] text-slate-500 uppercase font-black">Speed Coder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMISSIONS LOG */}
          {activeTab === 'submissions' && (
            <div className="bg-darkCard border border-darkBorder rounded-lg overflow-hidden shadow-sm animate-fade-in">
              <div className="px-5 py-4 bg-darkBg/30 border-b border-darkBorder flex items-center justify-between select-none">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Complete Code Submissions Log</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sorted by Time</span>
              </div>

              {userSubmissions.length === 0 ? (
                <div className="p-16 text-center text-slate-500 space-y-2 select-none">
                  <History className="w-8 h-8 mx-auto text-slate-700" />
                  <div className="text-xs font-bold uppercase tracking-wider">No submissions compiled yet</div>
                  <p className="text-xs text-slate-600">Submit solutions in the Problem Arena to populate your archives.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-darkBg/30 border-b border-darkBorder text-[9px] uppercase font-bold text-slate-500 tracking-wider select-none">
                        <th className="py-3 px-5">Result Status</th>
                        <th className="py-3 px-5">Challenge</th>
                        <th className="py-3 px-5 text-center">Language</th>
                        <th className="py-3 px-5 text-center">Runtime</th>
                        <th className="py-3 px-5 text-right">Time Solved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/40">
                      {userSubmissions.map((sub) => {
                        const statusColor = sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400';
                        return (
                          <tr key={sub._id} className="hover:bg-darkBg/20 transition-colors">
                            <td className="py-3 px-5 font-bold text-xs select-none">
                              <span className={statusColor}>{sub.status}</span>
                              <span className="text-[10px] text-slate-500 font-mono ml-1 font-semibold">
                                ({sub.passedCount}/{sub.totalCount})
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              {sub.question ? (
                                <Link 
                                  to={`/problem/${sub.question._id}`}
                                  className="text-xs font-bold text-slate-200 hover:text-accentBlue transition-colors tracking-wide font-sans"
                                >
                                  {sub.question.title}
                                </Link>
                              ) : (
                                <span className="text-xs text-slate-500 italic">Deleted Challenge</span>
                              )}
                            </td>
                            <td className="py-3 px-5 text-center select-none text-[10px] text-slate-400 font-bold uppercase">
                              {sub.language}
                            </td>
                            <td className="py-3 px-5 text-center select-none font-mono text-xs text-slate-500">
                              {sub.runTime !== undefined ? `${sub.runTime.toFixed(3)}s` : '-'}
                            </td>
                            <td className="py-3 px-5 text-right text-xs text-slate-400 select-none">
                              {getRelativeTime(sub.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MOCK TEST HISTORY */}
          {activeTab === 'mocktests' && (
            <div className="space-y-4 animate-fade-in">
              
              {mockHistory.length === 0 ? (
                <div className="bg-darkCard border border-darkBorder rounded-lg p-12 text-center text-slate-500 space-y-2 select-none">
                  <Award className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
                  <div className="text-xs font-bold uppercase tracking-wider">No mock assessments completed yet</div>
                  <p className="text-xs text-slate-600">Simulate exams via the Mock Test Center to test your proctor limits.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockHistory.map((test) => {
                    const dateStr = new Date(test.completedAt || test.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    
                    return (
                      <div 
                        key={test._id} 
                        className="bg-darkCard border border-darkBorder rounded-lg p-4 flex flex-col justify-between hover:border-accentBlue group transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] bg-darkBg border border-darkBorder px-2 py-0.5 rounded font-bold uppercase text-slate-300 tracking-wider select-none">
                              Placement Exam
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold select-none">{dateStr}</span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide group-hover:text-accentBlue transition-colors">
                              Mock Assessment Report
                            </h4>
                            <div className="flex items-center space-x-3 mt-1.5 text-[10px] font-semibold text-slate-500 select-none">
                              <span className={test.tabSwitchesCount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                                ⚠️ {test.tabSwitchesCount} Proctor Violations
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-darkBorder/40 flex items-center justify-between">
                          <div className="text-left select-none">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Score</div>
                            <div className="text-md font-extrabold text-white mt-0.5">
                              {test.totalScore} <span className="text-[10px] text-slate-500">/ 200</span>
                            </div>
                          </div>
                          <Link
                            to={`/mocktest/result/${test._id}`}
                            className="bg-darkBg hover:bg-darkCard border border-darkBorder hover:border-accentBlue/30 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-md flex items-center space-x-1 transition-all"
                          >
                            <span>Report Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-darkCard border border-darkBorder rounded-lg p-6 space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
                  <Settings className="w-4 h-4 text-accentBlue mr-2" /> Profile Settings
                </h3>
                <p className="text-xs text-slate-400 mt-1 select-none">Update your public profile information visible to other users and administrators.</p>
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-lg text-xs font-bold ${
                  saveMessage.includes('Error') 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  {saveMessage}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider select-none">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-darkBg border border-darkBorder px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider select-none">Bio / Description</label>
                  <textarea
                    rows="4"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself (e.g. key coding interest, career focus, graduation info)"
                    className="w-full bg-darkBg border border-darkBorder p-3 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 font-sans leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-accentBlue hover:bg-accentBlue/90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-accentBlue/20 transition-all cursor-pointer"
                  >
                    {saveLoading ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
