import assert from 'node:assert/strict';
import { ApiResponseError, createJsonRequest, mockBackendApi, parseApiResponse } from '../src/shared/api/client.js';

const okData = parseApiResponse({ ok: true, data: { topic: 'Cache Miss' } });
assert.equal(okData.topic, 'Cache Miss', 'ok true envelope should return data');

assert.throws(
  () => parseApiResponse({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Missing materialText' } }),
  (error) => error instanceof ApiResponseError && error.code === 'VALIDATION_ERROR',
  'ok false envelope should throw ApiResponseError',
);

const request = createJsonRequest('/api/analyze', { subject: 'CSAPP' });
assert.equal(request.url, 'http://localhost:3001/api/analyze', 'request builder should target backend mock base URL');
assert.equal(request.options.method, 'POST', 'request builder should use POST');
assert.equal(JSON.parse(request.options.body).subject, 'CSAPP', 'request builder should serialize JSON body');

const calls = [];
global.fetch = async (url, options) => {
  calls.push({ url, options });

  return {
    ok: true,
    async json() {
      return { ok: true, data: { topic: 'Backend Mock Analysis' } };
    },
  };
};

const response = await mockBackendApi.analyze({
  subject: 'CSAPP',
  mode: 'after_class_review',
  materialText: 'cache material',
});

assert.equal(response.topic, 'Backend Mock Analysis', 'mock backend helper should return parsed data');
assert.equal(calls[0].url, 'http://localhost:3001/api/analyze', 'mock backend helper should call analyze endpoint');
assert.equal(calls[0].options.method, 'POST', 'mock backend helper should construct POST request');
assert.equal(JSON.parse(calls[0].options.body).mode, 'after_class_review', 'mock backend helper should send payload');

console.log('API client verification passed.');
