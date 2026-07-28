import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';

const emptyStage = (order) => ({ name: '', description: '', order });

const RecruitmentBuilder = ({ stages = [], onChange }) => {
  const sorted = [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));
  const update = (i, key, val) => { const next = [...sorted]; next[i] = { ...next[i], [key]: val }; onChange(next); };
  const add = () => onChange([...sorted, emptyStage(sorted.length + 1)]);
  const remove = (i) => onChange(sorted.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));
  const move = (i, dir) => {
    const next = [...sorted];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  return (
    <div className="space-y-3">
      {sorted.map((stage, i) => (
        <div key={i} className="bg-darkBg border border-darkBorder rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-accentBlue text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
            <div className="flex-1">
              <input className={I} value={stage.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Stage name (e.g. Online Assessment)" />
            </div>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === sorted.length - 1} className="p-1.5 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => remove(i)} className="p-1.5 text-rose-500 hover:text-rose-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <textarea className={I} rows={2} value={stage.description || ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Describe this stage..." />
        </div>
      ))}
      <button type="button" onClick={add} className="w-full flex items-center justify-center space-x-2 py-3 border border-dashed border-darkBorder hover:border-accentBlue text-slate-400 hover:text-accentBlue rounded-xl transition-all text-sm font-bold">
        <Plus className="w-4 h-4" /><span>Add Stage</span>
      </button>
    </div>
  );
};

export default RecruitmentBuilder;
