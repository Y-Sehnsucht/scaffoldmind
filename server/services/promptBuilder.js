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

export function buildAgentChatPrompt(input = {}) {
  const subject = input.subject || 'CSAPP';
  const mode = normalizeAgentMode(input.mode);
  const attachments = Array.isArray(input.attachments) ? input.attachments : [];
  const history = Array.isArray(input.history) ? input.history.slice(-6) : [];
  const learnerContext = formatLearnerProfile(input.learnerProfile);

  return {
    systemPrompt: [
      '你是 ScaffoldMind 明序，一个面向 CSAPP 和数据结构学习场景的 AI 学习智能体。',
      '请使用中文回答。专业术语第一次出现时给出英文括注，例如：缓存行（cache line）、局部性（locality）、缓存未命中（cache miss）、栈帧（stack frame）、指针（pointer）、时间复杂度（time complexity）。',
      '不要大段堆砌文字。优先输出结构化、短段落、高密度解释，适合前端逐段展示。',
      '如果用户输入很长，先做框架化总结和关键概念梳理，不要逐句复述原文。',
      '附件只代表用户已附加材料的元数据；不要声称已经解析 PPT、图片、PDF、DOCX 或 OCR 内容。',
      '如果附件包含 PPTX 或图片，请明确说明“已附加，当前版本暂不解析内容”，并只基于用户文本进行讲解。',
      buildAgentModeInstruction(mode),
      '首次知识回答必须严格包含这些 Markdown 小节：',
      '## 总结',
      '## 框架',
      '## 5 个核心概念',
      '## 你可以继续选择',
      '“## 总结”控制在 120-220 个中文字符，必须点出核心概念和全局逻辑，可加粗关键概念。',
      '“## 框架”列出 3-6 条知识结构。',
      '“## 5 个核心概念”必须恰好列出 5 个概念，每个概念用加粗术语 + 一句话解释。',
      '“## 你可以继续选择”给出 3-4 个可继续学习的选项，使用有序列表。',
      mode === 'context_stacking' ? 'Context Stacking 必须主动帮助用户建立预习脚手架。禁止反问用户，禁止要求用户先回答，禁止出现“请你先...”这类步骤。必须主动给出预习路线、前置连接、课堂验证清单、可能考法预测。交互选项必须是行动型选项：帮我建立课前预习路线、找出这部分和前置知识的连接、给我课堂验证清单、预测老师可能怎么考。不要输出“详细解释/继续讲解”这类泛化选项。用户点击这些选项后，也要直接生成对应内容。' : '',
      mode === 'feynman' ? '费曼反讲的选项必须引导用户作答或反讲：我来反讲请你纠错、12 岁小孩也能懂、检验理解问题、易混概念。' : '',
      learnerContext ? '你会收到用户学习画像。画像只能用于优化回答方式，不能编造用户没提供的事实；不要主动说“根据你的画像”。' : '',
    ].join('\n'),
    userPrompt: [
      `学科：${subject}`,
      `学习模式：${mode}`,
      learnerContext ? `\n【用户学习画像】\n${learnerContext}` : '',
      '',
      '最近对话（最多 6 轮，仅用于上下文，不要重复）：',
      formatAgentHistory(history),
      '',
      '附件元数据（仅作文件存在提示，不代表内容已解析）：',
      formatAgentAttachments(attachments),
      '',
      '用户输入：',
      String(input.message || '').trim(),
    ].join('\n'),
  };
}

export function buildAgentEvaluationPrompt(input = {}) {
  const subject = input.subject || 'CSAPP';
  const mode = normalizeAgentMode(input.mode);
  const history = Array.isArray(input.history) ? input.history.slice(-6) : [];
  const learnerContext = formatLearnerProfile(input.learnerProfile);
  const interaction = input.interaction || {};

  return {
    systemPrompt: [
      '你是 ScaffoldMind 明序，现在要评价用户在互动任务中的回答，而不是重新生成首次知识总结。',
      '请使用中文回答。专业术语第一次出现时给出英文括注。',
      '输出必须是 Markdown，并且只能使用以下五个小节：',
      '## 评价',
      '## 准确点',
      '## 主要偏差',
      '## 修改建议',
      '## 下一步练习',
      '不要输出 ## 总结、## 框架、## 5 个核心概念、## 你可以继续选择。',
      '“## 评价”用 2-4 句话判断用户回答整体质量。',
      '“## 准确点”列出用户回答中正确的地方。',
      '“## 主要偏差”指出 1-3 个关键偏差，必须引用或概括用户原话。',
      '“## 修改建议”告诉用户应该如何改写或补充。',
      '“## 下一步练习”给一个很小的强化任务。',
      mode === 'feynman' ? '费曼反讲要重点检查：用户是否真正用自己的话解释，是否只背术语，是否混淆概念，如何讲得更像“给别人讲懂”。' : '',
      mode === 'context_stacking' ? 'Context Stacking 要重点检查：前置知识是否找对，章节连接是否合理，预习路线是否完整，上课验证问题是否具体。' : '',
      learnerContext ? '用户学习画像只能用于优化评价方式，不要主动说“根据你的画像”。' : '',
    ].filter(Boolean).join('\n'),
    userPrompt: [
      `学科：${subject}`,
      `学习模式：${mode}`,
      `用户点击的互动选项：${interaction.optionText || '未提供'}`,
      interaction.topic ? `相关主题：${interaction.topic}` : '',
      learnerContext ? `\n【用户学习画像】\n${learnerContext}` : '',
      '',
      '最近上下文：',
      formatAgentHistory(history),
      '',
      '用户回答：',
      String(input.message || '').trim(),
    ].filter(Boolean).join('\n'),
  };
}

function normalizeAgentMode(mode) {
  const value = String(mode || '').trim();
  if (['default', 'context_stacking', 'feynman'].includes(value)) {
    return value;
  }
  return 'default';
}

function buildAgentModeInstruction(mode) {
  if (mode === 'context_stacking') {
    return [
      '当前模式：Context Stacking 超前学习。',
      '继续选项必须稳定围绕：帮我建立课前预习路线、找出这部分和前置知识的连接、给我课堂验证清单、预测老师可能怎么考。',
      '解释时要强调“先搭框架，再进细节”，帮助学生带着问题上课。',
      '不要反问用户，不要要求用户先作答。你要主动生成预习路线、前置知识连接、课堂验证清单和考法预测。',
    ].join('\n');
  }

  if (mode === 'feynman') {
    return [
      '当前模式：费曼反讲。',
      '继续选项应围绕：我来反讲请你纠错、给 12 岁小孩也能懂的解释、检查题、易混概念。',
      '解释时要鼓励用户用自己的话复述，并指出可验证的理解偏差。',
    ].join('\n');
  }

  return [
    '当前模式：默认知识解析。',
    '继续选项应围绕：核心概念展开、考试常考点、易错区、检查题。',
    '解释时先给全局框架，再给关键概念，不要直接进入冗长细节。',
  ].join('\n');
}

function formatAgentHistory(history) {
  if (!history.length) {
    return '暂无。';
  }

  return history
    .map((item) => {
      const role = item.role === 'assistant' ? '助手' : '用户';
      const content = String(item.content || '').replace(/\s+/g, ' ').trim();
      return `- ${role}：${content.slice(0, 500)}`;
    })
    .join('\n');
}

function formatAgentAttachments(attachments) {
  if (!attachments.length) {
    return '无附件。';
  }

  return attachments
    .map((file) => {
      const name = String(file.name || '未命名附件');
      const type = String(file.type || 'unknown');
      const size = Number(file.size || 0);
      const note = isUnparsedAttachment(name, type) ? '；已附加，当前版本暂不解析内容' : '';
      return `- ${name}（${type}，${size} bytes${note}）`;
    })
    .join('\n');
}

function isUnparsedAttachment(name, type) {
  const value = `${name} ${type}`.toLowerCase();
  return /\.(pptx|png|jpg|jpeg|webp)$/.test(value) || value.includes('image/');
}

function formatLearnerProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return '';
  }

  const style = profile.answerStylePreference || {};
  const styleHints = [
    style.wantsConcise || style.dislikesTooLong ? '回答更简洁，减少铺垫。' : '',
    style.wantsExamples ? '多给具体例子或代码类比。' : '',
    style.wantsExamFocus ? '补充考试常考点和易错点。' : '',
    style.wantsStepByStep ? '使用分步骤解释。' : '',
    Number(profile.negativeFeedbackCount || 0) > Number(profile.positiveFeedbackCount || 0) ? '更具体、更结构化，减少空话。' : '',
    Array.isArray(profile.repeatedQuestionPatterns) && profile.repeatedQuestionPatterns.length > 0 ? '用户存在反复追问，优先用类比、例题和分步解释。' : '',
  ].filter(Boolean);
  const topics = (profile.frequentTopics || []).map((item) => item.label).filter(Boolean).slice(0, 5);
  const weakHints = (profile.weakConceptHints || []).map((item) => item.label).filter(Boolean).slice(0, 5);
  const optionHints = (profile.selectedOptionStats || []).map((item) => item.label).filter(Boolean).slice(0, 5);

  const lines = [
    profile.recentFeedbackSummary ? `反馈倾向：${profile.recentFeedbackSummary}` : '',
    topics.length ? `常问方向：${topics.join('、')}` : '',
    weakHints.length ? `可能薄弱点：${weakHints.join('、')}` : '',
    optionHints.length ? `常选路径：${optionHints.join('、')}` : '',
    styleHints.length ? `回答优化要求：${styleHints.join(' ')}` : '',
  ].filter(Boolean);

  return lines.join('\n');
}
