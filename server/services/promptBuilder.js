export function buildPromptContext(input) {
  return {
    subject: input.subject,
    mode: input.mode,
    preferences: input.preferences || [],
  };
}
