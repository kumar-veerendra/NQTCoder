import React from 'react';

export const DiffViewer = ({ original, improved }) => {
  // Simple word-level diffing algorithm based on LCS
  const diffWords = (one, other) => {
    const o = (one || '').split(/\s+/).filter(Boolean);
    const n = (other || '').split(/\s+/).filter(Boolean);
    
    // Grid for LCS
    const matrix = Array(o.length + 1).fill().map(() => Array(n.length + 1).fill(0));
    
    for (let i = 1; i <= o.length; i++) {
      for (let j = 1; j <= n.length; j++) {
        if (o[i - 1].toLowerCase() === n[j - 1].toLowerCase()) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find differences
    let i = o.length;
    let j = n.length;
    const diff = [];
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && o[i - 1].toLowerCase() === n[j - 1].toLowerCase()) {
        diff.unshift({ type: 'unchanged', text: o[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        diff.unshift({ type: 'added', text: n[j - 1] });
        j--;
      } else {
        diff.unshift({ type: 'removed', text: o[i - 1] });
        i--;
      }
    }
    
    return diff;
  };

  const diffResult = diffWords(original || '', improved || '');

  return (
    <div className="space-y-6 bg-darkBg/60 border border-darkBorder rounded-2xl p-5 select-none font-sans text-xs">
      {/* Original Email panel */}
      <div className="space-y-3">
        <h4 className="font-extrabold uppercase tracking-wider text-slate-500">Your Draft (Corrections)</h4>
        <div className="bg-darkCard border border-darkBorder rounded-xl p-4 min-h-[220px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">
          {diffResult.map((w, idx) => {
            if (w.type === 'removed') {
              return <span key={idx} className="bg-rose-500/20 text-rose-400 border border-rose-500/35 px-1 rounded line-through mr-1">{w.text} </span>;
            }
            if (w.type === 'added') return null;
            return <span key={idx} className="mr-1">{w.text} </span>;
          })}
        </div>
      </div>

      {/* Improved Email panel */}
      <div className="space-y-3">
        <h4 className="font-extrabold uppercase tracking-wider text-slate-500">Improved Version</h4>
        <div className="bg-darkCard border border-darkBorder rounded-xl p-4 min-h-[220px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">
          {diffResult.map((w, idx) => {
            if (w.type === 'added') {
              return <span key={idx} className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 px-1 rounded mr-1 font-bold">{w.text} </span>;
            }
            if (w.type === 'removed') return null;
            return <span key={idx} className="mr-1">{w.text} </span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
