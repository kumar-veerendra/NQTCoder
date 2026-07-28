import React from 'react';
import { GraduationCap, Users, BookOpen, Calendar, AlertCircle } from 'lucide-react';

const Tag = ({ children, color = 'slate' }) => {
  const colors = {
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    blue:  'bg-accentBlue/10 text-accentBlue border-accentBlue/20',
    green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-start space-x-4 py-4 border-b border-darkBorder/40 last:border-0">
    <div className="mt-0.5 w-8 h-8 rounded-xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-accentBlue" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      {children}
    </div>
  </div>
);

const EligibilitySection = ({ eligibility }) => {
  if (!eligibility) return null;

  const {
    minimumPercentage,
    allowedBacklogs,
    eligibleDegrees,
    eligibleBranches,
    graduationYears,
    gapCriteria,
    additionalNotes,
  } = eligibility;

  const hasData =
    minimumPercentage ||
    allowedBacklogs ||
    (eligibleDegrees && eligibleDegrees.length > 0) ||
    (eligibleBranches && eligibleBranches.length > 0) ||
    (graduationYears && graduationYears.length > 0) ||
    gapCriteria ||
    additionalNotes;

  if (!hasData) return null;

  return (
    <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-8 space-y-1 shadow-sm">
      {minimumPercentage && (
        <Row icon={GraduationCap} label="Minimum Percentage / CGPA">
          <span className="text-slate-900 dark:text-white font-bold text-sm sm:text-base">{minimumPercentage}</span>
        </Row>
      )}

      {allowedBacklogs && (
        <Row icon={AlertCircle} label="Backlogs Allowed">
          <span className={`font-bold text-sm sm:text-base ${allowedBacklogs === '0' || allowedBacklogs.toLowerCase().includes('no') ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {allowedBacklogs}
          </span>
        </Row>
      )}

      {eligibleDegrees && eligibleDegrees.length > 0 && (
        <Row icon={BookOpen} label="Eligible Degrees">
          <div className="flex flex-wrap gap-2">
            {eligibleDegrees.map((d) => <Tag key={d} color="blue">{d}</Tag>)}
          </div>
        </Row>
      )}

      {eligibleBranches && eligibleBranches.length > 0 && (
        <Row icon={Users} label="Eligible Branches">
          <div className="flex flex-wrap gap-2">
            {eligibleBranches.map((b) => <Tag key={b} color="slate">{b}</Tag>)}
          </div>
        </Row>
      )}

      {graduationYears && graduationYears.length > 0 && (
        <Row icon={Calendar} label="Graduation Years">
          <div className="flex flex-wrap gap-2">
            {graduationYears.map((y) => <Tag key={y} color="green">{y}</Tag>)}
          </div>
        </Row>
      )}

      {gapCriteria && (
        <Row icon={AlertCircle} label="Gap Year Criteria">
          <span className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed">{gapCriteria}</span>
        </Row>
      )}

      {additionalNotes && (
        <div className="pt-4 mt-2 border-t border-darkBorder/30">
          <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">{additionalNotes}</p>
        </div>
      )}
    </div>
  );
};

export default EligibilitySection;
