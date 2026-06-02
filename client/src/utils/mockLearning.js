const QUESTION_TYPES = [
  { type: 'exam', label: '考试常考型' },
  { type: 'engineering', label: '工程应用型' },
  { type: 'context', label: '上下文补全型' },
  { type: 'bottom_logic', label: '底层逻辑型' },
];

const modeTopicMap = {
  context_stacking: '本周缓存体系知识地图',
  after_class_review: '缓存未命中（cache miss）深度理解',
  examiner_perspective: '缓存未命中（cache miss）的出题意图',
  feynman: '用费曼法解释缓存未命中（cache miss）',
  multi_source_collision: '多资料中的缓存（cache）观点对撞',
};

export function buildMockAnalysis({ subject, mode, preferences, pageNumber, materialText }) {
  const topic = modeTopicMap[mode] || modeTopicMap.after_class_review;
  const subjectFocus =
    subject === 'DATA_STRUCTURES'
      ? '从抽象数据类型（abstract data type）、指针（pointer）、操作代价和时间复杂度（time complexity）角度理解。'
      : '从存储层级（memory hierarchy）、局部性（locality）和程序性能角度理解。';

  const analysis = {
    id: `analysis_${Date.now()}`,
    mode,
    pageNumber,
    topic,
    summary: materialText
      ? `已基于输入材料生成中文演示解析：${materialText.slice(0, 42)}${materialText.length > 42 ? '...' : ''}`
      : '已生成中文演示解析，用于跑通学习闭环。',
    subjectFocus,
    preferences,
    coreConcepts: buildCoreConcepts(),
    whyThisMatters: '它解释了为什么同样的代码逻辑，换一种访问顺序就可能产生完全不同的性能。',
    contextRelation: {
      previous: '承接局部性（locality）和存储层级（memory hierarchy）。',
      current: '说明缓存未命中（cache miss）如何让 CPU 被慢速内存拖住。',
      next: '引出分块优化（cache blocking）、数据布局和访问序列优化。',
    },
    examFocus: ['判断未命中类型', '分析访问序列命中率', '区分缓存行（cache line）和缓存容量（cache size）'],
    engineeringUse: ['优化二维数组遍历顺序', '减少随机访存', '通过数据布局提升缓存命中率'],
    pitfalls: ['混淆缓存行（cache line）和缓存容量（cache size）', '只背定义，不会根据访问序列推理', '忽略局部性（locality）和性能之间的因果链'],
    guidedQuestions: QUESTION_TYPES.map((item, index) => ({
      id: `q_${Date.now()}_${index}`,
      type: item.type,
      typeLabel: item.label,
      question: buildQuestion(item.type, pageNumber),
      reason: buildQuestionReason(item.type),
      pageNumber,
      concept: index % 2 === 0 ? '缓存未命中（cache miss）' : '局部性（locality）',
    })),
    userTask: {
      question: '请用自己的话解释：为什么缓存未命中（cache miss）会影响程序性能？',
      expectedKeyPoints: ['数据不在缓存（cache）中', '需要访问更慢的存储层级', '访问模式会影响命中率'],
    },
    pageText: materialText || '这里展示用户输入或系统提取出的当前页材料文字。',
  };

  return {
    ...analysis,
    modeSpecific: buildModeSpecificSection(mode, analysis),
  };
}

export function buildMockDeepDive(question) {
  return {
    id: `deep_${Date.now()}`,
    questionId: question.id,
    title: question.question,
    answer: `演示深入回答：${question.question} 关键在于把“定义”推进到“解释现象”。只说缓存未命中（cache miss）是没有命中缓存还不够，还要说明它为什么发生、带来什么代价，以及访问模式如何改变结果。`,
    keyPoints: ['先定位知识点', '再说明底层原因', '最后连接考试或工程场景'],
    pageNumber: question.pageNumber,
    concept: question.concept,
  };
}

export function buildMockDiagnosis(userAnswer) {
  const quotedIssue = userAnswer.trim() || '（没有输入具体回答）';

  return {
    id: `diagnosis_${Date.now()}`,
    errorType: userAnswer.length > 18 ? '表达不完整' : '概念混淆',
    quotedIssue,
    whatIsCorrect: '你已经抓到了缓存未命中（cache miss）和性能有关这一层关系。',
    mainProblem: '回答还没有把“为什么慢”说完整：缺少存储层级（memory hierarchy）、访问代价和局部性（locality）之间的因果链。',
    suggestion: '先说数据不在缓存（cache）中，再说必须访问更慢层级，最后补上访问模式会改变命中率。',
    reinforcementTask: '给出一个顺序访问数组和跳跃访问数组的例子，比较它们可能产生的缓存未命中（cache miss）差异。',
  };
}

export function buildObsidianMarkdown(analysis, diagnosis) {
  if (!analysis) {
    return '';
  }

  const mainQuestion = analysis.guidedQuestions?.[0]?.question || '为什么这个知识点值得追问？';
  const mainPitfall = analysis.pitfalls?.[0] || '不要只背定义，要解释因果链。';
  const concepts = analysis.coreConcepts
    .flatMap((concept) => [concept.name, ...(concept.relatedConcepts || [])])
    .filter(Boolean);
  const uniqueConcepts = [...new Set(concepts)];

  return `# [[${analysis.topic}]]

> [!summary] 核心本质
> ${analysis.coreConcepts[0]?.essence || analysis.summary}

> [!question] 主动追问
> ${mainQuestion}

> [!warning] 易错点
> ${diagnosis?.mainProblem || mainPitfall}

## 相关概念
${uniqueConcepts.map((concept) => `- [[${concept}]]`).join('\n')}

## 来源
- PPT 第 ${analysis.pageNumber} 页

## 强化练习
- ${diagnosis?.reinforcementTask || analysis.userTask.question}
`;
}

function buildCoreConcepts() {
  return [
    {
      name: '缓存未命中（cache miss）',
      simpleExplanation: 'CPU 想访问的数据不在当前缓存（cache）中，只能去更慢的存储层级寻找。',
      essence: '本质是程序访问模式和存储层级（memory hierarchy）速度差之间的冲突。',
      relatedConcepts: ['局部性（locality）', '缓存行（cache line）', '存储层级（memory hierarchy）'],
    },
    {
      name: '局部性（locality）',
      simpleExplanation: '程序往往会反复访问相近时间或相近地址的数据。',
      essence: '缓存设计能成立，是因为访问不是完全随机的。',
      relatedConcepts: ['时间局部性（temporal locality）', '空间局部性（spatial locality）'],
    },
  ];
}

function buildQuestion(type, pageNumber) {
  const questions = {
    exam: `老师会如何通过第 ${pageNumber} 页内容考察缓存未命中（cache miss）？`,
    engineering: '如果要优化矩阵遍历，这个知识点会如何落到代码上？',
    context: '为什么局部性（locality）会自然引出缓存（cache）设计？',
    bottom_logic: '为什么缓存行（cache line）不是越大越好？',
  };

  return questions[type];
}

function buildQuestionReason(type) {
  const reasons = {
    exam: '能区分背定义和会分析访问过程的学生。',
    engineering: '把课程概念连接到真实性能问题。',
    context: '补齐前后知识点之间的链条。',
    bottom_logic: '逼近设计取舍背后的根本原因。',
  };

  return reasons[type];
}

function buildModeSpecificSection(mode, analysis) {
  const sections = {
    context_stacking: {
      type: 'context_stacking',
      title: 'Context Stacking 超前学习输出',
      weeklyCoreConcepts: ['存储层级（memory hierarchy）', '局部性（locality）', '缓存行（cache line）', '缓存未命中（cache miss）', '分块优化（cache blocking）'],
      connectionToLastWeek: ['从上周的程序执行模型连接到本周的存储层级。', '把“指令会访问内存”推进到“访问模式会影响性能”。'],
      classroomValidationChecklist: ['确认老师是否强调时间局部性和空间局部性的区别。', '记录缓存行（cache line）和缓存容量（cache size）是否被放在同一张图里比较。', '观察例题是否要求手算命中率或未命中类型。'],
      gapChecklist: ['补齐组相联（set associative）的映射规则。', '复查二维数组按行/按列访问的缓存差异。', '用一句话区分缓存行（cache line）和缓存容量（cache size）。'],
      examinerDistinction: ['只背定义的人会说“没有命中缓存”。', '真正理解的人会解释访问序列、映射规则和慢速层级代价。'],
    },
    after_class_review: {
      type: 'after_class_review',
      title: '课后深度复习输出',
      pageNumber: analysis.pageNumber,
      coreConcepts: analysis.coreConcepts,
      essenceExplanation: analysis.coreConcepts.map((concept) => `${concept.name}: ${concept.essence}`),
      contextRelation: analysis.contextRelation,
      examFocus: analysis.examFocus,
      pitfalls: analysis.pitfalls,
      guidedQuestions: analysis.guidedQuestions,
    },
    examiner_perspective: {
      type: 'examiner_perspective',
      title: '出题人视角输出',
      testedPoints: ['是否能从访问序列推导缓存未命中（cache miss）', '是否能区分概念定义和性能原因', '是否能迁移到代码访问模式'],
      examinerIntent: '用一道看似计算题的问题，区分学生是背了定义，还是能解释存储层级（memory hierarchy）和局部性（locality）。',
      surfaceTraps: ['看到缓存（cache）就只说容量越大越好。', '把缓存行（cache line）、块大小（block size）、缓存容量（cache size）混成一个概念。', '忽略访问顺序导致的命中率差异。'],
      underlyingLogic: '出题人想考的是“访问模式 -> 缓存命中率 -> 性能”的因果链，而不是术语复述。',
      transferQuestions: ['给出二维数组按列访问的代码，判断为什么比按行访问慢。', '改变块大小（block size）后，分析顺序访问和随机访问的收益差异。'],
    },
    feynman: {
      type: 'feynman',
      title: '费曼反讲输出',
      accurateParts: ['你能意识到缓存未命中（cache miss）和“数据不在缓存中”有关。', '你已经把它和性能问题建立了初步连接。'],
      biggestDeviation: '解释容易停在定义层，没有讲清为什么会慢、慢在哪里、访问模式如何改变结果。',
      whyDeviationMatters: '如果缺少因果链，换成访问序列题或代码优化题时就无法迁移。',
      twelveYearOldExplanation: '把缓存（cache）想成桌面，把主存想成书架。你要的纸不在桌面上，就得起身去书架拿，所以慢；如果你总是按顺序拿附近的纸，桌面就更可能提前放好你需要的东西。',
      checkingQuestion: '如果连续读数组通常更快，你能用缓存行（cache line）和局部性（locality）解释原因吗？',
    },
    multi_source_collision: {
      type: 'multi_source_collision',
      title: '多维信息对撞输出',
      sourceViews: [
        { source: '资料 A', view: '课程材料强调缓存未命中（cache miss）的定义、页码和考试计算。' },
        { source: '资料 B', view: '工程文章强调访问模式、数据布局和性能优化。' },
        { source: '资料 C', view: '反面观点提醒：缓存（cache）不是越大越好，还要看映射和局部性（locality）。' },
      ],
      conflicts: ['课程材料偏概念边界，工程材料偏优化策略。', '“增大缓存”和“优化访问模式”不是同一层面的解决方案。'],
      evidenceStrength: ['课程材料对考试范围最强。', '工程文章对真实性能直觉最强。', '反面观点适合暴露简单结论的边界。'],
      adoptableConclusions: ['先按课程定义建立概念边界。', '再用工程例子理解为什么访问模式重要。'],
      doubtsToKeep: ['没有具体硬件参数时，不要绝对判断某个缓存配置一定更优。'],
    },
  };

  return sections[mode] || sections.after_class_review;
}
