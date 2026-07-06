import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as mockTestService from '../services/mockTestService';
import { 
  ArrowLeft, Award, CheckCircle2, XCircle, Clock, AlertTriangle, 
  ChevronDown, ChevronUp, BookOpen, Sparkles, HelpCircle 
} from 'lucide-react';
import SEO from '../components/SEO';

const AptitudeMockResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [activeStepTab, setActiveStepTab] = useState({}); // maps questionId -> step index

  useEffect(() => {
    fetchResultDetails();
  }, [id]);

  const fetchResultDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mockTestService.getMockInstance(id);
      if (data.status !== 'completed') {
        navigate(`/mocktest/arena/${data._id}`);
        return;
      }
      setInstance(data);
    } catch (err) {
      console.error(err);
      setError('Could not locate completed mock test report.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (qId) => {
    setExpandedQuestionId(prev => prev === qId ? null : qId);
  };

  const setStepTab = (qId, stepIdx) => {
    setActiveStepTab(prev => ({ ...prev, [qId]: stepIdx }));
  };

  if (loading) {
    return (
      <div className="py-32 text-center bg-darkBg text-slate-100 min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Compiling grading aggregates...</span>
      </div>
    );
  }

  if (error || !instance) {
    return (
      <div className="py-24 text-center bg-darkBg text-slate-100 min-h-screen space-y-4">
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-5 rounded-xl max-w-md mx-auto">
          {error || 'Failed to open test report.'}
        </div>
        <button 
          onClick={() => navigate('/mocktest')}
          className="text-accentBlue hover:underline text-sm font-semibold flex items-center justify-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const scorePercent = instance.maxScore > 0 
    ? Math.round((instance.totalScore / instance.maxScore) * 100) 
    : 0;

  const examDate = new Date(instance.endedAt || instance.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="Mock Test Performance Report"
        description="View mock test scores, section breakdown, proctor analysis, and complete solutions."
        path={`/mocktest/result/${id}`}
        noIndex={true}
      />

      {/* Back button */}
      <button
        onClick={() => navigate('/mocktest')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4" /> Exit Report
      </button>

      {/* 1. Hero Scoreboard Card */}
      <div className="bg-gradient-to-br from-darkCard via-darkCard to-accentBlue/5 border border-darkBorder p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-3 text-center md:text-left z-10">
          <div className="text-[10px] text-accentBlue uppercase font-black tracking-widest flex items-center justify-center md:justify-start gap-1">
            <Award className="w-4.5 h-4.5" /> Placement Assessment Gradebook
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Test Performance <span className="text-accentBlue">Report</span>
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-md">
            Exam session compiled on {examDate}. Check section answers and proctor details below.
          </p>
        </div>

        {/* Big circular score gauge */}
        <div className="flex items-center gap-5 z-10 shrink-0 select-none bg-darkBg/60 border border-darkBorder px-6 py-4 rounded-2xl">
          <div className="text-center">
            <div className="text-3xl font-black text-white tracking-tight">
              {instance.totalScore} <span className="text-xs text-slate-500 font-bold uppercase">/ {instance.maxScore}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Final Score</div>
          </div>
          <div className="h-10 w-px bg-darkBorder" />
          <div className="text-center">
            <div className={`text-3xl font-black tracking-tight ${
              scorePercent >= 60 ? 'text-emerald-400' : scorePercent >= 40 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {scorePercent}%
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Accuracy</div>
          </div>
        </div>
      </div>

      {/* 2. Proctoring & Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proctoring Card */}
        <div className={`p-5 rounded-2xl border ${
          instance.tabSwitchesCount >= 3 
            ? 'bg-red-500/5 border-red-500/20 text-red-300' 
            : instance.tabSwitchesCount > 0 
            ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' 
            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4.5 h-4.5" />
            <span>Anti-Cheat Proctor Log</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {instance.tabSwitchesCount === 0 
              ? 'Proctor Clean Sitting! No tab switching or window blur violations logged.'
              : `Logged ${instance.tabSwitchesCount} tab blur focus warning shifts. Strict environment limits were maintained.`}
          </p>
        </div>

        {/* Time stats */}
        <div className="bg-darkCard border border-darkBorder p-5 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 mb-1 select-none">
            <Clock className="w-4.5 h-4.5 text-accentBlue" />
            <span>Duration Log</span>
          </div>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Started: {new Date(instance.startedAt).toLocaleTimeString()}
            <br />
            Ended: {new Date(instance.endedAt || instance.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* 3. Question-by-Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
          <BookOpen className="w-4.5 h-4.5 text-accentBlue mr-2" /> Questions Analysis
        </h2>

        <div className="space-y-4">
          {instance.questions.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const isMCQ = q.details?.kind === 'MCQQuestion';
            const isAttempted = q.isAttempted;
            
            const isExpanded = expandedQuestionId === q.questionId;
            const activeStep = activeStepTab[q.questionId] || 0;

            return (
              <div 
                key={q.questionId}
                className={`bg-darkCard border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'border-accentBlue shadow-md' : 'border-darkBorder hover:border-slate-600'
                }`}
              >
                {/* Header item summary */}
                <div 
                  onClick={() => toggleExpand(q.questionId)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center shrink-0 ${
                      isCorrect 
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                        : isAttempted
                        ? 'bg-rose-500/10 border-rose-500/35 text-rose-400'
                        : 'bg-slate-700/10 border-slate-700/35 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>

                     <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {q.details?.kind === 'MCQQuestion' ? 'Aptitude Section' : 
                         q.details?.kind === 'VerbalQuestion' ? 'Verbal Section' : 'Coding Section'} • Weight: {q.details?.meta?.marks || (q.details?.kind === 'CodingQuestion' ? '10 Marks' : '1 Mark')}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                        {q.details?.kind === 'MCQQuestion' ? q.details.content.statement : 
                         q.details?.kind === 'VerbalQuestion' ? (
                           q.details.verbalType === 'sentence_completion' ? q.details.content.statement :
                           q.details.verbalType === 'passage_recall' ? 'Passage Recall Question' :
                           'Email Writing Scenario'
                         ) : q.details?.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                      isCorrect 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : isAttempted
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-darkBg text-slate-500 border-darkBorder'
                    }`}>
                      {isCorrect ? 'Correct' : isAttempted ? 'Incorrect' : 'Unattempted'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 border-t border-darkBorder/40 bg-darkBg/30 space-y-6">
                    {/* Statement / Description */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Question Statement / Prompt</div>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-semibold">
                        {q.details?.kind === 'MCQQuestion' ? q.details.content.statement : 
                         q.details?.kind === 'VerbalQuestion' ? (
                           q.details.verbalType === 'sentence_completion' ? q.details.content.statement :
                           q.details.verbalType === 'passage_recall' ? 'Passage Recall - Reconstruct the passage as closely as possible after reading.' :
                           q.details.emailPrompt
                         ) : q.details?.description}
                      </p>
                    </div>

                    {q.details?.kind === 'MCQQuestion' ? (
                      /* MCQ Option Details */
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Option Review</div>
                        <div className="space-y-3">
                          {q.details.options.map((opt) => {
                            const isSubmitted = q.submittedAnswer?.includes(opt.optionId);
                            const isCorrectAns = q.details.correctAnswer?.includes(opt.optionId);

                            let optionStyle = 'border-darkBorder bg-darkCard/40 opacity-70';
                            if (isCorrectAns) {
                              optionStyle = 'border-emerald-500 bg-emerald-500/5 text-emerald-300';
                            } else if (isSubmitted && !isCorrectAns) {
                              optionStyle = 'border-red-500 bg-red-500/5 text-red-300';
                            }

                            return (
                              <div 
                                key={opt.optionId} 
                                className={`border p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold ${optionStyle}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded border text-[10px] font-black flex items-center justify-center shrink-0 ${
                                    isCorrectAns 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : isSubmitted
                                      ? 'bg-red-500 border-red-500 text-white'
                                      : 'bg-darkBg border-darkBorder text-slate-500'
                                  }`}>
                                    {opt.optionId}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>
                                {isCorrectAns ? (
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black tracking-wider uppercase">Correct Answer</span>
                                ) : isSubmitted ? (
                                  <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-black tracking-wider uppercase font-sans">Your Choice</span>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>

                        {/* Expandable Explanation Summary */}
                        {q.details.explanation && (
                          <div className="border border-darkBorder bg-darkCard/30 rounded-2xl p-5 mt-6 space-y-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-slate-600" /> Explanation
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                              {q.details.explanation.summary}
                            </p>

                            {/* Step Solving */}
                            {q.details.explanation.steps?.length > 0 && (
                              <div className="space-y-3 pt-2">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                                  <Sparkles className="w-4 h-4 text-slate-600" /> Solving Steps
                                </div>
                                <div className="flex flex-wrap gap-1.5 select-none">
                                  {q.details.explanation.steps.map((step, sIdx) => (
                                    <button
                                      key={sIdx}
                                      onClick={() => setStepTab(q.questionId, sIdx)}
                                      className={`px-2.5 py-1 rounded border text-[10px] font-black transition-all cursor-pointer ${
                                        activeStep === sIdx
                                          ? 'bg-accentBlue/10 border-accentBlue text-accentBlue'
                                          : 'bg-darkCard/60 border-darkBorder text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      {step.title || `Step ${sIdx + 1}`}
                                    </button>
                                  ))}
                                </div>
                                <div className="bg-darkBg/60 border border-darkBorder/40 p-4 rounded-xl text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                  {q.details.explanation.steps[activeStep]?.content}
                                </div>
                              </div>
                            )}

                            {/* Shortcut */}
                            {q.details.explanation.shortcut && (
                              <div className="bg-accentBlue/5 border border-accentBlue/20 p-3.5 rounded-xl space-y-1 mt-2">
                                <div className="text-[9px] text-accentBlue font-black uppercase tracking-wider">⚡ Shortcut Method</div>
                                <p className="text-slate-300 text-xs leading-relaxed font-semibold">{q.details.explanation.shortcut}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : q.details?.kind === 'VerbalQuestion' ? (
                      /* Verbal Review Details */
                      <div className="space-y-6 animate-fadeIn">
                        {/* Sentence Completion */}
                        {q.details.verbalType === 'sentence_completion' && (
                          <div className="space-y-3">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sentence Completion Review</div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm text-slate-200 leading-relaxed font-semibold">
                              {q.details.content.statement.split(/\{(\d+)\}/g).map((part, idx) => {
                                if (/^\d+$/.test(part)) {
                                  const blankIdx = parseInt(part);
                                  const value = q.submittedAnswer?.[blankIdx] || '';
                                  const isCorrectBlank = q.details.blanks?.[blankIdx]?.acceptableAnswers?.some(
                                    acc => acc.trim().toLowerCase() === value.trim().toLowerCase()
                                  );

                                  return (
                                    <span
                                      key={blankIdx}
                                      className={`px-3 py-1 rounded-xl border text-xs font-black ${
                                        isCorrectBlank
                                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                          : 'border-red-500 bg-red-500/10 text-red-400'
                                      }`}
                                    >
                                      {value || '[Blank]'} (Expected: {q.details.blanks?.[blankIdx]?.acceptableAnswers?.join(' / ')})
                                    </span>
                                  );
                                }
                                return <span key={idx}>{part}</span>;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Passage Recall / Email */}
                        {(q.details.verbalType === 'passage_recall' || q.details.verbalType === 'email_writing') && (
                          <div className="space-y-5">
                            {/* Submitted response */}
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Submitted Response</div>
                              <div className="bg-darkCard/40 border border-darkBorder p-4 rounded-xl text-slate-300 text-sm font-semibold whitespace-pre-wrap font-mono">
                                {q.submittedAnswer?.[0] || '[No response submitted]'}
                              </div>
                            </div>

                            {/* Original Passage */}
                            {q.details.verbalType === 'passage_recall' && (
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reference Passage</div>
                                <div className="bg-darkCard/20 p-4 rounded-xl text-slate-400 text-sm italic leading-relaxed animate-fadeIn font-semibold">
                                  "{q.details.passageText}"
                                </div>
                              </div>
                            )}

                            {/* AI Evaluation */}
                            {q.verbalEvaluation ? (
                              <div className="space-y-4 pt-2 border-t border-darkBorder/40">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Evaluation Report</div>
                                
                                {q.verbalEvaluation.status === 'quota_exceeded' || q.verbalEvaluation.status === 'failed' ? (
                                  <div className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl text-slate-300 text-xs">
                                    AI evaluation was unavailable due to free quota limits. Your response was successfully saved.
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="bg-darkBg/80 p-3 rounded-lg text-center">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">Overall Score</div>
                                        <div className="text-xl font-bold text-white mt-0.5">{q.verbalEvaluation.score}</div>
                                      </div>
                                      <div className="bg-darkBg/80 p-3 rounded-lg text-center">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">Grammar</div>
                                        <div className="text-xl font-bold text-emerald-400 mt-0.5">{q.verbalEvaluation.grammarScore}</div>
                                      </div>
                                      <div className="bg-darkBg/80 p-3 rounded-lg text-center">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">Vocabulary</div>
                                        <div className="text-xl font-bold text-accentBlue mt-0.5">{q.verbalEvaluation.vocabularyScore}</div>
                                      </div>
                                      <div className="bg-darkBg/80 p-3 rounded-lg text-center">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">Relevance</div>
                                        <div className="text-xl font-bold text-purple-400 mt-0.5">{q.verbalEvaluation.contentRelevanceScore}</div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="text-[9px] text-slate-500 font-bold uppercase">Feedback</div>
                                      <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                                        {q.verbalEvaluation.feedback}
                                      </p>
                                    </div>

                                    {/* Guidelines Checklist */}
                                    {q.details.verbalType === 'email_writing' && (
                                      <div className="space-y-2">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">Guidelines Checklist</div>
                                        <div className="space-y-1">
                                          {q.verbalEvaluation.keyPointsMatched?.map((point, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                              <span className="text-emerald-400">✓</span>
                                              <span>{point}</span>
                                            </div>
                                          ))}
                                          {q.verbalEvaluation.keyPointsMissed?.map((point, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-slate-400 opacity-60">
                                              <span className="text-rose-400">✗</span>
                                              <span>{point}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Grammar Corrections */}
                                    {q.verbalEvaluation.grammarErrors?.length > 0 && (
                                      <div className="space-y-2">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">Grammar Suggestions</div>
                                        <div className="border border-darkBorder rounded-xl divide-y divide-darkBorder/40">
                                          {q.verbalEvaluation.grammarErrors.map((err, i) => (
                                            <div key={i} className="p-3 bg-darkCard/10 text-xs space-y-1 font-semibold">
                                              <div className="flex items-center gap-2">
                                                <span className="line-through text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{err.originalText}</span>
                                                <span className="text-slate-400">&rarr;</span>
                                                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{err.suggestedFix}</span>
                                              </div>
                                              <p className="text-slate-400 text-[10px]">{err.explanation}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* AI Suggested Response */}
                                    {q.verbalEvaluation.modelSuggestedAnswer && (
                                      <div className="space-y-1">
                                        <div className="text-[9px] text-slate-500 font-bold uppercase">AI Suggested Model Response</div>
                                        <div className="bg-darkBg border border-darkBorder p-4 rounded-xl text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                                          {q.verbalEvaluation.modelSuggestedAnswer}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-500 text-xs italic">
                                AI evaluation pending or not executed.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Coding Question Review Details */
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Evaluation Review</div>
                        <div className="bg-darkBg border border-darkBorder p-4 rounded-xl space-y-2">
                          <p className="text-xs text-slate-400">
                            Coding questions are graded based on standard compiler pipeline runs during the test window.
                          </p>
                          <div className="flex items-center gap-2 pt-1 font-bold text-xs select-none">
                            <span>Status:</span>
                            <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                              {isCorrect ? 'Passed All Hidden Test Cases' : 'No Accepted compiler solution logged'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AptitudeMockResult;
