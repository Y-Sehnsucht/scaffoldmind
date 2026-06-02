const fallbackReasonLabels = {
  AI_RESPONSE_INVALID: '服务商返回内容不是可用的结构化 JSON',
  AI_CALL_FAILED: '服务商调用失败',
  AI_PROVIDER_ERROR: '服务商返回错误状态',
  AI_EMPTY_RESPONSE: '服务商返回空内容',
};

export function getProviderSourceMeta(result, sourceLabel = 'AI 平台') {
  if (result?.providerStatus === 'real_api') {
    return {
      label: `真实 AI · ${result.providerLabel || result.provider || 'Provider'} / ${result.model || 'model'}`,
      className: 'bg-emerald-100 text-emerald-800',
    };
  }

  if (result?.providerStatus === 'fallback') {
    return {
      label: `结构化 fallback · ${result.providerLabel || result.provider || 'Provider'}`,
      className: 'bg-amber-100 text-amber-900',
    };
  }

  return {
    label: sourceLabel,
    className: 'bg-slate-100 text-slate-700',
  };
}

export function formatFallbackDetails(result) {
  if (result?.providerStatus !== 'fallback') {
    return [];
  }

  return [formatFallbackReason(result.fallbackReason), ...(result.validationErrors || [])].filter(Boolean);
}

export function formatFallbackReason(reason = '') {
  if (!reason) {
    return '';
  }

  if (reason.endsWith('_missing_api_key')) {
    return '没有配置当前 provider 的 API Key，已自动使用结构化降级结果';
  }

  return fallbackReasonLabels[reason] || reason;
}
