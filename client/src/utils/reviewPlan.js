import { buildQuestionTypeStats } from './profileInsights.js';

export function buildReviewPlanMarkdown(profileSummary, records = [], questions = [], questionTypeStats = buildQuestionTypeStats(questions)) {
  const totalRecords = profileSummary?.totalRecords || records.length;
  const weakConcepts = profileSummary?.weakConcepts || [];
  const frequentErrors = profileSummary?.frequentErrorTypes || [];
  const recentTopics = profileSummary?.recentTopics || records.map((record) => record.title).filter(Boolean).slice(0, 5);
  const nextReviewSuggestion = profileSummary?.nextReviewSuggestion || '先保存几次完整学习记录，再生成更具体的复习建议。';
  const pendingQuestions = questions.filter((question) => normalizeStatus(question.status) === 'pending').slice(0, 5);
  const reinforcedQuestions = questions.filter((question) => normalizeStatus(question.status) === 'reinforced').slice(0, 5);

  return [
    '# [[ScaffoldMind 明序复习计划]]',
    '',
    '> [!summary] 学习画像',
    `> 已保存 ${totalRecords} 条学习记录。`,
    `> 下一步建议：${nextReviewSuggestion}`,
    '',
    '## 薄弱概念',
    formatCountList(weakConcepts, '暂无足够数据，建议先完成 2-3 次课后深度复习。'),
    '',
    '## 高频错误类型',
    formatCountList(frequentErrors, '暂无足够数据，提交用户尝试并完成诊断后会出现。'),
    '',
    '## 常见问题类型',
    formatCountList(questionTypeStats, '暂无足够问题链数据，建议先点击 2-3 个主动追问。'),
    '',
    '## 最近学习主题',
    formatTextList(recentTopics, '暂无最近主题。'),
    '',
    '> [!question] 待追问',
    formatQuestionCallout(pendingQuestions, '暂无待追问问题。'),
    '',
    '> [!warning] 已强化但需要复查',
    formatQuestionCallout(reinforcedQuestions, '暂无已强化问题。'),
    '',
    '## 下一次复习动作',
    '- 选择一个薄弱概念，用“费曼反讲”重新解释一遍。',
    '- 对一个高频错误类型写出反例，并提交给 ScaffoldMind 诊断。',
    '- 把本页计划贴进 Obsidian，隔天回看是否还能独立复述。',
  ].join('\n');
}

function formatCountList(items, emptyText) {
  if (!items.length) {
    return `- ${emptyText}`;
  }

  return items.map((item) => `- [[${item.label}]]：出现 ${item.count} 次`).join('\n');
}

function formatTextList(items, emptyText) {
  if (!items.length) {
    return `- ${emptyText}`;
  }

  return items.map((item) => `- [[${item}]]`).join('\n');
}

function formatQuestionCallout(questions, emptyText) {
  if (!questions.length) {
    return `> ${emptyText}`;
  }

  return questions.map((question) => `> - ${question.question}（${question.concept || '未标注概念'}）`).join('\n');
}

function normalizeStatus(status = '') {
  if (status.includes('强化')) {
    return 'reinforced';
  }
  if (status.includes('已回答') || status.includes('answered')) {
    return 'answered';
  }
  return 'pending';
}
