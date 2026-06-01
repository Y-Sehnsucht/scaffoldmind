import { env } from '../config/env.js';
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
    fallbackReason: 'missing_api_key',
  });
}

export async function generateDeepDive(input) {
  return generateWithFallback({
    prompt: buildDeepDivePrompt(input),
    fallback: () => buildMockDeepDive(input),
    normalize: normalizeObject,
    fallbackReason: 'missing_api_key',
  });
}

export async function generateDiagnosis(input) {
  return generateWithFallback({
    prompt: buildDiagnosePrompt(input),
    fallback: () => buildMockDiagnosis(input),
    normalize: normalizeObject,
    fallbackReason: 'missing_api_key',
  });
}

export async function generateObsidian(input) {
  return generateWithFallback({
    prompt: buildObsidianPrompt(input),
    fallback: () => buildMockObsidian(input),
    normalize: normalizeObject,
    fallbackReason: 'missing_api_key',
  });
}

export async function generateCollision(input) {
  return generateWithFallback({
    prompt: buildCollisionPrompt(input),
    fallback: () => buildMockCollision(input),
    normalize: normalizeObject,
    fallbackReason: 'missing_api_key',
  });
}

export async function generateText(prompt) {
  if (!env.hasTextGenerationApiKey) {
    return {
      ok: false,
      code: 'AI_API_KEY_MISSING',
      text: '',
    };
  }

  const response = await fetch(env.textGenerationApiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.textGenerationApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.textGenerationModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      code: 'AI_PROVIDER_ERROR',
      text: '',
    };
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content || payload?.output_text || payload?.text || '';

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

async function generateWithFallback({ prompt, fallback, normalize, fallbackReason }) {
  if (!env.hasTextGenerationApiKey) {
    return markFallback(fallback(), fallbackReason);
  }

  try {
    const result = await generateText(prompt);

    if (!result.ok) {
      return markFallback(fallback(), result.code);
    }

    return markReal(normalize(parseJsonOrText(result.text)));
  } catch {
    return markFallback(fallback(), 'AI_CALL_FAILED');
  }
}

function parseJsonOrText(text) {
  const trimmed = String(text || '').trim();
  const withoutFence = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    return {
      summary: withoutFence,
      answer: withoutFence,
      rawText: withoutFence,
    };
  }
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

function markFallback(data, reason) {
  return {
    ...data,
    providerStatus: 'fallback',
    fallbackReason: reason,
  };
}

function markReal(data) {
  return {
    ...data,
    providerStatus: 'real_api',
    fallbackReason: null,
  };
}
