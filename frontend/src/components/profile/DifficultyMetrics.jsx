import React from 'react';
import { CircleDot } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DifficultyMetrics = ({ solvedCount = {}, difficultyTotals = {} }) => {
  const pieData = [
    { name: 'Easy', value: solvedCount.easy || 0, color: '#10b981' },
    { name: 'Medium', value: solvedCount.medium || 0, color: '#f59e0b' },
    { name: 'Hard', value: solvedCount.hard || 0, color: '#f43f5e' },
  ];

  const hasSolvedAny = pieData.some(item => item.value > 0);

  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg p-5 flex flex-col h-full shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none mb-4">
        <CircleDot className="w-4 h-4 text-accentBlue mr-2" /> Difficulty Metrics
      </h3>

      <div className="flex-grow flex flex-col justify-between">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Background Pie representing the unfilled/empty state if nothing is solved */}
              {!hasSolvedAny && (
                <Pie
                  data={[{ value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  stroke="none"
                  fill="rgba(255, 255, 255, 0.08)"
                  isAnimationActive={false}
                  legendType="none"
                />
              )}

              {/* Main Pie Chart displaying actual solved stats */}
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={hasSolvedAny ? 5 : 0}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              {/* Only show tooltip when there are actual solved questions to hover */}
              {hasSolvedAny && (
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#f8fafc'
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ fill: 'transparent' }}
                />
              )}

              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Sub-stats breakdown cards */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {pieData.map((item) => (
            <div key={item.name} className="text-center p-2 rounded-lg bg-darkBg/30 border border-darkBorder/40">
              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: item.color }}>
                {item.name}
              </div>
              <div className="text-xs font-mono font-bold text-white mt-0.5">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultyMetrics;
