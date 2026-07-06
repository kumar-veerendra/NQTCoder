import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as questionService from '../services/questionService';
import { 
  ChevronLeft, Plus, Trash2, Save, FileText, CheckCircle2, 
  HelpCircle, Sparkles, BookOpen, Eye 
} from 'lucide-react';
import SEO from '../components/SEO';

const AdminVerbalQuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Basic Form States
  const [questionId, setQuestionId] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [company, setCompany] = useState('');
  const [verbalType, setVerbalType] = useState('sentence_completion');

  // Topic & Display Name overrides
  const [topic, setTopic] = useState('sentence-completion');
  const [displayName, setDisplayName] = useState('Sentence Completion');

  // Sentence Completion fields
  const [statement, setStatement] = useState('');
  const [blanks, setBlanks] = useState([
    { blankIndex: 0, placeholder: '___', acceptableAnswersText: '' }
  ]);

  // Passage Recall fields
  const [passageText, setPassageText] = useState('');
  const [readingDurationSec, setReadingDurationSec] = useState(30);

  // Email Writing fields
  const [emailPrompt, setEmailPrompt] = useState('');
  const [minWords, setMinWords] = useState(50);
  const [maxWords, setMaxWords] = useState(150);
  const [guidelines, setGuidelines] = useState(['']);

  // Explanation
  const [summary, setSummary] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [steps, setSteps] = useState([{ title: '', content: '' }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-sync topic and displayName based on verbalType
  useEffect(() => {
    if (!isEditMode) {
      if (verbalType === 'sentence_completion') {
        setTopic('sentence-completion');
        setDisplayName('Sentence Completion');
      } else if (verbalType === 'passage_recall') {
        setTopic('passage-recall');
        setDisplayName('Passage Recall');
      } else if (verbalType === 'email_writing') {
        setTopic('email-writing');
        setDisplayName('Email Writing');
      }
    }
  }, [verbalType, isEditMode]);

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
      if (q.kind !== 'VerbalQuestion') {
        setError('This question is not a Verbal question. Cannot open in Verbal editor.');
        return;
      }

      setQuestionId(q.questionId || '');
      setSlug(q.slug || '');
      setDifficulty(q.difficulty || 'easy');
      setCompany(q.applicableCompanies?.join(', ') || '');
      setVerbalType(q.verbalType || 'sentence_completion');
      setTopic(q.topic || 'sentence-completion');
      setDisplayName(q.displayName || 'Sentence Completion');

      // Populate statement
      setStatement(q.content?.statement || '');

      // Load specific fields
      if (q.verbalType === 'sentence_completion') {
        if (q.blanks?.length > 0) {
          setBlanks(q.blanks.map(b => ({
            blankIndex: b.blankIndex,
            placeholder: b.placeholder || '___',
            acceptableAnswersText: b.acceptableAnswers?.join(', ') || ''
          })));
        } else {
          setBlanks([{ blankIndex: 0, placeholder: '___', acceptableAnswersText: '' }]);
        }
      } else if (q.verbalType === 'passage_recall') {
        setPassageText(q.passageText || '');
        setReadingDurationSec(q.readingDurationSec || 30);
      } else if (q.verbalType === 'email_writing') {
        setEmailPrompt(q.emailPrompt || '');
        setMinWords(q.minWords || 50);
        setMaxWords(q.maxWords || 150);
        setGuidelines(q.guidelines?.length ? q.guidelines : ['']);
      }

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

  const handleAddBlank = () => {
    setBlanks([...blanks, { blankIndex: blanks.length, placeholder: '___', acceptableAnswersText: '' }]);
  };

  const handleRemoveBlank = (idx) => {
    setBlanks(blanks.filter((_, i) => i !== idx).map((b, i) => ({
      ...b,
      blankIndex: i
    })));
  };

  const handleBlankChange = (idx, field, value) => {
    const updated = [...blanks];
    updated[idx][field] = value;
    setBlanks(updated);
  };

  const handleAddGuideline = () => {
    setGuidelines([...guidelines, '']);
  };

  const handleRemoveGuideline = (idx) => {
    setGuidelines(guidelines.filter((_, i) => i !== idx));
  };

  const handleGuidelineChange = (idx, value) => {
    const updated = [...guidelines];
    updated[idx] = value;
    setGuidelines(updated);
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

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validations
    if (!questionId.trim()) {
      setError('Question ID is required (e.g. VB-COMP-0001)');
      setLoading(false);
      return;
    }

    // Build payload
    const payload = {
      kind: 'VerbalQuestion',
      domain: 'aptitude',
      section: 'verbal',
      questionId: questionId.trim(),
      slug: slug.trim() || undefined,
      difficulty,
      applicableCompanies: company.split(',').map(c => c.trim()).filter(Boolean),
      verbalType,
      topic,
      displayName,
      meta: {
        estimatedSolveTimeSec: verbalType === 'sentence_completion' ? 30 : verbalType === 'passage_recall' ? 120 : 300,
        marks: 1,
        negativeMarks: 0,
        status: 'published'
      },
      explanation: {
        summary: summary.trim() || undefined,
        shortcut: shortcut.trim() || undefined,
        steps: steps.filter(s => s.title.trim() || s.content.trim())
      }
    };

    if (verbalType === 'sentence_completion') {
      if (!statement.trim()) {
        setError('Sentence completion statement is required.');
        setLoading(false);
        return;
      }
      payload.content = {
        statement: statement.trim(),
        format: 'markdown',
        assets: []
      };
      payload.blanks = blanks.map(b => ({
        blankIndex: b.blankIndex,
        placeholder: b.placeholder || '___',
        acceptableAnswers: b.acceptableAnswersText.split(',').map(a => a.trim()).filter(Boolean)
      }));
    } else if (verbalType === 'passage_recall') {
      if (!passageText.trim()) {
        setError('Passage text is required.');
        setLoading(false);
        return;
      }
      payload.content = {
        statement: 'Passage Recall Question - Reconstruct the passage as closely as possible after reading.',
        format: 'markdown',
        assets: []
      };
      payload.passageText = passageText.trim();
      payload.readingDurationSec = parseInt(readingDurationSec) || 30;
    } else if (verbalType === 'email_writing') {
      if (!emailPrompt.trim()) {
        setError('Email writing prompt scenario is required.');
        setLoading(false);
        return;
      }
      payload.content = {
        statement: emailPrompt.trim(),
        format: 'markdown',
        assets: []
      };
      payload.emailPrompt = emailPrompt.trim();
      payload.minWords = parseInt(minWords) || 50;
      payload.maxWords = parseInt(maxWords) || 150;
      payload.guidelines = guidelines.map(g => g.trim()).filter(Boolean);
    }

    try {
      if (isEditMode) {
        await questionService.updateQuestion(id, payload);
        setSuccess('Verbal question parameters updated successfully!');
      } else {
        await questionService.createQuestion(payload);
        setSuccess('New Verbal question saved successfully in question bank!');
        // Reset if new creation
        setQuestionId('');
        setSlug('');
        setStatement('');
        setPassageText('');
        setEmailPrompt('');
        setBlanks([{ blankIndex: 0, placeholder: '___', acceptableAnswersText: '' }]);
        setGuidelines(['']);
        setSummary('');
        setShortcut('');
        setSteps([{ title: '', content: '' }]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Transaction error saving verbal question details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-darkBg text-slate-100 min-h-screen space-y-6">
      <SEO 
        title={isEditMode ? 'Modify Verbal Question' : 'Formulate Verbal Question'}
        description="Admin editor panel for Verbal Ability placement challenges."
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-darkBorder pb-4 select-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="p-2 border border-darkBorder bg-darkCard hover:text-white rounded-xl text-slate-400 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">
              {isEditMode ? 'Modify Verbal Question' : 'Formulate Verbal Question'}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Verbal Section Placement Creator
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-accentBlue hover:bg-accentBlue/90 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-accentBlue/10 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Question'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-bold">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core details card */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-darkBorder/40 pb-2">Core Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Question ID *</label>
              <input
                type="text"
                disabled={isEditMode}
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                placeholder="e.g. VB-COMP-0001"
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Slug (Auto-generated if empty)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. context-scientist-research"
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Verbal Question Sub-Type</label>
              <select
                disabled={isEditMode}
                value={verbalType}
                onChange={(e) => setVerbalType(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-bold cursor-pointer"
              >
                <option value="sentence_completion">Sentence Completion (Blanks)</option>
                <option value="passage_recall">Passage Recall (30s Timer)</option>
                <option value="email_writing">Email Writing (AI Scored)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-bold cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Applicable Companies (Comma Separated)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. TCS, Infosys, Accenture"
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Type Workspace Cards */}
        {verbalType === 'sentence_completion' && (
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-6 animate-fadeIn">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-darkBorder/40 pb-2">Sentence Completion Details</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Sentence Statement (with indices like {`{0}`}, {`{1}`}) *</label>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="e.g. The scientist was so {0} that she spent her entire life working on the {1}."
                className="w-full h-24 bg-darkBg border border-darkBorder rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-semibold"
              />
              <p className="text-[10px] text-slate-500 italic">
                Use incremental bracket indices {`{0}`}, {`{1}`} matching the blanks defined below.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder/20 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Blanks Setup</span>
                <button
                  type="button"
                  onClick={handleAddBlank}
                  className="flex items-center gap-1 text-[10px] text-accentBlue hover:text-white font-black uppercase"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Blank
                </button>
              </div>

              {blanks.map((b, idx) => (
                <div key={idx} className="bg-darkBg/40 border border-darkBorder/55 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative group">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-slate-500">Blank {idx} (Placeholder)</span>
                    <input
                      type="text"
                      value={b.placeholder}
                      onChange={(e) => handleBlankChange(idx, 'placeholder', e.target.value)}
                      placeholder="e.g. ___"
                      className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-accentBlue"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-[9px] font-black uppercase text-slate-500">Acceptable Answers (Comma Separated)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={b.acceptableAnswersText}
                        onChange={(e) => handleBlankChange(idx, 'acceptableAnswersText', e.target.value)}
                        placeholder="e.g. dedicated, passionate, focused"
                        className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-accentBlue"
                      />
                      {blanks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlank(idx)}
                          className="text-rose-500 hover:text-rose-400 p-1.5 border border-darkBorder rounded-lg bg-darkCard hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {verbalType === 'passage_recall' && (
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-4 animate-fadeIn">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-darkBorder/40 pb-2">Passage Recall Setup</h2>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Reference Passage Text *</label>
              <textarea
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                placeholder="Paste the passage you want the student to read and recall..."
                className="w-full h-44 bg-darkBg border border-darkBorder rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-accentBlue leading-relaxed font-semibold"
              />
            </div>

            <div className="space-y-1.5 md:w-1/3">
              <label className="text-[10px] uppercase font-bold text-slate-500">Reading Duration (Seconds)</label>
              <input
                type="number"
                value={readingDurationSec}
                onChange={(e) => setReadingDurationSec(e.target.value)}
                placeholder="e.g. 30"
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-bold"
              />
            </div>
          </div>
        )}

        {verbalType === 'email_writing' && (
          <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-6 animate-fadeIn">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-darkBorder/40 pb-2">Email Writing Details</h2>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Email Writing Prompt scenario *</label>
              <textarea
                value={emailPrompt}
                onChange={(e) => setEmailPrompt(e.target.value)}
                placeholder="e.g. Write an email to your project manager requesting a sick leave of two days due to a high fever. Handover urgent tasks..."
                className="w-full h-32 bg-darkBg border border-darkBorder rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-accentBlue leading-relaxed font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Minimum Word Count</label>
                <input
                  type="number"
                  value={minWords}
                  onChange={(e) => setMinWords(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Maximum Word Count</label>
                <input
                  type="number"
                  value={maxWords}
                  onChange={(e) => setMaxWords(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-darkBorder/20 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Email Guidelines Checklist</span>
                <button
                  type="button"
                  onClick={handleAddGuideline}
                  className="flex items-center gap-1 text-[10px] text-accentBlue hover:text-white font-black uppercase"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Guideline
                </button>
              </div>

              {guidelines.map((guide, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={guide}
                    onChange={(e) => handleGuidelineChange(idx, e.target.value)}
                    placeholder="e.g. State dates of absence"
                    className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-accentBlue"
                  />
                  {guidelines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGuideline(idx)}
                      className="text-rose-500 hover:text-rose-400 p-2 border border-darkBorder rounded-xl bg-darkCard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation / Solution Details */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-darkBorder/40 pb-2">Explanation & Guidelines Summary</h2>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500">Summary / Hint Explanation</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Provide reference solutions, grammatical tips, or details about the blank context..."
              className="w-full h-24 bg-darkBg border border-darkBorder rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500">Formula / Shortcuts / Alternate phrasing</label>
            <input
              type="text"
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
              placeholder="e.g. Active voice should be used..."
              className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-accentBlue font-semibold"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-darkBorder/20 pb-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Step Solving Guidance</span>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 text-[10px] text-accentBlue hover:text-white font-black uppercase"
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>

            {steps.map((s, idx) => (
              <div key={idx} className="bg-darkBg/30 border border-darkBorder/40 p-4 rounded-xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500">Step {idx + 1}</span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-rose-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                    placeholder="Step Title (e.g. Grammatical Context)"
                    className="w-full bg-darkBg border border-darkBorder rounded-lg px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-accentBlue"
                  />
                  <textarea
                    value={s.content}
                    onChange={(e) => handleStepChange(idx, 'content', e.target.value)}
                    placeholder="Step details..."
                    className="w-full h-20 bg-darkBg border border-darkBorder rounded-lg p-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-accentBlue"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminVerbalQuestionForm;
