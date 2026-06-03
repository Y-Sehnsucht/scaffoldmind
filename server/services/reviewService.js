import { generateText } from './aiService.js';
import { buildReviewPlanPrompt } from './promptBuilder.js';

export async function generateReviewPlan(input = {}) {
  const fallback = buildMockReviewPlan(input);

  try {
    const result = await generateText(buildReviewPlanPrompt(input));
    if (!result.ok) return markFallback(fallback, result.code || 'AI_PROVIDER_UNAVAILABLE');

    const parsed = parseProviderJson(result.text);
    return markProvider(normalizeReviewPlan(parsed, fallback));
  } catch {
    return markFallback(fallback, 'AI_CALL_FAILED');
  }
}

function buildMockReviewPlan(input) {
  const weakConcepts = Array.isArray(input.weakConcepts) && input.weakConcepts.length
    ? input.weakConcepts
    : inferWeakConcepts(input);
  const priorityConcepts = Array.from(new Set(weakConcepts)).slice(0, 5);

  return {
    priorityConcepts,
    reviewPlan: priorityConcepts.map((concept, index) => ({
      id: `review_${Date.now()}_${index}`,
      title: concept,
      reason: index === 0 ? '来自最近错题或负反馈，应优先复盘。' : '来自历史对话、画像或练习统计中的高频概念。',
      suggestedAction: 'chat',
      estimatedMinutes: index === 0 ? 20 : 15,
    })),
    recommendedPractice: priorityConcepts.slice(0, 3).map((concept) => ({
      knowledgePoint: concept,
      reason: '用一题简答题检查概念边界和易错点。',
    })),
    nextActions: ['先复习最高优先级概念', '进入强化练习做同知识点题目', '回到对话页用自己的话复述'],
  };
}

function inferWeakConcepts(input) {
  const profileHints = input.learnerProfile?.weakConceptHints || [];
  const fromProfile = profileHints.map((item) => item.label).filter(Boolean);
  const fromPractice = Object.entries(input.practiceStats?.byConcept || {})
    .filter(([, stats]) => Number(stats.correct || 0) < Number(stats.total || 0))
    .map(([concept]) => concept);
  return [...fromProfile, ...fromPractice, '缓存未命中（cache miss）', '补码溢出', '栈帧（stack frame）'];
}

function normalizeReviewPlan(value, fallback) {
  const normalized = value && typeof value === 'object' ? value : {};
  return {
    priorityConcepts: Array.isArray(normalized.priorityConcepts) && normalized.priorityConcepts.length
      ? normalized.priorityConcepts
      : fallback.priorityConcepts,
    reviewPlan: Array.isArray(normalized.reviewPlan) && normalized.reviewPlan.length
      ? normalized.reviewPlan.map((item, index) => ({
        id: item.id || `review_item_${index}`,
        title: item.title || fallback.reviewPlan[index]?.title || '复习概念',
        reason: item.reason || fallback.reviewPlan[index]?.reason || '来自本地学习记录。',
        suggestedAction: item.suggestedAction || 'chat',
        estimatedMinutes: Number(item.estimatedMinutes || 15),
      }))
      : fallback.reviewPlan,
    recommendedPractice: Array.isArray(normalized.recommendedPractice) ? normalized.recommendedPractice : fallback.recommendedPractice,
    nextActions: Array.isArray(normalized.nextActions) ? normalized.nextActions : fallback.nextActions,
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
