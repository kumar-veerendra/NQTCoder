import React from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';

const SubmissionsLog = ({ userSubmissions = [], getRelativeTime }) => {
  return (
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
  );
};

export default SubmissionsLog;
