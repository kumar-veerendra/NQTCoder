import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const I = 'w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accentBlue transition-colors';
const L = 'block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1';

const emptyRole = () => ({ name: '', salary: { currency: 'INR', unit: 'LPA' }, description: '' });

const RoleBuilder = ({ roles = [], onChange }) => {
  const update = (i, key, val) => onChange(roles.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  const updateSalary = (i, key, val) => onChange(roles.map((r, idx) => idx === i ? { ...r, salary: { ...r.salary, [key]: val } } : r));
  const add = () => onChange([...roles, emptyRole()]);
  const remove = (i) => onChange(roles.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {roles.map((role, i) => (
        <div key={i} className="bg-darkBg border border-darkBorder rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">Role {i + 1}</span>
            <button onClick={() => remove(i)} className="text-rose-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div>
            <label className={L}>Role Name *</label>
            <input className={I} value={role.name} onChange={e => update(i, 'name', e.target.value)} placeholder="e.g. System Engineer" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={L}>Min Package</label>
              <input type="number" min="0" step="0.1" className={I}
                value={role.salary?.min ?? ''}
                onChange={e => updateSalary(i, 'min', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                placeholder="Not disclosed" />
            </div>
            <div>
              <label className={L}>Max Package</label>
              <input type="number" min="0" step="0.1" className={I}
                value={role.salary?.max ?? ''}
                onChange={e => updateSalary(i, 'max', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                placeholder="Not disclosed" />
            </div>
            <div>
              <label className={L}>Currency</label>
              <select className={I} value={role.salary?.currency || 'INR'} onChange={e => updateSalary(i, 'currency', e.target.value)}>
                <option>INR</option><option>USD</option><option>GBP</option>
              </select>
            </div>
            <div>
              <label className={L}>Unit</label>
              <select className={I} value={role.salary?.unit || 'LPA'} onChange={e => updateSalary(i, 'unit', e.target.value)}>
                <option>LPA</option><option>monthly</option><option>annual</option>
              </select>
            </div>
          </div>
          <div>
            <label className={L}>Notes</label>
            <input className={I} value={role.description || ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Optional role details" />
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center space-x-2 py-3 border border-dashed border-darkBorder hover:border-accentBlue text-slate-400 hover:text-accentBlue rounded-xl transition-all text-sm font-bold">
        <Plus className="w-4 h-4" /><span>Add Role</span>
      </button>
    </div>
  );
};

export default RoleBuilder;
