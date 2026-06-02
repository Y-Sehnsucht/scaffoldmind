import { env } from '../config/env.js';
import { validateAiOutput } from './aiSchemas.js';
import {
  buildAnalyzePrompt,
  buildCollisionPrompt,
  buildDeepDivePrompt,
  buildDiagnosePrompt,
  buildObsidianPrompt,
} from './promptBuilder.js';
import {
  buildMockAnalysis,
  buildMockCollision,
  buildMockDeepDive,
  buildMockDiagnosis,
  buildMockObsidian,
} from './mockLearningService.js';

export async function generateAnalysis(input) {
  return generateWithFallback({
    prompt: buildAnalyzePrompt(input),
    fallback: () => buildMockAnalysis(input),
    normalize: (value) => normalizeAnalysis(value, input),
    schemaName: 'analysis',
    fallbackReason: 'missing_api_key',
    aiConfig: input.aiConfig,
  });
}

export async function generateDeepDive(input) {
  return generateWithFallback({
    prompt: buildDeepDivePrompt(input),
    fallback: () => buildMockDeepDive(input),
    normalize: (value) => normalizeDeepDive(value, input),
    schemaName: 'deepDive',
    fallbackReason: 'missing_api_key',
    aiConfig: input.aiConfig,
  });
}

export async function generateDiagnosis(input) {
  return generateWithFallback({
    prompt: buildDiagnosePrompt(input),
    fallback: () => buildMockDiagnosis(input),
    normalize: (value) => normalizeDiagnosis(value, input),
    schemaName: 'diagnosis',
    fallbackReason: 'missing_api_key',
    aiConfig: input.aiConfig,
  });
}

export async function generateObsidian(input) {
  return generateWithFallback({
    prompt: buildObsidianPrompt(input),
    fallback: () => buildMockObsidian(input),
    normalize: (value) => normalizeObsidian(value, input),
    schemaName: 'obsidian',
    fallbackReason: 'missing_api_key',
    aiConfig: input.aiConfig,
  });
}

export async function generateCollision(input) {
  return generateWithFallback({
    prompt: buildCollisionPrompt(input),
    fallback: () => buildMockCollision(input),
    normalize: (value) => normalizeCollision(value, input),
    schemaName: 'collision',
    fallbackReason: 'missing_api_key',
    aiConfig: input.aiConfig,
  });
}

export async function generateText(prompt, aiConfig) {
  const runtimeConfig = buildRuntimeConfig(aiConfig);

  if (!runtimeConfig.hasApiKey) {
    return {
      ok: false,
      code: `${runtimeConfig.provider.toUpperCase()}_API_KEY_MISSING`,
      text: '',
    };
  }

  const messages = buildMessages(prompt);

  const requestPayload = {
    model: runtimeConfig.model,
    messages,
    temperature: 0.2,
    ...buildResponseFormat(runtimeConfig),
  };

  const response = await fetch(runtimeConfig.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${runtimeConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    return {
      ok: false,
      code: 'AI_PROVIDER_ERROR',
      text: '',
    };
  }

  const providerPayload = await response.json();
  const text = providerPayload?.choices?.[0]?.message?.content || providerPayload?.output_text || providerPayload?.text || '';

  if (!text) {
    return {
      ok: false,
      code: 'AI_EMPTY_RESPONSE',
      text: '',
    };
  }

  return {
    ok: true,
    code: null,
    text,
  };
}

export async function generateTextStream(prompt, aiConfig) {
  const runtimeConfig = buildRuntimeConfig(aiConfig);

  if (!runtimeConfig.hasApiKey) {
    return { stream: null, error: { ok: false, code: `${runtimeConfig.provider.toUpperCase()}_API_KEY_MISSING` } };
  }

  const messages = buildMessages(prompt);

  const requestPayload = {
    model: runtimeConfig.model,
    messages,
    temperature: 0.2,
    stream: true,
  };

  const response = await fetch(runtimeConfig.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${runtimeConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    return { stream: null, error: { ok: false, code: 'AI_PROVIDER_ERROR' } };
  }

  return { stream: response.body, error: null };
}

export async function runAiPreflight(aiConfig) {
  const runtimeStatus = getAiRuntimeStatus(aiConfig);
  const runtimeConfig = buildRuntimeConfig(aiConfig);

  if (!runtimeConfig.hasApiKey) {
    return {
      ...runtimeStatus,
      ready: false,
      providerStatus: 'missing_api_key',
      fallbackReason: `${runtimeConfig.provider}_missing_api_key`,
      validationErrors: [],
      checkedAt: new Date().toISOString(),
      message: `${runtimeConfig.providerLabel} API Key 未配置，请在 AI 配置区填写并保存后再重试。`,
    };
  }

  const result = await generateAnalysis({
    subject: 'CSAPP',
    mode: 'after_class_review',
    preferences: ['framework_first'],
    pageNumber: 1,
    materialText: '缓存未命中（cache miss）表示请求的数据不在缓存中；局部性（locality）影响缓存命中率。',
    aiConfig,
  });
  const ready = result.providerStatus === 'real_api';

  return {
    ...runtimeStatus,
    ready,
    providerStatus: result.providerStatus || 'unknown',
    fallbackReason: result.fallbackReason || null,
    validationErrors: result.validationErrors || [],
    checkedAt: new Date().toISOString(),
    message: ready ? '真实 AI 调用成功，结构化 JSON 已通过校验。' : buildPreflightFailureMessage(result),
  };
}

async function generateWithFallback({ prompt, fallback, normalize, schemaName, fallbackReason, aiConfig }) {
  const runtimeConfig = buildRuntimeConfig(aiConfig);

  if (!runtimeConfig.hasApiKey) {
    return markFallback(fallback(), `${runtimeConfig.provider}_${fallbackReason}`, [], runtimeConfig);
  }

  try {
    const result = await generateText(prompt, aiConfig);

    if (!result.ok) {
      return markFallback(fallback(), result.code, [], runtimeConfig);
    }

    const parsed = parseJsonOrText(result.text);

    if (isRawTextOnly(parsed)) {
      return markFallback(fallback(), 'AI_RESPONSE_INVALID', ['Provider response must be structured JSON.'], runtimeConfig);
    }

    const normalized = normalize(parsed);
    const validation = validateAiOutput(schemaName, normalized);

    if (!validation.valid) {
      return markFallback(fallback(), 'AI_RESPONSE_INVALID', validation.errors, runtimeConfig);
    }

    return markReal(normalized, runtimeConfig);
  } catch {
    return markFallback(fallback(), 'AI_CALL_FAILED', [], runtimeConfig);
  }
}

function buildPreflightFailureMessage(result) {
  if (result.fallbackReason === 'AI_RESPONSE_INVALID') {
    return '真实 AI 已返回内容，但没有通过结构化 JSON 校验。请检查模型、prompt 或 JSON response_format 配置。';
  }

  if (result.fallbackReason === 'AI_PROVIDER_ERROR') {
    return '真实 AI provider 返回错误。请检查 API URL、模型名、额度或 key 权限。';
  }

  if (result.fallbackReason === 'AI_EMPTY_RESPONSE') {
    return '真实 AI provider 返回空内容。请检查模型兼容性。';
  }

  if (result.fallbackReason === 'AI_CALL_FAILED') {
    return '真实 AI 调用失败。请检查网络、代理、API URL 或 provider 服务状态。';
  }

  return '真实 AI 自检未通过，系统已回退到结构化演示数据。';
}

/**
 * Build messages array from prompt.
 * Supports both:
 * - String prompt (legacy): [{ role: 'user', content: prompt }]
 * - Object prompt (new): { systemPrompt, userPrompt } → [{ role: 'system', ... }, { role: 'user', ... }]
 */
function buildMessages(prompt) {
  if (typeof prompt === 'string') {
    return [{ role: 'user', content: prompt }];
  }

  if (prompt && typeof prompt === 'object') {
    const messages = [];
    if (prompt.systemPrompt) {
      messages.push({ role: 'system', content: prompt.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt.userPrompt || '' });
    return messages;
  }

  return [{ role: 'user', content: String(prompt || '') }];
}

function buildResponseFormat(runtimeConfig) {
  if (runtimeConfig.jsonResponseFormat === 'none') {
    return {};
  }

  return {
    response_format: {
      type: runtimeConfig.jsonResponseFormat,
    },
  };
}

function parseJsonOrText(text) {
  const trimmed = String(text || '').trim();
  const withoutFence = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const jsonText = extractJsonObject(withoutFence);

    if (jsonText) {
      try {
        return JSON.parse(jsonText);
      } catch {
        // Fall through to raw text fallback.
      }
    }

    return { rawText: withoutFence };
  }
}

function extractJsonObject(text) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return '';
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function isRawTextOnly(value) {
  return value && typeof value === 'object' && Object.keys(value).length === 1 && typeof value.rawText === 'string';
}

function normalizeObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function normalizeAnalysis(value, input) {
  const normalized = normalizeObject(value);

  return {
    pageNumber: Number(normalized.pageNumber || input.pageNumber || 1),
    mode: input.mode || 'after_class_review',
    topic: normalized.topic || extractTopicFallback(input.materialText),
    summary: normalized.summary || '',
    coreConcepts: Array.isArray(normalized.coreConcepts) && normalized.coreConcepts.length > 0
      ? normalized.coreConcepts
      : [],
    whyThisMatters: normalized.whyThisMatters || '',
    contextRelation: normalized.contextRelation || { previous: '', current: '', next: '' },
    examFocus: Array.isArray(normalized.examFocus) ? normalized.examFocus : [],
    engineeringUse: Array.isArray(normalized.engineeringUse) ? normalized.engineeringUse : [],
    pitfalls: Array.isArray(normalized.pitfalls) ? normalized.pitfalls : [],
    guidedQuestions: Array.isArray(normalized.guidedQuestions) ? normalized.guidedQuestions : [],
    userTask: normalized.userTask || { question: '', expectedKeyPoints: [] },
    pageText: input.materialText || '',
    modeSpecific: normalized.modeSpecific || { type: input.mode || 'after_class_review', title: '结构化输出' },
  };
}

/**
 * Minimal topic fallback — only used when AI returns no topic at all.
 */
function extractTopicFallback(materialText) {
  const text = String(materialText || '').trim();
  if (!text) return '未命名主题';
  const firstLine = text.split(/[\n\r]+/).find((l) => l.trim().length > 0) || text;
  const cleaned = firstLine.trim().replace(/^#+\s*/, '');
  return cleaned.length > 30 ? cleaned.slice(0, 30) + '…' : cleaned;
}

function normalizeDeepDive(value, input) {
  const normalized = normalizeObject(value);
  const question = input.question || {};

  return {
    questionId: normalized.questionId || question.id || `dd_${Date.now()}`,
    answer: normalized.answer || normalized.rawText || '',
    keyPoints: Array.isArray(normalized.keyPoints) ? normalized.keyPoints : [],
    followUpQuestions: Array.isArray(normalized.followUpQuestions) ? normalized.followUpQuestions : [],
    historyItem: normalized.historyItem || {
      id: `qh_${Date.now()}`,
      question: question.question || '',
      pageNumber: input.pageNumber || 1,
      concept: question.concept || '',
      status: 'answered',
    },
  };
}

function normalizeDiagnosis(value, input) {
  const normalized = normalizeObject(value);

  return {
    errorType: normalized.errorType || '理解不完整',
    quotedIssue: normalized.quotedIssue || input.userAttempt || '',
    whatIsCorrect: normalized.whatIsCorrect || '',
    mainProblem: normalized.mainProblem || '',
    whyItMatters: normalized.whyItMatters || '',
    suggestion: normalized.suggestion || '',
    reinforcementTask: normalized.reinforcementTask || '',
  };
}

function normalizeObsidian(value, input) {
  const normalized = normalizeObject(value);

  return {
    obsidianMarkdown: normalized.obsidianMarkdown || normalized.rawText || '',
  };
}

function normalizeCollision(value, input) {
  const normalized = normalizeObject(value);

  return {
    sourceSummaries: Array.isArray(normalized.sourceSummaries) ? normalized.sourceSummaries : [],
    conflicts: Array.isArray(normalized.conflicts) ? normalized.conflicts : [],
    evidenceComparison: Array.isArray(normalized.evidenceComparison) ? normalized.evidenceComparison : [],
    adoptableConclusions: Array.isArray(normalized.adoptableConclusions) ? normalized.adoptableConclusions : [],
    openDoubts: Array.isArray(normalized.openDoubts) ? normalized.openDoubts : [],
    learningValue: normalized.learningValue || '',
  };
}

function markFallback(data, reason, validationErrors = [], runtimeConfig = buildRuntimeConfig()) {
  return {
    ...data,
    providerStatus: 'fallback',
    provider: runtimeConfig.provider,
    providerLabel: runtimeConfig.providerLabel,
    model: runtimeConfig.model,
    fallbackReason: reason,
    validationErrors,
  };
}

function markReal(data, runtimeConfig = buildRuntimeConfig()) {
  return {
    ...data,
    providerStatus: 'real_api',
    provider: runtimeConfig.provider,
    providerLabel: runtimeConfig.providerLabel,
    model: runtimeConfig.model,
    fallbackReason: null,
  };
}

export function getAiRuntimeStatus(aiConfig) {
  const runtimeConfig = buildRuntimeConfig(aiConfig);

  return {
    provider: runtimeConfig.provider,
    providerLabel: runtimeConfig.providerLabel,
    model: runtimeConfig.model,
    hasApiKey: runtimeConfig.hasApiKey,
    apiMode: 'openai_compatible_chat_completions',
    jsonResponseFormat: runtimeConfig.jsonResponseFormat,
  };
}

function buildRuntimeConfig(aiConfig = {}) {
  const provider = normalizeProvider(aiConfig.provider || env.aiProvider);
  const defaults = providerDefaults(provider);

  return {
    provider,
    providerLabel: defaults.label,
    apiKey: aiConfig.apiKey || env.textGenerationApiKey || '',
    hasApiKey: Boolean(aiConfig.apiKey || env.textGenerationApiKey),
    apiUrl: aiConfig.apiUrl || env.textGenerationApiUrl || defaults.apiUrl,
    model: aiConfig.model || env.textGenerationModel || defaults.model,
    jsonResponseFormat: normalizeJsonResponseFormat(aiConfig.jsonResponseFormat || env.jsonResponseFormat),
  };
}

function normalizeProvider(provider) {
  const normalized = String(provider || '').trim().toLowerCase();
  return ['openai', 'deepseek', 'glm', 'custom'].includes(normalized) ? normalized : 'openai';
}

function normalizeJsonResponseFormat(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['none', 'off', 'false', 'disabled'].includes(normalized) ? 'none' : 'json_object';
}

function providerDefaults(provider) {
  const providers = {
    openai: {
      label: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
    },
    deepseek: {
      label: 'DeepSeek',
      apiUrl: 'https://api.deepseek.com/chat/completions',
      model: 'deepseek-v4-pro',
    },
    glm: {
      label: 'GLM',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-5.1',
    },
    custom: {
      label: 'Custom',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
    },
  };

  return providers[provider] || providers.openai;
}
