const modeInstructions = {
  context_stacking: `
Mode: Context Stacking.
Return this focus: this week's 5 core concepts, links to last week, classroom validation checklist, gap checklist, and examiner distinction points.
`,
  after_class_review: `
Mode: After-class deep review.
Return this focus: page number, core concepts, essence explanation, context relation, exam points, pitfalls, guided questions, and a user attempt task.
`,
  examiner_perspective: `
Mode: Examiner perspective.
Return this focus: tested points, examiner intent, surface-understanding traps, underlying logic, and transfer questions.
`,
  feynman: `
Mode: Feynman teach-back.
Return this focus: accurate parts in the user's explanation, biggest deviation, why it matters, a 12-year-old explanation, and a checking question.
`,
  multi_source_collision: `
Mode: Multi-source collision.
Return this focus: source A/B/C views, conflicts, evidence strength, adoptable conclusions, and doubts to keep.
`,
};

const jsonContract = `
Return concise JSON only. Do not wrap it in markdown fences.
Use this top-level shape when possible:
{
  "topic": "string",
  "summary": "string",
  "coreConcepts": [{"name":"string","simpleExplanation":"string","essence":"string","relatedConcepts":["string"]}],
  "whyThisMatters": "string",
  "contextRelation": {"previous":"string","current":"string","next":"string"},
  "examFocus": ["string"],
  "engineeringUse": ["string"],
  "pitfalls": ["string"],
  "guidedQuestions": [{"id":"string","type":"exam|engineering|context|bottom_logic","typeLabel":"string","question":"string","reason":"string","pageNumber":12,"concept":"string"}],
  "userTask": {"question":"string","expectedKeyPoints":["string"]},
  "modeSpecific": {"type":"string","title":"string"}
}
`;

export function buildPromptContext(input) {
  return {
    subject: input.subject,
    mode: input.mode,
    preferences: input.preferences || [],
    pageNumber: input.pageNumber,
    materialText: input.materialText || '',
    previousQuestions: input.previousQuestions || [],
  };
}

export function buildAnalyzePrompt(input) {
  const context = buildPromptContext(input);

  return [
    systemPrompt(),
    modeInstructions[context.mode] || modeInstructions.after_class_review,
    jsonContract,
    `Subject: ${context.subject}`,
    `Learning preferences: ${context.preferences.join(', ') || 'none'}`,
    `PPT page number: ${context.pageNumber || 'not provided'}`,
    `Material:\n${context.materialText}`,
  ].join('\n\n');
}

export function buildDeepDivePrompt(input) {
  return [
    systemPrompt(),
    'Answer the selected guided question with concise structured learning feedback.',
    'Return JSON: {"answer":"string","keyPoints":["string"],"followUpQuestions":[{"id":"string","type":"bottom_logic","question":"string"}]}',
    `Subject: ${input.subject}`,
    `Mode: ${input.mode}`,
    `Question: ${input.question?.question || input.question}`,
    `Material:\n${input.materialText || ''}`,
  ].join('\n\n');
}

export function buildDiagnosePrompt(input) {
  return [
    systemPrompt(),
    'Diagnose the user attempt. Quote the user answer and return targeted feedback.',
    'Return JSON: {"errorType":"string","quotedIssue":"string","whatIsCorrect":"string","mainProblem":"string","whyItMatters":"string","suggestion":"string","reinforcementTask":"string"}',
    `Subject: ${input.subject}`,
    `Mode: ${input.mode}`,
    `Question: ${input.question?.question || input.question}`,
    `User attempt:\n${input.userAttempt}`,
  ].join('\n\n');
}

export function buildObsidianPrompt(input) {
  return [
    systemPrompt(),
    'Generate Obsidian Markdown with wikilinks and callouts.',
    'Return JSON: {"obsidianMarkdown":"string"}',
    `Analysis JSON:\n${JSON.stringify(input.analysis || {}, null, 2)}`,
  ].join('\n\n');
}

export function buildCollisionPrompt(input) {
  return [
    systemPrompt(),
    modeInstructions.multi_source_collision,
    'Return JSON: {"sourceSummaries":[{"source":"A","coreView":"string"}],"conflicts":["string"],"evidenceComparison":["string"],"adoptableConclusions":["string"],"openDoubts":["string"],"learningValue":"string"}',
    `Subject: ${input.subject}`,
    `Source A:\n${input.sourceA}`,
    `Source B:\n${input.sourceB}`,
    `Source C:\n${input.sourceC}`,
  ].join('\n\n');
}

function systemPrompt() {
  return [
    'You are ScaffoldMind 明序, an AI learning assistant for CSAPP and Data Structures.',
    'Do not give a generic chat answer. Build a structured learning scaffold.',
    'Preserve the learning loop: explanation, guided questions, user attempt, diagnosis, reinforcement, and Obsidian output.',
  ].join(' ');
}
