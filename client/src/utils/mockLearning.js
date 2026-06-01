const QUESTION_TYPES = [
  { type: 'exam', label: '考试常考型' },
  { type: 'engineering', label: '工程应用型' },
  { type: 'context', label: '上下文补全型' },
  { type: 'bottom_logic', label: '底层逻辑型' },
];

const modeTopicMap = {
  context_stacking: '本周缓存体系知识地图',
  after_class_review: 'Cache Miss 深度理解',
  examiner_perspective: 'Cache Miss 的出题意图',
  feynman: '用费曼法解释 Cache Miss',
  multi_source_collision: '多资料中的 Cache 观点对撞',
};

export function buildMockAnalysis({ subject, mode, preferences, pageNumber, materialText }) {
  const topic = modeTopicMap[mode] || 'Cache Miss 深度理解';
  const subjectFocus =
    subject === 'DATA_STRUCTURES'
      ? '从抽象结构、操作代价和题型迁移角度理解。'
      : '从机器级访问、存储层级和性能影响角度理解。';

  return {
    id: `analysis_${Date.now()}`,
    pageNumber,
    topic,
    summary: materialText
      ? `已基于你输入的材料生成 mock 结构化解析：${materialText.slice(0, 42)}${materialText.length > 42 ? '...' : ''}`
      : '已生成一份 mock 解析。后续接入真实 API 前，这里用于跑通学习闭环。',
    subjectFocus,
    preferences,
    coreConcepts: [
      {
        name: 'Cache Miss',
        simpleExplanation: 'CPU 想访问的数据不在当前缓存层里，只能去更慢的层级寻找。',
        essence: '本质是程序访问模式和存储层级速度差之间的冲突。',
        relatedConcepts: ['Locality', 'Cache Line', 'Memory Hierarchy'],
      },
      {
        name: 'Locality',
        simpleExplanation: '程序往往会反复访问相近时间或相近地址的数据。',
        essence: '缓存设计能成立，是因为访问并不是完全随机的。',
        relatedConcepts: ['Temporal Locality', 'Spatial Locality'],
      },
    ],
    whyThisMatters: '它解释了为什么同样的代码逻辑，换一种访问顺序就可能产生完全不同的性能。',
    contextRelation: {
      previous: '承接局部性原理和存储层级结构。',
      current: '说明缓存未命中如何让 CPU 被慢速内存拖住。',
      next: '引出 cache blocking、数据布局和访问序列优化。',
    },
    examFocus: ['判断 miss 类型', '分析访问序列命中率', '区分 cache size、block size 和 cache line'],
    engineeringUse: ['优化矩阵遍历顺序', '减少随机访存', '用数据布局提升缓存命中率'],
    pitfalls: ['把 cache size 和 block size 混为一谈', '只背定义，不会根据访问序列推理', '忽略局部性和性能之间的因果链'],
    guidedQuestions: QUESTION_TYPES.map((item, index) => ({
      id: `q_${Date.now()}_${index}`,
      type: item.type,
      typeLabel: item.label,
      question: buildQuestion(item.type, pageNumber),
      reason: buildQuestionReason(item.type),
      pageNumber,
      concept: index % 2 === 0 ? 'Cache Miss' : 'Locality',
    })),
    userTask: {
      question: '请用自己的话解释：为什么 cache miss 会影响程序性能？',
      expectedKeyPoints: ['数据不在缓存', '需要访问更慢层级', '访问模式会影响命中率'],
    },
    pageText: materialText || '这里展示用户输入或 AI 提取出的 PPT 第 X 页文字占位。',
  };
}

export function buildMockDeepDive(question) {
  return {
    id: `deep_${Date.now()}`,
    questionId: question.id,
    title: question.question,
    answer: `mock 深入回答：${question.question} 关键在于把“定义”推进到“能解释现象”。如果只说 cache miss 是没命中缓存，还不够；真正要说明的是它为什么会发生、会带来什么代价，以及如何通过访问模式改变结果。`,
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
    whatIsCorrect: '你已经抓到了 cache miss 和性能有关这一层关系。',
    mainProblem: '回答还没有把“为什么慢”说完整：缺少存储层级、访问代价和局部性之间的因果链。',
    suggestion: '先说数据不在缓存，再说必须访问更慢层级，最后补上访问模式会改变命中率。',
    reinforcementTask: '给出一个连续访问数组和跳跃访问数组的例子，比较它们可能产生的 cache miss 差异。',
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

function buildQuestion(type, pageNumber) {
  const questions = {
    exam: `老师会如何通过第 ${pageNumber} 页内容考察 cache miss？`,
    engineering: '如果要优化矩阵遍历，这个知识点会怎么落到代码上？',
    context: '为什么局部性原理会自然引出缓存设计？',
    bottom_logic: '为什么 cache line 不是越大越好？',
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
