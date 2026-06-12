import React from 'react';
import { Activity } from 'lucide-react';

const ActivityCalendar = ({ 
  activityCells = [], 
  weeks = [], 
  monthLabels = [] 
}) => {
  return (
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
  );
};

export default ActivityCalendar;
