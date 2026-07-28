import React from 'react';
import { ExternalLink, Shield, Users, FileText, HelpCircle } from 'lucide-react';

const TYPE_CONFIG = {
  official: { label: 'Official', icon: Shield, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  placement_cell: { label: 'Placement Cell', icon: FileText, color: 'text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
  candidate_report: { label: 'Candidate Report', icon: Users, color: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-slate-700 dark:text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

const SourcesSection = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="space-y-2">
      {sources.map((s, i) => {
        const cfg = TYPE_CONFIG[s.sourceType] || TYPE_CONFIG.other;
        const Icon = cfg.icon;
        return (
          <div key={s._id || i} className="flex items-center justify-between p-3 bg-darkCard border border-darkBorder rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 min-w-0">
              <span className={`text-[9px] font-bold px-2 py-1 rounded border flex items-center space-x-1 shrink-0 ${cfg.color}`}>
                <Icon className="w-2.5 h-2.5" /><span>{cfg.label}</span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.title}</p>
                {s.publisher && <p className="text-[10px] text-slate-500">{s.publisher}</p>}
              </div>
            </div>
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                className="ml-3 shrink-0 text-slate-500 hover:text-accentBlue transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SourcesSection;
