import { loadJson, saveJson } from './localStorage.js';

export const HOME_STORAGE_KEYS = {
  events: 'scaffoldmind.home.events',
  tasks: 'scaffoldmind.home.tasks',
  countdowns: 'scaffoldmind.home.countdowns',
  studyTime: 'scaffoldmind.home.studyTime',
  checkins: 'scaffoldmind.home.checkins',
};

export function loadHomeEvents() {
  return loadJson(HOME_STORAGE_KEYS.events, []);
}

export function saveHomeEvents(events) {
  saveJson(HOME_STORAGE_KEYS.events, Array.isArray(events) ? events : []);
}

export function loadHomeTasks() {
  return loadJson(HOME_STORAGE_KEYS.tasks, []);
}

export function saveHomeTasks(tasks) {
  saveJson(HOME_STORAGE_KEYS.tasks, Array.isArray(tasks) ? tasks : []);
}

export function loadCountdowns() {
  return normalizeCountdowns(loadJson(HOME_STORAGE_KEYS.countdowns, []));
}

export function saveCountdowns(countdowns) {
  saveJson(HOME_STORAGE_KEYS.countdowns, normalizeCountdowns(countdowns));
}

export function loadStudyTime() {
  return loadJson(HOME_STORAGE_KEYS.studyTime, {});
}

export function addStudySeconds(dateKey, seconds) {
  const current = loadStudyTime();
  const next = {
    ...current,
    [dateKey]: Number(current[dateKey] || 0) + Math.max(0, Number(seconds || 0)),
  };
  saveJson(HOME_STORAGE_KEYS.studyTime, next);
  return next;
}

export function loadCheckins() {
  return loadJson(HOME_STORAGE_KEYS.checkins, []);
}

export function markCheckin(dateKey) {
  const current = loadCheckins();
  const next = Array.from(new Set([...current, dateKey])).sort();
  saveJson(HOME_STORAGE_KEYS.checkins, next);
  return next;
}

export function createHomeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function toDateKey(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function calculateStreak(checkins, todayKey = toDateKey()) {
  const checked = new Set(checkins || []);
  let streak = 0;
  const cursor = new Date(`${todayKey}T12:00:00`);

  while (checked.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function daysUntil(dateKey) {
  const today = new Date(`${toDateKey()}T00:00:00`);
  const target = new Date(`${dateKey}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function urgencyForDays(days) {
  if (days <= 7) return 'high';
  if (days <= 30) return 'medium';
  return 'low';
}

function normalizeCountdowns(countdowns) {
  return Array.isArray(countdowns) ? countdowns.map((item) => ({ ...item, completed: Boolean(item.completed) })) : [];
}
