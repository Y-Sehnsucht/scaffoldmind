import assert from 'node:assert/strict';
import { LEARNING_MODES } from '../src/core/constants.js';
import { validateMaterialInput, validateUserAttempt } from '../src/utils/inputValidation.js';
import { buildMockAnalysis, buildObsidianMarkdown } from '../src/utils/mockLearning.js';
import { buildQuestionHistoryFromRecords, buildQuestionTypeStats } from '../src/utils/profileInsights.js';
import { formatFallbackDetails, getProviderSourceMeta } from '../src/utils/providerStatus.js';
import { buildReviewPlanMarkdown } from '../src/utils/reviewPlan.js';

function createMemoryStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

global.window = {
  localStorage: createMemoryStorage(),
};

const {
  clearLearningRecords,
  clearQuestionHistory,
  loadLearningRecords,
  loadQuestionHistory,
  saveLearningRecords,
  saveQuestionHistory,
} = await import('../src/shared/storage/learningStorage.js');

saveQuestionHistory([{ id: 'q1', question: '为什么缓存行（cache line）不是越大越好？' }]);
assert.equal(loadQuestionHistory().length, 1, 'question history should round-trip through localStorage');
clearQuestionHistory();
assert.deepEqual(loadQuestionHistory(), [], 'question history should clear');

saveLearningRecords([{ id: 'r1', title: '缓存未命中（cache miss）深度理解' }]);
assert.equal(loadLearningRecords()[0].title, '缓存未命中（cache miss）深度理解', 'learning records should round-trip through localStorage');
clearLearningRecords();
assert.deepEqual(loadLearningRecords(), [], 'learning records should clear');

const requiredModeFields = {
  context_stacking: ['weeklyCoreConcepts', 'connectionToLastWeek', 'classroomValidationChecklist', 'gapChecklist', 'examinerDistinction'],
  after_class_review: ['pageNumber', 'coreConcepts', 'essenceExplanation', 'contextRelation', 'examFocus', 'pitfalls', 'guidedQuestions'],
  examiner_perspective: ['testedPoints', 'examinerIntent', 'surfaceTraps', 'underlyingLogic', 'transferQuestions'],
  feynman: ['accurateParts', 'biggestDeviation', 'whyDeviationMatters', 'twelveYearOldExplanation', 'checkingQuestion'],
  multi_source_collision: ['sourceViews', 'conflicts', 'evidenceStrength', 'adoptableConclusions', 'doubtsToKeep'],
};

for (const mode of LEARNING_MODES) {
  const analysis = buildMockAnalysis({
    subject: 'CSAPP',
    mode: mode.id,
    preferences: ['framework_first'],
    pageNumber: 12,
    materialText: '缓存（cache）和局部性（locality）材料',
  });

  assert.equal(analysis.mode, mode.id, `${mode.id} should preserve mode id`);
  assert.ok(analysis.topic, `${mode.id} should have a topic`);
  assert.match(analysis.topic, /[\u4e00-\u9fa5]/, `${mode.id} topic should contain Chinese`);
  assert.match(
    JSON.stringify(analysis),
    /缓存未命中（cache miss）|局部性（locality）|缓存行（cache line）/,
    `${mode.id} should include Chinese terms with English notes`,
  );
  assert.ok(analysis.guidedQuestions.length >= 4, `${mode.id} should include guided questions`);
  assert.equal(analysis.modeSpecific.type, mode.id, `${mode.id} should expose mode-specific type`);

  for (const field of requiredModeFields[mode.id]) {
    assert.ok(analysis.modeSpecific[field], `${mode.id} should include mode-specific field ${field}`);
  }
}

const markdown = buildObsidianMarkdown(
  buildMockAnalysis({
    subject: 'CSAPP',
    mode: 'after_class_review',
    preferences: ['obsidian_output'],
    pageNumber: 12,
    materialText: '缓存（cache）材料',
  }),
  null,
);

assert.match(markdown, /# \[\[/, 'Obsidian markdown should include title wikilink');
assert.match(markdown, /> \[!summary\]/, 'Obsidian markdown should include summary callout');
assert.match(markdown, /> \[!question\]/, 'Obsidian markdown should include question callout');
assert.match(markdown, /> \[!warning\]/, 'Obsidian markdown should include warning callout');
assert.match(markdown, /缓存未命中（cache miss）/, 'Obsidian markdown should include Chinese term with English note');
assert.match(markdown, /PPT 第 12 页/, 'Obsidian markdown should include PPT page source');

const reviewPlan = buildReviewPlanMarkdown(
  {
    totalRecords: 2,
    weakConcepts: [{ label: '缓存未命中（cache miss）', count: 2 }],
    frequentErrorTypes: [{ label: '因果关系混淆', count: 1 }],
    recentTopics: ['局部性（locality）'],
    nextReviewSuggestion: '优先复习缓存未命中（cache miss）。',
  },
  [],
  [
    {
      id: 'q2',
      question: '为什么局部性（locality）能提升缓存命中率？',
      concept: '局部性（locality）',
      typeLabel: '底层逻辑型',
      status: '待追问',
    },
  ],
);

const questionTypeStats = buildQuestionTypeStats([
  { typeLabel: '底层逻辑型' },
  { typeLabel: '底层逻辑型' },
  { typeLabel: '工程应用型' },
]);
const restoredQuestions = buildQuestionHistoryFromRecords([
  {
    id: 'record_1',
    title: '缓存复习',
    questionHistory: [
      { id: 'q1', questionId: 'q_cache', question: '为什么缓存行（cache line）会影响性能？', typeLabel: '工程应用型' },
    ],
  },
  {
    id: 'record_2',
    title: '重复问题',
    questionHistory: [
      { id: 'q2', questionId: 'q_cache', question: '为什么缓存行（cache line）会影响性能？', typeLabel: '工程应用型' },
    ],
  },
]);

assert.deepEqual(questionTypeStats[0], { label: '底层逻辑型', count: 2 }, 'question type stats should count repeated labels');
assert.equal(restoredQuestions.length, 1, 'restored question history should deduplicate repeated questions');
assert.equal(restoredQuestions[0].sourceRecordTitle, '缓存复习', 'restored question should retain source record title');
assert.match(reviewPlan, /# \[\[ScaffoldMind 明序复习计划\]\]/, 'review plan should include title wikilink');
assert.match(reviewPlan, /> \[!summary\]/, 'review plan should include summary callout');
assert.match(reviewPlan, /\[\[缓存未命中（cache miss）\]\]/, 'review plan should include weak concept wikilink');
assert.match(reviewPlan, /\[\[底层逻辑型\]\]/, 'review plan should include common question type wikilink');
assert.match(reviewPlan, /> \[!question\]/, 'review plan should include pending questions callout');

const realMeta = getProviderSourceMeta({
  providerStatus: 'real_api',
  providerLabel: 'OpenAI',
  model: 'gpt-test',
});
assert.equal(realMeta.label, '真实 AI · OpenAI / gpt-test', 'provider meta should label real API results');

const fallbackDetails = formatFallbackDetails({
  providerStatus: 'fallback',
  fallbackReason: 'custom_missing_api_key',
  validationErrors: ['字段缺失'],
});
assert.match(fallbackDetails[0], /没有配置当前 provider 的 API Key/, 'fallback details should explain missing API key in Chinese');
assert.equal(fallbackDetails[1], '字段缺失', 'fallback details should preserve validation errors');

assert.equal(validateMaterialInput('', {}).valid, false, 'empty material input should be rejected');
assert.equal(
  validateMaterialInput('', { '资料 B': '局部性（locality）材料' }).valid,
  true,
  'mode-specific material fields should count as valid material input',
);
assert.equal(validateUserAttempt('   ').valid, false, 'empty user attempt should be rejected');
assert.equal(validateUserAttempt('缓存未命中（cache miss）说明请求数据不在缓存中。').valid, true, 'non-empty user attempt should pass');

console.log('Frontend structured learning verification passed.');
