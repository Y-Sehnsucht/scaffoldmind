/**
 * Prompt Builder — ScaffoldMind 明序
 *
 * Generates system + user prompts for AI calls.
 * Key design decisions:
 * - System prompt is discipline-agnostic (no CSAPP hardcoding)
 * - system/user role separation for better AI comprehension
 * - Few-shot example to demonstrate expected output format
 * - Simplified JSON contract: only core fields required, rest optional
 */

// ─── System Prompt ──────────────────────────────────────────────────────────

function buildSystemPrompt(subject) {
  const subjectHint = subject && subject !== 'CSAPP'
    ? `你特别擅长${subject}领域的知识拆解。`
    : '你擅长各类学科的知识拆解。';

  return `你是 ScaffoldMind 明序，一个结构化学习助手。${subjectHint}
你的核心能力是从课程材料中提取核心知识，搭建认知脚手架，而不是替用户直接背答案。
请使用中文回答，专业术语第一次出现时给出英文括注，例如：线性映射（linear mapping）、逆矩阵（inverse matrix）。
输出必须是结构化 JSON，便于 React 前端展示。每个字段要短、清晰、适合前端卡片展示，不要大段堆砌文字。`;
}

// ─── Mode Instructions ──────────────────────────────────────────────────────

const modeInstructions = {
  context_stacking: `当前学习模式：Context Stacking 超前学习。
请重点输出：本周核心概念、与上周内容的联系、课堂验证清单、补漏清单、出题人区分点。`,

  after_class_review: `当前学习模式：课后深度复习。
请重点输出：核心概念及本质解释、前后关联、考点、易错点、主动追问、用户尝试题。`,

  examiner_perspective: `当前学习模式：出题人视角。
请重点输出：题目考点、出题意图、表层理解陷阱、底层逻辑、迁移题。`,

  feynman: `当前学习模式：费曼反讲。
请重点输出：用户解释准确部分、最大偏差、为什么偏差重要、12 岁小孩也能懂的解释、反问题。`,

  multi_source_collision: `当前学习模式：多维信息对撞。
请重点输出：资料 A/B/C 观点、冲突点、证据强弱、可采纳结论、保留怀疑点。`,
};

// ─── JSON Contract ──────────────────────────────────────────────────────────

const jsonContract = `只返回 JSON，不要使用 markdown 代码块（不要 \`\`\`json）。

必须包含以下字段：
{
  "topic": "中文主题，术语带英文括注",
  "summary": "1-2 句中文摘要",
  "coreConcepts": [
    {
      "name": "中文术语（English term）",
      "simpleExplanation": "用简单的话解释这个概念",
      "essence": "这个概念的本质是什么",
      "relatedConcepts": ["相关概念1", "相关概念2"]
    }
  ]
}

以下字段可选但推荐（如果材料中有相关信息，请尽量输出）：
{
  "whyThisMatters": "为什么要学这个",
  "contextRelation": {"previous":"前置知识","current":"当前作用","next":"后续连接"},
  "examFocus": ["考试常考点"],
  "engineeringUse": ["工程或实际应用"],
  "pitfalls": ["常见易错点"],
  "guidedQuestions": [
    {"id":"q_1","type":"exam","typeLabel":"考试常考型","question":"具体问题","reason":"为什么问这个","concept":"相关概念"}
  ],
  "userTask": {"question":"让用户尝试回答的问题","expectedKeyPoints":["期望的关键要点"]},
  "modeSpecific": {"type":"模式id","title":"中文标题", ...模式专属字段}
}`;

// ─── Few-shot Example ───────────────────────────────────────────────────────

const fewShotExample = `示例（输入 → 输出）：

输入材料："TCP三次握手（Three-way Handshake）是建立可靠连接的基础。客户端发送SYN，服务端回复SYN+ACK，客户端再发ACK确认。"

输出：
{
  "topic": "TCP三次握手（Three-way Handshake）",
  "summary": "TCP通过三次握手建立可靠连接：SYN → SYN+ACK → ACK。",
  "coreConcepts": [
    {
      "name": "三次握手（Three-way Handshake）",
      "simpleExplanation": "TCP建立连接时，客户端和服务端交换三次消息来确认双方收发能力。",
      "essence": "本质是双方互相确认对方的收发能力，确保连接可靠。",
      "relatedConcepts": ["SYN", "ACK", "可靠连接"]
    },
    {
      "name": "SYN",
      "simpleExplanation": "同步标志位，发起连接的一方发送，表示请求建立连接。",
      "essence": "本质是通信双方同步初始序列号。",
      "relatedConcepts": ["三次握手", "ACK"]
    }
  ],
  "whyThisMatters": "三次握手是TCP可靠传输的基础，不理解它就无法排查连接问题。",
  "examFocus": ["三次握手的流程和每步的作用", "为什么是三次而不是两次"],
  "pitfalls": ["混淆SYN和ACK的作用", "认为两次握手就够了"],
  "guidedQuestions": [
    {"id":"q_1","type":"exam","typeLabel":"考试常考型","question":"为什么TCP需要三次握手而不是两次？","reason":"考察对可靠连接本质的理解","concept":"三次握手"}
  ],
  "userTask": {"question":"请用自己的话解释三次握手中每一步的作用。","expectedKeyPoints":["SYN确认客户端发送能力","SYN+ACK确认服务端收发能力","ACK确认客户端接收能力"]}
}`;

// ─── Prompt Builders ────────────────────────────────────────────────────────

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

/**
 * Build analyze prompt — returns { systemPrompt, userPrompt } for role separation.
 */
export function buildAnalyzePrompt(input) {
  const context = buildPromptContext(input);

  const system = [
    buildSystemPrompt(context.subject),
    jsonContract,
    fewShotExample,
  ].join('\n\n');

  const modeInstruction = modeInstructions[context.mode] || modeInstructions.after_class_review;

  const userParts = [
    modeInstruction,
    `学科：${context.subject}`,
  ];

  if (context.preferences.length > 0) {
    userParts.push(`学习偏好：${context.preferences.join('、')}`);
  }

  if (context.pageNumber) {
    userParts.push(`页码：${context.pageNumber}`);
  }

  userParts.push(`学习材料：\n${context.materialText}`);

  const user = userParts.join('\n\n');

  return { systemPrompt: system, userPrompt: user };
}

/**
 * Build deep dive prompt — returns { systemPrompt, userPrompt }.
 */
export function buildDeepDivePrompt(input) {
  const system = [
    buildSystemPrompt(input.subject),
    '请回答用户选中的主动追问，保持中文、结构化、短段落。',
    '返回 JSON：{"answer":"中文回答","keyPoints":["中文要点"],"followUpQuestions":[{"id":"follow_1","type":"bottom_logic","question":"中文追问"}]}',
  ].join('\n\n');

  const user = [
    `学科：${input.subject}`,
    `模式：${input.mode}`,
    `问题：${input.question?.question || input.question}`,
    input.materialText ? `参考材料：\n${input.materialText}` : null,
  ].filter(Boolean).join('\n\n');

  return { systemPrompt: system, userPrompt: user };
}

/**
 * Build diagnose prompt — returns { systemPrompt, userPrompt }.
 */
export function buildDiagnosePrompt(input) {
  const system = [
    buildSystemPrompt(input.subject),
    '请诊断用户回答，必须引用用户原回答，指出一个最关键偏差，并给出强化题。',
    '返回 JSON：{"errorType":"中文错误类型","quotedIssue":"引用用户回答","whatIsCorrect":"正确部分","mainProblem":"主要问题","whyItMatters":"为什么重要","suggestion":"修改建议","reinforcementTask":"强化题"}',
  ].join('\n\n');

  const user = [
    `学科：${input.subject}`,
    `模式：${input.mode}`,
    `问题：${input.question?.question || input.question}`,
    `用户回答：\n${input.userAttempt}`,
  ].join('\n\n');

  return { systemPrompt: system, userPrompt: user };
}

/**
 * Build obsidian prompt — returns { systemPrompt, userPrompt }.
 */
export function buildObsidianPrompt(input) {
  const system = [
    buildSystemPrompt(input.subject),
    '请生成中文 Obsidian Markdown，包含 wikilink、[!summary]、[!question]、[!warning] 和来源页码。',
    '返回 JSON：{"obsidianMarkdown":"中文 Markdown 字符串"}',
  ].join('\n\n');

  const user = `当前解析 JSON：\n${JSON.stringify(input.analysis || {}, null, 2)}`;

  return { systemPrompt: system, userPrompt: user };
}

/**
 * Build collision prompt — returns { systemPrompt, userPrompt }.
 */
export function buildCollisionPrompt(input) {
  const system = [
    buildSystemPrompt(input.subject),
    modeInstructions.multi_source_collision,
    '返回 JSON：{"sourceSummaries":[{"source":"A","coreView":"中文观点"}],"conflicts":["中文冲突点"],"evidenceComparison":["中文证据强弱"],"adoptableConclusions":["中文可采纳结论"],"openDoubts":["中文保留怀疑点"],"learningValue":"中文学习价值"}',
  ].join('\n\n');

  const user = [
    `学科：${input.subject}`,
    `资料 A：\n${input.sourceA}`,
    `资料 B：\n${input.sourceB}`,
    input.sourceC ? `资料 C：\n${input.sourceC}` : null,
  ].filter(Boolean).join('\n\n');

  return { systemPrompt: system, userPrompt: user };
}
