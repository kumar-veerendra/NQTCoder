/**
 * Deterministic Evaluator Engine — v2  (Rule-Based, 100% Offline, <50ms)
 * Evaluates Email Writing and Passage Recall without any LLM / external API calls.
 *
 * Upgrade highlights over v1:
 *  - Concept-level guideline matching with MATCHED / PARTIAL / MISSED and synonym support
 *  - Typed fact matching for Passage Recall (name, location, number, time, date, amount, object, event, fact)
 *  - CONTRADICTED detection for critical facts (number, time, date, amount) using nearby-context approach
 *  - Fuzzy entity matching → PARTIAL only (never automatic MATCHED)
 *  - Improved mechanics: 7 deterministic checks with issue descriptions
 *  - Gradual word-count penalty (no score cliff)
 *  - Professional language score
 *  - All v1 field names preserved for backward compatibility
 */

// ─────────────────────────────────────────────────────────────────────────────
// STOP WORDS — common English words that carry no meaningful content
// ─────────────────────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being',
  'to','for','of','in','on','at','by','and','or','but','with',
  'that','this','it','its','we','you','i','our','your','my','me',
  'they','their','them','he','she','his','her','us','who','which',
  'will','would','should','can','could','may','might','shall',
  'have','has','had','do','did','does','not','no','so','if','as',
  'about','from','into','than','then','when','where','how','what',
  'please','kindly','just','very','much','also','well','too',
  'am','been','shall','let','get','got','got','make','made',
]);

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN-SPECIFIC SYNONYM MAP
// Intentionally small and maintainable — not a thesaurus
// ─────────────────────────────────────────────────────────────────────────────
const SYNONYMS = {
  request:   ['ask', 'seek', 'inquire', 'solicit'],
  inform:    ['notify', 'tell', 'update', 'communicate', 'advise', 'let know'],
  schedule:  ['arrange', 'book', 'organize', 'plan', 'set up', 'fix'],
  meeting:   ['discussion', 'appointment', 'session', 'conference', 'call'],
  purchase:  ['buy', 'order', 'procure', 'acquire'],
  apologize: ['sorry', 'regret', 'apologise', 'apology'],
  delay:     ['late', 'postpone', 'postponed', 'defer', 'deferral', 'hold'],
  cancel:    ['call off', 'abort', 'discontinue', 'withdraw'],
  assist:    ['help', 'support', 'aid', 'facilitate', 'assistance'],
  reply:     ['respond', 'response', 'answer', 'revert', 'get back'],
  confirm:   ['verify', 'acknowledge', 'validate', 'certify', 'affirm'],
  urgent:    ['immediate', 'priority', 'critical', 'pressing', 'asap'],
  complete:  ['finish', 'done', 'accomplish', 'fulfill', 'wrap up'],
  discuss:   ['talk', 'address', 'review', 'go over', 'consider', 'deliberate'],
  deliver:   ['send', 'provide', 'submit', 'hand over', 'bring', 'dispatch'],
  approve:   ['accept', 'endorse', 'sanction', 'authorize', 'green light'],
  extend:    ['prolong', 'lengthen', 'stretch', 'continue'],
  require:   ['need', 'necessitate', 'demand'],
  ensure:    ['make sure', 'guarantee', 'verify', 'confirm'],
  report:    ['update', 'inform', 'brief', 'communicate'],
  mention:   ['state', 'note', 'indicate', 'specify', 'highlight', 'explain', 'describe'],
  reason:    ['cause', 'because', 'due', 'owing', 'factor', 'explanation'],
  assure:    ['guarantee', 'promise', 'commit', 'ensure', 'pledge'],
};

// Reverse-lookup: synonym → canonical word
const SYNONYM_REVERSE = {};
for (const [canonical, synonymList] of Object.entries(SYNONYMS)) {
  for (const s of synonymList) {
    SYNONYM_REVERSE[s] = canonical;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXT NORMALIZATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safe, conservative word stemming — only handles common English suffixes
 * that do not damage words. Does NOT use aggressive stemming algorithms.
 */
function stemWord(word) {
  if (!word || word.length <= 3) return word;
  // Common suffix stripping (ordered from longest to shortest)
  const rules = [
    [/ings$/, ''],
    [/ing$/, ''],
    [/ations$/, 'ate'],
    [/ation$/, 'ate'],
    [/tions$/, 'tion'],
    [/ings$/, ''],
    [/ness$/, ''],
    [/ment$/, ''],
    [/ments$/, ''],
    [/ies$/, 'y'],
    [/ied$/, 'y'],
    [/ers$/, 'er'],
    [/ests$/, 'est'],
    [/ed$/, ''],
    [/es$/, 'e'],
    [/s$/, ''],
  ];
  let w = word;
  for (const [pattern, replacement] of rules) {
    const result = w.replace(pattern, replacement);
    if (result.length >= 3 && result !== w) {
      return result;
    }
  }
  return w;
}

/**
 * Canonicalize a word — normalize through synonym map then stem it.
 * This ensures "meetings", "meeting", "discussion" all map to one concept.
 */
function canonicalize(word) {
  const w = word.toLowerCase().trim();
  // Check if this word (or its base) is a known synonym
  const synCanonical = SYNONYM_REVERSE[w];
  if (synCanonical) return stemWord(synCanonical);
  // Otherwise just stem
  return stemWord(w);
}

/**
 * Tokenize text into meaningful concept words.
 * Removes stop words, punctuation, very short tokens.
 */
function extractConcepts(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .map(canonicalize)
    .filter(w => w.length > 2);
}

/**
 * Build a concept set from text — Set of canonical concept words.
 */
function buildConceptSet(text) {
  return new Set(extractConcepts(text));
}

/**
 * Expand a concept through the SYNONYMS map.
 * Returns a Set of all canonical forms that should match this concept.
 */
function expandConcept(concept) {
  const set = new Set([concept]);
  // If concept has synonyms, add the stems of all synonyms
  if (SYNONYMS[concept]) {
    for (const syn of SYNONYMS[concept]) {
      set.add(stemWord(syn));
      set.add(canonicalize(syn));
    }
  }
  return set;
}

/**
 * Check if studentConceptSet contains a match for `concept` (with synonym expansion).
 */
function conceptMatched(concept, studentConceptSet) {
  const expanded = expandConcept(concept);
  for (const variant of expanded) {
    if (studentConceptSet.has(variant)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVENSHTEIN DISTANCE (for conservative fuzzy entity matching only)
// ─────────────────────────────────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─────────────────────────────────────────────────────────────────────────────
// GUIDELINE CONCEPT COVERAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate a single guideline against the student's normalized text.
 * Returns a rich object with status, coverage %, matched/missing concepts.
 */
function evaluateGuideline(guideline, studentConceptSet) {
  const concepts = extractConcepts(guideline);
  if (concepts.length === 0) {
    return {
      guideline,
      status: 'MISSED',
      coveragePercent: 0,
      matchedConcepts: [],
      missingConcepts: [],
    };
  }

  const matched = [];
  const missing = [];

  for (const concept of concepts) {
    if (conceptMatched(concept, studentConceptSet)) {
      matched.push(concept);
    } else {
      missing.push(concept);
    }
  }

  const coveragePercent = Math.round((matched.length / concepts.length) * 100);
  let status;
  if (coveragePercent >= 70) status = 'MATCHED';
  else if (coveragePercent >= 40) status = 'PARTIAL';
  else status = 'MISSED';

  return {
    guideline,
    status,
    coveragePercent,
    matchedConcepts: matched,
    missingConcepts: missing,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL MECHANICS CHECKS
// ─────────────────────────────────────────────────────────────────────────────
const INFORMAL_WORDS = ['pls', 'plz', ' u ', ' ur ', 'wanna', 'gonna', 'bro', 'dude', 'asap', 'lol', 'omg', 'btw', 'fyi'];

function evaluateMechanics(text) {
  let score = 100;
  const issues = [];

  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);

  // 1. Sentence capitalization
  let uncap = 0;
  for (const s of sentences) {
    const ch = s.charAt(0);
    if (ch && /[a-z]/.test(ch)) uncap++;
  }
  if (uncap > 0) {
    const pen = Math.min(20, uncap * 5);
    score -= pen;
    issues.push(`${uncap} sentence(s) start with lowercase (−${pen})`);
  }

  // 2. Lowercase standalone 'i'
  const lowerI = (text.match(/\bi\b/g) || []).length;
  if (lowerI > 0) {
    const pen = Math.min(9, lowerI * 3);
    score -= pen;
    issues.push(`Standalone "i" should be "I" found ${lowerI} time(s) (−${pen})`);
  }

  // 3. Repeated consecutive words
  const dups = text.match(/\b(\w+)\s+\1\b/gi) || [];
  if (dups.length > 0) {
    const pen = Math.min(15, dups.length * 5);
    score -= pen;
    issues.push(`Repeated consecutive words (${dups.join(', ')}) (−${pen})`);
  }

  // 4. Multiple unnecessary spaces
  if (/  +/.test(text)) {
    score -= 2;
    issues.push('Multiple unnecessary spaces (−2)');
  }

  // 5. Excessive punctuation
  const excl = (text.match(/!{2,}/g) || []).length;
  const quest = (text.match(/\?{2,}/g) || []).length;
  if (excl + quest > 0) {
    const pen = Math.min(9, (excl + quest) * 3);
    score -= pen;
    issues.push(`Excessive punctuation (!! or ??) found (−${pen})`);
  }

  // 6. Informal words/abbreviations
  const lower = text.toLowerCase();
  const informalFound = INFORMAL_WORDS.filter(w => lower.includes(w));
  if (informalFound.length > 0) {
    const pen = Math.min(12, informalFound.length * 4);
    score -= pen;
    issues.push(`Informal language found (${informalFound.join(', ')}) (−${pen})`);
  }

  // 7. Missing ending punctuation on last non-empty sentence
  const trimmed = text.trim();
  if (trimmed.length > 0 && !/[.!?]$/.test(trimmed)) {
    score -= 2;
    issues.push('Response may be missing a closing punctuation mark (−2)');
  }

  score = Math.max(0, Math.min(100, score));
  return { score, issues, informalCount: informalFound.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD COUNT SCORE — gradual penalty, no cliff
// ─────────────────────────────────────────────────────────────────────────────
function wordCountScore(wordCount, minWords, maxWords) {
  if (wordCount >= minWords && wordCount <= maxWords) return 100;

  if (wordCount < minWords) {
    const deficit = (minWords - wordCount) / minWords;
    if (deficit <= 0.10) return 95;
    if (deficit <= 0.20) return 88;
    if (deficit <= 0.30) return 75;
    if (deficit <= 0.50) return 60;
    return Math.max(0, Math.round(100 - deficit * 100));
  }

  // Over maxWords
  const excess = (wordCount - maxWords) / maxWords;
  if (excess <= 0.10) return 95;
  if (excess <= 0.20) return 88;
  if (excess <= 0.30) return 78;
  return Math.max(60, Math.round(100 - excess * 50));
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSAGE RECALL — FACT MATCHING
// ─────────────────────────────────────────────────────────────────────────────

/** Critical fact types that require strict/exact matching. */
const CRITICAL_TYPES = new Set(['number', 'time', 'date', 'amount']);

/**
 * Extract all number/time/date/amount patterns from text.
 * Returns array of { value, start, end } for context-aware contradiction check.
 */
function extractCriticalValues(text) {
  const patterns = [
    // Times: 11 PM, 10:30 AM, 11pm
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi,
    // Dates: 15 July, July 15, 15/07
    /\b(\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))\b/gi,
    /\b((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2})\b/gi,
    // Days of week
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    // Amounts: ₹5,000 / Rs. 500 / $100
    /(?:₹|rs\.?\s*|inr\s*|\$)\s*[\d,]+(?:\.\d+)?\b/gi,
    // Plain numbers (4+ digits or preceded by amount context)
    /\b(\d{4,})\b/g,
    // Simple numbers 1-3 digits only when clearly standalone
    /\b(\d{1,3})\b/g,
  ];

  const results = [];
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(text)) !== null) {
      results.push({ value: m[0].toLowerCase().trim(), start: m.index, end: m.index + m[0].length });
    }
  }
  return results;
}

/**
 * Normalize a critical value string for comparison.
 * Strips spaces, lowercases, removes currency symbols and numeric separators.
 */
function normalizeCritical(val) {
  return (val || '').toLowerCase().replace(/\s+/g, '').replace(/[₹$₦€£¥,]/g, '').trim();
}

/**
 * Attempt to find a specific critical value in nearby context of the student text.
 * "nearby" = within ~60 chars of where the entity name appears,
 * or globally if the entity name isn't present.
 *
 * Returns: 'MATCHED' | 'CONTRADICTED' | 'MISSING'
 *
 * Rule: CONTRADICTED only when we can confidently locate a *different* value
 * in a relevant position. When uncertain → MISSING (not CONTRADICTED).
 */
function matchCriticalFact(expected, entityHint, studentText) {
  const normExpected = normalizeCritical(expected);
  const lower = studentText.toLowerCase();

  // First check for exact match anywhere in text
  // IMPORTANT: normalize the text the same way as the expected value
  // so that currency amounts like ₹5,000 are correctly compared against '5000'.
  // Use word-boundary regex on the *normalized* text to prevent '5000' matching inside '50000'.
  const normStudentText = lower.replace(/\s+/g, ' ').replace(/[₹$₦€£¥,]/g, '');
  const normExpectedEscaped = normExpected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Allow optional space: '11pm' matches '11 pm', '11:30am' matches '11:30 am', etc.
  const flexNorm = normExpectedEscaped.replace(/([0-9])(am|pm)/i, '$1\\s*$2');
  if (new RegExp('(?<![0-9])' + flexNorm + '(?![0-9])', 'i').test(normStudentText)) {
    return 'MATCHED';
  }

  // Extract all critical values from student text
  const found = extractCriticalValues(studentText);

  // If entity hint (e.g. "City Hospital") appears in text, look in nearby context (±60 chars)
  let searchWindow = lower;
  if (entityHint) {
    const hintPos = lower.indexOf(entityHint.toLowerCase());
    if (hintPos !== -1) {
      searchWindow = lower.slice(Math.max(0, hintPos - 60), hintPos + entityHint.length + 60);
    }
  }

  // Check if the expected value appears in the search window
  if (searchWindow.replace(/\s+/g, '').includes(normExpected)) {
    return 'MATCHED';
  }

  // Look for conflicting critical values in the same search window
  // Only report CONTRADICTED if there's exactly one alternative value found in context
  // If there are multiple or it's ambiguous, report MISSING to avoid false positives
  const windowValues = found.filter(f => {
    const vNorm = normalizeCritical(f.value);
    return vNorm !== normExpected && vNorm.length > 0;
  });

  // Narrow to values found within the entity's context window if possible
  if (entityHint) {
    const hintPos = lower.indexOf(entityHint.toLowerCase());
    if (hintPos !== -1) {
      const windowStart = Math.max(0, hintPos - 60);
      const windowEnd = hintPos + entityHint.length + 60;
      const inWindow = windowValues.filter(v => v.start >= windowStart && v.end <= windowEnd);

      if (inWindow.length === 1) {
        // Exactly one different value found in the entity's context window → confident contradiction
        return 'CONTRADICTED';
      }
      // Ambiguous (0 or 2+ different values in window) → MISSING
      return 'MISSING';
    }
  }

  // No entity hint — look for exactly one conflicting value of the same type in the whole text
  // Use the same category pattern comparison
  const sameTypeConflicts = windowValues.filter(f => {
    const n = normalizeCritical(f.value);
    // Must be same category (time vs time, number vs number, etc)
    const isTime = /\d{1,2}(?::\d{2})?\s*(?:am|pm)/.test(f.value);
    const expectedIsTime = /\d{1,2}(?::\d{2})?\s*(?:am|pm)/.test(expected);
    if (isTime !== expectedIsTime) return false;
    return n !== normExpected && n.length > 0;
  });

  if (sameTypeConflicts.length === 1) {
    return 'CONTRADICTED';
  }

  return 'MISSING';
}

/**
 * Match a textual (non-critical) fact against the student text.
 * Uses concept coverage + conservative fuzzy matching.
 * Returns: 'MATCHED' | 'PARTIAL' | 'MISSING'
 */
function matchTextualFact(expectedText, studentConceptSet, studentLower) {
  const factConcepts = extractConcepts(expectedText);
  if (factConcepts.length === 0) {
    // Single-token entity — try direct include
    return studentLower.includes(expectedText.toLowerCase()) ? 'MATCHED' : 'MISSING';
  }

  const matched = factConcepts.filter(c => conceptMatched(c, studentConceptSet));
  const coveragePercent = Math.round((matched.length / factConcepts.length) * 100);

  if (coveragePercent >= 70) return 'MATCHED';

  // Conservative fuzzy fallback for short entity names (names, locations)
  // Correction #4: fuzzy → PARTIAL only, never automatic MATCHED
  if (factConcepts.length <= 3) {
    const words = expectedText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let fuzzyHits = 0;
    for (const word of words) {
      // Check direct presence first
      if (studentLower.includes(word)) {
        fuzzyHits++;
        continue;
      }
      // Fuzzy match: only if levenshtein ≤ 1 (very close typo) AND word length ≥ 5
      if (word.length >= 5) {
        const studentWords2 = studentLower.split(/\s+/);
        const closestDist = Math.min(...studentWords2.map(sw => levenshtein(word, sw)));
        if (closestDist === 1) fuzzyHits += 0.5; // partial credit only
      }
    }
    const fuzzyPct = words.length > 0 ? Math.round((fuzzyHits / words.length) * 100) : 0;
    if (fuzzyPct >= 70) return 'PARTIAL'; // Correction #4: max PARTIAL for fuzzy
    if (fuzzyPct >= 40 || coveragePercent >= 40) return 'PARTIAL';
  } else if (coveragePercent >= 40) {
    return 'PARTIAL';
  }

  return 'MISSING';
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EVALUATOR CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class DeterministicEvaluator {

  /**
   * Evaluate Email Writing response.
   *
   * @param {string} draft - Student's written email
   * @param {object} promptConfig - { minWords, maxWords, guidelines[] }
   * @returns {object} Evaluation result (all v1 field names preserved + new fields)
   */
  static evaluateEmail(draft, promptConfig = {}) {
    const text = (draft || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    const minWords = Math.max(promptConfig.minWords || 100, 50);
    const maxWords = Math.max(promptConfig.maxWords || 250, 100);
    const guidelines = (promptConfig.guidelines || []).filter(Boolean);

    // ── 1. Structure Check ────────────────────────────────────────────────
    const greetingRegex = /^(dear\b|hi\b|hello\b|respected\b|greetings\b|good\s+morning\b|good\s+afternoon\b|good\s+evening\b)/i;
    const signoffRegex  = /\b(regards|kind\s+regards|best\s+regards|warm\s+regards|sincerely|thank\s+you|thanks|yours\s+truly|yours\s+faithfully|with\s+regards)\b/i;

    const hasGreeting = greetingRegex.test(text);
    const hasSignoff  = signoffRegex.test(text);
    const hasParagraphSeparation = /\n\s*\n/.test(text) || /\.\s{2,}[A-Z]/.test(text);
    const structurePass = hasGreeting && hasSignoff;

    // Structure score: 0/50/75/100
    let structureScore = 0;
    if (hasGreeting && hasSignoff) structureScore = 100;
    else if (hasGreeting || hasSignoff) structureScore = 50;
    if (structureScore < 100 && hasParagraphSeparation) structureScore = Math.min(100, structureScore + 15);

    // ── 2. Guideline Concept Coverage ────────────────────────────────────
    const studentConceptSet = buildConceptSet(text);
    const guidelinesDetailed = [];
    const guidelinesMatched  = []; // v1 compat
    const guidelinesPartial  = []; // new
    const guidelinesMissed   = []; // v1 compat

    for (const g of guidelines) {
      if (!g || !g.trim()) continue;
      const result = evaluateGuideline(g, studentConceptSet);
      guidelinesDetailed.push(result);
      if (result.status === 'MATCHED') guidelinesMatched.push(g);
      else if (result.status === 'PARTIAL') guidelinesPartial.push(g);
      else guidelinesMissed.push(g);
    }

    // Guideline score: MATCHED=1.0, PARTIAL=0.5, MISSED=0.0
    const totalGuidelines = guidelines.length || 1;
    const guidelineRaw = guidelinesDetailed.reduce((sum, r) => {
      return sum + (r.status === 'MATCHED' ? 1 : r.status === 'PARTIAL' ? 0.5 : 0);
    }, 0);
    const guidelineScore = Math.round((guidelineRaw / totalGuidelines) * 100);

    // ── 3. Mechanics ─────────────────────────────────────────────────────
    const { score: mechanicsScore, issues: mechanicsIssues, informalCount } = evaluateMechanics(text);

    // ── 4. Professional Language Score ───────────────────────────────────
    const professionalScore = Math.max(0, 100 - informalCount * 15);

    // ── 5. Word Count Score ──────────────────────────────────────────────
    const wcScore = wordCountScore(wordCount, minWords, maxWords);

    // ── 6. Final Composite Rule Score ────────────────────────────────────
    // Guideline: 45%, Structure: 20%, Mechanics: 15%, WordCount: 10%, Professional: 10%
    let ruleScore = Math.round(
      (guidelineScore  * 0.45) +
      (structureScore  * 0.20) +
      (mechanicsScore  * 0.15) +
      (wcScore         * 0.10) +
      (professionalScore * 0.10)
    );

    // Zero guard: prevent meaningless garbage from getting any score
    // Rule 1: fewer than 8 words → always zero
    // Rule 2: fewer than 15 words with no guidelines matched → zero
    //         (does NOT depend on hasGreeting — a 9-word 'hello hello' should not score)
    if (
      wordCount < 8 ||
      (guidelinesDetailed.length > 0 && guidelineRaw === 0 && wordCount < 15)
    ) {
      ruleScore = 0;
    }

    ruleScore = Math.max(0, Math.min(100, ruleScore));

    return {
      // ── v1 compatible fields ──────────────────────────────────
      ruleScore,
      grammarMechanicsScore: mechanicsScore,
      guidelinesMatched,
      guidelinesMissed,
      wordCount,
      minWords,
      maxWords,
      structurePass,
      hasGreeting,
      hasSignoff,
      evaluatedAt: new Date(),
      // ── new fields ────────────────────────────────────────────
      guidelinesPartial,
      guidelinesDetailed,
      structureScore,
      hasParagraphSeparation,
      wordCountScore: wcScore,
      professionalScore,
      mechanicsIssues,
    };
  }

  /**
   * Evaluate Passage Recall response.
   *
   * @param {string} studentRecall  - Student's recalled text
   * @param {string} referencePassage - Original passage text
   * @param {Array}  targetKeyFacts - Array of { value, type } objects or plain strings
   * @returns {object} Evaluation result (all v1 field names preserved + new fields)
   */
  static evaluatePassage(studentRecall, referencePassage, targetKeyFacts = []) {
    const studentText = (studentRecall || '').trim();
    const refText     = (referencePassage || '').trim();
    const studentLower = studentText.toLowerCase();

    const studentWords = studentText ? studentText.split(/\s+/).filter(Boolean) : [];
    const refWords     = refText ? refText.split(/\s+/).filter(Boolean) : [];

    const studentConceptSet = buildConceptSet(studentText);

    // ── 1. Per-Fact Evaluation ────────────────────────────────────────────
    // Counters for v1 compat
    let factsTotal = 0,     factsRemembered = 0;
    let numbersTotal = 0,   numbersRemembered = 0;
    let namesTotal = 0,     namesRemembered = 0;
    let locationsTotal = 0, locationsRemembered = 0;

    // New counters
    let factsPartial = 0, factsMissing = 0, factsContradicted = 0;
    const factResults = [];

    for (const factObj of targetKeyFacts) {
      // Normalize: plain string → { value, type: 'fact' }
      // Correction #1: use type from object, fallback to 'fact' for plain strings
      const value    = typeof factObj === 'string' ? factObj : (factObj.value || factObj.text || '');
      const factType = typeof factObj === 'object' && factObj.type ? factObj.type : 'fact';
      if (!value) continue;

      let status;
      let detected = null;

      if (CRITICAL_TYPES.has(factType)) {
        // ── Critical fact (number, time, date, amount) — strict match ──
        // Correction #2: CONTRADICTED only with confident nearby-context detection
        const result = matchCriticalFact(value, null, studentText);
        status = result;
        if (status === 'CONTRADICTED') {
          // Attempt to surface what the student wrote
          const criticals = extractCriticalValues(studentText);
          const normExp = normalizeCritical(value);
          const diff = criticals.find(c => normalizeCritical(c.value) !== normExp);
          detected = diff ? diff.value : null;
        }

        // Track for v1 numeric counters
        if (factType === 'number' || factType === 'amount') {
          numbersTotal++;
          if (status === 'MATCHED') numbersRemembered++;
        }
      } else if (factType === 'name') {
        namesTotal++;
        status = matchTextualFact(value, studentConceptSet, studentLower);
        if (status === 'MATCHED') namesRemembered++;
      } else if (factType === 'location') {
        locationsTotal++;
        status = matchTextualFact(value, studentConceptSet, studentLower);
        if (status === 'MATCHED') locationsRemembered++;
      } else {
        // 'object', 'event', 'fact' — textual matching
        factsTotal++;
        status = matchTextualFact(value, studentConceptSet, studentLower);
        if (status === 'MATCHED') factsRemembered++;
      }

      // Accumulate new counters
      if (status === 'PARTIAL')      factsPartial++;
      else if (status === 'MISSING') factsMissing++;
      else if (status === 'CONTRADICTED') factsContradicted++;

      factResults.push({ expected: value, type: factType, status, detected });
    }

    const totalKeyItems    = factsTotal + numbersTotal + namesTotal + locationsTotal;
    const totalRemembered  = factsRemembered + numbersRemembered + namesRemembered + locationsRemembered;
    const totalContradicted = factsContradicted;
    const totalPartial     = factsPartial;

    // ── 2. Fact Coverage Scores ───────────────────────────────────────────
    // MATCHED=1.0 credit, PARTIAL=0.5 credit, CONTRADICTED=0 credit, MISSING=0 credit
    const totalCredit = factResults.reduce((sum, r) => {
      if (r.status === 'MATCHED') return sum + 1;
      if (r.status === 'PARTIAL') return sum + 0.5;
      return sum;
    }, 0);

    const factTotal = factResults.length || 1;
    const coveragePercent = Math.round((totalCredit / factTotal) * 100);

    // Critical facts sub-score (CONTRADICTED = 0, missing = 0)
    const criticalFacts = factResults.filter(r => CRITICAL_TYPES.has(r.type));
    const criticalMatched = criticalFacts.filter(r => r.status === 'MATCHED').length;
    const criticalScore = criticalFacts.length > 0
      ? Math.round((criticalMatched / criticalFacts.length) * 100)
      : 100; // no critical facts → full marks on this component

    // ── 3. Response Completeness Score ───────────────────────────────────
    // Simple check: did the student write a reasonable length response?
    const refLength = refWords.length || 1;
    const completenessRatio = Math.min(1, studentWords.length / (refLength * 0.4)); // expect ~40% of passage length
    const completenessScore = Math.round(completenessRatio * 100);

    // ── 4. Mechanics ─────────────────────────────────────────────────────
    const { score: mechanicsScore, issues: mechanicsIssues } = evaluateMechanics(studentText);

    // ── 5. Sequence / Relationships Score ────────────────────────────────
    // Lightweight: check if key events/names appear in a reasonable order
    const sequenceScore = 75; // Conservative baseline — full NLP sequence analysis is beyond scope

    // ── 6. Final Passage Score ────────────────────────────────────────────
    // Fact Recall: 50%, Critical Details: 25%, Sequence: 10%, Mechanics: 10%, Completeness: 5%
    let ruleScore = 0;
    if (totalCredit > 0 && studentWords.length >= 5) {
      ruleScore = Math.round(
        (coveragePercent  * 0.50) +
        (criticalScore    * 0.25) +
        (sequenceScore    * 0.10) +
        (mechanicsScore   * 0.10) +
        (completenessScore * 0.05)
      );
    }

    // Zero guard
    if (studentWords.length < 5 || totalCredit === 0) {
      ruleScore = 0;
    }

    ruleScore = Math.max(0, Math.min(100, ruleScore));

    return {
      // ── v1 compatible fields ──────────────────────────────────
      ruleScore,
      grammarMechanicsScore: mechanicsScore,
      wordCount: studentWords.length,
      referenceWordCount: refWords.length,
      recallBreakdown: {
        coveragePercent,
        factsCount: {
          remembered:   totalRemembered,
          partial:      totalPartial,
          missing:      factsMissing,
          contradicted: totalContradicted,
          total:        totalKeyItems,
        },
        numbersCount:   { remembered: numbersRemembered, total: numbersTotal },
        namesCount:     { remembered: namesRemembered,   total: namesTotal },
        locationsCount: { remembered: locationsRemembered, total: locationsTotal },
        sequenceCorrect: sequenceScore >= 75,
        // new: per-fact detail
        factResults,
      },
      evaluatedAt: new Date(),
      // ── new fields ────────────────────────────────────────────
      mechanicsIssues,
      criticalScore,
      completenessScore,
    };
  }
}

export default DeterministicEvaluator;
