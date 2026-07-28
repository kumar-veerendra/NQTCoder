import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetGuideById } from '../services/companyGuideService';
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
import { Eye, Edit3 } from 'lucide-react';

const AdminCompanyGuidePreview = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const data = await adminGetGuideById(id);
        setGuide(data);
      } catch (err) {
        setError('Error loading draft guide preview.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center">Loading preview...</div>;
  }

  if (error || !guide) {
    return <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center text-rose-400">{error || 'Guide not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <SEO title={`Preview: ${guide.title}`} />

      {/* Admin Watermark Banner */}
      <div className="max-w-7xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
          <Eye className="w-4 h-4" />
          <span>DRAFT PREVIEW MODE — This page is visible only to admins</span>
        </div>
        <Link
          to={`/admin/company-guides/${id}/edit`}
          className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Back to Editor</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        <GuideHero guide={guide} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0 space-y-10 w-full">
            {guide.roles && guide.roles.length > 0 && (
              <section id="section-roles" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-accentBlue rounded-full" />
                  <span>Roles & Packages</span>
                </h2>
                <RoleSalaryTable roles={guide.roles} />
              </section>
            )}

            {guide.eligibility && (guide.eligibility.minimumPercentage || guide.eligibility.eligibleDegrees?.length > 0) && (
              <section id="section-eligibility" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                  <span>Eligibility Criteria</span>
                </h2>
                <EligibilitySection eligibility={guide.eligibility} />
              </section>
            )}

            {guide.recruitmentStages && guide.recruitmentStages.length > 0 && (
              <section id="section-recruitment" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-sky-500 rounded-full" />
                  <span>Recruitment Process</span>
                </h2>
                <RecruitmentTimeline stages={guide.recruitmentStages} />
              </section>
            )}

            {guide.examPattern && guide.examPattern.length > 0 && (
              <section id="section-exam" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-violet-500 rounded-full" />
                  <span>Exam Pattern & Test Structure</span>
                </h2>
                <ExamPatternTable sections={guide.examPattern} />
              </section>
            )}

            {guide.content && guide.content.trim().length > 0 && (
              <section id="section-content" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-amber-500 rounded-full" />
                  <span>Detailed Syllabus & Guide</span>
                </h2>
                <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-8">
                  <GuideContent content={guide.content} />
                </div>
              </section>
            )}

            <section id="section-practice">
              <RelatedPractice company={guide.company} />
            </section>

            {guide.faqs && guide.faqs.length > 0 && (
              <section id="section-faqs" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-pink-500 rounded-full" />
                  <span>Frequently Asked Questions</span>
                </h2>
                <FaqAccordion faqs={guide.faqs} />
              </section>
            )}

            {guide.resources && guide.resources.length > 0 && (
              <section id="section-resources" className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                  <span>Downloads & Resources</span>
                </h2>
                <ResourceSection resources={guide.resources} />
              </section>
            )}

            {guide.sources && guide.sources.length > 0 && (
              <section id="section-sources" className="space-y-4 pt-4 border-t border-darkBorder">
                <h3 className="text-sm font-bold text-slate-400">Sources & Verified References</h3>
                <SourcesSection sources={guide.sources} />
              </section>
            )}
          </div>

          <TableOfContents guide={guide} />
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyGuidePreview;
