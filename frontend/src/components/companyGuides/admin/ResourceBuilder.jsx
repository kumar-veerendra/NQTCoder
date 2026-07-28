import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1';

const ResourceBuilder = ({ resources = [], onChange }) => {
  const update = (i, key, val) => { const next = [...resources]; next[i] = { ...next[i], [key]: val }; onChange(next); };
  const add = () => onChange([...resources, { title: '', type: 'link', url: '', sourceName: '' }]);
  const remove = (i) => onChange(resources.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {resources.map((r, i) => (
        <div key={i} className="bg-darkBg border border-darkBorder rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">Resource {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className={L}>Title *</label>
              <input className={I} value={r.title} onChange={e => update(i, 'title', e.target.value)} placeholder="Resource title" />
            </div>
            <div>
              <label className={L}>Type</label>
              <select className={I} value={r.type} onChange={e => update(i, 'type', e.target.value)}>
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={L}>URL *</label>
              <input className={I} value={r.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={L}>Source Name</label>
              <input className={I} value={r.sourceName || ''} onChange={e => update(i, 'sourceName', e.target.value)} placeholder="e.g. TCS Careers" />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-full flex items-center justify-center space-x-2 py-3 border border-dashed border-darkBorder hover:border-accentBlue text-slate-400 hover:text-accentBlue rounded-xl transition-all text-sm font-bold">
        <Plus className="w-4 h-4" /><span>Add Resource</span>
      </button>
    </div>
  );
};

export default ResourceBuilder;
