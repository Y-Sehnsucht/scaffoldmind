export function buildQuestionTypeStats(questions = [], limit = 5) {
  const counts = questions.reduce((map, question) => {
    const label = question.typeLabel || question.type || '未标注类型';
    map.set(label, (map.get(label) || 0) + 1);
    return map;
  }, new Map());

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function buildQuestionHistoryFromRecords(records = [], limit = 50) {
  const seen = new Set();
  const questions = [];

  for (const record of records) {
    for (const question of record.questionHistory || []) {
      const key = question.questionId || question.id || question.question;
      if (!key || seen.has(key)) {
        continue;
      }

      seen.add(key);
      questions.push({
        ...question,
        sourceRecordId: record.id,
        sourceRecordTitle: record.title,
      });

      if (questions.length >= limit) {
        return questions;
      }
    }
  }

  return questions;
}
