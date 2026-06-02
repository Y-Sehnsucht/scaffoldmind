import assert from 'node:assert/strict';
import { createServer } from 'node:http';

let capturedPayload = null;

const provider = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    capturedPayload = JSON.parse(Buffer.concat(chunks).toString('utf8'));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content: '这是一段纯文本，不是 JSON。',
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

  console.log('Structured AI verification passed.');
} finally {
  await new Promise((resolve) => provider.close(resolve));
}
