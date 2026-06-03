import { loadJson, removeJson, saveJson } from './localStorage.js';

export const PRACTICE_STORAGE_KEYS = {
  stats: 'scaffoldmind.practice.stats',
  mistakes: 'scaffoldmind.practice.mistakes',
  sessions: 'scaffoldmind.practice.sessions',
};

const EMPTY_STATS = {
  totalQuestions: 0,
  correctCount: 0,
  totalSeconds: 0,
  byConcept: {},
  updatedAt: '',
};

export function loadPracticeStats() {
  return normalizeStats(loadJson(PRACTICE_STORAGE_KEYS.stats, EMPTY_STATS));
}

export function savePracticeStats(stats) {
  const normalized = normalizeStats(stats);
  saveJson(PRACTICE_STORAGE_KEYS.stats, normalized);
  return normalized;
}

export function recordPracticeAttempt({ question, evaluation, elapsedSeconds }) {
  const stats = loadPracticeStats();
  const concept = question?.knowledgePoint || question?.concept || '未命名知识点';
  const correct = Boolean(evaluation?.correct);
  const previousConcept = stats.byConcept[concept] || { total: 0, correct: 0, seconds: 0 };

  const nextStats = savePracticeStats({
    ...stats,
    totalQuestions: stats.totalQuestions + 1,
    correctCount: stats.correctCount + (correct ? 1 : 0),
    totalSeconds: stats.totalSeconds + Math.max(0, Number(elapsedSeconds || 0)),
    byConcept: {
      ...stats.byConcept,
      [concept]: {
        total: previousConcept.total + 1,
        correct: previousConcept.correct + (correct ? 1 : 0),
        seconds: previousConcept.seconds + Math.max(0, Number(elapsedSeconds || 0)),
      },
    },
    updatedAt: new Date().toISOString(),
  });

  const session = {
    id: `practice_session_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    questionId: question?.id || '',
    knowledgePoint: concept,
    difficulty: question?.difficulty || 'medium',
    correct,
    score: Number(evaluation?.score || 0),
    elapsedSeconds: Math.max(0, Number(elapsedSeconds || 0)),
    createdAt: new Date().toISOString(),
  };
  saveJson(PRACTICE_STORAGE_KEYS.sessions, [session, ...loadPracticeSessions()].slice(0, 100));

  if (!correct) {
    savePracticeMistake({
      question,
      evaluation,
      userAnswer: evaluation?.userAnswer || '',
      elapsedSeconds,
    });
  }

  return nextStats;
}

export function loadPracticeMistakes() {
  return loadJson(PRACTICE_STORAGE_KEYS.mistakes, []);
}

export function savePracticeMistake({ question, evaluation, userAnswer, elapsedSeconds }) {
  const mistake = {
    id: `mistake_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    questionId: question?.id || '',
    question: question?.question || '',
    knowledgePoint: question?.knowledgePoint || '未命名知识点',
    difficulty: question?.difficulty || 'medium',
    expectedKeyPoints: Array.isArray(question?.expectedKeyPoints) ? question.expectedKeyPoints : [],
    userAnswer: String(userAnswer || ''),
    score: Number(evaluation?.score || 0),
    mainIssue: evaluation?.mainIssue || '',
    createdAt: new Date().toISOString(),
    elapsedSeconds: Math.max(0, Number(elapsedSeconds || 0)),
  };
  const next = [mistake, ...loadPracticeMistakes()].slice(0, 100);
  saveJson(PRACTICE_STORAGE_KEYS.mistakes, next);
  return mistake;
}

export function loadPracticeSessions() {
  return loadJson(PRACTICE_STORAGE_KEYS.sessions, []);
}

export function clearPracticeData() {
  removeJson(PRACTICE_STORAGE_KEYS.stats);
  removeJson(PRACTICE_STORAGE_KEYS.mistakes);
  removeJson(PRACTICE_STORAGE_KEYS.sessions);
}

export function getPracticeAccuracy(stats = loadPracticeStats()) {
  if (!stats.totalQuestions) return 0;
  return Math.round((stats.correctCount / stats.totalQuestions) * 100);
}

function normalizeStats(stats = EMPTY_STATS) {
  return {
    totalQuestions: Number(stats?.totalQuestions || 0),
    correctCount: Number(stats?.correctCount || 0),
    totalSeconds: Number(stats?.totalSeconds || 0),
    byConcept: stats?.byConcept && typeof stats.byConcept === 'object' ? stats.byConcept : {},
    updatedAt: stats?.updatedAt || '',
  };
}
