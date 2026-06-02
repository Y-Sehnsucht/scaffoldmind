import assert from 'node:assert/strict';
import { LEARNING_MODES } from '../src/core/constants.js';
import { validateMaterialInput, validateUserAttempt } from '../src/utils/inputValidation.js';
import { buildMockAnalysis, buildMockDeepDive, buildMockDiagnosis, buildObsidianMarkdown } from '../src/utils/mockLearning.js';
import { buildQuestionHistoryFromRecords, buildQuestionTypeStats } from '../src/utils/profileInsights.js';
import { buildReviewPlanMarkdown } from '../src/utils/reviewPlan.js';

const materialText = '缓存未命中（cache miss）表示请求的数据不在缓存中，局部性（locality）影响缓存命中率。';
assert.equal(validateMaterialInput(materialText, {}).valid, true, 'workspace smoke should start from valid material');

const mode = LEARNING_MODES.find((item) => item.id === 'after_class_review');
assert.ok(mode, 'after-class review mode should exist');

const analysis = buildMockAnalysis({
  subject: 'CSAPP',
  mode: mode.id,
  preferences: ['framework_first', 'why_chain', 'exam_focus'],
  pageNumber: 5,
  materialText,
});

assert.ok(analysis.topic, 'analysis should produce a topic');
assert.ok(analysis.coreConcepts.length >= 1, 'analysis should produce core concepts');
assert.ok(analysis.guidedQuestions.length >= 1, 'analysis should produce guided questions');
assert.ok(analysis.userTask?.question, 'analysis should include user task');

const questionHistory = analysis.guidedQuestions.map((question) => ({
  id: `auto_${analysis.id}_${question.id}`,
  questionId: question.id,
  question: question.question,
  pageNumber: question.pageNumber,
  concept: question.concept,
  type: question.type,
  typeLabel: question.typeLabel,
  status: '待追问',
  createdAt: new Date().toISOString(),
}));

const selectedQuestion = analysis.guidedQuestions[0];
const deepDive = buildMockDeepDive(selectedQuestion);
assert.ok(deepDive.answer, 'deep dive should produce an answer');

const answeredHistory = questionHistory.map((item) =>
  item.questionId === selectedQuestion.id ? { ...item, status: '本地演示已回答' } : item,
);

const userAnswer = '我认为缓存未命中就是缓存太小，只要把缓存容量变大就能解决。';
assert.equal(validateUserAttempt(userAnswer).valid, true, 'workspace smoke should validate user attempt');

const diagnosis = buildMockDiagnosis(userAnswer);
assert.match(diagnosis.quotedIssue, /缓存太小/, 'diagnosis should quote user answer');
assert.ok(diagnosis.reinforcementTask, 'diagnosis should include reinforcement task');

const reinforcedHistory = answeredHistory.map((item, index) =>
  index === 0 || item.status.includes('已回答') ? { ...item, status: '已强化' } : item,
);

const obsidianMarkdown = buildObsidianMarkdown(analysis, diagnosis);
assert.match(obsidianMarkdown, /> \[!summary\]/, 'workspace smoke should produce Obsidian summary callout');

const record = {
  id: analysis.id,
  title: analysis.topic,
  subject: 'CSAPP',
  mode: mode.id,
  modeLabel: mode.label,
  mockSource: 'local',
  input: materialText,
  analysis,
  deepDive,
  userAnswer,
  diagnosis,
  obsidianMarkdown,
  questionHistory: reinforcedHistory,
  createdAt: new Date().toISOString(),
};

const restoredQuestions = buildQuestionHistoryFromRecords([record]);
assert.equal(restoredQuestions.length, reinforcedHistory.length, 'workspace smoke should restore saved question history');
assert.equal(restoredQuestions[0].sourceRecordTitle, record.title, 'restored questions should retain record title');

const questionTypeStats = buildQuestionTypeStats(restoredQuestions);
assert.ok(questionTypeStats.length >= 1, 'workspace smoke should compute question type stats');

const reviewPlan = buildReviewPlanMarkdown(
  {
    totalRecords: 1,
    weakConcepts: analysis.coreConcepts.map((concept) => ({ label: concept.name, count: 1 })),
    frequentErrorTypes: [{ label: diagnosis.errorType, count: 1 }],
    commonQuestionTypes: questionTypeStats,
    recentTopics: [analysis.topic],
    nextReviewSuggestion: `优先复习 ${analysis.coreConcepts[0].name}。`,
  },
  [record],
  restoredQuestions,
  questionTypeStats,
);

assert.match(reviewPlan, /\[\[ScaffoldMind 明序复习计划\]\]/, 'workspace smoke should produce review plan title');
assert.match(reviewPlan, /> \[!question\]/, 'workspace smoke should include question callout in review plan');

console.log('Workspace smoke verification passed.');
