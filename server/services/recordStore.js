import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { serverDirectory } from '../config/env.js';

const dataDirectory = path.join(serverDirectory, 'data');
const defaultStorePath = path.join(dataDirectory, 'learning-records.json');

let cachedRecords = null;

export function createLearningRecord(input) {
  const record = normalizeRecord(input);
  const records = loadRecords();
  const existingIndex = records.findIndex((item) => item.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.unshift(record);
  }

  saveRecords(records);
  return record;
}

export function listLearningRecords(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return loadRecords()
    .toSorted((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, safeLimit);
}

export function deleteLearningRecord(id) {
  const records = loadRecords();
  const nextRecords = records.filter((record) => record.id !== id);

  if (nextRecords.length === records.length) {
    return false;
  }

  saveRecords(nextRecords);
  return true;
}

export function clearLearningRecords() {
  saveRecords([]);
}

export function closeDatabase() {
  cachedRecords = null;
}

export function buildLearningProfileSummary(limit = 50) {
  const records = listLearningRecords(limit);
  const errorTypes = countValues(records.map((record) => record.diagnosis?.errorType).filter(Boolean));
  const concepts = countValues(
    records.flatMap((record) => (record.analysis?.coreConcepts || []).map((concept) => concept.name).filter(Boolean)),
  );
  const questionTypes = countValues(
    records
      .flatMap((record) => record.questionHistory || record.analysis?.guidedQuestions || [])
      .map((question) => question.typeLabel || question.type)
      .filter(Boolean),
  );
  const modes = countValues(records.map((record) => record.modeLabel || record.mode).filter(Boolean));
  const topics = records.map((record) => record.title).filter(Boolean).slice(0, 5);

  return {
    totalRecords: records.length,
    frequentErrorTypes: topItems(errorTypes, 5),
    weakConcepts: topItems(concepts, 8),
    commonQuestionTypes: topItems(questionTypes, 5),
    commonModes: topItems(modes, 5),
    recentTopics: topics,
    nextReviewSuggestion: buildNextReviewSuggestion(errorTypes, concepts),
    updatedAt: new Date().toISOString(),
  };
}

function loadRecords() {
  if (cachedRecords) {
    return cachedRecords;
  }

  mkdirSync(dataDirectory, { recursive: true });

  if (!existsSync(defaultStorePath)) {
    cachedRecords = [];
    return cachedRecords;
  }

  try {
    const raw = readFileSync(defaultStorePath, 'utf8');
    const parsed = JSON.parse(raw);
    cachedRecords = Array.isArray(parsed) ? parsed.map(normalizeRecord) : [];
  } catch {
    cachedRecords = [];
  }

  return cachedRecords;
}

function saveRecords(records) {
  mkdirSync(dataDirectory, { recursive: true });
  cachedRecords = records;
  writeFileSync(defaultStorePath, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
}

function normalizeRecord(input = {}) {
  const createdAt = input.createdAt || new Date().toISOString();
  const id = input.id || `record_${randomUUID()}`;

  return {
    id,
    title: input.title || input.analysis?.topic || '未命名学习记录',
    subject: input.subject || 'CSAPP',
    mode: input.mode || 'after_class_review',
    modeLabel: input.modeLabel || input.mode || '课后深度复习',
    mockSource: input.mockSource || input.source || 'local',
    input: input.input || '',
    analysis: input.analysis || null,
    deepDive: input.deepDive || null,
    userAnswer: input.userAnswer || '',
    diagnosis: input.diagnosis || null,
    obsidianMarkdown: input.obsidianMarkdown || '',
    questionHistory: Array.isArray(input.questionHistory) ? input.questionHistory.slice(0, 50) : [],
    createdAt,
  };
}

function countValues(values) {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map());
}

function topItems(counts, limit) {
  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function buildNextReviewSuggestion(errorTypes, concepts) {
  const topError = topItems(errorTypes, 1)[0]?.label;
  const topConcept = topItems(concepts, 1)[0]?.label;

  if (topError && topConcept) {
    return `优先用费曼反讲复习 ${topConcept}，重点检查“${topError}”这类偏差。`;
  }

  if (topConcept) {
    return `下一次可以围绕 ${topConcept} 做一次课后深度复习。`;
  }

  return '保存几次学习记录后，这里会生成更具体的复习建议。';
}
