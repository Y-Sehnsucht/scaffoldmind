const AI_CONFIG_KEY = 'scaffoldmind.aiConfig.v1';

export const AI_PROVIDERS = [
  {
    id: 'openai',
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    defaultApiUrl: 'https://api.openai.com/v1/chat/completions',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    defaultModel: 'deepseek-v4-pro',
    defaultApiUrl: 'https://api.deepseek.com/chat/completions',
  },
  {
    id: 'glm',
    label: 'GLM',
    defaultModel: 'glm-5.1',
    defaultApiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
  {
    id: 'custom',
    label: '自定义',
    defaultModel: 'gpt-4o-mini',
    defaultApiUrl: 'https://api.openai.com/v1/chat/completions',
  },
];

export function createDefaultAiConfig() {
  const provider = AI_PROVIDERS[1];

  return {
    provider: provider.id,
    providerLabel: provider.label,
    model: provider.defaultModel,
    apiUrl: provider.defaultApiUrl,
    apiKey: '',
    jsonResponseFormat: 'json_object',
  };
}

export function loadAiConfig() {
  if (typeof localStorage === 'undefined') {
    return createDefaultAiConfig();
  }

  try {
    const saved = JSON.parse(localStorage.getItem(AI_CONFIG_KEY) || 'null');
    return normalizeAiConfig(saved || createDefaultAiConfig());
  } catch {
    return createDefaultAiConfig();
  }
}

export function saveAiConfig(config) {
  const normalized = normalizeAiConfig(config);

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function normalizeAiConfig(config) {
  const provider = AI_PROVIDERS.find((item) => item.id === config?.provider) || AI_PROVIDERS[1];

  return {
    provider: provider.id,
    providerLabel: provider.label,
    model: config?.model || provider.defaultModel,
    apiUrl: config?.apiUrl || provider.defaultApiUrl,
    apiKey: config?.apiKey || '',
    jsonResponseFormat: config?.jsonResponseFormat === 'none' ? 'none' : 'json_object',
  };
}

export function getProviderDefaults(providerId) {
  return AI_PROVIDERS.find((item) => item.id === providerId) || AI_PROVIDERS[1];
}
