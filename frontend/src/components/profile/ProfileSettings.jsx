import React from 'react';
import { Settings } from 'lucide-react';

const ProfileSettings = ({
  fullName,
  setFullName,
  bio,
  setBio,
  saveLoading,
  saveMessage,
  onSubmit
}) => {
  return (
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

      <form onSubmit={onSubmit} className="space-y-4">
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
  );
};

export default ProfileSettings;
