import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1';

const SourcesBuilder = ({ sources = [], onChange }) => {
  const update = (i, key, val) => { const next = [...sources]; next[i] = { ...next[i], [key]: val }; onChange(next); };
  const add = () => onChange([...sources, { title: '', url: '', publisher: '', sourceType: 'other', accessedAt: '' }]);
  const remove = (i) => onChange(sources.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {sources.map((s, i) => (
        <div key={i} className="bg-darkBg border border-darkBorder rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">Source {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={L}>Title *</label>
              <input className={I} value={s.title} onChange={e => update(i, 'title', e.target.value)} placeholder="Source title" />
            </div>
            <div>
              <label className={L}>URL *</label>
              <input className={I} value={s.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={L}>Publisher</label>
              <input className={I} value={s.publisher || ''} onChange={e => update(i, 'publisher', e.target.value)} placeholder="e.g. TCS Careers" />
            </div>
            <div>
              <label className={L}>Source Type</label>
              <select className={I} value={s.sourceType || 'other'} onChange={e => update(i, 'sourceType', e.target.value)}>
                <option value="official">Official</option>
                <option value="placement_cell">Placement Cell</option>
                <option value="candidate_report">Candidate Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={L}>Accessed Date</label>
              <input type="date" className={I} value={s.accessedAt ? s.accessedAt.split('T')[0] : ''} onChange={e => update(i, 'accessedAt', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-full flex items-center justify-center space-x-2 py-3 border border-dashed border-darkBorder hover:border-accentBlue text-slate-400 hover:text-accentBlue rounded-xl transition-all text-sm font-bold">
        <Plus className="w-4 h-4" /><span>Add Source</span>
      </button>
    </div>
  );
};

export default SourcesBuilder;
