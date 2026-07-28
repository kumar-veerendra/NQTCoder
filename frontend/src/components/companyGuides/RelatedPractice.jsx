import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Calculator, Trophy, ArrowRight } from 'lucide-react';

const RelatedPractice = ({ company }) => {
  const practiceKey = company?.legacyKeys?.[0] || company?.name || '';
  if (!practiceKey) return null;
  return (
    <div className="bg-gradient-to-br from-accentBlue/10 to-accentBlue/5 border border-accentBlue/20 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">Prepare on NQTCoder</h3>
      <p className="text-slate-700 dark:text-slate-400 text-xs mb-5">Practice real {company?.name} exam questions and take timed mock tests.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to={`/practice?company=${practiceKey}`}
          className="flex items-center space-x-3 p-3 bg-darkCard border border-darkBorder rounded-xl hover:border-accentBlue transition-all group shadow-sm">
          <Code2 className="w-5 h-5 text-accentBlue shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-accentBlue transition-colors">Coding Questions</p>
            <p className="text-slate-500 text-[10px]">{company?.name} problems</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-accentBlue ml-auto transition-colors" />
        </Link>
        <Link to="/aptitude"
          className="flex items-center space-x-3 p-3 bg-darkCard border border-darkBorder rounded-xl hover:border-accentBlue transition-all group shadow-sm">
          <Calculator className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-accentBlue transition-colors">Aptitude Practice</p>
            <p className="text-slate-500 text-[10px]">Quant, Logical, Verbal</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-accentBlue ml-auto transition-colors" />
        </Link>
        <Link to="/mocktest"
          className="flex items-center space-x-3 p-3 bg-darkCard border border-darkBorder rounded-xl hover:border-accentBlue transition-all group shadow-sm">
          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-accentBlue transition-colors">Full Mock Test</p>
            <p className="text-slate-500 text-[10px]">Timed + proctored</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-accentBlue ml-auto transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default RelatedPractice;
