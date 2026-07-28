import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1';

const FaqBuilder = ({ faqs = [], onChange }) => {
  const update = (i, key, val) => {
    const next = faqs.map((f, idx) => idx === i ? { ...f, [key]: val } : f);
    onChange(next);
  };
  const add = () => onChange([...faqs, { question: '', answer: '', order: faqs.length }]);
  const remove = (i) => onChange(faqs.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-darkBg border border-darkBorder rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">FAQ {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div>
            <label className={L}>Question *</label>
            <input className={I} value={faq.question} onChange={e => update(i, 'question', e.target.value)} placeholder="e.g. Is there negative marking in TCS NQT?" />
          </div>
          <div>
            <label className={L}>Answer *</label>
            <textarea className={I} rows={3} value={faq.answer} onChange={e => update(i, 'answer', e.target.value)} placeholder="Detailed answer..." />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-full flex items-center justify-center space-x-2 py-3 border border-dashed border-darkBorder hover:border-accentBlue text-slate-400 hover:text-accentBlue rounded-xl transition-all text-sm font-bold">
        <Plus className="w-4 h-4" /><span>Add FAQ</span>
      </button>
    </div>
  );
};

export default FaqBuilder;
