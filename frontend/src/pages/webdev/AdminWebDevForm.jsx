import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  getAdminWebDevQuestion,
  createAdminWebDevQuestion,
  updateAdminWebDevQuestion,
} from '../../services/webDevService';
import WebDevPreviewFrame from '../../components/webdev/WebDevPreviewFrame';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Play,
  Award,
  Sparkles,
  Layers,
  Code,
  ShieldAlert,
} from 'lucide-react';
import SEO from '../../components/SEO';

const AdminWebDevForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Metadata
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [category, setCategory] = useState('javascript');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [status, setStatus] = useState('published');
  const [tags, setTags] = useState('');
  const [requirements, setRequirements] = useState(['']);

  // Starter Code
  const [starterHtml, setStarterHtml] = useState('');
  const [starterCss, setStarterCss] = useState('');
  const [starterJs, setStarterJs] = useState('');
  const [activeStarterTab, setActiveStarterTab] = useState('javascript');

  // Solution Code
  const [solutionHtml, setSolutionHtml] = useState('');
  const [solutionCss, setSolutionCss] = useState('');
  const [solutionJs, setSolutionJs] = useState('');
  const [activeSolutionTab, setActiveSolutionTab] = useState('javascript');

  // Tests
  const [tests, setTests] = useState([
    {
      id: 'test_1',
      description: 'Element exists in DOM',
      failureMessage: 'Target element was not found in DOM',
      points: 50,
      type: 'dom',
      target: '#root',
      assertion: { type: 'exists', expected: '' },
    },
  ]);

  // Validation / Test runner state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatorPreviewRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      fetchQuestionDetails();
    }
  }, [id]);

  const fetchQuestionDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminWebDevQuestion(id);
      const q = res.question;
      setTitle(q.title || '');
      setSlug(q.slug || '');
      setDifficulty(q.difficulty || 'easy');
      setCategory(q.category || 'javascript');
      setDescription(q.description || '');
      setTimeLimit(q.timeLimit || 20);
      setStatus(q.status || 'published');
      setTags((q.tags || []).join(', '));
      setRequirements(q.requirements?.length ? q.requirements : ['']);

      setStarterHtml(q.starterCode?.html || '');
      setStarterCss(q.starterCode?.css || '');
      setStarterJs(q.starterCode?.javascript || '');

      setSolutionHtml(q.solutionCode?.html || '');
      setSolutionCss(q.solutionCode?.css || '');
      setSolutionJs(q.solutionCode?.javascript || '');

      setTests(q.tests?.length ? q.tests : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch question details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequirement = () => {
    setRequirements((prev) => [...prev, '']);
  };

  const handleUpdateRequirement = (index, value) => {
    setRequirements((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveRequirement = (index) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTest = () => {
    const newId = `test_${Date.now()}`;
    setTests((prev) => [
      ...prev,
      {
        id: newId,
        description: 'New behavioral check',
        failureMessage: 'Check failed',
        points: 25,
        type: 'dom',
        target: '#target',
        assertion: { type: 'exists', expected: '' },
      },
    ]);
  };

  const handleUpdateTest = (index, field, value) => {
    setTests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleUpdateTestAssertion = (index, field, value) => {
    setTests((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        assertion: { ...(copy[index].assertion || {}), [field]: value },
      };
      return copy;
    });
  };

  const handleRemoveTest = (index) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  // Run the Reference Solution through the Test Evaluator inside the preview frame
  const handleValidateChallenge = () => {
    if (!validatorPreviewRef.current) return;
    setIsValidating(true);
    setValidationResults(null);
    validatorPreviewRef.current.runTests(tests);
  };

  const handleValidationResults = (results) => {
    setIsValidating(false);
    setValidationResults(results);
  };

  const totalTestPoints = tests.reduce((acc, t) => acc + (Number(t.points) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!tests.length) {
      setError('At least one evaluation test is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        difficulty,
        category,
        description: description.trim(),
        requirements: requirements.filter(Boolean),
        starterCode: {
          html: starterHtml,
          css: starterCss,
          javascript: starterJs,
        },
        solutionCode: {
          html: solutionHtml,
          css: solutionCss,
          javascript: solutionJs,
        },
        tests,
        points: totalTestPoints || 100,
        timeLimit: Number(timeLimit) || 20,
        status,
        tags: tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      };

      if (isEdit) {
        await updateAdminWebDevQuestion(id, payload);
        setSuccess('Question updated successfully!');
      } else {
        await createAdminWebDevQuestion(payload);
        setSuccess('Question created successfully!');
      }

      setTimeout(() => {
        navigate('/admin');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 font-sans p-6">
      <SEO title={`${isEdit ? 'Edit' : 'Create'} Web Dev Challenge — Admin`} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-darkBorder pb-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/admin"
              className="p-2 rounded-xl bg-darkCard border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isEdit ? 'Edit Web Dev Challenge' : 'Create Web Dev Challenge'}
              </h1>
              <p className="text-xs text-slate-400">
                Configure starter code, solution code, and behavioral test assertions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg shadow-accentBtn/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEdit ? 'Update Challenge' : 'Publish Challenge'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ── Section 1: Challenge Metadata ───────────────────────────────────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-accentBlue" />
            <span>Challenge Metadata</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build an Interactive Counter"
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              >
                <option value="javascript">JavaScript</option>
                <option value="html-css">HTML & CSS</option>
                <option value="html-css-javascript">Full Stack Frontend</option>
                <option value="html">HTML Only</option>
                <option value="css">CSS Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Time Limit (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Problem Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assessment objective, instructions, and context..."
              className="w-full bg-darkBg border border-darkBorder p-3 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="dom, events, forms, validation"
              className="w-full bg-darkBg border border-darkBorder px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
            />
          </div>
        </div>

        {/* ── Section 2: Requirements Checklist Builder ───────────────────────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Student Requirements Checklist
            </h2>
            <button
              type="button"
              onClick={handleAddRequirement}
              className="bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue border border-accentBlue/20 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Requirement</span>
            </button>
          </div>

          <div className="space-y-2">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleUpdateRequirement(idx, e.target.value)}
                  placeholder={`Requirement #${idx + 1} (e.g. Counter must start at 0)`}
                  className="flex-1 bg-darkBg border border-darkBorder px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(idx)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Starter Code (3 Files) ────────────────────────────────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Starter Code (Given to Students)
              </h2>
              <p className="text-xs text-slate-400">
                Define the starter templates for HTML, CSS, and JavaScript
              </p>
            </div>

            <div className="flex items-center space-x-1 bg-darkBg border border-darkBorder p-1 rounded-xl">
              {['html', 'css', 'javascript'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveStarterTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeStarterTab === tab
                      ? 'bg-accentBlue text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-darkBorder rounded-xl overflow-hidden h-64">
            <Editor
              height="100%"
              language={
                activeStarterTab === 'javascript'
                  ? 'javascript'
                  : activeStarterTab === 'css'
                  ? 'css'
                  : 'html'
              }
              theme="vs-dark"
              value={
                activeStarterTab === 'javascript'
                  ? starterJs
                  : activeStarterTab === 'css'
                  ? starterCss
                  : starterHtml
              }
              onChange={(val) => {
                if (activeStarterTab === 'javascript') setStarterJs(val || '');
                else if (activeStarterTab === 'css') setStarterCss(val || '');
                else setStarterHtml(val || '');
              }}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* ── Section 4: Reference Solution Code (Private for Validation) ─────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Reference Solution Code (Hidden from Students)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Used by the pre-publish validator to verify tests pass 100%
              </p>
            </div>

            <div className="flex items-center space-x-1 bg-darkBg border border-darkBorder p-1 rounded-xl">
              {['html', 'css', 'javascript'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSolutionTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeSolutionTab === tab
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-darkBorder rounded-xl overflow-hidden h-64">
            <Editor
              height="100%"
              language={
                activeSolutionTab === 'javascript'
                  ? 'javascript'
                  : activeSolutionTab === 'css'
                  ? 'css'
                  : 'html'
              }
              theme="vs-dark"
              value={
                activeSolutionTab === 'javascript'
                  ? solutionJs
                  : activeSolutionTab === 'css'
                  ? solutionCss
                  : solutionHtml
              }
              onChange={(val) => {
                if (activeSolutionTab === 'javascript') setSolutionJs(val || '');
                else if (activeSolutionTab === 'css') setSolutionCss(val || '');
                else setSolutionHtml(val || '');
              }}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* ── Section 5: Behavioral Test Suite Builder ────────────────────────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Behavioral Test Suite (Total Points: {totalTestPoints})
              </h2>
              <p className="text-xs text-slate-400">
                Define DOM checks, user clicks, input events, and computed CSS assertions
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddTest}
              className="bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue border border-accentBlue/20 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Test</span>
            </button>
          </div>

          <div className="space-y-4">
            {tests.map((t, idx) => (
              <div
                key={t.id || idx}
                className="bg-darkBg/70 border border-darkBorder p-4 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-accentBlue uppercase">
                    Test #{idx + 1} ({t.points || 20} pts)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTest(idx)}
                    className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Description (Shown to Student)
                    </label>
                    <input
                      type="text"
                      value={t.description}
                      onChange={(e) => handleUpdateTest(idx, 'description', e.target.value)}
                      placeholder="e.g. Counter starts at 0"
                      className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Test Type
                    </label>
                    <select
                      value={t.type}
                      onChange={(e) => handleUpdateTest(idx, 'type', e.target.value)}
                      className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200"
                    >
                      <option value="dom">DOM Check</option>
                      <option value="click">User Click</option>
                      <option value="input">User Input</option>
                      <option value="keyboard">Keyboard Press</option>
                      <option value="css">Computed CSS</option>
                      <option value="count">Element Count</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">Points</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={t.points}
                      onChange={(e) => handleUpdateTest(idx, 'points', Number(e.target.value))}
                      className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Target Selector
                    </label>
                    <input
                      type="text"
                      value={t.target || ''}
                      onChange={(e) => handleUpdateTest(idx, 'target', e.target.value)}
                      placeholder="#count, button:contains('Add')"
                      className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Assertion Type
                    </label>
                    <select
                      value={t.assertion?.type || 'exists'}
                      onChange={(e) => handleUpdateTestAssertion(idx, 'type', e.target.value)}
                      className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200"
                    >
                      <option value="exists">Element Exists</option>
                      <option value="textEquals">Text Exactly Matches</option>
                      <option value="textContains">Text Contains Snippet</option>
                      <option value="attributeEquals">Attribute Matches</option>
                      <option value="countEquals">Count Matches Number</option>
                      <option value="hasClass">Has CSS Class</option>
                      <option value="computedCss">Computed CSS Value</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-slate-400">
                      Expected Value
                    </label>
                    <input
                      type="text"
                      value={t.assertion?.expected !== undefined ? t.assertion.expected : ''}
                      onChange={(e) => handleUpdateTestAssertion(idx, 'expected', e.target.value)}
                      placeholder="0, true, #38bdf8"
                      className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">
                    Failure Message (Shown to student if failed)
                  </label>
                  <input
                    type="text"
                    value={t.failureMessage || ''}
                    onChange={(e) => handleUpdateTest(idx, 'failureMessage', e.target.value)}
                    placeholder="e.g. Counter did not start at 0"
                    className="w-full bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 6: "Validate Challenge" Pre-Publish Gate ───────────────── */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-accentBlue" />
                <span>Pre-Publish Challenge Validator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Test your reference solution against all tests before publishing to ensure 100% correctness
              </p>
            </div>

            <button
              type="button"
              onClick={handleValidateChallenge}
              disabled={isValidating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isValidating ? 'Validating...' : 'Validate Challenge'}</span>
            </button>
          </div>

          {/* Validation Verdict Box */}
          {validationResults && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                validationResults.score === 100
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {validationResults.score === 100 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {validationResults.score === 100
                      ? '✓ All Tests Passed! Ready to Publish.'
                      : `❌ Validation Failed: ${validationResults.passedCount}/${validationResults.totalCount} Tests Passed`}
                  </h4>
                  <p className="text-[11px] opacity-80">
                    {validationResults.score === 100
                      ? 'Reference solution satisfies all behavioral test assertions.'
                      : 'Fix failing tests or adjust reference solution before publishing.'}
                  </p>
                </div>
              </div>
              <span className="text-lg font-black">{validationResults.score}%</span>
            </div>
          )}

          {/* Embedded Sandbox Runner Frame (For Reference Solution) */}
          <div className="h-64 rounded-xl overflow-hidden border border-darkBorder">
            <WebDevPreviewFrame
              ref={validatorPreviewRef}
              html={solutionHtml || starterHtml}
              css={solutionCss || starterCss}
              javascript={solutionJs || starterJs}
              tests={tests}
              onTestResults={handleValidationResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWebDevForm;
