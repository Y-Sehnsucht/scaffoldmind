import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { validateAiOutput } from '../services/aiSchemas.js';

const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: 'CSAPP',
      mode: 'after_class_review',
      preferences: ['framework_first'],
      pageNumber: 1,
      materialText: 'Cache memory uses locality to improve performance.',
      previousQuestions: [],
      aiSource: 'real_api',
    }),
  });

  const body = await response.json();
  const data = body?.data || {};
  const textForLength = data.rawText || data.summary || data.answer || data.topic || '';
  const validation = validateAiOutput('analysis', data);

  console.log(
    JSON.stringify(
      {
        hasTextGenerationApiKey: env.hasTextGenerationApiKey,
        hasTextGenerationApiUrl: Boolean(env.textGenerationApiUrl),
        hasTextGenerationModel: Boolean(env.textGenerationModel),
        providerStatus: data.providerStatus || 'unknown',
        fallbackReason: data.fallbackReason || null,
        httpStatus: response.status,
        contentLength: data.providerStatus === 'real_api' ? String(textForLength).length : null,
        schemaValid: validation.valid,
        validationErrors: validation.errors,
        structuredFields: {
          hasTopic: Boolean(data.topic),
          hasSummary: Boolean(data.summary),
          hasCoreConcepts: Array.isArray(data.coreConcepts),
          hasGuidedQuestions: Array.isArray(data.guidedQuestions),
          hasUserTask: Boolean(data.userTask),
        },
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.log(
    JSON.stringify(
      {
        hasTextGenerationApiKey: env.hasTextGenerationApiKey,
        hasTextGenerationApiUrl: Boolean(env.textGenerationApiUrl),
        hasTextGenerationModel: Boolean(env.textGenerationModel),
        providerStatus: 'verification_failed',
        fallbackReason: error?.code || error?.name || 'VERIFY_REAL_PROVIDER_FAILED',
        httpStatus: null,
        contentLength: null,
      },
      null,
      2,
    ),
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
