import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  adminGetGuideById, adminUpdateGuide, adminGetCompanies,
  adminPublishGuide, adminVerifyGuide
} from '../services/companyGuideService';
import BasicInfoForm from '../components/companyGuides/admin/BasicInfoForm';
import RoleBuilder from '../components/companyGuides/admin/RoleBuilder';
import EligibilityForm from '../components/companyGuides/admin/EligibilityForm';
import RecruitmentBuilder from '../components/companyGuides/admin/RecruitmentBuilder';
import ExamPatternBuilder from '../components/companyGuides/admin/ExamPatternBuilder';
import RichTextEditor from '../components/companyGuides/admin/RichTextEditor';
import FaqBuilder from '../components/companyGuides/admin/FaqBuilder';
import ResourceBuilder from '../components/companyGuides/admin/ResourceBuilder';
import SourcesBuilder from '../components/companyGuides/admin/SourcesBuilder';
import SeoForm from '../components/companyGuides/admin/SeoForm';
import SEO from '../components/SEO';
import { ArrowLeft, Save, Eye, CheckCircle, AlertTriangle, Check } from 'lucide-react';

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'roles', label: 'Roles & Packages' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'exam', label: 'Exam Pattern' },
  { id: 'content', label: 'Content' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'resources', label: 'Resources' },
  { id: 'sources', label: 'Sources' },
  { id: 'seo', label: 'SEO' },
];

const AdminCompanyGuideEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [guideData, setGuideData] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gData, cData] = await Promise.all([
          adminGetGuideById(id),
          adminGetCompanies(),
        ]);
        setGuideData(gData);
        setCompanies(cData || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading guide.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Autosave for drafts only (4s debounce)
  useEffect(() => {
    if (!isDirty || !guideData || guideData.status !== 'draft') return;
    const timer = setTimeout(async () => {
      try {
        setSaveStatus('Autosaving draft...');
        await adminUpdateGuide(id, guideData);
        setIsDirty(false);
        setSaveStatus('Draft saved ✓ ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        setSaveStatus('Autosave failed');
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [guideData, isDirty, id]);

  const handleChange = (updated) => {
    setGuideData(updated);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError('');
      const saved = await adminUpdateGuide(id, guideData);
      setGuideData(saved);
      setIsDirty(false);
      setSaveStatus('Saved ✓');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      setError('');
      // First update current state
      await adminUpdateGuide(id, guideData);
      // Then publish with gate checks
      const res = await adminPublishGuide(id);
      setGuideData(res.guide);
      setIsDirty(false);
      setSaveStatus('Published ✓');
    } catch (err) {
      setError(err.response?.data?.message || 'Publish failed validation gates.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    try {
      setError('');
      const res = await adminVerifyGuide(id);
      setGuideData({ ...guideData, lastVerifiedAt: res.lastVerifiedAt });
      setSaveStatus('Verified today ✓');
    } catch (err) {
      setError('Verification failed.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center">Loading editor...</div>;
  }

  if (!guideData) {
    return <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center text-rose-400">{error || 'Guide not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 pb-20">
      <SEO title={`Editing: ${guideData.title} | Admin`} />

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-40 bg-darkCard/95 backdrop-blur-md border-b border-darkBorder px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/company-guides" className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1 text-xs font-bold">
              <ArrowLeft className="w-4 h-4" />
              <span>Guides</span>
            </Link>
            <div className="h-4 w-px bg-darkBorder" />
            <div>
              <h2 className="text-sm font-black text-white truncate max-w-xs sm:max-w-md">{guideData.title || 'Untitled Guide'}</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase">{guideData.status} • {saveStatus || 'Ready'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleVerify}
              title="Mark information as verified today"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-darkBg border border-darkBorder hover:border-emerald-500/50 rounded-lg text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Verified</span>
            </button>

            <Link
              to={`/admin/company-guides/${id}/preview`}
              target="_blank"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-darkBg border border-darkBorder hover:border-slate-500 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>

            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-darkBg border border-darkBorder hover:border-accentBlue rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-accentBlue hover:bg-accentBlue/90 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Header */}
        <div className="flex items-center space-x-1 border-b border-darkBorder overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-darkCard text-accentBlue border-t-2 border-accentBlue'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-darkCard/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 sm:p-8">
          {activeTab === 'basic' && (
            <BasicInfoForm data={guideData} onChange={handleChange} companies={companies} />
          )}
          {activeTab === 'roles' && (
            <RoleBuilder roles={guideData.roles || []} onChange={(roles) => handleChange({ ...guideData, roles })} />
          )}
          {activeTab === 'eligibility' && (
            <EligibilityForm data={guideData.eligibility || {}} onChange={(eligibility) => handleChange({ ...guideData, eligibility })} />
          )}
          {activeTab === 'recruitment' && (
            <RecruitmentBuilder stages={guideData.recruitmentStages || []} onChange={(recruitmentStages) => handleChange({ ...guideData, recruitmentStages })} />
          )}
          {activeTab === 'exam' && (
            <ExamPatternBuilder sections={guideData.examPattern || []} onChange={(examPattern) => handleChange({ ...guideData, examPattern })} />
          )}
          {activeTab === 'content' && (
            <RichTextEditor content={guideData.content || ''} onChange={(content) => handleChange({ ...guideData, content })} />
          )}
          {activeTab === 'faqs' && (
            <FaqBuilder faqs={guideData.faqs || []} onChange={(faqs) => handleChange({ ...guideData, faqs })} />
          )}
          {activeTab === 'resources' && (
            <ResourceBuilder resources={guideData.resources || []} onChange={(resources) => handleChange({ ...guideData, resources })} />
          )}
          {activeTab === 'sources' && (
            <SourcesBuilder sources={guideData.sources || []} onChange={(sources) => handleChange({ ...guideData, sources })} />
          )}
          {activeTab === 'seo' && (
            <SeoForm data={guideData.seo || {}} onChange={(seo) => handleChange({ ...guideData, seo })} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyGuideEditor;
