import React, { useState } from 'react';
import { 
  Check, X, Sparkles, AlertTriangle, RefreshCw, 
  CheckCircle2, ChevronDown, ChevronUp, BarChart2, ShieldCheck, Zap, Minus
} from 'lucide-react';
import DiffViewer from './DiffViewer';
import CoachPanel from './CoachPanel';
import * as practiceService from '../../services/practiceService';
import { aiClient } from '../../services/aiClient';

export const EvaluationFeedback = ({ 
  attemptId, 
  questionId, 
  verbalEvaluation, 
  deterministicData, 
  aiData, 
  aiStatus = 'completed',
  evaluationMode = 'RULE_ONLY',
  submittedAnswer, 
  onPracticeAgain,
  onEnableAICoaching
}) => {
  const [expandedError, setExpandedError] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [coachSteps, setCoachSteps] = useState(null);
  const [coachError, setCoachError] = useState('');

  // Fallbacks
  const det = deterministicData || verbalEvaluation?.deterministic || {};
  const ai = aiData || verbalEvaluation?.ai || {};
  const currentAiStatus = aiStatus || ai.status || verbalEvaluation?.status || 'completed';

  const ruleScore = det.ruleScore || verbalEvaluation?.score || 0;
  const isPassed = ruleScore >= 60;

  const handleTriggerCoach = async () => {
    setLoadingCoach(true);
    setCoachError('');
    try {
      const activeKey = aiClient.getActiveKey('gemini')?.value || null;
      const data = await practiceService.getAICoachImprovements({
        attemptId,
        apiKey: activeKey,
        provider: 'gemini'
      });
      setCoachSteps(data.coachingSteps || []);
    } catch (err) {
      console.error('Failed to trigger AI Coach:', err);
      const errMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 429 || (errMsg && (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('LIMIT')))) {
        setCoachError('Your free daily AI tokens are used up for today. Please come back tomorrow or add your personal free Gemini API key in /ai for unlimited practice.');
      } else {
        setCoachError(errMsg || 'AI Coach is temporarily unavailable. Please check your Gemini API key in /ai.');
      }
    } finally {
      setLoadingCoach(false);
    }
  };

  return (
    <div className="space-y-8 select-none font-sans text-slate-100">
      
      {/* ─────────────────────────────────────────────────────────────
          1. OVERALL SCORE BANNER
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-900/30 via-darkCard to-violet-950/20 border border-violet-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-6">
          <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                fill="transparent" 
                stroke="#a78bfa" 
                strokeWidth="7" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - ruleScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-white leading-none">{ruleScore}</span>
              <span className="text-slate-400 text-[10px] block font-bold">/100</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                isPassed 
                  ? 'bg-violet-500/10 border-violet-500/40 text-violet-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {isPassed ? 'Passed Baseline' : 'Needs Practice'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Mode: <strong className="text-white uppercase">{evaluationMode}</strong></span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Evaluation Results</h3>
            <p className="text-xs text-slate-400">
              Graded using NQTCoder Rule Engine & AI Deep Coaching
            </p>
          </div>
        </div>

        <button
          onClick={onPracticeAgain}
          className="w-full md:w-auto bg-accentBlue hover:bg-accentBlue/90 text-white font-bold uppercase tracking-wider text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-accentBlue/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          Practice Again
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CARD 1: RULE EVALUATION (DETERMINISTIC)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-darkBorder pb-4">
          <div className="flex items-center space-x-2 text-violet-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">✓ Rule Evaluation (Deterministic)</h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full border border-violet-500/20">
            Rule Score: {det.ruleScore ?? ruleScore}/100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Points Checklist */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Guidelines & Key Points Coverage</h4>

            {/* Passage Recall fact-level results */}
            {det.recallBreakdown?.factResults?.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {det.recallBreakdown.factResults.map((fr, i) => {
                  const statusColor = fr.status === 'MATCHED' ? 'text-emerald-400' :
                    fr.status === 'PARTIAL' ? 'text-amber-400' :
                    fr.status === 'CONTRADICTED' ? 'text-rose-400' : 'text-slate-500';
                  const Icon = fr.status === 'MATCHED' ? Check :
                    fr.status === 'PARTIAL' ? Minus :
                    fr.status === 'CONTRADICTED' ? AlertTriangle : X;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-darkBg/40 border border-darkBorder/50 px-3 py-2 rounded-lg">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${statusColor}`} />
                      <span className="text-slate-300 font-medium flex-1">{fr.expected}</span>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border ${
                        fr.status === 'MATCHED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        fr.status === 'PARTIAL' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        fr.status === 'CONTRADICTED' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                        'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>{fr.status}{fr.detected ? ` (wrote: ${fr.detected})` : ''}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Email: MATCHED */}
                <div className="bg-darkBg/60 border border-darkBorder p-3 rounded-xl space-y-2">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wide">Covered ({det.guidelinesMatched?.length || 0})</span>
                  <ul className="space-y-1.5 font-medium">
                    {det.guidelinesMatched?.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                    {(!det.guidelinesMatched || det.guidelinesMatched.length === 0) && (
                      <li className="text-slate-500 italic text-[11px]">No guidelines fully covered.</li>
                    )}
                  </ul>
                </div>

                {/* Email: PARTIAL + MISSED */}
                <div className="bg-darkBg/60 border border-darkBorder p-3 rounded-xl space-y-2">
                  {det.guidelinesPartial?.length > 0 && (
                    <>
                      <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">Partial ({det.guidelinesPartial.length})</span>
                      <ul className="space-y-1.5 font-medium mb-2">
                        {det.guidelinesPartial.map((point, i) => (
                          <li key={`p-${i}`} className="flex items-start gap-2 text-amber-200/80">
                            <Minus className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wide">Missing ({det.guidelinesMissed?.length || 0})</span>
                  <ul className="space-y-1.5 font-medium">
                    {det.guidelinesMissed?.map((point, i) => (
                      <li key={`m-${i}`} className="flex items-start gap-2 text-slate-400">
                        <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                    {(!det.guidelinesMissed || det.guidelinesMissed.length === 0) && (
                      <li className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        All guidelines covered!
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Mechanics Issues List */}
            {det.mechanicsIssues?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-1.5">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">Mechanics Issues Detected</span>
                <ul className="space-y-1 text-[11px] font-medium text-amber-200/70">
                  {det.mechanicsIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Structure & Mechanics Stats */}
          <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-2xl space-y-4 text-xs">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Structural Breakdown</h4>
            
            <div className="space-y-2.5 font-semibold text-slate-300">
              <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
                <span className="text-slate-400">Word Count</span>
                <span className="font-extrabold text-white">{det.wordCount || 0} words</span>
              </div>

              {det.recallBreakdown ? (
                /* Passage Recall Specific Structural Stats */
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
                    <span className="text-slate-400">Passage Length</span>
                    <span className="text-slate-300">{det.referenceWordCount || 40} words</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
                    <span className="text-slate-400">Recall Coverage</span>
                    <span className="text-violet-300 font-black">{det.recallBreakdown?.coveragePercent || 0}%</span>
                  </div>
                </>
              ) : (
                /* Email Writing Specific Structural Stats */
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
                    <span className="text-slate-400">Word Range</span>
                    <span className="text-slate-300">{det.minWords || 100} - {det.maxWords || 250}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-darkBorder/40">
                    <span className="text-slate-400">Greeting Check</span>
                    <span className={det.hasGreeting ? "text-emerald-400 font-extrabold" : "text-slate-500"}>
                      {det.hasGreeting ? 'Pass ✓' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sign-off Check</span>
                    <span className={det.hasSignoff ? "text-emerald-400 font-extrabold" : "text-slate-500"}>
                      {det.hasSignoff ? 'Pass ✓' : 'Missing'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {det.recallBreakdown && (
              <div className="pt-3 border-t border-darkBorder/50 space-y-1.5">
                <div className="text-[10px] text-slate-400 space-y-1 font-semibold">
                  {det.recallBreakdown?.factsCount?.total > 0 && (
                    <div className="flex justify-between">
                      <span>Key Facts:</span>
                      <span className="text-slate-200">
                        {det.recallBreakdown?.factsCount?.remembered || 0} matched
                        {det.recallBreakdown?.factsCount?.partial > 0 ? ` · ${det.recallBreakdown.factsCount.partial} partial` : ''}
                        {det.recallBreakdown?.factsCount?.contradicted > 0 ? <span className="text-rose-400"> · {det.recallBreakdown.factsCount.contradicted} contradicted</span> : ''}
                        /{det.recallBreakdown?.factsCount?.total || 0}
                      </span>
                    </div>
                  )}
                  {det.recallBreakdown?.numbersCount?.total > 0 && (
                    <div className="flex justify-between"><span>Numbers & Quantities:</span><span className="text-slate-200">{det.recallBreakdown?.numbersCount?.remembered || 0}/{det.recallBreakdown?.numbersCount?.total || 0}</span></div>
                  )}
                  {det.recallBreakdown?.namesCount?.total > 0 && (
                    <div className="flex justify-between"><span>Names & Titles:</span><span className="text-slate-200">{det.recallBreakdown?.namesCount?.remembered || 0}/{det.recallBreakdown?.namesCount?.total || 0}</span></div>
                  )}
                  {det.recallBreakdown?.locationsCount?.total > 0 && (
                    <div className="flex justify-between"><span>Locations & Venues:</span><span className="text-slate-200">{det.recallBreakdown?.locationsCount?.remembered || 0}/{det.recallBreakdown?.locationsCount?.total || 0}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CARD 2: ✨ AI COACHING (OPTIONAL LLM LAYER)
         ───────────────────────────────────────────────────────────── */}
      {currentAiStatus === 'skipped' || evaluationMode === 'RULE_ONLY' ? (
        /* Offline Banner with Interactive Enable Button */
        <div className="bg-gradient-to-r from-violet-950/40 via-darkCard to-violet-900/20 border border-violet-500/25 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left select-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center justify-center sm:justify-start gap-1.5">
                <span>✨ AI Coaching</span>
                <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-extrabold uppercase">OFF</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                This attempt was evaluated using NQTCoder's Rule Engine. Enable ✨ AI Coaching to receive deep executive feedback and model revisions.
              </p>
            </div>
          </div>

          {onEnableAICoaching && (
            <button
              type="button"
              onClick={onEnableAICoaching}
              className="w-full sm:w-auto bg-accentBlue hover:bg-accentBlue/90 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-accentBlue/20 flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Enable AI Coaching Now
            </button>
          )}
        </div>
      ) : currentAiStatus === 'pending' ? (
        /* Background Loading Skeleton */
        <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 text-center space-y-4 animate-pulse">
          <RefreshCw className="w-8 h-8 text-accentBlue mx-auto animate-spin" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">✨ AI Deep Coaching In Progress...</h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            NQTCoder's background AI is analyzing your response mechanics and recall precision. Results will populate automatically.
          </p>
        </div>
      ) : (
        /* Active AI Coaching Card */
        <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-darkBorder pb-4">
            <div className="flex items-center space-x-2 text-violet-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">✨ AI Deep Coaching Analysis</h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full border border-violet-500/20">
              TCS Readiness: {ai.tcsReadiness || 'High'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tone & Feedback */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Executive Mentor Feedback</h4>
                <p className="text-slate-200 text-xs leading-relaxed font-medium whitespace-pre-line">
                  {ai.feedback || verbalEvaluation?.feedback || 'Good effort on this task!'}
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-darkBg/60 border border-darkBorder p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Key Strengths</span>
                  <ul className="space-y-1 text-slate-300">
                    {(ai.strengths || ['Clear structure', 'Met length criteria']).map((s, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-darkBg/60 border border-darkBorder p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] text-rose-400 font-extrabold uppercase">Areas to Refine</span>
                  <ul className="space-y-1 text-slate-300">
                    {(ai.weaknesses || ['Enhance vocabulary & recall precision']).map((w, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <X className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Tone Gauge */}
            <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {det.recallBreakdown ? 'Recall Precision Score' : 'Executive Tone Rating'}
              </h4>
              <div className="text-3xl font-black text-violet-300">
                {ai.toneScore || det.recallBreakdown?.coveragePercent || 85}%
              </div>
              <p className="text-slate-400 text-[11px] font-semibold">
                {det.recallBreakdown ? 'Accuracy & Detail Fidelity' : 'Professional & Formal Business Etiquette'}
              </p>
            </div>
          </div>

          {/* Grammar Corrections Accordion */}
          {ai.grammarErrors && ai.grammarErrors.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-darkBorder">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Grammar Corrections Checklist</h4>
              <div className="bg-darkBg border border-darkBorder rounded-2xl overflow-hidden divide-y divide-darkBorder/50">
                {ai.grammarErrors.map((err, i) => {
                  const isOpen = expandedError === i;
                  return (
                    <div key={i} className="text-xs">
                      <button
                        onClick={() => setExpandedError(isOpen ? null : i)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-800/10 transition-colors text-left cursor-pointer font-medium"
                      >
                        <span className="text-slate-300">Issue: <strong className="text-rose-400 font-mono line-through">"{err.originalText}"</strong></span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-darkCard border-t border-darkBorder/30 space-y-2">
                          <div className="text-emerald-400 font-mono">Suggested Fix: "{err.suggestedFix}"</div>
                          <div className="text-slate-400 text-[11px]">{err.explanation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diff Viewer for AI Model Answer */}
          {ai.modelSuggestedAnswer && (
            <div className="space-y-3 pt-4 border-t border-darkBorder">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">AI Model Suggested Revision</h4>
              <DiffViewer original={submittedAnswer[0]} improved={ai.modelSuggestedAnswer} />
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. AI COACH MENTOR LAB
         ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-darkBorder/40 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accentBlue" />
              {det.recallBreakdown ? 'AI Recall Mentor Lab' : 'AI Writing Mentor Lab'}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-lg">
              Get an interactive coaching session mapping sentence adjustments to clear pedagogical rule explanations.
            </p>
          </div>

          {!coachSteps && (
            <button
              onClick={handleTriggerCoach}
              disabled={loadingCoach}
              className="bg-accentBlue hover:bg-accentBlue/90 text-white font-bold uppercase tracking-wider text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-accentBlue/20"
            >
              {loadingCoach ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loadingCoach ? 'Analyzing Improvements...' : det.recallBreakdown ? 'Improve My Response' : 'Improve My Email'}
            </button>
          )}
        </div>

        {coachError && (
          <div className="bg-rose-500/10 border border-rose-500/35 text-rose-400 p-4 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{coachError}</span>
          </div>
        )}

        {coachSteps && <CoachPanel coachingSteps={coachSteps} />}
      </div>

    </div>
  );
};

export default EvaluationFeedback;
