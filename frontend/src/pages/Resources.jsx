import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/resourceService';
import {
  Database, Server, Network, Layers, FileText, BookOpen,
  FolderOpen, ExternalLink, Search, ChevronRight, AlertCircle
} from 'lucide-react';
import SEO from '../components/SEO';

// Maps icon name string (stored in DB) to a Lucide component
const ICON_MAP = {
  Database,
  Server,
  Network,
  Layers,
  FileText,
  BookOpen,
  FolderOpen,
};

const getIcon = (name) => ICON_MAP[name] || BookOpen;

// Gradient palette cycled per card
const GRADIENTS = [
  'from-indigo-500/20 to-violet-500/10 border-indigo-500/20 text-indigo-400',
  'from-sky-500/20 to-cyan-500/10 border-sky-500/20 text-sky-400',
  'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
  'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
  'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400',
  'from-purple-500/20 to-fuchsia-500/10 border-purple-500/20 text-purple-400',
];

const ICON_COLORS = [
  'bg-indigo-500/15 border-indigo-500/25 text-indigo-400',
  'bg-sky-500/15 border-sky-500/25 text-sky-400',
  'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
  'bg-amber-500/15 border-amber-500/25 text-amber-400',
  'bg-rose-500/15 border-rose-500/25 text-rose-400',
  'bg-purple-500/15 border-purple-500/25 text-purple-400',
];

const BTN_COLORS = [
  'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25',
  'bg-sky-500 hover:bg-sky-600 shadow-sky-500/25',
  'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25',
  'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
  'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25',
  'bg-purple-500 hover:bg-purple-600 shadow-purple-500/25',
];

const Resources = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Could not load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = categories.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-darkBg text-slate-100">
      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <SEO
        title="Free Study Resources — SQL, DBMS, OS, CN & OOP Notes"
        description="Access free subject-wise revision notes for placement exams. Covers SQL, DBMS, Operating Systems, Computer Networks, and OOP. Curated for TCS NQT and IT placement prep."
        path="/resources"
        keywords="free study resources, SQL notes, DBMS revision, OS notes, computer networks, OOP notes, placement revision material, NQT resources"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.nqtcoder.dev/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Study Resources', 'item': 'https://www.nqtcoder.dev/resources' }
          ]
        }}
      />

      {/* ── Hero / Header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-darkBorder">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-20 w-[350px] h-[350px] rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">
            <FolderOpen className="w-3.5 h-3.5" />
            Study Materials
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Notes &amp; Resources
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            Subject-wise curated notes, cheat sheets, and study material — all stored in Google Drive folders for quick access.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="resources-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects…"
              className="w-full bg-darkCard border border-darkBorder pl-11 pr-4 py-3 rounded-2xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
            />
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-2xl text-sm mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
            </div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">
              Loading resources…
            </span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-darkCard border border-darkBorder flex items-center justify-center">
              <FolderOpen className="w-9 h-9 text-slate-600" />
            </div>
            <p className="text-slate-500 font-bold">
              {search ? `No subjects found for "${search}"` : 'No resources added yet. Check back soon!'}
            </p>
          </div>
        )}

        {/* Grid of subject cards */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
              {filtered.length} {filtered.length === 1 ? 'Subject' : 'Subjects'} available
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cat, idx) => {
                const colorIdx = idx % GRADIENTS.length;
                const Icon = getIcon(cat.icon);

                return (
                  <div
                    key={cat._id}
                    className={`group relative bg-gradient-to-br ${GRADIENTS[colorIdx]} bg-darkCard border rounded-2xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                  >
                    {/* Decorative corner glow */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl bg-current pointer-events-none" />

                    {/* Icon + title */}
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${ICON_COLORS[colorIdx]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-black text-white leading-snug truncate">
                          {cat.title}
                        </h2>
                        {cat.description && (
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer action */}
                    <div className="mt-auto pt-2">
                      {cat.driveFolderLink ? (
                        <a
                          id={`resource-open-${cat._id}`}
                          href={cat.driveFolderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all duration-200 ${BTN_COLORS[colorIdx]}`}
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          Open Notes Folder
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 border border-darkBorder bg-darkBg cursor-not-allowed">
                          <FolderOpen className="w-3.5 h-3.5" />
                          Coming Soon
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Footer tip ────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="flex items-center gap-3 bg-indigo-500/8 border border-indigo-500/15 rounded-2xl px-5 py-4 text-xs text-slate-400">
            <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
            All folders are hosted on Google Drive. Click <strong className="text-white">"Open Notes Folder"</strong> to browse files for that subject. Request access if a folder is restricted.
          </div>
        </div>
      )}

    </div>
  );
};

export default Resources;
