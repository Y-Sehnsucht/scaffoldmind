import assert from 'node:assert/strict';
import { createApp } from '../app.js';

const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const health = await getJson(`${baseUrl}/api/health`);
  assert.equal(health.status, 200, 'health should return 200');
  assert.equal(health.body.ok, true, 'health should use ok response');
  assert.equal(health.body.data.service, 'scaffoldmind-server', 'health should identify service');

  const validAnalyze = await postJson(`${baseUrl}/api/analyze`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    preferences: ['framework_first'],
    pageNumber: 12,
    materialText: 'cache material',
  });
  assert.equal(validAnalyze.status, 200, 'analyze should return 200 for valid input');
  assert.equal(validAnalyze.body.ok, true, 'analyze should use ok/data shape');
  assert.ok(validAnalyze.body.data.topic, 'analyze should return mock analysis topic');

  const invalidAnalyze = await postJson(`${baseUrl}/api/analyze`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
  });
  assert.equal(invalidAnalyze.status, 400, 'analyze should return 400 for missing materialText');
  assert.equal(invalidAnalyze.body.ok, false, 'validation errors should use ok false');
  assert.equal(invalidAnalyze.body.error.code, 'VALIDATION_ERROR', 'validation error code should be stable');

  const validDiagnose = await postJson(`${baseUrl}/api/diagnose`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    question: 'Explain cache miss.',
    userAttempt: 'Cache is too small.',
  });
  assert.equal(validDiagnose.status, 200, 'diagnose should return 200 for valid input');
  assert.equal(validDiagnose.body.ok, true, 'diagnose should use ok/data shape');
  assert.equal(validDiagnose.body.data.quotedIssue, 'Cache is too small.', 'diagnose should quote user attempt');

  console.log('Mock API verification passed.');
} finally {
  await new Promise((resolve) => server.close(resolve));
}

async function getJson(url) {
  const response = await fetch(url);
  return {
    status: response.status,
    body: await response.json(),
  };
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
