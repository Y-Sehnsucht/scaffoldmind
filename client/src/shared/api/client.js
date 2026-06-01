const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const USE_BACKEND_MOCK = false;

export async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Request failed');
  }

  return data;
}

export function postJson(path, body) {
  return requestJson(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export const mockBackendApi = {
  analyze(payload) {
    return postJson('/api/analyze', payload);
  },
  deepDive(payload) {
    return postJson('/api/deep-dive', payload);
  },
  diagnose(payload) {
    return postJson('/api/diagnose', payload);
  },
  obsidian(payload) {
    return postJson('/api/obsidian', payload);
  },
  collision(payload) {
    return postJson('/api/collision', payload);
  },
};
