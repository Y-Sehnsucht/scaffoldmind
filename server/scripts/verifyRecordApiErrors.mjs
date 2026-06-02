import assert from 'node:assert/strict';
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createApp } from '../app.js';
import { serverDirectory } from '../config/env.js';
import { closeDatabase } from '../services/recordStore.js';

const dataDirectory = path.join(serverDirectory, 'data');
const storePath = path.join(dataDirectory, 'learning-records.json');
const originalState = snapshotStore();

try {
  mkdirSync(dataDirectory, { recursive: true });
  restoreEmptyStorePath();
  mkdirSync(storePath);
  closeDatabase();

  const app = createApp();
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const failedSave = await postJson(`${baseUrl}/api/records`, {
      id: 'record_store_write_failure_test',
      title: '记录写入失败测试',
      subject: 'CSAPP',
      mode: 'after_class_review',
      modeLabel: '课后深度复习',
      input: '缓存未命中（cache miss）',
      analysis: {
        topic: '记录写入失败测试',
        coreConcepts: [{ name: '缓存未命中（cache miss）' }],
        guidedQuestions: [{ typeLabel: '底层逻辑型', question: '为什么会写入失败？' }],
      },
    });

    assert.equal(failedSave.status, 500, 'record save should surface a server error when persistence fails');
    assert.equal(failedSave.body.ok, false, 'failed record save should use ok false');
    assert.equal(failedSave.body.data, null, 'failed record save should keep data null');
    assert.ok(failedSave.body.error?.code, 'failed record save should include an error code');
    assert.ok(failedSave.body.error?.message, 'failed record save should include an error message');

    const records = await getJson(`${baseUrl}/api/records`);
    assert.equal(records.status, 200, 'record list should still recover after failed save');
    assert.deepEqual(records.body.data, [], 'failed save should not leak an unsaved record through in-memory cache');

    console.log('Record API error verification passed.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
} finally {
  closeDatabase();
  restoreOriginalStore(originalState);
  closeDatabase();
}

function snapshotStore() {
  if (!existsSync(storePath)) {
    return { type: 'missing' };
  }

  const stat = lstatSync(storePath);

  if (stat.isDirectory()) {
    return { type: 'directory' };
  }

  return {
    type: 'file',
    content: readFileSync(storePath, 'utf8'),
  };
}

function restoreEmptyStorePath() {
  if (existsSync(storePath)) {
    rmSync(storePath, { recursive: true, force: true });
  }
}

function restoreOriginalStore(state) {
  restoreEmptyStorePath();

  if (state.type === 'file') {
    writeFileSync(storePath, state.content, 'utf8');
  } else if (state.type === 'directory') {
    mkdirSync(storePath, { recursive: true });
  }
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
