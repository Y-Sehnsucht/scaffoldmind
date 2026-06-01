import { loadJson, removeJson, saveJson } from './localStorage.js';

const QUESTION_HISTORY_KEY = 'scaffoldmind.questionHistory';
const LEARNING_RECORDS_KEY = 'scaffoldmind.learningRecords';

export function loadQuestionHistory() {
  return loadJson(QUESTION_HISTORY_KEY, []);
}

export function saveQuestionHistory(items) {
  saveJson(QUESTION_HISTORY_KEY, items);
}

export function clearQuestionHistory() {
  removeJson(QUESTION_HISTORY_KEY);
}

export function loadLearningRecords() {
  return loadJson(LEARNING_RECORDS_KEY, []);
}

export function saveLearningRecords(records) {
  saveJson(LEARNING_RECORDS_KEY, records);
}

export function clearLearningRecords() {
  removeJson(LEARNING_RECORDS_KEY);
}
