import React, { useState, useEffect } from 'react';
import { Search, Building2, BookOpen } from 'lucide-react';
import { getGuides, getCompanies } from '../services/companyGuideService';
import GuideCard from '../components/companyGuides/GuideCard';
import SEO from '../components/SEO';

const CompaniesPage = () => {
  const [guides, setGuides] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [guidesRes, companiesRes] = await Promise.all([
          getGuides({ search, company: selectedCompany }),
          getCompanies(),
        ]);
        setGuides(guidesRes);
        setCompanies(companiesRes);
      } catch (err) {
        console.error('Error loading companies data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, selectedCompany]);

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Company Preparation Guides & Exam Patterns | NQTCoder"
        description="Comprehensive placement guides, syllabus, exam patterns, eligibility, and salary details for top hiring companies."
        path="/companies"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-accentBlue bg-accentBlue/10 border border-accentBlue/20 px-3 py-1 rounded-full">
            <Building2 className="w-3.5 h-3.5" />
            <span>Know Your Exam</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Company Placement Guides
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Detailed exam patterns, roles, salary packages, and eligibility criteria for TCS, Cognizant, Wipro, Infosys, and more.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-darkCard border border-darkBorder p-4 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides or exam name..."
              className="w-full bg-darkBg border border-darkBorder rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accentBlue transition-colors"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full sm:w-56 bg-darkBg border border-darkBorder rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-accentBlue transition-colors"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-darkCard/50 border border-darkBorder rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide._id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Guides Found</h3>
            <p className="text-slate-400 text-xs">Try clearing search filters or check back soon for new guides.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
