import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, ExternalLink, BookOpen, Trophy, AlertTriangle } from 'lucide-react';

const formatVerified = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const GuideHero = ({ guide }) => {
  const { title, shortDescription, lastVerifiedAt, dataNotice, company, examName, guideType } = guide;
  const practiceKey = company?.legacyKeys?.[0] || company?.name || '';
  const defaultLogo = company?.slug ? `/images/companies/${company.slug}.png` : '/logo.png';
  const logoSrc = company?.logo || defaultLogo;
  const fallbackLogo = company?.slug ? `/${company.slug}-logo.png` : '/logo.png';

  return (
    <div className="bg-gradient-to-br from-darkCard to-darkBg border border-darkBorder rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-6">
        <Link to="/" className="hover:text-accentBlue transition-colors">Home</Link>
        <span>/</span>
        <Link to="/companies" className="hover:text-accentBlue transition-colors">Companies</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 truncate max-w-xs">{title}</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={logoSrc}
          alt={company?.name || 'Company'}
          className="w-28 h-20 sm:w-32 sm:h-20 rounded-xl object-contain bg-white border border-darkBorder p-2 shrink-0 shadow-sm"
          onError={(e) => {
            if (!e.target.dataset.triedFallback) {
              e.target.dataset.triedFallback = 'true';
              e.target.src = fallbackLogo;
            } else {
              e.target.style.display = 'none';
            }
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-accentBlue">{company?.name}</span>
            {examName && <><span className="text-slate-400 text-[9px]">•</span><span className="text-[9px] text-slate-500 font-bold">{examName}</span></>}
            {guideType && (
              <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                {guideType.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3">{title}</h1>
          {shortDescription && <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed mb-4">{shortDescription}</p>}

          <div className="flex flex-wrap gap-3 mb-4">
            {practiceKey && (
              <Link to={`/practice?company=${practiceKey}`}
                className="flex items-center space-x-1.5 bg-accentBlue hover:bg-accentBlue/90 text-white text-xs font-black px-4 py-2 rounded-lg transition-all shadow-sm">
                <BookOpen className="w-3.5 h-3.5" /><span>Practice Questions</span>
              </Link>
            )}
            <Link to="/mocktest"
              className="flex items-center space-x-1.5 bg-darkBg hover:bg-darkBorder text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-black px-4 py-2 rounded-lg border border-darkBorder transition-all shadow-sm">
              <Trophy className="w-3.5 h-3.5" /><span>Mock Test</span>
            </Link>
            {company?.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold transition-colors">
                <ExternalLink className="w-3 h-3" /><span>Official Site</span>
              </a>
            )}
          </div>

          {lastVerifiedAt ? (
            <span className="flex items-center space-x-1.5 text-[10px] text-emerald-600 dark:text-emerald-500">
              <CheckCircle className="w-3 h-3" />
              <span>Information verified {formatVerified(lastVerifiedAt)}</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-[10px] text-slate-500">
              <Clock className="w-3 h-3" /><span>Verification pending</span>
            </span>
          )}
        </div>
      </div>

      {dataNotice && (
        <div className="mt-5 flex items-start space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">{dataNotice}</p>
        </div>
      )}
    </div>
  );
};

export default GuideHero;
