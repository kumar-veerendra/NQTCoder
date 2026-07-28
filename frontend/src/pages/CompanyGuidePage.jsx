import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGuideBySlug } from '../services/companyGuideService';
import GuideHero from '../components/companyGuides/GuideHero';
import ExamPatternTable from '../components/companyGuides/ExamPatternTable';
import RoleSalaryTable from '../components/companyGuides/RoleSalaryTable';
import EligibilitySection from '../components/companyGuides/EligibilitySection';
import RecruitmentTimeline from '../components/companyGuides/RecruitmentTimeline';
import FaqAccordion from '../components/companyGuides/FaqAccordion';
import TableOfContents from '../components/companyGuides/TableOfContents';
import GuideContent from '../components/companyGuides/GuideContent';
import ResourceSection from '../components/companyGuides/ResourceSection';
import SourcesSection from '../components/companyGuides/SourcesSection';
import RelatedPractice from '../components/companyGuides/RelatedPractice';
import SEO from '../components/SEO';
import { AlertCircle } from 'lucide-react';

const CompanyGuidePage = () => {
  const { slug } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGuideBySlug(slug);
        setGuide(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Guide not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-64 bg-darkCard border border-darkBorder rounded-2xl animate-pulse" />
          <div className="h-96 bg-darkCard border border-darkBorder rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-darkBg text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-darkCard border border-darkBorder p-8 rounded-2xl space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guide Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error || 'The requested company guide could not be found.'}</p>
          <Link to="/companies" className="inline-block bg-accentBlue text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-accentBlue/90 transition-colors shadow-sm">
            Browse All Guides
          </Link>
        </div>
      </div>
    );
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.shortDescription,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      author: { '@type': 'Organization', name: 'NQTCoder' },
      publisher: { '@type': 'Organization', name: 'NQTCoder' },
    },
    guide.faqs?.length > 0 && {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.nqtcoder.dev/' },
        { '@type': 'ListItem', position: 2, name: 'Companies', item: 'https://www.nqtcoder.dev/companies' },
        { '@type': 'ListItem', position: 3, name: guide.title, item: `https://www.nqtcoder.dev/companies/${guide.slug}` },
      ],
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-darkBg text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title={guide.seo?.metaTitle || `${guide.title} — Complete Guide | NQTCoder`}
        description={guide.seo?.metaDescription || guide.shortDescription}
        keywords={(guide.seo?.keywords || []).join(', ')}
        path={`/companies/${guide.slug}`}
        ogImage={guide.seo?.ogImage || guide.coverImage}
        ogType="article"
        jsonLd={jsonLd}
      />

      <div className="max-w-7xl mx-auto">
        <div id="section-overview">
          <GuideHero guide={guide} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-10 w-full">
            {/* Roles & Packages Section */}
            {guide.roles && guide.roles.length > 0 && (
              <section id="section-roles" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-accentBlue rounded-full" />
                  <span>Roles & Packages</span>
                </h2>
                <RoleSalaryTable roles={guide.roles} />
              </section>
            )}

            {/* Eligibility Section */}
            {guide.eligibility && (guide.eligibility.minimumPercentage || guide.eligibility.eligibleDegrees?.length > 0) && (
              <section id="section-eligibility" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                  <span>Eligibility Criteria</span>
                </h2>
                <EligibilitySection eligibility={guide.eligibility} />
              </section>
            )}

            {/* Recruitment Timeline */}
            {guide.recruitmentStages && guide.recruitmentStages.length > 0 && (
              <section id="section-recruitment" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-sky-500 rounded-full" />
                  <span>Recruitment Process</span>
                </h2>
                <RecruitmentTimeline stages={guide.recruitmentStages} />
              </section>
            )}

            {/* Exam Pattern */}
            {guide.examPattern && guide.examPattern.length > 0 && (
              <section id="section-exam" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-violet-500 rounded-full" />
                  <span>Exam Pattern & Test Structure</span>
                </h2>
                <ExamPatternTable sections={guide.examPattern} />
              </section>
            )}

            {/* Editorial Content (TipTap HTML) */}
            {guide.content && guide.content.trim().length > 0 && (
              <section id="section-content" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-amber-500 rounded-full" />
                  <span>Detailed Syllabus & Guide</span>
                </h2>
                <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-8 shadow-sm">
                  <GuideContent content={guide.content} />
                </div>
              </section>
            )}

            {/* Related Practice CTA */}
            <section id="section-practice">
              <RelatedPractice company={guide.company} />
            </section>

            {/* Structured FAQs */}
            {guide.faqs && guide.faqs.length > 0 && (
              <section id="section-faqs" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-pink-500 rounded-full" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <FaqAccordion faqs={guide.faqs} />
              </section>
            )}

            {/* Resources */}
            {guide.resources && guide.resources.length > 0 && (
              <section id="section-resources" className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                  <span>Downloads & Resources</span>
                </h2>
                <ResourceSection resources={guide.resources} />
              </section>
            )}

            {/* Sources */}
            {guide.sources && guide.sources.length > 0 && (
              <section id="section-sources" className="space-y-4 pt-4 border-t border-darkBorder">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">Sources & Verified References</h3>
                <SourcesSection sources={guide.sources} />
              </section>
            )}
          </div>

          {/* Table of Contents (Desktop Sticky / Mobile Collapsible) */}
          <TableOfContents guide={guide} />
        </div>
      </div>
    </div>
  );
};

export default CompanyGuidePage;
