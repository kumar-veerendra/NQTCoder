import React from 'react';
import { IndianRupee } from 'lucide-react';

const formatSalary = (salary) => {
  if (!salary) return null;
  const { min, max, currency, unit } = salary;
  const sym = currency === 'INR' ? '₹' : (currency || '');
  const u = unit || 'LPA';

  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `${sym}${min}–${max} ${u}`;
  if (max != null) return `${sym}${max} ${u}`;
  if (min != null) return `${sym}${min} ${u}`;
  return null;
};

const RoleSalaryTable = ({ roles }) => {
  if (!roles || roles.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-darkBorder bg-darkCard shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-darkBg/60 border-b border-darkBorder">
            <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
            <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <IndianRupee className="w-3 h-3" />
                <span>Package</span>
              </span>
            </th>
            <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Notes</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, i) => {
            const salaryStr = formatSalary(role.salary);
            return (
              <tr
                key={role._id || i}
                className={`border-b border-darkBorder/50 hover:bg-darkBg/40 transition-colors ${
                  i % 2 === 0 ? '' : 'bg-darkBg/20'
                }`}
              >
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{role.name}</td>
                <td className="px-4 py-3">
                  {salaryStr ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{salaryStr}</span>
                  ) : (
                    <span className="text-slate-400 italic">Not disclosed</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-400">{role.description || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoleSalaryTable;
