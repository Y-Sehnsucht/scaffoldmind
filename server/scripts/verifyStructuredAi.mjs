import assert from 'node:assert/strict';
import { createServer } from 'node:http';

let capturedPayload = null;
let requestCount = 0;

const provider = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    requestCount += 1;
    capturedPayload = JSON.parse(Buffer.concat(chunks).toString('utf8'));

    let content = '这是一段纯文本，不是 JSON。';

    if (requestCount === 2) {
      content = JSON.stringify({
            errorType: '因果关系混淆',
            quotedIssue: '因为缓存太小。',
            whatIsCorrect: '你注意到了容量会影响缓存效果，这是有价值的起点。',
            mainProblem: '把缓存未命中（cache miss）完全归因于容量，而忽略了局部性（locality）和访问模式。',
            whyItMatters: '考试常区分容量、时间局部性（temporal locality）和空间局部性（spatial locality）的因果关系。',
            suggestion: '先说明请求数据不在缓存中，再分析为什么访问模式会导致未命中。',
            reinforcementTask: '举一个数组顺序访问和随机访问的例子，比较缓存命中率差异。',
      });
    }

    if (requestCount >= 3) {
      content = JSON.stringify({
        topic: '缓存未命中（cache miss）自检',
        summary: '用于确认真实 provider 可以返回结构化中文学习解析。',
        coreConcepts: [
          {
            name: '缓存未命中（cache miss）',
            simpleExplanation: 'CPU 需要的数据不在当前缓存层。',
            essence: '快速访问需求与内存层级状态不匹配。',
            relatedConcepts: ['局部性（locality）'],
          },
        ],
        whyThisMatters: '它直接影响程序性能分析和考试中的访问序列推理。',
        contextRelation: {
          previous: '需要理解局部性（locality）。',
          current: '解释缓存访问为什么会变慢。',
          next: '连接缓存优化和访问模式分析。',
        },
        examFocus: ['判断访问序列中的命中与未命中。'],
        engineeringUse: ['优化数组访问顺序。'],
        pitfalls: ['不要把所有未命中都归因于缓存容量。'],
        guidedQuestions: [
          {
            id: 'q_preflight',
            type: 'bottom_logic',
            typeLabel: '底层逻辑型',
            question: '为什么局部性（locality）会影响缓存命中率？',
            reason: '这能检查是否理解访问模式与缓存状态的关系。',
            pageNumber: 1,
            concept: '局部性（locality）',
          },
        ],
        userTask: {
          question: '用一句话解释缓存未命中（cache miss）。',
          expectedKeyPoints: ['数据不在缓存中', '需要访问更慢的存储层级'],
        },
        modeSpecific: {
          type: 'after_class_review',
          title: '真实 AI 自检',
        },
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content,
            },
          },
        ],
      }),
    );
  });
});

await new Promise((resolve) => provider.listen(0, '127.0.0.1', resolve));
const { port } = provider.address();

process.env.AI_PROVIDER = 'custom';
process.env.CUSTOM_API_KEY = 'test_key';
process.env.CUSTOM_API_URL = `http://127.0.0.1:${port}/chat/completions`;
process.env.CUSTOM_MODEL = 'fake-plain-text-model';

const browserAiConfig = {
  provider: 'custom',
  providerLabel: 'Custom',
  apiKey: 'browser_saved_test_key',
  apiUrl: `http://127.0.0.1:${port}/chat/completions`,
  model: 'browser-configured-fake-model',
  jsonResponseFormat: 'json_object',
};

try {
  const { generateDiagnosis, runAiPreflight } = await import('../services/aiService.js');
  const result = await generateDiagnosis({
    subject: 'CSAPP',
    mode: 'after_class_review',
    question: '解释缓存未命中。',
    userAttempt: '因为缓存太小。',
  });

  assert.equal(result.providerStatus, 'fallback', 'plain text provider output should use fallback');
  assert.equal(result.fallbackReason, 'AI_RESPONSE_INVALID', 'plain text provider output should be invalid');
  assert.deepEqual(result.validationErrors, ['Provider response must be structured JSON.']);
  assert.equal(capturedPayload.response_format.type, 'json_object', 'provider request should ask for JSON object output');

  const structuredResult = await generateDiagnosis({
    subject: 'CSAPP',
    mode: 'after_class_review',
    question: '解释缓存未命中。',
    userAttempt: '因为缓存太小。',
  });

  assert.equal(structuredResult.providerStatus, 'real_api', 'structured provider output should be accepted as real API');
  assert.equal(structuredResult.fallbackReason, null, 'structured provider output should not use fallback');
  assert.equal(structuredResult.errorType, '因果关系混淆', 'structured provider output should preserve diagnosis fields');
  assert.match(structuredResult.mainProblem, /缓存未命中（cache miss）/, 'structured provider output should keep Chinese term notes');

  const preflight = await runAiPreflight(browserAiConfig);
  assert.equal(preflight.ready, true, 'preflight should pass when provider returns structured analysis JSON');
  assert.equal(preflight.providerStatus, 'real_api', 'preflight should identify successful real API path');
  assert.equal(preflight.fallbackReason, null, 'preflight should not report fallback on success');
  assert.equal(preflight.hasApiKey, true, 'preflight should report key presence without exposing the key');
  assert.equal(preflight.model, 'browser-configured-fake-model', 'preflight should prefer browser-saved AI config');

  const { createApp } = await import('../app.js');
  const app = createApp();
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port: appPort } = server.address();
    const preflightResponse = await postJson(`http://127.0.0.1:${appPort}/api/ai/preflight`, { aiConfig: browserAiConfig });

    assert.equal(preflightResponse.status, 200, 'preflight route should return 200');
    assert.equal(preflightResponse.body.ok, true, 'preflight route should use ok/data envelope');
    assert.equal(preflightResponse.body.data.ready, true, 'preflight route should report ready for structured provider output');
    assert.equal(preflightResponse.body.data.hasApiKey, true, 'preflight route should report key presence only as boolean');
    assert.equal(preflightResponse.body.data.model, 'browser-configured-fake-model', 'preflight route should use request AI config');
    assert.equal(
      Object.prototype.hasOwnProperty.call(preflightResponse.body.data, 'textGenerationApiKey'),
      false,
      'preflight route should not expose any API key field',
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('Structured AI verification passed.');
} finally {
  await new Promise((resolve) => provider.close(resolve));
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}
