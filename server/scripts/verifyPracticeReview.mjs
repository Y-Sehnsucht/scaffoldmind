import assert from 'node:assert/strict';
import { createApp } from '../app.js';

const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const generated = await postJson(`${baseUrl}/api/practice/generate`, {
    subject: 'CSAPP',
    concept: '补码溢出',
    difficulty: 'medium',
    learnerProfile: {},
    recentMistakes: [],
  });
  assert.equal(generated.status, 200, 'practice generate should return 200');
  assert.equal(generated.body.ok, true, 'practice generate should use ok/data envelope');
  assert.ok(generated.body.data.question, 'practice generate should return question');
  assert.equal(generated.body.data.answerType, 'short_answer', 'practice question should be short_answer');
  assert.ok(Array.isArray(generated.body.data.expectedKeyPoints), 'practice question should include expected key points');

  const invalidGenerated = await postJson(`${baseUrl}/api/practice/generate`, {
    subject: 'CSAPP',
    difficulty: 'medium',
  });
  assert.equal(invalidGenerated.status, 400, 'practice generate should validate concept');
  assert.equal(invalidGenerated.body.error.code, 'VALIDATION_ERROR', 'practice validation error should be stable');

  const evaluated = await postJson(`${baseUrl}/api/practice/evaluate`, {
    question: generated.body.data.question,
    userAnswer: '补码溢出需要关注符号位变化和边界条件。',
    expectedKeyPoints: generated.body.data.expectedKeyPoints,
    knowledgePoint: generated.body.data.knowledgePoint,
    subject: 'CSAPP',
  });
  assert.equal(evaluated.status, 200, 'practice evaluate should return 200');
  assert.equal(evaluated.body.ok, true, 'practice evaluate should use ok/data envelope');
  assert.equal(typeof evaluated.body.data.correct, 'boolean', 'practice evaluate should return correct boolean');
  assert.equal(typeof evaluated.body.data.score, 'number', 'practice evaluate should return numeric score');

  const reviewPlan = await postJson(`${baseUrl}/api/review/plan`, {
    learnerProfile: {},
    recentConversations: [],
    practiceStats: {},
    weakConcepts: ['补码溢出', '缓存未命中（cache miss）'],
  });
  assert.equal(reviewPlan.status, 200, 'review plan should return 200');
  assert.equal(reviewPlan.body.ok, true, 'review plan should use ok/data envelope');
  assert.ok(Array.isArray(reviewPlan.body.data.priorityConcepts), 'review plan should include priority concepts');
  assert.ok(Array.isArray(reviewPlan.body.data.reviewPlan), 'review plan should include review plan items');
  assert.ok(Array.isArray(reviewPlan.body.data.recommendedPractice), 'review plan should include practice recommendations');

  console.log('Practice and review API verification passed.');
} finally {
  await new Promise((resolve) => server.close(resolve));
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}
