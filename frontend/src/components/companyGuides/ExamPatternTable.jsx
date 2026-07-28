import React from 'react';
import { HelpCircle } from 'lucide-react';

const formatNM = (nm) => {
  if (!nm) return '—';
  if (nm.applicable === null || nm.applicable === undefined) return '—';
  if (nm.applicable === false) return 'No';
  if (nm.applicable === true) {
    return nm.value !== undefined && nm.value !== null ? `-${nm.value}` : 'Yes';
  }
  return '—';
};

const ExamPatternTable = ({ sections }) => {
  if (!sections || sections.length === 0) return null;

  const sorted = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  const totalQ = sorted.reduce((s, x) => (x.questions != null ? s + x.questions : s), 0);
  const totalDur = sorted.reduce((s, x) => (x.durationMinutes != null ? s + x.durationMinutes : s), 0);
  const totalMarks = sorted.reduce((s, x) => (x.marks != null ? s + x.marks : s), 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-darkBorder bg-darkCard shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-darkBg/60 border-b border-darkBorder">
            <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Section
            </th>
            <th className="px-4 py-3 text-center font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Questions
            </th>
            <th className="px-4 py-3 text-center font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Duration
            </th>
            <th className="px-4 py-3 text-center font-black uppercase tracking-wider text-slate-400">
              Marks
            </th>
            <th className="px-4 py-3 text-center font-black uppercase tracking-wider text-slate-400">
              Neg. Marking
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((sec, i) => (
            <tr
              key={sec._id || i}
              className={`border-b border-darkBorder/50 transition-colors hover:bg-darkBg/40 ${
                i % 2 === 0 ? '' : 'bg-darkBg/20'
              }`}
            >
              <td className="px-4 py-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{sec.section}</span>
                  {sec.description && (
                    <p className="text-slate-500 text-[10px] mt-0.5">{sec.description}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                {sec.questions != null ? sec.questions : <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                {sec.durationMinutes != null ? (
                  `${sec.durationMinutes} min`
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                {sec.marks != null ? sec.marks : <span className="text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`font-bold ${
                    sec.negativeMarking?.applicable === false
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : sec.negativeMarking?.applicable === true
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {formatNM(sec.negativeMarking)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        {(totalQ > 0 || totalDur > 0 || totalMarks > 0) && (
          <tfoot>
            <tr className="bg-accentBlue/5 border-t border-accentBlue/20">
              <td className="px-4 py-3 font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[10px]">
                Total
              </td>
              <td className="px-4 py-3 text-center font-black text-slate-900 dark:text-white">
                {totalQ > 0 ? totalQ : '—'}
              </td>
              <td className="px-4 py-3 text-center font-black text-slate-900 dark:text-white">
                {totalDur > 0 ? `${totalDur} min` : '—'}
              </td>
              <td className="px-4 py-3 text-center font-black text-slate-900 dark:text-white">
                {totalMarks > 0 ? totalMarks : '—'}
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        )}
      </table>
      <div className="px-4 py-2 text-[10px] text-slate-500 flex items-center space-x-1">
        <HelpCircle className="w-2.5 h-2.5" />
        <span>— indicates information not officially disclosed</span>
      </div>
    </div>
  );
};

export default ExamPatternTable;
