const contextLabels = {
  backend: '后端请求',
  real_api: '真实 AI 请求',
  material: '材料提取',
  ppt: 'PPTX 解析',
};

const codeMessages = {
  BACKEND_UNAVAILABLE: 'Express 后端暂时不可用。请先启动后端服务，再重新执行当前操作；页面已保留你的输入。',
  VALIDATION_ERROR: '请求内容缺少必要字段。请检查材料、学习模式或用户回答是否完整。',
  INVALID_RESPONSE: '后端响应结构不符合统一 ok/data/error 格式。',
  INVALID_JSON_RESPONSE: '后端返回了不可解析的响应。请检查接口是否正常运行。',
  REQUEST_ERROR: '请求失败。请稍后重试，页面已保留当前输入。',
  PPT_PARSE_ERROR: 'PPTX 文件解析失败。请确认文件未损坏，且不是旧版 .ppt。',
  MATERIAL_FILE_MISSING: '没有收到材料文件。请重新选择 TXT、Markdown、PDF 或 PPTX 文件。',
  UNSUPPORTED_MATERIAL_TYPE: '当前只支持 TXT、Markdown、PDF 文本材料和 PPTX 轻量解析。',
  UNSUPPORTED_FILE_TYPE: '当前只支持 .pptx，旧版 .ppt、图片 OCR 和视觉结构解析需要后续专门服务。',
};

export function formatRecoverableError(error, context = 'backend') {
  const label = contextLabels[context] || contextLabels.backend;
  const code = error?.code || '';
  const message = codeMessages[code] || error?.message || '请检查后端开发服务是否正在运行。页面已保留你的输入。';

  if (context === 'real_api') {
    return `真实 AI 请求失败：${message}`;
  }

  return `${label}失败：${message}`;
}
