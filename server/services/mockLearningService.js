const guidedQuestions = [
  {
    id: 'mock_q_exam',
    type: 'exam',
    typeLabel: '考试常考型',
    question: '老师会如何通过缓存未命中（cache miss）区分背定义和真理解？',
    reason: '要求学生能根据访问序列解释命中和未命中。',
    pageNumber: 12,
    concept: '缓存未命中（cache miss）',
  },
  {
    id: 'mock_q_engineering',
    type: 'engineering',
    typeLabel: '工程应用型',
    question: '如果要优化矩阵遍历，这个知识点会如何落到代码上？',
    reason: '把课程概念连接到真实性能问题。',
    pageNumber: 12,
    concept: '局部性（locality）',
  },
  {
    id: 'mock_q_context',
    type: 'context',
    typeLabel: '上下文补全型',
    question: '为什么局部性（locality）会自然引出缓存（cache）设计？',
    reason: '补齐前后知识点之间的链条。',
    pageNumber: 12,
    concept: '局部性（locality）',
  },
  {
    id: 'mock_q_logic',
    type: 'bottom_logic',
    typeLabel: '底层逻辑型',
    question: '为什么缓存行（cache line）不是越大越好？',
    reason: '逼近设计取舍背后的根本原因。',
    pageNumber: 12,
    concept: '缓存行（cache line）',
  },
];

export function buildMockAnalysis(body) {
  const pageNumber = Number(body.pageNumber || 12);

  return {
    pageNumber,
    topic: body.mode === 'multi_source_collision' ? '多资料中的缓存（cache）观点对撞' : '缓存未命中（cache miss）深度理解',
    summary: `后端 mock：已基于 ${body.subject} / ${body.mode} 生成中文结构化解析。`,
    coreConcepts: [
      {
        name: '缓存未命中（cache miss）',
        simpleExplanation: 'CPU 想访问的数据不在当前缓存（cache）层中。',
        essence: '本质是程序访问模式和存储层级（memory hierarchy）速度差之间的冲突。',
        relatedConcepts: ['局部性（locality）', '缓存行（cache line）', '存储层级（memory hierarchy）'],
      },
    ],
    whyThisMatters: '它解释了为什么访问顺序会显著影响程序性能。',
    contextRelation: {
      previous: '承接局部性（locality）。',
      current: '解释缓存未命中（cache miss）的机制。',
      next: '引出缓存优化和数据布局。',
    },
    examFocus: ['判断未命中类型', '分析访问序列', '区分缓存行（cache line）和缓存容量（cache size）'],
    engineeringUse: ['优化矩阵遍历顺序', '减少随机访存'],
    pitfalls: ['混淆缓存行（cache line）和缓存容量（cache size）', '只背定义但不会推理'],
    guidedQuestions,
    userTask: {
      question: '请用自己的话解释缓存未命中（cache miss）为什么影响性能。',
      expectedKeyPoints: ['数据不在缓存（cache）中', '访问更慢存储层级', '访问模式影响命中率'],
    },
    pageLink: {
      pageNumber,
      label: `查看第 ${pageNumber} 页原始内容`,
    },
  };
}

export function buildMockDeepDive(body) {
  const question = body.question || {};

  return {
    questionId: question.id || 'mock_q_selected',
    answer: `后端 mock 深入回答：${question.question} 需要从概念定义推进到访问模式、映射规则和性能代价。`,
    keyPoints: ['定位知识点', '说明底层原因', '连接考试或工程场景'],
    followUpQuestions: [
      {
        id: 'mock_follow_up',
        type: 'bottom_logic',
        question: '这个问题背后的设计取舍是什么？',
      },
    ],
    historyItem: {
      id: `qh_${Date.now()}`,
      question: question.question,
      pageNumber: question.pageNumber || body.pageNumber || 12,
      concept: question.concept || '缓存未命中（cache miss）',
      status: 'answered',
    },
  };
}

export function buildMockDiagnosis(body) {
  return {
    errorType: '概念混淆',
    quotedIssue: body.userAttempt,
    whatIsCorrect: '你已经意识到缓存未命中（cache miss）和性能有关。',
    mainProblem: '回答还没有讲清为什么会慢，以及访问模式如何影响命中率。',
    whyItMatters: '如果缺少因果链，遇到访问序列题或代码优化题时就无法迁移。',
    suggestion: '先说明数据不在缓存（cache），再说明必须访问更慢层级，最后补上局部性（locality）和访问模式。',
    reinforcementTask: '比较连续访问数组和跳跃访问数组的缓存未命中（cache miss）差异。',
  };
}

export function buildMockObsidian(body) {
  const analysis = body.analysis || {};
  const topic = analysis.topic || '缓存未命中（cache miss）';
  const pageNumber = analysis.pageNumber || body.pageNumber || 12;

  return {
    obsidianMarkdown: `# [[${topic}]]

> [!summary] 核心本质
> 缓存未命中（cache miss）的本质是 CPU 想访问的数据不在当前缓存（cache）层中。

> [!question] 主动追问
> 为什么缓存行（cache line）不是越大越好？

> [!warning] 易错点
> 不要混淆缓存容量（cache size）和块大小（block size）。

## 相关概念
- [[局部性（locality）]]
- [[缓存行（cache line）]]
- [[存储层级（memory hierarchy）]]

## 来源
- PPT 第 ${pageNumber} 页`,
  };
}

export function buildMockCollision(body) {
  return {
    sourceSummaries: [
      { source: 'A', coreView: body.sourceA || '课程材料强调概念定义和考试计算。' },
      { source: 'B', coreView: body.sourceB || '工程材料强调访问模式和性能优化。' },
      { source: 'C', coreView: body.sourceC || '反面观点提醒缓存优化存在边界。' },
    ],
    conflicts: ['课程定义关注边界，工程文章关注优化策略。'],
    evidenceComparison: ['课程材料对考试范围最强，工程材料对性能直觉最强。'],
    adoptableConclusions: ['先按课程定义建立概念边界，再用工程例子理解访问模式。'],
    openDoubts: ['没有硬件参数时，不绝对判断某个缓存配置一定更优。'],
    learningValue: '帮助区分课程考点、工程经验和需要保留怀疑的结论。',
  };
}
