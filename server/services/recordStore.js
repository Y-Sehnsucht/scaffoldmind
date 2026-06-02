import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { serverDirectory } from '../config/env.js';

const dataDirectory = path.join(serverDirectory, 'data');
const defaultDatabasePath = path.join(dataDirectory, 'scaffoldmind.sqlite');

let database;

export function getDatabase() {
  if (!database) {
    mkdirSync(dataDirectory, { recursive: true });
    database = new DatabaseSync(defaultDatabasePath);
    initializeDatabase(database);
  }

  return database;
}

export function closeDatabase() {
  if (database) {
    database.close();
    database = null;
  }
}

export function initializeDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_records (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      mode TEXT NOT NULL,
      mode_label TEXT NOT NULL,
      source TEXT NOT NULL,
      input TEXT NOT NULL,
      analysis_json TEXT NOT NULL,
      deep_dive_json TEXT,
      user_answer TEXT,
      diagnosis_json TEXT,
      obsidian_markdown TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_learning_records_created_at
      ON learning_records(created_at DESC);
  `);
}

export function createLearningRecord(input) {
  const record = normalizeRecord(input);
  const db = getDatabase();

  db.prepare(`
    INSERT INTO learning_records (
      id, title, subject, mode, mode_label, source, input, analysis_json,
      deep_dive_json, user_answer, diagnosis_json, obsidian_markdown, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.title,
    record.subject,
    record.mode,
    record.modeLabel,
    record.mockSource,
    record.input,
    JSON.stringify(record.analysis || null),
    JSON.stringify(record.deepDive || null),
    record.userAnswer || '',
    JSON.stringify(record.diagnosis || null),
    record.obsidianMarkdown || '',
    record.createdAt,
  );

  return record;
}

export function listLearningRecords(limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const rows = getDatabase()
    .prepare('SELECT * FROM learning_records ORDER BY created_at DESC LIMIT ?')
    .all(safeLimit);

  return rows.map(rowToRecord);
}

export function deleteLearningRecord(id) {
  const result = getDatabase().prepare('DELETE FROM learning_records WHERE id = ?').run(id);
  return result.changes > 0;
}

export function clearLearningRecords() {
  getDatabase().prepare('DELETE FROM learning_records').run();
}

export function buildLearningProfileSummary(limit = 50) {
  const records = listLearningRecords(limit);
  const errorTypes = countValues(records.map((record) => record.diagnosis?.errorType).filter(Boolean));
  const concepts = countValues(
    records.flatMap((record) => (record.analysis?.coreConcepts || []).map((concept) => concept.name).filter(Boolean)),
  );
  const modes = countValues(records.map((record) => record.modeLabel || record.mode).filter(Boolean));
  const topics = records.map((record) => record.title).filter(Boolean).slice(0, 5);

  return {
    totalRecords: records.length,
    frequentErrorTypes: topItems(errorTypes, 5),
    weakConcepts: topItems(concepts, 8),
    commonModes: topItems(modes, 5),
    recentTopics: topics,
    nextReviewSuggestion: buildNextReviewSuggestion(errorTypes, concepts),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeRecord(input) {
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
    createdAt,
  };
}

function rowToRecord(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    mode: row.mode,
    modeLabel: row.mode_label,
    mockSource: row.source,
    input: row.input,
    analysis: parseJson(row.analysis_json),
    deepDive: parseJson(row.deep_dive_json),
    userAnswer: row.user_answer,
    diagnosis: parseJson(row.diagnosis_json),
    obsidianMarkdown: row.obsidian_markdown,
    createdAt: row.created_at,
  };
}

function parseJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
