import assert from 'node:assert/strict';
import { ApiResponseError, createJsonRequest, mockBackendApi, parseApiResponse, requestJson } from '../src/shared/api/client.js';
import { formatRecoverableError } from '../src/utils/errorMessages.js';

const okData = parseApiResponse({ ok: true, data: { topic: 'Cache Miss' } });
assert.equal(okData.topic, 'Cache Miss', 'ok true envelope should return data');

assert.throws(
  () => parseApiResponse({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Missing materialText' } }),
  (error) => error instanceof ApiResponseError && error.code === 'VALIDATION_ERROR',
  'ok false envelope should throw ApiResponseError',
);

const request = createJsonRequest('/api/analyze', { subject: 'CSAPP' });
assert.equal(request.url, 'http://localhost:3001/api/analyze', 'request builder should target backend base URL');
assert.equal(request.options.method, 'POST', 'request builder should use POST');
assert.equal(JSON.parse(request.options.body).subject, 'CSAPP', 'request builder should serialize JSON body');

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({ url, options });

  return {
    ok: true,
    async json() {
      return { ok: true, data: { topic: 'Backend Demo Analysis' } };
    },
  };
};

const response = await mockBackendApi.analyze({
  subject: 'CSAPP',
  mode: 'after_class_review',
  materialText: 'cache material',
});

assert.equal(response.topic, 'Backend Demo Analysis', 'backend helper should return parsed data');
assert.equal(calls[0].url, 'http://localhost:3001/api/analyze', 'backend helper should call analyze endpoint');
assert.equal(calls[0].options.method, 'POST', 'backend helper should construct POST request');
assert.equal(JSON.parse(calls[0].options.body).mode, 'after_class_review', 'backend helper should send payload');

await mockBackendApi.parsePpt({
  fileName: 'demo.pptx',
  fileBase64: 'UEsDBAo=',
  pageNumber: 1,
});

assert.equal(calls[1].url, 'http://localhost:3001/api/parse-ppt', 'parsePpt helper should call parse-ppt endpoint');
assert.equal(JSON.parse(calls[1].options.body).fileName, 'demo.pptx', 'parsePpt helper should send fileName');

await mockBackendApi.extractMaterial(new Blob(['# Cache\nLocality material'], { type: 'text/markdown' }));
assert.equal(calls[2].url, 'http://localhost:3001/api/materials/extract', 'material helper should call extract endpoint');
assert.equal(calls[2].options.method, 'POST', 'material helper should use POST');
assert.ok(calls[2].options.body instanceof FormData, 'material helper should send multipart form data');
assert.equal(calls[2].options.headers, undefined, 'material helper should not force JSON headers');

await mockBackendApi.saveRecord({ analysis: { topic: 'Cache Miss' } });
assert.equal(calls[3].url, 'http://localhost:3001/api/records', 'save record helper should call records endpoint');
assert.equal(calls[3].options.method, 'POST', 'save record helper should use POST');

await mockBackendApi.listRecords(10);
assert.equal(calls[4].url, 'http://localhost:3001/api/records?limit=10', 'list records helper should include limit');

await mockBackendApi.profileSummary();
assert.equal(calls[5].url, 'http://localhost:3001/api/profile/summary', 'profile helper should call profile endpoint');

await mockBackendApi.clearRecords();
assert.equal(calls[6].url, 'http://localhost:3001/api/records', 'clear records helper should call records endpoint');
assert.equal(calls[6].options.method, 'DELETE', 'clear records helper should use DELETE');

global.fetch = async () => {
  throw new TypeError('fetch failed');
};

await assert.rejects(
  () => requestJson('/api/health'),
  (error) => error instanceof ApiResponseError && error.code === 'BACKEND_UNAVAILABLE',
  'network failure should become BACKEND_UNAVAILABLE',
);

assert.match(
  formatRecoverableError(new ApiResponseError('Missing materialText', 'VALIDATION_ERROR'), 'backend'),
  /缺少必要字段/,
  'validation errors should have a recoverable Chinese message',
);
assert.match(
  formatRecoverableError(new ApiResponseError('Express backend unavailable', 'BACKEND_UNAVAILABLE'), 'real_api'),
  /后端暂时不可用/,
  'backend unavailable errors should explain how to recover',
);

console.log('API client verification passed.');
