import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';

const HIGHLIGHT_COLORS = {
  'Exam Pattern': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  'Roles & Packages': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  'Eligibility': 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
  'Full Syllabus': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  'FAQs': 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
};

const formatVerified = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const GuideCard = ({ guide }) => {
  const { title, slug, examName, shortDescription, lastVerifiedAt, company, highlights = [] } = guide;
  const defaultLogo = company?.slug ? `/images/companies/${company.slug}.png` : '/logo.png';
  const logoSrc = company?.logo || defaultLogo;
  const fallbackLogo = company?.slug ? `/${company.slug}-logo.png` : '/logo.png';

  return (
    <Link
      to={`/companies/${slug}`}
      className="group block bg-darkCard border border-darkBorder rounded-xl p-5 hover:border-accentBlue transition-all duration-200 hover:shadow-lg hover:shadow-accentBlue/5"
    >
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={logoSrc}
          alt={company?.name || 'Company'}
          className="w-14 h-9 rounded-lg object-contain bg-white border border-darkBorder p-1 shrink-0 shadow-sm"
          onError={(e) => {
            if (!e.target.dataset.triedFallback) {
              e.target.dataset.triedFallback = 'true';
              e.target.src = fallbackLogo;
            } else {
              e.target.style.display = 'none';
            }
          }}
        />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {company?.name || 'Company'}
          </p>
          {examName && (
            <p className="text-[10px] text-slate-500">{examName}</p>
          )}
        </div>
      </div>

      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-accentBlue transition-colors leading-snug mb-2">
        {title}
      </h3>

      {shortDescription && (
        <p className="text-slate-700 dark:text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">
          {shortDescription}
        </p>
      )}

      {highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {highlights.map((h) => (
            <span
              key={h}
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${HIGHLIGHT_COLORS[h] || 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'}`}
            >
              {h}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-darkBorder">
        {lastVerifiedAt ? (
          <span className="flex items-center space-x-1 text-[9px] text-slate-500">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-500" />
            <span>Verified {formatVerified(lastVerifiedAt)}</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-[9px] text-slate-500">
            <Clock className="w-2.5 h-2.5" />
            <span>Verification pending</span>
          </span>
        )}
        <span className="flex items-center space-x-1 text-[10px] font-bold text-accentBlue group-hover:translate-x-0.5 transition-transform">
          <span>Read Guide</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default GuideCard;
