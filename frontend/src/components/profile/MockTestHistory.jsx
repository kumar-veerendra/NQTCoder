import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink } from 'lucide-react';

const MockTestHistory = ({ mockHistory = [] }) => {
  return (
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
  );
};

export default MockTestHistory;
