function buildSystemPrompt(subject) {
  const subjectHint = subject && subject !== 'CSAPP'
    ? `你特别擅长 ${subject} 领域的知识拆解。`
    : '你特别擅长 CSAPP 和数据结构学习场景的知识拆解。';

  return [
    '你是 ScaffoldMind 明序，一个结构化学习助手。',
    subjectHint,
    '请使用中文回答，不要大段堆砌文字。',
    '专业术语第一次出现时给出英文括注，例如：缓存行（cache line）、局部性（locality）、缓存未命中（cache miss）、栈帧（stack frame）、指针（pointer）、时间复杂度（time complexity）。',
    '输出要结构化、短段落、适合前端展示。',
  ].join('\n');
}

const modeInstructions = {
  context_stacking: [
    '当前学习模式：Context Stacking 超前学习。',
    '重点输出：本周核心概念、与上周内容的联系、课堂验证清单、补漏清单、出题人区分点。',
  ].join('\n'),
  after_class_review: [
    '当前学习模式：课后深度复习。',
    '重点输出：页码、核心概念、本质解释、前后关联、考点、易错点、主动追问。',
  ].join('\n'),
  examiner_perspective: [
    '当前学习模式：出题人视角。',
    '重点输出：题目考点、出题意图、表层理解陷阱、底层逻辑、迁移题。',
  ].join('\n'),
  feynman: [
    '当前学习模式：费曼反讲。',
    '重点输出：用户解释准确部分、最大偏差、为什么偏差重要、12 岁小孩也能懂的解释、反问题。',
  ].join('\n'),
  multi_source_collision: [
    '当前学习模式：多维信息对撞。',
    '重点输出：资料 A/B/C 观点、冲突点、证据强弱、可采纳结论、保留怀疑点。',
  ].join('\n'),
};

const jsonContract = `只返回 JSON，不要使用 markdown 代码块。

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

推荐补充字段：
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
  "modeSpecific": {"type":"模式id","title":"中文标题"}
}`;

const fewShotExample = `示例输入：TCP 三次握手（three-way handshake）是建立可靠连接的基础。

示例输出：
{
  "topic": "TCP 三次握手（three-way handshake）",
  "summary": "TCP 通过 SYN、SYN+ACK、ACK 三步确认双方收发能力。",
  "coreConcepts": [
    {
      "name": "三次握手（three-way handshake）",
      "simpleExplanation": "客户端和服务端交换三次消息来确认连接可用。",
      "essence": "本质是双方互相确认发送和接收能力。",
      "relatedConcepts": ["SYN", "ACK", "可靠连接"]
    }
  ],
  "whyThisMatters": "它是理解 TCP 可靠传输和连接排查的入口。",
  "examFocus": ["为什么是三次而不是两次"],
  "pitfalls": ["把 SYN 和 ACK 的作用混在一起"],
  "guidedQuestions": [
    {"id":"q_1","type":"exam","typeLabel":"考试常考型","question":"为什么 TCP 需要三次握手？","reason":"检查可靠连接本质","concept":"三次握手"}
  ],
  "userTask": {"question":"用自己的话解释三次握手每一步的作用。","expectedKeyPoints":["确认发送能力","确认接收能力","确认连接建立"]}
}`;

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
  const system = [buildSystemPrompt(context.subject), jsonContract, fewShotExample].join('\n\n');
  const modeInstruction = modeInstructions[context.mode] || modeInstructions.after_class_review;
  const userParts = [modeInstruction, `学科：${context.subject}`];

  if (context.preferences.length > 0) {
    userParts.push(`学习偏好：${context.preferences.join('、')}`);
  }
  if (context.pageNumber) {
    userParts.push(`页码：${context.pageNumber}`);
  }

  userParts.push(`学习材料：\n${context.materialText}`);
  return { systemPrompt: system, userPrompt: userParts.join('\n\n') };
}

export function buildDeepDivePrompt(input) {
  return {
    systemPrompt: [
      buildSystemPrompt(input.subject),
      '请回答用户选中的主动追问，保持中文、结构化、短段落。',
      '返回 JSON：{"answer":"中文回答","keyPoints":["中文要点"],"followUpQuestions":[{"id":"follow_1","type":"bottom_logic","question":"中文追问"}]}',
    ].join('\n\n'),
    userPrompt: [
      `学科：${input.subject}`,
      `模式：${input.mode}`,
      `问题：${input.question?.question || input.question}`,
      input.materialText ? `参考材料：\n${input.materialText}` : null,
    ].filter(Boolean).join('\n\n'),
  };
}

export function buildDiagnosePrompt(input) {
  return {
    systemPrompt: [
      buildSystemPrompt(input.subject),
      '请诊断用户回答，必须引用用户原回答，指出一个最关键偏差，并给出强化题。',
      '返回 JSON：{"errorType":"中文错误类型","quotedIssue":"引用用户回答","whatIsCorrect":"正确部分","mainProblem":"主要问题","whyItMatters":"为什么重要","suggestion":"修改建议","reinforcementTask":"强化题"}',
    ].join('\n\n'),
    userPrompt: [
      `学科：${input.subject}`,
      `模式：${input.mode}`,
      `问题：${input.question?.question || input.question}`,
      `用户回答：\n${input.userAttempt}`,
    ].join('\n\n'),
  };
}

export function buildObsidianPrompt(input) {
  return {
    systemPrompt: [
      buildSystemPrompt(input.subject),
      '请生成中文 Obsidian Markdown，包含 wikilink、[!summary]、[!question]、[!warning] 和来源页码。',
      '返回 JSON：{"obsidianMarkdown":"中文 Markdown 字符串"}',
    ].join('\n\n'),
    userPrompt: `当前解析 JSON：\n${JSON.stringify(input.analysis || {}, null, 2)}`,
  };
}

export function buildCollisionPrompt(input) {
  return {
    systemPrompt: [
      buildSystemPrompt(input.subject),
      modeInstructions.multi_source_collision,
      '返回 JSON：{"sourceSummaries":[{"source":"A","coreView":"中文观点"}],"conflicts":["中文冲突点"],"evidenceComparison":["中文证据强弱"],"adoptableConclusions":["中文可采纳结论"],"openDoubts":["中文保留怀疑点"],"learningValue":"中文学习价值"}',
    ].join('\n\n'),
    userPrompt: [
      `学科：${input.subject}`,
      `资料 A：\n${input.sourceA}`,
      `资料 B：\n${input.sourceB}`,
      input.sourceC ? `资料 C：\n${input.sourceC}` : null,
    ].filter(Boolean).join('\n\n'),
  };
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
      '回答结构必须服务于用户真实问题。不要机械套用固定模板，不要把所有问题都塞进“总结 / 框架 / 5 个核心概念 / 你可以继续选择”。',
      '请先识别用户问题中包含的所有子问题，并确保逐一回答。复杂问题要显式覆盖学习框架、核心概念、旧知识关系、教学抓手、例子和下一步建议。',
      '如果用户问考试，就讲考点、易错点和题型；如果用户问代码，就讲思想、数据结构、流程、边界情况和必要代码；如果用户问如何教给零基础的人，就讲底层逻辑和教学抓手。',
      '附件只代表用户已添加材料的元数据；不要声称已经解析 PPT、图片、PDF、DOCX 或 OCR 内容。',
      '如果附件包含 PPTX 或图片，请明确说明“已附加，当前版本暂不解析内容”，并只基于用户文本进行讲解。',
      buildAgentModeInstruction(mode),
      learnerContext ? '你会收到用户学习画像。画像只能用于优化回答方式，不能编造用户没提供的事实；不要主动说“根据你的画像”。' : '',
    ].filter(Boolean).join('\n'),
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
      '你是 ScaffoldMind 明序，现在要评价用户在互动任务中的回答，而不是重新生成首次知识讲义。',
      '请使用中文回答。专业术语第一次出现时给出英文括注。',
      '输出必须是 Markdown，并且只使用以下六个小节：',
      '## 评价',
      '## 准确点',
      '## 思维漏洞',
      '## 概念混淆',
      '## 如何改写',
      '## 下一步追问',
      '不要输出 ## 总结、## 框架、## 5 个核心概念、## 你可以继续选择。',
      '必须引用或概括用户原话；重点在纠正思维漏洞，而不是机械讲完整知识点。',
      mode === 'feynman' ? '费曼反讲要重点检查：用户是否真正用自己的话解释，是否只是在背术语，是否混淆概念，如何讲得更像“给别人讲懂”。' : '',
      mode === 'context_stacking' ? 'Context Stacking 的评价只在用户明确提交答案时使用，重点检查前置知识、章节连接、预习路线和课堂验证问题是否具体。' : '',
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

export function buildPracticeGeneratePrompt(input = {}) {
  const concept = String(input.concept || '补码溢出').trim();
  const difficulty = input.difficulty || 'medium';

  return {
    systemPrompt: [
      '你是 ScaffoldMind 明序的刷题教练，面向 CSAPP 和数据结构学习场景。',
      '请使用中文回答，专业术语第一次出现时给出英文括注。',
      '只返回 JSON，不要使用 Markdown，不要输出额外说明。',
      '题目来源必须是你根据知识点生成的常考题，不要声称来自外部题库。',
    ].join('\n'),
    userPrompt: [
      `学科：${input.subject || 'CSAPP'}`,
      `知识点：${concept}`,
      `难度：${difficulty}`,
      `学习画像：${JSON.stringify(input.learnerProfile || {})}`,
      `最近错题：${JSON.stringify(input.recentMistakes || [])}`,
      '请返回：{"id":"...","question":"...","answerType":"short_answer","choices":[],"knowledgePoint":"...","difficulty":"medium","expectedKeyPoints":["..."],"hint":"..."}',
    ].join('\n\n'),
  };
}

export function buildPracticeEvaluatePrompt(input = {}) {
  return {
    systemPrompt: [
      '你是 ScaffoldMind 明序的答题评价教练。',
      '请使用中文回答，专业术语第一次出现时给出英文括注。',
      '只返回 JSON，不要使用 Markdown，不要输出额外说明。',
      '评价要引用用户答案中的具体内容，并指出最关键的改进方向。',
    ].join('\n'),
    userPrompt: [
      `学科：${input.subject || 'CSAPP'}`,
      `知识点：${input.knowledgePoint || ''}`,
      `题目：${input.question || ''}`,
      `用户答案：${input.userAnswer || ''}`,
      `期望要点：${JSON.stringify(input.expectedKeyPoints || [])}`,
      '请返回：{"correct":true,"score":80,"feedback":"...","mainIssue":"...","correctKeyPoints":["..."],"missedKeyPoints":["..."],"nextAction":"same_concept"}',
    ].join('\n\n'),
  };
}

export function buildReviewPlanPrompt(input = {}) {
  return {
    systemPrompt: [
      '你是 ScaffoldMind 明序的复习计划助手。',
      '请使用中文回答，专业术语第一次出现时给出英文括注。',
      '只返回 JSON，不要使用 Markdown，不要输出额外说明。',
      '计划要适合前端卡片展示，步骤短、清楚、可行动。',
    ].join('\n'),
    userPrompt: [
      `学习画像：${JSON.stringify(input.learnerProfile || {})}`,
      `最近对话：${JSON.stringify(input.recentConversations || [])}`,
      `刷题统计：${JSON.stringify(input.practiceStats || {})}`,
      `薄弱概念：${JSON.stringify(input.weakConcepts || [])}`,
      '请返回：{"priorityConcepts":["..."],"reviewPlan":[{"id":"...","title":"...","reason":"...","suggestedAction":"chat","estimatedMinutes":15}],"recommendedPractice":[{"knowledgePoint":"...","reason":"..."}],"nextActions":["..."]}',
    ].join('\n\n'),
  };
}

function normalizeAgentMode(mode) {
  const value = String(mode || '').trim();
  if (['default', 'context_stacking', 'feynman'].includes(value)) return value;
  return 'default';
}

function buildAgentModeInstruction(mode) {
  if (mode === 'context_stacking') {
    return [
      '当前模式：Context Stacking 超前学习。',
      '你是主动搭建预习脚手架的 AI，不要反问用户，不要要求用户先作答，不要进入费曼式评价流程。',
      '必须主动生成：## 预习路线、## 前置知识连接、## 课堂验证清单、## 老师可能怎么考、## 学习风险点。',
      '继续选项必须围绕：帮我建立课前预习路线、找出这部分和前置知识的连接、给我课堂验证清单、预测老师可能怎么考。',
    ].join('\n');
  }

  if (mode === 'feynman') {
    return [
      '当前模式：费曼反讲。',
      '如果用户只输入一个主题或问题、没有给出自己的解释，请先邀请用户用自己的话解释，不要长篇讲义，不要输出 default 讲解结构。',
      '如果用户已经给出解释或当前请求是评价互动答案，请使用评价纠偏流程：评价、准确点、思维漏洞、概念混淆、如何改写、下一步追问。',
      '继续选项应围绕：我来反讲请你纠错、给 12 岁小孩也能懂的解释、检验理解问题、易混概念。',
    ].join('\n');
  }

  return [
    '当前模式：默认知识解析。',
    '默认模式不是固定模板模式。请根据用户真实问题动态组织回答结构。',
    '如果用户问多个子问题，必须逐一回答；如果问题包含“框架、核心概念、关系、如何教给别人”，应显式输出学习主线、学习框架、核心概念、与旧知识的关系、教给零基础的人需要懂什么、下一步学习建议。',
    '允许有总结，但不要机械固定为“总结 / 框架 / 5 个核心概念 / 你可以继续选择”。',
    '继续选项应根据当前回答生成，并且不要重复。',
  ].join('\n');
}

function formatAgentHistory(history) {
  if (!history.length) return '暂无。';
  return history
    .map((item) => {
      const role = item.role === 'assistant' ? '助手' : '用户';
      const content = String(item.content || '').replace(/\s+/g, ' ').trim();
      return `- ${role}：${content.slice(0, 500)}`;
    })
    .join('\n');
}

function formatAgentAttachments(attachments) {
  if (!attachments.length) return '无附件。';
  return attachments
    .map((file) => {
      const name = String(file.name || '未命名附件');
      const type = String(file.type || 'unknown');
      const size = Number(file.size || 0);
      const note = isUnparsedAttachment(name, type) ? '；已附加，当前版本暂不解析内容' : '';
      return `- ${name}：${type}，${size} bytes${note}`;
    })
    .join('\n');
}

function isUnparsedAttachment(name, type) {
  const value = `${name || ''} ${type || ''}`.toLowerCase();
  return /\.(pptx|png|jpg|jpeg|webp)$/.test(value) || value.includes('image/');
}

function formatLearnerProfile(profile) {
  if (!profile || typeof profile !== 'object') return '';

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

  return [
    profile.recentFeedbackSummary ? `反馈倾向：${profile.recentFeedbackSummary}` : '',
    topics.length ? `常问方向：${topics.join('、')}` : '',
    weakHints.length ? `可能薄弱点：${weakHints.join('、')}` : '',
    optionHints.length ? `常选路径：${optionHints.join('、')}` : '',
    styleHints.length ? `回答优化要求：${styleHints.join(' ')}` : '',
  ].filter(Boolean).join('\n');
}
