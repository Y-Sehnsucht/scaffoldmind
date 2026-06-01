export function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body?.[field];
    return value === undefined || value === null || value === '';
  });

  return missing;
}

export function requireCommonLearningFields(body) {
  return requireFields(body, ['subject', 'mode']);
}
