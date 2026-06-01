import assert from 'node:assert/strict';
import { LEARNING_MODES } from '../src/core/constants.js';
import { buildMockAnalysis, buildObsidianMarkdown } from '../src/utils/mockLearning.js';

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

console.log('Mock MVP verification passed.');
