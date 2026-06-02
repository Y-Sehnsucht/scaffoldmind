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
  });
}

export async function generateDeepDive(input) {
  return generateWithFallback({
    prompt: buildDeepDivePrompt(input),
    fallback: () => buildMockDeepDive(input),
    normalize: (value) => normalizeDeepDive(value, input),
    schemaName: 'deepDive',
    fallbackReason: 'missing_api_key',
  });
}

export async function generateDiagnosis(input) {
  return generateWithFallback({
    prompt: buildDiagnosePrompt(input),
    fallback: () => buildMockDiagnosis(input),
    normalize: (value) => normalizeDiagnosis(value, input),
    schemaName: 'diagnosis',
    fallbackReason: 'missing_api_key',
  });
}

export async function generateObsidian(input) {
  return generateWithFallback({
    prompt: buildObsidianPrompt(input),
    fallback: () => buildMockObsidian(input),
    normalize: (value) => normalizeObsidian(value, input),
    schemaName: 'obsidian',
    fallbackReason: 'missing_api_key',
  });
}

export async function generateCollision(input) {
  return generateWithFallback({
    prompt: buildCollisionPrompt(input),
    fallback: () => buildMockCollision(input),
    normalize: (value) => normalizeCollision(value, input),
    schemaName: 'collision',
    fallbackReason: 'missing_api_key',
  });
}

export async function generateText(prompt) {
  if (!env.hasTextGenerationApiKey) {
    return {
      ok: false,
      code: `${env.aiProvider.toUpperCase()}_API_KEY_MISSING`,
      text: '',
    };
  }

  const requestPayload = {
    model: env.textGenerationModel,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.2,
    ...buildResponseFormat(),
  };

  const response = await fetch(env.textGenerationApiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.textGenerationApiKey}`,
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

async function generateWithFallback({ prompt, fallback, normalize, schemaName, fallbackReason }) {
  if (!env.hasTextGenerationApiKey) {
    return markFallback(fallback(), `${env.aiProvider}_${fallbackReason}`);
  }

  try {
    const result = await generateText(prompt);

    if (!result.ok) {
      return markFallback(fallback(), result.code);
    }

    const parsed = parseJsonOrText(result.text);

    if (isRawTextOnly(parsed)) {
      return markFallback(fallback(), 'AI_RESPONSE_INVALID', ['Provider response must be structured JSON.']);
    }

    const normalized = normalize(parsed);
    const validation = validateAiOutput(schemaName, normalized);

    if (!validation.valid) {
      return markFallback(fallback(), 'AI_RESPONSE_INVALID', validation.errors);
    }

    return markReal(normalized);
  } catch {
    return markFallback(fallback(), 'AI_CALL_FAILED');
  }
}

function buildResponseFormat() {
  if (env.jsonResponseFormat === 'none') {
    return {};
  }

  return {
    response_format: {
      type: env.jsonResponseFormat,
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
  const base = buildMockAnalysis(input);
  const normalized = normalizeObject(value);

  return {
    ...base,
    ...normalized,
    pageNumber: Number(normalized.pageNumber || base.pageNumber || input.pageNumber || 1),
    coreConcepts: Array.isArray(normalized.coreConcepts) ? normalized.coreConcepts : base.coreConcepts,
    guidedQuestions: Array.isArray(normalized.guidedQuestions) ? normalized.guidedQuestions : base.guidedQuestions,
    examFocus: Array.isArray(normalized.examFocus) ? normalized.examFocus : base.examFocus,
    engineeringUse: Array.isArray(normalized.engineeringUse) ? normalized.engineeringUse : base.engineeringUse,
    pitfalls: Array.isArray(normalized.pitfalls) ? normalized.pitfalls : base.pitfalls,
    contextRelation: normalized.contextRelation || base.contextRelation,
    userTask: normalized.userTask || base.userTask,
    modeSpecific: normalized.modeSpecific || base.modeSpecific,
  };
}

function normalizeDeepDive(value, input) {
  const base = buildMockDeepDive(input);
  const normalized = normalizeObject(value);

  return {
    ...base,
    ...normalized,
    answer: normalized.answer || normalized.rawText || base.answer,
    keyPoints: Array.isArray(normalized.keyPoints) ? normalized.keyPoints : base.keyPoints,
    followUpQuestions: Array.isArray(normalized.followUpQuestions) ? normalized.followUpQuestions : base.followUpQuestions,
    historyItem: normalized.historyItem || base.historyItem,
  };
}

function normalizeDiagnosis(value, input) {
  const base = buildMockDiagnosis(input);
  const normalized = normalizeObject(value);

  return {
    ...base,
    ...normalized,
    quotedIssue: normalized.quotedIssue || input.userAttempt || base.quotedIssue,
  };
}

function normalizeObsidian(value, input) {
  const base = buildMockObsidian(input);
  const normalized = normalizeObject(value);

  return {
    ...base,
    ...normalized,
    obsidianMarkdown: normalized.obsidianMarkdown || normalized.rawText || base.obsidianMarkdown,
  };
}

function normalizeCollision(value, input) {
  const base = buildMockCollision(input);
  const normalized = normalizeObject(value);

  return {
    ...base,
    ...normalized,
    sourceSummaries: Array.isArray(normalized.sourceSummaries) ? normalized.sourceSummaries : base.sourceSummaries,
    conflicts: Array.isArray(normalized.conflicts) ? normalized.conflicts : base.conflicts,
    evidenceComparison: Array.isArray(normalized.evidenceComparison)
      ? normalized.evidenceComparison
      : base.evidenceComparison,
    adoptableConclusions: Array.isArray(normalized.adoptableConclusions)
      ? normalized.adoptableConclusions
      : base.adoptableConclusions,
    openDoubts: Array.isArray(normalized.openDoubts) ? normalized.openDoubts : base.openDoubts,
    learningValue: normalized.learningValue || base.learningValue,
  };
}

function markFallback(data, reason, validationErrors = []) {
  return {
    ...data,
    providerStatus: 'fallback',
    provider: env.aiProvider,
    providerLabel: env.aiProviderLabel,
    model: env.textGenerationModel,
    fallbackReason: reason,
    validationErrors,
  };
}

function markReal(data) {
  return {
    ...data,
    providerStatus: 'real_api',
    provider: env.aiProvider,
    providerLabel: env.aiProviderLabel,
    model: env.textGenerationModel,
    fallbackReason: null,
  };
}

export function getAiRuntimeStatus() {
  return {
    provider: env.aiProvider,
    providerLabel: env.aiProviderLabel,
    model: env.textGenerationModel,
    hasApiKey: env.hasTextGenerationApiKey,
    apiMode: 'openai_compatible_chat_completions',
    jsonResponseFormat: env.jsonResponseFormat,
  };
}
