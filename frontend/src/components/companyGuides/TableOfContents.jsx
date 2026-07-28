import React, { useState, useEffect } from 'react';
import { List, ChevronDown } from 'lucide-react';

const SECTIONS = [
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-roles', label: 'Roles & Packages', check: (g) => g?.roles?.length > 0 },
  { id: 'section-eligibility', label: 'Eligibility', check: (g) => g?.eligibility?.minimumPercentage || g?.eligibility?.eligibleDegrees?.length > 0 },
  { id: 'section-recruitment', label: 'Recruitment', check: (g) => g?.recruitmentStages?.length > 0 },
  { id: 'section-exam', label: 'Exam Pattern', check: (g) => g?.examPattern?.length > 0 },
  { id: 'section-content', label: 'Detailed Guide', check: (g) => g?.content?.trim().length > 0 },
  { id: 'section-practice', label: 'Prepare on NQTCoder' },
  { id: 'section-faqs', label: 'FAQs', check: (g) => g?.faqs?.length > 0 },
  { id: 'section-resources', label: 'Resources', check: (g) => g?.resources?.length > 0 },
  { id: 'section-sources', label: 'Sources', check: (g) => g?.sources?.length > 0 },
];

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

const TableOfContents = ({ guide }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const visible = SECTIONS.filter(s => !s.check || s.check(guide));

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140; // Offset for fixed top navbar
      let currentId = '';

      for (let i = 0; i < visible.length; i++) {
        const s = visible[i];
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentId = s.id;
            break;
          }
        }
      }

      if (!currentId && visible.length > 0) {
        if (window.scrollY < 200) {
          currentId = visible[0].id;
        } else {
          let minDiff = Infinity;
          visible.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) {
              const diff = Math.abs(el.getBoundingClientRect().top - 120);
              if (diff < minDiff) {
                minDiff = diff;
                currentId = s.id;
              }
            }
          });
        }
      }

      if (currentId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [guide]);

  const activeLabel = visible.find((s) => s.id === activeId)?.label || 'On this page';

  const NavList = ({ onClickItem }) => (
    <ul className="space-y-1 relative">
      {visible.map((s) => {
        const isActive = activeId === s.id;
        return (
          <li key={s.id}>
            <button
              onClick={() => {
                setActiveId(s.id);
                scrollToSection(s.id);
                if (onClickItem) onClickItem();
              }}
              className={`w-full text-left text-xs flex items-center justify-between transition-all duration-200 ${
                isActive
                  ? 'bg-accentBlue/10 text-accentBlue font-extrabold border-l-2 border-accentBlue pl-3 pr-2 py-1.5 rounded-r-lg shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white pl-2 py-1.5 hover:pl-3'
              }`}
            >
              <span className="truncate">{s.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-accentBlue animate-pulse shrink-0 ml-1.5" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop sticky */}
      <div className="hidden lg:block sticky top-24 self-start">
        <div className="bg-darkCard border border-darkBorder rounded-xl p-4 w-52 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center space-x-1.5">
            <List className="w-3 h-3 text-accentBlue" />
            <span>On this page</span>
          </p>
          <NavList />
        </div>
      </div>

      {/* Mobile collapsible */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-darkCard border border-darkBorder rounded-xl text-xs font-bold text-slate-800 dark:text-slate-300 shadow-sm"
        >
          <span className="flex items-center space-x-2">
            <List className="w-4 h-4 text-accentBlue" />
            <span>{activeLabel}</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileOpen && (
          <div className="mt-2 bg-darkCard border border-darkBorder rounded-xl p-4 shadow-sm">
            <NavList onClickItem={() => setMobileOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default TableOfContents;
