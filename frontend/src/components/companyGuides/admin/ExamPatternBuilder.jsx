import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1';

const emptySection = (order) => ({ section: '', questions: '', durationMinutes: '', marks: '', negativeMarking: { applicable: null, value: '', description: '' }, description: '', order });

const ExamPatternBuilder = ({ sections = [], onChange }) => {
  const sorted = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const update = (i, key, val) => { const next = [...sorted]; next[i] = { ...next[i], [key]: val }; onChange(next); };
  const updateNM = (i, key, val) => { const next = [...sorted]; next[i] = { ...next[i], negativeMarking: { ...(next[i].negativeMarking || {}), [key]: val } }; onChange(next); };
  const add = () => onChange([...sorted, emptySection(sorted.length + 1)]);
  const remove = (i) => onChange(sorted.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));
  const numOrUndefined = (v) => v === '' ? undefined : parseFloat(v);

  return (
    <div className="space-y-4">
      {sorted.map((sec, i) => (
        <div key={i} className="bg-darkBg border border-darkBorder rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">Section {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div>
            <label className={L}>Section Name *</label>
            <input className={I} value={sec.section} onChange={e => update(i, 'section', e.target.value)} placeholder="e.g. Quantitative Aptitude" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={L}>Questions</label>
              <input type="number" min="0" className={I} value={sec.questions ?? ''} onChange={e => update(i, 'questions', numOrUndefined(e.target.value))} placeholder="—" />
            </div>
            <div>
              <label className={L}>Duration (min)</label>
              <input type="number" min="0" className={I} value={sec.durationMinutes ?? ''} onChange={e => update(i, 'durationMinutes', numOrUndefined(e.target.value))} placeholder="—" />
            </div>
            <div>
              <label className={L}>Marks</label>
              <input type="number" min="0" className={I} value={sec.marks ?? ''} onChange={e => update(i, 'marks', numOrUndefined(e.target.value))} placeholder="—" />
            </div>
            <div>
              <label className={L}>Neg. Marking</label>
              <select className={I} value={sec.negativeMarking?.applicable === null || sec.negativeMarking?.applicable === undefined ? 'null' : String(sec.negativeMarking?.applicable)}
                onChange={e => updateNM(i, 'applicable', e.target.value === 'null' ? null : e.target.value === 'true')}>
                <option value="null">Unknown</option>
                <option value="false">None</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
          {sec.negativeMarking?.applicable === true && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={L}>NM Value (e.g. 0.25)</label>
                <input type="number" min="0" step="0.01" className={I} value={sec.negativeMarking?.value ?? ''} onChange={e => updateNM(i, 'value', numOrUndefined(e.target.value))} placeholder="0.25" />
              </div>
              <div>
                <label className={L}>NM Description</label>
                <input className={I} value={sec.negativeMarking?.description || ''} onChange={e => updateNM(i, 'description', e.target.value)} placeholder="e.g. 0.25 per wrong" />
              </div>
            </div>
          )}
          <div>
            <label className={L}>Section Notes</label>
            <input className={I} value={sec.description || ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Optional notes" />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="w-full flex items-center justify-center space-x-2 py-3 border border-dashed border-darkBorder hover:border-accentBlue text-slate-400 hover:text-accentBlue rounded-xl transition-all text-sm font-bold">
        <Plus className="w-4 h-4" /><span>Add Section</span>
      </button>
    </div>
  );
};

export default ExamPatternBuilder;
