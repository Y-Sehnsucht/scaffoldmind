const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';

export const USE_BACKEND_MOCK = false;

export class ApiResponseError extends Error {
  constructor(message, code = 'REQUEST_ERROR', response = null) {
    super(message);
    this.name = 'ApiResponseError';
    this.code = code;
    this.response = response;
  }
}

export function parseApiResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new ApiResponseError('Invalid API response shape', 'INVALID_RESPONSE', payload);
  }

  if (payload.ok === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  if (payload.ok === false && payload.error) {
    throw new ApiResponseError(payload.error.message || 'Request failed', payload.error.code || 'REQUEST_ERROR', payload);
  }

  throw new ApiResponseError('Invalid API response envelope', 'INVALID_RESPONSE', payload);
}

export function createJsonRequest(path, body) {
  return {
    url: `${API_BASE_URL}${path}`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  };
}

export async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  try {
    return parseApiResponse(data);
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }

    throw new ApiResponseError(data?.error?.message || 'Request failed', data?.error?.code || 'REQUEST_ERROR', data);
  }
}

export function postJson(path, body) {
  const request = createJsonRequest(path, body);
  return requestJson(path, request.options);
}

export function deleteJson(path) {
  return requestJson(path, {
    method: 'DELETE',
  });
}

export async function postFormData(path, formData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return parseApiResponse(data);
}

export const mockBackendApi = {
  aiStatus() {
    return requestJson('/api/ai/status');
  },
  extractMaterial(file) {
    const formData = new FormData();
    formData.append('material', file);
    return postFormData('/api/materials/extract', formData);
  },
  listRecords(limit = 20) {
    return requestJson(`/api/records?limit=${limit}`);
  },
  saveRecord(payload) {
    return postJson('/api/records', payload);
  },
  clearRecords() {
    return deleteJson('/api/records');
  },
  profileSummary() {
    return requestJson('/api/profile/summary');
  },
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
