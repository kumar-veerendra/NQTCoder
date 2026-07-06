import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as questionService from '../services/questionService';
import { 
  ChevronLeft, Plus, Trash2, Save, FileText, CheckCircle2, 
  HelpCircle, Sparkles, BookOpen 
} from 'lucide-react';
import SEO from '../components/SEO';

const AdminMCQQuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Basic Form States
  const [questionId, setQuestionId] = useState('');
  const [slug, setSlug] = useState('');
  const [section, setSection] = useState('quant');
  const [topic, setTopic] = useState('percentage');
  const [displayName, setDisplayName] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [company, setCompany] = useState('');

  // Content
  const [statement, setStatement] = useState('');

  // Options
  const [options, setOptions] = useState([
    { optionId: 'A', text: '' },
    { optionId: 'B', text: '' },
    { optionId: 'C', text: '' },
    { optionId: 'D', text: '' }
  ]);

  // Correct answer (array of string, e.g. ["B"])
  const [correctAnswer, setCorrectAnswer] = useState('');

  // Explanation
  const [summary, setSummary] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [steps, setSteps] = useState([{ title: '', content: '' }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchQuestionForEdit();
    }
  }, [id, isEditMode]);

  const fetchQuestionForEdit = async () => {
    setLoading(true);
    setError('');
    try {
      const q = await questionService.getQuestionById(id);
      if (q.kind !== 'MCQQuestion') {
        setError('This question is not an MCQ question. Cannot open in MCQ editor.');
        return;
      }

      setQuestionId(q.questionId || '');
      setSlug(q.slug || '');
      setSection(q.section || 'quant');
      setTopic(q.topic || 'percentage');
      setDisplayName(q.displayName || '');
      setSubTopic(q.subTopic || '');
      setDifficulty(q.difficulty || 'easy');
      setCompany(q.applicableCompanies?.join(', ') || '');
      setStatement(q.content?.statement || '');
      
      setOptions(q.options?.length ? q.options : [
        { optionId: 'A', text: '' },
        { optionId: 'B', text: '' },
        { optionId: 'C', text: '' },
        { optionId: 'D', text: '' }
      ]);
      setCorrectAnswer(q.correctAnswer?.[0] || 'A');
      setSummary(q.explanation?.summary || '');
      setShortcut(q.explanation?.shortcut || '');
      setSteps(q.explanation?.steps?.length ? q.explanation.steps : [{ title: '', content: '' }]);

    } catch (err) {
      console.error(err);
      setError('Could not download problem parameters to load edit form.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length); // A, B, C, D...
    setOptions([...options, { optionId: nextLetter, text: '' }]);
  };

  const handleRemoveOption = (idx) => {
    setOptions(options.filter((_, i) => i !== idx).map((opt, i) => ({
      ...opt,
      optionId: String.fromCharCode(65 + i)
    })));
  };

  const handleOptionTextChange = (idx, text) => {
    const updated = [...options];
    updated[idx].text = text;
    setOptions(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, { title: '', content: '' }]);
  };

  const handleRemoveStep = (idx) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx, field, value) => {
    const updated = [...steps];
    updated[idx][field] = value;
    setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input checks
    if (!questionId || !slug || !displayName || !statement || !correctAnswer || !summary) {
      setError('Please fill in all mandatory fields (ID, Slug, Display Name, Statement, Correct Answer, Explanation).');
      return;
    }

    const companyArray = company
      ? company.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const payload = {
      questionId,
      slug,
      domain: 'aptitude',
      section,
      topic,
      displayName,
      subTopic,
      difficulty,
      applicableCompanies: companyArray,
      content: {
        statement,
        format: 'markdown',
        assets: []
      },
      source: {
        type: 'original',
        isVerified: true
      },
      meta: {
        estimatedSolveTimeSec: 90,
        marks: 1,
        negativeMarks: 0,
        status: 'published'
      },
      options,
      correctAnswer: [correctAnswer],
      explanation: {
        summary,
        shortcut,
        steps: steps.filter(s => s.title && s.content)
      }
    };

    setLoading(true);
    try {
      if (isEditMode) {
        await questionService.updateQuestion(id, payload);
        setSuccess('MCQ question updated successfully!');
      } else {
        await questionService.createQuestion(payload);
        setSuccess('New MCQ question registered successfully!');
      }
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving question parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-darkBg text-slate-100 min-h-screen space-y-6">
      <SEO
        title={isEditMode ? 'Edit MCQ Question — Admin console' : 'Create MCQ Question — Admin console'}
        description="Admin panel to manage Quantitative Aptitude & Logical Reasoning MCQ questions."
        path="/admin/mcq/new"
        noIndex={true}
      />

      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white uppercase font-bold tracking-wider transition-colors cursor-pointer select-none"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-wide">
          {isEditMode ? 'Modify MCQ Question Parameters' : 'Register MCQ Question'}
        </h1>
        <p className="text-xs text-slate-400">
          Populate placement syllabus questions under the universal engine collection.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl text-red-400 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Classification parameters */}
        <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
            <FileText className="w-4 h-4 text-accentBlue mr-2" /> 1. Question Identity & Hierarchy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Question Code *</label>
              <input
                type="text"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                placeholder="e.g. TCS-QUANT-000001"
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Slug / Link URL *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. percentage-profit-loss-01"
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section *</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-semibold"
              >
                <option value="quant">Quantitative Aptitude</option>
                <option value="logical">Logical Reasoning</option>
                <option value="verbal">Verbal Ability</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Topic Key Name *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. percentage"
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UI Display Title *</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Percentage & Averages"
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subtopic</label>
              <input
                type="text"
                value={subTopic}
                onChange={(e) => setSubTopic(e.target.value)}
                placeholder="e.g. Successive Percentage changes"
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Difficulty *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-semibold"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Companies (comma-separated)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. TCS, Wipro, Accenture"
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Question Statement */}
        <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
            <HelpCircle className="w-4.5 h-4.5 text-accentBlue mr-2" /> 2. Question Statement
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Statement Content (Markdown/LaTeX supported) *</label>
            <textarea
              rows="6"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="e.g. If B's salary is 20% more than A's, then A's salary is how much percent less?"
              className="w-full bg-darkBg border border-darkBorder rounded-lg p-3 text-xs text-white focus:outline-none focus:border-slate-500 font-mono resize-y"
            />
          </div>
        </div>

        {/* Section 3: Options Selector */}
        <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between select-none">
            <span className="flex items-center"><HelpCircle className="w-4.5 h-4.5 text-accentBlue mr-2" /> 3. Options Mapping</span>
            <button
              type="button"
              onClick={handleAddOption}
              className="bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
              Add Option
            </button>
          </h2>

          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-darkBg border border-darkBorder flex items-center justify-center text-xs font-bold font-mono">
                  {opt.optionId}
                </span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                  placeholder={`Option ${opt.optionId} text`}
                  className="flex-grow bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Correct Option Letter *</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-bold"
              >
                {options.map((opt) => (
                  <option key={opt.optionId} value={opt.optionId}>
                    Option {opt.optionId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Explanations */}
        <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
            <BookOpen className="w-4.5 h-4.5 text-accentBlue mr-2" /> 4. Solutions Summary & Steps
          </h2>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solution Summary (Visible post-solve) *</label>
            <textarea
              rows="4"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Using the standard percentage comparison formula: Difference/B's salary = 20/120 = 16.66%."
              className="w-full bg-darkBg border border-darkBorder rounded-lg p-3 text-xs text-white focus:outline-none focus:border-slate-500 resize-y"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shortcut / Quick Solving Formula</label>
            <input
              type="text"
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
              placeholder="e.g. Formula: [r / (100 + r)] * 100 % = 20/120 = 16.67%"
              className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-semibold"
            />
          </div>

          {/* Steps list */}
          <div className="space-y-4 pt-3 border-t border-darkBorder/40">
            <div className="flex justify-between items-center select-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-slate-600" /> Step-by-Step Solving Steps
              </span>
              <button
                type="button"
                onClick={handleAddStep}
                className="bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer"
              >
                Add Step
              </button>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className="bg-darkBg/30 border border-darkBorder/40 p-4 rounded-xl space-y-3 relative">
                <div className="flex justify-between items-center select-none">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step {idx + 1}</span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-rose-500 hover:underline text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Delete Step
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                    placeholder={`e.g. Step ${idx + 1}: Establish A's salary`}
                    className="w-full bg-darkBg border border-darkBorder rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-slate-500 font-semibold"
                  />
                  <textarea
                    rows="3"
                    value={step.content}
                    onChange={(e) => handleStepChange(idx, 'content', e.target.value)}
                    placeholder="Step calculations and descriptions..."
                    className="w-full bg-darkBg border border-darkBorder rounded-lg p-3 text-xs text-white focus:outline-none focus:border-slate-500 resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form controls */}
        <div className="flex justify-end gap-3 pt-4 border-t border-darkBorder/40 select-none">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 py-2.5 rounded-xl border border-darkBorder text-xs text-slate-400 hover:text-white uppercase font-bold tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-accentBlue hover:bg-accentBlue/90 text-white px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-accentBlue/10 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Question'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminMCQQuestionForm;
