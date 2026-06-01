const languageRules = `
语言与术语规范：
1. 请使用中文回答。
2. 不要大段堆砌文字，每个字段都要短、清晰、适合前端卡片展示。
3. 专业术语第一次出现时必须使用“中文 + 英文括注”，例如：缓存未命中（cache miss）、缓存行（cache line）、局部性（locality）、栈帧（stack frame）、指针（pointer）、时间复杂度（time complexity）。
4. 面向 CSAPP 和数据结构学习场景，解释要帮助学生建立理解框架，而不是直接给一段泛泛答案。
5. 输出必须是结构化 JSON，便于 React 前端展示。
`;

const modeInstructions = {
  context_stacking: `
模式：Context Stacking 超前学习。
请输出：本周 5 个核心概念、与上周内容的联系、课堂验证清单、补漏清单、出题人区分点。
`,
  after_class_review: `
模式：课后深度复习。
请输出：页码、核心概念、本质解释、前后关联、考点、易错点、主动追问、用户尝试题。
`,
  examiner_perspective: `
模式：出题人视角。
请输出：题目考点、出题意图、表层理解陷阱、底层逻辑、迁移题。
`,
  feynman: `
模式：费曼反讲。
请输出：用户解释准确部分、最大偏差、为什么偏差重要、12 岁小孩也能懂的解释、反问题。
`,
  multi_source_collision: `
模式：多维信息对撞。
请输出：资料 A/B/C 观点、冲突点、证据强弱、可采纳结论、保留怀疑点。
`,
};

const jsonContract = `
只返回 JSON，不要使用 markdown 代码块。
尽量使用这个顶层结构：
{
  "topic": "中文主题，术语带英文括注",
  "summary": "中文摘要",
  "coreConcepts": [{"name":"中文术语（English term）","simpleExplanation":"中文解释","essence":"中文本质","relatedConcepts":["中文术语（English term）"]}],
  "whyThisMatters": "为什么要学",
  "contextRelation": {"previous":"前置知识","current":"当前作用","next":"后续连接"},
  "examFocus": ["中文考点"],
  "engineeringUse": ["中文工程应用"],
  "pitfalls": ["中文易错点"],
  "guidedQuestions": [{"id":"q_1","type":"exam|engineering|context|bottom_logic","typeLabel":"中文类型","question":"中文问题","reason":"中文理由","pageNumber":12,"concept":"中文概念（English term）"}],
  "userTask": {"question":"中文尝试题","expectedKeyPoints":["中文要点"]},
  "modeSpecific": {"type":"模式 id","title":"中文标题"}
}
`;

export function buildPromptContext(input) {
  return {
    subject: input.subject,
    mode: input.mode,
    preferences: input.preferences || [],
    pageNumber: input.pageNumber,
    materialText: input.materialText || '',
    previousQuestions: input.previousQuestions || [],
  };
}

export function buildAnalyzePrompt(input) {
  const context = buildPromptContext(input);

  return [
    systemPrompt(),
    languageRules,
    modeInstructions[context.mode] || modeInstructions.after_class_review,
    jsonContract,
    `学科：${context.subject}`,
    `学习偏好：${context.preferences.join('、') || '无'}`,
    `PPT 页码：${context.pageNumber || '未提供'}`,
    `学习材料：\n${context.materialText}`,
  ].join('\n\n');
}

export function buildDeepDivePrompt(input) {
  return [
    systemPrompt(),
    languageRules,
    '请回答用户选中的主动追问，保持中文、结构化、短段落。',
    '返回 JSON：{"answer":"中文回答","keyPoints":["中文要点"],"followUpQuestions":[{"id":"follow_1","type":"bottom_logic","question":"中文追问"}]}',
    `学科：${input.subject}`,
    `模式：${input.mode}`,
    `问题：${input.question?.question || input.question}`,
    `材料：\n${input.materialText || ''}`,
  ].join('\n\n');
}

export function buildDiagnosePrompt(input) {
  return [
    systemPrompt(),
    languageRules,
    '请诊断用户回答，必须引用用户原回答，指出一个最关键偏差，并给出强化题。',
    '返回 JSON：{"errorType":"中文错误类型","quotedIssue":"引用用户回答","whatIsCorrect":"正确部分","mainProblem":"主要问题","whyItMatters":"为什么重要","suggestion":"修改建议","reinforcementTask":"强化题"}',
    `学科：${input.subject}`,
    `模式：${input.mode}`,
    `问题：${input.question?.question || input.question}`,
    `用户回答：\n${input.userAttempt}`,
  ].join('\n\n');
}

export function buildObsidianPrompt(input) {
  return [
    systemPrompt(),
    languageRules,
    '请生成中文 Obsidian Markdown，包含 wikilink、[!summary]、[!question]、[!warning] 和 PPT 页码来源。',
    '返回 JSON：{"obsidianMarkdown":"中文 Markdown 字符串"}',
    `当前解析 JSON：\n${JSON.stringify(input.analysis || {}, null, 2)}`,
  ].join('\n\n');
}

export function buildCollisionPrompt(input) {
  return [
    systemPrompt(),
    languageRules,
    modeInstructions.multi_source_collision,
    '返回 JSON：{"sourceSummaries":[{"source":"A","coreView":"中文观点"}],"conflicts":["中文冲突点"],"evidenceComparison":["中文证据强弱"],"adoptableConclusions":["中文可采纳结论"],"openDoubts":["中文保留怀疑点"],"learningValue":"中文学习价值"}',
    `学科：${input.subject}`,
    `资料 A：\n${input.sourceA}`,
    `资料 B：\n${input.sourceB}`,
    `资料 C：\n${input.sourceC}`,
  ].join('\n\n');
}

function systemPrompt() {
  return [
    '你是 ScaffoldMind 明序，一个面向 CSAPP 和数据结构学习场景的 AI 学习助手。',
    '请使用中文回答，不要大段堆砌文字。',
    '专业术语第一次出现时给出英文括注。',
    '输出要结构化，适合前端展示。',
    '你的目标是搭建认知脚手架，而不是替用户直接背答案。',
  ].join(' ');
}
