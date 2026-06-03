import { AGENT_MEMORY_KEYS } from './agentMemoryStorage.js';
import { HOME_STORAGE_KEYS } from './homeStorage.js';
import { LEARNING_STORAGE_KEYS } from './learningStorageKeys.js';
import { PRACTICE_STORAGE_KEYS } from './practiceStorage.js';

export const SETTINGS_STORAGE_KEYS = {
  theme: AGENT_MEMORY_KEYS.theme,
};

const SENSITIVE_KEY_PATTERNS = [/api.?key/i, /token/i, /secret/i, /password/i];

export function applyTheme(theme) {
  const normalized = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = normalized;
  document.documentElement.classList.toggle('light', normalized === 'light');
  document.documentElement.classList.toggle('dark', normalized === 'dark');
  window.localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, normalized);
  return normalized;
}

export function loadThemeSetting() {
  const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEYS.theme);
  if (saved === 'light' || saved === 'dark') return saved;
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function exportLocalLearningData() {
  const snapshot = {};

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith('scaffoldmind.')) continue;
    if (isSensitiveKey(key)) continue;

    const raw = window.localStorage.getItem(key);
    snapshot[key] = safeParseAndRedact(raw);
  }

  return {
    exportedAt: new Date().toISOString(),
    app: 'ScaffoldMind 明序',
    note: '已移除可能包含 API Key、token 或 secret 的本地配置项。',
    data: snapshot,
  };
}

export function clearLocalHistory() {
  [
    AGENT_MEMORY_KEYS.conversations,
    AGENT_MEMORY_KEYS.feedback,
    AGENT_MEMORY_KEYS.profile,
    AGENT_MEMORY_KEYS.optionStats,
    AGENT_MEMORY_KEYS.repeatedQuestions,
    AGENT_MEMORY_KEYS.interactionEvents,
    LEARNING_STORAGE_KEYS.questionHistory,
    LEARNING_STORAGE_KEYS.learningRecords,
  ].forEach((key) => window.localStorage.removeItem(key));
}

export function clearTaskCountdownPracticeData() {
  [
    HOME_STORAGE_KEYS.tasks,
    HOME_STORAGE_KEYS.countdowns,
    PRACTICE_STORAGE_KEYS.stats,
    PRACTICE_STORAGE_KEYS.mistakes,
    PRACTICE_STORAGE_KEYS.sessions,
  ].forEach((key) => window.localStorage.removeItem(key));
}

function safeParseAndRedact(raw) {
  try {
    return redactValue(JSON.parse(raw || 'null'));
  } catch {
    return raw || '';
  }
}

function redactValue(value) {
  if (Array.isArray(value)) return value.map(redactValue);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !isSensitiveKey(key))
      .map(([key, child]) => [key, redactValue(child)]),
  );
}

function isSensitiveKey(key) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(String(key || '')));
}
