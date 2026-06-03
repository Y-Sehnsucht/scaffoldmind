import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { buildAgentChatPrompt, buildAgentEvaluationPrompt } from '../services/promptBuilder.js';

const defaultPrompt = buildAgentChatPrompt({
  subject: 'CSAPP',
  mode: 'default',
  message: '哈希表学习的框架是什么？5 个核心概念是什么？它和上周内容有什么关系？如何教给零基础的人？',
  learnerProfile: {
    positiveFeedbackCount: 1,
    negativeFeedbackCount: 2,
    frequentTopics: [{ label: '缓存未命中（cache miss）', count: 2 }],
    repeatedQuestionPatterns: [{ normalizedQuestion: 'cachemiss', count: 2 }],
    answerStylePreference: { wantsConcise: true, wantsExamFocus: true },
    recentFeedbackSummary: '用户倾向简洁、关注考试。',
  },
});

assert.match(defaultPrompt.systemPrompt, /识别用户问题中包含的所有子问题/, 'default prompt should require subquestion detection');
assert.match(defaultPrompt.systemPrompt, /逐一回答/, 'default prompt should require answering every subquestion');
assert.match(defaultPrompt.systemPrompt, /不要机械套用固定模板/, 'default prompt should reject rigid templates');
assert.match(defaultPrompt.systemPrompt, /学习框架/, 'default prompt should cover learning framework when asked');
assert.match(defaultPrompt.systemPrompt, /核心概念/, 'default prompt should cover core concepts when asked');
assert.match(defaultPrompt.systemPrompt, /旧知识的关系/, 'default prompt should connect previous knowledge when asked');
assert.match(defaultPrompt.systemPrompt, /零基础的人/, 'default prompt should include teaching-to-beginner guidance when asked');
assert.doesNotMatch(defaultPrompt.systemPrompt, /首次知识回答必须严格包含/, 'default prompt should not force first-answer template');
assert.match(defaultPrompt.userPrompt, /用户学习画像/, 'agent prompt should include learner profile section when profile exists');
assert.match(defaultPrompt.userPrompt, /回答优化要求/, 'agent prompt should include answer optimization guidance');

const contextPrompt = buildAgentChatPrompt({
  subject: 'CSAPP',
  mode: 'context_stacking',
  message: '预习 cache locality。',
});
assert.match(contextPrompt.systemPrompt, /预习路线/, 'context stacking prompt should require preview route');
assert.match(contextPrompt.systemPrompt, /前置知识连接/, 'context stacking prompt should require prerequisites');
assert.match(contextPrompt.systemPrompt, /课堂验证清单/, 'context stacking prompt should require classroom checklist');
assert.match(contextPrompt.systemPrompt, /老师可能怎么考/, 'context stacking prompt should require exam prediction');
assert.match(contextPrompt.systemPrompt, /不要反问用户/, 'context stacking prompt should forbid asking back');
assert.match(contextPrompt.systemPrompt, /不要要求用户先作答/, 'context stacking prompt should forbid requiring user answer first');

const feynmanPrompt = buildAgentChatPrompt({
  subject: 'CSAPP',
  mode: 'feynman',
  message: '我想用费曼法学习哈希表。',
});
assert.match(feynmanPrompt.systemPrompt, /请先邀请用户用自己的话解释/, 'feynman prompt should ask user to explain first');
assert.match(feynmanPrompt.systemPrompt, /不要长篇讲义/, 'feynman prompt should not produce lecture first');
assert.doesNotMatch(feynmanPrompt.systemPrompt, /首次知识回答必须严格包含/, 'feynman prompt should not use first-answer template');

const evaluationPrompt = buildAgentEvaluationPrompt({
  subject: 'CSAPP',
  mode: 'feynman',
  message: '缓存就是更大的内存。',
  interaction: { optionText: '我来反讲，请你纠错', topic: '缓存（cache）' },
  history: [],
});
assert.match(evaluationPrompt.systemPrompt, /## 评价/, 'evaluation prompt should require evaluation section');
assert.match(evaluationPrompt.systemPrompt, /## 准确点/, 'evaluation prompt should require accurate points section');
assert.match(evaluationPrompt.systemPrompt, /## 思维漏洞/, 'evaluation prompt should require thinking holes section');
assert.match(evaluationPrompt.systemPrompt, /## 概念混淆/, 'evaluation prompt should require concept confusion section');
assert.match(evaluationPrompt.systemPrompt, /## 如何改写/, 'evaluation prompt should require rewrite section');
assert.match(evaluationPrompt.systemPrompt, /## 下一步追问/, 'evaluation prompt should require follow-up section');
assert.doesNotMatch(evaluationPrompt.systemPrompt, /首次知识回答必须严格包含/, 'evaluation prompt should not require normal first-answer structure');

const originalFetch = global.fetch;
const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  global.fetch = async (url, options) => {
    const target = String(url);
    if (target.startsWith(baseUrl)) return originalFetch(url, options);
    return new Response(JSON.stringify({ error: 'provider disabled for acceptance test' }), { status: 500 });
  };

  const invalid = await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: 'CSAPP', mode: 'default', message: '' }),
  });
  const invalidBody = await invalid.json();
  assert.equal(invalid.status, 400, 'empty message should return 400');
  assert.equal(invalidBody.ok, false, 'validation should use ok false envelope');
  assert.equal(invalidBody.error.code, 'VALIDATION_ERROR', 'validation should use stable error code');

  const defaultFallback = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'CSAPP',
        mode: 'default',
        message: '哈希表学习的框架是什么？5 个核心概念是什么？它和上周内容有什么关系？如何教给零基础的人？',
        attachments: [{ name: 'lecture.pptx', size: 1234, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }],
        history: [],
      }),
    }),
  );
  assert.equal(defaultFallback.status, 200, 'provider failure should still stream fallback');
  assert.ok(defaultFallback.text.includes('## 学习主线'), 'default fallback should use dynamic learning main line');
  assert.ok(defaultFallback.text.includes('## 一、先回答你的问题'), 'default fallback should answer current question');
  assert.ok(defaultFallback.text.includes('## 三、与旧知识的关系'), 'default fallback should connect old knowledge');
  assert.ok(defaultFallback.text.includes('## 四、如果教给零基础的人'), 'default fallback should include beginner teaching guidance');
  assert.ok(!defaultFallback.text.includes('## 5 个核心概念\n'), 'default fallback should not use rigid first-answer concept section');
  assert.ok(defaultFallback.text.includes('当前版本暂不解析内容'), 'fallback should preserve attachment metadata-only rule');

  const contextFallback = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'CSAPP', mode: 'context_stacking', message: '预习缓存 locality。' }),
    }),
  );
  assert.ok(contextFallback.text.includes('## 预习路线'), 'context fallback should include preview route');
  assert.ok(contextFallback.text.includes('## 前置知识连接'), 'context fallback should include prerequisites');
  assert.ok(contextFallback.text.includes('## 课堂验证清单'), 'context fallback should include classroom checklist');
  assert.ok(contextFallback.text.includes('## 老师可能怎么考'), 'context fallback should include exam prediction');
  assert.ok(!contextFallback.text.includes('请你先回答'), 'context fallback should not ask user to answer first');

  const feynmanFallback = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: 'CSAPP', mode: 'feynman', message: '我想用费曼法学习哈希表。' }),
    }),
  );
  assert.ok(feynmanFallback.text.includes('## 先别急着看讲义'), 'feynman fallback should invite user explanation first');
  assert.ok(feynmanFallback.text.includes('请用自己的话解释'), 'feynman fallback should ask user to explain');
  assert.ok(!feynmanFallback.text.includes('## 学习主线'), 'feynman topic-only fallback should not output default lecture');

  const evaluation = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'CSAPP',
        mode: 'feynman',
        requestType: 'evaluate_interaction_answer',
        message: '我觉得递归就是函数一直调用自己，直到结束。',
        interaction: {
          optionText: '我来反讲，请你纠错',
          interactionType: 'user_answer_required',
          topic: '递归（recursion）',
        },
      }),
    }),
  );
  assert.ok(evaluation.text.includes('## 评价'), 'evaluation fallback should include evaluation section');
  assert.ok(evaluation.text.includes('## 准确点'), 'evaluation fallback should include accurate points section');
  assert.ok(evaluation.text.includes('## 思维漏洞'), 'evaluation fallback should include thinking holes section');
  assert.ok(evaluation.text.includes('## 概念混淆'), 'evaluation fallback should include concept confusion section');
  assert.ok(evaluation.text.includes('## 如何改写'), 'evaluation fallback should include rewrite section');
  assert.ok(evaluation.text.includes('## 下一步追问'), 'evaluation fallback should include next follow-up section');
  assert.ok(!evaluation.text.includes('## 5 个核心概念'), 'evaluation fallback should not output normal first-answer structure');

  console.log('Agent Chat stream verification passed.');
} finally {
  global.fetch = originalFetch;
  await new Promise((resolve) => server.close(resolve));
}

async function readSse(response) {
  const raw = await response.text();
  const events = raw
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => JSON.parse(line.slice(5).trim()));
  const text = events.filter((event) => event.type === 'delta').map((event) => event.text).join('');
  return { status: response.status, events, text };
}
