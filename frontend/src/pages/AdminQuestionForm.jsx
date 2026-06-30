import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as questionService from '../services/questionService';
import { ChevronLeft, Plus, Trash2, Save, FileText, CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import SEO from '../components/SEO';

const AdminQuestionForm = ({ editId, onSave, onCancel }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const id = editId || routeId;
  const isEditMode = !!id;
  const isEmbedded = !!onSave;

  // Basic Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('Arrays');
  const [constraints, setConstraints] = useState('');

  // Arrays
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [visibleTestCases, setVisibleTestCases] = useState([{ input: '', output: '' }]);
  const [hiddenTestCases, setHiddenTestCases] = useState([{ input: '', output: '' }]);

  // Parameters & timers
  const [timeLimit, setTimeLimit] = useState(2);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [timerDuration, setTimerDuration] = useState(20);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchQuestionForEdit();
    } else {
      setTitle('');
      setDescription('');
      setCompany('');
      setDifficulty('Easy');
      setTopic('Arrays');
      setConstraints('');
      setExamples([{ input: '', output: '', explanation: '' }]);
      setVisibleTestCases([{ input: '', output: '' }]);
      setHiddenTestCases([{ input: '', output: '' }]);
      setTimeLimit(2);
      setMemoryLimit(256);
      setTimerDuration(20);
      setTimerEnabled(true);
    }
  }, [id, isEditMode]);

  const fetchQuestionForEdit = async () => {
    setLoading(true);
    try {
      const q = await questionService.getQuestionById(id);
      setTitle(q.title);
      setDescription(q.description);
      setCompany(q.company?.join(', ') || '');
      setDifficulty(q.difficulty || 'Easy');
      setTopic(q.topic || 'Arrays');
      setConstraints(q.constraints || '');
      setExamples(q.examples?.length ? q.examples : [{ input: '', output: '', explanation: '' }]);
      setVisibleTestCases(q.visibleTestCases?.length ? q.visibleTestCases : [{ input: '', output: '' }]);
      setHiddenTestCases(q.hiddenTestCases?.length ? q.hiddenTestCases : [{ input: '', output: '' }]);
      setTimeLimit(q.timeLimit || 2);
      setMemoryLimit(q.memoryLimit || 256);
      setTimerDuration(q.timerDuration || 20);
      setTimerEnabled(q.timerEnabled !== undefined ? q.timerEnabled : true);
    } catch (err) {
      console.error(err);
      setError('Could not download problem parameters to load edit form.');
    } finally {
      setLoading(false);
    }
  };

  // Example array modifications
  const handleAddExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };
  const handleRemoveExample = (idx) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };
  const handleExampleChange = (idx, field, value) => {
    const updated = [...examples];
    updated[idx][field] = value;
    setExamples(updated);
  };

  // Test cases modifications
  const handleAddTestCase = (type) => {
    if (type === 'visible') {
      setVisibleTestCases([...visibleTestCases, { input: '', output: '' }]);
    } else {
      setHiddenTestCases([...hiddenTestCases, { input: '', output: '' }]);
    }
  };
  const handleRemoveTestCase = (type, idx) => {
    if (type === 'visible') {
      setVisibleTestCases(visibleTestCases.filter((_, i) => i !== idx));
    } else {
      setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== idx));
    }
  };
  const handleTestCaseChange = (type, idx, field, value) => {
    if (type === 'visible') {
      const updated = [...visibleTestCases];
      updated[idx][field] = value;
      setVisibleTestCases(updated);
    } else {
      const updated = [...hiddenTestCases];
      updated[idx][field] = value;
      setHiddenTestCases(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Structure company array
    const companyArray = company
      ? company
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c !== '')
      : [];

    const payload = {
      title,
      description,
      company: companyArray,
      difficulty,
      topic,
      constraints,
      examples,
      visibleTestCases,
      hiddenTestCases,
      timeLimit,
      memoryLimit,
      timerDuration,
      timerEnabled
    };

    setLoading(true);
    try {
      if (isEditMode) {
        await questionService.updateQuestion(id, payload);
      } else {
        await questionService.createQuestion(payload);
      }
      if (isEmbedded) {
        onSave();
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit form configuration. Inspect input validators.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accentBlue"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Opening Editor Form...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100">
      <SEO
        title={isEditMode ? "Edit Question" : "Create Question"}
        description="Admin form to create or edit practice questions on NQTCoder."
        path={isEditMode ? `/admin/question/edit/${id}` : "/admin/question/new"}
        noIndex={true}
      />
      
      {/* Navigation Header */}
      <div className="flex items-center space-x-4 border-b border-darkBorder pb-5">
        <button
          onClick={() => {
            if (isEmbedded) {
              onCancel();
            } else {
              navigate('/admin');
            }
          }}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-darkCard rounded-md transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            {isEditMode ? 'Modify Coding Challenge' : 'Assemble New Challenge'}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Admin Question Authoring Wizard</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-md text-xs flex items-center">
          <ShieldAlert className="w-4 h-4 mr-2" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Parameters */}
        <div className="bg-darkCard border border-darkBorder rounded-lg p-6 space-y-4">
          <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center mb-1">
            <FileText className="w-4 h-4 text-accentBlue mr-2" /> 1. Challenge Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Challenge Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sort elements in log time"
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Company Tags (Comma separated)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="TCS, Infosys, Wipro"
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Topic Category</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Arrays"
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs text-slate-300 focus:outline-none focus:border-accentBlue cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Easy-Medium">Easy-Medium</option>
                <option value="Medium">Medium</option>
                <option value="Medium-Hard">Medium-Hard</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
            <textarea
              required
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of the challenge requirements..."
              className="w-full bg-darkBg border border-darkBorder p-3 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200 font-sans leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Constraints</label>
            <textarea
              required
              rows="2"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. 1 <= N <= 10^5 \n elements are positive"
              className="w-full bg-darkBg border border-darkBorder p-3 rounded-md text-xs font-mono focus:outline-none focus:border-accentBlue text-slate-200"
            />
          </div>
        </div>

        {/* Section 2: Examples */}
        <div className="bg-darkCard border border-darkBorder rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
              <CheckCircle2 className="w-4 h-4 text-accentBlue mr-2" /> 2. Examples (Shown in problem Statement)
            </h2>
            <button
              type="button"
              onClick={handleAddExample}
              className="text-xs text-accentBlue hover:text-accentBlue/80 font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" /> <span>Add Example</span>
            </button>
          </div>

          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div key={i} className="bg-darkBg/40 border border-darkBorder rounded-lg p-4 space-y-3 relative">
                {examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExample(i)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <h4 className="text-xs font-bold text-slate-400">Example {i + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Input</label>
                    <textarea
                      required
                      rows="2"
                      value={ex.input}
                      onChange={(e) => handleExampleChange(i, 'input', e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder p-2.5 rounded-lg text-xs font-mono focus:outline-none text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Expected Output</label>
                    <textarea
                      required
                      rows="2"
                      value={ex.output}
                      onChange={(e) => handleExampleChange(i, 'output', e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder p-2.5 rounded-lg text-xs font-mono focus:outline-none text-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Explanation (Optional)</label>
                  <input
                    type="text"
                    value={ex.explanation}
                    onChange={(e) => handleExampleChange(i, 'explanation', e.target.value)}
                    placeholder="Because the elements are sorted..."
                    className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-lg text-xs focus:outline-none text-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Test Cases (Visible vs Hidden) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Visible Test Cases */}
          <div className="bg-darkCard border border-darkBorder rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
                <Eye className="w-4 h-4 text-emerald-400 mr-2" /> Visible Cases (3-5 items)
              </h2>
              <button
                type="button"
                onClick={() => handleAddTestCase('visible')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Add</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {visibleTestCases.map((tc, i) => (
                <div key={i} className="bg-darkBg/30 border border-darkBorder/60 p-3 rounded-md space-y-2 relative">
                  {visibleTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase('visible', i)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="text-[10px] font-bold text-slate-400">Case {i + 1}</div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Stdin input"
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange('visible', i, 'input', e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none text-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Expected stdout output"
                      value={tc.output}
                      onChange={(e) => handleTestCaseChange('visible', i, 'output', e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Test Cases */}
          <div className="bg-darkCard border border-darkBorder rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
                <EyeOff className="w-4 h-4 text-rose-400 mr-2" /> Hidden Cases (5-8 items)
              </h2>
              <button
                type="button"
                onClick={() => handleAddTestCase('hidden')}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center"
              >
                <Plus className="w-3.5 h-3.5" /> <span>Add</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {hiddenTestCases.map((tc, i) => (
                <div key={i} className="bg-darkBg/30 border border-darkBorder/60 p-3 rounded-md space-y-2 relative">
                  {hiddenTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase('hidden', i)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="text-[10px] font-bold text-slate-400">Case {i + 1}</div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Stdin input"
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange('hidden', i, 'input', e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none text-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Expected stdout output"
                      value={tc.output}
                      onChange={(e) => handleTestCaseChange('hidden', i, 'output', e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Section 4: Timers and Limits */}
        <div className="bg-darkCard border border-darkBorder rounded-lg p-6 space-y-4">
          <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center mb-1">
            <Plus className="w-4 h-4 text-accentBlue mr-2" /> 4. Limits & Exam Timers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Limit (Seconds)</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Memory Limit (MB)</label>
              <input
                type="number"
                min="16"
                max="1024"
                required
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(Number(e.target.value))}
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Timer Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="180"
                required
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full bg-darkBg border border-darkBorder px-3 py-2 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-darkBg/40 border border-darkBorder p-3.5 rounded-lg">
            <input
              type="checkbox"
              id="timerEnabled"
              checked={timerEnabled}
              onChange={(e) => setTimerEnabled(e.target.checked)}
              className="w-4 h-4 text-accentBlue border-darkBorder focus:ring-0 rounded bg-darkBg cursor-pointer"
            />
            <label htmlFor="timerEnabled" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
              Activate Exam Timer constraints (locks and submits editor upon expiration).
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-accentBlue/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Challenge Setup</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default AdminQuestionForm;
