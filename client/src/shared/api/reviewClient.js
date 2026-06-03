import { postJson } from './client.js';

export function requestReviewPlan(payload) {
  return postJson('/api/review/plan', payload);
}
