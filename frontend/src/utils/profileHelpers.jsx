import React from 'react';
import { 
  GraduationCap, CheckCircle, Award, ShieldCheck, Flame, Code, Zap, Compass, Target
} from 'lucide-react';

/**
 * Calculates current and maximum coding streak from user submission history.
 */
export const calculateStreakDetails = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return { currentStreak: 0, maxStreak: 0 };
  }
  
  const dates = [...new Set(submissions.map(s => new Date(s.createdAt).toDateString()))]
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  if (dates.length === 0) return { currentStreak: 0, maxStreak: 0 };

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDate = new Date(dates[0]);
  firstDate.setHours(0,0,0,0);

  if (firstDate < yesterday) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
    let lastDate = firstDate;
    for (let i = 1; i < dates.length; i++) {
      const checkDate = new Date(dates[i]);
      checkDate.setHours(0,0,0,0);
      const diffTime = Math.abs(lastDate - checkDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        lastDate = checkDate;
      } else if (diffDays > 1) {
        break;
      }
    }
  }

  let maxStreak = 0;
  let tempStreak = 0;
  let lastDate = null;

  const sortedOldest = [...dates].sort((a, b) => a - b);
  sortedOldest.forEach(d => {
    const currentDate = new Date(d);
    currentDate.setHours(0,0,0,0);

    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        tempStreak = 1;
      }
    }
    lastDate = currentDate;
  });
  if (tempStreak > maxStreak) maxStreak = tempStreak;

  return { currentStreak, maxStreak };
};

/**
 * Returns a human-friendly relative time string.
 */
export const getRelativeTime = (dateVal) => {
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

/**
 * Generates the contribution heatmap cell list.
 */
export const generateActivityData = (userSubmissions = [], mockHistory = []) => {
  const activityMap = {};
  
  userSubmissions.forEach(sub => {
    if (sub.createdAt) {
      const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    }
  });

  mockHistory.forEach(test => {
    const dateVal = test.completedAt || test.createdAt;
    if (dateVal) {
      const dateStr = new Date(dateVal).toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 3;
    }
  });

  const today = new Date();
  const cells = [];
  
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

/**
 * Gets month indicators for contribution header row.
 */
export const getMonthLabels = (weeks = []) => {
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

/**
 * Generates the full dynamic badges details matrix.
 */
export const getBadgesList = ({
  maxStreak,
  solvedCountTotal,
  mockCount,
  proctorPerfectCount,
  uniqueLangsCount,
  bestRuntime,
  tracksList = []
}) => {
  const staticBadges = [
    {
      id: 'welcome',
      title: 'Welcome Coder',
      subtitle: 'Account Created',
      desc: 'Joined the NQTCoder practice platform.',
      icon: <GraduationCap className="w-5 h-5" />,
      isUnlocked: true,
      color: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400 badge-glow-blue',
    },
    {
      id: 'first_solve',
      title: 'First Solve',
      subtitle: 'Code Journey Begun',
      desc: 'Successfully solved your first programming challenge.',
      icon: <CheckCircle className="w-5 h-5" />,
      isUnlocked: solvedCountTotal >= 1,
      color: solvedCountTotal >= 1
        ? 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400 badge-glow-emerald'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'focus_pro',
      title: 'Focus Pro',
      subtitle: 'Mock Competitor',
      desc: 'Completed at least one corporate mock test simulation.',
      icon: <Award className="w-5 h-5" />,
      isUnlocked: mockCount >= 1,
      color: mockCount >= 1
        ? 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400 badge-glow-amber'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'proctor_champ',
      title: 'Cheat-Free',
      subtitle: 'Proctor Perfect',
      desc: 'Completed a mock test with zero proctor tab switches.',
      icon: <ShieldCheck className="w-5 h-5" />,
      isUnlocked: proctorPerfectCount >= 1,
      color: proctorPerfectCount >= 1
        ? 'from-purple-600/20 to-indigo-600/10 border-purple-500/30 text-purple-400 badge-glow-purple'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      subtitle: 'Week Active',
      desc: 'Maintained a coding streak for 7 consecutive days.',
      icon: <Flame className="w-5 h-5" />,
      isUnlocked: maxStreak >= 7,
      color: maxStreak >= 7
        ? 'from-orange-600/20 to-red-600/10 border-orange-500/30 text-orange-400 badge-glow-amber'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'streak_50',
      title: '50-Day Streak',
      subtitle: 'Consistency Master',
      desc: 'Maintained a coding streak for 50 consecutive days.',
      icon: <Flame className="w-5 h-5" />,
      isUnlocked: maxStreak >= 50,
      color: maxStreak >= 50
        ? 'from-pink-600/20 to-rose-600/10 border-pink-500/30 text-pink-400 badge-glow-rose'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'streak_100',
      title: '100-Day Streak',
      subtitle: 'Century Solver',
      desc: 'Maintained a coding streak for 100 consecutive days.',
      icon: <Flame className="w-5 h-5" />,
      isUnlocked: maxStreak >= 100,
      color: maxStreak >= 100
        ? 'from-sky-600/20 to-indigo-600/10 border-sky-500/30 text-sky-400 badge-glow-blue'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'streak_200',
      title: '200-Day Streak',
      subtitle: 'Elite Solver',
      desc: 'Maintained a coding streak for 200 consecutive days.',
      icon: <Flame className="w-5 h-5" />,
      isUnlocked: maxStreak >= 200,
      color: maxStreak >= 200
        ? 'from-amber-600/20 to-rose-600/10 border-orange-500/30 text-orange-400 badge-glow-amber'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'streak_365',
      title: '365-Day Streak',
      subtitle: 'Legendary Coder',
      desc: 'Maintained a coding streak for 365 consecutive days.',
      icon: <Flame className="w-5 h-5" />,
      isUnlocked: maxStreak >= 365,
      color: maxStreak >= 365
        ? 'from-violet-600/20 to-fuchsia-600/10 border-violet-500/30 text-violet-400 badge-glow-purple'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'polyglot',
      title: uniqueLangsCount >= 3 ? 'Polyglot Coder' : uniqueLangsCount === 2 ? 'Dual Coder' : 'All-Rounder',
      subtitle: 'Languages Polyglot',
      desc: 'Solved challenges in multiple programming languages (C++, Java, Python).',
      icon: <Code className="w-5 h-5" />,
      isUnlocked: uniqueLangsCount >= 2,
      color: uniqueLangsCount >= 2
        ? 'from-teal-600/20 to-cyan-600/10 border-teal-500/30 text-teal-400 badge-glow-emerald'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    },
    {
      id: 'speed_coder',
      title: bestRuntime <= 0.05 ? 'Lightning Solver' : bestRuntime <= 0.2 ? 'Speed Coder' : 'Fast Solver',
      subtitle: 'Fast Execution',
      desc: 'Solved a challenge with execution runtime under 200ms.',
      icon: <Zap className="w-5 h-5" />,
      isUnlocked: bestRuntime !== Infinity && bestRuntime <= 0.2,
      color: (bestRuntime !== Infinity && bestRuntime <= 0.2)
        ? 'from-rose-600/20 to-orange-600/10 border-rose-500/30 text-rose-400 badge-glow-rose'
        : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
    }
  ];

  const trackBadges = [];

  // Generate dynamic badges for completed tracks
  tracksList.forEach(track => {
    if (track.progressPercent === 100) {
      if (track.type === 'company') {
        // Stylish colors for different companies
        let colorClass = 'from-violet-600/20 to-indigo-600/10 border-violet-500/30 text-violet-400 badge-glow-purple'; // Default TCS/Accenture style
        if (track.company === 'Infosys') {
          colorClass = 'from-blue-600/20 to-sky-600/10 border-blue-500/30 text-blue-400 badge-glow-blue';
        } else if (track.company === 'Wipro') {
          colorClass = 'from-amber-600/20 to-orange-600/10 border-amber-500/30 text-amber-400 badge-glow-amber';
        } else if (track.company === 'Cognizant') {
          colorClass = 'from-rose-600/20 to-pink-600/10 border-rose-500/30 text-rose-400 badge-glow-rose';
        } else if (track.company === 'Capgemini') {
          colorClass = 'from-teal-600/20 to-emerald-600/10 border-teal-500/30 text-teal-400 badge-glow-emerald';
        }

        trackBadges.push({
          id: `track_comp_${track._id}`,
          title: `${track.company} Conqueror`,
          subtitle: `${track.company} Complete`,
          desc: `Completed all challenges in the ${track.title}.`,
          icon: <Award className="w-5 h-5" />,
          isUnlocked: true,
          color: colorClass
        });
      } else if (track.type === 'topic') {
        trackBadges.push({
          id: `track_topic_${track._id}`,
          title: `${track.topic} Master`,
          subtitle: `${track.topic} Complete`,
          desc: `Completed all challenges in the ${track.title}.`,
          icon: <Target className="w-5 h-5" />,
          isUnlocked: true,
          color: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400 badge-glow-emerald'
        });
      }
    }
  });

  const completedTracksCount = tracksList.filter(t => t.progressPercent === 100).length;

  staticBadges.push({
    id: 'pathfinder',
    title: 'Path Finder',
    subtitle: 'Roadmap Completed',
    desc: 'Successfully finished at least one corporate or topic learning track.',
    icon: <Compass className="w-5 h-5" />,
    isUnlocked: completedTracksCount >= 1,
    color: completedTracksCount >= 1
      ? 'from-indigo-600/20 to-blue-600/10 border-indigo-500/30 text-indigo-400 badge-glow-blue'
      : 'from-slate-800/40 to-slate-900/20 border-slate-700/30 text-slate-500 opacity-40',
  });

  return [...staticBadges, ...trackBadges];
};
