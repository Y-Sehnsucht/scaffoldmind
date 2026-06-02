import { ApiResponseError, createJsonRequest } from '../../shared/api/client.js';

export async function streamAgentChat(payload, handlers = {}) {
  const request = createJsonRequest('/api/agent/chat/stream', payload);
  let response;

  try {
    response = await fetch(request.url, request.options);
  } catch (error) {
    handlers.onError?.(
      new ApiResponseError('Express 后端不可用，请确认服务已启动。', 'BACKEND_UNAVAILABLE', {
        cause: error?.message || String(error),
      }),
    );
    return;
  }

  if (!response.ok) {
    await handleErrorResponse(response, handlers);
    return;
  }

  const reader = response.body?.getReader();

  if (!reader) {
    handlers.onError?.(new ApiResponseError('浏览器不支持流式读取响应。', 'STREAM_UNAVAILABLE', null));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let completed = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data:')) {
          continue;
        }

        const raw = line.slice(5).trim();

        if (!raw) {
          continue;
        }

        const event = JSON.parse(raw);

        if (event.type === 'status') {
          handlers.onStatus?.(event.message || '');
        } else if (event.type === 'delta') {
          handlers.onDelta?.(event.text || '');
        } else if (event.type === 'done') {
          completed = true;
          handlers.onDone?.();
        }
      }
    }

    if (!completed) {
      handlers.onDone?.();
    }
  } catch (error) {
    handlers.onError?.(
      error instanceof ApiResponseError
        ? error
        : new ApiResponseError('流式响应解析失败，请稍后重试。', 'STREAM_PARSE_ERROR', { cause: error?.message || String(error) }),
    );
  }
}

async function handleErrorResponse(response, handlers) {
  try {
    const payload = await response.json();
    const message = payload?.error?.message || `请求失败：HTTP ${response.status}`;
    const code = payload?.error?.code || 'REQUEST_ERROR';
    handlers.onError?.(new ApiResponseError(message, code, payload));
  } catch {
    handlers.onError?.(new ApiResponseError(`请求失败：HTTP ${response.status}`, 'REQUEST_ERROR', null));
  }
}
