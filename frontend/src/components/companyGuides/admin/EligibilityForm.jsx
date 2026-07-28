import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5';

const TagInput = ({ values = [], onChange, placeholder }) => {
  const [draft, setDraft] = useState('');
  const add = () => { if (draft.trim()) { onChange([...values, draft.trim()]); setDraft(''); } };
  const remove = (i) => onChange(values.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v, i) => (
          <span key={i} className="flex items-center space-x-1 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 text-[10px] font-bold px-2 py-1 rounded">
            <span>{v}</span>
            <button type="button" onClick={() => remove(i)} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
          </span>
        ))}
      </div>
      <div className="flex space-x-2">
        <input className={I} value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder} />
        <button type="button" onClick={add} className="px-3 py-2 bg-darkBg border border-darkBorder rounded-lg hover:border-accentBlue transition-colors">
          <Plus className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

const EligibilityForm = ({ data = {}, onChange }) => {
  const set = (key, val) => onChange({ ...data, [key]: val });
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={L}>Minimum Percentage / CGPA</label>
          <input className={I} value={data.minimumPercentage || ''} onChange={e => set('minimumPercentage', e.target.value)} placeholder="e.g. 60% or 6.0 CGPA" />
        </div>
        <div>
          <label className={L}>Allowed Backlogs</label>
          <input className={I} value={data.allowedBacklogs || ''} onChange={e => set('allowedBacklogs', e.target.value)} placeholder="e.g. 0 or Not allowed" />
        </div>
      </div>
      <div>
        <label className={L}>Eligible Degrees</label>
        <TagInput values={data.eligibleDegrees || []} onChange={v => set('eligibleDegrees', v)} placeholder="Add degree (e.g. B.Tech) and press Enter" />
      </div>
      <div>
        <label className={L}>Eligible Branches</label>
        <TagInput values={data.eligibleBranches || []} onChange={v => set('eligibleBranches', v)} placeholder="Add branch (e.g. CS) and press Enter" />
      </div>
      <div>
        <label className={L}>Graduation Years</label>
        <TagInput values={(data.graduationYears || []).map(String)} onChange={v => set('graduationYears', v.map(Number).filter(n => !isNaN(n)))} placeholder="Add year (e.g. 2026) and press Enter" />
      </div>
      <div>
        <label className={L}>Gap Year Criteria</label>
        <input className={I} value={data.gapCriteria || ''} onChange={e => set('gapCriteria', e.target.value)} placeholder="e.g. Maximum 1 year gap allowed" />
      </div>
      <div>
        <label className={L}>Additional Notes</label>
        <textarea className={I} rows={3} value={data.additionalNotes || ''} onChange={e => set('additionalNotes', e.target.value)} placeholder="Any other eligibility notes..." />
      </div>
    </div>
  );
};

export default EligibilityForm;
