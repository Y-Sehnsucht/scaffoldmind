import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { serverDirectory } from '../config/env.js';
import {
  buildLearningProfileSummary,
  closeDatabase,
  createLearningRecord,
  listLearningRecords,
} from '../services/recordStore.js';

const dataDirectory = path.join(serverDirectory, 'data');
const storePath = path.join(dataDirectory, 'learning-records.json');
const originalExists = existsSync(storePath);
const originalContent = originalExists ? readFileSync(storePath, 'utf8') : '';

try {
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(storePath, '{ this is not valid json', 'utf8');
  closeDatabase();

  assert.deepEqual(listLearningRecords(), [], 'corrupted record store should load as an empty list');

  const record = createLearningRecord({
    id: 'record_store_recovery_test',
    title: '缓存未命中（cache miss）恢复测试',
    subject: 'CSAPP',
    mode: 'after_class_review',
    modeLabel: '课后深度复习',
    source: 'ai_platform',
    input: '缓存未命中（cache miss）与局部性（locality）',
    analysis: {
      topic: '缓存未命中（cache miss）恢复测试',
      coreConcepts: [{ name: '缓存未命中（cache miss）' }],
      guidedQuestions: [{ typeLabel: '底层逻辑型' }],
    },
    diagnosis: {
      errorType: '因果关系混淆',
    },
    questionHistory: [{ typeLabel: '底层逻辑型', question: '为什么会未命中？' }],
  });

  assert.equal(record.title, '缓存未命中（cache miss）恢复测试', 'record store should save after corruption recovery');
  assert.equal(listLearningRecords()[0].id, 'record_store_recovery_test', 'saved record should be readable');

  const profile = buildLearningProfileSummary();
  assert.equal(profile.totalRecords, 1, 'profile should count recovered record');
  assert.deepEqual(profile.commonQuestionTypes[0], { label: '底层逻辑型', count: 1 }, 'profile should include question type stats');

  console.log('Record store verification passed.');
} finally {
  closeDatabase();

  if (originalExists) {
    writeFileSync(storePath, originalContent, 'utf8');
  } else if (existsSync(storePath)) {
    rmSync(storePath);
  }

  closeDatabase();
}
