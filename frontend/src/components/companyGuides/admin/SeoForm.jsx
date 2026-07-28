import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5';

const SeoForm = ({ data = {}, onChange }) => {
  const [kDraft, setKDraft] = useState('');
  const set = (key, val) => onChange({ ...data, [key]: val });
  const addKeyword = () => { if (kDraft.trim()) { set('keywords', [...(data.keywords || []), kDraft.trim()]); setKDraft(''); } };
  const removeKeyword = (i) => set('keywords', (data.keywords || []).filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <div>
        <label className={L}>Meta Title <span className="text-slate-600 normal-case font-normal">(60 chars max)</span></label>
        <input className={I} value={data.metaTitle || ''} onChange={e => set('metaTitle', e.target.value)} maxLength={60} placeholder="TCS NQT 2026 — Complete Exam Guide" />
        <p className="text-[10px] text-slate-600 mt-1">{(data.metaTitle || '').length}/60</p>
      </div>
      <div>
        <label className={L}>Meta Description <span className="text-slate-600 normal-case font-normal">(160 chars max)</span></label>
        <textarea className={I} rows={3} value={data.metaDescription || ''} onChange={e => set('metaDescription', e.target.value)} maxLength={160} placeholder="Complete guide to TCS NQT exam pattern, syllabus, eligibility and salary packages." />
        <p className="text-[10px] text-slate-600 mt-1">{(data.metaDescription || '').length}/160</p>
      </div>
      <div>
        <label className={L}>Keywords</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(data.keywords || []).map((k, i) => (
            <span key={i} className="flex items-center space-x-1 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded">
              <span>{k}</span>
              <button type="button" onClick={() => removeKeyword(i)} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input className={I} value={kDraft} onChange={e => setKDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            placeholder="Add keyword (Enter)" />
          <button type="button" onClick={addKeyword} className="px-3 border border-darkBorder rounded-lg hover:border-accentBlue transition-colors"><Plus className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={L}>OG Title</label>
          <input className={I} value={data.ogTitle || ''} onChange={e => set('ogTitle', e.target.value)} placeholder="Defaults to meta title" />
        </div>
        <div>
          <label className={L}>OG Image URL</label>
          <input className={I} value={data.ogImage || ''} onChange={e => set('ogImage', e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className={L}>OG Description</label>
        <textarea className={I} rows={2} value={data.ogDescription || ''} onChange={e => set('ogDescription', e.target.value)} placeholder="Defaults to meta description" />
      </div>
    </div>
  );
};

export default SeoForm;
