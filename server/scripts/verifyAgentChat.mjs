import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { buildAgentChatPrompt, buildAgentEvaluationPrompt } from '../services/promptBuilder.js';

const prompt = buildAgentChatPrompt({
  subject: 'CSAPP',
  mode: 'default',
  message: 'Explain cache miss.',
  learnerProfile: {
    positiveFeedbackCount: 1,
    negativeFeedbackCount: 2,
    frequentTopics: [{ label: '缓存未命中（cache miss）', count: 2 }],
    repeatedQuestionPatterns: [{ normalizedQuestion: 'cachemiss', count: 2 }],
    answerStylePreference: { wantsConcise: true, wantsExamFocus: true },
    recentFeedbackSummary: '用户倾向简洁、关注考试。',
  },
});
assert.match(prompt.userPrompt, /用户学习画像/, 'agent prompt should include learner profile section when profile exists');
assert.match(prompt.userPrompt, /回答优化要求/, 'agent prompt should include answer optimization guidance');

const contextPrompt = buildAgentChatPrompt({
  subject: 'CSAPP',
  mode: 'context_stacking',
  message: 'Explain cache.',
});
assert.match(contextPrompt.systemPrompt, /课前预习路线/, 'context stacking prompt should require preview route option');
assert.match(contextPrompt.systemPrompt, /前置知识/, 'context stacking prompt should require prerequisite option');
assert.match(contextPrompt.systemPrompt, /课堂验证清单/, 'context stacking prompt should require classroom checklist option');
assert.match(contextPrompt.systemPrompt, /老师可能怎么考/, 'context stacking prompt should require exam prediction option');
assert.match(contextPrompt.systemPrompt, /禁止反问用户/, 'context stacking prompt should forbid asking back');
assert.match(contextPrompt.systemPrompt, /禁止要求用户先回答/, 'context stacking prompt should forbid requiring user answer first');
assert.match(contextPrompt.systemPrompt, /主动生成预习路线/, 'context stacking prompt should require direct generation');

const evaluationPrompt = buildAgentEvaluationPrompt({
  subject: 'CSAPP',
  mode: 'feynman',
  message: '缓存就是更大的内存。',
  interaction: { optionText: '我来反讲，请你纠错', topic: '缓存（cache）' },
  history: [],
});
assert.match(evaluationPrompt.systemPrompt, /## 评价/, 'evaluation prompt should require evaluation section');
assert.match(evaluationPrompt.systemPrompt, /## 准确点/, 'evaluation prompt should require accurate points section');
assert.match(evaluationPrompt.systemPrompt, /## 主要偏差/, 'evaluation prompt should require deviation section');
assert.match(evaluationPrompt.systemPrompt, /## 修改建议/, 'evaluation prompt should require suggestion section');
assert.match(evaluationPrompt.systemPrompt, /## 下一步练习/, 'evaluation prompt should require next practice section');
assert.doesNotMatch(evaluationPrompt.systemPrompt, /## 总结、## 框架、## 5 个核心概念、## 你可以继续选择。必须输出/, 'evaluation prompt should not require normal first-answer structure');

const originalFetch = global.fetch;
const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  global.fetch = async (url, options) => {
    const target = String(url);

    if (target.startsWith(baseUrl)) {
      return originalFetch(url, options);
    }

    if (String(options?.body || '').includes('force_context_fallback')) {
      return new Response(JSON.stringify({ error: 'context fallback requested' }), { status: 500 });
    }

    if (String(options?.body || '').includes('## 评价')) {
      return new Response(JSON.stringify({ error: 'evaluation provider failed' }), { status: 500 });
    }

    if (target.includes('/fail')) {
      return new Response(JSON.stringify({ error: 'provider failed' }), { status: 500 });
    }

    return new Response(createProviderStream(), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
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

  const valid = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'CSAPP',
        mode: 'context_stacking',
        message: 'Explain cache locality.',
        attachments: [{ name: 'lecture.pptx', size: 1234, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }],
        history: [],
        learnerProfile: { answerStylePreference: { wantsExamFocus: true } },
      }),
    }),
  );

  assert.equal(valid.status, 200, 'agent stream should return 200');
  assert.ok(valid.events.some((event) => event.type === 'status'), 'agent stream should emit status');
  assert.ok(valid.text.includes('## 总结'), 'agent stream should include summary section');
  assert.ok(valid.text.includes('## 框架'), 'agent stream should include framework section');
  assert.ok(valid.text.includes('## 5 个核心概念'), 'agent stream should include concepts section');
  assert.ok(valid.text.includes('## 你可以继续选择'), 'agent stream should include interactive choices section');

  const fallback = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'CSAPP',
        mode: 'feynman',
        message: 'Explain stack frame.',
        learnerProfile: { answerStylePreference: { wantsExamples: true } },
      }),
    }),
  );

  assert.equal(fallback.status, 200, 'provider failure should still stream fallback');
  assert.ok(fallback.text.includes('## 总结'), 'fallback should include summary section');
  assert.ok(fallback.text.includes('## 你可以继续选择'), 'fallback should include options section');
  assert.ok(!fallback.text.includes('<a:t'), 'fallback should not include PPTX XML text tags');
  const contextFallback = await readSse(
    await originalFetch(`${baseUrl}/api/agent/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'CSAPP',
        mode: 'context_stacking',
        message: 'force_context_fallback',
      }),
    }),
  );

  assert.ok(contextFallback.text.includes('帮我建立课前预习路线'), 'context fallback options should mention preview route');
  assert.ok(contextFallback.text.includes('前置知识'), 'context fallback options should mention prerequisites');
  assert.ok(contextFallback.text.includes('课堂验证清单'), 'context fallback options should mention classroom checklist');
  assert.ok(contextFallback.text.includes('老师可能怎么考'), 'context fallback options should mention exam prediction');

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
        learnerProfile: { answerStylePreference: { wantsExamples: true } },
      }),
    }),
  );

  assert.equal(evaluation.status, 200, 'evaluation request should return 200');
  assert.ok(evaluation.text.includes('## 评价'), 'evaluation fallback should include evaluation section');
  assert.ok(evaluation.text.includes('## 准确点'), 'evaluation fallback should include accurate points section');
  assert.ok(evaluation.text.includes('## 主要偏差'), 'evaluation fallback should include deviation section');
  assert.ok(evaluation.text.includes('## 修改建议'), 'evaluation fallback should include suggestion section');
  assert.ok(evaluation.text.includes('## 下一步练习'), 'evaluation fallback should include next practice section');
  assert.ok(!evaluation.text.includes('## 5 个核心概念'), 'evaluation fallback should not output normal first-answer structure');

  console.log('Agent Chat stream verification passed.');
} finally {
  global.fetch = originalFetch;
  await new Promise((resolve) => server.close(resolve));
}

function createProviderStream() {
  const encoder = new TextEncoder();
  const chunks = [
    'data: {"choices":[{"delta":{"content":"## 总结\\n**局部性（locality）**说明程序倾向于重复访问相邻或近期数据，因此缓存（cache）能用较小容量提升平均访问速度。理解它要把访问模式、缓存行（cache line）和缓存未命中（cache miss）连成一条因果链。\\n\\n## 框架\\n1. 时间局部性\\n2. 空间局部性\\n3. 缓存层次\\n\\n## 5 个核心概念\\n1. **局部性（locality）**：程序访问数据通常有规律。\\n2. **缓存（cache）**：保存近期可能再用的数据。\\n3. **缓存行（cache line）**：缓存搬运数据的基本块。\\n4. **命中（hit）**：数据已经在缓存中。\\n5. **未命中（miss）**：需要去更慢层级取数据。\\n\\n## 你可以继续选择\\n1. 帮我生成一条预习路线。\\n2. 帮我连接需要补的前置知识。\\n3. 给我一份课堂验证清单。"}}]}\n\n',
    'data: [DONE]\n\n',
  ];
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
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
