import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getPublicQuestionByIdOrSlug, submitWebDevSolution } from '../../services/webDevService';
import { AuthContext } from '../../context/AuthContext';
import WebDevPreviewFrame from '../../components/webdev/WebDevPreviewFrame';
import WebDevTestResults from '../../components/webdev/WebDevTestResults';
import AuthModal from '../../components/AuthModal';
import {
  Play,
  Send,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  Code,
  Layout,
  Award,
  Sparkles,
  FileCode,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';
import SEO from '../../components/SEO';

const WebDevArena = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Code state for 3 files
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [javascriptCode, setJavascriptCode] = useState('');
  const [activeFile, setActiveFile] = useState('javascript'); // 'html' | 'css' | 'javascript'

  // Arena tabs
  const [leftTab, setLeftTab] = useState('editor'); // 'description' | 'editor'
  const [rightTab, setRightTab] = useState('preview'); // 'preview' | 'results'

  // Evaluation & Results
  const [testResults, setTestResults] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionVerdict, setSubmissionVerdict] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Timer state
  const [timeSpent, setTimeSpent] = useState(0);
  const startTimeRef = useRef(Date.now());
  const previewRef = useRef(null);

  useEffect(() => {
    fetchQuestion();
  }, [idOrSlug]);

  // Track time spent in arena
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQuestion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPublicQuestionByIdOrSlug(idOrSlug);
      const q = res.question;
      setQuestion(q);

      // Load previous submission if user has one, otherwise load starter code
      if (res.lastSubmission) {
        setHtmlCode(res.lastSubmission.htmlCode || q.starterCode?.html || '');
        setCssCode(res.lastSubmission.cssCode || q.starterCode?.css || '');
        setJavascriptCode(res.lastSubmission.javascriptCode || q.starterCode?.javascript || '');
      } else {
        setHtmlCode(q.starterCode?.html || '');
        setCssCode(q.starterCode?.css || '');
        setJavascriptCode(q.starterCode?.javascript || '');
      }

      // Default active file
      if (q.category === 'css') {
        setActiveFile('css');
      } else if (q.category === 'html') {
        setActiveFile('html');
      } else {
        setActiveFile('javascript');
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Could not load challenge details.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetStarterCode = () => {
    if (
      window.confirm(
        'Are you sure you want to reset your code to the default starter template? All current changes will be overwritten.'
      )
    ) {
      if (question?.starterCode) {
        setHtmlCode(question.starterCode.html || '');
        setCssCode(question.starterCode.css || '');
        setJavascriptCode(question.starterCode.javascript || '');
      }
      setTestResults(null);
      setConsoleLogs([]);
    }
  };

  const handleConsoleLog = (log) => {
    setConsoleLogs((prev) => [...prev.slice(-40), log]);
  };

  const handleRunTests = () => {
    if (!previewRef.current) return;
    setIsEvaluating(true);
    setRightTab('results');
    previewRef.current.runTests();
  };

  const handleTestResults = (results) => {
    setIsEvaluating(false);
    setTestResults(results);
  };

  const handleSubmitSolution = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!previewRef.current) return;

    setIsSubmitting(true);
    setIsEvaluating(true);
    setRightTab('results');

    // Execute tests inside preview iframe
    previewRef.current.runTests();

    // Small delay to capture final test results payload
    setTimeout(async () => {
      try {
        const payload = {
          htmlCode,
          cssCode,
          javascriptCode,
          testResults: testResults?.testResults || [],
          timeSpent,
          startedAt: new Date(startTimeRef.current),
        };

        const res = await submitWebDevSolution(question._id, payload);
        setSubmissionVerdict(res.submission);
      } catch (err) {
        console.error('Error submitting solution:', err);
      } finally {
        setIsSubmitting(false);
        setIsEvaluating(false);
      }
    }, 450);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
          <span className="text-xs uppercase font-bold tracking-wider">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 text-slate-100">
        <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Challenge Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'Unable to locate this question.'}</p>
          <Link
            to="/web-development"
            className="inline-block bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all"
          >
            Back to Arena
          </Link>
        </div>
      </div>
    );
  }

  const currentCode =
    activeFile === 'html' ? htmlCode : activeFile === 'css' ? cssCode : javascriptCode;
  const currentLanguage =
    activeFile === 'html' ? 'html' : activeFile === 'css' ? 'css' : 'javascript';

  const handleEditorChange = (value) => {
    if (activeFile === 'html') setHtmlCode(value || '');
    else if (activeFile === 'css') setCssCode(value || '');
    else setJavascriptCode(value || '');
  };

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      <SEO title={`${question.title} — Web Development Practice`} />

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="bg-darkCard/80 backdrop-blur-md border-b border-darkBorder px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <Link
            to="/web-development"
            className="p-1.5 rounded-xl bg-darkBg border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Back to Web Dev Hub"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate">{question.title}</h1>
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shrink-0 ${
                  question.difficulty === 'easy'
                    ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
                    : question.difficulty === 'medium'
                    ? 'text-amber-400 border-amber-500/25 bg-amber-500/10'
                    : 'text-rose-400 border-rose-500/25 bg-rose-500/10'
                }`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-400 bg-darkBg border border-darkBorder px-3 py-1.5 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-accentBlue" />
          <span>{formatTimer(timeSpent)}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleRunTests}
            disabled={isEvaluating}
            className="bg-darkBg hover:bg-darkBg/80 border border-darkBorder hover:border-slate-500 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Run practice behavioral tests"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span className="hidden md:inline">Run Tests</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitSolution}
            disabled={isSubmitting || isEvaluating}
            className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg shadow-accentBtn/20 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Submit final solution and save progress"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Two-Column Workspace ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-3 gap-3">
        {/* ── Left Column: Problem & Monaco Editor ───────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-darkCard/60 border border-darkBorder rounded-2xl overflow-hidden shadow-xl">
          {/* Top Panel Controls */}
          <div className="bg-darkCard px-3 py-2 border-b border-darkBorder flex items-center justify-between gap-2 shrink-0">
            {/* Left Tab Switcher (Problem vs Editor) */}
            <div className="flex items-center space-x-1 bg-darkBg border border-darkBorder p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setLeftTab('editor')}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  leftTab === 'editor'
                    ? 'bg-accentBlue text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('description')}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  leftTab === 'description'
                    ? 'bg-accentBlue text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Requirements</span>
              </button>
            </div>

            {/* File Switcher (Only shown when Editor tab active) */}
            {leftTab === 'editor' && (
              <div className="flex items-center space-x-1 bg-darkBg border border-darkBorder p-0.5 rounded-xl">
                {[
                  { id: 'html', label: 'HTML', color: 'text-orange-400' },
                  { id: 'css', label: 'CSS', color: 'text-sky-400' },
                  { id: 'javascript', label: 'JS', color: 'text-amber-400' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFile(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1 ${
                      activeFile === f.id
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={f.color}>●</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Reset Starter Code Action */}
            <button
              type="button"
              onClick={handleResetStarterCode}
              title="Reset code to default template"
              className="p-1.5 rounded-xl border border-darkBorder hover:border-slate-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 relative">
            {leftTab === 'editor' ? (
              <Editor
                height="100%"
                language={currentLanguage}
                theme="vs-dark"
                value={currentCode}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              /* Requirements Checklist & Problem Description */
              <div className="p-6 overflow-y-auto h-full space-y-6 select-text">
                <div>
                  <h2 className="text-lg font-bold text-white mb-2">Problem Statement</h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {question.description}
                  </p>
                </div>

                {/* Requirements Checklist */}
                {question.requirements && question.requirements.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-accentBlue uppercase tracking-wider">
                      Requirements Checklist
                    </h3>
                    <ul className="space-y-2.5">
                      {question.requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-300 bg-darkBg/60 border border-darkBorder p-3 rounded-xl flex items-start space-x-2.5"
                        >
                          <Check className="w-4 h-4 text-accentBlue shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Live Preview & Test Results ──────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-darkCard/60 border border-darkBorder rounded-2xl overflow-hidden shadow-xl">
          {/* Top Panel Controls */}
          <div className="bg-darkCard px-3 py-2 border-b border-darkBorder flex items-center justify-between gap-2 shrink-0">
            {/* Right Tab Switcher (Preview vs Results) */}
            <div className="flex items-center space-x-1 bg-darkBg border border-darkBorder p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setRightTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  rightTab === 'preview'
                    ? 'bg-accentBlue text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('results')}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  rightTab === 'results'
                    ? 'bg-accentBlue text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Test Results {testResults ? `(${testResults.score}%)` : ''}</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 relative">
            <div className={`h-full ${rightTab === 'preview' ? 'block' : 'hidden'}`}>
              <WebDevPreviewFrame
                ref={previewRef}
                html={htmlCode}
                css={cssCode}
                javascript={javascriptCode}
                tests={question.tests || []}
                onConsoleLog={handleConsoleLog}
                onTestResults={handleTestResults}
              />
            </div>

            <div className={`h-full ${rightTab === 'results' ? 'block' : 'hidden'}`}>
              <WebDevTestResults
                results={testResults}
                consoleLogs={consoleLogs}
                isRunning={isEvaluating}
                onRunAgain={handleRunTests}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal Guard */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="submit"
      />
    </div>
  );
};

export default WebDevArena;
