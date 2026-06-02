export function validateMaterialInput(materialText = '', materialFields = {}) {
  const combined = [materialText, ...Object.values(materialFields)].join('\n').trim();

  if (!combined) {
    return {
      valid: false,
      message: '请先粘贴课程材料，或从左侧上传 TXT、Markdown、PDF、PPTX 文件。',
    };
  }

  return { valid: true, message: '' };
}

export function validateUserAttempt(userAnswer = '') {
  if (!userAnswer.trim()) {
    return {
      valid: false,
      message: '请先写下你的理解，再提交诊断。这样系统才能引用你的原回答并指出具体偏差。',
    };
  }

  return { valid: true, message: '' };
}
