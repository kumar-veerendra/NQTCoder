import React from 'react';

const generateSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5';

const GUIDE_TYPES = [
  { value: 'placement_exam', label: 'Placement Exam' },
  { value: 'hiring_process', label: 'Hiring Process' },
  { value: 'coding_competition', label: 'Coding Competition' },
  { value: 'general', label: 'General' },
];

const BasicInfoForm = ({ data, onChange, companies }) => {
  const set = (key, val) => onChange({ ...data, [key]: val });

  const handleTitleChange = (val) => {
    const updates = { ...data, title: val };
    if (!data._slugManuallyEdited) updates.slug = generateSlug(val);
    onChange(updates);
  };

  const handleSlugChange = (val) => {
    onChange({ ...data, slug: generateSlug(val), _slugManuallyEdited: true });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={L}>Company *</label>
          <select className={I} value={data.company || ''} onChange={e => set('company', e.target.value)}>
            <option value="">Select company...</option>
            {(companies || []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={L}>Guide Type</label>
          <select className={I} value={data.guideType || 'placement_exam'} onChange={e => set('guideType', e.target.value)}>
            {GUIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={L}>Title *</label>
        <input className={I} value={data.title || ''} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. TCS NQT 2026 Complete Guide" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={L}>Slug (URL) *</label>
          <input className={I} value={data.slug || ''} onChange={e => handleSlugChange(e.target.value)} placeholder="tcs-nqt-2026" />
          <p className="text-[10px] text-slate-600 mt-1">/companies/{data.slug || 'your-slug'}</p>
        </div>
        <div>
          <label className={L}>Exam Name</label>
          <input className={I} value={data.examName || ''} onChange={e => set('examName', e.target.value)} placeholder="e.g. TCS NQT" />
        </div>
      </div>

      <div>
        <label className={L}>Short Description * <span className="text-slate-600 normal-case font-normal">(shown on cards)</span></label>
        <textarea className={I} rows={3} value={data.shortDescription || ''} onChange={e => set('shortDescription', e.target.value)}
          placeholder="1-2 sentence summary for cards and search results. Max 400 chars." maxLength={400} />
        <p className="text-[10px] text-slate-600 mt-1">{(data.shortDescription || '').length}/400</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={L}>Cover Image URL</label>
          <input className={I} value={data.coverImage || ''} onChange={e => set('coverImage', e.target.value)} placeholder="https://..." />
        </div>
        <div className="flex items-center space-x-3 pt-6">
          <input type="checkbox" id="featured-check" checked={!!data.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-accentBlue" />
          <label htmlFor="featured-check" className="text-sm font-bold text-white cursor-pointer">Feature on Homepage</label>
        </div>
      </div>

      <div>
        <label className={L}>Data Notice <span className="text-slate-600 normal-case font-normal">(shown publicly below hero)</span></label>
        <textarea className={I} rows={2} value={data.dataNotice || ''} onChange={e => set('dataNotice', e.target.value)}
          placeholder="e.g. Exam patterns may vary by drive, role and campus. Last verified July 2026." />
      </div>
    </div>
  );
};

export default BasicInfoForm;
