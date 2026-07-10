import React from 'react';
import { GraduationCap } from 'lucide-react';

const ProfileSidebar = ({ 
  profile, 
  userRank, 
  solvedCount, 
  submissionsCount, 
  acceptanceRate 
}) => {
  if (!profile) return null;

  return (
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
      <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-5 select-none">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center border-b border-darkBorder/40 pb-2">
          <GraduationCap className="w-4 h-4 text-accentBlue mr-2" /> Overall Summary
        </h3>
        
        {/* Coding Section */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-black text-accentBlue uppercase tracking-wider">Coding Summary</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-darkBg/40 border border-darkBorder/60 p-2.5 rounded-lg">
              <div className="text-sm font-black text-white">{solvedCount}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Solved</div>
            </div>
            <div className="bg-darkBg/40 border border-darkBorder/60 p-2.5 rounded-lg">
              <div className="text-sm font-black text-white">{submissionsCount}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Attempts</div>
            </div>
            <div className="bg-darkBg/40 border border-darkBorder/60 p-2.5 rounded-lg">
              <div className="text-sm font-black text-emerald-400">{acceptanceRate}%</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Success</div>
            </div>
          </div>
        </div>

        {/* Aptitude Section */}
        <div className="space-y-2.5 pt-2 border-t border-darkBorder/30">
          <h4 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-wider">Aptitude Summary</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-darkBg/40 border border-darkBorder/60 p-2.5 rounded-lg">
              <div className="text-sm font-black text-white">{profile.aptitudeStats?.solved || 0}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Solved</div>
            </div>
            <div className="bg-darkBg/40 border border-darkBorder/60 p-2.5 rounded-lg">
              <div className="text-sm font-black text-white">{profile.aptitudeStats?.attempts || 0}</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Attempts</div>
            </div>
            <div className="bg-darkBg/40 border border-darkBorder/60 p-2.5 rounded-lg">
              <div className="text-sm font-black text-emerald-400">{profile.aptitudeStats?.successRate || 0}%</div>
              <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Success</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
