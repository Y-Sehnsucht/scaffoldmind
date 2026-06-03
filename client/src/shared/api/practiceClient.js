import { postJson } from './client.js';

export function generatePracticeQuestion(payload) {
  return postJson('/api/practice/generate', payload);
}

export function evaluatePracticeAnswer(payload) {
  return postJson('/api/practice/evaluate', payload);
}
