import { generateText } from './aiService.js';
import { buildPracticeEvaluatePrompt, buildPracticeGeneratePrompt } from './promptBuilder.js';

export async function generatePracticeQuestion(input = {}) {
  const fallback = buildMockPracticeQuestion(input);

  try {
    const result = await generateText(buildPracticeGeneratePrompt(input));
    if (!result.ok) return markFallback(fallback, result.code || 'AI_PROVIDER_UNAVAILABLE');

    const parsed = parseProviderJson(result.text);
    return markProvider(normalizeQuestion(parsed, input, fallback));
  } catch {
    return markFallback(fallback, 'AI_CALL_FAILED');
  }
}

export async function evaluatePracticeAnswer(input = {}) {
  const fallback = buildMockPracticeEvaluation(input);

  try {
    const result = await generateText(buildPracticeEvaluatePrompt(input));
    if (!result.ok) return markFallback(fallback, result.code || 'AI_PROVIDER_UNAVAILABLE');

    const parsed = parseProviderJson(result.text);
    return markProvider(normalizeEvaluation(parsed, input, fallback));
  } catch {
    return markFallback(fallback, 'AI_CALL_FAILED');
  }
}

function buildMockPracticeQuestion(input) {
  const concept = String(input.concept || '补码溢出').trim();
  const difficulty = input.difficulty || 'medium';

  return {
    id: `practice_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    question: `请解释「${concept}」为什么是 CSAPP 或数据结构常考点，并指出一个最容易误判的边界条件。`,
    answerType: 'short_answer',
    choices: [],
    knowledgePoint: concept,
    difficulty,
    expectedKeyPoints: ['概念定义', '边界条件', '常见误区', '修正判断'],
    hint: '先说本质，再说误判，再给出正确判断。',
  };
}

function buildMockPracticeEvaluation(input) {
  const userAnswer = String(input.userAnswer || '');
  const expected = Array.isArray(input.expectedKeyPoints) && input.expectedKeyPoints.length
    ? input.expectedKeyPoints
    : ['概念定义', '边界条件', '常见误区', '修正判断'];
  const hitPoints = expected.filter((point) => userAnswer.includes(String(point).slice(0, 2)));
  const correct = hitPoints.length >= Math.max(2, Math.ceil(expected.length / 2));

  return {
    correct,
    score: correct ? 82 : 56,
    feedback: correct
      ? '你的回答覆盖了主要结构，建议再补一个具体反例来稳定边界判断。'
      : `你的回答中提到「${userAnswer.slice(0, 28)}」，但没有完整区分定义、边界条件和常见误区。`,
    mainIssue: correct ? '例子不够具体' : '概念边界没有说清',
    correctKeyPoints: hitPoints.length ? hitPoints : ['能主动作答'],
    missedKeyPoints: expected.filter((point) => !hitPoints.includes(point)),
    nextAction: correct ? 'next_concept' : 'same_concept',
  };
}

function normalizeQuestion(value, input, fallback) {
  const normalized = value && typeof value === 'object' ? value : {};
  return {
    id: normalized.id || fallback.id,
    question: normalized.question || fallback.question,
    answerType: normalized.answerType || 'short_answer',
    choices: Array.isArray(normalized.choices) ? normalized.choices : [],
    knowledgePoint: normalized.knowledgePoint || input.concept || fallback.knowledgePoint,
    difficulty: normalized.difficulty || input.difficulty || 'medium',
    expectedKeyPoints: Array.isArray(normalized.expectedKeyPoints) && normalized.expectedKeyPoints.length
      ? normalized.expectedKeyPoints
      : fallback.expectedKeyPoints,
    hint: normalized.hint || fallback.hint,
  };
}

function normalizeEvaluation(value, input, fallback) {
  const normalized = value && typeof value === 'object' ? value : {};
  return {
    correct: typeof normalized.correct === 'boolean' ? normalized.correct : fallback.correct,
    score: Number.isFinite(Number(normalized.score)) ? Number(normalized.score) : fallback.score,
    feedback: normalized.feedback || fallback.feedback,
    mainIssue: normalized.mainIssue || fallback.mainIssue,
    correctKeyPoints: Array.isArray(normalized.correctKeyPoints) ? normalized.correctKeyPoints : fallback.correctKeyPoints,
    missedKeyPoints: Array.isArray(normalized.missedKeyPoints) ? normalized.missedKeyPoints : fallback.missedKeyPoints,
    nextAction: normalized.nextAction || fallback.nextAction,
  };
}

function parseProviderJson(text) {
  const trimmed = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? trimmed.slice(firstBrace, lastBrace + 1) : trimmed;
  return JSON.parse(jsonText);
}

function markFallback(data, reason) {
  return {
    ...data,
    providerStatus: 'fallback',
    fallbackReason: reason,
  };
}

function markProvider(data) {
  return {
    ...data,
    providerStatus: 'real_api',
    fallbackReason: null,
  };
}
