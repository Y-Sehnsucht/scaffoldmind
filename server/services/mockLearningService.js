/**
 * Mock / Fallback Learning Service
 *
 * Generates structured learning data based on the user's ACTUAL input material.
 * Used when no AI API key is configured, or when the AI call fails.
 *
 * Key principle: NEVER return hardcoded topic-specific content.
 * Always extract and reflect the user's actual material.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract a short topic from the material text.
 * Takes the first meaningful line or phrase.
 */
function extractTopic(materialText, materialFields) {
  // If materialFields has a title, use it
  if (materialFields?.title?.trim()) {
    return materialFields.title.trim();
  }

  const text = String(materialText || '').trim();
  if (!text) return '未命名主题';

  // Take first line, truncate to 30 chars for a concise topic
  const firstLine = text.split(/[\n\r]+/).find((l) => l.trim().length > 0) || text;
  const cleaned = firstLine.trim().replace(/^#+\s*/, ''); // strip markdown headings
  const maxLen = 30;
  if (cleaned.length <= maxLen) return cleaned;
  // Try to cut at a natural boundary
  const cut = cleaned.lastIndexOf(' ', maxLen);
  if (cut > maxLen * 0.5) return cleaned.slice(0, cut) + '…';
  return cleaned.slice(0, maxLen) + '…';
}

/**
 * Detect if text is primarily English (Latin characters dominant).
 */
function isPrimarilyEnglish(text) {
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  return latin > cjk * 2;
}

/**
 * Extract key terms from material text.
 * Handles both Chinese and English text differently.
 */
function extractKeyTerms(materialText) {
  const text = String(materialText || '');
  const terms = new Set();

  // Extract terms in Chinese/English parentheses: 缓存（cache）→ 缓存, cache
  // Pattern 1: Chinese term + (English term) — most common in Chinese academic text
  // e.g. 缓存未命中（cache miss）→ "缓存未命中", "cache miss"
  // The Chinese part must start with a CJK character and not contain sentence-ending punctuation
  const parenMatches = text.matchAll(/([\u4e00-\u9fff][\u4e00-\u9fff\w]*?)[（(]([A-Za-z0-9\s\-_.+/]+)[)）]/g);
  for (const m of parenMatches) {
    const before = m[1].trim();
    const inside = m[2].trim();
    // Skip if the "Chinese" part contains sentence-ending punctuation (。！？)
    if (before.match(/[。！？；;]/)) continue;
    // Skip if the Chinese part is too long (likely not a term)
    if (before.length > 15) continue;
    if (before.length >= 2) terms.add(before);
    if (inside.length >= 2 && inside.length <= 30) terms.add(inside);
  }

  // Pattern 2: English term + (Chinese explanation) — less common but possible
  // Strict: English part must be a single word or hyphenated term (no spaces with punctuation)
  const enCnMatches = text.matchAll(/([A-Za-z][A-Za-z0-9\-+_]{1,20})[（(]([\u4e00-\u9fff]{2,10})[)）]/g);
  for (const m of enCnMatches) {
    const before = m[1].trim();
    const inside = m[2].trim();
    if (before.length >= 2) terms.add(before);
    if (inside.length >= 2) terms.add(inside);
  }

  // Extract quoted terms: "xxx" or 「xxx」
  const quoteMatches = text.matchAll(/[""「]([^""」]+)[""」]/g);
  for (const m of quoteMatches) {
    if (m[1].trim().length > 1 && m[1].trim().length < 30) {
      terms.add(m[1].trim());
    }
  }

  // Extract terms after bullet markers: - xxx / • xxx / 1. xxx
  const bulletMatches = text.matchAll(/[-•*]\s+([^\n]{2,30})/g);
  for (const m of bulletMatches) {
    const t = m[1].trim().replace(/[：:，,。.；;！!？?]+$/, '');
    if (t.length > 1 && t.length < 30) terms.add(t);
  }

  // If we already have terms from parentheses/quotes/bullets, return them
  if (terms.size > 0) {
    return [...terms].slice(0, 6);
  }

  // No structured terms found — use language-aware extraction
  if (isPrimarilyEnglish(text)) {
    // English: extract capitalized phrases and noun chunks
    // 1. Capitalized multi-word phrases (e.g. "Cache Miss", "Memory Hierarchy")
    const capPhrases = text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g);
    for (const m of capPhrases) {
      if (m[1].length > 2 && m[1].length < 30) terms.add(m[1]);
    }

    // 2. Important single words (longer than 4 chars, not common words)
    const stopWords = new Set(['about', 'above', 'after', 'again', 'also', 'because', 'before', 'between', 'both', 'could', 'every', 'first', 'from', 'have', 'here', 'into', 'just', 'like', 'more', 'much', 'must', 'never', 'only', 'other', 'over', 'same', 'should', 'some', 'such', 'than', 'that', 'their', 'there', 'these', 'this', 'those', 'through', 'under', 'very', 'what', 'when', 'where', 'which', 'while', 'will', 'with', 'would', 'your']);
    const words = text.matchAll(/\b([a-zA-Z]{4,})\b/g);
    const wordFreq = {};
    for (const m of words) {
      const w = m[1].toLowerCase();
      if (!stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
    // Take most frequent meaningful words
    const frequentWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([w]) => w);
    for (const w of frequentWords) {
      // Skip if a case-variant already exists (e.g. skip "cache" if "Cache" exists)
      const alreadyExists = [...terms].some((t) => t.toLowerCase() === w.toLowerCase());
      if (!alreadyExists) terms.add(w);
    }
  } else {
    // Chinese: split by sentences and take first few key phrases
    const sentences = text.split(/[。\n\r！？；]+/).filter((s) => s.trim().length > 2);
    for (const s of sentences.slice(0, 3)) {
      const short = s.trim().slice(0, 20);
      if (short.length > 1) terms.add(short);
    }
  }

  return [...terms].slice(0, 6);
}

/**
 * Extract a short summary from the material.
 */
function extractSummary(materialText, subject) {
  const text = String(materialText || '').trim();
  if (!text) return `结构化降级解析：已基于 ${subject || '未知科目'} 生成学习框架。`;

  // Take first 2 sentences or 80 chars
  const sentences = text.split(/[。\n\r!?！？]+/).filter((s) => s.trim().length > 0);
  const firstTwo = sentences.slice(0, 2).join('。');
  if (firstTwo.length > 80) return firstTwo.slice(0, 80) + '…';
  return firstTwo || text.slice(0, 80);
}

/**
 * Build guided questions based on actual material content.
 */
function buildDynamicGuidedQuestions(materialText, keyTerms, pageNumber, mode) {
  const text = String(materialText || '').trim();
  const topic = keyTerms[0] || extractTopic(text, {});
  const secondTerm = keyTerms[1] || '相关概念';

  const questionTemplates = {
    exam: {
      type: 'exam',
      typeLabel: '考试常考型',
      question: `考试中会如何考察「${topic}」的定义和原理？`,
      reason: '检验对核心概念的准确理解。',
    },
    engineering: {
      type: 'engineering',
      typeLabel: '工程应用型',
      question: `「${topic}」在实际工程或代码中如何体现？`,
      reason: '把课程概念连接到真实应用场景。',
    },
    context: {
      type: 'context',
      typeLabel: '上下文补全型',
      question: `「${topic}」和「${secondTerm}」之间有什么内在联系？`,
      reason: '补齐前后知识点之间的链条。',
    },
    logic: {
      type: 'bottom_logic',
      typeLabel: '底层逻辑型',
      question: `「${topic}」背后的根本原因或设计取舍是什么？`,
      reason: '逼近概念背后的根本原因。',
    },
  };

  return Object.entries(questionTemplates).map(([key, tmpl], i) => ({
    id: `mock_q_${key}`,
    type: tmpl.type,
    typeLabel: tmpl.typeLabel,
    question: tmpl.question,
    reason: tmpl.reason,
    pageNumber,
    concept: keyTerms[i] || topic,
  }));
}

// ─── Main Exports ────────────────────────────────────────────────────────────

export function buildMockAnalysis(body) {
  const materialText = String(body.materialText || '').trim();
  const materialFields = body.materialFields || {};
  const pageNumber = Number(body.pageNumber || 1);
  const mode = body.mode || 'after_class_review';
  const subject = body.subject || '未知科目';
  const preferences = body.preferences || [];

  const topic = extractTopic(materialText, materialFields);
  const keyTerms = extractKeyTerms(materialText);
  const summary = extractSummary(materialText, subject);
  const guidedQuestions = buildDynamicGuidedQuestions(materialText, keyTerms, pageNumber, mode);

  // Build core concepts from extracted terms
  const coreConcepts = keyTerms.length > 0
    ? keyTerms.slice(0, 3).map((term) => ({
        name: term,
        simpleExplanation: `材料中提到的核心概念：${term}。`,
        essence: `「${term}」是理解本节内容的关键。`,
        relatedConcepts: keyTerms.filter((t) => t !== term).slice(0, 3),
      }))
    : [
        {
          name: topic,
          simpleExplanation: `本节材料的核心主题。`,
          essence: `理解「${topic}」是掌握本节内容的基础。`,
          relatedConcepts: [],
        },
      ];

  // Ensure guidedQuestions always has valid concept references
  const questionConcepts = keyTerms.length > 0 ? keyTerms : [topic];

  // Build context relation from material
  const contextRelation = {
    previous: keyTerms[1] ? `承接「${keyTerms[1]}」。` : '承接前节内容。',
    current: `理解「${topic}」的核心机制。`,
    next: keyTerms[2] ? `引出「${keyTerms[2]}」。` : '引出后续应用。',
  };

  // Build exam focus from key terms
  const examFocus = keyTerms.length > 0
    ? keyTerms.slice(0, 3).map((t) => `理解「${t}」的定义和原理`)
    : [`理解「${topic}」的核心要点`];

  // Build engineering use
  const engineeringUse = keyTerms.length > 0
    ? [`${keyTerms[0]}在实际工程中的应用`, '将概念转化为可操作的实践']
    : [`将「${topic}」应用到实际场景`];

  // Build pitfalls
  const pitfalls = [
    `只背「${topic}」的定义但不会推理`,
    keyTerms.length > 1 ? `混淆「${keyTerms[0]}」和「${keyTerms[1]}」` : '混淆相关概念',
  ];

  // Build user task
  const userTask = {
    question: `请用自己的话解释「${topic}」的核心原理。`,
    expectedKeyPoints: keyTerms.length > 0
      ? keyTerms.slice(0, 3)
      : [topic, '核心原理', '应用场景'],
  };

  return {
    pageNumber,
    mode,
    topic,
    summary: `结构化降级解析：${summary}`,
    coreConcepts,
    whyThisMatters: `理解「${topic}」有助于建立完整的知识体系。`,
    contextRelation,
    examFocus,
    engineeringUse,
    pitfalls,
    guidedQuestions,
    userTask,
    pageText: materialText,
    modeSpecific: buildModeSpecific(mode, pageNumber, topic, keyTerms, preferences),
  };
}

export function buildMockDeepDive(body) {
  const question = body.question || {};
  const materialText = String(body.materialText || '').trim();
  const keyTerms = extractKeyTerms(materialText);
  const topic = keyTerms[0] || question.concept || '本节内容';

  return {
    questionId: question.id || 'mock_q_selected',
    answer: `关于「${question.question || topic}」：需要从概念定义出发，逐步推进到原理机制和应用场景。材料中提到的「${topic}」是理解这个问题的关键线索。`,
    keyPoints: ['定位核心概念', '说明底层原理', '连接考试或工程场景'],
    followUpQuestions: [
      {
        id: 'mock_follow_up',
        type: 'bottom_logic',
        question: `「${topic}」背后的设计取舍或根本原因是什么？`,
      },
    ],
    historyItem: {
      id: `qh_${Date.now()}`,
      question: question.question,
      pageNumber: question.pageNumber || body.pageNumber || 1,
      concept: question.concept || topic,
      status: 'answered',
    },
  };
}

export function buildMockDiagnosis(body) {
  const materialText = String(body.materialText || '').trim();
  const keyTerms = extractKeyTerms(materialText);
  const topic = keyTerms[0] || '本节内容';
  const userAttempt = String(body.userAttempt || '').trim();

  return {
    errorType: '理解不完整',
    quotedIssue: userAttempt || '（未提供回答）',
    whatIsCorrect: `你已经尝试用自己的话解释「${topic}」。`,
    mainProblem: userAttempt
      ? `回答还没有讲清「${topic}」的核心原理和因果链。`
      : `还没有提供对「${topic}」的理解。`,
    whyItMatters: '如果缺少因果链，遇到变形题或应用题时就无法迁移。',
    suggestion: `先说明「${topic}」是什么，再解释为什么，最后补上应用场景。`,
    reinforcementTask: `尝试用类比或举例的方式重新解释「${topic}」。`,
  };
}

export function buildMockObsidian(body) {
  const analysis = body.analysis || {};
  const topic = analysis.topic || '未命名主题';
  const pageNumber = analysis.pageNumber || body.pageNumber || 1;
  const keyTerms = analysis.coreConcepts?.map((c) => c.name) || [topic];

  const conceptLinks = keyTerms.map((t) => `- [[${t}]]`).join('\n');
  const examItems = (analysis.examFocus || ['核心概念']).slice(0, 3).map((e) => `- ${e}`).join('\n');
  const pitfallItems = (analysis.pitfalls || ['只背定义']).slice(0, 2).map((p) => `- ${p}`).join('\n');

  return {
    obsidianMarkdown: `# [[${topic}]]

> [!summary] 核心本质
> ${analysis.coreConcepts?.[0]?.essence || `理解「${topic}」是掌握本节内容的关键。`}

> [!question] 主动追问
> ${analysis.guidedQuestions?.[2]?.question || `「${topic}」和相关概念之间有什么联系？`}

> [!warning] 易错点
${pitfallItems}

## 相关概念
${conceptLinks}

## 考试重点
${examItems}

## 来源
- PPT 第 ${pageNumber} 页`,
  };
}

export function buildMockCollision(body) {
  const sourceA = String(body.sourceA || '').trim();
  const sourceB = String(body.sourceB || '').trim();
  const sourceC = String(body.sourceC || '').trim();

  const hasA = sourceA.length > 0;
  const hasB = sourceB.length > 0;

  return {
    sourceSummaries: [
      { source: 'A', coreView: hasA ? sourceA.slice(0, 60) : '资料 A 的核心观点。' },
      { source: 'B', coreView: hasB ? sourceB.slice(0, 60) : '资料 B 的核心观点。' },
      { source: 'C', coreView: sourceC.length > 0 ? sourceC.slice(0, 60) : '补充视角或反面观点。' },
    ],
    conflicts: hasA && hasB ? ['不同资料对同一概念的侧重点不同。'] : ['需要更多资料才能发现观点冲突。'],
    evidenceComparison: ['不同来源的论证强度和适用范围不同。'],
    adoptableConclusions: ['综合多资料建立更完整的理解。'],
    openDoubts: ['缺少更多证据时，保留判断。'],
    learningValue: '帮助区分不同来源的观点、证据强度和适用范围。',
  };
}

// ─── Mode-Specific Builder ───────────────────────────────────────────────────

function buildModeSpecific(mode, pageNumber, topic, keyTerms, preferences) {
  const common = {
    type: mode,
    title: '结构化降级输出',
  };

  const prefLabel = preferences?.length > 0
    ? `（偏好：${preferences.join('、')}）`
    : '';

  if (mode === 'context_stacking') {
    return {
      ...common,
      weeklyCoreConcepts: keyTerms.slice(0, 3),
      connectionToLastWeek: [`从「${topic}」连接到本周内容。`],
      classroomValidationChecklist: ['观察老师是否强调核心概念之间的联系。'],
      gapChecklist: [`补齐「${topic}」的前置知识。`],
      examinerDistinction: [`能否解释「${topic}」的因果链。`],
    };
  }

  if (mode === 'examiner_perspective') {
    return {
      ...common,
      testedPoints: keyTerms.slice(0, 3).map((t) => `「${t}」的定义和原理`),
      examinerIntent: `区分背定义和能解释「${topic}」因果链的学生。`,
      surfaceTraps: [`只说「${topic}」的定义但不解释原因。`],
      underlyingLogic: `理解「${topic}」的核心机制和适用条件。`,
      transferQuestions: [`将「${topic}」应用到新场景。`],
    };
  }

  if (mode === 'feynman') {
    return {
      ...common,
      accurateParts: [`知道「${topic}」的基本含义。`],
      biggestDeviation: '可能缺少深层原理的解释。',
      whyDeviationMatters: '缺少迁移能力，遇到变形题无法应对。',
      twelveYearOldExplanation: `用生活中的例子解释「${topic}」。`,
      checkingQuestion: `你能用自己的话解释「${topic}」为什么重要吗？`,
    };
  }

  if (mode === 'multi_source_collision') {
    return {
      ...common,
      sourceViews: [{ source: '资料 A', view: `关注「${topic}」的某一方面。` }],
      conflicts: ['不同资料对同一概念的侧重点不同。'],
      evidenceStrength: ['需要对比不同来源的论证。'],
      adoptableConclusions: ['综合多资料建立更完整的理解。'],
      doubtsToKeep: ['缺少更多证据时保留判断。'],
    };
  }

  // Default: after_class_review
  return {
    ...common,
    pageNumber,
    coreConcepts: keyTerms.slice(0, 3).map((t) => ({ name: t })),
    essenceExplanation: [`「${topic}」是本节的核心${prefLabel}。`],
    contextRelation: {
      previous: keyTerms[1] || '前节内容',
      current: topic,
      next: keyTerms[2] || '后续应用',
    },
    examFocus: keyTerms.slice(0, 2).map((t) => `「${t}」的定义和原理`),
    pitfalls: [`只背「${topic}」定义`],
    guidedQuestions: buildDynamicGuidedQuestions('', keyTerms, pageNumber, mode),
  };
}
