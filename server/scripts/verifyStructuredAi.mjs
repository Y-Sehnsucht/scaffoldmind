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

    const content =
      requestCount === 1
        ? '这是一段纯文本，不是 JSON。'
        : JSON.stringify({
            errorType: '因果关系混淆',
            quotedIssue: '因为缓存太小。',
            whatIsCorrect: '你注意到了容量会影响缓存效果，这是有价值的起点。',
            mainProblem: '把缓存未命中（cache miss）完全归因于容量，而忽略了局部性（locality）和访问模式。',
            whyItMatters: '考试常区分容量、时间局部性（temporal locality）和空间局部性（spatial locality）的因果关系。',
            suggestion: '先说明请求数据不在缓存中，再分析为什么访问模式会导致未命中。',
            reinforcementTask: '举一个数组顺序访问和随机访问的例子，比较缓存命中率差异。',
          });

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

try {
  const { generateDiagnosis } = await import('../services/aiService.js');
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

  console.log('Structured AI verification passed.');
} finally {
  await new Promise((resolve) => provider.close(resolve));
}
