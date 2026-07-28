import React from 'react';
import { FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';

const ResourceSection = ({ resources }) => {
  if (!resources || resources.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {resources.map((r, i) => (
        <a key={r._id || i} href={r.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center space-x-3 p-4 bg-darkCard border border-darkBorder rounded-xl hover:border-accentBlue transition-all group shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center shrink-0">
            {r.type === 'pdf' ? <FileText className="w-4 h-4 text-accentBlue" /> : <LinkIcon className="w-4 h-4 text-accentBlue" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-accentBlue transition-colors truncate">{r.title}</p>
            {r.sourceName && <p className="text-slate-500 text-[10px]">{r.sourceName}</p>}
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-accentBlue shrink-0" />
        </a>
      ))}
    </div>
  );
};

export default ResourceSection;
