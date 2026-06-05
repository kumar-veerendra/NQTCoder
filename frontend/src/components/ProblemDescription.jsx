import React, { useState, useContext } from 'react';
import { HelpCircle, ShieldAlert, Award, FileText, Lightbulb, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProblemDescription = ({ question, isMockTest = false }) => {
  if (!question) return null;

  const { user } = useContext(AuthContext);
  const isSolved = user && user.solvedQuestions && user.solvedQuestions.includes(question._id);

  const getQuestionHints = () => {
    if (question.hints && question.hints.length > 0) {
      return question.hints;
    }
    
    const topic = (question.topic || '').toLowerCase();
    const title = (question.title || '').toLowerCase();
    const difficulty = (question.difficulty || '').toLowerCase();
    
    const fallbackHints = [];
    
    if (topic.includes('array') || topic.includes('sorting') || title.includes('array') || title.includes('sort')) {
      fallbackHints.push("Consider how sorting the elements or using a two-pointer approach could simplify the problem. Can we solve it in O(N log N) or O(N) time?");
    } else if (topic.includes('string') || topic.includes('regex') || title.includes('string')) {
      fallbackHints.push("Think about string indexing, using a map/hash set to track character frequencies, or standard library string methods to parse inputs.");
    } else if (topic.includes('search') || topic.includes('binary') || title.includes('search')) {
      fallbackHints.push("If the inputs are sorted or can be partitioned, Binary Search can reduce runtime from O(N) to O(log N). Verify search boundaries.");
    } else if (topic.includes('math') || topic.includes('number') || title.includes('prime') || title.includes('digit')) {
      fallbackHints.push("Look for mathematical patterns (modular arithmetic, prime factorization, or digit manipulation). Beware of integer overflow for large numbers.");
    } else {
      fallbackHints.push("Break down the problem: can you solve it with a brute-force approach first? Then, analyze bottlenecks to optimize it.");
    }

    if (difficulty.includes('easy')) {
      fallbackHints.push("Ensure your solution handles simple boundaries like single-element inputs or zero correctly.");
    } else if (difficulty.includes('medium')) {
      fallbackHints.push("For Medium difficulty, time complexity matters. Use optimal structures (like HashMap, HashSet, or Dynamic Programming) to avoid Time Limit Exceeded (TLE).");
    } else {
      fallbackHints.push("This Hard problem requires optimal time & space complexity. Look for subproblems that can be stored/memoized, or search space reduction.");
    }
    
    if (title.includes('duplicate') || title.includes('unique') || title.includes('repeat')) {
      fallbackHints.push("A HashSet or HashMap is excellent for tracking occurrences or detecting duplicates in O(1) average lookup time.");
    } else if (title.includes('max') || title.includes('min') || title.includes('kth')) {
      fallbackHints.push("Using variables to track current minimums/maximums or using a PriorityQueue (Heap) can find extreme elements efficiently.");
    } else {
      fallbackHints.push("Standard Scanner or BufferedReader (for Java) and sys.stdin (for Python) are recommended for parsing inputs efficiently.");
    }

    return fallbackHints;
  };

  const hints = getQuestionHints();

  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Easy-Medium': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Medium-Hard': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  return (
    <div className="h-full overflow-y-auto pr-2 space-y-6 text-slate-300">
      {/* Title Header */}
      <div>
        <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${difficultyColors[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-darkBg/60 border border-darkBorder text-slate-300">
              {question.topic}
            </span>
            {question.company.map((c) => (
              <span key={c} className="text-xs px-2.5 py-1 rounded-md font-bold bg-darkBg/60 border border-darkBorder text-slate-300">
                {c}
              </span>
            ))}
          </div>
          {question.examDate && (
            <div className="text-[10px] bg-darkCard border border-darkBorder px-2.5 py-1 rounded-md text-slate-400 font-bold uppercase tracking-wider shadow-sm select-none">
              📅 {question.examDate}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
          {question.title}
          {isSolved && (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" title="Solved" />
          )}
        </h1>
      </div>

      <div className="h-px bg-darkBorder"></div>

      {/* Description Content */}
      <div className="space-y-4">
        <h3 className="flex items-center text-md font-bold text-slate-100 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-accentBlue mr-2" />
          Problem Statement
        </h3>
        <p className="whitespace-pre-line leading-relaxed text-slate-300 text-sm md:text-base">
          {question.description}
        </p>
      </div>

      {/* Constraints */}
      {question.constraints && (
        <div className="space-y-3 bg-darkCard/30 border border-darkBorder/60 p-4 rounded-lg">
          <h3 className="flex items-center text-sm font-bold text-slate-100 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-400 mr-2" />
            Constraints
          </h3>
          <pre className="font-mono text-xs text-amber-300 whitespace-pre-wrap leading-relaxed">
            {question.constraints}
          </pre>
        </div>
      )}

      {/* Examples */}
      {question.examples && question.examples.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center text-md font-bold text-slate-100 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-accentBlue mr-2" />
            Examples
          </h3>
          
          <div className="space-y-4">
            {question.examples.map((ex, index) => (
              <div key={index} className="bg-darkCard/50 border border-darkBorder rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Example {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Input</div>
                    <pre className="font-mono text-xs bg-darkBg border border-darkBorder/40 p-2.5 rounded-md text-slate-200 overflow-x-auto whitespace-pre-wrap">
                      {ex.input}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Output</div>
                    <pre className="font-mono text-xs bg-darkBg border border-darkBorder/40 p-2.5 rounded-md text-slate-200 overflow-x-auto whitespace-pre-wrap">
                      {ex.output}
                    </pre>
                  </div>
                </div>
                {ex.explanation && (
                  <div className="text-xs text-slate-400 italic bg-darkBg/30 p-2 rounded border border-darkBorder/30">
                    <span className="font-semibold text-slate-300 not-italic">Explanation: </span>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMockTest && (
        <>
          <div className="h-px bg-darkBorder"></div>

          {/* Hints Section */}
          <div className="space-y-4">
            <h3 className="flex items-center text-md font-bold text-slate-100 uppercase tracking-wider select-none">
              <Lightbulb className="w-4 h-4 text-amber-400 mr-2" />
              Hints & Edge Cases
            </h3>
            
            <div className="space-y-2.5">
              {hints.map((hint, idx) => (
                <HintAccordion key={idx} index={idx + 1} text={hint} />
              ))}
              <HintAccordion 
                index="Hidden Test Cases Edge Cases" 
                text={`Edge cases often tested in hidden cases:
1. Extremes: Values at the maximum and minimum constraint boundaries (e.g. N = 10^5, values = 0, negative integers).
2. Trivial: Minimum inputs like 0, 1, empty strings, single element lists.
3. Overflow: Large inputs that require Long/Double types (Java) instead of Integer to avoid numeric overflow.
4. Scale: High runtime scale cases checking that loops don't nest beyond O(N log N) or O(N) to avoid Time Limit Exceeded (TLE).`} 
                isWarning={true}
              />
            </div>
          </div>
        </>
      )}

    </div>
  );
};

// Helper component for Hints Accordion
const HintAccordion = ({ index, text, isWarning = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-darkBorder rounded-lg bg-darkCard/30 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-darkCard/50 transition-colors text-left"
      >
        <span className={`text-xs font-bold uppercase tracking-wider flex items-center ${isWarning ? 'text-rose-400' : 'text-amber-400'}`}>
          <span className="mr-1.5">{isWarning ? '⚠️' : '💡'}</span>
          {typeof index === 'number' ? `Hint ${index}` : index}
        </span>
        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{isOpen ? 'Hide' : 'Reveal'}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2.5 border-t border-darkBorder/40 text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-darkBg/20 font-medium">
          {text}
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;
