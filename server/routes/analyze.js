import { Router } from 'express';
import { generateAnalysis, generateTextStream } from '../services/aiService.js';
import { buildAnalyzePrompt } from '../services/promptBuilder.js';
import { buildMockAnalysis } from '../services/mockLearningService.js';
import { validateAiOutput } from '../services/aiSchemas.js';
import { ok, sendValidationError } from '../utils/responses.js';
import { requireCommonLearningFields, requireFields } from '../utils/validation.js';

export const analyzeRouter = Router();

analyzeRouter.post('/', async (req, res, next) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['materialText'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  try {
    const data = await generateAnalysis(req.body);
    return res.json(ok(data));
  } catch (error) {
    return next(error);
  }
});

analyzeRouter.post('/stream', async (req, res, next) => {
  const missing = [...requireCommonLearningFields(req.body), ...requireFields(req.body, ['materialText'])];

  if (missing.length > 0) {
    return sendValidationError(res, `Missing required field(s): ${missing.join(', ')}`);
  }

  const aiConfig = req.body.aiConfig || {};
  const prompt = buildAnalyzePrompt(req.body);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const runtimeConfig = buildRuntimeConfigPublic(aiConfig);

  if (!runtimeConfig.hasApiKey) {
    const fallbackData = buildMockAnalysis(req.body);
    const fallback = {
      ...fallbackData,
      providerStatus: 'fallback',
      provider: runtimeConfig.provider,
      providerLabel: runtimeConfig.providerLabel,
      model: runtimeConfig.model,
      fallbackReason: `${runtimeConfig.provider}_missing_api_key`,
      validationErrors: [],
    };
    res.write(`data: ${JSON.stringify({ type: 'fallback', data: fallback })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    res.write(`data: ${JSON.stringify({ type: 'status', message: `正在调用 ${runtimeConfig.providerLabel} / ${runtimeConfig.model}...` })}\n\n`);

    const { stream, error } = await generateTextStream(prompt, aiConfig);

    if (error || !stream) {
      const fallbackData = buildMockAnalysis(req.body);
      const fallback = {
        ...fallbackData,
        providerStatus: 'fallback',
        provider: runtimeConfig.provider,
        providerLabel: runtimeConfig.providerLabel,
        model: runtimeConfig.model,
        fallbackReason: error?.code || 'AI_CALL_FAILED',
        validationErrors: [],
      };
      res.write(`data: ${JSON.stringify({ type: 'fallback', data: fallback })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let fullText = '';

    for await (const chunk of stream) {
      const lines = chunk.toString().split('\n').filter((line) => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6).trim();

        if (data === '[DONE]') {
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || '';

          if (delta) {
            fullText += delta;
            res.write(`data: ${JSON.stringify({ type: 'delta', text: delta })}\n\n`);
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }

    // Try to parse the full text as structured JSON
    const parsedResult = parseJsonOrTextPublic(fullText);
    const isRawText = parsedResult && typeof parsedResult === 'object' && Object.keys(parsedResult).length === 1 && typeof parsedResult.rawText === 'string';

    if (isRawText) {
      const fallbackData = buildMockAnalysis(req.body);
      const fallback = {
        ...fallbackData,
        providerStatus: 'fallback',
        provider: runtimeConfig.provider,
        providerLabel: runtimeConfig.providerLabel,
        model: runtimeConfig.model,
        fallbackReason: 'AI_RESPONSE_INVALID',
        validationErrors: ['Provider response must be structured JSON.'],
      };
      res.write(`data: ${JSON.stringify({ type: 'fallback', data: fallback })}\n\n`);
    } else {
      const normalized = normalizeAnalysisPublic(parsedResult, req.body);
      const validation = validateAiOutput('analysis', normalized);
      const providerStatus = validation.valid ? 'real_api' : 'fallback';

      if (validation.valid) {
        res.write(`data: ${JSON.stringify({ type: 'result', data: { ...normalized, providerStatus: 'real_api', provider: runtimeConfig.provider, providerLabel: runtimeConfig.providerLabel, model: runtimeConfig.model, fallbackReason: null } })}\n\n`);
      } else {
        const fallbackData = buildMockAnalysis(req.body);
        res.write(`data: ${JSON.stringify({ type: 'fallback', data: { ...fallbackData, providerStatus: 'fallback', provider: runtimeConfig.provider, providerLabel: runtimeConfig.providerLabel, model: runtimeConfig.model, fallbackReason: 'AI_RESPONSE_INVALID', validationErrors: validation.errors } })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    return res.end();
  } catch (error) {
    const fallbackData = buildMockAnalysis(req.body);
    const fallback = {
      ...fallbackData,
      providerStatus: 'fallback',
      provider: runtimeConfig.provider,
      providerLabel: runtimeConfig.providerLabel,
      model: runtimeConfig.model,
      fallbackReason: 'AI_CALL_FAILED',
      validationErrors: [],
    };
    res.write(`data: ${JSON.stringify({ type: 'fallback', data: fallback })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }
});

function buildRuntimeConfigPublic(aiConfig = {}) {
  const provider = String(aiConfig.provider || 'openai').trim().toLowerCase();
  const providerDefaults = {
    openai: { label: 'OpenAI', model: 'gpt-4o-mini', apiUrl: 'https://api.openai.com/v1/chat/completions' },
    deepseek: { label: 'DeepSeek', model: 'deepseek-v4-pro', apiUrl: 'https://api.deepseek.com/chat/completions' },
    glm: { label: 'GLM', model: 'glm-5.1', apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions' },
    custom: { label: '自定义', model: 'gpt-4o-mini', apiUrl: 'https://api.openai.com/v1/chat/completions' },
  };
  const defaults = providerDefaults[provider] || providerDefaults.openai;

  return {
    provider,
    providerLabel: aiConfig.providerLabel || defaults.label,
    model: aiConfig.model || defaults.model,
    apiUrl: aiConfig.apiUrl || defaults.apiUrl,
    apiKey: aiConfig.apiKey || '',
    hasApiKey: Boolean(aiConfig.apiKey),
  };
}

function parseJsonOrTextPublic(text) {
  const trimmed = String(text || '').trim();
  const withoutFence = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const firstBrace = withoutFence.indexOf('{');
    const lastBrace = withoutFence.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
      } catch {
        // Fall through
      }
    }

    return { rawText: withoutFence };
  }
}

function normalizeAnalysisPublic(value, input) {
  const normalized = value && typeof value === 'object' ? value : {};

  return {
    pageNumber: Number(normalized.pageNumber || input.pageNumber || 1),
    mode: input.mode || 'after_class_review',
    topic: normalized.topic || extractTopicFallbackPublic(input.materialText),
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

function extractTopicFallbackPublic(materialText) {
  const text = String(materialText || '').trim();
  if (!text) return '未命名主题';
  const firstLine = text.split(/[\n\r]+/).find((l) => l.trim().length > 0) || text;
  const cleaned = firstLine.trim().replace(/^#+\s*/, '');
  return cleaned.length > 30 ? cleaned.slice(0, 30) + '…' : cleaned;
}
