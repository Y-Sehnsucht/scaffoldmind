import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const configDirectory = path.dirname(currentFilePath);

export const serverDirectory = path.resolve(configDirectory, '..');
export const serverEnvPath = path.join(serverDirectory, '.env');

export function buildEnv(source = process.env) {
  const port = Number(source.PORT || 3001);
  const aiProvider = normalizeProvider(source.AI_PROVIDER || source.TEXT_GENERATION_PROVIDER || 'openai');
  const provider = buildProviderConfig(source, aiProvider);

  return {
    port: Number.isFinite(port) && port > 0 ? port : 3001,
    aiProvider,
    aiProviderLabel: provider.label,
    textGenerationApiKey: provider.apiKey,
    hasTextGenerationApiKey: Boolean(provider.apiKey),
    textGenerationApiUrl: provider.apiUrl,
    textGenerationModel: provider.model,
    jsonResponseFormat: normalizeJsonResponseFormat(source.AI_JSON_RESPONSE_FORMAT || source.TEXT_GENERATION_JSON_RESPONSE_FORMAT || 'json_object'),
  };
}

export function loadEnv(envPath = serverEnvPath) {
  dotenv.config({ path: envPath });
  return buildEnv(process.env);
}

export const env = loadEnv();

function normalizeProvider(provider) {
  const normalized = String(provider || '').trim().toLowerCase();

  if (['openai', 'deepseek', 'glm', 'custom'].includes(normalized)) {
    return normalized;
  }

  return 'openai';
}

function buildProviderConfig(source, provider) {
  const legacyKey = source.TEXT_GENERATION_API_KEY || '';
  const legacyUrl = source.TEXT_GENERATION_API_URL || '';
  const legacyModel = source.TEXT_GENERATION_MODEL || '';

  const providerConfigs = {
    openai: {
      label: 'OpenAI',
      apiKey: source.OPENAI_API_KEY || legacyKey,
      apiUrl: source.OPENAI_API_URL || legacyUrl || 'https://api.openai.com/v1/chat/completions',
      model: source.OPENAI_MODEL || legacyModel || 'gpt-4o-mini',
    },
    deepseek: {
      label: 'DeepSeek',
      apiKey: source.DEEPSEEK_API_KEY || legacyKey,
      apiUrl: source.DEEPSEEK_API_URL || legacyUrl || 'https://api.deepseek.com/chat/completions',
      model: source.DEEPSEEK_MODEL || legacyModel || 'deepseek-v4-pro',
    },
    glm: {
      label: 'GLM',
      apiKey: source.GLM_API_KEY || source.ZHIPUAI_API_KEY || source.ZAI_API_KEY || legacyKey,
      apiUrl: source.GLM_API_URL || legacyUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: source.GLM_MODEL || legacyModel || 'glm-5.1',
    },
    custom: {
      label: 'Custom',
      apiKey: source.CUSTOM_API_KEY || legacyKey,
      apiUrl: source.CUSTOM_API_URL || legacyUrl || 'https://api.openai.com/v1/chat/completions',
      model: source.CUSTOM_MODEL || legacyModel || 'gpt-4o-mini',
    },
  };

  return providerConfigs[provider] || providerConfigs.openai;
}

function normalizeJsonResponseFormat(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (['none', 'off', 'false', 'disabled'].includes(normalized)) {
    return 'none';
  }

  return 'json_object';
}
