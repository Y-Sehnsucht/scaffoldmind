import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

const stringArray = {
  type: 'array',
  items: { type: 'string' },
};

const coreConcept = {
  type: 'object',
  required: ['name', 'simpleExplanation', 'essence', 'relatedConcepts'],
  properties: {
    name: { type: 'string', minLength: 1 },
    simpleExplanation: { type: 'string', minLength: 1 },
    essence: { type: 'string', minLength: 1 },
    relatedConcepts: stringArray,
  },
  additionalProperties: true,
};

const guidedQuestion = {
  type: 'object',
  required: ['id', 'type', 'question', 'reason'],
  properties: {
    id: { type: 'string', minLength: 1 },
    type: { type: 'string', minLength: 1 },
    typeLabel: { type: 'string' },
    question: { type: 'string', minLength: 1 },
    reason: { type: 'string', minLength: 1 },
    pageNumber: { type: 'number' },
    concept: { type: 'string' },
  },
  additionalProperties: true,
};

const followUpQuestion = {
  type: 'object',
  required: ['id', 'type', 'question'],
  properties: {
    id: { type: 'string', minLength: 1 },
    type: { type: 'string', minLength: 1 },
    question: { type: 'string', minLength: 1 },
  },
  additionalProperties: true,
};

export const aiSchemas = {
  analysis: {
    type: 'object',
    required: [
      'topic',
      'summary',
      'coreConcepts',
    ],
    properties: {
      pageNumber: { type: 'number' },
      topic: { type: 'string', minLength: 1 },
      summary: { type: 'string', minLength: 1 },
      coreConcepts: {
        type: 'array',
        minItems: 1,
        items: coreConcept,
      },
      whyThisMatters: { type: 'string' },
      contextRelation: {
        type: 'object',
        properties: {
          previous: { type: 'string' },
          current: { type: 'string' },
          next: { type: 'string' },
        },
        additionalProperties: true,
      },
      examFocus: stringArray,
      engineeringUse: stringArray,
      pitfalls: stringArray,
      guidedQuestions: {
        type: 'array',
        items: guidedQuestion,
      },
      userTask: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          expectedKeyPoints: stringArray,
        },
        additionalProperties: true,
      },
      modeSpecific: {
        type: 'object',
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
  deepDive: {
    type: 'object',
    required: ['answer', 'keyPoints', 'followUpQuestions'],
    properties: {
      questionId: { type: 'string' },
      answer: { type: 'string', minLength: 1 },
      keyPoints: stringArray,
      followUpQuestions: {
        type: 'array',
        items: followUpQuestion,
      },
      historyItem: {
        type: 'object',
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
  diagnosis: {
    type: 'object',
    required: [
      'errorType',
      'quotedIssue',
      'whatIsCorrect',
      'mainProblem',
      'whyItMatters',
      'suggestion',
      'reinforcementTask',
    ],
    properties: {
      errorType: { type: 'string', minLength: 1 },
      quotedIssue: { type: 'string' },
      whatIsCorrect: { type: 'string', minLength: 1 },
      mainProblem: { type: 'string', minLength: 1 },
      whyItMatters: { type: 'string', minLength: 1 },
      suggestion: { type: 'string', minLength: 1 },
      reinforcementTask: { type: 'string', minLength: 1 },
    },
    additionalProperties: true,
  },
  obsidian: {
    type: 'object',
    required: ['obsidianMarkdown'],
    properties: {
      obsidianMarkdown: { type: 'string', minLength: 1 },
    },
    additionalProperties: true,
  },
  collision: {
    type: 'object',
    required: ['sourceSummaries', 'conflicts', 'evidenceComparison', 'adoptableConclusions', 'openDoubts', 'learningValue'],
    properties: {
      sourceSummaries: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['source', 'coreView'],
          properties: {
            source: { type: 'string', minLength: 1 },
            coreView: { type: 'string', minLength: 1 },
          },
          additionalProperties: true,
        },
      },
      conflicts: stringArray,
      evidenceComparison: stringArray,
      adoptableConclusions: stringArray,
      openDoubts: stringArray,
      learningValue: { type: 'string', minLength: 1 },
    },
    additionalProperties: true,
  },
};

const validators = Object.fromEntries(Object.entries(aiSchemas).map(([name, schema]) => [name, ajv.compile(schema)]));

export function validateAiOutput(schemaName, value) {
  const validate = validators[schemaName];

  if (!validate) {
    return { valid: true, errors: [] };
  }

  const valid = validate(value);
  return {
    valid,
    errors: valid ? [] : formatErrors(validate.errors || []),
  };
}

function formatErrors(errors) {
  return errors.map((error) => `${error.instancePath || '/'} ${error.message}`).slice(0, 5);
}
